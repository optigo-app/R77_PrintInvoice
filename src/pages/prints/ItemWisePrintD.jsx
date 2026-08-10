// http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=SlMvODExLzI1LTI2&evn=c2FsZQ==&pnm=aXRlbSB3aXNlIHByaW50IHA=&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=ItemWisePrint1&pid=undefined
import React, { useState, useEffect } from "react";
import "../../assets/css/prints/itemwiseprintP.css";
import {
    apiCall,
    handlePrint,
    taxGenrator,
    isObjectEmpty,
    NumberWithCommas,
    fixedValues,
    checkMsg,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import { cloneDeep } from "lodash";
import { OrganizeInvoicePrintData } from "../../GlobalFunctions/OrganizeInvoicePrintData";

const ItemWisePrintP = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
    const [loader, setLoader] = useState(true);
    const [json0Data, setjson0Data] = useState({});
    const [msg, setMsg] = useState("");
    const [data, setData] = useState([]);
    const [total, setTotal] = useState({
        count: 0,
        gwt: 0,
        nwt: 0,
        mamt: 0,
        labourAmt: 0,
        fineAmt: 0,
        totalAmt: 0,
        igst: 0,
        numberToWords: "",
        cgst: 0,
        sgst: 0,
        less: 0,
        dPcs: 0,
        dWt: 0,
        dAmt: 0,
        cPcs: 0,
        cWt: 0,
        cAmt: 0,
        fineWts: 0,
    });
    const [finalTotal, setFinalTotal] = useState({
        otherAmt: 0,
        pkgWt: 0,
    });
    const [taxes, setTaxes] = useState([]);
    const [disocunt, setDiscount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [generalLedgerData, setGeneralLedgerData] = useState(null);
    const [organizeData, setOrganizeData] = useState(null);

    const loadData = (data) => {
        const datas = OrganizeInvoicePrintData(
            data?.BillPrint_Json[0],
            data?.BillPrint_Json1,
            data?.BillPrint_Json2
        );
        setOrganizeData(datas);


        setjson0Data(data?.BillPrint_Json[0]);
        let totals = { ...total };
        let arr = [];
        let discountAmount = 0;
        let otherAmounts = 0;
        let pkgWt = 0;
        let allArr = [];
        let metals = [];
        data?.BillPrint_Json1.forEach((e, i) => {
            let obj = cloneDeep(e);
            obj.metalRates =
                data?.BillPrint_Json2?.find(
                    (ele, ind) =>
                        ele?.MasterManagement_DiamondStoneTypeid === 4 &&
                        ele?.IsPrimaryMetal === 1 &&
                        ele?.StockBarcode === e?.SrJobno
                )?.Rate || 0;
            obj.counts = 1;
            let findings = {
                Wt: 0,
                SizeName: 0,
            };
            let sizeWt = 0;
            data?.BillPrint_Json2?.forEach((ele, ind) => {
                if (
                    ele?.MasterManagement_DiamondStoneTypeid === 5 &&
                    ele?.StockBarcode === e?.SrJobno
                ) {
                    findings.Wt += ele?.Wt;
                    findings.SizeName += +ele?.SizeName;
                    sizeWt += +ele?.SizeName * ele?.Wt;
                }
            });
            let fineWtss =
                ((e?.NetWt - findings?.Wt) * e?.Tunch) / 100 + sizeWt / 100;

            obj.fineWtss = fineWtss;
            totals.fineWts += fineWtss;
            allArr?.push(obj);
        });
        allArr.forEach((e, i) => {
            // totals.fineWts += (e?.NetWt * (e?.Tunch)) / 100;
            pkgWt += e?.PackageWt;
            discountAmount += e?.DiscountAmt;
            let findIndex = arr.findIndex(
                (ele, ind) => ele?.SrJobno === e?.SrJobno
                // ele?.Categoryname === e?.Categoryname &&
                // ele?.Collectionname === e?.Collectionname &&
                // ele?.Wastage === e?.Wastage &&
                // ele?.MetalPurity === e?.MetalPurity
            );
            otherAmounts += e?.TotalDiamondHandling + e?.OtherCharges + e?.MiscAmount;
            if (findIndex === -1) {
                let count = 1;
                let obj = cloneDeep(e);
                obj.fineWts = (e?.NetWt * e?.Tunch) / 100;
                obj.diamondPcs = 0;
                obj.diamondWt = 0;
                obj.miscWt = 0;
                obj.diamondAmt = 0;
                obj.diamondSettingAmt = 0;
                obj.colorStoneSettingAmt = 0;
                obj.diamondRate = 0;
                obj.colorStonePcs = 0;
                obj.colorStoneWt = 0;
                obj.colorStoneAmt = 0;
                obj.colorStoneRate = 0;
                obj.metalPcs = 0;
                obj.metalWt = 0;
                obj.metalAmt = 0;
                obj.metalRate = 0;
                data?.BillPrint_Json2?.forEach((ele, ind) => {
                    if (ele?.StockBarcode === e?.SrJobno) {
                        if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
                            obj.diamondSettingAmt += ele?.SettingAmount;
                        } else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
                            obj.colorStoneSettingAmt += ele?.SettingAmount;
                        }
                    }
                });

                if (
                    atob(printName).toLowerCase() === "item wise print1" ||
                    atob(printName).toLowerCase() === "item wise print2"
                ) {
                    let makingAmount = e?.MaKingCharge_Unit?.toString()?.split(".");
                    if (makingAmount?.length === 1) {
                        makingAmount = +(makingAmount + "000");
                    } else {
                        makingAmount = +(makingAmount[0] + "000" + makingAmount[1]);
                    }
                    obj.MaKingCharge_Unit = makingAmount;
                }
                obj.count = count;
                obj.otherAmt =
                    e?.TotalDiamondHandling + e?.OtherCharges + e?.MiscAmount;
                let srJobArr = [];
                srJobArr.push(e?.SrJobno);
                obj.srJobArr = srJobArr;
                arr.push(obj);
            } else {
                if (e?.GroupJob === "") {
                    arr[findIndex].count += 1;
                }
                let diamondSettingAmt = 0;
                let colorStoneSettingAmt = 0;

                data?.BillPrint_Json2?.forEach((ele, ind) => {
                    if (ele?.StockBarcode === e?.SrJobno) {
                        if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
                            diamondSettingAmt += ele?.SettingAmount;
                        } else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
                            colorStoneSettingAmt += ele?.SettingAmount;
                        }
                    }
                });
                arr[findIndex].fineWts += (e?.NetWt * (e?.Tunch + e?.Wastage)) / 100;
                arr[findIndex].diamondSettingAmt += diamondSettingAmt;
                arr[findIndex].Tunch += e?.Tunch;
                // arr[findIndex].Wastage += e?.Wastage;
                arr[findIndex].colorStoneSettingAmt += colorStoneSettingAmt;
                arr[findIndex].grosswt += e?.grosswt;
                arr[findIndex].NetWt += e?.NetWt;
                arr[findIndex].MakingAmount += e?.MakingAmount;
                arr[findIndex].OtherCharges += e?.OtherCharges;
                arr[findIndex].DiscountAmt += e?.DiscountAmt;
                arr[findIndex].TotalAmount += e?.TotalAmount;
                arr[findIndex].UnitCost += e?.UnitCost;
                arr[findIndex].MetalAmount += e?.MetalAmount;
                arr[findIndex].otherAmt +=
                    e?.TotalDiamondHandling + e?.OtherCharges + e?.MiscAmount;
                arr[findIndex].metalRates += e?.metalRates;
                arr[findIndex].counts += e?.counts;
                arr[findIndex].fineWtss += e?.fineWtss;
                arr[findIndex].srJobArr.push(e?.SrJobno);
            }
        });
        setFinalTotal({ ...finalTotal, otherAmt: otherAmounts, pkgWt: pkgWt });
        setDiscount(discountAmount);
        let resultArr = [];
        let totalAmounts = 0;
        arr.forEach((e, i) => {
            let obj = { ...e };
            // obj.FineWt = 0;
            totalAmounts += e?.TotalAmount;
            obj.OtherAmount = 0;
            data?.BillPrint_Json2.forEach((ele, ind) => {
                obj.srJobArr.map((elem, index) => {
                    // if (obj?.id === ele?.Hid) {
                    // obj.OtherAmount
                    if (elem === ele?.StockBarcode) {
                        if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
                            obj.metalPcs += ele?.Pcs;
                            obj.metalWt += ele?.Wt;
                            obj.metalAmt += ele?.Amount;
                            // obj.FineWt += ele?.FineWt;
                            // metal
                        } else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
                            // color stone
                            obj.colorStonePcs += ele?.Pcs;
                            totals.cPcs += ele?.Pcs;
                            totals.cWt += ele?.Wt;
                            totals.cAmt += ele?.Amount;
                            obj.colorStoneWt += ele?.Wt;
                            obj.colorStoneAmt += ele?.Amount;
                        } else if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
                            // diamond
                            obj.diamondPcs += ele?.Pcs;
                            totals.dPcs += ele?.Pcs;
                            totals.dWt += ele?.Wt;
                            totals.dAmt += ele?.Amount;
                            obj.diamondWt += ele?.Wt;
                            obj.diamondAmt += ele?.Amount;
                        } else if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
                            // diamond

                            obj.miscWt += ele?.Wt;

                        }
                    }
                });
            });
            resultArr.push(obj);
        });
        setTotalAmount(totalAmounts);
        resultArr.sort((a, b) => {
            const nameA = a.Collectionname.toLowerCase();
            const nameB = b.Collectionname.toLowerCase();

            if (nameA < nameB) {
                return -1;
            }

            if (nameA > nameB) {
                return 1;
            }

            return 0; // names are equal
        });

        resultArr.forEach((e, i) => {
            totals.count += e?.count;
            totals.gwt += e?.grosswt;
            totals.nwt += e?.NetWt;
            totals.mamt += e?.MetalAmount;
            totals.labourAmt +=
                e?.MakingAmount + e?.diamondSettingAmt + e?.colorStoneSettingAmt;
            totals.fineAmt += e?.FineWt;
            totals.totalAmt += e?.TotalAmount;
        });
        totals.igst = (totals.totalAmt * data?.BillPrint_Json[0]?.IGST) / 100;
        totals.cgst = (totals.totalAmt * data?.BillPrint_Json[0]?.CGST) / 100;
        totals.sgst = (totals.totalAmt * data?.BillPrint_Json[0]?.SGST) / 100;
        totals.less = data?.BillPrint_Json[0]?.AddLess;
        // totals.totalAmt = totals.totalAmt + totals.cgst + totals.sgst + totals.less;
        // tax
        let taxValue = taxGenrator(data?.BillPrint_Json[0], totals.totalAmt);
        setTaxes(taxValue);
        taxValue.length > 0 &&
            taxValue.forEach((e, i) => {
                totals.totalAmt += +e?.amount;
            });
        // tax end
        totals.totalAmt += totals.less;
        totals.totalAmt = fixedValues(totals.totalAmt, 2);
        // resultArr?.forEach((e, i) => {
        //   e.fineWts = (e?.NetWt * (e?.Tunch + e?.Wastage)) / 100;
        //   totals.fineWts +=  (e?.NetWt * (e?.Tunch + e?.Wastage)) / 100;
        // })

        resultArr.sort((a, b) => {
            const keyA = a?.MetalType + a?.MetalPurity;
            const keyB = b?.MetalType + b?.MetalPurity;

            // Compare the name values directly
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });
        setTotal(totals);
        setData(resultArr);
    };

    useEffect(() => {
        const sendData = async () => {
            setLoader(true);
            try {
                // Call the first API
                const data1 = await apiCall(
                    token,
                    invoiceNo,
                    printName,
                    urls,
                    evn,
                    ApiVer
                );
                if (data1?.Status === "200") {
                    const isEmpty = isObjectEmpty(data1?.Data);
                    if (!isEmpty) {
                        loadData(data1?.Data); // existing loader function
                    } else {
                        setMsg("Data Not Found for first API");
                    }
                } else {
                    const err = checkMsg(data1?.Message);
                    setMsg(err);
                }

                // Changing Only Last Name In First API's URL, As Told Per Mahesh Sir On 07/11/2025_4:00_PM
                const firstApiUrl = urls;
                const newUrl = firstApiUrl.replace('SaleBill_Json', 'BillOpeningClosingBalance_Json');
                // console.log("newUrl", newUrl);

                const data2 = await apiCall(
                    token,
                    invoiceNo,
                    printName,
                    newUrl,
                    evn,
                    ApiVer
                );

                if (data2?.Status === "200") {
                    const arr = data2?.Data?.BillOpeningClosingBalance_Json;
                    if (arr?.length > 0) {
                        setGeneralLedgerData(arr[0]);
                    } else {
                        console.log("Data Not Found for second API");
                    }
                } else {
                    const err2 = checkMsg(data2?.Message);
                    console.log(err2);
                }

                setLoader(false);
            } catch (error) {
                console.error("Error in API calls:", error);
                setLoader(false);
            }
        };

        sendData();
    }, []);

    function PrintableText({ json0Data }) {
        const htmlContent = json0Data?.Printlable?.replace(/\n/g, "<br />");

        return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }

    const TotalfineWtss = (data || []).reduce(
        (sum, item) => sum + (item?.fineWtss || 0),
        0
    );
    const FinalTotalAmount = (data || []).reduce(
        (sum, item) => sum + (item?.TotalAmount || 0),
        0
    );
    const TotalDiscountAmt = (data || []).reduce(
        (sum, item) => sum + (item?.DiscountAmt || 0),
        0
    );
    const FinalTotal = FinalTotalAmount + TotalDiscountAmt;

    const FirstMetalFine = json0Data?.Tunch_1 === 0 ? 0 : (json0Data?.Metal_Wt_1 ?? 0) * (json0Data?.Tunch_1 ?? 0) / 100;
    const SecondMetalFine = json0Data?.Tunch_2 === 0 ? 0 : (json0Data?.Metal_Wt_2 ?? 0) * (json0Data?.Tunch_2 ?? 0) / 100;
    const TotalReceivedFine = FirstMetalFine + SecondMetalFine;
    const ReceivedFineAmont = json0Data?.Rate_Cut_Rate / 10 * TotalReceivedFine;

    // console.log("data", data);
    // console.log("generalLedgerData", generalLedgerData);
    console.log("json0Data", json0Data);

    console.log("TCL: data", data)


    console.log("TCL:organizeData ", organizeData)

    
  const finalAmount =
  (organizeData?.mainTotal?.TotalAmount + json0Data?.FreightCharges) /
  json0Data?.CurrencyExchRate +
  organizeData?.allTaxesTotal;

    return (
        <>
            {loader ? (
                <Loader />
            ) : msg === "" ? (
                <div className={`itemWisePrintfont pad_60_allPrint`}>
                    {/* Print Button */}
                    <div className="d-flex justify-content-end align-items-center print_sec_sum4 mb-4 pt-4 max_width_container px-1 mx-auto">
                        <div className="form-check printLeftitemWise">
                            <input
                                type="button"
                                className="btn_white blue"
                                value="Print"
                                onClick={(e) => handlePrint(e)}
                                style={{ fontSize: "14px" }}
                            />
                        </div>
                    </div>

                    <div className={`max_width_container mt-2 mx-auto px-1`}>
                        <div className={``}>
                            {/* Main Header */}
                            <div className={`w-100 fw-bold bgLightPink d-flex justify-content-center itemWisePrint1Font_16_total align-items-center brbxAll`}>
                                {json0Data?.PrintHeadLabel === ""
                                    ? "INVOICE PRINT"
                                    : json0Data?.PrintHeadLabel}
                            </div>

                            {/* Company & Customer Address */}
                            <div className="d-flex spbrlFt brBtom">
                                {/* <div className="w1_inv2 itemWisePrintHead">
                  <div style={{ paddingTop: "2px" }}></div>
                  {json0Data?.CompanyFullName !== "" && (
                    <div className="spfntBld spfntsZ">
                      {json0Data?.CompanyFullName}
                    </div>
                  )}
                  {json0Data?.CompanyAddress !== "" && (
                    <div>{json0Data?.CompanyAddress}</div>
                  )}
                  {json0Data?.CompanyAddress2 !== "" && (
                    <div>{json0Data?.CompanyAddress2}</div>
                  )}
                  <div className="">
                    {json0Data?.CompanyCity}{" "}
                    {json0Data?.CompanyCity &&
                      json0Data?.CompanyPinCode !== "" &&
                      "-"}{" "}
                    {json0Data?.CompanyPinCode !== "" &&
                      `${json0Data?.CompanyPinCode},`}{" "}
                    {json0Data?.CompanyState}
                    {json0Data?.CompanyCountry !== "" &&
                      `(${json0Data?.CompanyCountry})`}
                  </div>
                  {json0Data?.CompanyTellNo !== "" && (
                    <div className="">T {json0Data?.CompanyTellNo}</div>
                  )}
                </div> */}

                                <div className="w2_inv2 itemWisePrintHead" style={{ width: "70%" }}>
                                    <div style={{ paddingTop: "2px" }}></div>
                                    {json0Data?.customerfirmname !== "" && (
                                        <div className="spfntsZ spfntBld">
                                            {json0Data?.customerfirmname}
                                        </div>
                                    )}
                                    {/* {json0Data?.Printlable !== "" && (
                    <div>
                      <PrintableText json0Data={json0Data} />
                    </div>
                  )} */}
                                    {json0Data?.customerAddress1 !== "" && (
                                        <div className="">{json0Data?.customerAddress1}</div>
                                    )}
                                    {json0Data?.customerAddress2 !== "" && (
                                        <div className="">{json0Data?.customerAddress2}</div>
                                    )}
                                    {json0Data?.customerAddress3 !== "" && (
                                        <div className="">{json0Data?.customerAddress3}</div>
                                    )}
                                    {(json0Data?.customercity1 !== "" || json0Data?.customerpincode !== "") && (
                                        <div className="">{json0Data?.customercity1} {json0Data?.customerpincode}</div>
                                    )}
                                    {json0Data?.customeremail1 !== "" && (
                                        <div className="">{json0Data?.customeremail1}</div>
                                    )}
                                </div>

                                <div className="w30_inv2 spbrRht" style={{ width: "30%" }}>
                                    <div
                                        className="d-flex itemWisePrintHead"
                                        style={{ paddingTop: "2px" }}
                                    >
                                        {json0Data?.InvoiceNo !== "" && (
                                            <>
                                                <div className="wdthHd spfntBld">INVOICE NO</div>
                                                <div className="wdthHd1">{json0Data?.InvoiceNo}</div>
                                            </>
                                        )}
                                    </div>
                                    <div className="d-flex itemWisePrintHead">
                                        {json0Data?.EntryDate !== "" && (
                                            <>
                                                <div className="wdthHd spfntBld">DATE</div>
                                                <div className="wdthHd1">{json0Data?.EntryDate}</div>
                                            </>
                                        )}
                                    </div>
                                    <div className="d-flex itemWisePrintHead">
                                        {/* {json0Data?.BillReferenceNo !== "" && ( <> */}
                                        <div className="wdthHd spfntBld">REF NO</div>
                                        <div className="wdthHd1">{json0Data?.BillReferenceNo}</div>
                                        {/* </>) } */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table Heading */}
                        <div className={`no_break bgLightPink d-flex spbrlFt spbrRht brBtom main_pad_item_wise_print itemWisePrintFont_11`}>
                            <div className={`metaltypeItemWisePrint1 spbrRht itemWisePrintHead`} style={{ width: "6%", minWidth: "6%" }}>
                                <p className="fw-bold" style={{ wordBreak: "normal" }}>
                                    METAL TYPE
                                </p>
                            </div>

                            <div className={`categoryItemWisePrint1 spbrRht`}>
                                <p className="fw-bold" style={{ wordBreak: "normal" }}>
                                    CATEGORY
                                </p>
                            </div>

                            <div className={`pkgItemWisePrint1 spbrRht`}>
                                <p className="fw-bold" style={{ wordBreak: "normal" }}>
                                    JOB
                                </p>
                            </div>

                            <div className={`countItemWisePrint1 spbrRht`}>
                                <p className="fw-bold" style={{ wordBreak: "normal" }}>
                                    PCS
                                </p>
                            </div>

                            <div className={`gwtItemWisePrint1 spbrRht`}>
                                <p className="fw-bold" style={{ wordBreak: "normal" }}>
                                    G.WT.
                                </p>
                            </div>

                            <div className={`tnchItemWisePrint1 spbrRht`}>
                                <p className="fw-bold" style={{ wordBreak: "normal" }}>
                                    STONE WT.
                                </p>
                            </div>
                            <div className={`makingItemWisePrint1 spbrRht`}>
                                <p className="fw-bold" style={{ wordBreak: "normal" }}>
                                    N.WT.
                                </p>
                            </div>
                            <div className={`makingItemWisePrint1 spbrRht`} style={{ width: "5%", minWidth: "5%" }}>
                                <p className="fw-bold" style={{ wordBreak: "normal" }}>
                                    PURITY
                                </p>
                            </div>


                            <div className={`wastageItemWisePrint1 spbrRht`}>
                                <p className="fw-bold" style={{ wordBreak: "normal" }}>
                                    WASTAGE
                                </p>
                            </div>

                            <div className={`fineAmt1 spbrRht`}>
                                <p className="fw-bold" style={{ wordBreak: "normal" }}>
                                    FINE
                                </p>
                            </div>



                            <div className={`totalAmt1`}>
                                <p className="fw-bold" style={{ wordBreak: "normal" }}>
                                    TOTAL AMT.
                                </p>
                            </div>
                        </div>

                        {/* Data */}
                        {data.length > 0 &&
                            data.map((e, i) => {
                                return (
                                    <div
                                        className={`no_break d-flex spbrlFt spbrRht brBtom main_pad_item_wise_print_row1 itemWisePrintFont_tab_14`}
                                        key={i}
                                    >
                                        <div
                                            className={`d-flex align-items-center metaltypeItemWisePrint1 spbrRht breakNormalItemWIse`}
                                            style={{ width: "6%", minWidth: "6%" }}
                                        >
                                            <p className={`itemWisePrintCategory`}>
                                                {e?.MetalType} {e?.MetalPurity}
                                            </p>
                                        </div>

                                        <div
                                            className={`d-flex align-items-center categoryItemWisePrint1 spbrRht`}
                                        >
                                            <p style={{ wordBreak: "normal" }}>
                                                {e?.Collectionname}-
                                                <span
                                                    className="fw-bold breakNormalItemWIse"
                                                    style={{ wordBreak: "normal" }}
                                                >
                                                    {e?.Categoryname}
                                                </span>
                                            </p>
                                        </div>

                                        <div
                                            className={`d-flex align-items-center  justify-content-center  pkgItemWisePrint1 spbrRht`}
                                        >
                                            <p className="text-end">
                                                {e?.SrJobno !== "" && e?.SrJobno}
                                            </p>
                                        </div>

                                        <div
                                            className={`d-flex align-items-center  justify-content-center  countItemWisePrint1 spbrRht`}
                                        >
                                            <p className="text-end">
                                                {NumberWithCommas(e?.count, 0)}
                                            </p>
                                        </div>

                                        <div
                                            className={`d-flex align-items-center  justify-content-center  gwtItemWisePrint1 spbrRht`}
                                        >
                                            <p className="text-end">
                                                {e?.grosswt !== 0 && NumberWithCommas(e?.grosswt, 3)}
                                            </p>
                                        </div>

                                        <div
                                            className={`d-flex align-items-center  justify-content-center  tnchItemWisePrint1 spbrRht`}
                                        >
                                            <p className="">


                                                {e?.diamondWt > 0 && <p>D: {NumberWithCommas(e?.diamondWt, 3)} ct</p>}
                                                {e?.colorStoneWt > 0 && <p>C: {NumberWithCommas(e?.colorStoneWt, 3)} ct</p>}
                                                {e?.miscWt > 0 && <p>M: {NumberWithCommas(e?.miscWt, 3)} gm</p>}
                                            </p>
                                        </div>
                                        <div
                                            className={`d-flex align-items-center  justify-content-center  makingItemWisePrint1 spbrRht`}
                                        >
                                            <p className="text-end">

                                                {NumberWithCommas(e?.NetWt, 3)}
                                            </p>
                                        </div>

                                        <div
                                            className={`d-flex align-items-center  justify-content-center  makingItemWisePrint1 spbrRht`}
                                            style={{ width: "5%", minWidth: "5%" }}
                                        >
                                            <p className="text-end">

                                                {e?.MetalPurity}
                                            </p>
                                        </div>

                                        <div
                                            className={`d-flex align-items-center justify-content-end spbrRht wastageItemWisePrint1`}
                                        >
                                            <p className="text-end">
                                                {" "}
                                                {e?.Wastage !== 0
                                                    ? NumberWithCommas(e?.Wastage, 3)
                                                    : ""}
                                            </p>
                                        </div>

                                        <div
                                            className={`d-flex align-items-center justify-content-end fineAmt1 spbrRht`}
                                        >
                                            <p className="text-end">
                                                {/* {e?.FineWt !== 0 && e?.FineWt} */}
                                                {NumberWithCommas(e?.fineWtss, 3)}
                                            </p>
                                        </div>



                                        <div
                                            className={`d-flex align-items-center justify-content-end totalAmt1`}
                                        >
                                            <p className="text-end">
                                                {e?.TotalAmount !== 0 &&
                                                    NumberWithCommas(e?.TotalAmount + e?.DiscountAmt, 2)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}

                        {json0Data?.IsReceivedItem !== 1 ? (
                            <div className="w-100 inExchngHeight spbrlFt spbrRht"></div>
                        ) : (
                            <>
                                <div className="w-100 fw-bold d-flex justify-content-center spbrlFt brBtom spbrRht spfntsZ inExchngMinHeight spcFrRecvdItm">Received Item</div>
                                <div className="w-100 d-flex spbrlFt spbrRht itemWisePrintFont_tab_14 brBtom">
                                    <div className={`metaltypeItemWisePrint1 spbrRht inExchngMinHeight`} style={{ width: "6%", minWidth: "6%" }}
                                    >
                                        <p className="" style={{ wordBreak: "normal" }}>
                                            {json0Data?.Metal_Type_1 !== "" && json0Data?.Metal_Type_1}
                                        </p>
                                    </div>

                                    <div className={`categoryItemWisePrint1 spbrRht`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                            {json0Data?.Description_1 !== "" && json0Data?.Description_1}
                                        </p>
                                    </div>

                                    <div className={`pkgItemWisePrint1 spbrRht`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                        </p>
                                    </div>

                                    <div className={`countItemWisePrint1 spbrRht`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                        </p>
                                    </div>

                                    <div className={`gwtItemWisePrint1 spbrRht text-end`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                            {json0Data?.Metal_Wt_1 === 0 ? "" : fixedValues(json0Data?.Metal_Wt_1, 3)}
                                        </p>
                                    </div>

                                    <div className={`tnchItemWisePrint1 spbrRht text-end`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                            {json0Data?.Tunch_1 === 0 ? "" : fixedValues(json0Data?.Tunch_1, 3)}
                                        </p>
                                    </div>

                                    <div className={`wastageItemWisePrint1 spbrRht`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                        </p>
                                    </div>

                                    <div className={`fineAmt1 spbrRht text-end`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                            {FirstMetalFine === 0 ? "" : fixedValues(FirstMetalFine, 3)}
                                        </p>
                                    </div>

                                    <div className={`makingItemWisePrint1 spbrRht`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                        </p>
                                    </div>

                                    <div className={`totalAmt1`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                        </p>
                                    </div>
                                </div>
                                <div className="w-100 d-flex spbrlFt spbrRht itemWisePrintFont_tab_14">
                                    <div className={`metaltypeItemWisePrint1 spbrRht inExchngMinHeight`} style={{ width: "7%", minWidth: "7%" }}
                                    >
                                        <p className="" style={{ wordBreak: "normal" }}>
                                            {json0Data?.Metal_Type_2 !== "" && json0Data?.Metal_Type_2}
                                        </p>
                                    </div>

                                    <div className={`categoryItemWisePrint1 spbrRht`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                            {json0Data?.Description_2 !== "" && json0Data?.Description_2}
                                        </p>
                                    </div>

                                    <div className={`pkgItemWisePrint1 spbrRht`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                        </p>
                                    </div>

                                    <div className={`countItemWisePrint1 spbrRht`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                        </p>
                                    </div>

                                    <div className={`gwtItemWisePrint1 spbrRht text-end`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                            {json0Data?.Metal_Wt_2 === 0 ? "" : fixedValues(json0Data?.Metal_Wt_2, 3)}
                                        </p>
                                    </div>

                                    <div className={`tnchItemWisePrint1 spbrRht text-end`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                            {json0Data?.Tunch_2 === 0 ? "" : fixedValues(json0Data?.Tunch_2, 3)}
                                        </p>
                                    </div>

                                    <div className={`wastageItemWisePrint1 spbrRht`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                        </p>
                                    </div>

                                    <div className={`fineAmt1 spbrRht text-end`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                            {SecondMetalFine === 0 ? "" : fixedValues(SecondMetalFine, 3)}
                                        </p>
                                    </div>

                                    <div className={`makingItemWisePrint1 spbrRht`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                        </p>
                                    </div>

                                    <div className={`totalAmt1`}>
                                        <p className="" style={{ wordBreak: "normal" }}>
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Totals */}
                        <div
                            className={`fw-bold w-100 no_break bgLightPink d-flex brTpm spbrlFt spbrRht brBtom itemWisePrintFont_11 d-flex flex-column`}
                        >
                            <div className="d-flex w-100">
                                <div className="WdthFrEqlCmon brBtom spbrRht"></div>
                                <div className="WdthFrEqlCmon brBtom spbrRht">

                                </div>
                                <div className="WdthFrEqlCmon brBtom spbrRht">Total</div>
                                <div className="WdthAftrBlnc brBtom">
                                    {NumberWithCommas(FinalTotalAmount, 2)}
                                </div>
                            </div>


                            {organizeData?.allTaxes?.map((e, i) => {
                                return (
                                    <div className="d-flex w-100" >

                                        <div className="WdthFrEqlCmon brBtom spbrRht" style={{ width: "87%" }}>{e?.name} @ {e?.per}</div>
                                        <div className="WdthAftrBlnc brBtom" style={{ width: "13%" }}>
                                            {NumberWithCommas(e?.amount, 2)}
                                        </div>

                                    </div>

                                );
                            })}

                            {json0Data?.FreightCharges !== 0 && (
                                 <div className="d-flex w-100" >

                                 <div className="WdthFrEqlCmon brBtom spbrRht" style={{ width: "87%" }}> {json0Data?.ModeOfDel}</div>
                                 <div className="WdthAftrBlnc brBtom" style={{ width: "13%" }}>
                                 {  NumberWithCommas(
                                                json0Data?.FreightCharges /
                                                json0Data?.CurrencyExchRate ,2)}
                                 </div>

                             </div>
                               
                            )}


                            {/* {json0Data?.IsReceivedItem !== 1 ? ("") : (
                                <>
                                    {json0Data?.Cash !== 0 && (
                                        <div className="d-flex w-100">
                                            <div className="WdthFrEqlCmon brBtom spbrRht">Cash</div>
                                            <div className="WdthFrEqlCmon brBtom spbrRht"></div>
                                            <div className="WdthFrEqlCmon brBtom spbrRht"></div>
                                            <div className="WdthAftrBlnc brBtom">{NumberWithCommas(json0Data?.Cash, 2)}</div>
                                        </div>
                                    )}
                                    {json0Data?.Bank !== 0 && (
                                        <div className="d-flex w-100">
                                            <div className="WdthFrEqlCmon brBtom spbrRht">Bank</div>
                                            <div className="WdthFrEqlCmon brBtom spbrRht"></div>
                                            <div className="WdthFrEqlCmon brBtom spbrRht"></div>
                                            <div className="WdthAftrBlnc brBtom">{NumberWithCommas(json0Data?.Bank, 2)}</div>
                                        </div>
                                    )}
                                    {json0Data?.Cheque !== 0 && (
                                        <div className="d-flex w-100">
                                            <div className="WdthFrEqlCmon brBtom spbrRht">Cheque</div>
                                            <div className="WdthFrEqlCmon brBtom spbrRht"></div>
                                            <div className="WdthFrEqlCmon brBtom spbrRht"></div>
                                            <div className="WdthAftrBlnc brBtom">{NumberWithCommas(json0Data?.Cheque, 2)}</div>
                                        </div>
                                    )}
                                </>
                            )} */}
                            <div className="d-flex w-100">
                                <div className="WdthFrEqlCmon"></div>
                                <div className="WdthFrEqlCmon"></div>
                                <div className="WdthFrEqlCmon spbrRht">Final Total</div>
                                <div className="WdthAftrBlnc">
                                    {NumberWithCommas(finalAmount, 2)}
                                </div>
                            </div>
                        </div>

                        {/* Opening Closing Balance */}
                        <div
                            className={`fw-bold w-100 no_break d-flex itemWisePrintFont_11 d-flex flex-column`}
                        >
                            <div className="d-flex w-100">
                                <div className="WdthAftrBlnc2">
                                    <div className="SUBWdthAftrBlnc1"> </div>
                                    <div className="SUBWdthAftrBlnc2">

                                        <span className="spaceFrmlft">

                                        </span>
                                    </div>
                                </div>
                                <div className="WdthAftrBlnc1"></div>
                                <div className="WdthAftrBlnc2">
                                    <div className="SUBWdthAftrBlnc1">Closing Bal:</div>
                                    <div className="SUBWdthAftrBlnc2">
                                        {NumberWithCommas(generalLedgerData?.BalAmt, 2)}
                                        <span className="spaceFrmlft">
                                            {generalLedgerData?.BalAmtDrCr === "Dr"
                                                ? "BAKI"
                                                : generalLedgerData?.BalAmtDrCr === "Cr"
                                                    ? "JAMA"
                                                    : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex w-100">
                                <div className="WdthAftrBlnc2">
                                    <div className="SUBWdthAftrBlnc1">  </div>
                                    <div className="SUBWdthAftrBlnc2">
                                        {/* {fixedValues(generalLedgerData?.OpnGold, 3)} */}
                                        <span className="spaceFrmlft">

                                        </span>
                                    </div>
                                </div>
                                <div className="WdthAftrBlnc1"></div>
                                <div className="WdthAftrBlnc2">
                                    <div className="SUBWdthAftrBlnc1">Closing Gold bal:</div>
                                    <div className="SUBWdthAftrBlnc2">
                                        {fixedValues(generalLedgerData?.BalGold, 3)}
                                        <span className="spaceFrmlft">
                                            {generalLedgerData?.BalGoldDrCr === "Dr"
                                                ? "BAKI"
                                                : generalLedgerData?.BalGoldDrCr === "Cr"
                                                    ? "JAMA"
                                                    : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
                    {msg}
                </p>
            )}
        </>
    );
};

export default ItemWisePrintP;
