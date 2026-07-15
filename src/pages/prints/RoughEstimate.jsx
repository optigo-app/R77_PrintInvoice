import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import "../../assets/css/prints/roughestimate.css";
import Button from "../../GlobalFunctions/Button";
import Loader from "../../components/Loader";
import { apiCall, checkMsg, formatAmount, isObjectEmpty, NumberWithCommas, taxGenrator } from "./../../GlobalFunctions";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import cloneDeep from "lodash/cloneDeep";

const RoughEstimate = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  const [json, setJson] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [json1, setJson1] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [json2, setJson2] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [resultArray, setResultArray] = useState([]);
  const [mainTotal, setMainTotal] = useState({});
  const [groupedArr, setGroupedArr] = useState([]);
  const [groupedLen, setGroupedLen] = useState(0);
  const [NetWt, setNetWt] = useState(0);
  const [GrossWt, setGrossWt] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [TotalCost, setTotalCost] = useState(0);
  const [TotalMAMT, setTotalMAMT] = useState(0);
  const [TotalFWT, setTotalFWT] = useState(0);
  const [TotalPKG, setTotalPKG] = useState(0);
  const [taxTotal, setTaxTotal] = useState([]);
  const [finalAmount, setFinalAmount] = useState(0);
  const [totalUnitCost, setTotalUnitCost] = useState(0);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const [result, setResult] = useState(null);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };

  // const organizeData = (arr, arr1, arr2) => {
  //   let FineArr = [];

  //   // eslint-disable-next-line array-callback-return
  //   arr1?.map((e, i) => {
  //     // eslint-disable-next-line array-callback-return
  //     arr2?.map((el, i) => {
  //       if (e?.SrJobno === el?.StockBarcode) {
  //         if (e?.MetalPurity === el?.QualityName) {
  //           FineArr.push(el);
  //         }
  //       }
  //     });
  //   });
  //   let blankArr = [];

  //   arr1.map((e) => {
  //     let obj = { ...e };
  //     obj.FineWt = 0;
  //     obj.MRate = 0;
  //     // eslint-disable-next-line array-callback-return
  //     FineArr?.map((el) => {
  //       if (e?.SrJobno === el?.StockBarcode) {
  //         obj.FineWt += el?.FineWt;
  //         obj.MRate += el?.Rate;
  //       }
  //     });
  //     blankArr.push(obj);
  //   });

  //   let mainTotal = {
  //     diamonds: {
  //       Wt: 0,
  //       Pcs: 0,
  //       Rate: 0,
  //       Amount: 0,
  //     },
  //     colorstone: {
  //       Wt: 0,
  //       Pcs: 0,
  //       Rate: 0,
  //       Amount: 0,
  //     },
  //     metal: {
  //       Wt: 0,
  //       Pcs: 0,
  //       Rate: 0,
  //       Amount: 0,
  //     },
  //     misc: {
  //       Wt: 0,
  //       Pcs: 0,
  //       Rate: 0,
  //       Amount: 0,
  //     },
  //     finding: {
  //       Wt: 0,
  //       Pcs: 0,
  //       Rate: 0,
  //       Amount: 0,
  //     },
  //     totalnetwt: {
  //       netwt: 0,
  //     },
  //     totalgrosswt: {
  //       grosswt: 0,
  //     },
  //     totallabourAmount: 0,
  //     totalOtherAmount: 0,
  //     totalunitCost: 0,
  //   };

  //   let resultArr = [];

  //   // eslint-disable-next-line array-callback-return
  //   arr1.map((e, i) => {
  //     let totamt = 0;
  //     let diamonds = [];
  //     let colorstone = [];
  //     let metal = [];
  //     let misc = [];
  //     let finding = [];
  //     let totals = {
  //       diamonds: {
  //         Wt: 0,
  //         Pcs: 0,
  //         Rate: 0,
  //         Amount: 0,
  //       },
  //       colorstone: {
  //         Wt: 0,
  //         Pcs: 0,
  //         Rate: 0,
  //         Amount: 0,
  //       },
  //       metal: {
  //         Wt: 0,
  //         Pcs: 0,
  //         Rate: 0,
  //         Amount: 0,
  //       },
  //       misc: {
  //         Wt: 0,
  //         Pcs: 0,
  //         Rate: 0,
  //         Amount: 0,
  //       },
  //       finding: {
  //         Wt: 0,
  //         Pcs: 0,
  //         Rate: 0,
  //         Amount: 0,
  //       },
  //       labourAmount: 0,
  //       OtherAmount: 0,
  //     };
  //     totals.OtherAmount += +e?.OtherCharges + e?.MiscAmount;
  //     totals.labourAmount += e?.PackageWt;
  //     // eslint-disable-next-line no-unused-vars
  //     totamt += e?.TotalAmount;
  //     mainTotal.totalgrosswt.grosswt += e?.grosswt;
  //     mainTotal.totalnetwt.netwt += +e?.NetWt + +e?.LossWt;
  //     mainTotal.totalOtherAmount =
  //       mainTotal.totalOtherAmount + e?.OtherCharges + e?.MiscAmount;
  //     mainTotal.totallabourAmount =
  //       mainTotal.totallabourAmount + e?.MakingAmount + e?.TotalDiaSetcost;
  //     // eslint-disable-next-line array-callback-return
  //     arr2.map((ele, ind) => {
  //       if (e.SrJobno === ele?.StockBarcode) {
  //         if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
  //           ele.finewt = ele?.FineWt;
  //           diamonds.push(ele);
  //           totals.diamonds.Wt += ele?.Wt;
  //           totals.diamonds.Pcs += ele?.Pcs;
  //           totals.diamonds.Rate += ele?.Rate;
  //           totals.diamonds.Amount += ele?.Amount;
  //           mainTotal.diamonds.Wt += ele?.Wt;
  //           mainTotal.diamonds.Pcs += ele?.Pcs;
  //           mainTotal.diamonds.Rate += ele?.Rate;
  //           mainTotal.diamonds.Amount += ele?.Amount;
  //         }
  //         if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
  //           colorstone.push(ele);
  //           totals.colorstone.Wt += ele?.Wt;
  //           totals.colorstone.Pcs += ele?.Pcs;
  //           totals.colorstone.Rate += ele?.Rate;
  //           totals.colorstone.Amount += ele?.Amount;
  //           mainTotal.colorstone.Wt += ele?.Wt;
  //           mainTotal.colorstone.Pcs += ele?.Pcs;
  //           mainTotal.colorstone.Rate += ele?.Rate;
  //           mainTotal.colorstone.Amount += ele?.Amount;
  //         }
  //         if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
  //           misc.push(ele);
  //           totals.misc.Wt += ele?.Wt;
  //           totals.misc.Pcs += ele?.Pcs;
  //           totals.misc.Rate += ele?.Rate;
  //           totals.misc.Amount += ele?.Amount;
  //           mainTotal.misc.Wt += ele?.Wt;
  //           mainTotal.misc.Pcs += ele?.Pcs;
  //           mainTotal.misc.Rate += ele?.Rate;
  //           mainTotal.misc.Amount += ele?.Amount;
  //         }
  //         if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
  //           metal.push(ele);
  //           totals.metal.Wt += ele?.Wt;
  //           totals.metal.Pcs += ele?.Pcs;
  //           totals.metal.Rate += ele?.Rate;
  //           totals.metal.Amount += ele?.Amount;
  //           mainTotal.metal.Wt += ele?.Wt;
  //           mainTotal.metal.Pcs += ele?.Pcs;
  //           mainTotal.metal.Rate += ele?.Rate;
  //           mainTotal.metal.Amount += ele?.Amount;
  //         }
  //         if (ele?.MasterManagement_DiamondStoneTypeid === 5) {
  //           finding.push(ele);
  //           totals.finding.Wt += ele?.Wt;
  //           totals.finding.Pcs += ele?.Pcs;
  //           totals.finding.Rate += ele?.Rate;
  //           totals.finding.Amount += ele?.Amount;
  //           mainTotal.finding.Wt += ele?.Wt;
  //           mainTotal.finding.Pcs += ele?.Pcs;
  //           mainTotal.finding.Rate += ele?.Rate;
  //           mainTotal.finding.Amount += ele?.Amount;
  //         }
  //       }
  //     });
  //     let obj = { ...e };
  //     let separte = separatedOthAmt(obj);
  //     obj.OtherAmountInfo = separte;
  //     obj.diamonds = diamonds;
  //     obj.colorstone = colorstone;
  //     obj.metal = metal;
  //     obj.misc = misc;
  //     obj.finding = finding;
  //     obj.totals = totals;
  //     let sumoflbr = e?.MakingAmount;
  //     obj.LabourAmountSum = sumoflbr;
  //     let sumofOth = e?.OtherCharges + e?.MiscAmount;
  //     obj.OtherChargeAmountSum = sumofOth;
  //     resultArr.push(obj);
  //   });

  //   setGrossWt(mainTotal.totalgrosswt.grosswt);
  //   setNetWt(mainTotal.totalnetwt.netwt);
  //   setResultArray(resultArr);
  //   setMainTotal(mainTotal);

  //   const groupedData = blankArr.reduce((acc, item) => {
  //     const key = `${item?.Collectionname} ${item?.Categoryname} ${item?.MetalPurity}`;
  //     if (!acc[key]) {
  //       acc[key] = [];
  //     }
  //     acc[key].push(item);
  //     return acc;
  //   }, {});

  //   const result = Object.keys(groupedData).map((key) => {
  //     const group = groupedData[key];
  //     const [Collectionname, Categoryname] = key.split(" ");
  //     const sums = {
  //       jobno: "",
  //       TotalAmount: 0,
  //       grosswt: 0,
  //       NetWt: 0,
  //       MetalPriceRatio: 0,
  //       labourAmount: 0,
  //       OtherAmount: 0,
  //       MetalAmt: 0,
  //       len: group?.length,
  //       Wastage: 0,
  //       FineWt: 0,
  //       PKG: 0,
  //       miscAmt: 0,
  //     };

  //     group.forEach((item) => {
  //       sums.jobno = item?.SrJobno;
  //       sums.TotalAmount += item.UnitCost;
  //       sums.grosswt += item.grosswt;
  //       sums.NetWt += item.NetWt;
  //       sums.MetalPriceRatio += item.MetalPriceRatio;
  //       sums.labourAmount += item.MakingAmount + item?.TotalDiaSetcost;
  //       sums.OtherAmount += item.OtherCharges + item?.MiscAmount;
  //       sums.Categoryname = Categoryname;
  //       sums.Collectionname = Collectionname;
  //       sums.MetalAmt += item.MetalAmount;
  //       sums.Wastage = item?.Wastage;
  //       sums.FineWt += item?.FineWt;
  //       sums.PKG += item?.PackageWt;
  //       sums.miscAmt += item?.MiscAmount;
  //     });
  //     return sums;
  //   });
  //   const sumOfLen = result?.reduce((acc, e) => acc + (e?.len || 0), 0);
  //   let sumofAmt = result?.reduce((acc, e) => acc + (e?.TotalAmount || 0), 0);
  //   const sumUAmt = result?.reduce((acc, e) => acc + (e?.TotalAmount || 0) , 0)
  //   const sumofMAmt = result?.reduce((acc, e) => acc + (e?.MetalAmt || 0), 0);
  //   const sumofFWT = result?.reduce((acc, e) => acc + (e?.FineWt || 0), 0);
  //   const sumofPKG = result?.reduce((acc, e) => acc + (e?.PKG || 0), 0);
  //   // const sumofPKG = result?.reduce((acc, e) => acc + (e?.PKG || 0), 0);
  //   let allTax = taxGenrator(arr, sumofAmt);
  //   sumofAmt += arr?.AddLess;
  //   allTax?.length > 0 &&
  //     allTax?.forEach((e) => {
  //       sumofAmt += +e?.amount;
  //     });
  //   setTaxTotal(allTax);
  //   setTotalUnitCost(sumUAmt?.toFixed(2))
  //   setFinalAmount(sumofAmt?.toFixed(2));
  //   setTotalPKG(sumofPKG);
  //   setTotalFWT(sumofFWT);
  //   setTotalMAMT(sumofMAmt);
  //   setGroupedLen(sumOfLen);
  //   setTotalCost(sumofAmt?.toFixed(2));
  //   setGroupedArr(result);
  // };

  async function loadData(data) {
    try {
      setJson(data?.BillPrint_Json[0]);
      setJson1(data?.BillPrint_Json1);
      setJson2(data?.BillPrint_Json2);
      // organizeData(
      //   data?.BillPrint_Json[0],
      //   data?.BillPrint_Json1,
      //   data?.BillPrint_Json2
      // );
      let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
      data.BillPrint_Json[0].address = address;
      const datas = OrganizeDataPrint(
        data?.BillPrint_Json[0],
        data?.BillPrint_Json1,
        data?.BillPrint_Json2
      );
      let finalArr = [];
      datas?.resultArray?.forEach((e) => {
          let obj = cloneDeep(e);
          let findrec = finalArr?.findIndex((el) => el?.Tunch === e?.Tunch && el?.Collectionname === e?.Collectionname && el?.Categoryname === e?.Categoryname && el?.MakingChargeDiscount === e?.MakingChargeDiscount);
          if(findrec === -1){
              finalArr.push(obj);
          }else{
            finalArr[findrec].grosswt += obj?.grosswt;
            finalArr[findrec].NetWt += obj?.NetWt;
            finalArr[findrec].LossWt += obj?.LossWt;
            finalArr[findrec].MetalAmount += obj?.MetalAmount;
            finalArr[findrec].MakingAmount += obj?.MakingAmount;
            finalArr[findrec].PackageWt += obj?.PackageWt;
            finalArr[findrec].PureNetWt += obj?.PureNetWt;
            finalArr[findrec].TotalAmount += obj?.TotalAmount;
            finalArr[findrec].UnitCost += obj?.UnitCost;
            finalArr[findrec].OtherCharges += obj?.OtherCharges;
            finalArr[findrec].Quantity += obj?.Quantity;
            finalArr[findrec].TotalDiamondHandling += obj?.TotalDiamondHandling;
            finalArr[findrec].MiscAmount += obj?.MiscAmount;
          }
      })
      datas.resultArray = finalArr;
      datas.resultArray.sort((a, b) => a?.Collectionname - b?.Collectionname);
      let totpkg = 0;
      datas?.resultArray?.forEach((a) => {
        totpkg += a?.PackageWt;
      })
      setTotalPKG(totpkg)

      setResult(datas);
      // countCategorySubCategory(data?.BillPrint_Json1);
      setLoader(false);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const sendData = async () => {
      try {
        const data = await apiCall(token, invoiceNo, printName, urls, evn, ApiVer);
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
        console.log(error);
      }
    };
    sendData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const separatedOthAmt = (obj) => {
    const parsedAmounts = obj?.OtherAmtDetail?.split("#@#")?.map((item) => {
      let [name, value] = item?.split("#-#");
      return { name, value: parseFloat(value) || 0 };
    });
    return parsedAmounts;
  };

  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          {msg === "" ? (
            <>
              <div className="container_reg pad_60_allPrint">
                <div className="btnpclRE">
                  <Button />
                </div>
                <div className="p-2 d-flex justify-content-center align-items-center fw-bold fs-2">
                  {result?.header?.PrintHeadLabel}
                </div>
                <div className="header1RE">
                  <div className="fw-bold fs-3 lhRE">{result?.header?.companyname}</div>
                  <div className="fw-bold fs-3 lhRE">
                    {result?.header?.Company_VAT_GST_No}
                  </div>
                </div>
                <div className="header2RE">
                  <div className="d-flex flex-column">
                    <div className="d-flex">
                      <div className="headerAddRE" style={{marginRight:'1rem'}}>To,</div>
                      <div className="headerAddRE fw-bold"> {result?.header?.customerfirmname} </div>
                    </div>
                    <div className="d-flex" style={{paddingLeft:'3.5rem'}}>
                      <div className="headerAddRE">{result?.header?.customercity} :</div>{" "} <div className="headerAddRE">{result?.header?.PinCode}</div> </div>
                    <div className="d-flex" style={{paddingLeft:'3.5rem'}}>
                      <div className="headerAddRE">GSTIn :</div>{" "} <div className="headerAddRE fw-bold"> {result?.header?.CustGstNo === '' ? result?.header?.Cust_VAT_GST_No : result?.header?.Cust_VAT_GST_No} </div>
                    </div>
                    <div className="d-flex" style={{paddingLeft:'3.5rem'}}>
                      <div className="headerAddRE">Bill No :</div>{" "} <div className="headerAddRE fw-bold"> {result?.header?.InvoiceNo} </div>
                    </div>
                    <div className="d-flex" style={{paddingLeft:'3.5rem'}}>
                      <div className="headerAddRE">Date :</div>{" "}
                      <div className="headerAddRE fw-bold"> {result?.header?.EntryDate} </div>
                    </div>
                  </div>
                  <div className="rateREflex">
                    <div className="rateRE"> 24K RATE : </div>
                    <div className="rateRE fw-bold"> {result?.header?.MetalRate24K?.toFixed(2)} </div>
                  </div>
                </div>
                <div className="tableRE">
                  <div className="theadRE">
                    <div className="d-flex fw-bold c1QTYRE ">QTY </div>
                    <div className="d-flex fw-bold qdRE" style={{ justifyContent: "flex-start", paddingLeft: "8px", }} >
                      DESCRIPTION
                    </div>
                    <div className="d-flex fw-bold r1RE">
                      <p className="c1RE brbRE d-flex justify-content-end ">
                        PKG WT
                      </p>
                      <p className="c1RE d-flex justify-content-end">G WT</p>
                    </div>
                    <div className="d-flex fw-bold r1RE">
                      <p className="c1RE brbRE d-flex justify-content-end">
                        NET WT
                      </p>
                      <p className="c1RE d-flex justify-content-end">
                        FINE WT /{" "}
                      </p>
                      <p className="c1RE d-flex justify-content-end">M AMT</p>
                    </div>
                    <div className="d-flex fw-bold r1RE">
                      <p className="c1RE brbRE endRE">LABOUR AMT</p>
                      <p className="c1RE brbRE endRE">OTHER AMT</p>{" "}
                      <p className="c1RE endRE">TOTAL AMT</p>
                    </div>
                  </div>
                  {result?.resultArray?.map((e, i) => {
                    return (
                      <div className="tbodyRE" key={i}>
                        <div className="d-flex c1QTYRE fs-3">{e?.Quantity}</div>
                        <div className="d-flex qtdRE">
                          <p className="fs-3">
                            {/* {e?.MetalPriceRatio?.toFixed(3)} Purity */}
                            {(e?.Tunch - e?.Wastage)?.toFixed(3)} Purity
                          </p>
                          {e?.Wastage === 0 ? (
                            ""
                          ) : (
                            <p className="fs-3">W: {e?.Wastage?.toFixed(3)}</p>
                          )}
                          {e?.MakingChargeDiscount === 0 ? (
                            ""
                          ) : (
                            <p className="fs-3">M: {e?.MakingChargeDiscount?.toFixed(2)}</p>
                          )}
                          <p className="fs-3 text-break">{e?.Collectionname}</p>
                          <p className="fs-3 fw-bold text-break">{e?.Categoryname}</p>
                        </div>
                        <div className="d-flex r1RE">
                          <p className="c1RE brbRE fs-3 d-flex justify-content-end">
                            {/* {e?.PKG?.toFixed(3)} */}
                            {e?.PackageWt?.toFixed(3)}
                          </p>
                          <p className="c1RE fw-bold align-item-end fs-3 d-flex justify-content-end">
                            {e?.grosswt?.toFixed(3)}
                          </p>
                        </div>
                        <div className="d-flex r1RE">
                          <p className="c1RE brbRE endRE fs-3">
                            {e?.NetWt?.toFixed(3)}
                          </p>
                          {e?.MetalAmt === 0 ? (
                            <p className="c1RE endRE fs-3">
                              {/* {e?.FineWt?.toFixed(3)} */}
                            </p>
                          ) : (
                            <p className="c1RE endRE fs-3 fw-bold">
                              {/* {NumberWithCommas(e?.MetalAmt, 2)} */}
                              {formatAmount(e?.MetalAmount)}
                            </p>
                          )}
                        </div>
                        <div className="d-flex r1RE" style={{}}>
                          <p className="c1RE brbRE endRE fs-3">
                            {/* {NumberWithCommas(e?.labourAmount, 2)} */}
                            {formatAmount(e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount)}
                          </p>
                          <p className="c1RE brbRE endRE fs-3">
                            {/* {NumberWithCommas(e?.OtherAmount, 2)} */}
                            {formatAmount(e?.OtherCharges + e?.TotalDiamondHandling + e?.MiscAmount)}
                          </p>{" "}
                          <p className="c1RE fw-bold endRE fs-3">
                            {/* {NumberWithCommas(e?.TotalAmount, 2)} */}
                            {formatAmount(e?.TotalAmount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="" style={{  display: "flex", justifyContent: "flex-start", alignItems: "flex-start" }} >
                    <div className="d-flex c1QTYRE fw-bold fs-3">
                      {result?.mainTotal?.total_Quantity}
                    </div>
                    <div className="d-flex qtdRE" style={{ justifyContent: "flex-start" }} >
                      <p className="fs-3 fw-bold align-items-start">TOTAL</p>
                      <p className="fs-2"></p>
                      <p className="fs-2"></p>
                    </div>
                    <div className="d-flex  flex-column w-50">
                      <p className="c1RE brbRE fs-3 d-flex justify-content-end">
                        {TotalPKG?.toFixed(2)}
                      </p>
                      <p className="c1RE fw-bold fs-3 d-flex justify-content-end">
                        {result?.mainTotal?.grosswt?.toFixed(3)}
                      </p>
                    </div>
                    <div className="d-flex flex-column w-50">
                      <div className="c1RE brbRE endRE fs-3">
                        {result?.mainTotal?.netwt?.toFixed(3)}
                      </div>
                      {/* {TotalFWT === 0 ? (
                        ""
                      ) : (
                        <div className="c1RE brbRE endRE fs-3 fw-bold text-black">
                          {TotalFWT?.toFixed(3)} /{" "}
                        </div>
                      )} */}

                      <div className="c1RE brbRE endRE fs-3 fw-bold">
                        {/* {NumberWithCommas(TotalMAMT, 2)} */}
                        {formatAmount(result?.mainTotal?.MetalAmount)}
                      </div>
                      {/* </p> */}
                    </div>
                    <div className="d-flex flex-column w-50 pb-1 ">
                      <p className="c1RE brbRE endRE fs-3">
                        {/* {NumberWithCommas(mainTotal.totallabourAmount, 2)} */}
                        {formatAmount(((
                          // ((result?.mainTotal?.total_Making_Amount + result?.mainTotal?.diamonds?.SettingAmount + result?.mainTotal?.colorstone?.SettingAmount))/(result?.header?.CurrencyExchRate)
                          ((result?.mainTotal?.total_Making_Amount + result?.mainTotal?.diamonds?.SettingAmount + result?.mainTotal?.colorstone?.SettingAmount))
                          )))}
                      </p>
                      <p className="c1RE brbRE endRE fs-3">
                        {/* {NumberWithCommas(mainTotal.totalOtherAmount, 2)} */}
                        {formatAmount((result?.mainTotal?.total_other + result?.mainTotal?.total_diamondHandling + result?.mainTotal?.misc?.Amount))}
                      </p>
                      <p className="c1RE fw-bold endRE fs-3">
                        {/* {NumberWithCommas(totalUnitCost, 2)} */}
                        {/* {formatAmount((result?.mainTotal?.total_amount / result?.header?.CurrencyExchRate))} */}
                        {formatAmount((result?.mainTotal?.total_amount))}
                      </p>
                    </div>
                  </div>
                </div>
                <div style={{ borderBottom: "1px solid black" , borderTop:'1px solid black'}}>
                  <div className="grandTotalRE">
                    <div className="d-flex flex-column justify-content-between wgtRE">
                      {result?.allTaxes?.length > 0 &&
                        result?.allTaxes?.map((e, i) => {
                          return (
                            <div
                              className="d-flex justify-content-between"
                              key={i}
                            >
                              <div className="d-flex justify-content-end w-50 fs-3">
                                {e?.name} {e?.per}
                              </div>
                              <div className="d-flex justify-content-end w-50 fs-3">
                                
                                {formatAmount((e?.amount * result?.header?.CurrencyExchRate))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    <div className="d-flex justify-content-between wgtRE">
                      <div className="fs-3 w-50 d-flex justify-content-end">
                        {result?.header?.AddLess > 0 ? 'Add' : 'Less'}
                      </div>
                      <div className="fs-3 w-50 d-flex justify-content-end">
                        {result?.header?.AddLess?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end fw-bold">
                    <div
                      className="d-flex justify-content-between wgtRE"
                      style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
                    >
                      <div className="fs-3 d-flex justify-content-end w-50 text-black">
                        TOTAL
                      </div>
                      <div className="fs-3 d-flex justify-content-end w-50 text-black">
                        {/* {formatAmount((result?.mainTotal?.total_amount + result?.allTaxesTotal + result?.header?.AddLess))} */}
                        {formatAmount((result?.mainTotal?.total_amount + (result?.allTaxesTotal * result?.header?.CurrencyExchRate) + result?.header?.AddLess))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="fw-bold fs-5 px-2 py-1 text-black p-0" >
                  Remark : <span dangerouslySetInnerHTML={{__html:result?.header?.PrintRemark}}></span> 
                </div>
                <div className="d-flex flex-column align-items-end fs-3">
                  <div className="wREord p-0">
                    <p className="fs-2">Order Due Days :</p>{" "}
                    <p className="fw-bold fs-2">{result?.header?.DueDays}</p>
                  </div>
                  <div className="wREord p-0">
                    <p className="fs-2">Order Due Date :</p>{" "}
                    <p className="fw-bold fs-2">{result?.header?.DueDate}</p>
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

export default RoughEstimate;
