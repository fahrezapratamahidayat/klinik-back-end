import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { validateInput } from "../../helpers/validation";
import { createDoctorScheduleValidation } from "../../validations/doctor-validation";
const prisma = new PrismaClient();

export const createDoctorSchedule = async (req: Request, res: Response) => {
  const {
    doctorId,
    dayOfWeek,
    startTime,
    endTime,
    isActive,
    offlineQuota,
    onlineQuota,
    roomId,
  } = req.body;

  if (!validateInput(createDoctorScheduleValidation, req, res)) {
    return;
  }

  try {
    // Validasi input
    const totalQuota = offlineQuota + onlineQuota;
    if (totalQuota < 1) {
      return res
        .status(400)
        .json({ message: "Total kuota harus lebih dari 0" });
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    if (
      startHour > endHour ||
      (startHour === endHour && startMinute >= endMinute)
    ) {
      return res
        .status(400)
        .json({ message: "Waktu mulai harus sebelum waktu selesai" });
    }

    // Hitung tanggal jadwal
    const currentDate = new Date();
    const scheduleDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + ((7 + dayOfWeek - currentDate.getDay()) % 7)
    );

    // validasi kalau doctor tidak ada
    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
    });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // validasi kalau room tidak ada
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Buat jadwal dokter
    const schedule = await prisma.doctorSchedule.create({
      data: {
        doctorId,
        dayOfWeek,
        startTime: new Date(scheduleDate.setHours(startHour, startMinute)),
        endTime: new Date(scheduleDate.setHours(endHour, endMinute)),
        isActive,
        totalQuota,
        offlineQuota,
        onlineQuota,
        remainingOfflineQuota: offlineQuota,
        remainingOnlineQuota: onlineQuota,
        roomId,
      },
    });

    return res.status(201).json({
      message: "Jadwal dokter berhasil dibuat",
      data: schedule,
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "Jadwal dokter untuk hari ini sudah ada" });
    }
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan server internal" });
  }
};

export const getDoctorSchedules = async (req: Request, res: Response) => {
  try {
    const doctorSchedules = await prisma.doctorSchedule.findMany({
      include: {
        doctor: true,
        room: true,
      },
    });
    return res.status(200).json({
      message: "Doctor schedules fetched successfully",
      data: doctorSchedules,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDoctorScheduleById = async (req: Request, res: Response) => {
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

export const updateDoctorSchedule = async (req: Request, res: Response) => {
  try {
  } catch (error) {}
};

export const deleteDoctorSchedule = async (req: Request, res: Response) => {
  try {
  } catch (error) {}
};
