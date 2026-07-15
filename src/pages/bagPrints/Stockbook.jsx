import queryString from "query-string";
import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import "../../assets/css/bagprint/stockbook.css";

import Loader from "../../components/Loader";
import { GetStock } from "../../GlobalFunctions/GetStock";
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

function Stockbook({ headers }) {

    const [data, setData] = useState([]);





    const location = useLocation();
    const queryParams = queryString.parse(location.search);
    const printName = queryParams?.printname?.toLowerCase();
    const queries = {
        stock_id: queryParams.stock_id,
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
    };
    useEffect(() => {


        const fetchData = async () => {

            console.log("TCL: fetchData -> scvfgf", queries)
            try {
                const allDatas = await GetStock(queries);
                setData(allDatas?.Data?.rd || []);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    console.log("TCL: Stockbook -> data", data)


   

    return (
        <div className="pad_60_allPrint">
          {data.length === 0 ? (
            <Loader />
          ) : (
            <div>
           

            <div  style={{display:"flex",justifyContent:"flex-end",width:"980px",margin:"20px auto"}} className="d-none-print">
            <div className="pbtn" style={{ border: "1px solid #CBCBCB", borderRadius: "4px", width: "55px" }}>
                 <input
                     type="button"
                     id="btnprint"
                     value="Print"
                     onClick={(e) => handlePrint(e)}
                     className=""
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
             <div className='stockbook_container'>
 
                 {data?.map((item, index) => (
 
                     <div className="mainItemBlockWithImg" key={index}>
                         <div className="thumbnailCard">
 
                             <div className="customerNameDiv">
                                 <span>{item?.customercode}</span>
                             </div>
 
                             <div className="imageWrapper">
                                 <img
                                     src={item?.img_url || ""}
                                     alt="Loading..."
                                     className="productImage"
                                     onError={handleImageError}
                                 />
                             </div>
 
                             <div className="mainCaption">
                                 <div className="captionContent">
 
                                     <div className="designNoDiv">
                                         <table className="designTable">
                                             <tbody>
                                                 <tr>
                                                     <td className="leftCell">{item?.designno}</td>
                                                     <td className="rightCell"></td>
                                                 </tr>
                                             </tbody>
                                         </table>
                                     </div>
 
                                     <div className="weightRow">
                                         <span className="weightLeft">{item?.jobno}</span>
                                         <span className="weightMiddle">|</span>
                                         <span className="weightRight">{item?.ActualGrossweight?.toFixed(2)} gm</span>
                                     </div>
 
                                     <div className="weightRow">
                                         <span className="weightLeft">{item?.goldtypename}</span>
                                         <span className="weightMiddle">|</span>
                                         <span className="weightRight">Nt:{item?.netweight?.toFixed(2)} gm</span>
                                     </div>
 
                                     <div className="weightRow hiddenRow">
                                         <span className="weightLeft">Dia:0.000</span>
                                         <span className="weightMiddle">|</span>
                                         <span className="weightRight">CS:0.000</span>
                                     </div>
 
                                 </div>
                             </div>
 
                         </div>
                     </div>
                 ))}
 
 
 
             </div>
         </div>
     
          )}
        </div>
      );
}

export default Stockbook
