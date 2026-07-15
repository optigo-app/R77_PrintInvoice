

import queryString from "query-string";
import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import "../../assets/css/bagprint/wipreport.css";

import Loader from "../../components/Loader";
import { GetWipData } from "../../GlobalFunctions/GetWipData";
import { GetUniquejob } from "../../GlobalFunctions/GetUniqueJob";
import {

    handleImageError,

} from "../../GlobalFunctions";
import { handlePrint } from "../../GlobalFunctions/HandlePrint";
import { organizeData } from "../../GlobalFunctions/OrganizeBagPrintData";
import { GetChunkData } from "../../GlobalFunctions/GetChunkData";
import { checkArr, checkInstruction } from "../../GlobalFunctions";
import BarcodeStickerGen from './BarcodeStickerGen';
import BarcodeGenratorStcok from "../../components/BarcodeGenratorStcok";
import { borderTop } from "@mui/system";





export default function WIPReport({ queries, headers }) {

    console.log("TCL: WIPReport -> queries", queries)
    const [data, setData] = useState([]);
    const location = useLocation();
    const queryParams = queryString.parse(location.search);
    const resultString = GetUniquejob(queryParams?.str_srjobno);

    const [searchText, setSearchText] = useState("");
    const [query, setQuery] = useState("");
    const [headerData, setHeaderData] = useState({});
    const [diaflag, setDiaFlag] = useState(true);
    const [lineflag, setLineFlag] = useState(true);

    useEffect(() => {


        const fetchData = async () => {
            try {

                const allDatas = await GetWipData(queries);


                setData(allDatas?.Data?.rd1 || []);
                setHeaderData(allDatas?.Data?.rd[0] || {});
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();

    }, []);

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        return data.filter(row =>
            !q || Object.values(row).some(val =>
                String(val ?? "").toLowerCase().includes(q)
            )
        );
    }, [data, query]);


    const handleCheckbox = () => {
        if (diaflag) {
            setDiaFlag(false);
        } else {
            setDiaFlag(true);
        }
    };

    const handleLineCheckbox = () => {
        if (lineflag) {
            setLineFlag(false);
        } else {
            setLineFlag(true);
        }
    };


    return (
        <>
            <div style={{ marginBottom: "2rem" }}>
                {data?.length === 0 ? (
                    <Loader />
                ) : (
                    <>
                        <div>
                            <div className="filter" style={{
                                display: "flex", justifyContent: "space-between", width: "939px",
                                margin: "0 auto", marginTop: "10px", marginBottom: "10px"
                            }}>
                                <div className="search">
                                    <input type="text" value={query}
                                        onChange={e => setQuery(e.target.value)} style={{ border: "1px solid #DFDFDF", padding: "4px 3px", borderRadius: "4px" }} placeholder="Search..." />

                                </div>
                                <div style={{ display: "flex", alignItems: "center" }}>

                                <div>
                                        <input
                                            type="checkbox"
                                            id="lineid"
                                            className="mx-1"
                                            checked={lineflag}
                                            onChange={handleLineCheckbox}
                                        />
                                        <label
                                            htmlFor="lineid"
                                            className="me-3 user-select-none"
                                        >
                                           Line Id
                                        </label>
                                    </div>
                                    
                                    <div>
                                        <input
                                            type="checkbox"
                                            id="imghideshow"
                                            className="mx-1"
                                            checked={diaflag}
                                            onChange={handleCheckbox}
                                        />
                                        <label
                                            htmlFor="imghideshow"
                                            className="me-3 user-select-none"
                                        >
                                            Dia Qty and color
                                        </label>
                                    </div>
                                    <div className="pbtn" style={{ border: "1px solid #CBCBCB", borderRadius: "4px" }}>

                                        <input
                                            type="button"
                                            id="btnprint"
                                            value="Print"
                                            onClick={(e) => handlePrint(e)}
                                            accessKey="p"
                                            autoFocus
                                            style={{
                                                display: "inline-block",
                                                borderLeft: "4px solid #5994BB",
                                                cursor: "pointer",
                                                padding: "5px 7px",

                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "10px",
                                    padding: "10px",
                                    width: "970px",
                                    margin: "0 auto",
                                }}
                            >
                                <div
                                    style={{
                                        width: "100%",

                                    }}
                                    className="print_header"
                                >
                                    {/* Top Title Bar */}
                                    <div
                                        style={{
                                            background: "#9e9e9e",
                                            color: "#fff",
                                            fontWeight: "bold",
                                            fontSize: "28px",
                                            padding: "0px 15px",
                                            letterSpacing: "1px",
                                        }}
                                    >
                                        WIP REPORT
                                    </div>

                                    {/* Content */}
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "0px 15px",
                                        }}
                                    >
                                        {/* Left Section */}
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: "24px",
                                                    fontWeight: "bold",

                                                    color: "#000",
                                                }}
                                            >
                                                {headerData?.CompanyFullName || ""}
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: "13px",
                                                    color: "#000",

                                                }}
                                            >
                                                {headerData?.CompanyAddress || ""}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "13px",
                                                    color: "#000",

                                                }}
                                            >
                                                {headerData?.CompanyAddress2 || ""}
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: "13px",
                                                    color: "#000",

                                                }}
                                            >
                                                {headerData?.CompanyCity || ""}-{headerData?.CompanyPinCode || ""}, {headerData?.CompanyState || ""}({headerData?.CompanyCountry || ""})
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: "13px",
                                                    color: "#000",

                                                }}
                                            >
                                                T {headerData?.CompanyTellNo || ""}
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: "13px",

                                                }}
                                            >
                                                {headerData?.CompanyEmail || ""} &nbsp; {headerData?.CompanyWebsite || ""}
                                            </div>
                                        </div>

                                        {/* Right Logo */}
                                        <div
                                            style={{
                                                width: "90px",
                                                height: "90px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <img
                                                src={headerData?.PrintLogo}
                                                alt="ring"
                                                style={{
                                                    width: "70px",
                                                    objectFit: "contain",
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Bottom Border */}
                                    <div
                                        style={{
                                            borderTop: "2px solid #d3d3d3",
                                            margin: "0 15px",
                                        }}
                                    />
                                </div>
                                {filtered.map((item, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            width: "230px",
                                            border: "1px solid #bdbdbd",
                                            background: "#fff",
                                            fontFamily: "Calibri",
                                            fontSize: "11px",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {/* Header */}
                                        <div
                                            style={{
                                                padding: "0px 8px",
                                                borderBottom: "1px solid #d9d9d9",
                                                display: "flex",
                                                gap: "5px",
                                            }}
                                        >
                                            <span>CUSTOMER CODE:</span>

                                            <span style={{ fontWeight: "bold" }}>
                                                {item?.Customercode}
                                            </span>
                                        </div>

                                        {/* Image */}
                                        <div
                                            style={{

                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderBottom: "1px solid #d9d9d9",

                                            }}
                                        >
                                            <img
                                                src={item?.img_url}
                                                onError={(e) => handleImageError(e)}
                                                alt=""
                                                style={{
                                                    maxWidth: "100%",
                                                    maxHeight: "120px",

                                                }}
                                            />
                                        </div>

                                        {/* Details */}
                                        <div style={{ padding: "6px 8px" }}>
                                        {lineflag &&(
                                                    <div
                                                    style={{
                                                        display: "flex",
                                                    }}
                                                    className="line-height1"
                                                >
                                                    <div style={{ width: "90px" }}>LINE ID:</div>
    
                                                    <div style={{ fontWeight: "bold" }}>
                                                      {item?.lineid} 
                                                    </div>
                                                </div>

                                            )}

                                            <div
                                                style={{
                                                    display: "flex",

                                                }}
                                                className="line-height1"
                                            >
                                                <div style={{ width: "90px" }}>DESIGN:</div>

                                                <div style={{ fontWeight: "bold" }}>
                                                    {item?.designno || ""}
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    display: "flex",

                                                }}
                                                className="line-height1"
                                            >
                                                <div style={{ width: "90px" }}>JOB NO:</div>

                                                <div style={{ fontWeight: "bold" }}>
                                                    {item?.serialjobno}{" "}[{item?.Locationname}]
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    display: "flex",

                                                }}
                                                className="line-height1"
                                            >
                                                <div style={{ width: "90px" }}>Size:</div>

                                                <div style={{ fontWeight: "bold" }}>{item?.size || ""}</div>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",

                                                }}
                                                className="line-height1"
                                            >
                                                <div style={{ width: "90px" }}>Metal:</div>

                                                <div style={{ fontWeight: "bold" }}>{item?.MetalType + " " + item?.MetalColor || ""}</div>
                                            </div>

                                            {diaflag && (
                                                <>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                        }}
                                                        className="line-height1"
                                                    >
                                                        <div style={{ width: "90px" }}>Dia. Qty:</div>

                                                        <div style={{ fontWeight: "bold" }}>{item?.DiaQlty || ""}</div>
                                                    </div>

                                                    <div
                                                        style={{
                                                            display: "flex",
                                                        }}
                                                        className="line-height1"
                                                    >
                                                        <div style={{ width: "90px" }}>Dia. Color:</div>

                                                        <div style={{ fontWeight: "bold", width: "112px" }}>{item?.DiaColor}</div>
                                                    </div>
                                                </>

                                            )}



                                            <div
                                                style={{
                                                    display: "flex",
                                                }}
                                                className="line-height1"
                                            >
                                                <div style={{ width: "90px" }}>Dia. weight:</div>

                                                <div style={{ fontWeight: "bold" }}>
                                                  {item?.Diamond_actualusedpcs}/{item?.Diamond_actualused?.toFixed(3) + " cwt"}
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    display: "flex",
                                                }}
                                                className="line-height1"
                                            >
                                                <div style={{ width: "90px" }}>C. weight:</div>

                                                <div style={{ fontWeight: "bold" }}>
                                                  {item?.ColorStone_actualusedpcs}/{item?.ColorStone_actualused?.toFixed(3) + " cwt"}
                                                </div>
                                            </div>

                                          
                                        

                                            <div
                                                style={{
                                                    fontWeight: "bold",
                                                }}
                                                className="line-height1"
                                            >
                                              { item?.department || ""}
                                            </div>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "15px",

                                                    fontSize: "11px",
                                                }}
                                                className="line-height1"
                                            >
                                                <div>
                                                    <span>PRO DATE </span>

                                                    <span style={{ fontWeight: "bold" }}>
                                                        {item?.promisedate1 || ""}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span>OR DATE </span>

                                                    <span style={{ fontWeight: "bold" }}>
                                                        {item?.jobentrydate1 || ""}
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "15px",

                                                    fontSize: "11px",
                                                }}
                                                className="line-height1"
                                            >
                                                <div style={{ width: "35%" }}>
                                                    <span>PRD. Age </span>

                                                    <span style={{ fontWeight: "bold" }}>
                                                        {item?.issue_age || ""}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span>PRC. Age </span>

                                                    <span style={{ fontWeight: "bold" }}>
                                                        {item?.issue_agenew || ""}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </>
                )}
            </div>
        </>
    );
}