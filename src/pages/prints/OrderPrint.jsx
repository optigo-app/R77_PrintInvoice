import React, { useEffect, useState } from "react";
import "../../assets/css/prints/orderprint.css";
import {
  NumberWithCommas,
  ReceiveInBank,
  apiCall,
  checkMsg,
  fixedValues,
  formatAmount,
  handleImageError,
  handlePrint,
  isObjectEmpty,
  otherAmountDetail,
  taxGenrator,
} from "../../GlobalFunctions";
import Loader2 from "../../components/Loader2";
import Loader from "../../components/Loader";
import { cloneDeep } from "lodash";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";
const OrderPrint = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  const [image, setImage] = useState(true);
  const [json1Data, setJson1Data] = useState({});
  const [json2Data, setJson2Data] = useState([]);
  console.log('json2Data: ', json2Data);
  const [otherCharges, setOtherCharges] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [diamondDetailss, setDiamondDetailss] = useState({});
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  const [dia, setDia] = useState([]);
  // const [changePrint, setChangeprint] = useState(atob(printName).toLowerCase() === "estimate print change" ? true : false);
  const [total, setTotal] = useState({
    previeligeCardDisocunt: 0,
    totalamount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    finalAmount: 0,
    weightWithDiamondLoss: 0,
    finalDiamondTotal: {
      pcs: 0,
      weight: 0,
      rate: 0,
      amount: 0,
    },
    finalMetalsTotal: {
      pcs: 0,
      weight: 0,
      rate: 0,
      amount: 0,
      Wt: 0,
    },
    finalColorStonesTotal: {
      pcs: 0,
      weight: 0,
      rate: 0,
      amount: 0,
    },
    finalmiscsTotal: {
      pcs: 0,
      weight: 0,
      rate: 0,
      amount: 0,
    },
    findingWeight: 0,
    otherAmount: 0,
    gold24Kt: 0,
    grosswt: 0,
    gdWt: 0,
    NetWt: 0,
    diaWt: 0,
    diaPcs: 0,
    stoneWt: 0,
    stonePcs: 0,
    miscWt: 0,
    miscPcs: 0,
    goldAmount: 0,
    diamondAmount: 0,
    colorStoneAmount: 0,
    miscAmount: 0,
    makingAmount: 0,
    summaryTotalAmount: 0,
    labourAmount: 0,
    discountAmt: 0,
    Advance: 0,
    AddLess: 0,
    Bank: 0,
    Cash: 0,
    exchange: 0,
  });

  const [diamondTotal, setDiamondTotal] = useState({
    Wt: 0,
    Pcs: 0,
    Amount: 0,
  });

  const [colorStoneMiscTotal, setColorStoneMiscTotal] = useState({
    Wt: 0,
    Pcs: 0,
    Amount: 0,
  });

  const [ColorStoneTotal, setColorStoneTotal] = useState({
    Wt: 0,
    Pcs: 0,
    Amount: 0,
  });

  const [miscTotal, setMiscTotal] = useState({
    Wt: 0,
    Pcs: 0,
    Amount: 0,
  });

  const [taxes, setTaxes] = useState([]);
  const [diamondDetail, setDiamondDetail] = useState([]);
  const [loader, setLoader] = useState(true);
  const [brokrage, setBrokrage] = useState(false);
  const [brokarage, setBrokarage] = useState([]);

  const [MetShpWise, setMetShpWise] = useState([]);
  const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
  const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);

  // const handleChange = (e) => {
  //   const { name } = e?.target;
  //   if (name === "image") {
  //     image ? setImage(false) : setImage(true);
  //   } else if (name === "brokrage") {
  //     brokrage ? setBrokrage(false) : setBrokrage(true);
  //   }
  // };


  const caiculateMaterial = (data) => {
    let diamondDetailsss = [];

    data?.BillPrint_Json2?.forEach((ele, ind) => {
      let obj1 = cloneDeep(ele);
      if (obj1?.MasterManagement_DiamondStoneTypeid === 1) {
        if (obj1?.ShapeName === "RND") {
          let findDiamond = diamondDetailsss?.findIndex(
            (elem, index) =>
              elem?.Colorname === obj1?.Colorname &&
              elem?.QualityName === obj1?.QualityName
          );
          if (findDiamond === -1) {
            diamondDetailsss.push(obj1);
          } else {
            diamondDetailsss[findDiamond].Wt += obj1?.Wt;
            diamondDetailsss[findDiamond].Pcs += obj1?.Pcs;
            diamondDetailsss[findDiamond].Amount += obj1?.Amount;
          }
        } else {
          let obj = cloneDeep(ele);
          let findOther = diamondDetailsss?.findIndex(
            (elem, index) => elem?.ShapeName === "OTHER"
          );
          if (findOther === -1) {
            // let obj = { ...ele };
            obj.ShapeName = "OTHER";
            diamondDetailsss.push(obj);
          } else {
            diamondDetailsss[findOther].Wt += obj?.Wt;
            diamondDetailsss[findOther].Pcs += obj?.Pcs;
            diamondDetailsss[findOther].Amount += obj?.Amount;
          }
        }
      }
    });
    diamondDetailsss.sort((a, b) => {
      if (a.ShapeName === "OTHER" && b.ShapeName !== "OTHER") {
        return 1;
      } else if (a.ShapeName !== "OTHER" && b.ShapeName === "OTHER") {
        return -1;
      } else {
        if (a.Colorname !== b.Colorname) {
          return a.Colorname.localeCompare(b.Colorname);
        } else {
          return a.QualityName.localeCompare(b.QualityName);
        }
      }
    });
    setDia(diamondDetailsss);
    let resultArr = [];
    let totals = { ...total };

    totals.previeligeCardDisocunt = data?.BillPrint_Json[0]?.Privilege_discount;
    totals.AddLess = data?.BillPrint_Json[0]?.AddLess;
    totals.Advance = data?.BillPrint_Json[0]?.AdvanceAmount;
    totals.Bank = data?.BillPrint_Json[0]?.BankReceived;
    totals.Cash = data?.BillPrint_Json[0]?.CashReceived;

    let diamondDetailList = [];
    let diamondDetailList2 = [{ shapeQualityColor: "others", pcs: 0, wt: 0 }];
    let diamondDetails = {
      pcs: 0,
      wt: 0,
    };
    let diamondTotals = { ...diamondTotal };
    let colorStoneTotals = { ...colorStoneMiscTotal };
    let colorStoness = { ...ColorStoneTotal };
    let miscstotals = { ...miscTotal };

    let met_shp_arr = MetalShapeNameWiseArr(data?.BillPrint_Json2);

    setMetShpWise(met_shp_arr);
    let tot_met = 0;
    let tot_met_wt = 0;
    met_shp_arr?.forEach((e, i) => {
      tot_met += e?.Amount;
      tot_met_wt += e?.metalfinewt;
    });
    setNotGoldMetalTotal(tot_met);
    setNotGoldMetalWtTotal(tot_met_wt);

    let othAmt = 0;

    data?.BillPrint_Json1.forEach((e, i) => {
      othAmt += e?.OtherCharges;
      totals.discountAmt += e?.DiscountAmt;
      let settingAmount = 0;
      let totalSetttingAmount = 0;
      totalSetttingAmount += e?.MakingAmount;
      let settingRate = 0;
      let obj = { ...e };
      obj.otherChargesTotal = obj?.OtherCharges + obj?.TotalDiamondHandling;
      obj.OtherCharges = obj?.OtherCharges + obj?.TotalDiamondHandling;
      let findingTotal = 0;
      let diamonds = [];
      let metals = [];
      let colorStones = [];
      let mics = [];
      let miscsList = [];
      let finding = [];
      let anotherFinding = [];
      let otherAmountDetails = otherAmountDetail(e?.OtherAmtDetail);
      let diamondTotal = {
        pcs: 0,
        weight: 0,
        rate: 0,
        amount: 0,
      };
      let metalsTotal = {
        pcs: 0,
        weight: 0,
        Wt: 0,
        rate: 0,
        amount: 0,
        weightWithDiamondLoss: 0,
      };
      let colorStonesTotal = {
        pcs: 0,
        weight: 0,
        rate: 0,
        amount: 0,
      };
      let miscsTotal = {
        pcs: 0,
        weight: 0,
        rate: 0,
        amount: 0,
      };
      let primaryMetalAmount = 0;
      // totals.gold24Kt += e?.convertednetwt;
      totals.gold24Kt += e?.PureNetWt;
      data?.BillPrint_Json2.forEach((ele, ind) => {
        if (e?.SrJobno === ele?.StockBarcode) {
          if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
            if (ele?.ShapeName === "GOLD") {
              if (ele?.QualityName === "24K") {
              }
              totals.goldAmount += ele?.Amount;
            }
            if (ele?.IsPrimaryMetal === 1) {
              primaryMetalAmount += ele?.Amount;
            }
            ele.Weight = e?.NetWt + e?.DiamondCTWwithLoss / 5;
            metalsTotal.weightWithDiamondLoss = ele.Weight;
            metalsTotal.Wt += ele.Wt;
            totals.weightWithDiamondLoss += ele.Weight;
            totals.finalMetalsTotal.Wt += ele?.Wt;
            metalsTotal.weight = ele.Weight;
            metals.push(ele);
          }
          if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
            colorStones.push(ele);
            totals.stoneWt += ele?.Wt;
            totals.stonePcs += ele?.Pcs;
            totals.colorStoneAmount += ele?.Amount;
            colorStoneTotals.Wt += ele?.Wt;
            colorStoneTotals.Pcs += ele?.Pcs;
            colorStoneTotals.Amount += ele?.Amount;
            colorStoness.Wt += ele?.Wt;
            colorStoness.Pcs += ele?.Pcs;
            colorStoness.Amount += ele?.Amount;
          }
          if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
            diamondTotals.Pcs += ele?.Pcs;
            diamondTotals.Wt += ele?.Wt;
            diamondTotals.Amount += ele?.Amount;
            diamondDetails.pcs += ele?.Pcs;
            diamondDetails.wt += ele?.Wt;
            diamonds.push(ele);
            totals.diaWt += ele?.Wt;
            totals.diaPcs += ele?.Pcs;
            totals.diamondAmount += ele?.Amount;
            if (diamondDetailList.length > 0) {
              let findRecord = diamondDetailList.findIndex((el, indd) => {
                return (
                  el.data.ShapeName === ele.ShapeName &&
                  el.data.QualityName === ele.QualityName &&
                  el.data.Colorname === ele.Colorname
                );
              });
              if (findRecord !== -1) {
                diamondDetailList[findRecord].pcs += ele?.Pcs;
                diamondDetailList[findRecord].wt += ele?.Wt;
              } else {
                diamondDetailList.push({
                  data: ele,
                  pcs: ele?.Pcs,
                  wt: ele?.Wt,
                  shapeQualityColor:
                    ele?.ShapeName +
                    " " +
                    ele?.QualityName +
                    " " +
                    ele?.Colorname,
                });
              }
            } else {
              diamondDetailList.push({
                data: ele,
                pcs: ele?.Pcs,
                wt: ele?.Wt,
                shapeQualityColor:
                  ele?.ShapeName +
                  " " +
                  ele?.QualityName +
                  " " +
                  ele?.Colorname,
              });
            }
          }
          if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
            if (ele?.IsHSCOE === 0) {
              mics.push(ele);
              totals.miscWt += ele?.Wt;
              totals.miscPcs += ele?.Pcs;
              totals.miscAmount += ele?.Amount;

              colorStoneTotals.Wt += ele?.Wt;
              colorStoneTotals.Pcs += ele?.Pcs;
              colorStoneTotals.Amount += ele?.Amount;

              miscstotals.Wt += ele?.Wt;
              miscstotals.Pcs += ele?.Pcs;
              miscstotals.Amount += ele?.Amount;
            }
            if (ele?.IsHSCOE !== 0) {
              miscsList.push(ele);
              obj.otherChargesTotal += ele?.Amount;
            }
          }
          settingAmount += ele?.SettingAmount;
          totalSetttingAmount += ele?.SettingAmount;
          settingRate += ele?.SettingRate;
          if (ele?.MasterManagement_DiamondStoneTypeid === 5) {
            if (ele?.Supplier === "Customer") {
              findingTotal += ele?.Wt;
              finding.push(ele);
              totals.findingWeight += ele?.Wt;
            }
            anotherFinding.push(ele);
            // metalsTotal.weight += ele.Wt;
            // totals.weightWithDiamondLoss += ele.Wt;
          }
        }
      });
      totals.otherAmount += obj?.otherChargesTotal;
      totals.labourAmount += totalSetttingAmount;
      if (diamonds.length > 0) {
        diamonds.reduce((accumulator, currentObject) => {
          accumulator.amount += currentObject.Amount;
          accumulator.weight += currentObject.Wt;
          accumulator.pcs += currentObject.Pcs;
          accumulator.rate += currentObject.Rate;
          totals.finalDiamondTotal.amount += currentObject.Amount;
          totals.finalDiamondTotal.weight += currentObject.Wt;
          totals.finalDiamondTotal.pcs += currentObject.Pcs;
          totals.finalDiamondTotal.rate += currentObject.Rate;
          return accumulator;
        }, diamondTotal);
      }

      let WtSpecial = e?.NetWt + diamondTotal.weight / 5 - findingTotal;

      let metalNetWt = e?.NetWt + e?.LossWt - findingTotal;
      if (metals.length > 0) {
        metals.reduce((accumulator, currentObject) => {
          accumulator.amount += currentObject.Amount;
          // accumulator.weight += currentObject.Wt;
          accumulator.pcs += currentObject.Pcs;
          accumulator.rate += currentObject.Rate;
          // totals.finalMetalsTotal.amount += currentObject.Amount;
          totals.finalMetalsTotal.pcs += currentObject.Pcs;
          totals.finalMetalsTotal.rate += currentObject.Rate;
          return accumulator;
        }, metalsTotal);
      }
      if (colorStones.length > 0) {
        colorStones.reduce((accumulator, currentObject) => {
          accumulator.amount += currentObject.Amount;
          accumulator.weight += currentObject.Wt;
          accumulator.pcs += currentObject.Pcs;
          accumulator.rate += currentObject.Rate;
          totals.finalColorStonesTotal.amount += currentObject.Amount;
          totals.finalColorStonesTotal.weight += currentObject.Wt;
          totals.finalColorStonesTotal.pcs += currentObject.Pcs;
          totals.finalColorStonesTotal.rate += currentObject.Rate;
          return accumulator;
        }, colorStonesTotal);
      }
      if (mics.length > 0) {
        mics.reduce((accumulator, currentObject) => {
          accumulator.amount += currentObject.Amount;
          accumulator.weight += currentObject.Wt;
          accumulator.pcs += currentObject.Pcs;
          accumulator.rate += currentObject.Rate;
          totals.finalmiscsTotal.amount += currentObject.Amount;
          totals.finalmiscsTotal.weight += currentObject.Wt;
          totals.finalmiscsTotal.pcs += currentObject.Pcs;
          totals.finalmiscsTotal.rate += currentObject.Rate;
          return accumulator;
        }, miscsTotal);
      }
      obj.WtSpecial = WtSpecial;
      obj.metalNetWt = metalNetWt;
      obj.otherAmountDetails = otherAmountDetails;
      obj.mics = mics;
      obj.diamonds = diamonds;
      obj.totalSetttingAmount = totalSetttingAmount;
      obj.metals = metals;
      obj.finding = finding;
      obj.miscsList = miscsList;
      obj.anotherFinding = anotherFinding;
      obj.primaryMetalAmount = primaryMetalAmount;
      totals.finalMetalsTotal.amount += primaryMetalAmount;
      obj.colorStones = colorStones;
      obj.diamondTotal = diamondTotal;
      obj.metalsTotal = metalsTotal;
      obj.colorStonesTotal = colorStonesTotal;
      obj.miscsTotal = miscsTotal;
      obj.settingAmount = settingAmount;
      obj.settingRate = settingRate;
      obj.findingTotal = findingTotal;
      totals.totalamount += e?.TotalAmount;
      totals.grosswt += e?.grosswt;
      totals.gdWt += e?.MetalDiaWt;
      totals.NetWt += e?.NetWt;
      totals.makingAmount += e?.MakingAmount;
      if (obj.metals[0]) {
        obj.metals[0].Wt = obj.metals[0]?.Wt - findingTotal;
        metalsTotal.Wt -= findingTotal;
        totals.finalMetalsTotal.Wt -= findingTotal;
      }
      // totals.finalMetalsTotal.weight += metalsTotal.Wt;
      resultArr.push(obj);
    });

    setOtherCharges(othAmt);
    setMiscTotal(miscstotals);
    setColorStoneTotal(colorStoness);
    setDiamondTotal(diamondTotals);
    setColorStoneMiscTotal(colorStoneTotals);
    setDiamondDetailss(diamondDetails);
    totals.cgstAmount =
      (data?.BillPrint_Json[0]?.CGST * totals.totalamount) / 100;
    totals.sgstAmount =
      (data?.BillPrint_Json[0]?.SGST * totals.totalamount) / 100;
    // totals.finalAmount = totals.totalamount + totals.cgstAmount + totals.sgstAmount + data?.BillPrint_Json[0]?.AddLess;
    totals.summaryTotalAmount = (
      totals.goldAmount +
      totals.diamondAmount +
      totals.colorStoneAmount +
      totals.miscAmount +
      totals.makingAmount +
      totals.otherAmount +
      data?.BillPrint_Json[0].AddLess
    ).toFixed(3);

    // taxes
    let taxValue = taxGenrator(data?.BillPrint_Json[0], totals?.totalamount);
    setTaxes(taxValue);
    taxValue.forEach((e, i) => {
      totals.finalAmount += +e?.amount;
    });
    totals.finalAmount +=
      totals.totalamount +
      data?.BillPrint_Json[0]?.AddLess -
      data?.BillPrint_Json[0]?.Privilege_discount;
    totals.finalAmount = totals.finalAmount?.toFixed(2);
    // taxes end

    totals.gold24Kt = totals.gold24Kt.toFixed(3);
    totals.NetWt = (totals.NetWt / 5).toFixed(3);
    totals.diaWt = (totals.diaWt / 5).toFixed(3);
    totals.stoneWt = (totals.stoneWt / 5).toFixed(3);
    totals.miscWt = (totals.miscWt / 5).toFixed(3);
    totals.goldAmount = totals.goldAmount.toFixed(3);
    totals.colorStoneAmount = totals.colorStoneAmount.toFixed(3);
    totals.diamondAmount = totals.diamondAmount.toFixed(3);
    totals.miscAmount = totals.miscAmount.toFixed(3);
    totals.makingAmount = totals.makingAmount.toFixed(3);
    totals.otherAmount = totals.otherAmount.toFixed(3);
    diamondDetailList.forEach((e, i) => {
      if (i >= 7) {
        diamondDetailList2[diamondDetailList2.length - 1].pcs += +e.pcs;
        diamondDetailList2[diamondDetailList2.length - 1].wt += +e.wt;
      } else {
        diamondDetailList2.unshift({
          shapeQualityColor: e.shapeQualityColor,
          pcs: +e.pcs,
          wt: +e.wt,
        });
      }
    });

    console.log('totalstotals', totals);


    setDiamondDetail(diamondDetailList2);
    setTotal(totals);
    setJson2Data(resultArr);
    let brokarage = ReceiveInBank(data?.BillPrint_Json[0]?.Brokerage);
    setBrokarage(brokarage);
    let finalArr = [];

    resultArr.forEach((e, i) => {
      if (e?.GroupJob === "") {
        finalArr.push(e);
      } else {
        let findRecord = finalArr.findIndex(
          (ele, ind) => ele?.GroupJob === e?.GroupJob
        );
        if (findRecord === -1) {
          finalArr.push(e);
        } else {
          let obj = { ...e };
          if (
            finalArr[findRecord]?.GroupJob !== finalArr[findRecord]?.SrJobno
          ) {
            finalArr[findRecord].SrJobno = finalArr[findRecord]?.GroupJob;
            if (obj?.GroupJob === obj?.SrJobno) {
              finalArr[findRecord].Categoryname = obj?.Categoryname;
              finalArr[findRecord].Collectionname = obj?.Collectionname;
              finalArr[findRecord].designno = obj?.designno;
              finalArr[findRecord].DesignImage = obj?.DesignImage;
              finalArr[findRecord].PO = obj?.PO;
              finalArr[findRecord].Tunch = obj?.Tunch;
              finalArr[findRecord].Size = obj?.Size;
            }
          }
          finalArr[findRecord].primaryMetalAmount += obj?.primaryMetalAmount;
          finalArr[findRecord].otherChargesTotal += obj?.otherChargesTotal;
          finalArr[findRecord].WtSpecial += obj?.WtSpecial;
          finalArr[findRecord].totalSetttingAmount += obj?.totalSetttingAmount;
          finalArr[findRecord].metalNetWt += obj?.metalNetWt;
          finalArr[findRecord].NetWt += obj?.NetWt;
          finalArr[findRecord].LossWt += obj?.LossWt;

          // for diamonds
          let blankDiamondArr = [];
          let diamonds = [
            ...finalArr[findRecord]?.diamonds,
            ...obj?.diamonds,
          ].flat();
          diamonds.forEach((elem, ind) => {
            let obj = cloneDeep(elem);

            let findDiamonds = blankDiamondArr.findIndex(
              (elee, indd) =>
                elee?.ShapeName === obj?.ShapeName &&
                elee?.Colorname === obj?.Colorname &&
                elee?.QualityName === obj?.QualityName &&
                elee?.Rate === obj?.Rate &&
                elee?.SizeName === obj?.SizeName
            );
            if (findDiamonds === -1) {
              blankDiamondArr.push(obj);
            } else {
              blankDiamondArr[findDiamonds].Wt += obj?.Wt;
              blankDiamondArr[findDiamonds].Pcs += obj?.Pcs;
              blankDiamondArr[findDiamonds].Amount += obj?.Amount;
              if (obj?.SettingAmount !== null) {
                if (blankDiamondArr[findDiamonds].SettingAmount === null) {
                  blankDiamondArr[findDiamonds].SettingAmount =
                    obj?.SettingAmount;
                } else {
                  blankDiamondArr[findDiamonds].SettingAmount +=
                    obj?.SettingAmount;
                }
              }
            }
          });

          // for colorstones
          let blankColorStoneArr = [];
          let colorStones = [
            ...finalArr[findRecord]?.colorStones,
            ...obj?.colorStones,
          ].flat();
          colorStones.forEach((elem, ind) => {
            let obj = cloneDeep(elem);
            let findColorStones = blankColorStoneArr.findIndex(
              (elee, indd) =>
                elee?.ShapeName === obj?.ShapeName &&
                elee?.Colorname === obj?.Colorname &&
                elee?.QualityName === obj?.QualityName &&
                elee?.Rate === obj?.Rate &&
                elee?.SizeName === obj?.SizeName
            );
            if (findColorStones === -1) {
              blankColorStoneArr.push(obj);
            } else {
              blankColorStoneArr[findColorStones].Wt += obj?.Wt;
              blankColorStoneArr[findColorStones].Pcs += obj?.Pcs;
              blankColorStoneArr[findColorStones].Amount += obj?.Amount;
              if (elem?.SettingAmount !== null) {
                if (
                  blankColorStoneArr[findColorStones].SettingAmount === null
                ) {
                  blankColorStoneArr[findColorStones].SettingAmount =
                    obj?.SettingAmount;
                } else {
                  blankColorStoneArr[findColorStones].SettingAmount +=
                    obj?.SettingAmount;
                }
              }
            }
          });

          // for miscs
          let blankMiscsArr = [];
          let miscs = [...finalArr[findRecord]?.mics, ...obj?.mics].flat();
          miscs.forEach((elem, ind) => {
            let findMiscs = blankMiscsArr.findIndex(
              (elee, indd) =>
                elee?.ShapeName === elem?.ShapeName &&
                elee?.Colorname === elem?.Colorname &&
                elee?.QualityName === elem?.QualityName &&
                elee?.Rate === elem?.Rate &&
                elee?.MasterManagement_DiamondStoneTypeid ===
                elem?.MasterManagement_DiamondStoneTypeid &&
                elee?.SizeName === elem?.SizeName
            );
            if (findMiscs === -1) {
              blankMiscsArr.push(elem);
            } else {
              blankMiscsArr[findMiscs].Wt += elem?.Wt;
              blankMiscsArr[findMiscs].Pcs += elem?.Pcs;
              blankMiscsArr[findMiscs].Amount += elem?.Amount;
              if (elem?.SettingAmount !== null) {
                if (blankMiscsArr[findMiscs].SettingAmount === null) {
                  blankMiscsArr[findMiscs].SettingAmount = elem?.SettingAmount;
                } else {
                  blankMiscsArr[findMiscs].SettingAmount += elem?.SettingAmount;
                }
              }
            }
          });

          let blankmiscsList = [];
          let miscsLists = [
            ...finalArr[findRecord]?.miscsList,
            ...obj?.miscsList,
          ];
          miscsLists.forEach((ele, ind) => {
            let findListMisc = blankmiscsList.findIndex(
              (elem, index) => elem?.ShapeName === ele?.ShapeName
            );
            if (findListMisc === -1) {
              blankmiscsList.push(ele);
            } else {
              blankmiscsList[findListMisc].Wt += ele?.Wt;
              blankmiscsList[findListMisc].Pcs += ele?.Pcs;
              blankmiscsList[findListMisc].Amount += ele?.Amount;
            }
          });

          // for finding
          let blankFindingArr = [];
          let finding = [
            ...finalArr[findRecord]?.finding,
            ...obj?.finding,
          ].flat();
          finding.forEach((elem, ind) => {
            let findFinding = blankFindingArr.findIndex(
              (elee, indd) =>
                elee?.ShapeName === elem?.ShapeName &&
                elee?.Colorname === elem?.Colorname &&
                elee?.QualityName === elem?.QualityName &&
                elee?.Rate === elem?.Rate &&
                elee?.MasterManagement_DiamondStoneTypeid ===
                elem?.MasterManagement_DiamondStoneTypeid &&
                elee?.SizeName === elem?.SizeName
            );
            if (findFinding === -1) {
              blankFindingArr.push(elem);
            } else {
              blankFindingArr[findFinding].Wt += elem?.Wt;
              blankFindingArr[findFinding].Pcs += elem?.Pcs;
              blankFindingArr[findFinding].Amount += elem?.Amount;
              if (elem?.SettingAmount !== null) {
                if (blankFindingArr[findFinding].SettingAmount === null) {
                  blankFindingArr[findFinding].SettingAmount =
                    elem?.SettingAmount;
                } else {
                  blankFindingArr[findFinding].SettingAmount +=
                    elem?.SettingAmount;
                }
              }
            }
          });

          let blankFindingAnotherArray = [];
          let anotherFindings = [
            ...finalArr[findRecord]?.anotherFinding,
            ...obj?.anotherFinding,
          ].flat();
          anotherFindings.forEach((elem, ind) => {
            let findFinding = blankFindingAnotherArray.findIndex(
              (elee, indd) =>
                elee?.ShapeName === elem?.ShapeName &&
                elee?.Colorname === elem?.Colorname &&
                elee?.QualityName === elem?.QualityName &&
                elee?.Rate === elem?.Rate &&
                elee?.MasterManagement_DiamondStoneTypeid ===
                elem?.MasterManagement_DiamondStoneTypeid &&
                elee?.SizeName === elem?.SizeName
            );
            if (findFinding === -1) {
              blankFindingAnotherArray.push(elem);
            } else {
              blankFindingAnotherArray[findFinding].Wt += elem?.Wt;
              blankFindingAnotherArray[findFinding].Pcs += elem?.Pcs;
              blankFindingAnotherArray[findFinding].Amount += elem?.Amount;
              if (elem?.SettingAmount !== null) {
                if (
                  blankFindingAnotherArray[findFinding].SettingAmount === null
                ) {
                  blankFindingAnotherArray[findFinding].SettingAmount =
                    elem?.SettingAmount;
                } else {
                  blankFindingAnotherArray[findFinding].SettingAmount +=
                    elem?.SettingAmount;
                }
              }
            }
          });

          // for metals
          if (obj.SrJobno === obj.GroupJob) {
            let objmetals = [];
            obj.metals.forEach((elee, i) => {
              let findMetal = objmetals.findIndex(
                (element, index) => element.ShapeName === elee.ShapeName
              );
              if (findMetal === -1) {
                objmetals.push(elee);
              } else {
                if (
                  objmetals[findMetal].IsPrimaryMetal !== 1 &&
                  elee.IsPrimaryMetal === 1
                ) {
                  objmetals[findMetal].QualityName = elee.QualityName;
                }
                objmetals[findMetal].Wt += elee?.Wt;
                objmetals[findMetal].Pcs += elee?.Pcs;
                objmetals[findMetal].Amount += elee?.Amount;
                objmetals[findMetal].Weight += elee?.Weight;
              }
            });

            let metals = [...finalArr[findRecord]?.metals].flat();
            metals.forEach((ell, inn) => {
              let newMetal = true;
              objmetals.forEach((elel, indd) => {
                if (elel.ShapeName === ell.ShapeName) {
                  elel.Wt += ell?.Wt;
                  elel.Pcs += ell?.Pcs;
                  elel.Amount += ell?.Amount;
                  elel.Weight += ell?.Weight;
                  newMetal = false;
                }
              });
              if (newMetal) {
                objmetals.push(ell);
              }
            });
            objmetals.sort((a, b) => {
              let namea = a?.IsPrimaryMetal;
              if (namea !== 0) {
                return -1;
              } else if (namea === 0) {
                return 1;
              } else {
                return 0;
              }
            });
            finalArr[findRecord].metals = objmetals;
          } else if (
            finalArr[findRecord]?.SrJobno === finalArr[findRecord]?.GroupJob
          ) {
            let objmetals = [];
            finalArr[findRecord].metals.forEach((elee, i) => {
              let findMetal = objmetals.findIndex(
                (element, index) => element.ShapeName === elee.ShapeName
              );
              if (findMetal === -1) {
                objmetals.push(elee);
              } else {
                if (
                  objmetals[findMetal].IsPrimaryMetal !== 1 &&
                  elee.IsPrimaryMetal === 1
                ) {
                  objmetals[findMetal].QualityName = elee.QualityName;
                }
                objmetals[findMetal].Wt += elee?.Wt;
                objmetals[findMetal].Pcs += elee?.Pcs;
                objmetals[findMetal].Amount += elee?.Amount;
                objmetals[findMetal].Weight += elee?.Weight;
              }
            });

            let metals = [...obj?.metals].flat();
            metals.forEach((ell, inn) => {
              let newMetal = true;
              objmetals.forEach((elel, indd) => {
                if (elel.ShapeName === ell.ShapeName) {
                  elel.Wt += ell?.Wt;
                  elel.Pcs += ell?.Pcs;
                  elel.Amount += ell?.Amount;
                  elel.Weight += ell?.Weight;
                  newMetal = false;
                }
              });
              if (newMetal) {
                objmetals.push(ell);
              }
            });
            objmetals.sort((a, b) => {
              let namea = a?.IsPrimaryMetal;
              // let nameb = b?.IsPrimaryMetal;
              if (namea !== 0) {
                return -1;
              } else if (namea === 0) {
                return 1;
              } else {
                return 0;
              }
            });
            finalArr[findRecord].metals = objmetals;
          }

          // other changes
          let otherAmountDetails = [
            finalArr[findRecord].otherAmountDetails,
            obj.otherAmountDetails,
          ].flat();
          let blankOtherAmtDetails = [];

          otherAmountDetails.forEach((elee, indd) => {
            let findOther = blankOtherAmtDetails.findIndex(
              (elem, index) => elem?.label === elee?.label
            );
            if (findOther === -1) {
              blankOtherAmtDetails.push(elee);
            } else {
              blankOtherAmtDetails[findOther].value =
                +blankOtherAmtDetails[findOther].value + +elee.value;
            }
          });
          finalArr[findRecord].diamonds = blankDiamondArr;
          finalArr[findRecord].colorStones = blankColorStoneArr;
          finalArr[findRecord].mics = blankMiscsArr;
          finalArr[findRecord].miscsList = blankmiscsList;
          finalArr[findRecord].finding = blankFindingArr;
          finalArr[findRecord].anotherFinding = blankFindingAnotherArray;

          // finalArr[findRecord].metals = blankMetalsArr;
          finalArr[findRecord].otherAmountDetails = blankOtherAmtDetails;
          finalArr[findRecord].MakingAmount += obj?.MakingAmount;
          finalArr[findRecord].MaKingCharge_Unit += obj?.MaKingCharge_Unit;
          finalArr[findRecord].TotalAmount += obj?.TotalAmount;

          finalArr[findRecord].metalsTotal.amount += obj?.metalsTotal.amount;
          finalArr[findRecord].metalsTotal.pcs += obj?.metalsTotal.pcs;
          finalArr[findRecord].metalsTotal.weight += obj?.metalsTotal.weight;
          finalArr[findRecord].metalsTotal.Wt += obj?.metalsTotal.Wt;

          finalArr[findRecord].diamondTotal.amount += obj?.diamondTotal.amount;
          finalArr[findRecord].diamondTotal.pcs += obj?.diamondTotal.pcs;
          finalArr[findRecord].diamondTotal.weight += obj?.diamondTotal.weight;

          finalArr[findRecord].colorStonesTotal.amount +=
            obj?.colorStonesTotal.amount;
          finalArr[findRecord].colorStonesTotal.pcs +=
            obj?.colorStonesTotal.pcs;
          finalArr[findRecord].colorStonesTotal.weight +=
            obj?.colorStonesTotal.weight;

          finalArr[findRecord].miscsTotal.amount += obj?.miscsTotal.amount;
          finalArr[findRecord].miscsTotal.pcs += obj?.miscsTotal.pcs;
          finalArr[findRecord].miscsTotal.weight += obj?.miscsTotal.weight;
          if (finalArr[findRecord].metals[0]) {
            finalArr[findRecord].metals[0].Wt =
              finalArr[findRecord].metals[0].Wt -
              (finalArr[findRecord].findingTotal + obj?.findingTotal);
          }
          // finalArr[findRecord].metals[0].Wt = finalArr[findRecord].findingTotal +obj?.findingTotal ;
          finalArr[findRecord].findingTotal += obj?.findingTotal;
          // diamondTotal
        }
      }
    });

    let finalArr2 = [];
    finalArr.forEach((e, i) => {
      let labourArr = [];
      let labouurTotal = 0;
      labourArr.push({ label: e?.MaKingCharge_Unit, value: e?.MakingAmount });
      e?.anotherFinding?.forEach((ele, ind) => {
        if (ele?.SettingRate === e?.MaKingCharge_Unit) {
          let findobj = labourArr?.findIndex(
            (elem, index) => elem?.label === e?.MaKingCharge_Unit
          );
          if (findobj === -1) {
            labourArr.push({
              label: e?.MaKingCharge_Unit,
              value: e?.MakingAmount + ele?.SettingAmount,
            });
            labouurTotal += e?.MakingAmount + ele?.SettingAmount;
          } else {
            if (ele?.SettingAmount !== null && ele?.SettingAmount !== 0) {
              labourArr[findobj].value += ele?.SettingAmount;
              labouurTotal += ele?.SettingAmount;
            }
          }
        } else {
          if (ele?.SettingAmount !== null && ele?.SettingAmount !== 0) {
            labourArr.push({
              label: ele?.SettingRate,
              value: ele?.SettingAmount,
            });
            labouurTotal += ele?.SettingAmount;
          }
        }
      });
      if (labourArr.length === 0) {
        labourArr.push({ label: e?.MaKingCharge_Unit, value: e?.MakingAmount });
      }
      let diaCs = [...e?.diamonds, ...e?.colorStones]?.flat();
      let diacsAmount = diaCs?.reduce((accc, cobj) => {
        if (cobj?.SettingAmount !== null) {
          return accc + cobj?.SettingAmount;
        } else {
          return accc;
        }
      }, 0);
      if (diacsAmount !== 0) {
        labourArr.push({ label: "Setting", value: diacsAmount });
        labouurTotal += diacsAmount;
      }
      let obj = cloneDeep(e);
      obj.labourArr = labourArr;
      obj.labouurTotal = labouurTotal;
      finalArr2.push(obj);
    });

    finalArr2.sort((a, b) => {
      const nameA = a.SrJobno.toUpperCase();
      const nameB = b.SrJobno.toUpperCase();

      if (nameA < nameB) {
        return -1;
      }

      if (nameA > nameB) {
        return 1;
      }

      return 0;
    });

    finalArr2?.forEach((e) => {
      let finalArr3 = [];

      e?.diamonds?.forEach((el) => {
        let eem = cloneDeep(el);
        let findrec = finalArr3?.findIndex(
          (a) =>
            a?.Rate === eem?.Rate &&
            a?.ShapeName === eem?.ShapeName &&
            a?.SizeName === eem?.SizeName &&
            a?.QualityName === eem?.QualityName &&
            a?.Colorname === eem?.Colorname
        );
        if (findrec === -1) {
          // let obj = {...eem};
          // obj.wt = eem?.Wt;
          // obj.pcs = eem?.Pcs;
          // obj.amount = eem?.Amount;
          finalArr3.push(eem);
        } else {
          finalArr3[findrec].Wt += eem?.Wt;
          finalArr3[findrec].Pcs += eem?.Pcs;
          finalArr3[findrec].Amount += eem?.Amount;
          finalArr3[findrec].SizeName = eem?.SizeName;
          finalArr3[findrec].Amount += eem?.Amount;
        }
      });

      e.diamonds = finalArr3;

      let clr = [];

      e?.colorStones?.forEach((el) => {
        let eem = cloneDeep(el);
        let findrec = clr?.findIndex(
          (a) =>
            a?.Rate === eem?.Rate &&
            a?.ShapeName === eem?.ShapeName &&
            a?.SizeName === eem?.SizeName &&
            a?.QualityName === eem?.QualityName &&
            a?.Colorname === eem?.Colorname
        );
        if (findrec === -1) {
          // let obj = {...eem};
          // obj.wt = eem?.Wt;
          // obj.pcs = eem?.Pcs;
          // obj.amount = eem?.Amount;
          clr.push(eem);
        } else {
          clr[findrec].Wt += eem?.Wt;
          clr[findrec].Pcs += eem?.Pcs;
          clr[findrec].Amount += eem?.Amount;
          clr[findrec].SizeName = eem?.SizeName;
        }
      });

      e.colorStones = clr;

      let miscs = [];

      e?.mics?.forEach((el) => {
        let eem = cloneDeep(el);
        let findrec = miscs?.findIndex(
          (a) =>
            a?.Rate === eem?.Rate &&
            a?.ShapeName === eem?.ShapeName &&
            a?.SizeName === eem?.SizeName &&
            a?.QualityName === eem?.QualityName &&
            a?.Colorname === eem?.Colorname
        );
        if (findrec === -1) {
          // let obj = {...eem};
          // obj.wt = eem?.Wt;
          // obj.pcs = eem?.Pcs;
          // obj.amount = eem?.Amount;
          miscs.push(eem);
        } else {
          miscs[findrec].Wt += eem?.Wt;
          miscs[findrec].Pcs += eem?.Pcs;
          miscs[findrec].Amount += eem?.Amount;
          miscs[findrec].SizeName = eem?.SizeName;
        }
      });

      e.mics = miscs;
    });

    setJson2Data(finalArr2);
  };

  const loadData = (data) => {
    setJson1Data(data?.BillPrint_Json[0]);
    caiculateMaterial(data);
  };

  useEffect(() => {
    const sendData = async () => {
      try {
        const data = await apiCall(
          token,
          invoiceNo,
          printName,
          urls,
          evn,
          ApiVer
        );
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
  }, []);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  function formatDateTime() {
    const now = new Date();
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    return now.toLocaleString('en-GB', options).replace(',', '');
  }

  console.log('json2Datajson2Data' , json2Data);
  
  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <div className="container containerEstimate pad_60_allPrint">
          {/* print button */}
          <div className="d-flex justify-content-end align-items-center print_sec_sum4 pb-4 mt-5 w-100">
            <div className="form-check ps-3">
              <input
                type="button"
                className="btn_white blue mt-0"
                value="Print"
                onClick={(e) => handlePrint(e)}
              />
            </div>
          </div>
          {/* print name */}
          <div
            className={`border p-1 mt-1 border-2 min_height_label lightGrey border_color_estimate`}
          >
            <p className="text-uppercase fw-bold estimatePrintFont_14">
              {json1Data?.PrintHeadLabel === ""
                ? "ORDER REQUEST"
                : json1Data?.PrintHeadLabel}
            </p>
          </div>
          {/* customer detail */}
          <div className="py-2 d-flex justify-content-between px-1">
            <div>
              <p className="estimatePrintFont_14">To,</p>
              <p className="fw-bold estimatePrintFont_14">
                {json1Data?.Customercode}
              </p>
            </div>
            <div>
              <div className="d-flex justify-conetnt-between">
                <p className="mainDetailEstimate text-end pe-3">Order# : </p>
                <p className="fw-bold">{json1Data?.InvoiceNo}</p>
              </div>
              <div className="d-flex justify-conetnt-between">
                <p className="mainDetailEstimate text-end pe-3">Date : </p>
                <p className="fw-bold">{json1Data?.EntryDate}</p>
              </div>
            </div>
          </div>
          {console.log(json1Data)}
          <div className="my-2 w-100">
            {/* heading */}
            <div className="border-start border-top border-end d-flex border-bottom recordEstimatePrint overflow-hidden border-black lightGrey">
              <div className="srNoEstimatePrint border-end px-1 d-flex align-items-center justify-content-center border_color_estimates">
                <p className="fw-bold">Sr</p>
              </div>
              <div className="designEstimatePrint border-end px-1 d-flex align-items-center justify-content-center border_color_estimates">
                <p className="fw-bold">Design</p>
              </div>
              <div className="diamondEstimatePrint border-end border_color_estimates">
                <div className="p-1 text-center border-bottom border_color_estimates">
                  <p className="fw-bold">Diamond</p>
                </div>
                <div className="d-flex h-100">
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Code</p>
                  </div>
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Size</p>
                  </div>
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Pcs</p>
                  </div>
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Wt</p>
                  </div>
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Rate</p>
                  </div>
                  <div className="width20EstimatePrint px-1">
                    <p className="text-center fw-bold">Amount</p>
                  </div>
                </div>
              </div>
              <div className="metalEstimatePrint border-end border_color_estimates">
                <div className="p-1 text-center border-bottom border_color_estimates">
                  <p className="fw-bold">Metal</p>
                </div>
                <div className="d-flex h-100">
                  <div className="width_40_estimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Quality</p>
                  </div>
                  <div className="width_40_estimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">*Wt</p>
                  </div>
                  <div className="width_40_estimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Net Wt</p>
                  </div>
                  <div className="width_40_estimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Rate</p>
                  </div>
                  <div className="width_40_estimatePrint px-1">
                    <p className="text-center fw-bold">Amount</p>
                  </div>
                </div>
              </div>
              <div className="stoneEstimatePrint border-end border_color_estimates">
                <div className="p-1 text-center border-bottom border_color_estimates">
                  <p className="fw-bold">Stone</p>
                </div>
                <div className="d-flex h-100">
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Code</p>
                  </div>
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Size</p>
                  </div>
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Pcs</p>
                  </div>
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Wt</p>
                  </div>
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Rate</p>
                  </div>
                  <div className="width20EstimatePrint px-1">
                    <p className="text-center fw-bold">Amount</p>
                  </div>
                </div>
              </div>
              <div className="OtherAmountEstimatePrint border-end border_color_estimates px-1 d-flex align-items-center justify-content-center flex-wrap">
                <p className="text-center fw-bold">Other &nbsp;</p>
                <p className="text-center fw-bold">Amount </p>
              </div>
              <div className="labourEstimatePrint border-end border_color_estimates">
                <div className="px-1 text-center border-bottom border_color_estimates">
                  <p className="fw-bold">Labour</p>
                </div>
                <div className="d-flex h-100">
                  <div className="col px-1 border-end border_color_estimates text-center">
                    <p className="fw-bold">Rate</p>
                  </div>
                  <div className="col px-1 text-center">
                    <p className="fw-bold">Amount</p>
                  </div>
                </div>
              </div>
              <div className="totalAmountEstimatePrint p-1 d-flex align-items-center justify-content-center flex-wrap">
                <p className="text-center fw-bold">Total &nbsp;</p>
                <p className="text-center fw-bold">Amount </p>
              </div>
            </div>
            {/* data */}
            {/* <div className="border-end border-start border-black"> */}
            <div>
              {json2Data.length > 0 &&
                json2Data.map((e, i) => {
                  return (
                    <div
                      className={`d-flex border-bottom recordEstimatePrint overflow-hidden word_break_estimatePrint`}
                      key={i}
                      style={{
                        borderLeft: "1px solid black",
                        borderRight: "1px solid black",
                      }}
                    >
                      <div className="srNoEstimatePrint border-end p_1Estimate border_color_estimates">
                        <p className="text-center">{i + 1}</p>
                      </div>
                      <div className="designEstimatePrint border-end  border_color_estimates d-flex justify-content-between flex-column">
                        <div className="d-flex justify-content-between p_1Estimate">
                          <div>{e?.designno}</div>
                          <div className="text-end">
                            <p>{e?.J_JobNo}</p>
                          </div>
                        </div>
                        <div className="pb-2 p_1Estimate">
                          {image && (
                            <>
                              {/* {imageLoading && <Loader2 />} */}
                              {
                                <img
                                  src={e?.DesignImage}
                                  alt=""
                                  className="estimate_img mx-auto d-block text-center"
                                  onError={handleImageError}
                                  onLoad={handleImageLoad}
                                  style={{
                                    display: imageLoading ? "none" : "block",
                                  }}
                                />
                              }
                            </>
                          )}
                        </div>
                        <div className="totalBgEstimatePrint  border-top border_color_estimates">
                          <p
                            className="w-100 fw-bold"
                            style={{ padding: "1px 0px 1px 5px" }}
                          >
                            {e?.MetalColor}
                          </p>
                          {e?.Size !== "" && (
                            <p className="w-100 ps-1 fw-bold">
                              Size : {e?.Size}
                            </p>
                          )}
                          {e?.PromiseDate !== "" && e?.PromiseDate !== null && (
                            <p className="w-100 ps-1 fw-bold">
                              PR Date : {e?.PromiseDate}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="diamondEstimatePrint border-end position-relative border_color_estimates">
                        {/* <div className='h-100 d-grid pad_bot_29_estimatePrint'> */}
                        <div className="pad_bot_29_estimatePrint">
                          {e?.diamonds.length > 0 &&
                            e?.diamonds.map((ele, ind) => {
                              return (
                                <div className="d-flex " key={ind}>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="">
                                      {ele?.ShapeName} {ele?.QualityName}{" "}
                                      {ele?.Colorname}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="">{ele?.SizeName}</p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {NumberWithCommas(ele?.Pcs, 0)}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {fixedValues(ele?.Wt, 3)}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {NumberWithCommas(ele?.Rate, 2)}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="fw-bold text-end">
                                      {NumberWithCommas(ele?.Amount, 2)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                        <div
                          className={`d-flex totalBgEstimatePrint position-absolute bottom-0 height_28_5_estimatePrint w-100 border-top border_color_estimates ${e?.diamonds.length === 0 &&
                            "border-top height_28_5_estimatePrint border_color_estimates"
                            }`}
                        >
                          <div className="width20EstimatePrint p_1Estimate">
                            <p className="fw-bold"></p>
                          </div>
                          <div className="width20EstimatePrint p_1Estimate">
                            <p className="fw-bold"></p>
                          </div>
                          <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
                            <p className="text-end fw-bold">
                              {e?.diamonds.length !== 0 && (
                                <>{NumberWithCommas(e?.diamondTotal?.pcs, 0)}</>
                              )}
                            </p>
                          </div>
                          <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
                            <p className="text-end fw-bold">
                              {e?.diamonds.length !== 0 && (
                                <>{fixedValues(e?.diamondTotal?.weight, 3)}</>
                              )}
                            </p>
                          </div>
                          <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
                            <p className="text-end fw-bold"></p>
                          </div>
                          <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
                            <p className="text-end fw-bold">
                              {e?.diamonds.length !== 0 && (
                                <>
                                  {NumberWithCommas(e?.diamondTotal?.amount, 2)}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="metalEstimatePrint border-end position-relative border_color_estimates">
                        {/* <div className='h-100 d-grid pad_bot_29_estimatePrint'> */}
                        <div className="pad_bot_29_estimatePrint">
                          {e?.metals.length > 0 &&
                            e?.metals.map((ele, ind) => {
                              return (
                                <div className="d-flex" key={ind}>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="">
                                      {ele?.ShapeName} {ele?.QualityName}
                                    </p>
                                  </div>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="text-end ">
                                      {ind === 0
                                        ? fixedValues(e?.WtSpecial, 3)
                                        : fixedValues(ele?.Weight, 3)}
                                    </p>
                                  </div>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="text-end ">
                                      {ind === 0
                                        ? fixedValues(e?.metalNetWt, 3)
                                        : fixedValues(ele?.Wt, 3)}
                                    </p>
                                  </div>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="text-end ">
                                      {NumberWithCommas(ele?.Rate, 2)}
                                    </p>
                                  </div>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="text-end ">
                                      {NumberWithCommas(ele?.Amount, 2)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          {e?.finding.length > 0 &&
                            e?.finding.map((ele, ind) => {
                              return (
                                <div className="d-flex" key={ind}>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="">
                                      {ele?.FindingAccessories}
                                    </p>
                                  </div>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="text-end ">
                                      {fixedValues(ele?.Wt, 3)}
                                    </p>
                                  </div>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="text-end ">
                                      {fixedValues(ele?.Wt, 3)}
                                    </p>
                                  </div>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="text-end ">
                                      {NumberWithCommas(ele?.Rate, 2)}
                                    </p>
                                  </div>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="text-end ">
                                      {NumberWithCommas(ele?.Amount, 2)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          {e?.JobRemark !== "" && (
                            <div className="pt-2 px-1">
                              <p>Remark:</p>
                              <p className="fw-bold"> {e?.JobRemark}</p>
                            </div>
                          )}
                        </div>
                        <div
                          className={`d-flex totalBgEstimatePrint position-absolute bottom-0 height_28_5_estimatePrint w-100 border-top border_color_estimates ${e?.metals.length === 0 &&
                            "border-top height_28_5_estimatePrint"
                            }`}
                        >
                          <div className="width200EstimatePrint p_1Estimate">
                            <p></p>
                          </div>
                          {/* <div className='width200EstimatePrint p_1Estimate d-flex align-items-center justify-content-end'><p className='text-end fw-bold'>{fixedValues(e?.metalsTotal?.weightWithDiamondLoss, 3)}</p></div> */}
                          <div className="width200EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
                            <p className="text-end fw-bold">
                              {fixedValues(e?.metalsTotal?.weight, 3)}
                            </p>
                          </div>
                          {/* <div className='width200EstimatePrint p_1Estimate d-flex align-items-center justify-content-end'><p className='text-end fw-bold'>{fixedValues(e?.metalsTotal?.Wt, 3)}</p></div> */}
                          <div className="width200EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
                            <p className="text-end fw-bold">
                              {fixedValues(e?.NetWt + e?.LossWt, 3)}
                            </p>
                          </div>
                          {/* <div className="width200EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
                              <p className="text-end fw-bold"></p>
                            </div> */}
                          <div
                            className="width200EstimatePrint p_1Estimate d-flex align-items-center justify-content-end"
                            style={{ minWidth: "40%", width: "40%" }}
                          >
                            <p className="text-end fw-bold">
                              {NumberWithCommas(e?.primaryMetalAmount, 2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="stoneEstimatePrint border-end position-relative border_color_estimates">
                        {/* <div className='h-100 d-grid pad_bot_29_estimatePrint'> */}
                        <div className="pad_bot_29_estimatePrint">
                          {e?.colorStones.length > 0 &&
                            e?.colorStones.map((ele, ind) => {
                              return (
                                <div className="d-flex " key={ind}>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p>
                                      {ele?.ShapeName} {ele?.QualityName}{" "}
                                      {ele?.Colorname}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="">{ele?.SizeName}</p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {ele?.Pcs > 0 &&
                                        NumberWithCommas(ele?.Pcs, 0)}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {ele?.Wt > 0 && fixedValues(ele?.Wt, 3)}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {NumberWithCommas(ele?.Rate, 2)}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="fw-bold text-end">
                                      {NumberWithCommas(ele?.Amount, 2)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          {e?.mics.length > 0 &&
                            e?.mics.map((ele, ind) => {
                              return (
                                <div className="d-flex" key={ind}>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p>
                                      M: {ele?.ShapeName} {ele?.QualityName}{" "}
                                      {/* {ele?.Colorname} */}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="">{ele?.SizeName}</p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {ele?.Pcs > 0 &&
                                        NumberWithCommas(ele?.Pcs, 0)}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {ele?.Wt > 0 && fixedValues(ele?.Wt, 3)}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {NumberWithCommas(ele?.Rate, 2)}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="fw-bold text-end">
                                      {NumberWithCommas(ele?.Amount, 2)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                        <div
                          className={`d-flex totalBgEstimatePrint position-absolute bottom-0 height_28_5_estimatePrint w-100 border-top height_28_5_estimatePrint border_color_estimates `}
                        >
                          <div className="width20EstimatePrint p_1Estimate">
                            <p></p>
                          </div>
                          <div className="width20EstimatePrint p_1Estimate">
                            <p></p>
                          </div>
                          <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
                            <p className="text-end fw-bold">
                              {(e?.colorStones?.length > 0 ||
                                e?.mics.length > 0) && (
                                  <>
                                    {NumberWithCommas(
                                      e?.colorStonesTotal?.pcs +
                                      e?.miscsTotal?.pcs,
                                      0
                                    )}
                                  </>
                                )}
                            </p>
                          </div>
                          <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
                            <p className="text-end fw-bold">
                              {(e?.colorStones.length > 0 ||
                                e?.mics.length > 0) && (
                                  <>
                                    {fixedValues(
                                      e?.colorStonesTotal?.weight +
                                      e?.miscsTotal?.weight,
                                      3
                                    )}
                                  </>
                                )}
                            </p>
                          </div>
                          <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
                            <p className="text-end fw-bold"></p>
                          </div>
                          <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
                            <p className="text-end fw-bold">
                              {e?.colorStones?.length + e?.mics?.length > 0 && (
                                <>
                                  {NumberWithCommas(
                                    e?.colorStonesTotal?.amount +
                                    e?.miscsTotal?.amount,
                                    2
                                  )}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="OtherAmountEstimatePrint border-end position-relative border_color_estimates">
                        <div className="h-100 d-grid pad_bot_29_estimatePrint">
                          <div className="p_1Estimate border_color_estimates ">
                            {/* <p className='text-center'>Certification Charge 5,227.00 </p> */}
                            {/* {e?.otherAmountDetails.length > 0 &&
                                e?.otherAmountDetails.map((ele, ind) => {
                                  return ( +ele?.value !== 0 && <div className="d-flex word_break_estimate "
                                      key={ind}
                                    >
                                      <p className="p_1Estimate w-100 word_break" key={ind}>
                                        {ele?.label}{" "}
                                        <span className="float-end">
                                          {ele?.value}
                                        </span>{" "}
                                      </p>
                                    </div>
                                )
                                })} */}
                            {/* {e?.miscsList?.map((ele, ind) => {
                                return (
                                  +ele?.Amount !== 0 && <div
                                    className="d-flex word_break_estimate "
                                    key={ind}
                                  >
                                    <p className="p_1Estimate w-100 word_break" key={ind}>
                                      {ele?.ShapeName}{" "}
                                      <span className="float-end">
                                        {NumberWithCommas(ele?.Amount, 2)}
                                      </span>{" "}
                                    </p>
                                  </div>
                                )
                              })} */}
                            {/* <p className='p_1Estimate'>Total Diamond Handling: {NumberWithCommas(e?.TotalDiamondHandling, 2)}</p> */}
                            {/* {e?.TotalDiamondHandling !== 0 && (
                                <p className="p_1Estimate word_break">
                                  Handling
                                  <span className="float-end">  {NumberWithCommas(e?.TotalDiamondHandling, 2)}</span>
                                </p>
                              )} */}
                            <div className="w-100 d-flex align-items-center justify-content-end">
                              {NumberWithCommas(e?.OtherCharges, 2)}
                            </div>
                          </div>
                        </div>
                        <div
                          className="totalBgEstimatePrint position-absolute bottom-0 height_28_5_estimatePrint w-100 d-flex align-items-center justify-content-end border-top border_color_estimates"
                          style={{ height: "14.5px" }}
                        >
                          <div className="text-end p_1Estimate">
                            <p className="fw-bold">
                              {/* {NumberWithCommas(e?.otherChargesTotal, 2)} */}
                              {NumberWithCommas(e?.OtherCharges, 2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="labourEstimatePrint border-end position-relative border_color_estimates">
                        <div className="h-100 d-grid pad_bot_29_estimatePrint">
                          <div className="d-flex  border_color_estimates">
                            {/* <div className='w-50 text-end p_1Estimate'><p>{NumberWithCommas(e?.MaKingCharge_Unit, 2)}</p><p>{NumberWithCommas(e?.settingRate, 2)}</p></div> */}
                            {e?.MakingAmount !== 0 && (
                              <>
                                {" "}
                                <div className="w-50 p_1Estimate">
                                  {/* <p>{NumberWithCommas(e?.MaKingCharge_Unit, 2)}</p> */}
                                  {/* <p>Labour</p>
                                    {e?.settingAmount !== 0 && <p>Labour</p>} */}
                                  {e?.labourArr?.map((ele, ind) => {
                                    return (
                                      <p key={ind}>
                                        {NumberWithCommas(+ele?.label, 2) !==
                                          "NaN"
                                          ? NumberWithCommas(+ele?.label, 2)
                                          : ele?.label}
                                      </p>
                                    );
                                  })}
                                </div>
                                <div className="w-50 text-end p_1Estimate">
                                  {/* <p>{NumberWithCommas(e?.MakingAmount, 2)}</p>
                                    {e?.settingAmount !== 0 && (
                                      <p>
                                        {NumberWithCommas(e?.settingAmount, 2)}
                                      </p>
                                    )} */}
                                  {e?.labourArr?.map((ele, ind) => {
                                    return (
                                      <p key={ind}>
                                        {NumberWithCommas(ele?.value, 2)}
                                      </p>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div
                          className="totalBgEstimatePrint position-absolute bottom-0 height_28_5_estimatePrint w-100 d-flex align-items-center justify-content-end border-top border_color_estimates"
                          style={{ height: "14.5px" }}
                        >
                          <div className="">
                            <p className="text-end p_1Estimate fw-bold">
                              {NumberWithCommas(e?.totalSetttingAmount, 2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="totalAmountEstimatePrint position-relative">
                        <div className="h-100 d-grid pad_bot_29_estimatePrint">
                          <div className="border_color_estimates">
                            <p className="text-end p_1Estimate pe-1 fw-bold">
                              {NumberWithCommas(e?.TotalAmount, 2)}
                            </p>
                          </div>
                        </div>
                        <div className="totalBgEstimatePrint position-absolute bottom-0  height_28_5_estimatePrint w-100 d-flex align-items-center justify-content-end pe-1 border-top border_color_estimates">
                          <div className="text-end p_1Estimate">
                            <p className="fw-bold">
                              {/* <span
                                  dangerouslySetInnerHTML={{
                                    __html: json1Data?.Currencysymbol,
                                  }}
                                ></span> */}
                              {NumberWithCommas(e?.TotalAmount, 2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            {/* cgst */}
            <div className="border-black border-end border-start">
              <div className="d-flex  recordEstimatePrint overflow-hidden border-bottom border_color_estimates">
                <div className="srNoEstimatePrint p_1Estimate"></div>
                <div className="designEstimatePrint p_1Estimate"></div>
                <div className="diamondEstimatePrint position-relative"></div>
                <div className="metalEstimatePrint position-relative"></div>
                <div className="stoneEstimatePrint position-relative"></div>
                <div className="OtherAmountEstimatePrint position-relative"></div>
                <div className="labourEstimatePrint border-end border-white">
                  {total?.discountAmt !== 0 && (
                    <div className="text-end">
                      <p>Total Discount</p>
                    </div>
                  )}
                  {total?.finalAmount !== 0 && (
                    <div className="text-end">
                      <p>Bill Amount</p>
                    </div>
                  )}
                  {total?.exchange !== 0 && (
                    <div className="text-end">
                      <p>Exchange Value</p>
                    </div>
                  )}
                  {total?.Cash !== 0 && (
                    <div className="text-end">
                      <p>Cash</p>
                    </div>
                  )}
                  {total?.Bank !== 0 && (
                    <div className="text-end">
                      <p>Bank</p>
                    </div>
                  )}
                  {total?.Advance !== 0 && (
                    <div className="text-end">
                      <p>Advance</p>
                    </div>
                  )}
                  {total?.AddLess !== 0 && (
                    <div className="text-end">
                      <p>Add</p>
                    </div>
                  )}
                  {total.previeligeCardDisocunt !== 0 && (
                    <div className="text-end">
                      <p>Privilege Card Discount </p>
                    </div>
                  )}
                  <div className="text-end">
                    {taxes.length > 0 &&
                      taxes.map((e, i) => {
                        return (
                          <p key={i}>
                            {e?.name} @ {e?.per}
                          </p>
                        );
                      })}
                    {json1Data?.AddLess !== 0 && (
                      <p>{json1Data?.AddLess < 0 ? "Less" : "Add"}</p>
                    )}
                  </div>
                </div>
                <div
                  className="totalAmountEstimatePrint"
                  style={{ paddingRight: "2px" }}
                >
                  {total?.discountAmt !== 0 && (
                    <div className="text-end">
                      <p>{NumberWithCommas(total?.discountAmt, 2)}</p>
                    </div>
                  )}
                  {total?.finalAmount !== 0 && (
                    <div className="text-end">
                      <p>{NumberWithCommas(total?.finalAmount, 2)}</p>
                    </div>
                  )}

                  {total?.exchange !== 0 && (
                    <div className="text-end">
                      <p>{NumberWithCommas(total?.exchange, 2)}</p>
                    </div>
                  )}
                  {total?.Cash !== 0 && (
                    <div className="text-end">
                      <p>{NumberWithCommas(total?.Cash, 2)}</p>
                    </div>
                  )}
                  {total?.Bank !== 0 && (
                    <div className="text-end">
                      <p>{NumberWithCommas(total?.Bank, 2)}</p>
                    </div>
                  )}
                  {total?.Advance !== 0 && (
                    <div className="text-end">
                      <p>{NumberWithCommas(total?.Advance, 2)}</p>
                    </div>
                  )}
                  {total?.AddLess !== 0 && (
                    <div className="text-end">
                      <p>{NumberWithCommas(total?.AddLess, 2)}</p>
                    </div>
                  )}

                  {total?.discountAmt !== 0 && (
                    <div className="text-end">
                      <p>{NumberWithCommas(total?.discountAmt, 2)}</p>
                    </div>
                  )}

                  {total.previeligeCardDisocunt !== 0 && (
                    <div className="text-end">
                      <p>{NumberWithCommas(total.previeligeCardDisocunt, 2)}</p>
                    </div>
                  )}
                  <div className="text-end">
                    {taxes.length > 0 &&
                      taxes.map((e, i) => {
                        return <p key={i}>{NumberWithCommas(e?.amount, 2)}</p>;
                      })}
                    {/* <p>{total?.cgstAmount}</p> */}
                    {/* <p>{total?.sgstAmount}</p> */}
                    {json1Data?.AddLess !== 0 && (
                      <p>{NumberWithCommas(json1Data?.AddLess, 2)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* total */}
            <div className="d-flex recordEstimatePrint overflow-hidden border-end border-start border-bottom  border-black totalBgEstimatePrint">
              <div className="totalEstimatePrint border-end totalBgEstimatePrint border_color_estimates">
                <p className="text-center fw-bold h-100">Total</p>
              </div>
              <div className="diamondEstimatePrint border-end border_color_estimates">
                <div className="d-flex  w-100">
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p></p>
                  </div>
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p></p>
                  </div>
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p className="text-end fw-bold">
                      {diamondTotal?.Pcs > 0 &&
                        NumberWithCommas(diamondTotal?.Pcs, 0)}
                    </p>
                  </div>
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p className="text-end fw-bold">
                      {diamondTotal?.Wt > 0 &&
                        NumberWithCommas(diamondTotal?.Wt, 3)}
                    </p>
                  </div>
                  <div className="width20EstimatePrint p_1Estimate h-100"></div>
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p className="text-end fw-bold">
                      {NumberWithCommas(diamondTotal?.Amount, 2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="metalEstimatePrint border-end border_color_estimates">
                <div className="d-flex totalBgEstimatePrint bottom-0 w-100">
                  <div className="width200EstimatePrint p_1Estimate h-100">
                    <p className="fw-bold fw-bold"></p>
                  </div>
                  <div className="width200EstimatePrint p_1Estimate h-100">
                    <p className="fw-bold fw-bold text-end">
                      {total?.weightWithDiamondLoss !== 0 &&
                        fixedValues(total?.weightWithDiamondLoss, 3)}
                    </p>
                  </div>
                  <div className="width200EstimatePrint p_1Estimate h-100">
                    <p className="fw-bold fw-bold text-end">
                      {/* {fixedValues(total?.finalMetalsTotal?.Wt, 3)} */}
                      {total?.gdWt !== 0 && NumberWithCommas(total?.gdWt, 3)}
                    </p>
                  </div>
                  {/* <div className='width200EstimatePrint p_1Estimate h-100'><p className='fw-bold fw-bold text-end'>{NumberWithCommas(total?.finalMetalsTotal?.rate, 2)}</p></div> */}
                  {/* <div className="width200EstimatePrint p_1Estimate h-100">
                      <p className="fw-bold fw-bold text-end"></p>
                    </div> */}
                  <div
                    className="width200EstimatePrint p_1Estimate h-100"
                    style={{ minWidth: "40%", width: "40%" }}
                  >
                    <p className="fw-bold fw-bold text-end">
                      {total?.finalMetalsTotal?.amount !== 0 &&
                        NumberWithCommas(total?.finalMetalsTotal?.amount, 2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="stoneEstimatePrint border-end border_color_estimates">
                <div className="d-flex totalBgEstimatePrint bottom-0 w-100">
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p className="fw-bold"></p>
                  </div>
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p className="fw-bold"></p>
                  </div>
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p className="text-end fw-bold">
                      {colorStoneMiscTotal?.Pcs !== 0 &&
                        NumberWithCommas(colorStoneMiscTotal?.Pcs, 0)}
                    </p>
                  </div>
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p className="text-end fw-bold">
                      {colorStoneMiscTotal?.Wt !== 0 &&
                        fixedValues(colorStoneMiscTotal?.Wt, 3)}
                    </p>
                  </div>
                  <div className="width20EstimatePrint p_1Estimate h-100"></div>
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p className="text-end fw-bold">
                      {NumberWithCommas(colorStoneMiscTotal?.Amount, 2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="OtherAmountEstimatePrint border-end border_color_estimates">
                <div className="totalBgEstimatePrint bottom-0 w-100 h-100">
                  <div className="h-100 text-end p_1Estimate">
                    <p className="fw-bold">
                      {/* {total?.otherAmount !== 0 && NumberWithCommas(total?.otherAmount, 2)} */}
                      {formatAmount(otherCharges)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="labourEstimatePrint border-end border_color_estimates">
                <div className="d-flex  w-100 h-100 justify-content-end">
                  <div className="p_1Estimate fw-bold">
                    <p>
                      {total?.labourAmount !== 0 &&
                        NumberWithCommas(total?.labourAmount, 2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="totalAmountEstimatePrint d-flex">
                <div className="totalBgEstimatePrint w-100 h-100">
                  <div className="text-end p_1Estimate">
                    <p className="fw-bold">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: json1Data?.Currencysymbol,
                        }}
                      ></span>
                      {total?.finalAmount !== 0 &&
                        NumberWithCommas(total?.finalAmount, 2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex recordEstimatePrint justify-content-between overflow-hidden  border-start border-end border_color_estimates">
              {/* summary */}
              <div className="min_height_100EstimatePrint border-end border-bottom position-relative col-4 border_color_estimates">
                <div className="totalBgEstimatePrint text-center border-bottom border_color_estimates">
                  <p className="fw-bold p-1">SUMMARY</p>
                </div>
                <div className="d-grid h-100 pb-3">
                  <div className="d-flex w-100 justify-content-between">
                    <div className="w-50 border-end h-100 pb-2 border_color_estimates">
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">GOLD IN 24KT</p>
                        <p>
                          {fixedValues(
                            total?.gold24Kt - notGoldMetalWtTotal,
                            3
                          )}{" "}
                          gm
                        </p>
                      </div>
                      {MetShpWise?.map((e, i) => {
                        return (
                          <div
                            className="d-flex justify-content-between px-1"
                            key={i}
                          >
                            <p className="fw-bold">{e?.ShapeName}</p>
                            <p>{NumberWithCommas(e?.metalfinewt, 3)} gm</p>
                          </div>
                        );
                      })}
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">GROSS WT</p>
                        <p>{fixedValues(total?.grosswt, 3)} gm</p>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">*WT</p>
                        <p>{fixedValues(total?.weightWithDiamondLoss, 2)} gm</p>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">NET WT</p>
                        <p>{fixedValues(total?.gdWt, 2)} gm</p>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">DIAMOND WT</p>
                        <p>
                          {NumberWithCommas(total?.diaPcs, 0)} /{" "}
                          {NumberWithCommas(diamondTotal?.Wt, 3)} cts
                        </p>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">STONE WT</p>
                        <p>
                          {NumberWithCommas(ColorStoneTotal?.Pcs, 0)} /{" "}
                          {fixedValues(ColorStoneTotal?.Wt, 2)} cts
                        </p>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">MISC WT</p>
                        <p>
                          {NumberWithCommas(miscTotal?.Pcs, 0)} /{" "}
                          {fixedValues(miscTotal?.Wt, 3)} gm
                        </p>
                      </div>
                      {total?.findingWeight !== 0 && (
                        <div className="d-flex justify-content-between px-1">
                          <p className="fw-bold">FINDING WT</p>
                          <p>{fixedValues(total?.findingWeight, 3)} gm</p>
                        </div>
                      )}
                    </div>
                    <div className="w-50 h-100 pb-2">
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">GOLD</p>
                        <p>
                          {NumberWithCommas(
                            total?.finalMetalsTotal?.amount - notGoldMetalTotal,
                            2
                          )}
                        </p>
                        {/* <p>{NumberWithCommas(total?.goldAmount, 2)}</p> */}
                      </div>
                      {MetShpWise?.map((e, i) => {
                        return (
                          <div
                            className="d-flex justify-content-between px-1"
                            key={i}
                          >
                            <p className="fw-bold">{e?.ShapeName}</p>
                            <p>{NumberWithCommas(e?.Amount, 2)}</p>
                          </div>
                        );
                      })}
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">DIAMOND</p>
                        <p>{NumberWithCommas(total?.diamondAmount, 2)}</p>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">CST</p>
                        <p>{NumberWithCommas(total?.colorStoneAmount, 2)}</p>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">MISC</p>
                        <p>{NumberWithCommas(total?.miscAmount, 2)}</p>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">MAKING</p>
                        {/* <p>{NumberWithCommas(total?.makingAmount, 2)}</p> */}
                        <p>{NumberWithCommas(total?.labourAmount, 2)}</p>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">OTHER</p>
                        <p>{NumberWithCommas(total?.otherAmount, 2)}</p>
                      </div>
                      {json1Data?.AddLess !== 0 && (
                        <div className="d-flex justify-content-between px-1">
                          <p className="fw-bold">
                            {json1Data?.AddLess > 0 ? "ADD" : "Less"}
                          </p>
                          <p>{NumberWithCommas(json1Data?.AddLess, 2)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="d-flex totalBgEstimatePrint position-absolute bottom-0 w-100 border-top border_color_estimates">
                  <div className="px-1 min_height_24_estimatePrint w-50 border-end border_color_estimates">
                    <p> </p>
                  </div>
                  <div className="px-1 min_height_24_estimatePrint w-50">
                    <div className="d-flex justify-content-between align-items-center h-100">
                      <div className="fw-bold">
                        <p>TOTAL</p>
                      </div>
                      <div>
                        <p>{NumberWithCommas(total?.finalAmount, 2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* created by */}
              <div className="min_height_100EstimatePrint d-flex border-start col-1 border-bottom border_color_estimates">
                <div className="d-flex h-100 w-100">
                  <div className="position-relative d-flex justify-conten-center align-items-end w-100">
                    <i className="w-100 text-center">Checked By </i>
                  </div>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '9px', color: '#999999' }}>Printed on : {formatDateTime()}</p>
          </div>
        </div>
      ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
          {msg}
        </p>
      )}

    </>
  );
};

export default OrderPrint;

// import React, { useEffect, useState } from "react";
// import "../../assets/css/prints/orderprint.css";
// import {
//   NumberWithCommas,
//   ReceiveInBank,
//   apiCall,
//   checkMsg,
//   fixedValues,
//   formatAmount,
//   handleImageError,
//   handlePrint,
//   isObjectEmpty,
//   otherAmountDetail,
//   taxGenrator,
// } from "../../GlobalFunctions";
// import Loader2 from "../../components/Loader2";
// import Loader from "../../components/Loader";
// import { cloneDeep } from "lodash";
// import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
// import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";
// const OrderPrint = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
//     const [image, setImage] = useState(true);
//     const [json1Data, setJson1Data] = useState({});
//     const [json2Data, setJson2Data] = useState([]);
//     const [otherCharges, setOtherCharges] = useState(0);
//     const [imageLoading, setImageLoading] = useState(true);
//     const [msg, setMsg] = useState("");
//     const [diamondDetailss, setDiamondDetailss] = useState({});
//     const [isImageWorking, setIsImageWorking] = useState(true);
//     const handleImageErrors = () => {
//       setIsImageWorking(false);
//     };
//     const [dia, setDia] = useState([]);
//     // const [changePrint, setChangeprint] = useState(atob(printName).toLowerCase() === "estimate print change" ? true : false);
//     const [total, setTotal] = useState({
//       previeligeCardDisocunt: 0,
//       totalamount: 0,
//       cgstAmount: 0,
//       sgstAmount: 0,
//       finalAmount: 0,
//       weightWithDiamondLoss: 0,
//       finalDiamondTotal: {
//         pcs: 0,
//         weight: 0,
//         rate: 0,
//         amount: 0,
//       },
//       finalMetalsTotal: {
//         pcs: 0,
//         weight: 0,
//         rate: 0,
//         amount: 0,
//         Wt: 0,
//       },
//       finalColorStonesTotal: {
//         pcs: 0,
//         weight: 0,
//         rate: 0,
//         amount: 0,
//       },
//       finalmiscsTotal: {
//         pcs: 0,
//         weight: 0,
//         rate: 0,
//         amount: 0,
//       },
//       findingWeight: 0,
//       otherAmount: 0,
//       gold24Kt: 0,
//       grosswt: 0,
//       gdWt: 0,
//       NetWt: 0,
//       diaWt: 0,
//       diaPcs: 0,
//       stoneWt: 0,
//       stonePcs: 0,
//       miscWt: 0,
//       miscPcs: 0,
//       goldAmount: 0,
//       diamondAmount: 0,
//       colorStoneAmount: 0,
//       miscAmount: 0,
//       makingAmount: 0,
//       summaryTotalAmount: 0,
//       labourAmount: 0,
//       discountAmt: 0,
//     });

//     const [diamondTotal, setDiamondTotal] = useState({
//       Wt: 0,
//       Pcs: 0,
//       Amount: 0,
//     });

//     const [colorStoneMiscTotal, setColorStoneMiscTotal] = useState({
//       Wt: 0,
//       Pcs: 0,
//       Amount: 0,
//     });

//     const [ColorStoneTotal, setColorStoneTotal] = useState({
//       Wt: 0,
//       Pcs: 0,
//       Amount: 0,
//     });

//     const [miscTotal, setMiscTotal] = useState({
//       Wt: 0,
//       Pcs: 0,
//       Amount: 0,
//     });

//     const [taxes, setTaxes] = useState([]);
//     const [diamondDetail, setDiamondDetail] = useState([]);
//     const [loader, setLoader] = useState(true);
//     const [brokrage, setBrokrage] = useState(false);
//     const [brokarage, setBrokarage] = useState([]);

//     const [MetShpWise, setMetShpWise] = useState([]);
//     const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
//     const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);

//     // const handleChange = (e) => {
//     //   const { name } = e?.target;
//     //   if (name === "image") {
//     //     image ? setImage(false) : setImage(true);
//     //   } else if (name === "brokrage") {
//     //     brokrage ? setBrokrage(false) : setBrokrage(true);
//     //   }
//     // };

//     const caiculateMaterial = (data) => {
//       let diamondDetailsss = [];

//       data?.BillPrint_Json2?.forEach((ele, ind) => {
//         let obj1 = cloneDeep(ele);
//         if (obj1?.MasterManagement_DiamondStoneTypeid === 1) {
//           if (obj1?.ShapeName === "RND") {
//             let findDiamond = diamondDetailsss?.findIndex((elem, index) => elem?.Colorname === obj1?.Colorname && elem?.QualityName === obj1?.QualityName);
//             if (findDiamond === -1) {
//               diamondDetailsss.push(obj1);
//             } else {
//               diamondDetailsss[findDiamond].Wt += obj1?.Wt;
//               diamondDetailsss[findDiamond].Pcs += obj1?.Pcs;
//               diamondDetailsss[findDiamond].Amount += obj1?.Amount;
//             }

//           } else {
//             let obj = cloneDeep(ele);
//             let findOther = diamondDetailsss?.findIndex((elem, index) => elem?.ShapeName === "OTHER");
//             if (findOther === -1) {
//               // let obj = { ...ele };
//               obj.ShapeName = "OTHER";
//               diamondDetailsss.push(obj);
//             } else {
//               diamondDetailsss[findOther].Wt += obj?.Wt;
//               diamondDetailsss[findOther].Pcs += obj?.Pcs;
//               diamondDetailsss[findOther].Amount += obj?.Amount;
//             }
//           }
//         }

//       });
//       diamondDetailsss.sort((a, b) => {
//         if (a.ShapeName === "OTHER" && b.ShapeName !== "OTHER") {
//           return 1;
//         } else if (a.ShapeName !== "OTHER" && b.ShapeName === "OTHER") {
//           return -1;
//         } else {
//           if (a.Colorname !== b.Colorname) {
//             return a.Colorname.localeCompare(b.Colorname);
//           } else {
//             return a.QualityName.localeCompare(b.QualityName);
//           }
//         }
//       })
//       setDia(diamondDetailsss);
//       let resultArr = [];
//       let totals = { ...total };
//       totals.previeligeCardDisocunt = data?.BillPrint_Json[0]?.Privilege_discount;
//       let diamondDetailList = [];
//       let diamondDetailList2 = [{ shapeQualityColor: "others", pcs: 0, wt: 0 }];
//       let diamondDetails = {
//         pcs: 0,
//         wt: 0,
//       };
//       let diamondTotals = { ...diamondTotal };
//       let colorStoneTotals = { ...colorStoneMiscTotal };
//       let colorStoness = { ...ColorStoneTotal };
//       let miscstotals = { ...miscTotal };

//       let met_shp_arr = MetalShapeNameWiseArr(data?.BillPrint_Json2);

//       setMetShpWise(met_shp_arr);
//       let tot_met = 0;
//       let tot_met_wt = 0;
//       met_shp_arr?.forEach((e, i) => {
//         tot_met += e?.Amount;
//         tot_met_wt += e?.metalfinewt;
//       })
//       setNotGoldMetalTotal(tot_met);
//       setNotGoldMetalWtTotal(tot_met_wt);

//       let othAmt = 0;

//       data?.BillPrint_Json1.forEach((e, i) => {
//         othAmt += e?.OtherCharges;
//         totals.discountAmt += e?.DiscountAmt;
//         let settingAmount = 0;
//         let totalSetttingAmount = 0;
//         totalSetttingAmount += e?.MakingAmount;
//         let settingRate = 0;
//         let obj = { ...e };
//         obj.otherChargesTotal = obj?.OtherCharges + obj?.TotalDiamondHandling;
//         obj.OtherCharges = obj?.OtherCharges + obj?.TotalDiamondHandling;
//         let findingTotal = 0;
//         let diamonds = [];
//         let metals = [];
//         let colorStones = [];
//         let mics = [];
//         let miscsList = [];
//         let finding = [];
//         let anotherFinding = [];
//         let otherAmountDetails = otherAmountDetail(e?.OtherAmtDetail);
//         let diamondTotal = {
//           pcs: 0,
//           weight: 0,
//           rate: 0,
//           amount: 0,
//         };
//         let metalsTotal = {
//           pcs: 0,
//           weight: 0,
//           Wt: 0,
//           rate: 0,
//           amount: 0,
//           weightWithDiamondLoss: 0,
//         };
//         let colorStonesTotal = {
//           pcs: 0,
//           weight: 0,
//           rate: 0,
//           amount: 0,
//         };
//         let miscsTotal = {
//           pcs: 0,
//           weight: 0,
//           rate: 0,
//           amount: 0,
//         };
//         let primaryMetalAmount = 0;
//         // totals.gold24Kt += e?.convertednetwt;
//         totals.gold24Kt += e?.PureNetWt;
//         data?.BillPrint_Json2.forEach((ele, ind) => {
//           if (e?.SrJobno === ele?.StockBarcode) {
//             if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
//               if (ele?.ShapeName === "GOLD") {
//                 if (ele?.QualityName === "24K") {
//                 }
//                 totals.goldAmount += ele?.Amount;
//               }
//               if(ele?.IsPrimaryMetal === 1){
//                 primaryMetalAmount += ele?.Amount;
//               }
//               ele.Weight = e?.NetWt + e?.DiamondCTWwithLoss / 5;
//               metalsTotal.weightWithDiamondLoss = ele.Weight;
//               metalsTotal.Wt += ele.Wt;
//               totals.weightWithDiamondLoss += ele.Weight;
//               totals.finalMetalsTotal.Wt += ele?.Wt;
//               metalsTotal.weight = ele.Weight;
//               metals.push(ele);
//             }
//             if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
//               colorStones.push(ele);
//               totals.stoneWt += ele?.Wt;
//               totals.stonePcs += ele?.Pcs;
//               totals.colorStoneAmount += ele?.Amount;
//               colorStoneTotals.Wt += ele?.Wt;
//               colorStoneTotals.Pcs += ele?.Pcs;
//               colorStoneTotals.Amount += ele?.Amount;
//               colorStoness.Wt += ele?.Wt;
//               colorStoness.Pcs += ele?.Pcs;
//               colorStoness.Amount += ele?.Amount;
//             }
//             if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
//               diamondTotals.Pcs += ele?.Pcs;
//               diamondTotals.Wt += ele?.Wt;
//               diamondTotals.Amount += ele?.Amount;
//               diamondDetails.pcs += ele?.Pcs;
//               diamondDetails.wt += ele?.Wt;
//               diamonds.push(ele);
//               totals.diaWt += ele?.Wt;
//               totals.diaPcs += ele?.Pcs;
//               totals.diamondAmount += ele?.Amount;
//               if (diamondDetailList.length > 0) {
//                 let findRecord = diamondDetailList.findIndex((el, indd) => {
//                   return (
//                     el.data.ShapeName === ele.ShapeName &&
//                     el.data.QualityName === ele.QualityName &&
//                     el.data.Colorname === ele.Colorname
//                   );
//                 });
//                 if (findRecord !== -1) {
//                   diamondDetailList[findRecord].pcs += ele?.Pcs;
//                   diamondDetailList[findRecord].wt += ele?.Wt;
//                 } else {
//                   diamondDetailList.push({
//                     data: ele,
//                     pcs: ele?.Pcs,
//                     wt: ele?.Wt,
//                     shapeQualityColor:
//                       ele?.ShapeName +
//                       " " +
//                       ele?.QualityName +
//                       " " +
//                       ele?.Colorname,
//                   });
//                 }
//               } else {
//                 diamondDetailList.push({
//                   data: ele,
//                   pcs: ele?.Pcs,
//                   wt: ele?.Wt,
//                   shapeQualityColor:
//                     ele?.ShapeName +
//                     " " +
//                     ele?.QualityName +
//                     " " +
//                     ele?.Colorname,
//                 });
//               }
//             }
//             if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
//               if (ele?.IsHSCOE === 0) {
//                 mics.push(ele);
//                 totals.miscWt += ele?.Wt;
//                 totals.miscPcs += ele?.Pcs;
//                 totals.miscAmount += ele?.Amount;

//                 colorStoneTotals.Wt += ele?.Wt;
//                 colorStoneTotals.Pcs += ele?.Pcs;
//                 colorStoneTotals.Amount += ele?.Amount;

//                 miscstotals.Wt += ele?.Wt;
//                 miscstotals.Pcs += ele?.Pcs;
//                 miscstotals.Amount += ele?.Amount;
//               }
//               if (ele?.IsHSCOE !== 0) {
//                 miscsList.push(ele);
//                 obj.otherChargesTotal += ele?.Amount;
//               }
//             }
//             settingAmount += ele?.SettingAmount;
//             totalSetttingAmount += ele?.SettingAmount;
//             settingRate += ele?.SettingRate;
//             if (ele?.MasterManagement_DiamondStoneTypeid === 5) {
//               if (ele?.Supplier === "Customer") {
//                 findingTotal += ele?.Wt;
//                 finding.push(ele);
//                 totals.findingWeight += ele?.Wt;
//               }
//               anotherFinding.push(ele)
//               // metalsTotal.weight += ele.Wt;
//               // totals.weightWithDiamondLoss += ele.Wt;
//             }
//           }
//         });
//         totals.otherAmount += obj?.otherChargesTotal;
//         totals.labourAmount += totalSetttingAmount;
//         if (diamonds.length > 0) {
//           diamonds.reduce((accumulator, currentObject) => {
//             accumulator.amount += currentObject.Amount;
//             accumulator.weight += currentObject.Wt;
//             accumulator.pcs += currentObject.Pcs;
//             accumulator.rate += currentObject.Rate;
//             totals.finalDiamondTotal.amount += currentObject.Amount;
//             totals.finalDiamondTotal.weight += currentObject.Wt;
//             totals.finalDiamondTotal.pcs += currentObject.Pcs;
//             totals.finalDiamondTotal.rate += currentObject.Rate;
//             return accumulator;
//           }, diamondTotal);
//         }

//         let WtSpecial =
//           e?.NetWt + (diamondTotal.weight / 5) - findingTotal;

//         let metalNetWt = e?.NetWt + e?.LossWt - findingTotal;
//         if (metals.length > 0) {
//           metals.reduce((accumulator, currentObject) => {
//             accumulator.amount += currentObject.Amount;
//             // accumulator.weight += currentObject.Wt;
//             accumulator.pcs += currentObject.Pcs;
//             accumulator.rate += currentObject.Rate;
//             // totals.finalMetalsTotal.amount += currentObject.Amount;
//             totals.finalMetalsTotal.pcs += currentObject.Pcs;
//             totals.finalMetalsTotal.rate += currentObject.Rate;
//             return accumulator;
//           }, metalsTotal);
//         }
//         if (colorStones.length > 0) {
//           colorStones.reduce((accumulator, currentObject) => {
//             accumulator.amount += currentObject.Amount;
//             accumulator.weight += currentObject.Wt;
//             accumulator.pcs += currentObject.Pcs;
//             accumulator.rate += currentObject.Rate;
//             totals.finalColorStonesTotal.amount += currentObject.Amount;
//             totals.finalColorStonesTotal.weight += currentObject.Wt;
//             totals.finalColorStonesTotal.pcs += currentObject.Pcs;
//             totals.finalColorStonesTotal.rate += currentObject.Rate;
//             return accumulator;
//           }, colorStonesTotal);
//         }
//         if (mics.length > 0) {
//           mics.reduce((accumulator, currentObject) => {
//             accumulator.amount += currentObject.Amount;
//             accumulator.weight += currentObject.Wt;
//             accumulator.pcs += currentObject.Pcs;
//             accumulator.rate += currentObject.Rate;
//             totals.finalmiscsTotal.amount += currentObject.Amount;
//             totals.finalmiscsTotal.weight += currentObject.Wt;
//             totals.finalmiscsTotal.pcs += currentObject.Pcs;
//             totals.finalmiscsTotal.rate += currentObject.Rate;
//             return accumulator;
//           }, miscsTotal);
//         }
//         obj.WtSpecial = WtSpecial;
//         obj.metalNetWt = metalNetWt;
//         obj.otherAmountDetails = otherAmountDetails;
//         obj.mics = mics;
//         obj.diamonds = diamonds;
//         obj.totalSetttingAmount = totalSetttingAmount;
//         obj.metals = metals;
//         obj.finding = finding;
//         obj.miscsList = miscsList;
//         obj.anotherFinding = anotherFinding;
//         obj.primaryMetalAmount = primaryMetalAmount;
//         totals.finalMetalsTotal.amount += primaryMetalAmount
//         obj.colorStones = colorStones;
//         obj.diamondTotal = diamondTotal;
//         obj.metalsTotal = metalsTotal;
//         obj.colorStonesTotal = colorStonesTotal;
//         obj.miscsTotal = miscsTotal;
//         obj.settingAmount = settingAmount;
//         obj.settingRate = settingRate;
//         obj.findingTotal = findingTotal;
//         totals.totalamount += e?.TotalAmount;
//         totals.grosswt += e?.grosswt;
//         totals.gdWt += e?.MetalDiaWt;
//         totals.NetWt += e?.NetWt;
//         totals.makingAmount += e?.MakingAmount;
//         if (obj.metals[0]) {
//           obj.metals[0].Wt = obj.metals[0]?.Wt - findingTotal;
//           metalsTotal.Wt -= findingTotal;
//           totals.finalMetalsTotal.Wt -= findingTotal;
//         }
//         // totals.finalMetalsTotal.weight += metalsTotal.Wt;
//         resultArr.push(obj);
//       });
//       setOtherCharges(othAmt);
//       setMiscTotal(miscstotals);
//       setColorStoneTotal(colorStoness);
//       setDiamondTotal(diamondTotals);
//       setColorStoneMiscTotal(colorStoneTotals);
//       setDiamondDetailss(diamondDetails);
//       totals.cgstAmount =
//         (data?.BillPrint_Json[0]?.CGST * totals.totalamount) / 100;
//       totals.sgstAmount =
//         (data?.BillPrint_Json[0]?.SGST * totals.totalamount) / 100;
//       // totals.finalAmount = totals.totalamount + totals.cgstAmount + totals.sgstAmount + data?.BillPrint_Json[0]?.AddLess;
//       totals.summaryTotalAmount = (
//         totals.goldAmount +
//         totals.diamondAmount +
//         totals.colorStoneAmount +
//         totals.miscAmount +
//         totals.makingAmount +
//         totals.otherAmount +
//         data?.BillPrint_Json[0].AddLess
//       ).toFixed(3);

//       // taxes
//       let taxValue = taxGenrator(data?.BillPrint_Json[0], totals?.totalamount);
//       setTaxes(taxValue);
//       taxValue.forEach((e, i) => {
//         totals.finalAmount += +e?.amount;
//       });
//       totals.finalAmount +=
//         totals.totalamount +
//         data?.BillPrint_Json[0]?.AddLess -
//         data?.BillPrint_Json[0]?.Privilege_discount;
//       totals.finalAmount = totals.finalAmount?.toFixed(2);
//       // taxes end

//       totals.gold24Kt = totals.gold24Kt.toFixed(3);
//       totals.NetWt = (totals.NetWt / 5).toFixed(3);
//       totals.diaWt = (totals.diaWt / 5).toFixed(3);
//       totals.stoneWt = (totals.stoneWt / 5).toFixed(3);
//       totals.miscWt = (totals.miscWt / 5).toFixed(3);
//       totals.goldAmount = totals.goldAmount.toFixed(3);
//       totals.colorStoneAmount = totals.colorStoneAmount.toFixed(3);
//       totals.diamondAmount = totals.diamondAmount.toFixed(3);
//       totals.miscAmount = totals.miscAmount.toFixed(3);
//       totals.makingAmount = totals.makingAmount.toFixed(3);
//       totals.otherAmount = totals.otherAmount.toFixed(3);
//       diamondDetailList.forEach((e, i) => {
//         if (i >= 7) {
//           diamondDetailList2[diamondDetailList2.length - 1].pcs += +e.pcs;
//           diamondDetailList2[diamondDetailList2.length - 1].wt += +e.wt;
//         } else {
//           diamondDetailList2.unshift({
//             shapeQualityColor: e.shapeQualityColor,
//             pcs: +e.pcs,
//             wt: +e.wt,
//           });
//         }
//       });
//       setDiamondDetail(diamondDetailList2);
//       setTotal(totals);
//       setJson2Data(resultArr);
//       let brokarage = ReceiveInBank(data?.BillPrint_Json[0]?.Brokerage);
//       setBrokarage(brokarage);
//       let finalArr = [];

//       resultArr.forEach((e, i) => {
//         if (e?.GroupJob === "") {
//           finalArr.push(e);
//         } else {
//           let findRecord = finalArr.findIndex(
//             (ele, ind) => ele?.GroupJob === e?.GroupJob
//           );
//           if (findRecord === -1) {
//             finalArr.push(e);
//           } else {
//             let obj = { ...e };
//             if (
//               finalArr[findRecord]?.GroupJob !== finalArr[findRecord]?.SrJobno
//             ) {
//               finalArr[findRecord].SrJobno = finalArr[findRecord]?.GroupJob;
//               if (obj?.GroupJob === obj?.SrJobno) {
//                 finalArr[findRecord].Categoryname = obj?.Categoryname;
//                 finalArr[findRecord].Collectionname = obj?.Collectionname;
//                 finalArr[findRecord].designno = obj?.designno;
//                 finalArr[findRecord].DesignImage = obj?.DesignImage;
//                 finalArr[findRecord].PO = obj?.PO;
//                 finalArr[findRecord].Tunch = obj?.Tunch;
//                 finalArr[findRecord].Size = obj?.Size;
//               }
//             }
//             finalArr[findRecord].primaryMetalAmount += obj?.primaryMetalAmount;
//             finalArr[findRecord].otherChargesTotal += obj?.otherChargesTotal;
//             finalArr[findRecord].WtSpecial += obj?.WtSpecial;
//             finalArr[findRecord].totalSetttingAmount += obj?.totalSetttingAmount;
//             finalArr[findRecord].metalNetWt += obj?.metalNetWt;
//             finalArr[findRecord].NetWt += obj?.NetWt;
//             finalArr[findRecord].LossWt += obj?.LossWt;

//             // for diamonds
//             let blankDiamondArr = [];
//             let diamonds = [
//               ...finalArr[findRecord]?.diamonds,
//               ...obj?.diamonds,
//             ].flat();
//             diamonds.forEach((elem, ind) => {
//               let obj = cloneDeep(elem);
//               let findDiamonds = blankDiamondArr.findIndex(
//                 (elee, indd) =>
//                   elee?.ShapeName === obj?.ShapeName &&
//                   elee?.Colorname === obj?.Colorname &&
//                   elee?.QualityName === obj?.QualityName &&
//                   elee?.Rate === obj?.Rate &&
//                   elee?.SizeName === obj?.SizeName
//               );
//               if (findDiamonds === -1) {
//                 blankDiamondArr.push(obj);
//               } else {
//                 blankDiamondArr[findDiamonds].Wt += obj?.Wt;
//                 blankDiamondArr[findDiamonds].Pcs += obj?.Pcs;
//                 blankDiamondArr[findDiamonds].Amount += obj?.Amount;
//                 if (obj?.SettingAmount !== null) {
//                   if (blankDiamondArr[findDiamonds].SettingAmount === null) {
//                     blankDiamondArr[findDiamonds].SettingAmount = obj?.SettingAmount;
//                   } else {
//                     blankDiamondArr[findDiamonds].SettingAmount += obj?.SettingAmount;
//                   }
//                 }

//               }
//             });

//             // for colorstones
//             let blankColorStoneArr = [];
//             let colorStones = [
//               ...finalArr[findRecord]?.colorStones,
//               ...obj?.colorStones,
//             ].flat();
//             colorStones.forEach((elem, ind) => {
//               let obj = cloneDeep(elem);
//               let findColorStones = blankColorStoneArr.findIndex(
//                 (elee, indd) =>
//                   elee?.ShapeName ===obj?.ShapeName &&
//                   elee?.Colorname ===obj?.Colorname &&
//                   elee?.QualityName ===obj?.QualityName &&
//                   elee?.Rate ===obj?.Rate &&
//                   elee?.SizeName ===obj?.SizeName
//               );
//               if (findColorStones === -1) {
//                 blankColorStoneArr.push(obj);
//               } else {
//                 blankColorStoneArr[findColorStones].Wt +=obj?.Wt;
//                 blankColorStoneArr[findColorStones].Pcs +=obj?.Pcs;
//                 blankColorStoneArr[findColorStones].Amount +=obj?.Amount;
//                 if (elem?.SettingAmount !== null) {
//                   if (blankColorStoneArr[findColorStones].SettingAmount === null) {
//                     blankColorStoneArr[findColorStones].SettingAmount =obj?.SettingAmount;
//                   } else {
//                     blankColorStoneArr[findColorStones].SettingAmount +=obj?.SettingAmount;
//                   }
//                 }
//               }
//             });

//             // for miscs
//             let blankMiscsArr = [];
//             let miscs = [...finalArr[findRecord]?.mics, ...obj?.mics].flat();
//             miscs.forEach((elem, ind) => {
//               let findMiscs = blankMiscsArr.findIndex(
//                 (elee, indd) =>
//                   elee?.ShapeName === elem?.ShapeName &&
//                   elee?.Colorname === elem?.Colorname &&
//                   elee?.QualityName === elem?.QualityName &&
//                   elee?.Rate === elem?.Rate &&
//                   elee?.MasterManagement_DiamondStoneTypeid ===
//                   elem?.MasterManagement_DiamondStoneTypeid &&
//                   elee?.SizeName === elem?.SizeName
//               );
//               if (findMiscs === -1) {
//                 blankMiscsArr.push(elem);
//               } else {
//                 blankMiscsArr[findMiscs].Wt += elem?.Wt;
//                 blankMiscsArr[findMiscs].Pcs += elem?.Pcs;
//                 blankMiscsArr[findMiscs].Amount += elem?.Amount;
//                 if (elem?.SettingAmount !== null) {
//                   if (blankMiscsArr[findMiscs].SettingAmount === null) {
//                     blankMiscsArr[findMiscs].SettingAmount = elem?.SettingAmount;
//                   } else {
//                     blankMiscsArr[findMiscs].SettingAmount += elem?.SettingAmount;
//                   }
//                 }
//               }
//             });

//             let blankmiscsList = [];
//             let miscsLists = [...finalArr[findRecord]?.miscsList, ...obj?.miscsList];
//             miscsLists.forEach((ele, ind) => {
//               let findListMisc = blankmiscsList.findIndex((elem, index) => elem?.ShapeName === ele?.ShapeName);
//               if (findListMisc === -1) {
//                 blankmiscsList.push(ele);
//               } else {
//                 blankmiscsList[findListMisc].Wt += ele?.Wt;
//                 blankmiscsList[findListMisc].Pcs += ele?.Pcs;
//                 blankmiscsList[findListMisc].Amount += ele?.Amount;
//               }
//             });

//             // for finding
//             let blankFindingArr = [];
//             let finding = [
//               ...finalArr[findRecord]?.finding,
//               ...obj?.finding,
//             ].flat();
//             finding.forEach((elem, ind) => {
//               let findFinding = blankFindingArr.findIndex(
//                 (elee, indd) =>
//                   elee?.ShapeName === elem?.ShapeName &&
//                   elee?.Colorname === elem?.Colorname &&
//                   elee?.QualityName === elem?.QualityName &&
//                   elee?.Rate === elem?.Rate &&
//                   elee?.MasterManagement_DiamondStoneTypeid ===
//                   elem?.MasterManagement_DiamondStoneTypeid &&
//                   elee?.SizeName === elem?.SizeName
//               );
//               if (findFinding === -1) {
//                 blankFindingArr.push(elem);
//               } else {
//                 blankFindingArr[findFinding].Wt += elem?.Wt;
//                 blankFindingArr[findFinding].Pcs += elem?.Pcs;
//                 blankFindingArr[findFinding].Amount += elem?.Amount;
//                 if (elem?.SettingAmount !== null) {
//                   if (blankFindingArr[findFinding].SettingAmount === null) {
//                     blankFindingArr[findFinding].SettingAmount = elem?.SettingAmount;
//                   } else {
//                     blankFindingArr[findFinding].SettingAmount += elem?.SettingAmount;
//                   }
//                 }
//               }
//             });

//             let blankFindingAnotherArray = [];
//             let anotherFindings = [...finalArr[findRecord]?.anotherFinding, ...obj?.anotherFinding].flat();
//             anotherFindings.forEach((elem, ind) => {
//               let findFinding = blankFindingAnotherArray.findIndex(
//                 (elee, indd) =>
//                   elee?.ShapeName === elem?.ShapeName &&
//                   elee?.Colorname === elem?.Colorname &&
//                   elee?.QualityName === elem?.QualityName &&
//                   elee?.Rate === elem?.Rate &&
//                   elee?.MasterManagement_DiamondStoneTypeid ===
//                   elem?.MasterManagement_DiamondStoneTypeid &&
//                   elee?.SizeName === elem?.SizeName
//               );
//               if (findFinding === -1) {
//                 blankFindingAnotherArray.push(elem);
//               } else {
//                 blankFindingAnotherArray[findFinding].Wt += elem?.Wt;
//                 blankFindingAnotherArray[findFinding].Pcs += elem?.Pcs;
//                 blankFindingAnotherArray[findFinding].Amount += elem?.Amount;
//                 if (elem?.SettingAmount !== null) {
//                   if (blankFindingAnotherArray[findFinding].SettingAmount === null) {
//                     blankFindingAnotherArray[findFinding].SettingAmount = elem?.SettingAmount;
//                   } else {
//                     blankFindingAnotherArray[findFinding].SettingAmount += elem?.SettingAmount;
//                   }
//                 }
//               }
//             });

//             // for metals
//             if (obj.SrJobno === obj.GroupJob) {
//               let objmetals = [];
//               obj.metals.forEach((elee, i) => {
//                 let findMetal = objmetals.findIndex(
//                   (element, index) => element.ShapeName === elee.ShapeName
//                 );
//                 if (findMetal === -1) {
//                   objmetals.push(elee);
//                 } else {
//                   if (
//                     objmetals[findMetal].IsPrimaryMetal !== 1 &&
//                     elee.IsPrimaryMetal === 1
//                   ) {
//                     objmetals[findMetal].QualityName = elee.QualityName;
//                   }
//                   objmetals[findMetal].Wt += elee?.Wt;
//                   objmetals[findMetal].Pcs += elee?.Pcs;
//                   objmetals[findMetal].Amount += elee?.Amount;
//                   objmetals[findMetal].Weight += elee?.Weight;
//                 }
//               });

//               let metals = [...finalArr[findRecord]?.metals].flat();
//               metals.forEach((ell, inn) => {
//                 let newMetal = true;
//                 objmetals.forEach((elel, indd) => {
//                   if (elel.ShapeName === ell.ShapeName) {
//                     elel.Wt += ell?.Wt;
//                     elel.Pcs += ell?.Pcs;
//                     elel.Amount += ell?.Amount;
//                     elel.Weight += ell?.Weight;
//                     newMetal = false;
//                   }
//                 });
//                 if (newMetal) {
//                   objmetals.push(ell);
//                 }
//               });
//               objmetals.sort((a, b) => {
//                 let namea = a?.IsPrimaryMetal;
//                 if (namea !== 0) {
//                   return -1;
//                 } else if (namea === 0) {
//                   return 1;
//                 } else {
//                   return 0;
//                 }
//               });
//               finalArr[findRecord].metals = objmetals;
//             } else if (
//               finalArr[findRecord]?.SrJobno === finalArr[findRecord]?.GroupJob
//             ) {
//               let objmetals = [];
//               finalArr[findRecord].metals.forEach((elee, i) => {
//                 let findMetal = objmetals.findIndex(
//                   (element, index) => element.ShapeName === elee.ShapeName
//                 );
//                 if (findMetal === -1) {
//                   objmetals.push(elee);
//                 } else {
//                   if (
//                     objmetals[findMetal].IsPrimaryMetal !== 1 &&
//                     elee.IsPrimaryMetal === 1
//                   ) {
//                     objmetals[findMetal].QualityName = elee.QualityName;
//                   }
//                   objmetals[findMetal].Wt += elee?.Wt;
//                   objmetals[findMetal].Pcs += elee?.Pcs;
//                   objmetals[findMetal].Amount += elee?.Amount;
//                   objmetals[findMetal].Weight += elee?.Weight;
//                 }
//               });

//               let metals = [...obj?.metals].flat();
//               metals.forEach((ell, inn) => {
//                 let newMetal = true;
//                 objmetals.forEach((elel, indd) => {
//                   if (elel.ShapeName === ell.ShapeName) {
//                     elel.Wt += ell?.Wt;
//                     elel.Pcs += ell?.Pcs;
//                     elel.Amount += ell?.Amount;
//                     elel.Weight += ell?.Weight;
//                     newMetal = false;
//                   }
//                 });
//                 if (newMetal) {
//                   objmetals.push(ell);
//                 }
//               });
//               objmetals.sort((a, b) => {
//                 let namea = a?.IsPrimaryMetal;
//                 // let nameb = b?.IsPrimaryMetal;
//                 if (namea !== 0) {
//                   return -1;
//                 } else if (namea === 0) {
//                   return 1;
//                 } else {
//                   return 0;
//                 }
//               });
//               finalArr[findRecord].metals = objmetals;
//             }

//             // other changes
//             let otherAmountDetails = [
//               finalArr[findRecord].otherAmountDetails,
//               obj.otherAmountDetails,
//             ].flat();
//             let blankOtherAmtDetails = [];

//             otherAmountDetails.forEach((elee, indd) => {
//               let findOther = blankOtherAmtDetails.findIndex(
//                 (elem, index) => elem?.label === elee?.label
//               );
//               if (findOther === -1) {
//                 blankOtherAmtDetails.push(elee);
//               } else {
//                 blankOtherAmtDetails[findOther].value =
//                   +blankOtherAmtDetails[findOther].value + +elee.value;
//               }
//             });
//             finalArr[findRecord].diamonds = blankDiamondArr;
//             finalArr[findRecord].colorStones = blankColorStoneArr;
//             finalArr[findRecord].mics = blankMiscsArr;
//             finalArr[findRecord].miscsList = blankmiscsList;
//             finalArr[findRecord].finding = blankFindingArr;
//             finalArr[findRecord].anotherFinding = blankFindingAnotherArray;

//             // finalArr[findRecord].metals = blankMetalsArr;
//             finalArr[findRecord].otherAmountDetails = blankOtherAmtDetails;
//             finalArr[findRecord].MakingAmount += obj?.MakingAmount;
//             finalArr[findRecord].MaKingCharge_Unit += obj?.MaKingCharge_Unit;
//             finalArr[findRecord].TotalAmount += obj?.TotalAmount;

//             finalArr[findRecord].metalsTotal.amount += obj?.metalsTotal.amount;
//             finalArr[findRecord].metalsTotal.pcs += obj?.metalsTotal.pcs;
//             finalArr[findRecord].metalsTotal.weight += obj?.metalsTotal.weight;
//             finalArr[findRecord].metalsTotal.Wt += obj?.metalsTotal.Wt;

//             finalArr[findRecord].diamondTotal.amount += obj?.diamondTotal.amount;
//             finalArr[findRecord].diamondTotal.pcs += obj?.diamondTotal.pcs;
//             finalArr[findRecord].diamondTotal.weight += obj?.diamondTotal.weight;

//             finalArr[findRecord].colorStonesTotal.amount +=
//               obj?.colorStonesTotal.amount;
//             finalArr[findRecord].colorStonesTotal.pcs +=
//               obj?.colorStonesTotal.pcs;
//             finalArr[findRecord].colorStonesTotal.weight +=
//               obj?.colorStonesTotal.weight;

//             finalArr[findRecord].miscsTotal.amount += obj?.miscsTotal.amount;
//             finalArr[findRecord].miscsTotal.pcs += obj?.miscsTotal.pcs;
//             finalArr[findRecord].miscsTotal.weight += obj?.miscsTotal.weight;
//             if (finalArr[findRecord].metals[0]) {
//               finalArr[findRecord].metals[0].Wt =
//                 finalArr[findRecord].metals[0].Wt -
//                 (finalArr[findRecord].findingTotal + obj?.findingTotal);
//             }
//             // finalArr[findRecord].metals[0].Wt = finalArr[findRecord].findingTotal +obj?.findingTotal ;
//             finalArr[findRecord].findingTotal += obj?.findingTotal;
//             // diamondTotal
//           }
//         }
//       });

//       let finalArr2 = [];
//       finalArr.forEach((e, i) => {
//         let labourArr = [];
//         let labouurTotal = 0;
//         labourArr.push({ label: e?.MaKingCharge_Unit, value: e?.MakingAmount });
//         e?.anotherFinding?.forEach((ele, ind) => {
//           if (ele?.SettingRate === e?.MaKingCharge_Unit) {
//             let findobj = labourArr?.findIndex((elem, index) => elem?.label === e?.MaKingCharge_Unit);
//             if (findobj === -1) {
//               labourArr.push({ label: e?.MaKingCharge_Unit, value: e?.MakingAmount + ele?.SettingAmount });
//               labouurTotal += e?.MakingAmount + ele?.SettingAmount;
//             } else {
//               if (ele?.SettingAmount !== null && ele?.SettingAmount !== 0) {
//                 labourArr[findobj].value += ele?.SettingAmount;
//                 labouurTotal += ele?.SettingAmount;
//               }
//             }
//           } else {
//             if (ele?.SettingAmount !== null && ele?.SettingAmount !== 0) {
//               labourArr.push({ label: ele?.SettingRate, value: ele?.SettingAmount });
//               labouurTotal += ele?.SettingAmount;
//             }
//           }
//         });
//         if (labourArr.length === 0) {
//           labourArr.push({ label: e?.MaKingCharge_Unit, value: e?.MakingAmount });
//         }
//         let diaCs = [...e?.diamonds, ...e?.colorStones]?.flat();
//         let diacsAmount = diaCs?.reduce((accc, cobj) => {
//           if (cobj?.SettingAmount !== null) {
//             return accc + cobj?.SettingAmount
//           } else {
//             return accc
//           }
//         }, 0);
//         if (diacsAmount !== 0) {
//           labourArr.push({ label: "Setting", value: diacsAmount });
//           labouurTotal += diacsAmount;
//         }
//         let obj = cloneDeep(e);
//         obj.labourArr = labourArr;
//         obj.labouurTotal = labouurTotal;
//         finalArr2.push(obj);
//       });

//       finalArr2.sort((a, b) => {
//         const nameA = a.SrJobno.toUpperCase();
//         const nameB = b.SrJobno.toUpperCase();

//         if (nameA < nameB) {
//           return -1;
//         }

//         if (nameA > nameB) {
//           return 1;
//         }

//         return 0;
//       });

//       finalArr2?.forEach((e) => {

//         let finalArr3 = [];

//         e?.diamonds?.forEach((el) => {
//           let eem = cloneDeep(el);
//           let findrec = finalArr3?.findIndex((a) => a?.Rate === eem?.Rate &&
//           a?.ShapeName === eem?.ShapeName &&
//           a?.SizeName === eem?.SizeName &&
//           a?.QualityName === eem?.QualityName &&
//           a?.Colorname === eem?.Colorname)
//           if(findrec === -1){
//             // let obj = {...eem};
//             // obj.wt = eem?.Wt;
//             // obj.pcs = eem?.Pcs;
//             // obj.amount = eem?.Amount;
//             finalArr3.push(eem);
//           }else{
//             finalArr3[findrec].Wt += eem?.Wt;
//             finalArr3[findrec].Pcs += eem?.Pcs;
//             finalArr3[findrec].Amount += eem?.Amount;
//             finalArr3[findrec].SizeName = eem?.SizeName;
//           }
//         })

//         e.diamonds = finalArr3;

//         let clr = [];

//         e?.colorStones?.forEach((el) => {
//           let eem = cloneDeep(el);
//           let findrec = clr?.findIndex((a) => a?.Rate === eem?.Rate &&
//           a?.ShapeName === eem?.ShapeName &&
//           a?.SizeName === eem?.SizeName &&
//           a?.QualityName === eem?.QualityName &&
//           a?.Colorname === eem?.Colorname)
//           if(findrec === -1){
//             // let obj = {...eem};
//             // obj.wt = eem?.Wt;
//             // obj.pcs = eem?.Pcs;
//             // obj.amount = eem?.Amount;
//             clr.push(eem);
//           }else{
//             clr[findrec].Wt += eem?.Wt;
//             clr[findrec].Pcs += eem?.Pcs;
//             clr[findrec].Amount += eem?.Amount;
//             clr[findrec].SizeName = eem?.SizeName;
//           }
//         })

//         e.colorStones = clr;

//         let miscs = [];

//         e?.mics?.forEach((el) => {
//           let eem = cloneDeep(el);
//           let findrec = miscs?.findIndex((a) => a?.Rate === eem?.Rate &&
//           a?.ShapeName === eem?.ShapeName &&
//           a?.SizeName === eem?.SizeName &&
//           a?.QualityName === eem?.QualityName &&
//           a?.Colorname === eem?.Colorname)
//           if(findrec === -1){
//             // let obj = {...eem};
//             // obj.wt = eem?.Wt;
//             // obj.pcs = eem?.Pcs;
//             // obj.amount = eem?.Amount;
//             miscs.push(eem);
//           }else{
//             miscs[findrec].Wt += eem?.Wt;
//             miscs[findrec].Pcs += eem?.Pcs;
//             miscs[findrec].Amount += eem?.Amount;
//             miscs[findrec].SizeName = eem?.SizeName;
//           }
//         })

//         e.mics = miscs;

//       })

//       setJson2Data(finalArr2);
//     };

//     const loadData = (data) => {
//       setJson1Data(data?.BillPrint_Json[0]);
//       caiculateMaterial(data);
//     };

//     useEffect(() => {
//       const sendData = async () => {
//         try {
//           const data = await apiCall(token, invoiceNo, printName, urls, evn, ApiVer);
//           if (data?.Status === "200") {
//             let isEmpty = isObjectEmpty(data?.Data);
//             if (!isEmpty) {
//               loadData(data?.Data);
//               setLoader(false);
//             } else {
//               setLoader(false);
//               setMsg("Data Not Found");
//             }
//           } else {
//             setLoader(false);
//             // setMsg(data?.Message);
//             const err = checkMsg(data?.Message);
//                       console.log(data?.Message);
//                       setMsg(err);
//           }
//         } catch (error) {
//           console.error(error);
//         }
//       };
//       sendData();
//     }, []);

//     const handleImageLoad = () => {
//       setImageLoading(false);
//     };

//     console.log('json2Datajson2Data', json2Data);

//     return (
//       <>
//         {loader ? (
//           <Loader />
//         ) : msg === "" ? (
//           <div className="container containerEstimate pad_60_allPrint">
//             {/* print button */}
//             <div className="d-flex justify-content-end align-items-center print_sec_sum4 pb-4 mt-5 w-100">

//               <div className="form-check ps-3">
//                 <input
//                   type="button"
//                   className="btn_white blue mt-0"
//                   value="Print"
//                   onClick={(e) => handlePrint(e)}
//                 />
//               </div>
//             </div>
//             {/* print name */}
//             <div className={`border p-1 mt-1 border-2 min_height_label lightGrey border_color_estimate`} >
//               <p className="text-uppercase fw-bold estimatePrintFont_14" >
//                 {json1Data?.PrintHeadLabel === '' ? 'ORDER REQUEST' : json1Data?.PrintHeadLabel}
//               </p>
//             </div>
//             {/* customer detail */}
//             <div className="py-2 d-flex justify-content-between px-1">
//               <div>
//                 <p className="estimatePrintFont_14">To,</p>
//                 <p className="fw-bold estimatePrintFont_14">{json1Data?.Customercode}</p>
//               </div>
//               <div>
//                 <div className="d-flex justify-conetnt-between">
//                   <p className="mainDetailEstimate text-end pe-3">Order# : </p>
//                   <p className="fw-bold">{json1Data?.InvoiceNo}</p>
//                 </div>
//                 <div className="d-flex justify-conetnt-between">
//                   <p className="mainDetailEstimate text-end pe-3">Date : </p>
//                   <p className="fw-bold">{json1Data?.EntryDate}</p>
//                 </div>

//               </div>
//             </div>
//             {console.log(json1Data)}
//             <div className="my-2 w-100">
//               {/* heading */}
//               <div className="border-start border-top border-end d-flex border-bottom recordEstimatePrint overflow-hidden border-black lightGrey">
//                 <div className="srNoEstimatePrint border-end px-1 d-flex align-items-center justify-content-center border_color_estimates">
//                   <p className="fw-bold">Sr</p>
//                 </div>
//                 <div className="designEstimatePrint border-end px-1 d-flex align-items-center justify-content-center border_color_estimates">
//                   <p className="fw-bold">Design</p>
//                 </div>
//                 <div className="diamondEstimatePrint border-end border_color_estimates">
//                   <div className="p-1 text-center border-bottom border_color_estimates">
//                     <p className="fw-bold">Diamond</p>
//                   </div>
//                   <div className="d-flex h-100">
//                     <div className="width20EstimatePrint px-1 border-end border_color_estimates">
//                       <p className="text-center fw-bold">Code</p>
//                     </div>
//                     <div className="width20EstimatePrint px-1 border-end border_color_estimates">
//                       <p className="text-center fw-bold">Size</p>
//                     </div>
//                     <div className="width20EstimatePrint px-1 border-end border_color_estimates">
//                       <p className="text-center fw-bold">Pcs</p>
//                     </div>
//                     <div className="width20EstimatePrint px-1 border-end border_color_estimates">
//                       <p className="text-center fw-bold">Wt</p>
//                     </div>
//                     <div className="width20EstimatePrint px-1 border-end border_color_estimates">
//                       <p className="text-center fw-bold">Rate</p>
//                     </div>
//                     <div className="width20EstimatePrint px-1">
//                       <p className="text-center fw-bold">Amount</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="metalEstimatePrint border-end border_color_estimates">
//                   <div className="p-1 text-center border-bottom border_color_estimates">
//                     <p className="fw-bold">Metal</p>
//                   </div>
//                   <div className="d-flex h-100">
//                     <div className="width_40_estimatePrint px-1 border-end border_color_estimates">
//                       <p className="text-center fw-bold">Quality</p>
//                     </div>
//                     <div className="width_40_estimatePrint px-1 border-end border_color_estimates">
//                       <p className="text-center fw-bold">*Wt</p>
//                     </div>
//                     <div className="width_40_estimatePrint px-1 border-end border_color_estimates">
//                       <p className="text-center fw-bold">Net Wt</p>
//                     </div>
//                     <div className="width_40_estimatePrint px-1 border-end border_color_estimates">
//                       <p className="text-center fw-bold">Rate</p>
//                     </div>
//                     <div className="width_40_estimatePrint px-1">
//                       <p className="text-center fw-bold">Amount</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="stoneEstimatePrint border-end border_color_estimates">
//                   <div className="p-1 text-center border-bottom border_color_estimates">
//                     <p className="fw-bold">Stone</p>
//                   </div>
//                   <div className="d-flex h-100">
//                     <div className="width20EstimatePrint px-1 border-end border_color_estimates">
//                       <p className="text-center fw-bold">Code</p>
//                     </div>
//                     <div className="width20EstimatePrint px-1 border-end border_color_estimates">
//                       <p className="text-center fw-bold">Size</p>
//                     </div>
//                     <div className="width20EstimatePrint px-1 border-end border_color_estimates">
//                       <p className="text-center fw-bold">Pcs</p>
//                     </div>
//                     <div className="width20EstimatePrint px-1 border-end border_color_estimates">
//                       <p className="text-center fw-bold">Wt</p>
//                     </div>
//                     <div className="width20EstimatePrint px-1 border-end border_color_estimates">
//                       <p className="text-center fw-bold">Rate</p>
//                     </div>
//                     <div className="width20EstimatePrint px-1">
//                       <p className="text-center fw-bold">Amount</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="OtherAmountEstimatePrint border-end border_color_estimates px-1 d-flex align-items-center justify-content-center flex-wrap">
//                   <p className="text-center fw-bold">Other &nbsp;</p>
//                   <p className="text-center fw-bold">Amount </p>
//                 </div>
//                 <div className="labourEstimatePrint border-end border_color_estimates">
//                   <div className="px-1 text-center border-bottom border_color_estimates">
//                     <p className="fw-bold">Labour</p>
//                   </div>
//                   <div className="d-flex h-100">
//                     <div className="col px-1 border-end border_color_estimates text-center">
//                       <p className="fw-bold">Rate</p>
//                     </div>
//                     <div className="col px-1 text-center">
//                       <p className="fw-bold">Amount</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="totalAmountEstimatePrint p-1 d-flex align-items-center justify-content-center flex-wrap">
//                   <p className="text-center fw-bold">Total &nbsp;</p>
//                   <p className="text-center fw-bold">Amount </p>
//                 </div>
//               </div>
//               {/* data */}
//               {/* <div className="border-end border-start border-black"> */}
//               <div>
//                 {json2Data.length > 0 &&
//                   json2Data.map((e, i) => {

//                     return (
//                       <div
//                         className={`d-flex border-bottom recordEstimatePrint overflow-hidden word_break_estimatePrint`}
//                         key={i}
//                         style={{borderLeft:'1px solid black', borderRight:'1px solid black'}}
//                       >
//                         <div className="srNoEstimatePrint border-end p_1Estimate border_color_estimates">
//                           <p className="text-center">{i + 1}</p>
//                         </div>
//                         <div className="designEstimatePrint border-end  border_color_estimates d-flex justify-content-between flex-column">
//                           <div className="d-flex justify-content-between p_1Estimate">
//                             <div>{e?.designno}</div>
//                             <div className="text-end">
//                               <p>{e?.J_JobNo}</p>
//                             </div>
//                           </div>
//                           <div className="pb-2 p_1Estimate">
//                             {image && (
//                               <>
//                                 {/* {imageLoading && <Loader2 />} */}
//                                 {
//                                   <img
//                                     src={e?.DesignImage}
//                                     alt=""
//                                     className="estimate_img mx-auto d-block text-center"
//                                     onError={handleImageError}
//                                     onLoad={handleImageLoad}
//                                     style={{
//                                       display: imageLoading ? "none" : "block",
//                                     }}
//                                   />
//                                 }
//                               </>
//                             )}
//                           </div>
//                           <div className="totalBgEstimatePrint  border-top border_color_estimates">
//                             <p className="w-100 fw-bold" style={{padding: '1px 0px 1px 5px'}}>{e?.MetalColor}</p>
//                             { e?.Size !== '' && <p className="w-100 ps-1 fw-bold">Size : {e?.Size}</p>}
//                             { (e?.PromiseDate !== '' && e?.PromiseDate !== null) && <p className="w-100 ps-1 fw-bold">PR Date : {e?.PromiseDate}</p>}
//                           </div>

//                         </div>
//                         <div className="diamondEstimatePrint border-end position-relative border_color_estimates">
//                           {/* <div className='h-100 d-grid pad_bot_29_estimatePrint'> */}
//                           <div className="pad_bot_29_estimatePrint">
//                             {e?.diamonds.length > 0 &&
//                               e?.diamonds.map((ele, ind) => {
//                                 return (
//                                   <div className="d-flex " key={ind}>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p className="">
//                                         {ele?.ShapeName} {ele?.QualityName}{" "}
//                                         {ele?.Colorname}
//                                       </p>
//                                     </div>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p className="">{ele?.SizeName}</p>
//                                     </div>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p className="text-end">
//                                         {NumberWithCommas(ele?.Pcs, 0)}
//                                       </p>
//                                     </div>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p className="text-end">
//                                         {fixedValues(ele?.Wt, 3)}
//                                       </p>
//                                     </div>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p className="text-end">
//                                         {NumberWithCommas(ele?.Rate, 2)}
//                                       </p>
//                                     </div>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p className="fw-bold text-end">
//                                         {NumberWithCommas(ele?.Amount, 2)}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 );
//                               })}
//                           </div>
//                           <div
//                             className={`d-flex totalBgEstimatePrint position-absolute bottom-0 height_28_5_estimatePrint w-100 border-top border_color_estimates ${e?.diamonds.length === 0 &&
//                               "border-top height_28_5_estimatePrint border_color_estimates"
//                               }`}
//                           >
//                             <div className="width20EstimatePrint p_1Estimate">
//                               <p className="fw-bold"></p>
//                             </div>
//                             <div className="width20EstimatePrint p_1Estimate">
//                               <p className="fw-bold"></p>
//                             </div>
//                             <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
//                               <p className="text-end fw-bold">
//                                 {e?.diamonds.length !== 0 && (
//                                   <>{NumberWithCommas(e?.diamondTotal?.pcs, 0)}</>
//                                 )}
//                               </p>
//                             </div>
//                             <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
//                               <p className="text-end fw-bold">
//                                 {e?.diamonds.length !== 0 && (
//                                   <>{fixedValues(e?.diamondTotal?.weight, 3)}</>
//                                 )}
//                               </p>
//                             </div>
//                             <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
//                               <p className="text-end fw-bold"></p>
//                             </div>
//                             <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
//                               <p className="text-end fw-bold">
//                                 {e?.diamonds.length !== 0 && (
//                                   <>
//                                     {NumberWithCommas(e?.diamondTotal?.amount, 2)}
//                                   </>
//                                 )}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="metalEstimatePrint border-end position-relative border_color_estimates">
//                           {/* <div className='h-100 d-grid pad_bot_29_estimatePrint'> */}
//                           <div className="pad_bot_29_estimatePrint">
//                             {e?.metals.length > 0 &&
//                               e?.metals.map((ele, ind) => {
//                                 return (
//                                   <div className="d-flex" key={ind}>
//                                     <div className="width_40_estimatePrint p_1Estimate">
//                                       <p className="">
//                                         {ele?.ShapeName} {ele?.QualityName}
//                                       </p>
//                                     </div>
//                                     <div className="width_40_estimatePrint p_1Estimate">
//                                       <p className="text-end ">
//                                         {ind === 0
//                                           ? fixedValues(e?.WtSpecial, 3)
//                                           : fixedValues(ele?.Weight, 3)}
//                                       </p>
//                                     </div>
//                                     <div className="width_40_estimatePrint p_1Estimate">
//                                       <p className="text-end ">
//                                         {ind === 0 ? fixedValues(e?.metalNetWt, 3) : fixedValues(ele?.Wt, 3)}
//                                       </p>
//                                     </div>
//                                     <div className="width_40_estimatePrint p_1Estimate">
//                                       <p className="text-end ">
//                                         {NumberWithCommas(ele?.Rate, 2)}
//                                       </p>
//                                     </div>
//                                     <div className="width_40_estimatePrint p_1Estimate">
//                                       <p className="text-end ">
//                                         {NumberWithCommas(ele?.MetalAmount, 2)}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 );
//                               })}
//                             {e?.finding.length > 0 &&
//                               e?.finding.map((ele, ind) => {
//                                 return (
//                                   <div className="d-flex" key={ind}>
//                                     <div className="width_40_estimatePrint p_1Estimate">
//                                       <p className="">
//                                         {ele?.FindingAccessories}
//                                       </p>
//                                     </div>
//                                     <div className="width_40_estimatePrint p_1Estimate">
//                                       <p className="text-end ">
//                                         {fixedValues(ele?.Wt, 3)}
//                                       </p>
//                                     </div>
//                                     <div className="width_40_estimatePrint p_1Estimate">
//                                       <p className="text-end ">
//                                         {fixedValues(ele?.Wt, 3)}
//                                       </p>
//                                     </div>
//                                     <div className="width_40_estimatePrint p_1Estimate">
//                                       <p className="text-end ">
//                                         {NumberWithCommas(ele?.Rate, 2)}
//                                       </p>
//                                     </div>
//                                     <div className="width_40_estimatePrint p_1Estimate">
//                                       <p className="text-end ">
//                                         {NumberWithCommas(ele?.Amount, 2)}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 );
//                               })}
//                             {e?.JobRemark !== "" && <div className="pt-2 px-1">
//                               <p>Remark:</p>
//                               <p className="fw-bold">  {e?.JobRemark}</p>
//                             </div>}
//                           </div>
//                           <div
//                             className={`d-flex totalBgEstimatePrint position-absolute bottom-0 height_28_5_estimatePrint w-100 border-top border_color_estimates ${e?.metals.length === 0 &&
//                               "border-top height_28_5_estimatePrint"
//                               }`}
//                           >
//                             <div className="width200EstimatePrint p_1Estimate">
//                               <p></p>
//                             </div>
//                             {/* <div className='width200EstimatePrint p_1Estimate d-flex align-items-center justify-content-end'><p className='text-end fw-bold'>{fixedValues(e?.metalsTotal?.weightWithDiamondLoss, 3)}</p></div> */}
//                             <div className="width200EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
//                               <p className="text-end fw-bold">
//                                 {fixedValues(e?.metalsTotal?.weight, 3)}
//                               </p>
//                             </div>
//                             {/* <div className='width200EstimatePrint p_1Estimate d-flex align-items-center justify-content-end'><p className='text-end fw-bold'>{fixedValues(e?.metalsTotal?.Wt, 3)}</p></div> */}
//                             <div className="width200EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
//                               <p className="text-end fw-bold">
//                                 {fixedValues(e?.NetWt + e?.LossWt, 3)}
//                               </p>
//                             </div>
//                             {/* <div className="width200EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
//                               <p className="text-end fw-bold"></p>
//                             </div> */}
//                             <div className="width200EstimatePrint p_1Estimate d-flex align-items-center justify-content-end" style={{minWidth:'40%', width:'40%'}}>
//                               <p className="text-end fw-bold">
//                                 {NumberWithCommas(e?.primaryMetalAmount, 2)}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="stoneEstimatePrint border-end position-relative border_color_estimates">
//                           {/* <div className='h-100 d-grid pad_bot_29_estimatePrint'> */}
//                           <div className="pad_bot_29_estimatePrint">
//                             {e?.colorStones.length > 0 &&
//                               e?.colorStones.map((ele, ind) => {
//                                 return (
//                                   <div className="d-flex " key={ind}>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p>
//                                         {ele?.ShapeName} {ele?.QualityName}{" "}
//                                         {ele?.Colorname}
//                                       </p>
//                                     </div>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p className="">{ele?.SizeName}</p>
//                                     </div>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p className="text-end">
//                                         {ele?.Pcs > 0 && NumberWithCommas(ele?.Pcs, 0)}
//                                       </p>
//                                     </div>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p className="text-end">
//                                         {ele?.Wt > 0 && fixedValues(ele?.Wt, 3)}
//                                       </p>
//                                     </div>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p className="text-end">
//                                         { NumberWithCommas(ele?.Rate, 2)}
//                                       </p>
//                                     </div>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p className="fw-bold text-end">
//                                         { NumberWithCommas(ele?.Amount, 2)}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 );
//                               })}
//                             {e?.mics.length > 0 &&
//                               e?.mics.map((ele, ind) => {
//                                 return (
//                                   <div className="d-flex" key={ind}>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p>
//                                         M: {ele?.ShapeName} {ele?.QualityName}{" "}
//                                         {/* {ele?.Colorname} */}
//                                       </p>
//                                     </div>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p className="">{ele?.SizeName}</p>
//                                     </div>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p className="text-end">
//                                         {ele?.Pcs > 0 && NumberWithCommas(ele?.Pcs, 0)}
//                                       </p>
//                                     </div>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p className="text-end">
//                                         {ele?.Wt > 0 && fixedValues(ele?.Wt, 3)}
//                                       </p>
//                                     </div>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p className="text-end">
//                                         { NumberWithCommas(ele?.Rate, 2)}
//                                       </p>
//                                     </div>
//                                     <div className="width20EstimatePrint p_1Estimate">
//                                       <p className="fw-bold text-end">
//                                         { NumberWithCommas(ele?.Amount, 2)}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 );
//                               })}
//                           </div>
//                           <div
//                             className={`d-flex totalBgEstimatePrint position-absolute bottom-0 height_28_5_estimatePrint w-100 border-top height_28_5_estimatePrint border_color_estimates `}
//                           >
//                             <div className="width20EstimatePrint p_1Estimate">
//                               <p></p>
//                             </div>
//                             <div className="width20EstimatePrint p_1Estimate">
//                               <p></p>
//                             </div>
//                             <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
//                               <p className="text-end fw-bold">
//                                 {(e?.colorStones?.length > 0 ||
//                                   e?.mics.length > 0) && (
//                                     <>
//                                       {NumberWithCommas(
//                                         e?.colorStonesTotal?.pcs +
//                                         e?.miscsTotal?.pcs,
//                                         0
//                                       )}
//                                     </>
//                                   )}
//                               </p>
//                             </div>
//                             <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
//                               <p className="text-end fw-bold">
//                                 {(e?.colorStones.length > 0 ||
//                                   e?.mics.length > 0) && (
//                                     <>
//                                       {fixedValues(
//                                         e?.colorStonesTotal?.weight +
//                                         e?.miscsTotal?.weight,
//                                         3
//                                       )}
//                                     </>
//                                   )}
//                               </p>
//                             </div>
//                             <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
//                               <p className="text-end fw-bold"></p>
//                             </div>
//                             <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
//                               <p className="text-end fw-bold">
//                                 {((e?.colorStones?.length + e?.mics?.length) > 0) && (
//                                     <>
//                                       {NumberWithCommas(
//                                         e?.colorStonesTotal?.amount +
//                                         e?.miscsTotal?.amount,
//                                         2
//                                       )}
//                                     </>
//                                   )}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="OtherAmountEstimatePrint border-end position-relative border_color_estimates">
//                           <div className="h-100 d-grid pad_bot_29_estimatePrint" >
//                             <div className="p_1Estimate border_color_estimates ">
//                               {/* <p className='text-center'>Certification Charge 5,227.00 </p> */}
//                               {/* {e?.otherAmountDetails.length > 0 &&
//                                 e?.otherAmountDetails.map((ele, ind) => {
//                                   return ( +ele?.value !== 0 && <div className="d-flex word_break_estimate "
//                                       key={ind}
//                                     >
//                                       <p className="p_1Estimate w-100 word_break" key={ind}>
//                                         {ele?.label}{" "}
//                                         <span className="float-end">
//                                           {ele?.value}
//                                         </span>{" "}
//                                       </p>
//                                     </div>
//                                 )
//                                 })} */}
//                               {/* {e?.miscsList?.map((ele, ind) => {
//                                 return (
//                                   +ele?.Amount !== 0 && <div
//                                     className="d-flex word_break_estimate "
//                                     key={ind}
//                                   >
//                                     <p className="p_1Estimate w-100 word_break" key={ind}>
//                                       {ele?.ShapeName}{" "}
//                                       <span className="float-end">
//                                         {NumberWithCommas(ele?.Amount, 2)}
//                                       </span>{" "}
//                                     </p>
//                                   </div>
//                                 )
//                               })} */}
//                               {/* <p className='p_1Estimate'>Total Diamond Handling: {NumberWithCommas(e?.TotalDiamondHandling, 2)}</p> */}
//                               {/* {e?.TotalDiamondHandling !== 0 && (
//                                 <p className="p_1Estimate word_break">
//                                   Handling
//                                   <span className="float-end">  {NumberWithCommas(e?.TotalDiamondHandling, 2)}</span>
//                                 </p>
//                               )} */}
//                               <div className="w-100 d-flex align-items-center justify-content-end">
//                               {NumberWithCommas(e?.OtherCharges, 2)}
//                               </div>
//                             </div>
//                           </div>
//                           <div className="totalBgEstimatePrint position-absolute bottom-0 height_28_5_estimatePrint w-100 d-flex align-items-center justify-content-end border-top border_color_estimates" style={{ height: "14.5px" }}>
//                             <div className="text-end p_1Estimate">
//                               <p className="fw-bold">
//                                 {/* {NumberWithCommas(e?.otherChargesTotal, 2)} */}
//                                 {NumberWithCommas(e?.OtherCharges, 2)}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="labourEstimatePrint border-end position-relative border_color_estimates">
//                           <div className="h-100 d-grid pad_bot_29_estimatePrint">
//                             <div className="d-flex  border_color_estimates">
//                               {/* <div className='w-50 text-end p_1Estimate'><p>{NumberWithCommas(e?.MaKingCharge_Unit, 2)}</p><p>{NumberWithCommas(e?.settingRate, 2)}</p></div> */}
//                               {e?.MakingAmount !== 0 && (
//                                 <>
//                                   {" "}
//                                   <div className="w-50 p_1Estimate">
//                                     {/* <p>{NumberWithCommas(e?.MaKingCharge_Unit, 2)}</p> */}
//                                     {/* <p>Labour</p>
//                                     {e?.settingAmount !== 0 && <p>Labour</p>} */}
//                                     {e?.labourArr?.map((ele, ind) => {
//                                       return <p key={ind}>{NumberWithCommas(+ele?.label, 2) !== "NaN" ? NumberWithCommas(+ele?.label, 2) : ele?.label}</p>
//                                     })}
//                                   </div>
//                                   <div className="w-50 text-end p_1Estimate">
//                                     {/* <p>{NumberWithCommas(e?.MakingAmount, 2)}</p>
//                                     {e?.settingAmount !== 0 && (
//                                       <p>
//                                         {NumberWithCommas(e?.settingAmount, 2)}
//                                       </p>
//                                     )} */}
//                                     {e?.labourArr?.map((ele, ind) => {
//                                       return <p key={ind}>{NumberWithCommas(ele?.value, 2)}</p>
//                                     })}
//                                   </div>
//                                 </>
//                               )}
//                             </div>
//                           </div>
//                           <div className="totalBgEstimatePrint position-absolute bottom-0 height_28_5_estimatePrint w-100 d-flex align-items-center justify-content-end border-top border_color_estimates" style={{ height: "14.5px" }}>
//                             <div className="">
//                               <p className="text-end p_1Estimate fw-bold">
//                                 {NumberWithCommas(e?.totalSetttingAmount, 2)}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="totalAmountEstimatePrint position-relative">
//                           <div className="h-100 d-grid pad_bot_29_estimatePrint">
//                             <div className="border_color_estimates">
//                               <p className="text-end p_1Estimate pe-1 fw-bold">
//                                 {NumberWithCommas(e?.TotalAmount, 2)}
//                               </p>
//                             </div>
//                           </div>
//                           <div className="totalBgEstimatePrint position-absolute bottom-0  height_28_5_estimatePrint w-100 d-flex align-items-center justify-content-end pe-1 border-top border_color_estimates" >
//                             <div className="text-end p_1Estimate">
//                               <p className="fw-bold">
//                                 {/* <span
//                                   dangerouslySetInnerHTML={{
//                                     __html: json1Data?.Currencysymbol,
//                                   }}
//                                 ></span> */}
//                                 {NumberWithCommas(e?.TotalAmount, 2)}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//               </div>
//               {/* cgst */}
//               <div className="border-black border-end border-start">
//                 <div className="d-flex  recordEstimatePrint overflow-hidden border-bottom border_color_estimates">
//                   <div className="srNoEstimatePrint p_1Estimate"></div>
//                   <div className="designEstimatePrint p_1Estimate"></div>
//                   <div className="diamondEstimatePrint position-relative"></div>
//                   <div className="metalEstimatePrint position-relative"></div>
//                   <div className="stoneEstimatePrint position-relative"></div>
//                   <div className="OtherAmountEstimatePrint position-relative"></div>
//                   <div className="labourEstimatePrint border-end border_color_estimates">
//                     {total?.discountAmt !== 0 && (
//                       <div className="text-end">
//                         <p>Total Discount</p>
//                       </div>
//                     )}
//                     {total.previeligeCardDisocunt !== 0 && (
//                       <div className="text-end">
//                         <p>Privilege Card Discount </p>
//                       </div>
//                     )}
//                     <div className="text-end">
//                       {taxes.length > 0 &&
//                         taxes.map((e, i) => {
//                           return (
//                             <p key={i}>
//                               {e?.name} @ {e?.per}
//                             </p>
//                           );
//                         })}
//                       {json1Data?.AddLess !== 0 && (
//                         <p>{json1Data?.AddLess < 0 ? "Less" : "Add"}</p>
//                       )}
//                     </div>
//                   </div>
//                   <div className="totalAmountEstimatePrint">
//                     {total?.discountAmt !== 0 && (
//                       <div className="text-end">
//                         <p>{NumberWithCommas(total?.discountAmt, 2)}</p>
//                       </div>
//                     )}
//                     {total.previeligeCardDisocunt !== 0 && (
//                       <div className="text-end">
//                         <p>{NumberWithCommas(total.previeligeCardDisocunt, 2)}</p>
//                       </div>
//                     )}
//                     <div className="text-end">
//                       {taxes.length > 0 &&
//                         taxes.map((e, i) => {
//                           return <p key={i}>{NumberWithCommas(e?.amount, 2)}</p>;
//                         })}
//                       {/* <p>{total?.cgstAmount}</p> */}
//                       {/* <p>{total?.sgstAmount}</p> */}
//                       {json1Data?.AddLess !== 0 && (
//                         <p>{NumberWithCommas(json1Data?.AddLess, 2)}</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               {/* total */}
//               <div className="d-flex recordEstimatePrint overflow-hidden border-end border-start border-bottom  border-black totalBgEstimatePrint">
//                 <div className="totalEstimatePrint border-end totalBgEstimatePrint border_color_estimates">
//                   <p className="text-center fw-bold h-100">Total</p>
//                 </div>
//                 <div className="diamondEstimatePrint border-end border_color_estimates">
//                   <div className="d-flex  w-100">
//                     <div className="width20EstimatePrint p_1Estimate h-100">
//                       <p></p>
//                     </div>
//                     <div className="width20EstimatePrint p_1Estimate h-100">
//                       <p></p>
//                     </div>
//                     <div className="width20EstimatePrint p_1Estimate h-100">
//                       <p className="text-end fw-bold">
//                         {diamondTotal?.Pcs > 0 && NumberWithCommas(diamondTotal?.Pcs, 0)}
//                       </p>
//                     </div>
//                     <div className="width20EstimatePrint p_1Estimate h-100">
//                       <p className="text-end fw-bold">
//                         {diamondTotal?.Wt > 0 && NumberWithCommas(diamondTotal?.Wt, 3)}
//                       </p>
//                     </div>
//                     <div className="width20EstimatePrint p_1Estimate h-100"></div>
//                     <div className="width20EstimatePrint p_1Estimate h-100">
//                       <p className="text-end fw-bold">
//                         {NumberWithCommas(diamondTotal?.Amount, 2)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="metalEstimatePrint border-end border_color_estimates">
//                   <div className="d-flex totalBgEstimatePrint bottom-0 w-100">
//                     <div className="width200EstimatePrint p_1Estimate h-100">
//                       <p className="fw-bold fw-bold"></p>
//                     </div>
//                     <div className="width200EstimatePrint p_1Estimate h-100">
//                       <p className="fw-bold fw-bold text-end">
//                         {total?.weightWithDiamondLoss !== 0 && fixedValues(total?.weightWithDiamondLoss, 3)}
//                       </p>
//                     </div>
//                     <div className="width200EstimatePrint p_1Estimate h-100">
//                       <p className="fw-bold fw-bold text-end">
//                         {/* {fixedValues(total?.finalMetalsTotal?.Wt, 3)} */}
//                         {total?.gdWt !== 0 && NumberWithCommas(total?.gdWt, 3)}
//                       </p>
//                     </div>
//                     {/* <div className='width200EstimatePrint p_1Estimate h-100'><p className='fw-bold fw-bold text-end'>{NumberWithCommas(total?.finalMetalsTotal?.rate, 2)}</p></div> */}
//                     {/* <div className="width200EstimatePrint p_1Estimate h-100">
//                       <p className="fw-bold fw-bold text-end"></p>
//                     </div> */}
//                     <div className="width200EstimatePrint p_1Estimate h-100" style={{minWidth:'40%', width:'40%'}}>
//                       <p className="fw-bold fw-bold text-end">
//                         {total?.finalMetalsTotal?.amount !== 0 && NumberWithCommas(total?.finalMetalsTotal?.amount, 2)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="stoneEstimatePrint border-end border_color_estimates">
//                   <div className="d-flex totalBgEstimatePrint bottom-0 w-100">
//                     <div className="width20EstimatePrint p_1Estimate h-100">
//                       <p className="fw-bold"></p>
//                     </div>
//                     <div className="width20EstimatePrint p_1Estimate h-100">
//                       <p className="fw-bold"></p>
//                     </div>
//                     <div className="width20EstimatePrint p_1Estimate h-100">
//                       <p className="text-end fw-bold">
//                         {colorStoneMiscTotal?.Pcs !== 0 && NumberWithCommas(
//                           colorStoneMiscTotal?.Pcs,
//                           0
//                         )}
//                       </p>
//                     </div>
//                     <div className="width20EstimatePrint p_1Estimate h-100">
//                       <p className="text-end fw-bold">
//                         {colorStoneMiscTotal?.Wt !== 0 && fixedValues(
//                           colorStoneMiscTotal?.Wt,
//                           3
//                         )}
//                       </p>
//                     </div>
//                     <div className="width20EstimatePrint p_1Estimate h-100"></div>
//                     <div className="width20EstimatePrint p_1Estimate h-100">
//                       <p className="text-end fw-bold">
//                         {NumberWithCommas(
//                           colorStoneMiscTotal?.Amount,
//                           2
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="OtherAmountEstimatePrint border-end border_color_estimates">
//                   <div className="totalBgEstimatePrint bottom-0 w-100 h-100">
//                     <div className="h-100 text-end p_1Estimate">
//                       <p className="fw-bold">
//                         {/* {total?.otherAmount !== 0 && NumberWithCommas(total?.otherAmount, 2)} */}
//                         {formatAmount(otherCharges)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="labourEstimatePrint border-end border_color_estimates">
//                   <div className="d-flex  w-100 h-100 justify-content-end">
//                     <div className="p_1Estimate fw-bold">
//                       <p>{total?.labourAmount !== 0 && NumberWithCommas(total?.labourAmount, 2)}</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="totalAmountEstimatePrint d-flex">
//                   <div className="totalBgEstimatePrint w-100 h-100">
//                     <div className="text-end p_1Estimate">
//                       <p className="fw-bold">
//                         <span
//                           dangerouslySetInnerHTML={{
//                             __html: json1Data?.Currencysymbol,
//                           }}
//                         ></span>
//                         {total?.finalAmount !== 0 && NumberWithCommas(total?.finalAmount, 2)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="d-flex recordEstimatePrint justify-content-between overflow-hidden  border-start border-end border_color_estimates">
//                 {/* summary */}
//                 <div className="min_height_100EstimatePrint border-end border-bottom position-relative col-4 border_color_estimates">
//                   <div className="totalBgEstimatePrint text-center border-bottom border_color_estimates">
//                     <p className="fw-bold p-1">SUMMARY</p>
//                   </div>
//                   <div className="d-grid h-100 pb-3">
//                     <div className="d-flex w-100 justify-content-between">
//                       <div className="w-50 border-end h-100 pb-2 border_color_estimates">
//                         <div className="d-flex justify-content-between px-1">
//                           <p className="fw-bold">GOLD IN 24KT</p>
//                           <p>{fixedValues((total?.gold24Kt - notGoldMetalWtTotal), 3)} gm</p>
//                         </div>
//                         {
//                           MetShpWise?.map((e, i) => {
//                             return <div className="d-flex justify-content-between px-1" key={i}>
//                             <p className="fw-bold">{e?.ShapeName}</p>
//                             <p>{NumberWithCommas(e?.metalfinewt, 3)} gm</p>
//                           </div>
//                           })
//                         }
//                         <div className="d-flex justify-content-between px-1">
//                           <p className="fw-bold">GROSS WT</p>
//                           <p>{fixedValues(total?.grosswt, 3)} gm</p>
//                         </div>
//                         <div className="d-flex justify-content-between px-1">
//                           <p className="fw-bold">*(G+D) WT</p>
//                           <p>{fixedValues(total?.weightWithDiamondLoss, 3)} gm</p>
//                         </div>
//                         <div className="d-flex justify-content-between px-1">
//                           <p className="fw-bold">NET WT</p>
//                           <p>{fixedValues(total?.gdWt, 3)} gm</p>
//                         </div>
//                         <div className="d-flex justify-content-between px-1">
//                           <p className="fw-bold">DIAMOND WT</p>
//                           <p>
//                             {NumberWithCommas(total?.diaPcs, 0)} /{" "}
//                             {NumberWithCommas(diamondTotal?.Wt, 3)}{" "}
//                             cts
//                           </p>
//                         </div>
//                         <div className="d-flex justify-content-between px-1">
//                           <p className="fw-bold">STONE WT</p>
//                           <p>
//                             {NumberWithCommas(ColorStoneTotal?.Pcs, 0)} /{" "}
//                             {fixedValues(ColorStoneTotal?.Wt, 3)}{" "}
//                             cts
//                           </p>
//                         </div>
//                         <div className="d-flex justify-content-between px-1">
//                           <p className="fw-bold">MISC WT</p>
//                           <p>
//                             {NumberWithCommas(miscTotal?.Pcs, 0)} /{" "}
//                             {fixedValues(miscTotal?.Wt, 3)} gm
//                           </p>
//                         </div>
//                         {total?.findingWeight !== 0 && <div className="d-flex justify-content-between px-1">
//                           <p className="fw-bold">FINDING WT</p>
//                           <p>{fixedValues(total?.findingWeight, 3)} gm</p>
//                         </div>}
//                       </div>
//                       <div className="w-50 h-100 pb-2">
//                         <div className="d-flex justify-content-between px-1">
//                           <p className="fw-bold">GOLD</p>
//                           <p>{NumberWithCommas((total?.finalMetalsTotal?.amount - notGoldMetalTotal), 2)}</p>
//                           {/* <p>{NumberWithCommas(total?.goldAmount, 2)}</p> */}
//                         </div>
//                         {
//                           MetShpWise?.map((e, i) => {
//                             return <div className="d-flex justify-content-between px-1" key={i}>
//                             <p className="fw-bold">{e?.ShapeName}</p>
//                             <p>{NumberWithCommas(e?.Amount, 2)}</p>
//                           </div>
//                           })
//                         }
//                         <div className="d-flex justify-content-between px-1">
//                           <p className="fw-bold">DIAMOND</p>
//                           <p>{NumberWithCommas(total?.diamondAmount, 2)}</p>
//                         </div>
//                         <div className="d-flex justify-content-between px-1">
//                           <p className="fw-bold">CST</p>
//                           <p>{NumberWithCommas(total?.colorStoneAmount, 2)}</p>
//                         </div>
//                         <div className="d-flex justify-content-between px-1">
//                           <p className="fw-bold">MISC</p>
//                           <p>{NumberWithCommas(total?.miscAmount, 2)}</p>
//                         </div>
//                         <div className="d-flex justify-content-between px-1">
//                           <p className="fw-bold">MAKING</p>
//                           {/* <p>{NumberWithCommas(total?.makingAmount, 2)}</p> */}
//                           <p>{NumberWithCommas(total?.labourAmount, 2)}</p>
//                         </div>
//                         <div className="d-flex justify-content-between px-1">
//                           <p className="fw-bold">OTHER</p>
//                           <p>{NumberWithCommas(total?.otherAmount, 2)}</p>
//                         </div>
//                         {json1Data?.AddLess !== 0 && (
//                           <div className="d-flex justify-content-between px-1">
//                             <p className="fw-bold">
//                               {json1Data?.AddLess > 0 ? "ADD" : "Less"}
//                             </p>
//                             <p>{NumberWithCommas(json1Data?.AddLess, 2)}</p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="d-flex totalBgEstimatePrint position-absolute bottom-0 w-100 border-top border_color_estimates">
//                     <div className="px-1 min_height_24_estimatePrint w-50 border-end border_color_estimates">
//                       <p> </p>
//                     </div>
//                     <div className="px-1 min_height_24_estimatePrint w-50">
//                       <div className="d-flex justify-content-between align-items-center h-100">
//                         <div className="fw-bold">
//                           <p>TOTAL</p>
//                         </div>
//                         <div>
//                           <p>{NumberWithCommas(total?.finalAmount, 2)}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* created by */}
//                 <div className="min_height_100EstimatePrint d-flex border-start col-1 border-bottom border_color_estimates">
//                   <div className="d-flex h-100 w-100">
//                     <div className="position-relative d-flex justify-conten-center align-items-end w-100">
//                       <i className="w-100 text-center">Checked By </i>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
//             {msg}
//           </p>
//         )}
//       </>
//     );
//   };

// export default OrderPrint
