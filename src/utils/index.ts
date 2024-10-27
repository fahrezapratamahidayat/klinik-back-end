import { ZodError } from "zod";

export function getCustomErrorMessage(err: ZodError["errors"][number]): string {
  if (err.message === "Required") {
    return `${err.path.join(".")} harus diisi`;
    }
    return err.message;
  }