import { Installation, PrismaClient } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
const prisma = new PrismaClient();

export async function generateMedicalRecordNumber(): Promise<string> {
  try {
    const lastPatient = await prisma.patient.findFirst({
      orderBy: {
        medicalRecordNumber: "desc",
      },
      select: {
        medicalRecordNumber: true,
      },
    });

    let nextNumber = 1;

    if (lastPatient && lastPatient.medicalRecordNumber) {
      const lastNumber = parseInt(lastPatient.medicalRecordNumber.slice(2));
      nextNumber = lastNumber + 1;
    }

    const medicalRecordNumber = `RM${nextNumber.toString().padStart(6, "0")}`;

    return medicalRecordNumber;
  } catch (error) {
    console.error("Kesalahan saat membuat nomor rekam medis:", error);
    throw new Error("Gagal membuat nomor rekam medis");
  }
}

export async function generateRegistrationId(): Promise<string> {
  try {
    const lastRegistration = await prisma.patientRegistration.findFirst({
      orderBy: {
        registrationNumber: "desc",
      },
      select: {
        registrationNumber: true,
      },
    });

    let nextNumber = 1;

    if (lastRegistration && lastRegistration.registrationNumber) {
      const lastNumber = parseInt(lastRegistration.registrationNumber.slice(3));
      nextNumber = lastNumber + 1;
    }

    const registrationId = `REG${nextNumber.toString().padStart(6, "0")}`;

    return registrationId;
  } catch (error) {
    console.error("Kesalahan saat membuat ID pendaftaran:", error);
    throw new Error("Gagal membuat ID pendaftaran");
  }
}

export async function generateRoomCode(installation: Installation): Promise<string> {
  try {
    const prefix = getInstallationPrefix(installation);
    
    const lastRoom = await prisma.room.findFirst({
      where: {
        installation: installation,
        identifier: {
          startsWith: prefix,
        },
      },
      orderBy: {
        identifier: 'desc',
      },
      select: {
        identifier: true,
      },
    });

    let nextNumber = 1;

    if (lastRoom && lastRoom.identifier) {
      const lastNumber = parseInt(lastRoom.identifier.split('-')[1]);
      nextNumber = lastNumber + 1;
    }

    const roomCode = `${prefix}-${nextNumber.toString().padStart(3, '0')}`;

    return roomCode;
  } catch (error) {
    console.error("Kesalahan saat membuat kode ruangan:", error);
    throw new Error("Gagal membuat kode ruangan");
  }
}

export async function generateDailyQueueNumber(doctorId: string): Promise<number> {
  try {
    const today = startOfDay(new Date());
    const todayEnd = endOfDay(today);

    const queueNumber = await prisma.patientRegistration.count({
      where: {
        registrationDate: {
          gte: today,
          lte: todayEnd,
        },
        doctorId: doctorId,
      },
    }) + 1;

    return queueNumber;
  } catch (error) {
    console.error("Kesalahan saat membuat nomor antrian harian:", error);
    throw new Error("Gagal membuat nomor antrian harian");
  }
}

function getInstallationPrefix(installation: Installation): string {
  switch (installation) {
    case 'rawat_jalan':
      return 'RJ';
    case 'rawat_inap':
      return 'RI';
    case 'gawat_darurat':
      return 'IGD';
    case 'bedah_sentral':
      return 'BS';
    case 'laboratorium':
      return 'LAB';
    case 'radiologi':
      return 'RAD';
    case 'farmasi':
      return 'FAR';
    case 'rehabilitasi_medik':
      return 'RHB';
    case 'hemodialisis':
      return 'HD';
    case 'icu':
      return 'ICU';
    case 'nicu':
      return 'NICU';
    case 'picu':
      return 'PICU';
    default:
      return 'OTH';
  }
}