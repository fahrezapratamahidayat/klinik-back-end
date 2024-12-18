"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCoreApiClient = exports.getMidtransTransactionStatus = exports.createMidtransClient = void 0;
const midtrans_client_1 = __importDefault(require("midtrans-client"));
const createMidtransClient = () => {
    return new midtrans_client_1.default.Snap({
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });
};
exports.createMidtransClient = createMidtransClient;
const getMidtransTransactionStatus = (midtransOrderId) => {
    return new midtrans_client_1.default.transaction.status(midtransOrderId);
};
exports.getMidtransTransactionStatus = getMidtransTransactionStatus;
const createCoreApiClient = () => {
    return new midtrans_client_1.default.CoreApi({
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });
};
exports.createCoreApiClient = createCoreApiClient;
