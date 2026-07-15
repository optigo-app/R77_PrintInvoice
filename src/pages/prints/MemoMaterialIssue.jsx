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
                        console.log("data", data);

                        setJson0Data(data?.Data?.MaterialBill_Json[0]);
                        const sortedItems = [...(data?.Data?.MaterialBill_Json1 || [])].sort(
                            (a, b) => parseFloat(a?.ItemId || 0) - parseFloat(b?.ItemId || 0)
                        );

                        console.log("TCL: sendData -> sortedItems", sortedItems)
                        setFinalD(sortedItems);
                        setTaxAmount(data?.Data?.MaterialBill_Json2[0]);
                        setExtraTaxAmount(data?.Data?.MaterialBill_Json3);

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

    console.log("TCL: finalD", finalD)


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

            // Total weight
            acc.totalWeight += weight;
            acc.totalPureWeight += pureWeight;

            // Shape-wise aggregation
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

    console.log("TCL: remainingWeight", remainingWeight, metalAndMiscWeight, totalMetalWeight)
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

    console.log("TCL: totalAmount", totalAmount)
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


    console.log("TCL: groupedData", groupedData)

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

    console.log(MergeData);





    return (
        <>
            {loader ? (
                <Loader />
            ) : msg === "" ? (
                <div className='containerMemo'>
                    <div className='print_btn' style={{ display: "flex", justifyContent: "center", margin: "20px 0px" }}>
                        <div className="prnt_btn">
                            <input
                                type="button"
                                className="btn_white blue mt-0"
                                value="Print"
                                onClick={(e) => handlePrint(e)}
                            />
                        </div>
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

                    {MergeData?.length > 0 && MergeData.map((e, index) => (
                        <div style={{ border: "1px solid #C2C2C2", width: "100%", borderCollapse: "collapse", marginTop: "7px" }}>

                            {/* Title Row */}
                            <div style={{ display: "flex", borderBottom: "1px solid #C2C2C2" }}>
                                <div style={{ padding: "10px", fontWeight: "bold", width: "100%", color: "#6F6F6F", fontSize: "20px" }}>
                                    {e.ItemName
                                        ?.toLowerCase()
                                        .split(" ")
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(" ")
                                    }
                                </div>
                            </div>


                            {(e.ItemId === 1 || e.ItemId === 5) ? (

                                <div style={{ display: "flex", backgroundColor: "#DFDFDF", fontWeight: "bold", borderBottom: "1px solid #C2C2C2", fontSize: "13px" }} >

                                    <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>  {e.ItemId === 5 ? "Shape" : "Item"}</div>
                                    <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>{e.ItemId === 5 ? "Quality" : "Type"}</div>
                                    <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>Color</div>
                                    <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>{e.ItemId === 5 ? "Size" : "HSN#"}</div>
                                    <div style={{ width: "10%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>{e.ItemId === 5 ? "Gms." : "gm."}</div>
                                    <div style={{ width: "10%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}> Pure Wt.</div>
                                    <div style={{ width: "10%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>Rate</div>
                                    <div style={{ width: "10%", padding: "5px", textAlign: "right" }}>Amount</div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "flex", backgroundColor: "#DFDFDF", fontWeight: "bold", borderBottom: "1px solid #C2C2C2", fontSize: "13px"
                                    }}
                                >

                                    <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>Shape</div>
                                    <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>Quality</div>
                                    <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>Color</div>
                                    <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>Size</div>
                                    <div style={{ width: "10%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>Pcs</div>
                                    <div style={{ width: "10%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>{e.ItemId === 3 || e.ItemId === 4 ? "Ctw" : "Gms"}</div>
                                    <div style={{ width: "10%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>Rate</div>
                                    <div style={{ width: "10%", padding: "5px", textAlign: "right" }}>Amount</div>
                                </div>
                            )}


                            {/* Data Row */}
                            {e.items?.length > 0 && e.items.map((item, idx) => (

                                (e.ItemId === 1 || e.ItemId === 5) ? (
                                    <div style={{ display: "flex", borderBottom: "1px solid #C2C2C2", fontSize: "13px" }}>
                                        <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                            {item?.shape} {item?.LotNo && (`(${item?.LotNo})`)}
                                        </div>
                                        <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                            {e.ItemId === 5 ? item?.FindingType : item?.purity}
                                        </div>
                                        <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                            {item?.color}
                                        </div>
                                        <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                            {e.ItemId === 5 ? item?.FindingAccessories : item?.HSN_No}
                                        </div>
                                        <div style={{ width: "10%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>
                                            {item?.Weight.toFixed(3)}
                                        </div>
                                        <div style={{ width: "10%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>
                                            {item?.PureWeight.toFixed(3)}
                                        </div>
                                        <div style={{ width: "10%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>
                                            {item?.Rate.toFixed(2)}
                                        </div>
                                        <div style={{ width: "10%", padding: "5px", textAlign: "right" }}>
                                            {item?.Amount.toFixed(2)}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", borderBottom: "1px solid #C2C2C2", fontSize: "13px" }}>
                                        <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                            {item?.shape} {item?.LotNo && (`(${item?.LotNo})`)}
                                        </div>
                                        <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                            {item?.quality}
                                        </div>
                                        <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                            {item?.color}
                                        </div>
                                        <div style={{ width: "15%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>
                                            {item?.size}
                                        </div>
                                        <div style={{ width: "10%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>
                                            {item?.pieces}
                                        </div>
                                        <div style={{ width: "10%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>
                                            {item?.Weight.toFixed(3)}
                                        </div>
                                        <div style={{ width: "10%", padding: "5px", textAlign: "right", borderRight: "1px solid #C2C2C2" }}>
                                            {item?.Rate.toFixed(2)}
                                        </div>
                                        <div style={{ width: "10%", padding: "5px", textAlign: "right" }}>
                                            {item?.Amount.toFixed(2)}
                                        </div>
                                    </div>
                                )

                            ))}


                            {/* Total Row */} {console.log("eeee", e)}
                            <div style={{ display: "flex", fontSize: "13px" }}>
                                <div style={{ width: "60%", padding: "5px", fontWeight: "bold", borderRight: "1px solid #C2C2C2" }}>
                                    Total
                                </div>
                                <div style={{ width: "10%", padding: "5px", textAlign: "right", fontWeight: "bold", borderRight: "1px solid #C2C2C2" }}>
                                    {e?.ItemId == 5 || e?.ItemId == 1 ? e?.total?.totalCtw?.toFixed(3) : e?.total?.totalpcs}
                                </div>
                                <div style={{ width: "10%", padding: "5px", textAlign: "right", fontWeight: "bold", borderRight: "1px solid #C2C2C2" }}>

                                    {e?.ItemId == 5 || e?.ItemId == 1 ? e?.total?.totalPureWt?.toFixed(3) : e?.total?.totalCtw?.toFixed(3)}
                                </div>

                                <div style={{ width: "10%", padding: "5px", borderRight: "1px solid #C2C2C2" }}>

                                </div>
                                <div style={{ width: "10%", padding: "5px", textAlign: "right", fontWeight: "bold" }}>
                                    {e?.total?.totalAmount.toFixed(2)}
                                </div>
                            </div>

                        </div>

                    ))}


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
