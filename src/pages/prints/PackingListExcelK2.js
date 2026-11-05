// http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=U0syMTA0MjAyNA==&evn=c2FsZQ==&pnm=cGFja2luZyBsaXN0IGsy&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=PackingList3&pid=undefined&etp=ZXhjZWw=
import React from "react";
import "../../assets/css/prints/summary2.css";
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

        const docsString = data?.BillPrint_Json[0]?.DocumentDetail;
        const docArr = docsString?.split("#@#");
        const documentDetail = docArr?.map(doc => {
            const [key, value] = doc.split("#-#");
            return { key, value };
        });
        setDocumentDetail(documentDetail);

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
            let labGrownWt = 0;      // NEW
            let naturalDiaWt = 0;    // NEW
            let QualityNameMax = "";
            let ColornameMax = "";

            el?.diamonds?.forEach((a) => {
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

                // NEW: split by material type
                if (a?.MaterialTypeName === "LabGrown") {
                    labGrownWt += a?.Wt || 0;
                } else {
                    naturalDiaWt += a?.Wt || 0;
                }

                if (a?.Wt > maxDwt) {
                    maxDwt = a?.Wt;
                    QualityNameMax = a?.QualityName || "";
                    ColornameMax = a?.Colorname || "";
                }
            });

            el?.colorstone?.forEach((stone) => {
                colorStoneTotalWt += stone?.Wt || 0;
            });

            el.colorStoneTotalWt = colorStoneTotalWt;
            el.diamondTotalWt = diamondTotalWt;
            el.labGrownWt = labGrownWt;        // NEW
            el.naturalDiaWt = naturalDiaWt;    // NEW
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
                    totalNaturalDiaWt: el?.naturalDiaWt || 0,     // NEW
                    totalLabGrownDiaWt: el?.labGrownWt || 0,      // NEW
                    totalColorStoneWt: el?.colorStoneTotalWt || 0,
                    descriptionofGoods: `${el?.MetalPurity || ""} ${el?.MetalType || ""}`
                });
            } else {
                metalPurityWiseData[findIndex].totalMetalpuritywt += el?.NetWt || el?.GrossWt || 0;
                metalPurityWiseData[findIndex].totalPcs += 1;
                metalPurityWiseData[findIndex].totalDiamondWt += el?.diamondTotalWt || 0;
                metalPurityWiseData[findIndex].totalNaturalDiaWt += el?.naturalDiaWt || 0;     // NEW
                metalPurityWiseData[findIndex].totalLabGrownDiaWt += el?.labGrownWt || 0;      // NEW
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

    const cellStyle = {
        textTransform: 'uppercase',
        borderLeft: '1px solid black',
        borderRight: '1px solid black',
        padding: '8px',
    };

    const cellBodyStyle = {
        border: '1px solid black',
        padding: '2px',
        textAlign: 'center',
        verticalAlign: 'bottom',
        textTransform: 'uppercase',
        wordBreak: 'break-word',
        whiteSpace: 'normal',
    }

    const cellMainTotalStyle = {
        border: '1px solid black',
        padding: '2px',
        textAlign: 'center',
        wordBreak: 'break-word',
        whiteSpace: 'normal',
    };


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
                            <div className="container max_width_container pad_60_allPrint mt-4">
                                <ReactHTMLTableToExcel
                                    id="test-table-xls-button"
                                    className="download-table-xls-button btn btn-success text-black bg-success px-2 py-1 fs-5"
                                    table="table-to-xls"
                                    filename={`Packinglist_k2_${result?.header?.InvoiceNo}_${Date.now()}`}
                                    sheet={`Packinglist_k2_${result?.header?.InvoiceNo}`}
                                    buttonText="Download as XLS" />
                                <table id="table-to-xls">
                                    <tbody>
                                        <tr />
                                        <tr>
                                            <td />
                                            <td colSpan={12} style={{ ...cellStyle, textAlign: 'center', borderTop: '1px solid black' }}>
                                                <h3 style={{ margin: 0, textDecoration: 'underline' }}>Temporary Export-Import</h3>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td />
                                            <td colSpan={9} style={{ ...cellStyle, textAlign: 'left', borderRight: 'none !important' }}>
                                            </td>
                                            <td colSpan={3} style={{ ...cellStyle, textAlign: 'left', borderLeft: 'none !important' }}>
                                                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td />
                                            <td colSpan={9} style={{ ...cellStyle, textAlign: 'left', borderRight: 'none !important' }}>
                                            </td>
                                            <td colSpan={3} style={{ ...cellStyle, textAlign: 'left', borderLeft: 'none !important' }}>
                                                Invoice No: {result?.header?.InvoiceNo}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td />
                                            <td colSpan={4} style={{ ...cellStyle, textAlign: 'left', borderRight: 'none !important' }}>
                                                To:
                                            </td>
                                            <td colSpan={8} style={{ ...cellStyle, textAlign: 'left', borderLeft: 'none !important' }}>
                                                {result?.header?.customerstreet}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td />
                                            <td colSpan={7} style={{ ...cellStyle, textAlign: 'left', borderRight: 'none !important' }}>
                                                Contact Person: {result?.header?.CustName}
                                            </td>
                                            <td colSpan={5} style={{ ...cellStyle, textAlign: 'left', borderLeft: 'none !important' }}>
                                                Passport No: {documentDetail?.Passport}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td />
                                            <td colSpan={12} style={{ ...cellStyle, textAlign: 'left' }}>
                                                Mobile No: <span>{result?.header?.customermobileno}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td />
                                            <td colSpan={12} style={{ ...cellStyle, textAlign: 'left' }}>
                                                Delivery: {result?.header?.Delivery_Mode}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td />
                                            <td colSpan={12} style={{ ...cellStyle, textAlign: 'left' }}>
                                                <h4 style={{ margin: 0 }}>List of Items:</h4>
                                            </td>
                                        </tr>

                                        {/* Items Header Row */}
                                        <tr>
                                            <th />
                                            <th style={{ ...cellBodyStyle, width: '60px' }}>Sr. No</th>
                                            <th style={{ ...cellBodyStyle, width: '80px' }}>Tag No</th>
                                            <th style={{ ...cellBodyStyle, width: '80px' }}>Code No</th>
                                            <th style={{ ...cellBodyStyle, width: '80px' }}>Lineid</th>
                                            <th style={{ ...cellBodyStyle, width: '100px' }}>Picture</th>
                                            <th style={{ ...cellBodyStyle, width: '100px' }}>Item</th>
                                            <th style={{ ...cellBodyStyle, width: '100px' }}>Diam Quality</th>
                                            <th style={{ ...cellBodyStyle, width: '100px' }}>Dia Weight Carat</th>
                                            <th style={{ ...cellBodyStyle, width: '100px' }}>Color St Weight Carat</th>
                                            <th style={{ ...cellBodyStyle, width: '80px' }}>Gold Purity</th>
                                            <th style={{ ...cellBodyStyle, width: '100px' }}>Gold Weight Grams</th>
                                            <th style={{ ...cellBodyStyle, width: '100px' }}>Price {result?.header?.CurrencyCode}</th>
                                        </tr>

                                        {/* Item Rows */}
                                        {result?.resultArray.map((item, idx) => (
                                            <tr key={idx}>
                                                <td />
                                                <td style={{ ...cellBodyStyle }}>{idx+1}</td>
                                                <td style={{ ...cellBodyStyle }}>{item.designno}</td>
                                                <td style={{
                                                    ...cellBodyStyle,
                                                    width: '80px'
                                                }}>'{item.SrJobno}{item.Counter_Tray !== "" && (item.Counter_Tray)}</td> 
                                                <td style={{ ...cellBodyStyle }}>{item.lineid}</td>
                                                {/* ({item.Counter_Tray}) */}
                                                <td
                                                    style={{
                                                        border: '1px solid black',
                                                        padding: '2px',
                                                        textAlign: 'center',
                                                        verticalAlign: 'middle',
                                                        width: '100px',
                                                        height: '100px',
                                                    }}
                                                >
                                                    <img
                                                        src={item.DesignImage}
                                                        alt="jewelry"
                                                        width="90"
                                                        height="90"
                                                        style={{
                                                            objectFit: 'cover',
                                                            display: 'block',
                                                            margin: '0 auto',
                                                        }}
                                                        onError={handleImageError}
                                                    />
                                                </td>
                                                <td style={{ ...cellBodyStyle }}>{item.Categoryname}</td>
                                                <td style={{ ...cellBodyStyle }}>{item?.ColornameMax} {item?.QualityNameMax}</td>
                                                <td style={{ ...cellBodyStyle }}>{(item?.diamondTotalWt)?.toFixed(3)}</td>
                                                <td style={{ ...cellBodyStyle }}>{(item?.colorStoneTotalWt)?.toFixed(3)}</td>
                                                <td style={{ ...cellBodyStyle }}>{item.MetalPurity}</td>
                                                <td style={{ ...cellBodyStyle }}>{item.NetWt}</td>
                                                <td style={{ ...cellBodyStyle }}>{formatAmount((item?.TotalAmount / result?.header?.CurrencyExchRate).toFixed(2))}</td>
                                            </tr>
                                        ))}
                                        {/* Row for values */}
                                        <tr>
                                            <td colSpan={8} />
                                            <td style={{ ...cellMainTotalStyle, borderBottom: 'none' }}>
                                                {(result?.mainTotal?.diamonds?.Wt ?? 0).toFixed(2)}
                                            </td>
                                            <td style={{ ...cellMainTotalStyle, borderBottom: 'none' }}>
                                                {(result?.mainTotal?.colorstone?.Wt ?? 0).toFixed(2)}
                                            </td>
                                            <td /> {/* keep if needed */}
                                            <td style={{ ...cellMainTotalStyle, borderBottom: 'none' }}>
                                                {(result?.mainTotal?.metal?.Wt ?? 0).toFixed(2)}
                                            </td>
                                            <td style={{ ...cellMainTotalStyle, borderBottom: 'none' }}>
                                            {((result?.mainTotal?.total_amount / result?.header?.CurrencyExchRate))?.toFixed(2)}
                                            </td>
                                        </tr>

                                        {/* Row for units */}
                                        <tr>
                                            <td colSpan={8} />
                                            <td style={{ ...cellMainTotalStyle, borderTop: 'none' }}>CARATS</td>
                                            <td style={{ ...cellMainTotalStyle, borderTop: 'none' }}>CARATS</td>
                                            <td />
                                            <td style={{ ...cellMainTotalStyle, borderTop: 'none' }}>GRAMS</td>
                                            <td style={{ ...cellMainTotalStyle, borderTop: 'none' }}>{result?.header?.CurrencyCode ?? ''}</td>
                                        </tr>

                                        <tr>
                                            <td />
                                            <td colSpan={12} style={{ textTransform: 'upperCase' }}>Total Value : {result?.header?.CurrencyCode}{". "}{toWords?.convert(+fixedValues((result?.mainTotal?.total_amount ) / result?.header?.CurrencyExchRate, 2))}</td>
                                        </tr>
                                        {result?.mainCusTotal?.metalPurityWiseData?.map((item, idx) => (
                                            <React.Fragment key={idx}>
                                                <tr>
                                                    <td />
                                                    <td colSpan={12} style={{ textTransform: 'upperCase' }}>Description of Goods: {item?.descriptionofGoods}</td>
                                                </tr>
                                                <tr>
                                                    <td />
                                                    <td colSpan={12} style={{ textTransform: 'upperCase' }}>Total No of Pcs: {item?.totalPcs} PCS</td>
                                                </tr>
                                                <tr>
                                                    <td />
                                                    <td colSpan={12} style={{ textTransform: 'upperCase' }}>
                                                        Total {item?.descriptionofGoods} Weight: {item?.totalMetalpuritywt?.toFixed(3)} GRAMS
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td />
                                                    <td colSpan={12} style={{ textTransform: 'upperCase' }}>Total Diamond Weight: {item?.totalNaturalDiaWt?.toFixed(3)} CARATS</td>
                                                </tr>
                                                <tr>
                                                    <td />
                                                    <td colSpan={10} style={{ textTransform: 'upperCase' }}>Total Lab Grown Diamond Weight: {item?.totalLabGrownDiaWt?.toFixed(3)} CARATS</td>
                                                </tr>
                                                <tr>
                                                    <td />
                                                    <td colSpan={11} style={{ textTransform: 'upperCase' }}>Total Colored Stone Weight: {item?.totalColorStoneWt?.toFixed(3)} CARATS</td>
                                                </tr>

                                                {/* ✅ Blank row */}
                                                <tr>
                                                    <td colSpan={12}>&nbsp;</td>
                                                </tr>
                                            </React.Fragment>
                                        ))}


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