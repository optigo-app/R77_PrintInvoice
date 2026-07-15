import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../../assets/css/prints/Print1JewelleryBook.css";
import {
  apiCallHopsCoach,
  checkMsg,
  isObjectEmpty,
  handlePrint,
  handleImageError,
  fixedValues,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";

export default function Print1JewelleryBook({
  token,
  SpNo,
  SpVer,
  SV,
  evn,
  printName,
  urls,
}) {
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const [withImage, setWithImage] = useState(true);
  const [checkedItems, setCheckedItems] = useState({
    "On Hand": true,
    "Sold": false,
    "In Memo": false,
    "Purchase Return": false,
    "In Repair": false,
  });

  // New pagination state
  const itemsPerPage = 1000; // how many items per page to show
  const [currentPage, setCurrentPage] = useState(1);
  const statusKeys = ["On Hand", "Sold", "In Memo", "Purchase Return", "In Repair"];
  const isAnyStatusChecked = statusKeys.some((key) => checkedItems[key]);


  useEffect(() => {
    const sendData = async () => {
      try {
        const data = await apiCallHopsCoach({
          token,
          SpNo,
          SpVer,
          SV,
          evn,
          urls,
        });

        if (data?.Status === "200") {
          const isEmpty = isObjectEmpty(data?.Data);
          if (!isEmpty) {
            loadData(data?.Data);
            setResult(data?.Data);
          } else {
            setMsg("Data Not Found");
          }
        } else {
          const err = checkMsg(data?.Message);
          setMsg(err || data?.Message || "Unexpected error");
        }
      } catch (error) {
        console.error("API call error:", error);
        setMsg("Something went wrong.");
      } finally {
        setLoader(false);
      }
    };

    sendData();
  }, [token, SpNo, SpVer, SV, evn, urls]);

  const loadData = (res) => {
    const statusPriority = {
      "Sold": 1,
      "In Memo": 2,
      "On Hand": 3,
      "Purchase Return": 4,
      "In Repair": 5,
    };

    const extractPrefix = (str) => {
      const match = str?.match(/^[A-Za-z\-]+/);
      return match ? match[0].toUpperCase() : "ZZZ";
    };

    const extractNumber = (str) => {
      const match = str?.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    };

    if (Array.isArray(res?.DT)) {
      res.DT.sort((a, b) => {
        const aPriority = statusPriority[a?.Status] || 99;
        const bPriority = statusPriority[b?.Status] || 99;

        if (aPriority !== bPriority) return aPriority - bPriority;

        const nameA = (a?.Customer || "").toUpperCase();
        const nameB = (b?.Customer || "").toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;

        const invoiceA = a?.InvoiceNo || "";
        const invoiceB = b?.InvoiceNo || "";

        const prefixA = extractPrefix(invoiceA);
        const prefixB = extractPrefix(invoiceB);

        if (prefixA < prefixB) return -1;
        if (prefixA > prefixB) return 1;

        const numA = extractNumber(invoiceA);
        const numB = extractNumber(invoiceB);

        return numA - numB;
      });
    }
    setResult(res);
    setCurrentPage(1); // reset to first page on new data load
  };


  // Filtered and paginated items
  const filteredItems = useMemo(() => {
    return result?.DT?.filter(item => {
      const status = item?.Status || "";
      return checkedItems[status] || (status === "On Hand" && checkedItems["On Hand"]);
    }) || [];
  }, [result, checkedItems]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const visibleItems = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return filteredItems.slice(startIdx, endIdx);
  }, [filteredItems, currentPage, itemsPerPage]);


  // Print only current page items
  const handlePrintCurrentPage = () => {
    if (visibleItems.length === 0) return;
    let attempts = 0;
    const maxAttempts = 200;

    const waitForDOM = () => {
      requestAnimationFrame(() => {
        attempts++;
        const items = document.querySelectorAll(".col1");
        if (items.length >= visibleItems.length || attempts > maxAttempts) {
          handlePrint();
        } else {
          waitForDOM();
        }
      });
    };

    waitForDOM();
  };


  const getPageNumbers = () => {
    const pages = [];
    const totalPageCount = totalPages;
    const maxVisible = 5;
  
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + maxVisible - 1, totalPageCount);
  
    // Shift start if we're at the end to still show 5 pages
    if (end - start < maxVisible - 1) {
      start = Math.max(end - maxVisible + 1, 1);
    }
  
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  
    return pages;
  };
  

  const handleImageHideShow = useCallback(() => {
    if (!isAnyStatusChecked) return; // block toggling when no status is selected
    setWithImage(!withImage);
  }, [withImage, isAnyStatusChecked]);
  

  const handleCheckedChange = useCallback((e) => {
    const newCheckedItems = {
      ...checkedItems,
      [e.target.name]: e.target.checked,
    };
  
    const wasPreviouslyNoneChecked = !statusKeys.some((key) => checkedItems[key]);
    const isNowAnyChecked = statusKeys.some((key) => newCheckedItems[key]);
  
    // Auto-check 'With Image' if transitioning from none → some
    if (!wasPreviouslyNoneChecked && !isNowAnyChecked) {
      setWithImage(false);
    } else if (wasPreviouslyNoneChecked && isNowAnyChecked) {
      setWithImage(true);
    }
  
    setCheckedItems(newCheckedItems);
    setCurrentPage(1);
  }, [checkedItems]);  
  

  const imgPath = result?.DT1?.[0]?.ImageUploadLogicalPath || "";

  return loader ? (
    <Loader />
  ) : msg !== "" ? (
    <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">{msg}</p>
  ) : (
    <div className="MrgnSpac">
      <div className="w-full fil_sec">
        <div className="w-full flex prnt_btn mb-1">
          <input
            type="button"
            className="btn_white blue mt-0"
            value="Print"
            onClick={handlePrintCurrentPage}
          />
        </div>
        <div className="w-full flex justify-center align-center gap-4 mb-2">
          {["On Hand", "Sold", "In Memo", "Purchase Return", "In Repair"].map(status => (
            <label key={status} htmlFor={`Status${status.replace(" ", "")}`} className="inline-flex items-center cursor-pointer gap-2">
              <input
                type="checkbox"
                checked={checkedItems[status]}
                onChange={handleCheckedChange}
                name={status}
                id={`Status${status.replace(" ", "")}`}
              />
              {status}
            </label>
          ))}
          <label htmlFor="WithImage" className="inline-flex items-center cursor-pointer gap-2">
            <input
              type="checkbox"
              checked={withImage}
              onChange={handleImageHideShow}
              name="WithImage"
              id="WithImage"
              disabled={!isAnyStatusChecked}
            />
            with Image
          </label>
        </div>

        {/* Pagination controls */}
        {isAnyStatusChecked ? (
          <>
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              {getPageNumbers().map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={num === currentPage ? "active" : ""}
                >
                  {num}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-1 transition-opacity duration-200 ease-in-out">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </p>
          </>
        ) : (
          <p className="text-center text-danger fw-bold mt-2">
            At least select one checkbox from field.
          </p>
        )}

      </div>

      <div className="w-full flex items-center justify-center">
        <div className="container disflx">
          {visibleItems.map((e, i) => (
            <div key={i} className="col1 brbxAll spfntbH pagBrkIns">
              {e?.Customer ? <div className="w-100 brBtom spaclftTpm spacBtom spfntHead">{e?.Customer}</div> : <div className="minheit brBtom"></div>}
              {withImage && e?.ImageName !== "" && (
                <div className="w-100 brBtom imgwdtheit">
                  <img
                    src={`${imgPath}/${e?.ImageName}`}
                    loading="lazy"
                    alt="Design_Image"
                    onError={handleImageError}
                  />
                </div>
              )}
              <div className="w-100 spaclftTpm">
                <div className="w-100 spfntBld spbrWord spfntHead">{e?.DesNo}</div>
              </div>

              <div className="w-100 disflxCen spaclftTpm">
                  <div className="wdth_45 spbrWord">{e?.Status}</div>
                  {e?.JobNo !== "" ? (
                    <div className="spfntBld">|</div>
                  ) : null}
                  <div className="wdth_55 spacrighTpm spbrWord">{e?.JobNo}</div>
                </div>

                <div className="w-100 disflxCen spaclftTpm">
                  {e?.Metal_Type && (
                    <div className="wdth_45 spbrWord">{e?.Metal_Type}</div>
                  )}
                  {e?.Metal_Type ? (<div>|</div>) : null}
                  <div className={`${e?.Metal_Type !== "" ? "wdth_55 spacrighTpm" : "w-100 spfntlft"} spbrWord`}>
                    G.WT: {fixedValues(e?.Gross_Wt, 3)} gm
                  </div>
                </div>

                <div className="w-100 disflxCen spaclftTpm">
                  {e?.Metal_Color && (
                    <div className="wdth_45 spbrWord">{e?.Metal_Color}</div>
                  )}
                  {e?.Metal_Color ? (<div>|</div>) : null}
                  <div className={`${e?.Metal_Type !== "" ? "wdth_55 spacrighTpm" : "w-100 spfntlft"} spbrWord`}>
                    N.WT: {fixedValues(e?.Metal_Wt, 3)} gm
                  </div>
                </div>

                {(e?.Diam_Ctw || e?.CS_Ctw) ? (
                  <div className="w-100 disflxCen spaclftTpm">
                    <div className="wdth_45 spbrWord">
                      DIA: {e?.Diam_Ctw ? (`${fixedValues(e?.Diam_Ctw, 3)}`) : null}
                    </div>
                    {e?.CS_Ctw || e?.Misc_Ctw ? (<div>|</div>) : null}
                    <div className="wdth_55 spacrighTpm spbrWord">
                      {e?.CS_Ctw ? (`CS: ${fixedValues(e?.CS_Ctw, 3)}`) : e?.Misc_Ctw ? (`MISC: ${fixedValues(e?.Misc_Ctw, 3)}`) : null}
                    </div>
                  </div>
                ) : null}

                {e?.CS_Ctw && e?.Misc_Ctw ? (
                  <div className="w-100 disflx spaclftTpm spbrWord">
                    MISC: {fixedValues(e?.Misc_Ctw, 3)}
                  </div>
                ) : (null)}

                {e?.Inwardno ? (
                  <div className="w-100 disflx spaclftTpm spbrWord">
                    Inward: {e?.Inwardno}
                  </div>
                ) : (null)}

                {e?.Status === "Sold" && (
                  <div className="w-100 spbrWord disflx spaclftTpm">
                    Sale: {e?.InvoiceNo}
                  </div>
                )}

                {e?.Status === "In Memo" && (
                  <div className="w-100 disflx spbrWord spaclftTpm">
                    Memo: {e?.InvoiceNo}
                  </div>
                )}

                {e?.Status === "In Repair" && (
                  <div className="w-100 disflx spaclftTpm spbrWord">
                    Repair: {e?.InvoiceNo}
                  </div>
                )}

                {e?.Status === "Purchase Return" && (
                  <div className="w-100 disflx spaclftTpm spbrWord">
                    Pur. Return: {e?.InvoiceNo}
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
