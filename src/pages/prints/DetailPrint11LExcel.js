// http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=Yi1ib29rMzA=&evn=U2FsZQ==&pnm=RGV0YWlsIFByaW50IDExIEw=&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&etp=ZXhjZWw=&ctv=NzE=
import React, { useState, useEffect, useRef } from "react";
import {
  NumberWithCommas,
  apiCall,
  checkImageExists,
  checkMsg,
  fixedValues,
  formatAmount,
  handleGlobalImgError,
  handleImageError,
  handlePrint,
  isObjectEmpty,
  taxGenrator,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import defaultImg from "../../assets/img/default.jpg";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";
import cloneDeep from "lodash/cloneDeep";
const DetailPrint11LExcel = ({
  urls,
  token,
  invoiceNo,
  printName,
  evn,
  ApiVer,
}) => {
  const [loader, setLoader] = useState(true);
  const [json0Data, setJson0Data] = useState({});
  const [json1Data, setJson1Data] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const printedRef = useRef(false);
  // const [diamondSize, setDiamondSize] = useState(true);
  // const [image, setImage] = useState(true);
  // const [setting, setSetting] = useState(true);
  // const [tunch, setTunch] = useState(true);
  const [msg, setMsg] = useState("");
  const [gold, setGold] = useState({
    gold14k: false,
    gold18k: false,
  });
  const [total, setTotal] = useState({
    pcs: 0,
    diaWt: 0,
    diaAmount: 0,
    totalAmount: 0,
    totalGold: 0,
    totalLabour: 0,
    totalJewelleryAmount: 0,
    grandTotal: 0,
  });
  const [summary, setSummary] = useState({
    gold14k: 0,
    gold18k: 0,
    diamondWt: 0,
    stoneWt: 0,
    grossWt: 0,
  });
  const [len, totalLen] = useState(0);
  const [goldTotal, setGoldTotal] = useState([]);
  const [totalArr, setTotalArr] = useState([]);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const [discount, setDiscount] = useState("");

  const handleImageErrors = () => {
    setIsImageWorking(false);
  };

  const [excelData, setExcelData] = useState([]);
  const [bankDetail, setBankDetail] = useState([]);

  const loadData = (data) => {
    let goldRateFind = [];
    let golds = { ...gold };
    setJson0Data(data.BillPrint_Json[0]);
    let resultAr = [];
    let totals = { ...total };
    let summaries = { ...summary };
    let fineWt = 0;
    let metalsArr = [];
    data?.BillPrint_Json1.forEach((e, i) => {
      let objects = {
        GroupJob: e?.GroupJob,
        netWt: e?.NetWt,
        rate: 0,
        amount: 0,
      };
      let elementsArr = [];
      let obj = { ...e };
      // obj.metalRateGold = e?.MetalAmount;
      obj.metalRateGold = 0;
      obj.metalRateAmount = 0;
      obj.alloy = 0;
      obj.totalGold = 0;
      obj.metalNetWeightWithLossWt = e?.NetWt + e?.LossWt;
      let totalCol = {
        pcs: 0,
        diaWt: 0,
        diaAmount: 0,
        settingAmount: 0,
      };
      obj.puregoldWeightWithLoss = obj?.NetWt + obj?.LossWt;
      data?.BillPrint_Json2.forEach((ele) => {
        if (ele?.StockBarcode === e?.SrJobno) {
          totalCol.settingAmount +=
            ele?.SettingAmount / data.BillPrint_Json[0]?.CurrencyExchRate;
          obj.puregoldWeightWithLoss += ele?.FineWt;
          if (
            ele?.MasterManagement_DiamondStoneTypeid === 1 ||
            ele?.MasterManagement_DiamondStoneTypeid === 2
          ) {
            totalCol.pcs += ele?.Pcs;
            let obj = { ...ele };
            obj.Amount =
              ele?.Amount / data?.BillPrint_Json[0]?.CurrencyExchRate;
            obj.SettingAmount =
              ele?.SettingAmount / data?.BillPrint_Json[0]?.CurrencyExchRate;
            let findIndex = elementsArr.findIndex(
              (elem, index) =>
                elem?.ShapeName === ele?.ShapeName &&
                elem?.QualityName === ele?.QualityName &&
                elem?.Colorname === ele?.Colorname &&
                elem?.SizeName === ele?.SizeName
            );
            if (findIndex === -1) {
              elementsArr.push(obj);
            } else {
              elementsArr[findIndex].Rate =
                (elementsArr[findIndex].Amount / elementsArr[findIndex].Wt +
                  ele.Amount / ele.Wt) /
                2;
              elementsArr[findIndex].Wt += ele?.Wt;
              elementsArr[findIndex].Amount += ele?.Amount;
              elementsArr[findIndex].SettingAmount += ele?.SettingAmount;
              elementsArr[findIndex].Pcs += ele?.Pcs;
              if (elementsArr[findIndex].GroupName !== "") {
                elementsArr[findIndex].SizeName =
                  elementsArr[findIndex].GroupName;
              }
              if (ele.GroupName !== "") {
                elementsArr[findIndex].SizeName = ele.GroupName;
              }
            }
            totals.pcs += ele?.Pcs;
            totals.diaWt += ele?.Wt;
            totals.diaAmount +=
              ele?.Amount / data.BillPrint_Json[0]?.CurrencyExchRate;
            totals.totalAmount +=
              ele?.SettingAmount / data.BillPrint_Json[0]?.CurrencyExchRate;
            totalCol.diaWt += ele?.Wt;
            totalCol.diaAmount +=
              ele?.Amount / data.BillPrint_Json[0]?.CurrencyExchRate;
            if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
              summaries.diamondWt += ele?.Wt;
            } else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
              summaries.stoneWt += ele?.Wt;
            }
          }
          if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
            obj.alloy += ele?.Amount / data.BillPrint_Json[0]?.CurrencyExchRate;
            obj.totalGold +=
              ele?.Amount / data.BillPrint_Json[0]?.CurrencyExchRate;
            totals.totalGold +=
              ele?.Amount / data.BillPrint_Json[0]?.CurrencyExchRate;
          }
          if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
            objects.rate += ele?.Rate;
            objects.amount += ele?.Amount;
            if (ele?.QualityName === "18K") {
              summaries.gold18k += ele?.Wt;
              golds.gold18k = true;
            } else if (ele?.QualityName === "14K") {
              golds.gold14k = true;
              summaries.gold14k += ele?.Wt;
            }

            let findRecord = metalsArr.findIndex(
              (elem, index) =>
                elem?.label === ele?.ShapeName + " " + ele?.QualityName
            );
            if (findRecord === -1) {
              metalsArr.push({
                label: ele?.ShapeName + " " + ele?.QualityName,
                value: ele?.Wt,
              });
            } else {
              metalsArr[findRecord].value += ele?.Wt;
            }
            obj.totalGold +=
              ele?.Amount / data.BillPrint_Json[0]?.CurrencyExchRate;
            totals.totalGold +=
              ele?.Amount / data.BillPrint_Json[0]?.CurrencyExchRate;
            // obj.metalRateGold += (ele?.Rate / data.BillPrint_Json[0]?.CurrencyExchRate);
            obj.metalRateGold += ele?.Rate;
            obj.metalRateAmount += ele?.Amount;
            fineWt = ele?.FineWt;
          }
        }
      });
      summaries.grossWt += e?.grosswt;
      obj.OtherCharges =
        e?.OtherCharges / data.BillPrint_Json[0]?.CurrencyExchRate;
      totals.totalLabour +=
        e?.MakingAmount / data.BillPrint_Json[0]?.CurrencyExchRate;
      obj.MakingAmount =
        e?.MakingAmount / data.BillPrint_Json[0]?.CurrencyExchRate;
      totals.totalJewelleryAmount +=
        e?.TotalAmount / data.BillPrint_Json[0]?.CurrencyExchRate;
      obj.TotalAmount =
        e?.TotalAmount / data.BillPrint_Json[0]?.CurrencyExchRate;
      obj.materials = elementsArr;
      obj.totalCol = totalCol;
      obj.fineWt = fineWt;
      resultAr.push(obj);
      if (e?.GroupJob !== "") {
        let findGroup = goldRateFind.findIndex(
          (elem) => elem.GroupJob === e?.GroupJob
        );
        if (findGroup === -1) {
          goldRateFind.push(objects);
        } else {
          goldRateFind[findGroup].netWt += objects?.netWt;
          goldRateFind[findGroup].rate += objects.rate;
          goldRateFind[findGroup].amount += objects.amount;
        }
      }
    });
    let taxValue = taxGenrator(
      data?.BillPrint_Json[0],
      totals?.totalJewelleryAmount
    );
    taxValue.length > 0 &&
      taxValue.forEach((e) => {
        totals.grandTotal +=
          +e?.amount / data.BillPrint_Json[0]?.CurrencyExchRate;
      });
    totals.grandTotal +=
      data?.BillPrint_Json[0]?.AddLess + totals?.totalJewelleryAmount;
    setTaxes(taxValue);
    setSummary(summaries);
    setTotal(totals);
    // setJson1Data(resultAr);
    setLoader(false);
    setGold(golds);

    let newArr = [];
    resultAr.forEach((e) => {
      let obj = { ...e };
      let findRecord = newArr.findIndex(
        (ele, ind) => ele?.GroupJobid === e?.GroupJobid && e?.GroupJobid !== 0
      );
      if (findRecord === -1) {
        newArr.push(obj);
      } else {
        if (newArr[findRecord]?.SrJobno !== newArr[findRecord]?.GroupJob) {
          newArr[findRecord].SrJobno = obj?.SrJobno;
          newArr[findRecord].designno = obj?.designno;
          newArr[findRecord].MetalColor = obj?.MetalColor;
          newArr[findRecord].DesignImage = obj?.DesignImage;
          newArr[findRecord].MetalPurity = obj?.MetalPurity;
          newArr[findRecord].MetalColor = obj?.MetalColor;
        }
        newArr[findRecord].grosswt += obj?.grosswt;
        newArr[findRecord].NetWt += obj?.NetWt;
        newArr[findRecord].LossPer += obj?.LossPer;
        newArr[findRecord].PureNetWt += obj?.PureNetWt;
        if (newArr[findRecord].metalRateGold !== obj?.metalRateGold) {
          let amountValue =
            (newArr[findRecord].metalRateAmount + obj?.metalRateAmount) /
            data.BillPrint_Json[0]?.CurrencyExchRate;
          newArr[findRecord].metalRateGold =
            amountValue / newArr[findRecord].NetWt;
        }
        // newArr[findRecord].metalRateGold += obj?.metalRateGold;
        // newArr[findRecord].metalRateGold = (newArr[findRecord].metalRateGold+obj?.metalRateGold)/(newArr[findRecord].NetWt*data.BillPrint_Json[0]?.CurrencyExchRate);
        newArr[findRecord].alloy += obj?.alloy;
        newArr[findRecord].totalGold += obj?.totalGold;
        newArr[findRecord].OtherCharges += obj?.OtherCharges;
        newArr[findRecord].MakingAmount += obj?.MakingAmount;
        newArr[findRecord].TotalAmount += obj?.TotalAmount;

        newArr[findRecord].metalNetWeightWithLossWt +=
          obj?.metalNetWeightWithLossWt;

        newArr[findRecord].totalCol.pcs += obj.totalCol.pcs;
        newArr[findRecord].totalCol.diaWt += obj.totalCol.diaWt;
        newArr[findRecord].totalCol.diaAmount += obj.totalCol.diaAmount;
        newArr[findRecord].totalCol.settingAmount += obj.totalCol.settingAmount;

        let materialArr = [newArr[findRecord].materials, e.materials];
        let materials = [];
        materialArr.forEach((element) => {
          element.forEach((ele, ind) => {
            let findRecords = materials.findIndex(
              (elem, index) =>
                elem?.ShapeName === ele?.ShapeName &&
                elem?.Colorname === ele?.Colorname &&
                elem?.QualityName === ele?.QualityName &&
                elem?.Rate === ele?.Rate &&
                elem?.MasterManagement_DiamondStoneTypeid ===
                  ele?.MasterManagement_DiamondStoneTypeid
            );
            // newArr[findRecord].totalCol.pcs += ele?.Pcs;
            // newArr[findRecord].totalCol.diaWt += ele?.Wt;
            // newArr[findRecord].totalCol.diaAmount += ele?.Amount;
            // newArr[findRecord].totalCol.settingAmount += ele?.SettingAmount;
            if (findRecords === -1) {
              materials.push(ele);
            } else {
              materials[findRecords].Pcs += ele?.Pcs;
              materials[findRecords].Wt += ele?.Wt;
              materials[findRecords].Amount += ele?.Amount;
              materials[findRecords].SettingRate = ele?.SettingRate;
              materials[findRecords].SettingAmount += ele?.SettingAmount;
            }
          });
        });
        newArr[findRecord].materials = materials;
      }
    });
    setJson1Data(newArr);

    let finalArr = [];

    newArr.forEach((e) => {
      let findRecord = goldRateFind.findIndex(
        (elem) => elem?.GroupJob === e?.GroupJob
      );
      let obj = { ...e };
      if (findRecord === -1) {
        obj.goldPrice = obj?.metalRateGold;
        finalArr.push(obj);
      } else {
        let goldPrice =
          goldRateFind[findRecord].amount /
          (data.BillPrint_Json[0]?.CurrencyExchRate *
            goldRateFind[findRecord].netWt);
        obj.goldPrice = goldPrice;
        finalArr.push(obj);
      }
    });

    let excelArr = [];
    finalArr.forEach((e, i) => {
      let obj = { ...e };
      let length = obj?.materials?.length > 10 ? obj?.materials?.length : 10;
      let goldArr = [
        {
          label: "Quality",
          value: `${e?.MetalPurity} ${e?.MetalColor}`,
        },
        {
          label: "Gross Weight(Gms)",
          value: `${fixedValues(e?.grosswt, 3)} G`,
        },
        {
          label: "Net Weight",
          value: `${fixedValues(e?.metalNetWeightWithLossWt, 3)} G`,
        },
        {
          label: "Gold Loss",
          value: `${fixedValues(e?.LossPer, 0)}%`,
        },
        {
          label: "Pure Gold weight with Loss",
          value: `${fixedValues(e?.PureNetWt, 3)} G `,
        },
        {
          label: "Gold Price",
          value: `${NumberWithCommas(e?.goldPrice, 2)}`,
        },
        {
          label: "Alloy",
          value: `${NumberWithCommas(e?.alloy, 2)}`,
        },
        {
          label: "Total Gold",
          value: `${NumberWithCommas(e?.totalGold, 2)}`,
        },
      ];
      Array.from({ length: length }).forEach((ele, ind) => {
        let object = {
          srNo: ind === 0 ? i + 1 : "",
          designNo: ind === 0 ? obj?.designno : "",
          SrJobno: ind === 0 ? obj?.SrJobno : "",
          metalColor: ind === 1 ? obj?.MetalColor : "",
          img: ind === 2 ? obj?.DesignImage : "",
          isImg: ind === 2 ? true : false,
          tunch: ind === 6 ? NumberWithCommas(obj?.Tunch, 3) : "",
          grossWt: ind === 7 ? fixedValues(obj?.grosswt, 3) : "",
          size: ind === 8 ? obj?.Size : "",
          huid: ind === 9 ? obj?.HUID : "",
          diamondShape: obj?.materials[ind]
            ? obj?.materials[ind]?.ShapeName
            : "",
          diamondSize: obj?.materials[ind]
            ? obj?.materials[ind]?.GroupName === ""
              ? obj?.materials[ind]?.SizeName
              : obj?.materials[ind]?.MasterManagement_DiamondStoneTypeid === 2
              ? obj?.materials[ind]?.SizeName
              : obj?.materials[ind]?.GroupName
            : "",
          diamondPcs: obj?.materials[ind] ? obj?.materials[ind]?.Pcs : "",
          diamondWt: obj?.materials[ind] ? obj?.materials[ind]?.Wt : "",
          diamondRate: obj?.materials[ind]
            ? NumberWithCommas(obj?.materials[ind]?.Rate, 2)
            : "",
          diamondAmount: obj?.materials[ind] ? obj?.materials[ind]?.Amount : "",
          diamondSettingType: obj?.materials[ind]
            ? obj?.materials[ind]?.SettingName
            : "",
          diamondSettingRate: obj?.materials[ind]
            ? NumberWithCommas(obj?.materials[ind]?.SettingRate, 2)
            : "",
          diamondSettingAmount: obj?.materials[ind]
            ? obj?.materials[ind]?.SettingAmount
            : "",
          goldLabel: goldArr[ind] && ind < 7 ? goldArr[ind]?.label : "",
          goldValue: goldArr[ind] && ind < 7 ? goldArr[ind]?.value : "",
          otherChanges: ind === 0 ? NumberWithCommas(e?.OtherCharges, 2) : "",
          labourAmount: ind === 0 ? NumberWithCommas(e?.MakingAmount, 2) : "",
          totalAmount: ind === 0 ? NumberWithCommas(e?.TotalAmount, 2) : "",
          totalLine: false,
        };
        excelArr.push(object);
      });
      let objectTotal = {
        srNo: "",
        designNo: "",
        SrJobno: "",
        metalColor: "",
        img: "",
        isImg: false,
        tunch: "",
        grossWt: "",
        size: "",
        huid: "",
        diamondShape: "Total",
        diamondSize: "No of Pieces",
        diamondPcs: obj?.totalCol?.pcs,
        diamondWt: e?.totalCol?.diaWt,
        diamondRate: "Diamond total",
        diamondAmount: e?.totalCol?.diaAmount,
        diamondSettingType: "",
        diamondSettingRate: "Setting Total (Currency)",
        diamondSettingAmount: e?.totalCol?.settingAmount,
        goldLabel: goldArr[7]?.label,
        goldValue: goldArr[7]?.value,
        otherChanges: NumberWithCommas(e?.OtherCharges, 2),
        labourAmount: NumberWithCommas(e?.MakingAmount, 2),
        totalAmount: NumberWithCommas(e?.TotalAmount, 2),
        totalLine: true,
      };
      excelArr.push(objectTotal);
    });
    setExcelData(excelArr);
    let goldArr = [
      // {
      //   label: "GOLD 18K: ",
      //   value: `${fixedValues(summaries?.gold18k, 3)} gm`,
      // },
      {
        label: "Diamond Wt: ",
        value: `${fixedValues(summaries?.diamondWt, 3)} cts`,
      },
      {
        label: "Stone Wt:",
        value: `${fixedValues(summaries?.stoneWt, 3)} cts`,
      },
      {
        label: "Gross Wt:",
        value: `${fixedValues(summaries?.grossWt, 3)} gm`,
      },
    ];
    metalsArr.sort((a, b) => {
      if (a.label !== b.label) {
        return a.label.localeCompare(b.label); // Sort by name
      }
    });
    metalsArr.reverse();
    metalsArr.forEach((e, i) => {
      goldArr.unshift({
        label: e?.label,
        value: `${fixedValues(e?.value, 3)} gm`,
      });
    });
    // golds?.gold14k && goldArr.unshift({ label: "GOLD 14K: ", value: `${fixedValues(summaries?.gold14k, 3)} gm` });
    let totalArr = [];

    totalArr.push({
      label: "Discount",
      value: discount,
    });

    taxValue.forEach((e) => {
      let obj = { ...e };
      totalArr.push({
        label: `${e?.name} per ${e?.per}`,
        value: NumberWithCommas(
          +e?.amount / data.BillPrint_Json[0]?.CurrencyExchRate,
          2
        ),
      });
    });
    totalArr.push({
      label: `${data.BillPrint_Json[0]?.AddLess > 0 ? "Add" : "Less"}`,
      value: `${fixedValues(Math.abs(data.BillPrint_Json[0]?.AddLess), 2)}`,
    });
    let lens =
      totalArr.length > goldArr.length ? totalArr.length : goldArr.length;
    totalLen(lens);

    setGoldTotal(goldArr);
    setTotalArr(totalArr);

    let bankArr = [
      {
        label: "Bank Detail",
        value: "",
      },
      {
        label: "Bank Name: ",
        value: data.BillPrint_Json[0]?.bankname,
      },
      {
        label: "Branch: ",
        value: data.BillPrint_Json[0]?.bankaddress,
      },
      {
        label: "Account Name:",
        value: data.BillPrint_Json[0]?.accountname,
      },
      {
        label: "Account No.:",
        value: data.BillPrint_Json[0]?.accountnumber,
      },
      {
        label: "RTGS/NEFT IFSC: ",
        value: data.BillPrint_Json[0]?.rtgs_neft_ifsc,
      },
    ];

    setBankDetail(bankArr);

    if (!printedRef.current) {
      // only if we’ve never printed
      printedRef.current = true; // lock it
      setTimeout(() => {
        document.getElementById("test-table-xls-button")?.click(); // optional chaining avoids null crash
      }, 2000);
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discount]);

  // new.........................................................
  const [result, setResult] = useState(null);
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
            loadDataSecond(data?.Data);
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
        console.log(error);
      }
    };
    sendData();
  }, []);
  function loadDataSecond(data) {
    let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    data.BillPrint_Json[0].address = address;

    const datas = OrganizeDataPrint(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );

    let met_shp_arr = MetalShapeNameWiseArr(datas?.json2);

    let tot_met = 0;
    let tot_met_wt = 0;
    met_shp_arr?.forEach((e, i) => {
      tot_met += e?.Amount;
      tot_met_wt += e?.metalfinewt;
    });
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
          finalArr[find_record].totals.metal.IsPrimaryMetal +=
            b?.totals?.metal?.IsPrimaryMetal;
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
          finalArr[find_record].metal = [
            ...finalArr[find_record]?.metal,
            ...b?.metal,
          ]?.flat();
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

          // finalArr[find_record].totals.diamonds.Wt += b?.totals?.diamonds?.Wt;
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
          // finalArr[find_record].misc_d = [...finalArr[find_record]?.misc ,...b?.misc]?.flat();
        }
      }
    });

    datas.resultArray = finalArr;

    //after groupjob
    datas?.resultArray?.forEach((e) => {
      let dia2 = [];
      e?.diamonds?.forEach((el) => {
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
          dia2[findrec].Rate += ell?.Rate;
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

      //colorstone
      // let clr_rop0 = []; //wt
      // let clr_rop1 = []; //pcs

      // e?.colorstone?.forEach((el) => {
      //   if(el?.isRateOnPcs === 0){
      //     clr_rop0?.push(el)
      //   }else{
      //     clr_rop1?.push(el)
      //   }
      // })
      // let clr2 = [];
      // let clr2_2 = [];
      // let clr_all = [];

      // clr_rop0?.forEach((el) => {
      //   let findrec = clr2?.findIndex((a) => a?.ShapeName === el?.ShapeName && a?.QualityName === el?.QualityName && a?.Colorname === el?.Colorname)
      //   if(findrec === -1){
      //     clr2.push(el);
      //   }else{
      //       clr2[findrec].Wt += el?.Wt;
      //       clr2[findrec].Pcs += el?.Pcs;
      //       clr2[findrec].Amount += el?.Amount;
      //       clr2[findrec].Rate += el?.Rate;
      //       if(clr2[findrec]?.SizeName !== el?.SizeName){
      //         clr2[findrec].SizeName = 'Mix'
      //       }
      //   }

      // });

      // clr_rop0 = clr2;

      // // clr_all.push(clr_rop0)

      // clr_rop1?.forEach((el) => {
      //   let findrec = clr2_2?.findIndex((a) => a?.ShapeName === el?.ShapeName && a?.QualityName === el?.QualityName && a?.Colorname === el?.Colorname)
      //   if(findrec === -1){
      //     clr2_2.push(el);
      //   }else{
      //       clr2_2[findrec].Wt += el?.Wt;
      //       clr2_2[findrec].Pcs += el?.Pcs;
      //       clr2_2[findrec].Amount += el?.Amount;
      //       clr2_2[findrec].Rate += el?.Rate;
      //       if(clr2_2[findrec]?.SizeName !== el?.SizeName){
      //         clr2_2[findrec].SizeName = 'Mix'
      //       }
      //   }

      // });

      // clr_rop1 = clr2_2;

      // clr_all.push(clr_rop0)
      // clr_all.push(clr_rop1)

      // e.colorstone = [...clr_all]?.flat();

      //misc
      let misc0 = [];
      e?.misc?.forEach((el) => {
        if (el?.IsHSCOE === 0) {
          misc0?.push(el);
        }
      });

      e.misc = misc0;

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

    diarndotherarr5 = [...diaonlyrndarr6, diaObj];
    const sortedData = diarndotherarr5?.sort(customSort);
    setDiscount(datas?.resultArray[0]?.DiscountAmt);
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

  if (result?.resultArray && !result.resultArray[0]?.__isTransformed) {
    console.log("Transforming resultArray only once");

    result.resultArray = result.resultArray.map((item) => {
      const originalOtherDetails = item.other_details || [];
      const existingHallmark = originalOtherDetails.find(
        (d) => d.label?.trim().toLowerCase() === "hallmark charges"
      );
      const certificationCharge = originalOtherDetails.find(
        (d) => d.label?.trim().toLowerCase() === "certification charge"
      );

      const updatedOtherDetails = [
        {
          label: "HallMark",
          value: existingHallmark?.value ?? "",
          amtval: existingHallmark?.amtval ?? "",
        },
        {
          label: "IGL/SGL",
          value: certificationCharge?.value ?? "",
          amtval: certificationCharge?.amtval ?? "",
        },
        {
          label: "CS",
          value: "",
          amtval: "",
        },
        {
          label: "Others",
          value: item?.OtherCharges
            ? parseFloat(item.OtherCharges).toFixed(2)
            : "",
          amtval: item?.OtherCharges ? parseFloat(item.OtherCharges) : "",
        },
      ];

      return {
        ...item,
        other_details: updatedOtherDetails,
        __isTransformed: true, // add flag
      };
    });
  }

  const grandTotal = result?.resultArray?.reduce((sum, e) => {
    const metalAmt = Number(e.totals?.metal?.Amount) || 0;
    const makingAmt = Number(e.MakingAmount) || 0;
    const diamondAmt = Number(e.totals?.diamonds?.Amount) || 0;
    const csAmt = Number(e.totals?.colorstone?.Amount) || 0;
    const other0 = parseFloat(e.OtherCharges || 0);
    return sum + metalAmt + makingAmt + diamondAmt + csAmt + other0;
  }, 0);

  console.log("totalArr", totalArr);

  return loader ? (
    <Loader />
  ) : msg === "" ? (
    <>
      <div className="container max_width_container pad_60_allPrint mt-4 d-none">
        <ReactHTMLTableToExcel
          id="test-table-xls-button"
          className="download-table-xls-button btn btn-success text-black bg-success px-2 py-1 fs-5 d-none"
          table="table-to-xls"
          filename={`DetailPrint11_${json0Data?.InvoiceNo}_${Date.now()}`}
          sheet="tablexls"
          buttonText="Download as XLS"
        />
        <table id="table-to-xls">
          <tbody>
            <tr></tr>
            <tr>
              <td width={45}></td>
              <td
                colSpan={4}
                style={{
                  borderLeft: "1px solid black",
                  borderTop: "1px solid black",
                  padding: "1px",
                }}
              >
                {json0Data?.CompanyFullName}
              </td>
              <td style={{ borderTop: "1px solid black", padding: "1px" }}></td>
              <td style={{ borderTop: "1px solid black", padding: "1px" }}></td>
              <td style={{ borderTop: "1px solid black", padding: "1px" }}></td>
              <td
                style={{
                  borderTop: "1px solid black",
                  borderRight: "1px solid black",
                  padding: "1px",
                }}
                className="d-block text-end"
                width={180}
              >
                {isImageWorking && json0Data?.PrintLogo !== "" && (
                  <img
                    src={json0Data?.PrintLogo}
                    alt=""
                    className="w-25 h-auto ms-auto d-block object-fit-contain"
                    onError={handleImageErrors}
                    height={120}
                    width={150}
                  />
                )}
              </td>
            </tr>
            <tr>
              <td></td>
              <td
                colSpan={4}
                style={{ borderLeft: "1px solid black", padding: "1px" }}
              >
                {json0Data?.CompanyAddress}
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td
                style={{ borderRight: "1px solid black", padding: "1px" }}
              ></td>
            </tr>
            <tr>
              <td></td>
              <td
                colSpan={4}
                style={{ borderLeft: "1px solid black", padding: "1px" }}
              >
                {json0Data?.CompanyAddress2}
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td
                style={{ borderRight: "1px solid black", padding: "1px" }}
              ></td>
            </tr>
            <tr>
              <td></td>
              <td
                colSpan={4}
                style={{ borderLeft: "1px solid black", padding: "1px" }}
              >
                {json0Data?.CompanyCity} {json0Data?.CompanyPinCode}{" "}
                {json0Data?.CompanyState} {json0Data?.CompanyCountry}
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td
                style={{ borderRight: "1px solid black", padding: "1px" }}
              ></td>
            </tr>
            <tr>
              <td></td>
              <td
                colSpan={4}
                style={{ borderLeft: "1px solid black", padding: "1px" }}
              >
                {json0Data?.CompanyEmail} | {json0Data?.CompanyWebsite}
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td
                style={{ borderRight: "1px solid black", padding: "1px" }}
              ></td>
            </tr>
            <tr>
              <td></td>
              <td
                colSpan={4}
                style={{
                  borderLeft: "1px solid black",
                  borderBottom: "1px solid black",
                  padding: "1px",
                }}
              >
                {json0Data?.Company_VAT_GST_No} | {json0Data?.Cust_CST_STATE}-
                {json0Data?.Company_CST_STATE_No} | PAN-{json0Data?.Pannumber}
              </td>
              <td
                style={{ borderBottom: "1px solid black", padding: "1px" }}
              ></td>
              <td
                style={{ borderBottom: "1px solid black", padding: "1px" }}
              ></td>
              <td
                style={{ borderBottom: "1px solid black", padding: "1px" }}
              ></td>
              <td
                style={{
                  borderRight: "1px solid black",
                  borderBottom: "1px solid black",
                  padding: "1px",
                }}
              ></td>
            </tr>

            {/* company address and logo */}
            <tr>
              <td></td>
              <td
                colSpan={4}
                style={{ borderLeft: "1px solid black", padding: "1px" }}
              ></td>
              <td></td>
              <td></td>
              <td></td>
              <td
                style={{ borderRight: "1px solid black", padding: "1px" }}
                className="d-block"
                align="right"
                width={150}
              ></td>
            </tr>
            <tr>
              <td></td>
              <td
                colSpan={4}
                style={{ borderLeft: "1px solid black", padding: "1px" }}
              >
                Issue To
              </td>
              <td
                colSpan={4}
                style={{ borderRight: "1px solid black", padding: "1px" }}
                className="d-block"
                align="right"
                width={150}
              >
                invoice#:{json0Data?.InvoiceNo}{" "}
              </td>
            </tr>
            <tr>
              <td></td>
              <td
                colSpan={4}
                style={{ borderLeft: "1px solid black", padding: "1px" }}
              >
                {json0Data?.customerfirmname}
              </td>
              <td
                colSpan={4}
                style={{ borderRight: "1px solid black", padding: "1px" }}
                className="d-block"
                align="right"
                width={150}
              >
                GSTIN:{" "}
                {json0Data?.Cust_VAT_GST_No !== "" &&
                  `${json0Data?.Cust_VAT_GST_No} | `}{" "}
                {json0Data?.Cust_CST_STATE} {json0Data?.Cust_CST_STATE_No}
              </td>
            </tr>
            <tr>
              <td></td>
              <td
                colSpan={4}
                style={{ borderLeft: "1px solid black", padding: "1px" }}
              >
                {json0Data?.customerAddress1}
              </td>
              <td
                colSpan={4}
                style={{ borderRight: "1px solid black", padding: "1px" }}
                className="d-block"
                align="right"
                width={150}
              >
                Terms: {json0Data?.DueDays} Days
              </td>
            </tr>
            <tr>
              <td></td>
              <td
                colSpan={4}
                style={{ borderLeft: "1px solid black", padding: "1px" }}
              >
                {json0Data?.customerAddress2}
              </td>
              <td
                colSpan={4}
                style={{ borderRight: "1px solid black", padding: "1px" }}
                className="d-block"
                align="right"
                width={150}
              >
                Due Date: {json0Data?.DueDate}
              </td>
            </tr>
            {json0Data?.customerAddress3 !== "" && (
              <tr>
                <td></td>
                <td
                  colSpan={4}
                  style={{ borderLeft: "1px solid black", padding: "1px" }}
                >
                  {json0Data?.customerAddress3}
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td
                  style={{ borderRight: "1px solid black", padding: "1px" }}
                  className="d-block"
                  align="right"
                  width={150}
                ></td>
              </tr>
            )}
            <tr>
              <td></td>
              <td
                colSpan={4}
                style={{ borderLeft: "1px solid black", padding: "1px" }}
              >
                {json0Data?.customercity}, {json0Data?.State}-
                {json0Data?.PinCode}
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td
                style={{ borderRight: "1px solid black", padding: "1px" }}
                className="d-block"
                align="right"
                width={150}
              ></td>
            </tr>
            <tr>
              <td></td>
              <td
                colSpan={4}
                style={{ borderLeft: "1px solid black", padding: "1px" }}
              >
                Tel: {json0Data?.customermobileno}
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td
                style={{ borderRight: "1px solid black", padding: "1px" }}
                className="d-block"
                align="right"
                width={150}
              ></td>
            </tr>
            <tr>
              <td></td>
              <td
                colSpan={4}
                style={{
                  borderLeft: "1px solid black",
                  borderBottom: "1px solid black",
                  padding: "1px",
                }}
              >
                {json0Data?.customeremail1}
              </td>

              <td
                style={{
                  borderBottom: "1px solid black",
                }}
              ></td>
              <td
                style={{
                  borderBottom: "1px solid black",
                }}
              ></td>
              <td
                style={{
                  borderBottom: "1px solid black",
                }}
              ></td>
              <td
                style={{
                  borderRight: "1px solid black",
                  borderBottom: "1px solid black",
                  padding: "1px",
                }}
                className="d-block"
                align="right"
                width={150}
              ></td>
            </tr>

            {/* table header */}
            <tr></tr>
            <tr>
              <td></td>
              <td
                rowSpan={2}
                style={{
                  border: "1px solid #000",
                  padding: "1px",
                  verticalAlign: "middle",
                  textAlign: "center",
                }}
                align="center"
              >
                <b>Sr. No.</b>
              </td>
              <td
                rowSpan={2}
                style={{
                  borderTop: "1px  solid #000",
                  borderRight: "1px  solid #000",
                  borderBottom: "1px  solid #000",
                  padding: "1px",
                  verticalAlign: "middle",
                  textAlign: "center",
                }}
                align="center"
              >
                <b>Design Detail</b>
              </td>
              <td
                colSpan={5}
                style={{
                  borderTop: "1px solid #000",
                  borderRight: "1px solid #000",
                  borderBottom: "1px solid #000",
                  padding: "1px",
                  verticalAlign: "middle",
                }}
                align="center"
              >
                <b>Product Name - Sub Category</b>
              </td>
              <td
                rowSpan={2}
                style={{
                  borderTop: "1px solid #000",
                  borderRight: "1px solid #000",
                  padding: "1px",
                  borderBottom: "1px solid #000",
                  verticalAlign: "middle",
                  textAlign: "center",
                }}
                align="center"
              >
                <b>Total Jewellery</b>
              </td>
            </tr>
            <tr>
              <td></td>
              <td
                style={{
                  borderTop: "1px solid #000",
                  borderRight: "1px solid #000",
                  borderBottom: "1px solid #000",
                  padding: "1px",
                  verticalAlign: "middle",
                }}
              ></td>
              <td
                style={{
                  borderTop: "1px solid #000",
                  borderRight: "1px solid #000",
                  borderBottom: "1px solid #000",
                  padding: "1px",
                  verticalAlign: "middle",
                }}
                align="center"
                width={90}
              >
                <b>Size</b>
              </td>
              <td
                style={{
                  borderTop: "1px solid #000",
                  borderRight: "1px  solid #000",
                  borderBottom: "1px  solid #000",
                  padding: "1px",
                  verticalAlign: "middle",
                }}
                align="center"
              >
                <b>Wt</b>
              </td>
              <td
                style={{
                  borderTop: "1px  solid #000",
                  borderRight: "1px  solid #000",
                  borderBottom: "1px  solid #000",
                  padding: "1px",
                  verticalAlign: "middle",
                }}
                align="center"
              >
                <b>Price</b>
              </td>
              <td
                style={{
                  borderTop: "1px  solid #000",
                  borderRight: "1px  solid #000",
                  borderBottom: "1px  solid #000",
                  padding: "1px",
                  verticalAlign: "middle",
                }}
                align="center"
              >
                <b>Amount</b>
              </td>
            </tr>

            {/* table data */}
            {result?.resultArray?.map((e, i) => {
              
              console.log("TCL: eeeeeeee",e )
              return (
                <React.Fragment key={i}>
                  <tr>
                    <td></td>
                    <td
                      width={90}
                      rowSpan={
                        6 + (e?.diamonds?.length == 0 ? 1 : e?.diamonds?.length)
                      }
                      style={{
                        border: "1px solid #000",
                        padding: "1px",
                        verticalAlign: "middle",
                      }}
                      align="center"
                    >
                      {i + 1}
                    </td>
                    <td
                      width={200}
                      rowSpan={
                        6 + (e?.diamonds?.length == 0 ? 1 : e?.diamonds?.length)
                      }
                      style={{
                        borderRight: "1px solid #000",
                        borderBottom: "1px solid #000",
                        padding: "1px",
                        verticalAlign: "top",
                      }}
                    >
                      {e?.designno && <span>{e.designno}</span>}
                      <span
                        style={{
                          opacity: "0px",
                          color: "white",
                          backgroundColor: "transparent",
                        }}
                      >
                        1111111111
                      </span>
                      {e?.SrJobno && <span>{e.SrJobno}</span>}
                      {e?.CDNDesignImage && (
                        <div
                          style={{
                            marginTop: 3,
                            marginRight: 2,
                          }}
                        >
                          <img
                            src={e.CDNDesignImage}
                            alt=""
                            onError={(eve) =>
                              handleGlobalImgError(eve, json0Data?.DefImage)
                            }
                            width="160"
                            height="160"
                            style={{ display: "block", margin: "0 auto" }}
                          />
                        </div>
                      )}
                      <div>
                        {e?.grosswt && ` ${fixedValues(e.grosswt, 3)} gm Gross`}
                        {e?.size && <> Size {e.size}</>}
                      </div>
                    </td>

                    <td
                      rowSpan={
                        e?.diamonds?.length == 0 ? 1 : e?.diamonds?.length
                      }
                      style={{
                        borderRight: "1px solid #000",
                        verticalAlign: "middle",
                      }}
                      align="center"
                    >
                      Diamond Detail
                    </td>

                    <td
                      style={{
                        borderRight: "1px solid #000",
                        verticalAlign: "middle",
                      }}
                    >
                      {e.diamonds[0]?.SizeName}
                    </td>
                    <td
                      style={{
                        borderRight: "1px solid #000",
                        verticalAlign: "middle",
                      }}
                    >
                      {e.diamonds[0]?.Wt}
                    </td>
                    <td
                      style={{
                        borderRight: "1px solid #000",
                        verticalAlign: "middle",
                      }}
                    >
                      {e.diamonds[0]?.Rate}
                    </td>
                    <td
                      style={{
                        borderRight: "1px solid #000",
                        verticalAlign: "middle",
                      }}
                    >
                      {e.diamonds[0]?.Amount}
                    </td>
                    <td
                      rowSpan={
                        e?.diamonds?.length == 0 ? 1 : e?.diamonds?.length
                      }
                      style={{
                        borderRight: "1px solid #000",
                        verticalAlign: "middle",
                      }}
                    >
                      {e?.totals?.diamonds?.Amount}
                    </td>
                  </tr>

                  {e?.diamonds?.slice(1).map((d, ind) => (
                    <tr key={`metal-${i}-${ind}`}>
                      <td></td>
                      <td style={{ borderRight: "1px solid #000" }}>
                        {d.SizeName}
                      </td>
                      <td style={{ borderRight: "1px solid #000" }}>{d.Wt}</td>
                      <td style={{ borderRight: "1px solid #000" }}>
                        {d.Rate}
                      </td>
                      <td style={{ borderRight: "1px solid #000" }}>
                        {d.Amount}
                      </td>
                      <td></td>
                    </tr>
                  ))}

                  <tr>
                    <td></td>
                    <td
                      style={{
                        borderTop: "1px solid #000",
                        borderRight: "1px solid #000",
                        borderBottom: "1px solid #000",
                        verticalAlign: "middle",
                      }}
                      rowSpan={2}
                      align="center"
                    >
                      Gold & Making
                    </td>
                    <td
                      style={{
                        borderTop: "1px solid #000",
                        borderRight: "1px solid #000",
                      }}
                    >
                      {e.metal[0].ShapeName} {e.metal[0].QualityName}
                    </td>
                    <td
                      style={{
                        borderTop: "1px solid #000",
                        borderRight: "1px solid #000",
                      }}
                    >
                      {" "}
                      {/* {e?.IsPrimaryMetal === 1
                        ? (e?.metal?.[0]?.Wt - e?.LossWt)?.toFixed(3)
                        : e?.metal?.[0]?.Wt?.toFixed(3)} */}
                      {e?.totals?.metal?.Wt}
                    </td>
                    <td
                      style={{
                        borderTop: "1px solid #000",
                        borderRight: "1px solid #000",
                      }}
                    >
                      {/* {e.metal[0].Rate} */}
                      {e?.totals?.metal?.Rate}
                    </td>
                    <td
                      style={{
                        borderTop: "1px solid #000",
                        borderRight: "1px solid #000",
                      }}
                    >
                      {/* {e.metal[0].Amount} */}
                      {e?.totals?.metal?.Amount}
                    </td>
                    <td
                      rowSpan={2}
                      style={{
                        borderRight: "1px solid #000",
                        borderBottom: "1px solid #000",
                        borderTop: "1px solid #000",
                        verticalAlign: "middle",
                      }}
                    >
                      {e?.totals?.metal?.Amount + e?.MakingAmount}
                    </td>
                  </tr>

                  <tr>
                    <td></td>
                    <td
                      style={{
                        borderBottom: "1px solid #000",
                        borderRight: "1px solid #000",
                      }}
                    >
                      Making
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #000",
                        borderRight: "1px solid #000",
                      }}
                    >
                      {e?.MakingChargeOnid == 3 ? e?.grosswt : e?.NetWt}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #000",
                        borderRight: "1px solid #000",
                      }}
                    >
                      {e?.MaKingCharge_Unit}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #000",
                        borderRight: "1px solid #000",
                      }}
                    >
                      {" "}
                      {formatAmount(
                        e?.MakingAmount / result?.header?.CurrencyExchRate
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td></td>
                    <td
                      align="center"
                      rowSpan={4}
                      style={{
                        borderRight: "1px solid #000",
                        verticalAlign: "middle",
                      }}
                    >
                      Other Charges
                    </td>
                    <td style={{ borderRight: "1px solid #000" }}>
                      {e?.other_details[0]?.label}
                    </td>
                    <td style={{ borderRight: "1px solid #000" }}>
                      {e?.other_details[0]?.label == "HallMark"
                        ? ""
                        : e?.other_details[0]?.value}
                    </td>
                    <td style={{ borderRight: "1px solid #000" }}>
                      {e?.other_details[0]?.label == "HallMark"
                        ? ""
                        : e?.other_details[0]?.value}
                    </td>
                    <td style={{ borderRight: "1px solid #000" }}>
                      {e.other_details[0]?.value == ""
                        ? 0
                        : e.other_details[0]?.value}
                    </td>
                    <td
                      rowSpan={4}
                      style={{
                        borderRight: "1px solid #000",
                        verticalAlign: "middle",
                      }}
                    >
                      {e?.OtherCharges + e.totals?.colorstone?.Amount}
                    </td>
                    {e?.other_details?.slice(1).map((d, ind, arr) => {
                      const isLast = ind === arr.length - 1;
                      return (
                        <tr key={`other-${i}-${ind}`}>
                          <td
                            style={{
                              borderRight: "1px solid #000",
                              // ...(isLast && {
                              //   borderBottom: "1px solid #000",
                              // }),
                            }}
                          ></td>
                          <td
                            style={{
                              borderRight: "1px solid #000",
                              ...(isLast && {
                                borderBottom: "1px solid #000",
                              }),
                            }}
                          >
                            {d.label}
                          </td>
                          <td
                            style={{
                              borderRight: "1px solid #000",
                              ...(isLast && {
                                borderBottom: "1px solid #000",
                              }),
                            }}
                          >
                            {d.label === "CS"
                              ? e.totals?.colorstone?.Wt
                              : d.label === "IGL/SGL"
                              ? ""
                              : d.label === "Others"
                              ? ""
                              : d.value}
                          </td>
                          <td
                            style={{
                              borderRight: "1px solid #000",
                              ...(isLast && {
                                borderBottom: "1px solid #000",
                              }),
                            }}
                          >
                            {d.label === "CS"
                              ? e.totals?.colorstone?.Rate
                              : d.label === "IGL/SGL"
                              ? ""
                              : d.label === "Others"
                              ? ""
                              : d.value}
                          </td>
                          <td
                            style={{
                              borderRight: "1px solid #000",
                              ...(isLast && {
                                borderBottom: "1px solid #000",
                              }),
                            }}
                          >
                            {d.label === "CS"
                              ? e.totals?.colorstone?.Amount
                              : d.label === "Others"
                              ? (d.value || 0) -
                                  (parseFloat(
                                    e?.other_details?.[0]?.value || 0
                                  ) +
                                    parseFloat(
                                      e?.other_details?.[1]?.value || 0
                                    )) || 0
                              : d.value || 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tr>

                  <tr>
                    <td></td>
                    <td
                      colSpan={2}
                      width={290}
                      style={{
                        border: "1px solid #000",
                        padding: "1px",
                        verticalAlign: "middle",
                      }}
                      align="center"
                    ></td>
                    <td
                      style={{
                        borderRight: "1px solid #000",
                        padding: "1px",
                        borderBottom: `1px solid`,
                        borderTop: `1px solid`,
                        verticalAlign: "middle",
                      }}
                    >
                      <b>Total</b>{" "}
                    </td>
                    <td
                      style={{
                        borderRight: "1px solid #000",
                        padding: "1px",
                        borderBottom: `1px solid`,
                        borderTop: `1px solid`,
                        verticalAlign: "middle",
                      }}
                    ></td>
                    <td
                      width={90}
                      style={{
                        borderRight: "1px solid #000",
                        padding: "1px",
                        borderBottom: `1px solid`,
                        borderTop: `1px solid`,
                        verticalAlign: "middle",
                      }}
                      align="right"
                    ></td>
                    <td
                      width={90}
                      style={{
                        borderRight: "1px solid #000",
                        padding: "1px",
                        borderBottom: `1px solid`,
                        borderTop: `1px solid`,
                        verticalAlign: "middle",
                      }}
                      align="right"
                    ></td>
                    <td
                      width={90}
                      style={{
                        borderRight: "1px solid #000",
                        padding: "1px",
                        borderBottom: `1px solid`,
                        borderTop: `1px solid`,
                        verticalAlign: "middle",
                      }}
                      align="center"
                    ></td>
                    <td
                      width={90}
                      style={{
                        borderRight: "1px solid #000",
                        padding: "1px",
                        borderBottom: `1px solid`,
                        borderTop: `1px solid`,
                        verticalAlign: "middle",
                      }}
                      align="right"
                    >
                      <b>
                        {/* {console.log(
                          "total........",
                          e?.TotalAmount
                        )} */}
                         {e?.TotalAmount}
                        {/* {(parseFloat(e?.totals?.metal?.Amount) || 0) +
                          (parseFloat(e?.MakingAmount) || 0) +
                          (parseFloat(e?.totals?.diamonds?.Amount) || 0) +
                          (parseFloat(e?.totals?.colorstone?.Amount) || 0) +
                          (parseFloat(e?.OtherCharges) || 0)} */}
                      </b>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}

            {/* table total */}
            <tr>
              <td></td>
              <td
                width={90}
                colSpan={7}
                style={{
                  border: "1px solid #000",
                  padding: "1px",
                  verticalAlign: "middle",
                }}
                align="right"
              >
                Total Amt
              </td>
              <td
                width={90}
                style={{
                  border: "1px solid #000",
                  padding: "1px",
                  verticalAlign: "middle",
                }}
                align="right"
              > 
             { console.log("TCL:grandTotal ", total)}
               
                
                  <span>
                    {result?.header?.CurrencyCode}
                    {"  "}
                  </span>
                  <span>{total?.totalJewelleryAmount?.toFixed(2)}</span>
             
              </td>
            </tr>

            {len > 0 &&
              Array.from({ length: len }).map((e, i) => {
                return (
                  <tr key={i}>
                    <td></td>
                    {i === 0 && (
                      <td
                        colSpan={3}
                        rowSpan={len}
                        width={560}
                        style={{
                          borderBottom: "1px solid #000",
                          borderLeft: "1px solid #000",
                          borderRight: "1px solid #000",
                          padding: "1px",
                          verticalAlign: "middle",
                        }}
                        VALIGN="TOP"
                      >
                        {i === 0 && (
                          <>
                            <span>Remark :</span>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: json0Data?.PrintRemark,
                              }}
                              className="p-1 text-break"
                            ></span>
                          </>
                        )}
                      </td>
                    )}
                    <td
                      style={{
                        borderBottom: i === len - 1 && "1px solid #000",
                        borderRight: "1px solid #000",
                        padding: "1px",
                        verticalAlign: "middle",
                      }}
                    >
                      <b></b>{" "}
                    </td>
                    <td
                      colSpan={3}
                      style={{
                        borderBottom: i === len - 1 && "1px solid #000",
                        borderRight: "1px solid #000",
                        padding: "1px",
                        verticalAlign: "middle",
                      }}
                    >
                      {totalArr[i] && totalArr[i]?.label}{" "}
                    </td>
                    <td
                      style={{
                        borderBottom: i === len - 1 && "1px solid #000",
                        borderRight: "1px solid #000",
                        padding: "1px",
                        color: "#000 !important",
                        verticalAlign: "middle",
                      }}
                      align="right"
                      color="black"
                    >
                      <b>
                        {totalArr[i] && (
                          <>
                            {<span>{result?.header?.CurrencyCode} </span>}
                            {totalArr[i]?.label === "Add" && (
                              <span> {totalArr[i]?.value}</span>
                            )}
                            {totalArr[i]?.label === "Less" && (
                              <span>{totalArr[i]?.value}</span>
                            )}
                            {totalArr[i]?.label !== "Less" &&
                              totalArr[i]?.label !== "Add" && (
                                <span> {totalArr[i]?.value}</span>
                              )}
                          </>
                        )}
                      </b>
                    </td>
                  </tr>
                );
              })}

            <tr>
              <td></td>
              <td
                colSpan={7}
                style={{
                  borderLeft: "1px solid",
                  borderRight: "1px solid",
                  borderBottom: "1px solid",
                  verticalAlign: "middle",
                }}
                align="right"
              >
                <b>Grand Total</b>{" "}
              </td>
              <td
                style={{
                  borderRight: "1px solid",
                  borderBottom: "1px solid",
                  verticalAlign: "middle",
                }}
                align="right"
              >
                &nbsp;
               
                  <span>{result?.header?.CurrencyCode}</span>{" "}
                {/* <span>  {(
                    (grandTotal || 0) +
                    (parseFloat(totalArr[1]?.value) || 0) +
                    (parseFloat(totalArr[2]?.value) || 0) +
                    (totalArr[3]?.label === "Add"
                      ? parseFloat(totalArr[3]?.value) || 0
                      : -(parseFloat(totalArr[3]?.value) || 0)) -
                    (parseFloat(totalArr[0]?.value) || 0)
                  ).toFixed(2)}</span> */}

                  <span>{total?.grandTotal?.toFixed(2)}</span>
                
              </td>
            </tr>

            {bankDetail.length > 0 &&
              bankDetail.map((e, i) => {
                return (
                  <tr key={i}>
                    <td></td>
                    <td
                      colSpan={8}
                      style={{
                        borderLeft: "1px solid",
                        borderRight: "1px solid",
                        borderBottom: `${
                          i === bankDetail.length - 1 && "1px solid"
                        }`,
                        verticalAlign: "middle",
                      }}
                    >
                      {e?.label} {e?.value}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
      {msg}
    </p>
  );
};

export default DetailPrint11LExcel;
