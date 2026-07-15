import React, { useEffect, useState } from "react";
import "../../assets/css/prints/detailprint4.css";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import {
  apiCall,
  checkMsg,
  formatAmount,
  handleImageError,
  handlePrint,
  isObjectEmpty,
} from "../../GlobalFunctions";
import Loader from "./../../components/Loader";
import cloneDeep from "lodash/cloneDeep";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";
const DetailPrint4 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  const [result, setResult] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [diamondWise, setDiamondWise] = useState([]);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const [imgFlag, setImgFlag] = useState(true);
  const [mdwt, setMdwt] = useState(0);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const [headerflag, setHeaderflag] = useState(false);
  const [jobWIseTotal, setJobWiseTotal] = useState(null);
  const [jobwisemisc, setJobwisemisc] = useState(0);

  const [MetShpWise, setMetShpWise] = useState([]);
  const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
  const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);

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
    let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    data.BillPrint_Json[0].address = address;

    const datas = OrganizeDataPrint(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );

    let met_shp_arr = MetalShapeNameWiseArr(datas?.json2);

    setMetShpWise(met_shp_arr);
    let tot_met = 0;
    let tot_met_wt = 0;
    met_shp_arr?.forEach((e) => {
      tot_met += e?.Amount;
      tot_met_wt += e?.metalfinewt;
    })
    setNotGoldMetalTotal(tot_met);
    setNotGoldMetalWtTotal(tot_met_wt);

    let diaObj = {
      ShapeName: "OTHERS",
      wtWt: 0,
      wtWts: 0,
      pcPcs: 0,
      pcPcss: 0,
      rRate: 0,
      rRates: 0,
      amtAmount: 0,
      amtAmounts: 0,
    };
    let diaonlyrndarr1 = [];
    let diaonlyrndarr2 = [];
    let diaonlyrndarr3 = [];
    let diaonlyrndarr4 = [];
    let diarndotherarr5 = [];
    let diaonlyrndarr6 = [];

    datas?.json2?.forEach((e) => {
      if (e?.MasterManagement_DiamondStoneTypeid === 1) {
        if (e.ShapeName?.toLowerCase() === "rnd") {
          diaonlyrndarr1.push(e);
        } else {
          diaonlyrndarr2.push(e);
        }
      }
    });

    diaonlyrndarr1.forEach((e) => {
      let findRecord = diaonlyrndarr3.findIndex(
        (a) =>
          e?.StockBarcode === a?.StockBarcode &&
          e?.ShapeName === a?.ShapeName &&
          e?.QualityName === a?.QualityName &&
          e?.isSolGem === a?.isSolGem &&
          e?.Colorname === a?.Colorname
      );

      if (findRecord === -1) {
        let obj = { ...e };
        obj.wtWt = e?.Wt;
        obj.pcPcs = e?.Pcs;
        obj.rRate = e?.Rate;
        obj.amtAmount = e?.Amount;
        diaonlyrndarr3.push(obj);
      } else {
        diaonlyrndarr3[findRecord].wtWt += e?.Wt;
        diaonlyrndarr3[findRecord].pcPcs += e?.Pcs;
        diaonlyrndarr3[findRecord].rRate += e?.Rate;
        diaonlyrndarr3[findRecord].amtAmount += e?.Amount;
      }
    });

    diaonlyrndarr2.forEach((e) => {
      let findRecord = diaonlyrndarr4.findIndex(
        (a) =>
          e?.StockBarcode === a?.StockBarcode &&
          e?.ShapeName === a?.ShapeName &&
          e?.QualityName === a?.QualityName &&
          e?.isSolGem === a?.isSolGem &&
          e?.Colorname === a?.Colorname
      );

      if (findRecord === -1) {
        let obj = { ...e };
        obj.wtWt = e?.Wt;
        obj.wtWts = e?.Wt;
        obj.pcPcs = e?.Pcs;
        obj.pcPcss = e?.Pcs;
        obj.rRate = e?.Rate;
        obj.rRates = e?.Rate;
        obj.amtAmount = e?.Amount;
        obj.amtAmounts = e?.Amount;
        diaonlyrndarr4.push(obj);
      } else {
        diaonlyrndarr4[findRecord].wtWt += e?.Wt;
        diaonlyrndarr4[findRecord].wtWts += e?.Wt;
        diaonlyrndarr4[findRecord].pcPcs += e?.Pcs;
        diaonlyrndarr4[findRecord].pcPcss += e?.Pcs;
        diaonlyrndarr4[findRecord].rRate += e?.Rate;
        diaonlyrndarr4[findRecord].rRates += e?.Rate;
        diaonlyrndarr4[findRecord].amtAmount += e?.Amount;
        diaonlyrndarr4[findRecord].amtAmounts += e?.Amount;
      }
    });

    diaonlyrndarr4.forEach((e) => {
      diaObj.wtWt += e?.wtWt;
      diaObj.wtWts += e?.wtWts;
      diaObj.pcPcs += e?.pcPcs;
      diaObj.pcPcss += e?.pcPcss;
      diaObj.rRate += e?.rRate;
      diaObj.rRates += e?.rRates;
      diaObj.amtAmount += e?.amtAmount;
      diaObj.amtAmounts += e?.amtAmounts;
    });

    diaonlyrndarr3?.forEach((e) => {
      let find_record = diaonlyrndarr6?.findIndex(
        (a) =>
          e?.ShapeName === a?.ShapeName &&
          e?.QualityName === a?.QualityName &&
          e?.isSolGem === a?.isSolGem &&
          e?.Colorname === a?.Colorname
      );
      if (find_record === -1) {
        let obj = { ...e };
        obj.wtWts = e?.wtWt;
        obj.pcPcss = e?.pcPcs;
        obj.rRates = e?.rRate;
        obj.amtAmounts = e?.amtAmount;
        diaonlyrndarr6.push(obj);
      } else {
        diaonlyrndarr6[find_record].wtWts += e?.wtWt;
        diaonlyrndarr6[find_record].pcPcss += e?.pcPcs;
        diaonlyrndarr6[find_record].rRates += e?.rRate;
        diaonlyrndarr6[find_record].amtAmounts += e?.amtAmount;
      }
    });
    diarndotherarr5 = [...diaonlyrndarr6, diaObj];
    setDiamondWise(diarndotherarr5);

    datas?.resultArray?.forEach((e) => {
      let diaqc = [];
      e?.diamonds?.forEach((a) => {
        let findrecord = diaqc?.findIndex((el) => el?.QualityName === a?.QualityName && el?.Colorname === a?.Colorname && el?.isSolGem === a?.isSolGem)
        if (findrecord === -1) {
          let obj = { ...a };
          obj._pcs = a?.Pcs;
          obj._wt = a?.Wt;
          obj._amount = a?.Amount;
          diaqc.push(obj);
        } else {
          diaqc[findrecord]._pcs += a?.Pcs;
          diaqc[findrecord]._wt += a?.Wt;
          diaqc[findrecord]._amount += a?.Amount;
        }
      })
      e.diamonds = diaqc;
      let csqc = [];
      e?.colorstone?.forEach((a) => {
        let findrecord = csqc?.findIndex((el) => el?.ShapeName === a?.ShapeName && el?.QualityName === a?.QualityName && el?.Colorname === a?.Colorname && el?.isSolGem === a?.isSolGem)
        if (findrecord === -1) {
          let obj = { ...a };
          obj._pcs = a?.Pcs;
          obj._wt = a?.Wt;
          obj._amount = a?.Amount;
          obj.Rate = a?.Rate;
          csqc.push(obj);
        } else {
          csqc[findrecord]._pcs += a?.Pcs;
          csqc[findrecord]._wt += a?.Wt;
          csqc[findrecord]._amount += a?.Amount;
          csqc[findrecord].Rate += a?.Rate;
        }
      })
      e.colorstone = csqc;
    })

    datas?.resultArray?.forEach((e) => {
      let arr = [];
      e?.misc?.forEach((a) => {
        if (a?.IsHSCOE === 0 || a?.IsHSCOE === 3) {
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
      if (arr?.length === 1) {
        if (arr[0]?.IsHSCOE === 3 && arr[0]?.Wt === 0 && arr[0]?.ServWt === 0 && arr[0]?.Rate === 0) {
          arr = [];
        }
        // else{
        //   arr = [];
        // }
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

    let mdtot = 0;
    datas?.resultArray?.forEach((e) => {
      mdtot += (((e?.totals?.diamonds?.Wt) / 5) + e?.NetWt)
    })
    setMdwt(mdtot)



    let finalArr = [];

    datas?.resultArray?.forEach((a) => {
      if (a?.GroupJob === '') {
        finalArr.push(a);
      } else {
        let b = cloneDeep(a);
        let find_record = finalArr.findIndex((el) => el?.GroupJob === b?.GroupJob);
        if (find_record === -1) {
          finalArr.push(b);
        } else {
          if (finalArr[find_record]?.GroupJob !== finalArr[find_record]?.SrJobno) {
            finalArr[find_record].designno = b?.designno;
            finalArr[find_record].HUID = b?.HUID;
          }
          finalArr[find_record].grosswt += b?.grosswt;
          finalArr[find_record].NetWt += b?.NetWt;
          finalArr[find_record].LossWt += b?.LossWt;
          finalArr[find_record].TotalAmount += b?.TotalAmount;
          finalArr[find_record].DiscountAmt += b?.DiscountAmt;
          finalArr[find_record].UnitCost += b?.UnitCost;
          finalArr[find_record].MakingAmount += b?.MakingAmount;
          finalArr[find_record].OtherCharges += b?.OtherCharges;
          finalArr[find_record].TotalDiamondHandling += b?.TotalDiamondHandling;
          finalArr[find_record].Quantity += b?.Quantity;
          finalArr[find_record].Wastage += b?.Wastage;
          finalArr[find_record].totals.metal.IsPrimaryMetal += b?.totals?.metal?.IsPrimaryMetal;
          finalArr[find_record].totals.diamonds.Wt += b?.totals?.diamonds?.Wt;
          // finalArr[find_record].diamonds_d = [...finalArr[find_record]?.diamonds ,...b?.diamonds]?.flat();
          finalArr[find_record].diamonds = [...finalArr[find_record]?.diamonds, ...b?.diamonds]?.flat();
          // finalArr[find_record].colorstone_d = [...finalArr[find_record]?.colorstone ,...b?.colorstone]?.flat();
          finalArr[find_record].colorstone = [...finalArr[find_record]?.colorstone, ...b?.colorstone]?.flat();
          // finalArr[find_record].metal_d = [...finalArr[find_record]?.metal ,...b?.metal]?.flat();
          finalArr[find_record].metal = [...finalArr[find_record]?.metal, ...b?.metal]?.flat();
          finalArr[find_record].misc = [...finalArr[find_record]?.misc, ...b?.misc]?.flat();
          finalArr[find_record].totals.diamonds.Wt += b?.totals?.diamonds?.Wt;
          finalArr[find_record].totals.diamonds.Pcs += b?.totals?.diamonds?.Pcs;
          finalArr[find_record].totals.diamonds.Amount += b?.totals?.diamonds?.Amount;
          finalArr[find_record].totals.colorstone.Wt += b?.totals?.colorstone?.Wt;
          finalArr[find_record].totals.colorstone.Pcs += b?.totals?.colorstone?.Pcs;
          finalArr[find_record].totals.colorstone.Amount += b?.totals?.colorstone?.Amount;
          finalArr[find_record].totals.misc.Wt += b?.totals?.misc?.Wt;
          finalArr[find_record].totals.misc.allservwt += b?.totals?.misc?.allservwt;
          finalArr[find_record].totals.misc.Pcs += b?.totals?.misc?.Pcs;
          finalArr[find_record].totals.misc.Amount += b?.totals?.misc?.Amount;
          finalArr[find_record].totals.metal.Amount += b?.totals?.metal?.Amount;
          finalArr[find_record].totals.metal.IsPrimaryMetal += b?.totals?.metal?.IsPrimaryMetal;
          finalArr[find_record].totals.metal.IsPrimaryMetal_Amount += b?.totals?.metal?.IsPrimaryMetal_Amount;
          finalArr[find_record].totals.misc.withouthscode1_2_pcs += b?.totals?.misc?.withouthscode1_2_pcs;
          finalArr[find_record].totals.misc.withouthscode1_2_wt += b?.totals?.misc?.withouthscode1_2_wt;
          finalArr[find_record].totals.misc.onlyHSCODE3_amt += b?.totals?.misc?.onlyHSCODE3_amt;
          // finalArr[find_record].misc_d = [...finalArr[find_record]?.misc ,...b?.misc]?.flat();
        }
      }
    })

    datas.resultArray = finalArr;

    datas?.resultArray?.forEach((e) => {
      let dia = [];
      e?.diamonds?.forEach((el) => {
        let findrecord = dia?.findIndex((a) => el?.ShapeName === a?.ShapeName && el?.QualityName === a?.QualityName && el?.Colorname === a?.Colorname && el?.isRateOnPcs === a?.isRateOnPcs && el?.isSolGem === a?.isSolGem);
        if (findrecord === -1) {
          let obj = { ...el };
          obj.dpcs = el?._pcs;
          obj.dwt = el?._wt;
          obj.Rate = el?.Rate;
          obj.damt = el?._amount;
          dia.push(obj);
        } else {
          dia[findrecord].dwt += el?._wt;
          dia[findrecord].dpcs += el?._pcs;
          dia[findrecord].Rate = el?.Rate;
          dia[findrecord].damt += el?._amount;
        }
      })
      e.diamonds = dia;




      let metarr = [];
      e?.metal?.forEach((a) => {
        if (a?.IsPrimaryMetal === 1) {

          let findrec = metarr?.findIndex((el) => el?.ShapeName === a?.ShapeName)
          if (findrec === -1) {
            let obj = { ...a };
            obj.metamt = a?.Amount;
            metarr.push(obj);
          } else {
            metarr[findrec].metamt += a?.Amount;
          }
        }
      })

      e.metal = metarr;

      let clrarr = [];
      e?.colorstone?.forEach((e) => {
        let findrec = clrarr?.findIndex((a) => a?.ShapeName === e?.ShapeName && a?.QualityName === e?.QualityName && a?.Colorname === e?.Colorname && a?.isSolGem === e?.isSolGem)
        if (findrec === -1) {
          let obj = { ...e };
          obj.csamt = e?._amount;
          obj.cswt = e?._wt;
          obj.cspcs = e?._pcs;
          obj.Rate = e?.Rate;
          clrarr.push(obj);
        } else {
          clrarr[findrec].csamt += e?._amount;
          clrarr[findrec].cswt += e?._wt;
          clrarr[findrec].cspcs += e?._pcs;
          clrarr[findrec].Rate = e?.Rate;
        }
      })

      e.colorstone = clrarr;


      let miscarr = [];
      e?.misc?.forEach((e) => {
        let findrec = miscarr?.findIndex((a) => a?.ShapeName === e?.ShapeName && a?.QualityName === e?.QualityName && a?.Colorname === e?.Colorname && a?.isRateOnPcs === e?.isRateOnPcs)
        if (findrec === -1) {
          let obj = { ...e };
          obj.msamt = e?.Amount;
          obj.mswt = e?.Wt;
          obj.mspcs = e?.Pcs;
          obj.Rate = e?.Rate;
          obj.servwt_cert = e?.ServWt;
          miscarr.push(obj);
        } else {
          miscarr[findrec].msamt += e?.Amount;
          miscarr[findrec].mswt += e?.Wt;
          miscarr[findrec].mspcs += e?.Pcs;
          miscarr[findrec].Rate = e?.Rate;
          miscarr[findrec].servwt_cert += e?.ServWt;
        }
      })

      e.misc = miscarr;

    })

    let finalArr2 = [];
    datas?.resultArray?.forEach((e) => {
      let obj = { ...e };
      let discountOn = [];
      if (e?.IsCriteriabasedAmount === 1) {
        if (e?.IsMetalAmount === 1) {
          discountOn.push('Metal')
        }
        if (e?.IsDiamondAmount === 1) {
          discountOn.push('Diamond')
        }
        if (e?.IsStoneAmount === 1) {
          discountOn.push('Stone')
        }
        if (e?.IsMiscAmount === 1) {
          discountOn.push('Misc')
        }
        if (e?.IsLabourAmount === 1) {
          discountOn.push('Labour')
        }
        if (e?.IsSolitaireAmount === 1) {
          discountOn.push('Solitaire')
        }
      } else {
        if (e?.Discount !== 0) {
          discountOn.push('Total Amount')
        }
      }

      obj.discountOn = discountOn;
      obj.str_discountOn = discountOn?.join(',');

      finalArr2.push(obj);
    })

    datas.resultArray = finalArr2;

    let misc_dp4 = {
      misc_dp4_wt: 0,
      misc_dp4_pcs: 0,
    }
    datas?.resultArray?.forEach((a) => {
      a?.misc?.forEach((el) => {
        if (el?.IsHSCOE === 0) {
          misc_dp4.misc_dp4_pcs += el?.mspcs;
          misc_dp4.misc_dp4_wt += el?.mswt;
        }
      })

    })

    datas?.resultArray?.forEach((el) => {

      let jwttot = 0;

      el?.diamonds?.forEach((a) => {
        jwttot += a?.dwt;
      })

      el.totals.diamonds.Wt = jwttot;
    })

    setJobWiseTotal(misc_dp4)
    setResult(datas);
    setLoader(false);
  };

  const handleImgShow = () => {
    if (imgFlag) setImgFlag(false);
    else {
      setImgFlag(true);
    }
  };

  const handleHeaderShow = () => {
    if (headerflag) setHeaderflag(false);
    else {
      setHeaderflag(true);
    }
  };


  const discountCriteria = [
    { key: 'DiamondDiscount', isAmountKey: 'IsDiamondDiscInAmount', label: 'Diamond' ,disAmount:"DiamondDiscountAmount" },
    { key: 'MetalDiscount', isAmountKey: 'IsMetalDiscInAmount', label: 'Metal' ,disAmount:"MetalDiscountAmount" },
    { key: 'StoneDiscount', isAmountKey: 'IsStoneDiscInAmount', label: 'Colorstone' ,disAmount:"StoneDiscountAmount" },
    { key: 'LabourDiscount', isAmountKey: 'IsLabourDiscInAmount', label: 'Labour' ,disAmount:"LabourDiscountAmount" },
    { key: 'SolitaireDiscount', isAmountKey: 'IsSolitaireDiscInAmount', label: 'Solitaire' ,disAmount:"SolitaireDiscountAmount1" },
    { key: 'MiscDiscount', isAmountKey: 'IsMiscDiscInAmount', label: 'Misc' ,disAmount:"MiscDiscountAmount" },
  ];

 
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          {msg === "" ? (
            <div className="container_dp4 mb-5 pb-5">
              <div className="d-flex justify-content-end align-items-center user-select-none printHide_dp4 mt-5">
                <div className="mb-3 me-2 justify-content-center align-items-center">
                  <input
                    type="checkbox"
                    className="me-2"
                    value={imgFlag}
                    checked={imgFlag}
                    onChange={(e) => handleImgShow(e)}
                    id="imgshowdp4"
                  />
                  <label htmlFor="imgshowdp4"> With Image </label>
                </div>
                <div className="mb-3 me-2 justify-content-center align-items-center">
                  <input
                    type="checkbox"
                    className="me-2"
                    value={headerflag}
                    checked={headerflag}
                    onChange={(e) => handleHeaderShow(e)}
                    id="headershowdp4"
                  />
                  <label htmlFor="headershowdp4"> Header </label>
                </div>
                <div className="mb-3">
                  <button
                    className="btn_white blue py-1"
                    onClick={(e) => handlePrint(e)}
                  >
                    Print
                  </button>
                </div>
              </div>
             
              <div>
                <div className="headlabeldp4 fw-bold">
                  {result?.header?.PrintHeadLabel}
                </div>
                 {/* header */}
              {
              headerflag &&(
                <div className="d-flex align-items-center pb-2 border-bottom recordDetailPrint1" style={{marginBottom:"10px"}}>
                <div className="col-6 headerfontsize" style={{lineHeight:"0.9"}}>
                  <h2 className="fw-bold detailPrint1L_font_16 pb-1">{result?.header?.CompanyFullName}</h2>
                  {result?.header?.CompanyAddress !== "" && (<p className="lhDetailPrint1 pb-1">{result?.header?.CompanyAddress}</p>)}
                  {result?.header?.CompanyAddress2 !== "" && (<p className="lhDetailPrint1 pb-1">{result?.header?.CompanyAddress2}</p>)}
                  <p className="lhDetailPrint1 pb-1">
                    {result?.header?.CompanyCity !== "" && `${result?.header?.CompanyCity}`}{result?.header?.CompanyPinCode !== "" && `-${result?.header?.CompanyPinCode},`}
                    {result?.header?.CompanyState !== "" && `${result?.header?.CompanyState}`}{result?.header?.CompanyCountry !== "" && `${(result?.header?.CompanyCountry)}`}
                  </p>
                  {result?.header?.CompanyTellNo !== "" && (<p className="lhDetailPrint1 pb-1">T {result?.header?.CompanyTellNo}</p>)}
                  <p className="lhDetailPrint1 pb-1">
                    {result?.header?.CompanyEmail} {result?.header?.CompanyWebsite !== "" && `| ${result?.header?.CompanyWebsite}`}
                  </p>
                  <p className="lhDetailPrint1 pb-1">
                    {result?.header?.Company_VAT_GST_No} 
                    {result?.header?.Company_CST_STATE_No !== "" && `| ${result?.header?.Company_CST_STATE}`}
                    {result?.header?.Company_CST_STATE_No !== "" && `-${result?.header?.Company_CST_STATE_No}`} {result?.header?.Pannumber !== "" && `| PAN-${result?.header?.Pannumber}`}
                  </p>
                </div>
                <div className="col-6">
                  {isImageWorking && (result?.header?.PrintLogo !== "" &&
                    <img src={result?.header?.PrintLogo} alt=""
                      className='w-25 h-auto ms-auto d-block object-fit-contain'
                      onError={handleImageErrors} height={120} width={150} />)}
                </div>
              </div>
              )
            }
                <div className="d-flex justify-content-between align-items-center fs_dp4">
                  <div className="w-25">
                    <div className="ps-2">To,</div>
                    <div className="fw-bold ps-2">
                      {result?.header?.Customercode}
                    </div>
                  </div>
                  <div className="w-25">
                    <div className="d-flex w-100">
                      <div className="w-50 end_dp4">
                        Invoice#&nbsp;&nbsp;&nbsp;:
                      </div>
                      <div className="fw-bold w-50 start_dp4">
                        {result?.header?.InvoiceNo}
                      </div>
                    </div>
                    <div className="d-flex w-100">
                      <div className="w-50 end_dp4">
                        Date&nbsp;&nbsp;&nbsp;:
                      </div>
                      <div className="fw-bold w-50 start_dp4">
                        {result?.header?.EntryDate}
                      </div>
                    </div>
                    {result?.header?.HSN_No !== "" && ( 
                      <div className="d-flex w-100">
                        <div className="w-50 end_dp4">
                          {result?.header?.HSN_No_Label}&nbsp;&nbsp;&nbsp;:
                        </div>
                        <div className="fw-bold w-50 start_dp4">
                          {result?.header?.HSN_No}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="d-flex theaddp4 fw-bold fs_dp4">
                  <div className="col1_dp4 border-secondary border-end center_dp4">
                    Sr
                  </div>
                  <div className="col2_dp4 border-secondary border-end center_dp4">
                    Design
                  </div>
                  <div className="col3_dp4 border-secondary border-end">
                    <div className="w-100 center_dp4 h-50">Diamond</div>
                    <div className="d-flex w-100 border-secondary border-top h-50">
                      <div
                        className="center_dp4 dia_col_w_dp4 border-secondary border-end"
                        style={{ width: "35%" }}
                      >
                        Charity / Color
                      </div>
                      <div
                        className="center_dp4 dia_col_w_dp4 border-secondary border-end"
                        style={{ width: "10%" }}
                      >
                        Pcs
                      </div>
                      <div
                        className="center_dp4 border-secondary border-end dia_col_w_dp4"
                        style={{ width: "15%" }}
                      >
                        Wt
                      </div>
                      <div className="center_dp4 border-secondary border-end dia_col_w_dp4">
                        Rate
                      </div>
                      <div className="center_dp4 dia_col_w_dp4">Amount</div>
                    </div>
                  </div>
                  <div className="col4_dp4 border-secondary border-end">
                    <div className="center_dp4 h-50 w-100">Metal</div>
                    <div className="d-flex h-50 w-100 border-secondary border-top">
                      <div className="center_dp4 dia_col_w_dp4 border-secondary border-end">
                        Quality
                      </div>
                      <div className="center_dp4 dia_col_w_dp4 border-secondary border-end">
                        Wt(M+D)
                      </div>
                      <div className="center_dp4 dia_col_w_dp4 border-secondary border-end">
                        N+L
                      </div>
                      <div className="center_dp4 dia_col_w_dp4 border-secondary border-end">
                        Rate
                      </div>
                      <div className="center_dp4 dia_col_w_dp4">Amount</div>
                    </div>
                  </div>
                  <div className="col5_dp4 border-secondary border-end">
                    <div className="w-100 center_dp4 h-50">Stone</div>
                    <div className="d-flex w-100 border-secondary border-top h-50">
                      <div
                        className="center_dp4 col_w_dp4 border-secondary border-end"
                        style={{ width: "35%" }}
                      >
                        Charity / Color
                      </div>
                      <div
                        className="center_dp4 col_w_dp4 border-secondary border-end"
                        style={{ width: "10%" }}
                      >
                        Pcs
                      </div>
                      <div
                        className="center_dp4 col_w_dp4 border-secondary border-end"
                        style={{ width: "15%" }}
                      >
                        Wt
                      </div>
                      <div className="center_dp4 col_w_dp4 border-secondary border-end">
                        Rate
                      </div>
                      <div className="center_dp4 col_w_dp4">Amount</div>
                    </div>
                  </div>
                  <div className="col6_dp4 border-secondary border-end center_dp4 text-break " style={{ lineHeight: '12px' }}>
                    Other <br /> Amount
                  </div>
                  <div className="col7_dp4 border-secondary border-end">
                    <div className="h-50 center_dp4 w-100">Labour</div>
                    <div className="d-flex w-100 border-secondary border-top h-50">
                      <div className="w-100 border-secondary border-end center_dp4">
                        Rate
                      </div>
                      <div className="w-100 center_dp4">Amount</div>
                    </div>
                  </div>
                  <div className="col8_dp4 center_dp4">Total Amount</div>
                </div>
                {/* table body */}
                <div>
                  {result?.resultArray?.map((e, i) => {
                     const discountDisplay = discountCriteria
                     .filter(({ key }) => e?.[key] > 0)
                     .map(({ key, isAmountKey, label,disAmount }) => {
                       const num = Number(e[key]);  
                       const am= Number(e[disAmount])
                       const decimals = e[isAmountKey] === 1 ? 3 : 2;  
                       const val = num.toFixed(decimals);  
                       return e[isAmountKey] === 0 ? `${val}% @${label} Amount ` : `${val} @${label} Amount`;
                     })
                     .join(', ');
         
                    return (
                      <div className="fs_dp4" key={i}>
                        <div className="d-flex border-secondary border-start border-end border-bottom w-100">
                          <div className="col1_dp4 border-secondary border-end center_top_dp4 fs_dp4">
                            {i + 1}
                          </div>
                          <div className="col2_dp4 border-secondary border-end">
                            <div className="d-flex justify-content-between align-items-start fs_dp4">
                              <div>{e?.designno}</div>
                              <div>{e?.SrJobno}</div>
                            </div>
                            {imgFlag ? (
                              <div className="center_dp4">
                                <img
                                  src={e?.DesignImage}
                                  alt="#designimg"
                                  onError={(e) => handleImageError(e)}
                                  className="designimg_dp4"
                                />
                              </div>
                            ) : (
                              ""
                            )}
                            {e?.HUID === "" ? (
                              ""
                            ) : (
                              <div className="center_dp4 fs_dp4">
                                HUID: {e?.HUID}
                              </div>
                            )}
                            <div className="w-100 text-break text-center py-1"><b>{e?.grosswt?.toFixed(3)}</b> gm Gross</div>
                          </div>
                          <div className="col3_dp4 border-secondary border-end">
                            <div>
                              {e?.diamonds?.map((el, ind) => {
                                return (
                                  <div className="d-flex fs_dp4" key={ind}>
                                    <div className="dia_col_w_dp4 start_dp4" style={{ width: "35%" }} > {el?.isSolGem ? "S:" : ""}{el?.QualityName} {el?.Colorname} </div>
                                    <div className="dia_col_w_dp4 end_dp4 lh_dp4_amt" style={{ width: "10%" }} > {el?.dpcs} </div>
                                    <div className="dia_col_w_dp4 end_dp4 lh_dp4_amt" style={{ width: "15%" }} > {el?.dwt?.toFixed(3)} </div>
                                    <div className="dia_col_w_dp4 end_dp4 lh_dp4_amt">
                                      {formatAmount((el?.damt / (el?.isRateOnPcs === 1 ? (el?.dpcs === 0 ? 1 : el?.dpcs) : (el?.dwt === 0 ? 1 : el?.dwt)))) + (el?.isRateOnPcs ? "/PC" : "")}
                                    </div>
                                    <div className="dia_col_w_dp4 end_dp4 fw-bold lh_dp4_amt">
                                      {formatAmount(el?.damt)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className="col4_dp4 border-secondary border-end">
                            <div>
                              {
                                e?.metal?.map((el, ind) => {

                                  return (
                                    <div key={ind}>
                                      {
                                        el?.IsPrimaryMetal === 1 ? <div className="d-flex border-secondary border-bottom" >
                                          <div className="dia_col_w_dp4 start_dp3 d-flex align-items-center" style={{ width: '18%', wordBreak: 'break-word', lineHeight: '11px' }}>{e?.MetalTypePurity}</div>
                                          {/* <div className="dia_col_w_dp4 end_dp3">{e?.grosswt?.toFixed(3)}</div> */}

                                          <div className="dia_col_w_dp4 end_dp3 d-flex justify-content-end align-items-center lh_dp4_amt" style={{ width: '19%' }}>{(((e?.totals?.diamonds?.Wt) / 5) + e?.NetWt)?.toFixed(3)}</div>
                                          {/* <div className="dia_col_w_dp4 end_dp3">{(e?.NetWt + e?.LossWt)?.toFixed(3)}</div> */}
                                          <div className="dia_col_w_dp4 end_dp3 d-flex justify-content-end align-items-center lh_dp4_amt">{((e?.NetWt + e?.LossWt) - e?.totals?.metal?.WithOutPrimaryMetal)?.toFixed(3)}</div>
                                          {/* <div className="dia_col_w_dp4 end_dp3 d-flex justify-content-end align-items-center">{(e?.totals?.metal?.IsPrimaryMetal)?.toFixed(3)}</div> */}
                                          {/* <div className="dia_col_w_dp4 end_dp3 d-flex justify-content-end align-items-center">{(el?.Wt)?.toFixed(3)}</div> */}
                                          <div className="dia_col_w_dp4 d-flex justify-content-end align-items-center lh_dp4_amt">{formatAmount((el?.metamt / (e?.NetWt === 0 ? 1 : e?.NetWt)))}</div>
                                          <div className="dia_col_w_dp4 d-flex justify-content-end align-items-center fw-bold lh_dp4_amt" style={{ width: '22%' }}>{formatAmount(el?.metamt)}</div>
                                        </div> : ''
                                      }

                                    </div>
                                  )
                                })
                              }
                              {/* {e?.metal?.map((el, ind) => {
                                return (
                                  <div
                                    className="d-flex border-secondary border-bottom fs_dp4"
                                    key={ind}
                                  >
                                    <div
                                      className="dia_col_w_dp4 start_dp4"
                                      style={{ wordWrap: "break-word" }}
                                    >
                                      {e?.MetalTypePurity}
                                    </div>
                                    <div className="dia_col_w_dp4 end_dp4">
                                      {e?.grosswt?.toFixed(3)}
                                    </div>
                                    <div className="dia_col_w_dp4 end_dp4">
                                      {(e?.NetWt + e?.LossWt)?.toFixed(3)}
                                    </div>
                                    <div className="dia_col_w_dp4 end_dp4">
                                      {formatAmount(el?.Rate)}
                                    </div>
                                    <div className="dia_col_w_dp4 end_dp4 fw-bold">
                                      {formatAmount(el?.Amount)}
                                    </div>
                                  </div>
                                );
                              })} */}
                              {e?.JobRemark === '' ? '' : <div className="ms-2">
                                Remark: <br /><b>{e?.JobRemark}</b>
                              </div>}
                            </div>
                          </div>
                          <div className="col5_dp4 border-secondary border-end">
                            <div>
                              {e?.colorstone?.map((el, ind) => {
                                return (
                                  <div className="d-flex fs_dp4" key={ind}>
                                    <div className="dia_col_w_dp4 start_dp4 lh_dp4_amt" style={{ width: "35%" }} >
                                    {el?.isSolGem ? "G:" : ""}  {el?.QualityName} {el?.Colorname}
                                    </div>
                                    <div className="dia_col_w_dp4 end_dp4 lh_dp4_amt" style={{ width: "10%" }} >
                                      {el?.cspcs}
                                    </div>
                                    <div className="dia_col_w_dp4 end_dp4 lh_dp4_amt" style={{ width: "15%" }} >
                                      {el?.cswt?.toFixed(3)}
                                    </div>
                                    <div className="dia_col_w_dp4 end_dp4 lh_dp4_amt">
                                      {formatAmount(((el?.csamt) / (el?.isRateOnPcs === 1 ? (el?.cspcs === 0 ? 1 : el?.cspcs) : (el?.cswt === 0 ? 1 : el?.cswt)))) + (el?.isRateOnPcs ? "/PC" : "")}
                                    </div>
                                    <div className="dia_col_w_dp4 end_dp4 fw-bold lh_dp4_amt">
                                      {formatAmount(el?.csamt)}
                                    </div>
                                  </div>
                                );
                              })}
                              {
                                e?.misc?.map((el, i) => {
                                  return (
                                    <div className="d-flex fs_dp4" key={i}>
                                      <div className="dia_col_w_dp4 start_dp4 lh_dp4_amt" style={{ width: "35%", wordBreak: 'break-word' }} >M: {el?.ShapeName} </div>
                                      <div className="dia_col_w_dp4 end_dp4 lh_dp4_amt" style={{ width: "10%" }} >
                                        {el?.mspcs}
                                      </div>
                                      <div className="dia_col_w_dp4 end_dp4 lh_dp4_amt" style={{ width: "15%" }} >
                                        {/* { el?.ShapeName?.includes("Certification") ? el?.servwt_cert?.toFixed(3) :  el?.mswt?.toFixed(3)} */}
                                        {(el?.IsHSCOE === 1 || el?.IsHSCOE === 2 || el?.IsHSCOE === 3) ? el?.servwt_cert?.toFixed(3) : el?.mswt?.toFixed(3)}
                                      </div>
                                      <div className="dia_col_w_dp4 end_dp4 lh_dp4_amt">
                                        {el?.ShapeName?.includes("Certification") ? formatAmount((el?.isRateOnPcs === 0 ? (el?.msamt / (el?.servwt_cert === 0 ? 1 : el?.servwt_cert)) : (el?.msamt / (el?.servwt_cert === 0 ? 1 : el?.servwt_cert)))) : formatAmount((el?.isRateOnPcs === 0 ? (el?.msamt / (el?.mswt === 0 ? 1 : el?.mswt)) : (el?.msamt / (el?.mspcs === 0 ? 1 : el?.mspcs)))) }

                                        { el?.isRateOnPcs==1? "/PC":""}
                                      </div>
                                      <div className="dia_col_w_dp4 end_dp4 fw-bold lh_dp4_amt">
                                        {formatAmount(el?.msamt)}
                                      </div>
                                    </div>
                                  )
                                })
                              }
                            </div>
                          </div>
                          <div className="col6_dp4 border-secondary border-end end_top_dp4">
                            {formatAmount(
                              e?.OtherCharges +
                              e?.totals?.misc?.isHSCODE123_amt +
                              e?.TotalDiamondHandling
                            )}
                            {/* {formatAmount(
                              ((e?.OtherCharges + e?.TotalDiamondHandling))
                            )} */}
                            {/* {
                              formatAmount(e?.OtherCharges)
                              // e?.OtherCharges +
                              //   // e?.TotalDiamondHandling +
                              //   // e?.MiscAmount
                            } */}
                          </div>
                          <div className="col7_dp4 border-secondary border-end fs_dp4">
                            <div className="d-flex">
                              <div className=" end_top_dp4 fs_dp4" style={{ width: '36%' }}>
                                { e?.MakingChargeDiscount > 0 ? formatAmount(e?.MakingChargeDiscount, 2)+" %"   : formatAmount(e?.MaKingCharge_Unit)}
                              </div>
                              <div className=" end_top_dp4 fs_dp4" style={{ width: '65%' }}>
                                {formatAmount((((e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount))))}
                                {/* {formatAmount(
                                  e?.MakingAmount
                                )} */}
                              </div>
                            </div>
                          </div>
                          <div className="col8_dp4 end_top_dp4 fs_dp4 fw-bold">
                            {formatAmount((e?.TotalAmount + e?.DiscountAmt))}
                          </div>
                        </div>
                        {/* table row wise total */}
                        <div className="d-flex border-secondary border-start border-end border-bottom w-100 bgc_dp4 fw-bold">
                          <div className="col1_dp4 border-secondary border-end center_top_dp4"></div>
                          <div className="col2_dp4 border-secondary border-end">
                            <div className="fw-bold center_dp4 fs_dp4">
                              {/* {e?.grosswt?.toFixed(3)} gm Gross */}
                            </div>
                          </div>
                          <div className="col3_dp4 border-secondary border-end">
                            <div>
                              <div className="d-flex">
                                <div className="dia_col_w_dp4 start_dp4" style={{ width: "35%" }} ></div>
                                <div className="dia_col_w_dp4 end_dp4" style={{ width: "10%" }} >
                                  {e?.totals?.diamonds?.Pcs === 0 ? '' : e?.totals?.diamonds?.Pcs}
                                </div>
                                <div className="dia_col_w_dp4 end_dp4" style={{ width: "15%" }} >
                                  {e?.totals?.diamonds?.Wt === 0 ? '' : e?.totals?.diamonds?.Wt?.toFixed(3)}
                                </div>
                                {/* <div className="dia_col_w_dp4 end_dp4">
                                </div> */}
                                <div className="dia_col_w_dp4 end_dp4" style={{ width: '40%' }}>
                                  {e?.totals?.diamonds?.Amount === 0 ? '' : formatAmount(e?.totals?.diamonds?.Amount)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col4_dp4 border-secondary border-end">
                            <div>
                              <div className="d-flex fs_dp4">
                                {/* <div className="dia_col_w_dp4 start_dp4"></div> */}
                                <div className="dia_col_w_dp4 end_dp4 lh_dp4_amt" style={{ width: '37%' }}>
                                  {/* {e?.totals?.metal?.Wt?.toFixed(3)} */}
                                  {(((e?.totals?.diamonds?.Wt) / 5) + e?.NetWt)?.toFixed(3)}
                                </div>
                                <div className="dia_col_w_dp4 end_dp4 lh_dp4_amt">
                                  {((e?.NetWt + e?.LossWt) - e?.totals?.metal?.WithOutPrimaryMetal)?.toFixed(3)}
                                </div>
                                {/* <div className="dia_col_w_dp4 end_dp4">
                                  
                                </div> */}
                                <div className="dia_col_w_dp4 end_dp4 lh_dp4_amt" style={{ width: '43%' }}>
                                  {formatAmount(e?.totals?.metal?.IsPrimaryMetal_Amount)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col5_dp4 border-secondary border-end">
                            <div>
                              <div className="d-flex fs_dp4">
                                <div className="dia_col_w_dp4 start_dp4" style={{ width: "35%" }} ></div>
                                <div className="dia_col_w_dp4 end_dp4" style={{ width: "10%" }} >
                                  {/* {(e?.totals?.colorstone?.Pcs + e?.totals?.misc?.withouthscode1_2_pcs)} */}
                                  {/* { (e?.totals?.colorstone?.Pcs + e?.totals?.misc?.withouthscode1_2_pcs) === 0 ? '' :  (e?.totals?.colorstone?.Pcs + e?.totals?.misc?.withouthscode1_2_pcs)} */}
                                  {/* { (e?.totals?.colorstone?.Pcs + e?.totals?.misc?.withouthscode1_2_pcs) === 0 ? '' :  (e?.totals?.colorstone?.Pcs + e?.totals?.misc?.withouthscode1_2_pcs)} */}
                                  {/* { (e?.totals?.colorstone?.Pcs + ( e?.misc?.length > 0 && e?.totals?.misc?.withouthscode1_2_pcs + e?.totals?.misc?.onlyHSCODE3_pcs)) === 0 ? '' :  (e?.totals?.colorstone?.Pcs + (e?.misc?.length > 0 &&  e?.totals?.misc?.withouthscode1_2_pcs + e?.totals?.misc?.onlyHSCODE3_pcs))} */}
                                  {((e?.totals?.colorstone?.Pcs + e?.totals?.misc?.withouthscode1_2_pcs) === 0 ? '' : (e?.totals?.colorstone?.Pcs + e?.totals?.misc?.withouthscode1_2_pcs))}
                                </div>
                                <div className="dia_col_w_dp4 end_dp4" style={{ width: "15%" }} >
                                  {((e?.totals?.colorstone?.Wt + e?.totals?.misc?.withouthscode1_2_wt) === 0 ? '' : (e?.totals?.colorstone?.Wt + e?.totals?.misc?.withouthscode1_2_wt)?.toFixed(3))}
                                  {/* { (e?.totals?.colorstone?.Wt + e?.totals?.misc?.withouthscode1_2_wt) === 0 ? '' : (e?.totals?.colorstone?.Wt + e?.totals?.misc?.withouthscode1_2_wt)?.toFixed(3)} */}
                                  {/* { (e?.totals?.colorstone?.Wt + e?.totals?.misc?.Wt + e?.totals?.misc?.allservwt) === 0 ? '' : (e?.totals?.colorstone?.Wt + e?.totals?.misc?.Wt + e?.totals?.misc?.allservwt)?.toFixed(3)} */}
                                </div>
                                {/* <div className="dia_col_w_dp4 end_dp4"></div> */}
                                <div className="dia_col_w_dp4 end_dp4" style={{ width: '40%' }}>
                                  {/* {(e?.totals?.colorstone?.Amount + e?.totals?.misc?.withouthscode1_2_amount) === 0 ? '' : formatAmount((e?.totals?.colorstone?.Amount + e?.totals?.misc?.withouthscode1_2_amount ))} */}
                                  {(e?.totals?.colorstone?.Amount + e?.totals?.misc?.Amount) === 0 ? '' : formatAmount((e?.totals?.colorstone?.Amount + e?.totals?.misc?.Amount))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col6_dp4 border-secondary border-end end_top_dp4 fs_dp4">
                            {/* {formatAmount(
                              e?.OtherCharges +
                                // e?.MiscAmount +
                                e?.TotalDiamondHandling
                            )} */}
                            {/* {formatAmount(
                              ((e?.OtherCharges + e?.TotalDiamondHandling))
                            )} */}
                            {formatAmount(
                              e?.OtherCharges +
                              e?.totals?.misc?.isHSCODE123_amt +
                              e?.TotalDiamondHandling
                            )}
                            {/* {formatAmount(
                              e?.OtherCharges +
                                e?.TotalDiamondHandling +
                                e?.MiscAmount
                            )} */}
                          </div>
                          <div className="col7_dp4 border-secondary border-end">
                            <div className="d-flex fs_dp4">
                              {/* <div className="w-50 end_top_dp4"></div> */}
                              <div className="end_top_dp4 w-100">
                                {formatAmount((((e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount))))}
                              </div>
                            </div>
                          </div>
                          <div className="col8_dp4 end_top_dp4 fs_dp4">
                            {/* {formatAmount(e?.TotalAmount + e?.DiscountAmt)} */}
                            {formatAmount(e?.TotalAmount + e?.DiscountAmt)}
                          </div>
                        </div>
                        {/* job wise discount */}
                        {e?.DiscountAmt === 0 ? (
                          ""
                        ) : (
                          <div className="d-flex border-secondary border-start border-end border-bottom w-100 bgc_dp4 fw-bold">
                            <div className="col1_dp4 border-secondary border-end center_top_dp4"></div>
                            <div className="col2_dp4 border-secondary border-end">
                              <div className="fw-bold center_dp4 fs_dp4"></div>
                            </div>
                            <div className="col3_dp4 border-secondary border-end">
                              <div>
                                <div className="d-flex fs_dp4">
                                  <div className=".col_w_dp4 start_dp4"></div>
                                  <div className=".col_w_dp4 end_dp4">
                                  </div>
                                  <div className=".col_w_dp4 end_dp4">
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col4_dp4 border-secondary border-end">
                              <div>
                                <div className="d-flex fs_dp4">
                                  <div className="w-25 start_dp4"></div>
                                  <div className="w-25 end_dp4">
                                  </div>
                                  <div className="w-25 end_dp4">
                                  </div>
                                  <div className="w-25 end_dp4">
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col5_dp4 border-secondary border-end">
                              <div>
                                <div className="d-flex end_dp4">
                                  Discount {discountDisplay || `${formatAmount(e?.Discount, 2)} @ Total Amount`}
                                </div>
                              </div>
                            </div>
                            <div className="col6_dp4 border-secondary border-end end_top_dp4">
                              {/* {formatAmount(
                              e?.OtherCharges +
                                e?.TotalDiamondHandling +
                                e?.MiscAmount
                            )} */}
                            </div>
                            <div className="col7_dp4 border-secondary border-end">
                              <div className="d-flex">
                                <div className="w-50 end_top_dp4"></div>
                                <div className="w-50 end_top_dp4">
                                  {formatAmount(e?.DiscountAmt)}
                                </div>
                              </div>
                            </div>
                            <div className="col8_dp4 end_top_dp4">
                              {formatAmount(e?.TotalAmount)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* tax total */}
                <div className="d-flex justify-content-end align-items-start border border-top-0 border-secondary fs_dp4 py-1">
                  <div style={{ width: "15%" }}>
                    <div className="d-flex lh_dp4">
                      <div className="w-50 end_top_dp4 ">Total Discount</div>
                      <div className="w-50 end_top_dp4">
                        {formatAmount(result?.mainTotal?.total_discount_amount)}
                      </div>
                    </div>
                    {result?.allTaxes?.map((el, ind) => {
                      return (
                        <div className="d-flex lh_dp4" key={ind}>
                          <div className="w-50 end_top_dp4">
                            {el?.name + " @ " + el?.per}
                          </div>
                          <div className="w-50 end_top_dp4">{formatAmount((el?.amountInNumber * result?.header?.CurrencyExchRate))}</div>
                        </div>
                      );
                    })}
                    <div className="d-flex lh_dp4">
                      <div className="w-50 end_top_dp4">Add/Less</div>
                      <div className="w-50 end_top_dp4">
                        {formatAmount(result?.header?.AddLess)}
                      </div>
                    </div>
                  </div>
                </div>
                {/* final total */}
                <div className="d-flex border-secondary border-start border-end border-bottom w-100 bgc_dp4 fw-bold">
                  <div className="col1_dp4 border-secondary border-end center_top_dp4"></div>
                  <div className="col2_dp4 border-secondary border-end">
                    <div className="fw-bold center_dp4 fs_dp4">
                      TOTAL
                    </div>
                  </div>
                  <div className="col3_dp4 border-secondary border-end">
                    <div>
                      <div className="d-flex fs_dp4">
                        <div className="dia_col_w_dp4 start_dp4" style={{ width: "35%" }} ></div>
                        <div className="dia_col_w_dp4 start_dp4" style={{ width: "10%" }} >
                          {result?.mainTotal?.diamonds?.Pcs}
                        </div>
                        <div className="dia_col_w_dp4 end_dp4" style={{ width: "15%" }} >
                          {result?.mainTotal?.diamonds?.Wt?.toFixed(3)}
                        </div>
                        {/* <div className="dia_col_w_dp4 end_dp4">
                        </div> */}
                        <div className="dia_col_w_dp4 end_dp4" style={{ width: "40%" }}>
                          {formatAmount(result?.mainTotal?.diamonds?.Amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col4_dp4 border-secondary border-end">
                    <div>
                      <div className="d-flex fs_dp4">
                        {/* <div className="dia_col_w_dp4 start_dp4"></div> */}
                        <div className="dia_col_w_dp4 end_dp4" style={{ width: '37%' }}>
                          {/* {result?.mainTotal?.metal?.Wt?.toFixed(3)} */}
                          {mdwt?.toFixed(3)}
                        </div>
                        <div className="dia_col_w_dp4 end_dp4" style={{ width: '25%' }}>
                          {/* {result?.mainTotal?.metal?.Wt?.toFixed(3)} */}
                          {result?.mainTotal?.metal?.IsPrimaryMetal?.toFixed(3)}
                        </div>
                        {/* <div className="dia_col_w_dp4 end_dp4" style={{width:'5%'}}>
                        </div> */}
                        <div className="dia_col_w_dp4 end_dp4" style={{ width: '43%' }}>
                          {formatAmount(result?.mainTotal?.metal?.IsPrimaryMetal_Amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col5_dp4 border-secondary border-end">
                    <div>
                      <div className="d-flex fs_dp4">
                        <div className="dia_col_w_dp4 start_dp4" style={{ width: "35%" }} ></div>
                        <div className="dia_col_w_dp4 end_dp4" style={{ width: "10%" }} >
                          {/* {(result?.mainTotal?.colorstone?.Pcs + result?.mainTotal?.misc?.Pcs )} */}
                          {(result?.mainTotal?.colorstone?.Pcs + jobWIseTotal?.misc_dp4_pcs)}
                          {/* {(result?.mainTotal?.colorstone?.Pcs + result?.mainTotal?.misc?.onlyHSCODE3_pcs + result?.mainTotal?.misc?.withouthscode1_2_pcs )} */}
                        </div>
                        <div className="dia_col_w_dp4 end_dp4" style={{ width: "15%" }} >
                          {/* {(result?.mainTotal?.colorstone?.Wt + result?.mainTotal?.misc?.Wt + result?.mainTotal?.misc?.allservwt)?.toFixed(3)} */}
                          {/* {(result?.mainTotal?.colorstone?.Wt + result?.mainTotal?.misc?.Wt + result?.mainTotal?.misc?.allservwt)?.toFixed(3)} */}
                          {/* {(result?.mainTotal?.colorstone?.Wt + result?.mainTotal?.misc?.withouthscode1_2_pcs)?.toFixed(3)} */}
                          {(result?.mainTotal?.colorstone?.Wt + jobWIseTotal?.misc_dp4_wt)?.toFixed(3)}
                        </div>
                        {/* <div className="dia_col_w_dp4 end_dp4"></div> */}
                        <div className="dia_col_w_dp4 end_dp4" style={{ width: "40%" }}>
                          {formatAmount((result?.mainTotal?.colorstone?.Amount + result?.mainTotal?.misc?.Amount))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col6_dp4 border-secondary border-end end_top_dp4 fs_dp4">
                    {formatAmount((result?.mainTotal?.total_other_charges + result?.mainTotal?.total_diamondHandling + result?.mainTotal?.misc?.isHSCODE123_amt))}
                    {/* {formatAmount(
                              e?.OtherCharges +
                                e?.TotalDiamondHandling +
                                e?.MiscAmount
                            )} */}
                  </div>
                  <div className="col7_dp4 border-secondary border-end">
                    <div className="d-flex fs_dp4">
                      <div className="w-100 end_top_dp4">
                        {formatAmount((result?.mainTotal?.total_Making_Amount + result?.mainTotal?.diamonds?.SettingAmount + result?.mainTotal?.colorstone?.SettingAmount))}
                        {/* {formatAmount(
                          result?.mainTotal?.total_MakingAmount_Setting_Amount
                        )} */}
                      </div>
                    </div>
                  </div>
                  <div className="col8_dp4 end_top_dp4 fs_dp4">
                    {formatAmount((result?.mainTotal?.total_amount + (result?.allTaxesTotal * result?.header?.CurrencyExchRate)))}
                  </div>
                </div>
              </div>
              {/* summary & footer */}
              <div className="SpBrders PgeBrakInsid">
                <div className="d-flex justify-content-between align-items-start fs_dp4">
                  <div className="d-flex" style={{ width: "80%" }}>
                    <div
                      className="border-bottom border-secondary"
                      style={{ width: "40%" }}
                    >
                      <div className="summary_dp4_head border-secondary border border-top-0 fw-bold">
                        SUMMARY
                      </div>
                      <div className="d-flex w-100">
                        <div className="w-50">
                          <div className="d-flex justify-content-between">
                            <div className="border-secondary border-start pad_s_dp4 fw-bold">
                              GOLD IN 24KT
                            </div>
                            <div className=" pad_e_dp4">
                              {(result?.mainTotal?.total_purenetwt - notGoldMetalWtTotal)?.toFixed(3)} gm
                            </div>
                          </div>
                          {
                            MetShpWise?.map((e, i) => {
                              return <div className="d-flex justify-content-between">
                                <div className="border-secondary border-start pad_s_dp4 fw-bold">
                                  {e?.ShapeName}
                                </div>
                                <div className=" pad_e_dp4">
                                  {e?.metalfinewt?.toFixed(3)} gm
                                </div>
                              </div>
                            })
                          }
                          <div className="d-flex justify-content-between">
                            <div className="border-secondary border-start pad_s_dp4 fw-bold">
                              GROSS WT
                            </div>
                            <div className=" pad_e_dp4">
                              {result?.mainTotal?.grosswt?.toFixed(3)} gm
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <div className="border-secondary border-start pad_s_dp4 fw-bold">
                              G+D WT
                            </div>
                            <div className=" pad_e_dp4">
                              {mdwt?.toFixed(3)} gm
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <div className="border-secondary border-start pad_s_dp4 fw-bold">
                              NET WT
                            </div>
                            <div className=" pad_e_dp4">
                              {/* {result?.mainTotal?.netwt?.toFixed(3)} gm */}
                              {result?.mainTotal?.metal?.IsPrimaryMetal?.toFixed(3)} gm
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <div className="border-secondary border-start pad_s_dp4 fw-bold">
                              DIAMOND WT
                            </div>
                            <div className=" pad_e_dp4">
                              {result?.mainTotal?.diamonds?.Pcs} / {result?.mainTotal?.diamonds?.Wt?.toFixed(3)} cts
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <div className="border-secondary border-start pad_s_dp4 fw-bold">
                              STONE WT
                            </div>
                            <div className="border-secondary  pad_e_dp4">
                              {/* { (result?.mainTotal?.colorstone?.Pcs + result?.mainTotal?.misc?.Pcs) } / {(result?.mainTotal?.colorstone?.Wt + result?.mainTotal?.misc?.Wt + result?.mainTotal?.misc?.allservwt )?.toFixed(3)} cts */}
                              {/* { (result?.mainTotal?.colorstone?.Pcs + result?.mainTotal?.misc?.onlyHSCODE3_pcs + result?.mainTotal?.misc?.withouthscode1_2_pcs ) } / {(result?.mainTotal?.colorstone?.Wt + result?.mainTotal?.misc?.Wt + result?.mainTotal?.misc?.allservwt )?.toFixed(3)} cts */}
                              {/* { (result?.mainTotal?.colorstone?.Pcs + jobWIseTotal?.misc_dp4_pcs ) } / {(result?.mainTotal?.colorstone?.Wt + result?.mainTotal?.misc?.Wt + result?.mainTotal?.misc?.allservwt )?.toFixed(3)} cts */}
                              {result?.mainTotal?.colorstone?.Pcs + jobWIseTotal?.misc_dp4_pcs} / {(result?.mainTotal?.colorstone?.Wt + jobWIseTotal?.misc_dp4_wt)?.toFixed(3)} cts
                            </div>
                          </div>
                          <div className="summary_dp4_head border-secondary  border border-start border-bottom border-end-0"></div>
                        </div>
                        <div className="w-50 border-secondary border-start">
                          <div className="d-flex justify-content-between">
                            <div className="pad_s_dp4 fw-bold">GOLD</div>
                            <div className="border-secondary border-end pad_e_dp4">
                              {formatAmount((result?.mainTotal?.MetalAmount - notGoldMetalTotal))}
                            </div>
                          </div>
                          {
                            MetShpWise?.map((e, i) => {
                              return <div className="d-flex justify-content-between" key={i}>
                                <div className="pad_s_dp4 fw-bold">{e?.ShapeName}</div>
                                <div className="border-secondary border-end pad_e_dp4">
                                  {formatAmount(e?.Amount)}
                                </div>
                              </div>
                            })
                          }
                          <div className="d-flex justify-content-between">
                            <div className="pad_s_dp4 fw-bold">DIAMOND</div>
                            <div className="border-secondary border-end pad_e_dp4">
                              {formatAmount(result?.mainTotal?.diamonds?.Amount)}{" "}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <div className="pad_s_dp4 fw-bold">CST</div>
                            <div className="border-secondary border-end pad_e_dp4">
                              {formatAmount((result?.mainTotal?.colorstone?.Amount + result?.mainTotal?.misc?.Amount))}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <div className="pad_s_dp4 fw-bold">MAKING</div>
                            <div className="border-secondary border-end pad_e_dp4">
                              {formatAmount((result?.mainTotal?.total_Making_Amount + result?.mainTotal?.diamonds?.SettingAmount + result?.mainTotal?.colorstone?.SettingAmount))}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <div className="pad_s_dp4 fw-bold">OTHER</div>
                            <div className="border-secondary border-end pad_e_dp4">
                              {formatAmount((result?.mainTotal?.total_other_charges + result?.mainTotal?.total_diamondHandling))}
                              {/* {formatAmount(
                                result?.mainTotal
                                  ?.total_otherCharge_Diamond_Handling
                              )} */}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <div className="pad_s_dp4 fw-bold">ADD/LESS</div>
                            <div className="border-secondary border-end pad_e_dp4">
                              {formatAmount(result?.header?.AddLess)}
                            </div>
                          </div>
                          <div className="summary_dp4_head d-flex justify-content-between  border-secondary border border-start-0 bgc_dp4">
                            <div className="pad_s_dp4 fw-bold">TOTAL</div>
                            <div className="pad_e_dp4">
                              {formatAmount((result?.mainTotal?.total_amount + (result?.allTaxesTotal * result?.header?.CurrencyExchRate)))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ width: '20%' }}>
                      <div className="summary_dp4_head border-secondary border border-top-0 fw-bold border-start-0">Diamond Details</div>
                      <div>
                        {/* {
                          Array.from({length:6}, (_,index) => (
                            <div key={index} className="border-end border-secondary">1</div>
                          ))
                        } */}
                        {
                          diamondWise?.map((e, i) => {
                            return (
                              <div key={i} className="d-flex justify-content-between px-1 border-secondary border-end">
                                {e?.ShapeName === "OTHERS" ? <div className="fw-bold">{e?.ShapeName}</div> : <div className="fw-bold">{e?.QualityName + " " + e?.Colorname}</div>}
                                <div>{e?.pcPcss} / {e?.wtWts?.toFixed(3)} cts</div>
                              </div>
                            )
                          })
                        }
                        <div className="d-flex justify-content-between w-100 border-secondary border-end border-bottom-0 border-top">
                          {/* <div className="pad_s_dp4 fw-bold">DIAMOND</div> */}
                          {/* <div className="pad_e_dp4">{result?.mainTotal?.diamonds?.Pcs} / {result?.mainTotal?.diamonds?.Wt?.toFixed(3)}</div> */}
                        </div>
                      </div>
                    </div>
                    <div style={{ width: '20%' }}>
                      <div>
                        <div className="summary_dp4_head border-secondary border border-top-0 fw-bold border-start-0">OTHER DETAILS</div>
                        <div>

                          {result?.header?.BrokerageDetails?.map((e, i) => {
                            return (
                              <div className="d-flex fsgdp10 d-flex justify-content-between w-100 border-secondary border-end" key={i}>
                                <div className="w-50 fw-bold start_dp10 pad_s_dp4">
                                  {e?.label}
                                </div>
                                <div className="w-50 end_dp10 d-flex justify-content-end pad_e_dp4">{e?.value}</div>
                              </div>
                            );
                          })}
                          <div className="d-flex justify-content-between w-100 border-secondary border-end border-bottom border-start">
                            <div className="pad_s_dp4 fw-bold">RATE IN 24KT</div>
                            <div className="pad_e_dp4">{formatAmount(result?.header?.MetalRate24K)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="" style={{ width: "20%" }}>
                      {result?.header?.PrintRemark !== "" && (
                        <>
                          <div className="summary_dp4_head border-secondary border border-start-0 border-top-0 border-end-0 fw-bold">
                            Remark
                          </div>
                          <div className="border-secondary border-bottom border-end-0 pad_s_dp4 text-break" dangerouslySetInnerHTML={{ __html: result?.header?.PrintRemark }}>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="check_dp4 border-secondary border border-bottom d-flex justify-content-center align-items-end border-top-0" style={{ width: "20%" }}>
                    <div className="w-50 border-secondary border-end h-100 center_bottom_dp4"><i>Created By</i></div>
                    <div className="w-50 h-100 center_bottom_dp4"><i>Checked By</i></div>
                  </div>
                </div>

                {result?.header?.SalesRepPolicyTermsDescription !== '' && (
                    <div className="w-100 px-1 mt-1 mb-1 d-flex">
                      <p className="fw-bold">TERMS INCLUDED:&nbsp;</p>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: result?.header?.SalesRepPolicyTermsDescription,
                        }}
                        className=""
                        />
                  </div>
                )}
              </div>
              <div className="fs_dp4">
                ** THIS IS A COMPUTER GENERATED INVOICE AND KINDLY NOTIFY US
                IMMEDIATELY IN CASE YOU FIND ANY DISCREPANCY IN THE DETAILS OF
                TRANSACTIONS
              </div>
            </div>
          ) : (
            <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
              {msg}
            </p>
          )}
        </>
      )}
    </>
  );
};

export default DetailPrint4;
