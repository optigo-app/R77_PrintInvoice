//http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=SlMvOTIzLzI1LTI2&evn=c2FsZQ==&pnm=UmV0YWlsIEludm9pY2UgUHJpbnQgUw==&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=RetailInvoicePrint4&pid=undefined
import React, { useState, useEffect } from "react";
import "../../assets/css/prints/retailInvoicePrintS.css";
import style from "../../assets/css/prints/retailinvoicePrintS.module.css";
import {
  apiCall,
  CapitalizeWords,
  checkMsg,
  fixedValues,
  formatAmount,
  GovernMentDocuments,
  handleImageError,
  isObjectEmpty,
  NumberWithCommas,
  ReceiveInBank,
  taxGenrator,
} from "../../GlobalFunctions";
import Button from "../../GlobalFunctions/Button";
import Loader from "../../components/Loader";
import { ToWords } from "to-words";

const RetailInvoicePrintS = ({
  urls,
  token,
  invoiceNo,
  printName,
  evn,
  ApiVer,
}) => {
  const [headerData, setHeaderData] = useState({});
  const [data, setdata] = useState([]);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const toWords = new ToWords();
  const [image, setImage] = useState(true);
  const [total, setTotal] = useState({
    gwt: 0,
    stoneWt: 0,
    diaColorWt: 0,
    nwt: 0,
    metalMaking: 0,
    others: 0,
    total: 0,
    discount: 0,
    afterTax: 0,
    netBalAmount: 0,
    beforeTax: 0,
    diamondColorStoneWt: 0,
    multiMetalMiscHsCode: 0,
    otherCharge: 0,
  });
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  const [taxes, setTaxes] = useState([]);
  const [bank, setBank] = useState([]);
  const [document, setDocument] = useState([]);

  function loadData(data) {
    // console.log("datadatadata", data);

    try {
      setHeaderData(data?.BillPrint_Json[0]);
      let blankArr = [];
      let totals = { ...total };
      let groupInfo = [];
      data?.BillPrint_Json1.forEach((e) => {
        let obj = { ...e };
        totals.gwt += e?.grosswt;
        totals.beforeTax += e?.TotalAmount;
        // totals.nwt += e?.NetWt;
        totals.nwt += e?.MetalDiaWt;
        totals.others += e?.OtherCharges;
        totals.total += e?.UnitCost;
        totals.discount += e?.DiscountAmt;
        let hallmarkingCount = 0;
        let materials = [];
        let primaryMetal = [];
        let otherMetals = [];
        let diamonds = [];
        let colorstones = [];
        let miscs = [];
        let finding = [];
        let diamondAmount = 0;
        let diamondWt = 0;
        let diamondRate = 0;
        let colorStoneAmount = 0;
        let colorStoneWt = 0;
        let colorStoneRate = 0;
        let miscsAmount = 0;
        let miscsWt = 0;
        let miscsRate = 0;
        let findingWt = 0;
        let otherCharge = 0;
        let others = e?.OtherCharges;
        if ((e?.NetWt + e?.LossWt) !== 0 && others !== undefined) {
          otherCharge = others / (e?.NetWt + e?.LossWt);
        }
        totals.otherCharge += +otherCharge.toFixed(2);
        let metalMaking = obj?.MetalAmount + obj?.MakingAmount;
        data?.BillPrint_Json2.forEach((ele) => {
          if (e?.SrJobno === ele?.StockBarcode) {
            if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
              materials.unshift(ele);
              if (ele?.IsPrimaryMetal === 1) {
                primaryMetal?.push(ele);
              } else {
                otherMetals?.push(ele);
                totals.multiMetalMiscHsCode += ele?.Wt;
                hallmarkingCount += 1;
              }
            } else if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
              diamonds?.push(ele);
              totals.diaColorWt += ele?.Wt;
              diamondAmount += ele?.Amount;
              diamondWt += ele?.Wt;
              let findIndex = materials.findIndex(
                (elem) => elem?.MasterManagement_DiamondStoneTypeid === 1
              );
              if (findIndex === -1) {
                materials.push(ele);
              } else {
                materials[findIndex].Wt += ele?.Wt;
                materials[findIndex].Amount += ele?.Amount;
              }
            } else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
              colorStoneAmount += ele?.Amount;
              colorStoneWt += ele?.Wt;
              colorstones?.push(ele);
              totals.diaColorWt += ele?.Wt;
              let findIndex = materials.findIndex(
                (elem) => elem?.MasterManagement_DiamondStoneTypeid === 2
              );
              if (findIndex === -1) {
                materials.push(ele);
              } else {
                materials[findIndex].Wt += ele?.Wt;
                materials[findIndex].Amount += ele?.Amount;
              }
            } else if (
              ele?.MasterManagement_DiamondStoneTypeid === 3 &&
              ele?.IsHSCOE === 0
            ) {
              miscsAmount += ele?.Amount;
              miscsWt += ele?.Wt;
              miscs?.push(ele);
              totals.stoneWt += ele?.Wt;
              materials.push(ele);
              totals.multiMetalMiscHsCode += ele?.Wt;
            } else if (
              ele?.MasterManagement_DiamondStoneTypeid === 3 &&
              ele?.ShapeName?.includes("Certification_")
            ) {
              miscs?.push(ele);
            } else if (ele?.MasterManagement_DiamondStoneTypeid === 5) {
              finding?.push(ele);
              findingWt += ele?.Wt;
              hallmarkingCount += 1;
            }
          }
        });
        if (diamondWt !== 0 && diamondAmount !== 0) {
          diamondRate = diamondAmount / diamondWt;
        }
        if (colorStoneWt !== 0 && colorStoneAmount !== 0) {
          colorStoneRate = colorStoneAmount / colorStoneWt;
        }
        if (miscsWt !== 0 && miscsAmount !== 0) {
          miscsRate = miscsAmount / miscsWt;
        }
        obj.materials = materials;
        obj.otherCharge = otherCharge;
        obj.metalMaking = metalMaking;
        obj.primaryMetal = primaryMetal;
        obj.diamondWt = diamondWt;
        obj.colorStoneWt = colorStoneWt;
        obj.miscsWt = miscsWt;
        obj.otherMetals = otherMetals;
        obj.diamonds = diamonds;
        obj.colorstones = colorstones;
        obj.miscs = miscs;
        obj.diamondRate = diamondRate;
        obj.colorStoneRate = colorStoneRate;
        obj.findingWt = findingWt;
        obj.miscsRate = miscsRate;
        obj.finding = finding;
        obj.diamondAmount = diamondAmount;
        obj.colorStoneAmount = colorStoneAmount;
        obj.hallmarkingCount = hallmarkingCount;
        obj.miscsAmount = miscsAmount;
        blankArr.push(obj);
        let findGroupinfo = groupInfo?.findIndex(
          (ele) => ele?.GroupJob === e?.GroupJob && e?.GroupJob !== ""
        );
        if (findGroupinfo !== -1) {
          groupInfo[findGroupinfo].diamondWt += diamondWt;
          groupInfo[findGroupinfo].colorStoneWt += colorStoneWt;
          groupInfo[findGroupinfo].miscsWt += miscsWt;
          groupInfo[findGroupinfo].diamondAmount += diamondAmount;
          groupInfo[findGroupinfo].colorStoneAmount += colorStoneAmount;
          groupInfo[findGroupinfo].miscsAmount += miscsAmount;
          groupInfo[findGroupinfo].hallmarkingCount += hallmarkingCount;
          groupInfo[findGroupinfo].findingWt += findingWt;
          groupInfo[findGroupinfo].otherCharge += otherCharge;
          if (e?.GroupJob === e?.SrJobno) {
            groupInfo[findGroupinfo].designno = e?.designno;
            groupInfo[findGroupinfo].DesignImage = e?.DesignImage;
            groupInfo[findGroupinfo].Categoryname = e?.Categoryname;
            groupInfo[findGroupinfo].SubCategoryname = e?.SubCategoryname;
            groupInfo[findGroupinfo].HUID = e?.HUID;
            groupInfo[findGroupinfo].SrJobno = e?.SrJobno;
          }
        } else if (e?.GroupJob !== "" && findGroupinfo === -1) {
          groupInfo?.push({
            GroupJob: e?.GroupJob,
            diamondWt: diamondWt,
            colorStoneWt: colorStoneWt,
            miscsWt: miscsWt,
            diamondAmount: diamondAmount,
            colorStoneAmount: colorStoneAmount,
            miscsAmount: miscsAmount,
            designno: e?.designno,
            DesignImage: e?.DesignImage,
            Categoryname: e?.Categoryname,
            SubCategoryname: e?.SubCategoryname,
            HUID: e?.HUID,
            SrJobno: e?.GroupJob,
            hallmarkingCount: hallmarkingCount,
            findingWt: findingWt,
            otherCharge: otherCharge,
          });
        }
      });
      // let taxValue = taxGenrator(data?.BillPrint_Json[0], totals?.total); // CQ Solving 24/11/2025
      let taxValue = taxGenrator(data?.BillPrint_Json[0], (totals?.total ?? 0) - (totals?.discount ?? 0));
      taxValue.forEach((e) => {
        totals.afterTax += +e?.amount;
      });
      totals.afterTax += totals?.beforeTax + data?.BillPrint_Json[0]?.AddLess;
      let debitCardinfo = ReceiveInBank(data?.BillPrint_Json[0]?.BankPayDet);
      setBank(debitCardinfo);
      // console.log("bank", debitCardinfo);
      totals.netBalAmount =
        totals.afterTax - data?.BillPrint_Json[0]?.OldGoldAmount;
      debitCardinfo.length > 0 &&
        debitCardinfo.forEach((e) => {
          totals.netBalAmount -= e.amount;
        });
      setTaxes(taxValue);
      // console.log("taxValue", taxValue);

      blankArr?.forEach((e) => {
        if (e?.GroupJob !== "") {
          let findRecord = groupInfo?.find(
            (ele, ind) => ele?.GroupJob === e?.GroupJob
          );
          if (findRecord !== undefined) {
            e.designno = findRecord?.designno;
            e.SrJobno = findRecord?.SrJobno;
            e.DesignImage = findRecord?.DesignImage;
            e.Categoryname = findRecord?.Categoryname;
            e.SubCategoryname = findRecord?.SubCategoryname;
            e.diamondWt = findRecord?.diamondWt;
            e.diamondAmount = findRecord?.diamondAmount;
            e.colorStoneWt = findRecord?.colorStoneWt;
            e.colorStoneAmount = findRecord?.colorStoneAmount;
            // totals.diamondColorStoneWt += findRecord?.diamondWt + findRecord?.colorStoneWt;
            e.miscsWt = findRecord?.miscsWt;
            e.diamondAmount = findRecord?.diamondAmount;
            e.colorStoneAmount = findRecord?.colorStoneAmount;
            e.miscsAmount = findRecord?.miscsAmount;
            e.diamondRate = findRecord?.diamondAmount / findRecord?.diamondWt;
            e.colorStoneRate =
              findRecord?.colorStoneAmount / findRecord?.colorStoneWt;
            e.miscsRate = findRecord?.miscsAmount / findRecord?.miscsWt;
            e.hallmarkingCount = findRecord?.hallmarkingCount;
            e.findingWt = findRecord?.findingWt;
            e.otherCharge = findRecord?.otherCharge;
          }
        } else {
          // totals.diamondColorStoneWt += e?.diamondWt + e?.colorStoneWt;
        }
      });
      let resultArr = [];
      blankArr.forEach((e) => {
        if (e?.GroupJob !== "") {
          let findIndex = resultArr.findIndex(
            (ele) =>
              ele?.GroupJob === e?.GroupJob &&
              ele?.primaryMetal[0]?.Rate === e?.primaryMetal[0]?.Rate
          );
          if (findIndex === -1) {
            resultArr.push(e);
            totals.diamondColorStoneWt += e?.diamondWt + e?.colorStoneWt;
          } else {
            // totals.diamondColorStoneWt += resultArr[findIndex]?.diamondWt + resultArr[findIndex]?.colorStoneWt;
            resultArr[findIndex].MakingAmount += e?.MakingAmount;
            resultArr[findIndex].MetalAmount += e?.MetalAmount;
            resultArr[findIndex].OtherCharges += e?.OtherCharges;
            resultArr[findIndex].TotalAmount += e?.TotalAmount;
            resultArr[findIndex].UnitCost += e?.UnitCost;
            resultArr[findIndex].grosswt += e?.grosswt;
            resultArr[findIndex].NetWt += e?.NetWt;
            resultArr[findIndex].LossWt += e?.LossWt;
            let arr = [resultArr[findIndex], e];
            let findRecord = arr.find((elem) => elem?.SrJobno === e?.GroupJob);
            resultArr[findIndex].SubCategoryname = findRecord?.SubCategoryname;
            resultArr[findIndex].Collectionname = findRecord?.Collectionname;
            resultArr[findIndex].designno = findRecord?.designno;
            resultArr[findIndex].SrJobno = findRecord?.SrJobno;
            resultArr[findIndex].DesignImage = findRecord?.DesignImage;
            resultArr[findIndex].otherMetals = [
              ...resultArr[findIndex].otherMetals,
              ...e?.otherMetals,
            ]?.flat();
            resultArr[findIndex].primaryMetal[0].Wt += e?.primaryMetal[0]?.Wt;
            resultArr[findIndex].primaryMetal[0].Amount +=
              e?.primaryMetal[0]?.Amount;
            let miscs = [...resultArr[findIndex]?.miscs, ...e?.miscs]?.flat();
            let misc = [];
            miscs?.forEach((ele) => {
              if (misc?.length === 0) {
                misc?.push(ele);
              } else {
                misc[0].Wt += ele?.Wt;
                misc[0].Amount += ele?.Amount;
              }
            });
          }
        } else {
          resultArr.push(e);
          totals.diamondColorStoneWt += e?.diamondWt + e?.colorStoneWt;
        }
      });
      resultArr?.sort((a, b) => {
        let nameA = a?.designno?.toUpperCase();
        let nameB = b?.designno?.toUpperCase();
        if (nameA > nameB) {
          return 1;
        } else if (nameA < nameB) {
          return -1;
        } else {
          return 0;
        }
      });
      let documentDetail = GovernMentDocuments(
        data?.BillPrint_Json[0]?.DocumentDetail
      );
      setDocument(documentDetail);
      setdata(resultArr);
      setTotal(totals);

      setLoader(false);
    } catch (error) {
      console.log(error);
    }
  }

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

  // console.log("data", data);
  console.log("headerData", headerData);
  // console.log("total", total);
  // console.log("taxes", taxes);

  const handleChangeImage = () => {
    image ? setImage(false) : setImage(true);
  };

  const totalConverted = total?.afterTax / headerData?.CurrencyExchRate;
  const totalPayments =
    headerData?.OldGoldAmount +
    headerData?.CashReceived +
    headerData?.AdvanceAmount +
    bank?.reduce((acc, cObj) => acc + +cObj?.amount, 0);

  const difference = Math.round((totalConverted - totalPayments) * 100) / 100;

  const decodedValue = atob(evn);
  const IsNotEvenSale = decodedValue === "Quote";


  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          {msg === "" ? (
            <>
              {" "}
              <div
                className={`container-fluid ${style?.jewelelryRetailInvoiceContainer} pad_60_allPrint position-relative px-1 ${style?.RetailInvoiceprint4}`}
              >
                <div className={`btnpcl align-items-baseline position-absolute right-0 top-0 m-0 ${style?.right_retailInvoicePrintsBtn} d-flex`}>
                  <div className="form-check pe-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={image}
                      onChange={handleChangeImage}
                      id="flexCheckDefault"
                    />
                    <label
                      className="form-check-label pt-1"
                      htmlFor="flexCheckDefault"
                    >
                      With Image
                    </label>
                  </div>
                  <Button />
                </div>

                <div className="pt-2 d-flex flex-column">
                  <div className="headlineJL printJL w-100 p-2">
                    {" "}
                    <b style={{ fontSize: "20px" }}>
                      {" "}
                      {headerData?.PrintHeadLabel}{" "}
                    </b>{" "}
                  </div>

                  {/* Main Header */}
                  <div className="d-flex printJL w-100">
                    <div className="col-10 p-2">
                      <div className="fslhJL">
                        <h5>
                          {" "}
                          <b style={{ fontSize: "16px", color: "black" }}>
                            {" "}
                            {headerData?.CompanyFullName}{" "}
                          </b>{" "}
                        </h5>
                      </div>
                      <div className="fslhJL">{headerData?.CompanyAddress}</div>
                      <div className="fslhJL">
                        {headerData?.CompanyAddress2}
                      </div>
                      <div className="fslhJL">
                        {headerData?.CompanyCity}-{headerData?.CompanyPinCode},
                        {headerData?.CompanyState}({headerData?.CompanyCountry})
                      </div>
                      <div className="fslhJL">
                        {headerData?.CompanyTellNo && (
                          <>T {headerData.CompanyTellNo}</>
                        )}

                        {headerData?.CompanyTellNo && headerData?.CompanyTollFreeNo && " | "}

                        {headerData?.CompanyTollFreeNo && (
                          <>TOLL FREE {headerData.CompanyTollFreeNo}</>
                        )}
                      </div>
                      <div className="fslhJL">
                        {headerData?.CompanyEmail}

                        {headerData?.CompanyEmail && headerData?.CompanyWebsite && " | "}

                        {headerData?.CompanyWebsite}
                      </div>
                      {/* <div className='fslhpcl3'>{headerData?.Company_VAT_GST_No} | {headerData?.Cust_CST_STATE}-{headerData?.Company_CST_STATE_No} | PAN-EDJHF236D</div> */}
                      <div className="fslhJL">
                        {[
                          headerData?.Company_VAT_GST_No,
                          headerData?.Company_CST_STATE_No &&
                          headerData?.Company_CST_STATE &&
                          `${headerData.Company_CST_STATE}-${headerData.Company_CST_STATE_No}`,
                          headerData?.Com_pannumber &&
                          `PAN-${headerData.Com_pannumber}`,
                        ]
                          .filter(Boolean)
                          .join(" | ")}
                      </div>
                    </div>
                    <div className="col-2 d-flex align-items-center justify-content-center">
                      {/* <img
                      src={headerData?.PrintLogo}
                      alt="#"
                      className={`w-100 d-block ms-auto ${style?.imgJewelleryRetailinovicePrint3}`}
                    /> */}
                      {isImageWorking && headerData?.PrintLogo !== "" && (
                        <img
                          src={headerData?.PrintLogo}
                          alt=""
                          className={`w-100 d-block ms-auto ${style?.imgJewelleryRetailinovicePrint3}`}
                          onError={handleImageErrors}
                          height={120}
                          width={150}
                        />
                      )}
                    </div>
                  </div>

                  {/* Sub Header */}
                  <div className="d-flex printJL border w-100 no_break">
                    <div className="col-8 p-2 b border-end">
                      {/* <div className="fslhJL">{headerData?.lblBillTo}</div> */}
                      <div className="fslhJL">To,</div>
                      <div className="fslhJL">
                        <b className="JL13" style={{ fontSize: "14px" }}>
                          {headerData?.CustName}
                        </b>
                      </div>
                      {headerData?.customerAddress1?.length > 0 ? (
                        <div className="fslhJL">
                          {headerData?.customerAddress1}
                        </div>
                      ) : (
                        ""
                      )}
                      {headerData?.customerAddress2?.length > 0 ? (
                        <div className="fslhJL">
                          {headerData?.customerAddress2}
                        </div>
                      ) : (
                        ""
                      )}
                      {headerData?.customerAddress3?.length > 0 ? (
                        <div className="fslhJL">
                          {headerData?.customercity}-{headerData?.PinCode}
                        </div>
                      ) : (
                        ""
                      )}
                      <div className="fslhJL">{headerData?.CompanyCountry}</div>
                      <div className="fslhJL">{headerData?.customeremail1}</div>
                      <div className="fslhJL">
                        Phno: {headerData?.customermobileno}
                      </div>
                      {headerData?.CustGstNo !== "" && (
                        <div className="fslhJL">
                          GSTIN - {headerData?.CustGstNo}
                        </div>
                      )}
                      <div className="fslhJL">
                        {headerData?.Cust_CST_STATE !== '' ? `${headerData?.Cust_CST_STATE} -` : ""}
                        {headerData?.Cust_CST_STATE_No}
                      </div>
                    </div>
                    <div className="col-4 p-2 position-relative">
                      <div className="d-flex">
                        <div className="col-6">
                          <b className="JL13">{IsNotEvenSale ? "QUOTATION NO" : "INVOICE NO"}</b>
                        </div>
                        <div className="col-6">{headerData?.InvoiceNo}</div>
                      </div>
                      <div className="d-flex">
                        <div className="col-6">
                          <b className="JL13">DATE</b>
                        </div>
                        <div className="col-6">{headerData?.EntryDate}</div>
                      </div>
                      {headerData?.HSN_No !== ""&& headerData?.HSN_No !="-Select-"  && (
                      <div className="d-flex">
                        <div className="col-6">
                          <b className="JL13">HSN</b>
                        </div>
                        <div className="col-6">{headerData?.HSN_No}</div>
                      </div>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="table_jts printJL">
                    <div className="thead_jts fs2_jts1">
                      <div className="col1_jts center_jts brr_jts">SR NO</div>
                      <div className="col2_jts center_jts brr_jts">ITEM CODE</div>
                      <div className="col3_jts center_jts brr_jts">DESCRIPTION</div>
                      <div className="col4_jts center_jts">AMOUNT</div>
                    </div>
                    <div className="tbody_jts">
                      {data?.map((e, i) => {
                        return (
                          <div
                            className="d-flex w-100 brl_jts brr_jts brb_jts fs_jts pbia_jts"
                            key={i}
                          >
                            <div className="col1_jts  d-flex align-items-start justify-content-center brr_jts p-1">
                              {i + 1}
                            </div>
                            <div className="col2_jts start_jts p-1 brr_jts d-flex flex-column align-items-center text-break">
                              <div className="text-break lh_jts">{e?.SrJobno}</div>
                              <div className="text-break fw-bold lh_jts">{e?.designno}</div>
                              {image && (
                                <div>
                                  <img
                                    src={e?.DesignImage}
                                    onError={(e) => handleImageError(e)}
                                    alt="design"
                                    className="spImag p-1"
                                  />
                                </div>
                              )}
                              <div className="text-break lh_jts">{e?.Size}</div>
                            </div>
                            <div className="col3_jts d-flex flex-column align-items-start justify-content-start p-1 brr_jts text-break">
                              <div className="d-flex align-items-start">
                                {e?.MetalTypePurity} {e?.MetalColor} {(e?.diamonds?.[0]?.Color_Code || e?.diamonds?.[0]?.Quality_Code)
  ? ` - ${e?.diamonds?.[0]?.Color_Code || ""} ${e?.diamonds?.[0]?.Quality_Code || ""}`
  : ""}  |{" "}
                                {e?.grosswt?.toFixed(3)} gms GW |{" "}
                                {e?.NetWt?.toFixed(3)} gms NW
                                {e?.diamondWt === 0
                                  ? ""
                                  : ` | DIA : ${e?.diamondWt.toFixed(3)} Cts `}
                                {e?.colorStoneWt === 0
                                  ? ""
                                  : ` | CS : ${e?.colorStoneWt.toFixed(3)} Cts `}
                                {e?.miscsWt !== 0 && e?.ismiscwtaddingrossweight === 1
                                  ? ` | MISC : ${e?.miscsWt.toFixed(3)} gms`
                                  : ""}
                              </div>
                              <div className="d-flex align-items-start">{e?.Categoryname} {e?.SubCategoryname}</div>
                              <div className="d-flex align-items-start">
                                {e?.miscs
                                  ?.filter((el) => el?.ShapeName?.includes("Certification_"))
                                  .map((el, id) => {
                                    const shapeNameAfterCertification = el?.ShapeName?.split("Certification_")[1]; // Extract the part after 'Certification_'
                                    return shapeNameAfterCertification ? <div key={id}>{shapeNameAfterCertification}-</div> : null;
                                  })}
                                {e?.CertificateNo}
                              </div>
                            </div>
                            <div className="col4_jts d-flex align-items-start justify-content-end p-1">
                              <span
                                className="pe-1"
                                dangerouslySetInnerHTML={{
                                  __html: headerData?.Currencysymbol,
                                }}
                              ></span>
                              {formatAmount(e?.TotalAmount + e?.DiscountAmt)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total Row */}
                  <div className={`${style?.minHeight20RetailinvoicePrint3} border-start border-end border-bottom d-flex no_break`}>
                    <div className={`col1_jts border-end`}></div>
                    <div className={`col2_jts border-end p-1 d-flex`}>
                      <p className="fw-bold TotlFnt1">
                        TOTAL
                      </p>
                    </div>
                    <div className={`col3_jts border-end flex-column d-flex align-items-center justify-content-end`}></div>
                    <div className={`col4_jts d-flex align-items-center justify-content-end`}>
                      <p className="fw-bold TotlFnt text-end p-1">
                        {NumberWithCommas(
                          total?.total / headerData?.CurrencyExchRate,
                          2
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Taxes And Total */}
                  <div className="d-flex printJL border-start border-end border-bottom w-100 no_break">
                    <div
                      className={`d-flex justify-content-between flex-column border-end ${style?.wordsJewellryRetailInvoice4}`}
                    >
                      <div className="h-100 d-flex flex-column justify-content-center p-2">
                        In Words {headerData?.Currencyname}<br />
                        <span className="fw-bold">
                          {toWords.convert(+(
                            total?.beforeTax / headerData?.CurrencyExchRate +
                            taxes?.reduce(
                              (acc, cObj) =>
                                acc +
                                +cObj?.amount /
                                headerData?.CurrencyExchRate,
                              0
                            ) +
                            headerData?.AddLess /
                            headerData?.CurrencyExchRate
                          )?.toFixed(2)
                          )}{" "}
                          Only
                        </span>
                      </div>
                      {IsNotEvenSale ? ("") : (
                        <div className={`${style?.RemarkJewelleryInvoicePrintC} p-2`}>
                          <div className="d-flex ">
                            Remarks :{" "}
                            <div
                              dangerouslySetInnerHTML={{
                                __html: headerData?.Remark,
                              }}
                              className="fw-bold ps-1"
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div
                      className={`${style?.discountJewerryRetailInvoicePrint456} d-flex`}
                    >
                      <div
                        className={`${style?.wordsJewellryRetailInvoice4Taxes} border-end`}
                      >
                        {total?.discount === 0 ? "" : <p className="pb-1 px-1 text-end">Discount</p>}
                        <p className="pb-1 px-1 text-end">
                          Total Amt before Tax
                        </p>
                        {taxes.length > 0 &&
                          taxes.map((e, i) => {
                            return (
                              <p className="pb-1 px-1 text-end" key={i}>
                                {e?.name} @ {e?.per}
                              </p>
                            );
                          })}
                        {headerData?.AddLess !== 0 && (
                          <p className="pb-1 px-1 text-end">
                            {headerData?.AddLess >= 0 ? "Add" : "Less"}
                          </p>
                        )}
                        <p className="pb-1 px-1 text-end">
                          Total Amt after Tax
                        </p>
                        {/* {headerData?.OldGoldAmount === 0 ? "" : <p className="pb-1 px-1 text-end">Old Gold</p> } */}
                        {headerData?.OldGoldAmount === 0 ? "" : <p className="pb-1 px-1 text-end">Old Gold</p>}
                        {headerData?.CashReceived === 0 ? "" : <p className="pb-1 px-1 text-end">Recv. in Cash</p>}
                        {bank.length > 0 &&
                          bank.map((e, i) => {
                            return (
                              <p className="pb-1 px-1 text-end" key={i}>
                                Recv. in Bank ({e?.label})
                              </p>
                            );
                          })}
                        {/* <p className="pb-1 px-1">Recv. in Bank</p> */}
                        {headerData?.AdvanceAmount === 0 ? "" : <p className="pb-1 px-1 text-end">Advance</p>}
                        <p className="pb-1 px-1 text-end">Net Bal. Amount</p>
                        <p className="fw-bold p-1 border-top text-end">
                          GRAND TOTAL
                        </p>
                      </div>
                      <div
                        className={`${style?.wordsJewellryRetailInvoice4TaxesNumbers}`}
                      >
                        {total?.discount === 0 ? "" :
                          <p className="text-end pb-1 px-1">
                            {NumberWithCommas(total?.discount, 2)}{/** Discount */}
                          </p>
                        }
                        <p className="text-end pb-1 px-1">
                          {NumberWithCommas(
                            total?.beforeTax / headerData?.CurrencyExchRate,
                            2
                          )}{/** Before Tax */}
                        </p>
                        {taxes.length > 0 &&
                          taxes.map((e, i) => {
                            return (
                              <p className="pb-1 px-1 text-end" key={i}>
                                {NumberWithCommas(
                                  +e?.amount / headerData?.CurrencyExchRate,
                                  2
                                )}
                              </p>
                            );
                          })} {/** CGST SGST */}
                        {headerData?.AddLess !== 0 && (
                          <p className="pb-1 px-1 text-end">
                            {NumberWithCommas(
                              headerData?.AddLess /
                              headerData?.CurrencyExchRate,
                              2
                            )}
                          </p>
                        )} {/** Add/Less */}
                        <p className="pb-1 px-1 text-end">
                          {NumberWithCommas(
                            total?.afterTax / headerData?.CurrencyExchRate,
                            2
                          )} {/** After Tax */}
                        </p>
                        {headerData?.OldGoldAmount === 0 ? "" :
                          <p className="pb-1 px-1 text-end">
                            {NumberWithCommas(headerData?.OldGoldAmount, 2)}
                          </p>
                        }

                        {headerData?.CashReceived === 0 ? "" :
                          <p className="pb-1 px-1 text-end">
                            {NumberWithCommas(headerData?.CashReceived, 2)} {/** Amount That Receive In Cash */}
                          </p>
                        }
                        {bank.length > 0 &&
                          bank.map((e, i) => {
                            return (
                              <p className="pb-1 px-1 text-end" key={i}>
                                {NumberWithCommas(e?.amount, 2)} {/** Amount That Receive In Bank */}
                              </p>
                            );
                          })}
                        {/* <p className="pb-1 px-1 text-end">{NumberWithCommas(headerData?.BankReceived, 2)}</p> */}
                        {headerData?.AdvanceAmount === 0 ? "" :
                          <p className="pb-1 px-1 text-end">
                            {NumberWithCommas(headerData?.AdvanceAmount, 2)} {/** Advance Given Amount */}
                          </p>
                        }
                        <p className="pb-1 px-1 text-end">
                          {
                            NumberWithCommas(difference, 2)
                          } {/** Net Balance Amount */}
                        </p>
                        <p className="fw-bold text-end p-1 border-top">
                          <span
                            dangerouslySetInnerHTML={{
                              __html: headerData?.Currencysymbol,
                            }}
                          ></span>
                          {NumberWithCommas(
                            total?.beforeTax / headerData?.CurrencyExchRate +
                            taxes?.reduce(
                              (acc, cObj) =>
                                acc +
                                +cObj?.amount / headerData?.CurrencyExchRate,
                              0
                            ) +
                            headerData?.AddLess /
                            headerData?.CurrencyExchRate,
                            2
                          )} {/** Grand Total */}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Declaration For Quotation */}
                  {IsNotEvenSale && (
                    <div className="border-start border-end border-bottom spinst">
                      <div dangerouslySetInnerHTML={{ __html: headerData?.Declaration, }}></div>
                    </div>
                  )}

                  {/* Bank Details */}
                  <div className="border-start printJL border-end border-bottom d-flex no_break">
                    <div className="col-4 p-2 border-end">
                      <p className="fw-bold">Bank Detail</p>
                      <p>Bank name: {headerData?.bankname}</p>
                      <p style={{ wordBreak: "normal" }}>
                        Branch: {headerData?.bankaddress}
                      </p>
                      {/* <p>{headerData?.PinCode}</p> */}
                      <p>Account Name: {headerData?.accountname}</p>
                      <p>Account No: {headerData?.accountnumber}</p>
                      <p>RTGS NEFT IFSC: {headerData?.rtgs_neft_ifsc}</p>
                    </div>
                    <div className="col-4 p-2 border-end d-flex justify-content-between flex-column">
                      <p>Signature</p>
                      <p className="fw-bold">{headerData?.CustName}</p>
                    </div>
                    <div className="col-4 p-2 d-flex justify-content-between flex-column">
                      <p>Signature</p>
                      <p className="fw-bold">{headerData?.CompanyFullName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
              {msg}
            </p>
          )}
        </>
      )}
    </>
  );
};

export default RetailInvoicePrintS;
