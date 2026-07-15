import React from 'react'
import "../../assets/css/prints/miscPrint.css";
import { useEffect } from "react";
import { useState } from "react";
import { ToWords } from "to-words";
import {
  apiCall,
  checkMsg,
  fixedValues,
  formatAmount,
  handleImageError,
  handlePrint,
  isObjectEmpty,
  NumberWithCommas,
} from "../../GlobalFunctions";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import "../../assets/css/prints/packinglist7.css";
import Loader from "../../components/Loader";
import { cloneDeep } from "lodash";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";


function MiscPrint({ token, invoiceNo, printName, urls, evn, ApiVer }) {
  const toWords = new ToWords();
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const [diamondWise, setDiamondWise] = useState([]);
  const [imgFlag, setImgFlag] = useState(true);
  const [imgFlag2, setImgFlag2] = useState(true);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const evname = atob(evn);
  const [MetShpWise, setMetShpWise] = useState([]);
  const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
  const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);
  const [diamondDetails, setDiamondDetails] = useState([]);
  const [category, setCategory] = useState([]);

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
        console.log(error);
      }
    };
    sendData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadData(data) {
    // console.log("data", data);
    let categories = [];

    let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    data.BillPrint_Json[0].address = address;

    const datas = OrganizeDataPrint(
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
    });
    setNotGoldMetalTotal(tot_met);
    setNotGoldMetalWtTotal(tot_met_wt);

    //caterory 
    data?.BillPrint_Json1.forEach((e, i) => {

      let findCategory = categories.findIndex(ele => ele?.Categoryname === e?.Categoryname);
      if (findCategory === -1) {
          let objj = { 
              Categoryname: e?.Categoryname,
              pcs: 1
          }
          categories.push(objj);
      } else {
          categories[findCategory].pcs += 1
      }
    })

    setCategory(categories);

    //grouping of jobs and isGroupJob is 1

    let finalArr = [];
    datas?.resultArray?.forEach((a) => {
      if (a?.GroupJob === "") {
        finalArr.push(a);
      } else {
        let b = cloneDeep(a);
        let find_record = finalArr.findIndex(
          (el) => el?.GroupJob === b?.GroupJob
        );
        if (find_record === -1) {
          finalArr.push(b);
        } else {
          if (
            finalArr[find_record]?.GroupJob !== finalArr[find_record]?.SrJobno
          ) {
            finalArr[find_record].designno = b?.designno;
            finalArr[find_record].HUID = b?.HUID;
            finalArr[find_record].DesignImage = b?.DesignImage; // CQ Solving PSJewels 16/01/26
          }


          finalArr[find_record].grosswt += b?.grosswt;
          finalArr[find_record].NetWt += b?.NetWt;
          finalArr[find_record].LossWt += b?.LossWt;
          finalArr[find_record].TotalAmount += b?.TotalAmount;
          finalArr[find_record].DiscountAmt += b?.DiscountAmt;
          finalArr[find_record].UnitCost += b?.UnitCost;
          finalArr[find_record].MakingAmount += b?.MakingAmount;
          finalArr[find_record].OtherCharges += b?.OtherCharges;
          finalArr[find_record].TotalDiamondHandling += b?.TotalDiamondHandling;
          finalArr[find_record].Quantity += b?.Quantity;
          finalArr[find_record].Wastage += b?.Wastage;
          finalArr[find_record].totals.metal.IsPrimaryMetal += b?.totals?.metal?.IsPrimaryMetal;
          finalArr[find_record].totals.metal.Wt += b?.totals?.metal?.Wt;
          finalArr[find_record].totals.diamonds.Wt += b?.totals?.diamonds?.Wt;

          finalArr[find_record].diamonds = [
            ...finalArr[find_record]?.diamonds,
            ...b?.diamonds,
          ]?.flat();

          finalArr[find_record].colorstone = [
            ...finalArr[find_record]?.colorstone,
            ...b?.colorstone,
          ]?.flat();

          if (!finalArr[find_record].metal) {
            finalArr[find_record].metal = [];
          }
          if (Array.isArray(b?.metal)) {
            finalArr[find_record].metal.push(...cloneDeep(b.metal));
          }


          finalArr[find_record].misc = [
            ...finalArr[find_record]?.misc,
            ...b?.misc,
          ]?.flat();
          finalArr[find_record].finding = [
            ...finalArr[find_record]?.finding,
            ...b?.finding,
          ]?.flat();

          finalArr[find_record].totals.finding.Wt += b?.totals?.finding?.Wt;
          finalArr[find_record].totals.finding.Pcs += b?.totals?.finding?.Pcs;
          finalArr[find_record].totals.finding.Amount +=
            b?.totals?.finding?.Amount;
          finalArr[find_record].totals.diamonds.Pcs += b?.totals?.diamonds?.Pcs;
          finalArr[find_record].totals.diamonds.Amount +=
            b?.totals?.diamonds?.Amount;

          finalArr[find_record].totals.colorstone.Wt +=
            b?.totals?.colorstone?.Wt;
          finalArr[find_record].totals.colorstone.Pcs +=
            b?.totals?.colorstone?.Pcs;
          finalArr[find_record].totals.colorstone.Amount +=
            b?.totals?.colorstone?.Amount;

          finalArr[find_record].totals.misc.Wt += b?.totals?.misc?.Wt;
          finalArr[find_record].totals.misc.allservwt +=
            b?.totals?.misc?.allservwt;
          finalArr[find_record].totals.misc.Pcs += b?.totals?.misc?.Pcs;
          finalArr[find_record].totals.misc.Amount += b?.totals?.misc?.Amount;

          finalArr[find_record].totals.metal.Amount += b?.totals?.metal?.Amount;
          finalArr[find_record].totals.metal.IsPrimaryMetal +=
            b?.totals?.metal?.IsPrimaryMetal;
          finalArr[find_record].totals.metal.IsPrimaryMetal_Amount +=
            b?.totals?.metal?.IsPrimaryMetal_Amount;

          finalArr[find_record].totals.misc.withouthscode1_2_pcs +=
            b?.totals?.misc?.withouthscode1_2_pcs;
          finalArr[find_record].totals.misc.withouthscode1_2_wt +=
            b?.totals?.misc?.withouthscode1_2_wt;
          finalArr[find_record].totals.misc.onlyHSCODE3_amt +=
            b?.totals?.misc?.onlyHSCODE3_amt;
          finalArr[find_record].totals.misc.onlyIsHSCODE0_Wt +=
            b?.totals?.misc?.onlyIsHSCODE0_Wt;
          finalArr[find_record].totals.misc.onlyIsHSCODE0_Pcs +=
            b?.totals?.misc?.onlyIsHSCODE0_Pcs;
          finalArr[find_record].totals.misc.onlyIsHSCODE0_Amount +=
            b?.totals?.misc?.onlyIsHSCODE0_Amount;
        }
      }
    });



    datas.resultArray = finalArr;

    datas?.resultArray?.forEach((e) => {
      let dia2 = [];
      e?.diamonds?.forEach((el) => {
        let findrec = dia2?.findIndex(
          (a) =>
            a?.ShapeName === el?.ShapeName &&
            a?.QualityName === el?.QualityName &&
            a?.Colorname === el?.Colorname &&
            a?.SizeName === el?.SizeName &&
            a?.Rate === el?.Rate
        );
        let ell = cloneDeep(el);
        if (findrec === -1) {
          dia2.push(ell);
        } else {
          dia2[findrec].Wt += ell?.Wt;
          dia2[findrec].Pcs += ell?.Pcs;
          dia2[findrec].Amount += ell?.Amount;

        }
      });
      e.diamonds = dia2;

      let clr2 = [];

      e?.colorstone?.forEach((el) => {
        let findrec = clr2?.findIndex(
          (a) =>
            a?.ShapeName === el?.ShapeName &&
            a?.QualityName === el?.QualityName &&
            a?.Colorname === el?.Colorname &&
            a?.SizeName === el?.SizeName &&
            a?.Rate === el?.Rate &&
            a?.isRateOnPcs === el?.isRateOnPcs
        );
        let ell = cloneDeep(el);
        if (findrec === -1) {
          clr2.push(ell);
        } else {
          clr2[findrec].Wt += ell?.Wt;
          clr2[findrec].Pcs += ell?.Pcs;
          clr2[findrec].Amount += ell?.Amount;
          clr2[findrec].Rate += ell?.Rate;

        }
      });
      e.colorstone = clr2;

      let misc0 = [];
      e?.misc?.forEach((el) => {
        if (el?.IsHSCOE === 0) {
          misc0?.push(el);
        }
      });

      e.misc = misc0;

      if (e?.GroupJob !== "") {
        e.metal = e.metal?.map((a) => ({
          ...a,
          GroupJob: e.GroupJob,
        }));
      }

    });

    let diaObj = {
      ShapeName: "OTHERS",
      wtWt: 0,
      wtWts: 0,
      pcPcs: 0,
      pcPcss: 0,
      rRate: 0,
      rRates: 0,
      amtAmount: 0,
      amtAmounts: 0,
    };

    let diaonlyrndarr1 = [];
    let diaonlyrndarr2 = [];
    let diaonlyrndarr3 = [];
    let diaonlyrndarr4 = [];
    let diarndotherarr5 = [];
    let diaonlyrndarr6 = [];
    datas?.json2?.forEach((e) => {
      if (e?.MasterManagement_DiamondStoneTypeid === 1) {
        if (e.ShapeName?.toLowerCase() === "rnd") {
          diaonlyrndarr1.push(e);
        } else {
          diaonlyrndarr2.push(e);
        }
      }
    });

    diaonlyrndarr1?.forEach((e) => {
      let findRecord = diaonlyrndarr3.findIndex(
        (a) =>
          e?.StockBarcode === a?.StockBarcode &&
          e?.ShapeName === a?.ShapeName &&
          e?.QualityName === a?.QualityName &&
          e?.Colorname === a?.Colorname
      );

      if (findRecord === -1) {
        let obj = { ...e };
        obj.wtWt = e?.Wt;
        obj.pcPcs = e?.Pcs;
        obj.rRate = e?.Rate;
        obj.amtAmount = e?.Amount;
        diaonlyrndarr3.push(obj);
      } else {
        diaonlyrndarr3[findRecord].wtWt += e?.Wt;
        diaonlyrndarr3[findRecord].pcPcs += e?.Pcs;
        diaonlyrndarr3[findRecord].rRate += e?.Rate;
        diaonlyrndarr3[findRecord].amtAmount += e?.Amount;
      }
    });

    diaonlyrndarr2?.forEach((e) => {
      let findRecord = diaonlyrndarr4.findIndex(
        (a) =>
          e?.StockBarcode === a?.StockBarcode &&
          e?.ShapeName === a?.ShapeName &&
          e?.QualityName === a?.QualityName &&
          e?.Colorname === a?.Colorname
      );

      if (findRecord === -1) {
        let obj = { ...e };
        obj.wtWt = e?.Wt;
        obj.wtWts = e?.Wt;
        obj.pcPcs = e?.Pcs;
        obj.pcPcss = e?.Pcs;
        obj.rRate = e?.Rate;
        obj.rRates = e?.Rate;
        obj.amtAmount = e?.Amount;
        obj.amtAmounts = e?.Amount;
        diaonlyrndarr4.push(obj);
      } else {
        diaonlyrndarr4[findRecord].wtWt += e?.Wt;
        diaonlyrndarr4[findRecord].wtWts += e?.Wt;
        diaonlyrndarr4[findRecord].pcPcs += e?.Pcs;
        diaonlyrndarr4[findRecord].pcPcss += e?.Pcs;
        diaonlyrndarr4[findRecord].rRate += e?.Rate;
        diaonlyrndarr4[findRecord].rRates += e?.Rate;
        diaonlyrndarr4[findRecord].amtAmount += e?.Amount;
        diaonlyrndarr4[findRecord].amtAmounts += e?.Amount;
      }
    });

    diaonlyrndarr4?.forEach((e) => {
      diaObj.wtWt += e?.wtWt;
      diaObj.wtWts += e?.wtWts;
      diaObj.pcPcs += e?.pcPcs;
      diaObj.pcPcss += e?.pcPcss;
      diaObj.rRate += e?.rRate;
      diaObj.rRates += e?.rRates;
      diaObj.amtAmount += e?.amtAmount;
      diaObj.amtAmounts += e?.amtAmounts;
    });

    diaonlyrndarr3?.forEach((e) => {
      let find_record = diaonlyrndarr6?.findIndex(
        (a) =>
          e?.ShapeName === a?.ShapeName &&
          e?.QualityName === a?.QualityName &&
          e?.Colorname === a?.Colorname
      );
      if (find_record === -1) {
        let obj = { ...e };
        obj.wtWts = e?.wtWt;
        obj.pcPcss = e?.pcPcs;
        obj.rRates = e?.rRate;
        obj.amtAmounts = e?.amtAmount;
        diaonlyrndarr6.push(obj);
      } else {
        diaonlyrndarr6[find_record].wtWts += e?.wtWt;
        diaonlyrndarr6[find_record].pcPcss += e?.pcPcs;
        diaonlyrndarr6[find_record].rRates += e?.rRate;
        diaonlyrndarr6[find_record].amtAmounts += e?.amtAmount;
      }
    });

    let diamondDetail = [];
    data?.BillPrint_Json2?.forEach((e) => {
      if (e?.MasterManagement_DiamondStoneTypeid === 1) {
        let findDiamond = diamondDetail?.findIndex(
          (ele) =>
            ele?.ShapeName === e?.ShapeName &&
            ele?.QualityName === e?.QualityName &&
            ele?.Colorname === e?.Colorname
        );
        if (findDiamond === -1) {
          diamondDetail.push(e);
        } else {
          diamondDetail[findDiamond].Pcs += e?.Pcs;
          diamondDetail[findDiamond].Wt += e?.Wt;
          diamondDetail[findDiamond].Amount += e?.Amount;
        }
      }
    });
    let findRND = [];
    let remaingDia = [];
    diamondDetail?.forEach((ele) => {
      if (ele?.ShapeName === "RND") {
        findRND.push(ele);
      } else {
        remaingDia.push(ele);
      }
    });

    let resultArr = [];
    findRND.sort((a, b) => {
      if (a.ShapeName !== b.ShapeName) {
        return a.ShapeName.localeCompare(b.ShapeName); // Sort by ShapeName
      } else if (a.QualityName !== b.QualityName) {
        return a.QualityName.localeCompare(b.QualityName); // If ShapeName is same, sort by QualityName
      } else {
        return a.Colorname.localeCompare(b.Colorname); // If QualityName is same, sort by Colorname
      }
    });

    remaingDia.sort((a, b) => {
      if (a.ShapeName !== b.ShapeName) {
        return a.ShapeName.localeCompare(b.ShapeName); // Sort by ShapeName
      } else if (a.QualityName !== b.QualityName) {
        return a.QualityName.localeCompare(b.QualityName); // If ShapeName is same, sort by QualityName
      } else {
        return a.Colorname.localeCompare(b.Colorname); // If QualityName is same, sort by Colorname
      }
    });
    if (findRND?.length > 6) {
      let arr = findRND.slice(0, 6);
      let anotherArr = [...findRND.slice(6), remaingDia].flat();
      let obj = { ...anotherArr[0] };
      anotherArr?.reduce((acc, cobj) => {
        obj.Pcs += cobj?.Pcs;
        obj.Wt += cobj?.Wt;
        obj.Amount += cobj?.Amount;
      }, obj);
      obj.ShapeName = "OTHER";
      resultArr = [...arr, obj].flat();
    } else {
      let arr = [...findRND].flat();
      let smallArr = [...remaingDia.slice(0, 6 - findRND?.length)].flat();
      let largeArr = [...remaingDia.slice(6 - findRND?.length)].flat();
      let finalArr = [...arr, ...smallArr].flat();

      let obj = { ...largeArr[0] };
      obj.Pcs = 0;
      obj.Wt = 0;
      obj.Amount = 0;
      largeArr?.reduce((acc, cobj) => {
        obj.Pcs += cobj?.Pcs;
        obj.Wt += cobj?.Wt;
        obj.Amount += cobj?.Amount;
      }, obj);
      obj.ShapeName = "OTHER";
      resultArr = [...finalArr, obj].flat();
    }

    setDiamondDetails(resultArr);

    diarndotherarr5 = [...diaonlyrndarr6, diaObj];
    const sortedData = diarndotherarr5?.sort(customSort);
    // setDiamonds(sortedData);
    setDiamondWise(sortedData);

    setResult(datas);
  }
  
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };

  const handleCheckbox = () => {
    if (imgFlag) {
      setImgFlag(false);
    } else {
      setImgFlag(true);
    }
  };
  const handleCheckbox2 = () => {
    if (imgFlag2) {
      setImgFlag2(false);
    } else {
      setImgFlag2(true);
    }
  };


  const customSort = (a, b) => {
    if (a?.ShapeName === "OTHER" && b?.ShapeName !== "OTHER") {
      return 1; // "OTHER" comes after any other ShapeName
    } else if (a?.ShapeName !== "OTHER" && b?.ShapeName === "OTHER") {
      return -1; // Any other ShapeName comes before "OTHER"
    } else {
      // If ShapeNames are equal, compare by QualityName
      if (a?.QualityName < b?.QualityName) {
        return -1;
      } else if (a?.QualityName > b?.QualityName) {
        return 1;
      } else {
        // If QualityNames are equal, compare by Colorname
        return a?.Colorname?.localeCompare(b?.Colorname);
      }
    }
  };



 console.log("result?.mainTotal",result?.mainTotal)

  return (



    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          {msg === "" ? (
            <>
              <div className='printContainer'>
                <div style={{ marginTop: "5px" }}>
                  <div
                    style={{
                      width: "100%",
                      border: "1px solid #DDDDDD",
                      fontSize: "18px",
                    }}
                  >
                    {/* Row 1 */}
                    <div
                      style={{
                        height: "34px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 8px",
                      }}
                    >
                      <div>
                        &nbsp;
                        <span style={{ display: "none" }}>SALE INVOICE</span>
                        <span>INVOICE</span>#&nbsp;:&nbsp;<b>{result?.header?.InvoiceNo}</b>
                      </div>

                      <div>
                        &nbsp;DATE&nbsp;:&nbsp;<b>{result?.header?.EntryDate}</b>
                      </div>
                    </div>

                    {/* Row 2 (Hidden) */}
                    <div
                      style={{
                        height: "34px",
                        display: "none",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        paddingRight: "12px",
                      }}
                    >
                      <div>
                        &nbsp;HSN&nbsp;:&nbsp;<b></b>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ width: "892px", padding: "5px 0", border: "1px solid #DDDDDD", borderTop: "none" }}>
                  <div style={{ display: "flex" }}>

                    {/* Left Section */}
                    <div style={{ width: "70%" ,color:"black",lineHeight:"1.3"}}>

                      <div style={{ fontWeight: "bold", fontSize: "15px", marginTop: "5px", paddingLeft: "5px" }}>
                        TO,  <span style={{ marginLeft: "4px" }}>{result?.header?.customerfirmname}</span>
                      </div>

                      <div style={{ marginLeft: "32px", fontSize: "15px" }}>
                        {result?.header?.customerstreet}
                      </div>

                      <div style={{ marginLeft: "32px", fontSize: "15px" }}>
                        {result?.header?.customerregion}
                      </div>

                      

                      <div style={{ marginLeft: "32px", paddingLeft: "38px", fontSize: "15px" }}>
                        {result?.header?.customercity} - {result?.header?.PinCode}
                      </div>

                      {result?.header?.customermobileno && (
                        <div style={{ marginLeft: "32px", paddingLeft: "38px", fontSize: "15px" }}>
                          Phno:-{result?.header?.customermobileno}
                        </div>
                      )}


                      <div className="vatcst" style={{ marginLeft: "32px", fontSize: "15px" }}>
                        {result?.header?.Cust_VAT_GST_No && (
                          <>GSTIN-{result.header.Cust_VAT_GST_No}</>
                        )}

                        {result?.header?.Cust_VAT_GST_No &&
                          (result?.header?.Cust_CST_STATE || result?.header?.Cust_CST_STATE_No) && (
                            <> | </>
                          )}

                        {result?.header?.Cust_CST_STATE && (
                          <>{result.header.Cust_CST_STATE}</>
                        )}

                        {result?.header?.Cust_CST_STATE && result?.header?.Cust_CST_STATE_No && (
                          <>-{result.header.Cust_CST_STATE_No}</>
                        )}

                        {(result?.header?.Cust_VAT_GST_No &&
                          (result?.header?.Cust_CST_STATE || result?.header?.Cust_CST_STATE_No)) ||
                          (result?.header?.Cust_CST_STATE && result?.header?.CustPanno) ? (
                          <> | </>
                        ) : null}

                        {result?.header?.CustPanno && (
                          <>PAN-{result.header.CustPanno}</>
                        )}
                      </div>
                    </div>

                    {/* Right Section */}
                    <div style={{ width: "30%", display: "flex", justifyContent: "flex-end" }}>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: "bold",
                          marginRight: "10px",
                          textAlign: "right",
                        }}
                      >
                        {   Number(result?.header?.MetalRate24K).toFixed(2)}
                      </div>
                    </div>

                  </div>
                </div>


                {/* table  */}
                <div className="jewelry-table-container">
                  {/* Header Row */}
                  <div className="jewelry-row jewelry-header">
                    <div className="cell col-sr">SR#</div>
                    <div className="cell col-design">DESIGN</div>
                    <div className="cell col-misc-wt">MISC WT</div>
                    <div className="cell col-misc-chg">MISC CHRGS</div>
                    <div className="cell col-gwt">G WT</div>
                    <div className="cell col-nwt">NWT</div>
                    <div className="cell col-purity">PURITY</div>
                    <div className="cell col-wastage">WASTAGE</div>
                    <div className="cell col-rate">RATE</div>
                    <div className="cell col-purewt">PURE WT</div>
                    <div className="cell col-tot-misc">TOTAL MISC CHRGS</div>
                    <div className="cell col-metal-amt">METAL AMOUNT</div>
                    <div className="cell col-total">TOTAL AMT</div>
                  </div>

                  {/* Data Row */}
                  {result?.resultArray?.map((e, i) => {

                    return (
                      <div className="jewelry-row jewelry-data-row">
                    <div className="cell col-sr align-start">{i+1}</div>
                    <div className="cell col-design align-start">
                      <span style={{ fontWeight: 'bold' }}>{e?.designno}</span>
                      <span style={{ fontWeight: 'bold' }}>{e?.SrJobno}</span>
                      <img
                        className="design-img"
                        src= {e?.DesignImage}
                        onError={ handleImageError}
                        alt=""
                      />
                    </div>
                    <div className="cell col-misc-wt align-start justify-end">{e?.MiscWt?.toFixed(3)}</div>
                    <div className="cell col-misc-chg align-start justify-end">{e?.MiscChg?.toFixed(2)}</div>
                    <div className="cell col-gwt align-start justify-end"> {e?.grosswt?.toFixed(3)}</div>
                    <div className="cell col-nwt align-start justify-end"> {e?.NetWt?.toFixed(2)}</div>
                    <div className="cell col-purity align-start justify-end">{e?.MetalPriceRatio?.toFixed(3)}</div>
                    <div className="cell col-wastage align-start justify-end">{e?.Wastage?.toFixed(3)}</div>
                    <div className="cell col-rate align-start justify-end">{e?.Tunch?.toFixed(3)}</div>
                    <div className="cell col-purewt align-start justify-end">{e?.PureNetWt?.toFixed(3)}</div>
                    <div className="cell col-tot-misc align-start justify-end">0.00</div>
                    <div className="cell col-metal-amt align-start justify-end">{e?.MetalAmount?.toFixed(2)}</div>
                    <div className="cell col-total align-start justify-end">{ formatAmount (e?.UnitCost,2)}</div>
                  </div>
                    )
                    })}
                  

                  <div className="jewelry-row jewelry-data-row jewelry-header">
                    <div className="cell col-totalall bold">Total</div>

                    <div className="cell col-gwt justify-end">{result?.mainTotal?.grosswt?.toFixed(3)}</div>
                    <div className="cell col-nwt justify-end">{result?.mainTotal?.metal?.IsPrimaryMetal?.toFixed(2)}</div>
                    <div className="cell col-purity"> </div>
                    <div className="cell col-wastage"> </div>
                    <div className="cell col-rate"> </div>
                    <div className="cell col-purewt justify-end">{result?.mainTotal?.total_purenetwt?.toFixed(3)}</div>
                    <div className="cell col-tot-misc justify-end">0.00</div>
                    <div className="cell col-metal-amt justify-end">{result?.mainTotal?.MetalAmount?.toFixed(2)}</div>
                    <div className="cell col-total justify-end">{ formatAmount (result?.mainTotal?.total_amount,2)}</div>
                  </div>
                </div>




                <div className="tax-container">

                  {/* Left empty space */}
                  <div className="tax-left"></div>

                  {/* Right summary box */}
                  <div className="tax-box">

                    <div className="tax-row">
                      <div className="tax-label">CGST @ {result?.header?.CGST?.toFixed(2)}%</div>
                      <div className="tax-value">{formatAmount (result?.header?.TotalCGSTAmount,2)}</div>
                    </div>

                    <div className="tax-row">
                      <div className="tax-label">SGST @ {result?.header?.SGST?.toFixed(2)}%</div>
                      <div className="tax-value">{formatAmount (result?.header?.TotalSGSTAmount,2)}</div>
                    </div>

                    <div className="tax-row">
                      <div className="tax-label bold">{result?.header?.AddLess >0?"Add":"Less"} </div>
                      <div className="tax-value bold">{formatAmount (result?.header?.AddLess,2)}</div>
                    </div>

                  </div>
                </div>


                <div className="grand-total-container">
                  <div className="grand-total-row">

                    <div className="grand-left">
                      &nbsp; Gold in 24K : <b className="fsgs2">{result?.mainTotal?.convertednetwt?.toFixed(3)}</b>
                    </div>

                    <div className="grand-right">
                      TOTAL IN HK$ 
                      <span style={{marginLeft:"10px"}}>
                        {formatAmount(
                                                      result?.mainTotal?.total_amount /
                                                        result?.header?.CurrencyExchRate +
                                                        result?.allTaxesTotal +
                                                        result?.header?.FreightCharges /
                                                          result?.header?.CurrencyExchRate +
                                                        result?.header?.AddLess /
                                                          result?.header?.CurrencyExchRate
                          )}
                      </span>
                    </div>

                  </div>
                </div>


                <div className="amount-words-container">
                  <div className="amount-words-row">

                    <div className="amount-left">
                    {toWords.convert(+((+(
                                                      result?.mainTotal?.total_amount /
                                                        result?.header?.CurrencyExchRate +
                                                        result?.allTaxesTotal +
                                                        result?.header?.FreightCharges /
                                                          result?.header?.CurrencyExchRate +
                                                        result?.header?.AddLess /
                                                          result?.header?.CurrencyExchRate
                                                    ))?.toFixed(2)))}
                    </div>

                    <div className="amount-right">
                      TOTAL&nbsp;:&nbsp;&nbsp;&nbsp;HKD 
                      
                      <span style={{marginLeft:"10px"}}>
                        {formatAmount(
                                                      result?.mainTotal?.total_amount /
                                                        result?.header?.CurrencyExchRate +
                                                        result?.allTaxesTotal +
                                                        result?.header?.FreightCharges /
                                                          result?.header?.CurrencyExchRate +
                                                        result?.header?.AddLess /
                                                          result?.header?.CurrencyExchRate
                                                    )}
                      </span>
                    </div>

                  </div>
                </div>



                <div id="divsummarycount" className="summary-container">

                  {/* Header */}
                  <div className="summary-header">
                    <b>Summary Detail</b>
                  </div>

                  {/* Body */}
               

                  <div className="d-flex flex-wrap">
                        {category.length > 0 && category.map((e, i) => {
                            return <div className="col-3 d-flex p-2" key={i}>
                                <p className='pe-5'>{e?.Categoryname} :</p>
                                <p>{e?.pcs}</p>
                            </div>
                        })}
                    </div>
 
                </div>


                <div className="note-container">

                  {/* Header */}
                  <div className="note-title">
                    NOTE :
                  </div>

                  {/* Content */}
                  <div className="note-body">

                    <div className="declaration">
                      <div className="declaration-content">
                      <div
                                                dangerouslySetInnerHTML={{
                                                    __html: result?.header?.Declaration,
                                                }}
                                            ></div>
                      </div>

                    </div>

                  </div>



                </div>

                <div
                  style={{
                    width: "892px",
                    textAlign: "left",
                    float: "left",
                    fontSize: "14px",
                    marginBottom: "8px",
                    wordBreak: "break-all",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>REMARKS</span> : {result?.header?.PrintRemark}
                </div>

                <div
                  style={{
                    width: "892px",
                    textAlign: "left",
                    float: "left",
                    fontSize: "14px",
                    marginBottom: "8px",

                  }}
                >
                  <span style={{ fontWeight: "bold" }}>TERMS INCLUDED</span> : <div
                    dangerouslySetInnerHTML={{
                      __html: result?.header?.SalesRepPolicyTermsDescription,
                    }}
                    className=""
                    />
                   
                </div>

                <div
                  className="detail divCompanyHeader"
                  style={{
                    width: "892px",
                    borderCollapse: "collapse",
                    outline: "1px solid #d2d2d2",
                    pageBreakInside: "avoid",
                    pageBreakAfter: "auto",
                    marginBottom: "8px",
                    lineHeight: "10px",
                    marginTop: "12px",
                    display: "flex",
                  }}
                >
                  {/* Left Cell */}
                  <div
                    className="clsHeader"
                    style={{
                      fontWeight: "bold",
                      verticalAlign: "bottom",
                      textAlign: "center",
                      height: "60px",
                      width: "50%",
                      paddingBottom: "5px",
                      borderRight: "1px solid #d2d2d2",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                    }}
                  >
                    RECEIVER'S SIGNATURE &amp; SEAL
                  </div>

                  {/* Right Cell */}
                  <div
                    className="clsHeader"
                    style={{
                      fontWeight: "bold",
                      verticalAlign: "bottom",
                      textAlign: "center",
                      height: "60px",
                      width: "50%",
                      paddingBottom: "5px",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                    }}
                  >
                    for, {result?.header?.companyname}
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

  )
}

export default MiscPrint
