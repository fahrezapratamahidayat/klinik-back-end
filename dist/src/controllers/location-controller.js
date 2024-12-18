"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVillage = exports.getSubdistrict = exports.getDistrict = exports.getProvince = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function toTitleCase(str) {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
const getProvince = async (req, res) => {
    try {
        const provinces = await prisma.province.findMany({
            select: {
                name: true,
                code: true
            },
            orderBy: {
                code: "asc"
            }
        });
        const formattedProvinces = provinces.map((province) => ({
            ...province,
            name: toTitleCase(province.name)
        }));
        res.status(200).json({
            status: true,
            message: "Berhasil mengambil data provinsi",
            data: formattedProvinces
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: "Gagal mengambil data provinsi",
            error: error
        });
    }
};
exports.getProvince = getProvince;
const getDistrict = async (req, res) => {
    const { provinceId } = req.params;
    if (!provinceId) {
        return res.status(400).json({
            status: false,
            statusCode: 400,
            message: "Provinsi ID is required"
        });
    }
    try {
        const districts = await prisma.district.findMany({
            where: {
                provinceCode: provinceId
            },
            select: {
                name: true,
                code: true
            },
            orderBy: {
                code: "asc"
            }
        });
        const formattedDistricts = districts.map((district) => ({
            ...district,
            name: toTitleCase(district.name)
        }));
        res.status(200).json({
            status: true,
            message: "Berhasil mengambil data kabupaten",
            data: formattedDistricts
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Gagal mengambil data kabupaten",
            error: error
        });
    }
};
exports.getDistrict = getDistrict;
const getSubdistrict = async (req, res) => {
    const { districtId } = req.params;
    if (!districtId) {
        return res.status(400).json({
            status: false,
            statusCode: 400,
            message: "Kabupaten ID is required"
        });
    }
    try {
        const subdistricts = await prisma.subdistrict.findMany({
            where: {
                districtCode: districtId
            },
            select: {
                name: true,
                code: true
            },
            orderBy: {
                code: "asc"
            }
        });
        const formattedSubdistricts = subdistricts.map((subdistrict) => ({
            ...subdistrict,
            name: toTitleCase(subdistrict.name)
        }));
        res.status(200).json({
            status: true,
            message: "Berhasil mengambil data kecamatan",
            data: formattedSubdistricts
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: "Gagal mengambil data kecamatan",
            error: error
        });
    }
};
exports.getSubdistrict = getSubdistrict;
const getVillage = async (req, res) => {
    const { subdistrictId } = req.params;
    if (!subdistrictId) {
        return res.status(400).json({
            status: false,
            statusCode: 400,
            message: "Kecamatan ID is required"
        });
    }
    try {
        const villages = await prisma.village.findMany({
            where: {
                subdistrictCode: subdistrictId
            },
            select: {
                name: true,
                code: true
            },
            orderBy: {
                code: "asc"
            }
        });
        const formattedVillages = villages.map((village) => ({
            ...village,
            name: toTitleCase(village.name)
        }));
        res.status(200).json({
            status: true,
            message: "Berhasil mengambil data desa",
            data: formattedVillages
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Gagal mengambil data desa",
            error: error
        });
    }
};
exports.getVillage = getVillage;
// export const getProvince = async (req: Request, res: Response) => {
//     try {
//         const fetchProvince = await axios.get("https://api-satusehat-stg.dto.kemkes.go.id/masterdata/v1/provinces?codes", {
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": "Bearer eZIXjMj21hmZYHULH408Z3ZNcCIR"
//             }
//         })
//         res.status(200).json({
//             status: true,
//             message: "Berhasil mengambil data provinsi",
//             data: fetchProvince.data
//         })
//     } catch (error) {
//         res.status(500).json({
//             status: false,
//             message: "Gagal mengambil data provinsi",
//             error: error
//         })
//     }
// }
// export const getDistrict = async (req: Request, res: Response) => {
//     const { provinceId } = req.params;
//     if (!provinceId) {
//         return res.status(400).json({
//             status: false,
//             message: "Provinsi ID is required"
//         });
//     }
//     try {
//         const fetchDistrict = await axios.get(`https://api-satusehat-stg.dto.kemkes.go.id/masterdata/v1/cities?province_codes=${provinceId}`, {
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": "Bearer eZIXjMj21hmZYHULH408Z3ZNcCIR"
//             }
//         })
//         res.status(200).json({
//             status: true,
//             message: "Berhasil mengambil data kabupaten",
//             data: fetchDistrict.data
//         })
//     } catch (error) {
//         res.status(500).json({
//             status: false,
//             message: "Gagal mengambil data kabupaten",
//             error: error
//         })
//     }
// }
// export const getSubdistrict = async (req: Request, res: Response) => {
//     const { districtId } = req.params;
//     if (!districtId) {
//         return res.status(400).json({
//             status: false,
//             message: "Kabupaten ID is required"
//         });
//     }
//     try {
//         const fetchSubdistrict = await axios.get(`https://api-satusehat-stg.dto.kemkes.go.id/masterdata/v1/districts?city_codes=${districtId}`, {
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": "Bearer eZIXjMj21hmZYHULH408Z3ZNcCIR"
//             }
//         })
//         res.status(200).json({
//             status: true,
//             message: "Berhasil mengambil data kecamatan",
//             data: fetchSubdistrict.data
//         })
//     } catch (error) {
//         res.status(500).json({
//             status: false,
//             message: "Gagal mengambil data kecamatan",
//             error: error
//         })
//     }
// }
// export const getVillage = async (req: Request, res: Response) => {
//     const { subdistrictId } = req.params;
//     if (!subdistrictId) {
//         return res.status(400).json({
//             status: false,
//             message: "Kecamatan ID is required"
//         });
//     }
//     try {
//         const fetchVillage = await axios.get(`https://api-satusehat-stg.dto.kemkes.go.id/masterdata/v1/villages?district_code=${subdistrictId}`, {
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": "Bearer eZIXjMj21hmZYHULH408Z3ZNcCIR"
//             }
//         })
//         res.status(200).json({
//             status: true,
//             message: "Berhasil mengambil data desa",
//             data: fetchVillage.data
//         })
//     } catch (error) {
//         res.status(500).json({
//             status: false,
//             message: "Gagal mengambil data desa",
//             error: error
//         })
//     }
// }
