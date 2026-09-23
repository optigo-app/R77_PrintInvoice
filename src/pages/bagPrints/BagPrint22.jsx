import React from 'react';
import "../../assets/css/bagprint/bagprint22.css";
import queryString from 'query-string';
import { useEffect } from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { GetData } from '../../GlobalFunctions/GetData';
import { handlePrint } from '../../GlobalFunctions/HandlePrint';
import BarcodeGenerator from '../../components/BarcodeGenerator';
import Loader from '../../components/Loader';
import { organizeData } from '../../GlobalFunctions/OrganizeBagPrintData';
import { GetChunkData } from './../../GlobalFunctions/GetChunkData';
import { GetUniquejob } from '../../GlobalFunctions/GetUniqueJob';


export default function DiamondColourCodeForm({ queries, headers }) {
    const [data, setData] = useState([]);
    console.log("TCL: DiamondColourCodeForm -> data", data)
    const location = useLocation();
    const queryParams = queryString.parse(location?.search);
    const resultString = GetUniquejob(queryParams?.str_srjobno);
    const [rd2Data, setRd2Data] = useState([]);
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
                setRd2Data(allDatas?.rd2 || []);
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

    // useEffect(() => {
    //     if (data?.length !== 0) {
    //         setTimeout(() => {
    //             window.print();
    //         }, 5000);
    //     }
    // }, [data?.length]);

    const uniqueQualities = [
        ...new Set(
            data.flatMap(item =>
                item?.data?.rd1
                    ?.filter(rd1 => rd1.MasterManagement_DiamondStoneTypeid === 0)
                    ?.map(rd1 => rd1.Quality) || []
            )
        )
    ];

    const colorMap = {
        "NATURAL": "#215c98",
        "SINGLE CUT": "#47d359",
        "CVD": "#d86dcd",
        "HPHT": "#3c7e1f"
    };

    function getJobWiseMetalData(jobno, list = rd2Data) {
        return list.find(item => item.serialjobno === jobno) || null;
    }



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
                                    // const activeColors = colorCodeString.split(/[-_]/).filter(Boolean);
                                    const activeColors = getJobWiseMetalData(e?.data?.rd?.serialjobno)?.MetalColor?.split(/[-_]/).filter(Boolean);
                                    // const boxText = e?.data?.rd?.MetalType?.split(" ")[1];
                                    const boxText = getJobWiseMetalData(e?.data?.rd?.serialjobno)?.Metal_Type_Color?.split(" ")[1] || "";

                                    const MultimetalColor = getJobWiseMetalData(e?.data?.rd?.serialjobno)?.MetalColor || "";

                                    // Helper function to match the background color regardless of full word or shorthand letter
                                    const getBgColor = (code) => {
                                        const cleanCode = code.trim().toUpperCase();

                                        if (cleanCode.startsWith("Y")) return "#ffff00"; // Yellow
                                        if (cleanCode.startsWith("W")) return "#ffffff"; // White
                                        if (cleanCode.startsWith("R")) return "#b86b7b"; // Rose

                                        return 'white'; // Fallback gray
                                    };

                                    const jobWiseMetalData = getJobWiseMetalData(e?.data?.rd?.serialjobno);


                                    const totalRowsWanted = 21;
                                    const allActualData = (e?.data?.rd1 || []).filter(
                                        (item) => item.MasterManagement_DiamondStoneTypeid !== 0
                                    );

                                    const rowChunks = [];
                                    for (let ci = 0; ci < allActualData.length; ci += totalRowsWanted) {
                                        rowChunks.push(allActualData.slice(ci, ci + totalRowsWanted));
                                    }
                                    if (rowChunks.length === 0) rowChunks.push([]);

                                    // ---------- reusable dcf-wrapper card (unchanged styling/markup) ----------
                                    const renderDcfWrapper = (chunkRows, cardKey, isFirstPageOfJob) => {
                                         
                                        const dummyCount = Math.max(
                                            0,
                                            totalRowsWanted - chunkRows.length
                                        );
                                        const dummyRows = Array.from({ length: dummyCount });

                                        return (
                                            <div className="dcf-wrapper" key={cardKey}>
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

                                                {/* BAG NO row */}
                                                <div className="dcf-row">
                                                    <div className="dcf-cell dcf-label">Bag No.</div>
                                                    <div className="dcf-cell dcf-value-red" style={{ fontSize: "12px", color: "red" }}> {e?.data?.rd?.serialjobno}</div>

                                                    <div style={{ width: '50%', display: 'flex', justifyContent: "flex-end", gap: '2px' }}>
                                                        {activeColors?.map((code, index) => (
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
                                                    <div className="dcf-cell dcf-header-cell" style={{ flex: "0 0  13.1%" }}>Actual</div>
                                                    <div className="dcf-cell dcf-header-cell" style={{ flex: "0 0 13%" }}>Issue</div>
                                                </div>

                                                {/* Table header row 2 (column names) */}
                                                <div className="dcf-row" style={{ height: "15px" }}>
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

                                                
                                                {/* Actual data rows for this chunk */}
                                                {chunkRows.map((item, index) => (
                                                    <div className="dcf-row dcf-actual-issue-row" key={`actual-${cardKey}-${index}`} style={{ height: "16px" }}>
                                                        <div className="dcf-cell dcf-col-material lineHeight1 " style={{ fontWeight: "400" }}>
                                                            {
                                                                item?.MasterManagement_DiamondStoneTypeid == 3
                                                                    ? "Dia."
                                                                    : item?.MasterManagement_DiamondStoneTypeid == 7
                                                                        ? "Misc"
                                                                        : item?.MasterManagement_DiamondStoneTypeid == 5
                                                                            ? "Finding"
                                                                            : item?.MasterManagement_DiamondStoneTypeid == 4
                                                                                ? "Stone"
                                                                                : ""
                                                            }
                                                        </div>
                                                        <div
                                                            className="dcf-cell dcf-col-rmtype lineHeight1"
                                                            style={{ fontWeight: "400" }}

                                                        >
                                                            {item?.MaterialTypeName}
                                                        </div>
                                                        <div className="dcf-cell dcf-col-rmshape dcf-green-text lineHeight1" style={{ fontWeight: "400", }}>{item?.Shapecode}</div>
                                                        <div style={{ fontWeight: "400" }} className="dcf-cell dcf-col-rmqty dcf-green-text lineHeight1">{item?.QualityCode} - {item?.ColorCode}</div>
                                                        <div style={{ fontWeight: "400" }} className="dcf-cell dcf-col-sizegroup dcf-green-text lineHeight1">{item?.GroupName}</div>
                                                        <div style={{ fontWeight: "400" }} className="dcf-cell dcf-col-rmsize dcf-blue-text lineHeight1">{item?.Sizename}</div>
                                                        <div className="dcf-cell dcf-col-pcs lineHeight1" style={{ fontWeight: "400" }}>{item?.ActualPcs}</div>
                                                        <div className="dcf-cell dcf-col-wt lineHeight1" style={{ fontWeight: "400" }}>{item?.ActualWeight?.toFixed(2)}</div>
                                                        <div className="dcf-cell dcf-col-pcs lineHeight1" style={{ fontWeight: "400" }}> </div>
                                                        <div className="dcf-cell dcf-col-wt lineHeight1" style={{ fontWeight: "400" }}> </div>
                                                    </div>
                                                ))}

                                                {/* Dummy padding rows */}
                                                {dummyRows.map((_, index) => (
                                                    <div className="dcf-row dcf-actual-issue-row dummy-row" key={`dummy-${cardKey}-${index}`} style={{ height: "16px" }}>
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

                                                {/* Instruction row */}
                                                <div className="dcf-row dcf-instruction-box" style={{ borderBottom: "none", lineHeight: "1.2" }}>
                                                    <div className="dcf-instruction-label"><span>Instruction : </span>

                                                        <span

                                                            className=''
                                                            style={{ fontSize: "8px", lineHeight: "9px" }}
                                                            dangerouslySetInnerHTML={{
                                                                __html:
                                                                    e?.data?.rd?.ProductInstructionfull?.length > 530
                                                                        ? `${e.data.rd.ProductInstructionfull.slice(0, 530)}...`
                                                                        : e?.data?.rd?.ProductInstructionfull ||
                                                                        e?.data?.rd?.QuoteRemark ||
                                                                        "",
                                                            }}
                                                        />
                                                    </div>

                                                </div>
                                            </div>
                                        );
                                    };

                                    // ---------- reusable pcf-page/pcf-wrapper card (your ORIGINAL markup, unchanged, real data) ----------
                                    // ---------- reusable pcf-page/pcf-wrapper card ----------
                                    const renderPcfWrapper = (cardKey) => {

                                        const uniqueRd2Data = Object.values(
                                            rd2Data.reduce((acc, curr) => {
                                                if (!acc[curr.serialjobno]) {
                                                    acc[curr.serialjobno] = { ...curr };
                                                } else {
                                                    acc[curr.serialjobno].FinalWt = (acc[curr.serialjobno].FinalWt || 0) + (curr.FinalWt || 0);
                                                }
                                                return acc;
                                            }, {})
                                        );

                                        const getBaseJobNo = (jobno) => {
                                            if (!jobno) return jobno;
                                            return jobno.replace(/S\d+$/i, '');
                                        };

                                        const currentJobNo = e?.data?.rd?.serialjobno;
                                        const isBaseJob = !/S\d+$/i.test(currentJobNo || '');
                                        const currentBase = getBaseJobNo(currentJobNo);

                                        const rd2RowsForThisCard = isBaseJob
                                            ? uniqueRd2Data.filter(r => getBaseJobNo(r?.serialjobno) === currentBase)
                                            : uniqueRd2Data.filter(r => r?.serialjobno === currentJobNo);

                                        // Common (base) job -> same rows as the DCF card (family rows without the base total row)
                                        // Split jobs S1/S2/S3 -> nothing, so it shows only on the common job
                                        const pcfMetalRows = isBaseJob ? rd2RowsForThisCard.slice(1) : [];

                                        return (
                                            <div className="pcf-page" key={cardKey}>
                                                <div className="pcf-wrapper">
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

                                                    {/* Top info block: left form + right barcode/image/karat */}
                                                    <div className="pcf-header-block">

                                                        {/* LEFT: form fields */}
                                                        <div className="pcf-header-left">
                                                            <div className="pcf-info-row">
                                                                <div className="pcf-info-label">Qty- {e?.data?.rd?.IsSplits_Quotation_Quantity} </div>
                                                                <div className="pcf-info-value-red" style={{ fontSize: "12px", lineHeight: "1", color: "red" }}>{e?.data?.rd?.serialjobno}</div>
                                                                <div className="pcf-info-label2" style={{ flex: "0 0 40%", borderRight: "none", textAlign: "center", justifyContent: "center", fontWeight: "bold" }}> Design Code. </div>
                                                            </div>

                                                            <div className="pcf-info-row">
                                                                <div className="pcf-info-label">Order Date</div>
                                                                <div className="pcf-info-value"> {e?.data?.rd?.OrderDate}</div>
                                                                <div className="pcf-info-label2" style={{ flex: "0 0 40%", borderRight: "none", textAlign: "center", justifyContent: "center" }}>{e?.data?.rd?.Designcode}</div>
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
                                                                <div className="pcf-info-label2">{/S\d+$/.test(jobWiseMetalData?.serialjobno) ? jobWiseMetalData?.Metal_Type_Color?.substring(0, 4) : "Metal"}  Wt</div>
                                                                <div className="pcf-info-value2">{jobWiseMetalData?.FinalWt?.toFixed(2)}</div>
                                                            </div>

                                                            <div className="pcf-info-row">
                                                                <div className="pcf-info-label" style={{ flex: "0 0 50%" }}>Category </div>
                                                                <div className="pcf-info-value-wide" style={{ flex: "0 0 50%" }}>{e?.data?.rd?.category}</div>
                                                            </div>

                                                            <div className="pcf-info-row">
                                                                <div className="pcf-info-label" style={{ flex: "0 0 50%" }}>Order Size </div>
                                                                <div className="pcf-info-value-wide" style={{ flex: "0 0 50%" }}> {e?.data?.rd?.Size}</div>
                                                            </div>
                                                            <div className="pcf-info-row">
                                                                <div className="pcf-info-label" style={{ flex: "0 0 50%" }}>Customer Logo
                                                                    <input
                                                                        type="checkbox"
                                                                        id="imghideshow"
                                                                        className="mx-1"
                                                                        checked={e?.data?.rd?.Ustamping}
                                                                    />
                                                                </div>
                                                                <div className="pcf-info-value-wide" style={{ flex: "0 0 50%" }}></div>
                                                            </div>
                                                            <div className="pcf-info-row">
                                                                <div className="pcf-info-label" style={{ height: "14px", flex: "0 0 50%", fontSize: "10px", color: "red", lineHeight: "1" }}>{e?.data?.rd?.lineid} </div>
                                                                <div className="pcf-info-value-wide" style={{ flex: "0 0 50%" }}> {MultimetalColor}</div>
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
                                                                {activeColors?.map((code, index) => (
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
                                                        <div className="pcf-cell pcf-col-wrkr pcf-table-header-cell">IN WT.</div>
                                                        <div className="pcf-cell pcf-col-inwt pcf-table-header-cell">Scrap</div>
                                                        <div className="pcf-cell pcf-col-outwt pcf-table-header-cell">QC Sign.</div>
                                                        <div className="pcf-cell pcf-col-scrap pcf-table-header-cell"></div>

                                                    </div>

                                                    {/* Department rows */}
                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">WAXING</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap">{pcfMetalRows?.[0]?.Metal_Type_Color}</div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">CASTING</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap">{pcfMetalRows?.[1]?.Metal_Type_Color}</div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">FILLING</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap">{pcfMetalRows?.[2]?.Metal_Type_Color}</div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">ELE. POLISH</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap">{pcfMetalRows?.[3]?.Metal_Type_Color}</div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">PRE. POLISH</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap">{pcfMetalRows?.[4]?.Metal_Type_Color}</div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">LIGHT POL.</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap">{pcfMetalRows?.[5]?.Metal_Type_Color}</div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">SETTING</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap">{pcfMetalRows?.[6]?.Metal_Type_Color}</div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">FITTING</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap">{pcfMetalRows?.[7]?.Metal_Type_Color}</div>
                                                    </div>

                                                    <div className="pcf-row pcf-empty-row">
                                                        <div className="pcf-cell pcf-col-dept"></div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap">Batch No</div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">FIN. POLISH</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">FINAL QC</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">RHODIUM</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">CHILAI</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                    </div>

                                                    <div className="pcf-row">
                                                        <div className="pcf-cell pcf-col-dept pcf-dept-name">MINA</div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"></div>
                                                    </div>

                                                    {/* blank spacer row before final weight */}
                                                    <div className="pcf-row pcf-empty-row">
                                                        <div className="pcf-cell pcf-col-dept"></div>
                                                        <div className="pcf-cell pcf-col-wrkr"></div>
                                                        <div className="pcf-cell pcf-col-inwt"></div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap"><b>Final Wt.</b></div>
                                                    </div>

                                                    {/* Instruction */}
                                                    <div className="dcf-row" style={{ borderBottom: "none", lineHeight: "1.2" }}>
                                                        <div className="dcf-instruction-label dcf-instruction-box"> <span>Instruction : </span>
                                                            <span
                                                                style={{ fontSize: "8px", lineHeight: "9px" }}
                                                                dangerouslySetInnerHTML={{
                                                                    __html:
                                                                        e?.data?.rd?.ProductInstructionfull?.length > 530
                                                                            ? `${e.data.rd.ProductInstructionfull.slice(0, 530)}...`
                                                                            : e?.data?.rd?.ProductInstructionfull ||
                                                                            e?.data?.rd?.QuoteRemark ||
                                                                            "",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    };

                                    // ---------- ALL dcf-wrapper cards first, pcf-page LAST, 2 per bagprint22 row ----------
                                    const allCards = [
                                        // ...rowChunks.map((chunk, idx) => renderDcfWrapper(chunk, `${i}-dcf-${idx}`)),
                                        ...rowChunks.map((chunk, idx) => renderDcfWrapper(chunk, `${i}-dcf-${idx}`, i === 0)),
                                        renderPcfWrapper(`${i}-pcf`),
                                    ];

                                    const cardRows = [];
                                    for (let p = 0; p < allCards.length; p += 2) {
                                        cardRows.push(
                                            <div className='bagprint22' key={`row-${i}-${p}`}>
                                                {allCards[p]}
                                                {allCards[p + 1] ? allCards[p + 1] : <div className="dcf-wrapper" style={{ visibility: 'hidden' }}></div>}
                                            </div>
                                        );
                                    }

                                    return (
                                        <React.Fragment key={i}>
                                            {cardRows}
                                        </React.Fragment>
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