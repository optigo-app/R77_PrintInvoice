import React from "react";
import { useEffect } from "react";
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
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import Loader from "../../components/Loader";

function MaterialReturnPrint({ token, invoiceNo, printName, urls, evn, ApiVer }) {
  const [loader, setLoader] = useState(true);
  const [json0Data, setJson0Data] = useState({});
  const [msg, setMsg] = useState("");
  const [finalD, setFinalD] = useState({});
  const [custAddress, setCustAddress] = useState([]);
  const [taxAmont, setTaxAmount] = useState();
  const [extraTaxAmont, setExtraTaxAmount] = useState();
  const [headFlag, setHeadFlag] = useState(true);
  const [isImageWorking, setIsImageWorking] = useState(true);




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
            console.log("data", data);

            setJson0Data(data?.Data?.MaterialBill_Json[0]);
            const sortedItems = [...(data?.Data?.MaterialBill_Json1 || [])].sort(
              (a, b) => parseFloat(a?.ItemId || 0) - parseFloat(b?.ItemId || 0)
            );

            console.log("TCL: sendData -> sortedItems", sortedItems)
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

  console.log("TCL: finalD", finalD)


  const totalMiscWeight = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
    const weight = parseFloat(item?.Weight);
    if (item?.ItemName === 'MISC') {
      return sum + (isNaN(weight) ? 0 : weight);
    }
    return sum;
  }, 0);

  const totalMetalWeight = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
    const weight = parseFloat(item?.Weight);
    if (item?.ItemName === 'METAL') {
      return sum + (isNaN(weight) ? 0 : weight);
    }
    return sum;
  }, 0);

  const ShapeWiseTotalWeight = (Array.isArray(finalD) ? finalD : []).reduce(
    (acc, item) => {
      if (item?.ItemName !== "METAL") return acc;

      const shape = item?.shape || "UNKNOWN";
      const weight = parseFloat(item?.Weight) || 0;
      const pureWeight = parseFloat(item?.PureWeight) || 0;

      // Total weight
      acc.totalWeight += weight;
      acc.totalPureWeight += pureWeight;

      // Shape-wise aggregation
      if (!acc.shapeWise[shape]) {
        acc.shapeWise[shape] = {
          shape,
          totalWeight: 0,
          totalPureWeight: 0,
        };
      }

      acc.shapeWise[shape].totalWeight += weight;
      acc.shapeWise[shape].totalPureWeight += pureWeight;

      return acc;
    },
    {
      totalWeight: 0,
      totalPureWeight: 0,
      shapeWise: {},
    }
  );
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };

  const toProperCase = (str) =>
    str?.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());


  const metalAndMiscWeight = totalMetalWeight + totalMiscWeight;

  const remainingWeight = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
    const weight = parseFloat(item?.Weight);
    if (item?.ItemName !== 'DIAMOND' && item?.ItemName !== 'COLOR STONE') {
      return sum + (isNaN(weight) ? 0 : weight);
    }
    return sum;
  }, 0);

  console.log("TCL: remainingWeight", remainingWeight, metalAndMiscWeight, totalMetalWeight)
  const WeightDiaCS = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
    const weight = parseFloat(item?.Weight);
    if (item?.ItemName == 'DIAMOND' || item?.ItemName == 'COLOR STONE') {
      return sum + (isNaN(weight) ? 0 : weight);
    }
    return sum;
  }, 0);



  const totalPieces = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
    const pieces = parseFloat(item?.pieces);
    return sum + (isNaN(pieces) ? 0 : pieces);
  }, 0);

  const totalAmount = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
    const Amount = parseFloat(item?.Amount);
    return sum + (isNaN(Amount) ? 0 : Amount);
  }, 0);

  console.log("TCL: totalAmount", totalAmount)
  const totalEtraTaxAmount = (Array.isArray(extraTaxAmont) ? extraTaxAmont : []).reduce((sum, item) => {
    const amount = parseFloat(item?.totaltaxAmount);

    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);



  const GrandTotal =
    (totalAmount || 0) +
    (totalEtraTaxAmount || 0) +
    (taxAmont?.tax1Amount || 0) +
    (taxAmont?.CGSTTotalAmount || 0) +
    (taxAmont?.SGSTTotalAmount || 0) +
    (taxAmont?.tax2Amount || 0) +
    (taxAmont?.tax4Amount || 0) +
    (taxAmont?.tax5Amount || 0) +
    (taxAmont?.tax3Amount || 0);





  const groupedData = React.useMemo(() => {
    if (!Array.isArray(finalD)) return [];

    return Object.values(
      finalD.reduce((acc, item) => {
        const key = [
          item.ItemName,
          item.shape,
          item.quality,
          item.color,
          item.size,
          item.Rate
        ].join("|");

        if (!acc[key]) {
          acc[key] = { ...item };
        } else {
          acc[key].pieces =
            (Number(acc[key].pieces) || 0) + (Number(item.pieces) || 0);

          acc[key].Weight =
            (Number(acc[key].Weight) || 0) + (Number(item.Weight) || 0);

          acc[key].Amount =
            (Number(acc[key].Amount) || 0) + (Number(item.Amount) || 0);
        }

        return acc;
      }, {})
    );
  }, [finalD]);

  const getItemDisplay = (e) => {
    switch (e?.ItemName) {
      case "FINDING":
        return `${e?.FindingType}(${e?.FindingAccessories})`;

      case "MOUNT":
        return e?.MountCategory;

      default:
        return "";
    }
  };




  const totals = (Array.isArray(finalD) ? finalD : []).reduce((acc, item) => {
    acc.totalWeight += item.Weight || 0;
    acc.totalPureWeight += item.PureWeight || 0;
    acc.totalAmount += item.Amount || 0;
    return acc;
  }, { totalWeight: 0, totalPureWeight: 0, totalAmount: 0 });

  const customOrder = [3,4,5,1,2,7];

  const MergeData = Object.values(
    groupedData.reduce((acc, item) => {
      const id = item.ItemId;
  
      if (!acc[id]) {
        acc[id] = {
          ItemId: id,
          ItemName: item.ItemName,
          items: [],
          total: {
            totalpcs: 0,
            totalCtw: 0,
            totalAmount: 0,
            totalPureWt: 0
          }
        };
      }
  
      acc[id].items.push(item);
  
      acc[id].total.totalpcs += item.pieces || 0;
      acc[id].total.totalCtw += item.Weight || 0;
      acc[id].total.totalPureWt += item.PureWeight || 0;
      acc[id].total.totalAmount += item.Amount || 0;
  
      return acc;
    }, {})
  ).sort((a, b) => customOrder.indexOf(a.ItemId) - customOrder.indexOf(b.ItemId));
  
  console.log(MergeData);

 

 


  const containerStyle = {
    height: "auto",
    width: "820px",
    margin: "0 auto",
    padding: "15px",
    border: "1px solid #dcdcdc",
    fontFamily: "Calibri",
    fontSize: "13px",
    lineHeight: "14px"
  };
  const printtableTD = {
    fontSize: "13px",
    padding: "5px 8px",
    borderRight: "1px solid #C2C2C2",
    borderBottom: "1px solid #C2C2C2"
  }
  
   return (
      <>
            {loader ? (
              <Loader />
            ) : msg === "" ? (
              <div>
              <div style={{ display: "flex", justifyContent: "center", margin: "20px 0px" }}>
                <div className="prnt_btn">
                  <input
                    type="button"
                    className="btn_white blue mt-0"
                    value="Print"
                    onClick={(e) => handlePrint(e)}
                  />
                </div>
              </div>
              <div id="OrderQ" style={containerStyle}>
                <div
                  style={{
        
                    fontFamily: "Calibri",
                    WebkitPrintColorAdjust: "exact",
                    MozPrintColorAdjust: "exact"
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      fontSize: "25px",
                      backgroundColor: "#939292",
                      color: "#FFF",
                      padding: "4px 0px 5px 6px",
                      fontWeight: "bold",
                      width: "805px",
                      textAlign: "left",
                      lineHeight: "25px"
                    }}
                  >
                    RETURN MATERIAL
                  </div>
        
                  {/* Company + Logo */}
                  <div className="disflx justify-content-between" style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                    <div className="spfnthead" style={{ paddingLeft: "5px" }}>
                      {json0Data?.companyname !== "" && (<div className="spfntBld" style={{ fontSize: "15px",fontWeight:"bold" }}>{json0Data?.companyname}</div>)}
                      {json0Data?.CompanyAddress !== "" && (<div className="">{json0Data?.CompanyAddress}</div>)}
                      <div className="">{json0Data?.CompanyAddress2}</div>
                      <div className="">{json0Data?.CompanyCity} {json0Data?.CompanyCity && json0Data?.CompanyPinCode !== "" && ("-")} {json0Data?.CompanyPinCode !== "" && (`${json0Data?.CompanyPinCode},`)} {json0Data?.CompanyState}{json0Data?.CompanyCountry !== "" && (`(${json0Data?.CompanyCountry})`)}</div>
                      {json0Data?.CompanyTellNo !== "" && (<div className="">T {json0Data?.CompanyTellNo} {json0Data?.CompanyTollFreeNo ? ` | TOLL FREE ${json0Data?.CompanyTollFreeNo}` : ""}</div>)}
                      <div className="">{json0Data?.CompanyEmail} {json0Data?.CompanyWebsite && json0Data?.CompanyEmail !== "" && ("|")} {json0Data?.CompanyWebsite}</div>
                      <div className="">{json0Data?.Company_VAT_GST_No !== "" && (`${json0Data?.Company_VAT_GST}-${json0Data?.Company_VAT_GST_No}`)} {json0Data?.Company_VAT_GST_No && json0Data?.Company_CST_STATE_No !== "" && ("|")} {json0Data?.Company_CST_STATE_No !== "" && (`${json0Data?.Company_CST_STATE}-${json0Data?.Company_CST_STATE_No}`)} {json0Data?.Company_CST_STATE_No && json0Data?.ComPanCard !== "" && ("|")} {json0Data?.ComPanCard !== "" && (`PAN-${json0Data?.ComPanCard} `)}</div>
                    </div>
        
                    {typeof json0Data?.PrintLogo === 'string' && json0Data.PrintLogo.trim() !== '' && (
                      <div>
                        <img
                          src={json0Data.PrintLogo}
                          alt="#companylogo"
                          className="cmpnyLogo"
                          width={85}
                          height={85}
                          onError={handleImageErrors}
                        />
                      </div>
                    )}
        
                  </div>
        
                  {/* From + Invoice */}
                  <div
                    style={{
                      border: "1px solid #C2C2C2",
                      width: "100%",
                      marginTop: "10px",
                      padding: "10px"
                    }}
                  >
                    <div style={{ display: "flex", width: "100%" }}>
                      {/* From */}
                      <div style={{ width: "60%" }}>
                        <div>
                          <b>To ,</b> {json0Data?.IsPrint_ShortCustomerDetails === 0 ? json0Data?.customerfirmname : json0Data?.Customercode}
                        </div>
        
        
                      </div>
        
                      {/* Invoice Info */}
                      <div style={{ width: "40%" }}>
                        <div style={{ display: "flex", fontSize: "14px" }}>
                          <div style={{ width: "90px", fontWeight: "bold" }}>INWARD</div>
                          <div>:</div>
                          <div id="Memono" style={{ marginLeft: "6px" }}>
                            {json0Data?.MaterialBillNo}
                          </div>
                        </div>
        
                        <div style={{ display: "flex", fontSize: "14px", marginTop: "5px" }}>
                          <div style={{ width: "90px", fontWeight: "bold" }}>DATE</div>
                          <div>:</div>
                          <div id="invoicedate" style={{ marginLeft: "6px" }}>
                            {json0Data?.EntryDate1}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
        
                   

                  
                  {MergeData?.length > 0 && MergeData.map((e, index) => (
                                <div key={index} style={{ width: "100%", border: "1px solid #C2C2C2", borderCollapse: "collapse", marginTop: "15px" }}>

                                    {/* Header Title */}
                                    <div style={{ padding: "10px", fontWeight: "bold", borderBottom: "1px solid #C2C2C2", fontSize: "20px", color: "#6F6F6F" }}>
                                        {e.ItemName
                                            ?.toLowerCase()
                                            .split(" ")
                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                            .join(" ")
                                        }
                                    </div>

                                    {/* Column Header */}
                                    {(e.ItemId === 1 || e.ItemId === 2) ? (
                                        <div style={{ display: "flex", background: "#DFDFDF", fontWeight: "bold", borderBottom: "1px solid #C2C2C2" }}>
                                            <div style={{ ...printtableTD, width: "11%", padding: "5px" }}>PO#</div>
                                            <div style={{ ...printtableTD, width: "11%", padding: "5px" }}>Job/Design#</div>
                                            <div style={{ ...printtableTD, width: "11%", padding: "5px" }}>Item</div>
                                            <div style={{ ...printtableTD, width: "11%", padding: "5px" }}>Type/Purity</div>
                                            <div style={{ ...printtableTD, width: "11%", padding: "5px" }}>Color</div>
                                            <div style={{ ...printtableTD, width: "11%", padding: "5px" }}>HSN#</div>
                                            <div style={{ ...printtableTD, width: "11%", padding: "5px", textAlign: "right" }}>Gm.</div>
                                            <div style={{ ...printtableTD, width: "11%", padding: "5px", textAlign: "right" }}>Pure Wt.</div>
                                            <div style={{ ...printtableTD, width: "11%", padding: "5px", textAlign: "right", borderRight: "0px" }}>Amt.</div>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", background: "#DFDFDF", fontWeight: "bold", borderBottom: "1px solid #C2C2C2" }}>
                                            <div style={{ ...printtableTD, width: "9%", padding: "5px" }}>PO#</div>
                                            <div style={{ ...printtableTD, width: "11%", padding: "5px" }}>Job/Design#</div>
                                            <div style={{ ...printtableTD, width: "10%", padding: "5px" }}> {e.ItemId == 5 ? "Item" : "Type"}</div>
                                            <div style={{ ...printtableTD, width: e.ItemId == 5 ? "11%" : "10%", padding: "5px" }}>{e.ItemId == 5 ? "Type/Purity" : "Shape"}</div>
                                            <div style={{ ...printtableTD, width: "10%", padding: "5px" }}>{e.ItemId == 5 ? "F.Type" : "Quality"}</div>
                                            <div style={{ ...printtableTD, width: "10%", padding: "5px" }}> {e.ItemId == 5 ? "Accessories" : "Color"} </div>
                                            <div style={{ ...printtableTD, width: "10%", padding: "5px" }}>{e.ItemId == 5 ? "Color" : "Size"}Size</div>
                                            <div style={{ ...printtableTD, width: "10%", padding: "5px" }}>HSN#</div>
                                            <div style={{ ...printtableTD, width: "10%", padding: "5px", textAlign: "right" }}>{e.ItemId == 5 ? "Gm." : "Pcs"}</div>
                                            <div style={{ ...printtableTD, width: "10%", padding: "5px", textAlign: "right" }}>{e.ItemId == 5 ? "Pure Wt" : e.ItemId === 3 || e.ItemId === 4 ? "Ctw" : "Wt"}</div>
                                            <div style={{ ...printtableTD, width: "10%", padding: "5px", textAlign: "right", borderRight: "0px" }}>Amt.</div>
                                        </div>
                                    )}

                                    {/* Items */}
                                    {e.items?.length > 0 && e.items.map((item, idx) => (
                                        (e.ItemId === 1 || e.ItemId === 2) ? (
                                            <div key={idx} style={{ display: "flex", borderBottom: "1px solid #C2C2C2" }}>
                                                <div style={{ ...printtableTD, width: "11%", padding: "5px",borderBottom:"0px" }}> </div>
                                                <div style={{ ...printtableTD, width: "11%", padding: "5px",borderBottom:"0px" }}> </div>
                                                <div style={{ ...printtableTD, width: "11%", padding: "5px" ,borderBottom:"0px" }}>{item?.shape}</div>
                                                <div style={{ ...printtableTD, width: "11%", padding: "5px" ,borderBottom:"0px" }}>{item?.purity}/{item?.Tunch}</div>
                                                <div style={{ ...printtableTD, width: "11%", padding: "5px" ,borderBottom:"0px" }}>{item?.color}</div>
                                                <div style={{ ...printtableTD, width: "11%", padding: "5px" ,borderBottom:"0px" }}>{item?.HSN_No}</div>
                                                <div style={{ ...printtableTD, width: "11%", padding: "5px", textAlign: "right" ,borderBottom:"0px" }}>{item?.Weight.toFixed(3)}</div>
                                                <div style={{ ...printtableTD, width: "11%", padding: "5px", textAlign: "right" ,borderBottom:"0px" }}>{item?.PureWeight.toFixed(3)}</div>
                                                <div style={{ ...printtableTD, width: "11%", padding: "5px", textAlign: "right", borderRight: "0px" ,borderBottom:"0px" }}>{item?.Amount.toFixed(2)}</div>
                                            </div>
                                        ) : (
                                            <div key={idx} style={{ display: "flex", borderBottom: "1px solid #C2C2C2" }}>
                                                <div style={{ ...printtableTD, width: "9%", padding: "5px" ,borderBottom:"0px" }}> </div>
                                                <div style={{ ...printtableTD, width: "11%", padding: "5px" ,borderBottom:"0px" }}> </div>
                                                <div style={{ ...printtableTD, width: "10%", padding: "5px" ,borderBottom:"0px" }}>{e.ItemId == 5 ? item?.shape : ""} </div>
                                                <div style={{ ...printtableTD, width: "10%", padding: "5px" ,borderBottom:"0px" }}>{e.ItemId == 5 ? item?.purity + "/" + item?.Tunch : item?.shape}</div>
                                                <div style={{ ...printtableTD, width: "10%", padding: "5px" ,borderBottom:"0px" }}>{e.ItemId == 5 ? item?.FindingType : item?.purity}   </div>
                                                <div style={{ ...printtableTD, width: "10%", padding: "5px" ,borderBottom:"0px" }}>{e.ItemId == 5 ? item?.FindingAccessories : item?.color}</div>
                                                <div style={{ ...printtableTD, width: "10%", padding: "5px" ,borderBottom:"0px" }}>   {e.ItemId == 5 ? item?.color : item?.size}  </div>
                                                <div style={{ ...printtableTD, width: "10%", padding: "5px" ,borderBottom:"0px" }}>{item?.HSN_No}</div>
                                                <div style={{ ...printtableTD, width: "10%", padding: "5px", textAlign: "right" ,borderBottom:"0px" }}>{e.ItemId == 5 ? item?.Weight.toFixed(3) : item?.pieces}  </div>
                                                <div style={{ ...printtableTD, width: "10%", padding: "5px", textAlign: "right" ,borderBottom:"0px" }}> {e.ItemId == 5 ? item?.PureWeight : item?.Weight.toFixed(3)}  { }</div>
                                                <div style={{ ...printtableTD, width: "10%", padding: "5px", textAlign: "right", borderRight: "0px" ,borderBottom:"0px" }}>{item?.Amount.toFixed(2)}</div>
                                            </div>
                                        )
                                    ))}

                                    {/* Total Row */}
                                    {/* <div style={{ display: "flex", fontWeight: "bold" }}>
                                        <div style={{ ...printtableTD, width: e.ItemId !== 1 ? "90%" : "66%", padding: "5px" }}>Total</div>
                                        <div style={{ ...printtableTD, width: "11%", padding: "5px", textAlign: "right" }}>{e.ItemId !== 1  ? e.total.totalpcs : e.total.totalCtw.toFixed(3)}</div>
                                        <div style={{ ...printtableTD, width: e.ItemId !== 1 ? "10.9%" : "11%", padding: "5px", textAlign: "right" }}>{e.ItemId !== 1   ? e.total.totalCtw.toFixed(3) : e.total.totalPureWt.toFixed(3)}</div>
                                        <div style={{ ...printtableTD, width: "11%", padding: "5px", textAlign: "right", borderRight: "0px" }}>{e.total.totalAmount.toFixed(2)}</div>
                                    </div> */}
                                    {/* Total Row */}
                                    <div style={{ display: "flex", fontWeight: "bold" }}>
                                        <div style={{
                                            ...printtableTD,
                                            width: [1, 2].includes(e.ItemId) ? "66%" : "90.5%",
                                            padding: "5px",
                                            borderBottom:"0px"
                                        }}>
                                            Total
                                        </div>

                                        <div style={{
                                            ...printtableTD,
                                            width: "11%",
                                            padding: "5px",
                                            textAlign: "right",
                                             borderBottom:"0px"
                                        }}>
                                            {[1, 2, 5].includes(e.ItemId) ? e.total.totalCtw.toFixed(3) : e.total.totalpcs}
                                        </div>

                                        <div style={{
                                            ...printtableTD,
                                            width: [1, 2, 5].includes(e.ItemId) ? "11%" : "10.9%",
                                            padding: "5px",
                                            textAlign: "right",
                                             borderBottom:"0px"
                                        }}>
                                            {[1, 2, 5].includes(e.ItemId) ? e.total.totalPureWt.toFixed(3) : e.total.totalCtw.toFixed(3)}
                                        </div>

                                        <div style={{
                                            ...printtableTD,
                                            width: "11%",
                                            padding: "5px",
                                            textAlign: "right",
                                            borderRight: "0px",
                                             borderBottom:"0px"
                                        }}>
                                            {e.total.totalAmount.toFixed(2)}
                                        </div>
                                    </div>

                                </div>
                            ))}

        
                  {/* Remark */}
                  <div
                    id="divremark"
                    style={{
                      height: "auto",
                      fontSize: "15px",
                      textAlign: "initial",
                      marginTop: "10px"
                    }}
                  ></div>
        
                  {/* Footer */}
                  <div style={{ width: "800px", marginTop: "20px" }}>
                    <div id="duedays" style={{ width: "72%" }}></div>
        
                    <div style={{ textAlign: "right", paddingTop: "35px" }}>
                      Authorized by ________________.
                    </div>
                  </div>
                </div>
        
                <br />
                <br />
              </div>
            </div>
            ) : (
              <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
                {msg}
              </p>
            )}
          </> 
        )


}

export default MaterialReturnPrint
