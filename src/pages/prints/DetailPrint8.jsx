import React, { useEffect, useState } from "react";
import style from "../../assets/css/prints/detailPrint8.module.css";
import {
  FooterComponent,
  HeaderComponent,
  NumberWithCommas,
  apiCall,
  checkMsg,
  fixedValues,
  handleImageError,
  handlePrint,
  isObjectEmpty,
  otherAmountDetail,
  taxGenrator,
} from "../../GlobalFunctions";
import footer2 from "../../assets/css/footers/footer2.module.css";
import Loader from "../../components/Loader";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { ToWords } from "to-words";
import { cloneDeep } from "lodash";

const DetailPrint8 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  const [loader, setLoader] = useState(true);
  const [msg, setMsg] = useState("");
  const [data, setData] = useState([]);
  const [headerData, setHeaderData] = useState({});
  const [footer, setFooter] = useState(null);
  const [header, setHeader] = useState(null);
  const [taxes, setTaxes] = useState([]);
  const [headers, setHeaders] = useState(null);
  const [miscss, setMiscss] = useState({
    Wt: 0,
    Pcs: 0,
  });
  const toWords = new ToWords();
  const [custAddress, setCustAddress] = useState([]);
  const loadData = (data) => {
    let heads = HeaderComponent("3", data?.BillPrint_Json[0]);
    setHeaders(heads);
    setHeaderData(data?.BillPrint_Json[0]);
    let totalMaterialAmount = 0;
    let footers = FooterComponent("2", data?.BillPrint_Json[0]);
    setFooter(footers);
    let headers = HeaderComponent("1", data?.BillPrint_Json[0]);
    setHeader(headers);
    let address = data?.BillPrint_Json[0]?.Printlable.split("\r\n");
    setCustAddress(address);
    let datas = OrganizeDataPrint(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );
    let arr = [];
    let miscses = {
      Wt: 0,
      Pcs: 0,
    };
    let primaryWt = 0;
    datas.resultArray.forEach((e, i) => {
      let obj = { ...e };

      totalMaterialAmount +=
        e?.totals?.diamonds?.Amount + e?.totals?.colorstone?.Amount;

      e?.metal?.forEach((ele, ind) => {
        if (ele?.IsPrimaryMetal === 1) {
          totalMaterialAmount += ele?.Amount;
          primaryWt += ele?.Wt;
        }
      });

      obj.len =
        e?.totals?.diamonds?.length +
        e?.totals?.colorstone?.length +
        e?.totals?.misc?.length;
      let miscs = [];
      e?.misc?.forEach((ele, ind) => {
        if (ele?.Wt + ele?.ServWt !== 0) {
          totalMaterialAmount += ele?.Amount;
          miscs?.push(ele);
        }
        if (
          ele?.Supplier?.toLowerCase()?.trim() === "company" &&
          (ele?.IsHSCOE === 0 || ele?.IsHSCOE === 3)
        ) {
          miscses.Wt += ele?.Wt + ele?.ServWt;
          miscses.Pcs += ele?.Pcs;
        }
      });
      obj.materials = [...e?.metal, ...e?.diamonds, ...e?.colorstone, ...miscs];
      arr.push(obj);
    });
    setMiscss({ ...miscss, Wt: miscses?.Wt, Pcs: miscses?.Pcs });
    arr?.sort((a, b) => {
      // Extract numbers from label1 strings
      const numA = parseInt(a.designno.match(/\d+/g)?.[0]) || 0;
      const numB = parseInt(b.designno.match(/\d+/g)?.[0]) || 0;

      // Compare numbers first
      if (numA !== numB) return numA - numB;

      // If numbers are equal, compare the remaining strings
      return a.designno.localeCompare(b.designno);
    });
    datas.resultArray = [...arr];
    datas.mainTotal.primaryWt = primaryWt;
    datas.mainTotal.totalMaterialAmount = totalMaterialAmount;
    setData(datas);
  };
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  const checkid = (data, keyValueGold, keyValueDiaCsM) => {
    let id = data?.MasterManagement_DiamondStoneTypeid;
    let datas = "";
    switch (id) {
      case 4:
        datas = data?.[keyValueGold];
        break;
      case 3:
        datas = data?.[keyValueGold];
        break;
      case 2:
        datas = data?.[keyValueGold];
        break;
      case 1:
        datas = data?.[keyValueDiaCsM];
        break;
      default:
        break;
    }
    return datas;
  };

  const [imgFlag, setImgFlag] = useState(true);

  const setTitle = (data) => {
    let arr = ["Diamond", "ColorStone", "Misc"];
    let datas = "";
    switch (data?.MasterManagement_DiamondStoneTypeid) {
      case 4:
        datas = data?.ShapeName;
        break;
      case 3:
      case 2:
      case 1:
        datas = arr[data.MasterManagement_DiamondStoneTypeid - 1];
        break;
      default:
        break;
    }
    return datas;
  };

  const handleImgShow = () => {
    setImgFlag(!imgFlag);
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
            loadData(data?.Data);
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

  return loader ? (
    <Loader />
  ) : msg === "" ? (
    <div
      className={`container container-fluid max_width_container mt-1 ${style?.detailprint8} pad_60_allPrint`}
    >
      {/* buttons */}
      <div className={`d-flex justify-content-end align-items-center ${style?.print_sec_sum4} mb-4`} >
        <input
          type="checkbox"
          checked={imgFlag}
          id="showImg"
          onChange={handleImgShow}
          className="mx-2"
        />
        <label htmlFor="showImg" className="me-2 user-select-none">
          With Image
        </label>
        <div className="form-check ps-3">
          <input
            type="button"
            className="btn_white blue mt-2"
            value="Print"
            onClick={(e) => handlePrint(e)}
          />
        </div>
      </div>
      {/* Title */}
      <div className={`bgGrey text-white px-2 ${style?.min_height_title}`}>
        <h4
          className=" fw-bold min_height_title d-flex align-items-center text-white fnt-print"
          style={{ fontSize: "20px", lineHeight: "100%" }}
        >
          {headerData?.PrintHeadLabel}
        </h4>
      </div>
      {/* {headers} */}
      {/* header */}
      <div className="text-center pt-3">
        {isImageWorking && headerData?.PrintLogo !== "" && (
          <img
            src={headerData?.PrintLogo}
            alt=""
            className="w-100 h-auto mx-auto d-block object-fit-contain"
            onError={handleImageErrors}
            style={{ maxHeight: "75px", maxWidth: "115.55px" }}
          />
        )}
        {/* <img src={headerData?.PrintLogo} alt="" className="imgWidth" /> */}
        <p className="fw-bold py-1" style={{ fontSize: "16px" }}>
          {" "}
          {headerData?.CompanyFullName}
        </p>
        <p className={`pb-1 ${style?.font_12}`}>{headerData?.CompanyAddress}</p>
        <p className={`pb-1 ${style?.font_12}`}>
          {headerData?.CompanyAddress2}
        </p>
        <p className={`pb-1 ${style?.font_12}`}>
          {headerData?.CompanyCity}-{headerData?.CompanyPinCode},{" "}
          {headerData?.CompanyState}({headerData?.CompanyCountry})
        </p>
        <p className={`pb-1 ${style?.font_12}`}>
          T {headerData?.CompanyTellNo} | TOLL FREE{" "}
          {headerData?.CompanyTollFreeNo}
        </p>
        <p className={`pb-1 ${style?.font_12}`}>
          {headerData?.Company_VAT_GST_No} | {headerData?.Company_CST_STATE}-
          {headerData?.Company_CST_STATE_No} | PAN-{headerData?.Pannumber}
        </p>
        <p className={`pb-1 ${style?.font_12}`}>
          CIN: {headerData?.CINNO} | MSME: {headerData?.MSME}
        </p>
        <p className="fw-bold pb-2">{headerData?.InvoiceBillType}</p>
      </div>

      {/* sub header */}
      <div className={`d-flex border ${style?.font_12}`}>
        <div className="col-3 border-end p-2">
          <p>To,</p>
          <p className={`fw-bold ${style?.font_14}`}>
            {headerData?.customerfirmname}
          </p>
          <p>{headerData?.customerAddress1}</p>
          <p>{headerData?.customerAddress3}</p>
          <p>{headerData?.customerAddress2}</p>
          <p>
            {headerData?.customercity1}
            {headerData?.customerpincode}
          </p>
          <p>{headerData?.customeremail1}</p>
          <p>{headerData?.vat_cst_pan}</p>
          <p>
            {headerData?.Cust_CST_STATE}-{headerData?.Cust_CST_STATE_No}
          </p>
        </div>
        <div className="col-3 border-end p-2">
          <p> Ship To,</p>
          <p className={`fw-bold ${style?.font_14}`}>
            {headerData?.customerfirmname}
          </p>
          <p>{headerData?.CustName}</p>
          {custAddress?.map((e, i) => {
            return <p key={i}>{e}</p>;
          })}
        </div>
        <div className="col-3 border-end p-2">
          <div className="d-flex">
            <p className="fw-bold col-6">INVOICE NO</p>
            <p className="col-6"> {headerData?.InvoiceNo}</p>
          </div>
          <div className="d-flex">
            <p className="fw-bold col-6">DATE</p>{" "}
            <p className="col-6"> {headerData?.EntryDate}</p>
          </div>
          <div className="d-flex">
            <p className="fw-bold col-6">Delivery Mode</p>
            <p className="col-6"> {headerData?.Delivery_Mode}</p>
          </div>
        </div>
        <div className="col-3 p-2">
          <div className="d-flex">
            <p className="col-6">E Way Bill No: </p>{" "}
            <p className="col-6">{headerData?.E_Way_Bill_No}</p>
          </div>
          <div className="d-flex">
            <p className="col-6">PAN: </p>{" "}
            <p className="col-6">{headerData?.CustPanno}</p>
          </div>
          <div className="d-flex">
            <p className="col-6">Advance Receipt No: </p>{" "}
            <p className="col-6">{headerData?.Advance_Receipt_No}</p>
          </div>
          <div className="d-flex">
            <p className="col-6">Name of Trasporter: </p>{" "}
            <p className="col-6">{headerData?.Name_Of_Transporter}</p>
          </div>
          <div className="d-flex">
            <p className="col-6">Vehical No: </p>{" "}
            <p className="col-6">{headerData?.Vehicle_Number}</p>
          </div>
          <div className="d-flex">
            <p className="col-6">freight terms: </p>{" "}
            <p className="col-6">{headerData?.Freight_Terms}</p>
          </div>
          <div className="d-flex">
            <p className="col-6">E reference No: </p>{" "}
            <p className="col-6">{headerData?.E_Reference_No}</p>
          </div>
          <div className="d-flex">
            <p className="col-6">Credit Days: </p>{" "}
            <p className="col-6">{headerData?.Credit_Days}</p>
          </div>
          <div className="d-flex">
            <p className="col-6">Output Types: </p>{" "}
            <p className="col-6">{headerData?.Output_Type}</p>
          </div>
          <div className="d-flex">
            <p className="col-6">Product Types: </p>{" "}
            <p className="col-6">{headerData?.Product_Type}</p>
          </div>
          <div className="d-flex">
            <p className="col-6">HSN CODE: </p>{" "}
            <p className="col-6">{headerData?.HSN_No}</p>
          </div>
        </div>
      </div>

      {/* table header */}
      <div className="d-flex border mt-1">
        <div
          className={`${style?.Sr} border-end d-flex justify-content-center align-items-center`}
        >
          <p className="fw-bold text-center pad_1">Sr#</p>
        </div>
        <div
          className={`${style?.design} border-end d-flex justify-content-center align-items-center`}
        >
          <p className="fw-bold text-center pad_1">Design</p>
        </div>
        <div className={`${style?.material} border-end`}>
          <div className="d-grid h-100">
            <div className="d-flex justify-content-center border-bottom py-1">
              <p className="fw-bold">Material Description</p>
            </div>
            <div className="d-flex">
              <div
                className={`${style?.Material} pad_1 text-center fw-bold py-1 border-end`}
              >
                Material
              </div>
              <div
                className={`${style?.Shape} pad_1 text-center fw-bold py-1 border-end`}
              >
                Shape
              </div>
              <div
                className={`${style?.Qlty} pad_1 text-center fw-bold py-1 border-end`}
              >
                Qlty
              </div>
              <div
                className={`${style?.Color} pad_1 text-center fw-bold py-1 border-end`}
              >
                Color
              </div>
              <div
                className={`${style?.Size} pad_1 text-center fw-bold py-1 border-end`}
              >
                Size
              </div>
              <div
                className={`${style?.Pcs} pad_1 text-center fw-bold py-1 border-end`}
              >
                Pcs
              </div>
              <div
                className={`${style?.WtCtw} pad_1 text-center fw-bold py-1 border-end`}
              >
                Wt./Ctw.
              </div>
              <div
                className={`${style?.Rate} pad_1 text-center fw-bold py-1 border-end`}
              >
                Rate
              </div>
              <div
                className={`${style?.Amount} pad_1 text-center fw-bold py-1`}
              >
                Amount
              </div>
            </div>
          </div>
        </div>
        <div
          className={`${style?.qty} border-end d-flex justify-content-center align-items-center`}
        >
          <p className="fw-bold text-center pad_1">Qty</p>
        </div>
        <div
          className={`${style?.other} border-end d-flex justify-content-center align-items-center`}
        >
          <p className="fw-bold text-center pad_1">Other</p>
        </div>
        <div className={`${style?.labour} border-end`}>
          <div className="d-grid h-100">
            <div className="d-flex justify-content-center border-bottom py-1">
              <p className="fw-bold ">Labour</p>
            </div>
            <div className="d-flex">
              <div className={`col-6 py-1 border-end text-center pad_1`}>
                Rate
              </div>
              <div className={`col-6 py-1 text-center pad_1`}>Amt</div>
            </div>
          </div>
        </div>
        <div
          className={`${style?.amount} d-flex justify-content-center align-items-center`}
        >
          <p className="fw-bold text-center pad_1">Amount</p>
        </div>
      </div>

      {/* table data */}
      {data?.resultArray.map((e, i) => {
        return (
          <div className="d-flex border-start border-end border-bottom" key={i}>
            <div
              className={`${style?.Sr} border-end d-flex justify-content-center align-items-center`}
            >
              <p className="text-center pad_1">{i + 1}</p>
            </div>
            <div className={`${style?.design} border-end`}>
             <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
             <p className="pad_1"> {e?.designno} </p>
             <p className="text-end pad_1">{e?.SrJobno}</p>
             </div>
              {imgFlag && (
                <img src={e?.DesignImage} alt="" className="imgWidth" onError={handleImageError} />
              )}
              {e?.PO !== "" && <p className="text-center">PO:{e?.PO}</p>}
              {e?.HUID !== "" && <p className="text-center">HUID-{e?.HUID}</p>}
              <p className="text-center">
                <span className="fw-bold"> {NumberWithCommas(e?.grosswt, 3)} gm </span> Gross
              </p>
            </div>
            <div className={`${style?.material} border-end d-flex`}>
              <div className="d-grid h-100 w-100">
                {e?.materials.map((ele, ind) => {
                  return (
                    <div className={`d-flex ${ind !== e?.materials.length - 1 && "border-bottom"}`} key={ind} >
                      <div className={`${style?.Material} d-flex align-items-center pad_1 py-1 border-end word-wrap`} >
                        {(ele?.MasterManagement_DiamondStoneTypeid !== 4 ||
                          ele?.IsPrimaryMetal === 1) &&
                          setTitle(ele)}
                      </div>
                      <div className={`${style?.Shape} d-flex align-items-center pad_1 py-1 border-end word-wrap`} >
                        {ele?.MasterManagement_DiamondStoneTypeid !== 4 && ele?.ShapeName}
                        {ele?.MasterManagement_DiamondStoneTypeid === 4 && ele?.IsPrimaryMetal === 0 && ele?.ShapeName}
                      </div>
                      <div className={`${style?.Qlty} d-flex align-items-center pad_1 py-1 border-end word-wrap`} >
                        {/* {checkid(ele, "QualityName", "")} */}
                        {ele?.MasterManagement_DiamondStoneTypeid !== 1 &&
                          ele?.QualityName !== "-" &&
                          ele?.QualityName}
                      </div>
                      <div className={`${style?.Color} d-flex align-items-center pad_1 py-1 border-end word-wrap`} >
                        {ele?.MasterManagement_DiamondStoneTypeid !== 1 &&
                          ele?.MasterManagement_DiamondStoneTypeid !== 4 &&
                          ele?.Colorname !== "-" &&
                          ele?.Colorname}
                        {ele?.MasterManagement_DiamondStoneTypeid === 4 &&
                          ele?.IsPrimaryMetal === 1 &&
                          ele?.Colorname !== "-" &&
                          ele?.Colorname}
                      </div>
                      <div className={`${style?.Size} d-flex align-items-center pad_1 py-1 border-end word-wrap ${style?.word_breakNormal}`} >
                        {/* {checkid(ele, "", "SizeName")} */}
                        {(ele?.MasterManagement_DiamondStoneTypeid === 4 && ele?.IsPrimaryMetal === 0) && ele?.SizeName}
                        {(ele?.MasterManagement_DiamondStoneTypeid !== 4) && ele?.SizeName}
                      </div>
                      <div className={`${style?.Pcs} d-flex align-items-center justify-content-end pad_1 py-1 border-end text-end word-wrap`} >
                        {/* {checkid(ele, "", "Pcs")} */}
                        {ele?.MasterManagement_DiamondStoneTypeid === 4 &&
                          ele?.IsPrimaryMetal === 0 &&
                          NumberWithCommas(ele?.Pcs, 0)}
                        {(ele?.MasterManagement_DiamondStoneTypeid !== 4) && NumberWithCommas(ele?.Pcs, 0)}
                      </div>
                      <div className={`${style?.WtCtw} d-flex align-items-center justify-content-end pad_1 py-1 border-end text-end word-wrap`} >
                        {NumberWithCommas(ele?.Wt + ele?.ServWt, 3)}
                      </div>
                      <div className={`${style?.Rate} d-flex align-items-center justify-content-end pad_1 py-1 border-end text-end word-wrap`} >
                        {ele?.MasterManagement_DiamondStoneTypeid !== 4 &&
                          ele?.Rate !== 0 &&
                          NumberWithCommas(ele?.Rate , 2)}
                        {ele?.MasterManagement_DiamondStoneTypeid === 4 &&
                          ele?.IsPrimaryMetal === 1 &&
                          ele?.Rate !== 0 &&
                          NumberWithCommas(
                            (ele?.Rate || 0) / headerData?.CurrencyExchRate,
                            2
                          )}
                      </div>
                      <div className={`${style?.Amount} d-flex align-items-center justify-content-end pad_1 py-1 text-end word-wrap`} >
                        {ele?.MasterManagement_DiamondStoneTypeid !== 4 &&
                          ele?.Amount !== 0 &&
                          NumberWithCommas(
                            (ele?.Amount ) / headerData?.CurrencyExchRate,
                            2
                          )}
                        {ele?.MasterManagement_DiamondStoneTypeid === 4 &&
                          ele?.IsPrimaryMetal === 1 &&
                          ele?.Rate !== 0 &&
                          NumberWithCommas(
                            (ele?.Amount ) / headerData?.CurrencyExchRate,
                            2
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              className={`${style?.qty} border-end d-flex justify-content-end align-items-center word-wrap`}
            >
              <p className="pad_1 text-end">
                {NumberWithCommas(e?.Quantity, 0)}
              </p>
            </div>
            <div
              className={`${style?.other} border-end d-flex justify-content-end align-items-center word-wrap`}
            >
              <p className="pad_1 text-end">
                {NumberWithCommas(
                  (e?.OtherCharges + e?.TotalDiamondHandling) /
                  headerData?.CurrencyExchRate,
                  2
                )}
              </p>
            </div>
            <div className={`${style?.labour} border-end d-flex`}>
              <div className="col-6 d-flex justify-content-end align-items-center border-end pad_1 word-wrap">
                {
                  e.MakingChargeDiscount ==0 ? NumberWithCommas(e?.MaKingCharge_Unit / headerData?.CurrencyExchRate, 2) :NumberWithCommas( e?.MakingChargeDiscount, 2)+"%"
                }
                 
              </div>
              <div className="col-6 d-flex justify-content-end align-items-center pad_1 word-wrap">
                {NumberWithCommas((e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount) / headerData?.CurrencyExchRate, 2)}
              </div>
            </div>
            <div
              className={`${style?.amount} d-flex justify-content-end align-items-center word-wrap`}
            >
              <p className="pad_1">
                {NumberWithCommas(
                  e?.TotalAmount / headerData?.CurrencyExchRate,
                  2
                )}
              </p>
            </div>
          </div>
        );
      })}
      {/* table total */}
      <div className="d-flex border-start border-end border-bottom justify-content-end word-wrap">
        <div
          className={`${style?.amount} d-flex justify-content-end align-items-center word-wrap`}
        >
          <p className="pad_1">
            {NumberWithCommas(
              data?.mainTotal?.total_amount / headerData?.CurrencyExchRate,
              2
            )}
          </p>
        </div>
      </div>
      {/* freight charges*/}
      <div className="d-flex border-start border-end border-bottom word-wrap">
        <div className={`${style?.words} border-end`}></div>
        <div className={`${style?.taxes} border-end`}>
          <p className="pad_1 text-end">Freight Charges </p>
        </div>
        <div className={`${style?.taxAmount}`}>
          <p className="pad_1 text-end">
            {NumberWithCommas(data?.header?.FreightCharges, 2)}
          </p>
        </div>
      </div>
      {/* total cgst sgst*/}
      <div className="d-flex border-start border-end border-bottom word-wrap">
        <div className={`${style?.words} border-end`}>
          {data?.allTaxes.map((e, i) => {
            return (
              <div className="pad_1" key={i}>
                TOTAL {e?.name} IN WORDS : {toWords.convert(+((+e?.amount)?.toFixed(2)))}
              </div>
            );
          })}
        </div>
        <div className={`${style?.taxes} border-end`}>
          {data?.allTaxes.map((e, i) => {
            return (
              <div className="pad_1 text-end" key={i}>
                {e?.name} @ {e?.per}
              </div>
            );
          })}
          <p className="pad_1 text-end">Sales Rounded Off</p>
        </div>
        <div className={`${style?.taxAmount}`}>
          {data?.allTaxes.map((e, i) => {
            return (
              <div className="pad_1 text-end" key={i}>
                {NumberWithCommas(+e?.amount, 2)}
              </div>
            );
          })}
          <p className="pad_1 text-end">
            {NumberWithCommas(
              data?.header?.AddLess / headerData?.CurrencyExchRate,
              2
            )}
          </p>
        </div>
      </div>

      {/* table total2 */}
      <div className="d-flex border-start border-end border-bottom">
        <div
          className={`${style?.totalt} border-end d-flex justify-content-center align-items-end`}
        >
          <p>Total </p>
        </div>
        <div className={`${style?.qtyt} border-end`}></div>
        <div className={`${style?.dt} border-end`}>
          <p className="pad_1">
            Qty:{NumberWithCommas(data?.mainTotal?.total_Quantity, 0)}
          </p>
          <p className="pad_1">
            D: Company : {NumberWithCommas(data?.mainTotal?.diamonds.Pcs, 0)}/
            {NumberWithCommas(data?.mainTotal?.diamonds.Wt, 3)} Ctw
          </p>
          <p className="pad_1">
            C: Company : {NumberWithCommas(data?.mainTotal?.colorstone.Pcs, 0)}/
            {NumberWithCommas(data?.mainTotal?.colorstone.Wt, 3)} Ctw
          </p>
          <p className="pad_1">
            M: Company : {NumberWithCommas(miscss?.Pcs, 0)}/
            {NumberWithCommas(miscss?.Wt, 3)} Wt
          </p>
          <p className="pad_1">
            Wt:{NumberWithCommas(data?.mainTotal?.primaryWt, 3)}
          </p>
          <p className="pad_1">
            Ctw:
            {NumberWithCommas(
              data?.mainTotal?.diamonds?.Wt + data?.mainTotal?.colorstone?.Wt,
              3
            )}
          </p>
        </div>
        <div
          className={`${style?.ct} border-end d-flex justify-content-end align-items-center`}
        >
          <p className="text-end pad_1 fw-bold">
            {NumberWithCommas(
              data?.mainTotal?.totalMaterialAmount /
              headerData?.CurrencyExchRate,
              2
            )}{" "}
          </p>
        </div>
        <div
          className={`${style?.mt} border-end d-flex justify-content-end align-items-center`}
        >
          <p className="text-end pad_1 fw-bold">
            {NumberWithCommas(data?.mainTotal?.total_Quantity, 0)}{" "}
          </p>
        </div>
        <div
          className={`${style?.wtt} border-end d-flex justify-content-end align-items-center`}
        >
          <p className="text-end pad_1 fw-bold">
            {NumberWithCommas(
              (data?.mainTotal?.total_diamondHandling +
                data?.mainTotal?.total_other) /
              headerData?.CurrencyExchRate,
              2
            )}{" "}
          </p>
        </div>
        <div
          className={`${style?.ctwt} border-end d-flex justify-content-end align-items-center`}
        >
          <p className="text-end pad_1 fw-bold">
            {NumberWithCommas(
              (data?.mainTotal?.total_Making_Amount +
                data?.mainTotal?.total_TotalCsSetcost +
                data?.mainTotal?.total_TotalDiaSetcost) /
              headerData?.CurrencyExchRate,
              2
            )}{" "}
          </p>
        </div>
        <div
          className={`${style?.tt} d-flex justify-content-end align-items-center`}
        >
          <p className="text-end pad_1 fw-bold">
            <span
              dangerouslySetInnerHTML={{ __html: headerData?.Currencysymbol }}
            ></span>{" "}
            {NumberWithCommas(
              +((data?.mainTotal?.total_amount / headerData?.CurrencyExchRate)?.toFixed(2)) +
              data?.allTaxes?.reduce(
                (acc, cObj) => acc + +(+cObj?.amount)?.toFixed(2),
                0
              ) +
              data?.header?.FreightCharges +
              +(
                data?.header?.AddLess / headerData?.CurrencyExchRate
              )?.toFixed(2),
              2
            )}
          </p>
        </div>
        <div></div>
      </div>

      {/* in words */}
      <div className="d-flex border-start border-end border-bottom">
        <div className={`${style?.totalt} border-end pad_1`}>
          <span
            dangerouslySetInnerHTML={{ __html: headerData?.Currencysymbol }}
          ></span>
        </div>
        <div className={`${style?.inWords} pad_1`}>
          <p className="fw-bold">
            {toWords.convert(
              +fixedValues(
                +((data?.mainTotal?.total_amount / headerData?.CurrencyExchRate)?.toFixed(2)) +
                data?.allTaxes?.reduce(
                  (acc, cObj) => acc + +(+cObj?.amount)?.toFixed(2),
                  0
                ) +
                data?.header?.FreightCharges +
                +(
                  data?.header?.AddLess / headerData?.CurrencyExchRate
                )?.toFixed(2), 2
              ),
              2
            )}{" "}
            Only
          </p>
        </div>
      </div>

      {/* declaration */}
      <div
        className="mt-1 border p-2"
        dangerouslySetInnerHTML={{ __html: headerData?.Declaration }}
      ></div>
      <div className="border-start py-1 px-2 border-end border-bottom d-flex">
        <p className="fw-bold pe-1">REMARKS :</p>
        <p className="ps-1" dangerouslySetInnerHTML={{ __html: headerData?.PrintRemark }}></p>

        <div className="py-1 pbias2 fsh2_s2"><span className="fw-bold">TERMS INCLUDED</span> :
                  <span dangerouslySetInnerHTML={{ __html: headerData?.SalesRepPolicyTermsDescription }}></span>
                  
        </div>
      </div>

      {/* footer */}
      <div className={`${footer2.container} no_break target_footer`}>
        <div
          className={footer2.block1f3}
          style={{ width: "33.33%", borderRight: "1px solid #e8e8e8" }}
        >
          <div className={footer2.linesf3} style={{ fontWeight: "bold" }}>Bank Detail</div>
          <div className={footer2.linesf3}>Bank Name: {headerData?.bankname}</div>
          <div className={footer2.linesf3}>Branch: {headerData?.bankaddress}</div>
          <div className={footer2.linesf3}>Account Name: {headerData?.accountname}</div>
          <div className={footer2.linesf3}>Account No. : {headerData?.accountnumber}</div>
          <div className={footer2.linesf3}>RTGS/NEFT IFSC: {headerData?.rtgs_neft_ifsc}</div>
          <div className={footer2.linesf3}>Enquiry No.</div>
          <div className={footer2.linesf3}>(E & OE) </div>
        </div>
        <div
          className={footer2.block2f3}
          style={{ width: "33.33%", borderRight: "1px solid #e8e8e8" }}
        >
          <div className={`${footer2.linesf3} fw-normal`}>Signature</div>
          <div className={footer2.linesf3}>{data?.customerfirmname}</div>
        </div>
        <div className={footer2.block2f3} style={{ width: "33.33%" }}>
          <div className={`${footer2.linesf3} fw-normal`}>Signature</div>
          <div className={footer2.linesf3}>{data?.CompanyFullName}</div>
        </div>
      </div>
    </div>
  ) : (
    <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
      {msg}
    </p>
  );
};

export default DetailPrint8;
