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
import { ToWords } from "to-words";

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
    const toWords = new ToWords();

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

    // ─────────────────────────────────────────────────────────────────────────
    //  DATA PART — DO NOT TOUCH
    // ─────────────────────────────────────────────────────────────────────────
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

            // const materials = allMaterials.map((x) => x.MaterialTypeName).filter((x) => x && x.trim() !== "");
            const materials = allMaterials
              .map((x) => x.MaterialTypeName || x.MasterManagement_DiamondStoneTypeName)
              .filter((x) => x && x.trim() !== "");
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

    // ─────────────────────────────────────────────────────────────────────────
    //  END DATA PART
    // ─────────────────────────────────────────────────────────────────────────

    const MergedData = mergeByPurityAndMaterial(result?.resultArray);
    console.log("TCL: MergedData", MergedData);

    const calculateGrandTotal = (groups, exchRate = 1) => {
        return groups.reduce((acc, group) => {
            const t = group.total;
            acc.Quantity += t.Quantity;
            acc.grosswt += t.grosswt;
            acc.NetWt += t.NetWt;
            acc.TotalAmount += t.TotalAmount / exchRate;
            acc.totalRMValue += t.totalRMValue / exchRate;
            return acc;
        }, { Quantity: 0, grosswt: 0, NetWt: 0, TotalAmount: 0, totalRMValue: 0 });
    };

    const grandTotal = calculateGrandTotal(MergedData, result?.header?.CurrencyExchRate || 1);

    // ─────────────────────────────────────────────────────────────────────────
    //  STYLES
    // ─────────────────────────────────────────────────────────────────────────
    const S = {
        // outer wrapper cell — no border, just padding
        cell: (extra = {}) => ({
            border: "1px solid #000",
            padding: "4px 6px",
            fontSize: "11px",
            verticalAlign: "middle",
            ...extra,
        }),
        // header cell
        th: (extra = {}) => ({
            border: "1px solid #000",
            padding: "4px 6px",
            fontSize: "11px",
            fontWeight: "bold",
            textAlign: "center",
            backgroundColor: "#f0f0f0",
            ...extra,
        }),
        // blue description text (matches image)
        blueDesc: {
            // color: "#0000cc",
            fontWeight: "bold",
            fontSize: "11px",
        },
        // HSN cell
        hsn: (extra = {}) => ({
            border: "1px solid #000",
            padding: "4px 6px",
            fontSize: "11px",
            fontWeight: "bold",
            textAlign: "left",
            verticalAlign: "middle",
            ...extra,
        }),
        // right-aligned number cell
        num: (extra = {}) => ({
            border: "1px solid #000",
            padding: "4px 6px",
            fontSize: "11px",
            textAlign: "right",
            verticalAlign: "middle",
            ...extra,
        }),
        // bold total row
        totalNum: (extra = {}) => ({
            border: "1px solid #000",
            padding: "4px 6px",
            fontSize: "11px",
            fontWeight: "bold",
            textAlign: "right",
            verticalAlign: "middle",
            borderTop: "2px solid #000",
            ...extra,
        }),
        // footer label cell (right-aligned text, no left border)
        footerLabel: (extra = {}) => ({
            border: "1px solid #000",
            padding: "4px 6px",
            fontSize: "11px",
            fontWeight: "bold",
            textAlign: "right",
            verticalAlign: "middle",
            ...extra,
        }),
        // footer value cell
        footerVal: (extra = {}) => ({
            border: "1px solid #000",
            padding: "4px 6px",
            fontSize: "11px",
            fontWeight: "bold",
            textAlign: "right",
            verticalAlign: "middle",
            ...extra,
        }),
    };

    // exchange rate shorthand
    const exchRate = result?.header?.CurrencyExchRate || 1;



    const mergeByMetalPurity = (data = []) => {
        const grouped = {};

        data.forEach((item) => {
            const purity = item?.MetalPurity || "UNKNOWN";

            if (!grouped[purity]) {
                grouped[purity] = {
                    Purity: purity,
                    NetWt: 0,
                    Loss: 0,
                    PureNetWt: 0,
                    MetalRate: 0,
                    Amount: 0

                };
            }

            const metal = item?.totals?.metal || {};

            grouped[purity].NetWt += item?.NetWt || 0;
            grouped[purity].Loss += item?.LossWt || 0;
            grouped[purity].MetalRate += metal?.Rate || 0;
            grouped[purity].PureNetWt += item?.PureNetWt || 0;
            grouped[purity].Amount += metal?.Amount || 0;
        });

        return Object.values(grouped);
    };


    const puritydata = mergeByMetalPurity(result?.resultArray)



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
                        filename={`ExportInvoiceExcerl`}
                        sheet={`ExportInvoiceExcerl_${result?.header?.InvoiceNo}`}
                        buttonText="Download as XLS"
                    />

                    <table id="table-to-xls" style={{ width: "100%", borderCollapse: "collapse", border: '1px solid #000', }}>

                        <tbody>

                            <tr>
                                <td colSpan={4} rowSpan={3} style={{ border: "1px solid #000000", padding: "6px", verticalAlign: "top" }}>
                                    <span style={{ fontSize: "14px", fontWeight: "bold", textDecoration: "underline", display: "block", marginBottom: "4px" }}>EXPORTER</span>
                                    <div> <strong style={{ fontSize: "14px", display: "block", marginBottom: "2px" }}>{result?.header?.CompanyFullName}</strong></div>
                                    <div>{result?.header?.CompanyAddress}</div>
                                    <div>{result?.header?.CompanyAddress2}</div>
                                    <div>{result?.header?.CompanyCity}, {result?.header?.CompanyCountry}</div>
                                    <div style={{ marginTop: "6px" }}><strong>Telephone No :</strong> {result?.header?.CompanyTellNo}</div>
                                    <div><strong>Email Id :</strong> {result?.header?.CompanyEmail}</div>
                                </td>
                                <td colSpan={4} style={{ border: "1px solid #000000", padding: "6px", verticalAlign: "top" }}>
                                    <span style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>Invoice No. & Date : <strong>{result?.header?.EntryDate}</strong></span>
                                    <strong>{result?.header?.InvoiceNo}</strong>
                                </td>
                                <td colSpan={4} style={{ border: "1px solid #000000", padding: "6px", verticalAlign: "top" }}>
                                    <span style={{ fontWeight: "bold", fontSize: "11px" }}>EXPORTER'S REF.</span>
                                </td>
                            </tr>

                            {/* ROW 2: Buyer's Order */}
                            <tr style={{ height: "40px" }}>
                                <td colSpan={6} style={{ border: "1px solid #000000", padding: "6px", verticalAlign: "top" }}>
                                    <span style={{ fontSize: "11px" }}>Buyer's Order No. & Date</span>
                                </td>
                            </tr>

                            {/* ROW 3: Other Reference */}
                            <tr style={{ height: "50px" }}>
                                <td colSpan={6} style={{ border: "1px solid #000000", padding: "6px", verticalAlign: "top" }}>
                                    <span style={{ fontWeight: "bold", fontSize: "11px", display: "block", marginBottom: "2px" }}>Other Reference(s)</span>
                                    <div>EDF No.</div>
                                </td>
                            </tr>

                            {/* ROW 4: Consignee vs Buyer / Ship To */}
                            <tr>
                                <td colSpan={6} style={{ border: "1px solid #000000", padding: "6px", verticalAlign: "top", height: "160px" }}>
                                    <span style={{ fontSize: "14px", fontWeight: "bold", textDecoration: "underline", display: "block", marginBottom: "4px" }}>Consignee</span>
                                    <div> <strong style={{ fontSize: "13px", display: "block", marginBottom: "2px" }}>{result?.header?.customerfirmname}</strong></div>
                                    <div>{result?.header?.customerAddress1}</div>
                                    <div>{result?.header?.customerAddress2}</div>
                                    <div>{result?.header?.customerAddress3} {result?.header?.customercity}, {result?.header?.customercountry}</div>
                                    <div style={{ marginTop: "6px" }}><strong>Telephone No :</strong> {result?.header?.customermobileno}</div>
                                    <div><strong>Email Id :</strong> {result?.header?.customeremail1}</div>
                                </td>
                                <td colSpan={6} style={{ border: "1px solid #000000", padding: "6px", verticalAlign: "top", height: "160px" }}>
                                    <span style={{ fontWeight: "bold", fontSize: "11px", display: "block", marginBottom: "4px" }}>Buyer (if other than consignee)</span>
                                    <div style={{ fontWeight: "bold", textDecoration: "underline", margin: "4px 0" }}>Ship To,</div>
                                    {result?.header?.address?.map((e, i) => (
                                        <div key={i} style={{ margin: "2px 0" }}>{e}</div>
                                    ))}
                                </td>
                            </tr>

                            {/* ROW 5: Pre-Carriage & Place of Receipt vs Country of Origin Blocks */}
                            <tr style={{ height: "45px" }}>
                                <td colSpan={3} style={{ border: "1px solid #000000", padding: "6px", verticalAlign: "top" }}>
                                    <span style={{ fontSize: "11px" }}>Pre-Carriage By</span>
                                </td>
                                <td colSpan={3} style={{ border: "1px solid #000000", padding: "6px", verticalAlign: "top" }}>
                                    <span style={{ fontSize: "11px" }}>Place of Receipt by Pre-carrier N.A.</span>
                                </td>
                                <td colSpan={3} style={{ border: "1px solid #000000", padding: "6px", verticalAlign: "middle", textAlign: "center" }}>
                                    <span>Country of Origin of Goods : <strong>India</strong></span>
                                </td>
                                <td colSpan={3} style={{ border: "1px solid #000000", padding: "6px", verticalAlign: "middle", textAlign: "center" }}>
                                    <span>Country of Final Destination : <strong>India</strong></span>
                                </td>
                            </tr>

                            {/* ROW 6: Vessel & Port vs Terms of Delivery Block */}
                            <tr style={{ height: "45px" }}>
                                <td colSpan={3} style={{ border: "1px solid #000000", padding: "6px", verticalAlign: "top" }}>
                                    <span style={{ fontSize: "11px" }}>Vessel/Flight No.</span>
                                </td>
                                <td colSpan={3} style={{ border: "1px solid #000000", padding: "6px", verticalAlign: "top" }}>
                                    <span style={{ fontSize: "11px" }}>Port of Loading</span>
                                </td>
                                <td colSpan={6} rowSpan={2} style={{ border: "1px solid #000000", padding: "6px", verticalAlign: "top" }}>
                                    <span style={{ fontSize: "11px", display: "block", marginBottom: "6px" }}>Terms of Delivery and payment : <strong>0 Days</strong></span>
                                    <div>
                                        <strong>Bank :</strong>
                                        <div style={{ paddingLeft: "10px", marginTop: "2px" }}>
                                            <strong>{result?.header?.bankname}</strong><br />
                                            {result?.header?.bankaddress}<br />
                                            <strong>IFSC :</strong> {result?.header?.rtgs_neft_ifsc}<br />
                                            <strong>A/C No. :</strong> {result?.header?.accountnumber} &nbsp;&nbsp; <strong>SWIFT CODE :</strong> {result?.header?.swiftcode}<br />
                                            <strong>AD Code :</strong>  {result?.header?.micrcode}
                                        </div>
                                    </div>
                                </td>
                            </tr>

                            {/* ROW 7: Discharge & Destination Bottom Left Ends */}
                            <tr style={{ height: "45px" }}>
                                <td colSpan={3} style={{ border: "1px solid #000000", padding: "6px", verticalAlign: "top" }}>
                                    <span style={{ fontSize: "11px" }}>Port of Discharge</span>
                                </td>
                                <td colSpan={3} style={{ border: "1px solid #000000", padding: "6px", verticalAlign: "top" }}>
                                    <span style={{ fontSize: "11px" }}>Final Destination</span>
                                    <div>India</div>
                                </td>
                            </tr>
                        </tbody>

 
                        <tbody>
                            <tr>
                                {/* Left: "One package :" label */}
                                <td
                                    colSpan={2}
                                    style={S.cell({ fontWeight: "bold", textAlign: "center", verticalAlign: "top" })}
                                >

                                    HSN CODE
                                </td>

                                {/* Centre: combined DisplayName of all groups in blue */}
                                <td
                                    colSpan={4}
                                    style={S.cell({ textAlign: "left" })}
                                >
                                    <span style={S.blueDesc}>
                                        {/* {MergedData.map((g) => g.DisplayName).join(", ")} */}
                                        One package :
                                    </span>
                                </td>

                                {/* Right header labels */}
                                <td colSpan={2} style={S.th({ borderBottom: "none" })}>
                                    TOTAL WT.<br />in Gms
                                </td>
                                <td colSpan={2} style={S.th({ borderBottom: "none" })}>QTY</td>
                                <td colSpan={1} style={S.th({ borderBottom: "none" })}>RATE</td>
                                <td colSpan={1} style={S.th({ borderBottom: "none" })}>AMOUNT US $</td>
                            </tr>
                        </tbody>



                        {/* ── MERGED GROUP ROWS ── one row per MergedData group */}
                        <tbody>
                            {MergedData.map((group, gIdx) => {
                                const exchR = result?.header?.CurrencyExchRate || 1;
                                const totalWt = group.total.NetWt;
                                const qty = group.total.Quantity;
                                const amount = group.total.TotalAmount / exchR;


                                const hsnNo = group.items?.[0]?.HSNNo || "";

                                return (
                                    <tr key={`group-${gIdx}`}>

                                        <td colSpan={2} style={S.hsn()}>
                                            {hsnNo}
                                        </td>


                                        <td colSpan={4} style={S.cell({ textAlign: "left" })}>
                                            <span style={S.blueDesc}>
                                                {group.DisplayName?.toUpperCase()}
                                            </span>
                                        </td>


                                        <td colSpan={2} style={S.num()}>
                                            {formatAmount(totalWt, 3)}
                                        </td>


                                        <td colSpan={2} style={S.num()}>
                                            {qty}
                                        </td>

                                        <td colSpan={1} style={S.num()}></td>

                                        <td colSpan={1} style={S.num()}>
                                            {amount ? formatAmount(amount, 2) : ""}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>


                        <tbody>

                            <tr>
                                <td colSpan={2} style={S.cell()} > <span style={{ fontWeight: "bold" }}>GROSS WEIGHT WITH TIN BOX</span></td>
                                <td colSpan={4} style={S.cell()}> <span style={{ fontWeight: "bold" }}> {formatAmount(grandTotal.grosswt, 3)} GM</span> </td>
                                <td colSpan={2} style={S.cell()}></td>
                                <td colSpan={2} style={S.cell()}></td>
                                <td colSpan={1} style={S.footerLabel({})}>C I F VALUE</td>
                                <td colSpan={1} style={S.footerVal({})}>
                                    {formatAmount(grandTotal.TotalAmount, 2)}
                                </td>
                            </tr>


                            <tr>

                                <td colSpan={2} style={S.cell({ fontWeight: "bold" })}>

                                </td>
                                <td colSpan={2} style={S.cell({ fontWeight: "bold" })}>

                                </td>

                                <td colSpan={4} style={S.footerLabel({ textAlign: "right" })}>

                                </td>
                                <td colSpan={2} style={S.cell()}></td>
                                <td colSpan={1} style={S.footerLabel()}> </td>
                                <td colSpan={1} style={S.footerVal()}> </td>
                            </tr>


                            <tr>
                                <td colSpan={8} style={S.cell()}></td>
                                <td colSpan={2} style={S.cell()}></td>
                                <td colSpan={1} style={S.footerLabel()}> </td>
                                <td colSpan={1} style={S.footerVal()}> </td>
                            </tr>

                            <tr>
                                <td colSpan={8} style={S.cell()}></td>
                                <td colSpan={2} style={S.cell()}></td>
                                <td colSpan={1} style={S.footerLabel({})}> </td>
                                <td colSpan={1} style={S.footerVal({})}>

                                </td>
                            </tr>
                            <tr>
                                <td colSpan={12} style={S.cell()}>
                                    <span>Amount Chargeable (in Word):</span> <span style={{ fontWeight: "bold", marginLeft: "50px" }}>{toWords.convert(+((+grandTotal.TotalAmount)?.toFixed(2)))}</span>
                                </td>

                            </tr>
                        </tbody>


                        

                        <tbody>
                            <tr>
                                <td colSpan={12} style={{ padding: "6px", fontSize: "11px", border: "1px solid #000" }}>
                                    <strong>Note:</strong> {result?.header?.Remark || ""}
                                </td>
                            </tr>


                            <tr>

                                <td colSpan={9} style={{ padding: "11px", fontSize: "10px", verticalAlign: "top", border: "1px solid #000", fontFamily: "Calibri, Arial, sans-serif" }}>
                                    <p style={{ textDecoration: "underline", fontWeight: "bold", margin: "0 0 4px 0", fontSize: "10px", color: "#000000" }}>
                                        Declaration:
                                    </p>
                                    <div
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: "normal",
                                            color: "#000000",
                                            lineHeight: "1.2",
                                            width: "50%"
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: (() => {
                                                if (!result?.header?.Declaration) return "";
                                                let cleanHtml = result.header.Declaration;
                                                cleanHtml = cleanHtml.replace(/<h[1-6]\b[^>]*>/gi, "").replace(/<\/h[1-6]>/gi, "<br/>");
                                                cleanHtml = cleanHtml.replace(/<div\b[^>]*>/gi, "").replace(/<\/div>/gi, "<br/>");
                                                cleanHtml = cleanHtml.replace(/<p\b[^>]*>/gi, "").replace(/<\/p>/gi, "<br/>");
                                                cleanHtml = cleanHtml.replace(/font-size\s*:\s*[^;"]+;?/gi, "");
                                                cleanHtml = cleanHtml.replace(/font-weight\s*:\s*[^;"]+;?/gi, "");
                                                cleanHtml = cleanHtml.replace(/<strong\b[^>]*>/gi, "").replace(/<\/strong>/gi, "");
                                                cleanHtml = cleanHtml.replace(/<b\b[^>]*>/gi, "").replace(/<\/b>/gi, "");
                                                return cleanHtml;
                                            })()
                                        }}
                                    />
                                </td>

                                <td
                                    colSpan={3}
                                    style={{
                                        border: "1px solid #000",
                                        height: "150px",
                                        verticalAlign: "top",
                                    }}
                                >
                                    <div style={{ textAlign: "right", fontWeight: "bold" }}>
                                        FOR {result?.header?.CompanyFullName || ""}
                                    </div>

                                    <div style={{ height: "100px" }}>&nbsp;</div>
                                    <div style={{ height: "100px" }}>&nbsp;</div>
                                    <div style={{ height: "100px" }}>&nbsp;</div>
                                    <div style={{ height: "100px" }}>&nbsp;</div>
                                    <div style={{ height: "100px" }}>&nbsp;</div>


                                    <div style={{ textAlign: "right", fontWeight: "bold" }}>
                                        AUTHORISED/PROPRIETOR
                                    </div>
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