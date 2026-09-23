import React from 'react';
import "../../assets/css/bagprint/bagprint22A.css";
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
    const [rd2Data, setRd2Data] = useState([]);
    const [rd3Data, setRd3Data] = useState([]);
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

                console.log("TCL: fetchData -> allDatas ", allDatas)
                setRd2Data(allDatas?.rd2 || []);
                setRd3Data(allDatas?.rd3 || []);
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


    function getJobWiseMetalData(jobno, list = rd2Data) {
        return list.find(item => item.serialjobno === jobno) || null;
    }


    console.log("TCL: DiamondColourCodeForm -> rd3Data", rd3Data)

    const RecastaJobNo = (job) => {
        return rd3Data?.find(item => item?.SerialJobno === job)?.recastjobno || "";

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

                                    const colorCodeString = e?.data?.rd?.MetalColorCo || "";

                                    const activeColors = getJobWiseMetalData(e?.data?.rd?.serialjobno)?.MetalColor?.split(/[-_]/).filter(Boolean);

                                    const boxText = getJobWiseMetalData(e?.data?.rd?.serialjobno)?.Metal_Type_Color?.split(" ")[1]

                                    const MultimetalColor = getJobWiseMetalData(e?.data?.rd?.serialjobno)?.MetalColor || "";

                                    const getBgColor = (code) => {
                                        const cleanCode = code.trim().toUpperCase();

                                        if (cleanCode.startsWith("Y")) return "#ffff00";
                                        if (cleanCode.startsWith("W")) return "#ffffff";
                                        if (cleanCode.startsWith("R")) return "#b86b7b";

                                        return 'white'; // Fallback gray
                                    };

                                    const jobWiseMetalData = getJobWiseMetalData(e?.data?.rd?.serialjobno);

                                    // ---------- split diamond rows into chunks of 21 ----------
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
                                            totalRowsWanted -  chunkRows.length
                                        );
                                        const dummyRows = Array.from({ length: dummyCount });


                                        return (
                                            <div style={{ width: '50%' }} className="dcf-wrapper" key={cardKey}>

                                                {/* Title bar */}
                                                <div className="dcf-row">
                                                    <div className="dcf-row" style={{ display: 'flex', position: 'relative', height: '16px' }}>

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

                                                        <div className="dcf-title-bar" style={{
                                                            position: 'absolute',
                                                            width: '100%',
                                                            height: '100%',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            color: 'white',
                                                            pointerEvents: 'none'
                                                        }}>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* BAG NO row */}
                                                <div className="dcf-row">
                                                    <div className="dcf-cell dcf-label">Bag No.</div>
                                                    <div className="dcf-cell dcf-value-red" style={{ fontSize: "12px", color: "red" }}> {rd3Data?.find(item => item?.serialjobno === e?.data?.rd?.serialjobno)?.recastjobno || e?.data?.rd?.serialjobno}</div>

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
                                                                    // data={e?.data?.rd?.serialjobno}
                                                                    data={rd3Data?.find(item => item?.serialjobno === e?.data?.rd?.serialjobno)?.recastjobno ||
                                                                        "abc"
                                                                    }
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

                                                    <div className="dcf-cell dcf-header-cell" style={{ flex: "0 0  13%" }}>Actual</div>
                                                    <div className="dcf-cell dcf-header-cell" style={{ flex: "0 0 13%" }}>Issue</div>
                                                </div>

                                                {/* Table header row 2 (column names) */}
                                                <div className="dcf-row" style={{ height: "13px" }}>
                                                    <div className="dcf-cell dcf-col-material dcf-header-cell lineHeight1">Material</div>
                                                    <div className="dcf-cell dcf-col-rmtype dcf-header-cell lineHeight1"> Type</div>
                                                    <div className="dcf-cell dcf-col-rmshape dcf-header-cell lineHeight1"> Material Details</div>

                                                    <div className="dcf-cell dcf-col-pcs dcf-header-cell">Pcs</div>
                                                    <div className="dcf-cell dcf-col-wt dcf-header-cell">Wt.</div>
                                                    <div className="dcf-cell dcf-col-pcs dcf-header-cell">Pcs</div>
                                                    <div className="dcf-cell dcf-col-wt dcf-header-cell">Wt.</div>
                                                </div>

                                                {/* RD2 metal rows — now OUTSIDE chunkRows.map, so it renders even when chunkRows is empty */}
                                                {/* { isFirstPageOfJob && uniqueRd2Data?.length > 0 && (
                                                    uniqueRd2Data.map((rd2Item, rd2Index) => (
                                                        <div className="dcf-row dcf-actual-issue-row" key={`rd2-${cardKey}-${rd2Index}`} style={{ height: "16px" }}>
                                                            <div className="dcf-cell dcf-col-material lineHeight1" style={{ fontWeight: "400" }}>metal</div>
                                                            <div className="dcf-cell dcf-col-rmtype lineHeight1" style={{ fontWeight: "400" }}></div>
                                                            <div className="dcf-cell dcf-col-rmshape dcf-green-text lineHeight1" style={{ fontWeight: "400" }}>
                                                                {rd2Item?.Metal_Type_Color}
                                                            </div>
                                                            <div className="dcf-cell dcf-col-pcs lineHeight1" style={{ fontWeight: "400" }}> </div>
                                                            <div className="dcf-cell dcf-col-wt lineHeight1" style={{ fontWeight: "400" }}>{rd2Item?.FinalWt?.toFixed(2)}</div>
                                                            <div className="dcf-cell dcf-col-pcs lineHeight1" style={{ fontWeight: "400" }}> </div>
                                                            <div className="dcf-cell dcf-col-wt lineHeight1" style={{ fontWeight: "400" }}> </div>
                                                        </div>
                                                    ))
                                                )} */}
                                                {/* RD2 metal rows — matched by serialjobno, shown once on the first page of each job */}
                                                {/* RD2 metal rows — base job shows whole family, split job shows only itself */}
                                                 

                                                {chunkRows.map((item, index) => (
                                                    <React.Fragment key={`chunk-${cardKey}-${index}`}>
                                                        {/* Actual Issue Row */}
                                                        <div className="dcf-row dcf-actual-issue-row" style={{ height: "16px" }}>
                                                            <div className="dcf-cell dcf-col-material lineHeight1" style={{ fontWeight: "400" }}>
                                                                {item?.MasterManagement_DiamondStoneTypeid === 3 ? "Dia." :
                                                                    item?.MasterManagement_DiamondStoneTypeid === 7 ? "Misc" :
                                                                        item?.MasterManagement_DiamondStoneTypeid === 5 ? "Finding" :
                                                                            item?.MasterManagement_DiamondStoneTypeid === 4 ? "Stone" : ""}
                                                            </div>
                                                            <div className="dcf-cell dcf-col-rmtype lineHeight1" style={{ fontWeight: "400" }}>
                                                                {item?.MaterialTypeName}
                                                            </div>
                                                            <div className="dcf-cell dcf-col-rmshape dcf-green-text lineHeight1" style={{ fontWeight: "400" }}>
                                                                {item?.MasterManagement_DiamondStoneTypeid === 5
                                                                    ? item?.ConcatedFullShapeQualityColorName
                                                                    : [
                                                                        item?.Shapecode,
                                                                        item?.QualityCode && `${item.QualityCode}${item?.ColorCode ? ` - ${item.ColorCode}` : ""}`,
                                                                        item?.GroupName,
                                                                        item?.Sizename
                                                                    ].filter(Boolean).join(" | ")}
                                                            </div>
                                                            <div className="dcf-cell dcf-col-pcs lineHeight1" style={{ fontWeight: "400" }}>{item?.ActualPcs}</div>
                                                            <div className="dcf-cell dcf-col-wt lineHeight1" style={{ fontWeight: "400" }}>{item?.ActualWeight?.toFixed(2)}</div>
                                                            <div className="dcf-cell dcf-col-pcs lineHeight1" style={{ fontWeight: "400" }}> </div>
                                                            <div className="dcf-cell dcf-col-wt lineHeight1" style={{ fontWeight: "400" }}> </div>
                                                        </div>


                                                    </React.Fragment>
                                                ))}



                                                {/* Dummy padding rows */}
                                                {dummyRows.map((_, index) => (
                                                    <div className="dcf-row dcf-actual-issue-row dummy-row" key={`dummy-${cardKey}-${index}`} style={{ height: "16px" }}>
                                                        <div className="dcf-cell dcf-col-material">&nbsp;</div>
                                                        <div className="dcf-cell dcf-col-rmtype">&nbsp;</div>
                                                        <div className="dcf-cell dcf-col-rmshape">&nbsp;</div>

                                                        <div className="dcf-cell dcf-col-pcs">&nbsp;</div>
                                                        <div className="dcf-cell dcf-col-wt">&nbsp;</div>
                                                        <div className="dcf-cell dcf-col-pcs">&nbsp;</div>
                                                        <div className="dcf-cell dcf-col-wt">&nbsp;</div>
                                                    </div>
                                                ))}

                                                {/* Instruction row */}
                                                <div className="dcf-row dcf-instruction-box" style={{ padding: "4px 6px", lineHeight: "1.2" }}>
                                                    <div className="dcf-instruction-label" style={{ padding: '0px' }}>
                                                        <span style={{ fontWeight: "bold" }}>Instruction : </span>
                                                        <span
                                                            dangerouslySetInnerHTML={{
                                                                __html:
                                                                    e?.data?.rd?.ProductInstructionfull?.length > 300
                                                                        ? `${e.data.rd.ProductInstructionfull.slice(0, 300)}...`
                                                                        : e?.data?.rd?.ProductInstructionfull
                                                                        ||
                                                                        e?.data?.rd?.QuoteRemark ||
                                                                        "",
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                        );
                                    };

                                    // ---------- reusable pcf-wrapper card (your ORIGINAL markup, unchanged, now real data) ----------
                                    // ---------- reusable pcf-wrapper card ----------
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

                                        // Base (common) job  -> same rows as the DCF card (family rows, without the base total row)
                                        // Split jobs S1/S2/S3 -> nothing, so it shows only on the common job
                                        const pcfMetalRows = isBaseJob ? rd2RowsForThisCard.slice(1) : [];

                                        return (
                                            <div style={{ width: '50%' }} className="pcf-page" key={cardKey}>
                                                <div className="pcf-wrapper">

                                                    {/* Title bar */}
                                                    <div className="pcf-row">
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

                                                            <div className="dcf-title-bar" style={{
                                                                position: 'absolute',
                                                                width: '100%',
                                                                height: '100%',
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                color: 'white',
                                                                pointerEvents: 'none'
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
                                                                <div className="pcf-info-value-red" style={{ fontSize: "12px", color: "red" }}>{rd3Data?.find(item => item?.serialjobno === e?.data?.rd?.serialjobno)?.recastjobno || e?.data?.rd?.serialjobno}</div>
                                                                <div className="pcf-info-label2" style={{ flex: " 0 0 40%", borderRight: "none", justifyContent: "center" }}> Design Code</div>
                                                            </div>

                                                            <div className="pcf-info-row">
                                                                <div className="pcf-info-label">Order Date</div>
                                                                <div className="pcf-info-value"> {e?.data?.rd?.OrderDate}</div>

                                                                <div className="pcf-info-value2" style={{ flex: " 0 0 40%", borderRight: "none", justifyContent: "center" }}> {e?.data?.rd?.Designcode}</div>
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
                                                                <div className="pcf-info-value-wide" style={{ flex: "0 0 50%", lineHeight: "1" }}> {MultimetalColor}</div>
                                                            </div>
                                                        </div>

                                                        {/* RIGHT: barcode / image / karat boxes */}
                                                        <div className="pcf-header-right">
                                                            <div className="pcf-barcode-row pcf-barcode_img">
                                                                {e?.data?.rd?.serialjobno !==
                                                                    (null || "" || undefined) && (
                                                                        <BarcodeGenerator
                                                                            data={rd3Data?.find(item => item?.serialjobno === e?.data?.rd?.serialjobno)?.recastjobno || e?.data?.rd?.serialjobno}
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
                                                        <div className="pcf-cell pcf-col-wrkr pcf-table-header-cell">IN Wt.</div>
                                                        <div className="pcf-cell pcf-col-inwt pcf-table-header-cell">Scrap</div>
                                                        <div className="pcf-cell pcf-col-outwt pcf-table-header-cell">QC SIGN</div>
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
                                                        <div className="pcf-cell pcf-col-inwt" style={{ fontWeight: "bold" }}> Final WT.</div>
                                                        <div className="pcf-cell pcf-col-outwt"></div>
                                                        <div className="pcf-cell pcf-col-scrap" ></div>
                                                    </div>

                                                    {/* Instruction */}
                                                    <div className="dcf-row dcf-instruction-box" style={{ padding: "4px 6px", lineHeight: "1.2" }}>
                                                        <div className="dcf-instruction-label" style={{ padding: '0px' }}>
                                                            <span style={{ fontWeight: "bold" }}>Instruction : </span>
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html:
                                                                        e?.data?.rd?.ProductInstructionfull?.length > 300
                                                                            ? `${e.data.rd.ProductInstructionfull.slice(0, 300)}...`
                                                                            : e?.data?.rd?.ProductInstructionfull
                                                                            ||
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
                                    const allCards = [
                                        ...rowChunks.map((chunk, idx) => renderDcfWrapper(chunk, `${i}-dcf-${idx}`, i === 0)),
                                        renderPcfWrapper(`${i}-pcf`),
                                    ];

                                    const cardRows = [];
                                    for (let p = 0; p < allCards.length; p += 2) {
                                        cardRows.push(
                                            <div className='bagprint22' key={`row-${i}-${p}`}>
                                                {allCards[p]}
                                                {allCards[p + 1]
                                                    ? allCards[p + 1]
                                                    : <div style={{ width: '50%' }}></div>
                                                }
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