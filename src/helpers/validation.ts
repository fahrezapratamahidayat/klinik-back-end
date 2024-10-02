import { SafeParseError, ZodSchema } from "zod";
import { Request, Response } from "express";

function getValidationErrorMessage(validationResult: SafeParseError<any>) {
    return validationResult.error.errors[0].message === "Required" ? `${validationResult.error.errors[0].path} is required` : validationResult.error.errors[0].message
}

export const validateInput = (validationSchema: ZodSchema, req: Request, res: Response) => {
    const validationResult = validationSchema.safeParse(req.body);
    if (!validationResult.success) {
        const errorMessage = getValidationErrorMessage(validationResult);
        res.status(400).json({ message: errorMessage });
        return false;
    }
    return true;
};