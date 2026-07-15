import React, { useEffect, useState } from 'react'
import "../../assets/css/prints/detailprint6.css";
import { ToWords } from "to-words";
import { apiCall, checkMsg, formatAmount, handleImageError, handlePrint, isObjectEmpty } from '../../GlobalFunctions';
import { cloneDeep } from 'lodash';
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import Loader from '../../components/Loader';
const DetailPrint6 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {

  const toWords = new ToWords();
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const [alltotal, setAllTotal] = useState(0);
  const [imgFlag, setImgFlag] = useState(true);
  const [miscObj, setMiscObj] = useState({
    Wt:0,
    Pcs:0
  })
  const [mcompany, setMcompany] = useState({
    m_Pcs: 0,
    m_Wt:0,
  })
  const [isImageWorking, setIsImageWorking] = useState(true);
  

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
        console.log(error);
      }
    };
    sendData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = (data) => {

    const copydata = cloneDeep(data);

    let address = copydata?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    copydata.BillPrint_Json[0].address = address;

    const datas = OrganizeDataPrint(
      copydata?.BillPrint_Json[0],
      copydata?.BillPrint_Json1,
      copydata?.BillPrint_Json2
    );

    let TOT = 0;
    datas?.resultArray?.forEach((e) => {
      e?.metal?.forEach((e) => {
        if(e?.IsPrimaryMetal === 1){
          TOT += e?.Amount;
        }
      })
      e?.diamond_colorstone_misc?.forEach((e) => {
        TOT += e?.Amount;
      })
    })
    let obj = {
      m_Pcs:0,
      m_Wt:0
    }
    datas?.json2?.forEach((e) => {

      if(e?.MasterManagement_DiamondStoneTypeid === 3){
        if(e?.Supplier === 'Company'){
          if(e?.ShapeName === "Hallmark" || e?.ShapeName === "Stamping") return ''
          else{
              obj.m_Pcs += e?.Pcs;
              obj.m_Wt += e?.Wt;      
          }
        }
      }
      // if(e?.MasterManagement_DiamondStoneTypeid === 3){
      //   if(e?.ShapeName === "Hallmark" || e?.ShapeName === "Stamping") return ''
      //   else{
      //     if(e?.Supplier === "Company"){
      //       if(e?.ShapeName?.includes("Certification") && e?.Wt === 0) return ''
      //       else{
      //         obj.m_Pcs += e?.Pcs;
      //         obj.m_Wt += e?.Wt;
      //       }
      //     }
      //   }
      // }
    })
    datas?.resultArray?.forEach((e) => {
      let jobwise_dia_Wt = 0;
      e?.diamond_colorstone_misc?.forEach((el) => {
        if(el?.MasterManagement_DiamondStoneTypeid === 1){
            jobwise_dia_Wt += el?.Wt;
          }
      })
      e.jobwise_dia_wt_certificate = jobwise_dia_Wt;
    })
    datas?.resultArray?.forEach((ee) => {
      let d_c_m = [];
      ee?.diamond_colorstone_misc?.forEach((e) => {
          let findRecord = d_c_m?.findIndex((el) => 
          el?.MasterManagement_DiamondStoneTypeName === e?.MasterManagement_DiamondStoneTypeName &&
          el?.ShapeName === e?.ShapeName &&
          el?.QualityName === e?.QualityName &&
          el?.Colorname === e?.Colorname &&
          el?.SizeName === e?.SizeName)
          if(findRecord === -1){
            let obj = {...e};
            obj.jwt = e?.Wt;
            obj.jpcs = e?.Pcs;
            obj.jrate = e?.Rate;
            obj.jamount = e?.Amount;
            d_c_m?.push(obj);
          }else{  
            d_c_m[findRecord].jwt += e?.Wt;
            d_c_m[findRecord].jpcs += e?.Pcs;
            d_c_m[findRecord].jrate += e?.Rate;
            d_c_m[findRecord].jamount += e?.Amount;
          }
      })
      ee.diamond_colorstone_misc = d_c_m;
    })
    // datas?.resultArray?.forEach((e) => {
    //   let arr = [];
    //   let findIndex = e?.misc?.reduce((acc, cObj) => cObj?.IsHSCOE === 0 ? acc+1 : acc, 0);
    //   if(findIndex !== 0){
    //     e?.misc?.forEach((a) => {
    //       if(a?.IsHSCOE !== 1 && a?.IsHSCOE !== 2){
    //         arr?.push(a)
    //       }
    //     })
    //   }
    //     e.misc = arr;
    //   // e?.misc?.forEach((el) => {
    //   //     if(el?.IsHSCOE)
    //   // })
    // })
    // datas?.resultArray?.forEach((e) => {
    //   if(e?.misc?.length === 1){
    //     if(e?.misc[0]?.ShapeName?.includes('Certification')){
    //       e.misc  = [];
    //     }
    //   }else{
    //   }
    // })

    datas?.resultArray?.forEach((e) => {
      let arr = [];
      e?.misc?.forEach((a) => {
        if(a?.IsHSCOE === 0 || a?.IsHSCOE === 3){
          arr?.push(a);
        }
        // if(a?.IsHSCOE === 0){
        //     if(a?.IsHSCOE === 1 || a?.IsHSCOE === 2){
        //         return ''
        //     }else if(a?.IsHSCOE === 0 || a?.IsHSCOE === 3){
        //       arr?.push(a);
        //     }
        // }
      })

      if(arr?.length === 1){
        if(arr[0]?.IsHSCOE === 3 && arr[0]?.Rate === 0){
            arr = [];
        }
      }
      // let arr2 = [];
      // arr?.forEach((a) => {
      //   if(a?.IsHSCOE !== 0){
      //       return ''
      //   }else{
      //     arr2.push(a);
      //   }
      // })

      e.misc = arr;
    })
    
    let obj2 = {
      Wt:0,
      Pcs:0
    }
    datas?.resultArray?.forEach((a) => {
      // a?.misc?.forEach((el) => {
      a?.miscList_duplicate?.forEach((el) => {
        if(el?.Supplier === 'Company'){
          if(el?.IsHSCOE === 0 || el?.IsHSCOE === 3){
            // obj2.Wt += el?.Wt + el?.ServWt;
            obj2.Pcs += el?.Pcs;
          }
        }
      })
    })

    datas?.resultArray?.forEach((e) => {
      let diaArr = [];
      let colorArr = [];
      let miscArr = [];
      
        e?.diamonds?.forEach((a) => {

          let findRecord = diaArr?.findIndex((el) => el?.ShapeName === a?.ShapeName && el?.QualityName === a?.QualityName && el?.Colorname === a?.Colorname && el?.SizeName === a?.SizeName );
          if(findRecord === -1){
            let obj = {...a};
            obj._Wt = a?.Wt;
            obj._Pcs = a?.Pcs;
            obj._Rate = a?.Rate;
            obj._Amount = a?.Amount;
            diaArr.push(obj);
          }else{
            diaArr[findRecord]._Wt += a?.Wt;
            diaArr[findRecord]._Pcs += a?.Pcs;
            // diaArr[findRecord]._Rate += a?.Rate;
            diaArr[findRecord]._Rate += a?.Rate;
            diaArr[findRecord]._Amount += a?.Amount;
          }
        })

        e.diamonds = diaArr;

        e?.colorstone?.forEach((a) => {

          let findRecord = colorArr?.findIndex((el) => el?.ShapeName === a?.ShapeName && el?.QualityName === a?.QualityName && el?.Colorname === a?.Colorname && el?.SizeName === a?.SizeName);
          if(findRecord === -1){
            let obj = {...a};
            obj._Wt = a?.Wt;
            obj._Pcs = a?.Pcs;
            obj._Rate = a?.Rate;
            obj._Amount = a?.Amount;
            colorArr.push(obj);
          }else{
            colorArr[findRecord]._Wt += a?.Wt;
            colorArr[findRecord]._Pcs += a?.Pcs;
            colorArr[findRecord]._Rate += a?.Rate;
            colorArr[findRecord]._Amount += a?.Amount;
          }
        })

        e.colorstone = colorArr;
        
        e?.misc?.forEach((a) => {

          let findRecord = miscArr?.findIndex((el) => el?.ShapeName === a?.ShapeName && el?.QualityName === a?.QualityName && el?.Colorname === a?.Colorname && el?.SizeName === a?.SizeName);
          if(findRecord === -1){
            let obj = {...a};
            obj._Wt = a?.Wt;
            obj._Pcs = a?.Pcs;
            obj._Rate = a?.Rate;
            obj._Amount = a?.Amount;
            miscArr.push(obj);
          }else{
            miscArr[findRecord]._Wt += a?.Wt;
            miscArr[findRecord]._Pcs += a?.Pcs;
            miscArr[findRecord]._Rate += a?.Rate;
            miscArr[findRecord]._Amount += a?.Amount;
          }
        })

        e.misc = miscArr;

    })

    setMiscObj(obj2)
    setMcompany(obj);
    setAllTotal(TOT);
    setResult(datas);


  }
  const handleImgShow = () => {
    if (imgFlag) setImgFlag(false);
    else {
      setImgFlag(true);
    }
  };
  return (
      <>
      {
        loader ? <Loader /> : <>
        {
          msg === '' ? <div>
          <div className='container_dp6'>
            <div className='d-flex justify-content-end align-items-center mt-5 mb-5 px-2 d_none_dp6'>
            <input
                    type="checkbox"
                    checked={imgFlag}
                    id="showImg"
                    onChange={handleImgShow}
                    className="mx-2"
                  />
                  <label htmlFor="showImg" className="me-2 user-select-none">
                    With Image
                  </label>
                  <button
                    className="btn_white blue m-0 "
                    onClick={(e) => handlePrint(e)}
                  >
                    Print
                  </button>
            </div>
            <div>
              <div className='headlabel_dp6'>{result?.header?.PrintHeadLabel}</div>
              <div className='d-flex flex-column justify-content-center align-items-center p-1 fs_dp6'>
                <div className='p-2'>
                {isImageWorking && (result?.header?.PrintLogo !== "" && 
                      <img src={result?.header?.PrintLogo} alt="" 
                      className='w-100 h-auto my-0 mx-auto d-block object-fit-contain'
                      style={{minHeight:'75px', minWidth:'115px', maxWidth:'117px', maxHeight:'75px'}}
                      onError={handleImageErrors} height={120} width={150} />)}
                  {/* <img src={result?.header?.PrintLogo} alt="#companylogo" className='printlogo_dp6' /> */}
                  </div>
                <div className='fw-bold fs-6'>{result?.header?.CompanyFullName}</div>
                {/* <div>{result?.header?.CompanyAddress?.split(",")[0]}</div> */}
                <div>{result?.header?.CompanyAddress}</div>
                {/* <div>{result?.header?.CompanyAddress2?.split(",")[0]}</div> */}
                <div>{result?.header?.CompanyAddress2}</div>
                <div>{result?.header?.CompanyCity}-{result?.header?.CompanyPinCode}, {result?.header?.CompanyState}({result?.header?.CompanyCountry})</div>
                <div>T {result?.header?.CompanyTellNo} | TOLL FREE {result?.header?.CompanyTollFreeNo}</div>
                <div>{result?.header?.Company_VAT_GST_No} | {result?.header?.Company_CST_STATE}-{result?.header?.Company_CST_STATE_No} | PAN-{result?.header?.Com_pannumber}</div>
                <div>CIN: {result?.header?.CINNO} | MSME: {result?.header?.MSME}</div>
                <div className='fw-bold'>{result?.header?.InvoiceBillType}</div>
              </div>
            </div>
            <div className='d-flex border fs_dp6'>
              <div className='p-1 w-25 border-end'>    
                  <div>To,</div>
                  <div className='fw-bold fs_14_dp6' >{result?.header?.customerfirmname}</div>
                  <div>{result?.header?.customerAddress1}</div>
                  <div>{result?.header?.customerAddress3}</div>
                  <div>{result?.header?.customerAddress2}</div>
                  <div>{result?.header?.customercity}{result?.header?.customerpincode}</div>
                  <div>{result?.header?.customeremail1}</div>
                  <div>{result?.header?.vat_cst_pan}</div>
                  <div>{result?.header?.Cust_CST_STATE}-{result?.header?.Cust_CST_STATE_No}</div>
              </div>
              <div className='p-1 w-25 border-end'>             	
                  <div>Ship To,</div>
                  <div className='fw-bold fs_14_dp6'>{result?.header?.customerfirmname}</div>
                  <div>{result?.header?.CustName}</div>
                  <div>{result?.header?.customercity}, {result?.header?.customerstate}</div>
                  <div>{result?.header?.customercountry}{result?.header?.customerpincode}</div>
                  <div>Mobile No : {result?.header?.customermobileno}</div>
              </div>

              <div className='p-1 w-25 border-end'>
                  <div className='d-flex justify-content-start pe-2'><div className='fw-bold w-50 w_50_dp6'>INVOICE NO</div><div className='w-50 start_dp6'>{result?.header?.InvoiceNo}</div></div>
                  <div className='d-flex justify-content-start pe-2'><div className='fw-bold w-50 w_50_dp6'>DATE</div><div className='w-50 start_dp6'>{result?.header?.EntryDate}</div></div>
                  <div className='d-flex justify-content-start pe-2'><div className='fw-bold w-50 w_50_dp6'>Delivery Mode</div><div className='w-50 start_dp6'>{result?.header?.Delivery_Mode}</div></div>
                  {/* <div className='fw-bold'>Delivery Mode</div> */}
              </div>
              <div className='p-1 w-25'>
                  <div className='w-100 d-flex'><div style={{width:'60%'}}>E Way Bill No:</div> <div style={{width:'40%'}}>{result?.header?.E_Way_Bill_No}</div>	</div>
                  <div className='w-100 d-flex'><div style={{width:'60%'}}>PAN:</div>	<div style={{width:'40%'}}>{result?.header?.CustPanno}</div></div>
                  <div className='w-100 d-flex'><div style={{width:'60%'}}>Advance Receipt No:</div><div style={{width:'40%'}}>{result?.header?.Advance_Receipt_No}</div></div>
                  <div className='w-100 d-flex'><div style={{width:'60%'}}>Name of Trasporter:</div><div style={{width:'40%'}}>{result?.header?.Name_Of_Transporter}</div></div>
                  <div className='w-100 d-flex'><div style={{width:'60%'}}>Vehical No:</div>	<div style={{width:'40%'}}>{result?.header?.Vehicle_Number}</div></div>
                  <div className='w-100 d-flex'><div style={{width:'60%'}}>freight terms:</div>	<div style={{width:'40%'}}>{result?.header?.Freight_Terms}</div></div>
                  <div className='w-100 d-flex'><div style={{width:'60%'}}>E reference No:</div>	<div style={{width:'40%'}}>{result?.header?.E_Reference_No}</div></div>
                  <div className='w-100 d-flex'><div style={{width:'60%'}}>Credit Days:</div>	<div style={{width:'40%'}}>{result?.header?.Credit_Days}</div></div>
                  <div className='w-100 d-flex'><div style={{width:'60%'}}>Output Types:	</div><div style={{width:'40%'}}>{result?.header?.Output_Type}</div></div>
                  <div className='w-100 d-flex'><div style={{width:'60%'}}>Product Types:</div>	<div style={{width:'40%'}}>{result?.header?.Product_Type}</div></div>
                  <div className='w-100 d-flex'><div style={{width:'60%'}}>{result?.header?.HSN_No_Label}:</div>	<div style={{width:'40%'}}>{result?.header?.HSN_No}</div></div>
              </div>
            </div>
            <div className='fs_dp6'>
              <div className='fw-bold d-flex mt-2 border'>
                <div className='col1_dp6 d-flex justify-content-center align-items-center border-end'>Sr#</div>
                <div className='col2_dp6 d-flex justify-content-center align-items-center border-end'>Design</div>
                <div className='col3_dp6 d-flex flex-column justify-content-center align-items-center border-end' style={{width:'52%'}}>
                  <div className='border-bottom d-flex justify-content-center align-items-center w-100 p-1'>Material Description</div>
                  <div className='d-flex w-100'>
                    <div className='col3_dp6_1 d-flex justify-content-center align-items-center border-end p-1'>Material</div>
                    <div className='col3_dp6_2 d-flex justify-content-center align-items-center border-end p-1'>Shape</div>
                    <div className='col3_dp6_3 d-flex justify-content-center align-items-center border-end p-1'>Qlty</div>	
                    <div className='col3_dp6_4 d-flex justify-content-center align-items-center border-end p-1'>Color</div>	
                    <div className='col3_dp6_5 d-flex justify-content-center align-items-center border-end p-1'>Size</div>	
                    <div className='col3_dp6_6 d-flex justify-content-center align-items-center border-end p-1'>Pcs</div>
                    <div className='col3_dp6_7 d-flex justify-content-center align-items-center border-end p-1'>Wt./Ctw.</div>
                    <div className='col3_dp6_8 d-flex justify-content-center align-items-center border-end p-1'>Rate</div>
                    <div className='col3_dp6_9 d-flex justify-content-center align-items-center p-1'>Amount</div>
                  </div>
                </div>
                <div className='col4_dp6 d-flex justify-content-center align-items-center border-end' style={{width:'3%'}}>Qty</div>
                <div className='col5_dp6 d-flex justify-content-center align-items-center border-end'>Other <br /> Amt.</div>
                <div className='col6_dp6 d-flex flex-column justify-content-center align-items-center border-end'><div className='d-flex justify-content-center align-items-center border-bottom w-100 h-50'>Labour</div>
                <div className='d-flex w-100 h-50'><div className='w-50 border-end d-flex justify-content-center align-items-center'>Rate</div><div className='w-50 d-flex justify-content-center align-items-center'>Amt</div></div>
                </div>
                <div className='col7_dp6 d-flex justify-content-center align-items-center'>Amount</div>
              </div>
              <div>
                {
                  result?.resultArray?.map((e, i) => {

                    return(
                      <div className='d-flex border border-top-0 pbia_dp6' key={i}>
                      <div className='col1_dp6_tb d-flex justify-content-center align-items-center  border-end'>{i+1}</div>
                      <div className='col2_dp6_tb border-end'>
                        <div className='d-flex w-100 '>
                          <div className='w-50 center_dp6'>{e?.designno}</div>
                          <div className='w-50 center_dp6'>{e?.SrJobno}</div>
                        </div>
                        { imgFlag ? <div className='d-flex justify-content-center align-items-center'><img src={e?.DesignImage} alt="#designimg" className='design_img_dp6' onError={(e) => handleImageError(e)} /></div> : '' } 
                        <div className='d-flex justify-content-center align-items-center fs_dp6 pb-2'>PO: <b className='fs_dp6'>{e?.PO}</b></div>
                        { e?.HUID === '' ? '' : <div className='d-flex justify-content-center align-items-center pt-1'>HUID: {e?.HUID}</div> } 
                        <div className='d-flex justify-content-center align-items-center fw-bold'>{e?.grosswt?.toFixed(3)} gm Gross</div>
                      </div>
                      <div className='col3_dp6_tb border-end d-grid' style={{width:'52% !important'}}>
                              {/* <div className='d-flex border-bottom w-100'>import { findIndex } from 'lodash';

                                <div className='border-end col3_dp6_1 pad_st_dp6 center_start_dp6' >{e?.MetalType}</div>
                                <div className='border-end col3_dp6_1 pad_st_dp6 center_start_dp6 d-flex flex-column justify-content-between' >
                                {
                                    e?.metal?.map((el, ind) => {
                                      return(
                                        <div className='center_start_dp6' key={ind}>{(el?.ShapeName)}</div>
                                      )
                                    })
                                  }
                                </div>
                                <div className='border-end col3_dp6_2' >
                                  {
                                    e?.metal?.map((el, ind) => {
                                      return(
                                        <div className='center_start_dp6' key={ind}>{(el?.ShapeName)}</div>
                                      )
                                    })
                                  }
                                </div>
                                <div className='border-end col3_dp6_3 pad_st_dp6 center_start_dp6' >{e?.MetalPurity}</div>
                                <div className='border-end col3_dp6_3 pad_st_dp6 center_start_dp6' >
                                  {
                                    e?.metal?.map((el, ind) => {
                                      return(
                                        <div className='center_start_dp6' key={ind}>{(el?.MetalPurity)}</div>
                                      )
                                    })
                                  }
                                </div>
                                <div className='border-end col3_dp6_4 pad_st_dp6 center_start_dp6' >{e?.MetalColor}</div>
                                <div className='border-end col3_dp6_5' ></div>
                                <div className='border-end col3_dp6_6' ></div>
                                <div className='border-end col3_dp6_7 end_dp6' >{e?.MetalDiaWt?.toFixed(3)}</div>
                                <div className='border-end col3_dp6_8' >
                                  {
                                    e?.metal?.map((el, ind) => {
                                      return(
                                        <div className='end_dp6 pad_end_dp6 h-100' key={ind}>{formatAmount(el?.Rate)}</div>
                                      )
                                    })
                                  }
                                </div>
                                <div className='col3_dp6_9' >
                                {
                                    e?.metal?.map((el, ind) => {
                                      return(
                                        <div className='end_dp6 pad_end_dp6 h-100' key={ind}>{formatAmount(el?.Amount)}</div>
                                      )
                                    })
                                  }
                                </div>
                              </div> */}
                              {
                                e?.metal?.map((a, i) => {
                                  
                                  return(
                                    // <React.Fragment key={i}>
                                    <div className='d-flex justify-content-between align-items-center h-100 border-bottom' key={i}>
                                      <div className='border-end col3_dp6_1 pad_st_dp6 center_start_dp6 h-100'>{a?.IsPrimaryMetal === 1 ? a?.ShapeName : ''}</div>
                                      <div className='border-end col3_dp6_2 pad_st_dp6 center_start_dp6 h-100'>{a?.IsPrimaryMetal === 1 ? '' : a?.ShapeName}</div>
                                      <div className='border-end col3_dp6_3 pad_st_dp6 center_start_dp6 h-100'>{a?.QualityName}</div>
                                      <div className='border-end col3_dp6_4 pad_st_dp6 center_start_dp6 h-100' style={{wordBreak:'break-word'}}>{a?.IsPrimaryMetal === 1 ?  a?.Colorname : ''}</div>
                                      {/* <div className='border-end col3_dp6_5 pad_st_dp6 center_start_dp6 h-100'>{a?.SizeName}</div> */}
                                      <div className='border-end col3_dp6_5 pad_st_dp6 center_start_dp6 h-100'>{a?.IsPrimaryMetal === 1 ? '' : a?.SizeName}</div>
                                      {/* <div className='border-end col3_dp6_6 end_dp6 pad_end_dp6 h-100'>{a?.Pcs}</div> */}
                                      <div className='border-end col3_dp6_6 end_dp6 pad_end_dp6 h-100'>{a?.IsPrimaryMetal === 1 ? '' : a?.Pcs}</div>
                                      <div className='border-end col3_dp6_7 end_dp6 pad_end_dp6 h-100'>{a?.Wt?.toFixed(3)}</div>
                                      <div className='border-end col3_dp6_8 end_dp6 pad_end_dp6 h-100' >{a?.IsPrimaryMetal === 1 ? formatAmount((a?.Rate/(result?.header?.CurrencyExchRate))) : ''}</div>
                                      <div className='col3_dp6_9 end_dp6 pad_end_dp6 h-100'>{a?.IsPrimaryMetal === 1 ? formatAmount((a?.Amount/(result?.header?.CurrencyExchRate))) : '' }</div>
                                    </div>
                                    // </React.Fragment>
                                  )
                                })
                              }
                        {
                          e?.diamonds?.map((el, i) => {
                            return(
                              <div className='d-flex border-bottom w-100' key={i}>
                                <div className='border-end col3_dp6_1 pad_st_dp6 center_start_dp6' >{el?.MasterManagement_DiamondStoneTypeName}</div>
                                <div className='border-end col3_dp6_2 pad_st_dp6 center_start_dp6' >{el?.ShapeName}</div>
                                <div className='border-end col3_dp6_3 pad_st_dp6 center_start_dp6' >{el?.QualityName}</div>
                                <div className='border-end col3_dp6_4 pad_st_dp6 center_start_dp6' >{el?.Colorname}</div>
                                <div className='border-end col3_dp6_5 pad_st_dp6 center_start_dp6' >{el?.SizeName}</div>
                                <div className='border-end col3_dp6_6 end_dp6 pad_end_dp6' >{el?._Pcs}</div>
                                {/* <div className='border-end col3_dp6_7 end_dp6 pad_end_dp6' >{(el?.ShapeName?.includes('Certification') && el?.MasterManagement_DiamondStoneTypeid === 3) ? (e?.jobwise_dia_wt_certificate?.toFixed(3)) :  el?.jwt?.toFixed(3)}</div> */}
                                <div className='border-end col3_dp6_7 end_dp6 pad_end_dp6' >{el?._Wt?.toFixed(3)}</div>
                                {/* <div className='border-end col3_dp6_8 end_dp6 pad_end_dp6' >{formatAmount((el?.Rate))}</div> */}
                                <div className='border-end col3_dp6_8 end_dp6 pad_end_dp6' >
                                    { el?.isRateOnPcs === 0 ? formatAmount((((el?._Amount/(result?.header?.CurrencyExchRate)) / (el?._Wt === 0 ? 1 : el?._Wt)))) :
                                    formatAmount((((el?._Amount/(result?.header?.CurrencyExchRate)) / (el?._Pcs === 0 ? 1 : el?._Pcs))))}
                                </div>
                                <div className='col3_dp6_9 end_dp6 pad_end_dp6' >{formatAmount((el?._Amount/(result?.header?.CurrencyExchRate)))}</div>
                              </div>
                            )
                          })
                        }
                        {
                          e?.colorstone?.map((el, i) => {
                            return(
                              <div className='d-flex border-bottom w-100' key={i}>
                                <div className='border-end col3_dp6_1 pad_st_dp6 center_start_dp6' >{el?.MasterManagement_DiamondStoneTypeName}</div>
                                <div className='border-end col3_dp6_2 pad_st_dp6 center_start_dp6' >{el?.ShapeName}</div>
                                <div className='border-end col3_dp6_3 pad_st_dp6 center_start_dp6' >{el?.QualityName}</div>
                                <div className='border-end col3_dp6_4 pad_st_dp6 center_start_dp6' >{el?.Colorname}</div>
                                <div className='border-end col3_dp6_5 pad_st_dp6 center_start_dp6' >{el?.SizeName}</div>
                                <div className='border-end col3_dp6_6 end_dp6 pad_end_dp6' >{el?._Pcs}</div>
                                <div className='border-end col3_dp6_7 end_dp6 pad_end_dp6' >{el?._Wt?.toFixed(3)}</div>
                                <div className='border-end col3_dp6_8 end_dp6 pad_end_dp6' >
                                    { el?.isRateOnPcs === 0 ? formatAmount((((el?._Amount/(result?.header?.CurrencyExchRate)) / ((el?._Wt === 0 ? 1 : el?._Wt))))) 
                                    : formatAmount((((el?._Amount/(result?.header?.CurrencyExchRate)) / ((el?._Pcs === 0 ? 1 : el?._Pcs)))))}
                                </div>
                                <div className='col3_dp6_9 end_dp6 pad_end_dp6' >{formatAmount((el?._Amount/(result?.header?.CurrencyExchRate)))}</div>
                              </div>
                            )
                          })
                        }
                        {
                          e?.misc?.map((el, i) => {
                          // e?.miscList_duplicate?.map((el, i) => {
                            return(
                              <div className='d-flex border-bottom w-100' key={i}>
                                <div className='border-end col3_dp6_1 pad_st_dp6 center_start_dp6' >{el?.MasterManagement_DiamondStoneTypeName}</div>
                                <div className='border-end col3_dp6_2 pad_st_dp6 center_start_dp6' >{el?.ShapeName}</div>
                                <div className='border-end col3_dp6_3 pad_st_dp6 center_start_dp6' >{el?.QualityName}</div>
                                <div className='border-end col3_dp6_4 pad_st_dp6 center_start_dp6' >{el?.Colorname}</div>
                                <div className='border-end col3_dp6_5 pad_st_dp6 center_start_dp6' >{el?.SizeName}</div>
                                <div className='border-end col3_dp6_6 end_dp6 pad_end_dp6' >{el?._Pcs}</div>
                                <div className='border-end col3_dp6_7 end_dp6 pad_end_dp6' >{el?.IsHSCOE === 0 ? el?._Wt?.toFixed(3) : el?.ServWt?.toFixed(3)}</div>
                                {/* <div className='border-end col3_dp6_8 end_dp6 pad_end_dp6' >{formatAmount((((el?._Amount/(result?.header?.CurrencyExchRate)) / (el?._Wt === 0 ? 1 : el?._Wt))))}</div> */}
                                {/* <div className='border-end col3_dp6_8 end_dp6 pad_end_dp6' >{formatAmount((((el?._Amount) / ( el?.IsHSCOE === 0 ? ( el?._Wt === 0 ? 1 : el?._Wt) : (el?.ServWt === 0 ? 1 : el?.ServWt)))))}</div> */}
                                <div className='border-end col3_dp6_8 end_dp6 pad_end_dp6' >{formatAmount(el?.Rate)}</div>
                                <div className='col3_dp6_9 end_dp6 pad_end_dp6' >{formatAmount((el?._Amount/(result?.header?.CurrencyExchRate)))}</div>
                              </div>
                            )
                          })
                        }
                        
                      </div>
                      <div className='col12_dp6_tb border-end end_dp6 pad_end_dp6' style={{width:'3%'}}>{e?.Quantity}</div>
                      <div className='col13_dp6_tb border-end end_dp6 pad_end_dp6'>{formatAmount(((e?.TotalDiamondHandling + e?.OtherCharges)/(result?.header?.CurrencyExchRate))) }</div>
                      <div className='col14_dp6_tb border-end end_dp6 pad_end_dp6'>{formatAmount(((e?.MaKingCharge_Unit)/(result?.header?.CurrencyExchRate)))}</div>
                      {/* <div className='col15_dp6_tb border-end end_dp6 pad_end_dp6'>{formatAmount(((e?.MakingAmount + e?.TotalDiaSetcost)/(result?.header?.CurrencyExchRate)))}</div> */}
                      <div className='col15_dp6_tb border-end end_dp6 pad_end_dp6'>{formatAmount((((e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount)/(result?.header?.CurrencyExchRate))))}</div>
                      <div className='col16_dp6_tb end_dp6 pad_end_dp6'>{formatAmount((e?.TotalAmount/(result?.header?.CurrencyExchRate)))}</div>
                      </div>
                    )
                  })
                }
                
              </div>
              <div className='d-flex justify-content-end pad_end_dp6 border-start border-end p-1 pbia_dp6'>{formatAmount((result?.mainTotal?.total_amount/(result?.header?.CurrencyExchRate)))}</div>
              <div className='d-flex justify-content-end border'>
                 { result?.header?.FreightCharges === 0 ? '' : <div className='d-flex border-start pbia_dp6' style={{width:'22%'}}>
                    <div className=' end_dp6 pad_end_dp6 border-end p-1' style={{width:'53%'}}>Freight Chagres</div>
                    <div className=' end_dp6 pad_end_dp6 p-1' style={{width:'47%'}}>{formatAmount(result?.header?.FreightCharges)}</div>
                  </div> } 
              </div>
              <div className='d-flex border border-top-0 pbia_dp6'>
                <div style={{width:'78%'}}>
                      {
                        result?.allTaxes?.map((e,i) => {
                          return(
                            <div className='d-flex pad_st_dp6' key={i}>{e?.amountInWords}</div>
                          )
                        })
                      }
                </div>
                <div className='border-start pbia_dp6' style={{width:'22%'}}>
                  {
                    result?.allTaxes?.map((e,i) => {
                      return(
                          <div className='d-flex w-100' key={i}>
                            <div className=' end_dp6 pad_end_dp6 border-end' style={{width:'53%'}}>{e?.name} @ {e?.per}</div>
                            <div className=' end_dp6 pad_end_dp6' style={{width:'47%'}}>{formatAmount(e?.amount)}</div>
                          </div>
                          )
                        })
                      }
                      <div className='d-flex' >
                            <div className=' end_dp6 pad_end_dp6 border-end' style={{width:'53%'}}>Sales Rounded Off</div>
                            <div className=' end_dp6 pad_end_dp6' style={{width:'47%'}}>{formatAmount((result?.header?.AddLess/(result?.header?.CurrencyExchRate)))}</div>
                          </div>
                </div>
              </div>
              <div className='d-flex border border-top-0 pbia_dp6'>
              <div className='col1_dp6_tb d-flex justify-content-center align-items-end  border-end' style={{width:'3%'}}>Total</div>
                      <div className='col2_dp6_tb border-end' style={{width:'34%'}}>
                        {/* <div className='d-flex w-100 '>
                          <div className='w-50 center_dp6'></div>
                          <div className='w-50 center_dp6'></div>
                        </div> */}
                         {/* <div className='d-flex justify-content-center align-items-center'><img src='' alt="#designimg" className='design_img_dp6' onError={(e) => handleImageError(e)} /></div>  */}
                        {/* <div className='d-flex justify-content-center align-items-center fs_dp6'>PO: <b className='fs_dp6'>'</b></div> */}
                         {/* <div className='d-flex justify-content-center align-items-center'>HUID: '</div>  */}
                        {/* <div className='d-flex justify-content-center align-items-center fw-bold'> Gross</div> */}
                      </div>
                      <div style={{width:'23%'}}>
                        {/* <div> */}
                        <div className='border-end p-1'>
                      <div>Qty: {result?.mainTotal?.total_Quantity}</div>
                      <div>D: Company : {result?.mainTotal?.diamonds?.Pcs}/{result?.mainTotal?.diamonds?.Wt?.toFixed(3)} Ctw</div>
                      <div>C: Company : {result?.mainTotal?.colorstone?.Pcs}/{result?.mainTotal?.colorstone?.Wt?.toFixed(3)} Ctw</div>
                      {/* <div>M: Company : {mcompany?.m_Pcs}/{mcompany?.m_Wt?.toFixed(3)} Wt</div> */}
                      <div>M: Company : {miscObj?.Pcs}/{(result?.mainTotal?.misc?.Wt + result?.mainTotal?.misc?.allservwt)?.toFixed(3)} Wt</div>
                      <div>Wt: {result?.mainTotal?.metal?.IsPrimaryMetal?.toFixed(3)}</div>
                      <div>Ctw: { (result?.mainTotal?.diamonds?.Wt + result?.mainTotal?.colorstone?.Wt)?.toFixed(3) }</div>
                        </div>
                      </div>
                      <div className='col12_dp6_tb border-end end_dp6 pad_end_dp6 fw-bold' style={{width:'8%'}}>
                      {formatAmount((alltotal/result?.header?.CurrencyExchRate))}
                      </div>
                      <div className='col13_dp6_tb border-end end_dp6 pad_end_dp6 fw-bold' style={{width:'3%'}}>{result?.mainTotal?.total_Quantity}</div>
                      <div className='col14_dp6_tb border-end end_dp6 pad_end_dp6 fw-bold' style={{width:'8%'}}>{formatAmount(((result?.mainTotal?.total_diamondHandling + result?.mainTotal?.total_other_charges)/(result?.header?.CurrencyExchRate)))}</div>
                      <div className='col15_dp6_tb border-end end_dp6 pad_end_dp6 fw-bold' style={{width:'12%'}}>
                        {formatAmount(((
                          (result?.mainTotal?.total_Making_Amount + result?.mainTotal?.diamonds?.SettingAmount + result?.mainTotal?.colorstone?.SettingAmount)/(result?.header?.CurrencyExchRate)
                          )))}
                        </div>
                      <div className='col16_dp6_tb end_dp6 pad_end_dp6 fw-bold' style={{width:'10%'}}>
                      <div dangerouslySetInnerHTML={{__html:result?.header?.Currencysymbol}} className='pe-1'>
                        {/* </div> {formatAmount(((((result?.finalAmount))/(result?.header?.CurrencyExchRate) + result?.header?.FreightCharges + (result?.allTaxesTotal) )))}</div> */}
                        </div> {formatAmount(((result?.mainTotal?.total_amount/(result?.header?.CurrencyExchRate) + result?.header?.FreightCharges + (result?.allTaxesTotal) + ((result?.header?.AddLess)/(result?.header?.CurrencyExchRate)) ) ))}</div>
              </div>
              <div className='d-flex border border-top-0 pbia_dp6'>
                <div className='border-end col1_dp6  ps-1 d-flex justify-content-start align-items-center' dangerouslySetInnerHTML={{__html:result?.header?.Currencysymbol}}></div>
                <div className='fw-bold p-1'>{toWords?.convert(+((((result?.mainTotal?.total_amount)/(result?.header?.CurrencyExchRate)) +  result?.header?.FreightCharges + (result?.allTaxesTotal) + ((result?.header?.AddLess)/(result?.header?.CurrencyExchRate)))?.toFixed(2)))} Only</div>
              </div>
              <div className='p-1 border border-top-0 pbia_dp6 fs_dp6' dangerouslySetInnerHTML={{__html:result?.header?.Declaration}}></div>
              <div className='border p-1 border-top-0 pbia_dp6'><b className='fs_dp6'>REMARKS:</b>&nbsp; <span className='fw-bold' dangerouslySetInnerHTML={{ __html: result?.header?.BillReferenceNo }}></span></div>
              <div className='d-flex border border-top-0 pbia_dp6'>
                <div className='w_dp6_f border-end p-1'>
                  <div className='fw-bold'>Bank Detail</div>
                  <div>Bank Name: {result?.header?.bankname}</div>
                  <div>Branch: {result?.header?.bankaddress}</div>
                  <div>Account Name: {result?.header?.accountname}</div>
                  <div>Account No. : {result?.header?.accountnumber}</div>
                  <div>RTGS/NEFT IFSC: {result?.header?.rtgs_neft_ifsc}</div>
                  <div>Enquiry No. <br /> (E & OE)</div>
                </div>
                <div className='w_dp6_f d-flex flex-column justify-content-between border-end p-1 '>
                  <div>Signature</div>
                  <div className='fw-bold'>{result?.header?.customerfirmname}</div>
                </div>
                <div className='w_dp6_f d-flex flex-column justify-content-between p-1'>
                  <div>Signature</div>
                  <div className='fw-bold'>{result?.header?.CompanyFullName}</div>
                </div>
              </div>
            </div>
          </div>
        </div> : <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
              {msg}
            </p>
        }
        </>
      }
      </>
  )
}

export default DetailPrint6
