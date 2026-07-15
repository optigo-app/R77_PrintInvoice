import queryString from "query-string";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../../assets/css/bagprint/print16A.css";
import { GetData } from "../../GlobalFunctions/GetData";
import { handleImageError } from "../../GlobalFunctions/HandleImageError";
import { handlePrint } from "../../GlobalFunctions/HandlePrint";
import BarcodeGenerator from "../../components/BarcodeGenerator";
import Loader from "../../components/Loader";
import { organizeData } from "../../GlobalFunctions/OrganizeBagPrintData";
import { GetUniquejob } from "../../GlobalFunctions/GetUniqueJob";
import { checkInstruction } from './../../GlobalFunctions';

const BagPrint16A = ({ queries, headers }) => {
  const location = useLocation();
  const [resData, setResData] = useState([]);
  const queryParams = queryString.parse(location.search);
  const resultString = GetUniquejob(queryParams.str_srjobno);
  const [data, setData] = useState([]);
  const chunkSize = 14;
  const imgUrls = [];

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
        let allDatas = await GetData(objs);

        let datas = organizeData(allDatas?.rd, allDatas?.rd1);

        // eslint-disable-next-line array-callback-return
        datas?.map((a) => {
          imgUrls?.push(a?.rd?.ThumbImagePath);
          let length = 0;
          let clr = {
            clrPcs: 0,
            clrWt: 0,
          };
          let dia = {
            diaPcs: 0,
            diaWt: 0,
          };
          let diamondData = [];
          let clrData = [];
          let diamondWeight = 0;
          let diamondPcs = 0;
          let clrWeight = 0;
          let clrpcs = 0;
          let chData = [];
          let imagePath = queryParams?.imagepath;
          imagePath = atob(queryParams?.imagepath);
          let img = imagePath + a?.rd?.ThumbImagePath;
          // eslint-disable-next-line array-callback-return
          a?.rd1?.map((e, i) => {
            
            if (
              e?.MasterManagement_DiamondStoneTypeid === 3 || e?.MasterManagement_DiamondStoneTypeid === 4 ) {
              length++;
            }
            if (e?.MasterManagement_DiamondStoneTypeid === 3) {
              dia.diaPcs = dia.diaPcs + e?.ActualPcs;
              dia.diaWt = dia.diaWt + e?.ActualWeight;
              diamondData.push(e);
              diamondWeight = diamondWeight + e?.ActualWeight;
              diamondPcs = diamondPcs + e?.ActualPcs;
            } else if (e?.MasterManagement_DiamondStoneTypeid === 4) {
              clr.clrPcs = clr.clrPcs + e?.ActualPcs;
              clr.clrWt = clr.clrWt + e?.ActualWeight;
              clrData.push(e);
              clrWeight = clrWeight + e?.ActualWeight;
              clrpcs = clrpcs + e?.ActualPcs;
            }


          });
          if (diamondData?.length > 0) {
            let diamondDataObject = {
              ActualPcs: diamondPcs,
              ActualWeight: diamondWeight,
              ColorCode: "",
              ColorName: "",
              ConcatedFullShapeQualityColorCode: "",
              ConcatedFullShapeQualityColorName: "",
              ConcatedShapeQualityColorName: "",
              IssuePcs: "",
              IssueWeight: "",
              LimitedShapeQualityColorCode: "",
              MasterManagement_DiamondStoneTypeid: "",
              MetalColor: "",
              Quality: "",
              QualityCode: "",
              Quality_DisplayOrder: "",
              SerialJobno: "",
              Shapecode: "",
              Shapename: "TOTAL",
              Size_DisplayOrder: "",
              Sizename: "",
              TruncateShapename: "",
              totalFontWeight: "900",
            };
            diamondData.push(diamondDataObject);
          }
          if (clrData?.length > 0) {
            let clrDataObject = {
              ActualPcs: clrpcs,
              ActualWeight: clrWeight,
              ColorCode: "",
              ColorName: "",
              ConcatedFullShapeQualityColorCode: "",
              ConcatedFullShapeQualityColorName: "",
              ConcatedShapeQualityColorName: "",
              IssuePcs: "",
              IssueWeight: "",
              LimitedShapeQualityColorCode: "",
              MasterManagement_DiamondStoneTypeid: "",
              MetalColor: "",
              Quality: "",
              QualityCode: "",
              Quality_DisplayOrder: "",
              SerialJobno: "",
              Shapecode: "",
              Shapename: "TOTAL",
              Size_DisplayOrder: "",
              Sizename: "",
              TruncateShapename: "",
              totalFontWeight: "900",
            };
            clrData.push(clrDataObject);
          }
            let originaldata = [...diamondData, ...clrData];
            let count = 0;
            for (let i = 0; i < originaldata?.length; i += chunkSize) {
              let len = 14 - originaldata?.slice(i, i + chunkSize)?.length;
              count++;

              if (count % 5 === 0) {
              }
              chData?.push({
                data: originaldata?.slice(i, i + chunkSize),
                length: len,
              });
            }
            if (chData?.length === 0) {
              length = 14;
            } else {
              length = 12 - length;
            }
          responseData.push({
            data: a,
            additional: {
              length: length,
              clr: clr,
              dia: dia,
              img: img,
              chdata: chData,
            },
          });
        });
        setResData(responseData)
        setData(responseData)

     
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
      }, 10000);
    }
  }, [data]);




  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        {data?.length === 0 ? (
          <Loader />
        ) : (
          <>
          <div className="pad_60_allPrint">
            <div className="print_btn">
              <button
                className="btn_white blue print_btn"
                onClick={(e) => handlePrint(e)}
              >
                Print
              </button>
            </div>
            <div className="print16A">
              {Array.from(
                { length: queries?.pageStart },
                (_, index) =>
                  index > 0 && (
                    <div
                      key={index}
                      className="containerprint16A"
                      style={{ border: "0px" }}
                    ></div>
                  )
              )}
          
              {resData?.map((e, i) => {
                
                
                if (e?.additional?.chdata?.length === 0) {
                  return (
                    <div className="containerprint16A" key={i}>
                      <div className="head16A">
                        <div className="header16A">
                          <div className="headJob16A">
                            <div className="header16AjobInfo">
                              <div className="job16A">
                                <div>
                                  <b style={{ fontSize: "15px" }}>
                                    
                                    {e?.data?.serialjobno}
                                  </b>
                                </div>
                                <div>
                                  ORD: <b>{e?.data?.rd?.orderDatef ?? ""}</b>
                                </div>
                                <div>
                                  DUE:
                                  <b style={{ paddingRight: "1px" }}>
                                    {e?.data?.rd?.promiseDatef ?? ""}
                                  </b>
                                </div>
                              </div>
                              <div className="job16A">
                                <div>
                                  PARTY: <b>{e?.data?.rd?.CustomerCode}</b>
                                </div>
                                <div>
                                  <b style={{ paddingRight: "1px" }}>
                                    {e?.data?.rd?.MetalType ?? ""}{" "}
                                    {e?.data?.rd?.MetalColorCo ?? ""}
                                  </b>
                                </div>{" "}
                              </div>
                              <div className="job16A">
                                <div>
                                  DGN:<b>{e?.data?.rd?.Designcode}</b>
                                </div>
                                <div>
                                  ORD NO:- <b>{e?.data?.rd?.OrderNo}</b>
                                </div>
                              </div>
                              <div className="job16A">
                                <div>
                                  SIZE:<b>{e?.data?.rd?.Size}</b>
                                </div>
                                <div>PO: {e?.data?.rd?.PO?.slice(0, 6)}</div>
                                <div>
                                  <b>{e?.data?.rd?.prioritycode}</b>
                                </div>
                              </div>
                            </div>
                            <div className="header16AjobInfo2">
                              <div className="material16A">
                                <div className="mate16A">
                                  <div className="prop16A pcs16Aw">
                                    <b className="fs16A">NET WT:</b>
                                  </div>
                                  <div className="prop16A pcs16Aw">
                                    <b className="fs16A">DIA PCS:</b>
                                  </div>
                                  <div className="prop16A pcs16Aw">
                                    <b className="fs16A">CLR PCS:</b>
                                  </div>
                                  <div
                                    className="prop16A pcs16Aw"
                                    style={{ borderBottom: "0px" }}
                                  >
                                    <b className="fs16A">QT NO:</b>
                                  </div>
                                </div>
                                <div
                                  className="mate16A"
                                  style={{ width: "15rem" }}
                                >
                                  <div className="prop16A wt16A">
                                    <b className="fs16A">
                                      {e?.data?.rd?.netwt ?? 0}
                                    </b>
                                  </div>
                                  <div className="prop16A wt16A">
                                    <b className="fs16A">
                                      {e?.additional?.dia?.diaPcs}
                                    </b>
                                  </div>
                                  <div className="prop16A wt16A">
                                    <b className="fs16A">
                                      {e?.additional?.clr?.clrPcs}
                                    </b>
                                  </div>
                                  <div
                                    className="prop16A wt16A"
                                    style={{ borderBottom: "0px" }}
                                  >
                                    <b className="fs16A">
                                      {e?.data?.rd?.Quotation_SKUNo}
                                    </b>
                                  </div>
                                </div>
                                <div className="mate16A">
                                  <div className="prop16A grw16A">
                                    <b className="fs16A">GR WT:</b>
                                  </div>
                                  <div className="prop16A grw16A">
                                    <b className="fs16A">DIA WT:</b>
                                  </div>
                                  <div className="prop16A grw16A">
                                    <b className="fs16A">CLR WT:</b>
                                  </div>
                                  <div
                                    className="prop16A grw16A"
                                    style={{ borderBottom: "0px" }}
                                  >
                                    <b className="fs16A">CREATED BY:</b>
                                  </div>
                                </div>
                                <div
                                  className="mate16A"
                                  style={{
                                    borderRight: "0px solid",
                                    width: "14rem",
                                  }}
                                >
                                  <div className="prop16A wt16A">
                                    <b className="fs16A">
                                      {e?.data?.rd?.ActualGrossweight?.toFixed(
                                        3
                                      )}
                                    </b>
                                  </div>
                                  <div className="prop16A wt16A">
                                    <b className="fs16A">
                                      {e?.additional?.dia?.diaWt?.toFixed(3)}
                                    </b>
                                  </div>
                                  <div className="prop16A wt16A">
                                    <b className="fs16A">
                                      {e.additional?.clr?.clrWt?.toFixed(3)}
                                    </b>
                                  </div>
                                  <div
                                    className="prop16A wt16A"
                                    style={{ borderBottom: "0px" }}
                                  >
                                    <b className="fs16A">
                                      {e?.data?.rd?.createby}
                                    </b>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="img16A">
                            <img
                              src={
                                e?.data?.rd?.DesignImage !== '' 
                                          ? e?.data?.rd?.DesignImage
                                  : require("../../assets/img/default.jpg")
                              }
                              alt=""
                              id="img16A"
                              className="img16Aid"
                              preload="auto"
                              onError={(e) => handleImageError(e)}
                            
                              loading="eager"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="main16A">
                        <div className="tableBarcdoe16A">
                          <div className="hello">
                            <div className="table16A">
                              <div className="thead16A">
                                <div className="mate16AD rmw16Apx">
                                  <div className="rmtype16A ">
                                    <b
                                      style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      RM TYPE
                                    </b>
                                  </div>
                                </div>
                                <div className="mate16AD qw16Apx">
                                  <div className="rmtype16A ">
                                    <b
                                      style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      QUALITY
                                    </b>
                                  </div>
                                </div>
                                <div className="mate16AD qw16Apx">
                                  <div className="rmtype16A ">
                                    <b
                                      style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      COLOR
                                    </b>
                                  </div>
                                </div>
                                <div className="mate16AD sw16Apx">
                                  <div className="rmtype16A ">
                                    <b
                                      style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      SIZE
                                    </b>
                                  </div>
                                </div>
                                <div className="mate16AD a16Apx">
                                  <div className="rmtype16A ">
                                    <b
                                      style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      ACTUAL
                                    </b>
                                  </div>
                                </div>
                                <div className="mate16AD w16Apx">
                                  <div className="rmtype16A ">
                                    <b
                                      style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      WT
                                    </b>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {Array.from({ length: 14 }, (_, indexmt) => (
                              <div className="table16A" key={indexmt}>
                                <div className="thead16A">
                                  <div className="mate16AD rmw16Apx">
                                    <div className="rmtype16A "></div>
                                  </div>
                                  <div className="mate16AD qw16Apx">
                                    <div className="rmtype16A "></div>
                                  </div>
                                  <div className="mate16AD qw16Apx">
                                    <div className="rmtype16A "></div>
                                  </div>
                                  <div className="mate16AD sw16Apx">
                                    <div className="rmtype16A "></div>
                                  </div>
                                  <div className="mate16AD a16Apx">
                                    <div className="actpcs16A ">
                                      <div
                                        className="rmtype16A pcswtactual16A"
                                        style={{
                                          borderRight: "1px solid black",
                                        }}
                                      ></div>
                                      <div className="rmtype16A pcswtactual16AA"></div>
                                    </div>
                                  </div>
                                  <div className="mate16AD w16Apx">
                                    <div className="rmtype16A "></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="barcode16A">
                            {e?.data?.rd?.serialjobno !== undefined && (
                              <BarcodeGenerator
                                data={e?.data?.rd?.serialjobno ?? ""}
                              />
                            )}
                          </div>
                        </div>
                        <div>
                          <div style={{ borderTop: "0.5px solid black" }}>
                            <div className="issue16A">
                              <div className="rmtype16AE"></div>
                              <div className="rmtype16AE">
                                <b>GRAND</b>
                              </div>
                              <div className="rmtype16AE">
                                <b>FILLING</b>
                              </div>
                              <div className="rmtype16AE">
                                <b>EPD</b>
                              </div>
                              <div className="rmtype16AE">
                                <b>P.P.</b>
                              </div>
                              <div className="rmtype16AE">
                                <b>SET.</b>
                              </div>
                              <div className="rmtype16AE">
                                <b>F.P.</b>
                              </div>
                              <div
                                className="rmtype16AE"
                                style={{ borderRight: "0px" }}
                              >
                                <b>RHD-QC</b>
                              </div>
                            </div>
                            <div>
                              <div className="issue16A">
                                <div className="rmtype16AE">ISSUE</div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div
                                  className="rmtype16AE"
                                  style={{ borderRight: "0px" }}
                                ></div>
                              </div>
                              <div className="issue16A">
                                <div className="rmtype16AE">RECEIVE</div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div
                                  className="rmtype16AE"
                                  style={{ borderRight: "0px" }}
                                ></div>
                              </div>
                              <div className="issue16A">
                                <div className="rmtype16AE">PCS</div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div
                                  className="rmtype16AE"
                                  style={{ borderRight: "0px" }}
                                ></div>
                              </div>
                              <div className="issue16A">
                                <div className="rmtype16AE">SCRAP</div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div className="rmtype16AE"></div>
                                <div
                                  className="rmtype16AE"
                                  style={{ borderRight: "0px" }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="footer16A">
                        <div className="ins16A b16A" style={{ height: "27px" }}>
                          DGN INS: {e?.data?.rd?.officeuse?.slice(0, 100)}
                        </div>
                        <div className="ins16A b16A" style={{ height: "27px" }}>
                          PRD INS:{" "}
                          {(e?.data?.rd?.ProductInstruction?.length > 0 ? checkInstruction(e?.data?.rd?.ProductInstruction) : checkInstruction(e?.data?.rd?.QuoteRemark))?.slice(0, 100)}
                        </div>
                        <div
                          className="ins16A b16A"
                          style={{ borderBottom: "0px", height: "25px" }}
                        >
                          CUST INS:{" "}
                          {e?.data?.rd?.custInstruction?.slice(0, 100)}
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    e?.additional?.chdata?.length > 0 &&
                    e?.additional?.chdata?.map((chunk, indexnmt) => {
                      
                    
                      return (
                        <React.Fragment key={indexnmt}>
                          <div className="containerprint16A">
                            <div className="head16A">
                              <div className="header16A">
                                <div className="headJob16A">
                                  <div className="header16AjobInfo">
                                    <div className="job16A">
                                      <div>
                                        <b style={{ fontSize: "12px" }}>
                                          {e?.data?.rd?.serialjobno}
                                        </b>
                                      </div>
                                      <div>
                                        ORD:{" "}
                                        <b>
                                          {e?.data?.rd?.orderDatef?.slice(
                                            0,
                                            11
                                          )}
                                        </b>
                                      </div>
                                      <div>
                                        DUE:
                                        <b style={{ paddingRight: "1px" }}>
                                          {e?.data?.rd?.promiseDatef?.slice(
                                            0,
                                            11
                                          )}
                                        </b>
                                      </div>
                                    </div>
                                    <div className="job16A">
                                      <div>
                                        PARTY:{" "}
                                        <b>{e?.data?.rd?.CustomerCode}</b>
                                      </div>
                                      <div>
                                        <b style={{ paddingRight: "1px" }}>
                                          {e?.data?.rd?.MetalType +
                                            " " +
                                            e?.data?.rd?.MetalColorCo}
                                        </b>
                                      </div>{" "}
                                    </div>
                                    <div className="job16A">
                                      <div>
                                        DGN:<b>{e?.data?.rd?.Designcode}</b>
                                      </div>
                                      <div>
                                        ORD NO:-{" "}
                                        <b>{e?.data?.rd?.OrderNo}</b>
                                      </div>
                                    </div>
                                    <div className="job16A">
                                      <div>
                                        SIZE:<b>{e?.data?.rd?.Size}</b>
                                      </div>
                                      <div>
                                        PO:{" "}
                                        <b>{e?.data?.rd?.PO?.slice(0, 6)}</b>
                                      </div>
                                      <div>
                                        <b>{e?.data?.rd?.prioritycode}</b>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="header16AjobInfo2">
                                    <div className="material16A">
                                      <div className="mate16A">
                                        <div className="prop16A pcs16Aw">
                                          <b className="fs16A ">NET WT:</b>
                                        </div>
                                        <div className="prop16A pcs16Aw">
                                          <b className="fs16A ">DIA PCS:</b>
                                        </div>
                                        <div className="prop16A pcs16Aw">
                                          <b className="fs16A ">CLR PCS:</b>
                                        </div>
                                        <div
                                          className="prop16A pcs16Aw"
                                          style={{ borderBottom: "0px" }}
                                        >
                                          <b className="fs16A">QT NO :</b>
                                        </div>
                                      </div>
                                      <div
                                        className="mate16A"
                                        style={{ width: "15rem" }}
                                      >
                                        <div className="prop16A wt16A">
                                          <b className="fs16A">
                                            {(
                                              e?.data?.rd?.netwt ?? 0
                                            ).toFixed(3)}
                                          </b>
                                        </div>
                                        <div className="prop16A wt16A">
                                          <b className="fs16A">
                                            {e?.additional?.dia?.diaPcs === 0
                                              ? 0
                                              : e?.additional?.dia?.diaPcs}
                                          </b>
                                        </div>
                                        <div className="prop16A wt16A">
                                          <b className="fs16A">
                                            {e?.additional?.clr?.clrPcs === 0
                                              ? 0
                                              : e?.additional?.clr?.clrPcs}
                                          </b>
                                        </div>
                                        <div
                                          className="prop16A wt16A"
                                          style={{ borderBottom: "0px" }}
                                        >
                                          <b className="fs16A">
                                            {e?.data?.rd?.Quotation_SKUNo}
                                          </b>
                                        </div>
                                      </div>
                                      <div className="mate16A">
                                        <div className="prop16A grw16A">
                                          <b className="fs16A">GR WT:</b>
                                        </div>
                                        <div className="prop16A grw16A">
                                          <b className="fs16A">DIA WT:</b>
                                        </div>
                                        <div className="prop16A grw16A">
                                          <b className="fs16A">CLR WT:</b>
                                        </div>
                                        <div
                                          className="prop16A grw16A"
                                          style={{ borderBottom: "0px" }}
                                        >
                                          <b className="fs16A">CREATED BY:</b>
                                        </div>
                                      </div>
                                      <div
                                        className="mate16A"
                                        style={{
                                          borderRight: "0px solid",
                                          width: "13rem",
                                        }}
                                      >
                                        <div className="prop16A wt16A">
                                          <b className="fs16A">
                                            {e?.data?.rd?.ActualGrossweight?.toFixed(
                                              3
                                            )}
                                          </b>
                                        </div>
                                        <div className="prop16A wt16A">
                                          <b className="fs16A">
                                            {(e?.additional?.dia?.diaWt === 0
                                              ? 0
                                              : e?.additional?.dia?.diaWt
                                            ).toFixed(3)}
                                          </b>
                                        </div>
                                        <div className="prop16A wt16A">
                                          <b className="fs16A">
                                            {(e?.additional?.clr?.clrWt === 0
                                              ? 0
                                              : e.additional?.clr?.clrWt
                                            ).toFixed(3)}
                                          </b>
                                        </div>
                                        <div
                                          className="prop16A wt16A"
                                          style={{ borderBottom: "0px" }}
                                        >
                                          <b className="fs16A">
                                            {e?.data?.rd?.createby}
                                          </b>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="img16A">
                                  <img
                                    // src={
                                    //   e.additional.img !== ""
                                    //     ? e.additional.img
                                    //     : require("../../assets/img/default.jpg")
                                    // }
                                    src={
                                      e?.data?.rd?.DesignImage !== '' 
                                          ? e?.data?.rd?.DesignImage
                                        : require("../../assets/img/default.jpg")
                                    }
                                    alt=""
                                    className="img16Aid"
                                    preload="auto"
                                    onError={(e) => handleImageError(e)}
                                  
                                    loading="eager"
                                    id="img16A"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="main16A">
                              <div className="tableBarcdoe16A">
                                <div className="hello">
                                  <div className="table16A">
                                    <div className="thead16A">
                                      <div className="mate16AD rmw16Apx">
                                        <div className="rmtype16A">
                                          <b
                                            style={{
                                              width: "100%",
                                              display: "flex",
                                              justifyContent: "center",
                                            }}
                                          >
                                            RM TYPE
                                          </b>
                                        </div>
                                      </div>
                                      <div className="mate16AD qw16Apx">
                                        <div className="rmtype16A">
                                          <b
                                            style={{
                                              width: "100%",
                                              display: "flex",
                                              justifyContent: "center",
                                            }}
                                          >
                                            QUALITY
                                          </b>
                                        </div>
                                      </div>
                                      <div className="mate16AD qw16Apx">
                                        <div className="rmtype16A">
                                          <b
                                            style={{
                                              width: "100%",
                                              display: "flex",
                                              justifyContent: "center",
                                            }}
                                          >
                                            COLOR
                                          </b>
                                        </div>
                                      </div>
                                      <div className="mate16AD sw16Apx">
                                        <div className="rmtype16A">
                                          <b
                                            style={{
                                              width: "100%",
                                              display: "flex",
                                              justifyContent: "center",
                                            }}
                                          >
                                            SIZE
                                          </b>
                                        </div>
                                      </div>
                                      <div className="mate16AD a16Apx">
                                        <div className="rmtype16A">
                                          <b
                                            style={{
                                              width: "100%",
                                              display: "flex",
                                              justifyContent: "center",
                                            }}
                                          >
                                            ACTUAL
                                          </b>
                                        </div>
                                      </div>
                                      <div className="mate16AD w16Apx">
                                        <div className="rmtype16A">
                                          <b
                                            style={{
                                              width: "100%",
                                              display: "flex",
                                              justifyContent: "center",
                                            }}
                                          >
                                            WT
                                          </b>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {chunk?.data?.map((e, indexmap) => {
                                    return (
                                      <div className="table16A" key={indexmap}>
                                        <div className="thead16A">
                                          {e?.Shapename === "TOTAL" ? (
                                            <div className="mate16AD rmw16Apx">
                                              <div className="rmtype16A">
                                                <b
                                                  style={{ fontSize: "9.5px" }}
                                                >
                                                  {e?.Shapename?.slice(0, 15)}
                                                </b>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="mate16AD rmw16Apx">
                                              <div className="rmtype16A">
                                                {e?.Shapename?.slice(0, 15)}
                                              </div>
                                            </div>
                                          )}
                                          <div className="mate16AD qw16Apx">
                                            <div className="rmtype16A ">
                                              {e?.QualityCode?.slice(0, 9)}
                                            </div>
                                          </div>
                                          <div className="mate16AD qw16Apx">
                                            <div className="rmtype16A ">
                                              {e?.MetalColor?.slice(0, 9)}
                                            </div>
                                          </div>
                                          <div className="mate16AD sw16Apx">
                                            <div className="rmtype16A ">
                                              {e?.Sizename?.slice(0, 15)}
                                            </div>
                                          </div>
                                          {e?.Shapename === "TOTAL" ? (
                                            <div className="mate16AD a16Apx">
                                              <div className="actpcs16A ">
                                                <div
                                                  className="rmtype16A pcswtactual16A"
                                                  style={{
                                                    borderRight:
                                                      "1px solid black",
                                                  }}
                                                >
                                                  <b
                                                    style={{
                                                      fontSize: "8.5px",
                                                      display: "flex",
                                                      justifyContent:
                                                        "flex-end",
                                                      width: "100%",
                                                      paddingRight: "1px",
                                                    }}
                                                  >
                                                    {e?.ActualPcs?.toString()}
                                                  </b>
                                                </div>
                                                <div className="rmtype16A pcswtactual16AA">
                                                  <b
                                                    style={{
                                                      fontSize: "8.5px",
                                                      width: "100%",
                                                      lineHeight: "7px",
                                                      display: "flex",
                                                      justifyContent:
                                                        "flex-end",
                                                      alignItems: "center",
                                                      paddingRight: "1px",
                                                    }}
                                                  >
                                                    {e?.ActualWeight?.toFixed(
                                                      3
                                                    )?.toString()}
                                                  </b>
                                                </div>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="mate16AD a16Apx">
                                              <div className="actpcs16A ">
                                                <div
                                                  className="rmtype16A pcswtactual16A"
                                                  style={{
                                                    borderRight:
                                                      "1px solid black",
                                                    fontSize: "8.5px",
                                                    display: "flex",
                                                    justifyContent: "flex-end",
                                                    paddingRight: "1px",
                                                  }}
                                                >
                                                  {e?.ActualPcs}
                                                </div>
                                                <div
                                                  className="rmtype16A pcswtactual16AA"
                                                  style={{
                                                    display: "flex",
                                                    justifyContent: "flex-end",
                                                    fontSize: "8.5px",
                                                    alignItems: "center",
                                                    paddingRight: "1px",
                                                  }}
                                                >
                                                  {e?.ActualWeight?.toFixed(
                                                    3
                                                  )?.toString()}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                          <div className="mate16AD w16Apx">
                                            <div className="rmtype16A "></div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {Array.from(
                                    { length: chunk?.length },
                                    (_, nth) => (
                                      <div className="table16A" key={nth}>
                                        <div className="thead16A">
                                          <div className="mate16AD rmw16Apx">
                                            <div className="rmtype16A"></div>
                                          </div>
                                          <div className="mate16AD qw16Apx">
                                            <div className="rmtype16A"></div>
                                          </div>
                                          <div className="mate16AD qw16Apx">
                                            <div className="rmtype16A"></div>
                                          </div>
                                          <div className="mate16AD sw16Apx">
                                            <div className="rmtype16A"></div>
                                          </div>
                                          <div className="mate16AD a16Apx">
                                            <div className="actpcs16A">
                                              <div
                                                className="rmtype16A pcswtactual16A"
                                                style={{
                                                  borderRight:
                                                    "1px solid black",
                                                }}
                                              ></div>
                                              <div className="rmtype16A pcswtactual16AA"></div>
                                            </div>
                                          </div>
                                          <div className="mate16AD w16Apx">
                                            <div className="rmtype16A"></div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                                <div className="barcode16A">
                                  {" "}
                                  {e?.data?.rd?.serialjobno !==
                                    undefined && (
                                    <BarcodeGenerator
                                      data={e?.data?.rd?.serialjobno}
                                    />
                                  )}
                                </div>
                              </div>
                              <div>
                                <div style={{ borderTop: "0.5px solid black" }}>
                                  <div className="issue16A">
                                    <div className="rmtype16AE"></div>
                                    <div className="rmtype16AE">
                                      <b>GRAND</b>
                                    </div>
                                    <div className="rmtype16AE">
                                      <b>FILLING</b>
                                    </div>
                                    <div className="rmtype16AE">
                                      <b>EPD</b>
                                    </div>
                                    <div className="rmtype16AE">
                                      <b>P.P.</b>
                                    </div>
                                    <div className="rmtype16AE">
                                      <b>SET.</b>
                                    </div>
                                    <div className="rmtype16AE">
                                      <b>F.P.</b>
                                    </div>
                                    <div
                                      className="rmtype16AE"
                                      style={{ borderRight: "0px" }}
                                    >
                                      <b>RHD-QC</b>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="issue16A">
                                      <div className="rmtype16AE">ISSUE</div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div
                                        className="rmtype16AE"
                                        style={{ borderRight: "0px" }}
                                      ></div>
                                    </div>
                                    <div className="issue16A">
                                      <div className="rmtype16AE">RECEIVE</div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div
                                        className="rmtype16AE"
                                        style={{ borderRight: "0px" }}
                                      ></div>
                                    </div>
                                    <div className="issue16A">
                                      <div className="rmtype16AE">PCS</div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div
                                        className="rmtype16AE"
                                        style={{ borderRight: "0px" }}
                                      ></div>
                                    </div>
                                    <div className="issue16A">
                                      <div className="rmtype16AE">SCRAP</div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div className="rmtype16AE"></div>
                                      <div
                                        className="rmtype16AE"
                                        style={{ borderRight: "0px" }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="footer16A">
                              <div
                                className="ins16A b16A"
                                style={{ height: "27px" }}
                              >
                                DGN INS:{" "}
                              {(checkInstruction(e?.data?.rd?.officeuse))?.slice(0, 100)}
                              </div>
                              <div
                                className="ins16A b16A"
                                style={{ height: "27px" }}
                              >
                                PRD INS:{" "}
                                {((e?.data?.rd?.ProductInstruction?.length > 0 ? checkInstruction(e?.data?.rd?.ProductInstruction) : checkInstruction(e?.data?.rd?.QuoteRemark)))?.slice(0, 100)}
                              </div>
                              <div
                                className="ins16A b16A"
                                style={{ borderBottom: "0px", height: "25px" }}
                              >
                                CUST INS:{" "}
                                {(checkInstruction(e?.data?.rd?.custInstruction))?.slice(0, 100)}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  );
                }
              })}
            </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BagPrint16A;
