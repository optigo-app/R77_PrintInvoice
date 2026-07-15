// http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=TVMvNTE3LzIwMjQ=&evn=TWF0ZXJpYWwgc2FsZQ==&pnm=SW52b2ljZSBQcmludDI=&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvTWF0ZXJpYWxCaWxsX0pzb24=&ctv=NzE=&ifid=DetailPrintR&pid=undefined
import React, { useEffect } from "react";
import "../../assets/css/prints/InvoicePrint2MaterialSale.css";
import { useState } from "react";
import {
  NumberWithCommas,
  apiCall,
  checkMsg,
  fixedValues,
  formatAmount,
  handlePrint,
  isObjectEmpty,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import { ToWords } from "to-words";

const InvoicePrint2Material = ({
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
  const [headerFlag, setHeaderFlag] = useState(true);
  const [termsFlag, setTermsFlag] = useState(true);
  const [isImageWorking, setIsImageWorking] = useState(true);
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
        // console.log("data", data);

        if (data?.Status === "200") {
          let isEmpty = isObjectEmpty(data?.Data);
          if (!isEmpty) {
            let address =
              data?.Data?.MaterialBill_Json[0]?.Printlable?.split("\r\n");
            setCustAddress(address);

            setJson0Data(data?.Data?.MaterialBill_Json[0]);
            const sortedItems = [...(data?.Data?.MaterialBill_Json1 || [])].sort(
              (a, b) => parseFloat(a?.ItemId || 0) - parseFloat(b?.ItemId || 0)
            );
            setFinalD(sortedItems);
            setTaxAmount(data?.Data?.MaterialBill_Json2[0]);
            setExtraTaxAmount(data?.Data?.MaterialBill_Json3);

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

  const totalWeight = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
    const weight = parseFloat(item?.Weight);
    return sum + (isNaN(weight) ? 0 : weight);
  }, 0);

  const totalAmount = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
    const Amount = parseFloat(item?.Amount);
    return sum + (isNaN(Amount) ? 0 : Amount);
  }, 0);

  const totalEtraTaxAmount = (Array.isArray(extraTaxAmont) ? extraTaxAmont : []).reduce((sum, item) => {
    const amount = parseFloat(item?.TaxAmount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const getDueDate = (entryDateStr, orderDue) => {
    const date = new Date(entryDateStr);
    date.setDate(date.getDate() + orderDue);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const DueDate = getDueDate(json0Data?.EntryDate, json0Data?.OrderDue)
  // console.log("DueDate:", DueDate, "| Type:", typeof DueDate);

  const GrandTotal =
    (totalAmount || 0) +
    (totalEtraTaxAmount || 0) +
    (taxAmont?.tax1Amount || 0) +
    (taxAmont?.tax2Amount || 0) +
    (taxAmont?.tax3Amount || 0);
  const LastGrandTotal = GrandTotal + (taxAmont?.AddLess || 0);


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

  const handleHeaderShow = (e) => {
    if (headerFlag) setHeaderFlag(false);
    else {
      setHeaderFlag(true);
    }
  };

  const handleTermsShow = (e) => {
    if (termsFlag) setTermsFlag(false);
    else {
      setTermsFlag(true);
    }
  };

  // console.log("taxAmont", taxAmont);
  // console.log("extraTaxAmont", extraTaxAmont);
  // console.log("finalD", finalD);
  console.log("json0Data", json0Data);

  const allowedNamesForRate = ["Metal", "METAL", "metal", "MOUNT", "Mount", "mount", "FINDING", "Finding", "finding", "Alloy", "ALLOY", "alloy"];

  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <>
          <div className="w-full flex">
            <div className="w-full flex prnt_btn">
              <div className="px-2">
                <input
                  type="checkbox"
                  onChange={handleHeaderShow}
                  value={headerFlag}
                  checked={headerFlag}
                  id="headershow"
                />
                <label htmlFor="headershow" className="user-select-none mx-1">
                  Header
                </label>
              </div>

              <div className="px-2">
                <input
                  type="checkbox"
                  onChange={handleTermsShow}
                  value={termsFlag}
                  checked={termsFlag}
                  id="termsshow"
                />
                <label htmlFor="termsshow" className="user-select-none mx-1">
                  Terms
                </label>
              </div>

              <div className="px-2">
                <input
                  type="button"
                  className="btn_white blue mt-0"
                  value="Print"
                  onClick={(e) => handlePrint(e)}
                />
              </div>
            </div>
          </div>

          <div className="w-full flex items-center justify-center">
            <div className="container_inv2">
              {/* Header */}
              {json0Data?.PrintHeadLbl
                && (
                  <div className="headlineJL w-100 p-2">
                    <b style={{ fontSize: "20px" }}>
                      {json0Data?.PrintHeadLbl}
                    </b>
                  </div>
                )
              }
              {headerFlag && (
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

              {/* Sub Header */}
              <div className="disflx brbxAll">
                <div className="w1_inv2 spbrRht spfnthead">
                  <div style={{ paddingTop: "2px" }}>Bill To,</div>
                  {/* {json0Data?.customerfirmname !== "" && json0Data?.IsshowCustomerName === 0 ? <div className="spfntsZ spfntBld">{json0Data?.customerfirmname}</div> : <div className="spfntsZ spfntBld">{json0Data?.CustName}</div>} */}
                  {json0Data?.customerfirmname !== "" && json0Data?.IsshowCustomerName === 0 ? <div className="spfntsZ spfntBld">{json0Data?.Customercode}</div> : <div className="spfntsZ spfntBld">{json0Data?.CustName}</div>}
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
                  {json0Data?.customerfirmname !== "" && json0Data?.IsshowCustomerName === 0 ? <div className="spfntsZ spfntBld">{json0Data?.Customercode}</div> : <div className="spfntsZ spfntBld">{json0Data?.CustName}</div>}
                  {/* {json0Data?.customerfirmname !== "" && json0Data?.IsshowCustomerName === 0 ? <div className="spfntsZ spfntBld">{json0Data?.customerfirmname}</div> : <div className="spfntsZ spfntBld">{json0Data?.CustName}</div>} */}
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
                    {DueDate !== "" && (<>
                      <div className="wdthHd spfntBld">DUE DATE</div>
                      <div className="wdthHd1">{DueDate}</div>
                    </>)}
                  </div>
                </div>
              </div>

              {/** Table Header */}
              <div className="disflx brbxAll spfntbH" style={{ marginTop: "5px" }}>
                <div className="col1_inv2 spfntBld spbrRht spfntCen">Sr#</div>
                <div className="col2_inv2 spfntBld spfntCen spbrRht">Description</div>
                <div className="col3_inv2 spfntBld spbrRht spfntCen">Shape</div>
                <div className="col4_inv2 spbrRht spfntBld spfntCen">Quality</div>
                <div className="spbrRht col5_inv2 spfntBld spfntCen">Color</div>
                <div className="col6_inv2 spfntBld spbrRht spfntCen">Size</div>
                <div className="col7_inv2 spbrRht spfntBld spfntCen">Weight</div>
                <div className="col8_inv2 spfntBld spbrRht spfntCen">Rate</div>
                <div className="col9_inv2 spfntBld spfntCen">Amount</div>
              </div>

              {/** table Body */}
              {finalD?.map((e, i) => {
                return (
                  <div key={i} className="disflx spbrlFt brBtom spfntbH">
                    <div className="col1_inv2 spbrRht spfntCen">{i + 1}</div>
                    <div className="Sucol2_inv2 spbrRht">
                      {e?.ItemName === "DIAMOND" ? `CUT AND POLISHED DIAMOND ${e?.IsSolGem ? ': S' : ''}`:
                        e?.ItemName === "COLOR STONE" ? `STONE ${e?.IsSolGem ? ': G' : ''}`:
                          e?.ItemName === "METAL" && e?.shape === "GOLD" ? "GOLD" :
                            e?.ItemName === "METAL" && e?.shape === "gold" ? "GOLD" :
                              e?.ItemName === "METAL" && e?.shape === "Gold" ? "GOLD" :
                                e?.ItemName === "METAL" && e?.shape === "Silver" ? `SILVER ${e?.quality ? e?.quality : ''}` :
                                  e?.ItemName === "METAL" && e?.shape === "SILVER" ? `SILVER ${e?.quality ? e?.quality : ''}` :
                                    e?.ItemName === "METAL" && e?.shape === "silver" ? `SILVER ${e?.quality ? e?.quality : ''}` :
                                      e?.ItemName === "MISC" ? "MISC" :
                                        e?.ItemName === "FINDING" ? "FINDING" :
                                          e?.ItemName === "ALLOY" ? "ALLOY" :
                                            e?.ItemName === "MOUNT" ? `MOUNT : ${e?.MountCategory?.toUpperCase()}` :
                                              ""}
                    </div>
                    <div className="Sucol3_inv2 spbrRht">{e?.shape === "" || allowedNamesForRate.includes(e?.ItemName) ? "-" : e?.shape}</div>
                    <div className="Sucol4_inv2 spbrRht">{e?.quality === "" ? "-" : e?.quality}</div>
                    <div className="Sucol5_inv2 spbrRht">{e?.color === "" ? "-" : e?.color}</div>
                    <div className="Sucol6_inv2 spbrRht">{e?.size === "" ? "-" : e?.size}</div>
                    <div className="Sucol7_inv2 spfntCen spbrRht">{fixedValues(e?.Weight === 0 ? "" : e?.Weight, 3)}</div>
                    <div className="Sucol8_inv2 spfnted spbrRht">
                      {formatAmount(e?.Rate === "" ? "-"
                        : allowedNamesForRate.includes(e?.ItemName) && e?.Tunch !== 0
                          ? ((e?.Weight * e?.Rate * e?.Tunch / 100) / e?.Weight)
                          : e?.Rate, 2
                      )}
                    </div>
                    <div className="Sucol9_inv2 spfnted spbrRht">
                      {formatAmount(e?.Amount === "" ? "-"
                        : allowedNamesForRate.includes(e?.ItemName) && e?.Tunch !== 0
                          ? ((e?.Weight * e?.Rate * e?.Tunch / 100))
                          : e?.Amount, 2
                      )}
                    </div>
                  </div>
                )
              })}

              {/** Table Total */}
              <div className="disflx spbrlFt brBtom spfntbH">
                <div className="col1_inv2 spbrRht spfntCen"></div>
                <div className="Sucol2_inv2 spbrRht"></div>
                <div className="Sucol3_inv2 spbrRht"></div>
                <div className="Sucol4_inv2 spbrRht"></div>
                <div className="Sucol5_inv2 spbrRht"></div>
                <div className="Sucol6_inv2 spbrRht"></div>
                <div className="Sucol7_inv2 spfntCen spfntBld spbrRht">{totalWeight ? fixedValues(totalWeight, 3) : ''}</div>
                <div className="Sucol8_inv2 spfnted spbrRht"></div>
                <div className="Sucol9_inv2 spfnted spfntBld spbrRht">{totalAmount ? formatAmount(totalAmount, 2) : ''}</div>
              </div>

              {/** Tax Amount */}
              {extraTaxAmont?.map?.((e, i) => {
                return (
                  <div className="disflx spfntbH">
                    <div className="taxwdth spbrlFt spbrRht"></div>
                    <div className="taxwdth1 spbrRht">
                      <p key={i} className="spfntBld">{e?.TaxName}</p>
                    </div>
                    <div className="taxwdth2 spbrRht">
                      <p key={i} className="spfntBld">{e?.TaxAmount ? formatAmount(e?.TaxAmount, 2) : ""}</p>
                    </div>
                  </div>
                )
              })}
              {extraTaxAmont?.length === 0 && (
                <div className="disflx spfntbH pagBrkIsid">
                  <div className="taxwdth spbrlFt spbrRht"></div>
                  <div className="taxwdth1 spbrRht">
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
                  <div className="taxwdth2 spbrRht">
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
              <div className="disflx spfntbH">
                <div className={`taxwdth spbrlFt spbrRht ${taxAmont?.AddLess !== 0 && ("brTpm")}`} style={{ paddingLeft: "5px", paddingTop: "5px", alignContent: "end" }}>
                  <p>In Words {json0Data?.CurrName}</p>
                  <span className="spfntBld">{convertWithAnd(Number(LastGrandTotal.toFixed(2)))} Only</span>
                </div>
                <div className="extrWdthAftrBg1">
                  {taxAmont?.AddLess !== 0 && (
                    <div className="disflx extrWdthAftrBg spbrRht spfntBld grtHet brTpm spfntbH" style={{ height: "22px", alignItems: "center" }}>
                      {taxAmont?.AddLess < 0 ? "Less" : taxAmont?.AddLess > 0 ? "Add" : ""}
                    </div>
                  )}
                  <div className="disflx extrWdthAftrBg spbrRht spfntBld grtHet brTpm" style={{ alignItems: "center" }}>GRAND TOTAL</div>
                </div>
                <div className="extrWdthAftrBg2">
                  {taxAmont?.AddLess !== 0 && (
                    <div className="disflx extrWdthAftrBg spbrRht spfntBld grtHet brTpm spfntbH" style={{ height: "22px", alignItems: "center" }}>
                      {fixedValues(taxAmont?.AddLess, 2)}
                    </div>
                  )}
                  <div className="disflx extrWdthAftrBg spbrRht spfntBld grtHet brTpm" style={{ alignItems: "center" }}>
                    <span dangerouslySetInnerHTML={{ __html: json0Data?.CurrSymbol }} />
                    &nbsp;{NumberWithCommas(LastGrandTotal, 2)}
                  </div>
                </div>
              </div>

              {/** Remarks */}
              {json0Data?.Remark !== "" && (
                <div className="sprmrk brbxAll">
                  <div className="spfntBld">REMARKS : </div>
                  <div className="">{json0Data?.Remark}</div>
                </div>
              )}

              {/** Instuction */}
              {termsFlag && (

                // json0Data?.Declaration && (
                //   <div className="brbxAll" style={{ borderTop: json0Data?.Remark === "" ? "1px solid #DDDDDD" : "none" }}>
                //     <div className="spinst" dangerouslySetInnerHTML={{ __html: json0Data?.Declaration, }}></div>
                //   </div>
                // )
                (json0Data?.Notes || json0Data?.Declaration) && (
                  <div className="brbxAll" style={{ borderTop: "none",padding:"5px" }}>
                    <div
                      className="spinst"
                      dangerouslySetInnerHTML={{
                        __html: json0Data?.Notes ? json0Data.Notes : json0Data?.Declaration,
                      }}
                    ></div>
                  </div>
                )

              )}
              <div className="disflx brbxAll spfntbH" style={{ borderTop: termsFlag ? "none" : "1px solid #DDDDDD" }}>
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
                  {/* <div className="spfntBld"> {json0Data?.IsshowCustomerName === 0 ? json0Data?.Customercode : json0Data?.CustName}</div> */}
                  {json0Data?.customerfirmname !== "" && json0Data?.IsshowCustomerName === 0 ? <div className="spfntBld">{json0Data?.Customercode}</div> : <div className="spfntBld">{json0Data?.CustName}</div>}
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

export default InvoicePrint2Material;
