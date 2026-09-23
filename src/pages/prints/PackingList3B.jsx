import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import {
  apiCall,
  checkMsg,
  fixedValues,
  formatAmount,
  handleImageError,
  isObjectEmpty,
  NumberWithCommas,
  mergeMetals,
  mergeFindings
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import "../../assets/css/prints/packinglist3B.css";
import Button from "./../../GlobalFunctions/Button";
import { OrganizeInvoicePrintData } from "../../GlobalFunctions/OrganizeInvoicePrintData";
import { cloneDeep } from "lodash";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";

const PackingList3 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const [imgFlag, setImgFlag] = useState(true);
  const [referenceFlag, setReferenceFlag] = useState(true);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const [diamondArr, setDiamondArr] = useState([]);
  const [MetShpWise, setMetShpWise] = useState([]);
  const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
  const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);
  const [duty, setDuty] = useState(false);
  const [companyDetail, setCompanyDetail] = useState(false);

  const [processedMetalsWt, setProcessedMetalsWt] = useState([]);
  const [processedMetalsAmount, setProcessedMetalsAmount] = useState([]);
  const [address, setAddress] = useState([]);
  const [diamondDetails, setDiamondDetails] = useState([]);
  const [json2data, setJson2data] = useState([]);

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
  }, []);

  const mergeItemsAndCalculate = (items) => {
    const mergedItems = [];

    items.forEach((item) => {
      const existingItemIndex = mergedItems.findIndex(
        (el) =>
          el.ShapeName === item.ShapeName &&
          el.QualityName === item.QualityName &&
          el.Colorname === item.Colorname &&
          el.SizeName === item.SizeName &&
          el.Rate === item.Rate
      );

      if (existingItemIndex !== -1) {
        const existingItem = mergedItems[existingItemIndex];

        existingItem.Pcs += item.Pcs || 0;
        existingItem.Wt += item.Wt || 0;
        existingItem.Amount += item.Amount || 0;

        existingItem.Rate = (existingItem.Amount / existingItem.Wt).toFixed(2);  // Average Rate = Total Amount / Total Weight

        existingItem.Amount = (existingItem.Wt * existingItem.Rate).toFixed(2);
      } else {
        mergedItems.push({ ...item });
      }
    });

    return mergedItems;
  };

  const loadData = (data) => {
    let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    data.BillPrint_Json[0].address = address;
    setAddress(address);

    // console.log("data", data);
    const datas = OrganizeInvoicePrintData(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );
    setJson2data(data?.BillPrint_Json2)
    // console.log("datas", datas);   

    if (!datas.labour) {
      datas.labour = [];
    }

    if (datas?.resultArray && datas.resultArray.length > 0) {
      datas.resultArray.forEach((item) => {
        // console.log("datas?.resultArray", datas?.resultArray);

        if (item?.GroupJob !== '' && item?.metal?.length > 0) {
          const makingChargeUnit = item?.MaKingCharge_Unit;
        
          if (makingChargeUnit !== 0) {
            if (!datas.labour) {
              datas.labour = [];
            }
        
            item.metal.forEach((el) => {
              const metalWt = el?.Wt || 0;
              const makingCharge = metalWt * makingChargeUnit;
        
              // check if a labour entry with the same MakingUnit already exists
              const existing = datas.labour.find(
                (l) => l.MakingUnit === makingChargeUnit
              );
        
              if (existing) {
                // merge into existing entry
                existing.MetalWt += metalWt;
                existing.MakingCharge += makingCharge;
                existing.NetWt = (existing.NetWt || 0) + (item?.NetWt || 0);
        
                // keep track of all job numbers merged into this entry
                existing.jobNo = Array.isArray(existing.jobNo)
                  ? [...existing.jobNo, item?.SrJobno || item?.GroupJob]
                  : [existing.jobNo, item?.SrJobno || item?.GroupJob];
              } else {
                const labourObject = {
                  jobNo: item?.SrJobno || item?.GroupJob,
                  GroupjobNo: item?.GroupJob,
                  NetWt: item?.NetWt,
                  name: 'Labour',
                  MakingUnit: makingChargeUnit,
                  MakingCharge: makingCharge,
                  MetalWt: metalWt,
                };
                datas.labour.push(labourObject);
              }
            });
          } else {
            // console.log(`Skipping item due to MaKingCharge_Unit being 0`);
          }
        } else {
          // console.log(`Skipping item due to GroupJob being empty or no metal found`);
        }
      });
    } else {
      // console.log("No resultArray found or it's empty.");
    }

    
    console.log("TCL:  datas.labour",  datas.labour)

    

    datas.header.PrintRemark = datas.header.PrintRemark?.replace(/<br\s*\/?>/gi, "");

    let finalArr = [];

    datas?.resultArray?.forEach((a) => {
      if (a?.GroupJob === "") {
        finalArr.push({
          ...a,
        });
      } else {
        let b = cloneDeep(a);
        let find_record = finalArr.findIndex((el) => el?.GroupJob === b?.GroupJob);

        if (find_record === -1) {
          finalArr.push(b);
        } else {
          if (
            finalArr[find_record]?.GroupJob !== finalArr[find_record]?.SrJobno
          ) {
            finalArr[find_record].designno = b?.designno;
            finalArr[find_record].HUID = b?.HUID;
          }

          if (!finalArr[find_record].DesignImage && b?.DesignImage) {
            finalArr[find_record].DesignImage = b?.DesignImage;
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

          finalArr[find_record].diamonds = [
            ...finalArr[find_record]?.diamonds,
            ...b?.diamonds,
          ]?.flat();
          finalArr[find_record].colorstone = [
            ...finalArr[find_record]?.colorstone,
            ...b?.colorstone,
          ]?.flat();
          finalArr[find_record].metal = [
            ...finalArr[find_record]?.metal,
            // console.log("finalArr[find_record]?.metal", finalArr[find_record]?.metal),
            ...b?.metal,
            // console.log("b?.metal", b?.metal),
          ]?.flat();
          finalArr[find_record].misc = [
            ...finalArr[find_record]?.misc,
            ...b?.misc,
          ]?.flat();
          finalArr[find_record].misc_0List = [
            ...finalArr[find_record]?.misc_0List,
            ...b?.misc_0List,
          ]?.flat();
          finalArr[find_record].finding = [
            ...finalArr[find_record]?.finding,
            ...b?.finding,
          ]?.flat();

          // merge values When labels Will be same IN OtherDetails 11/11/2025
          const mergedOtherDetails = [
            ...finalArr[find_record]?.other_details_array,
            ...b?.other_details_array,
          ];

          finalArr[find_record].other_details_array = mergedOtherDetails.reduce(
            (acc, curr) => {
              const existing = acc.find((item) => item.label === curr.label);

              if (existing) {
                existing.amtval += curr.amtval;

                existing.value = (parseFloat(existing.value || 0) + curr.amtval).toFixed(2);
              } else {
                acc.push({ ...curr });
              }

              return acc;
            },
            []
          );

          finalArr[find_record].other_details_array_amount +=
            b?.other_details_array_amount;

          finalArr[find_record].totals.diamonds.Wt += b?.totals?.diamonds?.Wt;
          finalArr[find_record].totals.diamonds.Pcs += b?.totals?.diamonds?.Pcs;
          finalArr[find_record].totals.diamonds.Amount +=
            b?.totals?.diamonds?.Amount;
          finalArr[find_record].totals.diamonds.SettingAmount +=
            b?.totals?.diamonds?.SettingAmount;

          finalArr[find_record].totals.finding.Wt += b?.totals?.finding?.Wt;
          finalArr[find_record].totals.finding.Rate = b?.totals?.finding?.Rate;
          finalArr[find_record].totals.finding.Pcs += b?.totals?.finding?.Pcs;
          finalArr[find_record].totals.finding.Amount +=
            b?.totals?.finding?.Amount;
          finalArr[find_record].totals.finding.SettingAmount +=
            b?.totals?.finding?.SettingAmount;

          finalArr[find_record].totals.colorstone.Wt +=
            b?.totals?.colorstone?.Wt;
          finalArr[find_record].totals.colorstone.Pcs +=
            b?.totals?.colorstone?.Pcs;
          finalArr[find_record].totals.colorstone.Amount +=
            b?.totals?.colorstone?.Amount;
          finalArr[find_record].totals.colorstone.SettingAmount +=
            b?.totals?.colorstone?.SettingAmount;

          finalArr[find_record].totals.misc.Wt += b?.totals?.misc?.Wt;
          finalArr[find_record].totals.misc.Pcs += b?.totals?.misc?.Pcs;
          finalArr[find_record].totals.misc.Amount += b?.totals?.misc?.Amount;
          finalArr[find_record].totals.misc.SettingAmount +=
            b?.totals?.misc?.SettingAmount;

          finalArr[find_record].totals.misc.IsHSCODE_0_amount +=
            b?.totals?.misc?.IsHSCODE_0_amount;
          finalArr[find_record].totals.misc.IsHSCODE_0_pcs +=
            b?.totals?.misc?.IsHSCODE_0_pcs;
          finalArr[find_record].totals.misc.IsHSCODE_0_wt +=
            b?.totals?.misc?.IsHSCODE_0_wt;

          finalArr[find_record].totals.metal.Amount += b?.totals?.metal?.Amount;
          finalArr[find_record].totals.metal.Wt += b?.totals?.metal?.Wt;
          finalArr[find_record].totals.metal.Pcs += b?.totals?.metal?.Pcs;

          finalArr[find_record].totals.metal.IsNotPrimaryMetalAmount +=
            b?.totals?.metal?.IsNotPrimaryMetalAmount;
          finalArr[find_record].totals.metal.IsNotPrimaryMetalPcs +=
            b?.totals?.metal?.IsNotPrimaryMetalPcs;
          finalArr[find_record].totals.metal.IsNotPrimaryMetalSettingAmount +=
            b?.totals?.metal?.IsNotPrimaryMetalSettingAmount;
          finalArr[find_record].totals.metal.IsNotPrimaryMetalWt +=
            b?.totals?.metal?.IsNotPrimaryMetalWt;

          finalArr[find_record].totals.metal.IsPrimaryMetalAmount +=
            b?.totals?.metal?.IsPrimaryMetalAmount;
          finalArr[find_record].totals.metal.IsPrimaryMetalPcs +=
            b?.totals?.metal?.IsPrimaryMetalPcs;
          finalArr[find_record].totals.metal.IsPrimaryMetalSettingAmount +=
            b?.totals?.metal?.IsPrimaryMetalSettingAmount;
          finalArr[find_record].totals.metal.IsPrimaryMetalWt +=
            b?.totals?.metal?.IsPrimaryMetalWt;
        }
      }
    });

    finalArr.forEach((find_record) => {
      // Only merge if GroupJob is present
      if (find_record?.GroupJob !== "") {
        // Merge and calculate the colorstone and misc_0List
        find_record.colorstone = mergeItemsAndCalculate(find_record.colorstone);
        find_record.misc_0List = mergeItemsAndCalculate(find_record.misc_0List);
      }
    });
    datas.resultArray = finalArr;

    let darr = [];
    let darr2 = [];
    let darr3 = [];
    let darr4 = [];

    datas?.resultArray?.forEach((e) => {
      let met2 = [];
      e?.metal?.forEach((a) => {
        if (e?.GroupJob !== "") {
          let obj = { ...a };
          obj.GroupJob = e?.GroupJob;
          met2?.push(obj);
        }
      });

      let met3 = [];
      met2?.forEach((a) => {
        let findrec = met3?.findIndex(
          (el) => el?.StockBarcode === el?.GroupJob
        );
        if (findrec === -1) {
          met3?.push(a);
        } else {
          met3[findrec].Wt += a?.Wt;
        }
      });

      if (e?.GroupJob === "") {
        return;
      } else {
        e.metal = met3;
      }
    });

    datas?.json2?.forEach((el) => {
      if (el?.MasterManagement_DiamondStoneTypeid === 1) {
        if (el?.ShapeName?.toLowerCase() === "rnd") {
          darr.push(el);
        } else {
          darr2.push(el);
        }
      }
    });

    const processMetalsWt = (resultArray) => {
      const metalsData = resultArray
        ?.flatMap(el => el?.metal || [])
        ?.filter(m => m?.IsPrimaryMetal === 0)
        ?.map(m => {
          const size = Number(m.SizeName) || 0;
          const wt = Number(m.Wt) || 0;
          const calc = (size * wt) / 100;

          return {
            ...m,
            SizeName: size,
            calculatedValue: parseFloat(calc.toFixed(3)),
          };
        });

      const grouped = metalsData?.reduce((acc, m) => {
        const key = `${m.ShapeName}_${m.QualityName}_${m.Colorname}`;
        if (!acc[key]) {
          acc[key] = {
            ShapeName: m.ShapeName,
            QualityName: m.QualityName,
            Colorname: m.Colorname,
            MergedWt: 0,
          };
        }
        acc[key].MergedWt += m.calculatedValue || 0;
        return acc;
      }, {});

      return Object.values(grouped);
    };
    const processedWt = processMetalsWt(datas?.resultArray);
    setProcessedMetalsWt(processedWt);

    const processMetalsAmount = (resultArray) => {
      const metalsData = resultArray?.flatMap((job) => {
        const primaryMetal = job?.metal?.find((m) => m?.IsPrimaryMetal === 1);
        const nonPrimaryMetals = job?.metal?.filter((m) => m?.IsPrimaryMetal !== 1);

        if (!primaryMetal || !nonPrimaryMetals?.length) return [];

        return nonPrimaryMetals.map((m) => {
          const wt = Number(m.Wt) || 0;
          const calculatedValue = (primaryMetal.Rate || 0) * wt;

          return {
            ...m,
            Wt: wt,
            Rate: primaryMetal.Rate || 0,
            calculatedValue: parseFloat(calculatedValue.toFixed(3)),
          };
        });
      });

      const grouped = metalsData?.reduce((acc, m) => {
        const key = `${m.ShapeName}_${m.QualityName}_${m.Colorname}`;
        if (!acc[key]) {
          acc[key] = {
            ShapeName: m.ShapeName,
            QualityName: m.QualityName,
            Colorname: m.Colorname,
            totalWt: 0,
            totalAmount: 0,
          };
        }
        acc[key].totalWt += m.Wt || 0; // sum Wt if needed
        acc[key].totalAmount += m.calculatedValue || 0;
        return acc;
      }, {});

      return Object.values(grouped).map((g) => ({
        ...g,
        totalAmount: parseFloat(g.totalAmount.toFixed(3)), // round to 3 decimals
      }));
    };
    const processedAmount = processMetalsAmount(datas?.resultArray);
    setProcessedMetalsAmount(processedAmount);

    setResult(datas);

    darr?.forEach((a) => {
      let aobj = cloneDeep(a);
      let findrec = darr3?.findIndex(
        (al) =>
          al?.ShapeName === aobj?.ShapeName &&
          al?.Colorname === aobj?.Colorname &&
          al?.QualityName === aobj?.QualityName
      );
      if (findrec === -1) {
        darr3.push(aobj);
      } else {
        darr3[findrec].Wt += a?.Wt;
        darr3[findrec].Pcs += a?.Pcs;
      }
    });

    let obj_ = {
      ShapeName: "OTHERS",
      QualityName: "",
      Colorname: "",
      Wt: 0,
      Pcs: 0,
    };
    darr2?.forEach((a) => {
      obj_.Wt += a?.Wt;
      obj_.Pcs += a?.Pcs;
    });

    darr4 = [...darr3, obj_];

    setDiamondArr(darr4);

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

    let diamondDetail = [];
    data?.BillPrint_Json2?.forEach((e) => {
      if (e?.MasterManagement_DiamondStoneTypeid === 1) {
        let findDiamond = diamondDetail?.findIndex(
          (ele) => ele?.ShapeName === e?.ShapeName && ele?.QualityName === e?.QualityName && ele?.Colorname === e?.Colorname
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
      (ele?.ShapeName === "RND" ? findRND : remaingDia).push(ele);
    });

    const sortFn = (a, b) =>
      a.ShapeName !== b.ShapeName ? a.ShapeName.localeCompare(b.ShapeName) :
        a.QualityName !== b.QualityName ? a.QualityName.localeCompare(b.QualityName) :
          a.Colorname.localeCompare(b.Colorname);

    findRND.sort(sortFn);
    remaingDia.sort(sortFn);

    let diaResultArr = [];
    if (findRND?.length > 6) {
      let arr = findRND.slice(0, 6);
      let anotherArr = [...findRND.slice(6), remaingDia].flat();
      let obj = { ...anotherArr[0] };
      anotherArr?.reduce((acc, cobj) => {
        obj.Pcs += cobj?.Pcs; obj.Wt += cobj?.Wt; obj.Amount += cobj?.Amount;
      }, obj);
      obj.ShapeName = "OTHER";
      diaResultArr = [...arr, obj].flat();
    } else {
      let arr = [...findRND].flat();
      let smallArr = [...remaingDia.slice(0, 6 - findRND?.length)].flat();
      let largeArr = [...remaingDia.slice(6 - findRND?.length)].flat();
      let finalArr2 = [...arr, ...smallArr].flat();
      let obj = { ...largeArr[0] };
      obj.Pcs = 0; obj.Wt = 0; obj.Amount = 0;
      largeArr?.reduce((acc, cobj) => {
        obj.Pcs += cobj?.Pcs; obj.Wt += cobj?.Wt; obj.Amount += cobj?.Amount;
      }, obj);
      obj.ShapeName = "OTHER";
      diaResultArr = [...finalArr2, obj].flat();
    }

    setDiamondDetails(diaResultArr);
  };

  const handleImgShow = () => {
    if (imgFlag) setImgFlag(false);
    else {
      setImgFlag(true);
    }
  };
  const handleReferenceShow = () => {
    if (referenceFlag) setReferenceFlag(false);
    else {
      setReferenceFlag(true);
    }
  };
  const handleDuty = () => {
    if (duty) setDuty(false);
    else {
      setDuty(true);
    }
  };
  const handleCompanyDetail = () => {
    if (companyDetail) setCompanyDetail(false);
    else {
      setCompanyDetail(true);
    }
  };

  const handleImageErrors = () => {
    setIsImageWorking(false);
  };

  function PrintableText({ result }) {
    const htmlContent = result?.header?.Printlable?.replace(/\n/g, '<br />');

    return (
      <div
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  // const totalMakingAmount = result?.resultArray?.reduce((acc, e) => {
  //   const calculation = e?.MaKingCharge_Unit * (e?.GroupJob !== '' 
  //       ? (e?.totals?.metal?.Wt - e?.totals?.metal?.IsNotPrimaryMetalWt) 
  //       : e?.totals?.metal?.Wt
  //   );
  //   return acc + (calculation || 0);
  // }, 0);
  // const totalMakingAmount = result?.resultArray?.reduce((acc, e) => {

  //   const weight = e?.GroupJob !== ''
  //     ? (e?.totals?.metal?.Wt - e?.totals?.metal?.IsNotPrimaryMetalWt)
  //     : e?.totals?.metal?.Wt;

  //   const calculation = e?.MakingChargeOnid == 4
  //     ? e?.MaKingCharge_Unit
  //     // : e?.MaKingCharge_Unit * weight;
  //     : e?.MakingAmount;

  //   return acc + (calculation || 0);

  // }, 0);

  // const totalMakingAmount = (result?.resultArray || []).reduce((grandSum, e) => {
  //   const secondaryMetal = e?.metal?.find((m) => m?.IsPrimaryMetal === 0);
  //   const amountA = e?.MakingAmount || 0;
  //   const amountB = secondaryMetal?.SettingAmount || 0;
  //   return grandSum + amountA + amountB;
  // }, 0);

  const totalMakingAmount = (result?.resultArray || []).reduce((grandSum, e) => {
    const amountA = e?.MakingAmount || 0;
  
    const metalSettingSum = e?.metal?.filter((m) => m?.IsPrimaryMetal === 0).reduce(
      (sum, m) => sum + (m?.Wt * e?.MaKingCharge_Unit || 0),
      0
    ) || 0;
  
    const findingSettingSum = e?.finding?.reduce(
      (sum, f) => sum + (f?.Wt * e?.MaKingCharge_Unit || 0),
      0
    ) || 0;
  
    const amountB = metalSettingSum + findingSettingSum;
  
    return grandSum + amountA + amountB;
  }, 0);





  const totalMetalSummaryAmount = result?.resultArray?.reduce((totalAcc, item) => {
    const primaryMetal = item?.metal?.find(m => m?.IsPrimaryMetal === 1);
    const primaryRate = primaryMetal?.Rate || 0;

    const itemTotal = item?.metal?.reduce((acc, m) => {
      const rateToUse = primaryRate;
      const amount = (m?.Wt || 0) * (rateToUse || 0);
      return acc + amount;
    }, 0);

    return totalAcc + itemTotal;
  }, 0);


  console.log("TCL: result", result)

  const goldTotalAmount = result?.json2
    ?.filter((e) => e?.ShapeName?.toUpperCase() === "GOLD")
    ?.reduce((sum, e) => sum + (e?.Amount || 0), 0);

  const TotalDuty = result?.resultArray?.reduce((acc, e) => {
    return acc + (e?.CustomDuty_Amount || 0);
  }, 0);

  const mergeMiscData = (dataArray) => {
    return Object.values(
      dataArray.reduce((accumulator, currentItem) => {
        const key = currentItem.ShapeName;

        // If this ShapeName hasn't been seen yet, initialize it
        if (!accumulator[key]) {
          accumulator[key] = { ...currentItem };
        } else {
          // If it already exists, add up the relevant numeric fields
          accumulator[key].Pcs += currentItem.Pcs || 0;
          accumulator[key].Wt += currentItem.Wt || 0;
          accumulator[key].Amount += currentItem.Amount || 0;
          accumulator[key].RMwt += currentItem.RMwt || 0;
          accumulator[key].FineWt += currentItem.FineWt || 0;

          // Recalculate pointer if needed (assuming pointer = Wt / Pcs)
          if (accumulator[key].Pcs > 0) {
            accumulator[key].pointer = accumulator[key].Wt / accumulator[key].Pcs;
          }
        }

        return accumulator;
      }, {})
    );
  };

  const mergeDiadetails = (dataArray) => {
    if (!dataArray || !Array.isArray(dataArray)) return [];

    const mergedMap = dataArray.reduce((acc, current) => {
      // Normalizing to lowercase handles cases like 'Heart' vs 'heart' safely
      // const key = current.ShapeName?.toLowerCase() || "unknown";
      const shapeName = current.ShapeName?.toLowerCase() || "";
      const isSolGem = String(current.IsSolGem ?? "0");
      const typename = String(current?.MaterialTypeName || "")

      let key = `${shapeName}_${isSolGem}`;

      if (typename !== "") {
        key += `_${typename}`
      }




      if (!acc[key]) {
        // Create a fresh copy of the first encountered object
        acc[key] = { ...current };
      } else {
        // Accumulate numeric fields
        acc[key].Pcs += current.Pcs || 0;
        acc[key].Wt = Number((acc[key].Wt + (current.Wt || 0)).toFixed(4)); // Keeps decimals clean
        acc[key].Amount += current.Amount || 0;
        // acc[key].Rate = Number((acc[key].Rate + (current.Rate || 0)).toFixed(4));
        acc[key].Rate = Number((Number(acc[key].Rate || 0) + Number(current.Rate || 0)).toFixed(4));
        acc[key].FineWt += current.FineWt || 0;

        // Recalculate average pointer if applicable
        if (acc[key].Pcs > 0) {
          acc[key].pointer = Number((acc[key].Wt / acc[key].Pcs).toFixed(4));
        }
      }
      return acc;
    }, {});

    // Convert the grouped object map back into an array
    return Object.values(mergedMap);
  };

  const discountCriteria = [
    { key: 'DiamondDiscount', isAmountKey: 'IsDiamondDiscInAmount', label: 'Diamond', disAmount: "DiamondDiscountAmount" },
    { key: 'MetalDiscount', isAmountKey: 'IsMetalDiscInAmount', label: 'Metal', disAmount: "MetalDiscountAmount" },
    { key: 'StoneDiscount', isAmountKey: 'IsStoneDiscInAmount', label: 'Colorstone', disAmount: "StoneDiscountAmount" },
    { key: 'LabourDiscount', isAmountKey: 'IsLabourDiscInAmount', label: 'Labour', disAmount: "LabourDiscountAmount" },
    { key: 'SolitaireDiscount', isAmountKey: 'IsSolitaireDiscInAmount', label: 'Solitaire', disAmount: "SolitaireDiscountAmount1" },
    { key: 'MiscDiscount', isAmountKey: 'IsMiscDiscInAmount', label: 'Misc', disAmount: "MiscDiscountAmount" },
  ];
  const Brokerage = result?.header?.BrokerageDet
    ? result.header.BrokerageDet
      .split("|")
      .filter((item) => item.trim() !== "") // Filters out empty split entries
      .map((item) => {
        const [key, value] = item.trim().split("-");
        const parsedVal = parseFloat(value);

        return {
          [key?.trim()]: isNaN(parsedVal) ? 0 : parsedVal,
        };
      })
    : [];

  console.log("TCL: mergeDiadetails -> Brokerage", Brokerage)

  const Multimetal_summary = Object.values(
    (result?.json2 || [])
      .filter(item => item.MasterManagement_DiamondStoneTypeid === 4 && item.IsPrimaryMetal === 0)
      .reduce((acc, item) => {
        if (!acc[item.ShapeName]) {
          acc[item.ShapeName] = { ShapeName: item.ShapeName, TotalWt: 0, TotalAmount: 0 };
        }
        acc[item.ShapeName].TotalWt += item.Wt;
        acc[item.ShapeName].TotalAmount += item.Amount;
        return acc;
      }, {})
  );


  const MetalData = Object.values(
    json2data
      .filter(item => item.MasterManagement_DiamondStoneTypeid === 4 || item.MasterManagement_DiamondStoneTypeid === 5)
      .reduce((acc, item) => {
        const shape = item.ShapeName;
        const size = parseFloat(item.SizeName) || 0;
        const purewt = (item.Weight * size) / 100;

        if (!acc[shape]) {
          acc[shape] = {
            ShapeName: shape,
            TotalPcs: 0,
            TotalWt: 0,
            TotalPureWt: 0,
            TotalAmount: 0
          };
        }
        acc[shape].TotalPcs += item.Pcs || 0;
        acc[shape].TotalWt += item.Wt || 0;
        acc[shape].TotalPureWt += purewt;
        acc[shape].TotalAmount += item.Amount || 0;

        return acc;
      }, {})
  );


  // const SolCertNo = (json2data || [])
  // .filter(x => x?.MasterManagement_DiamondStoneTypeid === 1)
  // .map(x => x?.certno)
  // .filter(Boolean)
  // .join(",");

  const SolCertNo = (jobNo, stoneTypeId) => {
    return json2data
      .filter(
        x =>
          x?.StockBarcode === jobNo &&
          x?.MasterManagement_DiamondStoneTypeid === stoneTypeId
      )
      .map(x => x?.certno)
      .filter(Boolean)
      .join(", ");
  };



  const mergeFindingsIntoPrimaryMetal = (findings = [], metals = []) => {
    let remainingFindings = [...findings];

    const updatedMetals = metals.map((metal) => {
      if (metal.IsPrimaryMetal !== 1) return metal;

      // findings that match this primary metal on Quality + Size + Rate
      const matched = remainingFindings.filter(
        (f) =>
          f?.QualityName === metal?.QualityName &&
          f?.SizeName === metal?.SizeName &&
          f?.Rate === metal?.Rate &&
          f?.Supplier === metal?.Supplier
      );

      if (matched.length === 0) return metal;

      // remove the matched findings from the pool so they aren't reused
      // by another primary metal row and won't appear in the final findings list
      remainingFindings = remainingFindings.filter((f) => !matched.includes(f));

      const totals = matched.reduce(
        (acc, f) => ({
          Pcs: acc.Pcs + (f.Pcs || 0),
          Wt: acc.Wt + (f.Wt || 0),
          FineWt: acc.FineWt + (f.FineWt || 0),
          Amount: acc.Amount + (f.Amount || 0),
          RMwt: acc.RMwt + (f.RMwt || 0),
          Weight: acc.Weight + (f.Weight || 0),
        }),
        { Pcs: 0, Wt: 0, FineWt: 0, Amount: 0, RMwt: 0, Weight: 0 }
      );

      return {
        ...metal,
        Pcs: (metal.Pcs || 0) + totals.Pcs,
        Wt: (metal.Wt || 0) + totals.Wt,
        FineWt: (metal.FineWt || 0) + totals.FineWt,
        Amount: (metal.Amount || 0) + totals.Amount,
        RMwt: (metal.RMwt || 0) + totals.RMwt,
        Weight: (metal.Weight || 0) + totals.Weight,
      };
    });

    return { findings: remainingFindings, metals: updatedMetals };
  };


  const calcFinalAmount = (e) => {
    const secondaryMetals = e?.metal?.filter((m) => m?.IsPrimaryMetal === 0) || [];
  
    // decide: merge into one labour row, or show two separate rows
    const labourRows = (() => {
      const rateA = e?.MaKingCharge_Unit || 0;
      const amountA = e?.MakingAmount || 0;
  
      const rows = [{ rate: rateA, amount: amountA || 0 }];
  
      for (const metal of secondaryMetals) {
        const rateB = metal?.SettingRate;
        const amountB = metal?.SettingAmount || 0;
  
        // loose compare, per spec — switch to Number(existing.rate) === Number(rateB) for strict numeric matching
        const existingRow = rows.find((row) => row.rate == rateB);
  
        if (existingRow) {
          existingRow.amount += amountB;
        } else {
          rows.push({ rate: rateB, amount: amountB });
        }
      }
  
      return rows;
    })();
  
    const labourTotal = labourRows.reduce((sum, row) => sum + (row.amount || 0), 0);
  
    const extraCharge =
      (e?.OtherCharges || 0) +
      (e?.TotalDiamondHandling || 0) +
      (e?.totals?.misc?.IsHSCODE_1_amount || 0) +
      (e?.totals?.misc?.IsHSCODE_2_amount || 0) +
      (e?.totals?.misc?.IsHSCODE_3_amount || 0) +
      (e?.totals?.diamonds?.SettingAmount || 0) +
      (e?.totals?.colorstone?.SettingAmount || 0) +
      (e?.totals?.finding?.SettingAmount || 0) +
      (
        e?.GroupJob !== ""
          ? (e?.MaKingCharge_Unit || 0) * (e?.totals?.metal?.Wt || 0)
          : labourTotal
      );
  
    return extraCharge / (result?.header?.CurrencyExchRate || 1);
  };

  const GrandfinalAmount =
  result?.resultArray?.reduce((sum, e) => sum + calcFinalAmount(e), 0) || 0;
  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <div>
          <div className="container_pcls">
            {/* print btn and flag */}
            <div className=" d-flex align-items-center justify-content-end my-5 whole_none_pcl3">
              <div className="px-2">
                <input
                  type="checkbox"
                  onChange={handleCompanyDetail}
                  value={companyDetail}
                  checked={companyDetail}
                  id="companydetail"
                />
                <label htmlFor="companydetail" className="user-select-none mx-1">
                  Details
                </label>
              </div>
              <div className="px-2">
                <input
                  type="checkbox"
                  onChange={handleDuty}
                  value={duty}
                  checked={duty}
                  id="duty"
                />
                <label htmlFor="duty" className="user-select-none mx-1">
                  Duty
                </label>
              </div>
              <div className="px-2">
                <input
                  type="checkbox"
                  onChange={handleImgShow}
                  value={imgFlag}
                  checked={imgFlag}
                  id="imgshow"
                />
                <label htmlFor="imgshow" className="user-select-none mx-1">
                  With Image
                </label>
              </div>
              <div className="px-2">
                <input
                  type="checkbox"
                  onChange={handleReferenceShow}
                  value={referenceFlag}
                  checked={referenceFlag}
                  id="reference"
                />
                <label htmlFor="reference" className="user-select-none mx-1">
                  Reference
                </label>
              </div>
              <div>
                <Button />
              </div>
            </div>

            {companyDetail && (
              <>
                {/* Header Label */}
                <div className="jewelleryPackingList mb-2 mt-2 recordDetailPrint1">
                  <p className={`p-2 fw-bold text-white`} style={{ fontSize: "20px" }}>
                    {result?.header?.PrintHeadLabel}
                  </p>
                </div>

                {/* Company Details */}


                <div className="d-flex align-items-center pb-2 border-bottom recordDetailPrint1">
                  <div className="col-6">
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



                {/* Customer Details */}
                <div className="d-flex border-start border-end border-bottom mb-1 recordDetailPrint1" style={{ borderTop: "1px solid #dee2e6" }}>
                  <div className="col-4 border-end  p-1">
                    <p className="lhDetailPrint1">{result?.header?.lblBillTo}</p>
                    <p className="lhDetailPrint1 fw-bold detailPrint1L_font_14">
                      {result?.header?.customerfirmname}
                    </p>
                    {result?.header?.customerAddress2 !== "" && (<p className="lhDetailPrint1 pb-1">{result?.header?.customerAddress2}</p>)}
                    {result?.header?.customerAddress1 !== "" && (<p className="lhDetailPrint1 pb-1">{result?.header?.customerAddress1}</p>)}
                    {result?.header?.customerAddress3 !== "" && (<p className="lhDetailPrint1 pb-1">{result?.header?.customerAddress3}</p>)}
                    {(result?.header?.customercity1 !== "" || result?.header?.PinCode !== "") && (
                      <p className="lhDetailPrint1 pb-1">
                        {result?.header?.customercity1 && ` ${result?.header.customercity1}`}
                        {result?.header?.PinCode && ` - ${result?.header.PinCode}`}
                      </p>
                    )}
                    {result?.header?.customeremail1 !== "" && (<p className="lhDetailPrint1 pb-1">{result?.header?.customeremail1}</p>)}
                    {result?.header?.vat_cst_pan !== "" && (<p className="lhDetailPrint1 pb-1">{result?.header?.vat_cst_pan}</p>)}
                    {result?.header?.Cust_CST_STATE_No !== "" && (<p className="lhDetailPrint1 pb-1">
                      {result?.header?.Cust_CST_STATE}-{result?.header?.Cust_CST_STATE_No}
                    </p>)}
                  </div>
                  <div className="col-4 border-end p-1">
                    <p className="lhDetailPrint1">Ship To,</p>
                    <p className="lhDetailPrint1 fw-bold detailPrint1L_font_14">
                      {result?.header?.customerfirmname}
                    </p>
                    {address?.map((e, i) => {
                      return (
                        <p key={i} className="FntLnHit pb-1 spbrWord">
                          {e}
                        </p>
                      );
                    })}

                    {/* {result?.header?.CustName !== "" && (<p className="lhDetailPrint1 pb-1">{result?.header?.CustName}</p>)}
                {result?.header?.customerstreet !== "" && (<p className="lhDetailPrint1 pb-1">{result?.header?.customerstreet}</p>)}
                <p className="lhDetailPrint1 pb-1">
                  {result?.header?.customercity} {result?.header?.State}
                </p>
                <p className="lhDetailPrint1 pb-1">
                  {result?.header?.CompanyCountry}{result?.header?.PinCode !== "" && `- ${result?.header?.PinCode}`}
                </p>
                <p className="lhDetailPrint1 pb-1">
                  {result?.header?.customermobileno !== "" && ( `Mobile No : ${result?.header?.customermobileno}` )}
                </p> */}
                  </div>
                  <div className="col-4 p-1 ps-2">
                    {result?.header?.InvoiceNo !== "" && (
                      <div className="d-flex pb-1 pt-1">
                        <p className="fw-bold col-2 me-2">BILL NO </p>
                        <p className="col-10">{result?.header?.InvoiceNo}</p>
                      </div>
                    )}
                    {result?.header?.EntryDate !== "" && (
                      <div className="d-flex pb-1">
                        <p className="fw-bold col-2 me-2">DATE </p>
                        <p className="col-10">{result?.header?.EntryDate}</p>
                      </div>
                    )}
                    {result?.header?.HSN_No !== "" && (
                      <div className="d-flex pb-1">
                        <p className="fw-bold col-2 me-2">HSN </p>
                        <p className="col-10">{result?.header?.HSN_No}</p>
                      </div>
                    )}
                  </div>
                </div>

              </>
            )}



            {!companyDetail && (
              <div style={{ display: "flex", border: "1px solid #BDBDBD", marginTop: "5px" }}>
                {
                  referenceFlag ?
                    <div style={{
                      width: "60%", borderRight: "1px solid #BDBDBD",
                      padding: "7px"
                    }}>

                      <b>Reference :</b> <span>{result?.header?.BillReferenceNo}</span>

                    </div>
                    :
                    <div style={{
                      width: "60%", borderRight: "1px solid #BDBDBD",
                      padding: "7px"
                    }}>
                      <b>Invoice :</b> <span>{result?.header?.InvoiceNo}</span>
                    </div>
                }

                <div style={{ width: "40%", padding: "7px" }}>
                  <b>Date :</b> <span>{result?.header?.EntryDate}</span>
                </div>
              </div>

            )}




            {/* table */}
            <div className="mt-1 ">
              {/* table head */}
              <div
                className="d-flex thead_pcls bbottom_pcls tb_fs_pcls"
                style={{
                  borderTop: "1px solid black",
                  borderLeft: "1px solid black",
                  borderRight: "1px solid black",
                }}
              >
                <div className="col1_pcls centerall_pcls bright_pcls">Sr</div>
                <div className={duty ? "col2_pcls_duty centerall_pcls bright_pcls" : "col2_pcls centerall_pcls bright_pcls"}>
                  Design
                </div>
                <div className={duty ? "col3_pcls_duty bright_pcls" : "col3_pcls bright_pcls"}>
                  <div className="w-100 centerall_pcls bbottom_pcls">
                    Diamond
                  </div>
                  <div className="d-flex w-100">
                    <div className="dcol1_pcls centerall_pcls bright_pcls">
                      Shape
                    </div>

                    <div className="dcol3_pcls centerall_pcls bright_pcls">
                      Pcs
                    </div>
                    <div className="dcol4_pcls centerall_pcls bright_pcls">
                      Wt
                    </div>
                    <div className="dcol5_pcls centerall_pcls bright_pcls">
                      Rate
                    </div>
                    <div className="dcol6_pcls centerall_pcls">Amount</div>
                  </div>
                </div>
                <div className={duty ? "col4_pcls_duty bright_pcls" : "col4_pcls bright_pcls"}>
                  <div className="w-100 centerall_pcls bbottom_pcls">Metal</div>
                  <div className="d-flex w-100">
                    <div className="mcol1_pcls centerall_pcls bright_pcls">
                      Quality
                    </div>
                    <div className="mcol1_pcls centerall_pcls bright_pcls">
                      Gwt
                    </div>
                    <div className="mcol1_pcls centerall_pcls bright_pcls">
                      Net
                    </div>
                    <div className="mcol1_pcls centerall_pcls bright_pcls">
                      Fine
                    </div>
                    <div className="mcol1_pcls centerall_pcls bright_pcls">
                      Loss
                    </div>
                    <div className="mcol1_pcls centerall_pcls bright_pcls">
                      Rate
                    </div>
                    <div className="mcol1_pcls centerall_pcls ">Amount</div>
                  </div>
                </div>
                <div className={duty ? "col5_pcls_duty bright_pcls" : "col5_pcls bright_pcls"}>
                  <div className="w-100 centerall_pcls bbottom_pcls">
                    Stone & Misc
                  </div>
                  <div className="d-flex w-100">
                    <div className="dcol1_pcls centerall_pcls bright_pcls">
                      Shape
                    </div>

                    <div className="dcol3_pcls centerall_pcls bright_pcls">
                      Pcs
                    </div>
                    <div className="dcol4_pcls centerall_pcls bright_pcls">
                      Wt
                    </div>
                    <div className="dcol5_pcls centerall_pcls bright_pcls">
                      Rate
                    </div>
                    <div className="dcol6_pcls centerall_pcls">Amount</div>
                  </div>
                </div>
                <div className={duty ? "col6_pcls_duty bright_pcls" : "col6_pcls bright_pcls"}>
                  <div className="centerall_pcls w-100 bbottom_pcls">
                    Labour & Other Charges
                  </div>
                  <div className="d-flex w-100">
                    <div className="lcol1_pcls centerall_pcls bright_pcls">
                      Charges
                    </div>
                    <div className="lcol1_pcls centerall_pcls bright_pcls">
                      Rate
                    </div>
                    <div className="lcol1_pcls centerall_pcls">Amount</div>
                  </div>
                </div>
                {duty && (
                  <div className="col65_pcls centerall_pcls bright_pcls">Duty Amount</div>

                )}
                <div className={duty ? "col7_pcls_duty centerall_pcls" : "col7_pcls centerall_pcls"}>Total Amount</div>
              </div>

              {/* table rows */}
              {result?.resultArray?.map((e, i) => {

                 
                // Calculate extra charges safely
               

                // labourTotal
                // find the secondary (non-primary) metal row
                const secondaryMetals = e?.metal?.filter((m) => m?.IsPrimaryMetal === 0) || [];
                
                // decide: merge into one labour row, or show two separate rows
                const labourRows = (() => {
                  const rateA = e?.MaKingCharge_Unit;
                  const amountA = e?.MakingAmount;
                
                  const rows = [{ rate: rateA, amount: amountA || 0 }];
                
                  for (const metal of secondaryMetals) {
                    const rateB = metal?.SettingRate;
                    const amountB = metal?.SettingAmount || 0;
                
                    // loose compare, per spec — switch to Number(existing.rate) === Number(rateB) for strict numeric matching
                    const existingRow = rows.find((row) => row.rate == rateB);
                
                    if (existingRow) {
                      existingRow.amount += amountB;
                    } else {
                      rows.push({ rate: rateB, amount: amountB });
                    }
                  }
                
                  return rows;
                })();
                
                const labourTotal = labourRows.reduce((sum, row) => sum + (row.amount || 0), 0);
                
                console.log("TCL: labourTotal", labourTotal)
                // const labourTotal = e?.GroupJob !== ""
                // ? (result?.labour?.filter((el) => el?.GroupjobNo === e?.GroupJob)
                //   ?.reduce((sum, item) => sum + (item.MakingCharge || 0), 0) || 0)
                // : 0;

              const extraCharge =
                (e?.OtherCharges || 0) +
                (e?.TotalDiamondHandling || 0) +
                (e?.totals?.misc?.IsHSCODE_1_amount || 0) +
                (e?.totals?.misc?.IsHSCODE_2_amount || 0) +
                (e?.totals?.misc?.IsHSCODE_3_amount || 0) +
                (e?.totals?.diamonds?.SettingAmount || 0) +
                (e?.totals?.colorstone?.SettingAmount || 0) +
                (e?.totals?.finding?.SettingAmount || 0) +
                (
                  e?.GroupJob !== ""
                    ? (e?.MaKingCharge_Unit || 0) *
                    ((e?.totals?.metal?.Wt || 0))
                    :
                    // e?.MakingChargeOnid === 4
                    //   ? (e?.MaKingCharge_Unit || 0)
                    //   : (e?.MaKingCharge_Unit || 0) *
                    //   (e?.totals?.metal?.Wt || 0)
                    labourTotal
                );

              const finalAmount =
                extraCharge / (result?.header?.CurrencyExchRate || 1);


                const discountDisplay = discountCriteria
                  .filter(({ key }) => e?.[key] > 0)
                  .map(({ key, isAmountKey, label, disAmount }) => {
                    const num = Number(e[key]);
                    const am = Number(e[disAmount])
                    const decimals = e[isAmountKey] === 1 ? 3 : 2;
                    const val = num.toFixed(decimals);
                    return e[isAmountKey] === 0 ? `${val}% @${label} Amount ` : `${(val / result?.header?.CurrencyExchRate)?.toFixed(2)} @${label} Amount`;
                  })
                  .join(', ');


                const mergedFindings = mergeFindings(e?.finding);
                const mergedMetals = mergeMetals(e?.metal);
                const miscdata = mergeMiscData(e?.misc_0List);
                const diamonddata = mergeDiadetails(e?.diamonds);
                const colorstonedata = mergeDiadetails(e?.colorstone);



                // const cirtiFinding = SolCertNo(
                //   e?.GroupJob !== "" ? e?.GroupJob : e?.SrJobno,
                //   1
                // );


                const jobNos =
                  e?.GroupJob !== ""
                    ? [e?.GroupJob, e?.SrJobno]
                    : [e?.SrJobno];

                const cirtiFinding = jobNos
                  .map(jobNo => SolCertNo(jobNo, 1))
                  .filter(Boolean)
                  .join(",");
                return (

                  <>
                    <div
                      className="d-flex tbody_pcls bbottom_pcls tb_fs_pcls pbia_pcl3 border-top"
                      style={{
                        borderLeft: "1px solid black",
                        borderRight: "1px solid black",
                      }}
                      key={i}
                    >
                      <div className="col1_pcls d-flex justify-content-center align-items-start bright_pcls pt-1">
                        {i + 1}
                      </div>

                      {/* Design */}
                      <div className={duty ? "col2_pcls_duty start_top_pcls flex-column bright_pcls pt-1" : "col2_pcls start_top_pcls flex-column bright_pcls pt-1"}>
                        <div className="d-flex flex-wrap justify-content-between align-items-center w-100 text-break pdl_pcls pdr_pcls">
                          <div>{e?.designno}</div>
                          <div>{e?.GroupJob !== "" ? e?.GroupJob : e?.SrJobno}</div>
                        </div>
                        <div className="d-flex flex-wrap justify-content-end w-100 text-break pdr_pcls">
                          {e?.MetalColor}
                        </div>
                        {imgFlag ? (
                          <div>
                            <img
                              src={e?.DesignImage}
                              onError={(e) => handleImageError(e)}
                              alt="design"
                              className="designimg_pcls"
                            />
                          </div>
                        ) : (
                          ""
                        )}
                        {e?.Categoryname !== "" && (
                          <div className="centerall_pcls text-break w-100">

                            <span className="fw-bold">{e?.Categoryname}</span>
                          </div>
                        )}
                        {e?.CertificateNo !== "" && (
                          <div className="centerall_pcls text-break w-100">
                            Certificate# :{" "}
                            <span className="fw-bold">{e?.CertificateNo}</span>
                          </div>
                        )}
                        {cirtiFinding !== "" && (
                          <div className="centerall_pcls text-break w-100" style={{ alignItems: "flex-start" }}>
                            <span >Sol.Cert# :{" "} <b>{cirtiFinding}</b></span>

                          </div>
                        )}
                        {e?.HUID !== "" && (
                          <div className="centerall_pcls w-100 text-break">
                            HUID : <span className="fw-bold">{e?.HUID}</span>
                          </div>
                        )}
                        {e?.PO !== "" && (
                          <div className="centerall_pcls w-100 fw-bold text-break">
                            PO : {e?.PO}
                          </div>
                        )}
                        {/* {e?.lineid !== "" && (
                          <div className="centerall_pcls w-100 text-break">
                            {e?.lineid}
                          </div>
                        )} */}
                        {e?.Tunch !== "" && (
                          <div className="centerall_pcls w-100 text-break">
                            Tunch : {" "}
                            <span className="fw-bold" style={{ marginLeft: "2px" }}>
                              {e?.Tunch?.toFixed(3)}
                            </span>
                          </div>
                        )}
                        {e?.lineid !== "" && (
                          <div className="centerall_pcls w-100 text-break">
                            line id : {" "}
                            <span className="fw-bold" style={{ marginLeft: "2px" }}>
                              {e?.lineid}
                            </span>
                          </div>
                        )}
                        {e?.Size !== "" && (
                          <div className="centerall_pcls w-100 text-break">
                            <span className="">Size : {e?.Size}</span>
                          </div>
                        )}
                        {e?.grosswt !== "" && (
                          <div className="centerall_pcls text-break w-100 fw-bold">
                            {e?.grosswt?.toFixed(3)} gm{" "}
                            <span className="fw-normal">&nbsp;Gross</span>
                          </div>
                        )}
                      </div>

                      {/* Diamond */}
                      <div className={duty ? "col3_pcls_duty d-flex flex-column justify-content-between bright_pcls" : "col3_pcls d-flex flex-column justify-content-between bright_pcls"}>
                        <div>

                          {diamonddata
                            ?.slice()
                            ?.sort((a, b) => {
                              const aCustom = a?.SizeName?.toLowerCase() === "custom";
                              const bCustom = b?.SizeName?.toLowerCase() === "custom";

                              // Normal first
                              console.log("TCL: e?.diamonds", e?.diamonds)
                              if (aCustom && !bCustom) return 1;
                              if (!aCustom && bCustom) return -1;

                              const getFirstNumber = (val) => {
                                if (!val) return 0;
                                const match = val.match(/[\d.]+/); // extract first numeric part
                                return match ? parseFloat(match[0]) : 0;
                              };

                              // Normal size ascending
                              if (!aCustom && !bCustom) {
                                return getFirstNumber(a?.SizeName) - getFirstNumber(b?.SizeName);
                              }

                              // Custom size descending
                              return getFirstNumber(b?.CustomSize) - getFirstNumber(a?.CustomSize);
                            })
                            ?.map((el, ind) => (
                              <div className="d-flex w-100" key={ind}>
                                {/* <div className="dcol1_pcls spbrWord start_center_pcls pdl_pcls">
                                  {el?.IsSolGem === 1 ? "S:" : ""}
                                  { el?.MaterialTypeName }
                                  {el?.ShapeName}
                                </div> */}


                                <div className="dcol1_pcls spbrWord start_center_pcls pdl_pcls">
                                  {el?.IsSolGem === 1 ? "S: " : ""}
                                  {[el?.MaterialTypeName, el?.ShapeName].filter(Boolean).join(" ")}
                                </div>



                                <div className="dcol3_pcls end_pcls pdr_pcls">
                                  {el?.Pcs}
                                </div>

                                <div className="dcol4_pcls end_pcls pdr_pcls">
                                  {el?.Wt?.toFixed(3)}
                                </div>

                                <div className="dcol5_pcls end_pcls pdr_pcls" style={{ textAlign: "right" }}>
                                  {formatAmount(((el?.Amount / el?.Wt) / result?.header?.CurrencyExchRate)?.toFixed(2))}
                                  {/* {formatAmount((el?.Rate)?.toFixed(2))} */}
                                </div>

                                <div className="dcol6_pcls end_pcls pdr_pcls fw-bold">
                                  {formatAmount(el?.Amount / result?.header?.CurrencyExchRate)}
                                </div>
                              </div>
                            ))}
                        </div>
                        <div className="d-flex w-100 btop_pcls bg_pcls fw-bold">
                          <div className="dcol1_pcls">&nbsp;</div>

                          <div className="dcol3_pcls end_pcls pdr_pcls" style={{ width: "13%" }}>
                            {e?.totals?.diamonds?.Pcs !== 0 &&
                              e?.totals?.diamonds?.Pcs}
                          </div>
                          <div className="dcol4_pcls end_pcls pdr_pcls" style={{ width: "17%" }}>
                            {e?.totals?.diamonds?.Wt !== 0 &&
                              e?.totals?.diamonds?.Wt?.toFixed(3)}
                          </div>
                          <div
                            className="end_pcls pdr_pcls"
                            style={{ width: "48%" }}
                          >
                            {e?.totals?.diamonds?.Amount !== 0 ?
                              formatAmount(
                                e?.totals?.diamonds?.Amount /
                                result?.header?.CurrencyExchRate
                              ) : "0.00"}
                          </div>
                        </div>
                      </div>

                      {/* Metal */}

                      <div className={duty ? "col4_pcls_duty d-flex flex-column justify-content-between bright_pcls" : "col4_pcls d-flex flex-column justify-content-between bright_pcls"}>
                        <div>
                          {mergedMetals
                            ?.slice()
                            ?.sort((a, b) => {
                              // 1. GroupJob match comes first
                              const aGroupJob = a?.StockBarcode === e?.GroupJob ? 1 : 0;
                              const bGroupJob = b?.StockBarcode === e?.GroupJob ? 1 : 0;

                              if (aGroupJob !== bGroupJob) {
                                return bGroupJob - aGroupJob;
                              }

                              // 2. Primary metal comes next
                              const aPrimary = a?.IsPrimaryMetal === 1 ? 1 : 0;
                              const bPrimary = b?.IsPrimaryMetal === 1 ? 1 : 0;

                              if (aPrimary !== bPrimary) {
                                return bPrimary - aPrimary;
                              }

                              return 0;
                            })
                            ?.map((el, imet) => {


                              console.log("TCL: mergeDiadetails -> el", el)

                              return (
                                <div className="d-flex w-100" style={{ alignItems: "flex-start" }} key={imet}>
                                  <div className="mcol1_pcls spbrWord start_center_pcls pdl_pcls">
                                    {el?.ShapeName} {el?.QualityName}
                                  </div>
                                  <div className="mcol2_pcls end_pcls pdr_pcls">
                                    {e?.GroupJob == "" ? el?.IsPrimaryMetal == 1 ? e?.grosswt?.toFixed(3) : "" : e?.GroupJob == el?.StockBarcode ? e?.grosswt?.toFixed(3) : ""}

                                    {/* {el?.IsPrimaryMetal == 1 ? e?.grosswt?.toFixed(3) : ""} */}
                                  </div>
                                  <div className="mcol3_pcls end_pcls pdr_pcls">
                                    {el?.IsPrimaryMetal == 1
                                      ? (
                                        el?.Weight - e?.LossWt
                                      )?.toFixed(3)
                                      : (el?.Wt)?.toFixed(3)}
                                  </div>
                                  <div className="mcol3_pcls end_pcls pdr_pcls">
                                    {(
                                      (Number(el?.Weight || 0) * Number(el?.SizeName || 0)) / 100
                                    ).toFixed(3)}
                                  </div>
                                  <div className="mcol3_pcls end_pcls pdr_pcls">
                                    {/* {el?.IsPrimaryMetal == 1 ? fixedValues(e?.LossWt, 3) : ""} */}
                                    {e?.LossWt > 0 && (
                                      <>
                                        {el?.IsPrimaryMetal == 1 ? e?.LossPer + "%" : ""} <br />
                                        {el?.IsPrimaryMetal == 1 ? e?.LossWt?.toFixed(3) : ""}
                                      </>
                                    )}


                                  </div>
                                  <div className="mcol4_pcls end_pcls pdr_pcls">
                                    {el?.Rate?.toFixed(2)}

                                  </div>
                                  <div className="mcol5_pcls end_pcls pdr_pcls fw-bold">
                                    {(el?.Amount / result?.header?.CurrencyExchRate)?.toFixed(2)}

                                  </div>
                                </div>
                              );

                            })}

                          {/* Finding */}



                          <div style={{ margin: "0px 2px" }}>
                            {mergedFindings?.map((data, index) => (

                              <React.Fragment key={index}>

                                <div style={{ display: "flex" }}>
                                  <div style={{ width: "15%" }}>
                                    <p className="spbrWord">
                                      {e?.GroupJob !== '' ? "FINDING ACCESSORIES" : data?.FindingTypename + " " + data?.QualityName}
                                    </p>
                                  </div>
                                  <div
                                    style={{
                                      width: "14.50%",
                                      display: "flex",
                                      justifyContent: "flex-end",
                                    }}
                                  >
                                    {/* <p>{data?.Wt?.toFixed(3)}</p> */}
                                  </div>
                                  <div
                                    style={{
                                      width: "18.50%",
                                      display: "flex",
                                      justifyContent: "flex-end",
                                    }}
                                  >
                                    <p>{data?.Wt?.toFixed(3)}</p>
                                  </div>
                                  <div
                                    style={{
                                      width: "18.50%",
                                      display: "flex",
                                      justifyContent: "flex-end",
                                    }}
                                  >
                                    <p>   {(
                                      (Number(data?.Wt || 0) * Number(data?.SizeName || 0)) / 100
                                    ).toFixed(3)}</p>
                                  </div>
                                  <div
                                    style={{
                                      width: "14.50%",
                                      display: "flex",
                                      justifyContent: "flex-end",
                                    }}
                                  >

                                  </div>
                                  <div
                                    style={{
                                      width: "22%",
                                      display: "flex",
                                      justifyContent: "flex-end",
                                    }}
                                  >
                                    <p>
                                      {e?.GroupJob !== ''
                                        ? e?.metal
                                          ?.filter((m) => m?.IsPrimaryMetal === 1)[0]
                                          ?.Rate?.toFixed(2)
                                        : data?.Rate?.toFixed(2)
                                      }
                                    </p>
                                  </div>
                                  <div
                                    style={{
                                      width: "19.50%",
                                      display: "flex",
                                      justifyContent: "flex-end",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    <p>
                                      {e?.GroupJob !== ''
                                        ? ((e?.metal
                                          ?.filter((m) => m?.IsPrimaryMetal === 1)[0]
                                          ?.Rate * (parseFloat(data?.Wt) || 0)) / result?.header?.CurrencyExchRate)?.toFixed(2)
                                        : (data?.Amount / result?.header?.CurrencyExchRate)?.toFixed(2)
                                      }
                                    </p>
                                  </div>
                                </div>

                              </React.Fragment>
                            ))}
                          </div>

                          {/* Loss */}
                          {/* {e?.LossWt !== 0 && (
                          <div className="d-flex w-100 pt-1">
                            <div className="mcol1_pcls start_center_pcls pdl_pcls" style={{ width: "15%" }}>
                              Loss
                            </div>
                            <div className="mcol2_pcls end_pcls pdr_pcls" style={{ width: "22%" }}>
                              {e?.LossPer?.toFixed(3)} %
                            </div>
                            <div className="mcol3_pcls end_pcls pdr_pcls">
                              {e?.LossWt?.toFixed(3)}
                            </div>
                            <div className="mcol4_pcls end_pcls pdr_pcls">
                              {e?.metal_rate?.toFixed(2)}
                            </div>
                            <div className="mcol5_pcls end_pcls pdr_pcls fw-bold">
                              {
                                e?.LossAmt?.toFixed(2) // / result?.header?.CurrencyExchRate 10/11/2025
                              }
                            </div>
                          </div>
                        )} */}

                          {/* Remark */}
                          {e?.JobRemark !== "" && (
                            <div className=" w-100 pt-2">
                              <div className="ps-1 start_center_pcls ">
                                Remark :
                              </div>
                              <div className="ps-1 fw-bold start_center_pcls ">
                                {e?.JobRemark}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Per Job Total */}
                        <div className="d-flex w-100 btop_pcls bg_pcls fw-bold">
                          <div className="mcol1_pcls ">&nbsp;</div>
                          <div className="mcol2_pcls end_pcls pdr_pcls">
                            {e?.grosswt !== 0 && e?.grosswt?.toFixed(3)}
                          </div>
                          <div className="mcol3_pcls end_pcls pdr_pcls">
                            {e?.NetWt !== 0 &&
                              (e?.NetWt)?.toFixed(3)}
                          </div>
                          <div className="mcol3_pcls end_pcls pdr_pcls">

                          </div>
                          <div className="mcol3_pcls end_pcls pdr_pcls">
                            {e?.LossWt !== 0 &&
                              (e?.LossWt)?.toFixed(3)}
                          </div>


                          <div
                            className="end_pcls pdr_pcls"
                            style={{ width: "36%" }}
                          >
                            {e?.totals?.metal?.Amount !== 0 &&
                              formatAmount(
                                (e?.totals?.metal?.Amount + e?.totals?.finding?.Amount) /
                                result?.header?.CurrencyExchRate
                              )}
                          </div>
                        </div>





                      </div>

                      <div className={duty ? "col5_pcls_duty d-flex flex-column justify-content-between bright_pcls" : "col5_pcls d-flex flex-column justify-content-between bright_pcls"}>
                        <div>
                          {colorstonedata?.map((el, ind) => {
                            return (
                              <div className="d-flex w-100" key={ind}>
                                <div className="dcol1_pcls spbrWord start_center_pcls pdl_pcls">
                                  {el?.IsSolGem === 1 ? "G:" : ""}
                                  {el?.ShapeName}
                                </div>

                                <div className="dcol3_pcls end_pcls pdr_pcls">
                                  {el?.Pcs}
                                </div>
                                <div className="dcol4_pcls end_pcls pdr_pcls">
                                  {el?.Wt?.toFixed(3)}
                                </div>
                                <div className="dcol5_pcls end_pcls pdr_pcls">
                                  {formatAmount(((el?.Amount / el?.Wt) / result?.header?.CurrencyExchRate)?.toFixed(2))}
                                  {/* {formatAmount((el?.Rate)?.toFixed(2))} */}
                                </div>
                                <div className="dcol6_pcls end_pcls pdr_pcls fw-bold">
                                  {formatAmount(
                                    el?.Amount / result?.header?.CurrencyExchRate
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {miscdata?.map((el, ind) => {

                            console.log("TCL: misc_0List", el)
                            return (
                              <div className="d-flex w-100" key={ind}>
                                <div className="dcol1_pcls spbrWord start_center_pcls pdl_pcls">
                                  {el?.ShapeName?.length !== 0 && "M : "}
                                  {el?.ShapeName}
                                </div>

                                <div className="dcol3_pcls end_pcls pdr_pcls">
                                  {el?.Pcs}
                                </div>
                                <div className="dcol4_pcls end_pcls pdr_pcls">
                                  {el?.Wt?.toFixed(3)}
                                </div>
                                <div className="dcol5_pcls end_pcls pdr_pcls 4567">
                                  {/* {formatAmount((el?.Amount/el?.Wt)?.toFixed(2))} */}
                                  {formatAmount(((el?.Amount / el?.Wt) / result?.header?.CurrencyExchRate)?.toFixed(2))}
                                  {/* {formatAmount((el?.Rate)?.toFixed(2))} */}
                                </div>
                                <div className="dcol6_pcls end_pcls pdr_pcls fw-bold">
                                  {formatAmount(
                                    el?.Amount / result?.header?.CurrencyExchRate
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="d-flex w-100 btop_pcls bg_pcls fw-bold">
                          <div className="dcol1_pcls">&nbsp;</div>

                          <div className="dcol3_pcls end_pcls pdr_pcls">
                            {e?.totals?.misc?.IsHSCODE_0_pcs +
                              e?.totals?.colorstone?.Pcs !==
                              0 &&
                              e?.totals?.misc?.IsHSCODE_0_pcs +
                              e?.totals?.colorstone?.Pcs}
                          </div>
                          <div className="dcol4_pcls end_pcls pdr_pcls">
                            {e?.totals?.misc?.IsHSCODE_0_wt +
                              e?.totals?.colorstone?.Wt !==
                              0 &&
                              (
                                e?.totals?.colorstone?.Wt +
                                e?.totals?.misc?.IsHSCODE_0_wt
                              )?.toFixed(3)}
                          </div>
                          <div
                            className="end_pcls pdr_pcls"
                            style={{ width: "52%" }}
                          >
                            {formatAmount(e?.totals?.misc?.IsHSCODE_0_amount + e?.totals?.colorstone?.Amount !== 0 &&
                              ((e?.totals?.misc?.IsHSCODE_0_amount + e?.totals?.colorstone?.Amount) / result?.header?.CurrencyExchRate)
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Labour & Other Charges */}
                      <div className={duty ? "col6_pcls_duty d-flex flex-column justify-content-between bright_pcls" : "col6_pcls d-flex flex-column justify-content-between bright_pcls"}>
                        <div>
                          {e?.GroupJob !== "" ? (
                            result?.labour?.filter((el) => el?.GroupjobNo === e?.GroupJob)?.map((el) => (
                              <div className="d-flex w-100">
                                <div className="lcol1_pcls start_center_pcls pdl_pcls">
                                  {el?.name}
                                </div>
                                <div className="lcol1_pcls end_pcls pdr_pcls">
                                  {formatAmount(el?.MakingUnit)}
                                </div>
                                <div className="lcol1_pcls end_pcls pdr_pcls">
                                  {formatAmount(el?.MakingCharge / result?.header?.CurrencyExchRate, 2)}
                                </div>
                              </div>
                            ))
                          ) : (
                            e?.MaKingCharge_Unit !== 0 && (
                              // <div className="d-flex w-100">
                              //   <div className="lcol1_pcls start_center_pcls pdl_pcls">
                              //     Labour
                              //   </div>
                              //   <div className="lcol1_pcls end_pcls pdr_pcls">
                              //     {formatAmount(e?.MaKingCharge_Unit)}
                              //   </div>
                              //   <div className="lcol1_pcls end_pcls pdr_pcls">
                              //     {/* {formatAmount(e?.MaKingCharge_Unit * e?.totals?.metal?.Wt ,2)} */}
                              //     {formatAmount(e?.MakingAmount / result?.header?.CurrencyExchRate, 2)}
                              //     {/* {e?.MakingChargeOnid==4 ? formatAmount(e?.MaKingCharge_Unit) : formatAmount(e?.MaKingCharge_Unit * e?.totals?.metal?.Wt ,2)} */}
                              //   </div>
                              // </div>
                              labourRows.map((row, idx) => (
                                <div className="d-flex w-100" key={idx}>
                                  <div className="lcol1_pcls start_center_pcls pdl_pcls">
                                    Labour
                                  </div>
                                  <div className="lcol1_pcls end_pcls pdr_pcls">
                                    {formatAmount(row.rate)}
                                  </div>
                                  <div className="lcol1_pcls end_pcls pdr_pcls">
                                    {formatAmount(row.amount / result?.header?.CurrencyExchRate, 2)}
                                  </div>
                                </div>
                              ))
                            )
                          )}

                          {e?.other_details_array?.map((ele, inds) => {
                            return (
                              <div className="d-flex w-100" key={inds}>
                                <div className="w-75 spbrWord start_center_pcls pdl_pcls text-break">
                                  {ele?.label}
                                </div>
                                <div className="w-25 end_pcls pdr_pcls">
                                  {ele?.value}
                                </div>
                              </div>
                            );
                          })}
                          {e?.misc_1List?.map((ele, inds) => {
                            return (
                              <>
                                {ele?.Amount !== 0 && (
                                  <div className="d-flex w-100" key={inds}>
                                    <div className="w-50 spbrWord start_center_pcls pdl_pcls text-break">
                                      {ele?.ShapeName}
                                    </div>
                                    <div className="w-50 end_pcls pdr_pcls">
                                      {formatAmount(
                                        ele?.Amount /
                                        result?.header?.CurrencyExchRate
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })}
                          {e?.misc_2List?.map((ele, inds) => {
                            return (
                              <>
                                {ele?.Amount !== 0 && (
                                  <div className="d-flex w-100" key={inds}>
                                    <div className="w-50 spbrWord start_center_pcls pdl_pcls text-break">
                                      {ele?.ShapeName}
                                    </div>
                                    <div className="w-50 end_pcls pdr_pcls">
                                      {formatAmount(
                                        ele?.Amount /
                                        result?.header?.CurrencyExchRate
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })}
                          {e?.misc_3List?.map((ele, inds) => {
                            return (
                              <>
                                {ele?.Amount !== 0 && (
                                  <div className="d-flex w-100" key={inds}>
                                    <div className="w-50 spbrWord start_center_pcls pdl_pcls text-break">
                                      {ele?.ShapeName}
                                    </div>
                                    <div className="w-50 end_pcls pdr_pcls">
                                      {formatAmount(
                                        ele?.Amount /
                                        result?.header?.CurrencyExchRate
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })}
                          {e?.totals?.diamonds?.SettingAmount +
                            e?.totals?.colorstone?.SettingAmount !==
                            0 && (
                              <div className="d-flex w-100">
                                <div className="w-50 start_center_pcls pdl_pcls text-break">
                                  Setting
                                </div>
                                <div className="w-50 end_pcls pdr_pcls">
                                  {formatAmount(
                                    (e?.totals?.diamonds?.SettingAmount +
                                      e?.totals?.colorstone?.SettingAmount) /
                                    result?.header?.CurrencyExchRate
                                  )}
                                </div>
                              </div>
                            )}
                          {e?.totals?.finding?.SettingAmount !== 0 && (
                            <div className="d-flex w-100">
                              <div className="lcol1_pcls start_center_pcls pdl_pcls text-break">
                                Labour
                              </div>
                              <div className="lcol1_pcls end_pcls pdr_pcls text-break">
                                {formatAmount(e?.totals?.finding?.SettingRate)}
                              </div>
                              <div className="lcol1_pcls end_pcls pdr_pcls">
                                {formatAmount(
                                  e?.totals?.finding?.SettingAmount /
                                  result?.header?.CurrencyExchRate
                                )}
                              </div>
                            </div>
                          )}

                          {e?.TotalDiamondHandling !== 0 && (
                            <div className="d-flex w-100">
                              <div className="w-50 start_center_pcls pdl_pcls">
                                Handling
                              </div>
                              <div className="w-50 end_pcls pdr_pcls">
                                {formatAmount(
                                  e?.TotalDiamondHandling /
                                  result?.header?.CurrencyExchRate
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="d-flex w-100 btop_pcls bg_pcls fw-bold">
                          <div className="w-100 end_pcls pdr_pcls">
                            &nbsp;
                            {extraCharge !== 0 && formatAmount(finalAmount)}
                          </div>
                        </div>
                      </div>

                      {duty && (
                        <div className="col65_pcls   d-flex flex-column justify-content-between bright_pcls">
                          <div className="start_pcls pdr_pcls fw-bold">
                            {formatAmount(
                              // e?.TotalAmount / result?.header?.CurrencyExchRate
                              e?.CustomDuty_Amount
                            )}
                          </div>
                          <div className="start_pcls btop_pcls bg_pcls pdr_pcls fw-bold">
                            &nbsp;
                            {formatAmount(
                              // e?.TotalAmount / result?.header?.CurrencyExchRate
                              e?.CustomDuty_Amount
                            )}
                          </div>
                        </div>
                      )}



                      {/* Total Amount */}
                      <div className={duty ? "col7_pcls_duty   d-flex flex-column justify-content-between" : "col7_pcls   d-flex flex-column justify-content-between"}>
                        <div className="start_pcls pdr_pcls fw-bold">
                          {formatAmount(
                            // e?.TotalAmount / result?.header?.CurrencyExchRate
                            (e?.UnitCost + e?.CustomDuty_Amount) / result?.header?.CurrencyExchRate
                          )}
                        </div>
                        <div className="start_pcls btop_pcls bg_pcls pdr_pcls fw-bold">
                          &nbsp;
                          {formatAmount(
                            // e?.TotalAmount / result?.header?.CurrencyExchRate
                            (e?.UnitCost + e?.CustomDuty_Amount) / result?.header?.CurrencyExchRate
                          )}
                        </div>
                      </div>


                    </div>

                    {e?.DiscountAmt > 0 && (
                      <div
                        className="d-flex thead_pcls bbottom_pcls tb_fs_pcls"
                        style={{
                          borderBottom: "1px solid black",
                          borderLeft: "1px solid black",
                          borderRight: "1px solid black",
                        }}
                      >
                        <div className="col1_pcls bright_pcls"></div>
                        <div className={duty ? "col2_pcls_duty centerall_pcls  bright_pcls" : "col2_pcls centerall_pcls  bright_pcls"}>

                        </div>
                        <div className={duty ? "col3_pcls_duty" : "col3_pcls bright_pcls"}>

                        </div>
                        <div className={duty ? "col4_pcls_duty" : "col4_pcls bright_pcls"}>
                          <div className="d-flex w-100">

                          </div>
                        </div>
                        <div className={duty ? "col5_pcls_duty" : "col5_pcls  bright_pcls"} style={{ wordBreak: "break-word" }}>

                          Discount {discountDisplay || `${NumberWithCommas(e?.Discount / result?.header?.CurrencyExchRate, 2)} @ Total Amount`}
                        </div>
                        <div style={{ textAlign: "right" }} className={duty ? "col6_pcls_duty" : "col6_pcls bright_pcls"}>
                          {(NumberWithCommas(e?.DiscountAmt / result?.header?.CurrencyExchRate, 2))}
                        </div>
                        {duty && (
                          <div className="col65_pcls end_pcls pdr_pcls bright_pcls">
                            {formatAmount(
                              TotalDuty, 2
                            )}
                          </div>
                        )}
                        <div className={duty ? "col7_pcls_duty  end_pcls" : "col7_pcls end_pcls pdr_pcls"}>
                          {formatAmount(
                            (result?.mainTotal?.TotalAmount) /
                            result?.header?.CurrencyExchRate
                          )}
                        </div>
                      </div>
                    )}

                  </>
                );
              })}

              {/* main total */}
              <div
                className="d-flex thead_pcls bbottom_pcls tb_fs_pcls"
                style={{
                  borderBottom: "1px solid black",
                  borderLeft: "1px solid black",
                  borderRight: "1px solid black",
                }}
              >
                <div className="col1_pcls bright_pcls"></div>
                <div className={duty ? "col2_pcls_duty centerall_pcls  bright_pcls" : "col2_pcls centerall_pcls  bright_pcls"}>
                  Total
                </div>
                <div className={duty ? "col3_pcls_duty" : "col3_pcls bright_pcls"}>
                  <div className="d-flex w-100">
                    <div className="dcol1_pcls centerall_pcls "></div>

                    <div className="dcol3_pcls end_pcls pdr_pcls " style={{ width: "15%" }}>
                      {result?.mainTotal?.diamonds?.Pcs}
                    </div>
                    <div className="dcol4_pcls end_pcls pdr_pcls " style={{ width: "17%" }}>
                      {result?.mainTotal?.diamonds?.Wt?.toFixed(3)}
                    </div>
                    <div
                      className="dcol6_pcls end_pcls pdr_pcls"
                      style={{ width: "53%" }}
                    >
                      {formatAmount(
                        result?.mainTotal?.diamonds?.Amount /
                        result?.header?.CurrencyExchRate
                      )}
                    </div>
                  </div>
                </div>
                <div className={duty ? "col4_pcls_duty" : "col4_pcls bright_pcls"}>
                  <div className="d-flex w-100">
                    <div className="mcol1_pcls  "></div>
                    <div className="mcol2_pcls end_pcls pdr_pcls ">
                      {result?.mainTotal?.grosswt?.toFixed(3)}
                    </div>
                    <div className="mcol3_pcls end_pcls pdr_pcls ">
                      {(
                        result?.mainTotal?.NetWt
                      )?.toFixed(3)}
                    </div>
                    <div className="mcol3_pcls end_pcls pdr_pcls ">

                    </div>
                    <div className="mcol3_pcls end_pcls pdr_pcls ">
                      {(
                        result?.mainTotal?.LossWt
                      )?.toFixed(3)}
                    </div>
                    <div className="end_pcls pdr_pcls" style={{ width: "36%" }}>
                      {formatAmount(
                        (result?.mainTotal?.metal?.Amount + result?.mainTotal?.finding?.Amount) /
                        result?.header?.CurrencyExchRate
                      )}
                    </div>
                  </div>
                </div>
                <div className={duty ? "col5_pcls_duty" : "col5_pcls  bright_pcls"}>
                  <div className="d-flex w-100">
                    <div className="dcol1_pcls centerall_pcls "></div>

                    <div className="dcol3_pcls end_pcls pdr_pcls " style={{ width: "13%" }}>
                      {result?.mainTotal?.colorstone?.Pcs +
                        result?.mainTotal?.misc?.IsHSCODE_0_pcs}
                    </div>
                    <div className="dcol4_pcls end_pcls pdr_pcls  " style={{ width: "17%" }}>
                      {(
                        result?.mainTotal?.colorstone?.Wt +
                        result?.mainTotal?.misc?.IsHSCODE_0_wt
                      )?.toFixed(3)}
                    </div>
                    <div
                      className=" end_pcls pdr_pcls"
                      style={{ width: "55%" }}
                    >
                      {formatAmount(
                        (result?.mainTotal?.misc?.IsHSCODE_0_amount +
                          result?.mainTotal?.colorstone?.Amount) /
                        result?.header?.CurrencyExchRate
                      )}
                    </div>
                  </div>
                </div>
                <div className={duty ? "col6_pcls_duty" : "col6_pcls bright_pcls"}>
                  <div className="d-flex w-100">
                    <div className="w-100 end_pcls pdr_pcls">
                      {formatAmount(
                        // (
                        //   (result?.mainTotal?.OtherCharges || 0) +
                        //   (result?.mainTotal?.TotalDiamondHandling || 0) +
                        //   (result?.mainTotal?.diamonds?.SettingAmount || 0) +
                        //   (result?.mainTotal?.colorstone?.SettingAmount || 0) +
                        //   (result?.mainTotal?.finding?.SettingAmount || 0) +
                        //   (totalMakingAmount || 0) +
                        //   (result?.mainTotal?.misc?.IsHSCODE_1_amount || 0) +
                        //   (result?.mainTotal?.misc?.IsHSCODE_2_amount || 0) +
                        //   (result?.mainTotal?.misc?.IsHSCODE_3_amount || 0)
                        // ) / (result?.header?.CurrencyExchRate || 1)
                        GrandfinalAmount
                      )}
                    </div>
                  </div>
                </div>
                {duty && (
                  <div className="col65_pcls end_pcls pdr_pcls bright_pcls">
                    {formatAmount(
                      TotalDuty, 2
                    )}
                  </div>
                )}
                <div className={duty ? "col7_pcls_duty  end_pcls" : "col7_pcls end_pcls pdr_pcls"}>
                  {formatAmount(
                    (result?.mainTotal?.TotalAmount +
                      result?.mainTotal?.DiscountAmt) /
                    result?.header?.CurrencyExchRate
                  )}
                </div>
              </div>

              {/* taxes and grand total */}
              <div
                className="d-flex tb_fs_pcls justify-content-end "
                style={{
                  borderBottom: "1px solid black",
                  borderLeft: "1px solid black",
                  borderRight: "1px solid black",
                }}
              >
                <div style={{ width: "85.5%" }}>
                  {result?.header?.PrintRemark && (
                    <>
                      <b>Remarks: </b>
                      <span dangerouslySetInnerHTML={{ __html: result?.header?.PrintRemark }} />
                    </>
                  )}
                </div>
                <div style={{ width: "14%" }}>
                  {result?.mainTotal?.DiscountAmt !== 0 && (
                    <div className="w-100 d-flex align-items-center tb_fs_pcls">
                      <div
                        style={{ width: "50%" }}
                        className="end_pcls pdr_pcls"
                      >
                        Total Discount
                      </div>
                      <div
                        style={{ width: "50%" }}
                        className="end_pcls pdr_pcls"
                      >
                        {formatAmount(
                          result?.mainTotal?.DiscountAmt /
                          result?.header?.CurrencyExchRate
                        )}
                      </div>
                    </div>
                  )}
                  <div className="w-100 d-flex align-items-center tb_fs_pcls">
                    <div style={{ width: "50%" }} className="end_pcls pdr_pcls">
                      Total Amount
                    </div>
                    <div style={{ width: "50%" }} className="end_pcls pdr_pcls">
                      {formatAmount(
                        result?.mainTotal?.TotalAmount /
                        result?.header?.CurrencyExchRate
                      )}
                    </div>
                  </div>
                  {result?.allTaxes?.map((e, i) => {
                    return (
                      <div
                        className="w-100 d-flex align-items-center tb_fs_pcls"
                        key={i}
                      >
                        <div
                          style={{ width: "50%" }}
                          className="end_pcls pdr_pcls"
                        >
                          {e?.name} @ {e?.per}
                        </div>
                        <div
                          style={{ width: "50%" }}
                          className="end_pcls pdr_pcls"
                        >
                          {formatAmount(e?.amount)}
                        </div>
                      </div>
                    );
                  })}
                  <div className="w-100 d-flex align-items-center tb_fs_pcls">
                    <div style={{ width: "50%" }} className="end_pcls pdr_pcls">
                      {result?.header?.AddLess > 0 ? "Add" : result?.header?.AddLess < 0 ? "Less" : ""}
                    </div>
                    <div style={{ width: "50%" }} className="end_pcls pdr_pcls">
                      {result?.header?.AddLess !== 0 &&
                        formatAmount(result?.header?.AddLess / result?.header?.CurrencyExchRate
                        )}
                    </div>
                  </div>
                  {result?.header?.FreightCharges !== 0 && (
                    <div className="w-100 d-flex align-items-center tb_fs_pcls">
                      <div
                        style={{ width: "50%" }}
                        className="end_pcls pdr_pcls"
                      >
                        {result?.header?.ModeOfDel}
                      </div>
                      <div
                        style={{ width: "50%" }}
                        className="end_pcls pdr_pcls"
                      >
                        {result?.header?.FreightCharges !== 0 &&
                          formatAmount(result?.header?.FreightCharges / result?.header?.CurrencyExchRate
                          )}
                      </div>
                    </div>
                  )}
                  <div className="w-100 d-flex align-items-center tb_fs_pcls fw-bold">
                    <div style={{ width: "50%" }} className="end_pcls pdr_pcls">
                      Final Amount
                    </div>
                    <div style={{ width: "50%" }} className="end_pcls pdr_pcls">
                      {formatAmount(
                        (result?.mainTotal?.TotalAmount +
                          result?.header?.AddLess +
                          result?.header?.FreightCharges) /
                        result?.header?.CurrencyExchRate +
                        result?.allTaxesTotal
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            {companyDetail && (
              <div className="SpBrders pt-1">
                <div className="d-flex w-100 recordDetailPrint1 detailPrint1L_font_11">
                  <div className="col-4 pe-1">
                    <p className="border-start fw-bold text-center border-bottom w-100 border-end border-top lightGrey">
                      SUMMARY
                    </p>
                    <div className="d-flex border-end">
                      {/* Weights */}
                      <div className="border-start col-6 border-end SpacAtTp position-relative summaryPadBotDetailPrint1 d-flex flex-column">
                        {/* <div className="d-flex justify-content-between">
                        <p className="fw-bold px-1">GOLD IN 24KT</p>
                        <p className="px-1">
                       
                          {`${fixedValues(result?.mainTotal?.total_purenetwt - notGoldMetalWtTotal, 3)} gm`}
                        </p>
                      </div> */}
                        {/* {Multimetal_summary?.map((e, i) => {
                        return (

                          <div className="d-flex justify-content-between">
                            <p className="fw-bold px-1">{e?.ShapeName}</p>
                            <p className="px-1">
                              {fixedValues(e?.TotalWt, 3)} gm
                            </p>
                          </div>
                        )
                      })} */}
                        {/* {
                        MetShpWise?.map((e, i) => {
                          return <div className="d-flex justify-content-between" key={i}>
                            <p className="fw-bold px-1">{e?.ShapeName}</p>
                            <p className="px-1"> {fixedValues(e?.metalfinewt, 3)} gm </p>
                          </div>
                        })
                      } */}
                        {
                          MetalData?.map((e, i) => {
                            return <div className="d-flex justify-content-between" key={i}>
                              <p className="fw-bold px-1">FINE {e?.ShapeName}</p>
                              <p className="px-1"> {fixedValues(e?.TotalPureWt, 3)} gm </p>
                            </div>
                          })
                        }
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold px-1">GROSS WT</p>
                          <p className="px-1">
                            {fixedValues(result?.mainTotal?.grosswt, 3)} gm
                          </p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold px-1">*(G+D) WT</p>
                          <p className="px-1">
                            {NumberWithCommas(result?.mainTotal?.NetWt + (result?.mainTotal?.diamonds?.Wt / 5), 3)} gm
                          </p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold px-1">NET WT</p>
                          {/* <p className="px-1"> {fixedValues(result?.mainTotal?.metal?.IsPrimaryMetalWt, 3)} gm</p> */}
                          <p className="px-1"> {fixedValues(result?.mainTotal?.NetWt, 3)} gm</p>

                        </div>
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold px-1">DIAMOND WT</p>
                          <p className="px-1">
                            {NumberWithCommas(result?.mainTotal?.diamonds?.Pcs - result?.mainTotal?.solitaire?.Pcs, 0)} / {NumberWithCommas(result?.mainTotal?.diamonds?.Wt - result?.mainTotal?.solitaire?.Wt, 3)} cts
                          </p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold px-1">SOLITAIRE WT</p>
                          <p className="px-1">
                            {NumberWithCommas(result?.mainTotal?.solitaire?.Pcs, 0)} / {NumberWithCommas(result?.mainTotal?.solitaire?.Wt, 3)} cts
                          </p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold px-1">STONE WT</p>
                          <p className="px-1">
                            {NumberWithCommas(result?.mainTotal?.colorstone?.Pcs - result?.mainTotal?.gemstone?.Pcs, 0)} / {NumberWithCommas(result?.mainTotal?.colorstone?.Wt - result?.mainTotal?.gemstone?.Wt, 3)} cts

                          </p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold px-1">GEMSTONE WT</p>
                          <p className="px-1">
                            {NumberWithCommas(result?.mainTotal?.gemstone?.Pcs, 0)} / {NumberWithCommas(result?.mainTotal?.gemstone?.Wt, 3)} cts
                          </p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold px-1">MISC WT</p>
                          <p className="px-1">
                            {NumberWithCommas(result?.mainTotal?.misc?.Pcs, 0)} / {NumberWithCommas(result?.mainTotal?.misc?.Wt, 3)} cts
                          </p>
                        </div>
                        {result?.header?.Privilege_discount !== 0 && (
                          <div className="d-flex justify-content-between">
                            <p className="fw-bold px-1">Privilege Discount</p>
                            <p className="px-1">- {result?.header?.Privilege_discount}</p>
                          </div>
                        )}
                        <div className="d-flex justify-content-between border-top  position-absolute w-100 border-bottom bottom-0 totalLineDetailPrint1 lightGrey">
                          <p className="fw-bold px-1"> </p>
                          <p className="px-1"> </p>
                        </div>
                      </div>

                      {/* Amounts */}
                      <div className="col-6 position-relative SpacAtTp summaryPadBotDetailPrint1 d-flex flex-column">
                        {/* <div className="d-flex justify-content-between">
                        <p className="fw-bold px-1">GOLD</p>
                        <p className="px-1">
                          {" "}
                          {NumberWithCommas((result?.mainTotal?.MetalAmount - notGoldMetalTotal), 2)}
                        </p>
                      </div> */}
                        {/* {Multimetal_summary?.map((e, i) => {
                        return (
                          <div key={i} className="d-flex justify-content-between">
                            <p className="fw-bold px-1">{e?.ShapeName}</p>
                            <p className="px-1">
                              {" "}
                              {NumberWithCommas(e?.TotalAmount, 2)}
                            </p>
                          </div>
                        )
                      })} */}

                        {MetalData?.map((e, i) => {
                          return (
                            <div key={i} className="d-flex justify-content-between">
                              <p className="fw-bold px-1">{e?.ShapeName}</p>
                              <p className="px-1">
                                {" "}
                                {NumberWithCommas(e?.TotalAmount, 2)}
                              </p>
                            </div>
                          )
                        })}



                        {/* {
                        MetShpWise?.map((e, i) => {
                          return <div className="d-flex justify-content-between">
                            <React.Fragment key={i}><p className="fw-bold px-1">{e?.ShapeName}</p>
                              <p className="px-1">
                                {" "}
                                {NumberWithCommas(e?.Amount, 2)}
                              </p>
                            </React.Fragment>
                          </div>
                        })
                      } */}
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold px-1">DIAMOND</p>
                          <p className="px-1">
                            {" "}
                            {NumberWithCommas(result?.mainTotal?.diamonds?.Amount - result?.mainTotal?.solitaire?.Amount, 2)}
                          </p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold px-1">SOLITAIRE</p>
                          <p className="px-1">
                            {" "}
                            {NumberWithCommas(result?.mainTotal?.solitaire?.Amount, 2)}
                          </p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold px-1">CST</p>
                          <p className="px-1">
                            {NumberWithCommas(result?.mainTotal?.colorstone?.Amount - result?.mainTotal?.gemstone?.Amount, 2)}
                          </p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold px-1">GEMSTONE</p>
                          <p className="px-1">
                            {" "}
                            {NumberWithCommas(result?.mainTotal?.gemstone?.Amount, 2)}
                          </p>
                        </div>

                        <div className="d-flex justify-content-between">
                          <p className="fw-bold px-1">MISC</p>
                          <p className="px-1">
                            {" "}
                            {/* {NumberWithCommas(result?.mainTotal?.miscChargesTotals, 2)} */}
                            {NumberWithCommas(result?.mainTotal?.misc?.Amount, 2)}
                          </p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold px-1">MAKING</p>
                          <p className="px-1">
                            {" "}
                            {/* {NumberWithCommas(summary?.makingAmount, 2)} */}
                            {/* {NumberWithCommas(total?.labourAmount, 2)}
                                       */}
                            {NumberWithCommas(totalMakingAmount, 2)}
                          </p>
                        </div>

                        <div className="d-flex justify-content-between">
                          <p className="fw-bold px-1">OTHER</p>
                          <p className="px-1">
                            {" "}
                            {/* {NumberWithCommas(result?.mainTotal?.miscChargesTotals, 2)} */}
                            {NumberWithCommas(result?.mainTotal?.OtherCharges, 2)}
                          </p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold px-1">LESS</p>
                          <p className="px-1">
                            {" "}
                            {NumberWithCommas(result?.header?.AddLess, 2)}
                          </p>
                        </div>
                        <div className="d-flex justify-content-between border-top  position-absolute w-100 border-bottom  bottom-0 totalLineDetailPrint1 lightGrey">
                          <p className="fw-bold px-1 pt-1">TOTAL</p>
                          <p className="px-1 pt-1">
                            {/* {NumberWithCommas(total?.withDiscountTaxAmount, 2)} */}
                            {NumberWithCommas(
                              (result?.mainTotal?.TotalAmount +
                                result?.header?.AddLess +
                                result?.header?.FreightCharges) /
                              result?.header?.CurrencyExchRate +
                              result?.allTaxesTotal,
                              2
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Diamond Details */}
                  <div className="col-2 pe-1">
                    <div className={`border-end border-start border-top ${diamondDetails?.length === 1 && `d-flex flex-column justify-content-between h-100`}`}>
                      <p className="fw-bold text-center border-bottom w-100 lightGrey">
                        Diamond Detail
                      </p>
                      <div className="d-flex flex-column justify-content-start h-100">
                        {diamondDetails?.map((e, i) => {
                          return e?.Wt !== undefined && <React.Fragment key={i}>
                            <div className={`d-flex justify-content-between px-1 align-items-center ${i === 0 && "pt-1"}`}>
                              <p className="fw-bold">{e?.ShapeName === "OTHER" ? e?.ShapeName : <>{e?.ShapeName} {e?.QualityName} {e?.Colorname}</>}</p>
                              <p>
                                {NumberWithCommas(e?.Pcs, 0)}/{NumberWithCommas(e?.Wt, 3)} Cts
                              </p>
                            </div>
                          </React.Fragment>
                        })}
                      </div>

                      <div className="d-flex justify-content-between border-top  w-100 border-bottom totalLineDetailPrint1 lightGrey">
                        <p className="fw-bold p-1"></p>
                        <p className="p-1"></p>
                      </div>
                    </div>
                  </div>

                  {/* Other Details */}
                  <div className="col-2 pe-1">
                    <div className="border-bottom  border-top">
                      <p className="fw-bold text-center border-start border-end border-bottom  w-100 border-start lightGrey">
                        OTHER DETAILS
                      </p>
                      {Brokerage?.map((e, i) => {
                        const key = Object.keys(e)[0];
                        const value = e[key];
                        return (
                          <div
                            className="d-flex border-start border-end "
                            style={{ lineHeight: "1", padding: "0px 5px" }}
                            key={i}
                          >
                            <div className="col-6">
                              <p className="fw-bold " style={{ textTransform: "uppercase" }}>{key}</p>
                            </div>
                            <div className="col-6">
                              <p className="text-end">{NumberWithCommas(value, 2)}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div className="d-flex border-start border-end " style={{ lineHeight: "1", padding: "0px 5px" }}>
                        <div className="col-6">
                          <p className="fw-bold">RATE IN 24KT</p>
                        </div>
                        <div className="col-6">
                          <p className="text-end">
                            {NumberWithCommas(result?.header?.MetalRate24K, 2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>



                  {/* Signature */}
                  <div className="col-4">
                    <div className="d-flex  border-start border-end border-bottom createdByDetailPrint1 border-top">
                      <div className="col-6 border-end  d-flex align-items-end justify-content-center">
                        <i> Created By</i>
                      </div>
                      <div className="col-6 d-flex align-items-end justify-content-center">
                        <i> Checked By</i>
                      </div>
                    </div>
                  </div>
                </div>

                {result?.header?.SalesRepPolicyTermsDescription !== "" ? (
                  <div className="w-100 FntdtInst spbrWord SpacForInst">
                    <p className="fw-bold FntForInst">TERMS INCLUDED: </p>
                    {
                      <div
                        dangerouslySetInnerHTML={{
                          __html: result?.header?.SalesRepPolicyTermsDescription,
                        }}
                        className="spbrWord SpacForInstExt"
                      />
                    }
                  </div>
                ) : ("")}
              </div>

            )}




          </div>
        </div>
      ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
          {" "}{msg}{" "}
        </p>
      )}
    </>
  );
};

export default PackingList3;
