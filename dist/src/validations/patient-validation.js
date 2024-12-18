"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientRegistrationStatusSchema = exports.createPatientRegistrationValidation = exports.createNewbornPatientValidation = exports.createPatientValidation = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createPatientValidation = zod_1.z.object({
    satuSehatId: zod_1.z.string().optional().nullable(),
    bpjsCode: zod_1.z.string().optional().nullable(),
    identifierType: zod_1.z.nativeEnum(client_1.IdentifierType),
    identifier: zod_1.z.string().optional().nullable(),
    nomorKartuKeluarga: zod_1.z.string(),
    name: zod_1.z.string().min(1, "Nama harus diisi"),
    birthDate: zod_1.z.coerce.date(),
    birthPlace: zod_1.z.string(),
    gender: zod_1.z.nativeEnum(client_1.Gender),
    multipleBirthInteger: zod_1.z.number().int().nonnegative(),
    bloodType: zod_1.z.nativeEnum(client_1.BloodType).optional().nullable(),
    education: zod_1.z.nativeEnum(client_1.Education).optional().nullable(),
    religion: zod_1.z.nativeEnum(client_1.Religion).optional().nullable(),
    address: zod_1.z.object({
        use: zod_1.z.string().optional(),
        line: zod_1.z.string().min(1, "Alamat harus diisi"),
        city: zod_1.z.string().optional(),
        postalCode: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        extension: zod_1.z.object({
            provinceCode: zod_1.z.string(),
            districtCode: zod_1.z.string(),
            subdistrictCode: zod_1.z.string(),
            villageCode: zod_1.z.string(),
            rt: zod_1.z.string().optional(),
            rw: zod_1.z.string().optional(),
        }),
    }),
    telecom: zod_1.z.array(zod_1.z.object({
        system: zod_1.z.string(),
        value: zod_1.z.string(),
        use: zod_1.z.string(),
    })),
    maritalStatus: zod_1.z.nativeEnum(client_1.MaritalStatus),
    citizenshipStatus: zod_1.z.nativeEnum(client_1.CitizenshipStatus),
    relatedPersons: zod_1.z
        .array(zod_1.z.object({
        relationType: zod_1.z.string(),
        name: zod_1.z.string(),
        gender: zod_1.z.nativeEnum(client_1.Gender),
        birthDate: zod_1.z.coerce.date(),
    }))
        .optional(),
    responsiblePersonName: zod_1.z.string(),
    responsiblePersonRelation: zod_1.z.nativeEnum(client_1.RelationshipType),
    responsiblePersonPhone: zod_1.z.string(),
    isResponsiblePersonSelf: zod_1.z.boolean().default(false),
});
exports.createNewbornPatientValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, "Nama bayi harus diisi"),
    birthDate: zod_1.z.coerce.date(),
    birthPlace: zod_1.z.string().min(1, "Tempat lahir harus diisi"),
    gender: zod_1.z.nativeEnum(client_1.Gender),
    multipleBirthInteger: zod_1.z.number().int().nonnegative().default(1),
    motherNIK: zod_1.z.string().min(16).max(16, "NIK ibu harus 16 digit"),
    address: zod_1.z.object({
        use: zod_1.z.string(),
        line: zod_1.z.string().min(1, "Alamat harus diisi"),
        city: zod_1.z.string().optional(),
        postalCode: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        extension: zod_1.z.object({
            provinceCode: zod_1.z.string(),
            districtCode: zod_1.z.string(),
            subdistrictCode: zod_1.z.string(),
            villageCode: zod_1.z.string(),
            rt: zod_1.z.string().optional(),
            rw: zod_1.z.string().optional(),
        }),
    }),
    telecom: zod_1.z
        .array(zod_1.z.object({
        system: zod_1.z.string(),
        value: zod_1.z.string(),
        use: zod_1.z.string(),
    }))
        .optional(),
    nomorKartuKeluarga: zod_1.z
        .string()
        .min(16)
        .max(16, "Nomor Kartu Keluarga harus 16 digit"),
    responsiblePersonName: zod_1.z.string().min(1, "Nama penanggung jawab harus diisi"),
    responsiblePersonRelation: zod_1.z.nativeEnum(client_1.RelationshipType),
    responsiblePersonPhone: zod_1.z
        .string()
        .min(10, "Nomor telepon penanggung jawab harus diisi"),
});
exports.createPatientRegistrationValidation = zod_1.z.object({
    patientId: zod_1.z.string({ required_error: "Pasien harus diisi" }),
    doctorId: zod_1.z.string({ required_error: "Dokter harus diisi" }),
    roomId: zod_1.z.string({ required_error: "Ruangan harus diisi" }),
    status: zod_1.z.nativeEnum(client_1.RegistrationStatus, { required_error: "Status harus diisi" }).default("draft").optional(),
    scheduleId: zod_1.z.string({ required_error: "Jadwal harus diisi" }),
    isOnline: zod_1.z.boolean({ required_error: "Online harus diisi" }),
    encounterType: zod_1.z.nativeEnum(client_1.EncounterType, { required_error: "Tipe kunjungan harus diisi" }),
});
exports.patientRegistrationStatusSchema = zod_1.z.object({
    patientRegistrationId: zod_1.z
        .string({
        required_error: "ID registrasi pasien harus diisi",
    })
        .uuid({
        message: "ID registrasi pasien harus berupa UUID",
    }),
    status: zod_1.z.nativeEnum(client_1.RegistrationStatus, { required_error: "Status harus diisi" }),
    statusEncounter: zod_1.z.nativeEnum(client_1.EncounterStatus, { required_error: "Status kunjungan harus diisi" }).optional(),
    notes: zod_1.z.string().optional(),
    performedBy: zod_1.z.string({ required_error: "Dokter harus diisi" }).optional(),
});
