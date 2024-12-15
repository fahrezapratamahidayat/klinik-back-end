import { z } from "zod";
import {
  IdentifierType,
  Gender,
  MaritalStatus,
  CitizenshipStatus,
  BloodType,
  Education,
  Religion,
  RelationshipType,
  RegistrationStatus,
  EncounterType,
  EncounterStatus,
} from "@prisma/client";

export const createPatientValidation = z.object({
  satuSehatId: z.string().optional().nullable(),
  bpjsCode: z.string().optional().nullable(),
  identifierType: z.nativeEnum(IdentifierType),
  identifier: z.string().optional().nullable(),
  nomorKartuKeluarga: z.string(),
  name: z.string().min(1, "Nama harus diisi"),
  birthDate: z.coerce.date(),
  birthPlace: z.string(),
  gender: z.nativeEnum(Gender),
  multipleBirthInteger: z.number().int().nonnegative(),
  bloodType: z.nativeEnum(BloodType).optional().nullable(),
  education: z.nativeEnum(Education).optional().nullable(),
  religion: z.nativeEnum(Religion).optional().nullable(),
  address: z.object({
    use: z.string().optional(),
    line: z.string().min(1, "Alamat harus diisi"),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    extension: z.object({
      provinceCode: z.string(),
      districtCode: z.string(),
      subdistrictCode: z.string(),
      villageCode: z.string(),
      rt: z.string().optional(),
      rw: z.string().optional(),
    }),
  }),
  telecom: z.array(
    z.object({
      system: z.string(),
      value: z.string(),
      use: z.string(),
    })
  ),
  maritalStatus: z.nativeEnum(MaritalStatus),
  citizenshipStatus: z.nativeEnum(CitizenshipStatus),
  relatedPersons: z
    .array(
      z.object({
        relationType: z.string(),
        name: z.string(),
        gender: z.nativeEnum(Gender),
        birthDate: z.coerce.date(),
      })
    )
    .optional(),
  responsiblePersonName: z.string(),
  responsiblePersonRelation: z.nativeEnum(RelationshipType),
  responsiblePersonPhone: z.string(),
  isResponsiblePersonSelf: z.boolean().default(false),
});

export const createNewbornPatientValidation = z.object({
  name: z.string().min(1, "Nama bayi harus diisi"),
  birthDate: z.coerce.date(),
  birthPlace: z.string().min(1, "Tempat lahir harus diisi"),
  gender: z.nativeEnum(Gender),
  multipleBirthInteger: z.number().int().nonnegative().default(1),
  motherNIK: z.string().min(16).max(16, "NIK ibu harus 16 digit"),
  address: z.object({
    use: z.string(),
    line: z.string().min(1, "Alamat harus diisi"),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    extension: z.object({
      provinceCode: z.string(),
      districtCode: z.string(),
      subdistrictCode: z.string(),
      villageCode: z.string(),
      rt: z.string().optional(),
      rw: z.string().optional(),
    }),
  }),
  telecom: z
    .array(
      z.object({
        system: z.string(),
        value: z.string(),
        use: z.string(),
      })
    )
    .optional(),
  nomorKartuKeluarga: z
    .string()
    .min(16)
    .max(16, "Nomor Kartu Keluarga harus 16 digit"),
  responsiblePersonName: z.string().min(1, "Nama penanggung jawab harus diisi"),
  responsiblePersonRelation: z.nativeEnum(RelationshipType),
  responsiblePersonPhone: z
    .string()
    .min(10, "Nomor telepon penanggung jawab harus diisi"),
});


export const createPatientRegistrationValidation = z.object({
  patientId: z.string({ required_error: "Pasien harus diisi" }),
  doctorId: z.string({ required_error: "Dokter harus diisi" }),
  roomId: z.string({ required_error: "Ruangan harus diisi" }),
  status: z.nativeEnum(RegistrationStatus, { required_error: "Status harus diisi" }).default("draft").optional(),
  scheduleId: z.string({ required_error: "Jadwal harus diisi" }),
  isOnline: z.boolean({ required_error: "Online harus diisi" }),
  encounterType: z.nativeEnum(EncounterType, { required_error: "Tipe kunjungan harus diisi" }),
});


export const patientRegistrationStatusSchema = z.object({
  patientRegistrationId: z
    .string({
      required_error: "ID registrasi pasien harus diisi",
    })
    .uuid({
      message: "ID registrasi pasien harus berupa UUID",
    }),
  status: z.nativeEnum(RegistrationStatus, { required_error: "Status harus diisi" }),
  statusEncounter: z.nativeEnum(EncounterStatus, { required_error: "Status kunjungan harus diisi" }).optional(),
  notes: z.string().optional(),
  performedBy: z.string({ required_error: "Dokter harus diisi" }).optional(),
});

