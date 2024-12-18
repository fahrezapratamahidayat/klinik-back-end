"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentSchema = zod_1.z.object({
    patientRegistrationId: zod_1.z.string({
        required_error: "id pendaftaran pasien wajib diisi",
    }),
    first_name: zod_1.z.string({
        required_error: "Nama depan wajib diisi",
    }).max(255, "Nama depan maksimal 255 karakter"),
    last_name: zod_1.z.string({
        required_error: "Nama belakang wajib diisi",
    }).max(255, "Nama belakang maksimal 255 karakter"),
    email: zod_1.z.string({
        required_error: "Email wajib diisi",
    }).max(255, "Email maksimal 255 karakter").email("Format email tidak valid"),
    phone: zod_1.z.string({
        required_error: "Nomor telepon wajib diisi",
    }).max(255, "Nomor telepon maksimal 255 karakter"),
});
