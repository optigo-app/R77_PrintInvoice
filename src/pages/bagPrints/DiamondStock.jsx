
import queryString from "query-string";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../assets/css/bagprint/print20A.css";

import Loader from "../../components/Loader";
import { GetStockData } from "../../GlobalFunctions/GetStockData";
import { GetUniquejob } from "../../GlobalFunctions/GetUniqueJob";
import { handleImageError } from "../../GlobalFunctions/HandleImageError";
import { handlePrint } from "../../GlobalFunctions/HandlePrint";
import { organizeData } from "../../GlobalFunctions/OrganizeBagPrintData";
import { GetChunkData } from "../../GlobalFunctions/GetChunkData";
import { checkArr, checkInstruction } from "../../GlobalFunctions";
import BarcodeStickerGen from './BarcodeStickerGen';
import BarcodeGenratorStcok from "../../components/BarcodeGenratorStcok";
import QRCodeGenerator from "../../components/QRCodeGenerator";

import { borderTop } from "@mui/system";

function DiamondStock({ queries, headers }) {
  const [data, setData] = useState([]);
  const location = useLocation();
    const [qrflag, setqrflag] = useState(false);
  const queryParams = queryString.parse(location.search);
  const resultString = GetUniquejob(queryParams?.str_srjobno);
  const chunkSize10 = 10;


  useEffect(() => {


    const fetchData = async () => {
      try {
        const responseData = [];
        const objs = {
          rfbag: queries?.rfbag,
          jobno: resultString,
          custid: queries?.custid,
          printname: queries?.printname,
          appuserid: queries?.appuserid,
          url: queries?.url,
          headers: headers,

        };

        const allDatas = await GetStockData(objs);


        setData(allDatas?.rd);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

   
  const handleQR = (e) => {
    if (qrflag) setqrflag(false);
    else {
      setqrflag(true);
    }
  };



  const labelContainer = {
    width: "35mm",
    height: "65mm",
    // border: "1px solid #000",
    borderRadius: "6px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    // justifyContent: "space-between",
    margin: "10px",
  };

  const headerStyle = {
    fontSize: "14px",
    fontWeight: "bold",
    // marginBottom: "3px",
  };

  const divider = {
    height: "1px",
    background: "#000",
    marginBottom: "4px",
  };

  const contentRow = {
    display: "flex",
  };

  const leftText = {
    flex: 1,
    fontSize: "9px",
  };

  const row = {
    display: "flex",
    marginBottom: "2px",
  };

  const label = {
    width: "30px",
  };

  const colon = {
    width: "8px",
    textAlign: "center",
  };

  const value = {
    flex: 1,
    fontWeight: "bold",
  };

  const barcodeWrapper = {
    width: qrflag ? "25px" : "35px", // You might want to increase this to "60px" or "80px" for a QR code
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...(qrflag && {
      position: "absolute",
      right: "6px",
      top:"30px"
    }),
  };

  const barcodeStyle = {
     transform: "rotate(90deg)",
    width: "120px",
  };

  const footer = {
    // background: "#000",
    // color: "#fff",
    // borderTop: "1px solid #000",
    textAlign: "center",
    fontSize: "12px",
    padding: "3px 0",
    borderBottomLeftRadius: "5px",
    borderBottomRightRadius: "5px",
  };


  return (

    <>
     <div className="printbtn" style={{ display: "flex", justifyContent: "flex-end", margin: "10px",alignItems:"center" }}>
     <div className="px-1" style={{marginRight:"10px"}}>
                    <input
                      type="checkbox"
                      checked={qrflag}
                      id="netwts2"
                      value="netwts2"
                      className="mx-1"
                      onChange={handleQR}
                    />
                    <label htmlFor="netwts2">Qr Code</label>
                  </div>
        <button
          className="btn_white blue mb-0 hidedp10_pcl7 m-0 p-2"
          onClick={(e) => handlePrint(e)}
        >
          Print
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
     

     {data?.map((item, index) => (
       <div key={index} style={labelContainer}>

         {/* TOP */}
         <div style={{ position: "relative" }}>
           <div style={{ ...headerStyle, padding: "0 6px" }}>{item?.itemname}</div>
           <div style={divider}></div>

           <div style={contentRow}>

             {/* LEFT TEXT */}
             <div style={{ ...leftText, padding: "0 6px" }}  >
               <div style={row}><span style={label}>M.Type</span><span style={colon}>:</span><span style={value}>{item?.materialtypename}</span></div>
               <div style={row}><span style={{...label,width:"32px"}}>Wt(ctw)</span><span style={colon}>:</span><span style={value}>{item?.TotalRemainingWeight}</span></div>
               <div style={row}><span style={label}>Pcs</span><span style={colon}>:</span><span style={value}>{item?.TotalRemainingPcs}</span></div>
               <div style={row}><span style={label}>Lot#</span><span style={colon}>:</span><span style={value}>{item?.job}</span></div>
               <div style={row}><span style={label}>Shape</span><span style={colon}>:</span><span style={{...value,wordBreak:"break-word"}}>{item?.shape}</span></div>
               <div style={row}><span style={label}>Clarity</span><span style={colon}>:</span><span style={{...value,wordBreak:"break-word"}}>{item?.clarity}</span></div>
               <div style={row}><span style={label}>Color</span><span style={colon}>:</span><span style={{...value,wordBreak:"break-word"}}>{item?.color}</span></div>
               <div style={row}><span style={label}>Size</span><span style={colon}>:</span><span style={value}>{item?.size}</span></div>
            
               <div style={row}><span style={label}>Cust</span><span style={colon}>:</span><span style={value}>{item?.istoreCust_Customercode}</span></div>
             </div>

             {/* RIGHT BARCODE */}
             <div style={barcodeWrapper}>
               <div style={{ ...barcodeStyle, marginRight: "0px" }}  >

                 {/* <BarcodeGenratorStcok data={item?.rfbag} /> */}
                 {qrflag ?<QRCodeGenerator code={item?.rfbag} /> : <BarcodeGenratorStcok data={item?.rfbag} />}
                 
                
               </div>
             </div>

           </div>
         </div>

         {/* FOOTER */}
         <div style={footer}>
           {item?.rfbag}
         </div>

       </div>
     ))}
   </div>
    </>
   
  )
}

export default DiamondStock
