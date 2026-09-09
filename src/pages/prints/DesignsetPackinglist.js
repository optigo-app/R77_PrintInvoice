import React, { useEffect, useState } from "react";
import "../../assets/css/prints/DesignsetPackinglist.scss";
import Button from "../../GlobalFunctions/Button";
import Loader from "../../components/Loader";
import {
  apiCall,
  checkMsg,
  formatAmount,
  handleImageError,
  isObjectEmpty,
  NumberWithCommas,
} from "../../GlobalFunctions";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import cloneDeep from "lodash/cloneDeep";

const DesignsetPackinglist = ({
  urls,
  token,
  invoiceNo,
  printName,
  evn,
  ApiVer,
}) => {
  const [result, setResult] = useState(null);
  const [data, setData] = useState(null)
  console.log("result: ", result);
  const [responsejson, setResponsejson] = useState("");
  const [misc_other, setMisc_Other] = useState([]);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const [diaQlty, setDiaQlty] = useState(false);
  const [netWtflag, setNetWtflag] = useState(false);
  const [sizeFlag, setSizeFlag] = useState(false);

  const handleImageErrors = () => {
    setIsImageWorking(false);
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
            setResponsejson(data?.Data);
            setLoader(false);
          } else {
            setLoader(false);
            setMsg("Data Not Found");
          }
        } else {
          setLoader(false);
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

  // const loadData = (data) => {
  //   let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
  //   data.BillPrint_Json[0].address = address;

  //   const datas = OrganizeDataPrint(
  //     data?.BillPrint_Json[0],
  //     data?.BillPrint_Json1,
  //     data?.BillPrint_Json2
  //   );

  //   datas?.resultArray?.sort((a, b) => a.id - b.id);

  //   const designSetAmountMap = {};
  //   const designSetDesignNoSeen = new Set();
  //   const designSetDesignNoCount = {};
  //   const lastOfRepeatedDesignInSet = new Map();
  //   const lastDesignSetIndexMap = {};
  //   const firstDesignSetIndexMap = {};

  //   // Step 1: Calculate total of unique designno per DesignSetNo and track last occurrences
  //   datas.resultArray?.forEach((e, idx) => {
  //     const setKey = e.DesignSetNo;
  //     const designKey = `${e.DesignSetNo}__${e.designno}`;

  //     // Track first index of DesignSetNo
  //     if (firstDesignSetIndexMap[setKey] === undefined) {
  //       firstDesignSetIndexMap[setKey] = idx;
  //     }

  //     // Unique designno amount per DesignSetNo
  //     if (!designSetDesignNoSeen.has(designKey)) {
  //       designSetDesignNoSeen.add(designKey);
  //       designSetAmountMap[setKey] = (designSetAmountMap[setKey] || 0) + (e.TotalAmount || 0);
  //     }

  //     // Count occurrences and track last index
  //     designSetDesignNoCount[designKey] = (designSetDesignNoCount[designKey] || 0) + 1;
  //     lastDesignSetIndexMap[setKey] = idx;

  //     if (designSetDesignNoCount[designKey] > 1) {
  //       lastOfRepeatedDesignInSet.set(designKey, idx);
  //     }
  //   });

  //   const shownFirstSet = new Set();

  //   const finalArr = datas.resultArray.map((e, idx) => {
  //     const obj = { ...e };
  //     const setKey = e.DesignSetNo;
  //     const designKey = `${setKey}__${e.designno}`;

  //     const isRepeated = designSetDesignNoCount[designKey] > 1;
  //     const isLastRepeat = lastOfRepeatedDesignInSet.get(designKey) === idx;
  //     const isFirstDesignSet = !shownFirstSet.has(setKey);
  //     const isFirstSetIndex = firstDesignSetIndexMap[setKey] === idx;

  //     if (setKey === 0 || setKey === "0") {
  //       // Directly show the TotalAmount for non-grouped design
  //       obj.designSetTotalAmount = e.TotalAmount;
  //     } else {
  //       if (isFirstDesignSet) {
  //         obj.designSetTotalAmount = designSetAmountMap[setKey];
  //         shownFirstSet.add(setKey);
  //       } else if (isRepeated && isLastRepeat) {
  //         obj.designSetTotalAmount = e.TotalAmount;
  //         obj.isLast = true;
  //       } else {
  //         obj.designSetTotalAmount = "";
  //       }
  //     }

  //     if (isFirstSetIndex) {
  //       obj.DesigSetImage = e.DesigSetImage;
  //     } else {
  //       obj.DesigSetImage = "";
  //     }

  //     return obj;
  //   });

  //   datas.resultArray = finalArr;
  //   setResult(datas);
  //   setData(datas);
  //   setLoader(false);
  // };


  const loadData = (data) => {
    let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    data.BillPrint_Json[0].address = address;

    const datas = OrganizeDataPrint(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );

    // Step 1: Sort resultArray by id
    datas?.resultArray?.sort((a, b) => a.SrNo - b.SrNo);

    // Step 2: Enhance each row (discount info)
    let enrichedArray = [];
    datas?.resultArray?.forEach((e) => {
      let obj = { ...e };
      let discountOn = [];

      if (e?.IsCriteriabasedAmount === 1) {
        if (e?.IsMetalAmount === 1) discountOn.push("Metal");
        if (e?.IsDiamondAmount === 1) discountOn.push("Diamond");
        if (e?.IsStoneAmount === 1) discountOn.push("Stone");
        if (e?.IsMiscAmount === 1) discountOn.push("Misc");
        if (e?.IsLabourAmount === 1) discountOn.push("Labour");
        if (e?.IsSolitaireAmount === 1) discountOn.push("Solitaire");
      } else {
        if (e?.Discount !== 0) discountOn.push("Total Amount");
      }

      obj.discountOn = discountOn;
      obj.str_discountOn = discountOn.join(", ") + "Amount";

      enrichedArray.push(obj);
    });

    // Step 3: Add designSetTotalAmount + DesigSetImage handling
    const finalArr = [];
    let i = 0;

    while (i < enrichedArray.length) {
      const current = enrichedArray[i];
      const { DesignSetGroup, DesignSetNo } = current;

      // 👇 Do not merge if DesignSetGroup === 0
      if (DesignSetGroup === 0) {
        finalArr.push({
          ...current,
          designSetTotalAmount: current.TotalAmount,
          DesigSetImage: '',
        });
        i++;
        continue;
      }

      let total = current.TotalAmount;
      let j = i + 1;

      // Check for consecutive duplicates
      while (
        j < enrichedArray.length &&
        enrichedArray[j].DesignSetGroup === DesignSetGroup &&
        enrichedArray[j].DesignSetNo === DesignSetNo &&
        enrichedArray[j].DesignSetGroup !== 0 // Avoid merging group 0
      ) {
        total += enrichedArray[j].TotalAmount;
        j++;
      }

      const isMerged = j - i > 1;

      finalArr.push({
        ...current,
        designSetTotalAmount: isMerged ? total : current.TotalAmount,
        DesigSetImage: isMerged ? current.DesigSetImage : '',
      });

      for (let k = i + 1; k < j; k++) {
        finalArr.push({
          ...enrichedArray[k],
          designSetTotalAmount: "",
          DesigSetImage: "",
        });
      }

      i = j;
    }

    // Step 4: Update result
    datas.resultArray = finalArr;

    console.log("datas: ", datas);
    setResult(datas);
    setData(datas);
    setLoader(false);
  };

  useEffect(() => {
    if (diaQlty) {
      const updated = cloneDeep(result);

      updated.resultArray.forEach((e) => {
        // Merge duplicate diamonds
        const diaMap = new Map();
        e?.diamonds?.forEach((el) => {
          const key = el?.QualityName;
          if (!diaMap.has(key)) {
            diaMap.set(key, cloneDeep(el));
          } else {
            const existing = diaMap.get(key);
            existing.Wt += el.Wt;
            existing.Pcs += el.Pcs;
            existing.Amount += el.Amount;
          }
        });
        e.diamonds = Array.from(diaMap.values());

        // Merge duplicate colorstones
        const clrMap = new Map();
        e?.colorstone?.forEach((el) => {
          const key = `${el.ShapeName}|${el.SizeName}|${el.QualityName}|${el.Colorname}|${el.Rate}`;
          if (!clrMap.has(key)) {
            clrMap.set(key, cloneDeep(el));
          } else {
            const existing = clrMap.get(key);
            existing.Wt += el.Wt;
            existing.Pcs += el.Pcs;
            existing.Amount += el.Amount;
          }
        });
        e.colorstone = Array.from(clrMap.values());
      });

      setResult(updated);
    } else {
      setResult(data)
    }
  }, [diaQlty]);

  const checkDiaQlty = () => {
    if (diaQlty) {
      setDiaQlty(false);
    } else {
      setDiaQlty(true);
    }
  };


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
                  <input
                    type="checkbox"
                    checked={netWtflag}
                    onChange={() => setNetWtflag(!netWtflag)}
                    id="netwt"
                  />
                  <label
                    htmlFor="netwt"
                    className="mx-2 user-select-none fspcl"
                  >
                    Net Wt
                  </label>

                  <input
                    type="checkbox"
                    checked={sizeFlag}
                    onChange={() => setSizeFlag(!sizeFlag)}
                    id="size"
                  />
                  <label htmlFor="size" className="mx-2 user-select-none fspcl">
                    Size
                  </label>

                  <input
                    type="checkbox"
                    checked={diaQlty}
                    onChange={() => setDiaQlty(!diaQlty)}
                    id="diaqlty"
                  />
                  <label
                    htmlFor="diaqlty"
                    className="mx-2 user-select-none fspcl"
                  >
                    Diamond Quality
                  </label>
                </div>
                <Button />
              </div>
              <div className="pclprint pad_60_allPrint">
                <div className="pclheader">
                  <div className="orailpcl">
                    {isImageWorking && result?.header?.PrintLogo !== "" && (
                      <img
                        src={result?.header?.PrintLogo}
                        alt=""
                        className="w-100 h-auto ms-auto d-block object-fit-contain"
                        onError={handleImageErrors}
                        height={120}
                        width={150}
                        style={{ maxWidth: "100px" }}
                      />
                    )}
                  </div>
                  <div className="addresspcl fspcl">
                    {result?.header?.CompanyAddress}
                    {result?.header?.CompanyAddress2}
                    {result?.header?.CompanyCity} -{" "}
                    {result?.header?.CompanyPinCode}
                  </div>
                  <div className="pclheaderplist mb_5_pcl fs_head_pcl">
                    {result?.header?.PrintHeadLabel}
                  </div>
                  {result?.header?.PrintRemark === "" ? (
                    ""
                  ) : (
                    <div className="d-flex fw-bold justify-content-center align-items-center fspcl mb_5_pcl">
                      (
                      {result?.header?.PrintRemark === "" ? (
                        ""
                      ) : (
                        <b
                          className="d-flex fspcl"
                          dangerouslySetInnerHTML={{
                            __html: result?.header?.PrintRemark?.replace(
                              /<br\s*\/?>/gi,
                              " "
                            ),
                          }}
                        ></b>
                      )}
                      )
                    </div>
                  )}
                </div>
                <div className="pclsubheader">
                  <div className="partynamepcl">
                    <b className="partypcl fspcl_3 ">Party:</b>{" "}
                    <div className="contentpclparty fspcl_3">
                      {" "}
                      {result?.header?.customerfirmname}{" "}
                    </div>
                  </div>
                  <div className="w_13_pcl">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex justify-content-end align-items-center fspcl w-50">
                        {" "}
                        Invoice No:{" "}
                      </div>{" "}
                      <b className="d-flex justify-content-end align-items-center fspcl w-50">
                        {" "}
                        {result?.header?.InvoiceNo}{" "}
                      </b>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="d-flex justify-content-end align-items-center fspcl w-50">
                        {" "}
                        Date:{" "}
                      </div>{" "}
                      <b className="d-flex justify-content-end align-items-center fspcl w-50">
                        {" "}
                        {result?.header?.EntryDate}{" "}
                      </b>
                    </div>
                  </div>
                </div>
                <div className="pcltable">
                  <div className="pcltablecontent">
                    <table>
                      <thead>
                        <tr>
                          <td style={{ padding: '0px' }}>
                            <div className="pcltablehead border-start border-end border-bottom border-black ">
                              <div
                                className="srnopclthead centerpcl fwboldpcl srfslhpcl fspcl"
                                style={{ wordBreak: "break-word" }}
                              >
                                {" "}
                                Sr No{" "}
                              </div>
                              <div className="jewpclthead fwboldpcl fspcl fspcl">
                                {" "}
                                Jewelcode{" "}
                              </div>
                              <div className="jewpclthead fwboldpcl fspcl fspcl">
                                {" "}
                                Design set{" "}
                              </div>
                              <div className="diamheadpcl">
                                <div className="diamhpclcol1 fwboldpcl fspcl">
                                  {" "}
                                  Diamond{" "}
                                </div>
                                <div className="diamhpclcol">
                                  <div
                                    className="dcolsthpcl centerpcl fwboldpcl fspcl"
                                    style={{ width: "27%" }}
                                  >
                                    {" "}
                                    Shape{" "}
                                  </div>
                                  <div
                                    className="dcolsthpcl centerpcl fwboldpcl fspcl"
                                    style={{ width: "27%" }}
                                  >
                                    {" "}
                                    Size{" "}
                                  </div>
                                  <div
                                    className="dcolsthpcl centerpcl fwboldpcl fspcl"
                                    style={{ width: "22%" }}
                                  >
                                    {" "}
                                    Wt{" "}
                                  </div>
                                  <div
                                    className="dcolsthpcl centerpcl fwboldpcl fspcl"
                                    style={{ width: "22%" }}
                                  >
                                    {" "}
                                    Rate{" "}
                                  </div>
                                  <div
                                    className="dcolsthpcl centerpcl fwboldpcl fspcl"
                                    style={{ borderRight: "0px", width: "27%" }}
                                  >
                                    {" "}
                                    Amount{" "}
                                  </div>
                                </div>
                              </div>
                              <div className="diamheadpcl">
                                <div className="diamhpclcol1 fwboldpcl fspcl">
                                  {" "}
                                  Metal{" "}
                                </div>
                                <div className="diamhpclcol w-100">
                                  <div
                                    className="dcolsthpcl centerpcl fwboldpcl fspcl"
                                    style={{ width: netWtflag ? "22%" : "26.50%" }}
                                  >
                                    {" "}
                                    KT{" "}
                                  </div>
                                  <div
                                    className="dcolsthpcl centerpcl fwboldpcl fspcl"
                                    style={{ width: netWtflag ? "18%" : "22.50%" }}
                                  >
                                    {" "}
                                    Gr Wt{" "}
                                  </div>
                                  {netWtflag && (
                                    <div
                                      className="dcolsthpcl centerpcl fwboldpcl fspcl"
                                      style={{ width: "18%" }}
                                    >
                                      {" "}
                                      NetWt{" "}
                                    </div>
                                  )}
                                  <div
                                    className="dcolsthpcl centerpcl fwboldpcl fspcl"
                                    style={{ width: netWtflag ? "20%" : "24.50%" }}
                                  >
                                    {" "}
                                    Rate{" "}
                                  </div>
                                  <div
                                    className="dcolsthpcl centerpcl fwboldpcl fspcl"
                                    style={{ borderRight: "0px", width: netWtflag ? "22%" : "26.50%" }}
                                  >
                                    {" "}
                                    Amount{" "}
                                  </div>
                                </div>
                              </div>
                              <div className="shptheadpcl">
                                <div className="shpcolpcl1 fwboldpcl fspcl">
                                  {" "}
                                  Stone{" "}
                                </div>
                                <div className="shpcolpclcol">
                                  <div
                                    className="shpthcolspcl centerpcl fwboldpcl fspcl"
                                    style={{ width: "27%" }}
                                  >
                                    {" "}
                                    Shape{" "}
                                  </div>
                                  <div
                                    className="shpthcolspcl centerpcl fwboldpcl fspcl"
                                    style={{ width: "22%" }}
                                  >
                                    {" "}
                                    Wt{" "}
                                  </div>
                                  <div
                                    className="shpthcolspcl centerpcl fwboldpcl fspcl"
                                    style={{ width: "23%" }}
                                  >
                                    {" "}
                                    Rate{" "}
                                  </div>
                                  <div
                                    className="shpthcolspcl centerpcl fwboldpcl fspcl"
                                    style={{ borderRight: "0px", width: "28%" }}
                                  >
                                    {" "}
                                    Amount{" "}
                                  </div>
                                </div>
                              </div>
                              <div className="lotheadpcl">
                                <div className="lbhthpcl fwboldpcl fspcl">
                                  {" "}
                                  Labour{" "}
                                </div>
                                <div className="lbhthpclcol">
                                  <div className="lopclcol centerpcl fwboldpcl fspcl">
                                    {" "}
                                    Rate{" "}
                                  </div>
                                  <div
                                    className="lopclcol centerpcl fwboldpcl fspcl"
                                    style={{ borderRight: "0px" }}
                                  >
                                    {" "}
                                    Amount{" "}
                                  </div>
                                </div>
                              </div>
                              <div className="lotheadpcl">
                                <div className="lbhthpcl fwboldpcl fspcl">
                                  {" "}
                                  Other{" "}
                                </div>
                                <div className="lbhthpclcol">
                                  <div className="lopclcol centerpcl fwboldpcl fspcl">
                                    {" "}
                                    Code{" "}
                                  </div>
                                  <div
                                    className="lopclcol centerpcl fwboldpcl fspcl"
                                    style={{ borderRight: "0px" }}
                                  >
                                    {" "}
                                    Amount{" "}
                                  </div>
                                </div>
                              </div>
                              <div className="pricetheadpcl fwboldpcl fspcl">
                                {" "}
                                Price{" "}
                              </div>
                              <div className="dPricetheadpcl fwboldpcl fspcl">
                                {" "}
                                Amount{" "}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </thead>

                      {/* <tbody> */}
                      {result?.resultArray?.map((e, i) => {
                        return (
                          <tr key={i}>
                            {/* <td> */}
                            <div
                              className="tablebodypcl border-end border-black border-top-0"
                              style={{ marginTop: "-2px" }}
                            >
                              <div className="tbodyrowpcl border-start border-black">
                                <div className="pcltbr1c1 fspcl border-bottom border-black"> {i + 1} </div>
                                <div className="pcltbr1c2 fspcl border-bottom border-black">
                                  <div className="fspcl w-100  text-break left_pcl_new pd_top_pcl">
                                    {" "}
                                    {atob(evn)?.toLowerCase() === "quote"
                                      ? e?.designno
                                      : e?.JewelCodePrefix?.slice(0, 2) +
                                      e?.Category_Prefix?.slice(0, 2) +
                                      e?.SrJobno?.split("/")[1]}{" "}
                                  </div>
                                  <div className="designimgpcl fspcl">
                                    <img
                                      src={e?.DesignImage}
                                      alt="packinglist"
                                      id="designimgpclid"
                                      onError={(e) => handleImageError(e)}
                                    />
                                  </div>
                                  <div className="fspcl">{e?.SrJobno}</div>
                                  {e?.HUID === "" ? (
                                    ""
                                  ) : (
                                    <div className="fspcl text-break">
                                      {" "}
                                      HUID - {e?.HUID}{" "}
                                    </div>
                                  )}
                                  <div className="fspcl text-break text-center w-100">
                                    {e?.lineid}
                                  </div>
                                </div>
                                <div className={`pcltbr1c2 fspcl border-black ${result?.resultArray?.length === 1
                                  ? 'border-bottom'
                                  : i === 0
                                    ? ''
                                    : e?.designSetTotalAmount && i === result.resultArray.length - 1
                                      ? 'border-bottom border-top'
                                      : e?.designSetTotalAmount
                                        ? 'border-top'
                                        : i === result.resultArray.length - 1
                                          ? 'border-bottom'
                                          : ''
                                  }`}
                                >
                                  <div className="designimgpcl fspcl">
                                    {e?.designSetTotalAmount && (
                                      <img
                                        src={e?.DesigSetImage}
                                        alt="packinglist"
                                        id="designimgpclid"
                                        onError={(e) => handleImageError(e)}
                                      />
                                    )}
                                  </div>
                                </div>
                                {/* diamond */}
                                <div className="pcltbr1c3 fspcl border-bottom border-black">
                                  <div
                                    className="dcolsthpcl fspcl pt-1"
                                    style={{ width: "27%" }}
                                  >
                                    <div className="d-flex flex-column justify-content-between h-100">
                                      <div>
                                        {
                                          // eslint-disable-next-line array-callback-return
                                          e?.diamonds?.map((ele, ind) => {
                                            return (
                                              <div
                                                className="leftpcl fspcl text-break"
                                                key={ind}
                                              >
                                                {" "}
                                                {ele?.ShapeName}{" "}
                                                {diaQlty && ele?.QualityName}{" "}
                                              </div>
                                              // <div className=" fspcl text-break" key={i} ></div>
                                            );
                                          })
                                        }
                                      </div>
                                      <div className="leftpcl fspcl br_top_pcl text-break bg_pcl">
                                        &nbsp;
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className="dcolsthpcl fspcl pt-1"
                                    style={{ width: "27%" }}
                                  >
                                    <div className="d-flex flex-column justify-content-between h-100">
                                      <div>
                                        {
                                          // eslint-disable-next-line array-callback-return
                                          e?.diamonds?.map((ele, i) => {
                                            return (
                                              <div
                                                className=" fspcl text-break "
                                                key={i}
                                              >
                                                {" "}
                                                {sizeFlag && ele?.SizeName}{" "}
                                              </div>
                                            );
                                            // }
                                          })
                                        }
                                      </div>
                                      <div className=" fspcl text-break br_top_pcl text-break bg_pcl">
                                        &nbsp;
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className="dcolsthpcl fspcl pt-1"
                                    style={{ width: "22%" }}
                                  >
                                    <div className="d-flex flex-column justify-content-between h-100">
                                      <div>
                                        {
                                          // eslint-disable-next-line array-callback-return
                                          e?.diamonds?.map((ele, i) => {
                                            return (
                                              <div
                                                className=" fspcl end_pcl_new end_p_pcl_new"
                                                key={i}
                                              >
                                                {" "}
                                                {ele?.Wt?.toFixed(3)}{" "}
                                              </div>
                                            );
                                          })
                                        }
                                      </div>
                                      <div className=" fspcl text-break br_top_pcl text-break bg_pcl fw-bold end_pcl_new end_p_pcl_new">
                                        {e?.totals?.diamonds?.Wt?.toFixed(3)}
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className="dcolsthpcl fspcl pt-1"
                                    style={{ width: "22%" }}
                                  >
                                    <div className="d-flex flex-column justify-content-between h-100">
                                      <div>
                                        {
                                          // eslint-disable-next-line array-callback-return
                                          e?.diamonds?.map((ele, i) => {
                                            return (
                                              <div
                                                className=" fspcl end_pcl_new end_p_pcl_new"
                                                key={i}
                                              >
                                                {" "}
                                                {ele?.Rate?.toFixed(2)}{" "}
                                              </div>
                                            );
                                          })
                                        }
                                      </div>
                                      <div className=" fspcl text-break br_top_pcl text-break bg_pcl fw-bold end_pcl_new end_p_pcl_new">
                                        &nbsp;
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className="dcolsthpcl fspcl pt-1"
                                    style={{ borderRight: "0px", width: "27%" }}
                                  >
                                    <div className="d-flex flex-column justify-content-between h-100">
                                      <div>
                                        {
                                          // eslint-disable-next-line array-callback-return
                                          e?.diamonds?.map((ele, i) => {
                                            return (
                                              <div
                                                className=" fspcl end_pcl_new end_p_pcl_new"
                                                key={i}
                                              >
                                                {" "}
                                                {formatAmount(
                                                  ele?.Amount /
                                                  result?.header
                                                    ?.CurrencyExchRate
                                                )}{" "}
                                              </div>
                                            );
                                          })
                                        }
                                      </div>
                                      <div className=" fspcl text-break br_top_pcl text-break bg_pcl fw-bold end_pcl_new end_p_pcl_new">
                                        {formatAmount(
                                          e?.totals?.diamonds?.Amount /
                                          result?.header?.CurrencyExchRate
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* metal */}

                                <div className="pcltbr1c3 fspcl d-flex flex-column justify-content-start border-bottom border-black">
                                  {e?.JobRemark !== "" ? (
                                    <>
                                      <div className="w-100 d-flex flex-column justify-content-between h-100">
                                        <div className="w-100">
                                          <div className="w-100 d-flex h-50" style={{ borderBottom: "1px solid #989898" }}>
                                            {/* Col 1: Metal + Finding names */}
                                            <div className="dcolsthpcl h-100 fspcl" style={{ width: "22%" }}>
                                              {e?.metal?.map((ele, i) => (
                                                <div className="leftpcl fspcl text-break pt-1 ps-1" key={`m-${i}`}>
                                                  {ele?.ShapeName + " " + ele?.QualityName}
                                                </div>
                                              ))}
                                              {e?.finding?.map((ele, i) => (
                                                <div className="leftpcl fspcl text-break pt-1 ps-1" key={`f-${i}`}>
                                                  f:{ele?.ShapeName} {ele?.QualityName}
                                                </div>
                                              ))}
                                            </div>

                                            {/* Col 2: Gross Wt */}
                                            <div className="dcolsthpcl h-100 fspcl p_2_pcl end_pcl_new end_p_pcl_new" style={{ width: "18%" }}>
                                              {e?.grosswt?.toFixed(3)}
                                            </div>

                                            {/* Col 3: Net Wt */}
                                            <div className="dcolsthpcl end_pcl_new end_p_pcl_new fspcl p_2_pcl" style={{ width: "18%" }}>
                                              {netWtflag && <>{(e?.totals?.metal?.IsPrimaryMetal - e?.totals?.finding?.Wt)?.toFixed(3)}</>}
                                            </div>

                                            {/* Col 4: Rate */}
                                            <div className="dcolsthpcl fspcl p_2_pcl" style={{ width: "20%" }}>
                                              {e?.metal?.map((ele, i) => (
                                                <div className="end_pcl_new end_p_pcl_new fspcl" key={`mr-${i}`}>
                                                  {ele?.Rate?.toFixed(2)}
                                                </div>
                                              ))}
                                              {e?.finding?.map((ele, i) => (
                                                <div className="end_pcl_new end_p_pcl_new fspcl" key={`fr-${i}`}>
                                                  { ele?.Rate?.toFixed(2)}
                                                </div>
                                              ))}
                                            </div>

                                            {/* Col 5: Amount */}
                                            <div className="dcolsthpcl fspcl" style={{ borderRight: "0px", width: "22%" }}>
                                              {e?.metal?.map((ele, i) => (
                                                <div className="end_pcl_new end_p_pcl_new fspcl p_2_pcl" key={`ma-${i}`}>
                                                  {formatAmount(ele?.Amount / result?.header?.CurrencyExchRate)}
                                                </div>
                                              ))}
                                              {e?.finding?.map((ele, i) => (
                                                <div className="end_pcl_new end_p_pcl_new fspcl p_2_pcl" key={`fa-${i}`}>
                                                  {ele?.Amount !== 0 && formatAmount(ele?.Amount / result?.header?.CurrencyExchRate)}
                                                </div>
                                              ))}
                                            </div>
                                          </div>

                                          <div className="ps-1 mt-1 h-50">
                                            Remark: <br />
                                            <b className="text-break">{e?.JobRemark}</b>
                                          </div>
                                        </div>

                                        {/* Footer totals row */}
                                        <div className="fspcl text-break br_top_pcl bg_pcl fw-bold end_pcl_new end_p_pcl_new w-100">
                                          <div className="be_1_pcl end_pcl_new end_p_pcl_new fspcl" style={{ width: "22%" }}>&nbsp;</div>
                                          <div className="be_1_pcl end_pcl_new end_p_pcl_new fspcl" style={{ width: "18%" }}>
                                            {e?.grosswt?.toFixed(3)}
                                          </div>
                                          <div className="be_1_pcl end_pcl_new end_p_pcl_new fspcl" style={{ width: "18%" }}>
                                            {netWtflag ? e?.totals?.metal?.IsPrimaryMetal?.toFixed(3) : "\u00A0"}
                                          </div>
                                          <div className="be_1_pcl end_pcl_new end_p_pcl_new fspcl" style={{ width: "20%" }}>&nbsp;</div>
                                          <div className="end_pcl_new end_p_pcl_new fspcl" style={{ width: "22%" }}>
                                            {formatAmount(e?.totals?.metal?.IsPrimaryMetal_Amount / result?.header?.CurrencyExchRate)}
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="w-100 d-flex flex-column justify-content-between h-100">
                                      <div className="w-100 d-flex" style={{ flex: 1 }}>

                                        {/* Col 1: Metal + Finding names */}
                                        <div style={{ width: netWtflag ? "22%" : "26.50%" }} className="be_1_pcl pt-1">
                                          <div className="d-flex flex-column justify-content-between h-100">
                                            <div>
                                              {e?.metal?.map((ele, i) => (
                                                <div className="fspcl text-break leftpcl" key={`m-${i}`}>
                                                  {ele?.IsPrimaryMetal === 1 && ele?.ShapeName + " " + ele?.QualityName}
                                                </div>
                                              ))}
                                              {e?.finding?.map((ele, i) => (
                                                <div className="fspcl text-break leftpcl" key={`f-${i}`}>
                                                  f:{ele?.ShapeName} {ele?.QualityName}
                                                </div>
                                              ))}
                                            </div>
                                            <div className="bg_pcl br_top_pcl">&nbsp;</div>
                                          </div>
                                        </div>

                                        {/* Col 2: Gross Wt */}
                                        <div style={{ width: netWtflag ? "18%" : "22.50%" }} className="be_1_pcl d-flex justify-content-end pt-1">
                                          <div className="d-flex flex-column justify-content-between h-100 w-100">
                                            <div className="w-100 end_pcl_new end_p_pcl_new">{e?.grosswt?.toFixed(3)}</div>
                                            <div className="fw-bold bg_pcl br_top_pcl w-100 end_pcl_new end_p_pcl_new">
                                              {e?.grosswt?.toFixed(3)}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Col 3: Net Wt (finding wt rows + total) */}
                                        {netWtflag && (
                                          <div style={{ width: "18%" }} className="be_1_pcl d-flex justify-content-end pt-1">
                                            <div className="d-flex flex-column h-100 w-100 justify-content-between">
                                              <div>
                                                {/* metal net wt */}
                                                {e?.metal?.map((ele, i) => (
                                                  ele?.IsPrimaryMetal === 1 && (
                                                    <div key={`mn-${i}`} className="w-100 end_pcl_new end_p_pcl_new">
                                                      {(e?.totals?.metal?.IsPrimaryMetal - e?.totals?.finding?.Wt)?.toFixed(3)}
                                                    </div>
                                                  )
                                                ))}
                                                {/* finding wt */}
                                                {e?.finding?.map((ele, i) => (
                                                  <div key={`fn-${i}`} className="w-100 end_pcl_new end_p_pcl_new">
                                                    {ele?.Wt?.toFixed(3)}
                                                  </div>
                                                ))}
                                              </div>
                                              <div className="w-100 end_pcl_new end_p_pcl_new bg_pcl br_top_pcl fw-bold">
                                                {e?.totals?.metal?.IsPrimaryMetal?.toFixed(3)}
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Col 4: Rate */}
                                        <div style={{ width: netWtflag ? "20%" : "24.50%" }} className="be_1_pcl">
                                          <div className="d-flex flex-column justify-content-between h-100 w-100">
                                            <div>
                                              {e?.metal?.map((ele, i) => (
                                                <div className="end_pcl_new end_p_pcl_new fspcl pt-1" key={`mr-${i}`}>
                                                  {ele?.IsPrimaryMetal === 1 && ele?.Rate !== 0 && ele?.Rate?.toFixed(2)}
                                                </div>
                                              ))}
                                              {e?.finding?.map((ele, i) => (
                                                <div className="end_pcl_new end_p_pcl_new fspcl pt-1" key={`fr-${i}`}>
                                                  { ele?.Rate?.toFixed(2)}
                                                </div>
                                              ))}
                                            </div>
                                            <div className="bg_pcl br_top_pcl">&nbsp;</div>
                                          </div>
                                        </div>

                                        {/* Col 5: Amount */}
                                        <div style={{ width: netWtflag ? "22%" : "26.50%" }} className="d-flex flex-column justify-content-between h-100">
                                          <div>
                                            {e?.metal?.map((ele, i) => (
                                              <div className="end_pcl_new end_p_pcl_new fspcl pt-1" key={`ma-${i}`}>
                                                {ele?.IsPrimaryMetal === 1 && ele?.Amount !== 0 &&
                                                  formatAmount(ele?.Amount / result?.header?.CurrencyExchRate)}
                                              </div>
                                            ))}
                                            {e?.finding?.map((ele, i) => (
                                              <div className="end_pcl_new end_p_pcl_new fspcl pt-1" key={`fa-${i}`}>
                                                {ele?.Amount !== 0 && formatAmount(ele?.Amount / result?.header?.CurrencyExchRate)}
                                              </div>
                                            ))}
                                          </div>
                                          <div className="end_pcl_new end_p_pcl_new fspcl bg_pcl br_top_pcl fw-bold">
                                            {formatAmount(
                                              (e?.totals?.metal?.IsPrimaryMetal_Amount + (e?.totals?.finding?.Amount || 0)) /
                                              result?.header?.CurrencyExchRate
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                </div>

                                {/* colorstone */}
                                <div className="pcltbr1c5 fspcl border-bottom border-black">
                                  <div
                                    className="shpthcolspcl fspcl pt-1 d-flex justify-contnet-between flex-column h-100"
                                    style={{ width: "27%" }}
                                  >
                                    <div className="d-flex flex-column justify-content-between h-100 w-100">
                                      <div className="w-100">
                                        {
                                          // eslint-disable-next-line array-callback-return
                                          e?.colorstone?.map((ele, i) => {
                                            return (
                                              <div
                                                className=" fspcl text-break"
                                                key={i}
                                              >
                                                {ele?.ShapeName}&nbsp;
                                              </div>
                                            );
                                          })
                                        }
                                      </div>
                                    </div>
                                    <div className="w-100 bg_pcl br_top_pcl">
                                      &nbsp;
                                    </div>
                                  </div>
                                  <div
                                    className="shpthcolspcl fspcl pt-1 d-flex flex-column justify-content-between h-100"
                                    style={{ width: "22%" }}
                                  >
                                    <div className="d-flex flex-column justify-content-between h-100">
                                      <div>
                                        {
                                          // eslint-disable-next-line array-callback-return
                                          e?.colorstone?.map((ele, i) => {
                                            return (
                                              <div
                                                className="end_pcl_new end_p_pcl_new fspcl"
                                                key={i}
                                              >
                                                {ele?.Wt?.toFixed(3)}
                                              </div>
                                            );
                                          })
                                        }
                                      </div>
                                      <div className="bg_pcl br_top_pcl fspcl end_pcl_new end_p_pcl_new fw-bold">
                                        {e?.totals?.colorstone?.Wt === 0 ? (
                                          <div>&nbsp;</div>
                                        ) : (
                                          e?.totals?.colorstone?.Wt?.toFixed(3)
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className="shpthcolspcl fspcl pt-1 d-flex flex-column justify-content-between h-100"
                                    style={{ width: "23%" }}
                                  >
                                    <div>
                                      {
                                        // eslint-disable-next-line array-callback-return
                                        e?.colorstone?.map((ele, i) => {
                                          return (
                                            <div
                                              className="end_pcl_new end_p_pcl_new fspcl"
                                              key={i}
                                            >
                                              {(
                                                ele?.Amount /
                                                result?.header
                                                  ?.CurrencyExchRate /
                                                ele?.Wt
                                              )?.toFixed(2)}
                                            </div>
                                          );
                                        })
                                      }
                                    </div>
                                    <div className="bg_pcl br_top_pcl fw-bold">
                                      &nbsp;
                                    </div>
                                  </div>
                                  <div
                                    className="shpthcolspcl fspcl pt-1 d-flex flex-column justify-content-between h-100"
                                    style={{ borderRight: "0px", width: "28%" }}
                                  >
                                    <div>
                                      {
                                        // eslint-disable-next-line array-callback-return
                                        e?.colorstone?.map((ele, i) => {
                                          return (
                                            <div
                                              className="end_pcl_new end_p_pcl_new fspcl"
                                              key={i}
                                            >
                                              {" "}
                                              {formatAmount(
                                                ele?.Amount /
                                                result?.header
                                                  ?.CurrencyExchRate
                                              )}{" "}
                                            </div>
                                          );
                                        })
                                      }
                                    </div>
                                    <div className="bg_pcl br_top_pcl end_pcl_new end_p_pcl_new fw-bold">
                                      {e?.totals?.colorstone?.Amount === 0 ? (
                                        <div>&nbsp;</div>
                                      ) : (
                                        formatAmount(
                                          e?.totals?.colorstone?.Amount /
                                          result?.header?.CurrencyExchRate
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* labour */}
                                <div className="pcltbr1c6 fspcl border-bottom border-black">
                                  <div className="lopclcol d-flex flex-column justify-content-between h-100  fspcl pt-1 ">
                                    <div className="d-flex flex-column justify-content-between h-100">
                                      <div className="end_pcl_new end_p_pcl_new">
                                        {e?.MaKingCharge_Unit !== 0
                                          ? formatAmount(e?.MaKingCharge_Unit)
                                          : "\u00A0"}
                                      </div>
                                      <div className="fw-bold end_p_pcl_new bg_pcl br_top_pcl end_pcl_new">
                                        {e?.MaKingCharge_Unit !== 0
                                          ? formatAmount(e?.MaKingCharge_Unit)
                                          : "\u00A0"}
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className="lopclcol d-flex flex-column justify-content-between h-100 fspcl pt-1"
                                    style={{ borderRight: "0px" }}
                                  >
                                    <div className="end_pcl_new end_p_pcl_new">
                                      {e?.MakingAmount +
                                        e?.TotalCsSetcost +
                                        e?.TotalDiaSetcost !==
                                        0 &&
                                        formatAmount(
                                          (e?.MakingAmount +
                                            e?.TotalCsSetcost +
                                            e?.TotalDiaSetcost) /
                                          result?.header?.CurrencyExchRate
                                        )}
                                    </div>
                                    <div className="end_pcl_new end_p_pcl_new br_top_pcl bg_pcl fw-bold">
                                      {e?.MakingAmount +
                                        e?.TotalCsSetcost +
                                        e?.TotalDiaSetcost ===
                                        0 ? (
                                        <div>&nbsp;</div>
                                      ) : (
                                        e?.MakingAmount +
                                        e?.TotalCsSetcost +
                                        e?.TotalDiaSetcost !==
                                        0 &&
                                        formatAmount(
                                          (e?.MakingAmount +
                                            e?.TotalCsSetcost +
                                            e?.TotalDiaSetcost) /
                                          result?.header?.CurrencyExchRate
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* othercharge */}
                                <div className="pcltbr1c6 fspcl border-bottom border-black">
                                  <div className="lopclcol fspcl pt-1 d-flex flex-column justify-content-between h-100 ">
                                    <div>
                                      <div className="left_pcl_new2">
                                        {e?.totals?.misc
                                          ?.onlyIsHSCODE0_Amount === 0
                                          ? ""
                                          : "Other"}
                                      </div>
                                      <div className="left_pcl_new2">
                                        {e?.TotalDiamondHandling === 0
                                          ? ""
                                          : "Handling"}
                                      </div>
                                      <div>
                                        {e?.other_details?.map((e, i) => {
                                          return (
                                            i < 3 && (
                                              <div
                                                key={i}
                                                className="text-break left_pcl_new2"
                                              >
                                                {e?.label}
                                              </div>
                                            )
                                          );
                                        })}
                                        {e?.misc?.map((el, i) => {
                                          return el?.IsHSCOE === 1 ||
                                            el?.IsHSCOE === 2 ||
                                            el?.IsHSCOE === 3 ? (
                                            <div key={i} className="left_pcl_new2">
                                              {el?.Amount === 0
                                                ? ""
                                                : el?.IsHSCOE === 3
                                                  ? el?.ShapeName?.split("_")[1]
                                                  : el?.ShapeName}
                                            </div>
                                          ) : (
                                            ""
                                          );
                                        })}
                                      </div>
                                    </div>
                                    <div className="bg_pcl br_top_pcl">
                                      &nbsp;
                                    </div>
                                  </div>
                                  <div
                                    className="lopclcol fspcl pt-1 d-flex flex-column justify-content-between h-100"
                                    style={{ borderRight: "0px" }}
                                  >
                                    <div>
                                      <div className=" d-flex flex-column justify-content-end align-items-end  fspcl">
                                        <div>
                                          {e?.totals?.misc
                                            ?.onlyIsHSCODE0_Amount === 0
                                            ? ""
                                            : formatAmount(
                                              e?.totals?.misc
                                                ?.onlyIsHSCODE0_Amount /
                                              result?.header
                                                ?.CurrencyExchRate
                                            )}
                                        </div>
                                        <div>
                                          {e?.TotalDiamondHandling === 0
                                            ? ""
                                            : formatAmount(
                                              e?.TotalDiamondHandling
                                            )}
                                        </div>
                                        <div>
                                          {e?.other_details?.map((el, i) => {
                                            return i < 3 ? (
                                              <div key={i}>{el?.value}</div>
                                            ) : (
                                              ""
                                            );
                                          })}
                                          {e?.misc?.map((el, i) => {
                                            return el?.IsHSCOE === 1 ||
                                              el?.IsHSCOE === 2 ||
                                              el?.IsHSCOE === 3 ? (
                                              <div key={i}>
                                                {el?.Amount === 0
                                                  ? ""
                                                  : formatAmount(
                                                    el?.Amount /
                                                    result?.header
                                                      ?.CurrencyExchRate
                                                  )}
                                              </div>
                                            ) : (
                                              ""
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="bg_pcl end_pcl_new end_p_pcl_new br_top_pcl fw-bold">
                                      {e?.other_details?.length === 0 &&
                                        e?.misc?.length === 0 &&
                                        e?.TotalDiamondHandling === 0 &&
                                        e?.totals?.misc?.onlyIsHSCODE0_Amount ===
                                        0 ? (
                                        <div>&nbsp;</div>
                                      ) : (
                                        formatAmount(
                                          e?.other_details_arr_total_amount +
                                          e?.totals?.misc?.Amount /
                                          result?.header?.CurrencyExchRate +
                                          e?.TotalDiamondHandling
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {/* price */}
                                <div
                                  className="pcltbr1c7 fwboldpcl fspcl pt-1 border-bottom border-black"
                                >
                                  <div className="d-flex flex-column justify-content-between h-100  w-100 border-bottom">
                                    <div className="end_pcl_new end_p_pcl_new">
                                      {formatAmount(
                                        e?.UnitCost /
                                        result?.header?.CurrencyExchRate
                                      )}
                                    </div>
                                    <div className="bg_pcl br_top_pcl end_pcl_new end_p_pcl_new">
                                      {formatAmount(
                                        e?.TotalAmount /
                                        result?.header?.CurrencyExchRate
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className="pcltbr1c8 fwboldpcl fspcl pt-1 pr-0.5"
                                  style={{
                                    borderRight: "0px",
                                    justifyContent: "end",
                                    borderTop: e?.designSetTotalAmount ? "1px solid #000" : "none",
                                  }}
                                >
                                  {e?.designSetTotalAmount
                                    ? Number(e.designSetTotalAmount / (result?.header?.CurrencyExchRate || 1)).toFixed(2)
                                    : ""}
                                </div>
                              </div>

                              {/* {e?.DiscountAmt === 0 ? (
                                ""
                              ) : (
                                <div
                                  className="tbodyrowpcltot2 fspcl"
                                  style={{ borderTop: "1px solid #989898" }}
                                >
                                  <div
                                    className="lopcltotrowtb dispcltotrowtb "
                                    style={{ width: "95%" }}
                                  >
                                    <div className="discpclcs fwboldpcl fspcl2 d-flex justify-content-end pe-2">
                                      {" "}
                                      Discount{" "}
                                      {e?.Discount === 0 ? (
                                        "-"
                                      ) : (
                                        <span className="text-break">
                                          {`${formatAmount(e?.Discount)} % On ${e?.str_discountOn
                                            }`}
                                        </span>
                                      )}{" "}
                                    </div>
                                    <div
                                      className="disvalpclcs  fwboldpcl fspcl d-flex justify-content-end end_pcl_new end_p_pcl_new"
                                      style={{
                                        borderRight: "0px",
                                        width: "10.5%",
                                      }}
                                    >
                                      {formatAmount(
                                        e?.DiscountAmt /
                                        result?.header?.CurrencyExchRate
                                      )}
                                    </div>
                                  </div>

                                  <div
                                    className="prpcltotrowtb  fwboldpcl fspcl end_pcl_new end_p_pcl_new"
                                    style={{ borderRight: "0px" }}
                                  >
                                    {formatAmount(
                                      e?.TotalAmount /
                                      result?.header?.CurrencyExchRate
                                    )}
                                  </div>
                                </div>
                              )} */}
                            </div>
                            {/* </td> */}
                          </tr>
                        );
                      })}
                      <tr>
                        {/* <td> */}
                        <div className="tbodyrowpcltot border-start border-end border-black border-bottom">
                          <div className="srpcltotrowtb"></div>
                          <div className="jwlpcltotrowtb fspcl">
                            <b className="fspcl">TOTAL</b>
                          </div>
                          <div className="jwlpcltotrowtb fspcl">
                            <b className="fspcl"></b>
                          </div>
                          <div className="diapcltotrowtb">
                            <div
                              className="dcolsthpcl"
                              style={{
                                width: "27%",
                                backgroundColor: "#F5F5F5 !important",
                              }}
                            ></div>
                            <div
                              className="dcolsthpcl"
                              style={{
                                width: "27%",
                                backgroundColor: "#F5F5F5 !important",
                              }}
                            ></div>
                            <div
                              className="dcolsthpcl  fwboldpcl fspcl d-flex justify-content-end align-import { value } from './ExportDeclarationForm'; items-center end_p_pcl_new"
                              style={{ width: "22%" }}
                            >
                              {result?.mainTotal?.diamonds?.Wt !== 0 &&
                                result?.mainTotal?.diamonds?.Wt?.toFixed(3)}
                            </div>
                            {/* <div className="dcolsthpcl" style={{ width: "22%" }} ></div> */}
                            <div
                              className="dcolsthpcl"
                              style={{ width: "27%", borderRight: "none" }}
                            ></div>
                            <div
                              className="dcolsthpcl  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new"
                              style={{ width: "24%", borderRight: "none" }}
                            >
                              {result?.mainTotal?.diamonds?.Amount !== 0 &&
                                formatAmount(
                                  result?.mainTotal?.diamonds?.Amount /
                                  result?.header?.CurrencyExchRate
                                )}
                            </div>
                          </div>
                          <div className="diapcltotrowtb">
                            <div
                              className="dcolsthpcl"
                              style={{ width: netWtflag ? "22%" : "26.50%" }}
                            ></div>
                            <div
                              className="dcolsthpcl  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new"
                              style={{ width: netWtflag ? "18%" : "22.50%" }}
                            >
                              {result?.mainTotal?.grosswt?.toFixed(3)}
                            </div>
                            {netWtflag && (
                              <div
                                className="dcolsthpcl  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new"
                                style={{ width: "18%" }}
                              >
                                {/* {result?.mainTotal?.netwtWithLossWt?.toFixed(3)} */}
                                {/* {(result?.mainTotal?.metal?.IsPrimaryMetal + result?.mainTotal?.lossWt)?.toFixed(3)} */}
                                {result?.mainTotal?.metal?.IsPrimaryMetal?.toFixed(3)}
                              </div>
                            )}
                            {/* <div className="dcolsthpcl" style={{ width: "20%" }} ></div> */}
                            <div
                              className="dcolsthpcl  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new"
                              style={{ borderRight: "0px", width: netWtflag ? "42%" : "51%" }}
                            >
                              {result?.mainTotal.metal
                                ?.IsPrimaryMetal_Amount !== 0 &&
                                formatAmount(
                                  (result?.mainTotal.metal
                                    ?.IsPrimaryMetal_Amount  + result?.mainTotal?.finding?.Amount )/
                                  result?.header?.CurrencyExchRate
                                )}
                            </div>
                          </div>
                          <div className="stnpcltotrowtb">
                            <div
                              className="shpthcolspcl"
                              style={{ width: "27%" }}
                            ></div>
                            <div
                              className="shpthcolspcl  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new"
                              style={{ width: "22%" }}
                            >
                              {result?.mainTotal?.colorstone?.Wt !== 0 &&
                                result?.mainTotal?.colorstone?.Wt?.toFixed(3)}
                            </div>
                            {/* <div className="shpthcolspcl" style={{ width: "23%" }} ></div> */}
                            <div
                              className="shpthcolspcl  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new"
                              style={{ borderRight: "0px", width: "51%" }}
                            >
                              {result?.mainTotal.colorstone?.Amount !== 0 &&
                                formatAmount(
                                  result?.mainTotal.colorstone?.Amount /
                                  result?.header?.CurrencyExchRate
                                )}
                            </div>
                          </div>
                          <div className="lopcltotrowtb">
                            {/* <div className="lopclcol"></div> */}
                            <div
                              className="lopclcol  fwboldpcl w-100 fspcl d-flex justify-content-end align-items-center end_p_pcl_new"
                              style={{ borderRight: "0px" }}
                            >
                              {result?.mainTotal?.total_Making_Amount +
                                result?.mainTotal?.total_TotalDiaSetcost +
                                result?.mainTotal?.total_TotalCsSetcost !==
                                0 &&
                                formatAmount(
                                  (result?.mainTotal?.total_Making_Amount +
                                    result?.mainTotal?.total_TotalDiaSetcost +
                                    result?.mainTotal?.total_TotalCsSetcost) /
                                  result?.header?.CurrencyExchRate
                                )}
                            </div>
                          </div>
                          <div className="lopcltotrowtb">
                            {/* <div className="lopclcol"></div> */}
                            <div
                              className="lopclcol  fwboldpcl w-100 fspcl d-flex justify-content-end align-items-center end_p_pcl_new"
                              style={{ borderRight: "0px" }}
                            >
                              {result?.mainTotal?.total_other +
                                result?.mainTotal?.total_diamondHandling +
                                result?.mainTotal?.totalMiscAmount !==
                                0 &&
                                formatAmount(
                                  (result?.mainTotal?.total_other +
                                    result?.mainTotal?.total_diamondHandling +
                                    result?.mainTotal?.totalMiscAmount) /
                                  result?.header?.CurrencyExchRate
                                )}
                            </div>
                          </div>
                          <div
                            className="prpcltotrowtb  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new"
                          >
                          </div>
                          <div
                            className="prpcltotrowtb  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new"
                            style={{ borderRight: "0px", borderTop: '1px solid #000' }}
                          >
                            {formatAmount(
                              result?.mainTotal?.total_amount /
                              result?.header?.CurrencyExchRate
                            )}
                          </div>
                        </div>
                        {/* </td> */}
                      </tr>
                      {/* </tbody> */}
                    </table>
                  </div>

                  <div className="tablebodypcl lastTotalDiv border-start border-end border-bottom border-black">
                    <div className="totdispcl">
                      <div className="summaryalignpcl fspcl">
                        Total Discount
                      </div>
                      <div className="fspcl w-50 d-flex justify-content-end align-items-center ">
                        {formatAmount(
                          result?.mainTotal?.total_discount_amount /
                          result?.header?.CurrencyExchRate
                        )}
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

                    {result?.header?.FreightCharges === 0 ? (
                      ""
                    ) : (
                      <div className="totdispcl">
                        <div className="summaryalignpcl fspcl w-50 d-flex justify-content-end align-items-center">
                          {result?.header?.ModeOfDel}
                        </div>
                        <div className="fspcl">
                          {formatAmount(
                            result?.header?.FreightCharges /
                            result?.header?.CurrencyExchRate
                          )}
                        </div>
                      </div>
                    )}
                    <div className="totdispcl">
                      <div className="summaryalignpcl fspcl w-50 d-flex justify-content-end align-items-center">
                        {result?.header?.AddLess > 0 ? "ADD" : "Less"}
                      </div>
                      <div className="fspcl">
                        {formatAmount(
                          result?.header?.AddLess /
                          result?.header?.CurrencyExchRate
                        )}
                      </div>
                    </div>
                    <div className="totdispcl">
                      <div className="summaryalignpcl fspcl">Grand Total</div>
                      <div className="fspcl w-50 d-flex justify-content-end align-items-center">
                        {formatAmount(
                          (result?.mainTotal?.total_amount +
                            result?.header?.AddLess) /
                          result?.header?.CurrencyExchRate +
                          result?.allTaxesTotal +
                          result?.header?.FreightCharges /
                          result?.header?.CurrencyExchRate
                        )}
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

export default DesignsetPackinglist;
