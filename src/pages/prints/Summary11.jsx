import React from 'react'
import { useEffect } from 'react';
import { FooterComponent, HeaderComponent, NumberWithCommas, apiCall, checkMsg, fixedValues, handlePrint, isObjectEmpty, numberToWord, taxGenrator } from '../../GlobalFunctions';
import { useState } from 'react';
import Loader from '../../components/Loader';
import style from "../../assets/css/prints/summary11.module.css"
import footer1 from "../../assets/css/footers/footer1.module.css";

const Summary11 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {

    const [loader, setLoader] = useState(true);
    const [msg, setMsg] = useState("");
    const [headerComp, setHeaderComp] = useState(null);
    const [footerComponent, setFooterComponent] = useState(null);
    const [header, setHeader] = useState({});
    const [data, setData] = useState([]);
    const [total, sertTotal] = useState({
        diaWt: 0,
        diaPcs: 0,
        diaAmt: 0,
        grosswt: 0,
        netWt: 0,
        making: 0,
        otherCharges: 0,
        csAmt: 0,
        goldFine: 0,
        goldAmt: 0,
        totalAmount: 0,
        afterTax: 0
    });
    const [tax, setTax] = useState([]);
    const [category, setCategory] = useState([]);
    const [isImageWorking, setIsImageWorking] = useState(true);
    const handleImageErrors = () => {
        setIsImageWorking(false);
    };
    const loadData = (data) => {
        let head = HeaderComponent(data?.BillPrint_Json[0]?.HeaderNo, data?.BillPrint_Json[0]);
        let footerComp = FooterComponent(data?.BillPrint_Json[0]?.HeaderNo, data?.BillPrint_Json[0]);
        setHeader(data?.BillPrint_Json[0]);
        setFooterComponent(footerComp);
        setHeaderComp(head);
        let blankArr = [];
        let totals = { ...total };
        let categories = [];
        data?.BillPrint_Json1.forEach((e, i) => {
            let obj = { ...e };
            let diamonds = [];
            let csAmt = 0;
            let makingSettingAmount = e?.MakingAmount;
            totals.grosswt += e?.grosswt;
            totals.netWt += e?.NetWt;
            // totals.making += e?.MakingAmount;
            // totals.otherCharges += e?.OtherCharges;
            totals.goldFine += e?.convertednetwt;
            totals.goldAmt += e?.MetalAmount;
            totals.totalAmount += e?.TotalAmount;

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

            data?.BillPrint_Json2.forEach((ele, ind) => {
                if (ele?.StockBarcode === e?.SrJobno) {
                    makingSettingAmount += ele?.SettingAmount;
                    if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
                        diamonds.push(ele);
                        totals.diaAmt += ele?.Amount;
                        totals.diaPcs += ele?.Pcs;
                        totals.diaWt += ele?.Wt;
                    }
                    if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
                        csAmt += ele?.Amount;
                    }
                }
            });
            totals.making += makingSettingAmount;
            obj.otherChargesIncluded = e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling;
            totals.otherCharges += obj.otherChargesIncluded;
            obj.diamonds = diamonds;
            obj.csAmt = csAmt;
            obj.makingSettingAmount = makingSettingAmount;
            totals.csAmt += csAmt;
            blankArr.push(obj);
        });
        setCategory(categories);
        let taxValue = taxGenrator(data?.BillPrint_Json[0], totals?.totalAmount);
        let totalAmtTax = taxValue.reduce((acc, current) => {
            return acc + +current?.amount;
        }, 0);
        totals.afterTax = totalAmtTax + totals?.totalAmount + data?.BillPrint_Json[0]?.AddLess;
        setTax(taxValue);
        setData(blankArr);
        sertTotal(totals);
    }

    useEffect(() => {
        const sendData = async () => {
            try {
                const data = await apiCall(token, invoiceNo, printName, urls, evn, ApiVer);
                if (data?.Status === '200') {
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
        }
        sendData();
    }, []);

    return (
        loader ? <Loader /> : msg === "" ? <>
            <div className={`container max_width_container mt-2 pad_60_allPrint`}>
                {/* buttons */}
                <div className='hide-on-print'>
                    <div className={`d-flex justify-content-end align-items-center printBtn_sec mb-4 ${style?.containerSummry11AddressFont}`}>
                        <div className="form-check ps-3">
                            <input type="button" className="btn_white blue" value="Print" onClick={(e) => handlePrint(e)} />
                        </div>
                    </div>
                </div>
                {/* header */}
                {headerComp}
                {/* company details */}
                <div className="mt-3 border-top"></div>
                <div className={`mt-2 border ${style?.containerSummry11AddressFont}`}>
                    <div className="d-flex justify-content-between p-2">
                        <p className="fs-5">INVOICE# :<span className='fw-bolder fs-5'> {header?.InvoiceNo}</span></p>
                        <div>
                            <p className="fs-5 pb-2"> DATE :<span className='fw-bolder fs-5'> {header?.EntryDate}</span> </p>
                            <p className="fs-5">  HSN :<span className='fw-bolder fs-5'> {header?.HSN_No} </span></p>
                        </div>
                    </div>
                </div>
                <div className={`border-start border-end border-bottom p-2 ${style?.containerSummry11AddressFont}`}>
                    <p className="fw-bolder pb-1 fs-5">TO, {header?.customerfirmname}</p>
                    <p>{header?.customerstreet}</p>
                    <p>{header?.customerregion}</p>
                    <p>{header?.customercity}{header?.customerpincode}</p>
                    <p>Phno:-{header?.customermobileno}</p>
                    <p>{header?.vat_cst_pan} | {header?.Cust_CST_STATE}-{header?.Cust_CST_STATE_No}</p>
                </div>
                {/* table header */}
                <div className={`d-flex border-start border-end border-bottom ${style?.containerSummry11DataFont}`}>
                    <div className={`${style?.srNo} d-flex justify-content-center align-items-center fw-bolder p-1 border-end`}><p>SR#</p></div>
                    <div className={`${style?.design} d-flex justify-content-center align-items-center fw-bolder p-1 border-end`}><p>DESIGN</p></div>
                    <div className={`${style?.purity} d-flex justify-content-center align-items-center fw-bolder p-1 border-end`}><p>PURITY</p></div>
                    <div className={`${style?.quality} d-flex justify-content-center align-items-center fw-bolder p-1 border-end`}><p>QLTY</p></div>
                    <div className={`${style?.dia} d-flex justify-content-center align-items-center fw-bolder p-1 border-end`}><p>DIA WT</p></div>
                    {/* <div className={`${style?.dia} d-flex justify-content-center align-items-center fw-bolder p-1 border-end`}><p>DIA PCS</p></div> */}
                    <div className={`${style?.dia} d-flex justify-content-center align-items-center fw-bolder p-1 border-end`}><p>DIA RATE</p></div>
                    <div className={`${style?.dia} d-flex justify-content-center align-items-center fw-bolder p-1 border-end`}><p>DIA AMT</p></div>
                    <div className={`${style?.gwt} d-flex justify-content-center align-items-center fw-bolder p-1 border-end`}><p>G WT</p></div>
                    <div className={`${style?.gwt} d-flex justify-content-center align-items-center fw-bolder p-1 border-end`}><p>NWT</p></div>
                    <div className={`${style?.making} d-flex justify-content-center align-items-center fw-bolder p-1 border-end`}><p>MAKING</p></div>
                    <div className={`${style?.otherCharges} flex-column d-flex justify-content-center align-items-center fw-bolder p-1 border-end`}><p>OTHER</p><p>CHARGES</p></div>
                    <div className={`${style?.csAmt} d-flex justify-content-center align-items-center fw-bolder p-1 border-end`}><p>CS AMT</p></div>
                    <div className={`${style?.goldFine} d-flex justify-content-center align-items-center fw-bolder p-1 border-end flex-column`}><p>GOLD </p><p>FINE</p></div>
                    <div className={`${style?.goldAmt} d-flex justify-content-center align-items-center fw-bolder p-1 border-end flex-column`}><p>GOLD </p><p>AMT</p></div>
                    <div className={`${style?.Amount} d-flex justify-content-center align-items-center fw-bolder p-1`}><p>AMOUNT</p></div>
                </div>
                {/* table data */}
                {data.length > 0 && data.map((e, i) => {
                    const mergedDiamonds = Object.values(
                        e?.diamonds?.reduce((acc, curr) => {
                            const key = `${curr.QualityName}_${curr.Rate}`;

                            if (!acc[key]) {
                                acc[key] = { ...curr };
                            } else {
                                acc[key].Pcs += curr.Pcs || 0;
                                acc[key].Wt += curr.Wt || 0;
                                acc[key].Amount += curr.Amount || 0;
                            }

                            return acc;
                        }, {})
                    );
                    return <div className={`d-flex border-start border-end border-bottom ${style?.containerSummry11DataFont}`} key={i + "data"}>
                        <div className={`${style?.srNo} align-items-center p-1 border-end`}><p>{NumberWithCommas(i + 1, 0)}</p></div>
                        <div className={`${style?.design} align-items-center fw-bolder p-1 border-end`}>
                            <p className='fw-bolder'>{e?.designno} </p>
                            <p className='fw-bolder'>{e?.SrJobno}</p>
                            <p className='fw-bolder'>Tunch: {NumberWithCommas(e?.Tunch, 3)}</p>
                            {e?.HUID !== "" && <p className="fw-normal">HUID: {e?.HUID}</p>}
                        </div>
                        <div className={`${style?.purity}  p-1 border-end`}><p>{e?.MetalTypePurity}</p></div>
                        {console.log("e?.diamonds", e?.diamonds)}
                        <div className={`${style?.quality} p-1 border-end`}>
                            {mergedDiamonds.map((ele, ind) => (
                                <p key={ind + "quality"}>{ele?.QualityName}</p>
                            ))}
                        </div>

                        <div className={`${style?.dia} p-1 border-end`}>
                            {mergedDiamonds.map((ele, ind) => (
                                <p key={ind + "wt"} className='text-end'>
                                    {NumberWithCommas(ele?.Pcs, 0)+"/"+NumberWithCommas(ele?.Wt, 3)}
                                </p>
                            ))}
                        </div>

                        {/* <div className={`${style?.dia} p-1 border-end text-end`}>
                            {mergedDiamonds.map((ele, ind) => (
                                <p key={ind + "pcs"}>
                                    {NumberWithCommas(ele?.Pcs, 0)}
                                </p>
                            ))}
                        </div> */}

                        <div className={`${style?.dia} p-1 border-end text-end`}>
                            {mergedDiamonds.map((ele, ind) => (
                                <p key={ind + "rate"}>
                                    {NumberWithCommas(ele?.Rate, 2)}
                                </p>
                            ))}
                        </div>

                        <div className={`${style?.dia} p-1 border-end text-end`}>
                            {mergedDiamonds.map((ele, ind) => (
                                <p key={ind + "amt"}>
                                    {NumberWithCommas(ele?.Amount, 2)}
                                </p>
                            ))}
                        </div>
                        <div className={`${style?.gwt}  p-1 border-end text-end`}><p>{NumberWithCommas(e?.grosswt, 3)}</p></div>
                        <div className={`${style?.gwt}  p-1 border-end text-end`}><p>{NumberWithCommas(e?.NetWt, 3)}</p></div>
                        <div className={`${style?.making}  p-1 border-end text-end`}><p>{NumberWithCommas(e?.makingSettingAmount, 2)}</p></div>
                        <div className={`${style?.otherCharges} flex-column  p-1 border-end text-end`}><p>{NumberWithCommas(e?.otherChargesIncluded, 2)}</p></div>
                        <div className={`${style?.csAmt}  p-1 border-end text-end`}><p>{NumberWithCommas(e?.csAmt, 2)}</p></div>
                        <div className={`${style?.goldFine}  p-1 border-end text-end`}><p>{NumberWithCommas(e?.convertednetwt, 3)}</p></div>
                        <div className={`${style?.goldAmt}  p-1 border-end text-end`}><p>{NumberWithCommas(e?.MetalAmount, 2)}</p></div>
                        <div className={`${style?.Amount}  p-1 text-end`}><p>{NumberWithCommas(e?.TotalAmount, 2)}</p></div>
                    </div>
                })}

                {/* total */}
                <div className={`d-flex border-start border-end border-bottom lightGrey ${style?.containerSummry11DataFont}`}>
                    <div className={`${style?.total} fw-bolder p-1 border-end`}>
                        <p className='fw-bolder text-center'>TOTAL </p>
                    </div>
                    <div className={`${style?.dia} fw-bolder p-1 border-end text-end`}><p>{NumberWithCommas(total?.diaPcs, 0)+"/"+NumberWithCommas(total?.diaWt, 3)}</p></div>
                    {/* <div className={`${style?.dia} fw-bolder p-1 border-end text-end`}><p>{NumberWithCommas(total?.diaPcs, 0)}</p></div> */}
                    <div className={`${style?.dia} fw-bolder p-1 border-end text-end`}><p></p></div>
                    <div className={`${style?.dia} fw-bolder p-1 border-end text-end`}><p>{NumberWithCommas(total?.diaAmt, 3)}</p></div>
                    <div className={`${style?.gwt} fw-bolder p-1 border-end text-end`}><p>{NumberWithCommas(total?.grosswt, 3)}</p></div>
                    <div className={`${style?.gwt} fw-bolder p-1 border-end text-end`}><p>{NumberWithCommas(total?.netWt, 3)}</p></div>
                    <div className={`${style?.making} fw-bolder p-1 border-end text-end`}><p>{NumberWithCommas(total?.making, 2)}</p></div>
                    <div className={`${style?.otherCharges} flex-column fw-bolder p-1 border-end text-end`}><p>{NumberWithCommas(total?.otherCharges, 2)}</p></div>
                    <div className={`${style?.csAmt} fw-bolder p-1 border-end text-end`}><p>{NumberWithCommas(total?.csAmt, 2)}</p></div>
                    <div className={`${style?.goldFine} fw-bolder p-1 border-end text-end`}><p>{NumberWithCommas(total?.goldFine, 3)}</p></div>
                    <div className={`${style?.goldAmt} fw-bolder p-1 border-end text-end`}><p>{NumberWithCommas(total?.goldAmt, 2)}</p></div>
                    <div className={`${style?.Amount} fw-bolder p-1 text-end`}><p>{NumberWithCommas(total?.totalAmount, 2)}</p></div>
                </div>
                {/* tax */}
                <div className={`d-flex justify-content-end ${style?.containerSummry11DataFont}`}>
                    <div className="col-4 border-start border-end border-bottom p-2">
                        {tax.length > 0 && tax.map((e, i) => {
                            return <div className="d-flex justify-content-between" key={i}>
                                <p>{e?.name} @ {e?.per}	</p>
                                <p>{NumberWithCommas(e?.amount, 2)}</p>
                            </div>
                        })}
                        <div className="d-flex justify-content-between fw-bold">
                            <p>{header?.AddLess < 0 ? "Less" : "Add"}</p>
                            <p>{header?.AddLess}</p>
                        </div>
                    </div>
                </div>
                {/* gold in 24k */}
                <div className={`mt-2 border lightGrey d-flex justify-content-between p-2 ${style?.containerSummry11DataFont} fw-bolder`}>
                    <p> Gold in 24K : <span className="fw-bolder">{NumberWithCommas(total?.goldFine, 3)}</span></p>
                    <p>TOTAL IN {header?.CurrencyCode} : <span className="fw-bolder">{NumberWithCommas(total?.afterTax, 2)}</span></p>
                </div>
                {/* number in words */}
                <div className={`mt-2 border lightGrey d-flex justify-content-between p-2 ${style?.containerSummry11DataFont}`}>
                    <p className='fw-bolder '>{numberToWord(+fixedValues(total?.afterTax, 2))} Only</p>
                    <p className='fw-bolder '>TOTAL : <span className="fw-bolder"> {header?.CurrencyCode} {fixedValues(total?.afterTax, 2)}</span></p>
                </div>
                {/* Summary Detail */}
                <div className={`mt-1 border ${style?.containerSummry11DataFont}`}>
                    <div className="lightGrey p-2 mb-2"> <p className="fw-bolder">Summary Detail </p> </div>
                    <div className="d-flex flex-wrap">
                        {category.length > 0 && category.map((e, i) => {
                            return <div className="col-3 d-flex p-2" key={i}>
                                <p className='pe-5'>{e?.Categoryname} :</p>
                                <p>{e?.pcs}</p>
                            </div>
                        })}
                    </div>
                </div>
                {/* notes */}
                <div className="mt-2 border p-2">
                    <p className="fw-bolder pb-1 width_max_content">NOTE :</p>
                    <div dangerouslySetInnerHTML={{ __html: header?.Declaration }}></div>
                </div>
                <div className='d-flex px-2 mt-2'>
                    <p className='pe-2 fw-bold width_max_content'>REMARK : </p>
                    <div dangerouslySetInnerHTML={{ __html: header?.PrintRemark }}>
                    </div>
                </div>
                {/* TERMS INCLUDED : */}
                <p ><span className="fw-bolder p-2">TERMS INCLUDED </span>:
                    <span
                        dangerouslySetInnerHTML={{
                            __html: header?.SalesRepPolicyTermsDescription,
                        }}
                        className=""
                    />
                </p>
                {/* signs  */}
                <div className={footer1.footer1Info}>
                    <div className={`w-50 d-flex justify-content-center align-items-end ${footer1.borderRightF1} h-100`}>RECEIVER's SIGNATURE & SEAL</div>
                    <div className="w-50 d-flex justify-content-center align-items-end h-100">For, ORAIL SERVICE</div>
                </div>
                {/* {footerComponent} */}
            </div>
        </> : <p className='text-danger fs-2 fw-bolder mt-5 text-center w-50 mx-auto'>{msg}</p>
    )
}

export default Summary11