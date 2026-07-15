import React, { useEffect } from "react";
import "../../assets/css/prints/InvoicePrintMaterialPurchase.css";
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
import { add, set } from "lodash";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";


function CustomerReceive({
  token,
  invoiceNo,
  printName,
  urls,
  evn,
  ApiVer,
}) {

  const [loader, setLoader] = useState(true);
  const [json0Data, setJson0Data] = useState({});
  const [json2Data, setJson2Data] = useState({});
  const [json3Data, setJson3Data] = useState([]);
  const [msg, setMsg] = useState("");
  const [finalD, setFinalD] = useState({});
  const [custAddress, setCustAddress] = useState([]);
  const [taxAmont, setTaxAmount] = useState();
  const [extraTaxAmont, setExtraTaxAmount] = useState();
  const toWords = new ToWords();
  const [headFlag, setHeadFlag] = useState(true);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const [addLess, setAddLess] = useState(0);
  const [result, setResult] = useState(null);
  const [taxprofile1, setTaxprofile1] = useState(0);
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
              data?.Data?.MaterialPurchasePrint_Json[0]?.Printlable?.split("\r\n");
            setCustAddress(address);

            // console.log("data", data);

            setJson0Data(data?.Data?.MaterialPurchasePrint_Json[0]);
            setJson2Data(data?.Data?.MaterialPurchasePrint_Json2[0]);
            setJson3Data(data?.Data?.MaterialPurchasePrint_Json3);
            const sortedItems = [...(data?.Data?.MaterialPurchasePrint_Json1 || [])].sort(
              (a, b) => parseFloat(a?.ItemId || 0) - parseFloat(b?.ItemId || 0)
            );
            setFinalD(sortedItems);
            setTaxAmount(data?.Data?.MaterialPurchasePrint_Json2[0]);
            if (data?.Data?.MaterialPurchasePrint_Json?.GSTProfileid == 1) {

              setExtraTaxAmount(data?.Data?.MaterialPurchasePrint_Json3);
            } else {
              setExtraTaxAmount(data?.Data?.MaterialPurchasePrint_Json2[0]);

            }
            setAddLess(data?.Data?.MaterialPurchasePrint_Json2[0]?.AddLess || 0);


            // console.log("data?.Data?.MaterialPurchasePrint_Json3", data?.Data?.MaterialPurchasePrint_Json3);

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



  const totalPieces = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
    const pieces = parseFloat(item?.Pieces);
    return sum + (isNaN(pieces) ? 0 : pieces);
  }, 0);


  const totalWeight = (Array.isArray(finalD) ? finalD : []).reduce((sum, item) => {
    const weight = parseFloat(item?.Weight);
    return sum + (isNaN(weight) ? 0 : weight);
  }, 0);








  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <div style={{ width: "800px", margin: "0 auto" }}>
          <div className="prnt_btn">
            <div style={{ marginBottom: "10px", display: "flex", justifyContent: "flex-end" }}  >
              <input
                type="button"
                className="btn_white blue mt-0"
                value="Print"
                onClick={(e) => handlePrint(e)}
              />
            </div>
          </div>
          <div
            id="settlementdiv"
            style={{
              width: "100%",
              fontFamily: "Calibri",
            }}
          >
            {/* Title */}
            <div
              style={{
                width: "100%",
                backgroundColor: "#939292",
                color: "#FFF",
                padding: "4px 0px 5px 6px",
                fontSize: "20px",
                fontWeight: "bold",
                lineHeight: "26px",
                boxSizing: "border-box",
              }}
            >
              {json0Data?.PrintHeadLabel}
            </div>

            {/* Company Details Section */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                width: "100%",
                marginTop: "8px",
                boxSizing: "border-box",
              }}
            >
              {/* Left Content */}
              <div
                style={{
                  width: "70%",
                  paddingLeft: "7px",
                  fontSize: "12px",
                  color: "#000",
                  lineHeight: "18px",
                }}
              >
                {/* Company Name */}
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    paddingTop: "5px",
                  }}
                >
                  {json0Data?.CompanyFullName}
                </div>

                {/* Address */}
                <div>
                  {json0Data?.CompanyAddress}
                </div>

                <div> {json0Data?.CompanyAddress2}</div>

                {(json0Data?.CompanyCity ||
                  json0Data?.CompanyPinCode ||
                  json0Data?.CompanyState ||
                  json0Data?.CompanyCountry) && (
                    <div>
                      {json0Data?.CompanyCity || ""}

                      {json0Data?.CompanyPinCode
                        ? `-${json0Data.CompanyPinCode}`
                        : ""}

                      {json0Data?.CompanyState
                        ? `, ${json0Data.CompanyState}`
                        : ""}

                      {json0Data?.CompanyCountry && (
                        <span>
                          {" "}
                          ({json0Data.CompanyCountry})
                        </span>
                      )}
                    </div>
                  )}

                {json0Data?.CompanyTellNo && (
                  <div>
                    T {json0Data.CompanyTellNo}
                  </div>
                )}

                <div
                  style={{
                    fontSize: "12px",
                  }}
                >
                  {json0Data?.CompanyEmail && (
                    <>{json0Data.CompanyEmail}</>
                  )}

                  {json0Data?.CompanyWebsite && (
                    <>
                      {json0Data?.CompanyEmail ? " | " : ""}
                      {json0Data.CompanyWebsite}
                    </>
                  )}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    paddingBottom: "5px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      paddingBottom: "5px",
                    }}
                  >
                    {json0Data?.Company_VAT_GST &&
                      json0Data?.Company_VAT_GST_No && (
                        <>
                          {json0Data.Company_VAT_GST}-
                          {json0Data.Company_VAT_GST_No}
                        </>
                      )}

                    {json0Data?.Company_CST_STATE &&
                      json0Data?.Company_CST_STATE_No && (
                        <>
                          {" "}
                          | {json0Data.Company_CST_STATE}-
                          {json0Data.Company_CST_STATE_No}
                        </>
                      )}

                    {json0Data?.ComPanCard && (
                      <>
                        {" "}
                        | PAN-{json0Data.ComPanCard}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Logo */}
              <div
                style={{
                  paddingRight: "10px",
                }}
              >
                <img
                  src={json0Data.PrintLogo}
                  alt="#companylogo"
                  className="cmpnyLogo"
                  onError={handleImageErrors}
                />
              </div>
            </div>
          </div>


          <div
            style={{
              width: "100%",
              display: "flex",
              borderBottom: "1px solid #DCDCDC",
              borderLeft: "1px solid #DCDCDC",
              marginBottom: "-1px",
              fontFamily: "Calibri",
              boxSizing: "border-box",
            }}
          >
            {/* Left Section */}
            <div
              style={{
                width: "70%",
                borderTop: "1px solid #DCDCDC",
                borderRight: "0px",
                padding: "5px",
                boxSizing: "border-box",
              }}
            >
              {/* Company Name */}
              <div
                id="companyname"
                style={{
                  textAlign: "left",
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    paddingRight: "5px",
                  }}
                >
                  From,
                </span>

                {json0Data?.Customercode}
              </div>


            </div>

            {/* Right Section */}
            <div
              style={{
                width: "30%",
                borderTop: "1px solid #DCDCDC",
                borderRight: "1px solid #DCDCDC",
                padding: "10px 0px 0px 40px",
                boxSizing: "border-box",
              }}
            >
              {/* Voucher */}
              <div
                style={{
                  display: "flex",
                  lineHeight: "1.2",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    fontWeight: "bold",
                  }}
                >
                  VOUCHER
                </div>

                <div id="transaction"> {json0Data?.InvoiceNo}</div>
              </div>

              {/* Date */}
              <div
                style={{
                  display: "flex",
                  lineHeight: "1.2",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    fontWeight: "bold",
                  }}
                >
                  DATE
                </div>

                <div id="date"> {json0Data?.EntryDate}</div>
              </div>

              {/* Code */}
              <div
                style={{
                  display: "flex",
                  marginBottom: "8px",
                  lineHeight: "1.2",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    fontWeight: "bold",
                  }}
                >
                  CODE
                </div>

                <div
                  id="ccode"
                  style={{
                    fontWeight: "bold",
                  }}
                >
                  {json0Data?.Customercode}
                </div>
              </div>
            </div>
          </div>


          <div
            style={{
              width: "100%",
              border: "1px solid #DCDCDC",
              fontFamily: "Calibri",
              fontSize: "12px",
              marginTop: "2px",
              boxSizing: "border-box",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                textTransform: "uppercase",
                fontWeight: "bold",
                borderBottom: "1px solid #DCDCDC",
                minHeight: "31px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "40px",
                  borderRight: "1px solid #DCDCDC",
                  padding: "8px",
                  boxSizing: "border-box",
                }}
              >
                SR#
              </div>

              <div
                style={{
                  width: "250px",
                  borderRight: "1px solid #DCDCDC",
                  padding: "8px",
                  boxSizing: "border-box",
                }}
              >
                Description
              </div>

              <div
                style={{
                  flex: 1,
                  borderRight: "1px solid #DCDCDC",
                  padding: "8px",
                  boxSizing: "border-box",
                }}
              >
                Remarks
              </div>

              <div
                style={{
                  width: "90px",
                  borderRight: "1px solid #DCDCDC",
                  padding: "8px",
                  boxSizing: "border-box",
                }}
              >
                HSN
              </div>

              <div
                style={{
                  width: "70px",
                  borderRight: "1px solid #DCDCDC",
                  padding: "8px",
                  textAlign: "right",
                  boxSizing: "border-box",
                }}
              >
                Pcs
              </div>

              <div
                style={{
                  width: "120px",
                  borderRight: "1px solid #DCDCDC",
                  padding: "8px",
                  textAlign: "right",
                  boxSizing: "border-box",
                }}
              >
                Actual Weight
              </div>

              <div
                style={{
                  width: "120px",
                  padding: "8px",
                  textAlign: "right",
                  boxSizing: "border-box",
                }}
              >
                Weight
              </div>
            </div>

            {/* Rows */}
            {finalD.map((item, index) => (


              <div

                key={index}
                style={{
                  display: "flex",
                  borderBottom: "1px solid #DCDCDC",
                  minHeight: "35px",
                  alignItems: "stretch",
                }}
              >

                <div
                  style={{
                    width: "40px",
                    borderRight: "1px solid #DCDCDC",
                    padding: "8px",
                    textAlign: "center",
                    boxSizing: "border-box",
                  }}
                >
                  {index + 1}
                </div>

                <div
                  style={{
                    width: "250px",
                    borderRight: "1px solid #DCDCDC",
                    padding: "8px",
                    boxSizing: "border-box",
                    wordBreak: "break-word",
                  }}
                >
                  {item.IsSolGem == 0 ?
                    <span style={{ wordBreak: "break-word" }}>{item.ItemName}:
                      {[
                        item.MaterialTypeName,
                        item.LotNo,
                        item.shape,
                        item.purity,
                        item.color,
                        item.size
                      ]
                        .filter(Boolean)
                        .join('/')}</span>

                    :
                    <span style={{ wordBreak: "break-word" }}>{item.ItemName === "DIAMOND" ? "DIAMOND:S " : item.ItemName === "COLOR STONE" ? "COLOR STONE:G " : item.ItemName}:
                      {[
                        item.MaterialTypeName,
                        item.LotNo,
                        item.shape,
                        item.purity,
                        item.color,
                        item.size,
                        item.certno,
                        item.cutname,
                        item.polishname,
                        item.symmetryname,
                        item.fluorescencename,
                        item.length + " X " + item.width + " X " + item.depth,
                        item.gridlename,
                        item.culetname,
                        item.inscription,
                        item.labname,
                      ]
                        .filter(Boolean)
                        .join('/')}</span>}

                </div>

                <div
                  style={{
                    flex: 1,
                    borderRight: "1px solid #DCDCDC",
                    padding: "8px",
                    boxSizing: "border-box",
                  }}
                >
                  {item.MaterialRemark}
                </div>

                <div
                  style={{
                    width: "90px",
                    borderRight: "1px solid #DCDCDC",
                    padding: "8px",
                    boxSizing: "border-box",
                  }}
                >
                  {item.HSN_No}
                </div>

                <div
                  style={{
                    width: "70px",
                    borderRight: "1px solid #DCDCDC",
                    padding: "8px",
                    textAlign: "right",
                    boxSizing: "border-box",
                  }}
                >
                  {item.Pieces}
                </div>

                <div
                  style={{
                    width: "120px",
                    borderRight: "1px solid #DCDCDC",
                    padding: "8px",
                    textAlign: "right",
                    boxSizing: "border-box",
                  }}
                >
                  {item.Weight.toFixed(3)}
                </div>

                <div
                  style={{
                    width: "120px",
                    padding: "8px",
                    textAlign: "right",
                    boxSizing: "border-box",
                  }}
                >
                  {item.Weight.toFixed(3)}
                </div>
              </div>
            ))}

            {/* Total Row */}
            <div
              style={{
                display: "flex",

                alignItems: "center",
                fontWeight: "bold",
              }}
            >
              {/* Total Label */}
              <div
                style={{
                  flex: 1,
                  borderRight: "1px solid #DCDCDC",
                  padding: "3px",
                  fontSize: "17px",
                  boxSizing: "border-box",
                }}
              >
                TOTAL
              </div>

              {/* Total PCS */}
              <div
                style={{
                  width: "70px",
                  borderRight: "1px solid #DCDCDC",
                  padding: "8px",
                  textAlign: "right",
                  boxSizing: "border-box",
                }}
              >
                {totalPieces}
              </div>

              {/* Total Actual Weight */}
              <div
                style={{
                  width: "120px",
                  borderRight: "1px solid #DCDCDC",
                  padding: "8px",
                  textAlign: "right",
                  textTransform: "lowercase",
                  boxSizing: "border-box",
                }}
              >
                {totalWeight.toFixed(3)} Ctw
              </div>

              {/* Total Weight */}
              <div
                style={{
                  width: "120px",
                  padding: "8px",
                  textAlign: "right",
                  textTransform: "lowercase",
                  boxSizing: "border-box",
                }}
              >
                {totalWeight.toFixed(3)} Ctw
              </div>
            </div>
          </div>

          <div
            style={{
              width: "100.5%",
              marginTop: "2px",
              marginLeft: "-1px",
              border: "1px solid #DCDCDC",
              borderCollapse: "collapse",
              fontSize: "12px",
              color: "#000",
              fontWeight: "normal",
              textAlign: "left",
              fontFamily: "Calibri",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                padding: "5px",

                boxSizing: "border-box",
              }}
            >

              We hereby confirm that we have received the above
              goods in good condition and order.

            </div>
          </div>


          <div
            style={{
              width: "100%",
              fontFamily: "Calibri",
              boxSizing: "border-box",
            }}
          >
            {/* Empty Space */}
            <div
              style={{
                height: "20px",
              }}
            >
              &nbsp;
            </div>

            {/* Signature Section */}
            <div
              style={{
                display: "flex",
                width: "100%",
              }}
            >
              {/* Left Signature */}
              <div
                style={{
                  width: "50%",
                  height: "80px",
                  border: "1px solid #DCDCDC",
                  textAlign: "center",
                  verticalAlign: "bottom",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: "10px",
                  fontSize: "12px",
                  boxSizing: "border-box",
                }}
              >
                <span>
                  Authorised, <b>{json0Data?.Customercode}</b>
                </span>
              </div>

              {/* Right Signature */}
              <div
                style={{
                  width: "50%",
                  height: "80px",
                  borderTop: "1px solid #DCDCDC",
                  borderRight: "1px solid #DCDCDC",
                  borderBottom: "1px solid #DCDCDC",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: "10px",
                  fontSize: "12px",
                  boxSizing: "border-box",
                }}
              >
                <span>
                  Authorised, <b>{json0Data?.CompanyFullName}</b>
                </span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
          {msg}
        </p>
      )}
    </>
  );
}

export default CustomerReceive
