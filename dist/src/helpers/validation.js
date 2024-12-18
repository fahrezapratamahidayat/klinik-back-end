"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInput = void 0;
function getValidationErrorMessage(validationResult) {
    return validationResult.error.errors[0].message === "Required" ? `${validationResult.error.errors[0].path} is required` : validationResult.error.errors[0].message;
}
const validateInput = (validationSchema, req, res) => {
    const validationResult = validationSchema.safeParse(req.body);
    if (!validationResult.success) {
        const errorMessage = getValidationErrorMessage(validationResult);
        res.status(400).json({ message: errorMessage });
        return false;
    }
    return true;
};
exports.validateInput = validateInput;
