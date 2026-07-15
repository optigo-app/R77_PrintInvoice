import React, { useEffect, useState } from "react";
import {
  apiCall,
  checkMsg,
  fixedValues,
  handleImageError,
  isObjectEmpty,
  numberToWord,
  NumberWithCommas,
} from "../../GlobalFunctions";
import "../../assets/css/prints/invoiceprint2.css";
import Button from "../../GlobalFunctions/Button";
import Loader from "../../components/Loader";
import { taxGenrator } from "./../../GlobalFunctions";

const InvoicePrint2 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  const [headerData, setHeaderData] = useState();
  // eslint-disable-next-line no-unused-vars
  const [json1, setJson1] = useState();
  // eslint-disable-next-line no-unused-vars
  const [json2, setJson2] = useState();
  const [resultArray, setResultArray] = useState();
  const [grandTotal, setGrandTotal] = useState(0);
  const [inWords, setInWords] = useState("");
  const [summaryDetail, setSummaryDetail] = useState({});
  const [mainTotal, setMainTotal] = useState({});
  const [taxTotal, setTaxTotal] = useState([]);
  const [loader, setLoader] = useState(true);
  const [msg, setMsg] = useState("");
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  async function loadData(data) {
    try {
      setHeaderData(data?.BillPrint_Json[0]);
      setJson1(data?.BillPrint_Json1);
      setJson2(data?.BillPrint_Json2);
      organizeData(
        data?.BillPrint_Json[0],
        data?.BillPrint_Json1,
        data?.BillPrint_Json2
      );
      countCategorySubCategory(data?.BillPrint_Json1);
      setLoader(false);
    } catch (error) {
      console.log(error);
    }
  }

  const organizeData = (json, json1, json2) => {

    let resultArr = [];
    let totAmt = 0;

    let mainTotal = {
      diamonds: {
        Wt: 0,
        Pcs: 0,
        Rate: 0,
        Amount: 0,
      },
      colorstone: {
        Wt: 0,
        Pcs: 0,
        Rate: 0,
        Amount: 0,
      },
      metal: {
        Wt: 0,
        Pcs: 0,
        Rate: 0,
        Amount: 0,
      },
      misc: {
        Wt: 0,
        Pcs: 0,
        Rate: 0,
        Amount: 0,
      },
      finding: {
        Wt: 0,
        Pcs: 0,
        Rate: 0,
        Amount: 0,
      },
      totalnetwt: {
        netwt: 0,
      },
      totalgrosswt: {
        grosswt: 0,
      },
      totAmount: {
        TotalAmount: 0,
      },
      totlbrAmt: {
        Amount: 0,
      },
      totOthAmt: {
        Amount: 0,
      },
    };
    // eslint-disable-next-line array-callback-return
    json1?.map((e) => {
      let diamondlist = [];
      let colorstonelist = [];
      let metallist = [];
      let misclist = [];
      let findinglist = [];
      let totals = {
        diamonds: {
          Wt: 0,
          Pcs: 0,
          Rate: 0,
          Amount: 0,
        },

        colorstone: {
          Wt: 0,
          Pcs: 0,
          Rate: 0,
          Amount: 0,
        },

        metal: {
          Wt: 0,
          Pcs: 0,
          Rate: 0,
          Amount: 0,
        },

        misc: {
          Wt: 0,
          Pcs: 0,
          Rate: 0,
          Amount: 0,
        },

        finding: {
          Wt: 0,
          Pcs: 0,
          Rate: 0,
          Amount: 0,
        },

        labour: {
          labourAmount: 0,
        },

        OtherCh: {
          OtherAmount: 0,
        },
      };
      let otherMisc = e?.MiscAmount + e?.OtherCharges + e?.TotalDiamondHandling;
      // eslint-disable-next-line array-callback-return

      mainTotal.totAmount.TotalAmount += e?.TotalAmount;
      mainTotal.totOthAmt.Amount += e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling;
      mainTotal.totalgrosswt.grosswt += e?.grosswt;

      totAmt += e?.TotalAmount;

      let netWtLossWt = 0;
      let count = 0

      // eslint-disable-next-line array-callback-return
      json2?.map((ele) => {
        if (ele?.StockBarcode === e?.SrJobno) {
          if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
            diamondlist.push(ele);
            totals.diamonds.Pcs += ele?.Pcs;
            totals.diamonds.Wt += ele?.Wt;
            totals.diamonds.Amount += ele?.Amount;
            totals.diamonds.Rate += ele?.Rate;
            mainTotal.diamonds.Pcs += ele?.Pcs;
            mainTotal.diamonds.Wt += ele?.Wt;
            mainTotal.diamonds.Rate += ele?.Rate;
            mainTotal.diamonds.Amount += ele?.Amount;
          }

          if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
            colorstonelist.push(ele);
            totals.colorstone.Pcs += ele?.Pcs;
            totals.colorstone.Wt += ele?.Wt;
            totals.colorstone.Amount += ele?.Amount;
            totals.colorstone.Rate += ele?.Rate;
            mainTotal.colorstone.Pcs += ele?.Pcs;
            mainTotal.colorstone.Wt += ele?.Wt;
            mainTotal.colorstone.Rate += ele?.Rate;
            mainTotal.colorstone.Amount += ele?.Amount;
          }
          if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
            misclist.push(ele);
            // totals.colorstone.Pcs += ele?.Pcs;
            // totals.colorstone.Wt += ele?.Wt;
            // totals.colorstone.Amount += ele?.Amount;
            // totals.colorstone.Rate += ele?.Rate;
            mainTotal.misc.Pcs += ele?.Pcs;
            mainTotal.misc.Wt += ele?.Wt;
            mainTotal.misc.Rate += ele?.Rate;
            mainTotal.misc.Amount += ele?.Amount;
          }
          if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
            metallist.push(ele);
            totals.metal.Pcs += ele?.Pcs;
            totals.metal.Wt += ele?.Wt;
            totals.metal.Amount += ele?.Amount;
            totals.metal.Rate += ele?.Rate;
            mainTotal.metal.Pcs += ele?.Pcs;
            mainTotal.metal.Wt += ele?.Wt;
            mainTotal.metal.Rate += ele?.Rate;
            mainTotal.metal.Amount += ele?.Amount;
            if (ele?.IsPrimaryMetal === 1) {
              netWtLossWt += ele?.Wt;
            } else {
              count++
            }
          }
          if (ele?.MasterManagement_DiamondStoneTypeid === 5) {
            findinglist.push(ele);
            totals.finding.Pcs += ele?.Pcs;
            totals.finding.Wt += ele?.Wt;
            totals.finding.Amount += ele?.Amount;
            totals.finding.Rate += ele?.Rate;
            mainTotal.finding.Pcs += ele?.Pcs;
            mainTotal.finding.Wt += ele?.Wt;
            mainTotal.finding.Rate += ele?.Rate;
            mainTotal.finding.Amount += ele?.Amount;
          }
        }
      });

      if (count === 0) {
        netWtLossWt = e?.NetWt + e?.LossWt;
      }
      mainTotal.totalnetwt.netwt += netWtLossWt;
      let obj = { ...e };
      obj.diamondsDetails = diamondlist;
      obj.colorstoneDetails = colorstonelist;
      obj.metalDetails = metallist;
      obj.miscDetails = misclist;
      obj.findingDetails = findinglist;
      obj.AllJobsTotal = mainTotal;
      obj.netWtLossWt = netWtLossWt
      obj.JobWiseTotal = totals;
      obj.otherMisc = otherMisc;
      resultArr.push(obj);
    });
    resultArr?.sort((a, b)=>{
      var regex = /(\d+)|(\D+)/g;
      var partsA = a.designno.match(regex);
      var partsB = b.designno.match(regex);
  
      for (var i = 0; i < Math.min(partsA.length, partsB.length); i++) {
          var partA = partsA[i];
          var partB = partsB[i];
  
          if (!isNaN(partA) && !isNaN(partB)) {
              var numA = parseInt(partA);
              var numB = parseInt(partB);
              if (numA !== numB) {
                  return numA - numB;
              }
          } else {
              if (partA !== partB) {
                  return partA.localeCompare(partB);
              }
          }
      }
      return a.designno.length - b.designno.length;
  });
    setResultArray(resultArr);

    setMainTotal(mainTotal);
    let grandTot = totAmt + json?.AddLess;

    let AllTax = taxGenrator(json, grandTot);

    setTaxTotal(AllTax);

    AllTax?.forEach((e) => {
      grandTot += +e?.amount;
    });

    let words = numberToWord(fixedValues(grandTot, 2)) + " Only";

    setInWords(words);
    setGrandTotal(grandTot);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countCategorySubCategory = (data) => {
    const groupedData = data.reduce((result, item) => {
      const { Categoryname, ...rest } = item; // Destructure the object
      if (!result[Categoryname]) {
        result[Categoryname] = []; // Initialize an array for the category if it doesn't exist
      }
      result[Categoryname].push(rest); // Push the item to the corresponding category array
      return result;
    }, {});

    const lengthsArray = [];

    for (const key in groupedData) {
      if (Array.isArray(groupedData[key])) {
        lengthsArray.push({ [key]: groupedData[key].length });
      }
    }
    const formattedArray = lengthsArray.map((item) => {
      const [name, val] = Object.entries(item)[0];
      return { name, val };
    });

    formattedArray?.sort((a, b) => {
      let nameA = a?.name?.toUpperCase();
      let nameB = b?.name?.toUpperCase();

      if (nameA < nameB) {
        return -1; // a should come before b
      } else if (nameA > nameB) {
        return 1; // a should come after b
      } else {
        return 0; // labels are equal
      }
    })

    let arr1 = formattedArray.slice(0, 3);
    let arr2 = formattedArray.slice(3, 6);
    let arr3 = formattedArray.slice(6, 9);
    let arr4 = formattedArray.slice(9, 12);
    let obj = {
      firstArr: arr1,
      secondArr: arr2,
      thirdArr: arr3,
      fourthArr: arr4,
    };
    setSummaryDetail(obj);
  };

  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          {msg === "" ? (
            <>
              <div className="summary1Printinvp2 pad_60_allPrint px-2 print_sec_sum4">
                <Button />
              </div>
              <div className="summary1Printinvp2 pad_60_allPrint px-2">
                <div className="mainheaderivp2">
                  <div className="head3ivp2">
                    <div className="d-flex" style={{ width: "70%" }}>
                      <div className="fw-bold px-2" style={{fontSize: "18px"}}>INVOICE #: {headerData?.InvoiceNo}</div>
                      <div className="text-break px-1" style={{fontSize: "18px"}} dangerouslySetInnerHTML={{ __html: headerData?.PrintRemark }}></div>
                    </div>
                    <div className="p-1" style={{ width: "30%" }}>
                      <div className="d-flex justify-content-end align-items-end binvivp2">
                        <b className="binvivp2 w-50">DATE :</b>
                        <span className="w-50">{headerData?.EntryDate}</span>
                      </div>
                      <div className="d-flex justify-content-end align-items-center binvivp2">
                        <b className="binvivp2 w-50">HSN :</b>
                        <span className="w-50">{headerData?.HSN_No}</span>
                      </div>
                    </div>
                  </div>
                  <div className="head4ivp2">
                    <div className="samplehead4ivp2">
                      {headerData?.customerfirmname}
                    </div>
                    <div className="lhhead4ivp2">
                      {headerData?.customerstreet}
                    </div>
                    <div className="lhhead4ivp2">
                      Area {headerData?.customerAddress2}
                    </div>
                    <div className="lhhead4ivp2">
                      {headerData?.customercity}
                    </div>
                    <div className="lhhead4ivp2">
                      {headerData?.customermobileno}
                    </div>
                    <div className="lhhead4ivp2">
                      {headerData?.CustGstNo !== "" && `GSTIN-${headerData?.CustGstNo}`}
                      {(headerData?.CustGstNo === "" && headerData?.Cust_VAT_GST_No !== "") && `VAT-${headerData?.Cust_VAT_GST_No}`}
                      {headerData?.Cust_CST_STATE !== "" && headerData?.Cust_CST_STATE_No !== "" && ` | ${headerData?.Cust_CST_STATE}- ${headerData?.Cust_CST_STATE_No}`}
                      {headerData?.CustPanno !== "" && ` | PAN-${headerData?.CustPanno}`} 

                    </div>
                  </div>
                </div>
                <div className="tableSectionivp2" style={{borderTop: "none", borderBottom: "none"}}>
                  <div className="theadivp2" style={{borderTop: "none", borderBottom: "1px solid #e8e8e8"}}>
                    <div className="wthivp2 srwivp2">SR#</div>
                    <div className="wthivp2 designwivp2">DESIGNS / CODE</div>
                    <div className="wthivp2">METAL</div>
                    <div className="wthivp2">GWT</div>
                    <div className="wthivp2">NWT</div>
                    <div className="wthivp2">DPCS</div>
                    <div className="wthivp2">DWT</div>
                    <div className="wthivp2">CSPCS</div>
                    <div className="wthivp2">CSWT.</div>
                    <div className="wthivp2">OTHER</div>
                    <div className="wthivp2 brightivp2">TOTAL</div>
                  </div>
                  {resultArray?.map((e, i) => {
                    return (
                      <div className="tbodyivp2" key={i}style={{borderTop: "none"}}>
                        <div className="wtbivp2 srwivp2">{e?.SrNo}</div>
                        <div className="wtbivp2 designwivp2 d-flex justify-content-around p-1">
                          <div className="w-50">
                            <img
                              src={e?.DesignImage}
                              alt="#invp2"
                              id="imgDyInvp2"
                              onError={(e) => handleImageError(e)}
                            />
                          </div>
                          <div className="designContentinvp2 w-50">
                            <p
                              className="brbdesigninvp2"
                              style={{
                                fontWeight: "bold",
                                textAlign: "center",
                                fontSize: "12px",
                              }}
                            >
                              {e?.designno}
                            </p>
                            <p className="brbdesigninvp2 brbinvp2 text-center">
                              {e?.SrJobno}
                            </p>
                          </div>
                        </div>
                        <div className="wtbivp2 alignleftinvp2">
                          {e?.MetalTypePurity}
                        </div>
                        <div className="wtbivp2 alignrightinvp2">
                          {e?.grosswt?.toFixed(3)}
                        </div>
                        <div className="wtbivp2 alignrightinvp2">
                          {NumberWithCommas(e?.netWtLossWt, 3)}
                        </div>
                        <div className="wtbivp2 alignrightinvp2">
                          {e?.JobWiseTotal?.diamonds?.Pcs}
                        </div>
                        <div className="wtbivp2 alignrightinvp2">
                          {e?.JobWiseTotal?.diamonds?.Wt?.toFixed(3)}
                        </div>
                        <div className="wtbivp2 alignrightinvp2">
                          {e?.JobWiseTotal?.colorstone?.Pcs}
                        </div>
                        <div className="wtbivp2 alignrightinvp2">
                          {e?.JobWiseTotal?.colorstone?.Wt?.toFixed(3)}
                        </div>
                        <div className="wtbivp2 alignrightinvp2">
                          {NumberWithCommas(e?.otherMisc, 2)}
                        </div>
                        <div className="wtbivp2 brightivp2 alignrightinvp2">
                          <p dangerouslySetInnerHTML={{ __html: headerData?.Currencysymbol }}></p> {NumberWithCommas(e?.TotalAmount, 2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="secondheadinvp2">

                  <div>
                    <div className="tbodyinvp2second" style={{borderTop: "0"}}>
                      <div className="wtbinvp2 wtotalinvp2 htotalrowinvp2">
                        <b className="totrowfsinvp2">TOTAL</b>
                      </div>
                      <div className="wtbinvp2 htotalrowinvp2 alignrightinvp2">
                        <b className="totrowfsinvp2">
                          {mainTotal?.totalgrosswt?.grosswt?.toFixed(3)}
                        </b>
                      </div>
                      <div className="wtbinvp2 htotalrowinvp2 alignrightinvp2">
                        <b className="totrowfsinvp2">
                          {mainTotal?.totalnetwt?.netwt?.toFixed(3)}
                        </b>
                      </div>
                      <div className="wtbinvp2 htotalrowinvp2 alignrightinvp2">
                        <b className="totrowfsinvp2">
                          {mainTotal?.diamonds?.Pcs}
                        </b>
                      </div>
                      <div className="wtbinvp2 htotalrowinvp2 alignrightinvp2">
                        <b className="totrowfsinvp2">
                          {mainTotal?.diamonds?.Wt?.toFixed(3)}
                        </b>
                      </div>
                      <div className="wtbinvp2 htotalrowinvp2 alignrightinvp2">
                        <b className="totrowfsinvp2">
                          {mainTotal?.colorstone?.Pcs}
                        </b>
                      </div>
                      <div className="wtbinvp2 htotalrowinvp2 alignrightinvp2">
                        <b className="totrowfsinvp2">
                          {mainTotal?.colorstone?.Wt?.toFixed(3)}
                        </b>
                      </div>
                      <div className="wtbinvp2 htotalrowinvp2 alignrightinvp2">
                        <b className="totrowfsinvp2">
                          {NumberWithCommas(mainTotal?.totOthAmt?.Amount, 2)}
                        </b>
                      </div>
                      <div className="wtbinvp2 brightinvp2 htotalrowinvp2 alignrightinvp2" style={{borderRight: "unset"}}>
                        <b className="totrowfsinvp2 d-flex">
                          <p
                            dangerouslySetInnerHTML={{
                              __html: headerData?.Currencysymbol,
                            }}
                          ></p>{" "}
                          {NumberWithCommas(mainTotal?.totAmount?.TotalAmount, 2)}
                        </b>
                      </div>
                    </div>
                    <div className="totaldesigninvp2">

                      {taxTotal?.length > 0 &&
                        taxTotal?.map((e, i) => {
                          return (
                            <div
                              className="d-flex justify-content-between wtotinvp2"
                              key={i}
                            >
                              <div className="w-50 d-flex px-1">
                                {e?.name} {e?.per}
                              </div>
                              <div className="ps-1 w-50 d-flex justify-content-end">
                                {NumberWithCommas(e?.amount, 2)}
                              </div>
                            </div>
                          );
                        })}
                      <div
                        className="d-flex justify-content-between wtotinvp2" >
                        <div className="w-50 d-flex px-1">
                          <p className="totgstinvp2 gsttotsum1 fw-bold"> {headerData?.AddLess > 0 ? "ADD" : "Less"} </p>
                        </div>
                        <div className="ps-1 w-50 d-flex justify-content-end"> <p className="totgstinvp2 fw-bold"> {headerData?.AddLess?.toFixed(2)} </p>
                        </div>
                      </div>
                    </div>
                    <div className="grandtotalinvp2">
                      <div className="amtwordsinvp2 px-2">{inWords}</div>
                      <div className="amtwordsinvp2 wtotinvp2 d-flex align-items-center justify-content-end  wgtinvp2">
                        <div className="px-1 w-50 d-flex"> Grand Total :</div>{" "}
                        <div className="px-1 d-flex w-50 justify-content-end ">
                          <p dangerouslySetInnerHTML={{ __html: headerData?.Currencysymbol, }} ></p>
                          {NumberWithCommas(grandTotal, 2)} /-
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="summaryinvp2">
                    <div className="summaryinvp2fs lightGrey px-2">Summary Detail</div>
                    <div className="summaryDetailinvp2 pt-1">
                      <div className="wsummaryinvp2 px-2">
                        {summaryDetail?.firstArr?.map((e, i) => {
                          return (
                            <div key={i} className="d-flex arrinvp2 align-items-start">
                              <div
                                className="summwinvp2 fs13invp2"
                                style={{ width: "60%" }}
                              >
                                {e?.name}
                              </div>
                              <div
                                className="summwinvp2 fs13invp2"
                                style={{ width: "20%" }}
                              >
                                {" "}
                                :{" "}
                              </div>
                              <div
                                className="summwinvp2 fs13invp2 fw-bold"
                                style={{ width: "20%" }}
                              >
                                {e?.val}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="wsummaryinvp2">
                        {summaryDetail?.secondArr?.map((e, i) => {
                          return (
                            <div className="d-flex arrinvp2 align-items-start" key={i}>
                              <div
                                className="summwinvp2 fs13invp2"
                                style={{ width: "60%" }}
                              >
                                {e?.name}
                              </div>
                              <div
                                className="summwinvp2 fs13invp2"
                                style={{ width: "20%" }}
                              >
                                {" "}
                                :{" "}
                              </div>
                              <div
                                className="summwinvp2 fs13invp2 fw-bold"
                                style={{ width: "20%" }}
                              >
                                {e?.val}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="wsummaryinvp2">
                        {summaryDetail?.thirdArr?.map((e, i) => {
                          return (
                            <div className="d-flex arrinvp2 align-items-start" key={i}>
                              <div
                                className="summwinvp2 fs13invp2"
                                style={{ width: "60%" }}
                              >
                                {e?.name}
                              </div>
                              <div
                                className="summwinvp2 fs13invp2"
                                style={{ width: "20%" }}
                              >
                                :
                              </div>
                              <div
                                className="summwinvp2 fs13invp2 fw-bold"
                                style={{ width: "20%" }}
                              >
                                {e?.val}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="wsummaryinvp2">
                        {summaryDetail?.fourthArr?.map((e, i) => {
                          return (
                            <>
                              <div className="d-flex arrinvp2 align-items-start" key={i}>
                                <div
                                  className="summwinvp2 fs13invp2"
                                  style={{ width: "60%" }}
                                >
                                  {e?.name}
                                </div>
                                <div
                                  className="summwinvp2 fs13invp2"
                                  style={{ width: "20%" }}
                                >
                                  {" "}
                                  :{" "}
                                </div>
                                <div
                                  className="summwinvp2 fs13invp2 fw-bold"
                                  style={{ width: "20%" }}
                                >
                                  {e?.val}
                                </div>
                              </div>
                            </>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="notesinvp2">
                    <div className="noteinvp2" style={{fontWeight:"bold"}}>DECLARATION :</div>
                    <div
                      className="noteDemoinvp2 pb-4"
                      dangerouslySetInnerHTML={{
                        __html: headerData?.Declaration,
                      }}
                    ></div>
                  </div>

                  <div className="footerinvp2">
                    <div className="footer1invp2">
                      <p className="footerSignValinvp2">
                        RECEIVER's NAME & SIGNATURE
                      </p>
                    </div>
                    <div className="footer1invp2">
                      <p className="footer2SignValinvp2 ">
                        for, {headerData?.CompanyFullName}
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

export default InvoicePrint2;
