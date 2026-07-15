import queryString from "query-string";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../../assets/css/bagprint/print10J.css";
import { GetChunkData } from "../../GlobalFunctions/GetChunkData";
import { GetData } from "../../GlobalFunctions/GetData";
import { handleImageError } from "../../GlobalFunctions/HandleImageError";
import { handlePrint } from "../../GlobalFunctions/HandlePrint";
import BarcodeGenerator from "../../components/BarcodeGenerator";
import Loader from "../../components/Loader";
import { organizeData } from '../../GlobalFunctions/OrganizeBagPrintData';
import { GetUniquejob } from "../../GlobalFunctions/GetUniqueJob";

const BagPrint10J = ({ queries, headers }) => {
  const [data, setData] = useState([]);
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const resultString = GetUniquejob(queryParams?.str_srjobno);
  const chunkSize17 = 21;

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
        // console.log("allDatas", allDatas);
        let datas = organizeData(allDatas?.rd, allDatas?.rd1);
        // console.log("datas", datas);
        
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
          // let f = {
          //   Shapename: "TOTAL",
          //   Sizename: "",
          //   ActualPcs: 0,
          //   ActualWeight: 0,
          // };
          let DiamondList = [];
          let ColorStoneList = [];
          let MiscList = [];
          // let FindingList = [];

          a?.rd1?.forEach((e) => {
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
            }
            // else if (e?.MasterManagement_DiamondStoneTypeid === 5) {
            //   FindingList.push(e);
            //   f.ActualPcs = f.ActualPcs + e?.ActualPcs;
            //   f.ActualWeight = f.ActualWeight + e?.ActualWeight;
            // } 
            else if (e?.MasterManagement_DiamondStoneTypeid === 7) {
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
          // f.ActualPcs = +f.ActualPcs?.toFixed(3);
          // f.ActualWeight = +f.ActualWeight?.toFixed(3);
          let arr = [];
          let mainArr = arr?.concat(
            DiamondList,
            ColorStoneList,
            MiscList,
            // FindingList
          );
          let imagePath = queryParams?.imagepath;
          imagePath = atob(queryParams?.imagepath);
          let img = imagePath + a?.rd?.ThumbImagePath;
          // console.log("a?.data?.rd?.serialjobno", a?.rd?.serialjobno);
          let SerialJobno = a?.rd?.serialjobno;
          // console.log("a?.?.serialjobno", a?.rd?.serialjobno);
          // console.log("SerialJobno", SerialJobno);
          let arrofchunk = GetChunkData(chunkSize17, mainArr);
          // console.log("arrofchunk", arrofchunk);
          arrofchunk = arrofchunk.slice(0, 1);


          responseData.push({
            data: a,
            additional: {
              length: length,
              clr: clr,
              dia: dia,
              SerialJobno: SerialJobno,
              // f: f,
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
          <div className="bag10Afinal">
            {data?.map((e, i) => {
                return (
                  <React.Fragment key={i}>
                    {(e?.additional?.pages?.length > 0 ? e?.additional?.pages : [{}]).map((ele, index) => {
                      
                      
                      return (
                        <>
                          {/* Left Side */}
                          <div key={index} className="container10A spBrderAl d-flex flex-column">
                            {/* Header */}
                            <div className="w-100 d-flex">
                              <div className="Wdth0 FntSize0">
                                <div className="d-flex justify-content-between BrderBtomDRK BrderRigtDRK">
                                  <div className="SpacLft0"><span className="fw-bold">Bag No :</span> {e?.data?.rd?.serialjobno}</div>
                                  <div className="SpacLft1"><span className="fw-bold">D Code :</span> {e?.data?.rd?.Designcode}</div>
                                </div>
                                <div className="d-flex justify-content-between BrderBtomDRK BrderRigtDRK">
                                  <div className="Wdth2 BrderRigtDRK SpacLft3">
                                    <div><span className="fw-bold">ORD. NO :</span> {e?.data?.rd?.OrderNo}</div>
                                    <div><span className="fw-bold">ORD. DT. :</span> {e?.data?.rd?.orderDatef}</div>
                                    <div><span className="fw-bold">SIZE :</span> {e?.data?.rd?.Size}</div>
                                    <div className="fw-bold">CAST. DT. :</div>
                                    <div className="fw-bold">CAST. WT. :</div>
                                  </div>
                                  <div className="Wdth3 SpacLft3">
                                    <div className=""><span className="fw-bold">MET. KT :</span>&nbsp; {e?.data?.rd?.MetalType?.split(' ')[1] || 'N/A'}</div> {/* Taking MetalKT Value From This */}
                                    <div className="fw-bold">GR. WT :</div>
                                    <div className="fw-bold">NET WT :</div>
                                    <div className="fw-bold">DIA. WT :</div>
                                    <div className="fw-bold">CS. WT :</div>
                                  </div>
                                </div>
                              </div>
                              <div className="Wdth1 BrderBtomDRK d-flex justify-content-center align-items-center">
                                <img
                                  src={
                                    e?.data?.rd?.DesignImage !== ''
                                      ? e?.data?.rd?.DesignImage
                                      : require("../../assets/img/default.jpg")
                                  }
                                  className="SpacLft2 imgManages"
                                  alt=""
                                  onError={(e) => handleImageError(e)}
                                  loading="eager"
                                />
                              </div>
                            </div>

                            {/* Instuction */}
                            <div className="w-100 Higt0 BrderBtomDRK FntSize0 SpacLft0 SpacLft1">
                              <div className="d-flex FntSize2">
                                <div className="fw-bold spbrWord">INSTRUCTION :&nbsp;{e?.data?.rd?.officeuse?.slice(0, 174)}</div>
                              </div>
                            </div>

                            <div className="w-100 d-flex">
                              {/* Static Arae */}
                              <div className="Wdth4 fw-bold FntSize1">
                                <div className="w-100 d-flex BrderBtomDRK">
                                  <div className="StcMangs BrderRigtDRK TrckTxtStart">Process</div>
                                  <div className="StcMangs BrderRigt">ISSUE DT.</div>
                                  <div className="StcMangs BrderRigt">OUT DT.</div>
                                  <div className="StcMangs BrderRigt">NAME</div>
                                  <div className="StcMangs BrderRigt">IN WT.</div>
                                  <div className="StcMangs BrderRigt">OUT WT.</div>
                                  <div className="StcMangs BrderRigtDRK">LOSS</div>
                                </div>

                                <div className="w-100 d-flex BrderBtom">
                                  <div className="StcMangs BrderRigtDRK TrckTxtStart">FILLING</div>
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className='StcMangs BrderRigt'></div>
                                  ))}
                                  <div className='StcMangs BrderRigtDRK'></div>
                                </div>

                                <div className="w-100 d-flex BrderBtom">
                                  <div className="StcMangs BrderRigtDRK TrckTxtStart">P.POLISH</div>
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className='StcMangs BrderRigt'></div>
                                  ))}
                                  <div className='StcMangs BrderRigtDRK'></div>
                                </div>

                                <div className="w-100 d-flex BrderBtom">
                                  <div className="StcMangs BrderRigtDRK TrckTxtStart">SETTING</div>
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className='StcMangs BrderRigt'></div>
                                  ))}
                                  <div className='StcMangs BrderRigtDRK'></div>
                                </div>

                                <div className="w-100 d-flex BrderBtom">
                                  <div className="StcMangs BrderRigtDRK TrckTxtStart">R.POLISH</div>
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className='StcMangs BrderRigt'></div>
                                  ))}
                                  <div className='StcMangs BrderRigtDRK'></div>
                                </div>

                                <div className="w-100 d-flex BrderBtom">
                                  <div className="StcMangs BrderRigtDRK TrckTxtStart">R.FILLING</div>
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className='StcMangs BrderRigt'></div>
                                  ))}
                                  <div className='StcMangs BrderRigtDRK'></div>
                                </div>

                                <div className="w-100 d-flex">
                                  <div className="StcMangs BrderRigtDRK TrckTxtStart">F.POLISH</div>
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className='StcMangs BrderRigt'></div>
                                  ))}
                                  <div className='StcMangs BrderRigtDRK'></div>
                                </div>

                                <div className="w-100 d-flex BrderBtomDRK BrderTopDRK">
                                  <div className="StcMangs BrderRigtDRK TrckTxtStart">ITEM</div>
                                  <div className='StcMangs1 BrderRigtDRK'>ISSUE FINDING</div>
                                  <div className='StcMangs1 BrderRigtDRK'>RECEIVE DUST SCRAP</div>
                                </div>

                                <div className="w-100 d-flex">
                                  <div className="StcMangs BrderRigtDRK TrckTxtEnd">CASTING</div>
                                  <div className='StcMangs BrderRigt BrderBtomDRK'>FILLING</div>
                                  <div className='StcMangs BrderRigt BrderBtomDRK'>SETTING</div>
                                  <div className='StcMangs BrderRigtDRK BrderBtomDRK'>POLISH</div>
                                  <div className='StcMangs BrderRigt BrderBtomDRK'>FILLING</div>
                                  <div className='StcMangs BrderRigt BrderBtomDRK'>SETTING</div>
                                  <div className='StcMangs BrderRigtDRK BrderBtomDRK'>POLISH</div>
                                </div>

                                <div className="w-100 d-flex">
                                  <div className="StcMangs BrderRigtDRK BrderBtom"></div>
                                  {Array.from({ length: 2 }).map((_, index) => (
                                    <div key={index} className='StcMangs BrderRigt BrderBtom'></div>
                                  ))}
                                  <div className='StcMangs BrderRigtDRK BrderBtom'></div>
                                  {Array.from({ length: 2 }).map((_, index) => (
                                    <div key={index} className='StcMangs BrderRigt BrderBtom'></div>
                                  ))}
                                  <div className='StcMangs BrderRigtDRK BrderBtom'></div>
                                </div>

                                <div className="w-100 d-flex BrderBtom">
                                  <div className="StcMangs BrderRigtDRK TrckTxtStart">METAL</div>
                                  {Array.from({ length: 2 }).map((_, index) => (
                                    <div key={index} className='StcMangs BrderRigt'></div>
                                  ))}
                                  <div className='StcMangs BrderRigtDRK'></div>
                                  {Array.from({ length: 2 }).map((_, index) => (
                                    <div key={index} className='StcMangs BrderRigt'></div>
                                  ))}
                                  <div className='StcMangs BrderRigtDRK'></div>
                                </div>

                                <div className="w-100 d-flex BrderBtom">
                                  <div className="StcMangs BrderRigtDRK TrckTxtStart">WIRE</div>
                                  {Array.from({ length: 2 }).map((_, index) => (
                                    <div key={index} className='StcMangs BrderRigt'></div>
                                  ))}
                                  <div className='StcMangs BrderRigtDRK'></div>
                                  {Array.from({ length: 2 }).map((_, index) => (
                                    <div key={index} className='StcMangs BrderRigt'></div>
                                  ))}
                                  <div className='StcMangs BrderRigtDRK'></div>
                                </div>

                                <div className="w-100 d-flex BrderBtom">
                                  <div className="StcMangs BrderRigtDRK TrckTxtStart">SOLDER</div>
                                  {Array.from({ length: 2 }).map((_, index) => (
                                    <div key={index} className='StcMangs BrderRigt'></div>
                                  ))}
                                  <div className='StcMangs BrderRigtDRK'></div>
                                  {Array.from({ length: 2 }).map((_, index) => (
                                    <div key={index} className='StcMangs BrderRigt'></div>
                                  ))}
                                  <div className='StcMangs BrderRigtDRK'></div>
                                </div>

                                <div className="w-100 d-flex">
                                  <div className="StcMangs BrderRigtDRK TrckTxtStart">DUST</div>
                                  {Array.from({ length: 2 }).map((_, index) => (
                                    <div key={index} className='StcMangs BrderRigt'></div>
                                  ))}
                                  <div className='StcMangs BrderRigtDRK'></div>
                                  {Array.from({ length: 2 }).map((_, index) => (
                                    <div key={index} className='StcMangs BrderRigt'></div>
                                  ))}
                                  <div className='StcMangs BrderRigtDRK'></div>
                                </div>
                              </div>

                              {/* Barcode */}
                              <div className="Wdth5">
                                <div className="barcode10A">
                                  {e?.data?.rd?.serialjobno !== undefined && (
                                    <BarcodeGenerator data={e?.data?.rd?.serialjobno} />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* RFID NO */}
                            <div className="w-100 fw-bold FntSize1 BrderTopDRK">
                              <div className='StcMangs TrckTxtStart' style={{ minHeight: "20.60px", maxHeight: "20.60px"   }}>RFID NO.</div>
                            </div>
                          </div>

                          {/* Right Side */}
                          <div className="container10A spBrderAl">
                            {/* Header*/}
                            <div className="w-100 d-flex FntSize1 BrderBtomDRK">
                              <div className="w-50 SpacLft0"><span className="fw-bold">Bag No :</span> {e?.data?.rd?.serialjobno}</div>
                              <div className="w-50 SpacLft0"><span className="fw-bold">D Code :</span> {e?.data?.rd?.Designcode}</div>
                            </div>

                            <div className="w-100 d-flex FntSize1 BrderBtomDRK">
                              <div className="w-50 SpacLft0 BrderRigtDRK"><span className="fw-bold">ORD. No :</span> {e?.data?.rd?.OrderNo}</div>
                              <div className="w-50 SpacLft0"><span className="fw-bold">MET KT :</span>  {e?.data?.rd?.MetalType?.split(' ')[1] || 'N/A'}</div> {/* Taking MetalKT Value From This */}
                            </div>

                            {/* Instuction */}
                            <div className="w-100 Higt0 BrderBtomDRK FntSize0 SpacLft0 SpacLft1">
                              <div className="d-flex FntSize2">
                                <div className="fw-bold spbrWord">INSTRUCTION :&nbsp;{e?.data?.rd?.QuoteRemark?.slice(0, 174)}</div>
                              </div>
                            </div>

                            <div className="w-100 d-flex FntSize1">
                              <div className="Wdth4 d-flex flex-column">
                                {/* Table Main Header */}
                                <div className="w-100 d-flex BrderBtomDRK">
                                  <div className="Wdth6 fw-bold TrckTxtCntr BrderRigtDRK">REQUIRED RM</div>
                                  <div className="Wdth7 fw-bold TrckTxtCntr BrderRigtDRK">RETURN RM</div>
                                  <div className="Wdth7 fw-bold TrckTxtCntr BrderRigtDRK">USED RM</div>
                                </div>

                                {/* Table Sub Header */}
                                <div className="w-100 d-flex BrderBtomDRK">
                                  <div className="Wdth6 fw-bold d-flex BrderRigtDRK">
                                    <div className="Wdth8 BrderRigt TrckTxtCntr">RM CODE</div>
                                    <div className="Wdth9 BrderRigt TrckTxtCntr">SIZE</div>
                                    <div className="Wdth10 BrderRigt TrckTxtCntr">QTY</div>
                                    <div className="Wdth11 TrckTxtCntr">WT.</div>
                                  </div>
                                  <div className="Wdth7 fw-bold TrckTxtCntr BrderRigtDRK">
                                    <div className="w-50 BrderRigt TrckTxtCntr">QTY</div>
                                    <div className="w-50 TrckTxtCntr">WT.</div>
                                  </div>
                                  <div className="Wdth7 fw-bold TrckTxtCntr BrderRigtDRK">
                                    <div className="w-50 BrderRigt TrckTxtCntr">QTY</div>
                                    <div className="w-50 TrckTxtCntr">WT.</div>
                                  </div>
                                </div>

                                {/* Table Data */}
                                {ele?.data?.map((a, i) => {
                                  const TheDataLen = e?.additional?.pages?.[0]?.data?.length ?? 0;
                                  

                                  
                                  // console.log("TCL:e?.additional?.pages ",e?.additional?.pages )
                                  
                                  // console.log("TheDataLen", TheDataLen);
                                  const TheDif = TheDataLen <= 21 ? 21 - TheDataLen : 0;
                                  // console.log("TheDif", TheDif);
                                  const TheDifSh = TheDif === 0 ? 21 : TheDif;
                                  // console.log("TheDifSh", TheDifSh);
                                  const isLastRow = i === TheDifSh - 1;
                                  // console.log("isLastRow", isLastRow);
                                  return (
                                    <div key={i} className={`w-100 d-flex ${isLastRow ? '' : 'BrderBtom'}`}>
                                      <div className="Wdth6 d-flex BrderRigtDRK">
                                        <div className="Wdth8 StcMangs2 BrderRigt TrckTxtCntr TxtStart spbrWord">
                                          {a?.Shapecode} {a?.ColorCode}
                                        </div>
                                        <div className="Wdth9 StcMangs2 BrderRigt TrckTxtCntr TxtStart spbrWord">
                                          {a?.Sizename}
                                        </div>
                                        <div className="Wdth10 StcMangs2 BrderRigt TrckTxtCntr TxtEnd">
                                          {a?.ActualPcs}
                                        </div>
                                        <div className="Wdth11 StcMangs2 TrckTxtCntr"></div>
                                      </div>
                                      <div className="Wdth7 fw-bold TrckTxtCntr BrderRigtDRK">
                                        <div className="w-50 StcMangs2 BrderRigt TrckTxtCntr"></div>
                                        <div className="w-50 StcMangs2 TrckTxtCntr"></div>
                                      </div>
                                      <div className="Wdth7 fw-bold TrckTxtCntr BrderRigtDRK">
                                        <div className="w-50 StcMangs2 BrderRigt TrckTxtCntr"></div>
                                        <div className="w-50 StcMangs2 TrckTxtCntr"></div>
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* Empty Rows */}
                                {Array.from({ length: 21 - (e?.additional?.pages?.[0]?.data?.length || 0) }, (_, index) => {
                                  const TheDataLen = e?.additional?.pages?.[0]?.data?.length ?? 0;
                                  // console.log("TheDataLen niche", TheDataLen);
                                  const TheDif = TheDataLen <= 21 ? 21 - TheDataLen : 0;
                                  // console.log("TheDif", TheDif);
                                  const isLastRow = index === TheDif - 1;
                                  // console.log("isLastRow", isLastRow);
                                  return (
                                    <div key={index} className={`w-100 d-flex ${isLastRow ? '' : 'BrderBtom'}`}>
                                      <div className="Wdth6 d-flex BrderRigtDRK">
                                        <div className="Wdth8 StcMangs2 BrderRigt TrckTxtCntr"></div>
                                        <div className="Wdth9 StcMangs2 BrderRigt TrckTxtCntr"></div>
                                        <div className="Wdth10 StcMangs2 BrderRigt TrckTxtCntr"></div>
                                        <div className="Wdth11 StcMangs2 TrckTxtCntr"></div>
                                      </div>
                                      <div className="Wdth7 fw-bold TrckTxtCntr BrderRigtDRK">
                                        <div className="w-50 StcMangs2 BrderRigt TrckTxtCntr"></div>
                                        <div className="w-50 StcMangs2 TrckTxtCntr"></div>
                                      </div>
                                      <div className="Wdth7 fw-bold TrckTxtCntr BrderRigtDRK">
                                        <div className="w-50 StcMangs2 BrderRigt TrckTxtCntr"></div>
                                        <div className="w-50 StcMangs2 TrckTxtCntr"></div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>


                              {/* Barcode */}
                              <div className="Wdth5">
                                <div className="barcode10AR">
                                  {e?.data?.rd?.serialjobno !== undefined && (
                                    <BarcodeGenerator data={e?.data?.rd?.serialjobno} />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* RFID NO */}
                            <div className="w-100 fw-bold FntSize1 BrderTopDRK">
                              <div className='StcMangs TrckTxtStart' style={{ minHeight: "20.60px", maxHeight: "20.60px" }}>RFID NO.</div>
                            </div>
                          </div>
                        </>

                      );
                    })}
                  </React.Fragment>
                );
              })}
          </div>
        </>
      )}
    </>
  );
};

export default BagPrint10J;
