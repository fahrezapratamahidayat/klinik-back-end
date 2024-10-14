import {
  Installation,
  OperationalStatus,
  ServiceClass,
  UseRoom,
  RoomStatus,
  LocationMode,
  LocationType,
  PhysicalType,
} from "@prisma/client";
import { z } from "zod";

export const createRoomValidation = z.object({
  use: z.nativeEnum(UseRoom).default("usual"),
  system: z.string().default("room"),
  status: z.nativeEnum(RoomStatus).default("active"),
  operationalStatus: z.nativeEnum(OperationalStatus).default("O"),
  name: z.string().min(1),
  alias: z.string().optional(),
  description: z.string().optional(),
  mode: z.nativeEnum(LocationMode).default("instance"),
  type: z.nativeEnum(LocationType).default("room"),
  serviceClass: z.nativeEnum(ServiceClass),
  installation: z.nativeEnum(Installation),
  physicalType: z.nativeEnum(PhysicalType).default("ro"),
  longitude: z.number(),
  latitude: z.number(),
  altitude: z.number(),
  address: z.object({
    use: z.string(),
    line: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
    extension: z.object({
      province: z.string(),
      city: z.string(),
      district: z.string(),
      village: z.string(),
      rt: z.string(),
      rw: z.string(),
    }),
  }),
  satuSehatId: z.string().optional(),
  availabilityExceptions: z.string().optional(),
  organizationId: z.string().optional(),
  parentRoomId: z.string().optional(),
  addressId: z.string().optional(),
  hoursOfOperation: z
    .array(
      z.object({
        daysOfWeek: z.string(),
        allDay: z.boolean(),
        openingTime: z.string().optional(),
        closingTime: z.string().optional(),
      })
    )
    .optional(),
});
