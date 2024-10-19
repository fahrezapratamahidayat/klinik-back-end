import { z } from "zod";
import { Gender, DoctorStatus } from "@prisma/client";

export const createDoctorValidation = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  gender: z.nativeEnum(Gender),
  birthDate: z.coerce.date(),
  birthPlace: z.string().min(1, "Tempat lahir harus diisi"),
  nip: z.string().min(1, "NIP harus diisi"),
  nik: z.string().length(16, "NIK harus 16 digit"),
  sip: z.string().min(1, "SIP harus diisi"),
  str: z.string().min(1, "STR harus diisi"),
  specialization: z.string().min(1, "Spesialisasi harus diisi"),
  status: z.nativeEnum(DoctorStatus).describe("Status harus diisi"),
  address: z
    .object({
      use: z
        .string()
        .min(1, "bisa di isi dengan nilai rumah/kantor/lainnya")
        .optional(),
      line: z.string().min(1, "Alamat harus diisi"),
      city: z.string().min(1, "Kota harus diisi"),
      postalCode: z.string().min(1, "Kode pos harus diisi"),
      country: z.string().min(1, "Negara harus diisi"),
      extension: z.object({
        provinceCode: z.string().min(1, "Kode provinsi harus diisi"),
        districtCode: z.string().min(1, "Kode kabupaten harus diisi"),
        subdistrictCode: z.string().min(1, "Kode kecamatan harus diisi"),
        villageCode: z.string().min(1, "Kode desa harus diisi"),
        rt: z.string().optional(),
        rw: z.string().optional(),
      }),
    })
    .describe("Alamat dokter harus diisi"),
  telecom: z
    .array(
      z.object({
        system: z.string(),
        value: z.string(),
        use: z.string(),
      })
    )
    .min(1, "Harus ada setidaknya 1 nomor telepon")
    .describe("Nomor telepon harus diisi"),
  workSchedule: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(1).max(7),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .optional(),
});

export const updateDoctorValidation = z
  .object({
    name: z.string().min(1, "Nama harus diisi").optional(),
    gender: z.nativeEnum(Gender).optional(),
    birthDate: z.coerce.date().optional(),
    birthPlace: z.string().min(1, "Tempat lahir harus diisi").optional(),
    nip: z.string().min(1, "NIP harus diisi"),
    nik: z.string().length(16, "NIK harus 16 digit").optional(),
    sip: z.string().min(1, "SIP harus diisi").optional(),
    str: z.string().min(1, "STR harus diisi").optional(),
    specialization: z.string().min(1, "Spesialisasi harus diisi").optional(),
    status: z.nativeEnum(DoctorStatus).optional(),
    address: z
      .object({
        use: z
          .string()
          .min(1, "bisa di isi dengan nilai rumah/kantor/lainnya")
          .optional(),
        line: z.string().min(1, "Alamat harus diisi").optional(),
        city: z.string().min(1, "Kota harus diisi").optional(),
        postalCode: z.string().min(1, "Kode pos harus diisi").optional(),
        country: z.string().min(1, "Negara harus diisi").optional(),
        extension: z
          .object({
            provinceCode: z
              .string()
              .min(1, "Kode provinsi harus diisi")
              .optional(),
            districtCode: z
              .string()
              .min(1, "Kode kabupaten harus diisi")
              .optional(),
            subdistrictCode: z
              .string()
              .min(1, "Kode kecamatan harus diisi")
              .optional(),
            villageCode: z.string().min(1, "Kode desa harus diisi").optional(),
            rt: z.string().min(1, "RT harus diisi").optional(),
            rw: z.string().min(1, "RW harus diisi").optional(),
          })
          .optional(),
      })
      .optional(),
    telecom: z
      .array(
        z.object({
          system: z.string(),
          value: z.string(),
          use: z.string(),
        })
      )
      .optional(),
    workSchedule: z
      .array(
        z.object({
          dayOfWeek: z.number().int().min(1).max(7),
          startTime: z.string(),
          endTime: z.string(),
        })
      )
      .optional(),
  })
  .partial();

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
