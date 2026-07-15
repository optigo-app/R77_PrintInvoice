// http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=UjUzMw==&evn=QWx0ZXJhdGlvbg==&pnm=UHJvZHVjdCBBbHRlcmF0aW9u&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=RepairPrint&pid=undefined
import React, { useEffect, useState } from "react";
import "../../assets/css/prints/productAlterationPrint.css";
import {
  ReceiveInBank,
  apiCall,
  checkMsg,
  fixedValues,
  handleImageError,
  handlePrint,
  isObjectEmpty,
  otherAmountDetail,
  taxGenrator,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import { cloneDeep } from "lodash";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";
import { borderLeft } from "@mui/system";
const ProductPrint = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  const [json1Data, setJson1Data] = useState({});
  const [json2Data, setJson2Data] = useState([]);
  const [otherCharges, setOtherCharges] = useState(0);
  const [msg, setMsg] = useState("");
  const [diamondDetailss, setDiamondDetailss] = useState({});
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
      let solitaires=[];
      let gemstones =[];
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
            if(ele?.IsSolGem ==1){
              gemstones.push(ele);
            }
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

            if(ele?.IsSolGem ==1){
              solitaires.push(ele);
            }
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
      obj.solitaires=solitaires;
      obj.gemstones=gemstones;
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
    totals.summaryTotalAmount = fixedValues(
      totals.goldAmount +
      totals.diamondAmount +
      totals.colorStoneAmount +
      totals.miscAmount +
      totals.makingAmount +
      totals.otherAmount +
      data?.BillPrint_Json[0].AddLess
      , 3);

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

      // solitaire 
      let sol = [];

      e?.solitaires?.forEach((el) => {
        let eem = cloneDeep(el);
        let findrec = sol?.findIndex(
          (a) =>
            a?.Rate === eem?.Rate &&
            a?.ShapeName === eem?.ShapeName &&
            a?.SizeName === eem?.SizeName &&
            a?.QualityName === eem?.QualityName &&
            a?.Colorname === eem?.Colorname
        );
        if (findrec === -1) {
          sol.push(eem);
        } else {
          sol[findrec].Wt += eem?.Wt;
          sol[findrec].Pcs += eem?.Pcs;
          sol[findrec].Amount += eem?.Amount;
          sol[findrec].SizeName = eem?.SizeName;
        }
      });

      e.solitaires = sol;

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

  console.log("json2Data", json2Data);
  console.log("json1Data", json1Data);
  
  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <>
          <div className="mainRTMT">
            {/* PRINT BUTTON */}
            <div className="d-flex justify-content-between p-1">
                <div className="retMatFont_22 spBold">{json1Data?.InvoiceNo}</div>
                <div className="form-check ps-3 dis-none">
                    <input
                        type="button"
                        className="btn_white blue"
                        value="Print"
                        onClick={(e) => handlePrint(e)}
                        />
                </div>
            </div>

            {json2Data?.length > 0 && json2Data.map((e) => (
                <div className="spBrdrAllBlck">
                    {/* HEADER */}
                    <div className="spMnHead retMatFont_16">
                        <div className="spHeadWdth1">
                            <div className="spBold">{e?.SrJobno} [{e?.uniqueno}]</div>
                            <div className="">with <span className="spBold">{e?.MetalTypePurity} ({e?.MetalColor})</span></div>
                        </div>
                        <div className="spHeadWdth2">
                            <div className="w-100 d-flex justify-content-between spBold">
                                <div className="dividHeadWdth1">{e?.designno}</div>
                                <div className="dividHeadWdth2">{e?.Categoryname}</div>
                            </div>
                            <div className="w-100 d-flex justify-content-between">
                                <div className="dividHeadWdth1">Collection</div>
                                <div className="dividHeadWdth2 spBold">{e?.Collectionname}</div>
                            </div>
                            <div className="w-100 d-flex justify-content-between">
                                <div className="dividHeadWdth1">Metal Weight</div>
                                <div className="dividHeadWdth2 spBold">{fixedValues(e?.NetWt,3)}</div>
                            </div>
                            <div className="w-100 d-flex justify-content-between">
                                <div className="dividHeadWdth1">Dia. Weight</div>
                                <div className="dividHeadWdth2 spBold">{`${e?.diamondTotal?.pcs} / ${fixedValues(e?.diamondTotal?.weight,3)}`}</div>
                            </div>
                        </div>
                        <div className="spHeadWdth3">
                            <div className="w-100 d-flex justify-content-between">
                                <div className="dividHeadWdth1">HSN</div>
                                <div className="dividHeadWdth2 spBold">{e?.HSNNo}</div>
                            </div>
                            <div className="w-100 d-flex justify-content-between">
                                <div className="dividHeadWdth1">Sub Category</div>
                                <div className="dividHeadWdth2 spBold">{e?.SubCategoryname}</div>
                            </div>
                            <div className="w-100 d-flex justify-content-between">
                                <div className="dividHeadWdth1">Gross Weight</div>
                                <div className="dividHeadWdth2 spBold">{`${fixedValues(e?.grosswt,3)}`}</div>
                            </div>
                            <div className="w-100 d-flex justify-content-between">
                                <div className="dividHeadWdth1">CS Weight</div>
                                <div className="dividHeadWdth2 spBold">{`${e?.colorStonesTotal?.pcs} / ${fixedValues(e?.colorStonesTotal?.weight,3)}`}</div>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex" style={{ paddingBottom: "13px" }}>
                      <div className="imgContnt">
                        <img
                          src={e?.DesignImage}
                          onError={(e) => handleImageError(e)}
                          alt="design"
                          className="imgWdth"
                        />
                      </div>

                      <div className="mnContnt">
                          {/* DIAMOND */}
                          <div className={``}>
                              <div style={{ marginBottom: "15px" }}>
                                  <div className="detlsContnt spBrdrAll spBrdrBtomNone retMatFont_18 spBold">Diamond</div>
                                  <div className="detlsContnt spBrdrAll retMatFont_14">
                                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">SR#</div>
                                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">TYPE</div>
                                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">SHAPE</div>
                                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">QUALITY</div>
                                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">COLOR</div>
                                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">SIZE</div>
                                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">PCS.</div>
                                      <div className="sFntStyl dimndNClrstn spBgColr">CTW</div>
                                  </div>
                                  {e?.diamonds?.map((el, id) => {
                                  return (
                                      <div key={id} className="detlsContnt spBrdrRigt spBrdrBtom spBrdrLft retMatFont_13">
                                          <div className="dimndNClrstn spBrdrRigt d-flex justify-content-center" style={{ paddingTop: "6px" }}>{id + 1}</div>
                                          <div className="dimndNClrstn spBrdrRigt d-flex justify-content-center" style={{ paddingTop: "6px" }}>{el?.MaterialTypeName}</div>
                                          <div className="spacCell dimndNClrstn spBrdrRigt d-flex justify-content-start align-items-center">{el?.ShapeName}</div>
                                          <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.QualityName}</div>
                                          <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.Colorname}</div>
                                          <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.SizeName}</div>
                                          <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-end align-items-center">{el?.Pcs}</div>
                                          <div className="dimndNClrstn spacCell d-flex justify-content-end align-items-center">{fixedValues(el?.Wt, 3)}</div>
                                      </div>
                                      )
                                  })}
                              </div>
                          </div>
                          
                          {/* SOLITAIRE */}
                          {/* For Now Static 13/10/2025 */}
                          {e?.solitaires?.length > 0 && (
                               <div className={``}>
                               <div style={{ marginBottom: "15px" }}>
                                   <div className="detlsContnt spBrdrAll spBrdrBtomNone retMatFont_18 spBold">Solitaire</div>
                                   <div className="detlsContnt spBrdrAll retMatFont_14">
                                       <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">SR#</div>
                                       <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">TYPE</div>
                                       <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">SHAPE</div>
                                       <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">QUALITY</div>
                                       <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">COLOR</div>
                                       <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">SIZE</div>
                                       <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">PCS.</div>
                                       <div className="sFntStyl dimndNClrstn spBgColr">CTW</div>
                                   </div>
                                   {e?.solitaires?.map((el, id) => {
                                   return (
                                       <div key={id} className="detlsContnt spBrdrRigt spBrdrBtom spBrdrLft retMatFont_13">
                                           <div className="dimndNClrstn spBrdrRigt d-flex justify-content-center" style={{ paddingTop: "6px" }}>{id + 1}</div>
                                           <div className="dimndNClrstn spBrdrRigt d-flex justify-content-center" style={{ paddingTop: "6px" }}>{el?.MaterialTypeName}</div>
                                           <div className="spacCell dimndNClrstn spBrdrRigt d-flex justify-content-start align-items-center">{el?.ShapeName}</div>
                                           <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.QualityName}</div>
                                           <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.Colorname}</div>
                                           <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.SizeName}</div>
                                           <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-end align-items-center">{el?.Pcs}</div>
                                           <div className="dimndNClrstn spacCell d-flex justify-content-end align-items-center">{fixedValues(el?.Wt, 3)}</div>
                                       </div>
                                       )
                                   })}
                               </div>
                           </div>
                          )}
                       

                          {/* COLORSTONES */}
                          <div className={``}>
                              <div style={{ marginBottom: "15px" }}>
                                  <div className="detlsContnt spBrdrAll spBrdrBtomNone retMatFont_18 spBold">Color Stone</div>
                                  <div className="detlsContnt spBrdrAll retMatFont_14">
                                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt" style={{ width: "6.50%" }}>SR#</div>
                                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt" style={{ width: "18.50%" }}>TYPE</div>
                                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">SHAPE</div>
                                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">QUALITY</div>
                                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">COLOR</div>
                                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">SIZE</div>
                                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">PCS.</div>
                                      <div className="sFntStyl dimndNClrstn spBgColr">CTW</div>
                                  </div>
                                  {e?.colorStones?.map((el, id) => {
                                  return (
                                      <div key={id} className="detlsContnt d-flex spBrdrRigt spBrdrBtom spBrdrLft retMatFont_13">
                                          <div className="dimndNClrstn spBrdrRigt d-flex justify-content-center" style={{ paddingTop: "6px", width: "6.50%" }}>{id + 1}</div>
                                          <div className="dimndNClrstn spBrdrRigt d-flex justify-content-center" style={{ paddingTop: "6px", width: "18.50%" }}>{el?.MaterialTypeName}</div>
                                          <div className="spacCell dimndNClrstn spBrdrRigt d-flex justify-content-start align-items-center">{el?.ShapeName}</div>
                                          <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.QualityName}</div>
                                          <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.Colorname}</div>
                                          <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.SizeName}</div>
                                          <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-end align-items-center">{el?.Pcs}</div>
                                          <div className="dimndNClrstn spacCell d-flex justify-content-end align-items-center">{fixedValues(el?.Wt, 3)}</div>
                                      </div>
                                      )
                                  })}
                              </div>
                          </div>

                           {/* GEMSTONES */}
                           {e?.gemstones?.length > 0 &&(
                            <div className={``}>
                            <div style={{ marginBottom: "15px" }}>
                                <div className="detlsContnt spBrdrAll spBrdrBtomNone retMatFont_18 spBold">Gempstone</div>
                                <div className="detlsContnt spBrdrAll retMatFont_14">
                                    <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt" style={{ width: "6.50%" }}>SR#</div>
                                    <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt" style={{ width: "18.50%" }}>TYPE</div>
                                    <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">SHAPE</div>
                                    <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">QUALITY</div>
                                    <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">COLOR</div>
                                    <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">SIZE</div>
                                    <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">PCS.</div>
                                    <div className="sFntStyl dimndNClrstn spBgColr">CTW</div>
                                </div>
                                {e?.gemstones?.map((el, id) => {
                                return (
                                    <div key={id} className="detlsContnt d-flex spBrdrRigt spBrdrBtom spBrdrLft retMatFont_13">
                                        <div className="dimndNClrstn spBrdrRigt d-flex justify-content-center" style={{ paddingTop: "6px", width: "6.50%" }}>{id + 1}</div>
                                        <div className="dimndNClrstn spBrdrRigt d-flex justify-content-center" style={{ paddingTop: "6px", width: "18.50%" }}>{el?.MaterialTypeName}</div>
                                        <div className="spacCell dimndNClrstn spBrdrRigt d-flex justify-content-start align-items-center">{el?.ShapeName}</div>
                                        <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.QualityName}</div>
                                        <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.Colorname}</div>
                                        <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.SizeName}</div>
                                        <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-end align-items-center">{el?.Pcs}</div>
                                        <div className="dimndNClrstn spacCell d-flex justify-content-end align-items-center">{fixedValues(el?.Wt, 3)}</div>
                                    </div>
                                    )
                                })}
                            </div>
                        </div>
                           )}

                          {/* MISC */}
                          {e?.mics.length > 0 && (
                            <div className={``}>
                                <div style={{ marginBottom: "15px" }}>
                                    <div className="detlsContnt spBrdrAll spBrdrBtomNone retMatFont_18 spBold">Misc.</div>
                                    <div className="detlsContnt spBrdrAll retMatFont_14">
                                        <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt" style={{ width: "6.50%" }}>SR#</div>
                                        <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt" style={{ width: "10.50%" }}>TYPE</div>
                                        <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">SHAPE</div>
                                        <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt" style={{ width: "14%" }}>QUALITY</div>
                                        <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt" style={{ width: "17.50%"}}>COLOR</div>
                                        <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">SIZE</div>
                                        <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt d-flex justify-content-start align-items-center" style={{ width: "8.50%" }}>
                                          PCS.
                                        </div>
                                        <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">GM</div>
                                        <div className="sFntStyl dimndNClrstn spBgColr" style={{ width:"18.50%" }} >ADD IN GR WT</div>
                                    </div>
                                    {e?.mics?.map((el, id) => {
                                    return (
                                        <div key={id} className="detlsContnt d-flex spBrdrRigt spBrdrBtom spBrdrLft retMatFont_13">
                                            <div className="dimndNClrstn spBrdrRigt d-flex justify-content-center" style={{ paddingTop: "6px", width: "6.50%" }}>{id + 1}</div>
                                            <div className="dimndNClrstn spBrdrRigt d-flex justify-content-center" style={{ paddingTop: "6px", width: "10.50%" }}>
                                              {el?.MaterialTypeName}
                                            </div>
                                            <div className="spacCell dimndNClrstn spBrdrRigt d-flex justify-content-start align-items-center">{el?.ShapeName}</div>
                                            <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-start align-items-center" style={{ width: "14%" }}>
                                              {el?.QualityName}
                                            </div>
                                            <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-start align-items-center" style={{ width: "17.50%"}}>
                                              {el?.Colorname}
                                            </div>
                                            <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.SizeName}</div>
                                            <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-end align-items-center" style={{ width: "8.50%" }}>
                                              {el?.Pcs}
                                            </div>
                                            <div className="dimndNClrstn spBrdrRigt spacCell d-flex justify-content-end align-items-center">{fixedValues(el?.Wt, 3)}</div>
                                            <div className="dimndNClrstn spacCell d-flex justify-content-center align-items-center" style={{ width:"18.50%" }}>
                                              {el?.ismiscwtaddingrossweight === 1 ? "Yes" : el?.ismiscwtaddingrossweight === 0 ? "No" : "" }
                                            </div>
                                        </div>
                                        )
                                    })}
                                </div>
                            </div>
                          )}

                          {json1Data?.Remark !== '' && (
                            <>
                              <div className="detlsContnt spBrdrAll spBrdrBtomNone retMatFont_18 spBold">Remark If Any</div>
                              <div className="detlsContnt spBrdrAll spBrdrBtom retMatFont_14" style={{ padding: "5px", paddingBottom: "12px" }}>{json1Data?.Remark}</div>
                            </>
                          )}

                          {/* METAL */}
                          {/* <div className={`section-transition page_break`}>
                              <div style={{ marginBottom: "0px" }}>
                                  <div className="detlsMtlContnt spBrdrAll retMatFont_14">
                                      <div className="sFntStyl mtalStyl spBgColr spBrdrRigt">ITEM</div>
                                      <div className="sFntStyl mtalStyl spBgColr spBrdrRigt">METAL TYPE</div>
                                      <div className="sFntStyl mtalStyl spBgColr spBrdrRigt">COLOR</div>
                                      <div className="sFntStyl mtalStyl spBgColr">REQ.GM.</div>
                                  </div>
                                  {e?.metals?.map((el, id) => {
                                  return (
                                      <div key={id} className="detlsMtlContnt d-flex spBrdrRigt spBrdrBtom spBrdrLft retMatFont_13">
                                          <div className="spacCell mtalproprDvson spBrdrRigt d-flex justify-content-start align-items-center">{el?.ShapeName} {el?.QualityName}</div>
                                          <div className="spacCell mtalproprDvson spBrdrRigt d-flex justify-content-start align-items-center">{el?.Colorname}</div>
                                          <div className="mtalproprDvson spacCell d-flex justify-content-end align-items-center">{fixedValues(el?.Wt, 3)}</div>
                                      </div>
                                      )
                                  })}
                              </div>
                          </div> */}
                      </div>
                    </div>
                </div>
            ))}
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

export default ProductPrint;
