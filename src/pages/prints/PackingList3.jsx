import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import {
  apiCall,
  checkMsg,
  fixedValues,
  formatAmount,
  handleImageError,
  isObjectEmpty,
  NumberWithCommas,
  mergeMetals,
  mergeFindings,
  mergedBySeetingRate
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import "../../assets/css/prints/packinglist3.css";
import Button from "./../../GlobalFunctions/Button";
import { OrganizeInvoicePrintData } from "../../GlobalFunctions/OrganizeInvoicePrintData";
import { cloneDeep } from "lodash";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";

const PackingList3 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const [imgFlag, setImgFlag] = useState(true);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const [diamondArr, setDiamondArr] = useState([]);
  const [MetShpWise, setMetShpWise] = useState([]);
  const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
  const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);
  const [secondarySize, setSecondarySize] = useState(false);
  const [processedMetalsWt, setProcessedMetalsWt] = useState([]);
  const [processedMetalsAmount, setProcessedMetalsAmount] = useState([]);

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
          //   setMsg(data?.Message);
          const err = checkMsg(data?.Message);
          console.log(data?.Message);
          setMsg(err);
        }
      } catch (error) {
        console.error(error);
      }
    };
    sendData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mergeItemsAndCalculate = (items) => {
    const mergedItems = [];

    items.forEach((item) => {
      const existingItemIndex = mergedItems.findIndex(
        (el) =>
          el.ShapeName === item.ShapeName &&
          el.QualityName === item.QualityName &&
          el.Colorname === item.Colorname &&
          el.SizeName === item.SizeName &&
          el.Rate === item.Rate
      );

      if (existingItemIndex !== -1) {
        const existingItem = mergedItems[existingItemIndex];

        existingItem.Pcs += item.Pcs || 0;
        existingItem.Wt += item.Wt || 0;
        existingItem.Amount += item.Amount || 0;

        existingItem.Rate = (existingItem.Amount / existingItem.Wt).toFixed(2);  // Average Rate = Total Amount / Total Weight

        existingItem.Amount = (existingItem.Wt * existingItem.Rate).toFixed(2);
      } else {
        mergedItems.push({ ...item });
      }
    });

    return mergedItems;
  };

  const loadData = (data) => {
    let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    data.BillPrint_Json[0].address = address;

    // console.log("data", data);
    const datas = OrganizeInvoicePrintData(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );
    // console.log("datas", datas);   

    if (!datas.labour) {
      datas.labour = [];
    }

    if (datas?.resultArray && datas.resultArray.length > 0) {
      datas.resultArray.forEach((item) => {
        // console.log("datas?.resultArray", datas?.resultArray);

        if (item?.GroupJob !== '' && item?.metal?.some(el => el?.IsPrimaryMetal === 1)) {
          const primaryMetal = item?.metal?.find(el => el?.IsPrimaryMetal === 1);
          const metalWt = primaryMetal?.Wt || 0;
          const makingChargeUnit = item?.MaKingCharge_Unit;

          if (makingChargeUnit !== 0) {
            const makingCharge = metalWt * makingChargeUnit;

            const labourObject = {
              jobNo: item?.SrJobno || item?.GroupJob,
              GroupjobNo: item?.GroupJob,
              NetWt: item?.NetWt,
              name: 'Labour',
              MakingUnit: makingChargeUnit,
              MakingCharge: makingCharge,
              MetalWt: metalWt,
            };

            if (!datas.labour) {
              datas.labour = [];
            }
            datas.labour.push(labourObject);

            // console.log(`Labour object for item:`, labourObject);
          } else {
            // console.log(`Skipping item at index due to MaKingCharge_Unit being 0`);
          }
        } else {
          // console.log(`Skipping item at index due to GroupJob being empty or no primary metal found`);
        }
      });
    } else {
      // console.log("No resultArray found or it's empty.");
    }

    datas.header.PrintRemark = datas.header.PrintRemark?.replace(/<br\s*\/?>/gi, "");

    let finalArr = [];

    datas?.resultArray?.forEach((a) => {
      if (a?.GroupJob === "") {
        finalArr.push({
          ...a,
        });
      } else {
        let b = cloneDeep(a);
        let find_record = finalArr.findIndex((el) => el?.GroupJob === b?.GroupJob);

        if (find_record === -1) {
          finalArr.push(b);
        } else {
          if (
            finalArr[find_record]?.GroupJob !== finalArr[find_record]?.SrJobno
          ) {
            finalArr[find_record].designno = b?.designno;
            finalArr[find_record].HUID = b?.HUID;
          }

          if (!finalArr[find_record].DesignImage && b?.DesignImage) {
            finalArr[find_record].DesignImage = b?.DesignImage;
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

          finalArr[find_record].diamonds = [
            ...finalArr[find_record]?.diamonds,
            ...b?.diamonds,
          ]?.flat();
          finalArr[find_record].colorstone = [
            ...finalArr[find_record]?.colorstone,
            ...b?.colorstone,
          ]?.flat();
          finalArr[find_record].metal = [
            ...finalArr[find_record]?.metal,
            // console.log("finalArr[find_record]?.metal", finalArr[find_record]?.metal),
            ...b?.metal,
            // console.log("b?.metal", b?.metal),
          ]?.flat();
          finalArr[find_record].misc = [
            ...finalArr[find_record]?.misc,
            ...b?.misc,
          ]?.flat();
          finalArr[find_record].misc_0List = [
            ...finalArr[find_record]?.misc_0List,
            ...b?.misc_0List,
          ]?.flat();
          finalArr[find_record].finding = [
            ...finalArr[find_record]?.finding,
            ...b?.finding,
          ]?.flat();

          // merge values When labels Will be same IN OtherDetails 11/11/2025
          const mergedOtherDetails = [
            ...finalArr[find_record]?.other_details_array,
            ...b?.other_details_array,
          ];

          finalArr[find_record].other_details_array = mergedOtherDetails.reduce(
            (acc, curr) => {
              const existing = acc.find((item) => item.label === curr.label);

              if (existing) {
                existing.amtval += curr.amtval;

                existing.value = (parseFloat(existing.value || 0) + curr.amtval).toFixed(2);
              } else {
                acc.push({ ...curr });
              }

              return acc;
            },
            []
          );

          finalArr[find_record].other_details_array_amount +=
            b?.other_details_array_amount;

          finalArr[find_record].totals.diamonds.Wt += b?.totals?.diamonds?.Wt;
          finalArr[find_record].totals.diamonds.Pcs += b?.totals?.diamonds?.Pcs;
          finalArr[find_record].totals.diamonds.Amount +=
            b?.totals?.diamonds?.Amount;
          finalArr[find_record].totals.diamonds.SettingAmount +=
            b?.totals?.diamonds?.SettingAmount;

          finalArr[find_record].totals.finding.Wt += b?.totals?.finding?.Wt;
          finalArr[find_record].totals.finding.Rate = b?.totals?.finding?.Rate;
          finalArr[find_record].totals.finding.Pcs += b?.totals?.finding?.Pcs;
          finalArr[find_record].totals.finding.Amount +=
            b?.totals?.finding?.Amount;
          finalArr[find_record].totals.finding.SettingAmount +=
            b?.totals?.finding?.SettingAmount;

          finalArr[find_record].totals.colorstone.Wt +=
            b?.totals?.colorstone?.Wt;
          finalArr[find_record].totals.colorstone.Pcs +=
            b?.totals?.colorstone?.Pcs;
          finalArr[find_record].totals.colorstone.Amount +=
            b?.totals?.colorstone?.Amount;
          finalArr[find_record].totals.colorstone.SettingAmount +=
            b?.totals?.colorstone?.SettingAmount;

          finalArr[find_record].totals.misc.Wt += b?.totals?.misc?.Wt;
          finalArr[find_record].totals.misc.Pcs += b?.totals?.misc?.Pcs;
          finalArr[find_record].totals.misc.Amount += b?.totals?.misc?.Amount;
          finalArr[find_record].totals.misc.SettingAmount +=
            b?.totals?.misc?.SettingAmount;

          finalArr[find_record].totals.misc.IsHSCODE_0_amount +=
            b?.totals?.misc?.IsHSCODE_0_amount;
          finalArr[find_record].totals.misc.IsHSCODE_0_pcs +=
            b?.totals?.misc?.IsHSCODE_0_pcs;
          finalArr[find_record].totals.misc.IsHSCODE_0_wt +=
            b?.totals?.misc?.IsHSCODE_0_wt;

          finalArr[find_record].totals.metal.Amount += b?.totals?.metal?.Amount;
          finalArr[find_record].totals.metal.Wt += b?.totals?.metal?.Wt;
          finalArr[find_record].totals.metal.Pcs += b?.totals?.metal?.Pcs;

          finalArr[find_record].totals.metal.IsNotPrimaryMetalAmount +=
            b?.totals?.metal?.IsNotPrimaryMetalAmount;
          finalArr[find_record].totals.metal.IsNotPrimaryMetalPcs +=
            b?.totals?.metal?.IsNotPrimaryMetalPcs;
          finalArr[find_record].totals.metal.IsNotPrimaryMetalSettingAmount +=
            b?.totals?.metal?.IsNotPrimaryMetalSettingAmount;
          finalArr[find_record].totals.metal.IsNotPrimaryMetalWt +=
            b?.totals?.metal?.IsNotPrimaryMetalWt;

          finalArr[find_record].totals.metal.IsPrimaryMetalAmount +=
            b?.totals?.metal?.IsPrimaryMetalAmount;
          finalArr[find_record].totals.metal.IsPrimaryMetalPcs +=
            b?.totals?.metal?.IsPrimaryMetalPcs;
          finalArr[find_record].totals.metal.IsPrimaryMetalSettingAmount +=
            b?.totals?.metal?.IsPrimaryMetalSettingAmount;
          finalArr[find_record].totals.metal.IsPrimaryMetalWt +=
            b?.totals?.metal?.IsPrimaryMetalWt;
        }
      }
    });

    finalArr.forEach((find_record) => {
      // Only merge if GroupJob is present
      if (find_record?.GroupJob !== "") {
        // Merge and calculate the colorstone and misc_0List
        find_record.colorstone = mergeItemsAndCalculate(find_record.colorstone);
        find_record.misc_0List = mergeItemsAndCalculate(find_record.misc_0List);
      }
    });
    datas.resultArray = finalArr;

    let darr = [];
    let darr2 = [];
    let darr3 = [];
    let darr4 = [];

    datas?.resultArray?.forEach((e) => {
      let met2 = [];
      e?.metal?.forEach((a) => {
        if (e?.GroupJob !== "") {
          let obj = { ...a };
          obj.GroupJob = e?.GroupJob;
          met2?.push(obj);
        }
      });

      let met3 = [];
      met2?.forEach((a) => {
        let findrec = met3?.findIndex(
          (el) => el?.StockBarcode === el?.GroupJob
        );
        if (findrec === -1) {
          met3?.push(a);
        } else {
          met3[findrec].Wt += a?.Wt;
        }
      });

      if (e?.GroupJob === "") {
        return;
      } else {
        e.metal = met3;
      }
    });

    datas?.json2?.forEach((el) => {
      if (el?.MasterManagement_DiamondStoneTypeid === 1) {
        if (el?.ShapeName?.toLowerCase() === "rnd") {
          darr.push(el);
        } else {
          darr2.push(el);
        }
      }
    });

    const processMetalsWt = (resultArray) => {
      const metalsData = resultArray
        ?.flatMap(el => el?.metal || [])
        ?.filter(m => m?.IsPrimaryMetal === 0)
        ?.map(m => {
          const size = Number(m.SizeName) || 0;
          const wt = Number(m.Wt) || 0;
          const calc = (size * wt) / 100;

          return {
            ...m,
            SizeName: size,
            calculatedValue: parseFloat(calc.toFixed(3)),
          };
        });

      const grouped = metalsData?.reduce((acc, m) => {
        const key = `${m.ShapeName}_${m.QualityName}_${m.Colorname}`;
        if (!acc[key]) {
          acc[key] = {
            ShapeName: m.ShapeName,
            QualityName: m.QualityName,
            Colorname: m.Colorname,
            MergedWt: 0,
          };
        }
        acc[key].MergedWt += m.calculatedValue || 0;
        return acc;
      }, {});

      return Object.values(grouped);
    };
    const processedWt = processMetalsWt(datas?.resultArray);
    setProcessedMetalsWt(processedWt);

    const processMetalsAmount = (resultArray) => {
      const metalsData = resultArray?.flatMap((job) => {
        const primaryMetal = job?.metal?.find((m) => m?.IsPrimaryMetal === 1);
        const nonPrimaryMetals = job?.metal?.filter((m) => m?.IsPrimaryMetal !== 1);

        if (!primaryMetal || !nonPrimaryMetals?.length) return [];

        return nonPrimaryMetals.map((m) => {
          const wt = Number(m.Wt) || 0;
          const calculatedValue = (primaryMetal.Rate || 0) * wt;

          return {
            ...m,
            Wt: wt,
            Rate: primaryMetal.Rate || 0,
            calculatedValue: parseFloat(calculatedValue.toFixed(3)),
          };
        });
      });

      const grouped = metalsData?.reduce((acc, m) => {
        const key = `${m.ShapeName}_${m.QualityName}_${m.Colorname}`;
        if (!acc[key]) {
          acc[key] = {
            ShapeName: m.ShapeName,
            QualityName: m.QualityName,
            Colorname: m.Colorname,
            totalWt: 0,
            totalAmount: 0,
          };
        }
        acc[key].totalWt += m.Wt || 0; // sum Wt if needed
        acc[key].totalAmount += m.calculatedValue || 0;
        return acc;
      }, {});

      return Object.values(grouped).map((g) => ({
        ...g,
        totalAmount: parseFloat(g.totalAmount.toFixed(3)), // round to 3 decimals
      }));
    };
    const processedAmount = processMetalsAmount(datas?.resultArray);
    setProcessedMetalsAmount(processedAmount);

    setResult(datas);

    darr?.forEach((a) => {
      let aobj = cloneDeep(a);
      let findrec = darr3?.findIndex(
        (al) =>
          al?.ShapeName === aobj?.ShapeName &&
          al?.Colorname === aobj?.Colorname &&
          al?.QualityName === aobj?.QualityName
      );
      if (findrec === -1) {
        darr3.push(aobj);
      } else {
        darr3[findrec].Wt += a?.Wt;
        darr3[findrec].Pcs += a?.Pcs;
      }
    });

    let obj_ = {
      ShapeName: "OTHERS",
      QualityName: "",
      Colorname: "",
      Wt: 0,
      Pcs: 0,
    };
    darr2?.forEach((a) => {
      obj_.Wt += a?.Wt;
      obj_.Pcs += a?.Pcs;
    });

    darr4 = [...darr3, obj_];

    setDiamondArr(darr4);

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
  };

  const handleImgShow = () => {
    if (imgFlag) setImgFlag(false);
    else {
      setImgFlag(true);
    }
  };
  const handleSize = () => {
    if (secondarySize) setSecondarySize(false);
    else {
      setSecondarySize(true);
    }
  };

  const handleImageErrors = () => {
    setIsImageWorking(false);
  };

  function PrintableText({ result }) {
    const htmlContent = result?.header?.Printlable?.replace(/\n/g, '<br />');

    return (
      <div
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  // const totalMakingAmount = result?.resultArray?.reduce((acc, e) => {
  //   const calculation = e?.MaKingCharge_Unit * (e?.GroupJob !== '' 
  //       ? (e?.totals?.metal?.Wt - e?.totals?.metal?.IsNotPrimaryMetalWt) 
  //       : e?.totals?.metal?.Wt
  //   );
  //   return acc + (calculation || 0);
  // }, 0);
  const totalMakingAmount = result?.resultArray?.reduce((acc, e) => {

    const weight = e?.GroupJob !== ''
      ? (e?.totals?.metal?.Wt - e?.totals?.metal?.IsNotPrimaryMetalWt)
      : e?.totals?.metal?.Wt;

    const calculation = e?.MakingChargeOnid == 4
      ? e?.MaKingCharge_Unit
      // : e?.MaKingCharge_Unit * weight;
      : e?.MakingAmount;

    return acc + (calculation || 0);

  }, 0);


  const totalMetalSummaryAmount = result?.resultArray?.reduce((totalAcc, item) => {
    const primaryMetal = item?.metal?.find(m => m?.IsPrimaryMetal === 1);
    const primaryRate = primaryMetal?.Rate || 0;

    const itemTotal = item?.metal?.reduce((acc, m) => {
      const rateToUse = primaryRate;
      const amount = (m?.Wt || 0) * (rateToUse || 0);
      return acc + amount;
    }, 0);

    return totalAcc + itemTotal;
  }, 0);

  // console.log("totalMetalSummaryAmount", totalMetalSummaryAmount);
  // console.log("totalMakingAmount", totalMakingAmount);
  // console.log("processedMetalsWt", processedMetalsWt);
  // console.log("processedMetalsAmount", processedMetalsAmount);
  // console.log("result", result);
  // console.log("diamondArr", diamondArr); 

  console.log("TCL: result", result)

  const goldTotalAmount = result?.json2
    ?.filter((e) => e?.ShapeName?.toUpperCase() === "GOLD")
    ?.reduce((sum, e) => sum + (e?.Amount || 0), 0);

  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <div>
          <div className="container_pcls">
            {/* print btn and flag */}
            <div className=" d-flex align-items-center justify-content-end my-5 whole_none_pcl3">
              <div className="px-2">
                <input
                  type="checkbox"
                  onChange={handleSize}
                  value={secondarySize}
                  checked={secondarySize}
                  id="size"
                />
                <label htmlFor="size" className="user-select-none mx-1">
                  Show Secondary Size
                </label>
              </div>
              <div className="px-2">
                <input
                  type="checkbox"
                  onChange={handleImgShow}
                  value={imgFlag}
                  checked={imgFlag}
                  id="imgshow"
                />
                <label htmlFor="imgshow" className="user-select-none mx-1">
                  With Image
                </label>
              </div>
              <div>
                <Button />
              </div>
            </div>

            {/* print head text */}
            <div className="headText_pcls">
              {result?.header?.PrintHeadLabel ?? "PACKING LIST"}
            </div>

            {/* comapny header */}
            <div className="d-flex justify-content-between align-items-center px-1 com_fs_pcl3">
              <div>
                <div className="fs_16_pcls fw-bold py-1">
                  {result?.header?.CompanyFullName}
                </div>
                <div>{result?.header?.CompanyAddress}</div>
                <div>{result?.header?.CompanyAddress2}</div>
                <div>
                  {result?.header?.CompanyCity}-{result?.header?.CompanyPinCode}
                  ,{result?.header?.CompanyState}(
                  {result?.header?.CompanyCountry})
                </div>
                <div>T {result?.header?.CompanyTellNo}</div>
                <div>
                  {result?.header?.CompanyEmail} |&nbsp;
                  {result?.header?.CompanyWebsite}
                </div>
                <div>
                  {result?.header?.Company_VAT_GST_No} |{" "}
                  {result?.header?.Company_CST_STATE} -{" "}
                  {result?.header?.Company_CST_STATE_No} | PAN -{" "}
                  {result?.header?.Com_pannumber}
                </div>
              </div>
              <div>
                {isImageWorking && (
                  <img
                    src={result?.header?.PrintLogo}
                    alt="#companylogo"
                    className="companylogo_pcls"
                    onError={handleImageErrors}
                  />
                )}
              </div>
            </div>

            {/* customer header */}
            <div className="d-flex  mt-1 brall_pcls brall_pcls ">
              <div
                className="bright_pcls p-1 com_fs_pcl3"
                style={{ width: "35%" }}
              >
                <div>{result?.header?.lblBillTo}</div>
                <div className="fs_14_pcls fw-bold">
                  {result?.header?.customerfirmname}
                </div>
                <div>{result?.header?.customerAddress2}</div>
                <div>{result?.header?.customerAddress1}</div>
                {result?.header?.customerAddress3 !== "" && (<div>{result?.header?.customerAddress3}</div>)}
                <div>
                  {result?.header?.customercity1}
                  {result?.header?.customerpincode}
                </div>
                <div>{result?.header?.customeremail1}</div>
                <div>{result?.header?.vat_cst_pan}</div>
                <div>
                  {result?.header?.Cust_CST_STATE}-
                  {result?.header?.Cust_CST_STATE_No}
                </div>
              </div>
              <div
                className="bright_pcls p-1 com_fs_pcl3"
                style={{ width: "35%" }}
              >
                <div>Ship To,</div>
                <div className="fs_14_pcls fw-bold">
                  {result?.header?.customerfirmname}
                </div>
                {result?.header?.Printlable !== "" && (<div><PrintableText result={result} /></div>)}
                {/* {result?.header?.address?.map((e, i) => {
                  return <div key={i}>{e}</div>;
                })} */}
                {/* <div>{result?.header?.CustName}</div>
                    <div>{result?.header?.customercity}</div>
                    <div>{result?.header?.customercountry}{result?.header?.customerpincode}</div>
                    <div>Mobile No : {result?.header?.customermobileno}</div> */}
              </div>
              <div className="p-1 com_fs_pcl3" style={{ width: "30%" }}>
                <div className="d-flex align-items-center">
                  <div className="fw-bold billbox_pcls">BILL NO </div>
                  <div>{result?.header?.InvoiceNo}</div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="fw-bold billbox_pcls">DATE </div>
                  <div>{result?.header?.EntryDate}</div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="fw-bold billbox_pcls">
                    {result?.header?.HSN_No_Label}{" "}
                  </div>
                  <div>{result?.header?.HSN_No}</div>
                </div>
              </div>
            </div>

            {/* table */}
            <div className="mt-1 ">
              {/* table head */}
              <div
                className="d-flex thead_pcls bbottom_pcls tb_fs_pcls"
                style={{
                  borderTop: "1px solid black",
                  borderLeft: "1px solid black",
                  borderRight: "1px solid black",
                }}
              >
                <div className="col1_pcls centerall_pcls bright_pcls">Sr</div>
                <div className="col2_pcls centerall_pcls bright_pcls">
                  Design
                </div>
                <div className="col3_pcls bright_pcls">
                  <div className="w-100 centerall_pcls bbottom_pcls">
                    Diamond
                  </div>
                  <div className="d-flex w-100">
                    <div className="dcol1_pcls centerall_pcls bright_pcls">
                      Code
                    </div>
                    <div className="dcol2_pcls centerall_pcls bright_pcls">
                      Size
                    </div>
                    <div className="dcol3_pcls centerall_pcls bright_pcls">
                      Pcs
                    </div>
                    <div className="dcol4_pcls centerall_pcls bright_pcls">
                      Wt
                    </div>
                    <div className="dcol5_pcls centerall_pcls bright_pcls">
                      Rate
                    </div>
                    <div className="dcol6_pcls centerall_pcls">Amount</div>
                  </div>
                </div>
                <div className="col4_pcls bright_pcls">
                  <div className="w-100 centerall_pcls bbottom_pcls">Metal</div>
                  <div className="d-flex w-100">
                    <div className="mcol1_pcls centerall_pcls bright_pcls">
                      Quality
                    </div>
                    <div className="mcol1_pcls centerall_pcls bright_pcls">
                      Gwt
                    </div>
                    <div className="mcol1_pcls centerall_pcls bright_pcls">
                      N + L
                    </div>
                    <div className="mcol1_pcls centerall_pcls bright_pcls">
                      Rate
                    </div>
                    <div className="mcol1_pcls centerall_pcls ">Amount</div>
                  </div>
                </div>
                <div className="col5_pcls bright_pcls">
                  <div className="w-100 centerall_pcls bbottom_pcls">
                    Stone & Misc
                  </div>
                  <div className="d-flex w-100">
                    <div className="dcol1_pcls centerall_pcls bright_pcls">
                      Code
                    </div>
                    <div className="dcol2_pcls centerall_pcls bright_pcls">
                      Size
                    </div>
                    <div className="dcol3_pcls centerall_pcls bright_pcls">
                      Pcs
                    </div>
                    <div className="dcol4_pcls centerall_pcls bright_pcls">
                      Wt
                    </div>
                    <div className="dcol5_pcls centerall_pcls bright_pcls">
                      Rate
                    </div>
                    <div className="dcol6_pcls centerall_pcls">Amount</div>
                  </div>
                </div>
                <div className="col6_pcls bright_pcls">
                  <div className="centerall_pcls w-100 bbottom_pcls">
                    Labour & Other Charges
                  </div>
                  <div className="d-flex w-100">
                    <div className="lcol1_pcls centerall_pcls bright_pcls">
                      Charges
                    </div>
                    <div className="lcol1_pcls centerall_pcls bright_pcls">
                      Rate
                    </div>
                    <div className="lcol1_pcls centerall_pcls">Amount</div>
                  </div>
                </div>
                <div className="col7_pcls centerall_pcls">Total Amount</div>
              </div>

              {/* table rows */}
              {result?.resultArray?.map((e, i) => {
                const mergedMetals = mergeMetals(e?.metal);
                const mergedFindings = mergeFindings(e?.finding);
                const mergedBySettingRate = mergedBySeetingRate(mergedFindings);
                const totalSetAmt = mergedFindings.reduce((sum, item) => {
                  return sum + (Number(item?.SettingAmount) || 0);
                }, 0);
                                
                 
                // Calculate extra charges safely
                const labourTotal = e?.GroupJob !== ""
                  ? (result?.labour?.filter((el) => el?.GroupjobNo === e?.GroupJob)
                    ?.reduce((sum, item) => sum + (item.MakingCharge || 0), 0) || 0)
                  : 0;

                const extraCharge =
                  (e?.OtherCharges || 0) +
                  (e?.TotalDiamondHandling || 0) +
                  (e?.totals?.misc?.IsHSCODE_1_amount || 0) +
                  (e?.totals?.misc?.IsHSCODE_2_amount || 0) +
                  (e?.totals?.misc?.IsHSCODE_3_amount || 0) +
                  (e?.totals?.diamonds?.SettingAmount || 0) +
                  (e?.totals?.colorstone?.SettingAmount || 0) +
                  (e?.totals?.finding?.SettingAmount || 0) +
                  labourTotal +

                  (
                    e?.GroupJob !== ""
                      ? (e?.MaKingCharge_Unit || 0) *
                      ((e?.totals?.metal?.Wt || 0) -
                        (e?.totals?.metal?.IsNotPrimaryMetalWt || 0))
                      :
                      // e?.MakingChargeOnid === 4
                      //   ? (e?.MaKingCharge_Unit || 0)
                      //   : (e?.MaKingCharge_Unit || 0) *
                      //   (e?.totals?.metal?.Wt || 0)
                      e?.MakingAmount
                  );

                const finalAmount =
                  extraCharge / (result?.header?.CurrencyExchRate || 1);
                return (
                  <div
                    className="d-flex tbody_pcls bbottom_pcls tb_fs_pcls pbia_pcl3 border-top"
                    style={{
                      borderLeft: "1px solid black",
                      borderRight: "1px solid black",
                    }}
                    key={i}
                  >
                    <div className="col1_pcls d-flex justify-content-center align-items-start bright_pcls pt-1">
                      {i + 1}
                    </div>

                    {/* Design */}
                    <div className="col2_pcls start_top_pcls flex-column bright_pcls pt-1">
                      <div className="d-flex flex-wrap justify-content-between align-items-center w-100 text-break pdl_pcls pdr_pcls">
                        <div>{e?.designno}</div>
                        <div>{e?.GroupJob !== "" ? e?.GroupJob : e?.SrJobno}</div>
                      </div>
                      <div className="d-flex flex-wrap justify-content-end w-100 text-break pdr_pcls">
                        {e?.MetalColor}
                      </div>
                      {imgFlag ? (
                        <div>
                          <img
                            src={e?.DesignImage}
                            onError={(e) => handleImageError(e)}
                            alt="design"
                            className="designimg_pcls"
                          />
                        </div>
                      ) : (
                        ""
                      )}
                      {e?.CertificateNo !== "" && (
                        <div className="centerall_pcls text-break w-100">
                          Certificate# :{" "}
                          <span className="fw-bold">{e?.CertificateNo}</span>
                        </div>
                      )}
                      {e?.HUID !== "" && (
                        <div className="centerall_pcls w-100 text-break">
                          HUID : <span className="fw-bold">{e?.HUID}</span>
                        </div>
                      )}
                      {e?.PO !== "" && (
                        <div className="centerall_pcls w-100 fw-bold text-break">
                          PO : {e?.PO}
                        </div>
                      )}
                      {e?.lineid !== "" && (
                        <div className="centerall_pcls w-100 text-break">
                          {e?.lineid}
                        </div>
                      )}
                      {e?.Tunch !== "" && (
                        <div className="centerall_pcls w-100 text-break">
                          Tunch :{" "}
                          <span className="fw-bold">
                            {e?.Tunch?.toFixed(3)}
                          </span>
                        </div>
                      )}
                      {e?.Size !== "" && (
                        <div className="centerall_pcls w-100 text-break">
                          <span className="">Size : {e?.Size}</span>
                        </div>
                      )}
                      {e?.grosswt !== "" && (
                        <div className="centerall_pcls text-break w-100 fw-bold">
                          {e?.grosswt?.toFixed(3)} gm{" "}
                          <span className="fw-normal">&nbsp;Gross</span>
                        </div>
                      )}
                    </div>

                    {/* Diamond */}
                    <div className="col3_pcls d-flex flex-column justify-content-between bright_pcls">
                      <div>
                        {/* {e?.diamonds?.map((el, ind) => {
                          return (
                            <div className="d-flex w-100" key={ind}>
                              <div className="dcol1_pcls spbrWord start_center_pcls pdl_pcls">
                                {el?.ShapeName +
                                  " " +
                                  el?.QualityName +
                                  " " +
                                  el?.Colorname}
                              </div>
                              <div className="dcol2_pcls start_center_pcls pdl_pcls">
                                {secondarySize
                                  ? el?.SecondarySize
                                  : el?.SizeName.toLowerCase() === "custom" ? `C: ${el?.CustomSize}` : el?.SizeName}
                              </div>
                              <div className="dcol3_pcls end_pcls pdr_pcls">
                                {el?.Pcs}
                              </div>
                              <div className="dcol4_pcls end_pcls pdr_pcls">
                                {el?.Wt?.toFixed(3)}
                              </div>
                              <div className="dcol5_pcls end_pcls pdr_pcls">
                                {formatAmount(el?.Rate)}
                              </div>
                              <div className="dcol6_pcls end_pcls pdr_pcls fw-bold">
                                {formatAmount(
                                  el?.Amount / result?.header?.CurrencyExchRate
                                )}
                              </div>
                            </div>
                          );
                        })} */}
                        {e?.diamonds
                          ?.slice()
                          ?.sort((a, b) => {
                            const aCustom = a?.SizeName?.toLowerCase() === "custom";
                            const bCustom = b?.SizeName?.toLowerCase() === "custom";

                            // Normal first
                            if (aCustom && !bCustom) return 1;
                            if (!aCustom && bCustom) return -1;

                            const getFirstNumber = (val) => {
                              if (!val) return 0;
                              const match = val.match(/[\d.]+/); // extract first numeric part
                              return match ? parseFloat(match[0]) : 0;
                            };

                            // Normal size ascending
                            if (!aCustom && !bCustom) {
                              return getFirstNumber(a?.SizeName) - getFirstNumber(b?.SizeName);
                            }

                            // Custom size descending
                            return getFirstNumber(b?.CustomSize) - getFirstNumber(a?.CustomSize);
                          })
                          ?.map((el, ind) => (
                            <div className="d-flex w-100" key={ind}>
                              <div className="dcol1_pcls spbrWord start_center_pcls pdl_pcls">
                              {el?.IsSolGem === 1 ? "S:" : ""}
                                {el?.ShapeName + " " + el?.QualityName + " " + el?.Colorname}
                              </div>

                              <div className="dcol2_pcls start_center_pcls pdl_pcls">
                                {secondarySize
                                  ? el?.SecondarySize
                                  : el?.SizeName?.toLowerCase() === "custom"
                                    ? `C:${el?.CustomSize}`
                                    : el?.SizeName}
                              </div>

                              <div className="dcol3_pcls end_pcls pdr_pcls">
                                {el?.Pcs}
                              </div>

                              <div className="dcol4_pcls end_pcls pdr_pcls">
                                {el?.Wt?.toFixed(3)}
                              </div>

                              <div className="dcol5_pcls end_pcls pdr_pcls" style={{ textAlign: "right" }}>
                                {formatAmount(el?.Rate)}
                              </div>

                              <div className="dcol6_pcls end_pcls pdr_pcls fw-bold">
                                {formatAmount(el?.Amount / result?.header?.CurrencyExchRate)}
                              </div>
                            </div>
                          ))}
                      </div>
                      <div className="d-flex w-100 btop_pcls bg_pcls fw-bold">
                        <div className="dcol1_pcls">&nbsp;</div>
                        <div className="dcol2_pcls"></div>
                        <div className="dcol3_pcls end_pcls pdr_pcls">
                          {e?.totals?.diamonds?.Pcs !== 0 &&
                            e?.totals?.diamonds?.Pcs}
                        </div>
                        <div className="dcol4_pcls end_pcls pdr_pcls">
                          {e?.totals?.diamonds?.Wt !== 0 &&
                            e?.totals?.diamonds?.Wt?.toFixed(3)}
                        </div>
                        <div
                          className="end_pcls pdr_pcls"
                          style={{ width: "37%" }}
                        >
                          {e?.totals?.diamonds?.Amount !== 0 ?
                            formatAmount(
                              e?.totals?.diamonds?.Amount /
                              result?.header?.CurrencyExchRate
                            ) : "0.00"}
                        </div>
                      </div>
                    </div>

                    {/* Metal */}
                    <div className="col4_pcls d-flex flex-column justify-content-between bright_pcls">
                      <div>
                        {mergedMetals?.map((el, ind) => {
                          { }

                          // ************************ Counting & Conditions ************************
                          const isChainOrHook = e?.specialFinding?.FindingTypename?.toLowerCase()?.includes("chain") ||
                            e?.specialFinding?.FindingTypename?.toLowerCase()?.includes("hook");

                          const matchingFinding = e?.finding?.find(finding =>
                            finding?.ShapeName?.toLowerCase() === el?.ShapeName?.toLowerCase()
                          );

                          const totalMetalWeight = e?.metal?.reduce((acc, metal) => {
                            if (matchingFinding && metal?.ShapeName?.toLowerCase() === matchingFinding?.ShapeName?.toLowerCase()) {
                              return acc + (metal?.Wt || 0);
                            }
                            return acc;
                          }, 0);

                          let weight = isChainOrHook
                            ? (e?.NetWt - e?.finding_customer_wt)?.toFixed(3)
                            : (el?.Wt - e?.finding_customer_wt - e?.LossWt)?.toFixed(3);

                          if (e?.GroupJob !== '') {
                            const findingToExclude = e?.finding?.find(finding => finding?.StockBarcode !== e?.GroupJob);
                            // console.log("findingToExclude",findingToExclude);

                            if (findingToExclude) {
                              weight = (totalMetalWeight - findingToExclude?.Wt)?.toFixed(3);
                            } else {
                              weight = e?.metal?.reduce((acc, metal) => acc + (metal?.Wt || 0), 0).toFixed(3);
                            }
                          }

                          const amount = isChainOrHook
                            ? ((e?.NetWt * e?.metal_rate) / result?.header?.CurrencyExchRate)?.toFixed(2)
                            : ((el?.Wt * el?.Rate) - e?.LossAmt)?.toFixed(2);

                          const rate = el?.Rate?.toFixed(2);

                          const grossWeight = e?.grosswt?.toFixed(3);

                          const shapeAndQuality = `${el?.ShapeName || 'Unknown Shape'} ${el?.QualityName || 'Unknown Quality'}`;
                          // ************************ Counting & Conditions ************************

                          if (e?.GroupJob !== '' && e?.GroupJob === el?.StockBarcode) { // When Group Job Then Only Show Primary Job's Metal Name
                            // ************************ 02/12/2025 Completed An Bug ************************
                            const WtMRate = (weight * rate)?.toFixed(2);
                            // console.log("WtMRate", WtMRate);

                            const isAmtNotLess = WtMRate > e?.totals?.metal?.Amount;
                            // console.log("isAmtNotLess", isAmtNotLess);

                            const firstElementWt = e?.metal?.[0]?.Wt;
                            // console.log("firstElementWt", firstElementWt);

                            const isAmtLess = WtMRate < e?.totals?.metal?.Amount;
                            // console.log("isAmtNotLess", isAmtNotLess);

                            const FindingAmt = e?.finding?.map((data) => {
                              if (e?.GroupJob !== '' && e?.GroupJob !== data?.StockBarcode) {
                                const primaryMetal = e?.metal?.filter((m) => m?.IsPrimaryMetal === 1)[0];
                                // Check if primaryMetal exists to avoid errors
                                const metalRate = primaryMetal?.Rate;
                                // console.log("metalRate", metalRate);

                                const FWT = data?.Wt;
                                // console.log("FWT", FWT);

                                const FAmount = FWT * metalRate
                                // console.log("FAmount", FAmount);

                                return FAmount?.toFixed(2)
                              } else {
                                return data?.Amount ? data?.Amount.toFixed(2) : "0.00";
                              }
                            });
                            // console.log("FindingAmt", FindingAmt);

                            const totalFindingAmt = FindingAmt?.reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
                            // console.log("totalFindingAmt", totalFindingAmt);

                            const SecondaryMetalAmounts = e?.metal?.map((el) =>
                              el?.StockBarcode !== el?.GroupJob && el?.IsPrimaryMetal === 0
                                ? el?.Wt * el?.Rate
                                : 0
                            );
                            // console.log("SecondaryMetalAmounts", SecondaryMetalAmounts);

                            const totalSecondaryMetalAmt = SecondaryMetalAmounts?.reduce((acc, amt) => acc + amt, 0);
                            // console.log("totalSecondaryMetalAmt", totalSecondaryMetalAmt);
                            // ************************ 02/12/2025 Completed An Bug ************************

                            return (
                              <div className="d-flex w-100" key={ind}>
                                <div className="mcol1_pcls spbrWord start_center_pcls pdl_pcls">
                                  {shapeAndQuality}
                                </div>
                                <div className="mcol2_pcls end_pcls pdr_pcls">
                                  {grossWeight}
                                </div>
                                <div className="mcol3_pcls end_pcls pdr_pcls">
                                  {weight}
                                  {/* {console.log("weight", weight)} */}
                                </div>
                                <div className="mcol4_pcls end_pcls pdr_pcls">
                                  {rate}
                                  {/* {console.log("rate", rate)} */}
                                </div>
                                <div className="mcol5_pcls end_pcls pdr_pcls fw-bold">
                                  {e?.GroupJob !== '' && e?.finding?.length === 0
                                    ? e?.totals?.metal?.Amount?.toFixed(2)
                                    : isAmtNotLess
                                      ? (firstElementWt * rate)?.toFixed(2)
                                      : isAmtLess
                                        ? (e?.totals?.metal?.Amount - (totalFindingAmt + totalSecondaryMetalAmt))?.toFixed(2)
                                        : WtMRate
                                  }
                                </div>
                              </div>
                            );
                          } else if (e?.GroupJob !== '' && el?.IsPrimaryMetal === 0) { // When Group Job and MultiMetal Then That Time Secondary Metal From Here 
                            return (
                              <div className="d-flex w-100" key={ind}>
                                <div className="start_center_pcls mcol1_pcls spbrWord pdl_pcls">
                                  {shapeAndQuality}
                                </div>
                                <div className="mcol2_pcls end_pcls pdr_pcls"></div>
                                <div className="mcol3_pcls end_pcls pdr_pcls">
                                  {fixedValues(el?.Wt - e?.LossWt, 3)}
                                </div>
                                <div className="mcol4_pcls end_pcls pdr_pcls">
                                  {rate}
                                </div>
                                <div className="mcol5_pcls end_pcls pdr_pcls fw-bold">
                                  {/* {(el?.Wt * el?.Rate)?.toFixed(2)} */}
                                   {el?.Amount?.toFixed(2)}
                                </div>
                              </div>
                            );
                          }
                          // else if (e?.GroupJob === '' && el?.IsPrimaryMetal === 1) 
                          else if (e?.GroupJob === '') {
                            // No Group Job, That Time Only Primary Metal To Show
                            return (
                              <div className="d-flex w-100" key={ind}>
                                <div className="pdl_pcls spbrWord mcol1_pcls start_center_pcls">
                                  {shapeAndQuality}
                                </div>
                                <div className="mcol2_pcls end_pcls pdr_pcls">
                                  {el?.IsPrimaryMetal == 1 ? grossWeight : ""}
                                </div>
                                <div className="mcol3_pcls end_pcls pdr_pcls">
                                  {weight}
                                </div>
                                <div className="mcol4_pcls end_pcls pdr_pcls">
                                  {parseFloat(rate) !== 0 ? rate : ""}
                                </div>
                                <div className="mcol5_pcls end_pcls pdr_pcls fw-bold">
                                  {/* {parseFloat(rate) !== 0 ? Number(amount).toFixed(2) : ""} */}
                                  {el?.Amount?.toFixed(2)}
                                </div>
                              </div>
                            );
                          } else {
                            return (<></>);
                          }
                        })}

                        {/* Finding */}
                        
                       { console.log("TCL: mergedFindings", mergedFindings)}
                        <div style={{ margin: "0px 2px" }}>
                          {mergedFindings?.map((data, index) => (
                            <React.Fragment key={index}>
                        
                                <div style={{ display: "flex" }}>
                                  <div style={{ width: "40%" }}>
                                    <p className="spbrWord">
                                      {e?.GroupJob !== '' ? "FINDING ACCESSORIES" : data?.FindingTypename + " " + data?.QualityName}
                                    </p>
                                  </div>
                                  <div
                                    style={{
                                      width: "14.50%",
                                      display: "flex",
                                      justifyContent: "flex-end",
                                    }}
                                  >
                                    <p>{data?.Wt?.toFixed(3)}</p>
                                  </div>
                                  <div
                                    style={{
                                      width: "22%",
                                      display: "flex",
                                      justifyContent: "flex-end",
                                    }}
                                  >
                                    <p>
                                      {e?.GroupJob !== ''
                                        ? e?.metal
                                          ?.filter((m) => m?.IsPrimaryMetal === 1)[0]
                                          ?.Rate?.toFixed(2)
                                        : data?.Rate?.toFixed(2)
                                      }
                                    </p>
                                  </div>
                                  <div
                                    style={{
                                      width: "23.50%",
                                      display: "flex",
                                      justifyContent: "flex-end",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    <p>
                                      {e?.GroupJob !== ''
                                        ? (e?.metal
                                          ?.filter((m) => m?.IsPrimaryMetal === 1)[0]
                                          ?.Rate * (parseFloat(data?.Wt) || 0))?.toFixed(2)
                                        : data?.Amount?.toFixed(2)
                                      }
                                    </p>
                                  </div>
                                </div>
                           
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Loss */}
                        {e?.LossWt !== 0 && (
                          <div className="d-flex w-100 pt-1">
                            <div className="mcol1_pcls start_center_pcls pdl_pcls" style={{ width: "15%" }}>
                              Loss
                            </div>
                            <div className="mcol2_pcls end_pcls pdr_pcls" style={{ width: "22%" }}>
                              {e?.LossPer?.toFixed(3)} %
                            </div>
                            <div className="mcol3_pcls end_pcls pdr_pcls">
                              {e?.LossWt?.toFixed(3)}
                            </div>
                            <div className="mcol4_pcls end_pcls pdr_pcls">
                              {e?.metal_rate?.toFixed(2)}
                            </div>
                            <div className="mcol5_pcls end_pcls pdr_pcls fw-bold">
                              {
                                e?.LossAmt?.toFixed(2) // / result?.header?.CurrencyExchRate 10/11/2025
                              }
                            </div>
                          </div>
                        )}

                        {/* Remark */}
                        {e?.JobRemark !== "" && (
                          <div className=" w-100 pt-2">
                            <div className="ps-1 start_center_pcls ">
                              Remark :
                            </div>
                            <div className="ps-1 fw-bold start_center_pcls ">
                              {e?.JobRemark}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Per Job Total */}
                      <div className="d-flex w-100 btop_pcls bg_pcls fw-bold">
                        <div className="mcol1_pcls ">&nbsp;</div>
                        <div className="mcol2_pcls end_pcls pdr_pcls">
                          {e?.grosswt !== 0 && e?.grosswt?.toFixed(3)}
                        </div>
                        <div className="mcol3_pcls end_pcls pdr_pcls">
                          {e?.NetWt + e?.LossWt !== 0 &&
                            (e?.NetWt + e?.LossWt)?.toFixed(3)}
                        </div>
                        <div
                          className="end_pcls pdr_pcls"
                          style={{ width: "45%" }}
                        >
                          {e?.totals?.metal?.Amount !== 0 &&
                            formatAmount(
                              e?.totals?.metal?.Amount /
                              result?.header?.CurrencyExchRate
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Stone & Misc */}
                    <div className="col5_pcls  d-flex flex-column justify-content-between bright_pcls">
                      <div>
                        {e?.colorstone?.map((el, ind) => {
                          return (
                            <div className="d-flex w-100" key={ind}>
                              <div className="dcol1_pcls spbrWord start_center_pcls pdl_pcls">
                              {el?.IsSolGem === 1 ? "G:" : ""}
                                {el?.ShapeName +
                                  " " +
                                  el?.QualityName +
                                  " " +
                                  el?.Colorname}
                              </div>
                              <div className="dcol2_pcls start_center_pcls pdl_pcls">
                                {secondarySize
                                  ? el?.SecondarySize
                                  : el?.SizeName}
                              </div>
                              <div className="dcol3_pcls end_pcls pdr_pcls">
                                {el?.Pcs}
                              </div>
                              <div className="dcol4_pcls end_pcls pdr_pcls">
                                {el?.Wt?.toFixed(3)}
                              </div>
                              <div className="dcol5_pcls end_pcls pdr_pcls">
                                {formatAmount(el?.Rate)}
                              </div>
                              <div className="dcol6_pcls end_pcls pdr_pcls fw-bold">
                                {formatAmount(
                                  el?.Amount / result?.header?.CurrencyExchRate
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {e?.misc_0List?.map((el, ind) => {
                          return (
                            <div className="d-flex w-100" key={ind}>
                              <div className="dcol1_pcls spbrWord start_center_pcls pdl_pcls">
                                {el?.ShapeName?.length !== 0 && "M : "}
                                {el?.ShapeName + " " + el?.QualityName}
                              </div>
                              <div className="dcol2_pcls start_center_pcls pdl_pcls">
                                {secondarySize
                                  ? el?.SecondarySize
                                  : el?.SizeName}
                              </div>
                              <div className="dcol3_pcls end_pcls pdr_pcls">
                                {el?.Pcs}
                              </div>
                              <div className="dcol4_pcls end_pcls pdr_pcls">
                                {el?.Wt?.toFixed(3)}
                              </div>
                              <div className="dcol5_pcls end_pcls pdr_pcls">
                                {formatAmount(el?.Rate)}
                              </div>
                              <div className="dcol6_pcls end_pcls pdr_pcls fw-bold">
                                {formatAmount(
                                  el?.Amount / result?.header?.CurrencyExchRate
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="d-flex w-100 btop_pcls bg_pcls fw-bold">
                        <div className="dcol1_pcls">&nbsp;</div>
                        <div className="dcol2_pcls"></div>
                        <div className="dcol3_pcls end_pcls pdr_pcls">
                          {e?.totals?.misc?.IsHSCODE_0_pcs +
                            e?.totals?.colorstone?.Pcs !==
                            0 &&
                            e?.totals?.misc?.IsHSCODE_0_pcs +
                            e?.totals?.colorstone?.Pcs}
                        </div>
                        <div className="dcol4_pcls end_pcls pdr_pcls">
                          {e?.totals?.misc?.IsHSCODE_0_wt +
                            e?.totals?.colorstone?.Wt !==
                            0 &&
                            (
                              e?.totals?.colorstone?.Wt +
                              e?.totals?.misc?.IsHSCODE_0_wt
                            )?.toFixed(3)}
                        </div>
                        <div
                          className="end_pcls pdr_pcls"
                          style={{ width: "37%" }}
                        >
                          {formatAmount(e?.totals?.misc?.IsHSCODE_0_amount + e?.totals?.colorstone?.Amount !== 0 &&
                            ((e?.totals?.misc?.IsHSCODE_0_amount + e?.totals?.colorstone?.Amount) / result?.header?.CurrencyExchRate)
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Labour & Other Charges */}
                    <div className="col6_pcls  d-flex flex-column justify-content-between bright_pcls">
                      <div>
                        {e?.GroupJob !== "" ? (
                          result?.labour?.filter((el) => el?.GroupjobNo === e?.GroupJob)?.map((el) => (
                            <div className="d-flex w-100">
                              <div className="lcol1_pcls start_center_pcls pdl_pcls">
                                {el?.name}
                              </div>
                              <div className="lcol1_pcls end_pcls pdr_pcls">
                                {formatAmount(el?.MakingUnit)}
                              </div>
                              <div className="lcol1_pcls end_pcls pdr_pcls">
                                {formatAmount(el?.MakingCharge, 2)}
                              </div>
                            </div>
                          ))
                        ) : (
                          e?.MaKingCharge_Unit !== 0 && (
                            <div className="d-flex w-100">
                              <div className="lcol1_pcls start_center_pcls pdl_pcls">
                                Labour
                              </div>
                              <div className="lcol1_pcls end_pcls pdr_pcls">
                                {formatAmount(e?.MaKingCharge_Unit)}
                              </div>
                              <div className="lcol1_pcls end_pcls pdr_pcls">
                                {/* {formatAmount(e?.MaKingCharge_Unit * e?.totals?.metal?.Wt ,2)} */}
                                {formatAmount(e?.MakingAmount)}
                                {/* {e?.MakingChargeOnid==4 ? formatAmount(e?.MaKingCharge_Unit) : formatAmount(e?.MaKingCharge_Unit * e?.totals?.metal?.Wt ,2)} */}
                              </div>
                            </div>
                          )
                        )}

                        {mergedBySettingRate?.length !== 0 && (
                          mergedBySettingRate?.map((val, ind) => (
                            <div className="d-flex w-100">
                            <div className="lcol1_pcls start_center_pcls pdl_pcls">
                              Finding
                            </div>
                            <div className="lcol1_pcls end_pcls pdr_pcls">
                               {val?.SettingRate ? val?.SettingRate?.toFixed(2) : ""}
                            </div>
                            <div className="lcol1_pcls end_pcls pdr_pcls">
                            {val?.SettingAmount ? val?.SettingAmount?.toFixed(2) : ""}
                               
                            </div>
                          </div>
                          )
                          
                       ))}




                        {e?.other_details_array?.map((ele, inds) => {
                          return (
                            <div className="d-flex w-100" key={inds}>
                              <div className="w-75 spbrWord start_center_pcls pdl_pcls text-break">
                                {ele?.label}
                              </div>
                              <div className="w-25 end_pcls pdr_pcls">
                                {ele?.value}
                              </div>
                            </div>
                          );
                        })}
                        {e?.misc_1List?.map((ele, inds) => {
                          return (
                            <>
                              {ele?.Amount !== 0 && (
                                <div className="d-flex w-100" key={inds}>
                                  <div className="w-50 spbrWord start_center_pcls pdl_pcls text-break">
                                    {ele?.ShapeName}
                                  </div>
                                  <div className="w-50 end_pcls pdr_pcls">
                                    {formatAmount(
                                      ele?.Amount /
                                      result?.header?.CurrencyExchRate
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })}
                        {e?.misc_2List?.map((ele, inds) => {
                          return (
                            <>
                              {ele?.Amount !== 0 && (
                                <div className="d-flex w-100" key={inds}>
                                  <div className="w-50 spbrWord start_center_pcls pdl_pcls text-break">
                                    {ele?.ShapeName}
                                  </div>
                                  <div className="w-50 end_pcls pdr_pcls">
                                    {formatAmount(
                                      ele?.Amount /
                                      result?.header?.CurrencyExchRate
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })}
                        {e?.misc_3List?.map((ele, inds) => {
                          return (
                            <>
                              {ele?.Amount !== 0 && (
                                <div className="d-flex w-100" key={inds}>
                                  <div className="w-50 spbrWord start_center_pcls pdl_pcls text-break">
                                    {ele?.ShapeName}
                                  </div>
                                  <div className="w-50 end_pcls pdr_pcls">
                                    {formatAmount(
                                      ele?.Amount /
                                      result?.header?.CurrencyExchRate
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })}
                        {e?.totals?.diamonds?.SettingAmount +
                          e?.totals?.colorstone?.SettingAmount !==
                          0 && (
                            <div className="d-flex w-100">
                              <div className="w-50 start_center_pcls pdl_pcls text-break">
                                Setting
                              </div>
                              <div className="w-50 end_pcls pdr_pcls">
                                {formatAmount(
                                  (e?.totals?.diamonds?.SettingAmount +
                                    e?.totals?.colorstone?.SettingAmount) /
                                  result?.header?.CurrencyExchRate
                                )}
                              </div>
                            </div>
                          )}
                        

                        {e?.TotalDiamondHandling !== 0 && (
                          <div className="d-flex w-100">
                            <div className="w-50 start_center_pcls pdl_pcls">
                              Handling
                            </div>
                            <div className="w-50 end_pcls pdr_pcls">
                              {formatAmount(
                                e?.TotalDiamondHandling /
                                result?.header?.CurrencyExchRate
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="d-flex w-100 btop_pcls bg_pcls fw-bold">
                        <div className="w-100 end_pcls pdr_pcls">
                          &nbsp;
                          {extraCharge !== 0 && formatAmount(finalAmount)}
                        </div>
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="col7_pcls   d-flex flex-column justify-content-between">
                      <div className="start_pcls pdr_pcls fw-bold">
                        {formatAmount(
                          // e?.TotalAmount / result?.header?.CurrencyExchRate
                          e?.UnitCost / result?.header?.CurrencyExchRate
                        )}
                      </div>
                      <div className="start_pcls btop_pcls bg_pcls pdr_pcls fw-bold">
                        &nbsp;
                        {formatAmount(
                          // e?.TotalAmount / result?.header?.CurrencyExchRate
                          e?.UnitCost / result?.header?.CurrencyExchRate
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* main total */}
              <div
                className="d-flex thead_pcls bbottom_pcls tb_fs_pcls"
                style={{
                  borderBottom: "1px solid black",
                  borderLeft: "1px solid black",
                  borderRight: "1px solid black",
                }}
              >
                <div className="col1_pcls bright_pcls"></div>
                <div className="col2_pcls centerall_pcls  bright_pcls">
                  Total
                </div>
                <div className="col3_pcls bright_pcls">
                  <div className="d-flex w-100">
                    <div className="dcol1_pcls centerall_pcls "></div>
                    <div className="dcol2_pcls centerall_pcls "></div>
                    <div className="dcol3_pcls end_pcls pdr_pcls ">
                      {result?.mainTotal?.diamonds?.Pcs}
                    </div>
                    <div className="dcol4_pcls end_pcls pdr_pcls ">
                      {result?.mainTotal?.diamonds?.Wt?.toFixed(3)}
                    </div>
                    <div
                      className="dcol6_pcls end_pcls pdr_pcls"
                      style={{ width: "37%" }}
                    >
                      {formatAmount(
                        result?.mainTotal?.diamonds?.Amount /
                        result?.header?.CurrencyExchRate
                      )}
                    </div>
                  </div>
                </div>
                <div className="col4_pcls bright_pcls">
                  <div className="d-flex w-100">
                    <div className="mcol1_pcls  "></div>
                    <div className="mcol2_pcls end_pcls pdr_pcls ">
                      {result?.mainTotal?.grosswt?.toFixed(3)}
                    </div>
                    <div className="mcol3_pcls end_pcls pdr_pcls ">
                      {(
                        result?.mainTotal?.NetWt + result?.mainTotal?.LossWt
                      )?.toFixed(3)}
                    </div>
                    <div className="end_pcls pdr_pcls" style={{ width: "45%" }}>
                      {formatAmount(
                        result?.mainTotal?.metal?.Amount /
                        result?.header?.CurrencyExchRate
                      )}
                    </div>
                  </div>
                </div>
                <div className="col5_pcls bright_pcls">
                  <div className="d-flex w-100">
                    <div className="dcol1_pcls centerall_pcls "></div>
                    <div className="dcol2_pcls centerall_pcls "></div>
                    <div className="dcol3_pcls end_pcls pdr_pcls ">
                      {result?.mainTotal?.colorstone?.Pcs +
                        result?.mainTotal?.misc?.IsHSCODE_0_pcs}
                    </div>
                    <div className="dcol4_pcls end_pcls pdr_pcls ">
                      {(
                        result?.mainTotal?.colorstone?.Wt +
                        result?.mainTotal?.misc?.IsHSCODE_0_wt
                      )?.toFixed(3)}
                    </div>
                    <div
                      className=" end_pcls pdr_pcls"
                      style={{ width: "37%" }}
                    >
                      {formatAmount(
                        (result?.mainTotal?.misc?.IsHSCODE_0_amount +
                          result?.mainTotal?.colorstone?.Amount) /
                        result?.header?.CurrencyExchRate
                      )}
                    </div>
                  </div>
                </div>
                <div className="col6_pcls bright_pcls">
                  <div className="d-flex w-100">
                    <div className="w-100 end_pcls pdr_pcls">
                      {formatAmount(
                        (
                          (result?.mainTotal?.OtherCharges || 0) +
                          (result?.mainTotal?.TotalDiamondHandling || 0) +
                          (result?.mainTotal?.diamonds?.SettingAmount || 0) +
                          (result?.mainTotal?.colorstone?.SettingAmount || 0) +
                          (result?.mainTotal?.finding?.SettingAmount || 0) +
                          (totalMakingAmount || 0) +
                          (result?.mainTotal?.misc?.IsHSCODE_1_amount || 0) +
                          (result?.mainTotal?.misc?.IsHSCODE_2_amount || 0) +
                          (result?.mainTotal?.misc?.IsHSCODE_3_amount || 0)
                        ) / (result?.header?.CurrencyExchRate || 1)
                      )}
                    </div>
                  </div>
                </div>
                <div className="col7_pcls end_pcls pdr_pcls">
                  {formatAmount(
                    (result?.mainTotal?.TotalAmount +
                      result?.mainTotal?.DiscountAmt) /
                    result?.header?.CurrencyExchRate
                  )}
                </div>
              </div>

              {/* taxes and grand total */}
              <div
                className="d-flex tb_fs_pcls justify-content-end align-items-center"
                style={{
                  borderBottom: "1px solid black",
                  borderLeft: "1px solid black",
                  borderRight: "1px solid black",
                }}
              >
                <div style={{ width: "14%" }}>
                  {result?.mainTotal?.DiscountAmt !== 0 && (
                    <div className="w-100 d-flex align-items-center tb_fs_pcls">
                      <div
                        style={{ width: "50%" }}
                        className="end_pcls pdr_pcls"
                      >
                        Total Discount
                      </div>
                      <div
                        style={{ width: "50%" }}
                        className="end_pcls pdr_pcls"
                      >
                        {formatAmount(
                          result?.mainTotal?.DiscountAmt /
                          result?.header?.CurrencyExchRate
                        )}
                      </div>
                    </div>
                  )}
                  <div className="w-100 d-flex align-items-center tb_fs_pcls">
                    <div style={{ width: "50%" }} className="end_pcls pdr_pcls">
                      Total Amount
                    </div>
                    <div style={{ width: "50%" }} className="end_pcls pdr_pcls">
                      {formatAmount(
                        result?.mainTotal?.TotalAmount /
                        result?.header?.CurrencyExchRate
                      )}
                    </div>
                  </div>
                  {result?.allTaxes?.map((e, i) => {
                    return (
                      <div
                        className="w-100 d-flex align-items-center tb_fs_pcls"
                        key={i}
                      >
                        <div
                          style={{ width: "50%" }}
                          className="end_pcls pdr_pcls"
                        >
                          {e?.name} @ {e?.per}
                        </div>
                        <div
                          style={{ width: "50%" }}
                          className="end_pcls pdr_pcls"
                        >
                          {formatAmount(e?.amount)}
                        </div>
                      </div>
                    );
                  })}
                  <div className="w-100 d-flex align-items-center tb_fs_pcls">
                    <div style={{ width: "50%" }} className="end_pcls pdr_pcls">
                      {result?.header?.AddLess > 0 ? "Add" : result?.header?.AddLess < 0 ? "Less" : ""}
                    </div>
                    <div style={{ width: "50%" }} className="end_pcls pdr_pcls">
                      {result?.header?.AddLess !== 0 &&
                        formatAmount(result?.header?.AddLess / result?.header?.CurrencyExchRate
                        )}
                    </div>
                  </div>
                  {result?.header?.FreightCharges !== 0 && (
                    <div className="w-100 d-flex align-items-center tb_fs_pcls">
                      <div
                        style={{ width: "50%" }}
                        className="end_pcls pdr_pcls"
                      >
                        {result?.header?.ModeOfDel}
                      </div>
                      <div
                        style={{ width: "50%" }}
                        className="end_pcls pdr_pcls"
                      >
                        {result?.header?.FreightCharges !== 0 &&
                          formatAmount(result?.header?.FreightCharges / result?.header?.CurrencyExchRate
                          )}
                      </div>
                    </div>
                  )}
                  <div className="w-100 d-flex align-items-center tb_fs_pcls fw-bold">
                    <div style={{ width: "50%" }} className="end_pcls pdr_pcls">
                      Final Amount
                    </div>
                    <div style={{ width: "50%" }} className="end_pcls pdr_pcls">
                      {formatAmount(
                        (result?.mainTotal?.TotalAmount +
                          result?.header?.AddLess +
                          result?.header?.FreightCharges) /
                        result?.header?.CurrencyExchRate +
                        result?.allTaxesTotal
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* footer & summary */}
            <div className="SpBrders">
              <div className="d-flex justify-content-between tb_fs_pcls mt-1">
                {/* Summary */}
                <div className="d-flex flex-column sumdp10">
                  <div className="fw-bold bg_dp10 w-100 centerdp10  ball_dp10">
                    SUMMARY
                  </div>
                  <div className="d-flex w-100 fsgdp10">
                    <div className="w-50 bright_dp10  bl_dp10">
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold">GOLD IN 24KT</div>
                        <div className="w-50 end_dp10 pe-1">
                          {(
                            result?.mainTotal?.PureNetWt - notGoldMetalWtTotal
                          )?.toFixed(3)}{" "}
                          gm
                        </div>
                      </div>
                      {/* {processedMetalsWt?.map((e, i) => {
                        return (
                          <div
                            className="d-flex justify-content-between px-1"
                            key={i}
                          >
                            <div className="w-50 fw-bold">{e?.ShapeName}</div>
                            <div className="w-50 end_dp10 pe-1">
                              {fixedValues(e?.MergedWt, 3)} gm
                            </div>
                          </div>
                        );
                      })}
                      {MetShpWise?.map((e, i) => {
                        return (
                          <div
                            className="d-flex justify-content-between px-1"
                            key={i}
                          >
                            <div className="w-50 fw-bold">{e?.ShapeName}</div>
                            <div className="w-50 end_dp10 pe-1">
                              {e?.metalfinewt?.toFixed(3)} gm
                            </div>
                          </div>
                        );
                      })} */}
                      {Object.values(
                        [...(processedMetalsWt || []), ...(MetShpWise || [])].reduce((acc, item) => {
                          const key = item?.ShapeName || "UNKNOWN";

                          const weight =
                            (item?.MergedWt ?? item?.metalfinewt ?? 0);

                          if (!acc[key]) {
                            acc[key] = {
                              ShapeName: key,
                              wt: weight,
                            };
                          } else {
                            acc[key].wt += weight;
                          }

                          return acc;
                        }, {})
                      ).map((e, i) => (
                        <div
                          className="d-flex justify-content-between px-1"
                          key={i}
                        >
                          <div className="w-50 fw-bold">{e.ShapeName}</div>
                          <div className="w-50 end_dp10 pe-1">
                            {fixedValues(e.wt, 3)} gm
                          </div>
                        </div>
                      ))}
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold tb_fs_pcls">GROSS WT</div>
                        <div className="w-50 end_dp10 pe-1 tb_fs_pcls">
                          {result?.mainTotal?.grosswt?.toFixed(3)} gm
                        </div>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold tb_fs_pcls">NET WT</div>
                        <div className="w-50 end_dp10 pe-1 tb_fs_pcls">
                          {(
                            result?.mainTotal?.NetWt + result?.mainTotal?.LossWt
                          )?.toFixed(3)}{" "}
                          gm
                        </div>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold tb_fs_pcls">LOSSS WT</div>
                        <div className="w-50 end_dp10 pe-1 tb_fs_pcls">
                          {result?.mainTotal?.LossWt?.toFixed(3)} gm
                        </div>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold">DIAMOND WT</div>
                        <div className="w-50 end_dp10 pe-1">
                           {NumberWithCommas(result?.mainTotal?.diamonds?.Pcs -result?.mainTotal?.solitaire?.Pcs, 0)} / {NumberWithCommas(result?.mainTotal?.diamonds?.Wt - result?.mainTotal?.solitaire?.Wt, 3)} cts
                                            
                        </div>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold">STONE WT</div>
                        <div className="w-50 end_dp10 pe-1">
                          {result?.mainTotal?.colorstone?.Pcs - result?.mainTotal?.gemstone?.Pcs} /{" "}
                          {(result?.mainTotal?.colorstone?.Wt - result?.mainTotal?.gemstone?.Wt)?.toFixed(3)} cts
                        </div>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold">SOLITAIRE WT</div>
                        <div className="w-50 end_dp10 pe-1">
                          {result?.mainTotal?.solitaire?.Pcs  } /{" "}
                          {result?.mainTotal?.solitaire?.Wt?.toFixed(3)} cts
                        </div>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold">GEMSTONE WT</div>
                        <div className="w-50 end_dp10 pe-1">
                          {result?.mainTotal?.gemstone?.Pcs} /{" "}
                          {result?.mainTotal?.gemstone?.Wt?.toFixed(3)} cts
                        </div>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold">MISC WT</div>
                        <div className="w-50 end_dp10 pe-1">
                          {result?.mainTotal?.misc?.Pcs} /{" "}
                          {result?.mainTotal?.misc?.Wt?.toFixed(3)} gm
                        </div>
                      </div>
                    </div>
                    <div className="w-50 bright_dp10 tb_fs_pcls">
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold">GOLD</div>
                        <div className="w-50 end_dp10">
                          {/* {formatAmount(
                            totalMetalSummaryAmount - result?.mainTotal?.LossAmt
                          )} */}
                          {/* {formatAmount(
                            (result?.mainTotal?.metal?.Amount -
                              notGoldMetalTotal) /
                            result?.header?.CurrencyExchRate
                          )}   */}
                          {
                            formatAmount(goldTotalAmount)
                          }
                        </div>
                      </div>
                      {/* {processedMetalsAmount?.map((e, i) => {
                        return (
                          <div
                            className="d-flex justify-content-between px-1"
                            key={i}
                          >
                            <div className="w-50 fw-bold">{e?.ShapeName}</div>
                            <div className="w-50 end_dp10">
                              {NumberWithCommas(e?.totalAmount, 2)}
                            </div>
                          </div>
                        );
                      })}
                      {MetShpWise?.map((e, i) => {
                        return (
                          <div
                            className="d-flex justify-content-between px-1"
                            key={i}
                          >
                            <div className="w-50 fw-bold">{e?.ShapeName}</div>
                            <div className="w-50 end_dp10">
                              {formatAmount(e?.Amount)}
                            </div>
                          </div>
                        );
                      })} */}
                      {Object.values(
                        [...(processedMetalsAmount || []), ...(MetShpWise || [])].reduce((acc, item) => {
                          const key = item?.ShapeName || "UNKNOWN";

                          const amount =
                            (item?.totalAmount ?? item?.Amount ?? 0);

                          if (!acc[key]) {
                            acc[key] = {
                              ShapeName: key,
                              amount: amount,
                            };
                          } else {
                            acc[key].amount += amount;
                          }

                          return acc;
                        }, {})
                      ).map((e, i) => (
                        <div
                          className="d-flex justify-content-between px-1"
                          key={i}
                        >
                          <div className="w-50 fw-bold">{e.ShapeName}</div>
                          <div className="w-50 end_dp10">
                            {NumberWithCommas(e.amount, 2)}
                          </div>
                        </div>
                      ))}
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold">DIAMOND</div>
                        <div className="w-50 end_dp10">
                          {/* {formatAmount(
                                  result?.mainTotal?.diamonds?.Amount
                                )} */}
                          {formatAmount(
                            result?.mainTotal?.diamonds?.Amount - result?.mainTotal?.solitaire?.Amount /
                            result?.header?.CurrencyExchRate
                          )}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold">SOLITAIRE</div>
                        <div className="w-50 end_dp10">
                          {/* {formatAmount(
                                  result?.mainTotal?.diamonds?.Amount
                                )} */}
                          {formatAmount(
                            result?.mainTotal?.solitaire?.Amount /
                            result?.header?.CurrencyExchRate
                          )}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold">GEMSTONE</div>
                        <div className="w-50 end_dp10">
                          {/* {formatAmount(
                                  result?.mainTotal?.diamonds?.Amount
                                )} */}
                          {formatAmount(
                            result?.mainTotal?.gemstone?.Amount /
                            result?.header?.CurrencyExchRate
                          )}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold">CST</div>
                        <div className="w-50 end_dp10">
                          {formatAmount(
                            result?.mainTotal?.colorstone?.Amount - result?.mainTotal?.gemstone?.Amount/
                            result?.header?.CurrencyExchRate
                          )}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold">MISC</div>
                        <div className="w-50 end_dp10">
                          {formatAmount(
                            result?.mainTotal?.misc?.IsHSCODE_0_amount /
                            result?.header?.CurrencyExchRate
                          )}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold">MAKING </div>
                        <div className="w-50 end_dp10">
                          {formatAmount(
                            (totalMakingAmount +
                              result?.mainTotal?.diamonds?.SettingAmount +
                              result?.mainTotal?.colorstone?.SettingAmount) /
                            result?.header?.CurrencyExchRate
                          )}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold">OTHER </div>
                        <div className="w-50 end_dp10">
                          {formatAmount(
                            result?.mainTotal?.OtherCharges || 0 +
                            result?.mainTotal?.TotalDiamondHandling || 0 +
                            result?.mainTotal?.misc?.IsHSCODE_1_amount || 0 +
                            result?.mainTotal?.misc?.IsHSCODE_3_amount || 0, 2
                          )}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between px-1">
                        <div className="w-50 fw-bold">
                          {result?.header?.AddLess >= 0 ? "ADD" : "LESS"}
                        </div>
                        <div className="w-50 end_dp10">
                          {formatAmount(
                            result?.header?.AddLess /
                            result?.header?.CurrencyExchRate
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg_dp10 h_bd10 ball_dp10 d-flex fsgdp10 tb_fs_pcls ">
                    <div className="w-50 h-100"></div>
                    <div className="w-50 h-100 d-flex align-items-center bl_dp10">
                      <div className="fw-bold w-50 px-1">TOTAL</div>
                      <div className="w-50 end_dp10 px-1">
                        {formatAmount(
                          (result?.mainTotal?.TotalAmount +
                            result?.header?.AddLess +
                            result?.header?.FreightCharges) /
                          result?.header?.CurrencyExchRate +
                          result?.allTaxesTotal
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diamond Detail */}
                <div className="dia_sum_dp10 d-flex flex-column fsgdp10">
                  <div className="centerdp10 bg_dp10 fw-bold ball_dp10 tb_fs_pcls">
                    Diamond Detail
                  </div>
                  <div
                    className="d-flex flex-column HeitFrDMDetls bright_dp10 bl_dp10"
                  >
                    {diamondArr?.map((e, i) => {
                      return (
                        <div
                          className="d-flex justify-content-between px-1 fsgdp10 tb_fs_pcls"
                          key={i}
                        >
                          {(e?.Pcs !== 0 && e?.Wt !== 0) && (
                            <div className="fw-bold w-50 tb_fs_pcls">
                              {e?.ShapeName} {e?.QualityName} {e?.Colorname}
                            </div>
                          )}
                          {(e?.Pcs !== 0 && e?.Wt !== 0) && (
                            <div className="w-50 end_dp10 tb_fs_pcls">
                              {e?.Pcs} / {e?.Wt?.toFixed(3)} cts
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div
                    className="d-flex justify-content-between px-1 bg_dp10 h_bd10 bt_dp10 bb_dp10"
                    style={{
                      borderRight: "1px solid #BDBDBD",
                      borderLeft: "1px solid #BDBDBD",
                    }}
                  >
                    <div className="fw-bold w-50 h14_dp10"></div>
                    <div className="w-50"></div>
                  </div>
                </div>

                {/* Other Details */}
                <div className="oth_sum_dp10 fsgdp10">
                  <div className="h_bd10 centerdp10 bg_dp10 fw-bold ball_dp10 tb_fs_pcls">
                    OTHER DETAILS
                  </div>
                  <div className="d-flex flex-column justify-content-between w-100 px-1 ball_dp10 border-top-0 p-1">
                    <div className="d-flex">
                      <div className="w-50 fw-bold start_dp10 fsgdp10 tb_fs_pcls">
                        RATE IN 24KT
                      </div>
                      <div className="w-50 end_dp10 fsgdp10 tb_fs_pcls">
                        {NumberWithCommas(result?.header?.MetalRate24K, 2)}
                      </div>
                    </div>
                    <div>
                      {result?.header?.BrokerageDetails?.map((e, i) => {
                        return (
                          <div className="d-flex fsgdp10" key={i}>
                            <div className="w-50 fw-bold start_dp10">
                              {e?.label}
                            </div>
                            <div className="w-50 end_dp10">{e?.value}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Remark */}
                {result?.header?.PrintRemark === "" ? (
                  <div style={{ width: "15%" }}></div>
                ) : (
                  <div className="remark_sum_dp10 fsgdp10">
                    <div className="h_bd10 centerdp10 bg_dp10 fw-bold ball_dp10">
                      Remark
                    </div>
                    <div
                      className="p-1 bright_pcls bbottom_pcls bleft_pcls text-break"
                      dangerouslySetInnerHTML={{
                        __html: result?.header?.PrintRemark,
                      }}
                    ></div>
                  </div>
                )}

                {/* Signature */}
                <div className="check_dp10 HeitFrSigntr ball_dp10 d-flex justify-content-center align-items-end pb-1 fsgdp10 tb_fs_pcls">
                  <i>Created By</i>
                </div>
                <div className="check_dp10 HeitFrSigntr ball_dp10 d-flex justify-content-center align-items-end pb-1 fsgdp10 tb_fs_pcls">
                  <i>Checked By</i>
                </div>
              </div>

              {/* Terms Included */}
              {result?.header?.SalesRepPolicyTermsDescription !== "" ? (
                <div className="WdthTrmInclded spbrWord">
                  <p className="spbrWord"><span className="fw-bold spbrWord">TERMS INCLUDED:</span>&nbsp;
                    {
                      <span className="spbrWord"
                        dangerouslySetInnerHTML={{
                          __html: result?.header?.SalesRepPolicyTermsDescription,
                        }}
                      />
                    }
                  </p>
                </div>
              ) : ("")}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
          {" "}
          {msg}{" "}
        </p>
      )}
    </>
  );
};

export default PackingList3;
