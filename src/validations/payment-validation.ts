import { z } from "zod";

export const createPaymentSchema = z.object({
  patientRegistrationId: z.string({
    required_error: "id pendaftaran pasien wajib diisi",
  }),
  first_name: z.string({
    required_error: "Nama depan wajib diisi",
  }).max(255, "Nama depan maksimal 255 karakter"),
  last_name: z.string({
    required_error: "Nama belakang wajib diisi",
  }).max(255, "Nama belakang maksimal 255 karakter"),
  email: z.string({
    required_error: "Email wajib diisi",
  }).max(255, "Email maksimal 255 karakter").email("Format email tidak valid"),
  phone: z.string({
    required_error: "Nomor telepon wajib diisi",
  }).max(255, "Nomor telepon maksimal 255 karakter"),
});
