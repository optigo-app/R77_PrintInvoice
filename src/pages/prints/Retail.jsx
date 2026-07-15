import React, { useEffect, useState } from "react";
import {
  CapitalizeWords,
  NumberWithCommas,
  apiCall,
  checkMsg,
  fixedValues,
  handleImageError,
  handlePrint,
  isObjectEmpty,
  taxGenrator,
} from "../../GlobalFunctions";
import "../../assets/css/prints/retail.css";
import Loader from "../../components/Loader";
import { ToWords } from "to-words";
import { cloneDeep, find, findIndex } from "lodash";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import NumToWord from "../../GlobalFunctions/NumToWord";

const Retail = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  const [jsonData1, setJsonData1] = useState({});
  const [dataFill, setDataFill] = useState([]);
  const [total, setTotal] = useState({});
  const [rate, setRate] = useState(true);
  const [loader, setLoader] = useState(true);
  const [msg, setMsg] = useState("");
  const [taxes, setTaxes] = useState([]);
  const [finalD, setFinalD] = useState({});
  const [misctotPcs, setMisctotPcs] = useState(null);
    const [gmwt, setGmwt] = useState(null);
    const [ctwwt, setCtwwt] = useState(null);
    const [totPcs, setTotPcs] = useState(0);
    const [totWt, setTotWt] = useState(0);

  const [resultArrayC, setResultArryC] = useState();
  let pName = atob(printName).toLowerCase();

  const getStyles = (retailPrint1, retailPrint, value) => {
    return pName === "retail1 print"
      ? value
        ? retailPrint1
        : `${retailPrint1}NoRate`
      : value
      ? retailPrint
      : `${retailPrint}NoRate`;
  };

  const [styles, setStyles] = useState({
    Material: getStyles("materialRetailPrint1", "materialRetailPrint", true),
    Qty: getStyles("qtyRetailPrint1", "qtyRetailPrint", true),
    Pcs: getStyles("pcsRetailPrint1", "pcsRetailPrint", true),
    Wt: getStyles("wtRetailPrint1", "wtRetailPrint", true),
    Amount: getStyles("", "amountRetailPrint", true),
  });

  const toWords = new ToWords();
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  const loadData = (data) => {
    let datas = OrganizeDataPrint(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );
    setResultArryC(datas);
    let resultArr = [];
    let makingSetting = 0;
    let otherChargesDiamondHandling = 0;
    let diasCsMiscPcs = 0;
    let totalObj = {
      pcs: 0,
      materialWeight: 0,
      rate: 0,
      amount: 0,
      making: 0,
      others: 0,
      totalAmount: 0,
      sgstAmount: 0,
      cgstAmount: 0,
      addLess: 0,
      grandTotal: 0,
      textInNumbers: "",
      goldWeight: 0,
    };
    datas?.resultArray?.forEach((e, i) => {
      let obj = cloneDeep(e);
      makingSetting +=
        (e?.totals?.diamonds?.SettingAmount +
          e?.totals?.colorstone?.SettingAmount +
          e?.MakingAmount) /
        data?.BillPrint_Json[0]?.CurrencyExchRate;
      otherChargesDiamondHandling +=
        (e?.OtherCharges + e?.TotalDiamondHandling) /
        data?.BillPrint_Json[0]?.CurrencyExchRate;
      let SettingAmount =
        obj?.totals?.diamonds?.SettingAmount +
        obj?.totals?.colorstone?.SettingAmount;
      let diamonds = [];
      obj?.diamonds?.forEach((ele, ind) => {
        let findDiamond = diamonds?.findIndex(
          (elem, index) => elem?.QualityName === ele?.QualityName
        );
        if (findDiamond === -1) {
          diamonds?.push(ele);
        } else {
          diamonds[findDiamond].Wt += ele?.Wt;
          diamonds[findDiamond].Pcs += ele?.Pcs;
          diamonds[findDiamond].Amount += ele?.Amount;
        }
      });
      let colorstone = [];
      obj?.colorstone?.forEach((ele, ind) => {
        let findColorStone = colorstone?.findIndex(
          (elem, index) => elem?.QualityName === ele?.QualityName
        );
        if (findColorStone === -1) {
          colorstone?.push(ele);
        } else {
          colorstone[findColorStone].Wt += ele?.Wt;
          colorstone[findColorStone].Pcs += ele?.Pcs;
          colorstone[findColorStone].Amount += ele?.Amount;
        }
      });
      let misc = [];
      obj?.misc?.forEach((ele, ind) => {
        totalObj.goldWeight += ele?.Wt + ele?.ServWt;
        let findmisc = misc?.findIndex(
          (elem, index) => elem?.ShapeName === ele?.ShapeName
        );
        if (findmisc === -1) {
          misc?.push(ele);
        } else {
          misc[findmisc].Wt += ele?.Wt;
          misc[findmisc].Pcs += ele?.Pcs;
          misc[findmisc].Amount += ele?.Amount;
          misc[findmisc].ServWt += ele?.ServWt;
        }
      });
      // let count = 0;
      let secondaryWt = 0;
      e?.metal?.forEach((ele, ind) => {
        if (ele?.IsPrimaryMetal !== 1) {
          secondaryWt += ele?.Wt;
        }
      });

      let netWtLossWt =
        e?.NetWt + e?.LossWt - secondaryWt + e?.totals?.diamonds?.Wt / 5;

      obj.netWtLossWt = netWtLossWt;
      totalObj.goldWeight += netWtLossWt;
      obj.diamonds = diamonds;
      obj.colorstone = colorstone;
      obj.misc = misc;
      obj.SettingAmount = SettingAmount;
      let findObjs = resultArr?.findIndex(
        (ele, ind) => ele?.GroupJob === e?.GroupJob && e?.GroupJob !== ""
      );
      diasCsMiscPcs +=
        obj?.diamonds?.reduce((acc, cObj) => acc + cObj?.Pcs, 0) +
        obj?.colorstone?.reduce((acc, cObj) => acc + cObj?.Pcs, 0) +
        obj?.misc?.reduce((acc, cObj) => acc + cObj?.Pcs, 0);
      if (findObjs === -1) {
        resultArr?.push(obj);
        obj?.diamonds?.sort((a, b) => {
          const compareLabel1 = a.QualityName.localeCompare(b.QualityName);
          if (compareLabel1 !== 0) {
            return compareLabel1;
          }

          const getNumber = (str) => parseInt(str.match(/\d+/) || 0);
          const numA = getNumber(a.Colorname);
          const numB = getNumber(b.Colorname);
          if (numA !== numB) {
            return numA - numB;
          }

          return 0;
        });
      } else {
        let primaryMetal = obj?.metal?.findIndex(
          (elem, index) => elem?.IsPrimaryMetal === 1
        );
        let primaryMetal2 = resultArr[findObjs]?.metal?.findIndex(
          (elem, index) => elem?.IsPrimaryMetal === 1
        );
        if (primaryMetal !== -1 && primaryMetal2 !== -1) {
          resultArr[findObjs].metal[primaryMetal2].Wt +=
            obj?.metal[primaryMetal]?.Wt;
          resultArr[findObjs].metal[primaryMetal2].Pcs +=
            obj?.metal[primaryMetal]?.Pcs;
          resultArr[findObjs].metal[primaryMetal2].Amount +=
            obj?.metal[primaryMetal]?.Amount;
        }
        if (resultArr[findObjs]?.GroupJob !== resultArr[findObjs]?.SrJobno) {
          resultArr[findObjs].DesignImage = obj?.DesignImage;
          resultArr[findObjs].designno = obj?.designno;
          resultArr[findObjs].SrJobno = resultArr[findObjs].GroupJob;
          resultArr[findObjs].HUID = obj?.HUID;
          if (primaryMetal !== -1 && primaryMetal2 !== -1) {
            resultArr[findObjs].metal[primaryMetal2].ShapeName =
              obj?.metal[primaryMetal]?.ShapeName;
            resultArr[findObjs].metal[primaryMetal2].Colorname =
              obj?.metal[primaryMetal]?.Colorname;
            resultArr[findObjs].metal[primaryMetal2].QualityName =
              obj?.metal[primaryMetal]?.QualityName;
            resultArr[findObjs].metal[primaryMetal2].SizeName =
              obj?.metal[primaryMetal]?.SizeName;
          }
          resultArr[findObjs].metal[0].QualityName = obj?.metal[0]?.QualityName;
        }

        resultArr[findObjs].Tunch =
          (resultArr[findObjs].Tunch + obj?.Tunch) / 2;
        resultArr[findObjs].grosswt += obj?.grosswt;
        resultArr[findObjs].NetWt += obj?.NetWt;
        resultArr[findObjs].LossWt += obj?.LossWt;
        resultArr[findObjs].netWtLossWt += obj?.netWtLossWt;
        resultArr[findObjs].TotalAmount += obj?.TotalAmount;
        resultArr[findObjs].UnitCost += obj?.UnitCost;
        resultArr[findObjs].OtherCharges += obj?.OtherCharges;
        resultArr[findObjs].TotalDiamondHandling += obj?.TotalDiamondHandling;
        resultArr[findObjs].totals.diamonds.SettingAmount +=
          obj?.totals?.diamonds?.SettingAmount;
        resultArr[findObjs].SettingAmount += obj?.SettingAmount;
        resultArr[findObjs].MakingAmount += obj?.MakingAmount;

        let allDiamonds = [
          ...resultArr[findObjs].diamonds,
          ...obj?.diamonds,
        ]?.flat();
        let blankDiamonds = [];
        allDiamonds?.forEach((ele, ind) => {
          let findDiamonds = blankDiamonds?.findIndex(
            (elem, index) => elem?.QualityName === ele?.QualityName
          );
          if (findDiamonds === -1) {
            blankDiamonds?.push(ele);
          } else {
            blankDiamonds[findDiamonds].Wt += ele?.Wt;
            blankDiamonds[findDiamonds].Pcs += ele?.Pcs;
            blankDiamonds[findDiamonds].Amount += ele?.Amount;
          }
        });

        let allColorStone = [
          ...resultArr[findObjs]?.colorstone,
          ...obj?.colorstone,
        ]?.flat();
        let blankcolorStones = [];
        allColorStone?.forEach((ele, ind) => {
          let findColorStoness = blankcolorStones?.findIndex(
            (elem, index) => elem?.ShapeName === ele?.ShapeName
          );
          if (findColorStoness === -1) {
            blankcolorStones?.push(ele);
          } else {
            blankcolorStones[findColorStoness].Wt += ele?.Wt;
            blankcolorStones[findColorStoness].Pcs += ele?.Pcs;
            blankcolorStones[findColorStoness].Amount += ele?.Amount;
          }
        });

        let allMiscs = [...resultArr[findObjs]?.misc, ...obj?.misc]?.flat();
        let blankMisc = [];
        allMiscs?.forEach((ele, ind) => {
          let findmiscss = blankMisc?.findIndex(
            (elem, index) => elem?.ShapeName === ele?.ShapeName
          );
          if (findmiscss === -1) {
            blankMisc?.push(ele);
          } else {
            blankMisc[findmiscss].Wt += ele?.Wt;
            blankMisc[findmiscss].Pcs += ele?.Pcs;
            blankMisc[findmiscss].Amount += ele?.Amount;
            blankMisc[findmiscss].ServWt += ele?.ServWt;
          }
        });
        blankDiamonds?.sort((a, b) => {
          const compareLabel1 = a.QualityName.localeCompare(b.QualityName);
          if (compareLabel1 !== 0) {
            return compareLabel1;
          }

          const getNumber = (str) => parseInt(str.match(/\d+/) || 0);
          const numA = getNumber(a.Colorname);
          const numB = getNumber(b.Colorname);
          if (numA !== numB) {
            return numA - numB;
          }

          return 0;
        });
        resultArr[findObjs].diamonds = blankDiamonds;
        resultArr[findObjs].colorstone = blankcolorStones;
        resultArr[findObjs].misc = blankMisc;
      }
    });

    resultArr?.sort((a, b) => {
      var regex = /(\d+)|(\D+)/g;
      var partsA = a.designno.match(regex);
      var partsB = b.designno.match(regex);

      // Compare each part of the labels
      for (var i = 0; i < Math.min(partsA.length, partsB.length); i++) {
        var partA = partsA[i];
        var partB = partsB[i];

        // If both parts are numbers, compare numerically
        if (!isNaN(partA) && !isNaN(partB)) {
          var numA = parseInt(partA);
          var numB = parseInt(partB);
          if (numA !== numB) {
            return numA - numB;
          }
        } else {
          // Otherwise, compare as strings
          if (partA !== partB) {
            return partA.localeCompare(partB);
          }
        }
      }

      // If all parts are equal, sort based on label length
      return a.designno.length - b.designno.length;
    });
    datas.mainTotal.makingSetting = makingSetting;
    datas.mainTotal.otherChargesDiamondHandling = otherChargesDiamondHandling;
    datas.mainTotal.diasCsMiscPcs = diasCsMiscPcs;

    setDataFill(resultArr);
    setFinalD(datas);
    setJsonData1(data?.BillPrint_Json[0]);

    let taxValue = taxGenrator(data?.BillPrint_Json[0], totalObj.totalAmount);
    setTaxes(taxValue);
    totalObj.materialWeight =
      datas?.mainTotal?.diamonds?.Wt + datas?.mainTotal?.colorstone?.Wt;
    taxValue.forEach((e, i) => {
      totalObj.grandTotal += +(
        e?.amount / data?.BillPrint_Json[0]?.CurrencyExchRate
      )?.toFixed(2);
    });
    totalObj.grandTotal +=
      totalObj.totalAmount / data?.BillPrint_Json[0]?.CurrencyExchRate +
      totalObj.addLess / data?.BillPrint_Json[0]?.CurrencyExchRate;
    totalObj.totalAmount = totalObj.totalAmount.toFixed(2);
    setTotal(totalObj);

    let totmiscwt = 0;
    let gmwt = 0;
    let ctwwt = 0;
    datas?.resultArray?.forEach((e) => {
      console.log('datas: ', datas);
        e?.misc?.forEach((el) => {
            totmiscwt += el?.Wt;
            gmwt += el?.Wt;
        })
        e?.finding?.forEach((el) => {
            gmwt += el?.Wt;
        })
        e?.metal?.forEach((el) => {
            gmwt += el?.Wt;
        })
        e?.diamonds?.forEach((el) => {
            ctwwt += el?.dwt;
        })
        e?.colorstone?.forEach((el) => {
            ctwwt += el?.cswt;
        })
    })
    setCtwwt(ctwwt)
    setGmwt(gmwt)
    setMisctotPcs(totmiscwt)

    let tot_pcs2 = 0;
    let tot_wt2 = 0;
    datas?.resultArray?.forEach((e) => {
            e?.diamonds?.forEach((el) => {
                tot_pcs2 += el?.dpcs;
                tot_wt2 += el?.dwt;
            })
           
    })
    datas?.resultArray?.forEach((e) => {
            e?.colorstone?.forEach((el) => {
                tot_pcs2 += el?.cspcs;
                tot_wt2 += el?.cswt;
            })
           
    })
    setTotPcs(tot_pcs2)
    setTotWt(tot_wt2)
  };

  const handleChange = (e) => {
    rate ? setRate(false) : setRate(true);
    let value = rate ? false : true;
    setStyles({
      ...styles,
      Material: getStyles("materialRetailPrint1", "materialRetailPrint", value),
      Qty: getStyles("qtyRetailPrint1", "qtyRetailPrint", value),
      Pcs: getStyles("pcsRetailPrint1", "pcsRetailPrint", value),
      Wt: getStyles("wtRetailPrint1", "wtRetailPrint", value),
      Amount: getStyles("", "amountRetailPrint", value),
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

  // console.log("jsonData1", jsonData1);
  // console.log("resultArrayC", resultArrayC);
  // console.log("total", total);
  console.log("finalD", finalD);
  // console.log("taxes", taxes);

  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <div className="container containerRetailPrint mt-5 pad_60_allPrint">
          {/* print button */}
          <div className="d-flex w-100 justify-content-end align-items-baseline print_sec_sum4 no_break position-relative">
            <div className="form-check pe-3 mb-0">
              <input
                className="form-check-input border-dark"
                type="checkbox"
                id="withrate"
                checked={rate}
                onChange={(e) => handleChange(e)}
              />
              <label
                className="form-check-label h6 mb-0 ratePara pt-1"
                htmlFor="withrate"
              >
                With Rate
              </label>
            </div>
            <div className="printBtn_sec text-end position-absolute printBtnRetailPrint">
              <input
                type="button"
                className="btn_white blue me-0"
                value="Print"
                onClick={(e) => handlePrint(e)}
              />
            </div>
          </div>

          {/* headline retail print */}
          <div className="px-1 no_break">
            <div className="headlinepRetailPrint w-100 mt-4 px-2 fw-bold">
              {jsonData1?.PrintHeadLabel}
            </div>
          </div>

          {/* company address */}
          <div className="mt-2 px-1 d-flex no_break">
            <div className="col-6">
              <h6 className="fw-bold">{jsonData1?.CompanyFullName}</h6>
              <p className="ft_12_retailPrint">{jsonData1?.CompanyAddress}</p>
              <p className="ft_12_retailPrint">{jsonData1?.CompanyAddress2}</p>
              <p className="ft_12_retailPrint">
                {jsonData1?.CompanyCity} {jsonData1?.CompanyPinCode}{" "}
                {jsonData1?.CompanyState} {jsonData1?.CompanyCountry}
              </p>
              <p className="ft_12_retailPrint">
                T {jsonData1?.CompanyTellNo} | TOLL FREE{" "}
                {jsonData1?.CompanyTollFreeNo}
              </p>
              <p className="ft_12_retailPrint">
                {jsonData1?.CompanyEmail} | {jsonData1?.CompanyWebsite}
              </p>
              <p className="ft_12_retailPrint">
                {jsonData1?.Company_VAT_GST_No} | {jsonData1?.Company_CST_STATE}{" "}
                - {jsonData1?.Company_CST_STATE_No} | PAN-{jsonData1?.Pannumber}
              </p>
            </div>
            <div className="col-6">
              {/* <img src={jsonData1?.PrintLogo} alt="" className='retailPrintLogo d-block ms-auto' /> */}

              {isImageWorking && jsonData1?.PrintLogo !== "" && (
                <img
                  src={jsonData1?.PrintLogo}
                  alt=""
                  className="retailPrintLogo d-block ms-auto"
                  onError={handleImageErrors}
                  height={120}
                  width={150}
                />
              )}
            </div>
          </div>

          {/* bill to */}
          <div className="d-flex border mt-2 no_break">
            <div className="col-4 p-1 border-end">
              <p className="line_height_110 ft_12_retailPrint">
                {jsonData1?.lblBillTo}{" "}
              </p>
              <p className="fw-bold line_height_110">
                {jsonData1?.customerfirmname}
              </p>
              <p className="line_height_110 ft_12_retailPrint">
                {jsonData1?.customerAddress1}
              </p>
              <p className="line_height_110 ft_12_retailPrint">
                {jsonData1?.customerAddress2}
              </p>
              <p className="line_height_110 ft_12_retailPrint">
                {jsonData1?.customercity}
                {jsonData1?.customerpincode}
              </p>
              <p className="line_height_110 ft_12_retailPrint">
                {jsonData1?.customeremail1}
              </p>
              <p className="line_height_110 ft_12_retailPrint">
                {jsonData1?.vat_cst_pan}
              </p>
              <p className="line_height_110 ft_12_retailPrint">
                {jsonData1?.Cust_CST_STATE}-{jsonData1?.Cust_CST_STATE_No}
              </p>
            </div>
            <div className="col-4 p-1 border-end">
              <p className="line_height_110 ft_12_retailPrint">Ship To, </p>
              <p className="fw-bold">{jsonData1?.customerfirmname}</p>
              <p className="line_height_110 ft_12_retailPrint">
                {jsonData1?.CustName}
              </p>

              {/* <p className=''>{jsonData1?.customerAddress2}</p> */}
              <p className="line_height_110 ft_12_retailPrint">
                {jsonData1?.customercity}, {jsonData1?.State}
              </p>
              <p className="line_height_110 ft_12_retailPrint">
                {jsonData1?.CompanyCountry}
                {jsonData1?.customerpincode}
              </p>
              <p className="line_height_110 ft_12_retailPrint">
                Mobile No. : {jsonData1?.customermobileno1}
              </p>
            </div>
            <div
              className="col-4 p-1 position-relative"
              style={{ minHeight: "90px" }}
            >
              <div className="d-flex">
                <div className="col-3">
                  <p className="fw-bold ft_12_retailPrint">BILL NO</p>
                  <p className="fw-bold ft_12_retailPrint">DATE</p>
                  <p className="fw-bold ft_12_retailPrint">HSN</p>
                </div>
                <div className="col-9">
                  <p className="ft_12_retailPrint">{jsonData1?.InvoiceNo}</p>
                  <p className="ft_12_retailPrint">{jsonData1?.EntryDate}</p>
                  <p className="ft_12_retailPrint">{jsonData1?.HSN_No}</p>
                </div>
              </div>
              <div className="mt-5 position-absolute bottom-0 pb-1 ratePara">
                {rate &&
                  jsonData1?.MetalRate24K &&
                  (jsonData1?.MetalRate24K).toFixed(2)}
              </div>
            </div>
          </div>

          {/* table */}
          <div className="d-flex mt-1 border no_break ft_12_retailPrint">
            <div className="srNoRetailPrint border-end d-flex justify-content-center align-items-center">
              <p className="fw-bold">Sr#</p>
            </div>
            <div className="poductDiscriptionRetailPrint border-end d-flex justify-content-center align-items-center">
              <p className="fw-bold">Product Description</p>
            </div>
            <div className="materialDescriptionRetailPrint border-end">
              <div className="border-bottom p-1 d-flex justify-content-center align-items-center">
                <p className="fw-bold">Material Description</p>
              </div>
              <div className="d-flex">
                <div
                  className={`${styles.Material} border-end d-flex justify-content-center align-items-center`}
                >
                  <p className="fw-bold">Material</p>
                </div>
                <div
                  className={`${styles.Qty} border-end d-flex justify-content-center align-items-center`}
                >
                  <p className="fw-bold">Qty</p>
                </div>
                <div
                  className={`${styles.Pcs} border-end d-flex justify-content-center align-items-center`}
                >
                  <p className="fw-bold">Pcs</p>
                </div>
                <div
                  className={`${styles.Wt} lossWtRetailPrintNoRate border-end d-flex justify-content-center align-items-center`}
                >
                  <p className="fw-bold">Wt.</p>
                </div>
                {rate && (
                  <div
                    className={`${
                      pName === "retail1 print"
                        ? `rateRetailPrint1`
                        : `rateRetailPrint border-end`
                    } d-flex justify-content-center align-items-center`}
                  >
                    <p className="fw-bold">Rate</p>
                  </div>
                )}
                {pName !== "retail1 print" && (
                  <div
                    className={`${styles.Amount} d-flex justify-content-center align-items-center`}
                  >
                    <p className="fw-bold">Amount</p>
                  </div>
                )}
              </div>
            </div>
            <div className="makingRetailPrint border-end d-flex justify-content-center align-items-center">
              <p className="fw-bold">Making</p>
            </div>
            <div className="othersRetailPrint border-end d-flex justify-content-center align-items-center">
              <p className="fw-bold">Others</p>
            </div>
            <div className="totalRetailPrint d-flex justify-content-center align-items-center">
              <p className="fw-bold">Total</p>
            </div>
          </div>

          {/* data */}
          {dataFill.map((e, i) => {
            return (
              <>
                {" "}
                <div
                  className="d-flex border-start border-end no_break ft_12_retailPrint"
                  key={i}
                >
                  <div className="srNoRetailPrint border-end p-1 d-flex justify-content-center align-items-center border-bottom ">
                    <p className="fw-bold">{NumberWithCommas(i + 1, 0)}</p>
                  </div>
                  <div className="poductDiscriptionRetailPrint border-end p-1 border-bottom ">
                    <p style={{ wordBreak: "normal" }}>
                      {e?.SubCategoryname} {e?.Categoryname}{" "}
                    </p>
                    <p>
                      {e?.designno} | {e?.SrJobno}
                    </p>
                    <img
                      src={e?.DesignImage}
                      alt=""
                      className="w-100 product_image_retailPrint"
                      onError={handleImageError}
                    />
                    <p className="text-center fw-bold pt-1 ft_13_retailPrint">
                      Tunch: {NumberWithCommas(e?.Tunch, 3)}
                    </p>
                    {e?.HUID !== "" && (
                      <p className="text-center pt-1">HUID- {e?.HUID}</p>
                    )}
                    <p className="text-center fw-bold pt-1">
                      {fixedValues(e?.grosswt, 3)}gm{" "}
                      <span className="fw-normal">Gross</span>
                    </p>
                  </div>
                  <div className="materialDescriptionRetailPrint border-end">
                    <div className="d-grid h-100">
                      {e?.metal?.map((ele, ind) => {
                        return (
                          ele?.IsPrimaryMetal === 1 && (
                            <div className={`d-flex border-bottom`} key={ind}>
                              <div
                                className={`${styles.Material} border-end p-1 d-flex align-items-center`}
                              >
                                <p>{ele?.ShapeName}</p>
                              </div>
                              <div
                                className={`${styles.Qty} border-end p-1 d-flex align-items-center`}
                              >
                                <p>{ele?.QualityName}</p>
                              </div>
                              <div
                                className={`${styles.Pcs} border-end p-1 d-flex align-items-center justify-content-end`}
                              >
                                <p className="text-end"></p>
                              </div>
                              <div
                                className={`${styles.Wt} lossWtRetailPrintNoRate border-end p-1 d-flex align-items-center justify-content-end`}
                              >
                                {/* <p className='text-end'>{NumberWithCommas(e?.netWtLossWt, 3)}</p> */}
                                <p className="text-end">
                                  {NumberWithCommas(e?.NetWt, 3)}
                                </p>
                              </div>
                              {rate && (
                                <div
                                  className={`${
                                    pName === "retail1 print"
                                      ? `rateRetailPrint1`
                                      : `rateRetailPrint border-end`
                                  } p-1 d-flex align-items-center justify-content-end`}
                                >
                                  <p className="text-end">
                                    {e?.netWtLossWt !== 0
                                      ? NumberWithCommas(
                                          ele?.Amount /
                                            jsonData1?.CurrencyExchRate /
                                            ele?.Wt /
                                            jsonData1?.CurrencyExchRate,
                                          2
                                        )
                                      : "0.00"}
                                  </p>
                                </div>
                              )}
                              {pName !== "retail1 print" && (
                                <div
                                  className={`${styles.Amount} p-1 d-flex align-items-center justify-content-end`}
                                >
                                  <p className="text-end">
                                    {NumberWithCommas(
                                      ele?.Amount / jsonData1?.CurrencyExchRate,
                                      2
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        );
                      })}
                      {e?.diamonds?.map((ele, ind) => {
                        return (
                          <div className={`d-flex border-bottom`} key={ind}>
                            <div
                              className={`${styles.Material} border-end p-1 d-flex align-items-center`}
                            >
                              <p>
                                {ele?.MasterManagement_DiamondStoneTypeName}
                              </p>
                            </div>
                            <div
                              className={`${styles.Qty} border-end p-1 d-flex align-items-center`}
                            >
                              <p>{ele?.QualityName}</p>
                            </div>
                            <div
                              className={`${styles.Pcs} border-end p-1 d-flex align-items-center justify-content-end`}
                            >
                              <p className="text-end">
                                {NumberWithCommas(ele?.Pcs, 0)}
                              </p>
                            </div>
                            <div
                              className={`${styles.Wt} lossWtRetailPrintNoRate border-end p-1 d-flex align-items-center justify-content-end`}
                            >
                              <p className="text-end">
                                {NumberWithCommas(ele?.Wt, 3)}
                              </p>
                            </div>
                            {rate && (
                              <div
                                className={`${
                                  pName === "retail1 print"
                                    ? `rateRetailPrint1`
                                    : `rateRetailPrint border-end`
                                } p-1 d-flex align-items-center justify-content-end`}
                              >
                                <p className="text-end">
                                  {ele?.Wt !== 0
                                    ? NumberWithCommas(
                                        ele?.Amount /
                                          jsonData1?.CurrencyExchRate /
                                          ele?.Wt,
                                        2
                                      )
                                    : "0.00"}
                                </p>
                              </div>
                            )}
                            {pName !== "retail1 print" && (
                              <div
                                className={`${styles.Amount} p-1 d-flex align-items-center justify-content-end`}
                              >
                                <p className="text-end">
                                  {NumberWithCommas(
                                    ele?.Amount / jsonData1?.CurrencyExchRate,
                                    2
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {e?.colorstone?.map((ele, ind) => {
                        return (
                          <div className={`d-flex border-bottom`} key={ind}>
                            <div
                              className={`${styles.Material} border-end p-1 d-flex align-items-center`}
                            >
                              <p>
                                {ele?.MasterManagement_DiamondStoneTypeName}
                              </p>
                            </div>
                            <div
                              className={`${styles.Qty} border-end p-1 d-flex align-items-center`}
                            >
                              <p>{ele?.QualityName}</p>
                            </div>
                            <div
                              className={`${styles.Pcs} border-end p-1 d-flex align-items-center justify-content-end`}
                            >
                              <p className="text-end">
                                {NumberWithCommas(ele?.Pcs, 0)}
                              </p>
                            </div>
                            <div
                              className={`${styles.Wt} lossWtRetailPrintNoRate border-end p-1 d-flex align-items-center justify-content-end`}
                            >
                              <p className="text-end">
                                {NumberWithCommas(ele?.Wt, 3)}
                              </p>
                            </div>
                            {rate && (
                              <div
                                className={`${
                                  pName === "retail1 print"
                                    ? `rateRetailPrint1`
                                    : `rateRetailPrint border-end`
                                } p-1 d-flex align-items-center justify-content-end`}
                              >
                                <p className="text-end">
                                  {ele?.Wt !== 0
                                    ? NumberWithCommas(
                                        ele?.Amount /
                                          jsonData1?.CurrencyExchRate /
                                          ele?.Wt,
                                        2
                                      )
                                    : "0.00"}
                                </p>
                              </div>
                            )}
                            {pName !== "retail1 print" && (
                              <div
                                className={`${styles.Amount} p-1 d-flex align-items-center justify-content-end`}
                              >
                                <p className="text-end">
                                  {NumberWithCommas(
                                    ele?.Amount / jsonData1?.CurrencyExchRate,
                                    2
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {e?.misc?.map((ele, ind) => {
                        return (
                          <div className={`d-flex border-bottom`} key={ind}>
                            <div
                              className={`${styles.Material} border-end p-1 d-flex align-items-center`}
                            >
                              <p>
                                {ele?.MasterManagement_DiamondStoneTypeName}
                              </p>
                            </div>
                            <div
                              className={`${styles.Qty} border-end p-1 d-flex align-items-center`}
                            >
                              <p>{ele?.ShapeName}</p>
                            </div>
                            <div
                              className={`${styles.Pcs} border-end p-1 d-flex align-items-center justify-content-end`}
                            >
                              <p className="text-end">
                                {NumberWithCommas(ele?.Pcs, 0)}
                              </p>
                            </div>
                            <div
                              className={`${styles.Wt} lossWtRetailPrintNoRate border-end p-1 d-flex align-items-center justify-content-end`}
                            >
                              <p className="text-end">
                                {NumberWithCommas(ele?.Wt + ele?.ServWt, 3)}
                              </p>
                            </div>
                            {rate && (
                              <div
                                className={`${
                                  pName === "retail1 print"
                                    ? `rateRetailPrint1`
                                    : `rateRetailPrint border-end`
                                } p-1 d-flex align-items-center justify-content-end`}
                              >
                                {/* <p className='text-end'>{(ele?.IsHSCODE === 0 ? (ele?.Wt !== 0 ? NumberWithCommas((ele?.Amount / ele?.Wt), 2) : "0.00") : (ele?.ServWt !== 0 ? NumberWithCommas((ele?.Amount / ele?.ServWt), 2) : "0.00"))}</p> */}
                                <p className="text-end">
                                  {ele?.Wt !== 0 &&
                                    NumberWithCommas(
                                      ele?.Amount /
                                        jsonData1?.CurrencyExchRate /
                                        ele?.Wt,
                                      2
                                    )}
                                </p>
                              </div>
                            )}
                            {pName !== "retail1 print" && (
                              <div
                                className={`${styles.Amount} p-1 d-flex align-items-center justify-content-end`}
                              >
                                <p className="text-end">
                                  {NumberWithCommas(
                                    ele?.Amount / jsonData1?.CurrencyExchRate,
                                    2
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div
                    className={`makingRetailPrint border-end border-bottom  p-1 d-flex ${
                      pName === "retail print 1"
                        ? `flex-column align-items-end justify-content-center`
                        : `align-items-center justify-content-end `
                    }`}
                  >
                    {pName === "retail print 1" && (
                      <p className="text-end">
                        <span className="fw-bold">R: </span>
                        {NumberWithCommas(e?.MaKingCharge_Unit, 2)}
                      </p>
                    )}
                    <p className="text-end">
                      {NumberWithCommas(
                        (e?.MakingAmount + e?.SettingAmount) /
                          jsonData1?.CurrencyExchRate,
                        2
                      )}
                    </p>
                  </div>
                  <div className="othersRetailPrint border-end p-1 border-bottom  d-flex align-items-center justify-content-end">
                    <p className="text-end">
                      {NumberWithCommas(
                        (e?.OtherCharges + e?.TotalDiamondHandling) /
                          jsonData1?.CurrencyExchRate,
                        2
                      )}
                    </p>
                  </div>
                  <div className="totalRetailPrint border-bottom p-1 d-flex align-items-center justify-content-end">
                    <p className="text-end">
                      {NumberWithCommas(
                        e?.TotalAmount / jsonData1?.CurrencyExchRate,
                        2
                      )}
                    </p>
                  </div>
                </div>
              </>
            );
          })}

          {/* total */}
          <div className="d-flex border-bottom border-start border-end no_break">
            <div className="srNoRetailPrint border-end p-1 d-flex justify-content-center align-items-center"></div>
            <div className="poductDiscriptionRetailPrint border-end p-1 d-flex align-items-center">
              <p className="fw-bold ft_17_retailPrint">TOTAL</p>
            </div>
            <div className="materialDescriptionRetailPrint border-end">
              <div className="d-flex">
                <div
                  className={`${styles.Material} border-end p-1 min_height_44_retail_print_1 ft_12_retailPrint`}
                >
                  <p className="fw-bold"></p>
                </div>
                <div
                  className={`${styles.Qty} border-end p-1 min_height_44_retail_print_1 ft_12_retailPrint`}
                >
                  <p className="fw-bold"></p>
                </div>
                <div
                  className={`${styles.Pcs} border-end p-1 text-end d-flex align-items-center justify-content-end min_height_44_retail_print_1 ft_12_retailPrint`}
                >
                  <p className="fw-bold text-end">
                    {NumberWithCommas(finalD?.mainTotal?.diasCsMiscPcs, 0)}
                  </p>
                </div>
                <div
                  className={`${styles.Wt} lossWtRetailPrintNoRate border-end p-1 d-flex align-items-end justify-content-around flex-column min_height_44_retail_print_1 ft_12_retailPrint`}
                ><p className="fw-bold text-end">
                    {totWt !== 0 && `${totWt?.toFixed(3)} ctw`} <br /> {gmwt !== 0 && `${gmwt?.toFixed(3)} gms`}  
                </p>
                  {/* <p className="fw-bold lh-1 text-end fs_maintotal_wt_rp">
                    D + C : {fixedValues(total?.materialWeight, 3)} Ctw
                  </p>
                  {/* <p className='fw-bold lh-1 text-end'>{fixedValues(total?.goldWeight - (finalD?.mainTotal?.diamonds?.Wt / 5), 3)} gm</p> 
                  <p className="fw-bold lh-1 text-end fs_maintotal_wt_rp">
                    Metal :{" "}
                    {fixedValues(
                      finalD?.mainTotal?.metal?.Wt - finalD?.mainTotal?.lossWt,
                      3
                    )}{" "}
                    gm
                  </p>
                  <p className="fw-bold lh-1 text-end fs_maintotal_wt_rp">
                    Misc :{" "}
                    {resultArrayC?.mainTotal?.misc?.onlyIsHSCODE0_Wt?.toFixed(
                      3
                    )}{" "}
                    gm
                  </p> */}
                </div>
                {rate && (
                  <div
                    className={`${
                      pName === "retail1 print"
                        ? `rateRetailPrint1`
                        : `rateRetailPrint border-end`
                    } p-1 d-flex align-items-center justify-content-end min_height_44_retail_print_1 ft_12_retailPrint`}
                  >
                    <p className="fw-bold text-end">
                      {/* {NumberWithCommas(total?.rate, 2)} */}
                    </p>
                  </div>
                )}
                {pName !== "retail1 print" && (
                  <div
                    className={`${styles.Amount} p-1 d-flex align-items-center justify-content-end min_height_44_retail_print_1 ft_12_retailPrint`}
                  >
                    <p className="fw-bold text-end">
                      {/* {NumberWithCommas(total?.amount, 2)} */}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="makingRetailPrint border-end p-1 d-flex align-items-center justify-content-end ft_12_retailPrint">
              <p className="fw-bold text-end">
                {NumberWithCommas(finalD?.mainTotal?.makingSetting, 2)}
              </p>
            </div>
            <div className="othersRetailPrint border-end p-1 d-flex align-items-center justify-content-end ft_12_retailPrint">
              <p className="fw-bold text-end">
                {NumberWithCommas(
                  finalD?.mainTotal?.otherChargesDiamondHandling,
                  2
                )}
              </p>
            </div>
            <div className="totalRetailPrint p-1 d-flex align-items-center justify-content-end ft_12_retailPrint">
              <p className="fw-bold text-end">
                {NumberWithCommas(
                  finalD?.mainTotal?.total_amount / jsonData1?.CurrencyExchRate,
                  2
                )}
              </p>
            </div>
          </div>

          {/* grand total */}
          <div className="d-flex border-start border-end border-bottom no_break">
            {/* <div className="totalInWordsRetailPrint p-1 d-flex flex-column align-items-start justify-content-end p-1 border-end"> */}
            <div className="col-8 p-1 d-flex flex-column align-items-start justify-content-end p-1 border-end">
              <p className="ft_12_retailPrint">
                In Words {jsonData1?.Currencyname}
              </p>
              <p className="fw-bold ft_12_retailPrint">
                {/* {toWords?.convert(+fixedValues((finalD?.mainTotal?.total_amount / jsonData1?.CurrencyExchRate) +
                            taxes?.reduce((acc, cObj) => acc + (+fixedValues(+cObj?.amount / jsonData1?.CurrencyExchRate, 2)), 0) + (jsonData1?.AddLess / jsonData1?.CurrencyExchRate), 2))}  */}
                {NumToWord(
                  +fixedValues(
                    finalD?.mainTotal?.total_amount /
                      jsonData1?.CurrencyExchRate +
                      taxes?.reduce(
                        (acc, cObj) =>
                          acc +
                          +fixedValues(
                            +cObj?.amount / jsonData1?.CurrencyExchRate,
                            2
                          ),
                        0
                      ) +
                      jsonData1?.AddLess / jsonData1?.CurrencyExchRate,
                    2
                  )
                )}{" "}
              </p>
            </div>
            {/* <div className="cgstRetailPrint p-1 text-end p-1 border-end"> */}
            <div className="col-2 py-1 text-end border-end ft_12_retailPrint">
              {finalD?.allTaxes.length > 0 &&
                finalD?.allTaxes.map((e, i) => {
                  return (
                    <p key={i} className="pb-1 px-1">
                      {e?.name} @ {e?.per}
                    </p>
                  );
                })}
              {jsonData1?.AddLess !== 0 && (
                <p className="ft_12_retailPrint px-1">
                  {jsonData1?.AddLess > 0 ? "Add" : "Less"}
                </p>
              )}
              <p className="fw-bold py-1 border-top ft_12_retailPrint px-1">
                GRAND TOTAL
              </p>
            </div>
            {/* <div className="totalRetailPrint p-1 text-end p-1"> */}
            <div className="col-2  py-1 text-end ft_12_retailPrint">
              {finalD?.allTaxes.length > 0 &&
                finalD?.allTaxes.map((e, i) => {
                  return (
                    <div key={i} className="pb-1 px-1">
                      {NumberWithCommas(
                        +e?.amount / jsonData1?.CurrencyExchRate,
                        2
                      )}
                    </div>
                  );
                })}
              {jsonData1?.AddLess !== 0 && (
                <p className="ft_12_retailPrint px-1">
                  {NumberWithCommas(
                    jsonData1?.AddLess / jsonData1?.CurrencyExchRate,
                    2
                  )}
                </p>
              )}
              <div className="fw-bold py-1 border-top ft_12_retailPrint px-1">
                <span
                  dangerouslySetInnerHTML={{
                    __html: jsonData1?.Currencysymbol,
                  }}
                />
                &nbsp;
                {NumberWithCommas(
                  finalD?.mainTotal?.total_amount /
                    jsonData1?.CurrencyExchRate +
                    finalD?.allTaxes?.reduce(
                      (acc, cObj) =>
                        acc +
                        +fixedValues(
                          +cObj?.amount / jsonData1?.CurrencyExchRate,
                          2
                        ),
                      0
                    ) +
                    jsonData1?.AddLess / jsonData1?.CurrencyExchRate,
                  2
                )}
              </div>
            </div>
          </div>
          {/* note */}
          <div className="note border-start border-end border-bottom p-1 pb-3 no_break">
            <div
              dangerouslySetInnerHTML={{ __html: jsonData1?.Declaration }}
              className="pt-2"
            ></div>
          </div>
          <div className="note border-start border-end border-bottom p-1 no_break">
            <p>
              <span className="fw-bold">REMARKS : </span>
              <span
                dangerouslySetInnerHTML={{ __html: jsonData1?.PrintRemark }}
              ></span>
            </p>
          </div>
          {/* bank detail */}
          <div className="word_break_normal_retail_print d-flex border-start border-end border-bottom no_break ft_12_retailPrint">
            <div className="col-4 p-2 border-end">
              <p className="fw-bold">Bank Detail</p>
              <p>Bank Name: {jsonData1?.bankname}</p>
              <p>Branch: {jsonData1?.bankaddress}</p>
              <p>
                {jsonData1?.customercity1}-{jsonData1?.PinCode}
              </p>
              <p>Account Name: {jsonData1?.accountname}</p>
              <p>Account No. : {jsonData1?.accountnumber}</p>
              <p>RTGS/NEFT IFSC: {jsonData1?.rtgs_neft_ifsc}</p>
            </div>
            <div className="col-4 border-end d-flex flex-column justify-content-between p-2">
              <p>Signature</p>
              <p className="fw-bold">{jsonData1?.customerfirmname}</p>
            </div>
            <div className="col-4 d-flex flex-column justify-content-between p-2">
              <p>Signature</p>
              <p className="fw-bold">{jsonData1?.CompanyFullName}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
          {msg}
        </p>
      )}
    </>
  );
};

export default Retail;
