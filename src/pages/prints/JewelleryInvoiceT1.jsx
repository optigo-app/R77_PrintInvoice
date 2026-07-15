import React, { useState, useEffect } from 'react';
import "../../assets/css/prints/JewelleryInvoiceT.css";
import {
    apiCall,
    CapitalizeWords,
    checkMsg,
    fixedValues,
    GovernMentDocuments,
    handleImageError,
    isObjectEmpty,
    NumberWithCommas,
    ReceiveInBank,
    taxGenrator,
} from "../../GlobalFunctions";
import Button from "../../GlobalFunctions/Button";
import Loader from "../../components/Loader";
import { ToWords } from "to-words";
import { head } from 'lodash';
import { width } from '@mui/system';

const JewelleryInvoiceT1 = ({
    urls,
    token,
    invoiceNo,
    printName,
    evn,
    ApiVer,
}) => {

    const [headerData, setHeaderData] = useState({});
    const [data, setdata] = useState([]);
    const [msg, setMsg] = useState("");
    const [loader, setLoader] = useState(true);
    const toWords = new ToWords();
    const [image, setImage] = useState(true);
    const [taxamt, setTaxamt] = useState(false);
    const [disamt, setDisamt] = useState(false);
    const [total, setTotal] = useState({
        Qty: 0,
        gwt: 0,
        stoneWt: 0,
        diaColorWt: 0,
        nwt: 0,
        metalMaking: 0,
        others: 0,
        total: 0,
        discount: 0,
        afterTax: 0,
        netBalAmount: 0,
        beforeTax: 0,
        diamondColorStoneWt: 0,
        multiMetalMiscHsCode: 0,
        otherCharge: 0,
    });
    const [isImageWorking, setIsImageWorking] = useState(true);
    const handleImageErrors = () => {
        setIsImageWorking(false);
    };
    const [taxes, setTaxes] = useState([]);
    const [bank, setBank] = useState([]);
    const [document, setDocument] = useState([]);

    function loadData(data) {
        // console.log("datadatadata", data);
        let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
        data.BillPrint_Json[0].address = address;

        try {
            setHeaderData(data?.BillPrint_Json[0]);
            let blankArr = [];
            let totals = { ...total };
            let groupInfo = [];
            data?.BillPrint_Json1.forEach((e, i) => {
                let obj = { ...e };
                totals.gwt += e?.grosswt;
                totals.beforeTax += e?.TotalAmount;
                // totals.nwt += e?.NetWt;
                totals.nwt += e?.MetalDiaWt;
                totals.others += e?.OtherCharges;
                totals.total += e?.UnitCost;

                // totals.discount += e?.DiscountAmt;


                // if(totals.discount==0){

                // }else{
                //     if (e?.isdiscountinamount == 1 ) {

                //         totals.discount += e?.DiscountAmt;
                //     } else {
                //         if(totals.discount!=0){}

                //         const cgst = Number(data?.BillPrint_Json[0].CGST) || 0;
                //         const sgst = Number(data?.BillPrint_Json[0].SGST) || 0;
                //         const igst = Number(data?.BillPrint_Json[0].IGST) || 0;
                //         const TotalAmount = Number(e.TotalAmount) || 0;
                //         const gst = (cgst + sgst) > 0 ? (cgst + sgst) : igst;
                //         const gstAmt = (TotalAmount * gst) / 100;
                //         totals.discount += e?.NewMRP - (e?.TotalAmount + gstAmt)
                //     }
                // }

                if (e?.DiscountAmt == 0) {

                } else {
                    if (e?.isdiscountinamount == 1) {    //isdiscountinamount == 1

                        totals.discount += e?.DiscountAmt;
                    } else {
                        if (e?.NewMRP == 0) {
                            totals.discount += e?.DiscountAmt;
                        }            //isdiscountinamount == 0
                        else {
                            const cgst = Number(data?.BillPrint_Json[0].CGST) || 0;
                            const sgst = Number(data?.BillPrint_Json[0].SGST) || 0;
                            const igst = Number(data?.BillPrint_Json[0].IGST) || 0;
                            const TotalAmount = Number(e.TotalAmount) || 0;
                            const gst = (cgst + sgst) > 0 ? (cgst + sgst) : igst;
                            const gstAmt = (TotalAmount * gst) / 100;
                            totals.discount += e?.NewMRP - (e?.TotalAmount + gstAmt)
                        }


                    }

                }
                totals.Qty += e?.BulkPurchaseQTY ? e.BulkPurchaseQTY : e?.Quantity;
                let hallmarkingCount = 0;
                let materials = [];
                let primaryMetal = [];
                let otherMetals = [];
                let diamonds = [];
                let colorstones = [];
                let miscs = [];
                let finding = [];
                let diamondAmount = 0;
                let diamondWt = 0;
                let diamondRate = 0;
                let colorStoneAmount = 0;
                let colorStoneWt = 0;
                let colorStoneRate = 0;
                let miscsAmount = 0;
                let miscsWt = 0;
                let miscsRate = 0;
                let findingWt = 0;
                let otherCharge = 0;
                let others = e?.OtherCharges;
                if ((e?.NetWt + e?.LossWt) !== 0 && others !== undefined) {
                    otherCharge = others / (e?.NetWt + e?.LossWt);
                }
                totals.otherCharge += +otherCharge.toFixed(2);
                let metalMaking = obj?.MetalAmount + obj?.MakingAmount;
                data?.BillPrint_Json2.forEach((ele, ind) => {
                    if (e?.SrJobno === ele?.StockBarcode) {
                        if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
                            materials.unshift(ele);
                            if (ele?.IsPrimaryMetal === 1) {
                                primaryMetal?.push(ele);
                            } else {
                                otherMetals?.push(ele);
                                totals.multiMetalMiscHsCode += ele?.Wt;
                                // hallmarkingCount += 1;
                            }
                        } else if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
                            diamonds?.push(ele);
                            totals.diaColorWt += ele?.Wt;
                            diamondAmount += ele?.Amount;
                            diamondWt += ele?.Wt;
                            let findIndex = materials.findIndex(
                                (elem) => elem?.MasterManagement_DiamondStoneTypeid === 1
                            );
                            if (findIndex === -1) {
                                materials.push(ele);
                            } else {
                                materials[findIndex].Wt += ele?.Wt;
                                materials[findIndex].Amount += ele?.Amount;
                            }
                        } else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
                            colorStoneAmount += ele?.Amount;
                            colorStoneWt += ele?.Wt;
                            colorstones?.push(ele);
                            totals.diaColorWt += ele?.Wt;
                            let findIndex = materials.findIndex(
                                (elem) => elem?.MasterManagement_DiamondStoneTypeid === 2
                            );
                            if (findIndex === -1) {
                                materials.push(ele);
                            } else {
                                materials[findIndex].Wt += ele?.Wt;
                                materials[findIndex].Amount += ele?.Amount;
                            }
                        } else if (
                            ele?.MasterManagement_DiamondStoneTypeid === 3 &&
                            ele?.IsHSCOE === 0
                        ) {
                            miscsAmount += ele?.Amount;
                            miscsWt += ele?.Wt;
                            miscs?.push(ele);
                            totals.stoneWt += ele?.Wt;
                            materials.push(ele);
                            totals.multiMetalMiscHsCode += ele?.Wt;
                        } else if (ele?.MasterManagement_DiamondStoneTypeid === 5) {
                            finding?.push(ele);
                            findingWt += ele?.Wt;
                            // hallmarkingCount += 1;
                        }
                    }
                });
                if (diamondWt !== 0 && diamondAmount !== 0) {
                    diamondRate = diamondAmount / diamondWt;
                }
                if (colorStoneWt !== 0 && colorStoneAmount !== 0) {
                    colorStoneRate = colorStoneAmount / colorStoneWt;
                }
                if (miscsWt !== 0 && miscsAmount !== 0) {
                    miscsRate = miscsAmount / miscsWt;
                }
                obj.materials = materials;
                obj.otherCharge = otherCharge;
                obj.metalMaking = metalMaking;
                obj.primaryMetal = primaryMetal;
                obj.diamondWt = diamondWt;
                obj.colorStoneWt = colorStoneWt;
                obj.miscsWt = miscsWt;
                obj.otherMetals = otherMetals;
                obj.diamonds = diamonds;
                obj.colorstones = colorstones;
                obj.miscs = miscs;
                obj.diamondRate = diamondRate;
                obj.colorStoneRate = colorStoneRate;
                obj.findingWt = findingWt;
                obj.miscsRate = miscsRate;
                obj.finding = finding;
                obj.diamondAmount = diamondAmount;
                obj.colorStoneAmount = colorStoneAmount;
                obj.hallmarkingCount = hallmarkingCount;
                obj.miscsAmount = miscsAmount;
                blankArr.push(obj);
                let findGroupinfo = groupInfo?.findIndex(
                    (ele, ind) => ele?.GroupJob === e?.GroupJob && e?.GroupJob !== ""
                );
                if (findGroupinfo !== -1) {
                    groupInfo[findGroupinfo].diamondWt += diamondWt;
                    groupInfo[findGroupinfo].colorStoneWt += colorStoneWt;
                    groupInfo[findGroupinfo].miscsWt += miscsWt;
                    groupInfo[findGroupinfo].diamondAmount += diamondAmount;
                    groupInfo[findGroupinfo].colorStoneAmount += colorStoneAmount;
                    groupInfo[findGroupinfo].miscsAmount += miscsAmount;
                    groupInfo[findGroupinfo].hallmarkingCount += hallmarkingCount;
                    groupInfo[findGroupinfo].findingWt += findingWt;
                    groupInfo[findGroupinfo].otherCharge += otherCharge;
                    if (e?.GroupJob === e?.SrJobno) {
                        groupInfo[findGroupinfo].designno = e?.designno;
                        groupInfo[findGroupinfo].DesignImage = e?.DesignImage;
                        groupInfo[findGroupinfo].Categoryname = e?.Categoryname;
                        groupInfo[findGroupinfo].SubCategoryname = e?.SubCategoryname;
                        groupInfo[findGroupinfo].HUID = e?.HUID;
                        groupInfo[findGroupinfo].SrJobno = e?.SrJobno;
                    }
                } else if (e?.GroupJob !== "" && findGroupinfo === -1) {
                    groupInfo?.push({
                        GroupJob: e?.GroupJob,
                        diamondWt: diamondWt,
                        colorStoneWt: colorStoneWt,
                        miscsWt: miscsWt,
                        diamondAmount: diamondAmount,
                        colorStoneAmount: colorStoneAmount,
                        miscsAmount: miscsAmount,
                        designno: e?.designno,
                        DesignImage: e?.DesignImage,
                        Categoryname: e?.Categoryname,
                        SubCategoryname: e?.SubCategoryname,
                        HUID: e?.HUID,
                        SrJobno: e?.GroupJob,
                        hallmarkingCount: hallmarkingCount,
                        findingWt: findingWt,
                        otherCharge: otherCharge,
                    });
                }
            });
            let taxValue = taxGenrator(data?.BillPrint_Json[0], totals?.total);
            taxValue.forEach((e, i) => {
                totals.afterTax += +e?.amount;
            });
            totals.afterTax += totals?.beforeTax + data?.BillPrint_Json[0]?.AddLess;
            let debitCardinfo = ReceiveInBank(data?.BillPrint_Json[0]?.BankPayDet);
            setBank(debitCardinfo);
            // console.log("bank", debitCardinfo);

            totals.netBalAmount =
                totals.afterTax - data?.BillPrint_Json[0]?.OldGoldAmount;
            debitCardinfo.length > 0 &&
                debitCardinfo.forEach((e, i) => {
                    totals.netBalAmount -= e.amount;
                });
            setTaxes(taxValue);
            // console.log("taxValue", taxValue);

            blankArr?.forEach((e, i) => {
                if (e?.GroupJob !== "") {
                    let findRecord = groupInfo?.find(
                        (ele, ind) => ele?.GroupJob === e?.GroupJob
                    );
                    if (findRecord !== undefined) {
                        e.designno = findRecord?.designno;
                        e.SrJobno = findRecord?.SrJobno;
                        e.DesignImage = findRecord?.DesignImage;
                        e.Categoryname = findRecord?.Categoryname;
                        e.SubCategoryname = findRecord?.SubCategoryname;
                        e.diamondWt = findRecord?.diamondWt;
                        e.diamondAmount = findRecord?.diamondAmount;
                        e.colorStoneWt = findRecord?.colorStoneWt;
                        e.colorStoneAmount = findRecord?.colorStoneAmount;
                        // totals.diamondColorStoneWt += findRecord?.diamondWt + findRecord?.colorStoneWt;
                        e.miscsWt = findRecord?.miscsWt;
                        e.diamondAmount = findRecord?.diamondAmount;
                        e.colorStoneAmount = findRecord?.colorStoneAmount;
                        e.miscsAmount = findRecord?.miscsAmount;
                        e.diamondRate = findRecord?.diamondAmount / findRecord?.diamondWt;
                        e.colorStoneRate =
                            findRecord?.colorStoneAmount / findRecord?.colorStoneWt;
                        e.miscsRate = findRecord?.miscsAmount / findRecord?.miscsWt;
                        e.hallmarkingCount = findRecord?.hallmarkingCount;
                        e.findingWt = findRecord?.findingWt;
                        e.otherCharge = findRecord?.otherCharge;


                    }
                } else {
                    // totals.diamondColorStoneWt += e?.diamondWt + e?.colorStoneWt;
                }
            });
            let resultArr = [];
            blankArr.forEach((e, i) => {
                if (e?.GroupJob !== "") {
                    let findIndex = resultArr.findIndex(
                        (ele) =>
                            ele?.GroupJob === e?.GroupJob &&
                            ele?.primaryMetal[0]?.Rate === e?.primaryMetal[0]?.Rate
                    );
                    if (findIndex === -1) {
                        resultArr.push(e);
                        totals.diamondColorStoneWt += e?.diamondWt + e?.colorStoneWt;
                    } else {
                        // totals.diamondColorStoneWt += resultArr[findIndex]?.diamondWt + resultArr[findIndex]?.colorStoneWt;
                        resultArr[findIndex].MakingAmount += e?.MakingAmount;
                        resultArr[findIndex].MetalAmount += e?.MetalAmount;
                        resultArr[findIndex].OtherCharges += e?.OtherCharges;
                        resultArr[findIndex].TotalAmount += e?.TotalAmount;
                        resultArr[findIndex].UnitCost += e?.UnitCost;
                        resultArr[findIndex].grosswt += e?.grosswt;
                        resultArr[findIndex].NetWt += e?.NetWt;
                        resultArr[findIndex].LossWt += e?.LossWt;
                        let arr = [resultArr[findIndex], e];
                        let findRecord = arr.find((elem) => elem?.SrJobno === e?.GroupJob);
                        resultArr[findIndex].SubCategoryname = findRecord?.SubCategoryname;
                        resultArr[findIndex].Collectionname = findRecord?.Collectionname;
                        resultArr[findIndex].designno = findRecord?.designno;
                        resultArr[findIndex].SrJobno = findRecord?.SrJobno;
                        resultArr[findIndex].DesignImage = findRecord?.DesignImage;
                        resultArr[findIndex].otherMetals = [
                            ...resultArr[findIndex].otherMetals,
                            ...e?.otherMetals,
                        ]?.flat();
                        resultArr[findIndex].primaryMetal[0].Wt += e?.primaryMetal[0]?.Wt;
                        resultArr[findIndex].primaryMetal[0].Amount +=
                            e?.primaryMetal[0]?.Amount;
                        let miscs = [...resultArr[findIndex]?.miscs, ...e?.miscs]?.flat();
                        let misc = [];
                        miscs?.forEach((ele, ind) => {
                            if (misc?.length === 0) {
                                misc?.push(ele);
                            } else {
                                misc[0].Wt += ele?.Wt;
                                misc[0].Amount += ele?.Amount;
                            }
                        });
                    }
                } else {
                    resultArr.push(e);
                    totals.diamondColorStoneWt += e?.diamondWt + e?.colorStoneWt;
                }
            });
            resultArr?.sort((a, b) => {
                let nameA = a?.designno?.toUpperCase();
                let nameB = b?.designno?.toUpperCase();
                if (nameA > nameB) {
                    return 1;
                } else if (nameA < nameB) {
                    return -1;
                } else {
                    return 0;
                }
            });
            let documentDetail = GovernMentDocuments(
                data?.BillPrint_Json[0]?.DocumentDetail
            );
            setDocument(documentDetail);
            setdata(resultArr);
            setTotal(totals);

            setLoader(false);
        } catch (error) {
            console.log(error);
        }
    }
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
                console.error(error);
            }
        };
        sendData();
    }, []);


    const handleChangeImage = (e) => {
        image ? setImage(false) : setImage(true);
    };

    const handleChangeTaxamt = (e) => {
        taxamt ? setTaxamt(false) : setTaxamt(true);
    };
    const handleChangeDisamt = (e) => {
        disamt ? setDisamt(false) : setDisamt(true);
    };

    const totalConverted = total?.afterTax / headerData?.CurrencyExchRate;
    const totalPayments =
        headerData?.OldGoldAmount +
        headerData?.CashReceived +
        headerData?.AdvanceAmount +
        bank?.reduce((acc, cObj) => acc + +cObj?.amount, 0);

    const difference = Math.round((totalConverted - totalPayments) * 100) / 100;

    const formatPaymentData = (rawData) => {
        if (!rawData) return [];

        const mergedMap = rawData.split("@-@").reduce((acc, item) => {
            const parts = item.split("#-#");
            const label = parts[0]?.trim() || "";
            const id = parts[1]?.trim() || "";
            const amount = parseFloat(parts[2]) || 0;


            const key = label;

            if (acc[key]) {
                acc[key].amount += amount;
            } else {
                acc[key] = { label, id, amount };
            }

            return acc;
        }, {});

        return Object.values(mergedMap).map(item => ({
            label: item.label,
            id: item.id,
            amount: item.amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
        }));
    };

    const pay_details = formatPaymentData(headerData?.InvPayDet)


    const totalBillAmount = data.reduce((acc, e) => {
        // 1. Convert everything to numbers
        const cgst = Number(headerData.CGST) || 0;
        const sgst = Number(headerData.SGST) || 0;
        const igst = Number(headerData.IGST) || 0;
        const TotalAmount = Number(e.TotalAmount) || 0;
        const gst = (cgst + sgst) > 0 ? (cgst + sgst) : igst;
        const gstAmt = (TotalAmount * gst) / 100;
        const rowNet = TotalAmount + gstAmt;


        return acc + rowNet;
    }, 0);


    const cellStyle = {
        // flex: 1,
        padding: "5px 10px",
        // borderRight: "1px solid #ddd",
        textAlign: "center",
        width: "10%",
        wordBreak: "break-word"
    };

    const lastCellStyle = {
        // flex: 1,
        padding: "5px 10px",
        textAlign: "center",
        width: "10%",

    };


    const HSNWiseData = Object.values(
        data.reduce((acc, item) => {
            const key = item.HSNNo;

            if (!acc[key]) {
                acc[key] = {
                    hsnno: item.HSNNo,
                    BulkPurchaseQTY: 0,
                    TotalAmount: 0,
                };
            }

            acc[key].BulkPurchaseQTY += Number(item.BulkPurchaseQTY || 0);
            acc[key].TotalAmount += Number(item.TotalAmount || 0);

            return acc;
        }, {})
    );

    console.log("ddddd", HSNWiseData);

    return (
        <>
            {loader ? (
                <Loader />
            ) : (
                <>
                    {msg === "" ? (
                        <>
                            {" "}
                            <div className="j-inv-container" style={{ position: "relative" }}>
                                <div className='j-inv-btn' style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: "10px" }}>
                                    {/* <div className="form-check pe-3" style={{ display: "flex", alignItems: "center", gap: "5px" }} >
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id='flexCheckDefault'
                                            checked={taxamt}
                                            onChange={handleChangeTaxamt}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <label
                                            className="form-check-label pt-1"
                                            htmlFor="flexCheckDefault"
                                            style={{ cursor: "pointer", textSelection: "none" }}
                                        >
                                            Taxable Amt.
                                        </label>
                                    </div>
                                    <div className="form-check pe-3" style={{ display: "flex", alignItems: "center", gap: "5px" }} >
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id='discountAmt'
                                            checked={disamt}
                                            onChange={handleChangeDisamt}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <label
                                            className="form-check-label pt-1"
                                            htmlFor="discountAmt"
                                            style={{ cursor: "pointer", textSelection: "none" }}
                                        >
                                            Discount Amt.
                                        </label>
                                    </div> */}
                                    <Button />
                                </div>
                                {/* Header Logo Box */}
                                <div className="j-inv-logo-section">
                                    {isImageWorking && headerData?.PrintLogo !== "" && (
                                        <img
                                            src={headerData?.PrintLogo}
                                            alt=""
                                            style={{ height: "125px",width:"170px", padding: "5px" }}
                                            className={``}
                                            onError={handleImageErrors}
                                            height={120}
                                            width={150}
                                        />
                                    )}
                                </div>

                                <div className="j-inv-body-wrapper">
                                    <div className="j-inv-flex-row j-inv-center j-inv-bold j-inv-border-b">{headerData?.PrintHeadLabel}</div>

                                    <div className="j-inv-grid-2 j-inv-border-b">
                                        <div className="j-inv-flex-col j-inv-border-r j-inv-p-5">
                                            <div className="j-inv-bold">Company Details -</div>
                                            <div className="j-inv-bold j-inv-large">{headerData?.CompanyFullName}{" "}</div>
                                            <div>{headerData?.CompanyAddress + ", "} {headerData?.CompanyAddress2}</div>

                                            <div>{headerData?.CompanyCity}-{headerData?.CompanyPinCode},
                                                {" "}{headerData?.CompanyState}({headerData?.CompanyCountry})</div>
                                            <div>
                                                {[
                                                    headerData?.CompanyTellNo && `T ${headerData.CompanyTellNo}`,
                                                    headerData?.CompanyTollFreeNo && `TOLL FREE ${headerData.CompanyTollFreeNo}`
                                                ].filter(Boolean).join(" | ")}
                                            </div>
                                            <div>{headerData?.CompanyEmail} {headerData?.CompanyWebsite ? " | " : ""} {headerData?.CompanyWebsite}</div>
                                            <div> {[
                                                headerData?.Company_VAT_GST_No &&
                                                `${headerData.Company_VAT_GST_No}`,

                                                headerData?.Company_CST_STATE &&
                                                headerData?.Company_CST_STATE_No &&
                                                `${headerData.Company_CST_STATE}-${headerData.Company_CST_STATE_No}`,

                                                headerData?.Pannumber &&
                                                `PAN-${headerData.Pannumber}`
                                            ]
                                                .filter(Boolean)
                                                .join(" | ")}</div>

                                        </div>
                                        <div className="j-inv-flex-col j-inv-p-5">
                                            <div><span className="j-inv-bold" style={{ marginRight: "10px" }}>Invoice No. :</span>{headerData?.InvoiceNo}</div>
                                            <div><span className="j-inv-bold" style={{ marginRight: "10px" }}>Invoice date :</span>{headerData?.EntryDate}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex" }}>
                                        <div className="j-inv-flex-col  j-inv-p-5 j-inv-min-h-80" style={{ borderRight: "1px solid black", width: "50%" }}>
                                            <div className="j-inv-bold">Bill To -</div>
                                            <div>{headerData?.CustName}</div>
                                            {headerData?.customerstreet?.length > 0 ? (
                                                <div className="fslhJL">
                                                    {headerData?.customerstreet}
                                                </div>
                                            ) : (
                                                ""
                                            )}
                                            {headerData?.customerregion?.length > 0 ? (
                                                <div className="fslhJL">
                                                    {headerData?.customerregion}
                                                </div>
                                            ) : (
                                                ""
                                            )}

                                            <div>{headerData?.PinCode} </div>
                                            <div> {headerData?.CustPanno ? "PAN: " + headerData?.CustPanno : ""}   </div>

                                            {headerData?.CustGstNo?.trim() && (
                                                <div>
                                                    <span className="j-inv-bold">Customer GSTIN</span> : {headerData.CustGstNo.trim()}
                                                </div>
                                            )}
                                            {headerData?.customermobileno1 &&(

                                            <div ><span className="j-inv-bold">Contact No. :</span> {headerData?.customermobileno1}</div>
                                            )}
                                        </div>



                                        <div className="j-inv-flex-col  j-inv-p-5 j-inv-min-h-80" style={{ width: "50%" }}>
                                            <div className="j-inv-bold">Ship To -</div>
                                         
                                            {headerData?.address?.map((e, i) => {
                                                return (
                                                    <div className="px-1" key={i}>
                                                        {e}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {/* Table Header */}
                                    {/* <div className="j-inv-table-row j-inv-bold j-inv-border-b j-inv-bg-light" style={{ borderTop: "1px solid black" }}>
                                        <div className="j-inv-cell j-inv-col-sr  j-inv-border-r" >Sr. No.</div>
                                        <div className="j-inv-cell j-inv-col-code j-inv-border-r">Product Code</div>
                                        <div className="j-inv-cell j-inv-col-hsn j-inv-border-r">HSN / SAC</div>
                                        <div className="j-inv-cell j-inv-col-desc j-inv-border-r">Description of Goods</div>
                                        <div className="j-inv-cell j-inv-col-qty j-inv-border-r">Qty</div>
                                        <div className="j-inv-cell j-inv-col-rate j-inv-border-r">Rate</div>
                                        <div className="j-inv-cell j-inv-col-disc j-inv-border-r">Disc.</div>
                                        <div className="j-inv-cell j-inv-col-gst j-inv-border-r">Gst%</div>
                                        <div className="j-inv-cell j-inv-col-gst-amt j-inv-border-r">Gst Amt.</div>
                                        <div className="j-inv-cell j-inv-col-net">Net Amount</div>
                                    </div> */}

                                    <div className="j-inv-table-row j-inv-bold j-inv-border-b j-inv-bg-light" style={{ borderTop: "1px solid black" }}>
                                        <div className={`j-inv-cell ${taxamt ? 'j-inv-col-sr-taxamt' : 'j-inv-col-sr'} j-inv-border-r`}>Sr. No.</div>
                                        <div className={`j-inv-cell ${taxamt ? 'j-inv-col-code-taxamt' : 'j-inv-col-code'} j-inv-border-r`}>Product Code</div>
                                        <div className={`j-inv-cell ${taxamt ? 'j-inv-col-hsn-taxamt' : 'j-inv-col-hsn'} j-inv-border-r`}>HSN </div>
                                        <div className={`j-inv-cell ${taxamt ? 'j-inv-col-desc-taxamt' : 'j-inv-col-desc'} j-inv-border-r`}>Description of Goods</div>
                                        <div className={`j-inv-cell ${taxamt ? 'j-inv-col-qty-taxamt' : 'j-inv-col-qty'} j-inv-border-r`}>Qty</div>
                                        <div className={`j-inv-cell ${taxamt ? 'j-inv-col-rate-taxamt' : 'j-inv-col-rate'} j-inv-border-r`}>Rate</div>
                                        {
                                            disamt && (
                                                <div className={`j-inv-cell ${taxamt ? 'j-inv-col-disc-taxamt' : 'j-inv-col-disc'} j-inv-border-r`}>Disc.</div>
                                            )
                                        }

                                        {
                                            taxamt && (
                                                <div className={`j-inv-cell ${taxamt ? 'j-inv-col-tabamt-taxamt' : 'j-inv-col-tabamt'} j-inv-border-r`}>Taxable <br /> Amt.</div>
                                            )
                                        }
                                        <div className={`j-inv-cell ${taxamt ? 'j-inv-col-gst-taxamt' : 'j-inv-col-gst'} j-inv-border-r`}>GST%</div>
                                        <div className={`j-inv-cell ${taxamt ? 'j-inv-col-gst-amt-taxamt' : 'j-inv-col-gst-amt'} j-inv-border-r`}>GST Amount</div>
                                        <div className={`j-inv-cell text-center ${taxamt ? 'j-inv-col-net-taxamt' : 'j-inv-col-net'}`}>Net Amount</div>
                                    </div>

                                    {/* Dynamic Items */}
                                    {data.length > 0 &&
                                        data.map((e, i) => {

                                            console.log("TCL: formatPaymentData -> ", e)
                                            const cgst = Number(headerData.CGST) || 0;
                                            const sgst = Number(headerData.SGST) || 0;
                                            const igst = Number(headerData.IGST) || 0;
                                            const TotalAmount = Number(e.TotalAmount) || 0;
                                            const gst = (cgst + sgst) > 0 ? (cgst + sgst) : igst;
                                            const gstAmt = (TotalAmount * gst) / 100;
                                            return (
                                                <div className="j-inv-table-row" key={i}> {/* Remove alignItems style here */}
                                                    <div className={`j-inv-cell ${taxamt ? 'j-inv-col-sr-taxamt' : 'j-inv-col-sr'} j-inv-border-r`}>{i + 1}</div>
                                                    <div className={`j-inv-cell ${taxamt ? 'j-inv-col-code-taxamt' : 'j-inv-col-code'} j-inv-border-r`}>{e.designno}</div>
                                                    <div className={`j-inv-cell ${taxamt ? 'j-inv-col-hsn-taxamt' : 'j-inv-col-hsn'} j-inv-border-r`}>{e.HSNNo}</div>
                                                    <div className={`j-inv-cell ${taxamt ? 'j-inv-col-desc-taxamt' : 'j-inv-col-desc'} j-inv-border-r j-inv-text-left  j-inv-align-top`}>
                                                        {e.MasterManagement_producttypename} <br /> {e.SrJobno}
                                                    </div>
                                                    <div className={`j-inv-cell ${taxamt ? 'j-inv-col-qty-taxamt' : 'j-inv-col-qty'} j-inv-border-r`}>{e.BulkPurchaseQTY ? e.BulkPurchaseQTY : e?.Quantity}</div>
                                                    <div className={`j-inv-cell ${taxamt ? 'j-inv-col-rate-taxamt' : 'j-inv-col-rate'} j-inv-border-r`}>{`${taxamt ? fixedValues(e.UnitCost, 2) : fixedValues(e.TotalAmount, 2)}`}</div>
                                                    {
                                                        disamt && (
                                                            <div className={`j-inv-cell ${taxamt ? 'j-inv-col-disc-taxamt' : 'j-inv-col-disc'} j-inv-border-r`}>{fixedValues(e.DiscountAmt, 2)}</div>
                                                        )
                                                    }
                                                    {/* <div className={`j-inv-cell ${taxamt ? 'j-inv-col-disc-taxamt' : 'j-inv-col-disc'} j-inv-border-r`}>{fixedValues(e.DiscountAmt, 2)}</div> */}
                                                    {
                                                        taxamt && (
                                                            <div className={`j-inv-cell ${taxamt ? 'j-inv-col-tabamt-taxamt' : 'j-inv-col-tabamt'} j-inv-border-r`}>{fixedValues(e.TotalAmount, 2)}</div>
                                                        )
                                                    }
                                                    <div className={`j-inv-cell ${taxamt ? 'j-inv-col-gst-taxamt' : 'j-inv-col-gst'} j-inv-border-r`}>{gst}</div>
                                                    <div className={`j-inv-cell ${taxamt ? 'j-inv-col-gst-amt-taxamt' : 'j-inv-col-gst-amt'} j-inv-border-r`}>{fixedValues(gstAmt, 2)}</div>
                                                    <div className={`j-inv-cell ${taxamt ? 'j-inv-col-net-taxamt' : 'j-inv-col-net'} j-inv-text-right j-inv-p-r-5`}>
                                                        {fixedValues(e.TotalAmount + gstAmt, 2)}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                    {data.length < 7 &&
                                        Array.from({ length: 7 - data.length }).map((_, index) => (
                                            <div className="j-inv-table-row" key={`dummy-${index}`}>
                                                <div className={`j-inv-cell ${taxamt ? 'j-inv-col-sr-taxamt' : 'j-inv-col-sr'} j-inv-border-r`}></div>
                                                <div className={`j-inv-cell ${taxamt ? 'j-inv-col-code-taxamt' : 'j-inv-col-code'} j-inv-border-r`}></div>
                                                <div className={`j-inv-cell ${taxamt ? 'j-inv-col-hsn-taxamt' : 'j-inv-col-hsn'} j-inv-border-r`}></div>
                                                <div className={`j-inv-cell ${taxamt ? 'j-inv-col-desc-taxamt' : 'j-inv-col-desc'} j-inv-border-r`}></div>
                                                <div className={`j-inv-cell ${taxamt ? 'j-inv-col-qty-taxamt' : 'j-inv-col-qty'} j-inv-border-r`}></div>
                                                <div className={`j-inv-cell ${taxamt ? 'j-inv-col-rate-taxamt' : 'j-inv-col-rate'} j-inv-border-r`}></div>
                                                {
                                                    disamt && (
                                                        <div className={`j-inv-cell ${taxamt ? 'j-inv-col-disc-taxamt' : 'j-inv-col-disc'} j-inv-border-r`}></div>
                                                    )
                                                }

                                                {
                                                    taxamt && (
                                                        <div className={`j-inv-cell ${taxamt ? 'j-inv-col-tabamt-taxamt' : 'j-inv-col-tabamt'} j-inv-border-r`}></div>
                                                    )
                                                }
                                                <div className={`j-inv-cell ${taxamt ? 'j-inv-col-gst-taxamt' : 'j-inv-col-gst'} j-inv-border-r`}></div>
                                                <div className={`j-inv-cell ${taxamt ? 'j-inv-col-gst-amt-taxamt' : 'j-inv-col-gst-amt'} j-inv-border-r`}></div>
                                                <div className={`j-inv-cell ${taxamt ? 'j-inv-col-net-taxamt' : 'j-inv-col-net'} j-inv-text-right j-inv-p-r-5`}></div>
                                            </div>
                                        ))}




                                    <div className="j-inv-table-row j-inv-border-b" style={{ borderTop: "1px solid #000" }}>
                                        <div className={`j-inv-cell   j-inv-text-left j-inv-p-l-5   ${taxamt ? ' j-inv-col-total-taxamt' : ' j-inv-col-total'}`} >Total c/f :</div>
                                        <div className="j-inv-cell j-inv-w-40    " style={{ width: taxamt ? "4%" : "5.5%" }}>{total?.Qty}</div>
                                        <div className="j-inv-cell j-inv-w-300 j-inv-text-right j-inv-p-r-5" style={{ width: taxamt ? "50%" : "44%", textAlign: "right" }}> {NumberWithCommas(
                                            totalBillAmount,
                                            2
                                        )}</div>
                                    </div>

                                    <div className="j-inv-grid-2 j-inv-border-b">
                                        <div className="j-inv-flex-col j-inv-border-r">
                                            <div className="j-inv-p-5 j-inv-border-b j-inv-h-40">
                                                <span className=" ">Amount In Words {headerData?.Currencyname}:</span><br />

                                                <p className="fw-bold" style={{ lineHeight: "1" }} >
                                                    {toWords.convert(
                                                        +(
                                                            total?.beforeTax /
                                                            headerData?.CurrencyExchRate +
                                                            taxes?.reduce(
                                                                (acc, cObj) =>
                                                                    acc +
                                                                    +cObj?.amount /
                                                                    headerData?.CurrencyExchRate,
                                                                0
                                                            ) +
                                                            headerData?.AddLess /
                                                            headerData?.CurrencyExchRate
                                                        )?.toFixed(2)
                                                    )}{" "}
                                                    Only
                                                </p>
                                            </div>
                                            <div className="j-inv-p-5">
                                                <div className="j-inv-bold">Payment Mode :</div>
                                                <div className="j-inv-grid-2 j-inv-py-5">
                                                    {pay_details?.map((e, i) => {
                                                        console.log("TCL: formatPaymentData -> eeeemmmm",e )
                                                        return <div key={i}>{e?.label}   : <span className=''>{NumberWithCommas(
                                                            parseFloat(String(e?.amount || 0).replace(/,/g, "").trim()) || 0,
                                                            2
                                                        )}</span></div>
                                                    })}
                                                    {headerData?.AdvanceAmount > 0 &&(
                                                        <div>Advance : <span className=''>{NumberWithCommas(headerData?.AdvanceAmount, 2)}</span></div>

                                                    )}
                                                    {difference > 0 &&(
                                                        <div>Credit Amt : <span className=''>{NumberWithCommas(difference, 2)}</span></div>

                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="j-inv-flex-col">
                                            <div className="j-inv-flex-between j-inv-p-2"><span>Total Rs :</span><span> {NumberWithCommas(
                                                total?.beforeTax / headerData?.CurrencyExchRate +
                                                taxes?.reduce(
                                                    (acc, cObj) =>
                                                        acc +
                                                        +cObj?.amount / headerData?.CurrencyExchRate,
                                                    0
                                                ) +
                                                headerData?.AddLess /
                                                headerData?.CurrencyExchRate,
                                                2
                                            )} </span></div>
                                            <div className="j-inv-flex-between j-inv-p-2"><span>Bill Disc :</span><span>{NumberWithCommas(total?.discount, 2)}</span></div>
                                            <div className="j-inv-flex-between j-inv-p-2"><span>Packing/Other Charges :</span><span>{fixedValues(headerData?.InsuranceAmount, 2)}</span></div>
                                            <div className="j-inv-flex-between j-inv-p-2"><span>GST Amount :</span><span> {fixedValues(headerData?.TotalGSTAmount, 2)}</span></div>
                                            <div className="j-inv-flex-between j-inv-p-2"><span>Delivery Charge :</span><span>{fixedValues(headerData?.FreightCharges, 2)}</span></div>
                                            <div className="j-inv-flex-between j-inv-p-2 j-inv-bold j-inv-border-t j-inv-large">
                                                <span>Grand Total :</span><span> {NumberWithCommas(
                                                    total?.beforeTax / headerData?.CurrencyExchRate +
                                                    taxes?.reduce(
                                                        (acc, cObj) =>
                                                            acc +
                                                            +cObj?.amount / headerData?.CurrencyExchRate,
                                                        0
                                                    ) +
                                                    headerData?.AddLess /
                                                    headerData?.CurrencyExchRate,
                                                    2
                                                )} </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            width: "100%",
                                            borderBottom: "1px solid #000",
                                            fontFamily: "Arial, sans-serif",
                                            fontSize: "11px",
                                        }}
                                    >
                                        {/* Header */}
                                        <div
                                            style={{
                                                display: "flex",
                                                background: "#f5f5f5",
                                                fontWeight: "bold",
                                                borderBottom: "1px solid #ccc",
                                         
                                            }}
                                        >
                                            <div style={{...cellStyle,borderBottom:"1px solid #000"}}>HSN  Code</div>
                                            <div style={{ ...cellStyle, width: "7%",borderBottom:"1px solid #000" }}>Qty</div>
                                            <div style={{...cellStyle,borderBottom:"1px solid #000"}}>CGST%</div>
                                            <div style={{...cellStyle,borderBottom:"1px solid #000"}}>CGST  Amount</div>
                                            <div style={{...cellStyle,borderBottom:"1px solid #000"}}>SGST%</div>
                                            <div style={{...cellStyle,borderBottom:"1px solid #000"}}>SGST Amount</div>
                                            <div style={{...cellStyle,borderBottom:"1px solid #000"}}>IGST%</div>
                                            <div style={{...cellStyle,borderBottom:"1px solid #000"}}>IGST Amount</div>
                                            <div style={{ ...cellStyle, width: "13%",borderBottom:"1px solid #000" }}>Taxable AMT</div>
                                            <div style={{...cellStyle,borderBottom:"1px solid #000"}}>Total</div>
                                        </div>

                                        {/* Data Row */}

                                        {HSNWiseData?.map((d, i) => {

                                            const cgst = Number(headerData.CGST) || 0;
                                            const sgst = Number(headerData.SGST) || 0;
                                            const igst = Number(headerData.IGST) || 0;
                                            const TotalAmount = Number(d.TotalAmount) || 0;
                                            const gst = (cgst + sgst) > 0 ? (cgst + sgst) : igst;


                                            const cgstAmt = (TotalAmount * cgst) / 100;
                                            const sgstAmt = (TotalAmount * sgst) / 100;
                                            const igstAmt = (TotalAmount * igst) / 100;

                                            return (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        background: "#fff",
                                                    }}
                                                >

                                                    <div style={cellStyle}>{d?.hsnno}</div>
                                                    <div style={{ ...cellStyle, width: "7%" }}>{d?.BulkPurchaseQTY}</div>
                                                    <div style={cellStyle}>{headerData?.CGST}{headerData?.CGST ? "%" : ""}</div>
                                                    <div style={cellStyle}>{cgstAmt.toFixed(2)}</div>
                                                    <div style={cellStyle}>{headerData?.SGST}{headerData?.SGST ? "%" : ""}</div>
                                                    <div style={cellStyle}>{sgstAmt.toFixed(2)}</div>
                                                    <div style={cellStyle}>{headerData?.IGST}{headerData?.IGST ? "%" : ""}</div>
                                                    <div style={cellStyle}>{igstAmt.toFixed(2)}</div>
                                                    <div style={{ ...cellStyle, width: "13%" }}> {TotalAmount.toFixed(2)}</div>
                                                    <div style={lastCellStyle}> {(cgstAmt + sgstAmt + igstAmt).toFixed(2)}</div>
                                                </div>

                                            )

                                        })}

                                    </div>


                                    {headerData?.Remark && (
                                        <div className="j-inv-p-5 j-inv-border-b">  Bill Remarks : {headerData?.Remark}</div>

                                    )}
                                    <div className="" style={{ display: "flex" }}>
                                        <div className="j-inv-flex-col j-inv-border-r j-inv-p-5 j-inv-min-h-100" style={{ width: '70%' }}>
                                             
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: headerData?.Declaration,
                                                }}
                                            ></div>
                                        </div>

                                        <div className="j-inv-flex-col j-inv-p-5 j-inv-text-center" style={{ width: '30%', justifyContent: "space-between" }}>
                                            <div>For <span className="j-inv-bold"> {headerData?.CompanyFullName}</span></div>
                                            <div className="j-inv-m-t-40">Signature & Date</div>
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
};

export default JewelleryInvoiceT1;