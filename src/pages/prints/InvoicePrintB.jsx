
import "../../assets/css/prints/InvoicePrintB.css";
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
    return (
        <>
            {loader ? (
                <Loader />
            ) : (
                <>
                    {msg === "" ? (
                        <>
                            <div className="beluxecontainer">
                                <div className="printbtn" style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                                    <button
                                        className="btn_white blue mb-0 hidedp10_pcl7 m-0 p-2"
                                        onClick={(e) => handlePrint(e)}
                                    >
                                        Print
                                    </button>
                                </div>
                                <div className="logobar"  >
                                    <div >
                                        <img src={result?.header?.PrintLogo} alt="logo" />
                                    </div>
                                    <div className="brandname">
                                        <p> {result?.header?.CompanyFullName}</p>
                                    </div>
                                </div>
                                <div className="title" style={{ backgroundColor: "#8bd2ed5c" }}  >

                                    <div style={{ textAlign: "center" }}>
                                        <p className="titletext"> {result?.header?.PrintHeadLabel}</p>
                                    </div>
                                </div>

                                <div className="companyDetails" >
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <div style={{ width: "45%", border: "1px solid #dbdbdb", borderTop: "none", borderBottom: "none" }}>
                                            <h3 style={{ borderBottom: "1px solid #dbdbdb", padding: "5px " }}> {result?.header?.CompanyFullName}</h3>
                                            <div className="address" style={{ padding: "5px  " }}>
                                                <b>Address:</b>
                                                <div style={{ wordBreak: "word-break" }}>
                                                    {result?.header?.CompanyAddress}
                                                    <br />
                                                    {result?.header?.CompanyState || result?.header?.Company_CST_STATE_No ? (
                                                        <>
                                                            {result?.header?.CompanyState && (
                                                                <>State Name: {result.header.CompanyState}</>
                                                            )}

                                                            {result?.header?.CompanyState &&
                                                                result?.header?.Company_CST_STATE_No && " | "}

                                                            {result?.header?.Company_CST_STATE_No && (
                                                                <>State Code: {result.header.Company_CST_STATE_No}</>
                                                            )}
                                                        </>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ width: "30%", border: "1px solid #dbdbdb", borderTop: "none" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", height: "33%" }}>
                                                <div style={{ borderBottom: "1px solid #dbdbdb", padding: "5px", width: "50%", borderRight: "1px solid #dbdbdb" }}>Invoice No.</div>
                                                <div style={{ borderBottom: "1px solid #dbdbdb", padding: "5px", width: "50%" }}> {result?.header?.InvoiceNo}</div>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", height: "33%" }}>
                                                <div style={{ borderBottom: "1px solid #dbdbdb", padding: "5px", width: "50%", borderRight: "1px solid #dbdbdb" }}>DATE</div>
                                                <div style={{ borderBottom: "1px solid #dbdbdb", padding: "5px", width: "50%" }}> {result?.header?.EntryDate}</div>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", height: "33%" }}>
                                                <div style={{ padding: "5px", width: "50%", borderRight: "1px solid #dbdbdb" }}>DUE DATE</div>
                                                <div style={{ padding: "5px", width: "50%" }}> {result?.header?.DueDate}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex" }}>
                                        <div style={{ border: "1px solid #dbdbdb", padding: "5px", width: "45%", }}>Contact Number: {result?.header?.CompanyTellNo} </div>
                                        <div style={{ border: "1px solid #dbdbdb", padding: "5px", width: "25%", borderRight: "1px solid #dbdbdb", borderLeft: "none" }}>  </div>
                                        <div style={{ borderBottom: "1px solid #dbdbdb", width: "30%", borderRight: "1px solid #dbdbdb" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <div style={{ width: "50%", borderRight: "1px solid #dbdbdb", padding: "5px" }}>ISSUED BY</div>
                                                <div style={{ padding: "5px", width: "50%" }}> </div>
                                            </div> </div>
                                    </div>
                                    <div style={{ display: "flex" }}>
                                        <div style={{ borderBottom: "1px solid #dbdbdb", padding: "5px", width: "45%", borderRight: "1px solid #dbdbdb", borderLeft: "1px solid #dbdbdb" }}>Email: {result?.header?.CompanyEmail} </div>
                                        <div style={{ borderBottom: "1px solid #dbdbdb", padding: "5px", width: "25%", borderRight: "1px solid #dbdbdb" }}>  </div>
                                        <div style={{ borderBottom: "1px solid #dbdbdb", width: "30%", borderRight: "1px solid #dbdbdb" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <div style={{ width: "50%", borderRight: "1px solid #dbdbdb", padding: "5px" }}>Customer Code</div>
                                                <div style={{ padding: "5px", width: "50%" }}>{result?.header?.Customercode} </div>
                                            </div> </div>
                                    </div>
                                    <div style={{ display: "flex" }}>
                                        <div style={{ borderBottom: "1px solid #dbdbdb", width: "50%", borderRight: "1px solid #dbdbdb", borderLeft: "1px solid #dbdbdb" }}>
                                            <div style={{ borderBottom: "1px solid #dbdbdb", padding: "5px ", textAlign: "center", fontWeight: "bold", backgroundColor: "#8bd2ed5c" }}>CUSTOMER</div>
                                            <div style={{ padding: "5px " }}>
                                                TO:
                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <b>Company:</b>   <span> {result?.header?.customerfirmname}</span>
                                                </div>
                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <b>Name:</b>   <span> {result?.header?.CustName}</span>
                                                </div>

                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <b>ADDRESS:</b>   <span> {result?.header?.customerAddress1 + " " + result?.header?.customerAddress2 + " " + result?.header?.customerAddress3}</span>
                                                </div>
                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <b>Contact Number:</b>   <span>{result?.header?.customermobileno1}</span>
                                                </div>
                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <b>Email:</b>   <span> {result?.header?.customeremail1}</span>
                                                </div>

                                            </div>
                                        </div>
                                        <div style={{ borderBottom: "1px solid #dbdbdb", width: "50%", borderRight: "1px solid #dbdbdb" }}>
                                            <div style={{ borderBottom: "1px solid #dbdbdb", padding: "5px 5px", textAlign: "center", fontWeight: "bold", backgroundColor: "#8bd2ed5c" }}>&nbsp;</div>
                                            <div style={{ padding: "5px " }}>
                                                TO:

                                                <div>
                                                    {result?.header?.Printlable?.split(/\r?\n/).map((line, index) => (
                                                        <div key={index}>{line}</div>
                                                    ))}
                                                </div>


                                                {/* <div style={{ display: "flex", gap: "10px" }}>
                                                    <b>Name:</b>   <span> {result?.header?.CustName}</span>
                                                </div>

                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <b>ADDRESS:</b>   <span> {result?.header?.customercity + " " + result?.header?.customerstate}</span>
                                                </div>
                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <b>Contact Number:</b>   <span>{result?.header?.customermobileno1}</span>
                                                </div>
                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <b>Email:</b>   <span> {result?.header?.customeremail1}</span>
                                                </div> */}

                                            </div>
                                        </div>


                                    </div>


                                    {/* table  */}
                                    <div className='tblrow' style={{ backgroundColor: "#8bd2ed5c" }}>
                                        <div className='srcol colpad border_right' style={{ fontWeight: "bold" }}> SR</div>
                                        <div className='stycol colpad border_right' style={{ fontWeight: "bold" }}> Style Number</div>
                                        <div className='imgcol colpad border_right' style={{ fontWeight: "bold" }}> Image</div>
                                        <div className='descol colpad border_right' style={{ fontWeight: "bold" }}> DESCRIPTION</div>
                                        <div className='qtycol colpad border_right' style={{ fontWeight: "bold" }}> Qty</div>
                                        <div className='tagcol colpad border_right' style={{ fontWeight: "bold" }}> Tag Price</div>
                                        <div className='discol colpad border_right' style={{ fontWeight: "bold" }}> Discount</div>
                                        <div className='tlcol colpad border_right' style={{ fontWeight: "bold" }}> <span style={{ marginRight: "5px" }}>Total</span> <span
                                            dangerouslySetInnerHTML={{
                                                __html: `  (in ${result?.header?.Currencysymbol})`,
                                            }}
                                        /></div>
                                    </div>
                                    {result?.resultArray?.map((e, i) => {

                                        console.log("TCL: Beluxe -> eeeee", e?.diamonds)
                                        const materialTypes = [
                                            ...new Set(
                                                (e?.diamonds || [])
                                                    .map((item) => item?.MaterialTypeName?.trim())
                                                    .filter(Boolean)
                                            ),
                                        ].join(" + ");
                                        return (

                                            <div className='tblrow'  >
                                                <div className='srcol colpad border_right' > {i + 1}</div>
                                                <div className='stycol colpad border_right' > {e?.designno} <br />{e?.GroupJob ? e?.GroupJob : e?.SrJobno}</div>
                                                <div className='imgcol colpad border_right' >
                                                    <img
                                                        src={e?.DesignImage}

                                                        onError={(e) => handleImageError(e)}
                                                        alt="design"
                                                        className="imgdp10_pcl7"
                                                    />
                                                </div>
                                                <div className='descol colpad border_right' > {e?.MetalType}  {e?.MetalColor} {e?.MetalPurity} <br /> {materialTypes}  {" "} {e?.Categoryname}  </div>
                                                <div className='qtycol colpad border_right' > {e?.BulkPurchaseQTY ? e?.BulkPurchaseQTY : e?.Quantity}</div>
                                                <div className='tagcol colpad border_right' style={{ justifyContent: "flex-end" }} >  {formatAmount((e?.UnitCost / result?.header?.CurrencyExchRate))}</div>
                                                <div className='discol colpad border_right' style={{ justifyContent: "flex-end" }}>{formatAmount((e?.DiscountAmt / result?.header?.CurrencyExchRate))}</div>
                                                <div className='tlcol colpad border_right' style={{ justifyContent: "flex-end" }} > {formatAmount((e?.TotalAmount / result?.header?.CurrencyExchRate))}</div>
                                            </div>

                                        )
                                    })}




                                    {/* total  */}
                                    <div className='tblrow' style={{ fontWeight: "bold" }}>
                                        <div className='total colpad border_right' > Total</div>

                                        <div className='qtycol colpad border_right' > {totalQty}</div>
                                        <div className='tagcol colpad border_right' style={{ justifyContent: "flex-end" }} >  {formatAmount((result?.mainTotal?.total_unitcost / result?.header?.CurrencyExchRate))}</div>
                                        <div className='discol colpad border_right' style={{ justifyContent: "flex-end" }}>  {formatAmount((result?.mainTotal?.total_discount / result?.header?.CurrencyExchRate))} </div>
                                        <div className='tlcol colpad border_right' style={{ justifyContent: "flex-end" }}>  {formatAmount((result?.mainTotal?.total_amount / result?.header?.CurrencyExchRate))}</div>
                                    </div>

                                    {/* grandtotal */}
                                    <div style={{ border: "1px solid #dbdbdb", borderTop: "none", display: "flex" }}>
                                        <div style={{ borderRight: "1px solid #dbdbdb", width: "71%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                          
                                          {result?.header?.Remark &&(
                                            <div className="w-100 px-1 mt-1 mb-1 d-flex">
                                            <p className="fw-bold">Remark:&nbsp;</p>
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: result?.header?.Remark,
                                                }}
                                                className=""
                                            />
                                        </div>
                                          )}
                                            

                                            {result?.header?.SalesRepPolicyTermsDescription &&(
                                                 <div className="terms" style={{ padding: "5px", borderTop: "1px solid #dbdbdb" }}>
                                                
                                                 <div className="w-100 px-1 mt-1 mb-1 d-flex">
                                                     <p className="fw-bold">TERMS INCLUDED:&nbsp;</p>
                                                     <div
                                                     
                                                         dangerouslySetInnerHTML={{
                                                             __html: result?.header?.SalesRepPolicyTermsDescription,
                                                         }}
                                                         className=""
                                                     />
                                                 </div>
                                         
                                         </div>
                                            )}

                                            
                                        </div>
                                        <div style={{ width: "29%", fontWeight: "bold" }}>
                                            {result?.allTaxes?.length > 0 && (
                                                <div style={{ display: "flex", borderBottom: "1px solid #dbdbdb" }}>
                                                    <div style={{ width: "50%", borderRight: "1px solid #dbdbdb", padding: "5px", fontWeight: "bold" }}>  {result?.allTaxes?.map((e, i) => {
                                                        return (
                                                            <div
                                                                className="w-100 d-flex align-items-center tb_fs_pcls"
                                                                key={i}
                                                            >
                                                                <div
                                                                    style={{ width: "100%" }}
                                                                    className="end_pcls pdr_pcls"
                                                                >
                                                                    {e?.name} @ {e?.per}
                                                                </div>

                                                            </div>
                                                        );
                                                    })}</div>



                                                    <div style={{ textAlign: "right", width: "50%", padding: "5px", fontWeight: "bold" }}>

                                                        {result?.allTaxes?.map((e, i) => {
                                                            return (
                                                                <div
                                                                    className="w-100 d-flex align-items-center tb_fs_pcls"
                                                                    key={i}
                                                                >

                                                                    <div
                                                                        style={{ width: "100%" }}
                                                                        className="end_pcls pdr_pcls"
                                                                    >
                                                                        <span
                                                                            style={{ fontSize: "13px" }}
                                                                            dangerouslySetInnerHTML={{ __html: result?.header?.Currencysymbol }}
                                                                        ></span>  {formatAmount(e?.amount)}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ display: "flex", borderBottom: "1px solid #dbdbdb", fontWeight: "bold" }}>
                                                <div style={{ width: "50%", borderRight: "1px solid #dbdbdb", padding: "5px" }}>Total Amount</div>
                                                <div style={{ textAlign: "right", width: "50%", padding: "5px" }}> <span
                                                    style={{ fontSize: "13px" }}
                                                    dangerouslySetInnerHTML={{ __html: result?.header?.Currencysymbol }}
                                                ></span> {formatAmount(((result?.mainTotal?.total_amount / result?.header?.CurrencyExchRate) + result?.allTaxesTotal))}</div>
                                            </div>

                                            {result?.header?.FreightCharges > 0 && (
                                                <div style={{ display: "flex", borderBottom: "1px solid #dbdbdb", fontWeight: "bold" }}>
                                                    <div style={{ width: "50%", borderRight: "1px solid #dbdbdb", padding: "5px" }}>Shipping</div>
                                                    <div style={{ textAlign: "right", width: "50%", padding: "5px" }}><span
                                                        style={{ fontSize: "13px" }}
                                                        dangerouslySetInnerHTML={{ __html: result?.header?.Currencysymbol }}
                                                    ></span>  {formatAmount((result?.header?.FreightCharges / result?.header?.CurrencyExchRate))}</div>
                                                </div>
                                            )}

                                            {result?.header?.AddLess !== 0 && (
                                                <div style={{ display: "flex", borderBottom: "1px solid #dbdbdb", fontWeight: "bold" }}>
                                                    <div style={{ width: "50%", borderRight: "1px solid #dbdbdb", padding: "5px" }}>Round up</div>
                                                    <div style={{ textAlign: "right", width: "50%", padding: "5px" }}><span
                                                        style={{ fontSize: "13px" }}
                                                        dangerouslySetInnerHTML={{ __html: result?.header?.Currencysymbol }}
                                                    ></span> {formatAmount((result?.header?.AddLess / result?.header?.CurrencyExchRate))}</div>
                                                </div>
                                            )}



                                            <div style={{ display: "flex", fontWeight: "bold" }}>
                                                <div style={{ width: "50%", borderRight: "1px solid #dbdbdb", padding: "5px" }}>Total</div>
                                                <div style={{ textAlign: "right", width: "50%", padding: "5px" }}>  <span
                                                    style={{ fontSize: "13px" }}
                                                    dangerouslySetInnerHTML={{ __html: result?.header?.Currencysymbol }}
                                                ></span> {formatAmount(
                                                    result?.mainTotal?.total_amount /
                                                    result?.header?.CurrencyExchRate +
                                                    result?.allTaxesTotal +
                                                    result?.header?.AddLess / result?.header?.CurrencyExchRate +
                                                    result?.header?.FreightCharges /
                                                    result?.header?.CurrencyExchRate
                                                )}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ border: "1px solid #dbdbdb", borderTop: "none", display: "flex" }}>
                                        <div style={{ width: "50%", borderRight: "1px solid #dbdbdb" }}>
                                            <div style={{ padding: "5px", fontWeight: "bold", borderBottom: "1px solid #dbdbdb", textAlign: "center" }}>Bank Details</div>
                                            <div style={{ padding: "5px", borderBottom: "1px solid #dbdbdb", textAlign: "center" }}> <b>Account Name:</b> <span> {result?.header?.bankname}</span></div>
                                            <div style={{ padding: "5px", borderBottom: "1px solid #dbdbdb", textAlign: "center" }}> <b>Account Number:</b> <span> {result?.header?.accountnumber}</span></div>
                                            <div style={{ padding: "5px", borderBottom: "1px solid #dbdbdb", textAlign: "center" }}> <b>Routing Number:</b> <span> {result?.header?.rtgs_neft_ifsc}</span></div>
                                            <div style={{ padding: "5px", textAlign: "center" }}> <b>Zelle ID.:</b> <span> {result?.header?.bankaddress}</span></div>

                                        </div>
                                        <div style={{ width: "50%" }}> </div>
                                    </div>

                                    <div style={{ border: "1px solid #dbdbdb", borderTop: "none", display: "flex", height: "100px" }}>
                                        <div style={{ width: "50%", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", padding: "5px" }}>
                                            <b>Customer Signature</b>
                                            <div>__________________</div>
                                        </div>
                                        <div style={{ width: "50%", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", padding: "5px" }}>
                                            <b> {result?.header?.CompanyFullName} </b>
                                            <div>Authorised Signatory</div>
                                        </div>
                                    </div>

                                    <div style={{ border: "1px solid #dbdbdb", borderTop: "none", padding: "5px" }}>
                                        <div dangerouslySetInnerHTML={{ __html: result?.header?.Declaration }} />




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

export default InvoicePrintB
