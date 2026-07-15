// http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=SlMvMTYyLzIwLTI1&evn=c2FsZQ==&pnm=UGFja2luZyBMaXN0IDE=&up=aHR0cDovL3plbi9qby9hcGktbGliL0FwcC9TYWxlQmlsbF9Kc29u&ctv=NzE=&ifid=PackingList1&pid=undefined

import React, { useEffect, useState } from "react";
import "../../assets/css/prints/miscPrint1.css";
import {
  apiCall,
  checkMsg,
  fixedValues,
  handleImageError,
  handlePrint,
  isObjectEmpty,
  NumberWithCommas,
  otherAmountDetail,
  taxGenrator,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import style from "../../assets/css/prints/packingList1S.module.css";

const PackingList1S = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  const [loader, setLoader] = useState(true);
  const [msg, setMsg] = useState("");
  const [json0Data, setJson0Data] = useState({});
  const [data, setData] = useState([]);
  const [total, setTotal] = useState({
    diamondTotal: {
      Wt: 0,
      Pcs: 0,
      Amount: 0,
    },
    metalTotal: {
      grossWt: 0,
      Pcs: 0,
      Amount: 0,
      NetWt: 0,
    },
    colorStone: {
      Wt: 0,
      Pcs: 0,
      Amount: 0,
    },
    Misc: {
      Wt: 0,
      Pcs: 0,
      Amount: 0,
    },
    otherAmount: 0,
    MakingAmount: 0,
    DiscountAmt: 0,
    TotalAmount: 0,
    amountAfterDiscount: 0,
    netWtLoss: 0,
    metalAmount: 0,
    clrStoneSettignAmount: 0,
    DiaSettignAmount: 0,
  });
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  const [taxes, setTaxes] = useState([]);

  const [diaQlty, setDiaQlty] = useState(false);
  const checkDiaQlty = () => {
    if (diaQlty) {
      setDiaQlty(false);
    } else {
      setDiaQlty(true);
    }
  };

  const [misc, setMisc] = useState(true);
  const checkMisc = () => {
    setMisc(prevState => !prevState);
  };

  const loadData = (data) => {

    let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    data.BillPrint_Json[0].address = address;

    let exchangerate = data?.BillPrint_Json[0]?.CurrencyExchRate;
    setJson0Data(data?.BillPrint_Json[0]);
    let newArr = [];
    let metalArr = [];
    let diamondTotal = {
      Wt: 0,
      Pcs: 0,
      Amount: 0,
    };
    let metalTotal = {
      grossWt: 0,
      Pcs: 0,
      Amount: 0,
      NetWt: 0,
    };
    let colorStone = {
      Wt: 0,
      Pcs: 0,
      Amount: 0,
    };
    let Misc = {
      Wt: 0,
      Pcs: 0,
      Amount: 0,
    };
    let otherAmount = 0;
    let MakingAmount = 0;
    let DiscountAmt = 0;
    let TotalAmount = 0;
    let netWtLosss = 0;
    let metalAmounts = 0;
    let clrStoneSettignAmount = 0;
    let DiaSettignAmount = 0;
    data?.BillPrint_Json1.forEach((e, i) => {
      let discountElements = [];
      if (e?.IsCriteriabasedAmount === 1) {
        if (e?.IsDiamondAmount === 1) {
          discountElements?.push({ label: "Diamond" });
        }
        if (e?.IsStoneAmount === 1) {
          discountElements?.push({ label: "Stone" });
        }
        if (e?.IsMetalAmount === 1) {
          discountElements?.push({ label: "Metal" });
        }
        if (e?.IsLabourAmount === 1) {
          discountElements?.push({ label: "Labour" });
        }
        if (e?.IsSolitaireAmount === 1) {
          discountElements?.push({ label: "Solitaire" });
        }
        if (e?.IsMiscAmount === 1) {
          discountElements?.push({ label: "Misc" });
        }
      }
      let otherTotals =
        e?.OtherCharges + e?.TotalDiamondHandling;
      otherAmount += e?.OtherCharges + e?.TotalDiamondHandling;
      let obj = { ...e };
      let object = {
        groupjob: e?.GroupJob,
        netwt: e?.NetWt,
        grosswt: e?.grosswt,
        rate: 0,
        amount: 0,
      };
      metalAmounts += e?.MetalAmount;
      let srJob = e?.SrJobno?.split("/");
      if (srJob?.length > 1) {
        srJob = srJob[1];
      } else {
        srJob = srJob[0];
      }
      obj.srJob = srJob;
      let otherTotal = [];
      let diamonds = [];
      let metals = [];
      let colors = [];
      let misc = [];
      let metalRate = 0;
      let metalAmount = 0;
      let otherCharge = otherAmountDetail(e?.OtherAmtDetail);
      let otherChargess = [];
      let rowWiseDiamondTotal = {
        Wt: 0,
        Pcs: 0,
        Amount: 0,
      };
      let rowWiseColorStoneTotal = {
        Wt: 0,
        Pcs: 0,
        Amount: 0,
      };
      let rowWiseMiscTotal = {
        Wt: 0,
        Pcs: 0,
        Amount: 0,
      };
      let rowWiseMetalTotal = {
        grossWt: e?.grosswt,
        NetWt: e?.NetWt,
        Amount: 0,
      };
      metalTotal.grossWt += e?.grosswt;
      metalTotal.NetWt += e?.NetWt;

      MakingAmount += e?.MakingAmount;
      DiscountAmt += e?.DiscountAmt;
      TotalAmount += e?.TotalAmount;
      let SettingAmount = 0;
      let netWtLoss = 0;
      let count = 0;
      let metalWt = 0;
      let otherMiscAmount = 0;
      data?.BillPrint_Json2.forEach((ele) => {
        if (ele?.StockBarcode === e?.SrJobno) {
          if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
            // if (i === 0) {
            diamondTotal.Wt += ele?.Wt;
            diamondTotal.Pcs += ele?.Pcs;
            diamondTotal.Amount += ele?.Amount;
            netWtLoss += ele?.Wt;
            DiaSettignAmount += ele?.SettingAmount;
            // }
            if (ele?.IsCenterStone === 1) {
              ele.MasterManagement_DiamondStoneTypeName = "CENTER STONE";
            }
            diamonds.push(ele);
            rowWiseDiamondTotal.Wt += ele?.Wt;
            rowWiseDiamondTotal.Pcs += ele?.Pcs;
            rowWiseDiamondTotal.Amount += ele?.Amount;
            SettingAmount += ele?.SettingAmount;
          } else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
            const groupingKey = `${ele?.ShapeName}-${ele?.QualityName}-${ele?.Colorname}-${ele?.Rate}`;
            let existingGroup = colors.find(item => item.groupKey === groupingKey);

            if (existingGroup) {
              existingGroup.Pcs += ele?.Pcs || 0;
              existingGroup.Wt += ele?.Wt || 0;
              existingGroup.Amount += ele?.Amount || 0;
              existingGroup.SettingAmount += ele?.SettingAmount || 0;
            } else {
              colors.push({
                groupKey: groupingKey,
                ShapeName: ele?.ShapeName,
                QualityName: ele?.QualityName,
                Colorname: ele?.Colorname,
                Rate: ele?.Rate,
                Pcs: ele?.Pcs || 0,
                Wt: ele?.Wt || 0,
                Amount: ele?.Amount || 0,
                SettingAmount: ele?.SettingAmount || 0,
              });
            }
            rowWiseColorStoneTotal.Wt += ele?.Wt;
            rowWiseColorStoneTotal.Pcs += ele?.Pcs;
            rowWiseColorStoneTotal.Amount += ele?.Amount;
            clrStoneSettignAmount += ele?.SettingAmount;
            // if (i === 0) {
            colorStone.Wt += ele?.Wt;
            colorStone.Pcs += ele?.Pcs;
            colorStone.Amount += ele?.Amount;
            // }
            SettingAmount += ele?.SettingAmount;
          } else if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
            if (ele?.IsPrimaryMetal === 1) {
              metalWt += ele?.Wt;
            }
            count++;
            metals.push(ele);
            metalRate += ele?.Rate;
            object.rate += ele?.Rate;
            object.amount += ele?.Amount;
            metalAmount += ele?.Amount;
            rowWiseMetalTotal.Amount += ele?.Amount;
            if (i === 0) {
              metalTotal.Pcs += ele?.Pcs;
              metalTotal.Amount += ele?.Amount;
            }
          } else if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
            if (ele?.IsHSCOE !== 0) {
              otherChargess.push(ele);
              // otherChargess.Amount += ele?.Amount;
            } else {
              misc.push(ele)
              rowWiseMiscTotal.Wt += ele?.Wt;
              rowWiseMiscTotal.Pcs += ele?.Pcs;
              rowWiseMiscTotal.Amount += ele?.Amount;
              Misc.Wt += ele?.Wt;
              Misc.Pcs += ele?.Pcs;
              Misc.Amount += ele?.Amount;
              otherMiscAmount += ele?.Amount;
            }
          }
        }
      });
      if (count === 1) {
        netWtLoss = e?.NetWt + e?.LossWt;
      } else if (count > 1) {
        netWtLoss = metalWt;
      }
      netWtLosss += netWtLoss;
      obj.metalRate = metalRate;
      obj.metalAmount = metalAmount;
      obj.diamonds = diamonds;
      obj.metals = metals;
      obj.colors = colors;
      obj.misc = misc;
      obj.netWtLoss = netWtLoss;
      obj.otherMiscAmount = otherMiscAmount;
      obj.otherTotal = otherTotal;
      obj.otherCharge = otherCharge;
      obj.otherChargess = otherChargess;
      obj.otherTotals = otherTotals;
      obj.discountElements = discountElements;
      obj.OtherCharges += otherChargess.reduce(
        (acc, cObj) => acc + cObj?.Amount,
        0
      );
      obj.rowWiseDiamondTotal = rowWiseDiamondTotal;
      obj.rowWiseColorStoneTotal = rowWiseColorStoneTotal;
      obj.rowWiseMiscTotal = rowWiseMiscTotal;
      obj.rowWiseMetalTotal = rowWiseMetalTotal;
      obj.SettingAmount = SettingAmount;
      newArr.push(obj);
      if (e?.GroupJob !== "") {
        let findRecord = metalArr.findIndex(
          (elem) => elem.groupjob === e?.GroupJob
        );
        if (findRecord === -1) {
          metalArr.push(object);
        } else {
          metalArr[findRecord].netwt += object.netwt;
          metalArr[findRecord].rate += object.rate;
          metalArr[findRecord].amount += object.amount;
          metalArr[findRecord].grosswt += object.grosswt;
        }
      }
    });
    let taxValue = taxGenrator(data?.BillPrint_Json[0], TotalAmount);
    // console.log("data?.BillPrint_Json[0]", data?.BillPrint_Json[0]);
    // console.log("taxValue", taxValue);
    let taxess =
      taxValue?.reduce(
        (acc, cObj) =>
          acc + +cObj?.amount / data?.BillPrint_Json[0]?.CurrencyExchRate, 0
      ) +
      data?.BillPrint_Json[0]?.AddLess /
      data?.BillPrint_Json[0]?.CurrencyExchRate;

    setTotal({
      ...total,
      netWtLoss: netWtLosss,
      metalAmount: metalAmounts,
      diamondTotal: diamondTotal,
      colorStone: colorStone,
      Misc: Misc,
      metalTotal: metalTotal,
      otherAmount: otherAmount,
      MakingAmount: MakingAmount,
      DiscountAmt: DiscountAmt,
      TotalAmount: TotalAmount,
      amountAfterDiscount:
        TotalAmount / data?.BillPrint_Json[0]?.CurrencyExchRate + taxess,
      DiaSettignAmount: DiaSettignAmount,
      clrStoneSettignAmount: clrStoneSettignAmount,
    });

    setTaxes(taxValue);

    // newArr.sort((a, b) => {
    //     const nameA = (a?.JewelCodePrefix + a?.srJob).toUpperCase();
    //     const nameB = (b?.JewelCodePrefix + b?.srJob).toUpperCase();
    //     if (nameA < nameB) {
    //         return -1;
    //     }
    //     if (nameA > nameB) {
    //         return 1;
    //     }
    //     return 0;
    // });

    newArr?.sort((a, b) => {
      // First, compare based on Categoryname
      if (a.Categoryname < b.Categoryname) return -1;
      if (a.Categoryname > b.Categoryname) return 1;

      // If Categoryname is the same, compare based on SrJobno
      if (a.SrJobno < b.SrJobno) return -1;
      if (a.SrJobno > b.SrJobno) return 1;
      // If both Categoryname and SrJobno are the same, return 0
      return 0;
    });



    const processJewelryData = (newOne) => {
      return newOne.map((obj) => {
        const diamondMap = new Map();
        obj.diamonds.forEach((diamond) => {
          const key = `${diamond.ShapeName}_${diamond.QualityName}_${diamond.Colorname}_${diamond.SizeName}_${diamond.Rate}`;
          if (diamondMap.has(key)) {
            let existingDiamond = diamondMap.get(key);
            existingDiamond.Wt += diamond.Wt; // Merge weight
            existingDiamond.Amount += diamond.Amount; // Merge amount
            existingDiamond.Pcs += diamond.Pcs; // Merge pieces
          } else {
            diamondMap.set(key, { ...diamond });
          }
        });

        const colorMap = new Map();
        obj.colors.forEach((color) => {
          const key = `${color.ShapeName}_${color.QualityName}_${color.Colorname}_${color.SizeName}_${color.Rate}`;
          if (colorMap.has(key)) {
            let existingColor = colorMap.get(key);
            existingColor.Wt += color.Wt; // Merge weight
            existingColor.Amount += color.Amount; // Merge amount
            existingColor.Pcs += color.Pcs; // Merge pieces
          } else {
            colorMap.set(key, { ...color });
          }
        });

        return {
          ...obj,
          diamonds: Array.from(diamondMap.values()),
          colors: Array.from(colorMap.values())
        };
      });
    };

    const updatedData = processJewelryData(newArr);
    // console.log('Updated Data:', updatedData);
    setData(updatedData);
    // setData(newArr);
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

  const processDiamonds = (diamonds) => {
    if (!Array.isArray(diamonds) || diamonds.length === 0) return [];

    const grouped = diamonds?.reduce((acc, el) => {
      const key = `${el.ShapeName}-${el.QualityName}-${el.Colorname}-${el.SizeName}`;

      if (!acc[key]) {
        acc[key] = { ...el, Wt: el.Wt, Amount: el.Amount, count: 1 };
      } else {
        acc[key].Wt += el.Wt;
        acc[key].Amount += el.Amount;
        acc[key].count += 1;
      }

      return acc;
    }, {});

    return Object.values(grouped).reduce((finalList, item) => {
      if (item.count === 1) {
        // If only one entry, keep as is
        finalList.push(item);
      } else {
        // If merged, push merged entry
        finalList.push({ ...item, count: undefined });
      }
      return finalList;
    }, []);
  };

  function extractTextFromHTML(htmlString) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;

    return tempDiv.textContent || tempDiv.innerText || "";
  }

  const plainText = extractTextFromHTML(json0Data?.Declaration);
  // console.log("plainText", plainText);

  // console.log("FinalTotalMisc", FinalTotalMisc);
  // console.log("data", data);
  // console.log("json0Data", json0Data);

  const discountCriteria = [
    { key: 'DiamondDiscount', isAmountKey: 'IsDiamondDiscInAmount', label: 'Diamond', disAmount: "DiamondDiscountAmount" },
    { key: 'MetalDiscount', isAmountKey: 'IsMetalDiscInAmount', label: 'Metal', disAmount: "MetalDiscountAmount" },
    { key: 'StoneDiscount', isAmountKey: 'IsStoneDiscInAmount', label: 'Colorstone', disAmount: "StoneDiscountAmount" },
    { key: 'LabourDiscount', isAmountKey: 'IsLabourDiscInAmount', label: 'Labour', disAmount: "LabourDiscountAmount" },
    { key: 'SolitaireDiscount', isAmountKey: 'IsSolitaireDiscInAmount', label: 'Solitaire', disAmount: "SolitaireDiscountAmount1" },
    { key: 'MiscDiscount', isAmountKey: 'IsMiscDiscInAmount', label: 'Misc', disAmount: "MiscDiscountAmount" },
  ];


  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <>
          <div
            className={`container max_width_container pad_60_allPrint ${style?.container} px-1`}
          >
            {/* print Button */}
            <div className="printBtn_sec d-flex justify-content-end align-items-center pt-4 mb-2 d_none_pcl1">
              <div className="mx-1 d-flex align-items-center">
                <input
                  type="checkbox"
                  value={diaQlty}
                  onChange={() => checkDiaQlty()}
                  id="diaqlty"
                />
                <label
                  htmlFor="diaqlty"
                  className={`mx-2 user-select-none fspcl ${style?.CheckBxFnt}`}
                >
                  Diamond Quality
                </label>
              </div>
              <div className="mx-1 d-flex align-items-center">
                <input
                  type="checkbox"
                  checked={misc}
                  onChange={checkMisc}
                  id="misc"
                />
                <label
                  htmlFor="misc"
                  className={`mx-2 user-select-none fspcl ${style?.CheckBxFnt}`}
                >
                  MISC
                </label>
              </div>
              <div className={`printBtn_sec text-end`}>
                <input
                  type="button"
                  className="btn_white blue"
                  style={{ fontSize: "12px" }}
                  value="Print"
                  onClick={(e) => handlePrint(e)}
                />
              </div>
            </div>

            {/* print head text */}
            <div className={`${style?.headText_pcls} mb-1 d-flex align-items-center`}>
              {json0Data?.PrintHeadLabel === "" ? "PACKING LIST" : json0Data?.PrintHeadLabel}
            </div>

            {/* Comapny Header */}
            <div className={`px-1 ${style?.spbrWord} ${style?.com_fs_pcl3} ${style?.mainHeadWD}`}>
              <div className={`justify-content-start ${style?.spbrWord} ${style?.fs_14_pcls}`}>
                <div className={`${style?.fs_16_pcls} fw-bold py-1 ${style?.spbrWord}`}>
                  {json0Data?.CompanyFullName}
                </div>
                <div>
                  <span>{json0Data?.CompanyAddress !== "" && `${json0Data?.CompanyAddress}`}</span>
                  <span>{json0Data?.CompanyAddress2 !== "" && `${json0Data?.CompanyAddress2}`}</span>{" "}
                  {json0Data?.CompanyCity}{" "}
                  {json0Data?.CompanyCity}
                  {json0Data?.CompanyPinCode !== "" && `- ${json0Data?.CompanyPinCode}`}{" "}
                  {json0Data?.CompanyState !== "" && `, ${json0Data?.CompanyState}`}(
                  {json0Data?.CompanyCountry}){" "}
                </div>
                {/* <div>{json0Data?.CompanyAddress2}</div> */}
                {/* <div>{json0Data?.CompanyCity}</div> */}
                <div>
                  <span>{json0Data?.CompanyTellNo !== "" && `T : ${json0Data?.CompanyTellNo}`}</span>{" "}
                  <span>
                    {json0Data?.CompanyEmail !== "" && `${json0Data?.CompanyEmail}`}{" "}
                    {json0Data?.CompanyWebsite !== "" && `| ${json0Data?.CompanyWebsite}`}{" "}
                  </span>
                  {json0Data?.Company_VAT_GST_No !== "" && `| ${json0Data?.Company_VAT_GST_No}`}{" "}
                  {json0Data?.Company_CST_STATE_No !== "" && `| ${json0Data?.Company_CST_STATE}`}
                  {json0Data?.Company_CST_STATE_No !== "" && `-${json0Data?.Company_CST_STATE_No}`}
                  {json0Data?.Pannumber !== "" && ` | PAN- ${json0Data?.Pannumber}`}
                </div>
              </div>

              {/* Company Logo */}
              {json0Data?.PrintLogo !== "" && (
                <img
                  src={json0Data?.PrintLogo}
                  alt=""
                  className={`w-100 h-auto ms-auto d-block object-fit-contain`}
                  onError={handleImageErrors}
                  height={120}
                  width={150}
                  style={{ maxWidth: "116px" }}
                />
              )}
            </div>

            {/* customer header */}
            <div className={`d-flex mt-1 mb-1 ${style?.brall_pcls} ${style?.spbrWord}`}>
              <div className={`${style?.bright_pcls} p-1 ${style?.com_fs_pcl3}`} style={{ width: "35%" }}>
                <div>{json0Data?.lblBillTo}</div>
                <div
                  className={`px-1 ${style?.fsgdp10_pcl7_3}`}
                  style={{ whiteSpace: "normal", wordBreak: "break-word" }}
                >
                  <b className={`${style?.fs_14_pcls}`}>{json0Data?.customerfirmname}</b>
                  {json0Data?.customerAddress2 &&
                    `, ${json0Data.customerAddress2}`}
                  {json0Data?.customerAddress1 &&
                    ` ${json0Data.customerAddress1}`}
                  {json0Data?.customerAddress3 &&
                    ` ${json0Data.customerAddress3}`}
                  {json0Data?.customercity1 &&
                    ` ${json0Data.customercity1}`}
                  {json0Data?.PinCode && ` - ${json0Data.PinCode}`}
                </div>
                <div className="px-1">
                  {json0Data?.customeremail1 !== "" && json0Data?.customeremail1}&nbsp;
                  {json0Data?.vat_cst_pan !== " " && json0Data?.vat_cst_pan}
                  {json0Data?.Cust_CST_STATE_No !== "" && `${json0Data?.Cust_CST_STATE}`}
                  {json0Data?.Cust_CST_STATE_No !== "" && `- ${json0Data?.Cust_CST_STATE_No}`}
                </div>
              </div>
              <div className={`${style?.bright_pcls} p-1 ${style?.com_fs_pcl3}`} style={{ width: "35%" }}>
                <div>Ship To,</div>
                <div className={`px-1 ${style?.fsgdp10_pcl7_3}`}>
                  <b className={`${style?.fs_14_pcls}`}>{json0Data?.customerfirmname}</b>
                  {json0Data?.address?.map((e, i) => {
                    return (
                      <div key={i}>
                        {e}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className={`p-1 ${style?.com_fs_pcl3}`} style={{ width: "30%" }}>
                <div className={`d-flex align-items-center`}>
                  <div className={`fw-bold ${style?.billbox_pcls}`}>INVOICE NO </div>
                  <div>{json0Data?.InvoiceNo}</div>
                </div>
                <div className={`d-flex align-items-center`}>
                  <div className={`fw-bold ${style?.billbox_pcls}`}>DATE </div>
                  <div>{json0Data?.EntryDate}</div>
                </div>
              </div>
            </div>

            {/* Table Header */}
            <div
              className={`border-grey border-start border-end border-top mb-1 no_break ${style?.rowWisePad} ${style?.rowHeader} ${style?.word_break}`}
            >
              <div className={`d-flex border-bottom lightGrey`}>
                <div
                  className={`${style?.pad_1} fw-bold ${style?.srNo} border-end`}
                >
                  <div className="d-grid h-100">
                    <p
                      className="d-flex justify-content-center align-items-center text-center"
                      style={{ wordBreak: "normal" }}
                    >
                      Sr. No.
                    </p>
                  </div>
                </div>
                <div
                  className={`${style?.pad_1} fw-bold ${style?.design} border-end`}
                >
                  <div className="d-grid h-100">
                    <p className="d-flex justify-content-center align-items-center text-center">
                      Jewelcode
                    </p>
                  </div>
                </div>
                <div
                  className={` fw-bold ${style?.diamond} border-end d-flex flex-wrap`}
                >
                  <div className="d-grid h-100 w-100">
                    <p className="d-flex w-100 fw-bold justify-content-center text-center">
                      Diamond
                    </p>
                    <div className="d-flex w-100 border-top">
                      <p className={`col-2 text-center border-end `}>Shape</p>
                      <p className={`col-2  border-end text-center `}>Size</p>
                      <p className={`col-2  border-end text-center `}>Wt</p>
                      <p className={`col-2  border-end text-center `}>Pcs</p>
                      <p className={`col-2  border-end text-center `}>Rate</p>
                      <p className={`col-2 text-center`}>Amount</p>
                    </div>
                  </div>
                </div>
                <div className={` fw-bold ${style?.metal} border-end`}>
                  <div className="d-grid h-100 w-100">
                    <p className="d-flex w-100 fw-bold justify-content-center">
                      Metal
                    </p>
                    <div className="d-flex w-100 border-top">
                      <p className={`${style?.wid_20} text-center border-end`}>
                        Kt
                      </p>
                      <p className={`${style?.wid_20} text-center border-end`}>
                        Gr Wt
                      </p>
                      <p className={`${style?.wid_20} text-center border-end`}>
                        {data?.find((e) => e?.LossWt !== 0) ? "N + L" : "Net Wt"}
                      </p>
                      <p className={`${style?.wid_20} text-center border-end`}>
                        Rate
                      </p>
                      <p className={`${style?.wid_20} text-center`}>Amount</p>
                    </div>
                  </div>
                </div>
                <div className={` fw-bold ${style?.stone} border-end`}>
                  <div className="d-grid h-100 w-100">
                    <p className="d-flex w-100 fw-bold justify-content-center">
                      Stone & Misc
                    </p>
                    <div className="d-flex w-100 border-top">
                      <p className={`${style?.wid_20} text-center border-end`}>
                        Shape
                      </p>
                      <p className={`${style?.wid_20} text-center border-end`}>
                        Wt
                      </p>
                      <p className={`${style?.wid_20} text-center border-end`}>
                        Pcs
                      </p>
                      <p className={`${style?.wid_20} text-center border-end`}>
                        Rate
                      </p>
                      <p className={`${style?.wid_20} text-center`}>Amount</p>
                    </div>
                  </div>
                </div>
                <div className={` fw-bold ${style?.labour} border-end`}>
                  <div className="d-grid h-100 w-100">
                    <p className="d-flex w-100 fw-bold justify-content-center">
                      Labour
                    </p>
                    <div className="d-flex w-100 border-top">
                      <p
                        className={`${style?.pad_1} col-6 text-center border-end`}
                      >
                        Rate
                      </p>
                      <p className={`${style?.pad_1} col-6 text-center`}>
                        Amount
                      </p>
                    </div>
                  </div>
                </div>
                <div className={` fw-bold ${style?.other} border-end`}>
                  <div className="d-grid h-100 w-100">
                    <p className="d-flex w-100 fw-bold justify-content-center">
                      Other
                    </p>
                    <div className="d-flex w-100 border-top">
                      <p
                        className={`${style?.pad_1} col-6 text-center border-end`}
                      >
                        Code
                      </p>
                      <p className={`${style?.pad_1} col-6 text-center`}>
                        Amount
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`${style?.pad_1} fw-bold ${style?.price}`}>
                  <div className="d-grid h-100">
                    <p className="d-flex justify-content-center align-items-center">
                      Price
                    </p>
                  </div>
                </div>
              </div>
            </div>

            
           

            {/* Table Data */}
            {data?.length > 0 &&
            
              data?.map((e, i) => {
                const discountDisplay = discountCriteria
                  .filter(({ key }) => e?.[key] > 0) // Only include non-zero discounts
                  .map(({ key, isAmountKey, label, disAmount }) => {
                    const num = Number(e[key]); // ensure it's a number
                    const am = Number(e[disAmount])
                    const decimals = e[isAmountKey] === 1 ? 3 : 2; // 0 => 3 decimals, 1 => 2 decimals
                    const val = num.toFixed(decimals); // fixed decimals
                    return e[isAmountKey] === 0 ? `${val}% @${label} Amount ` : `${val} @${label} Amount`;
                  })
                  .join(', ');
                
                console.log("TCL:discountDisplay ", discountDisplay)
                return (
                  <div
                    key={i}
                    className={`border-top no_break ${style?.rowWisePad} ${style?.word_break}`}
                  >
                    <div className={`${style?.pbia_pcl3} border-start border-end border-grey`}>
                      <div className={`d-flex ${style?.packingListRow}`}>
                        <div
                          className={`${style?.pad_1} ${style?.srNo} border-end text-center`}
                        >
                          <p>{NumberWithCommas(i + 1, 0)}</p>
                        </div>

                        {/* Jewelcode */}
                        <div
                          className={`${style?.pad_1}  ${style?.design} border-end`}
                        >
                          <div className="d-grid h-100">
                            <p className="d-flex ps-1 align-items-center">
                              {atob(evn)?.toLowerCase() === "quote"
                                ? e?.designno
                                : e?.JewelCodePrefix?.slice(0, 2) +
                                e?.Category_Prefix?.slice(0, 2) +
                                e?.SrJobno?.split("/")[1]}
                            </p>
                            <img
                              src={e?.DesignImage}
                              alt=""
                              className={`w-100 ${style?.img} pb-1`}
                              onError={handleImageError}
                            />
                            {e?.HUID !== "" && (
                              <p className="text-center">HUID-{e?.HUID}</p>
                            )}
                          </div>
                        </div>

                        {/* Diamond */}
                        <div
                          className={` ${style?.diamond} border-end d-flex flex-wrap`}
                        >
                          <div className="d-flex w-100 ">
                            <div
                              className={`col-2 border-end pb-3 position-relative h-100`}
                            >
                              {e?.diamonds.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {el?.Shape_Code} {diaQlty && el?.QualityName}
                                  </p>
                                );
                              })}
                            </div>
                            <div
                              className={`col-2 border-end pb-3 position-relative h-100`}
                            >
                              {e?.diamonds.map((el, indd) => {
                                return (
                                  <p key={indd} className="text-center">
                                    {el?.CustomSize !== "" && el?.SizeName?.toLowerCase() === "custom"
                                      ? `C:${el?.CustomSize}`
                                      : el?.SizeName
                                    }
                                  </p>
                                );
                              })}
                            </div>
                            <div
                              className={`col-2 text-end border-end pb-3 position-relative h-100`}
                            >
                              {e?.diamonds.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(el?.Wt, 3)}
                                  </p>
                                );
                              })}
                            </div>
                            <div
                              className={`col-2 text-end border-end pb-3 position-relative h-100 `}
                            >
                              {e?.diamonds.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(el?.Pcs, 0)}
                                  </p>
                                );
                              })}
                            </div>
                            <div
                              className={`col-2 text-end border-end pb-3 position-relative h-100`}
                            >
                              {e?.diamonds.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(el?.Rate, 2)}
                                  </p>
                                );
                              })}
                            </div>
                            <div
                              className={`col-2 text-end pb-3 position-relative h-100`}
                            >
                              {e?.diamonds.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(
                                      el?.Amount / json0Data?.CurrencyExchRate,
                                      2
                                    )}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Metal */}
                        <div
                          className={` ${style?.metal} border-end d-flex flex-wrap`}
                        >
                          <div
                            className="d-flex w-100"
                          /* ${ e?.JobRemark !== "" && "border-bottom"} Bug Solving 13/12/25_11:12 */
                          >
                            <div
                              className={`${style?.wid_20} border-end ${style?.no_word_break}`}
                            >
                              {e?.metals.map((el, indd) => {
                                return (
                                  <p key={indd} className={``}>
                                    {indd === 0 && e?.MetalTypePurity}
                                  </p>
                                );
                              })}
                            </div>
                            <div
                              className={`${style?.wid_20} text-end border-end`}
                            >
                              {e?.metals.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {indd === 0 &&
                                      NumberWithCommas(e?.grosswt, 3)}
                                  </p>
                                );
                              })}
                            </div>
                            <div
                              className={`${style?.wid_20} text-end border-end`}
                            >
                              <p>{NumberWithCommas(e?.netWtLoss, 3)}</p>
                            </div>
                            <div
                              className={`${style?.wid_20} text-end border-end`}
                            >
                              {e?.metals.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {indd === 0 &&
                                      NumberWithCommas(el?.Rate, 2)}
                                  </p>
                                );
                              })}
                            </div>
                            <div className={`${style?.wid_20} text-end`}>
                              {e?.metals.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {indd === 0 &&
                                      NumberWithCommas(
                                        el?.Amount /
                                        json0Data?.CurrencyExchRate,
                                        2
                                      )}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                          {/* {e?.JobRemark !== "" && (
                            <div>
                              <p>Remark:</p>
                              <p className="fw-bold">{e?.JobRemark}</p>
                            </div>
                          )} Bug Solving 13/12/25_11:12*/}
                        </div>

                        {/* Stone */}
                        <div
                          className={` ${style?.stone} border-end d-flex flex-wrap`}
                        >
                          <div className="d-flex w-100">
                            <div
                              className={`${style?.wid_20} border-end position-relative h-100 pb-3`}
                            >
                              {e?.colors.map((el, indd) => {
                                return <p key={indd}>{el?.ShapeName}</p>;
                              })}
                              {misc && e?.misc.map((el, indd) => {
                                return <p key={indd}>M: {el?.ShapeName}</p>;
                              })}
                            </div>
                            <div
                              className={`${style?.wid_20} text-end border-end position-relative h-100 pb-3`}
                            >
                              {e?.colors.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(el?.Wt, 2)}
                                  </p>
                                );
                              })}
                              {misc && e?.misc.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(el?.Wt, 2)}
                                  </p>
                                );
                              })}
                            </div>
                            <div
                              className={`${style?.wid_20} text-end border-end position-relative h-100 pb-3`}
                            >
                              {e?.colors.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(el?.Pcs, 0)}
                                  </p>
                                );
                              })}
                              {misc && e?.misc.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(el?.Pcs, 0)}
                                  </p>
                                );
                              })}
                            </div>
                            <div
                              className={`${style?.wid_20} text-end border-end position-relative h-100 pb-3`}
                            >
                              {e?.colors.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(el?.Rate, 2)}
                                  </p>
                                );
                              })}
                              {misc && e?.misc.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(el?.Rate, 2)}
                                  </p>
                                );
                              })}
                            </div>
                            <div
                              className={`${style?.wid_20} text-end position-relative h-100 pb-3`}
                            >
                              {e?.colors.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(
                                      el?.Amount / json0Data?.CurrencyExchRate,
                                      2
                                    )}
                                  </p>
                                );
                              })}
                              {misc && e?.misc.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(
                                      el?.Amount / json0Data?.CurrencyExchRate,
                                      2
                                    )}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Labour */}
                        <div
                          className={` ${style?.labour} border-end d-flex flex-wrap`}
                        >
                          <div className="d-flex w-100">
                            <div
                              className={`col-6 text-end border-end position-relative h-100 pb-3`}
                            >
                              <p>{NumberWithCommas(e?.MaKingCharge_Unit, 2)}</p>
                            </div>
                            <div
                              className={` col-6 text-end position-relative h-100 pb-3`}
                            >
                              <p>
                                {NumberWithCommas(
                                  (e?.MakingAmount + e?.SettingAmount) /
                                  json0Data?.CurrencyExchRate,
                                  2
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Other */}
                        <div
                          className={` ${style?.other} border-end d-flex flex-wrap`}
                        >
                          <div className="d-flex w-100">
                            <div
                              className={` col-6 border-end position-relative h-100 pb-3`}
                            >
                              {e?.otherChargess?.map((ele, ind) => {
                                return (
                                  ele?.Amount !== 0 && (
                                    <p
                                      key={ind}
                                      className={`${style?.min_height} ${style?.spbrWord} text-end`}
                                    >
                                      {ele?.ShapeName}
                                    </p>
                                  )
                                );
                              })}

                              {(e?.otherMiscAmount !== 0 && misc === false) && (
                                <p className={`${style?.min_height} ${style?.spbrWord} text-end`}>Other</p>
                              )}

                              {e?.otherCharge?.map((ele, ind) => {
                                return (
                                  +ele?.value !== 0 &&
                                  ind <= 2 && (
                                    <p
                                      key={ind}
                                      className={`${style?.min_height} ${style?.spbrWord} text-end`}
                                    >
                                      {ele?.label}
                                    </p>
                                  )
                                );
                              })}

                              {e?.TotalDiamondHandling !== 0 && (
                                <p
                                  className={`${style?.min_height} ${style?.spbrWord} text-end`}
                                >
                                  Charges Handling
                                </p>
                              )}
                            </div>
                            <div
                              className={` col-6 text-end position-relative h-100 pb-3`}
                            >
                              {e?.otherChargess?.map((ele, ind) => {
                                return (
                                  ele?.Amount !== 0 && (
                                    <p
                                      key={ind}
                                      className={`${style?.min_height}`}
                                    >
                                      {NumberWithCommas(
                                        ele?.Amount /
                                        json0Data?.CurrencyExchRate,
                                        2
                                      )}
                                    </p>
                                  )
                                );
                              })}

                              {(e?.otherMiscAmount !== 0 && misc === false) && (
                                <p className={`${style?.min_height}`}>
                                  {NumberWithCommas(
                                    e?.otherMiscAmount /
                                    json0Data?.CurrencyExchRate,
                                    2
                                  )}
                                </p>
                              )}

                              {e?.otherCharge?.map((ele, ind) => {
                                return (
                                  +ele?.value !== 0 &&
                                  ind <= 2 && (
                                    <p
                                      key={ind}
                                      className={`${style?.min_height}`}
                                    >
                                      {NumberWithCommas(+ele?.value, 2)}
                                    </p>
                                  )
                                );
                              })}

                              {e?.TotalDiamondHandling !== 0 && (
                                <p className={`${style?.min_height}`}>
                                  {NumberWithCommas(e?.TotalDiamondHandling, 2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div
                          className={` fw-bold ${style?.price} d-flex flex-wrap`}
                        >
                          <div className="d-flex w-100">
                            <div
                              className={` position-relative h-100 pb-3 text-end w-100`}
                            >
                              <p>
                                {NumberWithCommas(
                                  e?.UnitCost / json0Data?.CurrencyExchRate,
                                  2
                                )}{" "}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`${style?.pbia_pcl3} border-start border-end border-grey`}>
                      <div className={`d-flex  ${style?.packingListRow}`}>
                        <div
                          className={`${style?.pad_1} ${style?.srNo} border-end text-center`}
                        ></div>
                        <div
                          className={` ${style?.pad_1}  ${style?.design} border-end`}
                        >
                          {e?.lineid !== "" && (
                            <p className="text-center">{e?.lineid}</p>
                          )}
                        </div>
                        <div
                          className={` lightGrey ${style?.diamond} border-end d-flex flex-wrap`}
                        >
                          <div className="d-flex w-100 ">
                            <div className={`col-2 border-end `}>
                              <p className={`w-100 border-top  fw-bold`}></p>
                            </div>
                            <div className={`col-2 border-end `}>
                              <p className={`w-100 border-top  fw-bold`}></p>
                            </div>
                            <div className={`col-2 text-end border-end `}>
                              <p className={`w-100 border-top  fw-bold`}>
                                {e?.rowWiseDiamondTotal.Wt !== 0 &&
                                  NumberWithCommas(
                                    e?.rowWiseDiamondTotal.Wt,
                                    3
                                  )}
                              </p>
                            </div>
                            <div className={`col-2 text-end border-end  `}>
                              <p className={`w-100 border-top  fw-bold`}>
                                {e?.rowWiseDiamondTotal.Pcs !== 0 &&
                                  NumberWithCommas(
                                    e?.rowWiseDiamondTotal.Pcs,
                                    0
                                  )}
                              </p>
                            </div>
                            <div className={`col-2 text-end border-end `}>
                              <p className={`w-100 border-top  fw-bold`}></p>
                            </div>
                            <div className={`col-2 text-end `}>
                              <p className={`w-100 border-top  fw-bold`}>
                                {e?.rowWiseDiamondTotal.Amount !== 0 &&
                                  NumberWithCommas(
                                    e?.rowWiseDiamondTotal.Amount /
                                    json0Data?.CurrencyExchRate,
                                    2
                                  )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div
                          className={` lightGrey ${style?.metal} border-end d-flex flex-wrap`}
                        >
                          <div className="d-flex w-100">
                            <div
                              className={`${style?.wid_20} border-end ${style?.no_word_break}`}
                            >
                              <p className={`fw-bold w-100 border-top  `}></p>
                            </div>
                            <div
                              className={`${style?.wid_20} text-end border-end`}
                            >
                              <p className={`fw-bold w-100 border-top  `}>
                                {e?.rowWiseMetalTotal.grossWt !== 0 &&
                                  NumberWithCommas(
                                    e?.rowWiseMetalTotal.grossWt,
                                    3
                                  )}
                              </p>
                            </div>
                            <div
                              className={`${style?.wid_20} text-end border-end`}
                            >
                              <p className={`fw-bold w-100 border-top  `}>
                                {e?.netWtLoss !== 0 &&
                                  NumberWithCommas(e?.netWtLoss, 3)}
                              </p>
                            </div>
                            <div
                              className={`${style?.wid_20} text-end border-end`}
                            >
                              <p className={`fw-bold w-100 border-top  `}></p>
                            </div>
                            <div className={`${style?.wid_20} text-end`}>
                              <p className={`fw-bold w-100 border-top  `}>
                                {e?.rowWiseMetalTotal.Amount !== 0 &&
                                  NumberWithCommas(
                                    e?.rowWiseMetalTotal.Amount /
                                    json0Data?.CurrencyExchRate,
                                    2
                                  )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* JobWise Stone-Misc Total */}
                        <div
                          className={` lightGrey ${style?.stone} border-end d-flex flex-wrap`}
                        >
                          <div className="d-flex w-100">
                            <div className={`${style?.wid_20} border-end`}>
                              <p className={`fw-bold w-100 border-top `}></p>
                            </div>
                            <div
                              className={`${style?.wid_20} text-end border-end `}
                            >
                              <p className={`fw-bold w-100 border-top `}>
                                {(e?.rowWiseColorStoneTotal.Wt !== 0 || e?.rowWiseMiscTotal.Wt !== 0) &&
                                  misc ? NumberWithCommas(
                                    e?.rowWiseColorStoneTotal.Wt + e?.rowWiseMiscTotal.Wt,
                                    2
                                  ) : NumberWithCommas(
                                    e?.rowWiseColorStoneTotal.Wt,
                                    2
                                  )}
                              </p>
                            </div>
                            <div
                              className={`${style?.wid_20} text-end border-end `}
                            >
                              <p className={`fw-bold w-100 border-top `}>
                                {(e?.rowWiseColorStoneTotal.Pcs !== 0 || e?.rowWiseMiscTotal.Pcs !== 0) &&
                                  misc ? NumberWithCommas(
                                    e?.rowWiseColorStoneTotal.Pcs + e?.rowWiseMiscTotal.Pcs,
                                    0
                                  ) : NumberWithCommas(
                                    e?.rowWiseColorStoneTotal.Pcs,
                                    0
                                  )}
                              </p>
                            </div>
                            <div
                              className={`${style?.wid_20} text-end border-end `}
                            >
                              <p className={`fw-bold w-100 border-top `}></p>
                            </div>
                            <div className={`${style?.wid_20} text-end`}>
                              <p className={`fw-bold w-100 border-top `}>
                                {(e?.rowWiseColorStoneTotal.Amount !== 0 || e?.rowWiseMiscTotal.Amount !== 0) &&
                                  misc ? NumberWithCommas(
                                    e?.rowWiseColorStoneTotal.Amount + e?.rowWiseMiscTotal.Amount /
                                    json0Data?.CurrencyExchRate,
                                    2
                                  ) : NumberWithCommas(
                                    e?.rowWiseColorStoneTotal.Amount /
                                    json0Data?.CurrencyExchRate,
                                    2
                                  )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* JobWise Labour Total */}
                        <div
                          className={` lightGrey ${style?.labour} border-end d-flex flex-wrap`}
                        >
                          <div className="d-flex w-100">
                            <div className={`col-6 text-end border-end `}>
                              <p className={`fw-bold w-100 border-top`}></p>
                            </div>
                            <div className={` col-6 text-end`}>
                              <p className={`fw-bold w-100 border-top`}>
                                {NumberWithCommas(
                                  (e?.MakingAmount + e?.SettingAmount) /
                                  json0Data?.CurrencyExchRate,
                                  2
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* JobWise Other Total */}
                        <div
                          className={` lightGrey ${style?.other} border-end d-flex flex-wrap`}
                        >
                          <div className="d-flex w-100">
                            <div className={` col-6 border-end`}>
                              <p className={`w-100 border-top  fw-bold`}></p>
                            </div>
                            <div className={` col-6 text-end`}>
                              <p
                                className={`w-100 border-top fw-bold  fw-bold`}
                              >
                                {misc ? NumberWithCommas(
                                  e?.otherTotals / json0Data?.CurrencyExchRate,
                                  2
                                ) : NumberWithCommas(
                                  e?.otherTotals + e?.otherMiscAmount / json0Data?.CurrencyExchRate,
                                  2
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* JobWise Price Total */}
                        <div
                          className={` lightGrey fw-bold ${style?.price} d-flex flex-wrap`}
                        >
                          <div className="d-flex w-100">
                            <div className={`text-end w-100`}>
                              <p className={`w-100 border-top  fw-bold`}>
                                {NumberWithCommas(
                                  e?.UnitCost / json0Data?.CurrencyExchRate,
                                  2
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                    {/* Per Job Discount Row */}
                    {e?.discountDisplay !== 0 && (
                      <div className={`border-start ${style?.pbia_pcl3} border-end border-grey`}>
                        <div className="d-flex border-bottom border-top">
                          <div
                            className={`${style?.pad_1} fw-bold ${style?.srNo} border-end text-center`}
                          >
                            <p></p>
                          </div>
                          <div
                            className={`${style?.pad_1} fw-bold ${style?.design} border-end`}
                          >
                            <div className="d-grid h-100">
                              <p className="d-flex justify-content-center align-items-center"></p>
                            </div>
                          </div>
                          <div
                            className={` ${style?.diamond} border-end d-flex flex-wrap lightGrey`}
                          >
                            <div className="d-flex w-100 ">
                              <div className={`col-2  h-100`}>
                                <p></p>
                              </div>
                              <div className={`col-2  h-100`}>
                                <p></p>
                              </div>
                              <div className={`col-2 text-end  h-100`}>
                                <p></p>
                              </div>
                              <div className={`col-2 text-end  h-100 `}>
                                <p></p>
                              </div>
                              <div
                                className={`col-2 text-end border-end  h-100`}
                              >
                                <p className={``}></p>
                              </div>
                              <div className={`col-2 text-end  h-100`}>
                                <p className={` `}></p>
                              </div>
                            </div>
                          </div>
                          <div
                            className={` ${style?.metal} border-end d-flex flex-wrap lightGrey`}
                          >
                            <div className="d-flex w-100">
                              <div
                                className={`${style?.wid_20} border-end position-relative h-100`}
                              >
                                <p className={` `}></p>
                              </div>
                              <div
                                className={`${style?.wid_20} text-end border-end position-relative h-100`}
                              >
                                <p className={` `}></p>
                              </div>
                              <div
                                className={`${style?.wid_20} text-end border-end position-relative h-100`}
                              >
                                <p className={` `}></p>
                              </div>
                              <div
                                className={`${style?.wid_20} text-end border-end position-relative h-100`}
                              >
                                <p className={` `}></p>
                              </div>
                              <div
                                className={`${style?.wid_20} text-end position-relative h-100`}
                              >
                                <p className={` `}></p>
                              </div>
                            </div>
                          </div>
                          <div
                            className={` ${style?.stone} border-end d-flex flex-wrap lightGrey`}
                          >
                            <div className="d-flex w-100">
                              <div
                                className={`${style?.wid_20} border-end position-relative h-100`}
                              >
                                <p className={` `}></p>
                              </div>
                              <div
                                className={`${style?.wid_20} text-end border-end position-relative h-100`}
                              >
                                <p className={` `}></p>
                              </div>
                              <div
                                className={`${style?.wid_20} text-end border-end position-relative h-100`}
                              >
                                <p className={` `}></p>
                              </div>
                              <div
                                className={`${style?.wid_20} text-end border-end position-relative h-100`}
                              >
                                <p className={` `}></p>
                              </div>
                              <div
                                className={`${style?.wid_20} text-end position-relative h-100`}
                              >
                                <p className={` `}></p>
                              </div>
                            </div>
                          </div>
                          <div
                            className={` ${style?.discounts} border-end d-flex flex-wrap lightGrey text-end w-100`}
                          >
                            {/* <p className={` w-100 fw-bold`}>Discount {e?.Discount}% On Amount</p> */}
                            <p className="fw-bold text-end">
                             Discount {discountDisplay || `${NumberWithCommas(e?.Discount, 2)} @ Total Amount`}
                            </p>
                          </div>
                          <div
                            className={` ${style?.discountsAmounts} border-end lightGrey text-end`}
                          >
                            <p className={` fw-bold`}>
                              {NumberWithCommas(
                                e?.DiscountAmt / json0Data?.CurrencyExchRate,
                                2
                              )}
                            </p>
                          </div>
                          <div
                            className={` fw-bold ${style?.price} d-flex flex-wrap lightGrey`}
                          >
                            <div className="d-flex w-100">
                              <div
                                className={`position-relative h-100 text-end w-100`}
                              >
                                <p>
                                  {NumberWithCommas(
                                    e?.TotalAmount /
                                    json0Data?.CurrencyExchRate,
                                    2
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Final Total Row */}
            <div className={`border-start ${style?.pbia_pcl3} border-end border-grey no_break ${style?.rowWisePad} ${style?.word_break}`}>
              <div className={`d-flex border-bottom lightGrey ${data?.find((e) => e?.DiscountAmt === 0) ? "border-top" : ""}`}>
                <div
                  className={`${style?.pad_1} fw-bold ${style?.total} text-center border-end d-flex align-items-center justify-content-center`}
                >
                  <p className="fw-bold">Total</p>
                </div>
                <div
                  className={` fw-bold ${style?.diamond} border-end d-flex flex-wrap`}
                >
                  <div className="d-flex w-100 ">
                    <div className={`col-2 border-end`}>
                      <p></p>
                    </div>
                    <div className={`col-2 text-end border-end`}>
                      <p></p>
                    </div>
                    <div
                      className={`col-2 text-end border-end d-flex align-items-center justify-content-end`}
                    >
                      <p className="">
                        {NumberWithCommas(total?.diamondTotal?.Wt, 2)}
                      </p>
                    </div>
                    <div
                      className={`col-2 text-end border-end d-flex align-items-center justify-content-end`}
                    >
                      <p className="">
                        {NumberWithCommas(total?.diamondTotal?.Pcs, 0)}
                      </p>
                    </div>
                    <div className={`col-2 text-end border-end`}>
                      <p></p>
                    </div>
                    <div
                      className={`col-2 text-end d-flex align-items-center justify-content-end`}
                    >
                      <p className="">
                        {NumberWithCommas(
                          total?.diamondTotal?.Amount /
                          json0Data?.CurrencyExchRate,
                          2
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={` fw-bold ${style?.metal} border-end d-flex flex-wrap`}
                >
                  <div className="d-flex w-100">
                    <div className={`${style?.wid_20} border-end`}>
                      <p></p>
                    </div>
                    <div
                      className={`${style?.wid_20} text-end border-end d-flex align-items-center justify-content-end`}
                    >
                      <p>{NumberWithCommas(total?.metalTotal?.grossWt, 3)}</p>
                    </div>
                    <div
                      className={`${style?.wid_20} text-end border-end d-flex align-items-center justify-content-end`}
                    >
                      <p>{NumberWithCommas(total?.netWtLoss, 3)}</p>
                    </div>
                    <div className={`${style?.wid_20} text-end border-end`}>
                      <p></p>
                    </div>
                    <div
                      className={`${style?.wid_20} text-end d-flex align-items-center justify-content-end`}
                    >
                      <p>
                        {NumberWithCommas(
                          total?.metalAmount / json0Data?.CurrencyExchRate,
                          2
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={` fw-bold ${style?.stone} border-end d-flex flex-wrap`}
                >
                  <div className="d-flex w-100">
                    <div className={`${style?.wid_20} border-end`}>
                      <p></p>
                    </div>
                    <div
                      className={`${style?.wid_20} text-end border-end d-flex align-items-center justify-content-end`}
                    >
                      <p>{misc ? NumberWithCommas(total?.colorStone?.Wt + total?.Misc?.Wt, 2) : NumberWithCommas(total?.colorStone?.Wt, 2)}</p>
                    </div>
                    <div
                      className={`${style?.wid_20} text-end border-end d-flex align-items-center justify-content-end`}
                    >
                      <p>{misc ? total?.colorStone?.Pcs + total?.Misc?.Pcs : total?.colorStone?.Pcs}</p>
                    </div>
                    <div
                      className={`${style?.wid_20} text-end border-end d-flex align-items-center justify-content-end`}
                    >
                      <p></p>
                    </div>
                    <div
                      className={`${style?.wid_20} text-end d-flex align-items-center justify-content-end`}
                    >
                      <p>
                        {misc ? NumberWithCommas(
                          total?.colorStone?.Amount + total?.Misc?.Amount /
                          json0Data?.CurrencyExchRate,
                          2
                        ) : NumberWithCommas(
                          total?.colorStone?.Amount /
                          json0Data?.CurrencyExchRate,
                          2
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={` fw-bold ${style?.labour} border-end d-flex flex-wrap`}
                >
                  <div className="d-flex w-100">
                    <div
                      className={`${style?.pad_1} col-6 text-end border-end`}
                    >
                      <p></p>
                    </div>
                    <div
                      className={`${style?.pad_1} col-6 text-end d-flex align-items-center justify-content-end`}
                    >
                      <p>
                        {NumberWithCommas(
                          (total?.MakingAmount +
                            total?.DiaSettignAmount +
                            total?.clrStoneSettignAmount) /
                          json0Data?.CurrencyExchRate,
                          2
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={` fw-bold ${style?.other} border-end d-flex flex-wrap`}
                >
                  <div className="d-flex w-100">
                    <div className={`${style?.pad_1} col-6 border-end`}>
                      <p></p>
                    </div>
                    <div
                      className={`${style?.pad_1} col-6 text-end d-flex align-items-center justify-content-end`}
                    >
                      <p>
                        {misc ? NumberWithCommas(
                          total?.otherAmount / json0Data?.CurrencyExchRate,
                          2
                        ) : NumberWithCommas(
                          total?.otherAmount + total?.Misc?.Amount / json0Data?.CurrencyExchRate,
                          2
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`${style?.pad_1} fw-bold ${style?.price} d-flex flex-wrap`}
                >
                  <div className="d-flex w-100">
                    <div
                      className={`${style?.pad_1} text-end w-100 d-flex align-items-center justify-content-end`}
                    >
                      <p>
                        {NumberWithCommas(
                          total?.TotalAmount / json0Data?.CurrencyExchRate,
                          2
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Taxes & Total */}
            <div className={`${style?.pbia_pcl3} d-flex border-start border-end border-bottom border-grey no_break ${style?.rowWisePad} ${style?.word_break}`}>
              <div className={`${style?.pad_1}  ${style?.discount} text-end `}>
                <p className="">Total Discount</p>
                {taxes?.map((e, i) => {
                  return (
                    <p className="" key={i}>
                      {e?.name} @ {e?.per}
                    </p>
                  );
                })}
                {json0Data?.AddLess !== 0 && (
                  <p className="">{json0Data?.AddLess > 0 ? "Add" : "Less"}</p>
                )}
                <p className="">Grand Total </p>
              </div>
              <div
                className={`${style?.pad_1} ${style?.price} d-flex flex-wrap`}
              >
                <div className="d-flex w-100">
                  <div className={`${style?.pad_1} text-end w-100`}>
                    <p>
                      {NumberWithCommas(
                        total?.DiscountAmt / json0Data?.CurrencyExchRate,
                        2
                      )}
                    </p>
                    {taxes?.map((e, i) => {
                      return (
                        <p className="" key={i}>
                          {NumberWithCommas(
                            +e?.amount / json0Data?.CurrencyExchRate,
                            2
                          )}
                        </p>
                      );
                    })}
                    {json0Data?.AddLess !== 0 && (
                      <p className="">
                        {NumberWithCommas(
                          json0Data?.AddLess / json0Data?.CurrencyExchRate,
                          2
                        )}
                      </p>
                    )}
                    <p>{NumberWithCommas(total?.amountAfterDiscount, 2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instruction */}
            {plainText && (
              <div className={`${style?.intru_qrC} mt-1 ${style?.pbia_pcl3}`}>
                <div className={`fw-bold ${style?.instruct}`}>Terms & Condition:</div>
                <div className={`${style?.tb_fs_pclsINS}`}
                  dangerouslySetInnerHTML={{
                    __html: json0Data?.Declaration,
                  }}
                ></div>
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
          {msg}
        </p>
      )}
    </>
  );
};

export default PackingList1S;
