import React, { useEffect, useState } from "react";
import style from "../../assets/css/prints/detailPrint9.module.css";
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
import Loader from "../../components/Loader";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { ToWords } from "to-words";
import style2 from "../../assets/css/headers/header1.module.css";
import { cloneDeep } from "lodash";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";

const DetailPrint9 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  const [loader, setLoader] = useState(true);
  const [msg, setMsg] = useState("");
  const [data, setData] = useState({});
  const toWords = new ToWords();
  const [headerData, setHeaderData] = useState({});
  const [footer, setFooter] = useState(null);
  const [header, setHeader] = useState(null);
  const [custAddress, setCustAddress] = useState([]);
  const [category, setCategory] = useState([]);
  const [netWt, setNetWt] = useState(0);
  const [checkBox, setCheckBox] = useState({
    WithHeader: true,
    WithNetWt: true,
    WithSummary: true,
    WithDiamondRate: true,
  });
  const [total, setTotal] = useState({
    FineWt: 0,
  })
  const [isImageWorking, setIsImageWorking] = useState(true);

  const [MetShpWise, setMetShpWise] = useState([]);
  const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
  const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);

  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  const loadData = (data) => {
    setHeaderData(data?.BillPrint_Json[0]);
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

    let met_shp_arr = MetalShapeNameWiseArr(datas?.json2);
      
    setMetShpWise(met_shp_arr);
    let tot_met = 0;
    let tot_met_wt = 0;
    met_shp_arr?.forEach((e) => {
      tot_met += e?.Amount;
      tot_met_wt += e?.metalfinewt;
    })    
    setNotGoldMetalTotal(tot_met);
    setNotGoldMetalWtTotal(tot_met_wt);

    let resultArr = [];
    let categories = [];
    let netWts = 0;
    let FineWts = 0;
    datas?.resultArray.forEach((e) => {
      FineWts += e?.convertednetwt;
      let otherDetailsCharges = e?.TotalDiamondHandling + e?.OtherCharges;
      if (e?.metal?.length <= 1) {
        netWts += e?.NetWt + e?.LossWt;
      } else {
        let findMetal = e?.metal?.findIndex((ele) => ele?.IsPrimaryMetal === 1);
        if (findMetal !== -1) {
          netWts += e?.metal[findMetal]?.Wt;
        }
      }
      if (e?.GroupJobid === 0) {
        e?.misc?.forEach((ele, ind) => {
          if (ele?.IsHSCOE !== 0) {
            otherDetailsCharges += ele?.Amount;
          }
        });
        let obj = cloneDeep(e);
        obj.FineWt = 0;
        obj.otherDetailsCharges = otherDetailsCharges;
        let findIndex = e?.metal?.findIndex((ele) => ele?.IsPrimaryMetal === 1);
        let primaryMetalAmount = 0;
        let primaryMetalWt = 0
        if (findIndex !== -1) {
          primaryMetalAmount = e?.metal[findIndex]?.Amount;
          primaryMetalWt = e?.metal[findIndex]?.Wt;
          obj.FineWt = e?.metal[findIndex]?.FineWt;
          // FineWts += e?.metal[findIndex]?.FineWt;
        }
        obj.primaryMetalAmount = primaryMetalAmount;
        obj.primaryMetalWt = primaryMetalWt;
        resultArr.push(obj);
      } else {
        let findRecord = resultArr.findIndex((ele) => ele?.GroupJob === e?.GroupJob);
        if (findRecord === -1) {
          let primaryMetalAmount = 0;
          let primaryMetalWt = 0
          let FineWt = 0;
          let findIndex = e?.metal?.findIndex((ele) => ele?.IsPrimaryMetal === 1);
          if (findIndex !== -1) {
            primaryMetalAmount = e?.metal[findIndex]?.Amount;
            primaryMetalWt = e?.metal[findIndex]?.Wt;
            FineWt = e?.metal[findIndex]?.FineWt;
            // FineWts += e?.metal[findIndex]?.FineWt;
          }
          let obj = cloneDeep(e);
          obj.primaryMetalAmount = primaryMetalAmount;
          obj.primaryMetalWt = primaryMetalWt;
          obj.FineWt = FineWt;
          resultArr.push(obj);
        } else {
          if (resultArr[findRecord]?.GroupJob !== resultArr[findRecord]?.SrJobno) {
            resultArr[findRecord].designno = e?.designno;
            resultArr[findRecord].SrJobno = e?.SrJobno;
            resultArr[findRecord].MetalColor = e?.MetalColor;
            resultArr[findRecord].BrandName = e?.BrandName;
            resultArr[findRecord].HUID = e?.HUID;
            resultArr[findRecord].Size = e?.Size;
            // resultArr[findRecord].metal
            let findPrimaryMetal = e?.metal.findIndex((elem) => elem?.IsPrimaryMetal === 1);
            if (findPrimaryMetal !== -1) {
              let FindRecMetal = resultArr[findRecord]?.metal.findIndex((elem) => elem?.IsPrimaryMetal === 1);
              if (FindRecMetal !== -1) {
                resultArr[findRecord].metal[FindRecMetal].Rate = e?.metal[findPrimaryMetal].Rate;
              }
            }
          }
          resultArr[findRecord].grosswt += e?.grosswt;
          resultArr[findRecord].TotalAmount += e?.TotalAmount;
          resultArr[findRecord].UnitCost += e?.UnitCost;
          resultArr[findRecord].MakingAmount += e?.MakingAmount;
          resultArr[findRecord].DiscountAmt += e?.DiscountAmt
          // resultArr[findRecord].MaKingCharge_Unit += e?.MaKingCharge_Unit;
          resultArr[findRecord].NetWt += e?.NetWt;
          resultArr[findRecord].LossWt += e?.LossWt;
          // resultArr[findRecord].Tunch += e?.Tunch;
          resultArr[findRecord].OtherCharges += e?.OtherCharges;
          resultArr[findRecord].MiscAmount += e?.MiscAmount;
          resultArr[findRecord].TotalDiamondHandling += e?.TotalDiamondHandling;
          let primaryMetalAmount = 0;
          let primaryMetalWt = 0
          let findIndex = e?.metal?.findIndex((ele, ind) => ele?.IsPrimaryMetal === 1);
          let FineWt = 0;
          if (findIndex !== -1) {
            primaryMetalAmount = e?.metal[findIndex]?.Amount;
            primaryMetalWt = e?.metal[findIndex]?.Wt;
            FineWt = e?.metal[findIndex]?.FineWt;
            FineWts += e?.metal[findIndex]?.FineWt;
          }
          resultArr[findRecord].primaryMetalAmount += primaryMetalAmount;
          resultArr[findRecord].primaryMetalWt = primaryMetalWt;
          resultArr[findRecord].FineWt += FineWt;
          // other amount
          let otherAmts = [];
          let otherAmtsDts = [...resultArr[findRecord]?.other_details, ...e?.other_details].flat();
          otherAmtsDts.forEach((ele, ind) => {
            let findRec = otherAmts.findIndex((elem, index) => elem?.label === ele?.label);
            if (findRec === -1) {
              otherAmts.push(ele);
            } else {
              otherAmts[findRec].value = +otherAmts[findRec].value + +ele?.value;
            }
          });
          resultArr[findRecord].other_details = otherAmts;

          // diamonds
          let diamonds = [];
          let diamondsArr = [...resultArr[findRecord]?.diamonds, ...e?.diamonds].flat();

          diamondsArr.forEach((ele, ind) => {
            let findDiamond = diamonds.findIndex((elem, index) => elem?.ShapeName === ele?.ShapeName &&
              elem?.SizeName === ele?.SizeName && elem?.QualityName === ele?.QualityName &&
              elem?.Colorname === ele?.Colorname && elem?.Rate === ele?.Rate);
            if (findDiamond === -1) {
              diamonds.push(ele);
            } else {
              diamonds[findDiamond].Amount += ele?.Amount;
              diamonds[findDiamond].Pcs += ele?.Pcs;
              diamonds[findDiamond].Wt += ele?.Wt;
            }
          });

          resultArr[findRecord].diamonds = diamonds;
          resultArr[findRecord].totals.diamonds.Wt += e?.totals.diamonds.Wt;
          resultArr[findRecord].totals.diamonds.Amount += e?.totals.diamonds.Amount;
          resultArr[findRecord].totals.diamonds.Pcs += e?.totals.diamonds.Pcs;
          resultArr[findRecord].totals.diamonds.FineWt += e?.totals.diamonds.FineWt;
          resultArr[findRecord].totals.diamonds.SettingAmount += e?.totals.diamonds.SettingAmount;

          // color stones
          let colorstone = [];
          let colorstoneArr = [...resultArr[findRecord]?.colorstone, ...e?.colorstone].flat();

          colorstoneArr.forEach((ele, ind) => {
            let findDiamond = colorstone.findIndex((elem, index) => elem?.ShapeName === ele?.ShapeName &&
              elem?.SizeName === ele?.SizeName && elem?.QualityName === ele?.QualityName &&
              elem?.Colorname === ele?.Colorname && elem?.Rate === ele?.Rate);
            if (findDiamond === -1) {
              colorstone.push(ele);
            } else {
              colorstone[findDiamond].Amount += ele?.Amount;
            }
          });

          // color stones
          let misc = [];
          let miscArr = [...resultArr[findRecord]?.misc, ...e?.misc].flat();

          miscArr?.forEach((ele, ind) => {
            let findDiamond = misc?.findIndex((elem, index) => elem?.ShapeName === ele?.ShapeName &&
              elem?.SizeName === ele?.SizeName && elem?.QualityName === ele?.QualityName &&
              elem?.Colorname === ele?.Colorname && elem?.Rate === ele?.Rate);
            if (findDiamond === -1) {
              misc.push(ele);
            } else {
              misc[findDiamond].Amount += ele?.Amount;
            }
          });

          resultArr[findRecord].misc = misc;
          resultArr[findRecord].totals.misc.Wt += e?.totals.misc.Wt;
          resultArr[findRecord].totals.misc.Amount += e?.totals.misc.Amount;
          resultArr[findRecord].totals.misc.Pcs += e?.totals.misc.Pcs;
          resultArr[findRecord].totals.misc.FineWt += e?.totals.misc.FineWt;
          resultArr[findRecord].totals.misc.SettingAmount += e?.totals.misc.SettingAmount;
          resultArr[findRecord].totals.misc.onlyIsHSCODE0_Amount += e?.totals.misc.onlyIsHSCODE0_Amount;
          resultArr[findRecord].totals.misc.onlyIsHSCODE0_Wt += e?.totals.misc.onlyIsHSCODE0_Wt;
          resultArr[findRecord].totals.misc.onlyIsHSCODE0_Pcs += e?.totals.misc.onlyIsHSCODE0_Pcs;


          // metals
          resultArr[findRecord].totals.metal.Wt += e?.totals.metal.Wt;
          resultArr[findRecord].totals.metal.Amount += e?.totals.metal.Amount;
          resultArr[findRecord].totals.metal.Pcs += e?.totals.metal.Pcs;
          resultArr[findRecord].totals.metal.FineWt += e?.totals.metal.FineWt;
        }
      }
      let findCategory = categories.findIndex((ele, ind) => ele?.label === e?.Categoryname);
      if (findCategory === -1) {
        categories.push({ label: e?.Categoryname, value: e?.Quantity })
      } else {
        categories[findCategory].value += e?.Quantity
      }
    });
    setNetWt(netWts);
    datas.resultArray = resultArr;
    datas.afterReceive = datas?.finalAmount - data?.BillPrint_Json[0]?.BankReceived - data?.BillPrint_Json[0]?.CashReceived;
    setTotal({ ...total, FineWt: FineWts });
    setCategory(categories);

    
    let finalArr_ = [];
    datas.resultArray?.forEach((e) => {
      let arr = [];
      let arr2 = [];
      e?.misc?.forEach((a) => {
        if(a?.MasterManagement_DiamondStoneTypeid === 3 && a?.IsHSCOE === 0){
          arr.push(a);
        }else{
          arr2.push(a);
        }
      })
      e.misc = arr;

      let obj = {...e};
      obj.miscOther = arr2;

      finalArr_.push(obj);

    })

    datas.resultArray = finalArr_;


    setData(datas);
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

  const handleChangeCheckBox = (e) => {
    const { name, checked } = e?.target;
    setCheckBox({ ...checkBox, [name]: checked })
  }
  const mergeDiamondData = (arr) =>
    Object.values(
      arr.reduce((acc, item) => {
        const key = `${item.Colorname}-${item.QualityName}-${item.ShapeName}-${item.SizeName}`;
  
        if (!acc[key]) acc[key] = { ...item };
        else {
          acc[key].Wt += item.Wt;
          acc[key].Amount += item.Amount;
          acc[key].Pcs += item.Pcs;
        }
  
        return acc;
      }, {})
    );
  return loader ? (
    <Loader />
  ) : msg === "" ? (
    <div
      className={`container container-fluid max_width_container mt-1 ${style?.detailprint9} pad_60_allPrint`}
    >
      {/* buttons */}
      <div
        className={`d-flex justify-content-end align-items-center ${style?.print_sec_sum4} mb-4 ${style?.font_13}`}
      >
        <div className="form-check pe-3 pt-2 d-flex align-items-center justify-content-center">
          <input className="form-check-input border-dark me-1" type="checkbox" name="WithHeader" checked={checkBox?.WithHeader} onChange={e => handleChangeCheckBox(e)} />
          <label className="form-check-label pt-1">
            With Header
          </label>
        </div>
        <div className="form-check pe-3 pt-2 d-flex align-items-center justify-content-center">
          <input className="form-check-input border-dark me-1" type="checkbox" name="WithNetWt" checked={checkBox?.WithNetWt} onChange={e => handleChangeCheckBox(e)} />
          <label className="form-check-label pt-1">
            With Net Wt
          </label>
        </div>
        <div className="form-check pe-3 pt-2 d-flex align-items-center justify-content-center">
          <input className="form-check-input border-dark me-1" type="checkbox" name="WithSummary" checked={checkBox?.WithSummary} onChange={e => handleChangeCheckBox(e)} />
          <label className="form-check-label pt-1">
            With Summary
          </label>
        </div>
        <div className="form-check pe-3 pt-2 d-flex align-items-center justify-content-center">
          <input className="form-check-input border-dark me-1" type="checkbox" name="WithDiamondRate" checked={checkBox?.WithDiamondRate} onChange={e => handleChangeCheckBox(e)} />
          <label className="form-check-label pt-1">
            With Diamond Rate
          </label>
        </div>
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
      <div className="bgGrey text-white py-1 px-2 d-flex justify-content-between">
        <h4 className="fw-bold min_height_title_20 d-flex align-items-center text-white" style={{ fontSize: "20px", paddingTop: "3px", paddingBottom: "3px" }}>
          {headerData?.PrintHeadLabel}
        </h4>
        <h4 className="fw-bold min_height_title_20 d-flex align-items-center text-white" style={{ fontSize: "20px", paddingTop: "3px", paddingBottom: "3px" }}>
          {headerData?.EntryDate}
        </h4>
      </div>
      {/* header */}
      {checkBox?.WithHeader && <div className={style2?.companyDetails}>
        <div className={`${style2?.companyhead} p-2`}>
          <div className={`${style?.fs_header_dp9}`} style={{ fontWeight: "bold", }}>
            <p style={{ fontSize: "16px" }}>{headerData?.CompanyFullName}</p>
          </div>
          <div className={`${style?.fs_header_dp9} ${style?.addressFont}`}>{headerData?.CompanyAddress}</div>
          <div className={`${style?.fs_header_dp9} ${style?.addressFont}`}>{headerData?.CompanyAddress2}</div>
          <div className={`${style?.fs_header_dp9} ${style?.addressFont}`}>
            {headerData?.CompanyCity}-{headerData?.CompanyPinCode},
            {headerData?.CompanyState}({headerData?.CompanyCountry})
          </div>
          {/* <div className={style2?.lines}>Tell No: {headerData?.CompanyTellNo}</div> */}
        
          <div className={`${style?.fs_header_dp9} ${style?.addressFont}`}>
            {headerData?.CompanyEmail} | {headerData?.CompanyWebsite}
          </div>
          <div className={`${style?.fs_header_dp9} ${style?.addressFont}`}>
            {/* {headerData?.Company_VAT_GST_No} | {headerData?.Company_CST_STATE}-{headerData?.Company_CST_STATE_No} | PAN-{headerData?.Pannumber} */}
            {headerData?.Company_VAT_GST_No} | {headerData?.Company_CST_STATE}-
            {headerData?.Company_CST_STATE_No} | PAN-{headerData?.Pannumber}
          </div>
          <div className={`${style?.fs_header_dp9} ${style?.addressFont}`}>
            T {headerData?.CompanyTellNo} 
            {/* | TOLL FREE{" "} {headerData?.CompanyTollFreeNo} */}
          </div>
        </div>
        <div
          style={{ width: "30%" }}
          className="d-flex justify-content-end align-item-center h-100"
        >
          {isImageWorking && (headerData?.PrintLogo !== "" &&
            <img src={headerData?.PrintLogo} alt=""
              className='w-100 h-auto ms-auto d-block object-fit-contain'
              onError={handleImageErrors} height={120} width={150} style={{maxWidth: "116px"}}/>)}
          {/* <img
            src={headerData?.PrintLogo}
            alt=""
            className={style2?.headerImg}
          /> */}
        </div>
      </div>}

      {/* sub header */}
      {<div className="d-flex border mt-1">
        <div className="col-4 border-end p-2">
          {checkBox?.WithHeader && <>  <p className={`${style?.addressFont}`}>{headerData?.lblBillTo}</p>
            <p className="fw-bold" style={{ fontSize: "14px" }}>{headerData?.customerfirmname}</p>
            <p className={`${style?.addressFont} ${style?.fs_header_dp9}`}>{headerData?.customerAddress2}</p>
            <p className={`${style?.addressFont} ${style?.fs_header_dp9}`}>{headerData?.customerAddress1}</p>
            <p className={`${style?.addressFont} ${style?.fs_header_dp9}`}>{headerData?.customerAddress3}</p>
            <p className={`${style?.addressFont} ${style?.fs_header_dp9}`}>
              {headerData?.customercity1}
              {headerData?.customerpincode}
            </p>
            <p className={`${style?.addressFont} ${style?.fs_header_dp9}`}>{headerData?.customeremail1}</p>
            <p className={`${style?.addressFont} ${style?.fs_header_dp9}`}>{headerData?.vat_cst_pan}</p>
            <p className={`${style?.addressFont} ${style?.fs_header_dp9}`}>
              {headerData?.Cust_CST_STATE}-{headerData?.Cust_CST_STATE_No}
            </p></>}
        </div>
        <div className="col-5 border-end p-2 d-flex">
          <div className="col-6">
            {checkBox?.WithHeader && <>
              <p className={`${style?.addressFont}`}> Ship To,</p>
              <p className="fw-bold" style={{ fontSize: "14px" }}>{headerData?.customerfirmname}</p>
              {custAddress.map((e, i) => {
                return <p key={i} className={`${style?.addressFont}`}>{e}</p>;
              })}
            </>}
          </div>
          <div className="col-6 d-flex justify-content-end align-items-end">
            {checkBox?.WithHeader && <p className={`fw-bold ${style?.addressFont}  pb-5 fontBill`} >
              <span className={`pe-2 ${style?.addressFont} fontBill`} >Bill No</span>
              {headerData?.InvoiceNo}
            </p>
            }
          </div>
        </div>
        <div className="col-3 p-2 text-end">
          <p className={`${style?.addressFont}`} style={{ fontSize: "14px" }}>
            <span className={`fw-bold pe-4 ${style?.addressFont}`} style={{ fontSize: "14px" }}>Gold Rate</span>{" "}
            {NumberWithCommas(headerData?.MetalRate24K, 2)}{" "}
          </p>
        </div>
      </div>}

      {/* table header */}
      <div className="mt-1 border-start border-end border-top border-black">
        <div className="d-flex border-bottom lightGrey">
          <div
            className={`${style?.sr} pad_1 border-end d-flex align-items-center justify-content-center`}
          >
            <p className="fw-bold">Sr</p>
          </div>
          <div
            className={`${style?.design} pad_1 border-end d-flex align-items-center justify-content-center`}
          >
            <p className="fw-bold">Design</p>
          </div>
          <div className={`${style?.diamond} border-end`}>
            <div className="d-grid h-100">
              <div className="d-flex justify-content-center">
                <p className="fw-bold border-bottom w-100 text-center pad_1">
                  Diamond
                </p>
              </div>
              <div className="d-flex">
                <div className="w_20 border-end">
                  <p className="fw-bold text-center pad_1">Code</p>
                </div>
                <div className="w_20 border-end">
                  <p className="fw-bold text-center pad_1">Size</p>
                </div>
                <div className="w_20 border-end">
                  <p className="fw-bold text-center pad_1">Wt</p>
                </div>
                <div className="w_20 border-end">
                  <p className="fw-bold text-center pad_1">{checkBox?.WithDiamondRate && "Rate"}</p>
                </div>
                <div className="w_20">
                  <p className="fw-bold text-center pad_1">Amount</p>
                </div>
              </div>
            </div>
          </div>
          <div className={`${style?.stone} border-end`}>
            <div className="d-grid h-100">
              <div className="d-flex justify-content-center">
                <p className="fw-bold border-bottom w-100 text-center pad_1">
                  Stone & Misc
                </p>
              </div>
              <div className="d-flex">
                <div className="col-3 border-end">
                  <p className="fw-bold text-center pad_1">Code</p>
                </div>
                <div className="col-3 border-end">
                  <p className="fw-bold text-center pad_1">Wt</p>
                </div>
                <div className="col-3 border-end">
                  <p className="fw-bold text-center pad_1">Rate</p>
                </div>
                <div className="col-3">
                  <p className="fw-bold text-center pad_1">Amount</p>
                </div>
              </div>
            </div>
          </div>
          <div className={`${style?.labour} border-end`}>
            <div className="d-grid h-100">
              <div className="d-flex justify-content-center">
                <p className="fw-bold border-bottom w-100 text-center pad_1">
                  Labour
                </p>
              </div>
              <div className="d-flex">
                <div className="col-6 border-end">
                  <p className="fw-bold text-center">Rate</p>
                </div>
                <div className="col-6">
                  <p className="fw-bold text-center">Amount</p>
                </div>
              </div>
            </div>
            <p className="fw-bold"></p>
          </div>
          <div className={`${style?.other} border-end`}>
            <div className="d-grid h-100">
              <div className="d-flex justify-content-center">
                <p className="fw-bold border-bottom w-100 text-center pad_1">
                  Other
                </p>
              </div>
              <div className="d-flex justify-content-center">
                <p className="fw-bold w-100 text-center pad_1">Amount</p>
              </div>
            </div>
          </div>
          <div className={`${style?.metal} border-end`}>
            <div className="d-grid h-100">
              <div className="d-flex justify-content-center">
                <p className="fw-bold border-bottom w-100 text-center pad_1">
                  Metal
                </p>
              </div>
              <div className="d-flex">
                <div className="col-2 border-end">
                  <p className="fw-bold text-center pad_1">Quality</p>
                </div>
                <div className="col-2 border-end">
                  <p className="fw-bold text-center pad_1">GWt</p>
                </div>
                <div className="col-2 border-end">
                  <p className="fw-bold text-center pad_1">{checkBox?.WithNetWt && "NWt"}</p>
                </div>
                <div className="col-2 border-end">
                  <p className="fw-bold text-center pad_1">Tunch</p>
                </div>
                <div className="col-2 border-end">
                  <p className="fw-bold text-center pad_1">Rate</p>
                </div>
                <div className="col-2">
                  <p className="fw-bold text-center pad_1">Amount</p>
                </div>
              </div>
            </div>
          </div>
          <div className={`${style?.totalAmount}`}>
            <div className="d-grid h-100">
              <div className="d-flex justify-content-center">
                <p className="fw-bold border-bottom w-100 text-center pad_1">
                  Total Amount
                </p>
              </div>
              <div className="d-flex">
                <div className="col-6 border-end">
                  <p className="fw-bold text-center pad_1">Fine</p>
                </div>
                <div className="col-6">
                  <p className="fw-bold text-center pad_1">Amount</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* table data */}
      {data?.resultArray.map((e, i) => {

           const dimonddata = mergeDiamondData(e?.diamonds);
           console.log("dimonddata",dimonddata)

        return <div key={i} className="no_break border-top">
          <div className="border-start border-end  border-black">
            <div className={`d-flex border-bottom ${style?.word_break}`}>
              <div
                className={`${style?.sr} pad_1 border-end d-flex align-items-center justify-content-center`}
              >
                <p className="fw-bold">{i + 1}</p>
              </div>
              <div className={`${style?.design} pad_1 border-end`}>
                <div className="d-flex justify-content-between">
                  <p style={{ wordBreak: "break-all" }}>{e?.designno}</p>
                  <div>
                    <p>{e?.SrJobno}</p>
                    <p>{e?.MetalColor} </p>
                  </div>
                </div>
                <img src={e?.DesignImage} alt="" onError={handleImageError} className="imgWidth" />
                {e?.BrandName !== "" && <p className="text-center">{e?.BrandName}</p>}
                {e?.HUID !== "" && <p className="text-center">HUID-{e?.HUID}</p>}
                {e?.CertificateNo !== "" && <p className="text-center">Cert-{e?.CertificateNo}</p>}
                <p className="text-center">
                  <span className="fw-bold">{NumberWithCommas(e?.grosswt, 3)} gm </span>Gross
                </p>
                {e?.Size !== "" && <p className="text-center">Size:{e?.Size}</p>}
              </div>
              <div className={`${style?.diamond} border-end position-relative ${style?.pad_bot_15}`} >
                {dimonddata?.map((ele, ind) => {
                  return <div className="d-flex" key={ind}>
                    <div className="w_20">
                      <p className="pad_1 text-break"> {ele?.MaterialTypeName} {ele?.ShapeName} {ele?.QualityName} {ele?.Colorname} </p>
                    </div>
                    <div className="w_20">
                      <p className="pad_1">{ele?.SizeName}</p>
                    </div>
                    <div className="w_20">
                      <p className="text-end pad_1">{NumberWithCommas(ele?.Wt, 2)}</p>
                    </div>
                    <div className="w_20">
                      <p className="text-end pad_1">{checkBox?.WithDiamondRate && NumberWithCommas(ele?.Rate, 2)}</p>
                    </div>
                    <div className="w_20">
                      <p className="text-end pad_1 fw-bold">{NumberWithCommas(ele?.Amount, 2)}</p>
                    </div>
                  </div>
                })}
                <div className="d-flex position-absolute bottom-0 left-0 w-100 border-top lightGrey" style={{minHeight: "14px"}}>
                  <div className="w_20">
                    <p className="text-center pad_1"></p>
                  </div>
                  <div className="w_20">
                    <p className="text-center pad_1"></p>
                  </div>
                  <div className="w_20">
                    <p className="text-end pad_1 fw-bold">{e?.totals?.diamonds?.Wt !== 0 && NumberWithCommas(e?.totals?.diamonds?.Wt, 2)}</p>
                  </div>
                  <div className="w_20">
                    <p className="text-end pad_1"></p>
                  </div>
                  <div className="w_20">
                    <p className="text-end pad_1 fw-bold">{e?.totals?.diamonds?.Amount !== 0 && NumberWithCommas(e?.totals?.diamonds?.Amount, 2)}</p>
                  </div>
                </div>
              </div>
              <div className={`${style?.stone} border-end position-relative ${style?.pad_bot_15}`} >
                {e?.colorstone.map((ele, ind) => {
                  return <div className="d-flex" key={ind}>
                    <div className="col-3">
                      <p className="pad_1 text-break"> {ele?.MaterialTypeName} {ele?.ShapeName} {ele?.QualityName} {ele?.Colorname} </p>
                    </div>
                    <div className="col-3">
                      <p className="pad_1 text-end">{NumberWithCommas(ele?.Wt, 3)}</p>
                    </div>
                    <div className="col-3">
                      <p className="text-end pad_1">{NumberWithCommas(ele?.Rate, 2)}</p>
                    </div>
                    <div className="col-3">
                      <p className="text-end pad_1 fw-bold">{NumberWithCommas(ele?.Amount, 2)}</p>
                    </div>
                  </div>
                })}
                {/* {e?.misc.map((ele, ind) => {
                  return <div className="d-flex" key={ind}>
                    <div className="col-3">
                      <p className="pad_1 text-break"> {ele?.ShapeName === '' ? '' : 'M: '}  {ele?.MaterialTypeName} {ele?.ShapeName} {ele?.QualityName} {ele?.Colorname} </p>
                    </div>
                    <div className="col-3">
                      <p className="pad_1 text-end">{NumberWithCommas(ele?.Wt, 3)}</p>
                    </div>
                    <div className="col-3">
                      <p className="text-end pad_1">{NumberWithCommas(ele?.Rate, 2)}</p>
                    </div>
                    <div className="col-3">
                      <p className="text-end pad_1 fw-bold">{NumberWithCommas(ele?.Amount, 2)}</p>
                    </div>
                  </div>
                })} */}
                <div className="d-flex position-absolute bottom-0 left-0 w-100 border-top lightGrey" style={{minHeight: "14px"}}>
                  <div className="col-3">
                    <p className="text-center pad_1"></p>
                  </div>
                  <div className="col-3">
                    <p className="text-end pad_1 fw-bold">{e?.totals?.colorstone?.Wt  !== 0 && NumberWithCommas(e?.totals?.colorstone?.Wt , 3)}</p>
                  </div>
                  <div className="col-3">
                    <p className="text-end pad_1"></p>
                  </div>
                  <div className="col-3">
                    <p className="text-end pad_1 fw-bold">{e?.totals?.colorstone?.Amount  !== 0 && NumberWithCommas(e?.totals?.colorstone?.Amount , 2)}</p>
                  </div>
                </div>
              </div>
              <div
                className={`${style?.labour} border-end position-relative ${style?.pad_bot_15}`}
              >
                <div className="d-flex">
                  <div className="col-6">
                    <p className="text-end ">{NumberWithCommas(e?.MaKingCharge_Unit, 2)}</p>
                  </div>
                  <div className="col-6">
                    <p className="text-end">{NumberWithCommas(e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount, 2)} </p>
                  </div>
                </div>
                <div className="border-top position-absolute left-0 bottom-0 w-100 lightGrey">
                  <p className="text-end pad_1 fw-bold">{NumberWithCommas(e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount, 2)} </p>
                </div>
              </div>
              <div
                className={`${style?.other} border-end position-relative ${style?.pad_bot_15}`}
              >
                {e?.other_details.map((ele, ind) => {
                  return <div className="d-flex justify-content-between text-break" key={ind}>
                    <p className="pad_1 text-break" style={{width:'60%'}}>{ele?.label}</p>
                    <p className=" text-end pad_1 text-break" style={{width:'40%'}}>{NumberWithCommas(+ele?.value, 2)}</p>
                  </div>
                })}
                {e?.miscOther.map((ele, ind) => {
                  return <div className="d-flex justify-content-between" key={ind}>
                    <p className="pad_1">{ele?.ShapeName}</p>
                    <p className=" text-end pad_1">{NumberWithCommas(+ele?.Amount, 2)}</p>
                  </div>
                })}
                <div className="border-top position-absolute left-0 bottom-0 w-100 lightGrey">
                  <p className="text-end pad_1 fw-bold">{NumberWithCommas(e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling, 2)} </p>
                </div>
              </div>
              <div
                className={`${style?.metal} border-end position-relative ${style?.pad_bot_15}`}
              >
                <div className="d-flex">
                  <div className="col-2">
                    {e?.metal.map((ele, ind) => {
                      return <p key={ind} className="pad_1">{ele?.ShapeName} {ele?.QualityName}</p>
                    })}
                  </div>
                  <div className="col-2">
                    {e?.metal.map((ele, ind) => {
                      return <p key={ind} className="text-end pad_1">{ind === 0 ? NumberWithCommas(e?.NetWt + (e?.totals?.diamonds?.Wt / 5), 3) : NumberWithCommas(ele?.Wt, 3)}</p>
                    })}
                    {/* <p className="text-end pad_1">{NumberWithCommas(e?.NetWt + (e?.totals?.diamonds?.Wt / 5), 3)}</p> */}
                  </div>
                  <div className="col-2">
                    {e?.metal.map((ele, ind) => {
                      return <p key={ind} className="text-end pad_1">{checkBox?.WithNetWt && (e?.metal?.length === 1 ? NumberWithCommas(e?.NetWt + e?.LossWt, 3) : NumberWithCommas(ele?.Wt, 3))}</p>
                    })}
                    {/* <p className="text-end pad_1">{checkBox?.WithNetWt && NumberWithCommas(e?.NetWt + e?.LossWt, 3)}</p> */}
                  </div>
                  <div className="col-2">
                    <p className="text-end pad_1">
                      {(e?.metal[0]?.Rate === 0 || e?.metal?.length === 0) && NumberWithCommas(e?.Tunch, 3)}
                    </p>
                  </div>
                  <div className="col-2">
                    {e?.metal.map((ele, ind) => {
                      return <p key={ind} className="text-end pad_1">{NumberWithCommas(ele?.Rate, 2)}</p>
                    })}
                  </div>
                  <div className="col-2">
                    {e?.metal.map((ele, ind) => {
                      return <p className={`text-end pad_1 ${ind !== 0 && "fw-bold"}`} key={ind}>{ele?.IsPrimaryMetal === 1 ? NumberWithCommas(e?.primaryMetalAmount, 2) : NumberWithCommas(ele?.Amount, 2)}</p>
                    })}
                  </div>
                </div>
                {e?.JobRemark !== "" && <div className="pad_1">
                  <p className="">REMARK: </p>
                  <p className="fw-bold">{e?.JobRemark}</p>
                </div>}
                <div className="d-flex position-absolute bottom-0 left-0 w-100 border-top lightGrey">
                  <div className="col-2">
                    <p className="text-center pad_1"></p>
                  </div>
                  <div className="col-2">
                    <p className="text-end pad_1 fw-bold">{NumberWithCommas(e?.NetWt + (e?.totals?.diamonds?.Wt / 5), 3)}</p>
                  </div>
                  <div className="col-2">
                    <p className="text-end pad_1 fw-bold">{checkBox?.WithNetWt && (e?.metal?.length <= 1 ? NumberWithCommas(e?.NetWt + e?.LossWt, 3) : NumberWithCommas(e?.primaryMetalWt, 3))}</p>
                  </div>
                  <div className="col-2">
                    <p className="text-end pad_1"></p>
                  </div>
                  <div className="col-2">
                    <p className="text-end pad_1"></p>
                  </div>
                  <div className="col-2">
                    <p className="text-end pad_1 fw-bold">{NumberWithCommas(e?.primaryMetalAmount, 2)}</p>
                  </div>
                </div>
              </div>
              <div
                className={`${style?.totalAmount} position-relative ${style?.pad_bot_15}`}
              >
                <div className="d-flex h-100">
                  <div className="col-6 border-end">
                    <p className="text-end pad_1 fw-bold">{e?.convertednetwt !== 0 && NumberWithCommas(e?.convertednetwt, 3)}</p>
                  </div>
                  <div className="col-6">
                    <p className="text-end pad_1 fw-bold">{NumberWithCommas(e?.UnitCost, 2)}</p>
                  </div>
                </div>
                <div className="d-flex position-absolute bottom-0 left-0 w-100 border-top lightGrey">
                  <div className="col-6 border-end">
                    <p className="text-end pad_1 fw-bold">{NumberWithCommas(e?.convertednetwt, 3)}</p>
                  </div>
                  <div className="col-6">
                    <p className="text-end pad_1 fw-bold">{NumberWithCommas(e?.UnitCost, 2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* {e?.DiscountAmt !== 0 && <div className="d-flex border-start border-end border-bottom"> */}
          {e?.DiscountAmt !== 0 && 
          <div className="d-flex" style={{borderLeft:'1px solid black', borderRight:'1px solid black', borderBottom:'1px solid #e8e8e8'}}>
            <div
              className={`${style?.sr} pad_1 border-end d-flex align-items-center justify-content-center`}
            >
              <p className="fw-bold"></p>
            </div>
            <div className={`${style?.design} pad_1 border-end`}>
              <div className="d-flex justify-content-between">
                <p></p>
              </div>
            </div>
            <div className={`${style?.diamond} lightGrey`} >
              <div className="d-flex">
                <div className="w_20">
                  <p className="pad_1"></p>
                </div>
                <div className="w_20">
                  <p className="pad_1"></p>
                </div>
                <div className="w_20">
                  <p className="text-end pad_1"></p>
                </div>
                <div className="w_20">
                  <p className="text-end pad_1"></p>
                </div>
                <div className="w_20">
                  <p className="text-end pad_1"></p>
                </div>
              </div>
            </div>
            <div className={`${style?.stone} lightGrey`} >
              <div className="d-flex" >
                <div className="col-3">
                  <p className="pad_1"></p>
                </div>
                <div className="col-3">
                  <p className="pad_1"></p>
                </div>
                <div className="col-3">
                  <p className="text-end pad_1"></p>
                </div>
                <div className="col-3">
                  <p className="text-end pad_1"></p>
                </div>
              </div>
            </div>
            <div className={`${style?.labour} lightGrey`} >
              <div className="d-flex">
                <div className="col-6">
                  <p className="text-end "></p>
                </div>
                <div className="col-6">
                  <p className="text-end"> </p>
                </div>
              </div>
            </div>
            <div className={`${style?.other} lightGrey`} >
              <div className="d-flex justify-content-center">
                <p className="w-100 text-end pad_1"></p>
              </div>
            </div>
            <div className={`${style?.metal} lightGrey`} >
              <p className="text-end fw-bold p-1">Discount {NumberWithCommas(e?.Discount, 2)}{e?.isdiscountinamount === 0 && "%"} @Total Amount	</p>
            </div>
            <div className={`${style?.totalAmount} lightGrey`} >
              <div className="d-flex h-100">
                <div className="col-6 border-end">
                  <p className="text-end py-1 pad_1 fw-bold">{NumberWithCommas(e?.DiscountAmt, 2)}</p>
                </div>
                <div className="col-6">
                  <p className="text-end py-1 pad_1 fw-bold">{NumberWithCommas(e?.TotalAmount, 2)}</p>
                </div>
              </div>
            </div>
          </div>}
        </div>
      })}

      {/* table total */}
      <div className={`no_break border-start border-end border-black ${style?.word_break} lightGrey`}>
        <div className="d-flex border-bottom no_break border-black">
          <div className={`${style?.sr} pad_1 lightGrey d-flex align-items-center justify-content-center`}>
            <p className="fw-bold"></p>
          </div>
          <div className={`${style?.design} pad_1 border-end lightGrey d-flex align-items-center justify-content-center`}>
            <p className="fw-bold text-center">TOTAL</p>
          </div>
          <div className={`${style?.diamond} border-end lightGrey d-flex align-items-center`}>
              <div className="w_20">
                <p className="pad_1 fw-bold"></p>
              </div>
              <div className="w_20">
                <p className="pad_1 fw-bold"></p>
              </div>
              <div className="w_20">
                <p className="text-end pad_1 fw-bold">{NumberWithCommas(data?.mainTotal?.diamonds?.Wt, 2)}</p>
              </div>
              <div className="w_20">
                <p className="text-end pad_1 fw-bold"></p>
              </div>
              <div className="w_20">
                <p className="text-end pad_1 fw-bold">{NumberWithCommas(data?.mainTotal?.diamonds?.Amount, 2)}</p>
              </div>
          </div>
          <div className={`${style?.stone} border-end lightGrey d-flex align-items-center`}>
              <div className="col-3">
                <p className="pad_1 fw-bold"></p>
              </div>
              <div className="col-3">
                <p className="pad_1 fw-bold">{NumberWithCommas(data?.mainTotal?.colorstone?.Wt , 3)}</p>
              </div>
              <div className="col-3">
                <p className="text-end pad_1 fw-bold"></p>
              </div>
              <div className="col-3">
                <p className="text-end pad_1 fw-bold">{NumberWithCommas(data?.mainTotal?.colorstone?.Amount, 2)}</p>
              </div>
          </div>
          <div className={`${style?.labour} border-end lightGrey d-flex align-items-center`}>
              <div className="col-6">
                {/* <p className="text-end fw-bold">{NumberWithCommas(data?.mainTotal?.total_labour?.labour_rate, 2)}</p> */}
                <p className="text-end fw-bold"></p>
              </div>
              <div className="col-6">
                <p className="text-end fw-bold">{NumberWithCommas(data?.mainTotal?.total_Making_Amount + data?.mainTotal?.diamonds?.SettingAmount + data?.mainTotal?.colorstone?.SettingAmount, 2)} </p>
              </div>
          </div>
          <div className={`${style?.other} border-end lightGrey d-flex align-items-center`}>
              <p className="w-100 text-end pad_1 fw-bold">{NumberWithCommas(data?.mainTotal?.total_other + data?.mainTotal?.total_diamondHandling + data?.mainTotal?.totalMiscAmount, 2)}</p>
          </div>
          <div className={`${style?.metal} border-end d-flex lightGrey align-items-center`}>
              <div className="col-2">
                <p className="pad_1 fw-bold"></p>
              </div>
              <div className="col-2">
                <p className="text-end pad_1 fw-bold">{NumberWithCommas(data?.mainTotal?.netwt + (data?.mainTotal?.diamonds?.Wt / 5), 3)}</p>
              </div>
              <div className="col-2">
                <p className="text-end pad_1 fw-bold">{checkBox?.WithNetWt && NumberWithCommas(netWt, 3)}</p>
              </div>
              <div className="col-2">
                <p className="text-end pad_1 fw-bold"></p>
              </div>
              <div className="col-2">
                <p className="text-end pad_1 fw-bold"></p>
              </div>
              <div className="col-2">
                <p className="text-end pad_1 fw-bold">{NumberWithCommas(data?.mainTotal?.MetalAmount, 2)}</p>
              </div>
          </div>
          <div className={`${style?.totalAmount} d-flex lightGrey align-items-center`}>
              <div className="col-6 border-end h-100 d-flex justify-content-end align-items-center">
                <p className="text-end pad_1 fw-bold">{NumberWithCommas(total?.FineWt, 3)}</p>
              </div>
              <div className="col-6 h-100 d-flex justify-content-end align-items-center">
                <p className="text-end pad_1 fw-bold">{NumberWithCommas(data?.mainTotal?.total_unitcost, 2)}</p>
              </div>
          </div>
        </div>
      </div>

      {/* table taxes */}
      <div className="border-start border-end  border-black no_break">
        <div className="d-flex no_break pt-1 ">
          <div className={`${style?.taxWords}`}>
            {data?.mainTotal?.total_discount_amount !== 0 && <p className="text-end">Total Discount</p>}
            {data?.allTaxes.map((e, i) => {
              return <p className="text-end" key={i}>{e?.name} @ {e?.per}</p>
            })}
            {headerData?.AddLess !== 0 && <p className="text-end">{headerData?.AddLess > 0 ? "Add" : "Less"}</p>}
            <p className="text-end fw-bold">TOTAL</p>
            <p className="text-end">Recv. in Cash</p>
            <p className="text-end">Recv. in Bank</p>
          </div>
          <div className={`${style?.taxAmount}`}>
            {data?.mainTotal?.total_discount_amount !== 0 && <p className="text-end">{NumberWithCommas(data?.mainTotal?.total_discount_amount, 2)}</p>}
            {data?.allTaxes.map((e, i) => {
              return <p className="text-end" key={i}>{NumberWithCommas(e?.amount*headerData?.CurrencyExchRate, 2)}</p>
            })}
            {headerData?.AddLess !== 0 && <p className="text-end">{headerData?.AddLess}</p>}
            <p className="text-end fw-bold">{NumberWithCommas(data?.mainTotal?.total_amount+data?.allTaxes?.reduce((acc, cObj) => acc+ (+cObj?.amount * headerData?.CurrencyExchRate), 0), 2)}</p>
            <p className="text-end">{NumberWithCommas(headerData?.CashReceived, 2)}</p>
            <p className="text-end">{NumberWithCommas(headerData?.BankReceived, 2)}</p>
          </div>
        </div>
      </div>

      {/* table summary */}
      <div className={`d-flex position-relative no_break`}>
        {checkBox?.WithSummary ? <div className="col-4 border-top border-start border-end border-bottom">
          <h4 className="lightGrey fw-bold text-center border-bottom">SUMMARY</h4>
          <div className="d-flex h-100">
            <div className={`col-6 border-end pad_1 ${style?.pad_bot_12} position-relative`}>
              <div className="d-flex justify-content-between pad_1">
                <p className="fw-bold">GOLD IN 24KT</p>
                <p>{NumberWithCommas((data?.mainTotal?.total_purenetwt - notGoldMetalWtTotal), 3)} gm</p>
              </div>
              {
                MetShpWise?.map((e, i) => {
                  return <div className="d-flex justify-content-between pad_1" key={i}>
                  <p className="fw-bold">{e?.ShapeName}</p>
                  <p>{NumberWithCommas(e?.metalfinewt, 3)} gm</p>
                </div>
                })
              }
              <div className="d-flex justify-content-between pad_1">
                <p className="fw-bold">GROSS WT </p>
                <p>{NumberWithCommas(data?.mainTotal?.grosswt, 3)} gm</p>
              </div>
              {/* <div className="d-flex justify-content-between pad_1">
                <p className="fw-bold">*(G+D) WT </p>
                <p>{NumberWithCommas(data?.mainTotal?.netwt + (data?.mainTotal?.diamonds?.Wt / 5), 3)} gm</p>
              </div> */}
              <div className="d-flex justify-content-between pad_1" style={{ minHeight: "11.59px" }}>
                <p className="fw-bold">{checkBox?.WithNetWt && "NET WT"} </p>
                <p>{checkBox?.WithNetWt && <>{NumberWithCommas(netWt, 3)}gm</>} </p>
              </div>
              <div className="d-flex justify-content-between pad_1">
                <p className="fw-bold">DIAMOND WT </p>
                <p>{NumberWithCommas(data?.mainTotal?.diamonds?.Wt, 2)} cts</p>
              </div>
              <div className="d-flex justify-content-between pad_1">
                <p className="fw-bold">STONE WT </p>
                <p>{NumberWithCommas(data?.mainTotal?.colorstone?.Wt, 3)} cts</p>
              </div>
              <div className={`d-flex justify-content-between pad_1 position-absolute start-0 w-100 border-bottom lightGrey border-top ${style?.min_height_12} px-1`} style={{bottom: "12px", minHeight: "14px"}}>
                <p className="fw-bold"> </p>
                <p></p>
              </div>
            </div>
            <div className={`col-6 pad_1 ${style?.pad_bot_12} position-relative`}>
              <div className="d-flex justify-content-between pad_1">
                <p className="fw-bold">GOLD</p>
                <p>{NumberWithCommas((data?.mainTotal?.MetalAmount - notGoldMetalTotal), 2)}</p>
              </div>
              {
                MetShpWise?.map((e, i) => {
                  return <div className="d-flex justify-content-between pad_1" key={i}>
                  <p className="fw-bold">{e?.ShapeName}</p>
                  <p>{NumberWithCommas(e?.Amount, 2)}</p>
                </div>
                })
              }
              <div className="d-flex justify-content-between pad_1">
                <p className="fw-bold">DIAMOND</p>
                <p>{NumberWithCommas(data?.mainTotal?.diamonds?.Amount, 2)}</p>
              </div>
              <div className="d-flex justify-content-between pad_1">
                <p className="fw-bold">CST</p>
                <p>{NumberWithCommas(data?.mainTotal?.colorstone?.Amount, 2)}</p>
              </div>
              <div className="d-flex justify-content-between pad_1">
                <p className="fw-bold">MAKING</p>
                <p>{NumberWithCommas(data?.mainTotal?.total_Making_Amount + data?.mainTotal?.diamonds?.SettingAmount + data?.mainTotal?.colorstone?.SettingAmount, 2)}</p>
              </div>
              <div className="d-flex justify-content-between pad_1">
                <p className="fw-bold">OTHER</p>
                <p>{NumberWithCommas(data?.mainTotal?.total_otherCharge_Diamond_Handling, 2)}</p>
              </div>
              {<div className="d-flex justify-content-between pad_1">
                <p className="fw-bold">{headerData?.AddLess >= 0 ? "ADD" : "LESS"}</p>
                <p>{NumberWithCommas(headerData?.AddLess, 2)}</p>
              </div>}
              <div className={`d-flex justify-content-between pad_1 position-absolute start-0 w-100 lightGrey border-top border-bottom ${style?.min_height_12} px-1`} style={{bottom: "12px"}}>
                <p className="fw-bold">TOTAL</p>
                <p>{NumberWithCommas(data?.mainTotal?.total_amount+data?.allTaxes?.reduce((acc, cObj) => acc+ (+cObj?.amount * headerData?.CurrencyExchRate), 0), 2)}</p>
              </div>
            </div>
          </div>
        </div> : <div className="border-top col-4"></div>}
        <div className="col-5 border-top d-flex">
          <div className="col-5 border-start border-end border-bottom">
            <h4 className="lightGrey fw-bold text-center border-bottom">Summary Detail</h4>
            {category.map((e, i) => {
              return <div className="d-flex justify-content-between pad_1" key={i}>
                <p className="fw-bold">{e?.label}</p>
                <p>{NumberWithCommas(e?.value, 0)}</p>
              </div>
            })}
          </div>
          <div className="col-7 border-start border-end border-bottom d-flex">
            <div className={`col-6 border-end pad_1 ${style?.min_height_100} d-flex flex-column justify-content-between`} >
              <p className="pad_1">Signature</p>
              <p className="fw-bold pb-1 pad_1">{headerData?.customerfirmname}</p>
            </div>
            <div className={`col-6 pad_1 ${style?.min_height_100} d-flex flex-column justify-content-between`} >
              <p className="pad_1">Signature</p>
              <p className="fw-bold pb-1 pad_1">{headerData?.CompanyFullName}</p>
            </div>
          </div>
        </div>
        <div className={`col-3 border-top ps-1 ${style?.word_break}`}>
          <div className="border-start border-end border-bottom d-flex">
            <div className="col-4 border-end d-flex align-items-center">
              <p className="fw-bold p-1">Grand Total </p>
            </div>
            <div className="col-8">
              <div className="d-flex border-bottom">
                <div
                  className={`col-4 border-end ${style?.min_height_30} d-flex justify-content-center align-items-center fw-bold`}
                >
                  Amount{" "}
                </div>
                <div
                  className={`col-4 border-end ${style?.min_height_30} d-flex justify-content-center align-items-center fw-bold`}
                ></div>
                <div
                  className={`col-4 ${style?.min_height_30} d-flex justify-content-center align-items-center fw-bold`}
                >
                  {NumberWithCommas(data?.mainTotal?.total_amount+data?.allTaxes?.reduce((acc, cObj) => acc+ (+cObj?.amount * headerData?.CurrencyExchRate), 0) -headerData?.CashReceived -headerData?.BankReceived+headerData?.AddLess, 2)}
                </div>
              </div>
              <div className="d-flex">
                <div
                  className={`col-4 border-end ${style?.min_height_30} d-flex justify-content-center align-items-center fw-bold`}
                >
                  Fine{" "}
                </div>
                <div
                  className={`col-4 border-end ${style?.min_height_30} d-flex justify-content-center align-items-center fw-bold`}
                >
                  {NumberWithCommas(data?.mainTotal?.convertednetwt, 3)}{" "}
                </div>
                <div
                  className={`col-4 ${style?.min_height_30} d-flex justify-content-center align-items-center fw-bold`}
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <p className="pre pt-2">**   THIS IS A COMPUTER GENERATED INVOICE AND KINDLY NOTIFY US IMMEDIATELY IN CASE YOU FIND ANY DISCREPANCY IN THE DETAILS OF TRANSACTIONS</p>
      {/* declaration */}
      {/* <div
        className="my-1 border p-2"
        dangerouslySetInnerHTML={{ __html: headerData?.Declaration }}
      ></div> */}

      {/* footer */}
      {/* {footer} */}
    </div>
  ) : (
    <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
      {msg}
    </p>
  );
};

export default DetailPrint9;
