import React, { useState, useEffect, useRef } from "react";
import ReactHTMLTableToExcel from "react-html-table-to-excel";

import Loader from "../../components/Loader";
import { GetAlbumData } from "../../GlobalFunctions/GetAlbumData";
import "../../assets/css/bagprint/albumprint.css";
import { handlePrint } from "../../GlobalFunctions/HandlePrint";

// etp can be plain ("excel") or base64 ("ZXhjZWw="). Default = print
const getContentType = (etp) => {
  const allowed = ["print", "excel", "pdf"];
  if (!etp) return "print";

  const raw = String(etp).toLowerCase();
  if (allowed.includes(raw)) return raw;

  try {
    const decoded = atob(String(etp)).toLowerCase();
    if (allowed.includes(decoded)) return decoded;
  } catch (e) {
    // not base64, ignore
  }
  return "print";
};

const waitForImages = (container) => {
  const imgs = Array.from(container?.querySelectorAll("img") || []);
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) return resolve();
          img.onload = resolve;
          img.onerror = resolve; // don't block the PDF on a broken image
        })
    )
  );
};

function DesignPrint({ queries, headers }) {
  const [data, setData] = useState([]);
  const [headerdata, setHeaderdata] = useState([]);
  const printRef = useRef(null);
  const pdfRef = useRef(null);
  const downloadedRef = useRef(false);

  const contentType = getContentType(queries?.etp);

  const bannerSrc = headerdata[0]?.PrintLogo || "";

  const titleText = queries?.companyname + "Design List For :";
  const datefilter =
    queries?.fromdate && queries?.todate ? (
      <>
        Design Created Between : <b>{queries.fromdate}</b> and <b>{queries.todate}</b>
      </>
    ) : queries?.fromdate ? (
      <>
        Design Created From : <b>{queries.fromdate}</b>
      </>
    ) : queries?.todate ? (
      <>
        Design Created Up To : <b>{queries.todate}</b>
      </>
    ) : null;
  const subTitleText = queries?.manufacturer || "ALL MANUFACTURERS";
  const fileName =
    contentType === "pdf" ? `PDF_REPORT${Date.now()}` : `DESIGN_REPORT${Date.now()}`;

  // ───────── Fetch data ─────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allDatas = await GetAlbumData(queries,"DesignPrint");
        setData(allDatas?.rd || []);
        setHeaderdata(allDatas?.rd1 || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ───────── Silent PDF download (html2pdf.js, table-based layout) ─────────
  const handleDownloadPdf = async () => {
    try {
      await waitForImages(pdfRef.current);

      // wait for any custom fonts to finish loading
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      // force the browser to actually paint before we capture it
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );

      window.scrollTo(0, 0);

      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 5,
          filename: `${fileName}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, scrollY: 0, allowTaint: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
          pagebreak: { mode: ["css", "legacy"], avoid: "tr" },
        })
        .from(pdfRef.current)
        .save();
    } catch (error) {
      console.log("PDF Error:", error);
    }
  };

  // ───────── Auto download (excel / pdf) ─────────
  useEffect(() => {
    if (!data?.length || downloadedRef.current) return;

    if (contentType === "excel") {
      downloadedRef.current = true;
      const timer = setTimeout(() => {
        const btn = document.getElementById("design-xls-button");
        if (btn) btn.click();
      }, 500);
      return () => clearTimeout(timer);
    }

    if (contentType === "pdf") {
      downloadedRef.current = true;
      const timer = setTimeout(() => {
        handleDownloadPdf();
      }, 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, headerdata, contentType]);

  if (data?.length === 0) return <Loader />;

  // ═════════════════════ EXCEL (table structure) — unchanged ═════════════════════
  if (contentType === "excel") {
    const th = {
      border: "1px solid black",
      padding: "4px",
      textAlign: "center",
      fontWeight: "bold",
    };
    const td = {
      border: "1px solid black",
      padding: "4px",
      textAlign: "center",
    };

    return (
      <div className="container mt-4">
        <ReactHTMLTableToExcel
          id="design-xls-button"
          className="download-table-xls-button btn btn-success text-black bg-success px-2 py-1 fs-5"
          table="design-table-to-xls"
          filename={fileName}
          sheet="DesignList"
          buttonText="Download as XLS"
        />
        <table id="design-table-to-xls">
          <tbody>
            <tr>
              <td colSpan={7} style={{ height: "200px", verticalAlign: "middle" }}>
                {bannerSrc && <img src={bannerSrc} alt="banner" width={300} height={200} />}
              </td>
              <td
                colSpan={6}
                style={{ textAlign: "right", verticalAlign: "middle", fontSize: "16px" }}
              >
                {titleText} <b>{subTitleText}</b>
                <br />
                {datefilter}
              </td>
            </tr>
            <tr>
              <th style={th}>SrNo</th>
              <th style={th}>Design#</th>
              <th style={th}>Category</th>
              <th style={th}>Sub Category</th>
              <th style={th}>Lab</th>
              <th style={th}>Act.Gross Wt</th>
              <th style={th}>Metal</th>
              <th style={th}>Diam Pcs</th>
              <th style={th}>Diam Ctw</th>
              <th style={th}>Diam Quality</th>
              <th style={th}>Diam Color</th>
              <th style={th}>CS Pcs</th>
              <th style={th}>CS Ctw</th>
            </tr>
            {data?.map((item, index) => (
              <tr key={item?.id ?? index}>
                <td style={td}>{item?.SrNo}</td>
                <td style={td}>{item?.designno}</td>
                <td style={td}>{item?.categoryname}</td>
                <td style={td}>{item?.subcategoryname}</td>
                <td style={td}>{item?.labname}</td>
                <td style={td}>{Number(item?.ActualGrossweight || 0).toFixed(3)}</td>
                <td style={td}>{item?.metal}</td>
                <td style={td}>{item?.diamondpcs}</td>
                <td style={td}>{Number(item?.diamondctw || 0).toFixed(3)}</td>
                <td style={td}>{item?.quality}</td>
                <td style={td}>{item?.colorname}</td>
                <td style={td}>{item?.stonepcs}</td>
                <td style={td}>{Number(item?.stonectw || 0).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ═════════════════════ PDF (excel-style table, printed via react-to-print) ═════════════════════
  if (contentType === "pdf") {
    const th = {
      border: "1px solid black",
      padding: "4px",
      textAlign: "center",
      fontWeight: "bold",
    };
    const td = {
      border: "1px solid black",
      padding: "4px",
      textAlign: "center",
    };

    return (
      <div className="container mt-4">
        <button className="btn btn-danger px-2 py-1 fs-5" onClick={handleDownloadPdf}>
          Download as PDF
        </button>

        <div ref={pdfRef}>
          <table id="design-table-to-pdf" style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td colSpan={7} style={{ height: "200px", verticalAlign: "middle" }}>
                  {bannerSrc && <img src={bannerSrc} alt="banner" width={200} height={200} />}
                </td>
                <td
                  colSpan={6}
                  style={{ textAlign: "right", verticalAlign: "middle", fontSize: "16px" }}
                >
                  {titleText} <b>{subTitleText}</b>
                  <br />
                  {datefilter}
                </td>
              </tr>
              <tr>
                <th style={th}>SrNo</th>
                <th style={th}>Design#</th>
                <th style={th}>Category</th>
                <th style={th}>Sub Category</th>
                <th style={th}>Lab</th>
                <th style={th}>Act.Gross Wt</th>
                <th style={th}>Metal</th>
                <th style={th}>Diam Pcs</th>
                <th style={th}>Diam Ctw</th>
                <th style={th}>Diam Quality</th>
                <th style={th}>Diam Color</th>
                <th style={th}>CS Pcs</th>
                <th style={th}>CS Ctw</th>
              </tr>
              {data?.map((item, index) => (
                <tr key={item?.id ?? index}>
                  <td style={td}>{item?.SrNo}</td>
                  <td style={td}>{item?.designno}</td>
                  <td style={td}>{item?.categoryname}</td>
                  <td style={td}>{item?.subcategoryname}</td>
                  <td style={td}>{item?.labname}</td>
                  <td style={td}>{Number(item?.ActualGrossweight || 0).toFixed(3)}</td>
                  <td style={td}>{item?.metal}</td>
                  <td style={td}>{item?.diamondpcs}</td>
                  <td style={td}>{Number(item?.diamondctw || 0).toFixed(3)}</td>
                  <td style={td}>{item?.quality}</td>
                  <td style={td}>{item?.colorname}</td>
                  <td style={td}>{item?.stonepcs}</td>
                  <td style={td}>{Number(item?.stonectw || 0).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ═════════════════════ PRINT (div layout) — unchanged ═════════════════════
  return (
    <div className="dp_container" ref={printRef}>
      {contentType === "print" && (
        <div className="printbtn">
          <div className="pbtn" style={{ border: "1px solid #CBCBCB", borderRadius: "4px" }}>
            <input
              type="button"
              id="btnprint"
              value="Print"
              onClick={(e) => handlePrint(e)}
              accessKey="p"
              autoFocus
              style={{
                display: "inline-block",
                borderLeft: "4px solid #5994BB",
                cursor: "pointer",
                padding: "5px 7px",
              }}
            />
          </div>
        </div>
      )}

      {/* ───────── Header ───────── */}
      <div className="dp_header">
        <div className="dp_header_left">
          <img className="dp_banner" src={bannerSrc} alt="banner" crossOrigin="anonymous" />
        </div>
        <div className="dp_header_right">
          <span>
            {titleText} <b>{subTitleText}</b>
          </span>

          <div>
            <span>{datefilter}</span>
          </div>
        </div>
      </div>

      {/* ───────── Table ───────── */}
      <div className="dp_table">
        {/* Table head */}
        <div className="dp_row">
          <div className="dp_cell dp_head_cell col_srno">SrNo</div>
          <div className="dp_cell dp_head_cell col_image">Image</div>
          <div className="dp_cell dp_head_cell col_design">Design#</div>
          <div className="dp_cell dp_head_cell col_category">Category</div>
          <div className="dp_cell dp_head_cell col_subcategory">Sub Category</div>
          <div className="dp_cell dp_head_cell col_lab">Lab</div>
          <div className="dp_cell dp_head_cell col_grosswt">Act.Gross Wt</div>
          <div className="dp_cell dp_head_cell col_metal">Metal</div>
          <div className="dp_cell dp_head_cell col_dpcs">Diam Pcs</div>
          <div className="dp_cell dp_head_cell col_dctw">Diam Ctw</div>
          <div className="dp_cell dp_head_cell col_dquality">Diam Quality</div>
          <div className="dp_cell dp_head_cell col_dcolor">Diam Color</div>
          <div className="dp_cell dp_head_cell col_cspcs">CS Pcs</div>
          <div className="dp_cell dp_head_cell col_csctw">CS Ctw</div>
        </div>

        {/* Table body */}
        {data?.map((item, index) => (
          <div className="dp_row dp_body_row" key={item?.id ?? index}>
            <div className="dp_cell col_srno">{item?.SrNo}</div>
            <div className="dp_cell col_image">
              {item?.img_url ? (
                <img
                  className="dp_img"
                  src={item?.img_url}
                  alt={item?.designno}
                  crossOrigin="anonymous"
                  onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                />
              ) : (
                <div className="dp_img_placeholder" />
              )}
            </div>
            <div className="dp_cell col_design">{item?.designno}</div>
            <div className="dp_cell col_category">{item?.categoryname}</div>
            <div className="dp_cell col_subcategory">{item?.subcategoryname}</div>
            <div className="dp_cell col_lab">{item?.labname}</div>
            <div className="dp_cell col_grosswt">
              {Number(item?.ActualGrossweight || 0).toFixed(3)}
            </div>
            <div className="dp_cell col_metal">{item?.metal}</div>
            <div className="dp_cell col_dpcs">{item?.diamondpcs}</div>
            <div className="dp_cell col_dctw">{Number(item?.diamondctw || 0).toFixed(3)}</div>
            <div className="dp_cell col_dquality">{item?.quality}</div>
            <div className="dp_cell col_dcolor">{item?.colorname}</div>
            <div className="dp_cell col_cspcs">{item?.stonepcs}</div>
            <div className="dp_cell col_csctw">{Number(item?.stonectw || 0).toFixed(3)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DesignPrint;