"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDoctorScheduleValidation = exports.updateDoctorValidation = exports.createDoctorValidation = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createDoctorValidation = zod_1.z
    .object({
    name: zod_1.z.string().min(1, "Nama harus diisi"),
    username: zod_1.z
        .string({ required_error: "Username harus diisi" })
        .min(1, "Username harus diisi"),
    email: zod_1.z
        .string({ required_error: "Email harus diisi" })
        .email("Email tidak valid"),
    password: zod_1.z
        .string({ required_error: "Password harus diisi" })
        .min(8, "Password harus minimal 8 karakter"),
    confirmPassword: zod_1.z
        .string({ required_error: "Konfirmasi password harus diisi" })
        .min(1, "Konfirmasi password harus diisi"),
    gender: zod_1.z.nativeEnum(client_1.Gender, {
        required_error: "Jenis kelamin harus diisi",
    }),
    birthDate: zod_1.z.coerce.date({
        required_error: "Tanggal lahir harus diisi",
        invalid_type_error: "Tanggal lahir harus diisi",
    }),
    birthPlace: zod_1.z
        .string({
        required_error: "Tempat lahir harus diisi",
        invalid_type_error: "Tempat lahir harus diisi",
    })
        .min(1, "Tempat lahir harus diisi"),
    nip: zod_1.z
        .string({
        required_error: "NIP harus diisi",
        invalid_type_error: "NIP harus diisi",
    })
        .min(1, "NIP harus diisi"),
    nik: zod_1.z
        .string({
        required_error: "NIK harus 16 digit",
        invalid_type_error: "NIK harus 16 digit",
    })
        .length(16, "NIK harus 16 digit"),
    sip: zod_1.z
        .string({
        required_error: "SIP harus diisi",
        invalid_type_error: "SIP harus diisi",
    })
        .min(1, "SIP harus diisi"),
    str: zod_1.z
        .string({
        required_error: "STR harus diisi",
        invalid_type_error: "STR harus diisi",
    })
        .min(1, "STR harus diisi"),
    specialization: zod_1.z
        .string({
        required_error: "Spesialisasi harus diisi",
        invalid_type_error: "Spesialisasi harus diisi",
    })
        .min(1, "Spesialisasi harus diisi"),
    consultationFee: zod_1.z.number(),
    status: zod_1.z
        .nativeEnum(client_1.DoctorStatus, {
        required_error: "Status harus diisi",
        invalid_type_error: "Status harus diisi",
    })
        .describe("Status harus diisi"),
    address: zod_1.z
        .object({
        use: zod_1.z
            .string()
            .min(1, "bisa di isi dengan nilai rumah/kantor/lainnya")
            .optional(),
        line: zod_1.z.string().min(1, "Alamat harus diisi"),
        city: zod_1.z.string().min(1, "Kota harus diisi"),
        postalCode: zod_1.z.string().min(1, "Kode pos harus diisi"),
        country: zod_1.z.string().min(1, "Negara harus diisi"),
        extension: zod_1.z.object({
            provinceCode: zod_1.z.string().min(1, "Kode provinsi harus diisi"),
            districtCode: zod_1.z.string().min(1, "Kode kabupaten harus diisi"),
            subdistrictCode: zod_1.z.string().min(1, "Kode kecamatan harus diisi"),
            villageCode: zod_1.z.string().min(1, "Kode desa harus diisi"),
            rt: zod_1.z.string().optional(),
            rw: zod_1.z.string().optional(),
        }),
    }, {
        required_error: "Alamat dokter harus diisi",
        invalid_type_error: "Alamat dokter harus diisi",
    })
        .describe("Alamat dokter harus diisi"),
    telecom: zod_1.z.array(zod_1.z.object({
        system: zod_1.z.string(),
        value: zod_1.z.string(),
        use: zod_1.z.string(),
    }), {
        required_error: "Nomor telepon harus diisi",
        invalid_type_error: "Nomor telepon harus diisi",
    }),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
});
exports.updateDoctorValidation = zod_1.z
    .object({
    name: zod_1.z
        .string({ required_error: "Nama harus diisi" })
        .min(1, "Nama harus diisi")
        .optional(),
    gender: zod_1.z
        .nativeEnum(client_1.Gender, { required_error: "Jenis kelamin harus diisi" })
        .optional(),
    birthDate: zod_1.z.coerce.date().optional(),
    birthPlace: zod_1.z
        .string({ required_error: "Tempat lahir harus diisi" })
        .min(1, "Tempat lahir harus diisi")
        .optional(),
    nip: zod_1.z
        .string({ required_error: "NIP harus diisi" })
        .min(1, "NIP harus diisi"),
    nik: zod_1.z.string().length(16, "NIK harus 16 digit").optional(),
    sip: zod_1.z
        .string({ required_error: "SIP harus diisi" })
        .min(1, "SIP harus diisi")
        .optional(),
    str: zod_1.z
        .string({ required_error: "STR harus diisi" })
        .min(1, "STR harus diisi")
        .optional(),
    specialization: zod_1.z
        .string({ required_error: "Spesialisasi harus diisi" })
        .min(1, "Spesialisasi harus diisi")
        .optional(),
    status: zod_1.z
        .nativeEnum(client_1.DoctorStatus, { required_error: "Status harus diisi" })
        .optional(),
    address: zod_1.z
        .object({
        use: zod_1.z
            .string()
            .min(1, "bisa di isi dengan nilai rumah/kantor/lainnya")
            .optional(),
        line: zod_1.z
            .string({ required_error: "Alamat harus diisi" })
            .min(1, "Alamat harus diisi")
            .optional(),
        city: zod_1.z
            .string({ required_error: "Kota harus diisi" })
            .min(1, "Kota harus diisi")
            .optional(),
        postalCode: zod_1.z
            .string({ required_error: "Kode pos harus diisi" })
            .min(1, "Kode pos harus diisi")
            .optional(),
        country: zod_1.z
            .string({ required_error: "Negara harus diisi" })
            .min(1, "Negara harus diisi")
            .optional(),
        extension: zod_1.z
            .object({
            provinceCode: zod_1.z
                .string({ required_error: "Kode provinsi harus diisi" })
                .min(1, "Kode provinsi harus diisi")
                .optional(),
            districtCode: zod_1.z
                .string({ required_error: "Kode kabupaten harus diisi" })
                .min(1, "Kode kabupaten harus diisi")
                .optional(),
            subdistrictCode: zod_1.z
                .string({ required_error: "Kode kecamatan harus diisi" })
                .min(1, "Kode kecamatan harus diisi")
                .optional(),
            villageCode: zod_1.z.string().min(1, "Kode desa harus diisi").optional(),
            rt: zod_1.z.string().min(1, "RT harus diisi").optional(),
            rw: zod_1.z.string().min(1, "RW harus diisi").optional(),
        })
            .optional(),
    })
        .optional(),
    telecom: zod_1.z
        .array(zod_1.z.object({
        system: zod_1.z.string(),
        value: zod_1.z.string(),
        use: zod_1.z.string(),
    }))
        .optional(),
})
    .partial();
exports.createDoctorScheduleValidation = zod_1.z.object({
    doctorId: zod_1.z.string().uuid(),
    roomId: zod_1.z.string().uuid(),
    schedules: zod_1.z.array(zod_1.z.object({
        date: zod_1.z.coerce.date(),
        day: zod_1.z.enum([
            "Senin",
            "Selasa",
            "Rabu",
            "Kamis",
            "Jumat",
            "Sabtu",
            "Minggu",
        ]),
        startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
            message: "Format waktu tidak valid",
        }),
        endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
            message: "Format waktu tidak valid",
        }),
        offlineQuota: zod_1.z
            .number({ required_error: "Kuota Offline harus diisi" })
            .int({ message: "Kuota Offline harus berupa angka" })
            .nonnegative({ message: "Kuota Offline harus berupa angka" }),
        onlineQuota: zod_1.z
            .number({ required_error: "Kuota Online harus diisi" })
            .int({ message: "Kuota Online harus berupa angka" })
            .nonnegative({ message: "Kuota Online harus berupa angka" }),
        totalQuota: zod_1.z
            .number({ required_error: "Total Kuota harus diisi" })
            .int({ message: "Total Kuota harus berupa angka" })
            .nonnegative({ message: "Total Kuota harus berupa angka" }),
    })),
});
