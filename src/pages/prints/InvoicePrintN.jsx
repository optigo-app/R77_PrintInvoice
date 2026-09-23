import React, { useState, useEffect } from "react";
import "../../assets/css/prints/jewellaryinvoiceprint.css";
import style from "../../assets/css/prints/jewelleryRetailinvoicePrint3.module.css";
import {
  apiCall,
  CapitalizeWords,
  checkMsg,
  fixedValues,
  GovernMentDocuments,
  handleImageError,
  isObjectEmpty,
  NumberWithCommas,
  ReceiveInBank,
  taxGenrator,
} from "../../GlobalFunctions";
import Button from "../../GlobalFunctions/Button";
import Loader from "../../components/Loader";
import { ToWords } from "to-words";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { cloneDeep, set } from "lodash";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";

const InvoicePrintN = ({
  urls,
  token,
  invoiceNo,
  printName,
  evn,
  ApiVer,
}) => {
  const [result, setResult] = useState(null);
  // const [result?.header, setresult?.header] = useState({});
  const [data, setdata] = useState([]);
  const [msg, setMsg] = useState("");
  const [datas, setDatas] = useState([]);
  const [loader, setLoader] = useState(true);
  const [summary, setSummary] = useState([]);
  const toWords = new ToWords();
  const [image, setImage] = useState(true);
  const [summ, setSummy] = useState(true);
  const [diamondWise, setDiamondWise] = useState([]);
  const [MetShpWise, setMetShpWise] = useState([]);
  const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
  const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);
  const [diamondDetails, setDiamondDetails] = useState([]);
  const [json1, setJson1] = useState([]);
  const [PureMetalRate, setPureMetalRate] = useState([]);


  const [retail, setRetail] = useState(true);
  const [companyDetails, setCompanyDetails] = useState(false);
  const [customerAddress, setCustomerAddress] = useState([]);
  const [total, setTotal] = useState({
    gwt: 0,
    stoneWt: 0,
    diaColorWt: 0,
    nwt: 0,
    metalMaking: 0,
    others: 0,
    total: 0,
    discount: 0,
    afterTax: 0,
    netBalAmount: 0,
    beforeTax: 0,
    diamondColorStoneWt: 0,
    multiMetalMiscHsCode: 0,
    otherCharge: 0,
  });
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  const [taxes, setTaxes] = useState([]);
  const [bank, setBank] = useState([]);
  const [document, setDocument] = useState([]);
  function loadData(data) {
    // console.log("data", data);
    setPureMetalRate(data?.BillPrint_Json5)
    let totals = { ...total };
    let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    data.BillPrint_Json[0].address = address;
    let metalArr = [];
    let totalAmountBefore = 0;
    let diamondWt = 0;
    let colorStoneWt = 0;
    let miscWt = 0;
    let grossWt = 0;
    data?.BillPrint_Json1.forEach((e) => {
      let findRecord = metalArr.findIndex(
        (elem) => elem?.label === e?.MetalTypePurity
      );
      if (findRecord === -1) {

        metalArr.push({
          label: e?.MetalTypePurity,
          value: e?.NetWt * e?.Quantity + e?.LossWt,
          gm: true,
        });
      } else {
        metalArr[findRecord].value += e?.NetWt * e?.Quantity;
      }
      grossWt += e?.grosswt * e?.Quantity;
      let diamondWts = 0;
      let colorStoneWts = 0;
      let miscWts = 0;
      let obj = { ...e };
      let miscWt = 0;
      let materials = [];
      totalAmountBefore +=
        e?.TotalAmount / data?.BillPrint_Json[0].CurrencyExchRate;
      let metalColorCode = "";
      setJson1(data?.BillPrint_Json1)
      data?.BillPrint_Json2.forEach((ele) => {
        if (obj?.SrJobno === ele?.StockBarcode) {

          if (ele?.IsCenterStone === 1) {
            materials.push(ele);
            return;
          }

          if (
            (ele?.MasterManagement_DiamondStoneTypeid === 1 ||
              ele?.MasterManagement_DiamondStoneTypeid === 2) &&
            ele?.IsHSCOE === 0 && ele?.IsCenterStone !== 1
          ) {
            let findRecord = materials.findIndex(
              (elem) =>
                elem?.MasterManagement_DiamondStoneTypeid === ele?.MasterManagement_DiamondStoneTypeid &&
                elem?.ShapeName === ele?.ShapeName &&
                elem?.Colorname === ele?.Colorname &&
                elem?.QualityName === ele?.QualityName &&
                elem?.Rate === ele?.Rate &&
                elem?.IsCenterStone !== 1
            );
            if (findRecord === -1) {
              materials.push(ele);
              // materials.push({ 
              //   ...ele, 
              //   IsCenterStone: ele.IsCenterStone
              // });
              // console.log("materials", materials);
            } else {
              materials[findRecord].Pcs += ele?.Pcs;
              materials[findRecord].Wt += ele?.Wt;
              materials[findRecord].Amount += ele?.Amount;
              // if (materials[findRecord].IsCenterStone === 0 && ele?.IsCenterStone === 1) {
              //   materials[findRecord].IsCenterStone = 1;
              // }
            }
            if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
              diamondWt += ele?.Wt * obj?.Quantity;
              diamondWts += ele?.Wt;
            }
            if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
              colorStoneWt += ele?.Wt * obj?.Quantity;
              colorStoneWts += ele?.Wt;
            }
            if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
              miscWt += ele?.Wt;
              miscWts += ele?.Wt;
            }
          } else if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
            if (ele?.IsPrimaryMetal === 1) {
              metalColorCode = ele?.MetalColorCode;
            } else if (metalColorCode === "") {
              metalColorCode = ele?.MetalColorCode;
            }
          }
        }
      });

      obj.TotalAmount =
        obj.TotalAmount / data?.BillPrint_Json[0].CurrencyExchRate;
      obj.diamondWts = diamondWts;
      obj.colorStoneWts = colorStoneWts;
      obj.miscWts = miscWts;
      obj.materials = materials;
      obj.metalColorCode = metalColorCode;

      obj.miscWt = miscWt * obj?.Quantity;

      totals.gwt += e?.grosswt * e?.Quantity;
      totals.beforeTax +=
        (e?.TotalAmount / data?.BillPrint_Json[0].CurrencyExchRate);
      totals.nwt += e?.NetWt * e?.Quantity;
      totals.others += e?.OtherCharges;
      totals.total += e?.UnitCost;
      totals.discount += e?.DiscountAmt;

    });

    metalArr.push({ label: "Diamond Wt", value: diamondWt, gm: false });
    metalArr.push({ label: "Stone Wt", value: colorStoneWt, gm: false });
    metalArr.push({ label: "Gross Wt", value: grossWt, gm: true });
    setSummary(metalArr);


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
    });
    setNotGoldMetalTotal(tot_met);
    setNotGoldMetalWtTotal(tot_met_wt);

    //grouping of jobs and isGroupJob is 1
    let debitCardinfo = ReceiveInBank(data?.BillPrint_Json[0]?.BankPayDet);
    setBank(debitCardinfo);

    let finalArr = [];
    console.log("TCL: loadData ->  datas?.resultArray", datas?.resultArray)
    datas?.resultArray?.forEach((a) => {
      if (a?.GroupJob === "") {
        finalArr.push(a);
      } else {
        let b = cloneDeep(a);
        console.log("TCL: loadData -> b", b)
        let find_record = finalArr.findIndex(
          (el) => el?.GroupJob === b?.GroupJob
        );
        if (find_record === -1) {
          finalArr.push(b);
        } else {
          if (
            finalArr[find_record]?.GroupJob !== finalArr[find_record]?.SrJobno
          ) {
            finalArr[find_record].designno = b?.designno;
            finalArr[find_record].HUID = b?.HUID;
            finalArr[find_record].DesignImage = b?.DesignImage; // CQ Solving PSJewels 16/01/26
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

          // keep original wastage of main record
          finalArr[find_record].Wastage = finalArr[find_record].Wastage;

          finalArr[find_record].totals.metal.IsPrimaryMetal += b?.totals?.metal?.IsPrimaryMetal;
          finalArr[find_record].totals.metal.Wt += b?.totals?.metal?.Wt;
          finalArr[find_record].totals.diamonds.Wt += b?.totals?.diamonds?.Wt;
          // finalArr[find_record].diamonds_d = [...finalArr[find_record]?.diamonds ,...b?.diamonds]?.flat();
          finalArr[find_record].diamonds = [
            ...finalArr[find_record]?.diamonds,
            ...b?.diamonds,
          ]?.flat();
          // finalArr[find_record].colorstone_d = [...finalArr[find_record]?.colorstone ,...b?.colorstone]?.flat();
          finalArr[find_record].colorstone = [
            ...finalArr[find_record]?.colorstone,
            ...b?.colorstone,
          ]?.flat();
          // finalArr[find_record].metal_d = [...finalArr[find_record]?.metal ,...b?.metal]?.flat();

          // CQ Was Solved 09/10/2025
          // finalArr[find_record].metal = [
          //   ...(finalArr[find_record]?.metal || []),
          //   ...(b?.metal || [])
          // ].flat();
          if (!finalArr[find_record].metal) {
            finalArr[find_record].metal = [];
          }
          if (Array.isArray(b?.metal)) {
            finalArr[find_record].metal.push(...cloneDeep(b.metal));
          }
          // console.log("finalArr[find_record]?.metal", finalArr[find_record]?.metal);
          // CQ Was Solved 09/10/2025

          finalArr[find_record].misc = [
            ...finalArr[find_record]?.misc,
            ...b?.misc,
          ]?.flat();
          finalArr[find_record].finding = [
            ...finalArr[find_record]?.finding,
            ...b?.finding,
          ]?.flat();

          finalArr[find_record].totals.finding.Wt += b?.totals?.finding?.Wt;
          finalArr[find_record].totals.finding.Pcs += b?.totals?.finding?.Pcs;
          finalArr[find_record].totals.finding.Amount +=
            b?.totals?.finding?.Amount;
          finalArr[find_record].totals.diamonds.Pcs += b?.totals?.diamonds?.Pcs;
          finalArr[find_record].totals.diamonds.Amount +=
            b?.totals?.diamonds?.Amount;

          finalArr[find_record].totals.colorstone.Wt +=
            b?.totals?.colorstone?.Wt;
          finalArr[find_record].totals.colorstone.Pcs +=
            b?.totals?.colorstone?.Pcs;
          finalArr[find_record].totals.colorstone.Amount +=
            b?.totals?.colorstone?.Amount;

          finalArr[find_record].totals.misc.Wt += b?.totals?.misc?.Wt;
          finalArr[find_record].totals.misc.allservwt +=
            b?.totals?.misc?.allservwt;
          finalArr[find_record].totals.misc.Pcs += b?.totals?.misc?.Pcs;
          finalArr[find_record].totals.misc.Amount += b?.totals?.misc?.Amount;

          finalArr[find_record].totals.metal.Amount += b?.totals?.metal?.Amount;
          finalArr[find_record].totals.metal.IsPrimaryMetal +=
            b?.totals?.metal?.IsPrimaryMetal;
          finalArr[find_record].totals.metal.IsPrimaryMetal_Amount +=
            b?.totals?.metal?.IsPrimaryMetal_Amount;

          finalArr[find_record].totals.misc.withouthscode1_2_pcs +=
            b?.totals?.misc?.withouthscode1_2_pcs;
          finalArr[find_record].totals.misc.withouthscode1_2_wt +=
            b?.totals?.misc?.withouthscode1_2_wt;
          finalArr[find_record].totals.misc.onlyHSCODE3_amt +=
            b?.totals?.misc?.onlyHSCODE3_amt;
          finalArr[find_record].totals.misc.onlyIsHSCODE0_Wt +=
            b?.totals?.misc?.onlyIsHSCODE0_Wt;
          finalArr[find_record].totals.misc.onlyIsHSCODE0_Pcs +=
            b?.totals?.misc?.onlyIsHSCODE0_Pcs;
          finalArr[find_record].totals.misc.onlyIsHSCODE0_Amount +=
            b?.totals?.misc?.onlyIsHSCODE0_Amount;
        }
      }
    });

    // CQ Was Solving 09/10/2025
    // finalArr.forEach((item, idx) => {
    //   console.log(`Record ${idx} GroupJob: ${item.GroupJob} has metal count:`, item.metal?.length);
    // });
    // console.log("Final finalArr stringified:\n", JSON.stringify(finalArr, null, 2));
    // CQ Was Solving 09/10/2025

    datas.resultArray = finalArr;

    //after groupjob
    datas?.resultArray?.forEach((e) => {
      let dia2 = [];
      e?.diamonds?.forEach((el) => {
        // let findrec = dia2?.findIndex((a) => a?.ShapeName === el?.ShapeName && a?.QualityName === el?.QualityName && a?.Colorname === el?.Colorname && a?.GroupName === el?.GroupName)
        let findrec = dia2?.findIndex(
          (a) =>
            a?.ShapeName === el?.ShapeName &&
            a?.QualityName === el?.QualityName &&
            a?.Colorname === el?.Colorname &&
            a?.SizeName === el?.SizeName &&
            a?.Rate === el?.Rate
        );
        let ell = cloneDeep(el);
        if (findrec === -1) {
          dia2.push(ell);
        } else {
          dia2[findrec].Wt += ell?.Wt;
          dia2[findrec].Pcs += ell?.Pcs;
          dia2[findrec].Amount += ell?.Amount;
          // dia2[findrec].Rate += ell?.Rate; // CQ Fixed 22/11/2025
          // if(dia2[findrec]?.SizeName !== ell?.SizeName){
          //   // dia2[findrec].SizeName = 'Mix'
          //   dia2[findrec].SizeName = ell?.GroupName;
          // }
        }
      });
      e.diamonds = dia2;

      //diamond
      let clr2 = [];

      e?.colorstone?.forEach((el) => {
        // let findrec = dia2?.findIndex((a) => a?.ShapeName === el?.ShapeName && a?.QualityName === el?.QualityName && a?.Colorname === el?.Colorname && a?.GroupName === el?.GroupName)
        let findrec = clr2?.findIndex(
          (a) =>
            a?.ShapeName === el?.ShapeName &&
            a?.QualityName === el?.QualityName &&
            a?.Colorname === el?.Colorname &&
            a?.SizeName === el?.SizeName &&
            a?.Rate === el?.Rate &&
            a?.isRateOnPcs === el?.isRateOnPcs
        );
        let ell = cloneDeep(el);
        if (findrec === -1) {
          clr2.push(ell);
        } else {
          clr2[findrec].Wt += ell?.Wt;
          clr2[findrec].Pcs += ell?.Pcs;
          clr2[findrec].Amount += ell?.Amount;
          clr2[findrec].Rate += ell?.Rate;
          // if(dia2[findrec]?.SizeName !== ell?.SizeName){
          //   // dia2[findrec].SizeName = 'Mix'
          //   dia2[findrec].SizeName = ell?.GroupName;
          // }
        }
      });
      e.colorstone = clr2;

      //misc
      let misc0 = [];
      e?.misc?.forEach((el) => {
        if (el?.IsHSCOE === 0) {
          misc0?.push(el);
        }
      });

      e.misc = misc0;

      if (e?.GroupJob !== "") {
        e.metal = e.metal?.map((a) => ({
          ...a,
          GroupJob: e.GroupJob,
        }));
      }
      // CQ Was Solved 09/10/2025

    });

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

    diaonlyrndarr1?.forEach((e) => {
      let findRecord = diaonlyrndarr3.findIndex(
        (a) =>
          e?.StockBarcode === a?.StockBarcode &&
          e?.ShapeName === a?.ShapeName &&
          e?.QualityName === a?.QualityName &&
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

    diaonlyrndarr2?.forEach((e) => {
      let findRecord = diaonlyrndarr4.findIndex(
        (a) =>
          e?.StockBarcode === a?.StockBarcode &&
          e?.ShapeName === a?.ShapeName &&
          e?.QualityName === a?.QualityName &&
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

    diaonlyrndarr4?.forEach((e) => {
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

    let diamondDetail = [];
    data?.BillPrint_Json2?.forEach((e) => {
      if (e?.MasterManagement_DiamondStoneTypeid === 1) {
        let findDiamond = diamondDetail?.findIndex(
          (ele) =>
            ele?.ShapeName === e?.ShapeName &&
            ele?.QualityName === e?.QualityName &&
            ele?.Colorname === e?.Colorname
        );
        if (findDiamond === -1) {
          diamondDetail.push(e);
        } else {
          diamondDetail[findDiamond].Pcs += e?.Pcs;
          diamondDetail[findDiamond].Wt += e?.Wt;
          diamondDetail[findDiamond].Amount += e?.Amount;
        }
      }
    });
    let findRND = [];
    let remaingDia = [];
    diamondDetail?.forEach((ele) => {
      if (ele?.ShapeName === "RND") {
        findRND.push(ele);
      } else {
        remaingDia.push(ele);
      }
    });

    let resultArr = [];
    findRND.sort((a, b) => {
      if (a.ShapeName !== b.ShapeName) {
        return a.ShapeName.localeCompare(b.ShapeName); // Sort by ShapeName
      } else if (a.QualityName !== b.QualityName) {
        return a.QualityName.localeCompare(b.QualityName); // If ShapeName is same, sort by QualityName
      } else {
        return a.Colorname.localeCompare(b.Colorname); // If QualityName is same, sort by Colorname
      }
    });

    remaingDia.sort((a, b) => {
      if (a.ShapeName !== b.ShapeName) {
        return a.ShapeName.localeCompare(b.ShapeName); // Sort by ShapeName
      } else if (a.QualityName !== b.QualityName) {
        return a.QualityName.localeCompare(b.QualityName); // If ShapeName is same, sort by QualityName
      } else {
        return a.Colorname.localeCompare(b.Colorname); // If QualityName is same, sort by Colorname
      }
    });
    if (findRND?.length > 6) {
      let arr = findRND.slice(0, 6);
      let anotherArr = [...findRND.slice(6), remaingDia].flat();
      let obj = { ...anotherArr[0] };
      anotherArr?.reduce((acc, cobj) => {
        obj.Pcs += cobj?.Pcs;
        obj.Wt += cobj?.Wt;
        obj.Amount += cobj?.Amount;
      }, obj);
      obj.ShapeName = "OTHER";
      resultArr = [...arr, obj].flat();
    } else {
      let arr = [...findRND].flat();
      let smallArr = [...remaingDia.slice(0, 6 - findRND?.length)].flat();
      let largeArr = [...remaingDia.slice(6 - findRND?.length)].flat();
      let finalArr = [...arr, ...smallArr].flat();

      let obj = { ...largeArr[0] };
      obj.Pcs = 0;
      obj.Wt = 0;
      obj.Amount = 0;
      largeArr?.reduce((acc, cobj) => {
        obj.Pcs += cobj?.Pcs;
        obj.Wt += cobj?.Wt;
        obj.Amount += cobj?.Amount;
      }, obj);
      obj.ShapeName = "OTHER";
      resultArr = [...finalArr, obj].flat();
    }

    setDiamondDetails(resultArr);

    diarndotherarr5 = [...diaonlyrndarr6, diaObj];
    const sortedData = diarndotherarr5?.sort(customSort);
    // setDiamonds(sortedData);
    let taxValue = taxGenrator(data?.BillPrint_Json[0], totals?.total);

    taxValue.forEach((e) => {
      totals.afterTax += +e?.amount;
    });

    totals.afterTax += totals?.beforeTax + data?.BillPrint_Json[0]?.AddLess;

    totals.netBalAmount =
      totals.afterTax - data?.BillPrint_Json[0]?.OldGoldAmount;
    totals.gwt = grossWt;
    totals.diamondWt = diamondWt;
    totals.colorStoneWt = colorStoneWt;
    totals.miscWt = miscWt;
    totals.beforeTax = totalAmountBefore;
    setTotal(totals);
    setDiamondWise(sortedData);

    setResult(datas);
  }
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
          setMsg(err);
        }
      } catch (error) {
        console.error(error);
      }
    };
    sendData();
  }, []);
  const customSort = (a, b) => {
    if (a?.ShapeName === "OTHER" && b?.ShapeName !== "OTHER") {
      return 1; // "OTHER" comes after any other ShapeName
    } else if (a?.ShapeName !== "OTHER" && b?.ShapeName === "OTHER") {
      return -1; // Any other ShapeName comes before "OTHER"
    } else {
      // If ShapeNames are equal, compare by QualityName
      if (a?.QualityName < b?.QualityName) {
        return -1;
      } else if (a?.QualityName > b?.QualityName) {
        return 1;
      } else {
        // If QualityNames are equal, compare by Colorname
        return a?.Colorname?.localeCompare(b?.Colorname);
      }
    }
  };

  // console.log("data", data);
  // console.log("result?.header", result?.header);
  // console.log("total", total);

  const handleChangeImage = (e) => {
    image ? setImage(false) : setImage(true);
  };

  const handleChangeSummary = (e) => {
    summ ? setSummy(false) : setSummy(true);
  };

  const handleChangeRetail = (e) => {
    retail ? setRetail(false) : setRetail(true);
  };
  const handleChangeCompanyDetails = (e) => {
    companyDetails ? setCompanyDetails(false) : setCompanyDetails(true);
  };

  const totalConverted =
    (result?.mainTotal?.total_amount /
      result?.header?.CurrencyExchRate +
      result?.allTaxesTotal +
      result?.header?.FreightCharges /
      result?.header?.CurrencyExchRate +
      result?.header?.AddLess /
      result?.header?.CurrencyExchRate) / result?.header?.CurrencyExchRate;
  const totalPayments =
    result?.header?.OldGoldAmount +
    result?.header?.CashReceived +
    result?.header?.AdvanceAmount +
    bank?.reduce((acc, cObj) => acc + +cObj?.amount, 0);


  console.log("TCL: totalConverted", totalConverted)

  const difference = Math.round((totalConverted - totalPayments) * 100) / 100;



  //   const diaTotal= data.map((e,i)=>{
  //      const tl=e?.diamonds.reduce((acc,d)=>{
  //         return acc + d?.RMwt * d?.Rate
  //      },0);

  //      return tl
  //   })

  //   const csTotal= data.map((e,i)=>{
  //     const tl=e?.colorstones.reduce((acc,d)=>{
  //        return acc + d?.RMwt * d?.Rate
  //     },0);

  //     return tl
  //  })

  //  let jobtotal=0
  //   data.forEach((e,i)=>{
  //     jobtotal+=e.MetalAmount

  // })

  const totalsWithMat = data.reduce(
    (acc, e) => {
      // Diamond Total
      acc.diaTotal += (e?.diamonds ?? []).reduce(
        (sum, d) => sum + (d?.RMwt ?? 0) * (d?.Rate ?? 0),
        0
      );

      // Color Stone Total
      acc.csTotal += (e?.colorstones ?? []).reduce(
        (sum, d) => sum + (d?.RMwt ?? 0) * (d?.Rate ?? 0),
        0
      );

      // Metal Total
      acc.jobTotal += e?.MetalAmount ?? 0;

      return acc;
    },
    {
      diaTotal: 0,
      csTotal: 0,
      jobTotal: 0
    }
  );

  const grandTotalWithMat = Object.values(totalsWithMat).reduce(
    (acc, value) => acc + (value ?? 0),
    0
  );




  const mergeByKey = ({
    data = [],
    groupKey = "Rate",
    sumFields = ["Pcs", "RMwt", "Amount"],
    stringFields = ["ShapeName", "QualityName"],
    flagFields = ["IsPrimaryMetal"],
    valueFields = ["metalWastage", "isRateOnPcs", "grosswt", "StockBarcode", "GroupJob", "Hid", "metalWastage1"]   // <-- added
  }) => {

    const grouped = (data ?? []).reduce((acc, item) => {
      const key = item?.[groupKey] ?? 0;

      if (!acc[key]) {
        acc[key] = { [groupKey]: key };


        sumFields.forEach(field => {
          acc[key][field] = 0;
        });


        stringFields.forEach(field => {
          acc[key][field] = [];
        });


        flagFields.forEach(field => {
          acc[key][field] = 0;
        });


        valueFields.forEach(field => {
          acc[key][field] = item?.[field] ?? 0;
        });
      }


      sumFields.forEach(field => {
        acc[key][field] += Number(item?.[field] ?? 0);
      });


      stringFields.forEach(field => {
        const value = item?.[field];
        if (value && !acc[key][field].includes(value)) {
          acc[key][field].push(value);
        }
      });


      flagFields.forEach(field => {
        if (Number(item?.[field]) === 1) {
          acc[key][field] = 1;
        }
      });

      return acc;
    }, {});

    return Object.values(grouped).map(group => {
      stringFields.forEach(field => {
        group[field] = group[field].join(", ");
      });
      return group;
    });
  };


  function mergeMetalData(dataString) {
    if (!dataString) return [];

    // extract all [ ... ] blocks
    const matches = dataString.match(/\[(.*?)\]/g) || [];

    const objects = matches.map(item => {
      const clean = item.replace(/[\[\]]/g, "");
      const obj = {};

      clean.split(",").forEach(pair => {
        let [key, value] = pair.split(":").map(v => v.trim());

        if (!key) return;

        if (key === "NetWt" || key === "TotalAmount") {
          obj[key] = parseFloat(value);
        } else {
          obj[key] = value;
        }
      });

      return obj;
    });

    // merge by MetalType + purity
    const merged = {};

    objects.forEach(item => {
      const key = `${item.MetalType}_${item.purity}`;

      if (!merged[key]) {
        merged[key] = { ...item };
      } else {
        merged[key].NetWt += item.NetWt;
        merged[key].TotalAmount += item.TotalAmount;
      }
    });

    return Object.values(merged);
  }

  const oldgolddata = mergeMetalData(result?.header?.oldgoldDetails);


  console.log("TCL: result", result)
  const totalLossWt = result?.resultArray?.reduce(
    (sum, item) => sum + Number(item?.LossWt || 0),
    0
  );


  
  console.log("TCL: PureMetalRate", PureMetalRate)
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          {msg === "" ? (
            <>
              {" "}
              <div
                className={`container-fluid ${style?.jewelelryRetailInvoiceContainer} pad_60_allPrint position-relative px-1 ${style?.RetailInvoiceprint4}`}
              >
                <div
                  className={`btnpcl align-items-baseline position-absolute right-0 top-0 m-0 ${style?.right_retailInvoicePrintsBtn} d-flex`}
                  style={{ right: "-400px" }}
                >

                  <div className="form-check pe-3">
                    <input
                      className="form-check-input"
                      id="retail"
                      type="checkbox"
                      checked={retail}
                      onChange={handleChangeRetail}
                    />
                    <label
                      className="form-check-label pt-1"
                      htmlFor="flexCheckDefault"
                      for="retail"
                    >
                      Retail
                    </label>
                  </div>

                  <div className="form-check pe-3">
                    <input
                      className="form-check-input"
                      id="companyDetails"
                      type="checkbox"
                      checked={companyDetails}
                      onChange={handleChangeCompanyDetails}
                    />
                    <label
                      className="form-check-label pt-1"
                      htmlFor="flexCheckDefault"
                      for="companyDetails"
                    >
                      Company Details
                    </label>
                  </div>


                  <div className="form-check pe-3">
                    <input
                      className="form-check-input"
                      id="sum"
                      type="checkbox"
                      checked={summ}
                      onChange={handleChangeSummary}
                    />
                    <label
                      className="form-check-label pt-1"
                      for="sum"
                    >
                      Summary
                    </label>
                  </div>
                  <div className="form-check pe-3">
                    <input
                      className="form-check-input"
                      id="image"
                      type="checkbox"
                      checked={image}
                      onChange={handleChangeImage}
                    />
                    <label
                      className="form-check-label pt-1"
                      for="image"
                    >
                      With Image
                    </label>
                  </div>
                  <Button />
                </div>
                <div className="pt-2 d-flex flex-column">
                  <div className="headlineJL w-100 p-2" style={{"justifyContent": companyDetails?"flex-start":"center","marginBottom": companyDetails?"0":"10px"}}>
                    {" "}
                    <b style={{ fontSize: "20px" }}>
                      {" "}
                      {result?.header?.PrintHeadLabel}{" "}
                      {retail ? "RETAIL INVOICE" : "TAX INVOICE"}
                    </b>{" "}
                  </div>

                  {companyDetails &&(
                    <div className="d-flex w-100">
                    <div className="col-10 p-2">
                      <div className="fslhJL">
                        <h5>
                          {" "}
                          <b style={{ fontSize: "16px", color: "black" }}>
                            {" "}
                            {result?.header?.CompanyFullName}{" "}
                          </b>{" "}
                        </h5>
                      </div>
                      <div className="fslhJL">{result?.header?.CompanyAddress}</div>
                      <div className="fslhJL">
                        {result?.header?.CompanyAddress2}
                      </div>
                      <div className="fslhJL">
                        {result?.header?.CompanyCity}-{result?.header?.CompanyPinCode},
                        {result?.header?.CompanyState}({result?.header?.CompanyCountry})
                      </div>

                      <div className="fslhJL">
                        {result?.header?.CompanyEmail} |{result?.header?.CompanyWebsite}
                      </div>
                      {/* <div className='fslhpcl3'>{result?.header?.Company_VAT_GST_No} | {result?.header?.Cust_CST_STATE}-{result?.header?.Company_CST_STATE_No} | PAN-EDJHF236D</div> */}
                      <div className="fslhJL">
                        {result?.header?.Company_VAT_GST_No}
                        {result?.header?.Company_CST_STATE_No !== "" &&
                          result?.header?.Company_CST_STATE !== "" &&
                          `| ${result?.header?.Company_CST_STATE}-${result?.header?.Company_CST_STATE_No}`}
                        {result?.header?.Com_pannumber !== "" &&
                          ` | PAN-${result?.header?.Com_pannumber}`}
                      </div>
                      <div className="fslhJL">
                        T {result?.header?.CompanyTellNo}
                        {/* | TOLL FREE{" "}
                        {result?.header?.CompanyTollFreeNo} */}
                      </div>
                    </div>
                    <div className="col-2 d-flex align-items-center justify-content-center">
                      {/* <img
                      src={result?.header?.PrintLogo}
                      alt="#"
                      className={`w-100 d-block ms-auto ${style?.imgJewelleryRetailinovicePrint3}`}
                    /> */}
                      {isImageWorking && result?.header?.PrintLogo !== "" && (
                        <img
                          src={result?.header?.PrintLogo}
                          alt=""
                          className={`w-100 d-block ms-auto ${style?.imgJewelleryRetailinovicePrint3}`}
                          onError={handleImageErrors}
                          height={120}
                          width={150}
                        />
                      )}
                    </div>
                  </div>

                  )}
                  
                  {/* header data */}
                  <div className="d-flex border w-100 no_break">
                    <div className={`col-${!retail ? 4 : 8} p-2 b border-end`}>
                      {/* <div className="fslhJL">{result?.header?.lblBillTo}</div> */}
                      <div className="fslhJL"> Bill To,</div>
                      <div className="fslhJL">
                        <b className="JL13" style={{ fontSize: "14px" }}>
                          {result?.header?.CustName}
                        </b>
                      </div>
                      {result?.header?.customerAddress1?.length > 0 ? (
                        <div className="fslhJL">
                          {result?.header?.customerAddress1}
                        </div>
                      ) : (
                        ""
                      )}
                      {result?.header?.customerAddress2?.length > 0 ? (
                        <div className="fslhJL">
                          {result?.header?.customerAddress2}
                        </div>
                      ) : (
                        ""
                      )}
                      {result?.header?.customerAddress3?.length > 0 ? (
                        <div className="fslhJL">
                          {result?.header?.customercity}-{result?.header?.PinCode}
                        </div>
                      ) : (
                        ""
                      )}
                      <div className="fslhJL">{result?.header?.CompanyCountry}</div>
                      <div className="fslhJL">{result?.header?.customeremail1}</div>
                      <div className="fslhJL">
                        Phno: {result?.header?.customermobileno}
                      </div>
                      <div className="fslhJL" style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "break-word" }}>
                        {result?.header?.vat_cst_pan}{" "}
                        {result?.header?.aadharno !== "" &&
                          `| Aadhar-${result?.header?.aadharno}`}
                      </div>
                      <div className="fslhJL">
                        {result?.header?.Cust_CST_STATE}-
                        {result?.header?.Cust_CST_STATE_No}
                      </div>
                    </div>

                    {!retail && (
                      <div className="col-4 p-2 border-end">
                        <p>Ship To,</p>
                        <b>{result?.header?.customerfirmname}</b>
                        {result?.header?.address?.map((e, i) => {
                          return (
                            <div className="" key={i}>
                              {e}
                            </div>
                          );
                        })}
                      </div>

                    )}


                    <div className="col-4 p-2 position-relative">
                      {result?.header?.Company_VAT_GST_No !== "" && (
                        <div className="d-flex">
                          <div className="col-6">
                            <b className="JL13">GSTIN </b>
                          </div>
                          <div className="col-6">{result?.header?.Company_VAT_GST_No?.split("-")[1]}</div>
                        </div>
                      )}

                      {result?.header?.Company_CST_STATE_No !== "" && (
                        <div className="d-flex">
                          <div className="col-6">
                            <b className="JL13">STATE CODE</b>
                          </div>
                          <div className="col-6">{result?.header?.Company_CST_STATE_No}</div>
                        </div>
                      )}


                      <div className="d-flex">
                        <div className="col-6">
                          <b className="JL13">Bill No</b>
                        </div>
                        <div className="col-6">{result?.header?.InvoiceNo}</div>
                      </div>
                      <div className="d-flex">
                        <div className="col-6">
                          <b className="JL13">DATE</b>
                        </div>
                        <div className="col-6">{result?.header?.EntryDate}</div>
                      </div>

                      {/* <div className="d-flex">
                        <div className="col-6">
                          <b className="JL13">HSN</b>
                        </div>
                        <div className="col-6">{result?.header?.HSN_No}</div>
                      </div> */}

                      <div className="d-flex">
                        <div className="col-6">
                          <b className="JL13">NAME OF GOODS</b>
                        </div>
                        <div className="col-6">{result?.header?.NameOfGoods}</div>
                      </div>
                      <div className="d-flex">
                        <div className="col-6">
                          <b className="JL13">PLACE OF SUPPLY
                          </b>
                        </div>
                        <div className="col-6">{result?.header?.customerstate}</div>
                      </div>
                      {document?.map((e, i) => {
                        return (
                          <div className="d-flex" key={i}>
                            <div className="col-6">
                              <b className="JL13">{e?.label}</b>
                            </div>
                            <div className="col-6">{e?.value}</div>
                          </div>
                        );
                      })}
                      {/* {result?.header?.aadharno !== "" && <div className="d-flex">
                      <div className="col-4">
                        <b className="JL13">AADHAR CARD</b>
                      </div>
                      <div className="col-8">
                        {result?.header?.aadharno}
                      </div>
                    </div>} */}
                     <div className="position-absolute bottom-0" style={{marginTop:"10px"}}>
                     <div className="d-flex    w-100 bottom-0 font-bill">
                      <div className="d-flex">
                        <b className="JL13 lable  pe-2" style={{width:"40px",fontSize:"15px"}}>Gold</b>
                        <b className="" style={{fontSize:"15px"}}> {NumberWithCommas( PureMetalRate?.[0]?.Price, 2)}</b>
                      </div>
                    </div>
                    <div className="d-flex  w-100  bottom-0 font-bill">
                      <div className="d-flex">
                        <b className="JL13 label " style={{width:"40px",fontSize:"15px"}}>Silver</b>
                        <b className="" style={{fontSize:"15px"}}> {NumberWithCommas( PureMetalRate?.[1]?.Price, 2)}</b>
                      </div>
                    </div>
                     </div>
                    </div>
                  </div>
                  {/* Table Heading */}
                  <div className="pt-1 no_break">
                    <div className="border d-flex">
                      <div
                        className={`${style?.srNoJewerryRetailInvoicePrint} border-end p-1 d-flex align-items-center justify-content-center`}
                      >
                        <p className="fw-bold">Sr#</p>
                      </div>
                      <div
                        className={`${style?.productJewerryRetailInvoicePrint} border-end p-1 fw-bold d-flex align-items-center justify-content-center`}
                        style={{ width: "15%" }}
                      >
                        <p className="fw-bold"> Description</p>
                      </div>
                      <div
                        className={`${style?.materialJewerryRetailInvoicePrint}`}
                        style={{ width: "55%" }}
                      >

                        <div className="d-flex">
                          <div
                            className={`col-2 d-flex align-items-center justify-content-center`}
                          >
                            <p className="fw-bold p-1">Detail</p>
                          </div>
                          <div
                            className={`col-2 d-flex align-items-center justify-content-center `}
                            style={{ width: "10%" }}
                          >
                            <p className="fw-bold p-1">HSN</p>
                          </div>
                          <div
                            className={`col-2 d-flex align-items-center justify-content-center `}
                            style={{ width: "7%" }}
                          >
                            <p className="fw-bold p-1">QTY</p>
                          </div>
                          <div
                            className={`col-2 d-flex align-items-center justify-content-center  p-1 flex-column`}
                            style={{ width: "14%" }}
                          >
                            <p className="fw-bold">Gross. Wt</p>

                          </div>
                          <div
                            className={`col-2 d-flex align-items-center justify-content-center `}
                            style={{ width: "11%" }}
                          >
                            <p className="fw-bold p-1">Net Wt.</p>
                          </div>
                          <div
                            className={`col-2 d-flex align-items-center justify-content-center `}
                            style={{ width: "11%" }}
                          >
                            <p className="fw-bold p-1">Pcs</p>
                          </div>
                          <div
                            className={`col-2 d-flex align-items-center justify-content-center `}
                            style={{ width: "15%" }}
                          >
                            <p className="fw-bold p-1">Wt.</p>
                          </div>
                          <div
                            className={`col-2 d-flex align-items-center justify-content-center`}
                            style={{ width: "17%" }}
                          >
                            <p className="fw-bold p-1">Rate</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`${style?.othersJewerryRetailInvoicePrint}   d-flex align-items-center justify-content-center`}
                        style={{ width: "5%" }}
                      >
                        <p className="fw-bold"> V.A</p>
                      </div>
                      <div
                        className={`${style?.othersJewerryRetailInvoicePrint}   d-flex align-items-center justify-content-center`}
                        style={{ width: "9%" }}
                      >
                        <p className="fw-bold"> V.A</p>
                      </div>
                      <div
                        className={`${style?.othersJewerryRetailInvoicePrint}  d-flex align-items-center justify-content-center`}
                        style={{ width: "8%" }}
                      >
                        <p className="fw-bold">Handling</p>
                      </div>
                      <div
                        className={`${style?.totalJewerryRetailInvoicePrint} d-flex align-items-center justify-content-center`}
                      >
                        <p className="fw-bold">Amount</p>
                      </div>
                    </div>
                  </div>
                  {/* data */}
                  {result?.resultArray?.length > 0 &&
                    result?.resultArray?.map((e, i) => {
                      return (
                        <>
                          <div
                            className="border-start border-end   d-flex no_break"
                            key={i}
                          >
                            <div
                              className={`${style?.srNoJewerryRetailInvoicePrint} border-end p-1 d-flex align-items-center justify-content-center`}
                            >
                              <p className="">{i + 1}</p>
                            </div>
                            <div
                              className={`${style?.productJewerryRetailInvoicePrint} border-end p-1 `}
                              style={{ width: "15%" }}
                            >
                              <p className="" style={{ wordBreak: "normal" }}>
                                {e?.SubCategoryname} {e?.Categoryname}
                              </p>
                              <p className="" style={{ wordBreak: "normal" }}>
                                {e?.designno} | {e?.GroupJob ? e?.GroupJob : e?.SrJobno}
                              </p>
                              {image && (
                                <img
                                  src={e?.DesignImage}
                                  alt=""
                                  onError={handleImageError}
                                  lazy="eagar"
                                  className={`w-100 mx-auto d-block p-1 ${style?.imageJewelleryC}`}
                                  style={{ maxWidth: "75px", maxHeight: "75px" }}
                                />
                              )}
                              {e?.HUID !== "" && (
                                <p
                                  style={{ wordBreak: "normal" }}
                                  className={`text-center ${!image && "pt-3"}`}
                                >
                                  HUID-{e?.HUID}
                                </p>
                              )}
                            </div>
                            <div
                              className={`${style?.materialJewerryRetailInvoicePrint}  `}
                              style={{ width: "55%" }}
                            >
                              <div className=" h-100">
                                {/* {Array.isArray(e?.metal) && e.metal.length > 0 && (
                                  mergeByKey({
                                    data: e.metal,
                                    groupKey: "Rate",
                                    sumFields: ["Pcs", "RMwt", "Amount"]
                                  })
                                    ?.sort((a, b) => (b?.IsPrimaryMetal ?? 0) - (a?.IsPrimaryMetal ?? 0))
                                    ?.map((d, i) => (
                                      <div key={i} className="d-flex">
                                        <div className="col-2 d-flex align-items-center">

                                          <p className="p-1 lh-1">
                                            {d?.ShapeName?.length >= 8 ? (
                                              <>
                                                {d?.ShapeName}
                                                <br />
                                                {d?.QualityName}
                                              </>
                                            ) : (
                                              `${d?.ShapeName ?? ""} ${d?.QualityName ?? ""}`
                                            )}
                                          </p>
                                        </div>
                                        <div
                                          className={`col-2  d-flex align-items-start justify-content-center`}
                                          style={{ wordBreak: "normal", textAlign: "right", width: "10%" }}

                                        >
                                          <p
                                            className="p-1 lh-1"
                                            style={{ wordBreak: "normal" }}
                                          >
                                            {e?.HSNNo}
                                          </p>
                                        </div>
                                        <div
                                          className={`col-2 d-flex align-items-start justify-content-center `}
                                          style={{ width: "7%" }}
                                        >
                                          <p className=" p-1">{d.IsPrimaryMetal === 1 ? e?.BulkPurchaseQTY : ""}</p>
                                        </div>
                                        <div
                                          className={`col-2  d-flex align-items-start justify-content-end`}
                                          style={{ width: "14%" }}
                                        >
                                          <p className=" p-1 text-end lh-1">

                                            {d.IsPrimaryMetal === 1 ? fixedValues(e?.grosswt, 3) : ""}
                                          </p>
                                        </div>

                                        <div
                                          className={`col-2  d-flex align-items-start justify-content-end`}
                                          style={{ width: "11%" }}
                                        >
                                          <p className=" p-1 text-end lh-1">
                                            {NumberWithCommas(d?.RMwt, 3)}
                                          </p>
                                        </div>
                                        <div
                                          className={`col-2 d-flex align-items-start justify-content-center  `}
                                          style={{ width: "11%" }}
                                        >
                                          <p className="fw-bold p-1"></p>
                                        </div>
                                        <div
                                          className={`col-2 d-flex align-items-start justify-content-center  `}
                                          style={{ width: "15%" }}
                                        >
                                          <p className="fw-bold p-1">

                                          </p>
                                        </div>
                                        <div
                                          className={`col-2 d-flex align-items-start justify-content-center`}
                                          style={{ width: "17%" }}
                                        >
                                          <p className=" p-1 text-end lh-1">
                                            {NumberWithCommas(
                                              d?.Rate /
                                              result?.header?.CurrencyExchRate,
                                              2
                                            )}
                                          </p>
                                        </div>
                                        <div
                                          className={"col-2 d-flex align-items-start justify-content-center"}
                                          style={{ width: "5%" }}
                                        >
                                          <p className=""> {NumberWithCommas(d.metalWastage, 2)}</p>
                                        </div>
                                      </div>
                                    ))
                                )} */}
                                {Array.isArray(e?.metal) && e.metal.length > 0 && (() => {
                                  const totalFindingRMwt = (e?.finding || []).reduce(
                                    (sum, f) => sum + Number(f?.RMwt || 0),
                                    0
                                  );

                                  return mergeByKey({
                                    data: e.metal,
                                    groupKey: "Rate",
                                    sumFields: ["Pcs", "RMwt", "Amount"]
                                  })
                                    ?.sort((a, b) => (b?.IsPrimaryMetal ?? 0) - (a?.IsPrimaryMetal ?? 0))
                                    ?.map((d, i) => (
                                      <div key={i} className="d-flex">
                                        {/* Metal Name */}
                                        <div className="col-2 d-flex align-items-center">
                                          <p className="p-1 lh-1">
                                            {d?.ShapeName?.length >= 8 ? (
                                              <>
                                                {d?.ShapeName}
                                                <br />
                                                {d?.QualityName}
                                              </>
                                            ) : (
                                              `${d?.ShapeName ?? ""} ${d?.QualityName ?? ""}`
                                            )}
                                          </p>
                                        </div>

                                        {/* HSN */}
                                        <div className="col-2 d-flex align-items-start justify-content-center" style={{ width: "10%" }}>
                                          <p className="p-1 lh-1">{e?.HSNNo}</p>
                                        </div>

                                        {/* Qty */}
                                        <div className="col-2 d-flex align-items-start justify-content-center" style={{ width: "7%" }}>
                                          <p className="p-1">{d.IsPrimaryMetal === 1 ? e?.BulkPurchaseQTY : ""}</p>
                                        </div>

                                        {/* Gross Wt */}
                                        <div className="col-2 d-flex align-items-start justify-content-end" style={{ width: "14%" }}>
                                          <p className="p-1 text-end lh-1">
                                            {d?.GroupJob ? d?.GroupJob == d?.StockBarcode ? d.IsPrimaryMetal === 1 ? fixedValues(e?.grosswt, 3) : "" : "" : d.IsPrimaryMetal === 1 ? fixedValues(e?.grosswt, 3) : ""}
                                          </p>
                                        </div>

                                        {/* Net Wt (minus findings) */}
                                        <div className="col-2 d-flex align-items-start justify-content-end" style={{ width: "11%" }}>
                                          <p className="p-1 text-end lh-1">
                                            {NumberWithCommas(
                                              d?.IsPrimaryMetal === 1
                                                ? d?.RMwt - totalFindingRMwt
                                                : d?.RMwt,
                                              3
                                            )}
                                          </p>
                                        </div>

                                        {/* Empty */}
                                        <div className="col-2 d-flex align-items-start justify-content-center" style={{ width: "11%" }}>
                                          <p className="fw-bold p-1"></p>
                                        </div>

                                        <div className="col-2 d-flex align-items-start justify-content-center" style={{ width: "15%" }}>
                                          <p className="fw-bold p-1"></p>
                                        </div>

                                        {/* Rate */}
                                        <div className="col-2 d-flex align-items-start justify-content-center" style={{ width: "17%" }}>
                                          <p className="p-1 text-end lh-1">
                                            {NumberWithCommas(
                                              d?.Rate / result?.header?.CurrencyExchRate,
                                              2
                                            )}
                                          </p>
                                        </div>

                                        {/* Wastage */}
                                        <div className="col-2 d-flex align-items-start justify-content-center" style={{ width: "8%" }}>
                                          {/* <p className="p-1">{NumberWithCommas(e?.Wastage, 2)}</p> */}
                                          <p className="p-1">
                                            {
                                              d.IsPrimaryMetal === 1
                                                ? NumberWithCommas(
                                                  (d?.metalWastage1), // convert array → string
                                                  2
                                                )
                                                : NumberWithCommas(d?.metalWastage, 2)
                                            }
                                          </p>
                                        </div>

                                      </div>
                                    ));

                                })()}


                                {Array.isArray(e?.diamonds) && e.diamonds.length > 0 && (
                                  mergeByKey({
                                    data: e.diamonds,
                                    groupKey: "Rate",
                                    sumFields: ["Pcs", "RMwt", "Amount"]
                                  })?.map((d, i) => (
                                    <div className={`d-flex `}>
                                      <div
                                        className={`col-2  d-flex `}
                                      >
                                        <p className="p-1 lh-1">DIAMOND</p>
                                      </div>
                                      <div
                                        className={`col-2  d-flex `}
                                        style={{ width: "10%" }}
                                      >
                                        <p className="p-1 lh-1"></p>
                                      </div>
                                      <div
                                        className={`col-2 d-flex  justify-content-center `}
                                        style={{ width: "7%" }}
                                      >
                                        <p className="fw-bold p-1"></p>
                                      </div>
                                      <div
                                        className={`col-2  d-flex  justify-content-end`}
                                        style={{ width: "14%" }}
                                      >
                                        <p className=" p-1 text-end lh-1"></p>
                                      </div>
                                      <div
                                        className={`col-2  p-1 d-flex  justify-content-end`}
                                        style={{ width: "11%" }}
                                      >
                                        <p className=" text-end lh-1">

                                        </p>
                                      </div>

                                      <div
                                        className={`col-2 d-flex  justify-content-center `}
                                        style={{ width: "11%" }}
                                      >
                                        <p className="p-1">{NumberWithCommas(Number(d.Pcs) || 0)}</p>
                                      </div>
                                      <div
                                        className={`col-2 d-flex  justify-content-center `}
                                        style={{ width: "15%" }}
                                      >
                                        <p className="p-1">{NumberWithCommas(Number(d.RMwt) || 0, 2)} ctw</p>
                                      </div>
                                      <div
                                        className={`col-2  d-flex  justify-content-center`}
                                        style={{ width: "17%" }}
                                      >
                                        <p className="p-1 text-end lh-1">{NumberWithCommas(Number(d.Rate) || 0, 2)}</p>

                                      </div>
                                      <div
                                        className={`col-2  d-flex  justify-content-center`}
                                        style={{ width: "5%" }}
                                      >
                                        <p></p>
                                      </div>
                                    </div>
                                  ))
                                )}

                                {Array.isArray(e?.colorstone) && e.colorstone.length > 0 && (
                                  mergeByKey({
                                    data: e.colorstone,
                                    groupKey: "Rate",
                                    sumFields: ["Pcs", "RMwt", "Amount"]
                                  })?.map((d, i) => (
                                    <div className={`d-flex `}>
                                      <div
                                        className={`col-2  d-flex `}
                                      >
                                        <p className="p-1 lh-1">COLORSTONE</p>
                                      </div>
                                      <div
                                        className={`col-2  d-flex `}
                                        style={{ width: "10%" }}
                                      >
                                        <p className="p-1 lh-1"></p>
                                      </div>
                                      <div
                                        className={`col-2 d-flex  justify-content-center `}
                                        style={{ width: "7%" }}
                                      >
                                        <p className="fw-bold p-1"></p>
                                      </div>
                                      <div
                                        className={`col-2  d-flex  justify-content-end`}
                                        style={{ width: "14%" }}
                                      >
                                        <p className=" p-1 text-end lh-1"></p>
                                      </div>
                                      <div
                                        className={`col-2  p-1 d-flex  justify-content-end`}
                                        style={{ width: "11%" }}
                                      >
                                        <p className=" text-end lh-1">

                                        </p>
                                      </div>

                                      <div
                                        className={`col-2 d-flex  justify-content-center `}
                                        style={{ width: "11%" }}
                                      >
                                        <p className="p-1">{NumberWithCommas(Number(d?.Pcs) || 0)}</p>
                                      </div>
                                      <div
                                        className={`col-2 d-flex  justify-content-center `}
                                        style={{ width: "15%" }}
                                      >
                                        <p className="p-1">{NumberWithCommas(Number(d?.RMwt) || 0, 2)} ctw</p>
                                      </div>
                                      <div
                                        className={`col-2  d-flex  justify-content-center`}
                                        style={{ width: "17%" }}
                                      >
                                        <p className="p-1 text-end lh-1">{NumberWithCommas(Number(d?.Rate) || 0, 2)}</p>                           </div>
                                      <div
                                        className={`col-2  d-flex  justify-content-center`}
                                        style={{ width: "5%" }}
                                      >
                                        <p className="">  </p>
                                      </div>
                                    </div>
                                  ))
                                )}

                                {Array.isArray(e?.misc) && e.misc.length > 0 && (
                                  mergeByKey({
                                    data: e.misc,
                                    groupKey: "Rate",
                                    sumFields: ["Pcs", "RMwt", "Amount"]
                                  })?.map((d, i) => (
                                    <div className={`d-flex `}>
                                      <div
                                        className={`col-2  d-flex align-items-center`}
                                      >
                                        <p className="p-1 lh-1">MISC</p>
                                      </div>
                                      <div
                                        className={`col-2  d-flex `}
                                        style={{ width: "10%" }}
                                      >
                                        <p className="p-1 lh-1"></p>
                                      </div>
                                      <div
                                        className={`col-2 d-flex  justify-content-center `}
                                        style={{ width: "7%" }}
                                      >
                                        <p className="fw-bold p-1"></p>
                                      </div>
                                      <div
                                        className={`col-2  d-flex  justify-content-end`}
                                        style={{ width: "14%" }}
                                      >
                                        <p className=" p-1 text-end lh-1"></p>
                                      </div>
                                      <div
                                        className={`col-2  p-1 d-flex  justify-content-end`}
                                        style={{ width: "11%" }}
                                      >
                                        <p className=" text-end lh-1">

                                        </p>
                                      </div>

                                      <div
                                        className={`col-2 d-flex  justify-content-center `}
                                        style={{ width: "11%" }}
                                      >
                                        <p className="p-1">{NumberWithCommas(Number(d?.Pcs) || 0)}</p>
                                      </div>
                                      <div
                                        className={`col-2 d-flex  justify-content-center `}
                                        style={{ width: "15%" }}
                                      >
                                        <p className="p-1">{NumberWithCommas(Number(d?.RMwt) || 0, 2)} gm</p>
                                      </div>
                                      <div
                                        className={`col-2  d-flex  justify-content-center`}
                                        style={{ width: "17%" }}
                                      >
                                        <p className="p-1 text-end lh-1">{NumberWithCommas(Number(d?.Rate) || 0, 2)}</p>                   </div>
                                      <div
                                        className={`col-2  d-flex  justify-content-center`}
                                        style={{ width: "5%" }}
                                      >
                                        <p className=""> </p>
                                      </div>
                                    </div>
                                  ))
                                )}

                                {Array.isArray(e?.finding) && e.finding.length > 0 && (


                                  e?.finding?.map((d, i) => (


                                    <div className={`d-flex `}>
                                      <div
                                        className={`col-2  d-flex align-items-center`}
                                      >
                                        <p className="p-1 lh-1">FINDING <br /> {d?.ShapeName + " " + d?.QualityName}</p>
                                      </div>
                                      <div
                                        className={`col-2  d-flex align-items-center`}
                                        style={{ width: "10%" }}
                                      >
                                        <p className="p-1 lh-1"></p>
                                      </div>
                                      <div
                                        className={`col-2 d-flex  justify-content-center `}
                                        style={{ width: "7%" }}
                                      >
                                        <p className="fw-bold p-1"></p>
                                      </div>
                                      <div
                                        className={`col-2  d-flex  justify-content-end`}
                                        style={{ width: "14%" }}
                                      >
                                        <p className=" p-1 text-end lh-1"></p>
                                      </div>
                                      <div
                                        className={`col-2  p-1 d-flex  justify-content-end`}
                                        style={{ width: "11%" }}
                                      >
                                        <p className=" text-end lh-1">

                                        </p>
                                      </div>

                                      <div
                                        className={`col-2 d-flex  justify-content-center `}
                                        style={{ width: "11%" }}
                                      >
                                        <p className="p-1">{NumberWithCommas(Number(d?.Pcs) || 0)}</p>
                                      </div>
                                      <div
                                        className={`col-2 d-flex  justify-content-center `}
                                        style={{ width: "15%" }}
                                      >
                                        <p className="p-1">{NumberWithCommas(Number(d?.RMwt) || 0, 2)} gm</p>
                                      </div>
                                      <div
                                        className={`col-2  d-flex  justify-content-center`}
                                        style={{ width: "17%" }}
                                      >
                                        {/* <p className="p-1 text-end lh-1">{NumberWithCommas(Number(d?.Rate) || 0, 2)}</p>                 */}
                                        <p className="p-1 text-end lh-1">{NumberWithCommas(Number(e?.primary_metal_rate) || 0, 2)}</p>
                                      </div>
                                      <div
                                        className={"col-2  d-flex  justify-content-center"}
                                        style={{ width: "8%" }}
                                      >
                                        <p className="p-1"> {NumberWithCommas(d.metalWastage, 2)}</p>
                                      </div>
                                    </div>
                                  ))
                                )}










                                {/* {e?.otherMetals.length !== 0 && (() => {
                                  const mergedOther = mergeByKey({
                                    data: e?.otherMetals,
                                    groupKey: "Rate",
                                    sumFields: ["Pcs", "RMwt", "Amount"],
                                    stringFields: ["ShapeName", "QualityName"]
                                  });

                                  return mergedOther.map((m, i) => (
                                    <div className={`d-flex `}>
                                      <div
                                        className={`col-2  d-flex align-items-center`}
                                      >
                                        <p className="p-1 lh-1">{m.ShapeName + " " + m.QualityName}</p>
                                      </div>
                                      <div
                                        className={`col-2  d-flex align-items-center`}
                                        style={{ width: "10%" }}
                                      >
                                        <p className="p-1 lh-1"></p>
                                      </div>
                                      <div
                                        className={`col-2 d-flex align-items-center justify-content-center `}
                                        style={{ width: "7%" }}
                                      >
                                        <p className="fw-bold p-1"></p>
                                      </div>
                                      <div
                                        className={`col-2  d-flex align-items-center justify-content-end`}
                                        style={{ width: "14%" }}
                                      >
                                        <p className=" p-1 text-end lh-1"></p>
                                      </div>
                                      <div
                                        className={`col-2  p-1 d-flex align-items-center justify-content-end`}
                                        style={{ width: "11%" }}
                                      >
                                        <p className=" text-end lh-1">

                                        </p>
                                      </div>

                                      <div
                                        className={`col-2 d-flex align-items-center justify-content-center `}
                                        style={{ width: "11%" }}
                                      >
                                        <p className=" p-1">{NumberWithCommas(m.Pcs)}{" "}</p>
                                      </div>
                                      <div
                                        className={`col-2 d-flex align-items-center justify-content-center `}
                                        style={{ width: "15%" }}
                                      >
                                        <p className=" p-1">{NumberWithCommas(m.RMwt, 2)}{" gm"}</p>
                                      </div>
                                      <div
                                        className={`col-2  d-flex align-items-center justify-content-center`}
                                        style={{ width: "17%" }}
                                      >
                                        <p className=" p-1 text-end lh-1" >{NumberWithCommas(m.Rate, 2)}{" "}</p>
                                      </div>

                                    </div>
                                  ));
                                })()} */}
                                {/* {e?.primaryMetal?.length === 0 &&
                                  e?.diamondWt === 0 &&
                                  e?.colorStoneWt === 0 &&
                                  e?.miscsWt === 0 &&
                                  e?.findingWt !== 0 && (
                                    <div className="d-flex">
                                      <div className={` border-end`}>
                                        <p className="p-1 lh-1"></p>
                                      </div>
                                      <div className={` border-end`}>
                                        <p className="p-1 lh-1"></p>
                                      </div>
                                      <div className={` border-end`}>
                                        <p className="p-1 text-end lh-1"></p>
                                      </div>
                                      <div className={` border-end p-1 `}>
                                        <p className="text-end lh-1"></p>
                                      </div>
                                      <div className={`border-end `}>
                                        <p className="p-1 text-end lh-1"></p>
                                      </div>
                                      <div className={` `}>
                                        <p className="p-1 text-end lh-1"></p>
                                      </div>
                                    </div>
                                  )}  */}
                              </div>
                            </div>
                            <div
                              className={`${style?.metalMakingJewerryRetailInvoicePrint}  align-items-start d-flex justify-content-center`}
                              style={{ width: "5%" }}
                            >

                            </div>
                            <div
                              className={`${style?.othersJewerryRetailInvoicePrint}  align-items-start d-flex justify-content-center`}
                              style={{ width: "9%" }}
                            >
                              <p className=" text-end p-1">
                                {
                                  NumberWithCommas(
                                    (e?.MakingAmount ?? 0) +
                                    (e?.miscsAmount ?? 0) +
                                    (e?.OtherCharges ?? 0) +
                                    // (e?.TotalDiamondHandling ?? 0) +
                                    (e?.TotalCsSetcost ?? 0) +
                                    (e?.TotalDiaSetcost ?? 0) +
                                    (e?.totals?.finding?.SettingAmount ?? 0) / result?.header?.CurrencyExchRate
                                    , 2
                                  )
                                }
                              </p>
                            </div>
                            <div
                              className={`${style?.othersJewerryRetailInvoicePrint}  align-items-start d-flex justify-content-center`}
                              style={{ width: "8%" }}
                            >
                              <p className=" text-end p-1">
                                {/* {NumberWithCommas(e?.OtherCharges, 2)} */}
                                {NumberWithCommas(e?.TotalDiamondHandling, 2)}
                              </p>
                            </div>
                            <div
                              className={`${style?.totalJewerryRetailInvoicePrint} `}
                            >

                              {e?.Metal?.map((ele, ind) => {
                                return (
                                  <p className=" text-end p-1">

                                    {NumberWithCommas((e?.Metal?.length === 0 ? e?.NetWt + e?.LossWt : ele?.Wt) * (ele?.Rate / result?.header?.CurrencyExchRate), 2)}
                                  </p>
                                );
                              })}

                              {/* {Array.isArray(e?.metal) && e.metal.length > 0 && (

                                mergeByKey({
                                  data: e.metal,
                                  groupKey: "Rate",
                                  sumFields: ["Pcs", "RMwt", "Amount"]
                                })?.map((d, i) => (
                                  <p className=" text-end p-1">
                                    {NumberWithCommas(d?.RMwt * d?.Rate, 2)}
                                  </p>
                                ))
                              )} */}

                              {Array.isArray(e?.metal) && e.metal.length > 0 && (() => {

                                const totalFindingRMwt = (e?.finding || []).reduce(
                                  (sum, f) => sum + Number(f?.RMwt || 0),
                                  0
                                );

                                return mergeByKey({
                                  data: e.metal,
                                  groupKey: "Rate",
                                  sumFields: ["Pcs", "RMwt", "Amount"]
                                })
                                  ?.map((d, i) => (
                                    <p className=" text-end p-1">
                                      {NumberWithCommas(
                                        ((d?.IsPrimaryMetal === 1 ? (d?.RMwt - totalFindingRMwt) : d?.RMwt) * d?.Rate),
                                        2
                                      )}
                                    </p>
                                  ))

                              })()}


                              {Array.isArray(e?.diamonds) && e.diamonds.length > 0 && (
                                mergeByKey({
                                  data: e.diamonds,
                                  groupKey: "Rate",
                                  sumFields: ["Pcs", "RMwt", "Amount"]
                                })?.map((d, i) => (
                                  <p className=" text-end p-1">
                                    {NumberWithCommas(d?.isRateOnPcs == 1 ? d?.Pcs * d?.Rate : d?.RMwt * d?.Rate, 2)}
                                  </p>
                                ))
                              )}

                              {Array.isArray(e?.colorstone) && e.colorstone.length > 0 && (
                                mergeByKey({
                                  data: e.colorstone,
                                  groupKey: "Rate",
                                  sumFields: ["Pcs", "RMwt", "Amount"]
                                })?.map((d, i) => (
                                  <p className=" text-end p-1">
                                    {NumberWithCommas(d?.isRateOnPcs == 1 ? d?.Pcs * d?.Rate : d?.RMwt * d?.Rate, 2)}
                                  </p>
                                ))
                              )}







                              {Array.isArray(e?.misc) && e.misc.length > 0 && (
                                mergeByKey({
                                  data: e.misc,
                                  groupKey: "Rate",
                                  sumFields: ["Pcs", "RMwt", "Amount"]
                                })?.map((d, i) => (

                                  <p className=" text-end p-1">
                                    {NumberWithCommas(d?.isRateOnPcs == 1 ? d?.Pcs * d?.Rate : d?.RMwt * d?.Rate, 2)}
                                  </p>
                                ))
                              )}



                              {Array.isArray(e?.finding) && e.finding.length > 0 && (
                                e?.finding?.map((d, i) => (
                                  <p className=" text-end p-1">
                                    {/* {NumberWithCommas(d?.RMwt * d?.Rate, 2)} */}
                                    {NumberWithCommas(d?.RMwt * e?.primary_metal_rate, 2)}
                                  </p>
                                ))
                              )}
                            </div>
                          </div>

                          <div className="border-start border-end border-bottom d-flex" style={{ borderTop: "none" }}>
                            <div
                              className={`${style?.srNoJewerryRetailInvoicePrint} border-end    p-1 d-flex align-items-center justify-content-center`}
                              style={{ width: "5.1%" }}
                            >
                              <p className="fw-bold"> </p>
                            </div>
                            <div
                              className={`${style?.productJewerryRetailInvoicePrint} border-end p-1 fw-bold d-flex align-items-center justify-content-center`}
                              style={{ width: "15.3%" }}
                            >
                              <p className="fw-bold"> </p>
                            </div>
                            <div
                              className={`${style?.materialJewerryRetailInvoicePrint}`}
                              style={{ width: "55%" }}
                            >

                              <div className="d-flex">
                                <div
                                  className={`col-2 d-flex align-items-center justify-content-center`}
                                >
                                  <p className="fw-bold p-1"></p>
                                </div>
                                <div
                                  className={`col-2 d-flex align-items-center justify-content-center `}
                                  style={{ width: "13%" }}
                                >
                                  <p className="fw-bold p-1"> </p>
                                </div>
                                <div
                                  className={`col-2 d-flex align-items-center justify-content-center `}
                                  style={{ width: "7%" }}
                                >
                                  <p className="fw-bold p-1"> </p>
                                </div>
                                <div
                                  className={`col-2 d-flex align-items-center justify-content-center  p-1 flex-column`}
                                  style={{ width: "14%" }}
                                >
                                  <p className="fw-bold"> </p>

                                </div>
                                <div
                                  className={`col-2 d-flex align-items-center justify-content-center `}
                                  style={{ width: "11%" }}
                                >
                                  <p className="fw-bold p-1"> </p>
                                </div>
                                <div
                                  className={`col-2 d-flex align-items-center justify-content-center `}
                                  style={{ width: "8%" }}
                                >
                                  <p className="fw-bold p-1"> </p>
                                </div>
                                <div
                                  className={`col-2 d-flex align-items-center justify-content-center `}
                                  style={{ width: "14%" }}
                                >
                                  <p className="fw-bold p-1"> </p>
                                </div>
                                <div
                                  className={`col-2 d-flex align-items-center justify-content-center`}
                                  style={{ width: "16%" }}
                                >
                                  <p className="fw-bold p-1"> </p>
                                </div>
                              </div>
                            </div>
                            <div
                              className={`${style?.othersJewerryRetailInvoicePrint}   d-flex align-items-center justify-content-center`}
                              style={{ width: "6%" }}
                            >
                              <p className="fw-bold">  </p>
                            </div>
                            <div
                              className={`${style?.othersJewerryRetailInvoicePrint}   d-flex align-items-center justify-content-center`}
                              style={{ width: "8%" }}
                            >
                              <p className="fw-bold">  </p>
                            </div>
                            <div
                              className={`${style?.othersJewerryRetailInvoicePrint}  d-flex align-items-center justify-content-center`}
                            >
                              <p className="fw-bold"> </p>
                            </div>
                            <div
                              className={`${style?.totalJewerryRetailInvoicePrint} d-flex align-items-center justify-content-end`}
                              style={{ paddingRight: "4px" }}
                            >
                              <p className="fw-bold">
                                {NumberWithCommas(
                                  (e.UnitCost)
                                  , 2)}
                              </p>
                            </div>
                          </div>
                        </>
                      );
                    })}
                  {/* total */}
                  <div
                    className={`${style?.minHeight20RetailinvoicePrint3} border-start border-end border-bottom d-flex no_break`}
                  >
                    <div
                      className={`${style?.srNoJewerryRetailInvoicePrint} border-end p-1`} style={{ width: "6.3%" }}
                    >
                      <p className="fw-bold"></p>
                    </div>
                    <div
                      className={`${style?.srNoJewerryRetailInvoicePrint} border-end p-1`}
                      style={{ width: "19.6%" }}

                    >
                      <p className="fw-bold"></p>
                    </div>
                    <div
                      className={`${style?.productJewerryRetailInvoicePrint}   p-1 fw-bold d-flex align-items-center`}
                    >
                      <p className="fw-bold" style={{ fontSize: "17px" }}>
                        TOTAL
                      </p>
                    </div>
                    <div
                      className={`${style?.materialJewerryRetailInvoicePrint}   d-flex`}
                      style={{ width: "60%" }}
                    >
                      <div
                        className={`${style?.w_20JewerryRetailInvoicePrint}  d-flex align-items-center justify-content-end`}
                      >
                        <p className="fw-bold p-1 lh-1"></p>
                      </div>
                      <div
                        className={`${style?.w_20JewerryRetailInvoicePrint} d-flex align-items-center justify-content-end`}
                      ></div>
                      <div
                        className={`${style?.w_20JewerryRetailInvoicePrint}  d-flex align-items-center justify-content-end`}
                      >

                      </div>
                      <div
                        className={`${style?.w_20JewerryRetailInvoicePrint}   p-1 flex-column d-flex align-items-end justify-content-center`}
                      >

                      </div>
                      <div
                        className={`${style?.w_20JewerryRetailInvoicePrint}    d-flex align-items-center justify-content-end`}
                      >

                      </div>
                      <div
                        className={`${style?.w_20JewerryRetailInvoicePrint} d-flex align-items-center justify-content-end`}
                      >
                        <p className="fw-bold p-1 text-end lh-1"></p>
                      </div>
                    </div>
                    <div
                      className={`${style?.metalMakingJewerryRetailInvoicePrint}   flex-column d-flex align-items-center justify-content-end`}
                    >
                      <p className="fw-bold text-end p-1"></p>
                    </div>
                    <div
                      className={`${style?.othersJewerryRetailInvoicePrint}   d-flex align-items-center justify-content-end`}
                    >
                    </div>
                    <div
                      className={`${style?.totalJewerryRetailInvoicePrint} d-flex align-items-center justify-content-end`}
                      style={{ width: "15%" }}
                    >
                      <p className="fw-bold text-end p-1">

                        {NumberWithCommas(
                          result?.mainTotal?.total_unitcost /
                          result?.header?.CurrencyExchRate,
                          2
                        )}
                      </p>
                    </div>
                  </div>
                  {/* tax */}
                  <div className="d-flex border-start border-end border-bottom w-100 no_break">
                    <div
                      className={`d-flex justify-content-between align-items-start  border-end  `}
                      style={{ width: "66%" }}
                    >
                      <div className={`${style?.wordsJewerryRetailInvoicePrint}p-2 d-flex align-items-end  `} style={{ height: "100%" }}>

                        <div className="p-2 pt-4">
                          <p>In Words</p>
                          <p className="fw-bold" style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "break-word" }}>
                            {toWords.convert(
                              +(

                                result?.mainTotal?.total_amount /
                                result?.header?.CurrencyExchRate +
                                result?.allTaxesTotal +
                                result?.header?.FreightCharges /
                                result?.header?.CurrencyExchRate +
                                result?.header?.AddLess /
                                result?.header?.CurrencyExchRate

                              )?.toFixed(2)
                            )}{" "}
                            Only
                          </p>
                        </div>
                      </div>

                      <div
                        className={`${style?.RemarkJewelleryInvoicePrintC} p-2`}
                      >

                      </div>
                      {summ &&
                        <div
                          className="col_r_2 p-1 border-start "
                          style={{ width: "44%", height: "100%" }}
                        >
                          {summary.map((e, i) => {
                            return (
                              <React.Fragment key={i}>
                                {e?.value === 0 ? (
                                  ""
                                ) : (
                                  <div
                                    className="d-flex justify-content-between"
                                    style={{ width: "100%" }}
                                    key={i}
                                  >
                                    <p key={i} className="remark_fs fs_jti_Sale" >
                                      {e?.label}:{" "}
                                    </p>
                                    <p className="remark_fs fs_jti_Sale">
                                      {NumberWithCommas(e?.value, 3)} {e?.gm ? "gm" : "cts"}
                                    </p>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}

                        </div>
                      }
                    </div>
                    <div
                      className={`${style?.discountJewerryRetailInvoicePrint456} d-flex`}
                    >
                      <div
                        className={`${style?.wordsJewellryRetailInvoice4Taxes} border-end`}
                      >
                        <p className="pb-1 px-1 text-end">Discount</p>
                        <p className="pb-1 px-1 text-end">
                          Total Amt before Tax
                        </p>
                        {result?.allTaxes?.map((e, i) => {
                          return (
                            <div
                              className=" text-end"
                              key={i}
                            >
                              <div className="pb-1 px-1 text-end">
                                {" "}
                                {e?.name} {e?.per}{" "}
                              </div>
                            </div>
                          );
                        })}
                        {result?.header?.AddLess !== 0 && (
                          <p className="pb-1 px-1 text-end">
                            {result?.header?.AddLess >= 0 ? "Add" : "Less"}
                          </p>
                        )}

                        {
                          result?.header?.FreightCharges !== 0 &&
                          <p className="pb-1 px-1 text-end">
                            {result?.header?.ModeOfDel}
                          </p>
                        }

                        {
                          retail &&
                          <>
                            <p className="pb-1 px-1 text-end">
                              Total Amt after Tax
                            </p>
                            {/* <p className="pb-1 px-1 text-end">Old Gold</p> */}

                            {oldgolddata.length > 0 && oldgolddata.map((e, i) => {
                              return (
                                <p className="pb-1 px-1 text-end" key={i}>
                                  {"Old " + e?.MetalType} {e?.NetWt + " gm"}
                                </p>
                              );
                            })}


                            <p className="pb-1 px-1 text-end">Recv. in Cash</p>
                            {bank.length > 0 &&
                              bank.map((e, i) => {
                                return (
                                  <p className="pb-1 px-1 text-end" key={i}>
                                    Recv. in Bank ({e?.label})
                                  </p>
                                );
                              })}
                            <p className="pb-1 px-1 text-end">Advance</p>
                            <p className="pb-1 px-1 text-end">Net Bal. Amount</p>
                          </>
                        }
                        <p className="fw-bold p-1 border-top text-end">
                          GRAND TOTAL
                        </p>
                      </div>
                      <div
                        className={`${style?.wordsJewellryRetailInvoice4TaxesNumbers}`}
                      >
                        <p className="text-end pb-1 px-1">
                          {NumberWithCommas(result?.mainTotal?.total_discount_amount /
                            result?.header?.CurrencyExchRate, 2)}{/** Discount */}
                        </p>
                        <p className="text-end pb-1 px-1">
                          {NumberWithCommas(
                            result?.mainTotal?.total_amount /
                            result?.header?.CurrencyExchRate,
                            2
                          )}{/** Before Tax */}
                        </p>
                        {result?.allTaxes?.map((e, i) => {
                          return (
                            <div
                              className=" text-end"
                              key={i}
                            >
                              <div className="pb-1 px-1 text-end">
                                {" "}
                                {NumberWithCommas(e?.amountInNumber, 2)}{" "}
                              </div>
                            </div>
                          );
                        })} {/** CGST SGST */}
                        {result?.header?.AddLess !== 0 && (
                          <p className="pb-1 px-1 text-end">
                            {NumberWithCommas(
                              result?.header?.AddLess /
                              result?.header?.CurrencyExchRate,
                              2
                            )}
                          </p>
                        )} {/** Add/Less */}

                        {
                          result?.header?.FreightCharges !== 0 &&
                          <p className="pb-1 px-1 text-end">
                            {NumberWithCommas(
                              result?.header?.FreightCharges, 2
                            )}
                          </p>
                        }




                        {
                          retail &&

                          <>
                            <p className="pb-1 px-1 text-end">

                              {NumberWithCommas(
                                result?.mainTotal?.total_amount /
                                result?.header?.CurrencyExchRate +
                                result?.allTaxesTotal +
                                result?.header?.FreightCharges /
                                result?.header?.CurrencyExchRate +
                                result?.header?.AddLess /
                                result?.header?.CurrencyExchRate,
                                2
                              )}  {/** After Tax */}
                            </p>
                            {/* <p className="pb-1 px-1 text-end">
                              {NumberWithCommas(result?.header?.OldGoldAmount, 2)}  
                            </p> */}
                            {oldgolddata.length > 0 && oldgolddata.map((e, i) => {
                              return (
                                <p className="pb-1 px-1 text-end" key={i}>
                                  {NumberWithCommas(e?.TotalAmount, 2)}
                                </p>
                              );
                            })}
                            <p className="pb-1 px-1 text-end">
                              {NumberWithCommas(result?.header?.CashReceived, 2)} {/** Amount That Receive In Cash */}
                            </p>
                            {bank.length > 0 &&
                              bank.map((e, i) => {
                                return (
                                  <p className="pb-1 px-1 text-end" key={i}>
                                    {NumberWithCommas(e?.amount, 2)} {/** Amount That Receive In Bank */}
                                  </p>
                                );
                              })}
                            {/* <p className="pb-1 px-1 text-end">{NumberWithCommas(result?.header?.BankReceived, 2)}</p> */}
                            <p className="pb-1 px-1 text-end">
                              {NumberWithCommas(result?.header?.AdvanceAmount, 2
                              )} {/** Advance Given Amount */}
                            </p>



                            <p className="pb-1 px-1 text-end">
                              {
                                NumberWithCommas(difference, 2)
                              } {/** Net Balance Amount */}
                            </p>
                          </>
                        }





                        <p className="fw-bold text-end p-1 border-top">
                          {/* <span
                            dangerouslySetInnerHTML={{
                              __html: result?.header?.Currencysymbol,
                            }}
                          ></span> */}
                          {NumberWithCommas(
                            result?.mainTotal?.total_amount /
                            result?.header?.CurrencyExchRate +
                            result?.allTaxesTotal +
                            result?.header?.FreightCharges /
                            result?.header?.CurrencyExchRate +
                            result?.header?.AddLess /
                            result?.header?.CurrencyExchRate,
                            2
                          )} {/** Grand Total */}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* remark */}
                  <div className="border-start border-end border-bottom p-2 no_break pb-3">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: result?.header?.Declaration,
                      }}
                      className={` ${style?.declarationUlJewelleryRetailInvoicePrntc} ${style?.retailinvoicePrint3} declarationWrapper`}
                    ></div>
                  </div>
                  {/* bank detail */}
                  <div className="border-start border-end border-bottom d-flex no_break">
                    {/* Render the outer div only if at least one bank detail value exists */}
                    {(result?.header?.bankname ||
                      result?.header?.bankaddress ||
                      result?.header?.accountname ||
                      result?.header?.accountnumber ||
                      result?.header?.rtgs_neft_ifsc) && (
                        <div className="col-4 p-2 border-end">
                          <p className="fw-bold">Bank Detail</p>

                          {result?.header?.bankname && (
                            <p>Bank name: {result.header.bankname}</p>
                          )}

                          {result?.header?.bankaddress && (
                            <p style={{ wordBreak: "normal" }}>
                              Branch: {result.header.bankaddress}
                            </p>
                          )}

                          {/* {result?.header?.PinCode && <p>{result.header.PinCode}</p>} */}

                          {result?.header?.accountname && (
                            <p>Account Name: {result.header.accountname}</p>
                          )}

                          {result?.header?.accountnumber && (
                            <p>Account No: {result.header.accountnumber}</p>
                          )}

                          {result?.header?.rtgs_neft_ifsc && (
                            <p>RTGS NEFT IFSC: {result.header.rtgs_neft_ifsc}</p>
                          )}
                        </div>
                      )}
                    <div className={`${result?.header?.bankname ||
                      result?.header?.bankaddress ||
                      result?.header?.accountname ||
                      result?.header?.accountnumber ||
                      result?.header?.rtgs_neft_ifsc? "col-4": "col-6"} p-2 border-end d-flex justify-content-between flex-column min-signature-height`} style={{alignItems:"center"}}>
                      <p>Signature</p>
                      <p className="fw-bold">{result?.header?.CustName}</p>
                    </div>
                    <div className="col-4 p-2 d-flex justify-content-between flex-column" style={{alignItems:"center"}}>
                      <p>Signature</p>
                      <p className="fw-bold">{result?.header?.CompanyFullName}</p>
                    </div>
                  </div>
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
    </>
  );
};

export default InvoicePrintN;
