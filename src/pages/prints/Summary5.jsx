import React, { useEffect, useState } from "react";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import {
  apiCall,
  checkMsg,
  formatAmount,
  handleImageError,
  handlePrint,
  isObjectEmpty,
  numberToWord,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import "../../assets/css/prints/summary5.css";
import * as lsh from "lodash";
import { ToWords } from "to-words";
import NumToWord from "../../GlobalFunctions/NumToWord";

const Summary5 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  const toWords = new ToWords();
  const [result, setResult] = useState(null);
  console.log('result: ', result);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const [netwts5, setnetwts5] = useState(true);
  const [imagess5, setimagess5] = useState(true);
  const [headers5, setheaders5] = useState(true);
  const [showDiaQuality, setShowDiaQuality] = useState([]);
  const [miscTotal, setMiscTotal] = useState({
    pcPcs: 0,
    wtWt: 0,
    rRate: 0,
    amtAmount: 0
  })
  const [isImageWorking, setIsImageWorking] = useState(true);
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
        console.log(error);
      }
    };
    sendData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadData(data) {
    const copydata = lsh.cloneDeep(data);

    let address = copydata?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    copydata.BillPrint_Json[0].address = address;

    const datas = OrganizeDataPrint(
      copydata?.BillPrint_Json[0],
      copydata?.BillPrint_Json1,
      copydata?.BillPrint_Json2
    );

    let cateWise = [];
    let miscobj = {
      wtWt: 0,
      pcPcs: 0,
      rRate: 0,
      amtAmount: 0
    }
    let miscquc = [];
    datas?.resultArray?.forEach((e) => {

      let findRecord = cateWise?.findIndex((el) => el?.Categoryname === e?.Categoryname);
      if (findRecord === -1) {
        cateWise.push(e);
      } else {
        cateWise[findRecord].Quantity += e?.Quantity;
      }
      let hs0and3 = [];


      let anomisc = e?.misc?.filter((el) => el?.IsHSCOE === 0 || el?.IsHSCOE === 3)
      e.misc = anomisc;


      // if(e?.misc?.length === 1 && e?.misc[0]?.IsHSCOE === 3){
      //   e.misc = [];
      // } // this was Certification_IGI and bug solved 08/12/25_12:20



      e?.misc?.forEach((a) => {
        if (a?.ShapeName === 'Stamping' || a?.ShapeName === 'Hallmark') { }
        else {
          miscobj.wtWt += a?.Wt;
          miscobj.pcPcs += a?.Pcs;
          miscobj.amtAmount += a?.Amount;
          miscobj.rRate += a?.Rate;
        }
      })

      let clr = [];

      e?.colorstone?.forEach((a) => {
        let findrec = clr?.findIndex((el) => el?.ShapeName === a?.ShapeName && el?.QualityName === a?.QualityName && el?.Colorname === a?.Colorname && el?.isRateOnPcs === a?.isRateOnPcs && el?.Rate === a?.Rate && el?.SizeName === a?.SizeName)
        if (findrec === -1) {
          let obj = { ...a };
          obj.cspcs = a?.Pcs;
          obj.cswt = a?.Wt;
          obj.Rate = a?.Rate;
          obj.csamt = a?.Amount;
          clr.push(obj);
        } else {
          clr[findrec].cspcs += a?.Pcs;
          clr[findrec].cswt += a?.Wt;
          clr[findrec].Rate += a?.Rate;
          clr[findrec].csamt += a?.Amount;
        }
      })

      e.colorstone = clr;

      // console.log("e?.misc", e?.misc);
      e?.misc?.forEach((el) => {
        if (el.Quality_Code !== '' && el.Quality_Code !== '-') {
          miscquc.push(el?.Quality_Code)
        }
      })
    });

    // console.log("miscquc", miscquc);
    let newMisc = new Set(miscquc);
    let newMiscArray = [...newMisc];
    setShowDiaQuality(newMiscArray);

    setMiscTotal(miscobj);
    // setCategoryNameWise(cateWise);
    setResult(datas);
  }

  const handleHideShowS5 = (e) => {
    let val = e.target.value;
    if (val === "netwts5") {
      if (netwts5) {
        setnetwts5(false);
      } else {
        setnetwts5(true);
      }
    }
    if (val === "images5") {
      if (imagess5) {
        setimagess5(false);
      } else {
        setimagess5(true);
      }
    }
    if (val === "headers5") {
      if (headers5) {
        setheaders5(false);
      } else {
        setheaders5(true);
      }
    }
  };

  // console.log("result", result);

  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          {msg === "" ? (
            <>
              <div className="containers5 spacDisplayLooks">
                {/* hide show and print button */}
                <div className="d-flex justify-content-end align-items-center HSs5 fsgs5 mb-5 ">
                  <div className="mx-4"> <input type="checkbox" id="netwt" value="netwts5" checked={netwts5} onChange={(e) => handleHideShowS5(e)} />
                    <label htmlFor="netwt" className="mx-2 user-select-none"> With NetWt </label>
                  </div>
                  <div className="mx-4"> <input type="checkbox" id="images5" value="images5" checked={imagess5} onChange={(e) => handleHideShowS5(e)} /> <label htmlFor="images5" className="mx-2 user-select-none"> With Images </label>
                  </div>
                  <div className="mx-4"> <input type="checkbox" id="headers5" value="headers5" checked={headers5} onChange={(e) => handleHideShowS5(e)} />
                    <label htmlFor="headers5" className="mx-2 user-select-none"> With Header </label>
                  </div>
                  <div className="mx-4">
                    <button className="btn_white blue m-0 " onClick={(e) => handlePrint(e)} > Print </button>
                  </div>
                </div>
                {/* company detail | header */}
                {headers5 ? (
                  <div className="fsgs5 d-flex justify-content-between border-bottom p-1 fsgs5">
                    <div className="w-50 SmalLineHigt">
                      <div className="fw-bold fs-5"> {result?.header?.CompanyFullName} </div>
                      <div>{result?.header?.CompanyAddress}</div>
                      <div> {result?.header?.CompanyCity}- {result?.header?.CompanyPinCode}- {result?.header?.CompanyState}( {result?.header?.CompanyCountry})
                      </div>
                      <div> T-{result?.header?.CompanyTellNo} | Toll Free{" "} {result?.header?.CompanyTollFreeNo}
                      </div>
                      <div> {result?.header?.CompanyEmail} |{" "} {result?.header?.CompanyWebsite} </div>
                      <div> {result?.header?.Company_VAT_GST_No} |{" "} {result?.header?.Company_CST_STATE}- {result?.header?.Company_CST_STATE_No} | PAN- {result?.header?.Pannumber} </div>
                    </div>
                    <div className="w-50 d-flex align-items-center justify-content-end">
                      {/* <img
                        src={result?.header?.PrintLogo}
                        alt="#companylogo"
                        className="logos5"
                      /> */}
                      {isImageWorking && (result?.header?.PrintLogo !== "" &&
                        <img src={result?.header?.PrintLogo} alt="#companylogo"
                          className="logos5"
                          onError={handleImageErrors} />)}
                    </div>
                  </div>
                ) : (
                  ""
                )}
                {/* invoice number details */}
                <div className="mt-2 border  d-flex justify-content-between p-1 fsgs5">
                  <div className="fsgs5"> {" "}{headers5 ? "TAX INVOICE# " : "ESTIMATE#"} :{" "} <b className="fsgs5">{result?.header?.InvoiceNo}</b>
                  </div>
                  <div className=" fsgs5">
                    <div> {" "} DATE :{" "} <b className="fsgs5">{result?.header?.EntryDate}</b>{" "}
                    </div>
                    {result?.header?.HSN_No !== "" ? <div className="fsgs5"> {" "} {result?.header?.HSN_No_Label}&nbsp;&nbsp; :{" "} <b className="fsgs5">{result?.header?.HSN_No}</b> </div> : ""}
                  </div>
                </div>
                {/* sub header */}
                <div className="p-1 d-flex border fsgs5">
                  <div className="me-2 fw-bold">TO,</div>
                  <div>
                    <div className="fw-bold"> {result?.header?.customerfirmname} </div>
                    <div>{result?.header?.customerstreet}</div>
                    <div>{result?.header?.customerregion}</div>
                    <div> {result?.header?.customercity} {result?.header?.customerpincode} </div>
                    <div>Phno. {result?.header?.customermobileno}</div>
                    {/* <div> {result?.header?.vat_cst_pan} {" "} {"|"+result?.header?.Cust_CST_STATE+"-"} {result?.header?.Cust_CST_STATE_No} </div> */}
                    <div> {result?.header?.vat_cst_pan} {" "} {result?.header?.Cust_CST_STATE && (<> {" | "}{result?.header?.Cust_CST_STATE + "- "}</>)}  {result?.header?.Cust_CST_STATE_No && (<> {result?.header?.Cust_CST_STATE_No}</>)} </div>

                  </div>
                </div>
                {/* table */}
                <div>
                  {/* table head */}
                  <div className="d-flex fw-bold w-100 border border-top-0 fsgs5">
                    <div className="colh1s5 border-end centers5">SR#</div>
                    <div className="colh2s5 border-end centers5">SKU</div>
                    <div className="colh3s5 border-end centers5">PURITY</div>
                    <div className="colh4s5 border-end centers5">G WT</div>
                    {netwts5 ? (
                      <div className="colh5s5 border-end centers5">NWT</div>
                    ) : (
                      ""
                    )}
                    <div className="colh6s5 border-end">
                      <div className="w-100 centers5 border-bottom">MISC</div>
                      <div className="d-flex w-100">
                        <div className="subcolhs5 centers5 border-end" style={{ width: "27.33%" }}>PCS</div>
                        <div className="subcolhs5 centers5 border-end">
                          RATE
                        </div>
                        <div className="subcolhs5 centers5" style={{ width: "39.33%" }}>AMNT</div>
                      </div>
                    </div>
                    <div className="colh7s5 border-end">
                      <div className="w-100 centers5 border-bottom">
                        COLORSTONE
                      </div>
                      <div className="d-flex w-100">
                        <div className="w-25 centers5 border-end">WT</div>
                        <div className=" centers5 border-end" style={{ width: "20%" }}>PCS</div>
                        <div className="w-25 centers5 border-end">RATE</div>
                        <div className="centers5" style={{ width: "30%" }}>AMNT</div>
                      </div>
                    </div>
                    <div className="colh8s5 border-end">
                      <div className="w-100 border-bottom centers5">MAKING</div>
                      <div className="d-flex w-100 ">
                        <div className="w-50 centers5 border-end">RATE</div>
                        <div className="w-50 centers5">AMNT</div>
                      </div>
                    </div>
                    <div className="colh9s5 border-end centers5">WASTAGE</div>
                    <div className="colh10s5 border-end">
                      <div className="centers5">OTHER</div>
                      <div className="centers5">AMOUNT</div>
                    </div>
                    <div className="colh11s5 centers5">AMOUNT</div>
                  </div>
                  {/* table body */}
                  <div>
                    {result?.resultArray?.map((e, i) => {

                      const mergedMisc = e?.misc?.reduce(
                        (acc, item) => {
                          acc.Pcs += item.Pcs || 0;
                          acc.Wt += item.Wt || 0;
                          acc.Amount += item.Amount || 0;
                          return acc;
                        },
                        { Pcs: 0, Wt: 0, Amount: 0 }
                      );
                      return (
                        <div
                          className="d-flex border-start border-end border-bottom fsgs5 pbiag"
                          key={i}
                        >
                          {/* tabel result data */}
                          <div className="col1s5 border-end Topcenters5 pb10s5">
                            {i + 1}
                          </div>
                          <div className="col2s5 border-end pb10s5 fw-bold MadSpacLft">
                            <div>{e?.designno}</div>
                            <div>{e?.SrJobno}</div>
                            <div className="d-flex justify-content-center">
                              {imagess5 ? (
                                <img
                                  src={e?.DesignImage}
                                  alt=""
                                  className="imgs5 mt-2"
                                  onError={(e) => handleImageError(e)}
                                />
                              ) : (
                                ""
                              )}
                            </div>
                            <div>Tunch : {(e?.Tunch - e?.Wastage)?.toFixed(3)}</div>
                          </div>

                          <div className="col3s5 border-end pb10s5 MadSpacLft" style={{ wordBreak: "break-word" }} >
                            {(e?.MetalType?.toLowerCase()) === 'gold' ? e?.MetalPurity : e?.MetalTypePurity} {e?.MetalColor}
                          </div>
                          <div className="col4s5 border-end ends5 pb10s5 MadSpacRigt">
                            {e?.grosswt?.toFixed(3)}
                          </div>
                          {netwts5 ? (
                            <div className="col5s5 border-end ends5 pb10s5 MadSpacRigt">
                              {e?.NetWt?.toFixed(3)}
                            </div>
                          ) : (
                            ""
                          )}
                          
                          <div className="col6s5 border-end ends5 pb10s5 MadSpacRigt">
                            <div>
                                    <div className="ends5" >{mergedMisc?.Pcs}</div>
                               
                            </div>
                          </div>
                          <div className="col7s5 border-end ends5 pb10s5 MadSpacRigt">
                            <div>
                                <div className="ends5" >{mergedMisc?.Amount}</div>
                              
                            </div>
                          </div>
                          <div className="col8s5 border-end ends5 pb10s5 MadSpacRigt">
                            <div>
                                <div className="ends5" >{mergedMisc?.Amount}</div>
                              
                            </div>
                          </div>
                          <div className="col9s5 border-end ends5 pb10s5 MadSpacRigt">
                            <div>
                              {e?.colorstone?.map((e, i) => {
                                return <div className="ends5" key={i}>{e?.Wt?.toFixed(3)}</div>;
                              })}
                            </div>
                          </div>
                          <div className="col10s5 border-end ends5 pb10s5 MadSpacRigt">
                            <div>
                              {e?.colorstone?.map((e, i) => {
                                return <div className="ends5" key={i}>{e?.cspcs}</div>;
                              })}
                            </div>
                          </div>
                          <div className="col11s5 border-end ends5 pb10s5 MadSpacRigt">
                            <div>
                              {e?.colorstone?.map((e, i) => {
                                return <div className="ends5" key={i}>{e?.Rate}</div>;
                              })}
                            </div>
                          </div>
                          <div className="col12s5 border-end ends5 pb10s5 MadSpacRigt">
                            <div>
                              {e?.colorstone?.map((e, i) => {
                                return <div className="ends5" key={i}>{e?.Amount}</div>;
                              })}
                            </div>
                          </div>
                          <div className="col13s5 border-end ends5 pb10s5 MadSpacRigt">
                            {formatAmount(e?.MaKingCharge_Unit)}
                          </div>
                          <div className="col14s5 border-end ends5 pb10s5 MadSpacRigt">
                            {formatAmount((e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount))}
                            {/* {formatAmount((((e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount)/(result?.header?.CurrencyExchRate))))} */}
                          </div>
                          <div className="col15s5 border-end ends5 pb10s5 MadSpacRigt">
                            {(e?.Wastage?.toFixed(3))}
                          </div>
                          <div className="col16s5 border-end ends5 pb10s5 MadSpacRigt">
                            {/* {formatAmount((e?.OtherCharges + e?.TotalDiamondHandling))} */}
                            {formatAmount(((e?.OtherCharges + e?.TotalDiamondHandling) / (result?.header?.CurrencyExchRate)))}
                          </div>
                          <div className="col17s5 ends5 pb10s5 MadSpacRigt">
                            {formatAmount((e?.TotalAmount))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* table total */}
                  <div className="d-flex border-start border-end border-bottom fw-bold bgs5 fsgs5 pbiag">
                    <div className="col1s5 border-end"></div>
                    <div className="col2s5 border-end">TOTAL</div>
                    <div className="col3s5 border-end"></div>
                    <div className="col4s5 border-end ends5">
                      {result?.mainTotal?.grosswt?.toFixed(3)}
                    </div>
                    {netwts5 ? (
                      <div className="col5s5 border-end ends5">
                        {result?.mainTotal?.netwt?.toFixed(3)}
                      </div>
                    ) : (
                      ""
                    )}
                    <div className="col6s5 border-end ends5">
                      {miscTotal?.pcPcs}
                    </div>
                    <div className="col7s5 border-end ends5"></div>
                    <div className="col8s5 border-end ends5">
                      {/* {result?.mainTotal?.misc?.Amount} */}
                      {formatAmount(miscTotal?.amtAmount)}
                    </div>
                    <div className="col9s5 border-end ends5">
                      {result?.mainTotal?.colorstone?.Wt?.toFixed(3)}
                    </div>
                    <div className="col10s5 border-end ends5">
                      {result?.mainTotal?.colorstone?.Pcs}
                    </div>
                    <div className="col11s5 border-end ends5"></div>
                    <div className="col12s5 border-end ends5">
                      {formatAmount(result?.mainTotal?.colorstone?.Amount)}
                    </div>
                    <div className="col13s5 border-end ends5"></div>
                    <div className="col14s5 border-end ends5">
                      {formatAmount((result?.mainTotal?.total_Making_Amount + result?.mainTotal?.total_TotalCsSetcost + result?.mainTotal?.total_TotalDiaSetcost))}
                    </div>
                    <div className="col15s5 border-end ends5"></div>
                    <div className="col16s5 border-end ends5">
                      {formatAmount((result?.mainTotal?.total_other + result?.mainTotal?.total_diamondHandling))}
                    </div>
                    <div className="col17s5 ends5">
                      {formatAmount(result?.mainTotal?.total_amount)}
                    </div>
                  </div>
                  {/* tax department */}
                  <div className="w-100 d-flex justify-content-end fsgs5 pbiag">
                    <div className="w-25 border border-top-0 pb10s5">
                      {result?.allTaxes?.map((e, i) => {
                        return (
                          <div
                            className="d-flex justify-content-between px-1"
                            key={i}
                          >
                            <div>
                              {e?.name} @ {e?.per}
                            </div>
                            <div>{(+e?.amount) * result?.header?.CurrencyExchRate}</div>
                          </div>
                        );
                      })}
                      <div className="d-flex justify-content-between px-1 fw-bold">
                        <div>
                          {result?.header?.AddLess > 0 ? "Add" : result?.header?.AddLess < 0 ? 'Less' : ""}
                        </div>
                        <div>{result?.header?.AddLess !== 0 && result?.header?.AddLess}</div>
                      </div>
                    </div>
                  </div>
                  {/* grand total */}
                  <div className="mt-2 border bgs5 d-flex justify-content-between align-items-center p-1 fw-bold fsgs5 pbiag">
                    <div className="WdthDvisor d-flex justify-content-between" style={{ width: "33%" }}>
                      <div>Gold in 24K : {result?.mainTotal?.convertednetwt?.toFixed(3)}</div>
                      <div className="d-flex">


                        {showDiaQuality?.map((e, i) => (
                          <div key={i}>
                            {e}{i < showDiaQuality.length - 1 && ", "}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="WdthDvisor1 d-flex justify-content-end">
                      <div>TOTAL IN HK$ </div>
                      &nbsp;{" "}:{" "} &nbsp;<div className="px-1">{formatAmount((result?.mainTotal?.total_amount + (result?.allTaxesTotal * result?.header?.CurrencyExchRate) + result?.header?.AddLess))} </div></div>
                  </div>
                  {/* amount in words */}
                  <div className="mt-2 border bgs5 d-flex justify-content-between align-items-center p-1 fw-bold fsgs5 pbiag">
                    <div>{NumToWord((result?.mainTotal?.total_amount + result?.header?.AddLess + (result?.allTaxesTotal * result?.header?.CurrencyExchRate)))}</div>
                    <div>TOTAL :  HKD  {formatAmount((result?.mainTotal?.total_amount + result?.header?.AddLess + result?.header?.TotalGSTAmount))}</div>
                  </div>
                </div>
                {/* description */}
                <div className="fw-bold border mt-2 p-1 fsgs5 pbiag">
                  <div>NOTE:</div>
                  <div dangerouslySetInnerHTML={{ __html: result?.header?.Declaration, }} ></div>
                </div>
                {/* remarks */}
                <div className="my-2 fsgs5 pbiag ">
                  <b>REMARKS:</b> <span dangerouslySetInnerHTML={{ __html: result?.header?.PrintRemark }}></span>
                </div>
                <div className="py-1 pbias2 fsh2_s2"><span className="fw-bold">TERMS INCLUDED</span> :
                  <span dangerouslySetInnerHTML={{ __html: result?.header?.SalesRepPolicyTermsDescription }}></span>
                  {/* {result?.header?.SalesRepPolicyTermsDescription} */}
                </div>
                {/* bank details | footer */}
                <div className="d-flex border fsgs5 pbiag">
                  <div className="border-end  p-1 wp1s5">
                    <div className="fw-bold">Bank Detail</div>
                    <div>Bank Name : {result?.header?.bankname}</div>
                    <div>Branch : {result?.header?.bankaddress}</div>
                    <div>Account Name : {result?.header?.accountname}</div>
                    <div>Account No. : {result?.header?.accountnumber}</div>
                    <div>RTGS/NEFT IFSC : {result?.header?.rtgs_neft_ifsc}</div>
                  </div>
                  <div className="d-flex flex-column justify-content-between border-end  p-1 wp2s5">
                    <div>Signature</div>
                    <div className="fw-bold">
                      {result?.header?.customerfirmname}
                    </div>
                  </div>
                  <div className="d-flex flex-column justify-content-between  p-1 wp3s5">
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

export default Summary5;
