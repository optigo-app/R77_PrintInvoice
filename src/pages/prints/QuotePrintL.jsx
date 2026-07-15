import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { apiCall, checkMsg, formatAmount, handleImageError,  isObjectEmpty, NumberWithCommas ,  mergeMetals,
  mergeFindings} from '../../GlobalFunctions';
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import Loader from '../../components/Loader';
import "../../assets/css/prints/quoteprintl.css";
import { cloneDeep } from 'lodash';

const QuotePrintL = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const [headerFlag, setHeaderFlag] = useState(true);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const [cateName, setCateName] = useState([]);
  const [printWithPrice, setPrintWithPrice] = useState(true);
  const [mainTotal, setMainTotal] = useState();
  const [otherMetal, setOtherMetal] = useState([]);
  const [goldNetWt, setGoldNetWt] = useState(0);
  const [goldAmount, setGoldAmount] = useState(0);

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
        console.log(error);
      }
    };
    sendData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = (data) => {

      let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
      data.BillPrint_Json[0].address = address;
 
      const datas = OrganizeDataPrint(
        data?.BillPrint_Json[0],
        data?.BillPrint_Json1,
        data?.BillPrint_Json2
      );
      let catNameWise = [];
      datas?.resultArray?.forEach((a) => {
        let b = cloneDeep(a);
            b.Count = 1;        
        let findrec = catNameWise?.findIndex((al) => al?.Categoryname === b?.Categoryname);
        if(findrec === -1){
          catNameWise.push(b);
        }else{
          catNameWise[findrec].Count += 1;
        }

      })

      let totalObj = {
        diamond_pcs : 0,
        diamond_wt : 0,
        diamond_Amt : 0,
        colorstone_Amt : 0,
        colorstone_wt : 0,
        colorstone_pcs : 0,
        metal_wt : 0,
        metal_netwt : 0,
        metal_Amt : 0,
        otherAmt:0,
        labourRate:0,
        labourAmt:0,
        totalAmt:0,
      }

      datas?.resultArray?.forEach((a) => {
        a?.diamonds?.forEach((al) => {
          totalObj.diamond_pcs += (al?.Pcs * a?.Quantity)
          totalObj.diamond_wt += (al?.Wt * a?.Quantity)
          totalObj.diamond_Amt += (al?.Amount * a?.Quantity)
        })
        a?.colorstone?.forEach((al) => {
          totalObj.colorstone_pcs += (al?.Pcs * a?.Quantity)
          totalObj.colorstone_wt += (al?.Wt * a?.Quantity)
          totalObj.colorstone_Amt += (al?.Amount * a?.Quantity)
        })
        a?.metal?.forEach((al) => {
          totalObj.metal_wt += ((((a?.NetWt + a?.LossWt) * a?.Quantity) + ((a?.totals?.diamonds?.Wt / 5) * a?.Quantity)) )
          totalObj.metal_netwt += (al?.Wt * a?.Quantity)
          totalObj.metal_Amt += (al?.Amount * a?.Quantity)
        })
        a?.finding?.forEach((al) => {
          totalObj.metal_wt += ((((a?.NetWt + a?.LossWt) * a?.Quantity) + ((a?.totals?.diamonds?.Wt / 5) * a?.Quantity)) )
          totalObj.metal_netwt += (al?.Wt * a?.Quantity)
          totalObj.metal_Amt += (al?.Amount * a?.Quantity)
        })
        totalObj.otherAmt += ((a?.OtherCharges + a?.MiscAmount + a?.TotalDiamondHandling) * a?.Quantity)
        // totalObj.labourAmt+= ((a?.MakingAmount + a?.totals?.diamonds?.SettingAmount + a?.totals?.colorstone?.SettingAmount) * a?.Quantity)
        totalObj.labourAmt+= ((a?.MakingAmount) * a?.Quantity)
        totalObj.labourRate+= a?.MaKingCharge_Unit;
      })

      setCateName(catNameWise);
      setMainTotal(totalObj);

      setResult(datas);
      let other_metal = [];

      datas?.resultArray?.forEach((e) => {
        let b = cloneDeep(e);
        let findrec = other_metal?.findIndex((el) => (b?.MetalTypePurity)?.toLowerCase() === (el?.MetalTypePurity)?.toLowerCase())
        if(findrec === -1){
          other_metal.push(b);
        }else{
          other_metal[findrec].convertednetwt += b?.convertednetwt;
          other_metal[findrec].MetalAmount += b?.MetalAmount;
          other_metal[findrec].Quantity += b?.Quantity;
        }
      })

      other_metal?.sort((a, b) => a?.MetalTypePurity.localeCompare(b?.MetalTypePurity))

      let gold_purewt = 0;
      let gold_amount = 0;

      other_metal?.forEach((a) => {
        if(a?.MetalType?.toLowerCase() === 'gold'){
          gold_purewt += a?.convertednetwt;
          gold_amount += (a?.MetalAmount * a?.Quantity);
        }
      })

      setGoldNetWt(gold_purewt);
      setGoldAmount(gold_amount);
      setOtherMetal(other_metal)

  }

  const handleCheckbox = () => {
    if(headerFlag){
      setHeaderFlag(false);
    }else{
      setHeaderFlag(true);
    }
  };

  const handleImageErrors = () => {
    setIsImageWorking(false);
  };

  const handlePrintWithPrice = () => {
    setPrintWithPrice(true);
    setTimeout(() => {
      window.print();
    },0)
  }

  const handlePrintWithOutPrice = () => {
    setPrintWithPrice(false);
    setTimeout(() => {
      window.print();
    },0)
    
  }
  
  console.log("TCL: result ", result)

  return (
    <>
    { loader ? <Loader /> : msg === '' ? <div className="containerdp10 pab60_dp10">
                <div className="d-flex justify-content-end align-items-center hidebtndp10 mb-4">
                  { atob(printName)?.toLowerCase() === 'print (l)' ? '' : <div  className="d-flex justify-content-end align-items-center">
                    <input type="checkbox" id="imghideshow" className="mx-1" checked={headerFlag} onChange={handleCheckbox} />
                    <label htmlFor="imghideshow" className="me-3 user-select-none fs-6">
                      With Header
                    </label>
                  </div>}
                  <button className="btn_white blue mb-0 hidedp10 m-0 p-2 me-2 maroon_qlp" onClick={(e) => handlePrintWithOutPrice(e)} >
                    Print WithOut Price
                  </button>
                  <button className="btn_white blue mb-0 hidedp10 m-0 p-2" onClick={(e) => handlePrintWithPrice(e)} >
                    Print With Price
                  </button>
                </div>
                {/* header */}
                <div>
                  <div className="pheaddp10">
                    {result?.header?.PrintHeadLabel === '' ? 'QUOTATION' : result?.header?.PrintHeadLabel}
                  </div>
                  {
                    headerFlag ? <div className="d-flex justify-content-between">
                    <div className="p-1 fsgdp10">
                      <div className="fw-bold fs-6 pb-1 fs_3_qlp">
                        {result?.header?.CompanyFullName}
                      </div>
                      <div>{result?.header?.CompanyAddress}</div>
                      <div>{result?.header?.CompanyAddress2}</div>
                      <div>
                        {result?.header?.CompanyCity}- {result?.header?.CompanyPinCode},{" "}
                        {result?.header?.CompanyState}(
                        {result?.header?.CompanyCountry})
                      </div>
                      <div>T {result?.header?.CompanyTellNo}</div>
                      <div>
                        {result?.header?.CompanyEmail} |{" "}
                        {result?.header?.CompanyWebsite}
                      </div>
                      <div>
                        {result?.header?.Company_VAT_GST_No} |{" "}
                        {result?.header?.Company_CST_STATE}-
                        {result?.header?.Company_CST_STATE_No} | PAN-
                        {result?.header?.Pannumber}
                      </div>
                    </div>
                    <div className="d-flex justify-content-end pe-2 pt-2">
                    {isImageWorking && (result?.header?.PrintLogo !== "" && 
                      <img src={result?.header?.PrintLogo} alt="" 
                      className='w-100 h-auto ms-auto d-block object-fit-contain'
                      onError={handleImageErrors} height={120} width={150} style={{maxWidth: "116px"}} />)}
                      {/* <img
                        src={result?.header?.PrintLogo}
                        alt="#companylogo"
                        className="imgHWdp10"
                      /> */}
                    </div>
                  </div> : ''
                  }
                </div>
                {/* subheader */}
                <div className="subheaderdp10">
                  <div className="subdiv1dp10 border-end fsgdp10 border-start ">
                    <div className="px-1">Quote To,</div>
                    <div className="px-1 fw-bold fs_cust_name_qpl">
                      {result?.header?.customerfirmname}
                    </div>
                    <div className="px-1">
                      {result?.header?.customerAddress2}
                    </div>
                    <div className="px-1">
                      {result?.header?.customerAddress1}
                    </div>
                    <div className="px-1">
                      {result?.header?.customerAddress3}
                    </div>
                    <div className="px-1">
                      {result?.header?.customercity1}-{result?.header?.PinCode}
                    </div>
                    <div className="px-1">{result?.header?.customeremail1}</div>
                    <div className="px-1"> {result?.header?.vat_cst_pan.length !=0 ? "GSTIN - "+result?.header?.vat_cst_pan : ""}</div>
                    <div className="px-1"> {  result?.header?.Cust_CST_STATE_No.length !=0 ?  result?.header?.Cust_CST_STATE +"-"+ result?.header?.Cust_CST_STATE_No : ""} </div>
                  </div>
                  <div className="subdiv2dp10 border-end fsgdp10">
                    {/* <div className="px-1">Ship To,</div> */}
                    <div className="px-1 fw-bold fs_cust_name_qpl">
                      {result?.header?.customerfirmname}
                    </div>
                    <div className='d-flex flex-column'>
                    {result?.header?.address?.map((address, index) => (
                      <div className="px-1" key={index}>
                        {address?.split('\n').map((line, lineIndex) => (
                          <div key={lineIndex}>{line}</div>
                        ))}
                      </div>
                    ))}
                    {/* {result?.header?.address?.map((e, i) => {
                      return (
                        <div className="px-1" key={i}>
                          {e}
                        </div>
                      );
                    })} */}
                    </div>
                  </div>
                  <div className="subdiv3dp10 fsgdp10 border-end">
                    <div className="d-flex justify-content-start px-1">
                      <div className="w-25 fw-bold">QUOTE NO</div>
                      <div className="w-25">{result?.header?.InvoiceNo}</div>
                    </div>
                    <div className="d-flex justify-content-start px-1">
                      <div className="w-25 fw-bold">DATE</div>
                      <div className="w-25">{result?.header?.EntryDate}</div>
                    </div>
                    <div className="d-flex justify-content-start px-1">
                      <div className="w-25 fw-bold">
                        {result?.header?.HSN_No_Label}
                      </div>
                      <div className="w-25">{result?.header?.HSN_No}</div>
                    </div>
                    {/* <div className="d-flex justify-content-end mt-5 px-2 fw-bold">
                      Gold Rate {result?.header?.MetalRate24K?.toFixed(2)} Per
                      Gram
                    </div> */}
                  </div>
                </div>
                {/* table */}

                <div className="tabledp10">
                  {/* tablehead */}
                  <div className="theaddp10 fw-bold fsg2dp10" style={{backgroundColor:'#F5F5F5'}}>
                    <div className="col1dp10 centerdp10 ">Sr</div>
                    <div className="col2dp10 centerdp10  fw-bold">Design</div>
                    <div className="col3dp10">
                      <div className="h-50 centerdp10 fw-bold w-100">
                        Diamond
                      </div>
                      <div className="d-flex justify-content-between align-items-center h-50 bt_dp10 w-100">
                        <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10">
                          Code
                        </div>
                        <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10">
                          Size
                        </div>
                        <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10" style={{ width: "8.66%" }}>
                          Pcs
                        </div>
                        <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10">
                          Wt
                        </div>
                        <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10" style={{width:'19.66%'}}>
                          Rate
                        </div>
                        <div className="centerdp10 h-100 theadsubcol1_dp10" style={{ width: "21.66%" }} >
                          Amount
                        </div>
                      </div>
                    </div>
                    <div className="col4dp10 ">
                      <div className="h-50 centerdp10 fw-bold w-100">Metal</div>
                      <div className="d-flex justify-content-between align-items-center h-50 bt_dp10 w-100">
                        <div className="theadsubcol2_dp10 bright_dp10 h-100 centerdp10" >
                          Quality
                        </div>
                        <div className="theadsubcol2_dp10 centerdp10 bright_dp10 h-100" style={{width:'18%'}}>
                          *Wt
                        </div>
                        <div className="theadsubcol2_dp10 centerdp10 bright_dp10 h-100" style={{width:'19%'}}>
                          Net Wt
                        </div>
                        <div className="theadsubcol2_dp10 centerdp10 bright_dp10 h-100">
                          Rate
                        </div>
                        <div className="theadsubcol2_dp10 centerdp10 h-100" style={{width:'23%'}}>
                          Amount
                        </div>
                      </div>
                    </div>
                    <div className="col3dp10">
                      <div className="h-50 centerdp10 fw-bold w-100">Stone</div>
                      <div className="d-flex justify-content-between align-items-center h-50 bt_dp10 w-100">
                        <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10" style={{width:'21.66%'}}>
                          Code
                        </div>
                        <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10 ">
                          Size
                        </div>
                        <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10" style={{width:'11.66%'}}>
                          Pcs
                        </div>
                        <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10">
                          Wt
                        </div>
                        <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10">
                          Rate
                        </div>
                        <div className="centerdp10 h-100 theadsubcol1_dp10">
                          Amount
                        </div>
                      </div>
                    </div>
                    <div className="col6dp10">
                      <div className="d-flex justify-content-center align-items-center h-50 w-100 ">
                        Other
                      </div>
                      <div className="d-flex justify-content-center align-items-center h-50 w-100 bt_dp10">
                        Amount
                      </div>
                    </div>
                    <div className="col7dp10">
                      <div className="h-50 centerdp10 fw-bold w-100">
                        Labour
                      </div>
                      <div className="d-flex justify-content-between align-items-center h-50 bt_dp10  w-100">
                        <div className=" h-100 centerdp10 bright_dp10" style={{width:'40%'}}>
                          Rate
                        </div>
                        <div className=" h-100 centerdp10" style={{width:'60%'}}>Amount</div>
                      </div>
                    </div>
                    <div className="col8dp10">
                      <div className="d-flex justify-content-center align-items-center h-50 border-top w-100">
                        Total
                      </div>
                      <div className="d-flex justify-content-center align-items-center h-50 w-100">
                        Amount
                      </div>
                    </div>
                  </div>
                  {/* table body */}
                  <div className="tbodydp10 fsgdp10 ">
                    {result?.resultArray?.map((e, i) => {

                      const mergedMetals = mergeMetals(e?.metal);
                      const mergedFindings = mergeFindings(e?.finding);

                      return (
                        <div className="tbrowdp10 h-100 " key={i}>
                          <div className="tbcol1dp10 center_sdp10">
                            {i + 1}
                          </div>
                          <div className="tbcol2dp10 d-flex flex-column justify-content-between">
                            <div className="d-flex justify-content-between px-1 flex-wrap">
                              <div className="fsgdp10">{e?.designno}</div>
                              <div className="fsgdp10">{e?.MetalColor}</div>
                            </div>
                            {/* <div className="d-flex justify-content-end px-1">
                              {e?.MetalColor}
                            </div> */}
                            
                              <div className="w-100 d-flex justify-content-center align-items-center " style={{ minHeight: "80px" }} >
                                <img src={e?.DesignImage} onError={(e) => handleImageError(e)} alt="design" className="imgdp10" />
                              </div>
                           

                           
                            <div className="centerdp10 text-break">
                              G Wt &nbsp; 
                              <b className="fsgdp10">
                                {( (e?.grosswt * e?.Quantity))?.toFixed(3)} gm
                              </b>
                              &nbsp; 
                            </div>
                            <div className="centerdp10">
                              {e?.Size === "" ? "" : `Size : ${e?.Size}`}
                            </div>
                            <div className="centerdp10">
                              {e?.Quantity === 0 ? "" : `Qty : ${e?.Quantity}`}
                            </div>
                          </div>
                          <div className="tbcol3dp10 d-flex flex-column justify-content-between">
                            <div>
                            {e?.diamonds?.map((el, idia) => {
                              return (
                                <div className="d-flex" key={idia}>
                                  <div className="theadsubcol1_dp10 " style={{wordBreak:'break-word',paddingLeft:'2px'}}>
                                     {el?.MaterialTypeName} {el?.ShapeName} {el?.QualityName}&nbsp;
                                    {el?.Colorname}
                                  </div>
                                  <div className="theadsubcol1_dp10 text-start" style={{lineHeight:'8px !important'}}>
                                    {el?.SizeName}
                                  </div>
                                  <div className="theadsubcol1_dp10 d-flex align-items-start justify-content-center" style={{ width: "8.66%" }} >
                                    {el?.Pcs * e?.Quantity}
                                  </div>
                                  <div className="theadsubcol1_dp10 end_dp10">
                                    {(el?.Wt * e?.Quantity)?.toFixed(3)}
                                  </div>
                                  <div className="theadsubcol1_dp10 end_dp10" style={{width:'19.66%'}}>
                                    { printWithPrice && formatAmount((el?.Rate))}
                                  </div>
                                  <div className="theadsubcol1_dp10 fw-bold end_dp10 pr_dp10" style={{ width: "21.66%" }} >
                                    { printWithPrice && formatAmount((el?.Amount * e?.Quantity))}
                                  </div>
                                </div>
                              );
                            })}
                            </div>
                             <div className="d-flex  bgc_dp10 bt_dp10 fw-bold" >
                                  <div className="theadsubcol1_dp10" style={{wordBreak:'break-word',paddingLeft:'2px'}}> </div>
                                  <div className="theadsubcol1_dp10 text-start" style={{lineHeight:'8px !important'}}> </div>
                                  <div className="theadsubcol1_dp10 d-flex align-items-start justify-content-center" style={{ width: "8.66%" }} >
                                    {(e?.totals?.diamonds?.Pcs * e?.Quantity) === 0 ? <>&nbsp;</> :  e?.totals?.diamonds?.Pcs * e?.Quantity } 
                                  </div>
                                  <div className="theadsubcol1_dp10 end_dp10">
                                    { e?.totals?.diamonds?.Wt * e?.Quantity === 0 ? '' : (e?.totals?.diamonds?.Wt * e?.Quantity)?.toFixed(3)}
                                  </div>
                                  <div className="theadsubcol1_dp10 end_dp10" style={{width:'19.66%'}}> </div>
                                  <div className="theadsubcol1_dp10 fw-bold end_dp10 pr_dp10" style={{ width: "21.66%" }} >
                                    { printWithPrice && ((e?.totals?.diamonds?.Amount * e?.Quantity) === 0 ? '' :  formatAmount((e?.totals?.diamonds?.Amount * e?.Quantity)))}
                                  </div>
                                </div>
                          </div>
                          <div className="tbcol4dp10 d-flex flex-column justify-content-between">
                            <div>
                            {mergedMetals?.map((el, imet) => {
                              return (
                                <div className="d-flex w-100" key={imet}>
                                  <div className="theadsubcol2_dp10 d-flex justify-content-start border-end h-100 ps-1 border-end-0" style={{ wordBreak:'break-word' }} >
                                    {el?.ShapeName} {el?.QualityName}
                                  </div>
                                  <div className="theadsubcol2_dp10 centerdp10 border-end h-100 pr_dp10 border-end-0 end_dp10" style={{width:'18%'}}>
                                     { el?.IsPrimaryMetal == 1 && ((((e?.NetWt + e?.LossWt) * e?.Quantity) + ((e?.totals?.diamonds?.Wt / 5) * e?.Quantity)) )?.toFixed(3)}
                                  </div>
                                  <div className="theadsubcol2_dp10 centerdp10 border-end h-100 pr_dp10 border-end-0 end_dp10" style={{width:'19%'}}>
                                    {(el?.Wt * e?.Quantity)?.toFixed(3)}
                                  </div>
                                  <div className="theadsubcol2_dp10 centerdp10 border-end h-100 pr_dp10 border-end-0 end_dp10">
                                    { printWithPrice && formatAmount((el?.Rate)/ result?.header?.CurrencyExchRate)}
                                  </div>
                                  <div className={`theadsubcol2_dp10 centerdp10 border-end h-100  border-end-0 end_dp10 pr_dp10 ${el?.IsPrimaryMetal === 1 ? 'fw-bold' : 'fw-bold' }`} style={{width:'23%'}}>
                                    { printWithPrice && formatAmount((el?.Amount * e?.Quantity)/ result?.header?.CurrencyExchRate)}
                                  </div>
                                </div>
                              );
                            })}
                            {
                               mergedFindings?.map((el, il) => {
                                return (
                                  <div className="d-flex w-100" key={il}>
                                  <div className="theadsubcol2_dp10 d-flex justify-content-start border-end h-100 ps-1 border-end-0 text-break" style={{ wordBreak:'break-word' }} >
                                    {el?.ShapeName} {el?.QualityName}
                                  </div>
                                  <div className="theadsubcol2_dp10 centerdp10 border-end h-100 pr_dp10 border-end-0 end_dp10" style={{width:'18%'}}>
                                    {/* {((((e?.NetWt + e?.LossWt) * e?.Quantity) + ((e?.totals?.diamonds?.Wt / 5) * e?.Quantity)) )?.toFixed(3)} */}
                                    {/* {(((e?.totals?.diamonds?.Wt / 5) + el?.Wt) * e?.Quantity)?.toFixed(3)} */}
                                  </div>
                                  <div className="theadsubcol2_dp10 centerdp10 border-end h-100 pr_dp10 border-end-0 end_dp10" style={{width:'19%'}}>
                                    {/* {(e?.NetWt + e?.LossWt)?.toFixed(3)} */}
                                    {(el?.Wt * e?.Quantity)?.toFixed(3)}
                                  </div>
                                  <div className="theadsubcol2_dp10 centerdp10 border-end h-100 pr_dp10 border-end-0 end_dp10">
                                    { printWithPrice && formatAmount((el?.Rate)/ result?.header?.CurrencyExchRate)}
                                  </div>
                                  <div className={`theadsubcol2_dp10 centerdp10 border-end h-100  border-end-0 end_dp10 pr_dp10 ${el?.IsPrimaryMetal === 1 ? 'fw-bold' : 'fw-bold' }`} style={{width:'23%'}}>
                                    { printWithPrice && formatAmount((el?.Amount * e?.Quantity)/ result?.header?.CurrencyExchRate)}
                                  </div>
                                </div>
                                )
                              })
                            }
                            <div className="p-2 px-1">
                              {e?.JobRemark !== "" ? (
                                <>
                                  <b className="fsgdp10">Remark : </b>{" "}
                                  <div>{e?.JobRemark}</div>
                                </>
                              ) : (
                                ""
                              )}{" "}
                            </div>
                            </div>
                            <div className='d-flex end_dp10  bgc_dp10 bt_dp10 fw-bold'>
                              <div className='end_dp10' style={{width:'39%'}}>{(e?.grosswt * e?.Quantity)?.toFixed(3)}</div>
                              <div className='end_dp10' style={{width:'20%'}}> {((e?.totals?.metal?.IsPrimaryMetal + e?.totals?.finding?.Wt)* e?.Quantity)?.toFixed(3)}</div>
                              {/* <div className='end_dp10 pr_dp10' style={{width:'41%'}}>{ printWithPrice && formatAmount((((e?.totals?.metal?.IsPrimaryMetal_Amount * e?.Quantity) + (e?.totals?.finding?.Amount * e?.Quantity))/ result?.header?.CurrencyExchRate))}</div> */}
                              <div className='end_dp10 pr_dp10' style={{width:'41%'}}>{e?.totals?.metal?.Amount !== 0 &&
                                                                                            formatAmount(
                                                                                             ( (e?.totals?.metal?.Amount + e?.totals?.finding?.Amount) * e?.Quantity) /
                                                                                              result?.header?.CurrencyExchRate
                                                                                           ,2 )}</div>
                            </div>
                          </div>
                          <div className="tbcol3dp10 d-flex flex-column justify-content-between">
                            <div>

                            
                            {e?.colorstone?.map((el, ics) => {
                              return (
                                <div className="d-flex" key={ics}>
                                  <div className="theadsubcol1_dp10 " style={{wordBreak:'break-word', paddingLeft:'2px', width:'21.66%'}}>
                                    { el?.MaterialTypeName + " " + el?.ShapeName + " " + el?.QualityName + " " + el?.Colorname} </div>
                                  <div className="theadsubcol1_dp10 text-center">
                                    {el?.SizeName}
                                  </div>
                                  <div className="theadsubcol1_dp10 d-flex align-items-start justify-content-center" style={{width:'11.66%'}}>
                                    {(el?.Pcs * e?.Quantity)}
                                  </div>
                                  <div className="theadsubcol1_dp10 end_dp10">
                                    {(el?.Wt * e?.Quantity)?.toFixed(3)}
                                  </div>
                                  <div className="theadsubcol1_dp10 end_dp10">
                                    { printWithPrice && formatAmount((el?.Rate))}
                                  </div>
                                  <div className="theadsubcol1_dp10 end_dp10 fw-bold pr_dp10">
                                    { printWithPrice && formatAmount((el?.Amount * e?.Quantity))}
                                  </div>
                                </div>
                              );
                            })}
                            </div>
                             
                            
                              <div className="d-flex bgc_dp10 bt_dp10 fw-bold">
                                  <div className="theadsubcol1_dp10" style={{wordBreak:'break-word', paddingLeft:'2px', width:'21.66%'}}> </div>
                                  <div className="theadsubcol1_dp10 text-center"> </div>
                                  <div className="theadsubcol1_dp10 d-flex align-items-start justify-content-center" style={{width:'11.66%'}}>
                                    { (e?.totals?.colorstone?.Pcs * e?.Quantity) === 0 ? <>&nbsp;</> : <>{(e?.totals?.colorstone?.Pcs * e?.Quantity)}</>}
                                  </div>
                                  <div className="theadsubcol1_dp10 end_dp10">
                                  { (e?.totals?.colorstone?.Wt * e?.Quantity) === 0 ? '' : <>{(e?.totals?.colorstone?.Wt * e?.Quantity)?.toFixed(3)}</>}
                                  </div>
                                  <div className="theadsubcol1_dp10 end_dp10"> </div>
                                  <div className="theadsubcol1_dp10 end_dp10 fw-bold pr_dp10">
                                  { (e?.totals?.colorstone?.Amount * e?.Quantity) === 0 ? '' : <>{ printWithPrice && formatAmount((e?.totals?.colorstone?.Amount * e?.Quantity))}</>}
                                  </div>
                              </div>
                          </div>
                          <div className="tbcol6dp10 p-1 pr_dp10 d-flex flex-column justify-content-between">
                             <div className='w-100 end_dp10 '>
                             {  ( printWithPrice && formatAmount( ((e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling) * e?.Quantity)))}
                             </div>
                             <div className='w-100 end_dp10  bgc_dp10 bt_dp10 fw-bold'>
                             &nbsp;{  ((e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling) * e?.Quantity) === 0 ? '' : ( printWithPrice && formatAmount( ((e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling) * e?.Quantity))) }
                             </div>
                          </div>
                          <div className="tbcol7dp10 d-flex  flex-column justify-content-between ">
                            <div className="d-flex">
                              <div className=" end_dp10 pr_dp10" style={{width:'40%'}}>
                                { (printWithPrice && formatAmount((e?.MaKingCharge_Unit)))}
                              </div>
                              <div className=" end_dp10  pr_dp10" style={{width:'60%'}}>
                                { printWithPrice && (((e?.MakingAmount ) * e?.Quantity)) === 0 ? <>&nbsp;</> : ( printWithPrice && formatAmount( (((e?.MakingAmount) * e?.Quantity))/ result?.header?.CurrencyExchRate) )}
                              </div>
                            </div>
                            <div className="d-flex  bgc_dp10 bt_dp10 fw-bold">
                              <div className=" end_dp10 pr_dp10">
                                {/* { printWithPrice && formatAmount(e?.MaKingCharge_Unit)} */}
                              </div>
                              <div className=" end_dp10  pr_dp10 w-100 ">
                                &nbsp;{ printWithPrice &&  (((e?.MakingAmount ) * e?.Quantity)) === 0 ? <>&nbsp;</> : ( printWithPrice && formatAmount( (((e?.MakingAmount ) * e?.Quantity))/ result?.header?.CurrencyExchRate) )}
                              </div>
                            </div>
                          </div>
                          <div className="tbcol8dp10 fw-bold p-1 pad_top_dp10 pr_dp10 d-flex flex-column justify-content-between align-items-end">
                            <div className='w-100 end_dp10 '>
                            { printWithPrice && ( formatAmount((e?.TotalAmount)/ result?.header?.CurrencyExchRate))}
                            </div>
                            <div className='w-100 end_dp10  bgc_dp10 bt_dp10'>
                            &nbsp;{ printWithPrice &&  e?.TotalAmount === 0 ? <>&nbsp;</> :  ( printWithPrice && formatAmount((e?.TotalAmount)/ result?.header?.CurrencyExchRate))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* final total */}
                  {
                    printWithPrice && <div className="d-flex justify-content-end align-items-center brb_dp10 tbrowdp10 pt-1">
                    <div style={{ width: "13%" }}>
                     
                      <div>
                        {result?.allTaxes?.map((e, i) => {
                          return (
                            <div className="d-flex justify-content-between" key={i} >
                              <div className="w-50 end_dp10">
                                {e?.name} {e?.per}
                              </div>
                              <div className="w-50 end_dp10 pr_dp10">
                                {formatAmount((e?.amountInNumber))}
                              </div>
                            </div>
                          );
                        })}
                        <div className="d-flex justify-content-between">
                          <div className="w-50 end_dp10">
                            {result?.header?.AddLess > 0 ? "Add" : "Less"}
                          </div>
                          <div className="w-50 end_dp10 pr_dp10">
                            {formatAmount((result?.header?.AddLess)/ result?.header?.CurrencyExchRate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  }
                  {/* all table row total */}
                  <div className="d-flex grandtotaldp10 brb_dp10 brbb_dp10 tbrowdp10" style={{ backgroundColor: "#F5F5F5" }} >
                    <div className="centerdp10 brR_dp10 fsg2dp10" style={{ width: "10%" }} > Total </div>
                    <div className="col3dp10 d-flex align-items-center brR_dp10 justify-content-end">
                      {/* <div className="theadsubcol1_dp10"></div> */}
                      {/* <div className="theadsubcol1_dp10"></div> */}
                      {/* <div className="theadsubcol1_dp10 end_dp10"> */}
                      <div className=" end_dp10 fsg2dp10" style={{width:'19%'}}>
                        {mainTotal?.diamond_pcs}
                      </div>
                      {/* <div className="theadsubcol1_dp10 end_dp10" style={{width:'20%'}}> */}
                      <div className=" end_dp10 fsg2dp10"  style={{width:'20%'}}>
                        {mainTotal?.diamond_wt?.toFixed(3)}
                      </div>
                      {/* <div className="theadsubcol1_dp10"></div> */}
                      <div className="theadsubcol1_dp10 end_dp10 pr_dp10 fsg2dp10" style={{width:'42%'}} >
                        { printWithPrice && formatAmount((mainTotal?.diamond_Amt))}
                      </div>
                    </div>
                    <div className="col4dp10 d-flex align-items-center brR_dp10 justify-content-end">
                      {/* <div className="theadsubcol2_dp10" ></div> */}
                       <div className="theadsubcol2_dp10 pr_dp10 fsg2dp10" style={{width:'19%'}}>
                        {/* {(result?.mainTotal?.netwtWithLossWt * result?.mainTotal?.total_Quantity)?.toFixed(3)} */}
                        {result?.mainTotal?.grosswt?.toFixed(3) }
                      </div>
                       <div className="theadsubcol2_dp10 pr_dp10 fsg2dp10 end_dp10" style={{width:'18%'}}>
                        {/* {result?.mainTotal?.netwtWithLossWt?.toFixed(3)} */}
                        {mainTotal?.metal_netwt?.toFixed(3)}
                      </div>
                      {/* <div className="theadsubcol2_dp10"></div> */}
                      <div className="theadsubcol2_dp10 end_dp10 pr_dp10 fsg2dp10" style={{ width: "40%" }} >
                        {/* { printWithPrice && formatAmount((mainTotal?.metal_Amt)/ result?.header?.CurrencyExchRate)} */}
                        { printWithPrice && formatAmount((mainTotal?.metal_Amt)/ result?.header?.CurrencyExchRate)}
                      </div>
                    </div>
                    <div className="col3dp10 d-flex align-items-center justify-content-end brR_dp10 fsg2dp10" style={{width:'25%'}}>
                      {/* <div className="theadsubcol1_dp10"></div>
                      <div className="theadsubcol1_dp10"></div> */}
                      <div className=" d-flex align-items-start justify-content-center fsg2dp10">
                        {mainTotal?.colorstone_pcs}
                      </div>
                      <div className=" end_dp10 fsg2dp10" style={{ width: "22.32%" }}>
                        {(mainTotal?.colorstone_wt)?.toFixed(3)}
                      </div>
                      {/* <div className=""></div> */}
                      {/* <div className=" end_dp10 pr_dp10 fsg2dp10" style={{ width: "27.32%" }} > */}
                      <div className=" end_dp10 pr_dp10 fsg2dp10" style={{ width: "30.32%" }} >
                        { printWithPrice && formatAmount((mainTotal?.colorstone_Amt))}
                      </div>
                    </div>
                    <div className="col6dp10 end_dp10  d-flex align-items-center brR_dp10 pr_dp10 fsg2dp10" style={{width:'5%', paddingRight:'1px'}}>
                      { printWithPrice && <>{mainTotal?.otherAmt?.length > 11 ? mainTotal?.otherAmt : formatAmount((mainTotal?.otherAmt))}</> }
                    </div>
                    <div className="col7dp10 end_dp10  d-flex align-items-center brR_dp10 pr_dp10 fsg2dp10" style={{width:'9%'}}>
                      {/* <div className='end_dp10 brR_dp10 h-100 pr_dp10 align-items-center' style={{width:'38%'}}>{ printWithPrice && formatAmount( (mainTotal?.labourRate))}</div> */}
                      <div className='end_dp10 pr_dp10 w-100' >{ printWithPrice && formatAmount( (mainTotal?.labourAmt)/ result?.header?.CurrencyExchRate)}</div>
                    </div>
                    <div className="col8dp10 end_dp10  d-flex align-items-center pr_dp10 fsg2dp10" style={{width:"6%"}}>
                    { printWithPrice && <div className='pe-1' dangerouslySetInnerHTML={{__html:result?.header?.Currencysymbol}}></div>} { printWithPrice && formatAmount((result?.mainTotal?.total_amount + (result?.allTaxesTotal * result?.header?.CurrencyExchRate) + (result?.header?.AddLess))/ result?.header?.CurrencyExchRate)}
                    </div>
                  </div>
                  </div>
                  {/* summary */}
                  <div className="d-flex justify-content-between mt-1 summarydp10">
                    <div style={{width:'60%', display:'flex'}}>
                      <div className={`d-flex flex-column w-50 ${ printWithPrice ? 'sumdp10' : 'sumdp10_2'}`}>
                        <div className="fw-bold bg_dp10 w-100 centerdp10  ball_dp10 fsg2dp10">
                          SUMMARY
                        </div>
                        <div className="d-flex w-100 fsgdp10">
                          
                          <div className={`${printWithPrice ? 'w-50' : 'w-100'} bright_dp10 bl_dp10`}>
                          <div className="d-flex justify-content-between px-1 fsg2dp10">
                              <div className="w-50 fw-bold fsg2dp10">GOLD IN 24KT</div>
                              <div className="w-50 end_dp10 pe-1"> {(goldNetWt * result?.mainTotal?.total_Quantity)?.toFixed(3)} gm </div>
                            </div>
                            {
                                otherMetal?.map((e, i) => {
                                  return (
                                    <React.Fragment key={i}>
                                    {
                                      e?.MetalType?.toLowerCase()  === 'gold' ? '' : <div className="d-flex justify-content-between px-1 fsg2dp10" key={i}>
                                      <div className="w-50 fw-bold fsg2dp10">{e?.MetalType}</div>
                                      <div className="w-50 end_dp10 fsg2dp10  pe-1">
                                        {e?.convertednetwt?.toFixed(3)} gm
                                      </div>
                                    </div>
                                    }
                                    </React.Fragment>
                                  )
                                })
                            }
                            
                            <div className="d-flex justify-content-between px-1 fsg2dp10">
                              <div className="w-50 fw-bold fsg2dp10">GROSS WT</div>
                              <div className="w-50 end_dp10 pe-1"> {(result?.mainTotal?.grosswt* result?.mainTotal?.total_Quantity)?.toFixed(3)} gm </div>
                            </div>
                            <div className="d-flex justify-content-between px-1 fsg2dp10">
                              <div className="w-50 fw-bold fsg2dp10">*(G + D) WT</div>
                              <div className="w-50 end_dp10 pe-1"> {((result?.mainTotal?.netwt + (result?.mainTotal?.diamonds?.Wt / 5)) * result?.mainTotal?.total_Quantity)?.toFixed(3)} gm </div>
                            </div>
                            <div className="d-flex justify-content-between px-1 fsg2dp10">
                              <div className="w-50 fw-bold fsg2dp10">NET WT</div>
                              <div className="w-50 end_dp10 pe-1"> {(result?.mainTotal?.netwt* result?.mainTotal?.total_Quantity)?.toFixed(3)} gm </div>
                              {/* <div className="w-50 end_dp10 pe-1"> {result?.mainTotal?.metal?.IsPrimaryMetal?.toFixed(3)} gm </div> */}
                            </div>
                            <div className="d-flex justify-content-between px-1 fsg2dp10">
                              <div className="w-50 fw-bold fsg2dp10">DIAMOND WT</div>
                              <div className="w-50 end_dp10 pe-1 fsg2dp10">
                                {result?.mainTotal?.diamonds?.Pcs} /{" "}
                                {result?.mainTotal?.diamonds?.Wt?.toFixed(3)} cts
                              </div>
                            </div>
                            <div className="d-flex justify-content-between px-1">
                              <div className="w-50 fw-bold fsg2dp10">STONE WT</div>
                              <div className="w-50 end_dp10 pe-1 fsg2dp10">
                                {result?.mainTotal?.colorstone?.Pcs} /{" "}
                                {result?.mainTotal?.colorstone?.Wt?.toFixed(3)}{" "}
                                cts
                              </div>
                            </div>
                          </div>
                          
                          {
                            printWithPrice && <div className="w-50 bright_dp10 ">
                              <div className="d-flex justify-content-between px-1">
                              <div className="w-50 fw-bold fsg2dp10">GOLD</div>
                              <div className="w-50 end_dp10 fsg2dp10">
                                {formatAmount(
                                  (goldAmount)/ result?.header?.CurrencyExchRate
                                )}
                              </div>
                            </div>
                              {
                                otherMetal?.map((e, i) => {
                                  return (
                                    <React.Fragment key={i}>
                                        {
                                          e?.MetalType?.toLowerCase() === 'gold' ? '' : 
                                          <div className="d-flex justify-content-between px-1" key={i}>
                                            <div className="w-50 fw-bold fsg2dp10">{e?.MetalType}</div>
                                            <div className="w-50 end_dp10 fsg2dp10">
                                              {formatAmount((e?.MetalAmount *e?.Quantity)/ result?.header?.CurrencyExchRate)}
                                            </div>
                                          </div>
                                        }
                                    </React.Fragment>
                                  )
                                })
                              }
                            {/* <div className="d-flex justify-content-between px-1">
                              <div className="w-50 fw-bold fsg2dp10">GOLD</div>
                              <div className="w-50 end_dp10 fsg2dp10">
                                {formatAmount(mainTotal?.metal_Amt)}
                              </div>
                            </div> */}
                            <div className="d-flex justify-content-between px-1">
                              <div className="w-50 fw-bold fsg2dp10">DIAMOND</div>
                              <div className="w-50 end_dp10 fsg2dp10">
                                {formatAmount(
                                  (mainTotal?.diamond_Amt)
                                )}
                              </div>
                            </div>
                            <div className="d-flex justify-content-between px-1">
                              <div className="w-50 fw-bold fsg2dp10">CST</div>
                              <div className="w-50 end_dp10 fsg2dp10">
                                {formatAmount(
                                  (mainTotal?.colorstone_Amt)
                                )}
                              </div>
                            </div>
                            <div className="d-flex justify-content-between px-1">
                              <div className="w-50 fw-bold fsg2dp10">MAKING </div>
                              <div className="w-50 end_dp10 fsg2dp10">
                                {formatAmount(
                                    (mainTotal?.labourAmt)/ result?.header?.CurrencyExchRate
                                )}
                              </div>
                            </div>
                            <div className="d-flex justify-content-between px-1">
                              <div className="w-50 fw-bold fsg2dp10">OTHER </div>
                              <div className="w-50 end_dp10 fsg2dp10">
                                {formatAmount((mainTotal?.otherAmt))}
                              </div>
                            </div>
                            <div className="d-flex justify-content-between px-1">
                              <div className="w-50 fw-bold fsg2dp10">
                                {result?.header?.AddLess > 0 ? "ADD" : "LESS"}
                              </div>
                              <div className="w-50 end_dp10 fsg2dp10">
                                {formatAmount((result?.header?.AddLess)/ result?.header?.CurrencyExchRate)}
                              </div>
                            </div>
                          </div>
                          }
                        </div>
                        <div className={`bg_dp10 h_bd10 ball_dp10 d-flex fsgdp10 `}>
                          <div className="w-50 h-100"></div>
                          {
                            printWithPrice && <div className="w-50 h-100 d-flex align-items-center bl_dp10">
                            <div className="fw-bold w-50 px-1 fsg2dp10">TOTAL</div>
                            <div className="w-50 end_dp10 px-1 fsg2dp10">
                                {formatAmount(((result?.mainTotal?.total_amount + (result?.allTaxesTotal * result?.header?.CurrencyExchRate) + (result?.header?.AddLess)))/ result?.header?.CurrencyExchRate)}
                            </div>
                          </div>
                          }
                        </div>
                      </div>
                      <div className='d-flex flex-column  w-25' >
                      <div className='fw-bold bg_dp10 w-100 centerdp10  ball_dp10 fsg2dp10'>SUMMARY</div>
                      <div className='bb_dp10'>
                        {
                          cateName?.map((a, ind) => {
                            return <div className='d-flex align-items-center w-100 fw-bold ' key={ind}>
                            <div className='w-75 bl_dp10 ps-1 fsg2dp10'>{a?.Categoryname}</div>
                            <div className='w-25 center_dp10 bright_dp10 fsg2dp10'>{a?.Count}</div>
                          </div>
                          })
                        }
                      </div>
                    </div>
                    </div>
                    
                    <div className="check_dp10 ball_dp10 d-flex justify-content-center align-items-end pb-1 fsgdp10 ">
                      <i>Checked By</i>
                    </div>
                  </div>
                  <div style={{color:'gray', fontSize:'8px'}} className="pt-3" >**   THIS IS A COMPUTER GENERATED INVOICE AND KINDLY NOTIFY US IMMEDIATELY IN CASE YOU FIND ANY DISCREPANCY IN THE DETAILS OF TRANSACTIONS</div>
                
              </div> : <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto"> {msg} </p> }
    </>
  )
}

export default QuotePrintL
// import React from 'react'
// import { useEffect } from 'react';
// import { useState } from 'react';
// import { apiCall, checkMsg, formatAmount, handleImageError,  isObjectEmpty } from '../../GlobalFunctions';
// import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
// import Loader from '../../components/Loader';
// import "../../assets/css/prints/quoteprintlp.css";
// import { cloneDeep } from 'lodash';

// const QuotePrintLP = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  
//   const [result, setResult] = useState(null);
//   const [msg, setMsg] = useState("");
//   const [loader, setLoader] = useState(true);
//   const [headerFlag, setHeaderFlag] = useState(true);
//   const [isImageWorking, setIsImageWorking] = useState(true);
//   const [cateName, setCateName] = useState([]);
//   const [printWithPrice, setPrintWithPrice] = useState(true);
//   const [mainTotal, setMainTotal] = useState();
//   const [otherMetal, setOtherMetal] = useState([]);
//   const [goldNetWt, setGoldNetWt] = useState(0);
//   const [goldAmount, setGoldAmount] = useState(0);

//   useEffect(() => {
//     const sendData = async () => {
//       try {
//         const data = await apiCall(token, invoiceNo, printName, urls, evn, ApiVer);
//         if (data?.Status === "200") {
//           let isEmpty = isObjectEmpty(data?.Data);
//           if (!isEmpty) {
//             loadData(data?.Data);
//             setLoader(false);
//           } else {
//             setLoader(false);
//             setMsg("Data Not Found");
//           }
//         } else {
//           setLoader(false);
//           // setMsg(data?.Message);
//           const err = checkMsg(data?.Message);
//                     console.log(data?.Message);
//                     setMsg(err);
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     sendData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadData = (data) => {

//       let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
//       data.BillPrint_Json[0].address = address;
 
//       const datas = OrganizeDataPrint(
//         data?.BillPrint_Json[0],
//         data?.BillPrint_Json1,
//         data?.BillPrint_Json2
//       );
//       let catNameWise = [];
//       datas?.resultArray?.forEach((a) => {
//         let b = cloneDeep(a);
//             b.Count = 1;        
//         let findrec = catNameWise?.findIndex((al) => al?.Categoryname === b?.Categoryname);
//         if(findrec === -1){
//           catNameWise.push(b);
//         }else{
//           catNameWise[findrec].Count += 1;
//         }

//       })

//       let totalObj = {
//         diamond_pcs : 0,
//         diamond_wt : 0,
//         diamond_Amt : 0,
//         colorstone_Amt : 0,
//         colorstone_wt : 0,
//         colorstone_pcs : 0,
//         metal_wt : 0,
//         metal_netwt : 0,
//         metal_Amt : 0,
//         otherAmt:0,
//         labourRate:0,
//         labourAmt:0,
//         totalAmt:0,
//       }

//       datas?.resultArray?.forEach((a) => {
//         a?.diamonds?.forEach((al) => {
//           totalObj.diamond_pcs += (al?.Pcs * a?.Quantity)
//           totalObj.diamond_wt += (al?.Wt * a?.Quantity)
//           totalObj.diamond_Amt += (al?.Amount * a?.Quantity)
//         })
//         a?.colorstone?.forEach((al) => {
//           totalObj.colorstone_pcs += (al?.Pcs * a?.Quantity)
//           totalObj.colorstone_wt += (al?.Wt * a?.Quantity)
//           totalObj.colorstone_Amt += (al?.Amount * a?.Quantity)
//         })
//         a?.metal?.forEach((al) => {
//           totalObj.metal_wt += ((((a?.NetWt + a?.LossWt) * a?.Quantity) + ((a?.totals?.diamonds?.Wt / 5) * a?.Quantity)) )
//           totalObj.metal_netwt += (al?.Wt * a?.Quantity)
//           totalObj.metal_Amt += (al?.Amount * a?.Quantity)
//         })
//         a?.finding?.forEach((al) => {
//           totalObj.metal_wt += ((((a?.NetWt + a?.LossWt) * a?.Quantity) + ((a?.totals?.diamonds?.Wt / 5) * a?.Quantity)) )
//           totalObj.metal_netwt += (al?.Wt * a?.Quantity)
//           totalObj.metal_Amt += (al?.Amount * a?.Quantity)
//         })
//         totalObj.otherAmt += ((a?.OtherCharges + a?.MiscAmount + a?.TotalDiamondHandling) * a?.Quantity)
//         totalObj.labourAmt+= ((a?.MakingAmount + a?.totals?.diamonds?.SettingAmount + a?.totals?.colorstone?.SettingAmount) * a?.Quantity)
//         totalObj.labourRate+= a?.MaKingCharge_Unit;
//       })

//       setCateName(catNameWise);
//       setMainTotal(totalObj);

//       setResult(datas);
//       let other_metal = [];

//       datas?.resultArray?.forEach((e) => {
//         let b = cloneDeep(e);
//         let findrec = other_metal?.findIndex((el) => (b?.MetalTypePurity)?.toLowerCase() === (el?.MetalTypePurity)?.toLowerCase())
//         if(findrec === -1){
//           other_metal.push(b);
//         }else{
//           other_metal[findrec].convertednetwt += b?.convertednetwt;
//           other_metal[findrec].MetalAmount += b?.MetalAmount;
//           other_metal[findrec].Quantity += b?.Quantity;
//         }
//       })

//       other_metal?.sort((a, b) => a?.MetalTypePurity.localeCompare(b?.MetalTypePurity))

//       let gold_purewt = 0;
//       let gold_amount = 0;

//       other_metal?.forEach((a) => {
//         if(a?.MetalType?.toLowerCase() === 'gold'){
//           gold_purewt += a?.convertednetwt;
//           gold_amount += (a?.MetalAmount * a?.Quantity);
//         }
//       })

//       setGoldNetWt(gold_purewt);
//       setGoldAmount(gold_amount);
//       setOtherMetal(other_metal)

//   }

//   const handleCheckbox = () => {
//     if(headerFlag){
//       setHeaderFlag(false);
//     }else{
//       setHeaderFlag(true);
//     }
//   };

//   const handleImageErrors = () => {
//     setIsImageWorking(false);
//   };

//   const handlePrintWithPrice = () => {
//     setPrintWithPrice(true);
//     setTimeout(() => {
//       window.print();
//     },0)
//   }

//   const handlePrintWithOutPrice = () => {
//     setPrintWithPrice(false);
//     setTimeout(() => {
//       window.print();
//     },0)
    
//   }

//   return (
//     <>
//     { loader ? <Loader /> : msg === '' ? <div className="containerdp10 pab60_dp10">
//                 <div className="d-flex justify-content-end align-items-center hidebtndp10 mb-4">
//                   { atob(printName)?.toLowerCase() === 'print (l)' ? '' : <div  className="d-flex justify-content-end align-items-center">
//                     <input type="checkbox" id="imghideshow" className="mx-1" checked={headerFlag} onChange={handleCheckbox} />
//                     <label htmlFor="imghideshow" className="me-3 user-select-none fs-6">
//                       With Header
//                     </label>
//                   </div>}
//                   <button className="btn_white blue mb-0 hidedp10 m-0 p-2 me-2 maroon_qlp" onClick={(e) => handlePrintWithOutPrice(e)} >
//                     Print WithOut Price
//                   </button>
//                   <button className="btn_white blue mb-0 hidedp10 m-0 p-2" onClick={(e) => handlePrintWithPrice(e)} >
//                     Print With Price
//                   </button>
//                 </div>
//                 {/* header */}
//                 <div>
//                   <div className="pheaddp10">
//                     {result?.header?.PrintHeadLabel === '' ? 'QUOTATION' : result?.header?.PrintHeadLabel}
//                   </div>
//                   {
//                     headerFlag ? <div className="d-flex justify-content-between">
//                     <div className="p-1 fsgdp10">
//                       <div className="fw-bold fs-6 pb-1 fs_3_qlp">
//                         {result?.header?.CompanyFullName}
//                       </div>
//                       <div>{result?.header?.CompanyAddress}</div>
//                       <div>{result?.header?.CompanyAddress2}</div>
//                       <div>
//                         {result?.header?.CompanyCity}- {result?.header?.CompanyPinCode},{" "}
//                         {result?.header?.CompanyState}(
//                         {result?.header?.CompanyCountry})
//                       </div>
//                       <div>T {result?.header?.CompanyTellNo}</div>
//                       <div>
//                         {result?.header?.CompanyEmail} |{" "}
//                         {result?.header?.CompanyWebsite}
//                       </div>
//                       <div>
//                         {result?.header?.Company_VAT_GST_No} |{" "}
//                         {result?.header?.Company_CST_STATE}-
//                         {result?.header?.Company_CST_STATE_No} | PAN-
//                         {result?.header?.Pannumber}
//                       </div>
//                     </div>
//                     <div className="d-flex justify-content-end pe-2 pt-2">
//                     {isImageWorking && (result?.header?.PrintLogo !== "" && 
//                       <img src={result?.header?.PrintLogo} alt="" 
//                       className='w-100 h-auto ms-auto d-block object-fit-contain'
//                       onError={handleImageErrors} height={120} width={150} style={{maxWidth: "116px"}} />)}
//                       {/* <img
//                         src={result?.header?.PrintLogo}
//                         alt="#companylogo"
//                         className="imgHWdp10"
//                       /> */}
//                     </div>
//                   </div> : ''
//                   }
//                 </div>
//                 {/* subheader */}
//                 <div className="subheaderdp10">
//                   <div className="subdiv1dp10 border-end fsgdp10 border-start ">
//                     <div className="px-1">Quote To,</div>
//                     <div className="px-1 fw-bold fs_cust_name_qpl">
//                       {result?.header?.customerfirmname}
//                     </div>
//                     <div className="px-1">
//                       {result?.header?.customerAddress2}
//                     </div>
//                     <div className="px-1">
//                       {result?.header?.customerAddress1}
//                     </div>
//                     <div className="px-1">
//                       {result?.header?.customerAddress3}
//                     </div>
//                     <div className="px-1">
//                       {result?.header?.customercity1}-{result?.header?.PinCode}
//                     </div>
//                     <div className="px-1">{result?.header?.customeremail1}</div>
//                     <div className="px-1"> GSTIN - {result?.header?.vat_cst_pan}</div>
//                     <div className="px-1"> {result?.header?.Cust_CST_STATE} - {result?.header?.Cust_CST_STATE_No} </div>
//                   </div>
//                   <div className="subdiv2dp10 border-end fsgdp10">
//                     {/* <div className="px-1">Ship To,</div> */}
//                     <div className="px-1 fw-bold fs_cust_name_qpl">
//                       {result?.header?.customerfirmname}
//                     </div>
//                     <div className='d-flex flex-column'>
//                     {result?.header?.address?.map((address, index) => (
//                       <div className="px-1" key={index}>
//                         {address?.split('\n').map((line, lineIndex) => (
//                           <div key={lineIndex}>{line}</div>
//                         ))}
//                       </div>
//                     ))}
//                     {/* {result?.header?.address?.map((e, i) => {
//                       return (
//                         <div className="px-1" key={i}>
//                           {e}
//                         </div>
//                       );
//                     })} */}
//                     </div>
//                   </div>
//                   <div className="subdiv3dp10 fsgdp10 border-end">
//                     <div className="d-flex justify-content-start px-1">
//                       <div className="w-25 fw-bold">QUOTE NO</div>
//                       <div className="w-25">{result?.header?.InvoiceNo}</div>
//                     </div>
//                     <div className="d-flex justify-content-start px-1">
//                       <div className="w-25 fw-bold">DATE</div>
//                       <div className="w-25">{result?.header?.EntryDate}</div>
//                     </div>
//                     <div className="d-flex justify-content-start px-1">
//                       <div className="w-25 fw-bold">
//                         {result?.header?.HSN_No_Label}
//                       </div>
//                       <div className="w-25">{result?.header?.HSN_No}</div>
//                     </div>
//                     {/* <div className="d-flex justify-content-end mt-5 px-2 fw-bold">
//                       Gold Rate {result?.header?.MetalRate24K?.toFixed(2)} Per
//                       Gram
//                     </div> */}
//                   </div>
//                 </div>
//                 {/* table */}

//                 <div className="tabledp10">
//                   {/* tablehead */}
//                   <div className="theaddp10 fw-bold fsg2dp10" style={{backgroundColor:'#F5F5F5'}}>
//                     <div className="col1dp10 centerdp10 ">Sr</div>
//                     <div className="col2dp10 centerdp10  fw-bold">Design</div>
//                     <div className="col3dp10">
//                       <div className="h-50 centerdp10 fw-bold w-100">
//                         Diamond
//                       </div>
//                       <div className="d-flex justify-content-between align-items-center h-50 bt_dp10 w-100">
//                         <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10">
//                           Code
//                         </div>
//                         <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10">
//                           Size
//                         </div>
//                         <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10" style={{ width: "8.66%" }}>
//                           Pcs
//                         </div>
//                         <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10">
//                           Wt
//                         </div>
//                         <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10" style={{width:'19.66%'}}>
//                           Rate
//                         </div>
//                         <div className="centerdp10 h-100 theadsubcol1_dp10" style={{ width: "21.66%" }} >
//                           Amount
//                         </div>
//                       </div>
//                     </div>
//                     <div className="col4dp10 ">
//                       <div className="h-50 centerdp10 fw-bold w-100">Metal</div>
//                       <div className="d-flex justify-content-between align-items-center h-50 bt_dp10 w-100">
//                         <div className="theadsubcol2_dp10 bright_dp10 h-100 centerdp10" >
//                           Quality
//                         </div>
//                         <div className="theadsubcol2_dp10 centerdp10 bright_dp10 h-100" style={{width:'18%'}}>
//                           *Wt
//                         </div>
//                         <div className="theadsubcol2_dp10 centerdp10 bright_dp10 h-100" style={{width:'19%'}}>
//                           Net Wt
//                         </div>
//                         <div className="theadsubcol2_dp10 centerdp10 bright_dp10 h-100">
//                           Rate
//                         </div>
//                         <div className="theadsubcol2_dp10 centerdp10 h-100" style={{width:'23%'}}>
//                           Amount
//                         </div>
//                       </div>
//                     </div>
//                     <div className="col3dp10">
//                       <div className="h-50 centerdp10 fw-bold w-100">Stone</div>
//                       <div className="d-flex justify-content-between align-items-center h-50 bt_dp10 w-100">
//                         <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10" style={{width:'21.66%'}}>
//                           Code
//                         </div>
//                         <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10 ">
//                           Size
//                         </div>
//                         <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10" style={{width:'11.66%'}}>
//                           Pcs
//                         </div>
//                         <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10">
//                           Wt
//                         </div>
//                         <div className="centerdp10 h-100 bright_dp10 theadsubcol1_dp10">
//                           Rate
//                         </div>
//                         <div className="centerdp10 h-100 theadsubcol1_dp10">
//                           Amount
//                         </div>
//                       </div>
//                     </div>
//                     <div className="col6dp10">
//                       <div className="d-flex justify-content-center align-items-center h-50 w-100 ">
//                         Other
//                       </div>
//                       <div className="d-flex justify-content-center align-items-center h-50 w-100 bt_dp10">
//                         Amount
//                       </div>
//                     </div>
//                     <div className="col7dp10">
//                       <div className="h-50 centerdp10 fw-bold w-100">
//                         Labour
//                       </div>
//                       <div className="d-flex justify-content-between align-items-center h-50 bt_dp10  w-100">
//                         <div className=" h-100 centerdp10 bright_dp10" style={{width:'40%'}}>
//                           Rate
//                         </div>
//                         <div className=" h-100 centerdp10" style={{width:'60%'}}>Amount</div>
//                       </div>
//                     </div>
//                     <div className="col8dp10">
//                       <div className="d-flex justify-content-center align-items-center h-50 border-top w-100">
//                         Total
//                       </div>
//                       <div className="d-flex justify-content-center align-items-center h-50 w-100">
//                         Amount
//                       </div>
//                     </div>
//                   </div>
//                   {/* table body */}
//                   <div className="tbodydp10 fsgdp10 ">
//                     {result?.resultArray?.map((e, i) => {
//                       return (
//                         <div className="tbrowdp10 h-100 " key={i}>
//                           <div className="tbcol1dp10 center_sdp10">
//                             {i + 1}
//                           </div>
//                           <div className="tbcol2dp10 d-flex flex-column justify-content-between">
//                             <div className="d-flex justify-content-between px-1 flex-wrap">
//                               <div className="fsgdp10">{e?.designno}</div>
//                               <div className="fsgdp10">{e?.MetalColor}</div>
//                             </div>
//                             {/* <div className="d-flex justify-content-end px-1">
//                               {e?.MetalColor}
//                             </div> */}
                            
//                               <div className="w-100 d-flex justify-content-center align-items-center " style={{ minHeight: "80px" }} >
//                                 <img src={e?.DesignImage} onError={(e) => handleImageError(e)} alt="design" className="imgdp10" />
//                               </div>
                           

//                             {/* <div className="centerdp10 fsgdp10">
//                               {e?.batchnumber}
//                             </div>
//                             {e?.HUID !== "" ? (
//                               <div className="centerdp10 fsgdp10">
//                                 HUID - {e?.HUID}
//                               </div>
//                             ) : (
//                               ""
//                             )}
//                             <div className="centerdp10 fw-bold fsgdp10">
//                               PO: {e?.PO}
//                             </div>
//                             <div className="centerdp10 fw-bold fsgdp10">
//                                 {e?.lineid}
//                             </div>
//                             <div className="centerdp10 fsgdp10">
//                               Tunch : &nbsp;
//                               <b className="fsgdp10">{e?.Tunch?.toFixed(3)}</b>
//                             </div> */}
//                             <div className="centerdp10 text-break">
//                               G Wt &nbsp; 
//                               <b className="fsgdp10">
//                                 {( (e?.grosswt * e?.Quantity))?.toFixed(3)} gm
//                               </b>
//                               &nbsp; 
//                             </div>
//                             <div className="centerdp10">
//                               {e?.Size === "" ? "" : `Size : ${e?.Size}`}
//                             </div>
//                             <div className="centerdp10">
//                               {e?.Quantity === 0 ? "" : `Qty : ${e?.Quantity}`}
//                             </div>
//                           </div>
//                           <div className="tbcol3dp10 d-flex flex-column justify-content-between">
//                             <div>
//                             {e?.diamonds?.map((el, idia) => {
//                               return (
//                                 <div className="d-flex" key={idia}>
//                                   <div className="theadsubcol1_dp10 " style={{wordBreak:'break-word',paddingLeft:'2px'}}>
//                                      {el?.MaterialTypeName} {el?.ShapeName} {el?.QualityName}&nbsp;
//                                     {el?.Colorname}
//                                   </div>
//                                   <div className="theadsubcol1_dp10 text-start" style={{lineHeight:'8px !important'}}>
//                                     {el?.SizeName}
//                                   </div>
//                                   <div className="theadsubcol1_dp10 d-flex align-items-start justify-content-center" style={{ width: "8.66%" }} >
//                                     {el?.Pcs * e?.Quantity}
//                                   </div>
//                                   <div className="theadsubcol1_dp10 end_dp10">
//                                     {(el?.Wt * e?.Quantity)?.toFixed(3)}
//                                   </div>
//                                   <div className="theadsubcol1_dp10 end_dp10" style={{width:'19.66%'}}>
//                                     { printWithPrice && formatAmount((el?.Rate)/ result?.header?.CurrencyExchRate)}
//                                   </div>
//                                   <div className="theadsubcol1_dp10 fw-bold end_dp10 pr_dp10" style={{ width: "21.66%" }} >
//                                     { printWithPrice && formatAmount((el?.Amount * e?.Quantity)/ result?.header?.CurrencyExchRate)}
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                             </div>
//                              <div className="d-flex  bgc_dp10 bt_dp10 fw-bold" >
//                                   <div className="theadsubcol1_dp10" style={{wordBreak:'break-word',paddingLeft:'2px'}}> </div>
//                                   <div className="theadsubcol1_dp10 text-start" style={{lineHeight:'8px !important'}}> </div>
//                                   <div className="theadsubcol1_dp10 d-flex align-items-start justify-content-center" style={{ width: "8.66%" }} >
//                                     {(e?.totals?.diamonds?.Pcs * e?.Quantity) === 0 ? <>&nbsp;</> :  e?.totals?.diamonds?.Pcs * e?.Quantity } 
//                                   </div>
//                                   <div className="theadsubcol1_dp10 end_dp10">
//                                     { e?.totals?.diamonds?.Wt * e?.Quantity === 0 ? '' : (e?.totals?.diamonds?.Wt * e?.Quantity)?.toFixed(3)}
//                                   </div>
//                                   <div className="theadsubcol1_dp10 end_dp10" style={{width:'19.66%'}}> </div>
//                                   <div className="theadsubcol1_dp10 fw-bold end_dp10 pr_dp10" style={{ width: "21.66%" }} >
//                                     { printWithPrice && ((e?.totals?.diamonds?.Amount * e?.Quantity) === 0 ? '' :  formatAmount((e?.totals?.diamonds?.Amount * e?.Quantity)/ result?.header?.CurrencyExchRate))}
//                                   </div>
//                                 </div>
//                           </div>
//                           <div className="tbcol4dp10 d-flex flex-column justify-content-between">
//                             <div>
//                             {e?.metal?.map((el, imet) => {
//                               return (
//                                 <div className="d-flex w-100" key={imet}>
//                                   <div className="theadsubcol2_dp10 d-flex justify-content-start border-end h-100 ps-1 border-end-0" style={{ wordBreak:'break-word' }} >
//                                     {el?.ShapeName} {el?.QualityName}
//                                   </div>
//                                   <div className="theadsubcol2_dp10 centerdp10 border-end h-100 pr_dp10 border-end-0 end_dp10" style={{width:'18%'}}>
//                                     {((((e?.NetWt + e?.LossWt) * e?.Quantity) + ((e?.totals?.diamonds?.Wt / 5) * e?.Quantity)) )?.toFixed(3)}
//                                   </div>
//                                   <div className="theadsubcol2_dp10 centerdp10 border-end h-100 pr_dp10 border-end-0 end_dp10" style={{width:'19%'}}>
//                                     {(el?.Wt * e?.Quantity)?.toFixed(3)}
//                                   </div>
//                                   <div className="theadsubcol2_dp10 centerdp10 border-end h-100 pr_dp10 border-end-0 end_dp10">
//                                     { printWithPrice && formatAmount((el?.Rate)/ result?.header?.CurrencyExchRate)}
//                                   </div>
//                                   <div className={`theadsubcol2_dp10 centerdp10 border-end h-100  border-end-0 end_dp10 pr_dp10 ${el?.IsPrimaryMetal === 1 ? 'fw-bold' : 'fw-bold' }`} style={{width:'23%'}}>
//                                     { printWithPrice && formatAmount((el?.Amount * e?.Quantity)/ result?.header?.CurrencyExchRate)}
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                             {
//                               e?.finding?.map((el, il) => {
//                                 return (
//                                   <div className="d-flex w-100" key={il}>
//                                   <div className="theadsubcol2_dp10 d-flex justify-content-start border-end h-100 ps-1 border-end-0 text-break" style={{ wordBreak:'break-word' }} >
//                                     {el?.ShapeName} {el?.QualityName}
//                                   </div>
//                                   <div className="theadsubcol2_dp10 centerdp10 border-end h-100 pr_dp10 border-end-0 end_dp10" style={{width:'18%'}}>
//                                     {/* {((((e?.NetWt + e?.LossWt) * e?.Quantity) + ((e?.totals?.diamonds?.Wt / 5) * e?.Quantity)) )?.toFixed(3)} */}
//                                     {(((e?.totals?.diamonds?.Wt / 5) + el?.Wt) * e?.Quantity)?.toFixed(3)}
//                                   </div>
//                                   <div className="theadsubcol2_dp10 centerdp10 border-end h-100 pr_dp10 border-end-0 end_dp10" style={{width:'19%'}}>
//                                     {/* {(e?.NetWt + e?.LossWt)?.toFixed(3)} */}
//                                     {(el?.Wt * e?.Quantity)?.toFixed(3)}
//                                   </div>
//                                   <div className="theadsubcol2_dp10 centerdp10 border-end h-100 pr_dp10 border-end-0 end_dp10">
//                                     { printWithPrice && formatAmount((el?.Rate)/ result?.header?.CurrencyExchRate)}
//                                   </div>
//                                   <div className={`theadsubcol2_dp10 centerdp10 border-end h-100  border-end-0 end_dp10 pr_dp10 ${el?.IsPrimaryMetal === 1 ? 'fw-bold' : 'fw-bold' }`} style={{width:'23%'}}>
//                                     { printWithPrice && formatAmount((el?.Amount * e?.Quantity)/ result?.header?.CurrencyExchRate)}
//                                   </div>
//                                 </div>
//                                 )
//                               })
//                             }
//                             <div className="p-2 px-1">
//                               {e?.JobRemark !== "" ? (
//                                 <>
//                                   <b className="fsgdp10">Remark : </b>{" "}
//                                   <div>{e?.JobRemark}</div>
//                                 </>
//                               ) : (
//                                 ""
//                               )}{" "}
//                             </div>
//                             </div>
//                             <div className='d-flex end_dp10  bgc_dp10 bt_dp10 fw-bold'>
//                               <div className='end_dp10' style={{width:'39%'}}>{e?.grosswt?.toFixed(3)}</div>
//                               <div className='end_dp10' style={{width:'20%'}}>{e?.totals?.metal?.IsPrimaryMetal?.toFixed(3)}</div>
//                               <div className='end_dp10 pr_dp10' style={{width:'41%'}}>{ printWithPrice && formatAmount((((e?.totals?.metal?.IsPrimaryMetal_Amount * e?.Quantity) + (e?.totals?.finding?.Amount * e?.Quantity))/ result?.header?.CurrencyExchRate))}</div>
//                             </div>
//                           </div>
//                           <div className="tbcol3dp10 d-flex flex-column justify-content-between">
//                             <div>

                            
//                             {e?.colorstone?.map((el, ics) => {
//                               return (
//                                 <div className="d-flex" key={ics}>
//                                   <div className="theadsubcol1_dp10 " style={{wordBreak:'break-word', paddingLeft:'2px', width:'21.66%'}}>
//                                     { el?.MaterialTypeName + " " + el?.ShapeName + " " + el?.QualityName + " " + el?.Colorname} </div>
//                                   <div className="theadsubcol1_dp10 text-center">
//                                     {el?.SizeName}
//                                   </div>
//                                   <div className="theadsubcol1_dp10 d-flex align-items-start justify-content-center" style={{width:'11.66%'}}>
//                                     {(el?.Pcs * e?.Quantity)}
//                                   </div>
//                                   <div className="theadsubcol1_dp10 end_dp10">
//                                     {(el?.Wt * e?.Quantity)?.toFixed(3)}
//                                   </div>
//                                   <div className="theadsubcol1_dp10 end_dp10">
//                                     { printWithPrice && formatAmount((el?.Rate)/ result?.header?.CurrencyExchRate)}
//                                   </div>
//                                   <div className="theadsubcol1_dp10 end_dp10 fw-bold pr_dp10">
//                                     { printWithPrice && formatAmount((el?.Amount * e?.Quantity)/ result?.header?.CurrencyExchRate)}
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                             </div>
                             
                            
//                               <div className="d-flex bgc_dp10 bt_dp10 fw-bold">
//                                   <div className="theadsubcol1_dp10" style={{wordBreak:'break-word', paddingLeft:'2px', width:'21.66%'}}> </div>
//                                   <div className="theadsubcol1_dp10 text-center"> </div>
//                                   <div className="theadsubcol1_dp10 d-flex align-items-start justify-content-center" style={{width:'11.66%'}}>
//                                     { (e?.totals?.colorstone?.Pcs * e?.Quantity) === 0 ? <>&nbsp;</> : <>{(e?.totals?.colorstone?.Pcs * e?.Quantity)}</>}
//                                   </div>
//                                   <div className="theadsubcol1_dp10 end_dp10">
//                                   { (e?.totals?.colorstone?.Wt * e?.Quantity) === 0 ? '' : <>{(e?.totals?.colorstone?.Wt * e?.Quantity)?.toFixed(3)}</>}
//                                   </div>
//                                   <div className="theadsubcol1_dp10 end_dp10"> </div>
//                                   <div className="theadsubcol1_dp10 end_dp10 fw-bold pr_dp10">
//                                   { (e?.totals?.colorstone?.Amount * e?.Quantity) === 0 ? '' : <>{ printWithPrice && formatAmount((e?.totals?.colorstone?.Amount * e?.Quantity)/ result?.header?.CurrencyExchRate)}</>}
//                                   </div>
//                               </div>
//                           </div>
//                           <div className="tbcol6dp10 p-1 pr_dp10 d-flex flex-column justify-content-between">
//                              <div className='w-100 end_dp10 '>
//                              {  ( printWithPrice && formatAmount( ((e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling) * e?.Quantity)/ result?.header?.CurrencyExchRate))}
//                              </div>
//                              <div className='w-100 end_dp10  bgc_dp10 bt_dp10 fw-bold'>
//                              &nbsp;{  ((e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling) * e?.Quantity) === 0 ? '' : ( printWithPrice && formatAmount( ((e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling) * e?.Quantity)/ result?.header?.CurrencyExchRate)) }
//                              </div>
//                           </div>
//                           <div className="tbcol7dp10 d-flex  flex-column justify-content-between ">
//                             <div className="d-flex">
//                               <div className=" end_dp10 pr_dp10" style={{width:'40%'}}>
//                                 { (printWithPrice && formatAmount((e?.MaKingCharge_Unit)/ result?.header?.CurrencyExchRate))}
//                               </div>
//                               <div className=" end_dp10  pr_dp10" style={{width:'60%'}}>
//                                 { printWithPrice && (((e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount) * e?.Quantity)) === 0 ? <>&nbsp;</> : ( printWithPrice && formatAmount( (((e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount) * e?.Quantity))/ result?.header?.CurrencyExchRate) )}
//                               </div>
//                             </div>
//                             <div className="d-flex  bgc_dp10 bt_dp10 fw-bold">
//                               <div className=" end_dp10 pr_dp10">
//                                 {/* { printWithPrice && formatAmount(e?.MaKingCharge_Unit)} */}
//                               </div>
//                               <div className=" end_dp10  pr_dp10 w-100 ">
//                                 &nbsp;{ printWithPrice &&  (((e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount) * e?.Quantity)) === 0 ? <>&nbsp;</> : ( printWithPrice && formatAmount( (((e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount) * e?.Quantity))/ result?.header?.CurrencyExchRate) )}
//                               </div>
//                             </div>
//                           </div>
//                           <div className="tbcol8dp10 fw-bold p-1 pad_top_dp10 pr_dp10 d-flex flex-column justify-content-between align-items-end">
//                             <div className='w-100 end_dp10 '>
//                             { printWithPrice && ( formatAmount((e?.TotalAmount)/ result?.header?.CurrencyExchRate))}
//                             </div>
//                             <div className='w-100 end_dp10  bgc_dp10 bt_dp10'>
//                             &nbsp;{ printWithPrice &&  e?.TotalAmount === 0 ? <>&nbsp;</> :  ( printWithPrice && formatAmount((e?.TotalAmount)/ result?.header?.CurrencyExchRate))}
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                   {/* final total */}
//                   {
//                     printWithPrice && <div className="d-flex justify-content-end align-items-center brb_dp10 tbrowdp10 pt-1">
//                     <div style={{ width: "13%" }}>
                     
//                       <div>
//                         {result?.allTaxes?.map((e, i) => {
//                           return (
//                             <div className="d-flex justify-content-between" key={i} >
//                               <div className="w-50 end_dp10">
//                                 {e?.name} {e?.per}
//                               </div>
//                               <div className="w-50 end_dp10 pr_dp10">
//                                 {formatAmount((e?.amountInNumber))}
//                               </div>
//                             </div>
//                           );
//                         })}
//                         <div className="d-flex justify-content-between">
//                           <div className="w-50 end_dp10">
//                             {result?.header?.AddLess > 0 ? "Add" : "Less"}
//                           </div>
//                           <div className="w-50 end_dp10 pr_dp10">
//                             {formatAmount((result?.header?.AddLess)/ result?.header?.CurrencyExchRate)}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   }
//                   {/* all table row total */}
//                   <div className="d-flex grandtotaldp10 brb_dp10 brbb_dp10 tbrowdp10" style={{ backgroundColor: "#F5F5F5" }} >
//                     <div className="centerdp10 brR_dp10 fsg2dp10" style={{ width: "10%" }} > Total </div>
//                     <div className="col3dp10 d-flex align-items-center brR_dp10 justify-content-end">
//                       {/* <div className="theadsubcol1_dp10"></div> */}
//                       {/* <div className="theadsubcol1_dp10"></div> */}
//                       {/* <div className="theadsubcol1_dp10 end_dp10"> */}
//                       <div className=" end_dp10 fsg2dp10" style={{width:'19%'}}>
//                         {mainTotal?.diamond_pcs}
//                       </div>
//                       {/* <div className="theadsubcol1_dp10 end_dp10" style={{width:'20%'}}> */}
//                       <div className=" end_dp10 fsg2dp10"  style={{width:'20%'}}>
//                         {mainTotal?.diamond_wt?.toFixed(3)}
//                       </div>
//                       {/* <div className="theadsubcol1_dp10"></div> */}
//                       <div className="theadsubcol1_dp10 end_dp10 pr_dp10 fsg2dp10" style={{width:'42%'}} >
//                         { printWithPrice && formatAmount((mainTotal?.diamond_Amt)/ result?.header?.CurrencyExchRate)}
//                       </div>
//                     </div>
//                     <div className="col4dp10 d-flex align-items-center brR_dp10 justify-content-end">
//                       {/* <div className="theadsubcol2_dp10" ></div> */}
//                        <div className="theadsubcol2_dp10 pr_dp10 fsg2dp10" style={{width:'19%'}}>
//                         {/* {result?.mainTotal?.netwtWithLossWt?.toFixed(3)} */}
//                         {mainTotal?.metal_wt?.toFixed(3)}
//                       </div>
//                        <div className="theadsubcol2_dp10 pr_dp10 fsg2dp10 end_dp10" style={{width:'18%'}}>
//                         {/* {result?.mainTotal?.netwtWithLossWt?.toFixed(3)} */}
//                         {mainTotal?.metal_netwt?.toFixed(3)}
//                       </div>
//                       {/* <div className="theadsubcol2_dp10"></div> */}
//                       <div className="theadsubcol2_dp10 end_dp10 pr_dp10 fsg2dp10" style={{ width: "40%" }} >
//                         { printWithPrice && formatAmount((mainTotal?.metal_Amt)/ result?.header?.CurrencyExchRate)}
//                       </div>
//                     </div>
//                     <div className="col3dp10 d-flex align-items-center justify-content-end brR_dp10 fsg2dp10" style={{width:'25%'}}>
//                       {/* <div className="theadsubcol1_dp10"></div>
//                       <div className="theadsubcol1_dp10"></div> */}
//                       <div className=" d-flex align-items-start justify-content-center fsg2dp10">
//                         {mainTotal?.colorstone_pcs}
//                       </div>
//                       <div className=" end_dp10 fsg2dp10" style={{ width: "22.32%" }}>
//                         {(mainTotal?.colorstone_wt)?.toFixed(3)}
//                       </div>
//                       {/* <div className=""></div> */}
//                       {/* <div className=" end_dp10 pr_dp10 fsg2dp10" style={{ width: "27.32%" }} > */}
//                       <div className=" end_dp10 pr_dp10 fsg2dp10" style={{ width: "30.32%" }} >
//                         { printWithPrice && formatAmount((mainTotal?.colorstone_Amt)/ result?.header?.CurrencyExchRate)}
//                       </div>
//                     </div>
//                     <div className="col6dp10 end_dp10  d-flex align-items-center brR_dp10 pr_dp10 fsg2dp10" style={{width:'5%', paddingRight:'1px'}}>
//                       { printWithPrice && <>{mainTotal?.otherAmt?.length > 11 ? mainTotal?.otherAmt : formatAmount((mainTotal?.otherAmt)/ result?.header?.CurrencyExchRate)}</> }
//                     </div>
//                     <div className="col7dp10 end_dp10  d-flex align-items-center brR_dp10 pr_dp10 fsg2dp10" style={{width:'9%'}}>
//                       {/* <div className='end_dp10 brR_dp10 h-100 pr_dp10 align-items-center' style={{width:'38%'}}>{ printWithPrice && formatAmount( (mainTotal?.labourRate))}</div> */}
//                       <div className='end_dp10 pr_dp10 w-100' >{ printWithPrice && formatAmount( (mainTotal?.labourAmt)/ result?.header?.CurrencyExchRate)}</div>
//                     </div>
//                     <div className="col8dp10 end_dp10  d-flex align-items-center pr_dp10 fsg2dp10" style={{width:"6%"}}>
//                     { printWithPrice && <div className='pe-1' dangerouslySetInnerHTML={{__html:result?.header?.Currencysymbol}}></div>} { printWithPrice && formatAmount((result?.mainTotal?.total_amount + (result?.allTaxesTotal * result?.header?.CurrencyExchRate) + (result?.header?.AddLess))/ result?.header?.CurrencyExchRate)}
//                     </div>
//                   </div>
//                   </div>
//                   {/* summary */}
//                   <div className="d-flex justify-content-between mt-1 summarydp10">
//                     <div style={{width:'60%', display:'flex'}}>
//                       <div className={`d-flex flex-column w-50 ${ printWithPrice ? 'sumdp10' : 'sumdp10_2'}`}>
//                         <div className="fw-bold bg_dp10 w-100 centerdp10  ball_dp10 fsg2dp10">
//                           SUMMARY
//                         </div>
//                         <div className="d-flex w-100 fsgdp10">
                          
//                           <div className={`${printWithPrice ? 'w-50' : 'w-100'} bright_dp10 bl_dp10`}>
//                           <div className="d-flex justify-content-between px-1 fsg2dp10">
//                               <div className="w-50 fw-bold fsg2dp10">GOLD IN 24KT</div>
//                               <div className="w-50 end_dp10 pe-1"> {(goldNetWt)?.toFixed(3)} gm </div>
//                             </div>
//                             {
//                                 otherMetal?.map((e, i) => {
//                                   return (
//                                     <React.Fragment key={i}>
//                                     {
//                                       e?.MetalType?.toLowerCase()  === 'gold' ? '' : <div className="d-flex justify-content-between px-1 fsg2dp10" key={i}>
//                                       <div className="w-50 fw-bold fsg2dp10">{e?.MetalType}</div>
//                                       <div className="w-50 end_dp10 fsg2dp10  pe-1">
//                                         {e?.convertednetwt?.toFixed(3)} gm
//                                       </div>
//                                     </div>
//                                     }
//                                     </React.Fragment>
//                                   )
//                                 })
//                             }
                            
//                             <div className="d-flex justify-content-between px-1 fsg2dp10">
//                               <div className="w-50 fw-bold fsg2dp10">GROSS WT</div>
//                               <div className="w-50 end_dp10 pe-1"> {result?.mainTotal?.grosswt?.toFixed(3)} gm </div>
//                             </div>
//                             <div className="d-flex justify-content-between px-1 fsg2dp10">
//                               <div className="w-50 fw-bold fsg2dp10">*(G + D) WT</div>
//                               <div className="w-50 end_dp10 pe-1"> {(result?.mainTotal?.netwt + (result?.mainTotal?.diamonds?.Wt / 5))?.toFixed(3)} gm </div>
//                             </div>
//                             <div className="d-flex justify-content-between px-1 fsg2dp10">
//                               <div className="w-50 fw-bold fsg2dp10">NET WT</div>
//                               <div className="w-50 end_dp10 pe-1"> {result?.mainTotal?.metal?.IsPrimaryMetal?.toFixed(3)} gm </div>
//                             </div>
//                             <div className="d-flex justify-content-between px-1 fsg2dp10">
//                               <div className="w-50 fw-bold fsg2dp10">DIAMOND WT</div>
//                               <div className="w-50 end_dp10 pe-1 fsg2dp10">
//                                 {result?.mainTotal?.diamonds?.Pcs} /{" "}
//                                 {result?.mainTotal?.diamonds?.Wt?.toFixed(3)} cts
//                               </div>
//                             </div>
//                             <div className="d-flex justify-content-between px-1">
//                               <div className="w-50 fw-bold fsg2dp10">STONE WT</div>
//                               <div className="w-50 end_dp10 pe-1 fsg2dp10">
//                                 {result?.mainTotal?.colorstone?.Pcs} /{" "}
//                                 {result?.mainTotal?.colorstone?.Wt?.toFixed(3)}{" "}
//                                 cts
//                               </div>
//                             </div>
//                           </div>
                          
//                           {
//                             printWithPrice && <div className="w-50 bright_dp10 ">
//                               <div className="d-flex justify-content-between px-1">
//                               <div className="w-50 fw-bold fsg2dp10">GOLD</div>
//                               <div className="w-50 end_dp10 fsg2dp10">
//                                 {formatAmount(
//                                   (goldAmount)/ result?.header?.CurrencyExchRate
//                                 )}
//                               </div>
//                             </div>
//                               {
//                                 otherMetal?.map((e, i) => {
//                                   return (
//                                     <React.Fragment key={i}>
//                                         {
//                                           e?.MetalType?.toLowerCase() === 'gold' ? '' : 
//                                           <div className="d-flex justify-content-between px-1" key={i}>
//                                             <div className="w-50 fw-bold fsg2dp10">{e?.MetalType}</div>
//                                             <div className="w-50 end_dp10 fsg2dp10">
//                                               {formatAmount((e?.MetalAmount *e?.Quantity)/ result?.header?.CurrencyExchRate)}
//                                             </div>
//                                           </div>
//                                         }
//                                     </React.Fragment>
//                                   )
//                                 })
//                               }
//                             {/* <div className="d-flex justify-content-between px-1">
//                               <div className="w-50 fw-bold fsg2dp10">GOLD</div>
//                               <div className="w-50 end_dp10 fsg2dp10">
//                                 {formatAmount(mainTotal?.metal_Amt)}
//                               </div>
//                             </div> */}
//                             <div className="d-flex justify-content-between px-1">
//                               <div className="w-50 fw-bold fsg2dp10">DIAMOND</div>
//                               <div className="w-50 end_dp10 fsg2dp10">
//                                 {formatAmount(
//                                   (mainTotal?.diamond_Amt)/ result?.header?.CurrencyExchRate
//                                 )}
//                               </div>
//                             </div>
//                             <div className="d-flex justify-content-between px-1">
//                               <div className="w-50 fw-bold fsg2dp10">CST</div>
//                               <div className="w-50 end_dp10 fsg2dp10">
//                                 {formatAmount(
//                                   (mainTotal?.colorstone_Amt)/ result?.header?.CurrencyExchRate
//                                 )}
//                               </div>
//                             </div>
//                             <div className="d-flex justify-content-between px-1">
//                               <div className="w-50 fw-bold fsg2dp10">MAKING </div>
//                               <div className="w-50 end_dp10 fsg2dp10">
//                                 {formatAmount(
//                                     (mainTotal?.labourAmt)/ result?.header?.CurrencyExchRate
//                                 )}
//                               </div>
//                             </div>
//                             <div className="d-flex justify-content-between px-1">
//                               <div className="w-50 fw-bold fsg2dp10">OTHER </div>
//                               <div className="w-50 end_dp10 fsg2dp10">
//                                 {formatAmount((mainTotal?.otherAmt)/ result?.header?.CurrencyExchRate)}
//                               </div>
//                             </div>
//                             <div className="d-flex justify-content-between px-1">
//                               <div className="w-50 fw-bold fsg2dp10">
//                                 {result?.header?.AddLess > 0 ? "ADD" : "LESS"}
//                               </div>
//                               <div className="w-50 end_dp10 fsg2dp10">
//                                 {formatAmount((result?.header?.AddLess)/ result?.header?.CurrencyExchRate)}
//                               </div>
//                             </div>
//                           </div>
//                           }
//                         </div>
//                         <div className={`bg_dp10 h_bd10 ball_dp10 d-flex fsgdp10 `}>
//                           <div className="w-50 h-100"></div>
//                           {
//                             printWithPrice && <div className="w-50 h-100 d-flex align-items-center bl_dp10">
//                             <div className="fw-bold w-50 px-1 fsg2dp10">TOTAL</div>
//                             <div className="w-50 end_dp10 px-1 fsg2dp10">
//                                 {formatAmount(((result?.mainTotal?.total_amount + (result?.allTaxesTotal * result?.header?.CurrencyExchRate) + (result?.header?.AddLess)))/ result?.header?.CurrencyExchRate)}
//                             </div>
//                           </div>
//                           }
//                         </div>
//                       </div>
//                       <div className='d-flex flex-column  w-25' >
//                       <div className='fw-bold bg_dp10 w-100 centerdp10  ball_dp10 fsg2dp10'>SUMMARY</div>
//                       <div className='bb_dp10'>
//                         {
//                           cateName?.map((a, ind) => {
//                             return <div className='d-flex align-items-center w-100 fw-bold ' key={ind}>
//                             <div className='w-75 bl_dp10 ps-1 fsg2dp10'>{a?.Categoryname}</div>
//                             <div className='w-25 center_dp10 bright_dp10 fsg2dp10'>{a?.Count}</div>
//                           </div>
//                           })
//                         }
//                       </div>
//                     </div>
//                     </div>
//                     {/* <div className="dia_sum_dp10 d-flex flex-column  fsgdp10">
//                       <div className="h_bd10 centerdp10 bg_dp10 fw-bold ball_dp10">
//                         Diamond Detail
//                       </div>
//                       {diamondWise?.map((e, i) => {
//                         return (
//                           <div
//                             className="d-flex justify-content-between px-1 ball_dp10 border-top-0 border-bottom-0 fsgdp10"
//                             key={i}
//                           >
//                             <div className="fw-bold w-50">
//                               {e?.ShapeName} {e?.QualityName} {e?.Colorname}
//                             </div>
//                             <div className="w-50 end_dp10">
//                               {e?.pcPcss} / {e?.wtWts?.toFixed(3)} cts
//                             </div>
//                           </div>
//                         );
//                       })}
//                       <div className="d-flex justify-content-between px-1 bg_dp10 h_bd10  ball_dp10">
//                         <div className="fw-bold w-50 h14_dp10" ></div>
//                         <div className="w-50"></div>
//                       </div>
//                     </div> */}
//                     {/* <div className="oth_sum_dp10 fsgdp10">
//                       <div className="h_bd10 centerdp10 bg_dp10 fw-bold ball_dp10">
//                         OTHER DETAILS
//                       </div>
//                       <div className="d-flex flex-column justify-content-between w-100 px-1 ball_dp10 border-top-0 p-1">
//                         <div className="d-flex">
//                           <div className="w-50 fw-bold start_dp10 fsgdp10">
//                             RATE IN 24KT
//                           </div>
//                           <div className="w-50 end_dp10 fsgdp10">
//                             {result?.header?.MetalRate24K?.toFixed(2)}
//                           </div>
//                         </div>
//                         <div>
//                           {result?.header?.BrokerageDetails?.map((e, i) => {
//                             return (
//                               <div className="d-flex fsgdp10" key={i}>
//                                 <div className="w-50 fw-bold start_dp10">
//                                   {e?.label}
//                                 </div>
//                                 <div className="w-50 end_dp10">{e?.value}</div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     </div> */}
                    
//                      {/* {
//                       result?.header?.PrintRemark === '' ? <div style={{width:'15%'}}></div> : <div className="remark_sum_dp10 fsgdp10">
//                       <div className="h_bd10 centerdp10 bg_dp10 fw-bold ball_dp10">
//                         Remark
//                       </div>
//                        <div className="ball_dp10 border-top-0 p-1 text-break">
//                         {result?.header?.PrintRemark}
//                       </div>
//                     </div>
//                      }  */}
//                     {/* <div className="check_dp10 ball_dp10 d-flex justify-content-center align-items-end pb-1 fsgdp10">
//                       <i>Created By</i>
//                     </div> */}
//                     <div className="check_dp10 ball_dp10 d-flex justify-content-center align-items-end pb-1 fsgdp10 ">
//                       <i>Checked By</i>
//                     </div>
//                   </div>
//                   <div style={{color:'gray', fontSize:'8px'}} className="pt-3" >**   THIS IS A COMPUTER GENERATED INVOICE AND KINDLY NOTIFY US IMMEDIATELY IN CASE YOU FIND ANY DISCREPANCY IN THE DETAILS OF TRANSACTIONS</div>
                
//               </div> : <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto"> {msg} </p> }
//     </>
//   )
// }

// export default QuotePrintLP