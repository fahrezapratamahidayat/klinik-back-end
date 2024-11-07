import { EncounterStatus, PrismaClient, RegistrationStatus } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { startOfDay, endOfDay, parseISO, format } from "date-fns";
import { id } from "date-fns/locale";
import { patientRegistrationStatusSchema } from "../../validations/patient-validation";
const prisma = new PrismaClient();

export const getPatientRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  try {
    const patientRegistration = await prisma.patientRegistration.findMany({
      where: {
        status: "dalam_antrian_farmasi",
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
      message: "Data pasien berhasil diambil",
      data: patientRegistration,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Internal server error",
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
      data: { status: validateData.data.status as EncounterStatus },
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
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const todayRegistrations = await prisma.patientRegistration.findMany({
      where: {
        registrationDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
        status: "antrian_farmasi",
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
