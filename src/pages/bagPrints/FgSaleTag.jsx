import queryString from "query-string";
import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import "../../assets/css/bagprint/fgsaletag.css";

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

// import BarcodeGenratorStcok from "../../components/BarcodeGenratorStcok";


export default function FgSaleTag({ headers }) {


    const [data, setData] = useState([]);
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
        version: queryParams.version,
        StockBarcodeList: queryParams.StockBarcodeList,
    };

    console.log("TCL: FGSalePrint -> queries", queries)

    useEffect(() => {

        const fetchData = async () => {
            try {
               const body= {
                "con": "{\"id\":\"\",\"mode\":\"QUALITYTAGPRINT\",\"appuserid\":\""+queries?.appuserid+"\"}",
                
                "p": "{\"StockBarcodeList\":\""+queries?.StockBarcodeList+"\"}",
                
                "f": "Ajax_StockManagement_BillTagprint.aspx (Salescrm)"
                }
                const allDatas = await GetFgSaleData(queries,body);


                setData(allDatas?.Data?.rd || []);
                setDataDiadata(allDatas?.Data?.rd1 || {});
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();

    }, []);

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
                
                
                {data?.map((e,i)=>(
                     <div className="sizeLabel" style={{ display: "flex", width: "150mm", alignItems: "flex-end", height: "25mm",justifyContent:"flex-end" }}>

                     {/* Barcode Section */}
                     <div className="barcodeSection" style={{ width: "50%" }}>
 
                         <div className="barcode">
                              <BarcodeGenratorStcok
                                                             data={e?.StockBarcode}
                                                           />
                         </div>
 
                         <div className="bottomInfo" style={{ display: "flex", gap: "15px", fontWeight: "bold" }}>
                             <span>{e?.StockBarcode}</span>
                             <span>{e?.designno}</span>
                             <span>{e?.MetalType}</span>
                         </div>
 
                         <div className="bisLogoContainer">
                             <img
                                 src="http://nzen/lib/jo/28/images/bislogo.jpg"
 
                                 alt=""
                                 className="bisLogo"
                             />
                         </div>
 
                     </div>
 
                     {/* Right Detail Section */}
                     <div className="detailContainer" style={{ width: "40%" }}>
 
 
 
                         <div className="detailContent" style={{ fontWeight: "bold" }}>
 
                             <div className="detailRow" style={{ display: "flex", gap: "15px" }}>
                                 <span className="label">G.WT</span>
                                 <span className="value">{e?.GrossWeightgm?.toFixed(2)} gm</span>
                             </div>
 
                             <div className="detailRow" style={{ display: "flex", gap: "15px" }}>
                                 <span className="label">N.WT</span>
                                 <span className="value">{e?.NetWtgm?.toFixed(2)} gm.</span>
                             </div>
 
                             <div className="detailRow" style={{ display:diadata[i]?.pieces ? "flex" : "none", gap: "15px" }}>
                                 <span className="label">DIA.</span>
                                 <span className="value">{diadata[i]?.pieces}/{diadata[i]?.weight?.toFixed(2)} {diadata[i]?.Quality}</span>
                             </div>
 
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
