import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { createMedicineValidation, updateMedicineValidation } from "../../validations/medicine-validation";
import { generateMedicineCode } from "../../utils/generate";

const prisma = new PrismaClient();

export const getAllMedicine = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const medicines = await prisma.medicine.findMany();
    if (medicines.length === 0) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Obat tidak ditemukan",
        data: [],
      });
    }
    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Obat ditemukan",
      data: medicines,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
      data: [],
    });
  }
};

export const getMedicineById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    if (!id) {
      res.status(400).json({
        status: false,
        statusCode: 400,
        message: "ID obat tidak ditemukan",
      });
    }
    const medicine = await prisma.medicine.findUnique({
      where: { id },
    });
    if (!medicine) {
      res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Obat tidak ditemukan",
      });
    }
    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Obat ditemukan",
      data: medicine,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

export const createMedicine = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    
    const validate = createMedicineValidation.safeParse(req.body);
    if (!validate.success) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Validasi obat gagal",
        errors: validate.error.errors.map((error) => ({
          field: error.path.join('.'),
          message: error.message,
        })),
    });
  }
  try {
    const medicineCode = await generateMedicineCode();
    const medicine = await prisma.medicine.create({
      data: {
        ...validate.data,
        code: medicineCode,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Obat berhasil ditambahkan",
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateMedicine = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const validate = updateMedicineValidation.safeParse(req.body);
    if (!validate.success) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Validasi obat gagal",
        errors: validate.error.errors.map((error) => ({
          field: error.path.join('.'),
          message: error.message,
        })),
    });
  }
  try {
    const medicine = await prisma.medicine.update({
      where: { id: req.params.id },
      data: validate.data,
    }); 
    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Obat berhasil diubah",
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
}

export const deleteMedicine = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            statusCode: 400,
            message: "ID obat tidak ditemukan",
        });
    }
    try {
        const medicine = await prisma.medicine.delete({
            where: { id },
        });
        if (!medicine) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Obat tidak ditemukan",
            });
        }
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Obat berhasil dihapus",
        });
    } catch (error: any) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
}

