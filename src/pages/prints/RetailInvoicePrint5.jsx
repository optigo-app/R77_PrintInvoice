

import React, { useState, useEffect } from "react";
import "../../assets/css/prints/jewellaryinvoiceprint.css";
import style from "../../assets/css/prints/jewelleryRetailinvoicePrint3.module.css";
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
import { ToWords } from 'to-words';

const RetailInvoiceprint5 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
    const [headerData, setHeaderData] = useState({});
    const [data, setdata] = useState([]);
    const [msg, setMsg] = useState("");
    const [loader, setLoader] = useState(true);
    const toWords = new ToWords();
    const [image, setImage] = useState(true);
    const [total, setTotal] = useState({
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
                totals.discount += e?.DiscountAmt;
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
                let others = GovernMentDocuments(e?.OtherAmtDetail);
                if (e?.NetWt + e?.LossWt !== 0 && others?.length >= 4) {
                    otherCharge = +others[3]?.value / (e?.NetWt + e?.LossWt);
                }
                totals.otherCharge += +(otherCharge?.toFixed(2));
                let metalMaking = obj?.MetalAmount + obj?.MakingAmount;
                data?.BillPrint_Json2.forEach((ele, ind) => {
                    if (e?.SrJobno === ele?.StockBarcode) {
                        if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
                            materials.unshift(ele)
                            if (ele?.IsPrimaryMetal === 1) {
                                primaryMetal?.push(ele);
                            } else {
                                otherMetals?.push(ele);
                                totals.multiMetalMiscHsCode += ele?.Wt
                                hallmarkingCount += 1;
                            }
                        }
                        else if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
                            diamonds?.push(ele);
                            totals.diaColorWt += ele?.Wt;
                            diamondAmount += ele?.Amount;
                            diamondWt += ele?.Wt;
                            let findIndex = materials.findIndex(elem => elem?.MasterManagement_DiamondStoneTypeid === 1);
                            if (findIndex === -1) {
                                materials.push(ele);
                            } else {
                                materials[findIndex].Wt += ele?.Wt;
                                materials[findIndex].Amount += ele?.Amount;
                            }
                        }
                        else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
                            colorStoneAmount += ele?.Amount;
                            colorStoneWt += ele?.Wt;
                            colorstones?.push(ele);
                            totals.diaColorWt += ele?.Wt;
                            let findIndex = materials.findIndex(elem => elem?.MasterManagement_DiamondStoneTypeid === 2);
                            if (findIndex === -1) {
                                materials.push(ele);
                            } else {
                                materials[findIndex].Wt += ele?.Wt;
                                materials[findIndex].Amount += ele?.Amount;
                            }
                        }
                        else if (ele?.MasterManagement_DiamondStoneTypeid === 3 && ele?.IsHSCOE === 0) {
                            miscsAmount += ele?.Amount;
                            miscsWt += ele?.Wt;
                            miscs?.push(ele);
                            totals.stoneWt += ele?.Wt;
                            materials.push(ele);
                            totals.multiMetalMiscHsCode += ele?.Wt
                        } else if (ele?.MasterManagement_DiamondStoneTypeid === 5) {
                            finding?.push(ele);
                            findingWt += ele?.Wt;
                            hallmarkingCount += 1;
                        }
                    }
                });
                if (diamondWt !== 0 && diamondAmount !== 0) {
                    diamondRate = (diamondAmount / diamondWt);
                }
                if (colorStoneWt !== 0 && colorStoneAmount !== 0) {
                    colorStoneRate = (colorStoneAmount / colorStoneWt);
                }
                if (miscsWt !== 0 && miscsAmount !== 0) {
                    miscsRate = (miscsAmount / miscsWt);
                }
                obj.otherCharge = otherCharge;
                obj.materials = materials;
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
                obj.findingWt = findingWt
                obj.miscsRate = miscsRate;
                obj.finding = finding;
                obj.diamondAmount = diamondAmount;
                obj.colorStoneAmount = colorStoneAmount;
                obj.hallmarkingCount = hallmarkingCount
                obj.miscsAmount = miscsAmount;
                blankArr.push(obj);
                let findGroupinfo = groupInfo?.findIndex((ele, ind) => ele?.GroupJob === e?.GroupJob && e?.GroupJob !== "");
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
            totals.netBalAmount = totals.afterTax - data?.BillPrint_Json[0]?.OldGoldAmount;
            debitCardinfo.length > 0 && debitCardinfo.forEach((e, i) => {
                totals.netBalAmount -= e.amount;
            });
            setTaxes(taxValue);

            blankArr?.forEach((e, i) => {
                if (e?.GroupJob !== "") {
                    let findRecord = groupInfo?.find((ele, ind) => ele?.GroupJob === e?.GroupJob);
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
                        e.diamondRate = (findRecord?.diamondAmount / findRecord?.diamondWt);
                        e.colorStoneRate = (findRecord?.colorStoneAmount / findRecord?.colorStoneWt);
                        e.miscsRate = (findRecord?.miscsAmount / findRecord?.miscsWt);
                        e.hallmarkingCount = findRecord?.hallmarkingCount;
                        e.findingWt = findRecord?.findingWt;
                        e.otherCharge = findRecord?.otherCharge;
                    }
                } else {
                    // totals.diamondColorStoneWt += e?.diamondWt + e?.colorStoneWt;
                }
            })
            let resultArr = [];

            blankArr.forEach((e) => {
                resultArr.push(e);

                totals.diamondColorStoneWt += (e?.diamondWt || 0) + (e?.colorStoneWt || 0);
            });

            // optional sorting (keep if needed)
            resultArr.sort((a, b) => {
                let nameA = a?.designno?.toUpperCase() || "";
                let nameB = b?.designno?.toUpperCase() || "";

                if (nameA > nameB) return 1;
                if (nameA < nameB) return -1;
                return 0;
            });
            let documentDetail = GovernMentDocuments(data?.BillPrint_Json[0]?.DocumentDetail);
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
    }

    return (
        <>
            {loader ? (
                <Loader />
            ) : (
                <>
                    {msg === "" ? (
                        <> <div className={`container-fluid ${style?.jewelelryRetailInvoiceContainer} max_width_container pad_60_allPrint position-relative ${style?.retailInvoice5Container}`}>
                            <div className={`btnpcl align-items-baseline position-absolute right-0 top-0 m-0 ${style?.right_retailInvoicePrintsBtn} d-flex`}>
                                <div className="form-check pe-3">
                                    <input className="form-check-input" type="checkbox" checked={image} onChange={handleChangeImage} />
                                    <label className="form-check-label pt-1" htmlFor="flexCheckDefault">
                                        With Image
                                    </label>
                                </div>
                                <Button />
                            </div>
                            <div className="pt-2 d-flex flex-column">
                                <div className="headlineJL w-100 p-2"> <b style={{ fontSize: "20px" }}> {headerData?.PrintHeadLabel} </b> </div>
                                <div className="d-flex w-100">
                                    <div className="col-10 p-2">
                                        <div className="fslhJL">
                                            <h5> <b style={{ fontSize: "16px", color: "black" }}> {headerData?.CompanyFullName} </b> </h5>
                                        </div>
                                        <div className="fslhJL">{headerData?.CompanyAddress}</div>
                                        <div className="fslhJL">
                                            {headerData?.CompanyAddress2}
                                        </div>
                                        <div className="fslhJL">
                                            {headerData?.CompanyCity}-{headerData?.CompanyPinCode},
                                            {headerData?.CompanyState}({headerData?.CompanyCountry})
                                        </div>
                                        <div className="fslhJL">
                                            T {headerData?.CompanyTellNo} | TOLL FREE {headerData?.CompanyTollFreeNo}
                                        </div>
                                        <div className="fslhJL">
                                            {headerData?.CompanyEmail} |
                                            {headerData?.CompanyWebsite}
                                        </div>
                                        {/* <div className='fslhpcl3'>{headerData?.Company_VAT_GST_No} | {headerData?.Cust_CST_STATE}-{headerData?.Company_CST_STATE_No} | PAN-EDJHF236D</div> */}
                                        <div className="fslhJL">
                                            {/* {headerData?.Company_VAT_GST_No} |
                                            {headerData?.Cust_CST_STATE}-{headerData?.Company_CST_STATE_No} | {headerData?.vat_cst_pan} */}

                                            {headerData?.Company_VAT_GST_No}
                                            {(headerData?.Company_CST_STATE_No !== "" && headerData?.Cust_CST_STATE !== "") && `| ${headerData?.Cust_CST_STATE}-${headerData?.Company_CST_STATE_No}`}
                                            {headerData?.Com_pannumber !== "" && ` | PAN-${headerData?.Com_pannumber}`}
                                        </div>
                                    </div>
                                    <div className="col-2 d-flex align-items-center justify-content-center">
                                        {/* <img
                      src={headerData?.PrintLogo}
                      alt="#"
                      className={`w-100 d-block ms-auto ${style?.imgJewelleryRetailinovicePrint3}`}
                    /> */}
                                        {isImageWorking && (headerData?.PrintLogo !== "" &&
                                            <img src={headerData?.PrintLogo} alt=""
                                                className={`w-100 d-block ms-auto ${style?.imgJewelleryRetailinovicePrint3}`}
                                                onError={handleImageErrors} height={120} width={150} />)}
                                    </div>
                                </div>
                                {/* header data */}
                                <div className="d-flex border w-100 no_break">
                                    <div className="col-8 p-2 b border-end">
                                        {/* <div className="fslhJL">{headerData?.lblBillTo}</div> */}
                                        <div className="fslhJL">To,</div>
                                        <div className="fslhJL">
                                            <b className="JL13" style={{ fontSize: "14px" }}>{headerData?.CustName}</b>
                                        </div>
                                        {headerData?.customerAddress1?.length > 0 ? (
                                            <div className="fslhJL">
                                                {headerData?.customerAddress1}
                                            </div>
                                        ) : (
                                            ""
                                        )}
                                        {headerData?.customerAddress2?.length > 0 ? (
                                            <div className="fslhJL">
                                                {headerData?.customerAddress2}
                                            </div>
                                        ) : (
                                            ""
                                        )}
                                        {headerData?.customerAddress3?.length > 0 ? (
                                            <div className="fslhJL">
                                                {headerData?.customercity}-{headerData?.PinCode}
                                            </div>
                                        ) : (
                                            ""
                                        )}
                                        <div className="fslhJL">
                                            {headerData?.CompanyCountry}
                                        </div>
                                        <div className="fslhJL">{headerData?.customeremail1}</div>
                                        <div className="fslhJL">Phno: {headerData?.customermobileno}</div>
                                        <div className="fslhJL">{headerData?.vat_cst_pan} {headerData?.aadharno !== "" && `| Aadhar-${headerData?.aadharno}`}</div>
                                        <div className="fslhJL">
                                            {headerData?.Cust_CST_STATE}-
                                            {headerData?.Cust_CST_STATE_No}
                                        </div>
                                    </div>
                                    <div className="col-4 p-2 position-relative">
                                        <div className="d-flex">
                                            <div className="col-6">
                                                <b className="JL13">INVOICE NO</b>
                                            </div>
                                            <div className="col-6">
                                                {headerData?.InvoiceNo}
                                            </div>
                                        </div>
                                        <div className="d-flex">
                                            <div className="col-6">
                                                <b className="JL13">DATE</b>
                                            </div>
                                            <div className="col-6">
                                                {headerData?.EntryDate}
                                            </div>
                                        </div>
                                        <div className="d-flex">
                                            <div className="col-6">
                                                <b className="JL13">HSN</b>
                                            </div>
                                            <div className="col-6">
                                                {headerData?.HSN_No}
                                            </div>
                                        </div>
                                        <div className="d-flex">
                                            <div className="col-6">
                                                <b className="JL13">Reverse Charge</b>
                                            </div>
                                            <div className="col-6 d-flex">
                                                <div className="d-flex pe-1">
                                                    <input type="checkbox" name="" id="" className="me-1" />
                                                    <p className="pe-1">Yes</p>
                                                </div>
                                                <div className="d-flex">
                                                    <input type="checkbox" name="" id="" className="me-1" />
                                                    <p className="pe-1">No</p>
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            document?.map((e, i) => {
                                                return <div className="d-flex" key={i}>
                                                    <div className="col-6">
                                                        <b className="JL13">{e?.label}</b>
                                                    </div>
                                                    <div className="col-6">
                                                        {e?.value}
                                                    </div>
                                                </div>
                                            })
                                        }
                                        {/* {headerData?.aadharno !== "" && <div className="d-flex">
                      <div className="col-4">
                        <b className="JL13">AADHAR CARD</b>
                      </div>
                      <div className="col-8">
                        {headerData?.aadharno}
                      </div>
                    </div>} */}
                                        {/* <div className="d-flex  position-absolute w-100 pb-2 bottom-0">
                      <div className="d-flex">
                        <b className="JL13 fs-5 pe-2">24K Gold Rate</b>
                        <b className="fs-5"> {NumberWithCommas(headerData?.MetalRate24K, 2)}</b>
                      </div>
                    </div> */}
                                    </div>
                                </div>
                                {/* Table Heading */}
                                <div className={`pt-1 no_break ${style?.word_break}`}>
                                    <div className="border d-flex">
                                        <div className={`${style?.srNoJewerryRetailInvoicePrint} border-end p-1 d-flex align-items-center justify-content-center text-center`}><p className="fw-bold">Sr#</p></div>
                                        <div className={`${style?.productDesPrint5} border-end p-1 fw-bold d-flex align-items-center justify-content-center text-center`}><p className="fw-bold">Product Description</p></div>
                                        <div className={`${style?.materialRetailInvoice5} border-end`}
                                        >
                                            <div className="border-bottom">
                                                <p className="fw-bold p-1 text-center">Material Description</p>
                                            </div>
                                            <div className="d-flex">
                                                <div style={{ width: "16%" }} className={` d-flex align-items-center justify-content-center text-center border-end`}><p className="text-center fw-bold p-1">Material</p></div>
                                                <div style={{ width: "20%" }} className={` d-flex align-items-center justify-content-center text-center border-end`}><p className="text-center fw-bold p-1">Carat</p></div>
                                                <div style={{ width: "16%" }} className={` d-flex align-items-center justify-content-center text-center border-end`}><p className="text-center fw-bold p-1">GWT</p></div>
                                                <div style={{ width: "16%" }} className={` d-flex align-items-center justify-content-center text-center border-end p-1 flex-column`}><p className="text-center fw-bold">STONE/DIA Wt.</p></div>
                                                <div style={{ width: "16%" }} className={` d-flex align-items-center justify-content-center text-center border-end`}><p className="text-center fw-bold p-1">NWT</p></div>
                                                <div style={{ width: "16%" }} className={` d-flex align-items-center justify-content-center text-center`}><p className="text-center fw-bold p-1">Rate</p></div>
                                            </div>
                                        </div>
                                        <div className={`${style?.metalMakingRetailinvoice5} border-end d-flex align-items-center justify-content-center`}>
                                            <p className="fw-bold"> Making</p>
                                        </div>
                                        <div className={`${style?.othersRetailInvoice5} border-end d-flex align-items-center justify-content-center`}><p className="fw-bold">Others</p></div>
                                        <div className={`${style?.totalRetailInvoice5} d-flex align-items-center justify-content-center`}><p className="fw-bold">Total</p></div>
                                    </div>
                                </div>
                                {/* data */}
                                {data.length > 0 && data.map((e, i) => {
                                    const mergedMisc = e?.miscs?.reduce((acc, curr) => {
                                        acc.Pcs += curr.Pcs || 0;
                                        acc.Wt += curr.Wt || 0;
                                        acc.Amount += curr.Amount || 0;
                                        return acc;
                                    }, { Pcs: 0, Wt: 0, Amount: 0 });
                                    return <div className="border-start border-end border-bottom d-flex no_break" key={i}>
                                        <div className={`${style?.srNoJewerryRetailInvoicePrint} border-end p-1 d-flex align-items-center justify-content-center`}><p className="">{i + 1}</p></div>
                                        <div className={`${style?.productDesPrint5} border-end p-1 `}>
                                            <p className="" style={{ wordBreak: "normal" }}>{e?.SubCategoryname} {e?.Categoryname}</p>
                                            <p className="" style={{ wordBreak: "normal" }}>{e?.designno} | {e?.SrJobno}</p>
                                            {image && <img src={e?.DesignImage} alt="" onError={handleImageError} lazy='eagar' className={`w-100 my-1 mx-auto d-block ${style?.imageJewelleryC}`} style={{ maxWidth: "75px", maxHeight: "75px" }} />}
                                            {e?.HUID !== "" && <p style={{ wordBreak: "normal" }} className={`text-center ${!image && 'pt-3'}`}>HUID-{e?.HUID}</p>}
                                        </div>
                                        <div className={`${style?.materialRetailInvoice5} border-end`}>
                                            <div className="d-grid h-100">
                                                {
                                                    e?.primaryMetal?.map((ele, ind) => {
                                                        return <div className={`d-flex border-bottom`} key={ind}>
                                                            <div style={{ width: "16%" }} className={`border-end d-flex align-items-center`}><p className="p-1 lh-1">{ele?.ShapeName}</p></div>
                                                            <div style={{ width: "20%", wordBreak: "normal" }} className={`border-end d-flex align-items-center`} >

                                                                {/* <p className="p-1 lh-1" style={{ wordBreak: "normal" }}> {ele?.QualityName} {(e?.Tunch !== 0 && ` / ${NumberWithCommas(e?.Tunch, 2)}% 
                                                             ${(e?.HUID !== "" || e?.isWithHallMark === 1)
                                                                ? "Hallmarking"
                                                                : ""}`)}</p> */}
                                                                <p className="p-1 lh-1" style={{ wordBreak: "normal" }}>
                                                                    {ele?.QualityName}

                                                                    {e?.Tunch !== 0 && (
                                                                        <>
                                                                            {" / "}{NumberWithCommas(e?.Tunch, 2)}%
                                                                        </>
                                                                    )}

                                                                    {(e?.HUID !== "" || e?.isWithHallMark === 1) && (
                                                                        <>
                                                                            <br />
                                                                            Hallmarking
                                                                        </>
                                                                    )}
                                                                </p>


                                                            </div>
                                                            <div style={{ width: "16%" }} className={`border-end d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1">{fixedValues(e?.grosswt, 3)}</p></div>
                                                            <div style={{ width: "16%" }} className={`border-end p-1 d-flex align-items-center justify-content-end`}><p className=" text-end lh-1"></p></div>
                                                            <div style={{ width: "16%" }} className={`border-end d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1">{e?.otherMetals?.length === 0 ? NumberWithCommas(e?.NetWt + e?.LossWt, 3) : NumberWithCommas(ele?.Wt, 3)}</p></div>
                                                            <div style={{ width: "16%" }} className={`d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1">{NumberWithCommas(ele?.Rate / headerData?.CurrencyExchRate, 2)}</p></div>
                                                        </div>
                                                    })
                                                }
                                                {
                                                    e?.diamondWt !== 0 && <div className={`d-flex border-bottom`} >
                                                        <div style={{ width: "16%" }} className={`border-end d-flex align-items-center`}><p className="p-1 lh-1">DIAMOND</p></div>
                                                        <div style={{ width: "20%" }} className={`border-end d-flex align-items-center`}><p className="p-1 lh-1"></p></div>
                                                        <div style={{ width: "16%" }} className={`border-end d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1"></p></div>
                                                        <div style={{ width: "16%" }} className={`border-end p-1 d-flex align-items-center justify-content-end`}><p className=" text-end lh-1">{NumberWithCommas(e?.diamondWt, 3)} </p></div>
                                                        <div style={{ width: "16%" }} className={`border-end d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1"></p></div>
                                                        <div style={{ width: "16%" }} className={`d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1">{NumberWithCommas(e?.diamondRate / headerData?.CurrencyExchRate, 2)}</p></div>
                                                    </div>
                                                }
                                                {
                                                    e?.colorStoneWt !== 0 && <div className={`d-flex border-bottom`} >
                                                        <div style={{ width: "16%" }} className={`border-end d-flex align-items-center`}><p className="p-1 lh-1">COLORSTONE</p></div>
                                                        <div style={{ width: "20%" }} className={`border-end d-flex align-items-center`}><p className="p-1 lh-1"></p></div>
                                                        <div style={{ width: "16%" }} className={`border-end d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1"></p></div>
                                                        <div style={{ width: "16%" }} className={`border-end p-1 d-flex align-items-center justify-content-end`}><p className=" text-end lh-1">{NumberWithCommas(e?.colorStoneWt, 3)} </p></div>
                                                        <div style={{ width: "16%" }} className={`border-end d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1"></p></div>
                                                        <div style={{ width: "16%" }} className={`d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1">{NumberWithCommas(e?.colorStoneRate / headerData?.CurrencyExchRate, 2)}</p></div>
                                                    </div>
                                                }

                                                {
                                                    mergedMisc?.Wt !== 0 && (
                                                        <div className={`d-flex border-bottom`} >
                                                            <div style={{ width: "16%" }} className={`border-end d-flex align-items-center`}><p className="p-1 lh-1">MISC</p></div>
                                                            <div style={{ width: "20%" }} className={`border-end d-flex align-items-center`}><p className="p-1 lh-1"></p></div>
                                                            <div style={{ width: "16%" }} className={`border-end d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1"></p></div>
                                                            <div style={{ width: "16%" }} className={`border-end p-1 d-flex align-items-center justify-content-end`}><p className=" text-end lh-1">{NumberWithCommas(mergedMisc?.Wt, 3)}</p></div>
                                                            <div style={{ width: "16%" }} className={`border-end d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1"></p></div>
                                                            <div style={{ width: "16%" }} className={`d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1">{NumberWithCommas(mergedMisc?.Amount / mergedMisc?.Wt, 2)}</p></div>
                                                        </div>
                                                    )
                                                }
                                                {
                                                    e?.otherMetals?.length !== 0 && <div className={`d-flex border-bottom`} >
                                                        <div style={{ width: "16%" }} className={`border-end d-flex align-items-center`}><p className="p-1 lh-1"></p></div>
                                                        <div style={{ width: "20%" }} className={`border-end d-flex align-items-center`}><p className="p-1 lh-1"></p></div>
                                                        <div style={{ width: "16%" }} className={`border-end d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1"></p></div>
                                                        <div style={{ width: "16%" }} className={`border-end p-1 d-flex align-items-center justify-content-end`}><p className=" text-end lh-1">{NumberWithCommas(e?.otherMetals?.reduce((acc, cObj) => acc + cObj?.Wt, 0), 3)}</p></div>
                                                        <div style={{ width: "16%" }} className={`border-end d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1"></p></div>
                                                        <div style={{ width: "16%" }} className={`d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1"></p></div>
                                                    </div>
                                                }
                                                {e?.findingWt !== 0 && <div className={`d-flex border-bottom`} >
                                                    <div style={{ width: "16%" }} className={`border-end d-flex align-items-center`}><p className="p-1 lh-1"></p></div>
                                                    <div style={{ width: "20%" }} className={`border-end d-flex align-items-center`}><p className="p-1 lh-1"></p></div>
                                                    <div style={{ width: "16%" }} className={`border-end d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1"></p></div>
                                                    <div style={{ width: "16%" }} className={`border-end p-1 d-flex align-items-center justify-content-end`}><p className=" text-end lh-1">{NumberWithCommas(e?.findingWt, 3)}</p></div>
                                                    <div style={{ width: "16%" }} className={`border-end d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1"></p></div>
                                                    <div style={{ width: "16%" }} className={`d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1"></p></div>
                                                </div>}
                                                {
                                                    (e?.primaryMetal?.length === 0 && e?.diamondWt === 0 && e?.colorStoneWt === 0 && e?.miscsWt === 0 && e?.findingWt !== 0) && <div className="d-flex">
                                                        <div className={` border-end`}><p className="p-1 lh-1"></p></div>
                                                        <div className={` border-end`}><p className="p-1 lh-1"></p></div>
                                                        <div className={` border-end`}><p className="p-1 text-end lh-1"></p></div>
                                                        <div className={` border-end p-1 `}><p className="text-end lh-1"></p></div>
                                                        <div className={`border-end `}><p className="p-1 text-end lh-1"></p></div>
                                                        <div className={` `}><p className="p-1 text-end lh-1"></p></div>
                                                    </div>
                                                }
                                                {/* 
                        {e?.materials.length > 0 ? e?.materials.map((ele, ind) => {
                          return <div className={`d-flex ${ind !== e?.materials.length - 1 && 'border-bottom'}`} key={ind}>
                            <div className={`col-2 border-end d-flex align-items-center`}><p className="p-1 lh-1">{ele?.MasterManagement_DiamondStoneTypeid === 4 ? ele?.ShapeName : ele?.MasterManagement_DiamondStoneTypeName}</p></div>
                            <div className={`col-2 border-end d-flex align-items-center`}><p className="p-1 lh-1">{ele?.MasterManagement_DiamondStoneTypeid === 4 && ele?.QualityName}{((ind === 0 && e?.Tunch !== 0) && ` / ${NumberWithCommas(e?.Tunch, 2)}%`)}</p></div>
                            <div className={`col-2 border-end d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1">{ele?.MasterManagement_DiamondStoneTypeid === 4 && fixedValues(e?.grosswt, 3)}</p></div>
                            <div className={`col-2 border-end p-1 d-flex align-items-center justify-content-end`}><p className=" text-end lh-1">{ele?.MasterManagement_DiamondStoneTypeid !== 4 && fixedValues(ele?.Wt, 3)}</p></div>
                            <div className={`col-2 border-end d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1">{ele?.MasterManagement_DiamondStoneTypeid === 4 && fixedValues(e?.MetalDiaWt, 3)}</p></div>
                            <div className={`col-2 d-flex align-items-center justify-content-end`}><p className=" p-1 text-end lh-1">{ele?.MasterManagement_DiamondStoneTypeid === 4 ? NumberWithCommas(ele?.Rate, 2) : NumberWithCommas(ele?.Amount / ele?.Wt, 2)}</p></div>
                          </div>
                        }) : <div className="d-flex">
                          <div className={` border-end`}><p className="p-1 lh-1"></p></div>
                          <div className={` border-end`}><p className="p-1 lh-1"></p></div>
                          <div className={` border-end`}><p className="p-1 text-end lh-1"></p></div>
                          <div className={` border-end p-1 `}><p className="text-end lh-1"></p></div>
                          <div className={`border-end `}><p className="p-1 text-end lh-1"></p></div>
                          <div className={` `}><p className="p-1 text-end lh-1"></p></div>
                        </div>} */}
                                            </div>
                                        </div>
                                        <div className={`${style?.metalMakingRetailinvoice5} border-end align-items-center d-flex justify-content-end`}>
                                            <p className="text-end p-1">{e?.MakingChargeDiscount ? e?.MakingChargeDiscount.toFixed(2) + " %" : NumberWithCommas(e?.MaKingCharge_Unit, 2)}</p>
                                        </div>
                                        <div className={`${style?.othersRetailInvoice5} border-end align-items-center d-flex justify-content-end`}><p className=" text-end p-1">
                                            {/* {NumberWithCommas(e?.OtherCharges, 2)} */}
                                            {NumberWithCommas(e?.otherCharge, 2)}
                                        </p></div>
                                        <div className={`${style?.totalRetailInvoice5} align-items-center d-flex justify-content-end`}><p className=" text-end p-1">{NumberWithCommas(e?.UnitCost / headerData?.CurrencyExchRate, 2)}</p></div>
                                    </div>
                                })}
                                {/* total */}
                                <div className={`${style?.minHeight20RetailinvoicePrint3} border-start border-end border-bottom d-flex no_break`}>
                                    <div className={`${style?.srNoJewerryRetailInvoicePrint} border-end p-1`}><p className="fw-bold"></p></div>
                                    <div className={`${style?.productDesPrint5} border-end p-1 fw-bold d-flex align-items-center`}>
                                        <p className="fw-bold" style={{ fontSize: "17px" }}>TOTAL</p>
                                    </div>
                                    <div className={`${style?.materialRetailInvoice5} border-end d-flex`}>
                                        <div style={{ width: "16%" }} className={` border-end d-flex align-items-center justify-content-end`}><p className="fw-bold p-1 lh-1"></p></div>
                                        <div style={{ width: "20%" }} className={` border-end d-flex align-items-center justify-content-end`}></div>
                                        <div style={{ width: "16%" }} className={` border-end d-flex align-items-center justify-content-end`}> <p className="fw-bold p-1 lh-1 text-end">{fixedValues(total?.gwt, 3)} gm</p> </div>
                                        <div style={{ width: "16%" }} className={` border-end p-1 flex-column d-flex align-items-end justify-content-center`}> <p className="fw-bold pb-1 text-end lh-1">{fixedValues(total?.diamondColorStoneWt, 3)} Ctw</p> <p className="fw-bold text-end lh-1">{fixedValues(total?.multiMetalMiscHsCode, 3)} gm</p></div>
                                        <div style={{ width: "16%" }} className={` border-end  d-flex align-items-center justify-content-end`}><p className="fw-bold p-1 text-end lh-1">{fixedValues(total?.nwt, 3)} gm</p></div>
                                        <div style={{ width: "16%" }} className={` d-flex align-items-center justify-content-end`}><p className="fw-bold p-1 text-end lh-1"></p></div>
                                    </div>
                                    <div className={`${style?.metalMakingRetailinvoice5} border-end flex-column d-flex align-items-center justify-content-end`}>
                                        <p className="fw-bold text-end p-1"></p>
                                    </div>
                                    <div className={`${style?.othersRetailInvoice5} border-end d-flex align-items-center justify-content-end`}><p className="fw-bold text-end p-1">
                                        {/* {NumberWithCommas(total?.others, 2)} */}
                                        {NumberWithCommas(total?.otherCharge, 2)}
                                    </p></div>
                                    <div className={`${style?.totalRetailInvoice5} d-flex align-items-center justify-content-end`}><p className="fw-bold text-end p-1">{NumberWithCommas(total?.total / headerData?.CurrencyExchRate, 2)}</p></div>
                                </div>
                                {/* tax */}
                                <div className="d-flex border-start border-end border-bottom w-100 no_break">
                                    <div className={`d-flex justify-content-between flex-column border-end ${style?.wordsJewellryRetailInvoice5}`}>
                                        <div className={`${style?.wordsJewerryRetailInvoicePrint}p-2 d-flex align-items-center pt-5`}>
                                            <div className="p-2 pt-4">
                                                <p>In Words  {headerData?.Currencyname}</p>
                                                <p className="fw-bold">{toWords.convert(+(total?.afterTax / headerData?.CurrencyExchRate)?.toFixed(2))} Only</p>
                                            </div>
                                        </div>
                                        <div className={`${style?.RemarkJewelleryInvoicePrintC} p-2`}>
                                            <div className="d-flex ">Old Gold Purchase Description : <div dangerouslySetInnerHTML={{ __html: headerData?.Remark }} className="fw-bold ps-1"></div></div>
                                        </div>
                                    </div>
                                    <div className={`${style?.discountJewerryRetailInvoicePrint564} d-flex`}>
                                        <div className={`${style?.wordsJewellryRetailInvoice4Taxes} border-end`}>
                                            <p className="pb-1 px-1 text-end">Discount</p>
                                            <p className="pb-1 px-1 text-end">Total Amt before Tax</p>
                                            {/* {taxes.length > 0 && taxes.map((e, i) => {
                                                return <p className="pb-1 px-1 text-end" key={i}>{e?.name} @ {e?.per}</p>
                                            })} */}
                                            <p className="pb-1 px-1 text-end">{headerData?.AddLess >= 0 ? "Add" : "Less"}</p>
                                            <p className="pb-1 px-1 text-end">Total Amt after Tax</p>
                                            <p className="pb-1 px-1 text-end">Old Gold</p>
                                            <p className="pb-1 px-1 text-end">Recv. in Cash</p>
                                            {bank.length > 0 && bank.map((e, i) => {
                                                return <p className="pb-1 px-1 text-end" key={i}>Recv. in Bank ({e?.label})</p>
                                            })}
                                            {/* <p className="pb-1 px-1">Recv. in Bank</p> */}
                                            <p className="pb-1 px-1 text-end">Net Bal. Amount</p>
                                            <p className="fw-bold p-1 border-top text-end">GRAND TOTAL</p>
                                        </div>
                                        <div className={`${style?.wordsJewellryRetailInvoice4TaxesNumbers}`}>
                                            <p className="text-end pb-1 px-1">{NumberWithCommas(total?.discount, 2)}</p>
                                            <p className="text-end pb-1 px-1">{NumberWithCommas(total?.beforeTax / headerData?.CurrencyExchRate, 2)}</p>
                                            {/* {taxes.length > 0 && taxes.map((e, i) => {
                                                return <p className="pb-1 px-1 text-end" key={i}>{NumberWithCommas((+e?.amount) / headerData?.CurrencyExchRate, 2)}</p>
                                            })} */}
                                            <p className="pb-1 px-1 text-end">{NumberWithCommas(headerData?.AddLess / headerData?.CurrencyExchRate, 2)}</p>
                                            <p className="pb-1 px-1 text-end">{NumberWithCommas(total?.afterTax / headerData?.CurrencyExchRate, 2)}</p>
                                            <p className="pb-1 px-1 text-end">{NumberWithCommas(headerData?.OldGoldAmount, 2)}</p>
                                            <p className="pb-1 px-1 text-end">{NumberWithCommas(headerData?.CashReceived, 2)}</p>
                                            {bank.length > 0 && bank.map((e, i) => {
                                                return <p className="pb-1 px-1 text-end" key={i}>{NumberWithCommas(e?.amount, 2)}</p>
                                            })}
                                            {/* <p className="pb-1 px-1 text-end">{NumberWithCommas(headerData?.BankReceived, 2)}</p> */}
                                            <p className="pb-1 px-1 text-end">{NumberWithCommas(((total?.afterTax / headerData?.CurrencyExchRate) - bank?.reduce((acc, cObj) => acc + +cObj?.amount, 0)), 2)}</p>
                                            <p className="fw-bold text-end p-1 border-top"><span dangerouslySetInnerHTML={{ __html: headerData?.Currencysymbol }}></span>{NumberWithCommas((total?.afterTax) / headerData?.CurrencyExchRate, 2)}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* remark */}
                                <div className="border-start border-end border-bottom p-2 no_break pb-3">
                                    <div dangerouslySetInnerHTML={{ __html: headerData?.Declaration }} className={`${style?.declarationUlJewelleryRetailInvoicePrntc} ${style?.retailinvoicePrint3}`}></div>
                                </div>
                                {/* bank detail */}
                                <div className="border-start border-end border-bottom d-flex no_break">
                                    <div className="col-4 p-2 border-end">
                                        <p className="fw-bold" style={{ wordBreak: "normal" }}>Bank Detail</p>
                                        <p style={{ wordBreak: "normal" }}>Bank name: {headerData?.bankname}</p>
                                        <p style={{ wordBreak: "normal" }}>Branch: {headerData?.bankaddress}</p>
                                        {/* <p style={{wordBreak:"normal"}}>{headerData?.PinCode}</p> */}
                                        <p style={{ wordBreak: "normal" }}>Account Name: {headerData?.accountname}</p>
                                        <p style={{ wordBreak: "normal" }}>Account No: {headerData?.accountnumber}</p>
                                        <p style={{ wordBreak: "normal" }}>RTGS NEFT IFSC: {headerData?.rtgs_neft_ifsc}</p>
                                    </div>
                                    <div className="col-4 p-2 border-end d-flex justify-content-between flex-column">
                                        <p>Signature</p>
                                        <p className="fw-bold">{headerData?.CustName}</p>
                                    </div>
                                    <div className="col-4 p-2 d-flex justify-content-between flex-column">
                                        <p>Signature</p>
                                        <p className="fw-bold">{headerData?.CompanyFullName}</p>
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

export default RetailInvoiceprint5;