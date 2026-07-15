// http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=U0syMTA0MjAyNA==&evn=c2FsZQ==&pnm=cGFja2luZyBsaXN0&up=aHR0cDovL3plbi9qby9hcGktbGliL0FwcC9TYWxlQmlsbF9Kc29u&ctv=NzE=&ifid=PackingList3&pid=undefined&etp=ZXhjZWw=
//http://localhost:3001/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=anMzNDc=&evn=U2FsZQ==&pnm=dmFsdWVTaGVldA==&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&etp=ZXhjZWw=&ctv=NzE=
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import {
  apiCall,
  checkMsg,
  formatAmount,
  handleImageError,
  isObjectEmpty,
  mergeMetals,
  mergeFindings,
} from "../../GlobalFunctions";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import Loader from "../../components/Loader";
import "../../assets/css/prints/packingliste.css";
import Button from "../../GlobalFunctions/Button";
import { OrganizeInvoicePrintData } from "../../GlobalFunctions/OrganizeInvoicePrintData";
import { cloneDeep } from "lodash";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";
import ReactHTMLTableToExcel from "react-html-table-to-excel";

const ValueSheetExcel = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  const [priceFlag, setPriceFlag] = useState(true);

  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const [imgFlag, setImgFlag] = useState(true);
  const [isImageWorking, setIsImageWorking] = useState(true);

  const [diaGroupFlag, setDiaGroupFlag] = useState(false);

  const [diamondArr, setDiamondArr] = useState([]);
  const [MetShpWise, setMetShpWise] = useState([]);
  const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
  const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);
  const [diamondDetails, setDiamondDetails] = useState([]);
  const [diamondWise, setDiamondWise] = useState([]);
  const [metaldata, setMetaldata] = useState([]);
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
          //   setMsg(data?.Message);
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
  }, [diaGroupFlag]);

  function loadData(data) {
    // console.log("data", data);

    let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    data.BillPrint_Json[0].address = address;

    const datas = OrganizeDataPrint(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );

    let met_shp_arr = MetalShapeNameWiseArr(datas?.json2);
    let metaldata = datas?.json2?.filter(
      (item) => item.MasterManagement_DiamondStoneTypeid === 4 || item.MasterManagement_DiamondStoneTypeid === 5
    );
    setMetaldata(metaldata);
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

    let finalArr = [];
    datas?.resultArray?.forEach((a) => {
      if (a?.GroupJob === "") {
        finalArr.push(a);
      } else {
        let b = cloneDeep(a);
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

          // if (!finalArr[find_record].DesignImage && b?.DesignImage) {
          //   finalArr[find_record].DesignImage = b?.DesignImage;
          // }

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
            a?.MaterialTypeName === el?.MaterialTypeName &&
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
    setDiamondWise(sortedData);

    setResult(datas);
  }

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

  if (result) {
    setTimeout(() => {
      const button = document.getElementById('test-table-xls-button');
      button.click();
    }, 500);
  }




  // const mergeByPurityAndMaterial = (data) => {
  //   const map = new Map();

  //   data?.forEach((item) => {
  //     const purity = item.MetalPurity;

  //     const materials = [
  //       ...(item.diamonds || []),
  //       ...(item.colorstone || []),
  //       ...(item.misc || [])
  //     ]
  //       .map((x) => x.MaterialTypeName?.toUpperCase())
  //       .filter((x) => x && x.trim() !== "");

  //     const uniqueMaterials = [...new Set(materials)].sort();

  //     const key = `${purity}_${uniqueMaterials.join(",")}`;

  //     if (!map.has(key)) {
  //       map.set(key, {
  //         MetalPurity: purity,
  //         MaterialTypes: uniqueMaterials,
  //         items: [],

  //         //   aggregation fields
  //         totalNetWt: 0,
  //         totalGrossWt: 0,
  //         totalAmount: 0,
  //         totalPcs: 0,
  //       });
  //     }

  //     const group = map.get(key);

  //     // ✅ push raw item (optional)
  //     group.items.push(item);

  //     //   MERGE LOGIC (this is what you were missing)
  //     group.totalNetWt += item.NetWt || 0;
  //     group.totalGrossWt += item.grosswt || 0;
  //     group.totalAmount += item.TotalAmount || 0;

  //     // example: pcs from diamonds
  //     const pcs =
  //       (item.diamonds || []).reduce((sum, d) => sum + (d.Pcs || 0), 0) +
  //       (item.colorstone || []).reduce((sum, d) => sum + (d.Pcs || 0), 0) +
  //       (item.misc || []).reduce((sum, d) => sum + (d.Pcs || 0), 0);

  //     group.totalPcs += pcs;
  //   });

  //   return Array.from(map.values());
  // };


  // const mergeByPurityAndMaterial = (data) => {
  //   const map = new Map();

  //   data?.forEach((item) => {
  //     const purity = item.MetalPurity;

  //     const materials = [
  //       ...(item.diamonds || []),
  //       ...(item.colorstone || []),
  //       ...(item.misc || [])
  //     ]
  //       .map((x) => x.MaterialTypeName)
  //       .filter((x) => x && x.trim() !== "");

  //     const uniqueMaterials = [...new Set(materials)].sort();

  //     const key = `${purity}_${uniqueMaterials.join(",")}`;

  //     if (!map.has(key)) {
  //       map.set(key, {
  //         MetalPurity: purity,
  //         MaterialTypes: uniqueMaterials,
  //         items: [],
  //         total: {
  //           grosswt: 0,
  //           NetWt: 0,
  //           LossWt: 0,
  //           Quantity: 0,
  //           totalWt: 0,
  //           metalAmount: 0,
  //           diaCsPcs: 0,
  //           diaCsWt: 0,
  //           diaCsAmount: 0,
  //           findingWt: 0,
  //           findingAmount: 0,
  //           TotalAmount: 0,
  //           totalRMValue: 0,
  //           totalValueAddition: 0,
  //           perOfVA: 0,
  //         }
  //       });
  //     }

  //     const group = map.get(key);

  //     group.items.push(item);

  //     //   aggregate totals
  //     group.total.grosswt += item?.grosswt || 0;
  //     group.total.NetWt += item?.NetWt || 0;
  //     group.total.LossWt += item?.LossWt || 0;
  //     group.total.Quantity += item?.Quantity || 0;
  //     group.total.totalWt += (item?.NetWt || 0) + (item?.LossWt || 0);

  //     const metalAmount = item?.totals?.metal?.Amount || 0;

  //     group.total.metalAmount += metalAmount;
  //     const diaPcs =
  //     item?.totals?.diamonds?.Pcs ??
  //     item?.diamonds?.reduce((s, d) => s + (d.Pcs || 0), 0) ??
  //     0;

  //   const csPcs =
  //     item?.totals?.colorstone?.Pcs ??
  //     item?.colorstone?.reduce((s, c) => s + (c.Pcs || 0), 0) ??
  //     0;

  //   const diaWt =
  //     item?.totals?.diamonds?.Wt ??
  //     item?.diamonds?.reduce((s, d) => s + (d.Wt || 0), 0) ??
  //     0;

  //   const csWt =
  //     item?.totals?.colorstone?.Wt ??
  //     item?.colorstone?.reduce((s, c) => s + (c.Wt || 0), 0) ??
  //     0;


  //     const diaAmt = item?.totals?.diamonds?.Amount || 0;
  //     const csAmt = item?.totals?.colorstone?.Amount || 0;

  //     const miscAmt = item?.totals?.misc?.Amount || 0;

  //     group.total.diaPcs += diaPcs;
  //     group.total.diaWt += diaWt;
  //     group.total.diaAmount += diaAmt;


  //     group.total.findingWt += item?.totals?.finding?.Wt || 0;
  //     group.total.findingAmount += item?.totals?.finding?.Amount || 0;

  //     group.total.TotalAmount += item?.TotalAmount || 0;

  //     group.total.totalRMValue += (diaAmt + csAmt + miscAmt + metalAmount);

  //     const valueAdd = (item?.OtherCharges || 0) + (item?.MakingAmount || 0) + (item?.TotalDiamondHandling || 0);

  //     group.total.totalValueAddition += valueAdd;
  //   });

  //   //   final percentage calculation after sum
  //   map.forEach((group) => {
  //     group.total.perOfVA =
  //       group.total.metalAmount > 0
  //         ? (group.total.totalValueAddition * 100) / group.total.metalAmount
  //         : 0;
  //   });

  //   return Array.from(map.values());
  // };

  // const mergeByPurityAndMaterial = (data) => {
  //   const map = new Map();

  //   data?.forEach((item) => {
  //     const purity = item.MetalPurity;

  //     const materials = [
  //       ...(item.diamonds || []),
  //       ...(item.colorstone || []),
  //       ...(item.misc || [])
  //     ]
  //       .map((x) => x.MaterialTypeName)
  //       .filter((x) => x && x.trim() !== "");

  //     const uniqueMaterials = [...new Set(materials)].sort();

  //     const key = `${purity}_${uniqueMaterials.join(",")}`;

  //     if (!map.has(key)) {
  //       map.set(key, {
  //         MetalPurity: purity,
  //         MaterialTypes: uniqueMaterials,
  //         items: [],
  //         total: {
  //           grosswt: 0,
  //           NetWt: 0,
  //           LossWt: 0,
  //           Quantity: 0,
  //           totalWt: 0,
  //           metalAmount: 0,
  //           diaCsPcs: 0,
  //           diaCsWt: 0,
  //           diaCsAmount: 0,
  //           findingWt: 0,
  //           findingAmount: 0,
  //           TotalAmount: 0,
  //           totalRMValue: 0,
  //           totalValueAddition: 0,
  //           perOfVA: 0,
  //         }
  //       });
  //     }

  //     const group = map.get(key);
  //     group.items.push(item);

  //     //   base totals
  //     group.total.grosswt += item?.grosswt || 0;
  //     group.total.NetWt += item?.NetWt || 0;
  //     group.total.LossWt += item?.LossWt || 0;
  //     group.total.Quantity += item?.Quantity || 0;
  //     group.total.totalWt += (item?.NetWt || 0) + (item?.LossWt || 0);

  //     const metalAmount = item?.totals?.metal?.Amount || 0;
  //     group.total.metalAmount += metalAmount;

  //     // ✅ SAFE diamond + colorstone calculation
  //     const diaPcs =
  //       item?.totals?.diamonds?.Pcs ??
  //       item?.diamonds?.reduce((s, d) => s + (d.Pcs || 0), 0) ??
  //       0;

  //     const csPcs =
  //       item?.totals?.colorstone?.Pcs ??
  //       item?.colorstone?.reduce((s, c) => s + (c.Pcs || 0), 0) ??
  //       0;

  //     const diaWt =
  //       item?.totals?.diamonds?.Wt ??
  //       item?.diamonds?.reduce((s, d) => s + (d.Wt || 0), 0) ??
  //       0;

  //     const csWt =
  //       item?.totals?.colorstone?.Wt ??
  //       item?.colorstone?.reduce((s, c) => s + (c.Wt || 0), 0) ??
  //       0;

  //     const diaAmt = item?.totals?.diamonds?.Amount || 0;
  //     const csAmt = item?.totals?.colorstone?.Amount || 0;
  //     const miscAmt = item?.totals?.misc?.Amount || 0;


  //     group.total.diaCsPcs += (diaPcs );
  //     group.total.diaCsWt += (diaWt  );
  //     group.total.diaCsAmount += (diaAmt + csAmt);

  //     group.total.findingWt += item?.totals?.finding?.Wt || 0;
  //     group.total.findingAmount += item?.totals?.finding?.Amount || 0;

  //     group.total.TotalAmount += item?.TotalAmount || 0;

  //     group.total.totalRMValue += (diaAmt + csAmt + miscAmt + metalAmount);

  //     const valueAdd =
  //       (item?.OtherCharges || 0) +
  //       (item?.MakingAmount || 0) +
  //       (item?.TotalDiamondHandling || 0);

  //     group.total.totalValueAddition += valueAdd;
  //   });

  //   //   final % calculation
  //   map.forEach((group) => {
  //     group.total.perOfVA =
  //       group.total.metalAmount > 0
  //         ? (group.total.totalValueAddition * 100) / group.total.metalAmount
  //         : 0;
  //   });

  //   return Array.from(map.values());
  // };


  // const MergedData = mergeByPurityAndMaterial(result?.resultArray)










  // const mergeByPurityAndMaterial = (data) => {
  //   const map = new Map();

  //   data?.forEach((item) => {
  //     const purity = item.MetalPurity;
  //     const MetalType = item.MetalType;

  //     // ======================================================
  //     //   SECONDARY METAL QUALITY NAMES
  //     // ======================================================

  //     const secondaryMetalQualities = [
  //       ...new Set(
  //         (item?.metal || [])
  //           ?.filter((m) => Number(m?.IsPrimaryMetal) === 0)
  //           ?.map((m) => m?.QualityName)
  //           ?.filter((x) => x && x.trim() !== "")
  //       ),
  //     ].sort();

  //     // ======================================================
  //     //   STEP 1: merge all non-metal materials
  //     // ======================================================

  //     const allMaterials = [
  //       ...(item.diamonds || []),
  //       ...(item.colorstone || []),
  //       ...(item.misc || []),
  //     ];

  //     // ======================================================
  //     //   STEP 2: group by ShapeName
  //     // ======================================================

  //     const shapeMap = new Map();

  //     allMaterials.forEach((mat) => {
  //       const shape = mat?.ShapeName || "UNKNOWN";

  //       if (!shapeMap.has(shape)) {
  //         shapeMap.set(shape, {
  //           MasterManagement_DiamondStoneTypeName:
  //             mat?.MasterManagement_DiamondStoneTypeName || "UNKNOWN",
  //           ShapeName: shape,
  //           Pcs: 0,
  //           Wt: 0,
  //           Amount: 0,
  //           Rate: 0,
  //         });
  //       }

  //       const group = shapeMap.get(shape);

  //       group.Pcs += mat?.Pcs || 0;
  //       group.Wt += mat?.Wt || 0;
  //       group.Amount += mat?.Amount || 0;

  //       if (mat?.Wt) {
  //         group.Rate += (mat?.Rate || 0) * mat.Wt;
  //       }
  //     });

  //     // ======================================================
  //     //   FINALIZE OTHER MATERIALS
  //     // ======================================================

  //     const otherMaterials = Array.from(shapeMap.values()).map((x) => ({
  //       ...x,
  //       Rate: x.Wt ? x.Rate / x.Wt : 0,
  //     }));

  //     item.otherMaterials = otherMaterials;

  //     // ======================================================
  //     //   MATERIAL TYPES
  //     // ======================================================

  //     const materials = allMaterials
  //       .map((x) => x.MaterialTypeName)
  //       .filter((x) => x && x.trim() !== "");

  //     const uniqueMaterials = [...new Set(materials)].sort();

  //     // ======================================================
  //     //   NEW: SHAPE + MATERIAL TAGS FOR DISPLAY
  //     // ======================================================

  //     const shapeTags = [
  //       ...new Set(
  //         [
  //           ...(item?.diamonds || []).map((x) => x?.ShapeName),
  //           ...(item?.colorstone || []).map((x) => x?.ShapeName),
  //           ...(item?.misc || []).map(
  //             (x) => x?.MaterialTypeName || x?.ShapeName
  //           ),
  //         ]
  //           .filter((x) => x && x.trim() !== "")
  //           .map((x) => x.trim())
  //       ),
  //     ].sort();

  //     // ======================================================
  //     //   KEY
  //     // ======================================================

  //     const key = [
  //       purity,
  //       uniqueMaterials.join(","),
  //       secondaryMetalQualities.join(","),
  //     ].join("_");

  //     if (!map.has(key)) {
  //       map.set(key, {
  //         MetalPurity: purity,
  //         PrimaryMetalPurity: purity,
  //         SecondaryMetalQualities: secondaryMetalQualities,
  //         MaterialTypes: uniqueMaterials,

  //         // ======================================================
  //         //   UPDATED DISPLAY NAME (MAIN FIX)
  //         // ======================================================

  //         DisplayName: (() => {
  //           const metalPart =
  //             secondaryMetalQualities?.length > 0
  //               ? `${purity},${secondaryMetalQualities.join(",")}`
  //               : purity;

  //           const shapePart =
  //             shapeTags?.length > 0 ? shapeTags.join(", ") : "";

  //           return shapePart
  //             ? `${metalPart} ${MetalType} JEWELLERY STUDDED WITH ${shapePart}`
  //             : `${metalPart} ${MetalType} JEWELLERY`;
  //         })(),

  //         items: [],

  //         total: {
  //           grosswt: 0,
  //           NetWt: 0,
  //           LossWt: 0,
  //           Quantity: 0,
  //           totalWt: 0,
  //           metalAmount: 0,
  //           diaCsPcs: 0,
  //           diaCsWt: 0,
  //           diaCsAmount: 0,
  //           findingWt: 0,
  //           findingAmount: 0,
  //           TotalAmount: 0,
  //           totalRMValue: 0,
  //           totalValueAddition: 0,
  //           perOfVA: 0,
  //         },
  //       });
  //     }

  //     const group = map.get(key);

  //     group.items.push(item);

  //     // ======================================================
  //     //   TOTALS
  //     // ======================================================

  //     group.total.grosswt += item?.grosswt || 0;
  //     group.total.NetWt += item?.NetWt || 0;
  //     group.total.LossWt += item?.LossWt || 0;
  //     group.total.Quantity += item?.Quantity || 0;

  //     group.total.totalWt += (item?.NetWt || 0) + (item?.LossWt || 0);

  //     const metalAmount = item?.totals?.metal?.Amount || 0;

  //     group.total.metalAmount += metalAmount;

  //     const diaPcs =
  //       item?.totals?.diamonds?.Pcs ??
  //       item?.diamonds?.reduce((s, d) => s + (d.Pcs || 0), 0) ??
  //       0;

  //     const csPcs =
  //       item?.totals?.colorstone?.Pcs ??
  //       item?.colorstone?.reduce((s, c) => s + (c.Pcs || 0), 0) ??
  //       0;

  //     const miscPcs =
  //       item?.totals?.misc?.Pcs ??
  //       item?.misc?.reduce((s, c) => s + (c.Pcs || 0), 0) ??
  //       0;

  //     const diaWt =
  //       item?.totals?.diamonds?.Wt ??
  //       item?.diamonds?.reduce((s, d) => s + (d.Wt || 0), 0) ??
  //       0;

  //     const csWt =
  //       item?.totals?.colorstone?.Wt ??
  //       item?.colorstone?.reduce((s, c) => s + (c.Wt || 0), 0) ??
  //       0;

  //     const miscWt =
  //       item?.totals?.misc?.Wt ??
  //       item?.misc?.reduce((s, c) => s + (c.Wt || 0), 0) ??
  //       0;

  //     const diaAmt = item?.totals?.diamonds?.Amount || 0;
  //     const csAmt = item?.totals?.colorstone?.Amount || 0;
  //     const miscAmt = item?.totals?.misc?.Amount || 0;

  //     group.total.diaCsPcs += diaPcs + csPcs + miscPcs;
  //     group.total.diaCsWt += diaWt + csWt + miscWt;
  //     group.total.diaCsAmount += diaAmt + csAmt + miscAmt;

  //     group.total.findingWt += item?.totals?.finding?.Wt || 0;
  //     group.total.findingAmount += item?.totals?.finding?.Amount || 0;

  //     group.total.TotalAmount += item?.TotalAmount || 0;

  //     group.total.totalRMValue += diaAmt + csAmt + miscAmt + metalAmount;

  //     const valueAdd =
  //       (item?.OtherCharges || 0) +
  //       (item?.MakingAmount || 0) +
  //       (item?.TotalDiamondHandling || 0);

  //     group.total.totalValueAddition += valueAdd;
  //   });

  //   map.forEach((group) => {
  //     group.total.perOfVA =
  //       group.total.metalAmount > 0
  //         ? (group.total.totalValueAddition * 100) /
  //           group.total.metalAmount
  //         : 0;
  //   });

  //   return Array.from(map.values());
  // };

  // const MergedData = mergeByPurityAndMaterial(result?.resultArray);


  const mergeByPurityAndMaterial = (data) => {
    const map = new Map();

    data?.forEach((item) => {

      
      console.log("TCL: mergeByPurityAndMaterial -> item",item )
      const purity = item.MetalPurity;
      const MetalType = item.MetalType;


      const secondaryMetalQualities = [
        ...new Set(
          (item?.metal || [])
            ?.filter((m) => Number(m?.IsPrimaryMetal) === 0)
            ?.map((m) => m?.QualityName)
            ?.filter((x) => x && x.trim() !== "")
        ),
      ].sort();

      const secondaryMetalShapes = [
        ...new Set(
          (item?.metal || [])
            ?.filter((m) => Number(m?.IsPrimaryMetal) === 0)
            ?.map((m) => m?.ShapeName)
            ?.filter((x) => x && x.trim() !== "")
        ),
      ].sort();


      const allMaterials = [
        ...(item.diamonds || []),
        ...(item.colorstone || []),
        ...(item.misc || []),
      ];


      const shapeMap = new Map();

      allMaterials.forEach((mat) => {
        const shape = mat?.ShapeName || "UNKNOWN";


        if (!shapeMap.has(shape)) {
          shapeMap.set(shape, {
            MasterManagement_DiamondStoneTypeName:
              mat?.MasterManagement_DiamondStoneTypeName || "UNKNOWN",
            ShapeName: shape,
            MaterialTypeName: mat?.MaterialTypeName,
            Pcs: 0,
            Wt: 0,
            Amount: 0,
            Rate: 0,
          });
        }

        const group = shapeMap.get(shape);

        group.Pcs += mat?.Pcs || 0;
        group.Wt += mat?.Wt || 0;
        group.Amount += mat?.Amount || 0;

        if (mat?.Wt) {
          group.Rate += (mat?.Rate || 0) * mat.Wt;
        }
      });


      const otherMaterials = Array.from(shapeMap.values()).map((x) => ({
        ...x,
        Rate: x.Wt ? x.Rate / x.Wt : 0,
      }));

      item.otherMaterials = otherMaterials;

      const materials = allMaterials
        .map((x) => x.MaterialTypeName)
        .filter((x) => x && x.trim() !== "");

      const uniqueMaterials = [...new Set(materials)].sort();




      const key = [
        purity,
        uniqueMaterials.join(","),
        secondaryMetalQualities.join(","),
      ].join("_");

      if (!map.has(key)) {
        map.set(key, {
          MetalPurity: purity,
          PrimaryMetalPurity: purity,
          SecondaryMetalQualities: secondaryMetalQualities,
          SecondaryMetalShapes: secondaryMetalShapes, // optional for debug/future use
          MaterialTypes: uniqueMaterials,


          DisplayName: `${secondaryMetalQualities?.length > 0
              ? `${purity} ${MetalType} , ${secondaryMetalQualities.join(" ")}${secondaryMetalShapes?.length
                ? ` ${secondaryMetalShapes.join(", ")}`
                : ""
              }`
              : `${purity} ${MetalType}`
            } ${uniqueMaterials.length > 0 ? " JEWELLERY STUDDED WITH " + uniqueMaterials.join(", ") : "PLAIN JEWELLERY"}`,

          items: [],

          total: {
            grosswt: 0,
            NetWt: 0,
            LossWt: 0,
            Quantity: 0,
            totalWt: 0,
            metalAmount: 0,
            diaCsPcs: 0,
            diaCsWt: 0,
            diaCsAmount: 0,
            findingWt: 0,
            findingAmount: 0,
            TotalAmount: 0,
            totalRMValue: 0,
            totalValueAddition: 0,
            perOfVA: 0,
          },
        });
      }

      const group = map.get(key);
      group.items.push(item);

      // ======================================================
      //   TOTALS (UNCHANGED)
      // ======================================================
      group.total.grosswt += item?.grosswt || 0;
      group.total.NetWt += item?.NetWt || 0;
      group.total.LossWt += item?.LossWt || 0;
      group.total.Quantity += item?.Quantity || 0;

      group.total.totalWt += (item?.NetWt || 0) + (item?.LossWt || 0);

      const metalAmount = item?.totals?.metal?.Amount || 0;
      const findingAmount = item?.totals?.finding?.Amount || 0;
      group.total.metalAmount += metalAmount + findingAmount;
      

      const diaPcs =
        item?.totals?.diamonds?.Pcs ??
        item?.diamonds?.reduce((s, d) => s + (d.Pcs || 0), 0) ??
        0;

      const csPcs =
        item?.totals?.colorstone?.Pcs ??
        item?.colorstone?.reduce((s, c) => s + (c.Pcs || 0), 0) ??
        0;

      const miscPcs =
        item?.totals?.misc?.Pcs ??
        item?.misc?.reduce((s, c) => s + (c.Pcs || 0), 0) ??
        0;

      const diaWt =
        item?.totals?.diamonds?.Wt ??
        item?.diamonds?.reduce((s, d) => s + (d.Wt || 0), 0) ??
        0;

      const csWt =
        item?.totals?.colorstone?.Wt ??
        item?.colorstone?.reduce((s, c) => s + (c.Wt || 0), 0) ??
        0;

      const miscWt =
        item?.totals?.misc?.Wt ??
        item?.misc?.reduce((s, c) => s + (c.Wt || 0), 0) ??
        0;

      const diaAmt = item?.totals?.diamonds?.Amount || 0;
      const csAmt = item?.totals?.colorstone?.Amount || 0;
      const miscAmt = item?.totals?.misc?.Amount || 0;

      group.total.diaCsPcs += diaPcs + csPcs + miscPcs;
      group.total.diaCsWt += diaWt + csWt + miscWt;
      group.total.diaCsAmount += diaAmt + csAmt + miscAmt;

      group.total.findingWt += item?.totals?.finding?.Wt || 0;
      group.total.findingAmount += item?.totals?.finding?.Amount || 0;

      group.total.TotalAmount += item?.TotalAmount || 0;

      group.total.totalRMValue += diaAmt + csAmt + miscAmt + metalAmount + findingAmount;

      const valueAdd =
        (item?.OtherCharges || 0) +
        (item?.MakingAmount || 0) +
        (item?.TotalDiamondHandling || 0);

      group.total.totalValueAddition += valueAdd;
    });

    // ======================================================
    //   % OF VA
    // ======================================================
    map.forEach((group) => {
      group.total.perOfVA =
        group.total.metalAmount > 0
          ? (group.total.totalValueAddition * 100) /
          group.total.metalAmount
          : 0;
    });

    return Array.from(map.values());
  };

  const MergedData = mergeByPurityAndMaterial(result?.resultArray);
  console.log("TCL: ValueSheetExcel -> MergedData", MergedData)














  const calculateGrandTotal = (groups, exchRate = 1) => {
    return groups.reduce((acc, group) => {
      const t = group.total;

      acc.Quantity += t.Quantity;
      acc.grosswt += t.grosswt;
      acc.NetWt += t.NetWt;
      acc.LossWt += t.LossWt;
      acc.totalWt += t.totalWt;

      acc.metalAmount += t.metalAmount / exchRate;
      acc.findingAmount += t.findingAmount / exchRate;

      acc.diaPcs += t.diaCsPcs;
      acc.diaWt += t.diaCsWt;
      acc.diaAmount += t.diaCsAmount / exchRate;

      acc.totalAmount += t.totalRMValue / exchRate;

      return acc;
    }, {
      Quantity: 0,
      grosswt: 0,
      NetWt: 0,
      LossWt: 0,
      totalWt: 0,
      metalAmount: 0,
      diaPcs: 0,
      diaWt: 0,
      diaAmount: 0,
      totalAmount: 0,
      findingAmount: 0,
    });
  };



  const grandTotal = calculateGrandTotal(
    MergedData,
    result?.header?.CurrencyExchRate
  );


  const th = {
    border: "1px solid #000",
    padding: "4px",
    textAlign: "center",
    backgroundColor: "#e6e6e6",
    fontWeight: "bold",
  };

  const td = {
    border: "1px solid #000",
    padding: "4px",
    textAlign: "right",
  };

  const section = {
    border: "1px solid #000",
    padding: "4px",
    textAlign: "center",
    fontWeight: "bold",
    backgroundColor: "#f5f5f5",
  };

  const tdStyleRight = {
    border: '1px solid #000',
    padding: '2px',
    textAlign: 'right'
  };

  const tdStyleLeft = {
    border: '1px solid #000',
    padding: '2px',
    textAlign: 'left'
  };

  const tdStyleCenter = {
    border: '1px solid #000',
    padding: '2px',
    textAlign: 'center'
  };

  const mergeByMetalPurity = (data = []) => {
    const grouped = {};
  
    data.forEach((item) => {
      const purity = item?.QualityName || "UNKNOWN";

      let loss=0;
       if(item?.IsPrimaryMetal ==1){

        const job = result?.resultArray.find(
          j => j?.MetalPurity === item?.QualityName
        );

         loss = job?.MetalLossIn ===1? job?.LossWt   : job?.LossPer;
         
       }
  
      if (!grouped[purity]) {
        grouped[purity] = {
          Purity: purity,
          NetWt: 0,
          PureNetWt: 0,
          LossWt: 0,
          MetalRate: 0,
          Amount: 0,
        };
      }
  
      const wt = Number(item?.Weight) || 0;
      const rate = Number(item?.Rate) || 0;
      const amount = Number(item?.Amount) || 0;
      const purityValue = Number(item?.SizeName) || 0;
      const wastage = Number(item?.metalWastage1) || 0;
      
      grouped[purity].LossWt += loss;
      grouped[purity].NetWt += wt;
      grouped[purity].MetalRate += rate;
      grouped[purity].Amount += amount;
  
      
      console.log("TCL: mergeByMetalPurity -> purityValue",purityValue )
      console.log("TCL: mergeByMetalPurity -> wastage",wastage )
      console.log("TCL: mergeByMetalPurity -> wastage",wastage )
      console.log("TCL: mergeByMetalPurity -> loss",loss )
      console.log("TCL: mergeByMetalPurity -> wt",wt )
      
      
      grouped[purity].PureNetWt +=
      ((purityValue ) * (wt+loss)) / 100;
      console.log("TCL: mergeByMetalPurity -> PureNetWt",  ((purityValue ) * (wt+loss)) / 100)
    });
  
    return Object.values(grouped);
  };
  
  const puritydata = mergeByMetalPurity(metaldata);

 
 
 console.log("TCL: ValueSheetExcel -> puritydata", puritydata)
  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <div>
          <ReactHTMLTableToExcel
            id="test-table-xls-button"
            className="download-table-xls-button btn btn-success text-black bg-success px-2 py-1 fs-5 d-none"
            table="table-to-xls"
            filename={`SEZ Export`}
            sheet={`SEZ_Export_${result?.header?.InvoiceNo}`}
            buttonText="Download as XLS"
          />
          {/* <table id="table-to-xls" className="d-none"> */}
          {/* <table id="table-to-xls" >
            <tr style={{textAlign:"center"}} ><td>VALUE ADDITION SHEET (REMAKING/REMELTING)</td></tr>
            <tr>
              <td>
                <b>Item Name</b>
              </td>
              <td>
                <b>SKU</b>
              </td>
              <td>
                <b>Sales Description
                </b>
              </td>
              <td>
                <b>Brand</b>
              </td>
              <td>
                <b>CF.Category
                </b>
              </td>
              <td>
                <b>CF.Price Key
                </b>
              </td>
              <td>
                <b>CF.Collection
                </b>
              </td>
              <td>
                <b>Selling Rate
                </b>
              </td>
              <td>
                <b>CF.Tag Price
                </b>
              </td>
            </tr>

        




          </table> */}



          {/* Main Section */}
          <table id="table-to-xls" style={{ width: "100%", borderCollapse: "collapse" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <th colSpan={24}>
                  <div style={{ textAlign: "center" }}>VALUE ADDITION SHEET (REMAKING/REMELTING)</div>
                </th>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} style={{ border: "1px solid #000", textAlign: "center" }}>
                    Invoice No. & Date :
                  </td>
                  <td colSpan={8} style={{ border: "1px solid #000", textAlign: "center" }}>
                    {result?.header?.InvoiceNo}
                  </td>
                  <td colSpan={8} style={{ border: "1px solid #000", textAlign: "center" }}>
                    {result?.header?.EntryDate}
                  </td>
                </tr>
              </tbody>
            </table>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>

                  {/* Exporter Section */}
                  <td
                    colSpan={12}
                    style={{

                      border: "1px solid #000",
                      verticalAlign: "top",
                      padding: 8,
                    }}
                  >
                    <div><b>EXPORTER</b></div>
                    <div>{result?.header?.companyname}</div>
                    <div>{result?.header?.CompanyAddress}</div>
                    <div>{result?.header?.CompanyAddress2}</div>


                    <div>Dist : {result?.header?.CompanyCity} ({result?.header?.CompanyState})</div>
                    <div>GSTIN : {result?.header?.Company_VAT_GST_No}</div>

                    <div style={{ marginTop: 10 }}>
                      <b>Email: {result?.header?.CompanyEmail}</b>
                    </div>
                  </td>

                  {/* Consignee Section */}
                  <td
                    colSpan={11}
                    style={{

                      border: "1px solid #000",
                      verticalAlign: "top",
                      padding: 8,
                    }}
                  >
                    <div><b>Consinee :</b></div>

                    <table style={{ width: "100%", marginTop: 10 }}>
                      <tbody>
                        {[...Array(6)].map((_, i) => (
                          <tr key={i}>
                            <td style={{ textAlign: "center" }}>0</td>
                            <td style={{ textAlign: "center" }}>0</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>

                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr>
                  <th rowSpan="3" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0', width: "19%" }}>Sr#</th>
                  <th rowSpan="3" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0', width: "9%" }}>Desc</th>
                  <th rowSpan="3" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0', }}>Qty</th>
                  <th rowSpan="3" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0', }}>Jobno</th>
                  <th rowSpan="3" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0', }}>Gross wt</th>

                  <th colSpan="7" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Details of Gold</th>
                  <th colSpan="6" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Details of Studding</th>
                  <th colSpan="3" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Details of Value Additions</th>
                  <th colSpan="2" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0', textOrientation: 'mixed' }}>Total</th>
                </tr>
                <tr>
                  <th colSpan="2" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Gold /Silver</th>
                  <th colSpan="1" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Wt. Loss</th>
                  <th rowSpan="1" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>% of</th>
                  <th colSpan="1" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Tot. Wt.</th>
                  <th colSpan="1" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Rt. Of </th>
                  <th colSpan="1" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Tot Cost of.</th>
                  <th colSpan="1" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Material</th>
                  <th colSpan="1" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Type</th>
                  <th colSpan="1" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Diam</th>
                  <th colSpan="1" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Wt. In</th>
                  <th colSpan="1" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Rate Per</th>
                  <th rowSpan="1" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Total Value</th>
                  <th rowSpan="1" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Unit Price</th>
                  <th colspan="2" rowSpan="1" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Value</th>

                  <th rowSpan="1" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Unit Price</th>
                  <th rowSpan="1" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>FOB Value</th>
                </tr>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Purity</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>in Gms</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>in Gms</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Wt</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>in Gms</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Gold /Silver/gm <br /> IN US $</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Gold/Silver <br /> in US $ </th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}></th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}></th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Pcs</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Cts</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Cts in US $</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>In USD</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>US $</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Addition %</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Addition in US $</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>US $</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>in US $</th>
                </tr>
              </thead>
              <tbody>

                {MergedData.map((item, index) => (

                  <>
                    {/* part start */}
                    {console.log("TCL: ValueSheetExcel -> item", item)}
                    <tr>
                      <td colSpan="23" style={{ border: '1px solid #000', padding: '2px', }}> {


                        item?.DisplayName
                      }</td>

                    </tr>



                    {item?.items.map((e, i) => {

                      const metals = (e?.metal?.length > 0 || e?.finding?.length > 0)
                        ? [...(mergeMetals( e?.metal) || []), ...( mergeFindings(e?.finding) || [])].sort((a, b) => {
                          return (b.IsPrimaryMetal ?? 0) - (a.IsPrimaryMetal ?? 0);
                        })
                        : [{}];

                      const materials =
                        e?.otherMaterials?.length > 0
                          ? e.otherMaterials
                          : [{}];

                      //   MAX ROW COUNT
                      const totalRows = Math.max(
                        metals.length,
                        materials.length
                      );

                      return Array.from(
                        { length: totalRows },
                        (_, idx) => {

                          const mt = metals[idx] || {};
                          const m = materials[idx] || {};

 


                          return (
                            <tr key={`${i}-${idx}`}>

                              {/*   COMMON MERGED COLUMNS */}
                              {idx === 0 && (
                                <>
                                  <td
                                    rowSpan={totalRows}
                                    style={tdStyleRight}
                                  >
                                    {i + 1}
                                  </td>

                                  <td
                                    rowSpan={totalRows}
                                    style={tdStyleLeft}
                                  >
                                    {e?.designno}
                                  </td>

                                  <td
                                    rowSpan={totalRows}
                                    style={tdStyleRight}
                                  >
                                    {e?.Quantity}
                                  </td>

                                  <td
                                    rowSpan={totalRows}
                                    style={tdStyleRight}
                                  >
                                    {e?.GroupJob ? `'${e?.GroupJob}` : `'${e.SrJobno}`}
                                  </td>

                                  <td
                                    rowSpan={totalRows}
                                    style={tdStyleRight}
                                  >
                                    {formatAmount(e?.grosswt, 3)}
                                  </td>


                                </>
                              )}

                              {/*   METAL COLUMNS */}


                              <td style={tdStyleRight}  >
                              {mt?.FindingTypename} {mt?.QualityName
                                  ? mt?.QualityName
                                  : ""}
                              </td>
                              <td style={tdStyleRight}>
                                {mt?.IsPrimaryMetal == 1 ? formatAmount(mt?.Wt - e?.totals?.finding?.Wt, 3) : mt?.Wt
                                  ? formatAmount(mt?.Wt, 3)
                                  : ""}
                              </td>

                              <td style={tdStyleRight}>
                                {
                                  mt?.QualityName ? mt?.IsPrimaryMetal == 1 ? formatAmount(e?.MetalLossIn ==1? e?.LossWt:"", 3) : "" : ""
                                }


                              </td>

                              <td style={tdStyleRight}>
                                {mt?.QualityName ? mt?.IsPrimaryMetal == 1 ? e?.MetalLossIn ==1? "": e?.LossPer : "" : ""}
                              </td>

                              <td style={tdStyleRight}>

                              {mt?.IsPrimaryMetal == 1 ? formatAmount((mt?.Wt - e?.totals?.finding?.Wt)+e?.LossWt, 3) 
                                  : 
                                  
                                  (Number(e?.LossWt || 0) +
                                  Number(mt?.Wt || 0)) !== 0
                                  ? formatAmount(
                                    Number(e?.LossWt || 0) +
                                    Number(mt?.Wt || 0),
                                    3
                                  )
                                  : ""}
                               
                              </td>

                              <td style={tdStyleRight}>
                                {mt?.Rate
                                  ? formatAmount(mt?.Rate, 2)
                                  : ""}
                              </td>

                              <td style={tdStyleRight}>
                                {mt?.Amount
                                  ? formatAmount(
                                    mt?.Amount /
                                    (result?.header
                                      ?.CurrencyExchRate || 1),
                                    2
                                  )
                                  : ""}
                              </td>

                              {/*   MATERIAL COLUMNS */}
                              <td style={tdStyleRight}>
                                {m?.MasterManagement_DiamondStoneTypeName || ""}
                              </td>

                              <td style={tdStyleRight}>
                                {m?.MaterialTypeName || ""}{m?.MaterialTypeName ? "/" : ""}{m?.ShapeName || ""}
                              </td>

                              <td style={tdStyleRight}>
                                {m?.Pcs || ""}
                              </td>

                              <td style={tdStyleRight}>
                                {m?.Wt
                                  ? formatAmount(m?.Wt, 3)
                                  : ""}
                              </td>

                              <td style={tdStyleRight}>
                                {m?.Rate
                                  ? formatAmount(
                                    m?.Rate /
                                    (result?.header
                                      ?.CurrencyExchRate || 1),
                                    2
                                  )
                                  : ""}
                              </td>

                              <td style={tdStyleRight}>
                                {m?.Amount
                                  ? formatAmount(
                                    m?.Amount /
                                    (result?.header
                                      ?.CurrencyExchRate || 1),
                                    2
                                  )
                                  : ""}
                              </td>

                              {/*   FINAL MERGED COLUMNS */}
                              {idx === 0 && (
                                <>
                                  <td
                                    rowSpan={totalRows}
                                    style={tdStyleRight}
                                  >
                                    {formatAmount(
                                      (
                                        (e?.totals?.metal?.Amount || 0) +
                                        (e?.totals?.diamonds?.Amount || 0) +
                                        (e?.totals?.colorstone?.Amount || 0) +
                                        (e?.totals?.misc?.Amount || 0)+
                                        (e?.totals?.finding?.Amount || 0)
                                      ) /
                                      (result?.header
                                        ?.CurrencyExchRate || 1),
                                      2
                                    )}
                                  </td>

                                  <td
                                    rowSpan={totalRows}
                                    style={tdStyleRight}
                                  >
                                    8%
                                  </td>

                                  <td
                                    rowSpan={totalRows}
                                    style={tdStyleRight}
                                  >
                                    {formatAmount(
                                      //  ((e?.UnitCost || 0) / (result?.header?.CurrencyExchRate || 1)) * 0.08,
                                      (
                                        (e?.totals?.metal?.Amount || 0) +
                                        (e?.totals?.diamonds?.Amount || 0) +
                                        (e?.totals?.colorstone?.Amount || 0) +
                                        (e?.totals?.misc?.Amount || 0)+
                                        (e?.totals?.finding?.Amount || 0)
                                      ) * 0.08,
                                      2
                                    )}
                                  </td>

                                  <td
                                    rowSpan={totalRows}
                                    style={tdStyleRight}
                                  >
                                    {formatAmount(
                                      // (e?.UnitCost || 0) /
                                      (
                                        (e?.totals?.metal?.Amount || 0) +
                                        (e?.totals?.diamonds?.Amount || 0) +
                                        (e?.totals?.colorstone?.Amount || 0) +
                                        (e?.totals?.misc?.Amount || 0)+
                                        (e?.totals?.finding?.Amount || 0)
                                      ) /
                                      (result?.header
                                        ?.CurrencyExchRate || 1) +
                                      (
                                        // ((e?.UnitCost || 0) /
                                        ((
                                          (e?.totals?.metal?.Amount || 0) +
                                          (e?.totals?.diamonds?.Amount || 0) +
                                          (e?.totals?.colorstone?.Amount || 0) +
                                          (e?.totals?.misc?.Amount || 0)+
                                          (e?.totals?.finding?.Amount || 0)
                                        ) /
                                          (result?.header
                                            ?.CurrencyExchRate || 1) *
                                          8) / 100
                                      ),
                                      2
                                    )}
                                  </td>

                                  <td
                                    rowSpan={totalRows}
                                    style={tdStyleRight}
                                  >
                                    {formatAmount(
                                      (e?.UnitCost || 0) /
                                      (result?.header
                                        ?.CurrencyExchRate || 1) +
                                      (
                                        ((e?.UnitCost || 0) /
                                          (result?.header
                                            ?.CurrencyExchRate || 1) *
                                          8) / 100
                                      ),
                                      2
                                    )}
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        }
                      );
                    })}

                    {/* Total Row */}
                    <tr>
                      <td colSpan="2" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>Total</td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>{item?.items?.length}</td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}> </td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>{formatAmount(item?.total?.grosswt, 3)}</td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}></td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>{formatAmount(item?.total?.NetWt, 3)}</td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>{formatAmount(item?.total?.LossWt, 3)}</td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}></td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>
                        {item?.total?.LossWt + item?.total?.NetWt !== 0 && formatAmount(item?.total?.LossWt + item?.total?.NetWt, 3)}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}></td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>
                        {formatAmount((item?.total?.metalAmount ) , 2)}

                      </td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}></td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}> </td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>{item?.total?.diaCsPcs}</td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}> {formatAmount(item?.total?.diaCsWt, 3)}</td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}> </td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>{formatAmount(item?.total?.diaCsAmount / result?.header?.CurrencyExchRate, 2)}</td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>{formatAmount(item?.total?.totalRMValue / result?.header?.CurrencyExchRate, 2)}</td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}></td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>{formatAmount((item?.total?.totalRMValue / result?.header?.CurrencyExchRate * 8) / 100, 2)}</td>

                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>
                        {formatAmount(item?.total?.totalRMValue / result?.header?.CurrencyExchRate + ((item?.total?.totalRMValue / result?.header?.CurrencyExchRate * 8) / 100), 2)}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>
                        {formatAmount(item?.total?.totalRMValue / result?.header?.CurrencyExchRate + ((item?.total?.totalRMValue / result?.header?.CurrencyExchRate * 8) / 100), 2)}
                      </td>
                    </tr>

                    <tr >  <td colSpan="21" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}></td></tr>
                    {/* partend */}


                  </>

                ))}

                {/* Total Row */}

                <tr style={{ fontWeight: "bold", background: "#f5f5f5" }}>
                  <td colSpan={2} style={{ border: '1px solid #000', textAlign: 'center' }}>
                    TOTAL
                  </td>

                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>
                    {grandTotal.Quantity}
                  </td>

                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>

                  </td>

                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>
                    {formatAmount(grandTotal.grosswt, 3)}
                  </td>

                  <td style={{ border: '1px solid #000' }}></td>

                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>
                    {formatAmount(grandTotal.NetWt, 3)}
                  </td>

                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>
                    {formatAmount(grandTotal.LossWt, 3)}
                  </td>

                  <td style={{ border: '1px solid #000' }}></td>

                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>
                    {formatAmount(grandTotal.totalWt, 3)}
                  </td>

                  <td style={{ border: '1px solid #000' }}></td>

                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>
                    {formatAmount((grandTotal.metalAmount ) , 2)}
                  </td>

                  <td style={{ border: '1px solid #000' }}></td>
                  <td style={{ border: '1px solid #000' }}></td>

                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>
                    {grandTotal.diaPcs}
                  </td>

                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>
                    {formatAmount(grandTotal.diaWt, 3)}
                  </td>

                  <td style={{ border: '1px solid #000' }}></td>

                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>
                    {formatAmount(grandTotal.diaAmount, 2)}
                  </td>

                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>{formatAmount(grandTotal.totalAmount, 2)}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'right' }}> </td>

                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>{formatAmount(grandTotal.totalAmount * 8 / 100, 2)}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>{formatAmount((grandTotal.totalAmount * 8 / 100) + grandTotal.totalAmount, 2)}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>{formatAmount((grandTotal.totalAmount * 8 / 100) + grandTotal.totalAmount, 2)}</td>



                </tr>
              </tbody>
            </table>



            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", marginTop: "10px" }}>
              <tr>
                <td style={{ width: "20%" }}>Note: {result?.header?.Remark || ""}</td>
              </tr>
            </table>


            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", marginTop: "10px" }}>



              <thead>
                <tr>
                  Gold in 0.999
                </tr>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }} >Purity</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }} >Net Wt.</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }} >Loss</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }} >Pure Wt.</th>
                  {/* <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }} >Loss(0.999)</th> */}
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }} >Rate of Gold /Silver Gms in US $</th>
                  <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#f0f0f0' }} >Value of Gold/silver in US $</th>
                </tr>
              </thead>
              <tbody>
                {puritydata?.map((item, ind) => (
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }} >{item?.Purity || ""}</td>
                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }} >{item?.NetWt.toFixed(3) || ""}</td>
                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }} >{item?.LossWt.toFixed(3) || "0.00"}</td>
                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }} >{item?.PureNetWt.toFixed(3) || "0.00"}</td>
                    {/* <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }} >45.00</td> */}
                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }} >{item?.MetalRate.toFixed(2) || ""}</td>
                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }} >{item?.Amount.toFixed(2) || ""}</td>
                  </tr>
                ))}


              </tbody>
            </table>

          </table>















        </div>
      ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
          {" "}
          {msg}{" "}
        </p>
      )}
    </>
  );
};

export default ValueSheetExcel;
