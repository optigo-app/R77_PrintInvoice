import React, { useEffect, useState } from "react";
import printData from "../../assets/json/print_2.json";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import "../../assets/css/bagprint/print16.css";
import Loader from "../../components/Loader";
import BarcodeGenerator from "../../components/BarcodeGenerator";
import { GetData } from "./../../GlobalFunctions/GetData";
import { organizeData } from "./../../GlobalFunctions/OrganizeBagPrintData";
import { GetChunkData } from "../../GlobalFunctions/GetChunkData";
import { GetUniquejob } from "../../GlobalFunctions/GetUniqueJob";
// import { checkInstruction } from "../../GlobalFunctions";

const PrintDesign16 = ({ queries, headers }) => {
  const location = useLocation();
  const queryParams = queryString?.parse(location?.search);
  const resultString = GetUniquejob(queryParams?.str_srjobno);
  const [data, setData] = useState([]);
  const chunkSize = 15;
 

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

        console.log("all datas", allDatas);
        

        let datas = organizeData(allDatas?.rd, allDatas?.rd1);
        console.log('datas', datas);
        
        // eslint-disable-next-line array-callback-return
        if (datas?.length === 0) {
          setData(['Data Not Present'])
        } else {
          datas?.map((a) => {
            let length = 0;
            let clr = {
              clrPcs: 0,
              clrWt: 0,
            };
            let dia = {
              diaPcs: 0,
              diaWt: 0,
            };
            let fin = {
              finPcs: 0,
              finWt: 0,
            };
            let mi = {
              miPcs: 0,
              minWt: 0,
            };
            let diamondData = [];
            let clrData = [];
            let finData = [];
            let miData = [];
            let diamondWeight = 0;
            let diamondPcs = 0;
            let clrWeight = 0;
            let clrpcs = 0;

            let finWeight = 0;
            let finpcs = 0;

            let miWeight = 0;
            let minpcs = 0;
            // eslint-disable-next-line array-callback-return
            a?.rd1?.map((e, i) => {
              if (
                e?.MasterManagement_DiamondStoneTypeid === 3 ||
                e?.MasterManagement_DiamondStoneTypeid === 4
              ) {
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
              else if (e?.MasterManagement_DiamondStoneTypeid === 5) {
                fin.finPcs = fin.finPcs + e?.ActualPcs;
                fin.finWt = clr.finWt + e?.ActualWeight;
                finData.push(e);
                finWeight = finWeight + e?.ActualWeight;
                finpcs = finpcs + e?.ActualPcs;
              }
              else if (e?.MasterManagement_DiamondStoneTypeid === 7) {
                mi.miPcs = mi.miPcs + e?.ActualPcs;
                mi.minWt = mi.minWt + e?.ActualWeight;
                miData.push(e);
                miWeight = miWeight + e?.ActualWeight;
                minpcs = minpcs + e?.ActualPcs;
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
                Shapename: "Total",
                Size_DisplayOrder: "",
                Sizename: "",
                TruncateShapename: "",
                totalFontWeight: "900",
              };
              diamondData.push(diamondDataObject);
            }
            if (clrData.length > 0) {
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
                Shapename: "Total",
                Size_DisplayOrder: "",
                Sizename: "",
                TruncateShapename: "",
                totalFontWeight: "900",
              };
              clrData.push(clrDataObject);
            }

            // if (finData.length > 0) {
            //   let finDataObject = {
            //     ActualPcs: finpcs,
            //     ActualWeight: finWeight,
            //     ColorCode: "",
            //     ColorName: "",
            //     ConcatedFullShapeQualityColorCode: "",
            //     ConcatedFullShapeQualityColorName: "",
            //     ConcatedShapeQualityColorName: "",
            //     IssuePcs: "",
            //     IssueWeight: "",
            //     LimitedShapeQualityColorCode: "",
            //     MasterManagement_DiamondStoneTypeid: "",
            //     MetalColor: "",
            //     Quality: "",
            //     QualityCode: "",
            //     Quality_DisplayOrder: "",
            //     SerialJobno: "",
            //     Shapecode: "",
            //     Shapename: "Total",
            //     Size_DisplayOrder: "",
            //     Sizename: "",
            //     TruncateShapename: "",
            //     totalFontWeight: "900",
            //   };
            //   finData.push(finDataObject);
            // }

            if (miData.length > 0) {
              let miDataObject = {
                ActualPcs: minpcs,
                ActualWeight: miWeight,
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
                Shapename: "Total",
                Size_DisplayOrder: "",
                Sizename: "",
                TruncateShapename: "",
                totalFontWeight: "900",
              };
              miData.push(miDataObject);
            }
            
            console.log("TCL: fetchData -> finData", finData)
            let originlData = [...diamondData, ...clrData,...miData,...finData];
            let chData = [];
            let count = 0;
            for (let i = 0; i < originlData?.length; i += chunkSize) {
              let len = 15 - originlData?.slice(i, i + chunkSize)?.length;
              count++;

              if (count % 5 === 0) {
              }
              chData?.push({
                data: originlData?.slice(i, i + chunkSize),
                length: len,
              });
            }
            if (chData?.length === 0) {
              length = 15;
            } else {
              length = 13 - length;
            }
            let imagePath = queryParams?.imagepath;
            imagePath = atob(queryParams?.imagepath);
            let img = imagePath + a?.rd?.ThumbImagePath;
            let arrofchunk = GetChunkData(chunkSize, chData);
                    
              arrofchunk = arrofchunk.slice(0, 1);
            responseData.push({
              data: a,
              additional: {
                length: length,
                clr: clr,
                dia: dia,
                img: img,
                chdata: chData,
                pages: arrofchunk,
              },
            });
          });
          setData(responseData);

        }
        console.log('organized data', datas);
        
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageError = (e) => {
    e.target.src = require("../../assets/img/default.jpg");
  };

  useEffect(() => {
    if (data?.length !== 0) {
      if (data?.length === 1 && data[0] === 'Data Not Present') {
        return
      } else {
        setTimeout(() => {
          window.print();
        }, 5000);
      }
    }
  }, [data]);

  const handlePrint = (e) => {
    if (data?.length !== 0) {
      if (data?.length === 1 && data[0] === 'Data Not Present') {
        return
      } else {
        setTimeout(() => {
          window.print();
        }, 500);
      }
    }
  };


  return (
    <div>
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
            <div className="d_flex flex_wrap  print_section bag_design_2">
              {Array?.from(
                { length: queries?.pageStart },
                (_, index) =>
                  index > 0 && (
                    <div
                      key={index}
                      className="container_2 ml_8mm mb_2 mt_2 pt_2 bag_2"
                      style={{ minHeight: "139mm" }}
                    ></div>
                  )
              )}

              {(data?.length === 1 && data[0] === 'Data Not Present') ? <div className="mt-4 w-100 text-center fs-4 fw-bold text-danger">Data Not Present</div> : data?.map((e, i) => {

                if (e?.additional?.chdata?.length === 0) {
                  return (
                    <React.Fragment key={`bagprint16${i}`}>
                      <div
                        className="container_2 ml_8mm mb_2 mt_2 pt_2 bag_2"

                      >
                        <div className="print_2 ">
                          <div className="border_collapse print_design_2">
                            <div
                              style={{
                                justifyContent: "space-between",
                                borderBottom: "2px solid",
                                borderTop: "0.5291666667mm solid #000",
                                borderRight: "0.2645833333mm solid #000",
                              }}
                              className="d_flex"
                            >
                              <div className="print_design_2_head">
                                <div
                                  className="thikborder"
                                  style={{
                                    background: " #8aff14",
                                    borderRight: "1px solid black",
                                  }}
                                >

                                  <div className="bg16oldjob">
                                    <div className="bg16oldlh7">

                                      {e?.data?.rd?.serialjobno}
                                    </div>
                                    <div className="bg16oldlh7">
                                      <span className="bg16oldlh7">ORD:</span>

                                      <span className="bg16oldlh7">{(e?.data?.rd?.orderDatef !== "01Jan00" && e?.data?.rd?.orderDatef !== "01Jan1900") && e?.data?.rd?.orderDatef}</span>
                                    </div>
                                    <div style={{ color: "red" }}>
                                      <span className="bg16oldlh7"></span>
                                      <span className="bg16oldlh7">{(e?.data?.rd?.promiseDatef !== "01Jan00" && e?.data?.rd?.promiseDatef !== "01Jan1900") && `DUE: ${e?.data?.rd?.promiseDatef}`}</span>
                                    </div>
                                  </div>
                                  <div className="partybg16">
                                    <div className="d-flex"><div className="lh16bg">PARTY: </div><div className="lh16bg">{e?.data?.rd?.CustomerCode}</div></div>
                                    <div>{e?.data?.rd?.MetalType + " " + e?.data?.rd?.MetalColor}</div>
                                  </div>
                                  <div className="d_flex print_2_head">
                                    <div className="text_start  pl_3">
                                      DGN:
                                      <span
                                        style={{
                                          fontWeight: "700",
                                          fontSize: "2.8mm",
                                          lineHeight: "8px"
                                        }}
                                      >

                                        {/* {e?.data?.rd?.Designcode1}{e?.data?.rd?.IsSplits_Quotation_Quantity} Pcs */}
                                        {e?.data?.rd?.IsSplits_Quotation_Quantity === 0
                                          ? `${e?.data?.rd?.Designcode1
                                          }(${e?.data?.rd?.IsSplits_Quotation_Quantity}PCS)`
                                          : `${e?.data?.rd?.Designcode1}(${e?.data?.rd?.IsSplits_Quotation_Quantity} PCS)`}
                                      </span>
                                      <span
                                        style={{ fontWeight: "normal" }}
                                      ></span>
                                    </div>
                                    <div
                                      className="text_start"
                                      style={{
                                        textAlign: "right",
                                        paddingRight: "1.3229166667mm",
                                      }}
                                    >
                                      ORD NO:-{" "}
                                      <span style={{ fontWeight: "700", lineHeight: "7px" }}>
                                        {e?.data?.rd?.OrderNo}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="d_flex print_2_head border_bottom2">
                                    <div className="text_start pl_3">
                                      SIZE:
                                      <span style={{ fontWeight: "700" }}>
                                        {e?.data?.rd?.Size}
                                      </span>
                                    </div>
                                    <div className="text_start">
                                      PO:{" "}
                                      <span style={{ fontWeight: "700" }}>
                                        {e?.data?.rd?.PO}
                                      </span>
                                    </div>
                                    <div
                                      className="text_start"
                                      style={{
                                        textAlign: "center",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      {e?.data?.rd?.prioritycode}
                                    </div>
                                  </div>
                                </div>

                                <div className="">
                                  <div className="header_16">
                                    <div className="jobInfo16">
                                      <div className="net16A">
                                        <b>NET WT:</b>
                                      </div>
                                      <div className="net16A">
                                        <b>DIA PCS:</b>
                                      </div>
                                      <div className="net16A">
                                        <b>CLR PCS:</b>
                                      </div>
                                      <div
                                        className="net16A"
                                        style={{ borderBottom: "0px" }}
                                      >
                                        <b>QT NO.</b>
                                      </div>
                                    </div>
                                    <div className="jobInfo16">
                                      <div className="net16A">

                                        <b>
                                          {(+e?.data?.rd?.netwt)?.toFixed(3)}
                                          {/* {(+e?.data?.rd?.MetalWeight)?.toFixed(3)?.slice(0, 8)} */}
                                        </b>
                                      </div>
                                      <div className="net16A">
                                        <b>
                                          {e?.additional?.dia?.diaPcs === 0
                                            ? 0
                                            : e?.additional?.dia?.diaPcs}
                                        </b>
                                      </div>
                                      <div className="net16A">
                                        <b>
                                          {e?.additional?.clr?.clrPcs === 0
                                            ? 0
                                            : e?.additional?.clr?.clrPcs}
                                        </b>
                                      </div>
                                      <div
                                        className="net16A"
                                        style={{ borderBottom: "0px" }}
                                      >
                                        <b>
                                          {e?.data?.rd?.Quotation_SKUNo === ""
                                            ? 0
                                            : e?.data?.rd?.Quotation_SKUNo}
                                        </b>
                                      </div>
                                    </div>
                                    <div className="jobInfo16">
                                      <div
                                        className="net16A"
                                        style={{ width: "67px" }}
                                      >
                                        <b>GR WT:</b>
                                      </div>
                                      <div
                                        className="net16A"
                                        style={{ width: "67px" }}
                                      >
                                        <b>DIA WT:</b>
                                      </div>
                                      <div
                                        className="net16A"
                                        style={{ width: "67px" }}
                                      >
                                        <b>CLR WT:</b>
                                      </div>
                                      <div
                                        className="net16A"
                                        style={{
                                          width: "67px",
                                          borderBottom: "0px",
                                        }}
                                      >
                                        <b>CREATED BY:</b>
                                      </div>
                                    </div>
                                    <div
                                      className="jobInfo16"
                                      style={{
                                        borderRight: "0px",
                                        borderLeft: "0px solid",
                                      }}
                                    >
                                      <div className="net16A">
                                        <b>
                                          {(
                                            e?.data?.rd?.ActualGrossweight ?? 0
                                          ).toFixed(3)}
                                        </b>
                                      </div>
                                      <div className="net16A">
                                        <b>
                                          {(e?.additional?.dia?.diaWt === 0
                                            ? 0
                                            : e?.additional?.dia?.diaWt
                                          ).toFixed(3)}
                                        </b>
                                      </div>
                                      <div className="net16A">
                                        <b>
                                          {(e?.additional?.clr?.clrWt === 0
                                            ? 0
                                            : e?.additional?.clr?.clrWt
                                          ).toFixed(3)}
                                        </b>
                                      </div>
                                      <div
                                        className="net16A"
                                        style={{ borderBottom: "0px" }}
                                      >
                                        <b>
                                          {e?.data?.rd?.createby === ""
                                            ? ""
                                            : e?.data?.rd?.createby}
                                        </b>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div
                                style={{ height: "130px" }}
                                className="text_start position_relative thikborder"
                              >
                                <div>
                                  <img
                                    src={
                                      e?.data?.rd?.DesignImage !== ''
                                        ? e?.data?.rd?.DesignImage
                                        : require("../../assets/img/default.jpg")
                                    }
                                    alt=""
                                    className="img16"
                                    onError={(e) => handleImageError(e)}
                                    loading="eager"
                                    id="img16"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="border_bottom_0 border_right">
                              <div className="thikborder">
                                <div className="d_flex">
                                  <div
                                    className="border_right border_bottom display"
                                    style={{
                                      height: "3.7041666667mm",
                                      fontWeight: "900",
                                      paddingLeft: "0.79375mm",
                                      width: "14.853583333mm",
                                      fontSize: "11.5px",
                                    }}
                                  >
                                    RM TYPE
                                  </div>
                                  <div
                                    className="border_right border_bottom display"
                                    style={{
                                      height: "3.7041666667mm",
                                      fontSize: "11.5px",
                                      fontWeight: "900",
                                      width: "12mm",
                                      paddingLeft: "1px",
                                    }}
                                  >
                                    QUALITY
                                  </div>
                                  <div
                                    className="border_right border_bottom display"
                                    style={{
                                      height: "3.7041666667mm",
                                      fontWeight: "900",
                                      paddingLeft: "0.79375mm",
                                      width: "12.0015mm",
                                      fontSize: "11.5px",
                                    }}
                                  >
                                    COLOR
                                  </div>
                                  <div
                                    className="border_right border_bottom display"
                                    style={{
                                      height: "3.7041666667mm",
                                      fontWeight: "900",
                                      fontSize: "11.5px",
                                      paddingLeft: "0.79375mm",
                                      width: "18.880666667mm",
                                    }}
                                  >
                                    SIZE
                                  </div>
                                  <div
                                    className="border_right border_bottom display"
                                    style={{
                                      height: "3.7041666667mm",
                                      fontWeight: "900",
                                      textAlign: "center",
                                      paddingLeft: "0.79375mm",
                                      width: "16.345958333mm",
                                      fontSize: "11.5px",
                                    }}
                                  >
                                    ACTUAL
                                  </div>
                                  <div
                                    className="border_right2 border_bottom display"
                                    style={{
                                      height: "3.7041666667mm",
                                      fontWeight: "900",
                                      paddingTop: "0px",
                                      paddingLeft: "0.79375mm",
                                      width: "10.7mm",
                                      fontSize: "11px",
                                    }}
                                  >
                                    WT
                                  </div>
                                  <div
                                    className=" border_bottom position_relative barcode_design_2"
                                    rowSpan={16}
                                    style={{ padding: "0" }}
                                  >
                                    {e?.data?.rd?.serialjobno !== undefined && (
                                      <>
                                        {e?.data?.rd?.serialjobno !==
                                          undefined && (
                                            <BarcodeGenerator
                                              data={e?.data?.rd?.serialjobno}
                                            />
                                          )}
                                      </>
                                    )}
                                  </div>
                                </div>
                                {Array.from(
                                  { length: e?.additional?.length },
                                  (_, index) => (
                                    <div className="d_flex " key={index}>
                                      <div
                                        className="border_right border_bottom display"
                                        style={{
                                          width: "14.853583333mm",
                                          fontSize: "1.8520833333",
                                          height: "3.7041666667mm",
                                        }}
                                      ></div>
                                      <div
                                        className="border_right border_bottom display"
                                        style={{
                                          width: "12.0015mm",
                                          fontSize: "1.8520833333",
                                          height: "3.7041666667mm",
                                          display: "-webkit-box",
                                          lineClamp: "1",
                                          boxOrient: "vertical",
                                          overflow: "hidden",
                                        }}
                                      ></div>
                                      <div
                                        className="border_right border_bottom display"
                                        style={{
                                          width: "12.0015mm",
                                          fontSize: "1.8520833333",
                                          height: "3.7041666667mm",
                                        }}
                                      ></div>
                                      <div
                                        className="border_right border_bottom display"
                                        style={{
                                          width: "18.880666667mm",
                                          fontSize: "1.8520833333",
                                          height: "3.7041666667mm",
                                        }}
                                      ></div>
                                      <div
                                        className="border_right border_bottom display"
                                        style={{
                                          width: "7.3792291667mm",
                                          fontSize: "1.8520833333",
                                          height: "3.7041666667mm",
                                        }}
                                      ></div>
                                      <div
                                        className="border_right border_bottom display"
                                        style={{
                                          width: "8.9667291667mm",
                                          fontSize: "1.8520833333",
                                          height: "3.7041666667mm",
                                        }}
                                      ></div>
                                      <div
                                        className="border_right2 border_bottom display"
                                        style={{
                                          width: "10.79525mm",
                                          fontSize: "1.8520833333",
                                          height: "3.7041666667mm",
                                        }}
                                      ></div>
                                    </div>
                                  )
                                )}       
                              </div>
                            </div>
                            <div className="bag_footer_border_remove border_right">
                              <div className="thikborder">
                                <div className="bag_footer d_flex">
                                  <div
                                    className="border_top2 border_right border_bottom bag_td "
                                    style={{
                                      paddingLeft: "0.79375mm",
                                      height: "3.7041666667mm",
                                      fontSize: "10px",
                                      fontWeight: "900",
                                    }}
                                  ></div>
                                  <div
                                    className="border_top2 border_right border_bottom bag_td "
                                    style={{
                                      paddingLeft: "0.79375mm",
                                      height: "3.7041666667mm",
                                      fontSize: "10px",
                                      fontWeight: "900",
                                    }}
                                  >
                                    GRAND
                                  </div>
                                  <div
                                    className="border_top2 border_right border_bottom bag_td "
                                    style={{
                                      paddingLeft: "0.79375mm",
                                      height: "3.7041666667mm",
                                      fontSize: "10px",
                                      fontWeight: "900",
                                    }}
                                  >
                                    FILLING
                                  </div>
                                  <div
                                    className="border_top2 border_right border_bottom bag_td "
                                    style={{
                                      paddingLeft: "0.79375mm",
                                      height: "3.7041666667mm",
                                      fontSize: "10px",
                                      fontWeight: "900",
                                    }}
                                  >
                                    EPD
                                  </div>
                                  <div
                                    className="border_top2 border_right border_bottom bag_td "
                                    style={{
                                      paddingLeft: "0.79375mm",
                                      height: "3.7041666667mm",
                                      fontSize: "10px",
                                      fontWeight: "900",
                                    }}
                                  >
                                    P.P.
                                  </div>
                                  <div
                                    className="border_top2 border_right border_bottom bag_td "
                                    style={{
                                      paddingLeft: "0.79375mm",
                                      height: "3.7041666667mm",
                                      fontSize: "10px",
                                      fontWeight: "900",
                                    }}
                                  >
                                    SET.
                                  </div>
                                  <div
                                    className="border_top2 border_right border_bottom bag_td "
                                    style={{
                                      paddingLeft: "0.79375mm",
                                      height: "3.7041666667mm",
                                      fontSize: "10px",
                                      fontWeight: "900",
                                    }}
                                  >
                                    F.P.
                                  </div>
                                  <div
                                    className="border_top2 border_bottom bag_td "
                                    style={{
                                      paddingLeft: "0.79375mm",
                                      fontSize: "10px",
                                      height: "3.7041666667mm",
                                      fontWeight: "900",
                                    }}
                                  >
                                    RHD-QC
                                  </div>
                                </div>
                                {

                                  // eslint-disable-next-line array-callback-return
                                  printData[2]?.map((e, i) => {
                                    if (
                                      e["0"] !== "DGN INS:" &&
                                      e["0"] !== "PRD INS:" &&
                                      e["0"] !== "CUST INS:"
                                    ) {
                                      return (
                                        <div
                                          className="bag_footer d_flex last_line"
                                          key={i}
                                        >
                                          <div
                                            className="border_right border_bottom bag_td"
                                            style={{
                                              paddingLeft: "0.79375mm",
                                              height: "3.7041666667mm",
                                              fontSize: "11px",
                                            }}
                                          >
                                            {e["0"] === "0" ? "" : e["0"]}
                                          </div>
                                          <div
                                            className="border_right border_bottom bag_td"
                                            style={{
                                              paddingLeft: "0.79375mm",
                                              height: "3.7041666667mm",
                                              fontSize: "1.8520833333",
                                            }}
                                          >
                                            {e["GRAND"] === "0" ? "" : e["GRAND"]}
                                          </div>
                                          <div
                                            className="border_right border_bottom bag_td"
                                            style={{
                                              paddingLeft: "0.79375mm",
                                              height: "3.7041666667mm",
                                              fontSize: "1.8520833333",
                                            }}
                                          >
                                            {e["FILLING"] === "0"
                                              ? ""
                                              : e["FILLING"]}
                                          </div>
                                          <div
                                            className="border_right border_bottom bag_td"
                                            style={{
                                              paddingLeft: "0.79375mm",
                                              height: "3.7041666667mm",
                                              fontSize: "1.8520833333",
                                            }}
                                          >
                                            {e["EPD"] === "0" ? "" : e["EPD"]}
                                          </div>
                                          <div
                                            className="border_right border_bottom bag_td"
                                            style={{
                                              paddingLeft: "0.79375mm",
                                              height: "3.7041666667mm",
                                              fontSize: "1.8520833333",
                                            }}
                                          >
                                            {e["P.P"] === "0" ? "" : e["P.P"]}
                                          </div>
                                          <div
                                            className="border_right border_bottom bag_td"
                                            style={{
                                              paddingLeft: "0.79375mm",
                                              height: "3.7041666667mm",
                                              fontSize: "1.8520833333",
                                            }}
                                          >
                                            {e["SET"] === "0" ? "" : e["SET"]}
                                          </div>
                                          <div
                                            className="border_right border_bottom bag_td"
                                            style={{
                                              paddingLeft: "0.79375mm",
                                              height: "3.7041666667mm",
                                              fontSize: "1.8520833333",
                                            }}
                                          >
                                            {e["F.P"] === "0" ? "" : e["F.P"]}
                                          </div>
                                          <div
                                            className="border_bottom bag_td"
                                            style={{
                                              fontSize: "1.8520833333",
                                              paddingLeft: "0.79375mm",
                                              height: "3.7041666667mm",
                                            }}
                                          >
                                            {e["RHD-QC"] === "0"
                                              ? ""
                                              : e["RHD-QC"]}
                                          </div>
                                        </div>
                                      );
                                    }
                                  })}
                              </div>
                              <div style={{ borderTop: "0px solid" }}>
                                <div className="bag_footer d_flex last_line">
                                  <div
                                    className="border_right2 border_bottom border_top bag_td line_clamp_2"
                                    style={{
                                      paddingLeft: "0.79375mm",
                                      height: "7mm",
                                      width: "94mm",
                                      fontSize: "10px",
                                      minWidth: "100%",
                                      color: "red",
                                      lineHeight: "9.5px",
                                    }}
                                  >
                                    DGN INS:{" "}
                                    {e?.data?.rd?.officeuse?.length > 0
                                      ? e?.data?.rd?.officeuse
                                      : ""}
                                  </div>
                                </div>
                                <div className="bag_footer d_flex last_line">
                                  <div
                                    className="border_right2 border_bottom bag_td line_clamp_2"
                                    style={{
                                      paddingLeft: "0.79375mm",
                                      height: "7mm",
                                      width: "94mm",
                                      fontSize: "10px",
                                      minWidth: "100%",
                                      color: "red",
                                      lineHeight: "9.5px",
                                    }}
                                  >
                                    PRD INS:{" "}
                                    {e?.data?.rd?.ProductInstruction?.length > 0
                                      ? e?.data?.rd?.ProductInstruction
                                      : ""}
                                  </div>
                                </div>
                                <div className="bag_footer d_flex last_line">
                                  <div
                                    className="border_right2 border_bottom2 bag_td line_clamp_2"
                                    style={{
                                      paddingLeft: "0.79375mm",
                                      height: "6mm",
                                      width: "94mm",
                                      fontSize: "10px",
                                      minWidth: "100%",
                                      color: "red",
                                      borderBottom: "3px solid black",
                                      lineHeight: "9.5px",
                                    }}
                                  >
                                    CUST INS:
                                    {e?.data?.rd?.custInstruction?.length > 0
                                      ? e?.data?.rd?.custInstruction
                                      : ""}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                } else {
                  return (e?.additional?.pages?.length > 0 ? e?.additional?.pages?.[0].data : [{}]).map((chunk, index) => {
                    
                   
                  // return e?.additional?.chdata?.map((chunk, index) => {
                    
                    
                    return (
                      <React.Fragment key={index}>
                        <div
                          className="container_2 ml_8mm mb_2 mt_2 pt_2 bag_2"

                        >
                          <div className="print_2 ">
                            <div className="border_collapse print_design_2">
                              <div
                                style={{
                                  justifyContent: "space-between",
                                  borderBottom: "2px solid",
                                  borderTop: "0.5291666667mm solid #000",
                                  borderRight: "0.2645833333mm solid #000",
                                }}
                                className="d_flex"
                              >
                                <div className="print_design_2_head">
                                  <div
                                    className="thikborder"
                                    style={{
                                      background: `${e?.data?.rd?.prioritycolorcode}`,
                                    }}
                                  >

                                    <div className="bg16oldjob">
                                      <div className="bg16oldlh7">
                                        {e?.data?.rd?.serialjobno}
                                      </div>
                                      <div className="bg16oldlh7">
                                        <span className="bg16oldlh7">ORD:</span>
                                        <span className="bg16oldlh7">{(e?.data?.rd?.orderDatef !== "01Jan00" && e?.data?.rd?.orderDatef !== "01Jan1900") && e?.data?.rd?.orderDatef}</span>
                                      </div>
                                      <div style={{ color: "red" }}>
                                        <span className="bg16oldlh7"></span>
                                        <span className="bg16oldlh7">{(e?.data?.rd?.promiseDatef !== "01Jan00" && e?.data?.rd?.promiseDatef !== "01Jan1900") && `DUE: ${e?.data?.rd?.promiseDatef}`}</span>
                                      </div>
                                    </div>
                                    <div className="partybg16">
                                      <div className="lh16bg">PARTY: {e?.data?.rd?.CustomerCode}</div>
                                      <div>{e?.data?.rd?.MetalType + " " + e?.data?.rd?.MetalColor}</div>
                                    </div>
                                    <div className="d_flex print_2_head">
                                      <div className="text_start  pl_3">
                                        DGN:
                                        <span
                                          style={{
                                            fontWeight: "700",
                                            fontSize: "2.8mm",
                                          }}
                                        >
                                          {e?.data?.rd?.IsSplits_Quotation_Quantity === 0
                                            ? `${e?.data?.rd?.Designcode1
                                            }(${1}PCS)`
                                            : `${e?.data?.rd?.Designcode1}(${e?.data?.rd?.IsSplits_Quotation_Quantity} PCS)`}
                                        </span>
                                        <span
                                          style={{ fontWeight: "normal" }}
                                        ></span>
                                      </div>
                                      <div
                                        className="text_start"
                                        style={{
                                          textAlign: "right",
                                          paddingRight: "1.3229166667mm",
                                        }}
                                      >
                                        ORD NO:-{" "}
                                        <span style={{ fontWeight: "normal", lineHeight: "8px" }}>
                                          {e?.data?.rd?.OrderNo}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="d_flex print_2_head border_bottom2">
                                      <div className="text_start pl_3">
                                        SIZE:
                                        <span style={{ fontWeight: "700" }}>
                                          {e?.data?.rd?.Size}
                                        </span>
                                      </div>
                                      <div className="text_start">
                                        PO:{" "}
                                        <span style={{ fontWeight: "700" }}>
                                          {e?.data?.rd?.PO}
                                        </span>
                                      </div>
                                      <div
                                        className="text_start"
                                        style={{
                                          textAlign: "center",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        {e?.data?.rd?.prioritycode}
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className="thikborder"
                                    style={{ borderBottom: "0px solid" }}
                                  >
                                    <div className="header_16">
                                      <div className="jobInfo16">
                                        <div className="net16A">
                                          <b>NET WT:</b>
                                        </div>
                                        <div className="net16A">
                                          <b>DIA PCS:</b>
                                        </div>
                                        <div className="net16A">
                                          <b>CLR PCS:</b>
                                        </div>
                                        <div
                                          className="net16A"
                                          style={{ borderBottom: "0px" }}
                                        >
                                          <b>QT NO.</b>
                                        </div>
                                      </div>
                                      <div className="jobInfo16">
                                        <div className="net16A">
                                          <b>
                                            {(+e?.data?.rd?.netwt)
                                              // {(+e?.data?.rd?.MetalWeight)
                                              ?.toFixed(3)
                                              ?.slice(0, 8)}
                                          </b>
                                        </div>
                                        <div className="net16A">
                                          <b>
                                            {e?.additional?.dia?.diaPcs === 0
                                              ? 0
                                              : e?.additional?.dia?.diaPcs}
                                          </b>
                                        </div>
                                        <div className="net16A">
                                          <b>
                                            {e?.additional?.clr?.clrPcs === 0
                                              ? 0
                                              : e?.additional?.clr?.clrPcs}
                                          </b>
                                        </div>
                                        <div
                                          className="net16A"
                                          style={{ borderBottom: "0px" }}
                                        >
                                          <b>
                                            {e?.data?.rd?.Quotation_SKUNo === ""
                                              ? 0
                                              : e?.data?.rd?.Quotation_SKUNo?.slice(
                                                0,
                                                7
                                              )}
                                          </b>
                                        </div>
                                      </div>
                                      <div className="jobInfo16">
                                        <div
                                          className="net16A"
                                          style={{ width: "67px" }}
                                        >
                                          <b>GR WT:</b>
                                        </div>
                                        <div
                                          className="net16A"
                                          style={{ width: "67px" }}
                                        >
                                          <b>DIA WT:</b>
                                        </div>
                                        <div
                                          className="net16A"
                                          style={{ width: "67px" }}
                                        >
                                          <b>CLR WT:</b>
                                        </div>
                                        <div
                                          className="net16A"
                                          style={{
                                            width: "67px",
                                            borderBottom: "0px",
                                          }}
                                        >
                                          <b>CREATED BY:</b>
                                        </div>
                                      </div>
                                      <div
                                        className="jobInfo16"
                                        style={{
                                          borderRight: "0px",
                                          borderLeft: "0px solid",
                                        }}
                                      >
                                        <div className="net16A">
                                          <b>
                                            {(
                                              e?.data?.rd?.ActualGrossweight ??
                                              0
                                            )?.toFixed(3)}
                                          </b>
                                        </div>
                                        <div className="net16A">
                                          <b>
                                            {(e?.additional?.dia?.diaWt === 0
                                              ? 0
                                              : e?.additional?.dia?.diaWt
                                            )?.toFixed(3)}
                                          </b>
                                        </div>
                                        <div className="net16A">
                                          <b>
                                            {(e?.additional?.clr?.clrWt === 0
                                              ? 0
                                              : e?.additional?.clr?.clrWt
                                            )?.toFixed(3)}
                                          </b>
                                        </div>
                                        <div
                                          className="net16A"
                                          style={{ borderBottom: "0px" }}
                                        >
                                          <b>
                                            {e?.data?.rd?.createby === ""
                                              ? ""
                                              : e?.data?.rd?.createby}
                                          </b>

                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div
                                  style={{ borderBottom: "0px solid" }}
                                  className="text_start position_relative thikborder"
                                >
                                  <div>
                                    <img
                                      src={
                                        e?.data?.rd?.DesignImage !== ''
                                          ? e?.data?.rd?.DesignImage
                                          : require("../../assets/img/default.jpg")
                                      }
                                      alt=""
                                      className="img16"
                                      onError={(e) => handleImageError(e)}
                                      loading="eager"
                                      id="img16"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="border_bottom_0 border_right thikborder">
                                <div className="d_flex">
                                  <div
                                    className="border_right border_bottom display"
                                    style={{
                                      height: "3.7041666667mm",
                                      fontWeight: "900",
                                      paddingLeft: "0.79375mm",
                                      width: "17.853583333mm",
                                      fontSize: "11px",
                                    }}
                                  >
                                    RM TYPE
                                  </div>
                                  <div
                                    className="border_right border_bottom display"
                                    style={{
                                      height: "3.7041666667mm",
                                      fontSize: "11px",
                                      paddingLeft: "2px",
                                      fontWeight: "900",
                                      width: "46px",
                                    }}
                                  >
                                    QUALITY
                                  </div>
                                  <div
                                    className="border_right border_bottom display"
                                    style={{
                                      height: "3.7041666667mm",
                                      fontWeight: "900",
                                      paddingLeft: "0.79375mm",
                                      width: "11.0015mm",
                                      fontSize: "11px",
                                    }}
                                  >
                                    COLOR
                                  </div>
                                  <div
                                    className="border_right border_bottom display"
                                    style={{
                                      height: "3.7041666667mm",
                                      fontWeight: "900",
                                      paddingLeft: "0.79375mm",
                                      width: "15.880666667mm",
                                      fontSize: "11px",
                                    }}
                                  >
                                    SIZE
                                  </div>
                                  <div
                                    className="border_right border_bottom display"
                                    style={{
                                      height: "3.7041666667mm",
                                      fontWeight: "900",
                                      textAlign: "center",
                                      paddingLeft: "0.79375mm",
                                      width: "14.345958333mm",
                                      fontSize: "11px",
                                    }}
                                  >
                                    ACTUAL
                                  </div>
                                  <div
                                    className="border_right2 border_bottom display"
                                    style={{
                                      height: "3.7041666667mm",
                                      fontWeight: "900",
                                      paddingLeft: "0.79375mm",
                                      width: "14.5mm",
                                      fontSize: "11px",
                                    }}
                                  >
                                    WT
                                  </div>
                                  <div
                                    className=" border_bottom position_relative barcode_design_2"
                                    rowSpan={16}
                                    style={{ padding: "0" }}
                                  >
                                    {e?.data?.rd1[0]?.SerialJobno !==
                                      undefined && (
                                        <BarcodeGenerator
                                          data={e?.data?.rd1[0]?.SerialJobno}
                                        />
                                      )}
                                  </div>
                                </div>

                                {chunk?.data?.map((a, i) => {
                                  
                                  const TheDataLen = e?.additional?.pages?.[0]?.data?.[0]?.data?.length ?? 0;
                                   
                                 
                                  // console.log("TCL: chunk?.data?.length", chunk?.data?.length)
                                  // console.log("TheDataLen", TheDataLen);
                                  const TheDif = TheDataLen <= 21 ? 21 - TheDataLen : 0;
                                  // console.log("TheDif", TheDif);
                                  const TheDifSh = TheDif === 0 ? 21 : TheDif;
                                  // console.log("TheDifSh", TheDifSh);
                                  const isLastRow = i === TheDifSh - 1;
                                  // console.log("isLastRow", isLastRow);
                                  return (
                                    <div className="d_flex" key={i}>
                                      <div
                                        className={`border_right border_bottom  display ${a?.Shapename?.length > 15
                                            ? "line_height_fontSmall"
                                            : ""
                                          }`}
                                        style={{
                                          width: a?.MasterManagement_DiamondStoneTypeid === 5 ? "56.65mm" : "17.853583333mm",
                                          fontWeight:
                                            a?.totalFontWeight === "900"
                                              ? "900"
                                              : "bold",
                                          boxSizing: "border-box",
                                          fontSize: "9px",
                                          height: "3.7041666667mm",
                                          paddingRight: "1.3229166667mm",
                                          paddingLeft: "0.79375mm",
                                          paddingTop: "0rem",
                                          lineHeight: "7px",
                                        }}
                                      >
                                        {a?.Shapename === "Total" ? (
                                          <b>{a?.Shapename}</b>
                                        ) : (
                                          a?.MasterManagement_DiamondStoneTypeid ===5 ?(
                                              `${a?.Shapename ?? ""} ${a?.Quality ?? ""} ${a?.MetalColor ?? ""}`.trim().slice(0, 45)
                                          ):(
                                            a?.Shapename?.slice(0, 15)
                                          )
                                          
                                         
                                        )}
                                      </div>

                                      <div
                                        className={`border_right border_bottom display ${a?.Quality?.length > 10
                                            ? "line_height_fontSmall"
                                            : ""
                                          }`}
                                        style={{
                                          width: "45.0015px",
                                          fontWeight: "bold",
                                          justifyContent: "center",
                                          fontSize: "9px",
                                          height: "3.7041666667mm",
                                          textAlign: "end",
                                          lineClamp: "1",
                                          boxOrient: "vertical",
                                          overflow: "hidden",
                                          lineHeight: "7px",
                                          display: a?.MasterManagement_DiamondStoneTypeid === 5 ? "none" : "flex",
                                        }}
                                      >
                                        {a?.Quality?.slice(0, 10)}
                                      </div>

                                      <div
                                        className={`border_right border_bottom display ${a?.MetalColor?.length > 10
                                            ? "line_height_fontSmall"
                                            : ""
                                          }`}
                                        style={{
                                          width: "11.0015mm",
                                          fontWeight: "bold",
                                          fontSize: "9px",
                                          height: "3.7041666667mm",
                                          textAlign: "end",
                                          lineHeight: "6.5px",
                                          justifyContent: "center",
                                          display: a?.MasterManagement_DiamondStoneTypeid === 5 ? "none" : "flex",
                                        }}
                                      >
                                        {a?.ColorName?.slice(0, 10)}
                                      </div>

                                      <div
                                        className={`border_right border_bottom display ${a?.Sizename?.length > 15
                                            ? "line_height_fontSmall"
                                            : ""
                                          }`}
                                        style={{
                                          width: "15.880666667mm",
                                          fontWeight: "bold",
                                          fontSize: "9px",
                                          height: "3.7041666667mm",
                                          textAlign: "center",
                                          lineHeight: "7px",
                                          display: "flex",
                                          justifyContent: "center",
                                          alignItems: "center",
                                          display: a?.MasterManagement_DiamondStoneTypeid === 5 ? "none" : "flex",
                                        }}
                                      >
                                        {a?.Sizename?.slice(0, 15)}
                                      </div>

                                      <div
                                        className={`border_right border_bottom display ${a?.ActualPcs?.length > 7
                                            ? "line_height_fontSmall"
                                            : ""
                                          } wtnewclasscol16`}
                                         
                                      >
                                        {a?.Shapename === "Total" ? (
                                          <b
                                            style={{
                                              fontSize:
                                                a?.Shapename === "Total"
                                                  ? "9px"
                                                  : "inherit",
                                            }}
                                          >
                                            {+a?.ActualPcs}
                                          </b>
                                        ) : (
                                          +a?.ActualPcs
                                        )}
                                      </div>

                                      <div
                                        className={`border_right border_bottom display ${a?.ActualWeight?.length > 7
                                            ? "line_height_fontSmall"
                                            : ""
                                          } newclasscol16`}
                                      >
                                        {a?.Shapename === "Total" ? (
                                          <b
                                            style={{
                                              lineHeight: "6px",
                                              fontSize:
                                                a?.Shapename === "Total"
                                                  ? "9px"
                                                  : "inherit",
                                            }}
                                          >
                                            {a?.ActualWeight?.toFixed(3)}
                                          </b>
                                        ) : (
                                          a?.ActualWeight?.toFixed(3)
                                        )}
                                      </div>

                                      <div
                                        className={`border_right2 border_bottom display ${a?.Sizename?.length > 12
                                            ? "line_height_fontSmall"
                                            : ""
                                          }`}
                                        style={{
                                          width: "14.7952mm",
                                          fontWeight: "bold",
                                          fontSize: "9px",
                                          height: "3.7041666667mm",
                                          textAlign: "end",
                                          paddingRight: "2px",
                                          paddingLeft: "1.3229166667mm",
                                          lineHeight: "7px",
                                          display:"flex",
                                          alignItems:"center",
                                          justifyContent:"flex-end"
                                        }}
                                      >{a?.EngagePcs>0 && a?.EngageWt>0 &&(a?.EngagePcs+"/"+a?.EngageWt)}</div>
                                    </div>
                                  );
                                })}

                   {Array.from({ length: 15 - (e?.additional?.pages?.[0]?.data?.[index]?.data?.length || 0) }, (_, index) => {
                    
                     const TheDataLen = e?.additional?.pages?.[0]?.data?.[0]?.data?.length ?? 0;
                    //  console.log("TheDataLen ",TheDataLen)
                                   
                                  const TheDif = TheDataLen <= 15 ? 15 - TheDataLen : 0;
                                 
                                  const isLastRow = index === TheDif - 1;
                                 return(
                                  <div className="d_flex " key={index}>
                                      <div
                                        className="border_right border_bottom display"
                                        style={{
                                          width: "17.853583333mm",
                                          fontSize: "10px",
                                          height: "3.7041666667mm",
                                        }}
                                      ></div>
                                      <div
                                        className="border_right border_bottom display"
                                        style={{
                                          width: "45.0015px",
                                          fontSize: "10px",
                                          height: "3.7041666667mm",
                                          display: "-webkit-box",
                                          lineClamp: "1",
                                          boxOrient: "vertical",
                                          overflow: "hidden",
                                        }}
                                      ></div>
                                      <div
                                        className="border_right border_bottom display"
                                        style={{
                                          width: "11.0015mm",
                                          fontSize: "10px",
                                          height: "3.7041666667mm",
                                        }}
                                      ></div>
                                      <div
                                        className="border_right border_bottom display"
                                        style={{
                                          width: "15.880666667mm",
                                          fontSize: "10px",
                                          height: "3.7041666667mm",
                                        }}
                                      ></div>
                                      <div
                                        className="border_right border_bottom display"
                                        style={{
                                          width: "5.3792291667mm",
                                          fontSize: "1.8520833333mm",
                                          height: "3.7041666667mm",
                                        }}
                                      ></div>
                                      <div
                                        className="border_right border_bottom display"
                                        style={{
                                          width: "8.9667291667mm",
                                          fontSize: "1.8520833333mm",
                                          height: "3.7041666667mm",
                                        }}
                                      ></div>
                                      <div
                                        className="border_right2 border_bottom display"
                                        style={{
                                          width: "14.7952mm",
                                          fontSize: "1.8520833333mm",
                                          height: "3.7041666667mm",
                                        }}
                                      ></div>
                                    </div>
                                 )
                                  
                                })}
                              </div>
                              <div className="bag_footer_border_remove border_right ">
                                <div className="thikborder">
                                  <div className="bag_footer d_flex ">
                                    <div
                                      className="border_top2 border_right border_bottom bag_td d-flex justify-content-center align-items-center"
                                      style={{
                                        paddingLeft: "0.79375mm",
                                        height: "3.7041666667mm",
                                        fontSize: "10px",
                                        fontWeight: "900",
                                      }}
                                    ></div>
                                    <div
                                      className="border_top2 border_right border_bottom bag_td d-flex justify-content-center align-items-center"
                                      style={{
                                        paddingLeft: "0.79375mm",
                                        height: "3.7041666667mm",
                                        fontSize: "10px",
                                        fontWeight: "900",
                                      }}
                                    >
                                      GRAND
                                    </div>
                                    <div
                                      className="border_top2 border_right border_bottom bag_td d-flex justify-content-center align-items-center"
                                      style={{
                                        paddingLeft: "0.79375mm",
                                        height: "3.7041666667mm",
                                        fontSize: "10px",
                                        fontWeight: "900",
                                      }}
                                    >
                                      FILLING
                                    </div>
                                    <div
                                      className="border_top2 border_right border_bottom bag_td d-flex justify-content-center align-items-center"
                                      style={{
                                        paddingLeft: "0.79375mm",
                                        height: "3.7041666667mm",
                                        fontSize: "10px",
                                        fontWeight: "900",
                                      }}
                                    >
                                      EPD
                                    </div>
                                    <div
                                      className="border_top2 border_right border_bottom bag_td d-flex justify-content-center align-items-center"
                                      style={{
                                        paddingLeft: "0.79375mm",
                                        height: "3.7041666667mm",
                                        fontSize: "10px",
                                        fontWeight: "900",
                                      }}
                                    >
                                      P.P.
                                    </div>
                                    <div
                                      className="border_top2 border_right border_bottom bag_td d-flex justify-content-center align-items-center"
                                      style={{
                                        paddingLeft: "0.79375mm",
                                        height: "3.7041666667mm",
                                        fontSize: "10px",
                                        fontWeight: "900",
                                      }}
                                    >
                                      SET.
                                    </div>
                                    <div
                                      className="border_top2 border_right border_bottom bag_td d-flex justify-content-center align-items-center"
                                      style={{
                                        paddingLeft: "0.79375mm",
                                        height: "3.7041666667mm",
                                        fontSize: "10px",
                                        fontWeight: "900",
                                      }}
                                    >
                                      F.P.
                                    </div>
                                    <div
                                      className="border_top2 border_bottom bag_td d-flex justify-content-center align-items-center"
                                      style={{
                                        paddingLeft: "0.79375mm",
                                        fontSize: "10px",
                                        height: "3.7041666667mm",
                                        fontWeight: "900",
                                      }}
                                    >
                                      RHD-QC
                                    </div>
                                  </div>
                                  {

                                    // eslint-disable-next-line array-callback-return
                                    printData[2]?.map((e, i) => {
                                      if (
                                        e["0"] !== "DGN INS:" &&
                                        e["0"] !== "PRD INS:" &&
                                        e["0"] !== "CUST INS:"
                                      ) {
                                        return (
                                          <div
                                            className="bag_footer d_flex last_line"
                                            key={i}
                                          >
                                            <div
                                              className="border_right border_bottom bag_td"
                                              style={{
                                                paddingLeft: "0.79375mm",
                                                height: "3.7041666667mm",
                                                fontSize: "10px",
                                              }}
                                            >
                                              {e["0"] === "0" ? "" : e["0"]}
                                            </div>
                                            <div
                                              className="border_right border_bottom bag_td"
                                              style={{
                                                paddingLeft: "0.79375mm",
                                                height: "3.7041666667mm",
                                                fontSize: "10px",
                                              }}
                                            >
                                              {e["GRAND"] === "0"
                                                ? ""
                                                : e["GRAND"]}
                                            </div>
                                            <div
                                              className="border_right border_bottom bag_td"
                                              style={{
                                                paddingLeft: "0.79375mm",
                                                height: "3.7041666667mm",
                                                fontSize: "10px",
                                              }}
                                            >
                                              {e["FILLING"] === "0"
                                                ? ""
                                                : e["FILLING"]}
                                            </div>
                                            <div
                                              className="border_right border_bottom bag_td"
                                              style={{
                                                paddingLeft: "0.79375mm",
                                                height: "3.7041666667mm",
                                                fontSize: "10px",
                                              }}
                                            >
                                              {e["EPD"] === "0" ? "" : e["EPD"]}
                                            </div>
                                            <div
                                              className="border_right border_bottom bag_td"
                                              style={{
                                                paddingLeft: "0.79375mm",
                                                height: "3.7041666667mm",
                                                fontSize: "10px",
                                              }}
                                            >
                                              {e["P.P"] === "0" ? "" : e["P.P"]}
                                            </div>
                                            <div
                                              className="border_right border_bottom bag_td"
                                              style={{
                                                paddingLeft: "0.79375mm",
                                                height: "3.7041666667mm",
                                                fontSize: "10px",
                                              }}
                                            >
                                              {e["SET"] === "0" ? "" : e["SET"]}
                                            </div>
                                            <div
                                              className="border_right border_bottom bag_td"
                                              style={{
                                                paddingLeft: "0.79375mm",
                                                height: "3.7041666667mm",
                                                fontSize: "10px",
                                              }}
                                            >
                                              {e["F.P"] === "0" ? "" : e["F.P"]}
                                            </div>
                                            <div
                                              className="border_bottom bag_td"
                                              style={{
                                                fontSize: "10px",
                                                paddingLeft: "0.79375mm",
                                                height: "3.7041666667mm",
                                                borderRight: "0px solid",
                                              }}
                                            >
                                              {e["RHD-QC"] === "0"
                                                ? ""
                                                : e["RHD-QC"]}
                                            </div>
                                          </div>
                                        );
                                      }
                                    })}
                                </div>
                                <div className="thikborder">
                                  <div className="bag_footer d_flex last_line">
                                    <div
                                      className="border_right2 border_bottom border_top bag_td line_clamp_2"
                                      style={{
                                        paddingLeft: "0.79375mm",
                                        height: "7mm",
                                        width: "94mm",
                                        fontSize: "10px",
                                        minWidth: "100%",
                                        color: "red",
                                        borderRight: "0px solid",
                                        lineHeight: "9.5px",
                                      }}
                                    >
                                      DGN INS:{" "}
                                      {e?.data?.rd?.officeuse?.length > 0
                                        ? e?.data?.rd?.officeuse
                                        : ""}
                                    </div>
                                  </div>
                                  <div className="bag_footer d_flex last_line">
                                    <div
                                      className="border_right2 border_bottom border_top bag_td line_clamp_2"
                                      style={{
                                        paddingLeft: "0.79375mm",
                                        height: "7mm",
                                        width: "94mm",
                                        fontSize: "10px",
                                        minWidth: "100%",
                                        color: "red",
                                        borderRight: "0px solid",
                                        lineHeight: "9.5px",
                                      }}
                                    >
                                      PRD INS:{" "}
                                      {/* {" " + checkInstruction(e?.data?.rd?.ProductInstruction)} */}
                                      {e?.data?.rd?.ProductInstruction?.length >
                                        0
                                        ? e?.data?.rd?.ProductInstruction
                                        : ""}
                                    </div>
                                  </div>
                                  <div className="bag_footer d_flex last_line">
                                    <div
                                      className="border_right2 border_bottom border_top bag_td line_clamp_2"
                                      style={{
                                        paddingLeft: "0.79375mm",
                                        height: "6mm",
                                        width: "94mm",
                                        fontSize: "10px",
                                        minWidth: "100%",
                                        color: "red",
                                        borderRight: "0px solid",
                                        borderBottom: "3px solid black",
                                        lineHeight: "9.5px",
                                      }}
                                    >
                                      CUST INS:{" "}
                                      {e?.data?.rd?.custInstruction ?? ""}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  });
                }

              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PrintDesign16;
