import {
  EncounterStatus,
  PrismaClient,
  RegistrationStatus,
} from "@prisma/client";
import { endOfDay, format, parseISO, startOfDay } from "date-fns";
import { Request, Response } from "express";
import { patientRegistrationStatusSchema } from "../../validations/patient-validation";
import { id } from "date-fns/locale";
import { UpdateEncounterSchema } from "../../validations/encounter-validation";

const prisma = new PrismaClient();

export const getPatientRegistration = async (req: Request, res: Response) => {
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
    const patientRegistration = await prisma.patientRegistration.findMany({
      where: {
        status: { in: ["dalam_antrian", "antrian_perawat"] },
        registrationDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        registrationNumber: true,
        registrationDate: true,
        queueNumber: true,
        status: true,
        patient: {
          select: {
            id: true,
            name: true,
            medicalRecordNumber: true,
            gender: true,
            birthDate: true,
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
        PaymentMethod: {
          select: {
            id: true,
            name: true,
          },
        },
        Encounter: {
          select: {
            id: true,
            status: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (patientRegistration.length === 0) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Data tidak ditemukan",
        data: [],
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Berhasil mengambil data pasien dalam antrian",
      data: patientRegistration,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Gagal mengambil data pasien dalam antrian",
      data: [],
      error: error,
    });
  }
};

export const getPatientRegistrationById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "ID pasien dalam antrian tidak ditemukan",
      });
    }
    const patientRegistration = await prisma.patientRegistration.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        registrationNumber: true,
        registrationDate: true,
        status: true,
        registrationType: true,
        patient: {
          select: {
            id: true,
            identifierType: true,
            medicalRecordNumber: true,
            name: true,
            gender: true,
            birthDate: true,
            birthPlace: true,
            maritalStatus: true,
            bloodType: true,
            education: true,
            citizenshipStatus: true,
            religion: true,
            responsiblePersonName: true,
            responsiblePersonPhone: true,
            telecom: true,
            address: {
              select: {
                id: true,
                use: true,
                line: true,
                city: true,
                postalCode: true,
                extension: {
                  select: {
                    id: true,
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
        PaymentMethod: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!patientRegistration) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Data pasien dalam antrian tidak ditemukan",
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Berhasil mengambil data pasien dalam antrian",
      data: patientRegistration,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Gagal mengambil data pasien dalam antrian",
      error: error,
    });
  }
};

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
      },
      include: {
        anamnesis: true,
        physicalExamination: true,
        psychologicalExamination: true,
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

export const updatePatientRegistrationStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "ID registrasi pasien tidak valid",
      });
    }
    const validateData = patientRegistrationStatusSchema.safeParse(req.body);
    if (!validateData.success) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Data tidak valid",
        errors: validateData.error.errors.map((error) => ({
          path: error.path.join("."),
          message: error.message,
        })),
      });
    }

    const updatedRegistration = await prisma.patientRegistration.update({
      where: { id },
      data: { status: validateData.data.status as RegistrationStatus },
    });

    if (!updatedRegistration) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Registrasi pasien tidak ditemukan",
      });
    }

    const encounter = await prisma.encounter.findFirst({
      where: { patientRegistrationId: id },
    });

    if (!encounter) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Encounter tidak ditemukan untuk registrasi ini",
      });
    }

    await prisma.encounter.update({
      where: { id: encounter.id },
      data: { status: validateData.data.statusEncounter as EncounterStatus },
    });

    await prisma.encounterTimeline.create({
      data: {
        encounterId: encounter.id,
        status: validateData.data.status as RegistrationStatus,
        timestamp: new Date(),
        performedBy: validateData.data.performedBy || "Perawat",
        notes: validateData.data.notes || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: `Status registrasi pasien berhasil diperbarui menjadi ${
        validateData.data.status.replace("_", " ").charAt(0).toUpperCase() +
        validateData.data.status.replace("_", " ").slice(1)
      }`,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan server internal",
      error: error.message,
    });
  }
};

export const getQueueInfo = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;

    let startDate: Date;
    let endDate: Date;

    if (from) {
      startDate = startOfDay(parseISO(from as string));
      endDate = to ? endOfDay(parseISO(to as string)) : endOfDay(startDate);
    } else {
      // Jika tidak ada parameter tanggal, gunakan hari ini
      startDate = startOfDay(new Date());
      endDate = endOfDay(new Date());
    }

    const todayRegistrations = await prisma.patientRegistration.findMany({
      where: {
        registrationDate: {
          gte: startDate,
          lte: endDate,
        },
        status: "dalam_antrian",
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            medicalRecordNumber: true,
            gender: true,
            birthDate: true,
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
        PaymentMethod: {
          select: {
            id: true,
            name: true,
          },
        },
        Encounter: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        queueNumber: "asc",
      },
    });

    if (todayRegistrations.length === 0) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Tidak ada pendaftaran pasien untuk hari ini",
        data: [],
        meta: {
          totalQueue: 0,
          currentQueue: 0,
          nextQueue: 0,
          previousQueue: 0,
          remainingQueue: 0,
        },
      });
    }

    const totalQueue = todayRegistrations.length;
    const currentQueue =
      todayRegistrations.find((reg) => reg.status === "dalam_antrian")
        ?.queueNumber || 0;
    const nextQueue =
      todayRegistrations.find(
        (reg) => reg.status === "draft" && reg.queueNumber > currentQueue
      )?.queueNumber || 0;
    const previousQueue = currentQueue > 1 ? currentQueue - 1 : 0;

    const formattedRegistrations = todayRegistrations.map((reg) => ({
      id: reg.id,
      registrationNumber: reg.registrationNumber,
      registrationDate: format(reg.registrationDate, "dd MMMM yyyy HH:mm", {
        locale: id,
      }),
      queueNumber: reg.queueNumber,
      status: reg.status,
      patient: {
        ...reg.patient,
        birthDate: format(reg.patient.birthDate, "dd MMMM yyyy", {
          locale: id,
        }),
      },
      doctor: reg.doctor,
      room: reg.room,
      PaymentMethod: reg.PaymentMethod,
      Encounter: reg.Encounter,
    }));

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Informasi antrian hari ini berhasil diambil",
      data: formattedRegistrations,
      meta: {
        totalQueue,
        currentQueue,
        nextQueue,
        previousQueue,
        remainingQueue: totalQueue - currentQueue,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan server internal",
      error: error.message,
      data: [],
      meta: {},
    });
  }
};
