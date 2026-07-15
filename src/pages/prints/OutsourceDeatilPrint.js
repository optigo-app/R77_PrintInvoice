// http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=NTQ3&evn=T3V0U291cmNl&pnm=ZGV0YWlsIHByaW50&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=OutsourcePrintAM&pid=undefined
import React, { useEffect, useState } from "react";
import "../../assets/css/prints/outsourcePrintAM.css";
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
const OutsourceDeatilPrint = ({
  urls,
  token,
  invoiceNo,
  printName,
  evn,
  ApiVer,
}) => {
  const [image, setImage] = useState(true);
  const [json1Data, setJson1Data] = useState({});
  const [json2Data, setJson2Data] = useState([]);
  const [otherCharges, setOtherCharges] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [diamondDetailss, setDiamondDetailss] = useState({});
  const [checkBoxNew, setCheckBoxNew] = useState(false);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  const [dia, setDia] = useState([]);
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
    finalSoliatireTotal: {
      pcs: 0,
      weight: 0,
      rate: 0,
      amount: 0,
    },
    finalGemstoneTotal: {
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

    solitairePcs: 0,
    gemstonePcs: 0,
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

  const [soliatireTotal, setSoliatireTotal] = useState({
    Wt: 0,
    Pcs: 0,
    Amount: 0,
  });


  const [gemstoneTotal, setGemstoneTotal] = useState({
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
    let soliatireTotals = { ...soliatireTotal };
    let gemstoneTotals = { ...gemstoneTotal };
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
      let solitaireTotal = {
        pcs: 0,
        weight: 0,
        rate: 0,
        amount: 0,
      };
      let gemstoneTotal = {
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
            if(ele?.IsSolGem==1){
              gemstoneTotals.Pcs += ele?.Pcs;
              gemstoneTotals.Wt += ele?.Wt;
              gemstoneTotals.Amount += ele?.Amount;
            }
            colorStones.push(ele);
            totals.stoneWt += ele?.Wt;
            totals.stonePcs += ele?.Pcs;
            if(ele?.IsSolGem==1){
              totals.gemstonePcs += ele?.Pcs;
            }
            totals.colorStoneAmount += ele?.Amount;
            colorStoneTotals.Wt += ele?.Wt;
            colorStoneTotals.Pcs += ele?.Pcs;
            colorStoneTotals.Amount += ele?.Amount;
            colorStoness.Wt += ele?.Wt;
            colorStoness.Pcs += ele?.Pcs;
            colorStoness.Amount += ele?.Amount;
          }
          if (ele?.MasterManagement_DiamondStoneTypeid === 1) {

            if(ele?.IsSolGem==1){
              soliatireTotals.Pcs += ele?.Pcs;
              soliatireTotals.Wt += ele?.Wt;
              soliatireTotals.Amount += ele?.Amount;
            }
            diamondTotals.Wt += ele?.Wt;
            diamondTotals.Amount += ele?.Amount;
            diamondDetails.pcs += ele?.Pcs;
            diamondDetails.wt += ele?.Wt;
            diamonds.push(ele);
            totals.diaWt += ele?.Wt;
            totals.diaPcs += ele?.Pcs;
            if(ele?.IsSolGem ==1){
              totals.solitairePcs += ele?.Pcs;
            }
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
      obj.soliatireTotal = solitaireTotal;
      obj.gemstoneTotal = gemstoneTotal;
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
    setSoliatireTotal(soliatireTotals);
    setGemstoneTotal(gemstoneTotals);
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

    console.log("totalstotals", totals);

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
            a?.Colorname === eem?.Colorname &&
            a?.IsSolGem === eem?.IsSolGem
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
            a?.Colorname === eem?.Colorname &&
            a?.IsSolGem === eem?.IsSolGem
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

  const handleChangeNew = () => {
    setCheckBoxNew((prev) => !prev);
  };

  function formatDateTime() {
    const now = new Date();
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return now.toLocaleString("en-GB", options).replace(",", "");
  }

  const calculateMetalWeights = () => {
    const metalWeights = json2Data?.map((e) => {
      if (!e?.diamonds || e?.diamonds?.length === 0) return [];
      return e?.metals?.map((metal) => {
        const metalWtPercentage = (metal?.Wt / e?.NetWt) * 100;
        return {
          J_JobNo: e?.J_JobNo,
          StockDocumentNo: metal?.StockDocumentNo,
          StockBarcode: metal?.StockBarcode,
          ShapeName: metal?.ShapeName,
          QualityName: metal?.QualityName,
          Colorname: metal?.Colorname,
          Weight: metal?.Wt,
          WeightPercentage: metalWtPercentage,
        };
      });
    });

    const findingWeights = json2Data?.map((e) => {
      if (!e?.diamonds || e?.diamonds?.length === 0) return [];
      return e?.finding?.map((finding) => {
        const findingWtPercentage = (finding?.Wt / e?.NetWt) * 100;
        return {
          J_JobNo: e?.J_JobNo,
          StockDocumentNo: finding?.StockDocumentNo,
          StockBarcode: finding?.StockBarcode,
          ShapeName: finding?.ShapeName,
          QualityName: finding?.QualityName,
          Colorname: finding?.Colorname,
          Weight: finding?.Wt,
          WeightPercentage: findingWtPercentage,
        };
      });
    });

    const anotherFindingWeights = json2Data?.map((e) => {
      if (!e?.diamonds || e?.diamonds?.length === 0) return [];
      return e?.anotherFinding?.map((anotherFinding) => {
        const anotherFindingWtPercentage =
          (anotherFinding?.Wt / e?.NetWt) * 100;
        return {
          J_JobNo: e?.J_JobNo,
          StockDocumentNo: anotherFinding?.StockDocumentNo,
          StockBarcode: anotherFinding?.StockBarcode,
          ShapeName: anotherFinding?.ShapeName,
          QualityName: anotherFinding?.QualityName,
          Colorname: anotherFinding?.Colorname,
          FindingTypename: anotherFinding?.FindingTypename,
          FindingAccessories: anotherFinding?.FindingAccessories,
          Weight: anotherFinding?.Wt,
          WeightPercentage: anotherFindingWtPercentage,
        };
      });
    });

    return {
      metalWeights,
      findingWeights,
      anotherFindingWeights,
    };
  };

  const weightDetails = calculateMetalWeights();
  // console.log("weightDetails", weightDetails);

  /////////////////////////////////////////////

  const calculateContributions = () => {
    if (!diamondTotal?.Wt) {
      console.error("Diamond total weight (diamondTotal?.Wt) is missing");
      return;
    }

    const allWeightDetails = [
      ...weightDetails.metalWeights.flat(),
      ...weightDetails.findingWeights.flat(),
      ...weightDetails.anotherFindingWeights.flat(),
    ];

    const contributions = allWeightDetails.map((item) => {
      let weight = item?.Weight || 0;
      let weightPercentage = item?.WeightPercentage || 0;

      const diamondWeight =
        json2Data.find((job) => job.J_JobNo === item.J_JobNo)?.diamondTotal
          ?.weight || 0;

      if (diamondWeight === 0) {
        return { ...item, Contribution: 0, Wt: weight };
      }

      let contribution = (weightPercentage * diamondWeight) / 100;
      contribution = contribution / 5;

      return {
        ...item,
        Contribution: contribution,
        Wt: contribution,
      };
    });

    const updatedWeightDetails = {
      metalWeights: weightDetails.metalWeights.map((metalGroup) => {
        return metalGroup.map((metal) => {
          const contribution =
            contributions.find(
              (contrib) =>
                contrib?.J_JobNo === metal?.J_JobNo &&
                contrib?.StockDocumentNo === metal?.StockDocumentNo &&
                contrib?.StockBarcode === metal?.StockBarcode &&
                contrib?.ShapeName === metal?.ShapeName &&
                contrib?.QualityName === metal?.QualityName &&
                contrib?.Colorname === metal?.Colorname
            )?.Contribution || 0;
          if (contribution > 0) {
            metal.Wt = (metal.Wt || 0) + contribution;
            metal.Weight = (metal.Weight || 0) + contribution;
          }

          return metal;
        });
      }),
      findingWeights: weightDetails.findingWeights.map((findingGroup) => {
        return findingGroup.map((finding) => {
          const contribution =
            contributions.find(
              (contrib) =>
                contrib?.J_JobNo === finding?.J_JobNo &&
                contrib?.StockDocumentNo === finding?.StockDocumentNo &&
                contrib?.StockBarcode === finding?.StockBarcode &&
                contrib?.ShapeName === finding?.ShapeName &&
                contrib?.QualityName === finding?.QualityName &&
                contrib?.Colorname === finding?.Colorname
            )?.Contribution || 0;
          if (contribution > 0) {
            finding.Wt = (finding.Wt || 0) + contribution;
            finding.Weight = (finding.Weight || 0) + contribution;
          }

          return finding;
        });
      }),
      anotherFindingWeights: weightDetails.anotherFindingWeights.map(
        (anotherFindingGroup) => {
          return anotherFindingGroup.map((anotherFinding) => {
            const contribution =
              contributions.find(
                (contrib) =>
                  contrib?.J_JobNo === anotherFinding?.J_JobNo &&
                  contrib?.StockDocumentNo ===
                    anotherFinding?.StockDocumentNo &&
                  contrib?.StockBarcode === anotherFinding?.StockBarcode &&
                  contrib?.ShapeName === anotherFinding?.ShapeName &&
                  contrib?.QualityName === anotherFinding?.QualityName &&
                  contrib?.Colorname === anotherFinding?.Colorname &&
                  contrib?.FindingTypename ===
                    anotherFinding?.FindingTypename &&
                  contrib?.FindingAccessories ===
                    anotherFinding?.FindingAccessories
              )?.Contribution || 0;

            if (contribution > 0) {
              anotherFinding.Wt = (anotherFinding.Wt || 0) + contribution;
              anotherFinding.Weight =
                (anotherFinding.Weight || 0) + contribution;
            }

            return anotherFinding;
          });
        }
      ),
    };

    return updatedWeightDetails;
  };

  const mergeMetalDiamondwt = calculateContributions();
  // console.log("mergeMetalDiamondwt", mergeMetalDiamondwt);

  const finalMetalWtTotal = json2Data?.reduce((sum, e) => {
    return sum + (e?.metalsTotal?.weight || 0);
  }, 0);

  // console.log("json2Datajson2Data", json2Data);
  // console.log("json1Data", json1Data);
  // console.log("miscTotal", miscTotal)
  // console.log("ColorStoneTotal", ColorStoneTotal)
  // console.log("total", total)
  // console.log("total,weightWithDiamondLoss", total?.weightWithDiamondLoss)
  // console.log("total,gdWt", total?.gdWt)
  // console.log("diamondTotal", diamondTotal)
  // console.log("checkBoxNew", checkBoxNew);

  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <div className="container containerDetailPrint pad_60_allPrint">
          {/* print button */}
          <div className="d-flex justify-content-end align-items-center print_sec_sum4 pb-4 mt-5 w-100">
            <div className="px-2">
              <input
                type="checkbox"
                onChange={handleChangeNew}
                checked={checkBoxNew}
              />
              <label className="user-select-none mx-1">With Header</label>
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

          {/** main Header */}
          {checkBoxNew == true && (
            <div className="sphed">
              <div className="justify-content-start spbrWord">
                <div className="spCMPnm fw-bold spbrWord">
                  {json1Data?.CompanyFullName}
                </div>
                <div>{json1Data?.CompanyAddress}</div>
                <div>{json1Data?.CompanyAddress2}</div>
                <div>
                  {json1Data?.CompanyCity}-{json1Data?.CompanyPinCode},
                  {json1Data?.CompanyState}({json1Data?.CompanyCountry})
                </div>
                <div>T {json1Data?.CompanyTellNo}</div>
                <div>
                  {json1Data?.CompanyEmail} |{json1Data?.CompanyWebsite}
                </div>
                <div>
                  {/* {json1Data?.Company_VAT_GST_No} |{" "}
                {json1Data?.Company_CST_STATE} -{" "}
                {json1Data?.Company_CST_STATE_No} | */}
                  PAN - {json1Data?.Com_pannumber}
                </div>
              </div>
              <div className="justify-content-end">
                <img
                  src={json1Data?.PrintLogo}
                  alt={checkBoxNew + " Logo"}
                  style={{ width: "90px", paddingTop: "18px" }}
                />
              </div>
            </div>
          )}

          {/* header */}
          <div
            className={`border p-1 mt-1 border-2 min_height_label lightGrey border_color_estimate`}
          >
            <p className="text-uppercase fw-bold estimatePrintFont_14">
              {json1Data?.PrintHeadLabel === ""
                ? "PO REQUEST"
                : json1Data?.PrintHeadLabel}
            </p>
          </div>
          {/* customer detail */}
          <div className="py-1 d-flex justify-content-between px-1">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div>
                <p className="estimatePrintFont_14">To</p>
                <p className="fw-bold estimatePrintFont_14">
                  {json1Data?.Manufacturer}
                </p>
              </div>
            </div>
            <div>
              <div className="d-flex justify-conetnt-between pe-3">
                <p className="mainDetailEstimate">PO Request No: </p>
                <p className="fw-bold">{json1Data?.InvoiceNo}</p>
              </div>
              <div className="d-flex justify-conetnt-between pe-3">
                <p className="mainDetailEstimate">Date: </p>
                <p className="fw-bold">{json1Data?.EntryDate}</p>
              </div>
            </div>
          </div>
          <div className="w-100">
            {/* heading */}
            <div className="border-start border-top border-end d-flex border-bottom overflow-hidden border-black lightGrey">
              <div className="srNoEstimatePrint border-end px-1 d-flex align-items-center justify-content-center border_color_estimates">
                <p className="fw-bold estimatePrintFont_11">Sr</p>
              </div>
              <div className="designEstimatePrint border-end px-1 d-flex align-items-center justify-content-center border_color_estimates">
                <p className="fw-bold estimatePrintFont_11">Design</p>
              </div>
              <div className="diamondEstimatePrint border-end border_color_estimates">
                <div className="p-1 text-center border-bottom border_color_estimates">
                  <p className="fw-bold estimatePrintFont_11">Diamond</p>
                </div>
                <div className="d-flex h-100 recordEstimatePrint">
                  <div className="Suwidth20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Code</p>
                  </div>
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Size</p>
                  </div>
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Pcs</p>
                  </div>
                  <div className="width20EstimatePrint px-1  border_color_estimates">
                    <p className="text-center fw-bold">Wt</p>
                  </div>
                </div>
              </div>
              <div className="metalEstimatePrint border-end border_color_estimates">
                <div className="p-1 text-center border-bottom border_color_estimates">
                  <p className="fw-bold estimatePrintFont_11">Metal</p>
                </div>
                <div className="d-flex h-100 recordEstimatePrint">
                  <div className="Suwidth_40_estimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Quality</p>
                  </div>
                  <div className="width_40_estimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">*Wt</p>
                  </div>
                  <div className="width_40_estimatePrint px-1 border_color_estimates">
                    <p className="text-center fw-bold">Net Wt</p>
                  </div>
                </div>
              </div>
              <div className="stoneEstimatePrint border-end border_color_estimates">
                <div className="p-1 text-center border-bottom border_color_estimates">
                  <p className="fw-bold estimatePrintFont_11">Stone</p>
                </div>
                <div className="d-flex h-100 recordEstimatePrint">
                  <div className="Suwidth20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Code</p>
                  </div>
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Size</p>
                  </div>
                  <div className="width20EstimatePrint px-1 border-end border_color_estimates">
                    <p className="text-center fw-bold">Pcs</p>
                  </div>
                  <div className="width20EstimatePrint px-1 border_color_estimates">
                    <p className="text-center fw-bold">Wt</p>
                  </div>
                </div>
              </div>
            </div>
            {/** data */}
            <div
              style={{
                paddingBottom: "5px",
                borderRight: "1px solid black",
                borderLeft: "1px solid black",
              }}
            >
              {json2Data.length > 0 &&
                json2Data.map((e, i) => {
                  return (
                    <div
                      className={`d-flex border-bottom recordEstimatePrint overflow-hidden word_break_estimatePrint 
                        ${
                          i === 6 && json2Data.length > 6
                            ? "print-top-border"
                            : ""
                        }
                        ${
                          i === 4 && json2Data.length > 4
                            ? "print_top_border_land"
                            : ""
                        }
                        `}
                      key={i}
                    >
                      <div className="srNoEstimatePrint border-end p_1Estimate border_color_estimates">
                        <p className="text-center">{i + 1}</p>
                      </div>
                      <div className="designEstimatePrint border-end  border_color_estimates d-flex justify-content-between flex-column">
                        <div className="d-flex justify-content-between p_1Estimate">
                          <div className="spbrWord">{e?.designno}</div>
                          {e?.Quantity !== null && (
                            <div className="spbrWord">QTY:{e?.Quantity}</div>
                          )}
                          <div className="text-end spbrWord">{e?.J_JobNo}</div>
                        </div>
                        {/* <div className="spbrWord" style={{ textAlign: "left", fontWeight: "bold" }}>{e?.JobSKUNo}</div>
                        <div className="spbrWord" style={{ textAlign: "center", fontWeight: "bold" }}>
                          {e?.Categoryname}
                        </div> */}
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
                        <div className="text-center">
                          {/* <p
                            className="w-100 fw-bold"
                            style={{ padding: "1px 0px 1px 5px" }}
                          >
                            {e?.MetalColor}
                          </p> */}
                          <p className="w-100 ps-1">
                            Size : <b>{e?.Size}</b>
                          </p>
                          {e?.uniqueno !== "" && (
                            <p className="w-100 ps-1">
                              Unique : <b>{e?.uniqueno}</b>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="diamondEstimatePrint border-end position-relative border_color_estimates">
                        <div className="pad_bot_29_estimatePrint">
                          {e?.diamonds.length > 0 &&
                            e?.diamonds.map((ele, ind) => {
                              return (
                                <div className="d-flex " key={ind}>
                                  <div className="Suwidth20EstimatePrint p_1Estimate">
                                    <p className="spspcLft spbrWord">
                                     {ele?.IsSolGem === 1 ? "S: " : ""} {ele?.ShapeName} {ele?.QualityName}{" "}
                                      {ele?.Colorname}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-center">
                                      {ele?.SizeName}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-center">
                                      {NumberWithCommas(ele?.Pcs, 0)}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {fixedValues(ele?.Wt, 2)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                        <div
                          className={`d-flex totalBgEstimatePrint position-absolute bottom-0 height_28_5_estimatePrint w-100 border-top border_color_estimates ${
                            e?.diamonds.length === 0 &&
                            "border-top height_28_5_estimatePrint border_color_estimates"
                          }`}
                        >
                          <div className="Suwidth20EstimatePrint p_1Estimate">
                            <p className="fw-bold"></p>
                          </div>
                          <div className="width20EstimatePrint p_1Estimate">
                            <p className="text-center fw-bold"></p>
                          </div>
                          <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-center">
                            <p className="text-center fw-bold">
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
                        </div>
                      </div>
                      <div className="metalEstimatePrint border-end position-relative border_color_estimates">
                        {/* <div className='h-100 d-grid pad_bot_29_estimatePrint'> */}
                        <div className="pad_bot_29_estimatePrint">
                          {e?.metals?.map((el, ol) => (
                            <div className="d-flex" key={ol}>
                              <div className="Suwidth_40_estimatePrint p_1Estimate">
                                <p className="spspcLft spbrWord">
                                  {el?.ShapeName} {el?.QualityName} (
                                  {el?.Colorname})
                                </p>
                              </div>
                              <div className="width_40_estimatePrint p_1Estimate">
                                {(() => {
                                  const matchedItems =
                                    mergeMetalDiamondwt?.metalWeights
                                      ?.flat()
                                      .filter(
                                        (ele) =>
                                          e?.J_JobNo === ele?.J_JobNo &&
                                          el?.ShapeName === ele?.ShapeName &&
                                          el?.QualityName ===
                                            ele?.QualityName &&
                                          el?.Colorname === ele?.Colorname
                                      );

                                  if (matchedItems && matchedItems.length > 0) {
                                    return matchedItems.map((ele, idx) => (
                                      <p key={idx} className="text-end">
                                        {fixedValues(ele?.Weight, 2)}
                                      </p>
                                    ));
                                  } else {
                                    return (
                                      <p className="text-end">
                                        {fixedValues(el?.Wt, 2)}
                                      </p>
                                    );
                                  }
                                })()}
                              </div>
                              <div className="width_40_estimatePrint p_1Estimate">
                                <p className="text-end ">
                                  {fixedValues(el?.Wt, 2)}
                                </p>
                              </div>
                            </div>
                          ))}
                          {e?.finding?.map((el, ol) => {
                            return (
                              <div className="d-flex" key={ol}>
                                <div className="Suwidth_40_estimatePrint p_1Estimate">
                                  <p className="spspcLft spbrWord">
                                    {el?.FindingTypename}{" "}
                                    {el?.FindingAccessories}
                                  </p>
                                </div>
                                <div className="width_40_estimatePrint p_1Estimate">
                                  <p className="text-end">
                                    {(() => {
                                      const matchedItems =
                                        mergeMetalDiamondwt?.findingWeights
                                          ?.flat()
                                          .filter(
                                            (ele) =>
                                              e?.J_JobNo === ele?.J_JobNo &&
                                              el?.ShapeName ===
                                                ele?.ShapeName &&
                                              el?.QualityName ===
                                                ele?.QualityName &&
                                              el?.Colorname === ele?.Colorname
                                          );

                                      if (
                                        matchedItems &&
                                        matchedItems.length > 0
                                      ) {
                                        return matchedItems.map((ele, idx) => (
                                          <p key={idx} className="text-end">
                                            {fixedValues(ele?.Weight, 2)}
                                          </p>
                                        ));
                                      } else {
                                        return (
                                          <p className="text-end">
                                            {fixedValues(el?.Wt, 2)}
                                          </p>
                                        );
                                      }
                                    })()}
                                  </p>
                                </div>
                                <div className="width_40_estimatePrint p_1Estimate">
                                  <p className="text-end">
                                    {fixedValues(el?.Wt, 2)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          {e?.anotherFinding?.map((el, ol) => {
                            return (
                              <>
                                <div className="d-flex" key={ol}>
                                  <div className="Suwidth_40_estimatePrint p_1Estimate">
                                    <p className="spspcLft spbrWord">
                                      {el?.ShapeName} {el?.QualityName} (
                                      {el?.Colorname})
                                    </p>
                                  </div>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {(() => {
                                        const matchedItems =
                                          mergeMetalDiamondwt?.anotherFindingWeights
                                            ?.flat()
                                            .filter(
                                              (ele) =>
                                                e?.J_JobNo === ele?.J_JobNo &&
                                                el?.ShapeName ===
                                                  ele?.ShapeName &&
                                                el?.QualityName ===
                                                  ele?.QualityName &&
                                                el?.Colorname ===
                                                  ele?.Colorname &&
                                                el?.FindingTypename ===
                                                  ele?.FindingTypename &&
                                                el?.FindingAccessories ===
                                                  ele?.FindingAccessories
                                            );

                                        if (
                                          matchedItems &&
                                          matchedItems.length > 0
                                        ) {
                                          return matchedItems.map(
                                            (ele, idx) => (
                                              <p key={idx} className="text-end">
                                                {fixedValues(ele?.Weight, 2)}
                                              </p>
                                            )
                                          );
                                        } else {
                                          return (
                                            <p className="text-end">
                                              {fixedValues(el?.Wt, 2)}
                                            </p>
                                          );
                                        }
                                      })()}
                                    </p>
                                  </div>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {fixedValues(el?.Wt, 2)}
                                    </p>
                                  </div>
                                </div>
                                <div className="d-flex">
                                  <div className="Suwidth_40_estimatePrint p_1Estimate">
                                    <p className="spspcLft spbrWord">
                                      {el?.FindingTypename}{" "}
                                      {el?.FindingAccessories}
                                    </p>
                                  </div>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {/* {fixedValues(ele?.Wt,2)} */}
                                    </p>
                                  </div>
                                  <div className="width_40_estimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {/* {fixedValues(ele?.Wt,2)} */}
                                    </p>
                                  </div>
                                </div>
                              </>
                            );
                          })}
                          {e?.PromiseDate !== "" && e?.PromiseDate !== null && (
                            <p className="w-100 spspcLft spbrdrTop spbrWord">
                              Promise Dt : <b>{e?.PromiseDate}</b>
                            </p>
                          )}
                          {e?.JobRemark !== "" && (
                            <div className="spspcLft px-1 spbrWord">
                              <p>Remark:</p>
                              <p className="fw-bold spbrWord">
                                {" "}
                                {e?.JobRemark}
                              </p>
                            </div>
                          )}
                        </div>
                        <div
                          className={`d-flex totalBgEstimatePrint position-absolute bottom-0 height_28_5_estimatePrint w-100 border-top border_color_estimates 
                          ${
                            e?.metals.length === 0 &&
                            "border-top height_28_5_estimatePrint"
                          }`}
                        >
                          <div className="Suwidth200EstimatePrint p_1Estimate">
                            <p></p>
                          </div>
                          <div className="width200EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
                            <p className="text-end fw-bold">
                              {fixedValues(e?.metalsTotal?.weight, 2)}
                            </p>
                          </div>
                          <div className="width200EstimatePrint p_1Estimate d-flex align-items-center justify-content-end">
                            <p className="text-end fw-bold">
                              {fixedValues(e?.NetWt, 2)} {/* + e?.LossWt */}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="stoneEstimatePrint position-relative border_color_estimates">
                        <div className="pad_bot_29_estimatePrint">
                          {e?.colorStones.length > 0 &&
                            e?.colorStones.map((ele, ind) => {
                              return (
                                <div className="d-flex " key={ind}>
                                  <div className="Suwidth20EstimatePrint p_1Estimate">
                                    <p className="spspcLft spbrWord">
                                    {ele?.IsSolGem === 1 ? "G: " : ""} {ele?.ShapeName} {ele?.QualityName}{" "}
                                      {ele?.Colorname}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-center">
                                      {ele?.SizeName}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-center">
                                      {ele?.Pcs > 0 &&
                                        NumberWithCommas(ele?.Pcs, 0)}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {ele?.Wt > 0 && fixedValues(ele?.Wt, 2)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          {/* {e?.mics.length > 0 &&
                            e?.mics.map((ele, ind) => {
                              return (
                                <div className="d-flex" key={ind}>
                                  <div className="Suwidth20EstimatePrint p_1Estimate">
                                    <p className="spspcLft spbrWord">
                                      {ele?.ShapeName} {ele?.QualityName}{" "}
                                      {/* {ele?.Colorname}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-center">{ele?.SizeName}</p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-center">
                                      {ele?.Pcs > 0 &&
                                        NumberWithCommas(ele?.Pcs, 0)}
                                    </p>
                                  </div>
                                  <div className="width20EstimatePrint p_1Estimate">
                                    <p className="text-end">
                                      {ele?.Wt > 0 && fixedValues(ele?.Wt,2)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })} */}
                        </div>
                        <div
                          className={`d-flex totalBgEstimatePrint position-absolute bottom-0 height_28_5_estimatePrint w-100 border-top border_color_estimates `}
                        >
                          <div className="Suwidth20EstimatePrint p_1Estimate">
                            <p></p>
                          </div>
                          <div className="width20EstimatePrint p_1Estimate">
                            <p></p>
                          </div>
                          <div className="width20EstimatePrint p_1Estimate d-flex align-items-center justify-content-center">
                            <p className="text-center fw-bold">
                              {(e?.colorStones?.length > 0 ||
                                e?.mics.length > 0) && (
                                <>
                                  {NumberWithCommas(
                                    e?.colorStonesTotal?.pcs,
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
                                  {fixedValues(e?.colorStonesTotal?.weight, 2)}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            {/* total */}
            <div className="d-flex recordEstimatePrint overflow-hidden border-end border-start border-bottom border-black totalBgEstimatePrint">
              <div className="totalEstimatePrint border-end totalBgEstimatePrint border_color_estimates">
                <p className="text-center fw-bold h-100">Total</p>
              </div>
              <div className="diamondEstimatePrint border-end border_color_estimates">
                <div className="d-flex  w-100">
                  <div className="Suwidth20EstimatePrint p_1Estimate h-100">
                    <p></p>
                  </div>
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p></p>
                  </div>
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p className="text-center fw-bold">
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
                </div>
              </div>
              <div className="metalEstimatePrint border-end border_color_estimates">
                <div className="d-flex totalBgEstimatePrint bottom-0 w-100">
                  <div className="Suwidth200EstimatePrint p_1Estimate h-100">
                    <p className="fw-bold fw-bold"></p>
                  </div>
                  <div className="width200EstimatePrint p_1Estimate h-100">
                    <p className="fw-bold fw-bold text-end">
                      {formatAmount(finalMetalWtTotal, 2)}
                      {/* {total?.weightWithDiamondLoss !== 0 &&
                        fixedValues( total?.weightWithDiamondLoss,2)} */}
                    </p>
                  </div>
                  <div className="width200EstimatePrint p_1Estimate h-100">
                    <p className="fw-bold fw-bold text-end">
                      {total?.gdWt !== 0 && NumberWithCommas(total?.gdWt, 2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="stoneEstimatePrint border_color_estimates">
                <div className="d-flex totalBgEstimatePrint bottom-0 w-100">
                  <div className="Suwidth20EstimatePrint p_1Estimate h-100">
                    <p className="fw-bold"></p>
                  </div>
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p className="fw-bold"></p>
                  </div>
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p className="text-center fw-bold">
                      {ColorStoneTotal?.Pcs !== 0 &&
                        NumberWithCommas(ColorStoneTotal?.Pcs, 0)}
                    </p>
                  </div>
                  <div className="width20EstimatePrint p_1Estimate h-100">
                    <p className="text-end fw-bold">
                      {ColorStoneTotal?.Wt !== 0 &&
                        fixedValues(ColorStoneTotal?.Wt, 2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex mt-1 recordEstimatePrint justify-content-between overflow-hidden border-start border-end border_color_estimates top-border">
              {/* summary */}
              <div
                className="border-end border-bottom border-top position-relative summaryEstimateprint border_color_estimates outsouce_detail_summury_box"
                style={{ width: "8%" }}
              >
                <div className="totalBgEstimatePrint sphit text-center border-bottom border_color_estimates">
                  <p className="fw-bold spmrg">SUMMARY</p>
                </div>
                <div className="d-grid w-100 pb-2">
                  <div className="d-flex w-100 justify-content-between">
                    <div className="w-100 pb-2">
                      {total?.gold24Kt !== 0 && (
                        <div className="d-flex justify-content-between px-1">
                          <p className="fw-bold">GOLD IN 24KT</p>
                          <p>
                            {fixedValues(
                              total?.gold24Kt - notGoldMetalWtTotal,
                              2
                            )}{" "}
                            gm
                          </p>
                        </div>
                      )}
                      {MetShpWise?.map((e, i) => {
                        return (
                          <div
                            className="d-flex justify-content-between px-1"
                            key={i}
                          >
                            <p className="fw-bold">{e?.ShapeName}</p>
                            <p>{NumberWithCommas(e?.metalfinewt, 2)} gm</p>
                          </div>
                        );
                      })}
                      {total?.grosswt !== 0 && (
                        <div className="d-flex justify-content-between px-1">
                          <p className="fw-bold">GROSS WT</p>
                          <p>{fixedValues(total?.grosswt, 3)} gm</p>
                        </div>
                      )}
                      {total?.weightWithDiamondLoss !== 0 && (
                        <div className="d-flex justify-content-between px-1">
                          <p className="fw-bold">G+D WT</p>
                          <p>
                            {fixedValues(total?.weightWithDiamondLoss, 2)} gm
                          </p>
                        </div>
                      )}
                      {total?.gdWt !== 0 && (
                        <div className="d-flex justify-content-between px-1">
                          <p className="fw-bold">NET WT</p>
                          <p>{fixedValues(total?.gdWt, 2)} gm</p>
                        </div>
                      )}
                      {(total?.diaPcs - ColorStoneTotal?.Pcs) === 0 || (diamondTotal?.Wt-soliatireTotal?.Wt) === 0 ? (
                        ""
                      ) : (
                        <div className="d-flex justify-content-between px-1">
                          <p className="fw-bold">DIAMOND WT</p>
                          <p>
                            {NumberWithCommas(total?.diaPcs - ColorStoneTotal?.Pcs, 0)} /{" "}
                            {NumberWithCommas(diamondTotal?.Wt-soliatireTotal?.Wt, 3)} cts
                          </p>
                        </div>
                      )}
                       {total?.solitairePcs === 0 || soliatireTotal?.Wt === 0 ? (
                        ""
                      ) : (
                        <div className="d-flex justify-content-between px-1">
                          <p className="fw-bold">SOLITAIRE WT</p>
                          <p>
                            {NumberWithCommas(total?.solitairePcs, 0)} /{" "}
                            {NumberWithCommas(soliatireTotal?.Wt, 3)} cts
                          </p>
                        </div>
                      )}
                      {/** ColorStoneTotal?.Pcs === 0 || ColorStoneTotal?.Wt === 0 ? ( "" ) : 
                      // ( */}
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">STONE WT</p>
                        <p>
                          {NumberWithCommas(ColorStoneTotal?.Pcs, 0)} /{" "}
                          {fixedValues(ColorStoneTotal?.Wt, 2)} cts
                        </p>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <p className="fw-bold">GEMSTONE WT</p>
                        <p>
                          {NumberWithCommas(total?.gemstonePcs, 0)} /{" "}
                          {fixedValues(gemstoneTotal?.Wt, 2)} cts
                        </p>
                      </div>
                      {/** )}*/}
                      {/* {miscTotal?.Pcs === 0 || miscTotal?.Wt === 0 ? ( "" ) : 
                      (
                        <div className="d-flex justify-content-between px-1">
                          <p className="fw-bold">MISC WT</p>
                          <p>
                            {NumberWithCommas(miscTotal?.Pcs, 0)} /{" "}
                            {fixedValues(miscTotal?.Wt,2)} gm
                          </p>
                        </div>
                      )} */}
                      {total?.findingWeight !== 0 && (
                        <div className="d-flex justify-content-between px-1">
                          <p className="fw-bold">FINDING WT</p>
                          <p>{fixedValues(total?.findingWeight, 2)} gm</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="d-flex totalBgEstimatePrint position-absolute bottom-0 w-100 border-top border_color_estimates">
                  <div className="px-1 w-100 min_height_24_estimatePrint border_color_estimates"></div>
                </div>
              </div>

              {/* created by */}
              <div
                className="d-flex border-start col-1 border-bottom border-top border_color_estimates outsouce_detail_created_box"
                style={{ width: "5%" }}
              >
                <div className="d-flex w-100">
                  <div className="position-relative d-flex justify-conten-center align-items-end w-100">
                    <i className="w-100 text-center">Checked By </i>
                  </div>
                </div>
              </div>
            </div>
            {/* <p style={{ fontSize: "9px", color: "#999999" }}>
              Printed on : {formatDateTime()}
            </p> */}
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

export default OutsourceDeatilPrint;
