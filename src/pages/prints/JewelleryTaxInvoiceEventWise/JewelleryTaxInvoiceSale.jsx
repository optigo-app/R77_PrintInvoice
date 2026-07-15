import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  NumberWithCommas,
  apiCall,
  checkMsg,
  formatAmount,
  handleImageError,
  handlePrint,
  isObjectEmpty,
  taxGenrator,
} from "../../../GlobalFunctions";
import Loader from "../../../components/Loader";
import style from "../../../assets/css/prints/jewelleryTaxInvoice.module.css";
import style2 from "../../../assets/css/headers/header1.module.css";
import { cloneDeep } from "lodash";
import { OrganizeDataPrint } from "../../../GlobalFunctions/OrganizeDataPrint";
import "../../../assets/css/prints/jtisqm.css";
import "../../../assets/css/prints/JewelleryTaxInvoiceSale.scss";

const JewelleryTaxInvoiceSale = ({
  urls,
  token,
  invoiceNo,
  printName,
  evn,
  ApiVer,
}) => {
  const [loader, setLoader] = useState(true);
  const [result, setResult] = useState();
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [tax, settax] = useState([]);
  const [summary, setSummary] = useState([]);
  const [imgFlag, setImgFlag] = useState(false);
  const [pandingflag, setPandingflag] = useState(false);
  const [showBoxNo, setShowBoxNo] = useState(false);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  const [totalAmount, settotalAmount] = useState({
    before: 0,
    after: 0,
    grand: 0,
  });
  const [json0Data, setJson0Data] = useState({});
  const [customerDetail, setCustomerDetail] = useState({
    pan: "",
    gst: "",
  });
  const [msg, setMsg] = useState("");
  const [addressVal, setAddressVal] = useState("");
  const [MobVal, setMobVal] = useState("");
  const [emailVal, setEmailVal] = useState("");

  const contentRef = useRef(null);
  const footerRef = useRef(null);
  const [spacerStyle, setSpacerStyle] = useState({ height: '0px', pageBreakBefore: 'auto' });

  const loadData = (data) => {
    // console.log("datadata", data);
    let json0Datas = data.BillPrint_Json[0];

    let custDetail = { ...customerDetail };
    if (data.BillPrint_Json[0]?.vat_cst_pan !== "") {
      let custpanGstArr = data.BillPrint_Json[0]?.vat_cst_pan.split("|");
      let custpans = custpanGstArr[1] ? custpanGstArr[1].split("-") : "";
      let custGst = custpanGstArr[0] ? custpanGstArr[0].split("-") : "";
      custDetail.pan = custpans[1] ? custpans[1] : "";
      custDetail.gst = custGst[1] ? custGst[1] : "";
      setCustomerDetail(custDetail);
    }
    setJson0Data(json0Datas);
    let resultArr = [];
    let totalAmountBefore = 0;
    let metalArr = [];
    let diamondWt = 0;
    let labGrownWt = 0;
    let solitaireWt = 0;
    let gemstoneWt = 0;
    let colorStoneWt = 0;
    let miscWt = 0;
    let grossWt = 0;
    data?.BillPrint_Json1.forEach((e) => {
      let findRecord = metalArr.findIndex(
        (elem) => elem?.label === e?.MetalTypePurity
      );
      if (findRecord === -1) {
        metalArr.push({
          label: e?.MetalTypePurity,
          value: e?.NetWt * e?.Quantity,
          gm: true,
        });
      } else {
        metalArr[findRecord].value += e?.NetWt * e?.Quantity;
      }
      grossWt += e?.grosswt * e?.Quantity;
      let diamondWts = 0;
      let labGrownWts = 0;
      let solitaireWts = 0;
      let gemstoneWts = 0;
      let colorStoneWts = 0;
      let miscWts = 0;
      let obj = { ...e };
      let miscWt = 0;
      let materials = [];
      let metal = [];
      totalAmountBefore +=
        e?.TotalAmount / data?.BillPrint_Json[0].CurrencyExchRate;
      let metalColorCode = "";
      data?.BillPrint_Json2.forEach((ele) => {
        if (obj?.SrJobno === ele?.StockBarcode) {
          metal.push(ele);

          if (ele?.IsCenterStone === 1) {
            materials.push(ele);
            return;
          }

          if (
            (ele?.MasterManagement_DiamondStoneTypeid === 1 ||
              ele?.MasterManagement_DiamondStoneTypeid === 2) &&
            ele?.IsHSCOE === 0 && ele?.IsCenterStone !== 1
          ) {
            const getMaterialType = (val) =>
              val === "LabGrown" ? "LabGrown" : "OTHER";
            // let findRecord = materials.findIndex(
            //   (elem) =>
            //     elem?.MasterManagement_DiamondStoneTypeid === ele?.MasterManagement_DiamondStoneTypeid &&
            //     elem?.ShapeName === ele?.ShapeName &&
            //     elem?.Colorname === ele?.Colorname &&
            //     elem?.QualityName === ele?.QualityName &&
            //     elem?.Rate === ele?.Rate &&
            //     elem?.IsCenterStone !== 1 &&
            //     getMaterialType(elem?.MaterialTypeName) === getMaterialType(ele?.MaterialTypeName)
            // );
            let findRecord = materials.findIndex((elem) => {
              const isSameBasic =
                elem?.MasterManagement_DiamondStoneTypeid === ele?.MasterManagement_DiamondStoneTypeid &&
                elem?.ShapeName === ele?.ShapeName &&
                elem?.Colorname === ele?.Colorname &&
                elem?.QualityName === ele?.QualityName &&
                elem?.Rate === ele?.Rate &&
                elem?.IsSolGem === ele?.IsSolGem &&
                elem?.IsCenterStone !== 1;

              if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
                return (
                  isSameBasic &&
                  getMaterialType(elem?.MaterialTypeName) ===
                  getMaterialType(ele?.MaterialTypeName)
                );
              }
              return isSameBasic;
            });
            if (findRecord === -1) {
              materials.push(ele);
            } else {
              materials[findRecord].Pcs += ele?.Pcs;
              materials[findRecord].Wt += ele?.Wt;
              materials[findRecord].Amount += ele?.Amount;

            }
            if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
              
              if (ele?.MaterialTypeName === "LabGrown") {
                labGrownWt += ele?.Wt * obj?.Quantity;
                labGrownWts += ele?.Wt;
              } else {
                if (ele?.IsSolGem === 1) {
                  solitaireWt += ele?.Wt * obj?.Quantity;
                  solitaireWts += ele?.Wt;
                }else{
                diamondWt += ele?.Wt * obj?.Quantity;
                diamondWts += ele?.Wt;
                }
              }
            }
            if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
              if (ele?.IsSolGem === 1) {
                gemstoneWt += ele?.Wt * obj?.Quantity;
                gemstoneWts += ele?.Wt;
              }else{
              colorStoneWt += ele?.Wt * obj?.Quantity;
              colorStoneWts += ele?.Wt;
              }
            }
            if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
              miscWt += ele?.Wt;
              miscWts += ele?.Wt;
            }
          } else if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
            if (ele?.IsPrimaryMetal === 1) {
              metalColorCode = ele?.MetalColorCode;
            } else if (metalColorCode === "") {
              metalColorCode = ele?.MetalColorCode;
            }
          }
        }
      });

      obj.TotalAmount =
        obj.TotalAmount / data?.BillPrint_Json[0].CurrencyExchRate;
      obj.diamondWts = diamondWts;
      obj.labGrownWts = labGrownWts;
      obj.solitaireWts = solitaireWts;
      obj.gemstoneWts = gemstoneWts;
      obj.colorStoneWts = colorStoneWts;
      obj.miscWts = miscWts;
      obj.materials = materials;
      obj.metal = metal;
      obj.metalColorCode = metalColorCode;

      obj.miscWt = miscWt * obj?.Quantity;
      resultArr.push(obj);
    });
    metalArr.push({ label: "Diamond Wt", value: diamondWt, gm: false });
    metalArr.push({ label: "Solitaire Wt", value: solitaireWt, gm: false });
    metalArr.push({ label: "Lab Grown Dia. Wt", value: labGrownWt, gm: false });
    metalArr.push({ label: "Stone Wt", value: colorStoneWt, gm: false });
    metalArr.push({ label: "Gemstone Wt", value: gemstoneWt, gm: false });
    metalArr.push({ label: "Gross Wt", value: grossWt, gm: true });
    let miscQunWt = 0;
    resultArr?.forEach((a) => {
      return (miscQunWt += a?.miscWt);
    });

    setSummary(metalArr);
    let taxValue = taxGenrator(json0Datas, totalAmountBefore);
    let afterTotal =
      taxValue.reduce((accumulator, currentValue) => {
        return accumulator + +currentValue.amount;
      }, 0) + totalAmountBefore;
    let grandTotal = afterTotal + json0Datas.AddLess;
    let totalAmounts = {
      before: totalAmountBefore,
      after: afterTotal,
      grand: grandTotal,
    };
    resultArr?.sort((a, b) => {
      const designNoA = parseInt(a?.id?.toString()?.match(/\d+/)[0]);
      const designNoB = parseInt(b?.id?.toString()?.match(/\d+/)[0]);
      return designNoA - designNoB;
    });

    settotalAmount(totalAmounts);
    settax(taxValue);
    setData(resultArr);
    setOriginalData(resultArr);
  };

  const loadData2 = (data) => {
    const copydata = cloneDeep(data);

    let address = copydata?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    copydata.BillPrint_Json[0].address = address;
    const datas = OrganizeDataPrint(
      copydata?.BillPrint_Json[0],
      copydata?.BillPrint_Json1,
      copydata?.BillPrint_Json2
    );

    let ard =
      copydata?.BillPrint_Json[0]?.customerstate +
      " " +
      copydata?.BillPrint_Json[0]?.customercountry +
      " " +
      copydata?.BillPrint_Json[0]?.customerpincode;
    let emailval = copydata?.BillPrint_Json[0]?.customeremail1;
    let mob = copydata?.BillPrint_Json[0]?.customermobileno;

    setAddressVal(ard);
    setMobVal(mob);
    setEmailVal(emailval);

    setResult(datas);
  };

  useEffect(() => {
    const sendData = async () => {
      try {
        const data = await apiCall(token, invoiceNo, printName, urls, evn, ApiVer);
        if (data?.Status === "200") {
          let isEmpty = isObjectEmpty(data?.Data);
          if (!isEmpty) {
            loadData(data?.Data);
            loadData2(data?.Data);
            setLoader(false);
          } else {
            setLoader(false);
            setMsg("Data Not Found");
          }
        } else {
          setLoader(false);
          const err = checkMsg(data?.Message);
          setMsg(err);
        }
      } catch (error) {
        console.log(error);
      }
    };
    sendData();
  }, []);

  const calculateSpacer = useCallback(() => {
    if (!contentRef.current || !footerRef.current || loader) return;

    setTimeout(() => {
      const contentHeight = contentRef.current.scrollHeight;
      const footerHeight = footerRef.current.scrollHeight;
      const printPageHeight = 1120;

      let heightOnLastPage = contentHeight % printPageHeight;
      if (heightOnLastPage === 0) {
        heightOnLastPage = printPageHeight;
      }

      let spacerHeight = printPageHeight - heightOnLastPage - footerHeight;

      if (spacerHeight < 0) {
        spacerHeight = printPageHeight - footerHeight - 20;
        setSpacerStyle({
          height: `${spacerHeight}px`,
          pageBreakBefore: 'always'
        });
      } else {
        setSpacerStyle({
          height: `${Math.max(spacerHeight, 0)}px`,
          pageBreakBefore: 'auto'
        });
      }

      console.log('✅ SPACER:', spacerHeight, 'px');
    }, 150);
  }, [loader]);

  useEffect(() => {
    if (!loader && data.length > 0) {
      setTimeout(() => calculateSpacer(), 200);
    }
  }, [data, totalAmount, json0Data, calculateSpacer]);

  const handleImgShow = (e) => {
    if (imgFlag) setImgFlag(false);
    else {
      setImgFlag(true);
    }
  };

  const handlePandingflag = (e) => {
    if (pandingflag) setPandingflag(false);
    else {
      setPandingflag(true);
    }
  };

  const handleShowBoxNo = (e) => {
    if (showBoxNo) setShowBoxNo(false);
    else {
      setShowBoxNo(true);
    }
  };

  const handleAddress = (e) => {
    setAddressVal(e.target.value);
  };
  const handleMob = (e) => {
    setMobVal(e.target.value);
  };
  const handleEmail = (e) => {
    setEmailVal(e.target.value);
  };

  useEffect(() => {
    if (showBoxNo) {
      const sorted = [...data].sort((a, b) => {
        const getBoxNumber = (tray) => {
          const match = tray.match(/BOX-(\d+)/);
          return match ? parseInt(match[1], 10) : Infinity;
        };
        const boxA = getBoxNumber(a.Counter_Tray);
        const boxB = getBoxNumber(b.Counter_Tray);
        if (boxA === boxB) {
          return a.SrNo - b.SrNo;
        }

        return boxA - boxB;
      });
      setData(sorted);
    } else {
      setData(originalData);
    }
  }, [showBoxNo])

  // console.log("data", data);

  const filteredData =
    atob(evn) === "memo"
      ? pandingflag
        ? data?.filter((item) => item?.IsEdit == 1)
        : data
      : data;

  return loader ? (
    <Loader />
  ) : msg === "" ? (
    <>
      <div ref={contentRef}>
        <div
          className={`
          container ${style?.mainContent} ${style?.containerJewellery} ${style?.containerJewelleryMaxWidth} jewelleryinvoiceContain jewelleryinvoiceContain_new
        `}
        >
          {/* buttons */}
          <div
            className={`d-flex justify-content-end align-items-center ${style?.print_sec_sum4} mb-4 mt-4`}
          >
            <div className="px-2">
              <input
                type="checkbox"
                onChange={handleShowBoxNo}
                value={showBoxNo}
                checked={showBoxNo}
                id="imgshow"
              />
              <label htmlFor="imgshow" className="user-select-none mx-1">
                Box No.
              </label>
            </div>

            <div className="px-2">
              <input
                type="checkbox"
                onChange={handleImgShow}
                value={imgFlag}
                checked={imgFlag}
                id="headershow"
              />
              <label htmlFor="headershow" className="user-select-none mx-1">
                Header
              </label>
            </div>


            {atob(evn) === "memo" && (

              <div className="px-2">
                <input
                  type="checkbox"
                  onChange={handlePandingflag}
                  value={pandingflag}
                  checked={pandingflag}
                  id="pandingflag"
                />
                <label htmlFor="pandingflag" className="user-select-none mx-1">
                  pending
                </label>
              </div>
            )}



            <div className="form-check ps-3 ">
              <input
                type="button"
                className="btn_white blue py-1"
                value="Print"
                onClick={(e) => handlePrint(e)}
              />
            </div>
          </div>

          {json0Data?.IsBranchWiseAddress === 1 ? (
            <div className="d-flex justify-content-between p-2 jewel_top_main_class_second ">
              <div>
                <div
                  className="branchAddress_jti"
                  dangerouslySetInnerHTML={{ __html: json0Data?.Branch_Address }}
                ></div>
              </div>
              <div>
                {isImageWorking && json0Data?.PrintLogo !== "" && (
                  <img
                    src={json0Data?.PrintLogo}
                    alt=""
                    style={{ height: "75px" }}
                    className={` ms-auto d-block object-fit-contain printImgSmall`}
                    onError={handleImageErrors}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className={`${style2.companyDetails} jewel_top_main_class`}>
              <div
                className={` p-2 `}
                style={{ width: "85%", display: "flex", flexDirection: "column" }}
              >
                <p style={{ fontWeight: "bold", fontSize: "14.5px" }}>
                  {json0Data?.CompanyFullName}
                </p>

                <p className="jewel_top_main_address">
                  {json0Data?.CompanyAddress}
                </p>
                <p
                  className="jewel_top_main_address"
                  style={{ marginTop: "1px" }}
                >
                  {json0Data?.CompanyAddress2}
                </p>
                <p
                  className="jewel_top_main_address"
                  style={{ marginTop: "1px" }}
                >
                  {json0Data?.CompanyCity} - {json0Data?.CompanyPinCode},
                  {json0Data?.CompanyState}({json0Data?.CompanyCountry})
                </p>
                <p
                  className="jewel_top_main_address"
                  style={{ marginTop: "1px" }}
                >
                  T {json0Data?.CompanyTellNo}
                </p>
                <p
                  className="jewel_top_main_address"
                  style={{ marginTop: "1px" }}
                >
                  {json0Data?.CompanyEmail} | {json0Data?.CompanyWebsite}
                </p>
                <p className="jewel_top_main_address_last">
                  {json0Data?.Company_VAT_GST_No} | {json0Data?.Company_CST_STATE}
                  - {json0Data?.Company_CST_STATE_No} | PAN -{" "}
                  {json0Data?.Pannumber}
                </p>
              </div>
              <div
                style={{ width: "30%" }}
                className="d-flex justify-content-end align-item-center h-100"
              >
                {isImageWorking && json0Data?.PrintLogo !== "" && (
                  <img
                    src={json0Data?.PrintLogo}
                    alt=""
                    className={` ms-auto d-block object-fit-contain printImgSmall`}
                    style={{ height: "75px" }}
                    onError={handleImageErrors}
                  />
                )}
              </div>
            </div>
          )}

          <div className="no_break jewel_tax_invoice_setting">
            <div className="border d-flex justify-content-between bottomBorderSetting">
              <div
                className="col-6 jewel_top_customer_add_print"
                style={{ padding: "2px 0px 0px 7px" }}
              >
                <p className=" " style={{ fontSize: "11px", lineHeight: "15px" }}>
                  To,{" "}
                </p>
                {json0Data?.customerfirmname !== "" && (
                  <div className="jewel_customer_addres_line_top">
                    {json0Data?.customerfirmname}
                  </div>
                )}
                {!imgFlag && (
                  <>
                    {json0Data?.customerstreet !== "" && (
                      <div className="jewel_customer_addres_line">
                        {json0Data?.customerstreet}
                      </div>
                    )}
                    {json0Data?.customerregion !== "" && (
                      <div className="jewel_customer_addres_line">
                        {json0Data?.customerregion}
                      </div>
                    )}
                    {json0Data?.customercity !== "" && (
                      <div>{json0Data?.customercity}</div>
                    )}
                  </>
                )}

                {!imgFlag && (
                  <div
                    className=" text-break"
                    style={{
                      width: "180px",
                      fontSize: "11.1px",
                      lineHeight: "13px",
                    }}
                  >
                    {json0Data?.customerstate}, {json0Data?.customercountry}{" "}
                    {json0Data?.customerpincode}
                  </div>
                )}
                {imgFlag && (
                  <input
                    type="text"
                    value={addressVal}
                    style={{
                      height: "17px",
                      width: "200px",
                      outline: "none",
                      border: "none",
                    }}
                    onChange={handleAddress}
                  />
                )}

                {!imgFlag && (
                  <>
                    {json0Data?.customermobileno !== "" && (
                      <div
                        className=""
                        style={{ fontSize: "11.1px", lineHeight: "15px" }}
                      >
                        Tel : {json0Data?.country_code && "+"}{json0Data?.country_code}{" "}{json0Data?.customermobileno}
                      </div>
                    )}
                    <div
                      className=""
                      style={{ fontSize: "11.1px", lineHeight: "15px" }}
                    >
                      {json0Data?.customeremail1}
                    </div>
                  </>
                )}
                {imgFlag && (
                  <>
                    <div>
                      <input
                        type="text"
                        value={MobVal}
                        style={{
                          height: "17px",
                          width: "200px",
                          outline: "none",
                          border: "none",
                        }}
                        onChange={handleMob}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={emailVal}
                        style={{
                          height: "17px",
                          width: "200px",
                          outline: "none",
                          border: "none",
                        }}
                        onChange={handleEmail}
                      />
                    </div>
                  </>
                )}
              </div>
              <div
                className="px-2 d-flex flex-column justify-content-center jewel_top_right_infor"
                style={{ marginRight: "30px" }}
              >
                <p className="lh-1 pb-1 jewel_top_right_add">
                  {atob(evn) === "memo" && "Memo"} Invoice
                  <span className="fw-bold jewel_top_right_add">
                    #: {json0Data?.InvoiceNo}
                  </span>{" "}
                  Dated{" "}
                  <span className="fw-bold jewel_top_right_add">
                    {json0Data?.EntryDate}
                  </span>
                </p>
                {!imgFlag && (
                  <>
                    {customerDetail?.pan !== "" && (
                      <p className="lh-1 pb-1 jewel_top_right_add">
                        PAN
                        <span className="fw-bold jewel_top_right_add">
                          #: {customerDetail?.pan}
                        </span>{" "}
                      </p>
                    )}
                  </>
                )}
                {!imgFlag && (
                  <p className="lh-1 pb-1 jewel_top_right_add">
                    {result?.header?.Cust_VAT_GST_No !== "" && (
                      <>
                        <span className="jewel_top_right_add">GSTIN</span>{" "}
                        <span className="fw-bold jewel_top_right_add">
                          {result?.header?.Cust_VAT_GST_No}
                        </span>
                      </>
                    )}
                    {result?.header?.Cust_VAT_GST_No === "" ? "" : " | "}{" "}
                    {result?.header?.Cust_CST_STATE}{" "}
                    <span className="fw-bold jewel_top_right_add">
                      {" "}
                      {result?.header?.Cust_CST_STATE_No}
                    </span>
                  </p>
                )}

                {!imgFlag && (
                  <>
                    {json0Data?.DueDays !== 0 && (
                      <p className="lh-1 pb-1 jewel_top_right_add">
                        Terms:{" "}
                        <span className="fw-bold jewel_top_right_add">
                          {" "}
                          {json0Data?.DueDays}
                        </span>
                      </p>
                    )}
                    {atob(evn) !== "memo" && (
                      <p className="lh-1 pb-1 jewel_top_right_add">
                        Due Date:{" "}
                        <span className="fw-bold jewel_top_right_add">
                          {json0Data?.DueDate}
                        </span>
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* table header */}
          <div
            className="d-flex border  no_break table_sqm"
            style={{ backgroundColor: "#F2F2F2", height: "25px" }}
          >
            <div className=" col1_sqm border-end">
              <p
                className="fw-bold center_jti_content fs_custom_jti jewel_top_box_title top_table_name_class"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                SR NO
              </p>
            </div>
            <div className={` col2_sqm border-end`}>
              <p
                className="fw-bold center_jti_content fs_custom_jti jewel_top_box_title top_table_name_class"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                ITEM CODE
              </p>
            </div>
            <div className={`${""} col3_sqm border-end`}>
              <p
                className="fw-bold center_jti_content fs_custom_jti jewel_top_box_title top_table_name_class"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                DESCRIPTION
              </p>
            </div>
            <div className={` ${""} col4_sqm border-end  `}>
              <p
                className="fw-bold center_jti_content fs_custom_jti jewel_top_box_title top_table_name_class"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                IMAGE
              </p>
            </div>
            <div className=" col5_sqm">
              <p
                className="fw-bold center_jti_content fs_custom_jti jewel_top_box_title top_table_name_class"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                AMOUNT ({json0Data?.CurrencyCode})
              </p>
            </div>
          </div>

          {/* table data */}
          {filteredData?.length > 0 &&
            filteredData?.map((e, i) => {
              // {console.log("data", data)}

              console.log("TCL: e?.materials", e)
              // const groupedMaterials = e?.materials?.reduce((acc, ele) => {
              //   if (ele?.IsCenterStone === 1) {
              //     acc[`center-stone-${ele?.StockBarcode}`] = {
              //       ...ele,
              //     };
              //   } else {
              //     const key = `${ele?.Shape_Code}-${ele?.Color_Code}-${ele?.Quality_Code}`;
              //     if (acc[key]) {
              //       acc[key].Pcs += ele?.Pcs;
              //       acc[key].Wt += ele?.Wt;
              //     } else {
              //       acc[key] = {
              //         ...ele,
              //         Pcs: ele?.Pcs,
              //         Wt: ele?.Wt,
              //       };
              //     }
              //   }
              //   return acc;
              // }, {});
              // {console.log("data", data)}


              const groupedMaterials = (e?.materials || []).reduce((acc, ele) => {
                if (ele?.IsCenterStone === 1) {
                  acc[`center-stone-${ele?.StockBarcode}`] = { ...ele };
                  return acc;
                }
                const materialType =
                  ele?.MaterialTypeName === "LabGrown" ? "LabGrown" : "OTHER";
                const isDiamond = ele?.MasterManagement_DiamondStoneTypeid === 1;

                const key = isDiamond
                  ? `${materialType}-${ele?.Shape_Code}-${ele?.Color_Code}-${ele?.Quality_Code}-${ele?.IsSolGem}`
                  : `${ele?.Shape_Code}-${ele?.Color_Code}-${ele?.Quality_Code}-${ele?.IsSolGem}`;

                if (acc[key]) {
                  acc[key].Pcs += ele?.Pcs || 0;
                  acc[key].Wt += ele?.Wt || 0;
                } else {
                  acc[key] = {
                    ...ele,
                    Pcs: ele?.Pcs || 0,
                    Wt: ele?.Wt || 0,
                  };
                }

                return acc;
              }, {});
              const mergedMaterials = Object.values(groupedMaterials);


              return (
                <div
                  className="d-flex border-start border-end border-bottom no_break border-top"
                  key={i}
                  style={{ marginBottom: " 4px" }}
                >
                  <div
                    className="col1_sqm p-1 border-end"
                    style={{ width: "11%" }}
                  >
                    <p
                      className="text-center fs_13px_jti"
                      style={{ fontSize: "14px" }}
                    >
                      {i + 1}
                    </p>
                  </div>
                  <div
                    className={`col2_sqm p-1 border-end position-relative`}
                    style={{ width: "14%" }}
                  >
                    {atob(evn)?.trim()?.toLocaleLowerCase() !== "quote" && (
                      <p className="fs_13px_jti" style={{ fontSize: "14px" }}>
                        Job: {e?.SrJobno}{" "}
                      </p>
                    )}
                    <p>
                      Design:{" "}
                      <span
                        className="fw-bold text-break fs_13px_jti"
                        style={{ fontSize: "14px" }}
                      >
                        {e?.designno}
                      </span>{" "}
                    </p>
                    {e?.Size === "" ? (
                      ""
                    ) : (
                      <p
                        className="text-break fs_13px_jti"
                        style={{ fontSize: "14px" }}
                      >
                        {e?.Size}
                      </p>
                    )}
                    {e?.lineid === "" ? (
                      ""
                    ) : (
                      <p
                        className="text-break fs_13px_jti"
                        style={{ fontSize: "14px" }}
                      >
                        {e?.lineid}
                      </p>
                    )}

                    {showBoxNo && (
                      <span
                        className="fw-bold text-break fs_13px_jti"
                        style={{ fontSize: "14px" }}
                      >
                        {e?.Counter_Tray}
                      </span>
                    )}
                  </div>
                  <div
                    className={`col3_sqm p-1 border-end jewelery_description_height border_right_none`}
                  >
                    <p className="text-break text_break_value ">
                      {e?.MetalTypePurity} {e?.metalColorCode} |{" "}
                      {NumberWithCommas(e?.grosswt, 3)} gms GW |{" "}
                      {NumberWithCommas(e?.NetWt, 3)} gms NW
                      {e?.diamondWts !== 0 && (
                        <>
                          {" "}
                          | {atob(evn) === "memo" && "DIA :"}{" "}
                          {NumberWithCommas((e?.diamondWts + e?.labGrownWts), 3)} Cts
                        </>
                      )}
                      {e?.colorStoneWts !== 0 && (
                        <>
                          {" "}
                          | {atob(evn) === "memo" && "CS :"}{" "}
                          {NumberWithCommas(e?.colorStoneWts, 3)} Cts
                        </>
                      )}
                      {e?.miscWts !== 0 && (
                        <>
                          {" "}
                          | {atob(evn) === "memo" && "MISC :"}{" "}
                          {NumberWithCommas(e?.miscWts, 3)} gms
                        </>
                      )}
                    </p>
                    <div key={i}>
                      {mergedMaterials?.map((ele, ind) => (
                        <p key={ind} className="text-break text_break_value_sub">
                          <span className="text-break">
                            {ele?.MasterManagement_DiamondStoneTypeid === 1
                              ? ele?.IsSolGem === 1
                                ? "Diamond: S"
                                : ele?.IsCenterStone === 1
                                  ? "CenterStone"
                                  : ele?.MaterialTypeName === "LabGrown"
                                    ? "Lab Grown Diamond"
                                    : "Diamond"
                              : ele?.MasterManagement_DiamondStoneTypeid === 2
                                ? ele?.IsSolGem === 1
                                  ? "Colorstone: G"
                                  : "Colorstone"
                                : ele?.MasterManagement_DiamondStoneTypeid === 3
                                  ? "Misc"
                                  : ""}
                          </span>
                          :
                          <span style={{ fontSize: "10.5px" }}>
                            {" "}
                            {NumberWithCommas(ele?.Pcs, 0)} Pcs |{" "}
                            {NumberWithCommas(ele?.Wt, 3)}
                            {ele?.MasterManagement_DiamondStoneTypeid === 3
                              ? " gms"
                              : " Cts"}{" "}
                            | {ele?.Shape_Code}
                            {ele?.MasterManagement_DiamondStoneTypeid !== 3 && (
                              <span style={{ fontSize: "10.5px" }}>
                                {" "}
                                {ele?.Color_Code} {ele?.Quality_Code}
                              </span>
                            )}
                          </span>
                        </p>
                      ))}
                    </div>

                    {e?.JobRemark !== "" && (
                      <>
                        {atob(evn) !== "memo" && (
                          <div>
                            <p
                              className="text-decoration-underline fw-bold"
                              style={{ fontSize: "12px" }}
                            >
                              REMARKS{" "}
                            </p>
                            <p style={{ fontSize: "12px" }}>{e?.JobRemark}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div
                    className={`${"col4_sqm"} p-1 border-end d-flex justify-content-center align-items-center`}
                    style={{ borderLeft: "1px solid #dee2e6" }}
                  >
                    <img
                      src={e?.DesignImage}
                      alt=""
                      className={`d-block mx-auto jewel_design_images`}
                      style={{ height: "100px", width: "100px" }}
                      onError={handleImageError}
                    />
                  </div>

                  <div className="col5_sqm p-1">
                    <p
                      className="text-end fs_13px_jti"
                      style={{ fontSize: "13px" }}
                    >
                      <span
                        style={{ fontSize: "13px" }}
                        dangerouslySetInnerHTML={{
                          __html: json0Data?.Currencysymbol,
                        }}
                      ></span>{" "}
                      {NumberWithCommas(e?.TotalAmount, 2)}{" "}
                    </p>
                  </div>
                </div>
              );
            })}

          <div className={`${style?.pgBrkInsid}`}>
            {/* total */}
            <div className="d-flex border-start border-end border-bottom no_break lightGrey total_height_show_jewel">
              <div className="col1_sqm border-end" style={{ width: "11%" }}>
                <p className="text-center"></p>
              </div>
              <div
                className={`${"col2_sqm"} border-end jewel_totalFinal`}
                style={{ width: "14%" }}
              >
                <p
                  className="fw-normal "
                  style={{
                    fontSize: "12.5px",
                    display: "flex",
                    alignItems: "center",
                    padding: "2px 4px",
                  }}
                >
                  TOTAL
                </p>{" "}
              </div>

              <div className="col6_sqm ">
                <p
                  className="text-end fw-bold "
                  style={{ fontSize: "12.7px", padding: "0px 4px" }}
                >
                  <span
                    style={{ fontSize: "13px" }}
                    dangerouslySetInnerHTML={{ __html: json0Data?.Currencysymbol }}
                  ></span>{" "}
                  {NumberWithCommas(totalAmount.before, 2)}{" "}
                </p>
              </div>
            </div>

            {/* Remakrs */}
            <div className="d-flex border-start border-end border-bottom no_break">
              <div className="col_r_1 p-1 border-end" style={{ width: "33%" }}>
                {json0Data?.PrintRemark !== "" && (
                  <p className="fw-bold text-decoration-underline"> REMARKS</p>
                )}
                <div
                  className={`${style?.lh_dec_JTI}`}
                  dangerouslySetInnerHTML={{ __html: json0Data?.PrintRemark }}
                ></div>
              </div>
              <div
                className="col_r_2 p-1 border-end"
                style={{ width: "33%", minHeight: "95px" }}
              >
                {summary.map((e, i) => {
                  return (
                    <React.Fragment key={i}>
                      {e?.value === 0 ? (
                        ""
                      ) : (
                        <div
                          className="d-flex"
                          style={{ width: "80%", justifyContent: "space-between" }}
                          key={i}
                        >
                          <p key={i} className="remark_fs fs_jti_Sale" style={{ minWidth: '60%' }}>
                            {e?.label}:{" "}
                          </p>
                          <p className="remark_fs fs_jti_Sale">
                            {NumberWithCommas(e?.value, 3)} {e?.gm ? "gm" : "cts"}
                          </p>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <div style={{ width: "20%", borderRight: "1px solid #DDDDDD" }}>
                {result?.allTaxes?.map((e, i) => {
                  return (
                    e?.amountInNumber !== 0 && (
                      <div
                        className="d-flex align-items-center justify-content-start ps-1"
                        key={i}
                        style={{ fontSize: "12.8px", height: "25px" }}
                      >
                        {e?.name} @ ({e?.per})
                      </div>
                    )
                  );
                })}

                {result?.allTaxes[0]?.amountInNumber !== 0 &&
                  result?.allTaxes?.length !== 0 && (
                    <div
                      className="d-flex align-items-center justify-content-start ps-1"
                      style={{ fontSize: "12.8px", height: "25px" }}
                    >
                      Total
                    </div>
                  )}

                {result?.header?.AddLess !== 0 && (
                  <div
                    className="d-flex align-items-center justify-content-start ps-1"
                    style={{ fontSize: "12.8px", height: "25px" }}
                  >
                    {result?.header?.AddLess > 0 ? "Add" : "Less"}
                  </div>
                )}
                {result?.header?.FreightCharges !== 0 && (
                  <div
                    className="d-flex align-items-center justify-content-start ps-1"
                    style={{ fontSize: "12.8px", height: "25px" }}
                  >
                    {/* Delivery Charges  */}
                    {result?.header?.ModeOfDel}

                  </div>
                )}
              </div>
              <div style={{ width: "14%" }}>
                {result?.allTaxes?.map((e, i) => {
                  // if (e?.per !== "0.00%") {
                  return (
                    <>
                      {e?.amountInNumber !== 0 && (
                        <div key={i}>
                          <div
                            className="fw-bold d-flex align-items-center justify-content-end pe-1 "
                            style={{
                              fontSize: "12.5px",
                              gap: "2px",
                              height: "25px",
                            }}
                          >
                            <span
                              style={{ fontSize: "13px" }}
                              dangerouslySetInnerHTML={{
                                __html: result?.header?.Currencysymbol,
                              }}
                            ></span>{" "}
                            {e?.amountInNumber?.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </>
                  );
                  // }
                  return null;
                })}

                {result?.allTaxes[0]?.amountInNumber !== 0 &&
                  result?.allTaxes?.length !== 0 && (
                    <div
                      className="fw-bold d-flex align-items-center justify-content-end pe-1 aaaaaa"
                      style={{ fontSize: "12.5px", gap: "2px", height: "25px" }}
                    >
                      {" "}
                      <span
                        style={{ fontSize: "12.5px" }}
                        dangerouslySetInnerHTML={{
                          __html: result?.header?.Currencysymbol,
                        }}
                      ></span>{" "}
                      {NumberWithCommas(
                        totalAmount.before + result?.allTaxesTotal,
                        2
                      )}
                    </div>
                  )}

                {result?.header?.AddLess !== 0 && (
                  <div
                    className="fw-bold d-flex align-items-center justify-content-end pe-1 "
                    style={{ fontSize: "12.5px", gap: "2px" }}
                  >
                    <span
                      style={{ fontSize: "12.5px" }}
                      dangerouslySetInnerHTML={{
                        __html: result?.header?.Currencysymbol,
                      }}
                    ></span>
                    {formatAmount(
                      result?.header?.AddLess / result?.header?.CurrencyExchRate
                    )}
                  </div>
                )}
                {result?.header?.FreightCharges !== 0 && (
                  <div
                    className="fw-bold d-flex align-items-center justify-content-end pe-1 "
                    style={{ fontSize: "12.5px", gap: "2px" }}
                  >
                    <span
                      style={{ fontSize: "12.5px" }}
                      dangerouslySetInnerHTML={{
                        __html: result?.header?.Currencysymbol,
                      }}
                    ></span>
                    {formatAmount(
                      result?.header?.FreightCharges /
                      result?.header?.CurrencyExchRate
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* grand total */}
            <div className="d-flex border-start border-end border-bottom no_break lightGrey">
              <div className="col-8"></div>
              <div className="col-2">
                <p
                  className="fw-bold "
                  style={{ fontSize: "12.8px", padding: "2px" }}
                >
                  GRAND TOTAL
                </p>{" "}
              </div>
              <div className="col-2">
                <p
                  className="text-end fw-bold "
                  style={{ fontSize: "13px", padding: "2px" }}
                >
                  <span
                    style={{ fontSize: "13px" }}
                    dangerouslySetInnerHTML={{ __html: json0Data?.Currencysymbol }}
                  ></span>
                  {formatAmount(
                    result?.mainTotal?.total_amount /
                    result?.header?.CurrencyExchRate +
                    result?.allTaxesTotal +
                    result?.header?.AddLess / result?.header?.CurrencyExchRate +
                    result?.header?.FreightCharges /
                    result?.header?.CurrencyExchRate
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className={`${style?.pgBrkInsid}`}>
            <p
              className={`py-2 ${style.generated} ${style?.pgBrkInsid} no_break static_line_sqm`}
              style={{ color: "rgb(161 159 159)" }}
            >
              ** THIS IS A COMPUTER GENERATED INVOICE AND KINDLY NOTIFY US
              IMMEDIATELY IN CASE YOU FIND ANY DISCREPANCY IN THE DETAILS OF
              TRANSACTIONS{" "}
            </p>
            <div className={`border px-2 no_break ${style?.pgBrkInsid}`}>
              <div
                className="jewel_box_infor_summury"
                dangerouslySetInnerHTML={{ __html: json0Data?.Declaration }}
              ></div>
            </div>
          </div>

          {/* bank detail */}
          <div className="border-start border-end border-bottom d-flex no_break">
            <div
              className={`col-4 border-end p-2 ${style?.lh_dec_JTI}`}
              style={{ width: "42%" }}
            >
              <p className="fw-bold fs_11px_jti" style={{ fontSize: "13px" }}>
                Bank Detail
              </p>
              <p className="fs_11px_jti" style={{ fontSize: "13px" }}>
                Bank Name: {json0Data?.bankname}
              </p>
              <p style={{ fontSize: "13px" }} className="fs_11px_jti text-break">
                Branch: {json0Data?.bankaddress}
              </p>
              <p className="fs_11px_jti" style={{ fontSize: "13px" }}>
                Account Name: {json0Data?.accountname}
              </p>
              <p
                className="fs_11px_jti"
                style={{ fontSize: "13px" }}
                dangerouslySetInnerHTML={{
                  __html: `Account No.: ${json0Data?.accountnumber?.replace(
                    "HKD A/C No :",
                    "<br />HKD A/C No:"
                  )}`,
                }}
              ></p>
              <p className="fs_11px_jti" style={{ fontSize: "13px" }}>
                RTGS/NEFT IFSC: {json0Data?.rtgs_neft_ifsc}
              </p>
            </div>
            <div
              className="col-4 border-end d-flex flex-column justify-content-between "
              style={{ padding: "5px", width: "29%" }}
            >
              <p className="fs_11px_jti" style={{ fontSize: "13px" }}>
                Signature
              </p>
              <p
                style={{ fontSize: "13px", lineHeight: "10px" }}
                className="fs_11px_jti fw-bold"
              >
                {json0Data?.customerfirmname}
              </p>
            </div>
            <div
              className="col-4 d-flex flex-column justify-content-between  "
              style={{ padding: "5px", width: "29%" }}
            >
              <p className="fs_11px_jti" style={{ fontSize: "13px" }}>
                Signature
              </p>
              <p
                style={{ fontSize: "13px", lineHeight: "10px" }}
                className="fw-bold fs_11px_jti"
              >
                {json0Data?.Branch_Description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* <div className={`${style?.printSpacer}`} style={spacerStyle}/>

    <div ref={footerRef} className={`${style?.footer}`}>
      <p>Copyright © 2025. All rights reserved.</p>
    </div> */}
    </>
  ) : (
    <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
      {msg}
    </p>
  );
};

export default JewelleryTaxInvoiceSale;