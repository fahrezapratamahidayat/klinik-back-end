import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { UpdateEncounterSchema } from "../../validations/encounter-validation";
import { generatePrescriptionNumber } from "../../utils/generate";

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
        anamnesis: true,
        physicalExamination: true,
        psychologicalExamination: true,
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
      anamnesis: true,
      physicalExamination: true,
      psychologicalExamination: true,
      Prescriptions: true,
      EncounterTimeline: true,
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

export const updateEncounterPatientRegistration = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    // Validasi input
    const validationResult = UpdateEncounterSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Data tidak valid",
        errors: validationResult.error.errors.map((error) => ({
          path: error.path.join("."),
          message: error.message,
        })),
      });
    }

    const validatedData = validationResult.data;

    // Memperbarui encounter
    const updatedEncounter = await prisma.encounter.update({
      where: { patientRegistrationId: id },
      data: {
        status: validatedData.status,
        endDate: validatedData.endDate
          ? new Date(validatedData.endDate)
          : undefined,
        diagnosis: validatedData.diagnosis,
        treatmentPlan: validatedData.treatmentPlan,
        notes: validatedData.notes,
        anamnesis: validatedData.anamnesis
          ? {
              upsert: {
                create: {
                  ...validatedData.anamnesis,
                  recordedDate: new Date(),
                  lastMenstrualPeriod: validatedData.anamnesis
                    .lastMenstrualPeriod
                    ? new Date(validatedData.anamnesis.lastMenstrualPeriod)
                    : undefined,
                },
                update: {
                  ...validatedData.anamnesis,
                  recordedDate: new Date(),
                  lastMenstrualPeriod: validatedData.anamnesis
                    .lastMenstrualPeriod
                    ? new Date(validatedData.anamnesis.lastMenstrualPeriod)
                    : undefined,
                },
              },
            }
          : undefined,
        physicalExamination: validatedData.physicalExamination
          ? {
              upsert: {
                create: {
                  ...validatedData.physicalExamination,
                  effectiveDateTime: new Date(),
                },
                update: {
                  ...validatedData.physicalExamination,
                  effectiveDateTime: new Date(),
                },
              },
            }
          : undefined,
        psychologicalExamination: validatedData.psychologicalExamination
          ? {
              upsert: {
                create: {
                  ...validatedData.psychologicalExamination,
                  effectiveDateTime: new Date(),
                },
                update: {
                  ...validatedData.psychologicalExamination,
                  effectiveDateTime: new Date(),
                },
              },
            }
          : undefined,
        Prescriptions: {
          deleteMany: {},
          ...(validatedData.prescriptions &&
          validatedData.prescriptions.length > 0
            ? {
                create: await Promise.all(
                  validatedData.prescriptions.map(async (prescription) => ({
                    prescriptionNumber: await generatePrescriptionNumber(),
                    medicineId: prescription.medicineId,
                    quantity: prescription.quantity,
                    dosage: prescription.dosage,
                    route: prescription.route,
                    frequency: prescription.frequency,
                    duration: prescription.duration,
                    notes: prescription.notes,
                    status: prescription.status,
                    dispensedAt: prescription.dispensedAt
                      ? new Date(prescription.dispensedAt)
                      : undefined,
                    dispensedBy: prescription.dispensedBy,
                  }))
                ),
              }
            : {}),
        },
      },
      include: {
        anamnesis: true,
        physicalExamination: true,
        psychologicalExamination: true,
        Prescriptions: true,
      },
    });

    if (!updatedEncounter) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Encounter tidak ditemukan",
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Encounter berhasil diperbarui",
      data: updatedEncounter,
    });
  } catch (error: any) {
    console.error("Kesalahan saat memperbarui encounter:", error);
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat memperbarui encounter",
      error: error.message,
    });
  }
};
