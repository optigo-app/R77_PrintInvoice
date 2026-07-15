import "../../assets/css/bagprint/StockMeltPrint.css";
import queryString from "query-string";
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import Loader from "../../components/Loader";
import { GetFgSaleData } from "../../GlobalFunctions/GetFgSaleData";
import { GetUniquejob } from "../../GlobalFunctions/GetUniqueJob";
import { handleImageError } from "../../GlobalFunctions";
import { handlePrint } from "../../GlobalFunctions/HandlePrint";
import { organizeData } from "../../GlobalFunctions/OrganizeBagPrintData";
import { GetChunkData } from "../../GlobalFunctions/GetChunkData";
import { checkArr, checkInstruction } from "../../GlobalFunctions";
import BarcodeStickerGen from './BarcodeStickerGen';
import BarcodeGenratorStcok from "../../components/BarcodeGenratorStcok";
import { borderTop } from "@mui/system";
import QRCodeGenerator from "../../components/QRCodeGenerator";
import ReactHTMLTableToExcel from "react-html-table-to-excel";

function StockMeltExcel() {
    const hasPrinted = useRef(false);
    const [data, setData] = useState([]);
    const [bagData, setBagData] = useState([]);
    const location = useLocation();
    const queryParams = queryString.parse(location.search);
    const resultString = GetUniquejob(queryParams?.str_srjobno);

    const [searchText, setSearchText] = useState("");
    const [query, setQuery] = useState("");
    const [diadata, setDataDiadata] = useState({});

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
        StockBarcodeList: queryParams.StockBarcodeList,
        encwhere1: queryParams.encwhere1,
        encwhere2: queryParams.encwhere2,
        encorder: queryParams.encorder,
        ddlutype: queryParams.ddlutype,
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const body = {
                    "con": "{\"mode\":\"stockmeltexcel\",\"appuserid\":\"" + queries?.appuserid + "\"}",
                    "p": "{\"WhereClause1\":\"" + queries?.encwhere1 + "\",\"WhereClause2\":\"" + queries?.encwhere2 + "\",\"OrderBy\":\"" + queries?.encorder + "\",\"PageSize\":\"" + queryParams?.PageSize + "\",\"CurrentPage\":\"" + queryParams?.CurrentPage + "\",\"utype\":\"" + queries?.ddlutype + "\"}",
                    "f": "Ajax_ReportManagement_UserSaleReport.aspx (Salescrm)"
                }
                const allDatas = await GetFgSaleData(queries, body);
                setData(allDatas?.Data?.rd || []);

            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);



    // Helper utility to turn string variables built with '<br/>' dividers safely into array loops
    const parseBagString = (bagString) => {
        if (!bagString) return [];
        return bagString.split("<br/>").map(item => item.trim()).filter(Boolean);
    };

    // if (data) {
    //     setTimeout(() => {
    //         const button = document.getElementById('test-table-xls-button');
    //         button.click();
    //     }, 500);
    // }

    useEffect(() => {
        if (!data?.length) return;
    
        const timer = setTimeout(() => {
            document.getElementById("test-table-xls-button")?.click();
        }, 500);
    
        return () => clearTimeout(timer);
    }, [data]);

    return (
        <div className="jewelry-table-container">
            <ReactHTMLTableToExcel
                id="test-table-xls-button"
                className="download-table-xls-button btn btn-success text-black bg-success px-2 py-1 fs-5"
                table="table-to-xls"
                filename={`FG Stock Melt Report`}
                sheet={`FG Stock Melt Report`}
                buttonText="Download as XLS"
            />
            <table className="jewelry-table" id="table-to-xls" style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Calibri" }}>
                <thead>
                    <tr>
                        <th rowSpan="1" style={{ width: '7%', padding: '8px' }}>Melt Date</th>
                        <th rowSpan="1" style={{ width: '5%', padding: '8px' }}>Tag#</th>
                        <th rowSpan="1" style={{ width: '6%', padding: '8px' }}>Design#</th>
                        <th rowSpan="1" style={{ width: '7%', padding: '8px' }}>Category</th>
                        <th rowSpan="1" style={{ width: '6%', padding: '8px' }}>Customer</th>
                        <th rowSpan="1" style={{ width: '7%', padding: '8px' }}>Material </th>
                        <th rowSpan="1" style={{ width: '5%', padding: '8px' }}>Type</th>
                        <th rowSpan="1" style={{ width: '5%', padding: '8px' }}>Shape</th>
                        <th rowSpan="1" style={{ width: '7%', padding: '8px' }}>Quality</th>
                        <th rowSpan="1" style={{ width: '6%', padding: '8px' }}>Color</th>
                        <th rowSpan="1" style={{ width: '6%', padding: '8px' }}>Size</th>

                        <th rowSpan="1" style={{ width: '8%', padding: '8px' }}>Pcs</th>
                        <th rowSpan="1" style={{ width: '5%', padding: '8px' }}>Weight</th>
                        <th style={{ width: '20%', padding: '4px' }}>Location</th>
                        <th className="no-wrap" style={{ width: '10%', padding: '8px' }}>Melt by</th>

                        <th style={{ width: '7%', padding: '4px' }}>RM Bag</th>
                        <th style={{ width: '7%', padding: '4px' }}>Locker</th>

                    </tr>
                </thead>
                <tbody>
                    {data?.map((e, i) => {
                
                        return (
                            <tr key={e?.id || i}>
                                <td className="bold-text no-wrap" style={{ padding: '8px' }}>{e?.MeltDate}</td>
                                <td className="bold-text" style={{ padding: '8px' }}>{ `\u200B${e?.TagNo}`}</td>
                                <td style={{ padding: '8px' }}>{e?.DesignNo}</td>
                                <td style={{ padding: '8px' }}>{e?.Category}</td>
                                <td className="no-wrap" style={{ padding: '8px' }}>{e?.Customer}</td>
                                <td className="bold-text" style={{ padding: '8px' }}>{e?.Material}</td>
                                <td className="bold-text" style={{ padding: '8px' }}>{e?.Material=="FINDING"? e?.Shape :e?.Type}</td>
                                <td style={{ padding: '8px' }}>{e?.Material=="FINDING"? e?.FindingAccessories : e?.Shape }</td>
                                <td style={{ padding: '8px' }}>{e?.Quality}</td>
                                <td style={{ padding: '8px' }}>{e?.Color}</td>
                                <td style={{ padding: '8px' }}>{e?.Size}</td>
                                <td style={{ padding: '8px' }}>{e?.Pcs}</td>
                                <td style={{ padding: '8px' }}>{e?.Weight}</td>
                                <td style={{ padding: '8px' }}>{e?.Location}</td>
                                <td style={{ padding: '8px' }}>{e?.MeltBy}</td>
                                <td style={{ padding: '8px' }}>
                                {
                                        e.RMBag.split('<br/>')
                                            .map(item => item.trim()) // Cleans up any accidental spaces
                                            .filter(Boolean)          // Removes any empty values
                                            .map((bag, index) => (
                                                <div key={index} className="rm-bag-item">
                                                    { `\u200B${bag}`}
                                                </div>
                                            ))
                                    }
                                </td>
                                <td className="no-wrap" style={{ padding: '8px' }}>{e?.Locker}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default StockMeltExcel;