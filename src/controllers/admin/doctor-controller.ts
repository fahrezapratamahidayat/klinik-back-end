import { NextFunction, Request, Response } from "express";
import {
  Prisma,
  PrismaClient,
  TelecomSystem,
  TelecomUse,
} from "@prisma/client";
import {
  createDoctorValidation,
  updateDoctorValidation,
} from "../../validations/doctor-validation";
import { ZodError } from "zod";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const createDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createDoctorValidation.parse(req.body);
    const { address, telecom, username, email, password, confirmPassword, ...doctorInfo } = validatedData;

    // validasi email sudah terdaftar
    const checkEmail = await prisma.account.findUnique({
      where: { email },
    });
    if (checkEmail) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Email sudah terdaftar",
      });
    }
    
    // Validasi password
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Password tidak cocok",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await prisma.doctor.create({
      data: {
        ...doctorInfo,
        birthDate: new Date(doctorInfo.birthDate),
        address: {
          create: {
            ...address,
            extension: {
              create: address.extension,
            },
          },
        },
        telecom: {
          create: telecom.map((item) => ({
            system: item.system as TelecomSystem,
            use: item.use as TelecomUse,
            value: item.value,
          })),
        },
        account: {
          create: {
            type: 'DOCTOR',
            role: 'Dokter',
            isActive: doctorInfo.status === "aktif",
            username,
            email,
            password: hashedPassword,
          },
        },
      },
      include: {
        address: {
          include: {
            extension: true,
          },
        },
        telecom: true,
        account: true,
      },
    });

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Dokter berhasil dibuat",
      data: {
        id: doctor.id,
        name: doctor.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = updateDoctorValidation.parse(req.body);
    const { address, telecom, ...doctorInfo } = validatedData;

    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        ...doctorInfo,
        birthDate: doctorInfo.birthDate
          ? new Date(doctorInfo.birthDate)
          : undefined,
        address: address
          ? {
              update: {
                ...address,
                extension: address.extension
                  ? {
                      update: address.extension,
                    }
                  : undefined,
              },
            }
          : undefined,
        telecom: telecom
          ? {
              deleteMany: {},
              create: telecom.map((item) => ({
                system: item.system as TelecomSystem,
                use: item.use as TelecomUse,
                value: item.value,
              })),
            }
          : undefined,
      },
      include: {
        address: {
          include: {
            extension: true,
          },
        },
        telecom: true,
      },
    });
    res.status(200).json({
      message: "Doctor updated successfully",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctor = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const doctor = await prisma.doctor.delete({
      where: { id },
    });
    if (!doctor)
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Doctor not found",
      });
    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Doctor deleted successfully",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page
      ? parseInt(req.query.page as string)
      : undefined;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined;

    let doctors;
    let totalCount;
    let meta = {};

    const selectFields = {
      id: true,
      name: true,
      specialization: true,
      consultationFee: true,
      status: true,
      birthDate: true,
      birthPlace: true,
      gender: true,
      address: {
        select: {
          city: true,
          postalCode: true,
          country: true,
        },
      },
      telecom: {
        select: {
          system: true,
          use: true,
          value: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    };

    if (page !== undefined && limit !== undefined) {
      // Jika ada query paginasi
      const skip = (page - 1) * limit;
      [doctors, totalCount] = await Promise.all([
        prisma.doctor.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: selectFields,
        }),
        prisma.doctor.count(),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      meta = {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      };
    } else {
      // Jika tidak ada query paginasi, ambil semua data
      doctors = await prisma.doctor.findMany({
        orderBy: { createdAt: "desc" },
        select: selectFields,
      });
      totalCount = doctors.length;
    }

    if (doctors.length === 0) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Tidak ada dokter yang ditemukan",
        data: []
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Dokter berhasil diambil",
      data: doctors,
      meta: Object.keys(meta).length > 0 ? meta : undefined,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: "parameter id tidak boleh kosong",
    });
  }
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        specialization: true,
        status: true,
        bpjsCode: true,
        satuSehatId: true,
        createdAt: true,
        updatedAt: true,
        address: {
          select: {
            use: true,
            line: true,
            city: true,
            country: true,
            postalCode: true,
            extension: {
              select: {
                rt: true,
                rw: true,
                province: {
                  select: {
                    name: true,
                  },
                },
                district: {
                  select: {
                    name: true,
                  },
                },
                subdistrict: {
                  select: {
                    name: true,
                  },
                },
                village: {
                  select: {
                    name: true,
                  },
                },
              },
            },
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

    if (!doctor) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Dokter tidak ditemukan",
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Data dokter berhasil diambil",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};
