import { PrismaClient, PaymentStatus, PaymentType } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { generatePaymentNumber } from "../../utils/generate";
import { createMidtransClient } from "../../config/midtrans";
import { createPaymentSchema } from "../../validations/payment-validation";

const prisma = new PrismaClient();

export const getPaymentByRegistrationId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { registrationId } = req.params;

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
                consultationFee: true,
              },
            },
            room: {
              include: {
                Tindakan: true,
                serviceClass: true,
              },
            },
          },
        },
        prescriptions: {
          include: {
            medicine: true,
          },
        },
        procedure: {
          include: {
            icd9: true,
          },
        },
        payment: {
          include: {
            paymentDetail: true,
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

    // Biaya konsultasi dokter
    const consultationCost =
      encounter.patientRegistration.doctor.consultationFee || 0;

    // const kelas pelayanan ruangan
    const servicesClass = encounter.patientRegistration.room.serviceClass.price;

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
      // Biaya kelas pelayanan ruangan
      {
        itemId: encounter.patientRegistration.roomId,
        itemType: "serviceClass" as PaymentType,
        quantity: 1,
        price: servicesClass,
        subtotal: servicesClass,
        notes: `Kelas Pelayanan ${encounter.patientRegistration.room.name} - ${encounter.patientRegistration.room.serviceClass.name}`,
      },
    ];

    // Total keseluruhan
    const totalAmount =
      medicineCost + procedureCost + consultationCost + servicesClass;

    const paymentData = {
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
          servicesClass,
          totalAmount,
        },
        patientInfo: {
          id: encounter.patientRegistration.patient.id,
          name: encounter.patientRegistration.patient.name,
          medicalRecordNumber:
            encounter.patientRegistration.patient.medicalRecordNumber,
        },
        doctorInfo: {
          id: encounter.patientRegistration.doctor.id,
          name: encounter.patientRegistration.doctor.name,
          specialization: encounter.patientRegistration.doctor.specialization,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const createPaymentWithMidtrans = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validasi Data
    const validatedData = createPaymentSchema.parse(req.body);
    const { patientRegistrationId, first_name, last_name, email, phone } =
      validatedData;
    const snap = createMidtransClient();

    const encounter = await prisma.encounter.findUnique({
      where: {
        patientRegistrationId,
      },
      include: {
        payment: true,
        patientRegistration: {
          include: {
            patient: {
              include: {
                telecom: true,
              },
            },
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
                consultationFee: true,
              },
            },
            room: {
              include: {
                Tindakan: true,
                serviceClass: true,
              },
            },
          },
        },
        prescriptions: {
          include: {
            medicine: true,
          },
        },
        procedure: {
          include: {
            icd9: true,
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

    // Jika sudah ada pembayaran, gunakan pembayaran yang ada
    if (encounter.payment) {
      // Jika pembayaran masih pending, kembalikan data pembayaran yang ada
      if (encounter.payment.paymentStatus === "pending") {
        return res.status(200).json({
          status: true,
          statusCode: 200,
          message: "Pembayaran sudah dibuat sebelumnya",
          data: {
            payment: encounter.payment,
            midtrans: {
              token: encounter.payment.midtransToken,
              redirect_url: encounter.payment.paymentUrl,
            },
          },
        });
      }

      // Jika pembayaran sudah selesai, kembalikan error
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Pembayaran untuk kunjungan ini sudah selesai",
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

    // Biaya konsultasi dokter
    const consultationCost =
      encounter.patientRegistration.doctor.consultationFee || 0;

    // Biaya kelas pelayanan ruangan
    const servicesClass = encounter.patientRegistration.room.serviceClass.price;

    // Total keseluruhan
    const totalAmount =
      medicineCost + procedureCost + consultationCost + servicesClass;

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
      // Biaya kelas pelayanan ruangan
      {
        itemId: encounter.patientRegistration.roomId,
        itemType: "serviceClass" as PaymentType,
        quantity: 1,
        price: servicesClass,
        subtotal: servicesClass,
        notes: `Kelas Pelayanan ${encounter.patientRegistration.room.name} - ${encounter.patientRegistration.room.serviceClass.name}`,
      },
    ];

    console.log(paymentDetails);

    // Buat order ID unik
    const orderId = `ORDER-${Date.now()}`;

    // Parameter untuk Midtrans
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(totalAmount),
      },
      customer_details: {
        first_name,
        last_name,
        email,
        phone,
      },
      item_details: paymentDetails.map((item) => {
        let shortName = "";
        switch (item.itemType) {
          case "medicine":
            shortName = `Obat: ${item.notes.split(': ')[1].substring(0, 20)}`;
            break;
          case 'procedure':
            shortName = `Tindakan: ${item.notes.split(': ')[1].substring(0, 20)}`;
            break;
          case 'consultation':
            shortName = `Konsul: ${item.notes.split('Dokter ')[1].substring(0, 20)}`;
            break;
          case 'serviceClass':
            shortName = `Ruangan ${item.notes.split('Ruangan - ')[1].substring(0, 20)}`;
            break;
          default:
            shortName = item.notes.substring(0, 20);
        }
    
        return {
          id: item.itemId,
          price: Math.round(item.price),
          quantity: item.quantity,
          name: shortName,
        };
      }),
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/kasir/transaction?registration_id=${patientRegistrationId}`,
        error: `${process.env.FRONTEND_URL}/kasir/transaction?registration_id=${patientRegistrationId}`,
        pending: `${process.env.FRONTEND_URL}/kasir/transaction?registration_id=${patientRegistrationId}`,
      },
      enable_payments: [
        "credit_card",
        "bca_va",
        "bni_va",
        "bri_va",
        "mandiri_va",
        "permata_va",
        "gopay",
        "shopeepay",
      ],
      credit_card: {
        secure: true,
        save_card: false,
      },
    };

    // Buat transaksi di Midtrans
    const transaction = await snap.createTransaction(parameter);

    // Simpan data pembayaran
    const payment = await prisma.payment.create({
      data: {
        paymentNumber: await generatePaymentNumber(),
        encounterId: encounter.id,
        firstName: first_name,
        lastName: last_name,
        email,
        phone,
        totalAmount,
        midtransOrderId: orderId,
        midtransToken: transaction.token,
        paymentUrl: transaction.redirect_url,
        paymentStatus: "pending",
        paymentDetail: {
          createMany: {
            data: paymentDetails,
          },
        },
      },
      include: {
        paymentDetail: true,
        encounter: {
          include: {
            patientRegistration: {
              include: {
                patient: true,
                doctor: true,
                room: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Berhasil membuat pembayaran",
      data: {
        payment,
        midtrans: {
          token: transaction.token,
          redirect_url: transaction.redirect_url,
        },
        summary: {
          medicineCost,
          procedureCost,
          consultationCost,
          servicesClass,
          totalAmount,
        },
      },
    });
  } catch (error: any) {
    console.log(error);
    next(error);
  }
};

export const handleMidtransNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const snap = createMidtransClient();

    const statusResponse = await snap.transaction.notification(req.body);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let paymentStatus: PaymentStatus = "pending";

    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        paymentStatus = "challenge";
      } else if (fraudStatus == "accept") {
        paymentStatus = "paid";
      }
    } else if (transactionStatus == "settlement") {
      paymentStatus = "paid";
    } else if (transactionStatus == "deny") {
      paymentStatus = "deny";
    } else if (transactionStatus == "cancel" || transactionStatus == "expire") {
      paymentStatus = "expire";
    } else if (transactionStatus == "pending") {
      paymentStatus = "pending";
    }

    // Update status pembayaran
    await prisma.payment.update({
      where: { midtransOrderId: orderId },
      data: {
        paymentStatus,
        paidAt: paymentStatus === "paid" ? new Date() : null,
      },
    });

    res.status(200).json({ status: true });
  } catch (error: any) {
    next(error);
  }
};

export const updatePaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { order_id, transaction_status, registration_id } = req.query;

    if (!order_id) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Order ID tidak ditemukan",
      });
    }

    const payment = await prisma.payment.findFirst({
      where: { midtransOrderId: order_id as string },
    });

    if (!payment) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Payment tidak ditemukan",
      });
    }

    let paymentStatus: PaymentStatus = "pending";

    switch (transaction_status) {
      case "capture":
      case "settlement":
        paymentStatus = "paid";
        break;
      case "deny":
        paymentStatus = "deny";
        break;
      case "cancel":
      case "expire":
        paymentStatus = "expire";
        break;
      case "pending":
        paymentStatus = "pending";
        break;
      default:
        paymentStatus = "pending";
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentStatus,
        paidAt: paymentStatus === "paid" ? new Date() : null,
      },
      include: {
        paymentDetail: true,
      },
    });

    const updatedPatientRegistration = await prisma.patientRegistration.update({
      where: { id: registration_id as string },
      data: {
        status: "selesai",
      },
    });

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Status pembayaran berhasil diperbarui",
      data: updatedPayment,
    });
  } catch (error) {
    next(error);
  }
};

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validasi Data
    const validatedData = createPaymentSchema.parse(req.body);
    const { patientRegistrationId, first_name, last_name, email, phone } =
      validatedData;

    const encounter = await prisma.encounter.findUnique({
      where: { patientRegistrationId },
      include: {
        payment: true,
        prescriptions: {
          include: {
            medicine: true,
          },
        },
        procedure: {
          include: {
            icd9: true,
          },
        },
        patientRegistration: {
          include: {
            doctor: true,
            room: {
              include: {
                Tindakan: true,
                serviceClass: true,
              },
            },
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

    if (encounter.payment) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Pembayaran untuk kunjungan ini sudah dibuat",
      });
    }

    // Hitung biaya-biaya
    const medicineCost = encounter.prescriptions.reduce(
      (total, prescription) =>
        total + prescription.medicine.price * prescription.quantity,
      0
    );

    const procedureCost = encounter.procedure.reduce((total, proc) => {
      const tindakan = encounter.patientRegistration.room.Tindakan.find(
        (t) => t.icdCode === proc.icd9.code
      );
      return total + (tindakan?.finalTarif || 0);
    }, 0);

    const consultationCost =
      encounter.patientRegistration.doctor.consultationFee || 0;
    const servicesClass = encounter.patientRegistration.room.serviceClass.price;

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
      // Biaya kelas pelayanan ruangan
      {
        itemId: encounter.patientRegistration.roomId,
        itemType: "serviceClass" as PaymentType,
        quantity: 1,
        price: servicesClass,
        subtotal: servicesClass,
        notes: `Kelas Pelayanan ${encounter.patientRegistration.room.name} - ${encounter.patientRegistration.room.serviceClass.name}`,
      },
    ];

    const totalAmount =
      medicineCost + procedureCost + consultationCost + servicesClass;

    // Buat pembayaran baru
    const payment = await prisma.payment.create({
      data: {
        paymentNumber: await generatePaymentNumber(),
        encounterId: encounter.id,
        firstName: first_name,
        lastName: last_name,
        email,
        phone,
        totalAmount,
        paymentDetail: {
          createMany: {
            data: paymentDetails,
          },
        },
      },
      include: {
        paymentDetail: true,
      },
    });

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Berhasil membuat pembayaran",
      data: payment,
    });
  } catch (error: any) {
    next(error);
  }
};

export const confirmPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { paidBy, registrationId } = req.body;

    const results = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id },
        data: {
          paymentStatus: PaymentStatus.paid,
          paidAt: new Date(),
          paidBy: paidBy || "Kasir",
        },
        include: {
          paymentDetail: true,
        },
      });
      await tx.patientRegistration.update({
        where: { id: registrationId },
        data: {
          status: "selesai",
        },
      });

      await tx.encounterTimeline.create({
        data:{
          encounterId: payment.encounterId,
          performedBy: "kasir",
          status: "selesai",
          notes: "pembayaran menggunakan cash selesai",
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      return payment
    });

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Pembayaran berhasil dikonfirmasi",
    });
  } catch (error: any) {
    next(error);
  }
};