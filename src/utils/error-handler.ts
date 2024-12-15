import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.setHeader("Content-Type", "application/json");
  if (err instanceof ZodError) {
    res.status(400).json({
      status: false,
      statusCode: 400,
      message: "Validasi gagal",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: `Data sudah ada, ${err.meta?.target}`,
        });
        break;
      case "P2000":
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: `Nilai yang diberikan terlalu panjang untuk kolom: ${err.meta?.column_name}`,
        });
        break;
      case "P2003":
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: `Constraint foreign key gagal pada field: ${err.meta?.field_name}`,
        });
        break;
      case "P2025":
        res.status(404).json({
          status: false,
          statusCode: 404,
          message: `Data tidak ditemukan, ${err.meta?.cause}`,
        });
        break;
      case "P2011":
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: `Nilai tidak boleh null pada: ${err.meta?.constraint}`,
        });
        break;
      case "P2012":
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: `Data wajib diisi pada: ${err.meta?.path}`,
        });
        break;
      default:
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: `Database error: ${err.code}`,
          details: err.meta,
        });
    }
    return;
  }

  res.status(500).json({
    status: false,
    statusCode: 500,
    message: "Terjadi kesalahan server internal",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
  return;
};
