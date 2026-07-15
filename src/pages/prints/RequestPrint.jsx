

// http://localhost:3001/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=c2t1LzExODEvMjAyNQ==&evn=b3JkZXJz&pnm=U2FsZSBPcmRlcg==&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=SaleOrder&pid=undefined
import React, { useEffect, useState } from "react";
import "../../assets/css/prints/DesignPrint.css";
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
    const [json2, setJson2] = useState([]);
    const [summary, setSummary] = useState([]);
    const [summary2, setSummary2] = useState([]);
    const [diamondFlag, setDiamondFlag] = useState(true);
    const [colorStoneFlag, setColorStoneFlag] = useState(true);
    const [miscFlag, setMiscFlag] = useState(true);
    const [metalFlag, setMetalFlag] = useState(true);

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
        setJson2(data?.BillPrint_Json2);
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

    //   const groupedData = json2.reduce((acc, item) => {
    //     const key = item.MasterManagement_DiamondStoneTypeName;

    //     if (!acc[key]) {
    //       acc[key] = {
    //         typeId: key,
    //         typeName: item.MasterManagement_DiamondStoneTypeName,
    //         data: [],
    //         totalPcs: 0,
    //         totalWt: 0,
    //       };
    //     }

    //     acc[key].data.push(item);

    //     acc[key].totalPcs += Number(item.Pcs || 0);
    //     acc[key].totalWt += Number(item.Wt || 0);

    //     return acc;
    //   }, {});

    const handleDiaFlag = (e) => {
        diamondFlag ? setDiamondFlag(false) : setDiamondFlag(true);
    };

    const handleColorStoneFlag = (e) => {
        colorStoneFlag ? setColorStoneFlag(false) : setColorStoneFlag(true);
    };

    const handleMiscFlag = (e) => {
        miscFlag ? setMiscFlag(false) : setMiscFlag(true);
    };

    const handleMetalFlag = (e) => {
        metalFlag ? setMetalFlag(false) : setMetalFlag(true);
    };


    const groupedData = json2?.reduce((acc, item) => {
        const typeKey = item.MasterManagement_DiamondStoneTypeName;

        if (!acc[typeKey]) {
            acc[typeKey] = {
                typeId: typeKey,
                typeName: item.MasterManagement_DiamondStoneTypeName,
                data: [],
                totalPcs: 0,
                totalWt: 0,
            };
        }

        // TOTAL
        acc[typeKey].totalPcs += Number(item.Pcs || 0);
        acc[typeKey].totalWt += Number(item.Wt || 0);

        if(item.MasterManagement_DiamondStoneTypeName ==="COLOR STONE"){
            item.MasterManagement_DiamondStoneTypeName="COLOR_STONE"
        }

        // METAL MERGE LOGIC
        if (item.MasterManagement_DiamondStoneTypeName === "METAL") {
            const existingMetal = acc[typeKey].data.find(
                (x) =>
                    x.QualityName === item.QualityName &&
                    x.ShapeName === item.ShapeName
            );

            if (existingMetal) {
                existingMetal.Wt += Number(item.Wt || 0);
                existingMetal.RMwt += Number(item.RMwt || 0);
                existingMetal.Amount += Number(item.Amount || 0);
            } else {
                acc[typeKey].data.push({
                    ...item,
                    Wt: Number(item.Wt || 0),
                    RMwt: Number(item.RMwt || 0),
                    Amount: Number(item.Amount || 0),
                });
            }
        } else {
            // OTHER MATERIAL DIRECT PUSH
            acc[typeKey].data.push(item);
        }

        return acc;
    }, {});


    console.log("TCL: groupedData", groupedData)


    return loader ? (
        <Loader />
    ) : msg === "" ? (
        <div
            id="divprint"
           

            className="RequestPrint"
        >
            {/* TOP ACTION BAR */}
            <div
                style={{
                    width: "880px",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginBottom: "10px",
                }}
            >
                <img
                    src="http://nzen/lib/jo/28/images/print_icon.png"
                    alt="print"
                    style={{ height: "35px", cursor: "pointer" }}
                    onClick={(e) => handlePrint(e)}
                    className="print-dis-none"
                />

               
            </div>

            {/* FILTER BAR */}
            <div
                style={{
                    width: "880px",
                    border: "1px solid #E0E0E0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px",
                    background: "#F5F5F5",
                    flexWrap: "wrap",
                    gap: "10px",
                }}
                 className="print-dis-none"
            >
                <div
                    style={{
                        fontWeight: "bold",
                        textTransform: "uppercase",
                    }}
                >
                    Order Info
                </div>

                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                    {groupedData?.DIAMOND?.data?.length > 0 && (
                        <label> 
                            <input type="checkbox" onChange={handleDiaFlag} defaultChecked /> Diamonds
                        </label>
                        
                    )}

                    {groupedData?.METAL?.data?.length > 0 && (
                        <label> 
                            <input type="checkbox" onChange={handleMetalFlag} defaultChecked /> Metal
                        </label>
                        
                    )}

                    {groupedData?.COLOR_STONE?.data?.length > 0 && (
                        <label> 
                            <input type="checkbox" onChange={handleColorStoneFlag} defaultChecked /> Color Stone
                        </label>
                        
                    )}

                    {groupedData?.MISC?.data?.length > 0 && (
                        <label> 
                            <input type="checkbox" onChange={handleMiscFlag} defaultChecked /> Misc
                        </label>
                        
                    )}

                  
                </div>
            </div>

            {/* TITLE */}
            <div
                style={{
                    width: "880px",
                    background: "#939292",
                    color: "#fff",
                    fontSize: "26px",
                    fontWeight: "bold",
                    padding: "8px",
                    marginTop: "10px",
                    fontFamily: "Calibri",
                }}
            >
                REQUIRED MATERIAL REPORT
            </div>

            {/* COMPANY INFO */}
            <div
                style={{
                    width: "880px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "15px 0",
                    borderBottom: "4px solid #C3C3C3",
                    fontFamily: "Calibri",
                }}
            >
                <div>
                    <div style={{ fontSize: "22px", fontWeight: "bold" }}>
                        {headerData?.CompanyFullName}
                    </div>

                    <div>
                        {headerData?.CompanyAddress}
                    </div>

                    <div> {headerData?.CompanyCity}-{headerData?.CompanyPinCode}, {headerData?.CompanyState} ({headerData?.CompanyCountry})</div>

                    <div>T {headerData?.CompanyTellNo}</div>

                    <div style={{ fontSize: "12px" }}>
                        {headerData?.CompanyEmail} | {headerData?.CompanyWebsite}
                    </div>
                </div>

                <img
                    src={headerData?.PrintLogo}

                    style={{
                        height: "90px",
                    }}
                />
            </div>

            {/* REPORT HEADER */}
            <div
                style={{
                    width: "880px",
                    padding: "15px 0",
                    fontFamily: "Calibri",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                        fontSize: "16px",
                    }}
                >
                    <div>
                        Required Material Report for{" "}
                        <b style={{ fontSize: "22px" }}>{headerData?.Customercode}</b>
                    </div>

                    <div>
                        SKU#: <b> {headerData?.InvoiceNo}</b>
                    </div>

                    <div>
                        Dated: <b> {headerData?.EntryDate}</b>
                    </div>
                </div>
            </div>

            {/* DIAMOND TABLE */}

            {groupedData?.DIAMOND?.data?.length > 0 && diamondFlag && (
                <div
                    style={{
                        width: "880px",
                        border: "1px solid #E0E0E0",
                        marginBottom: "20px",
                        fontFamily: "Calibri",
                    }}
                >
                    {/* HEADER */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(8, 1fr)",
                            background: "#F5F5F5",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                        }}
                    >
                        {[
                            "Item Code",
                            "Type",
                            "Shape",
                            "Quality",
                            "Color",
                            "Size",
                            "Pcs.",
                            "CTW",
                        ].map((item) => (
                            <div
                                key={item}
                                style={{
                                    border: "1px solid #E0E0E0",
                                    padding: "10px",
                                    textAlign: "center",
                                }}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                    {groupedData?.DIAMOND?.data?.map((d, i) => (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(8, 1fr)",
                            }}
                        >
                            {[
                                d?.IsSolGem ===1 ?"SOLITAIRE": "DIAMOND",
                                d?.MaterialTypeName || "",
                                d?.ShapeName || "",
                                d?.QualityName || "",
                                d?.Colorname || "",
                                d?.SizeName || "",
                                d?.Pcs || "",
                                d?.Wt.toFixed(3) || "",
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        border: "1px solid #E0E0E0",
                                        padding: "10px",
                                        textAlign: index >= 6 ? "right" : "left",
                                        minHeight: "40px",
                                    }}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>

                    ))}

                    {/* TOTAL */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(8, 1fr)",
                            fontWeight: "bold",
                        }}
                    >
                        <div
                            style={{
                                gridColumn: "1 / 7",
                                border: "1px solid #E0E0E0",
                                padding: "10px",
                            }}
                        >
                            TOTAL :
                        </div>

                        <div
                            style={{
                                border: "1px solid #E0E0E0",
                                padding: "10px",
                                textAlign: "right",
                            }}
                        >
                            {groupedData?.DIAMOND?.totalPcs || 0}
                        </div>

                        <div
                            style={{
                                border: "1px solid #E0E0E0",
                                padding: "10px",
                                textAlign: "right",
                            }}
                        >
                            {groupedData?.DIAMOND?.totalWt?.toFixed(3) || 0}
                        </div>
                    </div>
                </div>
            )}


            {/* color stone  */}
            {groupedData?.COLOR_STONE?.data?.length > 0 && colorStoneFlag && (
                <div
                    style={{
                        width: "880px",
                        border: "1px solid #E0E0E0",
                        marginBottom: "20px",
                        fontFamily: "Calibri",
                    }}
                >
                    {/* HEADER */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(8, 1fr)",
                            background: "#F5F5F5",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                        }}
                    >
                        {[
                            "Item Code",
                            "Type",
                            "Shape",
                            "Quality",
                            "Color",
                            "Size",
                            "Pcs.",
                            "CTW",
                        ].map((item) => (
                            <div
                                key={item}
                                style={{
                                    border: "1px solid #E0E0E0",
                                    padding: "10px",
                                    textAlign: "center",
                                }}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                    {groupedData?.COLOR_STONE?.data?.map((d, i) => (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(8, 1fr)",
                            }}
                        >
                            {[
                                d?.IsSolGem ===1 ?"GEMSTONE": "COLOR STONE",
                                d?.MaterialTypeName || "",
                                d?.ShapeName || "",
                                d?.QualityName || "",
                                d?.Colorname || "",
                                d?.SizeName || "",
                                d?.Pcs || "",
                                d?.Wt.toFixed(3) || "",
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        border: "1px solid #E0E0E0",
                                        padding: "8px",
                                        textAlign: index >= 6 ? "right" : "left",
                                        minHeight: "40px",
                                    }}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>

                    ))}

                    {/* TOTAL */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(8, 1fr)",
                            fontWeight: "bold",
                        }}
                    >
                        <div
                            style={{
                                gridColumn: "1 / 7",
                                border: "1px solid #E0E0E0",
                                padding: "10px",
                            }}
                        >
                            TOTAL :
                        </div>

                        <div
                            style={{
                                border: "1px solid #E0E0E0",
                                padding: "10px",
                                textAlign: "right",
                            }}
                        >
                            {groupedData?.COLOR_STONE?.totalPcs || 0}
                        </div>

                        <div
                            style={{
                                border: "1px solid #E0E0E0",
                                padding: "10px",
                                textAlign: "right",
                            }}
                        >
                            {groupedData?.COLOR_STONE?.totalWt?.toFixed(3) || 0}
                        </div>
                    </div>
                </div>
            )}

            {/* MISC  */}
            {groupedData?.MISC?.data?.length > 0 && miscFlag && (
                <div
                    style={{
                        width: "880px",
                        border: "1px solid #E0E0E0",
                        marginBottom: "20px",
                        fontFamily: "Calibri",
                    }}
                >
                    {/* HEADER */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(8, 1fr)",
                            background: "#F5F5F5",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                        }}
                    >
                        {[
                            "Item Code",
                            "Type",
                            "Shape",
                            "Quality",
                            "Color",
                            "Size",
                            "Pcs.",
                            "CTW",
                        ].map((item) => (
                            <div
                                key={item}
                                style={{
                                    border: "1px solid #E0E0E0",
                                    padding: "10px",
                                    textAlign: "center",
                                }}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                    {groupedData?.MISC?.data?.map((d, i) => (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(8, 1fr)",
                            }}
                        >
                            {[
                                "MISC",
                                d?.MaterialTypeName || "",
                                d?.ShapeName || "",
                                d?.QualityName || "",
                                d?.Colorname || "",
                                d?.SizeName || "",
                                d?.Pcs || "",
                                d?.Wt.toFixed(3) || "",
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        border: "1px solid #E0E0E0",
                                        padding: "10px",
                                        textAlign: index >= 6 ? "right" : "left",
                                        minHeight: "40px",
                                    }}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>

                    ))}

                    {/* TOTAL */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(8, 1fr)",
                            fontWeight: "bold",
                        }}
                    >
                        <div
                            style={{
                                gridColumn: "1 / 7",
                                border: "1px solid #E0E0E0",
                                padding: "10px",
                            }}
                        >
                            TOTAL :
                        </div>

                        <div
                            style={{
                                border: "1px solid #E0E0E0",
                                padding: "10px",
                                textAlign: "right",
                            }}
                        >
                            {groupedData?.MISC?.totalPcs || 0}
                        </div>

                        <div
                            style={{
                                border: "1px solid #E0E0E0",
                                padding: "10px",
                                textAlign: "right",
                            }}
                        >
                            {groupedData?.MISC?.totalWt?.toFixed(3) || 0}
                        </div>
                    </div>
                </div>
            )}

            {/* METAL TABLE */}
            {groupedData?.METAL?.data?.length > 0 && metalFlag && (
                <div
                    style={{
                        width: "440px",
                        border: "1px solid #E0E0E0",
                        fontFamily: "Calibri",
                    }}
                >
                    {/* HEADER */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            background: "#F5F5F5",
                            fontWeight: "bold",
                        }}
                    >
                        {["ITEM CODE", "Metal Type", "Req.Gm."].map((item) => (
                            <div
                                key={item}
                                style={{
                                    border: "1px solid #E0E0E0",
                                    padding: "10px",
                                    textAlign: "center",
                                }}
                            >
                                {item}
                            </div>
                        ))}
                    </div>






                    {/* ROW */}
                    {groupedData?.METAL?.data?.map((m, i) => (



                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                            }}
                        >
                            <div style={{ border: "1px solid #E0E0E0", padding: "10px" }}>
                                METAL
                            </div>

                            <div style={{ border: "1px solid #E0E0E0", padding: "10px" }}>
                                {m?.ShapeName + " " + m?.QualityName}
                            </div>

                            <div
                                style={{
                                    border: "1px solid #E0E0E0",
                                    padding: "10px",
                                    textAlign: "right",
                                }}
                            >
                                {m?.Wt?.toFixed(3) || 0}
                            </div>
                        </div>
                    ))}


                    {/* TOTAL */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            fontWeight: "bold",
                        }}
                    >
                        <div
                            style={{
                                gridColumn: "1 / 3",
                                border: "1px solid #E0E0E0",
                                padding: "10px",
                            }}
                        >
                            TOTAL :
                        </div>

                        <div
                            style={{
                                border: "1px solid #E0E0E0",
                                padding: "10px",
                                textAlign: "right",
                            }}
                        >
                            {groupedData?.METAL?.totalWt?.toFixed(3) || 0}
                        </div>
                    </div>
                </div>

            )}

        </div>
    ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
            {msg}
        </p>
    );
};

export default SaleOrder;

