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
} from "../../GlobalFunctions";
import { OrganizeDataPrint } from "./../../GlobalFunctions/OrganizeDataPrint";
import cloneDeep from "lodash/cloneDeep";

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
                                  <div className="dcolsthpcl centerpcl fwboldpcl fspcl" style={{ width: "22%" }} > Wt </div>
                                  <div className="dcolsthpcl centerpcl fwboldpcl fspcl" style={{ width: "22%" }} > Rate </div>
                                  <div className="dcolsthpcl centerpcl fwboldpcl fspcl" style={{ borderRight: "0px", width: "27%" }} > Amount </div>
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
                                  <div className="dcolsthpcl fspcl pt-1" style={{ width: "22%" }} >
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
                                  <div className="dcolsthpcl fspcl pt-1" style={{ borderRight: "0px", width: "27%" }} >
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
                                  {e?.JobRemark !== "" ? (
                                    <>
                                      <div className="w-100 d-flex flex-column justify-content-between h-100">
                                        <div className="w-100">
                                          <div className="w-100 d-flex h-50" style={{ borderBottom: "1px solid #989898" }}>
                                            <div className="dcolsthpcl h-100 fspcl" style={{ width: "22%" }} >
                                              {/* <div className="d-flex flex-column justify-content-between h-100"> */}
                                              {/* <div> */}
                                              {
                                                // eslint-disable-next-line array-callback-return
                                                e?.metal?.map((ele, i) => {
                                                  return (
                                                    <div className="leftpcl fspcl  text-break pt-1 ps-1" key={i} > {" "} {ele?.ShapeName + " " + ele?.QualityName}{" "} </div>
                                                  );
                                                })
                                              }
                                              {/* </div> */}
                                              {/* <div className=" fspcl text-break br_top_pcl text-break bg_pcl fw-bold end_pcl_new end_p_pcl_new" >&nbsp;</div> */}
                                              {/* </div> */}
                                            </div>
                                            <div className="dcolsthpcl h-100 fspcl p_2_pcl end_pcl_new end_p_pcl_new" style={{ width: "18%" }} >
                                              {e?.grosswt?.toFixed(grosswt2dec ? 2 : 3)}
                                            </div>
                                            <div className="dcolsthpcl end_pcl_new end_p_pcl_new fspcl p_2_pcl" style={{ width: "18%" }} >
                                              {(e?.totals?.metal?.IsPrimaryMetal)?.toFixed(grosswt2dec ? 2 : 3)}
                                            </div>
                                            <div className="dcolsthpcl fspcl p_2_pcl" style={{ width: "20%" }} >
                                              {
                                                // eslint-disable-next-line array-callback-return
                                                e?.metal?.map((ele, i) => {
                                                  return (
                                                    <div className="end_pcl_new end_p_pcl_new fspcl " key={i} > {" "} {(ele?.Rate?.toFixed(2))}{" "} {/* {NumberWithCommas(e?.goldPrice, 2)} */}{" "} </div>
                                                  );
                                                })
                                              }
                                            </div>
                                            <div className="dcolsthpcl fspcl" style={{ borderRight: "0px", width: "22%", }} >
                                              {
                                                // eslint-disable-next-line array-callback-return
                                                e?.metal?.map((ele, i) => {
                                                  return (
                                                    <div className="end_pcl_new end_p_pcl_new fspcl p_2_pcl" key={i} > {" "} {formatAmount((ele?.Amount / (result?.header?.CurrencyExchRate)))}{" "} </div>
                                                  );
                                                })
                                              }
                                            </div>
                                          </div>
                                          <div className="ps-1 mt-1 h-50">
                                            Remark: <br /> <b className="text-break"> {e?.JobRemark}</b>
                                          </div>
                                        </div>
                                        <div className=" fspcl text-break br_top_pcl text-break bg_pcl fw-bold end_pcl_new end_p_pcl_new w-100" >
                                          <div className="be_1_pcl end_pcl_new end_p_pcl_new fspcl " style={{ width: "22%" }}>&nbsp;</div>
                                          <div className="be_1_pcl end_pcl_new end_p_pcl_new fspcl " style={{ width: "18%" }}>{e?.grosswt?.toFixed(3)}</div>
                                          <div className="be_1_pcl end_pcl_new end_p_pcl_new fspcl " style={{ width: "18%" }}> {(e?.totals?.metal?.IsPrimaryMetal)?.toFixed(3)}</div>
                                          <div className="be_1_pcl end_pcl_new end_p_pcl_new fspcl " style={{ width: "20%" }}>&nbsp;</div>
                                          <div className="end_pcl_new end_p_pcl_new fspcl " style={{ width: "22%" }}>{formatAmount((e?.totals?.metal?.IsPrimaryMetal_Amount / result?.header?.CurrencyExchRate))}</div>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="w-100 d-flex h-100">
                                      <div style={{ width: "22%" }} className="be_1_pcl pt-1" >
                                        <div className="d-flex flex-column justify-content-between h-100">
                                          <div>
                                            {
                                              // eslint-disable-next-line array-callback-return
                                              e?.metal?.map((ele, i) => {
                                                return (
                                                  <div className=" fspcl text-break leftpcl" key={i} >
                                                    {ele?.IsPrimaryMetal === 1 && (ele?.ShapeName + " " + ele?.QualityName)}{" "}
                                                  </div>
                                                );
                                              })
                                            }
                                          </div>
                                          <div className="bg_pcl br_top_pcl">&nbsp;</div>
                                        </div>
                                      </div>
                                      <div style={{ width: "18%" }} className="be_1_pcl d-flex justify-content-end pt-1" >
                                        <div className="d-flex flex-column justify-content-between h-100 w-100" >
                                          <div className="w-100 end_pcl_new end_p_pcl_new"> {e?.grosswt?.toFixed(grosswt2dec ? 2 : 3)}</div>
                                          <div className="fw-bold bg_pcl br_top_pcl w-100 end_pcl_new end_p_pcl_new"> {e?.grosswt?.toFixed(grosswt2dec ? 2 : 3)}</div>
                                        </div>
                                      </div>
                                      <div style={{ width: "18%" }} className="be_1_pcl d-flex justify-content-end pt-1" >
                                        <div className="d-flex flex-column h-100 w-100 justify-content-between">
                                          <div className="w-100 end_pcl_new end_p_pcl_new">{(e?.totals?.metal?.IsPrimaryMetal)?.toFixed(3)}</div>
                                          <div className="w-100 end_pcl_new end_p_pcl_new bg_pcl br_top_pcl fw-bold">{(e?.totals?.metal?.IsPrimaryMetal)?.toFixed(3)}</div>
                                        </div>
                                      </div>
                                      <div style={{ width: "20%" }} className="be_1_pcl " >
                                        <div className="d-flex flex-column justify-content-between h-100 w-100">
                                          <div>
                                            {
                                              // eslint-disable-next-line array-callback-return
                                              e?.metal?.map((ele, i) => {
                                                return (
                                                  <div className="end_pcl_new end_p_pcl_new fspcl pt-1" key={i} > {ele?.IsPrimaryMetal === 1 && (ele?.Rate !== 0 && ((ele?.Rate?.toFixed(2))))}{" "} </div>);
                                              })
                                            }
                                          </div>
                                          <div className="bg_pcl br_top_pcl">&nbsp;</div>
                                        </div>
                                      </div>

                                      <div style={{ width: "22%" }} className="d-flex flex-column justify-content-between h-100">
                                        <div>
                                          {
                                            // eslint-disable-next-line array-callback-return
                                            e?.metal?.map((ele, i) => {
                                              return (
                                                <div className="end_pcl_new end_p_pcl_new fspcl pt-1" key={i} >{ele?.IsPrimaryMetal === 1 && (ele?.Amount !== 0 && formatAmount((ele?.Amount / (result?.header?.CurrencyExchRate))))} </div>
                                              );
                                            })
                                          }
                                        </div>
                                        <div className="end_pcl_new end_p_pcl_new fspcl bg_pcl br_top_pcl fw-bold">{formatAmount((e?.totals?.metal?.IsPrimaryMetal_Amount / (result?.header?.CurrencyExchRate)))} </div>
                                      </div>
                                    </div>
                                  )}
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
                                  <div className="lopclcol d-flex flex-column justify-content-between h-100  fspcl pt-1 ">
                                    <div className="d-flex flex-column justify-content-between h-100">
                                      <div className="end_pcl_new end_p_pcl_new">
                                        {e?.MaKingCharge_Unit !== 0 && formatAmount(e?.MaKingCharge_Unit)}
                                      </div>
                                      <div className="fw-bold end_p_pcl_new bg_pcl br_top_pcl end_pcl_new">
                                        {(e?.MaKingCharge_Unit !== 0 && e?.MaKingCharge_Unit)
                                          ? formatAmount(e?.MaKingCharge_Unit)
                                          : '\u00A0'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="lopclcol d-flex flex-column justify-content-between h-100 fspcl pt-1" style={{ borderRight: "0px" }} >
                                    <div className="end_pcl_new end_p_pcl_new">
                                      {(e?.MakingAmount + e?.TotalCsSetcost + e?.TotalDiaSetcost) !== 0 && formatAmount(((e?.MakingAmount + e?.TotalCsSetcost + e?.TotalDiaSetcost) / (result?.header?.CurrencyExchRate)))}
                                    </div>
                                    <div className="end_pcl_new end_p_pcl_new br_top_pcl bg_pcl fw-bold">
                                      {
                                        ((e?.MakingAmount + e?.TotalCsSetcost + e?.TotalDiaSetcost) === 0 ? <div>&nbsp;</div> : (e?.MakingAmount + e?.TotalCsSetcost + e?.TotalDiaSetcost) !== 0 && formatAmount(((e?.MakingAmount + e?.TotalCsSetcost + e?.TotalDiaSetcost) / (result?.header?.CurrencyExchRate))))
                                      }
                                    </div>
                                  </div>
                                </div>

                                {/* othercharge */}
                                <div className="pcltbr1c6 fspcl">
                                  <div className="lopclcol fspcl pt-1 d-flex flex-column justify-content-between h-100 ">
                                    <div>
                                      <div className="left_pcl_new2">{e?.totals?.misc?.onlyIsHSCODE0_Amount === 0 ? '' : 'Other'}</div>
                                      <div className="left_pcl_new2">{e?.TotalDiamondHandling === 0 ? '' : 'Handling'}</div>
                                      <div>
                                        {
                                          e?.other_details?.map((e, i) => {

                                            return (i < 3 && <div key={i} className="text-break left_pcl_new2">{e?.label}</div>)
                                          })
                                        }
                                        {
                                          e?.misc?.map((el, i) => {
                                            return (
                                              ((el?.IsHSCOE === 1 || el?.IsHSCOE === 2 || el?.IsHSCOE === 3) ? <div className="left_pcl_new2">{(el?.Amount === 0 ? '' : (el?.IsHSCOE === 3 ? (el?.ShapeName?.split("_")[1]) : el?.ShapeName))}</div> : '')
                                            )
                                          })
                                        }
                                      </div>
                                    </div>
                                    <div className="bg_pcl br_top_pcl">&nbsp;</div>
                                  </div>
                                  <div className="lopclcol fspcl pt-1 d-flex flex-column justify-content-between h-100" style={{ borderRight: "0px" }} >
                                    <div>
                                      <div className=" d-flex flex-column justify-content-end align-items-end  fspcl">
                                        <div >{e?.totals?.misc?.onlyIsHSCODE0_Amount === 0 ? '' : formatAmount((e?.totals?.misc?.onlyIsHSCODE0_Amount / result?.header?.CurrencyExchRate))}</div>
                                        <div >{e?.TotalDiamondHandling === 0 ? '' : formatAmount((e?.TotalDiamondHandling))}</div>
                                        <div>
                                          {
                                            e?.other_details?.map((el, i) => {
                                              return ((i < 3) ? <div key={i}>{el?.value}</div> : '')
                                            })
                                          }
                                          {
                                            e?.misc?.map((el, i) => {
                                              return (
                                                ((el?.IsHSCOE === 1 || el?.IsHSCOE === 2 || el?.IsHSCOE === 3) ?
                                                  <div key={i}>{(el?.Amount === 0 ? '' : formatAmount((el?.Amount / result?.header?.CurrencyExchRate)))}</div>
                                                  : '')
                                              )
                                            })
                                          }

                                        </div>
                                      </div>
                                    </div>
                                    <div className="bg_pcl end_pcl_new end_p_pcl_new br_top_pcl fw-bold">
                                      {
                                        (e?.other_details?.length === 0 && e?.misc?.length === 0 &&
                                          e?.TotalDiamondHandling === 0 && e?.totals?.misc?.onlyIsHSCODE0_Amount === 0) ? <div>&nbsp;</div> :
                                          formatAmount(((e?.other_details_arr_total_amount + (e?.totals?.misc?.Amount / result?.header?.CurrencyExchRate) + e?.TotalDiamondHandling)))
                                      }
                                    </div>
                                  </div>
                                </div>
                                {/* price */}
                                <div className="pcltbr1c7 fwboldpcl fspcl pt-1" style={{ borderRight: "0px" }} >
                                  <div className="d-flex flex-column justify-content-between h-100  w-100">
                                    <div className="end_pcl_new end_p_pcl_new">{formatAmount(((e?.UnitCost + e?.DiscountAmt) / (result?.header?.CurrencyExchRate)))}</div>
                                    <div className="bg_pcl br_top_pcl end_pcl_new end_p_pcl_new">{formatAmount(((e?.UnitCost+e?.DiscountAmt) / (result?.header?.CurrencyExchRate)))}</div>
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
items-center end_p_pcl_new" style={{ width: "22%" }} >
                              {result?.mainTotal?.diamonds?.Wt !== 0 && result?.mainTotal?.diamonds?.Wt?.toFixed(3)}
                            </div>
                            {/* <div className="dcolsthpcl" style={{ width: "22%" }} ></div> */}
                            <div className="dcolsthpcl  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new" style={{ borderRight: "0px", width: "49%", }} >
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
                              {(result?.mainTotal?.metal?.IsPrimaryMetal)?.toFixed(3)}
                            </div>
                            {/* <div className="dcolsthpcl" style={{ width: "20%" }} ></div> */}
                            <div className="dcolsthpcl  fwboldpcl fspcl d-flex justify-content-end align-items-center end_p_pcl_new" style={{ borderRight: "0px", width: "42%", }} >
                              {result?.mainTotal.metal?.IsPrimaryMetal_Amount !== 0 && formatAmount(((result?.mainTotal.metal?.IsPrimaryMetal_Amount) / (result?.header?.CurrencyExchRate)))}
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
                          <div className="lopcltotrowtb">
                            {/* <div className="lopclcol"></div> */}
                            <div className="lopclcol  fwboldpcl w-100 fspcl d-flex justify-content-end align-items-center end_p_pcl_new" style={{ borderRight: "0px", }} >
                              {(result?.mainTotal?.total_Making_Amount + result?.mainTotal?.total_TotalDiaSetcost + result?.mainTotal?.total_TotalCsSetcost) !== 0 && formatAmount(((result?.mainTotal?.total_Making_Amount + result?.mainTotal?.total_TotalDiaSetcost + result?.mainTotal?.total_TotalCsSetcost) / (result?.header?.CurrencyExchRate)))}
                            </div>
                          </div>
                          <div className="lopcltotrowtb">
                            {/* <div className="lopclcol"></div> */}
                            <div className="lopclcol  fwboldpcl w-100 fspcl d-flex justify-content-end align-items-center end_p_pcl_new" style={{ borderRight: "0px", }} >
                              {(result?.mainTotal?.total_other + result?.mainTotal?.total_diamondHandling + (result?.mainTotal?.totalMiscAmount)) !== 0 &&
                                formatAmount(((result?.mainTotal?.total_other + result?.mainTotal?.total_diamondHandling + result?.mainTotal?.totalMiscAmount) / (result?.header?.CurrencyExchRate)))}
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
