import { PrismaClient } from "@prisma/client";
import e, { Request, Response } from "express";
import { createPatientRegistrationValidation } from "../../validations/patient-validation";
import { validateInput } from "../../helpers/validation";
import { generateRegistrationId } from "../../utils/generate";

const prisma = new PrismaClient();
export const createPatientRegistration = async (
  req: Request,
  res: Response
) => {
  const {
    patientId,
    doctorId,
    paymentMethodId,
    roomId,
    scheduleId,
    isOnline,
    encounterType,
  } = req.body;
  if (!validateInput(createPatientRegistrationValidation, req, res)) return;

  try {
    // Periksa keberadaan pasien, dokter, dan metode pembayaran
    const [patient, doctor, paymentMethod] = await Promise.all([
      prisma.patient.findUnique({ where: { id: patientId } }),
      prisma.doctor.findUnique({ where: { id: doctorId } }),
      prisma.paymentMethod.findUnique({ where: { id: paymentMethodId } }),
    ]);

    if (!patient)
      return res.status(404).json({ message: "Pasien tidak ditemukan" });
    if (!doctor)
      return res.status(404).json({ message: "Dokter tidak ditemukan" });
    if (!paymentMethod)
      return res
        .status(404)
        .json({ message: "Metode pembayaran tidak ditemukan" });

    // Periksa jadwal dokter
    const doctorSchedule = await prisma.doctorSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!doctorSchedule || !doctorSchedule.isActive) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Jadwal dokter tidak tersedia",
      });
    }

    // Validasi jadwal dokter untuk hari ini
    const today = new Date();
    const currentTime = today.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    if (doctorSchedule.date.toDateString() !== today.toDateString()) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Jadwal dokter tidak tersedia untuk hari ini",
      });
    }

    // Validasi waktu pendaftaran
    if (
      currentTime < doctorSchedule.startTime ||
      currentTime > doctorSchedule.endTime
    ) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Waktu pendaftaran di luar jadwal praktik dokter",
      });
    }

    // Periksa kuota yang tersedia
    const availableQuota = isOnline
      ? doctorSchedule.remainingOnlineQuota
      : doctorSchedule.remainingOfflineQuota;

    if (availableQuota <= 0) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: `Kuota ${
          isOnline ? "online" : "offline"
        } untuk jadwal ini telah habis`,
      });
    }

    // Buat registrasi pasien
    const registrationNumber = await generateRegistrationId();
    const patientRegistration = await prisma.patientRegistration.create({
      data: {
        patientId,
        doctorId,
        roomId,
        paymentMethodId,
        registrationNumber,
        registrationDate: new Date(),
      },
    });

    // Create Encounter
    const encounter = await prisma.encounter.create({
      data: {
        patientRegistrationId: patientRegistration.id,
        encounterType,
        status: "planned",
        startDate: new Date(),
      },
    });

    // Update kuota yang tersisa
    await prisma.doctorSchedule.update({
      where: { id: scheduleId },
      data: {
        remainingOnlineQuota: isOnline
          ? doctorSchedule.remainingOnlineQuota - 1
          : doctorSchedule.remainingOnlineQuota,
        remainingOfflineQuota: !isOnline
          ? doctorSchedule.remainingOfflineQuota - 1
          : doctorSchedule.remainingOfflineQuota,
      },
    });

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Registrasi pasien berhasil dibuat",
      data: patientRegistration,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPatientRegistrations = async (req: Request, res: Response) => {
  try {
    const patientRegistrations = await prisma.patientRegistration.findMany();
    if (patientRegistrations.length === 0)
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Patient registrations not found",
        data: [],
        total: 0,
      });
    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Patient registrations found",
      data: patientRegistrations,
      total: patientRegistrations.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPatientRegistrationById = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  try {
    const patientRegistration = await prisma.patientRegistration.findUnique({
      where: {
        id,
      },
      include: {
        patient: true,
        doctor: true,
        room: true,
        PaymentMethod: true,
      },
    });
    if (!patientRegistration)
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Patient registration not found",
        data: null,
        total: 0,
      });
    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Patient registration found",
      data: patientRegistration,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
