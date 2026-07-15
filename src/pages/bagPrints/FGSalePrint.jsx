import queryString from "query-string";
import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import "../../assets/css/bagprint/fgsaleprint.css";

import Loader from "../../components/Loader";
import { GetFgSaleData } from "../../GlobalFunctions/GetFgSaleData";
import { GetUniquejob } from "../../GlobalFunctions/GetUniqueJob";
import { handleImageError, } from "../../GlobalFunctions";
import { handlePrint } from "../../GlobalFunctions/HandlePrint";
import { organizeData } from "../../GlobalFunctions/OrganizeBagPrintData";
import { GetChunkData } from "../../GlobalFunctions/GetChunkData";
import { checkArr, checkInstruction } from "../../GlobalFunctions";
import BarcodeStickerGen from './BarcodeStickerGen';
import BarcodeGenratorStcok from "../../components/BarcodeGenratorStcok";
import { borderTop } from "@mui/system";
import QRCodeGenerator from "../../components/QRCodeGenerator";



export default function FGSalePrint({ headers }) {


    const [data, setData] = useState([]);
    const location = useLocation();
    const queryParams = queryString.parse(location.search);
    const resultString = GetUniquejob(queryParams?.str_srjobno);

    const [searchText, setSearchText] = useState("");
    const [query, setQuery] = useState("");
    const [headerData, setHeaderData] = useState({});


    const printName = queryParams?.printname?.toLowerCase();
    const queries = {
        YearCode: queryParams.YearCode,
        appuserid: queryParams.appuserid,
        ifid: queryParams.ifid,
        pid: queryParams.pid,
        printname: queryParams.printname,
        version: queryParams.version,
        url: queryParams.apiurl,
        spno: queryParams.spno,
        sv: queryParams.report_sv,
        version: queryParams.version,
        StockBarcodeList: queryParams.StockBarcodeList,
    };

    console.log("TCL: FGSalePrint -> queries", queries)

    useEffect(() => {

        const fetchData = async () => {
            try {

                const body={
                    "con": "{\"id\":\"\",\"mode\":\"PRINTREPORT\",\"appuserid\":\""+queries?.appuserid+"\"}",
                    "p": "{\"StockBarcodeList\":\""+queries?.StockBarcodeList+"\"}",
                    "f": "PRINTREPORT"
                    }

                const allDatas = await GetFgSaleData(queries,body);


                setData(allDatas?.Data?.rd || []);

            } catch (error) {
                console.log(error);
            }
        };
        fetchData();

    }, []);


    console.log("TCL: FGSalePrint -> data", data)

    return (
        <>
            <div style={{ marginBottom: "2rem" }}>
                {data?.length === 0 ? (
                    <Loader />
                ) : (
                    <>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>

                        <div className="printbtn" style={{display:"flex",justifyContent:"flex-end",marginBottom:"10px"}}>
                                                <button
                                                                    className="btn_white blue mb-0 hidedp10_pcl7 m-0 p-2"
                                                                    onClick={(e) => handlePrint(e)}
                                                                  >
                                                                    Print
                                                                  </button>
                                                </div>


                            {data?.map((e, i) => (

                          
 
                            <div
                                id="sizelabel"
                                className="sizelabel"
                                key={i}

                            >
                                <div className="labelContainer">

                                    {/* QR CODE */}
                                    <div className="qrSection">
                                        <div className="qrCode">
                                            <QRCodeGenerator code={e?.StockBarcode} />
                                        </div>
                                    </div>

                                    {/* CENTER DETAILS */}
                                    <div className="centerSection">
                                        <div className="detailtab">

                                            <div className="row">
                                                <label className="barcodelable" style={{ padding: 0 }}>{e?.CustomerCode}</label>
                                            </div>

                                            <div className="row flexRow">
                                                <label className="details" style={{ padding: 0 }}>
                                                    <span className="metal">{e?.MetalType}</span>
                                                    <span className="job"> {e?.StockBarcode}</span>
                                                </label>
                                            </div>

                                            <div className="row">
                                                <label className="barcodelable" style={{ padding: 0 }}>{e?.designno}</label>
                                            </div>

                                            <div className="row nowrap">
                                                <label className="details" style={{ padding: 0 }}>
                                                    <span className="Gwt">G.WT</span>
                                                    <span className="job">{e?.GrossWeightgm} gm</span>
                                                </label>
                                            </div>

                                            <div className="row">
                                                <label className="barcodelable Afterlable" style={{ padding: 0 }}>
                                                    {e?.BrandName}
                                                </label>
                                            </div>

                                            <div className="row">
                                                <label className="barcodelable">&nbsp;</label>
                                            </div>

                                        </div>
                                    </div>

                                    {/* RIGHT DETAILS */}
                                    <div className="DetailContainer">
                                        <div className="detailtab">

                                            <div className="rightRow">
                                                <label className="details leftText">N.WT</label>
                                                <label className="details">{e?.NetWtgm} gm</label>
                                            </div>

                                            <div className="rightRow" style={{ display: e?.dispdiawtpcs == "display:none" ? "none" : "block" }}>
                                                <label className="details leftText">DIA.</label>
                                                <label className="details">{e?.diapcswt}</label>
                                            </div>

                                            <div
                                                className="rightRow"
                                                style={{ display: "none" }}
                                            >
                                                <label className="details leftText">Polki</label>
                                                <label className="details"> {e?.Pol_Det}</label>
                                            </div>

                                            <div
                                                className="rightRow"
                                                style={{ display: e?.dispcswtpcs == "display:none" ? "none" : "block" }}
                                            >
                                                <label className="details leftText">CS.</label>
                                                <label className="details">{e?.cspcswt}</label>
                                            </div>

                                            <div className="rightRow bottomAlign">
                                                <label className="details Afterlable leftText">
                                                    BG
                                                </label>

                                                <label className="details Afterlable">
                                                    {e?.DiaQuality}
                                                </label>
                                            </div>

                                        </div>
                                    </div>

                                    {/* LOGO */}
                                    <div className="sideLogoContainer">
                                        <img
                                            alt=""
                                            src= {e?.designImage.match(/src="([^"]+)"/)?.[1]}
                                            className="bis_taglogo"
                                        />
                                    </div>

                                </div>
                            </div>
                            ))}



                        </div>
                    </>
                )}
            </div>

        </>
    );
}
