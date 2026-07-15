import React, { useEffect, useState } from "react";
import style from "../../../assets/css/prints/manufacturemgt.module.css";
import {
  HeaderComponent,
  NumberWithCommas,
  handleImageError,
  handlePrint,
} from "../../../GlobalFunctions";
import { OrganizeDataPrint } from "../../../GlobalFunctions/OrganizeDataPrint";

const RepairAlteration = ({ data }) => {
  const [headerComp, setHeaderComp] = useState(null);
  const [headerData, setHeaderData] = useState({});
  
  const [result, setResult] = useState(null);
  const [datas, setData] = useState([]);
  const loadData = (data) => {
    setHeaderData(data?.BillPrint_Json[0]);
    let headerDatas = data?.BillPrint_Json[0];
    let head = HeaderComponent(2, headerDatas);
    setHeaderComp(head);
    let resultArr = [];
    data?.BillPrint_Json1.forEach((e, i) => {
      let obj = { ...e };
      let metalColorCode = "";
      let diamonds = [];
      let colorStones = [];
      let miscs = [];

      let diamondWt = 0;
      let colorWt = 0;
      let miscWt = 0;

      data?.BillPrint_Json2.forEach((ele, ind) => {
        if (ele?.StockBarcode === e?.SrJobno) {
          if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
            if (ele?.IsPrimaryMetal === 1) {
              metalColorCode = ele?.MetalColorCode;
            } else if (metalColorCode === "") {
              metalColorCode = ele?.MetalColorCode;
            }
          } else if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
            // let findDiamonds =
            diamondWt += ele?.Wt;
            diamonds.push(ele);
          } else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
            colorWt += ele?.Wt;
            colorStones.push(ele);
          } else if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
            if (ele?.IsHSCOE === 0) {
              miscWt += ele?.Wt;
              miscs.push(ele);
            }
          }
        }
      });

      obj.metalColorCode = metalColorCode;
      obj.diamonds = diamonds;
      obj.diamondWt = diamondWt;
      obj.colorWt = colorWt;
      obj.miscWt = miscWt;
      obj.colorStones = colorStones;
      obj.miscs = miscs;

      resultArr.push(obj);
    });
    const datas = OrganizeDataPrint(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );
    console.log(datas);
    setResult(datas);
    
    setData(resultArr);
  };

  useEffect(() => {
    loadData(data);
  }, []);
  return (
    <div
    className={`container-fluid max_width_container pt-2 ${style?.manufacture_container} pad_60_allPrint`}
  >
    {/* buttons */}
    <div
      className={`d-flex justify-content-end align-items-center ${style?.print_sec_sum4} mb-4`}
    >
      <div className="form-check ps-3">
        <input
          type="button"
          className="btn_white blue"
          value="Print"
          onClick={(e) => handlePrint(e)}
        />
      </div>
    </div>
    {/* company address */}
    
    <div className={style.headline}>{headerData?.PrintHeadLabel}</div>
      <div className={style.companyDetails}>
      <div className={style.companyhead}>
          <span className={style.lines} style={{ fontWeight: "bold" }}>
            {headerData?.CompanyFullName}
          </span>
          <span className={style.lines}>{headerData?.CompanyAddress}</span>
          <span className={style.lines}>{headerData?.CompanyAddress2}</span>
          <span className={style.lines}>
            {headerData?.CompanyCity}-{headerData?.CompanyPinCode},{headerData?.CompanyState}(
            {headerData?.CompanyCountry})
          </span>
          <span className={style.lines}>Tell No: {headerData?.CompanyTellNo}</span>
          <span className={style.lines}>
            {headerData?.CompanyEmail} | {headerData?.CompanyWebsite}
          </span>
          <span className={style.lines}>
            {headerData?.Company_VAT_GST_No} | {headerData?.Company_CST_STATE}-{headerData?.Company_CST_STATE_No}
            {/* -GSTIN-25GJERDR202314 */}
          </span>
        </div>
        <div style={{ width: "30%" }} className="d-flex justify-content-center align-item-center h-100" >
          <img src={headerData?.PrintLogo} alt="" className={style.headerImg} />
        </div>

      </div>


    {/* customer address */}
    <div className="mt-1 p-2 border-top d-flex">
      <div className="col-6">
        <div>To,</div>
        <div className=" fw-bold">{headerData?.customerfirmname}</div>
        
        {/* <p className="fs-6 fw-bold">{headerData?.CustName}</p> */}
        <div>{headerData?.customerstreet}</div>
        <div>{headerData?.customerregion}</div>
        <div>
          {headerData?.customercity} {headerData?.customerpincode}
        </div>
        <div>Tel: {headerData?.customermobileno}</div>
        <div>{headerData?.customeremail1}</div>
        <div>{headerData?.aadharno === '' ? '' : `Aadhar : ${headerData?.aadharno} | `}{headerData?.CustPanno === '' ? '' : ` PAN - ${headerData?.CustPanno}`}</div>
      </div>
      <div className="col-6 d-flex justify-content-end">
        {/* <div className="col-8 d-flex flex-column justify-content-center pe-4"> */}
        <div
          className={`${style?.width_301} d-flex flex-column justify-content-center`}
        >
          <div>
            Invoice#:{" "}
            <span className="fw-bold">{headerData?.InvoiceNo}</span> Dated{" "}
            <span className="fw-bold">{headerData?.EntryDate}</span>
          </div>
          <div>
            HSN: <span className="fw-bold">{headerData?.HSN_No}</span>
          </div>
          <div>
            GSTIN: <span className="fw-bold">{headerData?.Cust_VAT_GST_No}</span> |
            {headerData?.Cust_CST_STATE}{" "}
            <span className="fw-bold">
              {headerData?.Cust_CST_STATE_No}
            </span>
          </div>
          <div>
            Due Date:{" "}
            <span className="fw-bold">{headerData?.DueDate}</span>
          </div>
        </div>
      </div>
    </div>
    <div className="pt-2">
      {/* Table Header */}
      <div className="d-flex border lightGrey">
        <div className="col-1 border-end">
          <p className="fw-bold p-1 text-center">SR NO</p>
        </div>
        <div className="col-3 border-end">
          <p className="fw-bold p-1 text-center">ITEM CODE</p>
        </div>
        <div className="col-8">
          <p className="fw-bold p-1 text-center">DESCRIPTION</p>
        </div>
      </div>
      {/* Table Data */}
      {datas.map((e, i) => {
        return (
          <div
            className={`d-flex border-start border-bottom border-end ${style?.pgia_ralt}`}
            key={i}
          >
            <div className="col-1 border-end">
              <p className="fw-bold p-1 text-center pt-2">{i + 1}</p>
            </div>
            <div className="col-3 border-end">
              <div className="d-flex align-items-center justify-content-between">
              <p className="p-1"> Job: {e?.SrJobno} </p>
              <p className="p-1">
                Design: <span className="fw-bold">{e?.designno}</span>
              </p>
              </div>
              <div className={style?.imgBox_ra}>
                <img
                  src={e?.DesignImage}
                  alt=""
                  className={`${style?.img_manufacture} p-1`}
                  onError={handleImageError}
                />
              </div>
            </div>
            <div className="col-8 p-1">
              <p className="fw-bold  text_secondary">
                RECEIVED JEWELLERY
              </p>
              <div className="">
                {e?.MetalTypePurity} {e?.metalColorCode} |{" "}
                {e?.grosswt !== 0 && (
                  <>{NumberWithCommas(e?.grosswt, 3)} gms GW</>
                )}
                {e?.NetWt !== 0 && (
                  <> | {NumberWithCommas(e?.NetWt, 3)} gms NW  </>
                )}
                {e?.diamondWt !== 0 && (
                  <> | DIA: {NumberWithCommas(e?.diamondWt, 3)} Cts  </>
                )}
                {e?.colorWt !== 0 && (
                  <> | CS: {NumberWithCommas(e?.colorWt, 3)} Cts</>
                )}
                {e?.miscWt !== 0 && (
                  <> | MISC: {NumberWithCommas(e?.miscWt, 3)} gms</>
                )}
              </div>

              {e?.diamonds.map((ele, ind) => {
                return (
                  <div key={ind} >
                    {ele?.MasterManagement_DiamondStoneTypeName}{ele?.IsSolGem==1?"S ":""}:{" "} 
                    {ele?.Pcs !== 0 && <>{ele?.Pcs} PCs |</>}{" "}
                    {ele?.Wt !== 0 && <>{ele?.Wt} Cts |</>}{" "}
                    {ele?.ShapeName} {ele?.QualityName} {ele?.Colorname}{" "}
                  </div>
                );
              })}

              {e?.colorStones.map((ele, ind) => {
                return (
                  <div key={ind} >
                    {" "}
                    {ele?.MasterManagement_DiamondStoneTypeName}{ele?.IsSolGem==1?"G ":""}:{" "} 
                    {ele?.Pcs !== 0 && <>{ele?.Pcs} PCs</>}{" "}
                    {ele?.Wt !== 0 && <> | {ele?.Wt} Cts</>}{" "}
                    | {ele?.ShapeName} {ele?.QualityName} {ele?.Colorname}{" "}
                  </div>
                );
              })}

              {e?.miscs.map((ele, ind) => {
                return (
                  <div key={ind} >
                    {" "}
                    {ele?.MasterManagement_DiamondStoneTypeName}:{" "}
                    {ele?.Pcs !== 0 && <>{ele?.Pcs} PCs</>}{" "}
                    {ele?.Wt !== 0 && <> | {ele?.Wt} gms</>}{" "}
                    | {ele?.ShapeName} {ele?.QualityName} {ele?.Colorname}{" "}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="p-2 border border-top-0">
        <span className="mx-2">GrossWt : <span className="fw-bold">{result?.mainTotal?.grosswt?.toFixed(3)}</span></span>
        <span className="mx-2">NetWt : <span className="fw-bold">{result?.mainTotal?.netwt?.toFixed(3)}</span></span>        
      </div>
      {/* signature */}
      <div className="p-1 border-start border-end w-100 border-bottom">
        <span className="fw-bold">Remark :</span>&nbsp; {headerData?.Remark}
      </div>
      <div
        className={`d-flex border-start border-bottom border-end ${style?.height_manufacture}`}
      >
        <div className="col-6 p-2 d-flex justify-content-between flex-column border-end position-relative">
          <p>Signature :</p>
          <p className="fw-bold">{headerData?.customerfirmname}</p>
          {/* <p className={`position-absolute ${style?.blankArea} bgGrey border-start border-bottom`}></p> */}
        </div>
        <div className="col-6 p-2 d-flex justify-content-between flex-column position-relative">
          <p>Signature :</p>
          <p className="fw-bold">{headerData?.CompanyFullName}</p>
          {/* <p className={`position-absolute ${style?.blankArea} bgGrey border-start border-end border-bottom`}></p> */}
        </div>
      </div>
    </div>
  </div>
  );
};

export default RepairAlteration;
