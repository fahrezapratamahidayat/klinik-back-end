import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { validateInput } from "../../helpers/validation";
import {
  createRoomValidation,
  updateRoomValidation,
} from "../../validations/room-validation";
import { generateRoomCode } from "../../utils/generate";
import { ZodError } from "zod";
const prisma = new PrismaClient();

function getCustomErrorMessage(err: ZodError["errors"][number]): string {
  if (err.message === "Required") {
    return `${err.path.join(".")} harus diisi`;
  }
  return err.message;
}

export const createRoom = async (req: Request, res: Response) => {
  try {
    const validatedData = createRoomValidation.parse(req.body);
    const {
      name,
      alias,
      description,
      mode,
      type,
      serviceClass,
      installation,
      operationalStatus,
      longitude,
      latitude,
      altitude,
      address,
      telecom,
      physicalType,
      availabilityExceptions,
      hoursOfOperation,
    } = validatedData;

    const roomCode = await generateRoomCode(installation);

    const roomData: any = {
      identifier: roomCode,
      name,
      alias,
      description,
      mode,
      type,
      serviceClass,
      installation,
      operationalStatus,
      longitude,
      latitude,
      altitude,
      physicalType,
      availabilityExceptions,
    };

    if (telecom && telecom.length > 0) {
      roomData.telecom = {
        create: telecom,
      };
    }

    if (hoursOfOperation && hoursOfOperation.length > 0) {
      roomData.HoursOfOperation = {
        create: hoursOfOperation,
      };
    }

    if (address) {
      roomData.address = {
        create: {
          use: address.use,
          line: address.line,
          city: address.city,
          postalCode: address.postalCode,
          country: address.country,
          extension: address.extension
            ? {
                create: {
                  provinceCode: address.extension.provinceCode,
                  districtCode: address.extension.districtCode,
                  subdistrictCode: address.extension.subdistrictCode,
                  villageCode: address.extension.villageCode,
                  rt: address.extension.rt,
                  rw: address.extension.rw,
                },
              }
            : undefined,
        },
      };
    }

    const room = await prisma.room.create({
      data: roomData,
    });

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Ruangan berhasil dibuat",
      data: {
        name: room.name,
        identifier: room.identifier,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Validasi gagal",
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: getCustomErrorMessage(err),
        })),
      });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      let errorMessage = "Terjadi kesalahan saat membuat ruangan";
      if (error.code === "P2002") {
        const target = (error.meta as { target: string[] })?.target?.[0] || "";
        const fieldName = target.split("_")[1] || "field"; // Mengambil nama field dari target
        errorMessage = `Ruangan dengan ${fieldName} yang sama sudah terdaftar. Mohon gunakan ${fieldName} yang berbeda.`;
      } else if (error.code === "P2003") {
        errorMessage =
          "Data yang direferensikan tidak ditemukan. Pastikan semua kode referensi (seperti kode provinsi, kabupaten, dll.) valid.";
      }
      res.status(400).json({
        status: false,
        statusCode: 400,
        message: errorMessage,
        errorDetail: error,
      });
    } else {
      res.status(500).json({
        status: false,
        statusCode: 500,
        message: "Terjadi kesalahan internal server",
        error:
          error instanceof Error ? error.message : "Kesalahan tidak diketahui",
      });
    }
  }
};

export const getRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany();
    if (rooms.length === 0) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "No rooms found",
        data: [],
      });
    }
    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Rooms fetched successfully",
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        address: true,
        telecom: true,
        HoursOfOperation: true,
      },
    });
    if (!room) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Room not found",
      });
    }
    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Room fetched successfully",
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const validatedData = updateRoomValidation.parse(req.body);

    const roomData: any = { ...validatedData };
    delete roomData.address;
    delete roomData.telecom;
    delete roomData.hoursOfOperation;

    if (validatedData.address) {
      roomData.address = {
        update: {
          use: validatedData.address.use,
          line: validatedData.address.line,
          city: validatedData.address.city,
          postalCode: validatedData.address.postalCode,
          country: validatedData.address.country,
          extension: validatedData.address.extension
            ? {
                update: {
                  provinceCode: validatedData.address.extension.provinceCode,
                  districtCode: validatedData.address.extension.districtCode,
                  subdistrictCode:
                    validatedData.address.extension.subdistrictCode,
                  villageCode: validatedData.address.extension.villageCode,
                  rt: validatedData.address.extension.rt,
                  rw: validatedData.address.extension.rw,
                },
              }
            : undefined,
        },
      };
    }

    if (validatedData.telecom) {
      roomData.telecom = {
        deleteMany: {},
        create: validatedData.telecom,
      };
    }

    if (validatedData.hoursOfOperation) {
      roomData.HoursOfOperation = {
        deleteMany: {},
        create: validatedData.hoursOfOperation,
      };
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: roomData,
      include: {
        address: {
          include: {
            extension: true,
          },
        },
        telecom: true,
        HoursOfOperation: true,
      },
    });

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Ruangan berhasil diperbarui",
      data: updatedRoom,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Validasi gagal",
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: getCustomErrorMessage(err),
        })),
      });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      let errorMessage = "Terjadi kesalahan saat memperbarui ruangan";
      if (error.code === "P2002") {
        const target = (error.meta as { target: string[] })?.target?.[0] || "";
        const fieldName = target.split("_")[1] || "field";
        errorMessage = `Ruangan dengan ${fieldName} yang sama sudah terdaftar. Mohon gunakan ${fieldName} yang berbeda.`;
      } else if (error.code === "P2003") {
        errorMessage =
          "Data yang direferensikan tidak ditemukan. Pastikan semua kode referensi (seperti kode provinsi, kabupaten, dll.) valid.";
      } else if (error.code === "P2025") {
        errorMessage = "Ruangan tidak ditemukan";
      }
      res.status(400).json({
        status: false,
        statusCode: 400,
        message: errorMessage,
        errorDetail: error,
      });
    } else {
      res.status(500).json({
        status: false,
        statusCode: 500,
        message: "Terjadi kesalahan internal server",
        error:
          error instanceof Error ? error.message : "Kesalahan tidak diketahui",
      });
    }
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const room = await prisma.room.findUnique({
      where: { id },
    });
    if (!room) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Room not found",
      });
    }
    await prisma.room.delete({
      where: { id },
    });
    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Room deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
