"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMedicineValidation = exports.createMedicineValidation = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.createMedicineValidation = zod_1.z.object({
    name: zod_1.z.string({
        required_error: "Nama obat wajib diisi",
    }).min(1, {
        message: "Nama obat minimal 1 karakter",
    }),
    genericName: zod_1.z.string({
        required_error: "Nama generik obat wajib diisi",
    }).min(1).optional(),
    category: zod_1.z.nativeEnum(client_1.MedicineCategory, {
        required_error: "Kategori obat wajib diisi",
    }),
    form: zod_1.z.nativeEnum(client_1.MedicineForm, {
        required_error: "Form obat wajib diisi",
    }),
    unit: zod_1.z.nativeEnum(client_1.MedicineUnit, {
        required_error: "Unit obat wajib diisi",
    }),
    composition: zod_1.z.string().min(1).optional(),
    manufacturer: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().min(1).optional(),
    indication: zod_1.z.string().min(1).optional(),
    contraindication: zod_1.z.string().min(1).optional(),
    sideEffect: zod_1.z.string().min(1).optional(),
    doseRange: zod_1.z.string().min(1).optional(),
    storageMethod: zod_1.z.string().min(1).optional(),
    price: zod_1.z.number().min(1),
    stock: zod_1.z.number().min(1),
    minimumStock: zod_1.z.number().min(1),
    expiryDate: zod_1.z.coerce.date({
        required_error: "Tanggal kadaluarsa obat wajib diisi",
        invalid_type_error: "Tanggal kadaluarsa obat harus berupa tanggal",
        description: "Tanggal kadaluarsa obat harus berupa tanggal",
    }),
    isActive: zod_1.z.boolean().optional().default(true),
});
exports.updateMedicineValidation = exports.createMedicineValidation.partial();
