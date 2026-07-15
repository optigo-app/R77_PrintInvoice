import React, { useEffect, useState } from "react";
import {
  FooterComponent,
  HeaderComponent,
  NumberWithCommas,
  apiCall,
  checkMsg,
  fixedValues,
  handlePrint,
  isObjectEmpty,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import style from "../../assets/css/prints/TaxInvoice3.module.css";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { ToWords } from "to-words";
import style2 from "../../assets/css/headers/header1.module.css";
import { cloneDeep } from "lodash";

const TaxInvoice3 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  const [loader, setLoader] = useState(true);
  const [msg, setMsg] = useState("");
  const [data, setData] = useState([]);
  const [header, setHeader] = useState(null);
  const [footer, setFooter] = useState(null);
  const [address, setAddress] = useState([]);
  const [headerData, setHeaderData] = useState({});
  const [image, setImage] = useState(true);
  const toWords = new ToWords();
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  const loadData = (data) => {
    let head = HeaderComponent("1", data?.BillPrint_Json[0]);
    setHeader(head);
    setHeaderData(data?.BillPrint_Json[0]);
    let adr = data?.BillPrint_Json[0]?.Printlable.split(`\r\n`);
    setAddress(adr);
    setFooter(FooterComponent("2", data?.BillPrint_Json[0]));
    let datas = OrganizeDataPrint(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );
    let resultArray = [];
    let PrimaryWts = 0;
    let findingSettingAmount = 0;
    datas?.resultArray?.map((e, i) => {
      let obj = cloneDeep(e);
      obj.primaryWt = 0;
      if (e?.metal?.length <= 1) {
        obj.primaryWt = e?.NetWt + e?.LossWt;
      } else {
        obj.primaryWt = e?.metal?.reduce((acc, cObj) => cObj?.IsPrimaryMetal === 1 ? acc + cObj?.Wt : acc, 0);
      }
      PrimaryWts += obj?.primaryWt;
      obj.totals.finding.SettingAmount = obj?.finding?.reduce((acc, cObj) => acc + cObj?.SettingAmount, 0);
      findingSettingAmount += obj?.totals?.finding?.SettingAmount;
      resultArray?.push(obj);
    });
    datas.mainTotal.finding.SettingAmount = findingSettingAmount;
    datas.mainTotal.PrimaryWts = PrimaryWts;
    datas.resultArray = resultArray;

    datas?.resultArray?.sort((a, b) => {
      var nameA = a.designno.toUpperCase(); // Convert names to uppercase for case-insensitive comparison
      var nameB = b.designno.toUpperCase();

      if (nameA < nameB) {
        return -1; // A should come before B
      }
      if (nameA > nameB) {
        return 1; // A should come after B
      }
      return 0; // Names are equal
    });
    setData(datas);
  };

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
        console.error(error);
      }
    };
    sendData();
  }, []);

  return loader ? (
    <Loader />
  ) : msg === "" ? (
    <div
      className={`container container-fluid max_width_container mt-1 ${style?.taxinvoice3} pad_60_allPrint`}
    >
      {/* buttons */}
      <div
        className={`d-flex justify-content-end align-items-center ${style?.print_sec_sum4} mb-4`}
      >
        {/* <div className="form-check pe-3 pt-2">
          <input
            className="form-check-input border-dark"
            type="checkbox"
            checked={image}
            onChange={(e) => setImage(!image)}
          />
          <label className="form-check-label">With Image</label>
        </div> */}
        <div className="form-check ps-3">
          <input
            type="button"
            className="btn_white blue py-2 mt-2"
            value="Print"
            onClick={(e) => handlePrint(e)}
          />
        </div>
      </div>
      {/* header */}
      <div className={`${style2.headline} headerTitle`}>{headerData?.PrintHeadLabel}</div>
      <div className={style2.companyDetails}>
        <div className={`${style2.companyhead} p-2`}>
          <div className={style2.lines} style={{ fontWeight: "bold", fontSize: "16px" }}>
            {headerData?.CompanyFullName}
          </div>
          <div className={style2.lines}>{headerData?.CompanyAddress}</div>
          <div className={style2.lines}>{headerData?.CompanyAddress2}</div>
          <div className={style2.lines}>{headerData?.CompanyCity}-{headerData?.CompanyPinCode},{headerData?.CompanyState}({headerData?.CompanyCountry})</div>
          {/* <div className={style2.lines}>Tell No: {headerData?.CompanyTellNo}</div> */}
          <div className={style2.lines}>T  {headerData?.CompanyTellNo} </div>
          <div className={style2.lines}>
            {headerData?.CompanyEmail} | {headerData?.CompanyWebsite}
          </div>
          <div className={style2.lines}>
            {/* {headerData?.Company_VAT_GST_No} | {headerData?.Company_CST_STATE}-{headerData?.Company_CST_STATE_No} | PAN-{headerData?.Pannumber} */}
            {headerData?.Company_VAT_GST_No} | {headerData?.Company_CST_STATE}-{headerData?.Company_CST_STATE_No} | PAN-{headerData?.Pannumber}
          </div>
          <div className={style2.lines}>
            CIN-{headerData?.CINNO}
          </div>

        </div>
        <div style={{ width: "30%" }} className="d-flex justify-content-end align-item-center h-100">
          {isImageWorking && (headerData?.PrintLogo !== "" &&
            <img src={headerData?.PrintLogo} alt=""
              className={`${style2.headerImg}`}
              onError={handleImageErrors} />)}
          {/* <img src={headerData?.PrintLogo} alt="" className={style2.headerImg} /> */}
        </div>
      </div>

      {/* sub header */}
      <div className="d-flex border mb-1">
        <div className="col-4 border-end p-2">
          <p>{headerData?.lblBillTo}</p>
          <p className={`fw-semibold ${style?.font_14}`}>{headerData?.customerfirmname}</p>
          <p>{headerData?.customerAddress1}</p>
          <p>{headerData?.customerAddress2}</p>
          <p>
            {headerData?.customercity1}
            {headerData?.customerpincode}
          </p>
          <p>{headerData?.customeremail1}</p>
          <p>{headerData?.vat_cst_pan}</p>
          {headerData?.Cust_CST_STATE_No !== "" && (
            <p>
              {headerData?.Cust_CST_STATE}-{headerData?.Cust_CST_STATE_No}
            </p>
          )}
        </div>
        <div className="col-4 border-end p-2">
          <p>Ship To,</p>
          <p className={`fw-semibold ${style?.font_14}`}>{headerData?.customerfirmname}</p>
          {address.map((e, i) => {
            return <p key={i}>{e}</p>;
          })}
        </div>
        <div className="col-4 p-2">
          <p className="d-flex">
            <span className="fw-semibold pe-2 col-6">BILL NO </span>{" "}
            <span className="col-6">{headerData?.InvoiceNo}</span>
          </p>
          <p className="d-flex">
            <span className="fw-semibold pe-2 col-6">DATE </span>{" "}
            <span className="col-6">{headerData?.EntryDate}</span>
          </p>
          <p className="d-flex">
            <span className="fw-semibold pe-2 col-6">{headerData?.HSN_No_Label} </span>
            <span className="col-6">{headerData?.HSN_No}</span>
          </p>
          <p className="d-flex">
            <span className="fw-semibold pe-2 col-6">NAME OF GOODS </span>
            <span className="col-6">{headerData?.NameOfGoods}</span>
          </p>
          <p className="d-flex">
            <span className="fw-semibold pe-2 col-6">PLACE OF SUPPLY </span>
            <span className="col-6">{headerData?.customerstate}</span>
          </p>
          <p className="d-flex">
            <span className="fw-semibold pe-2 col-6">TERMS </span>
            <span className="col-6">{headerData?.DueDays}</span>
          </p>
        </div>
      </div>
      {/* table Header */}
      <div className="d-flex mt-1 border">
        <div
          className={`${style?.Sr} border-end d-flex justify-content-center align-items-center`}
        >
          <p className="text-center fw-bold">Sr#</p>
        </div>
        <div
          className={`${style?.Item} border-end d-flex justify-content-center align-items-center`}
        >
          <p className="text-center fw-bold">Item</p>
        </div>
        <div
          className={`${style?.Purity} border-end d-flex justify-content-center align-items-center`}
        >
          <p className="text-center fw-bold">Purity</p>
        </div>
        <div
          className={`${style?.Qty} border-end d-flex justify-content-center align-items-center`}
        >
          <p className="text-center fw-bold">Qty</p>
        </div>
        <div className={`${style?.Gold} border-end`}>
          <div className="d-grid h-100">
            <div className="d-flex justify-content-center border-bottom">
              <p className="text-center fw-bold">Gold</p>
            </div>
            <div className="d-flex">
              <p className="col-6 text-center fw-bold border-end">Wt.</p>
              <p className="col-6 text-center fw-bold">Amount</p>
            </div>
          </div>
        </div>
        <div className={`${style?.Diamond} border-end`}>
          <div className="d-grid h-100">
            <div className="d-flex justify-content-center border-bottom">
              <p className="text-center fw-bold">Diamond</p>
            </div>
            <div className="d-flex">
              <p className="col-6 text-center fw-bold border-end">Wt.</p>
              <p className="col-6 text-center fw-bold">Amount</p>
            </div>
          </div>
        </div>
        <div className={`${style?.ColorStone} border-end`}>
          <div className="d-grid h-100">
            <div className="d-flex justify-content-center border-bottom">
              <p className="text-center fw-bold">ColorStone</p>
            </div>
            <div className="d-flex">
              <p className="col-6 text-center fw-bold border-end">Wt.</p>
              <p className="col-6 text-center fw-bold">Amount</p>
            </div>
          </div>
        </div>
        <div
          className={`${style?.Others} border-end d-flex justify-content-center align-items-center`}
        >
          <p className="text-center fw-bold">Others</p>
        </div>
        <div
          className={`${style?.Labour} border-end d-flex justify-content-center align-items-center`}
        >
          <p className="text-center fw-bold">Labour</p>
        </div>
        <div
          className={`${style?.Total} d-flex justify-content-center align-items-center`}
        >
          <p className="text-center fw-bold">Total</p>
        </div>
      </div>
      {/* table data */}
      {data?.resultArray.map((e, i) => {
        return (
          <div className="d-flex border-start border-end border-bottom" key={i}>
            <div className={`${style?.Sr} border-end p-1`}>
              <p className="text-center">{i + 1}</p>
            </div>
            <div className={`${style?.Item} border-end p-1 d-flex justify-content-between flex-wrap`}>
              <p className="">{e?.designno} </p>
              <p>{e?.HUID}</p>
            </div>
            <div className={`${style?.Purity} border-end p-1`}>
              <p className="">{e?.MetalPurity} </p>
            </div>
            <div className={`${style?.Qty} border-end p-1`}>
              <p className="text-end">{NumberWithCommas(e?.Quantity, 0)} </p>
            </div>
            <div className={`${style?.Gold} d-flex border-end`}>
              <div className="col-5 border-end">
                <p className="text-end p-1">
                  {NumberWithCommas(e?.primaryWt, 3)}{" "}
                </p>
              </div>
              <div className="col-7">
                <p className="text-end p-1">
                  {NumberWithCommas(e?.MetalAmount, 2)}{" "}
                </p>
              </div>
            </div>
            <div className={`${style?.Diamond} d-flex border-end`}>
              <div className="col-6 border-end">
                <p className="text-end p-1">
                  {NumberWithCommas(e?.totals?.diamonds?.Wt, 3)}{" "}
                </p>
              </div>
              <div className="col-6">
                <p className="text-end p-1">
                  {NumberWithCommas(e?.totals?.diamonds?.Amount, 2)}{" "}
                </p>
              </div>
            </div>
            <div className={`${style?.ColorStone} d-flex border-end`}>
              <div className="col-6 border-end">
                <p className="text-end p-1">
                  {NumberWithCommas(e?.totals?.colorstone?.Wt, 3)}{" "}
                </p>
              </div>
              <div className="col-6">
                <p className="text-end p-1">
                  {NumberWithCommas(e?.totals?.colorstone?.Amount, 2)}{" "}
                </p>
              </div>
            </div>
            <div className={`${style?.Others} border-end p-1`}>
              <p className="text-end">
                {NumberWithCommas(e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling, 2)}{" "}
              </p>
            </div>
            <div className={`${style?.Labour} border-end p-1`}>
              <p className="text-end">
                {NumberWithCommas(e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount + e?.totals?.finding?.SettingAmount, 2)}{" "}
              </p>
            </div>
            <div className={`${style?.Total} p-1`}>
              <p className="text-end">{NumberWithCommas(e?.TotalAmount, 2)}</p>
            </div>
          </div>
        );
      })}
      {/* table total */}
      <div className="d-flex border-start border-end border-bottom">
        <div className={`${style?.Sr} border-end p-1`}>
          <p className="text-center"></p>
        </div>
        <div className={`${style?.Item} border-end p-1`}>
          <p className="fw-bold">TOTAL </p>
        </div>
        <div className={`${style?.Purity} border-end p-1`}>
          <p className=""> </p>
        </div>
        <div className={`${style?.Qty} border-end p-1`}>
          <p className="text-end"> </p>
        </div>
        <div className={`${style?.Gold} d-flex border-end`}>
          <div className="col-5 border-end">
            <p className="text-end fw-semibold p-1">
              {NumberWithCommas(data?.mainTotal?.PrimaryWts, 3)}
            </p>
          </div>
          <div className="col-7">
            <p className="text-end fw-semibold p-1">
              {NumberWithCommas(data?.mainTotal?.MetalAmount, 2)}{" "}
            </p>
          </div>
        </div>
        <div className={`${style?.Diamond} d-flex border-end`}>
          <div className="col-6 border-end">
            <p className="text-end fw-semibold p-1">
              {NumberWithCommas(data?.mainTotal?.diamonds?.Wt, 3)}
            </p>
          </div>
          <div className="col-6">
            <p className="text-end fw-semibold p-1">
              {NumberWithCommas(data?.mainTotal?.diamonds?.Amount, 2)}{" "}
            </p>
          </div>
        </div>
        <div className={`${style?.ColorStone} d-flex border-end`}>
          <div className="col-6 border-end">
            <p className="text-end fw-semibold p-1">
              {" "}
              {NumberWithCommas(data?.mainTotal?.colorstone?.Wt, 3)}{" "}
            </p>
          </div>
          <div className="col-6">
            <p className="text-end fw-semibold p-1">
              {" "}
              {NumberWithCommas(data?.mainTotal?.colorstone?.Amount, 2)}{" "}
            </p>
          </div>
        </div>
        <div className={`${style?.Others} border-end p-1`}>
          <p className="text-end fw-semibold">
            {NumberWithCommas(data?.mainTotal?.total_other + data?.mainTotal?.total_diamondHandling + data?.mainTotal?.totalMiscAmount, 2)}{" "}
          </p>
        </div>
        <div className={`${style?.Labour} border-end p-1`}>
          <p className="text-end fw-semibold">
            {" "}
            {NumberWithCommas(data?.mainTotal?.total_Making_Amount + data?.mainTotal?.diamonds?.SettingAmount + data?.mainTotal?.colorstone?.SettingAmount + data?.mainTotal?.finding?.SettingAmount, 2)}
          </p>
        </div>
        <div className={`${style?.Total} p-1`}>
          <p className="text-end fw-semibold">
            {NumberWithCommas(data?.mainTotal?.total_amount, 2)}
          </p>
        </div>
      </div>
      {/* In Words */}
      <div className="d-flex border-start border-end border-bottom">
        <div
          className={`${style?.words} border-end p-1 d-flex justify-content-end flex-column`}
        >
          <p>In Words Indian Rupees</p>
          <p className="fw-bold">
            {toWords.convert(+fixedValues(data?.mainTotal?.total_amount + data?.allTaxes?.reduce((acc, cObj) => acc+ (+cObj?.amount*headerData?.CurrencyExchRate), 0), 2)+headerData?.AddLess)} Only
          </p>
        </div>
        <div className={`${style?.grandTotal}`}>
          <div className="d-flex">
            <div className="col-6 text-end border-end p-1">
              {data?.allTaxes.map((e, i) => {
                return (
                  <p key={i}>
                    {e?.name} @ {e?.per}
                  </p>
                );
              })}
              {headerData?.AddLess !== 0 && (
                <p>{headerData?.AddLess > 0 ? "Add" : "Less"}</p>
              )}
            </div>
            <div className="col-6 p-1 text-end">
              {data?.allTaxes.map((e, i) => {
                return <p key={i}>{NumberWithCommas(e?.amount * headerData?.CurrencyExchRate, 2)}</p>;
              })}
              {headerData?.AddLess !== 0 && (
                <p>{NumberWithCommas(headerData?.AddLess, 2)}</p>
              )}
            </div>
          </div>
          <div className="d-flex border-top">
            <div className="col-6 text-end border-end p-1">
              <p className="fw-bold">GRAND TOTAL</p>
            </div>
            <div className="col-6 p-1 text-end">
              <p className="fw-bold">{NumberWithCommas(data?.mainTotal?.total_amount + data?.allTaxes?.reduce((acc, cObj) => acc+ (+cObj?.amount*headerData?.CurrencyExchRate), 0)+headerData?.AddLess, 2)}</p>
            </div>
          </div>
        </div>
      </div>
      {/* declaration */}
      <div
        className="border-start border-end border-bottom p-2"
        dangerouslySetInnerHTML={{ __html: headerData?.Declaration }}
      ></div>
      {/* remarks */}
      <div className={` border-start border-end p-2 ${style?.font_14}`}>
        <p>
          <span className="fw-bold">REMARKS : </span>
          {headerData?.PrintRemark}
        </p>
        <div className="py-1 pbias2 fsh2_s2" style={{lineHeight: '1.2'}}><span className="fw-bold">TERMS INCLUDED</span> :
                  <span dangerouslySetInnerHTML={{ __html: headerData?.SalesRepPolicyTermsDescription }}></span>
                  {/* {result?.header?.SalesRepPolicyTermsDescription} */}
        </div>
      </div>
      {footer}
    </div>
  ) : (
    <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
      {msg}
    </p>
  );
};

export default TaxInvoice3;
