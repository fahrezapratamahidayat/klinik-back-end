import { EncounterStatus, PrismaClient, RegistrationStatus } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { startOfDay, endOfDay, parseISO, format } from "date-fns";
import { id } from "date-fns/locale";
import { patientRegistrationStatusSchema } from "../../validations/patient-validation";
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
        status: { in: ["antrian_kasir", "dalam_antrian_kasir"] },
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
      startDate = startOfDay(new Date());
      endDate = endOfDay(new Date());
    }

    const todayRegistrations = await prisma.patientRegistration.findMany({
      where: {
        registrationDate: {
          gte: startDate,
          lte: endDate,
        },
        status: "antrian_kasir",
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
