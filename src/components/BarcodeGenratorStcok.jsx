import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

const BarcodeGenratorStcok= ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && data) {
      JsBarcode(svgRef.current, data, {
        format: "CODE128",     // best for alphanumeric
        width: 1.5,              // line thickness
        height: 30,            // barcode height
        displayValue: false,   // hide text (since you show below)
        margin: 0,
      });
    }
  }, [data]);

  return <svg  ref={svgRef} />;
};

export default BarcodeGenratorStcok;