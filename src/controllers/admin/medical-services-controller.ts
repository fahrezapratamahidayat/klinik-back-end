import { Request, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";

class ServiceClassController {
  // Mendapatkan semua kelas layanan
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const serviceClasses = await prisma.serviceClass.findMany();
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Data kelas layanan berhasil diambil",
        data: serviceClasses,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        statusCode: 500,
        message: "Terjadi kesalahan saat mengambil data kelas layanan",
        error,
      });
    }
  }

  // Mendapatkan kelas layanan berdasarkan ID
  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const serviceClass = await prisma.serviceClass.findUnique({
        where: { id },
      });

      if (!serviceClass) {
        res.status(404).json({
          status: false,
          statusCode: 404,  
          message: "Kelas layanan tidak ditemukan",
        });
      }

      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Data kelas layanan berhasil diambil",
        data: serviceClass,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        statusCode: 500,
        message: "Terjadi kesalahan saat mengambil data kelas layanan",
        error,
      });
    }
  }

  // Membuat kelas layanan baru
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, price } = req.body;
      const serviceClass = await prisma.serviceClass.create({
        data: {
          name,
          description,
          price: parseFloat(price),
        },
      });

      res.status(201).json({
        status: true,
        statusCode: 201,
        message: "Data kelas layanan berhasil dibuat",
        data: serviceClass,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        statusCode: 500,
        message: "Terjadi kesalahan saat membuat kelas layanan",
        error,
      });
    }
  }

  // Memperbarui kelas layanan
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, price } = req.body;

      const serviceClass = await prisma.serviceClass.update({
        where: { id },
        data: {
          name,
          description,
          price: parseFloat(price),
        },
      });

      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Data kelas layanan berhasil diperbarui",
        data: serviceClass,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        statusCode: 500,
        message: "Terjadi kesalahan saat memperbarui kelas layanan",
        error,
      });
    }
  }

  // Menghapus kelas layanan
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.serviceClass.delete({
        where: { id },
      });

      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Kelas layanan berhasil dihapus",
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        statusCode: 500,
        message: "Terjadi kesalahan saat menghapus kelas layanan",
        error,
      });
    }
  }
}

export default new ServiceClassController();
