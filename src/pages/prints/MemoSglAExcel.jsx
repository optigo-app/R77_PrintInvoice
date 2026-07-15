// http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=Sk1JLzQxMC8yMDI1&evn=bWVtbw==&pnm=TWVtbyBTR0wgQQ==&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=PackingList3&pid=undefined&etp=ZXhjZWw=
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { apiCall, checkMsg, fixedValues, formatAmount, handleImageError, isObjectEmpty, NumberWithCommas } from '../../GlobalFunctions';
import Loader from '../../components/Loader';
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import { MetalShapeNameWiseArr } from '../../GlobalFunctions/MetalShapeNameWiseArr';

const MemoSglAExcel = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
    const [result, setResult] = useState(null);
    const [loader, setLoader] = useState(true);
    const [msg, setMsg] = useState("");
    const [diamondWise, setDiamondWise] = useState([]);
    const [MetShpWise, setMetShpWise] = useState([]);
    const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
    const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);

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
                console.log(error);
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

        let met_shp_arr = MetalShapeNameWiseArr(datas?.json2);

        setMetShpWise(met_shp_arr);
        let tot_met = 0;
        let tot_met_wt = 0;
        met_shp_arr?.forEach((e, i) => {
            tot_met += e?.Amount;
            tot_met_wt += e?.metalfinewt;
        });
        setNotGoldMetalTotal(tot_met);
        setNotGoldMetalWtTotal(tot_met_wt);

        let diaObj = {
            ShapeName: "OTHERS",
            wtWt: 0,
            wtWts: 0,
            pcPcs: 0,
            pcPcss: 0,
            rRate: 0,
            rRates: 0,
            amtAmount: 0,
            amtAmounts: 0,
        };

        let diaonlyrndarr1 = [];
        let diaonlyrndarr2 = [];
        let diaonlyrndarr3 = [];
        let diaonlyrndarr4 = [];
        let diarndotherarr5 = [];
        let diaonlyrndarr6 = [];
        let Solitaire = []
        datas?.json2?.forEach((e) => {
            if (e?.MasterManagement_DiamondStoneTypeid === 1) {
                if (e?.IsCenterStone === 1) {
                    Solitaire.push(e);
                }

                if (e.ShapeName?.toLowerCase() === "rnd") {
                    diaonlyrndarr1.push(e);
                } else {
                    diaonlyrndarr2.push(e);
                }
            }
        });
        
        diaonlyrndarr1.forEach((e) => {
            let findRecord = diaonlyrndarr3.findIndex(
                (a) =>
                    e?.StockBarcode === a?.StockBarcode &&
                    e?.ShapeName === a?.ShapeName &&
                    e?.QualityName === a?.QualityName &&
                    e?.Colorname === a?.Colorname
            );

            if (findRecord === -1) {
                let obj = { ...e };
                obj.wtWt = e?.Wt;
                obj.pcPcs = e?.Pcs;
                obj.rRate = e?.Rate;
                obj.amtAmount = e?.Amount;
                diaonlyrndarr3.push(obj);
            } else {
                diaonlyrndarr3[findRecord].wtWt += e?.Wt;
                diaonlyrndarr3[findRecord].pcPcs += e?.Pcs;
                diaonlyrndarr3[findRecord].rRate += e?.Rate;
                diaonlyrndarr3[findRecord].amtAmount += e?.Amount;
            }
        });

        diaonlyrndarr2.forEach((e) => {
            let findRecord = diaonlyrndarr4.findIndex(
                (a) =>
                    e?.StockBarcode === a?.StockBarcode &&
                    e?.ShapeName === a?.ShapeName &&
                    e?.QualityName === a?.QualityName &&
                    e?.Colorname === a?.Colorname
            );

            if (findRecord === -1) {
                let obj = { ...e };
                obj.wtWt = e?.Wt;
                obj.wtWts = e?.Wt;
                obj.pcPcs = e?.Pcs;
                obj.pcPcss = e?.Pcs;
                obj.rRate = e?.Rate;
                obj.rRates = e?.Rate;
                obj.amtAmount = e?.Amount;
                obj.amtAmounts = e?.Amount;
                diaonlyrndarr4.push(obj);
            } else {
                diaonlyrndarr4[findRecord].wtWt += e?.Wt;
                diaonlyrndarr4[findRecord].wtWts += e?.Wt;
                diaonlyrndarr4[findRecord].pcPcs += e?.Pcs;
                diaonlyrndarr4[findRecord].pcPcss += e?.Pcs;
                diaonlyrndarr4[findRecord].rRate += e?.Rate;
                diaonlyrndarr4[findRecord].rRates += e?.Rate;
                diaonlyrndarr4[findRecord].amtAmount += e?.Amount;
                diaonlyrndarr4[findRecord].amtAmounts += e?.Amount;
            }
        });

        diaonlyrndarr4.forEach((e) => {
            diaObj.wtWt += e?.wtWt;
            diaObj.wtWts += e?.wtWts;
            diaObj.pcPcs += e?.pcPcs;
            diaObj.pcPcss += e?.pcPcss;
            diaObj.rRate += e?.rRate;
            diaObj.rRates += e?.rRates;
            diaObj.amtAmount += e?.amtAmount;
            diaObj.amtAmounts += e?.amtAmounts;
        });

        diaonlyrndarr3?.forEach((e) => {
            let find_record = diaonlyrndarr6?.findIndex(
                (a) =>
                    e?.ShapeName === a?.ShapeName &&
                    e?.QualityName === a?.QualityName &&
                    e?.Colorname === a?.Colorname
            );
            if (find_record === -1) {
                let obj = { ...e };
                obj.wtWts = e?.wtWt;
                obj.pcPcss = e?.pcPcs;
                obj.rRates = e?.rRate;
                obj.amtAmounts = e?.amtAmount;
                diaonlyrndarr6.push(obj);
            } else {
                diaonlyrndarr6[find_record].wtWts += e?.wtWt;
                diaonlyrndarr6[find_record].pcPcss += e?.pcPcs;
                diaonlyrndarr6[find_record].rRates += e?.rRate;
                diaonlyrndarr6[find_record].amtAmounts += e?.amtAmount;
            }
        });

        diarndotherarr5 = [...diaonlyrndarr6, diaObj];
        setDiamondWise(diarndotherarr5);
        // console.log("datas", datas);
        setResult(datas);

        setTimeout(() => {
            const button = document.getElementById('test-table-xls-button');
            button.click();
        }, 500);
    }

    // console.log("result", result);

    // Style...
    const txtTop = {
        verticalAlign: "top",
    };
    const brRight = {
        borderRight: "2px solid #000000",
    };
    const brBotm = {
        borderBottom: "2px solid #000000",
    };
    const brBotmdrk = {
        borderBottom: "2px solid #000000",
    };
    const brTop = {
        borderTop: "2px solid #000000",
    };
    const brTopLit = {
        borderTop: "1px solid #000000",
    };
    const hdSty = {
        backgroundColor: "#F5F5F5",
    };
    const styBld = {
        fontWeight: "bold",
    }
    const totalGrosswt = result?.resultArray?.reduce((acc, obj) => acc + obj.grosswt, 0);
    const totalDiaWeight = result?.resultArray?.map((e) => 
        e?.diamonds?.filter((diamond) => diamond?.IsCenterStone === 0)
          .reduce((acc, diamond) => acc + (diamond?.Wt || 0), 0)).reduce((acc, weight) => acc + weight, 0);
    
   const totalDiaPcs = result?.resultArray?.map((e) => 
        e?.diamonds?.filter((diamond) => diamond?.IsCenterStone === 0)
          .reduce((acc, diamond) => acc + (diamond?.Pcs || 0), 0)).reduce((acc, weight) => acc + weight, 0);
   
   const totalSolWt = result?.resultArray?.map((e) => 
        e?.diamonds?.filter((diamond) => diamond?.IsCenterStone === 1)
          .reduce((acc, diamond) => acc + (diamond?.Wt || 0), 0)).reduce((acc, weight) => acc + weight, 0);
    
   const totalSolPcs = result?.resultArray?.map((e) => 
        e?.diamonds?.filter((diamond) => diamond?.IsCenterStone === 1)
          .reduce((acc, diamond) => acc + (diamond?.Pcs || 0), 0)).reduce((acc, weight) => acc + weight, 0);
    

    return (
        <>
            {loader ? <Loader /> : msg === "" ?
                <> <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    className="download-table-xls-button btn btn-success text-black bg-success px-2 py-1 fs-5 d-none"
                    table="table-to-xls"
                    filename={`Memo_SGL_A_${result?.header?.InvoiceNo}_${Date.now()}`}
                    sheet="tablexls"
                    buttonText="Download as XLS" />
                    <table id="table-to-xls" className='d-none'>
                        <tbody>
                            <tr />
                            <tr>
                                <td />
                                <td />
                                <td colSpan={14}>
                                    {result?.header?.customerAddress2 &&
                                        `${result.header.customerAddress2}`}
                                    {result?.header?.customerAddress1 &&
                                        ` ${result.header.customerAddress1}`}
                                    {result?.header?.customerAddress3 &&
                                        ` ${result.header.customerAddress3}`}
                                    {result?.header?.customercity1 &&
                                        ` ${result.header.customercity1}`}
                                    {(result?.header?.PinCode !== "" && result.header.customercity1 !== "") && (` - `)}
                                    {result?.header?.PinCode !== "" && `${result.header.PinCode}`}
                                    {(result?.header?.customeremail1 !== "" && result.header.PinCode !== "") && (`, `)}
                                    {result?.header?.customeremail1 && `${result.header.customeremail1}`}
                                </td>
                            </tr>
                            <tr>
                                <td height={40} style={{ ...styBld, }}>Date</td>
                                <td style={{ textAlign: "left" }}>{result?.header?.EntryDate}</td>
                                
                                <td height={40} style={{ ...styBld, }}>Client</td>
                                <td colSpan={3} style={{ textAlign: "left" }}>{result?.header?.CompanyFullName}</td>
                                <td />
                                <td height={40} style={{ ...styBld, }}>Supplier</td>
                                <td colSpan={2} />
                                <td height={40} colSpan={2} style={{ ...styBld, }}>Job Card No.</td>
                                <td colSpan={2} style={{ textAlign: "left" }}>{result?.header?.InvoiceNo}</td>
                                <td />
                                <td height={40} colSpan={2} style={{ ...styBld, }}>Delivery Date</td>
                                <td colSpan={2} />
                            </tr>
                            <tr>
                                <th width={40} style={{ ...brRight, ...brTop, ...hdSty }}>Sr.</th>
                                <th width={180} style={{ ...brRight, ...brTop, ...hdSty }}>Product</th>
                                <th width={80} style={{ ...brRight, ...brTop, ...hdSty }}>Customer</th>
                                <th width={80} style={{ ...brRight, ...brTop, ...hdSty }}>Gross</th>
                                <th width={80} style={{ ...brRight, ...brTop, ...hdSty }}>Dia</th>
                                <th width={80} style={{ ...brRight, ...brTop, ...hdSty }}>Dia</th>
                                <th width={80} style={{ ...brRight, ...brTop, ...hdSty }}>Dia Clarity</th>
                                <th width={80} style={{ ...brRight, ...brTop, ...hdSty }}>Dia Color</th>
                                <th width={80} style={{ ...brRight, ...brTop, ...hdSty }}>Diamind</th>
                                <th width={80} style={{ ...brRight, ...brTop, ...hdSty }}>Cut</th>
                                <th width={80} style={{ ...brRight, ...brTop, ...hdSty }}>Stamp</th>
                                <th width={80} style={{ ...brRight, ...brTop, ...hdSty }}>Metal</th>
                                <th width={80} style={{ ...brRight, ...brTop, ...hdSty }}>Sol Dia</th>
                                <th width={80} style={{ ...brRight, ...brTop, ...hdSty }}>Sol Dia</th>
                                <th width={80} style={{ ...brRight, ...brTop, ...hdSty }}>Sol Dia</th>
                                <th width={80} style={{ ...brRight, ...brTop, ...hdSty }}>Sol Dia</th>
                                <th colSpan={3} width={240} style={{ ...brRight, ...brTop, ...hdSty }}>For Office Use</th>
                            </tr>
                            <tr>
                                <th width={40} style={{ ...brRight, ...brBotmdrk, ...hdSty }}></th>
                                <th width={180} style={{ ...brRight, ...brBotmdrk, ...hdSty }}></th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...hdSty }}>ID</th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...hdSty }}>Wt.</th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...hdSty }}>Wt.</th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...hdSty }}>Pcs</th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...hdSty }}>LL</th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...hdSty }}>LL</th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...hdSty }}>Type</th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...hdSty }}></th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...hdSty }}></th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...hdSty }}></th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...hdSty }}>Wt.</th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...hdSty }}>Pcs.</th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...hdSty }}>Clarity LL</th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...hdSty }}>Color LL</th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...brTopLit, ...hdSty }}>SGL NO.</th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...brTopLit, ...hdSty }}>Clarity SGL</th>
                                <th width={80} style={{ ...brRight, ...brBotmdrk, ...brTopLit, ...hdSty }}>Color SGL</th>
                            </tr>

                            {result?.resultArray?.map((e, i) => {
                                return <tr key={i}>
                                    <td width={40} style={{ ...brRight, ...brBotm, ...txtTop, textAlign: "center" }}><div>{i + 1}</div></td>

                                    <td width={180} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        <div>{e?.Categoryname}</div>
                                    </td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop, textAlign: "left" }}>
                                        <div>{e?.designno} {`\u00A0 ${e?.SrJobno}`}</div>
                                    </td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        <div>{fixedValues(e?.grosswt, 3)}</div>
                                    </td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {<div>{fixedValues(e?.diamonds?.filter((e) => e?.IsCenterStone === 0).reduce((acc, ele) => acc + ele?.Wt, 0), 3)}</div>}
                                    </td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {<div>{e?.diamonds?.filter((e) => e?.IsCenterStone === 0).reduce((acc, ele) => acc + ele?.Pcs, 0)}</div>}
                                    </td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop, textAlign: "left" }}>
                                        <div>
                                            {[
                                                ...new Set(
                                                e?.diamonds
                                                    .filter(d => d.QualityName && d.IsCenterStone !== 1)
                                                    .map(d => d.QualityName)
                                                )
                                            ].join(', ')}
                                        </div>
                                    </td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop, textAlign: "left" }}>
                                        <div>
                                            {[
                                                ...new Set(
                                                e?.diamonds
                                                    .filter(d => d.Colorname && d.IsCenterStone !== 1)
                                                    .map(d => d.Colorname)
                                                )
                                            ].join(', ')}
                                        </div>
                                    </td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop, textAlign: "left" }}>
                                        <div>
                                            {[
                                                ...new Set(
                                                e?.diamonds
                                                    .filter(d => d.MaterialTypeName && d.IsCenterStone !== 1)
                                                    .map(d => d.MaterialTypeName)
                                                )
                                            ].join(', ')}
                                        </div>
                                    </td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop, textAlign: "left" }}>
                                        <div>
                                            {[
                                                ...new Set(
                                                e?.diamonds
                                                    .filter(d => d.ShapeName && d.IsCenterStone !== 1)
                                                    .map(d => d.ShapeName)
                                                )
                                            ].join(', ')}
                                        </div>
                                    </td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        <div>{e?.MetalPurity}</div>
                                    </td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        <div>{e?.MetalType}</div>
                                    </td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {<div>{fixedValues(e?.diamonds?.filter((e) => e?.IsCenterStone === 1).reduce((acc, ele) => acc + ele?.Wt, 0), 3)}</div>}
                                    </td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {<div>{e?.diamonds?.filter((e) => e?.IsCenterStone === 1).reduce((acc, ele) => acc + ele?.Pcs, 0)}</div>}
                                    </td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop, textAlign: "left" }}>
                                        <div>
                                            {[
                                                ...new Set(
                                                e?.diamonds
                                                    .filter(d => d.QualityName && d.IsCenterStone === 1)
                                                    .map(d => d.QualityName)
                                                )
                                            ].join(', ')}
                                        </div>
                                    </td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop, textAlign: "left" }}>
                                        <div>
                                            {[
                                                ...new Set(
                                                e?.diamonds
                                                    .filter(d => d.Colorname && d.IsCenterStone === 1)
                                                    .map(d => d.Colorname)
                                                )
                                            ].join(', ')}
                                        </div>
                                    </td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop }}></td>
                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop }}></td>
                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop }}></td>
                                </tr>
                            })}

                            <tr>
                                <td width={40} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}></td>
                                <td width={180} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}></td>
                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}></td>

                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}>
                                    <div>{totalGrosswt?.toFixed(3)}</div>
                                </td>

                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}>
                                    {totalDiaWeight?.toFixed(3)}
                                </td>

                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}>
                                    {totalDiaPcs}
                                </td>

                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}></td>
                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}></td>
                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}></td>
                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}></td>
                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}></td>
                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}></td>

                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}>
                                    {totalSolWt?.toFixed(3)}
                                </td>

                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}>
                                    {totalSolPcs}
                                </td>

                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}></td>
                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}></td>
                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}></td>
                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}></td>
                                <td width={80} style={{ ...brRight, ...brBotmdrk, ...brTop, ...txtTop }}></td>
                            </tr>
                        </tbody>
                    </table>
                </>
                : <p className='text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto'>{msg}</p>}
        </>
    )
}

export default MemoSglAExcel;