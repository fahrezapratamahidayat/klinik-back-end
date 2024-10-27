import {
  PrismaClient,
  IdentifierType,
  Gender,
  MaritalStatus,
  CitizenshipStatus,
} from "@prisma/client";
import { Request, Response } from "express";
import { generateMedicalRecordNumber } from "../../utils/generate";
import { validateInput } from "../../helpers/validation";
import { createNewbornPatientValidation, createPatientValidation } from "../../validations/patient-validation";
import { endOfDay, parseISO, startOfDay } from "date-fns";
const prisma = new PrismaClient();

export const createPatient = async (req: Request, res: Response) => {
  try {
    const {
      identifierType,
      identifier,
      name,
      birthDate,
      birthPlace,
      gender,
      nomorKartuKeluarga,
      address,
      telecom,
      maritalStatus,
      citizenshipStatus,
      multipleBirthInteger,
      bloodType,
      education,
      religion,
      responsiblePersonName,
      responsiblePersonRelation,
      responsiblePersonPhone,
    } = req.body;

    if(!validateInput(createPatientValidation, req, res)) return;

    // Validasi data berdasarkan jenis pasien
    if (identifierType === IdentifierType.tanpa_nik) {
      if (name.length < 3 || !birthDate || !gender) {
        return res
          .status(400)
          .json({ status: false, statusCode: 400, message: "Data tidak lengkap untuk pasien tanpa NIK" });
      }
    } else if (identifierType === IdentifierType.nik) {
      if (!identifier || identifier.length !== 16) {
        return res.status(400).json({ status: false, statusCode: 400, message: "NIK tidak valid" });
      }
    } else {
      return res.status(400).json({ status: false, statusCode: 400, message: "Tipe identifier tidak valid" });
    }

    // Check if identifier already exists (hanya untuk pasien dengan NIK)
    if (identifierType === IdentifierType.nik) {
      const existingPatient = await prisma.patient.findFirst({
        where: { identifier: identifier },
      });

      if (existingPatient) {
        return res
          .status(400)
          .json({ status: false, statusCode: 400, message: "Pasien dengan NIK tersebut sudah ada" });
      }
    }
    const medicalRecordNumber = await generateMedicalRecordNumber();

    const newPatient = await prisma.patient.create({
      data: {
        medicalRecordNumber,
        identifierType,
        identifier,
        name,
        birthDate: new Date(birthDate),
        birthPlace,
        gender,
        nomorKartuKeluarga,
        maritalStatus,
        citizenshipStatus,
        multipleBirthInteger,
        responsiblePersonName,
        responsiblePersonRelation,
        responsiblePersonPhone,
        bloodType,
        education,
        religion,
        address: {
          create: {
            use: address.use,
            line: address.line,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
            extension: {
              create: {
                provinceCode: address.extension.provinceCode,
                districtCode: address.extension.districtCode,
                subdistrictCode: address.extension.subdistrictCode,
                villageCode: address.extension.villageCode,
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
      include: {
        address: {
          include: {
            extension: true,
          },
        },
        telecom: true,
        relatedPersons: true,
      },
    });

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Pasien berhasil dibuat",
      data: {
        id: newPatient.id,
      }
    });
  } catch (error) {
    console.error("Kesalahan saat membuat pasien:", error);
    res.status(500).json({status: false, statusCode: 500, message: "Terjadi kesalahan saat membuat pasien" });
  }
};

export const createNewbornPatient = async (req: Request, res: Response) => {
  try {
    const {
      name,
      birthDate,
      birthPlace,
      gender,
      multipleBirthInteger,
      motherNIK,
      address,
      telecom,
      nomorKartuKeluarga,
      responsiblePersonName,
      responsiblePersonRelation,
      responsiblePersonPhone,
    } = req.body;

    if(!validateInput(createNewbornPatientValidation, req, res)) return;

    // Cari data ibu
    const mother = await prisma.patient.findFirst({
      where: { identifier: motherNIK },
    });

    if (!mother) {
      return res.status(400).json({ message: "Data ibu tidak ditemukan" });
    }

    if (mother.gender === Gender.male) {
      return res.json({
        message: "NIK bukan seorang ibu atau wanita",
      });
    }
    const medicalRecordNumber = await generateMedicalRecordNumber();
    const newNewbornPatient = await prisma.patient.create({
      data: {
        medicalRecordNumber,
        identifierType: IdentifierType.nik_ibu,
        identifier: motherNIK,
        nomorKartuKeluarga: mother.nomorKartuKeluarga || nomorKartuKeluarga,
        name,
        birthDate: new Date(birthDate),
        birthPlace,
        gender,
        multipleBirthInteger,
        responsiblePersonName,
        responsiblePersonRelation,
        responsiblePersonPhone,
        citizenshipStatus: CitizenshipStatus.wni,
        address: {
          create: {
            use: address.use,
            line: address.line,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
            extension: {
              create: {
                provinceCode: address.extension.provinceCode,
                districtCode: address.extension.districtCode,
                subdistrictCode: address.extension.subdistrictCode,
                villageCode: address.extension.villageCode,
                rt: address.extension.rt,
                rw: address.extension.rw,
              },
            },
          },
        },
        telecom: {
          create: telecom,
        },
        relatedPersons: {
          create: {
            relationType: "MTH",
            name: mother.name,
            gender: mother.gender,
            birthDate: mother.birthDate,
            address: {
              connect: { id: mother.addressId },
            },
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
        relatedPersons: true,
      },
    });

    res.status(201).json({
      message: "Pasien bayi baru lahir berhasil dibuat",
      data: newNewbornPatient,
    });
  } catch (error) {
    console.error("Kesalahan saat membuat pasien bayi baru lahir:", error);
    res
      .status(500)
      .json({
        message: "Terjadi kesalahan saat membuat pasien bayi baru lahir",
      });
  }
};

export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    let startDate: Date;
    let endDate: Date;

    if (from) {
      startDate = startOfDay(parseISO(from as string));
      endDate = to ? endOfDay(parseISO(to as string)) : endOfDay(new Date());
    } else {
      startDate = new Date(0);
      endDate = new Date();
    }
    const patients = await prisma.patient.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        medicalRecordNumber: true,
        identifier: false,
        identifierType: true,
        name: true,
        birthDate: true,
        birthPlace: true,
        gender: true,
        address: {
          select: {
            use: true,
            line: true,
            city: true,
            postalCode: true,
            country: true,
            extension: {
              select: {
                provinceCode: false,
                districtCode: false,
                subdistrictCode: false,
                villageCode: false,
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
                rt: true,
                rw: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ createdAt: "desc" }],
    });
    if(patients.length === 0) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Tidak ada pasien yang ditemukan",
        data: [],
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Daftar semua pasien berhasil diambil",
      data: patients,
    });
  } catch (error) {
    console.error("Kesalahan saat mengambil daftar pasien:", error);
    res
      .status(500)
      .json({
        status: false,
        statusCode: 500,
        message: "Terjadi kesalahan saat mengambil daftar pasien",
      });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        address: {
          include: {
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
        telecom: true,
        relatedPersons: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Pasien tidak ditemukan",
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Data pasien ditemukan",
      data: patient,
    });
  } catch (error) {
    console.error("Kesalahan saat mencari pasien:", error);
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat mencari pasien",
    });
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.patient.delete({ where: { id } });
    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Pasien berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Kesalahan saat menghapus pasien:", error);
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan saat menghapus pasien",
      errors: error.message
    });
  }
}
