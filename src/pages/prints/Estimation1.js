//http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=UEUvMTQ3LzIwMjU=&evn=c2FsZQ==&pnm=RXN0aW1hdGUgMQ==&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=Estimate1&pid=undefined
import React from "react";
import "../../assets/css/prints/Estimation1.css";
import { ToWords } from "to-words";
import { useState } from "react";
import Loader from "../../components/Loader";
import Button from "../../GlobalFunctions/Button";
import { useEffect } from "react";
import {
  apiCall,
  checkMsg,
  formatAmount,
  NumberWithCommas,
  fixedValues,
  isObjectEmpty,
} from "../../GlobalFunctions";
import { cloneDeep } from "lodash";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { deepClone } from "@mui/x-data-grid/utils/utils";

const Estimation1 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  const toWords = new ToWords();
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const [purityWise, setPurityWise] = useState([]);
  const [detalsFlag, setDetalsFlag] = useState(false);

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
        console.log("datadatadata", data);

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

  const finalAmount =
    (result?.mainTotal?.TotalAmount + result?.header?.FreightCharges) /
      result?.header?.CurrencyExchRate +
    result?.allTaxesTotal;
  const decimalPart = parseFloat(
    (finalAmount - Math.floor(finalAmount)).toFixed(2)
  );
  let roundedAmount = finalAmount;
  if (decimalPart < 0.5) {
    roundedAmount = finalAmount - decimalPart;
  } else {
    roundedAmount = finalAmount + (1 - decimalPart);
  }

  const handleCheckbox = () => {
    if (! detalsFlag) {
      setDetalsFlag(true);
    } else {
      setDetalsFlag(false);
    }
  };

  console.log("resultdata", result);

  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          {msg === "" ? (
            <>
              <div className="d-flex justify-content-end align-items-center d_none_jts FrstWdth">
                <input
                  type="checkbox"
                  id="detalshideshow"
                  className="mx-1 fontCheck"
                  checked={detalsFlag}
                  onChange={handleCheckbox}
                />
                <label
                  htmlFor="detalshideshow"
                  className="me-3 user-select-none fontCheck"
                >
                  With Detail
                </label>
                <Button />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div className="estimation1_main">
                  <div className="topheaderMain">
                    <p className="copmName">
                      {result?.header?.CompanyFullName}
                    </p>
                    {/* <p className="compPhone">Ph:09856589851/09856589851</p> */}
                    <p className="title_estimate">{result?.header?.PrintHeadLabel}</p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderTop: "3px double #000",
                        borderBottom: "3px double #000", 
                        fontSize: "13px",
                        lineHeight: "20px"
                      }}
                    >
                      <p>
                        <span>Est No.&nbsp;: </span>
                        {result?.header?.InvoiceNo}
                      </p>
                      <p>
                        Date: <span>{result?.header?.EntryDate}</span>
                      </p>
                    </div>
                  </div>

                  {result?.resultArray
                    ?.slice() 
                    ?.sort((a, b) => {
                      const numA = parseInt(
                        a?.SrJobno?.split("/")?.[1] || 0,
                        10
                      );
                      const numB = parseInt(
                        b?.SrJobno?.split("/")?.[1] || 0,
                        10
                      );
                      return numA - numB;
                    })
                    ?.map((e, i) => {
                      return e?.metal?.map((el, id) => (
                        <div key={`${i}-${id}`} className="deatilSectionMain">
                          <div className="detail_section_main">
                            <div className="detail_Setion1">
                              <div style={{ display: "flex", gap: "10px" }}>
                                <p>{i + 1}.</p>
                                <p>{e?.SrJobno}</p>
                              </div>
                              <p>{e?.SubCategoryname}</p>
                              <p>
                                {e?.Categoryname}({e?.MetalPurity})
                              </p>
                              <p>{e?.metal_rate?.toFixed(2)}</p>
                            </div>
                            <div className="detail_Setion2">
                              <div className="detail_Setion2_sub1">
                                <p>Gr.Wt</p>
                                <p>Less St Wt</p>
                                <p>Net Wt </p>
                                <p>Value Added In Grm</p>
                                <p>Net Chg Wt</p>
                              </div>
                              <div className="detail_Setion2_sub2">
                                <p className="">{e?.grosswt?.toFixed(3)}</p>
                                <p>{(e?.grosswt - e?.NetWt)?.toFixed(3)}</p>
                                <p>{e?.NetWt?.toFixed(3)}</p>
                                <p>{e?.LossWt?.toFixed(3)}</p>
                                <p>{e?.MetalDiaWt?.toFixed(3)}</p>
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              borderTop: "1px solid black",
                              borderBottom: "1px solid black",
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <p>
                              <b>Gold Amt</b>
                            </p>
                            <p>
                              <b>{e?.MetalAmount?.toFixed(2)}</b>
                            </p>
                          </div>
                          <div className="fontDmdClr" style={{ display: "flex", flexDirection: "column"   }}>
                            {detalsFlag ? (
                              <>
                                {e?.diamonds?.map((el, index) => (
                                  
                               
                                  <div key={index} style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                                           
                                    <p style={{ width: "20%" }}> {el?.IsSolGem==1?"S: ":""} {el?.ShapeName} {el?.SizeName}</p>
                                    <p style={{ width: "20%", textAlign: "end" }}>{fixedValues(el?.Wt, 3)}CT</p>
                                    <p style={{ width: "20%", textAlign: "end" }}>{el?.Pcs} pcs</p>
                                    <p style={{ width: "20%", textAlign: "end" }}>{NumberWithCommas(el?.Rate, 2)}</p>
                                    <p style={{ width: "20%", textAlign: "end" }}>{NumberWithCommas(el?.Amount, 2)}</p>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <p style={{ width: "20%" }}>Diamond</p>
                                <p>{e?.totals?.diamonds?.Wt?.toFixed(3)}CT</p>
                                <p>{e?.totals?.diamonds?.Pcs} pcs </p>
                                <p>{NumberWithCommas(e?.totals?.diamonds?.Amount,2)}</p>
                              </div>
                              {e?.solitair_weight >0 &&(
                                   <div style={{ display: "flex", justifyContent: "space-between" }}>
                                   <p style={{ width: "20%" }}>Diamond: S</p>
                                   <p>{e?.solitair_weight?.toFixed(3)}CT</p>
                                   <p>{e?.solitair_pieces} pcs </p>
                                   <p>{NumberWithCommas(e?.solitair_totalamount,2)}</p>
                                 </div>
                            )}
                             
                              </>
                              
                              
                            )}
                          </div>
                          <div className="fontDmdClr" style={{ display: "flex", flexDirection: "column"  }}>
                            {detalsFlag ? (
                              <>
                                {e?.colorstone?.map((el, index) => (
                                  <div key={index} style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                                    <p style={{ width: "20%" }}>  {el?.IsSolGem==1?"G: ":""}  {el?.ShapeName} {el?.SizeName}</p>
                                    <p style={{ width: "20%", textAlign: "end" }}>{fixedValues(el?.Wt, 3)}CT</p>
                                    <p style={{ width: "20%", textAlign: "end" }}>{el?.Pcs} pcs</p>
                                    <p style={{ width: "20%", textAlign: "end" }}>{NumberWithCommas(el?.Rate, 2)}</p>
                                    <p style={{ width: "20%", textAlign: "end" }}>{NumberWithCommas(el?.Amount, 2)}</p>
                                  </div>
                                ))}
                              </>
                            ) : (

                              <>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <p style={{ width: "20%" }}>ColorStone</p>
                                <p>{e?.totals?.colorstone?.Wt?.toFixed(3)}CT</p>
                                <p>{e?.totals?.colorstone?.Pcs} pcs</p>
                                <p>{NumberWithCommas(e?.totals?.colorstone?.Amount, 2)}</p>
                              </div>

                              {e?.gemstone_weight >0&&(
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <p style={{ width: "20%" }}>ColorStone: G</p>
                                  <p>{e?.gemstone_weight?.toFixed(3)}CT</p>
                                  <p>{e?.gemstone_pieces} pcs</p>
                                  <p>{NumberWithCommas(e?.totals?.colorstone?.Amount, 2)}</p>
                                </div>
                              )}
                              
                              </>
                            
                            )}
                          </div>
                          <div className="fontDmdClr"
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <p>
                              <b>M/C Total</b>
                            </p>
                            <p>
                              <b>{NumberWithCommas(result?.mainTotal?.total_Making_Amount,2)}</b>
                            </p>
                          </div>
                          <div className="fontDmdClr" style={{ display: "flex", justifyContent: "space-between", borderBottom: "3px double #000",}}>
                            <p>
                              <b>Other</b>
                            </p>
                            <p>
                              <b>
                                {NumberWithCommas(
                                    // e?.totals?.misc?.isHSCODE123_amt +
                                    e?.OtherCharges +
                                    e?.TotalDiamondHandling +
                                    e?.TotalCsSetcost +
                                    e?.TotalDiaSetcost +
                                    e?.totals?.finding?.SettingAmount,2 
                                  )}
                              </b>
                            </p>
                          </div>
                        </div>
                      ));
                    })}
                  <div className="estimate_bottom_total">
                    <div style={{ width: "70%", borderRight: "1px solid" }}>
                      <p>TOTAL VALUE BEFORE GST</p>
                      <p>GST {fixedValues(result?.header?.CGST + result?.header?.SGST,2)}% VALUE</p>
                      <p>TOTAL VALUE OF ORNAMENTS</p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        width: "30%",
                      }}
                    >
                      <p>
                        <b>{NumberWithCommas(result?.mainTotal?.total_amount,2)}</b>
                      </p>

                      <p>
                        <b>{NumberWithCommas(result?.header?.TotalGSTAmount,2)}</b>
                      </p>
                      <p>
                        <b>{NumberWithCommas(result?.finalAmount,2)}</b>
                      </p>
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

export default Estimation1;
