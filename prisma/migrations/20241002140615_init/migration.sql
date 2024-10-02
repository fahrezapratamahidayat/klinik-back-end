-- AlterTable
ALTER TABLE `user` ADD COLUMN `accessToken` VARCHAR(191) NULL,
    ADD COLUMN `bpjsRole` ENUM('Admin', 'User', 'InsuranceAgent', 'ClaimProcessor', 'FinanceOfficer', 'CustomerService', 'UnderwritingOfficer', 'ActuarialStaff', 'LegalOfficer', 'ComplianceOfficer', 'MarketingStaff', 'ProductDevelopmentStaff', 'RiskManagementOfficer', 'AuditStaff', 'HumanResourceStaff', 'ITSupport') NULL,
    ADD COLUMN `refreshToken` VARCHAR(191) NULL,
    ADD COLUMN `satuSehatRole` ENUM('Admin', 'User', 'Doctor', 'Nurse', 'Pharmacist', 'PatientRegistration', 'MedicalStaff', 'LabTechnician', 'Radiologist', 'Nutritionist', 'Physiotherapist', 'MidWife', 'Dentist', 'Psychologist', 'MedicalRecordStaff', 'EmergencyStaff', 'Anesthesiologist', 'Cardiologist', 'Pediatrician', 'Surgeon', 'PublicHealthOfficer', 'HealthEducator', 'QualityAssuranceOfficer', 'ResearchStaff', 'ITSupport') NULL;

-- CreateTable
CREATE TABLE `Patient` (
    `id` VARCHAR(191) NOT NULL,
    `nik` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `tempatLahir` VARCHAR(191) NOT NULL,
    `tanggalLahir` DATETIME(3) NOT NULL,
    `jenisKelamin` ENUM('male', 'female') NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `provinsi` VARCHAR(191) NOT NULL,
    `kota` VARCHAR(191) NOT NULL,
    `daerah` VARCHAR(191) NOT NULL,
    `Kecamatan` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Patient_nik_key`(`nik`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `user_email_key` TO `User_email_key`;
