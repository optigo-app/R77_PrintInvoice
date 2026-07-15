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
import "../../assets/css/prints/invoiceprint4.css";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { cloneDeep } from "lodash";
import { NumToWord } from './../../GlobalFunctions/NumToWord';
import QrCodeForPrint from "../../components/QrCodeForPrint";

const InvoicePrint4 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
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
  // const organizeData = (headerdata, json1, json2) => {
  //   let resultArr = [];
  //   let groupedAmtTotal = 0;
  //   let totLbrAmt = 0;
  //   let totOthAmt = 0;
  //   // eslint-disable-next-line no-unused-vars
  //   let totAmt = 0;
  //   let totdis = 0;
  //   let aa = 0;
  //   // eslint-disable-next-line no-unused-vars
  //   let totmiscAmt = 0;
  //   let mainTotal = {
  //     diamonds: {
  //       Wt: 0,
  //       Pcs: 0,
  //       Rate: 0,
  //       Amount: 0,
  //     },
  //     colorstone: {
  //       Wt: 0,
  //       Pcs: 0,
  //       Rate: 0,
  //       Amount: 0,
  //     },
  //     metal: {
  //       Wt: 0,
  //       Pcs: 0,
  //       Rate: 0,
  //       Amount: 0,
  //     },
  //     misc: {
  //       Wt: 0,
  //       Pcs: 0,
  //       Rate: 0,
  //       Amount: 0,
  //     },
  //     finding: {
  //       Wt: 0,
  //       Pcs: 0,
  //       Rate: 0,
  //       Amount: 0,
  //     },
  //     totalnetwt: {
  //       netwt: 0,
  //     },
  //     totalgrosswt: {
  //       grosswt: 0,
  //     },
  //     totAmount: {
  //       TotalAmount: 0,
  //     },
  //     totlbrAmt: {
  //       Amount: 0,
  //     },
  //     totOthAmt: {
  //       Amount: 0,
  //     },
  //   };
    
  //   json1?.forEach((e, i) => {
  //     let diamondlist = [];
  //     let colorstonelist = [];
  //     let misclist = [];
  //     let metallist = [];
  //     let findinglist = [];

  //     let totals = {
  //       diamonds: {
  //         Wt: 0,
  //         Pcs: 0,
  //         Rate: 0,
  //         Amount: 0,
  //       },

  //       colorstone: {
  //         Wt: 0,
  //         Pcs: 0,
  //         Rate: 0,
  //         Amount: 0,
  //       },

  //       metal: {
  //         Wt: 0,
  //         Pcs: 0,
  //         Rate: 0,
  //         Amount: 0,
  //       },

  //       misc: {
  //         Wt: 0,
  //         Pcs: 0,
  //         Rate: 0,
  //         Amount: 0,
  //       },

  //       finding: {
  //         Wt: 0,
  //         Pcs: 0,
  //         Rate: 0,
  //         Amount: 0,
  //       },

  //       labour: {
  //         labourAmount: 0,
  //       },

  //       OtherCh: {
  //         OtherAmount: 0,
  //       },
  //     };
  //     totdis = totdis + e?.DiscountAmt;
  //     mainTotal.totAmount.TotalAmount += e?.TotalAmount;
  //     mainTotal.totOthAmt.Amount += e?.OtherCharges + e?.MiscAmount;
  //     mainTotal.totalgrosswt.grosswt += e?.grosswt;
  //     mainTotal.totalnetwt.netwt += e?.NetWt;
  //     totAmt += e?.TotalAmount;
  //     totLbrAmt += e?.MakingAmount;
  //     totOthAmt += e?.OtherCharges;
  //     totmiscAmt += e?.MiscAmount;
  //     json2?.forEach((ele) => {
  //       if (e?.SrJobno === ele?.StockBarcode) {
  //         if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
  //           diamondlist.push(ele);
  //           totals.diamonds.Amount += ele?.Amount;
  //           totals.diamonds.Rate += ele?.Rate;
  //           totals.diamonds.Pcs += ele?.Pcs;
  //           totals.diamonds.Wt += ele?.Wt;
  //           mainTotal.diamonds.Amount += ele?.Amount;
  //           mainTotal.diamonds.Rate += ele?.Rate;
  //           mainTotal.diamonds.Pcs += ele?.Pcs;
  //           mainTotal.diamonds.Wt += ele?.Wt;
  //         }
  //         if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
  //           colorstonelist.push(ele);
  //           totals.colorstone.Amount += ele?.Amount;
  //           totals.colorstone.Rate += ele?.Rate;
  //           totals.colorstone.Pcs += ele?.Pcs;
  //           totals.colorstone.Wt += ele?.Wt;
  //           mainTotal.colorstone.Amount += ele?.Amount;
  //           mainTotal.colorstone.Rate += ele?.Rate;
  //           mainTotal.colorstone.Pcs += ele?.Pcs;
  //           mainTotal.colorstone.Wt += ele?.Wt;
  //         }
  //         if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
  //           misclist.push(ele);
  //           totals.misc.Amount += ele?.Amount;
  //           totals.misc.Rate += ele?.Rate;
  //           totals.misc.Pcs += ele?.Pcs;
  //           totals.misc.Wt += ele?.Wt;
  //           mainTotal.misc.Amount += ele?.Amount;
  //           mainTotal.misc.Rate += ele?.Rate;
  //           mainTotal.misc.Pcs += ele?.Pcs;
  //           mainTotal.misc.Wt += ele?.Wt;
  //         }
  //         if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
  //           metallist.push(ele);
  //           totals.metal.Amount += ele?.Amount;
  //           totals.metal.Rate += ele?.Rate;
  //           totals.metal.Pcs += ele?.Pcs;
  //           totals.metal.Wt += ele?.Wt;
  //           mainTotal.metal.Amount += ele?.Amount;
  //           mainTotal.metal.Rate += ele?.Rate;
  //           mainTotal.metal.Pcs += ele?.Pcs;
  //           mainTotal.metal.Wt += ele?.Wt;
  //         }
  //         if (ele?.MasterManagement_DiamondStoneTypeid === 5) {
  //           diamondlist.push(ele);
  //           totals.finding.Amount += ele?.Amount;
  //           totals.finding.Rate += ele?.Rate;
  //           totals.finding.Pcs += ele?.Pcs;
  //           totals.finding.Wt += ele?.Wt;
  //           mainTotal.finding.Amount += ele?.Amount;
  //           mainTotal.finding.Rate += ele?.Rate;
  //           mainTotal.finding.Pcs += ele?.Pcs;
  //           mainTotal.finding.Wt += ele?.Wt;
  //         }
  //       }
  //     });
  //     let obj = { ...e };
  //     obj.diamonds = diamondlist;
  //     obj.colorstone = colorstonelist;
  //     obj.misc = misclist;
  //     obj.metal = metallist;
  //     obj.finding = findinglist;
  //     obj.jobwisetotal = totals;
  //     resultArr.push(obj);
  //   });

  //   setMainTotal(mainTotal);
  //   let head = HeaderComponent(headerdata?.HeaderNo, headerdata);
  //   setHeader(head);
  //   let subhead = FooterComponent("2", headerdata);
  //   setSubHeader(subhead);
  //   setResultArray(resultArr);

  //   let arr = [];

  //   // eslint-disable-next-line array-callback-return
  //   json2.map((ele) => {
  //     if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
  //       if(ele?.IsPrimaryMetal === 1){

        
  //       if (arr?.length === 0) {
  //         arr.push(ele);
  //       } else {
  //         let findIndex = arr.findIndex(
  //           (e) =>
  //             // e?.ShapeName === ele?.ShapeName &&
  //             e?.Rate === ele?.Rate &&
  //             e?.QualityName === ele?.QualityName
  //         );
  //         if (findIndex === -1) {
  //           arr.push(ele);
  //         } else {
  //           arr[findIndex].Wt += ele?.Wt;
  //           arr[findIndex].Amount += ele?.Amount;
  //         }
  //       }
  //     }
  //     } 
  //     // else if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
  //     //   if (arr.length === 0) {
  //     //     arr.push(ele);
  //     //   } else {
  //     //     let findIndex = arr.findIndex((e) => e?.Rate === ele?.Rate);
  //     //     if (findIndex === -1) {
  //     //       arr.push(ele);
  //     //     } else {
  //     //       arr[findIndex].Wt += ele?.Wt;
  //     //       arr[findIndex].Amount += ele?.Amount;
  //     //     }
  //     //   }
  //     // }
  //      else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
  //       if (arr.length === 0) {
  //         arr.push(ele);
  //       } else {
  //         let findIndex = arr.findIndex((e) => e?.Rate === ele?.Rate);
  //         if (findIndex === -1) {
  //           arr.push(ele);
  //         } else {
  //           arr[findIndex].Wt += ele?.Wt;
  //           arr[findIndex].Amount += ele?.Amount;
  //         }
  //       }
  //     } else if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
  //       if (arr.length === 0) {
  //         arr.push(ele);
  //       } else {
  //         let findIndex = arr.findIndex((e) => e?.Rate === ele?.Rate);
  //         if (findIndex === -1) {
  //           arr.push(ele);
  //         } else {
  //           arr[findIndex].Wt += ele?.Wt;
  //           arr[findIndex].Amount += ele?.Amount;
  //         }
  //       }
  //     }
  //   });

   
  //   // eslint-disable-next-line array-callback-return
  //   json1?.map((e) => {
  //     aa += e?.TotalAmount;
  //   });

  //   groupedAmtTotal = groupedAmtTotal + totLbrAmt + totOthAmt;
  //   let obj1 = {
  //     ShapeName: "OTHER",
  //     QualityName: "",
  //     Amount: totOthAmt,
  //   };
  //   let obj2 = {
  //     ShapeName: "LABOUR",
  //     QualityName: "",
  //     Amount: totLbrAmt,
  //   };
  //   // eslint-disable-next-line no-unused-vars
  //   // let obj3 = {
  //   //   ShapeName: "MISC",
  //   //   QualityName: "",
  //   //   Amount: totmiscAmt,
  //   // };
  //   let LOM = [];
  //   // LOM.push(obj3, obj2, obj1);
  //   LOM.push(obj2, obj1);
  //   setLOM(LOM);
  //   setGroupedArrAmountTotal(groupedAmtTotal);


  //   arr.sort((a, b) => {
  //     if (
  //       a.MasterManagement_DiamondStoneTypeid === 4 &&
  //       b.MasterManagement_DiamondStoneTypeid !== 4
  //     ) {
  //       return -1; // a comes before b if a is 'Gold' and b is not
  //     } else if (
  //       b.MasterManagement_DiamondStoneTypeid === 4 &&
  //       a.MasterManagement_DiamondStoneTypeid !== 4
  //     ) {
  //       return 1; // b comes before a if b is 'Gold' and a is not
  //     } else {
  //       if (
  //         a.MasterManagement_DiamondStoneTypeid === 1 &&
  //         b.MasterManagement_DiamondStoneTypeid !== 1
  //       ) {
  //         return -1;
  //       } else if (
  //         b.MasterManagement_DiamondStoneTypeid === 1 &&
  //         a.MasterManagement_DiamondStoneTypeid !== 1
  //       ) {
  //         return 1;
  //       } else {
  //         return a.MasterManagement_DiamondStoneTypeName.localeCompare(
  //           b.MasterManagement_DiamondStoneTypeName
  //         ); // Sort by name if metalType is not 'Gold'
  //       }
  //     }
  //   });

  //   setGroupedArr(arr);

  //   setMainTotal(mainTotal);


  //   let allTax = taxGenrator(headerdata, aa);
  //   setTaxTotal(allTax);

  //   allTax?.forEach((e) => {
  //     aa += +e?.amount;
  //   });

  //   let ab = +aa?.toFixed(2);
  //   let words = numberToWord(ab) + " Only";
  //   setInWords(words);
  //   setGrandTotal(aa);
  //   setTotDiscount(totdis);
  //   const groupedData = arr.reduce((result, item) => {
  //     let groupName;

  //     switch (item.MasterManagement_DiamondStoneTypeid) {
  //       case 1:
  //         groupName = "DIAMOND";
  //         break;
  //       case 2:
  //         groupName = "COLORSTONE";
  //         break;
  //       case 3:
  //         groupName = "CZ STUDDED JEWELLERY";
  //         break;
  //       case 4:
  //         groupName = "GOLD";
  //         break;
  //       default:
  //         groupName = "OTHER";
  //     }

  //     // Initialize the group if it doesn't exist
  //     if (!result[groupName]) {
  //       result[groupName] = [];
  //     }

  //     // Add the item to the corresponding group
  //     result[groupName].push(item);

  //     return result;
  //   }, {});

  //   const groupNamesArray = Object.keys(groupedData);
  //   const sentence = groupNamesArray?.join(", ");
  //   // setDescArr(sentence);
  // };

  async function loadData(data) {
    try {
      // setHeaderData(data?.BillPrint_Json[0]);
      // organizeData(
      //   data?.BillPrint_Json[0],
      //   data?.BillPrint_Json1,
      //   data?.BillPrint_Json2
      // );



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
        // let dia = [];
        e?.diamonds?.forEach((el) => {
          // let findRecord = diamonds?.findIndex((a) => a?.QualityName === el?.QualityName &&
          //  a?.Colorname === el?.Colorname  && a?.ShapeName === el?.ShapeName && a?.Rate === el?.Rate)
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
        // e?.diamonds?.forEach((el) => {
        //   let findRecord = diamonds?.findIndex((a) => a?.QualityName === el?.QualityName && a?.Colorname === el?.Colorname && a?.ShapeName === el?.ShapeName)
        //   if(findRecord === -1){
        //     let obj = {...el};
        //     obj.wt = obj?.Wt;
        //     obj.rate = obj?.Rate;
        //     obj.amount = obj?.Amount;
        //     diamonds.push(obj);
        //   }else{
        //     diamonds[findRecord].wt += el?.Wt;
        //     diamonds[findRecord].rate += el?.Rate;
        //     diamonds[findRecord].amount += el?.Amount;
        //   }
        // })
        
        // e.diamonds = dia;
        // diamonds = dia;

        // let cls = [];
        e?.colorstone?.forEach((el) => {
          // let findRecord = colorstones?.findIndex((a) => a?.QualityName === el?.QualityName && a?.Colorname === el?.Colorname && a?.ShapeName === el?.ShapeName)
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
        
        // e.colorstone = cls;

        // let miscs = [];
        // e?.misc?.forEach((el) => {
        //   let findRecord = cls?.findIndex((a) => a?.ShapeName === el?.ShapeName && a?.QualityName === el?.QualityName)
        //   if(findRecord === -1){
        //     let obj = {...el};
        //     obj.wt = obj?.Wt;
        //     obj.rate = obj?.Rate;
        //     obj.amount = obj?.Amount;
        //     miscs.push(obj);
        //   }else{
        //     miscs[findRecord].wt += el?.Wt;
        //     miscs[findRecord].rate += el?.Rate;
        //     miscs[findRecord].amount += el?.Amount;
        //   }
        // })

        // e.misc = miscs;

        // let met = [];
        // e?.metal?.forEach((el) => {
        //   if(el?.IsPrimaryMetal === 1){

        //     let findRecord = metals?.findIndex((a) => a?.QualityName === el?.QualityName && a?.Rate === el?.Rate)
        //     if(findRecord === -1){
        //     let obj = {...el};
        //     obj.wt = obj?.Wt;
        //     obj.rate = obj?.Rate;
        //     obj.amount = obj?.Amount;
        //     metals.push(obj);
        //   }else{
        //     metals[findRecord].wt += el?.Wt;
        //     metals[findRecord].rate += el?.Rate;
        //     metals[findRecord].amount += el?.Amount;
        //   }
        // }
        // })
        // e.metal = met;
      })
      // let mainarr = [...metals, ...diamonds, ...colorstones];
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
          // total2.total += (obj?.metalAmountFinal / data?.BillPrint_Json[0]?.CurrencyExchRate);
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
                    {/* <div style={{border:"1px solid #e8e8e8", borderBottom:"0px"}}>{header}</div> */}
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
                  {/* <div>
                    <div
                      className="d-flex"
                      style={{
                        borderBottom: "1px solid #d8d7d7",
                        borderLeft: "1px solid #d8d7d7",
                      }}
                    >
                      <div className="w-25 d-flex flex-column justify-content-between position-relative d-flex">
                        <div className="w-100 h-100 position-relative">
                          <div className="discHeadinvp4 fs12invp4">DESCRIPTION</div>
                          <div className="w-100 descriptioninovicePrint4 fs12invp4 px-1">
                            <div style={{border:"1px solid #e8e8e8", padding:"1px"}}> {descArr}</div>
                          </div>
                        </div>
                        <div className="empdivinvp4"></div>
                      </div>
                      <div className="tableinvp4 w-75">
                        <div className="theadinvp4">
                          <p
                            className="wp1invp4 fs12invp4"
                            style={{
                              justifyContent: "flex-start",
                              paddingLeft: "3px",
                            }}
                          >
                            DETAIL
                          </p>
                          <p className="wp3invp4 fs12invp4 text-end">WEIGHT</p>
                          <p className="wp3invp4 fs12invp4 text-end">RATE</p>
                          <p className="wp3invp4 fs12invp4 text-end">AMOUNT</p>
                        </div>
                        <div className=" w-100">
                          {groupedArr?.map((e, i) => {
                            return (
                              <div className={`tbodyinvp4 `} key={i}>
                                <p className="wp1tbinvp4 fsinvp4">
                                  {e?.MasterManagement_DiamondStoneTypeid === 4
                                    ? e?.ShapeName + " " + e?.QualityName
                                    : e?.MasterManagement_DiamondStoneTypeName}
                                </p>
                                <p className="wp3tbinvp4 fsinvp4 text-end">
                                  {e?.Wt?.toFixed(3)}
                                </p>
                                <p className="wp3tbinvp4 fsinvp4 text-end">
                                  {NumberWithCommas(e?.Rate, 2)}
                                </p>
                                <p className="wp3tbinvp4 fsinvp4 text-end">
                                  {NumberWithCommas(e?.Amount, 2)}
                                </p>
                              </div>
                            );
                          })}
                          {LOM?.map((e, i) => {
                            return (
                              <div className="tbodyinvp4 " key={i}>
                                {e?.ShapeName === "MISC" && e?.Amount === 0 ? (
                                  ""
                                ) : (
                                  <p className="wp1tbinvp4 fsinvp4">
                                    {e?.ShapeName}
                                  </p>
                                )}
                                <p className="wp3tbinvp4 fsinvp4 text-end">
                                  {e?.Wt?.toFixed(3)}
                                </p>
                                <p className="wp3tbinvp4 fsinvp4 text-end">
                                  {e?.Rate}
                                </p>
                                {e?.ShapeName === "MISC" && e?.Amount === 0 ? (
                                  ""
                                ) : (
                                  <p className="wp3tbinvp4 fsinvp4 text-end">
                                    {NumberWithCommas(e?.Amount, 2)}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                          <div className="tbodyinvp4 brtopinvp4 d-flex align-items-center mt-0.5" style={{ borderTop:"1px solid #e8e8e8", height:"25px"}}>
                            <p
                              className="wp1tbinvp4 fw-bold fsinvp4 "
                              style={{ width: "20%", fontSize:"13px" }}
                            >
                              TOTAL
                            </p>
                            <p
                              className="wp3tbinvp4 fw-bold fsinvp4 d-flex justify-content-end align-items-center text-end"
                              style={{ width: "20%", fontSize:"13px" }}
                            >
                              {NumberWithCommas(
                                mainTotal?.totAmount?.TotalAmount,
                                2
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> */}
                   <div className="invp4_fs" style={{ fontSize:'12px', position:'relative' }} >
                  {/* <div className="w-50 d-flex flex-column justify-content-between position-relative d-flex">
                    <div className="w-100 h-100 position-relative">
                      <div className="discHeadinvp3">DESCRIPTION</div>
                      <div className="w-100 descriptioninovicePrint3 px-2">{descArr} JEWELLERY.</div>
                    </div>
                    <div className="empdivinvp3"></div>
                  </div> */}
                 <div className="d-flex w-100 fw-bold mt-1 border">
                  <div style={{width:'40%'}} className="d-flex justify-content-center border-end">DESCRIPTION</div>
                  <div style={{width:'30%'}} className="ps-2">DETAIL</div>
                  <div className="end_invp4_ pe-1" style={{width:'10%'}}>WEIGHT</div>
                  <div className="end_invp4_ pe-1" style={{width:'10%'}}>RATE</div>
                  <div className="end_invp4_ pe-1" style={{width:'10%'}}>AMOUNT</div>
                 </div>
                 {/* <div className="w-100" style={{borderBottom:'2px solid #d8d7d7'}}> */}
                 <div className="w-100 border-bottom" >
                 {/* <div className="d-flex justify-content-start align-items-center border-start border-end  position-absolute" style={{    top: "100px"}}> */}
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
                 {/* <div className="d-flex justify-content-start align-items-center border-start border-end"><input type="text" width={"200px"} style={{width:'280px'}} className="d-flex justify-content-center align-items-center ms-5" value={ diamond_s?.length > 0 ? `DIAMOND STUDDED JEWELLERY` : `GOLD JEWELLERY`} /></div> */}
              
                  {/* {
                    diamond_s?.map((e, i) => {
                      return(
                        <div key={i} className="d-flex w-100  fsinvp3 border-start border-end" >
                        <div style={{width:'40%'}} className="d-flex justify-content-center border-end"></div>
                        <div style={{width:'30%'}} className="ps-2">{e?.MasterManagement_DiamondStoneTypeName}</div>
                        <div style={{width:'10%'}}>{e?.wt?.toFixed(3)}</div>
                        <div style={{width:'10%'}}>{formatAmount((e?.amount)/((e?.wt === 0 ? 1 : e?.wt)))}</div>
                        <div style={{width:'10%'}}>{formatAmount(e?.amount)}</div>
                        </div>
                      )
                    })
                  }
                  
                  {
                    colorstone_s?.map((e, i) => {
                      return(
                        <div key={i} className="d-flex w-100  fsinvp3 border-start border-end" >
                        <div style={{width:'40%'}} className="d-flex justify-content-center border-end"></div>
                        <div style={{width:'30%'}} className="ps-2">{e?.MasterManagement_DiamondStoneTypeName}</div>
                        <div style={{width:'10%'}}>{e?.wt?.toFixed(3)}</div>
                        <div style={{width:'10%'}}>{formatAmount((e?.amount)/((e?.wt === 0 ? 1 : e?.wt)))}</div>
                        <div style={{width:'10%'}}>{formatAmount(e?.amount)}</div>
                        </div>
                      )
                    })
                  } */}
                   {/* <div className="d-flex w-100  fsinvp3 border-start border-end" >
                        <div style={{width:'40%'}} className="d-flex justify-content-center border-end"></div>
                        <div style={{width:'30%'}} className="ps-2">MISC</div>
                        <div style={{width:'10%'}}></div>
                        <div style={{width:'10%'}}></div>
                        <div style={{width:'10%'}}>{formatAmount(result?.mainTotal?.misc?.Amount)}</div>
                        </div> */}
                        <div className="d-flex w-100  fsinvp3 border-start border-end invp4_fs" >
                        <div style={{width:'40%'}} className="d-flex justify-content-center border-end"></div>
                        <div style={{width:'30%'}} className="ps-2">LABOUR</div>
                        <div style={{width:'10%'}}></div>
                        <div className="end_invp4_ pe-1 invp4_fs" style={{width:'10%'}}>{total_makingcharge_unit === 0 ? '' : total_makingcharge_unit}</div>
                        {/* <div style={{width:'10%'}}>{formatAmount((result?.mainTotal?.total_Making_Amount + result?.mainTotal?.total_TotalCsSetcost + result?.mainTotal?.total_TotalDiaSetcost))}</div> */}
                        <div className="end_invp4_ pe-1 invp4_fs" style={{width:'10%'}}>
                          {console.log(result)
                          }
                          {formatAmount((result?.mainTotal?.total_Making_Amount + result?.mainTotal?.total_TotalCsSetcost + result?.mainTotal?.total_TotalDiaSetcost + result?.mainTotal?.totalMiscAmount + result?.mainTotal?.total_diamondHandling))}</div>
                        </div>

                        {  result?.mainTotal?.finding?.SettingAmount !== 0 && <div className="d-flex w-100  border-top-0 border border-bottom-0 invp4_fs_3">
                          <div style={{width:'40%'}} className="d-flex justify-content-center border-end"></div>
                          <div style={{width:'30%'}} className="ps-2 invp4_fs">F:LABOUR</div>
                          <div style={{width:'10%'}}></div>
                          {/* <div style={{width:'10%'}}></div> */}
                          <div className="end_invp4_ pe-1 invp4_fs" style={{width:'20%'}}>{formatAmount(result?.mainTotal?.finding?.SettingAmount)}</div>
                        </div>}
                        
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
                  {/* <div style={{width:'10%'}}></div> */}
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
                          {/* {formatAmount(grandTotal)} */}
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
                  {/* <div className="fs12invp4 footerINVP4">{subheader}</div> */}
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

export default InvoicePrint4;
