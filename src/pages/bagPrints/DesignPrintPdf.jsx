import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import Loader from "../../components/Loader";
import { GetAlbumData } from "../../GlobalFunctions/GetAlbumData";
import "../../assets/css/bagprint/albumprint.css";

// Load an image URL and return { dataUrl (PNG), width, height }, or null on failure
const loadImage = async (url) => {
  if (!url) return null;

  const fromSrc = (src, cors) =>
    new Promise((resolve) => {
      const img = new Image();
      if (cors) img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext("2d").drawImage(img, 0, 0);
          resolve({
            dataUrl: canvas.toDataURL("image/png"),
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        } catch (e) {
          resolve(null); // tainted canvas
        }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });

  // 1st try: fetch -> blob -> data URL
  try {
    const res = await fetch(url, { mode: "cors" });
    if (res.ok) {
      const blob = await res.blob();
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const result = await fromSrc(dataUrl, false);
      if (result) return result;
    }
  } catch (e) {
    // fall through
  }

  // 2nd try: plain image element with CORS
  return fromSrc(url, true);
};

function DesignPdf({ queries }) {
  const [data, setData] = useState([]);
  const [headerdata, setHeaderdata] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const startedRef = useRef(false);

  // ───────── Fetch data ─────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allDatas = await GetAlbumData(queries, "designpdf");
        setData(allDatas?.rd || []);
        setHeaderdata(allDatas?.rd1 || []);
        setLoaded(true); // only on success
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ───────── Build + download PDF (no DOM / layout needed) ─────────
  const handleDownloadPdf = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 5;
      const topY = 5;

      // ----- header: banner (left) -----
      const banner = await loadImage(headerdata[0]?.PrintLogo);
      let headerBottom = topY;
      if (banner) {
        const maxH = 30;
        const maxW = 50;
        const ratio = Math.min(maxW / banner.width, maxH / banner.height);
        const w = banner.width * ratio;
        const h = banner.height * ratio;
        doc.addImage(banner.dataUrl, "PNG", marginX, topY, w, h);
        headerBottom = topY + h;
      }

      // ----- header: title (right) -----
      const titleText = `${queries?.companyname || ""} Design List For : ${
        queries?.manufacturer || "ALL MANUFACTURERS"
      }`;
      let dateText = "";
      if (queries?.fromdate && queries?.todate) {
        dateText = `Design Created Between : ${queries.fromdate} and ${queries.todate}`;
      } else if (queries?.fromdate) {
        dateText = `Design Created From : ${queries.fromdate}`;
      } else if (queries?.todate) {
        dateText = `Design Created Up To : ${queries.todate}`;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(titleText, pageWidth - marginX, topY + 8, { align: "right" });
      if (dateText) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(dateText, pageWidth - marginX, topY + 15, { align: "right" });
      }

      // ----- table -----
      const head = [
        [
          "SrNo",
          "Design#",
          "Category",
          "Sub Category",
          "Lab",
          "Act.Gross Wt",
          "Metal",
          "Diam Pcs",
          "Diam Ctw",
          "Diam Quality",
          "Diam Color",
          "CS Pcs",
          "CS Ctw",
        ],
      ];

      const body = data.map((item) => [
        item?.SrNo ?? "",
        item?.designno ?? "",
        item?.categoryname ?? "",
        item?.subcategoryname ?? "",
        item?.labname ?? "",
        Number(item?.ActualGrossweight || 0).toFixed(3),
        item?.metal ?? "",
        item?.diamondpcs ?? "",
        Number(item?.diamondctw || 0).toFixed(3),
        item?.quality ?? "",
        item?.colorname ?? "",
        item?.stonepcs ?? "",
        Number(item?.stonectw || 0).toFixed(3),
      ]);

      autoTable(doc, {
        head,
        body,
        startY: Math.max(headerBottom, topY + 20) + 4,
        margin: { left: marginX, right: marginX, bottom: 5 },
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 1.5,
          halign: "center",
          valign: "middle",
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          textColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        rowPageBreak: "avoid",
      });

      doc.save(`PDF_REPORT${Date.now()}.pdf`);
    } catch (error) {
      console.log("PDF Error:", error);
    } finally {
      setBusy(false);
    }
  };

  // ───────── Auto download once, right after the API succeeds ─────────
  useEffect(() => {
    if (!loaded || startedRef.current) return;
    startedRef.current = true;
    handleDownloadPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  if (!loaded) return <Loader />;

  return (
    <div className="container mt-4">
      <button
        id="download-pdf-btn"
        className="btn btn-danger px-2 py-1 fs-5"
        onClick={handleDownloadPdf}
        disabled={busy}
      >
        {busy ? "Generating..." : "Download as PDF"}
      </button>
    </div>
  );
}

export default DesignPdf;