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
  mergeMetals,
  mergeFindings, mergeFindingsIntoPrimaryMetal
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import style from "../../assets/css/prints/packingList1.module.css";
import { OrganizeDataPrint } from "./../../GlobalFunctions/OrganizeDataPrint";
import { OrganizeInvoicePrintData } from "../../GlobalFunctions/OrganizeInvoicePrintData";
import cloneDeep from "lodash/cloneDeep";


/* "10.00" / "1,250.50" -> number */
const parseAmt = (v) => Number(String(v ?? "").replace(/,/g, "")) || 0;

/* Rows shown in the "Other" column of ONE job.
   Every row carries a numeric `amount`, so the total is always the sum of
   exactly what is displayed. */

const getSettingAmount = (e, exRate) =>
  ((e?.totals?.diamonds?.SettingAmount || 0) + (e?.totals?.colorstone?.SettingAmount || 0)) / exRate;


const getFindingLabourAmount = (e, exRate) =>
  ((e?.totals?.finding?.SettingAmount || 0)) / exRate;



const getOtherRows = (e, exRate) => {
  const rows = [];

  // other details (value already formatted, e.g. "10.00")
  (e?.other_details_array ?? e?.other_details ?? []).forEach((ele) => {
    rows.push({ label: ele?.label, value: ele?.value, amount: parseAmt(ele?.value) });
  });

  // misc (non-zero only)
  (e?.misc ?? [])
    .filter((ele) => ele?.Amount && ele?.Amount !== 0)
    .forEach((ele) => {
      const amount = (Number(ele?.Amount) || 0) / exRate;
      rows.push({ label: ele?.ShapeName, value: NumberWithCommas(amount, 2), amount });
    });

  // Setting (diamond + colorstone)
  // const setting =
  //   ((e?.totals?.diamonds?.SettingAmount || 0) + (e?.totals?.colorstone?.SettingAmount || 0)) / exRate;
  // if (setting !== 0) rows.push({ label: "Setting", value: NumberWithCommas(setting, 2), amount: setting });

  // Labour (finding setting)
  // const labour = (e?.totals?.finding?.SettingAmount || 0) / exRate;
  // if (labour !== 0) rows.push({ label: "Labour", value: NumberWithCommas(labour, 2), amount: labour });

  // Handling
  const handling = (e?.TotalDiamondHandling || 0) / exRate;
  if (handling !== 0) rows.push({ label: "Handling", value: NumberWithCommas(handling, 2), amount: handling });

  return rows;
};

const PackingList1 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
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

  const loadData = (data) => {
    let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    data.BillPrint_Json[0].address = address;
    const datas = OrganizeInvoicePrintData(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );

    datas?.resultArray?.forEach((e) => {
      let dia = [];
      e?.diamonds?.forEach((el) => {
        let obj = cloneDeep(el);
        let findrec = dia?.findIndex((a) => a?.ShapeName === el?.ShapeName && a?.SizeName === el?.SizeName && a?.QualityName === el?.QualityName && a?.Colorname === el?.Colorname && a?.Rate === el?.Rate)
        if (findrec === -1) {
          dia.push(obj)
        } else {
          dia[findrec].Wt += obj?.Wt;
          dia[findrec].Pcs += obj?.Pcs;
          dia[findrec].Amount += obj?.Amount;
        }
      })
      e.diamonds = dia;

      let clr = [];
      e?.colorstone?.forEach((el) => {
        let obj = cloneDeep(el);
        let findrec = clr?.findIndex((a) => a?.ShapeName === el?.ShapeName && a?.SizeName === el?.SizeName && a?.QualityName === el?.QualityName && a?.Colorname === el?.Colorname && a?.Rate === el?.Rate)
        if (findrec === -1) {
          clr.push(obj)
        } else {
          clr[findrec].Wt += obj?.Wt;
          clr[findrec].Pcs += obj?.Pcs;
          clr[findrec].Amount += obj?.Amount;
        }
      })
      e.colorstone = clr;

    })

    let finalArr = [];
    datas?.resultArray?.forEach((e) => {
      let obj = { ...e };
      let discountOn = [];
      if (e?.IsCriteriabasedAmount === 1) {
        if (e?.IsMetalAmount === 1) {
          discountOn.push('Metal')
        }
        if (e?.IsDiamondAmount === 1) {
          discountOn.push('Diamond')
        }
        if (e?.IsStoneAmount === 1) {
          discountOn.push('Stone')
        }
        if (e?.IsMiscAmount === 1) {
          discountOn.push('Misc')
        }
        if (e?.IsLabourAmount === 1) {
          discountOn.push('Labour')
        }
        if (e?.IsSolitaireAmount === 1) {
          discountOn.push('Solitaire')
        }
      } else {
        if (e?.Discount !== 0) {
          discountOn.push('Total Amount')
        }
      }

      obj.discountOn = discountOn;
      obj.str_discountOn = discountOn?.join(', ');
      obj.str_discountOn = obj?.str_discountOn + " Amount";

      finalArr.push(obj);
    })
    datas.resultArray = finalArr;

    datas.resultArray?.sort((a, b) => {
      // First, compare based on Categoryname
      if (a.Categoryname < b.Categoryname) return -1;
      if (a.Categoryname > b.Categoryname) return 1;

      // If Categoryname is the same, compare based on SrJobno
      if (a.SrJobno < b.SrJobno) return -1;
      if (a.SrJobno > b.SrJobno) return 1;

      // If both Categoryname and SrJobno are the same, return 0
      return 0;
    });
    const json0 = data?.BillPrint_Json[0];
    const exchangerate = json0?.CurrencyExchRate || 1;

    let TotalAmount = 0;
    let DiscountAmt = 0;
    let MakingAmount = 0;
    let otherAmount = 0;

    datas?.resultArray?.forEach((e) => {
      TotalAmount += e?.TotalAmount || 0;
      DiscountAmt += e?.DiscountAmt || 0;
      MakingAmount += e?.MakingAmount || 0;
      otherAmount += (e?.OtherCharges || 0) + (e?.TotalDiamondHandling || 0);
    });

    const taxValue = taxGenrator(json0, TotalAmount);

    const taxess =
      taxValue?.reduce((acc, cObj) => acc + +cObj?.amount / exchangerate, 0) +
      json0?.AddLess / exchangerate;

    setTotal((prev) => ({
      ...prev,
      TotalAmount,
      DiscountAmt,
      MakingAmount,
      otherAmount,
      amountAfterDiscount: TotalAmount / exchangerate + taxess,
    }));

    setTaxes(taxValue);
    setData(datas);
    setLoader(false);
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

  // console.log("data", data);

  const discountCriteria = [
    { key: 'DiamondDiscount', isAmountKey: 'IsDiamondDiscInAmount', label: 'Diamond', disAmount: "DiamondDiscountAmount" },
    { key: 'MetalDiscount', isAmountKey: 'IsMetalDiscInAmount', label: 'Metal', disAmount: "MetalDiscountAmount" },
    { key: 'StoneDiscount', isAmountKey: 'IsStoneDiscInAmount', label: 'Colorstone', disAmount: "StoneDiscountAmount" },
    { key: 'LabourDiscount', isAmountKey: 'IsLabourDiscInAmount', label: 'Labour', disAmount: "LabourDiscountAmount" },
    { key: 'SolitaireDiscount', isAmountKey: 'IsSolitaireDiscInAmount', label: 'Solitaire', disAmount: "SolitaireDiscountAmount1" },
    { key: 'MiscDiscount', isAmountKey: 'IsMiscDiscInAmount', label: 'Misc', disAmount: "MiscDiscountAmount" },
  ];




  console.log("TCL: data", data)

  console.log("TCL: total", total)

  const totalMiscAmount = data?.resultArray?.reduce((sum, e) => {
    return sum +
      (e?.totals?.misc?.isHSCODE123_amt || 0)

  }, 0) || 0;


  console.log("TCL:totalMiscAmount ", totalMiscAmount)

  // grand totals built from the per-job rows (same formulas as each job's grey total row)
  const grandExRate = data?.header?.CurrencyExchRate || 1;

  const totalLabourAll =
    data?.resultArray?.reduce(
      (sum, e) =>
        sum +
        ((Number(e?.MakingAmount) || 0) +
          (Number(e?.TotalCsSetcost) || 0) +
          (Number(e?.totals?.finding?.SettingAmount) || 0) +
          (Number(e?.TotalDiaSetcost) || 0)) / grandExRate,
      // / grandExRate,
      0
    ) || 0;

  const totalPriceAll =
    data?.resultArray?.reduce(
      (sum, e) => sum + (Number(e?.UnitCost) || 0) / grandExRate,
      0
    ) || 0;

  // grand total of the "Other" column = sum of every job's displayed rows
  const totalOtherAll =
    data?.resultArray?.reduce(
      (sum, e) =>
        sum +
        getOtherRows(e, data?.header?.CurrencyExchRate || 1).reduce((s, r) => s + r.amount, 0),
      0
    ) || 0;

  /* Labour rows for ONE job, grouped by rate.
 Making + diamond setting + colorstone setting + finding setting.
 Same rate  -> amounts are merged into one row.
 Different rate -> separate row. */
  const getLabourRows = (e, exRate) => {
    const map = new Map();

    const add = (rate, amount) => {
      const r = Number(rate) || 0;
      const a = Number(amount) || 0;
      if (r === 0 && a === 0) return;
      const key = r.toFixed(2);
      const prev = map.get(key);
      map.set(key, { rate: r, amount: (prev?.amount || 0) + a });
    };

    // making
    add(e?.MaKingCharge_Unit, e?.MakingAmount);

    // setting from diamonds, colorstone and finding (each has SettingRate / SettingAmount)
    e?.diamonds?.forEach((el) => add(el?.SettingRate, el?.SettingAmount));
    e?.colorstone?.forEach((el) => add(el?.SettingRate, el?.SettingAmount));
    e?.finding?.forEach((el) => add(el?.SettingRate, el?.SettingAmount));

    return [...map.values()].map((r) => ({
      rate: r.rate,
      amount: r.amount / exRate,
    }));
  };

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
            <div className="printBtn_sec d-flex justify-content-end align-items-center  pt-4 d_none_pcl1">
              <div className="mx-3 d-flex align-items-center">
                <input
                  type="checkbox"
                  value={diaQlty}
                  onChange={() => checkDiaQlty()}
                  id="diaqlty"
                />
                <label
                  htmlFor="diaqlty"
                  className="mx-2 user-select-none fspcl"
                >
                  Diamond Quality
                </label>
              </div>
              <div className={`printBtn_sec text-end  `}>
                <input
                  type="button"
                  className="btn_white blue"
                  style={{ fontSize: "12px" }}
                  value="Print"
                  onClick={(e) => handlePrint(e)}
                />
              </div>
            </div>

            {/* Print Logo */}
            <div className="pt-2">
              {isImageWorking && data?.header?.PrintLogo !== "" && (
                <img
                  src={data?.header?.PrintLogo}
                  alt=""
                  className="w-100 h-auto ms-auto d-block object-fit-contain mx-auto"
                  onError={handleImageErrors}
                  height={120}
                  width={150}
                  style={{ maxWidth: "108px" }}
                />
              )}
              {/* <img src={data?.header?.PrintLogo} alt="" className={`logoimg  d-block mx-auto`} /> */}
              <p
                className={`text-center pt-1 fw-bold ${style?.font_12} ${style?.packinhList1_top_line}`}
              >
                {data?.header?.CompanyAddress} {data?.header?.CompanyAddress2}{" "}
                {data?.header?.CompanyCity} - {data?.header?.CompanyPinCode}
              </p>
              {data?.header?.PrintHeadLabel !== "" && (
                <p
                  className={`fw-bold text-center pt-1 pb-2  `}
                  style={{ fontSize: "17px" }}
                >
                  {data?.header?.PrintHeadLabel}
                </p>
              )}
              {data?.header?.PrintRemark !== "" && (
                <p
                  className={`fw-bold text-center ${style?.font_11}`}
                  dangerouslySetInnerHTML={{ __html: data?.header?.PrintRemark }}
                ></p>
              )}
            </div>

            {/* Party */}
            <div
              className={`pt-4 d-flex justify-content-between align-items-between`}
            >
              <div className={`col-6 ${style?.font_14}`}>
                <p className={``}>
                  <span className="fw-bold">Party:</span>{" "}
                  {data?.header?.customerfirmname}
                </p>
              </div>
              <div
                className={`text-end ${style?.font_11}`}
                style={{ width: "180px", minWidth: "180px" }}
              >
                <div className="d-flex justify-content-end pb-1">
                  <p className={`${style?.font_11}`} style={{ width: "90px" }}>Invoice No :</p>
                  <p className={`${style?.font_11} text-end fw-bold`} style={{ width: "70px" }}>
                    {data?.header?.InvoiceNo}
                  </p>
                </div>
                <div className="d-flex justify-content-end pb-2">
                  <p className={`${style?.font_11}`} style={{ width: "90px" }}>Date :</p>
                  <p className={`${style?.font_11} text-end fw-bold`} style={{ width: "70px" }}>
                    {data?.header?.EntryDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Table Header */}
            <div
              className={`border-black border-start border-end border-top mb-1 no_break ${style?.rowWisePad} ${style?.rowHeader} ${style?.word_break}`}
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
                      <p className={`${style?.dia_shape} text-center border-end `}>Shape</p>
                      <p className={`${style?.dia_size}  border-end text-center `}>Size</p>
                      <p className={`${style?.dia_wt}  border-end text-center `}>Wt</p>
                      <p className={`${style?.dia_pcs}  border-end text-center `}>Pcs</p>
                      <p className={`${style?.dia_rate}  border-end text-center `}>Rate</p>
                      <p className={`${style?.dia_amt} text-center`}>Amount</p>
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
                        {data?.resultArray?.find((e) => e?.LossWt !== 0) ? "N + L" : "Net Wt"}
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
                      Stone
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
            {data?.resultArray?.length > 0 &&
              data?.resultArray?.map((e, i) => {
                const exRate = data?.header?.CurrencyExchRate || 1;

                /* ---------- OTHER column data ---------- */
                const otherRows = getOtherRows(e, exRate);
                const otherTotal = otherRows.reduce((sum, r) => sum + r.amount, 0);

                const discountDisplay = discountCriteria
                  .filter(({ key }) => e?.[key] > 0)
                  .map(({ key, isAmountKey, label, disAmount }) => {
                    const num = Number(e[key]);
                    const am = Number(e[disAmount])
                    const decimals = e[isAmountKey] === 1 ? 3 : 2;
                    const val = num.toFixed(decimals);
                    return e[isAmountKey] === 0 ? `${val}% @${label} Amount ` : `${val} @${label} Amount`;
                  })
                  .join(', ');

                const mergedMetals = mergeMetals(e?.metal);
                const mergedFindings = mergeFindings(e?.finding);

                const { findings: finalFindings, metals: finalMetals } =
                  mergeFindingsIntoPrimaryMetal(mergedFindings, mergedMetals, false);
                return (
                  <div
                    key={i}
                    className={`border-top no_break ${style?.rowWisePad} ${style?.word_break}`}
                  >
                    <div className="border-start border-end border-black">
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
                              className={`${style?.dia_shape} border-end pb-3 position-relative h-100`}
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
                              className={`${style?.dia_size} border-end pb-3 position-relative h-100`}
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
                              className={`${style?.dia_wt} text-end border-end pb-3 position-relative h-100`}
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
                              className={`${style?.dia_pcs} text-end border-end pb-3 position-relative h-100 `}
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
                              className={`${style?.dia_rate} text-end border-end pb-3 position-relative h-100`}
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
                              className={`${style?.dia_amt} text-end pb-3 position-relative h-100`}
                            >
                              {e?.diamonds.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(
                                      el?.Amount / data?.header?.CurrencyExchRate,
                                      2
                                    )}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Metal */}
                        {/* <div
                          className={` ${style?.metal} border-end d-flex flex-wrap`}
                        >
                          <div
                            className={`d-flex w-100 ${
                              e?.JobRemark !== "" && "border-bottom"
                            }`}
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
                                          data?.header?.CurrencyExchRate,
                                        2
                                      )}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                          {e?.JobRemark !== "" && (
                            <div>
                              <p>Remark:</p>
                              <p className="fw-bold">{e?.JobRemark}</p>
                            </div>
                          )}
                        </div> */}
                        <div className={`${style?.metal} border-end d-flex flex-wrap`}>
                          {finalMetals.map((el, indd) => (
                            <div
                              key={indd}
                              className={`d-flex w-100 ${e?.JobRemark !== "" ? "border-bottom" : ""
                                }`}
                            >

                              <div
                                className={`${style?.wid_20} border-end ${style?.no_word_break}`}
                              >
                                <p>  {`${el?.ShapeName || ''} ${el?.QualityName || ''}`}</p>
                              </div>

                              <div className={`${style?.wid_20} text-end border-end`}>
                                <p>{el?.IsPrimaryMetal === 1 ? NumberWithCommas(e?.grosswt, 3) : ""}</p>
                              </div>

                              <div className={`${style?.wid_20} text-end border-end`}>
                                <p>{NumberWithCommas(el?.Weight, 3)}</p>
                              </div>

                              <div className={`${style?.wid_20} text-end border-end`}>
                                <p>{NumberWithCommas(el?.Rate, 2)}</p>
                              </div>

                              <div className={`${style?.wid_20} text-end`}>
                                <p>
                                  {
                                    NumberWithCommas(
                                      el?.Amount / data?.header?.CurrencyExchRate,
                                      2
                                    )
                                  }
                                </p>
                              </div>

                            </div>
                          ))}

                          {finalFindings?.length > 0 && (
                            finalFindings.map((el, indd) => (
                              <div
                                key={indd}
                                className={`d-flex w-100 ${e?.JobRemark !== "" ? "border-bottom" : ""
                                  }`}
                              >

                                <div
                                  className={`${style?.wid_20} border-end ${style?.no_word_break}`}
                                >
                                  <p> {e?.GroupJob !== '' ? "FINDING ACCESSORIES" : el?.FindingTypename + " " + el?.QualityName}</p>
                                </div>

                                <div className={`${style?.wid_20} text-end border-end`}>
                                  <p> </p>
                                </div>

                                <div className={`${style?.wid_20} text-end border-end`}>
                                  <p>{NumberWithCommas(el?.Wt, 3)}</p>
                                </div>

                                <div className={`${style?.wid_20} text-end border-end`}>
                                  <p>{NumberWithCommas(el?.Rate, 2)}</p>
                                </div>

                                <div className={`${style?.wid_20} text-end`}>
                                  <p>
                                    {NumberWithCommas(
                                      el?.Amount / data?.header?.CurrencyExchRate,
                                      2
                                    )
                                    }
                                  </p>
                                </div>

                              </div>
                            ))

                          )}



                          {e?.JobRemark !== "" && (
                            <div>
                              <p>Remark:</p>
                              <p className="fw-bold">{e?.JobRemark}</p>
                            </div>
                          )}
                        </div>

                        {/* Stone */}
                        <div
                          className={` ${style?.stone} border-end d-flex flex-wrap`}
                        >
                          <div className="d-flex w-100">
                            <div
                              className={`${style?.wid_20} border-end position-relative h-100 pb-3`}
                            >
                              {e?.colorstone.map((el, indd) => {
                                return <p key={indd}>{el?.ShapeName}</p>;
                              })}
                            </div>
                            <div
                              className={`${style?.wid_20} text-end border-end position-relative h-100 pb-3`}
                            >
                              {e?.colorstone.map((el, indd) => {
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
                              {e?.colorstone.map((el, indd) => {
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
                              {e?.colorstone.map((el, indd) => {
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
                              {e?.colorstone.map((el, indd) => {
                                return (
                                  <p key={indd}>
                                    {NumberWithCommas(
                                      el?.Amount / data?.header?.CurrencyExchRate,
                                      2
                                    )}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Labour */}
                        {/* Labour */}
                        {/* <div className={` ${style?.labour} border-end d-flex flex-wrap`}>
                          <div className="d-flex w-100">
                            <div className={`col-6 text-end border-end position-relative h-100 pb-3`}>
                              <p>{NumberWithCommas(e?.MaKingCharge_Unit, 2)}</p>

                            </div>
                            <div className={` col-6 text-end position-relative h-100 pb-3`}>
                              <p>
                                <p>
                                  {e?.MakingAmount !== 0 && e?.MakingAmount
                                    ? NumberWithCommas(e?.MakingAmount + getSettingAmount(e, exRate) + getFindingLabourAmount(e, exRate), 2)
                                    : '\u00A0'}
                                </p>
                              </p>

                            </div>
                          </div>
                        </div> */}
                        {/* Labour */}
                        {(() => {
                          const labourRows = getLabourRows(e, exRate);
                          return (
                            <div className={` ${style?.labour} border-end d-flex flex-wrap`}>
                              <div className="d-flex w-100">
                                <div className="col-6 text-end border-end position-relative h-100 pb-3">
                                  {labourRows.length > 0
                                    ? labourRows.map((r, idx) => (
                                      <p key={idx}>{NumberWithCommas(r.rate, 2)}</p>
                                    ))
                                    : <p>&nbsp;</p>}
                                </div>
                                <div className="col-6 text-end position-relative h-100 pb-3">
                                  {labourRows.length > 0
                                    ? labourRows.map((r, idx) => (
                                      <p key={idx}>{NumberWithCommas(r.amount, 2)}</p>
                                    ))
                                    : <p>&nbsp;</p>}
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Other */}
                        <div className={` ${style?.other} border-end d-flex flex-wrap`}>
                          <div
                            className="w-100 pb-3"
                            style={{
                              backgroundImage:
                                "linear-gradient(var(--bs-border-color, #dee2e6), var(--bs-border-color, #dee2e6))",
                              backgroundSize: "1px 100%",
                              backgroundPosition: "50% 0",
                              backgroundRepeat: "no-repeat",
                            }}
                          >
                            {otherRows.map((r, idx) => (
                              <div className="d-flex w-100" key={idx}>
                                {/* label */}
                                <div className={` col-6 position-relative`}>
                                  <p className="text-break pdl_pcls">{r.label}</p>
                                </div>
                                {/* value */}
                                <div className={` col-6 text-end position-relative`}>
                                  <p className="pdr_pcls">{r.value}</p>
                                </div>
                              </div>
                            ))}
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
                                  e?.UnitCost / data?.header?.CurrencyExchRate,
                                  2
                                )}{" "}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-start border-end border-black">
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
                            <div className={`${style?.dia_shape} border-end `}>
                              <p className={`w-100 border-top  fw-bold`}></p>
                            </div>
                            <div className={`${style?.dia_size} border-end `}>
                              <p className={`w-100 border-top  fw-bold`}></p>
                            </div>
                            <div className={`${style?.dia_wt} text-end border-end `}>
                              <p className={`w-100 border-top  fw-bold`}>
                                {e?.totals?.diamonds.Wt !== 0 &&
                                  NumberWithCommas(
                                    e?.totals?.diamonds.Wt,
                                    3
                                  )}
                              </p>
                            </div>
                            <div className={`${style?.dia_pcs} text-end border-end  `}>
                              <p className={`w-100 border-top  fw-bold`}>
                                {e?.totals?.diamonds.Pcs !== 0 &&
                                  NumberWithCommas(
                                    e?.totals?.diamonds.Pcs,
                                    0
                                  )}
                              </p>
                            </div>
                            <div className={`${style?.dia_rate} text-end border-end `}>
                              <p className={`w-100 border-top  fw-bold`}></p>
                            </div>
                            <div className={`${style?.dia_amt} text-end `}>
                              <p className={`w-100 border-top  fw-bold`}>
                                {e?.totals?.diamonds.Amount !== 0 &&
                                  NumberWithCommas(
                                    e?.totals?.diamonds.Amount /
                                    data?.header?.CurrencyExchRate,
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
                                {e?.grosswt !== 0 &&
                                  NumberWithCommas(
                                    e?.grosswt,
                                    3
                                  )}
                              </p>
                            </div>
                            <div
                              className={`${style?.wid_20} text-end border-end`}
                            >
                              <p className={`fw-bold w-100 border-top  `}>
                                {
                                  NumberWithCommas(e?.totals?.metal?.Weight + e?.totals?.finding?.Wt, 3)}
                              </p>
                            </div>
                            <div
                              className={`${style?.wid_20} text-end border-end`}
                            >
                              <p className={`fw-bold w-100 border-top  `}></p>
                            </div>
                            {console.log("e?.rowWiseMetalTotal", e?.rowWiseMetalTotal)}
                            <div className={`${style?.wid_20} text-end`}>
                              <p className={`fw-bold w-100 border-top  `}>
                                {e?.totals?.metal.Amount !== 0 &&
                                  NumberWithCommas(
                                    (e?.totals?.metal.Amount + e?.totals?.finding?.Amount) /
                                    data?.header?.CurrencyExchRate,
                                    2
                                  )}
                              </p>
                            </div>
                          </div>
                        </div>
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
                                {e?.totals?.colorstone.Wt !== 0 &&
                                  NumberWithCommas(
                                    e?.totals?.colorstone.Wt,
                                    2
                                  )}
                              </p>
                            </div>
                            <div
                              className={`${style?.wid_20} text-end border-end `}
                            >
                              <p className={`fw-bold w-100 border-top `}>
                                {e?.totals?.colorstone.Pcs !== 0 &&
                                  NumberWithCommas(
                                    e?.totals?.colorstone.Pcs,
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
                                {e?.totals?.colorstone.Amount !== 0 &&
                                  NumberWithCommas(
                                    e?.totals?.colorstone.Amount /
                                    data?.header?.CurrencyExchRate,
                                    2
                                  )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div
                          className={` lightGrey ${style?.labour} border-end d-flex flex-wrap`}
                        >
                          <div className="d-flex w-100">
                            <div className={`col-6 text-end border-end `}>
                              <p className={`fw-bold w-100 border-top`}></p>
                            </div>
                            <div className={` col-6 text-end`}>
                              <p className={`fw-bold w-100 border-top`}>

                                {/* {console.log("TCL:e?.MakingAmount + e?.TotalCsSetcost + e?.TotalDiaSetcost ", e?.MakingAmount , e?.TotalCsSetcost , e?.TotalDiaSetcost)} */}
                                {
                                  ((e?.MakingAmount + e?.TotalCsSetcost + e?.TotalDiaSetcost) === 0 ? <div>&nbsp;</div> : (e?.MakingAmount + e?.TotalCsSetcost + e?.TotalDiaSetcost + e?.totals?.finding?.SettingAmount) !== 0 && NumberWithCommas(((e?.MakingAmount + e?.TotalCsSetcost + e?.TotalDiaSetcost + e?.totals?.finding?.SettingAmount) / (data?.header?.CurrencyExchRate)), 2))
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Other — per-job total */}
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
                                {otherTotal !== 0 ? NumberWithCommas(otherTotal, 2) : <span>&nbsp;</span>}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div
                          className={` lightGrey fw-bold ${style?.price} d-flex flex-wrap`}
                        >
                          <div className="d-flex w-100">
                            <div className={`text-end w-100`}>
                              <p className={`w-100 border-top  fw-bold`}>
                                {NumberWithCommas(
                                  e?.UnitCost / data?.header?.CurrencyExchRate,
                                  2
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                    {/* Per Job Discount Row */}
                    {e?.DiscountAmt !== 0 && (
                      <div className="border-start border-end border-black">
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
                              <div className={`${style?.dia_shape}  h-100`}>
                                <p></p>
                              </div>
                              <div className={`${style?.dia_size}  h-100`}>
                                <p></p>
                              </div>
                              <div className={`${style?.dia_wt} text-end  h-100`}>
                                <p></p>
                              </div>
                              <div className={`${style?.dia_pcs} text-end  h-100 `}>
                                <p></p>
                              </div>
                              <div
                                className={`${style?.dia_rate} text-end border-end  h-100`}
                              >
                                <p className={``}></p>
                              </div>
                              <div className={`${style?.dia_amt} text-end  h-100`}>
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
                                e?.DiscountAmt / data?.header?.CurrencyExchRate,
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
                                    data?.header?.CurrencyExchRate,
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
            <div
              className={`border-start border-end border-black no_break ${style?.rowWisePad} ${style?.word_break}`}
            >
              <div className="d-flex  border-bottom border-top  lightGrey">
                <div
                  className={`${style?.pad_1} fw-bold ${style?.total} text-center border-end d-flex align-items-center justify-content-center`}
                >
                  <p className="fw-bold">Total</p>
                </div>
                <div
                  className={` fw-bold ${style?.diamond} border-end d-flex flex-wrap`}
                >
                  <div className="d-flex w-100 ">
                    <div className={`${style?.dia_shape} border-end`}>
                      <p></p>
                    </div>
                    <div className={`${style?.dia_size} text-end border-end`}>
                      <p></p>
                    </div>
                    <div
                      className={`${style?.dia_wt} text-end border-end d-flex align-items-center justify-content-end`}
                    >
                      <p className="">
                        {NumberWithCommas(data?.mainTotal?.diamonds?.Wt, 2)}
                      </p>
                    </div>
                    <div
                      className={`${style?.dia_pcs} text-end border-end d-flex align-items-center justify-content-end`}
                    >
                      <p className="">
                        {NumberWithCommas(data?.mainTotal?.diamonds?.Pcs, 0)}
                      </p>
                    </div>
                    <div className={`${style?.dia_rate} text-end border-end`}>
                      <p></p>
                    </div>
                    <div
                      className={`${style?.dia_amt} text-end d-flex align-items-center justify-content-end`}
                    >
                      <p className="">
                        {NumberWithCommas(
                          data?.mainTotal?.diamonds?.Amount /
                          data?.header?.CurrencyExchRate,
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
                      <p>{NumberWithCommas(data?.mainTotal?.grosswt, 3)}</p>
                    </div>
                    <div
                      className={`${style?.wid_20} text-end border-end d-flex align-items-center justify-content-end`}
                    >
                      <p>{NumberWithCommas(data?.mainTotal?.metal?.Weight + data?.mainTotal?.finding?.Wt, 3)}</p>
                    </div>
                    <div className={`${style?.wid_20} text-end border-end`}>
                      <p></p>
                    </div>
                    <div
                      className={`${style?.wid_20} text-end d-flex align-items-center justify-content-end`}
                    >
                      <p>
                        {NumberWithCommas(
                          data?.mainTotal?.metal?.Amount + (data?.mainTotal?.finding?.Amount) / data?.header?.CurrencyExchRate,
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
                      <p>{NumberWithCommas(data?.mainTotal?.colorstone?.Wt, 2)}</p>
                    </div>
                    <div
                      className={`${style?.wid_20} text-end border-end d-flex align-items-center justify-content-end`}
                    >
                      <p>{NumberWithCommas(data?.mainTotal?.colorstone?.Pcs, 0)}</p>
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
                        {NumberWithCommas(
                          data?.mainTotal?.colorstone?.Amount /
                          data?.header?.CurrencyExchRate,
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
                        {NumberWithCommas(totalLabourAll, 2)}
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
                        {NumberWithCommas(totalOtherAll, 2)}
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
                        {NumberWithCommas(totalPriceAll, 2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Taxes & Total */}
            <div
              className={`d-flex border-start border-end border-bottom border-black no_break ${style?.rowWisePad} ${style?.word_break}`}
            >
              <div className={`${style?.pad_1}  ${style?.discount} text-end `}>
                <p className="">Total Discount</p>
                {taxes?.map((e, i) => {
                  return (
                    <p className="" key={i}>
                      {e?.name} @ {e?.per}
                    </p>
                  );
                })}
                {data?.header?.AddLess !== 0 && (
                  <p className="">{data?.header?.AddLess > 0 ? "Add" : "Less"}</p>
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
                        total?.DiscountAmt / data?.header?.CurrencyExchRate,
                        2
                      )}
                    </p>
                    {taxes?.map((e, i) => {
                      return (
                        <p className="" key={i}>
                          {NumberWithCommas(
                            +e?.amount / data?.header?.CurrencyExchRate,
                            2
                          )}
                        </p>
                      );
                    })}
                    {data?.header?.AddLess !== 0 && (
                      <p className="">
                        {NumberWithCommas(
                          data?.header?.AddLess / data?.header?.CurrencyExchRate,
                          2
                        )}
                      </p>
                    )}
                    <p>{NumberWithCommas(total?.amountAfterDiscount, 2)}</p>
                  </div>
                </div>
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
  );
};

export default PackingList1;