
import React, { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import style from "../../assets/css/prints/InvoicePrint_10_11.module.css";
import {
  FooterComponent,
  HeaderComponent,
  NumberWithCommas,
  apiCall,
  checkMsg,
  fixedValues,
  handlePrint,
  isObjectEmpty,
  taxGenrator,
   mergeMetals,
    mergeFindings
} from "../../GlobalFunctions";
import { ToWords } from "to-words";
import BarcodePrintGenerator from "../../components/barcodes/BarcodePrintGenerator";
import style2 from "../../assets/css/headers/header1.module.css";
import footerStyle from "../../assets/css/footers/footer2.module.css";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { cloneDeep } from "lodash";

const InvoicePrint8 = ({
  token,
  invoiceNo,
  printName,
  urls,
  evn,
  ApiVer,
}) => {
  const [loader, setLoader] = useState(true);
  const [msg, setMsg] = useState("");
  const [data, setData] = useState([]);
  const [otherMaterial, setOtherMaterial] = useState([]);
  const [header, setHeader] = useState(null);
  const [headerss, setHeaderss] = useState(null);
  const [footer, setFooter] = useState(null);
  const [headerData, setHeaderData] = useState({});
  const [customerAddress, setCustomerAddress] = useState([]);
  const [mainDatas, setMainDatas] = useState({});
  const [total, setTotal] = useState({
    total: 0,
    grandtotal: 0,
    totals: 0,
    discounttotals: 0,
  });
  // const []
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  const [discount, setDiscount] = useState(0);
  const [taxes, setTaxes] = useState([]);
  const [pnm, setPnm] = useState(atob(printName).toLowerCase());
  const [totalpcsss, setTotalPcsss] = useState(0);
  const toWords = new ToWords();

  const [mainData, setMainData] = useState({
    resultArr: [],
    findings: [],
    diamonds: [],
    colorStones: [],
    miscs: [],
    otherCharges: [],
    misc2: [],
    labour: {},
    diamondHandling: 0,
  });
  const [totalss, setTotalss] = useState({
    total: 0,
    discount: 0,
    totalPcs: 0,
  });

  const loadData = (data) => {
    let head = HeaderComponent("1", data?.BillPrint_Json[0]);
    setHeader(head);
    setHeaderData(data?.BillPrint_Json[0]);
    let footers = FooterComponent("2", data?.BillPrint_Json[0]);
    setFooter(footers);

    let headersss = HeaderComponent("3", data?.BillPrint_Json[0]);
    setHeaderss(headersss);
    let custAddress = data?.BillPrint_Json[0]?.Printlable.split("\n");
    setCustomerAddress(custAddress);
    let datas = OrganizeDataPrint(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );
    setMainDatas(datas);
    let resultArr = [];
    let findings = [];
    let diamonds = [];
    let colorStones = [];
    let misc2 = [];
    let labour = {
      label: "LABOUR",
      primaryWt: 0,
      makingAmount: 0,
      totalAmount: 0,
    };
    let miscs = [];
    let otherCharges = [];
    let total2 = { ...totalss };
    let diamondTotal = 0;
    let colorStone1Total1 = 0;
    let colorStone2Total2 = 0;
    let misc1Total1 = 0;
    let misc2Total2 = 0;
    let diamondHandling = 0;
    let totalPcss = [];
    let jobWiseLabourCalc = 0;
    let jobWiseMinusFindigWt = 0;
    datas?.resultArray?.map((e, i) => {
      let obj = cloneDeep(e);
      let findingWt = 0;
      let findingsWt = 0;
      let findingsAmount = 0;
      let secondaryMetalAmount = 0;

      obj.primaryMetal = e?.metal?.find((ele, ind) => ele?.IsPrimaryMetal === 1);
      e?.finding?.forEach((ele, ind) => {
        if (ele?.ShapeName !== obj?.primaryMetal?.ShapeName && ele?.QualityName !== obj?.primaryMetal?.QualityName) {
          let obb = cloneDeep(ele);
          if (obj?.primaryMetal) {
            obb.Rate = obj?.primaryMetal?.Rate;
            obb.Amount = ele?.Wt * obb?.Rate;
            findingsAmount += (ele?.Wt * obb?.Rate);
          }
          findingsWt += ele?.Wt;
          findings?.push(obb);
          total2.total += obb?.Amount;
        }
        if (ele?.Supplier?.toLowerCase() === "customer") {
          findingWt += ele?.Wt;
        }
      });

      let findPcss = totalPcss?.findIndex(
        (ele, ind) => ele?.GroupJob === e?.GroupJob
      );
      if (findPcss === -1) {
        totalPcss?.push({ GroupJob: e?.GroupJob, value: e?.Quantity });
      } else {
        if (e?.GroupJob === "") {
          let findQuantity = totalPcss?.findIndex(
            (ele, ind) => ele?.GroupJob === ""
          );
          if (findQuantity === -1) {
            totalPcss?.push({ GroupJob: e?.GroupJob, value: e?.Quantity });
          } else {
            totalPcss[findQuantity].value += e?.Quantity;
          }
        }
      }

      let primaryWt = 0;
      let primaryMetalRAte = 0;
      let count = 0;
      let secondMetalWt = 0;
      let netWtFinal = e?.NetWt + e?.LossWt - findingsWt;

      diamondHandling += e?.TotalDiamondHandling;
      e?.metal?.forEach((ele, ind) => {
        count += 1;
        if (ele?.IsPrimaryMetal === 1) {
          primaryWt += ele?.Wt;
          if (primaryMetalRAte === 0) {
            primaryMetalRAte += ele?.Rate;
          }
        } else {
          secondaryMetalAmount += ele?.Amount;
          secondMetalWt += ele?.Wt;
        }
      });
      let latestAmount = (((e?.MetalDiaWt - findingsWt) * primaryMetalRAte) + secondaryMetalAmount);
      total2.total += latestAmount;
      let finalMetalAmount = (e?.MetalDiaWt - (e?.totals?.finding?.Wt * e?.LossPer) / 100 + e?.totals?.finding?.Wt) * primaryMetalRAte + secondaryMetalAmount;

      // labour.primaryWt += primaryWt;
      labour.makingAmount += e?.MakingAmount;
      labour.totalAmount += e?.MakingAmount + e?.TotalDiaSetcost + e?.TotalCsSetcost;
      total2.discount += e?.DiscountAmt;
      obj.primaryWt = primaryWt;
      obj.netWtFinal = netWtFinal;
      obj.latestAmount = latestAmount;
      obj.secondaryMetalAmount = secondaryMetalAmount;
      obj.secondMetalWt = secondMetalWt;
      obj.finalMetalAmount = finalMetalAmount;
      // obj.metalAmountFinal = e?.MetalAmount - findingsAmount + secondaryMetalAmount;
      obj.metalAmountFinal = e?.totals?.metal?.Amount - findingsAmount;
      if (count <= 1) {
        primaryWt = e?.NetWt + e?.LossWt;
      }
      if (obj?.primaryMetal) {
        // total2.total +=
        //   obj?.metalAmountFinal / data?.BillPrint_Json[0]?.CurrencyExchRate;
        let findRecord = resultArr?.findIndex((ele, ind) => ele?.primaryMetal?.ShapeName === obj?.primaryMetal?.ShapeName &&
          ele?.primaryMetal?.QualityName === obj?.primaryMetal?.QualityName && ele?.primaryMetal?.Rate === obj?.primaryMetal?.Rate
        );
        if (findRecord === -1) {
          resultArr?.push(obj);
        } else {
          resultArr[findRecord].grosswt += obj?.grosswt;
          resultArr[findRecord].NetWt += obj?.NetWt;
          resultArr[findRecord].LossWt += obj?.LossWt;
          resultArr[findRecord].primaryWt += obj?.primaryWt;
          resultArr[findRecord].primaryMetal.Pcs += obj?.primaryMetal.Pcs;
          resultArr[findRecord].primaryMetal.Wt += obj?.primaryMetal.Wt;
          resultArr[findRecord].primaryMetal.Amount += obj?.primaryMetal.Amount;
          resultArr[findRecord].netWtFinal += obj?.netWtFinal;
          resultArr[findRecord].metalAmountFinal += obj?.metalAmountFinal;
          resultArr[findRecord].secondaryMetalAmount += obj?.secondaryMetalAmount;
          resultArr[findRecord].latestAmount += latestAmount;
          resultArr[findRecord].finalMetalAmount += obj?.finalMetalAmount;
          resultArr[findRecord].secondMetalWt += obj?.secondMetalWt;
        }
      }

      jobWiseLabourCalc += (e?.MetalDiaWt - findingWt) * e?.MaKingCharge_Unit;
      jobWiseMinusFindigWt += e?.MetalDiaWt - findingWt;

      e?.diamonds?.forEach((ele, ind) => {
        let findDiamond = diamonds?.findIndex(
          (elem, index) => elem?.isRateOnPcs === ele?.isRateOnPcs
        );
        diamondTotal += ele?.Amount;
        if (findDiamond === -1) {
          diamonds?.push(ele);
        } else {
          diamonds[findDiamond].Wt += ele?.Wt;
          diamonds[findDiamond].Pcs += ele?.Pcs;
          diamonds[findDiamond].Amount += ele?.Amount;
        }
      });

      e?.colorstone?.forEach((ele, ind) => {
        // total2.total += (ele?.Amount );
        let findColorStones = colorStones?.findIndex(
          (elem, index) => elem?.isRateOnPcs === ele?.isRateOnPcs
        );
        if (findColorStones === -1) {
          colorStones?.push(ele);
        } else {
          colorStones[findColorStones].Wt += ele?.Wt;
          colorStones[findColorStones].Pcs += ele?.Pcs;
          colorStones[findColorStones].Amount += ele?.Amount;
        }
        if (ele?.isRateOnPcs === 0) {
          colorStone1Total1 += ele?.Amount;
        } else {
          colorStone2Total2 += ele?.Amount;
        }
      });

      e?.misc?.forEach((ele, ind) => {
        if (ele?.isRateOnPcs === 0) {
          misc1Total1 += ele?.Amount;
        } else {
          misc2Total2 += ele?.Amount;
        }
        if (ele?.IsHSCOE !== 0) {
          let findMisc = miscs?.findIndex(
            (elem, index) => elem?.ShapeName === ele?.ShapeName
          );
          if (findMisc === -1) {
            miscs?.push(ele);
          } else {
            miscs[findMisc].Wt += ele?.Wt;
            miscs[findMisc].Pcs += ele?.Pcs;
            miscs[findMisc].Amount += ele?.Amount;
          }
          // total2.total += (ele?.Amount);
        } else if (ele?.IsHSCOE === 0) {
          // total2.total += ele?.Amount;
          let findMisc = misc2?.findIndex(
            (elem, index) => elem?.isRateOnPcs === ele?.isRateOnPcs
          );
          if (findMisc === -1) {
            misc2?.push(ele);
          } else {
            misc2[findMisc].Wt += ele?.Wt;
            misc2[findMisc].Pcs += ele?.Pcs;
            misc2[findMisc].Amount += ele?.Amount;
          }
        }
      });

      e?.other_details?.forEach((ele, ind) => {
        let findOther = otherCharges?.findIndex(
          (elem, index) => elem?.label === ele?.label
        );
        total2.total += +ele?.value;
        if (findOther === -1) {
          otherCharges?.push(ele);
        } else {
          otherCharges[findOther].value =
            +otherCharges[findOther]?.value + +ele?.value;
        }
      });
    });
    let finalsArr = [];
    resultArr?.forEach((e, i) => {
      let finalMetalWt =
        e?.MetalDiaWt -
        (e?.totals?.finding?.Wt * e?.LossPer) / 100 +
        e?.totals?.finding?.Wt +
        e?.secondMetalWt;
      let finalRate = e?.latestAmount / e?.netWtFinal;
      let obj = cloneDeep(e);
      obj.finalMetalWt = finalMetalWt;
      obj.finalRate = finalRate;
      finalsArr?.push(obj);
    });
    let totalPcs = totalPcss?.reduce((acc, cObj) => acc + cObj?.value, 0);
    // total2.total += labour?.totalAmount
    total2.total +=
      diamondTotal / data?.BillPrint_Json[0]?.CurrencyExchRate +
      colorStone1Total1 / data?.BillPrint_Json[0]?.CurrencyExchRate +
      colorStone2Total2 / data?.BillPrint_Json[0]?.CurrencyExchRate +
      misc1Total1 / data?.BillPrint_Json[0]?.CurrencyExchRate +
      misc2Total2 / data?.BillPrint_Json[0]?.CurrencyExchRate +
      labour?.totalAmount / data?.BillPrint_Json[0]?.CurrencyExchRate +
      diamondHandling / data?.BillPrint_Json[0]?.CurrencyExchRate;

    labour.primaryWt = jobWiseMinusFindigWt;
    finalsArr.sort((a, b) => {
      const labelA = a.MetalTypePurity.toLowerCase();
      const labelB = b.MetalTypePurity.toLowerCase();

      // Check if labels contain numbers
      const hasNumberA = /\d/.test(labelA);
      const hasNumberB = /\d/.test(labelB);

      if (hasNumberA && !hasNumberB) {
        return -1; // Label with number comes before label without number
      } else if (!hasNumberA && hasNumberB) {
        return 1; // Label without number comes after label with number
      } else {
        // Both labels have numbers or both don't, sort alphabetically
        return labelA.localeCompare(labelB);
      }
    });

    let newArr = [
      {
        label: "HANDLING",
        value: diamondHandling / data?.BillPrint_Json[0]?.CurrencyExchRate,
      },
    ];
    miscs?.forEach((e, i) => {
      let obj = cloneDeep(e);
      obj.label = obj?.ShapeName;
      obj.Amount = obj?.Amount / data?.BillPrint_Json[0]?.CurrencyExchRate;
      newArr?.push(obj);
    });
    otherCharges?.forEach((e, i) => {
      let obj = cloneDeep(e);
      obj.value = +obj?.value;
      newArr?.push(obj);
    });

    newArr?.sort((a, b) => {
      var regex = /(\d+)|(\D+)/g;
      var partsA = a.label.match(regex);
      var partsB = b.label.match(regex);

      for (var i = 0; i < Math.min(partsA.length, partsB.length); i++) {
        var partA = partsA[i];
        var partB = partsB[i];

        if (!isNaN(partA) && !isNaN(partB)) {
          var numA = parseInt(partA);
          var numB = parseInt(partB);
          if (numA !== numB) {
            return numA - numB;
          }
        } else {
          if (partA !== partB) {
            return partA.localeCompare(partB);
          }
        }
      }

      return a.label.length - b.label.length;
    });

    setTotalss({ ...totalss, total: total2?.total, discount: total2?.discount, totalPcs: totalPcs, });
    setMainData({
      ...mainData,
      resultArr: finalsArr,
      findings: findings,
      diamonds: diamonds,
      colorStones: colorStones,
      miscs: miscs,
      otherCharges: newArr,
      misc2: misc2,
      labour: labour,
      diamondHandling: diamondHandling,
    });
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


  const mergeStoneData = (data = []) => {
    return data.reduce(
      (acc, item) => {
        acc.Pcs += item.Pcs || 0;
        acc.Wt += item.Wt || 0;
        acc.Amount += item.Amount || 0;

        // keep rate type
        if (acc.isRateOnPcs === null) {
          acc.isRateOnPcs = item.isRateOnPcs;
        }

        // keep material name if exists
        if (!acc.MaterialTypeName && item.MaterialTypeName) {
          acc.MaterialTypeName = item.MaterialTypeName;
        }

        return acc;
      },
      {
        Pcs: 0,
        Wt: 0,
        Amount: 0,
        isRateOnPcs: null,
        MaterialTypeName: "",
      }
    );
  };

  const mergedDiamond = mergeStoneData(mainData?.diamonds);
  const mergedColorStone = mergeStoneData(mainData?.colorStones);
  const mergedMisc = mergeStoneData(mainData?.misc2);

  return loader ? (
    <Loader />
  ) : msg === "" ? (
    <div
      className={`container container-fluid max_width_container mt-1 ${style?.InvoicePrint_10_11} pad_60_allPrint px-1`}
      style={{ width: "900px" }}
    >
      {/* buttons */}
      <div className={`d-flex justify-content-end align-items-center ${style?.print_sec_sum4} mb-4`} >
        <div className={`form-check ps-3 ${style?.printBtn}`}>
          <input type="button" className="btn_white blue py-2 mt-2" value="Print" onClick={(e) => handlePrint(e)} />
        </div>
      </div>
      {/* header */}
      {headerData?.IsEinvoice !== 1 ? <><div className={`${style2.headline} headerTitle`}>
        {headerData?.PrintHeadLabel}
      </div>
        <div className={`${style?.font_12} ${style2.companyDetails}`}>
          <div className={`${style2.companyhead} p-2`}>
            <div className={`${style2.lines} ${style?.font_16}`} style={{ fontWeight: "bold" }} >
              {headerData?.CompanyFullName}
            </div>
            <div className={style2.lines}>{headerData?.CompanyAddress}</div>
            <div className={style2.lines}>{headerData?.CompanyAddress2}</div>
            <div className={style2.lines}>
              {headerData?.CompanyCity}-{headerData?.CompanyPinCode},
              {headerData?.CompanyState}({headerData?.CompanyCountry})
            </div>
            {/* <div className={style2.lines}>Tell No: {headerData?.CompanyTellNo}</div> */}
            <div className={style2.lines}>
              T: {headerData?.CompanyTellNo} | TOLL FREE{" "}
              {headerData?.CompanyTollFreeNo} | TOLL FREE{" "}
              {headerData?.CompanyTollFreeNo}
            </div>
            <div className={style2.lines}>
              {headerData?.CompanyEmail} | {headerData?.CompanyWebsite}
            </div>
            <div className={style2.lines}>
              {/* {headerData?.Company_VAT_GST_No} | {headerData?.Company_CST_STATE}-{headerData?.Company_CST_STATE_No} | PAN-{headerData?.Pannumber} */}
              {headerData?.Company_VAT_GST_No} | {headerData?.Company_CST_STATE}-
              {headerData?.Company_CST_STATE_No} | PAN-{headerData?.Pannumber}
            </div>
          </div>
          <div
            style={{ width: "30%" }}
            className="d-flex justify-content-end align-item-center h-100"
          >
            {isImageWorking && headerData?.PrintLogo !== "" && (
              <img
                src={headerData?.PrintLogo}
                alt=""
                className="w-100 h-auto ms-auto d-block object-fit-contain"
                style={{ maxWidth: "116px" }}
                onError={handleImageErrors}
                height={120}
                width={150}
              />
            )}
            {/* <img src={headerData?.PrintLogo} alt="" className={style2.headerImg} /> */}
          </div>
        </div></> : headerss}

      <div className={`border d-flex ${style?.font_12}`}>
        <div className="col-4 px-2 border-end">
          <p>{headerData?.lblBillTo}</p>
          <p className={`fw-bold pe-2 lh-1 ${style?.font_14}`}>
            {headerData?.customerfirmname}
          </p>
          <p className="lh-1">{headerData?.customerAddress1}</p>
          <p className="lh-1">{headerData?.customerAddress2}</p>
          <p className="lh-1"> {headerData?.customercity1} </p>
          <p className="lh-1">{headerData?.customeremail1}</p>
          <p className="lh-1">{headerData?.vat_cst_pan}</p>
          <p className="lh-1"> {headerData?.Cust_CST_STATE}-{headerData?.Cust_CST_STATE_No} </p>
        </div>
        <div className="col-4 px-2 border-end">
          <p className="lh-1">Ship To,</p>
          <p className={`fw-bold lh-1 ${style?.font_14}`}>
            {headerData?.customerfirmname}
          </p>
          {customerAddress.map((e, i) => {
            return <p key={i} className="lh-1">{e}</p>;
          })}
        </div>
        <div className="col-4 px-2">
          <div className="d-flex">
            <div className="lh-1 fw-bold col-6">BILL NO</div>
            <div className="lh-1 col-6">{headerData?.InvoiceNo} </div>
          </div>
          <div className="d-flex">
            <div className="lh-1 fw-bold col-6">DATE</div>
            <div className="lh-1 col-6">{headerData?.EntryDate} </div>
          </div>

          <div className="d-flex">
            <div className="lh-1 fw-bold col-6">{headerData?.HSN_No_Label}</div>
            <div className="lh-1 col-6">{headerData?.HSN_No} </div>
          </div>
          <div className="d-flex">
            <div className="lh-1 fw-bold col-6">NAME OF GOODS</div>
            <div className="lh-1 col-6">{headerData?.NameOfGoods} </div>
          </div>
          <div className="d-flex">
            <div className="lh-1 fw-bold col-6">PLACE OF SUPPLY</div>
            <div className="lh-1 col-6">{headerData?.customerstate} </div>
          </div>
          <div className="d-flex">
            <div className="lh-1 fw-bold col-6">TERMS</div>
            <div className="lh-1 col-6">{headerData?.DueDays} </div>
          </div>
        </div>
      </div>

      <div className="my-1 no_break">
        <div className={`d-flex border ${style?.font_15}`}>
          <div className="col-3 border-end">
            <p className="text-center fw-bold border-bottom">DESCRIPTION</p>
          </div>
          <div className="col-9">
            <div className="d-flex border-bottom">
              <div
                style={{ minWidth: "17%", width: "17%" }}
                className="fw-bold px-1"
              >
                Detail
              </div>
              <div
                style={{ minWidth: "14.5%", width: "14.5%" }}
                className="fw-bold px-1 text-end"
              >
                Gross Wt.{" "}
              </div>
              <div
                style={{ minWidth: "14.5%", width: "14.5%" }}
                className="fw-bold px-1 text-end"
              >
                Net Wt.{" "}
              </div>
              <div
                style={{ minWidth: "9%", width: "9%" }}
                className="fw-bold px-1 text-end"
              >
                Pcs{" "}
              </div>
              <div
                style={{ minWidth: "15%", width: "15%" }}
                className="fw-bold px-1 text-end"
              >
                Qty{" "}
              </div>
              <div
                style={{ minWidth: "15%", width: "15%" }}
                className="fw-bold px-1 text-end"
              >
                Rate{" "}
              </div>
              <div
                style={{ minWidth: "15%", width: "15%" }}
                className="fw-bold px-1 text-end"
              >
                Amount
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex border-start border-end border-bottom">
          <div className="col-3 border-end d-flex align-items-center pt-5 flex-column">
            <p className={`w-100 text-center pb-1 ${style?.font_13}`}>
              {mainDatas?.mainTotal?.diamonds?.Pcs > 0
                ? "DIAMOND STUDDED"
                : "GOLD"}{" "}
              JEWELLERY
            </p>
            <p className={`fw-bold ${style?.font_17}`}>
              Total Pcs : {NumberWithCommas(totalss?.totalPcs, 0)}
            </p>
          </div>
          <div className={`col-9 ${style?.font_13}`}>
            
           { console.log("TCL:mainData?.resultArr ", mainData?.resultArr)}
            {mainData?.resultArr?.map((e, i) => {

               const mergedMetals = mergeMetals(e?.metal);
            

              
        
              return  mergedMetals?.map((m, i) => (
                  <div className="d-flex" key={i}>
                    <div style={{ minWidth: "17%", width: "17%" }} className="px-1 text-uppercase">
                      <p>
                        {m?.ShapeName} {m?.QualityName}
                      </p>
                    </div>
                
                    <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end">
                      <p>  {
                                                            m?.IsPrimaryMetal == 1
                                                              ? (
                                                                i === 0
                                                                  ? NumberWithCommas(
                                                                    e?.NetWt + (e?.totals?.diamonds?.Wt / 5),
                                                                    3
                                                                  )+" Gms"
                                                                  : NumberWithCommas(m?.Wt, 3)
                                                              )
                                                              : ""
                                                          } </p>
                    </div>
                
                    <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end">
                      {/* <p>{NumberWithCommas(m?.netWtFinal, 3)} Gms</p> */}
                      <p>  {NumberWithCommas(m?.Wt - e?.totals?.finding?.Wt, 3)} Gms</p>
                      
                    </div>
                
                    <div style={{ minWidth: "9%", width: "9%" }} className="px-1">
                      <p></p>
                    </div>
                
                    <div style={{ minWidth: "15%", width: "15%" }} className="px-1">
                      <p></p>
                    </div>
                
                    <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end">
                      {/* <p>{NumberWithCommas(m?.finalRate, 2)}</p> */}
                      <p>   {m?.Rate?.toFixed(2)}</p>
                    </div>
                
                    <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end">
                      {/* <p>{NumberWithCommas(m?.latestAmount, 2)}</p> */}
                      <p>{m?.Amount?.toFixed(2)}</p>
                    </div>
                  </div>
                ))
                
              
            })}
            {mainData?.findings?.map((e, i) => {
              return (
                <div className="d-flex" key={i}>
                  <div
                    style={{ minWidth: "17%", width: "17%" }}
                    className="px-1 text-uppercase"
                  >
                    <p>
                      {e?.ShapeName} {e?.QualityName}
                    </p>
                  </div>
                  <div
                    style={{ minWidth: "14.5%", width: "14.5%" }}
                    className="px-1 text-end"
                  >
                    <p></p>
                  </div>
                  <div
                    style={{ minWidth: "14.5%", width: "14.5%" }}
                    className="px-1 text-end"
                  >
                    <p>{NumberWithCommas(e?.Wt, 3)} Gms</p>
                  </div>
                  <div style={{ minWidth: "9%", width: "9%" }} className="px-1">
                    <p></p>
                  </div>
                  <div
                    style={{ minWidth: "15%", width: "15%" }}
                    className="px-1"
                  >
                    <p></p>
                  </div>
                  <div
                    style={{ minWidth: "15%", width: "15%" }}
                    className="px-1 text-end"
                  >
                    <p>{NumberWithCommas(e?.Rate, 2)}</p>
                  </div>
                  <div
                    style={{ minWidth: "15%", width: "15%" }}
                    className="px-1 text-end"
                  >
                    <p>{NumberWithCommas(e?.Amount, 2)}</p>
                  </div>
                </div>
              );
            })}

            {(mainData?.diamonds?.length > 0) && (
              <div className="d-flex">

                <div
                  style={{ minWidth: "17%", width: "17%" }}
                  className="px-1 text-uppercase"
                >
                  <p>DIAMOND</p>
                </div>

                <div
                  style={{ minWidth: "14.5%", width: "14.5%" }}
                  className="px-1 text-end"
                >
                  <p></p>
                </div>

                <div
                  style={{ minWidth: "14.5%", width: "14.5%" }}
                  className="px-1 text-end"
                >
                  <p></p>
                </div>

                <div
                  style={{ minWidth: "9%", width: "9%" }}
                  className="px-1 text-end"
                >
                  <p>{NumberWithCommas(mergedDiamond?.Pcs, 0)}</p>
                </div>

                <div
                  style={{ minWidth: "15%", width: "15%" }}
                  className="px-1 text-end"
                >
                  <p>{NumberWithCommas(mergedDiamond?.Wt, 3)} Ctw</p>
                </div>

                <div
                  style={{ minWidth: "15%", width: "15%" }}
                  className="px-1 text-end"
                >
                  <p>
                    {mergedDiamond?.isRateOnPcs === 0
                      ? mergedDiamond?.Wt !== 0 &&
                      `${NumberWithCommas(
                        mergedDiamond?.Amount /
                        mergedDiamond?.Wt /
                        headerData?.CurrencyExchRate,
                        2
                      )} / Wt`
                      : mergedDiamond?.Pcs !== 0 &&
                      `${NumberWithCommas(
                        mergedDiamond?.Amount /
                        mergedDiamond?.Pcs /
                        headerData?.CurrencyExchRate,
                        2
                      )} / Pcs`}
                  </p>
                </div>

                <div
                  style={{ minWidth: "15%", width: "15%" }}
                  className="px-1 text-end"
                >
                  <p>
                    {NumberWithCommas(
                      mergedDiamond?.Amount / headerData?.CurrencyExchRate,
                      2
                    )}
                  </p>
                </div>

              </div>
            )}

            {(mainData?.colorStones?.length > 0) && (
              <div className="d-flex">

                <div
                  style={{ minWidth: "17%", width: "17%" }}
                  className="px-1 text-uppercase"
                >
                  <p>Color Stone</p>
                </div>

                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end">
                  <p></p>
                </div>

                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end">
                  <p></p>
                </div>

                <div style={{ minWidth: "9%", width: "9%" }} className="px-1 text-end">
                  <p>{NumberWithCommas(mergedColorStone?.Pcs, 0)}</p>
                </div>

                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end">
                  <p>
                    {NumberWithCommas(mergedColorStone?.Wt, 3)}{" "}
                    {atob(printName) === "invoice print 8A" ? "Gms" : "Ctw"}
                  </p>
                </div>

                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end">
                  <p>
                    {mergedColorStone?.isRateOnPcs === 0
                      ? mergedColorStone?.Wt !== 0 &&
                      `${NumberWithCommas(
                        mergedColorStone?.Amount /
                        mergedColorStone?.Wt /
                        headerData?.CurrencyExchRate,
                        2
                      )} / Wt`
                      : mergedColorStone?.Pcs !== 0 &&
                      `${NumberWithCommas(
                        mergedColorStone?.Amount /
                        mergedColorStone?.Pcs /
                        headerData?.CurrencyExchRate,
                        2
                      )} / Pcs`}
                  </p>
                </div>

                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end">
                  <p>
                    {NumberWithCommas(
                      mergedColorStone?.Amount / headerData?.CurrencyExchRate,
                      2
                    )}
                  </p>
                </div>

              </div>
            )}
            {/* {mainData?.misc2?.map((e, i) => {
              return (
                <div className="d-flex" key={i}>
                  <div
                    style={{ minWidth: "17%", width: "17%" }}
                    className="px-1 text-uppercase"
                  >
                    <p>OTHER MATERIAL</p>
                  </div>
                  <div
                    style={{ minWidth: "14.5%", width: "14.5%" }}
                    className="px-1 text-end"
                  >
                    <p></p>
                  </div>
                  <div
                    style={{ minWidth: "14.5%", width: "14.5%" }}
                    className="px-1 text-end"
                  >
                    <p></p>
                  </div>
                  <div
                    style={{ minWidth: "9%", width: "9%" }}
                    className="px-1 text-end"
                  >
                    <p>{NumberWithCommas(e?.Pcs, 0)}</p>
                  </div>
                  <div
                    style={{ minWidth: "15%", width: "15%" }}
                    className="px-1 text-end"
                  >
                    <p>{NumberWithCommas(e?.Wt, 3)} Gms</p>
                  </div>
                  <div
                    style={{ minWidth: "15%", width: "15%" }}
                    className="px-1 text-end"
                  >
                    <p>
                      {e?.isRateOnPcs === 0
                        ? e?.Wt !== 0 && (
                          <>
                            {NumberWithCommas(
                              e?.Amount /
                              e?.Wt /
                              headerData?.CurrencyExchRate,
                              2
                            )}{" "}
                            / Wt
                          </>
                        )
                        : e?.Pcs !== 0 && (
                          <>
                            {NumberWithCommas(
                              e?.Amount /
                              e?.Pcs /
                              headerData?.CurrencyExchRate,
                              2
                            )}{" "}
                            / Pcs
                          </>
                        )}
                    </p>
                  </div>
                  <div
                    style={{ minWidth: "15%", width: "15%" }}
                    className="px-1 text-end"
                  >
                    <p>
                      {NumberWithCommas(
                        e?.Amount / headerData?.CurrencyExchRate,
                        2
                      )}
                    </p>
                  </div>
                </div>
              );
            })} */}

            {(mainData?.misc2?.length > 0) && (
              <div className="d-flex">

                <div
                  style={{ minWidth: "17%", width: "17%" }}
                  className="px-1 text-uppercase"
                >
                  <p>OTHER MATERIAL</p>
                </div>

                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end">
                  <p></p>
                </div>

                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end">
                  <p></p>
                </div>

                <div style={{ minWidth: "9%", width: "9%" }} className="px-1 text-end">
                  <p>{NumberWithCommas(mergedMisc?.Pcs, 0)}</p>
                </div>

                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end">
                  <p>{NumberWithCommas(mergedMisc?.Wt, 3)} Gms</p>
                </div>

                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end">
                  <p>
                    {mergedMisc?.isRateOnPcs === 0
                      ? mergedMisc?.Wt !== 0 &&
                      `${NumberWithCommas(
                        mergedMisc?.Amount /
                        mergedMisc?.Wt /
                        headerData?.CurrencyExchRate,
                        2
                      )} / Wt`
                      : mergedMisc?.Pcs !== 0 &&
                      `${NumberWithCommas(
                        mergedMisc?.Amount /
                        mergedMisc?.Pcs /
                        headerData?.CurrencyExchRate,
                        2
                      )} / Pcs`}
                  </p>
                </div>

                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end">
                  <p>
                    {NumberWithCommas(
                      mergedMisc?.Amount / headerData?.CurrencyExchRate,
                      2
                    )}
                  </p>
                </div>

              </div>
            )}

            <div className="d-flex">
              <div
                style={{ minWidth: "17%", width: "17%" }}
                className="px-1 text-uppercase"
              >
                <p>{mainData?.labour?.label}</p>
              </div>
              <div
                style={{ minWidth: "14.5%", width: "14.5%" }}
                className="px-1 text-end"
              >
                <p></p>
              </div>
              <div
                style={{ minWidth: "14.5%", width: "14.5%" }}
                className="px-1 text-end"
              >
                <p></p>
              </div>
              <div
                style={{ minWidth: "9%", width: "9%" }}
                className="px-1 text-end"
              >
                <p></p>
              </div>
              <div
                style={{ minWidth: "15%", width: "15%" }}
                className="px-1 text-end"
              >
                <p></p>
              </div>
              <div
                style={{ minWidth: "15%", width: "15%" }}
                className="px-1 text-end"
              >
                <p>
                  {mainData?.labour?.primaryWt !== 0 &&
                    NumberWithCommas(
                      mainData?.labour?.makingAmount /
                      mainData?.labour?.primaryWt /
                      headerData?.CurrencyExchRate,
                      2
                    )}
                </p>
              </div>
              <div
                style={{ minWidth: "15%", width: "15%" }}
                className="px-1 text-end"
              >
                <p>
                  {NumberWithCommas(
                    mainData?.labour?.totalAmount /
                    headerData?.CurrencyExchRate,
                    2
                  )}
                </p>
              </div>
            </div>



            {mainData?.otherCharges?.map((e, i) => {
              return (
                <div className="d-flex" key={i}>
                  <div
                    style={{ minWidth: "17%", width: "17%" }}
                    className=" px-1 text-uppercase"
                  >
                    <p>{e?.label}</p>
                  </div>
                  <div
                    style={{ minWidth: "14.5%", width: "14.5%" }}
                    className=" px-1 text-end"
                  >
                    <p></p>
                  </div>
                  <div
                    style={{ minWidth: "14.5%", width: "14.5%" }}
                    className=" px-1 text-end"
                  >
                    <p></p>
                  </div>
                  <div
                    style={{ minWidth: "9%", width: "9%" }}
                    className=" px-1 text-end"
                  >
                    <p></p>
                  </div>
                  <div
                    style={{ minWidth: "15%", width: "15%" }}
                    className=" px-1 text-end"
                  >
                    <p></p>
                  </div>
                  <div
                    style={{ minWidth: "15%", width: "15%" }}
                    className=" px-1 text-end"
                  >
                    <p></p>
                  </div>
                  <div
                    style={{ minWidth: "15%", width: "15%" }}
                    className=" px-1 text-end"
                  >
                    <p>{NumberWithCommas(e?.value, 2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* total */}
        <div className={`d-flex border-start border-end border-bottom mb-1 no_break ${style?.font_15}`} >
          <div className="col-3 border-end d-flex align-items-center justify-content-center flex-column"></div>
          <div className="col-9">
            <div className="d-flex border-bottom">
              <div className="col-2 px-1">
                <p className={`${style?.min_height_21} fw-bold`}>Total</p>
              </div>
              <div className="col-2 px-1">
                <p className={`${style?.min_height_21} text-end`}></p>
              </div>
              <div className="col-2 px-1">
                <p className={`${style?.min_height_21} text-end`}></p>
              </div>
              <div className="col-1 px-1">
                <p className={`${style?.min_height_21} text-end`}></p>
              </div>

              <div className="col-1 px-1">
                <p className={`${style?.min_height_21} text-end`}></p>
              </div>
              <div className="col-2 px-1">
                <p className={`${style?.min_height_21} text-end`}></p>
              </div>
              <div className="col-2 px-1">
                <p className={`${style?.min_height_21} text-end fw-bold`}>
                  {NumberWithCommas(totalss?.total, 2)}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* taxes */}
        <div className={`d-flex border no_break ${style?.font_15}`}>
          <div className="col-8 border-end"></div>
          <div className="col-4 px-1">
            {totalss?.discount !== 0 && (
              <>
                <div className="d-flex justify-content-between">
                  <p>Discount</p>
                  <p>{NumberWithCommas(totalss?.discount, 2)}</p>
                </div>
              </>
            )}
            <div className="d-flex justify-content-between">
              <p className="fw-bold"> Total Amount </p>
              <p className="fw-bold">
                {" "}
                {NumberWithCommas((mainDatas?.mainTotal?.total_amount / headerData?.CurrencyExchRate) - headerData?.FreightCharges, 2)}
              </p>
              {/* <p className="fw-bold"> {NumberWithCommas(totalss?.total-totalss?.discount, 2)}</p> */}
            </div>
            {mainDatas?.allTaxes?.map((e, i) => {
              return (
                <div className="d-flex justify-content-between" key={i}>
                  <p>
                    {e?.name} @ {e?.per}
                  </p>
                  <p>{NumberWithCommas(+e?.amount, 2)}</p>
                </div>
              );
            })}
            {headerData?.AddLess !== 0 && (
              <div className="d-flex justify-content-between">
                <p>{headerData?.AddLess > 0 ? "Add" : "Less"}</p>
                <p>
                  {NumberWithCommas(
                    headerData?.AddLess / headerData?.CurrencyExchRate,
                    2
                  )}
                </p>
              </div>
            )}
            {/* {headerData?.FreightCharges !== 0 && (
              <div className="d-flex justify-content-between">
                <p>{headerData?.ModeOfDel} </p>
                <p>{NumberWithCommas(headerData?.FreightCharges, 2)}</p>
              </div>
            )} */}
          </div>
        </div>
        <div
          className={`d-flex border-start border-end border-bottom no_break ${style?.font_15}`}
        >
          <div className="col-8 border-end px-1">
            <p className="fw-bold"> IN Words Indian Rupees</p>
            <p className="fw-bold">
              {toWords.convert(
                +fixedValues(
                  mainDatas?.mainTotal?.total_amount /
                  headerData?.CurrencyExchRate +
                  mainDatas?.allTaxes?.reduce(
                    (acc, cObj) =>
                      acc + +cObj?.amount * headerData?.CurrencyExchRate,
                    0
                  ) +
                  headerData?.AddLess +
                  headerData?.FreightCharges,
                  2
                )
              )}{" "}
              Only.
              {/* {toWords?.convert(+fixedValues(totalss?.total-totalss?.discount + mainDatas?.allTaxes?.reduce((acc, cObj) => acc + (+(cObj?.amount)), 0) +
                headerData?.AddLess + headerData?.FreightCharges, 2))} Only. */}
            </p>
          </div>
          <div className="col-4 px-1 d-flex justify-content-between align-items-center">
            <p className="text-end fw-bold">Grand Total </p>
            <p className="text-end fw-bold">
              {NumberWithCommas(
                mainDatas?.mainTotal?.total_amount /
                headerData?.CurrencyExchRate +
                mainDatas?.allTaxes?.reduce(
                  (acc, cObj) => acc + +cObj?.amount,
                  0
                ) +
                headerData?.AddLess +
                headerData?.FreightCharges,
                2
              )}
            </p>
          </div>
        </div>
        <div
          className={`border-start border-end border-bottom p-1 no_break ${style?.Declaration}`}
          dangerouslySetInnerHTML={{ __html: headerData?.Declaration }}
        ></div>
        <p className="p-1 no_break">
          <span className="fw-bold"> REMARKS :</span> <span dangerouslySetInnerHTML={{ __html: headerData?.PrintRemark }}></span>
        </p>
        {/* {footer} */}
        <div
          className={`${footerStyle.container} no_break ${style?.font_15} ${style?.footer}`}
        >
          <div
            className={`${footerStyle.block1f3} ${style?.footers}`}
            style={{ width: "33.33%", borderRight: "1px solid #e8e8e8" }}
          >
            <div className={footerStyle.linesf3} style={{ fontWeight: "bold" }}>
              Bank Detail
            </div>
            <div className={footerStyle.linesf3}>
              Bank Name: {headerData?.bankname}
            </div>
            <div className={footerStyle.linesf3}>
              Branch: {headerData?.bankaddress}
            </div>
            <div className={footerStyle.linesf3}>
              Account Name: {headerData?.accountname}
            </div>
            <div className={footerStyle.linesf3}>
              Account No. : {headerData?.accountnumber}
            </div>
            <div className={footerStyle.linesf3}>
              RTGS/NEFT IFSC: {headerData?.rtgs_neft_ifsc}
            </div>
            <div className={footerStyle.linesf3}>Enquiry No. </div>
            <div className={footerStyle.linesf3}> (E & OE)</div>
          </div>
          <div
            className={`${footerStyle.block2f3} ${style?.footers}`}
            style={{ width: "33.33%", borderRight: "1px solid #e8e8e8" }}
          >
            <div className={`${footerStyle.linesf3} fw-normal`}>Signature</div>
            <div className={footerStyle.linesf3}>
              {headerData?.customerfirmname}
            </div>
          </div>
          <div
            className={`${footerStyle.block2f3} ${style?.footers}`}
            style={{ width: "33.33%" }}
          >
            <div className={`${footerStyle.linesf3} fw-normal`}>Signature</div>
            <div className={footerStyle.linesf3}>
              {headerData?.CompanyFullName}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
      {msg}
    </p>
  );
};

export default InvoicePrint8;
