// http://localhost:3001/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=U0syMTA0MjAyNA==&evn=c2FsZQ==&pnm=cGFja2luZyBsaXN0IGsx&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=PackingList3&pid=undefined&etp=ZXhjZWw=
import React from "react";
import "../../assets/css/prints/memoexcel1.css";
import { useState } from "react";
import { useEffect } from "react";
import {
    apiCall,
    checkMsg,
    fixedValues,
    formatAmount,
    handleImageError,
    handlePrint,
    isObjectEmpty,
    numberToWord,
} from "../../GlobalFunctions";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import Loader from "../../components/Loader";
import { ToWords } from "to-words";
import ReactHTMLTableToExcel from 'react-html-table-to-excel';

const PackingListExcelK1 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
    const toWords = new ToWords();
    const [result, setResult] = useState(null);
    console.log("TCL: result", result)
    const [categoryNameWise, setCategoryNameWise] = useState([]);
    const [msg, setMsg] = useState("");
    const [loader, setLoader] = useState(true);
    const [documentDetail, setDocumentDetail] = useState([]);
    const [weightTotals, setWeightTotals] = useState({ labGrown: 0, other: 0 });

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function loadData(data) {
        let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
        data.BillPrint_Json[0].address = address;

        const datas = OrganizeDataPrint(
            data?.BillPrint_Json[0],
            data?.BillPrint_Json1,
            data?.BillPrint_Json2
        );



        const totalsDiaWt = data?.BillPrint_Json2?.reduce((acc, item) => {
            // Only process if StoneTypeid is 1
            if (item?.MasterManagement_DiamondStoneTypeid === 1) {
                if (item.MaterialTypeName === "LabGrown") {
                    acc.labGrown += (item.Wt || 0);
                } else {
                    acc.other += (item.Wt || 0);
                }
            }
            return acc;
        }, { labGrown: 0, other: 0 }) || { labGrown: 0, other: 0 };

        setWeightTotals(totalsDiaWt);




        const docsString = data?.BillPrint_Json[0]?.DocumentDetail;
        const docArr = docsString?.split("#@#");
        const documentDetail = docArr?.map(doc => {
            const [key, value] = doc.split("#-#");
            return { key, value };
        });
        setDocumentDetail(documentDetail);

        let cateWise = [];
        datas?.resultArray?.forEach(e => {
            let findRecord = cateWise?.findIndex((el) => el?.Categoryname === e?.Categoryname);
            if (findRecord === -1) {
                cateWise.push(e);
            } else {
                cateWise[findRecord].Quantity += e?.Quantity;
            }
        });

        let overallDiaWtSum = 0;

        datas?.resultArray?.forEach((el) => {
            let dia = [];
            let maxDwt = 0;
            let diamondTotalWt = 0;
            let colorStoneTotalWt = 0;
            let QualityNameMax = "";
            let ColornameMax = "";
            let diacls = [];

            el?.diamonds?.forEach((a) => {
                diacls.push(a)
                let findrecord = dia?.findIndex((ele) =>
                    ele?.ShapeName === a?.ShapeName &&
                    ele?.QualityName === a?.QualityName &&
                    ele?.Colorname === a?.Colorname &&
                    ele?.Rate === a?.Rate
                );

                if (findrecord === -1) {
                    let obj = { ...a };
                    obj.dwt = a?.Wt;
                    obj.dpcs = a?.Pcs;
                    obj.damt = a?.Amount;
                    dia.push(obj);
                } else {
                    dia[findrecord].dwt += a?.Wt;
                    dia[findrecord].dpcs += a?.Pcs;
                    dia[findrecord].damt += a?.Amount;
                }

                diamondTotalWt += a?.Wt || 0;

                if (a?.Wt > maxDwt) {
                    maxDwt = a?.Wt;
                    QualityNameMax = a?.QualityName || "";
                    ColornameMax = a?.Colorname || "";
                }
            });

            el?.colorstone?.forEach((stone) => {
                diacls.push(stone)
                colorStoneTotalWt += stone?.Wt || 0;
            });

            el.diacls = diacls;

            el.colorStoneTotalWt = colorStoneTotalWt;
            el.diamondTotalWt = diamondTotalWt;
            overallDiaWtSum += diamondTotalWt;

            dia.sort((a, b) => a?.QualityName?.localeCompare(b?.QualityName));
            el.diamonds = dia;

            el.maxDwt = maxDwt;
            el.QualityNameMax = QualityNameMax;
            el.ColornameMax = ColornameMax;
        });

        datas?.resultArray?.forEach((el) => {
            el.diaWtSum = overallDiaWtSum;
        });



        // ✅ Grouping by MetalPurity
        let metalPurityWiseData = [];
        datas?.resultArray?.forEach((el) => {
            let key = el?.MetalPurity;
            let findIndex = metalPurityWiseData.findIndex(item => item.MetalPurity === key);
            if (findIndex === -1) {
                metalPurityWiseData.push({
                    MetalPurity: key,
                    MetalType: el?.MetalType,
                    totalMetalpuritywt: el?.NetWt || el?.GrossWt || 0,
                    totalPcs: 1,
                    totalDiamondWt: el?.diamondTotalWt || 0,
                    totalColorStoneWt: el?.colorStoneTotalWt || 0,
                    descriptionofGoods: `${el?.MetalPurity || ""} ${el?.MetalType || ""}`
                });
            } else {
                metalPurityWiseData[findIndex].totalMetalpuritywt += el?.NetWt || el?.GrossWt || 0;
                metalPurityWiseData[findIndex].totalPcs += 1;
                metalPurityWiseData[findIndex].totalDiamondWt += el?.diamondTotalWt || 0;
                metalPurityWiseData[findIndex].totalColorStoneWt += el?.colorStoneTotalWt || 0;
            }
        });

        datas.resultArray.sort((a, b) => {
            const designNoA = parseInt(a?.id?.toString()?.match(/\d+/)[0]);
            const designNoB = parseInt(b?.id?.toString()?.match(/\d+/)[0]);
            return designNoA - designNoB;
        });

        // ✅ Set to datas.maintotal
        datas.mainCusTotal = {
            ...datas.maintotal,
            metalPurityWiseData
        };

        setCategoryNameWise(cateWise);
        setResult(datas);
    }




    console.log('result: ', result);

    if (result) {
        setTimeout(() => {
            const button = document.getElementById('test-table-xls-button');
            button.click();
        }, 500);
    }




    return (
        <>
            {loader ? (
                <Loader />
            ) : (
                <>
                    {msg === "" ? (
                        <>
                            <div className="container max_width_container pad_60_allPrint mt-4 d-none">
                                <ReactHTMLTableToExcel
                                    id="test-table-xls-button"
                                    className="download-table-xls-button btn btn-success text-black bg-success px-2 py-1 fs-5"
                                    table="table-to-xls"
                                    filename={`MemoExcel1${result?.header?.InvoiceNo}_${Date.now()}`}
                                    sheet={`MemoExcel1${result?.header?.InvoiceNo}`}
                                    buttonText="Download as XLS"
                                />
                                <table className="custom-jewelry-table table-container" id="table-to-xls" style={{ borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '12%', border: '1px solid black' }}>PO_NO</th>
                                            <th style={{ width: '8%', border: '1px solid black' }}>TAGNO</th>
                                            <th style={{ width: '10%', border: '1px solid black' }}>OLD_VARIANT</th>
                                            <th style={{ width: '10%', border: '1px solid black' }}>ITEM</th>
                                            <th style={{ width: '20%', border: '1px solid black' }}>DETAIL</th>
                                            <th style={{ width: '5%', border: '1px solid black' }}>QNTY</th>
                                            <th style={{ width: '5%', border: '1px solid black' }}>WT</th>
                                            <th style={{ width: '17%', border: '1px solid black' }}>M DETAIL</th>
                                            <th style={{ width: '5%', border: '1px solid black' }}>M QNTY</th>
                                            <th style={{ width: '3%', border: '1px solid black' }}>M WT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result?.resultArray?.map((item, idx) => {
                                            const details = [
                                                { DETAIL: `'${item?.lineid}`, QNTY: item?.BulkPurchaseQTY, WT: item?.grosswt?.toFixed(2)  },
                                                { DETAIL: `${item?.MetalPurity} ${item?.MetalColor ?"-":""} ${item?.MetalColor}`, QNTY: 0, WT: item?.NetWt?.toFixed(2)  },
                                                ...(item?.diacls || []).map(dia => ({
                                                    DETAIL: (dia?.MasterManagement_DiamondStoneTypeid === 1 ? "D " : "C ") +
                                                        (dia?.ShapeName || "") + "-" +
                                                        (dia?.QualityName || "") + "-" +
                                                        (dia?.Colorname || "") + "-" +
                                                        (dia?.SizeName === "Custom" ? "C:" + (dia?.CustomSize || "") : (dia?.SizeName || "")),
                                                    QNTY: dia?.Pcs,
                                                    WT: dia?.Wt?.toFixed(3) 
                                                }))
                                            ];

                                            const misc = (item?.misc || []).map(dia => ({
                                                DETAIL: "M " + (dia?.ShapeName || "") + "-" + (dia?.QualityName || "") + "-" + (dia?.Colorname || "") + "-" + (dia?.SizeName === "Custom" ? "C:" + (dia?.CustomSize || "") : (dia?.SizeName || "")),
                                                QNTY: dia?.Pcs,
                                                WT: dia?.Wt
                                            }));

                                            const totalDetails = Math.max(details.length, misc.length, 1);
                                            const hasMiscData = misc.length > 0;
                                            const leftoverMiscRows = totalDetails - misc.length;

                                            return (
                                                <React.Fragment key={item.id || idx}>
                                                    {Array.from({ length: totalDetails }).map((_, dIdx) => {
                                                        const currentDetail = details[dIdx];
                                                        const currentMisc = misc[dIdx];
                                                        const isLastRowOfGroup = dIdx === totalDetails - 1;

                                                        const cellStyle = {
                                                            borderLeft: '1px solid #bfbfbf',
                                                            borderRight: '1px solid #bfbfbf',
                                                            borderTop: '1px solid #bfbfbf',
                                                            borderBottom:   '1px solid #bfbfbf',
                                                            padding: '6px 8px',
                                                            verticalAlign: 'middle'
                                                        };

                                                        return (
                                                            <tr key={dIdx}>
                                                                {/* --- LEFT OUTER MERGED COLUMNS --- */}
                                                                {dIdx === 0 && (
                                                                    <>
                                                                        <td rowSpan={totalDetails} style={cellStyle}>{item?.PO}</td>
                                                                        <td rowSpan={totalDetails} style={cellStyle}>{`'${item?.SrJobno}` }</td>
                                                                        <td rowSpan={totalDetails} style={cellStyle}>{item?.designno}</td>
                                                                        <td rowSpan={totalDetails} style={cellStyle}>{item?.Categoryname}</td>
                                                                    </>
                                                                )}

                                                                {/* --- CENTRAL DETAIL SUB-ROWS --- */}
                                                                <td style={cellStyle}>{currentDetail?.DETAIL || ""}</td>
                                                                <td style={{ ...cellStyle, textAlign: 'right' }}>{currentDetail?.QNTY !== undefined ? currentDetail.QNTY : ""}</td>
                                                                <td style={{ ...cellStyle, textAlign: 'right' }}>{currentDetail?.WT !== undefined ? currentDetail.WT : ""}</td>

                                                                {/* --- DYNAMIC MISC COLUMNS HANDLING --- */}
                                                                {hasMiscData ? (
                                                                    <>
                                                                        {/* 1. Render actual misc sub-rows while data exists */}
                                                                        {dIdx < misc.length && (
                                                                            <>
                                                                                <td style={cellStyle}>{currentMisc?.DETAIL || ""}</td>
                                                                                <td style={{ ...cellStyle, textAlign: 'right' }}>{currentMisc?.QNTY !== undefined ? currentMisc.QNTY : ""}</td>
                                                                                <td style={{ ...cellStyle, textAlign: 'right' }}>{currentMisc?.WT !== undefined ? currentMisc.WT : ""}</td>
                                                                            </>
                                                                        )}
                                                                        {/* 2. Merge all remaining empty spaces beneath the misc rows into a single clean cell block */}
                                                                        {dIdx === misc.length && leftoverMiscRows > 0 && (
                                                                            <>
                                                                                <td rowSpan={leftoverMiscRows} style={cellStyle}></td>
                                                                                <td rowSpan={leftoverMiscRows} style={cellStyle}></td>
                                                                                <td rowSpan={leftoverMiscRows} style={cellStyle}></td>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    /* Case where there is NO misc data whatsoever - clear 1 clean block */
                                                                    dIdx === 0 && (
                                                                        <>
                                                                            <td rowSpan={totalDetails} style={cellStyle}></td>
                                                                            <td rowSpan={totalDetails} style={cellStyle}></td>
                                                                            <td rowSpan={totalDetails} style={cellStyle}></td>
                                                                        </>
                                                                    )
                                                                )}

                                                              
                                                            </tr>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto fsh2_s2">
                            {msg}
                        </p>
                    )}
                </>
            )}
        </>
    );
};

export default PackingListExcelK1;
