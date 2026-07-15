

// http://localhost:3001/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=c2t1LzExODEvMjAyNQ==&evn=b3JkZXJz&pnm=U2FsZSBPcmRlcg==&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=SaleOrder&pid=undefined
import React, { useEffect, useState } from "react";
import   "../../assets/css/prints/DesignPrint.css";
import {
    FooterComponent,
    HeaderComponent,
    NumberWithCommas,
    apiCall,
    checkMsg,
    fixedValues,
    handleImageError,
    handlePrint,
    isObjectEmpty,
    taxGenrator,
    taxGenrator2,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
 

const SaleOrder = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
    const [loader, setLoader] = useState(true);
    const [msg, setMsg] = useState("");
    const [data, setData] = useState([]);
    const [header, setHeader] = useState(null);
    const [footer, setFooter] = useState(null);
    const [headerData, setHeaderData] = useState({});
    const [summary, setSummary] = useState([]);
    const [summary2, setSummary2] = useState([]);
    const [total, setTotal] = useState({
        TotalAmount: 0,
        afterTax: 0,
        grandTotal: 0,
        UnitCost: 0,
        Quantity: 0,
    });
    const [isImageWorking, setIsImageWorking] = useState(true);
    const handleImageErrors = () => {
        setIsImageWorking(false);
    };
    const [tax, settax] = useState([]);
    const [address, setAddress] = useState([]);
    const [evns, setEvns] = useState(atob(evn).toLowerCase());
    const [logoStyle, setlogoStyle] = useState({
        maxWidth: "120px",
        maxHeight: "95px",
        minHeight: "95px",
    });

    const loadData = (data) => {
        let head = HeaderComponent("1", data?.BillPrint_Json[0]);
        setHeader(head);
        setHeaderData(data?.BillPrint_Json[0]);
        let subhead = FooterComponent("2", data?.BillPrint_Json[0]);
        setFooter(subhead);
        let resultArr = [];
        let summaryArr = [];
        let summary2Arr = [];
        let totals = { ...total };
        data?.BillPrint_Json1.forEach((e, i) => {
            let diamondWt = 0;
            let colorStoneWt = 0;
            let miscWt = 0;
            totals.Quantity += e?.Quantity;
            let findGold24Kt = summaryArr.findIndex(
                (ele) => ele?.label === "GOLD IN 24KT"
            );
            if (findGold24Kt === -1) {
                summaryArr.push({
                    label: "GOLD IN 24KT",
                    value: e?.convertednetwt * e?.Quantity,
                    id: 1,
                    suffix: " gm",
                    name: "GOLD IN 24KT",
                });
            } else {
                summaryArr[findGold24Kt].value += e?.convertednetwt * e?.Quantity;
            }

            let findGross = summaryArr.findIndex(
                (ele, ind) => ele?.label === "Gross Wt"
            );
            if (findGross === -1) {
                summaryArr.push({
                    label: "Gross Wt",
                    value: e?.grosswt * e?.Quantity,
                    id: 2,
                    suffix: " gm",
                    name: "Gross Wt",
                });
            } else {
                summaryArr[findGross].value += e?.grosswt * e?.Quantity;
            }

            let netWt = summaryArr.findIndex((ele, ind) => ele?.label === "NET WT");
            if (netWt === -1) {
                summaryArr.push({
                    label: "NET WT",
                    value: e?.NetWt * e?.Quantity,
                    id: 4,
                    suffix: " gm",
                    name: "NET WT",
                });
            } else {
                summaryArr[netWt].value += e?.NetWt * e?.Quantity;
            }

            let findLabour = summaryArr.findIndex(
                (ele, ind) => ele?.label === "Labour"
            );
            if (findLabour === -1) {
                summaryArr.push({
                    label: "Labour",
                    value: 0,
                    id: 7,
                    suffix: "",
                    name: "Labour",
                    amount: e?.MakingAmount,
                });

            } else {
                summaryArr[findLabour].amount += e?.MakingAmount;
            }

            let labourAmount = summary2Arr.findIndex(
                (ele) => ele?.label === "LABOUR"
            );
            if (labourAmount === -1) {
                summary2Arr.push({
                    label: "LABOUR",
                    value: 0,
                    id: 5,
                    suffix: "",
                    name: "LABOUR",
                    amount: e?.MakingAmount * e?.Quantity,
                });
            } else {
                summary2Arr[labourAmount].amount += e?.MakingAmount * e?.Quantity;
            }
            // pending setting amount add in labour

            let otherAmount = summary2Arr.findIndex((ele) => ele?.label === "OTHER");
            if (otherAmount === -1) {
                summary2Arr.push({
                    label: "OTHER",
                    value: 0,
                    id: 6,
                    suffix: "",
                    name: "OTHER",
                    amount: (e?.OtherCharges + e?.TotalDiamondHandling) * e?.Quantity,
                });
            } else {
                summary2Arr[otherAmount].amount +=
                    (e?.OtherCharges + e?.TotalDiamondHandling) * e?.Quantity;
            }

            data?.BillPrint_Json2.forEach((ele, index) => {
                if (ele?.StockBarcode === e?.SrJobno) {
                    let findlabo = summary2Arr.findIndex(
                        (ele) => ele?.label === "LABOUR"
                    );
                    if (findlabo !== -1) {
                        summary2Arr[findlabo].amount += ele?.SettingAmount * e?.Quantity;
                    }
                    let findMaterial = summaryArr.findIndex(
                        (elem, index) =>
                            elem?.label === ele?.MasterManagement_DiamondStoneTypeName &&
                            ele?.MasterManagement_DiamondStoneTypeid !== 5
                    );
                    if (findMaterial !== -1) {
                        summaryArr[findMaterial].value += ele?.Wt * e?.Quantity;
                        summaryArr[findMaterial].amount += ele?.Amount * e?.Quantity;
                        summaryArr[findMaterial].Pcs += ele?.Pcs * e?.Quantity;
                    }
                    if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
                        diamondWt += ele?.Wt;
                        if (findMaterial === -1) {
                            summaryArr.push({
                                label: "DIAMOND",
                                value: ele?.Wt * e?.Quantity,
                                id: 5,
                                suffix: " Cts",
                                name: "Dia Wt",
                                amount: ele?.Amount * e?.Quantity,
                                Pcs: ele?.Pcs * e?.Quantity,
                            });
                        }

                        let diaAmount = summary2Arr.findIndex(
                            (ele) => ele?.label === "DIAMOND"
                        );
                        if (diaAmount === -1) {
                            summary2Arr.push({
                                label: "DIAMOND",
                                value: 0,
                                id: 2,
                                suffix: "",
                                name: "DIAMOND",
                                amount: ele?.Amount * e?.Quantity,
                                Pcs: ele?.Pcs,
                            });
                        } else {
                            summary2Arr[diaAmount].amount += ele?.Amount * e?.Quantity;
                            summary2Arr[diaAmount].Pcs += ele?.Pcs;
                        }
                    } else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
                        colorStoneWt += ele?.Wt;
                        if (findMaterial === -1) {
                            summaryArr.push({
                                label: "COLOR STONE",
                                value: ele?.Wt * e?.Quantity,
                                id: 6,
                                suffix: " Cts",
                                name: "Cs Wt",
                                amount: ele?.Amount * e?.Quantity,
                                Pcs: ele?.Pcs * e?.Quantity,
                            });
                        }

                        let cstAmount = summary2Arr.findIndex(
                            (ele) => ele?.label === "CST"
                        );
                        if (cstAmount === -1) {
                            summary2Arr.push({
                                label: "CST",
                                value: 0,
                                id: 3,
                                suffix: "",
                                name: "CST",
                                amount: ele?.Amount * e?.Quantity,
                                Pcs: ele?.Pcs,
                            });
                        } else {
                            summary2Arr[cstAmount].amount += ele?.Amount * e?.Quantity;
                            summary2Arr[cstAmount].Pcs += ele?.Pcs;
                        }
                    } else if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
                        miscWt += ele?.Wt;
                        if (findMaterial === -1) {
                            summaryArr.push({
                                label: "MISC",
                                value: ele?.Wt * e?.Quantity,
                                id: 7,
                                suffix: " gms",
                                name: "Misc Wt",
                                amount: ele?.Amount * e?.Quantity,
                                Pcs: ele?.Pcs * e?.Quantity,
                            });
                        }

                        let miscAmount = summary2Arr.findIndex(
                            (ele) => ele?.label === "MISC"
                        );
                        if (miscAmount === -1) {
                            summary2Arr.push({
                                label: "MISC",
                                value: 0,
                                id: 4,
                                suffix: "",
                                name: "MISC",
                                amount: ele?.Amount * e?.Quantity,
                            });
                        } else {
                            summary2Arr[miscAmount].amount += ele?.Amount * e?.Quantity;
                        }
                    } else if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
                        let goldAmount = summary2Arr.findIndex(
                            (ele) => ele?.label === "GOLD"
                        );
                        if (goldAmount === -1) {
                            summary2Arr.push({
                                label: "GOLD",
                                value: 0,
                                id: 1,
                                suffix: "",
                                name: "GOLD",
                                amount: ele?.Amount * e?.Quantity,
                            });
                        } else {
                            summary2Arr[goldAmount].amount += ele?.Amount * e?.Quantity;
                        }
                    } else if (ele?.MasterManagement_DiamondStoneTypeid === 5) {
                        let goldAmount = summary2Arr.findIndex(
                            (ele) => ele?.label === "GOLD"
                        );
                        if (goldAmount === -1) {
                            summary2Arr.push({
                                label: "GOLD",
                                value: 0,
                                id: 1,
                                suffix: "",
                                name: "GOLD",
                                amount: ele?.Amount * e?.Quantity,
                            });
                        } else {
                            summary2Arr[goldAmount].amount += ele?.Amount * e?.Quantity;
                        }
                    }
                }
            });
            let obj = { ...e };
            obj.TotalAmount = e?.TotalAmount;
            obj.UnitCost = e?.UnitCost / data?.BillPrint_Json[0]?.CurrencyExchRate;
            totals.TotalAmount +=
                obj?.TotalAmount / data?.BillPrint_Json[0]?.CurrencyExchRate;
            totals.UnitCost += obj?.UnitCost / obj.Quantity;
            obj.diamondWt = diamondWt;
            obj.colorStoneWt = colorStoneWt;
            obj.miscWt = miscWt;
            resultArr.push(obj);
        });

        // let mdWtt = summaryArr.findIndex((ele, ind) => ele?.label === "(M+D) WT");
        // if (mdWtt === -1) {
        //   summaryArr.push({
        //     label: "(M+D) WT",
        //     value: 0,
        //     id: 1,
        //     suffix: " gm",
        //     name: "(M+D) WT",
        //   });
        // } else {
        //   if (findDiamond !== -1) {
        //     summaryArr[mdWtt].value += summaryArr[findDiamond].value / 5;
        //   }
        // }

        let findDiamond = summaryArr.findIndex(
            (elem, index) => elem?.label === "DIAMOND"
        );
        let findNetWt = summaryArr.findIndex((ele, ind) => ele?.label === "NET WT");
        if (findNetWt !== -1) {
            summaryArr.push({
                label: "(M+D) WT",
                value:
                    (findDiamond !== -1
                        ? +fixedValues(summaryArr[findDiamond]?.value, 3) / 5
                        : 0) + summaryArr[findNetWt]?.value,
                id: 3,
                suffix: " gm",
                name: "(M+D) WT",
            });
        }
        summaryArr.sort((a, b) => {
            return a.id - b.id;
        });

        let taxValue = taxGenrator2(data?.BillPrint_Json[0], totals?.TotalAmount);
        settax(taxValue);
        totals.afterTax =
            taxValue.reduce((acc, cobj) => {
                return acc + +cobj?.amount;
            }, 0) + totals?.TotalAmount;
        totals.grandTotal = totals.afterTax + data?.BillPrint_Json[0]?.AddLess;

        setTotal(totals);
        setData(resultArr);

        summary2Arr.sort((a, b) => {
            return a.id - b.id;
        });

        setSummary2(summary2Arr);
        setSummary(summaryArr);

        let adr = data?.BillPrint_Json[0]?.Printlable.split("\n");
        setAddress(adr);
    };

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

    const [checkBox, setCheckBox] = useState({
        amount: false,
        summury: false,
    });

    const handleChange = (e) => {
        const { name, checked } = e?.target;
        setCheckBox({ ...checkBox, [name]: checked });
    };

    // console.log(headerData);
    // console.log("data", data);


    return loader ? (
        <Loader />
    ) : msg === "" ? (
        <div>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: "40px",
                }}
                onClick={(e) => handlePrint(e)}
                className="print-btn"
            >
                <div></div>

                <img
                    alt="print"
                    src="http://nzen/lib/jo/28/images/print_icon.png"
                    title="Print"
                    style={{
                        cursor: "pointer",
                        height: "35px",
                    }}
                />
            </div>

            {data.map((e, i) => {
                return (

                    <div
                        id="divprint"
                        className="design-print"
                    >
                        <div
                            id="gradient-style"
                            style={{
                                width: "820px",
                                color: "#909090",
                                fontSize: "15px",
                                textAlign: "left",
                            }}
                        >


                            {/* Main Content */}
                            <div
                                id="divcontant"
                                style={{
                                    padding: "6px",
                                    fontFamily: "Calibri",
                                    fontSize: "14px",
                                    lineHeight: "14px",
                                    WebkitPrintColorAdjust: "exact",
                                    MozPrintColorAdjust: "exact",
                                }}
                            >
                                <div
                                    className="OrderDesign"
                                    style={{
                                        width: "230mm",
                                        minHeight: "290mm",
                                        margin: "0 auto",
                                        borderRadius: "5px",
                                    }}
                                >
                                    {/* ORDER DETAILS HEADER */}
                                    <div
                                        style={{
                                            width: "210mm",
                                            height: "32px",
                                            background: "#A6A6A6",
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            paddingLeft: "8px",
                                            fontSize: "20px",
                                            fontFamily: "Calibri",
                                            marginTop: "47px",
                                            marginLeft: "47px",
                                            border: "1px solid #c7c6c6",
                                        }}
                                    >
                                        ORDER DETAILS
                                    </div>

                                    {/* COMPANY DETAILS */}
                                    <div
                                        style={{
                                            width: "210mm",
                                            minHeight: "145px",
                                            border: "1px solid #c7c6c6",
                                            marginLeft: "47px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "20px",
                                            position: "relative",
                                            color: "black"
                                        }}
                                    >
                                        <div style={{ lineHeight: 2 }}>
                                            <b>{headerData?.customerfirmname}</b>
                                            <br />
                                            {headerData?.customerAddress1}
                                            <br />
                                            {headerData?.customerAddress2}
                                            <br />
                                            {headerData?.customerAddress3}
                                            <br />
                                            {headerData?.customermobileno1}
                                        </div>

                                        <div
                                            style={{
                                                border: "1px solid #cac7c7",
                                                padding: "10px",
                                                lineHeight: 2,
                                                height: "fit-content",
                                            }}
                                        >
                                            Po. Request No : <b></b>
                                            <br />
                                            Order Date : <b>{headerData?.EntryDate}</b>
                                            <br />
                                            Delivery Date : <b>{headerData?.DueDate}</b>
                                        </div>
                                    </div>

                                    {/* DESCRIPTION HEADER */}
                                    <div
                                        style={{
                                            width: "210mm",
                                            marginLeft: "47px",
                                            display: "flex",
                                            color: "black"
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "105mm",
                                                height: "32px",
                                                border: "1px solid #c7c6c6",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: "bold",
                                                fontSize: "14px",
                                            }}
                                        >
                                            Description
                                        </div>

                                        <div
                                            style={{
                                                width: "105mm",
                                                height: "32px",
                                                border: "1px solid #c7c6c6",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: "bold",
                                                fontSize: "14px",
                                            }}
                                        >
                                            Remark
                                        </div>
                                    </div>

                                    {/* DESCRIPTION CONTENT */}
                                    <div
                                        style={{
                                            width: "210mm",
                                            marginLeft: "47px",
                                            display: "flex",
                                            color: "black"
                                        }}
                                    >
                                        {/* LEFT SIDE */}
                                        <div
                                            style={{
                                                width: "105mm",
                                                minHeight: "75px",
                                                border: "1px solid #c7c6c6",
                                                padding: "10px",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                lineHeight: 2,
                                                fontSize: "12px",
                                                fontFamily: "Calibri",
                                            }}
                                        >
                                            <div>
                                                <div>
                                                    Design# : <b>{e?.designno}</b>
                                                </div>

                                                <div>
                                                    Job# : <b>{e?.J_JobNo}</b>
                                                </div>

                                                <div>
                                                    QTY : <b>{e?.Quantity}</b>
                                                </div>
                                            </div>

                                            <div>
                                                <div>
                                                    Metal Type : <b>{e?.MetalTypePurity}</b>
                                                </div>

                                                <div>
                                                    Metal Wt : <b>{e?.grosswt}</b>
                                                </div>

                                                <div>
                                                    Size : <b>{e?.Size}</b>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT SIDE */}
                                        <div
                                            style={{
                                                width: "105mm",
                                                minHeight: "75px",
                                                border: "1px solid #c7c6c6",
                                                padding: "10px",
                                                lineHeight: 2,
                                                fontSize: "12px",
                                                fontFamily: "Calibri",
                                            }}
                                        >
                                            {e?.JobRemark}

                                        </div>
                                    </div>

                                    {/* IMAGE SECTION */}
                                    <div
                                        style={{
                                            width: "210mm",
                                            height: "820px",
                                            marginLeft: "47px",
                                            border: "1px solid #c7c6c6",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            color: "#A6A6A6",
                                        }}
                                    >
                                        <img
                                            src={e?.DesignImage}
                                            onError={handleImageError}
                                            alt="design"
                                            style={{
                                                width: "200mm",
                                                height: "200mm",
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

        </div>
    ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
            {msg}
        </p>
    );
};

export default SaleOrder;

