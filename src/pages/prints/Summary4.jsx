// http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=SlMvNzUvMjAtMjU=&evn=c2FsZQ==&pnm=U3VtbWFyeSA0&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=Summary4&pid=undefined
import React, { useEffect, useState } from "react";
import "../../assets/css/prints/summary4.css";
import {
  apiCall,
  handleImageError,
  handlePrint,
  isObjectEmpty,
  taxGenrator,
  fixedValues,
  NumberWithCommas,
  checkMsg,
  formatAmount,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";

const Summary4 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  const [jsonData, setJsonData] = useState({});
  const [billPrintJson, setBillprintJson] = useState({});
  const [BillPrintJson1, setBillPrintJson1] = useState([]);
  const [summaryDetail, setSummaryDetail] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [total, setTotal] = useState({
    diaWt: 0,
    diaRate: 0,
    diaAmt: 0,
    gwt: 0,
    nwt: 0,
    otherAmt: 0,
    csWt: 0,
    csRate: 0,
    csAmt: 0,
    goldFine: 0,
    goldAmt: 0,
    amount: 0,
    gold24Kt: 0,
    afterTaxAmt: 0,
    MakingAmount: 0,
  });
  const [header, setHeader] = useState(true);
  const [makingColumShow, setMakingColumShow] = useState(false);
  const [image, setimage] = useState(true);
  const [summary, setSummary] = useState(false);
  const [metalType, setMetaltype] = useState([]);
  const [result, setResult] = useState(null);
  const [MetShpWise, setMetShpWise] = useState([]);
  const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
  const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);

  const [totalSummary, setTotalSummary] = useState({
    gold24Kt: 0,
    gDWt: 0,
    diamondpcs: 0,
    colorStonePcs: 0,
    makingAmount: 0,
  });
  const [metaltypeSum, setMetaltypeSum] = useState({
    grosswt: 0,
    NetWt: 0,
    pureWt: 0,
    MetalAmount: 0,
    fineWt: 0,
  });
  const [lastDiamondTable, setLastDiamondTable] = useState([]);
  const [lastColorStoneTable, setLastColorStoneTable] = useState([]);
  const [lastDiamondTableTotal, setLastDiamondTableTotal] = useState({
    diaCtw: 0,
    diamondAmount: 0,
  });
  const [lastColorStoneTableTotal, setLastColorStoneTableTotal] = useState({
    clrCtw: 0,
    colorStoneAmount: 0,
  });
  const [loader, setLoader] = useState(true);
  const [msg, setMsg] = useState("");
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  const findMaterialWise = (findElement, elementNo, arr) => {
    let resultArr = arr.filter((e, i) => {
      return e[findElement] === elementNo;
    });
    return resultArr;
  };

  const findMaterial = (serialJobNo, json2Arr) => {
    let findArr = findMaterialWise("StockBarcode", serialJobNo, json2Arr);
    return findArr;
  };

  const findKeyValuePair = (array, firstName, secondName) => {
    const counts = {};
    array.forEach((item) => {
      const key = `${item[firstName]} | ${item[secondName]}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  };

  const countCategorySubCategory = (data) => {
    let countArr = findKeyValuePair(data, "Categoryname", "SubCategoryname");
    Object.keys(countArr).forEach((key) => {
      const [category, subcategory] = key.split("|");
      if (!subcategory) {
        delete countArr[category];
      }
    });

    const countsArray = Object.entries(countArr)
      .filter(([key, value]) => key.includes("|")) // Filter out single category entries
      .map(([key, value]) => ({ name: key, value }));

    setSummaryDetail(countsArray);
  };

  // const countDiamondRate = (materialId, arr) => {
  //   let findArr = findMaterialWise(
  //     "MasterManagement_DiamondStoneTypeid",
  //     materialId,
  //     arr
  //   );
  //   const rateSumMap = {};
  //   findArr.forEach((item) => {
  //     const { Rate, Wt, Amount } = item;
  //     if (!rateSumMap[Rate]) {
  //       rateSumMap[Rate] = {
  //         totalWeight: 0,
  //         totalAmount: 0,
  //       };
  //     }
  //     rateSumMap[Rate].totalWeight += Wt;
  //     rateSumMap[Rate].totalAmount += Amount;
  //   });

  //   const result = Object.keys(rateSumMap).map((rate) => ({
  //     rate: rate,
  //     totalWeight: rateSumMap[rate].totalWeight.toFixed(3),
  //     totalAmount: rateSumMap[rate].totalAmount.toFixed(3),
  //   }));
  //   return result;
  // };

  const countDiamondRate = (materialId, arr) => {
    let findArr = findMaterialWise(
      "MasterManagement_DiamondStoneTypeid",
      materialId,
      arr
    );
  
    const rateSumMap = {};
  
    findArr.forEach((item) => {
      const { Rate, Wt, Amount, IsSolGem } = item;
  
      const key = `${Rate}_${IsSolGem}`;
  
      if (!rateSumMap[key]) {
        rateSumMap[key] = {
          Rate,
          IsSolGem,
          totalWeight: 0,
          totalAmount: 0,
        };
      }
  
      rateSumMap[key].totalWeight += Number(Wt || 0);
      rateSumMap[key].totalAmount += Number(Amount || 0);
    });
  
    return Object.values(rateSumMap);
  };
  

  const countTotalAmount = (arr) => {
    const totalSum = arr.reduce(
      (sum, item) => sum + item.Amount + item.SettingAmount,
      0
    );
    return totalSum;
  };

  const countTotal = (arr, taxJson) => {
    let resultObj = { ...total };
    arr.forEach((e, i) => {
      if (e?.diamondsRate.length > 0) {
        e?.diamondsRate.forEach((ele, ind) => {
          resultObj.diaRate += +ele.rate;
          resultObj.diaWt += +ele.totalWeight;
          resultObj.diaAmt += +ele.totalAmount;
        });
      }
      if (e?.colorStoneRate.length > 0) {
        e?.colorStoneRate.forEach((ele, ind) => {
          resultObj.csRate += +ele.rate;
          resultObj.csWt += +ele.totalWeight;
          resultObj.csAmt += +ele.totalAmount;
        });
      }
      resultObj.gwt += e?.grosswt;
      resultObj.nwt += e?.NetWt;
      resultObj.otherAmt +=
        e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling;
      resultObj.goldFine += e?.convertednetwt;
      resultObj.goldAmt += e?.MetalAmount;
      resultObj.amount += +e?.TotalAmount;
    });
    resultObj.diaWt = +resultObj.diaWt.toFixed(3);
    // resultObj.afterTaxAmt = Math.round(resultObj.amount + sgstMinus + cgstMinus + igstMinus - Math.abs(taxJson?.AddLess));

    let taxValue = taxGenrator(taxJson, resultObj.amount);
    console.log("taxJson", taxJson);

    setTaxes(taxValue);
    taxValue.forEach((e, i) => {
      resultObj.afterTaxAmt += +e?.amount;
    });
    resultObj.afterTaxAmt += resultObj.amount + taxJson?.AddLess;
    resultObj.afterTaxAmt = resultObj.afterTaxAmt?.toFixed(2);
    resultObj.amount = resultObj.amount?.toFixed(2);

    let totalMakingAmount = arr.reduce(
      (sum, item) => sum + (item.MakingAmount || 0),
      0
    );
    resultObj.MakingAmount = totalMakingAmount.toFixed(2);
    setTotal(resultObj);
  };

  const lastDiamondTableFunc = (materialId, arr, json1Arr) => {
    let findArr = findMaterialWise(
      "MasterManagement_DiamondStoneTypeid",
      materialId,
      arr
    );
    const rateSumMap = {};
    if (materialId === 1) {
      findArr.forEach((item) => {
        const { Rate, Wt, Amount, IsSolGem } = item;
    
        let record = json1Arr.find(
          (e) => e.SrJobno === item?.StockBarcode
        );
    
        const key = `${Rate}_${IsSolGem}`; // Separate Diamond & Solitaire
    
        if (!rateSumMap[key]) {
          rateSumMap[key] = {
            totalWeight: 0,
            totalAmount: 0,
            name: IsSolGem === 1 ? "SOLITAIRE" : "DIAMOND",
            discount: record?.Discount || 0,
            rate: Rate,
            IsSolGem,
          };
        }
    
        rateSumMap[key].totalWeight += Number(Wt || 0);
        rateSumMap[key].totalAmount += Number(Amount || 0);
      });
    
      const result = Object.values(rateSumMap).map((item) => ({
        rate: item.rate,
        totalWeight: item.totalWeight.toFixed(3),
        totalAmount: item.totalAmount.toFixed(3),
        name: item.name,
        discount: item.discount,
        IsSolGem: item.IsSolGem,
      }));
    
      let obj = { ...lastDiamondTableTotal };
    
      result.forEach((e) => {
        obj.diaCtw += +e.totalWeight;
        obj.diamondAmount += +e.totalAmount;
      });
    
      setLastDiamondTableTotal(obj);
      setLastDiamondTable(result);
    }
    // if (materialId === 2) {
    //   findArr.forEach((item) => {
    //     const { Rate, Wt, Amount } = item;
    //     let record = json1Arr.find((e, i) => e.SrJobno === item?.StockBarcode);
    //     if (!rateSumMap[Rate]) {
    //       rateSumMap[Rate] = {
    //         totalWeight: 0,
    //         totalAmount: 0,
    //         name: "COLOR STONE",
    //         discount: record.Discount,
    //       };
    //     }
    //     rateSumMap[Rate].totalWeight += Wt;
    //     rateSumMap[Rate].totalAmount += Amount;
    //     rateSumMap[Rate].name = "COLOR STONE";
    //     rateSumMap[Rate].discount = record.Discount;
    //   });

    //   const result = Object.keys(rateSumMap).map((rate) => ({
    //     rate: rate,
    //     totalWeight: rateSumMap[rate].totalWeight.toFixed(3),
    //     totalAmount: rateSumMap[rate].totalAmount.toFixed(3),
    //     name: "COLOR STONE",
    //     discount: rateSumMap[rate].discount,
    //   }));
    //   let obj = { ...lastColorStoneTableTotal };
    //   result.forEach((e, i) => {
    //     obj.clrCtw += +e?.totalWeight;
    //     obj.colorStoneAmount += +e?.totalAmount;
    //   });
    //   setLastColorStoneTableTotal(obj);
    //   setLastColorStoneTable(result);
    // }

    if (materialId === 2) {
      findArr.forEach((item) => {
        const { Rate, Wt, Amount, IsSolGem } = item;
    
        let record = json1Arr.find(
          (e) => e.SrJobno === item?.StockBarcode
        );
    
        const key = `${Rate}_${IsSolGem}`;
    
        if (!rateSumMap[key]) {
          rateSumMap[key] = {
            rate: Rate,
            IsSolGem,
            totalWeight: 0,
            totalAmount: 0,
            name: IsSolGem === 1 ? "GEMSTONE" : "COLOR STONE",
            discount: record?.Discount || 0,
          };
        }
    
        rateSumMap[key].totalWeight += Number(Wt || 0);
        rateSumMap[key].totalAmount += Number(Amount || 0);
      });
    
      const result = Object.values(rateSumMap).map((item) => ({
        rate: item.rate,
        totalWeight: item.totalWeight.toFixed(3),
        totalAmount: item.totalAmount.toFixed(3),
        name: item.name,
        discount: item.discount,
        IsSolGem: item.IsSolGem,
      }));
    
      let obj = { ...lastColorStoneTableTotal };
    
      result.forEach((e) => {
        obj.clrCtw += +e.totalWeight;
        obj.colorStoneAmount += +e.totalAmount;
      });
    
      setLastColorStoneTableTotal(obj);
      setLastColorStoneTable(result);
    }
  };

  const loadData = (datas) => {
    setBillprintJson(datas?.BillPrint_Json[0]);
    let json1Arr = [];
    datas?.BillPrint_Json1.forEach((e, i) => {
      let findMaterials = findMaterial(e.SrJobno, datas.BillPrint_Json2);
      let diamondsRate = countDiamondRate(1, findMaterials);
      let colorStoneRate = countDiamondRate(2, findMaterials);
      let totalAmount = countTotalAmount(findMaterials);
      let obj = { ...e };
      obj.otherAmountDetail =
        e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling;
      obj.diamondsRate = diamondsRate;
      obj.colorStoneRate = colorStoneRate;
      obj.totalAmount = totalAmount;
      obj.SettingAmount = e?.SettingAmount;
      obj.SettingRate = e?.SettingRate;
      json1Arr.push(obj);
    });

    if (json1Arr.length > 0) {
      json1Arr[0].SettingAmount = json1Arr[0].SettingAmount ?? 0;
      json1Arr[0].SettingRate = json1Arr[0].SettingRate ?? 0;
      datas?.BillPrint_Json2.forEach((e) => {
        if (e?.MasterManagement_DiamondStoneTypeid === 5) {
          json1Arr[0].SettingAmount += e.SettingAmount || 0;
          json1Arr[0].SettingRate += e.SettingRate || 0;
        }
      });
    }

    let met_shp_arr = MetalShapeNameWiseArr(datas?.BillPrint_Json2);

    setMetShpWise(met_shp_arr);
    let tot_met = 0;
    let tot_met_wt = 0;
    met_shp_arr?.forEach((e, i) => {
      tot_met += e?.Amount;
      tot_met_wt += e?.metalfinewt;
    });
    setNotGoldMetalTotal(tot_met);
    setNotGoldMetalWtTotal(tot_met_wt);

    countCategorySubCategory(datas?.BillPrint_Json1);
    setBillPrintJson1(json1Arr);
    countTotal(json1Arr, datas?.BillPrint_Json[0]);
    let result = [];
    let gDWt = 0;
    let nWt = 0;
    let makingAmount = 0;

    json1Arr.forEach((obj) => {
      let diaWt = 0;
      obj?.diamondsRate.length > 0 &&
        obj?.diamondsRate.map((e, i) => {
          diaWt += +e?.totalWeight;
          gDWt += +e?.totalWeight;
        });
      const key1Value = obj?.MetalTypePurity;
      const key2Value =
        atob(evn) == "sale" ? obj?.convertednetwt : obj?.convertednetwt;
      // atob(evn) == "sale" ? obj?.PureNetWt : obj?.convertednetwt;
      // const key2Value = obj?.convertednetwt;
      const key3Value = diaWt;
      const key4Value = obj?.grosswt;
      const key5Value = obj?.NetWt;
      const key6Value = obj?.MetalAmount;
      const key7Value = obj?.Tunch;
      const key8Value = +((obj?.Tunch * key5Value) / 100).toFixed(3);
      const foundIndex = result.findIndex(
        (item) => item.metalType === key1Value
      );
      nWt += obj?.NetWt;
      makingAmount += obj.MakingAmount;
      if (foundIndex === -1) {
        result.push({
          metalType: key1Value,
          fineWt: key2Value,
          diaWt: key3Value,
          grosswt: key4Value,
          NetWt: key5Value,
          MetalAmount: key6Value,
          tunch: key7Value,
          pureWt: key8Value,
        });
      } else {
        result[foundIndex].fineWt += key2Value;
        result[foundIndex].diaWt += key3Value;
        result[foundIndex].grosswt += key4Value;
        result[foundIndex].NetWt += key5Value;
        result[foundIndex].MetalAmount += key6Value;
        result[foundIndex].tunch = key7Value;
        result[foundIndex].pureWt += key8Value;
      }
    });
    // let findGold24K = result.reduce((sum, item) => sum + item?.fineWt, 0)

    let totalFineWt = 0;

    for (let item of datas?.BillPrint_Json2) {
      // if (item.MasterManagement_DiamondStoneTypeid === 4) {
      totalFineWt += item.FineWt;
      // }
    }
    let findGold24K = totalFineWt;
    // let findGold24K = json1Arr.reduce((sum, item) => sum + item?.FineWt, 0);
    let obj = { ...totalSummary };
    obj.gold24Kt = findGold24K;
    obj.gDWt = (+gDWt.toFixed(3) / 5 + nWt).toFixed(3);
    obj.makingAmount = makingAmount;
    let diamondPcs = 0;
    let colorStonePcs = 0;
    datas?.BillPrint_Json2.forEach((e, i) => {
      obj.makingAmount += e?.SettingAmount;
      if (e?.MasterManagement_DiamondStoneTypeid === 1) {
        diamondPcs += e.Pcs;
      }
      if (e?.MasterManagement_DiamondStoneTypeid === 2) {
        colorStonePcs += e.Pcs;
      }
    });
    obj.diamondpcs = diamondPcs;
    obj.colorStonePcs = colorStonePcs;
    setTotalSummary(obj);
    setMetaltype(result);
    let object = { ...metaltypeSum };
    result.forEach((e, i) => {
      object.grosswt += e?.grosswt;
      object.NetWt += e?.NetWt;
      object.pureWt += e?.pureWt;
      object.MetalAmount += e?.MetalAmount;
      object.fineWt += e?.fineWt;
    });
    setMetaltypeSum(object);
    lastDiamondTableFunc(1, datas?.BillPrint_Json2, json1Arr);
    lastDiamondTableFunc(2, datas?.BillPrint_Json2, json1Arr);
  };

  function loadData2(data) {
    let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    data.BillPrint_Json[0].address = address;

    const datas = OrganizeDataPrint(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );

    let met_shp_arr = MetalShapeNameWiseArr(datas?.json2);

    setMetShpWise(met_shp_arr);
    let tot_met = 0;
    let tot_met_wt = 0;
    met_shp_arr?.forEach((e, i) => {
      tot_met += e?.Amount;
      tot_met_wt += e?.metalfinewt;
    });
    setNotGoldMetalTotal(tot_met);
    setNotGoldMetalWtTotal(tot_met_wt);

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

    diaonlyrndarr1.forEach((e) => {
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

    diaonlyrndarr2.forEach((e) => {
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

    diaonlyrndarr4.forEach((e) => {
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

    diarndotherarr5 = [...diaonlyrndarr6, diaObj];
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
            loadData2(data?.Data);
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

  const handleChange = (e, name) => {
    if (name === "header") {
      header ? setHeader(false) : setHeader(true);
    }
    if (name === "image") {
      image ? setimage(false) : setimage(true);
    }
    if (name === "summary") {
      summary ? setSummary(false) : setSummary(true);
    }
    if (name === "making") {
      makingColumShow ? setMakingColumShow(false) : setMakingColumShow(true);
    }
  };

  const totalSettingAmount = BillPrintJson1.reduce(
    (sum, item) => sum + (item.SettingAmount || 0),
    0
  );

  const getKaratValue = (metalType) => {
    let match = metalType.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
  };

  const sortedData = [...metalType].sort(
    (a, b) => getKaratValue(a.metalType) - getKaratValue(b.metalType)
  );

  console.log("BillPrintJson1", BillPrintJson1);
  console.log("billPrintJson", billPrintJson);
  // console.log("summaryDetail", summaryDetail);
  // console.log("lastColorStoneTable", lastColorStoneTable);
  // console.log("lastDiamondTable", lastDiamondTable);
  console.log("sortedData", sortedData);
  // console.log("taxes", taxes);

  function getTunchWiseSummary(BillPrint_Json1) {

    const result = {};
    let total = {
        Gwt: 0,
        NetWt: 0,
        PureWt: 0,
        Amount: 0
    };

    BillPrint_Json1.forEach(item => {

        const key = item.MetalTypePurity + "_" + item.Tunch;

        if (!result[key]) {
            result[key] = {
                MetalType: item.MetalTypePurity,
                Gwt: 0,
                NetWt: 0,
                Tunch: item.Tunch,
                PureWt: 0,
                GoldAmount: 0
            };
        }

        result[key].Gwt += Number(item.grosswt || 0);
        result[key].NetWt += Number(item.NetWt || 0);
        result[key].PureWt += Number(item.PureNetWt || 0);
        result[key].GoldAmount += Number(item.MetalAmount || 0);

        total.Gwt += Number(item.grosswt || 0);
        total.NetWt += Number(item.NetWt || 0);
        total.PureWt += Number(item.PureNetWt || 0);
        total.Amount += Number(item.MetalAmount || 0);
    });

    return {
        summary: Object.values(result),
        total: total
    };
}

const metalSummarey=getTunchWiseSummary(BillPrintJson1);


  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <div className="summary-print-4 zoom1_5_summary12 container max_width_container fs_S4 pt-4 pad_60_allPrint summury4_padding_top ">
          <div className="d-flex justify-content-end align-items-center fs_S4 print_sec_sum4 ">
            <div className="form-check pe-3">
              <input
                className="form-check-input border-dark"
                type="checkbox"
                checked={makingColumShow}
                onChange={(e) => handleChange(e, "making")}
                id="labourremove"
              />
              <label htmlFor="labourremove" className="form-check-label pt-1">Labour</label>
            </div>
            <div className="form-check pe-3">
              <input
                className="form-check-input border-dark"
                type="checkbox"
                checked={header}
                onChange={(e) => handleChange(e, "header")}
                id="WHeader"
              />
              <label htmlFor="WHeader" className="form-check-label pt-1">With Header</label>
            </div>
            <div className="form-check pe-3">
              <input
                className="form-check-input border-dark"
                type="checkbox"
                checked={image}
                onChange={(e) => handleChange(e, "image")}
                id="WImage"
              />
              <label htmlFor="WImage" className="form-check-label pt-1">With Image</label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input border-dark"
                type="checkbox"
                checked={summary}
                onChange={(e) => handleChange(e, "summary")}
                id="WSummary"
              />
              <label htmlFor="WSummary" className="form-check-label pt-1">With Summary</label>
            </div>
            <div className="form-check ps-3">
              <input
                type="button"
                className="btn_white blue"
                value="Print"
                onClick={(e) => handlePrint(e)}
              />
            </div>
          </div>
          <div className="pt-4 summury4_main_div summury4_padding_top">
            {header && (
              <div className="d-flex header_section_sum4 justify-content-between align-items-center pb-2 fs_S4">
                <div className="address_sum4">
                  <h1 className="h1_sum4 fw-bold">
                    {billPrintJson?.CompanyFullName}
                  </h1>
                  <p className="address_para_sum4 lh-1 pb-1">
                    {" "}
                    {billPrintJson?.CompanyAddress}{" "}
                  </p>
                  <p className="address_para_sum4 lh-1 pb-1">
                    {billPrintJson?.CompanyAddress2}{" "}
                  </p>
                  <p className="address_para_sum4 lh-1 pb-1">
                    {billPrintJson?.CompanyCity}-{billPrintJson?.CompanyPinCode},{" "}
                    {billPrintJson?.CompanyState}{" "}
                    {billPrintJson?.CompanyCountry}{" "}
                  </p>
                  <p className="address_para_sum4 lh-1 pb-1">
                    T {billPrintJson?.CompanyTellNo} | TOLL FREE{" "}
                    {billPrintJson?.CompanyTollFreeNo}{" "}
                  </p>
                  <p className="address_para_sum4 lh-1 pb-1">
                    {billPrintJson?.CompanyEmail} |{" "}
                    {billPrintJson?.CompanyWebsite}{" "}
                  </p>
                  {/* <p className="address_para_sum4 lh-1 pb-1">
                    {billPrintJson?.Company_VAT_GST_No} |{" "}
                    {billPrintJson?.Cust_CST_STATE}-
                    {billPrintJson?.Company_CST_STATE_No} | PAN-EDJHF236D{" "}
                  </p> */}
                  <p className="address_para_sum4 lh-1 pb-1">
                    {billPrintJson?.Company_VAT_GST_No &&
                      `${billPrintJson.Company_VAT_GST_No} | `}

                    {billPrintJson?.Company_CST_STATE_No &&
                      `${billPrintJson.Company_CST_STATE} - ${billPrintJson.Company_CST_STATE_No} | `}

                    {billPrintJson?.Pannumber &&
                      `PAN - ${billPrintJson.Pannumber}`}
                  </p>

                  {(billPrintJson?.CINNO || billPrintJson?.MSME) && (
                    <p className="address_para_sum4 lh-1 pb-1">
                      {billPrintJson?.CINNO && `CIN-${billPrintJson.CINNO}`}
                      {billPrintJson?.CINNO && billPrintJson?.MSME && " | "}
                      {billPrintJson?.MSME && `MSME-${billPrintJson.MSME}`}
                    </p>
                  )}
                </div>
                <div className="logo_sec_sum4">
                  {/* <img src={billPrintJson?.PrintLogo} alt="Logo" /> */}
                  {isImageWorking && billPrintJson?.PrintLogo !== "" && (
                    <img
                      src={billPrintJson?.PrintLogo}
                      alt=""
                      //   className={`${style2.headerImg}`}
                      onError={handleImageErrors}
                    />
                  )}
                </div>
              </div>
            )}
            <div className="">
              <div className="d-flex justify-content-between border-bottom p-2 border mt-2">
                <div className="invoice_text_sum4">
                  <h2>
                    {" "}
                    {atob(evn) !== "sale" && "APPROVAL"} INVOICE# :{" "}
                    <span>{billPrintJson?.InvoiceNo}</span>
                  </h2>
                </div>
                <div className="invoice_text_sum4">
                  <h2>
                    {" "}
                    DATE : <span>{billPrintJson?.EntryDate}</span>
                  </h2>
                </div>
              </div>
              <div className="d-flex justify-content-between p-1 border">
                <div className="address_line_sum4">
                  <p>{billPrintJson?.lblBillTo}</p>
                  <h3>{billPrintJson?.customerfirmname}</h3>
                  <p>{billPrintJson?.customerAddress1}</p>
                  <p>{billPrintJson?.customerAddress2}</p>
                  <p>{billPrintJson?.customerAddress3}</p>
                  <p>
                    {billPrintJson?.customercity}-{billPrintJson?.PinCode}
                  </p>
                  <p>{billPrintJson?.customeremail1}</p>
                  <p>{billPrintJson?.Cust_CST_STATE_No_}</p>
                  <p>{billPrintJson?.vat_cst_pan}</p>
                </div>
                <div className="address_lines_sum4">
                  <p>
                    {" "}
                    Gold Rate:{" "}
                    <span>{billPrintJson?.MetalRate24K?.toFixed(2)}</span>
                  </p>
                </div>
              </div>
              <div className="sum4_table">
                <div className="d-flex border-bottom">
                  <div className={`border-start border-end align-middle text-center fw-bold font_alignment_Setting col1 summury4_col_font`}>
                    SR#
                  </div>
                  <div className={`border-end align-middle text-center fw-bold font_alignment_Setting col2 summury4_col_font`}>
                    DESIGN
                  </div>
                  <div
                    className={`border-end align-middle text-center fw-bold font_alignment_Setting col3 summury4_col_font`}
                  >
                    Remark
                  </div>
                  <div
                    className={`border-end align-middle text-center fw-bold font_alignment_Setting ${makingColumShow ? "col4" : "col4m"} summury4_col_font`}
                    style={{ wordBreak: "break-word" }}
                  >
                    DIA WT (ctw)
                  </div>
                  <div className={`border-end text-center flex-column d-flex align-items-center justify-content-center fw-bold font_alignment_Setting ${makingColumShow ? "col5" : "col5m"} summury4_col_font`}>
                    <div>DIA </div>
                    <div>RATE</div>
                  </div>
                  <div
                    className={`border-end text-center flex-column d-flex align-items-center justify-content-center fw-bold ${makingColumShow ? "col6" : "col6m"} summury4_col_font`}
                  >
                    <div>DIA </div>
                    <div>AMT</div>
                  </div>
                  <div className={`border-end text-center flex-column d-flex align-items-center justify-content-center fw-bold ${makingColumShow ? "col7" : "col7m"} summury4_col_font`}>
                    <div>G WT </div>
                    <div>(gm)</div>
                  </div>
                  <div className={`border-end text-center flex-column d-flex align-items-center justify-content-center fw-bold ${makingColumShow ? "col8" : "col8m"} summury4_col_font`}>
                    <div>NWT </div>
                    <div>(gm)</div>
                  </div>
                  <div
                    className={`border-end text-center flex-column d-flex align-items-center justify-content-center fw-bold ${makingColumShow ? "col9" : "col9m"} summury4_col_font 
                    `}
                  >
                    <div>Other </div>
                    <div>AMT</div>
                  </div>
                  <div className={`border-end text-center flex-column d-flex align-items-center justify-content-center fw-bold ${makingColumShow ? "col10" : "col10m"} summury4_col_font`}>
                    <div>CS WT </div>
                    <div>(ctw)</div>
                  </div>
                  <div className={`border-end text-center flex-column d-flex align-items-center justify-content-center fw-bold ${makingColumShow ? "col11" : "col11m"} summury4_col_font`}>
                    <div>CS </div>
                    <div>RATE</div>
                  </div>
                  <div className={`border-end text-center flex-column d-flex align-items-center justify-content-center fw-bold ${makingColumShow ? "col12" : "col12m"} summury4_col_font`}>
                    <div>CS </div>
                    <div>AMT</div>
                  </div>
                  {makingColumShow && (
                    <div className="border-end text-center flex-column d-flex align-items-center justify-content-center fw-bold col13 summury4_col_font">
                      <div>MAKING</div>
                      <div>RATE</div>
                    </div>
                  )}
                  {makingColumShow && (
                    <div className="border-end text-center flex-column d-flex align-items-center justify-content-center fw-bold col14 summury4_col_font">
                      <div>
                        <p>MAKING</p>
                      </div>
                    </div>
                  )}
                  <div className={`border-end text-center flex-column d-flex align-items-center justify-content-center fw-bold ${makingColumShow ? "col15" : "col15m"} summury4_col_font`}>
                    <p style={{ wordBreak: "keep-all" }}>GOLD FINE(gm)</p>
                  </div>
                  <div className={`border-end text-center flex-column d-flex align-items-center justify-content-center fw-bold ${makingColumShow ? "col16" : "col16m"} summury4_col_font`}>
                    <div>GOLD </div>
                    <div>AMT</div>
                  </div>
                  <div
                    className={`border-end align-middle text-center fw-bold font_alignment_Setting ${makingColumShow ? "col17" : "col17m"} summury4_col_font`}
                  >
                    AMOUNT
                  </div>
                </div>
                {BillPrintJson1.length > 0 &&
                  [...BillPrintJson1]
                    .sort((a, b) => {
                      if (a.MetalTypePurity < b.MetalTypePurity) return -1;
                      if (a.MetalTypePurity > b.MetalTypePurity) return 1;
                      return a.J_JobNo - b.J_JobNo;
                    })
                    .map((e, i) => {
                      return (
                        <div className="d-flex border-bottom" key={i}>
                          <div className="border-start text-center border-end summury4_col1">
                            {" "}
                            <p> {1 + i} </p>{" "}
                          </div>
                          <div className="border-end summury4_col2 p-1">
                            <div style={{display:'flex',justifyContent:"space-between"}}>
                            <p className="fw-bold">{e?.SrJobno} - </p>
                            {e?.Categoryname && (
                              <p className="fw-bold design_name_show" style={{wordBreak:'break-all'}}>
                                {e?.Categoryname}
                              </p>
                            )}
                            </div>
                            {image && (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <img
                                  src={e?.DesignImage}
                                  alt=""
                                  onError={(e) => handleImageError(e)}
                                />
                              </div>
                            )}
                            <p
                              className="fw-bold"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              {e?.MetalTypePurity}
                            </p>{" "}
                          </div>
                          <div
                            className={`border-end summury4_col3`}
                          >
                            {e?.HUID !== "" && (
                              <p className="p-1">
                                {" "}
                                <strong>HUID</strong> -{" "}
                                <p style={{ wordBreak: "break-word" }}>
                                  {e?.HUID}
                                </p>
                              </p>
                            )}
                            {e?.CertificateNo !== "" && (<p className="border-top" />)}
                            {e?.CertificateNo !== "" && (
                              <p className="p-1">
                                <strong>IGI-</strong> -
                                <p className="word_break_setting">
                                  {" "}
                                  {e?.CertificateNo}
                                </p>
                              </p>
                            )}
                            <p>{e?.CertRemark} </p>
                          </div>
                          <div className={`border-end p-1 text-end ${makingColumShow ? "summury4_col4" : "summury4_col4m"}`}>
                            {" "}
                            {e?.diamondsRate.length > 0 &&
                              e.diamondsRate.map((ele, indd) => {
                                return (
                                  <p key={indd}>
                                    {ele?.IsSolGem===1? "S:":""}
                                    {fixedValues(ele?.totalWeight, 3)}
                                  </p>
                                );
                              })}
                          </div>
                          <div className={`border-end p-1 text-end ${makingColumShow ? "summury4_col5" : "summury4_col5m"}`}>
                            {" "}
                            {e?.diamondsRate.length > 0 &&
                              e.diamondsRate.map((ele, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(ele?.rate, 2)}
                                  </p>
                                );
                              })}
                          </div>
                          <div
                            className={`border-end p-1 text-end ${makingColumShow ? "summury4_col6" : "summury4_col6m"}`}
                          >
                            {" "}
                            {e?.diamondsRate.length > 0 &&
                              e.diamondsRate.map((ele, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(ele?.totalAmount, 2)}
                                  </p>
                                );
                              })}{" "}
                          </div>
                          <div className={`border-end p-1 text-end ${makingColumShow ? "summury4_col7" : "summury4_col7m"}`}>
                            {" "}
                            <p> {fixedValues(e?.grosswt, 3)} </p>{" "}
                          </div>
                          <div className={`border-end p-1 text-end ${makingColumShow ? "summury4_col8" : "summury4_col8m"}`}>
                            {" "}
                            <p> {fixedValues(e?.NetWt, 3)} </p>{" "}
                          </div>
                          <div
                            className={`border-end p-1 text-end ${makingColumShow ? "summury4_col9" : "summury4_col9m"}`}
                          >
                            {" "}
                            <p>
                              {" "}
                              {NumberWithCommas(e?.otherAmountDetail, 2)}{" "}
                            </p>{" "}
                          </div>
                          <div className={`border-end p-1 text-end ${makingColumShow ? "summury4_col10" : "summury4_col10m"}`}>
                            {e?.colorStoneRate.length > 0 &&
                              e.colorStoneRate.map((ele, indd) => {
                                return (
                                  <p key={indd}>
                                    {ele?.IsSolGem===1? "G:":""}
                                    {fixedValues(ele?.totalWeight, 3)}
                                  </p>
                                );
                              })}
                          </div>
                          <div className={`cs_rate_sum4 p-1 border-end text-end ${makingColumShow ? "summury4_col11" : "summury4_col11m"}`}>
                            {" "}
                            {e?.colorStoneRate.length > 0 &&
                              e.colorStoneRate.map((ele, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(ele?.rate, 2)}
                                  </p>
                                );
                              })}{" "}
                          </div>

                          <div className={`border-end p-1 text-end ${makingColumShow ? "summury4_col12" : "summury4_col12m"}`}>
                            {" "}
                            {e?.colorStoneRate.length > 0 &&
                              e.colorStoneRate.map((ele, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(ele?.totalAmount, 2)}
                                  </p>
                                );
                              })}{" "}
                          </div>

                          {makingColumShow && (
                            <div className="border-end p-1 text-end summury4_col13">
                              {formatAmount(e?.MaKingCharge_Unit, 2)}
                            </div>
                          )}
                          {makingColumShow && (
                            <div className="border-end p-1 text-end summury4_col14">
                              {formatAmount(
                                e?.MakingAmount +
                                e?.TotalDiaSetcost +
                                e?.TotalCsSetcost,
                                2)}
                            </div>
                          )}

                          <div className={`border-end p-1 text-end ${makingColumShow ? "summury4_col15" : "summury4_col15m"}`}>
                            {" "}
                            <p>
                              {" "}
                              {billPrintJson?.MetalRate24K == 0
                                ? e?.convertednetwt !== 0 &&
                                fixedValues(e?.convertednetwt, 3)
                                : ""}{" "}
                            </p>{" "}
                          </div>
                          <div className={`border-end p-1 text-end ${makingColumShow ? "summury4_col16" : "summury4_col16m"}`}>
                            {" "}
                            <p>
                              {" "}
                              {e?.MetalAmount !== undefined &&
                                NumberWithCommas(e?.MetalAmount, 2)}{" "}
                            </p>{" "}
                          </div>
                          <div
                            className={`border-end p-1 text-end ${makingColumShow ? "summury4_col17" : "summury4_col17m"}`}
                          >
                            {NumberWithCommas(e?.TotalAmount, 2)}
                          </div>
                        </div>
                      );
                    })}
                <div className="total_sec_sum4 d-flex border-bottom mb-1">
                  <div
                    className="p-1 ps-2 total_sum4 border-start border-end bg_total_sum4 fw-bold text-center"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Total
                  </div>
                  <div
                    className={`p-1 border-end text-end bg_total_sum4 fw-bold summury4_col3`}
                  >
                    {" "}
                    <p> </p>{" "}
                  </div>
                  <div
                    className={`p-1 ${makingColumShow ? "summury4_col4" : "summury4_col4m"} border-end text-end bg_total_sum4 fw-bold`}
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    {" "}
                    <p> {fixedValues(total.diaWt, 3)} </p>{" "}
                  </div>
                  <div className={`p-1 ${makingColumShow ? "summury4_col5" : "summury4_col5m"} border-end text-end bg_total_sum4 fw-bold`}>
                    {" "}
                    <p> </p>{" "}
                  </div>
                  <div
                    className={`p-1 border-end text-end bg_total_sum4 fw-bold  ${makingColumShow ? "summury4_col6" : "summury4_col6m"
                      }`}
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    {" "}
                    <p> {NumberWithCommas(total.diaAmt, 2)} </p>{" "}
                  </div>
                  <div
                    className={`p-1 ${makingColumShow ? "summury4_col7" : "summury4_col7m"} border-end text-end bg_total_sum4 fw-bold`}
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    {" "}
                    <p> {fixedValues(total.gwt, 3)} </p>{" "}
                  </div>
                  <div
                    className={`p-1 ${makingColumShow ? "summury4_col8" : "summury4_col8m"} border-end text-end bg_total_sum4 fw-bold`}
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    {" "}
                    <p> {fixedValues(total.nwt, 3)} </p>{" "}
                  </div>
                  <div
                    className={`p-1 border-end text-end  bg_total_sum4 fw-bold ${makingColumShow ? "summury4_col9" : "summury4_col9m"
                      }`}
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    {" "}
                    <p> {NumberWithCommas(total.otherAmt, 2)} </p>{" "}
                  </div>
                  <div
                    className={`p-1 ${makingColumShow ? "summury4_col10" : "summury4_col10m"} border-end text-end bg_total_sum4 fw-bold`}
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    {" "}
                    <p> {fixedValues(total.csWt, 3)} </p>{" "}
                  </div>
                  <div className={`p-1 ${makingColumShow ? "summury4_col11" : "summury4_col11m"} border-end text-end  bg_total_sum4 fw-bold`}>
                    {" "}
                    <p> </p>{" "}
                  </div>
                  <div
                    className={`p-1 ${makingColumShow ? "summury4_col12" : "summury4_col12m"} border-end text-end  bg_total_sum4 fw-bold`}
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    {" "}
                    <p> {NumberWithCommas(total.csAmt, 2)} </p>{" "}
                  </div>
                  {makingColumShow && (<>
                    <div className={`p-1 ${makingColumShow ? "summury4_col13" : "summury4_col13m"} border-end text-end  bg_total_sum4 fw-bold`}>
                      {" "}
                      <p> </p>{" "}
                    </div>
                    <div
                      className={`p-1 ${makingColumShow ? "summury4_col14" : "summury4_col14m"} border-end text-end bg_total_sum4 fw-bold`}
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      {" "}
                      <p>
                        {NumberWithCommas(
                          result?.mainTotal?.total_labour?.labour_amount +
                          result?.mainTotal?.total_TotalDiaSetcost +
                          result?.mainTotal?.total_TotalCsSetcost +
                          totalSettingAmount,
                          2
                        )}
                      </p>{" "}
                    </div>
                  </>
                  )}
                  <div
                    className={`p-1 ${makingColumShow ? "summury4_col15" : "summury4_col15m"} border-end text-end  bg_total_sum4 fw-bold`}
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    {" "}
                    <p>
                      {billPrintJson?.MetalRate24K == 0
                        ? fixedValues(total.goldFine, 3)
                        : "0.000"}
                    </p>{" "}
                  </div>
                  <div
                    className={`p-1 ${makingColumShow ? "summury4_col16" : "summury4_col16m"} border-end text-end  bg_total_sum4 fw-bold`}
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    {" "}
                    <p> {NumberWithCommas(total.goldAmt, 2)} </p>{" "}
                  </div>
                  <div
                    className={`p-1 pe-2 border-end text-end bg_total_sum4 fw-bold  ${makingColumShow ? "summury4_col17" : "summury4_col17m"
                      }`}
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    {" "}
                    <p> {NumberWithCommas(total.amount, 2)} </p>{" "}
                  </div>
                </div>
                <div className="d-flex mb-1">
                  <div className="sgst_sec_sum4 border">
                    <div className="bg_total_sum4 fw-bold ps-1 border-bottom mb-2 Summary_Detail_title">
                      Summary Detail
                    </div>
                    <div className="d-flex flex-wrap">
                      {summaryDetail?.length > 0 &&
                        summaryDetail?.map((elem, ind) => {
                          return (
                            <div
                              className="amazon_sum4 d-flex ps-2 pb-2"
                              key={ind}
                            >
                              <div
                                className="amazon_text_sum4 pe-1"
                                style={{ minWidth: "100px" }}
                              >
                                {elem.name}
                              </div>
                              <div className="fw-bold amazon_number_sum4">
                                : {elem.value}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div className="sgst_part_sum4 border">
                    {taxes?.length > 0 &&
                      taxes?.map((e, i) => {
                        return (
                          <div
                            className="d-flex justify-content-between px-2 pt-1"
                            key={i}
                          >
                            <div className="sgst_text_sum4">
                              {e?.name} @ {e?.per}
                            </div>
                            <div className="sgst_text_sum4">
                              {/* {((billPrintJson?.CGST / 100) * total.amount).toFixed(3)} */}
                              {NumberWithCommas(e?.amount, 2)}
                            </div>
                          </div>
                        );
                      })}
                    <div className="d-flex justify-content-between px-2">
                      <div className="sgst_text_sum4 fw-bold">Less</div>
                      <div className="sgst_text_sum4 fw-bold">
                        {NumberWithCommas(billPrintJson?.AddLess, 2)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="total_sgst_sum4 mt-1 w-100 border bg_total_sum4 mb-1  d-flex">
                  <div className="total_sgst_text_sum4">
                    <p
                      className="fw-bold summury4_total_font"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        height: "100%",
                      }}
                    >
                      TOTAL
                    </p>
                  </div>
                  <div className="total_sgst_number_sum4">
                    <div className="d-flex justify-content-between">
                      <p className="ps-2">CASH :</p>
                      <p className="pe-2 fw-bold">
                        {NumberWithCommas(total?.afterTaxAmt, 2)}
                      </p>
                    </div>
                    <div className="d-flex justify-content-between">
                      <p className="ps-2">Gold in 24K :</p>
                      <p className="pe-2 fw-bold">
                        {billPrintJson?.MetalRate24K == 0
                          ? fixedValues(total.goldFine, 3)
                          : // fixedValues(totalSummary?.gold24Kt, 3)
                          "0.000"}{" "}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="d-flex mb-2">
                  <div className="summary_detail_sum4 border">
                    <div className="fw-bold border-bottom ps-2 bg_total_sum4 pt-1">
                      SUMMARY
                    </div>
                    <div className="d-flex">
                      <div className="gold_24kt_sum4 w-50 border-end">
                        <div className="d-flex w-100">
                          <div className="w-60 fw-bold ps-2">GOLD IN 24KT </div>
                          <div className="w-40 text-end pe-2">
                            {billPrintJson?.MetalRate24K == 0
                              ? fixedValues(total.goldFine, 3)
                              : // fixedValues(
                              //     totalSummary?.gold24Kt - notGoldMetalWtTotal,
                              //     3
                              //   )
                              "0.000"}{" "}
                            gm{" "}
                          </div>
                        </div>
                        {MetShpWise?.map((e, i) => {
                          return (
                            <div className="d-flex w-100" key={i}>
                              <div className="w-60 fw-bold ps-2">
                                {e?.ShapeName}
                              </div>
                              <div className="w-40 text-end pe-2">
                                {NumberWithCommas(e?.metalfinewt, 3)} gm
                              </div>
                            </div>
                          );
                        })}
                        <div className="d-flex w-100">
                          <div className="w-60 fw-bold ps-2">GROSS WT </div>
                          <div className="w-40 text-end pe-2">
                            {fixedValues(total?.gwt, 3)} gm{" "}
                          </div>
                        </div>
                        <div className="d-flex w-100">
                          <div className="w-60 fw-bold ps-2">*(G+D) WT </div>
                          <div className="w-40 text-end pe-2">
                            {fixedValues(totalSummary?.gDWt, 3)} gm{" "}
                          </div>
                        </div>
                        <div className="d-flex w-100">
                          <div className="w-60 fw-bold ps-2">NET WT </div>
                          <div className="w-40 text-end pe-2">
                            {fixedValues(total?.nwt, 3)} gm
                          </div>
                        </div>
                        <div className="d-flex w-100">
                          <div className="w-50 fw-bold ps-2">DIAMOND WT</div>
                          <div className="w-50 text-end pe-2">
                             {NumberWithCommas(result?.mainTotal?.diamonds?.Pcs -result?.mainTotal?.solitaire?.Pcs, 0)} / {NumberWithCommas(result?.mainTotal?.diamonds?.Wt - result?.mainTotal?.solitaire?.Wt, 3)} cts
                                                   
                          </div>
                        </div>
                        <div className="d-flex w-100">
                          <div className="w-50 fw-bold ps-2">SOLITAIRE WT</div>
                          <div className="w-50 text-end pe-2">
                          {result?.mainTotal?.solitaire?.Pcs  } /{" "}
                          {result?.mainTotal?.solitaire?.Wt?.toFixed(3)} cts
                          </div>
                        </div>
                        <div className="d-flex w-100">
                          <div className="w-60 fw-bold ps-2">STONE WT</div>
                          <div className="w-40 text-end pe-2">
                          {result?.mainTotal?.colorstone?.Pcs - result?.mainTotal?.gemstone?.Pcs} /{" "}
                          {(result?.mainTotal?.colorstone?.Wt - result?.mainTotal?.gemstone?.Wt)?.toFixed(3)} cts
                          </div>
                        </div>
                        <div className="d-flex w-100 mb-1">
                          <div className="w-50 fw-bold ps-2">GEMSTONE WT</div>
                          <div className="w-50 text-end pe-2">
                          {result?.mainTotal?.gemstone?.Pcs} /{" "}
                          {result?.mainTotal?.gemstone?.Wt?.toFixed(3)} cts
                          </div>
                        </div>
                      </div>
                      <div className="gold_24kt_sum4 w-50">
                        <div className="d-flex w-100">
                          <div className="w-50 fw-bold ps-2">GOLD</div>
                          <div className="w-50 text-end pe-2">
                            {NumberWithCommas(
                              total.goldAmt,
                              2
                            )}
                          </div>
                        </div>
                        {MetShpWise?.map((e, i) => {
                          return (
                            <div className="d-flex w-100" key={i}>
                              <div className="w-50 fw-bold ps-2">
                                {e?.ShapeName}
                              </div>
                              <div className="w-50 text-end pe-2">
                                {NumberWithCommas(e?.Amount, 2)}
                              </div>
                            </div>
                          );
                        })}
                        <div className="d-flex w-100">
                          <div className="w-50 fw-bold ps-2">DIAMOND</div>
                          <div className="w-50 text-end pe-2">
                           {formatAmount(
                                                       result?.mainTotal?.diamonds?.Amount - result?.mainTotal?.solitaire?.Amount /
                                                       result?.header?.CurrencyExchRate
                               ,2)}
                          </div>
                        </div>
                        <div className="d-flex w-100">
                          <div className="w-50 fw-bold ps-2">SOLITAIRE</div>
                          <div className="w-50 text-end pe-2">
                             {formatAmount(
                                                        result?.mainTotal?.solitaire?.Amount /
                                                        result?.header?.CurrencyExchRate
                                                      ,2)}
                          </div>
                        </div>
                        <div className="d-flex w-100">
                          <div className="w-50 fw-bold ps-2">CST</div>
                          <div className="w-50 text-end pe-2">
                             {formatAmount(
                                                       result?.mainTotal?.colorstone?.Amount - result?.mainTotal?.gemstone?.Amount/
                                                       result?.header?.CurrencyExchRate
                                                     ,2)}
                          </div>
                        </div>
                        <div className="d-flex w-100">
                          <div className="w-50 fw-bold ps-2">GEMSTONE</div>
                          <div className="w-50 text-end pe-2">
                            {formatAmount(
                                                        result?.mainTotal?.gemstone?.Amount /
                                                        result?.header?.CurrencyExchRate
                                                      ,2)}
                          </div>
                        </div>
                        <div className="d-flex w-100">
                          <div className="w-50 fw-bold ps-2">MAKING</div>
                          <div className="w-50 text-end pe-2">
                            {NumberWithCommas(totalSummary?.makingAmount, 2)}
                          </div>
                        </div>
                        <div className="d-flex w-100">
                          <div className="w-50 fw-bold ps-2">OTHER</div>
                          <div className="w-50 text-end pe-2">
                            {NumberWithCommas(total.otherAmt, 2)}
                          </div>
                        </div>
                        <div className="d-flex w-100 mb-2">
                          <div className="w-50 fw-bold ps-2">LESS</div>
                          <div className="w-50 text-end pe-2">
                            {NumberWithCommas(billPrintJson?.AddLess, 2)}
                          </div>
                        </div>
                        {/* <div className="d-flex w-100 bg_total_sum4 py-1">
                          <div className="w-50 fw-bold ps-2">Total</div>
                          <div className="w-50 text-end pe-2">
                            {NumberWithCommas(total?.afterTaxAmt, 2)}
                          </div>
                        </div> */}
                      </div>
                    </div>
                    <div
                      className="fw-bold bg_total_sum4"
                      style={{ display: "flex" }}
                    >
                      <div className="d-flex wdth49 bg_total_sum4 py-1 border-end">
                        {/* <div className="w-50 fw-bold ps-2"></div>
                                <div className="w-50 text-end pe-2">468 / 15.003 ctw</div> */}
                      </div>
                      <div className="d-flex wdth51 bg_total_sum4 py-1">
                        <div className="w-50 fw-bold ps-2">TOTAL</div>
                        {/* <div className="w-50 text-end pe-2">{(+(total.goldAmt) +
                                            Math.round(total.diaAmt) + +(total.csAmt) +
                                            +(totalSummary?.makingAmount) + +((total.otherAmt).toFixed(2)) + +(billPrintJson?.AddLess)).toFixed(2)} </div> */}
                        <div className="w-50 text-end pe-2">
                          {NumberWithCommas(total?.afterTaxAmt, 2)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="cgst_sum4 border">
                    <div className="bg_total_sum4 d-flex py-1">
                      <div className="metal_type_sum4 fw-bold ps-1 show_summury_title">
                        Metal Type
                      </div>
                      <div className="dia_wt_sum4 fw-bold">
                        Dia Wt
                        <br /> (ctw)
                      </div>
                      <div className="GWt_sum4 fw-bold">
                        GWt <br /> (gm)
                      </div>
                      <div className="net_wt_sum4 fw-bold">
                        Net Wt <br />
                        (gm)
                      </div>
                      <div className="fine_wt_sum4 fw-bold">
                        Fine Wt <br />
                        (gm)
                      </div>
                      <div className="gold_amount_sum4 text-end pe-1 fw-bold show_summury_title">
                        Gold Amount
                      </div>
                    </div>

                    {sortedData.length > 0 &&
                      sortedData.map((e, i) => {
                        return (
                          <div
                            className=" d-flex py-1 other_summury_font"
                            key={i}
                          >
                            <div className="metal_type_sum4 ps-1 text-start">
                              {e?.metalType}
                            </div>
                            <div className="dia_wt_sum4">
                              {fixedValues(e?.diaWt, 3)}
                            </div>
                            <div className="GWt_sum4">
                              {fixedValues(e?.grosswt, 3)}
                            </div>
                            <div className="net_wt_sum4">
                              {fixedValues(e?.NetWt, 3)}
                            </div>
                            <div className="fine_wt_sum4">
                              {billPrintJson?.MetalRate24K == 0
                                ? fixedValues(e?.fineWt, 3)
                                : "0.000"}
                            </div>
                            <div className="gold_amount_sum4 text-end pe-1">
                              {NumberWithCommas(e?.MetalAmount, 2)}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className="w-100 border px-1 mb-2 note_sec_sum4 p-1">
                  <p className="fw-bold font_15_sum4"> NOTE : </p>
                  {
                    <div
                      dangerouslySetInnerHTML={{
                        __html: billPrintJson?.Declaration,
                      }}
                      className="summury4_notes_text"
                    />
                  }
                </div>
                {billPrintJson?.PrintRemark !== "" && (
                  <div className="d-flex align-items-center gap-1 remarks_sum4 mb-2">
                    <p className="fw-bold font_14_sum4 ">REMARKS : </p>
                    <p
                      className="font_14_sum4"
                      dangerouslySetInnerHTML={{
                        __html: billPrintJson?.PrintRemark,
                      }}
                    ></p>
                  </div>
                )}
                <p className="fw-bold pb-1 font_14_sum4">
                  TERMS INCLUDED : &nbsp;
                  <span
                    dangerouslySetInnerHTML={{
                      __html: billPrintJson?.SalesRepPolicyTermsDescription,
                    }}
                    style={{ fontWeight: "400" }}
                  />
                </p>
                <div className="d-flex border mb-2">
                  <div className="w-50 border-end height_65_sum4 d-flex justify-content-center align-items-end border-end">
                    <p className="fw-bold font_15_sum4">
                      RECEIVER'S SIGNATURE & SEAL
                    </p>
                  </div>
                  <div className="w-50 height_65_sum4 d-flex justify-content-center align-items-end">
                    <p className="fw-bold font_15_sum4">
                      for,{billPrintJson?.companyname}
                    </p>
                  </div>
                </div>
                {summary && (
                  <>
                    <p className="fw-bold mt-10 font_14_sum4 deatil_SectionTitle">
                      Summary Details
                    </p>
                    <div className="summary_table_sum4 w-100">
                      <div className="d-flex border height34Sum4">
                        <div className="metalTypeSum4 border-end d-flex align-items-center justify-content-center fw-bold">
                          Metal Type
                        </div>
                        <div className="GwtSum4 border-end d-flex align-items-center justify-content-center fw-bold">
                          Gwt
                        </div>
                        <div className="netWtSum4 border-end d-flex align-items-center justify-content-center fw-bold">
                          Net wt
                        </div>
                        <div className="tunchSum4 border-end d-flex align-items-center justify-content-center fw-bold">
                          Tunch
                        </div>
                        <div className="pureWtSum4 border-end d-flex align-items-center justify-content-center fw-bold">
                          Pure wt
                        </div>
                        <div className="goldPriceSum4 border-end d-flex align-items-center justify-content-center fw-bold">
                          Gold Price 24 kt
                        </div>
                        <div className="goldAmtSum4 d-flex align-items-center justify-content-center fw-bold">
                          Gold Amount
                        </div>
                      </div>
                      {metalSummarey?.summary?.length > 0 ?
                        (metalSummarey?.summary?.map((e, i) => {
                          const isLast = i === metalSummarey?.summary?.length - 1;
                          return (
                            <div
                              className={`d-flex border-start border-end ${!isLast ? "border-bottom" : ""}`}
                              key={i}
                            >
                              <div className="metalTypeSum4 border-end d-flex justify-content-center pe-2">
                                {e?.MetalType}
                              </div>
                              <div className="GwtSum4 border-end d-flex justify-content-center pe-2">
                                {fixedValues(e?.Gwt, 3)}
                              </div>
                              <div className="netWtSum4 border-end d-flex justify-content-center pe-2">
                                {fixedValues(e?.NetWt, 3)}
                              </div>
                              <div className="tunchSum4 border-end d-flex justify-content-center pe-2">
                                {NumberWithCommas(e?.Tunch, 3)}
                              </div>
                              <div className="pureWtSum4 border-end d-flex justify-content-center pe-2">
                                {fixedValues(e?.PureWt, 3)}
                              </div>
                              <div className="goldPriceSum4 border-end d-flex justify-content-center pe-2">
                                {NumberWithCommas(
                                  billPrintJson?.MetalRate24K,
                                  2
                                )}
                              </div>
                              <div className="goldAmtSum4 d-flex justify-content-center pe-2">
                                {NumberWithCommas(e?.GoldAmount, 2)}
                              </div>
                            </div>
                          );
                        }))
                        : (
                          <div className={`d-flex border-start border-end`}>
                            <div className="metalTypeSum4 border-end d-flex justify-content-center pe-2"></div>
                            <div className="GwtSum4 border-end d-flex justify-content-center pe-2"></div>
                            <div className="netWtSum4 border-end d-flex justify-content-center pe-2"></div>
                            <div className="tunchSum4 border-end d-flex justify-content-center pe-2"></div>
                            <div className="pureWtSum4 border-end d-flex justify-content-center pe-2"></div>
                            <div className="goldPriceSum4 border-end d-flex justify-content-center pe-2"></div>
                            <div className="goldAmtSum4 d-flex justify-content-center pe-2"></div>
                          </div>
                        )
                      }
                      <div className="d-flex border height34Sum4 bg_total_sum4 ">
                        <div className="metalTypeSum4 border-end d-flex align-items-center justify-content-center pe-2 fw-bold">
                          Total
                        </div>
                        <div className="GwtSum4 border-end d-flex align-items-center justify-content-center pe-2 fw-bold">
                          {fixedValues(metaltypeSum?.grosswt, 3)}
                        </div>
                        <div className="netWtSum4 border-end d-flex align-items-center justify-content-center pe-2 fw-bold">
                          {fixedValues(metaltypeSum?.NetWt, 3)}
                        </div>
                        <div className="tunchSum4 border-end d-flex align-items-center justify-content-center pe-2 fw-bold"></div>
                        <div className="pureWtSum4 border-end d-flex align-items-center justify-content-center pe-2 fw-bold">
                          {fixedValues(metaltypeSum?.pureWt, 3)}
                        </div>
                        <div className="goldPriceSum4 border-end d-flex align-items-center justify-content-center pe-2 fw-bold"></div>
                        <div className="goldAmtSum4 d-flex align-items-center justify-content-center pe-2 fw-bold">
                          {NumberWithCommas(metaltypeSum?.MetalAmount, 2)}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex mt-7 justify-content-between">
                      <div className="diamondTypeSum4">
                        <div className="d-flex height34Sum4 border">
                          <div className="DiamondTypeSum4 d-flex justify-content-center align-items-center border-end fw-bold">
                            Diamond Type
                          </div>
                          <div className="DiamondCtwSum4 d-flex justify-content-center align-items-center border-end fw-bold">
                            Dia Ctw
                          </div>
                          <div className="DiamondPriceSum4 d-flex justify-content-center align-items-center border-end fw-bold">
                            Diamond Price
                          </div>
                          <div className="DiamondDiscountSum4 d-flex justify-content-center align-items-center border-end fw-bold">
                            Discount In %
                          </div>
                          <div className="DiamondAmountSum4 d-flex justify-content-center align-items-center fw-bold">
                            Diamond Amount
                          </div>
                        </div>

                        {lastDiamondTable.length > 0 ?
                          (lastDiamondTable.map((e, i) => {
                            const isLast = i === lastDiamondTable.length - 1;
                            return (
                              <div
                                className={`d-flex border-start border-end ${!isLast ? "border-bottom" : ""}`}
                                key={i}
                              >
                                <div className="DiamondTypeSum4 d-flex justify-content-center align-items-center border-end">
                                  {e?.name}
                                </div>
                                <div className="DiamondCtwSum4 d-flex justify-content-center pe-2 align-items-center border-end">
                                  {fixedValues(e?.totalWeight, 3)}
                                </div>
                                <div className="DiamondPriceSum4 d-flex justify-content-center pe-2 align-items-center border-end">
                                  {NumberWithCommas(e?.rate, 2)}
                                </div>
                                <div className="DiamondDiscountSum4 d-flex justify-content-center pe-2 align-items-center border-end">
                                  {NumberWithCommas(e?.discount, 2)} %
                                </div>
                                <div className="DiamondAmountSum4 d-flex justify-content-center pe-2 align-items-center">
                                  {NumberWithCommas(e?.totalAmount, 2)}
                                </div>
                              </div>
                            );
                          }))
                          : (
                            <div className="d-flex border-bottom border-start border-end">
                              <div className="DiamondTypeSum4 d-flex justify-content-center align-items-center border-end"></div>
                              <div className="DiamondCtwSum4 d-flex justify-content-center pe-2 align-items-center border-end"></div>
                              <div className="DiamondPriceSum4 d-flex justify-content-center pe-2 align-items-center border-end"></div>
                              <div className="DiamondDiscountSum4 d-flex justify-content-center pe-2 align-items-center border-end"></div>
                              <div className="DiamondAmountSum4 d-flex justify-content-center pe-2 align-items-center"></div>
                            </div>
                          )
                        }
                        <div className="d-flex height34Sum4 border bg_total_sum4">
                          <div className="DiamondTypeSum4 d-flex justify-content-center align-items-center border-end fw-bold">
                            Total
                          </div>
                          <div className="DiamondCtwSum4 d-flex justify-content-center align-items-center border-end fw-bold px-2">
                            {fixedValues(lastDiamondTableTotal?.diaCtw, 3)}
                          </div>
                          <div className="DiamondPriceSum4 d-flex justify-content-center align-items-center border-end fw-bold"></div>
                          <div className="DiamondDiscountSum4 d-flex justify-content-center align-items-center border-end fw-bold"></div>
                          <div className="DiamondAmountSum4 d-flex justify-content-center align-items-center fw-bold px-2">
                            {NumberWithCommas(
                              lastDiamondTableTotal?.diamondAmount,
                              2
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="csTypeSum4 ">
                        <div className="d-flex border height34Sum4 ">
                          <div className="cstypeTextSum4 border-end fw-bold d-flex justify-content-center align-items-center">
                            CS Type
                          </div>
                          <div className="cstypeTextSum4 border-end fw-bold d-flex justify-content-center align-items-center">
                            CS Ctw
                          </div>
                          <div className="cstypeTextSum4 border-end fw-bold d-flex justify-content-center align-items-center">
                            CS Price
                          </div>
                          <div className="cstypeTextSum4 fw-bold d-flex justify-content-center align-items-center">
                            CS Amount
                          </div>
                        </div>
                        {lastColorStoneTable.length > 0 ?
                          (lastColorStoneTable.map((e, i) => {
                            const isLast = i === lastColorStoneTable.length - 1;
                            return (
                              <div
                                className={`d-flex border-start border-end ${!isLast ? "border-bottom" : ""}`}
                                key={i}
                              >
                                <div className="cstypeTextSum4 border-end d-flex justify-content-center">
                                  {e?.name}
                                </div>
                                <div className="cstypeTextSum4 border-end d-flex justify-content-center pe-2">
                                  {e?.totalWeight}
                                </div>
                                <div className="cstypeTextSum4 border-end d-flex justify-content-center pe-2">
                                  {NumberWithCommas(e?.rate, 2)}
                                </div>
                                <div className="cstypeTextSum4 d-flex justify-content-center pe-2">
                                  {NumberWithCommas(e?.totalAmount, 2)}
                                </div>
                              </div>
                            );
                          }))
                          :
                          (
                            <div className="d-flex border-start border-end" style={{ height: "15px" }}>
                              <div className="cstypeTextSum4 border-end d-flex justify-content-center"></div>
                              <div className="cstypeTextSum4 border-end d-flex justify-content-center pe-2"></div>
                              <div className="cstypeTextSum4 border-end d-flex justify-content-center pe-2"></div>
                              <div className="cstypeTextSum4 d-flex justify-content-center pe-2"></div>
                            </div>
                          )
                        }
                        <div className="d-flex border bg_total_sum4 height34Sum4">
                          <div className="cstypeTextSum4 border-end d-flex justify-content-center fw-bold align-items-center"></div>
                          <div className="cstypeTextSum4 border-end d-flex justify-content-center pe-2 fw-bold align-items-center">
                            {fixedValues(lastColorStoneTableTotal?.clrCtw, 3)}
                          </div>
                          <div className="cstypeTextSum4 border-end d-flex justify-content-end pe-2 fw-bold align-items-center"></div>
                          <div className="cstypeTextSum4 d-flex justify-content-center pe-2 fw-bold align-items-center">
                            {NumberWithCommas(
                              lastColorStoneTableTotal?.colorStoneAmount,
                              2
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
          {msg}
        </p>
      )}

      {/* <Loader /> */}
    </>
  );
};

export default Summary4;

