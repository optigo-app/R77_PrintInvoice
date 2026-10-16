import React, { useEffect, useState } from "react";
import "../../assets/css/prints/ordersPrintOrder.css";
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
import Loader from "../../components/Loader";
import { cloneDeep } from "lodash";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";
const OrdersPrintOrder = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  const [image, setImage] = useState(true);
  const [json1Data, setJson1Data] = useState({});
  const [json2Data, setJson2Data] = useState([]);
  // console.log('json2Data: ', json2Data);
  const [otherCharges, setOtherCharges] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [diamondDetailss, setDiamondDetailss] = useState({});
  const [dia, setDia] = useState([]);
  const [rateAmount, setRateAmount] = useState(true);
  const [total, setTotal] = useState({
    previeligeCardDisocunt: 0,
    totalamount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    finalAmount: 0,
    totalLossWt: 0,
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
  const [brokarage, setBrokarage] = useState([]);

  const [MetShpWise, setMetShpWise] = useState([]);
  const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
  const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);

  const caiculateMaterial = (data) => {
    let diamondDetailsss = [];

    data?.BillPrint_Json2?.forEach((ele) => {
      let obj1 = cloneDeep(ele);
      if (obj1?.MasterManagement_DiamondStoneTypeid === 1) {
        if (obj1?.ShapeName === "RND") {
          let findDiamond = diamondDetailsss?.findIndex(
            (elem) =>
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
            (elem) => elem?.ShapeName === "OTHER"
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
    met_shp_arr?.forEach((e) => {
      tot_met += e?.Amount;
      tot_met_wt += e?.metalfinewt;
    });
    setNotGoldMetalTotal(tot_met);
    setNotGoldMetalWtTotal(tot_met_wt);

    let othAmt = 0;

    data?.BillPrint_Json1.forEach((e) => {
      othAmt += e?.OtherCharges * e.Quantity;
      totals.discountAmt += e?.DiscountAmt;
      let settingAmount = 0;
      let totalSetttingAmount = 0;
      totalSetttingAmount += e?.MakingAmount * e.Quantity;
      let settingRate = 0;
      let obj = { ...e };
      // 09/12/25_Bug-Solving
      if (e?.TotalAmount != null && e?.Quantity != null) {
        e.TotalAmount = e.TotalAmount * e.Quantity;
      } 
      if (e?.NetWt != null && e?.Quantity != null) {
        e.NetWt = e.NetWt * e.Quantity;
      } 
      // 09/12/25_Bug-Solving
      obj.otherChargesTotal = obj?.OtherCharges + obj?.TotalDiamondHandling;
      obj.OtherCharges = (obj?.OtherCharges + obj?.TotalDiamondHandling) * e.Quantity;
      let findingTotal = 0;
      let anotherFindingTotal = 0;
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
      totals.gold24Kt += e?.PureNetWt * e.Quantity;
      data?.BillPrint_Json2.forEach((ele) => {
        if (e?.SrJobno === ele?.StockBarcode) {
          if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
            if (ele?.ShapeName === "GOLD") {
              if (ele?.QualityName === "24K") {
              }
              totals.goldAmount += ele?.Amount;
            }
            if (ele?.IsPrimaryMetal === 1) {
              primaryMetalAmount += (ele?.Amount ?? 0) * e.Quantity;
            }            
            // 09/12/25_Bug-Solving
            if (ele?.Amount != null && e?.Quantity != null) {
              ele.Amount = ele.Amount * e.Quantity;
            } 
            // 09/12/25_Bug-Solving
            ele.Weight = e?.NetWt;
            metalsTotal.weightWithDiamondLoss = ele.Weight;
            metalsTotal.Wt += ele.Wt;
            totals.weightWithDiamondLoss += ele.Weight;
            totals.finalMetalsTotal.Wt += ele?.Wt;
            metalsTotal.weight += ele.Weight;
            metals.push(ele);
          }
          if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
            if (ele?.Pcs != null && e?.Quantity != null) {
              ele.Pcs = ele.Pcs * e.Quantity;
            }
            if (ele?.Wt != null && e?.Quantity != null) {
              ele.Wt = ele.Wt * e.Quantity;
            }
            if (ele?.Amount != null && e?.Quantity != null) {
              ele.Amount = ele.Amount * e.Quantity;
            }
            // console.log("ele", ele);
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
            if (ele?.Pcs != null && e?.Quantity != null) {
              ele.Pcs = ele.Pcs * e.Quantity;
            }
            if (ele?.Wt != null && e?.Quantity != null) {
              ele.Wt = ele.Wt * e.Quantity;
            }
            if (ele?.Amount != null && e?.Quantity != null) {
              ele.Amount = ele.Amount * e.Quantity;
            }
            diamondTotals.Pcs += ele?.Pcs;
            diamondTotals.Wt += ele?.Wt;
            diamondTotals.Amount += ele?.Amount;
            diamondDetails.pcs += ele?.Pcs;
            diamondDetails.wt += ele?.Wt;
            diamonds.push(ele);
            metalsTotal.weight += ele?.Wt / 5;
            totals.weightWithDiamondLoss += ele?.Wt / 5;
            totals.diaWt += ele?.Wt;
            totals.diaPcs += ele?.Pcs;
            totals.diamondAmount += ele?.Amount;
            if (diamondDetailList.length > 0) {
              let findRecord = diamondDetailList.findIndex((el) => {
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
              if (ele?.Pcs != null && e?.Quantity != null) {
                ele.Pcs = ele.Pcs * e.Quantity;
              }
              if (ele?.Wt != null && e?.Quantity != null) {
                ele.Wt = ele.Wt * e.Quantity;
              }
              if (ele?.Amount != null && e?.Quantity != null) {
                ele.Amount = ele.Amount * e.Quantity;
              }
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
              if (ele?.Pcs != null && e?.Quantity != null) {
                ele.Pcs = ele.Pcs * e.Quantity;
              }
              if (ele?.Wt != null && e?.Quantity != null) {
                ele.Wt = ele.Wt * e.Quantity;
              }
              if (ele?.Amount != null && e?.Quantity != null) {
                ele.Amount = ele.Amount * e.Quantity;
              }
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
            if (ele?.Pcs != null && e?.Quantity != null) {
              ele.Pcs = ele.Pcs * e.Quantity;
            }
            if (ele?.Wt != null && e?.Quantity != null) {
              ele.Wt = ele.Wt * e.Quantity;
            }
            if (ele?.Amount != null && e?.Quantity != null) {
              ele.Amount = ele.Amount * e.Quantity;
            }
            primaryMetalAmount += ele?.Amount
            anotherFindingTotal += ele?.Wt
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

      let WtSpecial = e?.NetWt + diamondTotal.weight / 5 - (findingTotal + anotherFindingTotal);

      let metalNetWt = e?.NetWt - (findingTotal + anotherFindingTotal);
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
      // 09/12/25_Bug-Solving
      if (obj?.TotalAmount != null && obj?.Quantity != null) {
        obj.TotalAmount = obj.TotalAmount * obj.Quantity;
      } 
      if (obj?.NetWt != null && obj?.Quantity != null) {
        obj.NetWt = obj.NetWt * obj.Quantity;
      } 
      // 09/12/25_Bug-Solving
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
      totals.finalMetalsTotal.amount += obj.primaryMetalAmount;
      obj.colorStones = colorStones;
      obj.diamondTotal = diamondTotal;
      obj.metalsTotal = metalsTotal;
      obj.colorStonesTotal = colorStonesTotal;
      obj.miscsTotal = miscsTotal;
      obj.settingAmount = settingAmount;
      obj.settingRate = settingRate;
      obj.findingTotal = findingTotal;
      totals.totalamount += e?.TotalAmount;
      totals.grosswt += e?.grosswt * e?.Quantity;
      totals.totalLossWt += e?.LossWt * e?.Quantity;
      // 10/12/25_Bug-Solving
      if (typeof obj.MetalDiaWt === 'number' && typeof obj.Quantity === 'number') {
        obj.MetalDiaWt = obj.MetalDiaWt * obj.Quantity;
        totals.gdWt += obj.MetalDiaWt;
      }    
      // 10/12/25_Bug-Solving
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
    )?.toFixed(3);

    // taxes
    let taxValue = taxGenrator(data?.BillPrint_Json[0], totals?.totalamount);
    setTaxes(taxValue);
    taxValue.forEach((e) => {
      totals.finalAmount += +e?.amount;
    });
    totals.finalAmount +=
      totals.totalamount +
      data?.BillPrint_Json[0]?.AddLess -
      data?.BillPrint_Json[0]?.Privilege_discount;
    totals.finalAmount = (totals.finalAmount != null && !isNaN(totals.finalAmount) ? totals.finalAmount.toFixed(2) : 0);
    // taxes end

    totals.gold24Kt = (totals.gold24Kt != null && !isNaN(totals.gold24Kt) ? formatAmount(totals.gold24Kt, 3) : 0);
    totals.NetWt = (totals.NetWt != null && !isNaN(totals.NetWt) ? (totals.NetWt / 5).toFixed(3) : 0);
    totals.diaWt = (totals.diaWt != null && !isNaN(totals.diaWt) ? (totals.diaWt / 5).toFixed(3) : 0);
    totals.stoneWt = (totals.stoneWt != null && !isNaN(totals.stoneWt) ? (totals.stoneWt / 5).toFixed(3) : 0);
    totals.miscWt = (totals.miscWt != null && !isNaN(totals.miscWt) ? (totals.miscWt / 5).toFixed(3) : 0);
    totals.goldAmount = (totals.goldAmount != null && !isNaN(totals.goldAmount) ? totals.goldAmount.toFixed(3) : 0);
    totals.colorStoneAmount = (totals.colorStoneAmount != null && !isNaN(totals.colorStoneAmount) ? totals.colorStoneAmount.toFixed(3) : 0);
    totals.diamondAmount = (totals.diamondAmount != null && !isNaN(totals.diamondAmount) ? totals.diamondAmount.toFixed(3) : 0);
    totals.miscAmount = (totals.miscAmount != null && !isNaN(totals.miscAmount) ? totals.miscAmount.toFixed(3) : 0);
    totals.makingAmount = (totals.makingAmount != null && !isNaN(totals.makingAmount) ? totals.makingAmount.toFixed(3) : 0);
    totals.otherAmount = (totals.otherAmount != null && !isNaN(totals.otherAmount) ? totals.otherAmount.toFixed(3) : 0);
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

    setDiamondDetail(diamondDetailList2);
    setTotal(totals);
    setJson2Data(resultArr);
    let brokarage = ReceiveInBank(data?.BillPrint_Json[0]?.Brokerage);
    setBrokarage(brokarage);
    let finalArr = [];

    resultArr.forEach((e) => {
      if (e?.GroupJob === "") {
        finalArr.push(e);
      } else {
        let findRecord = finalArr.findIndex(
          (ele) => ele?.GroupJob === e?.GroupJob
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
          diamonds.forEach((elem) => {
            let obj = cloneDeep(elem);

            let findDiamonds = blankDiamondArr.findIndex(
              (elee) =>
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
          colorStones.forEach((elem) => {
            let obj = cloneDeep(elem);
            let findColorStones = blankColorStoneArr.findIndex(
              (elee) =>
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
          miscs.forEach((elem) => {
            let findMiscs = blankMiscsArr.findIndex(
              (elee) =>
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
          miscsLists.forEach((ele) => {
            let findListMisc = blankmiscsList.findIndex(
              (elem) => elem?.ShapeName === ele?.ShapeName
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
          finding.forEach((elem) => {
            let findFinding = blankFindingArr.findIndex(
              (elee) =>
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
          anotherFindings.forEach((elem) => {
            let findFinding = blankFindingAnotherArray.findIndex(
              (elee) =>
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
            obj.metals.forEach((elee) => {
              let findMetal = objmetals.findIndex(
                (element) => element.ShapeName === elee.ShapeName
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
            metals.forEach((ell) => {
              let newMetal = true;
              objmetals.forEach((elel) => {
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
            finalArr[findRecord].metals.forEach((elee) => {
              let findMetal = objmetals.findIndex(
                (element) => element.ShapeName === elee.ShapeName
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
            metals.forEach((ell) => {
              let newMetal = true;
              objmetals.forEach((elel) => {
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

          otherAmountDetails.forEach((elee) => {
            let findOther = blankOtherAmtDetails.findIndex(
              (elem) => elem?.label === elee?.label
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
    finalArr.forEach((e) => {
      // console.log("e", e);
      let labourArr = [];
      let labouurTotal = 0;
      labourArr.push({ label: e?.MaKingCharge_Unit * e.Quantity, value: e?.MakingAmount * e.Quantity});
      e?.anotherFinding?.forEach((ele) => {
        if (ele?.SettingRate === e?.MaKingCharge_Unit) {
          let findobj = labourArr?.findIndex(
            (elem) => elem?.label === e?.MaKingCharge_Unit
          );
          if (findobj === -1) {
            labourArr.push({
              label: e?.MaKingCharge_Unit * e.Quantity,
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
              label: ele?.SettingRate * e.Quantity,
              value: ele?.SettingAmount* e.Quantity,
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
        labourArr.push({ label: "Setting", value: diacsAmount * e.Quantity });
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

        // Sorting based on SizeName here
        const sizeA = eem?.SizeName;
        const parseSize = (size) => {
          if (!size) return 0;
          if (size.includes('-')) {
              const [start] = size.split('-').map(parseFloat);
              return start;
          }
          return parseFloat(size.replace('mm', ''));
        };
      

        const sizeParsed = parseSize(sizeA);

        // Sorting diamonds based on SizeName (numeric sorting)
        finalArr3.push({ ...eem, sizeParsed });
    });

    // Sort diamonds by the parsed size before grouping them
    finalArr3.sort((a, b) => a.sizeParsed - b.sizeParsed);

    // Now group diamonds based on other fields as you had before
    e.diamonds = finalArr3.reduce((acc, diamond) => {
        let findrec = acc.findIndex(
            (a) =>
                a?.Rate === diamond?.Rate &&
                a?.ShapeName === diamond?.ShapeName &&
                a?.SizeName === diamond?.SizeName &&
                a?.QualityName === diamond?.QualityName &&
                a?.Colorname === diamond?.Colorname
        );

        if (findrec === -1) {
            acc.push(diamond);
        } else {
            acc[findrec].Wt += diamond?.Wt;
            acc[findrec].Pcs += diamond?.Pcs;
            acc[findrec].Amount += diamond?.Amount;
            acc[findrec].SizeName = diamond?.SizeName;
        }

        return acc;
    }, []);

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

  const handleRateAmount = (e) => {
    if (rateAmount) setRateAmount(false);
    else {
      setRateAmount(true);
    }
  };

  const FinalTotalMetalAMT = json2Data?.map((e) => {
    let totalMetals = 0;
    let totalFindings = 0;
    let totalAnotherFindings = 0;

    if (e?.metals && Array.isArray(e.metals)) {
      totalMetals = e.metals
        .filter((metal) => metal?.IsPrimaryMetal === 1)
        .reduce((acc, metal) => {
          const amount = metal?.Amount ?? 0; 
          return acc + (typeof amount === 'number' ? amount : 0);
        }, 0);
    }

    if (e?.finding && Array.isArray(e.finding)) {
      totalFindings = e.finding.reduce((acc, finding) => {
        const amount = finding?.Amount ?? 0;
        return acc + (typeof amount === 'number' ? amount : 0);
      }, 0);
    }

    if (e?.anotherFinding && Array.isArray(e.anotherFinding)) {
      totalAnotherFindings = e.anotherFinding.reduce((acc, finding) => {
        const amount = finding?.Amount ?? 0;
        return acc + (typeof amount === 'number' ? amount : 0);
      }, 0);
    }

    return totalMetals + totalFindings + totalAnotherFindings;
  }).filter((total) => total > 0).reduce((acc, total) => acc + total, 0);

  const FinalTotalLabourAMT = json2Data?.map((e) => {
    if (e?.labourArr && Array.isArray(e.labourArr)) {
      return e.labourArr
        .reduce((acc, Labour) => {
          const LabourAMT = Labour?.value ?? 0; 
          return acc + (typeof LabourAMT === 'number' ? LabourAMT : 0);
        }, 0);
    }
    return 0;
  }).filter((total) => total > 0).reduce((acc, total) => acc + total, 0);
  
  // console.log("notGoldMetalWtTotal", notGoldMetalWtTotal);  
  // console.log("FinalTotalLabourAMT", FinalTotalLabourAMT);  
  // console.log("FinalTotalMetalAMT", FinalTotalMetalAMT);  
  // console.log('json2Data' , json2Data);
  // console.log('json1Data' , json1Data);
  // console.log('total', total);
  
  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <div className="container containerEstimate pad_60_allPrint">
          {/* Print Button */}
          <div className="d-flex justify-content-end align-items-center print_sec_sum4 pb-4 mt-5 w-100">
            <div className="px-2">
              <input
                type="checkbox"
                onChange={handleRateAmount}
                value={rateAmount}
                checked={rateAmount}
                id="rateAmount"
              />
              <label htmlFor="rateAmount" className="user-select-none mx-1">
                With Price
              </label>
            </div>            
            <div className="form-check ps-3">
              <input
                type="button"
                className="btn_white blue mt-0"
                value="Print"
                onClick={(e) => handlePrint(e)}
              />
            </div>
          </div>

          {/* Print Name */}
          <div className={`border p-1 border-2 lightGrey border_color_estimate`}>
            <p className="text-uppercase fw-bold estimatePrintFont_14">
              {json1Data?.PrintHeadLabel === ""
                ? "ORDER REQUEST"
                : json1Data?.PrintHeadLabel}
            </p>
          </div>

          {/* Customer Detail */}
          <div className="py-1 pb-0 d-flex PageNotBrkPrint justify-content-between px-1">
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
                <p className="mainDetailEstimate text-end pe-3">Quotation : </p>
                <p className="fw-bold">{json2Data[0]?.metals[0]?.StockDocumentNo}</p>
              </div>
              <div className="d-flex justify-conetnt-between">
                <p className="mainDetailEstimate text-end pe-3">Date : </p>
                <p className="fw-bold">{json1Data?.EntryDate}</p>
              </div>
            </div>
          </div>

          <div className="my-2 w-100">
            {/* Table Heading */}
            <div className="border-start PageNotBrkPrint border-top border-end d-flex border-bottom recordEstimatePrint overflow-hidden border-black lightGrey">
              <div className="srNoEstimatePrint border-end px-1 d-flex align-items-center justify-content-center border_color_estimates">
                <p className="fw-bold">Sr</p>
              </div>
              <div className="designEstimatePrint border-end px-1 d-flex align-items-center justify-content-center border_color_estimates">
                <p className="fw-bold">Design</p>
              </div>
              <div className="diamondEstimatePrint border-end border_color_estimates">
                <div className="SpacHeadY text-center border-bottom border_color_estimates">
                  <p className="fw-bold">Diamond</p>
                </div>
                <div className="d-flex h-100">
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="SpacSubHeadY text-center fw-bold">Code</p>
                  </div>
                  <div className="width20DividedSize px-1 border-end border_color_estimates">
                    <p className="SpacSubHeadY text-center fw-bold">Size</p>
                  </div>
                  <div className="width20Divided px-1 border-end border_color_estimates">
                    <p className="SpacSubHeadY text-center fw-bold">Pcs</p>
                  </div>
                  <div className="width20DividedWt px-1 border-end border_color_estimates">
                    <p className="SpacSubHeadY text-center fw-bold">Wt</p>
                  </div>
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="SpacSubHeadY text-center fw-bold">Rate</p>
                  </div>
                  <div className="width20EstimatePrint px-1">
                    <p className="SpacSubHeadY text-center fw-bold">Amount</p>
                  </div>
                </div>
              </div>
              <div className="metalEstimatePrint border-end border_color_estimates">
                <div className="SpacHeadY text-center border-bottom border_color_estimates">
                  <p className="fw-bold">Metal</p>
                </div>
                <div className="d-flex h-100">
                  <div className="width_40_estimatePrint px-1 border-end border_color_estimates">
                    <p className="SpacSubHeadY text-center fw-bold">Quality</p>
                  </div>
                  <div className="width_40_estimatePrint px-1 border-end border_color_estimates">
                    <p className="SpacSubHeadY text-center fw-bold">*Wt</p>
                  </div>
                  <div className="width_40_estimatePrint px-1 border-end border_color_estimates">
                    <p className="SpacSubHeadY text-center fw-bold">Net Wt</p>
                  </div>
                  <div className="width_40_estimatePrint px-1 border-end border_color_estimates">
                    <p className="SpacSubHeadY text-center fw-bold">Rate</p>
                  </div>
                  <div className="width_40_estimatePrint px-1">
                    <p className="SpacSubHeadY text-center fw-bold">Amount</p>
                  </div>
                </div>
              </div>
              <div className="stoneEstimatePrint border-end border_color_estimates">
                <div className="SpacHeadY text-center border-bottom border_color_estimates">
                  <p className="fw-bold">Stone</p>
                </div>
                <div className="d-flex h-100">
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="SpacSubHeadY text-center fw-bold">Code</p>
                  </div>
                  <div className="width20DividedSize px-1 border-end border_color_estimates">
                    <p className="SpacSubHeadY text-center fw-bold">Size</p>
                  </div>
                  <div className="width20Divided px-1 border-end border_color_estimates">
                    <p className="SpacSubHeadY text-center fw-bold">Pcs</p>
                  </div>
                  <div className="width20DividedWt px-1 border-end border_color_estimates">
                    <p className="SpacSubHeadY text-center fw-bold">Wt</p>
                  </div>
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="SpacSubHeadY text-center fw-bold">Rate</p>
                  </div>
                  <div className="width20EstimatePrint px-1">
                    <p className="SpacSubHeadY text-center fw-bold">Amount</p>
                  </div>
                </div>
              </div>
              <div className="OtherAmountEstimatePrint border-end border_color_estimates px-1 d-flex align-items-center justify-content-center flex-wrap">
                <p className="text-center fw-bold">Other &nbsp;</p>
                <p className="text-center fw-bold">Amount </p>
              </div>
              <div className="labourEstimatePrint border-end border_color_estimates">
                <div className="SpacHeadY text-center border-bottom border_color_estimates">
                  <p className="fw-bold">Labour</p>
                </div>
                <div className="w-100 d-flex h-100">
                  <div className="w-50 border-end border_color_estimates text-center">
                    <p className="SpacSubHeadY fw-bold">Rate</p>
                  </div>
                  <div className="w-50 px-1 text-center">
                    <p className="SpacSubHeadY fw-bold">Amount</p>
                  </div>
                </div>
              </div>
              <div className="totalAmountEstimatePrint p-1 d-flex align-items-center justify-content-center flex-wrap">
                <p className="text-center fw-bold">Total &nbsp;</p>
                <p className="text-center fw-bold">Amount </p>
              </div>
            </div>

            {/* Data */}
            <div className="">
              {json2Data.length > 0 &&
                json2Data.map((e, i) => {                
                  return (
                    <div className={`d-flex border-bottom PageNotBrkPrint BrdrTop recordEstimatePrint overflow-hidden word_break_estimatePrint`}
                      key={i}
                      style={{
                        borderLeft: "1px solid black",
                        borderRight: "1px solid black",
                      }}
                    >
                      <div className="srNoEstimatePrint border-end p_1Estimate border_color_estimates">
                        <p className="text-center">{i + 1}</p>
                      </div>

                      {/* Design */}
                      <div className="designEstimatePrint border-end  border_color_estimates d-flex justify-content-between flex-column">
                        <div className="d-flex justify-content-between p_1Estimate">
                          <div>{e?.designno}</div>
                          <div className="text-end">
                            <p>{e?.J_JobNo}</p>
                          </div>
                        </div>
                        <div className="pb-1 p_1Estimate">
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
                          <div className="mt-1">
                            {e?.Quantity !== "" && e?.Quantity !== null  
                              ? <div className="d-flex"> 
                                  <div className="w-25"></div>
                                  <div className="w-75 d-flex">
                                    <p className="fw-bold">Qty -&nbsp;</p>
                                    <p className="fw-bold">{e?.Quantity}</p>
                                  </div>
                                </div>
                              : ""
                            }
                            {e?.NoOfParts !== "" && e?.NoOfParts !== null  
                              ? <div className="d-flex"> 
                                  <div className="w-25"></div>
                                  <div className="w-75 d-flex">
                                    <p className="fw-bold">No Of Parts -&nbsp;</p>
                                    <p className="fw-bold">{e?.NoOfParts}</p>
                                  </div>
                                </div>
                              : ""
                            }
                            {e?.PO !== "" && e?.PO !== null  
                              ? <div className="d-flex"> 
                                  <div className="w-25"></div>
                                  <div className="w-75 d-flex">
                                    <p className="fw-bold">PO -&nbsp;</p>
                                    <p className="fw-bold">{e?.PO}</p>
                                  </div>
                                </div>
                              : ""
                            }
                          </div>
                        </div>
                        <div className="totalBgEstimatePrint border-top border_color_estimates">
                          <p
                            className="w-100 fw-bold d-flex justify-content-center"
                          >
                            {e?.MetalColor}
                          </p>
                          {e?.Size !== "" && (
                            <p className="w-100 ps-1 fw-bold d-flex justify-content-center">
                              Size : {e?.Size}
                            </p>
                          )}
                          {e?.PromiseDate !== "" && e?.PromiseDate !== null && (
                            <p className="w-100 ps-1 fw-bold d-flex justify-content-center">
                              PR Date : {e?.PromiseDate}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Diamond */}
                      <div className="diamondEstimatePrint border-end position-relative border_color_estimates">
                        <div className="pad_bot_29_estimatePrint">
                          {e?.diamonds.length > 0 &&
                            e?.diamonds.map((ele, ind) => {
                              return (
                                <div className="d-flex " key={ind}>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="spbrWord">
                                      {ele?.ShapeName} {ele?.QualityName}{" "}
                                      {ele?.Colorname}
                                    </p>
                                  </div>
                                  <div className="width20DividedSize p_1Estimate">
                                    <p className="text-end">{ele?.SizeName}</p>
                                  </div>
                                  <div className="width20Divided p_1Estimate">
                                    <p className="text-end">
                                      {NumberWithCommas(ele?.Pcs, 0)}
                                    </p>
                                  </div>
                                  <div className="width20DividedWt p_1Estimate">
                                    <p className="text-end">
                                      {fixedValues(ele?.Wt, 3)}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {rateAmount ? NumberWithCommas(ele?.Rate, 2) : ""}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="fw-bold text-end">
                                      {rateAmount ? NumberWithCommas(ele?.Amount, 2) : ""}
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
                          <div className="width20DividedSize p_1Estimate">
                            <p className="fw-bold"></p>
                          </div>
                          <div className="width20Divided p_1Estimate d-flex align-items-center justify-content-end">
                            <p className="text-end fw-bold">
                              {e?.diamonds.length !== 0 && (
                                <>{NumberWithCommas(e?.diamondTotal?.pcs, 0)}</>
                              )}
                            </p>
                          </div>
                          <div className="width20DividedWt p_1Estimate d-flex align-items-center justify-content-end">
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
                                  {rateAmount ? NumberWithCommas(e?.diamondTotal?.amount, 2) : ""}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Metal */}
                      <div className="metalEstimatePrint border-end position-relative border_color_estimates">
                        {/* <div className='h-100 d-grid pad_bot_29_estimatePrint'> */}
                        <div className="pad_bot_29_estimatePrint">
                          {e?.metals.length > 0 &&
                            e?.metals.map((ele, ind) => {
                              return (
                                <div className="d-flex" key={ind}>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="spbrWord">
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
                                      {rateAmount ? NumberWithCommas(ele?.Rate, 2) : ""}
                                    </p>
                                  </div>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="text-end fw-bold">
                                      {rateAmount ? ind === 0 ? NumberWithCommas(e?.metalNetWt * ele?.Rate, 2) : NumberWithCommas(ele?.Wt * ele?.Rate, 2) : ""}
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
                                    <p className="spbrWord">
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
                                      {rateAmount ? NumberWithCommas(ele?.Rate, 2) : ""}
                                    </p>
                                  </div>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="text-end fw-bold">
                                      {rateAmount ? NumberWithCommas(ele?.Rate * ele?.Wt, 2) : ""}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            {e?.anotherFinding.length > 0 &&
                              e?.anotherFinding.map((ele, ind) => {
                                return (
                                  <div className="d-flex" key={ind}>
                                    <div className="width_40_estimatePrint p_1Estimate">
                                      <p className="spbrWord">
                                        {ele?.ShapeName} {ele?.QualityName}
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
                                        {rateAmount ? NumberWithCommas(ele?.Rate, 2) : ""}
                                      </p>
                                    </div>
                                    <div className="width_40_estimatePrint p_1Estimate">
                                      <p className="text-end fw-bold">
                                        {rateAmount ? NumberWithCommas(ele?.Rate * ele?.Wt, 2) : ""}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                              {
                                e?.LossWt !== 0 && (
                                  // Calculate the LossRate before returning JSX
                                  (() => {
                                    const LossRate = e?.metals?.filter((metal) => metal?.IsPrimaryMetal === 1)?.map((metal) => metal?.Rate);

                                    return (
                                      <div className="d-flex fontCLR">
                                        <div className="width_40_estimatePrint p_1Estimate">
                                          Loss
                                        </div>
                                        <div className="width_40_estimatePrint p_1Estimate text-end">
                                          {e?.LossPer === 0 ? "" : e?.LossPer?.toFixed(3)} %
                                        </div>
                                        <div className="width_40_estimatePrint p_1Estimate text-end">
                                          {e?.LossWt?.toFixed(3)}
                                        </div>
                                        <div className="width_40_estimatePrint p_1Estimate text-end">
                                          {rateAmount ? NumberWithCommas(LossRate,2) : ""}
                                        </div>
                                        <div className="width_40_estimatePrint p_1Estimate fw-bold text-end">
                                          {rateAmount ? NumberWithCommas(LossRate * e?.LossWt,2) : ""}
                                        </div>
                                      </div>
                                    );
                                  })()
                                )
                              }
                            {e?.JobRemark !== "" && (
                              <div className="pt-2 px-1">
                                <p>Remark:</p>
                                <p className="fw-bold"> {e?.JobRemark}</p>
                              </div>
                            )}
                            {e?.OfficeUseWithHtml !== "" && (
                              <div className="pt-1 px-1">
                                <p>D Remark:</p>
                                <p className="fw-bold spbrWord" dangerouslySetInnerHTML={{ __html: e?.OfficeUseWithHtml }}></p>
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
                          <div className="d-flex align-items-center justify-content-end width200EstimatePrint p_1Estimate">
                            <p className="text-end fw-bold">
                              {fixedValues(e?.metalsTotal?.weight, 3)}
                            </p>
                          </div>
                          <div className="p_1Estimate width200EstimatePrint d-flex align-items-center justify-content-end">
                            <p className="text-end fw-bold">
                              {fixedValues(e?.NetWt + e?.LossWt, 3)}
                            </p>
                          </div>
                          <div
                            className="width200EstimatePrint p_1Estimate d-flex align-items-center justify-content-end"
                            style={{ minWidth: "40%", width: "40%" }}
                          >
                            <p className="text-end fw-bold">
                              {rateAmount ? NumberWithCommas(e?.primaryMetalAmount, 2) : ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stone */}
                      <div className="stoneEstimatePrint border-end position-relative border_color_estimates">
                        <div className="pad_bot_29_estimatePrint">
                          {e?.colorStones.length > 0 &&
                            e?.colorStones.map((ele, ind) => {
                              return (
                                <div className="d-flex " key={ind}>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="spbrWord">
                                      {ele?.ShapeName} {ele?.QualityName}{" "}
                                      {ele?.Colorname}
                                    </p>
                                  </div>
                                  <div className="width20DividedSize p_1Estimate">
                                    <p className="text-end">{ele?.SizeName}</p>
                                  </div>
                                  <div className="width20Divided p_1Estimate">
                                    <p className="text-end">
                                      {ele?.Pcs > 0 &&
                                        NumberWithCommas(ele?.Pcs, 0)}
                                    </p>
                                  </div>
                                  <div className="width20DividedWt p_1Estimate">
                                    <p className="text-end">
                                      {ele?.Wt > 0 && fixedValues(ele?.Wt, 3)}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {rateAmount ? NumberWithCommas(ele?.Rate, 2) : ""}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="fw-bold text-end">
                                      {rateAmount ? NumberWithCommas(ele?.Amount / e?.Quantity, 2) : ""}
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
                                    <p className="spbrWord">
                                      M: {ele?.ShapeName} {ele?.QualityName}{" "}
                                      {/* {ele?.Colorname} */}
                                    </p>
                                  </div>
                                  <div className="width20DividedSize p_1Estimate">
                                    <p className="text-end">{ele?.SizeName}</p>
                                  </div>
                                  <div className="width20Divided p_1Estimate">
                                    <p className="text-end">
                                      {ele?.Pcs > 0 &&
                                        NumberWithCommas(ele?.Pcs, 0)}
                                    </p>
                                  </div>
                                  <div className="width20DividedWt p_1Estimate">
                                    <p className="text-end">
                                      {ele?.Wt > 0 && fixedValues(ele?.Wt, 3)}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {rateAmount ? NumberWithCommas(ele?.Rate, 2) : ""}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="fw-bold text-end">
                                      {rateAmount ? NumberWithCommas(ele?.Amount / e?.Quantity, 2) : ""}
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
                          <div className="width20DividedSize p_1Estimate">
                            <p></p>
                          </div>
                          <div className="width20Divided p_1Estimate d-flex align-items-center justify-content-end">
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
                          <div className="width20DividedWt p_1Estimate d-flex align-items-center justify-content-end">
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
                                  {rateAmount ? NumberWithCommas(
                                    e?.colorStonesTotal?.amount +
                                    e?.miscsTotal?.amount,
                                    2
                                  ) : ""}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Other Amount */}
                      <div className="OtherAmountEstimatePrint border-end position-relative border_color_estimates">
                        <div className="h-100 d-grid pad_bot_29_estimatePrint">
                          <div className="p_1Estimate border_color_estimates ">
                            <div className="w-100 d-flex align-items-center justify-content-end">
                              {rateAmount ? NumberWithCommas(e?.OtherCharges, 2) : ""}
                            </div>
                          </div>
                        </div>
                        <div
                          className="totalBgEstimatePrint position-absolute bottom-0 height_28_5_estimatePrint w-100 d-flex align-items-center justify-content-end border-top border_color_estimates"
                        >
                          <div className="text-end p_1Estimate">
                            <p className="fw-bold">
                              {/* {NumberWithCommas(e?.otherChargesTotal, 2)} */}
                              {rateAmount ? NumberWithCommas(e?.OtherCharges, 2) : ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Labour */}
                      <div className="labourEstimatePrint border-end position-relative border_color_estimates">
                        <div className="h-100 d-grid pad_bot_29_estimatePrint">
                          <div className="d-flex  border_color_estimates">
                            {e?.MakingAmount !== 0 && (
                              <>
                                {" "}
                                <div className="w-50 p_1Estimate">
                                  {e?.labourArr?.map((ele, ind) => {
                                    return (
                                      <p key={ind}>
                                        {rateAmount ? NumberWithCommas(+ele?.label, 2) !==
                                          "NaN"
                                          ? NumberWithCommas(+ele?.label, 2)
                                          : ele?.label : ""}
                                      </p>
                                    );
                                  })}
                                </div>
                                <div className="w-50 text-end p_1Estimate">
                                  {e?.labourArr?.map((ele, ind) => {
                                    return (
                                      <p key={ind}>
                                        {rateAmount ? NumberWithCommas(ele?.value, 2) : ""}
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
                        >
                          <div className="">
                            <p className="text-end p_1Estimate fw-bold">
                            {rateAmount ? 
                              NumberWithCommas(
                                  e?.labourArr?.reduce((acc, ele) => acc + (Number(ele?.value) || 0), 0),2 
                              ) : ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="totalAmountEstimatePrint position-relative">
                        <div className="h-100 d-grid pad_bot_29_estimatePrint">
                          <div className="border_color_estimates">
                            <p className="text-end p_1Estimate fw-bold">
                              {rateAmount ? NumberWithCommas(e?.TotalAmount, 2) : ""}
                            </p>
                          </div>
                        </div>
                        <div className="totalBgEstimatePrint position-absolute bottom-0 height_28_5_estimatePrint w-100 d-flex align-items-center justify-content-end border-top border_color_estimates">
                          <div className="text-end p_1Estimate">
                            <p className="fw-bold">
                              {/* <span
                                  dangerouslySetInnerHTML={{
                                    __html: json1Data?.Currencysymbol,
                                  }}
                                ></span> */}
                              {rateAmount ? NumberWithCommas(e?.TotalAmount, 2) : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Taxes And Amount */}
            <div className="border-black border-end border-start PageNotBrkPrint">
              <div className="d-flex recordTaxTotals overflow-hidden border-bottom border_color_estimates">
                <div className="srNoEstimatePrint p_1Estimate"></div>
                <div className="designEstimatePrint p_1Estimate"></div>
                <div className="diamondEstimatePrint position-relative"></div>
                <div className="metalEstimatePrint position-relative"></div>
                <div className="stoneEstimatePrint position-relative"></div>
                <div className="OtherAmountEstimatePrint position-relative"></div>
                {/* Left Side Lables */}
                <div className="labourEstimatePrint pSpaceTaxAmtY border-end border-white">
                  {total?.discountAmt !== 0 && (
                    <div className="text-end">
                      <p>Total Discount</p>
                    </div>
                  )}
                  {total?.totalamount !== 0 && (
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

                {/* Right Side Value*/}
                <div className="totalAmountEstimatePrint pSpaceTaxAmtY" style={{ paddingRight: "2px" }}>
                  {total?.discountAmt !== 0 && (
                    <div id="discountAmt" className="text-end">
                      <p>{rateAmount ? NumberWithCommas(total?.discountAmt, 2) : ""}</p>
                    </div>
                  )}
                  {total?.totalamount !== 0 && (
                    <div id="finalAmount" className="text-end">
                      <p>{rateAmount ? NumberWithCommas(total?.totalamount - total?.discountAmt, 2) : ""}</p>
                    </div>
                  )}
                  {total?.exchange !== 0 && (
                    <div id="exchange" className="text-end">
                      <p>{rateAmount ? NumberWithCommas(total?.exchange, 2) : ""}</p>
                    </div>
                  )}
                  {total?.Cash !== 0 && (
                    <div id="Cash" className="text-end">
                      <p>{rateAmount ? NumberWithCommas(total?.Cash, 2) : ""}</p>
                    </div>
                  )}
                  {total?.Bank !== 0 && (
                    <div id="Bank" className="text-end">
                      <p>{rateAmount ? NumberWithCommas(total?.Bank, 2) : ""}</p>
                    </div>
                  )}
                  {total?.Advance !== 0 && (
                    <div id="Advance" className="text-end">
                      <p>{rateAmount ? NumberWithCommas(total?.Advance, 2) : ""}</p>
                    </div>
                  )}
                  {total?.AddLess !== 0 && (
                    <div id="AddLess" className="text-end">
                      <p>{rateAmount ? NumberWithCommas(total?.AddLess, 2) : ""}</p>
                    </div>
                  )}
                  {total.previeligeCardDisocunt !== 0 && (
                    <div id="previeligeCardDisocunt" className="text-end">
                      <p>{rateAmount ? NumberWithCommas(total.previeligeCardDisocunt, 2) : ""}</p>
                    </div>
                  )}
                  <div className="text-end">
                    {taxes.length > 0 &&
                      taxes.map((e, i) => {
                        return <p key={i}>{rateAmount ? NumberWithCommas(e?.amount, 2) : ""}</p>;
                      })}
                    {json1Data?.AddLess !== 0 && (
                      <p>{rateAmount ? NumberWithCommas(json1Data?.AddLess, 2) : ""}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Final Total Row */}
            <div className="d-flex PageNotBrkPrint recordEstimatePrint overflow-hidden border-end border-start border-bottom  border-black totalBgEstimatePrint">
              <div className="totalEstimatePrint border-end totalBgEstimatePrint border_color_estimates">
                <p className="text-center fw-bold h-100">Total</p>
              </div>

              {/* Diamond Total */}
              <div className="diamondEstimatePrint border-end border_color_estimates">
                <div className="d-flex w-100">
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p></p>
                  </div>
                  <div className="width20DividedSize p_1Estimate h-100">
                    <p></p>
                  </div>
                  <div className="width20Divided p_1Estimate h-100">
                    <p className="text-end fw-bold">
                      {diamondTotal?.Pcs > 0 &&
                        NumberWithCommas(diamondTotal?.Pcs, 0)}
                    </p>
                  </div>
                  <div className="width20DividedWt p_1Estimate h-100">
                    <p className="text-end fw-bold">
                      {diamondTotal?.Wt > 0 &&
                        NumberWithCommas(diamondTotal?.Wt, 3)}
                    </p>
                  </div>
                  <div className="width20EstimatePrint p_1Estimate h-100"></div>
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p className="text-end fw-bold">
                      {rateAmount ? NumberWithCommas(diamondTotal?.Amount, 2) : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metal Total */}
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
                      {total?.gdWt !== 0 && NumberWithCommas(total?.gdWt + total?.totalLossWt, 3)}
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
                      {FinalTotalMetalAMT !== 0 &&
                        rateAmount ? NumberWithCommas(FinalTotalMetalAMT, 2) : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stone Total */}
              <div className="stoneEstimatePrint border-end border_color_estimates">
                <div className="d-flex totalBgEstimatePrint bottom-0 w-100">
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p className="fw-bold"></p>
                  </div>
                  <div className="width20DividedSize p_1Estimate h-100">
                    <p className="fw-bold"></p>
                  </div>
                  <div className="width20Divided p_1Estimate h-100">
                    <p className="text-end fw-bold">
                      {colorStoneMiscTotal?.Pcs !== 0 &&
                        NumberWithCommas(colorStoneMiscTotal?.Pcs, 0)}
                    </p>
                  </div>
                  <div className="width20DividedWt p_1Estimate h-100">
                    <p className="text-end fw-bold">
                      {colorStoneMiscTotal?.Wt !== 0 &&
                        fixedValues(colorStoneMiscTotal?.Wt, 3)}
                    </p>
                  </div>
                  <div className="width20EstimatePrint p_1Estimate h-100"></div>
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p className="text-end fw-bold">
                      {rateAmount ? NumberWithCommas(colorStoneMiscTotal?.Amount, 2) : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Other Charges Total */}
              <div className="OtherAmountEstimatePrint border-end border_color_estimates">
                <div className="totalBgEstimatePrint bottom-0 w-100 h-100">
                  <div className="h-100 text-end p_1Estimate">
                    <p className="fw-bold">
                      {/* {total?.otherAmount !== 0 && NumberWithCommas(total?.otherAmount, 2)} */}
                      {rateAmount ? formatAmount(otherCharges) : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Labour Total */}
              <div className="labourEstimatePrint border-end border_color_estimates">
                <div className="d-flex  w-100 h-100 justify-content-end">
                  <div className="p_1Estimate fw-bold">
                    <p>
                      {FinalTotalLabourAMT !== 0 &&
                        rateAmount ? NumberWithCommas(FinalTotalLabourAMT, 2) : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Final Total */}
              <div className="totalAmountEstimatePrint d-flex">
                <div className="totalBgEstimatePrint w-100 h-100">
                  <div className="text-end p_1Estimate">
                    <p className="fw-bold">
                      {rateAmount ? <span
                        dangerouslySetInnerHTML={{
                          __html: json1Data?.Currencysymbol,
                        }}
                      ></span> : ""}
                      {total?.finalAmount !== 0 &&
                        rateAmount ? NumberWithCommas(total?.finalAmount - total?.discountAmt, 2) : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex PageNotBrkPrint recordPrint justify-content-between overflow-hidden">
              {/* Summary */}
              <div className="position-relative col-4">
                <div className="totalBgEstimatePrint text-center border-bottom border-start border-end border_color_estimates">
                  <p className="fw-bold recordPrintWordSum">SUMMARY</p>
                </div>

                <div className="border-start border-end border_color_estimates">
                  <div className="min_height_100EstimatePrint d-flex justify-content-between">
                    {/* Weights */}
                    <div className="w-50 border-end pSpaceTop border_color_estimates">
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

                    {/* Amounts */}
                    <div className="min_height_100EstimatePrint pSpaceTop w-50">
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">GOLD</p>
                        <p>
                          {rateAmount ? NumberWithCommas(
                            FinalTotalMetalAMT - notGoldMetalTotal,
                            2
                          ) : ""}
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
                            <p>{rateAmount ? NumberWithCommas(e?.Amount, 2) : ""}</p>
                          </div>
                        );
                      })}
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">DIAMOND</p>
                        <p>{rateAmount ? NumberWithCommas(total?.diamondAmount, 2) : ""}</p>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">CST</p>
                        <p>{rateAmount ? total?.colorStoneAmount === "0.000" ? "" : NumberWithCommas(total?.colorStoneAmount, 2) : ""}</p>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">MISC</p>
                        <p>{rateAmount ? NumberWithCommas(total?.miscAmount, 2) : ""}</p>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">MAKING</p>
                        {/* <p>{NumberWithCommas(total?.makingAmount, 2)}</p> */}
                        <p>{rateAmount ? NumberWithCommas(FinalTotalLabourAMT, 2) : ""}</p>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">OTHER</p>
                        <p>{rateAmount ? NumberWithCommas(otherCharges, 2) : ""}</p>
                      </div>
                      {json1Data?.AddLess !== 0 && (
                        <div className="d-flex justify-content-between px-1">
                          <p className="fw-bold">
                            {json1Data?.AddLess > 0 ? "ADD" : "Less"}
                          </p>
                          <p>{rateAmount ? NumberWithCommas(json1Data?.AddLess, 2) : ""}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Total Row */}     
                <div className="w-100 d-flex totalBgEstimatePrint border-start border-bottom border-end border-top border_color_estimates">
                  <div className="px-1 min_height_24_estimatePrint w-50 border-end border_color_estimates">
                    <p> </p>
                  </div>
                  <div className="px-1 min_height_24_estimatePrint w-50 recordPrintWordSum">
                    <div className="d-flex justify-content-between align-items-center h-100">
                      <div className="fw-bold">
                        <p>TOTAL</p>
                      </div>
                      <div>
                        <p>{rateAmount ? NumberWithCommas(total?.finalAmount - total?.discountAmt, 2) : ""}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature */}
              <div className="minHeightSign d-flex border-start col-1 border-bottom border-end border_color_estimates">
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

export default OrdersPrintOrder;