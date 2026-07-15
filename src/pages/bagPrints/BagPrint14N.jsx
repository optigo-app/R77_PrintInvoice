import queryString from 'query-string';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import "../../assets/css/bagprint/print14.css";
import "../../assets/css/bagprint/print14N.css";
import { GetData } from '../../GlobalFunctions/GetData';
import { handleImageError } from '../../GlobalFunctions/HandleImageError';
import { handlePrint } from '../../GlobalFunctions/HandlePrint';
import BarcodeGenerator from '../../components/BarcodeGenerator';
import BarcodeGenratorStcok from "../../components/BarcodeGenratorStcok";
import Loader from '../../components/Loader';
import { organizeData } from '../../GlobalFunctions/OrganizeBagPrintData';
import { GetChunkData } from './../../GlobalFunctions/GetChunkData';
import { GetUniquejob } from '../../GlobalFunctions/GetUniqueJob';
import { checkInstruction } from '../../GlobalFunctions';
import QRCodeGenerator from "../../components/QRCodeGenerator";

function BagPrint14N({ queries, headers }) {
  const [data, setData] = useState([]);
  const location = useLocation();
  const queryParams = queryString.parse(location?.search);
  const resultString = GetUniquejob(queryParams?.str_srjobno);
  const chunkSize17 = 11;
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
        console.log(datas);
        // eslint-disable-next-line array-callback-return
        datas?.map((a) => {
          let length = 0;
          let total = {
            ActualPcs: 0,
            ActualWeight: 0,
          };
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

          // eslint-disable-next-line array-callback-return
          a?.rd1?.map((e, i) => {

            if (e?.MasterManagement_DiamondStoneTypeid !== 0) {
              total.ActualPcs = total?.ActualPcs + e?.ActualPcs;
              total.ActualWeight = total?.ActualWeight + e?.ActualWeight;
            }
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

          dia.ActualPcs = +(dia.ActualPcs?.toFixed(3));
          dia.ActualWeight = +(dia.ActualWeight?.toFixed(3));
          clr.ActualPcs = +(clr.ActualPcs?.toFixed(3));
          clr.ActualWeight = +(clr.ActualWeight?.toFixed(3));
          misc.ActualPcs = +(misc.ActualPcs?.toFixed(3));
          misc.ActualWeight = +(misc.ActualWeight?.toFixed(3));
          f.ActualPcs = +(f.ActualPcs?.toFixed(3));
          f.ActualWeight = +(f.ActualWeight?.toFixed(3));

          let arr = [];
          let mainArr = arr?.concat(DiamondList, ColorStoneList, MiscList, FindingList);
          let imagePath = queryParams?.imagepath;
          imagePath = atob(queryParams?.imagepath);
          let img = imagePath + a?.rd?.ThumbImagePath;
          let arrofchunk = GetChunkData(chunkSize17, mainArr);
          responseData.push({ data: a, additional: { length: length, clr: clr, dia: dia, f: f, img: img, misc: misc, total: total, pages: arrofchunk } });
        })
        setData(responseData);
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
        // window.print();
      }, 5000);
    }
  }, [data?.length]);

  const processList = [
    "CAD/CAM",
    "DIE/WAX",
    "CASTING",
    "FILING",
    "SOLDERING",
    "PRE-POLISH",
    "SETTING",
    "CUTTING",
    "FINISHING",
    "BUFFING",
    "QA",
    "LE/HALLMARKING"
  ];
  return (
    <>
      {
        data?.length === 0 ? <Loader /> : <><div className="print_btn"><button className="btn_white blue print_btn" onClick={(e) => handlePrint(e)}>
          Print
        </button></div>
          <div className='bag14Aflex pad_60_allPrint '>
            <div className='straight_print'>
              {Array.from({ length: queries?.pageStart }, (_, index) => (
                index > 0 && <div key={index} className="container_14" style={{ border: "0px" }}></div>
              ))}
              {
                data?.length > 0 && data?.map((e, i) => {

                  console.log("TCL: functionBagPrint14N ->eeeeeee ", e)
                  return (
                    <React.Fragment key={i}>
                      {
                        // e?.additional?.pages?.length > 0 ?
                          // e?.additional?.pages?.map((a, index) => {
                            // return (
                              <div className='container_14' key={i}>
                                <div className='firstpart'>
                                  <div style={{ display: "flex" }}>
                                    <div className='firstpart_header'>
                                      <div className='firstpart_one'>
                                        <div className='firstpart_one_1'><div className='firstpart_one_chunk _color'> Order Date: </div><div className='firstpart_one_chunk_val workbreak'>{`${e?.data?.rd?.orderDatef}`}</div></div>
                                        <div className='firstpart_one_1'><div className='firstpart_one_chunk _color'>Party:</div><div className='firstpart_one_chunk_val workbreak'> {e?.data?.rd?.CustomerCode}</div></div>
                                        <div className='firstpart_one_1'><div className='firstpart_one_chunk _color'>Design:</div><div className='firstpart_one_chunk_val workbreak'>{`${e?.data?.rd?.Designcode}`}</div></div>

                                        <div className='firstpart_one_1'><div className='firstpart_one_chunk ' style={{ borderRight: "none", }}>Size:  {e?.data?.rd?.Size}</div><div className='firstpart_one_chunk_val workbreak' style={{ borderRight: "none",justifyContent:"flex-end",paddingRight:"7px" }}> Sales Rep:</div></div>
                                        <div className='firstpart_one_1'><div className='firstpart_one_chunk _color'>Net Wt.:</div><div className='firstpart_one_chunk_val workbreak'> {e?.data?.rd?.netwt}</div></div>
                                        <div className='firstpart_one_1'><div className='firstpart_one_chunk _color'>Dia. Pcs:</div><div className='firstpart_one_chunk_val workbreak'>{e?.additional?.dia?.ActualPcs} </div></div>
                                        <div className='firstpart_one_1'><div className='firstpart_one_chunk _color'>Clr Pcs:</div><div className='firstpart_one_chunk_val workbreak'>   {e?.additional?.clr?.ActualPcs}</div></div>
                                        <div className='firstpart_one_1'><div className='firstpart_one_chunk _color'>Misc Pcs:</div><div className='firstpart_one_chunk_val workbreak'> {e?.additional?.misc?.ActualPcs} </div></div>
                                        {/* <div className='firstpart_one_1'><div className='firstpart_one_chunk _color' style={{ borderRight: "none" }}></div><div className='firstpart_one_chunk_val workbreak'></div></div> */}
                                      </div>
                                      <div className='firstpart_two'>
                                        <div className='firstpart_one_1'><div className='firstpart_two_chunk _color'>Due Date:</div><div className='firstpart_two_chunk workbreak'>{`${e?.data?.rd?.promiseDatef}`}</div></div>
                                        <div className='firstpart_one_1'><div className='firstpart_two_chunk _color'>{`${e?.data?.rd?.serialjobno ?? ''}`}</div><div className='firstpart_two_chunk workbreak'> </div></div>
                                        <div className='firstpart_one_1'><div className='firstpart_two_chunk _color'>Ord No:</div><div className='firstpart_two_chunk workbreak'>{e?.data?.rd?.OrderNo}</div></div>
                                        <div className='firstpart_one_1'><div className='firstpart_one_chunk ' style={{ borderRight: "none" }}> {e?.data?.rd?.SalesrepCode}</div><div className='firstpart_one_chunk_val workbreak' style={{ width: "130px" }}>    ({e?.data?.rd?.IsSplits_Quotation_Quantity}) Pcs</div></div>

                                        <div className='firstpart_one_1'><div className='firstpart_two_chunk _color'>Gr Wt.:</div><div className='firstpart_two_chunk workbreak'>{`${e?.data?.rd?.ActualGrossweight?.toFixed(3)}`}</div></div>
                                        <div className='firstpart_one_1'><div className='firstpart_two_chunk _color'>Dia. Wt.:</div><div className='firstpart_two_chunk workbreak'>{`${e?.additional?.dia?.ActualWeight?.toFixed(3)}`}</div></div>
                                        <div className='firstpart_one_1'><div className='firstpart_two_chunk _color'>Clr Wt.:</div><div className='firstpart_two_chunk workbreak'>{`${e?.additional?.clr?.ActualWeight?.toFixed(3)}`}</div></div>
                                        <div className='firstpart_one_1'><div className='firstpart_two_chunk _color'>Misc Wt.:</div><div className='firstpart_two_chunk workbreak'>{e?.additional?.misc?.ActualWeight?.toFixed(3)}</div></div>
                                        {/* <div className='firstpart_one_1'><div className='firstpart_two_chunk '>PROPOSED</div><div className='firstpart_two_chunk workbreak'>ISSUE</div></div> */}
                                      </div>
                                    </div>


                                    <div className="secondpartimg" style={{ display: "flex", position: "relative" }}>
                                      <div className="img" style={{width:"90px"}}  >

                                       <div className='img_qr' style={{height:"110px",display:"flex",justifyContent:"center",alignItems:"center"}}>
                                       <QRCodeGenerator
                                          text={e?.data?.rd.serialjobno}
                                        />
                                       </div>
                                        <div style={{ borderTop:"1.5px solid #9B9B9B",lineHeight:"1", textAlign: "center", fontSize: "10px", padding: "2px", height: "15.88px" }}>{e?.data?.rd?.tunch + " " + e?.data?.rd?.MetalColor}</div>
                                      </div>
                                      <div >
                                        <div className="barcode"  style={{ borderLeft: "1.5px solid #9B9B9B"  }}>
                                          <img width={e?.data?.rd?.DesignImage ? "127px" : "120px"} src={e?.data?.rd?.DesignImage !== '' ? e?.data?.rd?.DesignImage : require("../../assets/img/default.jpg")} id="img15" alt="" onError={e => handleImageError(e)} loading="eager" />

                                        </div>
                                      </div>
                                      <div>


                                      </div>
                                    </div>



                                  </div>

                                  <div className='firstpart_footer'>
                                    <div className='footer_one'>
                                      <div className='firstpart_one_1'>
                                        <div className='firstpart_one_chunk _color' style={{ fontWeight: "bold", justifyContent: "center", color: "black" }}>Order Process</div>
                                        <div className='firstpart_one_chunk_val _color' style={{ width: "365px", justifyContent: "center", fontWeight: "bold", color: "black" }}>Prepade By</div>
                                        <div className='firstpart_one_chunk_val _color' style={{ width: "124px", justifyContent: "center", fontWeight: "bold", color: "black",borderTop:"1.5px solid #9B9B9B" }}>Confirmed By</div>
                                        <div className='firstpart_one_chunk_val _color' style={{ width: "99px", justifyContent: "center", borderRight: "none", fontWeight: "bold", color: "black",borderTop:"1.5px solid #9B9B9B" }}></div>
                                      </div>

                                    </div>
                                  </div>
                                  <div>
                                    <div>
                                      <div style={{ display: "flex" }}>
                                        < div className='firstpart_one_1 text-break'>
                                          <div className='firstpart_one_chunk workbreak text-break'><b></b></div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ justifyContent: "center", fontWeight: "bold",width:"90px",borderRight:"none" }}></div>
                                        </div>
                                        <div className='firstpart_one_2'>
                                          <div className="semi workbreak text-break" style={{ fontWeight: 'bold', justifyContent: "center",width:"90px",borderRight:"none"  }}></div>
                                          <div className="semi workbreak text-break" style={{ fontWeight: 'bold', justifyContent: "center",width:"90px" ,borderRight:"none" }}></div>
                                          <div className="semi workbreak text-break" style={{ fontWeight: 'bold', justifyContent: "center",width:"95px" }}></div>
                                          <div className="semi workbreak text-break" style={{ fontWeight: 'bold', justifyContent: "center",width:"124px" }}></div>
                                          <div className="semi workbreak text-break" style={{ fontWeight: 'bold', borderRight: "none",width:"98px" }}></div>
                                        </div>

                                      </div>
                                      <div style={{ display: "flex" }}>
                                        < div className='firstpart_one_1 text-break'>
                                          <div className='firstpart_one_chunk workbreak text-break' style={{ justifyContent: "center" }}><b>Process</b></div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ justifyContent: "center", fontWeight: "bold",width:"90px" }}>Date</div>
                                        </div>
                                        <div className='firstpart_one_2'>
                                          <div className="semi workbreak text-break" style={{ fontWeight: 'bold', justifyContent: "center",width:"90px" }}>Name</div>
                                          <div className="semi workbreak text-break" style={{ fontWeight: 'bold', justifyContent: "center",width:"90px" }}>Issued Wt.</div>
                                          <div className="semi workbreak text-break" style={{ fontWeight: 'bold', justifyContent: "center",width:"95px" }}>Return Wt.</div>
                                          <div className="semi workbreak text-break" style={{ fontWeight: 'bold', justifyContent: "center",width:"124px" }}>QC Sign</div>
                                          <div className="semi workbreak text-break" style={{ fontWeight: 'bold', borderRight: "none", justifyContent: "center",width:"98px" }}></div>
                                        </div>

                                      </div>

                                      {
                                        processList?.map((ele, i) => {
                                          return (
                                            <div style={{ display: "flex" }} key={i}>
                                              < div className='firstpart_one_1 text-break'>
                                                <div className='firstpart_one_chunk workbreak text-break' style={{justifyContent:"center"}}>{ele}</div>
                                                <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "90px" }}></div>
                                              </div>
                                              <div className='firstpart_one_2'>
                                                <div className="semi workbreak text-break" style={{ fontWeight: 'bold',width:"90px" }}></div>
                                                <div className="semi workbreak text-break" style={{ fontWeight: 'bold',width:"90px"  }}></div>
                                                <div className="semi workbreak text-break" style={{ fontWeight: 'bold',width:"95px"  }}></div>
                                                <div className="semi workbreak text-break" style={{ fontWeight: 'bold',width:"124px"}}></div>
                                                <div className="semi workbreak text-break" style={{ fontWeight: 'bold', borderRight: "none",width:"98px" }}></div>
                                              </div>
                                            </div>
                                          );
                                        })

                                      }
                                      <div style={{ textAlign: "center", fontSize: "12px", padding: "2px", borderBottom: "1px solid #000000" }}>
                                        Final QC Check List
                                      </div>

                                      <div style={{ display: "flex" }}>
                                        < div className='firstpart_one_1 text-break'>
                                          <div className='firstpart_one_chunk workbreak text-break' style={{ width: "25px" ,justifyContent:"center"}}> 1</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "103px" }}>As per Design</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "206px" }}> </div>
                                          <div className='firstpart_one_chunk workbreak text-break' style={{ width: "25px",justifyContent:"center" }}> 6</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "136px" }}>No. of {" "} Stone </div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "222px", borderRight: "none" }}> </div>
                                        </div>


                                      </div>
                                      <div style={{ display: "flex" }}>
                                        < div className='firstpart_one_1 text-break'>
                                          <div className='firstpart_one_chunk workbreak text-break' style={{ width: "25px" ,justifyContent:"center"}}> 2</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "103px" }}>Metal purity & Color</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "206px" }}> </div>
                                          <div className='firstpart_one_chunk workbreak text-break' style={{ width: "25px" ,justifyContent:"center"}}> 7</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "136px" }}>No. of {" "}  Diamond</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "222px", borderRight: "none" }}> </div>
                                        </div>


                                      </div>
                                      <div style={{ display: "flex" }}>
                                        < div className='firstpart_one_1 text-break'>
                                          <div className='firstpart_one_chunk workbreak text-break' style={{ width: "25px" ,justifyContent:"center"}}> 3</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "103px" }}>Screw Type , Hook</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "206px" }}> </div> 
                                          <div className='firstpart_one_chunk workbreak text-break' style={{ width: "25px" ,justifyContent:"center"}}> 8</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "136px" }}>Length of Article</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "222px", borderRight: "none" }}> </div>
                                        </div>


                                      </div>
                                      <div style={{ display: "flex" }}>
                                        < div className='firstpart_one_1 text-break'>
                                          <div className='firstpart_one_chunk workbreak text-break' style={{ width: "25px" ,justifyContent:"center"}}> 4</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "103px" }}>Screw Length</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "206px" }}> </div>
                                          <div className='firstpart_one_chunk workbreak text-break' style={{ width: "25px",justifyContent:"center" }}> 9</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "136px" }}>Weight of Article</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "222px", borderRight: "none" }}> </div>
                                        </div>


                                      </div>
                                      <div style={{ display: "flex" }}>
                                        < div className='firstpart_one_1 text-break'>
                                          <div className='firstpart_one_chunk workbreak text-break' style={{ width: "25px" ,borderBottom:"1px solid #000",justifyContent:"center"}}> 5</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "103px" ,borderBottom:"1px solid #000"}}>Setting OK or NOT</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "206px",borderBottom:"1px solid #000" }}> </div>
                                          <div className='firstpart_one_chunk workbreak text-break' style={{ width: "25px",borderBottom:"1px solid #000",justifyContent:"center" }}> 10</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "136px",borderBottom:"1px solid #000" }}> Stamping(Pcs,Ctw)</div>
                                          <div className='firstpart_one_chunk_val workbreak text-break' style={{ width: "222px", borderRight: "none",borderBottom:"1px solid #000" }}> </div>
                                        </div>


                                      </div>


                                      <div style={{ display: "flex", fontSize: "12px", marginTop: "10px", alignItems: "center", justifyContent: "center" }}>
                                        <div style={{ width: "40%" }}>
                                          <p>QC By _________________________________</p>
                                        </div>
                                        <div style={{ width: "40%" }}>
                                          <p>CHECKED BY  ____________________________</p>
                                        </div>
                                      </div>




                                    </div>


                                  </div>


                                </div>
                                {/* <div className='secondpart'>
                                                                            <div className='firstpart_one_1'><div className='firstpart_one_chunk_val _color '>DESIGN NO.</div><div className='firstpart_one_chunk workbreak text-break' style={{ borderRight: "none" }}>{`${e?.data?.rd?.Designcode}`}</div></div>
                                                                            <div className='imagediv'><img src={e?.data?.rd?.DesignImage !== ''  ? e?.data?.rd?.DesignImage : require("../../assets/img/default.jpg")} id="img15" alt="" onError={e => handleImageError(e)} loading="eager"  /></div>
                                                                            <div className='barcodediv'><div className='barcode14'>
                                                                                {(e?.data?.rd?.length !== 0 && e?.data?.rd !== undefined) && <>{e?.data?.rd?.serialjobno !== undefined && <BarcodeGenerator data={e?.data?.rd?.serialjobno} />}</>}
                                                                            </div></div>
                                                                            <div className='firstpart_one_1'><div className='semi _color d-flex align-items-center justify-content-start ps-1'>SPE REM.	:</div><div className='semi_border workbreak flexSPE text-break'>{(e?.data?.rd?.ProductInstruction?.length > 0 ? checkInstruction(e?.data?.rd?.ProductInstruction) : checkInstruction(e?.data?.rd?.QuoteRemark))}</div></div>
                                                                            <div className='info workbreak flex_data fw-bold text-break' style={{ fontSize: "10px" }}>
                                                                                <div className='fw-bold'>{e?.data?.rd?.productinfo}</div>
                                                                            </div>
                                                                            <div className='secondpart_footer_2'>
                                                                                <div className='fg_info_1 _color font_size'>FG DETAILS</div>
                                                                                <div className='fg_info_2 _color font_size'>RM TRANSACTION</div>
                                                                            </div>
                                                                            <div className='secondpart_footer_2'>
                                                                                <div className='fg_info_1'><div className='last_1 _color font_size' style={{ borderRight: "1px solid grey" }}>QTY</div><div className='last_1 _color font_size'>WT</div></div>
                                                                                <div className='fg_info_2'>
                                                                                    <div className='last_2 _color font_size d-flex align-items-center justify-content-start ps-1'>RM CODE </div>
                                                                                    <div className='last_2 _color font_size'> ISSUE </div>
                                                                                    <div className='last_2 _color font_size' style={{ borderRight: "none" }}> RETURN </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className='secondpart_footer_2'>
                                                                                <div className='fg_info_1'><div className='last_1 workbreak' style={{ borderRight: "1px solid grey" }}></div><div className='last_1 workbreak'></div></div>
                                                                                <div className='fg_info_2'>
                                                                                    <div className='last_2 workbreak' > </div>
                                                                                    <div className='last_2 workbreak'>  </div>
                                                                                    <div className='last_2 workbreak' style={{ borderRight: "none" }}> </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className='secondpart_footer_2'>
                                                                                <div className='fg_info_1'><div className='last_1' style={{ borderRight: "1px solid grey" }}></div><div className='last_1'></div></div>
                                                                                <div className='fg_info_2'>
                                                                                    <div className='last_2' > </div>
                                                                                    <div className='last_2'>  </div>
                                                                                    <div className='last_2' style={{ borderRight: "none" }}> </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className='secondpart_footer_2'>
                                                                                <div className='fg_info_1'><div className='last_1' style={{ borderRight: "1px solid grey" }}></div><div className='last_1'></div></div>
                                                                                <div className='fg_info_2'>
                                                                                    <div className='last_2' > </div>
                                                                                    <div className='last_2'>  </div>
                                                                                    <div className='last_2' style={{ borderRight: "none" }}> </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className='secondpart_footer_2 border-bottom-0'>
                                                                                <div className='fg_info_1'><div className='last_1' style={{ borderRight: "1px solid grey" }}></div><div className='last_1'></div></div>
                                                                                <div className='fg_info_2'>
                                                                                    <div className='last_2' > </div>
                                                                                    <div className='last_2'>  </div>
                                                                                    <div className='last_2' style={{ borderRight: "none" }}>  </div>
                                                                                </div>
                                                                            </div>
                                                                        </div> */}
                              </div>
                            // );
                          // })
                          // :
                          // <div className='container_14'>
                          //   <div className='firstpart'>
                          //     <div className='firstpart_header'>
                          //       <div className='firstpart_one'>
                          //         <div className='firstpart_one_1'><div className='firstpart_one_chunk _color'> Order Date: </div><div className='firstpart_one_chunk_val workbreak'>{`${e?.data?.rd?.orderDatef}`}</div></div>
                          //         <div className='firstpart_one_1'><div className='firstpart_one_chunk _color'>Party:</div><div className='firstpart_one_chunk_val workbreak'> {e?.data?.rd?.CustomerCode}</div></div>
                          //         <div className='firstpart_one_1'><div className='firstpart_one_chunk _color'>Design:</div><div className='firstpart_one_chunk_val workbreak'>{`${e?.data?.rd?.Designcode}`}</div></div>

                          //         <div className='firstpart_one_1'><div className='firstpart_one_chunk ' style={{ borderRight: "none", }}>Size:  {e?.data?.rd?.Size}</div><div className='firstpart_one_chunk_val workbreak' style={{ borderRight: "none" }}> Sale Rep:</div></div>
                          //         <div className='firstpart_one_1'><div className='firstpart_one_chunk _color'>Net Wt.:</div><div className='firstpart_one_chunk_val workbreak'> {e?.data?.rd?.netwt}</div></div>
                          //         <div className='firstpart_one_1'><div className='firstpart_one_chunk _color'>Dia. Pcs:</div><div className='firstpart_one_chunk_val workbreak'>{e?.additional?.dia?.ActualPcs} </div></div>
                          //         <div className='firstpart_one_1'><div className='firstpart_one_chunk _color'>Clr Pcs:</div><div className='firstpart_one_chunk_val workbreak'>   {e?.additional?.clr?.ActualPcs}</div></div>
                          //         <div className='firstpart_one_1'><div className='firstpart_one_chunk _color'>Misc Pcs:</div><div className='firstpart_one_chunk_val workbreak'> {e?.additional?.misc?.ActualPcs} </div></div>
                          //         {/* <div className='firstpart_one_1'><div className='firstpart_one_chunk _color' style={{ borderRight: "none" }}></div><div className='firstpart_one_chunk_val workbreak'></div></div> */}
                          //       </div>
                          //       <div className='firstpart_two'>
                          //         <div className='firstpart_one_1'><div className='firstpart_two_chunk _color'>Due Date:</div><div className='firstpart_two_chunk workbreak'>{`${e?.data?.rd?.promiseDatef}`}</div></div>
                          //         <div className='firstpart_one_1'><div className='firstpart_two_chunk _color'>{`${e?.data?.rd?.serialjobno ?? ''}`}</div><div className='firstpart_two_chunk workbreak'>{`${e?.data?.rd?.MetalColorCo}`}</div></div>
                          //         <div className='firstpart_one_1'><div className='firstpart_two_chunk _color'>Ord No:</div><div className='firstpart_two_chunk workbreak'>{e?.data?.rd?.OrderNo}</div></div>
                          //         <div className='firstpart_one_1'><div className='firstpart_one_chunk ' style={{ borderRight: "none" }}> {e?.data?.rd?.SalesrepCode}</div><div className='firstpart_one_chunk_val workbreak' style={{ borderRight: "none" }}>    ({e?.data?.rd?.IsSplits_Quotation_Quantity}) Pcs</div></div>

                          //         <div className='firstpart_one_1'><div className='firstpart_two_chunk _color'>Gr Wt.:</div><div className='firstpart_two_chunk workbreak'>{`${e?.data?.rd?.ActualGrossweight?.toFixed(3)}`}</div></div>
                          //         <div className='firstpart_one_1'><div className='firstpart_two_chunk _color'>Dia. Wt.:</div><div className='firstpart_two_chunk workbreak'>{`${e?.additional?.dia?.ActualWeight?.toFixed(3)}`}</div></div>
                          //         <div className='firstpart_one_1'><div className='firstpart_two_chunk _color'>Clr Wt.:</div><div className='firstpart_two_chunk workbreak'>{`${e?.additional?.clr?.ActualWeight?.toFixed(3)}`}</div></div>
                          //         <div className='firstpart_one_1'><div className='firstpart_two_chunk _color'>Misc Wt.:</div><div className='firstpart_two_chunk workbreak'>{e?.additional?.misc?.ActualWeight?.toFixed(3)}</div></div>
                          //         {/* <div className='firstpart_one_1'><div className='firstpart_two_chunk '>PROPOSED</div><div className='firstpart_two_chunk workbreak'>ISSUE</div></div> */}
                          //       </div>
                          //     </div>
                          //     <div className='firstpart_footer'>
                          //       <div className='footer_one'>
                          //         <div className='firstpart_one_1'>
                          //           <div className='firstpart_one_chunk _color'>RM CODE</div>
                          //           <div className='firstpart_one_chunk_val _color'>RM SIZE</div>
                          //         </div>
                          //         <div className='firstpart_one_2'>
                          //           <div className='semi _color text-start d-flex align-items-center justify-content-start ps-1'>PCS</div>
                          //           <div className='semi _color text-start d-flex align-items-center justify-content-start ps-1'>WT</div>
                          //         </div>
                          //         <div className='firstpart_one_1'>
                          //           <div className='semi _color text-start d-flex justify-content-start align-items-center ps-1'>PCS</div>
                          //           <div className='semi _color text-start d-flex justify-content-start align-items-center ps-1'>WT</div>
                          //         </div>
                          //       </div>
                          //     </div>
                          //     <div className='footer_one'>
                          //       <div className='firstpart_one_1'>
                          //         <div className='firstpart_one_chunk'></div>
                          //         <div className='firstpart_one_chunk_val'></div>
                          //       </div>
                          //       <div className='firstpart_one_2'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //       <div className='firstpart_one_1'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //     </div>
                          //     <div className='footer_one'>
                          //       <div className='firstpart_one_1'>
                          //         <div className='firstpart_one_chunk'></div>
                          //         <div className='firstpart_one_chunk_val'></div>
                          //       </div>
                          //       <div className='firstpart_one_2'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //       <div className='firstpart_one_1'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //     </div>
                          //     <div className='footer_one'>
                          //       <div className='firstpart_one_1'>
                          //         <div className='firstpart_one_chunk'></div>
                          //         <div className='firstpart_one_chunk_val'></div>
                          //       </div>
                          //       <div className='firstpart_one_2'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //       <div className='firstpart_one_1'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //     </div>
                          //     <div className='footer_one'>
                          //       <div className='firstpart_one_1'>
                          //         <div className='firstpart_one_chunk'></div>
                          //         <div className='firstpart_one_chunk_val'></div>
                          //       </div>
                          //       <div className='firstpart_one_2'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //       <div className='firstpart_one_1'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //     </div>
                          //     <div className='footer_one'>
                          //       <div className='firstpart_one_1'>
                          //         <div className='firstpart_one_chunk'></div>
                          //         <div className='firstpart_one_chunk_val'></div>
                          //       </div>
                          //       <div className='firstpart_one_2'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //       <div className='firstpart_one_1'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //     </div>
                          //     <div className='footer_one'>
                          //       <div className='firstpart_one_1'>
                          //         <div className='firstpart_one_chunk'></div>
                          //         <div className='firstpart_one_chunk_val'></div>
                          //       </div>
                          //       <div className='firstpart_one_2'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //       <div className='firstpart_one_1'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //     </div>
                          //     <div className='footer_one'>
                          //       <div className='firstpart_one_1'>
                          //         <div className='firstpart_one_chunk'></div>
                          //         <div className='firstpart_one_chunk_val'></div>
                          //       </div>
                          //       <div className='firstpart_one_2'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //       <div className='firstpart_one_1'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //     </div>
                          //     <div className='footer_one'>
                          //       <div className='firstpart_one_1'>
                          //         <div className='firstpart_one_chunk'></div>
                          //         <div className='firstpart_one_chunk_val'></div>
                          //       </div>
                          //       <div className='firstpart_one_2'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //       <div className='firstpart_one_1'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //     </div>
                          //     <div className='footer_one'>
                          //       <div className='firstpart_one_1'>
                          //         <div className='firstpart_one_chunk'></div>
                          //         <div className='firstpart_one_chunk_val'></div>
                          //       </div>
                          //       <div className='firstpart_one_2'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //       <div className='firstpart_one_1'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //     </div>
                          //     <div className='footer_one'>
                          //       <div className='firstpart_one_1'>
                          //         <div className='firstpart_one_chunk'></div>
                          //         <div className='firstpart_one_chunk_val'></div>
                          //       </div>
                          //       <div className='firstpart_one_2'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //       <div className='firstpart_one_1'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //     </div>
                          //     <div className='footer_one'>
                          //       <div className='firstpart_one_1'>
                          //         <div className='firstpart_one_chunk'></div>
                          //         <div className='firstpart_one_chunk_val'></div>
                          //       </div>
                          //       <div className='firstpart_one_2'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //       <div className='firstpart_one_1'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //     </div>
                          //     <div className='footer_one'>
                          //       <div className='firstpart_one_1'>
                          //         <div className='firstpart_one_chunk'><b className='fw-normal'>TOTAL</b></div>
                          //         <div className='firstpart_one_chunk_val'></div>
                          //       </div>
                          //       <div className='firstpart_one_2'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //       <div className='firstpart_one_1'>
                          //         <div className='semi'></div>
                          //         <div className='semi'></div>
                          //       </div>
                          //     </div>
                          //     <div className='footer_one'>
                          //       <div className='firstpart_one_1'>
                          //         <div className='firstpart_one_chunk _color'>PARTICULAR</div>
                          //         <div className='firstpart_one_chunk_val _color'>DATE</div>
                          //       </div>
                          //       <div className='firstpart_one_2'>
                          //         <div className='semi _color d-flex justify-content-start align-items-center ps-1 '>PCS</div>
                          //         <div className='semi _color d-flex justify-content-start align-items-center ps-1'>WT</div>
                          //       </div>
                          //       <div className='firstpart_one_1'>
                          //         <div className='semi _color d-flex justify-content-start align-items-center ps-1'>WORKER</div>
                          //         <div className='semi _color d-flex justify-content-start align-items-center ps-1'>WORKER</div>
                          //       </div>
                          //     </div>
                          //     <div className='footer_one'>
                          //       <div className='firstpart_one_1'>
                          //         <div className='firstpart_one_chunk _color' style={{ borderBottom: "none" }}> WT TOLERANCE</div>
                          //         <div className='firstpart_one_chunk_val' style={{ borderBottom: "none" }}></div>
                          //       </div>
                          //       <div className='firstpart_one_2'>
                          //         <div className='semi' style={{ borderBottom: "none" }}></div>
                          //         <div className='semi' style={{ borderBottom: "none" }}></div>
                          //       </div>
                          //       <div className='firstpart_one_1'>
                          //         <div className='semi' style={{ borderBottom: "none" }}></div>
                          //         <div className='semi' style={{ borderBottom: "none" }}></div>
                          //       </div>
                          //     </div>
                          //   </div>
                          //   {/* <div className='secondpart'>
                          //                                   <div className='firstpart_one_1'><div className='firstpart_one_chunk_val _color'>DESIGN NO.</div><div className='firstpart_one_chunk' style={{ borderRight: "none" }}>{`${e?.data?.rd?.Designcode ?? ''}`}</div></div>
                          //                                   <div className='imagediv'><img src={e?.data?.rd?.DesignImage !== ''  ? e?.data?.rd?.DesignImage : require("../../assets/img/default.jpg")} id="img15" alt="" onError={e => handleImageError(e)} loading="eager"  /></div>
                          //                                   <div className='barcodediv'><div className='barcode14'>
                          //                                       {(e?.data?.rd?.length !== 0 && e?.data?.rd !== undefined) && <>{e?.data?.rd?.serialjobno !== undefined && <BarcodeGenerator data={e?.data?.rd?.serialjobno ?? ''} />}</>}
                          //                                   </div></div>
                          //                                   <div className='firstpart_one_1'><div className='semi _color d-flex justify-content-start align-items-center ps-1'>SPE REM.	:</div><div className='semi_border flexSPE workbreak'></div></div>
                          //                                   <div className='info flex_data workbreak' style={{ fontSize: "12px" }}>
                          //                                   </div>
                          //                                   <div className='secondpart_footer_2'>
                          //                                       <div className='fg_info_1 _color fs14A'>FG DETAILS</div>
                          //                                       <div className='fg_info_2 _color fs14A ps-1'>RM TRANSACTION</div>
                          //                                   </div>
                          //                                   <div className='secondpart_footer_2'>
                          //                                       <div className='fg_info_1'><div className='last_1 _color fs14A' style={{ borderRight: "1px solid grey" }}>QTY</div><div className='last_1 _color fs14A'>WT</div></div>
                          //                                       <div className='fg_info_2'>
                          //                                           <div className='last_2 _color fs14A' style={{ fontSize: "10.5px", width:'33.33%' }}>RM CODE </div>
                          //                                           <div className='last_2 _color fs14A' style={{ width:'33.33%' }}> ISSUE </div>
                          //                                           <div className='last_2 _color fs14A' style={{ borderRight: "none", width:'33.33%'  }}> RETURN </div>
                          //                                       </div>
                          //                                   </div>
                          //                                   <div className='secondpart_footer_2'>
                          //                                       <div className='fg_info_1'><div className='last_1' style={{ borderRight: "1px solid grey" }}></div><div className='last_1'></div></div>
                          //                                       <div className='fg_info_2'>
                          //                                           <div className='last_2' style={{width:'33.33%' }}> </div>
                          //                                           <div className='last_2' style={{width:'33.33%' }}>  </div>
                          //                                           <div className='last_2' style={{ borderRight: "none", width:'33.33%' }}> </div>
                          //                                       </div>
                          //                                   </div>
                          //                                   <div className='secondpart_footer_2'>
                          //                                       <div className='fg_info_1'><div className='last_1' style={{ borderRight: "1px solid grey" }}></div><div className='last_1'></div></div>
                          //                                       <div className='fg_info_2'>
                          //                                           <div className='last_2' style={{width:'33.33%' }}> </div>
                          //                                           <div className='last_2' style={{width:'33.33%' }}>  </div>
                          //                                           <div className='last_2' style={{ borderRight: "none", width:'33.33%' }}> </div>
                          //                                       </div>
                          //                                   </div>
                          //                                   <div className='secondpart_footer_2'>
                          //                                       <div className='fg_info_1'><div className='last_1' style={{ borderRight: "1px solid grey" }}></div><div className='last_1'></div></div>
                          //                                       <div className='fg_info_2'>
                          //                                           <div className='last_2' style={{width:'33.33%' }}> </div>
                          //                                           <div className='last_2' style={{width:'33.33%' }}>  </div>
                          //                                           <div className='last_2' style={{ borderRight: "none", width:'33.33%' }}> </div>
                          //                                       </div>
                          //                                   </div>
                          //                                   <div className='secondpart_footer_2 border-bottom-0' style={{height:'23.5px !important'}}>
                          //                                       <div className='fg_info_1'><div className='last_1' style={{ borderRight: "1px solid grey" }}></div><div className='last_1'></div></div>
                          //                                       <div className='fg_info_2'>
                          //                                           <div className='last_2' style={{width:'33.33%' }}> </div>
                          //                                           <div className='last_2' style={{width:'33.33%' }}>  </div>
                          //                                           <div className='last_2' style={{ borderRight: "none", width:'33.33%' }}>  </div>
                          //                                       </div>
                          //                                   </div>
                          //                               </div> */}
                          // </div>
                      }
                    </React.Fragment>
                  );
                })
              }

            </div>
          </div>
        </>
      }
    </>
  );
}

export default BagPrint14N;






