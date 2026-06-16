
import "../../assets/css/prints/JewelleryInvoicePrint4.css";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import {
    apiCall,
    checkMsg,
    fixedValues,
    formatAmount,
    handleImageError,
    handlePrint,
    isObjectEmpty,
    NumberWithCommas,
    taxGenrator,
} from "../../GlobalFunctions";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { ToWords } from "to-words";

import Loader from "../../components/Loader";
import { cloneDeep } from "lodash";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";

export default function JewelleryInvoicePrint4({ token, invoiceNo, printName, urls, evn, ApiVer }) {
    const [result, setResult] = useState(null);
    const [msg, setMsg] = useState("");
    const [loader, setLoader] = useState(true);
    const [diamondWise, setDiamondWise] = useState([]);
    const toWords = new ToWords();
    const [vatamtFalg, setVatamtFalg] = useState(true);

    const evname = atob(evn);
    const [MetShpWise, setMetShpWise] = useState([]);
    const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
    const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);
    const [diamondDetails, setDiamondDetails] = useState([]);
    const [taxes, setTaxes] = useState([]);


    useEffect(() => {
        const sendData = async () => {
            try {
                const data = await apiCall(
                    token,
                    invoiceNo,
                    printName,
                    urls,
                    evn,
                    ApiVer
                );

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
                    // setMsg(data?.Message);
                    const err = checkMsg(data?.Message);
                    console.log(data?.Message);
                    setMsg(err);
                }
            } catch (error) {
                console.log(error);
            }
        };
        sendData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function loadData(data) {
        // console.log("data", data);

        let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
        data.BillPrint_Json[0].address = address;

        const datas = OrganizeDataPrint(
            data?.BillPrint_Json[0],
            data?.BillPrint_Json1,
            data?.BillPrint_Json2
        );
        // let taxValue = taxGenrator(data?.BillPrint_Json[0], totals?.total);
        //       taxValue.forEach((e, i) => {
        //         totals.afterTax += +e?.amount;
        //       });

        //       setTaxes(taxValue);



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

        //grouping of jobs and isGroupJob is 1

        let finalArr = [];
        datas?.resultArray?.forEach((a) => {
            if (a?.GroupJob === "") {
                finalArr.push(a);
            } else {
                let b = cloneDeep(a);
                let find_record = finalArr.findIndex(
                    (el) => el?.GroupJob === b?.GroupJob
                );
                if (find_record === -1) {
                    finalArr.push(b);
                } else {
                    if (
                        finalArr[find_record]?.GroupJob !== finalArr[find_record]?.SrJobno
                    ) {
                        finalArr[find_record].designno = b?.designno;
                        finalArr[find_record].HUID = b?.HUID;
                        finalArr[find_record].DesignImage = b?.DesignImage; // CQ Solving PSJewels 16/01/26
                    }

                    // if (!finalArr[find_record].DesignImage && b?.DesignImage) {
                    //   finalArr[find_record].DesignImage = b?.DesignImage;
                    // }

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
                    // finalArr[find_record].diamonds_d = [...finalArr[find_record]?.diamonds ,...b?.diamonds]?.flat();
                    finalArr[find_record].diamonds = [
                        ...finalArr[find_record]?.diamonds,
                        ...b?.diamonds,
                    ]?.flat();
                    // finalArr[find_record].colorstone_d = [...finalArr[find_record]?.colorstone ,...b?.colorstone]?.flat();
                    finalArr[find_record].colorstone = [
                        ...finalArr[find_record]?.colorstone,
                        ...b?.colorstone,
                    ]?.flat();
                    // finalArr[find_record].metal_d = [...finalArr[find_record]?.metal ,...b?.metal]?.flat();

                    // CQ Was Solved 09/10/2025
                    // finalArr[find_record].metal = [
                    //   ...(finalArr[find_record]?.metal || []),
                    //   ...(b?.metal || [])
                    // ].flat();
                    if (!finalArr[find_record].metal) {
                        finalArr[find_record].metal = [];
                    }
                    if (Array.isArray(b?.metal)) {
                        finalArr[find_record].metal.push(...cloneDeep(b.metal));
                    }
                    // console.log("finalArr[find_record]?.metal", finalArr[find_record]?.metal);
                    // CQ Was Solved 09/10/2025

                    finalArr[find_record].misc = [
                        ...finalArr[find_record]?.misc,
                        ...b?.misc,
                    ]?.flat();
                    finalArr[find_record].finding = [
                        ...finalArr[find_record]?.finding,
                        ...b?.finding,
                    ]?.flat();

                    finalArr[find_record].totals.finding.Wt += b?.totals?.finding?.Wt;
                    finalArr[find_record].totals.finding.Pcs += b?.totals?.finding?.Pcs;
                    finalArr[find_record].totals.finding.Amount +=
                        b?.totals?.finding?.Amount;
                    finalArr[find_record].totals.diamonds.Pcs += b?.totals?.diamonds?.Pcs;
                    finalArr[find_record].totals.diamonds.Amount +=
                        b?.totals?.diamonds?.Amount;

                    finalArr[find_record].totals.colorstone.Wt +=
                        b?.totals?.colorstone?.Wt;
                    finalArr[find_record].totals.colorstone.Pcs +=
                        b?.totals?.colorstone?.Pcs;
                    finalArr[find_record].totals.colorstone.Amount +=
                        b?.totals?.colorstone?.Amount;

                    finalArr[find_record].totals.misc.Wt += b?.totals?.misc?.Wt;
                    finalArr[find_record].totals.misc.allservwt +=
                        b?.totals?.misc?.allservwt;
                    finalArr[find_record].totals.misc.Pcs += b?.totals?.misc?.Pcs;
                    finalArr[find_record].totals.misc.Amount += b?.totals?.misc?.Amount;

                    finalArr[find_record].totals.metal.Amount += b?.totals?.metal?.Amount;
                    finalArr[find_record].totals.metal.IsPrimaryMetal +=
                        b?.totals?.metal?.IsPrimaryMetal;
                    finalArr[find_record].totals.metal.IsPrimaryMetal_Amount +=
                        b?.totals?.metal?.IsPrimaryMetal_Amount;

                    finalArr[find_record].totals.misc.withouthscode1_2_pcs +=
                        b?.totals?.misc?.withouthscode1_2_pcs;
                    finalArr[find_record].totals.misc.withouthscode1_2_wt +=
                        b?.totals?.misc?.withouthscode1_2_wt;
                    finalArr[find_record].totals.misc.onlyHSCODE3_amt +=
                        b?.totals?.misc?.onlyHSCODE3_amt;
                    finalArr[find_record].totals.misc.onlyIsHSCODE0_Wt +=
                        b?.totals?.misc?.onlyIsHSCODE0_Wt;
                    finalArr[find_record].totals.misc.onlyIsHSCODE0_Pcs +=
                        b?.totals?.misc?.onlyIsHSCODE0_Pcs;
                    finalArr[find_record].totals.misc.onlyIsHSCODE0_Amount +=
                        b?.totals?.misc?.onlyIsHSCODE0_Amount;
                }
            }
        });

        // CQ Was Solving 09/10/2025
        // finalArr.forEach((item, idx) => {
        //   console.log(`Record ${idx} GroupJob: ${item.GroupJob} has metal count:`, item.metal?.length);
        // });
        // console.log("Final finalArr stringified:\n", JSON.stringify(finalArr, null, 2));
        // CQ Was Solving 09/10/2025

        datas.resultArray = finalArr;

        //after groupjob
        datas?.resultArray?.forEach((e) => {
            let dia2 = [];
            e?.diamonds?.forEach((el) => {
                // let findrec = dia2?.findIndex((a) => a?.ShapeName === el?.ShapeName && a?.QualityName === el?.QualityName && a?.Colorname === el?.Colorname && a?.GroupName === el?.GroupName)
                let findrec = dia2?.findIndex(
                    (a) =>
                        a?.ShapeName === el?.ShapeName &&
                        a?.QualityName === el?.QualityName &&
                        a?.Colorname === el?.Colorname &&
                        a?.SizeName === el?.SizeName &&
                        a?.Rate === el?.Rate
                );
                let ell = cloneDeep(el);
                if (findrec === -1) {
                    dia2.push(ell);
                } else {
                    dia2[findrec].Wt += ell?.Wt;
                    dia2[findrec].Pcs += ell?.Pcs;
                    dia2[findrec].Amount += ell?.Amount;
                    // dia2[findrec].Rate += ell?.Rate; // CQ Fixed 22/11/2025
                    // if(dia2[findrec]?.SizeName !== ell?.SizeName){
                    //   // dia2[findrec].SizeName = 'Mix'
                    //   dia2[findrec].SizeName = ell?.GroupName;
                    // }
                }
            });
            e.diamonds = dia2;

            //diamond
            let clr2 = [];

            e?.colorstone?.forEach((el) => {
                // let findrec = dia2?.findIndex((a) => a?.ShapeName === el?.ShapeName && a?.QualityName === el?.QualityName && a?.Colorname === el?.Colorname && a?.GroupName === el?.GroupName)
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
                    // if(dia2[findrec]?.SizeName !== ell?.SizeName){
                    //   // dia2[findrec].SizeName = 'Mix'
                    //   dia2[findrec].SizeName = ell?.GroupName;
                    // }
                }
            });
            e.colorstone = clr2;

            //misc
            let misc0 = [];
            e?.misc?.forEach((el) => {
                if (el?.IsHSCOE === 0) {
                    misc0?.push(el);
                }
            });

            e.misc = misc0;

            if (e?.GroupJob !== "") {
                e.metal = e.metal?.map((a) => ({
                    ...a,
                    GroupJob: e.GroupJob,
                }));
            }
            // CQ Was Solved 09/10/2025

        });

        let diaObj = {
            ShapeName: "OTHERS",
            wtWt: 0,
            wtWts: 0,
            pcPcs: 0,
            pcPcss: 0,
            rRate: 0,
            rRates: 0,
            amtAmount: 0,
            amtAmounts: 0,
        };

        let diaonlyrndarr1 = [];
        let diaonlyrndarr2 = [];
        let diaonlyrndarr3 = [];
        let diaonlyrndarr4 = [];
        let diarndotherarr5 = [];
        let diaonlyrndarr6 = [];
        datas?.json2?.forEach((e) => {
            if (e?.MasterManagement_DiamondStoneTypeid === 1) {
                if (e.ShapeName?.toLowerCase() === "rnd") {
                    diaonlyrndarr1.push(e);
                } else {
                    diaonlyrndarr2.push(e);
                }
            }
        });

        diaonlyrndarr1?.forEach((e) => {
            let findRecord = diaonlyrndarr3.findIndex(
                (a) =>
                    e?.StockBarcode === a?.StockBarcode &&
                    e?.ShapeName === a?.ShapeName &&
                    e?.QualityName === a?.QualityName &&
                    e?.Colorname === a?.Colorname
            );

            if (findRecord === -1) {
                let obj = { ...e };
                obj.wtWt = e?.Wt;
                obj.pcPcs = e?.Pcs;
                obj.rRate = e?.Rate;
                obj.amtAmount = e?.Amount;
                diaonlyrndarr3.push(obj);
            } else {
                diaonlyrndarr3[findRecord].wtWt += e?.Wt;
                diaonlyrndarr3[findRecord].pcPcs += e?.Pcs;
                diaonlyrndarr3[findRecord].rRate += e?.Rate;
                diaonlyrndarr3[findRecord].amtAmount += e?.Amount;
            }
        });

        diaonlyrndarr2?.forEach((e) => {
            let findRecord = diaonlyrndarr4.findIndex(
                (a) =>
                    e?.StockBarcode === a?.StockBarcode &&
                    e?.ShapeName === a?.ShapeName &&
                    e?.QualityName === a?.QualityName &&
                    e?.Colorname === a?.Colorname
            );

            if (findRecord === -1) {
                let obj = { ...e };
                obj.wtWt = e?.Wt;
                obj.wtWts = e?.Wt;
                obj.pcPcs = e?.Pcs;
                obj.pcPcss = e?.Pcs;
                obj.rRate = e?.Rate;
                obj.rRates = e?.Rate;
                obj.amtAmount = e?.Amount;
                obj.amtAmounts = e?.Amount;
                diaonlyrndarr4.push(obj);
            } else {
                diaonlyrndarr4[findRecord].wtWt += e?.Wt;
                diaonlyrndarr4[findRecord].wtWts += e?.Wt;
                diaonlyrndarr4[findRecord].pcPcs += e?.Pcs;
                diaonlyrndarr4[findRecord].pcPcss += e?.Pcs;
                diaonlyrndarr4[findRecord].rRate += e?.Rate;
                diaonlyrndarr4[findRecord].rRates += e?.Rate;
                diaonlyrndarr4[findRecord].amtAmount += e?.Amount;
                diaonlyrndarr4[findRecord].amtAmounts += e?.Amount;
            }
        });

        diaonlyrndarr4?.forEach((e) => {
            diaObj.wtWt += e?.wtWt;
            diaObj.wtWts += e?.wtWts;
            diaObj.pcPcs += e?.pcPcs;
            diaObj.pcPcss += e?.pcPcss;
            diaObj.rRate += e?.rRate;
            diaObj.rRates += e?.rRates;
            diaObj.amtAmount += e?.amtAmount;
            diaObj.amtAmounts += e?.amtAmounts;
        });

        diaonlyrndarr3?.forEach((e) => {
            let find_record = diaonlyrndarr6?.findIndex(
                (a) =>
                    e?.ShapeName === a?.ShapeName &&
                    e?.QualityName === a?.QualityName &&
                    e?.Colorname === a?.Colorname
            );
            if (find_record === -1) {
                let obj = { ...e };
                obj.wtWts = e?.wtWt;
                obj.pcPcss = e?.pcPcs;
                obj.rRates = e?.rRate;
                obj.amtAmounts = e?.amtAmount;
                diaonlyrndarr6.push(obj);
            } else {
                diaonlyrndarr6[find_record].wtWts += e?.wtWt;
                diaonlyrndarr6[find_record].pcPcss += e?.pcPcs;
                diaonlyrndarr6[find_record].rRates += e?.rRate;
                diaonlyrndarr6[find_record].amtAmounts += e?.amtAmount;
            }
        });

        let diamondDetail = [];
        data?.BillPrint_Json2?.forEach((e) => {
            if (e?.MasterManagement_DiamondStoneTypeid === 1) {
                let findDiamond = diamondDetail?.findIndex(
                    (ele) =>
                        ele?.ShapeName === e?.ShapeName &&
                        ele?.QualityName === e?.QualityName &&
                        ele?.Colorname === e?.Colorname
                );
                if (findDiamond === -1) {
                    diamondDetail.push(e);
                } else {
                    diamondDetail[findDiamond].Pcs += e?.Pcs;
                    diamondDetail[findDiamond].Wt += e?.Wt;
                    diamondDetail[findDiamond].Amount += e?.Amount;
                }
            }
        });
        let findRND = [];
        let remaingDia = [];
        diamondDetail?.forEach((ele) => {
            if (ele?.ShapeName === "RND") {
                findRND.push(ele);
            } else {
                remaingDia.push(ele);
            }
        });

        let resultArr = [];
        findRND.sort((a, b) => {
            if (a.ShapeName !== b.ShapeName) {
                return a.ShapeName.localeCompare(b.ShapeName); // Sort by ShapeName
            } else if (a.QualityName !== b.QualityName) {
                return a.QualityName.localeCompare(b.QualityName); // If ShapeName is same, sort by QualityName
            } else {
                return a.Colorname.localeCompare(b.Colorname); // If QualityName is same, sort by Colorname
            }
        });

        remaingDia.sort((a, b) => {
            if (a.ShapeName !== b.ShapeName) {
                return a.ShapeName.localeCompare(b.ShapeName); // Sort by ShapeName
            } else if (a.QualityName !== b.QualityName) {
                return a.QualityName.localeCompare(b.QualityName); // If ShapeName is same, sort by QualityName
            } else {
                return a.Colorname.localeCompare(b.Colorname); // If QualityName is same, sort by Colorname
            }
        });
        if (findRND?.length > 6) {
            let arr = findRND.slice(0, 6);
            let anotherArr = [...findRND.slice(6), remaingDia].flat();
            let obj = { ...anotherArr[0] };
            anotherArr?.reduce((acc, cobj) => {
                obj.Pcs += cobj?.Pcs;
                obj.Wt += cobj?.Wt;
                obj.Amount += cobj?.Amount;
            }, obj);
            obj.ShapeName = "OTHER";
            resultArr = [...arr, obj].flat();
        } else {
            let arr = [...findRND].flat();
            let smallArr = [...remaingDia.slice(0, 6 - findRND?.length)].flat();
            let largeArr = [...remaingDia.slice(6 - findRND?.length)].flat();
            let finalArr = [...arr, ...smallArr].flat();

            let obj = { ...largeArr[0] };
            obj.Pcs = 0;
            obj.Wt = 0;
            obj.Amount = 0;
            largeArr?.reduce((acc, cobj) => {
                obj.Pcs += cobj?.Pcs;
                obj.Wt += cobj?.Wt;
                obj.Amount += cobj?.Amount;
            }, obj);
            obj.ShapeName = "OTHER";
            resultArr = [...finalArr, obj].flat();
        }

        setDiamondDetails(resultArr);

        diarndotherarr5 = [...diaonlyrndarr6, diaObj];
        const sortedData = diarndotherarr5?.sort(customSort);
        // setDiamonds(sortedData);
        setDiamondWise(sortedData);

        setResult(datas);
    }

    const customSort = (a, b) => {
        if (a?.ShapeName === "OTHER" && b?.ShapeName !== "OTHER") {
            return 1; // "OTHER" comes after any other ShapeName
        } else if (a?.ShapeName !== "OTHER" && b?.ShapeName === "OTHER") {
            return -1; // Any other ShapeName comes before "OTHER"
        } else {
            // If ShapeNames are equal, compare by QualityName
            if (a?.QualityName < b?.QualityName) {
                return -1;
            } else if (a?.QualityName > b?.QualityName) {
                return 1;
            } else {
                // If QualityNames are equal, compare by Colorname
                return a?.Colorname?.localeCompare(b?.Colorname);
            }
        }
    };


    const totalQty = (result?.resultArray || []).reduce(
        (sum, item) => sum + (Number(item?.BulkPurchaseQTY ? item?.BulkPurchaseQTY : item?.Quantity) || 0),
        0
    );

    const TotalTaxPercentage =
        (Number(result?.header?.CGST) || 0) +
        (Number(result?.header?.SGST) || 0) +
        (Number(result?.header?.IGST) || 0) +
        (Number(result?.header?.tax1_value) || 0) +
        (Number(result?.header?.tax2_value) || 0) +
        (Number(result?.header?.tax3_value) || 0) +
        (Number(result?.header?.tax4_value) || 0) +
        (Number(result?.header?.tax5_value) || 0);


    const handleVatamtFalgShow = () => {
        if (vatamtFalg) setVatamtFalg(false);
        else {
            setVatamtFalg(true);
        }
    };

    const Finalamount =
        ((Number((result?.mainTotal?.total_unitcost+result?.header?.AddLess )/result?.header?.CurrencyExchRate) || 0) *
            (1 + (Number(TotalTaxPercentage) || 0) / 100))  

    const integerPart = Math.floor(Finalamount);
    const filsPart = Math.round((Finalamount - integerPart) * 100);
    const amountInWords =
        `${toWords.convert(integerPart)}${filsPart > 0
            ? ` And ${toWords.convert(filsPart)} Fils`
            : ""
        } Only`;


    const bankPayments = (result?.header?.BankPayDet || "")
        .split("@-@")
        .filter(Boolean)
        .map(item => {
            const [bank, method, amount, reference, voucher] =
                item.split("#-#");

            return {
                bank,
                method,
                amount,
                reference,
                voucher,
            };
        });

    const cashPayments = result?.header?.CashPayDet
        ? [{
            method: "Cash",
            amount: result.header.CashPayDet.split("-")[1] || 0,
            reference: "-",
        }]
        : [];

    const payments = [...bankPayments, ...cashPayments];


    console.log("TCL: result", result)
    return (
        <>
            {loader ? (
                <Loader />
            ) : (
                <>
                    {msg === "" ? (
                        <>
                            <div className="invoice-page">
                                <div className="printbtn" style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "flex-end", marginBottom: "10px" }}>
                                    <div>
                                        <input
                                            type="checkbox"
                                            className="me-1"
                                            value={vatamtFalg}
                                            checked={vatamtFalg}
                                            onChange={(e) => handleVatamtFalgShow(e)}
                                            id="vatamtFalg"
                                        />
                                        <label htmlFor="vatamtFalg" style={{ fontSize: "13px" }}>
                                            {" "}
                                            <div className="pb-2">VAT Amount </div>
                                        </label>
                                    </div>
                                    <button
                                        className="btn_white blue mb-0 hidedp10_pcl7 m-0 p-2"
                                        onClick={(e) => handlePrint(e)}
                                    >
                                        Print
                                    </button>
                                </div>
                                <div className="invoice-container">

                                    {/* Header */}
                                    <div className="invoice-header">
                                        <div className="invoice-title"> {result?.header?.PrintHeadLabel}</div>
                                        {
                                            result?.header?.Company_VAT_GST_No && (

                                                <div className="invoice-trn">TRN: {result?.header?.Company_VAT_GST_No.substring(6)}</div>
                                            )
                                        }
                                    </div>

                                    {/* Bill To */}
                                    <div className="bill-section">
                                        <div className="section-label"> {result?.header?.lblBillTo}:</div>

                                        <div className="bill-text">
                                            <div>
                                                {result?.header?.CustName}
                                            </div>

                                            <div>
                                                {result?.header?.customerAddress1}
                                            </div>

                                            <div>
                                                {result?.header?.customerAddress2}
                                            </div>
                                            <div>
                                                {result?.header?.customerAddress3}
                                            </div>
                                            <div>

                                                {result?.header?.customercity1}
                                            </div>
                                            <div>
                                                {result?.header?.State},{result?.header?.customercountry}
                                            </div>

                                            <div>

                                                {result?.header?.customermobileno1}
                                            </div>
                                            <div>
                                                {result?.header?.Cust_VAT_GST_No && (

                                                    "TRN -" + result?.header?.Cust_VAT_GST_No
                                                )}

                                            </div>






                                        </div>
                                    </div>

                                    {/* Meta */}
                                    <div className="meta-box">

                                        <div className="meta-col large">
                                            <div className="meta-head">INVOICE NO</div>
                                            <div className="meta-value">{result?.header?.InvoiceNo}</div>
                                        </div>

                                        <div className="meta-col large">
                                            <div className="meta-head">INVOICE REFERENCE</div>
                                            <div className="meta-value">{result?.header?.BillReferenceNo}</div>
                                        </div>

                                        <div className="meta-col">
                                            <div className="meta-head">DATE</div>
                                            <div className="meta-value">{result?.header?.EntryDate}</div>
                                        </div>

                                    </div>

                                    {/* Second Meta */}
                                    <div className="meta-box second" >

                                        <div className="meta-col">
                                            <div className="meta-head">SHIPPING CARRIER</div>
                                            <div className="meta-value" style={{ minHeight: "21px" }}> {result?.header?.Delivery_Mode}  </div>
                                        </div>

                                        <div className="meta-col">
                                            <div className="meta-head">TRACKING NO</div>
                                            <div className="meta-value" style={{ minHeight: "21px" }}> {result?.header?.E_Way_Bill_No}</div>
                                        </div>

                                        <div className="meta-col">
                                            <div className="meta-head">INSURANCE BY</div>
                                            <div className="meta-value" style={{ minHeight: "21px" }}> {result?.header?.insuranceby}</div>
                                        </div>

                                        <div className="meta-col">
                                            <div className="meta-head">INSURANCE REFERENCE</div>
                                            <div className="meta-value" style={{ minHeight: "21px" }}> {result?.header?.Advance_Receipt_No}</div>
                                        </div>

                                    </div>

                                    {/* Table */}
                                    <div className="table-wrapper">

                                        {/* Header */}
                                        <div className="table-row table-header">

                                            <div className="w-sno">S.NO</div>
                                            <div className="w-lot">LOT NO</div>
                                            <div className="w-img">IMAGE</div>
                                            <div className="w-desc" style={{ width: vatamtFalg ? "19%" : "24%" }}>DESCRIPTION OF GOODS</div>
                                            <div className="w-small">DIAMOND CARAT</div>
                                            <div className="w-small">COLOR <br /> STONE <br /> CARAT</div>
                                            <div className="w-pcs">PCS</div>
                                            <div className="w-small">AVERAGE (GMS)</div>
                                            <div className="w-small">TOTAL (GMS)</div>
                                            <div className="w-price" style={{ width: vatamtFalg ? "8%" : "10%" }}>PRICE PER <br /> UNIT ({result?.header?.CurrencyCode})</div>
                                            <div className="w-price" style={{ width: vatamtFalg ? "8%" : "10%" }}>NET AMOUNT ({result?.header?.CurrencyCode})</div>
                                            {
                                                vatamtFalg && (
                                                    <div className="w-card">VAT AMOUNT</div>
                                                )
                                            }
                                            <div className="w-price no-border">TOTAL AMOUNT ({result?.header?.CurrencyCode})</div>

                                        </div>
                                        {/* Row */}

                                        {result?.resultArray?.map((e, i) => {

                                            return (
                                                <div className="table-row">

                                                    <div className="table-cell w-sno div-center">{i + 1}</div>

                                                    <div className="table-cell w-lot div-center">{e?.SrJobno}</div>

                                                    <div className="table-cell w-img div-center">
                                                        <div className="img-box">
                                                            <img
                                                                src={e?.DesignImage}
                                                                // src={e?.GroupJob === "" ? e?.DesignImage : result?.json1?.map((el) => el?.DesignImage)}
                                                                onError={(e) => handleImageError(e)}
                                                                alt="design"
                                                                className=" "
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="table-cell w-desc desc-cell" style={{ width: vatamtFalg ? "19%" : "24%", padding: "0px" }}>
                                                        <div style={{ display: "flex", borderBottom: "1px solid #bdbdbd" }}>
                                                            <div style={{ borderRight: "1px solid #bdbdbd", width: "40%", padding: "3px 5px", fontWeight: 600 }}>
                                                                ITEM
                                                            </div>
                                                            <div style={{ width: "60%", padding: "3px 5px" }}>
                                                                {e?.designno}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: "flex", borderBottom: "1px solid #bdbdbd" }}>
                                                            <div style={{ borderRight: "1px solid #bdbdbd", width: "40%", padding: "3px 5px", fontWeight: 600 }}>
                                                                CATEGORY
                                                            </div>
                                                            <div style={{ width: "60%", padding: "3px 5px" }}>
                                                                {e?.Categoryname}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: "flex" }}>
                                                            <div style={{ borderRight: "1px solid #bdbdbd", width: "40%", padding: "3px 5px", fontWeight: 600 }}>
                                                                METAL
                                                            </div>
                                                            <div style={{ width: "60%", padding: "3px 5px" }}>
                                                                {e?.MetalTypePurity}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="table-cell w-small div-center">{e?.totals?.diamonds?.Wt.toFixed(2)}</div>

                                                    <div className="table-cell w-small div-center">{e?.totals?.colorstone?.Wt.toFixed(2)}</div>

                                                    <div className="table-cell w-pcs div-center"> {e?.BulkPurchaseQTY ? e?.BulkPurchaseQTY : e?.Quantity}</div>

                                                    <div className="table-cell w-small div-center"> {e?.grosswt?.toFixed(2)}</div>

                                                    <div className="table-cell w-small div-center">{(e?.grosswt * (e?.BulkPurchaseQTY ? e?.BulkPurchaseQTY : e?.Quantity))?.toFixed(2)}</div>

                                                    <div className="table-cell w-price div-center" style={{ width: vatamtFalg ? "8%" : "10%" }}>{NumberWithCommas(e?.UnitCost/result?.header?.CurrencyExchRate, 2)}</div>

                                                    <div className="table-cell w-price div-center" style={{ width: vatamtFalg ? "8%" : "10%", borderRight: "1px solid #bdbdbd" }}>{NumberWithCommas((e?.UnitCost/result?.header?.CurrencyExchRate)  * (e?.BulkPurchaseQTY ? e?.BulkPurchaseQTY : e?.Quantity), 2)}</div>

                                                    {vatamtFalg && (<div className="table-cell w-card div-center">
                                                        {NumberWithCommas(
                                                            ((Number(e?.UnitCost/result?.header?.CurrencyExchRate)  || 0) *
                                                                ((Number(TotalTaxPercentage) || 0) / 100)), 2
                                                        )}
                                                    </div>
                                                    )}

                                                    <div className="table-cell w-price no-border div-center">{NumberWithCommas(((Number(e?.UnitCost/result?.header?.CurrencyExchRate)  || 0) *
                                                        (1 + (Number(TotalTaxPercentage) || 0) / 100)), 2)}</div>

                                                </div>
                                            )
                                        })}

                                        {/* total  */}
                                        <div className="table-row" >

                                            <div className="table-cell   div-center" style={{ width: vatamtFalg ? "38%" : "43%" }}>Total</div>

                                            <div className="table-cell w-small div-center">{result?.mainTotal?.diamonds?.Wt.toFixed(2)}</div>

                                            <div className="table-cell w-small div-center">{result?.mainTotal?.colorstone?.Wt.toFixed(2)}</div>



                                            <div className="table-cell w-pcs div-center">{totalQty}</div>

                                            <div className="table-cell w-small div-center"> </div>


                                            <div className="table-cell w-small div-center">{(result?.mainTotal?.grosswt * totalQty)?.toFixed(2)}</div>

                                            <div className="table-cell w-price div-center" style={{ width: vatamtFalg ? "8%" : "10%" }}> </div>
                                            {/* <div className="table-cell w-price div-center">{NumberWithCommas(result?.mainTotal?.total_unitcost, 2)}</div> */}

                                            <div className="table-cell w-price div-center" style={{ width: vatamtFalg ? "8%" : "10%", borderRight: "1px solid #dbdbdb" }}>{NumberWithCommas(result?.mainTotal?.total_unitcost /result?.header?.CurrencyExchRate, 2)}</div>
                                            {
                                                vatamtFalg && (<div className="table-cell w-card div-center">
                                                    {/* <div className="checkbox"></div> */}
                                                </div>
                                                )
                                            }
                                            <div className="table-cell w-price no-border div-center">
                                                {NumberWithCommas(((Number(result?.mainTotal?.total_unitcost /result?.header?.CurrencyExchRate) || 0) *
                                                    (1 + (Number(TotalTaxPercentage) || 0) / 100)), 2)}</div>

                                        </div>
                                        {result?.allTaxes?.length != 0 && <div className="table-row" style={{ fontWeight: "bold" }}>
                                            <div className="table-cell   div-center" style={{ width: vatamtFalg ? "78%" : "85%", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                                {result?.allTaxes?.map((e, i) => {
                                                    return (
                                                        <div
                                                            className=" text-end"
                                                            key={i}
                                                        >
                                                            <div className="pb-1 px-1 text-end">
                                                                {" "}
                                                                {e?.name} {e?.per}{" "}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="table-cell w-price div-center" style={{ width: vatamtFalg ? "8.1%" : "10%", borderRight: vatamtFalg ? "1px solid #dbdbdb" : "none", flexDirection: "column", alignItems: "flex-end" }}>
                                                {result?.allTaxes?.map((e, i) => {
                                                    return (
                                                        <div
                                                            className=" text-end"
                                                            key={i}
                                                        >
                                                            <div className="pb-1 px-1 text-end">
                                                                {" "}
                                                                {NumberWithCommas(e?.amountInNumber, 2)}{" "}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {vatamtFalg && (
                                                <div className="table-cell w-card div-center">
                                                </div>
                                            )}

                                            <div className="table-cell w-price no-border div-center">   </div>
                                        </div>
                                        }
                                        {result?.header?.AddLess != 0 && <div className="table-row" style={{ height: "28px", fontWeight: "bold" }}>
                                            <div className="table-cell   div-center" style={{ width: vatamtFalg ? "78%" : "85%", justifyContent: "flex-end" }}> SPECIAL DISCOUNT </div>
                                            <div className="table-cell w-price div-center" style={{ width: vatamtFalg ? "8.1%" : "10%", borderRight: "1px solid #dbdbdb", justifyContent: "flex-end" }}>
                                                 
                                                {NumberWithCommas(
                                                    result?.header?.AddLess /
                                                    result?.header?.CurrencyExchRate,
                                                    2
                                                )} </div>

                                            {vatamtFalg && (
                                                <div className="table-cell w-card div-center">
                                                    {" "}</div>
                                            )}

                                            <div className="table-cell w-price no-border div-center"> {" "}</div>
                                        </div>}
                                        <div className="table-row" style={{ fontWeight: "bold" }}>
                                            <div className="table-cell   div-center" style={{ width: vatamtFalg ? "78%" : "85%", justifyContent: "flex-end" }}> TOTAL ({result?.header?.CurrencyCode})</div>
                                            <div className="table-cell w-price div-center" style={{ width: vatamtFalg ? "8.1%" : "10%", borderRight: "1px solid #dbdbdb", justifyContent: "flex-end" }}>
                                                {NumberWithCommas((Number((result?.mainTotal?.total_unitcost+ result?.header?.AddLess)/result?.header?.CurrencyExchRate) || 0) *
                                                    (1 + (Number(TotalTaxPercentage) || 0) / 100) ,
                                                    2
                                                )}
                                            </div>
                                            {vatamtFalg && (
                                                <div className="table-cell w-card div-center">
                                                    {" "}</div>
                                            )}
                                            <div className="table-cell w-price no-border div-center"> {" "}</div>
                                        </div>
                                        <div className="table-row" style={{ fontWeight: "bold" }}>
                                            <div className="table-cell   div-center" style={{ width: "18%" }}> TOTAL AMOUNT IN WORD </div>
                                            <div className="table-cell w-price" style={{ width: vatamtFalg ? "74%" : "86%", display: 'flex', padding: '5px 30px' }}>
                                                {amountInWords}
                                            </div>
                                            {vatamtFalg && (
                                                <div className="table-cell w-price no-border div-center"> </div>
                                            )}
                                        </div>
                                    </div>

                                    {result?.header?.Declaration && <div className="ob-form-container" style={{ width: "100%", border: "1px solid #bdbdbd ", borderBottom: "none", padding: "5px", marginRight: "0px" }}>
                                        <p className="fw-bold" style={{ fontSize: "12px" }}>Terms & Condition:</p>
                                        <div
                                            className="tb_fs_pclsINS"
                                            dangerouslySetInnerHTML={{
                                                __html: result?.header?.Declaration,
                                            }}
                                        ></div>
                                    </div>}

                                    <div className="ob-form-container">

                                        {/* ROW 1: Payment and Bank Details */}
                                        <div className="ob-form-row">
                                            {/* Left Half (Payment Term & Reference) */}
                                            <div className="ob-form-col-50">
                                                <div className="ob-form-row">
                                                    <div
                                                        className="ob-form-cell ob-form-w-50"
                                                        style={{ padding: "0px" }}
                                                    >
                                                        <div
                                                            className="ob-form-cell-header"
                                                            style={{ padding: "5px", borderBottom: "1px solid #bdbdbd" }}
                                                        >
                                                            Payment Term/Method
                                                        </div>

                                                        <div className="ob-form-cell-text" style={{padding: '0px 5px'}}>
                                                            {payments.map((item, index) => (
                                                                <div key={index}>
                                                                    {item.method} - {item.amount}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="ob-form-cell ob-form-w-50"
                                                        style={{ padding: "0px" }}
                                                    >
                                                        <div
                                                            className="ob-form-cell-header"
                                                            style={{ padding: "5px", borderBottom: "1px solid #bdbdbd" }}
                                                        >
                                                            Payment Reference
                                                        </div>

                                                        <div className="ob-form-cell-text" style={{padding: '0px 5px'}}>
                                                            {payments.map((item, index) => (
                                                                <div key={index}>
                                                                    {item.reference}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Half (Bank Details) */}
                                            <div className="ob-form-cell ob-form-col-50" style={{ padding: "0px", minHeight: "80px" }}>
                                                <div className="ob-form-cell-header" style={{ padding: "5px", borderBottom: "1px solid #bdbdbd" }}>Bank Details</div>
                                                <div className="ob-form-cell-text">
                                                    <div className="disColunm check_dp10 ball_dp10 pb-1 fsgdp10 tb_fs_pcls1 minH_sum_pcl3">
                                                        <div style={{ padding: "5px", lineHeight: "1.2" }}>


                                                            {result?.header?.bankname && (

                                                                <div className="d-flex w-100">
                                                                    <span className="fw-bold spwdth">Bank name</span>:
                                                                    <span className="spwdth1 spbrWord" style={{ marginLeft: "5px" }}>
                                                                        {result?.header?.bankname}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* <span>{headerData?.spaninCode}</span> */}
                                                            {
                                                                result?.header?.accountname && (

                                                                    <div className="d-flex w-100">
                                                                        <span className="fw-bold spwdth">Account Name</span>:
                                                                        <span className="spwdth1 spbrWord" style={{ marginLeft: "5px" }}>
                                                                            {result?.header?.accountname}
                                                                        </span>
                                                                    </div>
                                                                )

                                                            }

                                                            {result?.header?.accountnumber && (

                                                                <div className="d-flex w-100">
                                                                    <span className="fw-bold spwdth">Account No </span>:
                                                                    <span className="spwdth1 spbrWord" style={{ marginLeft: "5px" }}>
                                                                        {result?.header?.accountnumber}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {result?.header?.rtgs_neft_ifsc && (

                                                                <div className="d-flex w-100">
                                                                    <span className="fw-bold spwdth">IBAN </span>:
                                                                    <span className="spwdth1 spbrWord" style={{ marginLeft: "5px" }}>
                                                                        {result?.header?.rtgs_neft_ifsc}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {result?.header?.swiftcode && (

                                                                <div className="d-flex w-100">
                                                                    <span className="fw-bold spwdth">SWIFT CODE</span>:
                                                                    <span className="spwdth1 spbrWord" style={{ marginLeft: "5px" }}>
                                                                        {result?.header?.swiftcode}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {result?.header?.micrcode && (

                                                                <div className="d-flex w-100">
                                                                    <span className="fw-bold spwdth">MICR CODE </span>:
                                                                    <span className="spwdth1 spbrWord" style={{ marginLeft: "5px" }}>
                                                                        {result?.header?.micrcode}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>





                                        {/* ROW 4: Signature Blocks */}
                                        <div className="ob-form-row">
                                            {/* Left Signature */}
                                            <div className="ob-form-col-50">
                                                <div className="ob-form-cell ob-form-sub-header-bg">
                                                    <div className="ob-form-cell-header">Customer Signature</div>
                                                </div>
                                                <div className="ob-form-cell ob-form-h-120">
                                                    <div className="ob-form-cell-text"></div>
                                                </div>
                                            </div>

                                            {/* Right Signature */}
                                            <div className="ob-form-col-50">
                                                <div className="ob-form-cell ob-form-sub-header-bg">
                                                    <div className="ob-form-cell-header">Signature</div>
                                                </div>
                                                <div className="ob-form-cell ob-form-h-120">
                                                    <div className="ob-form-cell-text"></div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </>
                    ) : (
                        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
                            {msg}
                        </p>
                    )}
                </>
            )}
        </>
    );
}