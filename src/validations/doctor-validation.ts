import { z } from "zod";
import {
  Gender,
  DoctorStatus,
} from "@prisma/client";

export const createDoctorValidation = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  gender: z.nativeEnum(Gender),
  birthDate: z.coerce.date(),
  birthPlace: z.string().min(1, "Tempat lahir harus diisi"),
  nip: z.string().optional().nullable(),
  nik: z.string().length(16, "NIK harus 16 digit"),
  sip: z.string().min(1, "SIP harus diisi"),
  str: z.string().min(1, "STR harus diisi"),
  bpjsCode: z.string().optional().nullable(),
  satuSehatId: z.string().min(1, "Satu Sehat ID harus diisi"),
  specialization: z.string().min(1, "Spesialisasi harus diisi"),
  status: z.nativeEnum(DoctorStatus).default(DoctorStatus.aktif),
  address: z.object({
    use: z.string(),
    line: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
    extension: z.object({
      province: z.string(),
      city: z.string(),
      district: z.string(),
      village: z.string(),
      rt: z.string(),
      rw: z.string(),
    }),
  }),
  telecom: z.array(
    z.object({
      system: z.string(),
      value: z.string(),
      use: z.string(),
    })
  ),
  workSchedule: z.array(
    z.object({
      dayOfWeek: z.number().int().min(1).max(7),
      startTime: z.string(),
      endTime: z.string(),
    })
  ).optional(),
});


export const createDoctorScheduleValidation = z.object({
  doctorId: z.string(),
  roomId: z.string(),
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: z.string(),
  endTime: z.string(),
  isActive: z.boolean(),
  offlineQuota: z.number().int().min(0),
  onlineQuota: z.number().int().min(0),
});
