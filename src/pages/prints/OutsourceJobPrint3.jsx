import React, { useEffect, useState } from "react";
import "../../assets/css/prints/outsourceJobPrint.css";
import {
  apiCall,
  checkMsg,
  fixedValues,
  handleImageError,
  handlePrint,
  isObjectEmpty,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";

 
const formatDate = (str) => {
  const m = /\/Date\((-?\d+)/.exec(str || "");
  if (!m) return "";
  return new Date(Number(m[1])).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

const sum = (arr, key) => arr.reduce((s, r) => s + (Number(r?.[key]) || 0), 0);

 
const isPrintMisc = (r) => r?.StoneTypeid === 3 && r?.Quality !== "-";

 
const isFindingRow = (r) =>
  r?.StoneTypeid === 5 || String(r?.ItemName || "").trim().toUpperCase() === "FINDING";

 
const rmCodeBase = (item) => {
 
  if (isFindingRow(item)) {
    return [item?.FindingAccessories || item?.FindingType, item?.Quality, item?.color]
      .map((v) => (typeof v === "string" ? v.trim() : v))
      .filter((v) => v && v !== "-")
      .join("/");
  }
  return [item?.Shape_Code || item?.shape, item?.Quality_Code, item?.Color_Code]
    .map((v) => (typeof v === "string" ? v.trim() : v))
    .filter((v) => v && v !== "-")
    .join("/");
};

 
const solGemSuffix = (item) => {
  if (Number(item?.IsSolGem) !== 1) return "";
  if (item?.StoneTypeid === 1) return ":S";
  if (item?.StoneTypeid === 2) return ":G";
  return "";
};

 
const rmCode = (item) => {
  const base = rmCodeBase(item);
  if (!base) return "";
  return `${base}${solGemSuffix(item)}`;
};

 
const rowKey = (item) =>
  `${rmCodeBase(item).toLowerCase()}|${String(item?.SizeName || "")
    .replace(/\s+/g, "")
    .toLowerCase()}`;

const toItem = (r, isIssue = false) => ({
  ...r,
  Pcs: Number(r?.pieces) || 0,
  Wt: Number(r?.Weight) || 0,
  SizeName: r?.Size || "",
  ismiscwtaddingrossweight: 1,
  isIssue,  
});

 
const buildJobs = (rows = []) => {
  const grouped = new Map();
  rows.forEach((r) => {
    if (!grouped.has(r?.JobNo)) grouped.set(r?.JobNo, []);
    grouped.get(r?.JobNo).push(r);
  });

  const jobs = [];
  grouped.forEach((allRows, jobNo) => {
    const quote = allRows
      .filter((r) => r?.MatFrom === "Quote")
      .sort((a, b) => a?.id - b?.id);
    if (quote.length === 0) return;

    const issue = allRows.filter((r) => r?.MatFrom === "IssueMaterial");

    const first = quote[0];
    const issueRow = issue[0];

    const metalRows = quote.filter((r) => r?.StoneTypeid === 4);
    const findingRows = quote.filter((r) => r?.StoneTypeid === 5);

    // Quote rows first; if an IssueMaterial row has the SAME RM CODE + SIZE,
    // ONLY the Issue row is shown (Quote row is hidden) and it prints bold.
    // Issue rows with no matching Quote row are added at the end.
    const pick = (type, filterFn = () => true) => {
      // `type` = StoneTypeid number, or a function (used for finding)
      const matchType = (r) =>
        typeof type === "function" ? type(r) : r?.StoneTypeid === type;

      const q = quote
        .filter((r) => matchType(r) && filterFn(r))
        .map((r) => toItem(r, false));

      const i = issue
        .filter((r) => matchType(r) && filterFn(r))
        .map((r) => toItem(r, true));

      // group issue rows by RM CODE + SIZE
      const issueByKey = new Map();
      i.forEach((it) => {
        const k = rowKey(it);
        if (!issueByKey.has(k)) issueByKey.set(k, []);
        issueByKey.get(k).push(it);
      });

      const usedKeys = new Set();
      const merged = [];
      q.forEach((qi) => {
        const k = rowKey(qi);
        if (issueByKey.has(k)) {
          // same data in both -> show only the Issue row(s) at the Quote row's position
          if (!usedKeys.has(k)) {
            usedKeys.add(k);
            merged.push(...issueByKey.get(k));
          }
          // else: duplicate Quote row of the same key -> skipped
        } else {
          merged.push(qi);
        }
      });

      // Issue rows that have no matching Quote row
      const extraIssue = i.filter((it) => !usedKeys.has(rowKey(it)));

      // `quote` stays Quote-only (used for header DIA / CST / MISC / GR. WT.)
      return { quote: q, all: [...merged, ...extraIssue] };
    };

    const dia = pick(1);
    const cst = pick(2);
    const msc = pick(3, isPrintMisc);
    const fin = pick(isFindingRow);

    const diamonds = dia.all;
    const colorStones = cst.all;
    const mics = msc.all;
    const findings = fin.all;

    // header weights (DIA / CST / GR. WT.) stay Quote-only
    // const netWt = sum(metalRows, "Weight") + sum(findingRows, "Weight");
    // const diaWt = sum(dia.quote, "Wt");
    // const cstWt = sum(cst.quote, "Wt");
    // const miscWt = sum(msc.quote, "Wt");
    // const grosswt = netWt + (diaWt + cstWt) / 5 + miscWt;
    // header weights use the same merged rows (Issue replaces Quote) as the table totals
const netWt = sum(metalRows, "Weight") + sum(findingRows, "Weight");
const diaWt = sum(dia.all, "Wt");
const cstWt = sum(cst.all, "Wt");
const miscWt = sum(msc.all, "Wt");
const grosswt = netWt + (diaWt + cstWt) / 5 + miscWt;

    const primary = metalRows[0] || findingRows[0];

    jobs.push({
      SrJobno: String(jobNo),
      J_JobNo: jobNo,
      designno: first?.designno ?? first?.DesignNo ?? "",
      bgurgencycolor: first?.colorcode ?? "",
      fontcolorcode: first?.fontcolorcode ?? "",
      MasterManagement_priorityname: first?.MasterManagement_priorityname ?? "",

      DesignImage: first?.DesignImage ?? "",
      JobRemark: first?.JobRemark ?? "",
      JobSKUNo: first?.SKUNO,
      EntryDate: formatDate(first?.JobDate), // ODR. DT.
      HeaderDate: formatDate(first?.JobDate), // DATE
      PromiseDate: formatDate(first?.promisedate), // DEL. DT.
      Manufacturer: issueRow?.Manufacturer ?? first?.Manufacturer,
      Customercode: first?.Job_customercode,
      Size: first?.JobSize ?? "",
      grosswt,
      NetWt: netWt,
      metals: primary
        ? [
            {
              IsPrimaryMetal: 1,
              QualityName: primary?.Quality || "-",
              Colorname: primary?.color || "-",
            },
          ]
        : [],
      diamonds,
      colorStones,
      mics,
      findings,
      diamondTotal: { weight: diaWt },
      colorStonesTotal: { weight: cstWt },
      miscQuoteWt: miscWt, // header MISC weight (Quote rows only)
    });
  });
  return jobs;
};
 

const OutsourceJobPrint3 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  const [json2Data, setJson2Data] = useState([]);
  const [imageLoading, setImageLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);

  const loadData = (data) => {
    setJson2Data(buildJobs(data?.BillPrint_Json));
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

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const buildMaterialRows = (e) => {
    const maxPerSide = 12;
    const maxTotalRows = 24;

    const addRowsWithTotal = (items, type, filterFn = null) => {
      if (!Array.isArray(items) || items.length === 0) return [];

      const filteredItems = filterFn ? items.filter(filterFn) : items;
      if (filteredItems.length === 0) return [];

      const rows = filteredItems.map((item) => ({ type, data: item }));

      const totalPcs = filteredItems.reduce((s, c) => s + (Number(c?.Pcs) || 0), 0);
      const totalWt = filteredItems.reduce((s, c) => s + (Number(c?.Wt) || 0), 0);

      return [...rows, { type: `${type}-total`, totalPcs, totalWt }];
    };

    const diamondRows = addRowsWithTotal(e?.diamonds, "diamond");
    const colorStoneRows = addRowsWithTotal(e?.colorStones, "colorStone");
    const miscRows = addRowsWithTotal(
      e?.mics,
      "misc",
      (item) => Number(item?.ismiscwtaddingrossweight) === 1
    );

    const findingRows = addRowsWithTotal(e?.findings, "finding");

    let combinedRows = [...diamondRows, ...colorStoneRows, ...miscRows, ...findingRows];

    if (combinedRows.length > maxTotalRows) {
      combinedRows = combinedRows.slice(0, maxTotalRows);
    }

    const leftRows = combinedRows.slice(0, maxPerSide);
    const rightRows = combinedRows.slice(maxPerSide, maxTotalRows);

    while (leftRows.length < maxPerSide) leftRows.push({ type: "empty" });
    while (rightRows.length < maxPerSide) rightRows.push({ type: "empty" });

    return { leftRows, rightRows };
  };

  
  const countMicsWt = json2Data?.map((job) => ({
    jobId: job?.SrJobno ?? null,
    totalWt: Number(job?.miscQuoteWt) || 0,
  }));

  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <>
          {/* print button */}
          <div className="d-flex justify-content-end align-items-center print_sec_sum4 pb-4 mt-5">
            <div className="form-check ps-3">
              <input
                type="button"
                className="btn_white blue mt-0"
                value="Print"
                onClick={(e) => handlePrint(e)}
              />
            </div>
          </div>
          <div className="spdispFlx1">
            {json2Data?.map((e, index) => {
              const { leftRows, rightRows } = buildMaterialRows(e);
              return (
                <React.Fragment key={index}>
                  <div className="mainWdthHeit spBtomspc">
                    <div className="w-100">
                      {/** Left Side Section */}
                      <div className="spdispFlxClum w-100 spdtl1">
                        <div className="spMrgdt1">
                          <div className="spdispFlx spbrdrLftDR spbrdrTopDR spbrdRghtDR">
                            <div className="Suspdtl1 spBold spbrdRght sptxtend spbrdrBtom estimatePrintFont_9">JOB NO</div>
                            <div className="Suspdtl2 spbrdRght sptxtend spbrdrBtom estimatePrintFont_9">{e?.J_JobNo}</div>
                            <div className="Suspdtl3 sptxtend spbrdrBtom">
                              <div className="spdispFlx">
                                <p className="spBold estimatePrintFont_9">DESIGN -&nbsp;</p> <span className="estimatePrintFont_9 spBold">{e?.designno}</span>
                              </div>
                            </div>
                          </div>

                          <div className="spdispFlx spbrdrLftDR spbrdRghtDR">
                            <div className="Suspdtl1">
                              <div className="spBold spbrdRght sptxtend spbrdrBtom estimatePrintFont_9">DATE</div>
                              <div className="spBold spbrdRght sptxtend spbrdrBtom estimatePrintFont_9">MFG CODE</div>
                              <div className="spBold spbrdRght sptxtend spbrdrBtom estimatePrintFont_9">CUST</div>
                              <div className="spBold spbrdRght sptxtend spbrdrBtom estimatePrintFont_9">ORDER</div>
                              <div className="spBold spbrdRght sptxtend spbrdrBtom estimatePrintFont_9">ODR. DT.</div>
                              <div className="spBold spbrdRght sptxtend spbrdrBtom estimatePrintFont_9">DEL. DT.</div>
                              <div className="spBold spbrdRght sptxtend spbrdrBtom estimatePrintFont_9">GR. WT.</div>
                              <div className="spBold spbrdRght sptxtend spbrdrBtom estimatePrintFont_9">NET WT.</div>
                              <div className="spBold spbrdRght sptxtend spbrdrBtom estimatePrintFont_9">{e?.diamondTotal?.weight !== 0 ? "DIA" : ""}</div>
                              <div className="spBold spbrdRght sptxtend spbrdrBtomDR estimatePrintFont_9">{e?.colorStonesTotal?.weight !== 0 ? "CST" : ""}</div>
                            </div>
                            <div className="Suspdtl2">
                              <div className="sptxtend spbrdRght spbrdrBtom estimatePrintFont_9">{e?.HeaderDate}</div>
                              <div className="spbrdRght sptxtend spbrdrBtom estimatePrintFont_9">{e?.Manufacturer}</div>
                              <div className="spbrdRght sptxtend spbrdrBtom estimatePrintFont_9">{e?.Customercode}</div>
                              <div className="spbrdRght sptxtend spbrdrBtom estimatePrintFont_9">{e?.JobSKUNo}</div>
                              <div className="spbrdRght sptxtend spbrdrBtom estimatePrintFont_9">{e?.EntryDate}</div>
                              <div className="spbrdRght sptxtend spbrdrBtom estimatePrintFont_9">{e?.PromiseDate}</div>
                              <div className="spbrdRght spbrdrBtom estimatePrintFont_9 spdispFlx">
                                <div className="subwidthHed spnHitArtisn">{fixedValues(e?.grosswt, 3)}</div>
                                <div
                                  className={`subwidthHed spBold spnHitArtisn 
                                    ${e?.metals?.some(
                                      (m) => m?.IsPrimaryMetal === 1 && (m?.QualityName !== "-" || m?.Colorname !== "-")
                                    )
                                      ? "spbrdrLftDR spbrdRght"
                                      : ""
                                    }`}
                                >
                                  {e?.metals?.filter((filter) => filter?.IsPrimaryMetal === 1)?.map((ep, i) => (
                                    <React.Fragment key={i}>
                                      {(ep?.IsPrimaryMetal === 1 && ep?.QualityName !== "-") || ep?.Colorname !== "-" ? "COL" : ""}
                                    </React.Fragment>
                                  ))}
                                </div>
                                <div className="subwidthHed spnHitArtisn">
                                  {e?.metals?.filter((filter) => filter?.IsPrimaryMetal === 1)?.map((ep, i) => (
                                    <React.Fragment key={i}>
                                      {ep?.IsPrimaryMetal === 1 && ep?.Colorname}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                              <div className="spbrdRght spbrdrBtom estimatePrintFont_9 spdispFlx">
                                <div className="subwidthHed spnHitArtisn">{fixedValues(e?.NetWt, 3)}</div>
                                <div
                                  className={`subwidthHed spBold spnHitArtisn 
                                    ${e?.metals?.some(
                                      (m) => m?.IsPrimaryMetal === 1 && (m?.QualityName !== "-" || m?.Colorname !== "-")
                                    )
                                      ? "spbrdrLftDR spbrdRght"
                                      : ""
                                    }`}
                                >
                                  {e?.metals?.filter((filter) => filter?.IsPrimaryMetal === 1)?.map((ep, i) => (
                                    <React.Fragment key={i}>
                                      {(ep?.IsPrimaryMetal === 1 && ep?.QualityName !== "-") || ep?.Colorname !== "-" ? "KT" : ""}
                                    </React.Fragment>
                                  ))}
                                </div>
                                <div className="subwidthHed spnHitArtisn">
                                  {e?.metals?.filter((filter) => filter?.IsPrimaryMetal === 1)?.map((ep, i) => (
                                    <React.Fragment key={i}>
                                      {ep?.IsPrimaryMetal === 1 && ep?.QualityName}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                              <div className="spbrdRght spbrdrBtom estimatePrintFont_9 spdispFlx">
                                <div className="subwidthHed spnHitCsMs">{e?.diamondTotal?.weight !== 0 ? fixedValues(e?.diamondTotal?.weight, 3) : ""}</div>
                                <div className={`subwidthHed spBold ${e?.Size !== "" ? "spbrdrLftDR spbrdRght" : ""} spnHitCsMs`}>{e?.Size !== "" ? "SIZE" : ""}</div>
                                <div className="subwidthHed spnHitCsMs">{e?.Size}</div>
                              </div>
                              <div className="spbrdRght spbrdrBtomDR estimatePrintFont_9 spdispFlx">
                                <div className="subwidthHed spnHitCsMs">{e?.colorStonesTotal?.weight !== 0 ? fixedValues(e?.colorStonesTotal?.weight, 3) : ""}</div>
                                {(() => {
                                  const matchingMic = countMicsWt?.find((job) => job?.jobId === e?.SrJobno);
                                  return (
                                    matchingMic && (
                                      <>
                                        <div className={`subwidthHed spnHitCsMs ${matchingMic.totalWt !== 0 ? "spbrdrLftDR spbrdRght" : ""} spBold`}>
                                          {matchingMic.totalWt !== 0 ? "MISC" : ""}
                                        </div>
                                        <div className="subwidthHed spnHitCsMs">
                                          {matchingMic.totalWt !== 0 ? fixedValues(matchingMic.totalWt, 3) : ""}
                                        </div>
                                      </>
                                    )
                                  );
                                })()}
                              </div>
                            </div>
                            <div className="Suspdtl3 spbrdrBtomDR">
                              <img
                                src={e?.DesignImage}
                                alt=""
                                className="estimate_img spdispFlx"
                                onError={handleImageError}
                                onLoad={handleImageLoad}
                              />
                            </div>
                          </div>

                          <div
                            className="spBold sptxtend spbrdrLftDR spbrdRghtDR spbrdrBtomDR text-center spnfntIns spMrgBFive spMrgTFive"
                            style={{ height: "20px" }}
                          >
                            DIAMOND / COLORSTONE / MISC / FINDING
                          </div>
                        </div>
                      </div>

                      {/** Right Side Section */}
                      <div className="spdtl2 spbrdRghtDR spbrdrLftDR">
                        <div className="spdispFlx">
                          <div className="dtlWdth1 spbrdRght spbrdrBtomDR estimatePrintFont_9 sptxtCn spBold sptxtend">RM CODE</div>
                          <div className="dtlWdth2 spbrdRght spbrdrBtomDR estimatePrintFont_9 sptxtCn spBold sptxtend">SIZE</div>
                          <div className="dtlWdth3 spbrdRght spbrdrBtomDR estimatePrintFont_9 sptxtCn spBold sptxtend">PCS</div>
                          <div className="dtlWdth4 spbrdRghtDR spbrdrBtomDR estimatePrintFont_9 sptxtCn spBold sptxtend">WT</div>
                          <div className="dtlWdth5 spbrdRght spbrdrBtomDR estimatePrintFont_9 sptxtCn spBold sptxtend">RM CODE</div>
                          <div className="dtlWdth6 spbrdRght spbrdrBtomDR estimatePrintFont_9 sptxtCn spBold sptxtend">SIZE</div>
                          <div className="dtlWdth7 spbrdRght spbrdrBtomDR estimatePrintFont_9 sptxtCn spBold sptxtend">PCS</div>
                          <div className="dtlWdth8 spbrdrBtomDR estimatePrintFont_9 sptxtCn spBold sptxtend">WT</div>
                        </div>

                        {/* Left and Right Rows Together */}
                        {leftRows.map((leftRow, i) => {
                          const rightRow = rightRows[i];

                          const renderRow = (row, side) => {
                            if (row.type === "empty") {
                              return (
                                <>
                                  <div className={`dtlWdth${side === "left" ? 1 : 5} spbrdRght spbrdrBtom estimatePrintFont_14 Sesptxtend`}></div>
                                  <div className={`dtlWdth${side === "left" ? 2 : 6} spbrdRght spbrdrBtom estimatePrintFont_14 Sesptxtend`}></div>
                                  <div className={`dtlWdth${side === "left" ? 3 : 7} spbrdRght spbrdrBtom estimatePrintFont_14 Sesptxtend`}></div>
                                  <div className={`dtlWdth${side === "left" ? 4 : 8} ${side === "left" ? "spbrdRghtDR" : ""} spbrdrBtom estimatePrintFont_14 Sesptxtend`}></div>
                                </>
                              );
                            }

                            if (row.type.endsWith("-total")) {
                              const label = row.type.startsWith("diamond")
                                ? "D TOTAL"
                                : row.type.startsWith("colorStone")
                                ? "C TOTAL"
                                : row.type.startsWith("misc")
                                ? "M TOTAL"
                                : row.type.startsWith("finding")
                                ? "F TOTAL"
                                : "TOTAL";

                              return (
                                <>
                                  <div className={`dtlWdth${side === "left" ? 1 : 5} estimatePrintFont_9 spbrdRght spbrdrBtom Sesptxtend spBold`}>
                                    {label}
                                  </div>
                                  <div className={`dtlWdth${side === "left" ? 2 : 6} estimatePrintFont_9 spbrdRght spbrdrBtom Sesptxtend`} />
                                  <div className={`dtlWdth${side === "left" ? 3 : 7} estimatePrintFont_9 spbrdRght spbrdrBtom Sesptxtend spBold`}>
                                    {row.totalPcs || 0}
                                  </div>
                                  <div className={`dtlWdth${side === "left" ? 4 : 8} estimatePrintFont_9 ${side === "left" ? "spbrdRghtDR" : ""} spbrdrBtom Sesptxtend spBold`}>
                                    {row.totalWt != null ? fixedValues(row.totalWt, 3) : "0.000"}
                                  </div>
                                </>
                              );
                            }

                            // Regular row (IssueMaterial rows are bold)
                            const item = row.data;
                            const boldStyle = item?.isIssue ? { fontWeight: 700 } : undefined;
                            return (
                              <>
                                <div style={boldStyle} className={`dtlWdth${side === "left" ? 1 : 5} spbrdRght spbrdrBtom estimatePrintFont_141 Sesptxtend`}>
                                  <p className="" style={boldStyle}>{rmCode(item)}</p>
                                </div>
                                <div style={boldStyle} className={`dtlWdth${side === "left" ? 2 : 6} spbrdRght spbrdrBtom estimatePrintFont_14 Sesptxtend`}>
                                  {item?.SizeName || ""}
                                </div>
                                <div style={boldStyle} className={`dtlWdth${side === "left" ? 3 : 7} spbrdRght spbrdrBtom estimatePrintFont_14 Sesptxtend`}>
                                  {item?.Pcs || ""}
                                </div>
                                <div style={{ ...boldStyle, textDecoration: item?.isIssue ? "underline" : "" }} className={`dtlWdth${side === "left" ? 4 : 8} ${side === "left" ? "spbrdRghtDR" : ""} spbrdrBtom estimatePrintFont_14 Sesptxtend`}>
                                  {item?.Wt != null ? fixedValues(item?.Wt, 3) : ""}
                                </div>
                              </>
                            );
                          };

                          return (
                            <div key={`row-${i}`} className="spdispFlx">
                              {renderRow(leftRow, "left")}
                              {renderRow(rightRow, "right")}
                            </div>
                          );
                        })}

                        <div className="spbrdrTop spbrdrBtomDR">
                          <div className="spdispFlx spbrdrBtomDR">
                            <div className="spdispFlx spHitIns spbrdRghtDR" style={{ width: "82%" }}>
                              <div className="spnfntArtisn spbrWord" style={{ lineHeight: "12px" }}>
                                <b>Instruction :</b> &nbsp;{e?.JobRemark}
                              </div>
                            </div>
                            <div className="spHitIns spWdthIns" style={{ width: "19%", backgroundColor: e?.bgurgencycolor, fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>{e?.MasterManagement_priorityname} </div>
                          </div>
                          <div className="spdispFlx w-100">
                            <div className="spnHitArtisn spBold spnfntArtisn w-100">STMP INSTR :</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">{msg}</p>
      )}
    </>
  );
};

export default OutsourceJobPrint3;