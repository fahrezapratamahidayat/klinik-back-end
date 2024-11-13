import { PrismaClient, PaymentStatus, PaymentType } from "@prisma/client";
import { Request, Response } from "express";
import { generatePaymentNumber } from "../../utils/generate";

const prisma = new PrismaClient();

// Mengambil data pembayaran berdasarkan ID pendaftaran pasien
export const getPaymentByRegistrationId = async (
  req: Request,
  res: Response
) => {
  try {
    const { registrationId } = req.params;

    // Ambil data encounter dengan relasi yang diperlukan
    const encounter = await prisma.encounter.findUnique({
      where: {
        patientRegistrationId: registrationId,
      },
      include: {
        patientRegistration: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                medicalRecordNumber: true,
              },
            },
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
              },
            },
            room: {
              include: {
                Tindakan: true, // Include tarif tindakan dari ruangan
              },
            },
            PaymentMethod: true,
          },
        },
        prescriptions: {
          include: {
            medicine: true, // Include harga obat
          },
        },
        procedure: {
          include: {
            icd9: true,
          },
        },
        Payment: {
          include: {
            PaymentDetail: true,
            paymentMethod: true,
          },
        },
      },
    });

    if (!encounter) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Data kunjungan tidak ditemukan",
      });
    }

    // Hitung total biaya obat
    const medicineCost = encounter.prescriptions.reduce(
      (total, prescription) => {
        return total + prescription.medicine.price * prescription.quantity;
      },
      0
    );

    // Hitung total biaya tindakan
    const procedureCost = encounter.procedure.reduce((total, proc) => {
      const tindakan = encounter.patientRegistration.room.Tindakan.find(
        (t) => t.icdCode === proc.icd9.code
      );
      return total + (tindakan?.finalTarif || 0);
    }, 0);

    // Biaya konsultasi (ambil dari tarif dasar ruangan)
    const consultationCost =
      encounter.patientRegistration.room.Tindakan.find(
        (t) => t.type === "PEMERIKSAAN"
      )?.finalTarif || 0;

    // Buat detail pembayaran
    const paymentDetails = [
      // Detail obat-obatan
      ...encounter.prescriptions.map((prescription) => ({
        itemId: prescription.id,
        itemType: "medicine" as PaymentType,
        quantity: prescription.quantity,
        price: prescription.medicine.price,
        subtotal: prescription.quantity * prescription.medicine.price,
        notes: `Obat: ${prescription.medicine.name}`,
      })),
      // Detail tindakan
      ...encounter.procedure.map((proc) => {
        const tindakan = encounter.patientRegistration.room.Tindakan.find(
          (t) => t.icdCode === proc.icd9.code
        );
        return {
          itemId: proc.id,
          itemType: "procedure" as PaymentType,
          quantity: 1,
          price: tindakan?.finalTarif || 0,
          subtotal: tindakan?.finalTarif || 0,
          notes: `Tindakan: ${proc.icd9.name}`,
        };
      }),
      // Biaya konsultasi
      {
        itemId: encounter.patientRegistration.doctorId,
        itemType: "consultation" as PaymentType,
        quantity: 1,
        price: consultationCost,
        subtotal: consultationCost,
        notes: `Konsultasi Dokter ${encounter.patientRegistration.doctor.name}`,
      },
    ];

    // Total keseluruhan
    const totalAmount = medicineCost + procedureCost + consultationCost;

    // Cek apakah sudah ada payment
    const existingPayment = encounter.Payment[0];

    const paymentData = existingPayment || {
      paymentMethodId: encounter.patientRegistration.paymentMethodId,
      totalAmount,
      paymentStatus: "pending" as PaymentStatus,
      details: paymentDetails,
    };

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Berhasil mengambil data pembayaran",
      data: {
        payment: paymentData,
        summary: {
          medicineCost,
          procedureCost,
          consultationCost,
          totalAmount,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat mengambil data pembayaran",
      error: error.message,
    });
  }
};

// Membuat pembayaran baru
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { encounterId } = req.body;

    // Ambil data encounter untuk memastikan belum ada pembayaran
    const encounter = await prisma.encounter.findUnique({
      where: { id: encounterId },
      include: {
        Payment: true,
        patientRegistration: true,
      },
    });

    if (!encounter) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Data kunjungan tidak ditemukan",
      });
    }

    if (encounter.Payment.length > 0) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Pembayaran untuk kunjungan ini sudah dibuat",
      });
    }

    // Gunakan getPaymentByRegistrationId untuk mendapatkan detail pembayaran
    const paymentDetails = (await getPaymentByRegistrationId(
      {
          params: { registrationId: encounter.patientRegistrationId },
      } as unknown as Request,
      {} as Response
    )) as any;

    // Buat pembayaran baru
    const payment = await prisma.payment.create({
      data: {
        paymentNumber: await generatePaymentNumber(),
        encounterId,
        paymentMethodId: encounter.patientRegistration.paymentMethodId,
        totalAmount: paymentDetails.data.summary.totalAmount,
        PaymentDetail: {
          createMany: {
            data: paymentDetails.data.payment.details,
          },
        },
      },
      include: {
        PaymentDetail: true,
        paymentMethod: true,
      },
    });

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Berhasil membuat pembayaran",
      data: payment,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat membuat pembayaran",
      error: error.message,
    });
  }
};

// Konfirmasi pembayaran
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paidBy } = req.body;

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        paymentStatus: PaymentStatus.paid,
        paidAt: new Date(),
        paidBy,
      },
      include: {
        PaymentDetail: true,
        paymentMethod: true,
      },
    });

    // Update status pendaftaran menjadi selesai
    await prisma.patientRegistration.update({
      where: { id: payment.encounterId },
      data: {
        status: "selesai",
      },
    });

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Pembayaran berhasil dikonfirmasi",
      data: payment,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat mengkonfirmasi pembayaran",
      error: error.message,
    });
  }
};

// Mendapatkan laporan pendapatan harian
export const getDailyIncome = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();

    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const dailyIncome = await prisma.payment.findMany({
      where: {
        paymentStatus: PaymentStatus.paid,
        paidAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        PaymentDetail: true,
        paymentMethod: true,
      },
    });

    const totalIncome = dailyIncome.reduce(
      (sum, payment) => sum + payment.totalAmount,
      0
    );

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Berhasil mengambil data pendapatan harian",
      data: {
        date: startOfDay,
        totalIncome,
        payments: dailyIncome,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat mengambil data pendapatan harian",
      error: error.message,
    });
  }
};

// Mendapatkan laporan pendapatan bulanan
export const getMonthlyIncome = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    const targetDate = new Date(
      parseInt(year as string),
      parseInt(month as string) - 1
    );

    const startOfMonth = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const monthlyIncome = await prisma.payment.findMany({
      where: {
        paymentStatus: PaymentStatus.paid,
        paidAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        PaymentDetail: true,
        paymentMethod: true,
      },
    });

    const totalIncome = monthlyIncome.reduce(
      (sum, payment) => sum + payment.totalAmount,
      0
    );

    // Mengelompokkan pendapatan berdasarkan tanggal
    const dailyBreakdown = monthlyIncome.reduce((acc: any, payment) => {
      const date = payment.paidAt?.toISOString().split("T")[0];
      if (date) {
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += payment.totalAmount;
      }
      return acc;
    }, {});

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Berhasil mengambil data pendapatan bulanan",
      data: {
        month: targetDate.getMonth() + 1,
        year: targetDate.getFullYear(),
        totalIncome,
        dailyBreakdown,
        payments: monthlyIncome,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat mengambil data pendapatan bulanan",
      error: error.message,
    });
  }
};

// Mendapatkan laporan pendapatan tahunan
export const getYearlyIncome = async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    const targetYear = parseInt(year as string) || new Date().getFullYear();

    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    const yearlyIncome = await prisma.payment.findMany({
      where: {
        paymentStatus: PaymentStatus.paid,
        paidAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      include: {
        PaymentDetail: true,
        paymentMethod: true,
      },
    });

    const totalIncome = yearlyIncome.reduce(
      (sum, payment) => sum + payment.totalAmount,
      0
    );

    // Mengelompokkan pendapatan berdasarkan bulan
    const monthlyBreakdown = yearlyIncome.reduce((acc: any, payment) => {
      const month = payment.paidAt?.getMonth();
      if (month !== undefined) {
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += payment.totalAmount;
      }
      return acc;
    }, {});

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Berhasil mengambil data pendapatan tahunan",
      data: {
        year: targetYear,
        totalIncome,
        monthlyBreakdown,
        payments: yearlyIncome,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat mengambil data pendapatan tahunan",
      error: error.message,
    });
  }
};
