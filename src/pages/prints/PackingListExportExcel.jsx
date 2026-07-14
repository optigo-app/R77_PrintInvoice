import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import {
    apiCall,
    checkMsg,
    formatAmount,
    handleImageError,
    isObjectEmpty,
} from "../../GlobalFunctions";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import Loader from "../../components/Loader";
import "../../assets/css/prints/packingliste.css";
import Button from "../../GlobalFunctions/Button";
import { OrganizeInvoicePrintData } from "../../GlobalFunctions/OrganizeInvoicePrintData";
import { cloneDeep } from "lodash";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";
import ReactHTMLTableToExcel from "react-html-table-to-excel";

const ValueSheetExcel = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
    const [priceFlag, setPriceFlag] = useState(true);
    const [result, setResult] = useState(null);
    const [msg, setMsg] = useState("");
    const [loader, setLoader] = useState(true);
    const [imgFlag, setImgFlag] = useState(true);
    const [isImageWorking, setIsImageWorking] = useState(true);
    const [diaGroupFlag, setDiaGroupFlag] = useState(false);
    const [diamondArr, setDiamondArr] = useState([]);
    const [MetShpWise, setMetShpWise] = useState([]);
    const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
    const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);
    const [diamondDetails, setDiamondDetails] = useState([]);
    const [diamondWise, setDiamondWise] = useState([]);

    useEffect(() => {
        const sendData = async () => {
            try {
                const data = await apiCall(token, invoiceNo, printName, urls, evn, ApiVer);
                if (data?.Status === "200") {
                    let isEmpty = isObjectEmpty(data?.Data);
                    if (!isEmpty) {
                        loadData(data?.Data);
                        setLoader(false);
                    } else {
                        setLoader(false);
                        setMsg("Data Not Found");
                    }
                } else {
                    setLoader(false);
                    const err = checkMsg(data?.Message);
                    console.log(data?.Message);
                    setMsg(err);
                }
            } catch (error) {
                console.error(error);
            }
        };
        sendData();
    }, [diaGroupFlag]);

    function loadData(data) {
        let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
        data.BillPrint_Json[0].address = address;

        const datas = OrganizeDataPrint(
            data?.BillPrint_Json[0],
            data?.BillPrint_Json1,
            data?.BillPrint_Json2
        );

        let met_shp_arr = MetalShapeNameWiseArr(datas?.json2);
        setMetShpWise(met_shp_arr);
        let tot_met = 0;
        let tot_met_wt = 0;
        met_shp_arr?.forEach((e) => {
            tot_met += e?.Amount;
            tot_met_wt += e?.metalfinewt;
        });
        setNotGoldMetalTotal(tot_met);
        setNotGoldMetalWtTotal(tot_met_wt);

        let finalArr = [];
        datas?.resultArray?.forEach((a) => {
            if (a?.GroupJob === "") {
                finalArr.push(a);
            } else {
                let b = cloneDeep(a);
                let find_record = finalArr.findIndex((el) => el?.GroupJob === b?.GroupJob);
                if (find_record === -1) {
                    finalArr.push(b);
                } else {
                    if (finalArr[find_record]?.GroupJob !== finalArr[find_record]?.SrJobno) {
                        finalArr[find_record].designno = b?.designno;
                        finalArr[find_record].HUID = b?.HUID;
                        finalArr[find_record].DesignImage = b?.DesignImage;
                    }
                    finalArr[find_record].grosswt += b?.grosswt;
                    finalArr[find_record].NetWt += b?.NetWt;
                    finalArr[find_record].LossWt += b?.LossWt;
                    finalArr[find_record].TotalAmount += b?.TotalAmount;
                    finalArr[find_record].DiscountAmt += b?.DiscountAmt;
                    finalArr[find_record].UnitCost += b?.UnitCost;
                    finalArr[find_record].MakingAmount += b?.MakingAmount;
                    finalArr[find_record].OtherCharges += b?.OtherCharges;
                    finalArr[find_record].TotalDiamondHandling += b?.TotalDiamondHandling;
                    finalArr[find_record].Quantity += b?.Quantity;
                    finalArr[find_record].Wastage += b?.Wastage;
                    finalArr[find_record].totals.metal.IsPrimaryMetal += b?.totals?.metal?.IsPrimaryMetal;
                    finalArr[find_record].totals.metal.Wt += b?.totals?.metal?.Wt;
                    finalArr[find_record].totals.diamonds.Wt += b?.totals?.diamonds?.Wt;
                    finalArr[find_record].diamonds = [...finalArr[find_record]?.diamonds, ...b?.diamonds]?.flat();
                    finalArr[find_record].colorstone = [...finalArr[find_record]?.colorstone, ...b?.colorstone]?.flat();
                    if (!finalArr[find_record].metal) finalArr[find_record].metal = [];
                    if (Array.isArray(b?.metal)) finalArr[find_record].metal.push(...cloneDeep(b.metal));
                    finalArr[find_record].misc = [...finalArr[find_record]?.misc, ...b?.misc]?.flat();
                    finalArr[find_record].finding = [...finalArr[find_record]?.finding, ...b?.finding]?.flat();
                    finalArr[find_record].totals.finding.Wt += b?.totals?.finding?.Wt;
                    finalArr[find_record].totals.finding.Pcs += b?.totals?.finding?.Pcs;
                    finalArr[find_record].totals.finding.Amount += b?.totals?.finding?.Amount;
                    finalArr[find_record].totals.diamonds.Pcs += b?.totals?.diamonds?.Pcs;
                    finalArr[find_record].totals.diamonds.Amount += b?.totals?.diamonds?.Amount;
                    finalArr[find_record].totals.colorstone.Wt += b?.totals?.colorstone?.Wt;
                    finalArr[find_record].totals.colorstone.Pcs += b?.totals?.colorstone?.Pcs;
                    finalArr[find_record].totals.colorstone.Amount += b?.totals?.colorstone?.Amount;
                    finalArr[find_record].totals.misc.Wt += b?.totals?.misc?.Wt;
                    finalArr[find_record].totals.misc.allservwt += b?.totals?.misc?.allservwt;
                    finalArr[find_record].totals.misc.Pcs += b?.totals?.misc?.Pcs;
                    finalArr[find_record].totals.misc.Amount += b?.totals?.misc?.Amount;
                    finalArr[find_record].totals.metal.Amount += b?.totals?.metal?.Amount;
                    finalArr[find_record].totals.metal.IsPrimaryMetal += b?.totals?.metal?.IsPrimaryMetal;
                    finalArr[find_record].totals.metal.IsPrimaryMetal_Amount += b?.totals?.metal?.IsPrimaryMetal_Amount;
                    finalArr[find_record].totals.misc.withouthscode1_2_pcs += b?.totals?.misc?.withouthscode1_2_pcs;
                    finalArr[find_record].totals.misc.withouthscode1_2_wt += b?.totals?.misc?.withouthscode1_2_wt;
                    finalArr[find_record].totals.misc.onlyHSCODE3_amt += b?.totals?.misc?.onlyHSCODE3_amt;
                    finalArr[find_record].totals.misc.onlyIsHSCODE0_Wt += b?.totals?.misc?.onlyIsHSCODE0_Wt;
                    finalArr[find_record].totals.misc.onlyIsHSCODE0_Pcs += b?.totals?.misc?.onlyIsHSCODE0_Pcs;
                    finalArr[find_record].totals.misc.onlyIsHSCODE0_Amount += b?.totals?.misc?.onlyIsHSCODE0_Amount;
                }
            }
        });

        datas.resultArray = finalArr;

        datas?.resultArray?.forEach((e) => {
            let dia2 = [];
            e?.diamonds?.forEach((el) => {
                let findrec = dia2?.findIndex(
                    (a) =>
                        a?.ShapeName === el?.ShapeName &&
                        a?.QualityName === el?.QualityName &&
                        a?.Colorname === el?.Colorname &&
                        a?.SizeName === el?.SizeName &&
                        a?.MaterialTypeName === el?.MaterialTypeName &&
                        a?.Rate === el?.Rate
                );
                let ell = cloneDeep(el);
                if (findrec === -1) {
                    dia2.push(ell);
                } else {
                    dia2[findrec].Wt += ell?.Wt;
                    dia2[findrec].Pcs += ell?.Pcs;
                    dia2[findrec].Amount += ell?.Amount;
                }
            });
            e.diamonds = dia2;

            let clr2 = [];
            e?.colorstone?.forEach((el) => {
                let findrec = clr2?.findIndex(
                    (a) =>
                        a?.ShapeName === el?.ShapeName &&
                        a?.QualityName === el?.QualityName &&
                        a?.Colorname === el?.Colorname &&
                        a?.SizeName === el?.SizeName &&
                        a?.Rate === el?.Rate &&
                        a?.isRateOnPcs === el?.isRateOnPcs
                );
                let ell = cloneDeep(el);
                if (findrec === -1) {
                    clr2.push(ell);
                } else {
                    clr2[findrec].Wt += ell?.Wt;
                    clr2[findrec].Pcs += ell?.Pcs;
                    clr2[findrec].Amount += ell?.Amount;
                    clr2[findrec].Rate += ell?.Rate;
                }
            });
            e.colorstone = clr2;

            let misc0 = [];
            e?.misc?.forEach((el) => {
                if (el?.IsHSCOE === 0) misc0?.push(el);
            });
            e.misc = misc0;

            if (e?.GroupJob !== "") {
                e.metal = e.metal?.map((a) => ({ ...a, GroupJob: e.GroupJob }));
            }
        });

        // --- diamond summary arrays (unchanged) ---
        let diaObj = { ShapeName: "OTHERS", wtWt: 0, wtWts: 0, pcPcs: 0, pcPcss: 0, rRate: 0, rRates: 0, amtAmount: 0, amtAmounts: 0 };
        let diaonlyrndarr1 = [], diaonlyrndarr2 = [], diaonlyrndarr3 = [], diaonlyrndarr4 = [], diarndotherarr5 = [], diaonlyrndarr6 = [];

        datas?.json2?.forEach((e) => {
            if (e?.MasterManagement_DiamondStoneTypeid === 1) {
                if (e.ShapeName?.toLowerCase() === "rnd") diaonlyrndarr1.push(e);
                else diaonlyrndarr2.push(e);
            }
        });

        diaonlyrndarr1?.forEach((e) => {
            let findRecord = diaonlyrndarr3.findIndex(
                (a) => e?.StockBarcode === a?.StockBarcode && e?.ShapeName === a?.ShapeName && e?.QualityName === a?.QualityName && e?.Colorname === a?.Colorname
            );
            if (findRecord === -1) {
                let obj = { ...e }; obj.wtWt = e?.Wt; obj.pcPcs = e?.Pcs; obj.rRate = e?.Rate; obj.amtAmount = e?.Amount;
                diaonlyrndarr3.push(obj);
            } else {
                diaonlyrndarr3[findRecord].wtWt += e?.Wt; diaonlyrndarr3[findRecord].pcPcs += e?.Pcs;
                diaonlyrndarr3[findRecord].rRate += e?.Rate; diaonlyrndarr3[findRecord].amtAmount += e?.Amount;
            }
        });

        diaonlyrndarr2?.forEach((e) => {
            let findRecord = diaonlyrndarr4.findIndex(
                (a) => e?.StockBarcode === a?.StockBarcode && e?.ShapeName === a?.ShapeName && e?.QualityName === a?.QualityName && e?.Colorname === a?.Colorname
            );
            if (findRecord === -1) {
                let obj = { ...e }; obj.wtWt = e?.Wt; obj.wtWts = e?.Wt; obj.pcPcs = e?.Pcs; obj.pcPcss = e?.Pcs;
                obj.rRate = e?.Rate; obj.rRates = e?.Rate; obj.amtAmount = e?.Amount; obj.amtAmounts = e?.Amount;
                diaonlyrndarr4.push(obj);
            } else {
                diaonlyrndarr4[findRecord].wtWt += e?.Wt; diaonlyrndarr4[findRecord].wtWts += e?.Wt;
                diaonlyrndarr4[findRecord].pcPcs += e?.Pcs; diaonlyrndarr4[findRecord].pcPcss += e?.Pcs;
                diaonlyrndarr4[findRecord].rRate += e?.Rate; diaonlyrndarr4[findRecord].rRates += e?.Rate;
                diaonlyrndarr4[findRecord].amtAmount += e?.Amount; diaonlyrndarr4[findRecord].amtAmounts += e?.Amount;
            }
        });

        diaonlyrndarr4?.forEach((e) => {
            diaObj.wtWt += e?.wtWt; diaObj.wtWts += e?.wtWts; diaObj.pcPcs += e?.pcPcs; diaObj.pcPcss += e?.pcPcss;
            diaObj.rRate += e?.rRate; diaObj.rRates += e?.rRates; diaObj.amtAmount += e?.amtAmount; diaObj.amtAmounts += e?.amtAmounts;
        });

        diaonlyrndarr3?.forEach((e) => {
            let find_record = diaonlyrndarr6?.findIndex(
                (a) => e?.ShapeName === a?.ShapeName && e?.QualityName === a?.QualityName && e?.Colorname === a?.Colorname
            );
            if (find_record === -1) {
                let obj = { ...e }; obj.wtWts = e?.wtWt; obj.pcPcss = e?.pcPcs; obj.rRates = e?.rRate; obj.amtAmounts = e?.amtAmount;
                diaonlyrndarr6.push(obj);
            } else {
                diaonlyrndarr6[find_record].wtWts += e?.wtWt; diaonlyrndarr6[find_record].pcPcss += e?.pcPcs;
                diaonlyrndarr6[find_record].rRates += e?.rRate; diaonlyrndarr6[find_record].amtAmounts += e?.amtAmount;
            }
        });

        let diamondDetail = [];
        data?.BillPrint_Json2?.forEach((e) => {
            if (e?.MasterManagement_DiamondStoneTypeid === 1) {
                let findDiamond = diamondDetail?.findIndex(
                    (ele) => ele?.ShapeName === e?.ShapeName && ele?.QualityName === e?.QualityName && ele?.Colorname === e?.Colorname
                );
                if (findDiamond === -1) { diamondDetail.push(e); }
                else {
                    diamondDetail[findDiamond].Pcs += e?.Pcs;
                    diamondDetail[findDiamond].Wt += e?.Wt;
                    diamondDetail[findDiamond].Amount += e?.Amount;
                }
            }
        });

        let findRND = [], remaingDia = [];
        diamondDetail?.forEach((ele) => { if (ele?.ShapeName === "RND") findRND.push(ele); else remaingDia.push(ele); });

        const sortFn = (a, b) => {
            if (a.ShapeName !== b.ShapeName) return a.ShapeName.localeCompare(b.ShapeName);
            if (a.QualityName !== b.QualityName) return a.QualityName.localeCompare(b.QualityName);
            return a.Colorname.localeCompare(b.Colorname);
        };
        findRND.sort(sortFn); remaingDia.sort(sortFn);

        let resultArr = [];
        if (findRND?.length > 6) {
            let arr = findRND.slice(0, 6);
            let anotherArr = [...findRND.slice(6), remaingDia].flat();
            let obj = { ...anotherArr[0] };
            anotherArr?.reduce((acc, cobj) => { obj.Pcs += cobj?.Pcs; obj.Wt += cobj?.Wt; obj.Amount += cobj?.Amount; }, obj);
            obj.ShapeName = "OTHER";
            resultArr = [...arr, obj].flat();
        } else {
            let arr = [...findRND].flat();
            let smallArr = [...remaingDia.slice(0, 6 - findRND?.length)].flat();
            let largeArr = [...remaingDia.slice(6 - findRND?.length)].flat();
            let finalArr2 = [...arr, ...smallArr].flat();
            let obj = { ...largeArr[0] }; obj.Pcs = 0; obj.Wt = 0; obj.Amount = 0;
            largeArr?.reduce((acc, cobj) => { obj.Pcs += cobj?.Pcs; obj.Wt += cobj?.Wt; obj.Amount += cobj?.Amount; }, obj);
            obj.ShapeName = "OTHER";
            resultArr = [...finalArr2, obj].flat();
        }

        setDiamondDetails(resultArr);
        diarndotherarr5 = [...diaonlyrndarr6, diaObj];
        const sortedData = diarndotherarr5?.sort(customSort);
        setDiamondWise(sortedData);
        setResult(datas);
    }

    const customSort = (a, b) => {
        if (a?.ShapeName === "OTHER" && b?.ShapeName !== "OTHER") return 1;
        if (a?.ShapeName !== "OTHER" && b?.ShapeName === "OTHER") return -1;
        if (a?.QualityName < b?.QualityName) return -1;
        if (a?.QualityName > b?.QualityName) return 1;
        return a?.Colorname?.localeCompare(b?.Colorname);
    };

    // ── mergeByPurityAndMaterial (unchanged) ──────────────────────────────────
    const mergeByPurityAndMaterial = (data) => {
        const map = new Map();
        data?.forEach((item) => {
            const purity = item.MetalPurity;
            const MetalType = item.MetalType;

            const secondaryMetalQualities = [
                ...new Set((item?.metal || [])?.filter((m) => Number(m?.IsPrimaryMetal) === 0)?.map((m) => m?.QualityName)?.filter((x) => x && x.trim() !== "")),
            ].sort();
            const secondaryMetalShapes = [
                ...new Set((item?.metal || [])?.filter((m) => Number(m?.IsPrimaryMetal) === 0)?.map((m) => m?.ShapeName)?.filter((x) => x && x.trim() !== "")),
            ].sort();

            const allMaterials = [...(item.diamonds || []), ...(item.colorstone || []), ...(item.misc || [])];
            const shapeMap = new Map();
            allMaterials.forEach((mat) => {
                const shape = mat?.ShapeName || "UNKNOWN";
                const materialType = mat?.MaterialTypeName || "UNKNOWN";
                const key = mat?.MasterManagement_DiamondStoneTypeid == 1 ? `${shape}_${materialType}` : `${shape}`;
                if (!shapeMap.has(key)) {
                    shapeMap.set(key, { MasterManagement_DiamondStoneTypeName: mat?.MasterManagement_DiamondStoneTypeName || "UNKNOWN", MaterialTypeName: materialType, ShapeName: shape, Pcs: 0, Wt: 0, Amount: 0, Rate: 0 });
                }
                const group = shapeMap.get(key);
                group.Pcs += mat?.Pcs || 0; group.Wt += mat?.Wt || 0; group.Amount += mat?.Amount || 0;
                if (mat?.Wt) group.Rate += (mat?.Rate || 0) * mat.Wt;
            });
            const otherMaterials = Array.from(shapeMap.values()).map((x) => ({ ...x, Rate: x.Wt ? x.Rate / x.Wt : 0 }));
            item.otherMaterials = otherMaterials;

            const materials = allMaterials.map((x) => x.MaterialTypeName).filter((x) => x && x.trim() !== "");
            const uniqueMaterials = [...new Set(materials)].sort();

            const key = [purity, uniqueMaterials.join(","), secondaryMetalQualities.join(",")].join("_");

            if (!map.has(key)) {
                map.set(key, {
                    MetalPurity: purity, PrimaryMetalPurity: purity,
                    SecondaryMetalQualities: secondaryMetalQualities, SecondaryMetalShapes: secondaryMetalShapes,
                    MaterialTypes: uniqueMaterials,
                    DisplayName: `${secondaryMetalQualities?.length > 0
                        ? `${purity} ${MetalType} , ${secondaryMetalQualities.join(" ")}${secondaryMetalShapes?.length ? ` ${secondaryMetalShapes.join(", ")}` : ""}`
                        : `${purity} ${MetalType}`} ${uniqueMaterials.length > 0 ? " JEWELLERY STUDDED WITH " + uniqueMaterials.join(", ") : "PLAIN JEWELLERY"}`,
                    items: [],
                    total: { grosswt: 0, NetWt: 0, LossWt: 0, Quantity: 0, totalWt: 0, metalAmount: 0, diaCsPcs: 0, diaCsWt: 0, diaCsAmount: 0, findingWt: 0, findingAmount: 0, TotalAmount: 0, totalRMValue: 0, totalValueAddition: 0, perOfVA: 0 },
                });
            }

            const group = map.get(key);
            group.items.push(item);
            group.total.grosswt += item?.grosswt || 0; group.total.NetWt += item?.NetWt || 0;
            group.total.LossWt += item?.LossWt || 0; group.total.Quantity += item?.Quantity || 0;
            group.total.totalWt += (item?.NetWt || 0) + (item?.LossWt || 0);
            const metalAmount = item?.totals?.metal?.Amount || 0;
            group.total.metalAmount += metalAmount;
            const diaPcs = item?.totals?.diamonds?.Pcs ?? item?.diamonds?.reduce((s, d) => s + (d.Pcs || 0), 0) ?? 0;
            const csPcs = item?.totals?.colorstone?.Pcs ?? item?.colorstone?.reduce((s, c) => s + (c.Pcs || 0), 0) ?? 0;
            const miscPcs = item?.totals?.misc?.Pcs ?? item?.misc?.reduce((s, c) => s + (c.Pcs || 0), 0) ?? 0;
            const diaWt = item?.totals?.diamonds?.Wt ?? item?.diamonds?.reduce((s, d) => s + (d.Wt || 0), 0) ?? 0;
            const csWt = item?.totals?.colorstone?.Wt ?? item?.colorstone?.reduce((s, c) => s + (c.Wt || 0), 0) ?? 0;
            const miscWt = item?.totals?.misc?.Wt ?? item?.misc?.reduce((s, c) => s + (c.Wt || 0), 0) ?? 0;
            const diaAmt = item?.totals?.diamonds?.Amount || 0;
            const csAmt = item?.totals?.colorstone?.Amount || 0;
            const miscAmt = item?.totals?.misc?.Amount || 0;
            group.total.diaCsPcs += diaPcs + csPcs + miscPcs; group.total.diaCsWt += diaWt + csWt + miscWt;
            group.total.diaCsAmount += diaAmt + csAmt + miscAmt;
            group.total.findingWt += item?.totals?.finding?.Wt || 0; group.total.findingAmount += item?.totals?.finding?.Amount || 0;
            group.total.TotalAmount += item?.TotalAmount || 0;
            group.total.totalRMValue += diaAmt + csAmt + miscAmt + metalAmount;
            const valueAdd = (item?.OtherCharges || 0) + (item?.MakingAmount || 0) + (item?.TotalDiamondHandling || 0);
            group.total.totalValueAddition += valueAdd;
        });

        map.forEach((group) => {
            group.total.perOfVA = group.total.metalAmount > 0 ? (group.total.totalValueAddition * 100) / group.total.metalAmount : 0;
        });

        return Array.from(map.values());
    };

    // ── NEW HELPER: get diamond rows grouped by MaterialTypeName ─────────────
    /**
     * Returns an array of { label, shapeName, pcs, wt } rows — one per distinct
     * MaterialTypeName found across diamonds + colorstone + misc.
     * Rows with no MaterialTypeName are grouped under their ShapeName (for misc/cs).
     * The label shown in the "DIAMOND TYPE" column is: ShapeName / MaterialTypeName abbreviation.
     */
    // const getDiamondRowsByMaterial = (e) => {
    //     const allStones = [
    //         ...(e?.diamonds || []),
    //         ...(e?.colorstone || []),
    //         ...(e?.misc || []),
    //     ];

    //     if (allStones.length === 0) return [];

    //     // Group by MaterialTypeName (fall back to ShapeName if blank)
    //     const matMap = new Map();
    //     allStones.forEach((stone) => {
    //         const matName = stone?.MaterialTypeName?.trim()  || "";
    //         const shapeName = stone?.ShapeName || "";
    //         const key = matName;
    //         if (!matMap.has(key)) {
    //             matMap.set(key, { materialTypeName: matName, shapeName, pcs: 0, wt: 0 });
    //         }
    //         const row = matMap.get(key);
    //         row.QualityName = stone?.QualityName || "";
    //         row.Colorname = stone?.Colorname || "";
    //         row.pcs += stone?.Pcs || 0;
    //         row.wt += stone?.Wt || 0;
    //         // keep first shapeName encountered (they should be same per type)
    //         if (!row.shapeName && shapeName) row.shapeName = shapeName;
    //     });

    //     return Array.from(matMap.values());
    // };



    const getDiamondRowsByMaterial = (e) => {
        const allStones = [
            ...(e?.diamonds || []),
            ...(e?.colorstone || []),
            ...(e?.misc || []),
        ];

        if (allStones.length === 0) return [];

        const matMap = new Map();
        allStones.forEach((stone) => {
            const matName = stone?.MaterialTypeName?.trim() || "";
            const shapeName = stone?.ShapeName || "";
            const key = matName; // group key stays the same — by materialTypeName

            if (!matMap.has(key)) {
                matMap.set(key, {
                    materialTypeName: matName,
                    shapes: [],          // collect all unique shapes here
                    QualityName: stone?.QualityName || "",
                    Colorname: stone?.Colorname || "",
                    pcs: 0,
                    wt: 0,
                });
            }

            const row = matMap.get(key);
            row.pcs += stone?.Pcs || 0;
            row.wt += stone?.Wt || 0;

            // accumulate unique shapes per materialTypeName group
            if (shapeName && !row.shapes.includes(shapeName)) {
                row.shapes.push(shapeName);
            }
        });

        return Array.from(matMap.values());
    };

    const getMetalRowsByPurity = (e) => {
        const metals = e?.metal || [];
        if (metals.length === 0) return [];

        const map = new Map();
        metals.forEach((m) => {
            const purity = m?.QualityName || m?.MetalPurity || "";
            const key = purity;
            if (!map.has(key)) {
                map.set(key, { purity, wt: 0 });
            }
            map.get(key).wt += m?.Wt || 0;
        });

        return Array.from(map.values());
    };
    const MergedData = mergeByPurityAndMaterial(result?.resultArray);


    console.log("TCL: MergedData", MergedData)

    const calculateGrandTotal = (groups, exchRate = 1) => {
        return groups.reduce((acc, group) => {
            const t = group.total;
            acc.Quantity += t.Quantity; acc.grosswt += t.grosswt; acc.NetWt += t.NetWt;
            acc.LossWt += t.LossWt; acc.totalWt += t.totalWt;
            acc.metalAmount += t.metalAmount / exchRate;
            acc.diaPcs += t.diaCsPcs; acc.diaWt += t.diaCsWt;
            acc.diaAmount += t.diaCsAmount / exchRate;
            acc.totalAmount += t.totalRMValue / exchRate;
            return acc;
        }, { Quantity: 0, grosswt: 0, NetWt: 0, LossWt: 0, totalWt: 0, metalAmount: 0, diaPcs: 0, diaWt: 0, diaAmount: 0, totalAmount: 0 });
    };

    const grandTotal = calculateGrandTotal(MergedData, result?.header?.CurrencyExchRate);

    // ─── styles ──────────────────────────────────────────────────────────────
    const th = { border: "1px solid #000", padding: "4px 6px", textAlign: "center", fontWeight: "bold", fontSize: "11px" };
    const td = { border: "1px solid #000", padding: "3px 5px", textAlign: "right", fontSize: "11px" };
    const tdCenter = { border: "1px solid #000", padding: "3px 5px", textAlign: "center", fontSize: "11px" };
    const tdLeft = { border: "1px solid #000", padding: "3px 5px", textAlign: "left", fontSize: "11px" };
    const sectionHeaderTd = { border: "1px solid #000", padding: "4px 6px", textAlign: "left", fontWeight: "bold", fontSize: "11px" };
    const totalRowTd = { border: "1px solid #000", padding: "4px 6px", textAlign: "right", fontWeight: "bold", fontSize: "11px" };
    const totalRowTdCenter = { border: "1px solid #000", padding: "4px 6px", textAlign: "center", fontWeight: "bold", fontSize: "11px" };
    const grandTotalTd = { border: "1px solid #000", padding: "4px 6px", textAlign: "right", fontWeight: "bold", backgroundColor: "#e6e6e6", fontSize: "11px" };

    // vertical-align middle for merged cells
    const tdMerged = (extra = {}) => ({ border: "1px solid #000", padding: "3px 5px", fontSize: "11px", verticalAlign: "middle", ...extra });

    let srCounter = 0;

    if (result) {
        setTimeout(() => {
            const button = document.getElementById('test-table-xls-button');
              button.click();
        }, 500);
    }


    return (
        <>
            {loader ? (
                <Loader />
            ) : msg === "" ? (
                <div>
                    <ReactHTMLTableToExcel
                        id="test-table-xls-button"
                        className="download-table-xls-button btn btn-success text-black bg-success px-2 py-1 fs-5"
                        table="table-to-xls"
                        filename={`PackingList_Export`}
                        sheet={`PackingList_Export_${result?.header?.InvoiceNo}`}
                        buttonText="Download as XLS"
                    />

                    <table id="table-to-xls" style={{ width: "100%", borderCollapse: "collapse" }}>

                        {/* ── Header info rows ── */}
                        <tbody>
                            <tr>
                                <td colSpan={10} style={{ textAlign: "center", fontWeight: "bold", fontSize: "14px", padding: "6px" }}>
                                    PACKING LIST
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={4} style={{ border: "1px solid #000", textAlign: "center", padding: "4px" }}>Invoice No. &amp; Date :</td>
                                <td colSpan={3} style={{ border: "1px solid #000", textAlign: "center", padding: "4px" }}>{result?.header?.InvoiceNo}</td>
                                <td colSpan={3} style={{ border: "1px solid #000", textAlign: "center", padding: "4px" }}>{result?.header?.EntryDate}</td>
                            </tr>
                            <tr>
                                <td colSpan={5} style={{ border: "1px solid #000", verticalAlign: "top", padding: 8 }}>
                                    <div><b>To :</b>
                                    <div className="fslhJL">
                                            <b className="JL13" style={{ fontSize: "14px" }}>
                                                {result?.header?.Customercode}
                                            </b>
                                        </div>
                                        <div className="fslhJL">
                                            <span className="JL13" style={{ fontSize: "14px" }}>
                                                {result?.header?.CustName}
                                            </span>
                                        </div>
                                        {result?.header?.customerAddress1?.length > 0 ? (
                                            <div className="fslhJL">
                                                {result?.header?.customerAddress1}
                                            </div>
                                        ) : (
                                            ""
                                        )}
                                        {result?.header?.customerAddress2?.length > 0 ? (
                                            <div className="fslhJL">
                                                {result?.header?.customerAddress2}
                                            </div>
                                        ) : (
                                            ""
                                        )}
                                        {result?.header?.customerAddress3?.length > 0 ? (
                                            <div className="fslhJL">
                                                {result?.header?.customercity}-{result?.header?.PinCode}
                                            </div>
                                        ) : (
                                            ""
                                        )}
                                        <div className="fslhJL">{result?.header?.CompanyCountry}</div>
                                        <div className="fslhJL">{result?.header?.customeremail1}</div>
                                        <div className="fslhJL">
                                            Phno: {result?.header?.customermobileno}
                                        </div>
                                        <div className="fslhJL">
                                            {result?.header?.vat_cst_pan}{" "}
                                            {result?.header?.aadharno !== "" &&
                                                `| Aadhar-${result?.header?.aadharno}`}
                                        </div>
                                        {result?.header?.Cust_CST_STATE_No &&(

                                        <div className="fslhJL">
                                            {result?.header?.Cust_CST_STATE}-
                                            {result?.header?.Cust_CST_STATE_No}
                                        </div>
                                        )}


                                    </div>
                                </td>
                                <td colSpan={5} style={{ border: "1px solid #000", verticalAlign: "top", padding: 8 }}>
                                    <div><b>EXPORTER</b></div>
                                    <div>{result?.header?.companyname}</div>
                                    <div>{result?.header?.CompanyAddress}</div>
                                    <div>{result?.header?.CompanyAddress2}</div>
                                    <div>Dist : {result?.header?.CompanyCity} ({result?.header?.CompanyState})</div>
                                    <div>GSTIN : {result?.header?.Company_VAT_GST_No}</div>
                                    <div style={{ marginTop: 10 }}><b>Email: {result?.header?.CompanyEmail}</b></div>
                                </td>
                            </tr>
                        </tbody>

                        {/* ── Column headers ── */}
                        <thead>
                            <tr>
                                <th style={th}>SR</th>
                                <th style={th}>ITEM</th>
                                <th style={th}>JOB</th>
                                <th style={th}>QTY.</th>
                                <th style={th}>DIAMOND TYPE</th>
                                <th style={th}>DIAMOND PCS</th>
                                <th style={th}>DIA. WT IN CT</th>
                                <th style={th}>GOLD / SILVER PURITY</th>
                                <th style={th}>NET GOLD / SILVER WT IN GMS</th>
                                <th style={th}>TOTAL GROSS WT.</th>
                            </tr>
                        </thead>

                        <tbody>
                            {MergedData.map((group, groupIndex) => {

                                // ── section header ──
                                const sectionHeaderRow = (
                                    <tr key={`section-${groupIndex}`}>
                                        <td colSpan={10} style={sectionHeaderTd}>{group?.DisplayName}</td>
                                    </tr>
                                );

                                // ── item rows ──
                                const itemRows = group.items.map((e, i) => {
                                    srCounter += 1;
                                    const currentSr = srCounter;

                                    const diaRows = getDiamondRowsByMaterial(e);  // [{materialTypeName, shapes[], pcs, wt}, ...]
                                    const metalRows = getMetalRowsByPurity(e);       // [{purity, wt}, ...]

                                    // total sub-rows = max of the two arrays (so nothing is cut off)
                                    const totalSubRows = Math.max(diaRows.length, metalRows.length, 1);

                                    const itemLabel = [
                                        e?.designno ? e.designno : "",
                                        e?.Categoryname ? `(${e.Categoryname})` : "",
                                    ].filter(Boolean).join(" ");

                                    const jobLabel = e?.GroupJob
                                        ? `'${e.GroupJob}`
                                        : e?.SrJobno
                                            ? `'${e.SrJobno}`
                                            : "";

                                    // Build one <tr> per sub-row index
                                    return Array.from({ length: totalSubRows }).map((_, subIdx) => {
                                        const isFirst = subIdx === 0;
                                        const dRow = diaRows[subIdx] || null;   // may be undefined → blank
                                        const mRow = metalRows[subIdx] || null;   // may be undefined → blank

                                        return (
                                            <tr key={`item-${groupIndex}-${i}-${subIdx}`}>

                                                {/* ── Merged cells: only on first sub-row ── */}
                                                {isFirst && (
                                                    <>
                                                        <td rowSpan={totalSubRows} style={tdMerged({ textAlign: "center" })}>{currentSr}</td>
                                                        <td rowSpan={totalSubRows} style={tdMerged({ textAlign: "left" })}>{itemLabel}</td>
                                                        <td rowSpan={totalSubRows} style={tdMerged({ textAlign: "left" })}>{jobLabel}</td>
                                                        <td rowSpan={totalSubRows} style={tdMerged({ textAlign: "right" })}>{e?.Quantity}</td>
                                                    </>
                                                )}

                                                {/* ── DIAMOND TYPE ── */}
                                                <td style={{ ...tdCenter, textAlign: "left" }}>
                                                    {dRow
                                                        ? dRow.materialTypeName
                                                            ? `${dRow.materialTypeName} / ${dRow.shapes.join(", ")}`
                                                            : dRow.shapes.join(", ")
                                                        : ""}
                                                </td>

                                                {/* ── DIAMOND PCS ── */}
                                                <td style={{ ...td, textAlign: "right" }}>
                                                    {dRow?.pcs || ""}
                                                </td>

                                                {/* ── DIA WT IN CT ── */}
                                                <td style={td}>
                                                    {dRow?.wt ? formatAmount(dRow.wt, 3) : ""}
                                                </td>

                                                {/* ── GOLD / SILVER PURITY ── */}
                                                <td style={tdCenter}>
                                                    {mRow?.purity || ""}
                                                </td>

                                                {/* ── NET GOLD / SILVER WT IN GMS ── */}
                                                <td style={{ ...td }}>
                                                    {mRow?.wt ? formatAmount(mRow.wt, 3) : ""}
                                                </td>

                                                {/* ── TOTAL GROSS WT — only on first sub-row, spans all ── */}
                                                {isFirst && (
                                                    <td rowSpan={totalSubRows} style={tdMerged({ textAlign: "right" })}>
                                                        {formatAmount(e?.grosswt, 3)}
                                                    </td>
                                                )}

                                            </tr>
                                        );
                                    });
                                });

                                // ── group total row ──
                                const groupDiaTotalPcs = group.items.reduce((acc, e) =>
                                    acc + getDiamondRowsByMaterial(e).reduce((s, r) => s + r.pcs, 0), 0);
                                const groupDiaTotalWt = group.items.reduce((acc, e) =>
                                    acc + getDiamondRowsByMaterial(e).reduce((s, r) => s + r.wt, 0), 0);
                                const groupMetalTotalWt = group.items.reduce((acc, e) =>
                                    acc + getMetalRowsByPurity(e).reduce((s, r) => s + r.wt, 0), 0);

                                const totalRow = (
                                    <tr key={`total-${groupIndex}`}>
                                        <td colSpan={3} style={totalRowTdCenter}>TOTAL</td>
                                        <td style={totalRowTd}>{group?.total?.Quantity}</td>
                                        <td style={totalRowTd}></td>
                                        <td style={totalRowTd}>{groupDiaTotalPcs || ""}</td>
                                        <td style={totalRowTd}>{groupDiaTotalWt ? formatAmount(groupDiaTotalWt, 3) : ""}</td>
                                        <td style={totalRowTd}></td>
                                        <td style={totalRowTd}>{groupMetalTotalWt ? formatAmount(groupMetalTotalWt, 3) : ""}</td>
                                        <td style={totalRowTd}>{formatAmount(group?.total?.grosswt, 3)}</td>
                                    </tr>
                                );

                                const spacerRow = (
                                    <tr key={`spacer-${groupIndex}`}>
                                        <td colSpan={10} style={{ border: "1px solid #000", padding: "2px" }}></td>
                                    </tr>
                                );

                                return [sectionHeaderRow, ...itemRows.flat(), totalRow, spacerRow];
                            })}

                            {/* ── GRAND TOTAL ── */}
                            {(() => {
                                const grandDiaTotalPcs = MergedData.reduce((acc, group) =>
                                    acc + group.items.reduce((a, e) =>
                                        a + getDiamondRowsByMaterial(e).reduce((s, r) => s + r.pcs, 0), 0), 0);
                                const grandDiaTotalWt = MergedData.reduce((acc, group) =>
                                    acc + group.items.reduce((a, e) =>
                                        a + getDiamondRowsByMaterial(e).reduce((s, r) => s + r.wt, 0), 0), 0);
                                const grandMetalTotalWt = MergedData.reduce((acc, group) =>
                                    acc + group.items.reduce((a, e) =>
                                        a + getMetalRowsByPurity(e).reduce((s, r) => s + r.wt, 0), 0), 0);

                                return (
                                    <tr>
                                        <td colSpan={3} style={{ ...grandTotalTd, textAlign: "center" }}>TOTAL</td>
                                        <td style={grandTotalTd}>{grandTotal.Quantity}</td>
                                        <td style={grandTotalTd}></td>
                                        <td style={grandTotalTd}>{grandDiaTotalPcs || ""}</td>
                                        <td style={grandTotalTd}>{grandDiaTotalWt ? formatAmount(grandDiaTotalWt, 3) : ""}</td>
                                        <td style={grandTotalTd}></td>
                                        <td style={grandTotalTd}>{grandMetalTotalWt ? formatAmount(grandMetalTotalWt, 3) : ""}</td>
                                        <td style={grandTotalTd}>{formatAmount(grandTotal.grosswt, 3)}</td>
                                    </tr>
                                );
                            })()}
                        </tbody>

                        {/* ── Remark ── */}
                        <tbody>
                            <tr>
                                <td colSpan={10} style={{ padding: "6px", fontSize: "11px" }}>
                                    Note: {result?.header?.Remark || ""}
                                </td>
                            </tr>
                        </tbody>

                        {/* ── Footer ── */}
                        <tbody>
                            <tr>
                                <td colSpan={10} style={{ padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "20px" }}>
                                    {result?.header?.InvoiceNo || ""}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={10} style={{ padding: "6px", textAlign: "right", fontWeight: "bold", fontSize: "20px" }}>
                                    FOR {result?.header?.CompanyFullName || ""}
                                </td>
                            </tr>
                            <tr style={{ height: "80px" }}>
                                <td colSpan={10}></td>
                            </tr>
                            <tr>
                                <td colSpan={10} style={{ padding: "6px", textAlign: "right", fontWeight: "bold", fontSize: "20px" }}>
                                    AUTHORISED/PROPRIETOR
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">{msg}</p>
            )}
        </>
    );
};

export default ValueSheetExcel;