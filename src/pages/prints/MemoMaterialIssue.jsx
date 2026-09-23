import React from 'react'
import "../../assets/css/prints/MemoMaterialIssue.css";
import { useEffect } from "react";
import { useState } from "react";
import {
    NumberWithCommas,
    apiCall,
    checkMsg,
    fixedValues,
    formatAmount,
    handlePrint,
    isObjectEmpty,

} from "../../GlobalFunctions";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import Loader from "../../components/Loader";

function MemoMaterialIssue({
    token,
    invoiceNo,
    printName,
    urls,
    evn,
    ApiVer,
}) {
    const [loader, setLoader] = useState(true);
    const [json0Data, setJson0Data] = useState({});
    const [msg, setMsg] = useState("");
    const [finalD, setFinalD] = useState({});
    const [custAddress, setCustAddress] = useState([]);
    const [taxAmont, setTaxAmount] = useState();
    const [extraTaxAmont, setExtraTaxAmount] = useState();
    const [headFlag, setHeadFlag] = useState(true);
    const [isImageWorking, setIsImageWorking] = useState(true);
    const [showBagNo, setShowBagNo] = useState(true);
    const [showAmountRate, setShowAmountRate] = useState(true);
    const [showDiaQualityColor, setShowDiaQualityColor] = useState(true);

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
                        let address =
                            data?.Data?.MaterialBill_Json[0]?.Printlable?.split("\r\n");
                        setCustAddress(address);

                        setJson0Data(data?.Data?.MaterialBill_Json[0]);
                        const sortedItems = [...(data?.Data?.MaterialBill_Json1 || [])].sort(
                            (a, b) => parseFloat(a?.ItemId || 0) - parseFloat(b?.ItemId || 0)
                        );

                        setFinalD(sortedItems);
                        
                       
                        // setTaxAmount(data?.Data?.MaterialBill_Json2[0] || {}) ;
                        setTaxAmount(data?.Data?.MaterialBill_Json2?.[0] ? [data.Data.MaterialBill_Json2[0]] : {});
                        setExtraTaxAmount(data?.Data?.MaterialBill_Json3);

                        setLoader(false);
                    } else {
                        setLoader(false);
                        setMsg("Data Not Found");
                    }
                } else {
                    setLoader(false);
                    const err = checkMsg(data?.Message);
                    setMsg(err);
                }
            } catch (error) {
                console.error(error);
            }
        };
        sendData();
    }, []);

    const totalMiscWeight = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
        const weight = parseFloat(item?.Weight);
        if (item?.ItemName === 'MISC') {
            return sum + (isNaN(weight) ? 0 : weight);
        }
        return sum;
    }, 0);

    const totalMetalWeight = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
        const weight = parseFloat(item?.Weight);
        if (item?.ItemName === 'METAL') {
            return sum + (isNaN(weight) ? 0 : weight);
        }
        return sum;
    }, 0);

    const ShapeWiseTotalWeight = (Array.isArray(finalD) ? finalD : []).reduce(
        (acc, item) => {
            if (item?.ItemName !== "METAL") return acc;

            const shape = item?.shape || "UNKNOWN";
            const weight = parseFloat(item?.Weight) || 0;
            const pureWeight = parseFloat(item?.PureWeight) || 0;

            acc.totalWeight += weight;
            acc.totalPureWeight += pureWeight;

            if (!acc.shapeWise[shape]) {
                acc.shapeWise[shape] = {
                    shape,
                    totalWeight: 0,
                    totalPureWeight: 0,
                };
            }

            acc.shapeWise[shape].totalWeight += weight;
            acc.shapeWise[shape].totalPureWeight += pureWeight;

            return acc;
        },
        {
            totalWeight: 0,
            totalPureWeight: 0,
            shapeWise: {},
        }
    );

    const handleImageErrors = () => {
        setIsImageWorking(false);
    };

    const toProperCase = (str) =>
        str?.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

    const metalAndMiscWeight = totalMetalWeight + totalMiscWeight;

    const remainingWeight = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
        const weight = parseFloat(item?.Weight);
        if (item?.ItemName !== 'DIAMOND' && item?.ItemName !== 'COLOR STONE') {
            return sum + (isNaN(weight) ? 0 : weight);
        }
        return sum;
    }, 0);

    const WeightDiaCS = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
        const weight = parseFloat(item?.Weight);
        if (item?.ItemName == 'DIAMOND' || item?.ItemName == 'COLOR STONE') {
            return sum + (isNaN(weight) ? 0 : weight);
        }
        return sum;
    }, 0);

    const totalPieces = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
        const pieces = parseFloat(item?.pieces);
        return sum + (isNaN(pieces) ? 0 : pieces);
    }, 0);

    const totalAmount = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
        const Amount = parseFloat(item?.Amount);
        return sum + (isNaN(Amount) ? 0 : Amount);
    }, 0);

    const totalEtraTaxAmount = (Array.isArray(extraTaxAmont) ? extraTaxAmont : []).reduce((sum, item) => {
        const amount = parseFloat(item?.totaltaxAmount);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const groupedData = React.useMemo(() => {
        if (!Array.isArray(finalD)) return [];

        return Object.values(
            finalD.reduce((acc, item) => {
                const key = [
                    item.ItemName,
                    item.shape,
                    item.quality,
                    item.color,
                    item.size,
                    item.Rate
                ].join("|");

                if (!acc[key]) {
                    acc[key] = { ...item };
                } else {
                    acc[key].pieces =
                        (Number(acc[key].pieces) || 0) + (Number(item.pieces) || 0);

                    acc[key].Weight =
                        (Number(acc[key].Weight) || 0) + (Number(item.Weight) || 0);

                    acc[key].Amount =
                        (Number(acc[key].Amount) || 0) + (Number(item.Amount) || 0);
                }

                return acc;
            }, {})
        );
    }, [finalD]);

    const getItemDisplay = (e) => {
        switch (e?.ItemName) {
            case "FINDING":
                return `${e?.FindingType}(${e?.FindingAccessories})`;

            case "MOUNT":
                return e?.MountCategory;

            default:
                return "";
        }
    };

    const customOrder = [3, 4, 1, 5, 2, 7];

    const MergeData = Object.values(
        groupedData.reduce((acc, item) => {
            const id = item.ItemId;

            if (!acc[id]) {
                acc[id] = {
                    ItemId: id,
                    ItemName: item.ItemName,
                    items: [],
                    total: {
                        totalpcs: 0,
                        totalCtw: 0,
                        totalAmount: 0,
                        totalPureWt: 0
                    }
                };
            }

            acc[id].items.push(item);

            acc[id].total.totalpcs += item.pieces || 0;
            acc[id].total.totalCtw += item.Weight || 0;
            acc[id].total.totalPureWt += item.PureWeight || 0;
            acc[id].total.totalAmount += item.Amount || 0;

            return acc;
        }, {})
    ).sort((a, b) => customOrder.indexOf(a.ItemId) - customOrder.indexOf(b.ItemId));

    /* ---------------------------------------------------------------- */
    /* Column width helper (for the "else" table: ItemId not 1 or 5)      */
    /*                                                                      */
    /* Base widths shift based on the "Bag no." and "Amount/rate" toggles.  */
    /* For DIAMOND rows (ItemId === 3) specifically, when                   */
    /* `showDiaQualityColor` is false, the Quality and Color columns are     */
    /* hidden and their width is folded into the Shape column instead.      */
    /* ---------------------------------------------------------------- */
    const getOtherColWidths = (itemId) => {
        let widths;

        if (showBagNo && showAmountRate) {
            widths = { srNo: 4, bagNo: 11, shape: 15, quality: 13, color: 15, size: 10, pcs: 5, ctw: 7, rate: 10, amount: 10 };
        } else if (!showBagNo && showAmountRate) {
            widths = { srNo: 4, bagNo: 0, shape: 20, quality: 13, color: 15, size: 10, pcs: 8, ctw: 10, rate: 10, amount: 10 };
        } else if (showBagNo && !showAmountRate) {
            widths = { srNo: 4, bagNo: 11, shape: 15, quality: 13, color: 15, size: 10, pcs: 16, ctw: 16, rate: 0, amount: 0 };
        } else {
            widths = { srNo: 4, bagNo: 0, shape: 20, quality: 13, color: 15, size: 10, pcs: 20, ctw: 20, rate: 0, amount: 0 };
        }

        const hideQualityColor = itemId === 3 && !showDiaQualityColor;
        if (hideQualityColor) {
            widths.shape += widths.quality + widths.color;
            widths.quality = 0;
            widths.color = 0;
        }

        return Object.fromEntries(Object.entries(widths).map(([k, v]) => [k, `${v}%`]));
    };

    // Sum a set of width keys (as numbers) from a widths object -> "xx%"
    const sumWidths = (widths, keys) =>
        `${keys.reduce((sum, k) => sum + parseFloat(widths[k] || 0), 0)}%`;

    return (
        <>
            {loader ? (
                <Loader />
            ) : msg === "" ? (
                <div className='containerMemo'>
                    <div className='print_btn' style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", margin: "20px 0px" }}>
                        <div className="prnt_btn">
                            <input
                                type="button"
                                className="btn_white blue mt-0"
                                value="Print"
                                onClick={(e) => handlePrint(e)}
                            />
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={showDiaQualityColor}
                                onChange={(e) => setShowDiaQualityColor(e.target.checked)}
                            />
                            Dia-Quality-Color
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={showBagNo}
                                onChange={(e) => setShowBagNo(e.target.checked)}
                            />
                            Bag no.
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={showAmountRate}
                                onChange={(e) => setShowAmountRate(e.target.checked)}
                            />
                            Amount/rate.
                        </label>
                    </div>

                    {/* heading */}
                    <div className="headingBar">
                        MEMO ISSUED MATERIAL
                    </div>

                    <div className="spaceBetween" style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>

                        <div style={{ width: "70%", lineHeight: "16px" }} className="companyInfo">

                            <div className="spfnthead" >
                                {json0Data?.companyname !== "" && (<div className="spfntBld" style={{ fontSize: "15px", fontWeight: "bold" }}>{json0Data?.companyname}</div>)}
                                {json0Data?.CompanyAddress !== "" && (<div className="">{json0Data?.CompanyAddress}</div>)}
                                <div className="">{json0Data?.CompanyAddress2}</div>
                                <div className="">{json0Data?.CompanyCity} {json0Data?.CompanyCity && json0Data?.CompanyPinCode !== "" && ("-")} {json0Data?.CompanyPinCode !== "" && (`${json0Data?.CompanyPinCode},`)} {json0Data?.CompanyState}{json0Data?.CompanyCountry !== "" && (`(${json0Data?.CompanyCountry})`)}</div>
                                {json0Data?.CompanyTellNo !== "" && (<div className="">T {json0Data?.CompanyTellNo} {json0Data?.CompanyTollFreeNo ? ` | TOLL FREE ${json0Data?.CompanyTollFreeNo}` : ""}</div>)}
                                <div className="">{json0Data?.CompanyEmail} {json0Data?.CompanyWebsite && json0Data?.CompanyEmail !== "" && ("|")} {json0Data?.CompanyWebsite}</div>
                                <div className="">{json0Data?.Company_VAT_GST_No !== "" && (`${json0Data?.Company_VAT_GST}-${json0Data?.Company_VAT_GST_No}`)} {json0Data?.Company_VAT_GST_No && json0Data?.Company_CST_STATE_No !== "" && ("|")} {json0Data?.Company_CST_STATE_No !== "" && (`${json0Data?.Company_CST_STATE}-${json0Data?.Company_CST_STATE_No}`)} {json0Data?.Company_CST_STATE_No && json0Data?.ComPanCard !== "" && ("|")} {json0Data?.ComPanCard !== "" && (`PAN-${json0Data?.ComPanCard} `)}</div>
                            </div>

                        </div>

                        <div>
                            {typeof json0Data?.PrintLogo === 'string' && json0Data.PrintLogo.trim() !== '' && (
                                <div>
                                    <img
                                        src={json0Data.PrintLogo}
                                        alt="#companylogo"
                                        className="cmpnyLogo"
                                        width={85}
                                        height={85}
                                        onError={handleImageErrors}
                                    />
                                </div>
                            )}
                        </div>

                    </div>

                    {/* invoice detail */}
                    <div className="flexRow borderBox" style={{ padding: "5px", alignItems: "flex-start" }}>

                        <div style={{ width: "70%" }} className="">
                            <div style={{ margin: "5px", marginTop: "0px" }}>
                                <div className="companyTitle" style={{ paddingTop: "0px", display: "flex" }}>
                                    <div style={{ fontSize: "14px", fontWeight: "bold", width: "30px" }}>  <b>To ,</b> </div>
                                    <div style={{ fontSize: "13px", lineHeight: "1.1" }}>
                                        <div> {json0Data?.IsPrint_ShortCustomerDetails === 0 ? json0Data?.customerfirmname : json0Data?.Customercode}</div>
                                        <div>{json0Data?.customerregion}</div>
                                        <div>{json0Data?.customeremail}</div>
                                        <div>{json0Data?.customermobileno}</div>
                                        <div>
                                            {json0Data?.Cust_VAT_GST_No && (
                                                <>GSTIN-{json0Data.Cust_VAT_GST_No}</>
                                            )}

                                            {json0Data?.Cust_VAT_GST_No &&
                                                (json0Data?.Cust_CST_STATE || json0Data?.Cust_CST_STATE_No) &&
                                                " | "}

                                            {(json0Data?.Cust_CST_STATE || json0Data?.Cust_CST_STATE_No) && (
                                                <>
                                                    {json0Data?.Cust_CST_STATE}
                                                    {json0Data?.Cust_CST_STATE && json0Data?.Cust_CST_STATE_No && "-"}
                                                    {json0Data?.Cust_CST_STATE_No}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ width: "30%" }} className=" ">

                            <div style={{ margin: "0px 0 0 40px" }}>

                                <div className="flexRow" style={{ fontSize: "13px" }}>
                                    <div style={{ width: "35%" }}><div style={{ fontWeight: "bold", marginRight: "5px" }}>MEMO</div></div>
                                    <div>{json0Data?.MaterialBillNo}</div>
                                </div>

                                <div className="flexRow" style={{ fontSize: "13px" }}>
                                    <div style={{ width: "35%" }}><div style={{ fontWeight: "bold", marginRight: "5px" }}>DATE</div></div>
                                    <div>  {json0Data?.EntryDate1}</div>
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* table  */}

                    {MergeData?.length > 0 && MergeData.map((e, index) => {
                        const isMetalOrFinding = e.ItemId === 1 || e.ItemId === 5;
                        const colWidths = getOtherColWidths(e.ItemId);
                        // Quality/Color columns are hidden only for DIAMOND when the toggle is off
                        const showQualityColorCols = !(e.ItemId === 3 && !showDiaQualityColor);
                        const totalLabelWidth = isMetalOrFinding
                            ? "60%"
                            : sumWidths(colWidths, ['srNo', 'bagNo', 'shape', 'quality', 'color', 'size']);

                        return (
                            <div key={e.ItemId} style={{ border: "1px solid #C2C2C2", width: "100%", borderCollapse: "collapse", marginTop: "7px" }}>

                                {/* Title Row */}
                                <div style={{ display: "flex", borderBottom: "1px solid #C2C2C2" }}>
                                    <div style={{ padding: "3px 10px", fontWeight: "bold", width: "100%", color: "#6F6F6F", fontSize: "20px" }}>
                                        {e.ItemName
                                            ?.toLowerCase()
                                            .split(" ")
                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                            .join(" ")
                                        }
                                    </div>
                                </div>

                                {/* Header Row */}
                                {isMetalOrFinding ? (
                                    <div style={{ display: "flex", backgroundColor: "#DFDFDF", fontWeight: "bold", borderBottom: "1px solid #C2C2C2" }} className='font-print'>
                                        <div style={{ width: "4%", padding: "5px", borderRight: "1px solid #C2C2C2" }}> Sr.</div>
                                        <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>  {e.ItemId === 5 ? "Shape" : "Item"}</div>
                                        <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>{e.ItemId === 5 ? "Quality" : "Type"}</div>
                                        <div style={{ width: "14%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>Color</div>
                                        <div style={{ width: "12%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>{e.ItemId === 5 ? "Size" : "HSN#"}</div>
                                        <div style={{ width: showAmountRate ? "10%" : "20%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>{e.ItemId === 5 ? "Gms." : "gm."}</div>
                                        <div style={{ width: showAmountRate ? "10%" : "20%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}> Pure Wt.</div>

                                        {showAmountRate && (
                                            <>
                                                <div style={{ width: "10%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>Rate</div>
                                                <div style={{ width: "10%", padding: "5px", textAlign: "right" }}>Amount</div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", backgroundColor: "#DFDFDF", fontWeight: "bold", borderBottom: "1px solid #C2C2C2" }} className='font-print'>
                                        <div style={{ width: colWidths.srNo, padding: "5px", borderRight: "1px solid #C2C2C2" }}>Sr.</div>
                                        {showBagNo && (
                                            <div style={{ width: colWidths.bagNo, padding: "5px", borderRight: "1px solid #C2C2C2" }}>Bag no.</div>
                                        )}
                                        <div style={{ width: colWidths.shape, padding: "5px", borderRight: "1px solid #C2C2C2" }}>Shape</div>
                                        {showQualityColorCols && (
                                            <>
                                                <div style={{ width: colWidths.quality, padding: "5px", borderRight: "1px solid #C2C2C2" }}>Quality</div>
                                                <div style={{ width: colWidths.color, padding: "5px", borderRight: "1px solid #C2C2C2" }}>Color</div>
                                            </>
                                        )}
                                        <div style={{ width: colWidths.size, padding: "5px", borderRight: "1px solid #C2C2C2" }}>Size</div>
                                        <div style={{ width: colWidths.pcs, padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>Pcs</div>
                                        <div style={{ width: colWidths.ctw, padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>{e.ItemId === 3 || e.ItemId === 4 ? "Ctw" : "Gms"}</div>
                                        {showAmountRate && (
                                            <>
                                                <div style={{ width: colWidths.rate, padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>Rate</div>
                                                <div style={{ width: colWidths.amount, padding: "5px", textAlign: "right" }}>Amount</div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Data Rows */}
                                {e.items?.length > 0 && e.items.map((item, idx) => (
                                    isMetalOrFinding ? (
                                        <div key={idx} style={{ display: "flex", borderBottom: "1px solid #C2C2C2" }} className='font-print'>
                                            <div style={{ width: "4%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                                {idx + 1}
                                            </div>
                                            <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                                {item?.shape} {item?.LotNo && (`(${item?.LotNo})`)}
                                            </div>
                                            <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                                {e.ItemId === 5 ? item?.FindingType : item?.purity}
                                            </div>
                                            <div style={{ width: "14%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                                {item?.color}
                                            </div>
                                            <div style={{ width: "12%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                                {e.ItemId === 5 ? item?.FindingAccessories : item?.HSN_No}
                                            </div>
                                            <div style={{ width: showAmountRate ? "10%" : "20%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>
                                                {item?.Weight.toFixed(3)}
                                            </div>
                                            <div style={{ width: showAmountRate ? "10%" : "20%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>
                                                {item?.PureWeight.toFixed(3)}
                                            </div>
                                            {showAmountRate && (
                                                <>
                                                    <div style={{ width: "10%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>
                                                        {item?.Rate.toFixed(2)}
                                                    </div>
                                                    <div style={{ width: "10%", padding: "5px", textAlign: "right" }}>
                                                        {item?.Amount.toFixed(2)}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div key={idx} style={{ display: "flex", borderBottom: "1px solid #C2C2C2" }} className='font-print'>
                                            <div style={{ width: colWidths.srNo, padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                                {idx + 1}
                                            </div>
                                            {showBagNo && (
                                                <div style={{ width: colWidths.bagNo, padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                                    {item?.IsSolGem == "1" ? item?.RfBag : ""}
                                                </div>
                                            )}
                                            <div style={{ width: colWidths.shape, padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                                {item?.IsSolGem == "1" ? item?.ItemId == 3 ? "S: " : "G: " : ""}  {item?.shape} {item?.LotNo && (`(${item?.LotNo})`)}
                                                {item?.IsSolGem == "1" &&
                                                    <>
                                                        <div>{item?.labcode} {item?.labcode && item?.certno && <span> - </span>}
                                                        </div>
                                                        <div>{item?.certno}</div>
                                                    </>
                                                }
                                            </div>
                                            {showQualityColorCols && (
                                                <>
                                                    <div style={{ width: colWidths.quality, padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                                        {item?.quality}
                                                    </div>
                                                    <div style={{ width: colWidths.color, padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                                        {item?.color}
                                                    </div>
                                                </>
                                            )}
                                            <div style={{ width: colWidths.size, padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                                {item?.size}
                                            </div>
                                            <div style={{ width: colWidths.pcs, padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>
                                                {item?.pieces}
                                            </div>
                                            <div style={{ width: colWidths.ctw, padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>
                                                {item?.Weight.toFixed(3)}
                                            </div>
                                            {showAmountRate && (
                                                <>
                                                    <div style={{ width: colWidths.rate, padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>
                                                        {item?.Rate.toFixed(2)}
                                                    </div>
                                                    <div style={{ width: colWidths.amount, padding: "5px", textAlign: "right" }}>
                                                        {item?.Amount.toFixed(2)}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )
                                ))}

                                {/* Total Row */}
                                <div style={{ display: "flex" }} className='font-print'>
                                    <div style={{ width: totalLabelWidth, padding: "5px", fontWeight: "bold", borderRight: "1px solid #C2C2C2" }}>
                                        Total
                                    </div>
                                    <div style={{ width: isMetalOrFinding ? (showAmountRate ? "10%" : "20%") : colWidths.pcs, padding: "5px", textAlign: "right", fontWeight: "bold", borderRight: "1px solid #C2C2C2" }}>
                                        {isMetalOrFinding ? e?.total?.totalCtw?.toFixed(3) : e?.total?.totalpcs}
                                    </div>
                                    <div style={{ width: isMetalOrFinding ? (showAmountRate ? "10%" : "20%") : colWidths.ctw, padding: "5px", textAlign: "right", fontWeight: "bold", borderRight: "1px solid #C2C2C2" }}>
                                        {isMetalOrFinding ? e?.total?.totalPureWt?.toFixed(3) : e?.total?.totalCtw?.toFixed(3)}
                                    </div>

                                    {showAmountRate && (
                                        <>
                                            <div style={{ width: "10%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                            </div>
                                            <div style={{ width: "10%", padding: "5px", textAlign: "right", fontWeight: "bold" }}>
                                                {e?.total?.totalAmount.toFixed(2)}
                                            </div>
                                        </>
                                    )}
                                </div>

                            </div>
                        );
                    })}

                    <div
                        style={{
                            border: "1px solid #C2C2C2",
                            marginTop: "8px",
                            height: "100px",
                        }}
                    >
                        <div style={{ display: "flex", height: "100%" }}>

                            <div
                                id="bottom1"
                                style={{
                                    width: "50%",
                                    borderRight: "1px solid #C2C2C2",
                                    display: "flex",
                                    alignItems: "flex-end",
                                    justifyContent: "center",
                                    marginBottom: "7px"
                                }}
                            >
                                RECEIVER'S NAME & SIGNATURE
                            </div>

                            <div
                                id="bottom2"
                                style={{
                                    width: "50%",
                                    display: "flex",
                                    alignItems: "flex-end",
                                    justifyContent: "center",
                                    marginBottom: "7px"
                                }}
                            >
                                for,{json0Data?.companyname}
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
    )
}

export default MemoMaterialIssue