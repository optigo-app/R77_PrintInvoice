// http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=TVMvMzY0LzIwMjQ=&evn=TWF0ZXJpYWwgc2FsZQ==&pnm=dGF4IGludm9pY2UgYQ==&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvTWF0ZXJpYWxCaWxsX0pzb24=&ctv=NzE=&ifid=DetailPrintR&pid=undefined
import React, { useEffect } from "react";
import "../../assets/css/prints/TaxInvoiceAMaterial.scss";
import { useState } from "react";
import {
  NumberWithCommas,
  apiCall,
  brokarageDetail,
  checkMsg,
  fixedValues,
  formatAmount,
  handleImageError,
  handlePrint,
  isObjectEmpty,
  otherAmountDetail,
  taxGenrator,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import { cloneDeep } from "lodash";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";
import watermarkimg from "../../assets/img/watermark.png";
import signatureLogo from "../../assets/img/signatureLogo.png";
import { ToWords } from "to-words";

const TaxInvoiceAMaterial = ({
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
  const [checkBoxNew, setCheckBoxNew] = useState("Triplicate for Supplier");
  const [finalD, setFinalD] = useState({});
  const [custAddress, setCustAddress] = useState([]);
  const [taxAmont , setTaxAmount] = useState();
  const [extraTaxAmont , setExtraTaxAmount] = useState();
  const toWords = new ToWords();  
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };

  const handleChangeNew = (label) => {
    setCheckBoxNew(label);
  };

  const options = [
    "Triplicate for Supplier",
    "Duplicate for Transporter",
    "Original for Recipient",
  ];

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

            setJson0Data(data?.Data?.MaterialBill_Json[0]);
            setFinalD(data?.Data?.MaterialBill_Json1);
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


  const summary = Array.isArray(finalD)
    ? finalD.reduce(
        (acc, item) => {
          acc.totalPieces += item.pieces || 0;
          acc.totalWeight += item.Weight || 0;
          acc.totalAmount += item.TotalAmount || 0;
          return acc;
        },
        {
          totalPieces: 0,
          totalWeight: 0,
          totalAmount: 0,
        }
      )
    : {
        totalPieces: 0,
        totalWeight: 0,
        totalAmount: 0,
      };

  let TotalCGSTAmount = 0;
  let TotalSGSTAmount = 0;
  let TotalIGSTAmount = 0;

  if (Array.isArray(finalD)) {
    finalD.forEach((item) => {
      TotalCGSTAmount += Number(item.CGSTAmount) || 0;
      TotalSGSTAmount += Number(item.SGSTAmount) || 0;
      TotalIGSTAmount += Number(item.IGSTAmount) || 0;
    });
  }

  const totalEtraTaxAmount = (Array.isArray(extraTaxAmont) ? extraTaxAmont : []).reduce((sum, item) => {
    const amount = parseFloat(item?.TaxAmount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
   

    const styles = `
      @media print {
        @page {
          size: A4;

              @bottom-left {
            content: "INVOICE NO. ${json0Data?.InvoiceNo}";
            font-family: Arial, sans-serif;
            font-size: 9pt;
            color: #666;
          }
              @bottom-right {
            content: " PAGE " counter(page) " OF " counter(pages);
            font-family: Arial, sans-serif;
            font-size: 9pt;
            color: #666;
          }
        }
        .no-print {
          display: none !important;
        }

        .footerForThe_print {
          page-break-inside: avoid;
        }
        
      }
    `;

  const formatTaxLabel = (taxName, taxValue) => {
    if (!taxName || taxValue == null) return "";
    const normalizedValue = parseFloat(taxValue);
    let label = taxName;
  
    if (!label.includes(normalizedValue)) {
      label += ` ${fixedValues(normalizedValue,3)}`;
    }
    if (!label.includes("%")) {
      label += " %";
    }
  
    return label;
  };
  
  

  const amount = Number(summary?.totalAmount + totalEtraTaxAmount || 0);
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  const rupeesInWords = toWords.convert(rupees);
  const paiseInWords = paise > 0 ? ` and ${toWords.convert(paise)} Paise` : '';

  const totalDiscountAMT = Array.isArray(finalD) 
  ? finalD
      .filter((e) => e?.ItemName?.toLowerCase() === "diamond")
      .reduce((sum, item) => sum + (parseFloat(item?.DiscountAmount) || 0), 0)
  : 0;

  // console.log("finalD", finalD);
  // console.log("json0Data", json0Data);
  // console.log("taxAmont", taxAmont);
  // console.log("extraTaxAmont", extraTaxAmont);

  const PerPageAfterFirstPage = 14;
  const OnFirstPage = 8;
  let totalProducts = finalD?.length;
  // console.log("totalProducts", totalProducts);
  // totalProducts = totalProducts > 7 ? totalProducts + 2 : totalProducts;
  
  const totalPages = finalD?.length > 8;
  
  const remainingOnLastPage = totalPages % OnFirstPage || PerPageAfterFirstPage;
  // console.log("remainingOnLastPage", remainingOnLastPage);

  const spacerClass = 
    totalProducts === 1 ? "spacer-56" :
    totalProducts === 2 ? "spacer-55" :
    totalProducts === 3 ? "spacer-54" :
    totalProducts === 4 ? "spacer-53" :
    totalProducts === 5 ? "spacer-52" :
    totalProducts === 6 ? "spacer-51" :
    totalProducts === 7 ? "spacer-50" :
    totalProducts === 8 ? "spacer-49" :
    remainingOnLastPage <= OnFirstPage 
      ? `spacer-${OnFirstPage - remainingOnLastPage}`  
      : "";

  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <div className="container containerDetailPrint1 pt-4 ">
          <style>{styles}</style>
          <div
            className="tax_invoice_main_allPrint"
            style={{
              border: "2px solid black",
              position: "relative",
              // backgroundImage: watermarkimg ? `url(${watermarkimg})` : "none",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="print_watermark_element"></div>
            <div className="d-flex justify-content-end align-items-center print_sec_sum4 mb-4 pt-4">
              {/* <div className="form-check d-flex align-items-center detailPrint1L_font_13">
                <input
                  className="border-dark me-2"
                  type="checkbox"
                  checked={checkBox?.image}
                  onChange={(e) => handleChange(e)}
                  name="image"
                />
                <label className="pt-1">With Image</label>
              </div> */}
              {options?.map((labelText, index) => (
                <div
                  key={index}
                  className="form-check d-flex align-items-center detailPrint1L_font_13"
                >
                  <input
                    className="border-dark me-2"
                    type="checkbox"
                    checked={checkBoxNew === labelText}
                    onChange={() => handleChangeNew(labelText)}
                    id={index}
                  />
                  <label htmlFor={index} className="pt-1">{labelText}</label>
                </div>
              ))}
              <div className="form-check detailPrint1L_font_14">
                <input
                  type="button"
                  className="btn_white blue mt-0"
                  value="Print"
                  onClick={(e) => handlePrint(e)}
                />
              </div>
            </div>
            {/* header line*/}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  position: "absolute",
                  right: "20px",
                  top: "-10px",
                }}
              >
                <p>{checkBoxNew}</p>
              </div>
              <div
                className="col-6"
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "10px",
                }}
              >
                {isImageWorking && json0Data?.PrintLogo !== "" && (
                  <img
                    src={json0Data?.PrintLogo}
                    alt=""
                    onError={handleImageErrors}
                    height={120}
                    width={150}
                  />
                )}
              </div>
              <p style={{ textAlign: "center" }}>
                <b>TAX INVOICE</b>
              </p>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 5px 10px 5px",
              }}
            >
              <div style={{ width: "40%" }}>
                <p className="lhDetailPrint1 ">
                  <b>Bill To,</b>
                </p>
                <div className="header_top_content_main_class">
                  <p className="Header_top_title_name">Name </p>
                  <p className="Header_top_title_value_name">
                    {json0Data?.customerfirmname}
                  </p>
                </div>
                <div className="header_top_content_main_class">
                  <p className="Header_top_title_name">Address</p>
                  <p
                    className="Header_top_title_value_name"
                    style={{
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      minHeight: "25px", maxHeight: "25px", overflow: "hidden"
                    }}
                  >
                    <span>
                      <span>{json0Data?.customerAddress1}</span>
                      {json0Data?.customerAddress2 && (
                        <span>{json0Data.customerAddress2}, </span>
                      )}
                      {json0Data?.customerAddress3 && (
                        <span style={{ wordBreak: "auto-phrase" }}>
                          {json0Data.customerAddress3}{" "}
                        </span>
                      )}
                      {json0Data?.customercity && (
                        <span style={{ wordBreak: "auto-phrase" }}>
                          {json0Data.customercity},{" "}
                        </span>
                      )}
                      {json0Data?.State && <span>{json0Data.State} </span>}
                      {json0Data?.PinCode && (
                        <span>{json0Data.PinCode}</span>
                      )}
                    </span>
                  </p>
                </div>

                <div className="header_top_content_main_class">
                  <p className="Header_top_title_name">State Code </p>
                  <p className="Header_top_title_value_name">
                    {json0Data?.Cust_CST_STATE_No}
                  </p>
                </div>
                <div className="header_top_content_main_class">
                  <p className="Header_top_title_name">Contact No. </p>
                  <p className="Header_top_title_value_name">
                    {json0Data?.customermobileno}
                  </p>
                </div>
                <div className="header_top_content_main_class">
                  <p className="Header_top_title_name">Email </p>
                  <p className="Header_top_title_value_name">
                    {json0Data?.customeremail}
                  </p>
                </div>
                <div className="header_top_content_main_class">
                  <p className="Header_top_title_name">PAN No. </p>
                  <p className="Header_top_title_value_name">
                    {json0Data?.customerPANno}
                  </p>
                </div>
                <div className="header_top_content_main_class">
                  <p className="Header_top_title_name">GST No. </p>
                  <p className="Header_top_title_value_name">
                    {json0Data?.Cust_VAT_GST_No}
                  </p>
                </div>
              </div>

              <div style={{ padding: "0px 5px", width: "35%" }}>
                <div>
                  <p className="lhDetailPrint1">
                    <b>Ship To,</b>
                  </p>
                  <div className="header_top_content_main_class">
                    <p className="Header_top_title_value_name">
                      {custAddress?.map((e, i) => {
                        return <p key={i}>{e}</p>;
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: "30%",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <div>
                  <div className="header_top_content_main_class">
                    <p className="Header_top_title_name">Invoice No.</p>
                    <p className="Header_top_title_value_name">
                      <b>{json0Data?.MaterialBillNo}</b>
                    </p>
                  </div>
                  <div className="header_top_content_main_class">
                    <p className="Header_top_title_name">Date </p>
                    <p className="Header_top_title_value_name">
                      {json0Data?.EntryDate}
                    </p>
                  </div>
                  <div className="header_top_content_main_class">
                    <p className="Header_top_title_name">HSN Code</p>
                    <p className="Header_top_title_value_name">
                      {json0Data?.HSN_No}
                    </p>
                  </div>
                  <div className="header_top_content_main_class">
                    <p className="Header_top_title_name">Location Code </p>
                    <p className="Header_top_title_value_name">2001</p>
                  </div>
                </div>
              </div>
            </div>

            {/* table header*/}
            <table style={{ width: "100%" }}>
              <thead>
                <div
                  style={{
                    borderTop: "1px solid black",
                    borderBottom: "1px solid black",
                  }}
                  className="d-flex w-100 recordDetailPrint1 detailPrint1L_font_11"
                >
                  <div className="designDetalPrint1 d-flex justify-content-center align-items-center flex-column">
                    <p className="fw-bold" style={{ fontSize: "11px" }}>
                      Sr No.
                    </p>
                  </div>
                  <div
                    className="designDetalPrint3 d-flex justify-content-center align-items-center"
                    style={{ width: "25%" }}
                  >
                    <p className="fw-bold p-1" style={{ fontSize: "11px" }}>
                      Description
                    </p>
                  </div>
                  <div
                    className="designDetalPrint4 d-flex align-items-center"
                    style={{
                      width: "10%",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <p className="fw-bold p-1" style={{ fontSize: "11px" }}>
                      Qty (pcs)
                    </p>
                  </div>
                  <div
                    className="designDetalPrint5 d-flex justify-content-left align-items-center"
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <p className="fw-bold p-1" style={{ fontSize: "11px" }}>
                      Weight(Carat)
                    </p>
                  </div>
                  <div
                    className="designDetalPrint6  d-flex justify-content-left align-items-center"
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      width: "15%",
                    }}
                  >
                    <p className="fw-bold p-1" style={{ fontSize: "11px" }}>
                      Rate Per Carat(INR)
                    </p>
                  </div>
                  <div
                    className="designDetalPrint7 d-flex justify-content-left align-items-center"
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      width: "15%",
                    }}
                  >
                    <p className="fw-bold p-1" style={{ fontSize: "11px" }}>
                      Discount (INR)
                    </p>
                  </div>
                  <div
                    className="designDetalPrint8 d-flex justify-content-left align-items-center"
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      width: "18%",
                    }}
                  >
                    <p className="fw-bold p-1" style={{ fontSize: "11px" }}>
                      Total Amount (INR)
                    </p>
                  </div>
                </div>
              </thead>

              {/* data */}
              <div
                style={{
                  // minHeight: "310px",
                }}
              >
                {finalD?.map((e, i) => {
                  return (
                    <div
                      key={i}
                      className="recordDetailPrint1 detailPrint1L_font_11"
                      style={{ minHeight: "45px", maxHeight: "45px", overflow: "hidden" }}
                    >
                      <div className="d-flex w-100">
                        <div className="designDetalPrint1 pt-1">
                          <p className="text-center">
                            {NumberWithCommas(i + 1, 0)}
                          </p>
                        </div>

                        <div
                          className="designDetalPrint3 p-1"
                          style={{ width: "27%" }}
                        >
                          <div className="d-flex justify-content-between">
                            <p>
                              Diamond 2 {e?.MaterialTypeName}{" "}
                              {e?.MetalPurity} 
                              {e?.Shape_Code}
                              {e?.Shape_Code === "" ? "" : "/"}
                              {e?.Quality_Code}
                              {e?.Quality_Code === "" ? "" : "/"}
                              {e?.Color_Code}
                              {e?.LotNo ? `, Cert#: ${e.LotNo}` : ""}
                            </p>
                          </div>
                        </div>
                        <div
                          className="designDetalPrint4 p-1"
                          style={{
                            width: "8%",
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <div className="d-flex justify-content-between">
                            <p style={{ width: "100%", textAlign: "center" }}>
                              {e?.pieces}
                            </p>
                          </div>
                        </div>
                        <div className="designDetalPrint5 p-1">
                          <div className="d-flex justify-content-between">
                            <p style={{ width: "100%", textAlign: "right" }}>
                              {e?.Weight?.toFixed(3)}
                            </p>
                          </div>
                        </div>
                        <div
                          className="designDetalPrint6 p-1"
                          style={{ width: "15%" }}
                        >
                          <div className="d-flex justify-content-between">
                            <p style={{ width: "100%", textAlign: "right" }}>
                              {formatAmount(e?.Rate)}
                            </p>
                          </div>
                        </div>
                        <div
                          className="designDetalPrint7 p-1 text-end"
                          style={{ width: "15%" }}
                        >
                            <p>
                              {" "}
                              {/* {formatAmount(
                                e?.DiscountAmt /
                                  finalD?.header?.CurrencyExchRate
                              )} */}
                              {e?.ItemName?.toLowerCase() === "diamond" && e?.IsDiscountOnAmount === 0 && e?.DiscountAmount !== 0 ? `${formatAmount(e?.DiscountAmount,2)}(${e?.Discount}%)` :  e?.DiscountAmount !== 1 ? formatAmount(e?.DiscountAmount,2) : '0.00' }
                            </p>
                        </div>
                        <div
                          className="designDetalPrint8"
                          style={{ padding: ".25rem 10px", width: "18%" }}
                        >
                          <div className="d-flex justify-content-between">
                            <p style={{ width: "100%", textAlign: "right" }}>
                              {e?.ItemName?.toLowerCase() === "diamond" ? formatAmount(e?.TotalAmount - e?.DiscountAmount) : formatAmount(e?.TotalAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={`spacer ${spacerClass}`}/>
              {console.log("spacerClass", spacerClass)}

              <div className="myToalaSection">
                <div
                  style={{
                    display: "flex",
                    borderTop: "1px solid green",
                    borderBottom: "1px solid green",
                  }}
                >
                  <div style={{ width: "20%" }}></div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1px",
                      width: "80%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        borderBottom: "1px solid green",
                        paddingBlock: "5px",
                      }}
                    >
                      <p style={{ width: "24%" }}>Sub Total</p>
                      <div
                        style={{
                          display: "flex",
                          width: "76%",
                          paddingRight: "10px",
                        }}
                      >
                        <p style={{ width: "22%" }}>
                          <b>{summary?.totalPieces}</b>
                        </p>
                        <p style={{ width: "60%" }}>
                          <b>{summary?.totalWeight?.toFixed(3)}</b>
                        </p>
                        <p
                          style={{
                            width: "38%",
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <b>{formatAmount(summary?.totalAmount - totalDiscountAMT)}</b>
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        borderBottom: "1px solid green",
                        justifyContent: "space-between",
                        paddingRight: "10px",
                      }}
                    >
                      <p>Discount</p>
                      <p>
                        <b>
                          {formatAmount(
                            totalDiscountAMT
                          )}
                        </b>
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        borderBottom: "1px solid green",
                        justifyContent: "space-between",
                        paddingRight: "10px",
                      }}
                    >
                      <p>Taxable Value</p>
                      <p>
                        <b>{formatAmount(summary?.totalAmount - totalDiscountAMT)}</b>
                      </p>
                    </div>

                    
                    {extraTaxAmont?.map?.((e, i) => {
                      return (
                          <div key={i} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            borderBottom: "1px solid green",
                            paddingRight: "10px",
                          }}> 
                            <p style={{ fontSize: "9px", paddingTop: "1.5px"}}>{e?.TaxName}</p>
                            <p style={{ fontWeight: "bold" }}>{formatAmount(e?.TaxAmount,2)}</p>
                          </div>
                      )
                    })}
                    
                    {taxAmont?.tax1Amount !== 0 && (
                      <div style={{display: "flex", justifyContent: "space-between", borderBottom: "1px solid green", paddingRight: "10px",}}> 
                        <p style={{ fontSize: "9px", paddingTop: "1.5px"}}>{formatTaxLabel(taxAmont?.tax1_taxname, taxAmont?.tax1_value)}</p>
                        <p style={{ fontWeight: "bold" }}>{formatAmount(taxAmont?.tax1Amount,2)}</p>
                      </div>
                    )}
                    {taxAmont?.tax2Amount !== 0 && (
                      <div style={{display: "flex", justifyContent: "space-between", borderBottom: "1px solid green", paddingRight: "10px",}}> 
                        <p style={{ fontSize: "9px", paddingTop: "1.5px"}}>{formatTaxLabel(taxAmont?.tax2_taxname, taxAmont?.tax2_value)}</p>
                        <p style={{ fontWeight: "bold" }}>{formatAmount(taxAmont?.tax2Amount,2)}</p>
                      </div>
                    )}
                    {taxAmont?.tax3Amount !== 0 && (
                      <div style={{display: "flex", justifyContent: "space-between", borderBottom: "1px solid green", paddingRight: "10px",}}> 
                        <p style={{ fontSize: "9px", paddingTop: "1.5px"}}>{formatTaxLabel(taxAmont?.tax3_taxname, taxAmont?.tax3_value)}</p>
                        <p style={{ fontWeight: "bold" }}>{formatAmount(taxAmont?.tax3Amount,2)}</p>
                      </div>
                    )}
                    {taxAmont?.tax4Amount !== 0 && (
                      <div style={{display: "flex", justifyContent: "space-between", borderBottom: "1px solid green", paddingRight: "10px",}}> 
                        <p style={{ fontSize: "9px", paddingTop: "1.5px"}}>{formatTaxLabel(taxAmont?.tax4_taxname, taxAmont?.tax4_value)}</p>
                        <p style={{ fontWeight: "bold" }}>{formatAmount(taxAmont?.tax4Amount,2)}</p>
                      </div>
                    )}
                    {taxAmont?.tax5Amount !== 0 && (
                      <div style={{display: "flex", justifyContent: "space-between", borderBottom: "1px solid green", paddingRight: "10px",}}> 
                        <p style={{ fontSize: "9px", paddingTop: "1.5px"}}>{formatTaxLabel(taxAmont?.tax5_taxname, taxAmont?.tax5_value)}</p>
                        <p style={{ fontWeight: "bold" }}>{formatAmount(taxAmont?.tax5Amount,2)}</p>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingRight: "10px",
                      }}
                    >
                      <p>Total</p>
                      <p>
                        <b>
                          {" "}
                          {formatAmount(
                            summary?.totalAmount + totalEtraTaxAmount + taxAmont?.totaltaxAmount -totalDiscountAMT
                          )}
                        </b>
                      </p>
                    </div>
                  </div>
                </div>
                <div style={{ width: "100%", borderBottom: "1px solid green", paddingLeft: "4px" }}>
                    Amount In Words : <span style={{fontWeight: "bold"}}>Rupees {rupeesInWords + paiseInWords} Only</span>
                  </div>
                {json0Data?.Declaration && (
                  <div
                    className="second_main_box_div"
                    style={{ padding: "4px" }}
                  >
                    <p className="memo1_title_secondBox_bottom_desc">
                      <b>Terms & Conditions :</b>
                    </p>
                    <div
                      className="tax_inoivea_declartion"
                      dangerouslySetInnerHTML={{
                        __html: json0Data?.Declaration,
                      }}
                    ></div>
                  </div>
                )}
                <div
                  style={{
                    borderTop: "1px solid green",
                    borderBottom: "1px solid green",
                    paddingBottom: "5px",
                  }}
                >
                  <div className="col-6 p-1 w-100">
                    <p>
                      <b>Banking & GST information:</b>
                    </p>
                    <div style={{ display: "flex", lineHeight: "11px" }}>
                      <p style={{ minWidth: "120px" }}>Baneficiary Name :</p>
                      <p>{json0Data?.CompanyFullName}</p>
                    </div>
                    <div style={{ display: "flex", lineHeight: "11px" }}>
                      <p style={{ minWidth: "120px" }}>Bank Name & Address:</p>
                      <p>
                        {json0Data?.bankname} , {json0Data?.bankaddress}
                      </p>
                    </div>
                    <div style={{ display: "flex", lineHeight: "11px" }}>
                      <p style={{ minWidth: "120px" }}>Account Name :</p>
                      <p>{json0Data?.accountname}</p>
                    </div>
                    <div style={{ display: "flex", lineHeight: "11px" }}>
                      <p style={{ minWidth: "120px" }}>Account Number :</p>
                      <p>{json0Data?.accountnumber}</p>
                    </div>
                    <div style={{ display: "flex", lineHeight: "11px" }}>
                      <p style={{ minWidth: "120px" }}>Bank IFSC Code :</p>
                      <p>{json0Data?.rtgs_neft_ifsc}</p>
                    </div>
                    <div style={{ display: "flex", lineHeight: "11px" }}>
                      <p style={{ minWidth: "120px" }}>Bank MICR Code :</p>
                      <p>{json0Data?.micrcode}</p>
                    </div>
                    <div style={{ display: "flex", lineHeight: "11px" }}>
                      <p style={{ minWidth: "120px" }}>Bank SWIFT Code :</p>
                      <p>{json0Data?.swiftcode}</p>
                    </div>
                    <div style={{ display: "flex", lineHeight: "11px" }}>
                      <p style={{ minWidth: "120px" }}>GST Number :</p>
                      <p>{json0Data?.Company_VAT_GST_No}</p>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    borderBottom: "1px solid green",
                    minHeight: "80px",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px",
                  }}
                  className="bottomo_section_for_print"
                >
                  <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <p>
                      <b style={{ fontSize: "12px" }}>Buyer`s Signature</b>
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <p>
                      <b style={{ fontSize: "11px" }}>
                        For Aryamond Luxury Products Private Limited
                      </b>
                    </p>
                    <p>
                      <b
                        style={{
                          fontSize: "12px",
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        Authorized Signature
                      </b>
                    </p>
                  </div>
                </div>
              </div>
              <tfoot>
                <tr>
                  <td>
                    <div
                      className="footerForThe_print"
                      style={{
                        // borderTop: "1px solid black",
                        paddingTop: "10px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          marginBlock: "5px",
                          width: "60%",
                          margin: "auto",
                        }}
                      >
                        <h2
                          style={{ textAlign: "center" }}
                          className="fw-bold detailPrint1L_font_16"
                        >
                          {json0Data?.CompanyFullName}
                        </h2>
                        <p
                          style={{ textAlign: "center" }}
                          className="lhDetailPrint1"
                        >
                          {json0Data?.CompanyAddress}{" "}
                          {json0Data?.CompanyAddress2} {json0Data?.CompanyCity}-
                          {json0Data?.CompanyPinCode}, {json0Data?.CompanyState}{" "}
                          ({json0Data?.CompanyCountry})
                        </p>
                        <p
                          style={{ textAlign: "center" }}
                          className="lhDetailPrint1"
                        >
                          {json0Data?.CompanyEmail} | T{" "}
                          {json0Data?.CompanyTellNo}
                        </p>
                        <p
                          className="lhDetailPrint1"
                          style={{
                            textAlign: "center",
                          }}
                        >
                          {json0Data?.CompanyWebsite}
                        </p>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          right: "20px",
                          top: "10px",
                        }}
                      >
                        <img
                          src={signatureLogo}
                          alt="Signature"
                          className="jewel_design_images"
                          style={{ maxWidth: "100px" }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>{" "}
        </div>
      ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
          {msg}
        </p>
      )}
    </>
  );
};

export default TaxInvoiceAMaterial;





//  const organizeDataSample = (hr, ar1, ar2) => {
  //     let resultArr = [];
  //     let totals = {
  //       diamondPcs: 0,
  //       diamondWt: 0,
  //       diamondAmount: 0,
  //       metalWt: 0,
  //       metalNL: 0,
  //       metalAmount: 0,
  //       colorStonePcs: 0,
  //       colorStoneWt: 0,
  //       colorStoneAmount: 0,
  //       totalAmount: 0,
  //       discountTotalAmount: 0,
  //       sgstAmount: 0,
  //       cgstAmount: 0,
  //       withoutDiscountTotalAmount: 0,
  //       withDiscountTaxAmount: 0,
  //       labourAmount: 0,
  //       netWt: 0,
  //     };

  //     let summary = {
  //       gold24Kt: 0,
  //       grossWt: 0,
  //       gDWt: 0,
  //       netWt: 0,
  //       diamondWt: 0,
  //       diamondpcs: 0,
  //       stoneWt: 0,
  //       stonePcs: 0,
  //       metalAmount: 0,
  //       diamondAmount: 0,
  //       colorStoneAmount: 0,
  //       makingAmount: 0,
  //       otherCharges: 0,
  //       addLess: 0,
  //       total: 0,
  //     };

  //     // eslint-disable-next-line array-callback-return
  //     ar1?.map((e) => {
  //       let metalWt = 0;
  //       if (detailtPrintR || detailtPrintL || detailtPrintp) {
  //         summary.gold24Kt = summary.gold24Kt + e?.PureNetWt;
  //       }
  //       if (detailPrintK) {
  //         summary.gold24Kt += e.PureNetWt;
  //       }
  //       let totalAmounts = e?.DiscountAmt + e?.TotalAmount;
  //       let OtherAmountDetail = otherAmountDetail(e?.OtherAmtDetail);
  //       let totalOther =
  //         e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling;
  //       totals.labourAmount +=
  //         e?.MakingAmount + e?.TotalCsSetcost + e?.TotalDiaSetcost;
  //       let obj = { ...e };
  //       obj.OtherAmountDetail = OtherAmountDetail;
  //       obj.totalOther = totalOther;
  //       obj.SettingAmount = 0;
  //       let diamondArr = [];
  //       let metalArr = [];
  //       let colorStoneArr = [];
  //       let otherMisc = e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling;
  //       let primaryMetalWt = 0;
  //       let diamondsTotal = {
  //         Pcs: 0,
  //         Wt: 0,
  //         Amount: 0,
  //         RMwt: 0,
  //       };
  //       let metalTotal = {
  //         Pcs: 0,
  //         Wt: 0,
  //         Amount: 0,
  //       };
  //       let colorStonesTotal = {
  //         Pcs: 0,
  //         Wt: 0,
  //         Amount: 0,
  //       };
  //       let discountTotalAmount = 0;

  //       // eslint-disable-next-line array-callback-return
  //       ar2?.map((el) => {
  //         if (e?.SrJobno === el?.StockBarcode) {
  //           if (el?.MasterManagement_DiamondStoneTypeid === 1) {
  //             diamondArr.push(el);
  //             diamondsTotal.Pcs += el?.Pcs;
  //             diamondsTotal.Wt += el?.Wt;
  //             diamondsTotal.Amount += el?.Amount;
  //             diamondsTotal.RMwt += el?.RMwt;
  //             totals.diamondPcs += el?.Pcs;
  //             totals.diamondWt += el?.Wt;
  //             totals.diamondAmount += el?.Amount;
  //             summary.diamondWt += el?.Wt;
  //             summary.diamondpcs += el?.Pcs;
  //             summary.diamondAmount += el?.Amount;
  //             metalWt += el?.Wt;
  //           }
  //           if (el?.MasterManagement_DiamondStoneTypeid === 4) {
  //             metalArr.push(el);
  //             metalTotal.Pcs += el?.Pcs;
  //             metalTotal.Wt += el?.Wt;
  //             metalTotal.Amount += el?.Amount;
  //             if (!detailtPrintR) {
  //               if (!detailPrintK) {
  //                 summary.gold24Kt += el?.FineWt;
  //               }
  //             }
  //             if (el?.IsPrimaryMetal === 1) {
  //               primaryMetalWt += el?.Wt;
  //             }
  //             // totals.metalWt += el?.Wt;
  //             totals.metalAmount += el?.Amount;
  //             summary.metalAmount += el?.Amount;
  //           }
  //           if (el?.MasterManagement_DiamondStoneTypeid === 2) {
  //             colorStoneArr.push(el);
  //             colorStonesTotal.Pcs += el?.Pcs;
  //             colorStonesTotal.Wt += el?.Wt;
  //             colorStonesTotal.Amount += el?.Amount;
  //             totals.colorStonePcs += el?.Pcs;
  //             totals.colorStoneWt += el?.Wt;
  //             totals.colorStoneAmount += el?.Amount;
  //             summary.stoneWt += el?.Wt;
  //             summary.stonePcs += el?.Pcs;
  //             summary.colorStoneAmount += el?.Amount;
  //           }
  //           obj.SettingAmount += el?.SettingAmount;
  //           summary.makingAmount += el?.SettingAmount;
  //         }
  //       });

  //       metalWt = metalWt / 5 + e?.NetWt;
  //       totals.metalWt += metalWt;
  //       // totals.metalWt += e?.DiamondCTWwithLoss / 5;
  //       metalTotal.Wt = metalWt;
  //       // discountTotalAmount = e?.TotalAmount - e?.DiscountAmt;
  //       discountTotalAmount = e?.TotalAmount;
  //       summary.grossWt += e?.grosswt;
  //       summary.gDWt += e?.MetalDiaWt + e?.DiamondCTWwithLoss / 5;
  //       summary.netWt += e?.NetWt;
  //       summary.makingAmount += e?.MakingAmount;
  //       // summary.otherCharges += e?.OtherCharges;
  //       summary.otherCharges += totalOther;
  //       obj.diamonds = diamondArr;
  //       obj.primaryMetalWt = primaryMetalWt;
  //       obj.metals = metalArr;
  //       obj.colorStones = colorStoneArr;
  //       obj.diamondsTotal = diamondsTotal;
  //       obj.metalTotal = metalTotal;
  //       obj.colorStonesTotal = colorStonesTotal;
  //       obj.discountTotalAmount = discountTotalAmount;
  //       obj.totalAmounts = totalAmounts;
  //       obj.otherMisc = otherMisc;
  //       if (obj.metals[0]) {
  //         obj.metals[0].Wt = metalWt;
  //       }
  //       totals.totalAmount += e?.TotalAmount;
  //       totals.discountTotalAmount += obj?.DiscountAmt;
  //       totals.withoutDiscountTotalAmount += e?.TotalAmount;
  //       totals.netWt += e?.NetWt + e?.LossWt;
  //       resultArr.push(obj);
  //       // setDiamondDetails(diamondDetails);
  //     });
  //     summary.addLess = hr?.AddLess;
  //     summary.total =
  //       summary?.metalAmount +
  //       summary?.diamondAmount +
  //       summary?.colorStoneAmount +
  //       summary?.makingAmount +
  //       summary?.otherCharges +
  //       summary?.addLess;
  //     totals.cgstAmount = (totals?.withoutDiscountTotalAmount * hr?.CGST) / 100;
  //     totals.sgstAmount = (totals?.withoutDiscountTotalAmount * hr?.SGST) / 100;
  //     let taxValue = taxGenrator(hr, totals?.totalAmount);
  //     setTaxes(taxValue);
  //     taxValue?.length > 0 &&
  //       taxValue.forEach((e, i) => {
  //         totals.withDiscountTaxAmount += +e?.amount;
  //       });
  //     totals.withDiscountTaxAmount +=
  //       hr?.AddLess + totals?.totalAmount - hr?.Privilege_discount;
  //     setSummary(summary);
  //     setTotal(totals);
  //     return resultArr;
  //   };