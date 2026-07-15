//http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=NTQ3&evn=T3V0U291cmNl&pnm=UmV0LiBNYXQu&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=OutsourcePrintA&pid=undefined
//http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=NTM0&evn=T3V0U291cmNl&pnm=UmV0LiBNYXQu&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=OutsourcePrintA&pid=undefined
import React, { useEffect, useState, useMemo, useRef } from "react";
import "../../assets/css/prints/outsourceRetMat.css";
import {
  ReceiveInBank,
  apiCall,
  checkMsg,
  fixedValues,
  handlePrint,
  isObjectEmpty,
  otherAmountDetail,
  taxGenrator,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import { FcPrint } from "react-icons/fc";
import { GrDocumentExcel } from "react-icons/gr";
import { GrDocumentPdf } from "react-icons/gr";
import { cloneDeep } from "lodash";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import * as XLSX from 'xlsx';
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import { borderLeft } from "@mui/system";
const OutsourceRetMat = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  const [json1Data, setJson1Data] = useState({});
  const [json2Data, setJson2Data] = useState([]);
  const [otherCharges, setOtherCharges] = useState(0);
  const [msg, setMsg] = useState("");
  const [diamondDetailss, setDiamondDetailss] = useState({});
  const [isImageWorking, setIsImageWorking] = useState(true);
  const exportRef = useRef();
  const [showSections, setShowSections] = useState({
    diamonds: true,
    colorStones: true,
    metals: true,
    finding: true,
  });
  const [availableSections, setAvailableSections] = useState({
    diamonds: false,
    colorStones: false,
    metals: false,
    finding: false,
  });
  const [renderSections, setRenderSections] = useState({
    diamonds: true,
    colorStones: true,
    metals: true,
    finding: true,
  });
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


  const handlePDFExport = async () => {
    const originalElement = exportRef.current;

    if (!originalElement) return;

    // Clone the element
    const clonedElement = originalElement.cloneNode(true);
    clonedElement.style.position = 'fixed';
    clonedElement.style.top = '-9999px'; // Move it off-screen
    clonedElement.style.left = '0';
    clonedElement.style.zIndex = '-1000';
    clonedElement.classList.add("pdf-export-mode");

    // Append to body temporarily
    document.body.appendChild(clonedElement);

    // Hide specific sections in the clone
    const spSubHed = clonedElement.querySelector(".spSubHed");
    const spHeadWdth3List = clonedElement.querySelectorAll(".spHeadWdth3");

    if (spSubHed) spSubHed.style.display = "none";
    spHeadWdth3List.forEach(el => el.style.display = "none");

    // Generate canvas from the cloned (off-screen, styled) element
    const canvas = await html2canvas(clonedElement, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210; // A4 width in mm
    const margin = 10;
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth - margin * 2;
    const scaleFactor = pdfWidth / imgProps.width;
    const pdfHeight = imgProps.height * scaleFactor;

    pdf.addImage(imgData, "PNG", margin, margin, pdfWidth, pdfHeight);
    pdf.save(`PO_Required_Meterial_Report_${json1Data?.InvoiceNo}.pdf`);

    // Remove the cloned element from DOM
    document.body.removeChild(clonedElement);
  };

  function normalize(value) {
    return value === null || value === undefined || value === ''
      ? '___empty___'
      : String(value).trim().toLowerCase();
  }

  function createKey(obj, keys) {
    return keys.map(key => normalize(obj[key])).join('|');
  }

  function groupByFields(items, keys) {
    const map = new Map();

    for (const item of items) {
      const key = createKey(item, keys);
      if (!map.has(key)) {
        map.set(key, { ...item, Pcs: Number(item.Pcs || 0), Wt: Number(item.Wt || 0) });
      } else {
        const existing = map.get(key);
        existing.Pcs += Number(item.Pcs || 0);
        existing.Wt += Number(item.Wt || 0);
      }
    }

    return Array.from(map.values());
  }

  // make group for same material
  function groupMaterials(dataArray) {
    const result = {
      diamonds: [],
      colorStones: [],
      metals: [],
      anotherFinding: [],
      diamondsTotal: { Pcs: 0, Wt: 0 },
      colorStonesTotal: { Pcs: 0, Wt: 0 },
      metalsTotal: { Pcs: 0, Wt: 0 },
      anotherFindingTotal: { Pcs: 0, Wt: 0 },
    };

    // normalization function
    const normalize = s => (s === null || s === undefined ? '' : String(s).trim().toLowerCase());

    const groupAndSum = (items, keys, targetArrayName, targetTotalName) => {

 
      const map = new Map();
      let totalPcs = 0, totalWt = 0;

      for (const item of items) {
        if (!item) continue;
        const key = keys.map(k => normalize(item[k])).join('|');
 

        console.log({
          ShapeName: item.ShapeName,
          SizeName: item.SizeName,
          IsSolGem: item.IsSolGem,
          key
        });
        const pcs = Number(item.Pcs || 0);
        const wt = Number(item.Wt || 0);

        totalPcs += pcs;
        totalWt += wt;

        if (map.has(key)) {
          const ex = map.get(key);
          ex.Pcs += pcs;
          ex.Wt += wt;
        } else {
          // copy the original but ensure properties exist
          map.set(key, {
            ...item,
            ShapeName: item.ShapeName,
            QualityName: item.QualityName,
            Colorname: item.Colorname,
            SizeName: item.SizeName,
            IsSolGem: item.IsSolGem,

            Pcs: pcs,
            Wt: wt
          });
        }
      }

      result[targetArrayName] = Array.from(map.values());
      result[targetTotalName] = { Pcs: totalPcs, Wt: totalWt };
    };

    // collect all items
    const allDiamonds = dataArray.flatMap(job => job.diamonds || []);
    const allColorStones = dataArray.flatMap(job => job.colorStones || []);
    const allMetals = dataArray.flatMap(job => job.metals || []);
    const allFindings = dataArray.flatMap(job => job.anotherFinding || []);

    groupAndSum(allDiamonds, ['ShapeName', 'QualityName', 'Colorname', 'SizeName','IsSolGem'], 'diamonds', 'diamondsTotal');
    groupAndSum(allColorStones, ['ShapeName', 'QualityName', 'Colorname', 'SizeName','IsSolGem'], 'colorStones', 'colorStonesTotal');
    groupAndSum(allMetals, ['ShapeName', 'QualityName', 'Colorname'], 'metals', 'metalsTotal');
    groupAndSum(allFindings, ['FindingTypename', 'FindingAccessories', 'ShapeName', 'QualityName', 'Colorname'], 'anotherFinding', 'anotherFindingTotal');

    
    console.log("TCL: groupMaterials -> res dia ", result.diamonds)
    return result;
    
  }

  

  const grouped = useMemo(() => groupMaterials(json2Data), [json2Data]);
  // console.log(grouped.diamonds);
  // console.log(grouped.colorStones);
  // console.log(grouped.metals);
  // console.log(grouped.anotherFinding); 

  useEffect(() => {
    const newAvailable = {
      diamonds: (grouped.diamonds || []).length > 0,
      colorStones: (grouped.colorStones || []).length > 0,
      metals: (grouped.metals || []).length > 0,
      finding: (grouped.anotherFinding || []).length > 0,
    };

    // Update only if newAvailable differs from current availableSections
    setAvailableSections(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(newAvailable)) {
        return newAvailable;
      }
      return prev;
    });

    setShowSections(prev => {
      const newShow = {
        diamonds: newAvailable.diamonds ? prev.diamonds : true,
        colorStones: newAvailable.colorStones ? prev.colorStones : true,
        metals: newAvailable.metals ? prev.metals : true,
        finding: newAvailable.finding ? prev.finding : true,
      };
      if (JSON.stringify(prev) !== JSON.stringify(newShow)) {
        return newShow;
      }
      return prev;
    });

    setRenderSections(prev => {
      const newRender = {
        diamonds: newAvailable.diamonds ? prev.diamonds : true,
        colorStones: newAvailable.colorStones ? prev.colorStones : true,
        metals: newAvailable.metals ? prev.metals : true,
        finding: newAvailable.finding ? prev.finding : true,
      };
      if (JSON.stringify(prev) !== JSON.stringify(newRender)) {
        return newRender;
      }
      return prev;
    });
  }, [grouped]);


  const handleToggle = (section) => {
    const isCurrentlyShown = showSections[section];

    if (isCurrentlyShown) {
      setShowSections(prev => ({ ...prev, [section]: false }));

      setTimeout(() => {
        setRenderSections(prev => ({ ...prev, [section]: false }));
      }, 600);
    } else {
      setRenderSections(prev => ({ ...prev, [section]: true }));
      setShowSections(prev => ({ ...prev, [section]: true }));
    }
  };

  // console.log("json2Data", json2Data);  
  // console.log("json1Data", json1Data);

  // Style...
  const RtMttxtTop = {
    verticalAlign: "top",
  };
  const RtMtbrRight = {
    borderRight: "0.5px solid #000000",
  };
  const RtMtbrLft = {
    borderLeft: "0.5px solid #000000",
  };
  const RtMtbrBotm = {
    borderBottom: "0.5px solid #000000",
  };
  const RtMtbrTop = {
    borderTop: "0.5px solid #000000",
  };
  const RtMtbrder = {
    border: "0.5px solid #000000",
  };
  const RtMtstyBld = {
    fontWeight: "bold",
  }
  const RtMttxtCen = {
    textAlign: "center",
  }
  const RtMttxtLft = {
    textAlign: "left",
  }
  const RtMtWdth = {
    width: "80px",
  };
  const RtMtspbrWrd = {
    wordBreak: "break-word",
    overflowWrap: "break-word",
    wordWrap: "break-word",
  }
  const fntSize = {
    fontSize: "22px",
  }
  const spBrdr = {
    borderCollapse: "collapse",
    backgroundColor: "#ffffff",
  }

console.log("TCL: OutsourceRetMat -> grouped.colorStones",grouped.colorStones )
  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <>
          <ReactHTMLTableToExcel
            id="test-table-xls-button"
            className="d-none"
            table="table-to-xls"
            filename={`PO_Required_Meterial_Report_${json1Data?.InvoiceNo}.xlsx`}
            sheet="tablexls"
            buttonText=""
          />
          <div className="mainRTMT" ref={exportRef}>
            {/* HEADER */}
            <div className="spMnHead">
              <div className="spHeadWdth1">
                <img
                  src={json1Data?.PrintLogo}
                  alt=""
                  className="theLogoImg"
                  onError={handleImageErrors}
                />
              </div>
              <div className="spHeadWdth2">
                <div className="spBold spdispFlx">
                  <div className="retMatFont_22">PO: </div>
                  <div className="retMatFont_22">&nbsp;{json1Data?.InvoiceNo} wise Required Material Report</div>
                </div>
              </div>
              <div className="spHeadWdth3">
                <button onClick={(e) => handlePrint(e)}>
                  <FcPrint className="theIconImgPrnt" />
                </button>
              </div>
              <div className="spHeadWdth3">
                <button onClick={() => document.getElementById('test-table-xls-button').click()}>{/* Programmatically trigger the export */}
                  <GrDocumentExcel color="#217346" className="theIconImg" />
                </button>
              </div>
              <div className="spHeadWdth3">
                <button onClick={handlePDFExport}>
                  <GrDocumentPdf color="rgb(115, 43, 33)" className="theIconImg" />
                </button>
              </div>
            </div>

            {/* CHECKBOXES */}
            <div className="spSubHed">
              <div className="spBgColr spBrdrAll spdispFlx">
                <div className="sFntStyl subSubHed1">
                  ORDER INFO
                </div>
                <div className="subSubHed2">
                  <div className="sFntStyl">
                    {availableSections.diamonds && (
                      <label>
                        <input
                          type="checkbox"
                          checked={showSections.diamonds}
                          onChange={() => handleToggle('diamonds')}
                          style={{ marginRight: "5px" }}
                        />
                        DIAMONDS
                      </label>
                    )}
                  </div>
                  <div className="sFntStyl">
                    {availableSections.colorStones && (
                      <label>
                        <input
                          type="checkbox"
                          checked={showSections.colorStones}
                          onChange={() => handleToggle('colorStones')}
                          style={{ marginRight: "5px" }}
                        />
                        COLOR STONE
                      </label>
                    )}
                  </div>
                  <div className="sFntStyl">
                    {availableSections.metals && (
                      <label>
                        <input
                          type="checkbox"
                          checked={showSections.metals}
                          onChange={() => handleToggle('metals')}
                          style={{ marginRight: "5px" }}
                        />
                        METAL
                      </label>
                    )}
                  </div>
                  <div className="sFntStyl">
                    {availableSections.finding && (
                      <label>
                        <input
                          type="checkbox"
                          checked={showSections.finding}
                          onChange={() => handleToggle('finding')}
                          style={{ marginRight: "5px" }}
                        />
                        FINDING
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mnContnt">
              {/* ORDER DETAILS */}
              <div className="bodyContnt page_break">
                <div className="spBold retMatFont_22">{json1Data?.Manufacturer}</div>
                <div className="spdispFlx bdyhead align-items-center">
                  <div style={{ marginRight: "15px" }}>Manufacturer PO#:	{ }</div>
                  <div className="spBold" style={{ marginRight: "60px" }}>{json1Data?.InvoiceNo}</div>
                  <div style={{ marginRight: "15px" }}>Dated:	</div>
                  <div className="spBold">{json1Data?.EntryDate.slice(0, 7)}</div>
                </div>
              </div>

              {/* DIAMOND */}
              <div className={`section-transition ${showSections.diamonds ? '' : 'section-hidden'} page_break`}>
                {renderSections.diamonds && grouped.diamonds.length > 0 && (
                  <div style={{ marginBottom: "15px" }}>
                    <div className="detlsContnt spBrdrAll retMatFont_14">
                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">ITEM</div>
                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">SHAPE</div>
                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">QUALITY</div>
                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">COLOR</div>
                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">SIZE</div>
                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">PCS.</div>
                      <div className="sFntStyl dimndNClrstn spBgColr">CTW</div>
                    </div>
                    <div className="detlsContnt spBrdrRigt spBrdrBtom spBrdrLft retMatFont_13">
                      <div className="comnFistCol spBrdrRigt d-flex justify-content-center" style={{ paddingTop: "6px" }}>DIAMOND</div>
                      <div className="d-flex flex-column otherRmnSpac">
                        {grouped?.diamonds?.map((el, id) => {
                          const isLast = id === grouped?.diamonds?.length - 1;
                          return (
                            <div key={id} className={`d-flex ${!isLast ? 'spBrdrBtom' : ''}`}>
                              <div className="spacCell proprDvson spBrdrRigt d-flex justify-content-start align-items-center">{el?.IsSolGem==1?'S: ':''}{el?.ShapeName}</div>
                              <div className="proprDvson spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.QualityName}</div>
                              <div className="proprDvson spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.Colorname}</div>
                              <div className="proprDvson spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.SizeName}</div>
                              <div className="proprDvson spBrdrRigt spacCell d-flex justify-content-end align-items-center">{el?.Pcs}</div>
                              <div className="proprDvson spacCell d-flex justify-content-end align-items-center">{fixedValues(el?.Wt, 3)}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="detlsContnt spBrdrRigt spBrdrBtom spBrdrLft retMatFont_13">
                      <div className="spBold dimndNClrstn spacCell d-flex justify-content-start align-items-center">TOTAL :</div>
                      <div className="dimndNClrstn"></div>
                      <div className="dimndNClrstn"></div>
                      <div className="dimndNClrstn"></div>
                      <div className="dimndNClrstn spacCell spBrdrRigt"></div>
                      <div className="spBold dimndNClrstn spBrdrRigt spacCell d-flex justify-content-end align-items-center">{grouped?.diamondsTotal?.Pcs}</div>
                      <div className="spBold dimndNClrstn spacCell d-flex justify-content-end align-items-center">{fixedValues(grouped?.diamondsTotal?.Wt, 3)}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* COLORSTONES */}
              <div className={`section-transition ${showSections.colorStones ? '' : 'section-hidden'} page_break`}>
                {renderSections.colorStones && grouped.colorStones.length > 0 && (
                  <div style={{ marginBottom: "15px" }}>
                    <div className="detlsContnt spBrdrAll retMatFont_14">
                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">ITEM</div>
                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">SHAPE</div>
                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">QUALITY</div>
                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">COLOR</div>
                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">SIZE</div>
                      <div className="sFntStyl dimndNClrstn spBgColr spBrdrRigt">PCS.</div>
                      <div className="sFntStyl dimndNClrstn spBgColr">CTW</div>
                    </div>
                    <div className="detlsContnt spBrdrRigt spBrdrBtom spBrdrLft retMatFont_13">
                      <div className="comnFistCol spBrdrRigt d-flex justify-content-center" style={{ paddingTop: "6px" }}>COLOR STONE</div>
                      <div className="d-flex flex-column otherRmnSpac">
                        {grouped?.colorStones?.map((el, id) => {
                          const isLast = id === grouped?.colorStones?.length - 1;
                          return (
                            <div key={id} className={`d-flex ${!isLast ? 'spBrdrBtom' : ''}`}>
                              <div className="spacCell proprDvson spBrdrRigt d-flex justify-content-start align-items-center">{el?.IsSolGem==1?'G: ':''}{el?.ShapeName}</div>
                              <div className="proprDvson spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.QualityName}</div>
                              <div className="proprDvson spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.Colorname}</div>
                              <div className="proprDvson spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.SizeName}</div>
                              <div className="proprDvson spBrdrRigt spacCell d-flex justify-content-end align-items-center">{el?.Pcs}</div>
                              <div className="proprDvson spacCell d-flex justify-content-end align-items-center">{fixedValues(el?.Wt, 3)}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="detlsContnt spBrdrRigt spBrdrBtom spBrdrLft retMatFont_13">
                      <div className="spBold dimndNClrstn spacCell d-flex justify-content-start align-items-center">TOTAL :</div>
                      <div className="dimndNClrstn"></div>
                      <div className="dimndNClrstn"></div>
                      <div className="dimndNClrstn"></div>
                      <div className="dimndNClrstn spacCell spBrdrRigt"></div>
                      <div className="spBold dimndNClrstn spBrdrRigt spacCell d-flex justify-content-end align-items-center">{grouped?.colorStonesTotal?.Pcs}</div>
                      <div className="spBold dimndNClrstn spacCell d-flex justify-content-end align-items-center">{fixedValues(grouped?.colorStonesTotal?.Wt, 3)}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* FINDING */}
              <div className={`section-transition ${showSections.finding ? '' : 'section-hidden'} page_break`}>
                {renderSections.finding && grouped.anotherFinding.length > 0 && (
                  <div style={{ marginBottom: "15px" }}>
                    <div className="detlsContnt spBrdrAll retMatFont_14">
                      <div className="sFntStyl fndingStyl spBgColr spBrdrRigt">ITEM</div>
                      <div className="sFntStyl fndingStyl spBgColr spBrdrRigt">F.TYPE</div>
                      <div className="sFntStyl fndingStyl spBgColr spBrdrRigt">ACCESSORIES</div>
                      <div className="sFntStyl fndingStyl spBgColr spBrdrRigt">METAL</div>
                      <div className="sFntStyl fndingStyl spBgColr spBrdrRigt">QUALITY</div>
                      <div className="sFntStyl fndingStyl spBgColr spBrdrRigt">COLOR</div>
                      <div className="sFntStyl fndingStyl spBgColr spBrdrRigt">PCS.</div>
                      <div className="sFntStyl fndingStyl spBgColr">WT</div>
                    </div>
                    <div className="detlsContnt spBrdrRigt spBrdrBtom spBrdrLft retMatFont_13">
                      <div className="fndingFistCol spBrdrRigt d-flex justify-content-center" style={{ paddingTop: "6px" }}>FINDING</div>
                      <div className="d-flex flex-column fndingotherRmnSpac">
                        {grouped?.anotherFinding?.map((el, id) => {
                          const isLast = id === grouped?.anotherFinding?.length - 1;
                          return (
                            <div key={id} className={`d-flex ${!isLast ? 'spBrdrBtom' : ''}`}>
                              <div className="spacCell fndingproprDvson spBrdrRigt d-flex justify-content-start align-items-center">{el?.FindingTypename}</div>
                              <div className="spacCell fndingproprDvson spBrdrRigt d-flex justify-content-start align-items-center">{el?.FindingAccessories}</div>
                              <div className="fndingproprDvson spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.ShapeName}</div>
                              <div className="fndingproprDvson spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.QualityName}</div>
                              <div className="fndingproprDvson spBrdrRigt spacCell d-flex justify-content-start align-items-center">{el?.Colorname}</div>
                              <div className="fndingproprDvson spBrdrRigt spacCell d-flex justify-content-end align-items-center">{el?.Pcs}</div>
                              <div className="fndingproprDvson spacCell d-flex justify-content-end align-items-center">{fixedValues(el?.Wt, 3)}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="detlsContnt spBrdrRigt spBrdrBtom spBrdrLft retMatFont_13">
                      <div className="spBold fndingStyl spacCell d-flex justify-content-start align-items-center">TOTAL :</div>
                      <div className="fndingStyl"></div>
                      <div className="fndingStyl"></div>
                      <div className="fndingStyl"></div>
                      <div className="fndingStyl"></div>
                      <div className="fndingStyl spacCell spBrdrRigt"></div>
                      <div className="spBold fndingStyl spBrdrRigt spacCell d-flex justify-content-end align-items-center">{grouped?.anotherFindingTotal?.Pcs}</div>
                      <div className="spBold fndingStyl spacCell d-flex justify-content-end align-items-center">{fixedValues(grouped?.anotherFindingTotal?.Wt, 3)}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* METAL */}
              <div className={`section-transition ${showSections.metals ? '' : 'section-hidden'} page_break`}>
                {renderSections.metals && grouped.metals.length > 0 && (
                  <div style={{ marginBottom: "0px" }}>
                    <div className="detlsMtlContnt spBrdrAll retMatFont_14">
                      <div className="sFntStyl mtalStyl spBgColr spBrdrRigt">ITEM</div>
                      <div className="sFntStyl mtalStyl spBgColr spBrdrRigt">METAL TYPE</div>
                      <div className="sFntStyl mtalStyl spBgColr spBrdrRigt">COLOR</div>
                      <div className="sFntStyl mtalStyl spBgColr">REQ.GM.</div>
                    </div>
                    <div className="detlsMtlContnt spBrdrRigt spBrdrBtom spBrdrLft retMatFont_13">
                      <div className="mtalFistCol spBrdrRigt d-flex justify-content-center" style={{ paddingTop: "6px" }}>METAL</div>
                      <div className="d-flex flex-column mtalotherRmnSpac">
                        {grouped?.metals?.map((el, id) => {
                          const isLast = id === grouped?.metals?.length - 1;
                          return (
                            <div key={id} className={`d-flex ${!isLast ? 'spBrdrBtom' : ''}`}>
                              <div className="spacCell mtalproprDvson spBrdrRigt d-flex justify-content-start align-items-center">{el?.ShapeName} {el?.QualityName}</div>
                              <div className="spacCell mtalproprDvson spBrdrRigt d-flex justify-content-start align-items-center">{el?.Colorname}</div>
                              <div className="mtalproprDvson spacCell d-flex justify-content-end align-items-center">{fixedValues(el?.Wt, 3)}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="detlsMtlContnt spBrdrRigt spBrdrBtom spBrdrLft retMatFont_13">
                      <div className="spBold mtalStyl spacCell d-flex justify-content-start align-items-center">TOTAL :</div>
                      <div className="mtalStyl"></div>
                      <div className="spBold mtalStyl spBrdrRigt spacCell d-flex justify-content-end align-items-center">{ }</div>
                      <div className="spBold mtalStyl spacCell d-flex justify-content-end align-items-center">{fixedValues(grouped?.metalsTotal?.Wt, 3)}</div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
          
          
          {/* Hidden table to be exported */}
          <table id="table-to-xls" className="d-none" style={{ ...spBrdr }}>
            <tbody>
              {/* HEADER */}
              <tr>
                <td />
                <td colSpan={3} width={60} height={132}>
                  <img
                    src={json1Data?.PrintLogo}
                    alt=""
                    onError={handleImageErrors}
                    width={132}
                    height={132}
                  />
                </td>
                <td colSpan={6} style={{ ...RtMtstyBld, ...fntSize }}>
                  PO: &nbsp;{json1Data?.InvoiceNo} wise Required Material Report
                </td>
              </tr>

              {/* ORDER DETAILS */}
              <tr>
                <td />
                <td colSpan={2} height={30} style={{ ...RtMtstyBld, ...fntSize, ...RtMttxtLft }}>{json1Data?.Manufacturer}</td>
                <td colSpan={4}>
                  Manufacturer PO#: <span style={{ ...RtMtstyBld }}>{json1Data?.InvoiceNo}</span>
                </td>
                <td colSpan={3}>
                  Dated: <span style={{ ...RtMtstyBld }}>{json1Data?.EntryDate.slice(0, 7)}</span>
                </td>
              </tr>

              <tr colSpan={9}></tr>

              {/* DIAMOND */}
              {renderSections.diamonds && grouped.diamonds.length > 0 && (
                <>
                  <tr>
                    <td height={23}/>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrder }}>
                      ITEM
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      SHAPE
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      QUALITY
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      COLOR
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      SIZE
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      PCS.
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      CTW
                    </td>
                  </tr>

                  {grouped?.diamonds?.map((el, id) => (
                    <tr key={id}>
                      <td height={23}/>
                      {id === 0 && (
                        <td rowSpan={grouped?.diamonds.length} style={{ ...RtMttxtTop, ...RtMtspbrWrd, ...RtMtbrLft, ...RtMtbrTop, ...RtMtbrRight, ...RtMttxtCen }}>
                          DIAMOND
                        </td>
                      )}
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrLft, ...RtMtbrTop, ...RtMtbrRight }} width={120}>{el?.ShapeName}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }} width={120}>{el?.QualityName}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{el?.Colorname}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{el?.SizeName}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{el?.Pcs}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{fixedValues(el?.Wt, 3)}</td>
                    </tr>
                  ))}

                  <tr>
                    <td height={23}/>
                    <td colSpan={5} style={{ ...RtMtstyBld, ...RtMtbrder }}>TOTAL :</td>
                    <td style={{ ...RtMtstyBld, ...RtMtbrTop, ...RtMtbrRight, ...RtMtbrBotm }}>{grouped?.diamondsTotal?.Pcs}</td>
                    <td style={{ ...RtMtstyBld, ...RtMtbrTop, ...RtMtbrRight, ...RtMtbrBotm }}>{fixedValues(grouped?.diamondsTotal?.Wt, 3)}</td>
                  </tr>
                </>
              )}
              
              <tr colSpan={9}/>

              {/* COLORSTONES */}
              {renderSections.colorStones && grouped.colorStones.length > 0 && (
                <>
                  <tr>
                    <td height={23}/>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrder }}>
                      ITEM
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      SHAPE
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      QUALITY
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      COLOR
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      SIZE
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      PCS.
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      CTW
                    </td>
                  </tr>

                  {grouped?.colorStones?.map((el, id) => (
                    <tr key={id}>
                      <td height={23}/>
                      {id === 0 && (
                        <td rowSpan={grouped?.colorStones.length} style={{ ...RtMttxtTop, ...RtMtspbrWrd, ...RtMtbrLft, ...RtMtbrTop, ...RtMtbrRight, ...RtMttxtCen }} width={120}>
                          COLORSTONE
                        </td>
                      )}
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrLft, ...RtMtbrTop, ...RtMtbrRight }}>{el?.ShapeName}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{el?.QualityName}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{el?.Colorname}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{el?.SizeName}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{el?.Pcs}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{fixedValues(el?.Wt, 3)}</td>
                    </tr>
                  ))}

                  <tr>
                    <td height={23}/>
                    <td colSpan={5} style={{ ...RtMtstyBld, ...RtMtbrder }}>TOTAL :</td>
                    <td style={{ ...RtMtstyBld, ...RtMtbrTop, ...RtMtbrRight, ...RtMtbrBotm }}>{grouped?.colorStonesTotal?.Pcs}</td>
                    <td style={{ ...RtMtstyBld, ...RtMtbrTop, ...RtMtbrRight, ...RtMtbrBotm }}>{fixedValues(grouped?.colorStonesTotal?.Wt, 3)}</td>
                  </tr>
                </>
              )}

              <tr colSpan={9}/>

              {/* FINDING */}
              {renderSections.finding && grouped.anotherFinding.length > 0 && (
                <>
                  <tr>
                    <td height={23}/>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrder }}>
                      ITEM
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      F.TYPE
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      ACCESSORIES
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      METAL
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      QUALITY
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      COLOR
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      PCS.
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      WT
                    </td>
                  </tr>

                  {grouped?.anotherFinding?.map((el, id) => (
                    <tr key={id}>
                      <td height={23}/>
                      {id === 0 && (
                        <td rowSpan={grouped?.anotherFinding.length} style={{ ...RtMttxtTop, ...RtMtspbrWrd, ...RtMtbrLft, ...RtMtbrTop, ...RtMtbrRight, ...RtMttxtCen }} width={120}>
                          FINDING
                        </td>
                      )}
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrLft, ...RtMtbrTop, ...RtMtbrRight }}>{el?.FindingTypename}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{el?.FindingAccessories}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{el?.ShapeName}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{el?.QualityName}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{el?.Colorname}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{el?.Pcs}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{fixedValues(el?.Wt, 3)}</td>
                    </tr>
                  ))}

                  <tr>
                    <td height={23}/>
                    <td colSpan={6} style={{ ...RtMtstyBld, ...RtMtbrder }}>TOTAL :</td>
                    <td style={{ ...RtMtstyBld, ...RtMtbrTop, ...RtMtbrRight, ...RtMtbrBotm }}>{grouped?.anotherFindingTotal?.Pcs}</td>
                    <td style={{ ...RtMtstyBld, ...RtMtbrTop, ...RtMtbrRight, ...RtMtbrBotm }}>{fixedValues(grouped?.anotherFindingTotal?.Wt, 3)}</td>
                  </tr>
                </>
              )}

              {/* METAL */}
              {renderSections.metals && grouped.metals.length > 0 && (
                <>
                  <tr>
                    <td height={23}/>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrder }}>
                      ITEM
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      METAL TYPE
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      COLOR
                    </td>
                    <td style={{ ...RtMtspbrWrd, ...RtMtstyBld, ...RtMtWdth, ...RtMtbrTop, ...RtMtbrRight }}>
                      REQ.GM.
                    </td>
                  </tr>

                  {grouped?.metals?.map((el, id) => (
                    <tr key={id}>
                      <td height={23}/>
                      {id === 0 && (
                        <td rowSpan={grouped?.metals.length} style={{ ...RtMttxtTop, ...RtMtspbrWrd, ...RtMtbrLft, ...RtMtbrTop, ...RtMtbrRight, ...RtMttxtCen }} width={120}>
                          METAL
                        </td>
                      )}
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrLft, ...RtMtbrTop, ...RtMtbrRight }}>{el?.ShapeName} {el?.QualityName}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{el?.Colorname}</td>
                      <td style={{ ...RtMtspbrWrd, ...RtMtbrTop, ...RtMtbrRight }}>{fixedValues(el?.Wt, 3)}</td>
                    </tr>
                  ))}

                  <tr>
                    <td height={23}/>
                    <td colSpan={3} style={{ ...RtMtstyBld, ...RtMtbrder }}>TOTAL :</td>
                    <td style={{ ...RtMtstyBld, ...RtMtbrTop, ...RtMtbrRight, ...RtMtbrBotm }}>{fixedValues(grouped?.metalsTotal?.Wt, 3)}</td>
                  </tr>
                </>
              )}

              <tr rowSpan={5} height={200}></tr>
            </tbody>
          </table>
        </>
      ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
          {msg}
        </p>
      )}
    </>
  );
};

export default OutsourceRetMat;
