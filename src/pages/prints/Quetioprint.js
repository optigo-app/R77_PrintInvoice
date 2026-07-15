//http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=UVQyODE1Mw==&evn=UXVvdGU=&pnm=cHJpbnQgcXVvdGF0aW9u&up=aHR0cDovL3plbi9qby9hcGktbGliL0FwcC9TYWxlQmlsbF9Kc29u&ctv=NzE=&ifid=PackingList3&pid=undefined
import React, { useEffect, useState } from "react";
import "../../assets/css/prints/Quetioprint.scss";
import {
  apiCall,
  formatAmount,
  handleImageError,
  isObjectEmpty,
  mergeMetals,
  mergeFindings,
  NumberWithCommas
} from "../../GlobalFunctions";
import { OrganizeInvoicePrintData } from "../../GlobalFunctions/OrganizeInvoicePrintData";
import Loader from "../../components/Loader";
import { cloneDeep } from "lodash";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";

function Qutation({ token, invoiceNo, printName, urls, evn, ApiVer }) {
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const [diamondDetail, setDiamondDetail] = useState([]);
  const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);
  const [otherData, setOtherData] = useState({
    label: "other",
    psc: 0,
    wt: 0,
  });
  const [categoryCount, setCategoryCount] = useState({
    Ring: 0,
    RINGS: 0,
    Necklace: 0,
    Earring: 0,
    Earrings: 0,
    antiquejewelry: 0,
    Bangles: 0,
    BAGLE: 0,
  });

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
          setMsg(data?.Message);
        }
      } catch (error) {
        console.error(error);
      }
    };
    sendData();
  }, []);

  const loadData = (data) => {
    let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    data.BillPrint_Json[0].address = address;
    const datas = OrganizeInvoicePrintData(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );

    let met_shp_arr = MetalShapeNameWiseArr(datas?.json2);
    let tot_met_wt = 0;
    met_shp_arr?.forEach((e, i) => {
      tot_met_wt += e?.metalfinewt;
    });
    setNotGoldMetalWtTotal(tot_met_wt);

    let diamondArr = [];
    let diamondArr2 = [];
    let diamondArr3 = [];

    let obj = {
      wt: 0,
      psc: 0,
      label: "OTHERS",
    };

    diamondArr = datas?.json2?.filter(
      (data) => data?.MasterManagement_DiamondStoneTypeid === 1
    );
    diamondArr2 = diamondArr?.slice(0, 5);
    diamondArr3 = diamondArr?.slice(5);
    setDiamondDetail(diamondArr2);

    diamondArr3?.forEach((data) => {
      obj.wt += data?.Wt;
      obj.psc += data?.Pcs;
    });
    setOtherData(obj);

    let finalArr = [];

    datas?.resultArray?.forEach((a) => {
      if (a?.GroupJob === "") {
        finalArr.push(a);
      } else {
        let b = cloneDeep(a);

        let find_record = finalArr.findIndex(
          (el) => el?.GroupJob === b?.GroupJob
        );
        if (find_record === -1) {
          finalArr.push(b);
        } else {
          if (
            finalArr[find_record]?.GroupJob !== finalArr[find_record]?.SrJobno
          ) {
            finalArr[find_record].designno = b?.designno;
            finalArr[find_record].HUID = b?.HUID;
          }

          finalArr[find_record].grosswt += b?.grosswt;
          finalArr[find_record].NetWt += b?.NetWt;
          finalArr[find_record].LossWt += b?.LossWt;
          finalArr[find_record].TotalAmount += b?.TotalAmount;
          finalArr[find_record].DiscountAmt += b?.DiscountAmt;
          finalArr[find_record].UnitCost += b?.UnitCost;
          finalArr[find_record].MakingAmount += b?.MakingAmount;
          finalArr[find_record].OtherCharges += b?.OtherCharges;
          finalArr[find_record].TotalDiamondHandling += b?.TotalDiamondHandling;
          finalArr[find_record].Quantity += b?.Quantity;
          finalArr[find_record].Wastage += b?.Wastage;

          finalArr[find_record].diamonds = [
            ...finalArr[find_record]?.diamonds,
            ...b?.diamonds,
          ]?.flat();
          finalArr[find_record].colorstone = [
            ...finalArr[find_record]?.colorstone,
            ...b?.colorstone,
          ]?.flat();
          finalArr[find_record].metal = [
            ...finalArr[find_record]?.metal,
            ...b?.metal,
          ]?.flat();
          finalArr[find_record].misc = [
            ...finalArr[find_record]?.misc,
            ...b?.misc,
          ]?.flat();
          finalArr[find_record].misc_0List = [
            ...finalArr[find_record]?.misc_0List,
            ...b?.misc_0List,
          ]?.flat();
          finalArr[find_record].finding = [
            ...finalArr[find_record]?.finding,
            ...b?.finding,
          ]?.flat();
          finalArr[find_record].other_details_array = [
            ...finalArr[find_record]?.other_details_array,
            ...b?.other_details_array,
          ]?.flat();

          finalArr[find_record].other_details_array_amount +=
            b?.other_details_array_amount;

          finalArr[find_record].totals.diamonds.Wt += b?.totals?.diamonds?.Wt;
          finalArr[find_record].totals.diamonds.Pcs += b?.totals?.diamonds?.Pcs;
          finalArr[find_record].totals.diamonds.Amount +=
            b?.totals?.diamonds?.Amount;
          finalArr[find_record].totals.diamonds.SettingAmount +=
            b?.totals?.diamonds?.SettingAmount;

          finalArr[find_record].totals.finding.Wt += b?.totals?.finding?.Wt;
          finalArr[find_record].totals.finding.Rate = b?.totals?.finding?.Rate;
          finalArr[find_record].totals.finding.Pcs += b?.totals?.finding?.Pcs;
          finalArr[find_record].totals.finding.Amount +=
            b?.totals?.finding?.Amount;
          finalArr[find_record].totals.finding.SettingAmount +=
            b?.totals?.finding?.SettingAmount;

          finalArr[find_record].totals.colorstone.Wt +=
            b?.totals?.colorstone?.Wt;
          finalArr[find_record].totals.colorstone.Pcs +=
            b?.totals?.colorstone?.Pcs;
          finalArr[find_record].totals.colorstone.Amount +=
            b?.totals?.colorstone?.Amount;
          finalArr[find_record].totals.colorstone.SettingAmount +=
            b?.totals?.colorstone?.SettingAmount;

          finalArr[find_record].totals.misc.Wt += b?.totals?.misc?.Wt;
          finalArr[find_record].totals.misc.Pcs += b?.totals?.misc?.Pcs;
          finalArr[find_record].totals.misc.Amount += b?.totals?.misc?.Amount;
          finalArr[find_record].totals.misc.SettingAmount +=
            b?.totals?.misc?.SettingAmount;

          finalArr[find_record].totals.misc.IsHSCODE_0_amount +=
            b?.totals?.misc?.IsHSCODE_0_amount;
          finalArr[find_record].totals.misc.IsHSCODE_0_pcs +=
            b?.totals?.misc?.IsHSCODE_0_pcs;
          finalArr[find_record].totals.misc.IsHSCODE_0_wt +=
            b?.totals?.misc?.IsHSCODE_0_wt;

          finalArr[find_record].totals.metal.Amount += b?.totals?.metal?.Amount;
          finalArr[find_record].totals.metal.Wt += b?.totals?.metal?.Wt;
          finalArr[find_record].totals.metal.Pcs += b?.totals?.metal?.Pcs;

          finalArr[find_record].totals.metal.IsNotPrimaryMetalAmount +=
            b?.totals?.metal?.IsNotPrimaryMetalAmount;
          finalArr[find_record].totals.metal.IsNotPrimaryMetalPcs +=
            b?.totals?.metal?.IsNotPrimaryMetalPcs;
          finalArr[find_record].totals.metal.IsNotPrimaryMetalSettingAmount +=
            b?.totals?.metal?.IsNotPrimaryMetalSettingAmount;
          finalArr[find_record].totals.metal.IsNotPrimaryMetalWt +=
            b?.totals?.metal?.IsNotPrimaryMetalWt;

          finalArr[find_record].totals.metal.IsPrimaryMetalAmount +=
            b?.totals?.metal?.IsPrimaryMetalAmount;
          finalArr[find_record].totals.metal.IsPrimaryMetalPcs +=
            b?.totals?.metal?.IsPrimaryMetalPcs;
          finalArr[find_record].totals.metal.IsPrimaryMetalSettingAmount +=
            b?.totals?.metal?.IsPrimaryMetalSettingAmount;
          finalArr[find_record].totals.metal.IsPrimaryMetalWt +=
            b?.totals?.metal?.IsPrimaryMetalWt;
        }
      }
    });

    datas.resultArray = finalArr;

    let darr = [];
    let darr2 = [];
    let darr3 = [];
    let darr4 = [];

    datas?.resultArray?.forEach((e) => {
      let met2 = [];
      e?.metal?.forEach((a) => {
        if (e?.GroupJob !== "") {
          let obj = { ...a };
          obj.GroupJob = e?.GroupJob;
          met2?.push(obj);
        }
      });

      let met3 = [];
      met2?.forEach((a) => {
        let findrec = met3?.findIndex(
          (el) => el?.StockBarcode === el?.GroupJob
        );
        if (findrec === -1) {
          met3?.push(a);
        } else {
          met3[findrec].Wt += a?.Wt;
        }
      });

      if (e?.GroupJob === "") {
        return;
      } else {
        e.metal = met3;
      }
    });

    datas?.json2?.forEach((el) => {
      if (el?.MasterManagement_DiamondStoneTypeid === 1) {
        if (el?.ShapeName?.toLowerCase() === "rnd") {
          darr.push(el);
        } else {
          darr2.push(el);
        }
      }
    });

    console.log("datas", datas);

    setResult(datas);
  };

  useEffect(() => {
    if (!result || result.length === 0) return;

    const counts = result?.resultArray?.reduce((acc, item) => {
      const category = item.Categoryname;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    console.log("countscounts", counts);

    setCategoryCount({
      Ring: counts["Ring"] || 0,
      RINGS: counts["RINGS"] || 0,
      Necklace: counts["Necklace"] || 0,
      BAGLE: counts["BAGLE"] || 0,
      Bangles: counts["Bangles"] || 0,
      antiquejewelry: counts["antique jewelry"] || 0,
      Earring: counts["Earring"] || 0,
      Earrings: counts["Earrings"] || 0,
    });
  }, []);

  const handleImageErrors = () => {
    setIsImageWorking(false);
  };

  console.log("ress", result);
  return (
    <div className="qut1_main">
      {loader ? (
        <Loader />
      ) : (
        <>
          {msg === "" ? (
            <div className="qut1_print_main_div pb-5 mb-5">
              <div
                style={{ marginBlock: "20px" }}
                className="d-flex justify-content-end w-100"
              >
                <button
                  className="btn_white blue"
                  id="printbtn"
                  accessKey="p"
                  onClick={() => window.print()}
                >
                  Print
                </button>
              </div>
              <div className="qut1_main_header">
                <p style={{ margin: "0px", color: "white" }}>
                  {result?.header?.PrintHeadLabel !== ""
                    ? result?.header?.PrintHeadLabel
                    : "QUOTATION"}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ display: "flex" }}>
                    <b>{result?.header?.CompanyFullName}</b>
                  </p>
                  <p style={{ display: "flex" }}>
                    {result?.header?.CompanyAddress}
                  </p>
                  <p style={{ display: "flex" }}>
                    {result?.header?.CompanyAddress2}
                  </p>
                  <p style={{ display: "flex" }}>
                    {result?.header?.customercity1}-
                    {result?.header?.CompanyPinCode},
                    {result?.header?.CompanyState}(
                    {result?.header?.CompanyCountry})
                  </p>
                  <p style={{ display: "flex" }}>
                    T {result?.header?.CompanyTellNo} | TOLL FREE{" "}
                    {result?.header?.CompanyTollFreeNo} | TOLL FREE{" "}
                    {result?.header?.CompanyTollFreeNo}
                  </p>
                  <p style={{ display: "flex" }}>
                    {result?.header?.CompanyEmail} |{" "}
                    {result?.header?.CompanyWebsite}
                  </p>
                  <p style={{ display: "flex" }}>
                    {result?.header?.Company_VAT_GST_No !== "" &&
                      `${result?.header?.Company_VAT_GST_No} |`}{" "}
                    {result?.header?.Company_CST_STATE_No != "" &&
                      `${result?.header?.Company_CST_STATE} - ${result?.header?.Company_CST_STATE_No} |`}
                    {result?.header?.Com_pannumber != "" &&
                      `PAN-${result?.header?.Com_pannumber}`}
                  </p>
                </div>
                <div>
                  {isImageWorking && (
                    <img
                      src={result?.header?.PrintLogo}
                      style={{
                        width: "100%",
                        maxWidth: "120px",
                        objectFit: "contain",
                      }}
                      onError={handleImageErrors}
                    />
                  )}
                </div>
              </div>
              <div className="qut1_address_main">
                <div className="qut1_address_box1">
                  <p className="qut1_address_box_p">To,</p>
                  <p className="qut1_address_box_p">
                    <b>{result?.header?.customerfirmname}</b>
                  </p>
                  <p className="qut1_address_box_p">
                    {" "}
                    {result?.header?.customerAddress1}{" "}
                  </p>
                  <p className="qut1_address_box_p">
                    {result?.header?.customerAddress2}
                  </p>
                  <p className="qut1_address_box_p">
                    {result?.header?.customercity}-{result?.header?.PinCode}
                  </p>
                  <p className="qut1_address_box_p">
                    {result?.header?.customeremail1}
                  </p>
                  <p className="qut1_address_box_p">
                    GSTIN-{result?.header?.vat_cst_pan}
                  </p>
                  <p className="qut1_address_box_p">
                    {result?.header?.Cust_CST_STATE}-
                    {result?.header?.Cust_CST_STATE_No}
                  </p>
                </div>
                <div className="qut1_address_box2">
                  <p className="qut1_address_box_p"> Ship To,</p>
                  <p className="qut1_address_box_p">
                    <b>{result?.header?.customerfirmname}</b>
                  </p>
                  {result?.header?.address?.map((line, index) => (
                    <React.Fragment key={index}>
                      <p className="qut1_address_box_p">{line}</p>
                    </React.Fragment>
                  ))}
                </div>
                <div className="qut1_address_box3">
                  <p className="qut1_address_box_p">
                    <b style={{ width: "100px", display: "flex" }}>QUOTE NO </b>{" "}
                    {result?.header?.InvoiceNo}
                  </p>
                  <p className="qut1_address_box_p">
                    {" "}
                    <b style={{ width: "100px", display: "flex" }}>DATE </b>
                    {result?.header?.EntryDate}
                  </p>
                 {
                  result?.header?.HSN_No && (
                    <p className="qut1_address_box_p">
                      <b style={{ width: "100px", display: "flex" }}>
                        {" "}
                        HSN
                      </b>
                      {result?.header?.HSN_No}
                    </p>
                  )
                 }
                </div>
              </div>

              <div className="qut1_tableMain_div">
                <div className="Qut1_table_header_maindiv">
                  <div className="qut1_table_header_col1">
                    <p className="qut1_table_header_col_title">Sr</p>
                  </div>
                  <div className="qut1_table_header_col2">
                    <p className="qut1_table_header_col_title">Design</p>
                  </div>
                  <div className="qut1_table_header_col3">
                    <div>
                      <p className="qut1_table_header_col_titleWithSub">
                        Diamond
                      </p>
                    </div>
                    <div className="qut1_table_header_col3_subheader">
                      <p className="qut1_table_header_col3_subheader_1">
                        {" "}
                        Code
                      </p>
                      <p className="qut1_table_header_col3_subheader_2">Size</p>
                      <p className="qut1_table_header_col3_subheader_3">Pcs</p>
                      <p className="qut1_table_header_col3_subheader_4">Wt</p>
                      <p className="qut1_table_header_col3_subheader_5">Rate</p>
                      <p className="qut1_table_header_col3_subheader_6">
                        Amount
                      </p>
                    </div>
                  </div>
                  <div className="qut1_table_header_col4">
                    <div>
                      <p className="qut1_table_header_col_titleWithSub">
                        Metal
                      </p>
                    </div>
                    <div className="qut1_table_header_col4_subheader">
                      <p className="qut1_table_header_col4_subheader_same">
                        {" "}
                        Quality
                      </p>
                      <p className="qut1_table_header_col4_subheader_same">
                        *Wt
                      </p>
                      <p className="qut1_table_header_col4_subheader_same">
                        Net Wt
                      </p>
                      <p className="qut1_table_header_col4_subheader_same">
                        Rate
                      </p>
                      <p className="qut1_table_header_col4_subheader_same_last">
                        Amount
                      </p>
                    </div>
                  </div>
                  <div className="qut1_table_header_col5">
                    <div>
                      <p className="qut1_table_header_col_titleWithSub">
                        Stone
                      </p>
                    </div>
                    <div className="qut1_table_header_col5_subheader">
                      <p
                        className="qut1_table_header_col5_subheader_1"
                        style={{ width: "40%" }}
                      >
                        {" "}
                        Code
                      </p>
                      <p className="qut1_table_header_col5_subheader_2">Size</p>
                      <p className="qut1_table_header_col5_subheader_3">Pcs</p>
                      <p className="qut1_table_header_col5_subheader_4">Wt</p>
                      <p className="qut1_table_header_col5_subheader_5">Rate</p>
                      <p className="qut1_table_header_col5_subheader_6">
                        Amount
                      </p>
                    </div>
                  </div>
                  <div className="qut1_table_header_col6">
                    <div>
                      <p className="qut1_table_header_col_titleWithSub">
                        Other
                      </p>
                    </div>
                    <div>
                      <p className="qut1_table_header_col_titleWithSub">
                        Amount
                      </p>
                    </div>
                  </div>
                  <div className="qut1_table_header_col7">
                    <div>
                      <p className="qut1_table_header_col_titleWithSub">
                        Labour
                      </p>
                    </div>
                    <div className="qut1_table_header_col7_subheader">
                      <p className="qut1_table_header_col7_subheader_1">Rate</p>
                      <p className="qut1_table_header_col7_subheader_last">
                        Amount
                      </p>
                    </div>
                  </div>
                  <div className="qut1_table_header_col8">
                    <p className="qut1_table_header_col_title">Total Amount</p>
                  </div>
                </div>
                <div>
                  <div>
                    {result?.resultArray?.map((data, ind) => {
                        const mergedMetals = mergeMetals(data?.metal);
                        const mergedFindings = mergeFindings(data?.finding);
                      return (
                        <div className="Qut1_table_Data_main">
                          <div className="Qut1_table_Data_col1">
                            <p>{ind + 1}</p>
                          </div>
                          <div className="Qut1_table_Data_col2">
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                width: "100%",
                              }}
                            >
                              <p>{data?.designno}</p>
                              <p>{data?.MetalColor}</p>
                            </div>
                            <div>{data?.MetalColorCode}</div>
                            <div>
                              <img
                                src={data?.DesignImage}
                                style={{
                                  height: "75px",
                                  width: "75px",
                                  objectFit: "contain",
                                }}
                                onError={handleImageError}
                                className="quation_design_img"
                              />
                            </div>
                            <div>
                              {data?.HUID && `HUID-${data?.HUID}`}
                              {data?.PO !== "" && `PO:-${data?.PO}`} <br />G Wt{" "}
                              {data?.grosswt?.toFixed(3)} gm <br />
                              {data?.Size !== "-" && `Size : ${data?.Size}`}
                              <br />
                              {/* {data?.lineid}
                                  Tunch:{data?.Tunch}
                                  {data?.grosswt} gm Gross */}
                            </div>
                          </div>
                          <div
                            className="Qut1_table_Data_col3"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              {data?.diamonds?.map((e, i) => {
                                return (
                                  <div
                                    className="qut1_table_header_col3_subheader"
                                    key={i}
                                  >
                                    <p className="qut1_table_header_col3_subheader_1">
                                      {" "}
                                      {e?.MaterialTypeName}
                                      {e?.ShapeName} {e?.QualityName}{" "}
                                      {e?.Colorname}
                                    </p>
                                    <p className="qut1_table_header_col3_subheader_2">
                                      {e?.SizeName}
                                    </p>
                                    <p className="qut1_table_header_col3_subheader_3">
                                      {e?.Pcs}
                                    </p>
                                    <p className="qut1_table_header_col3_subheader_4">
                                      {e?.Wt?.toFixed(3)}
                                    </p>
                                    <p className="qut1_table_header_col3_subheader_5">
                                      {e?.Rate?.toFixed(2)}
                                    </p>
                                    <p className="qut1_table_header_col3_subheader_6">
                                      <b>
                                        {(
                                          e?.Amount /
                                          result?.header?.CurrencyExchRate
                                        )?.toFixed(2)}
                                      </b>
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                            <div
                              className="qut1_table_header_col3_subheader qut1_table_total_assign_height"
                              style={{
                                backgroundColor: "#f5f5f5",
                              }}
                            >
                              <p className="qut1_table_header_col3_subheader_1 qut1_table_header_col3_totalValues"></p>
                              <p className="qut1_table_header_col3_subheader_2 qut1_table_header_col3_totalValues"></p>
                              <p className="qut1_table_header_col3_subheader_3 qut1_table_header_col3_totalValues">
                                <b>
                                  {data?.totals?.diamonds?.Pcs !== 0 &&
                                    data?.totals?.diamonds?.Pcs}
                                </b>
                              </p>
                              <p className="qut1_table_header_col3_subheader_4 qut1_table_header_col3_totalValues">
                                <b>
                                  {data?.totals?.diamonds?.Wt !== 0 &&
                                    data?.totals?.diamonds?.Wt}
                                </b>
                              </p>
                              <p className="qut1_table_header_col3_subheader_5 qut1_table_header_col3_totalValues"></p>
                              <p className="qut1_table_header_col3_subheader_6 qut1_table_header_col3_totalValues">
                                <b>
                                  {data?.totals?.diamonds?.Amount /
                                    result?.header?.CurrencyExchRate !==
                                    0 &&
                                    (
                                      data?.totals?.diamonds?.Amount /
                                      result?.header?.CurrencyExchRate
                                    )?.toFixed(2)}
                                </b>
                              </p>
                            </div>
                          </div>
                          <div className="Qut1_table_Data_col4">
                            <div>
                              {mergedMetals?.map((e, i) => {
                                return (
                                  <div
                                    className="qut1_table_header_col4_subheader"
                                    key={i}
                                  >
                                    <p
                                      className="qut1_table_header_col4_subheader_data "
                                      style={{
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        wordBreak: "break-word",  
                                        textAlign:"left",
                                      }}
                                    >
                                      {e?.ShapeName} {e?.QualityName}
                                    </p>
                                    <p
                                      className="qut1_table_header_col4_subheader_data"
                                      style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                      }}
                                    >
                                      {/* {data?.grosswt?.toFixed(2)} */}
                                      {
                                                                            e?.IsPrimaryMetal == 1
                                                                              ? (
                                                                                i === 0
                                                                                  ? NumberWithCommas(
                                                                                    data?.NetWt + (data?.totals?.diamonds?.Wt / 5),
                                                                                    3
                                                                                  )
                                                                                  : NumberWithCommas(e?.Wt, 3)
                                                                              )
                                                                              : ""
                                                                          }
                                    </p>
                                    <p
                                      className="qut1_table_header_col4_subheader_data"
                                      style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                      }}
                                    >
                                      {/* {e?.RMwt?.toFixed(2)} */}
                                           {NumberWithCommas(e?.Wt  , 3)}
                                    </p>
                                    <p
                                      className="qut1_table_header_col4_subheader_data"
                                      style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                      }}
                                    >
                                      {(
                                        e?.Rate /
                                        result?.header?.CurrencyExchRate
                                      )?.toFixed(2)}
                                    </p>
                                    <p
                                      className="qut1_table_header_col4_subheader_data"
                                      style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                      }}
                                    >
                                      <b>
                                        {(
                                          e?.Amount /
                                          result?.header?.CurrencyExchRate
                                        )?.toFixed(2)}
                                      </b>
                                      {/* result?.header?.CurrencyExchRate} */}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                            <div>
                              {mergedFindings?.map((e, i) => {
                                return (
                                  <div
                                    className="qut1_table_header_col4_subheader"
                                    key={i}
                                  >
                                    <p className="qut1_table_header_col4_subheader_data" style={{textAlign:"left"}}>
                                      {e?.ShapeName +
                                        " " +
                                        e?.QualityName +
                                        " " +
                                        e?.FindingTypename +
                                        " " +
                                        e?.FindingAccessories}
                                    </p>
                                    <p
                                      className="qut1_table_header_col4_subheader_data"
                                      style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                      }}
                                    >
                                      {e?.grosswt?.toFixed(2)}
                                    </p>
                                    <p
                                      className="qut1_table_header_col4_subheader_data"
                                      style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                      }}
                                    >
                                      {e?.RMwt?.toFixed(2)}
                                    </p>
                                    <p
                                      className="qut1_table_header_col4_subheader_data"
                                      style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                      }}
                                    >
                                      {(
                                        e?.Rate /
                                        result?.header?.CurrencyExchRate
                                      )?.toFixed(2)}
                                    </p>
                                    <p
                                      className="qut1_table_header_col4_subheader_data"
                                      style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                      }}
                                    >
                                      <b>{e?.Amount?.toFixed(2)}</b>
                                      {/* result?.header?.CurrencyExchRate} */}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="qut1_table_header_col4_subheader qut1_table_total_assign_height">
                              <p className="qut1_table_header_col4_subheader_data_total"></p>
                              <p className="qut1_table_header_col4_subheader_data_total">
                                <b>{data?.grosswt?.toFixed(2)} </b>
                              </p>
                              <p className="qut1_table_header_col4_subheader_data_total">
                                <b>
                                  {(data?.NetWt + data?.LossWt)?.toFixed(2)}{" "}
                                </b>
                              </p>
                              <p className="qut1_table_header_col4_subheader_data_total"></p>
                              <p className="qut1_table_header_col4_subheader_data_total">
                                <b>
                                  {(
                                    (data?.totals?.metal?.Amount +data?.totals?.finding?.Amount) /
                                    result?.header?.CurrencyExchRate
                                  )?.toFixed(2)}{" "}
                                </b>
                              </p>
                            </div>
                          </div>
                          <div
                            className="Qut1_table_Data_col5"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              {data?.colorstone?.map((e, i) => {
                                return (
                                  <div
                                    className="qut1_table_header_col5_subheader"
                                    key={i}
                                  >
                                    <p
                                      className="qut1_table_header_col5_subheader_1"
                                      style={{
                                        width: "40%",
                                        display: "flex",
                                        justifyContent: "flex-start",
                                      }}
                                    >
                                      {e?.ShapeName +
                                        " " +
                                        e?.QualityName +
                                        " " +
                                        e?.Colorname}
                                    </p>
                                    <p className="qut1_table_header_col5_subheader_2">
                                      {e?.SizeName}
                                    </p>
                                    <p className="qut1_table_header_col5_subheader_3">
                                      {e?.Pcs}
                                    </p>
                                    <p className="qut1_table_header_col5_subheader_4">
                                      {e?.Wt?.toFixed(2)}
                                    </p>
                                    <p className="qut1_table_header_col5_subheader_5">
                                      {e?.Rate?.toFixed(2)}
                                    </p>
                                    <p className="qut1_table_header_col5_subheader_6">
                                      {(
                                        e?.Amount /
                                        result?.header?.CurrencyExchRate
                                      )?.toFixed(2)}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                            <div
                              className="qut1_table_header_col5_subheader qut1_table_total_assign_height"
                              style={{ backgroundColor: "#f5f5f5" }}
                            >
                              <p
                                className="qut1_table_header_col5_subheader_1 qut1_table_header_col5_totalValues"
                                style={{ width: "40%" }}
                              ></p>
                              <p className="qut1_table_header_col5_subheader_2 qut1_table_header_col5_totalValues"></p>
                              <p className="qut1_table_header_col5_subheader_3 qut1_table_header_col5_totalValues">
                                <b>
                                  {" "}
                                  {data?.totals?.colorstone?.Pcs +
                                    data?.totals?.misc?.Pcs !==
                                    0 &&
                                    data?.totals?.colorstone?.Pcs +
                                      data?.totals?.misc?.Pcs}
                                </b>
                              </p>
                              <p className="qut1_table_header_col5_subheader_4 qut1_table_header_col5_totalValues">
                                <b>
                                  {" "}
                                  {data?.totals?.colorstone?.Wt +
                                    data?.totals?.misc?.Wt !==
                                    0 &&
                                    (
                                      data?.totals?.colorstone?.Wt +
                                      data?.totals?.misc?.Wt
                                    )?.toFixed(3)}
                                </b>
                              </p>
                              <p className="qut1_table_header_col5_subheader_5 qut1_table_header_col5_totalValues"></p>
                              <p className="qut1_table_header_col5_subheader_6 qut1_table_header_col5_totalValues">
                                <b>
                                  {" "}
                                  {data?.totals?.colorstone?.Amount +
                                    data?.totals?.misc?.Amount !==
                                    0 &&
                                    (
                                      (data?.totals?.colorstone?.Amount +
                                        data?.totals?.misc?.Amount) /
                                      result?.header?.CurrencyExchRate
                                    )?.toFixed(2)}
                                </b>
                              </p>
                            </div>
                          </div>
                          <div
                            className="Qut1_table_Data_col6"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
                          >
                            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                              <p>
                                {(
                                  data?.MiscAmount /
                                  result?.header?.CurrencyExchRate
                                )?.toFixed(2)}
                              </p>
                            </div>
                            <div
                              style={{
                                backgroundColor: "#f5f5f5",
                                borderTop: "1px solid #bdbdbd",
                                display: 'flex',
                                justifyContent: 'flex-end'
                              }}
                              className="qut1_table_total_assign_height"
                            >
                              <p>
                                <b>
                                  {(
                                    data?.MiscAmount /
                                    result?.header?.CurrencyExchRate
                                  )?.toFixed(2)}
                                </b>
                              </p>
                            </div>
                          </div>

                          <div
                            className="Qut1_table_Data_col7"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
                          >
                            <div style={{ display: "flex" }}>
                              <p className="qut1_table_header_col7_subheader_1" style={{display: 'flex', justifyContent :'flex-end' , marginRight: '2px'}}>
                                {data?.MaKingCharge_Unit?.toFixed(2)}
                              </p>
                              <p className="qut1_table_header_col7_subheader_1" style={{display: 'flex', justifyContent :'flex-end' , marginRight: '2px'}}>
                                {(
                                  data?.MakingAmount /
                                  result?.header?.CurrencyExchRate
                                )?.toFixed(2)}
                              </p>
                            </div>
                            <div
                              style={{
                                backgroundColor: "#f5f5f5",
                                display: "flex",
                                borderTop: "1px solid #bdbdbd",
                              }}
                              className="qut1_table_total_assign_height"
                            >
                              <p
                                className="qut1_table_header_col7_subheader_1"
                                style={{ borderRight: "1px solid #bdbdbd" }}
                              ></p>
                              <p className="qut1_table_header_col7_subheader_last" style={{display: 'flex', justifyContent: 'flex-end'}}>
                                {data?.MakingAmount?.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div
                            className="Qut1_table_Data_col8"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
                          >
                            <p>
                              <b>
                                {(
                                  data?.TotalAmount /
                                  result?.header?.CurrencyExchRate
                                )?.toFixed(2)}
                              </b>
                            </p>
                            <p
                              style={{
                                backgroundColor: "#f5f5f5",
                                width: "100%",
                                borderTop: "1px solid #bdbdbd",
                              }}
                              className="qut1_table_total_assign_height"
                            >
                              <b>
                                {(
                                  data?.TotalAmount /
                                  result?.header?.CurrencyExchRate
                                ).toFixed(2)}
                              </b>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div
                  style={{
                    padding: "4px",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <div>
                    {result?.allTaxes?.map((data, index) => {
                      return (
                        <div className="paking3_total_div" key={index}>
                          <p>
                            {data?.name} @ {data?.per}
                          </p>
                          {data?.amountInNumber?.toFixed(2)}
                        </div>
                      );
                    })}
                    <div className="paking3_total_div">
                      <p>{result?.header?.AddLess >= 0 ? "Add" : "Less"}</p>
                      {formatAmount(result?.header?.AddLess)}
                    </div>
                  </div>
                </div>
                <div
                  className="Qut1_table_Data_main"
                  style={{
                    backgroundColor: "#f5f5f5",
                    borderTop: "1px solid #BDBDBD",
                  }}
                >
                  <div className="Qut1_table_Data_col1"></div>
                  <div className="Qut1_table_Data_col2">
                    <b>Total</b>
                  </div>
                  <div className="Qut1_table_Data_col3">
                    <div className="qut1_table_header_col3_subheader">
                      <p className="qut1_table_header_col3_subheader_1 qut1_table_header_col3_finalTotalValues"></p>
                      <p className="qut1_table_header_col3_subheader_2 qut1_table_header_col3_finalTotalValues"></p>
                      <p className="qut1_table_header_col3_subheader_3 qut1_table_header_col3_finalTotalValues">
                        <b>{result?.mainTotal?.diamonds?.Pcs}</b>
                      </p>
                      <p
                        className="qut1_table_header_col3_subheader_4 qut1_table_header_col3_finalTotalValues"
                        style={{ width: "25%" }}
                      >
                        {" "}
                        <b>{result?.mainTotal?.diamonds?.Wt?.toFixed(3)}</b>
                      </p>
                      <p className="qut1_table_header_col3_subheader_5 qut1_table_header_col3_finalTotalValues"></p>
                      <p className="qut1_table_header_col3_subheader_6 qut1_table_header_col3_finalTotalValues">
                        <b>
                          {" "}
                          {(
                            result?.mainTotal?.diamonds?.Amount /
                            result?.header?.CurrencyExchRate
                          )?.toFixed(2)}
                        </b>
                      </p>
                    </div>
                  </div>
                  <div className="Qut1_table_Data_col4">
                    <div className="qut1_table_header_col4_subheader">
                      <p className="qut1_table_header_col4_subheader_data qut1_table_header_col4_finalTotalValues"></p>
                      <p className="qut1_table_header_col4_subheader_data qut1_table_header_col4_finalTotalValues">
                        <b>{result?.mainTotal?.grosswt?.toFixed(3)}</b>
                      </p>
                      <p className="qut1_table_header_col4_subheader_data qut1_table_header_col4_finalTotalValues">
                        <b>
                          {" "}
                          {(
                            result?.mainTotal?.NetWt + result?.mainTotal?.LossWt
                          )?.toFixed(3)}
                        </b>
                      </p>
                      <p className="qut1_table_header_col4_subheader_data qut1_table_header_col4_finalTotalValues"></p>
                      <p
                        className="qut1_table_header_col4_subheader_data qut1_table_header_col4_finalTotalValues"
                        style={{
                          width: "30%",
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <b>
                          {" "}
                          {(
                            result?.mainTotal?.metal?.Amount /
                            result?.header?.CurrencyExchRate
                          )?.toFixed(2)}
                        </b>
                      </p>
                    </div>
                  </div>
                  <div className="Qut1_table_Data_col5">
                    <div className="qut1_table_header_col5_subheader">
                      <p className="qut1_table_header_col5_subheader_1"></p>
                      <p className="qut1_table_header_col5_subheader_2"></p>
                      <p className="qut1_table_header_col5_subheader_3">
                        <b>{result?.mainTotal?.colorstone?.Pcs}</b>
                      </p>
                      <p className="qut1_table_header_col5_subheader_4">
                        <b> {result?.mainTotal?.colorstone?.Wt?.toFixed(2)}</b>
                      </p>
                      <p className="qut1_table_header_col5_subheader_5"></p>
                      <p className="qut1_table_header_col5_subheader_6">
                        <b>
                          {" "}
                          {(
                            result?.mainTotal?.diamonds?.Amount /
                            result?.header?.CurrencyExchRate
                          )?.toFixed(2)}
                        </b>
                      </p>
                    </div>
                  </div>
                  <div className="Qut1_table_Data_col6">
                    <div>
                      <b>
                        <p style={{ width: "100%" }}>
                          {(
                            result?.mainTotal?.MakingAmount /
                            result?.header?.CurrencyExchRate
                          )?.toFixed(2)}
                        </p>
                      </b>
                    </div>
                  </div>
                  <div className="Qut1_table_Data_col7">
                    <div>
                      <b>
                        {" "}
                        <p style={{ width: "100%" }}>
                          {(
                            result?.mainTotal?.MakingAmount /
                            result?.header?.CurrencyExchRate
                          )?.toFixed(2)}
                        </p>
                      </b>
                    </div>
                  </div>
                  <div className="Qut1_table_Data_col8">
                    <b>
                      <p>
                        {(
                          result?.mainTotal?.TotalAmount /
                          result?.header?.CurrencyExchRate
                        )?.toFixed(2)}
                      </p>
                    </b>
                  </div>
                </div>
              </div>

              <div className="paking3__bottomSection_main">
                <div className="paking3__bottomSection_Box1">
                  <div className="paking3__bottomSection_Box1_subBox1">
                    <div>
                      <p
                        style={{
                          backgroundColor: "#f1f1f1",
                          borderBottom: "1px solid #bdbdbd",
                        }}
                      >
                        <b>SUMMARY</b>
                      </p>
                    </div>
                    <div style={{ display: "flex" }}>
                      <div
                        style={{
                          width: "50%",
                          borderRight: "1px solid #bdbdbd",
                          padding: "3px",
                        }}
                      >
                        <div className="paking3__bottomSection_Box1_subBox1_summury">
                          <p>
                            <b>GOLD IN 24KT </b>
                          </p>
                          <p>{result?.mainTotal?.PureNetWt?.toFixed(2)} gm</p>
                          {/* {(result?.mainTotal?.PureNetWt - notGoldMetalWtTotal)?.toFixed(3)} gm */}
                        </div>
                        <div className="paking3__bottomSection_Box1_subBox1_summury">
                          <p>
                            <b>GROSS WT</b>
                          </p>
                          <p>{result?.mainTotal?.grosswt?.toFixed(3)} gm</p>
                        </div>
                        <div className="paking3__bottomSection_Box1_subBox1_summury">
                          <p>
                            <b>*(G+D) WT</b>
                          </p>
                          <p>
                            {(
                              result?.mainTotal?.grosswt +
                              result?.mainTotal?.diamonds?.Wt
                            )?.toFixed(3)}{" "}
                            gm
                          </p>
                        </div>
                        <div className="paking3__bottomSection_Box1_subBox1_summury">
                          <p>
                            <b>NET WT</b>
                          </p>
                          <p>
                            {(
                              result?.mainTotal?.NetWt +
                              result?.mainTotal?.LossWt
                            )?.toFixed(3)}{" "}
                            gm
                          </p>
                        </div>

                        <div className="paking3__bottomSection_Box1_subBox1_summury">
                          <p>
                            <b>DIAMOND WT</b>
                          </p>
                          <p>
                            {result?.mainTotal?.diamonds?.Pcs} /{" "}
                            {result?.mainTotal?.diamonds?.Wt?.toFixed(3)} cts
                          </p>
                        </div>
                        <div className="paking3__bottomSection_Box1_subBox1_summury">
                          <p>
                            <b>STONE WT</b>
                          </p>
                          <p>
                            {result?.mainTotal?.colorstone?.Pcs} /{" "}
                            {result?.mainTotal?.colorstone?.Wt?.toFixed(3)} cts
                          </p>
                        </div>
                      </div>
                      <div
                        style={{
                          width: "50%",
                          padding: "3px",
                        }}
                      >
                        <div className="paking3__bottomSection_Box1_subBox1_summury">
                          <p>
                            <b>GOLD </b>
                          </p>
                          <p>
                            {formatAmount(result?.mainTotal?.metal?.Amount)}
                          </p>
                        </div>
                        <div className="paking3__bottomSection_Box1_subBox1_summury">
                          <p>
                            <b>DIAMOND</b>
                          </p>
                          <p>
                            {" "}
                            {formatAmount(
                              result?.mainTotal?.diamonds?.Amount /
                                result?.header?.CurrencyExchRate
                            )}
                          </p>
                        </div>
                        <div className="paking3__bottomSection_Box1_subBox1_summury">
                          <p>
                            <b>CST</b>
                          </p>
                          <p>
                            {formatAmount(
                              result?.mainTotal?.colorstone?.Amount /
                                result?.header?.CurrencyExchRate
                            )}
                          </p>
                        </div>

                        <div className="paking3__bottomSection_Box1_subBox1_summury">
                          <p>
                            <b>MAKING</b>
                          </p>
                          <p>
                            {formatAmount(
                              (result?.mainTotal?.MakingAmount +
                                result?.mainTotal?.diamonds?.SettingAmount +
                                result?.mainTotal?.colorstone?.SettingAmount) /
                                result?.header?.CurrencyExchRate
                            )}
                          </p>
                        </div>
                        <div className="paking3__bottomSection_Box1_subBox1_summury">
                          <p>
                            <b>OTHER</b>
                          </p>
                          <p>{formatAmount(result?.mainTotal?.OtherCharges)}</p>
                        </div>
                        <div className="paking3__bottomSection_Box1_subBox1_summury">
                          <p>
                            <b>
                              {result?.header?.AddLess >= 0 ? "ADD" : "LESS"}
                            </b>
                          </p>
                          <p>{formatAmount(result?.header?.AddLess)}</p>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        backgroundColor: "#f1f1f1",
                      }}
                    >
                      <div
                        style={{
                          width: "50%",
                          borderRight: "1px solid #bdbdbd",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "50%",
                          padding: "3px",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <p>
                          <b>TOTAL</b>
                        </p>
                        <p>
                          <b>
                            {formatAmount(
                              (result?.mainTotal?.TotalAmount +
                                result?.header?.AddLess +
                                result?.header?.FreightCharges +
                                result?.allTaxesTotal) /
                                result?.header?.CurrencyExchRate
                            )}
                          </b>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="paking3__bottomSection_Box1_subBox2">
                    <div>
                      <p
                        style={{
                          backgroundColor: "#f1f1f1",
                          borderBottom: "1px solid #bdbdbd",
                        }}
                      >
                        <b> SUMMARY</b>
                      </p>
                      {/* {diamondDetail?.map((data, ind) => (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "2px",
                          }}
                          key={ind}
                        >
                          <p>
                            {data?.ShapeName} {data?.QualityName}{" "}
                            {data?.Colorname}
                          </p>
                          <p>
                            {data?.Pcs} / {data?.Wt} cts
                          </p>
                        </div>
                      ))} */}

                      <div className="qut_summury_total_box_div">
                        <b>
                          {" "}
                          <p>antique jewelry</p>
                        </b>
                        <p>{categoryCount.antiquejewelry}</p>
                      </div>
                      <div className="qut_summury_total_box_div">
                        <b>
                          {" "}
                          <p>BAGLE</p>
                        </b>
                        <p>{categoryCount.BAGLE}</p>
                      </div>
                      <div className="qut_summury_total_box_div">
                        <b>
                          {" "}
                          <p>Bangles</p>
                        </b>
                        <p>{categoryCount.Bangles}</p>
                      </div>
                      <div className="qut_summury_total_box_div">
                        <b>
                          {" "}
                          <p>Earring</p>
                        </b>
                        <p>{categoryCount.Earring}</p>
                      </div>
                      <div className="qut_summury_total_box_div">
                        <b>
                          {" "}
                          <p>Earrings</p>
                        </b>
                        <p>{categoryCount.Earrings}</p>
                      </div>
                      <div className="qut_summury_total_box_div">
                        <b>
                          {" "}
                          <p>Necklace</p>
                        </b>
                        <p>{categoryCount.Necklace}</p>
                      </div>
                      <div className="qut_summury_total_box_div">
                        <b>
                          {" "}
                          <p>Ring</p>
                        </b>
                        <p>{categoryCount.Ring}</p>
                      </div>
                      <div className="qut_summury_total_box_div">
                        <b>
                          {" "}
                          <p>RINGS</p>
                        </b>
                        <p>{categoryCount.RINGS}</p>
                      </div>
                      {/* <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "2px",
                        }}
                      >
                        <p>OTHERS</p>
                        <p>
                          {otherData?.psc} / {otherData?.wt?.toFixed(3)} cts
                        </p>
                      </div> */}
                    </div>
                  </div>
                </div>
                <div className="paking3__bottomSection_Box2">
                  <div className="paking3__bottomSection_Box2_subBox2">
                    <p style={{ display: "flex", margin: "0px" }}>Created By</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
              {" "}
              {msg}{" "}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default Qutation;

// QT28153   qut number
