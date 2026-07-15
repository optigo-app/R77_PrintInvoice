import React, { useEffect, useState } from 'react'
import Loader from '../../components/Loader';
import { apiCall, checkMsg, formatAmount, handleImageError, isObjectEmpty } from '../../GlobalFunctions';
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import "../../assets/css/prints/retailinvoice.css";
import Button from './../../GlobalFunctions/Button';
import { ToWords } from 'to-words';
const RetailInvoice = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
    const [result, setResult] = useState(null);
    const [msg, setMsg] = useState("");
    const [loader, setLoader] = useState(true);
    const toWords = new ToWords();
    const [generalLedgerData, setGeneralLedgerData] = useState(null);
    const [disflag, setDisflag] = useState(true);
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
                    //   setMsg(data?.Message);
                    const err = checkMsg(data?.Message);
                    console.log(data?.Message);
                    setMsg(err);
                }

                // Changing Only Last Name In First API's URL, As Told Per Mahesh Sir On 07/11/2025_4:00_PM
                const firstApiUrl = urls;
                const newUrl = firstApiUrl.replace('SaleBill_Json', 'BillOpeningClosingBalance_Json');
                // console.log("newUrl", newUrl);

                const data2 = await apiCall(
                    token,
                    invoiceNo,
                    printName,
                    newUrl,
                    evn,
                    ApiVer
                );

                if (data2?.Status === "200") {
                    const arr = data2?.Data?.BillOpeningClosingBalance_Json;
                    if (arr?.length > 0) {
                        setGeneralLedgerData(arr[0]);
                    } else {
                        console.log("Data Not Found for second API");
                    }
                } else {
                    const err2 = checkMsg(data2?.Message);
                    console.log(err2);
                }
            } catch (error) {
                console.error(error);
            }
        };
        sendData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = (data) => {

        let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
        data.BillPrint_Json[0].address = address;

        let datas = OrganizeDataPrint(
            data?.BillPrint_Json[0],
            data?.BillPrint_Json1,
            data?.BillPrint_Json2
        );
        let finalArr = [];
        datas?.resultArray?.forEach((e) => {
            let obj = { ...e };
            let discountOn = [];
            if (e?.IsCriteriabasedAmount === 1) {
                if (e?.IsMetalAmount === 1) {
                    discountOn.push('Metal')
                }
                if (e?.IsDiamondAmount === 1) {
                    discountOn.push('Diamond')
                }
                if (e?.IsStoneAmount === 1) {
                    discountOn.push('Stone')
                }
                if (e?.IsMiscAmount === 1) {
                    discountOn.push('Misc')
                }
                if (e?.IsLabourAmount === 1) {
                    discountOn.push('Labour')
                }
                if (e?.IsSolitaireAmount === 1) {
                    discountOn.push('Solitaire')
                }
            } else {
                if (e?.Discount !== 0) {
                    discountOn.push('Total Amount')
                }
            }

            obj.discountOn = discountOn;
            obj.str_discountOn = discountOn?.join('  ');

            finalArr.push(obj);
        })

        datas.resultArray = finalArr;

        let invpaydet = [];

        let abc = datas?.header?.InvPayDet?.split("@-@");
        let newarr = [];
        abc?.forEach((item) => {
            let val = item?.toLowerCase();
            let obj = {};
            let doc_no;
            if (val?.includes("cash") && val?.includes("-##-")) {
                let amtby = val?.split("-##-")[0];
                let name = amtby?.split("#")[0];
                obj.name = name;
                let amtby1 = val?.split("-##-")[1];
                let cashamt = amtby1?.split("#")[1];
                obj.amount = Number(cashamt);
                obj.docno = '';
                invpaydet.push(obj);
            }
            if (val?.includes("debit card") && val?.includes("#-#")) {
                let name = val?.split("#-#")[0];
                let docno = val?.split("#-#")[1];
                let amt = val?.split("#-#")[2];
                obj.name = name;
                obj.docno = docno;
                obj.amount = amt;
                doc_no = docno;
                invpaydet.push(obj);
            }
            if (val?.includes("rtgs") && val?.includes("#-#")) {
                let name = val?.split("#-#")[0];
                let docno = val?.split("#-#")[1];
                let amt = val?.split("#-#")[2];
                obj.name = name;
                obj.docno = docno;
                obj.amount = amt;
                doc_no = docno;
                invpaydet.push(obj);
            }
            if (val?.includes("discount") && val?.includes("-##-")) {
                let amtby = val?.split("-##-")[0];
                let name = amtby?.split("#")[0];
                obj.name = name;
                let amtby1 = val?.split("-##-")[1];
                let cashamt = amtby1?.split("#")[1];
                obj.amount = Number(cashamt);
                obj.docno = '';
                invpaydet.push(obj);
            }
            if (val?.includes("cheque") && val?.includes("#-#")) {
                let name = val?.split("#-#")[0];
                let docno = val?.split("#-#")[1];
                let amt = val?.split("#-#")[2];
                obj.name = name;
                obj.docno = docno;
                obj.amount = amt;
                doc_no = docno;
                invpaydet.push(obj);
            }
            if (val?.includes("discount")) {
                if (val?.includes("-##-")) {
                    return
                } else {
                    newarr.push(val)
                }
            }

        })
        let disarr = [];
        newarr?.forEach((e) => {
            let val = e?.toLowerCase();
            let obj = {};
            if (val?.includes("#-#")) {
                let name = e?.split("#-#")[0];
                let docno = e?.split("#-#")[1];
                let amount = e?.split("#-#")[2];
                obj.name = name;
                obj.docno = docno;
                obj.amount = amount;
                disarr.push(obj);
            }
        })

        let mainarr = [...invpaydet, ...disarr];
        datas.header.mainarr = mainarr;

        let totalAmt = 0;

        mainarr?.forEach((e) => {
            totalAmt += (+e?.amount);
        })

        datas.header.maindistotal = totalAmt;

        setResult(datas);

    }

    const handledisflag = (e) => {
        disflag ? setDisflag(false) : setDisflag(true);
    };


    return (
        <>
            {
                loader ? <Loader /> : <>
                    {
                        msg === '' ? <div className='container_ri fs_ri'>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "5px", marginBottom: "10px" }}>

                                <div className='  d-none_ri'>
                                    <div className="form-check pe-3"  >
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id='disflag'
                                            checked={disflag}
                                            onChange={handledisflag}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="disflag"
                                            style={{ cursor: "pointer", textSelection: "none", paddingTop: "2px" }}
                                        >
                                            Discount.
                                        </label>
                                    </div>
                                </div>
                                <div className=' d-none_ri'><Button /></div>
                            </div>

                            <div className='printheadlabel_ri'> {result?.header?.PrintHeadLabel} </div>
                            <div className='d-flex justify-content-between align-items-center p-1 mt-1'>
                                <div className='box1_ri'><div className='fw-bold w-25'>BILL NO :</div><div className='w-75 center_ri'>{result?.header?.InvoiceNo}</div></div>
                                {/* <div className='box1_ri'><div className='fw-bold w-25'>{result?.header?.HSN_No_Label} :</div><div className='w-75 center_ri'>{result?.header?.HSN_No}</div></div> */}
                                <div className='box1_ri'><div className='fw-bold ' style={{ width: "40%" }}>{result?.header?.Cust_CST_STATE} :</div><div className='w-75 center_ri'>{result?.header?.Cust_CST_STATE_No}</div></div>
                                <div className='box1_ri'><div className='fw-bold w-25'>DATE :</div><div className='w-75 center_ri'>{result?.header?.EntryDate}</div></div>
                            </div>
                            <div className='mt-1 border-black border d-flex pbia'>

                                <div style={{ width: "50%", padding: "5px" }}>
                                    <div className="fslhJL">
                                        <h5>
                                            {" "}
                                            <b style={{ fontSize: "16px", color: "black" }}>
                                                {" "}
                                                {result?.header?.CompanyFullName}{" "}
                                            </b>{" "}
                                        </h5>
                                    </div>
                                    <div className="fslhJL">{result?.header?.CompanyAddress}</div>
                                    <div className="fslhJL">
                                        {result?.header?.CompanyAddress2}
                                    </div>
                                    <div className="fslhJL">
                                        {result?.header?.CompanyCity}-{result?.header?.CompanyPinCode},
                                        {result?.header?.CompanyState}({result?.header?.CompanyCountry})
                                    </div>
                                    <div className="fslhJL">
                                        T {result?.header?.CompanyTellNo} | TOLL FREE{" "}
                                        {result?.header?.CompanyTollFreeNo}
                                    </div>
                                    <div className="fslhJL">
                                        {result?.header?.CompanyEmail} |{result?.header?.CompanyWebsite}
                                    </div>
                                    {/* <div className='fslhpcl3'>{result?.header?.Company_VAT_GST_No} | {result?.header?.Cust_CST_STATE}-{result?.header?.Company_CST_STATE_No} | PAN-EDJHF236D</div> */}
                                    <div className="fslhJL">
                                        {result?.header?.Company_VAT_GST_No}
                                        {[
                                            result?.header?.Company_CST_STATE &&
                                            result?.header?.Company_CST_STATE_No &&
                                            `${result.header.Company_CST_STATE}-${result.header.Company_CST_STATE_No}`,

                                            result?.header?.Com_pannumber &&
                                            `PAN: ${result.header.Com_pannumber}`,
                                        ]
                                            .filter(Boolean)
                                            .join(" | ")}
                                    </div>
                                </div>


                                <div style={{ width: "50%", padding: "5px" }}>
                                    <div className='' style={{ fontSize: "16px", color: "black" }}>Customer Details : </div>
                                    <div className=' '>
                                        <div className='fw-bold  '>{result?.header?.customerfirmname}</div>
                                        <div className='fw-bold  '>{result?.header?.CustName}</div>
                                        <div>{result?.header?.customerstreet}</div>
                                        <div>{result?.header?.customerregion}</div>
                                        <div>{result?.header?.customercity1}{result?.header?.customerpincode}</div>
                                        <div>{result?.header?.vat_cst_pan} </div>
                                    </div>
                                </div>

                            </div>
                            <div className='p-1 border border-black border-top-0 fw-bold'>{result?.header?.RetailInvoiceMsg}</div>

                            <div className='table_ri '>
                                <div className='thead_ri d-flex fs_ri border border-top-0 border-black '>
                                    <div className='text-break p-1 col1_ri center_ri text-center'>Product <br /> Description</div>
                                    <div className={`p-1 ${disflag ? 'col2_ri' : 'col2_ri_disflag'}  center_ri text-center`}>Purity/ <br /> HSN</div>
                                    <div className={`p-1 ${disflag ? 'col3_ri' : 'col3_ri_disflag'}  center_ri text-center`}>Qty</div>
                                    <div className={`text-break p-1 ${disflag ? 'col4_ri' : 'col4_ri_disflag'}  center_ri text-center`}>Gross Wt. <br /> (gms)</div>
                                    <div className={`text-break p-1 ${disflag ? 'col5_ri' : 'col5_ri_disflag'}  center_ri text-center`}>Dia. Wt. <br />(gms/carat)</div>
                                    <div className={`text-break p-1 ${disflag ? 'col6_ri' : 'col6_ri_disflag'}  center_ri text-center`}>Stone Wt. <br />(gms/carat)</div>
                                    <div className={`text-break p-1 ${disflag ? 'col7_ri' : 'col7_ri_disflag'}  center_ri text-center`}>Net Wt. <br /> (gms)</div>


                                    <div className='text-break p-1 col10_ri center_ri text-center'>
                                        Making / <br /> Other
                                    </div>
                                    <div className={`p-1 ${disflag ? 'col9_ri' : 'col9_ri_disflag'}  center_ri text-center`}>Image</div>
                                    <div className={`text-break p-1 ${disflag ? 'col8_ri' : 'col8_ri_disflag'}  center_ri text-center`}>Price(Rs)</div>




                                    {disflag && (
                                        <>

                                            <div className='text-break p-1 col11_ri center_ri text-center'>
                                                Scheme <br /> Discount
                                            </div>
                                        </>
                                    )}


                                    <div className={`text-break p-1 ${disflag ? 'col12_ri' : 'col12_ri_disflag'}  center_ri`} style={{ justifyContent: "flex-end" }}>Product <br /> Value(Rs)</div>
                                </div>
                                <div className='tbody_ri fs_ri'>
                                    {
                                        result?.resultArray?.map((e, i) => {
                                            const totalOtherCharges =
                                                e?.other_details?.reduce(
                                                    (sum, item) => sum + Number(item?.amtval || 0),
                                                    0
                                                ) || 0;

                                            const totalHallmarkAmount =
                                                e?.stone_misc
                                                    ?.filter(el => el?.ShapeName === "Hallmark")
                                                    ?.reduce((sum, el) => sum + Number(el?.Amount || 0), 0) || 0;

                                            const totalMiscAmount =
                                                e?.miscList_IsHSCODE123?.reduce((sum, item) => {
                                                    return item?.IsHSCOE === 3
                                                        ? sum + Number(item?.Amount || 0)
                                                        : sum;
                                                }, 0) || 0;


                                            const currencyRate = result?.header?.CurrencyExchRate || 1;

                                            const totalOtherAmount =
                                                totalOtherCharges +
                                                totalHallmarkAmount +
                                                (e?.totals?.finding?.SettingAmount || 0) / currencyRate +
                                                ((e?.totals?.diamonds?.SettingAmount || 0) +
                                                    (e?.totals?.colorstone?.SettingAmount || 0)) /
                                                currencyRate +
                                                (e?.TotalDiamondHandling || 0) / currencyRate +
                                                (totalMiscAmount || 0) / currencyRate;


                                            return <div className='d-flex pbia brb_clr' key={i} style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>
                                                <div className={`text-break p-1 ${disflag ? 'col1_ri' : 'col1_ri_disflag'}  start_jus_ri`} >{e?.designno} <br /> {e?.SrJobno}<br />{e?.MetalPurity + " " + e?.Categoryname}</div>
                                                <div className={`p-1 ${disflag ? 'col2_ri' : 'col2_ri_disflag'}  center_ri`} style={{ flexDirection: 'column' }}>{e?.MetalPurity} <div>{e?.HSNNo}</div></div>
                                                <div className={`p-1 ${disflag ? 'col3_ri' : 'col3_ri_disflag'}  center_ri`}>{e?.Quantity}</div>
                                                <div className={`text-break p-1 ${disflag ? 'col4_ri' : 'col4_ri_disflag'}  center_ri`}>{e?.grosswt?.toFixed(3)}</div>
                                                <div className={`text-break p-1 ${disflag ? 'col5_ri' : 'col5_ri_disflag'}  center_ri`}>{e?.totals?.diamonds?.Wt?.toFixed(3)}</div>
                                                <div className={`text-break p-1 ${disflag ? 'col6_ri' : 'col6_ri_disflag'}  center_ri`}>{e?.totals?.colorstone?.Wt?.toFixed(3)}</div>
                                                <div className={`text-break p-1 ${disflag ? 'col7_ri' : 'col7_ri_disflag'}  center_ri`}>{((e?.NetWt + e?.LossWt) - e?.totals?.metal?.WithOutPrimaryMetal)?.toFixed(3)}</div>
                                                {/* <div className='text-break p-1 col8_ri center_ri'>{formatAmount((e?.UnitCost - (e?.totals?.finding?.SettingAmount + e?.totals?.metal?.withoutPrimaryMetal_Amount)))}</div> */}
                                                {/* <div className='text-break p-1 col8_ri center_ri'>{formatAmount(((e?.UnitCost + e?.OtherCharges)))}</div> */}

                                                <div className={`text-break p-1 col10_ri   center_ri flex-column`}>

                                                    {e?.MakingAmount === 0 && totalOtherAmount === 0 ? (
                                                        "-"
                                                    ) : (
                                                        <>
                                                            <div>
                                                                {formatAmount(
                                                                    (e?.MakingAmount || 0) /
                                                                    (result?.header?.CurrencyExchRate || 1),
                                                                    2
                                                                )}
                                                            </div>

                                                            {  (
                                                                <div>{totalOtherAmount.toFixed(2)}</div>
                                                            )}
                                                        </>
                                                    )}


                                                </div>
                                                <div className={`p-1 ${disflag ? 'col9_ri' : 'col9_ri_disflag'}  center_ri`}><img src={e?.DesignImage} alt="#jobimg" onError={(e) => handleImageError(e)} className='img_ri' /></div>
                                                {/* <div className='text-break p-1 col10_ri center_ri flex-column'><span>{e?.IsCriteriabasedAmount === 0 ? '-' : `${formatAmount(e?.Discount)} % On `  } </span><span>{e?.discountOn?.map((el, ind) => <div key={ind}>{el}</div>)}</span></div> */}

                                                <div className={`text-break p-1 ${disflag ? 'col8_ri' : 'col8_ri_disflag'}  center_ri`}>{`${formatAmount(((e?.UnitCost)))}`}</div>



                                                {disflag && (
                                                    <>

                                                        <div className='text-break p-1 col11_ri center_ri' style={{ flexDirection: "column" }}>
                                                            <div>
                                                                {e?.Discount === 0 ? '' : <span className='text-break'>
                                                                    {`${formatAmount(e?.Discount)} % On ${e?.str_discountOn}`}

                                                                </span>}
                                                            </div>

                                                            <div>
                                                                RS:{formatAmount(e?.DiscountAmt)}
                                                            </div>

                                                        </div>
                                                    </>
                                                )
                                                }

                                                <div className={`text-break p-1 ${disflag ? 'col12_ri' : 'col12_ri_disflag'}  center_ri`} style={{ justifyContent: 'flex-end' }}>{formatAmount(e?.TotalAmount)}</div>
                                            </div>
                                        })
                                    }
                                </div>
                                <div className='thead_ri d-flex fs_ri pbia border border-black'>
                                    <div className={`text-break p-1 ${disflag ? 'col1_ri' : 'col1_ri_disflag'}  start_jus_ri`}>Total</div>
                                    <div className={`p-1 ${disflag ? 'col2_ri' : 'col2_ri_disflag'}  center_ri`}></div>
                                    <div className={`p-1 ${disflag ? 'col3_ri' : 'col3_ri_disflag'}  center_ri`}>{result?.mainTotal?.total_Quantity}</div>
                                    <div className={`text-break p-1 ${disflag ? 'col4_ri' : 'col4_ri_disflag'}  center_ri`}>{result?.mainTotal?.grosswt?.toFixed(3)}</div>
                                    <div className={`text-break p-1 ${disflag ? 'col5_ri' : 'col5_ri_disflag'}  center_ri`}>{result?.mainTotal?.diamonds?.Wt?.toFixed(3)}</div>
                                    <div className={`text-break p-1 ${disflag ? 'col6_ri' : 'col6_ri_disflag'}  center_ri`}>{result?.mainTotal?.colorstone?.Wt?.toFixed(3)}</div>
                                    {/* <div className='text-break p-1 col7_ri center_ri'>{((result?.mainTotal?.netwt + result?.mainTotal?.lossWt))?.toFixed(3)}</div> */}
                                    <div className={`text-break p-1 ${disflag ? 'col7_ri' : 'col7_ri_disflag'}  center_ri`}>{((result?.mainTotal?.metal?.IsPrimaryMetal))?.toFixed(3)}</div>
                                    {/* <div className='text-break p-1 col8_ri center_ri'>{formatAmount(((result?.mainTotal?.total_unitcost + result?.mainTotal?.total_other)))}</div> */}

                                    <div className='text-break p-1 col10_ri center_ri'>
                                        {formatAmount(
                                            (result?.mainTotal?.total_Making_Amount +
                                                result?.mainTotal?.total_diamondHandling +
                                                result?.mainTotal?.misc?.isHSCODE123_amt +
                                                result?.mainTotal?.total_TotalDiaSetcost +
                                                result?.mainTotal?.total_TotalCsSetcost +
                                                result?.mainTotal?.finding?.SettingAmount +
                                                result?.mainTotal?.total_other_charges) /
                                            result?.header?.CurrencyExchRate,
                                            0
                                        )}
                                    </div>


                                    <div className={`p-1 ${disflag ? 'col9_ri' : 'col9_ri_disflag'}  center_ri`}></div>
                                    <div className={`text-break p-1 ${disflag ? 'col8_ri' : 'col8_ri_disflag'}  center_ri`}>{formatAmount(((result?.mainTotal?.total_unitcost)))}</div>

                                    {
                                        disflag && (
                                            <>

                                                <div className='text-break p-1 col11_ri center_ri'>{formatAmount(result?.mainTotal?.total_discount_amount)}</div>
                                            </>
                                        )
                                    }

                                    <div className={`text-break p-1 ${disflag ? 'col12_ri' : 'col12_ri_disflag'}  center_ri`} style={{ justifyContent: 'flex-end' }}>{formatAmount(result?.mainTotal?.total_amount)}</div>
                                </div>
                                <div className='d-flex justify-content-end align-items-center p-1 border-black border border-top-0 pbia'>
                                    <div className='d-flex justify-content-between align-items-center fs_ri' style={{ width: '30%' }}>
                                        <div>Product Total Value</div>
                                        <div>{formatAmount(result?.mainTotal?.total_amount)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className='d-flex w-100 border border-black border-top-0 pbia'>
                                <div className='w-50'>
                                    <div className='fw-bold p-1'>Product Details</div>
                                    <div className='d-flex  border-bottom border-black'>
                                        <div className='w-25 p-1'>Payment Mode</div>
                                        <div className='w-25 p-1'>Doc No.</div>
                                        <div className='w-25 p-1'>Customer Name</div>
                                        <div className='w-25 p-1 end_ri'>Amount(Rs)</div>
                                    </div>
                                    {result?.header?.OldGoldAmount != 0 && (
                                        <div className='d-flex  border-bottom border-black'  >
                                            <div className='w-25 p-1'>old Gold </div>
                                            <div className='w-25 p-1'> </div>
                                            <div className='w-25 p-1'></div>
                                            <div className='w-25 p-1 end_ri'>{formatAmount(result?.header?.OldGoldAmount)}</div>
                                        </div>
                                    )}

                                    {
                                        result?.header?.mainarr?.map((e, ind) => {
                                            return <div className='d-flex  border-bottom border-black' key={ind}>
                                                <div className='w-25 p-1'>{e?.name == "rtgs" ? "RTGS" : e?.name}</div>
                                                <div className='w-25 p-1'>{e?.docno}</div>
                                                <div className='w-25 p-1'></div>
                                                <div className='w-25 p-1 end_ri'>{formatAmount(e?.amount)}</div>
                                            </div>
                                        })
                                    }
                                    <div className='d-flex  border-bottom border-black fw-bold'>
                                        <div className='w-25 p-1'>Total Amount Paid</div>
                                        <div className='w-25 p-1'></div>
                                        <div className='w-25 p-1'></div>
                                        <div className='w-25 p-1 end_ri'>{formatAmount(result?.header?.maindistotal + (result?.header?.OldGoldAmount || 0))}</div>
                                    </div>
                                    <div className='d-flex  border-bottom border-black fw-bold'>
                                        <div className='w-25 p-1'>Balance Amount</div>
                                        <div className='w-25 p-1'></div>
                                        <div className='w-25 p-1'></div>
                                        <div className='w-25 p-1 end_ri'>{formatAmount(generalLedgerData?.BalAmt)}</div>
                                    </div>
                                    <div className='p-1'>
                                        <div>
                                            <div>For : {result?.header?.CompanyFullName}</div>
                                            <div className='mt-5'>Authorised Signatory</div>
                                        </div>
                                    </div>
                                </div>
                                <div className='w-50 border-start border-black fs_ri'>
                                    <div className='d-flex justify-content-between border-bottom border-black p-1'><div className=''>Total Value</div><div className=''>{formatAmount(result?.mainTotal?.total_amount)}</div></div>
                                    <div className='d-flex justify-content-between  border-bottom border-black p-1'><div className=''>Value after Discount</div><div className=''>{formatAmount((result?.mainTotal?.total_amount + result?.header?.AddLess))}</div></div>
                                    {
                                        result?.allTaxes?.map((e, ins) => {
                                            return <div className='d-flex justify-content-between p-1  border-bottom border-black' key={ins}>
                                                <div className=''>{e?.name} @ {e?.per}</div><div className=''>{formatAmount(((+e?.amount) * result?.header?.CurrencyExchRate))}</div>
                                            </div>
                                        })
                                    }
                                    <div className='d-flex justify-content-between p-1  border-bottom border-black'><div className=''>Less - Other Discount</div><div className=''>{formatAmount(result?.header?.AddLess)}</div></div>
                                    <div className='d-flex justify-content-between p-1 border-bottom border-black'><div className=''>Net Invoice Value</div><div className=''>{formatAmount((result?.mainTotal?.total_amount + (result?.allTaxesTotal * result?.header?.CurrencyExchRate) + result?.header?.AddLess))}</div></div>
                                    <div className='d-flex justify-content-between p-1 border-bottom border-black'><div className=''>Total Amount to be paid</div><div className=''>{formatAmount((result?.mainTotal?.total_amount + (result?.allTaxesTotal * result?.header?.CurrencyExchRate) + result?.header?.AddLess))}</div></div>
                                    <div className='d-flex justify-content-between p-1 border-bottom border-black'><div className='text-break'>Value In Words : {toWords.convert(+(result?.mainTotal?.total_amount + (result?.allTaxesTotal * result?.header?.CurrencyExchRate) + result?.header?.AddLess)?.toFixed(2))} Only</div></div>
                                    <div style={{ marginTop: '8rem' }} className='p-1'>
                                        <div>Customer Name : {result?.header?.CustName}</div>
                                        <div className='mt-5'>Customer Signature</div>
                                    </div>
                                </div>
                            </div>
                            <div className='fw-bold border border-black p-1 border-top-0 pbia note_ri'>
                                <div>NOTE: </div>
                                <div dangerouslySetInnerHTML={{ __html: result?.header?.Declaration }}></div>
                            </div>
                            <div className=' border border-black p-1 border-top-0 pbia note_ri'>
                                <div> <b>TERMS INCLUDED:</b>
                                    <span dangerouslySetInnerHTML={{ __html: result?.header?.SalesRepPolicyTermsDescription }}></span>
                                </div>
                            </div>

                        </div> : <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
                            {msg}
                        </p>
                    }
                </>
            }
        </>
    )
}

export default RetailInvoice