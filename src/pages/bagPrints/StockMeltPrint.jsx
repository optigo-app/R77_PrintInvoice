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
 
function StockMeltPrint() {
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
                    "con": "{\"mode\":\"stockmeltprint\",\"appuserid\":\"" + queries?.appuserid + "\"}",
                    "p": "{\"WhereClause1\":\"" + queries?.encwhere1 + "\",\"WhereClause2\":\"" + queries?.encwhere2 + "\",\"OrderBy\":\"" + queries?.encorder + "\",\"PageSize\":\"" + queryParams?.PageSize + "\",\"CurrentPage\":\"" + queryParams?.CurrentPage + "\",\"utype\":\"" + queries?.ddlutype + "\"}",
                    "f": "Ajax_ReportManagement_UserSaleReport.aspx (Salescrm)"
                }
                const allDatas = await GetFgSaleData(queries, body);
                setData(allDatas?.Data?.rd || []);
                setBagData(allDatas?.Data?.rd1 || []);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (data?.length > 0 && !hasPrinted.current) {
            hasPrinted.current = true;
            setTimeout(() => {
                window.print();
            }, 300);
        }
    }, [data]);

    // Helper utility to turn string variables built with '<br/>' dividers safely into array loops
    const parseBagString = (bagString) => {
        if (!bagString) return [];
        return bagString.split("<br/>").map(item => item.trim()).filter(Boolean);
    };

     return (
        <div>
          {data?.length === 0 ? (
            <Loader />
          ) : (
            <div className="jewelry-table-container">
            <div className="printbtn" style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                <button
                    className="btn_white blue mb-0 hidedp10_pcl7 m-0 p-2"
                    onClick={(e) => handlePrint(e)}
                >
                    Print
                </button>
            </div>
            <table className="jewelry-table" >
                <thead>
                    <tr>
                        <th rowSpan="2" style={{ width: '7%', padding: '8px' }}>Melt Date</th>
                        <th rowSpan="2" style={{ width: '5%', padding: '8px' }}>Tag#</th>
                        <th rowSpan="2" style={{ width: '6%', padding: '8px' }}>Design#</th>
                        <th rowSpan="2" style={{ width: '6%', padding: '8px' }}>Customer</th>
                        <th rowSpan="2" style={{ width: '7%', padding: '8px' }}>Metal Type</th>
                        <th rowSpan="2" style={{ width: '5%', padding: '8px' }}>Net Wt</th>
                        <th rowSpan="2" style={{ width: '5%', padding: '8px' }}>Gross Wt</th>
                        <th rowSpan="2" style={{ width: '7%', padding: '8px' }}>Dia. Wt/Pcs</th>
                        <th rowSpan="2" style={{ width: '6%', padding: '8px' }}>CS Wt/Pcs</th>
                        <th rowSpan="2" style={{ width: '6%', padding: '8px' }}>Misc Wt/Pcs</th>
                        <th rowSpan="2" style={{ width: '7%', padding: '8px' }}>Category</th>
                        <th rowSpan="2" style={{ width: '8%', padding: '8px' }}>Location</th>
                        <th rowSpan="2" style={{ width: '5%', padding: '8px' }}>Melt By</th>
                        <th colSpan="3" style={{ width: '20%', padding: '4px' }}>RM Bag</th>
                        <th rowSpan="2" className="no-wrap" style={{ width: '10%', padding: '8px' }}>Locker</th>
                    </tr>
                    <tr>
                        <th style={{ width: '7%', padding: '4px' }}>Diamond</th>
                        <th style={{ width: '7%', padding: '4px' }}>Color Stone</th>
                        <th style={{ width: '6%', padding: '4px' }}>Misc</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.map((e, i) => {
                        // Find matching bag payload entry via key identifier matching 'TagNo'
                        const matchedBag = bagData?.find((bag) => bag.TagNo === e?.TagNo);

                        // Parse out array sets explicitly for loop processing blocks below
                        const diamondBags = parseBagString(matchedBag?.DiamondRFBags);
                        const colorStoneBags = parseBagString(matchedBag?.ColorStoneRFBags);
                        const miscBags = parseBagString(matchedBag?.MiscRFBags);

                        return (
                            <tr key={e?.id || i}>
                                <td className="bold-text no-wrap" style={{ padding: '8px' }}>{e?.MeltDate}</td>
                                <td className="bold-text" style={{ padding: '8px' }}>{e?.TagNo}</td>
                                <td style={{ padding: '8px' }}>{e?.DesignNo}</td>
                                <td style={{ padding: '8px' }}>{e?.Customer}</td>
                                <td className="no-wrap" style={{ padding: '8px' }}>{e?.MetalType}</td>
                                <td className="bold-text" style={{ padding: '8px' }}>{e?.NetWt?.toFixed(3)}</td>
                                <td className="bold-text" style={{ padding: '8px' }}>{e?.GrossWt?.toFixed(3)}</td>
                                <td style={{ padding: '8px' }}>{e?.DiaWtPcs}</td>
                                <td style={{ padding: '8px' }}>{e?.CSWtPcs}</td>
                                <td style={{ padding: '8px' }}>{e?.MiscWtPcs}</td>
                                <td style={{ padding: '8px' }}>{e?.Category}</td>
                                <td className="bold-text" style={{ padding: '8px' }}>{e?.Location}</td>
                                <td style={{ padding: '8px' }}>{e?.MeltBy}</td>

                                {/* Diamond RF Bags Cell Block */}
                                <td style={{ padding: '0px', verticalAlign: 'top' }}>
                                  
                                        <table className="nested-barcode-table" style={{ width: '100%', height: '100%' }}>
                                            <tbody>
                                                {diamondBags.map((bag, idx) => (
                                                    <tr key={`dia-${idx}`}>
                                                        <td className="no-wrap" style={{ border: "none", borderBottom: idx < diamondBags.length - 1 ? '1px solid #000' : 'none', padding: '4px', textAlign: 'center' }}>
                                                            {bag}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    
                                </td>

                                {/* Color Stone RF Bags Cell Block */}
                                <td style={{ padding: '0px', verticalAlign: 'top' }}>
                                     
                                        <table className="nested-barcode-table" style={{ width: '100%', height: '100%' }}>
                                            <tbody>
                                                {colorStoneBags.map((bag, idx) => (
                                                    <tr key={`cs-${idx}`}>
                                                        <td className="no-wrap" style={{ border: "none", borderBottom: idx < colorStoneBags.length - 1 ? '1px solid #000' : 'none', padding: '4px', textAlign: 'center' }}>
                                                            {bag}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                
                                </td>

                                {/* Misc RF Bags Cell Block */}
                                <td style={{ padding: '0px', verticalAlign: 'top' }}>
                          
                                        <table className="nested-barcode-table" style={{ width: '100%', height: '100%' }}>
                                            <tbody>
                                                {miscBags.map((bag, idx) => (
                                                    <tr key={`misc-${idx}`}>
                                                        <td className="no-wrap" style={{ border: "none", borderBottom: idx < miscBags.length - 1 ? '1px solid #000' : 'none', padding: '4px', textAlign: 'center' }}>
                                                            {bag}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                  
                                </td>

                                <td className="no-wrap" style={{ padding: '8px' }}>{e?.Locker || '-'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
          )}
        </div>
      );

   
        
       
    
}

export default StockMeltPrint;