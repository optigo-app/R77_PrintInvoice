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
import style from "../../assets/css/prints/TaxInvoice5.module.css";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { ToWords } from "to-words";
import style2 from "../../assets/css/headers/header1.module.css";
import { cloneDeep } from "lodash";

const TaxInvoice5 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  const [loader, setLoader] = useState(true);
  const [msg, setMsg] = useState("");
  const [data, setData] = useState([]);
  const [header, setHeader] = useState(null);
  const [footer, setFooter] = useState(null);
  const [address, setAddress] = useState([]);
  const [headerData, setHeaderData] = useState({});
  const [image, setImage] = useState(true);
  const [pnm, setPnm] = useState(atob(printName).toLowerCase());
  const toWords = new ToWords();
  const [isImageWorking, setIsImageWorking] = useState(true);
  const [headerss, setHeaderss] = useState(null);
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
    let headersss = HeaderComponent("3", data?.BillPrint_Json[0]);
    setHeaderss(headersss);
    let datas = OrganizeDataPrint(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );
    let resultArr = [];
    let primaryWts = 0;
    datas?.resultArray.forEach((e, i) => {
      if (e?.GroupJob === "") {
        let obj = cloneDeep(e);
        obj.primaryWt = 0;
        if (obj?.metal?.length <= 1) {
          obj.primaryWt = e?.NetWt + e?.LossWt;
        } else {
          obj.primaryWt = e?.metal?.reduce((acc, cObj) => cObj?.IsPrimaryMetal === 1 ? acc + cObj?.Wt : acc, 0);
        }
        primaryWts += obj?.primaryWt;
        obj.srjobno = e?.SrJobno.split("/");
        resultArr.push(obj);
      } else {
        let findRecord = resultArr.findIndex(
          (elem, index) =>
            elem?.GroupJob === e?.GroupJob && elem?.GroupJob !== ""
        );
        if (findRecord === -1) {
          let obj = cloneDeep(e);
          obj.srjobno = e?.SrJobno.split("/");
          obj.primaryWt = 0;
          if (obj?.metal?.length <= 1) {
            obj.primaryWt = e?.NetWt + e?.LossWt;
          } else {
            obj.primaryWt = e?.metal?.reduce((acc, cObj) => cObj?.IsPrimaryMetal === 1 ? acc + cObj?.Wt : acc, 0);
          }
          primaryWts += obj?.primaryWt;
          resultArr.push(obj);
        } else {
          let obj = cloneDeep(e);
          obj.primaryWt = 0;
          if (obj?.metal?.length <= 1) {
            obj.primaryWt = e?.NetWt + e?.LossWt;
          } else {
            obj.primaryWt = e?.metal?.reduce((acc, cObj) => cObj?.IsPrimaryMetal === 1 ? acc + cObj?.Wt : acc, 0);
          }
          if (e?.GroupJob === e?.SrJobno) {
            resultArr[findRecord].MetalPurity = e?.MetalPurity;
            resultArr[findRecord].JewelCodePrefix = e?.JewelCodePrefix;
            resultArr[findRecord].designno = e?.designno;
            resultArr[findRecord].SrJobno = e?.SrJobno;
          }
          resultArr[findRecord].primaryWt += obj.primaryWt;
          primaryWts += obj?.primaryWt;
          resultArr[findRecord].grosswt += e?.grosswt;
          resultArr[findRecord].NetWt += e?.NetWt;
          resultArr[findRecord].totals.diamonds.Wt += e?.totals?.diamonds?.Wt;
          resultArr[findRecord].totals.colorstone.Wt +=
            e?.totals?.colorstone?.Wt;
          resultArr[findRecord].TotalAmount += e?.TotalAmount;
        }
      }
    });
    datas.mainTotal.primaryWts = primaryWts;
    datas.resultArray = resultArr;
    datas?.resultArray.sort((a, b) => {
      var nameA = a?.JewelCodePrefix?.toUpperCase() + a?.Category_Prefix.toUpperCase() + a?.srjobno[1]?.toUpperCase();
      var nameB = b?.JewelCodePrefix?.toUpperCase() + b?.Category_Prefix.toUpperCase() + b?.srjobno[1]?.toUpperCase();

      const prefixA = nameA?.match(/[A-Za-z]+/)?.[0];
      const prefixB = nameB?.match(/[A-Za-z]+/)?.[0];
      const numericA = parseInt(nameA?.match(/\d+/)[0]);
      const numericB = parseInt(nameB?.match(/\d+/)[0]);

      // Compare prefixes first
      if (prefixA < prefixB) return -1;
      if (prefixA > prefixB) return 1;

      // If prefixes are the same, compare numeric parts
      return numericA - numericB;
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
      className={`container container-fluid  mt-1 ${style?.taxinvoice5} ${style?.max_width_container_ti} pad_60_allPrint`}
    >
      {/* buttons */}
      <div
        className={`d-flex justify-content-end align-items-center ${style?.print_sec_sum4} mb-4`}
      >
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


      {/* header with barcode */}
      {headerData?.IsEinvoice !== 1 ? <>
        <div>
          <div className={`px-2 pb-1 ${style?.fstitle_ti5}`} style={{ fontSize: "24px", fontWeight: "700", textDecoration: "underline #000 3px" }}>{headerData?.PrintHeadLabel}</div>
          <div className={`${style2.companyDetails} ${style?.lhheaderti5}`}>

            <div className={`${style2.companyhead} ${style?.lhheaderti5} p-2 `}>
              <div className={`${style2.lines} ${style?.font_16}`} style={{ fontWeight: "bold" }}>
                {headerData?.CompanyFullName}
              </div>
              <div className={`${style2.lines} ${style?.lhheaderti5}`}>{headerData?.CompanyAddress}</div>
              <div className={`${style2.lines} ${style?.lhheaderti5}`}>{headerData?.CompanyAddress2}</div>
              <div className={`${style2.lines} ${style?.lhheaderti5}`}>{headerData?.CompanyCity}-{headerData?.CompanyPinCode},{headerData?.CompanyState}({headerData?.CompanyCountry})</div>
              <div className={`px-1 fw-bold ${style?.font_16}`}>
                {/* GST No */}
                {headerData?.Company_VAT_GST_No && (
                  <>{headerData.Company_VAT_GST_No}</>
                )}

                {/* Separator */}
                {headerData?.Company_VAT_GST_No &&
                  (headerData?.Company_CST_STATE ||
                    headerData?.Company_CST_STATE_No) &&
                  " | "}

                {/* CST State */}
                {(headerData?.Company_CST_STATE ||
                  headerData?.Company_CST_STATE_No) && (
                    <>
                      {headerData?.Company_CST_STATE}
                      {headerData?.Company_CST_STATE &&
                        headerData?.Company_CST_STATE_No &&
                        "-"}
                      {headerData?.Company_CST_STATE_No}
                    </>
                  )}

                {/* Separator */}
                {headerData?.Pannumber &&
                  (headerData?.Company_VAT_GST_No ||
                    headerData?.Company_CST_STATE ||
                    headerData?.Company_CST_STATE_No) &&
                  " | "}

                {/* PAN */}
                {headerData?.Pannumber && (
                  <>PAN-{headerData.Pannumber}</>
                )}
              </div>

              {/* CIN */}
              {headerData?.CINNO && (
                <div className={`px-1 ${style?.lhheaderti5}`}>
                  CIN-{headerData.CINNO}
                </div>
              )}
            </div>
          </div>

        </div></> : headerss}
      {/* sub header */}
      <div className="d-flex border mb-1">
        <div className="col-5 border-end p-2">
          <p>{headerData?.lblBillTo}</p>
          <p className={`fw-semibold ${style?.font_16}`}>{headerData?.CustName}</p>
          <p>{headerData?.customerAddress1}</p>
          <p>{headerData?.customerAddress2}</p>
          <p>
            {headerData?.customercity1}
            {headerData?.customerpincode}
          </p>
          <p>{headerData?.Cust_CST_STATE_No_?.replaceAll(",", " | ")}</p>
          <p>{headerData?.vat_cst_pan}</p>
        </div>
        <div className="col-4 border-end p-2">
          <p>Ship To,</p>
          <p className={`fw-semibold ${style?.font_16}`}>{headerData?.CustName}</p>
          {address?.map((e, i) => {
            return <p key={i}>{e}</p>;
          })}
        </div>
        <div className="col-3 p-2">
          <p className="d-flex">
            <span className="col-6 fw-semibold pe-2">INVOICE NO	 </span>{" "}
            <span className="col-6">: {headerData?.InvoiceNo}</span>
          </p>
          <p className="d-flex">
            <span className="col-6 fw-semibold pe-2">DATE </span>{" "}
            <span className="col-6">: {headerData?.EntryDate}</span>
          </p>
          <p className="d-flex">
            <span className="col-6 fw-semibold pe-2">{headerData?.HSN_No_Label} </span>
            <span className="col-6">: {headerData?.HSN_No}</span>
          </p>
          <p className="d-flex">
            <span className="col-6 fw-semibold pe-2">TERMS </span>
            <span className="col-6">: {headerData?.DueDays} Days</span>
          </p>
        </div>
      </div>

      {/* table Header */}
      <div className="d-flex mt-1 border">
        <div className={`${style?.Sr}  py-1 border-end`}>
          <p className="text-center fw-bold">Sr. No. </p>
        </div>
        <div className={`${style?.Jewel}  py-1 border-end`}>
          <p className="text-center fw-bold">Jewel Code </p>
        </div>
        <div className={`${style?.KT}  py-1 border-end`}>
          <p className="text-center fw-bold">KT </p>
        </div>
        {pnm === "tax invoice 6" && (
          <div className={`${style?.Diamond}  py-1 border-end`}>
            <p className="text-center fw-bold">HSN </p>
          </div>
        )}
        <div className={`${style?.Gross}  py-1 border-end`}>
          <p className="text-center fw-bold">Gross Wt <span className="fw-normal">(in gm)</span> </p>
        </div>
        <div className={`${style?.Net}  py-1 border-end`}>
          <p className="text-center fw-bold">Net Wt <span className="fw-normal">(in gm)</span> </p>
        </div>
        {pnm !== "tax invoice 6" && (
          <div className={`${style?.Diamond}  py-1 border-end`}>
            <p className="text-center fw-bold">Diamond <span className="fw-normal">(in ct)</span> </p>
          </div>
        )}
        <div className={`${style?.Stone}  py-1 border-end`}>
          <p className="text-center fw-bold">Stone <span className="fw-normal">(in ct)</span> </p>
        </div>
        <div className={`${style?.Price} py-1 `}>
          <p className="text-center fw-bold">Price</p>
        </div>
      </div>
      {/* table data */}
      {data?.resultArray.map((e, i) => {
        return (
          <div className="d-flex border-start border-end border-bottom no_break" key={i}>
            <div className={`${style?.Sr} border-end`}>
              <p className="text-center p-1">{i + 1}</p>
            </div>
            <div className={`${style?.Jewel} border-end ${style?.word_break}`}>
              <p className="p-1">
                {e?.JewelCodePrefix}
                {e?.Category_Prefix?.slice(0, 2)}
                {e?.srjobno[1]}
              </p>
            </div>
            <div className={`${style?.KT} border-end text-center`}>
              <p className="p-1">{e?.MetalType?.toLowerCase() !== "gold" && e?.MetalType} {e?.MetalPurity} </p>
            </div>
            {pnm === "tax invoice 6" && (
              <div className={`${style?.Diamond} border-end text-center`}>
                <p className="p-1">{e?.HSNNo}</p>
              </div>
            )}
            <div className={`${style?.Gross} border-end`}>
              <p className="text-end p-1">{NumberWithCommas(e?.grosswt, 3)}</p>
            </div>
            <div className={`${style?.Net} border-end`}>
              <p className="text-end p-1">
                {NumberWithCommas(e?.primaryWt, 3)}
              </p>
            </div>
            {pnm !== "tax invoice 6" && (
              <div className={`${style?.Diamond} border-end`}>
                <p className="text-end p-1">
                  {NumberWithCommas(e?.totals?.diamonds?.Wt, 3)}
                </p>
              </div>
            )}
            <div className={`${style?.Stone} border-end`}>
              <p className="text-end p-1">
                {NumberWithCommas(e?.totals?.colorstone?.Wt, 3)}{" "}
              </p>
            </div>
            <div className={`${style?.Price}`}>
              <p className="text-end p-1">
                {NumberWithCommas(e?.TotalAmount / headerData?.CurrencyExchRate, 2)}{" "}
              </p>
            </div>
          </div>
        );
      })}
      {/* table total */}
      <div className="d-flex border-start border-end border-bottom no_break">
        <div className={`${style?.Sr} border-end`}>
          <p className="text-center p-1"></p>
        </div>
        <div className={`${style?.Jewel} border-end`}>
          <p className="p-1 fw-bold">TOTAL</p>
        </div>
        <div className={`${style?.KT} border-end`}>
          <p className="p-1"> </p>
        </div>
        {pnm === "tax invoice 6" && (
          <div className={`${style?.Diamond} border-end`}>
            <p className="text-end p-1"></p>
          </div>
        )}
        <div className={`${style?.Gross} border-end`}>
          <p className="text-end p-1 fw-bold">
            {NumberWithCommas(data?.mainTotal?.grosswt, 3)}
          </p>
        </div>
        <div className={`${style?.Net} border-end`}>
          <p className="text-end p-1 fw-bold">
            {NumberWithCommas(data?.mainTotal?.primaryWts, 3)}
          </p>
        </div>
        {pnm !== "tax invoice 6" && <div className={`${style?.Diamond} border-end`}>
          <p className="text-end p-1 fw-bold">
            {NumberWithCommas(data?.mainTotal?.diamonds?.Wt, 3)}
          </p>
        </div>}
        <div className={`${style?.Stone} border-end`}>
          <p className="text-end p-1 fw-bold">
            {NumberWithCommas(data?.mainTotal?.colorstone?.Wt, 3)}
          </p>
        </div>
        <div className={`${style?.Price}`}>
          <p className="text-end p-1 fw-bold">
            {NumberWithCommas(data?.mainTotal?.total_amount / headerData?.CurrencyExchRate, 2)}
          </p>
        </div>
      </div>
      {/* In Words */}
      <div className="d-flex border-start border-end border-bottom no_break">
        <div
          className={`${style?.words} border-end p-1 d-flex justify-content-end flex-column`}
        >
          <p>In Words (Indian Rupees)</p>
          <p className="fw-bold">
            {toWords.convert(+fixedValues((data?.mainTotal?.total_amount / headerData?.CurrencyExchRate) + data?.allTaxes?.reduce((acc, cObj) => acc + +cObj?.amount, 0) + + (headerData?.AddLess / headerData?.CurrencyExchRate), 2))} Only
          </p>
        </div>
        <div className={`${style?.grandTotal}`}>
          <div className="d-flex">
            <div className={`${style?.grandTotalWord} text-end border-end p-1`}>
              {data?.allTaxes?.map((e, i) => {
                return (<p key={i} className={`${style?.font_12}`}> {e?.name} @ {e?.per} </p>);
              })}
              {headerData?.ModeOfDel !== '' && (
                <p className={`${style?.font_12}`}>{headerData?.ModeOfDel}</p>
              )}
              {headerData?.AddLess !== 0 && (
                <p className={`${style?.font_12}`}>{headerData?.AddLess > 0 ? "Add" : "Less"}</p>
              )}
            </div>
            <div className={`${style?.grandTotalValue} p-1 text-end`}>
              {data?.allTaxes.map((e, i) => {
                return <p key={i} className={`${style?.font_12}`}>{NumberWithCommas(e?.amount, 2)}</p>;
              })}
              {headerData?.FreightCharges !== 0 && (
                <p className={`${style?.font_12}`}>{NumberWithCommas(headerData?.FreightCharges / headerData?.CurrencyExchRate, 2)}</p>
              )}
              {headerData?.AddLess !== 0 && (
                <p className={`${style?.font_12}`}>{NumberWithCommas(headerData?.AddLess / headerData?.CurrencyExchRate, 2)}</p>
              )}
            </div>
          </div>
          <div className="d-flex border-top">
            <div className={`${style?.grandTotalWord} text-end border-end p-1`}>
              <p className="fw-bold">GRAND TOTAL</p>
            </div>
            <div className={`${style?.grandTotalValue} p-1 text-end`}>
              <p className="fw-bold">{NumberWithCommas((data?.mainTotal?.total_amount / headerData?.CurrencyExchRate) + (headerData?.FreightCharges / headerData?.CurrencyExchRate) + data?.allTaxes?.reduce((acc, cObj) => acc + +cObj?.amount, 0) + (headerData?.AddLess / headerData?.CurrencyExchRate), 2)}</p>
            </div>
          </div>
        </div>
      </div>
      {/* remarks */}
      <div className="border-start border-end border-bottom p-2 no_break">
        <p > <span className="fw-bold">REMARKS :</span> <span dangerouslySetInnerHTML={{ __html: headerData?.PrintRemark }}></span></p>
      </div>
      {/* Terms Description */}
      {headerData?.SalesRepPolicyTermsDescription !== '' && (
        <div className="border-start border-end border-bottom w-100 px-1 d-flex">
          <p className=""><b>TERMS INCLUDED:</b>&nbsp;
            <span
              dangerouslySetInnerHTML={{
                __html: headerData?.SalesRepPolicyTermsDescription,
              }}
              className=""
            />
          </p>

        </div>
      )}
      {/* declaration */}
      <div
        className={`border-start border-end border-bottom p-2 no_break ${style?.declti}`}
        dangerouslySetInnerHTML={{ __html: headerData?.Declaration }}
      ></div>
      {/* footer */}
      <div className="d-flex border-start border-end border-bottom no_break">
        <div style={{ width: "30%" }} className="border-end p-2 d-flex flex-column justify-content-between">
          <p className="">Signature</p>
          <p>
            <span className="fw-bold">{headerData?.CustName}</span>
            <span className={`${style?.sup}`}></span> (With Stamp)
          </p>
        </div>
        <div style={{ width: "40%" }} className="border-end p-2">
          <p className="fw-bold">Bank Detail</p>
          <div className="d-flex">
            <p className="col-5">Account Name</p>
            <p className="col-7">: {headerData?.accountname}</p>
          </div>
          <div className="d-flex">
            <p className="col-5">Bank Name</p>
            <p className="col-7">: {headerData?.bankname}</p>
          </div>
          <div className="d-flex">
            <p className="col-5">Branch </p>
            <p className="col-7">: {headerData?.bankaddress}</p>
          </div>
          <div className="d-flex">
            <p className="col-5">Account No.  </p>
            <p className="col-7">: {headerData?.accountnumber}</p>
          </div>
          <div className="d-flex">
            <p className="col-5">RTGS/NEFT IFSC</p>
            <p className="col-7">: {headerData?.rtgs_neft_ifsc}</p>
          </div>
        </div>
        <div style={{ width: "30%" }} className="p-2 d-flex flex-column justify-content-between">
          <p className="">Signature</p>
          <p className="fw-bold">{headerData?.CompanyFullName}</p>
        </div>
      </div>
    </div>
  ) : (
    <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
      {msg}
    </p>
  );
};

export default TaxInvoice5;
