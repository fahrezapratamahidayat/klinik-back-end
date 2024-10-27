import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { endOfDay, parseISO, startOfDay } from "date-fns";
const prisma = new PrismaClient();

export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    let startDate: Date;
    let endDate: Date;

    if (from) {
      startDate = startOfDay(parseISO(from as string));
      endDate = to ? endOfDay(parseISO(to as string)) : endOfDay(new Date());
    } else {
      startDate = new Date(0);
      endDate = new Date();
    }
    const patients = await prisma.patient.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        medicalRecordNumber: true,
        identifier: false,
        identifierType: true,
        name: true,
        birthDate: true,
        birthPlace: true,
        gender: true,
        address: {
          select: {
            use: true,
            line: true,
            city: true,
            postalCode: true,
            country: true,
            extension: {
              select: {
                provinceCode: false,
                districtCode: false,
                subdistrictCode: false,
                villageCode: false,
                province: {
                  select: {
                    name: true,
                  },
                },
                district: {
                  select: {
                    name: true,
                  },
                },
                subdistrict: {
                  select: {
                    name: true,
                  },
                },
                village: {
                  select: {
                    name: true,
                  },
                },
                rt: true,
                rw: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ createdAt: "desc" }],
    });
    if (patients.length === 0) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Tidak ada pasien yang ditemukan",
        data: [],
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Daftar semua pasien berhasil diambil",
      data: patients,
    });
  } catch (error) {
    console.error("Kesalahan saat mengambil daftar pasien:", error);
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat mengambil daftar pasien",
    });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        address: {
          include: {
            extension: {
              select: {
                rt: true,
                rw: true,
                province: {
                  select: {
                    name: true,
                  },
                },
                district: {
                  select: {
                    name: true,
                  },
                },
                subdistrict: {
                  select: {
                    name: true,
                  },
                },
                village: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        telecom: true,
        relatedPersons: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Pasien tidak ditemukan",
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Data pasien ditemukan",
      data: patient,
    });
  } catch (error) {
    console.error("Kesalahan saat mencari pasien:", error);
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat mencari pasien",
    });
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.patient.delete({ where: { id } });
    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Pasien berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Kesalahan saat menghapus pasien:", error);
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat menghapus pasien",
      errors: error.message,
    });
  }
};
