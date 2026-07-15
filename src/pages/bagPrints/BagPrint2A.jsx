import queryString from "query-string";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../../assets/css/bagprint/print2A.css";
import { GetChunkData } from "../../GlobalFunctions/GetChunkData";
import { GetData } from "../../GlobalFunctions/GetData";
import { GetSeparateData } from "../../GlobalFunctions/GetSeparateData";
import { handleImageError } from "../../GlobalFunctions/HandleImageError";
import BarcodeGenerator from "../../components/BarcodeGenerator";
import Loader from "../../components/Loader";
import { handlePrint } from "../../GlobalFunctions/HandlePrint";
import { organizeData } from "../../GlobalFunctions/OrganizeBagPrintData";
import { GetUniquejob } from "../../GlobalFunctions/GetUniqueJob";
import { checkArr, checkInstruction } from "./../../GlobalFunctions";
import BarcodeGenratorStcok from "../../components/BarcodeGenratorStcok";
import { justifyContent } from "@mui/system";

function BagPrint2A({ queries, headers }) {
  const [data, setData] = useState([]);
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const resultString = GetUniquejob(queryParams?.str_srjobno);
  const chunkSize11 = 15;
  const imgUrls = [];
  useEffect(() => {
    if (Object.keys(queryParams)?.length !== 0) {
      atob(queryParams?.imagepath);
    }




    const fetchData = async () => {
      try {
        const responseData = [];
        // eslint-disable-next-line no-unused-vars
        const startTime = performance.now();

        const objs = {
          jobno: resultString,
          custid: queries.custid,
          printname: queries.printname,
          appuserid: queries.appuserid,
          url: queries.url,
          headers: headers,
        };

        const allDatas = await GetData(objs);
 

        const allJobs = new Set(allDatas.rd.map(x => x.serialjobno));

        const groupedData = Object.values(
          allDatas.rd.reduce((acc, item) => {
            const baseJob = item.serialjobno.replace(/S\d+$/, "");

            // Skip if primary job doesn't exist
            if (!allJobs.has(baseJob)) {
              return acc;
            }

            if (!acc[baseJob]) {
              const primaryRecord = allDatas.rd.find(
                x => x.serialjobno === baseJob
              );

              acc[baseJob] = {
                ...(primaryRecord || item),
                serialjobno: baseJob,
                multiMetalItems: [],
              };
            }

            // acc[baseJob].multiMetalItems.push(item);
            if (item.serialjobno !== baseJob) {
              acc[baseJob].multiMetalItems.push(item);
            }

            return acc;
          }, {})
        );
 




        if (groupedData.length === 0) {
          setData([]);
          return;
        }



        //split
        console.log("TCL: fetchData ->allDatas ", allDatas)
        // let datas = organizeData(allDatas?.rd, allDatas?.rd1);
         
        let datas = organizeData(groupedData, allDatas?.rd1,allDatas?.rd2);




        datas?.map((a) => {
          let length = 0;
          let clr = {
            Shapename: "TOTAL",
            Sizename: "C TOTAL",
            ActualPcs: 0,
            IssuePcs: 0,
            IssueWeight: 0,
            ActualWeight: 0,
            MasterManagement_DiamondStoneTypeid: 4,
          };
          let dia = {
            Shapename: "TOTAL",
            Sizename: "D TOTAL",
            ActualPcs: 0,
            ActualWeight: 0,
            IssuePcs: 0,
            IssueWeight: 0,
            MasterManagement_DiamondStoneTypeid: 3,
          };
          let misc = {
            Shapename: "TOTAL",
            Sizename: "MISC TOTAL",
            ActualPcs: 0,
            IssuePcs: 0,
            IssueWeight: 0,
            ActualWeight: 0,
            MasterManagement_DiamondStoneTypeid: 7,
          };
          let f = {
            Shapename: "TOTAL",
            Sizename: "F TOTAL",
            ActualPcs: 0,
            IssuePcs: 0,
            IssueWeight: 0,
            ActualWeight: 0,
            MasterManagement_DiamondStoneTypeid: 5,
          };
          let DiamondList = [];
          let ColorStoneList = [];
          let MiscList = [];
          let FindingList = [];

          // eslint-disable-next-line array-callback-return
          a?.rd1?.map((e, i) => {
            if (e?.ConcatedFullShapeQualityColorCode !== "- - - ") {
              length++;
            }
            if (e?.MasterManagement_DiamondStoneTypeid === 3) {
              DiamondList.push(e);
              dia.ActualPcs = dia.ActualPcs + e?.ActualPcs;
              dia.IssuePcs = dia.IssuePcs + e?.IssuePcs;
              dia.IssueWeight = dia.IssueWeight + e?.IssueWeight;
              dia.ActualWeight = dia.ActualWeight + e?.ActualWeight;
            } else if (e?.MasterManagement_DiamondStoneTypeid === 4) {
              ColorStoneList.push(e);
              clr.ActualPcs = clr.ActualPcs + e?.ActualPcs;
              clr.IssuePcs = clr.IssuePcs + e?.IssuePcs;
              clr.IssueWeight = clr.IssueWeight + e?.IssueWeight;
              clr.ActualWeight = clr.ActualWeight + e?.ActualWeight;
            } else if (e?.MasterManagement_DiamondStoneTypeid === 5) {
              FindingList.push(e);
              f.ActualPcs = f.ActualPcs + e?.ActualPcs;
              f.IssuePcs = f.IssuePcs + e?.IssuePcs;
              f.IssueWeight = f.IssueWeight + e?.IssueWeight;
              f.ActualWeight = f.ActualWeight + e?.ActualWeight;
            } else if (e?.MasterManagement_DiamondStoneTypeid === 7) {
              MiscList.push(e);
              misc.ActualPcs = misc.ActualPcs + e?.ActualPcs;
              misc.IssuePcs = misc.IssuePcs + e?.IssuePcs;
              misc.IssueWeight = misc.IssueWeight + e?.IssueWeight;
              misc.ActualWeight = misc.ActualWeight + e?.ActualWeight;
            }
          });
          dia.ActualPcs = +dia.ActualPcs?.toFixed(3);
          dia.IssuePcs = +dia.IssuePcs?.toFixed(3);
          dia.IssueWeight = +dia.IssueWeight?.toFixed(3);
          dia.ActualWeight = +dia.ActualWeight?.toFixed(3);
          clr.ActualPcs = +clr.ActualPcs?.toFixed(3);
          clr.IssuePcs = +clr.IssuePcs?.toFixed(3);
          clr.IssueWeight = +clr.IssueWeight?.toFixed(3);
          clr.ActualWeight = +clr.ActualWeight?.toFixed(3);
          misc.ActualPcs = +misc.ActualPcs?.toFixed(3);
          misc.IssuePcs = +misc.IssuePcs?.toFixed(3);
          misc.IssueWeight = +misc.IssueWeight?.toFixed(3);
          misc.ActualWeight = +misc.ActualWeight?.toFixed(3);
          f.ActualPcs = +f.ActualPcs?.toFixed(3);
          f.IssuePcs = +f.IssuePcs?.toFixed(3);
          f.IssueWeight = +f.IssueWeight?.toFixed(3);
          f.ActualWeight = +f.ActualWeight?.toFixed(3);
          DiamondList?.push(dia);
          ColorStoneList?.push(clr);
          MiscList?.push(misc);
          FindingList?.push(f);

          let newDia = {
            Shapename: "Diamond Detail",
            Sizename: "Diamond Detail",
            ActualPcs: "",
            ActualWeight: "",
            MasterManagement_DiamondStoneTypeid: 3,
          };
          let newCS = {
            Shapename: "Colorstone Detail",
            Sizename: "Colorstone Detail",
            ActualPcs: "",
            ActualWeight: "",
            MasterManagement_DiamondStoneTypeid: 4,
          };
          let newMisc = {
            Shapename: "Misc Detail",
            Sizename: "Misc Detail",
            ActualPcs: "",
            ActualWeight: "",
            MasterManagement_DiamondStoneTypeid: 7,
          };
          let newfind = {
            Shapename: "Finding Detail",
            Sizename: "Finding Detail",
            ActualPcs: "",
            ActualWeight: "",
            MasterManagement_DiamondStoneTypeid: 5,
          };

          DiamondList?.unshift(newDia);
          ColorStoneList?.unshift(newCS);
          MiscList?.unshift(newMisc);
          FindingList?.unshift(newfind);

          let mainArr = checkArr(
            DiamondList,
            ColorStoneList,
            MiscList,
            FindingList
          );
          let imagePath = queryParams?.imagepath;
          imagePath = atob(queryParams?.imagepath);

          let img = imagePath + a?.rd?.ThumbImagePath;

          const arr = GetChunkData(chunkSize11, mainArr);

          responseData.push({
            data: a,
            additional: {
              length: length,
              clr: clr,
              dia: dia,
              f: f,
              img: img,
              misc: misc,
              pages: arr,
              data: a?.rd
            },
          });
          setData(responseData);
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data.length !== 0) {
      setTimeout(() => {
        window.print();
      }, 5000);
    }
  }, [data]);




  console.log("TCL: fetchData -> my final data", data)







 









  return (
    <>
      {data.length === 0 ? (
        <Loader />
      ) : (
        <>
          <div className="print_btn ">
            <button
              className="btn_white blue print_btn"
              onClick={(e) => handlePrint(e)}
            >
              Print
            </button>
          </div>

          <div className="print2A pad_60_allPrint">
            {Array.from(
              { length: queries.pageStart },
              (_, index) =>
                index > 0 && (
                  <div
                    key={index}
                    className="mainbag2A"
                    style={{ border: "0px" }}
                  ></div>
                )
            )}
            {data.length > 0 &&
              data.map((e, ind) => {


              
                return (
                  <React.Fragment key={ind}>
                    {e?.additional?.pages?.length > 0 ? (
                      e?.additional?.pages?.map((ele, i) => {
                        // e?.data?.rd?.map((ele, i) => {
                        return (
                          <React.Fragment key={i}>
                            <div className="mainbag2A">
                              <div className="print2AStartPart">
                                <div className="print2A_header">
                                  <div className="print2A_header_bagInfoPart">
                                    <div className="print2A_header_bagInfoPart1">
                                      <div
                                        className="print2AJobNo"
                                        style={{ fontSize: "13px" }}
                                      >
                                        {e?.additional?.data?.serialjobno}
                                      </div>
                                      <div className="print2AJobNo">
                                        {e?.additional?.data?.Designcode?.toUpperCase()}
                                      </div>
                                      <div className="print2AJobNo">
                                        {e?.additional?.data?.MetalType?.toUpperCase() +
                                          " " +
                                          e?.additional?.data?.MetalColorCo?.toUpperCase()}
                                      </div>
                                    </div>

                                    <div className="print2AMaterial">
                                      <div className="print2AMaterialCG">
                                        <div className="g2A">CUST.</div>
                                        <div
                                          className="custHead2A"
                                          style={{ width: "60px" }}
                                        >
                                          {e?.additional?.data?.CustomerCode}
                                        </div>
                                        <div className="custCode2A">
                                          <b> {e?.additional?.data?.multiMetalItems?.length > 0 ? "METAL" : "GOLD"}</b>
                                        </div>
                                        <div className="cst2A">
                                          <b>DIA</b>
                                        </div>
                                        <div
                                          className="cst2A"
                                          style={{ borderRight: "0px" }}
                                        >
                                          <b>CST</b>
                                        </div>
                                      </div>
                                      <div className="print2AMaterialCG">
                                        <div className="g2A">SIZE</div>
                                        <div
                                          className="custHead2A lh1Ady"
                                          style={{ width: "60px" }}
                                        >
                                          {e?.data?.rd?.Size === "" ? "N/A" : e?.data?.rd?.Size}
                                        </div>
                                        <div className="custCode2A">
                                          {e?.additional?.data?.MetalWeight?.toFixed(3)}
                                        </div>
                                        <div className="cst2A">
                                          {e?.additional?.dia?.ActualPcs}/
                                          {e?.additional?.dia?.ActualWeight?.toFixed(
                                            2
                                          )}
                                        </div>
                                        <div
                                          className="cst2A"
                                          style={{ borderRight: "0px" }}
                                        >
                                          {e?.additional?.clr?.ActualPcs}/
                                          {e?.additional?.clr?.ActualWeight?.toFixed(
                                            2
                                          )}
                                        </div>
                                      </div>
                                      <div className="print2AMaterialCG">
                                        <div
                                          className="g2A"
                                          
                                        >
                                          PO
                                        </div>
                                        <div
                                          className="custHead2A lh1Ady"
                                          style={{ width: "121px" }}
                                        >
                                          {e?.additional?.data?.PO}
                                        </div>
                                        <div className="cst2A">
                                          <b>BAG DT</b>
                                        </div>
                                        <div
                                          className="cst2A"
                                          style={{ borderRight: "0px" }}
                                        >
                                          {e?.additional?.data?.orderDatef}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="print2A_header_bagImgPart2">
                                    <img
                                      src={
                                        e?.additional?.data?.DesignImage !== ''
                                          ? e?.additional?.data?.DesignImage
                                          : require("../../assets/img/default.jpg")
                                      }
                                      id="print2AImg"
                                      alt=""
                                      onError={(e) => handleImageError(e)}
                                      loading="eager"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div
                                className="print2AtableBarcode"
                                style={{ height: "287px" }}
                              >
                                <div className="midpart2A">
                                  <div style={{display:"flex" ,fontWeight:"bold",justifyContent:"space-around",borderBottom:"1px solid #000"}}>
                                    <div>SKU# {e?.data?.rd?.OrderNo}</div>
                                    <div>DIAMOND DETAIL</div>
                                  </div>
                                  <div className="print2AMiddlePart">
                                    <div className="print2AMidHead">
                                      <div
                                        className="print2ARM"
                                        style={{ width: "104px" }}
                                      >
                                        <b className="fonts2A">RM CODE</b>
                                      </div>
                                      <div
                                        className="sizename2A"
                                        style={{
                                          display: "flex",
                                          justifyContent: "center",
                                          fontSize: "14px",
                                          width: "69px",
                                        }}
                                      >
                                        <b className="fonts2A">RM SIZE</b>
                                      </div>
                                      <div
                                        className="d-flex justify-content-between align-items-center"
                                        style={{ width: "127px" }}
                                      >
                                        <div
                                          className="w-50 d-flex flex-column justify-content-start align-items-center"
                                          style={{ height: "30px" }}
                                        >
                                          <div
                                            style={{
                                              borderBottom: "1px solid black",
                                              borderRight: "1px solid black",
                                            }}
                                            className="w-100 d-flex justify-content-center align-items-center h-50 fonts2A"
                                          >
                                            ACTUAL
                                          </div>
                                          <div className="w-100 d-flex fonts2A h-50">
                                            <div
                                              style={{
                                                borderRight: "1px solid black",
                                                height: "16px",
                                              }}
                                              className="w-50 d-flex justify-content-center align-items-center"
                                            >
                                              PCS
                                            </div>
                                            <div
                                              className="w-50 d-flex justify-content-center align-items-center"
                                              style={{
                                                borderRight: "1px solid black",
                                                height: "16px",
                                              }}
                                            >
                                              WT
                                            </div>
                                          </div>
                                        </div>
                                        <div
                                          className="w-50 d-flex flex-column justify-content-start align-items-center"
                                          style={{ height: "30px" }}
                                        >
                                          <div
                                            style={{
                                              borderBottom: "1px solid black",
                                            }}
                                            className="w-100 fonts1A d-flex justify-content-center align-items-center h-50"
                                          >
                                            ISSUE
                                          </div>
                                          <div
                                            className="w-100 d-flex fonts2A h-50"
                                          >
                                            <div
                                              style={{
                                                borderRight: "1px solid black",
                                                height: "16px",
                                              }}
                                              className="w-50 d-flex justify-content-center align-items-center"
                                            >
                                              PCS
                                            </div>
                                            <div
                                              className="w-50 d-flex justify-content-center align-items-center"
                                              style={{ height: "16px" }}
                                            >
                                              WT
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      {
                                        ele?.data?.map((s, si) => {
                                          return (
                                            <React.Fragment>
                                              <div key={si}>
                                                {" "}
                                                {s?.Sizename === "Diamond Detail" ||
                                                  s?.Sizename ===
                                                  "Colorstone Detail" ||
                                                  s?.Sizename === "Misc Detail" || s?.Sizename === "Finding Detail" ? (
                                                  <div
                                                    className="fonts2A fs20A w-100  justify-content-center align-items-center fw-bold border-bottom border-black"
                                                    style={{
                                                      height: '14px',
                                                      display : s?.Sizename === "Diamond Detail" ?"none":"flex",
                                                      paddingTop: "1px",
                                                      paddingBottom: "1px",
                                                      
                                                    }}
                                                  >
                                                   
                                                    {s?.Sizename?.toUpperCase()}
                                                  </div>
                                                ) : (
                                                  <React.Fragment>
                                                    {s?.Sizename === "C TOTAL" ||
                                                      s?.Sizename === "D TOTAL" ||
                                                      s?.Sizename === "MISC TOTAL" ? (
                                                      <div className="print2AMidBody d-flex fw-bold">
                                                        <div className="print2ARM RMW2A total2Afont d-flex justify-content-center align-items-center">{s?.Shapename + " "}</div><div className="sizename2A total2Afont"></div>
                                                        <div className="pcswt2A">
                                                          <div className="actualPcsWt2A">
                                                            <div className="pcs2A total2Afont">{s?.ActualPcs}</div>
                                                            <div className="pcs2A total2Afont border-end-0" style={{ width: '40px' }}>{ s?.Shapename ==="D TOTAL" ? ( +s?.ActualWeight)?.toFixed(3) : ( +s?.ActualWeight)?.toFixed(2)}</div>
                                                          </div>
                                                        </div>
                                                        <div className=""><div style={{display:'flex'}} className="">
                                                          <div className="    " style={{ borderRight: "1px solid rgb(0, 0, 0)", width: "32px", height: "14px" }}>
                                                          
                                                          
                                                          <div   className="pcswt2A2 total2Afont" style={{lineHeight:"13px",paddingRight:"3px"}}>{ s?.IssuePcs !=0 ? s?.IssuePcs : ''}</div> </div>
                                                        
                                                        
                                                        
                                                        <div style={{width:"32px"}} className="pcswt2A2 total2Afont">{ s?.IssueWeight !=0 ? ( +s?.IssueWeight)?.toFixed(3) : ''}</div>
                                                        </div>
                                                        
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <>
                                                        {
                                                          s?.MasterManagement_DiamondStoneTypeid === 5 ? <div className="print2AMidBody">
                                                            {
                                                              s?.Shapename === 'TOTAL' ? <div className="print2ARM FIND2A total2Afont fw-bold d-flex justify-content-center align-items-center fonts2A">{s?.Shapename}</div> : <div className="print2ARM FIND2A total2Afont"> {s?.LimitedShapeQualityColorCode?.toUpperCase() +
                                                                " " +
                                                                s?.Quality?.toUpperCase() +
                                                                " " +
                                                                s?.ColorName?.toUpperCase()}</div>
                                                            }
                                                            <div className="pcswt2A">
                                                              {s?.Shapename === 'TOTAL' ?
                                                                <div className="actualPcsWt2A fw-bold">
                                                                  <div className={`pcs2A total2Afont`}>{s?.ActualPcs}</div>
                                                                  <div className="pcs2A border-end-0 total2Afont" style={{ borderRight: '0px', width: '40px' }}>{ s?.Shapename ==="Diamond Detail" ? ( +s?.ActualWeight)?.toFixed(3) : ( +s?.ActualWeight)?.toFixed(2)}</div> 
                                                                </div>
                                                                : <div className="actualPcsWt2A">
                                                                  <div className={`pcs2A total2Afont`}>{s?.ActualPcs}</div>
                                                                  <div className="pcs2A border-end-0 total2Afont" style={{ borderRight: '0px', width: '40px' }}>{ s?.Shapename ==="Diamond Detail" ? ( +s?.ActualWeight)?.toFixed(3) : ( +s?.ActualWeight)?.toFixed(2)}</div>
                                                                </div>}
                                                            </div>
                                                            <div className=""><div className=""><div className="    " style={{ borderRight: "1px solid rgb(0, 0, 0)", width: "32px", height: "14px" }}></div></div></div>
                                                          </div> : <div className="d-flex border-bottom border-black" style={{ height: '14px' }}>
                                                            <div className="print2ARM RMW2A total2Afont">{s?.MaterialTypeName + " " + s?.LimitedShapeQualityColorCode}</div>
                                                            <div className="sizename2A total2Afont">{s?.Sizename}</div>
                                                            <div className="pcswt2A">
                                                              <div className="actualPcsWt2A">
                                                                <div className="pcs2A total2Afont">{s?.ActualPcs}</div>
                                                                <div style={{ borderRight: '0px', width: '40px' }} className="pcs2A total2Afont">{s?.Shapename =="DIAMOND DETAIL" ? ( +s?.ActualWeight)?.toFixed(3) : ( +s?.ActualWeight)?.toFixed(2)}</div>
                                                              </div>
                                                            </div>
                                                            <div className=""><div className="" style={{display:'flex'}}><div className="    " style={{ borderRight: "1px solid rgb(0, 0, 0)", width: "32px", height: "14px" ,display:'flex'
                                                            }}>
                                                              
                                                            <div style={{width:"100%",paddingRight:"3px"}}  className="pcswt2A2 total2Afont">{ s?.IssuePcs !=0 ? s?.IssuePcs : ''}</div>
                                                          
                                                              
                                                              
                                                              </div>  <div  style={{width:"31px"}}  className="pcswt2A2 total2Afont">{ s?.IssueWeight !=0 ? ( +s?.IssueWeight)?.toFixed(3) : ''}</div></div></div>
                                                          </div>
                                                        }
                                                      </>
                                                    )}
                                                  </React.Fragment>
                                                )}
                                              </div>
                                            </React.Fragment>
                                          )
                                        })
                                      }

                                      {Array.from(
                                        { length: ele?.length },
                                        (_, iabcd) => {
                                          return (
                                            <React.Fragment key={iabcd}>
                                              {iabcd !== 0 ? (
                                                <div className="print2AMidBody">
                                                  <div className="print2ARM RMW2A">
                                                    {e.Shapename ?? ""}
                                                  </div>
                                                  <div className="sizename2A">
                                                    {e.Sizename ?? ""}
                                                  </div>
                                                  <div className="pcswt2A">
                                                    <div className="actualPcsWt2A">
                                                      <div className="pcs2A">
                                                        {e?.ActualPcs ?? ""}
                                                      </div>
                                                      <div
                                                        className=""
                                                        style={{
                                                          borderRight: "0px",
                                                          width: "40px",
                                                        }}
                                                      >
                                                        {e?.ActualWeight ?? ""}
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="">
                                                    <div className="">
                                                      <div
                                                        className="bordered-div"
                                                        style={{
                                                          width: "32px",
                                                          height: "14px",
                                                          // border: '1px solid black',
                                                          borderRight:
                                                            "1px solid",
                                                          borderBottom:
                                                            "0px solid",
                                                          borderTop: "0px",
                                                        }}
                                                      ></div>
                                                      <div className=""></div>
                                                    </div>
                                                  </div>
                                                </div>
                                              ) : (
                                                <div
                                                  className="print2AMidBody"
                                                  style={{ display: "none" }}
                                                >
                                                  <div className="print2ARM RMW2A">
                                                    {e.Shapename ?? ""}
                                                  </div>
                                                  <div className="sizename2A">
                                                    {e.Sizename ?? ""}
                                                  </div>
                                                  <div className="pcswt2A">
                                                    <div className="actualPcsWt2A">
                                                      <div className="pcs2A">
                                                        {e?.ActualPcs ?? ""}
                                                      </div>
                                                      <div
                                                        className=""
                                                        style={{
                                                          borderRight: "0px",
                                                          width: "30px",
                                                        }}
                                                      >
                                                        {e?.ActualWeight ?? ""}
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="">
                                                    <div className="">
                                                      <div
                                                        className="bordered-div"
                                                        style={{
                                                          width: "33px",
                                                          height: "17px",
                                                          borderRight:
                                                            "1px solid",
                                                          borderBottom:
                                                            "0px solid",
                                                          borderTop: "0px",
                                                        }}
                                                      ></div>
                                                      <div className=""></div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </React.Fragment>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                  <div style={{ lineHeight: "15px" }}>
                                    <span className="fw-bold fonts2A">
                                      INSTRUCTION :
                                    </span>
                                    <span style={{ color: "red" }}>
                                      {" " +
                                        checkInstruction(
                                          e?.data?.rd?.officeuse
                                        ) +
                                        " " +
                                        (e?.data?.rd?.ProductInstruction
                                          ?.length > 0
                                          ? checkInstruction(
                                            e?.data?.rd?.ProductInstruction
                                          )
                                          : checkInstruction(
                                            e?.data?.rd?.QuoteRemark
                                          ))}
                                    </span>
                                  </div>
                                </div>
                                <div
                                  className="barcodeSetPrint2A"
                                  style={{ height: "285px", marginTop: "2px" }}
                                >
                                  <div className="barcodeprint2A">
                                    {e?.additional?.data?.serialjobno !== "" ? (
                                      <BarcodeGenerator
                                        data={e?.additional?.data?.serialjobno}
                                      />
                                    ) : (
                                      ""
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                          </React.Fragment>
                        );
                      })
                    ) : (

                      <>
                        <div className="mainbag2A">
                          <div className="print2AStartPart">
                            <div className="print2A_header">
                              <div className="print2A_header_bagInfoPart">
                                <div className="print2A_header_bagInfoPart1">
                                  <div
                                    className="print2AJobNo"
                                    style={{ fontSize: "13px" }}
                                  >
                                    {e?.data?.rd?.serialjobno}
                                  </div>
                                  <div className="print2AJobNo">
                                    {e?.data?.rd?.Designcode}
                                  </div>
                                  <div className="print2AJobNo">
                                    {e?.data?.rd?.MetalType}
                                  </div>
                                  <div className="print2AJobNo">
                                    {e?.data?.rd?.MetalColorCo}
                                  </div>
                                </div>

                                <div className="print2AMaterial">
                                  <div className="print2AMaterialCG">
                                    <div
                                      className="g2A"
                                      style={{ width: "36px" }}
                                    >
                                      CUST.
                                    </div>
                                    <div
                                      className="custHead2A"
                                      style={{ width: "53px" }}
                                    >
                                      {e?.data?.rd?.CustomerCode}
                                    </div>
                                    <div
                                      className="custCode2A"
                                      style={{ width: "53px" }}
                                    >
                                      <b> {e?.additional?.data?.multiMetalItems?.length > 0 ? "METAL" : "GOLD"}</b>
                                    </div>
                                    <div
                                      className="cst2A"
                                      style={{ width: "63px" }}
                                    >
                                      <b>DIA</b>
                                    </div>
                                    <div
                                      className="cst2A"
                                      style={{
                                        borderRight: "0px",
                                        width: "63px",
                                      }}
                                    >
                                      <b>CST</b>
                                    </div>
                                  </div>
                                  <div className="print2AMaterialCG">
                                    <div
                                      className="g2A"
                                      style={{ width: "36px" }}
                                    >
                                      SIZE
                                    </div>
                                    <div
                                      className="custHead2A"
                                      style={{ width: "53px" }}
                                    >
                                      {e?.data?.rd?.Size === "" ? "N/A" : e?.data?.rd?.Size}
                                    </div>
                                    <div
                                      className="custCode2A"
                                      style={{ width: "53px" }}
                                    >
                                      {e?.data?.rd?.MetalWeight?.toFixed(3)}
                                    </div>
                                    <div
                                      className="cst2A"
                                      style={{ width: "63px" }}
                                    >
                                      {e?.additional?.dia?.ActualPcs}/
                                      {e?.additional?.dia?.ActualWeight?.toFixed(
                                        3
                                      )}
                                    </div>
                                    <div
                                      className="cst2A"
                                      style={{
                                        borderRight: "0px",
                                        width: "63px",
                                      }}
                                    >
                                      {e?.additional?.clr?.ActualPcs}/
                                      {e?.additional?.clr?.ActualWeight?.toFixed(
                                        3
                                      )}
                                    </div>
                                  </div>
                                  <div className="print2AMaterialCG">
                                    <div
                                      className="g2A"
                                      
                                    >
                                      PO
                                    </div>
                                    <div
                                      className="custHead2A"
                                      style={{ width: "121px" }}
                                    >
                                      {e?.data?.rd?.PO}
                                    </div>
                                    <div className="cst2A">
                                      <b>BAG DT</b>
                                    </div>
                                    <div
                                      className="cst2A"
                                      style={{ borderRight: "0px" }}
                                    >
                                      {e?.data?.rd?.OrderDate}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="print2A_header_bagImgPart2">
                                <img
                                  src={
                                    e?.data?.rd?.DesignImage !== ''
                                      ? e?.data?.rd?.DesignImage
                                      : require("../../assets/img/default.jpg")
                                  }
                                  id="print2AImg"
                                  alt=""
                                  onError={(e) => handleImageError(e)}
                                  loading="eager"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="print2AtableBarcode">
                            <div className="midpart2A">
                            <div style={{display:"flex",fontWeight:"bold",justifyContent:"space-around",borderBottom:"1px solid #000"}}>
                                    <div>SKU# {e?.data?.rd?.OrderNo}</div>
                                    <div>DIAMOND DETAIL</div>
                                  </div>
                              <div className="print2AMiddlePart">
                                <div className="print2AMidHead">
                                  <div
                                    className="print2ARM"
                                    style={{ width: "104px" }}
                                  >
                                    <b className="fonts2A">RM CODE</b>
                                  </div>
                                  <div
                                    className="sizename2A"
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                      fontSize: "14px",
                                      width: "69px",
                                    }}
                                  >
                                    <b className="fonts2A">RM SIZE</b>
                                  </div>
                                  <div
                                    className="d-flex justify-content-between align-items-center"
                                    style={{ width: "127px" }}
                                  >
                                    <div
                                      className="w-50 d-flex flex-column justify-content-start align-items-center"
                                      style={{
                                        height: "30px",
                                        paddingTop: "0px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          height: "14.5px",
                                          borderBottom: "1px solid black",
                                          borderRight: "1px solid black",
                                        }}
                                        className="w-100 d-flex justify-content-center align-items-center fonts2A"
                                      >
                                        ACTUAL
                                      </div>
                                      <div
                                        className="w-100 d-flex fonts2A"
                                        style={{ height: "16.5px" }}
                                      >
                                        <div
                                          style={{
                                            borderRight: "1px solid black",
                                            height: "16px",
                                          }}
                                          className="w-50 d-flex justify-content-center align-items-center fonts2A"
                                        >
                                          PCS
                                        </div>
                                        <div
                                          className="w-50 d-flex justify-content-center align-items-center fonts2A"
                                          style={{
                                            borderRight: "1px solid black",
                                            height: "16px",
                                          }}
                                        >
                                          WT
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className="w-50 d-flex flex-column justify-content-start align-items-center"
                                      style={{
                                        height: "30px",
                                        // paddingTop: "1px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          height: "15px",
                                          borderBottom: "1px solid black",
                                        }}
                                        className="w-100 fonts1A d-flex justify-content-center align-items-center"
                                      >
                                        ISSUE
                                      </div>
                                      <div
                                        className="w-100 d-flex fonts2A"
                                        style={{ height: "15px" }}
                                      >
                                        <div
                                          style={{
                                            borderRight: "1px solid black",
                                            height: "16px",
                                          }}
                                          className="w-50 d-flex justify-content-center align-items-center"
                                        >
                                          PCS
                                        </div>
                                        <div
                                          className="w-50 d-flex justify-content-center align-items-center"
                                          style={{ height: "16px" }}
                                        >
                                          WT
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {Array.from({ length: 14 }, (_, iad) => {
                                  return (
                                    <div className="print2AMidBody" key={iad}>
                                      <div className="print2ARM RMW2A">
                                        {e.Shapename ?? ""}
                                      </div>
                                      <div className="sizename2A">
                                        {e.Sizename ?? ""}
                                      </div>
                                      <div className="pcswt2A">
                                        <div className="actualPcsWt2A">
                                          <div className="pcs2A">
                                            {e?.ActualPcs ?? ""}
                                          </div>
                                          <div
                                            className=""
                                            style={{
                                              borderRight: "0px",
                                              width: "30px",
                                            }}
                                          >
                                            {e?.ActualWeight ?? ""}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="">
                                        <div className="">
                                          <div
                                            className="bordered-div"
                                            style={{
                                              width: "33px",
                                              height: "17px",
                                              borderRight: "1px solid",
                                              borderBottom: "0px solid",
                                              borderTop: "0px",
                                            }}
                                          ></div>
                                          <div className=""></div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div style={{ lineHeight: "15px" }}>
                                <span className="fw-bold fonts2A">INSTRUCTION :</span>
                                <span style={{ color: "red" }}>
                                  {checkInstruction(e?.data?.rd?.officeuse) +
                                    " " +
                                    (e?.data?.rd?.ProductInstruction?.length > 0
                                      ? checkInstruction(
                                        e?.data?.rd?.ProductInstruction
                                      )
                                      : checkInstruction(
                                        e?.data?.rd?.QuoteRemark
                                      ))}
                                </span>
                              </div>
                            </div>
                            <div className="barcodeSetPrint2A">
                              <div className="barcodeprint2A">
                                {e?.data?.rd?.length !== 0 &&
                                  e?.data?.rd !== undefined && (
                                    <>
                                      {e?.data?.rd?.serialjobno !== undefined && (
                                        <BarcodeGenerator
                                          data={e?.data?.rd?.serialjobno}
                                        />
                                      )}
                                    </>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

{ e?.data?.rd2?.length > 0 && (
  /* Flex wrapper to display cards side-by-side */
  <div style={{ display: "flex", gap: "0px", flexWrap: "wrap", alignItems: "flex-start" }}>
    {/* Filter the array first, then chunk it into groups of 6 */}
    {(e?.data?.rd2 ?? [])
      .filter(m => m?.serialjobno !== e?.additional?.data?.serialjobno)
      .reduce((chunks, item, index) => {
        const chunkIndex = Math.floor(index / 5);
        if (!chunks[chunkIndex]) {
          chunks[chunkIndex] = []; // Initialize a new group
        }
        chunks[chunkIndex].push(item);
        return chunks;
      }, [])
      .map((chunkItems, cardIndex) => (
        /* Every chunk of 6 items creates a brand new card layout on the right */
        <div className="mainbag2A" key={cardIndex} style={{ minWidth: "300px" }}>
          <div className="print2AStartPart">
            
            {/* Header section (replicated identically on each card) */}
            <div className="print2A_header">
              <div className="print2A_header_bagInfoPart">
                <div className="print2A_header_bagInfoPart1">
                  <div className="print2AJobNo" style={{ fontSize: "13px" }}>
                    {e?.data?.rd?.serialjobno}
                  </div>
                  <div className="print2AJobNo">
                    {e?.data?.rd?.Designcode}
                  </div>
                  <div className="print2AJobNo">
                    {e?.data?.rd?.MetalType}
                  </div>
                  <div className="print2AJobNo">
                    {e?.data?.rd?.MetalColorCo}
                  </div>
                </div>

                <div className="print2AMaterial">
                  <div className="print2AMaterialCG">
                    <div className="g2A" style={{ width: "36px" }}>CUST.</div>
                    <div className="custHead2A" style={{ width: "53px" }}>
                      {e?.data?.rd?.CustomerCode}
                    </div>
                    <div className="custCode2A" style={{ width: "53px" }}>
                      <b>METAL</b>
                    </div>
                    <div className="cst2A" style={{ width: "63px" }}>
                      <b>DIA</b>
                    </div>
                    <div className="cst2A" style={{ borderRight: "0px", width: "63px" }}>
                      <b>CST</b>
                    </div>
                  </div>
                  
                  <div className="print2AMaterialCG">
                    <div className="g2A" style={{ width: "36px" }}>SIZE</div>
                    <div className="custHead2A" style={{ width: "53px" }}>
                      {e?.data?.rd?.Size}
                    </div>
                    <div className="custCode2A" style={{ width: "53px" }}>
                      {e?.data?.rd?.MetalWeight?.toFixed(3)}
                    </div>
                    <div className="cst2A" style={{ width: "63px" }}>
                      {e?.additional?.dia?.ActualPcs}/
                      {e?.additional?.dia?.ActualWeight?.toFixed(3)}
                    </div>
                    <div className="cst2A" style={{ borderRight: "0px", width: "63px" }}>
                      {e?.additional?.clr?.ActualPcs}/
                      {e?.additional?.clr?.ActualWeight?.toFixed(3)}
                    </div>
                  </div>
                  
                  <div className="print2AMaterialCG">
                    <div className="g2A">PO</div>
                    <div className="custHead2A" style={{ width: "124px" }}>
                      {e?.data?.rd?.PO}
                    </div>
                    <div className="cst2A" style={{ width: "74px" }}>
                      <b>BAG DT</b>
                    </div>
                    <div className="cst2A" style={{ borderRight: "0px" }}>
                      {e?.data?.rd?.OrderDate}
                    </div>
                  </div>
                </div>
              </div>

              <div className="print2A_header_bagImgPart2">
                <img
                  src={
                    e?.data?.rd?.DesignImage !== ''
                      ? e?.data?.rd?.DesignImage
                      : require("../../assets/img/default.jpg")
                  }
                  id="print2AImg"
                  alt=""
                  onError={(e) => handleImageError(e)}
                  loading="eager"
                />
              </div>
            </div>

            {/* Loop exclusively over the max 6 items belonging to this specific card split */}
            {chunkItems.map((m, i) => (
              <div key={i}>
                <div>
                  <div className="metalbarcode" style={{ borderBottom: "1px solid #000", padding: "5px 0", display: "flex", justifyContent: "center" }}>
                    <BarcodeGenratorStcok  data={m?.serialjobno} />
                  </div>
                  <div style={{ borderBottom: "1px solid #000", display: "flex", justifyContent: "space-between", padding: "0px 3px" }}>
                    <div>{m?.serialjobno}</div>
                    <div>Metal Wt. {m?.FinalWt?.toFixed(3)}</div>
                    <div>{m?.Metal_Type_Color}</div>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      ))}
  </div>
)}


                  </React.Fragment>


                );
              })}
          </div>
        </>
      )}
    </>
  );
}

export default BagPrint2A;






// {e?.additional?.data?.multiMetalItems?.length > 0 && (
//   // 1. Parent container to hold multiple cards side-by-side if they wrap
//   <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
    
//     {/* 2. Chunk the multiMetalItems array into groups of 4 */}
//     {Array.from({ length: Math.ceil(e.additional.data.multiMetalItems.length / 4) }).map((_, cardIndex) => {
//       // Get the 4 items for the current card (0-3 for first card, 4-7 for second card, etc.)
//       const currentCardItems = e.additional.data.multiMetalItems.slice(cardIndex * 4, cardIndex * 4 + 4);

//       return (
//         <div className="mainbag2A" key={cardIndex} style={{ width: "fit-content" }}>
//           <div className="print2AStartPart">
//             <div className="print2A_header">
//               <div className="print2A_header_bagInfoPart">
//                 <div className="print2A_header_bagInfoPart1">
//                   <div className="print2AJobNo" style={{ fontSize: "15px" }}>
//                     {e?.data?.rd?.serialjobno}
//                   </div>
//                   <div className="print2AJobNo">
//                     {e?.data?.rd?.Designcode}
//                   </div>
//                   <div className="print2AJobNo">
//                     {e?.data?.rd?.MetalType}
//                   </div>
//                   <div className="print2AJobNo">
//                     {e?.data?.rd?.MetalColorCo}
//                   </div>
//                 </div>

//                 <div className="print2AMaterial">
//                   <div className="print2AMaterialCG">
//                     <div className="g2A" style={{ width: "36px" }}>CUST.</div>
//                     <div className="custHead2A" style={{ width: "53px" }}>
//                       {e?.data?.rd?.CustomerCode}
//                     </div>
//                     <div className="custCode2A" style={{ width: "53px" }}>
//                       <b>METAL</b>
//                     </div>
//                     <div className="cst2A" style={{ width: "63px" }}>
//                       <b>DIA</b>
//                     </div>
//                     <div className="cst2A" style={{ borderRight: "0px", width: "63px" }}>
//                       <b>CST</b>
//                     </div>
//                   </div>
//                   <div className="print2AMaterialCG">
//                     <div className="g2A" style={{ width: "36px" }}>SIZE</div>
//                     <div className="custHead2A" style={{ width: "53px" }}>
//                       {e?.data?.rd?.Size}
//                     </div>
//                     <div className="custCode2A" style={{ width: "53px" }}>
//                       {e?.data?.rd?.MetalWeight?.toFixed(3)}
//                     </div>
//                     <div className="cst2A" style={{ width: "63px" }}>
//                       {e?.additional?.dia?.ActualPcs}/
//                       {e?.additional?.dia?.ActualWeight?.toFixed(3)}
//                     </div>
//                     <div className="cst2A" style={{ borderRight: "0px", width: "63px" }}>
//                       {e?.additional?.clr?.ActualPcs}/
//                       {e?.additional?.clr?.ActualWeight?.toFixed(3)}
//                     </div>
//                   </div>
//                   <div className="print2AMaterialCG">
//                     <div className="g2A" style={{ width: "37px" }}>PO</div>
//                     <div className="custHead2A" style={{ width: "100px" }}>
//                       {e?.data?.rd?.PO}
//                     </div>
//                     <div className="cst2A">
//                       <b>BAG DT</b>
//                     </div>
//                     <div className="cst2A" style={{ borderRight: "0px" }}>
//                       {e?.data?.rd?.OrderDate}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="print2A_header_bagImgPart2">
//                 <img
//                   src={
//                     e?.data?.rd?.DesignImage !== ''
//                       ? e?.data?.rd?.DesignImage
//                       : require("../../assets/img/default.jpg")
//                   }
//                   id="print2AImg"
//                   alt=""
//                   onError={(e) => handleImageError(e)}
//                   loading="eager"
//                 />
//               </div>
//             </div>

//             {/* 3. Map only the sliced items assigned to this specific card */}
//             {currentCardItems.map((m, i) => (
//               <div key={i}>
//                 <div style={{ borderBottom: "1px solid #000", padding: "5px 0", display: "flex", justifyContent: "center" }}>
//                   <BarcodeGenratorStcok data={m?.serialjobno} />
//                 </div>
//                 <div style={{ borderBottom: "1px solid #000", display: "flex", justifyContent: "space-between" }}>
//                   <div>{m?.serialjobno}</div>
//                   <div>Wt. {m?.MetalWeight}</div>
//                   <div>{m?.MetalColorCo}</div>
//                 </div>
//               </div>
//             ))}

//           </div>
//         </div>
//       );
//     })}

//   </div>
// )}




