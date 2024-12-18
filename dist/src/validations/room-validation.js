"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoomValidation = exports.createRoomValidation = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.createRoomValidation = zod_1.z.object({
    use: zod_1.z
        .nativeEnum(client_1.UseRoom, { required_error: "Penggunaan ruangan harus diisi" })
        .default("usual"),
    system: zod_1.z
        .string({ required_error: "Sistem ruangan harus diisi" })
        .default("room"),
    status: zod_1.z
        .nativeEnum(client_1.RoomStatus, { required_error: "Status ruangan harus diisi" })
        .default("active"),
    operationalStatus: zod_1.z
        .nativeEnum(client_1.OperationalStatus, {
        required_error: "Status operasional harus diisi",
    })
        .default("O"),
    name: zod_1.z
        .string({ required_error: "Nama ruangan harus diisi" })
        .min(1, "Nama ruangan harus diisi"),
    alias: zod_1.z
        .string({ required_error: "Alias ruangan harus diisi" })
        .min(1, "Alias ruangan harus diisi"),
    description: zod_1.z
        .string({ required_error: "Deskripsi ruangan harus diisi" })
        .min(1, "Deskripsi ruangan harus diisi"),
    mode: zod_1.z.nativeEnum(client_1.LocationMode).default("instance"),
    type: zod_1.z.nativeEnum(client_1.LocationType).default("room"),
    serviceClassId: zod_1.z.string({
        required_error: "Kelas layanan harus diisi",
        invalid_type_error: "Kelas layanan harus diisi",
    }),
    installation: zod_1.z.nativeEnum(client_1.Installation, {
        required_error: "Instalasi harus diisi",
    }),
    physicalType: zod_1.z.nativeEnum(client_1.PhysicalType).default("ro"),
    satuSehatId: zod_1.z.string().optional(),
    availabilityExceptions: zod_1.z.string().optional(),
    longitude: zod_1.z.number().optional(),
    latitude: zod_1.z.number().optional(),
    altitude: zod_1.z.number().optional(),
    organizationId: zod_1.z.string().optional(),
    address: zod_1.z
        .object({
        use: zod_1.z.string().default("home"),
        line: zod_1.z
            .string({ required_error: "Jalan harus diisi" })
            .min(1, "Jalan harus diisi"),
        city: zod_1.z
            .string({ required_error: "Kota harus diisi" })
            .min(1, "Kota harus diisi"),
        postalCode: zod_1.z
            .string({ required_error: "Kode pos harus diisi" })
            .min(1, "Kode pos harus diisi"),
        country: zod_1.z.string().default("ID"),
        extension: zod_1.z.object({
            provinceCode: zod_1.z
                .string({ required_error: "Kode provinsi harus diisi" })
                .min(1, "Kode provinsi harus diisi"),
            districtCode: zod_1.z
                .string({ required_error: "Kode kabupaten harus diisi" })
                .min(1, "Kode kabupaten harus diisi"),
            subdistrictCode: zod_1.z
                .string({ required_error: "Kode kecamatan harus diisi" })
                .min(1, "Kode kecamatan harus diisi"),
            villageCode: zod_1.z
                .string({ required_error: "Kode desa harus diisi" })
                .min(1, "Kode desa harus diisi"),
            rt: zod_1.z.string().optional(),
            rw: zod_1.z.string().optional(),
        }),
    })
        .optional(),
    telecom: zod_1.z
        .array(zod_1.z.object({
        system: zod_1.z.nativeEnum(client_1.TelecomSystem, {
            required_error: "Sistem telekomunikasi harus diisi",
        }),
        use: zod_1.z.nativeEnum(client_1.TelecomUse, {
            required_error: "Penggunaan telekomunikasi harus diisi",
        }),
        value: zod_1.z
            .string({ required_error: "Nomor telepon/email harus diisi" })
            .min(1, "Nomor telepon/email harus diisi"),
    }))
        .optional(),
    hoursOfOperation: zod_1.z
        .array(zod_1.z.object({
        daysOfWeek: zod_1.z
            .string({ required_error: "Hari operasional harus diisi" })
            .min(1, "Hari operasional harus diisi"),
        allDay: zod_1.z.boolean(),
        openingTime: zod_1.z.string().optional(),
        closingTime: zod_1.z.string().optional(),
    }))
        .optional(),
});
exports.updateRoomValidation = zod_1.z
    .object({
    use: zod_1.z.nativeEnum(client_1.UseRoom).optional(),
    system: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.RoomStatus).optional(),
    operationalStatus: zod_1.z.nativeEnum(client_1.OperationalStatus).optional(),
    name: zod_1.z.string().min(1, "Nama ruangan harus diisi").optional(),
    alias: zod_1.z.string().min(1, "Alias ruangan harus diisi").optional(),
    description: zod_1.z.string().min(1, "Deskripsi ruangan harus diisi").optional(),
    mode: zod_1.z.nativeEnum(client_1.LocationMode).optional(),
    type: zod_1.z.nativeEnum(client_1.LocationType).optional(),
    serviceClassId: zod_1.z.string({
        invalid_type_error: "Kelas layanan harus diisi",
    }).optional(),
    installation: zod_1.z.nativeEnum(client_1.Installation).optional(),
    physicalType: zod_1.z.nativeEnum(client_1.PhysicalType).optional(),
    satuSehatId: zod_1.z.string().optional(),
    availabilityExceptions: zod_1.z.string().optional(),
    longitude: zod_1.z.number().optional(),
    latitude: zod_1.z.number().optional(),
    altitude: zod_1.z.number().optional(),
    organizationId: zod_1.z.string().optional(),
    address: zod_1.z
        .object({
        use: zod_1.z.string().optional(),
        line: zod_1.z.string().min(1, "Jalan harus diisi").optional(),
        city: zod_1.z.string().min(1, "Kota harus diisi").optional(),
        postalCode: zod_1.z.string().min(1, "Kode pos harus diisi").optional(),
        country: zod_1.z.string().optional(),
        extension: zod_1.z
            .object({
            provinceCode: zod_1.z
                .string()
                .min(1, "Kode provinsi harus diisi")
                .optional(),
            districtCode: zod_1.z
                .string()
                .min(1, "Kode kabupaten harus diisi")
                .optional(),
            subdistrictCode: zod_1.z
                .string()
                .min(1, "Kode kecamatan harus diisi")
                .optional(),
            villageCode: zod_1.z.string().min(1, "Kode desa harus diisi").optional(),
            rt: zod_1.z.string().optional(),
            rw: zod_1.z.string().optional(),
        })
            .optional(),
    })
        .optional(),
    telecom: zod_1.z
        .array(zod_1.z.object({
        system: zod_1.z.nativeEnum(client_1.TelecomSystem).optional(),
        use: zod_1.z.nativeEnum(client_1.TelecomUse).optional(),
        value: zod_1.z
            .string()
            .min(1, "Nomor telepon/email harus diisi")
            .optional(),
    }))
        .optional(),
    hoursOfOperation: zod_1.z
        .array(zod_1.z.object({
        daysOfWeek: zod_1.z
            .string()
            .min(1, "Hari operasional harus diisi")
            .optional(),
        allDay: zod_1.z.boolean().optional(),
        openingTime: zod_1.z.string().optional(),
        closingTime: zod_1.z.string().optional(),
    }))
        .optional(),
})
    .partial();
