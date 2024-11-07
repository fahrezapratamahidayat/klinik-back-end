import { z } from "zod";
import { Gender, DoctorStatus } from "@prisma/client";

export const createDoctorValidation = z
  .object({
    name: z.string().min(1, "Nama harus diisi"),
    username: z
      .string({ required_error: "Username harus diisi" })
      .min(1, "Username harus diisi"),
    email: z
      .string({ required_error: "Email harus diisi" })
      .email("Email tidak valid"),
    password: z
      .string({ required_error: "Password harus diisi" })
      .min(8, "Password harus minimal 8 karakter"),
    confirmPassword: z
      .string({ required_error: "Konfirmasi password harus diisi" })
      .min(1, "Konfirmasi password harus diisi"),
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

export const updateDoctorValidation = z
  .object({
    name: z
      .string({ required_error: "Nama harus diisi" })
      .min(1, "Nama harus diisi")
      .optional(),
    gender: z
      .nativeEnum(Gender, { required_error: "Jenis kelamin harus diisi" })
      .optional(),
    birthDate: z.coerce.date().optional(),
    birthPlace: z
      .string({ required_error: "Tempat lahir harus diisi" })
      .min(1, "Tempat lahir harus diisi")
      .optional(),
    nip: z
      .string({ required_error: "NIP harus diisi" })
      .min(1, "NIP harus diisi"),
    nik: z.string().length(16, "NIK harus 16 digit").optional(),
    sip: z
      .string({ required_error: "SIP harus diisi" })
      .min(1, "SIP harus diisi")
      .optional(),
    str: z
      .string({ required_error: "STR harus diisi" })
      .min(1, "STR harus diisi")
      .optional(),
    specialization: z
      .string({ required_error: "Spesialisasi harus diisi" })
      .min(1, "Spesialisasi harus diisi")
      .optional(),
    status: z
      .nativeEnum(DoctorStatus, { required_error: "Status harus diisi" })
      .optional(),
    address: z
      .object({
        use: z
          .string()
          .min(1, "bisa di isi dengan nilai rumah/kantor/lainnya")
          .optional(),
        line: z
          .string({ required_error: "Alamat harus diisi" })
          .min(1, "Alamat harus diisi")
          .optional(),
        city: z
          .string({ required_error: "Kota harus diisi" })
          .min(1, "Kota harus diisi")
          .optional(),
        postalCode: z
          .string({ required_error: "Kode pos harus diisi" })
          .min(1, "Kode pos harus diisi")
          .optional(),
        country: z
          .string({ required_error: "Negara harus diisi" })
          .min(1, "Negara harus diisi")
          .optional(),
        extension: z
          .object({
            provinceCode: z
              .string({ required_error: "Kode provinsi harus diisi" })
              .min(1, "Kode provinsi harus diisi")
              .optional(),
            districtCode: z
              .string({ required_error: "Kode kabupaten harus diisi" })
              .min(1, "Kode kabupaten harus diisi")
              .optional(),
            subdistrictCode: z
              .string({ required_error: "Kode kecamatan harus diisi" })
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
  doctorId: z.string().uuid(),
  roomId: z.string().uuid(),
  schedules: z.array(
    z.object({
      date: z.coerce.date(),
      day: z.enum([
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
        "Minggu",
      ]),
      startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: "Format waktu tidak valid",
      }),
      endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: "Format waktu tidak valid",
      }),
      offlineQuota: z
        .number({ required_error: "Kuota Offline harus diisi" })
        .int({ message: "Kuota Offline harus berupa angka" })
        .nonnegative({ message: "Kuota Offline harus berupa angka" }),
      onlineQuota: z
        .number({ required_error: "Kuota Online harus diisi" })
        .int({ message: "Kuota Online harus berupa angka" })
        .nonnegative({ message: "Kuota Online harus berupa angka" }),
      totalQuota: z
        .number({ required_error: "Total Kuota harus diisi" })
        .int({ message: "Total Kuota harus berupa angka" })
        .nonnegative({ message: "Total Kuota harus berupa angka" }),
    })
  ),
});
