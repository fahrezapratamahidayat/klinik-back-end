import {
  Installation,
  OperationalStatus,
  ServiceClass,
  UseRoom,
  RoomStatus,
  LocationMode,
  LocationType,
  PhysicalType,
  TelecomSystem,
  TelecomUse,
} from "@prisma/client";
import { z } from "zod";

export const createRoomValidation = z.object({
  use: z
    .nativeEnum(UseRoom, { required_error: "Penggunaan ruangan harus diisi" })
    .default("usual"),
  system: z
    .string({ required_error: "Sistem ruangan harus diisi" })
    .default("room"),
  status: z
    .nativeEnum(RoomStatus, { required_error: "Status ruangan harus diisi" })
    .default("active"),
  operationalStatus: z
    .nativeEnum(OperationalStatus, {
      required_error: "Status operasional harus diisi",
    })
    .default("O"),
  name: z
    .string({ required_error: "Nama ruangan harus diisi" })
    .min(1, "Nama ruangan harus diisi"),
  alias: z
    .string({ required_error: "Alias ruangan harus diisi" })
    .min(1, "Alias ruangan harus diisi"),
  description: z
    .string({ required_error: "Deskripsi ruangan harus diisi" })
    .min(1, "Deskripsi ruangan harus diisi"),
  mode: z.nativeEnum(LocationMode).default("instance"),
  type: z.nativeEnum(LocationType).default("room"),
  serviceClassId: z.string({
    required_error: "Kelas layanan harus diisi",
    invalid_type_error: "Kelas layanan harus diisi",
  }),
  installation: z.nativeEnum(Installation, {
    required_error: "Instalasi harus diisi",
  }),
  physicalType: z.nativeEnum(PhysicalType).default("ro"),
  satuSehatId: z.string().optional(),
  availabilityExceptions: z.string().optional(),
  longitude: z.number().optional(),
  latitude: z.number().optional(),
  altitude: z.number().optional(),
  organizationId: z.string().optional(),
  address: z
    .object({
      use: z.string().default("home"),
      line: z
        .string({ required_error: "Jalan harus diisi" })
        .min(1, "Jalan harus diisi"),
      city: z
        .string({ required_error: "Kota harus diisi" })
        .min(1, "Kota harus diisi"),
      postalCode: z
        .string({ required_error: "Kode pos harus diisi" })
        .min(1, "Kode pos harus diisi"),
      country: z.string().default("ID"),
      extension: z.object({
        provinceCode: z
          .string({ required_error: "Kode provinsi harus diisi" })
          .min(1, "Kode provinsi harus diisi"),
        districtCode: z
          .string({ required_error: "Kode kabupaten harus diisi" })
          .min(1, "Kode kabupaten harus diisi"),
        subdistrictCode: z
          .string({ required_error: "Kode kecamatan harus diisi" })
          .min(1, "Kode kecamatan harus diisi"),
        villageCode: z
          .string({ required_error: "Kode desa harus diisi" })
          .min(1, "Kode desa harus diisi"),
        rt: z.string().optional(),
        rw: z.string().optional(),
      }),
    })
    .optional(),
  telecom: z
    .array(
      z.object({
        system: z.nativeEnum(TelecomSystem, {
          required_error: "Sistem telekomunikasi harus diisi",
        }),
        use: z.nativeEnum(TelecomUse, {
          required_error: "Penggunaan telekomunikasi harus diisi",
        }),
        value: z
          .string({ required_error: "Nomor telepon/email harus diisi" })
          .min(1, "Nomor telepon/email harus diisi"),
      })
    )
    .optional(),
  hoursOfOperation: z
    .array(
      z.object({
        daysOfWeek: z
          .string({ required_error: "Hari operasional harus diisi" })
          .min(1, "Hari operasional harus diisi"),
        allDay: z.boolean(),
        openingTime: z.string().optional(),
        closingTime: z.string().optional(),
      })
    )
    .optional(),
});

export const updateRoomValidation = z
  .object({
    use: z.nativeEnum(UseRoom).optional(),
    system: z.string().optional(),
    status: z.nativeEnum(RoomStatus).optional(),
    operationalStatus: z.nativeEnum(OperationalStatus).optional(),
    name: z.string().min(1, "Nama ruangan harus diisi").optional(),
    alias: z.string().min(1, "Alias ruangan harus diisi").optional(),
    description: z.string().min(1, "Deskripsi ruangan harus diisi").optional(),
    mode: z.nativeEnum(LocationMode).optional(),
    type: z.nativeEnum(LocationType).optional(),
    serviceClassId: z.string({
      invalid_type_error: "Kelas layanan harus diisi",
    }).optional(),
    installation: z.nativeEnum(Installation).optional(),
    physicalType: z.nativeEnum(PhysicalType).optional(),
    satuSehatId: z.string().optional(),
    availabilityExceptions: z.string().optional(),
    longitude: z.number().optional(),
    latitude: z.number().optional(),
    altitude: z.number().optional(),
    organizationId: z.string().optional(),
    address: z
      .object({
        use: z.string().optional(),
        line: z.string().min(1, "Jalan harus diisi").optional(),
        city: z.string().min(1, "Kota harus diisi").optional(),
        postalCode: z.string().min(1, "Kode pos harus diisi").optional(),
        country: z.string().optional(),
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
            rt: z.string().optional(),
            rw: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    telecom: z
      .array(
        z.object({
          system: z.nativeEnum(TelecomSystem).optional(),
          use: z.nativeEnum(TelecomUse).optional(),
          value: z
            .string()
            .min(1, "Nomor telepon/email harus diisi")
            .optional(),
        })
      )
      .optional(),
    hoursOfOperation: z
      .array(
        z.object({
          daysOfWeek: z
            .string()
            .min(1, "Hari operasional harus diisi")
            .optional(),
          allDay: z.boolean().optional(),
          openingTime: z.string().optional(),
          closingTime: z.string().optional(),
        })
      )
      .optional(),
  })
  .partial();
