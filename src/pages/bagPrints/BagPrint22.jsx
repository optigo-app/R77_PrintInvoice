import React from 'react';
import "../../assets/css/bagprint/bagprint22.css";
import queryString from 'query-string';
import { useEffect } from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { GetData } from '../../GlobalFunctions/GetData';
import { handleImageError } from '../../GlobalFunctions/HandleImageError';
import { handlePrint } from '../../GlobalFunctions/HandlePrint';
import BarcodeGenerator from '../../components/BarcodeGenerator';
import BarcodeGenratorStcok from "../../components/BarcodeGenratorStcok";
import Loader from '../../components/Loader';
import { organizeData } from '../../GlobalFunctions/OrganizeBagPrintData';
import { GetChunkData } from './../../GlobalFunctions/GetChunkData';
import { GetUniquejob } from '../../GlobalFunctions/GetUniqueJob';
import { checkInstruction } from '../../GlobalFunctions';
import QRCodeGenerator from "../../components/QRCodeGenerator";








export default function DiamondColourCodeForm({ queries, headers }) {
    const [data, setData] = useState([]);
    const location = useLocation();
    const queryParams = queryString.parse(location?.search);
    const resultString = GetUniquejob(queryParams?.str_srjobno);
    const chunkSize17 = 11;
    useEffect(() => {
        if (Object.keys(queryParams)?.length !== 0) {
            atob(queryParams?.imagepath);
        }
        const fetchData = async () => {
            try {
                const responseData = [];
                const objs = {
                    jobno: resultString,
                    custid: queries.custid,
                    printname: queries.printname,
                    appuserid: queries.appuserid,
                    url: queries.url,
                    headers: headers,
                };
                const allDatas = await GetData(objs);
                let datas = organizeData(allDatas?.rd, allDatas?.rd1);
                console.log(datas);
                // eslint-disable-next-line array-callback-return
                datas?.map((a) => {
                    let length = 0;
                    let total = {
                        ActualPcs: 0,
                        ActualWeight: 0,
                    };
                    let clr = {
                        Shapename: "TOTAL",
                        Sizename: "",
                        ActualPcs: 0,
                        ActualWeight: 0,
                    };
                    let dia = {
                        Shapename: "TOTAL",
                        Sizename: "",
                        ActualPcs: 0,
                        ActualWeight: 0,
                    };
                    let misc = {
                        Shapename: "TOTAL",
                        Sizename: "",
                        ActualPcs: 0,
                        ActualWeight: 0,
                    };
                    let f = {
                        Shapename: "TOTAL",
                        Sizename: "",
                        ActualPcs: 0,
                        ActualWeight: 0,
                    };
                    let DiamondList = [];
                    let ColorStoneList = [];
                    let MiscList = [];
                    let FindingList = [];

                    // eslint-disable-next-line array-callback-return
                    a?.rd1?.map((e, i) => {

                        if (e?.MasterManagement_DiamondStoneTypeid !== 0) {
                            total.ActualPcs = total?.ActualPcs + e?.ActualPcs;
                            total.ActualWeight = total?.ActualWeight + e?.ActualWeight;
                        }
                        if (e?.ConcatedFullShapeQualityColorCode !== "- - - ") {
                            length++;
                        }
                        if (e?.MasterManagement_DiamondStoneTypeid === 3) {
                            DiamondList.push(e);
                            dia.ActualPcs = dia.ActualPcs + e?.ActualPcs;
                            dia.ActualWeight = dia.ActualWeight + e?.ActualWeight;
                        } else if (e?.MasterManagement_DiamondStoneTypeid === 4) {
                            ColorStoneList.push(e);
                            clr.ActualPcs = clr.ActualPcs + e?.ActualPcs;
                            clr.ActualWeight = clr.ActualWeight + e?.ActualWeight;
                        } else if (e?.MasterManagement_DiamondStoneTypeid === 5) {
                            FindingList.push(e);
                            f.ActualPcs = f.ActualPcs + e?.ActualPcs;
                            f.ActualWeight = f.ActualWeight + e?.ActualWeight;
                        } else if (e?.MasterManagement_DiamondStoneTypeid === 7) {
                            MiscList.push(e);
                            misc.ActualPcs = misc.ActualPcs + e?.ActualPcs;
                            misc.ActualWeight = misc.ActualWeight + e?.ActualWeight;
                        }
                    });

                    dia.ActualPcs = +(dia.ActualPcs?.toFixed(3));
                    dia.ActualWeight = +(dia.ActualWeight?.toFixed(3));
                    clr.ActualPcs = +(clr.ActualPcs?.toFixed(3));
                    clr.ActualWeight = +(clr.ActualWeight?.toFixed(3));
                    misc.ActualPcs = +(misc.ActualPcs?.toFixed(3));
                    misc.ActualWeight = +(misc.ActualWeight?.toFixed(3));
                    f.ActualPcs = +(f.ActualPcs?.toFixed(3));
                    f.ActualWeight = +(f.ActualWeight?.toFixed(3));

                    let arr = [];
                    let mainArr = arr?.concat(DiamondList, ColorStoneList, MiscList, FindingList);
                    let imagePath = queryParams?.imagepath;
                    imagePath = atob(queryParams?.imagepath);
                    let img = imagePath + a?.rd?.ThumbImagePath;
                    let arrofchunk = GetChunkData(chunkSize17, mainArr);
                    responseData.push({ data: a, additional: { length: length, clr: clr, dia: dia, f: f, img: img, misc: misc, total: total, pages: arrofchunk } });
                })
                setData(responseData);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (data?.length !== 0) {
            setTimeout(() => {
                window.print();
            }, 5000);
        }
    }, [data?.length]);



    console.log("TCL: data", data)

    const uniqueQualities = [
        ...new Set(
            data.flatMap(item =>
                item?.data?.rd1
                    ?.filter(rd1 => rd1.MasterManagement_DiamondStoneTypeid === 0)
                    ?.map(rd1 => rd1.Quality) || []
            )
        )
    ];

    console.log(uniqueQualities);

    const colorMap = {
        "NATURAL": "#215c98",
        "SINGLE CUT": "#47d359",
        "CVD": "#d86dcd",
        "HPHT": "#3c7e1f"
    };


    return (
        <>
            {
                data?.length === 0 ? <Loader /> : <><div className="print_btn"><button className="btn_white blue print_btn" onClick={(e) => handlePrint(e)}>
                    Print
                </button></div>
                    <div className='bag14Aflex pad_60_allPrint '>
                        <div className='dcf-page'>

                            {
                                data?.length > 0 && data?.map((e, i) => {

                                    const uniqueMaterialTypes = [
                                        ...new Set(
                                            (e?.data?.rd1 || [])
                                                .filter(item => item.MasterManagement_DiamondStoneTypeid === 3)
                                                .map(item => item.MaterialTypeName)
                                        )
                                    ];

                                    console.log(uniqueMaterialTypes);
                                    console.log("TCL: DiamondColourCodeForm -> e", e)
                                    const metalColor = e?.data?.rd?.MetalType?.split("-")

                                    const colorCodeString = e?.data?.rd?.MetalColorCo || ""; // e.g., "Yellow", "Y-W", "White-Rose", "R_W"

                                    // Split by '-' or '_' and remove empty strings
                                    const activeColors = colorCodeString.split(/[-_]/).filter(Boolean);
                                    const boxText = "18k";

                                    // Helper function to match the background color regardless of full word or shorthand letter
                                    const getBgColor = (code) => {
                                        const cleanCode = code.trim().toUpperCase();

                                        if (cleanCode.startsWith("Y")) return "#ffff00"; // Yellow
                                        if (cleanCode.startsWith("W")) return "#ffffff"; // White
                                        if (cleanCode.startsWith("R")) return "#b86b7b"; // Rose

                                        return 'white'; // Fallback gray
                                    };

                                    return (

                                        <div className='bagprint22' key={i}>
                                            <div style={{ width: '55%' }} className="dcf-wrapper">

                                                {/* Title bar */}
                                                <div className="dcf-row">
                                                    <div className="dcf-row" style={{ display: 'flex', position: 'relative', height: '16px' }}>
                                                        
                                                        
                                                                    <div
                                                                         
                                                                        style={{
                                                                            flex: 1,
                                                                            color: "black",
                                                                            fontWeight: "bold",
                                                                            textAlign: "center",
                                                                            background: `${e?.data?.rd?.prioritycolorcode}`,
                                                                            paddingTop: "2px"
                                                                        }}
                                                                    >
                                                                            {e?.data?.rd?.prioritycode}
                                                                         
                                                                    </div>
                                                             

                                                        {/* The centered title overlay */}
                                                        <div className="dcf-title-bar" style={{
                                                            position: 'absolute',
                                                            width: '100%',
                                                            height: '100%',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            color: 'white',
                                                            pointerEvents: 'none' // Ensures the text doesn't interfere with mouse clicks
                                                        }}>

                                                        </div>
                                                    </div>
                                                </div>

                                                {/* BAG NO row */}
                                                <div className="dcf-row">
                                                    <div className="dcf-cell dcf-label">Bag No.</div>
                                                    <div className="dcf-cell dcf-value-red" style={{fontSize: "12px"}}> {e?.data?.rd?.serialjobno}</div>

                                                    <div style={{ width: '50%', display: 'flex', justifyContent: "flex-end", gap: '2px' }}>
                                                        {activeColors.map((code, index) => (
                                                            <div
                                                                key={index}
                                                                className="dcf-cell dcf-karat"
                                                                style={{
                                                                    backgroundColor: getBgColor(code),
                                                                    border: '1px solid #000',
                                                                    padding: '2px 8px',
                                                                    minWidth: '35px',
                                                                    height: '24px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                {boxText}
                                                            </div>
                                                        ))}
                                                    </div>

                                                </div>

                                                {/* CUST CODE row 1 with barcode */}
                                                <div className="dcf-row">
                                                    <div className="dcf-cell dcf-label">Design Code</div>
                                                    <div className="dcf-cell dcf-value">{e?.data?.rd?.Designcode}</div>

                                                    <div className="dcf-cell dcf-barcode barcode_img" style={{ width: '50%' }}>
                                                        {e?.data?.rd?.serialjobno !==
                                                            (null || "" || undefined) && (
                                                                <BarcodeGenerator
                                                                    data={e?.data?.rd?.serialjobno}
                                                                />
                                                            )}
                                                    </div>
                                                </div>

                                                {/* CUST CODE row 2 */}
                                                <div className="dcf-row">
                                                    <div className="dcf-cell dcf-label">Cust Code</div>
                                                    <div className="dcf-cell dcf-value">{e?.data?.rd?.CustomerCode}</div>
                                                    <div className="dcf-cell dcf-spacer" style={{ fontSize: "12px", fontWeight: "bold", lineHeight: "1", color: "red" }}> {e?.data?.rd?.lineid}</div>
                                                </div>

                                                {/* Section header */}
                                                <div className="dcf-row">
                                                    <div className="dcf-section-header">DIAMOND DETAIL SUMMERY</div>
                                                </div>

                                                {/* Table header row 1 (group labels) */}
                                                <div className="dcf-row">
                                                    <div className="dcf-cell dcf-col-material"></div>
                                                    <div className="dcf-cell dcf-col-rmtype"></div>
                                                    <div className="dcf-cell dcf-col-rmshape"></div>
                                                    <div className="dcf-cell dcf-col-rmqty"></div>
                                                    <div className="dcf-cell dcf-col-sizegroup"></div>
                                                    <div className="dcf-cell dcf-col-rmsize"></div>
                                                    <div className="dcf-cell dcf-header-cell" style={{ flex: "0 0  14.34%" }}>Actual</div>
                                                    <div className="dcf-cell dcf-header-cell" style={{ flex: "0 0 13%" }}>Issue</div>
                                                </div>

                                                {/* Table header row 2 (column names) */}
                                                <div className="dcf-row" style={{ height: "13px" }}>
                                                    <div className="dcf-cell dcf-col-material dcf-header-cell">Material</div>
                                                    <div className="dcf-cell dcf-col-rmtype dcf-header-cell"> Type</div>
                                                    <div className="dcf-cell dcf-col-rmshape dcf-header-cell"> Shape</div>
                                                    <div className="dcf-cell dcf-col-rmqty dcf-header-cell"> Qty-Col.</div>
                                                    <div className="dcf-cell dcf-col-sizegroup dcf-header-cell">Size Group</div>
                                                    <div className="dcf-cell dcf-col-rmsize dcf-header-cell"> Size</div>
                                                    <div className="dcf-cell dcf-col-pcs dcf-header-cell">Pcs</div>
                                                    <div className="dcf-cell dcf-col-wt dcf-header-cell">Wt.</div>
                                                    <div className="dcf-cell dcf-col-pcs dcf-header-cell">Pcs</div>
                                                    <div className="dcf-cell dcf-col-wt dcf-header-cell">Wt.</div>
                                                </div>

                                                {/* Data row 1: Diamond Stone / GIA */}

                                                {(() => {
                                                    // 1. Get your actual array of data safely
                                                    const actualData = e?.additional?.pages[0]?.data || [];

                                                    // 2. Calculate how many dummy rows are needed to reach 18
                                                    const totalRowsWanted = 25;
                                                    const dummyCount = Math.max(0, totalRowsWanted - actualData.length);

                                                    // 3. Create an array of empty elements for the padding rows
                                                    const dummyRows = Array.from({ length: dummyCount });

                                                    // Define color mapping once outside the loop for cleaner style syntax
                                                    const colorMap = {
                                                        "Natural": "#215c98",
                                                        "SINGLE CUT": "#215c98",
                                                        "CVD": "#d86dcd",
                                                        "HPHT": "#3c7e1f",
                                                    };

                                                    return (
                                                        <>
                                                            {/* --- 1. RENDER ACTUAL DATA ROWS --- */}
                                                            {actualData.map((item, index) => {
                                                                console.log("TCL: DiamondColourCodeForm -> item", item);
                                                                return (
                                                                    <div className="dcf-row dcf-actual-issue-row" key={`actual-${index}`} style={{ height: "14px" }}>
                                                                        <div className="dcf-cell dcf-col-material  " style={{ fontWeight: "400" }}>
                                                                            {item?.MasterManagement_DiamondStoneTypeid == 3 ? "Dia." : "Stone"}
                                                                        </div>
                                                                        <div
                                                                            className="dcf-cell dcf-col-rmtype"
                                                                            style={{ lineHeight: "1", fontWeight: "400" }}

                                                                        >
                                                                            {item?.MaterialTypeName}
                                                                        </div>
                                                                        <div className="dcf-cell dcf-col-rmshape dcf-green-text" style={{ fontWeight: "400" }}>{item?.Shapecode}</div>
                                                                        <div style={{ lineHeight: "1", fontWeight: "400" }} className="dcf-cell dcf-col-rmqty dcf-green-text">{item?.QualityCode} - {item?.ColorCode}</div>
                                                                        <div style={{ lineHeight: "1", fontWeight: "400" }} className="dcf-cell dcf-col-sizegroup dcf-green-text">+00000-0000</div>
                                                                        <div style={{ lineHeight: "1", fontWeight: "400" }} className="dcf-cell dcf-col-rmsize dcf-blue-text">{item?.Sizename}</div>
                                                                        <div className="dcf-cell dcf-col-pcs" style={{ fontWeight: "400" }}>{item?.ActualPcs}</div>
                                                                        <div className="dcf-cell dcf-col-wt" style={{ fontWeight: "400" }}>{item?.ActualWeight?.toFixed(2)}</div>
                                                                        <div className="dcf-cell dcf-col-pcs" style={{ fontWeight: "400" }}>{item?.IssuePcs}</div>
                                                                        <div className="dcf-cell dcf-col-wt" style={{ fontWeight: "400" }}>{item?.IssueWeight}</div>
                                                                    </div>
                                                                );
                                                            })}

                                                            {/* --- 2. RENDER EMPTY DUMMY ROWS FOR PADDING --- */}
                                                            {dummyRows.map((_, index) => (
                                                                <div className="dcf-row dcf-actual-issue-row dummy-row" key={`dummy-${index}`} style={{ height: "14px" }}>
                                                                    <div className="dcf-cell dcf-col-material">&nbsp;</div>
                                                                    <div className="dcf-cell dcf-col-rmtype">&nbsp;</div>
                                                                    <div className="dcf-cell dcf-col-rmshape">&nbsp;</div>
                                                                    <div className="dcf-cell dcf-col-rmqty">&nbsp;</div>
                                                                    <div className="dcf-cell dcf-col-sizegroup">&nbsp;</div>
                                                                    <div className="dcf-cell dcf-col-rmsize">&nbsp;</div>
                                                                    <div className="dcf-cell dcf-col-pcs">&nbsp;</div>
                                                                    <div className="dcf-cell dcf-col-wt">&nbsp;</div>
                                                                    <div className="dcf-cell dcf-col-pcs">&nbsp;</div>
                                                                    <div className="dcf-cell dcf-col-wt">&nbsp;</div>
                                                                </div>
                                                            ))}
                                                        </>
                                                    );
                                                })()}







                                                {/* Instruction row */}
                                                <div className="dcf-row" style={{ borderBottom: "none" }}>
                                                    <div className="dcf-instruction-label">Instruction:</div>
                                                </div>
                                                <div className="dcf-row dcf-instruction-box"> {e?.data?.rd?.QuoteRemark}</div>

                                            </div>

                                            <div style={{ width: '45%' }} className="pcf-page">
                                                <div className="pcf-wrapper">

                                                    {/* Title bar */}
                                                    <div className="pcf-row">
                                                        {/* <div className="pcf-title-bar">Colour Code For Priority</div> */}
                                                        <div className="dcf-row" style={{ display: 'flex', position: 'relative', height: '16px' }}>
                                                            {/* The partitioned background segments */}
                                                            {uniqueMaterialTypes
                                                            
                                                            .filter(type => type && colorMap.hasOwnProperty(type.trim().toUpperCase()))
 
                                                            .map((type, index) => {
                                                                const upperType = type.trim().toUpperCase();

                                                                return (
                                                                    <div
                                                                        key={index}
                                                                        style={{
                                                                            flex: 1,
                                                                            color: "white",
                                                                            textAlign: "center",
                                                                            backgroundColor: colorMap[upperType],
                                                                            paddingTop: "2px"
                                                                        }}
                                                                    >
                                                                         
                                                                        {type}
                                                                    </div>
                                                                );
                                                            })
                                                        }

                                                            {/* The centered title overlay */}
                                                            <div className="dcf-title-bar" style={{
                                                                position: 'absolute',
                                                                width: '100%',
                                                                height: '100%',
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                color: 'white',
                                                                pointerEvents: 'none' // Ensures the text doesn't interfere with mouse clicks
                                                            }}>

                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Top info block: left form + right barcode/image/karat */}
                                                    <div className="pcf-header-block">

                                                        {/* LEFT: form fields */}
                                                        <div className="pcf-header-left">
                                                            <div className="pcf-info-row">
                                                                <div className="pcf-info-label">Bag No.</div>
                                                                <div className="pcf-info-value-red" style={{fontSize: "12px"}}>{e?.data?.rd?.serialjobno}</div>
                                                                <div className="pcf-info-label2"> </div>
                                                                <div className="pcf-info-value2"> </div>
                                                            </div>

                                                            <div className="pcf-info-row">
                                                                <div className="pcf-info-label">Order Date</div>
                                                                <div className="pcf-info-value"> {e?.data?.rd?.OrderDate}</div>
                                                                <div className="pcf-info-label2">Design</div>
                                                                <div className="pcf-info-value2"> {e?.data?.rd?.Designcode}</div>
                                                            </div>

                                                            <div className="pcf-info-row">
                                                                <div className="pcf-info-label">Due Date </div>
                                                                <div className="pcf-info-value"> {e?.data?.rd?.promisedate}</div>
                                                                <div className="pcf-info-label2">Dia. Wt.</div>
                                                                <div className="pcf-info-value2"> {e?.additional?.dia?.ActualWeight?.toFixed(2)}</div>
                                                            </div>

                                                            <div className="pcf-info-row">
                                                                <div className="pcf-info-label">Cust Code </div>
                                                                <div className="pcf-info-value">{e?.data?.rd?.CustomerCode}</div>
                                                                <div className="pcf-info-label2">Dia. Pcs.</div>
                                                                <div className="pcf-info-value2">{e?.additional?.dia?.ActualPcs}</div>
                                                            </div>

                                                            <div className="pcf-info-row">
                                                                <div className="pcf-info-label">Order No </div>
                                                                <div className="pcf-info-value">{e?.data?.rd?.OrderNo}</div>
                                                                <div className="pcf-info-label2">Gold Wt</div>
                                                                <div className="pcf-info-value2">{e?.data?.rd?.netwt?.toFixed(2)}</div>
                                                            </div>

                                                            <div className="pcf-info-row">
                                                                <div className="pcf-info-label" style={{ flex: "0 0 50%" }}>Category </div>
                                                                <div className="pcf-info-value-wide" style={{ flex: "0 0 50%" }}>{e?.data?.rd?.category}</div>
                                                            </div>

                                                            <div className="pcf-info-row">
                                                                <div className="pcf-info-label" style={{ flex: "0 0 50%" }}>Design Master Size </div>
                                                                <div className="pcf-info-value-wide" style={{ flex: "0 0 50%" }}>{e?.data?.rd?.DefaultSize}</div>
                                                            </div>

                                                            <div className="pcf-info-row">
                                                                <div className="pcf-info-label" style={{ flex: "0 0 50%" }}>Order Size </div>
                                                                <div className="pcf-info-value-wide" style={{ flex: "0 0 50%" }}> {e?.data?.rd?.Size}</div>
                                                            </div>
                                                            <div className="pcf-info-row">
                                                                <div className="pcf-info-label" style={{ height: "14px", flex: "0 0 50%", fontSize: "10px", color: "red", lineHeight: "1" }}>{e?.data?.rd?.lineid} </div>
                                                                <div className="pcf-info-value-wide" style={{ flex: "0 0 50%" }}> </div>
                                                            </div>
                                                        </div>

                                                        {/* RIGHT: barcode / image / karat boxes */}
                                                        <div className="pcf-header-right">
                                                            <div className="pcf-barcode-row barcode_img">
                                                                {e?.data?.rd?.serialjobno !==
                                                                    (null || "" || undefined) && (
                                                                        <BarcodeGenerator
                                                                            data={e?.data?.rd?.serialjobno}
                                                                        />
                                                                    )}
                                                            </div>
                                                            <div className="pcf-image-box">
                                                                <img

                                                                    src={
                                                                        e?.data?.rd?.DesignImage !== ''
                                                                            ? e?.data?.rd?.DesignImage
                                                                            : require("../../assets/img/default.jpg")
                                                                    } />
                                                            </div>
                                                            <div className="pcf-karat-row" style={{ justifyContent: 'end' }}>
                                                                {activeColors.map((code, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className="dcf-cell dcf-karat"
                                                                        style={{
                                                                            backgroundColor: getBgColor(code),
                                                                            border: '1px solid #000',
                                                                            padding: '3px',

                                                                            flex: "0 0 33px",
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}
                                                                    >
                                                                        {boxText}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Department table header */}
                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-table-header-cell">Department</div>
                                                        <div className="pcf-cell pcf-col-wrkr pcf-table-header-cell">WrKr</div>
                                                        <div className="pcf-cell pcf-col-inwt pcf-table-header-cell">IN WT.</div>
                                                        <div className="pcf-cell pcf-col-outwt pcf-table-header-cell">OUT WT.</div>
                                                        <div className="pcf-cell pcf-col-scrap pcf-table-header-cell">Scrap</div>
                                                        <div className="pcf-cell pcf-col-dust pcf-table-header-cell">DUST</div>
                                                        <div className="pcf-cell pcf-col-qcsign pcf-table-header-cell">QC SIGN.</div>
                                                    </div>

                                                    {/* Department rows */}
                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">WAXING</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">CASTING</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">FILLING</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">ELE. POLISH</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">PRE. POLISH</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">LIGHT POL.</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">SETTING</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">FITTING</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                     
                                                    <div className="pcf-row pcf-empty-row">
                                                        <div className="pcf-cell pcf-col-dept"></div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">FIN. POLISH</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">FINAL QC</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">RHODIUM</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">CHILAI</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">MINA</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                    {/* blank spacer row before final weight */}
                                                    <div className="pcf-row pcf-empty-row">
                                                        <div className="pcf-cell pcf-col-dept"></div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                    {/* FINAL WEIGHT row */}
                                                    <div className="pcf-row pcf-final-weight-row">
                                                        <div className="pcf-cell pcf-col-dept"></div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap pcf-final-weight-text">Final WT.</div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                    {/* Engraving Detail row */}
                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name" style={{
                                                            lineHeight: 1,fontSize:"7px"
                                                        }}>Engraving <br /> Detail :</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>

                                                        <div className="pcf-cell pcf-col-scrap pcf-sign-text" style={{ flex: "0 0 26%", lineHeight: 1,fontSize:"7px",wordBreak:"break-word" }}>DIAMOND QULITY CHECKING SIGN</div>

                                                        <div className="pcf-cell pcf-col-qcsign pcf-sign-text" style={{ flex: "0 0 26%", lineHeight: 1,fontSize:"7px",wordBreak:"break-word" }}>PRODU. MANAGER CHECKING SIGN</div>
                                                    </div>

                                                    {/* Customer Logo row */}
                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name" style={{ flex: "0 0 30.5%", }}>Customer Logo :</div>
                                                        <div className="pcf-cell pcf-col-wrkr">
                                                            <div className="pcf-checkbox"> </div>
                                                        </div>

                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                        <div className="pcf-cell pcf-col-dust"></div>
                                                        <div className="pcf-cell pcf-col-qcsign"></div>
                                                    </div>

                                                    {/* Instruction */}
                                                    <div className="pcf-row" style={{ borderBottom: "none" }}>
                                                        <div className="pcf-instruction-label" >Instruction:</div>
                                                    </div>
                                                    <div className="pcf-row pcf-instruction-box"> {e?.data?.rd?.QuoteRemark}</div>

                                                </div>
                                            </div>

                                        </div>








                                    );
                                })
                            }

                        </div>
                    </div>
                </>
            }

        </>
    )



}