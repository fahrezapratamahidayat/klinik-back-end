import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getHistoryEncounter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "ID pasien tidak ditemukan",
      });
    }

    const historyEncounters = await prisma.encounter.findMany({
      where: {
        patientRegistration: {
          patient: {
            id: id,
          },
        },
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
              select: {
                id: true,
                name: true,
                installation: true,
              },
            },
          },
        },
        Prescriptions: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });

    if (historyEncounters.length === 0) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Riwayat kunjungan pasien tidak ditemukan",
        data: [],
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Berhasil mengambil riwayat kunjungan pasien",
      data: historyEncounters,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat mengambil riwayat kunjungan pasien",
      error: error.message,
    });
  }
};

export const getEncounterPatientRegistrationById = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const encounter = await prisma.encounter.findUnique({
    where: {
      patientRegistrationId: id,
    },
    select: {
      id: true,
      patientRegistrationId: true,
      encounterType: true,
      status: true,
      startDate: true,
      endDate: true,
      diagnosis: true,
      treatmentPlan: true,
      notes: true,
      patientRegistration: {
        select: {
          id: true,
          registrationNumber: true,
          registrationDate: true,
          queueNumber: true,
          status: true,
          registrationType: true,
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
            select: {
              id: true,
              name: true,
              installation: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      },
      EncounterTimeline: true,
      Prescriptions: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!encounter) {
    return res.status(404).json({
      status: false,
      statusCode: 404,
      message: "Data kunjungan pasien tidak ditemukan",
    });
  }
  res.status(200).json({
    status: true,
    statusCode: 200,
    message: "Berhasil mengambil data kunjungan pasien",
    data: encounter,
  });
};
