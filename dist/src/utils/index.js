"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomErrorMessage = getCustomErrorMessage;
function getCustomErrorMessage(err) {
    if (err.message === "Required") {
        return `${err.path.join(".")} harus diisi`;
    }
    return err.message;
}
