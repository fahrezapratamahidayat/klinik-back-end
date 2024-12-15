import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
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
        prescriptions: true,
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
      prescriptions: true,
      diagnosis: {
        include: {
          icd10: true,
        },
      },
      procedure: {
        include: {
          icd9: true,
        },
      },
      encounterTimeline: true,
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
  res: Response,
  next: NextFunction
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
        prescriptions: {
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
        diagnosis: {
          deleteMany: {},
          ...(validatedData.diagnosis && validatedData.diagnosis.length > 0
            ? {
                create: await Promise.all(
                  validatedData.diagnosis.map(async (diagnosis) => ({
                    icd10Id: diagnosis.icd10Id,
                    type: diagnosis.type,
                    notes: diagnosis.notes,
                  }))
                ),
              }
            : {}),
        },
        procedure: {
          deleteMany: {},
          ...(validatedData.procedure && validatedData.procedure.length > 0
            ? {
                create: await Promise.all(
                  validatedData.procedure.map(async (procedure) => ({
                    icd9Id: procedure.icd9Id,
                    notes: procedure.notes,
                    performedAt: new Date(procedure.performedAt),
                    performedBy: procedure.performedBy,
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
        prescriptions: true,
        diagnosis: true,
        procedure: true,
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
    next(error);
  }
};

// icd 10
export const getIcd10 = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = "", category = "" } = req.query;

    // Convert ke number
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Buat kondisi pencarian
    const whereCondition = {
      OR: [
        { code: { contains: String(search) } },
        { description: { contains: String(search) } },
      ],
      ...(category && { category: String(category) }),
    };

    // Ambil total data untuk pagination
    const totalData = await prisma.icd10.count({
      where: whereCondition,
    });

    // Ambil data dengan filter dan pagination
    const icd10 = await prisma.icd10.findMany({
      where: whereCondition,
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        category: true,
      },
      skip: skip,
      take: limitNumber,
      orderBy: {
        code: "asc",
      },
    });

    if (icd10.length === 0) {
      return res.status(200).json({
        status: false,
        statusCode: 200,
        message: "Data ICD-10 tidak ditemukan",
        data: [],
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Berhasil mengambil data ICD-10",
      data: icd10,
      meta: {
        page: pageNumber,
        limit: limitNumber,
        total: totalData,
        totalPages: Math.ceil(totalData / limitNumber),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat mengambil data ICD-10",
      error: error.message,
    });
  }
};

export const getIcd9 = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = "", category = "" } = req.query;
    // Convert ke number
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Buat kondisi pencarian
    const whereCondition = {
      OR: [
        { code: { contains: String(search) } },
        { description: { contains: String(search) } },
      ],
      ...(category && { category: String(category) }),
    };

    // Ambil total data untuk pagination
    const totalData = await prisma.icd10.count({
      where: whereCondition,
    });

    // Ambil data dengan filter dan pagination
    const icd9 = await prisma.icd9.findMany({
      where: whereCondition,
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        category: true,
      },
      skip: skip,
      take: limitNumber,
      orderBy: {
        code: "asc",
      },
    });

    if (icd9.length === 0) {
      return res.status(200).json({
        status: false,
        statusCode: 200,
        message: "Data ICD-10 tidak ditemukan",
        data: [],
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Berhasil mengambil data ICD-10",
      data: icd9,
      meta: {
        page: pageNumber,
        limit: limitNumber,
        total: totalData,
        totalPages: Math.ceil(totalData / limitNumber),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat mengambil data ICD-10",
      error: error.message,
    });
  }
};
