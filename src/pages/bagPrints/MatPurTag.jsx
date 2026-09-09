import queryString from "query-string";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../assets/css/bagprint/print20A.css";
import "../../assets/css/bagprint/mutpurtag.css";
import { GetUniquejob } from "../../GlobalFunctions/GetUniqueJob";
import { handlePrint } from "../../GlobalFunctions/HandlePrint";
import { GetWipData } from "../../GlobalFunctions/GetWipData";
import BarcodeGenratorStcok from "../../components/BarcodeGenratorStcok";
import QRCodeGenerator from "../../components/QRCodeGenerator";
import Loader from "../../components/Loader";

function MatPurTag({ queries, headers }) {
  const [data, setData] = useState([]);
  const location = useLocation();
  const [qrflag, setqrflag] = useState(false);
  const queryParams = queryString.parse(location.search);
  const resultString = GetUniquejob(queryParams?.str_srjobno);
  const chunkSize10 = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const body = {
          "con": "{\"id\": \"\", \"mode\": \"MatPur_Tag\", \"appuserid\": \"" + queries?.appuserid + "\"}",
          "p": "{\"mat_tagid\": \"" + queries?.wip_id + "\"}",
          "f": "Task Management (taskmaster)"
        };

        const allDatas = await GetWipData(queries, body);

        setData(allDatas?.Data?.rd || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleQR = (e) => {
    if (qrflag) setqrflag(false);
    else {
      setqrflag(true);
    }
  };

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        {data?.length === 0 ? (
          <Loader />
        ) : (
          <>
            <div className="printbtn ds-print-bar hidedp10_pcl7">
              <div className="px-1 ds-qr-toggle">
                <input
                  type="checkbox"
                  checked={qrflag}
                  id="netwts2"
                  value="netwts2"
                  className="mx-1"
                  onChange={handleQR}
                />
                <label htmlFor="netwts2">Qr Code</label>
              </div>
              <button
                className="btn_white blue mb-0 hidedp10_pcl7 m-0 p-2"
                onClick={(e) => handlePrint(e)}
              >
                Print
              </button>
            </div>

            <div className="ds-labels-wrap">
              {data?.map((item, index) => (
                <div key={index} className="ds-label-container">

                  {/* TOP */}
                  <div className="ds-top-wrapper">
                    <div className="ds-header">{item?.itemname}</div>
                    <div className="ds-divider"></div>

                    <div className="ds-content-row">

                      {/* LEFT TEXT */}
                      <div className="ds-left-text">
                        <div className="ds-row"><span className="ds-label">M.Type</span><span className="ds-colon">:</span><span className="ds-value">{item?.materialtypename}</span></div>
                        <div className="ds-row"><span className="ds-label ds-label-wide">Wt(ctw)</span><span className="ds-colon">:</span><span className="ds-value">{item?.wt?.toFixed(2)}</span></div>
                        <div className="ds-row"><span className="ds-label">Pcs</span><span className="ds-colon">:</span><span className="ds-value">{item?.pcs}</span></div>
                        <div className="ds-row"><span className="ds-label">Lot#</span><span className="ds-colon">:</span><span className="ds-value">{item?.job}</span></div>
                        <div className="ds-row"><span className="ds-label">Shape</span><span className="ds-colon">:</span><span className="ds-value-wrap">{item?.shape}</span></div>
                        <div className="ds-row"><span className="ds-label">Clarity</span><span className="ds-colon">:</span><span className="ds-value-wrap">{item?.quality}</span></div>
                        <div className="ds-row"><span className="ds-label">Color</span><span className="ds-colon">:</span><span className="ds-value-wrap">{item?.color}</span></div>
                        <div className="ds-row"><span className="ds-label">Size</span><span className="ds-colon">:</span><span className="ds-value">{item?.size}</span></div>

                        <div className="ds-row"><span className="ds-label">Cust</span><span className="ds-colon">:</span><span className="ds-value">{item?.istoreCust_Customercode}</span></div>
                      </div>

                      {/* RIGHT BARCODE */}
                      <div className={`ds-barcode-wrapper${qrflag ? " ds-qr-active" : ""}`}>
                        <div className="ds-barcode-style ds-barcode-inner">
                          {qrflag ? <QRCodeGenerator text={item?.rfbag} /> : <BarcodeGenratorStcok data={item?.rfbag} />}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="ds-footer">
                    {item?.rfbag}
                  </div>

                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default MatPurTag;
