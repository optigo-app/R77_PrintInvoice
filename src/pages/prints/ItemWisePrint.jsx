import React, { useState, useEffect } from "react";
import "../../assets/css/prints/itemwiseprint.css";
import { apiCall, handlePrint, taxGenrator, isObjectEmpty, NumberWithCommas, fixedValues, checkMsg } from "../../GlobalFunctions";
import { usePDF } from "react-to-pdf";
import { ToWords } from 'to-words';
import Loader from "../../components/Loader";
import { cloneDeep } from "lodash";

const ItemWisePrint = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  const { toPDF, targetRef } = usePDF({ filename: "page.pdf" });
  const [loader, setLoader] = useState(true);
  const toWords = new ToWords();
  const [json0Data, setjson0Data] = useState({});
  const [msg, setMsg] = useState("");
  const [data, setData] = useState([]);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  const [total, setTotal] = useState({
    count: 0,
    gwt: 0,
    nwt: 0,
    mamt: 0,
    labourAmt: 0,
    fineAmt: 0,
    totalAmt: 0,
    igst: 0,
    numberToWords: "",
    cgst: 0,
    sgst: 0,
    less: 0,
    dPcs: 0,
    dWt: 0,
    dAmt: 0,
    cPcs: 0,
    cWt: 0,
    cAmt: 0,
    fineWts: 0
  });
  const [finalTotal, setFinalTotal] = useState({
    otherAmt: 0,
    pkgWt: 0,
  })
  const [taxes, setTaxes] = useState([]);
  const [disocunt, setDiscount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const loadData = (data) => {

    setjson0Data(data?.BillPrint_Json[0]);
    let totals = { ...total };
    let arr = [];
    let discountAmount = 0;
    let otherAmounts = 0;
    let pkgWt = 0;
    let allArr = [];
    let metals = [];
    data?.BillPrint_Json1.forEach((e, i) => {
      let obj = cloneDeep(e);
      obj.metalRates = data?.BillPrint_Json2?.find((ele, ind) => ele?.MasterManagement_DiamondStoneTypeid === 4 && ele?.IsPrimaryMetal === 1 && ele?.StockBarcode === e?.SrJobno)?.Rate || 0;
      obj.counts = 1;
      let findings = {
        Wt: 0,
        SizeName: 0
      };
      let sizeWt = 0
      data?.BillPrint_Json2?.forEach((ele, ind) => {
        if (ele?.MasterManagement_DiamondStoneTypeid === 5 && ele?.StockBarcode === e?.SrJobno) {
          findings.Wt += ele?.Wt
          findings.SizeName += +ele?.SizeName;
          sizeWt += (+ele?.SizeName * ele?.Wt);
        }
      });
      let fineWtss = (((e?.NetWt - findings?.Wt) * e?.Tunch) / 100) + ((sizeWt) / 100);

      obj.fineWtss = fineWtss;
      totals.fineWts += fineWtss;
      allArr?.push(obj);
    });
    allArr.forEach((e, i) => {
      // totals.fineWts += (e?.NetWt * (e?.Tunch)) / 100;
      pkgWt += e?.PackageWt;
      discountAmount += e?.DiscountAmt;
      let findIndex = arr.findIndex(
        (ele, ind) =>
          ele?.Categoryname === e?.Categoryname &&
          ele?.Collectionname === e?.Collectionname &&
          ele?.Wastage === e?.Wastage && ele?.MetalPurity === e?.MetalPurity
      );
      otherAmounts += e?.TotalDiamondHandling + e?.OtherCharges + e?.MiscAmount;
      if (findIndex === -1) {
        let count = 1;
        let obj = cloneDeep(e);
        obj.fineWts = (e?.NetWt * e?.Tunch) / 100;
        obj.diamondPcs = 0;
        obj.diamondWt = 0;
        obj.diamondAmt = 0;
        obj.diamondSettingAmt = 0;
        obj.colorStoneSettingAmt = 0;
        obj.diamondRate = 0;
        obj.colorStonePcs = 0;
        obj.colorStoneWt = 0;
        obj.colorStoneAmt = 0;
        obj.colorStoneRate = 0;
        obj.metalPcs = 0;
        obj.metalWt = 0;
        obj.metalAmt = 0;
        obj.metalRate = 0;
        data?.BillPrint_Json2?.forEach((ele, ind) => {
          if (ele?.StockBarcode === e?.SrJobno) {
            if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
              obj.diamondSettingAmt += ele?.SettingAmount;

            } else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
              obj.colorStoneSettingAmt += ele?.SettingAmount;
            }
          }
        })

        if (atob(printName).toLowerCase() === "item wise print1" || atob(printName).toLowerCase() === "item wise print2") {
          let makingAmount = e?.MaKingCharge_Unit?.toString()?.split(".");
          if (makingAmount?.length === 1) {
            makingAmount = +(makingAmount + "000")
          } else {
            makingAmount = +(makingAmount[0] + "000" + makingAmount[1])
          }
          obj.MaKingCharge_Unit = makingAmount;
        }
        obj.count = count;
        obj.otherAmt = e?.TotalDiamondHandling + e?.OtherCharges + e?.MiscAmount;
        let srJobArr = [];
        srJobArr.push(e?.SrJobno);
        obj.srJobArr = srJobArr;
        arr.push(obj);
      } else {
        if (e?.GroupJob === "") {
          arr[findIndex].count += 1;
        }
        let diamondSettingAmt = 0;
        let colorStoneSettingAmt = 0;

        data?.BillPrint_Json2?.forEach((ele, ind) => {
          if (ele?.StockBarcode === e?.SrJobno) {
            if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
              diamondSettingAmt += ele?.SettingAmount;

            } else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
              colorStoneSettingAmt += ele?.SettingAmount;
            }
          }
        })
        arr[findIndex].fineWts += (e?.NetWt * (e?.Tunch + e?.Wastage)) / 100;
        arr[findIndex].diamondSettingAmt += diamondSettingAmt;
        arr[findIndex].Tunch += e?.Tunch;
        // arr[findIndex].Wastage += e?.Wastage;
        arr[findIndex].colorStoneSettingAmt += colorStoneSettingAmt;
        arr[findIndex].grosswt += e?.grosswt;
        arr[findIndex].NetWt += e?.NetWt;
        arr[findIndex].MakingAmount += e?.MakingAmount;
        arr[findIndex].OtherCharges += e?.OtherCharges;
        arr[findIndex].DiscountAmt += e?.DiscountAmt;
        arr[findIndex].TotalAmount += e?.TotalAmount;
        arr[findIndex].UnitCost += e?.UnitCost;
        arr[findIndex].MetalAmount += e?.MetalAmount;
        arr[findIndex].otherAmt += e?.TotalDiamondHandling + e?.OtherCharges + e?.MiscAmount;
        arr[findIndex].metalRates += e?.metalRates;
        arr[findIndex].counts += e?.counts;
        arr[findIndex].fineWtss += e?.fineWtss;
        arr[findIndex].srJobArr.push(e?.SrJobno);
      }
    });
    setFinalTotal({ ...finalTotal, otherAmt: otherAmounts, pkgWt: pkgWt })
    setDiscount(discountAmount);
    let resultArr = [];
    let totalAmounts = 0
    arr.forEach((e, i) => {
      let obj = { ...e };
      // obj.FineWt = 0;
      totalAmounts += e?.TotalAmount;
      obj.OtherAmount = 0;
      data?.BillPrint_Json2.forEach((ele, ind) => {
        obj.srJobArr.map((elem, index) => {
          // if (obj?.id === ele?.Hid) {
          // obj.OtherAmount
          if (elem === ele?.StockBarcode) {
            if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
              obj.metalPcs += ele?.Pcs;
              obj.metalWt += ele?.Wt;
              obj.metalAmt += ele?.Amount;
              // obj.FineWt += ele?.FineWt;
              // metal
            } else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
              // color stone
              obj.colorStonePcs += ele?.Pcs;
              totals.cPcs += ele?.Pcs;
              totals.cWt += ele?.Wt;
              totals.cAmt += ele?.Amount;
              obj.colorStoneWt += ele?.Wt;
              obj.colorStoneAmt += ele?.Amount;
            } else if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
              // diamond
              obj.diamondPcs += ele?.Pcs;
              totals.dPcs += ele?.Pcs;
              totals.dWt += ele?.Wt;
              totals.dAmt += ele?.Amount;
              obj.diamondWt += ele?.Wt;
              obj.diamondAmt += ele?.Amount;
            }
          }
        })
      });
      resultArr.push(obj);
    });
    setTotalAmount(totalAmounts);
    resultArr.sort((a, b) => {
      const nameA = a.Collectionname.toLowerCase();
      const nameB = b.Collectionname.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }

      if (nameA > nameB) {
        return 1;
      }

      return 0; // names are equal
    });

    resultArr.forEach((e, i) => {
      totals.count += e?.count;
      totals.gwt += e?.grosswt;
      totals.nwt += e?.NetWt;
      totals.mamt += e?.MetalAmount;
      totals.labourAmt += e?.MakingAmount + e?.diamondSettingAmt + e?.colorStoneSettingAmt;
      totals.fineAmt += e?.FineWt;
      totals.totalAmt += e?.TotalAmount;
    });
    totals.igst = (totals.totalAmt * data?.BillPrint_Json[0]?.IGST) / 100;
    totals.cgst = (totals.totalAmt * data?.BillPrint_Json[0]?.CGST) / 100;
    totals.sgst = (totals.totalAmt * data?.BillPrint_Json[0]?.SGST) / 100;
    totals.less = data?.BillPrint_Json[0]?.AddLess;
    // totals.totalAmt = totals.totalAmt + totals.cgst + totals.sgst + totals.less;
    // tax
    let taxValue = taxGenrator(data?.BillPrint_Json[0], totals.totalAmt);
    setTaxes(taxValue);
    taxValue.length > 0 && taxValue.forEach((e, i) => {
      totals.totalAmt += +(e?.amount);
    });
    totals.numberToWords = toWords.convert(totals.totalAmt);
    // tax end
    totals.totalAmt += totals.less;
    totals.totalAmt = (totals.totalAmt)?.toFixed(2);
    // resultArr?.forEach((e, i) => {
    //   e.fineWts = (e?.NetWt * (e?.Tunch + e?.Wastage)) / 100;
    //   totals.fineWts +=  (e?.NetWt * (e?.Tunch + e?.Wastage)) / 100;
    // })

    resultArr.sort((a, b) => {
      const keyA = a?.MetalType + a?.MetalPurity;
      const keyB = b?.MetalType + b?.MetalPurity;

      // Compare the name values directly
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
    setTotal(totals);
    setData(resultArr);
  };

  useEffect(() => {
    const sendData = async () => {
      try {
        const data = await apiCall(token, invoiceNo, printName, urls, evn, ApiVer);
        if (data?.Status === '200') {
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

  return (<>
    {loader ? <Loader /> : msg === "" ? <div className={`itemWisePrintfont pad_60_allPrint ${(atob(printName).toLowerCase() === "item wise print") && 'itemWisePrintfont1_'}`}>
      {/* Print Button */}
      <div className="d-flex justify-content-end align-items-center print_sec_sum4 mb-4 pt-4  max_width_container px-1 mx-auto">
        {/* <div className="form-check">
                    <input type="button" className="btn_white blue" value="Pdf" onClick={() => toPDF()} />
                </div> */}
        <div className="form-check printLeftitemWise">
          <input
            type="button"
            className="btn_white blue"
            value="Print"
            onClick={(e) => handlePrint(e)}
            style={{ fontSize: "14px" }}
          />
        </div>
      </div>
      <div
        ref={targetRef}
        className={`max_width_container itemWisePrintContainer mt-2 mx-auto px-1`}
      >
        <div className={`itemWisePrintHead  itemWisePrint1Font_tab_15 
        `}>
          {/* Heading */}
          <div className={`bgLightPink p-1 border`}>
            {/* <p className="fw-bold">{atob(printName).toUpperCase()}</p> */}
            <p className="fw-bold">{json0Data?.PrintHeadLabel}</p>
          </div>
          {/* Address */}
          <div className="border-start border-end border-bottom p-2 d-flex justify-content-between">
            <div className="col-6">
              <p className={`fw-bold`} style={{ lineHeight: "150%" }}>TO, {json0Data?.customerfirmname}</p>
              <p className="ps-3 pe-2" style={{ lineHeight: "150%" }}>{json0Data?.customerstreet}</p>
              <p className="ps-3 pe-2" style={{ lineHeight: "150%" }}>{json0Data?.customerregion}</p>
              <p className="ps-3 pe-2" style={{ lineHeight: "150%" }}>
                {json0Data?.customercity}
                {json0Data?.customercity && json0Data?.PinCode ? "-" : ""}
                {json0Data?.PinCode}
              </p>
              <p className="ps-3 pe-2" style={{ lineHeight: "150%" }}>Phno:-{json0Data?.customermobileno}</p>
            </div>
            <div className="col-3">
              <div className="d-flex">
                <div className="col-6">
                  <p style={{ lineHeight: "150%" }}>INVOICE NO</p>
                </div>
                <div className="col-6">
                  <p className="fw-bold" style={{ lineHeight: "150%" }}>{json0Data?.InvoiceNo}</p>
                </div>
              </div>
              <div className="d-flex">
                <div className="col-6">
                  <p style={{ lineHeight: "150%" }}> DATE</p>
                </div>
                <div className="col-6">
                  <p className="fw-bold" style={{ lineHeight: "150%" }}>{json0Data?.EntryDate}</p>
                </div>
              </div>
              <div className="d-flex">
                <div className="col-6">
                  <p style={{ lineHeight: "150%" }}>24K RATE</p>
                </div>
                <div className="col-6">
                  <p className="fw-bold" style={{ lineHeight: "150%" }}>{json0Data?.MetalRate24K}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Table Heading */}
        {/* ${atob(printName).toLowerCase() === "item wise print1" && "itemWisePrint1Font_tab_14"} */}
        <div className={`bgLightPink d-flex border-start border-end border-bottom main_pad_item_wise_print 
        ${(atob(printName).toLowerCase() === "item wise print") && "itemWisePrint1Font_tab_14 "}
        ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && "itemWisePrintHead itemWisePrintFont_11"}`}>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'metaltypeItemWisePrint ' : 'metaltypeItemWisePrint1'} border-end
          ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && 'metaltypeItemWisePrint2'}`}>
            <p className="fw-bold" style={{ wordBreak: "normal" }}>METAL TYPE</p>
          </div>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'categoryItemWisePrint ' : 'categoryItemWisePrint1'} border-end`}>
            <p className="fw-bold" style={{ wordBreak: "normal" }}>CATEGORY</p>
          </div>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'pkgItemWisePrint' : 'pkgItemWisePrint1'} border-end`}>
            <p className="fw-bold" style={{ wordBreak: "normal" }}>PKG WT</p>
          </div>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'countItemWisePrint' : 'countItemWisePrint1'} border-end`}>
            <p className="fw-bold" style={{ wordBreak: "normal" }}>COUNT</p>
          </div>
          {(atob(printName).toLowerCase() === "item wise print") && (
            <>
              <div className="dpcsItemWisePrint border-end">
                <p className="fw-bold" style={{ wordBreak: "normal" }}>DPCS</p>
              </div>
              <div className="dpcsItemWisePrint border-end">
                <p className="fw-bold" style={{ wordBreak: "normal" }}>DWT</p>
              </div>
              <div className="dpcsItemWisePrint border-end">
                <p className="fw-bold" style={{ wordBreak: "normal" }}>RATE</p>
              </div>
              <div className="dpcsItemWisePrint border-end">
                <p className="fw-bold" style={{ wordBreak: "normal" }}>DAMT</p>
              </div>
              <div className="dpcsItemWisePrint border-end">
                <p className="fw-bold" style={{ wordBreak: "normal" }}>CPCS</p>
              </div>
              <div className="dpcsItemWisePrint border-end">
                <p className="fw-bold" style={{ wordBreak: "normal" }}>CWT</p>
              </div>
              <div className="dpcsItemWisePrint border-end">
                <p className="fw-bold" style={{ wordBreak: "normal" }}>RATE</p>
              </div>
              <div className="cAmtItemWisePrint border-end">
                <p className="fw-bold" style={{ wordBreak: "normal" }}>CAMT</p>
              </div>
            </>
          )}
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'gwtItemWisePrint' : 'gwtItemWisePrint1'} border-end`}>
            <p className="fw-bold" style={{ wordBreak: "normal" }}>GWT</p>
          </div>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'gwtItemWisePrint' : 'gwtItemWisePrint1'} border-end`}>
            <p className="fw-bold" style={{ wordBreak: "normal" }}>NWT</p>
          </div>

          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'rateItemWisePrint' : 'rateItemWisePrint1'} border-end`}>
            <p className="fw-bold" style={{ wordBreak: "normal" }}>RATE</p>
          </div>

          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'mAmtItemWisePrint' : 'mAmtItemWisePrint1'} border-end`}>
            <p className="fw-bold" style={{ wordBreak: "normal" }}>M AMT</p>
          </div>

          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'otherAmtItemWisePrint' : 'otherAmtItemWisePrint1'} border-end`}>
            <p className="fw-bold" style={{ wordBreak: "normal" }}>OTHER AMT</p>
          </div>

          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'percentageItemWiseprint' : 'percentageItemWiseprint1'} border-end
          ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && 'percentageItemWiseprint2'}`}>
            <p className="fw-bold" style={{ wordBreak: "normal" }}>%</p>
          </div>

          <div className={`
          ${atob(printName).toLowerCase() === "item wise print" ? 'wastageItemWisePrint' : 'wastageItemWisePrint'}  
          border-end
          ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && 'wastageItemWisePrint2'}`}>
            <p className="fw-bold" style={{ wordBreak: "normal" }}>WASTAGE</p>
          </div>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'makingItemWisePrint' : 'makingItemWisePrint1'}  border-end`}>
            <p className="fw-bold" style={{ wordBreak: "normal" }}>
              {(atob(printName).toLowerCase() === "item wise print") ? "MAKING %" : "MAKING KG"}
            </p>
          </div>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'labourItemWisePrint' : 'labourItemWisePrint1'} border-end`}>
            <p className="fw-bold" style={{ wordBreak: "normal" }}>LABOR AMT</p>
          </div>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'fineAmt' : 'fineAmt1'} border-end`}>
            <p className="fw-bold" style={{ wordBreak: "normal" }}>FINE</p>
          </div>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'totalAmt' : 'totalAmt1'}`}>
            <p className="fw-bold" style={{ wordBreak: "normal" }}>TOTAL AMT</p>
          </div>
        </div>
        {/* Data */}
        {data.length > 0 &&
          data.map((e, i) => {
            return (
              <div className={`no_break d-flex border-start border-end border-bottom ${(atob(printName).toLowerCase() === "item wise print") ? 'main_pad_item_wise_print_row itemWisePrint1Font_14_category' : 'main_pad_item_wise_print_row1'}   
              ${(atob(printName).toLowerCase() === "item wise print") && "itemWisePrintFont_tab_14"}
              ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && "itemWisePrint1Font_14_category itemWisePrintFont_11"}`} key={i}>
                <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'metaltypeItemWisePrint' : 'metaltypeItemWisePrint1'} border-end breakNormalItemWIse
                ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && 'metaltypeItemWisePrint2'}
                ${atob(printName)?.toLowerCase() === "item wise print1" && "itemWisePrint1Font_14_category"} `} >
                  <p className={`itemWisePrintCategory  `} >
                    {e?.MetalType} {e?.MetalPurity}
                  </p>
                </div>
                <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'categoryItemWisePrint' : 'categoryItemWisePrint1'} border-end 
                ${atob(printName)?.toLowerCase() === "item wise print1" && `itemWisePrint1Font_14_category`}`}>
                  <p style={{ wordBreak: "normal" }}>
                    {e?.Collectionname}-<span className="fw-bold breakNormalItemWIse" style={{ wordBreak: "normal" }}>{e?.Categoryname}</span>
                  </p>
                </div>
                <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'pkgItemWisePrint' : 'pkgItemWisePrint1'} border-end`}>
                  <p className="text-end">{e?.PackageWt !== 0 && NumberWithCommas(e?.PackageWt, 0)}</p>
                </div>
                <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'countItemWisePrint' : 'countItemWisePrint1'} border-end`}>
                  <p className="text-end">{NumberWithCommas(e?.count, 0)}</p>
                </div>
                {(atob(printName).toLowerCase() === "item wise print") && (
                  <>
                    <div className="dpcsItemWisePrint border-end">
                      <p className="text-end">
                        {e?.diamondPcs !== 0 && NumberWithCommas(e?.diamondPcs, 0)}
                      </p>
                    </div>
                    <div className="dpcsItemWisePrint border-end">
                      <p className="text-end">
                        {e?.diamondWt !== 0 && NumberWithCommas(e?.diamondWt, 3)}
                      </p>
                    </div>
                    <div className="dpcsItemWisePrint border-end">
                      <p className="text-end">
                        {e?.diamondWt !== 0 &&
                          e?.diamondAmt / e?.diamondWt &&
                          NumberWithCommas(e?.diamondAmt / e?.diamondWt, 2)}
                      </p>
                    </div>
                    <div className="dpcsItemWisePrint border-end">
                      <p className="text-end">
                        {e?.diamondAmt !== 0 && NumberWithCommas(e?.diamondAmt, 2)}
                      </p>
                    </div>
                    <div className="dpcsItemWisePrint border-end">
                      <p className="text-end">
                        {e?.colorStonePcs !== 0 && e?.colorStonePcs}
                      </p>
                    </div>
                    <div className="dpcsItemWisePrint border-end">
                      <p className="text-end">
                        {e?.colorStoneWt !== 0 && NumberWithCommas(e?.colorStoneWt, 3)}
                      </p>
                    </div>
                    <div className="dpcsItemWisePrint border-end">
                      <p className="text-end">
                        {e?.colorStoneWt !== 0 &&
                          e?.colorStoneAmt / e?.colorStoneWt &&
                          NumberWithCommas(e?.colorStoneAmt / e?.colorStoneWt, 2)}
                      </p>
                    </div>
                    <div className="cAmtItemWisePrint border-end">
                      <p className="text-end">
                        {e?.colorStoneAmt !== 0 &&
                          NumberWithCommas(e?.colorStoneAmt, 2)}
                      </p>
                    </div>
                  </>
                )}
                <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'gwtItemWisePrint' : 'gwtItemWisePrint1'} border-end`}>
                  <p className="text-end">
                    {e?.grosswt !== 0 && NumberWithCommas(e?.grosswt, 3)}
                  </p>
                </div>
                <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'gwtItemWisePrint' : 'gwtItemWisePrint1'} border-end`}>
                  <p className="text-end">
                    {e?.NetWt !== 0 && NumberWithCommas(e?.NetWt, 3)}
                  </p>
                </div>
                <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'rateItemWisePrint' : 'rateItemWisePrint1'} border-end`}>
                  <p className="text-end">
                    {e?.metalWt !== 0 &&
                      e?.MetalAmount / e?.metalWt !== 0 &&
                      NumberWithCommas(e?.metalRates / e?.counts, 2)}
                    {/* NumberWithCommas(e?.MetalAmount / e?.metalWt, 2)} */}
                  </p>
                </div>
                <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'mAmtItemWisePrint' : 'mAmtItemWisePrint1'} border-end`}>
                  <p className="text-end">
                    {e?.MetalAmount !== 0 && NumberWithCommas(e?.MetalAmount, 2)}
                  </p>
                </div>
                <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'otherAmtItemWisePrint' : 'otherAmtItemWisePrint1'} border-end`}>
                  <p className="text-end">
                    {e?.otherAmt !== 0 && NumberWithCommas(e?.otherAmt, 2)}
                  </p>
                </div>
                <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'percentageItemWiseprint' : 'percentageItemWiseprint1'} border-end
                ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && 'percentageItemWiseprint2'}`}>
                  <p className="text-end">
                    {(atob(printName).toLowerCase() === "item wise print" || atob(printName).toLowerCase() === "item wise print1") ?
                      (e?.MetalPriceRatio !== 0 && NumberWithCommas(e?.MetalPriceRatio, 3)) :
                      (e?.MetalPriceRatio + e?.Wastage !== 0 && NumberWithCommas(e?.MetalPriceRatio + e?.Wastage, 3))
                    }
                  </p>
                </div>
                <div className={` ${atob(printName).toLowerCase() === "item wise print" && 'wastageItemWisePrint'} border-end ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && 'wastageItemWisePrint2'}`}>
                  <p className="text-end"> {(atob(printName).toLowerCase() === "item wise print" || atob(printName).toLowerCase() === "item wise print1") && <>{e?.Wastage !== 0 ? NumberWithCommas(e?.Wastage, 3) : ""}</>} </p>
                </div>
                <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'makingItemWisePrint' : 'makingItemWisePrint1'} border-end`}>
                  <p className="text-end">{(atob(printName).toLowerCase() !== "item wise print") && NumberWithCommas(e?.MaKingCharge_Unit, 3)}</p>
                </div>
                <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'labourItemWisePrint' : 'labourItemWisePrint1'} border-end`}>
                  <p className="text-end">
                    {NumberWithCommas(e?.MakingAmount + e?.diamondSettingAmt + e?.colorStoneSettingAmt, 2)}
                  </p>
                </div>
                <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'fineAmt' : 'fineAmt1'} border-end`}>
                  <p className="text-end">
                    {/* {e?.FineWt !== 0 && e?.FineWt} */}
                    {NumberWithCommas(e?.fineWtss, 3)}
                  </p>
                </div>
                <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'totalAmt' : 'totalAmt1'}`}>
                  <p className="text-end">
                    {e?.TotalAmount !== 0 && (NumberWithCommas(e?.TotalAmount + e?.DiscountAmt, 2))}
                  </p>
                </div>
              </div>
            );
          })}
        {/* Tax */}
        <div className={`no_break bgLightPink d-flex border-start border-end border-bottom ${(atob(printName).toLowerCase() === "item wise print") ? 'main_pad_item_wise_print_row ' : 'main_pad_item_wise_print_row1'}
        ${(atob(printName).toLowerCase() === "item wise print") && "itemWisePrint1Font_13_total"}
        ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && "itemWisePrint1Font_13_total itemWisePrintFont_11"}`}>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'cgstTotalItemWiseRow' : (atob(printName)?.toLowerCase() === "item wise print1" ? 'cgstTotalItemWiseRow11' : 'cgstTotalItemWiseRow1')}  border-end pe-0 py-0 ps-0
           ${atob(printName)?.toLowerCase() === "item wise print2" && 'cgstTotalItemWiseRow2 '}
          `}>
            <p className="fw-bold text-end pe-1 border-bottom " style={{ paddingTop: "2.5px", paddingBottom: "2.5px" }}>TOTAL DISOCUNT</p>
            <p className="fw-bold text-end pe-1 border-bottom " style={{ paddingTop: "2.5px", paddingBottom: "2.5px" }}>AMOUNT</p>
            {taxes.length > 0 && taxes.map((e, i) => {
              return <p className="fw-bold text-end border-bottom pe-1 " style={{ paddingTop: "2.5px", paddingBottom: "2.5px" }} key={i}>{e?.name} @ {e?.per}</p>
            })}
            {json0Data?.AddLess !== 0 && <p className="fw-bold text-end  pe-1 " style={{ paddingTop: "2.5px", paddingBottom: "2.5px" }}>{json0Data?.AddLess > 0 ? "ADD" : "LESS"} </p>}
          </div>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'cgstAmountItemWiseRow' : 'cgstAmountItemWiseRow1'} py-0 px-0
          ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && "cgstAmountItemWiseRow1222"}
          `}>
            <p className="fw-bold text-end border-bottom  " style={{ paddingTop: "2.5px", paddingBottom: "2.5px" }}>{NumberWithCommas(disocunt, 2)}</p>
            <p className="fw-bold text-end border-bottom  " style={{ paddingTop: "2.5px", paddingBottom: "2.5px" }}>{NumberWithCommas(totalAmount, 2)}</p>
            {taxes.length > 0 && taxes.map((e, i) => {
              return <p className="fw-bold text-end  border-bottom " style={{ paddingTop: "2.5px", paddingBottom: "2.5px" }} key={i}>{e?.amount}</p>
            })}
            {json0Data?.AddLess !== 0 && <p className="fw-bold text-end  " style={{ paddingTop: "2.5px", paddingBottom: "2.5px" }}>{NumberWithCommas(json0Data?.AddLess, 2)}</p>}
          </div>
        </div>
        {/* Total */}
        {/* ${atob(printName).toLowerCase() === "item wise print1" && "itemWisePrint1Font_13_total"} */}
        <div className={`no_break d-flex border-start border-end border-bottom ${(atob(printName).toLowerCase() === "item wise print") ? 'main_pad_item_wise_print_row' : 'main_pad_item_wise_print_row1'} lightGrey
        ${(atob(printName).toLowerCase() === "item wise print") && "itemWisePrint1Font_13_total"}
        ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && "itemWisePrint1Font_13_total itemWisePrintFont_11"}`}>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'metaltypeItemWisePrint' : 'metaltypeItemWisePrint1'} border-end d-flex justify-content-center align-items-center
           ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && 'metaltypeItemWisePrint2'}`}>
            <p className="fw-bold">Total</p>
          </div>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'categoryItemWisePrint' : 'categoryItemWisePrint1'} border-end`}>
            <p className="fw-bold"></p>
          </div>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'pkgItemWisePrint' : 'pkgItemWisePrint1'} border-end`}>
            <p className="fw-bold text-end">{finalTotal?.pkgWt !== 0 && NumberWithCommas(finalTotal?.pkgWt, 3)}</p>
          </div>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'countItemWisePrint' : 'countItemWisePrint1'} border-end`}>
            <p className="fw-bold text-end">{total?.count && <>{total.count}</>}</p>
          </div>
          {(atob(printName).toLowerCase() === "item wise print") && (
            <>
              <div className="dpcsItemWisePrint border-end">
                <p className="fw-bold text-end">{total?.dPcs > 0 ? total.dPcs : ""}</p>
              </div>
              <div className="dpcsItemWisePrint border-end">
                <p className="fw-bold text-end">{total?.dWt ? NumberWithCommas(total.dWt, 3) : ""}</p>
              </div>
              <div className="dpcsItemWisePrint border-end">
                <p className="fw-bold text-end"></p>
              </div>
              <div className="dpcsItemWisePrint border-end">
              
                <p className="fw-bold text-end">{total?.dAmt ? NumberWithCommas(total?.dAmt, 2) : ""}</p>
              </div>
              <div className="dpcsItemWisePrint border-end">
              
                <p className="fw-bold text-end">{total?.cPcs ? NumberWithCommas(total?.cPcs, 0) : ""}</p>
              </div>
              <div className="dpcsItemWisePrint border-end">
             
                <p className="fw-bold text-end">{total?.cWt ? NumberWithCommas(total?.cWt, 3) : ""}</p>
              </div>
              <div className="dpcsItemWisePrint border-end">
                <p className="fw-bold text-end"></p>
              </div>
              <div className="cAmtItemWisePrint border-end">
               
                <p className="fw-bold text-end">{total?.cAmt ? NumberWithCommas(total?.cAmt, 2) : ""}</p>
              </div>
            </>
          )}
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'gwtItemWisePrint' : 'gwtItemWisePrint1'} border-end`}>
            <p className="fw-bold text-end">{total?.gwt ? NumberWithCommas(total?.gwt, 3) : ""}</p>
          </div>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'gwtItemWisePrint' : 'gwtItemWisePrint1'} border-end`}>
            <p className="fw-bold text-end">{total?.nwt ? NumberWithCommas(total?.nwt, 3) : ""}</p>
          </div>

          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'rateItemWisePrint' : 'rateItemWisePrint1'} border-end`}>
            <p className="fw-bold text-end"></p>
          </div>

          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'mAmtItemWisePrint' : 'mAmtItemWisePrint1'} border-end`}>
            <p className="fw-bold text-end">{total?.mamt ? NumberWithCommas(total?.mamt, 2) : ""}</p>
            

          </div>

          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'otherAmtItemWisePrint' : 'otherAmtItemWisePrint1'} border-end`}>
      
            <p className="fw-bold text-end">{finalTotal?.otherAmt ? NumberWithCommas(finalTotal?.otherAmt, 2) : ""}</p>
           

          </div>

          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'percentageItemWiseprint' : 'percentageItemWiseprint1'} border-end
          ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && 'percentageItemWiseprint2'}`}>
            <p className="fw-bold text-end"></p>
          </div>

          {/* ${atob(printName).toLowerCase() === "item wise print1" ? 'wastageItemWisePrint' : 'wastageItemWisePrint'}  */}
          <div className={`
          border-end
                    ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && 'wastageItemWisePrint2'}`}>
            <p className="fw-bold text-end"></p>
          </div>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'makingItemWisePrint' : 'makingItemWisePrint1'} border-end`}>
            <p className="fw-bold text-end"></p>
          </div>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'labourItemWisePrint' : 'labourItemWisePrint1'} border-end`}>
            <p className="fw-bold text-end">{NumberWithCommas(total?.labourAmt, 2)}</p>
          </div>

          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'fineAmt' : 'fineAmt1'} border-end`}>
            <p className="fw-bold text-end">{NumberWithCommas(total?.fineWts, 3)}</p>
          </div>
          <div className={`${(atob(printName).toLowerCase() === "item wise print") ? 'totalAmt' : 'totalAmt1'}`}>
            <p className="fw-bold text-end">{NumberWithCommas(total?.totalAmt, 2)}</p>
          </div>
        </div>
        {/* Amount In Words */}
        <div className={`no_break d-flex border-start border-end border-bottom p-1 amountInWordsItemWise
        ${(atob(printName).toLowerCase() === "item wise print") && "itemWisePrint1Font_16_total"}
        ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && "itemWisePrint1Font_16_total"}`} >
          <p className="min_width_max">Amount in Words : </p>
          <p className={`fw-bold ps-1 ${(atob(printName)?.toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && "itemWisePrint1Font_tab_15"} 
          ${(atob(printName)?.toLowerCase() === "item wise print") && "itemWisePrint1Font_tab_15"}`}> {toWords?.convert(+fixedValues(total.totalAmt, 2))} Only</p>
        </div>
        {/* ${atob(printName).toLowerCase() === "item wise print1" && "itemWisePrint1Font_tab_15"} */}
        <div className={`no_break d-flex border-start border-end border-bottom p-1 amountInWordsItemWise 
        ${(atob(printName).toLowerCase() === "item wise print") && "itemWisePrint1Font_16_total"}
        ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && "itemWisePrint1Font_16_total"}`}>
          <p className="pe-1">
            <span className="fw-bold">Remark : </span>
          </p>
          <p dangerouslySetInnerHTML={{ __html: json0Data?.PrintRemark }}>
          </p>
        </div>
        {/* ${atob(printName).toLowerCase() === "item wise print1" && "itemWisePrint1Font_tab_15"} */}
        <div className={`no_break d-flex border-start border-end border-bottom p-1 amountInWordsItemWise 
        ${(atob(printName).toLowerCase() === "item wise print") && "itemWisePrint1Font_16_total"}
        ${(atob(printName).toLowerCase() === "item wise print2" || atob(printName).toLowerCase() === "item wise print1") && "itemWisePrint1Font_16_total"}`}>
          <p className="pe-3">
            Order Due Days : <span className="fw-bold">{NumberWithCommas(json0Data?.DueDays, 0)}</span>
          </p>
          <p>
            Order Due Date :
            <span className="fw-bold">{json0Data?.DueDate}</span>
          </p>
        </div>
      </div>
    </div> : <p className='text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto'>{msg}</p>}
  </>
  );
};

export default ItemWisePrint;
