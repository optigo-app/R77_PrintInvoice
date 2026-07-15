import React from "react";
import "../../assets/css/prints/summary2.css";
import { useState } from "react";
import { useEffect } from "react";
import {
  apiCall,
  checkMsg,
  formatAmount,
  handleImageError,
  handlePrint,
  isObjectEmpty,
  numberToWord,
  mergeMetals,
  mergeFindings
} from "../../GlobalFunctions";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import Loader from "../../components/Loader";
import { ToWords } from "to-words";

const Summary2 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  const [result, setResult] = useState(null);
  const toWords = new ToWords();
  const [categoryNameWise, setCategoryNameWise] = useState([]);
  const [headerflag, setHeaderflag] = useState(true);
  const [footerflag, setFooterflag] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [classIs, setClassIs] = useState({
    col1: "thcol1s2",
    col2: "thcol2s2",
    col3: "thcol3s2",
    col4: "thcol4s2",
    col5: "thcol5s2",
    col6: "thcol6s2",
    col7: "thcol7s2",
    col8: "thcol8s2",
    col9: "thcol9s2",
    col10: "thcol10s2",
    col11: "thcol11s2",
    col12: "thcol12s2",
    col13: "thcol13s2",
    col14: "thcol14s2",
  });
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const [hsnetwt, sethsnetwt] = useState(true);
  const [hsimg, sethsimg] = useState(true);
  const [hsbrand, sethsbrand] = useState(false);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const [currencyData, setCurrencyData] = useState({});
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  useEffect(() => {
    const sendData = async () => {
      try {
        const data = await apiCall(token, invoiceNo, printName, urls, evn, ApiVer);
        if (data?.Status === "200") {
          let isEmpty = isObjectEmpty(data?.Data);
          if (!isEmpty) {
            loadData(data?.Data);
            setLoader(false);
          } else {
            setLoader(false);
            setMsg("Data Not Found");
          }
        } else {
          setLoader(false);
          // setMsg(data?.Message);
          const err = checkMsg(data?.Message);
          console.log(data?.Message);
          setMsg(err);
        }
      } catch (error) {
        console.error(error);
      }
    };
    sendData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadData(data) {
    // console.log("data", data);
    let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    data.BillPrint_Json[0].address = address;
    // setCurrencyData(data?.BillPrint_Json4[0]);
    const decodedEnv = atob(evn);
    if (decodedEnv === "sale") {
      setCurrencyData(data?.BillPrint_Json4?.[0]);
    } else {
      setCurrencyData(data?.BillPrint_Json3?.[0]);
    }
 
    const datas = OrganizeDataPrint(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );
    let cateWise = [];
    datas?.resultArray?.forEach(e => {
      let findRecord = cateWise?.findIndex((el) => el?.Categoryname === e?.Categoryname);
      if (findRecord === -1) {
        cateWise.push(e);
      } else {
        cateWise[findRecord].Quantity += e?.Quantity;
      }
    });

    datas?.resultArray?.forEach((el) => {
      let dia = [];
      el?.diamonds?.forEach((a) => {
        let findrecord = dia?.findIndex((ele) => ele?.QualityName === a?.QualityName && ele?.Rate === a?.Rate)
        if (findrecord === -1) {
          let obj = { ...a };
          obj.dwt = a?.Wt;
          obj.dpcs = a?.Pcs;
          obj.Rate = a?.Rate;
          obj.damt = a?.Amount;
          dia.push(obj);
        } else {
          dia[findrecord].dwt += a?.Wt;
          dia[findrecord].dpcs += a?.Pcs;
          dia[findrecord].Rate = a?.Rate;
          dia[findrecord].damt += a?.Amount;
        }
      })
      dia.sort((a, b) => a?.QualityName?.localeCompare(b?.QualityName));
      el.diamonds = dia;
    })

    setCategoryNameWise(cateWise);
    setResult(datas);
  }

  const handlenetwtcol = (e) => {
    let val = e.target.value;
    if (val === "netwts2") {
      if (hsnetwt) {
        sethsnetwt(false);
      } else {
        sethsnetwt(true);
      }
    }
    if (val === "images2") {
      if (hsimg) {
        sethsimg(false);
      } else {
        sethsimg(true);
      }
    }
    if (val === "brands2") {
      if (hsbrand) {
        sethsbrand(false);
      } else {
        sethsbrand(true);
      }
    }
  };

  console.log("result", result);

  const handleHeaderShow = (e) => {
    if (headerflag) setHeaderflag(false);
    else {
      setHeaderflag(true);
    }
  };

  const handleFooterShow = (e) => {
    if (footerflag) setFooterflag(false);
    else {
      setFooterflag(true);
    }
  };

  
 


  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          {msg === "" ? (
            <>
              <div className="containerS2 fsgs2 pbs2">
                {/* print and hide show buttons */}
                <div className="d-flex justify-content-end align-items-center mb-3 mx-2 fw-bold user-select-none mb-5 hidebtns2">
                  <div className="px-1">
                    <input
                      type="checkbox"
                      checked={hsnetwt}
                      id="netwts2"
                      value="netwts2"
                      className="mx-1"
                      onChange={handlenetwtcol}
                    />
                    <label htmlFor="netwts2">With NetWt</label>
                  </div>
                  <div className="px-1">
                    <input
                      type="checkbox"
                      checked={hsimg}
                      id="imgshs2"
                      value="images2"
                      className="mx-1"
                      onChange={handlenetwtcol}
                    />
                    <label htmlFor="imgshs2">With Image</label>
                  </div>

                  <div className="px-1">
                    <input
                      className=" mx-1"
                      id="header"
                      type="checkbox"
                      checked={headerflag}
                      onChange={(e) => handleHeaderShow(e)}
                      name="header"
                    />
                    <label for="header" className="pt-1">Header</label>
                  </div>
                  <div className="px-1">
                    <input
                      className=" mx-1"
                      id="footer"
                      type="checkbox"
                      checked={footerflag}
                      onChange={(e) => handleFooterShow(e)}
                      name="footer"
                    />
                    <label for="footer" className="pt-1">Footer</label>
                  </div>
                  <div className="px-1">
                    <input
                      type="checkbox"
                      checked={hsbrand}
                      id="brandshs2"
                      value="brands2"
                      className="mx-1"
                      onChange={handlenetwtcol}
                    />
                    <label htmlFor="brandshs2">With Brand</label>
                  </div>
                  <div> <button className="btn_white blue m-0 mx-2 p-1 fsgs2" onClick={(e) => handlePrint(e)} > Print </button> </div>
                </div>
                <div></div>
                {/* headers */}

                {headerflag && (
                  <div className="headers2 d-flex justify-content-between p-2 border-bottom ">
                    <div className="subdiv1s2 w-75">
                      <div className="fw-bold fsh_s2">
                        {result?.header?.CompanyFullName}
                      </div>
                      <div className="lhs2 fsh2_s2">{result?.header?.CompanyAddress}</div>
                      <div className="lhs2 fsh2_s2">
                        {result?.header?.CompanyAddress2}
                      </div>
                      <div className="lhs2 fsh2_s2">
                        {result?.header?.CompanyCity}-
                        {result?.header?.CompanyPinCode},
                        {result?.header?.CompanyState}({result?.header?.CompanyCountry})
                      </div>
                      <div className="lhs2 fsh2_s2">
                        T {result?.header?.CompanyTellNo} | TOLL FREE{" "} {result?.header?.CompanyTollFreeNo}{" "}
                      </div>
                      <div className="lhs2 fsh2_s2">{result?.header?.CompanyEmail} | {result?.header?.CompanyWebsite}</div>
                      <div className="lhs2 fsh2_s2">
                        {/* {result?.header?.Company_VAT_GST_No} |{" "}
                        {result?.header?.Company_CST_STATE}-
                        {result?.header?.Company_CST_STATE_No} | PAN-
                        {result?.header?.Pannumber} */}
                        {[
                          result?.header?.Company_VAT_GST_No,

                          result?.header?.Company_CST_STATE_No
                            ? `${result?.header?.Company_CST_STATE}-${result?.header?.Company_CST_STATE_No}`
                            : null,

                          result?.header?.Pannumber
                            ? `PAN-${result?.header?.Pannumber}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" | ")}
                      </div>
                    </div>
                    <div className="subdiv1s2 w-25 d-flex justify-content-end">
                      {/* <img
                      src={result?.header?.PrintLogo}
                      className="printlogos2"
                      alt="comapanylogo"
                    /> */}
                      {isImageWorking && (result?.header?.PrintLogo !== "" &&
                        <img src={result?.header?.PrintLogo} alt="" className="printlogos2" onError={handleImageErrors} />)} </div>
                  </div>
                )}
                {/* sub headers */}
                <div className="subhead1s2 border mt-2 p-1 d-flex justify-content-between">
                  <div className="fsh3_s2_">
                    INVOICE#: <b className="fsh3_s2_">{result?.header?.InvoiceNo}</b>
                  </div>
                  <div className="pe-2">
                    <div className="fsh3_s2_">
                      DATE : <b className="fsh3_s2_">{result?.header?.EntryDate}</b>
                    </div>
                    <div className="fsh3_s2_">
                      {result?.header?.HSN_No_Label} :{" "}
                      <b className="fsgs2 fsh3_s2_">{result?.header?.HSN_No}</b>
                    </div>
                  </div>
                </div>
                <div className="subhead2s2 d-flex justify-content-between p-2 border border-top-0">
                  <div className="d-flex fsh3_s2">
                    <div className="fw-bold pe-2 fsh2_s2">TO,</div>
                    <div>
                      <div className="fw-bold fsh3_s2">
                        {result?.header?.customerfirmname}
                      </div>
                      <div>{result?.header?.customerstreet}</div>
                      <div>{result?.header?.customerregion}</div>
                      <div>
                        {result?.header?.customercity}
                        {result?.header?.customerpincode}
                      </div>
                      <div>Phno:-{result?.header?.customermobileno}</div>
                      <div>

                        {(result?.header?.Cust_VAT_GST_No || result?.header?.CustGstNo) && (
                          <>
                            {result?.header?.CustGstNo === "" ? "VAT" : "GSTIN"} -{" "}
                            {result?.header?.CustGstNo === ""
                              ? result?.header?.Cust_VAT_GST_No
                              : result?.header?.CustGstNo}
                          </>
                        )}

                        {/* Separator */}
                        {(result?.header?.Cust_VAT_GST_No || result?.header?.CustGstNo) &&
                          (result?.header?.Cust_CST_STATE ||
                            result?.header?.Cust_CST_STATE_No) &&
                          " | "}

                        {/* CST State */}
                        {(result?.header?.Cust_CST_STATE ||
                          result?.header?.Cust_CST_STATE_No) && (
                            <>
                              {result?.header?.Cust_CST_STATE}
                              {result?.header?.Cust_CST_STATE &&
                                result?.header?.Cust_CST_STATE_No &&
                                " - "}
                              {result?.header?.Cust_CST_STATE_No}
                            </>
                          )}

                        {/* Separator */}
                        {(result?.header?.CustPanno &&
                          (result?.header?.Cust_CST_STATE ||
                            result?.header?.Cust_CST_STATE_No)) &&
                          " | "}

                        {/* PAN */}
                        {result?.header?.CustPanno && (
                          <>PAN - {result.header.CustPanno}</>
                        )}
                        {/* {result?.header?.Cust_CST_STATE}-
                        {result?.header?.Cust_CST_STATE_No} 
                        {result?.header?.vat_cst_pan} */}
                      </div>
                    </div>
                  </div>
                  <div className="fw-bold fsh3_s2">
                    {result?.header?.MetalRate24K?.toFixed(2)}
                  </div>
                </div>
                {/* table */}
                <div>
                  {/* table head */}
                  <div className="d-flex fw-bold border border-top-0 theads2 fsh2_s2">
                    <div className={`${classIs.col1} border-end centers2`}>
                      SR#
                    </div>
                    <div className={`${classIs.col2} border-end starts2 ps-1`}>
                      DESIGN
                    </div>
                    <div className={`${classIs.col3} border-end centers2`}>
                      PURITY
                    </div>
                    <div className={`${classIs.col4} border-end centers2`}>
                      QLTY
                    </div>
                    <div className={`${classIs.col5} border-end centers2`}>
                      DIA WT
                    </div>
                    <div className={`${classIs.col6} border-end centers2`}>
                      DIA RATE
                    </div>
                    <div className={`${classIs.col7} border-end centers2`}>
                      DIA AMT
                    </div>
                    <div className={`${classIs.col8} border-end centers2`}>
                      G WT
                    </div>
                    {hsnetwt ? <div className={`${classIs.col9} border-end centers2`}> NWT </div> : ''}
                    <div className={`${classIs.col10} border-end centers2`}>
                      MAKING
                    </div>
                    <div className={`${classIs.col11} border-end centers2`}>
                      CSAMT
                    </div>
                    <div className={`${classIs.col12} border-end centers2`} style={{ wordBreak: 'break-word', display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                      GOLD FINE
                    </div>
                    <div className={`${classIs.col13} border-end centers2`} style={{ wordBreak: 'break-word', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      GOLD AMT
                    </div>
                    <div className={`${classIs.col14} centers2`} style={{ width: `${hsnetwt ? '' : '14%'}` }}>AMOUNT</div>
                  </div>
                  {/* table body */}
                  <div>
                    {result?.resultArray?.map((e, i) => {

                      
                         const mergedMetals = mergeMetals(e?.metal);
                        const mergedFindings = mergeFindings(e?.finding);
                        
                        console.log("TCL: mergedMetals",mergedMetals )
                      return (
                        <div className="d-flex border border-top-0 trows2 pbias2 fsh2_s2" key={i}>
                          <div className={`${classIs.col1} border-end d-flex justify-content-center align-items-start fsh2_s2`}>{i + 1}</div>
                          <div className={`${classIs.col2} border-end d-flex flex-column justify-content-between ps-1`}>
                            <div className="fw-bold d-flex justify-content-between px-1"><div className="fsh2_s2">{e?.designno}</div> {hsbrand ? <div className="fsh2_s2">({e?.BrandName})</div> : ''} </div>
                            <div className="fw-bold">{e?.SrJobno}</div>
                            {hsimg ? <div className="centers2"><img src={e?.DesignImage} alt="designimage" className="desImgs2" onError={(e) => handleImageError(e)} /></div> : ''}
                            <div className="centers2">{e?.HUID}</div>
                            <div className="centers2 fw-bold">Tunch : {e?.Tunch?.toFixed(3)}</div>
                          </div>
                          {/* <div className={`${classIs.col3} border-end toplefts2 ps-1`}>{e?.MetalTypePurity}</div> */}
                          <div className={`${classIs.col3} border-end `}>
                            {
                              mergedMetals?.map((el) => {
                                return (
                                  <div className="toplefts2 ps-1">  {el?.ShapeName + " " + el?.QualityName}</div>
                                )
                              })
                            }
                          </div>
                          <div className={`${classIs.col4} border-end `}>
                            {
                              e?.diamonds?.map((el) => {
                                return (
                                  <div className="toplefts2 ps-1">{el?.QualityName}</div>
                                )
                              })
                            }
                          </div>
                          <div className={`${classIs.col5} border-end `}>
                            {
                              e?.diamonds?.map((el) => {
                                return (
                                  <div className="tops2 pe-1">{el?.dwt?.toFixed(3)}</div>
                                )
                              })
                            }
                          </div>
                          <div className={`${classIs.col6} border-end`}>
                            {
                              e?.diamonds?.map((el) => {
                                return (
                                  <div className="tops2 pe-1"> {formatAmount(((el?.damt / el?.dwt) / (result?.header?.CurrencyExchRate)))}</div>
                                )
                              })
                            }
                          </div>
                          <div className={`${classIs.col7} border-end`}>
                            {
                              e?.diamonds?.map((el) => {
                                return (
                                  <div className="tops2 pe-1">{formatAmount(el?.damt)}</div>
                                )
                              })
                            }
                          </div>
                          <div className={`${classIs.col8} border-end tops2 pe-1`}>{e?.grosswt?.toFixed(3)}</div>
                          {/* {hsnetwt ? <div className={`${classIs.col9} border-end tops2 pe-1`}>{e?.NetWt?.toFixed(3)}</div> : ''} */}
                          <div className={`${classIs.col9} border-end `}>
                            {
                              mergedMetals?.map((el) => {
                                return (
                                  <div className="toplefts2 ps-1">   {(el?.Wt - e?.totals?.finding?.Wt).toFixed(3)}</div>
                                )
                              })
                            }
                          </div>
                          <div className={`${classIs.col10} border-end tops2 pe-1`}>
                            {
                              formatAmount(
                                (
                                  ((e?.MiscAmount + e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount + e?.OtherCharges + e?.TotalDiamondHandling) + (e?.totals?.finding?.SettingAmount) - e?.totals?.finding?.SettingAmount)
                                ))
                            }
                          </div>
                          <div className={`${classIs.col11} border-end tops2 pe-1`}>{formatAmount(e?.totals?.colorstone?.Amount)}</div>
                          <div className={`${classIs.col12} border-end tops2 pe-1`}>{e?.convertednetwt?.toFixed(3)}</div>
                          {/* <div className={`${classIs.col13} border-end tops2 pe-1`}>{formatAmount(e?.MetalAmount)}</div> */}
                          <div className={`${classIs.col13} border-end `}>
                            {
                              mergedMetals?.map((el) => {
                                return (
                                  <div className="toplefts2 ps-1">  {el?.Amount?.toFixed(2)}</div>
                                )
                              })
                            }
                          </div>
                          <div className={`${classIs.col14} tops2 pe-1`} style={{ width: `${hsnetwt ? '' : '14%'}` }}>{formatAmount(e?.TotalAmount)}</div>
                        </div>
                      );
                    })}
                  </div>
                  {/* table total */}
                  <div className="d-flex fw-bold border border-top-0 theads2 pbias2 fsh2_s2 tabtotal_s2" style={{ backgroundColor: "#F2F2F2", height: "40px" }}>
                    <div className={`${classIs.col1} border-end centers2`}></div>
                    <div className={`${classIs.col2} border-end starts2 ps-1`}>TOTAL</div>
                    <div className={`${classIs.col3} border-end centers2`}></div>
                    <div className={`${classIs.col4} border-end centers2`}></div>
                    <div className={`${classIs.col5} border-end ends2 pe-1`}>{result?.mainTotal.diamonds?.Wt?.toFixed(3)}</div>
                    <div className={`${classIs.col6} border-end centers2`}></div>
                    <div className={`${classIs.col7} border-end ends2 pe-1`}>{formatAmount(result?.mainTotal?.diamonds?.Amount)}</div>
                    <div className={`${classIs.col8} border-end ends2 pe-1`}>{result?.mainTotal?.grosswt?.toFixed(3)}</div>
                    {hsnetwt ? <div className={`${classIs.col9} border-end ends2 pe-1`}>{result?.mainTotal?.netwt?.toFixed(3)}</div> : ''}
                    <div className={`${classIs.col10} border-end ends2 pe-1`}>
                      {formatAmount((result?.mainTotal?.diamonds?.SettingAmount +
                        result?.mainTotal?.colorstone?.SettingAmount +
                        result?.mainTotal?.total_other +
                        result?.mainTotal?.total_diamondHandling +
                        result?.mainTotal?.total_Making_Amount +
                        result?.mainTotal?.totalMiscAmount +
                        result?.mainTotal?.finding?.SettingAmount -
                        result?.mainTotal?.finding?.SettingAmount
                      ))}</div>
                    <div className={`${classIs.col11} border-end ends2 pe-1`}>{formatAmount(result?.mainTotal?.total_csamount)}</div>
                    <div className={`${classIs.col12} border-end ends2 pe-1`}>{result?.mainTotal?.convertednetwt?.toFixed(3)}</div>
                    <div className={`${classIs.col13} border-end ends2 pe-1`}>{formatAmount(result?.mainTotal?.MetalAmount)}</div>
                    <div className={`${classIs.col14} ends2 pe-1`} style={{ width: `${hsnetwt ? '' : '14%'}` }}>{formatAmount(result?.mainTotal?.total_amount)}</div>
                  </div>
                </div>
                {/* tax part */}
                <div className="w-100 d-flex justify-content-end pbias2">
                  <div className=" p-2 border border-top-0 boxwtaxs2">
                    {
                      result?.allTaxes?.map((e, i) => {
                        return (
                          <div className="d-flex justify-content-between " key={i}><div className="w-50 d-flex justify-content-end">{e?.name} @ {e?.per}</div><div className="w-50 d-flex justify-content-end">{formatAmount((+e?.amount) * result?.header?.CurrencyExchRate)}</div></div>
                        )
                      })
                    }
                    <div className="d-flex justify-content-between "><div className="w-50 d-flex justify-content-start fw-bold" style={{ paddingLeft: '3px' }}>{result?.header?.AddLess > 0 ? 'Add' : result?.header?.AddLess < 0 ? 'Less' : ""}</div><div className="w-50 d-flex justify-content-end fw-bold">{result?.header?.AddLess !== 0 && result?.header?.AddLess}</div></div>
                  </div>
                </div>
                {/* grand total */}
                <div className="mt-2 border d-flex justify-content-between p-1 bgcs2 pbias2 fsh2_s2">
                  <div>Gold in 24K : <b className="fsgs2">{result?.mainTotal?.convertednetwt?.toFixed(3)}</b></div>
                  <div className="fw-bold">TOTAL IN  {currencyData?.localcurrencysymbol || ""} : {formatAmount((result?.mainTotal?.total_amount + result?.header?.AddLess + (result?.allTaxesTotal * result?.header?.CurrencyExchRate)) ,2 )}</div>
                </div>
                {/* in words */}
                <div className="mt-2 border d-flex justify-content-between p-1 bgcs2 pbias2 fsh2_s2">
                     <div className="fw-bold">{toWords?.convert(+((result?.mainTotal?.total_amount + result?.header?.AddLess + (result?.allTaxesTotal * result?.header?.CurrencyExchRate))*(currencyData?.currencyrate ?? result?.header?.CurrencyExchRate ?? 1) ).toFixed(2)) + " Only"}</div>
                  <div className="fw-bold">TOTAL  :  {currencyData?.currencysymbol || ""} {formatAmount((result?.mainTotal?.total_amount + result?.header?.AddLess + (result?.allTaxesTotal * result?.header?.CurrencyExchRate))*(currencyData?.currencyrate ?? result?.header?.CurrencyExchRate ?? 1) ,2 )} </div>
                </div>
                {/* summary */}
                <div className="border mt-2 pbias2 fsh2_s2">
                  <div className="fw-bold bgcs2 p-1 d-flex flex-wrap" >Summary Detail</div>
                  <div className="d-flex flex-wrap p-1" style={{ minHeight: "50px", flexDirection: 'column' }}>
                    {
                      categoryNameWise?.map((e, i) => {
                        return (
                          <div className="w-25" key={i}>
                            <div className="fsh2_s2">{e?.Categoryname}	 : 	<b className="fsh2_s2">{e?.Quantity}</b></div>
                          </div>
                        )
                      })
                    }
                  </div>

                </div>

                {footerflag && (
                  <>
                    <div className="border mt-2 pbias2 fsh2_s2">
                      <div className="fw-bold p-2 pt-3 ps-1" style={{ fontSize: '16px' }}>NOTE:</div>
                      <div className="p-1 fsh2_s2 danger_s2" dangerouslySetInnerHTML={{ __html: result?.header?.Declaration }}></div>
                    </div>
                    {/* remarks */}
                    {result?.header?.PrintRemark !== "" && (<div className="py-1 pbias2 fsh2_s2"><b className="fsgs2 fsh2_s2">REMARKS :</b> <span dangerouslySetInnerHTML={{ __html: result?.header?.PrintRemark }}></span></div>)}
                    {/* footer */}
                    {result?.header?.SalesRepPolicyTermsDescription !== "" && (<div className="py-1 pbias2 fsh2_s2"><span className="fw-bold">TERMS INCLUDED</span> : <span dangerouslySetInnerHTML={{ __html: result?.header?.SalesRepPolicyTermsDescription }}></span></div>)}
                    <div className="d-flex border mt-1 fw-bold pbias2 fsh2_s2" style={{ height: "5rem" }}>
                      <div className="w-50 d-flex justify-content-center align-items-end border-end fsh2_s2">RECEIVER'S SIGNATURE & SEAL</div>
                      <div className="w-50 d-flex justify-content-center align-items-end fsh2_s2">for,Classmate corporation Pvt Ltd</div>
                    </div>
                  </>
                )}
                {/* notes  */}


              </div>
            </>
          ) : (
            <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto fsh2_s2">
              {msg}
            </p>
          )}
        </>
      )}
    </>
  );
};

export default Summary2;
