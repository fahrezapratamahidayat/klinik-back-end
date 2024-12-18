"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEncounterPatientRegistration = exports.getEncounterPatientRegistrationById = exports.getHistoryEncounter = void 0;
const client_1 = require("@prisma/client");
const generate_1 = require("../../utils/generate");
const encounter_validation_1 = require("../../validations/encounter-validation");
const prisma = new client_1.PrismaClient();
const getHistoryEncounter = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: "ID pasien tidak ditemukan",
            });
        }
        const historyEncounters = await prisma.encounter.findMany({
            where: {
                patientRegistration: {
                    patient: {
                        id: id,
                    },
                },
            },
            include: {
                patientRegistration: {
                    include: {
                        patient: {
                            select: {
                                id: true,
                                name: true,
                                medicalRecordNumber: true,
                            },
                        },
                        doctor: {
                            select: {
                                id: true,
                                name: true,
                                specialization: true,
                            },
                        },
                        room: {
                            select: {
                                id: true,
                                name: true,
                                installation: true,
                            },
                        },
                    },
                },
                anamnesis: true,
                physicalExamination: true,
                psychologicalExamination: true,
                prescriptions: true,
                encounterTimeline: true,
            },
            orderBy: {
                startDate: "asc",
            },
        });
        if (historyEncounters.length === 0) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Riwayat kunjungan pasien tidak ditemukan",
                data: [],
            });
        }
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Berhasil mengambil riwayat kunjungan pasien",
            data: historyEncounters,
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Terjadi kesalahan saat mengambil riwayat kunjungan pasien",
            error: error.message,
        });
    }
};
exports.getHistoryEncounter = getHistoryEncounter;
const getEncounterPatientRegistrationById = async (req, res) => {
    const { id } = req.params;
    const encounter = await prisma.encounter.findUnique({
        where: {
            patientRegistrationId: id,
        },
        select: {
            id: true,
            patientRegistrationId: true,
            encounterType: true,
            status: true,
            patientRegistration: {
                select: {
                    id: true,
                    registrationNumber: true,
                    registrationDate: true,
                    queueNumber: true,
                    status: true,
                    registrationType: true,
                    patient: {
                        select: {
                            id: true,
                            name: true,
                            medicalRecordNumber: true,
                        },
                    },
                    doctor: {
                        select: {
                            id: true,
                            name: true,
                            specialization: true,
                        },
                    },
                    room: {
                        select: {
                            id: true,
                            name: true,
                            installation: true,
                        },
                    },
                    createdAt: true,
                    updatedAt: true,
                },
            },
            prescriptions: {
                include: {
                    medicine: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                            form: true,
                            unit: true,
                            price: true,
                            stock: true,
                            description: true
                        }
                    }
                }
            },
            encounterTimeline: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!encounter) {
        return res.status(404).json({
            status: false,
            statusCode: 404,
            message: "Data kunjungan pasien tidak ditemukan",
        });
    }
    res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Berhasil mengambil data kunjungan pasien",
        data: encounter,
    });
};
exports.getEncounterPatientRegistrationById = getEncounterPatientRegistrationById;
const updateEncounterPatientRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const validationResult = encounter_validation_1.UpdateEncounterSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: "Data tidak valid",
                errors: validationResult.error.errors.map((error) => ({
                    path: error.path.join("."),
                    message: error.message,
                })),
            });
        }
        const validatedData = validationResult.data;
        const updatedEncounter = await prisma.encounter.update({
            where: { patientRegistrationId: id },
            data: {
                status: validatedData.status,
                endDate: validatedData.endDate
                    ? new Date(validatedData.endDate)
                    : undefined,
                treatmentPlan: validatedData.treatmentPlan,
                notes: validatedData.notes,
                anamnesis: validatedData.anamnesis
                    ? {
                        upsert: {
                            create: {
                                ...validatedData.anamnesis,
                                recordedDate: new Date(),
                                lastMenstrualPeriod: validatedData.anamnesis
                                    .lastMenstrualPeriod
                                    ? new Date(validatedData.anamnesis.lastMenstrualPeriod)
                                    : undefined,
                            },
                            update: {
                                ...validatedData.anamnesis,
                                recordedDate: new Date(),
                                lastMenstrualPeriod: validatedData.anamnesis
                                    .lastMenstrualPeriod
                                    ? new Date(validatedData.anamnesis.lastMenstrualPeriod)
                                    : undefined,
                            },
                        },
                    }
                    : undefined,
                physicalExamination: validatedData.physicalExamination
                    ? {
                        upsert: {
                            create: {
                                ...validatedData.physicalExamination,
                                effectiveDateTime: new Date(),
                            },
                            update: {
                                ...validatedData.physicalExamination,
                                effectiveDateTime: new Date(),
                            },
                        },
                    }
                    : undefined,
                psychologicalExamination: validatedData.psychologicalExamination
                    ? {
                        upsert: {
                            create: {
                                ...validatedData.psychologicalExamination,
                                effectiveDateTime: new Date(),
                            },
                            update: {
                                ...validatedData.psychologicalExamination,
                                effectiveDateTime: new Date(),
                            },
                        },
                    }
                    : undefined,
                prescriptions: {
                    deleteMany: {},
                    ...(validatedData.prescriptions &&
                        validatedData.prescriptions.length > 0
                        ? {
                            create: await Promise.all(validatedData.prescriptions.map(async (prescription) => ({
                                prescriptionNumber: await (0, generate_1.generatePrescriptionNumber)(),
                                medicineId: prescription.medicineId,
                                quantity: prescription.quantity,
                                dosage: prescription.dosage,
                                route: prescription.route,
                                frequency: prescription.frequency,
                                duration: prescription.duration,
                                notes: prescription.notes,
                                status: prescription.status,
                                dispensedAt: prescription.dispensedAt
                                    ? new Date(prescription.dispensedAt)
                                    : undefined,
                                dispensedBy: prescription.dispensedBy,
                            }))),
                        }
                        : {}),
                },
            },
            include: {
                anamnesis: true,
                physicalExamination: true,
                psychologicalExamination: true,
                prescriptions: true,
            },
        });
        if (!updatedEncounter) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Encounter tidak ditemukan",
            });
        }
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Encounter berhasil diperbarui",
            data: updatedEncounter,
        });
    }
    catch (error) {
        console.error("Kesalahan saat memperbarui encounter:", error);
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Terjadi kesalahan saat memperbarui encounter",
            error: error.message,
        });
    }
};
exports.updateEncounterPatientRegistration = updateEncounterPatientRegistration;
