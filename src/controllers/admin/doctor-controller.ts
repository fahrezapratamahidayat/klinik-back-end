import { Request, Response } from "express";
import { createDoctorValidation } from "../../validations/doctor-validation";
import { validateInput } from "../../helpers/validation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createDoctor = async (req: Request, res: Response) => {
  const {
    name,
    gender,
    birthDate,
    birthPlace,
    nip,
    nik,
    sip,
    str,
    specialization,
    status,
    address,
    telecom,
  } = req.body;
  if (!validateInput(createDoctorValidation, req, res)) return;
  try {
    const doctor = await prisma.doctor.create({
      data: {
        name,
        gender,
        birthDate: new Date(birthDate),
        birthPlace,
        nip,
        nik,
        sip,
        str,
        specialization,
        status,
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
      },
    });
    res.status(201).json({
      message: "Doctor created successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    gender,
    birthDate,
    birthPlace,
    nip,
    nik,
    sip,
    str,
    specialization,
    status,
    address,
    telecom,
  } = req.body;
  if (!validateInput(createDoctorValidation, req, res)) return;
  try {
    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        name,
        gender,
        birthDate: new Date(birthDate),
        birthPlace,
        nip,
        nik,
        sip,
        str,
        specialization,
        status,
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
      },
    });
    res.status(200).json({
      message: "Doctor updated successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteDoctor = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const doctor = await prisma.doctor.delete({
      where: { id },
    });
    if (!doctor)
      return res.status(404).json({
        message: "Doctor not found",
      });
    res.status(200).json({
      message: "Doctor deleted successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await prisma.doctor.findMany();
    if (doctors.length === 0)
      return res.status(404).json({
        message: "No doctors found",
      });
    res.status(200).json({
      message: "Doctors fetched successfully",
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        address: {
          include: {
            extension: true,
          },
        },
        telecom: {
          select: {
            id: true,
            system: true,
            use: true,
            value: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    if (!doctor)
      return res.status(404).json({
        message: "Doctor not found",
      });
    res.status(200).json({
      message: "Doctor fetched successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
