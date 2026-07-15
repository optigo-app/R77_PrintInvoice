import React, { useEffect, useState } from "react";
import "../../assets/css/bagprint/print4A.css";
import BarcodeGenerator from "../../components/BarcodeGenerator";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import Loader from "../../components/Loader";
import { GetData } from "../../GlobalFunctions/GetData";
import { handlePrint } from "../../GlobalFunctions/HandlePrint";
import { handleImageError } from "../../GlobalFunctions/HandleImageError";
import { organizeData } from "../../GlobalFunctions/OrganizeBagPrintData";
import { checkInstruction, fixedValues } from "../../GlobalFunctions";
import { GetUniquejob } from "../../GlobalFunctions/GetUniqueJob";

const BagPrint4A = ({ queries, headers }) => {
  const [data, setData] = useState([]);
  console.log('data: ', data);
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const resultString = GetUniquejob(queryParams?.str_srjobno);
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
        const allDatas = await GetData(objs);
        let datas = organizeData(allDatas?.rd, allDatas?.rd1);
        // eslint-disable-next-line array-callback-return
        datas?.map((a) => {
          let chunkData = [];
          let chunkSize = 15;
          let length = 0;
          let clr = {
            Shapename: "TOTAL",
            Sizename: "C TOTAL",
            ActualPcs: 0,
            ActualWeight: 0,
            MasterManagement_DiamondStoneTypeid: 4,
          };
          let dia = {
            Shapename: "TOTAL",
            Sizename: "D TOTAL",
            ActualPcs: 0,
            ActualWeight: 0,
            MasterManagement_DiamondStoneTypeid: 3,
          };
          let misc = {
            Shapename: "MISC TOTAL",
            Sizename: "MISC TOTAL",
            ActualPcs: 0,
            ActualWeight: 0,
            MasterManagement_DiamondStoneTypeid: 7,
          };
          let f = {
            Shapename: "TOTAL",
            Sizename: "F TOTAL",
            ActualPcs: 0,
            ActualWeight: 0,
            MasterManagement_DiamondStoneTypeid: 5,
          }
          let tc = {
            Shapename: "",
            Shapecode: "",
            ConcatedFullShapeQualityColorName: "",
            ConcatedFullShapeQualityColorCode: "",
            MasterManagement_DiamondStoneTypeid: 6,
          }
          let tch = {
            Shapename: "METAL DETAIL",
            Shapecode: "METAL DETAIL",
            ConcatedFullShapeQualityColorName: "METAL DETAIL",
            ConcatedFullShapeQualityColorCode: "METAL DETAIL",
            MasterManagement_DiamondStoneTypeid: 6,
          }

          let diaArr = [];
          let clsArr = [];
          let miscArr = [];
          let fArr = [];
          // eslint-disable-next-line array-callback-return
          a?.rd1?.map((e, i) => {
            if (e?.ConcatedFullShapeQualityColorCode !== "- - - ") {
              length++;
            }
            if (e?.MasterManagement_DiamondStoneTypeid === 3) {
              dia.ActualPcs = dia.ActualPcs + e.ActualPcs;
              dia.ActualWeight = dia.ActualWeight + e.ActualWeight;
              diaArr?.push(e)
            } else if (e?.MasterManagement_DiamondStoneTypeid === 4) {
              clr.ActualPcs = clr.ActualPcs + e.ActualPcs;
              clr.ActualWeight = clr.ActualWeight + e.ActualWeight;
              clsArr?.push(e)
            } else if (e?.MasterManagement_DiamondStoneTypeid === 5) {
              f.ActualPcs = f.ActualPcs + e.ActualPcs;
              f.ActualWeight = f.ActualWeight + e.ActualWeight;
              fArr?.push(e)
            } else if (e?.MasterManagement_DiamondStoneTypeid === 7) {
              misc.ActualPcs = misc.ActualPcs + e.ActualPcs;
              misc.ActualWeight = misc.ActualWeight + e.ActualWeight;
              miscArr?.push(e)
            }
          });

          dia.ActualPcs = +dia.ActualPcs?.toFixed(3);
          dia.ActualWeight = +dia.ActualWeight?.toFixed(3);
          clr.ActualPcs = +clr.ActualPcs?.toFixed(3);
          clr.ActualWeight = +clr.ActualWeight?.toFixed(3);
          misc.ActualPcs = +misc.ActualPcs?.toFixed(3);
          misc.ActualWeight = +misc.ActualWeight?.toFixed(3);
          f.ActualPcs = +f.ActualPcs?.toFixed(3);
          f.ActualWeight = +f.ActualWeight?.toFixed(3);


          let blankArr = a?.rd1?.filter((e, i) => e?.MasterManagement_DiamondStoneTypeid !== 0);

          let newDia = {
            Shapename: "DIAMOND DETAIL",
            Sizename: "",
            ActualPcs: "",
            ActualWeight: "",
            MasterManagement_DiamondStoneTypeid: 3,
          };
          let newCS = {
            Shapename: "COLORSTONE DETAIL",
            Sizename: "",
            ActualPcs: "",
            ActualWeight: "",
            MasterManagement_DiamondStoneTypeid: 4,
          };
          let newMisc = {
            Shapename: "MISC DETAIL",
            Sizename: "",
            ActualPcs: "",
            ActualWeight: "",
            MasterManagement_DiamondStoneTypeid: 7,
          };
          let newfind = {
            Shapename: "FINDING DETAIL",
            Sizename: "",
            ActualPcs: "",
            ActualWeight: "",
            MasterManagement_DiamondStoneTypeid: 5,
          };

          diaArr?.unshift(newDia);
          clsArr?.unshift(newCS);
          miscArr?.unshift(newMisc);
          fArr?.unshift(newfind);
          let blankArr1 = [];

          if (diaArr?.length > 1) {
            blankArr1 = blankArr1?.concat(diaArr);
          }
          if (clsArr?.length > 1) {
            blankArr1 = blankArr1?.concat(clsArr);
          }
          if (miscArr?.length > 1) {
            blankArr1 = blankArr1?.concat(miscArr);
          }
          if (fArr?.length > 1) {
            blankArr1 = blankArr1?.concat(fArr);
          }


          // blankArr1 = blankArr1.concat(diaArr, clsArr, miscArr,fArr);
          // let blankArr1 = blankArr12.concat(fArr);
          a.rd1 = blankArr;
          let obj = { ...a };
          if (obj?.rd?.length > 0) {
            obj.rd.instructionData = (
              a?.rd["officeuse"] +
              a?.rd?.custInstruction +
              a?.rd["ProductInstruction"]
            )?.substring(0, 113);
          }
          let imagePath = queryParams?.imagepath;
          imagePath = atob(queryParams?.imagepath);
          let img = imagePath + a?.rd?.ThumbImagePath;
          tc.ConcatedFullShapeQualityColorName = (a?.rd?.MetalType == null ? 'NA' : a?.rd?.MetalType) + " " + (a?.rd?.MetalColorCo == null ? 'NA' : a?.rd?.MetalColorCo)
          tc.ConcatedFullShapeQualityColorCode = (a?.rd?.MetalType == null ? 'NA' : a?.rd?.MetalType) + " " + (a?.rd?.MetalColorCo == null ? 'NA' : a?.rd?.MetalColorCo)
          blankArr1.unshift(tc);
          blankArr1.unshift(tch);



          for (let i = 0; i < blankArr1?.length; i += chunkSize) {
            const chunks = blankArr1?.slice(i, i + chunkSize);
            let len = 15 - blankArr1?.slice(i, i + chunkSize)?.length;
            chunkData.push({ data: chunks, length: len });
          }

          responseData.push({
            data: obj.rd,
            additional: {
              length: length,
              clr: clr,
              dia: dia,
              f: f,
              img: img,
              misc: misc,
              pages: chunkData,
            },
          });
        });
        setData(responseData);
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

  return (
    <>
      {data?.length === 0 ? (
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
          <section className="print4A pad_60_allPrint">
            {Array.from(
              { length: queries?.pageStart },
              (_, index) =>
                index > 0 && (
                  <div
                    key={index}
                    className="container4A container4AA"
                    style={{ border: "0px", }}
                  >
                    <div className="print4Apart_1 print4apart_1" style={{ border: "0px" }}></div>
                  </div>
                )
            )}
            {data?.length > 0 &&
              data?.map((e, i) => {
                return (
                  <React.Fragment key={i}>
                    {console.log(e)}
                    {e?.additional?.pages?.length > 0 ? <> {(
                      e?.additional?.pages?.map((ele, ind) => {
                        return (
                          <div className="container4A container4AA" key={ind}>
                            <div className="print4Apart_1 print4apart_1">
                              <div className="part_1_4A">
                                <div className="title4A jobDiaGold4A border_bottom4A">
                                  <div className="jobDiaGoldText4A ps-1">
                                    {e?.data?.serialjobno}
                                  </div>
                                  <div className="jobDiaGoldText4A">
                                    {e?.data?.Designcode}
                                  </div>
                                  <div
                                    className="jobDiaGoldText4A border_right4A pe-1"
                                    style={{ paddingRight: "2px" }}
                                  >
                                    {e?.data?.MetalType} {e?.data?.MetalColorCo}
                                  </div>
                                </div>
                                <div className="height_border_31_4A border_bottom4A">
                                  <div className="cust4A border_right4A">
                                    <div
                                      className="custText4A"

                                    >
                                      CUST
                                    </div>
                                    <div className="custTextRes4A ">
                                      {e?.data?.CustomerCode}
                                    </div>
                                  </div>
                                  <div className="ordDt4A border_right4A">
                                    <div
                                      className="custText4A"

                                    >
                                      ORD.DT.
                                    </div>
                                    <div className="custTextRes4A" style={{ fontSize: `${e?.data?.orderDatef?.length > 6 ? '7pt' : '9pt'}` }}>
                                      {e?.data?.orderDatef ?? ""}
                                    </div>
                                  </div>
                                  <div className="delDt4A border_right4A">
                                    <div
                                      className="custText4A"

                                    >
                                      DEL.DT.
                                    </div>
                                    <div className="custTextRes4A" style={{ fontSize: `${e?.data?.promiseDatef?.length > 6 ? '7pt' : '9pt'}` }}>
                                      {e?.data?.promiseDatef ?? ""}
                                    </div>
                                  </div>
                                  <div className="size4A border_right4A size4AA">
                                    <div className="custText4A" >
                                      SIZE
                                    </div>
                                    <div className="custTextRes4A" style={{ fontSize: `${e?.data?.Size?.length > 5 ? '6pt' : '9pt'}` }}>
                                      {e?.data?.Size?.length > 0 ? e?.data?.Size : 'NA'}
                                    </div>
                                  </div>
                                </div>
                                <div className="title4A border_bottom4A d_flex4A">
                                  <div className="code4A border_right4A code4A_text d-flex align-items-center">
                                    CODE
                                  </div>
                                  <div className="size4AS border_right4A code4A_text d-flex align-items-center">
                                    SIZE
                                  </div>
                                  <div className="pcs4A border_right4A code4A_text d-flex align-items-center">
                                    PCS
                                  </div>
                                  <div className="wt4A border_right4A code4A_text d-flex align-items-center">
                                    WT
                                  </div>
                                  <div className="pcs4A border_right4A code4A_text d-flex align-items-center">
                                    PCS
                                  </div>
                                  <div className="wt4A border_right4A code4A_text d-flex align-items-center">
                                    WT
                                  </div>
                                </div>

                                <div className="record_line_1">
                                  {ele?.data?.map((elem, index) => {
                                    return (
                                      <React.Fragment key={index}>
                                        {
                                          elem?.MasterManagement_DiamondStoneTypeid ===
                                            5 ? (
                                            <React.Fragment>
                                              {
                                                elem?.Shapename === "FINDING DETAIL"
                                                  ?
                                                  <>
                                                    <div
                                                      className="record_line_4A border_bottom4A"
                                                    >
                                                      <div className="code4A border_right4A code4A_text w-100 fw-bold d-flex justify-content-center align-items-center" style={{ height: "17px" }}>
                                                        {elem?.Shapename}
                                                      </div>
                                                    </div>
                                                  </>
                                                  :
                                                  <>
                                                    {
                                                      elem?.Sizename === "F TOTAL" ?
                                                        <div
                                                          className="record_line_4A border_bottom4A"
                                                        >
                                                          <div
                                                            className="code4A border_right4A code4A_text"
                                                            style={{
                                                              width: "96pt",
                                                              lineHeight: "8px",
                                                            }}
                                                          >
                                                            <div className="finding height_23_4A fw-bold">
                                                              {elem?.Sizename}
                                                            </div>
                                                          </div>
                                                          <div className="pcs4A border_right4A code4A_text fw-bold">{elem?.ActualPcs}</div>
                                                          <div className="wt4A border_right4A code4A_text fw-bold">{elem?.ActualWeight?.toFixed(3)}</div>
                                                          <div className="pcs4A border_right4A code4A_text">{elem?.IssuePcs === 0 ? '' : elem?.IssuePcs}</div>
                                                          <div className="wt4A border_right4A code4A_text">{elem?.IssueWeight === 0 ? '' : elem?.IssueWeight?.toFixed(3)}</div>
                                                        </div> : <div
                                                          className="record_line_4A border_bottom4A"
                                                        >
                                                          <div
                                                            className="code4A border_right4A code4A_text"
                                                            style={{
                                                              width: "96pt",
                                                              lineHeight: "8px",
                                                            }}
                                                          >
                                                            <div className="finding height_23_4A truncatefind4A" style={{ fontSize: "6.8pt" }}>
                                                              {elem?.ConcatedFullShapeQualityColorCode}
                                                            </div>
                                                          </div>
                                                          <div className="pcs4A border_right4A code4A_text">{elem?.ActualPcs}</div>
                                                          <div className="wt4A border_right4A code4A_text">{elem?.ActualWeight?.toFixed(3)}</div>
                                                          <div className="pcs4A border_right4A code4A_text">{elem?.IssuePcs === 0 ? '' : elem?.IssuePcs}</div>
                                                          <div className="wt4A border_right4A code4A_text">{elem?.IssueWeight === 0 ? '' : elem?.IssueWeight?.toFixed(3)}</div>
                                                        </div>
                                                    }
                                                  </>
                                              }
                                            </React.Fragment>
                                          ) : (
                                            <React.Fragment>

                                              {
                                                (elem?.Shapename === "METAL DETAIL" || elem?.Shapename === "DIAMOND DETAIL" || elem?.Shapename === "COLORSTONE DETAIL" || elem?.Shapename === "MISC DETAIL" || elem?.Shapename === "FINDING DETAIL")
                                                  ?
                                                  <React.Fragment>
                                                    <div
                                                      className="record_line_4A border_bottom4A"
                                                    >
                                                      <div className="code4A border_right4A code4A_text w-100 fw-bold d-flex justify-content-center align-items-center" style={{ height: "17px" }}>
                                                        {elem?.Shapename}
                                                      </div>
                                                    </div>
                                                  </React.Fragment>
                                                  :
                                                  <React.Fragment>
                                                    {
                                                      elem?.MasterManagement_DiamondStoneTypeid === 6 ? <div className="record_line_4A border_bottom4A" >
                                                        <div className="code4A border_right4A code4A_text" style={{ width: "124.5px" }}>


                                                          {
                                                            elem?.ConcatedFullShapeQualityColorCode
                                                          }
                                                        </div>
                                                        <div className="pcs4A border_right4A code4A_text">{elem?.ActualPcs}</div>
                                                        <div className="wt4A border_right4A code4A_text">{elem?.ActualWeight?.toFixed(3)}</div>
                                                        <div className="pcs4A border_right4A code4A_text">{elem?.IssuePcs === 0 ? '' : elem?.IssuePcs}</div>
                                                        <div className="wt4A border_right4A code4A_text">{elem?.IssueWeight === 0 ? '' : elem?.IssueWeight?.toFixed(3)}</div>
                                                      </div> : <div className="record_line_4A border_bottom4A" >
                                                        <div className="code4A border_right4A code4A_text">
                                                          {
                                                            elem?.ConcatedFullShapeQualityColorCode
                                                          }
                                                        </div>
                                                        <div className="size4AS border_right4A code4A_text">
                                                          {elem?.Sizename}
                                                        </div>
                                                        <div className="pcs4A border_right4A code4A_text">{elem?.ActualPcs}</div>
                                                        <div className="wt4A border_right4A code4A_text">{elem?.ActualWeight?.toFixed(3)}</div>
                                                        <div className="pcs4A border_right4A code4A_text">{elem?.IssuePcs === 0 ? '' : elem?.IssuePcs}</div>
                                                        <div className="wt4A border_right4A code4A_text">{elem?.IssueWeight === 0 ? '' : elem?.IssueWeight?.toFixed(3)}</div>
                                                      </div>
                                                    }


                                                  </React.Fragment>
                                              }
                                            </React.Fragment>
                                          )}
                                      </React.Fragment>
                                    )
                                  })}
                                  {ele?.length !== 0 &&
                                    Array.from(
                                      { length: ele?.length },
                                      (_, index) => (
                                        <div
                                          className="record_line_4A border_bottom4A"
                                          key={index}
                                        >
                                          <div className="code4A border_right4A code4A_text"></div>
                                          <div className="size4AS border_right4A code4A_text"></div>
                                          <div className="pcs4A border_right4A code4A_text"></div>
                                          <div className="wt4A border_right4A code4A_text"></div>
                                          <div className="pcs4A border_right4A code4A_text"></div>
                                          <div className="wt4A border_right4A code4A_text"></div>
                                        </div>
                                      )
                                    )}
                                </div>
                              </div>
                              <div className="part_2_4A">
                                <div className="img_sec_4A" style={{ height: "117px", width: "117px", boxSizing: 'border-box' }}>
                                  <img
                                    src={
                                      e?.data?.DesignImage !== ''
                                        ? e?.data?.DesignImage
                                        : require("../../assets/img/default.jpg")
                                    }
                                    alt=""
                                    onError={(e) => handleImageError(e)}
                                    loading="eager"
                                    style={{ height: '100%', width: '100%', objectFit: 'contain' }}
                                  />
                                </div>
                                <div className="barcode_sticker_4A border-black border-top">
                                  <div className="barcodeText4A">
                                    <div className="BARCODE_TEXT_4A border_right4A">
                                      <div className="diamond_4A border_bottom4A diamond_text_4A dflex4Ak">
                                        DIAMOND
                                      </div>
                                      <div className="diamond_4A border_bottom4A diamond_text_4A dflex4Ak">
                                        {e?.additional?.dia?.ActualPcs}/
                                        {e?.additional?.dia?.ActualWeight?.toFixed(
                                          3
                                        )}
                                      </div>
                                      <div className="diamond_custom_4A border_bottom4A"></div>
                                    </div>
                                    <div className="BARCODE_TEXT_4A border_right4A">
                                      <div className="diamond_4A border_bottom4A diamond_text_4A dflex4Ak">
                                        CS
                                      </div>
                                      <div className="diamond_4A border_bottom4A diamond_text_4A dflex4Ak">
                                        {e?.additional?.clr?.ActualPcs}/
                                        {fixedValues(e?.additional?.clr?.ActualWeight, 2)}
                                      </div>
                                      <div className="diamond_custom_4A border_bottom4A"></div>
                                    </div>
                                    <div className="BARCODE_TEXT_4A border_right4A">
                                      <div className="diamond_4A border_bottom4A diamond_text_4A dflex4Ak">
                                        METAL
                                      </div>
                                      <div className="diamond_4A border_bottom4A diamond_text_4A dflex4Ak">
                                        {fixedValues(e?.data?.ActualGrossweight, 3)}
                                      </div>
                                      <div className="diamond_custom_4A "></div>
                                    </div>
                                    <div className="BARCODE_TEXT_4A border_right4A" style={{ borderTop: "1px solid" }}>
                                      <div className="diamond_4A border_bottom4A diamond_text_4A dflex4Ak">
                                        {e?.data?.ComponentCount?.length > 0 ? <div>PARTS :  {e?.data?.ComponentCount}</div> : ''}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="barcode_img_4A">
                                    <BarcodeGenerator
                                      data={e?.data?.serialjobno}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="part_3_4A">
                                <div className="cast_ins" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ width: '12%', height: '38px' }}>CAST INS.:</div>
                                  <div className="red_4A" style={{ width: '87%', height: '38px', wordBreak: 'break-word' }}>
                                    {checkInstruction(e?.data?.officeuse)}{" "}
                                    {e?.data?.ProductInstruction?.length > 0 ? checkInstruction(e?.data?.ProductInstruction) : checkInstruction(e?.data?.QuoteRemark)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                      <div className="container4A container4AA" key={i + "a"}>
                        <div className="print4Apart_1 print4apart_1">
                          <div className="part_1_container_4A container_print4Apart_1">
                            <div className="title4A jobDiaGold4A border_bottom4A">
                              <div className="jobDiaGoldText4A ps-1">
                                {e?.data?.serialjobno}
                              </div>
                              <div className="jobDiaGoldText4A">
                                {e?.data?.Designcode}
                              </div>
                              <div className="jobDiaGoldText4A border_right4A pe-1">
                                {e?.data?.MetalType} {e?.data?.MetalColorCo}
                              </div>
                            </div>
                            <div className="priority4A border_bottom4A">
                              <div className="border_right4A priority_text_4A priority_sec_4A ">
                                PRIORITY
                              </div>
                              <div className="border_right4A priority_text_4A loc4A ">
                                LOC
                              </div>
                              <div className="border_right4A priority_text_4A qc4A ">
                                Q.C.
                              </div>
                            </div>
                            <div className="sales_rep_4A border_bottom4A">
                              <div className="priority_sec_4A border_right4A">
                                <div
                                  className="sales_Rep_text_4A"
                                  style={{ paddingTop: "3px" }}
                                >
                                  SALES REP.
                                </div>
                                <div className="sales_Rep_letter_4A">
                                  {e?.data?.SalesrepCode}
                                </div>
                              </div>
                              <div className=" border_right4A  loc4A ">
                                <div
                                  className="sales_Rep_text_4A"
                                  style={{ paddingTop: "3px" }}
                                >
                                  FROSTING
                                </div>
                                <div className="sales_Rep_letter_4A">
                                  {e?.data?.MetalFrosting}
                                </div>
                              </div>
                              <div className=" border_right4A  qc4A ">
                                <div
                                  className="sales_Rep_text_4A"
                                  style={{ paddingTop: "3px" }}
                                >
                                  ENAMELING
                                </div>
                                <div className="sales_Rep_letter_4A" style={{ lineHeight: "7px" }}>
                                  {e?.data?.Enamelling}
                                </div>
                              </div>
                            </div>
                            <div className="lab_self_4A border_bottom4A">
                              <div className="priority_sec_4A border_right4A d_flex_4a" style={{ height: '20pt' }}>
                                <div className="sales_Rep_text_4A sales_Rep_text_4A_2" style={{ height: '10pt', fontSize: '9px' }}>
                                  LAB {e?.data?.MasterManagement_labname}
                                </div>
                                <div className="sales_Rep_letter_4A sales_Rep_text_4A_2 start_center_4A" style={{ height: '10pt', lineHeight: '6px' }}>
                                  {(e?.data?.PO !== "" && e?.data?.PO !== "-") && `PO ${e?.data?.PO}`}
                                </div>
                              </div>
                              <div className=" border_right4A  loc4A d_flex_4a " style={{ height: '20pt' }}>
                                <div className="sales_Rep_text_4A" style={{ height: '10pt' }}>
                                  SNAP
                                </div>
                                <div className="sales_Rep_letter_4A start_center_4A" style={{ height: '10pt', lineHeight: '6px' }}>
                                  {
                                    e?.data
                                      ?.MasterManagement_ProductImageType
                                  }
                                </div>
                              </div>
                              <div className=" border_right4A  qc4A d_flex_4a " style={{ height: '20pt' }}>
                                <div className="sales_Rep_text_4A" style={{ height: '10pt' }}>
                                  MAKETYPE
                                </div>
                                <div className="sales_Rep_letter_4A start_center_4A" style={{ height: '10pt', lineHeight: '6px' }}>
                                  {e?.data?.mastermanagement_maketypename}
                                </div>
                              </div>
                            </div>
                            <div className="priority4A border_bottom4A">
                              <div className="border_right4A priority_text_4A priority_sec_4A center_4A_d">
                                TR NO.
                              </div>
                              <div className="border_right4A priority_text_4A loc4A center_4A_d">
                                TR NO.
                              </div>
                              <div className="border_right4A priority_text_4A qc4A center_4A_d">
                                TR NO.
                              </div>
                            </div>
                            <div className="priority4A border_bottom4A">
                              <div className="border_right4A priority_text_4A priority_sec_4A center_4A_d">
                                TR WT
                              </div>
                              <div className="border_right4A priority_text_4A loc4A center_4A_d">
                                TR WT
                              </div>
                              <div className="border_right4A priority_text_4A qc4A center_4A_d">
                                TR WT
                              </div>
                            </div>
                          </div>
                          <div className="part_2_container_4A container_print4Apart_1">
                            <div className="img_sec_container_4A border-bottom border-black" style={{ height: '117px', width: '117px', boxSizing: 'border-box' }}>
                              <img
                                src={e?.data?.DesignImage !== ''
                                  ? e?.data?.DesignImage : ''}
                                alt=""
                                onError={(e) => handleImageError(e)}
                                loading="eager"
                                id="img4A"
                                style={{ height: '100%', width: '100%', objectFit: 'contain' }}
                              />
                            </div>
                          </div>
                          <div className="part_3_container_4A">
                            <div className="part_3_container_4A_sec">
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center justify-content-center px-1">
                                  DEPT
                                </div>
                                <div className="issue_4A border_right4A d-flex align-items-center justify-content-center px-1">
                                  ISSUE
                                </div>
                                <div className="receive_4A border_right4A d-flex align-items-center justify-content-center px-1">
                                  RECEIVE
                                </div>
                                <div className="scrap_4A border_right4A d-flex align-items-center justify-content-center px-1">
                                  SCRAP
                                </div>
                                <div className="pcs_4A border_right4A d-flex align-items-center justify-content-center px-1">
                                  PCS
                                </div>
                                <div className="worker_4A border_right_4A d-flex align-items-center justify-content-center px-1">
                                  WORKER
                                </div>
                              </div>

                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  GRD.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  FIL.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  PPL.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  SET.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  ASM.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  FPL.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  PLT.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  ENM.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  F.G.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className="lh4A dept_4A border_right4A d-flex align-items-center">
                                  SLS. INS.
                                </div>
                              </div>
                              <div style={{ display: "flex" }}>
                                <div className="part_3_container_4A_record border_bottom4A" style={{ width: "60%" }}>
                                  <div className="lh4A dept_4A border_right4A d-flex align-items-center"  >
                                    PRD. INS.
                                  </div>
                                </div>
                                <div className="part_3_container_4A_record border_bottom4A" style={{ width: "40%", borderLeft: "1px solid #000" }}>
                                  <div className=" dept_4A border_right4A d-flex align-items-center">
                                    QC. INS.
                                  </div>
                                </div>
                              </div>
                              <div className="part_3_container_4A_record ">

                                <p
                                  style={{
                                    padding: '0px 10px',
                                    fontSize: '13px',
                                    fontWeight: 600
                                  }}>



                                  {/* {e?.data?.ishallmark == 1 && "Hallmark, "}
                                  {e?.data.Ustamping ? `Stamping - ${e?.data?.Ustamping}, ` : ""}
                                  {e?.data?.Certificate ? `Certi# - ${e?.data?.Certificate}` : ""} */}

                                  {

                                    [
                                      // (e?.data?.stamping || e?.data?.Ustamping) &&
                                      // ` ${e?.data?.stamping
                                      //   ? e.data.stamping.slice(0, 12)
                                      //   : e?.data?.Ustamping?.slice(0, 12)
                                      // }`,

                                      (e?.data?.stamping || e?.data?.Ustamping) &&
                                      ` ${e?.data?.stamping
                                        ? e.data.stamping.slice(
                                          0,
                                          e?.data?.IsDiamondWt && e?.data?.IsDiamondPcs ? 12 : 20
                                        )
                                        : e?.data?.Ustamping?.slice(
                                          0,
                                          e?.data?.IsDiamondWt && e?.data?.IsDiamondPcs ? 12 : 20
                                        )
                                      }`,
                                      e?.data?.IsDiamondPcs && ` ${"DPcs"}`,
                                      e?.data?.IsDiamondWt && ` ${"DWt"}`,
                                      e?.data?.Certificate && ` ${e?.data?.Certificate.slice(0, 12)}`,
                                      e?.data?.ishallmark == 1 && "HUID",
                                    ]
                                      .filter(Boolean)
                                      .join(", ")
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="barcode_img_container_4A">
                              <BarcodeGenerator
                                data={e?.data?.serialjobno}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </> : <>
                      <div className="container4A container4AA" key={i + "ab"}>
                        <div className="print4Apart_1 print4apart_1">
                          <div className="part_1_4A">
                            <div className="title4A jobDiaGold4A border_bottom4A">
                              <div className="jobDiaGoldText4A ps-1">
                                {e?.data?.serialjobno}
                              </div>
                              <div className="jobDiaGoldText4A">
                                {e?.data?.Designcode}
                              </div>
                              <div className="jobDiaGoldText4A border_right4A pe-1">
                                {e?.data?.MetalType} {e?.data?.MetalColorCo}
                              </div>
                            </div>
                            <div className="height_border_31_4A border_bottom4A">
                              <div className="cust4A border_right4A">
                                <div
                                  className="custText4A"
                                  style={{ paddingTop: "3px" }}
                                >
                                  CUST
                                </div>
                                <div className="custTextRes4A ">
                                  {e?.data?.CustomerCode}
                                </div>
                              </div>
                              <div className="ordDt4A border_right4A">
                                <div
                                  className="custText4A"
                                  style={{ paddingTop: "3px" }}
                                >
                                  ORD.DT.
                                </div>
                                <div className="custTextRes4A" style={{ fontSize: `${e?.data?.orderDatef?.length > 7 ? '7pt' : '9pt'}` }}>
                                  {e?.data?.orderDatef ?? ""}
                                </div>
                              </div>
                              <div className="delDt4A border_right4A">
                                <div
                                  className="custText4A"
                                  style={{ paddingTop: "3px" }}
                                >
                                  DEL.DT.
                                </div>
                                <div className="custTextRes4A" style={{ fontSize: `${e?.data?.promiseDatef?.length > 7 ? '7pt' : '9pt'}` }}>
                                  {(e?.data?.promiseDatef)}
                                </div>
                              </div>
                              <div className="size4A border_right4A size4AA">
                                <div
                                  className="custText4A"
                                  style={{ paddingTop: "3px" }}
                                >
                                  SIZE
                                </div>
                                <div className="custTextRes4A" style={{ fontSize: `${e?.data?.Size?.length > 5 ? '6pt' : '9pt'}` }}>
                                  {e?.data?.Size?.length > 0 ? e?.data?.Size : 'NA'}
                                </div>
                              </div>
                            </div>
                            <div className="title4A border_bottom4A d_flex4A">
                              <div className="code4A border_right4A code4A_text d-flex align-items-center">
                                CODE
                              </div>
                              <div className="size4AS border_right4A code4A_text d-flex align-items-center">
                                SIZE
                              </div>
                              <div className="pcs4A border_right4A code4A_text d-flex align-items-center">
                                PCS
                              </div>
                              <div className="wt4A border_right4A code4A_text d-flex align-items-center">
                                WT
                              </div>
                              <div className="pcs4A border_right4A code4A_text d-flex align-items-center">
                                PCS
                              </div>
                              <div className="wt4A border_right4A code4A_text d-flex align-items-center">
                                WT
                              </div>
                            </div>
                            <div className="record_line_1">
                              {Array.from({ length: 14 }, (_, index) => (
                                <div
                                  className="record_line_4A border_bottom4A"
                                  key={index}
                                >
                                  <div className="code4A border_right4A code4A_text"></div>
                                  <div className="size4AS border_right4A code4A_text"></div>
                                  <div className="pcs4A border_right4A code4A_text"></div>
                                  <div className="wt4A border_right4A code4A_text"></div>
                                  <div className="pcs4A border_right4A code4A_text"></div>
                                  <div className="wt4A border_right4A code4A_text"></div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="part_2_4A">
                            <div className="img_sec_4A" style={{ height: "117px", width: "117px", boxSizing: 'border-box' }}>
                              <img
                                src={e?.data?.DesignImage !== ''
                                  ? e?.data?.DesignImage : ''}
                                alt=""
                                onError={(e) => handleImageError(e)}
                                loading="eager"
                                style={{ height: '100%', width: '100%', objectFit: 'contain' }}
                              />
                            </div>
                            <div className="barcode_sticker_4A border-black border-top">
                              <div className="barcodeText4A">
                                <div className="BARCODE_TEXT_4A border_right4A">
                                  <div className="diamond_4A border_bottom4A diamond_text_4A dflex4Ak">
                                    DIAMOND
                                  </div>
                                  <div className="diamond_4A border_bottom4A diamond_text_4A dflex4Ak">
                                    {e?.additional?.dia?.ActualPcs}/
                                    {e?.additional?.dia?.ActualWeight?.toFixed(
                                      3
                                    )}
                                  </div>
                                  <div className="diamond_custom_4A border_bottom4A"></div>
                                </div>
                                <div className="BARCODE_TEXT_4A border_right4A">
                                  <div className="diamond_4A border_bottom4A diamond_text_4A dflex4Ak">
                                    CS
                                  </div>
                                  <div className="diamond_4A border_bottom4A diamond_text_4A dflex4Ak">
                                    {e?.additional?.clr?.ActualPcs}/
                                    {fixedValues(e?.additional?.clr?.ActualWeight, 3)}
                                  </div>
                                  <div className="diamond_custom_4A border_bottom4A"></div>
                                </div>
                                <div className="BARCODE_TEXT_4A border_right4A">
                                  <div className="diamond_4A border_bottom4A diamond_text_4A dflex4Ak">
                                    METAL
                                  </div>
                                  <div className="diamond_4A border_bottom4A diamond_text_4A dflex4Ak">
                                    {fixedValues(e?.data?.ActualGrossweight, 3)}
                                  </div>
                                  <div className="diamond_custom_4A "></div>
                                </div>

                                <div className="BARCODE_TEXT_4A border_right4A" style={{ borderTop: "1px solid" }}>
                                  <div className="diamond_4A border_bottom4A diamond_text_4A dflex4Ak">
                                    {e?.data?.ComponentCount?.length > 0 ? <div>PARTS :  {e?.data?.ComponentCount}</div> : ''}
                                  </div>
                                </div>

                              </div>
                              <div className="barcode_img_4A">
                                <BarcodeGenerator data={e?.data?.serialjobno} />
                              </div>
                            </div>
                          </div>
                          <div className="part_3_4A">
                            <div className="cast_ins" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ width: '12%', height: '38px' }}>CAST INS :</div>
                              <div className="red_4A" style={{ width: '87%', height: '38px', wordBreak: 'break-word' }}>
                                {checkInstruction(e?.data?.officeuse)}{" "}
                                {e?.data?.ProductInstruction?.length > 0 ? checkInstruction(e?.data?.ProductInstruction) : checkInstruction(e?.data?.QuoteRemark)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="container4A container4AA" key={i + "a"}>
                        <div className="print4Apart_1 print4apart_1">
                          <div className="part_1_container_4A container_print4Apart_1">
                            <div className="title4A jobDiaGold4A border_bottom4A">
                              <div className="jobDiaGoldText4A ps-1">
                                {e?.data?.serialjobno}
                              </div>
                              <div className="jobDiaGoldText4A">
                                {e?.data?.Designcode}
                              </div>
                              <div className="jobDiaGoldText4A border_right4A pe-1">
                                {e?.data?.MetalType} {e?.data?.MetalColorCo}
                              </div>
                            </div>
                            <div className="priority4A border_bottom4A">
                              <div className="border_right4A priority_text_4A priority_sec_4A ">
                                PRIORITY
                              </div>
                              <div className="border_right4A priority_text_4A loc4A ">
                                LOC
                              </div>
                              <div className="border_right4A priority_text_4A qc4A ">
                                Q.C.
                              </div>
                            </div>
                            <div className="sales_rep_4A border_bottom4A">
                              <div className="priority_sec_4A border_right4A">
                                <div
                                  className="sales_Rep_text_4A"
                                  style={{ paddingTop: "3px" }}
                                >
                                  SALES REP.
                                </div>
                                <div className="sales_Rep_letter_4A">
                                  {e?.data?.SalesrepCode}
                                </div>
                              </div>
                              <div className=" border_right4A  loc4A ">
                                <div
                                  className="sales_Rep_text_4A"
                                  style={{ paddingTop: "3px" }}
                                >
                                  FROSTING
                                </div>
                                <div className="sales_Rep_letter_4A">
                                  {e?.data?.MetalFrosting}
                                </div>
                              </div>
                              <div className=" border_right4A  qc4A ">
                                <div
                                  className="sales_Rep_text_4A"
                                  style={{ paddingTop: "3px" }}
                                >
                                  ENAMELING
                                </div>
                                <div className="sales_Rep_letter_4A" style={{ lineHeight: "7px" }}>
                                  {e?.data?.Enamelling}
                                </div>
                              </div>
                            </div>
                            <div className="lab_self_4A border_bottom4A">
                              <div className="priority_sec_4A border_right4A d_flex_4a" style={{ height: '20pt' }}>
                                <div className="sales_Rep_text_4A sales_Rep_text_4A_2" style={{ height: '10pt', fontSize: '9px' }}>
                                  LAB {e?.data?.MasterManagement_labname}
                                </div>
                                <div className="sales_Rep_letter_4A sales_Rep_text_4A_2 start_center_4A" style={{ height: '10pt', lineHeight: '6px' }}>
                                  {(e?.data?.PO !== "" && e?.data?.PO !== "-") && `PO ${e?.data?.PO}`}
                                </div>
                              </div>
                              <div className=" border_right4A  loc4A d_flex_4a " style={{ height: '20pt' }}>
                                <div className="sales_Rep_text_4A " style={{ height: '10pt' }}>
                                  SNAP
                                </div>
                                <div className="sales_Rep_letter_4A start_center_4A" style={{ height: '10pt', lineHeight: '6px' }}>
                                  {
                                    e?.data
                                      ?.MasterManagement_ProductImageType
                                  }
                                </div>
                              </div>
                              <div className=" border_right4A  qc4A d_flex_4a " style={{ height: '20pt' }}>
                                <div className="sales_Rep_text_4A" style={{ height: '10pt' }}>
                                  MAKETYPE
                                </div>
                                <div className="sales_Rep_letter_4A start_center_4A" style={{ height: '10pt', lineHeight: '6px' }}>
                                  {e?.data?.mastermanagement_maketypename}
                                </div>
                              </div>
                            </div>
                            <div className="priority4A border_bottom4A">
                              <div className="border_right4A priority_text_4A priority_sec_4A center_4A_d">
                                TR NO.
                              </div>
                              <div className="border_right4A priority_text_4A loc4A center_4A_d">
                                TR NO.
                              </div>
                              <div className="border_right4A priority_text_4A qc4A center_4A_d">
                                TR NO.
                              </div>
                            </div>
                            <div className="priority4A border_bottom4A">
                              <div className="border_right4A priority_text_4A priority_sec_4A center_4A_d">
                                TR WT
                              </div>
                              <div className="border_right4A priority_text_4A loc4A center_4A_d">
                                TR WT
                              </div>
                              <div className="border_right4A priority_text_4A qc4A center_4A_d">
                                TR WT
                              </div>
                            </div>
                          </div>
                          <div className="part_2_container_4A container_print4Apart_1">
                            <div className="img_sec_container_4A border-bottom border-black" style={{ height: '117px', width: '117px', boxSizing: 'border-box' }}>
                              <img
                                // src={e?.additional?.img}
                                src={
                                  e?.data?.DesignImage !== ''
                                    ? e?.data?.DesignImage
                                    : require("../../assets/img/default.jpg")
                                }
                                alt=""
                                onError={(e) => handleImageError(e)}
                                loading="eager"
                                id="img4A"
                                style={{ height: '100%', width: '100%', objectFit: 'contain' }}
                              />
                            </div>
                          </div>
                          <div className="part_3_container_4A">
                            <div className="part_3_container_4A_sec">
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center justify-content-center px-1">
                                  DEPT DEPT
                                </div>
                                <div className="issue_4A border_right4A d-flex align-items-center justify-content-center px-1">
                                  ISSUE
                                </div>
                                <div className="receive_4A border_right4A d-flex align-items-center justify-content-center px-1">
                                  RECEIVE
                                </div>
                                <div className="scrap_4A border_right4A d-flex align-items-center justify-content-center px-1">
                                  SCRAP
                                </div>
                                <div className="pcs_4A border_right4A d-flex align-items-center justify-content-center px-1">
                                  PCS
                                </div>
                                <div className="worker_4A border_right_4A d-flex align-items-center justify-content-center px-1">
                                  WORKER
                                </div>
                              </div>

                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  GRD.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  FIL.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  PPL.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  SET.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  ASM.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  FPL.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  PLT.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  ENM.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className=" dept_4A border_right4A d-flex align-items-center px-1">
                                  FG.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className="lh4A dept_4A border_right4A d-flex align-items-center">
                                  SLS. INS.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record border_bottom4A">
                                <div className="lh4A dept_4A border_right4A d-flex align-items-center">
                                  PRD. INS.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                              <div className="part_3_container_4A_record ">
                                <div className="lh4A dept_4A border_right4A d-flex align-items-center">
                                  QC. INS.
                                </div>
                                <div className="issue_4A border_right4A"></div>
                                <div className="receive_4A border_right4A"></div>
                                <div className="scrap_4A border_right4A"></div>
                                <div className="pcs_4A border_right4A"></div>
                                <div className="worker_4A border_right_4A"></div>
                              </div>
                            </div>
                            <div className="barcode_img_container_4A">
                              <BarcodeGenerator
                                data={e?.data?.serialjobno}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                    }
                  </React.Fragment>
                );
              })}
          </section>
        </>
      )}
    </>
  );
};
export default BagPrint4A;








