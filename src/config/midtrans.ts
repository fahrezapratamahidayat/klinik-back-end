import midtransClient from "midtrans-client";

export const createMidtransClient = () => {
  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
};

export const getMidtransTransactionStatus = (midtransOrderId: string) => {
  return new midtransClient.transaction.status(midtransOrderId);
};

export const createCoreApiClient = () => {
  return new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
};