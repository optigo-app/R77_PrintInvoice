import React, { useEffect, useState } from "react";
import "../../assets/css/prints/packinglist.css";
import Button from "../../GlobalFunctions/Button";
import Loader from "../../components/Loader";
import {
  apiCall,
  checkMsg,
  formatAmount,
  handleImageError,
  isObjectEmpty,
  NumberWithCommas,
  mergeMetals,
  mergeFindings,mergeFindingsIntoPrimaryMetal
} from "../../GlobalFunctions";
import { OrganizeDataPrint } from "./../../GlobalFunctions/OrganizeDataPrint";
import cloneDeep from "lodash/cloneDeep";

/* "10.00" / "1,250.50" -> number */
const parseAmt = (v) => Number(String(v ?? "").replace(/,/g, "")) || 0;

/* Rows shown in the "Other" column of ONE job.
   Every row carries a numeric `amount`, so the total is always the sum of
   exactly what is displayed. */
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

  // Handling
  const handling = (e?.TotalDiamondHandling || 0) / exRate;
  if (handling !== 0) rows.push({ label: "Handling", value: NumberWithCommas(handling, 2), amount: handling });

  return rows;
};

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

const PackingList = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  const [headerData, setHeaderData] = useState({});
  const [dynamicList1, setDynamicList1] = useState([]);
  const [dynamicList2, setDynamicList2] = useState([]);
  const [mainTotal, setMainTotal] = useState({});
  const [result, setResult] = useState(null);
  const [totalgrosswt, setTotalgrosswt] = useState(0);
  const [totalnetlosswt, setTotalnetlosswt] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [totalLabourAmount, setTotalLabourAmount] = useState(0);
  const [totalOtherAmount, setTotalOtherAmount] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [responsejson, setResponsejson] = useState("");
  const [taxtotal, setTaxTotal] = useState([]);
  const [grandtot, setGrandTot] = useState([]);
  const [misc_other, setMisc_Other] = useState([]);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);

  const [isImageWorking, setIsImageWorking] = useState(true);

  const [diaQlty, setDiaQlty] = useState(false);
  const [grosswt2dec, setGrosswt2dec] = useState(false);

  const handleImageErrors = () => {
    setIsImageWorking(false);
  };

  useEffect(() => {
    const sendData = async () => {
      try {
        const data = await apiCall(token, invoiceNo, printName, urls, evn, ApiVer);
        if (data?.Status === "200") {
          let isEmpty = isObjectEmpty(data?.Data);
          if (!isEmpty) {
            loadData(data?.Data);
            setResponsejson(data?.Data);
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

  const loadData = (data) => {
    let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    data.BillPrint_Json[0].address = address;
    const datas = OrganizeDataPrint(
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

    setResult(datas);
    setLoader(false);
  };

  const checkDiaQlty = () => {
    if (diaQlty) {
      setDiaQlty(false);
    } else {
      setDiaQlty(true);
    }
  }
  const checkGrosswt2dec = () => {
    if (grosswt2dec) {
      setGrosswt2dec(false);
    } else {
      setGrosswt2dec(true);
    }
  }

  const discountCriteria = [
    { key: 'DiamondDiscount', isAmountKey: 'IsDiamondDiscInAmount', label: 'Diamond', disAmount: "DiamondDiscountAmount" },
    { key: 'MetalDiscount', isAmountKey: 'IsMetalDiscInAmount', label: 'Metal', disAmount: "MetalDiscountAmount" },
    { key: 'StoneDiscount', isAmountKey: 'IsStoneDiscInAmount', label: 'Colorstone', disAmount: "StoneDiscountAmount" },
    { key: 'LabourDiscount', isAmountKey: 'IsLabourDiscInAmount', label: 'Labour', disAmount: "LabourDiscountAmount" },
    { key: 'SolitaireDiscount', isAmountKey: 'IsSolitaireDiscInAmount', label: 'Solitaire', disAmount: "SolitaireDiscountAmount1" },
    { key: 'MiscDiscount', isAmountKey: 'IsMiscDiscInAmount', label: 'Misc', disAmount: "MiscDiscountAmount" },
  ];

  // grand totals of Labour / Other columns = sum of every job's displayed rows
  const grandExRate = result?.header?.CurrencyExchRate || 1;

  const totalLabourAll =
    result?.resultArray?.reduce(
      (sum, e) =>
        sum + getLabourRows(e, grandExRate).reduce((s, r) => s + r.amount, 0),
      0
    ) || 0;

  const totalOtherAll =
    result?.resultArray?.reduce(
      (sum, e) =>
        sum + getOtherRows(e, grandExRate).reduce((s, r) => s + r.amount, 0),
      0
    ) || 0;

  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          {msg === "" ? (
            <>
              <div className="btnpcl">
                <div className="mx-3 d-flex align-items-center">
                  <input type="checkbox" value={diaQlty} onChange={() => checkDiaQlty()} id="diaqlty" />
                  <label htmlFor="diaqlty" className="mx-2 user-select-none fspcl">Diamond Quality </label>
                </div>
                <div className="mx-3 d-flex align-items-center">
                  <input type="checkbox" value={grosswt2dec} onChange={() => checkGrosswt2dec()} id="grosswt2dec" />
                  <label htmlFor="grosswt2dec" className="mx-2 user-select-none fspcl">Gr. Wt. 2 decimals </label>
                </div>
                <Button />
              </div>
              <div className="pclprint pad_60_allPrint">
                <div className="pclheader">
                  <div className="orailpcl">
                    {isImageWorking && (result?.header?.PrintLogo !== "" && <img src={result?.header?.PrintLogo} alt="" className='w-100 h-auto ms-auto d-block object-fit-contain' onError={handleImageErrors} height={120} width={150} style={{ maxWidth: "100px" }} />)}
                  </div>
                  <div className="addresspcl fspcl">
                    {result?.header?.CompanyAddress}{" "}
                    {result?.header?.CompanyAddress2}{" "}
                    {result?.header?.CompanyCity} -{" "}
                    {result?.header?.CompanyPinCode}{" "}
                  </div>
                  <div className="pclheaderplist mb_5_pcl fs_head_pcl">
                    {result?.header?.PrintHeadLabel}
                  </div>
                  {
                    result?.header?.PrintRemark === '' ? '' :
                      <div className="d-flex fw-bold justify-content-center align-items-center fspcl mb_5_pcl">
                        (
                        {result?.header?.PrintRemark === "" ? "" :
                          (<b className="d-flex fspcl" dangerouslySetInnerHTML={{ __html: result?.header?.PrintRemark?.replace(/<br\s*\/?>/gi, " "), }} ></b>)}
                        )
                      </div>
                  }
                </div>
                <div className="pclsubheader">
                  <div className="partynamepcl">
                    <b className="partypcl fspcl_3 ">Party:</b> <div className="contentpclparty fspcl_3"> {result?.header?.customerfirmname} </div>
                  </div>
                  <div className="w_13_pcl">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex justify-content-end align-items-center fspcl w-50"> Invoice No:{" "} </div> <b className="d-flex justify-content-end align-items-center fspcl w-50"> {result?.header?.InvoiceNo} </b>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="d-flex justify-content-end align-items-center fspcl w-50"> Date:{" "} </div> <b className="d-flex justify-content-end align-items-center fspcl w-50"> {result?.header?.EntryDate} </b>
                    </div>
                  </div>
                </div>
                <div className="pcltable">
                  <div className="pcltablecontent">
                    <table>
                      <thead>
                        <tr>
                          <td>
                            <div className="pcltablehead border-start border-end border-bottom border-black ">
                              <div className="srnopclthead centerpcl fwboldpcl srfslhpcl fspcl" style={{ wordBreak: "break-word" }} > Sr No </div>
                              <div className="jewpclthead fwboldpcl fspcl fspcl"> Jewelcode </div>
                              <div className="diamheadpcl">
                                <div className="diamhpclcol1 fwboldpcl fspcl"> Diamond </div>
                                <div className="diamhpclcol">
                                  <div className="dcolsthpcl centerpcl fwboldpcl fspcl" style={{ width: "27%" }} > Shape </div>
                                  <div className="dcolsthpcl centerpcl fwboldpcl fspcl" style={{ width: "27%" }} > Size </div>
                                  <div className="dcolsthpcl centerpcl fwboldpcl fspcl" style={{ width: "20%" }} > Wt </div>
                                  <div className="dcolsthpcl centerpcl fwboldpcl fspcl" style={{ width: "22%" }} > Rate </div>
                                  <div className="dcolsthpcl centerpcl fwboldpcl fspcl" style={{ borderRight: "0px", width: "29%" }} > Amount </div>
                                </div>
                              </div>
                              <div className="diamheadpcl">
                                <div className="diamhpclcol1 fwboldpcl fspcl"> Metal </div>
                                <div className="diamhpclcol w-100">
                                  <div className="dcolsthpcl centerpcl fwboldpcl fspcl" style={{ width: "22%" }} > KT </div>
                                  <div className="dcolsthpcl centerpcl fwboldpcl fspcl" style={{ width: "18%" }} > Gr Wt </div>
                                  <div className="dcolsthpcl centerpcl fwboldpcl fspcl" style={{ width: "18%" }} > NetWt </div>
                                  <div className="dcolsthpcl centerpcl fwboldpcl fspcl" style={{ width: "20%" }} > Rate </div>
                                  <div className="dcolsthpcl centerpcl fwboldpcl fspcl" style={{ borderRight: "0px", width: "22%" }} > Amount </div>
                                </div>
                              </div>
                              <div className="shptheadpcl">
                                <div className="shpcolpcl1 fwboldpcl fspcl"> Stone </div>
                                <div className="shpcolpclcol">
                                  <div className="shpthcolspcl centerpcl fwboldpcl fspcl" style={{ width: "27%" }} > Shape </div>
                                  <div className="shpthcolspcl centerpcl fwboldpcl fspcl" style={{ width: "22%" }} > Wt </div>
                                  <div className="shpthcolspcl centerpcl fwboldpcl fspcl" style={{ width: "23%" }} > Rate </div>
                                  <div className="shpthcolspcl centerpcl fwboldpcl fspcl" style={{ borderRight: "0px", width: "28%" }} > Amount </div>
                                </div>
                              </div>
                              <div className="lotheadpcl">
                                <div className="lbhthpcl fwboldpcl fspcl"> Labour </div>
                                <div className="lbhthpclcol">
                                  <div className="lopclcol centerpcl fwboldpcl fspcl"> Rate </div>
                                  <div className="lopclcol centerpcl fwboldpcl fspcl" style={{ borderRight: "0px" }} > Amount </div>
                                </div>
                              </div>
                              <div className="lotheadpcl">
                                <div className="lbhthpcl fwboldpcl fspcl"> Other </div>
                                <div className="lbhthpclcol">
                                  <div className="lopclcol centerpcl fwboldpcl fspcl"> Code </div>
                                  <div className="lopclcol centerpcl fwboldpcl fspcl" style={{ borderRight: "0px" }} > Amount </div>
                                </div>
                              </div>
                              <div className="pricetheadpcl fwboldpcl fspcl"> Price </div>
                            </div>
                          </td>
                        </tr>
                      </thead>
                      {/* <tbody> */}
                      {result?.resultArray?.map((e, i) => {

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
                          mergeFindingsIntoPrimaryMetal(mergedFindings, mergedMetals,false);

                        /* ---------- LABOUR / OTHER column data ---------- */
                        const exRate = result?.header?.CurrencyExchRate || 1;

                        const labourRows = getLabourRows(e, exRate);
                        const labourTotal = labourRows.reduce((sum, r) => sum + r.amount, 0);

                        const otherRows = getOtherRows(e, exRate);
                        const otherTotal = otherRows.reduce((sum, r) => sum + r.amount, 0);

                        return (
                          <tr key={i}>
                            {/* <td> */}
                            <div className="tablebodypcl border-start border-end border-bottom border-black border-top-0" style={{ marginTop: "-2px" }}>
                              <div className="tbodyrowpcl">
                                <div className="pcltbr1c1 fspcl"> {i + 1} </div>
                                <div className="pcltbr1c2 fspcl">
                                  <div className="fspcl w-100  text-break left_pcl_new pd_top_pcl"> {(atob(evn))?.toLowerCase() === 'quote' ? e?.designno : (e?.JewelCodePrefix?.slice(0, 2) + e?.Category_Prefix?.slice(0, 2) + e?.SrJobno?.split("/")[1])} </div>
                                  <div className="designimgpcl fspcl">
                                    <img src={e?.DesignImage} alt="packinglist" id="designimgpclid" onError={(e) => handleImageError(e)} />
                                  </div>
                                  {/* <div className="fspcl">{e?.CertificateNo}</div> */}
                                  {e?.HUID === "" ? ("") : (<div className="fspcl text-break"> HUID - {e?.HUID} </div>)}
                                  <div className="fspcl text-break text-center w-100">{e?.lineid}</div>
                                </div>
                                {/* diamond */}
                                <div className="pcltbr1c3 fspcl">
                                  <div className="dcolsthpcl fspcl pt-1" style={{ width: "27%" }} >
                                    <div className="d-flex flex-column justify-content-between h-100">
                                      <div>
                                        {
                                          // eslint-disable-next-line array-callback-return
                                          e?.diamonds?.map((ele, ind) => {

                                            return (
                                              // <div className="leftpcl fspcl text-break" key={ind} > {ele?.ShapeName} { diaQlty && ele?.QualityName} </div>
                                              <div className="leftpcl fspcl text-break" key={ind} > <span
                                                dangerouslySetInnerHTML={{
                                                  __html: ele?.Shape_Code
                                                  // __html: ele?.Shape_Code === "RND" ? ele?.Shape_Code : "&nbsp;",
                                                }}
                                              />
                                                {diaQlty && ele?.QualityName} </div>
                                              // <div className=" fspcl text-break" key={i} ></div>
                                            );
                                          })
                                        }
                                      </div>
                                      <div className="leftpcl fspcl br_top_pcl text-break bg_pcl" >&nbsp;</div>
                                    </div>
                                  </div>
                                  <div className="dcolsthpcl fspcl pt-1" style={{ width: "27%" }} >
                                    <div className="d-flex flex-column justify-content-between h-100">
                                      <div>
                                        {
                                          // eslint-disable-next-line array-callback-return
                                          e?.diamonds?.map((ele, i) => {
                                            return (
                                              <div className=" fspcl text-break " key={i} > {ele?.SizeName == "Custom" ? "C:" + ele?.CustomSize : ele?.SizeName} </div>
                                            );
                                            // }
                                          })
                                        }
                                      </div>
                                      <div className=" fspcl text-break br_top_pcl text-break bg_pcl" >&nbsp;</div>
                                    </div>
                                  </div>
                                  <div className="dcolsthpcl fspcl pt-1" style={{ width: "20%" }} >
                                    <div className="d-flex flex-column justify-content-between h-100">
                                      <div>
                                        {
                                          // eslint-disable-next-line array-callback-return
                                          e?.diamonds?.map((ele, i) => {
                                            return (
                                              <div className=" fspcl end_pcl_new end_p_pcl_new" key={i} > {ele?.Wt?.toFixed(3)} </div>
                                            );
                                          })
                                        }
                                      </div>
                                      <div className=" fspcl text-break br_top_pcl text-break bg_pcl fw-bold end_pcl_new end_p_pcl_new" >{e?.totals?.diamonds?.Wt?.toFixed(3)}</div>
                                    </div>
                                  </div>
                                  <div className="dcolsthpcl fspcl pt-1" style={{ width: "22%" }} >
                                    <div className="d-flex flex-column justify-content-between h-100">
                                      <div>
                                        {
                                          // eslint-disable-next-line array-callback-return
                                          e?.diamonds?.map((ele, i) => {
                                            return (
                                              <div className=" fspcl end_pcl_new end_p_pcl_new" key={i} > {(ele?.Rate?.toFixed(2))} </div>
                                            );
                                          })
                                        }
                                      </div>
                                      <div className=" fspcl text-break br_top_pcl text-break bg_pcl fw-bold end_pcl_new end_p_pcl_new" >&nbsp;</div>
                                    </div>
                                  </div>
                                  <div className="dcolsthpcl fspcl pt-1" style={{ borderRight: "0px", width: "29%" }} >
                                    <div className="d-flex flex-column justify-content-between h-100">
                                      <div>
                                        {
                                          // eslint-disable-next-line array-callback-return
                                          e?.diamonds?.map((ele, i) => {
                                            return (
                                              <div className=" fspcl end_pcl_new end_p_pcl_new" key={i} > {formatAmount((ele?.Amount / (result?.header?.CurrencyExchRate)))} </div>
                                            );
                                          })
                                        }
                                      </div>
                                      <div className=" fspcl text-break br_top_pcl text-break bg_pcl fw-bold end_pcl_new end_p_pcl_new" >
                                        {formatAmount((e?.totals?.diamonds?.Amount / result?.header?.CurrencyExchRate))}</div>
                                    </div>
                                  </div>
                                </div>
                                {/* metal */}

                                <div className="pcltbr1c3 fspcl d-flex flex-column justify-content-start">
                                  <div className="w-100 d-flex flex-column justify-content-between h-100">
                                    {/* Metal Rows (Single Shared Loop) */}
                                    <div className="flex-grow-1 ">
                                      {finalMetals?.map((ele, i) => {
                                        // Check if this is the last metal row AND there are no findings
                                        const isAbsoluteLastRow = finalFindings?.length ==0 && i== finalMetals?.length - 1;

                                        return (
                                          <div key={i} className={`w-100 d-flex ${isAbsoluteLastRow ? "h-100" : ""}`}>
                                            {/* Shape & Quality */}
                                            <div style={{ width: "22%" }} className="be_1_pcl pt-1">
                                              <div className="fspcl text-break leftpcl ps-1">
                                                {`${ele?.ShapeName || ''} ${ele?.QualityName || ''}`}
                                              </div>
                                            </div>

                                            {/* Gross Weight */}
                                            <div style={{ width: "18%" }} className="be_1_pcl d-flex justify-content-end pt-1">
                                              <div className="w-100 end_pcl_new end_p_pcl_new" style={{alignItems:"flex-start"}}>
                                                {ele?.IsPrimaryMetal === 1 ? e?.grosswt?.toFixed(grosswt2dec ? 2 : 3) : ""}
                                              </div>
                                            </div>

                                            {/* Weight */}
                                            <div style={{ width: "18%" }} className="be_1_pcl d-flex justify-content-end pt-1">
                                              <div className="w-100 end_pcl_new end_p_pcl_new" style={{alignItems:"flex-start"}}>
                                                {ele?.Weight?.toFixed(3)}
                                              </div>
                                            </div>

                                            {/* Rate */}
                                            <div style={{ width: "20%" }} className="be_1_pcl">
                                              <div className="end_pcl_new end_p_pcl_new fspcl pt-1">
                                                {ele?.Rate !== 0 && ele?.Rate?.toFixed(2)}
                                              </div>
                                            </div>

                                            {/* Amount */}
                                            <div style={{ width: "22%" }} className="d-flex flex-column">
                                              <div className="end_pcl_new end_p_pcl_new fspcl pt-1">
                                                {ele?.Amount !== 0 && formatAmount(ele?.Amount / (result?.header?.CurrencyExchRate || 1))}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {finalFindings?.length >0 &&(
                                      <div className="flex-grow-1 h-100">
                                      {finalFindings?.map((ele, i) => {
                                        // Check if this is the last finding row
                                        
                                        const isAbsoluteLastRow =   i== finalFindings?.length - 1;

                                        return (
                                          <div key={i} className={`w-100 d-flex ${isAbsoluteLastRow ? "h-100" : ""}`}>
                                            {/* Shape & Quality */}
                                            <div style={{ width: "22%" }} className="be_1_pcl pt-1">
                                              <div className="fspcl text-break leftpcl ps-1">
                                                {e?.GroupJob !== '' ? "FINDING ACCESSORIES" : ele?.FindingTypename + " " + ele?.QualityName}
                                              </div>
                                            </div>

                                            {/* Gross Weight */}
                                            <div style={{ width: "18%" }} className="be_1_pcl d-flex justify-content-end pt-1">
                                              <div className="w-100 end_pcl_new end_p_pcl_new" style={{alignItems:"flex-start"}}>
                                                {/* {ele?.IsPrimaryMetal === 1 ? e?.grosswt?.toFixed(grosswt2dec ? 2 : 3) : ""} */}
                                              </div>
                                            </div>

                                            {/* Weight */}
                                            <div style={{ width: "18%" }} className="be_1_pcl d-flex justify-content-end pt-1">
                                              <div className="w-100 end_pcl_new end_p_pcl_new" style={{alignItems:"flex-start"}}>
                                                {ele?.Wt?.toFixed(3)}
                                              </div>
                                            </div>

                                            {/* Rate */}
                                            <div style={{ width: "20%" }} className="be_1_pcl">
                                              <div className="end_pcl_new end_p_pcl_new fspcl pt-1">
                                                {ele?.Rate !== 0 && ele?.Rate?.toFixed(2)}
                                              </div>
                                            </div>

                                            {/* Amount */}
                                            <div style={{ width: "22%" }} className="d-flex flex-column">
                                              <div className="end_pcl_new end_p_pcl_new fspcl pt-1">
                                                {ele?.Amount !== 0 && formatAmount(ele?.Amount / (result?.header?.CurrencyExchRate || 1))}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    )}

                                    

                                    {/* Remark Section (Renders conditionally if present) */}
                                    {e?.JobRemark ? (
                                      <div className="ps-1 mt-1 pb-2">
                                        Remark: <br /> <b className="text-break">{e?.JobRemark}</b>
                                      </div>
                                    ) : null}

                                    {/* Single Common Total / Footer Row */}
                                    <div className="w-100 d-flex mt-auto bg_pcl br_top_pcl fw-bold end_pcl_new end_p_pcl_new">
                                      <div style={{ width: "22%" }} className="be_1_pcl fspcl">&nbsp;</div>
                                      <div style={{ width: "18.2%" ,display: "flex", justifyContent: "flex-end"}} className="be_1_pcl fspcl">{e?.grosswt?.toFixed(grosswt2dec ? 2 : 3)}</div>
                                      <div style={{ width: "18.1%" ,display: "flex", justifyContent: "flex-end"}} className="be_1_pcl fspcl">{(e?.totals?.metal?.Weight + e?.totals?.finding?.Wt)?.toFixed(3)}</div>
                                      <div style={{ width: "20%" }} className="be_1_pcl fspcl">&nbsp;</div>
                                      <div style={{ width: "21.5%", display: "flex", justifyContent: "flex-end" }} className="fspcl">
                                        {formatAmount(e?.totals?.metal?.Amount + e?.totals?.finding?.Amount / (result?.header?.CurrencyExchRate || 1))}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* colorstone */}
                                <div className="pcltbr1c5 fspcl">
                                  <div className="shpthcolspcl fspcl pt-1 d-flex justify-contnet-between flex-column h-100" style={{ width: "27%" }} >
                                    <div className="d-flex flex-column justify-content-between h-100 w-100">
                                      <div className="w-100">
                                        {
                                          // eslint-disable-next-line array-callback-return
                                          e?.colorstone?.map((ele, i) => {
                                            return (
                                              <div className=" fspcl text-break" key={i} >{ele?.ShapeName}&nbsp;</div>
                                            );
                                          })
                                        }
                                      </div>
                                    </div>
                                    <div className="w-100 bg_pcl br_top_pcl">&nbsp;</div>
                                  </div>
                                  <div className="shpthcolspcl fspcl pt-1 d-flex flex-column justify-content-between h-100" style={{ width: "22%" }} >
                                    <div className="d-flex flex-column justify-content-between h-100">
                                      <div >
                                        {
                                          // eslint-disable-next-line array-callback-return
                                          e?.colorstone?.map((ele, i) => {
                                            return (
                                              <div className="end_pcl_new end_p_pcl_new fspcl" key={i} >
                                                {ele?.Wt?.toFixed(3)}
                                              </div>
                                            );
                                          })
                                        }
                                      </div>
                                      <div className="bg_pcl br_top_pcl fspcl end_pcl_new end_p_pcl_new fw-bold">{e?.totals?.colorstone?.Wt === 0 ? <div>&nbsp;</div> : e?.totals?.colorstone?.Wt?.toFixed(3)}</div>
                                    </div>
                                  </div>
                                  <div className="shpthcolspcl fspcl pt-1 d-flex flex-column justify-content-between h-100" style={{ width: "23%" }} >
                                    <div>

                                      {
                                        // eslint-disable-next-line array-callback-return
                                        e?.colorstone?.map((ele, i) => {
                                          return (
                                            <div className="end_pcl_new end_p_pcl_new fspcl" key={i} >
                                              {(((ele?.Amount / (result?.header?.CurrencyExchRate)) / ele?.Wt))?.toFixed(2)}
                                            </div>
                                          );
                                        })
                                      }
                                    </div>
                                    <div className="bg_pcl br_top_pcl fw-bold">&nbsp;</div>
                                  </div>
                                  <div className="shpthcolspcl fspcl pt-1 d-flex flex-column justify-content-between h-100" style={{ borderRight: "0px", width: "28%", }} >
                                    <div>
                                      {
                                        // eslint-disable-next-line array-callback-return
                                        e?.colorstone?.map((ele, i) => {
                                          return (
                                            <div className="end_pcl_new end_p_pcl_new fspcl" key={i} > {formatAmount((ele?.Amount / (result?.header?.CurrencyExchRate)))} </div>
                                          );
                                        })
                                      }
                                    </div>
                                    <div className="bg_pcl br_top_pcl end_pcl_new end_p_pcl_new fw-bold">{e?.totals?.colorstone?.Amount === 0 ? <div>&nbsp;</div> : formatAmount((e?.totals?.colorstone?.Amount / result?.header?.CurrencyExchRate))}</div>
                                  </div>
                                </div>

                                {/* labour */}
                                <div className="pcltbr1c6 fspcl ">
                                  {/* Rate */}
                                  <div className="lopclcol d-flex flex-column justify-content-between h-100  fspcl pt-1 ">
                                    <div>
                                      {labourRows.map((r, idx) => (
                                        <div key={idx} className="end_pcl_new end_p_pcl_new">
                                          {NumberWithCommas(r.rate, 2)}
                                        </div>
                                      ))}
                                    </div>
                                    <div className="fw-bold end_p_pcl_new bg_pcl br_top_pcl end_pcl_new">&nbsp;</div>
                                  </div>
                                  {/* Amount */}
                                  <div className="lopclcol d-flex flex-column justify-content-between h-100 fspcl pt-1" style={{ borderRight: "0px" }} >
                                    <div>
                                      {labourRows.map((r, idx) => (
                                        <div key={idx} className="end_pcl_new end_p_pcl_new">
                                          {NumberWithCommas(r.amount, 2)}
                                        </div>
                                      ))}
                                    </div>
                                    <div className="end_pcl_new end_p_pcl_new br_top_pcl bg_pcl fw-bold">
                                      {labourTotal !== 0 ? NumberWithCommas(labourTotal, 2) : <div>&nbsp;</div>}
                                    </div>
                                  </div>
                                </div>

                                {/* othercharge */}
                                <div className="pcltbr1c6 fspcl">
                                  {/* Code */}
                                  <div className="lopclcol fspcl pt-1 d-flex flex-column justify-content-between h-100 ">
                                    <div>
                                      {otherRows.map((r, idx) => (
                                        <div key={idx} className="text-break left_pcl_new2">{r.label}</div>
                                      ))}
                                    </div>
                                    <div className="bg_pcl br_top_pcl">&nbsp;</div>
                                  </div>
                                  {/* Amount */}
                                  <div className="lopclcol fspcl pt-1 d-flex flex-column justify-content-between h-100" style={{ borderRight: "0px" }} >
                                    <div>
                                      <div className=" d-flex flex-column justify-content-end align-items-end  fspcl">
                                        {otherRows.map((r, idx) => (
                                          <div key={idx}>{r.value}</div>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="bg_pcl end_pcl_new end_p_pcl_new br_top_pcl fw-bold">
                                      {otherTotal !== 0 ? NumberWithCommas(otherTotal, 2) : <div>&nbsp;</div>}
                                    </div>
                                  </div>
                                </div>
                                {/* price */}
                                <div className="pcltbr1c7 fwboldpcl fspcl pt-1" style={{ borderRight: "0px" }} >
                                  <div className="d-flex flex-column justify-content-between h-100  w-100">
                                    <div className="end_pcl_new end_p_pcl_new">{formatAmount(((e?.UnitCost + e?.DiscountAmt) / (result?.header?.CurrencyExchRate)))}</div>
                                    <div className="bg_pcl br_top_pcl end_pcl_new end_p_pcl_new">{formatAmount(((e?.UnitCost + e?.DiscountAmt) / (result?.header?.CurrencyExchRate)))}</div>
                                  </div>
                                </div>
                              </div>

                              {e?.DiscountAmt != 0 &&
                                //  ( "" ) : (
                                <div className="tbodyrowpcltot2 fspcl" style={{ borderTop: "1px solid #989898" }} >
                                  <div className="lopcltotrowtb dispcltotrowtb " style={{ width: "95%" }} >
                                    <div className="discpclcs fwboldpcl fspcl2 d-flex justify-content-end pe-2" style={{ width: "93%" }}>
                                      <span className='text-break' style={{ fontSize: '10px' }}>
                                        Discount {discountDisplay || `${formatAmount(e?.Discount, 2)} @ Total Amount`}
                                      </span>
                                    </div>
                                    <div className="disvalpclcs  fwboldpcl fspcl d-flex justify-content-end end_pcl_new end_p_pcl_new" style={{ borderRight: "0px", width: '10.5%' }} >
                                      {formatAmount((e?.DiscountAmt / (result?.header?.CurrencyExchRate)))}
                                    </div>
                                  </div>

                                  <div className="prpcltotrowtb  fwboldpcl fspcl end_pcl_new end_p_pcl_new" style={{ borderRight: "0px" }} >
                                    {formatAmount((e?.TotalAmount / (result?.header?.CurrencyExchRate)))}
                                  </div>
                                </div>
                                // )
                              }


                            </div>
                            {/* </td> */}
                          </tr>
                        );
                      })}
                      <tr>
                        {/* <td> */}
                        <div className="tbodyrowpcltot border-start border-end border-black border-bottom" >
                          <div className="srpcltotrowtb"></div>
                          <div className="jwlpcltotrowtb fspcl">
                            <b className="fspcl">TOTAL</b>
                          </div>
                          <div className="diapcltotrowtb">
                            <div className="dcolsthpcl" style={{ width: "27%", backgroundColor: '#F5F5F5 !important' }} ></div>
                            <div className="dcolsthpcl" style={{ width: "27%", backgroundColor: '#F5F5F5 !important' }} ></div>
                            <div className="dcolsthpcl  fwboldpcl fspcl d-flex justify-content-end align-import { value } from './ExportDeclarationForm';
items-center end_p_pcl_new" style={{ width: "20%" }} >
                              {result?.mainTotal?.diamonds?.Wt !== 0 && result?.mainTotal?.diamonds?.Wt?.toFixed(3)}
                            </div>
                            {/* <div className="dcolsthpcl" style={{ width: "22%" }} ></div> */}
                            <div className="dcolsthpcl  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new" style={{ borderRight: "0px", width: "51%", }} >
                              {result?.mainTotal?.diamonds?.Amount !== 0 && formatAmount(((result?.mainTotal?.diamonds?.Amount) / (result?.header?.CurrencyExchRate)))}
                            </div>
                          </div>
                          <div className="diapcltotrowtb">
                            <div className="dcolsthpcl" style={{ width: "22%" }} ></div>
                            <div className="dcolsthpcl  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new" style={{ width: "18%" }} >
                              {result?.mainTotal?.grosswt?.toFixed(grosswt2dec ? 2 : 3)}
                            </div>
                            <div className="dcolsthpcl  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new" style={{ width: "18%" }} >
                              {/* {result?.mainTotal?.netwtWithLossWt?.toFixed(3)} */}
                              {/* {(result?.mainTotal?.metal?.IsPrimaryMetal + result?.mainTotal?.lossWt)?.toFixed(3)} */}
                              {(result?.mainTotal?.metal?.Weight + result?.mainTotal?.finding?.Wt)?.toFixed(3)}
                            </div>
                            {/* <div className="dcolsthpcl" style={{ width: "20%" }} ></div> */}
                            <div className="dcolsthpcl  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new" style={{ borderRight: "0px", width: "42%", }} >
                              {result?.mainTotal?.metal?.Amount + (result?.mainTotal?.finding?.Amount ) !== 0 && formatAmount(((result?.mainTotal?.metal?.Amount + (result?.mainTotal?.finding?.Amount )) / (result?.header?.CurrencyExchRate)))}
                            </div>
                          </div>
                          <div className="stnpcltotrowtb">
                            <div className="shpthcolspcl" style={{ width: "27%" }} ></div>
                            <div className="shpthcolspcl  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new" style={{ width: "22%" }} >
                              {result?.mainTotal?.colorstone?.Wt !== 0 && result?.mainTotal?.colorstone?.Wt?.toFixed(3)}
                            </div>
                            {/* <div className="shpthcolspcl" style={{ width: "23%" }} ></div> */}
                            <div className="shpthcolspcl  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new" style={{ borderRight: "0px", width: "51%", }} >
                              {result?.mainTotal.colorstone?.Amount !== 0 && formatAmount((result?.mainTotal.colorstone?.Amount / (result?.header?.CurrencyExchRate)))}
                            </div>
                          </div>
                          {/* Labour grand total */}
                          <div className="lopcltotrowtb">
                            {/* <div className="lopclcol"></div> */}
                            <div className="lopclcol  fwboldpcl w-100 fspcl d-flex justify-content-end align-items-center end_p_pcl_new" style={{ borderRight: "0px", }} >
                              {totalLabourAll !== 0 && NumberWithCommas(totalLabourAll, 2)}
                            </div>
                          </div>
                          {/* Other grand total */}
                          <div className="lopcltotrowtb">
                            {/* <div className="lopclcol"></div> */}
                            <div className="lopclcol  fwboldpcl w-100 fspcl d-flex justify-content-end align-items-center end_p_pcl_new" style={{ borderRight: "0px", }} >
                              {totalOtherAll !== 0 && NumberWithCommas(totalOtherAll, 2)}
                            </div>
                          </div>
                          <div className="prpcltotrowtb  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new" style={{ borderRight: "0px" }} >
                            {formatAmount((result?.mainTotal?.total_amount / (result?.header?.CurrencyExchRate)))}
                          </div>
                        </div>
                        {/* </td> */}
                      </tr>
                      {/* </tbody> */}
                    </table>
                  </div>

                  <div className="tablebodypcl  border-start border-end border-bottom border-black">
                    <div className="totdispcl">
                      <div className="summaryalignpcl fspcl">
                        Total Discount
                      </div>
                      <div className="fspcl w-50 d-flex justify-content-end align-items-center ">
                        {formatAmount((result?.mainTotal?.total_discount_amount / (result?.header?.CurrencyExchRate)))}
                      </div>
                    </div>
                    {result?.allTaxes?.length > 0 &&
                      result?.allTaxes?.map((e, i) => {
                        return (
                          <div className="d-flex totdispcl fspcl" key={i}>
                            <div className="d-flex justify-content-end w-50">
                              {e?.name} {e?.per}
                            </div>

                            <div className="d-flex justify-content-end w-50">
                              {formatAmount(e?.amount)}
                            </div>
                          </div>
                        );
                      })}

                    {result?.header?.FreightCharges === 0 ? '' : <div className="totdispcl">
                      <div className="summaryalignpcl fspcl w-50 d-flex justify-content-end align-items-center">
                        {result?.header?.ModeOfDel}
                      </div>
                      <div className="fspcl">
                        {formatAmount((result?.header?.FreightCharges / (result?.header?.CurrencyExchRate)))}
                      </div>
                    </div>}
                    <div className="totdispcl">
                      <div className="summaryalignpcl fspcl w-50 d-flex justify-content-end align-items-center">
                        {result?.header?.AddLess > 0 ? "ADD" : "Less"}
                      </div>
                      <div className="fspcl">
                        {formatAmount((result?.header?.AddLess / (result?.header?.CurrencyExchRate)))}
                      </div>
                    </div>
                    <div className="totdispcl">
                      <div className="summaryalignpcl fspcl">Grand Total</div>
                      <div className="fspcl w-50 d-flex justify-content-end align-items-center">
                        {formatAmount(((
                          (result?.mainTotal?.total_amount + result?.header?.AddLess) / (result?.header?.CurrencyExchRate))
                          + result?.allTaxesTotal + (result?.header?.FreightCharges / result?.header?.CurrencyExchRate)
                        ))}
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
      )}
    </>
  );
};

export default PackingList;