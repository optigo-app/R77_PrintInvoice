// http://localhost:3001/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=SlMvMTUyLzI1LTI2&evn=SmV3ZWxsZXJ5U2FsZQ==&pnm=c2hpcG1lbnQgb3B0aWdv&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2hpcG1lbnRfSnNvbg==&ctv=NzE=&ifid=PackingList3&pid=undefined
import React, { useEffect, useState } from "react";
import "../../assets/css/prints/ShipmentOptigo.scss";
import QRCode from "react-qr-code";
import { apiCall, checkMsg, isObjectEmpty, handlePrint, handleImageError, } from "../../GlobalFunctions";
import Loader from "../../components/Loader";

export default function ShipmentTagOptigo({ token, invoiceNo, printName, urls, evn, ApiVer }) {
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);

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
          setMsg(data?.Message);
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
  const loadData = (data) => {
    setResult(data)
  }
  const text = result?.Shipment_Json?.map((e) => e?.ShippingToPrintlable || '').join('\n') || '';
  const formattedText = text.replace(/\n/g, "<br />");
  console.log("resultresult", result);
  return (
    <div>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <>
          <div>
            <button
              className="btn_white blue mb-0 hidedp10 m-3 p-2"
              onClick={(e) => handlePrint(e)}
            >
              Print
            </button>
          </div>
  
          {result?.Shipment_Json?.map((e, i) => (
            <div key={i} className="invoice-container">
              {/* Header */}
              <div className="header" style={{marginBottom: "15px"}}>
                <div className="party0">
                  <img
                    src={e?.InvoicePrintLogo}
                    onError={(e) => handleImageError(e)}
                    height={30}
                    width={50}
                    className="logo"
                    alt="logo"
                  />
                </div>
                <div className="party1 from" style={{ borderRight: "1px solid" }}>
                  <div className="address-block">
                    <strong className="brBtom" style={{ fontSize: "7px" }}>FROM:</strong>
                    <div className="spbrWord spBold" style={{ fontSize: "6px" }}>{e?.ShippingFrom}</div>
                    {e?.ShippingFromPrintlable !== "" && <div className="wordwarper" style={{ fontSize: "6px" ,lineHeight: "12px"}} dangerouslySetInnerHTML={{ __html: e?.ShippingFromPrintlable }}/>}
                  </div>
                </div>
                <div className="party2 to">
                  <div className="address-block">
                    <strong className="spPadg brBtom" style={{ fontSize: "7px" }}>TO:</strong>
                    <div className="spbrWord spBold" style={{ fontSize: "6px" }}>{e?.ShippingFullName}</div>
                    <div className="spbrWord wordwarper" >
                      {e?.ShippingToPrintlable !== "" && <div style={{ fontSize: "6px" }} dangerouslySetInnerHTML={{ __html: formattedText }} />}
                      {/* <div>{e?.ShippingCity}‑{e?.ShippingPincode}, {e?.ShippingState} ‑ {e?.ShippingCountry}</div>
                      <div>Phone: {e?.ShippingMobileNo}</div> */}
                    </div>
                  </div>
                </div>
              </div>
  
              <hr className="divider" style={{ marginBottom: "2px" }}/>
  
              {/* Mid section */}
              <div className="mid-section">
                <div className="secondOPart1">
                  <div className="brBtom brRight">
                    <div className="spMgl">Date:</div> <div className="spFntst spMgl pmb2" style={{ fontSize: "6.5px" }}>{e?.Shipmentdate}</div>
                  </div>
                  <div className="brBtom brRight">
                    <div className="spMgl spMgT"> Delivery By:</div>
                    <div className="spFntst spMgl pmb2" style={{ fontSize: "6.5px" }}>
                      {e?.Deliveredby?.length > 25 ?
                        e?.Deliveredby?.slice(0, 25) + "..." : e?.Deliveredby}
                      </div>
                  </div>
                  <div className="brRight">
                    <div className="spMgl spMgT"> Shipment:</div> 
                    <div className="spFntst spMgl pmb2" style={{ fontSize: "6.5px" }}>
                    {e?.Shipmentno?.length > 25
                      ? e.Shipmentno.slice(0, 25) + "..."
                      : e.Shipmentno}
                    </div>
                  </div>
                </div>
                <div className="secondOPart2">
                    <div style={{ fontSize: "6.5px", }}>Order No.</div>
                    <div style={{ fontSize: "6.5px", fontWeight: "bold" }}>{e?.BillNo}</div>
                </div>
                <div className="secondOPart3">
                  <QRCode
                    style={{ height: "45px", width: "60px" }}
                    value={e?.BillNo}
                    viewBox={`0 0 128 128`}
                  />
                </div>
              </div>
              <div className="spFntclr" style={{ fontSize: "6px", width: "100%", textAlign: "center" }}>Powered by OptigoApps</div>
  
              {/* <hr className="divider" style={{ borderTop: "none" }} /> */}
            </div>
          ))}
        </>
      ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
          {msg}
        </p>
      )}
    </div>
  );
  
}
