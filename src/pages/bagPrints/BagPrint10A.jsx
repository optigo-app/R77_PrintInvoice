import queryString from "query-string";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../../assets/css/bagprint/print10A.css";
import { GetChunkData } from "../../GlobalFunctions/GetChunkData";
import { GetData } from "../../GlobalFunctions/GetData";
import { handleImageError } from "../../GlobalFunctions/HandleImageError";
import { handlePrint } from "../../GlobalFunctions/HandlePrint";
import BarcodeGenerator from "../../components/BarcodeGenerator";
import Loader from "../../components/Loader";
import { organizeData } from './../../GlobalFunctions/OrganizeBagPrintData';
import { GetUniquejob } from "../../GlobalFunctions/GetUniqueJob";
import { checkInstruction } from "../../GlobalFunctions";

const BagPrint10A = ({ queries, headers }) => {
  const [data, setData] = useState([]);
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const resultString = GetUniquejob(queryParams?.str_srjobno);
  const chunkSize17 = 16;

  useEffect(() => {
    if (Object.keys(queryParams).length !== 0) {
      atob(queryParams.imagepath);
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
          let length = 0;
          let clr = {
            Shapename: "TOTAL",
            Sizename: "",
            ActualPcs: 0,
            ActualWeight: 0,
          };
          let dia = {
            Shapename: "TOTAL",
            Sizename: "",
            ActualPcs: 0,
            ActualWeight: 0,
          };
          let misc = {
            Shapename: "TOTAL",
            Sizename: "",
            ActualPcs: 0,
            ActualWeight: 0,
          };
          let f = {
            Shapename: "TOTAL",
            Sizename: "",
            ActualPcs: 0,
            ActualWeight: 0,
          };
          let DiamondList = [];
          let ColorStoneList = [];
          let MiscList = [];
          let FindingList = [];

          a?.rd1?.forEach((e, i) => {
            if (e?.ConcatedFullShapeQualityColorCode !== "- - - ") {
              length++;
            }
            if (e?.MasterManagement_DiamondStoneTypeid === 3) {
              DiamondList.push(e);
              dia.ActualPcs = dia.ActualPcs + e?.ActualPcs;
              dia.ActualWeight = dia.ActualWeight + e?.ActualWeight;
            } else if (e?.MasterManagement_DiamondStoneTypeid === 4) {
              ColorStoneList.push(e);
              clr.ActualPcs = clr.ActualPcs + e?.ActualPcs;
              clr.ActualWeight = clr.ActualWeight + e?.ActualWeight;
            } else if (e?.MasterManagement_DiamondStoneTypeid === 5) {
              FindingList.push(e);
              f.ActualPcs = f.ActualPcs + e?.ActualPcs;
              f.ActualWeight = f.ActualWeight + e?.ActualWeight;
            } else if (e?.MasterManagement_DiamondStoneTypeid === 7) {
              MiscList.push(e);
              misc.ActualPcs = misc.ActualPcs + e?.ActualPcs;
              misc.ActualWeight = misc.ActualWeight + e?.ActualWeight;
            }
          });
          dia.ActualPcs = +dia.ActualPcs?.toFixed(3);
          dia.ActualWeight = +dia.ActualWeight?.toFixed(3);
          clr.ActualPcs = +clr.ActualPcs?.toFixed(3);
          clr.ActualWeight = +clr.ActualWeight?.toFixed(2);
          misc.ActualPcs = +misc.ActualPcs?.toFixed(3);
          misc.ActualWeight = +misc.ActualWeight?.toFixed(3);
          f.ActualPcs = +f.ActualPcs?.toFixed(3);
          f.ActualWeight = +f.ActualWeight?.toFixed(3);
          let arr = [];
          let mainArr = arr?.concat(
            DiamondList,
            ColorStoneList,
            MiscList,
            FindingList
          );
          let imagePath = queryParams?.imagepath;
          imagePath = atob(queryParams?.imagepath);
          let img = imagePath + a?.rd?.ThumbImagePath;
          let arrofchunk = GetChunkData(chunkSize17, mainArr);
          
          responseData.push({
            data: a,
            additional: {
              length: length,
              clr: clr,
              dia: dia,
              f: f,
              img: img,
              misc: misc,
              pages: arrofchunk,
            },
          });
        })
        setData(responseData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // console.log("data", data);

  return (
    <>
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
          <div className="bag10Afinal pad_60_allPrint">
            {Array.from(
              { length: queries?.pageStart },
              (_, index) =>
                index > 0 && (
                  <div
                    key={index}
                    className="container10A"
                    style={{ border: "0px" }}
                  ></div>
                )
            )}
            {data?.length > 0 &&
              data?.map((e, i) => {
                return (
                  <React.Fragment key={i}>
                    {e?.additional?.pages?.length > 0 ? (
                      e?.additional?.pages?.map((ele, index) => {
                        return (
                          <div className="print10A" key={index}>
                            <div className="container10A">
                              <div className="bag10A">
                                <div className="flex10A">
                                  <div className="header10A">
                                    <div className="head10A">
                                      <div className="head10Ajob">
                                        <div style={{ lineHeight: "9px" }}>
                                          {e?.data?.rd?.serialjobno}
                                        </div>
                                        <div style={{ lineHeight: "9px" }}>
                                          {e?.data?.rd?.Designcode}
                                        </div>
                                        <div style={{ lineHeight: "9px" }}>
                                          {e?.data?.rd?.MetalType}{" "}
                                          {e?.data?.rd?.MetalColorCo}
                                        </div>
                                      </div>
                                      <div className="head10Ainfo">
                                        <div className="info10Amid">
                                          <p className="f10A diffColor">
                                            CUST.
                                          </p>
                                          <p className="f10A">
                                            {e?.data?.rd?.CustomerCode}
                                          </p>
                                        </div>
                                        <div className="info10Amid">
                                          <p className="f10A diffColor">
                                            ORD. DT.
                                          </p>
                                          <p className="f10A">
                                            {e?.data?.rd?.orderDatef ?? ""}
                                          </p>
                                        </div>
                                        <div className="info10Aend">
                                          <p className="f10A diffColor">
                                            DEL. DT.
                                          </p>
                                          <p className="f10A">
                                          {/* {e?.data?.rd?.promiseDatef ?? ''} */}
                                          </p>
                                        </div>
                                        <div className="info10Alast">
                                          <p
                                            className="f10A diffColor"
                                            style={{ borderRight: "0px" }}
                                          >
                                            SIZE
                                          </p>
                                          <p
                                            className="f10A"
                                            style={{ borderRight: "0px" }}
                                          >
                                            {e?.data?.rd?.Size}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="section10A">
                                    <div className="seaction10AheadA  fw-normal">
                                      <div className="seaction10AheadCode">
                                        CODE
                                      </div>
                                      <div className="seaction10AheadSize">
                                        SIZE
                                      </div>
                                      <div className="seaction10AheadPcs">
                                        PCS
                                      </div>
                                      <div
                                        className="seaction10AheadWT"
                                        style={{ width: "40px" }}
                                      >
                                        WT
                                      </div>
                                      <div className="seaction10AheadPcs">
                                        PCS
                                      </div>
                                      <div className="seaction10AheadWT">
                                        WT
                                      </div>
                                    </div>
                                    <div className="seaction10AheadA">
                                      <div
                                        className="seaction10AheadCode"
                                        style={{ fontWeight: "normal" }}
                                      >
                                        {e?.data?.rd?.MetalType}{" "}
                                        {e?.data?.rd?.MetalColorCo}
                                      </div>
                                      <div className="seaction10AheadSize"></div>
                                      <div className="seaction10AheadPcs"></div>
                                      <div
                                        className="seaction10AheadWT"
                                        style={{ width: "40px" }}
                                      ></div>
                                      <div className="seaction10AheadPcs"></div>
                                      <div className="seaction10AheadWT"></div>
                                    </div>
                                    {ele?.data?.map((a, i) => {
                                      return (
                                        <React.Fragment key={i}>
                                          {a?.MasterManagement_DiamondStoneTypeid === 5 ? (
                                            <div className="seaction10Amid" key={i} >
                                              <div className="seaction10Ahead" style={{ fontWeight: "normal" }} >
                                                <div className="seaction10AheadCode" style={{ width: "134px" }} >
                                                  { a?.LimitedShapeQualityColorCode }
                                                  { a?.QualityCode?.split( " " )?.[1] }
                                                  {a?.ColorName}
                                                </div>
                                                <div className="seaction10AheadPcs">
                                                  {a?.ActualPcs}
                                                </div>
                                                <div className="seaction10AheadWT" style={{ width: "40px" }} >
                                                  {a?.ActualWeight?.toFixed(2)}
                                                </div>
                                                <div className="seaction10AheadPcs"></div>
                                                <div className="seaction10AheadWT"></div>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="seaction10Amid" key={i} >
                                              <div className="seaction10Ahead" style={{ fontWeight: "normal" }} >
                                                {a?.Shapename === "TOTAL" ? (
                                                  <div className="seaction10AheadCode">
                                                    {a?.Shapename}
                                                  </div>
                                                ) : (
                                                  <div className="seaction10AheadCode">
                                                    {
                                                      a?.LimitedShapeQualityColorCode?.slice(0, 13)
                                                    }
                                                  </div>
                                                )}
                                                <div className="seaction10AheadSize">
                                                  {a?.Sizename}
                                                </div>
                                                <div className="seaction10AheadPcs">
                                                  {a?.ActualPcs}
                                                </div>
                                                <div className="seaction10AheadWT" style={{ width: "40px" }} >
                                                  { a?.MasterManagement_DiamondStoneTypeid === 3 ? a?.ActualWeight?.toFixed(3) : a?.ActualWeight?.toFixed(2)} 
                                                </div>
                                                <div className="seaction10AheadPcs"></div>
                                                <div className="seaction10AheadWT"></div>
                                              </div>
                                            </div>
                                          )}
                                        </React.Fragment>
                                      );
                                    })}
                                    {Array.from(
                                      { length: ele?.length  },
                                      (_, index) => (
                                        <div
                                          className="seaction10Amid"
                                          key={index}
                                        >
                                          <div
                                            className="seaction10Ahead"
                                            style={{ fontWeight: "normal" }}
                                          >
                                            <div className="seaction10AheadCode"></div>
                                            <div className="seaction10AheadSize"></div>
                                            <div className="seaction10AheadPcs"></div>
                                            <div
                                              className="seaction10AheadWT"
                                              style={{ width: "40px" }}
                                            ></div>
                                            <div className="seaction10AheadPcs"></div>
                                            <div className="seaction10AheadWT"></div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                  <div className="footer10A imp10A">
                                    <p className="footer10AIns">
                                      
                                      <span
                                        className="footer10AIns"
                                        style={{
                                          color: "red",
                                          paddingLeft: "2px",
                                          lineHeight: "9px",
                                        }}
                                      >
                                         <span className="text-black">CAST INS.</span>
                                        <span style={{color:"red"}} className="fw-bold px-1">{" " + checkInstruction(e?.data?.rd?.officeuse) + " " + (e?.data?.rd?.ProductInstruction?.length > 0 ? checkInstruction(e?.data?.rd?.ProductInstruction) : checkInstruction(e?.data?.rd?.QuoteRemark))}</span>
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <div className="aside10A">
                                  <div className="imgPart10A">
                                    <div className="img10A">
                                      <img
                                        src={
                                          e?.data?.rd?.DesignImage !== '' 
                                          ? e?.data?.rd?.DesignImage
                                            : require("../../assets/img/default.jpg")
                                        }
                                        style={{height:"6rem", width:"7rem"}}
                                        alt=""
                                        onError={(e) => handleImageError(e)}
                                        loading="eager"
                                      />
                                    </div>
                                    <div className="barcodeInfo10A">
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                        }}
                                      >
                                        <div className="diaInfo10A">
                                          <div className="diaflex10A">
                                            <p className="f10Aval">DIAMOND</p>
                                            <p className="diaVal10A">
                                              {e?.additional?.dia?.ActualPcs}/
                                              {e?.additional?.dia?.ActualWeight?.toFixed(
                                                3
                                              )}
                                            </p>{" "}
                                          </div>
                                        </div>
                                        <div className="diaInfo10A">
                                          <div className="diaflex10A">
                                            <p
                                              className="f10Aval"
                                              style={{ height: "33px" }}
                                            ></p>{" "}
                                          </div>
                                        </div>
                                        <div className="diaInfo10A">
                                          <div className="diaflex10A">
                                            <p className="f10Aval">CS</p>
                                            <p className="diaVal10A">
                                              {e?.additional?.clr?.ActualPcs}/
                                              {e?.additional?.clr?.ActualWeight?.toFixed(
                                                2
                                              )}
                                            </p>{" "}
                                          </div>
                                        </div>
                                        <div className="diaInfo10A">
                                          <div className="diaflex10A">
                                            <p
                                              className="f10Aval"
                                              style={{ height: "33px" }}
                                            ></p>{" "}
                                          </div>
                                        </div>
                                        <div className="diaInfo10A">
                                          <div className="diaflex10A">
                                            <p className="f10Aval">METAL</p>
                                            <p className="diaVal10A">
                                              {e?.data?.rd?.netwt?.toFixed(3)}
                                            </p>{" "}
                                          </div>
                                        </div>
                                        <div
                                          style={{
                                            borderRight: "1px solid #989898",
                                            height: "43px",
                                          }}
                                        ></div>
                                      </div>
                                      <div className="barcode10A">
                                        {e?.data?.rd?.length !== 0 &&
                                          e?.data?.rd !== undefined && (
                                            <>
                                              {e?.data?.rd?.serialjobno !==
                                                undefined && (
                                                <BarcodeGenerator
                                                  data={
                                                    e?.data?.rd?.serialjobno
                                                  }
                                                />
                                              )}
                                            </>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="print10A">
                        <div className="container10A">
                          <div className="bag10A">
                            <div className="flex10A">
                              <div className="header10A">
                                <div className="head10A">
                                  <div className="head10Ajob">
                                    <div>{e?.data?.rd?.serialjobno}</div>
                                    <div>{e?.data?.rd?.Designcode}</div>
                                    <div>
                                      {e?.data?.rd?.MetalType}{" "}
                                      {e?.data?.rd?.MetalColorCo}
                                    </div>
                                  </div>
                                  <div className="head10Ainfo">
                                    <div className="info10Amid">
                                      <p className="f10A diffColor">CUST.</p>
                                      <p className="f10A">
                                        {e?.data?.rd?.CustomerCode}
                                      </p>
                                    </div>
                                    <div className="info10Amid">
                                      <p className="f10A diffColor">ORD. DT.</p>
                                      <p className="f10A">
                                        {e?.data?.rd?.orderDatef ?? ""}
                                      </p>
                                    </div>
                                    <div className="info10Aend">
                                      <p className="f10A diffColor">DEL. DT.</p>
                                      <p className="f10A">
                                      {/* {e?.data?.rd?.promiseDatef ?? ''} */}
                                      </p>
                                    </div>
                                    <div className="info10Alast">
                                      <p
                                        className="f10A diffColor"
                                        style={{ borderRight: "0px" }}
                                      >
                                        SIZE
                                      </p>
                                      <p
                                        className="f10A"
                                        style={{ borderRight: "0px" }}
                                      >
                                        {e?.data?.rd?.Size}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="section10A">
                                <div className="seaction10AheadA fw-normal">
                                  <div className="seaction10AheadCode">
                                    CODE
                                  </div>
                                  <div className="seaction10AheadSize">
                                    SIZE
                                  </div>
                                  <div className="seaction10AheadPcs">PCS</div>
                                  <div className="seaction10AheadWT">WT</div>
                                  <div className="seaction10AheadPcs">PCS</div>
                                  <div className="seaction10AheadWT">WT</div>
                                </div>
                                <div className="seaction10Amid">
                                    <div className="seaction10Ahead" style={{ fontWeight: "normal" }} >
                                      <div className="seaction10AheadCode">{e?.data?.rd?.MetalType + " " + e?.data?.rd?.MetalColorCo}</div>
                                      <div className="seaction10AheadSize"></div>
                                      <div className="seaction10AheadPcs"></div>
                                      <div className="seaction10AheadWT"></div>
                                      <div className="seaction10AheadPcs"></div>
                                      <div className="seaction10AheadWT"></div>
                                    </div>
                                  </div>
                                {Array.from({ length: 16 }, (_, index) => (
                                  <div className="seaction10Amid" key={index}>
                                    <div
                                      className="seaction10Ahead"
                                      style={{ fontWeight: "normal" }}
                                    >
                                      <div className="seaction10AheadCode"></div>
                                      <div className="seaction10AheadSize"></div>
                                      <div className="seaction10AheadPcs"></div>
                                      <div className="seaction10AheadWT"></div>
                                      <div className="seaction10AheadPcs"></div>
                                      <div className="seaction10AheadWT"></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="footer10A imp10A">
                                <p className="footer10AIns">
                                  
                                  <span
                                    className="footer10AIns"
                                    style={{
                                      color: "red",
                                      paddingLeft: "2px",
                                      lineHeight: "11px",
                                    }}
                                  >
                                    <span className="text-black">CAST INS.</span>
                                    <span style={{color:"red"}} className="fw-bold">{" " + checkInstruction(e?.data?.rd?.officeuse) + " " + (e?.data?.rd?.ProductInstruction?.length > 0 ? checkInstruction(e?.data?.rd?.ProductInstruction) : checkInstruction(e?.data?.rd?.QuoteRemark))}</span>
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="aside10A">
                              <div className="imgPart10A">
                                <div className="img10A">
                                  <img
                                    src={
                                      e?.data?.rd?.DesignImage !== '' 
                                          ? e?.data?.rd?.DesignImage
                                        : require("../../assets/img/default.jpg")
                                    }
                                    style={{height:"6rem", width:"7rem"}}
                                    alt=""
                                    onError={(e) => handleImageError(e)}
                                    loading="eager"
                                  />
                                </div>
                                <div className="barcodeInfo10A">
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    <div className="diaInfo10A">
                                      <div className="diaflex10A">
                                        <p className="f10Aval">DIAMOND</p>
                                        <p className="diaVal10A">
                                          {e?.additional?.dia?.ActualPcs}/
                                          {e?.additional?.dia?.ActualWeight?.toFixed(
                                            2
                                          )}
                                        </p>{" "}
                                      </div>
                                    </div>
                                    <div className="diaInfo10A">
                                      <div className="diaflex10A">
                                        <p
                                          className="f10Aval"
                                          style={{ height: "33px" }}
                                        ></p>{" "}
                                      </div>
                                    </div>
                                    <div className="diaInfo10A">
                                      <div className="diaflex10A">
                                        <p className="f10Aval">CS</p>
                                        <p className="diaVal10A">
                                          {e?.additional?.clr?.ActualPcs}/
                                          {e?.additional?.clr?.ActualWeight?.toFixed(
                                            2
                                          )}
                                        </p>{" "}
                                      </div>
                                    </div>
                                    <div className="diaInfo10A">
                                      <div className="diaflex10A">
                                        <p
                                          className="f10Aval"
                                          style={{ height: "33px" }}
                                        ></p>{" "}
                                      </div>
                                    </div>
                                    <div className="diaInfo10A">
                                      <div className="diaflex10A">
                                        <p className="f10Aval">METAL</p>
                                        <p className="diaVal10A">
                                          {e?.additional?.misc?.ActualPcs}/
                                          {e?.additional?.misc?.ActualWeight?.toFixed(
                                            2
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    <div
                                      style={{
                                        borderRight: "1px solid #989898",
                                        height: "39px",
                                      }}
                                    ></div>
                                  </div>
                                  <div className="barcode10A">
                                    {e?.data?.rd?.length !== 0 &&
                                      e?.data?.rd !== undefined && (
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
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="print10A">
                      <div className="container10A">
                        <div className="header10AD">
                          <div className="sectionHead10A">
                            <div className="head10AjobD">
                              <div>{e?.data?.rd?.serialjobno}</div>
                              <div>{e?.data?.rd?.Designcode}</div>
                              <div>
                                {e?.data?.rd?.MetalType}{" "}
                                {e?.data?.rd?.MetalColorCo}
                              </div>
                            </div>
                            <div className="mat10AD">
                              <div className="border10A center_10a" style={{ color: "#c7c7c7", }} >
                                PRIORITY
                              </div>
                              <div className="border10A center_10a" style={{ color: "#c7c7c7", }} >
                                LOC.
                              </div>
                              <div className="border10A center_10a" style={{ borderRight: "0px", color: "#c7c7c7", }} >
                                Q.C.
                              </div>
                            </div>
                            <div className="mat10ADE">
                              <div className="border10A h-100">
                                <p className="f10ADuplicate  pt-0">SALES REP.</p>{" "}
                                <p className="f10ADuplicate">
                                  {e?.data?.rd?.SalesrepCode}
                                </p>
                              </div>
                              <div className="border10A h-100">
                                <p className="f10ADuplicate  pt-0">FROSTING</p>{" "}
                                <p className="f10ADuplicate">
                                  {e?.data?.rd?.MetalFrosting}
                                </p>
                              </div>
                              <div
                                className="border10A h-100"
                                style={{ borderRight: "0px" }}
                              >
                                <p className="f10ADuplicate pt-0">ENAMELING</p>
                                <p className="f10ADuplicate">
                                  {e?.data?.rd?.Enamelling}
                                </p>
                              </div>
                            </div>
                            <div className="mat10ADE">
                              <div className="border10A h-100">
                                <p className="f10ADuplicate pt-0">LAB</p>{" "}
                                <p className="f10ADuplicate">
                                  {e?.data?.rd?.MasterManagement_labname}
                                </p>
                              </div>
                              <div className="border10A h-100">
                                <p className="f10ADuplicate  pt-0">SNAP</p>{" "}
                                <p className="f10ADuplicate  pt-0">
                                  {
                                    e?.data?.rd
                                      ?.MasterManagement_ProductImageType
                                  }
                                </p>
                              </div>
                              <div
                                className="border10A h-100"
                                style={{ borderRight: "0px" }}
                              >
                                <p className="f10ADuplicate  pt-0">MAKETYPE</p>
                                <p className="f10ADuplicate  pt-0">
                                  {
                                    e?.data?.rd
                                      ?.mastermanagement_maketypename
                                  }
                                </p>{" "}
                              </div>
                            </div>
                            <div className="mat10AD">
                              <div
                                className="border10A center_10a"
                                style={{
                                  color: "#c7c7c7",
                                }}
                              >
                                TR NO.
                              </div>
                              <div
                                className="border10A center_10a"
                                style={{
                                  color: "#c7c7c7",
                                }}
                              >
                                TR NO.
                              </div>
                              <div
                                className="border10A center_10a"
                                style={{
                                  borderRight: "0px",
                                  color: "#c7c7c7",
                                }}
                              >
                                TR NO.
                              </div>
                            </div>
                            <div
                              className="mat10AD"
                              style={{ borderBottom: "0px" }}
                            >
                              <div
                                className="border10A center_10a"
                                style={{
                                  color: "#c7c7c7",
                                }}
                              >
                                TR WT.
                              </div>
                              <div
                                className="border10A center_10a"
                                style={{
                                  color: "#c7c7c7",
                                }}
                              >
                                TR WT.
                              </div>
                              <div
                                className="border10A center_10a"
                                style={{
                                  borderRight: "0px",
                                  color: "#c7c7c7",
                                }}
                              >
                                TR WT.
                              </div>
                            </div>
                          </div>
                          <div className="img10AD">
                            <img
                              src={
                                e?.data?.rd?.DesignImage !== '' 
                                          ? e?.data?.rd?.DesignImage
                                  : require("../../assets/img/default.jpg")
                              }
                              style={{height:"7.5rem", width:"7rem"}}
                              alt=""
                              onError={(e) => handleImageError(e)}
                              loading="eager"
                            />
                          </div>
                        </div>
                        <div className="enteryBarcode10AD">
                          <div className="enteryBarcode10ADyn">
                            <div className="entry10AHead" style={{ fontWeight: "normal", width: "290px" }} >
                              <div className="rmcode10a" style={{ width: "47px" }} >
                                DEPT{" "}
                              </div>
                              <div className="rmcode10a" style={{ width: "47px" }} >
                                ISSUE
                              </div>
                              <div className="rmcode10a" style={{ width: "52px" }} >
                                RECEIVE
                              </div>
                              <div className="rmcode10a" style={{ width: "52px" }} >
                                SCRAP
                              </div>
                              <div className="rmcode10a" style={{ width: "37px" }} >
                                PCS
                              </div>
                              <div className="rmcode10a" style={{ borderRight: "0px", width: "56px" }} >
                                WORKER
                              </div>
                            </div>
                            <div className="entryheader10A">
                              <div className="entry10AHeadD" style={{ fontWeight: "normal", height:'142px' }} >
                                <div className="rmcode10aD" style={{ width: "52px", display: "flex", justifyContent: "flex-start", paddingLeft: "7px", }} >
                                  MLT.
                                </div>
                                <div className="rmcode10aD" style={{ width: "52px", display: "flex", justifyContent: "flex-start", paddingLeft: "7px", }} >
                                  TP.
                                </div>
                                <div className="rmcode10aD" style={{ width: "52px", display: "flex", justifyContent: "flex-start", paddingLeft: "7px", }} >
                                  FLG.
                                </div>
                                <div className="rmcode10aD" style={{ width: "52px", display: "flex", justifyContent: "flex-start", paddingLeft: "7px", }} >
                                  CNC.
                                </div>
                                <div className="rmcode10aD" style={{ width: "52px", display: "flex", justifyContent: "flex-start", paddingLeft: "7px", }} >
                                  FIL.
                                </div>
                                <div className="rmcode10aD" style={{ width: "52px", display: "flex", justifyContent: "flex-start", paddingLeft: "7px", }} >
                                  HM.
                                </div>
                                <div className="rmcode10aD" style={{ width: "52px", display: "flex", justifyContent: "flex-start", paddingLeft: "7px", }} >
                                  TNG.
                                </div>
                                <div className="rmcode10aD" style={{ width: "52px", display: "flex", justifyContent: "flex-start", paddingLeft: "7px", }} >
                                  PLH.
                                </div>
                                {/* <div
                                  className="rmcode10aD"
                                  style={{
                                    borderBottom: "1px solid #989898",
                                    width: "52px",
                                    display: "flex",
                                    justifyContent: "flex-start",
                                    paddingLeft: "3px",
                                  }}
                                >
                                  F.G.
                                </div> */}
                              </div>
                              {
                                <div>
                                  {Array.from({ length: 8 }, (_, index) => (
                                    <div
                                      className="entry10AHeadEntry"
                                      key={index}
                                      style={{ fontWeight: "normal", height:'17.8px' }}
                                    >
                                      <div
                                        className="rmcode10aDE"
                                        style={{ width: "52px" }}
                                      ></div>
                                      <div
                                        className="rmcode10aDE"
                                        style={{ width: "51px" }}
                                      ></div>
                                      <div
                                        className="rmcode10aDE"
                                        style={{ width: "51px" }}
                                      ></div>
                                      <div
                                        className="rmcode10aDE"
                                        style={{ width: "37px" }}
                                      ></div>
                                      <div
                                        className="rmcode10aDE"
                                        style={{
                                          width: "56px",
                                          borderRight: "0px",
                                        }}
                                      ></div>
                                    </div>
                                  ))}
                                </div>
                              }
                            </div>
                            <div>
                              <div className="ins10Afooter pt-0">
                                <p style={{ fontSize: "12px",width:'46px', borderRight:'1px solid #989898' }}>SLS. INS.{}</p>
                              </div>
                              <div className="ins10Afooter pt-0">
                                <p style={{ fontSize: "12px", width:'46px' , borderRight:'1px solid #989898'}}>PRD. INS.{}</p>
                              </div>
                              <div className="ins10Afooter pt-0" style={{ borderBottom: "0px" }} >
                                <p style={{ fontSize: "12px", width:'46px' , borderRight:'1px solid #989898' }}>QC. INS.{}</p>
                              </div>
                            </div>
                          </div>
                          <div className="barcode10AD">
                            {e?.data?.rd?.length !== 0 &&
                              e?.data?.rd !== undefined && (
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
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
          </div>
        </>
      )}
    </>
  );
};

export default BagPrint10A;
