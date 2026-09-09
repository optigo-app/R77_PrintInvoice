// http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=Sk1JLzE3LzIwMjU=&evn=bWVtbw==&pnm=TWVtbyBIUkQ=&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=PackingList3&pid=undefined&etp=ZXhjZWw=

import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { apiCall, checkMsg, fixedValues, formatAmount, handleImageError, isObjectEmpty, NumberWithCommas } from '../../GlobalFunctions';
import Loader from '../../components/Loader';
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import { MetalShapeNameWiseArr } from '../../GlobalFunctions/MetalShapeNameWiseArr';

const MemoHRDExcel = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
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


    // Style...
    const txtTop = {
        verticalAlign: "top",
    };
    const txtCen = {
        textAlign: "center",
    }
    const brRight = {
        borderRight: "0.5px solid #000000",
    };
    const brBotm = {
        borderBottom: "0.5px solid #000000",
    };
    const brTop = {
        borderTop: "0.5px solid #000000",
    };
    const brLeft = {
        borderLeft: "0.5px solid #000000",
    };
    const hdSty = {
        backgroundColor: "#F5F5F5",
    };
    const styBld = {
        fontWeight: "bold",
    }
    const fntSize = {
        fontSize: "18px"
    }
    const fntSize1 = {
        fontSize: "16px"
    }
    const fntSize2 = {
        fontSize: "14px"
    }
    const txtAtSta = {
        textAlign: "left",
    }
    const txtAtEnd = {
        textAlign: "right",
    }

    const getDiamondCriteriaWise = (diamonds = []) => {
        const out = {
            small: {},
            stars: {},
            pointers: {},
            solitaires: {},
            totalDiamondCtw: 0,
            totalDIaPcs: 0,
        };



        diamonds
            .filter(d =>
                d.MasterManagement_DiamondStoneTypeid === 1 &&
                d.IsCenterStone !== 1
            )
            .forEach(d => {

                const p = Number(d.pointer || 0);
                const shape = d.ShapeName || "OTHER";
                const wt = Number(d.Wt || 0);
                const pcs = Number(d.Pcs || 0);

                out.totalDiamondCtw += wt;
                out.totalDIaPcs += pcs;




                if (p >= 0.0001 && p <= 0.1000) {  // 0.0001 - 0.1000   
                    if (!out.small[shape]) out.small[shape] = { pcs: 0, ctw: 0 };
                    if (!out.stars[shape]) out.stars[shape] = { wt: 0, pcs: 0 };
                    out.small[shape].pcs += pcs;
                    out.small[shape].ctw += wt;
                    out.stars[shape].wt += wt;
                    out.stars[shape].pcs += pcs;

                }
                else if (p >= 0.1001 && p <= 0.9999) {  //0.1001- 0.9999
                    if (!out.pointers[shape]) out.pointers[shape] = { pcs: 0, ctw: 0 };
                    out.pointers[shape].pcs += pcs;
                    out.pointers[shape].ctw += wt;
                } else if (p >= 1.000) {
                    if (!out.solitaires[shape]) out.solitaires[shape] = { pcs: 0, ctw: 0 };
                    out.solitaires[shape].pcs += pcs;
                    out.solitaires[shape].ctw += wt;
                }
            });


        console.log("TCL: getDiamondCriteriaWise out-> ", out)
        console.log("TCL: getDiamondCriteriaWise p-> ", diamonds)




        return out;

    };

    const getColorstoneCriteriaWise = (colorstone = []) => {
        const out = {
            small: {},
        }

        colorstone
            .filter(d =>
                d.MasterManagement_DiamondStoneTypeid === 2 &&
                d.IsCenterStone !== 1
            )
            .forEach(d => {
                const color = d.Colorname || "OTHER";
                const shape = d.QualityName || "OTHER";
                const wt = Number(d.Wt || 0);
                const pcs = Number(d.Pcs || 0);

                if (!out.small[color + '/' + shape]) out.small[color + '/' + shape] = { pcs: 0, ctw: 0 };

                out.small[color + '/' + shape].pcs += pcs;
                out.small[color + '/' + shape].ctw += wt;

            });


        return out;
    };

    // Groups a design's diamonds by ShapeName (same filter as getDiamondCriteriaWise's
    // totals) so SHAPE / Quantity / Ctw can be rendered one row per shape instead of
    // a single combined row.
    const getDiamondShapeWise = (diamonds = []) => {
        const map = {};
        const order = [];

        diamonds
            .filter(d =>
                d.MasterManagement_DiamondStoneTypeid === 1 &&
                d.IsCenterStone !== 1
            )
            .forEach(d => {
                const shape = d.ShapeName || "OTHER";
                const wt = Number(d.Wt || 0);
                const pcs = Number(d.Pcs || 0);

                if (!map[shape]) {
                    map[shape] = { shape, pcs: 0, ctw: 0 };
                    order.push(shape);
                }
                map[shape].pcs += pcs;
                map[shape].ctw += wt;
            });

        return order.map(s => map[s]);
    };

    console.log("result", result);
    return (
        <>
            {loader ? <Loader /> : msg === "" ?
                <> <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    className="download-table-xls-button btn btn-success text-black bg-success px-2 py-1 fs-5"
                    table="table-to-xls"
                    filename={`Memo_HRD_${result?.header?.InvoiceNo}_${Date.now()}`}
                    sheet="tablexls"
                    buttonText="Download as XLS" />
                    <table id="table-to-xls"   >
                        {/* <table id="table-to-xls" className='d-none'> */}
                        <tbody>
                            <tr>
                                <td colSpan={9} height={30} style={{ ...brBotm, ...styBld, ...fntSize, ...txtCen, ...brRight }}>
                                    {result?.header?.CompanyFullName}
                                </td>
                            </tr>

                            <tr>
                                <td colSpan={9} height={25} style={{ ...brBotm, ...brRight }}></td>
                            </tr>

                            <tr>
                                <td colSpan={9} height={25} style={{ ...brBotm, ...fntSize1, ...txtCen, ...brRight }}>
                                    {result?.header?.CompanyAddress}
                                </td>
                            </tr>

                            <tr>
                                <td colSpan={9} height={25} style={{ ...brBotm, ...fntSize1, ...txtCen, ...brRight }}>
                                    {result?.header?.CompanyAddress2}
                                </td>
                            </tr>

                            <tr>
                                <td colSpan={9} height={25} style={{ ...brBotm, ...fntSize1, ...txtCen, ...brRight }}>
                                    GST NO: {result?.header?.Company_VAT_GST_No}
                                </td>
                                <td width={100} />
                                <td width={100} style={{ ...brTop, ...brRight, ...brLeft, ...styBld }}>Natural</td>
                                <td width={100} style={{ ...brTop, ...brRight }}>YES</td>
                                <td width={100} style={{ ...brTop, ...brRight, ...styBld }}>BIG CERT</td>
                                <td width={100} style={{ ...brTop, ...brRight }}>NO</td>
                            </tr>

                            <tr>
                                <td colSpan={9} height={25} style={{ ...brBotm, ...fntSize1, ...txtCen, ...brRight }}>
                                    TO: {result?.header?.customerfirmname} {result?.header?.customerAddress1} {result?.header?.customerAddress2}
                                </td>
                                <td width={100} />
                                <td width={100} style={{ ...brTop, ...brRight, ...brLeft, ...styBld }}>LAB GROWN</td>
                                <td width={100} style={{ ...brTop, ...brRight }}>NO</td>
                                <td width={100} style={{ ...brTop, ...brRight, ...styBld }}>SMALL CERT</td>
                                <td width={100} style={{ ...brTop, ...brRight }}>YES</td>
                            </tr>

                            <tr>
                                <td colSpan={9} height={25} style={{ ...brBotm, ...fntSize1, ...txtCen, ...brRight }}>
                                    {result?.header?.customercity1} {result?.header?.customerpincode} {result?.header?.State} T: {result?.header?.customermobileno1}
                                </td>
                                <td width={100} />
                                <td width={100} style={{ ...brTop, ...brRight, ...brLeft, ...styBld }}>AUTHENTICITY</td>
                                <td width={100} style={{ ...brTop, ...brRight }}>NO</td>
                                <td width={100} style={{ ...brTop, ...brRight, ...styBld }}>CARD</td>
                                <td width={100} style={{ ...brTop, ...brRight }}>NO</td>
                            </tr>

                            <tr>
                                <td colSpan={2} height={25} style={{ ...brBotm, ...fntSize1, ...txtCen, ...brRight, ...styBld }}>
                                    Date
                                </td>
                                <td style={{ ...brBotm, ...brRight }}>{result?.header?.EntryDate}</td>
                                <td colSpan={6} style={{ ...brBotm, ...brRight }} />
                                <td width={100} />
                                <td width={100} style={{ ...brTop, ...brRight, ...brLeft, ...styBld }}>XRF-METAL</td>
                                <td width={100} style={{ ...brTop, ...brRight }}>NO</td>
                                <td width={100} style={{ ...brTop, ...brRight, ...styBld }}>PHOTO (Provided)</td>
                                <td width={100} style={{ ...brTop, ...brRight }}>NO</td>
                            </tr>

                            <tr>
                                <td height={25} style={{ ...brBotm, ...brRight }}></td>
                                <td style={{ ...brBotm, ...brRight }} />
                                <td style={{ ...brBotm, ...brRight }} />
                                <td colSpan={6} style={{ ...brBotm, ...brRight }} />
                                <td width={100} />
                                <td width={100} style={{ ...brTop, ...brBotm, ...brRight, ...brLeft, ...styBld }}>DATE</td>
                                <td width={100} style={{ ...brTop, ...brBotm, ...brRight }}>NO</td>
                                <td width={100} style={{ ...brTop, ...brBotm, ...brRight, ...styBld }}>SYMMETRY</td>
                                <td width={100} style={{ ...brTop, ...brBotm, ...brRight }}>YES</td>
                            </tr>

                            <tr>
                                <td height={25} style={{ ...brBotm, ...brRight }}></td>
                                <td style={{ ...brBotm, ...brRight }} />
                                <td style={{ ...brBotm, ...brRight }} />
                                <td colSpan={6} style={{ ...brBotm, ...brRight }} />
                            </tr>

                            <tr>
                                <td colSpan={2} style={{ ...brBotm, ...brRight, ...fntSize1, ...styBld }}>Company Representative/s</td>
                                <td style={{ ...brBotm, ...brRight }} />
                                <td colSpan={6} style={{ ...brBotm, ...brRight }} />
                                <td colSpan={7} style={{ ...brBotm }} />
                                <td colSpan={7} style={{ ...brTop, ...brRight, ...brLeft, ...fntSize1, ...txtCen, ...brBotm }}>For HRD Use Only</td>
                            </tr>

                            <tr>
                                <th width={80} style={{ ...brRight, ...brBotm, ...fntSize1, }}>Sr. No.</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>SAMPLE CODE (By HRD)</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>Job No.</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>Style No. Of Product (mentioned on The report)</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>Jewellery Type</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>Gross Jewel Weight (in gms)</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>Metal Type/Purity/Color</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>CRITERIA</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>SHAPE</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>Diamond Quantity (Numbers) As Per Shape</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>Total Diamond cts weight</th>

                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>Total</th>
                                <th width={150} style={{ ...brRight, ...brBotm, ...fntSize1, }}>Gemstone / Color Stones (Type)</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>HRD COLOR</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>HRD CLARITY</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>HRD SYMM</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>HRD Setting</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>INSCRIPTION ON JEWEL</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>COMMENT/REMARK/REJECT</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>Graders</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>Stars & Meeles cts weight</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>Pointers  cts weight</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...fntSize1, }}>Solitaires  cts weight</th>
                            </tr>

                            {result?.resultArray?.map((e, i) => {
                                const dia = getDiamondCriteriaWise(e?.diamonds || []);
                                const cst = getColorstoneCriteriaWise(e?.colorstone || []);
                                const diaShapeWise = getDiamondShapeWise(e?.diamonds || []);

                                const shapeText = Object.keys(dia.small).join(", ") || "-";
                                const qtyText = Object.values(dia.small);

                                const starts = Object.entries(dia?.stars ?? {}).map(([key, { pcs = 0, wt = 0 }]) =>
                                    `${key} ${pcs}/${wt.toFixed(2)}`
                                );

                                const pointers = Object.entries(dia.pointers)
                                    .map(([key, value]) => `${key} ${value.pcs}/${value.ctw.toFixed(2)}`)
                                    ;

                                const solitaires = Object.entries(dia.solitaires)
                                    .map(([key, value]) => `${key} ${value.pcs}/${value.ctw.toFixed(2)}`)
                                    ;

                                const cstShow = Object.entries(cst.small)
                                    .map(([key, value]) => `${key} ${value.pcs}/${value.ctw.toFixed(2)}`)
                                    ;

                                const totalDiamondCtw = dia.totalDiamondCtw.toFixed(2);
                                const totalDIaPcs = dia.totalDIaPcs || 0;

                                const smallCtw = Object.values(dia.small)
                                    .reduce((a, b) => a + b.ctw, 0)
                                    .toFixed(2);

                                // SHAPE/Qty/Ctw rows and Gemstone rows vary independently in length —
                                // the design's block needs enough <tr>s for whichever is longer.
                                const shapeRowCount = diaShapeWise.length;
                                const cstRowCount = cstShow.length;
                                const totalRowCount = Math.max(shapeRowCount, cstRowCount, 1);

                                return Array.from({ length: totalRowCount }).map((_, rowIdx) => {
                                    const shapeRow = diaShapeWise[rowIdx];
                                    const cstRow = cstShow[rowIdx];

                                    if (rowIdx === 0) {
                                        return (
                                            <tr key={`${i}-${rowIdx}`} style={{ verticalAlign: "top" }}>
                                                <td rowSpan={totalRowCount} height={25} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtCen }}>
                                                    {i + 1}
                                                </td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}></td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}>
                                                    <div>{`\u00A0 ${e?.SrJobno}`}</div>
                                                </td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}>
                                                    <div>{e?.designno}</div>
                                                </td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}>
                                                    <div>{e?.Categoryname}</div>
                                                </td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}>
                                                    <div>{fixedValues(e?.grosswt, 3)}</div>
                                                </td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}>
                                                    <div>{e?.MetalTypePurity} {e?.MetalColor}</div>
                                                </td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}></td>

                                                <td style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}>
                                                    {shapeRow?.shape || ""}
                                                </td>

                                                <td style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}>
                                                    {shapeRow ? shapeRow.pcs : (shapeRowCount === 0 ? totalDIaPcs : "")}
                                                </td>

                                                <td style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}>
                                                    {shapeRow ? shapeRow.ctw.toFixed(2) : (shapeRowCount === 0 ? totalDiamondCtw : "")}
                                                </td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtEnd }}>
                                                    {totalDiamondCtw}
                                                </td>

                                                <td style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}>
                                                    {cstRow || ""}
                                                </td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}></td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}></td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}></td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}></td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}></td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}></td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}></td>
                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}>
                                                    {/* {
                                                        starts.map((item, ind) => (<div style={{ ...txtAtEnd }} key={ind} >{item}</div>))
                                                    } */}
                                                </td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}>

                                                    {/* {
                                                        pointers.map((item, ind) => (<div style={{ ...txtAtEnd }} key={ind} >{item}</div>))
                                                    } */}
                                                </td>

                                                <td rowSpan={totalRowCount} style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}>
{/* 
                                                    {
                                                        solitaires.map((item, ind) => (<div style={{ ...txtAtEnd }} key={ind} >{item}</div>))
                                                    } */}
                                                </td>
                                            </tr>
                                        );
                                    }

                                    // Extra rows: only SHAPE / Qty / Ctw (from diaShapeWise) and
                                    // Gemstone (from cstShow) render here — every other column is
                                    // already spanned down from rowIdx 0 above.
                                    return (
                                        <tr key={`${i}-${rowIdx}`} style={{ verticalAlign: "top" }}>
                                            <td style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}>
                                                {shapeRow?.shape || ""}
                                            </td>
                                            <td style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}>
                                                {shapeRow ? shapeRow.pcs : ""}
                                            </td>
                                            <td style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}>
                                                {shapeRow ? shapeRow.ctw.toFixed(2) : ""}
                                            </td>
                                            <td style={{ ...brRight, ...brBotm, ...fntSize2, ...txtAtSta }}>
                                                {cstRow || ""}
                                            </td>
                                        </tr>
                                    );
                                });
                            })}
                        </tbody>
                    </table>
                </>
                : <p className='text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto'>{msg}</p>}
        </>
    )
}

export default MemoHRDExcel;