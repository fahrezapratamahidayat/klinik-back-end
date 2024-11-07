import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

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