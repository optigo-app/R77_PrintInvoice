// http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=TVMvNDk0LzIwMjQ=&evn=TWF0ZXJpYWwgU2FsZQ==&pnm=SW52b2ljZSBQcmludA==&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvTWF0ZXJpYWxCaWxsX0pzb24=&ctv=NzE=&ifid=TaxInvoiceA&pid=undefined
import React, { useEffect } from "react";
import "../../assets/css/prints/InvoicePrintMaterialSale.css";
import { useState } from "react";
import {
  NumberWithCommas,
  HeaderComponent,
  apiCall,
  checkMsg,
  fixedValues,
  formatAmount,
  handlePrint,
  isObjectEmpty,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import { ToWords } from "to-words";

const InvoicePrintMaterial = ({
  token,
  invoiceNo,
  printName,
  urls,
  evn,
  ApiVer,
}) => {
  const [loader, setLoader] = useState(true);
  const [json0Data, setJson0Data] = useState({});
  const [msg, setMsg] = useState("");
  const [finalD, setFinalD] = useState({});
  const [custAddress, setCustAddress] = useState([]);
  const [taxAmont, setTaxAmount] = useState();
  const [extraTaxAmont, setExtraTaxAmount] = useState();
  const toWords = new ToWords();
  const [headFlag, setHeadFlag] = useState(true);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const [headerss, setHeaderss] = useState(null);
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
            let address =
              data?.Data?.MaterialBill_Json[0]?.Printlable?.split("\r\n");
            setCustAddress(address);
            let headersss = HeaderComponent("3", data?.Data?.MaterialBill_Json[0], true);
            setHeaderss(headersss);
            // console.log("data", data);

            setJson0Data(data?.Data?.MaterialBill_Json[0]);
            const sortedItems = [...(data?.Data?.MaterialBill_Json1 || [])].sort(
              (a, b) => parseFloat(a?.ItemId || 0) - parseFloat(b?.ItemId || 0)
            );
            setFinalD(sortedItems);
            setTaxAmount(data?.Data?.MaterialBill_Json2[0]);
            setExtraTaxAmount(data?.Data?.MaterialBill_Json3);
            // console.log("data?.Data?.MaterialBill_Json3", data?.Data?.MaterialBill_Json3);

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

  function PrintableText({ json0Data }) {
    const htmlContent = json0Data?.Printlable?.replace(/\n/g, '<br />');

    return (
      <div
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  function convertWithAnd(amount) {
    let words = toWords.convert(amount);

    const pattern = /\bHundred\b\s+(?!(Thousand|Lakh|Crore|Only))(.+)/i;
    if (pattern.test(words)) {
      words = words.replace(pattern, (match, p1, p2) => {
        return `Hundred and ${p2}`;
      });
    }

    return words;
  }

  const totalWeight = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
    const weight = parseFloat(item?.Weight);
    return sum + (isNaN(weight) ? 0 : weight);
  }, 0);

  const totalPureWeight = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
    const PureWeight = parseFloat(item?.PureWeight);
    return sum + (isNaN(PureWeight) ? 0 : PureWeight);
  }, 0);

  const totalPieces = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
    const pieces = parseFloat(item?.pieces);
    return sum + (isNaN(pieces) ? 0 : pieces);
  }, 0);

  const totalAmount = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
    const Amount = parseFloat(item?.Amount);
    return sum + (isNaN(Amount) ? 0 : Amount);
  }, 0);


  const totalLabAmount = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
    const LabourAmt = parseFloat(item?.LabourAmt);
    return sum + (isNaN(LabourAmt) ? 0 : LabourAmt);
  }, 0);


  const totalEtraTaxAmount = (Array.isArray(extraTaxAmont) ? extraTaxAmont : []).reduce((sum, item) => {
    const amount = parseFloat(item?.TaxAmount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const totalDiscountAMT = Array.isArray(finalD)
    ? finalD
      .filter((e) => e?.ItemName?.toLowerCase() === "diamond")
      .reduce((sum, item) => sum + (parseFloat(item?.DiscountAmount) || 0), 0)
    : 0;

  const GrandTotal =
    ((totalAmount || 0) +
      (totalEtraTaxAmount || 0) +
      (taxAmont?.tax1Amount || 0) +
      (taxAmont?.tax2Amount || 0) +
      (taxAmont?.tax3Amount || 0)) - totalDiscountAMT;

  // console.log("taxAmont", taxAmont);
  // console.log("extraTaxAmont", extraTaxAmont);
  // console.log("json0Data", json0Data);
  console.log("finalD", finalD);

  const allowedNames = ["mount", "finding"];
  const isFindingOrMount = Array.isArray(finalD) ? finalD.some((e) => allowedNames.includes(e?.ItemName?.toLowerCase())) : false;

  const allowedNamesForRate = ["Metal", "METAL", "metal", "MOUNT", "Mount", "mount", "FINDING", "Finding", "finding"];

  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <>
          <div className="w-full flex">
            <div className="w-full flex items-center justify-end spfnthead head_Chkbx d-none-print">
              <input
                type="checkbox"
                id="Finding"
                className="mx-1"
                checked={headFlag}
                onChange={() => setHeadFlag(!headFlag)}
              />
              <label htmlFor="Finding" className="me-3 user-select-none">Header</label>
            </div>
            <div className="prnt_btn">
              <input
                type="button"
                className="btn_white blue mt-0"
                value="Print"
                onClick={(e) => handlePrint(e)}
              />
            </div>
          </div>

          <div className="w-full flex items-center justify-center">
            <div className="container_inv2">


              {json0Data?.iseinvoice != 1 ?
                <>
                  <div className="headlineJL w-100 p-2">
                    <b style={{ fontSize: "20px" }}>
                      {json0Data?.PrintHeadLbl}
                    </b>
                  </div>
                  {headFlag && (
                    <div className="disflx justify-content-between" style={{ marginBottom: "10px" }}>
                      <div className="spfnthead" style={{ paddingLeft: "5px" }}>
                        {json0Data?.CompanyFullName !== "" && (<div className="spfntBld" style={{ fontSize: "15px" }}>{json0Data?.CompanyFullName}</div>)}
                        {json0Data?.CompanyAddress !== "" && (<div className="">{json0Data?.CompanyAddress}</div>)}
                        {/* <div className="">{json0Data?.CompanyAddress2}</div> */}
                        <div className="">{json0Data?.CompanyCity} {json0Data?.CompanyCity && json0Data?.CompanyPinCode !== "" && ("-")} {json0Data?.CompanyPinCode !== "" && (`${json0Data?.CompanyPinCode},`)} {json0Data?.CompanyState}{json0Data?.CompanyCountry !== "" && (`(${json0Data?.CompanyCountry})`)}</div>
                        {json0Data?.CompanyTellNo !== "" && (<div className="">T {json0Data?.CompanyTellNo}</div>)}
                        <div className="">{json0Data?.CompanyEmail} {json0Data?.CompanyWebsite && json0Data?.CompanyEmail !== "" && ("|")} {json0Data?.CompanyWebsite}</div>
                        <div className="">{json0Data?.Company_VAT_GST_No !== "" && (`${json0Data?.Company_VAT_GST}-${json0Data?.Company_VAT_GST_No}`)} {json0Data?.Company_VAT_GST_No && json0Data?.Company_CST_STATE_No !== "" && ("|")} {json0Data?.Company_CST_STATE_No !== "" && (`${json0Data?.Company_CST_STATE}-${json0Data?.Company_CST_STATE_No}`)} {json0Data?.Company_CST_STATE_No && json0Data?.ComPanCard !== "" && ("|")} {json0Data?.ComPanCard !== "" && (`PAN-${json0Data?.ComPanCard} `)}</div>
                      </div>

                      {typeof json0Data?.PrintLogo === 'string' && json0Data.PrintLogo.trim() !== '' && (
                        <div>
                          <img
                            src={json0Data.PrintLogo}
                            alt="#companylogo"
                            className="cmpnyLogo"
                            onError={handleImageErrors}
                          />
                        </div>
                      )}

                    </div>
                  )}
                </>
                :
                headerss
              }


              {/** Header */}
              <div className="disflx brbxAll">
                <div className="w1_inv2 spbrRht spfnthead">
                  <div style={{ paddingTop: "2px" }}>Bill To,</div>
                  {json0Data?.customerfirmname !== "" && (<div className="spfntsZ spfntBld">{json0Data?.customerfirmname}</div>)}
                  {json0Data?.customerAddress1 !== "" && (<div>{json0Data?.customerAddress1}</div>)}
                  {json0Data?.customerAddress2 !== "" && (<div>{json0Data?.customerAddress2}</div>)}
                  {json0Data?.PinCode !== "" && (<div>{json0Data?.PinCode}</div>)}
                  {json0Data?.customeremail !== "" && (<div>{json0Data?.customeremail}</div>)}
                  <div>{json0Data?.Cust_VAT_GST_No !== "" && (`${json0Data?.Cust_VAT_GST}-${json0Data?.Cust_VAT_GST_No}`)} {json0Data?.Cust_VAT_GST_No && json0Data?.customerPANno !== "" && ("|")} {json0Data?.customerPANno !== "" && (`PAN-${json0Data?.customerPANno}`)}</div>
                  {json0Data?.Cust_CST_STATE_No !== "" && (<div>{json0Data?.Cust_CST_STATE}-{json0Data?.Cust_CST_STATE_No}</div>)}
                  {json0Data?.customeraadharno !== "" && (<div>Adhar-{json0Data.customeraadharno}</div>)}
                </div>
                <div className="w2_inv2 spbrRht spfnthead">
                  <div style={{ paddingTop: "2px" }}>Ship To,</div>
                  {json0Data?.customerfirmname !== "" && (<div className="spfntsZ spfntBld">{json0Data?.customerfirmname}</div>)}
                  {json0Data?.Printlable !== "" && (<div><PrintableText json0Data={json0Data} /></div>)}
                </div>
                <div className="w30_inv2 spfnthead">
                  <div className="disflx" style={{ paddingTop: "2px" }}>
                    {json0Data?.InvoiceNo !== "" && (<>
                      <div className="wdthHd spfntBld">BILL NO</div>
                      <div className="wdthHd1">{json0Data?.InvoiceNo}</div>
                    </>)}
                  </div>
                  <div className="disflx">
                    {json0Data?.EntryDate !== "" && (<>
                      <div className="wdthHd spfntBld">DATE</div>
                      <div className="wdthHd1">{json0Data?.EntryDate}</div>
                    </>)}
                  </div>
                  <div className="disflx">
                    <div className="wdthHd spfntBld">DUE DAYS</div>
                    <div className="wdthHd1">{json0Data?.OrderDue}</div>
                  </div>
                </div>
              </div>

              {/** Table Header */}
              <div className="disflx brbxAll spfntbH" style={{ marginTop: "5px" }}>
                {isFindingOrMount ? (
                  <>
                    <div className="col1_inv2lab spfntBld spbrRht spfntCen">Sr#</div>
                    <div className="col2_inv2lab spfntBld spfntCen spbrRht">Description</div>
                    <div className="col3_inv2lab spfntBld spfntCen spbrRht">HSN#</div>
                    <div className="col4_inv2lab spfntBld spbrRht spfntCen">Shape</div>
                    <div className="col5_inv2lab spbrRht spfntBld spfntCen">Quality</div>
                    <div className="spbrRht col6_inv2lab spfntBld spfntCen">Color</div>
                    <div className="col7_inv2lab spfntBld spbrRht spfntCen">Size</div>
                    <div className="col8_inv2lab spbrRht spfntBld spfntCen">Weight</div>
                    <div className="col9_inv2lab spbrRht spfntBld spfntCen">Pure Wt</div>
                    <div className="col10_inv2lab spbrRht spfntBld spfntCen">Pieces</div>
                    <div className="col11_inv2lab spfntBld spbrRht spfntCen">Rate</div>
                    <div className="col12_inv2lab spfntBld spfntCen spbrRht">Amount</div>
                    <div className="col13_inv2lab spfntBld spfntCen spbrRht">Lab.<br />Rate</div>
                    <div className="col14_inv2lab spfntBld spbrWord spfntCen spbrRht">Lab<br />Amount</div>
                    <div className="col15_inv2lab spfntBld spfntCen spbrRht">Discount</div>
                    <div className="col16_inv2lab spfntBld spbrWord spfntCen">Taxable Amount</div>
                  </>
                ) : (
                  <>
                    <div className="col1_inv2 spfntBld spbrRht spfntCen">Sr#</div>
                    <div className="col2_inv2 spfntBld spfntCen spbrRht">Description</div>
                    <div className="col3_inv2 spfntBld spfntCen spbrRht">HSN#</div>
                    <div className="col4_inv2 spfntBld spbrRht spfntCen">Shape</div>
                    <div className="col5_inv2 spbrRht spfntBld spfntCen">Quality</div>
                    <div className="spbrRht col6_inv2 spfntBld spfntCen">Color</div>
                    <div className="col7_inv2 spfntBld spbrRht spfntCen">Size</div>
                    <div className="col8_inv2 spbrRht spfntBld spfntCen">Weight</div>
                    <div className="col9_inv2 spbrRht spfntBld spfntCen">Pure Wt</div>
                    <div className="col10_inv2 spbrRht spfntBld spfntCen">Pieces</div>
                    <div className="col11_inv2 spfntBld spbrRht spfntCen">Rate</div>
                    <div className="col12_inv2 spfntBld spbrRht spfntCen">Discount</div>
                    <div className="col13_inv2 spfntBld spfntCen">Taxable Amount</div>
                  </>
                )
                }
              </div>

              {/** table Body */}
              {finalD?.map((e, i) => {
                return (
                  isFindingOrMount ? (
                    <>
                      <div key={i} className="disflx spbrlFt brBtom spfntbH">
                        <div className="col1_inv2lab spbrRht spfntCen">{i + 1}</div>
                        <div className="Sucol2_inv2lab spbrRht spbrWord">
                          {/* e?.ItemName?.toLowerCase() === "diamond" ? "CUT AND POLISHED DIAMOND" 01/11/2025_3:10 */}
                          {
                            e?.ItemName?.toLowerCase() === "diamond" ? "DIAMOND"
                              : e?.ItemName?.toLowerCase() === "color stone" ? "STONE"
                                : e?.ItemName?.toLowerCase() === "metal" && e?.shape?.toLowerCase() === "gold"
                                  ? e?.Tunch
                                    ? `GOLD / Tunch: ${fixedValues(e?.Tunch, 3)}`
                                    : "GOLD"
                                  : e?.ItemName?.toLowerCase() === "metal" && e?.shape?.toLowerCase() === "silver"
                                    ? `SILVER ${e?.quality || ''}${e?.Tunch !== undefined ? ' /' : ''}${e?.Tunch !== undefined ? ` Tunch: ${fixedValues(e.Tunch, 3)}` : ''}`
                                    : e?.ItemName?.toLowerCase() === "misc" ? "MISC"
                                      : e?.ItemName?.toLowerCase() === "finding" ? "FINDING"
                                        : e?.ItemName?.toLowerCase() === "alloy" ? "ALLOY"
                                          : e?.ItemName?.toLowerCase() === "mount" ? "MOUNT"
                                            : ""
                          }
                        </div>
                        <div className="Sucol3_inv2lab spbrRht">{e?.HSN_No === "" ? "-" : e?.HSN_No}</div>
                        <div className="Sucol4_inv2lab spbrRht spbrWord">
                          {!e?.shape || ["metal", "finding", "mount", "alloy"].includes(e?.ItemName?.toLowerCase()) ? "-" : e?.shape}
                        </div>
                        <div className="Sucol5_inv2lab spbrRht spbrWord">
                          {e?.quality === "" ? "-"
                            : e?.ItemName === "METAL" && e?.shape === "Gold" ? "24K"
                              : e?.ItemName === "METAL" && e?.shape === "gold" ? "24K"
                                : e?.ItemName === "METAL" && e?.shape === "GOLD" ? "24K"
                                  : e?.ItemName === "MOUNT" ? "24K"
                                    : e?.quality
                          }
                        </div>
                        <div className="Sucol6_inv2lab spbrRht spbrWord">{e?.color === "" ? "-" : e?.color}</div>
                        <div className="Sucol7_inv2lab spbrRht spbrWord">{e?.size === "" ? "-" : e?.size}</div>
                        <div className="Sucol8_inv2lab spfnted spbrRht">{fixedValues(e?.Weight === "" ? "-" : e?.Weight, 3)}</div>
                        <div className="Sucol9_inv2lab spfnted spbrRht">{fixedValues(e?.PureWeight === "" ? "-" : e?.PureWeight, 3)}</div>
                        <div className="Sucol10_inv2lab spfnted spbrRht">{e?.pieces === "" ? "-" : e?.pieces}</div>
                        <div className="Sucol11_inv2lab spfnted spbrRht">
                          {formatAmount(
                            e?.Rate === "" ? "-"
                              : e?.Rate
                            , 2
                          )}
                        </div>
                        <div className="Sucol12_inv2lab spfnted spbrRht">{formatAmount(e?.Amount === "" ? "-" : e?.Amount - e?.LabourAmt, 2)}</div>
                        <div className="Sucol13_inv2lab spfnted spbrRht">{formatAmount(e?.Amount === "" ? "-" : e?.LabourRate, 2)}</div>
                        <div className="Sucol14_inv2lab spfnted spbrRht">{formatAmount(e?.Amount === "" ? "-" : e?.LabourAmt, 2)}</div>
                        <div className="Sucol15_inv2lab spfnted spbrRht spbrWord">
                          {e?.ItemName?.toLowerCase() === "diamond" && e?.IsDiscountOnAmount === 0 && e?.Discount !== 0 ? `${formatAmount(e?.DiscountAmount, 2)}(${e?.Discount}%)` : e?.DiscountAmount !== 1 ? formatAmount(e?.DiscountAmount, 2) : '0.00'}
                        </div>
                        <div className="Sucol16_inv2lab spfnted spbrRht">
                          {
                            e?.FinalAmount !== 0
                              ? e?.ItemName?.toLowerCase() === "diamond" ? formatAmount(e?.FinalAmount - e?.DiscountAmount, 2)
                                : formatAmount(e?.FinalAmount, 2)
                              : '0.00'
                          }
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div key={i} className="disflx spbrlFt brBtom spfntbH">
                        <div className="col1_inv2 spbrRht spfntCen">{i + 1}</div>
                        <div className="Sucol2_inv2 spbrRht spbrWord">
                          {/* e?.ItemName?.toLowerCase() === "diamond" ? "CUT AND POLISHED DIAMOND" 01/11/2025_3:10 */}
                          {
                            e?.ItemName?.toLowerCase() === "diamond" ? "DIAMOND"
                              : e?.ItemName?.toLowerCase() === "color stone" ? "STONE"
                                : e?.ItemName?.toLowerCase() === "metal" && e?.shape?.toLowerCase() === "gold"
                                  ? e?.Tunch
                                    ? `GOLD / Tunch: ${fixedValues(e?.Tunch, 3)}`
                                    : "GOLD"
                                  : e?.ItemName?.toLowerCase() === "metal" && e?.shape?.toLowerCase() === "silver"
                                    ? `SILVER ${e?.quality || ''}${e?.Tunch !== undefined ? ' /' : ''}${e?.Tunch !== undefined ? ` Tunch: ${fixedValues(e.Tunch, 3)}` : ''}`
                                    : e?.ItemName?.toLowerCase() === "misc" ? "MISC"
                                      : e?.ItemName?.toLowerCase() === "finding" ? "FINDING"
                                        : e?.ItemName?.toLowerCase() === "alloy" ? "ALLOY"
                                          : e?.ItemName?.toLowerCase() === "mount" ? "MOUNT"
                                            : ""
                          }
                        </div>
                        <div className="Sucol3_inv2 spbrRht">{e?.HSN_No === "" ? "-" : e?.HSN_No}</div>
                        <div className="Sucol4_inv2 spbrRht spbrWord">
                          {!e?.shape || ["metal", "finding", "mount", "alloy"].includes(e?.ItemName?.toLowerCase()) ? "-" : e?.shape}
                        </div>
                        <div className="Sucol5_inv2 spbrRht spbrWord">
                          {e?.quality === "" ? "-"
                            : e?.ItemName === "METAL" && e?.shape === "Gold" ? "24K"
                              : e?.ItemName === "METAL" && e?.shape === "gold" ? "24K"
                                : e?.ItemName === "METAL" && e?.shape === "GOLD" ? "24K"
                                  : e?.quality
                          }
                        </div>
                        <div className="Sucol6_inv2 spbrRht spbrWord">{e?.color === "" ? "-" : e?.color}</div>
                        <div className="Sucol7_inv2 spbrRht spbrWord">{e?.size === "" ? "-" : e?.size}</div>
                        <div className="Sucol8_inv2 spfnted spbrRht">{fixedValues(e?.Weight === "" ? "-" : e?.Weight, 3)}</div>
                        <div className="Sucol9_inv2 spfnted spbrRht">{fixedValues(e?.PureWeight === "" ? "-" : e?.PureWeight, 3)}</div>
                        <div className="Sucol10_inv2 spfnted spbrRht">{e?.pieces === "" ? "-" : e?.pieces}</div>
                        <div className="Sucol11_inv2 spfnted spbrRht">
                          {formatAmount(e?.Rate === "" ? "-"
                            : e?.Rate, 2
                          )}
                        </div>
                        <div className="Sucol12_inv2 spfnted spbrRht spbrWord">
                          {e?.ItemName?.toLowerCase() === "diamond" && e?.IsDiscountOnAmount === 0 && e?.Discount !== 0 ? `${formatAmount(e?.DiscountAmount, 2)}(${e?.Discount}%)` : e?.DiscountAmount !== 1 ? formatAmount(e?.DiscountAmount, 2) : '0.00'}
                        </div>
                        <div className="Sucol13_inv2 spfnted spbrRht">
                          {e?.Amount === "" ? "-" :
                            e?.ItemName?.toLowerCase() === "diamond" ? formatAmount(e?.Amount - e?.DiscountAmount)
                              : allowedNamesForRate.includes(e?.ItemName) ? formatAmount((e?.Weight * e?.Rate * e?.Tunch / 100), 2)
                                : formatAmount(e?.Amount, 2)
                          }
                        </div>
                      </div>
                    </>
                  )
                )
              })}

              {/** Table Total */}
              <div className="disflx spbrlFt brBtom spfntbH">
                {isFindingOrMount ? (
                  <>
                    <div className="col1_inv2lab spbrRht"></div>
                    <div className="Sucol2_inv2lab spbrRht"></div>
                    <div className="Sucol3_inv2lab spbrRht"></div>
                    <div className="Sucol4_inv2lab spbrRht"></div>
                    <div className="Sucol5_inv2lab spbrRht"></div>
                    <div className="Sucol6_inv2lab spbrRht"></div>
                    <div className="Sucol7_inv2lab spbrRht"></div>
                    <div className="Sucol8_inv2lab spfnted spfntBld spbrRht">{fixedValues(totalWeight, 3)}</div>
                    <div className="Sucol9_inv2lab spfnted spfntBld spbrRht">{fixedValues(totalPureWeight, 3)}</div>
                    <div className="Sucol10_inv2lab spfnted spfntBld spbrRht">{totalPieces}</div>
                    <div className="Sucol11_inv2lab spfnted spbrRht"></div>
                    <div className="Sucol12_inv2lab spfnted spfntBld spbrRht">{formatAmount(totalAmount - totalLabAmount, 2)}</div>
                    <div className="Sucol13_inv2lab spfnted spfntBld spbrRht"></div>
                    <div className="Sucol14_inv2lab spfnted spfntBld spbrRht">{formatAmount(totalLabAmount, 2)}</div>
                    <div className="Sucol15_inv2lab spfnted spfntBld spbrRht">{totalDiscountAMT !== 0 ? formatAmount(totalDiscountAMT, 2) : '0.00'}</div>
                    <div className="Sucol16_inv2lab spfnted spfntBld spbrRht">{formatAmount(totalAmount - totalDiscountAMT, 2)}</div>
                  </>
                ) : (
                  <>
                    <div className="col1_inv2 spbrRht"></div>
                    <div className="Sucol2_inv2 spbrRht"></div>
                    <div className="Sucol3_inv2 spbrRht"></div>
                    <div className="Sucol4_inv2 spbrRht"></div>
                    <div className="Sucol5_inv2 spbrRht"></div>
                    <div className="Sucol6_inv2 spbrRht"></div>
                    <div className="Sucol7_inv2 spbrRht"></div>
                    <div className="Sucol8_inv2 spfnted spfntBld spbrRht">{fixedValues(totalWeight, 3)}</div>
                    <div className="Sucol9_inv2 spfnted spfntBld spbrRht">{fixedValues(totalPureWeight, 3)}</div>
                    <div className="Sucol10_inv2 spfnted spfntBld spbrRht">{totalPieces}</div>
                    <div className="Sucol11_inv2 spfnted spbrRht"></div>
                    <div className="Sucol12_inv2 spfnted spfntBld spbrRht">{totalDiscountAMT !== 0 ? formatAmount(totalDiscountAMT, 2) : '0.00'}</div>
                    <div className="Sucol13_inv2 spfnted spfntBld spbrRht">{formatAmount(totalAmount - totalDiscountAMT, 2)}</div>

                  </>
                )}
              </div>

              {/** Tax Amount */}
              {extraTaxAmont?.map((e, i) => {
                return (
                  <div key={i} className="disflx spfntbH">
                    {isFindingOrMount ? (
                      <>
                        <div className="taxwdthlab spbrlFt spbrRht"></div>
                        <div className="taxwdth1lab spbrRht">
                          <p className="spfntBld">{e?.TaxName}</p>
                        </div>
                        <div className="taxwdth2lab spbrRht">
                          <p className="spfntBld">{formatAmount(e?.TaxAmount, 2)}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="taxwdth spbrlFt spbrRht"></div>
                        <div className="taxwdth1 spbrRht">
                          <p className="spfntBld">{e?.TaxName}</p>
                        </div>
                        <div className="taxwdth2 spbrRht">
                          <p className="spfntBld">{formatAmount(e?.TaxAmount, 2)}</p>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
              {extraTaxAmont?.length === 0 && (
                <div className="disflx spfntbH pagBrkIsid">
                  {isFindingOrMount ? (<div className="taxwdthlab spbrlFt spbrRht"></div>) : (<div className="taxwdth spbrlFt spbrRht"></div>)}
                  <div className={`${isFindingOrMount ? "taxwdth1lab" : "taxwdth1"} spbrRht`}>
                    {taxAmont?.tax1_taxname !== "" && (
                      <div className="spacLft2 spfntBld">
                        <p>{taxAmont?.tax1_value ? `${taxAmont?.tax1_taxname} @ ${fixedValues(taxAmont?.tax1_value, 3)} %` : ""}</p>
                      </div>
                    )}
                    {taxAmont?.tax2_taxname !== "" && (
                      <div className="spacLft2 spfntBld">
                        <p>{taxAmont?.tax2_value ? `${taxAmont?.tax2_taxname} @ ${fixedValues(taxAmont?.tax2_value, 3)} %` : ""}</p>
                      </div>
                    )}
                    {taxAmont?.tax3_taxname !== "" && (
                      <div className="spacLft2 spfntBld">
                        <p>{taxAmont?.tax3_value ? `${taxAmont?.tax3_taxname} @ ${fixedValues(taxAmont?.tax3_value, 3)} %` : ""}</p>
                      </div>
                    )}
                    {taxAmont && (
                      <>
                        {taxAmont.CGSTTotalAmount !== 0 && (
                          <div className="spacLft2 spfntBld">
                            <p>CGST</p>
                          </div>
                        )}
                        {taxAmont.SGSTTotalAmount !== 0 && (
                          <div className="spacLft2 spfntBld">
                            <p>SGST</p>
                          </div>
                        )}
                        {taxAmont.IGSTTotalAmount !== 0 && (
                          <div className="spacLft2 spfntBld">
                            <p>IGST</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className={`${isFindingOrMount ? "taxwdth2lab" : "taxwdth2"} spbrRht`}>
                    {Number(taxAmont?.tax1Amount) > 0 && (
                      <div className="spacLft2 spfntBld">
                        <p>{formatAmount(taxAmont.tax1Amount, 2)}</p>
                      </div>
                    )}

                    {Number(taxAmont?.tax2Amount) > 0 && (
                      <div className="spacLft2 spfntBld">
                        <p>{formatAmount(taxAmont.tax2Amount, 2)}</p>
                      </div>
                    )}

                    {Number(taxAmont?.tax3Amount) > 0 && (
                      <div className="spacLft2 spfntBld">
                        <p>{formatAmount(taxAmont.tax3Amount, 2)}</p>
                      </div>
                    )}

                    {Number(taxAmont?.CGSTTotalAmount) > 0 && (
                      <div className="spacLft2 spfntBld">
                        <p>{formatAmount(taxAmont.CGSTTotalAmount, 2)}</p>
                      </div>
                    )}

                    {Number(taxAmont?.SGSTTotalAmount) > 0 && (
                      <div className="spacLft2 spfntBld">
                        <p>{formatAmount(taxAmont.SGSTTotalAmount, 2)}</p>
                      </div>
                    )}

                    {Number(taxAmont?.IGSTTotalAmount) > 0 && (
                      <div className="spacLft2 spfntBld">
                        <p>{formatAmount(taxAmont.IGSTTotalAmount, 2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/**Grand Total */}
              <div className="disflx spfntbH brBtom">
                <div className={`${isFindingOrMount ? "taxwdthlab" : "taxwdth"} spbrlFt spbrRht`} style={{ paddingLeft: "5px", paddingTop: "5px" }}>
                  {Number(GrandTotal) > 0 && (
                    <>
                      <p>In Words {json0Data?.CurrName}</p>
                      <span className="spfntBld">{convertWithAnd(Number(GrandTotal.toFixed(2)))} Only</span>
                    </>
                  )}
                </div>
                <div className={`${isFindingOrMount ? "taxwdth1lab" : "taxwdth1"} spbrRht spfntBld grtHet brTpm`} style={{ alignItems: "center" }}>
                  {Number(GrandTotal) !== 0 && !isNaN(Number(GrandTotal)) && ("GRAND TOTAL")}
                </div>
                <div className={`${isFindingOrMount ? "taxwdth2lab" : "taxwdth2"} spbrRht spfntBld grtHet brTpm`}>
                  {Number(GrandTotal) !== 0 && !isNaN(Number(GrandTotal)) && (
                    <>
                      <span dangerouslySetInnerHTML={{ __html: json0Data?.CurrSymbol }} />
                      &nbsp;{NumberWithCommas(GrandTotal, 2)}
                    </>
                  )}
                </div>
              </div>

              {/** Instuction */}
              {/* {json0Data?.Declaration && (
                <div className="brbxAll" style={{ borderTop: "none" }}>
                  <div className="spinst" dangerouslySetInnerHTML={{ __html: json0Data?.Declaration, }}></div>
                </div>
              )} */}
              {(json0Data?.Notes || json0Data?.Declaration) && (
                <div className="brbxAll" style={{ borderTop: "none",padding:"5px" }}>
                  <div
                    className="spinst"
                    dangerouslySetInnerHTML={{
                      __html: json0Data?.Notes ? json0Data.Notes : json0Data?.Declaration,
                    }}
                  ></div>
                </div>
              )}

              <div className="disflx brbxAll spfntbH" style={{ borderTop: "none" }}>
                <div className="spbnkdtl spbrRht">
                  <div className="spfntBld">Bank Detail</div>
                  <div>Bank Name:<span>{json0Data?.bankname}</span></div>
                  <div>Branch:<span>{json0Data?.bankaddress}</span></div>
                  <div>Account Name:<span>{json0Data?.accountname}</span></div>
                  <div>Account No:<span>{json0Data?.accountnumber}</span></div>
                  <div>RTGS/NEFT IFSC:<span>{json0Data?.rtgs_neft_ifsc}</span></div>
                </div>
                <div className="spbnkdtl1 spbrRht">
                  <div>Signature</div>
                  <div className="spfntBld">{json0Data?.customerfirmname}</div>
                </div>
                <div className="spbnkdtl1">
                  <div>Signature</div>
                  <div className="spfntBld">{json0Data?.CompanyFullName}</div>
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

export default InvoicePrintMaterial;
