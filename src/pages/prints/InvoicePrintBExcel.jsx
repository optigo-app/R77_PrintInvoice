
import "../../assets/css/prints/InvoicePrintBExcel.css";
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
} from "../../GlobalFunctions";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import ReactHTMLTableToExcel from "react-html-table-to-excel";

import Loader from "../../components/Loader";
import { cloneDeep } from "lodash";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";
function InvoicePrintB({ token, invoiceNo, printName, urls, evn, ApiVer }) {

    const [result, setResult] = useState(null);
    const [msg, setMsg] = useState("");
    const [loader, setLoader] = useState(true);
    const [diamondWise, setDiamondWise] = useState([]);

    const evname = atob(evn);
    const [MetShpWise, setMetShpWise] = useState([]);
    const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
    const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);
    const [diamondDetails, setDiamondDetails] = useState([]);

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

        console.log("TCL: sendData -> datas", datas)

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



        datas.resultArray = finalArr;


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
    if (result) {
        setTimeout(() => {
            const button = document.getElementById('test-table-xls-button');
            button.click();
        }, 500);
    }

    const isMultipleCOmpany = result?.header?.MltC_CompanyName?.length > 0 ? 1 : 0;

    return (
        <>
            {loader ? (
                <Loader />
            ) : (
                <>
                    {msg === "" ? (
                        <>
                            <ReactHTMLTableToExcel
                                id="test-table-xls-button"
                                className="download-table-xls-button btn btn-success text-black bg-success px-2 py-1 fs-5 d-none"
                                table="table-to-xls"
                                filename={`Invoice_printB`}
                                sheet={`Invoice_printB_${result?.header?.InvoiceNo}`}
                                buttonText="Download as XLS"
                            />
                            <div className="beluxecontainer">

                                {/* Single Flat Table Structure */}
                                <table id="table-to-xls" className="beluxe-table" style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Calibri" }}>
                                    {/* Defining Master Grid Columns for Excel Alignment */}
                                    <colgroup>
                                        <col style={{ width: "5%" }} />    {/* SR */}
                                        <col style={{ width: "12%" }} />   {/* Style Number */}
                                        <col style={{ width: "15%" }} />   {/* Image */}
                                        <col style={{ width: "23%" }} />   {/* Description */}
                                        <col style={{ width: "7%" }} />    {/* Qty */}
                                        <col style={{ width: "12.6%" }} /> {/* Tag Price */}
                                        <col style={{ width: "12.7%" }} /> {/* Discount */}
                                        <col style={{ width: "12.7%" }} /> {/* Total */}
                                    </colgroup>

                                    <tbody>

                                        {/* 1. LOGO BAR ROW */}
                                        <tr height="80" style={{ height: "80px" }}>
                                            <td colSpan="2" style={{ border: "1px solid #dbdbdb", padding: "10px", verticalAlign: "middle", textAlign: "center" }}>
                                                {/* Explicitly declaring width/height attributes ensures Excel preserves the logo's proportions */}
                                                <img
                                                    src={result?.header?.PrintLogo}
                                                    alt="logo"
                                                    width="140"
                                                    height="60"
                                                    style={{ width: "140px", height: "60px", display: "block", margin: "0 auto", objectFit: "contain" }}
                                                />
                                            </td>
                                            <td colSpan="6" style={{ border: "1px solid #dbdbdb", padding: "10px", verticalAlign: "middle", textAlign: "center", fontSize: "22px", fontWeight: "bold" }}>
                                                {isMultipleCOmpany === 1 ? result?.header?.MltC_CompanyName : result?.header?.CompanyFullName}
                                            </td>
                                        </tr>
                                        {/* 2. TITLE HEAD LABEL */}
                                        <tr height="40" style={{ backgroundColor: "#8bd2ed5c", height: "40px" }}>
                                            <td colSpan="8" style={{ border: "1px solid #dbdbdb", textAlign: "center", padding: "5px", verticalAlign: "middle" }}>
                                                <p className="titletext" style={{ fontSize: "21px", fontWeight: "bold", margin: 0 }}>{result?.header?.PrintHeadLabel}</p>
                                            </td>
                                        </tr>

                                        {/* 3. COMPANY DETAILS & INVOICE META BLOCK */}
                                        <tr>
                                            {/* Left Side Company & Address */}
                                            <td colSpan="6" style={{ border: "1px solid #dbdbdb", verticalAlign: "top", padding: "8px" }}>
                                                <h3 style={{ borderBottom: "1px solid #dbdbdb", paddingBottom: "5px", marginTop: 0, marginBottom: "5px" }}>{isMultipleCOmpany === 1 ? result?.header?.MltC_CompanyName : result?.header?.CompanyFullName}</h3>
                                                <div> {isMultipleCOmpany === 1 ? result?.header?.MltC_firstname : result?.header?.DefCustFirstname}{" "}{isMultipleCOmpany === 1 ? result?.header?.MltC_lastname : result?.header?.DefCustLastname}</div>
                                                <div style={{ fontSize: "13px", lineHeight: "1.4" }}>
                                                    <b>Address:</b>
                                                    <div style={{ wordBreak: "break-word" }}>
                                                        {/* {result?.header?.CompanyAddress} */}
                                                        {
                                                            isMultipleCOmpany === 1 ?


                                                                [
                                                                    result?.header?.MltC_addressline1,
                                                                    result?.header?.MltC_addressline2,
                                                                    result?.header?.MltC_addressline3
                                                                ].filter(Boolean).join(", ")

                                                                :


                                                                [
                                                                    result?.header?.CompanyAddress,
                                                                    result?.header?.CompanyAddress2,
                                                                    result?.header?.CompanyAddress3
                                                                ].filter(Boolean).join(", ")


                                                        }

                                                        <div>
                                                            {

                                                                isMultipleCOmpany === 1 ?
                                                                    [
                                                                        result?.header?.MltC_city,
                                                                        result?.header?.MltC_pincode
                                                                    ].filter(Boolean).join("-")

                                                                    :
                                                                    [
                                                                        result?.header?.CompanyCity,
                                                                        result?.header?.CompanyPinCode
                                                                    ].filter(Boolean).join("-")




                                                            }
                                                        </div>
                                                        
                                                      

                                                        <div> {result?.header?.CompanyState || result?.header?.Company_CST_STATE_No ? (
                                                            <>
                                                                {isMultipleCOmpany === 0 && (
                                                                    <>
                                                                        {result?.header?.CompanyState && (
                                                                            <span>State Name: {result.header.CompanyState}</span>
                                                                        )}

                                                                        {result?.header?.CompanyState && result?.header?.CompanyCountry && " | "}

                                                                        {result?.header?.CompanyCountry && (
                                                                            <span>Country: {result.header.CompanyCountry}</span>
                                                                        )}
                                                                    </>
                                                                )}

                                                                {isMultipleCOmpany === 1 && (
                                                                    <>
                                                                        {result?.header?.CompanyState && (
                                                                            <span>State Name: {result.header.MltC_state}</span>
                                                                        )}

                                                                        {result?.header?.MltC_state && result?.header?.MltC_Country && " | "}

                                                                        {result?.header?.MltC_Country && (
                                                                            <span>Country: {result.header.MltC_Country}</span>
                                                                        )}
                                                                    </>
                                                                )}


                                                            </>
                                                        ) : null}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Right Side Invoice Info mapped using standard Excel tables instead of Flexboxes */}
                                            <td colSpan="2" style={{ border: "1px solid #dbdbdb", padding: 0, verticalAlign: "top" }}>
                                                <table style={{ width: "100%", height: "100%", borderCollapse: "collapse", border: "none" }}>
                                                    <tbody>
                                                        <tr height="30" style={{ height: "30px" }}>
                                                            <td style={{ width: "50%", padding: "5px", borderRight: "1px solid #dbdbdb", borderBottom: "1px solid #dbdbdb", fontWeight: "bold", verticalAlign: "middle" }}>Invoice No.</td>
                                                            <td style={{ width: "50%", padding: "5px", borderBottom: "1px solid #dbdbdb", verticalAlign: "middle" }}>{result?.header?.InvoiceNo}</td>
                                                        </tr>
                                                        <tr height="30" style={{ height: "30px" }}>
                                                            <td style={{ width: "50%", padding: "5px", borderRight: "1px solid #dbdbdb", borderBottom: "1px solid #dbdbdb", fontWeight: "bold", verticalAlign: "middle" }}>DATE</td>
                                                            <td style={{ width: "50%", padding: "5px", borderBottom: "1px solid #dbdbdb", verticalAlign: "middle" }}>{result?.header?.EntryDate}</td>
                                                        </tr>
                                                        <tr height="30" style={{ height: "30px" }}>
                                                            <td style={{ width: "50%", padding: "5px", borderRight: "1px solid #dbdbdb", fontWeight: "bold", verticalAlign: "middle" }}>DUE DATE</td>
                                                            <td style={{ width: "50%", padding: "5px", verticalAlign: "middle" }}>{result?.header?.DueDate}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>

                                        {/* 4. METADATA ROW 1: Contact No / Blank / Issued By */}
                                        <tr height="30" style={{ height: "30px" }}>
                                            <td colSpan="6" style={{ border: "1px solid #dbdbdb", padding: "5px", verticalAlign: "middle" }}><b>Contact Number:</b> {result?.header?.CompanyTellNo}</td>

                                            <td colSpan="1" style={{ border: "1px solid #dbdbdb", padding: "5px", fontWeight: "bold", verticalAlign: "middle" }}>ISSUED BY</td>
                                            <td colSpan="1" style={{ border: "1px solid #dbdbdb", padding: "5px", verticalAlign: "middle" }}></td>
                                        </tr>

                                        {/* 5. METADATA ROW 2: Email / Blank / Customer Code */}
                                        <tr height="30" style={{ height: "30px" }}>
                                            <td colSpan="6" style={{ border: "1px solid #dbdbdb", padding: "5px", verticalAlign: "middle" }}><b>Email:</b> {result?.header?.CompanyEmail}</td>

                                            <td colSpan="1" style={{ border: "1px solid #dbdbdb", padding: "5px", fontWeight: "bold", verticalAlign: "middle" }}>Customer Code</td>
                                            <td colSpan="1" style={{ border: "1px solid #dbdbdb", padding: "5px", verticalAlign: "middle" }}>{result?.header?.Customercode}</td>
                                        </tr>

                                        {/* 6. CUSTOMER TO & SHIP TO SECTION */}
                                        <tr>
                                            {/* Customer Details Box */}
                                            <td colSpan="4" style={{ border: "1px solid #dbdbdb", padding: 0, verticalAlign: "top" }}>
                                                <div style={{ borderBottom: "1px solid #dbdbdb", padding: "5px", textAlign: "center", fontWeight: "bold", backgroundColor: "#8bd2ed5c" }}>CUSTOMER</div>
                                                <div style={{ padding: "8px", fontSize: "13px", lineHeight: "1.4" }}>
                                                    <b>TO:</b>
                                                    <div><b>Name:</b> <span>{result?.header?.CustName}</span></div>
                                                    <div><b>ADDRESS:</b> <span>{result?.header?.customerAddress1 + " " + result?.header?.customerAddress2 + " " + result?.header?.customerAddress3}</span></div>
                                                    <div><b>Contact Number:</b> <span>{result?.header?.customermobileno1}</span></div>
                                                    <div><b>Email:</b> <span>{result?.header?.customeremail1}</span></div>
                                                </div>
                                            </td>
                                            {/* Ship To Details Box */}
                                            <td colSpan="4" style={{ border: "1px solid #dbdbdb", padding: 0, verticalAlign: "top" }}>
                                                <div style={{ borderBottom: "1px solid #dbdbdb", padding: "5px", textAlign: "center", fontWeight: "bold", backgroundColor: "#8bd2ed5c" }}>SHIP TO</div>
                                                <div style={{ padding: "8px", fontSize: "13px", lineHeight: "1.4" }}>
                                                    <b>TO:</b>
                                                    <div>
                                                        {result?.header?.Printlable?.split(/\r?\n/).map((line, index) => (
                                                            <div key={index}>{line}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* 7. PRODUCTS MAIN TABLE HEADER */}
                                        <tr height="35" style={{ backgroundColor: "#8bd2ed5c", textAlign: "center", height: "35px" }}>
                                            <th style={{ fontWeight: "bold", border: "1px solid #dbdbdb", padding: "5px", verticalAlign: "middle" }}>SR</th>
                                            <th style={{ fontWeight: "bold", border: "1px solid #dbdbdb", padding: "5px", verticalAlign: "middle" }}>Style Number</th>
                                            <th style={{ fontWeight: "bold", border: "1px solid #dbdbdb", padding: "5px", verticalAlign: "middle" }}>Image</th>
                                            <th style={{ fontWeight: "bold", border: "1px solid #dbdbdb", padding: "5px", verticalAlign: "middle" }}>DESCRIPTION</th>
                                            <th style={{ fontWeight: "bold", border: "1px solid #dbdbdb", padding: "5px", verticalAlign: "middle" }}>Qty</th>
                                            <th style={{ fontWeight: "bold", border: "1px solid #dbdbdb", padding: "5px", verticalAlign: "middle" }}>Tag Price</th>
                                            <th style={{ fontWeight: "bold", border: "1px solid #dbdbdb", padding: "5px", verticalAlign: "middle" }}>Discount</th>
                                            <th style={{ fontWeight: "bold", border: "1px solid #dbdbdb", padding: "5px", verticalAlign: "middle" }}> <span style={{ marginRight: "5px" }}>Total</span> <span
                                                dangerouslySetInnerHTML={{
                                                    __html: `(in  ${result?.header?.Currencysymbol})`,
                                                }}
                                            /></th>
                                        </tr>

                                        {/* 8. DYNAMIC PRODUCT LOOPS (Enforced fixed grid boundaries for image safety) */}
                                        {result?.resultArray?.map((e, i) => {
                                            const materialTypes = [
                                                ...new Set(
                                                    (e?.diamonds || [])
                                                        .map((item) => item?.MaterialTypeName?.trim())
                                                        .filter(Boolean)
                                                ),
                                            ].join(" + ");

                                            return (
                                                <tr key={i} height="120" style={{ height: "120px" }}>
                                                    <td style={{ border: "1px solid #dbdbdb", padding: "5px", textAlign: "center", verticalAlign: "middle" }}>{i + 1}</td>
                                                    <td style={{ border: "1px solid #dbdbdb", padding: "5px", textAlign: "center", verticalAlign: "middle", fontSize: "13px" }}>
                                                        {e?.designno} <br />{e?.GroupJob ? `\u200B${e?.Groupjob}` : `\u200B${e?.SrJobno}`}
                                                    </td>
                                                    <td style={{ border: "1px solid #dbdbdb", padding: "5px", textAlign: "center", verticalAlign: "middle" }}>
                                                        {/* Explicit inline height/width metrics prevent Excel layout clipping */}
                                                        <img
                                                            src={e?.DesignImage}
                                                            onError={(e) => handleImageError(e)}
                                                            alt="design"
                                                            width="80"
                                                            height="80"
                                                            style={{ width: "80px", height: "80px", display: "block", margin: "0 auto", objectFit: "contain" }}
                                                        />
                                                    </td>

                                                    <td style={{ border: "1px solid #dbdbdb", padding: "5px", textAlign: "center", verticalAlign: "middle", fontSize: "13px" }}>
                                                        {e?.MetalType + " " + e?.MetalColor + " " + e?.MetalPurity} <br /> {materialTypes + " " + e?.Categoryname}
                                                    </td>
                                                    <td style={{ border: "1px solid #dbdbdb", padding: "5px", textAlign: "center", verticalAlign: "middle" }}>{e?.BulkPurchaseQTY ? e?.BulkPurchaseQTY : e?.Quantity}</td>
                                                    <td style={{ border: "1px solid #dbdbdb", padding: "5px", textAlign: "right", verticalAlign: "middle" }}>{formatAmount((e?.UnitCost / result?.header?.CurrencyExchRate))}</td>
                                                    <td style={{ border: "1px solid #dbdbdb", padding: "5px", textAlign: "right", verticalAlign: "middle" }}>{formatAmount((e?.DiscountAmt / result?.header?.CurrencyExchRate))}</td>
                                                    <td style={{ border: "1px solid #dbdbdb", padding: "5px", textAlign: "right", verticalAlign: "middle" }}>{formatAmount((e?.TotalAmount / result?.header?.CurrencyExchRate))}</td>
                                                </tr>
                                            );
                                        })}

                                        {/* 9. CALCULATED TOTALS ROW */}
                                        <tr height="35" style={{ height: "35px" }}>
                                            <td colSpan="4" style={{ border: "1px solid #dbdbdb", padding: "5px", fontWeight: "bold", textAlign: "left", verticalAlign: "middle" }}>Total</td>
                                            <td style={{ border: "1px solid #dbdbdb", padding: "5px", textAlign: "center", fontWeight: "bold", verticalAlign: "middle" }}>{totalQty}</td>
                                            <td style={{ border: "1px solid #dbdbdb", padding: "5px", textAlign: "right", fontWeight: "bold", verticalAlign: "middle" }}>{formatAmount((result?.mainTotal?.total_unitcost / result?.header?.CurrencyExchRate))}</td>
                                            <td style={{ border: "1px solid #dbdbdb", padding: "5px", textAlign: "right", fontWeight: "bold", verticalAlign: "middle" }}>{formatAmount((result?.mainTotal?.total_discount / result?.header?.CurrencyExchRate))}</td>
                                            <td style={{ border: "1px solid #dbdbdb", padding: "5px", textAlign: "right", fontWeight: "bold", verticalAlign: "middle" }}>{formatAmount((result?.mainTotal?.total_amount / result?.header?.CurrencyExchRate))}</td>
                                        </tr>

                                        {/* 10. GRAND TOTALS & REMARKS LAYOUT */}
                                        <tr>
                                            {/* Remarks & Terms Section */}
                                            <td colSpan="6" style={{ border: "1px solid #dbdbdb", verticalAlign: "top", padding: "8px" }}>
                                                {result?.header?.Remark !== '' && (
                                                    <div style={{ marginBottom: "5px" }}>
                                                        <span style={{ fontWeight: "bold" }}>Remark:&nbsp;</span>
                                                        <div style={{ display: "inline-block" }} dangerouslySetInnerHTML={{ __html: result?.header?.Remark }} />
                                                    </div>
                                                )}
                                                <div className="terms"></div>
                                            </td>
                                            {/* Financial Breakdowns natively structured using a nested standard table block */}
                                            {/* <td colSpan="4" style={{ border: "1px solid #dbdbdb", padding: 0, verticalAlign: "top" }}>
                                                <table style={{ width: "100%", borderCollapse: "collapse", border: "none" }}>
                                                    <tbody>
                                                        <tr height="30" style={{ height: "30px" }}>
                                                            <td style={{ width: "50%", borderRight: "1px solid #dbdbdb", borderBottom: "1px solid #dbdbdb", padding: "5px", verticalAlign: "middle" }}>Total Amount</td>
                                                            <td style={{ width: "50%", padding: "5px", textAlign: "right", borderBottom: "1px solid #dbdbdb", verticalAlign: "middle" }}>{formatAmount((result?.mainTotal?.total_amount / result?.header?.CurrencyExchRate))}</td>
                                                        </tr>
                                                        <tr height="30" style={{ height: "30px" }}>
                                                            <td style={{ width: "50%", borderRight: "1px solid #dbdbdb", borderBottom: "1px solid #dbdbdb", padding: "5px", verticalAlign: "middle" }}>Shipping</td>
                                                            <td style={{ width: "50%", padding: "5px", textAlign: "right", borderBottom: "1px solid #dbdbdb", verticalAlign: "middle" }}>$ 2,100.00</td>
                                                        </tr>
                                                        <tr height="30" style={{ height: "30px" }}>
                                                            <td style={{ width: "50%", borderRight: "1px solid #dbdbdb", borderBottom: "1px solid #dbdbdb", padding: "5px", verticalAlign: "middle" }}>Round up</td>
                                                            <td style={{ width: "50%", padding: "5px", textAlign: "right", borderBottom: "1px solid #dbdbdb", verticalAlign: "middle" }}>$ 2,100.00</td>
                                                        </tr>
                                                        <tr height="30" style={{ height: "30px", fontWeight: "bold" }}>
                                                            <td style={{ width: "50%", borderRight: "1px solid #dbdbdb", padding: "5px", verticalAlign: "middle" }}>Total</td>
                                                            <td style={{ width: "50%", padding: "5px", textAlign: "right", verticalAlign: "middle" }}>$ 2,100.00</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td> */}
                                            <td
                                                colSpan="4"
                                                style={{
                                                    border: "1px solid #dbdbdb",
                                                    padding: 0,
                                                    verticalAlign: "top",
                                                }}
                                            >
                                                <table
                                                    style={{
                                                        width: "100%",
                                                        borderCollapse: "collapse",
                                                        border: "none",
                                                    }}
                                                >
                                                    <tbody>
                                                        {/* Tax Rows */}
                                                        {result?.allTaxes?.map((e, i) => (
                                                            <tr key={i}>
                                                                <td
                                                                    style={{
                                                                        width: "50%",
                                                                        borderRight: "1px solid #dbdbdb",
                                                                        borderBottom: "1px solid #dbdbdb",
                                                                        padding: "5px",
                                                                    }}
                                                                >
                                                                    {e?.name} @ {e?.per}
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        width: "50%",
                                                                        textAlign: "right",
                                                                        borderBottom: "1px solid #dbdbdb",
                                                                        padding: "5px",
                                                                    }}
                                                                >
                                                                    <span
                                                                        style={{ fontSize: "13px" }}
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: result?.header?.Currencysymbol,
                                                                        }}
                                                                    />
                                                                    {" "}
                                                                    {formatAmount(e?.amount)}
                                                                </td>
                                                            </tr>
                                                        ))}

                                                        {/* Total Amount */}
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    width: "50%",
                                                                    borderRight: "1px solid #dbdbdb",
                                                                    borderBottom: "1px solid #dbdbdb",
                                                                    padding: "5px",
                                                                }}
                                                            >
                                                                Total Amount
                                                            </td>
                                                            <td
                                                                style={{
                                                                    width: "50%",
                                                                    textAlign: "right",
                                                                    borderBottom: "1px solid #dbdbdb",
                                                                    padding: "5px",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{ fontSize: "13px" }}
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: result?.header?.Currencysymbol,
                                                                    }}
                                                                />
                                                                {" "}
                                                                {formatAmount(
                                                                    result?.mainTotal?.total_amount /
                                                                    result?.header?.CurrencyExchRate +
                                                                    result?.allTaxesTotal
                                                                )}
                                                            </td>
                                                        </tr>

                                                        {/* Shipping */}

                                                        {result?.header?.FreightCharges > 0 && (
                                                            <tr>
                                                                <td
                                                                    style={{
                                                                        width: "50%",
                                                                        borderRight: "1px solid #dbdbdb",
                                                                        borderBottom: "1px solid #dbdbdb",
                                                                        padding: "5px",
                                                                    }}
                                                                >
                                                                    Shipping
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        width: "50%",
                                                                        textAlign: "right",
                                                                        borderBottom: "1px solid #dbdbdb",
                                                                        padding: "5px",
                                                                    }}
                                                                >
                                                                    <span
                                                                        style={{ fontSize: "13px" }}
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: result?.header?.Currencysymbol,
                                                                        }}
                                                                    />
                                                                    {" "}
                                                                    {formatAmount(
                                                                        result?.header?.FreightCharges /
                                                                        result?.header?.CurrencyExchRate
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )}


                                                        {/* Round Up */}
                                                        {result?.header?.AddLess !== 0 && (
                                                            <tr>
                                                                <td
                                                                    style={{
                                                                        width: "50%",
                                                                        borderRight: "1px solid #dbdbdb",
                                                                        borderBottom: "1px solid #dbdbdb",
                                                                        padding: "5px",
                                                                    }}
                                                                >
                                                                    Round up
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        width: "50%",
                                                                        textAlign: "right",
                                                                        borderBottom: "1px solid #dbdbdb",
                                                                        padding: "5px",
                                                                    }}
                                                                >
                                                                    <span
                                                                        style={{ fontSize: "13px" }}
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: result?.header?.Currencysymbol,
                                                                        }}
                                                                    />
                                                                    {" "}
                                                                    {formatAmount(
                                                                        result?.header?.AddLess /
                                                                        result?.header?.CurrencyExchRate
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )}


                                                        {/* Grand Total */}
                                                        <tr style={{ fontWeight: "bold" }}>
                                                            <td
                                                                style={{
                                                                    width: "50%",
                                                                    borderRight: "1px solid #dbdbdb",
                                                                    padding: "5px",
                                                                }}
                                                            >
                                                                Total
                                                            </td>
                                                            <td
                                                                style={{
                                                                    width: "50%",
                                                                    textAlign: "right",
                                                                    padding: "5px",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{ fontSize: "13px" }}
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: result?.header?.Currencysymbol,
                                                                    }}
                                                                />
                                                                {" "}
                                                                {formatAmount(
                                                                    result?.mainTotal?.total_amount /
                                                                    result?.header?.CurrencyExchRate +
                                                                    result?.allTaxesTotal +
                                                                    result?.header?.AddLess /
                                                                    result?.header?.CurrencyExchRate +
                                                                    result?.header?.FreightCharges /
                                                                    result?.header?.CurrencyExchRate
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>

                                        {/* 11. BANK DETAILS SUBROW */}
                                        <tr>
                                            <td colSpan="4" style={{ border: "1px solid #dbdbdb", padding: "8px", verticalAlign: "top" }}>
                                                <div style={{ fontWeight: "bold", borderBottom: "1px solid #dbdbdb", textAlign: "center", paddingBottom: "3px", marginBottom: "5px" }}>Bank Details</div>
                                                <div style={{ fontSize: "13px", lineHeight: "1.4" }}>
                                                    <div><b>Account Name:</b> <span>{result?.header?.bankname}</span></div>
                                                    <div><b>Account Number:</b> <span>{result?.header?.accountnumber}</span></div>
                                                    <div><b>Routing Number:</b> <span>{result?.header?.rtgs_neft_ifsc}</span></div>
                                                    <div><b>Zelle ID.:</b> <span>asasd@gmil.com</span></div>
                                                </div>
                                            </td>
                                            <td colSpan="4" style={{ border: "1px solid #dbdbdb" }}></td>
                                        </tr>

                                        {/* 12. SIGNATURE BLOCKS */}
                                        <tr height="120" style={{ height: "120px" }}>
                                            <td colSpan="4" style={{ border: "1px solid #dbdbdb", padding: "10px", textAlign: "center", verticalAlign: "bottom" }}>
                                                <div style={{ fontWeight: "bold", marginBottom: "40px" }}>Customer Signature</div>
                                                <div>__________________</div>
                                            </td>
                                            <td colSpan="4" style={{ border: "1px solid #dbdbdb", padding: "10px", textAlign: "center", verticalAlign: "bottom" }}>
                                                <div style={{ fontWeight: "bold", marginBottom: "40px" }}>{isMultipleCOmpany === 1 ? result?.header?.MltC_CompanyName : result?.header?.CompanyFullName}</div>
                                                <div style={{ fontSize: "13px" }}>Authorised Signatory</div>
                                            </td>
                                        </tr>

                                        {/* 13. DECLARATION ROW */}
                                        <tr>
                                            <td colSpan="8" style={{ border: "1px solid #dbdbdb", padding: "8px", fontSize: "11px", color: "#555" }}>
                                                <div dangerouslySetInnerHTML={{ __html: result?.header?.Declaration }} />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
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

export default InvoicePrintB
