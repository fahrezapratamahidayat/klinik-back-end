import { MedicineCategory, MedicineForm, MedicineUnit } from "@prisma/client";
import { z } from "zod";

export const createMedicineValidation = z.object({
    name: z.string({
        required_error: "Nama obat wajib diisi",
    }).min(1, {
        message: "Nama obat minimal 1 karakter",
    }),
    genericName: z.string({
        required_error: "Nama generik obat wajib diisi",
    }).min(1).optional(),
    category: z.nativeEnum(MedicineCategory, {
        required_error: "Kategori obat wajib diisi",
    }),
    form: z.nativeEnum(MedicineForm, {
        required_error: "Form obat wajib diisi",
    }),
    unit : z.nativeEnum(MedicineUnit, {
        required_error: "Unit obat wajib diisi",
    }),
    composition: z.string().min(1).optional(),
    manufacturer: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    indication: z.string().min(1).optional(),
    contraindication: z.string().min(1).optional(),
    sideEffect: z.string().min(1).optional(),
    doseRange: z.string().min(1).optional(),
    storageMethod: z.string().min(1).optional(),
    price: z.number().min(1),
    stock: z.number().min(1),
    minimumStock: z.number().min(1),
    expiryDate: z.coerce.date({
        required_error: "Tanggal kadaluarsa obat wajib diisi",
        invalid_type_error: "Tanggal kadaluarsa obat harus berupa tanggal",
        description: "Tanggal kadaluarsa obat harus berupa tanggal",
    }),
    isActive: z.boolean().optional().default(true),
});

export const updateMedicineValidation = createMedicineValidation.partial();

