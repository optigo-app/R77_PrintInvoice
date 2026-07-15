//invoice print 3 and 4
import React, { useState } from "react";
import {
  FooterComponent,
  HeaderComponent,
  NumberWithCommas,
  apiCall,
  checkMsg,
  formatAmount,
  isObjectEmpty,
  numberToWord,
  taxGenrator,
} from "../../GlobalFunctions";
import { useEffect } from "react";
import Loader from "../../components/Loader";
import Button from "../../GlobalFunctions/Button";
import "../../assets/css/salesprint/saleprint9.css";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { cloneDeep } from "lodash";
import { NumToWord } from './../../GlobalFunctions/NumToWord';
import QrCodeForPrint from "../../components/QrCodeForPrint";

const SalePrint9 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  const [header, setHeader] = useState(null);
  const [result, setResult] = useState();
  const [descArr, setDescArr] = useState("");
  const [loader, setLoader] = useState(true);
  const [msg, setMsg] = useState("");
  const [isImageWorking, setIsImageWorking] = useState(true);
  const [total_makingcharge_unit, setTotalMakingChargeUnit] = useState(0);
  const [diamond_s, setDiamond_s] = useState([]);
  const [colorstone_s, setColorStone_s] = useState([]);
  const [metal_s, setMetal_s] = useState([]);
  const [descText, setDescText] = useState();

  const handleImageErrors = () => {
    setIsImageWorking(false);
  };

  async function loadData(data) {
    try {

      setLoader(false);


      let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
      data.BillPrint_Json[0].address = address;
 
      const datas = OrganizeDataPrint(
        data?.BillPrint_Json[0],
        data?.BillPrint_Json1,
        data?.BillPrint_Json2
      );

      const datas2 = OrganizeDataPrint(
        data?.BillPrint_Json[0],
        data?.BillPrint_Json1,
        data?.BillPrint_Json2
      );

      const datas_clone = cloneDeep(datas2);
      

      loadData2( datas_clone)

      let sen = '';
      let metal = datas?.json2?.filter((e) => e?.MasterManagement_DiamondStoneTypeid === 4)
      if(metal.length > 0){
        sen = 'GOLD';
      }
      let sen2 = '';
      let diamond = datas?.json2?.filter((e) => e?.MasterManagement_DiamondStoneTypeid === 1)
      if(diamond.length > 0){
        sen2 = 'DIAMOND'
      }
      let sen3 = '';
      let colorstone = datas?.json2?.filter((e) => e?.MasterManagement_DiamondStoneTypeid === 2)
      if(colorstone.length > 0){
        sen3 = 'COLORSTONE'
      }
      let sen4 = '';
      let misc = datas?.json2?.filter((e) => e?.MasterManagement_DiamondStoneTypeid === 3)
      if(misc.length > 0){
        sen4 = 'CZ STUDDED'
      }
      let result1 = [(sen === '' ? 'GOLD' : 'GOLD'), sen2, sen3, sen4]?.join(", ");
      setDescArr(result1);

      let diamonds = [];
      let colorstones = [];
      let metals = [];
      datas?.resultArray?.forEach((e) => {
        e?.diamonds?.forEach((el) => {
          let findRecord = diamonds?.findIndex((a) =>  a?.Rate === el?.Rate)
          if(findRecord === -1){
            let obj = {...el};
            obj.wt = obj?.Wt;
            obj.rate = obj?.Rate;
            obj.amount = obj?.Amount;
            diamonds.push(obj);
          }else{
            diamonds[findRecord].wt += el?.Wt;
            diamonds[findRecord].rate += el?.Rate;
            diamonds[findRecord].amount += el?.Amount;
          }
        })

        e?.colorstone?.forEach((el) => {
          let findRecord = colorstones?.findIndex((a) => a?.Rate === el?.Rate)
          if(findRecord === -1){
            let obj = {...el};
            obj.wt = obj?.Wt;
            obj.rate = obj?.Rate;
            obj.amount = obj?.Amount;
            colorstones.push(obj);
          }else{
            colorstones[findRecord].wt += el?.Wt;
            colorstones[findRecord].rate += el?.Rate;
            colorstones[findRecord].amount += el?.Amount;
          }
        })
      })

      colorstones?.sort((a, b) => a?.Rate - b?.Rate)
      diamonds?.sort((a, b) => a?.Rate - b?.Rate)
      setDiamond_s(diamonds);
      setColorStone_s(colorstones);

      let resultArr = [];
      datas?.resultArray?.forEach((e) => {
        let obj = cloneDeep(e);
        obj.primaryMetal = e?.metal?.find((ele, ind) => ele?.IsPrimaryMetal === 1);
        
        let primaryWt = 0;
        let count = 0;
        let secondaryMetalAmount = 0;
        let secondaryWt = 0;
        e?.metal?.forEach((ele, ind) => {
          count += 1;
          if (ele?.IsPrimaryMetal === 1) {
            primaryWt += ele?.Wt;
          } else {
            secondaryMetalAmount += ele?.Amount;
            secondaryWt += ele?.Wt;
          }
        });
        let netWtFinal = e?.NetWt + e?.LossWt - secondaryWt
        obj.primaryWt = primaryWt;
        obj.netWtFinal = netWtFinal;
        obj.metalAmountFinal = e?.MetalAmount;
        if (count <= 1) {
          primaryWt = e?.NetWt + e?.LossWt;
      }
        if (obj?.primaryMetal) {
          let findRecord = resultArr?.findIndex((ele, ind) => ele?.primaryMetal?.ShapeName === obj?.primaryMetal?.ShapeName && ele?.primaryMetal?.QualityName === obj?.primaryMetal?.QualityName && ele?.primaryMetal?.Rate === obj?.primaryMetal?.Rate);
          if (findRecord === -1) {
              resultArr?.push(obj);
          } else {
              resultArr[findRecord].primaryWt += obj?.primaryWt;
              resultArr[findRecord].primaryMetal.Pcs += obj?.primaryMetal.Pcs;
              resultArr[findRecord].primaryMetal.Wt += obj?.primaryMetal.Wt;
              resultArr[findRecord].primaryMetal.Amount += obj?.primaryMetal.Amount;
              resultArr[findRecord].netWtFinal += obj?.netWtFinal;
              resultArr[findRecord].metalAmountFinal += obj?.metalAmountFinal;
          }
      }
      })



      let headerComp = HeaderComponent('4', result?.header)
      setHeader(headerComp);


      setMetal_s(resultArr);
      setResult(datas);

    } catch (error) {
      console.log(error);
    }
  }
useEffect(() => {
  if(diamond_s?.length > 0){
    setDescText('DIAMOND STUDDED JEWELLERY')
  }else{
    setDescText('GOLD JEWELLERY')
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [descArr])

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

  async function loadData2(data){
    let datas = data;

    let finalArr = [];

    datas?.resultArray?.forEach((a) => {
      let findingwt = 0;
      datas?.json2?.forEach((el) => {
        if(a?.SrJobno === el?.StockBarcode){
          if(el?.MasterManagement_DiamondStoneTypeid === 5){
            if(el?.Supplier === 'customer' || el?.supplier === 'Customer'){
              findingwt += el?.Wt;
            }
          }
        }
      })
      let obj = {...a};
      obj.findingwt = findingwt;
      finalArr.push(obj);
    })

    let finalArr2 = [];
    finalArr?.forEach((e) => {
      let obj = {...e};
      let lbr_wt = 0;
       lbr_wt = ((obj?.MetalDiaWt - obj?.findingwt));
      
      obj.lbr_wt = lbr_wt;
      finalArr2.push(obj);
    })
    let finalArr3 = [];
    finalArr2?.forEach((a) => {
      let obj = {...a};
      let lbr_amt = 0;
        lbr_amt = ((obj?.MetalDiaWt - obj?.findingwt) * obj?.MaKingCharge_Unit);
        obj.lbr_amt = lbr_amt;
        finalArr3.push(obj);
    })

    let tot_lbr_wt =0;
    let tot_lbr_amt =0;

    finalArr3.forEach((a) => {
      tot_lbr_wt += a?.lbr_wt;
      tot_lbr_amt += a?.lbr_amt;
    })


    let finalArr4 = [];
    finalArr4?.forEach((a) => {
      let obj = {...a};
      let lbr_rate = 0;
      lbr_rate = ((obj?.lbr_amt) / (obj?.lbr_wt));
      obj.lbr_rate = lbr_rate;
      finalArr4.push(obj);
    })
    datas.resultArray = finalArr4;

    let lbr_rate_total = 0;

    lbr_rate_total = (tot_lbr_amt / (tot_lbr_wt === 0 ? 1 : tot_lbr_wt))
    let rounduplabour =  Math.round(lbr_rate_total)
    setTotalMakingChargeUnit(rounduplabour);

  }

  return (
    <React.Fragment>
      {loader ? (
        <Loader />
      ) : (
        <>
          {msg === "" ? (
            <>
              <div>
                
                <div className="containerinvp4 pad_60_allPrint">
                <div className="container max_width_container px-2 print_sec_sum4 pt-2 pb-4">
                  <Button />
                </div>
                  <div>
                    <div>
                      { result?.header?.IsEinvoice ? <div className="headline_invp4"> {result?.header?.E_InvoiceType} <span style={{marginLeft:'63%'}}>{result?.header?.E_HeadLabel}</span></div> : <div className="headline_invp4"> {result?.header?.PrintHeadLabel} </div> }
                      { result?.header?.IsEinvoice ? <>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                        <div className='p-3'>  {isImageWorking && (result?.header?.PrintLogo !== "" && 
                          <img src={result?.header?.PrintLogo} alt="" 
                          className='w-100 h-auto  d-block object-fit-contain'
                          style={{minHeight:'75px', minWidth:'115px', maxWidth:'117px', maxHeight:'75px'}}
                          onError={handleImageErrors} height={120} width={150} />)}
                        </div>
                        <div className="invp4_fs p-1">
                          <div className="invp4_fs_2 fw-bold">{result?.header?.CompanyFullName}</div>
                          <div>{result?.header?.CompanyAddress}</div>
                          <div>{result?.header?.CompanyAddress2}</div>
                          <div>{result?.header?.CompanyCity} - {result?.header?.CompanyPinCode}, {result?.header?.CompanyState}({result?.header?.CompanyCountry})</div>
                          <div>T {result?.header?.CompanyTellNo}</div>
                          <div>{result?.header?.CompanyEmail} | {result?.header?.CompanyWebsite}</div>
                          <div>{result?.header?.Company_VAT_GST_No} | {result?.header?.Company_CST_STATE} - {result?.header?.Company_CST_STATE_No} | PAN - {result?.header?.Pannumber} </div>
                          <div>CIN - {result?.header?.CINNO}  MSME - {result?.header?.MSME} </div>
                        </div>
                        </div>
                        <div>
                          <div className="p-4 pb-2 max_qr_invp4"><div className="max_qr_invp4_2"><QrCodeForPrint text="hellosdkjnksdfbnkjbsfkjbbdasfklnenfsdeflkhnresglkjgklkndfkgjngkjngklnasdfkjndfdglkndfgknkdfgjnkjadekjsdnkj" /></div></div>
                          <div className="text-break fw-bold pb-2 invp4_fs">{result?.header?.InvoiceBillType}</div>
                        </div>
                      </div>
                      <div className="invp4_fs border mb-2">
                        <div className="fw-bold p-1">1. e-Invoice Details</div>
                        <div className="border-top invp4_fs d-flex align-items-center pb-4">
                            <div className="w-50 p-1"><span className="fw-bold">IRN : </span>{result?.header?.E_IRN}</div>
                            <div className="w-25 p-1"><span className="fw-bold">Ack. No : </span>{result?.header?.E_AckNo}</div>
                            <div className="w-25 p-1"><span className="fw-bold">Ack. Date :</span>{result?.header?.E_AckDt}</div>
                        </div>
                      </div>
                      <div className="invp4_fs border mb-2">
                        <div className="fw-bold p-1">2.Transaction Details</div>
                        <div className="border-top invp4_fs d-flex align-items-center">
                            <div className="w-25"><span className="fw-bold px-1">Category :</span>{result?.header?.E_Category}</div>
                            <div className="w-25"><span className="fw-bold px-1">Invoice No :</span>{result?.header?.InvoiceNo}</div>
                            <div className="w-25"><span className="fw-bold px-1">IGST on INTRA :</span>{result?.header?.E_INTRA}</div>
                        </div>
                        <div className=" invp4_fs d-flex align-items-center pb-4">
                            <div className="w-25"><span className="fw-bold px-1 invp4_fs">Invoice Type :</span>{result?.header?.E_InvoiceType}</div>
                            <div className="w-25"><span className="fw-bold px-1 invp4_fs">Invoice Date :</span>{result?.header?.EntryDate}</div>
                            <div className="w-25"><span className="fw-bold px-1 invp4_fs">	Description :</span>{result?.header?.E_BTY}</div>
                        </div>
                      </div>
                      </>
                       : <div className="d-flex justify-content-between align-items-center">
                        <div className="invp4_fs p-1">
                          <div className="invp4_fs_2 fw-bold">{result?.header?.CompanyFullName}</div>
                          <div>{result?.header?.CompanyAddress}</div>
                          <div>{result?.header?.CompanyAddress2}</div>
                          <div>{result?.header?.CompanyCity} - {result?.header?.CompanyPinCode}, {result?.header?.CompanyState}({result?.header?.CompanyCountry})</div>
                          <div>T {result?.header?.CompanyTellNo}</div>
                          <div>{result?.header?.CompanyEmail} | {result?.header?.CompanyWebsite}</div>
                          <div>{result?.header?.Company_VAT_GST_No} | {result?.header?.Company_CST_STATE} - {result?.header?.Company_CST_STATE_No} | PAN - {result?.header?.Pannumber} </div>
                          <div>CIN - {result?.header?.CINNO}  MSME - {result?.header?.MSME} </div>
                        </div>
                        
                        <div className='pe-4'>  {isImageWorking && (result?.header?.PrintLogo !== "" && 
                          <img src={result?.header?.PrintLogo} alt="" 
                          className='w-100 h-auto my-0 mx-auto d-block object-fit-contain'
                          style={{minHeight:'75px', minWidth:'115px', maxWidth:'117px', maxHeight:'75px'}}
                          onError={handleImageErrors} height={120} width={150} />)}
                        </div>

                      </div>}
                    </div>
                    {/* <div>{header}</div> */}
                    <div className="subheadinvp4 d-flex justify-content-between p-1" style={{border:"1px solid #e8e8e8", borderBottom:"1px solid #e8e8e8"}}>
                      <div className="w-75 h-100 invp4_fs">
                        <div > {result?.header?.lblBillTo} </div>
                        <div className="invp4_fs_2 fw-bold"> {result?.header?.customerfirmname} </div>
                        <div > {result?.header?.customerAddress1} </div>
                        <div > {result?.header?.customerAddress2} </div>
                        <div > {result?.header?.customerAddress3} </div>
                        <div > {result?.header?.customercity} {result?.header?.customerpincode} </div>
                        <div > {result?.header?.customeremail1} </div>
                        <div > {result?.header?.Cust_CST_STATE_No_} </div>
                        <div > {result?.header?.vat_cst_pan} </div>
                      </div>
                      <div className="w-25 invp4_fs">
                          <div className="d-flex justify-content-end pe-2 w-100">
                            <div className="fw-bold w_30_invp4 d-flex justify-content-start">#INVOICE</div>
                            <div className="w-50 d-flex justify-content-end">{result?.header?.InvoiceNo}</div>
                          </div>
                          <div className="d-flex justify-content-end pe-2 w-100">
                            <div className="fw-bold w_30_invp4 d-flex justify-content-start">DATE</div>
                            <div className="w-50 d-flex justify-content-end">{result?.header?.EntryDate}</div>
                          </div>
                          <div className="d-flex justify-content-end pe-2 w-100">
                            <div className="fw-bold w_30_invp4 d-flex justify-content-start">{result?.header?.HSN_No_Label}</div>
                            <div className="w-50 d-flex justify-content-end">{result?.header?.HSN_No}</div>
                          </div>
                          {
                            result?.header?.DueDays === 0 ? '' : <div className="d-flex justify-content-end pe-2 w-100">
                            <div className="fw-bold w_30_invp4 d-flex justify-content-start">DUE DATE</div>
                            <div className="w-50 d-flex justify-content-end">{result?.header?.DueDate}</div>
                          </div>
                          }
                         
                      </div>
                    </div>
                  </div>
                  
                   <div className="invp4_fs" style={{ fontSize:'12px', position:'relative' }} >
            
                 <div className="d-flex w-100 fw-bold mt-1 border">
                  <div style={{width:'40%'}} className="d-flex justify-content-center border-end">DESCRIPTION</div>
                  <div style={{width:'30%'}} className="ps-2">DETAIL</div>
                  <div className="end_invp4_ pe-1" style={{width:'10%'}}>WEIGHT</div>
                  <div className="end_invp4_ pe-1" style={{width:'10%'}}>RATE</div>
                  <div className="end_invp4_ pe-1" style={{width:'10%'}}>AMOUNT</div>
                 </div>
      
                 <div className="w-100 border-bottom" >
          
                 <div className="d-flex justify-content-start align-items-center border-start border-end  position-absolute" style={{    top: "50%", marginLeft:'10%'}}>
                  <input type="text"  style={{width:'170px',}} className="d-flex justify-content-center align-items-center  position-absolute showValOnly" value={descText} onChange={(e) => setDescText(e.target.value)} />
                  </div>
                  {
                    metal_s?.map((e, i) => {
                      return(
                        <div key={i} className="d-flex w-100   border-start border-end invp4_fs" >
                        <div style={{width:'40%'}} className="d-flex justify-content-center border-end"></div>
                        <div style={{width:'30%'}} className="ps-2"> {e?.primaryMetal?.ShapeName} {e?.primaryMetal?.QualityName} </div>
                        <div className="end_invp4_ pe-1" style={{width:'10%'}}>{e?.netWtFinal?.toFixed(3)} gm</div>
                        <div className="end_invp4_ pe-1" style={{width:'10%'}}>{ e?.metalAmountFinal === 0 ? '' : formatAmount((((e?.metalAmountFinal)/((e?.netWtFinal === 0 ? 1 : e?.netWtFinal))) / result?.header?.CurrencyExchRate))}</div>
                        <div className="end_invp4_ pe-1" style={{width:'10%'}}>{ e?.metalAmountFinal === 0 ? '' : formatAmount((e?.metalAmountFinal / result?.header?.CurrencyExchRate))}</div>
                        </div>
                      )
                    })
                  }
                  {
                    diamond_s?.map((e, i) => {
                      return(
                        <div key={i} className="d-flex w-100   border-start border-end invp4_fs" >
                        <div style={{width:'40%'}} className="d-flex justify-content-center border-end"></div>
                        <div style={{width:'30%'}} className="ps-2">{e?.MasterManagement_DiamondStoneTypeName}</div>
                        <div className="end_invp4_ pe-1" style={{width:'10%'}}>{e?.wt?.toFixed(3)} ctw</div>
                        <div className="end_invp4_ pe-1" style={{width:'10%'}}>{ e?.amount === 0 ? '' : Math.round(((e?.amount / result?.header?.CurrencyExchRate))/((e?.wt === 0 ? 1 : e?.wt)))}</div>
                        <div className="end_invp4_ pe-1" style={{width:'10%'}}>{ e?.amount === 0 ? '' : formatAmount(e?.amount)}</div>
                        </div>
                      )
                    })
                  }
                  {
                    colorstone_s?.map((e, i) => {
                      return(
                        <div key={i} className="d-flex w-100   border-start border-end invp4_fs" >
                        <div style={{width:'40%'}} className="d-flex justify-content-center border-end"></div>
                        <div style={{width:'30%'}} className="ps-2">{e?.MasterManagement_DiamondStoneTypeName}</div>
                        <div className="end_invp4_ pe-1" style={{width:'10%'}}>{e?.wt?.toFixed(3)} ctw</div>
                        <div className="end_invp4_ pe-1" style={{width:'10%'}}>{ e?.amount === 0 ? '' : Math.round(((e?.amount / result?.header?.CurrencyExchRate))/((e?.wt === 0 ? 1 : e?.wt)))}</div>
                        <div className="end_invp4_ pe-1" style={{width:'10%'}}>{ e?.amount === 0 ? '' : formatAmount(e?.amount)}</div>
                        </div>
                      )
                    })
                  } 
            
                        <div className="d-flex w-100  fsinvp3 border-start border-end invp4_fs" >
                        <div style={{width:'40%'}} className="d-flex justify-content-center border-end"></div>
                        <div style={{width:'30%'}} className="ps-2">LABOUR</div>
                        <div style={{width:'10%'}}></div>
                        <div className="end_invp4_ pe-1 invp4_fs" style={{width:'10%'}}>{total_makingcharge_unit === 0 ? '' : total_makingcharge_unit}</div>
                        <div className="end_invp4_ pe-1 invp4_fs" style={{width:'10%'}}>{formatAmount((result?.mainTotal?.total_Making_Amount + result?.mainTotal?.total_TotalCsSetcost + result?.mainTotal?.total_TotalDiaSetcost + result?.mainTotal?.totalMiscAmount + result?.mainTotal?.total_diamondHandling))}</div>
                        </div>
                        <div className="d-flex w-100  fsinvp3 border-start border-end">
                        <div style={{width:'40%'}} className="d-flex justify-content-center border-end"></div>
                        <div style={{width:'30%'}} className="ps-2 invp4_fs">OTHER</div>
                        <div style={{width:'10%'}}></div>
                        <div style={{width:'10%'}}></div>
                        <div className="end_invp4_ pe-1 invp4_fs" style={{width:'10%'}}>{formatAmount(result?.mainTotal?.total_other)}</div>
                        </div>
                 </div>
                 <div className="d-flex w-100 fw-bold border-top-0 border invp4_fs_3">
                  <div style={{width:'40%'}} className="d-flex justify-content-center border-end"></div>
                  <div style={{width:'30%'}} className="ps-2 invp4_fs">TOTAL</div>
                  <div style={{width:'10%'}}></div>

                  <div className="end_invp4_ pe-1 invp4_fs" style={{width:'20%'}}>{formatAmount(result?.mainTotal?.total_amount)}</div>
                 </div>
                </div>
                  <div className="summaryinvp4">
                    <div style={{ width: "60%", height: "100%" }}></div>
                    <div style={{ width: "40%" }}>
                      <div style={{ borderLeft: "1px solid #e8e8e8" }}>
                        <div className="d-flex flex-column justify-content-between align-items-center ps-1">
                          {result?.allTaxes?.map((e, i) => {
                            return (
                              <div className="d-flex justify-content-between align-items-center w-100 invp4_fs" key={i} >
                                <div className="w-50 invp4_fs" style={{ borderRight: "1px solid #e8e8e8" }} >
                                  {e?.name} {e?.per}
                                </div>
                                <div className="w-50 d-flex justify-content-end align-items-center invp4_fs pe-1">
                                  {formatAmount((+e?.amount * result?.header?.CurrencyExchRate))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {result?.header?.AddLess !== 0 && (
                          <div className="d-flex justify-content-between align-items-center ps-1">
                            <div className="w-50 invp4_fs" style={{ borderRight: "1px solid #e8e8e8" }} >
                              {result?.header?.AddLess > 0 ? "Add" : "Less"}
                            </div>
                            <div className="w-50 d-flex justify-content-end align-items-center pe-1 invp4_fs">
                              {formatAmount(result?.header?.AddLess)}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="d-flex justify-content-between align-items-center ps-1 fw-bold" style={{ borderTop: "1px solid #e8e8e8", borderLeft: "1px solid #e8e8e8", }} >
                        <div className="w-50 invp4_fs" style={{fontSize:"13px"}}>GRAND TOTAL</div>
                        <div className="w-50 d-flex justify-content-end align-items-center pe-1 invp4_fs" style={{fontSize:"13px"}}>
                  
                          {formatAmount((result?.mainTotal?.total_amount + (result?.allTaxesTotal * result?.header?.CurrencyExchRate) + result?.header?.AddLess))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="wordsinvp4">
                    <div className="invp4_fs">In Words Indian Rupees</div>
                    <div className="fw-bold invp4_fs">{NumToWord((result?.mainTotal?.total_amount + (result?.allTaxesTotal * result?.header?.CurrencyExchRate) + result?.header?.AddLess))}</div>
                  </div>
                  <div className="noteinvp4">
                    <div className="fw-bold">NOTE:</div>
                    <div className="text-break" dangerouslySetInnerHTML={{ __html: result?.header?.PrintRemark }}></div>
                  </div>
                  <div className="declarationinvp4" style={{borderBottom:'1px solid #e8e8e8'}}>
                    <div className="fw-bold fs12invp4" style={{fontWeight:"bold"}}>DECLARATION :</div>
                    <div style={{ fontWeight: "bold" }} className="text-break dec_invp4_fs" dangerouslySetInnerHTML={{ __html: result?.header?.Declaration }} ></div>
                  </div>
                  <div className="d-flex brright_invp4 brbottom_invp4 brleft_invp4 footer_invp4_box">
                    <div className="invp4_33 brright_invp4 invp4_fs p-1">
                      <div className="fw-bold">Bank Detail</div>
                      <div>Account Name : {result?.header?.accountname}</div>
                      <div>Bank Name : {result?.header?.bankname}</div>
                      <div>Branch : {result?.header?.bankaddress}</div>
                      <div>Account No : {result?.header?.accountnumber}</div>
                      <div>RTGS/NEFT IFSC : {result?.header?.rtgs_neft_ifsc}</div>
                    </div>
                    <div className="invp4_33 brright_invp4 invp4_fs p-1 d-flex flex-column justify-content-between align-items-start ">
                        <div>Signature</div>
                        <div className="fw-bold pb-2">{result?.header?.customerfirmname}</div>
                    </div>
                    <div className="invp4_33 invp4_fs p-1 d-flex flex-column justify-content-between align-items-start ">
                      <div>Signature</div>
                      <div className="fw-bold pb-2">{result?.header?.CompanyFullName}</div>
                    </div>
                    
                  </div>

                </div>
              </div>
            </>
          ) : (
            <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
              {msg}
            </p>
          )}
        </>
      )}
    </React.Fragment>
  );
};

export default SalePrint9;
