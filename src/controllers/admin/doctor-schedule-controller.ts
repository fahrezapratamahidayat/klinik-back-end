import { Day, PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { validateInput } from "../../helpers/validation";
import { createDoctorScheduleValidation } from "../../validations/doctor-validation";
const prisma = new PrismaClient();

export const createDoctorSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationResult = createDoctorScheduleValidation.safeParse(req.body);

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

  const { doctorId, roomId, schedules } = validationResult.data;

  try {
    // Validasi dokter
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Dokter tidak ditemukan",
      });
    }

    // Validasi ruangan
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });
    if (!room) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Ruangan tidak ditemukan",
      });
    }

    // Proses setiap jadwal
    const createdSchedules = await Promise.all(
      schedules.map(async (schedule) => {
        const {
          date,
          day,
          startTime,
          endTime,
          offlineQuota,
          onlineQuota,
          totalQuota,
        } = schedule;
        // const today = new Date();
        // today.setHours(0, 0, 0, 0); // Set waktu ke 00:00:00
        // const scheduleDate = new Date(date);
        // scheduleDate.setHours(0, 0, 0, 0); // Set waktu ke 00:00:00

        // console.log("Today:", today.toISOString());
        // console.log("Schedule date:", scheduleDate.toISOString());
        // if (scheduleDate < today) {
        //   return res.status(400).json({ status: false, statusCode: 400, message: "Tanggal harus sama dengan atau melebihi tanggal hari ini" });
        // }

        // // Validasi waktu
        // const [startHour, startMinute] = startTime.split(":").map(Number);
        // const [endHour, endMinute] = endTime.split(":").map(Number);
        // if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
        //   return res.status(400).json({ status: false, statusCode: 400, message: "Waktu mulai harus sebelum waktu selesai" });
        // }

        // Cek jadwal yang sudah ada
        const existingSchedule = await prisma.doctorSchedule.findFirst({
          where: {
            doctorId,
            date,
          },
        });

        if (existingSchedule) {
          return res.status(400).json({
            status: false,
            statusCode: 400,
            message: `Jadwal dokter untuk tanggal ${
              date.toISOString().split("T")[0]
            } sudah ada`,
          });
        }

        // Buat jadwal dokter
        return prisma.doctorSchedule.create({
          data: {
            doctorId,
            roomId,
            date,
            day,
            startTime,
            endTime,
            isActive: true,
            totalQuota,
            offlineQuota,
            onlineQuota,
            remainingOfflineQuota: offlineQuota,
            remainingOnlineQuota: onlineQuota,
          },
        });
      })
    );

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Jadwal dokter berhasil dibuat",
    });
  } catch (error: any) {
    console.error(error);
    if (error instanceof Error) {
      return res
        .status(400)
        .json({ status: false, statusCode: 400, message: error.message });
    }
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan server internal",
    });
    next(error);
  }
};

export const getDoctorSchedules = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctorSchedules = await prisma.doctorSchedule.findMany({
      select: {
        id: true,
        date: true,
        day: true,
        startTime: true,
        endTime: true,
        totalQuota: true,
        offlineQuota: true,
        onlineQuota: true,
        remainingOfflineQuota: true,
        remainingOnlineQuota: true,
        isActive: true,
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
            operationalStatus: true,
          },
        },
      },
    });
    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Jadwal dokter berhasil diambil",
      data: doctorSchedules,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan server internal",
    });
  }
};

export const getDoctorScheduleById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const doctorSchedule = await prisma.doctorSchedule.findUnique({
      where: {
        id,
      },
      include: {
        doctor: true,
        room: true,
      },
    });
    if (!doctorSchedule) {
      return res.status(404).json({ message: "Doctor schedule not found" });
    }
    return res.status(200).json({
      message: "Doctor schedule fetched successfully",
      data: doctorSchedule,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDoctorSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {}
};

export const deleteDoctorSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    // check apakah id ada di databases
    const existingSchedule = await prisma.doctorSchedule.findUnique({
      where: { id },
    });
    if (!existingSchedule) {
      res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Doctor schedule not found",
      });
      return;
    }
    await prisma.doctorSchedule.delete({
      where: { id },
    });

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Doctor schedule deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Internal server error",
    });
    next(error);
  }
};
