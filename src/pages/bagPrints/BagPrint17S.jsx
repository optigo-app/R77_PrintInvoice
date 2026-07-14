
import React, { useEffect, useState } from "react";
import BackSide from "../../assets/json/Back side.json";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import "../../assets/css/bagprint/bagprint17s.css";
import { GetData } from "../../GlobalFunctions/GetData";
import { organizeData } from "../../GlobalFunctions/OrganizeBagPrintData";
import Loader from "../../components/Loader";
import BarcodeGenerator from "../../components/BarcodeGenerator";
import { GetUniquejob } from "../../GlobalFunctions/GetUniqueJob";
import QRCodeGenerator from "../../components/QRCodeGenerator";

const PrintDesign17 = ({ queries, headers }) => {
  const location = useLocation();
  const queryParams = queryString?.parse(location.search);
  const resultString = GetUniquejob(queryParams?.str_srjobno);
  const [data, setData] = useState([]);
  const chunkSize = 14;
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
            let misc = {
              miscWt: 0,
            };
            // eslint-disable-next-line array-callback-return
            a?.rd1?.map((e) => {
              if (e?.ConcatedFullShapeQualityColorCode !== "- - - ") {
                length++;
              }
              if (e?.MasterManagement_DiamondStoneTypeid === 3) {
                dia.diaPcs = dia?.diaPcs + e?.ActualPcs;
                dia.diaWt = dia.diaWt + e?.ActualWeight;
              } else if (e?.MasterManagement_DiamondStoneTypeid === 4) {
                clr.clrPcs = clr.clrPcs + e?.ActualPcs;
                clr.clrWt = clr.clrWt + e?.ActualWeight;
              } else if (e?.MasterManagement_DiamondStoneTypeid === 7) {
                misc.miscWt = misc.miscWt + e?.ActualWeight;
              }
            });
            length = 14 - length;
            let imagePath = queryParams?.imagepath;
            imagePath = atob(queryParams?.imagepath);
            let img = imagePath + a?.rd?.ThumbImagePath;

            const originalData = [];
            // eslint-disable-next-line array-callback-return
            a?.rd1?.map((e) => {
              if (e?.Shapename !== "-") {
                originalData?.push(e);
              }
            });

            let chData = [];

            for (let i = 0; i < originalData?.length; i += chunkSize) {
              let len = 14 - originalData?.slice(i, i + chunkSize)?.length;
              chData.push({
                data: originalData?.slice(i, i + chunkSize),
                length: len,
              });
            }
            let obj = { ...a };

            // obj?.rd?.push({});

            if (a?.rd["officeuse"] != null) {
            }
            let officeuse =
              // eslint-disable-next-line eqeqeq
              a?.rd["officeuse"] == (null || "null") ? "" : a?.rd["officeuse"];
            let ProductInstruction =
              // eslint-disable-next-line eqeqeq
              a?.rd["ProductInstruction"] == (null || "null")
                ? ""
                : a?.rd["ProductInstruction"];

            obj.rd.instructionData =
              (officeuse?.length > 0 ? officeuse : "") +
              (ProductInstruction?.length > 0 ? ProductInstruction : "");
            obj?.rd?.instructionData?.slice(0, 113);
            responseData.push({
              data: obj,
              additional: {
                length: length,
                clr: clr,
                dia: dia,
                img: img,
                misc: misc,
                chdata: chData,
              },
            });
          });
          setData(responseData);
        }
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

  // useEffect(() => {
  //   if (data?.length !== 0) {
  //     setTimeout(() => {
  //       window.print();
  //     }, 5000);
  //   }
  // }, [data]);

  const handlePrint = (e) => {
    e.preventDefault();
    window.print();
  };

  
  console.log("TCL: data", data)

  return (
    <div className="pad_60_allPrint">
      {data.length === 0 ? (
        <Loader />
      ) : (
        <>

          <div className="print_btn">
            <button
              className="btn_white blue print_btn"
              onClick={(e) => handlePrint(e)}
            >
              Print
            </button>
          </div>
          <div className="d_flex flex_wrap m_5 print_section_17">
            {Array.from(
              { length: queries?.pageStart },
              (_, index) =>
                index > 0 && (
                  <div
                    key={index}
                    className="container_17_old mb_2 mt_2 container_margin_left"
                  ></div>
                )
            )}
            {data?.map((e, i) => {
              
              console.log("TCL:i ", e)
              return (
                <React.Fragment key={i}>
                  {e?.additional?.chdata?.length > 0 ? (
                    e?.additional?.chdata?.map((chunk, index) => {
                      return (
                        <div
                          className="container_17_old mb_2 mt_2  container_margin_left"
                          key={index}
                        >
                          <div className=" border-black border-2">
                            <div className="print_sec d_flex">
                              <div className="print_text border_right">
                                <div className="header_first">
                                  <p className="fontsize17">
                                    {e?.data?.rd?.["serialjobno"]}&nbsp;
                                    {(e?.data?.rd?.IsQuickRepairing === 1 && e?.data?.rd?.referenceno !== '') ?
                                      <span style={{ color: 'red', fontSize: '10px' }}>
                                        {(e?.data?.rd?.referenceno === null && e?.data?.rd?.referenceno === '') ? '' : `(${e?.data?.rd?.referenceno})`}
                                      </span> : ''
                                    }
                                  </p>
                                  <p className="fontsize17">
                                    {e?.data?.rd?.["Designcode"]}
                                  </p>
                                  <p className="fontsize17" style={{ lineHeight: '12px' }}>
                                    {e?.data?.rd?.["MetalType"]}{" "}
                                    {e?.data?.rd?.["MetalColor"]}{" "}
                                  </p>
                                </div>

                                <div className="header_second">
                                  <div className="w_25 border_right p_3">
                                    <p className="grey bold fsize17 linehP17">
                                      CUST
                                    </p>
                                    <p className="bold fsize17">
                                      {e?.data?.rd?.["CustomerCode"]}
                                    </p>
                                  </div>
                                  <div className="w_25 border_right p_3" style={{ width: '35%' }}>
                                    <p className="grey bold fsize17 linehP17">
                                      SIZE
                                    </p>
                                    <p className="bold fsize17_size">
                                      {e?.data?.rd?.["Size"]}
                                    </p>
                                  </div>
                                  <div className="w_25 border_right p_3" style={{ width: '20%' }}>
                                    <p className="grey bold fsize17 linehP17">
                                      ORD.DT.
                                    </p>
                                    <p className="bold fsize17">
                                      {e?.data?.rd?.["OrderDate"] === "01 Jan 1900" ? '' : e?.data?.rd?.orderDatef}
                                    </p>
                                  </div>
                                  <div className="w_25 p_3" style={{ width: '20%' }}>
                                    <p className="grey bold fsize17 linehP17">
                                      DEL.DT.
                                    </p>
                                    {e?.data?.rd?.["promisedate"] ===
                                      "01 Jan 1900 " ? (
                                      <p className="bold fsize17"></p>
                                    ) : (
                                      <p className="bold fsize17">
                                        {e?.data?.rd?.["promiseDatef"]}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="printhead_2 border_bottom print_head_2_ins_17">
                                  <p
                                    className="px_2 bold line_clamp_17"
                                    style={{
                                      fontSize: "12px",
                                      lineHeight: "11px",
                                      padding: "2px",
                                      wordBreak: "break-all",
                                    }}
                                  >
                                    INS :{" "}<span className="spinstFnt">
                                      {e?.data?.rd?.instructionData ===
                                        (null || "null")
                                        ? ""
                                        : e?.data?.rd?.instructionData?.slice(
                                          0,
                                          113
                                        )}</span>
                                  </p>
                                </div>
                              </div>
                              <div
                                className="print_photo border_bottom"
                                style={{
                                  borderTop: "1px solid black",
                                  borderLeft: "1px solid",
                                }}
                              >
                                {console.log(e?.data)}
                                <img
                                  src={
                                    e?.data?.rd?.DesignImage !== ''
                                      ? e?.data?.rd?.DesignImage
                                      : require("../../assets/img/default.jpg")
                                  }
                                  // src={
                                  //   e?.additional?.img !== ""
                                  //     ? e?.additional?.img
                                  //     : require("../../assets/img/default.jpg")
                                  // }
                                  alt=""
                                  onError={(e) => handleImageError(e)}
                                  loading="eager"
                                  id="img17Old"
                                />
                              </div>
                            </div>
                            <div className="print_sec d_flex border_bottom">
                              <div className="print_table">
                                <div className="h_4 d_flex">
                                  <div className="code border_right border_bottom bold pl_3">
                                    CODE
                                  </div>
                                  <div className="size border_right border_bottom bold  text_center">
                                    SIZE
                                  </div>
                                  <div className="pcs border_right border_bottom bold  text_center">
                                    PCS
                                  </div>
                                  <div className="wt border_right border_bottom bold  text_center">
                                    WT
                                  </div>
                                  <div className="pcs_2 border_right border_bottom bold  text_center">
                                    PCS
                                  </div>
                                  <div className="wt_2  border_bottom bold  text_center">
                                    WT
                                  </div>
                                </div>
                                <div className="border_bottom_0">
                                  {chunk?.data?.map((e, i) => {
                                    return (
                                      <div key={i} className="h_41 d_flex">
                                        {/* <div className="code border_right border_bottom medium pl_3">
                                          {e?.ConcatedFullShapeQualityColorCode?.slice(
                                            0,
                                            35
                                          )}
                                        </div> */}
                                        <div className="code border_right border_bottom medium pl_3">
                                          {`${e?.ConcatedFullShapeQualityColorCode?.charAt(0)} ${e?.MaterialTypeName} ${e?.ConcatedFullShapeQualityColorCode?.slice(1)}`.slice(0, 35)}
                                        </div>
                                        <div className="size border_right border_bottom medium  text_center">
                                          {e?.Sizename?.slice(0, 15)}
                                        </div>
                                        <div className="pcs border_right border_bottom medium  text_center">
                                          {e?.ActualPcs}
                                        </div>
                                        <div className="wt border_right border_bottom medium  text_center">
                                          {e?.ActualWeight}
                                        </div>
                                        <div className="pcs_2 border_right border_bottom  medium text_center"></div>
                                        <div className="wt_2  border_bottom medium  text_center"></div>
                                      </div>
                                    );
                                  })}
                                  {Array.from(
                                    { length: chunk?.length },
                                    (_, index) => (
                                      <div key={index} className="h_41 d_flex">
                                        <div className="code border_right bold border_bottom"></div>
                                        <div className=" size border_right bold border_bottom"></div>
                                        <div className="pcs border_right bold border_bottom"></div>
                                        <div className="wt border_right bold border_bottom"></div>
                                        <div className="pcs_2 border_right bold border_bottom"></div>
                                        <div className="wt_2 bold border_bottom"></div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                              <div className="BARCODE">
                                {e?.data?.rd1?.length !== 0 && (
                                  <>
                                    {e?.data?.rd1[0]?.SerialJobno !==
                                      undefined && (
                                        <BarcodeGenerator
                                          data={e?.data?.rd1[0]?.SerialJobno}
                                        />
                                      )}
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="print-sec d_flex footer">
                              <div className="w17Imp border_right">
                                <div className="upper border_bottom text_center center_item">
                                  <p
                                    className="semibold"
                                    style={{ fontSize: "2.2mm" }}
                                  >
                                    DIAM.
                                  </p>
                                </div>
                                <div
                                  className="lower17 center_item bold separatedfs17old"
                                  style={{ fontSize: "9.5px" }}
                                >
                                  {+e?.additional?.dia?.diaPcs +
                                    "/" +
                                    e?.additional?.dia?.diaWt?.toFixed(3)}
                                </div>
                              </div>
                              <div className="w_12mm border_right" style={{ borderBottom: "0px solid black" }} >
                                <div className="upper"></div>
                                <div className="lower17"></div>
                              </div>
                              <div className="w17cs border_right">
                                <div className="upper border_bottom text_center center_item">
                                  <p
                                    className="semibold"
                                    style={{ fontSize: "2.2mm" }}
                                  >
                                    CS
                                  </p>
                                </div>
                                <div className="lower17 center_item bold separatedfs17old">
                                  {+e?.additional?.clr?.clrPcs +
                                    "/" +
                                    +e?.additional?.clr?.clrWt?.toFixed(3)}
                                </div>
                              </div>
                              <div className="w_12mm border_right" style={{ borderBottom: "0px solid black" }} >
                                <div className="upper"></div>
                                <div className="lower17"></div>
                              </div>
                              <div className="w_10 border_right">
                                <div className="upper border_bottom text_center center_item">
                                  <p
                                    className="semibold"
                                    style={{ fontSize: "2.2mm" }}
                                  >
                                    METAL
                                  </p>
                                </div>
                                <div className="lower17 center_item bold separatedfs17old">
                                  {/* {e?.data?.rd?.["QuotGrossWeight"]?.toFixed(3)} */}
                                  {e?.data?.rd?.netwt?.toFixed(3)}
                                </div>
                              </div>
                              <div className="w_13 border_right" style={{ borderBottom: "0px solid black" }} >
                                <div className="upper"></div>
                                <div className="lower17"></div>
                              </div>
                              <div className=" border_right" style={{ width: '15mm', boxSizing: 'border-box' }}>
                                <div className="upper border_bottom text_center center_item">
                                  <p
                                    className="semibold"
                                    style={{ fontSize: "2.2mm" }}
                                  >
                                    MISC
                                  </p>
                                </div>
                                <div className="lower17 center_item bold separatedfs17old">
                                  {(+e?.additional?.misc?.miscWt)?.toFixed(3)}
                                </div>
                              </div>
                              {/* <div className="w_12_5mm" style={{ borderBottom: "0px solid black" }} > */}
                              <div style={{ borderBottom: "0px solid black", width: '0px' }} >
                                <div className="upper"></div>
                                <div className="lower17"></div>
                              </div>
                              {/* <div className="w_12_5mm" style={{ borderBottom: "0px solid black" }} >
                                <div className="upper"></div>
                                <div className="lower17"></div>
                              </div> */}
                              <div>
                                <div className="qrcodebg_17">
                                  <QRCodeGenerator
                                    text={e?.data?.rd.serialjobno}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="container_17_old mb_2 mt_2  container_margin_left">
                      <div className=" border-black border-2">
                        <div className="print_sec d_flex">
                          <div className="print_text border_right">
                            <div className="printhead d_flex justify_content_between ">
                              <p className=" bold pl_3 fs17125">
                                <span className="fs17125">{e?.data?.rd?.["serialjobno"]}&nbsp;</span>

                                {(e?.data?.rd?.IsQuickRepairing === 1 && e?.data?.rd?.referenceno !== '') ?
                                  <span style={{ color: 'red', fontSize: '10px' }}>
                                    {(e?.data?.rd?.referenceno === null && e?.data?.rd?.referenceno === '') ? '' : `(${e?.data?.rd?.referenceno})`}
                                  </span> : ''
                                }

                              </p>
                              <p className=" bold pr_3 fs17125" >
                                <span className="fs17125"> {e?.data?.rd?.["Designcode"]}</span>
                              </p>
                              <p className=" bold  pl_3 pr_3 fs17125" style={{ lineHeight: '12px' }}>
                                <span className="fs17125" style={{ lineHeight: '10px' }}>{e?.data?.rd?.["MetalType"]}{" "}
                                  {e?.data?.rd?.["MetalColor"]}{" "}</span>
                              </p>
                            </div>

                            <div className="empty_17box">
                              <div
                                className="header_17two"
                                style={{ borderRight: "0px solid black" }}
                              >
                                <p className="d-flex flex-column">
                                  <span className="grey bold fsize17 linehP17">
                                    CUST
                                  </span>
                                  <span className="bold fsize17">
                                    {e?.data?.rd?.["CustomerCode"]}
                                  </span>
                                </p>
                              </div>
                              <div
                                className="header_17two"
                                style={{ borderRight: "0px solid black" }}
                              >
                                <p className="d-flex flex-column" style={{ width: '35%' }}>
                                  <span className="grey bold fsize17 linehP17">
                                    SIZE
                                  </span>
                                  <span className="bold fsize17_size">
                                    {e?.data?.rd?.["Size"]}
                                  </span>
                                </p>
                              </div>
                              <div
                                className="header_17two"
                                style={{ borderRight: "0px solid black" }}
                              >
                                <p className="d-flex flex-column" style={{ width: '20%' }}>
                                  <span className="grey bold fsize17 linehP17">
                                    ORD.DT.
                                  </span>
                                  <span className="bold fsize17">
                                    {e?.data?.rd?.["OrderDate"] === "01 Jan 1900" ? '' : e?.data?.rd?.orderDatef}
                                  </span>
                                </p>
                              </div>
                              <div
                                className="header_17two"
                                style={{ borderRight: "0px solid black" }}
                              >
                                <p className="d-flex flex-column" style={{ width: '20%' }}>
                                  <span className="grey bold fsize17 linehP17">
                                    DEL.DT.
                                  </span>
                                  {e?.data?.rd?.["promisedate"] ===
                                    "01 Jan 1900 " ? (
                                    <span className="bold fsize17"></span>
                                  ) : (
                                    <span className="bold fsize17">
                                      {e?.data?.rd?.["promiseDatef"]}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div
                              className="empty_17box_Ins"
                              style={{ height: "30px" }}
                            >
                              <p
                                className="px_2 bold line_clamp_17"
                                style={{
                                  fontSize: "12px",
                                  lineHeight: "11px",
                                  padding: "2px",
                                  wordBreak: "break-all",
                                }}
                              >
                                INS :{" "}
                                {e?.data?.rd?.instructionData ===
                                  (null || "null")
                                  ? ""
                                  : e?.data?.rd?.instructionData?.slice(0, 113)}
                              </p>
                            </div>
                          </div>
                          <div
                            className="print_photo border_bottom"
                            style={{
                              borderTop: "1px solid black",
                              borderLeft: "1px solid",
                            }}
                          >
                            <img
                              // src={
                              //   e?.additional?.img !== ""
                              //     ? e?.additional?.img
                              //     : require("../../assets/img/default.jpg")
                              // }
                              src={
                                e?.data?.rd?.DesignImage !== ''
                                  ? e?.data?.rd?.DesignImage
                                  : require("../../assets/img/default.jpg")
                              }
                              alt=""
                              onError={(e) => handleImageError(e)}
                              loading="eager"
                              style={{
                                height: " 85px !important",
                                width: "81px !important",
                              }}
                            />
                          </div>
                        </div>
                        <div className="print_sec d_flex border_bottom">
                          <div className="print_table">
                            <div className="h_4 d_flex">
                              <div className="code border_right border_bottom bold pl_3">
                                CODE
                              </div>
                              <div className="size border_right border_bottom bold  text_center">
                                SIZE
                              </div>
                              <div className="pcs border_right border_bottom bold  text_center">
                                PCS
                              </div>
                              <div className="wt border_right border_bottom bold  text_center">
                                WT
                              </div>
                              <div className="pcs_2 border_right border_bottom bold  text_center">
                                PCS
                              </div>
                              <div className="wt_2  border_bottom bold  text_center">
                                WT
                              </div>
                            </div>
                            <div className="border_bottom_0">
                              {Array.from({ length: 14 }, (_, index) => (
                                <div className="h_41 d_flex" key={index}>
                                  <div className="code border_right bold border_bottom"></div>
                                  <div className=" size border_right bold border_bottom"></div>
                                  <div className="pcs border_right bold border_bottom"></div>
                                  <div className="wt border_right bold border_bottom"></div>
                                  <div className="pcs_2 border_right bold border_bottom"></div>
                                  <div className="wt_2 bold border_bottom"></div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="BARCODE">
                            {e?.data?.rd !== 0 && (
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
                        <div className="print-sec d_flex footer">
                          <div className="w17Imp border_right">
                            <div className="upper border_bottom text_center center_item">
                              <p className="semibold">DIAM.</p>
                            </div>
                            <div
                              className="lower17 center_item bold "
                              style={{ borderBottom: "1px solid black", fontSize: "9.5px" }}
                            >
                              {+e?.additional?.dia?.diaPcs +
                                "/" +
                                e?.additional?.dia?.diaWt?.toFixed(3)}
                            </div>
                          </div>
                          {/* <div className="w_12mm border_right">
                            <div className="upper"></div>
                            <div className="lower17"></div>
                          </div> */}
                          <div className="w17cs border_right">
                            <div className="upper border_bottom text_center center_item">
                              <p className="semibold">CS</p>
                            </div>
                            <div
                              className="lower17 center_item bold"
                              style={{ borderBottom: "1px solid black", fontSize: "9.5px" }}
                            >
                              {+e?.additional?.clr?.clrPcs +
                                "/" +
                                +e?.additional?.clr?.clrWt?.toFixed(3)}
                            </div>
                          </div>
                          {/* <div className="w_12mm border_right">
                            <div className="upper"></div>
                            <div className="lower17"></div>
                          </div> */}
                          <div className="w_10 border_right">
                            <div className="upper border_bottom text_center center_item">
                              <p className="semibold">METAL</p>
                            </div>
                            <div
                              className="lower17 center_item bold"
                              style={{ borderBottom: "1px solid black", fontSize: "9.5px" }}
                            >
                              {/* {e?.data?.rd?.["QuotGrossWeight"]?.toFixed(3)} */}
                              {e?.data?.rd?.netwt?.toFixed(3)}
                            </div>
                          </div>
                          {/* <div className="w_13 border_right">
                            <div className="upper"></div>
                            <div className="lower17"></div>
                          </div> */}
                          <div className=" border_right" style={{ width: '15mm', boxSizing: 'border-box' }}>
                            <div className="upper border_bottom text_center center_item">
                              <p className="semibold">MISC</p>
                            </div>
                            <div
                              className="lower17 center_item bold"
                              style={{
                                borderBottom: "1px solid black !important", fontSize: "9.5px"
                              }}
                            >
                              {(+e?.additional?.misc?.miscWt)?.toFixed(3)}
                            </div>
                          </div>
                          <div className="w_12_5mm">
                            <div className="upper"></div>
                            <div className="lower17"></div>
                          </div>
                          <div className="w_12_5mm">
                            <div className="upper"></div>
                            <div className="lower17"></div>
                          </div>
                          <div className="qrcodebg_17">
                            <QRCodeGenerator
                              text={e?.data?.rd.serialjobno}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="container_17_old mb_2 mt_2 container_margin_left">
                    <div className=" border-black border-2     enime_17_old">
                      <div className="d_flex">
                        <div className="side_1_17">
                          <div
                            className="header_first"
                            style={{ borderRight: "1px solid black" }}
                          >
                            <p className="fontsize17">
                              {e?.data?.rd?.["serialjobno"]}&nbsp;
                              {
                                (e?.data?.rd?.IsQuickRepairing === 1 && e?.data?.rd?.referenceno !== '') ?
                                  <span style={{ color: 'red', fontSize: '10px' }}>
                                    {(e?.data?.rd?.referenceno === null && e?.data?.rd?.referenceno === '') ? '' : `(${e?.data?.rd?.referenceno})`}
                                  </span> : ''
                              }
                            </p>
                            <p className="fontsize17">
                              {e?.data?.rd?.["Designcode"]}
                            </p>
                            <p className="fontsize17" style={{ lineHeight: '12px' }}>
                              {e?.data?.rd?.["MetalType"]}{" "}
                              {e?.data?.rd?.["MetalColor"]}{" "}
                            </p>
                          </div>
                          <div className="empty_17box_second">
                            <div className="w_25 border_right p_3 bold grey ">
                              <p
                                className="fsize17 linehP17"
                                style={{ fontSize: "10px" }}
                              >
                                SALES REP.
                              </p>
                              <p className="bold black fsize17 linehP17">
                                {e?.data?.rd?.["SalesrepCode"]}
                              </p>
                            </div>
                            <div className="w_19_p border_right p_3 bold grey fsize17">
                              <p className="fsize17 linehP17">FROS</p>
                              <p className="bold black fsize17 linehP17">
                                {e?.data?.rd?.["MetalFrosting"]}
                              </p>
                            </div>
                            <div className="w_19_p border_right p_3 bold grey fsize17">
                              <p className="fsize17 linehP17">LAB</p>
                              <p className="bold black fsize17 linehP17">
                                {e?.data?.rd?.["MasterManagement_labname"]}
                              </p>
                            </div>
                            <div className="w_37_p p_3 bold grey fsize17">
                              <p className="fsize17 linehP17">MAKETYPE</p>
                              <p className="bold black fsize17 linehP17">
                                {e?.data?.rd?.["mastermanagement_maketypename"]}
                              </p>
                            </div>
                          </div>

                          <div className="border_bottom h_5 d_flex align_center pl_3 border_right">
                            <div className="bold separatedfs17old d-flex w-100 justify-content-between align-items-center">
                              <p className="ps-2">{e?.data?.rd?.OrderNo}</p>
                              <p className="ps-2">{e?.data?.rd?.category?.slice(0, 9)}</p>
                              <p className="pe-2">{e?.data?.rd?.["PO"]?.slice(0, 17)}</p>
                            </div>
                          </div>
                          <div className="d_flex h_88_17 pl_3 border_bottom border_right">
                            <p className="w_10  grey bold separatedfs17old ">
                              METAL
                            </p>
                            <p className="w_10 center_item">
                              {BackSide[0]?.["METAL"]}
                            </p>
                          </div>
                          <div
                            className="d_flex border_bottom border_right"
                            style={{ height: "25px" }}
                          >
                            <div className="width_Y border_right p_3 grey bold text_center separatedfs17old" style={{width: "20%"}}>
                              <p className="lineheightbg17old">Gr.Wt </p>
                            </div>
                            <div className="width_Y border_right p_3 grey bold text_center separatedfs17old" style={{width: "20%"}}>
                              <p className="lineheightbg17old">Chaki Post </p>
                            </div>
                            <div className="width_Y border_right p_3 grey bold text_center separatedfs17old" style={{width: "20%"}}>
                              <p className="lineheightbg17old">Taar </p>
                            </div>
                            <div className="width_Y border_right p_3 grey bold text_center separatedfs17old" style={{width: "20%"}}>
                              <p className="lineheightbg17old">Extra Metal</p>
                            </div>
                            <div className="width_Y border_right p_3 grey bold text_center separatedfs17old" style={{width: "20%",borderRight:"none"}}>
                              <p className="lineheightbg17old">Other</p>
                            </div>
                            
                          </div>
                          <div
                            className="d_flex border_bottom border_right"
                            style={{ height: "21px" }}
                          >
                            <div className="width_Y border_right p_3 grey bold text_center separatedfs17old" style={{width:"20%",height:"21px"}}>
                              <p className="lineheightbg17old"  >&nbsp; &nbsp;  &nbsp; &nbsp;  </p>
                            </div>
                            <div className="width_Y border_right p_3 grey bold text_center separatedfs17old" style={{width:"20%",height:"21px"}}>
                              <p className="lineheightbg17old"  >  </p>
                            </div>
                            <div className="width_Y border_right p_3 grey bold text_center separatedfs17old" style={{width:"20%",height:"21px"}}>
                              <p className="lineheightbg17old">  </p>
                            </div>
                            <div className="width_Y border_right p_3 grey bold text_center separatedfs17old" style={{width:"20%",height:"21px"}}>
                              <p className="lineheightbg17old"> </p>
                            </div>
                           
                            
                          </div>
                          
                           
                           
                        </div>
                        <div
                          className="side_2_17"
                          style={{
                            borderTop: "1px solid black",
                            borderLeft: "1px solid",
                          }}
                        >

                          {console.log(e?.data)}
                          <img
                            src={
                              e?.data?.rd?.DesignImage !== ''
                                ? e?.data?.rd?.DesignImage
                                : require("../../assets/img/default.jpg")
                            }
                            // src={
                            //   e?.additional?.img !== ""
                            //     ? e?.additional?.img
                            //     : require("../../assets/img/default.jpg")
                            // }
                            alt=""
                            onError={(e) => handleImageError(e)}
                            loading="eager"
                            id="img17duplicate"
                          />
                          <div className="cvds  pl_3">
                            <p className=" bold grey separatedfs17old  ">
                              CVD TEST
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="d_flex position_relative">
                        <div className="d_flex dept">
                          <div className="w_98 unique17">
                            <div
                              className="d_flex border_bottom h_4_5 enime_h_17_old"
                              style={{ height: "3.5mm" }}
                            >
                              <div className="width_dept border_right pl_3 border_top bold separatedfs17old">
                                DEPT.{" "}
                              </div>
                              <div className="width_66 border_right border_top bold text_center separatedfs17old">
                                AP{" "}
                              </div>
                              <div className="width_6 border_right border_top bold text_center separatedfs17old">
                                ISSUE
                              </div>
                              <div className="width_6 border_right border_top bold text_center separatedfs17old">
                                RECEIVE
                              </div>
                              <div className="width_6 border_right border_top bold text_center separatedfs17old">
                                SCRAP
                              </div>
                              <div className="width_6 border_right border_top bold text_center separatedfs17old">
                                PCS
                              </div>
                              <div className="width_6 border_top bold text_center separatedfs17old">
                                WORKER
                              </div>
                            </div>
                            <div className="d_flex border_bottom h_4_5">
                              <div className="width_dept border_right pl_3 bold separatedfs17old">
                               FIL.
                              </div>
                              <div className="width_66 border_right bold"></div>
                              <div className="width_6 border_right pl_3 bold" style={{fontSize:"11px"}}> {e?.data?.rd?.NetWeight?.toFixed(3)}</div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6  pl_3 bold"></div>
                            </div>
                            <div className="d_flex border_bottom h_4_5">
                              <div className="width_dept border_right pl_3 bold separatedfs17old">
                                FIL.
                              </div>
                              <div className="width_66 border_right bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6  pl_3 bold"></div>
                            </div>
                            <div className="d_flex border_bottom h_4_5">
                              <div className="width_dept border_right pl_3 bold separatedfs17old">
                                ASM.
                              </div>
                              <div className="width_66 border_right bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6  pl_3 bold"></div>
                            </div>
                            <div className="d_flex border_bottom h_4_5">
                              <div className="width_dept border_right pl_3 bold separatedfs17old">
                                EP/PI.
                              </div>
                              <div className="width_66 border_right bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6  pl_3 bold"></div>
                            </div>
                            <div className="d_flex border_bottom h_4_5">
                              <div className="width_dept border_right pl_3 bold separatedfs17old">
                                EP/PI.
                              </div>
                              <div className="width_66 border_right bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6  pl_3 bold"></div>
                            </div>
                            <div className="d_flex border_bottom h_4_5">
                              <div className="width_dept border_right pl_3 bold separatedfs17old">
                                SET.
                              </div>
                              <div className="width_66 border_right bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6  pl_3 bold"></div>
                            </div>
                            <div className="d_flex border_bottom h_4_5">
                              <div className="width_dept border_right pl_3 bold separatedfs17old">
                              SET.
                              </div>
                              <div className="width_66 border_right bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6  pl_3 bold"></div>
                            </div>
                            <div className="d_flex border_bottom h_4_5">
                              <div className="width_dept border_right pl_3 bold separatedfs17old">
                               FPI
                              </div>
                              <div className="width_66 border_right bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6 border_right pl_3 bold"></div>
                              <div className="width_6  pl_3 bold"></div>
                            </div>
                            <div
                              className="d_flex  h_4_5"
                              style={{ height: "4.4mm" }}
                            >
                              <div
                                className="width_dept border_right pl_3 bold separatedfs17old"
                                style={{ borderBottom: "0px solid black" }}
                              >
                                FPI
                              </div>
                              <div
                                className="width_66 border_right bold"
                                style={{ borderBottom: "0px solid black" }}
                              ></div>
                              <div
                                className="width_6 border_right pl_3 bold"
                                style={{ borderBottom: "0px solid black" }}
                              ></div>
                              <div
                                className="width_6 border_right pl_3 bold"
                                style={{ borderBottom: "0px solid black" }}
                              ></div>
                              <div
                                className="width_6 border_right pl_3 bold"
                                style={{ borderBottom: "0px solid black" }}
                              ></div>
                              <div
                                className="width_6 border_right pl_3 bold"
                                style={{ borderBottom: "0px solid black" }}
                              ></div>
                              <div
                                className="width_6  pl_3 bold"
                                style={{ borderBottom: "0px solid black" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div
                          className="BARCODE"
                          style={{ height: "60.6mm", borderBottom: "1px solid", borderRadius: "0" }}
                        >
                          {e?.data?.rd !== 0 && e?.data?.rd !== undefined && (
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
                </React.Fragment>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default PrintDesign17;