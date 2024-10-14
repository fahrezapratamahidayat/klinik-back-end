import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { validateInput } from "../../helpers/validation";
import { createRoomValidation } from "../../validations/room-validation";
import { generateRoomCode } from "../../utils/generate";
const prisma = new PrismaClient();

export const createRoom = async (req: Request, res: Response) => {
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
  } = req.body;

  if (!validateInput(createRoomValidation, req, res)) return;
  try {
    const roomCode = await generateRoomCode(installation);
    const room = await prisma.room.create({
      data: {
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
        address: {
          create: {
            use: address.use,
            line: address.line,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
            extension: {
              create: {
                province: address.extension.province,
                city: address.extension.city,
                district: address.extension.district,
                village: address.extension.village,
                rt: address.extension.rt,
                rw: address.extension.rw,
              },
            },
          },
        },
        telecom: {
          create: telecom,
        },
        physicalType,
        availabilityExceptions,
        HoursOfOperation: {
          create: hoursOfOperation,
        },
      },
    });
    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Room created successfully",
      data: {
        name: room.name,
        identifier: room.identifier,
      },
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
  const {
    name,
    alias,
    description,
    serviceClass,
    installation,
    operationalStatus,
    longitude,
    latitude,
  } = req.body;
  if (!validateInput(createRoomValidation, req, res)) return;
  try {
    const room = await prisma.room.update({
      where: { id },
      data: {
        name,
        alias,
        description,
        serviceClass,
        installation,
        operationalStatus,
        longitude,
        latitude,
      },
    });
    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Room updated successfully",
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
