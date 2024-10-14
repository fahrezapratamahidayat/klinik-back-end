import axios from "axios";
import { RequestHandler } from "express";

export const getProvince: RequestHandler = async (req, res, next) => {
    try {
        const getProvinceFromSatuSehat = await axios.get(`https://api-satusehat-stg.dto.kemkes.go.id/masterdata/v2/provinces?codes`, {
            headers: {
                Authorization: `Bearer ${process.env.SATU_SEHAT_TOKEN}`
            }
        });
        if (getProvinceFromSatuSehat.status === 200) {
            res.status(200).json(getProvinceFromSatuSehat.data);
        } else {
            res.status(500).json({ message: "Internal Server Error" });
        } 
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", detail: error });
        next(error);
    }
};

