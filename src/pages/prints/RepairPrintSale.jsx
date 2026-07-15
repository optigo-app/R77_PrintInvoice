import React, { useEffect, useState } from "react";
import style from "../../assets/css/prints/manufacturemgt.module.css";
import {
    HeaderComponent,
    NumberWithCommas,
    handleImageError,
    handlePrint,
    apiCall,
    checkMsg,
    isObjectEmpty,
    taxGenrator,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";

import { result } from "lodash";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";

const RepairPrintSale = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
    const [headerComp, setHeaderComp] = useState(null);
    const [headerData, setHeaderData] = useState({});
    const [loader, setLoader] = useState(true);
    const [msg, setMsg] = useState("");
    const [datas, setData] = useState([]);
    const [result, setResult] = useState(null);
    const [total, SetTotal] = useState({
        totalAmount: 0,
        grandTotal: 0,
    });
    const [tax, setTax] = useState([]);

    const loadData = (data) => {
        setHeaderData(data?.BillPrint_Json[0]);
        let headerDatas = data?.BillPrint_Json[0];
        let head = HeaderComponent(2, headerDatas);

 
        setHeaderComp(head);

        let resultArr = [];
        let totals = { ...total };
        data?.BillPrint_Json1.forEach((e, i) => {
            totals.totalAmount += e?.TotalAmount;
            let obj = { ...e };
            let metalColorCode = "";
            let diamonds = [];

            let diamondWt = 0;
            let colorWt = 0;
            let miscWt = 0;

            let diamondRepairedWt = 0;
            let colorRepairedWt = 0;
            let miscRepairedWt = 0;

            let metalWt = 0;

            let miscRepairWt = 0;
            let receivedJewelleryGrossWt = 0;

            let repairedJewelleryGrossWt = 0;
            let repairedJewelleryNetWt = 0;

            let materialIsAdded = 0;

            let metalAdded = 0;
            let diamondAdded = 0;
            let colorStoneAdded = 0;
            let miscAdded = 0;
            let findingAdded = 0;

            let grossWtAdded = 0;
            let netWtdded = 0;
            let materialAdded = [];

            let netDetach = 0;
            let diamondDetach = 0;
            let colorStoneDetach = 0;
            let metalDetach = 0;
            let FindingDetach = 0;

            data?.BillPrint_Json2.forEach((ele, ind) => {
                if (ele?.StockBarcode === e?.SrJobno) {
                    if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
                        metalWt += ele?.Wt;
                        if (ele?.IsPrimaryMetal === 1) {
                            metalColorCode = ele?.MetalColorCode;
                        } else if (metalColorCode === "") {
                            metalColorCode = ele?.MetalColorCode;
                        }
                        // if (ele?.IsRepireEdit === 1) {
                        //     metalAdded += ele?.Wt;
                        // }

                        if (ele?.DetachWeight !== null) {
                            metalDetach += ele?.DetachWeight;
                        }
                        repairedJewelleryNetWt += ele?.Wt + ele?.WtAdd - ele?.DetachWeight;
                        metalAdded += ele?.WtAdd;
                    } else if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
                        diamondWt += ele?.Wt;
                        diamonds.push(ele);
                        if (ele?.IsRepireEdit === 1) {
                            diamondAdded += ele?.Wt;
                            materialAdded.push(ele);
                        }
                        if (ele?.DetachWeight !== null) {
                            diamondDetach += ele?.DetachWeight;
                            diamondRepairedWt += ele?.Wt - ele?.DetachWeight;
                        } else {
                            diamondRepairedWt += ele?.Wt;
                        }
                    } else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
                        colorWt += ele?.Wt;
                        if (ele?.IsRepireEdit === 1) {
                            colorStoneAdded += ele?.Wt;
                            materialAdded.push(ele);
                        }
                        if (ele?.DetachWeight !== null) {
                            colorStoneDetach += ele?.DetachWeight;
                            colorRepairedWt += ele?.Wt - ele?.DetachWeight;
                        } else {
                            colorRepairedWt += ele?.Wt;
                        }
                    } else if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
                        if (ele?.IsHSCOE === 0) {
                            miscWt += ele?.Wt;
                            if (ele?.IsRepireEdit === 0) {
                                miscRepairWt += ele?.Wt;
                            }
                            if (ele?.IsRepireEdit === 1) {
                                materialAdded.push(ele);
                                miscAdded += ele?.Wt;
                            }
                            if (ele?.IsReapirDelete !== 1) {
                                miscRepairedWt += ele?.Wt;
                            }
                        }
                    } else if (ele?.MasterManagement_DiamondStoneTypeid === 5) {
                        if (ele?.IsRepireEdit === 1) {
                            // materialAdded.push(ele);
                            findingAdded += ele?.Wt;
                            repairedJewelleryNetWt += ele?.Wt;
                        }
                        if (ele?.DetachWeight !== null) {
                            FindingDetach += ele?.DetachWeight;
                            repairedJewelleryNetWt -= ele?.DetachWeight;
                        }
                    }
                }
            });

            repairedJewelleryGrossWt =
                diamondRepairedWt / 5 +
                colorRepairedWt / 5 +
                miscRepairedWt +
                repairedJewelleryNetWt;
            grossWtAdded =
                metalAdded +
                (diamondAdded + colorStoneAdded) / 5 +
                miscAdded +
                findingAdded;
            netWtdded = metalAdded + findingAdded;
            let diamondColorWt = (diamondWt + colorWt) / 5;
            netDetach = metalDetach + FindingDetach;
            obj.metalColorCode = metalColorCode;
            obj.diamonds = diamonds;
            obj.diamondWt = diamondWt;
            obj.colorWt = colorWt;
            obj.miscWt = miscWt;
            obj.diamondColorWt = diamondColorWt;
            obj.miscRepairWt = miscRepairWt;
            obj.grossWtAdded = grossWtAdded;
            obj.netWtdded = netWtdded;
            obj.diamondAdded = diamondAdded;
            obj.colorStoneAdded = colorStoneAdded;
            obj.miscAdded = miscAdded;
            obj.materialAdded = materialAdded;
            obj.netDetach = netDetach;
            obj.diamondDetach = diamondDetach;
            obj.colorStoneDetach = colorStoneDetach;

            obj.diamondRepairedWt = diamondRepairedWt;
            obj.colorRepairedWt = colorRepairedWt;
            obj.miscRepairedWt = miscRepairedWt;

            obj.receivedJewelleryGrossWt = miscRepairWt + diamondColorWt + metalWt;
            obj.repairedJewelleryGrossWt = repairedJewelleryGrossWt;
            obj.repairedJewelleryNetWt = repairedJewelleryNetWt;
            resultArr.push(obj);
        });
        SetTotal(totals);
        let taxValue = taxGenrator(data?.BillPrint_Json[0], totals?.totalAmount);
        totals.grandTotal =
            taxValue.reduce((a, b) => {
                return a + +b.amount;
            }, 0) +
            totals?.totalAmount +
            data?.BillPrint_Json[0]?.AddLess;
        setData(resultArr);
        setTax(taxValue);

        const datas = OrganizeDataPrint(
            data?.BillPrint_Json[0],
            data?.BillPrint_Json1,
            data?.BillPrint_Json2
        );
        console.log(datas);
        setResult(datas);

    };

    //   useEffect(() => {
    //     const sendData = async () => {
    //           try {
    //             const data = await apiCall(token, invoiceNo, printName, urls, evn, ApiVer);
    //             if (data?.Status === "200") {
    //               let isEmpty = isObjectEmpty(data?.Data);
    //               if (!isEmpty) {
    //                 evnComponent(data?.Data);
    //                 setLoader(false);
    //               } else {
    //                 setLoader(false);
    //                 setMsg("Data Not Found");
    //               }
    //             } else {
    //               setLoader(false);
    //               // setMsg(data?.Message);
    //               const err = checkMsg(data?.Message);
    //                         console.log(data?.Message);
    //                         setMsg(err);
    //             }
    //           } catch (error) {
    //             console.error(error);
    //           }
    //         };
    //         sendData();
    //     loadData(data);
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    //   }, []);

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

    const groupedData = result?.json2?.reduce((acc, item) => {
        if (!acc[item.StockBarcode]) {
            acc[item.StockBarcode] = [];
        }

        acc[item.StockBarcode].push(item);
        return acc;
    }, {});



 

    const totalsAmountBeforeDiscoount = datas.reduce((sum, e) => {
        return (
          sum +
          (e?.DiamondAmount || 0) +
          (e?.MetalAmount || 0) +
          (e?.TotalDiamondHandling || 0) +
          (e?.MakingAmount || 0)
        );
      }, 0);

      const totalDiscount = datas.reduce((sum, e) => {
        return sum + (e?.DiscountAmt || 0);
      }, 0);

      const totalTax = tax.reduce((sum, ele) => {
        return sum + Number(ele?.amount || 0);
      }, 0);

      const declarationHTML = headerData?.Declaration?.replace(
        /<span/g,
        '<span style="font-size:12px;color:#000;"'
      );



    return (
        <>
            {loader ? (
                <Loader />
            ) : (
                <>
                    {msg === "" ? (
                        <>
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
                                {headerComp}
                                {/* customer address */}
                                <div className="p-2 border-top d-flex">
                                    <div className="col-6">
                                        <p>To,</p>
                                        <p className="fs-6 fw-bold">{headerData?.customerfirmname}</p>
                                        <p>{headerData?.customerstreet}</p>
                                        <p>{headerData?.customerregion}</p>
                                        <p>
                                            {headerData?.customercity} {headerData?.customerpincode}
                                        </p>
                                        <p>Tel: {headerData?.customermobileno}</p>
                                        <p>{headerData?.customeremail1}</p>
                                    </div>
                                    <div className="col-6 d-flex justify-content-end">
                                        <div
                                            className={`${style?.width_301} d-flex flex-column justify-content-center`}
                                        >
                                            <p>
                                                Invoice#: <span className="fw-bold">{headerData?.InvoiceNo}</span>{" "}
                                                Dated <span className="fw-bold">{headerData?.EntryDate}</span>
                                            </p>
                                            <p>
                                                HSN: <span className="fw-bold">{headerData?.HSN_No}</span>
                                            </p>
                                            <p>
                                                PAN#: <span className="fw-bold">{headerData?.CustPanno}</span>
                                            </p>
                                            <p>
                                                GSTIN:{" "}
                                                <span className="fw-bold">{headerData?.Cust_VAT_GST_No}</span>|
                                                {headerData?.Cust_CST_STATE}{" "}
                                                <span className="fw-bold">{headerData?.Cust_CST_STATE_No}</span>
                                            </p>
                                            <p>
                                                Due Date: <span className="fw-bold">{headerData?.DueDate}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    {/* Table Header */}
                                    <div className="d-flex border lightGrey">
                                        <div className="col-1 border-end">
                                            <p className="fw-bold p-1 text-center">SR NO</p>
                                        </div>
                                        <div className="col-2 border-end">
                                            <p className="fw-bold p-1 text-center">ITEM CODE</p>
                                        </div>
                                        <div className="col-4 border-end">
                                            <p className="fw-bold p-1 text-center">DESCRIPTION</p>
                                        </div>
                                        <div className="col-2 border-end">
                                            <p className="fw-bold p-1 text-center">AMOUNT</p>
                                        </div>
                                        <div className="col-1 border-end">
                                            <p className="fw-bold p-1 text-center">DISCOUNT</p>
                                        </div>

                                        <div className="col-2">
                                            <p className="fw-bold p-1 text-center">
                                                AMOUNT({headerData?.CurrencyCode})
                                            </p>
                                        </div>
                                    </div>
                                    {/* Table Data */}
                                    {datas.map((e, i) => {

                                        console.log("TCL: e", e)
                                        return (
                                            <div
                                                className="d-flex border-start border-bottom border-end"
                                                key={i}
                                            >
                                                <div className="col-1 border-end">
                                                    <p className="fw-bold p-1 text-center">{i + 1}</p>
                                                </div>
                                                <div className="col-2 border-end">
                                                    <p className="p-1"> Job: {e?.SrJobno} </p>
                                                    <p className="p-1">
                                                        Design: <span className="fw-bold">{e?.designno}</span>
                                                    </p>
                                                    <img
                                                        src={e?.DesignImage}
                                                        alt=""
                                                        className={`${style?.img_manufacture} ${style?.altreceive_img} p-1`}
                                                        onError={handleImageError}

                                                    />
                                                </div>
                                                <div className="col-4 border-end">
                                                    <p className="fw-bold p-1 text_secondary no_break">
                                                        RECEIVED JEWELLERY
                                                    </p>
                                                    <p className="px-1 py-2 no_break">
                                                        {e?.MetalTypePurity} {e?.metalColorCode}
                                                        {` `}
                                                        {e?.receivedJewelleryGrossWt !== 0 &&
                                                            ` | ${NumberWithCommas(
                                                                e?.receivedJewelleryGrossWt,
                                                                3
                                                            )} gms GW`}
                                                        {e?.NetWt !== 0 &&
                                                            ` | ${NumberWithCommas(e?.NetWt, 3)} gms NW`}
                                                        {/* {e?.diamondWt !== 0 &&
                                                            ` |  DIA: ${NumberWithCommas(e?.diamondWt, 3)} Cts`}
                                                        {e?.colorWt !== 0 &&
                                                            ` |  CS: ${NumberWithCommas(e?.colorWt, 3)} Cts`}
                                                        {e?.miscRepairWt !== 0 &&
                                                            ` |  MISC: ${NumberWithCommas(e?.miscRepairWt, 3)} gms `} */}
                                                    </p>

                                                    <p className="fw-bold p-1 text_secondary no_break">
                                                        REPAIRED JEWELLERY
                                                    </p>
                                                    <p className="px-1 py-2 no_break">
                                                        {e?.MetalTypePurity} {e?.metalColorCode}
                                                        {e?.repairedJewelleryGrossWt !== 0 &&
                                                            `| ${NumberWithCommas(
                                                                e?.repairedJewelleryGrossWt,
                                                                3
                                                            )} gms GW`}
                                                        {` `}
                                                        {e?.repairedJewelleryNetWt !== 0 &&
                                                            ` | ${NumberWithCommas(
                                                                e?.repairedJewelleryNetWt,
                                                                3
                                                            )} gms NW`}
                                                        {e?.diamondRepairedWt !== 0 &&
                                                            ` |  DIA: ${NumberWithCommas(e?.diamondRepairedWt, 3)} Cts`}
                                                        {e?.colorRepairedWt !== 0 &&
                                                            ` |  CS: ${NumberWithCommas(e?.colorRepairedWt, 3)} Cts`}
                                                        {e?.miscRepairedWt !== 0 &&
                                                            ` | MISC: ${NumberWithCommas(e?.miscRepairedWt, 3)} gms `}
                                                    </p>
                                                    <p className="fw-bold p-1 text_secondary no_break">
                                                        ADDED MATERIAL DETAIL
                                                    </p>
                                                    <p className="px-1 py-2 no_break">
                                                        {e?.MetalTypePurity} {e?.metalColorCode}
                                                        {e?.repairedJewelleryGrossWt !== 0 &&
                                                            `| ${NumberWithCommas(
                                                                e?.repairedJewelleryGrossWt,
                                                                3
                                                            )} gms GW`}
                                                        {` `}
                                                        {e?.repairedJewelleryNetWt !== 0 &&
                                                            ` | ${NumberWithCommas(
                                                                e?.repairedJewelleryNetWt,
                                                                3
                                                            )} gms NW`}
                                                        {e?.diamondRepairedWt !== 0 &&
                                                            ` |  DIA: ${NumberWithCommas(e?.diamondRepairedWt, 3)} Cts`}
                                                        {e?.colorRepairedWt !== 0 &&
                                                            ` |  CS: ${NumberWithCommas(e?.colorRepairedWt, 3)} Cts`}
                                                        {e?.miscRepairedWt !== 0 &&
                                                            ` | MISC: ${NumberWithCommas(e?.miscRepairedWt, 3)} gms `}
                                                    </p>

                                                    {(groupedData[e?.SrJobno] || [])
                                                        .filter(
                                                            (d) =>
                                                                d.MasterManagement_DiamondStoneTypeName !== "METAL" &&
                                                                d.MasterManagement_DiamondStoneTypeName !== "FINDING"
                                                        )
                                                        .map((d, i) => {

                                                            const typeMap = {
                                                                DIAMOND: "Diamond",
                                                                "COLOR STONE": "Colorstone",
                                                                MISC: "Misc",
                                                            };

                                                            const type = typeMap[d.MasterManagement_DiamondStoneTypeName] || "";

                                                            const shape = d.Shape_Code || d.ShapeName;

                                                            return (
                                                                <p key={i} className="px-1 py-1 no_break">
                                                                    {type}: {d.Pcs} Pcs | {NumberWithCommas(d.Wt, 3)} Cts |{" "}
                                                                    {shape} {d.Colorname} {d.QualityName}
                                                                </p>
                                                            );
                                                        })}
                                                    {e?.materialAdded.map((ele, ind) => {
                                                        return (
                                                            <p key={ind} className="p-1 no_break">
                                                                {ele?.MasterManagement_DiamondStoneTypeName}:
                                                                {ele?.Pcs !== 0 && `${NumberWithCommas(ele?.Pcs, 0)} PCs`}
                                                                {ele?.Wt !== 0 && ` | ${NumberWithCommas(ele?.Wt, 3)}`}
                                                                {ele?.MasterManagement_DiamondStoneTypeid === 1 ||
                                                                    ele?.MasterManagement_DiamondStoneTypeid === 2
                                                                    ? " Cts "
                                                                    : " gms "}
                                                                | {ele?.ShapeName} {ele?.QualityName} {ele?.Colorname}
                                                            </p>
                                                        );
                                                    })}


                                                </div>
                                                <div className="col-2 border-end">

                                                    {e?.MakingAmount !== 0 && (
                                                        <p className="p-1 text-end">
                                                            {NumberWithCommas(e?.MakingAmount, 2)}
                                                        </p>
                                                    )}

                                                    {e?.TotalDiamondHandling !== 0 && (
                                                        <p className="p-1 text-end">
                                                            {NumberWithCommas(e?.TotalDiamondHandling, 2)}
                                                        </p>
                                                    )}

                                                    {e?.MetalAmount !== 0 && (
                                                        <p className="p-1 text-end">
                                                            {NumberWithCommas(e?.MetalAmount, 2)}
                                                        </p>
                                                    )}

                                                    {e?.DiamondAmount !== 0 && (
                                                        <p className="p-1 text-end">
                                                            {NumberWithCommas(e?.DiamondAmount, 2)}
                                                        </p>
                                                    )}

                                                </div>
                                                <div className="col-1 border-end">
                                                    <p className="p-1 text-end">
                                                         
                                                        {NumberWithCommas(e?.DiscountAmt, 2)}
                                                    </p>
                                                </div>
                                                <div className="col-2">
                                                    <p className="p-1 text-end">
                                                        <span
                                                            dangerouslySetInnerHTML={{
                                                                __html: headerData?.Currencysymbol,
                                                            }}
                                                        ></span>
                                                        {NumberWithCommas(e?.TotalAmount, 2)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {/* Table Total */}
                                    <div className="d-flex border-start border-end border-bottom lightGrey">
                                        <div className="col-1 fw-bold d-flex justify-content-center align-items-center">TOTAL</div>
                                        <div className="col-2 border-end p-1">
                                            <p className="fw-bold">GrossWt : {result?.mainTotal?.grosswt?.toFixed(3)}</p>
                                        </div>
                                        <div className="col-4 border-end p-1">
                                            <p className="fw-bold">NetWt : {result?.mainTotal?.netwtWithLossWt?.toFixed(3)}</p>
                                        </div>
                                         
                                        <div className="col-2 border-end p-1 text-end">
                                            <p className="fw-bold">{NumberWithCommas(totalsAmountBeforeDiscoount,2)}</p>
                                        </div>
                                        <div className="col-1 border-end p-1 text-end">
                                            <p className="fw-bold">{NumberWithCommas(totalDiscount,2)}</p>
                                        </div>
                                        <div className="col-2 p-1">
                                            <p className="fw-bold text-end">
                                                
                                                {NumberWithCommas(totalsAmountBeforeDiscoount-totalDiscount, 2)}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Table Tax */}
                                    <div className="d-flex border-start border-end border-bottom">
                                        <div className="col-10 border-end">
                                            {tax.map((ele, ind) => {
                                                return (
                                                    <p className="text-end p-1" key={ind}>
                                                        {ele?.name} @ {ele?.per}
                                                    </p>
                                                );
                                            })}
                                            <p className="text-end p-1">
                                                         Total
                                                    </p>
                                            {headerData?.AddLess !== 0 && (
                                                <p className="text-end p-1">
                                                    {headerData?.AddLess > 0 ? "Add" : "Less"}
                                                </p>
                                            )}
                                            {headerData?.FreightCharges !== 0 && (
                                                <p className="text-end p-1">
                                                    {headerData?.ModeOfDel }
                                                </p>
                                            )}
                                        </div>
                                        <div className="col-2">
                                            {tax.map((ele, ind) => {
                                                return (
                                                    <p className="text-end p-1 " key={ind}>
                                                        {NumberWithCommas(ele?.amount, 2)}
                                                    </p>
                                                );
                                            })}
                                            <p className="text-end p-1"> {NumberWithCommas(totalsAmountBeforeDiscoount-totalDiscount+totalTax, 2)}</p>
                                            {headerData?.AddLess !== 0 && (
                                                <p className="text-end p-1"> {headerData?.AddLess}</p>
                                            )}
                                              {headerData?.FreightCharges !== 0 && (
                                                <p className="text-end p-1"> {headerData?.FreightCharges}</p>
                                            )}
                                        </div>
                                    </div>
                                    {/* Table Grand Total */}
                                    <div className="d-flex border-start border-end border-bottom lightGrey">
                                        <div className="col-10 border-end">
                                            <p className="text-end p-1 fw-bold">GRAND TOTAL</p>
                                        </div>
                                        <div className="col-2">
                                            <p className="text-end p-1 fw-bold">
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: headerData?.Currencysymbol,
                                                    }}
                                                ></span>
                                                {NumberWithCommas(totalsAmountBeforeDiscoount-totalDiscount+totalTax+headerData?.FreightCharges+headerData?.AddLess, 2)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-1" style={{color:"gray",fontSize:"10px"}}>**THIS IS A COMPUTER GENERATED INVOICE AND KINDLY NOTIFY US IMMEDIATELY IN CASE YOU FIND ANY DISCREPANCY IN THE DETAILS OF TRANSACTIONS</div>
                                    <div className="border p-1">
                                        <b>TERMAS INCLUDED:</b>  <span
                    dangerouslySetInnerHTML={{
                      __html: headerData?.SalesRepPolicyTermsDescription,
                    }}
                    style={{ fontWeight: "400" }}
                  />
                                    </div>
                                     <div className="border-start border-end border-bottom p-2 no_break pb-3 font12" style={{fontSize:"12px"}}>
                                                        <div
                                                          dangerouslySetInnerHTML={{
                                                            __html: declarationHTML,
                                                          }}
                                                          
                                                          className={`${style?.declarationUlJewelleryRetailInvoicePrntc} ${style?.retailinvoicePrint3}`}
                                                        ></div>
                                    </div>
                                    {/* signature */}


                                    <div
                                        className={`d-flex border-start border-bottom border-end ${style?.height_manufacture} no_break`}
                                    >
                                        <div className="col-4 p-2 d-flex justify-content-between flex-column border-end position-relative">
                                            <div className=" d-flex no_break">
                                                                <div className=" ">
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
                                                                 
                                            </div>
                                        </div>
                                        <div className="col-4 p-2 d-flex justify-content-between flex-column border-end position-relative">
                                            <p>Signature :</p>
                                            <p className="fw-bold">{headerData?.customerfirmname}</p>
                                            {/* <p className={`position-absolute ${style?.blankArea} bgGrey border-start border-bottom`}></p> */}
                                        </div>
                                        <div className="col-4 p-2 d-flex justify-content-between flex-column position-relative">
                                            <p>Signature :</p>
                                            <p className="fw-bold">{headerData?.CompanyFullName}</p>
                                            {/* <p className={`position-absolute ${style?.blankArea} bgGrey border-start border-end border-bottom`}></p> */}
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

export default RepairPrintSale;
