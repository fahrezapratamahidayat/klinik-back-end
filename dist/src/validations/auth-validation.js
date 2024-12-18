"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = void 0;
const zod_1 = require("zod");
exports.loginValidation = zod_1.z.object({
    email: zod_1.z.string({
        required_error: "Email tidak boleh kosong",
        invalid_type_error: "Email tidak valid",
    }).email({
        message: "Email tidak valid",
    }),
    password: zod_1.z.string({
        message: "Password tidak boleh kosong",
    }),
});
