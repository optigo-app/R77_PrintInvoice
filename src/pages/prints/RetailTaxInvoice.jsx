import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { ToWords } from 'to-words';
import { NumberWithCommas, apiCall, checkMsg, formatAmount, handlePrint, isObjectEmpty } from '../../GlobalFunctions';
import Loader from '../../components/Loader';
import "../../assets/css/prints/RetailTaxInvoice.css";
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import cloneDeep from 'lodash/cloneDeep';
const RetailTaxInvoice = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {

    const toWords = new ToWords();
    const [loader, setLoader] = useState(true);
    const [msg, setMsg] = useState("");
    const [result, setResult] = useState(null);
    const [othInfo, setOthInfo] = useState([]);
    const [metwise, setMetwise] = useState([]);
    const [diawise, setDiawise] = useState([]);
    const [clrwise, setClrwise] = useState([]);
    const [miscwise, setMiscwise] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [total_makingcharge_unit, setTotalMakingChargeUnit] = useState(0);
    const [total_count, setTotalCount] = useState(0);
    const loadData = (data) => {
      let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
      data.BillPrint_Json[0].address = address;
 
      const datas = OrganizeDataPrint(
        data?.BillPrint_Json[0],
        data?.BillPrint_Json1,
        data?.BillPrint_Json2
      );
      // let totrate = 0;
      // let count = 0;
      // datas?.resultArray?.forEach((e) => {
      //   if(e?.MaKingCharge_Unit !== 0){
      //     totrate += e?.MaKingCharge_Unit;
      //     count++;
      //   }
      // })
      // setTotalCount(count);
      // setTotalMakingChargeUnit(totrate);
      let met = [];
      let dia = [];
      let clr = [];
      let miscc = [];
      let oth = [];

      datas?.resultArray?.forEach((e) => {
        e?.metal?.forEach((el) => {
          let obj = cloneDeep(el);
          if(obj?.IsPrimaryMetal === 1){

            let findrec = met?.findIndex((a) => a?.IsPrimaryMetal === 1 && a?.QualityName === obj?.QualityName && a?.Rate === obj?.Rate)
            if(findrec === -1){
              met.push(obj);
            }else{
              met[findrec].Wt += obj?.Wt;
              met[findrec].Amount += obj?.Amount;
            }
          }
        })
        // e.metal = met;


        e?.diamonds?.forEach((el) => {
          let obj = cloneDeep(el);
          let findrec = dia?.findIndex((a) => a?.MaterialTypeName === obj?.MaterialTypeName && a?.ShapeName === obj?.ShapeName && a?.QualityName === obj?.QualityName && a?.Colorname === obj?.Colorname)
          if(findrec === -1){
            dia.push(obj);
          }else{
            dia[findrec].Wt += obj?.Wt;
            dia[findrec].Amount += obj?.Amount;
          }
        })
        // e.diamonds = dia;

        e?.colorstone?.forEach((el) => {
          let obj = cloneDeep(el);
          let findrec = clr?.findIndex((a) => a?.MaterialTypeName === obj?.MaterialTypeName && a?.ShapeName === obj?.ShapeName && a?.QualityName === obj?.QualityName && a?.Colorname === obj?.Colorname && a?.isRateOnPcs === obj?.isRateOnPcs)
          if(findrec === -1){
            clr.push(obj);
          }else{
            clr[findrec].Wt += obj?.Wt;
            clr[findrec].Amount += obj?.Amount;
            clr[findrec].Pcs += obj?.Pcs;
          }
        })
        // e.colorstone = clr;

        e?.misc?.forEach((el) => {
          let obj = cloneDeep(el);
          if(obj?.IsHSCOE !== 0){

            let findrec = miscc?.findIndex((a) => a?.ShapeName === obj?.ShapeName)
            if(findrec === -1){
              miscc.push(obj);
            }else{
              miscc[findrec].Wt += obj?.Wt;
              miscc[findrec].Amount += obj?.Amount;
            }
          }
          })
          // e.misc = miscc;
        
        e?.other_details?.forEach((a) => {
          let obj = cloneDeep(a);
          let findrec = oth?.findIndex((el) => el?.label === obj?.label)
          if(findrec === -1){
            let obj1 = {...obj};
            obj1.value = +(obj?.value)
            oth.push(obj1);
          }else{
            oth[findrec].value += +(obj?.value);
          }
        })          
        e.other_details = oth;
      })
      let totamt = 0;
      met?.forEach((e) => {
         totamt += e?.Amount;
      })
      dia?.forEach((e) => {
         totamt += e?.Amount;
      })
      clr?.forEach((e) => {
         totamt += e?.Amount;
      })
      oth?.forEach((e) => {
         totamt += e?.Amount;
      })
    //   met?.sort((a, b) => {
    //     // Extract the QualityName from the string (assuming it's in the format "GOLD 10K", "GOLD 14K", etc.)
    //     const qualityA = a?.QualityName;
    //     const qualityB = b?.QualityName;
    //     // Convert the extracted QualityName to integers for comparison
    //     const qualityNumA = parseInt(qualityA);
    //     const qualityNumB = parseInt(qualityB);
    //     // Return the comparison result
    //     return qualityNumA - qualityNumB;
    // });
    met?.sort((a, b) => {
      const qualityA = a?.QualityName?.toUpperCase();
      const qualityB = b?.QualityName?.toUpperCase();
  
      // Extract the karat value from the QualityName
      const karatA = parseInt(qualityA?.split(' ')[1]); // Extracts the numeric part from "GOLD 10K"
      const karatB = parseInt(qualityB?.split(' ')[1]); // Extracts the numeric part from "GOLD 18K"
  
      // If both are numbers (i.e., metal types), compare them numerically
      if (!isNaN(karatA) && !isNaN(karatB)) {
          return karatA - karatB;
      }
  
      // If one of them is not a number (i.e., metal type and "TITANIUM High"), sort the metal type first
      if (!isNaN(karatA)) {
          return -1; // Place metal type before "TITANIUM High"
      } else if (!isNaN(karatB)) {
          return 1; // Place "TITANIUM High" after metal types
      }
  
      // If both are not numbers, sort them alphabetically
      if (qualityA < qualityB) return -1;
      if (qualityA > qualityB) return 1;
      return 0;
    });
  
    oth?.sort((a, b) => {
      return a.label.localeCompare(b.label);
     });

    oth?.forEach(item => {
    item.label = item?.label?.toUpperCase(); // Convert to uppercase
    item.label = item?.label?.replace(/\b\w/g, char => char?.toUpperCase()); // Capitalize first letter of each word
    });

      dia?.sort((a, b) => a?.Rate - b?.Rate);

      let dia1 =[];
      let dia2 = [];

        dia1 = dia?.filter((e) => e?.Amount === 0 && e?.Rate === 0)
        dia2 = dia?.filter((e) => e?.Amount !== 0 && e?.Rate !== 0)

        let totwtdia = 0;
        dia1?.forEach((a) => totwtdia += a?.Wt)

        let obj_dia = {
          MasterManagement_DiamondStoneTypeName : 'DIAMOND',
          MaterialTypeName:'',
          Wt : totwtdia,
          Rate : 0,
          Amount : 0
        }

        dia2?.splice(0, 0, obj_dia);

        dia = dia2;

    


      let clr2 = [];
      clr?.forEach((e) => {
        let obj = {...e};
        if(obj?.isRateOnPcs === 1){
            obj._rate = ((obj?.Amount / (obj?.Pcs === 0 ? 1 : obj?.Pcs)) / datas?.header?.CurrencyExchRate);
        }else{
            obj._rate = ((obj?.Amount / (obj?.Wt === 0 ? 1 : obj?.Wt)) / datas?.header?.CurrencyExchRate);
        }
        clr2.push(obj);
      })
      clr2?.sort((a, b) => a?._rate - b?._rate);
      setTotalAmount(totamt)
      setMetwise(met);
      
      if(dia?.length === 1 && dia[0]?.Wt === 0 && dia[0]?.Rate === 0 && dia[0]?.Amount === 0){
        setDiawise([])
      }else{
        setDiawise(dia);
      }
      setClrwise(clr2);
      setMiscwise(miscc);
      setOthInfo(oth);

      // let lbr_rate = 0;
      // let finalArr = [];
      // datas?.resultArray?.forEach((e) => {
      //   let obj = {...e};
      //   let findingwt = 0;
      //   datas?.json2?.forEach((el) => {
      //     if(e?.SrJobno === el?.StockBarcode){
            
      //       // (obj?.MetalDiaWt - )
      //       if(el?.MasterManagement_DiamondStoneTypeid === 5){
      //         if((el?.Supplier === 'Customer') || (el?.Supplier === 'customer')){
      //             findingwt += el?.Wt;
      //           }
      //         }
              
      //       }
      //     })
      //     // let lbr_wt = ((obj?.MetalDiaWt - findingwt) * obj?.MaKingCharge_Unit);
              
      //     // obj.lbr_wt = lbr_wt;
      //     finalArr.push(obj);

      // })
      
      // datas.resultArray = finalArr;

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
        // let lbr_wt = ((obj?.MetalDiaWt - obj?.findingwt) * obj?.MaKingCharge_Unit);
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
      // let totlbrrate = 0;
      // datas?.resultArray?.forEach((a) => {
      //     totlbrrate += a?.lbr_rate;
      // })
      let lbr_rate_total = 0;

      lbr_rate_total = (tot_lbr_amt / (tot_lbr_wt === 0 ? 1 : tot_lbr_wt))
      let rounduplabour =  Math.round(lbr_rate_total)
      setTotalMakingChargeUnit(rounduplabour);

      setResult(datas);

    }

    const [isImageWorking, setIsImageWorking] = useState(true);
    const handleImageErrors = () => {
      setIsImageWorking(false);
    };

    useEffect(() => {
        const sendData = async () => {
            try {
                const data = await apiCall(token, invoiceNo, printName, urls, evn, ApiVer);
                if (data?.Status === '200') {
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
        }
        sendData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const merged = clrwise.reduce(
      (acc, item) => {
        acc.Pcs += Number(item.Pcs || 0);
        acc.Wt += Number(item.Wt || 0);
        acc.Amount += Number(item.Amount || 0);
        acc.Rate += Number(item._rate || 0);
        return acc;
      },
      {
        Pcs: 0,
        Wt: 0,
        Amount: 0,
        Rate: 0,
      }
    );
    
    console.log("TCL: merged", merged)
    return (
        <>  {loader ? <Loader /> : msg === "" ? 
        <div className=''>
            {/* print button */}
            
          <div className='containerrti'>
              <div className="d-flex w-100 justify-content-end align-items-baseline print_sec_sum4 no_break pb-4 d_none_rti">
                <div className="printBtn_sec text-end ">
                    <input type="button" className="btn_white blue me-0" value="Print" onClick={(e) => handlePrint(e)} />
                </div>
              </div>
              <div className='headlinerti'>{result?.header?.PrintHeadLabel}</div>
              <div className='headrti border-bottom'>
              <div>
                  <div className='cmpnamerti'>{result?.header?.CompanyFullName}</div>
                  <div className='lh_decrease'>{result?.header?.CompanyAddress}</div>
                  <div className='lh_decrease'>{result?.header?.CompanyAddress2}</div>
                  <div className='lh_decrease'>{result?.header?.CompanyCity} - {result?.header?.CompanyPinCode}, {result?.header?.CompanyState} ({result?.header?.CompanyCountry})</div>
                  <div className='lh_decrease'>T {result?.header?.CompanyTellNo} | TOLL FREE {result?.header?.CompanyTollFreeNo}</div>
                  <div className='lh_decrease'>{result?.header?.CompanyEmail} | {result?.header?.CompanyWebsite}</div>
                  { result?.header?.MSME !== '' && <div className='lh_decrease'>MSME : {result?.header?.MSME}</div>}
                  { result?.header?.Company_VAT_GST_No !== '' && <div className='lh_decrease'>GSTIN : {result?.header?.Company_VAT_GST_No?.split("-")[1]}</div>}
              </div>
              <div className='pe-4'>  {isImageWorking && (result?.header?.PrintLogo !== "" && 
                      <img src={result?.header?.PrintLogo} alt="" 
                      className='w-100 h-auto my-0 mx-auto d-block object-fit-contain'
                      style={{minHeight:'75px', minWidth:'115px', maxWidth:'117px', maxHeight:'75px'}}
                      onError={handleImageErrors} height={120} width={150} />)}</div>
              </div>
              <div className='subheadrti pt-1 fsrti'>
              <div className='subheadrti1 fsrti'>
                <div className='d-flex'><div className='w-50 fw-bold lh_decrease'>BILL NO</div><div className='w-50 lh_decrease'>{result?.header?.InvoiceNo}</div></div>
                <div className='d-flex'><div className='w-50 fw-bold lh_decrease'>DATE</div><div className='w-50 lh_decrease'>{result?.header?.EntryDate}</div></div>
                <div className='d-flex'><div className='w-50 fw-bold lh_decrease'>{result?.header?.HSN_No_Label}</div><div className='w-50 lh_decrease'>{result?.header?.HSN_No}</div></div>
              </div>
              </div>
              {/* sub header part2 */}
              <div className='subheadertri2 fsrti'>
                  <div className='subheadertri2_1'>
                    <div className='fw-bold pe-2  custnamefsrti'>To, </div>
                    <div>
                      <div className='custnamefsrti'>{result?.header?.customerfirmname}</div>
                      <div className='lh_decrease'>{result?.header?.customerstreet}</div>
                      <div className='lh_decrease'>{result?.header?.customerregion}</div>
                      <div className='lh_decrease'>{result?.header?.customercity}{result?.header?.customerpincode}</div>
                      <div className='lh_decrease'>STATE NAME : {result?.header?.customerstate}</div>
                    </div>
                  </div>
                  <div className='subheadertri2_2'>
                    <div className='d-flex'><div className='w-50 fw-bold'>{result?.header?.CustGstNo === '' ? '' : 'GSTIN:'}</div><div>{result?.header?.CustGstNo}</div></div>
                    <div className='d-flex'><div className='w-50 fw-bold'>{( result?.header?.CustGstNo === '' ? '' : result?.header?.Cust_CST_STATE)}{ result?.header?.CustGstNo === '' ? '' : ':'}</div><div>{( result?.header?.CustGstNo === '' ? '' : result?.header?.Cust_CST_STATE_No)}</div></div>
                    <div className='d-flex'><div className='w-50 fw-bold'>PAN NO:</div><div>{result?.header?.CustPanno}</div></div>
                  </div>
              </div>
              {/* table part */}
              <div className='tablecontainerrti fsrti'>
                  <div className='tableheadrti'>
                    <div className='col1_rti centerrti'>DESCRIPTION</div>
                    <div className='col2_rti ps-2 d-flex align-items-center'>DETAIL</div>
                    <div className='col3_rti d-flex align-items-center end_rti pe-1'>WEIGHT</div>
                    <div className='col4_rti d-flex align-items-center end_rti pe-1'>RATE</div>
                    <div className='col5_rti d-flex align-items-center end_rti pe-1'>AMOUNT</div>
                  </div>
                  <div className='d-flex brbottomrti'>
                    <div className='col1_rti brleftti d-flex justify-content-center pt-3' style={{width:'36%'}}>{ diawise?.length === 0 ? 'GOLD JEWELLERY' : 'DIAMOND STUDDED JEWELLERY' }</div>
                     <div className='d-flex flex-column tbodyrti' style={{width:'66.8%'}}>
                     {
                      // result?.resultArray?.map((e, i) => (
                        <React.Fragment>
                          {metwise?.map((el, j) => { 
                            return <div className='d-flex pbiarti' key={j}>
                              <div className='tcol1rti ps-2'>{el?.ShapeName} {el?.QualityName}</div>
                              <div className='tcol2rti end_rti pe-1'>{(el?.Wt)?.toFixed(3)}</div>
                              <div className='tcol3rti end_rti pe-1'>{formatAmount(el?.Rate)}</div>
                              <div className='tcol4rti brrightrti end_rti pe-1'>{formatAmount((el?.Amount / result?.header?.CurrencyExchRate))}</div>
                            </div>
                          })}
                        </React.Fragment>
                      // ))
                    }
                    {
                      // result?.resultArray?.map((e, i) => (
                        <React.Fragment>
                          {diawise?.map((el, k) => {
                            return  <div className='d-flex pbiarti' key={k}>
                              <div className='tcol1rti ps-2'>{el?.MasterManagement_DiamondStoneTypeName} { el?.MaterialTypeName === '' ? '' : `(${el?.MaterialTypeName})` }</div>
                              <div className='tcol2rti end_rti pe-1'>{(el?.Wt)?.toFixed(3)}</div>
                              <div className='tcol3rti end_rti pe-1'>{Math.round(el?.Rate)}</div>
                              <div className='tcol4rti brrightrti end_rti pe-1'>{formatAmount(el?.Amount)}</div>
                            </div>
                          })}
                        </React.Fragment>
                      // ))
                    }
                    {
                      // result?.resultArray?.map((e, i) => (
                        <React.Fragment>
                           <div className='d-flex pbiarti' >
                              <div className='tcol1rti ps-2'>Stone</div>
                              <div className='tcol2rti end_rti pe-1'>{(merged?.Wt)?.toFixed(3)}</div>
                              {/* <div className='tcol3rti end_rti pe-1'>{Math.round(((el?.Amount / (el?.isRateOnPcs === 1 ? (el?.Pcs === 0 ? 1 : el?.Pcs) : (el?.Wt === 0 ? 1 : el?.Wt)) / (result?.header?.CurrencyExchRate))))}</div> */}
                              <div className='tcol3rti end_rti pe-1'>{Math.round(merged?.Rate)}</div>
                              {/* <div className='tcol3rti end_rti pe-1'>{el?.Rate}</div> */}
                              <div className='tcol4rti brrightrti end_rti pe-1'>{formatAmount(merged?.Amount)}</div>
                            </div>
                          
                        </React.Fragment>
                      // ))
                    }
                            <div className='d-flex'>
                              <div className='tcol1rti ps-2'>LABOUR </div>
                              <div className='tcol2rti end_rti pe-1'></div>
                              {/* <div className='tcol3rti end_rti pe-1'>{formatAmount((result?.mainTotal?.total_Making_Amount / ((result?.mainTotal?.netwt + result?.mainTotal?.lossWt))))}</div> */}
                              {/* <div className='tcol3rti end_rti pe-1'>{formatAmount((total_makingcharge_unit / total_count))}</div> */}
                              <div className='tcol3rti end_rti pe-1'>{((total_makingcharge_unit))}</div>
                              <div className='tcol4rti brrightrti end_rti pe-1'>{formatAmount((result?.mainTotal?.total_Making_Amount + result?.mainTotal?.diamonds?.SettingAmount + result?.mainTotal?.colorstone?.SettingAmount + result?.mainTotal?.misc?.Amount + result?.mainTotal?.total_diamondHandling))}</div>
                            </div>  
                    {
                      // result?.resultArray?.map((e, i) => (
                        <React.Fragment>
                          {miscwise?.map((el, k) => {
                            return  <div className='d-flex' key={k}>
                              <div className='tcol1rti ps-2'>{(el?.ShapeName)}</div>
                              <div className='tcol2rti end_rti pe-1'>{(el?.Wt)?.toFixed(3)}</div>
                              <div className='tcol3rti end_rti pe-1'></div>
                              <div className='tcol4rti brrightrti end_rti pe-1'>{formatAmount(el?.Amount)}</div>
                            </div>
                          })}
                        </React.Fragment>
                      // ))
                    }
                    {
                      // result?.resultArray?.map((e, i) => (
                        <React.Fragment >
                          {othInfo?.map((el, k) => {
                            return  <div className='d-flex' key={k}>
                              <div className='tcol1rti ps-2'>{el?.label} </div>
                              <div className='tcol2rti end_rti pe-1'></div>
                              <div className='tcol3rti end_rti pe-1'></div>
                              <div className='tcol4rti brrightrti end_rti pe-1'>{formatAmount(el?.value)}</div>
                            </div>
                          })}
                        </React.Fragment>
                      // ))
                    }
                              </div> 
                  </div>
              </div>
              {/* all table total */}
              <div className='tableheadrti fsrti pbiarti'>
                  <div className='col1_rti centerrti'></div>
                  <div className='col2_rti ps-2 d-flex align-items-center'>Total</div>
                  <div className='col3_rti d-flex align-items-center'></div>
                  <div className='col4_rti d-flex align-items-center'></div>
                  {/* <div className='col5_rti d-flex align-items-center end_rti pe-1'>{formatAmount(result?.mainTotal?.total_unitcost)}</div> */}
                  <div className='col5_rti d-flex align-items-center end_rti pe-1'>{formatAmount(result?.mainTotal?.total_amount)}</div>
                  {/* <div className='col5_rti d-flex align-items-center end_rti pe-1'>{totalAmount}</div> */}
              </div>
              {/* tax total */}
              <div className='w-100 d-flex pt-2 fsrti pbiarti'>
                <div className='w-25'></div>
                <div className='w-25'> <span className='fw-bold'>{result?.header?.PrintRemark === '' ? '' : 'NOTE :'}</span> <span dangerouslySetInnerHTML={{__html:result?.header?.PrintRemark}}></span></div>
                <div className='w-50 d-flex justify-content-end'>
                  <div className='grandtotalrti'>
                    { result?.mainTotal?.total_discount_amount === 0 ? '' : <div className='d-flex'><div className='w-50 ps-2'>Discount</div><div className='w-50 end_rti pe-1'>{formatAmount(result?.mainTotal?.total_discount_amount)}</div></div>}
                    <div className='d-flex'><div className='w-50 ps-2 fw-bold'>Total Amount</div><div className='w-50 end_rti pe-1 fw-bold'>{formatAmount(result?.mainTotal?.total_amount)}</div></div>
                    {
                      result?.allTaxes?.map((e, i) => {
                        return <div className='d-flex'><div className='w-50 ps-2'>{e?.name} @ {e?.per}</div><div className='w-50 end_rti pe-1'>{formatAmount(((+e?.amount) * result?.header?.CurrencyExchRate))}</div></div>
                      })
                    }
                    { result?.header?.AddLess === 0 ? '' : <div className='d-flex'><div className='w-50 ps-2'>{result?.header?.AddLess > 0 ? 'Add' : 'Less'}</div><div className='w-50 end_rti pe-1'>{formatAmount(result?.header?.AddLess)}</div></div>}
                    <div className='d-flex brtoprti mt-2'><div className='w-50 ps-2 fw-bold'>Grand Total</div><div className='w-50 end_rti pe-1 fw-bold'>{formatAmount((result?.mainTotal?.total_amount + (result?.allTaxesTotal * result?.header?.CurrencyExchRate ) + result?.header?.AddLess))}</div></div>
                  </div>
                </div>
              </div>
              {/* amount in words */}
              <div className='amtinwrdrti fw-bold ps-2 pe-2 fsrti pbiarti'>Rs. {toWords?.convert(+(result?.mainTotal?.total_amount + (result?.allTaxesTotal * result?.header?.CurrencyExchRate ) + result?.header?.AddLess)?.toFixed(2))} Only /-</div>
              <div className='mt-2 amtinwrdrti fsrti pbiarti'>
                    <div className='ps-1 lh_decrease fw-bold'>NOTE :</div>
                    <div className='decrti p-1 fsrti' dangerouslySetInnerHTML={{__html:result?.header?.Declaration}}></div>
              </div>
              {/* footer comapny details */}
              <div className='footer_rti p-1 fsrti pbiarti'>
                <div className='fw-bold'>COMPANY DETAILS :</div>
                { result?.header?.Company_VAT_GST_No !== "" && <div className='lh_decrease'>GSTIN : {result?.header?.Company_VAT_GST_No?.split("-")[1]}</div>}
                <div className='lh_decrease'>{result?.header?.Company_CST_STATE} : {result?.header?.Company_CST_STATE_No}</div>
                <div className='lh_decrease'>PAN NO. : {result?.header?.Com_pannumber}</div>
                <div className='lh_decrease'>Kindly make your payment by the name of  "<b className='fsrti'>{result?.header?.accountname}</b>"</div>
                <div className='lh_decrease'>Payable at Surat (GJ) by cheque or DD</div>
                <div className='lh_decrease'>Bank Detail: Bank Account No {result?.header?.accountnumber}</div>
                <div className='lh_decrease'>Bank Name : {result?.header?.bankname}, {result?.header?.bankaddress}</div>
                <div className='lh_decrease'>RTGS/NEFT IFSC : {result?.header?.rtgs_neft_ifsc}</div>
              </div>
              <div className='mt-2 d-flex w-100 frti fw-bold pbiarti fsrti'>
                <div className='w-50 me-2 brfrti frti d-flex justify-content-center frti'>AUTHORISED, {result?.header?.customerfirmname}</div>
                <div className='w-50 ms-2 brfrti frti d-flex justify-content-center frti'>AUTHORISED, {result?.header?.CompanyFullName}</div>
              </div>
            
      
          </div>
        </div> : <p className='text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto'>{msg}</p>}</>
    )
}

export default RetailTaxInvoice