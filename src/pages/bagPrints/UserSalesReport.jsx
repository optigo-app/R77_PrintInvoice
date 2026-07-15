 
 
import "../../assets/css/bagprint/UserSalesReport.css";
import queryString from "query-string";
import React, { useState, useEffect, useRef  } from "react";
import { useLocation } from "react-router-dom";
// import "../../assets/css/bagprint/fgsaleprint.css";

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

function UserSalesReport() {

  const hasPrinted = useRef(false);
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
          encwhere1: queryParams.encwhere1,
          encwhere2: queryParams.encwhere2,
          encorder: queryParams.encorder,
          ddlutype: queryParams.ddlutype,
         
      };
     
  
      useEffect(() => {
  

//         http://nzen/R50B3/RBIP/?printname=UserSalePrint
// encwhere1=IHdoZXJlIDE9MSAg-IGmv%2FVPRx9o%3D
// encwhere2=IHdoZXJlIDE9MSAg-IGmv%2FVPRx9o%3D
// encorder=T3JkZXIgYnkgVV9Db2RlIGFzYw%3D%3D-%2FmxVxlVIEKk%3D
// ddlutype=User
// appuserid=admin@orail.co.in
// YearCode=e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19
// apiurl=http://newnextjs.web/api/report
// spno=157
// report_sv=0
// version=R50B3
// ifid=UserSalePrint
// pid=
          const fetchData = async () => {
              try {
                 const body= {
                  "con": "{\"mode\":\"usersaleprint\",\"appuserid\":\""+queries?.appuserid+"\"}",
                  
                  "p": "{\"WhereClause1\":\""+queries?.encwhere1+"\",\"WhereClause2\":\""+queries?.encwhere2+"\",\"OrderBy\":\""+queries?.encorder+"\",\"PageSize\":\"1000\",\"CurrentPage\":\"1\",\"utype\":\""+queries?.ddlutype+"\"}",
                  
                  "f": "Ajax_ReportManagement_UserSaleReport.aspx (Salescrm)"
                  }
                  
                  const allDatas = await GetFgSaleData(queries,body);
  
  
                  setData(allDatas?.Data?.rd || []);
               
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

      const keys = [
        "ATM_Cnt",
        "ATM_Gwt",
        "ATM_Nwt",
        "MTC_Cnt",
        "MTC_Gwt",
        "MTC_Nwt",
        "BTC_Cnt",
        "BTC_Gwt",
        "BTC_Nwt",
        "MR_Cnt",
        "MR_Gwt",
        "MR_Nwt",
        "RM_Cnt",
        "RM_Gwt",
        "RM_Nwt"
      ];

      const totals = data.reduce((acc, item) => {
  
        keys.forEach((key) => {
          acc[key] = (acc[key] || 0) + Number(item[key] || 0);
        });
      
        return acc;
      
      }, {});
      
      console.log(totals);
 

   return (
          <div className="pad_60_allPrint">
            {data.length === 0 ? (
              <Loader />
            ) : (
          
              <div className="report-container" id="tblsummary1">

                 <div className="printbtn" style={{display:"flex",justifyContent:"flex-end",marginBottom:"10px"}}>
                                                <button
                                                                    className="btn_white blue mb-0 hidedp10_pcl7 m-0 p-2"
                                                                    onClick={(e) => handlePrint(e)}
                                                                  >
                                                                    Print
                                                                  </button>
                                                </div>
      
              {/* 1. Top Summary Row */}
              <div className="report-row">
                <div className="col-sr"   />
                <div className="col-designation"   />
                <div className="col-user" style={{ borderRight: "1px solid #C7C7C7" }} />
        
                {/* Assigned To Memo Totals */}
                <div className="cell cell-header col-stat">{totals?.ATM_Cnt }</div>
                <div className="cell cell-header col-stat"> {totals?.ATM_Gwt?.toFixed(3) }</div>
                <div className="cell cell-header col-stat"> {totals?.ATM_Nwt?.toFixed(3)}</div>
        
                {/* Memo To Customer Totals */}
                <div className="cell cell-header col-stat">{totals?.MTC_Cnt  }</div>
                <div className="cell cell-header col-stat"> {totals?.MTC_Gwt?.toFixed(3)  }</div>
                <div className="cell cell-header col-stat"> {totals?.MTC_Nwt?.toFixed(3)  }</div>
        
                {/* Billed To Customer Totals */}
                <div className="cell cell-header col-stat">{totals?.BTC_Cnt  }</div>
                <div className="cell cell-header col-stat"> {totals?.BTC_Gwt?.toFixed(3)  }</div>
                <div className="cell cell-header col-stat"> {totals?.BTC_Nwt?.toFixed(3)  }</div>
        
                {/* Memo Return Totals */}
                <div className="cell cell-header col-stat">{totals?.MR_Cnt  }</div>
                <div className="cell cell-header col-stat"> {totals?.MR_Gwt?.toFixed(3)  }</div>
                <div className="cell cell-header col-stat"> {totals?.MR_Nwt?.toFixed(3)  }</div>
        
                {/* Remaining Totals */}
                <div className="cell cell-header col-stat">{totals?.RM_Cnt  }</div>
                <div className="cell cell-header col-stat"> {totals?.RM_Gwt?.toFixed(3)  }</div>
                <div className="cell cell-header col-stat"> {totals?.RM_Nwt?.toFixed(3)  }</div>
              </div>
        
              {/* 2. Group Header Row */}
              <div className="report-row">
                <div className="col-sr" />
                <div className="col-designation"   />
                <div className="col-user" style={{ borderRight: "1px solid #C7C7C7" }} />
        
                <div className="cell cell-header col-group">Assigned To Memo</div>
                <div className="cell cell-header col-group">Memo To Customer</div>
                <div className="cell cell-header col-group">Billed To Customer</div>
                <div className="cell cell-header col-group">Memo Return</div>
                <div className="cell cell-header col-group">Remaining</div>
              </div>
        
              {/* 3. Column Header Row */}
              <div className="report-row">
                <div className="cell cell-header col-sr">Sr#</div>
                <div className="cell cell-header col-designation">Designation</div>
                <div className="cell cell-header col-user">User</div>
        
                {/* Repeating Headers for all 5 groups */}
                {[...Array(5)].map((_, i) => (
                  <React.Fragment key={i}>
                    <div className="cell cell-header col-stat">Count</div>
                    <div className="cell cell-header col-stat">Gross</div>
                    <div className="cell cell-header col-stat">Net</div>
                  </React.Fragment>
                ))}
              </div>
        
              {/* 4. Row 1: FULL STACK DEVELOPER */}
        
              {data?.map((e,i)=>(
                    <div className="report-row">
                    <div className="cell cell-number col-sr">{i+1}</div>
                    <div className="cell cell-text col-designation" style={{lineHeight:"1"}}>{e?.designation}</div>
                    <div className="cell cell-text col-user" style={{lineHeight:"1"}}>{e?.U_Code}</div>
            
                    {/* Assigned */}
                    <div className="cell cell-number col-stat">{e?.ATM_Cnt}</div>
                    <div className="cell cell-number col-stat">{e?.ATM_Gwt?.toFixed(3)}</div>
                    <div className="cell cell-number col-stat">{e?.ATM_Nwt?.toFixed(3)}</div>
                    {/* Memo To Cust */}
                    <div className="cell cell-number col-stat">{e?.MTC_Cnt}</div>
                    <div className="cell cell-number col-stat">{e?.MTC_Gwt?.toFixed(3)}</div>
                    <div className="cell cell-number col-stat">{e?.MTC_Nwt?.toFixed(3)}</div>
                    {/* Billed */}
                    <div className="cell cell-number col-stat">{e?.BTC_Cnt}</div>
                    <div className="cell cell-number col-stat">{e?.BTC_Gwt?.toFixed(3)}</div>
                    <div className="cell cell-number col-stat">{e?.BTC_Nwt?.toFixed(3)}</div>
                    {/* Return */}
                    <div className="cell cell-number col-stat">{e?.MR_Cnt}</div>
                    <div className="cell cell-number col-stat">{e?.MR_Gwt?.toFixed(3)}</div>
                    <div className="cell cell-number col-stat">{e?.MR_Nwt?.toFixed(3)}</div>
                    {/* Remaining */}
                    <div className="cell cell-number col-stat">{e?.RM_Cnt}</div>
                    <div className="cell cell-number col-stat">{e?.RM_Gwt?.toFixed(3)}</div>
                    <div className="cell cell-number col-stat">{e?.RM_Nwt?.toFixed(3)}</div>
                  </div>
            
              ))}
              
              
            </div>
            )}
          </div>
        );
}

export default UserSalesReport;