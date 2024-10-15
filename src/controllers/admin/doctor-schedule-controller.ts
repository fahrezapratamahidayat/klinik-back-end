import { Day, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { validateInput } from "../../helpers/validation";
import { createDoctorScheduleValidation } from "../../validations/doctor-validation";
const prisma = new PrismaClient();

export const createDoctorSchedule = async (req: Request, res: Response) => {
  const {
    doctorId,
    date,
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

    // validasi tanggal harus melebihi tanggal hari ini
    const today = new Date();
    if (date < today) {
      return res
        .status(400)
        .json({ message: "Tanggal harus melebihi tanggal hari ini" });
    }

    // Parsing tanggal dan waktu
    const scheduleDate = new Date(date);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    // Validasi waktu
    if (
      startHour > endHour ||
      (startHour === endHour && startMinute >= endMinute)
    ) {
      return res
        .status(400)
        .json({ message: "Waktu mulai harus sebelum waktu selesai" });
    }


    // Mendapatkan nama hari
    const day = [
      Day.Minggu,
      Day.Senin,
      Day.Selasa,
      Day.Rabu,
      Day.Kamis,
      Day.Jumat,
      Day.Sabtu,
    ][scheduleDate.getDay()];

    // Validasi dokter
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) {
      return res.status(404).json({ message: "Dokter tidak ditemukan" });
    }

    // Validasi ruangan
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });
    if (!room) {
      return res.status(404).json({ message: "Ruangan tidak ditemukan" });
    }

    // Cek jadwal yang sudah ada
    const existingSchedule = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId,
        date: scheduleDate,
      },
    });

    if (existingSchedule) {
      return res
        .status(400)
        .json({ message: "Jadwal dokter untuk tanggal ini sudah ada" });
    }

    // Buat jadwal dokter
    const schedule = await prisma.doctorSchedule.create({
      data: {
        doctorId,
        roomId,
        date: scheduleDate,
        day,
        startTime,
        endTime,
        isActive,
        totalQuota,
        offlineQuota,
        onlineQuota,
        remainingOfflineQuota: offlineQuota,
        remainingOnlineQuota: onlineQuota,
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
        .json({ message: "Jadwal dokter untuk tanggal ini sudah ada" });
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
