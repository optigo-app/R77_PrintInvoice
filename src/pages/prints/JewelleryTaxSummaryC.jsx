import React from "react";
import "../../assets/css/prints/jewellerytaxsummary.css";
import { ToWords } from "to-words";
import { useState } from "react";
import Loader from "../../components/Loader";
import Button from "../../GlobalFunctions/Button";
import { useEffect } from "react";
import {
  apiCall,
  checkMsg,
  formatAmount,
  handleImageError,
  isObjectEmpty,
  ReceiveInBank,
} from "../../GlobalFunctions";
import { cloneDeep } from "lodash";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { deepClone } from "@mui/x-data-grid/utils/utils";

const JewelleryTaxSummaryC = ({
  token,
  invoiceNo,
  printName,
  urls,
  evn,
  ApiVer,
}) => {
  console.log('evn: ', atob(evn));
  const toWords = new ToWords();
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const [image, setImage] = useState(true);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const [purityWise, setPurityWise] = useState([]);
  const [bank, setBank] = useState([]);

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
    const copydata = cloneDeep(data);

    let address = copydata?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    copydata.BillPrint_Json[0].address = address;

    const datas = OrganizeDataPrint(
      copydata?.BillPrint_Json[0],
      copydata?.BillPrint_Json1,
      copydata?.BillPrint_Json2
    );
    setResult(datas);
    let debitCardinfo = ReceiveInBank(data?.BillPrint_Json[0]?.BankPayDet);
    setBank(debitCardinfo);
    let pwise = [];

    datas?.resultArray?.forEach((el) => {
      let obj = deepClone(el);
      let findRec = pwise?.findIndex(
        (a) => a?.MetalTypePurity === obj?.MetalTypePurity
      );
      if (findRec === -1) {
        pwise.push(obj);
      } else {
        pwise[findRec].grosswt += obj?.grosswt;
        pwise[findRec].NetWt += obj?.NetWt;
        pwise[findRec].LossWt += obj?.LossWt;
      }
    });
    pwise.sort((a, b) => {
      const purityA = parseInt(a.MetalTypePurity.match(/\d+/)[0]);
      const purityB = parseInt(b.MetalTypePurity.match(/\d+/)[0]);
      return purityA - purityB;
    });
    setPurityWise(pwise);
  };

  const handleImageErrors = () => {
    setIsImageWorking(false);
  };

  const handleChangeImage = (e) => {
    image ? setImage(false) : setImage(true);
  };

  const taxes = result?.allTaxes?.map((e) =>
    e?.amountInNumber != null ? e.amountInNumber : parseFloat(e?.amount)
  );
  const totalTax = taxes?.reduce((acc, val) => acc + (isNaN(val) ? 0 : val), 0);

  // const finalAmount =
  // (result?.mainTotal?.TotalAmount + result?.header?.FreightCharges) /
  //   result?.header?.CurrencyExchRate +
  //   result?.allTaxesTotal;
  // const decimalPart = parseFloat(
  //   (finalAmount - Math.floor(finalAmount)).toFixed(2)
  // );
  // let roundedAmount = finalAmount;
  // if (decimalPart < 0.5) {
  //   roundedAmount = finalAmount - decimalPart;
  // } else {
  //   roundedAmount = finalAmount + (1 - decimalPart);
  // }

  
  console.log("resultdata", result);

  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          {msg === "" ? (
            <>
              <div className="container_jts">
                <div className="mb-5 pb-5 d-flex justify-content-end align-items-center mt-5 pt-5 d_none_jts">
                  <div className="form-check pe-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={image}
                      onChange={handleChangeImage}
                    />
                    <label
                      className="form-check-label pt-1"
                      htmlFor="flexCheckDefault"
                    >
                      With Image
                    </label>
                  </div>
                  <Button />
                </div>
                {/* <div className="d-flex justify-content-between align-items-center p-1">
                  <div className="fs_jts">
                    <div className="fs2_jts fw-bold">
                      {result?.header?.CompanyFullName}
                    </div>
                    <div>{result?.header?.CompanyAddress}</div>
                    <div>{result?.header?.CompanyAddress2}</div>
                    <div>
                      {result?.header?.CompanyCity}-
                      {result?.header?.CompanyPinCode},{" "}
                      {result?.header?.CompanyState}(
                      {result?.header?.CompanyCountry})
                    </div>
                    <div>T {result?.header?.CompanyTellNo}</div>
                    <div>
                      {result?.header?.CompanyEmail} |{" "}
                      {result?.header?.CompanyWebsite}
                    </div>
                    <div>
                      {result?.header?.Company_VAT_GST_No} |{" "}
                      {result?.header?.Company_CST_STATE}-
                      {result?.header?.Company_CST_STATE_No} | PAN-
                      {result?.header?.Com_pannumber}
                    </div>
                  </div>
                  <div>
                    {isImageWorking && result?.header?.PrintLogo !== "" && (
                      <img
                        src={result?.header?.PrintLogo}
                        alt=""
                        className="w-100 h-auto my-0 mx-auto d-block object-fit-contain"
                        style={{
                          minHeight: "75px",
                          minWidth: "200px",
                          maxWidth: "210px",
                          maxHeight: "75px",
                        }}
                        onError={handleImageErrors}
                        height={120}
                        width={150}
                      />
                    )}
                  </div>
                </div> */}
                <div className="border spPad05 d-flex justify-content-between" style={{ paddingBottom: "35px" }}>
                  <div className="fs_jts devidePDetail1">
                    <div className="fs2_jts1 fw-bold">
                      {result?.header?.customerfirmname}
                    </div>
                    <div>{result?.header?.customerstreet}</div>
                    <div>{result?.header?.customercity} {result?.header?.customerstate} {result?.header?.PinCode}</div>
                    <div>{result?.header?.customercountry}</div>
                    {/*<div>Tel : {result?.header?.customermobileno}</div>
                    <div>{result?.header?.customeremail1}</div> */}
                  </div>
                  <div className="fs_jts devidePDetail2">
                    <div className="d-flex w-100">
                      <div className="w-50">{atob(evn) == "orders" ? "Order#" :  "Invoice#"}:</div>
                      <div className="fw-bold w-50">
                        {result?.header?.InvoiceNo}
                      </div>
                    </div>
                    <div className="d-flex w-100">
                      <div className="w-50">Dated</div>{" "}
                      <div className="fw-bold w-50">
                        {result?.header?.EntryDate}
                      </div>
                    </div>
                    {(result?.header?.CashReceived > 0 ||
                      result?.header?.AdvanceAmount > 0 ||
                      (Array.isArray(bank) && bank.length > 0)) && (
                      <div className="d-flex w-100">
                        <div className="w-50">Mode Of Payment</div>
                        <div className="fw-bold w-50 spbrWord">
                          {[
                            result?.header?.CashReceived > 0 ? "Cash" : "",
                            result?.header?.AdvanceAmount > 0 ? "Advance" : "",
                            ...(Array.isArray(bank) ? [...new Set(bank?.map((e) => e?.label))] : [])
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      </div>
                    )}
                    {/* <div>
                      {result?.header?.HSN_No_Label}:{" "}
                      <span className="fw-bold">{result?.header?.HSN_No}</span>
                    </div> */}
                    {/* <div>
                      PAN#:{" "}
                      <span className="fw-bold">
                        {result?.header?.CustPanno}
                      </span>
                    </div> */}
                    {/* <div>
                      {result?.header?.CustGstNo === "" ? "VAT" : "GSTIN"}{" "}
                      &nbsp;
                      <span className="fw-bold">
                        {result?.header?.CustGstNo === ""
                          ? result?.header?.Cust_VAT_GST_No
                          : result?.header?.CustGstNo}
                      </span>
                      | {result?.header?.Cust_CST_STATE}{" "}
                      <span className="fw-bold">
                        {result?.header?.Cust_CST_STATE_No}
                      </span>
                    </div> */}
                    {/* {result?.header?.DueDays === 0 ? (
                      ""
                    ) : (
                      <div>
                        Terms:{" "}
                        <span className="fw-bold">
                          {result?.header?.DueDays} Days
                        </span>
                      </div>
                    )} */}
                    {/* <div>
                      Due Date:{" "}
                      <span className="fw-bold">{result?.header?.DueDate}</span>
                    </div> */}
                  </div>
                </div>
                <div className="table_jts">
                  <div className="thead_jts fs2_jts1">
                    <div className="col1_jts center_jts brr_jts">SR NO</div>
                    <div className="col2_jts center_jts brr_jts">ITEM CODE</div>
                    <div className="col3_jts center_jts brr_jts">
                      DESCRIPTION
                    </div>
                    <div className="col4_jts center_jts">AMOUNT</div>
                  </div>
                  <div className="tbody_jts">
                    {result?.resultArray?.map((e, i) => {
                      return (
                        <div
                          className="d-flex w-100 brl_jts brr_jts brb_jts fs_jts pbia_jts"
                          key={i}
                        >
                          <div className="col1_jts  d-flex align-items-start justify-content-center brr_jts p-1">
                            {i + 1}
                          </div>
                          <div className="col2_jts start_jts p-1 brr_jts d-flex flex-column align-items-start text-break">
                            <div className="text-break lh_jts">
                              Job: {e?.SrJobno}
                            </div>
                            {image && (
                              <div>
                              <img
                                src={e?.DesignImage}
                                onError={(e) => handleImageError(e)}
                                alt="design"
                                className="spImag p-1"
                              />
                              </div>
                            )}
                            <div className="text-break lh_jts">
                              Design:{" "}
                              <span className="fw-bold">{e?.designno}</span>
                            </div>
                            <div className="text-break lh_jts">{e?.Size}</div>
                          </div>
                          <div className="col3_jts d-flex align-items-start justify-content-start p-1 brr_jts text-break" style={{flexDirection: "column"}}>
                            {e?.MetalTypePurity} {e?.MetalColor} |{" "}
                            {e?.grosswt?.toFixed(3)} gms GW |{" "}
                            {e?.NetWt?.toFixed(3)} gms NW
                            {e?.totals?.diamonds?.Wt === 0
                              ? ""
                              : ` | DIA : ${e?.totals?.diamonds?.Wt?.toFixed(
                                  3
                                )} Cts `}
                            {e?.totals?.colorstone?.Wt === 0
                              ? ""
                              : ` | CS : ${e?.totals?.colorstone?.Wt?.toFixed(
                                  3
                                )} Cts `}
                            {e?.totals?.misc?.Wt === 0
                              ? ""
                              : ` | MISC : ${e?.totals?.misc?.Wt?.toFixed(
                                  3
                                )} gms `}
                            {/* | DIA: {e?.totals?.diamonds?.Wt?.toFixed(3)} Cts | CS: {e?.totals?.colorstone?.Wt?.toFixed(3)} Cts | MISC: {e?.totals?.misc?.Wt?.toFixed(3)} gms */}
                            <br />{e?.Categoryname}
                            
                            {e?.JobRemark !== "" && (
                      <p className="pt-1">
                        <span className="fw-bold">REMARKS:</span> {e?.JobRemark}
                      </p>
                    )}
                          </div>
                          <div className="col4_jts d-flex align-items-start justify-content-end p-1">
                            <span
                              className="pe-1"
                              dangerouslySetInnerHTML={{
                                __html: result?.header?.Currencysymbol,
                              }}
                            ></span>
                            {formatAmount(e?.TotalAmount + e?.DiscountAmt)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* <div
                    className="thead_jts fs2_jts1"
                    style={{ marginTop: "5px" }}
                  >
                    <div className="col1_jts center_jts brr_jts"></div>
                    <div className="col2_jts start_jts brr_jts ps-1">TOTAL</div>
                    <div className="col3_jts center_jts brr_jts"></div>
                    <div className="col4_jts end_jts pe-1">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: result?.header?.Currencysymbol,
                        }}
                      ></span>{" "}
                      {formatAmount(
                        result?.mainTotal?.total_amount +
                          result?.mainTotal?.total_discount_amount
                      )}
                    </div>
                  </div> */}
                </div>
                <div className="brall_jts d-flex pbia_jts" style={{ marginTop: "5px" }}>
                  <div className="w33_jts p-1 fs_jts brr_jts">
                    <div className="fw-bold text-decoration-underline">
                      {result?.header?.PrintRemark !== "" && ("REMARKS:")}
                    </div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: result?.header?.PrintRemark,
                      }}
                    ></div>
                  </div>
                  <div className="w33_jts p-1 fs2_jts1 brr_jts">
                    {purityWise?.map((e, i) => {
                      return (
                        <div className="w-100 d-flex" key={i}>
                          <div className="w30_jts">{e?.MetalTypePurity} : </div>
                          <div className="w-50">{e?.NetWt?.toFixed(3)} gm</div>
                        </div>
                      );
                    })}
                    <div className="w-100 d-flex">
                      <div className="w30_jts">Diamond Wt : </div>
                      <div className="w-50">
                        {result?.mainTotal?.diamonds?.Wt?.toFixed(3)} cts
                      </div>
                    </div>
                    <div className="w-100 d-flex">
                      <div className="w30_jts">Stone Wt : </div>
                      <div className="w-50">
                        {result?.mainTotal?.colorstone?.Wt?.toFixed(3)} cts
                      </div>
                    </div>
                    <div
                      className="w-100 d-flex"
                      style={{ marginBottom: "10px" }}
                    >
                      <div className="w30_jts">Gross Wt : </div>
                      <div className="w-50">
                        {result?.mainTotal?.grosswt?.toFixed(3)} gm
                      </div>
                    </div>
                  </div>
                  <div className="w33_jts fs2_jts1 d-flex">
                    <div className="brr_jts w1_jts">
                      <div className="start_jts ps-1">Sub Total</div>
                      <div className="start_jts ps-1">Total Discount</div>
                      {/* <div className="start_jts ps-1">Taxable Value</div> */}
                      <div className="start_jts ps-1">
                          Tax
                      </div>
                      <div className="start_jts ps-1">
                        {result?.header?.AddLess < 0 ? "Less" : result?.header?.AddLess > 0 ? "Add" : "" }
                      </div>
                      {result?.header?.ModeOfDel !== null && (
                        <div className="start_jts ps-1">{result?.header?.ModeOfDel}</div>
                      )}
                    </div>
                    <div className="w2_jts fw-bold">
                      <div className="end_jts pe-1">
                        <span
                          className="pe-1"
                          dangerouslySetInnerHTML={{
                            __html: result?.header?.Currencysymbol,
                          }}
                        ></span>
                        {formatAmount(
                          result?.mainTotal?.total_amount +
                          result?.mainTotal?.total_discount_amount
                        )}
                      </div>
                      <div className="end_jts pe-1">
                        <span
                          className="pe-1"
                          dangerouslySetInnerHTML={{
                            __html: result?.header?.Currencysymbol,
                          }}
                        ></span>
                        {formatAmount(result?.mainTotal?.total_discount_amount)}
                      </div>
                      {/* <div className="end_jts pe-1">
                        <span
                          className="pe-1"
                          dangerouslySetInnerHTML={{
                            __html: result?.header?.Currencysymbol,
                          }}
                        ></span>
                        {formatAmount(
                          result?.mainTotal?.total_amount /
                            result?.header?.CurrencyExchRate 
                        )}
                      </div> */}
                      <div className="end_jts pe-1 fw-bold">
                        <span
                          className="pe-1"
                          dangerouslySetInnerHTML={{
                            __html: result?.header?.Currencysymbol,
                          }}
                        ></span>
                        {formatAmount(
                          result?.allTaxes?.reduce(
                            (acc, curr) => acc + (Number(curr?.amount) || 0),
                            0
                          )
                        )}
                      </div>
                      {result?.header?.AddLess !== 0 && ( 
                        <div className="end_jts pe-1">
                          <span
                            className="pe-1"
                            dangerouslySetInnerHTML={{
                              __html: result?.header?.Currencysymbol,
                            }}
                          ></span>
                          {formatAmount(result?.header?.AddLess)}
                        </div>
                      )}
                      {/* <div className="end_jts pe-1">
                        <span
                          className="pe-1"
                          dangerouslySetInnerHTML={{
                            __html: result?.header?.Currencysymbol,
                          }}
                        ></span>
                        {formatAmount(
                          result?.mainTotal?.total_amount /
                            result?.header?.CurrencyExchRate +
                            totalTax
                        )}
                      </div> */}
                      {/* {result?.header?.AddLess === null && (
                        <div className="end_jts pe-1">
                          <span
                            className="pe-1"
                            dangerouslySetInnerHTML={{
                              __html: result?.header?.Currencysymbol,
                            }}
                          ></span>
                          {formatAmount(
                            result?.header?.AddLess /
                              result?.header?.CurrencyExchRate
                          )}
                        </div>
                      )} */}
                      {result?.header?.FreightCharges !== 0 && (
                        <div className="end_jts pe-1">
                          <span
                            className="pe-1"
                            dangerouslySetInnerHTML={{
                              __html: result?.header?.Currencysymbol,
                            }}
                          ></span>
                          {formatAmount(
                            result.header.FreightCharges /
                              result.header.CurrencyExchRate
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="thead_jts pbia_jts fs2_jts1">
                  <div className="col1_jts center_jts"></div>
                  <div className="col2_jts start_jts ps-1"></div>
                  <div className="col3_jts end_jts brr_jts lastPad">
                    GRAND TOTAL
                  </div>
                  <div className="col4_jts end_jts pe-1">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: result?.header?.Currencysymbol,
                      }}
                    ></span>&nbsp;
                    {formatAmount(
                      (result?.finalAmount  + result.header.FreightCharges) / result?.header?.CurrencyExchRate
                    )}
                  </div>
                </div>
                {/* <div className="static_jts py-2">
                  ** THIS IS A COMPUTER GENERATED INVOICE AND KINDLY NOTIFY US
                  IMMEDIATELY IN CASE YOU FIND ANY DISCREPANCY IN THE DETAILS OF
                  TRANSACTIONS
                </div> */}
                {/* <div className="brall_jts dec_jts p-2 pbia_jts">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: result?.header?.Declaration,
                    }}
                  ></div>
                </div> */}
                <div className="d-flex fs2_jts1 brall_jts pbia_jts" style={{ height: "100px", marginTop: "5px" }}>
                  {/* <div className="w33_jts p-1 brr_jts">
                    <div className="fw-bold">Bank Detail </div>
                    <div>Bank Name: {result?.header?.bankname}</div>
                    <div>Branch: {result?.header?.bankaddress}</div>
                    <div>Account Name: {result?.header?.accountname}</div>
                    <div>Account No. : {result?.header?.accountnumber}</div>
                    <div>RTGS/NEFT IFSC: {result?.header?.rtgs_neft_ifsc}</div>
                  </div> */}
                  <div className="w33_jts w-50 p-1 brr_jts d-flex flex-column justify-content-between text-end">
                    <div>Signature</div>
                    <div className="fw-bold">
                      {result?.header?.customerfirmname}
                    </div>
                  </div>
                  <div className="w33_jts w-50 p-1 d-flex flex-column justify-content-between text-end">
                    <div>Signature</div>
                    <div className="fw-bold">
                      {result?.header?.CompanyFullName}
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

export default JewelleryTaxSummaryC;
