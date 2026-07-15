import React, { useEffect, useState } from "react";
import {
  HeaderComponent,
  NumberWithCommas,
  apiCall,
  checkMsg,
  fixedValues,
  formatAmount,
  handleImageError,
  handlePrint,
  isObjectEmpty,
  taxGenrator,
  mergeFindings,
  mergeMetals,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import style from "../../assets/css/prints/detailPrint5.module.css";
import "../../assets/css/prints/detailPrint5.css";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";
const DetailPrint5 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  const [loader, setLoader] = useState(true);
  const [msg, setMsg] = useState("");
  const [data, setData] = useState([]);
  const [image, setImage] = useState(true);
  const [header, setHeader] = useState(null);
  const [headerData, setHeaderData] = useState({});
  const [address, setAddress] = useState([]);
  const [total, setTotal] = useState({
    diaTotal: {
      Pcs: 0,
      Wt: 0,
      Amount: 0,
    },
    solTotal: {
      Pcs: 0,
      Wt: 0,
      Amount: 0,
    },
    gemTotal: {
      Pcs: 0,
      Wt: 0,
      Amount: 0,
    },
    metalTotal: {
      Wt: 0,
      NL: 0,
      Amount: 0,
    },
    csTotal: {
      Pcs: 0,
      Wt: 0,
      Amount: 0,
    },
    OtherCharges: 0,
    MaKingCharge_Unit: 0,
    MakingAmount: 0,
    TotalAmount: 0,
    gold24kt: 0,
    grosswt: 0,
  });

  const [taxes, setTaxes] = useState([]);
  const [diamondDetail, setdDiamondDetails] = useState([]);
  const [otherAmt, setOtherAmt] = useState(0);
  const [discountAmt, setDiscountAmt] = useState(0);
  const [brokarage, setBrokarage] = useState([]);
  const [isImageWorking, setIsImageWorking] = useState(true);

  const [MetShpWise, setMetShpWise] = useState([]);
  const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
  const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);

  const handleImageErrors = () => {
    setIsImageWorking(false);
  };

  const loadData = (data) => {
    let head = HeaderComponent("1", data?.BillPrint_Json[0]);
    setHeader(head);
    setHeaderData(data?.BillPrint_Json[0]);
    let adr = data?.BillPrint_Json[0]?.Printlable.split(`\r\n`);
    setAddress(adr);
    let resultArr = [];
    let totals = { ...total };
    let otherAmount = 0;
    let discountAmts = 0;

    let met_shp_arr = MetalShapeNameWiseArr(data?.BillPrint_Json2);

    setMetShpWise(met_shp_arr);
    let tot_met = 0;
    let tot_met_wt = 0;
    met_shp_arr?.forEach((e) => {
      tot_met += e?.Amount;
      tot_met_wt += e?.metalfinewt;
    })
    setNotGoldMetalTotal(tot_met);
    setNotGoldMetalWtTotal(tot_met_wt);

    // console.log("data?.BillPrint_Json1", data?.BillPrint_Json1);
    data?.BillPrint_Json1.forEach((e) => {
      let obj = { ...e };
      let diamonds = [];
      let colorStones = [];
      let metals = [];
      let findings = [];
      let otherAmt = 0;
      let diaTotal = {
        Pcs: 0,
        Wt: 0,
        Amount: 0,
      };
      let solTotal = {
        Pcs: 0,
        Wt: 0,
        Amount: 0,
      };
      let gemTotal = {
        Pcs: 0,
        Wt: 0,
        Amount: 0,
      };
      let metalTotal = {
        Wt: 0,
        NL: 0,
        Amount: 0,
      };
      let csTotal = {
        Pcs: 0,
        Wt: 0,
        Amount: 0,
      };
      let findingSetting = 0;
      discountAmts += e?.DiscountAmt;
      otherAmount += e?.OtherCharges + e?.TotalDiamondHandling;
      otherAmt += e?.OtherCharges + e?.TotalDiamondHandling;
      let findingTotal = {
        Pcs: 0,
        Wt: 0,
        Amount: 0,
      }
      let netWtLoss = 0;
      let count = 0;
      data?.BillPrint_Json2.forEach((ele) => {
        if (ele?.StockBarcode === e?.SrJobno) {
          obj.MakingAmount += ele.SettingAmount;


          if (ele?.MasterManagement_DiamondStoneTypeid === 5) {
            findings.push(ele);
          }
          if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
            diamonds.push(ele);
            diaTotal.Pcs += ele?.Pcs;
            diaTotal.Wt += ele?.Wt;
            diaTotal.Amount += ele?.Amount;


            diamonds = diamonds.reduce((acc, diamond) => {
              const key = `${diamond?.MaterialTypeName}-${diamond?.ShapeName}-${diamond?.QualityName}-${diamond?.Colorname}-${diamond?.SizeName}-${diamond?.IsSolGem}`;

              if (acc[key]) {
                acc[key].Pcs += diamond?.Pcs || 0;
                acc[key].Wt += diamond?.Wt || 0;
                acc[key].Amount += diamond?.Amount || 0;
              } else {
                acc[key] = { ...diamond };
              }

              return acc;
            }, {});
            diamonds = Object.values(diamonds);

            diamonds.sort((a, b) => {
              const sizeA = a.SizeName;
              const sizeB = b.SizeName;

              const isStringA = isNaN(parseFloat(sizeA));
              const isStringB = isNaN(parseFloat(sizeB));

              if (isStringA && isStringB) {
                return sizeA.localeCompare(sizeB);
              }

              if (isStringA) {
                return -1;
              }
              if (isStringB) {
                return 1;
              }

              const numA = parseFloat(sizeA);
              const numB = parseFloat(sizeB);
              return numA - numB;
            });

          } else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
            colorStones.push(ele);
            csTotal.Wt += ele?.Wt;
            csTotal.Amount += ele?.Amount;
            csTotal.Pcs += ele?.Pcs;
            if (ele?.IsSolGem === 1) {
              gemTotal.Pcs += ele?.Pcs;
              gemTotal.Wt += ele?.Wt;
              gemTotal.Amount += ele?.Amount;
            }
            colorStones.sort((a, b) => {
              const sizeA = a.SizeName;
              const sizeB = b.SizeName;

              const isStringA = isNaN(parseFloat(sizeA));
              const isStringB = isNaN(parseFloat(sizeB));

              if (isStringA && isStringB) {
                return sizeA.localeCompare(sizeB);
              }

              if (isStringA) {
                return -1;
              }
              if (isStringB) {
                return 1;
              }

              const numA = parseFloat(sizeA);
              const numB = parseFloat(sizeB);
              return numA - numB;
            });
          } else if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
            metals.push(ele);
            metalTotal.Wt += ele?.Wt;
            metalTotal.Amount += ele?.Amount;
            if (ele?.IsPrimaryMetal === 1) {
              netWtLoss += ele?.Wt;
            } else {
              count++;
            }
          } else if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
            otherAmount += ele?.Amount;
            otherAmt += ele?.Amount;
          } else if (ele?.MasterManagement_DiamondStoneTypeid === 5) {
            findingTotal.Pcs += ele?.Pcs;
            findingTotal.Wt += ele?.Wt;
            findingTotal.Amount += ele?.Amount;
            findingSetting += ele?.SettingAmount;
          }
        }
      });
      totals.diaTotal.Amount += diaTotal.Amount;
      totals.diaTotal.Pcs += diaTotal.Pcs;
      totals.diaTotal.Wt += diaTotal.Wt;
      totals.solTotal.Amount += e?.solitair_totalamount;
      totals.solTotal.Pcs += e?.solitair_pieces;
      totals.solTotal.Wt += e?.solitair_weight;
      totals.gold24kt += e?.convertednetwt; // Calculation is "metalWt * Tunch / 100" if metal Is primary and rate is 0
      // totals.gold24kt += e?.PureNetWt; // Bug Solving 24/11/2025

      totals.csTotal.Amount += csTotal.Amount;
      totals.csTotal.Pcs += csTotal.Pcs;
      totals.csTotal.Wt += csTotal.Wt;
      totals.gemTotal.Amount += gemTotal.Amount;
      totals.gemTotal.Pcs += gemTotal.Pcs;
      totals.gemTotal.Wt += gemTotal.Wt;

      totals.OtherCharges += otherAmt;
      totals.MaKingCharge_Unit += obj?.MaKingCharge_Unit;

      totals.MakingAmount += obj?.MakingAmount - findingSetting;
      totals.TotalAmount += obj?.TotalAmount;
      totals.grosswt += obj?.grosswt;

      // metalTotal.NL += e?.NetWt + e?.LossWt;

      metalTotal.Wt -= metals[0].Wt;
      metals[0].Wt = obj?.NetWt + diaTotal?.Wt / 5;
      metalTotal.Wt += metals[0].Wt;
      totals.metalTotal.Wt += metalTotal.Wt;
      // totals.metalTotal.NL += metalTotal.NL;
      totals.metalTotal.Amount += metalTotal.Amount;

      if (count === 0) {
        netWtLoss = e?.NetWt + e?.LossWt;
      }
      totals.metalTotal.NL += netWtLoss;
      metalTotal.NL += netWtLoss;
      obj.diamonds = diamonds;
      obj.findings = findings;
      obj.netWtLoss = netWtLoss;
      obj.colorStones = colorStones;
      obj.metals = metals;
      obj.findingSetting = findingSetting;
      obj.diaTotal = diaTotal;
      obj.solTotal = solTotal;
      obj.gemTotal = gemTotal;
      obj.metalTotal = metalTotal;
      obj.csTotal = csTotal;
      obj.otherAmt = otherAmt;
      obj.findingTotal = findingTotal;
      resultArr.push(obj);
    });
    setDiscountAmt(discountAmts);
    let taxValue = taxGenrator(data?.BillPrint_Json[0], totals?.TotalAmount);
    setTaxes(taxValue);
    setOtherAmt(otherAmount);
    let diamondDetails = [];

    data?.BillPrint_Json2.forEach((ele) => {
      if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
        if (ele?.ShapeName === "RND") {
          let findRnd = diamondDetails.findIndex(
            (elem) =>
              elem?.ShapeName === ele?.ShapeName &&
              elem?.Colorname === ele?.Colorname &&
              elem?.QualityName === ele?.QualityName &&
              elem?.IsSolGem === ele?.IsSolGem
          );
          if (findRnd === -1) {
            let obj = { ...ele };
            obj.label = "RND";
            diamondDetails.push(obj);
          } else {
            diamondDetails[findRnd].Wt += ele?.Wt;
            diamondDetails[findRnd].Pcs += ele?.Pcs;
          }
        } else {
          let findOther = diamondDetails.findIndex(
            (elem) => elem?.label === "OTHER"
          );
          if (findOther === -1) {
            let obj = { ...ele };
            obj.label = "OTHER";
            diamondDetails.push(obj);
          } else {
            diamondDetails[findOther].Wt += ele?.Wt;
            diamondDetails[findOther].Pcs += ele?.Pcs;
          }
        }
      }
    });

    diamondDetails.sort((a, b) => {
      if (a.label === "OTHER") {
        return -1;
      } else if (b.label === "OTHER") {
        return -1;
      } else {
        return 0;
      }
    });

    setdDiamondDetails(diamondDetails);

    totals.TotalAmount +=
      taxValue.reduce((acc, cbj) => {
        return acc + +cbj?.amount;
      }, 0) + data?.BillPrint_Json[0]?.AddLess;
    setData(resultArr);
    setTotal(totals);

    resultArr.sort((a, b) => {
      const designNoA = a.designno;
      const designNoB = b.designno;

      // Convert design numbers to actual numbers for numeric comparison
      const designNoANumber = parseInt(designNoA);
      const designNoBNumber = parseInt(designNoB);

      // If both designnos are numbers, compare them numerically
      if (!isNaN(designNoANumber) && !isNaN(designNoBNumber)) {
        return designNoANumber - designNoBNumber;
      }

      // If only one designno is a number, it should come before the other
      if (!isNaN(designNoANumber)) {
        return -1;
      }
      if (!isNaN(designNoBNumber)) {
        return 1;
      }

      // Both designnos are strings, compare them as strings
      return designNoA.localeCompare(designNoB);
    });

    let brokr = (data?.BillPrint_Json[0]?.Brokerage.split("@-@"));
    brokr = brokr.map(ele => ele?.split('#-#'));
    setBrokarage(brokr);
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

  // In Metal Only Primary Metal's Weight And Amounts 20/11/2025
  const totalWeight = data?.map((e) =>
    e?.metals
      ?.filter((metl) => metl?.IsPrimaryMetal === 1)
      ?.reduce((acc, metl) => acc + (metl?.Wt || 0), 0) || 0
  );

  const TotalDmdMetlWt = totalWeight.reduce((acc, wt) => acc + wt, 0);

  const metalAmount = data?.map((e) =>
    e?.metals
      ?.filter((metl) => metl?.IsPrimaryMetal === 1)
      ?.reduce((acc, metl) => acc + (metl?.Amount || 0), 0) || 0
  );

  const totalMetalAmount = metalAmount.reduce((acc, amt) => acc + amt, 0);

  const totalWeightNl = data?.reduce((acc, ele) => acc + (ele?.netWtLoss || 0), 0);

  function PrintableText({ headerData }) {
    const htmlContent = headerData?.Printlable?.replace(/\n/g, '<br />');

    return (
      <div
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  const TotalLoss = data?.reduce((acc, ele) => acc + ele?.LossWt, 0);

  const TotalPcsDMD = data?.reduce((acc, ele) => acc + (ele?.diamonds?.reduce?.((acc, ele) => acc + ele?.Pcs, 0)), 0);
  const TotalWtDMD = data?.reduce((acc, ele) => acc + (ele?.diamonds?.reduce?.((acc, ele) => acc + ele?.Wt, 0)), 0);
  const TotalAmtDMD = data?.reduce((acc, ele) => acc + (ele?.diamonds?.reduce?.((acc, ele) => acc + ele?.Amount, 0)), 0);

  const TotalAmtCLR = data?.reduce((acc, ele) => acc + (ele?.colorStones?.reduce?.((acc, ele) => acc + ele?.Amount, 0)), 0);
  const TotalWtCLR = data?.reduce((acc, ele) => acc + (ele?.colorStones?.reduce?.((acc, ele) => acc + ele?.Wt, 0)), 0);
  const TotalPcsCLR = data?.reduce((acc, ele) => acc + (ele?.colorStones?.reduce?.((acc, ele) => acc + ele?.Pcs, 0)), 0);

  // console.log("TotalPcsDMD", TotalPcsDMD);
  // console.log("TotalWtDMD", TotalWtDMD);
  // console.log("TotalAmtDMD", TotalAmtDMD);
  // console.log("TotalDmdMetlWt", TotalDmdMetlWt);
  // console.log("headerData", headerData);
  console.log("data", data);
  // console.log("MetShpWise", MetShpWise);
  // console.log("total", total);
  // console.log("address", address);

  // const discountCriteria = [
  //   { key: 'DiamondDiscountAmount', label: 'Diamond' },
  //   { key: 'MetalDiscountAmount', label: 'Metal' },
  //   { key: 'StoneDiscountAmount', label: 'Colorstone' },
  //   { key: 'LabourDiscountAmount', label: 'Labour' },
  //   { key: 'SolitaireDiscountAmount1', label: 'Solitaire' },
  //   { key: 'MiscDiscountAmount', label: 'Misc' },
  // ];

  const discountCriteria = [
    { key: 'DiamondDiscount', isAmountKey: 'IsDiamondDiscInAmount', label: 'Diamond', disAmount: "DiamondDiscountAmount" },
    { key: 'MetalDiscount', isAmountKey: 'IsMetalDiscInAmount', label: 'Metal', disAmount: "MetalDiscountAmount" },
    { key: 'StoneDiscount', isAmountKey: 'IsStoneDiscInAmount', label: 'Colorstone', disAmount: "StoneDiscountAmount" },
    { key: 'LabourDiscount', isAmountKey: 'IsLabourDiscInAmount', label: 'Labour', disAmount: "LabourDiscountAmount" },
    { key: 'SolitaireDiscount', isAmountKey: 'IsSolitaireDiscInAmount', label: 'Solitaire', disAmount: "SolitaireDiscountAmount1" },
    { key: 'MiscDiscount', isAmountKey: 'IsMiscDiscInAmount', label: 'Misc', disAmount: "MiscDiscountAmount" },
  ];
  const IsEvnQuote = atob(evn)?.toLowerCase() === "quote";

  return loader ? (
    <Loader />
  ) : msg === "" ? (
    <div className={`container container-fluid max_width_container mt-1 ${style?.detailPrint5} pad_60_allPrint detailPrint5Container`} >
      {/* buttons */}
      <div className={`d-flex justify-content-end align-items-center ${style?.print_sec_sum4} mb-4`}>
        <div className="form-check pe-3 pt-2">
          <input
            className="form-check-input border-dark"
            type="checkbox"
            checked={image}
            id="imghs"
            onChange={(e) => setImage(!image)}
          />
          <label className="form-check-label" htmlFor="imghs" style={{ paddingTop: "3px" }}>With Image me</label>
        </div>
        <div className="form-check ps-3">
          <input
            type="button"
            className="btn_white blue py-1 mt-2"
            value="Print"
            onClick={(e) => handlePrint(e)}
          />
        </div>
      </div>

      {/* Main Header */}
      <div className={`headerTitle headline_dp5`}>{headerData?.PrintHeadLabel}</div>
      <div className={`d-flex justify-content-between`}>
        <div className={`p-2`}>
          <div className="spFntCmpnyNam" style={{ fontWeight: "bold" }}>
            {headerData?.CompanyFullName}
          </div>
          <div>{headerData?.CompanyAddress}</div>
          <div>{headerData?.CompanyAddress2}</div>
          <div>{headerData?.CompanyCity}-{headerData?.CompanyPinCode},{headerData?.CompanyState}({headerData?.CompanyCountry})</div>
          {/* <div >Tell No: {headerData?.CompanyTellNo}</div> */}
          {/* <div >Tell No:  {headerData?.CompanyTellNo}</div> */}
          <div>T {headerData?.CompanyTellNo}</div>
          <div>
            {headerData?.CompanyEmail} | {headerData?.CompanyWebsite}
          </div>
          <div>
            {/* {headerData?.Company_VAT_GST_No} | {headerData?.Company_CST_STATE}-{headerData?.Company_CST_STATE_No} | PAN-{headerData?.Pannumber} */}
            {headerData?.Company_VAT_GST_No} | {headerData?.Company_CST_STATE}-{headerData?.Company_CST_STATE_No} | PAN-{headerData?.Pannumber}
          </div>
        </div>
        <div className="d-flex justify-content-end pe-2 pt-2">
          <img
            src={headerData?.PrintLogo}
            alt=""
            onError={handleImageErrors}
            className="w-100 h-auto ms-auto d-block object-fit-contain headImg_Pcl7"
            style={{}}
            height={120}
            width={150}
          />
        </div>
      </div>

      {/* Sub header */}
      <div className="d-flex border mb-1 FntSbHed">
        <div className="col-4 border-end p-1">
          <p>{headerData?.lblBillTo}</p>
          <p className="fw-semibold SPFntSbHed">{headerData?.customerfirmname}</p>
          <p>{headerData?.customerAddress2}</p>
          <p>{headerData?.customerAddress1}</p>
          <p>{headerData?.customerAddress3}</p>
          <p>
            {headerData?.customercity1}
            {headerData?.customerpincode}
          </p>
          <p>{headerData?.customeremail1}</p>

          <p>
            {/* GSTIN-{headerData?.CustGstNo} | {headerData?.Cust_CST_STATE}-
            {headerData?.Cust_CST_STATE_No} | PAN-{headerData?.CustPanno} */}
            {headerData?.vat_cst_pan}
          </p>
          {headerData?.Cust_CST_STATE_No !== "" && (
            <p>
              {headerData?.Cust_CST_STATE}-{headerData?.Cust_CST_STATE_No}
            </p>
          )}
        </div>
        <div className="col-5 border-end p-1">
          <p style={{ lineHeight: "6px", paddingTop: "4px" }}>Ship To,</p>
          <p className="fw-semibold SPFntSbHed">{headerData?.customerfirmname}</p>
          <PrintableText headerData={headerData} />
        </div>
        <div className="col-3 p-1">
          <div className="d-flex">
            <div className="col-3">
              <p className="fw-semibold pe-2">BILL NO</p>
            </div>
            <div className="col-9">
              <p>{headerData?.InvoiceNo}</p>
            </div>
          </div>
          <div className="d-flex">
            <div className="col-3">
              <p className="fw-semibold pe-2">DATE</p>
            </div>
            <div className="col-9">
              <p>{headerData?.EntryDate}</p>
            </div>
          </div>
          {headerData?.HSN_No !== '' && (
            <div className="d-flex">
              <div className="col-3">
                <p className="fw-semibold pe-2">HSN</p>
              </div>
              <div className="col-9">
                <p>{headerData?.HSN_No}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={``}>
        {/* Table Header */}
        <div className={`d-flex border-start border-top border-end PgeBrakInsid lightGrey ${style?.detailPrint5TableHead}`}>
          <div className={`${style?.srNo} border-end d-flex justify-content-center align-items-center fw-bold`} >
            Sr
          </div>
          <div className={`${style?.design} border-end d-flex justify-content-center align-items-center fw-bold`} >
            Design
          </div>
          <div className={`${style?.diamond} border-end fw-bold`}>
            <div className="d-grid h-100 w-100">
              <div className="d-flex w-100 border-bottom justify-content-center">
                Diamond
              </div>
              <div className="d-flex w-100">
                <div className="WdthSpDCM1 border-end text-center">Code</div>
                <div className="WdthSpDCM2 border-end text-center">Size</div>
                <div className="WdthSpDCM3 border-end text-center">Pcs</div>
                <div className="WdthSpDCM2 border-end text-center">Wt</div>
                <div className="WdthSpDCM2 border-end text-center">Rate</div>
                <div className={`WdthSpDCM1 text-center ${style?.detailPrint5TableHeadAMT}`}>Amount</div>
              </div>
            </div>
          </div>

          <div className={`${style?.metal} border-end fw-bold`}>
            <div className="d-grid h-100 w-100">
              <div className="d-flex w-100 border-bottom justify-content-center justify-content-center">
                Metal
              </div>
              <div className="d-flex w-100">
                <div className={`${style?.w_20} border-end text-center`}>
                  Quality
                </div>
                <div className={`${style?.w_20} border-end text-center`}>
                  *Wt
                </div>
                <div className={`${style?.w_20} border-end text-center`}>
                  {TotalLoss !== 0 ? "N+L" : "Net Wt"}
                </div>
                <div className={`${style?.w_20} border-end text-center`}>
                  Rate
                </div>
                <div className={`${style?.w_20} text-center`}>Amount</div>
              </div>
            </div>
          </div>

          <div className={`${style?.stone} border-end fw-bold`}>
            <div className="d-grid h-100 w-100">
              <div className="d-flex w-100 border-bottom justify-content-center">
                Stone
              </div>
              <div className="d-flex w-100">
                <div className={`WdthSpDCM1 border-end text-center`}>Code</div>
                <div className={`WdthSpDCM2 border-end text-center`}>Size</div>
                <div className={`WdthSpDCM3 border-end text-center`}>Pcs</div>
                <div className={`WdthSpDCM2 border-end text-center`}>Wt</div>
                <div className={`WdthSpDCM2 border-end text-center`}>Rate</div>
                <div className={`WdthSpDCM1 text-center ${style?.detailPrint5TableHeadAMT}`}>Amount</div>
              </div>
            </div>
          </div>

          <div
            className={`${style?.otherAmount} spbrWord border-end d-flex justify-content-center align-items-center text-center fw-bold`}
          >
            Other Amount
          </div>
          <div className={`${style?.labour} border-end text-center fw-bold`}>
            <div className="d-grid h-100 w-100">
              <div className="d-flex w-100 border-bottom justify-content-center">
                Labour
              </div>
              <div className="d-flex w-100">
                <div className={`col-6 border-end text-center border-end`}>
                  Rate
                </div>
                <div className={`col-6 text-center`}>Amount</div>
              </div>
            </div>
          </div>
          <div
            className={`${style?.totalAmount} spbrWord d-flex justify-content-center align-items-center text-center fw-bold`}
          >
            Total Amount
          </div>
        </div>

        {/* Table Data */}
        {data.map((e, i) => {
          {/* For Discount Criteria */ }


          // const activeDiscounts = discountCriteria
          //   .filter(({ key }) => e?.[key] > 0)
          //   .map(({ label }) => label)
          //   .join(', ');


          const discountDisplay = discountCriteria
            .filter(({ key }) => e?.[key] > 0)
            .map(({ key, isAmountKey, label, disAmount }) => {
              const num = Number(e[key]);
              const am = Number(e[disAmount])
              const decimals = e[isAmountKey] === 1 ? 3 : 2;
              const val = num.toFixed(decimals);
              return e[isAmountKey] === 0 ? `${val}% @${label} Amount ` : `${val} @${label} Amount`;
            })
            .join(', ');

          const mergedMetals = mergeMetals(e?.metals);
         const mergedFindings = mergeFindings(e?.findings);

        
        console.log("TCL: eeeee",e )

          return (
            <div className="PgeBrakInsid SpBrdersBtom" key={i}>
              {/* Per Job Details */}
              <div className={`d-flex border-start border-top border-end ${style?.detailPrint5Table}`}>
                <div className={`${style?.srNo} border-end text-center p-1 ${style?.wordBreak}`}>
                  {i + 1}
                </div>

                <div className={`${style?.design} border-end p-1`}>
                  <div className="d-flex justify-content-between">
                    <p> {e?.designno} </p>
                    <div>
                      <p className="text-end">{e?.SrJobno}</p>
                      <p className="text-end">{e?.MetalColor}</p>
                    </div>
                  </div>
                  <img
                    src={e?.DesignImage}
                    alt=""
                    className={`${style?.img} mx-auto d-block w-100 ${!image && `d-none`
                      }`}
                    onError={handleImageError}
                  />
                  {e?.HUID !== "" && (
                    <p className="text-center">HUID: {e?.HUID}</p>
                  )}
                  <p className="text-center">
                    <p className="fw-bold">PO: </p>
                    <p className="">{e?.lineid}</p>
                  </p>
                  {e?.batchnumber !== "" && (
                    <p className="text-center">{e?.batchnumber}</p>
                  )}

                  <p className="text-center">
                    Tunch :{" "}
                    <span className="fw-bold">
                      {NumberWithCommas(e?.Tunch, 3)}
                    </span>
                  </p>
                  <p className="text-center">
                    <span className="fw-bold">
                      {NumberWithCommas(e?.grosswt, 3)} gm
                    </span>{" "}
                    Gross
                  </p>
                </div>

                <div className={`${style?.diamond} border-end position-relative pb-1`} >
                  {e?.diamonds.map((ele, ind) => {
                    return (
                      <div className="d-flex w-100" key={ind}>
                        <div className={`ATWdthSpDCM1 spbrWord`}>
                          {ele?.IsSolGem === 1 ? "S:" : ""}
                          {ele?.MaterialTypeName} {ele?.ShapeName} {ele?.QualityName} {ele?.Colorname}
                        </div>
                        <div className={`ATWdthSpDCM2 ${style?.wordBreak} text-end`}>{ele?.SizeName}</div>
                        <div className={`ATWdthSpDCM3 text-end ${style?.wordBreak}`}>
                          {ele?.Pcs !== 0 ? ele?.Pcs : ""}
                        </div>
                        <div className={`ATWdthSpDCM4 text-end ${style?.wordBreak}`}>
                          {fixedValues(ele?.Wt, 3)}
                        </div>
                        <div className={`ATWdthSpDCM5 text-end ${style?.wordBreak}`}>
                          {NumberWithCommas(ele?.Rate, 2)}
                        </div>
                        <div className={`ATWdthSpDCM6 text-end fw-bold ${style?.wordBreak}`}>
                          {IsEvnQuote ? NumberWithCommas(ele?.Amount / headerData?.CurrencyExchRate, 2) : NumberWithCommas(ele?.Amount, 2)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={`${style?.metal} border-end position-relative pb-1`} >
                  {mergedMetals.map((ele, ind) => {
                    return (
                      <div className="d-flex w-100" key={ind}>
                        <div className={`${style?.w_20} spbrWord`}>
                          {ele?.ShapeName} {ele?.QualityName}{" "}
                        </div>
                        <div className={`${style?.w_20} text-end  ${style?.wordBreak}`}>
                          {
                            ele?.IsPrimaryMetal == 1
                              ? (
                                ind === 0
                                  ? NumberWithCommas(
                                    e?.NetWt,
                                    3
                                  )
                                  : NumberWithCommas(ele?.Wt, 3)
                              )
                              : ""
                          }
                        </div>
                        <div className={`${style?.w_20} text-end  ${style?.wordBreak}`}>
                          {/* {ind === 0 && e?.metals?.length <= 1 ? fixedValues(e?.netWtLoss, 3)
                            : ind === 0 && e?.metals?.length >= 1 && ele?.IsPrimaryMetal === 0 ? fixedValues(ele?.Wt - e?.netWtLoss, 3)
                              : ele?.IsPrimaryMetal === 1 ? fixedValues(ele?.Wt, 3)
                                : ele?.IsPrimaryMetal === 0 && fixedValues(ele?.Wt, 3)
                          } */}
                          {NumberWithCommas(ele?.Wt, 3)}
                        </div>
                        <div className={`${style?.w_20} text-end  ${style?.wordBreak}`}>
                          {ele?.Rate?.toFixed(2)}
                        </div>
                        <div className={`${style?.w_20} text-end ${style?.wordBreak}`}>
                          {ele?.IsPrimaryMetal !== 1 ? <p className="fw-bold">{IsEvnQuote ? (ele?.Amount / headerData?.CurrencyExchRate)?.toFixed(2) : ele?.Amount?.toFixed(2)}</p> : <p>{IsEvnQuote ? (ele?.Amount / headerData?.CurrencyExchRate)?.toFixed(2) : ele?.Amount?.toFixed(2)}</p>}
                        </div>
                      </div>
                    );
                  })}

                  {mergedFindings.map((ele, ind) => {
                    return (
                      <div className="d-flex w-100" key={ind}>
                        <div className={`${style?.w_20} spbrWord`}>
                          {ele?.ShapeName} {ele?.QualityName}{" "}
                        </div>
                        <div className={`${style?.w_20} text-end  ${style?.wordBreak}`}>
                          
                        </div>
                        <div className={`${style?.w_20} text-end  ${style?.wordBreak}`}>
                       
                          {NumberWithCommas(ele?.Wt, 3)}
                        </div>
                        <div className={`${style?.w_20} text-end  ${style?.wordBreak}`}>
                          {ele?.Rate?.toFixed(2)}
                        </div>
                        <div className={`${style?.w_20} text-end ${style?.wordBreak}`}>
                          {   <p> {  ele?.Amount?.toFixed(2)}</p>}
                        </div>
                      </div>
                    );
                  })}

                  {e?.JobRemark !== "" && (
                    <div className="d-flex w-100">
                      <div>
                        <p>Remark:</p>
                        <p className={`fw-bold`}>{e?.JobRemark}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`${style?.stone} border-end position-relative pb-1`} >
                  {e?.colorStones.map((ele, ind) => {
                    return (
                      <div className="d-flex w-100" key={ind}>
                        <div className={`ATWdthSpDCM1 spbrWord`}>
                          {ele?.IsSolGem === 1 ? "G:" : ""}
                          {ele?.MaterialTypeName} {ele?.ShapeName} {ele?.QualityName} {ele?.Colorname}
                        </div>
                        <div className={`ATWdthSpDCM2 text-center ${style?.wordBreak}`}>
                          {ele?.SizeName}
                        </div>
                        <div className={`ATWdthSpDCM3 ${style?.wordBreak} text-end`}>
                          {ele?.Pcs}
                        </div>
                        <div className={`ATWdthSpDCM4 ${style?.wordBreak} text-end`}>
                          {fixedValues(ele?.Wt, 3)}
                        </div>
                        <div className={`ATWdthSpDCM5 text-center ${style?.wordBreak}`}>
                          {NumberWithCommas(ele?.Rate, 2)}
                        </div>
                        <div className={`ATWdthSpDCM6 fw-bold ${style?.wordBreak} text-end`}>
                          {IsEvnQuote ? NumberWithCommas(ele?.Amount / headerData?.CurrencyExchRate, 2) : NumberWithCommas(ele?.Amount, 2)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={`${style?.otherAmount} border-end  text-end position-relative`} >
                  <div className="d-grid h-100 w-100">
                    <div>
                      <p className="text-end">
                        {IsEvnQuote ? NumberWithCommas(e?.otherAmt / headerData?.CurrencyExchRate, 2) : NumberWithCommas(e?.otherAmt, 2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`${style?.labour} border-end text-center position-relative pb-1 ${style?.wordBreak}`} >
                  <div className="d-grid h-100 w-100">
                    <div>
                      <div className={`d-flex w-100 ${style?.wordBreak}`}>
                        <div className={`col-6 text-end`}>
                          {e?.MaKingCharge_Unit !== 0
                            ? NumberWithCommas(e?.MaKingCharge_Unit, 2)
                            : '0.00'
                          }
                        </div>
                        <div className={`col-6 text-end`}>
                          {e?.MakingAmount !== 0
                            ? NumberWithCommas(e?.netWtLoss * e?.MaKingCharge_Unit, 2)
                            : '0.00'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`${style?.totalAmount}  text-end position-relative pb-1 ${style?.wordBreak}`} >
                  <div className={`d-grid h-100 w-100`}>
                    <div>
                      <p className={`text-end fw-bold`}>
                        {e?.UnitCost !== 0 &&
                          IsEvnQuote ? NumberWithCommas((e?.UnitCost + e?.DiscountAmt) / headerData?.CurrencyExchRate, 2) : NumberWithCommas(e?.UnitCost, 2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Per Job Total */}
              <div className={`PrJobFnt d-flex border-start border-end`}>
                <div className={`${style?.srNo} border-end text-center p-1 ${style?.wordBreak}`}>
                </div>
                <div className={`${style?.design} border-end px-1`}>
                  {e?.Size !== "" && (
                    <p className="text-center">Size: {e?.Size}</p>
                  )}
                </div>
                <div className={`${style?.diamond} border-end lightGrey border-top`} >
                  <div className="d-flex w-100">
                    <div className="col-2 text-end"></div>
                    <div className="col-2 text-end"></div>
                    <div className={`col-2 text-end fw-bold ${style?.wordBreak}`}>
                      {e?.diamonds?.reduce((acc, ele) => acc + (ele?.Pcs || 0), 0) !== 0 ? e?.diamonds?.reduce((acc, ele) => acc + (ele?.Pcs || 0), 0) : null}
                    </div>
                    <div className={`col-2 text-end fw-bold ${style?.wordBreak}`}>
                      {
                        e?.diamonds?.reduce((acc, ele) => acc + (ele?.Wt || 0), 0) === 0
                          ? '0.000'
                          : fixedValues(e?.diamonds?.reduce((acc, ele) => acc + (ele?.Wt || 0), 0), 3)
                      }
                    </div>
                    {/* <div className="col-2 text-end"></div> */}
                    <div className={`col-4 text-end fw-bold ${style?.wordBreak}`}>
                      {
                        e?.diamonds?.reduce((acc, ele) => acc + (ele?.Amount || 0), 0) === 0
                          ? '0.00'
                          : IsEvnQuote ? fixedValues(e?.diamonds?.reduce((acc, ele) => acc + (ele?.Amount || 0), 0) / headerData?.CurrencyExchRate, 2)
                            : fixedValues(e?.diamonds?.reduce((acc, ele) => acc + (ele?.Amount || 0), 0), 2)
                      }
                    </div>
                  </div>
                </div>

                <div className={`${style?.metal} border-end lightGrey border-top`} >
                  <div className={`d-flex w-100 ${style?.wordBreak}`}>
                    {/* <div className={`${style?.w_20} text-end`}></div> */}
                    <div className={`${style?.w_20} text-end fw-bold`} style={{ width: '40%' }}>
                      {/* {e?.metals?.filter((e) => e?.IsPrimaryMetal === 1)
                      
                        ?.map((e) => NumberWithCommas(e?.Wt, 3))
                      } */}

                      { fixedValues(e?.NetWt + (e?.diaTotal?.Wt / 5 || 0), 3)}
                    </div>
                    <div className={`${style?.w_20} text-end fw-bold`}>
                      {/* {e?.netWtLoss !== 0 &&  NumberWithCommas(e?.netWtLoss, 3)} */}
                      {fixedValues((e?.metalTotal?.Wt + e?.findingTotal?.Wt ), 3)}
                    </div>
                    {/* <div className={`${style?.w_20} text-end`}></div> */}
                    <div className={`${style?.w_20} text-end fw-bold`} style={{ width: '40%' }}>
                      {/* {e?.metals?.filter((e) => e?.IsPrimaryMetal === 1)?.map((e) =>
                        IsEvnQuote ? NumberWithCommas(e?.Amount / headerData?.CurrencyExchRate, 2) : NumberWithCommas(e?.Amount, 2))
                      } */}
                       {e?.metalTotal?.Amount !== 0 &&
                                                       NumberWithCommas(
                                                         (e?.metalTotal?.Amount + e?.findingTotal?.Amount) /
                                                         headerData?.CurrencyExchRate
                                                      ,2 )}
                    </div>
                  </div>
                </div>

                <div className={`${style?.stone} border-end lightGrey border-top`} >
                  <div className={`d-flex w-100 ${style?.wordBreak}`}>
                    <div className={`col-2 text-end`}></div>
                    <div className={`col-2 text-end`}></div>
                    <div className={`col-2 text-end fw-bold`}>
                      {e?.csTotal?.Pcs !== 0 ? e?.csTotal?.Pcs : null}
                    </div>
                    <div className={`col-2 text-end fw-bold`}>
                      {e?.csTotal?.Wt !== 0 ? fixedValues(e?.csTotal?.Wt, 3) : '0.000'}
                    </div>
                    {/* <div className={`col-2 text-end`}></div> */}
                    <div className={`col-4 text-end fw-bold`}>
                      {e?.csTotal?.Amount !== 0 ?
                        IsEvnQuote ? NumberWithCommas(e?.csTotal?.Amount / headerData?.CurrencyExchRate, 2) : NumberWithCommas(e?.csTotal?.Amount, 2) : '0.00'}
                    </div>
                  </div>
                </div>

                <div className={`${style?.otherAmount} border-end border-top text-end lightGrey`} >
                  <div className={`d-flex w-100 justify-content-end ${style?.wordBreak}`}>
                    <p className={` text-end fw-bold`}>
                      {IsEvnQuote ? NumberWithCommas(e?.otherAmt / headerData?.CurrencyExchRate, 2) : NumberWithCommas(e?.otherAmt, 2)}
                    </p>
                  </div>
                </div>
                <div className={`${style?.labour} border-end text-center ${style?.wordBreak} lightGrey border-top`} >
                  <div className={`d-flex w-100 ${style?.totaltotal}`}>
                    {/* <div className={`col-6 text-end`}>
                        {e?.MaKingCharge_Unit !== 0 &&
                        NumberWithCommas(e?.MaKingCharge_Unit, 2)}
                      </div> */}
                    <div className={`col-12 text-end fw-bold`}>
                      {e?.MakingAmount !== 0
                        ? NumberWithCommas(e?.netWtLoss * e?.MaKingCharge_Unit, 2)
                        : '0.00'
                      }
                    </div>
                  </div>
                </div>
                <div className={`${style?.totalAmount} text-end lightGrey ${style?.wordBreak} border-top`} >
                  <div className="w-100">
                    <p className={`text-end fw-bold`}>
                      {e?.TotalAmount !== 0 &&
                        IsEvnQuote ? NumberWithCommas((e?.UnitCost + e?.DiscountAmt) / headerData?.CurrencyExchRate, 2) : NumberWithCommas(e?.UnitCost, 2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Per Job Discount */}
              {e?.DiscountAmt !== 0 && (
                <div className={`PrJobFnt d-flex border-top lightGrey border-start border-end ${style?.wordBreak}`} key={i + "i"} >
                  <div className={`${style?.srNo} border-end text-center p-1`}></div>
                  <div className={`${style?.design} border-end p-1`}></div>
                  <div className={`${style?.diamond} border-end`}></div>
                  <div className={`${style?.metal} border-end`}></div>
                  <div className={`${style?.stone} border-end`}>
                    <p className="text-end fw-bold">
                      {/* Discount {NumberWithCommas(e?.Discount, 2)} */}
                      {/* {e?.DiamondDiscountAmount 
                        ? "% @Diamond Amount"
                        : e?.MetalDiscountAmount
                          ? "% @Metal Amount"
                          : e?.StoneDiscountAmount 
                            ? "% @Colorstone Amount"
                            : e?.MiscDiscountAmount
                              ? "% @Misc Amount"
                              : e?.LabourDiscountAmount
                                ? "% @Labour Amount"
                                : e?.SolitaireDiscountAmount1
                                  ? "% @Solitaire Amount"
                                  : "% @Total Amount"
                      }  */}
                      {/* {activeDiscounts ? `% @${activeDiscounts} Amount` : "% @Total Amount"} */}
                      Discount {discountDisplay || `${NumberWithCommas(e?.Discount, 2)} @ Total Amount`}
                      {/* e?.isdiscountinamount */}
                    </p>
                  </div>
                  <div className={`${style?.otherAmount} border-end  text-end`}></div>
                  <div className={`${style?.labour} border-end text-center`}>
                    <p className="text-end fw-bold">
                      {IsEvnQuote ? NumberWithCommas(e?.DiscountAmt / headerData?.CurrencyExchRate, 2) : NumberWithCommas(e?.DiscountAmt, 2)}
                    </p>
                  </div>
                  <div className={`${style?.totalAmount} text-end fw-bold`}>
                    <p className="text-end fw-bold">
                      {IsEvnQuote ? NumberWithCommas(e?.TotalAmount / headerData?.CurrencyExchRate, 2) : NumberWithCommas(e?.TotalAmount, 2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Taxes */}
        <div className="d-flex PrJobFnt border-top PgeBrakInsid border-start border-end">
          <div className={`${style?.taxes} border-end SpcAtRigt`}>
            {discountAmt !== 0 && <p className="text-end">
              Total Discount
            </p>}
            {taxes.map((e, i) => {
              return (
                <p className="text-end" key={i}>
                  {e?.name} @ {e?.per}
                </p>
              );
            })}
            <p className="text-end">
              {headerData?.AddLess >= 0 ? "Add" : "Less"}
            </p>
          </div>
          <div className={`${style?.totalAmount} SpcAtRigt`}>
            {discountAmt !== 0 && <p className="text-end">
              {IsEvnQuote ? NumberWithCommas(discountAmt / headerData?.CurrencyExchRate, 2) : NumberWithCommas(discountAmt, 2)}
            </p>}
            {taxes.map((e, i) => {
              return (
                <p className="text-end" key={i}>
                  {IsEvnQuote ? formatAmount(e?.amount / headerData?.CurrencyExchRate, 2) : formatAmount(e?.amount, 2)}
                </p>
              );
            })}
            <p className="text-end">
              {NumberWithCommas(headerData?.AddLess, 2)}
            </p>
          </div>
        </div>

        {/* Table Total Row */}
        <div className={`PrJobFnt d-flex border-top border-start PgeBrakInsid border-end lightGrey ${style?.wordBreak}`}>
          <div className={`${style?.total} border-end`}>
            <p className="text-center fw-bold">TOTAL</p>
          </div>
          <div className={`${style?.diamond} border-end`}>
            <div className={`d-flex w-100 ${style?.totaltotal}`}>
              <div className="col-2 text-end"></div>
              <div className="col-2 text-end"></div>
              <div className="col-2 text-end fw-bold">
                {TotalPcsDMD !== 0 ? TotalPcsDMD : '0'}
              </div>
              <div className="col-2 text-end fw-bold">
                {TotalWtDMD !== 0 ? fixedValues(TotalWtDMD, 3) : '0.000'}
              </div>
              {/* <div className="col-2 text-end"></div> */}
              <div className="col-4 fw-bold d-flex justify-content-end align-items-center">
                {TotalAmtDMD !== 0 ? IsEvnQuote ? NumberWithCommas(TotalAmtDMD / headerData?.CurrencyExchRate, 2) : NumberWithCommas(TotalAmtDMD, 2) : '0.00'}
              </div>
            </div>
          </div>

          <div className={`${style?.metal} border-end`}>
            <div className={`d-flex w-100 ${style?.totaltotal}`}>
              {/* <div className={`${style?.w_20} text-end`}></div> */}
              <div className={`${style?.w_20} text-end fw-bold`} style={{ width: '40%' }}>
                {TotalDmdMetlWt !== 0 &&
                  fixedValues(TotalDmdMetlWt, 3)}
              </div>
              <div className={`${style?.w_20} text-end fw-bold`}>
                {totalWeightNl !== 0 &&
                  fixedValues(totalWeightNl, 3)}
              </div>
              {/* <div className={`${style?.w_20} text-end`}></div> */}
              <div className={`${style?.w_20} text-end fw-bold`} style={{ width: '40%' }}>
                {totalMetalAmount !== 0 &&
                  IsEvnQuote ? NumberWithCommas(totalMetalAmount / headerData?.CurrencyExchRate, 2) : NumberWithCommas(totalMetalAmount, 2)}
              </div>
            </div>
          </div>

          <div className={`${style?.stone} border-end`}>
            <div className={`d-flex w-100 ${style?.totaltotal}`}>
              <div className={`col-2 text-end`}></div>
              <div className={`col-2 text-end`}></div>
              <div className={`col-2 text-end fw-bold`}>
                {TotalPcsCLR !== 0 ? TotalPcsCLR : '0'}
              </div>
              <div className={`col-2 text-end fw-bold`}>
                {TotalWtCLR !== 0 ?
                  fixedValues(TotalWtCLR, 3) : '0.000'}
              </div>
              {/* <div className={`col-2 text-end`}></div> */}
              <div className={`col-4 text-end fw-bold`}>
                {TotalAmtCLR !== 0 ?
                  IsEvnQuote ? NumberWithCommas(TotalAmtCLR / headerData?.CurrencyExchRate, 2) : NumberWithCommas(TotalAmtCLR, 2) : '0.00'}
              </div>
            </div>
          </div>

          <div className={`${style?.otherAmount} border-end  text-end`}>
            <div>
              <p className="text-end fw-bold">
                {" "}
                {total?.OtherCharges !== 0 &&
                  IsEvnQuote ? NumberWithCommas(total?.OtherCharges / headerData?.CurrencyExchRate, 2) : NumberWithCommas(total?.OtherCharges, 2)}
              </p>
            </div>
          </div>
          <div className={`${style?.labour} border-end text-center`}>
            <div className={`d-flex w-100 ${style?.totaltotal}`}>
              {/* <div className={`col-6 text-end`}></div> */}
              <div className={`col-12 text-end fw-bold`}>
                {total?.MakingAmount !== 0 &&
                  IsEvnQuote ? NumberWithCommas(total?.MakingAmount / headerData?.CurrencyExchRate, 2) : NumberWithCommas(total?.MakingAmount, 2)}
              </div>
            </div>
          </div>
          <div className={`${style?.totalAmount}  text-end`}>
            <div>
              <p className={`text-end fw-bold`}>
                {total?.TotalAmount !== 0 &&
                  IsEvnQuote ? NumberWithCommas(total?.TotalAmount / headerData?.CurrencyExchRate, 2) : NumberWithCommas(total?.TotalAmount, 2)}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="SpBrders PgeBrakInsid">
          <div className="d-flex">

            {/* Summary */}
            <div className="col-6">
              <div className="d-flex">
                <div className="col-8 border-end">
                  {/* Summary Header */}
                  <h6 className={`fw-bold text-center border-top ${style?.min_height_15} d-flex justify-content-center align-items-center lightGrey SpFntSmryHed`}>
                    SUMMARY
                  </h6>

                  <div className="d-flex SpFntSmry">
                    {/* Material Wise Weight */}
                    <div className="col-6 border-start border-end position-relative pb-3 px-1">
                      <div className="d-flex justify-content-between">
                        <p className="fw-bold">GOLD IN 24KT </p>
                        <p>{NumberWithCommas((total?.gold24kt), 3)} gm</p>
                      </div>
                      {
                        MetShpWise?.map((e, i) => {
                          return <div className="d-flex justify-content-between" key={i}>
                            <p className="fw-bold">{e?.ShapeName}</p>
                            <p>{e?.Rate === 0 ? NumberWithCommas(e?.metalfinewt, 3) : '0.000'} gm</p>
                          </div>
                        })
                      }
                      <div className="d-flex justify-content-between">
                        <p className="fw-bold">GROSS WT</p>
                        <p>{NumberWithCommas(total?.grosswt, 3)} gm</p>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p className="fw-bold">*(G+D) WT</p>
                        <p>{NumberWithCommas(total?.metalTotal?.Wt, 3)} gm</p>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p className="fw-bold">NET WT</p>
                        <p>{NumberWithCommas(total?.metalTotal?.NL, 3)} gm</p>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p className="fw-bold">DIAMOND WT</p>
                        <p>
                          {NumberWithCommas(total?.diaTotal?.Pcs - total?.solTotal?.Pcs, 0)} /{" "}
                          {NumberWithCommas(total?.diaTotal?.Wt - total?.solTotal?.Wt, 3)} Cts
                        </p>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p className="fw-bold">SOLITAIRE WT</p>
                        <p>
                          {NumberWithCommas(total?.solTotal?.Pcs, 0)} /{" "}
                          {NumberWithCommas(total?.solTotal?.Wt, 3)} Cts
                        </p>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p className="fw-bold">STONE WT</p>
                        <p>
                          {NumberWithCommas(total?.csTotal?.Pcs - total?.gemTotal?.Pcs, 0)} /{" "}
                          {NumberWithCommas(total?.csTotal?.Wt - total?.gemTotal?.Wt, 3)} Cts
                        </p>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p className="fw-bold">GEMSTONE WT</p>
                        <p>
                          {NumberWithCommas(total?.gemTotal?.Pcs, 0)} /{" "}
                          {NumberWithCommas(total?.gemTotal?.Wt, 3)} Cts
                        </p>
                      </div>
                      <div
                        className={`d-flex justify-content-between position-absolute left-0 border-bottom bottom-0 ${style?.min_height_15} border-top w-100 lightGrey end-0`}
                      >
                        <p></p>
                        <p></p>
                      </div>
                    </div>

                    {/* Material Wise Amount */}
                    <div className="col-6 position-relative pb-3 px-1 sumFont">
                      <div className="d-flex justify-content-between">
                        <p className="fw-bold">GOLD </p>
                        <p>{IsEvnQuote ? NumberWithCommas((totalMetalAmount - notGoldMetalTotal) / headerData?.CurrencyExchRate, 2) : NumberWithCommas((totalMetalAmount - notGoldMetalTotal), 2)}</p>
                      </div>
                      {
                        MetShpWise?.map((e, i) => {
                          return <div className="d-flex justify-content-between" key={i}>
                            <p className="fw-bold">{e?.ShapeName}</p>
                            <p>{IsEvnQuote ? NumberWithCommas(e?.Amount / headerData?.CurrencyExchRate, 2) : NumberWithCommas(e?.Amount, 2)}</p>
                          </div>
                        })
                      }
                      <div className="d-flex justify-content-between">
                        <p className="fw-bold">DIAMOND</p>
                        <p>{IsEvnQuote ? NumberWithCommas(total?.diaTotal?.Amount - total?.solTotal?.Amount / headerData?.CurrencyExchRate, 2) : NumberWithCommas(total?.diaTotal?.Amount - total?.solTotal?.Amount, 2)}</p>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p className="fw-bold">SOLITAIRE</p>
                        <p>{IsEvnQuote ? NumberWithCommas(total?.solTotal?.Amount / headerData?.CurrencyExchRate, 2) : NumberWithCommas(total?.solTotal?.Amount, 2)}</p>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p className="fw-bold">CST</p>
                        <p>{IsEvnQuote ? NumberWithCommas(total?.csTotal?.Amount - total?.gemTotal?.Amount / headerData?.CurrencyExchRate, 2) : NumberWithCommas(total?.csTotal?.Amount - total?.gemTotal?.Amount, 2)}</p>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p className="fw-bold">GEMSTONE</p>
                        <p>{IsEvnQuote ? NumberWithCommas(total?.gemTotal?.Amount / headerData?.CurrencyExchRate, 2) : NumberWithCommas(total?.gemTotal?.Amount, 2)}</p>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p className="fw-bold">MAKING</p>
                        <p>{IsEvnQuote ? NumberWithCommas(total?.MakingAmount / headerData?.CurrencyExchRate, 2) : NumberWithCommas(total?.MakingAmount, 2)}</p>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p className="fw-bold">OTHER</p>
                        <p>{IsEvnQuote ? NumberWithCommas(total?.OtherCharges / headerData?.CurrencyExchRate, 2) : NumberWithCommas(total?.OtherCharges, 2)}</p>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p className="text-end fw-bold">
                          {headerData?.AddLess >= 0 ? "Add" : "Less"}
                        </p>
                        <p className="text-end">
                          {NumberWithCommas(headerData?.AddLess, 2)}
                        </p>
                      </div>
                      <div
                        className={`d-flex justify-content-between border-bottom position-absolute left-0 bottom-0 ${style?.min_height_15} border-top w-100 lightGrey end-0 ps-1 pe-1`}
                      >
                        <p className="fw-bold">TOTAL</p>
                        <p className="">{IsEvnQuote ? NumberWithCommas(total?.TotalAmount / headerData?.CurrencyExchRate, 2) : NumberWithCommas(total?.TotalAmount, 2)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diamond Details */}
                <div className="col-4 border-end border-top border-bottom position-relative pb-3 sumFont">
                  <h6
                    className={`${style?.min_height_15} ${style?.sumCent} border-bottom fw-bold lightGrey text-center d-flex justify-content-center align-items-center SpFntSmryHed`}
                  >
                    Diamond Details
                  </h6>
                  {diamondDetail.map((e, i) => {
                    return (
                      <div
                        className="d-flex justify-content-between SpFntSmry px-1"
                        key={i}
                      >
                        <p className="fw-bold">
                          {e?.label === "OTHER" ? (
                            e?.label
                          ) : (
                            <>
                              {e?.label} {e?.QualityName} {e?.Colorname}
                            </>
                          )}{" "}
                        </p>
                        <p>
                          {e?.Pcs} / {NumberWithCommas(e?.Wt, 3)} Cts
                        </p>
                      </div>
                    );
                  })}

                  <div
                    className={`d-flex justify-content-between position-absolute left-0 bottom-0 ${style?.min_height_15} lightGrey border-top w-100`}
                  >
                    <p></p>
                    <p></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Details */}
            <div className={`col-2 border-top border-bottom h-100 sumFont ${headerData?.PrintRemark === "" && 'border-end'}`}>
              <h6
                className={`fw-bold text-center d-flex justify-content-center align-items-center border-bottom ${style?.min_height_15} ${style?.sumCent} lightGrey SpFntSmryHed`}
              >
                OTHER DETAILS
              </h6>
              <div className="SpFntSmry">
                {brokarage.map((e, i) => {
                  return <div className="d-flex justify-content-between px-1" key={i}>
                    <p className="fw-bold">{e[0]} </p>
                    <p>{e[1] && NumberWithCommas(e[1], 2)}</p>
                  </div>
                })}
                <div className="d-flex justify-content-between px-1">
                  <p className="fw-bold">RATE IN 24KT </p>
                  <p>{NumberWithCommas(headerData?.MetalRate24K, 2)}</p>
                </div>

              </div>
            </div>

            {/* Remark */}
            <div className={`col-2 border-top ${headerData?.PrintRemark !== "" && 'border-bottom'} border-start h-100 ${style?.sumFont}`}>
              {headerData?.PrintRemark !== "" && <>
                <h6
                  className={`fw-bold text-center justify-content-center align-items-center border-bottom ${style?.sumCent} ${style?.min_height_15} lightGrey SpFntSmryHed`}
                >
                  REMARK
                </h6>
                <div className={`SpFntSmry`}>
                  <p className="px-1 heightCmon" dangerouslySetInnerHTML={{ __html: headerData?.PrintRemark }}></p>
                </div></>}
            </div>

            {/* Signature */}
            <div className="col-2 d-flex border-top sumFont">
              <div
                className={`d-flex ${style?.height_createBy} w-100 h-100`}
                style={{ minHeight: "119px", maxHeight: "119px" }}
              >
                <div className="col-6 d-flex align-items-end h-100 justify-content-center border-start border-end border-bottom">
                  <p className="pb-1 SpFntSmryHed"><i>Created By</i> </p>
                </div>
                <div className="col-6 d-flex align-items-end h-100 justify-content-center border-bottom border-end">
                  <p className="pb-1 SpFntSmryHed"><i>Checked By</i> </p>
                </div>
              </div>
            </div>
          </div>

          {/* Terms Description */}
          {headerData?.SalesRepPolicyTermsDescription !== '' && (
            <div className="w-100 px-1 mt-1 mb-1">
              <p className="fw-bold">TERMS INCLUDED:&nbsp;</p>
              <div
                dangerouslySetInnerHTML={{
                  __html: headerData?.SalesRepPolicyTermsDescription,
                }}
                className=""
              />
            </div>
          )}
        </div>

        {/* Pre Generated Text */}
        <pre className="pre pt-3 FntFrPre">**  THIS IS A COMPUTER GENERATED INVOICE AND KINDLY NOTIFY US IMMEDIATELY IN CASE YOU FIND ANY DISCREPANCY IN THE DETAILS OF TRANSACTIONS </pre>
      </div>
    </div>
  ) : (
    <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
      {msg}
    </p>
  );
};

export default DetailPrint5;
