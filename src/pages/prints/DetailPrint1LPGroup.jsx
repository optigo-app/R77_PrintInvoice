import React, { useEffect } from "react";
import "../../assets/css/prints/detailPrint1.css";
import { useState } from "react";
import { NumberWithCommas, apiCall, brokarageDetail, checkMsg, discountCriteria, fixedValues, formatAmount, handleImageError, handlePrint, isObjectEmpty, otherAmountDetail, taxGenrator, } from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import { cloneDeep } from "lodash";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";

const DetailPrint1LGroup = ({ token, invoiceNo, printName, urls, evn, ApiVer, }) => {
  const [image, setImage] = useState(false);
  const [loader, setLoader] = useState(true);
  const [json0Data, setJson0Data] = useState({});
  const [json1Data, setJson1Data] = useState([]);
  const [json1Data2, setJson1Data2] = useState([]);

  const [MetShpWise, setMetShpWise] = useState([]);
  const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
  const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);

  // eslint-disable-next-line no-unused-vars
  const [detailtPrintR, setdetailtPrintR] = useState(
    atob(printName).toLowerCase() === "detail print r" ? true : false
  );
  const [detailtPrintL, setdetailtPrintL] = useState(
    atob(printName).toLowerCase() === "detail print1 group(l)" ? true : false
  );

  const [detailtPrintp, setdetailtPrintp] = useState(
    atob(printName).toLowerCase() === "detail print1 group(p)" ? true : false
  );

  const [dp1lp, setdp1lp] = useState(
    atob(printName).toLowerCase() === "detail print1 (l)" ||
      atob(printName).toLowerCase() === "detail print1 (p)"
      ? true
      : false
  );
  const [dpp, setdpp] = useState(
    atob(printName).toLowerCase() === "detail print1 (p)" ? true : false
  );

  const [brokarage, setBrokarage] = useState([]);
  const [msg, setMsg] = useState("");
  const [total, setTotal] = useState({
    diamondPcs: 0,
    diamondWt: 0,
    diamondAmount: 0,
    metalWt: 0,
    metalNL: 0,
    metalAmount: 0,
    colorStonePcs: 0,
    colorStoneWt: 0,
    colorStoneAmount: 0,
    totalAmount: 0,
    discountTotalAmount: 0,
    sgstAmount: 0,
    cgstAmount: 0,
    withoutDiscountTotalAmount: 0,
    withDiscountTaxAmount: 0,
    labourAmount: 0,
    netWt: 0,
  });
  const [summary, setSummary] = useState({
    gold24Kt: 0,
    grossWt: 0,
    gDWt: 0,
    netWt: 0,
    diamondWt: 0,
    diamondpcs: 0,
    stoneWt: 0,
    stonePcs: 0,
    metalAmount: 0,
    diamondAmount: 0,
    colorStoneAmount: 0,
    makingAmount: 0,
    otherCharges: 0,
    addLess: 0,
    total: 0,
  });
  const [totalMetalWts, settotalMetalWts] = useState(0);
  const [address, setAddress] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [detailPrintK, setDetailPrintK] = useState(
    atob(printName).toLowerCase() === "detail print k" ? true : false
  );
  const [checkBox, setCheckBox] = useState({
    image: true,
    brokarage: true,
  });

  const [finalD, setFinalD] = useState({});

  const [diamondDetails, setDiamondDetails] = useState([]);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };

  const handleChange = (e) => {
    const { name, checked } = e?.target;
    setCheckBox({ ...checkBox, [name]: checked });
  };

  // eslint-disable-next-line no-unused-vars
  const findDiamond = (obj, diamondArr) => {
    let recordIndex = diamondArr.findIndex(
      (e, i) =>
        e?.ShapeName === obj?.ShapeName &&
        e?.QualityName === obj?.QualityName &&
        e?.Colorname === obj?.Colorname
    );
    return recordIndex;
  };

  const loadData = (data) => {
    let label = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    setAddress(label);
    setJson0Data(data?.BillPrint_Json[0]);
    setJson1Data2(data?.BillPrint_Json2);
    setLoader(false);
    let datas = OrganizeDataPrint(
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
    })    
    setNotGoldMetalTotal(tot_met);
    setNotGoldMetalWtTotal(tot_met_wt);

    let finalArr = [];
    let totalMetalWt = 0;
    let miscChargesTotals = 0;
    let metalWts = 0;
    datas?.resultArray?.map((e) => {
      let primaryMetalWt = 0;
      let netWtlossWt = 0;
      let counts = 0;
      let str_discountOn = discountCriteriaList(e); 
      let otherMisc = e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling;
      let findMetal = e?.metal?.find((ele) => ele?.IsPrimaryMetal === 1);
      if (findMetal !== undefined) {
        primaryMetalWt = findMetal?.Wt;
        totalMetalWt += findMetal?.Wt;
      }
      e?.metal?.forEach((ele) => {
        if(ele?.IsPrimaryMetal === 1){
          netWtlossWt += ele?.Wt;
        }else{
          counts++; 
        }
      });
      if(counts ===  0){
        netWtlossWt = e?.NetWt + e?.LossWt;
      }
      metalWts += netWtlossWt;
      let obj = cloneDeep(e);
      obj.netWtlossWt = netWtlossWt;
      let miscChargesTotal = e?.OtherCharges + e?.TotalDiamondHandling;
      let miscChargesss = 0;
      let miscCharges = data?.BillPrint_Json2?.filter((ele) => {
        if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
          if (ele?.IsHSCOE !== 0 && ele?.StockBarcode === e?.SrJobno) {
            // miscChargesTotal += ele?.Amount;
            miscChargesTotal += ele?.Amount;
            return ele;
          } else if (ele?.IsHSCOE === 0 && ele?.StockBarcode === e?.SrJobno) {
            miscChargesss += ele?.Amount;
            miscChargesTotal += ele?.Amount;
          }
        }
      });

      miscChargesTotals += miscChargesTotal;
      obj.primaryMetalWt = primaryMetalWt;
      obj.otherMisc = otherMisc;
      obj.miscCharges = miscCharges;
      obj.miscChargesTotal = miscChargesTotal;
      obj.miscChargesss = miscChargesss;
      obj.str_discountOn = str_discountOn;
      finalArr.push(obj);
    });
    datas.mainTotal.miscChargesTotals = miscChargesTotals;
    settotalMetalWts(totalMetalWt);
    datas.resultArray = finalArr;
    datas.mainTotal.metalWts = metalWts;
    setFinalD(datas);
    let brok = brokarageDetail(data?.BillPrint_Json[0]?.Brokerage);
    setBrokarage(brok);
    let diamondDetail = [];
    data?.BillPrint_Json2?.forEach((e) => {
      if (e?.MasterManagement_DiamondStoneTypeid === 1) {
        let findDiamond = diamondDetail?.findIndex(
          (ele, ind) =>
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
    let findOther = remaingDia?.findIndex(
      (elee) => elee?.ShapeName === "OTHER"
    );
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
  };

  useEffect(() => {
    const sendData = async () => {
      try {
        const data = await apiCall( token, invoiceNo, printName, urls, evn, ApiVer );
        if (data?.Status === "200") {
          let isEmpty = isObjectEmpty(data?.Data);
          if (!isEmpty) {
            loadData(data?.Data);
            let arr = organizeDataSample(
              data?.Data?.BillPrint_Json[0],
              data?.Data?.BillPrint_Json1,
              data?.Data?.BillPrint_Json2
            );
            setJson1Data(arr);
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
  }, []);

  const organizeDataSample = (hr, ar1, ar2) => {
    let resultArr = [];
    let totals = {
      diamondPcs: 0,
      diamondWt: 0,
      diamondAmount: 0,
      metalWt: 0,
      metalNL: 0,
      metalAmount: 0,
      colorStonePcs: 0,
      colorStoneWt: 0,
      colorStoneAmount: 0,
      totalAmount: 0,
      discountTotalAmount: 0,
      sgstAmount: 0,
      cgstAmount: 0,
      withoutDiscountTotalAmount: 0,
      withDiscountTaxAmount: 0,
      labourAmount: 0,
      netWt: 0,
    };

    let summary = {
      gold24Kt: 0,
      grossWt: 0,
      gDWt: 0,
      netWt: 0,
      diamondWt: 0,
      diamondpcs: 0,
      stoneWt: 0,
      stonePcs: 0,
      metalAmount: 0,
      diamondAmount: 0,
      colorStoneAmount: 0,
      makingAmount: 0,
      otherCharges: 0,
      addLess: 0,
      total: 0,
    };

    // eslint-disable-next-line array-callback-return
    ar1?.map((e) => {
      let metalWt = 0;
      if (detailtPrintR || detailtPrintL || detailtPrintp) {
        summary.gold24Kt = summary.gold24Kt + e?.PureNetWt;
      }
      if (detailPrintK) {
        summary.gold24Kt += e.PureNetWt;
      }
      let totalAmounts = e?.DiscountAmt + e?.TotalAmount;
      let OtherAmountDetail = otherAmountDetail(e?.OtherAmtDetail);
      let totalOther =
        e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling;
      totals.labourAmount +=
        e?.MakingAmount + e?.TotalCsSetcost + e?.TotalDiaSetcost;
      let obj = { ...e };
      obj.OtherAmountDetail = OtherAmountDetail;
      obj.totalOther = totalOther;
      obj.SettingAmount = 0;
      obj.netWtlossWt = 0;
      let counts = 0;
      let diamondArr = [];
      let metalArr = [];
      let colorStoneArr = [];
      let otherMisc = e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling;
      let primaryMetalWt = 0;
      let diamondsTotal = {
        Pcs: 0,
        Wt: 0,
        Amount: 0,
        RMwt: 0,
      };
      let metalTotal = {
        Pcs: 0,
        Wt: 0,
        Amount: 0,
      };
      let colorStonesTotal = {
        Pcs: 0,
        Wt: 0,
        Amount: 0,
      };
      let discountTotalAmount = 0;

      // eslint-disable-next-line array-callback-return
      ar2?.map((el) => {
        if (e?.SrJobno === el?.StockBarcode) {
          if (el?.MasterManagement_DiamondStoneTypeid === 1) {
            diamondArr.push(el);
            diamondsTotal.Pcs += el?.Pcs;
            diamondsTotal.Wt += el?.Wt;
            diamondsTotal.Amount += el?.Amount;
            diamondsTotal.RMwt += el?.RMwt;
            totals.diamondPcs += el?.Pcs;
            totals.diamondWt += el?.Wt;
            totals.diamondAmount += el?.Amount;
            summary.diamondWt += el?.Wt;
            summary.diamondpcs += el?.Pcs;
            summary.diamondAmount += el?.Amount;
            metalWt += el?.Wt;
          }
          if (el?.MasterManagement_DiamondStoneTypeid === 4) {
            metalArr.push(el);
            metalTotal.Pcs += el?.Pcs;
            metalTotal.Wt += el?.Wt;
            metalTotal.Amount += el?.Amount;
            if (!detailtPrintR) {
              if (!detailPrintK) {
                summary.gold24Kt += el?.FineWt;
              }
            }
            if (el?.IsPrimaryMetal === 1) {
              primaryMetalWt += el?.Wt;
              obj.netWtlossWt += el?.Wt;
            }else{
              counts += 1;
            }
            // totals.metalWt += el?.Wt;
            totals.metalAmount += el?.Amount;
            summary.metalAmount += el?.Amount;
          }
          if (el?.MasterManagement_DiamondStoneTypeid === 2) {
            colorStoneArr.push(el);
            colorStonesTotal.Pcs += el?.Pcs;
            colorStonesTotal.Wt += el?.Wt;
            colorStonesTotal.Amount += el?.Amount;
            totals.colorStonePcs += el?.Pcs;
            totals.colorStoneWt += el?.Wt;
            totals.colorStoneAmount += el?.Amount;
            summary.stoneWt += el?.Wt;
            summary.stonePcs += el?.Pcs;
            summary.colorStoneAmount += el?.Amount;
          }
          obj.SettingAmount += el?.SettingAmount;
          summary.makingAmount += el?.SettingAmount;
        }
      });
      if(counts === 0){
        obj.netWtlossWt = e?.NetWt + e?.LossWt;
      }
      metalWt = metalWt / 5 + e?.NetWt;
      totals.metalWt += metalWt;
      // totals.metalWt += e?.DiamondCTWwithLoss / 5;
      metalTotal.Wt = metalWt;
      // discountTotalAmount = e?.TotalAmount - e?.DiscountAmt;
      discountTotalAmount = e?.TotalAmount;
      summary.grossWt += e?.grosswt;
      summary.gDWt += e?.MetalDiaWt + e?.DiamondCTWwithLoss / 5;
      summary.netWt += e?.NetWt;
      summary.makingAmount += e?.MakingAmount;
      // summary.otherCharges += e?.OtherCharges;
      summary.otherCharges += totalOther;
      obj.diamonds = diamondArr;
      obj.primaryMetalWt = primaryMetalWt;
      obj.metals = metalArr;
      obj.colorStones = colorStoneArr;
      obj.diamondsTotal = diamondsTotal;
      obj.metalTotal = metalTotal;
      obj.colorStonesTotal = colorStonesTotal;
      obj.discountTotalAmount = discountTotalAmount;
      obj.totalAmounts = totalAmounts;
      obj.otherMisc = otherMisc;
      if (obj.metals[0]) {
        obj.metals[0].Wt = metalWt;
      }
      totals.totalAmount += e?.TotalAmount;
      totals.discountTotalAmount += obj?.DiscountAmt;
      totals.withoutDiscountTotalAmount += e?.TotalAmount;
      totals.netWt += e?.NetWt + e?.LossWt;
      resultArr.push(obj);
      // setDiamondDetails(diamondDetails);
    });
    summary.addLess = hr?.AddLess;
    summary.total =
      summary?.metalAmount +
      summary?.diamondAmount +
      summary?.colorStoneAmount +
      summary?.makingAmount +
      summary?.otherCharges +
      summary?.addLess;
    totals.cgstAmount = (totals?.withoutDiscountTotalAmount * hr?.CGST) / 100;
    totals.sgstAmount = (totals?.withoutDiscountTotalAmount * hr?.SGST) / 100;
    let taxValue = taxGenrator(hr, totals?.totalAmount);
    setTaxes(taxValue);
    taxValue?.length > 0 &&
      taxValue.forEach((e, i) => {
        totals.withDiscountTaxAmount += +e?.amount;
      });
    totals.withDiscountTaxAmount +=
      hr?.AddLess + totals?.totalAmount - hr?.Privilege_discount;
    setSummary(summary);
    setTotal(totals);
    return resultArr;
  };

  const d = json1Data2?.reduce((grouped, ee) => {
    if (
      ee?.MasterManagement_DiamondStoneTypeid === 1 &&
      ee?.ShapeName === "Round"
    ) {
      const key = `${ee?.ShapeName} ${ee?.QualityName} ${ee?.Colorname}`;

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(ee);
    }
    return grouped;
  }, {});

  const er = json1Data2?.reduce((grouped, ei) => {
    if (
      ei?.MasterManagement_DiamondStoneTypeid === 1 &&
      ei?.ShapeName !== "Round"
    ) {
      const key = `${ei?.ShapeName} ${ei?.QualityName} ${ei?.Colorname}`;

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(ei);
    }
    return grouped;
  }, {});

  const calculatedData = [];
  const calData = [];

  for (const key in d) {
    if (d.hasOwnProperty(key)) {
      const group = d[key];

      const totalPcs = group?.reduce((sum, item) => sum + item.Pcs, 0);
      const totalWt = group?.reduce((sum, item) => sum + item.Wt, 0);

      calculatedData.push({
        ShapeName: key,
        totalPcs,
        totalWt,
      });
    }
  }
  for (const key in er) {
    if (er.hasOwnProperty(key)) {
      const group = er[key];

      const totalPcs = group.reduce((sum, item) => sum + item.Pcs, 0);
      const totalWt = group.reduce((sum, item) => sum + item.Wt, 0);

      calData.push({
        ShapeName: key,
        totalPcs,
        totalWt,
      });
    }
  }
  let totalPcs1 = 0;
  let totalWt1 = 0;

  for (const obj of calData) {
    totalPcs1 += obj.totalPcs;
    totalWt1 += obj.totalWt;
  }
  let other = {
    ShapeName: "OTHER",
    totalPcs: totalPcs1,
    totalWt: totalWt1,
  };
  const discountCriteriaList = [
    { key: 'DiamondDiscount', isAmountKey: 'IsDiamondDiscInAmount', label: 'Diamond' ,disAmount:"DiamondDiscountAmount" },
    { key: 'MetalDiscount', isAmountKey: 'IsMetalDiscInAmount', label: 'Metal' ,disAmount:"MetalDiscountAmount" },
    { key: 'StoneDiscount', isAmountKey: 'IsStoneDiscInAmount', label: 'Colorstone' ,disAmount:"StoneDiscountAmount" },
    { key: 'LabourDiscount', isAmountKey: 'IsLabourDiscInAmount', label: 'Labour' ,disAmount:"LabourDiscountAmount" },
    { key: 'SolitaireDiscount', isAmountKey: 'IsSolitaireDiscInAmount', label: 'Solitaire' ,disAmount:"SolitaireDiscountAmount1" },
    { key: 'MiscDiscount', isAmountKey: 'IsMiscDiscInAmount', label: 'Misc' ,disAmount:"MiscDiscountAmount" },
  ];
  calculatedData.push(other);

  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <div className="container containerDetailPrint1 pt-4 ">
          <div className="pad_60_allPrint">
            {/* buttons */}
            <div className="d-flex justify-content-end align-items-center print_sec_sum4 mb-4 pt-4">
              <div className="form-check d-flex align-items-center detailPrint1L_font_13">
                <input
                  className="border-dark me-2"
                  type="checkbox"
                  checked={checkBox?.image}
                  onChange={(e) => handleChange(e)}
                  name="image"
                />
                <label className="pt-1">With Image</label>
              </div>
              <div className="form-check detailPrint1L_font_14">
                <input
                  type="button"
                  className="btn_white blue mt-0"
                  value="Print"
                  onClick={(e) => handlePrint(e)}
                />
              </div>
            </div>
            {/* header line*/}
            <div className="jewelleryPackingList mb-2 mt-2 recordDetailPrint1">
              <p
                className={`p-2 fw-bold text-white`}
                style={{ fontSize: "20px" }}
              >
                {json0Data?.PrintHeadLabel}
              </p>
            </div>
            {/* header */}
            <div className="d-flex align-items-center pb-2 border-bottom  recordDetailPrint1">
              <div className="col-6">
                <h2 className="fw-bold detailPrint1L_font_16 pb-1">
                  {json0Data?.CompanyFullName}
                </h2>
                <p className="lhDetailPrint1 pb-1">
                  {json0Data?.CompanyAddress}
                </p>
                <p className="lhDetailPrint1 pb-1">
                  {json0Data?.CompanyAddress2}
                </p>
                <p className="lhDetailPrint1 pb-1">
                  {json0Data?.CompanyCity}-{json0Data?.CompanyPinCode},{" "}
                  {json0Data?.CompanyState}({json0Data?.CompanyCountry})
                </p>
                <p className="lhDetailPrint1 pb-1">
                  T {json0Data?.CompanyTellNo}
                </p>
                <p className="lhDetailPrint1 pb-1" pb-1>
                  {json0Data?.CompanyEmail} | {json0Data?.CompanyWebsite}
                </p>
                <p className="lhDetailPrint1 pb-1">
                  {json0Data?.Company_VAT_GST_No} |{" "}
                  {json0Data?.Company_CST_STATE}-
                  {json0Data?.Company_CST_STATE_No} | PAN-{json0Data?.Pannumber}
                </p>
              </div>
              <div className="col-6">
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
                {/* <img
                  src={json0Data?.PrintLogo}
                  alt=""
                  className="w-25 d-block ms-auto"
                /> */}
              </div>
            </div>
            {/* address */}
            <div className="d-flex border-start border-end  border-bottom mb-1 recordDetailPrint1">
              <div className="col-4 border-end  p-1">
                <p className="lhDetailPrint1 pb-1">{json0Data?.lblBillTo}</p>
                <p className="lhDetailPrint1 fw-bold detailPrint1L_font_14 pb-1">
                  {json0Data?.customerfirmname}
                </p>
                <p className="lhDetailPrint1 pb-1">
                  {json0Data?.customerAddress2}
                </p>
                <p className="lhDetailPrint1 pb-1">
                  {json0Data?.customerAddress1}
                </p>
                <p className="lhDetailPrint1 pb-1">
                  {json0Data?.customerAddress3}
                </p>
                <p className="lhDetailPrint1 pb-1">
                  {json0Data?.customercity}
                  {json0Data?.customerpincode}
                </p>
                <p className="lhDetailPrint1 pb-1">
                  {json0Data?.customeremail1}
                </p>
                <p className="lhDetailPrint1 pb-1">{json0Data?.vat_cst_pan}</p>
                <p className="lhDetailPrint1 pb-1">
                  {json0Data?.Cust_CST_STATE}-{json0Data?.Cust_CST_STATE_No}
                </p>
              </div>
              <div className="col-4 border-end  p-1">
                <p className="lhDetailPrint1 pb-1">Ship To,</p>
                <p className="lhDetailPrint1 fw-bold detailPrint1L_font_14 pb-1">
                  {json0Data?.customerfirmname}
                </p>
                {dp1lp ? (
                  <>
                    {address?.map((e, i) => {
                      return (
                        <p className="lhDetailPrint1 pb-1" key={i}>
                          {e}
                        </p>
                      );
                    })}
                  </>
                ) : (
                  <>
                    <p className="lhDetailPrint1 pb-1">{json0Data?.CustName}</p>
                    <p className="lhDetailPrint1 pb-1">
                      {json0Data?.customerstreet}
                    </p>
                    <p className="lhDetailPrint1 pb-1">
                      {json0Data?.customercity} {json0Data?.State}
                    </p>
                    <p className="lhDetailPrint1 pb-1">
                      {json0Data?.CompanyCountry}-{json0Data?.PinCode}
                    </p>
                    <p className="lhDetailPrint1 pb-1">
                      Mobile No : {json0Data?.customermobileno}
                    </p>
                  </>
                )}
              </div>
              <div className="col-4 p-1 ps-2">
                <div className="d-flex pb-1 pt-1">
                  <p className="fw-bold col-2 me-2">BILL NO </p>
                  <p className="col-10">{json0Data?.InvoiceNo}</p>
                </div>
                <div className="d-flex pb-1">
                  <p className="fw-bold col-2 me-2">DATE </p>
                  <p className="col-10">{json0Data?.EntryDate}</p>
                </div>
                <div className="d-flex pb-1">
                  <p className="fw-bold col-2 me-2">HSN </p>
                  <p className="col-10">{json0Data?.HSN_No}</p>
                </div>
              </div>
            </div>
            {/* table header*/}
            <div className="d-flex w-100 border-top  recordDetailPrint1 lightGrey detailPrint1L_font_11">
              <div className="srNoDetailprint11 border-end border-start  border-bottom d-flex justify-content-center align-items-center flex-column">
                <p className="fw-bold">Sr </p>
              </div>
              <div className="designDetalPrint1 border-end  p-1 border-bottom d-flex justify-content-center align-items-center">
                <p className="fw-bold p-1">Design</p>
              </div>
              <div
                className={`${
                  dpp ? "diamondDetailPrint1p" : "diamondDetailPrint1l"
                } border-end `}
              >
                <div className="d-grid h-100">
                  <div className="d-flex justify-content-center border-bottom ">
                    <p className="fw-bold p-1">Diamond</p>
                  </div>
                  <div className="d-flex border-bottom ">
                    <p className="fw-bold col-3 d-flex align-items-center justify-content-center border-end ">
                      Code
                    </p>
                    <p className="fw-bold col-2 d-flex align-items-center justify-content-center border-end ">
                      Size
                    </p>
                    <p className="fw-bold col-1 d-flex align-items-center justify-content-center border-end ">
                      Pcs
                    </p>
                    <p className="fw-bold col-2 d-flex align-items-center justify-content-center border-end ">
                      Wt
                    </p>
                    <p className="fw-bold col-2 d-flex align-items-center justify-content-center border-end ">
                      Rate
                    </p>
                    <p className="fw-bold col-2 d-flex align-items-center justify-content-center text-center">
                      Amount
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`${
                  dpp ? "metalGoldDetailPrint1p" : "metalGoldDetailPrint1l"
                } border-end `}
              >
                <div className="d-grid h-100">
                  <div className="d-flex justify-content-center align-items-center border-bottom ">
                    <p className="fw-bold p-1">Metal </p>
                  </div>
                  <div className="d-flex border-bottom ">
                    <p className="fw-bold col-3 border-end  d-flex align-items-center justify-content-center">
                      Quality
                    </p>
                    <p className="fw-bold col-2 border-end  d-flex align-items-center justify-content-center">
                      *Wt
                    </p>
                    <p className="fw-bold col-2 border-end  d-flex align-items-center justify-content-center">
                      N+L
                    </p>
                    <p className="fw-bold col-2 border-end  d-flex align-items-center justify-content-center">
                      Rate
                    </p>
                    <p className="fw-bold col-3 d-flex align-items-center justify-content-center">
                      Amount
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`${
                  dpp ? "stoneDetailsPrint1p" : "stoneDetailsPrint1l"
                } border-end `}
              >
                <div className="d-grid h-100">
                  <div className="d-flex justify-content-center border-bottom ">
                    <p className="fw-bold p-1">Stone</p>
                  </div>
                  <div className="d-flex border-bottom ">
                    <p className="fw-bold col-2 border-end  d-flex align-items-center justify-content-center">
                      Code
                    </p>
                    <p className="fw-bold col-2 border-end  d-flex align-items-center justify-content-center">
                      Size
                    </p>
                    <p className="fw-bold col-2 border-end  d-flex align-items-center justify-content-center">
                      Pcs
                    </p>
                    <p className="fw-bold col-2 border-end  d-flex align-items-center justify-content-center">
                      Wt
                    </p>
                    <p className="fw-bold col-2 border-end  d-flex align-items-center justify-content-center">
                      Rate
                    </p>
                    <p className="fw-bold col-2 d-flex align-items-center justify-content-center text-center">
                      Amount
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`${
                  dpp ? "otherAmountDetailPrint1p" : "otherAmountDetailPrint1l"
                } border-end  border-bottom d-flex align-items-center justify-content-center flex-column`}
              >
                <p
                  className="fw-bold text-center d-flex align-items-center justify-content-center"
                  style={{ wordBreak: "normal" }}
                >
                  Other Amount
                </p>
              </div>
              <div className="labourAmountDetailPrint1 border-end  border-bottom">
                <div className="d-grid h-100">
                  <div className="border-bottom  d-flex align-items-center justify-content-center">
                    <p className="text-center fw-bold">Labour</p>
                  </div>
                  <div className="d-flex">
                    <div className="col-5 border-end  d-flex align-items-center justify-content-center">
                      <p className="fw-bold ">Rate</p>
                    </div>
                    <div className="col-7 d-flex align-items-center justify-content-center">
                      <p className="fw-bold text-end ">Amount</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="totalAmountDetailPrint1 border-end  border-bottom d-flex align-items-center justify-content-center flex-column">
                <p className="text-center fw-bold ">Total</p>
                <p className="text-center fw-bold ">Amount</p>
              </div>
            </div>
            {/* data */}
            {finalD?.resultArray?.map((e, i) => {


              const discountDisplay = discountCriteriaList
              .filter(({ key }) => e?.[key] > 0)
              .map(({ key, isAmountKey, label,disAmount }) => {
                const num = Number(e[key]);  
                const am= Number(e[disAmount])
                const decimals = e[isAmountKey] === 1 ? 3 : 2;  
                const val = num.toFixed(decimals);  
                return e[isAmountKey] === 0 ? `${val}% @${label} Amount ` : `${val} @${label} Amount`;
              })
              .join(', ');


              return (
                <div key={i} className="recordDetailPrint1 detailPrint1L_font_11" >
                  <div className="d-flex w-100">
                    <div className="srNoDetailprint11 border-end border-start border-bottom pt-1">
                      <p className="p-1 text-center paddingLeftDetailPrint1 paddingRightDetailPrint1">
                        {NumberWithCommas(i + 1, 0)}
                      </p>
                    </div>
                    <div className="designDetalPrint1 border-end  p-1 border-bottom paddingLeftDetailPrint1 paddingRightDetailPrint1">
                      <div className="d-flex justify-content-between">
                        <div className="col">
                          <p>{e?.designno}</p>
                        </div>
                        <div className="col d-flex flex-column align-items-end">
                          <p>{e?.SrJobno}</p>
                          <p>{e?.MetalColor}</p>
                        </div>
                      </div>
                      <div>
                        {checkBox?.image && (
                          <img
                            src={e?.DesignImage}
                            alt=""
                            className="w-100 d-block"
                            onError={handleImageError}
                          />
                        )}
                      </div>
                      <div className={`${!image && "pt-2 "}`}>
                        {e?.CertificateNo !== "" && (
                          <p className="text-center text-break">Certification no. :  {e?.CertificateNo}</p>
                        )}
                        {e?.HUID !== "" && (
                          <p className="text-center">HUID - {e?.HUID}</p>
                        )}
                        {e?.PO !== "" && e?.PO !== "-" && (
                          <p className="text-center fw-bold">PO: {e?.PO}</p>
                        )}
                        {e?.lineid !== "" && (
                          <p className="text-center">
                            {/* Lineid - */}
                            {e?.lineid}
                          </p>
                        )}
                        {!detailPrintK && (
                          <p className="text-center">
                            Tunch :{" "}
                            <span className="fw-bold">
                              {NumberWithCommas(e?.Tunch, 3)}
                            </span>
                          </p>
                        )}

                        {dp1lp ? (
                          <>
                            <p className="text-center">
                              <span className="fw-bold">
                                {fixedValues(e?.grosswt, 3)} gm
                              </span>
                              <span className=""> Gross</span>
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-center">
                              {" "}
                              <span className="fw-bold"> {fixedValues(e?.grosswt, 3)} gm </span> Gross
                            </p>
                          </>
                        )}
                        {e?.Size !== "" && e?.Size !== "-" && (
                          <p className="text-center">Size: {e?.Size}</p>
                        )}
                      </div>
                    </div>
                    <div className={`${ dpp ? "diamondDetailPrint1p" : "diamondDetailPrint1l" } border-end  position-relative pt-1 paddingLeftDetailPrint1 paddingRightDetailPrint1`} >
                      <div className="h-100 paddingBottomTotalDetailPrint1">
                        {e?.diamonds.length > 0 &&
                          e?.diamonds.map((ele, ind) => {
                            return (
                              <div className={`d-flex justify-content-between `} key={ind} >
                                <p className="col-3 paddingRightDetailPrint1">
                                  {ele?.ShapeName} {ele?.QualityName}{" "}
                                  {ele?.Colorname}
                                </p>
                                <p className="col-2 paddingRightDetailPrint1">
                                  {ele?.GroupName === ""
                                    ? ele?.SizeName
                                    : ele?.GroupName}
                                </p>
                                <p className="col-1 text-end paddingRightDetailPrint1">
                                  {NumberWithCommas(ele?.Pcs, 0)}
                                </p>
                                <p className="col-2 text-end paddingRightDetailPrint1">
                                  {fixedValues(ele?.Wt, 3)}
                                </p>
                                <p className="col-2 text-end paddingRightDetailPrint1">
                                  {NumberWithCommas(ele?.Rate, 2)}
                                </p>
                                <p
                                  className={`col-2 text-end fw-bold `}
                                >
                                  {NumberWithCommas(ele?.Amount, 2)}
                                </p>
                              </div>
                            );
                          })}
                        <div className="d-flex border-bottom position-absolute bottom-0 w-100  border-top totalMinHeightDetailPrint1 lightGrey start-0">
                          <p className="col-2 paddingRightDetailPrint1 "></p>
                          <p className="col-2 paddingRightDetailPrint1 "></p>
                          <p className="col-2 paddingRightDetailPrint1 text-end fw-bold d-flex align-items-center justify-content-end">
                            {e?.diamondsTotal?.Pcs !== 0 &&
                              NumberWithCommas(e?.totals?.diamonds?.Pcs, 0)}
                          </p>
                          <p className="col-2 paddingRightDetailPrint1 text-end fw-bold d-flex align-items-center justify-content-end">
                            {e?.diamondsTotal?.Wt !== 0 &&
                              fixedValues(e?.totals?.diamonds?.Wt, 3)}
                          </p>
                          <p className="col-2 paddingRightDetailPrint1 text-end fw-bold d-flex align-items-center justify-content-end"></p>
                          <p className="col-2  text-end fw-bold d-flex align-items-center justify-content-end  paddingRightDetailPrint1l">
                            {e?.diamondsTotal?.Amount !== 0 &&
                              NumberWithCommas(e?.totals?.diamonds?.Amount, 2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  
                    <div className={`${ dpp ? "metalGoldDetailPrint1p" : "metalGoldDetailPrint1l" } border-end  position-relative pt-1 paddingLeftDetailPrint1 paddingRightDetailPrint1`} >
                      <div className="h-100 paddingBottomTotalDetailPrint1">
                        {e?.metal.length > 0 &&
                          e?.metal.map((ele, ind) => {
                            return (
                              <div className={`d-flex`} key={ind}>
                                <p className="col-3  paddingRightDetailPrint1">
                                  {ele?.ShapeName + " " + ele?.QualityName}
                                </p>
                                <p className="col-2  text-end paddingRightDetailPrint1">
                                  {ind === 0 ? NumberWithCommas( e?.NetWt + e?.totals?.diamonds?.Wt / 5, 3 ) : NumberWithCommas(ele?.Wt, 3)}
                                </p>
                                <p className="col-2  text-end paddingRightDetailPrint1">
                                  {ind > 0 ? NumberWithCommas(ele?.Wt, 3) : fixedValues(e?.NetWt, 3)}
                                </p>
                                <p className="col-2  text-end paddingRightDetailPrint1">
                                  {NumberWithCommas(ele?.Rate, 2)}
                                </p>
                                <p
                                  className={`col-3 text-end ${ ind > 0 && "fw-bold" }`}
                                >
                                  {NumberWithCommas(ele?.Amount, 2)}
                                </p>
                              </div>
                            );
                          })}
                        {e?.JobRemark !== "" && (
                          <div className={``}>
                            <p className="fw-bold">REMARK:</p>
                            <p className="fw-bold">{e?.JobRemark}</p>
                          </div>
                        )}
                        <div className="d-flex position-absolute bottom-0 w-100  totalMinHeightDetailPrint1 border-top border-bottom lightGrey start-0">
                          <p className="col-3  paddingRightDetailPrint1"></p>
                          <p className="col-2 text-end fw-bold d-flex justify-content-end align-items-center paddingRightDetailPrint1">
                            {e?.totals?.metal?.Wt !== 0 &&
                              fixedValues(
                                e?.NetWt + e?.totals?.diamonds?.Wt / 5,
                                3
                              )}
                            {/* fixedValues(e?.totals?.metal?.Wt + (e?.totals?.diamonds?.Wt / 5), 3)} */}
                          </p>
                          <p className="col-2 text-end fw-bold d-flex justify-content-end align-items-center paddingRightDetailPrint1">
                            {/* {e?.NetWt !== 0 &&
                              (dp1lp
                                ? fixedValues(e?.primaryMetalWt, 3)
                                : fixedValues(e?.NetWt + e?.LossWt, 3))} */}
                                {NumberWithCommas(e?.netWtlossWt, 3)}
                          </p>
                          <p className="col-2 text-end paddingRightDetailPrint1"></p>
                          <p className="col-3 text-end fw-bold d-flex justify-content-end align-items-center  paddingRightDetailPrint1 ">
                            {e?.totals?.metal.Amount !== 0 &&
                              NumberWithCommas(e?.metal[0].Amount, 2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className={`${ dpp ? "stoneDetailsPrint1p" : "stoneDetailsPrint1l" } border-end  position-relative pt-1 paddingLeftDetailPrint1 paddingRightDetailPrint1`} >
                      <div className="h-100 paddingBottomTotalDetailPrint1">
                        {e?.colorstone.length > 0 &&
                          e?.colorstone.map((ele, ind) => {
                            return (
                              <div className={`d-flex`} key={ind}>
                                <p className="col-3 paddingRightDetailPrint1">
                                  {ele?.ShapeName} {ele?.QualityName}{" "}
                                  {ele?.Colorname}
                                </p>
                                <p className="col-2 text-center  paddingRightDetailPrint1">
                                  {ele?.SizeName}
                                </p>
                                <p className="col-1 text-end paddingRightDetailPrint1">
                                  {NumberWithCommas(ele?.Pcs, 0)}
                                </p>
                                <p className="col-2 text-end paddingRightDetailPrint1">
                                  {fixedValues(ele?.Wt, 3)}
                                </p>
                                <p className="col-2 text-end paddingRightDetailPrint1">
                                  {NumberWithCommas(ele?.Rate, 2)}
                                </p>
                                <p
                                  className={`col-2 text-end fw-bold ${ detailPrintK && "paddingRightDetailPrint1"
                                  }`}
                                >
                                  {NumberWithCommas(ele?.Amount, 2)}
                                </p>
                              </div>
                            );
                          })}
                        <div className="d-flex border-bottom position-absolute bottom-0 w-100  border-top totalMinHeightDetailPrint1 lightGrey paddingRightDetailPrint1 paddingLeftDetailPrint1 start-0">
                          <p className=" col-2  paddingRightDetailPrint1"></p>
                          <p className=" col-2  paddingRightDetailPrint1"></p>
                          <p className=" col-2  paddingRightDetailPrint1 text-end fw-bold d-flex align-items-center justify-content-end">
                            {e?.totals?.colorstone?.Pcs !== 0 &&
                              e?.totals?.colorstone?.Pcs}
                          </p>
                          <p className=" col-2 text-end fw-bold d-flex align-items-center justify-content-end paddingRightDetailPrint1">
                            {e?.totals?.colorstone?.Wt !== 0 &&
                              fixedValues(e?.totals?.colorstone?.Wt, 3)}
                          </p>
                          <p className=" col-2 text-end paddingRightDetailPrint1"></p>
                          <p className=" col-2 text-end fw-bold d-flex align-items-center justify-content-end paddingLeftDetailPrint1  ">
                            {e?.totals?.colorstone?.Amount !== 0 &&
                              NumberWithCommas(
                                e?.totals?.colorstone?.Amount,
                                2
                              )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className={`${ dpp ? "otherAmountDetailPrint1p" : "otherAmountDetailPrint1l" } border-end  position-relative pt-1 paddingLeftDetailPrint1 paddingRightDetailPrint1`} >
                      <div className="paddingBottomTotalDetailPrint1">
                        <div>
                    
                            <>
                              {dp1lp ? (
                                dpp ? (
                                  <>
                                    {e?.other_details?.map((ele, ind) => {
                                      return (
                                        <div
                                          className="d-flex justify-content-between"
                                          style={{ fontSize: "10.5px" }}
                                          key={ind}
                                        >
                                          <p className="paddingRightDetailPrint1">
                                            {ele?.label}
                                          </p>
                                          <p className="">
                                            {NumberWithCommas(+ele?.value, 2)}
                                          </p>
                                        </div>
                                      );
                                    })}
                                    {e?.miscCharges?.map((ele, ind) => {
                                      return (
                                        ele?.Amount !== 0 && (
                                          <div
                                            className="d-flex justify-content-between"
                                            style={{ fontSize: "10.5px" }}
                                            key={ind}
                                          >
                                            <p className="paddingRightDetailPrint1">
                                              {ele?.ShapeName} {ele?.IsHSCOE}
                                            </p>
                                            <p className="">
                                              {NumberWithCommas(
                                                +ele?.Amount,
                                                2
                                              )}
                                            </p>
                                          </div>
                                        )
                                      );
                                    })}
                                    {e?.miscChargesss !== 0 && (
                                      <div
                                        className="d-flex justify-content-between"
                                        style={{ fontSize: "10.5px" }}
                                      >
                                        <p className="paddingRightDetailPrint1">
                                          Misc Charges
                                        </p>
                                        <p className="">
                                          {NumberWithCommas(
                                            e?.miscChargesss,
                                            2
                                          )}
                                        </p>
                                      </div>
                                    )}
                                    {e?.TotalDiamondHandling !== 0 && (
                                      <div
                                        className="d-flex justify-content-between"
                                        style={{ fontSize: "10.5px" }}
                                      >
                                        <p className="paddingRightDetailPrint1">
                                          Handling
                                        </p>
                                        <p className="">
                                          {NumberWithCommas(
                                            e?.TotalDiamondHandling,
                                            2
                                          )}
                                        </p>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {e?.OtherCharges +
                                      e?.MiscAmount +
                                      e?.TotalDiamondHandling !==
                                      0 && (
                                      <div
                                        className="d-flex justify-content-between"
                                        style={{ fontSize: "10.5px" }}
                                      >
                                        <p className="paddingRightDetailPrint1"></p>
                                        <p className="">
                                          {NumberWithCommas(
                                            e?.OtherCharges +
                                              e?.MiscAmount +
                                              e?.TotalDiamondHandling,
                                            2
                                          )}
                                        </p>
                                      </div>
                                    )}
                                  </>
                                )
                              ) : (
                                <>
                                  {e?.OtherCharges + e?.MiscAmount+e?.TotalDiamondHandling !== 0 && (
                                    <div
                                      className="d-flex justify-content-between"
                                      style={{ fontSize: "10.5px" }}
                                    >
                                      <p className="paddingRightDetailPrint1"></p>
                                      <p className="">
                                        {NumberWithCommas( e?.OtherCharges + e?.MiscAmount+e?.TotalDiamondHandling, 2 )}
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                            </>
                        </div>
                      </div>
                      <div className="position-absolute bottom-0 w-100 border-top border-bottom  totalMinHeightDetailPrint1 lightGrey d-flex align-items-center justify-content-end paddingRightDetailPrint1 start-0">
                        <p className="text-end fw-bold  ">
                          {dp1lp ? e?.totalOther !== 0 && NumberWithCommas(e?.miscChargesTotal, 2) : e?.totalOther !== 0 && NumberWithCommas(
                                e?.OtherCharges + e?.MiscAmount+e?.TotalDiamondHandling,
                                2
                              )}
                        </p>
                      </div>
                    </div>
                    <div className="labourAmountDetailPrint1 border-end  position-relative pt-1 paddingLeftDetailPrint1 paddingRightDetailPrint1">
                      <div className="d-grid h-100 paddingBottomTotalDetailPrint1">
                        <div className="d-flex ">
                          <div className="col-5 ">
                            <p className="text-center">
                              {e?.MaKingCharge_Unit !== 0 && NumberWithCommas(e?.MaKingCharge_Unit, 2)}
                            </p>
                          </div>
                          <div className="col-7">
                            <p className="text-end text-end">
                              {e?.MakingAmount + e?.TotalCsSetcost + e?.TotalDiaSetcost !== 0 && NumberWithCommas( e?.MakingAmount + e?.TotalCsSetcost + e?.TotalDiaSetcost, 2 )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="position-absolute bottom-0 w-100 border-bottom  border-top totalMinHeightDetailPrint1 d-flex lightGrey d-flex align-items-center justify-content-end paddingRightDetailPrint1 start-0">
                        <div className="col-5">
                          <p className="text-end fw-bold">
                            {/* {e?.MaKingCharge_Unit !== 0 &&
                                NumberWithCommas(e?.MaKingCharge_Unit, 2)} */}
                          </p>
                        </div>
                        <div className="col-7">
                          <p className="text-end fw-bold  ">
                            {e?.MakingAmount + e?.TotalCsSetcost + e?.TotalDiaSetcost !== 0 && NumberWithCommas( e?.MakingAmount + e?.TotalCsSetcost + e?.TotalDiaSetcost, 2 )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="totalAmountDetailPrint1 border-end  position-relative pt-1 paddingLeftDetailPrint1 paddingRightDetailPrint1">
                      <div className="d-grid h-100 paddingBottomTotalDetailPrint1">
                        <div>
                          <p className="text-end fw-bold">
                            {e?.UnitCost !== 0 &&
                              NumberWithCommas(e?.UnitCost, 2)}
                          </p>
                        </div>
                      </div>
                      <div className="position-absolute bottom-0 w-100 border-top border-bottom  totalMinHeightDetailPrint1 lightGrey d-flex align-items-center justify-content-end start-0">
                        <p className="text-end fw-bold  paddingRightDetailPrint1 paddingRightDetailPrint1">
                          {e?.UnitCost !== 0 &&
                            NumberWithCommas(e?.UnitCost, 2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {e?.DiscountAmt !== 0 && (
                    <div className="d-flex w-100">
                      <div className="srNoDetailprint11 border-end border-start  border-bottom">
                        <p className=" p-1"></p>
                      </div>
                      <div className="designDetalPrint1 border-end  p-1 border-bottom"></div>
                      <div
                        className={`${
                          dpp ? "diamondDetailPrint1p" : "diamondDetailPrint1l"
                        } border-end  position-relative border-bottom lightGrey`}
                      >
                        <div className="d-grid"></div>
                      </div>
                      <div
                        className={`${
                          dpp
                            ? "metalGoldDetailPrint1p"
                            : "metalGoldDetailPrint1l"
                        } border-end  position-relative border-bottom lightGrey`}
                      ></div>
                      <div
                        className={`${
                          dpp ? "stoneDetailsPrint1p" : "stoneDetailsPrint1l"
                        } border-end position-relative border-bottom pt-1 lightGrey`}
                      >
                        <div className="d-grid">
                          {e?.DiscountAmt !== 0 && (
                            <p className="p-1 text-end fw-bold paddingLeftDetailPrint1 paddingRightDetailPrint1">
                              {/* Discount{" "}
                              { NumberWithCommas(e?.Discount, 2)} {!detailPrintK && "%"} @Total Amount  */}
                              Discount {discountDisplay || `${NumberWithCommas(e?.Discount, 2)} @ Total Amount`}
                              </p>
                          )}
                        </div>
                      </div>
                      <div
                        className={`${
                          dpp
                            ? "otherAmountDetailPrint1p"
                            : "otherAmountDetailPrint1l"
                        } border-end  border-bottom lightGrey`}
                      >
                        <p className="d-flex align-items-center justify-content-end"></p>
                      </div>
                      <div className="labourAmountDetailPrint1 border-end  lightGrey border-bottom pt-1 ">
                        <div className="d-grid h-100">
                          <div className="d-flex">
                            <div className="col-5">
                              <p className=" p-1 text-end"></p>
                            </div>
                            <div className="col-7 fw-bold">
                              <p className=" text-end">
                                {e?.DiscountAmt !== 0 &&
                                  NumberWithCommas(e?.DiscountAmt, 2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="totalAmountDetailPrint1 border-end  border-bottom d-flex align-tems-center justify-content-end lightGrey">
                        <p className="d-flex align-items-center">
                           
                          <span className="fw-bold">
                            {e?.TotalAmount !== 0 &&
                              NumberWithCommas(e?.TotalAmount, 2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {/* cgst */}
            <div className="d-flex w-100 border-bottom  border-start recordDetailPrint1 detailPrint1L_font_11">
              <div className="cgstDetailPrint1 text-end border-end  paddingLeftDetailPrint1 paddingRightDetailPrint1 py-1">
                <p className="">Total Discount</p>
                {json0Data?.Privilege_discount !== 0 && (
                  <p className="">Privilege Card Discount</p>
                )}
                {taxes.length > 0 &&
                  taxes.map((e, i) => {
                    return (
                      <p key={i} className="">
                        {e?.name} @ {e?.per}
                      </p>
                    );
                  })}
                {json0Data?.AddLess !== 0 && (
                  <p className="">{json0Data?.AddLess < 0 ? "Less" : "Add"}</p>
                )}
              </div>
              <div className="cgstTotalDetailPrint1 text-end border-end  paddingLeftDetailPrint1 paddingRightDetailPrint1 py-1">
                <p>{(total?.discountTotalAmount).toFixed(2)}</p>
                {json0Data?.Privilege_discount !== 0 && (
                  <p>- {json0Data?.Privilege_discount}</p>
                )}
                {taxes.length > 0 &&
                  taxes.map((e, i) => {
                    return <p key={i}>{NumberWithCommas(e?.amount, 2)}</p>;
                  })}
                {json0Data?.AddLess !== 0 && <p>{json0Data?.AddLess}</p>}
              </div>
            </div>
            {/* total */}
            <div className="d-flex w-100 recordDetailPrint1 lightGrey detailPrint1L_font_11">
              <div className="designDetalPrint1Total border-end  border-bottom border-start d-table">
                <p className="fw-bold text-center d-table-cell align-middle">
                  Total
                </p>
              </div>
              <div
                className={`${
                  dpp ? "diamondDetailPrint1p" : "diamondDetailPrint1l"
                } border-end  position-relative border-bottom d-flex flex-column justify-content-center paddingLeftDetailPrint1 paddingRightDetailPrint1`}
              >
                <div className="d-flex">
                  <div className=" col-2">
                    <p className=""></p>
                  </div>
                  <div className=" col-2">
                    <p className=""></p>
                  </div>
                  <div className=" col-2 text-end fw-bold">
                    <p className="">
                      {NumberWithCommas(finalD?.mainTotal?.diamonds?.Pcs, 0)}
                    </p>
                  </div>
                  <div className=" col-2 text-end">
                    <p className="fw-bold">
                      {NumberWithCommas(finalD?.mainTotal?.diamonds?.Wt, 3)}
                    </p>
                  </div>
                  <div className=" col-2 text-end">
                    <p className=""></p>
                  </div>
                  <div className=" col-2 text-end">
                    <p className="fw-bold">
                      {NumberWithCommas(finalD?.mainTotal?.diamonds?.Amount, 2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`${ dpp ? "metalTotalDetailPrint1p" : "metalTotalDetailPrint1l" } border-end  position-relative border-bottom d-flex flex-column justify-content-center`} >
                <div className="d-flex">
                  <div className="col-3 paddingRightDetailPrint1">
                    <p className=""></p>
                  </div>
                  <div className="col-2 text-end paddingRightDetailPrint1">
                    <p className="fw-bold">
                      {NumberWithCommas( finalD?.mainTotal?.netwt + finalD?.mainTotal?.diamonds?.Wt / 5, 3 )}
                    </p>
                  </div>
                  <div className="col-2 text-end paddingRightDetailPrint1">
                    <p className="fw-bold">
                      {dp1lp ? NumberWithCommas(totalMetalWts, 3) : NumberWithCommas(finalD?.mainTotal?.metalWts, 3)} {/* {NumberWithCommas(finalD?.mainTotal?.netwt, 3)} */}
                    </p>
                  </div>
                  <div className="col-2 text-end paddingRightDetailPrint1">
                    <p className=""></p>
                  </div>
                  <div className="col-3 text-end paddingRightDetailPrint1">
                    <p className="fw-bold">
                      {NumberWithCommas(finalD?.mainTotal?.MetalAmount, 2)}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`${
                  dpp ? "stoneDetailsPrint1p" : "stoneDetailsPrint1l"
                } border-end  position-relative border-bottom d-flex flex-column justify-content-center paddingLeftDetailPrint1 paddingRightDetailPrint1`}
              >
                <div className="d-flex">
                  <div className="col-2 paddingRightDetailPrint1">
                    <p className=""></p>
                  </div>
                  <div className="col-2 paddingRightDetailPrint1">
                    <p className=""></p>
                  </div>
                  <div className="col-2 text-end d-flex justify-content-end align-items-center h-100  paddingRightDetailPrint1">
                    <p className="fw-bold">
                      {NumberWithCommas(total?.colorStonePcs, 0)}
                    </p>
                  </div>
                  <div className="col-2 text-end d-flex justify-content-end align-items-center h-100  paddingRightDetailPrint1">
                    <p className="fw-bold">
                      {fixedValues(total?.colorStoneWt, 3)}
                    </p>
                  </div>
                  <div className="col-2 text-end d-flex justify-content-end align-items-center h-100  paddingRightDetailPrint1">
                    <p className="fw-bold"></p>
                  </div>
                  <div className="col-2 text-end d-flex justify-content-end align-items-center h-100 ">
                    <p className="fw-bold">
                      {NumberWithCommas(total?.colorStoneAmount, 2)}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`${
                  dpp ? "otherAmountDetailPrint1p" : "otherAmountDetailPrint1l"
                } border-end  border-bottom d-table paddingLeftDetailPrint1 paddingRightDetailPrint1`}
              >
                <p className="py-1 d-flex align-items-center justify-content-end d-table-cell align-middle fw-bold">
                  <span>
                    {NumberWithCommas(finalD?.mainTotal?.miscChargesTotals, 2)}
                  </span>
                </p>
              </div>
              <div className="labourAmountDetailPrint1 border-end  border-bottom paddingLeftDetailPrint1 paddingRightDetailPrint1">
                <div className="d-grid h-100">
                  <div className="d-flex justify-content-end">
                    <div className="d-table">
                      <p className="d-table-cell align-middle text-end h-100 text-end fw-bold">
                        {NumberWithCommas(total?.labourAmount, 2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="totalAmountDetailPrint1 border-end  border-bottom paddingLeftDetailPrint1 paddingRightDetailPrint1">
                <p className="d-flex justify-content-end align-items-center h-100 text-end fw-bold">
                  {/* {!dp1lp && (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: json0Data?.Currencysymbol,
                      }}
                    ></span>
                  )} */}
                  {NumberWithCommas(total?.withDiscountTaxAmount, 2)}
                </p>
              </div>
            </div>
            {/* summary */}
            <div className="d-flex w-100 pt-1 recordDetailPrint1 detailPrint1L_font_11">
              <div className="col-4 pe-1">
                <p className="border-start  fw-bold text-center border-bottom  w-100 border-end border-top lightGrey">
                  SUMMARY
                </p>
                <div className="d-flex border-end ">
                  <div className="border-start col-6 border-end  position-relative summaryPadBotDetailPrint1 d-flex flex-column">
                    <div className="d-flex justify-content-between">
                      <p className="fw-bold px-1 pt-1">GOLD IN 24KT</p>
                      <p className="px-1 pt-1">
                     
                        {/* {detailtPrintR || detailtPrintL || detailtPrintp
                          ? NumberWithCommas(summary?.gold24Kt, 3)
                          : fixedValues(
                              finalD?.mainTotal?.convertednetwt,
                              3
                            )} */}
                       {     NumberWithCommas((finalD?.mainTotal?.total_purenetwt - notGoldMetalWtTotal),3)}
                        gm
                      </p>
                    </div>
                    { MetShpWise?.map((e, i) => {
                      return <div className="d-flex justify-content-between" key={i}>
                      <p className="fw-bold px-1 pt-1">{e?.ShapeName}</p>
                      <p className="px-1 pt-1">
                       { NumberWithCommas(e?.metalfinewt, 3)} gm
                      </p>
                    </div>
                    })
                  }
                    <div className="d-flex justify-content-between">
                      <p className="fw-bold px-1 pt-1">GROSS WT</p>
                      <p className="px-1 pt-1">
                        {" "}
                        {fixedValues(summary?.grossWt, 3)} gm
                      </p>
                    </div>
                    <div className="d-flex justify-content-between">
                      <p className="fw-bold px-1 pt-1">*(G+D) WT</p>
                      {/* <p classNamxe= pt-1'p-1'> {fixedValues(summary?.gDWt, 3)} gm</p> */}
                      <p className="px-1 pt-1">
                        {NumberWithCommas(
                          finalD?.mainTotal?.netwt +
                            finalD?.mainTotal?.diamonds?.Wt / 5,
                          3
                        )}{" "}
                        gm
                      </p>
                    </div>
                    <div className="d-flex justify-content-between">
                      <p className="fw-bold px-1 pt-1">NET WT</p>
                      <p className="px-1 pt-1">
                        {" "}
                        {fixedValues(
                          finalD?.mainTotal?.metal?.IsPrimaryMetal,
                          3
                        )}{" "}
                        gm
                      </p>
                    </div>
                    <div className="d-flex justify-content-between">
                      <p className="fw-bold px-1 pt-1">DIAMOND WT</p>
                      <p className="px-1 pt-1">
                        {NumberWithCommas(finalD?.mainTotal?.diamonds?.Pcs, 0)}{" "}
                        / {NumberWithCommas(finalD?.mainTotal?.diamonds?.Wt, 3)}{" "}
                        cts
                        {/* {NumberWithCommas(summary?.diamondpcs, 0)} /{" "} {fixedValues(summary?.diamondWt, 3)} cts */}
                      </p>
                    </div>
                    <div className="d-flex justify-content-between">
                      <p className="fw-bold px-1 pt-1">STONE WT</p>
                      <p className="px-1 pt-1">
                        {" "}
                        {NumberWithCommas(summary?.stonePcs, 0)} /{" "}
                        {fixedValues(summary?.stoneWt, 3)} cts
                      </p>
                    </div>
                    {json0Data?.Privilege_discount !== 0 && (
                      <div className="d-flex justify-content-between">
                        <p className="fw-bold px-1 pt-1">Privilege Discount</p>
                        <p className="px-1 pt-1">
                          - {json0Data?.Privilege_discount}
                        </p>
                      </div>
                    )}
                    <div className="d-flex justify-content-between border-top  position-absolute w-100 border-bottom bottom-0 totalLineDetailPrint1 lightGrey">
                      <p className="fw-bold px-1 pt-1"> </p>
                      <p className="px-1 pt-1"> </p>
                    </div>
                  </div>
                  <div className="col-6 position-relative summaryPadBotDetailPrint1  d-flex flex-column">
                    <div className="d-flex justify-content-between">
                      <p className="fw-bold px-1 pt-1">GOLD</p>
                      <p className="px-1 pt-1">
                        {" "}
                        {NumberWithCommas((finalD?.mainTotal?.MetalAmount - notGoldMetalTotal), 2)}
                      </p>
                    </div>
                    { MetShpWise?.map((e, i) => {
                      return <div className="d-flex justify-content-between" key={i}>
                      <p className="fw-bold px-1 pt-1">{e?.ShapeName}</p>
                      <p className="px-1 pt-1">
                        {" "}
                        {NumberWithCommas(e?.Amount, 2)}
                      </p>
                    </div>
                    })
                  }
                    <div className="d-flex justify-content-between">
                      <p className="fw-bold px-1 pt-1">DIAMOND</p>
                      <p className="px-1 pt-1">
                        {" "}
                        {NumberWithCommas(
                          finalD?.mainTotal?.diamonds?.Amount,
                          2
                        )}
                      </p>
                    </div>
                    <div className="d-flex justify-content-between">
                      <p className="fw-bold px-1 pt-1">CST</p>
                      <p className="px-1 pt-1">
                        {NumberWithCommas(
                          finalD?.mainTotal?.colorstone?.Amount,
                          2
                        )}
                      </p>
                    </div>
                    <div className="d-flex justify-content-between">
                      <p className="fw-bold px-1 pt-1">MAKING</p>
                      <p className="px-1 pt-1">
                        {" "}
                        {/* {NumberWithCommas(summary?.makingAmount, 2)} */}
                        {NumberWithCommas(total?.labourAmount, 2)}
                      </p>
                    </div>
                    <div className="d-flex justify-content-between">
                      <p className="fw-bold px-1 pt-1">OTHER</p>
                      <p className="px-1 pt-1">
                        {" "}
                        {NumberWithCommas(
                          finalD?.mainTotal?.miscChargesTotals,
                          2
                        )}
                      </p>
                    </div>
                    <div className="d-flex justify-content-between">
                      <p className="fw-bold px-1 pt-1">LESS</p>
                      <p className="px-1 pt-1">
                        {" "}
                        {NumberWithCommas(summary?.addLess, 2)}
                      </p>
                    </div>
                    <div className="d-flex justify-content-between border-top  position-absolute w-100 border-bottom  bottom-0 totalLineDetailPrint1 lightGrey">
                      <p className="fw-bold p-1">TOTAL</p>
                      <p className="px-1 p-1">
                        {NumberWithCommas(total?.withDiscountTaxAmount, 2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* summaryPadBotDetailPrint1 */}
              <div className="col-2   pe-1">
                <div
                  className={`border-end border-start border-top ${
                    diamondDetails?.length === 1 &&
                    `d-flex flex-column justify-content-between h-100`
                  }`}
                >
                  <p className="fw-bold text-center border-bottom  w-100 lightGrey">
                    Diamond Detail
                  </p>
                  <div>
                    {diamondDetails?.map((e, i) => {
                      return (
                        e?.Wt !== undefined && (
                          <React.Fragment key={i}>
                            <div
                              className={`d-flex justify-content-between px-1 pb-1  align-items-center ${
                                i === 0 && "pt-1"
                              }`}
                            >
                              <p className="fw-bold">
                                {e?.ShapeName === "OTHER" ? (
                                  e?.ShapeName
                                ) : (
                                  <>
                                    {e?.ShapeName} {e?.QualityName}{" "}
                                    {e?.Colorname}
                                  </>
                                )}
                              </p>
                              <p>
                                {NumberWithCommas(e?.Pcs, 0)}/
                                {NumberWithCommas(e?.Wt, 3)} Cts
                              </p>
                            </div>
                          </React.Fragment>
                        )
                      );
                    })}
                  </div>

                  <div className="d-flex justify-content-between border-top  w-100 border-bottom totalLineDetailPrint1 lightGrey">
                    <p className="fw-bold p-1"></p>
                    <p className="p-1"></p>
                  </div>
                </div>
              </div>
              <div className="col-2 pe-1">
                <div className="border-bottom  border-top">
                  <p className="fw-bold text-center border-start border-end border-bottom  w-100 border-start lightGrey">
                    OTHER DETAILS
                  </p>
                  {checkBox?.brokarage &&
                    brokarage.map((e, i) => {
                      return (
                        <div
                          className="d-flex border-start border-end "
                          key={i}
                        >
                          <div className="col-6">
                            <p className="fw-bold p-1">{e?.label}</p>
                          </div>
                          <div className="col-6">
                            <p className="text-end p-1">{e?.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  <div className="d-flex border-start border-end ">
                    <div className="col-6">
                      <p className="fw-bold p-1">RATE IN 24KT</p>
                    </div>
                    <div className="col-6">
                      <p className="text-end p-1">
                        {NumberWithCommas(json0Data?.MetalRate24K, 2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-2 pe-1">
                <div className="border  border-top">
                  <p className="fw-bold text-center border-start border-bottom  w-100 border-start lightGrey">
                    REMARK
                  </p>
                  <p
                    dangerouslySetInnerHTML={{ __html: json0Data?.PrintRemark }}
                    className="pb-3 pt-1 ps-1 pe-1"
                  ></p>
                </div>
              </div>
              <div className="col-2">
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
            <div className="fs_dp4 text-secondary pt-3 detailPrint1L_font_12">
              ** THIS IS A COMPUTER GENERATED INVOICE AND KINDLY NOTIFY US
              IMMEDIATELY IN CASE YOU FIND ANY DISCREPANCY IN THE DETAILS OF
              TRANSACTIONS
            </div>
          </div>{" "}
        </div>
      ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
          {msg}
        </p>
      )}
    </>
  );
};

export default DetailPrint1LGroup;
