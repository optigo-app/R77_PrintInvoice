import React, { useEffect, useState } from "react";
import "../../assets/css/prints/JewelleryInvoicePrint5.css";
import {
    apiCall,
    checkMsg,
    formatAmount,
    handleImageError,
    handlePrint,
    isObjectEmpty,
    NumberWithCommas,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";


const JewelleryInvoicePrint5 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
    const [result, setResult] = useState(null);
    const [msg, setMsg] = useState("");
    const [loader, setLoader] = useState(true);
    const [imgFlag, setImgFlag] = useState(true);
    const [withPcs, setWithPcs] = useState(false);
    const [termsflag, setTermsflag] = useState(true);
    const [totalflag, setTotalflag] = useState(true);
    const [decimalflag, setDecimalflag] = useState(true);

    const [summary, setSummary] = useState(true);

    const [bankflag, setBankflag] = useState(true);
    const [withRate, setWithRate] = useState(false);
    const [mdwt, setMdwt] = useState(0);
    const [headerflag, setHeaderflag] = useState(true);
    const [activeType, setActiveType] = useState("B2B");
    const [MetShpWise, setMetShpWise] = useState([]);
    const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
    const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);
    const [isImageWorking, setIsImageWorking] = useState(true);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = (data) => {
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

        let mdtot = 0;
        datas?.resultArray?.forEach((e) => {
            mdtot += e?.totals?.diamonds?.Wt / 5 + e?.NetWt;
        });

        // datas?.resultArray?.forEach((e) => {
        //     let diamond_grouping = [];
        //     e?.diamonds?.forEach((el) => {
        //         let findRecord = diamond_grouping?.findIndex(
        //             (a) => a?.QualityName === el?.QualityName
        //         );
        //         if (findRecord === -1) {
        //             let obj = { ...el };
        //             obj.wt = obj?.Wt;
        //             obj.rate = obj?.Rate;
        //             obj.amount = obj?.Amount;
        //             diamond_grouping.push(obj);
        //         } else {
        //             diamond_grouping[findRecord].wt += el?.Wt;
        //             diamond_grouping[findRecord].rate += el?.Rate;
        //             diamond_grouping[findRecord].amount += el?.Amount;
        //         }
        //     });
        //     e.diamonds = diamond_grouping;
        // });

        const sortedArray = datas.resultArray.sort((a, b) => {
            const aGroupJobMatches = a.GroupJob && a.GroupJob === a.SrJobno;
            const bGroupJobMatches = b.GroupJob && b.GroupJob === b.SrJobno;

            if (aGroupJobMatches && !bGroupJobMatches) {
                return -1;
            }
            if (!aGroupJobMatches && bGroupJobMatches) {
                return 1;
            }
            return 0;
        });

        setMdwt(mdtot);
        setResult({ ...datas, resultArray: sortedArray });
        setLoader(false);
    };

    const handleImgShow = () => {
        if (imgFlag) setImgFlag(false);
        else {
            setImgFlag(true);
        }
    };

    const handleWithRate = () => {
        if (withRate) setWithRate(false);
        else {
            setWithRate(true);
        }
    };

    const handleSummary = () => {
        if (summary) setSummary(false);
        else {
            setSummary(true);
        }
    };
    const handleBank = () => {
        if (bankflag) setBankflag(false);
        else {
            setBankflag(true);
        }
    };

    const handleHeaderflag = () => {
        if (headerflag) setHeaderflag(false);
        else {
            setHeaderflag(true);
        }
    };

    const handleImageErrors = () => {
        setIsImageWorking(false);
    };

    const handleTermsflag = () => {
        if (termsflag) setTermsflag(false);
        else {
            setTermsflag(true);
        }
    };
    const handleTotalflag = () => {
        if (totalflag) setTotalflag(false);
        else {
            setTotalflag(true);
        }
    };
    const handleDecimalflag = () => {
        if (decimalflag) setDecimalflag(false);
        else {
            setDecimalflag(true);
        }
    };
  



    // console.log("resultresult", result);
    const isloss = result?.resultArray?.every(e => e?.LossWt === 0) ? 1 : 0;


    const totals = result?.resultArray?.reduce(
        (acc, row) => {
            acc.grossWt += Number(row?.grosswt || 0);
            acc.netWt += Number(row?.NetWt || 0);
            acc.metalAmt += Number(row?.MetalAmount || 0);
            acc.stonePcs += Number(row?.StonePcs || 0);
            acc.stoneWt += Number(row?.StoneWt || 0);
            acc.stoneAmt += Number(row?.StoneAmount || 0);
            acc.labAmt += Number(row?.LabAmount || 0);
            acc.totalCost += Number(row?.TotalCost || 0);
            return acc;
        },
        {
            grossWt: 0,
            netWt: 0,
            metalAmt: 0,
            stonePcs: 0,
            stoneWt: 0,
            stoneAmt: 0,
            labAmt: 0,
            totalCost: 0,
        }
    );


    console.log("TCL: result", result)



    return (
        <>
            {loader ? (
                <Loader />
            ) : (
                <>
                    {msg === "" ? (
                        <>
                            <div className="containerdp3">
                                {/* print pop up and img show */}
                                <div className="d-flex justify-content-end align-items-center user-select-none printHide_dp3" style={{ gap: "10px" }}>
                                    {/* 1. RADIO FILTER CONTROLS */}
                                    <div className="radio-group">
                                        {["B2B", "B2C", "Packing List"].map((label) => {
                                            const value = label.toUpperCase().replace(" ", "_");
                                            const isActive = activeType === value;
                                            return (
                                                <label key={value} className="checkbox-radio-label">
                                                    <input
                                                        type="radio"
                                                        name="tableType"
                                                        value={value}
                                                        checked={isActive}
                                                        onChange={() => setActiveType(value)}
                                                        className="hidden-radio"
                                                    />
                                                    {/* Custom Styled Checkbox Square Visual */}
                                                    <span className={`checkbox-box ${isActive ? "checked" : ""}`}>
                                                        {isActive && <span className="checkmark">✓</span>}
                                                    </span>
                                                    <span className="checkbox-text-label">
                                                        {/* Format exact casing representation to match "With Pcs" image theme */}
                                                        {label === "PACKING_LIST" || label === "Packing List" ? "Packing List" : label}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <div className="mb-1 me-2 justify-content-center align-items-center">
                                        <input
                                            type="checkbox"
                                            className="me-1"
                                            value={totalflag}
                                            checked={totalflag}
                                            onChange={(e) => handleTotalflag(e)}
                                            id="totalflag"
                                        />
                                        <label htmlFor="totalflag" style={{ fontSize: "13px" }}>
                                            {" "}
                                            <div className="pb-2">Total </div>
                                        </label>
                                    </div>
                                    <div className="mb-1 me-2 justify-content-center align-items-center">
                                        <input
                                            type="checkbox"
                                            className="me-1"
                                            value={decimalflag}
                                            checked={decimalflag}
                                            onChange={(e) => handleDecimalflag(e)}
                                            id="decimalflag"
                                        />
                                        <label htmlFor="decimalflag" style={{ fontSize: "13px" }}>
                                            {" "}
                                            <div className="pb-2">Amt Decimal </div>
                                        </label>
                                    </div>
                                    <div className="mb-1 me-2 justify-content-center align-items-center">
                                        <input
                                            type="checkbox"
                                            className="me-1"
                                            value={imgFlag}
                                            checked={imgFlag}
                                            onChange={(e) => handleImgShow(e)}
                                            id="imgflag"
                                        />
                                        <label htmlFor="imgflag" style={{ fontSize: "13px" }}>
                                            {" "}
                                            <div className="pb-2">Image </div>
                                        </label>
                                    </div>
                                    <div className="mb-1 me-2 justify-content-center align-items-center">
                                        <input
                                            type="checkbox"
                                            className="me-1"
                                            value={summary}
                                            checked={summary}
                                            onChange={(e) => handleSummary(e)}
                                            id="imgshowdp35"
                                        />
                                        <label htmlFor="imgshowdp35" style={{ fontSize: "13px" }}>
                                            {" "}
                                            <div className="pb-2">Summary </div>
                                        </label>
                                    </div>
                                    <div className="mb-1 me-2 justify-content-center align-items-center">
                                        <input
                                            type="checkbox"
                                            className="me-1"
                                            value={termsflag}
                                            checked={termsflag}
                                            onChange={(e) => handleTermsflag(e)}
                                            id="terms"
                                        />
                                        <label htmlFor="terms" style={{ fontSize: "13px" }}>
                                            {" "}
                                            <div className="pb-2">Terms </div>
                                        </label>
                                    </div>
                                    <div className="mb-1 me-2 justify-content-center align-items-center">
                                        <input
                                            type="checkbox"
                                            className="me-1"
                                            value={headerflag}
                                            checked={headerflag}
                                            onChange={(e) => handleHeaderflag(e)}
                                            id="header"
                                        />
                                        <label htmlFor="header" style={{ fontSize: "13px" }}>
                                            {" "}
                                            <div className="pb-2">Header </div>
                                        </label>
                                    </div>
                                    <div className="mb-1 me-2 justify-content-center align-items-center">
                                        <input
                                            type="checkbox"
                                            className="me-1"
                                            value={bankflag}
                                            checked={bankflag}
                                            onChange={(e) => handleBank(e)}
                                            id="bankdp35"
                                        />
                                        <label htmlFor="bankdp35" style={{ fontSize: "13px" }}>
                                            {" "}
                                            <div className="pb-2">Bank </div>
                                        </label>
                                    </div>
                                    <div className="mb-3">
                                        <button
                                            className="btn_white blue py-1"
                                            onClick={(e) => handlePrint(e)}
                                        >
                                            Print
                                        </button>
                                    </div>
                                </div>

                                <div className="headlabeldp3 fw-bold">
                                    {result?.header?.PrintHeadLabel}
                                </div>

                                {headerflag && (
                                    <div className='d-flex justify-content-between align-items-center p-1 headerfontsize'>
                                        <div className="fs_jts">
                                            {result?.header?.CompanyFullName && (
                                                <div className="fs2_jts fw-bold">
                                                    {result?.header?.CompanyFullName}
                                                </div>
                                            )}

                                            {result?.header?.CompanyAddress && (
                                                <div>{result?.header?.CompanyAddress}</div>
                                            )}

                                            {result?.header?.CompanyAddress2 && (
                                                <div>{result?.header?.CompanyAddress2}</div>
                                            )}

                                            {(result?.header?.CompanyCity ||
                                                result?.header?.CompanyPinCode ||
                                                result?.header?.CompanyState ||
                                                result?.header?.CompanyCountry) && (
                                                    <div>
                                                        {result?.header?.CompanyCity}
                                                        {result?.header?.CompanyPinCode &&
                                                            `${result?.header?.CompanyCity ? "-" : ""}${result?.header?.CompanyPinCode}`}
                                                        {(result?.header?.CompanyState || result?.header?.CompanyCountry) &&
                                                            `, ${result?.header?.CompanyState || ""}${result?.header?.CompanyCountry
                                                                ? ` (${result?.header?.CompanyCountry})`
                                                                : ""
                                                            }`}
                                                    </div>
                                                )}

                                            {result?.header?.CompanyTellNo && (
                                                <div>T {result?.header?.CompanyTellNo}</div>
                                            )}

                                            {(result?.header?.CompanyEmail || result?.header?.CompanyWebsite) && (
                                                <div>
                                                    {result?.header?.CompanyEmail}
                                                    {result?.header?.CompanyEmail &&
                                                        result?.header?.CompanyWebsite &&
                                                        " | "}
                                                    {result?.header?.CompanyWebsite}
                                                </div>
                                            )}

                                            {(result?.header?.Company_VAT_GST_No ||
                                                result?.header?.Company_CST_STATE ||
                                                result?.header?.Company_CST_STATE_No ||
                                                result?.header?.Com_pannumber) && (
                                                    <div>
                                                        {result?.header?.Company_VAT_GST_No}

                                                        {result?.header?.Company_VAT_GST_No &&
                                                            (result?.header?.Company_CST_STATE ||
                                                                result?.header?.Company_CST_STATE_No) &&
                                                            " | "}

                                                        {(result?.header?.Company_CST_STATE_No) && (
                                                            <>
                                                                {result?.header?.Company_CST_STATE}
                                                                {result?.header?.Company_CST_STATE_No &&
                                                                    `-${result?.header?.Company_CST_STATE_No}`}
                                                            </>
                                                        )}

                                                        {result?.header?.Company_CST_STATE_No &&
                                                            " | "}

                                                        {result?.header?.Com_pannumber &&
                                                            `PAN-${result?.header?.Com_pannumber}`}
                                                    </div>
                                                )}
                                        </div>
                                        <div>
                                            {isImageWorking && (result?.header?.PrintLogo !== "" &&
                                                <img src={result?.header?.PrintLogo} alt=""
                                                    className='w-100 h-auto my-0 mx-auto d-block object-fit-contain'
                                                    style={{ minHeight: '75px', minWidth: '200px', maxWidth: '210px', maxHeight: '75px' }}
                                                    onError={handleImageErrors} height={120} width={150} />)}
                                        </div>
                                    </div>
                                )}


                                <div className=' p-2 d-flex justify-content-between align-items-center headerfontsize' style={{ border: '1px solid #6c757d', marginBottom: '5px', marginTop: headerflag ? '0px' : '5px' }}>
                                    <div className='fs_jts'>
                                        <div>To,</div>
                                        <div className='fs2_jts1 fw-bold'>{result?.header?.customerfirmname}</div>
                                        <div>{result?.header?.customerstreet}</div>
                                        <div>{result?.header?.customerregion}</div>
                                        <div>{result?.header?.customercity} {result?.header?.customerpincode}</div>
                                        <div>Tel : {result?.header?.customermobileno}</div>
                                        <div>{result?.header?.customeremail1}</div>
                                    </div>
                                    <div className='fs_jts' style={{ paddingRight: "2.5rem" }}>
                                        <div>Invoice#: <span className='fw-bold'>{result?.header?.InvoiceNo}</span> <span className='spfontCol'>Dated</span> <span className='fw-bold'>{result?.header?.EntryDate}</span></div>
                                        {result?.header?.HSN_No && (
                                            <div>HSN: <span className='fw-bold'>{result?.header?.HSN_No}</span></div>
                                        )}
                                        {result?.header?.CustPanno &&(
                                            <div>PAN#: <span className='fw-bold'>{result?.header?.CustPanno}</span></div>

                                        )}

                                        <div>
                                            {(result?.header?.CustGstNo || result?.header?.Cust_VAT_GST_No) && (
                                                <>
                                                    {result?.header?.CustGstNo ? 'GSTIN' : 'VAT'}&nbsp;
                                                    <span className="fw-bold">
                                                        {result?.header?.CustGstNo || result?.header?.Cust_VAT_GST_No}
                                                    </span>

                                                    {result?.header?.Cust_CST_STATE_No && (
                                                        <>
                                                            {" | "}
                                                            {result?.header?.Cust_CST_STATE}
                                                            {result?.header?.Cust_CST_STATE_No && (
                                                                <span className="fw-bold">
                                                                    {" "}
                                                                    {result?.header?.Cust_CST_STATE_No}
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {result?.header?.DueDays === 0 ? '' : <div>Terms: <span className='fw-bold'>{result?.header?.DueDays} Days</span></div>}
                                        <div>Due Date: <span className='fw-bold'>{result?.header?.DueDate}</span></div>
                                    </div>
                                </div>





                                {/* table  */}
                                <div className="table-container">



                                    {/* 2. FLEX RECTANGLE TABLE WRAPPER */}
                                    <div className="table-wrapper">
                                        {/* TABLE HEADERS */}
                                        <div className="table-header-row">
                                            <div className="th col-sr wordBreak">Sr. No</div>
                                            {imgFlag && (
                                                <div className="th col-img">Image</div>

                                            )}
                                            <div className="th col-sku">SKU</div>

                                            <div className="th col-metal">Metal</div>
                                            <div className="th col-wt wordBreak">Gross Wt.</div>

                                            {(activeType === "B2B" || activeType === "B2C") && (
                                                <div className="th col-wt wordBreak">Metal Wt.</div>
                                            )}
                                            {activeType === "B2B" && (
                                                <div className="th col-amt wordBreak">Metal Amt.</div>
                                            )}
                                            {(activeType === "B2B" || activeType === "B2C") && (
                                                <>
                                                    <div className="th col-stone">Stone</div>
                                                    <div className="th col-pcs">Pcs</div>
                                                    <div className="th col-wt">Wt.</div>
                                                </>
                                            )}
                                            {activeType === "B2B" && (
                                                <>
                                                    <div className="th col-amt">Amount</div>
                                                    <div className="th col-amt wordBreak">Labour Amt.</div>
                                                </>
                                            )}
                                            <div className="th col-amt">Cost</div>
                                        </div>

                                        {/* TABLE BODY ROWS */}
                                        <div className="table-body">
                                            {result?.resultArray?.map((row, index) => {


                                                console.log("TCL:row?.diamonds ", row?.diamonds)

                                                const totalDiamonds = row?.diamonds.reduce(
                                                    (acc, item) => {
                                                        acc.materialName = "DIAMOND";
                                                        acc.totalPcs += Number(item.Pcs || 0);
                                                        acc.totalWt += Number(item.Wt || 0);
                                                        acc.totalAmt += Number(item.Amount || 0);
                                                        return acc;
                                                    },
                                                    {
                                                        materialName: "",
                                                        totalPcs: 0,
                                                        totalWt: 0,
                                                        totalAmt: 0
                                                    }
                                                );

                                                const ColorstoneData = Object.values(
                                                    row?.colorstone?.reduce((acc, item) => {
                                                        const key = item.QualityName;

                                                        if (!acc[key]) {
                                                            acc[key] = {
                                                                qualityName: key,
                                                                totalPcs: 0,
                                                                totalWt: 0,
                                                                totalAmt: 0,
                                                            };
                                                        }

                                                        acc[key].totalPcs += Number(item.Pcs || 0);
                                                        acc[key].totalWt += Number(item.Wt || 0);
                                                        acc[key].totalAmt += Number(item.Amount || 0);

                                                        return acc;
                                                    }, {})
                                                );

                                                const miscSummary = row?.misc?.reduce(
                                                    (acc, item) => {
                                                        acc.materialName = item.MasterManagement_DiamondStoneTypeName; // MISC
                                                        acc.totalPcs += Number(item.Pcs || 0);
                                                        acc.totalWt += Number(item.Wt || 0);
                                                        acc.totalAmt += Number(item.Amount || 0);
                                                        return acc;
                                                    },
                                                    {
                                                        materialName: "MISC",
                                                        totalPcs: 0,
                                                        totalWt: 0,
                                                        totalAmt: 0,
                                                    }
                                                );

 


                                                return (
                                                    <div key={index} className="table-row">
                                                        <div className="td col-sr ">{index + 1}</div>
                                                        {imgFlag && (
                                                            <div className="td col-img">
                                                                <div className="center_dp3">
                                                                    <img
                                                                        src={row?.DesignImage}
                                                                        alt="#designimg"
                                                                        onError={(e) => handleImageError(e)}
                                                                        className="designimg_dp3"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="td col-sku sku-text wordBreak" style={{ flexDirection: "column" ,textAlign:"center"}}>
                                                            <div> {row?.SrJobno || ""}</div>
                                                            <div className="wordBreak"> {row?.designno || "-"} </div>
                                                            <div className="wordBreak"> {row?.Categoryname || "-"} </div>
                                                        </div>

                                                        <div className="td col-metal wordBreak">
                                                            {row?.MetalType || ""} {row?.MetalPurity || ""} {row?.MetalColor || "-"}
                                                        </div>
                                                        <div className="td col-wt">{row?.grosswt?.toFixed(3)}</div>

                                                        {(activeType === "B2B" || activeType === "B2C") && (
                                                            <div className="td col-wt">{row?.NetWt?.toFixed(3)}</div>
                                                        )}
                                                        {activeType === "B2B" && (
                                                            <div className="td col-amt" style={{ justifyContent: "flex-end" }}> {decimalflag? row?.MetalAmount?.toFixed(2): Math.round(row?.MetalAmount )}</div>
                                                        )}

                                                        {(activeType === "B2B" || activeType === "B2C") && (
                                                            <>
                                                                <div className="td col-stone" style={{ flexDirection: "column" }} >
                                                                    {totalDiamonds?.totalWt > 0 && (
                                                                        <div className="wordBreak">{totalDiamonds?.materialName}  </div>

                                                                    )}

                                                                    {
                                                                        ColorstoneData?.length > 0 &&
                                                                        ColorstoneData?.map((item) => (
                                                                            <div key={item.qualityName}> {item.qualityName} </div>
                                                                        ))
                                                                    }
                                                                    {miscSummary?.totalWt > 0 && (
                                                                        <div>{miscSummary?.materialName}  </div>
                                                                    )}
                                                                </div>
                                                                <div className="td col-pcs" style={{ flexDirection: "column" }} >
                                                                    {totalDiamonds?.totalWt > 0 && (
                                                                        <div>{totalDiamonds?.totalPcs}  </div>

                                                                    )}
                                                                    {
                                                                        ColorstoneData?.length > 0 &&
                                                                        ColorstoneData?.map((item) => (
                                                                            <div key={item.totalPcs}> {item.totalPcs} </div>
                                                                        ))
                                                                    }
                                                                    {miscSummary?.totalWt > 0 && (
                                                                        <div>{miscSummary?.totalPcs}  </div>
                                                                    )}
                                                                </div>
                                                                <div className="td col-wt" style={{ flexDirection: "column" }}>
                                                                    {totalDiamonds?.totalWt > 0 && (
                                                                        <div>{totalDiamonds?.totalWt?.toFixed(3)}  </div>

                                                                    )}
                                                                    {
                                                                        ColorstoneData?.length > 0 &&
                                                                        ColorstoneData?.map((item) => (
                                                                            <div key={item.totalWt}> {item.totalWt?.toFixed(3)} </div>
                                                                        ))
                                                                    }
                                                                    {miscSummary?.totalWt > 0 && (
                                                                        <div>{miscSummary?.totalWt?.toFixed(3)}  </div>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                        {activeType === "B2B" && (
                                                            <>
                                                                <div className="td col-amt" style={{ flexDirection: "column", alignItems: "flex-end" }}>
                                                                    {totalDiamonds?.totalWt > 0 && (
                                                                        <div> {decimalflag? totalDiamonds?.totalAmt?.toFixed(2): Math.round(totalDiamonds?.totalAmt)}     </div>

                                                                    )}
                                                                    {
                                                                        ColorstoneData?.length > 0 &&
                                                                        ColorstoneData?.map((item) => (
                                                                            <div key={item.totalAmt}>  {decimalflag? item.totalAmt?.toFixed(2): Math.round(item.totalAmt)}     </div>
                                                                        ))
                                                                    }
                                                                    {miscSummary?.totalWt > 0 && (
                                                                        <div> {decimalflag? miscSummary?.totalAmt?.toFixed(2): Math.round(miscSummary?.totalAmt)}     </div>
                                                                    )}
                                                                </div>
                                                                <div className="td col-amt" style={{ justifyContent: "flex-end" }}>
                                                                   
                                                                   
                                                                   
                                                                   {decimalflag ?NumberWithCommas(  row?.MakingAmount / result?.header?.CurrencyExchRate, 2 ):NumberWithCommas(Math.round(  row?.MakingAmount / result?.header?.CurrencyExchRate) ) }
                                                                    
                                                                </div>
                                                            </>
                                                        )}
                                                        <div className="td col-amt" style={{ justifyContent: "flex-end" }}> {decimalflag? NumberWithCommas(row?.UnitCost, 2): NumberWithCommas(Math.round(row?.UnitCost))}     </div>
                                                    </div>
                                                )


                                            })}

                                            {/* Dynamic Total Row Calculation Section */}
                                            {totalflag && (

                                                <div className="table-row" style={{ fontWeight: "bold" }}>
                                                    <div className="td col-sr " style={{ borderRight: "none" }}> </div>
                                                    {imgFlag && (
                                                        <div className="td col-img" style={{ borderRight: "none" }}>
                                                            <div className="center_dp3">

                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="td col-sku sku-text" style={{ borderRight: "none" }}>

                                                    </div>

                                                    <div className="td col-metal"  >
                                                        Total
                                                    </div>
                                                    <div className="td col-wt">{result?.mainTotal?.grosswt?.toFixed(3)}</div>

                                                    {(activeType === "B2B" || activeType === "B2C") && (
                                                        <div className="td col-wt">{result?.mainTotal?.metal?.Wt?.toFixed(3)} </div>
                                                    )}
                                                    {activeType === "B2B" && (
                                                        <div className="td col-amt" style={{ justifyContent: "flex-end" }}> 
                                                            {decimalflag?  formatAmount(
                                                                result?.mainTotal?.metal?.Amount /  result?.header?.CurrencyExchRate,
                                                                2
                                                            ): NumberWithCommas(Math.round( result?.mainTotal?.metal?.Amount /  result?.header?.CurrencyExchRate, ))}
                                                            </div>
                                                    )}

                                                    {(activeType === "B2B" || activeType === "B2C") && (
                                                        <>
                                                            <div className="td col-stone"></div>
                                                            <div className="td col-pcs">{(result?.mainTotal?.diamonds?.Pcs + result?.mainTotal?.stone_misc?.Pcs)}</div>
                                                            <div className="td col-wt">{(result?.mainTotal?.diamonds?.Wt + result?.mainTotal?.stone_misc?.Wt)?.toFixed(3)}</div>
                                                        </>
                                                    )}
                                                    {activeType === "B2B" && (
                                                        <>
                                                            <div className="td col-amt" style={{ justifyContent: "flex-end" }}> 
                                                                  
                                                            {decimalflag? NumberWithCommas(result?.mainTotal?.diamonds?.Amount + result?.mainTotal?.stone_misc?.Amount, 2): NumberWithCommas(Math.round(result?.mainTotal?.diamonds?.Amount + result?.mainTotal?.stone_misc?.Amount))}
                                                                  
                                                                  
                                                            </div>
                                                            <div className="td col-amt" style={{ justifyContent: "flex-end" }}>  
                                                                
                                                                {decimalflag? NumberWithCommas(result?.mainTotal?.total_Making_Amount, 2) : NumberWithCommas(Math.round(result?.mainTotal?.total_Making_Amount))}
                                                                
                                                                
                                                                
                                                                </div>
                                                        </>
                                                    )}
                                                    <div className="td col-amt" style={{ justifyContent: "flex-end" }}>
                                                       
                                                    {decimalflag? formatAmount(
                                                            result?.mainTotal?.total_unitcost /
                                                            result?.header?.CurrencyExchRate,
                                                            2
                                                        ): NumberWithCommas(Math.round(result?.mainTotal?.total_unitcost / result?.header?.CurrencyExchRate ))}
                                                       
                                                       
                                                       
                                                    </div>
                                                </div>
                                            )}



                                        </div>
                                    </div>
                                </div>


                                {/* summary & footer */}
                                <div
                                    className="d-flex justify-content-between align-items-start fs_dp3 dp3_pgia "
                                    style={{ marginTop: "2px" }}
                                >
                                    <div className="d-flex justify-content-between " style={{ width: "100%" }} >

                                        <div style={{ width: "80%", display: "flex" ,border: "1px solid #6c757d"}}>
                                            {summary && (
                                                <div
                                                    
                                                    style={{ width: activeType === "B2B" ? "50%" : activeType === "B2C" ? "50%" : "50%" }}
                                                >
                                                    <div className="summary_dp3_head border-secondary border-bottom  fw-bold ">
                                                        SUMMARY
                                                    </div>
                                                    <div className="d-flex w-100 " >
                                                        <div className="w-50">
                                                            <div className="d-flex justify-content-between">
                                                                <div className="border-secondary  pad_s_dp3 fw-bold ps-2">
                                                                    GOLD IN 24KT
                                                                </div>

                                                                <div className="border-secondary border-end pad_e_dp3 pe-2">
                                                                    {
                                                                    
                                                                    
                                                                    
                                                                    (
                                                                        result?.mainTotal?.total_purenetwt -
                                                                        notGoldMetalWtTotal
                                                                    )?.toFixed(3)}{" "}
                                                                    gm
                                                                </div>
                                                            </div>

                                                            {MetShpWise?.map((e, i) => {
                                                                return (
                                                                    <div
                                                                        className="d-flex justify-content-between"
                                                                        key={i}
                                                                    >
                                                                        <div className="border-secondary pad_s_dp3 fw-bold ps-2">
                                                                            {e?.ShapeName}
                                                                        </div>
                                                                        <div className="border-secondary border-end pad_e_dp3 pe-2">
                                                                            {e?.metalfinewt?.toFixed(3)} gm
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}

                                                            <div className="d-flex justify-content-between">
                                                                <div className="border-secondary pad_s_dp3 fw-bold ps-2">
                                                                    GROSS WT
                                                                </div>
                                                                <div className="border-secondary border-end pad_e_dp3 pe-2">
                                                                    {result?.mainTotal?.grosswt?.toFixed(3)} gm
                                                                </div>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <div className="border-secondary pad_s_dp3 fw-bold ps-2">
                                                                    G+D WT
                                                                </div>
                                                                <div className="border-secondary border-end pad_e_dp3 pe-2">
                                                                    {mdwt?.toFixed(3)} gm
                                                                </div>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <div className="border-secondary pad_s_dp3 fw-bold ps-2">
                                                                    NET WT
                                                                </div>
                                                                <div className="border-secondary border-end pad_e_dp3 pe-2">
                                                                    {/* {result?.mainTotal?.metal?.IsPrimaryMetal?.toFixed( */}
                                                                    {result?.mainTotal?.netwtWithLossWt?.toFixed(
                                                                        3
                                                                    )}{" "}
                                                                    gm
                                                                </div>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <div className="border-secondary   pad_s_dp3 fw-bold ps-2">
                                                                    DIAMOND WT
                                                                </div>
                                                                <div className="border-secondary border-end pad_e_dp3 pe-2">
                                                                    {result?.mainTotal?.diamonds?.Wt?.toFixed(3)} cts
                                                                </div>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <div className="border-secondary  pad_s_dp3 fw-bold ps-2">
                                                                    STONE WT
                                                                </div>
                                                                <div className="border-secondary border-end pad_e_dp3 pe-2">
                                                                    {" "}
                                                                    {result?.mainTotal?.colorstone?.Wt?.toFixed(
                                                                        3
                                                                    )}{" "}
                                                                    cts
                                                                </div>
                                                            </div>
                                                            <div className="summary_dp3_head border-secondary border-end  " style={{background:"none",borderTop:"none"}}></div>
                                                        </div>
                                                        <div className="w-50 " >
                                                            <div className="d-flex justify-content-between">
                                                                <div className="pad_s_dp3 fw-bold ps-2">GOLD</div>
                                                                <div className="border-secondary border-end pad_e_dp3 pe-2">
                                                                  
                                                                    {
                                                                    decimalflag ?
                                                                    
                                                                    
                                                                    formatAmount(
                                                                        result?.mainTotal?.MetalAmount -
                                                                        notGoldMetalTotal
                                                                    ): Math.round(
                                                                        result?.mainTotal?.MetalAmount -
                                                                        notGoldMetalTotal
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {MetShpWise?.map((e, i) => {
                                                                return (
                                                                    <div
                                                                        className="d-flex justify-content-between"
                                                                        key={i}
                                                                    >
                                                                        <div className="pad_s_dp3 fw-bold ps-2">
                                                                            {e?.ShapeName}
                                                                        </div>
                                                                        <div className="border-secondary border-end pad_e_dp3 pe-2">
                                                                            { decimalflag ? formatAmount(e?.Amount) : Math.round(e?.Amount)}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}

                                                            <div className="d-flex justify-content-between">
                                                                <div className="pad_s_dp3 fw-bold ps-2">
                                                                    DIAMOND
                                                                </div>
                                                                <div className="border-secondary border-end pad_e_dp3 pe-2">
                                                                    { decimalflag ? formatAmount(
                                                                        result?.mainTotal?.diamonds?.Amount
                                                                    ) : Math.round(
                                                                        result?.mainTotal?.diamonds?.Amount
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <div className="pad_s_dp3 fw-bold ps-2">CST</div>
                                                                <div className="border-secondary border-end pad_e_dp3 pe-2">
                                                                    { decimalflag ? formatAmount(
                                                                        result?.mainTotal?.colorstone?.Amount
                                                                    ) : Math.round(
                                                                        result?.mainTotal?.colorstone?.Amount
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <div className="pad_s_dp3 fw-bold ps-2">MAKING</div>
                                                                <div className="border-secondary border-end pad_e_dp3 pe-2">
                                                                    { decimalflag ? formatAmount(
                                                                        result?.mainTotal?.total_Making_Amount +
                                                                        result?.mainTotal?.diamonds?.SettingAmount +
                                                                        result?.mainTotal?.colorstone?.SettingAmount
                                                                    ) : Math.round(
                                                                        result?.mainTotal?.total_Making_Amount +
                                                                        result?.mainTotal?.diamonds?.SettingAmount +
                                                                        result?.mainTotal?.colorstone?.SettingAmount
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <div className="pad_s_dp3 fw-bold ps-2">OTHER</div>
                                                                <div className="border-secondary border-end pad_e_dp3 pe-2">
                                                                    { decimalflag ? formatAmount(
                                                                        result?.mainTotal
                                                                            ?.total_otherCharge_Diamond_Handling
                                                                    ) : Math.round(
                                                                        result?.mainTotal
                                                                            ?.total_otherCharge_Diamond_Handling
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <div className="pad_s_dp3 fw-bold ps-2">
                                                                    ADD/LESS
                                                                </div>
                                                                <div className="border-secondary border-end pad_e_dp3 pe-2">
                                                                    { decimalflag ? formatAmount(result?.header?.AddLess)
                                                                     : Math.round(
                                                                        result?.header?.AddLess
                                                                    )}
                                                                </div>
                                                            </div>

                                                          
                                                                <div className="d-flex justify-content-between">
                                                                <div className="pad_s_dp3 fw-bold ps-2">
                                                                Shipping
                                                                </div>
                                                                <div className="border-secondary border-end pad_e_dp3 pe-2">
                                                                {decimalflag? formatAmount(result?.header?.FreightCharges / result?.header?.CurrencyExchRate): Math.round(result?.header?.FreightCharges / result?.header?.CurrencyExchRate )}
                                                                </div>
                                                            </div>
                                                           

                                                            
                                                            {/* <div className="d-flex border-bottom justify-content-between  border-secondary border   border-start-0 bgc_dp3">
                                                                <div className="pad_s_dp3 fw-bold ps-2">TOTAL</div>
                                                                
                                                                <div className="pad_e_dp3 pe-2">
                                                                    { decimalflag ? formatAmount(
                                                                        result?.mainTotal.total_amount +
                                                                        result?.header?.FreightCharges+
                                                                        result?.header?.AddLess +
                                                                        result?.allTaxesTotal *
                                                                        result?.header?.CurrencyExchRate
                                                                    ): Math.round(
                                                                        result?.mainTotal.total_amount +result?.header?.FreightCharges+
                                                                        result?.header?.AddLess +
                                                                        result?.allTaxesTotal *
                                                                        result?.header?.CurrencyExchRate
                                                                    )}
                                                                </div>
                                                            </div> */}
                                                        </div>
                                                    </div>


                                                    
                                                </div>
                                            )}

                                            <div
                                                
                                                style={{width: summary ? "50%" : "100%" }}
                                            >

                                                <div   className="summary_dp3_head border-secondary border  border-top-0 fw-bold">
                                                    Remark
                                                </div>

                                                {

                                                    <div
                                                         
                                                        className="     pad_s_dp3 ps-2 text-break remarksHeight"
                                                        dangerouslySetInnerHTML={{
                                                            __html: result?.header?.PrintRemark,
                                                        }}
                                                    ></div>

                                                }

                                            </div>
                                        </div>
                                        <div className="totalamtfont" style={{ fontWeight: "bold", width: activeType === "B2B" ? "17%" : activeType === "B2C" ? "21.5%" : "39%", border: "1px solid #000", padding: "5px" }}>
                                            {result?.mainTotal?.DiscountAmt !== 0 && (
                                                <div className="w-100 d-flex align-items-center tb_fs_pcls">
                                                    <div
                                                        style={{ width: "50%", textAlign: "center" }}
                                                        className="end_pcls pdr_pcls"
                                                    >
                                                        Total Discount
                                                    </div>
                                                    <div
                                                        style={{ width: "50%", textAlign: "right" }}
                                                        className="end_pcls pdr_pcls"
                                                    >

                                                    {decimalflag? formatAmount( result?.mainTotal?.total_discount_amount / result?.header?.CurrencyExchRate  ): Math.round(result?.mainTotal?.total_discount_amount / result?.header?.CurrencyExchRate )}
                                                       
                                                    </div>
                                                </div>
                                            )}
                                            <div className="w-100 d-flex align-items-center tb_fs_pcls">
                                                <div style={{ width: "50%", textAlign: "center" }} className="end_pcls pdr_pcls">
                                                    Total Amount
                                                </div>
                                                <div style={{ width: "50%", textAlign: "right" }} className="end_pcls pdr_pcls">
                                                   
                                                   
                                                {decimalflag? formatAmount( result?.mainTotal?.total_amount /  result?.header?.CurrencyExchRate ): Math.round(result?.mainTotal?.total_amount /  result?.header?.CurrencyExchRate )}
                                                   
                                                  
                                                </div>
                                            </div>
                                            {result?.allTaxes?.map((e, i) => {
                                                return (
                                                    <div
                                                        className="w-100 d-flex align-items-center tb_fs_pcls"
                                                        key={i}
                                                    >
                                                        <div
                                                            style={{ width: "60%", textAlign: "left" }}
                                                            className="end_pcls pdr_pcls"
                                                        >
                                                            {e?.name} @ {e?.per}
                                                        </div>
                                                        <div
                                                            style={{ width: "40%", textAlign: "right" }}
                                                            className="end_pcls pdr_pcls"
                                                        >
                                                          {decimalflag? formatAmount(e?.amount): Math.round(e?.amount)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div className="w-100 d-flex align-items-center tb_fs_pcls">
                                                <div style={{ width: "50%", textAlign: "center" }} className="end_pcls pdr_pcls">
                                                    {result?.header?.AddLess > 0 ? "Add" : result?.header?.AddLess < 0 ? "Less" : ""}
                                                </div>
                                                <div style={{ width: "50%", textAlign: "right" }} className="end_pcls pdr_pcls">
                                                    {result?.header?.AddLess !== 0 &&
                                                        formatAmount(result?.header?.AddLess / result?.header?.CurrencyExchRate
                                                        )}
                                                </div>
                                            </div>
                                            {result?.header?.FreightCharges !== 0 && (
                                                <div className="w-100 d-flex align-items-center tb_fs_pcls">
                                                    <div
                                                        style={{ width: "50%", textAlign: "center" }}
                                                        className="end_pcls pdr_pcls"
                                                    >
                                                        {result?.header?.ModeOfDel}
                                                    </div>
                                                    <div
                                                        style={{ width: "50%", textAlign: "right" }}
                                                        className="end_pcls pdr_pcls"
                                                    >
                                                        {result?.header?.FreightCharges !== 0 &&
                                                            decimalflag? formatAmount(result?.header?.FreightCharges / result?.header?.CurrencyExchRate): Math.round(result?.header?.FreightCharges / result?.header?.CurrencyExchRate )}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="w-100 d-flex align-items-center tb_fs_pcls fw-bold">
                                                <div style={{ width: "50%", textAlign: "center" }} className="end_pcls pdr_pcls">
                                                    Final Amount
                                                </div>
                                                <div style={{ width: "50%", textAlign: "right" }} className="end_pcls pdr_pcls">
                                                    
                                                    
                                               { decimalflag ?
                                                    formatAmount(
                                                        result?.mainTotal?.total_amount /
                                                        result?.header?.CurrencyExchRate +
                                                        result?.allTaxesTotal +
                                                        result?.header?.FreightCharges /
                                                        result?.header?.CurrencyExchRate +
                                                        result?.header?.AddLess /
                                                        result?.header?.CurrencyExchRate
                                                        , 2)
                                                    :
                                                    
                                                        (Math.round( result?.mainTotal?.total_amount) /
                                                        result?.header?.CurrencyExchRate) +
                                                        Math.round(result?.allTaxesTotal) +
                                                        Math.round(result?.header?.FreightCharges) /
                                                        Math.round(  result?.header?.CurrencyExchRate) +
                                                        Math.round(result?.header?.AddLess) /
                                                       result?.header?.CurrencyExchRate
                                                       
                                                    
                                                    }
                                                </div>
                                            </div>
                                        </div>


                                    </div>

                                </div>


                                <div className="d-flex intru_qrC mt-1 pbia_pcl3"  >

                                    {termsflag && (
                                        <div className="instruct" style={{ width: `${bankflag ? "66%" : "100%"}`, border: "1px solid #dee2e6 ", padding: "5px", marginRight: `${bankflag ? "5px" : "0px"}` }}>
                                            <p className="fw-bold">Terms & Condition:</p>
                                            <div
                                                className="tb_fs_pclsINS"
                                                style={{ fontSize: "12px" }}
                                                dangerouslySetInnerHTML={{
                                                    __html: result?.header?.Declaration,
                                                }}
                                            ></div>
                                        </div>
                                    )}


                                    {bankflag && (
                                        <div className="disColunm check_dp10 ball_dp10 pb-1 fsgdp10 tb_fs_pcls1 minH_sum_pcl3" style={{ width: termsflag ? "34%" : "100%", border: "1px solid #dee2e6 " }}>
                                            <div style={{ padding: "5px", lineHeight: "1",fontSize: "11px" }}>
                                                <div className="w-100 fw-bold text-center">
                                                    Bank Details
                                                </div>
                                                {result?.header?.bankname && (
                                                    <div className="d-flex w-100">
                                                        <span className="fw-bold spwdth">Bank Name</span>:
                                                        <span className="spwdth1 spbrWord" style={{ marginLeft: "5px" }}>
                                                            {result.header.bankname}
                                                        </span>
                                                    </div>
                                                )}

                                                {result?.header?.bankaddress && (
                                                    <div className="d-flex w-100">
                                                        <span
                                                            className="fw-bold spwdth"
                                                            style={{ wordBreak: "normal" }}
                                                        >
                                                            Branch
                                                        </span>
                                                        :
                                                        <span className="spwdth1 spbrWord" style={{ marginLeft: "5px" }}>
                                                            {result.header.bankaddress}
                                                        </span>
                                                    </div>
                                                )}

                                                {result?.header?.accountname && (
                                                    <div className="d-flex w-100">
                                                        <span className="fw-bold spwdth">Account Name</span>:
                                                        <span className="spwdth1 spbrWord" style={{ marginLeft: "5px" }}>
                                                            {result.header.accountname}
                                                        </span>
                                                    </div>
                                                )}

                                                {result?.header?.accountnumber && (
                                                    <div className="d-flex w-100">
                                                        <span className="fw-bold spwdth">Account No</span>:
                                                        <span className="spwdth1 spbrWord" style={{ marginLeft: "5px" }}>
                                                            {result.header.accountnumber}
                                                        </span>
                                                    </div>
                                                )}

                                                {result?.header?.rtgs_neft_ifsc && (
                                                    <div className="d-flex w-100">
                                                        <span className="fw-bold spwdth">RTGS/NEFT/IFSC</span>:
                                                        <span className="spwdth1 spbrWord" style={{ marginLeft: "5px" }}>
                                                            {result.header.rtgs_neft_ifsc}
                                                        </span>
                                                    </div>
                                                )}

                                                {result?.header?.swiftcode && (
                                                    <div className="d-flex w-100">
                                                        <span className="fw-bold spwdth">SWIFT CODE</span>:
                                                        <span className="spwdth1 spbrWord" style={{ marginLeft: "5px" }}>
                                                            {result.header.swiftcode}
                                                        </span>
                                                    </div>
                                                )}

                                                {result?.header?.micrcode && (
                                                    <div className="d-flex w-100">
                                                        <span className="fw-bold spwdth">MICR CODE</span>:
                                                        <span className="spwdth1 spbrWord" style={{ marginLeft: "5px" }}>
                                                            {result.header.micrcode}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                </div>

                                <div className="d-flex w-100 brall_pcls brtop_none min_heig pbia_pcl3" style={{ border: "1px solid #dee2e6 " }}>
                                    <div className="col-4 p-2 w-50 border-end align-items-center d-flex justify-content-end ali flex-column">
                                        <p className="fw-bold">Customer Signature</p>
                                    </div>
                                    <div className="col-4 p-2 w-50 d-flex align-items-center justify-content-between flex-column">
                                        <p className="fw-bold">
                                            For {result?.header?.CompanyFullName}
                                        </p>
                                        <img
                                            src={result?.header?.DigitalSignature}
                                            height="80px"
                                            width="80px"
                                        />
                                        <p className="fw-bold">Authorized Signature</p>
                                    </div>
                                </div>
                                <div
                                    className="text-secondary printHide_dp3"
                                    style={{ fontSize: "14px" }}
                                >
                                    ** THIS IS A COMPUTER GENERATED INVOICE AND KINDLY NOTIFY US
                                    IMMEDIATELY IN CASE YOU FIND ANY DISCREPANCY IN THE DETAILS OF
                                    TRANSACTIONS
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
                            {msg}
                        </p>
                    )}
                </>
            )
            }
        </>
    );
};

export default JewelleryInvoicePrint5;
