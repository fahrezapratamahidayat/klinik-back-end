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
          .json({ message: "Data tidak lengkap untuk pasien tanpa NIK" });
      }
    } else if (identifierType === IdentifierType.nik) {
      if (!identifier || identifier.length !== 16) {
        return res.status(400).json({ message: "NIK tidak valid" });
      }
    } else {
      return res.status(400).json({ message: "Tipe identifier tidak valid" });
    }

    // Check if identifier already exists (hanya untuk pasien dengan NIK)
    if (identifierType === IdentifierType.nik) {
      const existingPatient = await prisma.patient.findFirst({
        where: { identifier: identifier },
      });

      if (existingPatient) {
        return res
          .status(400)
          .json({ message: "Pasien dengan NIK tersebut sudah ada" });
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
      message: "Pasien berhasil dibuat",
      data: newPatient,
    });
  } catch (error) {
    console.error("Kesalahan saat membuat pasien:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat membuat pasien" });
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
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        identifier: false,
        name: true,
        birthDate: true,
        birthPlace: true,
        gender: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      message: "Daftar semua pasien berhasil diambil",
      data: patients,
    });
  } catch (error) {
    console.error("Kesalahan saat mengambil daftar pasien:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil daftar pasien" });
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
            extension: true,
          },
        },
        telecom: true,
        relatedPersons: true,
      },
    });

    if (!patient) {
      return res.status(404).json({ message: "Pasien tidak ditemukan" });
    }

    res.status(200).json({
      message: "Data pasien ditemukan",
      data: patient,
    });
  } catch (error) {
    console.error("Kesalahan saat mencari pasien:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat mencari pasien" });
  }
};
