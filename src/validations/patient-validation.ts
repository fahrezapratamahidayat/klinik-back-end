import { z } from "zod";

export const createPatientValidation = z.object({
    nik: z.string(),
    nama: z.string(),
    tempatLahir: z.string(),
    tanggalLahir: z.string(),
    jenisKelamin: z.string(),
    alamat: z.string(),
    provinsi: z.string(),
    kota: z.string(),
  });
  