import { Prisma, TelecomSystem, TelecomUse } from "@prisma/client";

interface AddressExtensionDto {
  rt: string;
  rw: string;
  province: { connect: { id: string } };
  district: { connect: { id: string } };
  subdistrict: { connect: { id: string } };
  village: { connect: { id: string } };
}

interface AddressDto {
  use: string;
  line: string;
  city: string;
  postalCode: string;
  country: string;
  extension: AddressExtensionDto;
}

interface TelecomDto {
  system: TelecomSystem;
  use: TelecomUse;
  value: string;
}

export interface CreateDoctorDto {
  bpjsCode: string;
  satuSehatId: string;
  name: string;
  specialization: string;
  status: string;
  birthDate: string;
  birthPlace: string;
  gender: string;
  address: AddressDto;
  telecom: TelecomDto[];
}

export interface UpdateDoctorDto {
  bpjsCode?: string;
  satuSehatId?: string;
  name?: string;
  specialization?: string;
  status?: string;
  birthDate?: string;
  birthPlace?: string;
  gender?: string;
  address?: Partial<AddressDto>;
  telecom?: TelecomDto[];
}