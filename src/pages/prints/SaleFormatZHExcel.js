// http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=U0syMTA0MjAyNA==&evn=c2FsZQ==&pnm=cGFja2luZyBsaXN0&up=aHR0cDovL3plbi9qby9hcGktbGliL0FwcC9TYWxlQmlsbF9Kc29u&ctv=NzE=&ifid=PackingList3&pid=undefined&etp=ZXhjZWw=

import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import {
  apiCall,
  checkMsg,
  formatAmount,
  handleImageError,
  isObjectEmpty,
} from "../../GlobalFunctions";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import Loader from "../../components/Loader";
import "../../assets/css/prints/packingliste.css";
import Button from "../../GlobalFunctions/Button";
import { OrganizeInvoicePrintData } from "../../GlobalFunctions/OrganizeInvoicePrintData";
import { cloneDeep } from "lodash";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";
import ReactHTMLTableToExcel from "react-html-table-to-excel";

const SaleFormatZHExcel = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  const [priceFlag, setPriceFlag] = useState(true);

  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const [imgFlag, setImgFlag] = useState(true);
  const [isImageWorking, setIsImageWorking] = useState(true);

  const [diaGroupFlag, setDiaGroupFlag] = useState(false);

  const [diamondArr, setDiamondArr] = useState([]);
  const [MetShpWise, setMetShpWise] = useState([]);
  const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
  const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);
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
  }, [diaGroupFlag]);

  const loadData = (data) => {
    let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
    data.BillPrint_Json[0].address = address;

    const datas = OrganizeInvoicePrintData(
      data?.BillPrint_Json[0],
      data?.BillPrint_Json1,
      data?.BillPrint_Json2
    );

    datas.header.PrintRemark = datas.header.PrintRemark?.replace(
      /<br\s*\/?>/gi,
      ""
    );

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
            ...b?.metal,
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
          finalArr[find_record].other_details_array = [
            ...finalArr[find_record]?.other_details_array,
            ...b?.other_details_array,
          ]?.flat();

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
          finalArr[find_record].totals.finding.FineWt +=
            b?.totals?.finding?.FineWt;

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
          // finalArr[find_record].totals.metal.FineWt += b?.totals?.metal?.FineWt;

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
    met_shp_arr?.forEach((e, i) => {
      tot_met += e?.Amount;
      tot_met_wt += e?.metalfinewt;
    });
    setNotGoldMetalTotal(tot_met);
    setNotGoldMetalWtTotal(tot_met_wt);

    if (diaGroupFlag) {
      datas?.resultArray?.forEach((e) => {
        let dia2 = [];
        let dia1_ = [];
        let dia2_ = [];
        e?.diamonds?.forEach((el) => {
          if (el?.GroupName === "") {
            dia1_.push(el);
          } else {
            dia2_.push(el);
          }
        });
        let dia1_g = [];
        dia1_?.forEach((ell) => {
          let bll = cloneDeep(ell);
          let findrec = dia1_g.findIndex(
            (a) =>
              a?.ShapeName === bll?.ShapeName && a?.SizeName === bll?.SizeName
          );
          if (findrec === -1) {
            dia1_g.push(bll);
          } else {
            dia1_g[findrec].Wt += bll?.Wt;
            dia1_g[findrec].Pcs += bll?.Pcs;
            dia1_g[findrec].Amount += bll?.Amount;
          }
        });
        let dia2_g = [];
        dia2_?.forEach((ell) => {
          let bll = cloneDeep(ell);
          let findrec = dia2_g.findIndex(
            (a) =>
              a?.ShapeName === bll?.ShapeName && a?.GroupName === bll?.GroupName
          );
          if (findrec === -1) {
            dia2_g.push(bll);
          } else {
            dia2_g[findrec].Wt += bll?.Wt;
            dia2_g[findrec].Pcs += bll?.Pcs;
            dia2_g[findrec].Amount += bll?.Amount;        
          }
        });
        let dia2_g_ = [];
        dia2_g?.forEach((e) => {
          e.SizeName = e?.GroupName;
          dia2_g_.push(e);
        });
        dia2 = [...dia1_g, ...dia2_g_];

        e.diamonds = dia2;
      });
    }
  };

  if (result) {
    setTimeout(() => {
      const button = document.getElementById('test-table-xls-button');
      button.click();
    }, 500);
  }
  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <div>
          <ReactHTMLTableToExcel
            id="test-table-xls-button"
            className="download-table-xls-button btn btn-success text-black bg-success px-2 py-1 fs-5 d-none"
            table="table-to-xls"
            filename={`Sale Format ZH`}
            sheet={`Sale_Format_ZH_${result?.header?.InvoiceNo}`}
            buttonText="Download as XLS"
          />
          <table id="table-to-xls" className="d-none">
            <tr>
              <td>
                <b>Item Name</b>
              </td>
              <td>
                <b>SKU</b>
              </td>
              <td>
                <b>Sales Description
                </b>
              </td>
              <td>
                <b>Brand</b>
              </td>
              <td>
                <b>CF.Category
                </b>
              </td>
              <td>
                <b>CF.Price Key
                </b>
              </td>
              <td>
                <b>CF.Collection
                </b>
              </td>
              <td>
                <b>Selling Rate
                </b>
              </td>
              <td>
                <b>CF.Tag Price
                </b>
              </td>
            </tr>

            {result?.resultArray?.map((data, index) => {
              return (
                <tr key={index}>
                  {/* <td>{`${data?.designno}-${data?.Size}-${data?.MetalPurity}-${data?.MetalColor}`}</td> */}
                  <td>
                    {[data?.designno, data?.Size, data?.MetalPurity, data?.MetalColor]
                      .filter(Boolean)
                      .join("-")}
                  </td>
                  <td> </td>
                  <td>{data?.TitleLine}</td>
                  <td>{data?.BrandName}</td>
                  <td>
                    {data?.Categoryname}
                  </td>
                  <td> </td>
                  <td>{data?.Collectionname}</td>
                  <td>{Math.floor(data?.TotalAmount || 0)}</td>
                  <td>{Math.floor((Math.floor(data?.TotalAmount || 0) * 3.15))}</td>
                </tr>

              );
            })}
          </table>
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

export default SaleFormatZHExcel;
