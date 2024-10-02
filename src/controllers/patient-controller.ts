import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import { validateInput } from "../helpers/validation";
import { createPatientValidation } from "../validations/patient-validation";
import axios from "axios";
import { logger } from "../utils/logger";
const prisma = new PrismaClient();

export const createPatient = async (req: Request, res: Response) => {
    const { nik, nama, tempatLahir, tanggalLahir, jenisKelamin, alamat, provinsi, kota, daerah, kecamatan } = req.body;

    if (!validateInput(createPatientValidation, req, res)) return

    try {
        const patient = await prisma.patient.create({
            data: {
                nik, nama, tempatLahir, tanggalLahir, jenisKelamin, alamat, provinsi, kota, daerah, kecamatan
            }   
        })

        const insertPatientToSatuSehat = await axios.post('https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1/Patient', {
            resourceType: "Patient",
            identifier: [
                {
                    use: "official",
                    system: "https://fhir.kemkes.go.id/id/nik",
                    value: nik
                }
            ],
            name: [{ text: nama }],
            birthDate: tanggalLahir,
            gender: jenisKelamin,
            address: [{
                text: alamat,
                city: kota,
                district: kecamatan,
                state: provinsi
            }]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.SATU_SEHAT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        })

        res.status(201).json({ message: "Pasien berhasil dibuat", patient, satuSehatResponse: insertPatientToSatuSehat.data })
    } catch (error: any) {
        console.error("Error saat membuat pasien:", error)
        res.status(500).json({ message: "Terjadi kesalahan saat membuat pasien", error: error.message })
    }
}

export const getPatient = async (req: Request, res: Response) => {
    const { nik } = req.params;

    try {
        const patient = await prisma.patient.findUnique({
            where: { nik }
        });

        if (!patient) {
            const satuSehatResponse = await axios.get('https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1/Patient', {
                params: {
                    identifier: `https://fhir.kemkes.go.id/id/nik|${nik}`
                },
                headers: {
                    'Authorization': `Bearer ${process.env.SATU_SEHAT_TOKEN || 'OgQ6h8LeRC0o6QvkD1z6e91dI9w2'}`,
                    'Content-Type': 'application/json'
                }
            });

            if (satuSehatResponse.data.total > 0) {
                const satuSehatPatient = satuSehatResponse.data.entry[0].resource;
                res.status(200).json({ message: "Data pasien ditemukan di SATUSEHAT", patient: satuSehatPatient });
                return;
            } else {
                res.status(404).json({ message: "Data pasien tidak ditemukan" });
                return;
            }
        }

        res.status(200).json({ message: "Data pasien ditemukan", patient });
    } catch (error: any) {
        logger.error(`Error saat mengambil pasien: ${error.message}`);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil pasien", error: error });
    }
}