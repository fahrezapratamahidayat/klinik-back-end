import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const confirmPrescription = async (req: Request, res: Response) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await prisma.prescriptions.findUnique({
      where: { id: prescriptionId },
      include: { medicine: true }
    });

    if (!prescription) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Resep tidak ditemukan",
      });
    }

    if (prescription.status !== 'draft') {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Resep sudah dikonfirmasi sebelumnya",
      });
    }

    const updatedPrescription = await prisma.prescriptions.update({
      where: { id: prescriptionId },
      data: { status: 'confirmed' },
      include: { medicine: true }
    });

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Resep berhasil dikonfirmasi",
      data: updatedPrescription
    });

  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat mengkonfirmasi resep",
      error: error.message
    });
  }
};

export const processPrescription = async (req: Request, res: Response) => {
  try {
    const { prescriptionId } = req.params;
    const { status, notes } = req.body;

    const prescription = await prisma.prescriptions.findUnique({
      where: { id: prescriptionId },
      include: { medicine: true }
    });

    if (!prescription) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Resep tidak ditemukan",
      });
    }

    if (prescription.status === 'dispensed' || prescription.status === 'cancelled') {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Resep sudah diproses sebelumnya",
      });
    }

    // Jika status cancelled, langsung update status saja
    if (status === 'cancelled') {
      const cancelledPrescription = await prisma.prescriptions.update({
        where: { id: prescriptionId },
        data: { 
          status: 'cancelled',
          notes: notes 
        },
        include: { medicine: true }
      });

      return res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Resep berhasil dibatalkan",
        data: cancelledPrescription
      });
    }

    if (status === "processed") {
      const updatedPrescription = await prisma.prescriptions.update({
        where: { id: prescriptionId },
        data: { status: 'processed' },
      });
      return res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Resep dalam proses",
      });
    }

    // Untuk status confirmed, lakukan pengecekan stok
    if (prescription.medicine.stock < prescription.quantity) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Stok obat tidak mencukupi",
      });
    }

    const updatedPrescription = await prisma.$transaction(async (prisma) => {
      // Update status resep
      const updatedPrescription = await prisma.prescriptions.update({
        where: { id: prescriptionId },
        data: { 
          status: 'dispensed',
          notesPharmacy: notes 
        },
        include: { medicine: true }
      });

      // Kurangi stok obat
      await prisma.medicine.update({
        where: { id: prescription.medicineId },
        data: { 
          stock: { decrement: prescription.quantity }
        }
      });

      // Catat transaksi obat
      await prisma.medicineTransaction.create({
        data: {
          medicineId: prescription.medicineId,
          transactionType: 'OUT',
          quantity: prescription.quantity,
          price: prescription.medicine.price * prescription.quantity,
          performedBy: req.body.userId || 'SYSTEM',
          notes: `Pengambilan obat untuk resep ${prescription.prescriptionNumber}`
        }
      });

      return updatedPrescription;
    });

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Resep berhasil diserahkan",
      data: updatedPrescription
    });

  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat memproses resep",
      error: error.message
    });
  }
};

export const dispensePrescription = async (req: Request, res: Response) => {
  try {
    const { prescriptionId } = req.params;
    const { dispensedBy } = req.body;

    if (!dispensedBy) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Petugas penyerah obat harus diisi",
      });
    }

    const prescription = await prisma.prescriptions.findUnique({
      where: { id: prescriptionId }
    });

    if (!prescription) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Resep tidak ditemukan",
      });
    }

    if (prescription.status !== 'processed') {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Resep belum diproses oleh farmasi",
      });
    }

    const updatedPrescription = await prisma.prescriptions.update({
      where: { id: prescriptionId },
      data: {
        status: 'dispensed',
        dispensedAt: new Date(),
        dispensedBy: dispensedBy
      }
    });

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Obat berhasil diserahkan ke pasien",
      data: updatedPrescription
    });

  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat menyerahkan obat",
      error: error.message
    });
  }
};

// Mendapatkan daftar resep yang perlu diproses farmasi
export const getPendingPrescriptions = async (req: Request, res: Response) => {
  try {
    const prescriptions = await prisma.prescriptions.findMany({
      where: {
        status: 'draft' // Hanya ambil resep yang sudah dikonfirmasi dokter
      },
      include: {
        medicine: true,
        encounter: {
          include: {
            patientRegistration: {
              include: {
                patient: {
                  select: {
                    id: true,
                    name: true,
                    medicalRecordNumber: true
                  }
                },
                doctor: {
                  select: {
                    id: true,
                    name: true,
                    specialization: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Berhasil mengambil daftar resep yang perlu diproses",
      data: prescriptions
    });

  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat mengambil daftar resep",
      error: error.message
    });
  }
};

// Mendapatkan riwayat transaksi obat
export const getMedicineTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.medicineTransaction.findMany({
      include: {
        medicine: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Berhasil mengambil riwayat transaksi obat",
      data: transactions
    });

  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat mengambil riwayat transaksi",
      error: error.message
    });
  }
};