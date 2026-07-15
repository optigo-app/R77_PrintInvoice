// http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=NTQ3&evn=T3V0U291cmNl&pnm=T3V0c291cmNlIEpvYiBQcmludCAy&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=OutsourceJobPrint&pid=undefined
import React, { useEffect, useState } from "react";
import "../../assets/css/prints/outsourceJobPrint2.css";
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
import { cloneDeep, filter } from "lodash";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";
import BarcodeGenerator from "../../components/BarcodeGenerator";
const OutsourceJobPrint2 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  const [image, setImage] = useState(true);
  const [json1Data, setJson1Data] = useState({});
  const [json2Data, setJson2Data] = useState([]);
  const [otherCharges, setOtherCharges] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [diamondDetailss, setDiamondDetailss] = useState({});
  const [checkBoxNew, setCheckBoxNew] = useState("Single Stone");
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
          accumulator.pcs += currentObject.Pcs;
          accumulator.rate += currentObject.Rate;
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
          miscs.push(eem);
        } else {
          miscs[findrec].Wt += eem?.Wt;
          miscs[findrec].Pcs += eem?.Pcs;
          miscs[findrec].Amount += eem?.Amount;
          miscs[findrec].SizeName = eem?.SizeName;
        }
      });
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

  // const maxRowsPerSide = 12;
  // const totalMaxRows = 24;
  // const combinedByJob = json2Data.map(e => {
  //   const diamonds = Array.isArray(e?.diamonds) ? e.diamonds : [];
  //   const mics = Array.isArray(e?.mics) ? e.mics : [];
  //   const colorStones = Array.isArray(e?.colorStones) ? e.colorStones : [];

  //   const count =
  //     (diamonds.length > 0 ? 1 : 0) +
  //     (mics.length > 0 ? 1 : 0) +
  //     (colorStones.length > 0 ? 1 : 0);

  //   return {
  //     SrJobno: e.SrJobno,
  //     combinedItems: [...diamonds, ...colorStones, ...mics],
  //     typeCount: count 
  //   };
  // });

  // const maxTypesUsed = Math.max(...combinedByJob.map(job => job.typeCount));

  // console.log("Combined per job:", combinedByJob);
  // console.log("Max types used in a single job:", maxTypesUsed);

  // const finalTotalMaxRows = totalMaxRows - maxTypesUsed;
  // console.log("finalTotalMaxRows",finalTotalMaxRows);



  const buildMaterialRows = (e) => {
    const maxRows = 20;

    const addRowsWithTotal = (items, type, filterFn = null) => {
      if (!Array.isArray(items) || items.length === 0) return [];

      // Apply filter if provided
      const filteredItems = filterFn ? items.filter(filterFn) : items;

      if (filteredItems.length === 0) return [];

      const rows = filteredItems.map((item) => ({ type, data: item }));

      const totalPcs = filteredItems.reduce((sum, curr) => sum + (Number(curr?.Pcs) || 0), 0);
      const totalWt = filteredItems.reduce((sum, curr) => sum + (Number(curr?.Wt) || 0), 0);

      return [...rows, { type: `${type}-total`, totalPcs, totalWt }];
    };

    const diamondRows = addRowsWithTotal(e?.diamonds, "diamond");
    const colorStoneRows = addRowsWithTotal(e?.colorStones, "colorStone");

    // Apply filter for mics: only include if ismiscwtaddingrossweight === 1
    const micsRows = addRowsWithTotal(
      e?.mics,
      "mics",
      (item) => Number(item?.ismiscwtaddingrossweight) === 1
    );

    let finalRows = [...diamondRows, ...colorStoneRows, ...micsRows];

    // Ensure 20 rows
    if (finalRows.length > maxRows) {
      finalRows = finalRows.slice(0, maxRows);
    }
    while (finalRows.length < maxRows) {
      finalRows.push({ type: "empty" });
    }

    return finalRows;
  };


  // const renderRow = (row) => {
  //   if (row.type === 'empty') {
  //     return (
  //       <>
  //         <div className="dtlWdth1 spbrdRght spbrdrBtom estimatePrintFont_14 Sesptxtend"></div>
  //         <div className="dtlWdth2 spbrdRght spbrdrBtom estimatePrintFont_14 Sesptxtend"></div>
  //         <div className="dtlWdth3 spbrdRght spbrdrBtom estimatePrintFont_14 Sesptxtend"></div>
  //         <div className="dtlWdth4 spbrdrBtom estimatePrintFont_14 Sesptxtend"></div>
  //       </>
  //     );
  //   }

  //   if (row.type.endsWith('-total')) {
  //     const label =
  //       row.type.startsWith('diamond') ? 'D TOTAL' :
  //       row.type.startsWith('colorStone') ? 'C TOTAL' :
  //       'TOTAL';

  //     return (
  //       <>
  //         <div className="dtlWdth1 estimatePrintFont_9 spbrdRght spbrdrBtom Sesptxtend spBold">{label}</div>
  //         <div className="dtlWdth2 estimatePrintFont_9 spbrdRght spbrdrBtom Sesptxtend"></div>
  //         <div className="dtlWdth3 estimatePrintFont_9 spbrdRght spbrdrBtom Sesptxtend">{row.totalPcs || 0}</div>
  //         <div className="dtlWdth4 estimatePrintFont_9 spbrdrBtom Sesptxtend">
  //           {row.totalWt != null ? fixedValues(row.totalWt, 3) : "0.000"}
  //         </div>
  //       </>
  //     );
  //   }

  //   const item = row.data;

  //   return (
  //     <>
  //       <div className="dtlWdth1 spbrdRght spbrWord spbrdrBtom estimatePrintFont_141 Sesptxtend">
  //         <p className="spbrWord">
  //           {[item?.Shape_Code, item?.Quality_Code, item?.Color_Code]
  //             .filter(val => val && val !== "-")
  //             .join("/")}
  //         </p>
  //       </div>
  //       <div className="dtlWdth2 spbrdRght spbrdrBtom estimatePrintFont_14 Sesptxtend">
  //         {item?.SizeName || ""}
  //       </div>
  //       <div className="dtlWdth3 spbrdRght spbrdrBtom estimatePrintFont_14 Sesptxtend">
  //         {item?.Pcs || ""}
  //       </div>
  //       <div className="dtlWdth4 spbrdrBtom estimatePrintFont_14 Sesptxtend">
  //         {item?.Wt != null ? fixedValues(item?.Wt, 3) : ""}
  //       </div>
  //     </>
  //   );
  // };


  // console.log("json2Data", json2Data);
  // console.log("json1Data", json1Data);

  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <>
          {/* print button */}
          <div className="d-flex justify-content-end align-items-center print_sec_sum4 pb-4 mt-5">
            <div className="form-check ps-3">
              <input
                type="button"
                className="btn_white blue mt-0"
                value="Print"
                onClick={(e) => handlePrint(e)}
              />
            </div>
          </div>
          <div className="spdispFlx1" >
            {/* <div className="spdispFlx1" style={{flexDirection: "column",}}> */}
            {json2Data?.map((e, index) => {
              const finalRows = buildMaterialRows(e);
              return (
                <>
                  <div key={index} className="mainWdthHeit spBtomspc" >
                    {/* <div key={index} className="mainWdthHeit spBtomspc" style={{pageBreakBefore: "always"}}> */}

                    <div className="w-100">
                      {/** Upper Section */}
                      <div className="spdispFlxClum w-100 spdtl1">
                        <div className="spMrgdt1">

                          <div className="spdispFlx spbrdrLft brdrRdusTop spbrdRght spbrdrTop">
                            <div className="Suspdtl1">
                              <div className="spBold sptxtend spbrdRght spbrdrBtom estimatePrintFont_9 spdispFlx justify-content-between align-items-center">
                                <div>{e?.J_JobNo}</div>
                                <div>{e?.designno}</div>
                                <div className="" style={{ paddingRight: "2px" }}>
                                  {e?.metals?.filter(el => el?.IsPrimaryMetal == 1)?.map((el) => (`${el?.ShapeName} ${el?.QualityName} ${el?.Colorname}`))}
                                </div>
                              </div>
                              <div className="spBold spbrdRght sptxtend spbrdrBtom estimatePrintFont_9 spdispFlx">
                                <div className="SUspspdtl1 spbrdRght spdispFlx align-items-center">Cust.</div>
                                <div className="spspdtl1 spbrdRght spdispFlx align-items-center" style={{ paddingLeft: "2px" }}>{json1Data?.Customercode}</div>
                                <div className="SUspspdtl1 spbrdRght spdispFlx align-items-center" style={{ paddingLeft: "2px" }}>Sales Rep.</div>
                                <div className="spspdtl1 spdispFlx align-items-center" style={{ paddingLeft: "2px" }}>{json1Data?.SalesRepName}</div>
                              </div>
                              <div className="spBold spbrdRght sptxtend spbrdrBtom estimatePrintFont_9 spdispFlx">
                                <div className="SUspspdtl1 spbrdRght spdispFlx align-items-center">Size</div>
                                <div className="spspdtl1 spbrdRght spdispFlx align-items-center" style={{ paddingLeft: "2px" }}>{e?.Size}</div>
                                <div className="SUspspdtl1 spbrdRght spdispFlx align-items-center" style={{ paddingLeft: "2px" }}>PO</div>
                                <div className="spspdtl1 spdispFlx align-items-center" style={{ paddingLeft: "2px" }}>{e?.PO}</div>
                              </div>
                              <div className="spBold spbrdRght sptxtend spbrdrBtom estimatePrintFont_9 spdispFlx">
                                <div className="SUspspdtl1 spbrdRght spdispFlx align-items-center">Order</div>
                                <div className="spspdtl1 spbrdRght spdispFlx align-items-center" style={{ paddingLeft: "2px" }}>{e?.EntryDate}</div>
                                <div className="SUspspdtl1 spbrdRght spdispFlx justify-content-center align-items-center">Metal</div>
                                <div className="spspdtl1 spdispFlx">
                                  <div className="spspdtl2 spbrdRght spdispFlx justify-content-center align-items-center">Dia.</div>
                                  <div className="spspdtl2 spdispFlx justify-content-center align-items-center">CST</div>
                                </div>
                              </div>
                              <div className="spBold spbrdRght sptxtend spbrdrBtom estimatePrintFont_9 spdispFlx">
                                <div className="SUspspdtl1 spbrdRght spdispFlx align-items-center">Delivery</div>
                                <div className="spspdtl1 spbrdRght spdispFlx align-items-center" style={{ paddingLeft: "2px" }}>{e?.PromiseDate}</div>
                                <div className="SUspspdtl1 spbrdRght spdispFlx justify-content-center align-items-center">{fixedValues(e?.metalsTotal?.weight, 3)}</div>
                                <div className="spspdtl1 spdispFlx">
                                  <div className="spspdtl2 spbrdRght spdispFlx justify-content-center align-items-center margnBtom">
                                    {(e?.diamondTotal?.pcs > 0 || e?.diamondTotal?.weight > 0) && (
                                      <>
                                        {e?.diamondTotal?.pcs > 0 && (
                                          <>
                                            {e.diamondTotal.pcs}
                                            {e?.diamondTotal?.weight > 0 && " /"}
                                          </>
                                        )}
                                        {e?.diamondTotal?.pcs > 0 && e?.diamondTotal?.weight > 0 && <br />}
                                        {e?.diamondTotal?.weight > 0 && fixedValues(e?.diamondTotal?.weight, 3)}
                                      </>
                                    )}
                                  </div>
                                  <div className="spspdtl2 spdispFlx justify-content-center align-items-center margnBtom">
                                    {(e?.colorStonesTotal?.pcs > 0 || e?.colorStonesTotal?.weight > 0) && (
                                      <>
                                        {e?.colorStonesTotal?.pcs > 0 && (
                                          <>
                                            {e.colorStonesTotal.pcs}
                                            {e?.colorStonesTotal?.weight > 0 && " /"}
                                          </>
                                        )}
                                        {e?.colorStonesTotal?.pcs > 0 && e?.colorStonesTotal?.weight > 0 && <br />}
                                        {e?.colorStonesTotal?.weight > 0 && fixedValues(e?.colorStonesTotal?.weight, 3)}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="Suspdtl3 spbrdrBtom">
                              <img
                                src={e?.DesignImage}
                                alt=""
                                className="estimate_img spdispFlx"
                                onError={handleImageError}
                                onLoad={handleImageLoad}
                              />
                            </div>
                          </div>

                          <div
                            className="spBold sptxtend spbrdrLft spbrdRght spbrdrBtom spdispFlx align-items-center spnfntIns estimatePrintFont_9 spMrgBFive spMrgTFive"
                            style={{ height: "20px", color: "red" }}
                          >
                            Instruction: {e?.JobRemark}
                          </div>
                        </div>
                      </div>

                      {/** Bottom Section */}
                      <div className="spdispFlx spMrgdt10">
                        <div className="spdtl2 spbrdRght spbrdrLft">
                          <div className="spdispFlx">
                            <div className="dtlWdth1 spbrdRght spbrdrBtom estimatePrintFont_9 sptxtCn spBold sptxtend">RM CODE</div>
                            <div className="dtlWdth2 spbrdRght spbrdrBtom estimatePrintFont_9 sptxtCn spBold sptxtend">RM SIZE</div>
                            <div className="dtlWdth3 spbrdRght spbrdrBtom estimatePrintFont_9 sptxtCn spBold sptxtend">ACTUAL</div>
                            <div className="dtlWdth4 spbrdrBtom estimatePrintFont_9 sptxtCn spBold sptxtend">ISSUE</div>
                          </div>

                          <div>
                            {finalRows.map((row, i) => {
                              // define renderRow function inside map callback, so it has access to row
                              const renderRow = (row) => {
                                if (row.type === 'empty') {
                                  return (
                                    <>
                                      <div className="dtlWdth1 spbrdRght spbrdrBtom estimatePrintFont_14 Sesptxtend"></div>
                                      <div className="dtlWdth2 spbrdRght spbrdrBtom estimatePrintFont_14 Sesptxtend"></div>
                                      <div className="dtlWdth3 spbrdRght spbrdrBtom estimatePrintFont_14 Sesptxtend" style={{ flexDirection: "row" }}>
                                        <div className="spbrdRght" style={{ width: "40%" }}></div>
                                        <div style={{ width: "60%" }}></div>
                                      </div>
                                      <div className="dtlWdth4 spbrdrBtom estimatePrintFont_14 Sesptxtend" style={{ flexDirection: "row" }}>
                                        <div className="spbrdRght" style={{ width: "40%" }}></div>
                                        <div style={{ width: "60%" }}></div>
                                      </div>
                                    </>
                                  );
                                }

                                if (row.type.endsWith('-total')) {
                                  const label =
                                    row.type.startsWith('diamond') ? 'D TOTAL' :
                                      row.type.startsWith('colorStone') ? 'C TOTAL' :
                                        row.type.startsWith('mics') ? 'M TOTAL' :
                                          'TOTAL';

                                  return (
                                    <>
                                      <div className="dtlWdth1 estimatePrintFont_9 spbrdRght spbrdrBtom Sesptxtend spBold">{label}</div>
                                      <div className="dtlWdth2 estimatePrintFont_9 spbrdRght spbrdrBtom Sesptxtend"></div>
                                      <div className="dtlWdth3 estimatePrintFont_9 spbrdRght spbrdrBtom Sesptxtend spBold" style={{ flexDirection: "row" }}>
                                        <div className="spbrdRght d-flex align-items-center" style={{ width: "40%" }}>{row.totalPcs || 0}</div>
                                        <div className="d-flex align-items-center" style={{ width: "60%", paddingLeft: "2px" }}>{row.totalWt != null ? fixedValues(row.totalWt, 3) : ""}</div>
                                      </div>
                                      <div className="dtlWdth4 estimatePrintFont_9 spbrdrBtom Sesptxtend spBold" style={{ flexDirection: "row" }}>
                                        <div className="spbrdRght" style={{ width: "40%" }}></div>
                                        <div style={{ width: "60%" }}></div>
                                      </div>
                                    </>
                                  );
                                }

                                const item = row.data;

                                return (
                                  <>
                                    <div className="dtlWdth1 spbrdRght spbrWord spbrdrBtom estimatePrintFont_141 Sesptxtend">
                                      <p className="spbrWord">
                                        {[item?.Shape_Code, item?.Quality_Code, item?.Color_Code]
                                          .filter(val => val && val !== "-")
                                          .join("/")}
                                      </p>
                                    </div>
                                    <div className="dtlWdth2 spbrdRght spbrdrBtom estimatePrintFont_14 Sesptxtend">
                                      {item?.SizeName || ""}
                                    </div>
                                    <div className="dtlWdth3 spbrdRght spbrdrBtom estimatePrintFont_14 Sesptxtend" style={{ flexDirection: "row" }}>
                                      <div className="spbrdRght d-flex align-items-center" style={{ width: "40%" }}>{item?.Pcs || ""}</div>
                                      <div className="d-flex align-items-center" style={{ width: "60%", paddingLeft: "3px" }}>{item?.Wt != null ? fixedValues(item?.Wt, 3) : ""}</div>
                                    </div>
                                    <div className="dtlWdth4 spbrdrBtom estimatePrintFont_14 Sesptxtend" style={{ flexDirection: "row" }}>
                                      <div className="spbrdRght" style={{ width: "40%" }}></div>
                                      <div style={{ width: "60%" }}></div>
                                    </div>
                                  </>
                                );
                              };

                              return (
                                <div key={i} className="spdispFlx">
                                  {renderRow(row)}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="spbrdRght spbrdrBtom barcode_second" style={{ width: "10%", alignContent: "center" }}>
                          <BarcodeGenerator
                            data={e?.J_JobNo}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="spMrgdt1 sptxtend spbrdrLft spbrdRght spbrdrBtom brdrRdusBtom" style={{ height: "20px", }}></div>
                  </div>
                </>
              )
            })}
          </div>
        </>
      ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
          {msg}
        </p>
      )}
    </>
  );
};

export default OutsourceJobPrint2;
