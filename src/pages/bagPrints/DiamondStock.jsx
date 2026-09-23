import queryString from "query-string";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../assets/css/bagprint/print20A.css";

import Loader from "../../components/Loader";
import { GetStockData } from "../../GlobalFunctions/GetStockData";
import { GetUniquejob } from "../../GlobalFunctions/GetUniqueJob";
import { handlePrint } from "../../GlobalFunctions/HandlePrint";

import QRCodeGenerator from "../../components/QRCodeGenerator";

function DiamondStock({ queries, headers }) {
  const [data, setData] = useState([]);
  const location = useLocation();
  const [qrflag, setqrflag] = useState(false);
  const queryParams = queryString.parse(location.search);
  const resultString = GetUniquejob(queryParams?.str_srjobno);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const objs = {
          rfbag: queries?.rfbag,
          jobno: resultString,
          custid: queries?.custid,
          printname: queries?.printname,
          appuserid: queries?.appuserid,
          url: queries?.url,
          headers: headers,
        };

        const allDatas = await GetStockData(objs);
        setData(allDatas?.rd);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQR = (e) => {
    if (qrflag) setqrflag(false);
    else {
      setqrflag(true);
    }
  };

  
  console.log("TCL: DiamondStock -> data", data)

  return (
    <>
      {data?.length === 0 ? (
        <Loader />
      ) : (
        <>
          <div className="">
            <div
              className="printbtn"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                margin: "10px",
                alignItems: "center",
              }}
            >
              <button
                className="btn_white blue mb-0 hidedp10_pcl7 m-0 p-2"
                onClick={(e) => handlePrint(e)}
              >
                Print
              </button>
            </div>
            <div>
              {data?.map((item, index) => (
                <div key={index} className="diamondStockContainer">
                  <div className="diamondFlex">
                    {/* Row group 1 + 2 (QR spans both) */}
                    <div className="row-group">
                      <div className="col-left">
                        <div className="frow">
                          <div className="cell label" style={{ width: "21%" }}>Wt.</div>
                          <div className="cell value" style={{ width: "72%" }}>
                            {item?.TotalRemainingWeight?.toFixed(3)}
                          </div>
                        </div>
                        <div className="frow">
                          <div className="cell label" style={{ width: "21%" }}>Col.</div>
                          <div className="cell value" style={{ width: "72%" }}>{item?.color}</div>
                        </div>
                        {/* <div className="frow">
                          <div className="cell label" style={{ width: "18%" }}>Cla.</div>
                          <div className="cell value" style={{ width: "74%" }}>{item?.clarity}</div>
                        </div> */}
                      </div>

                      <div className="qr-cell">
                        <div className="qr-wrapper">
                          <QRCodeGenerator text={item?.rfbag} />
                        </div>
                      </div>

                      <div className="col-right">
                        <div className="frow">
                          <div className="cell rfbag-cell" style={{ width: "100%" }}>
                            {item?.rfbag}
                          </div>
                        </div>
                       
                        
                        <div className="frow">
                          <div className="cell label" style={{ width: "38%" }}></div>
                          <div className="cell value" style={{ width: "62%" }}> {item?.labname}</div>
                          {/* <div className="cell value" style={{ width: "62%" }}>{item?.shape}</div> */}
                        </div>
                      </div>
                    </div>

                    
                    <div className="frow">
                      <div className="cell label" style={{ width: "11%" }}>Cla</div>
                      <div className="cell value" style={{ width: "39%" }}>{item?.quality}</div>
                      {/* <div className="cell label" style={{ width: "9%" }}>Lab.</div> */}
                      <div className="cell value ellipsis" style={{ width: "41%" }}>
                        {item?.certno}
                      </div>
                    </div>
                    {/* Row 4 */}
                    <div className="frow">
                      <div className="cell label" style={{ width: "11%" }}>Cut</div>
                      <div className="cell value" style={{ width: "39%" }}>{item?.cutname}</div>
                      <div className="cell label" style={{ width: "11%" }}>Sha.</div>
                      <div className="cell value ellipsis" style={{ width: "39%" }}>
                      {item?.shape}
                      </div>
                    </div>

                    {/* Row 5 */}
                    <div className="frow">
                      <div className="cell label" style={{ width: "11%" }}>Pol.</div>
                      <div className="cell value" style={{ width: "39%" }}>{item?.polishname}</div>
                      <div className="cell label" style={{ width: "12%" }}>Mea.</div>
                      <div className="cell value value-small" style={{ width: "39%" }}>
                        {item?.length && item?.width && item?.depth
                          ? `${item.length}x${item.width}x${item.depth}`
                          : [item?.length, item?.width, item?.depth].filter(Boolean).join("x")}
                      </div>
                    </div>

                    {/* Row 6 */}
                    <div className="frow">
                      <div className="cell label" style={{ width: "12%" }}>Sym.</div>
                      <div className="cell value" style={{ width: "38%" }}>{item?.symmetryname}</div>
                      <div className="cell label" style={{ width: "12%" }}>Dep.</div>
                      <div className="cell value" style={{ width: "39%" }}>{item?.depth_per}</div>
                    </div>

                    {/* Row 7 */}
                    <div className="frow">
                      <div className="cell label" style={{ width: "11%" }}>Flo.</div>
                      <div className="cell value" style={{ width: "39%" }}>
                        {item?.fluorescencename}
                      </div>
                      <div className="cell label" style={{ width: "12%" }}>Tab.</div>
                      <div className="cell value" style={{ width: "39%" }}>{item?.table_per}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default DiamondStock;