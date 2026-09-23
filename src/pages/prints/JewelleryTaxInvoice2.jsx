import React from 'react'
import "../../assets/css/prints/jewellerytaxinvoice2.css"
import { useState } from 'react';
import { useEffect } from 'react';
import { apiCall, checkMsg, formatAmount, handleImageError, isObjectEmpty } from '../../GlobalFunctions';
import { cloneDeep } from 'lodash';
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import Loader from '../../components/Loader';
import Button from '../../GlobalFunctions/Button';
const JewelleryTaxInvoice2 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
    const [result, setResult] = useState(null);
    const [msg, setMsg] = useState("");
    const [loader, setLoader] = useState(true);
    const [isImageWorking, setIsImageWorking] = useState(true);
    const [purityWise, setPurityWise] = useState([]);
    const [grossNetFlag, setGrossNetFlag] = useState(true);
    const [compbankFlag, setCompbankFlag] = useState(true);
    const [paymentTerms, setPaymentTerms] = useState(false);
    const [generalLedgerData, setGeneralLedgerData] = useState(null);


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
            } catch (error) {
                console.error(error);
            }
        };
        sendData();
        const sendData2 = async () => {
            const firstApiUrl = urls;
            const newUrl = firstApiUrl.replace('SaleBill_Json', 'BillOpeningClosingBalance_Json');
            try {
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

                    console.log("TCL:data2?.Data?.BillOpeningClosingBalance_Json ", data2)
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
        sendData2();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = (data) => {
        const copydata = cloneDeep(data);

        let address = copydata?.BillPrint_Json[0]?.Printlable?.split("\r\n");
        copydata.BillPrint_Json[0].address = address;

        const datas = OrganizeDataPrint(
            copydata?.BillPrint_Json[0],
            copydata?.BillPrint_Json1,
            copydata?.BillPrint_Json2
        );


        // let invpaydet = [];

        // let abc = datas?.header?.InvPayDet?.split("@-@");
        // let newarr = [];
        // abc?.forEach((item) => {
        //     let val = item?.toLowerCase();
        //     let obj = {};
        //     let doc_no;
        //     if(val?.includes("cash") && val?.includes("-##-")){
        //         let amtby = val?.split("-##-")[0];
        //         let name = amtby?.split("#")[0];
        //         obj.name = name;
        //         let amtby1 = val?.split("-##-")[1];
        //         let cashamt = amtby1?.split("#")[1];
        //         obj.amount = Number(cashamt);
        //         obj.docno = '';
        //         invpaydet.push(obj);
        //     }
        //     if(val?.includes("discount") && val?.includes("-##-")){
        //         let amtby = val?.split("-##-")[0];
        //         let name = amtby?.split("#")[0];
        //         obj.name = name;
        //         let amtby1 = val?.split("-##-")[1];
        //         let cashamt = amtby1?.split("#")[1];
        //         obj.amount = Number(cashamt);
        //         obj.docno = '';
        //         invpaydet.push(obj);
        //     }
        //     if(val?.includes("cheque") && val?.includes("#-#")){
        //         let name = val?.split("#-#")[0];
        //         let docno = val?.split("#-#")[1];
        //         let amt = val?.split("#-#")[2];
        //         obj.name = name;
        //         obj.docno = docno;
        //         obj.amount = amt;
        //         doc_no = docno;
        //         invpaydet.push(obj);
        //     }
        //     if(val?.includes("discount")){
        //         if(val?.includes("-##-")){
        //             return
        //         }else{
        //             newarr.push(val)
        //         }
        //     }

        // })
        // let disarr = [];
        // newarr?.forEach((e) => {
        //     let val = e?.toLowerCase();
        //     let obj = {};
        //     if(val?.includes("#-#")){
        //         let name = e?.split("#-#")[0];
        //         let docno = e?.split("#-#")[1];
        //         let amount = e?.split("#-#")[2];
        //         obj.name = name;
        //         obj.docno = docno;
        //         obj.amount = amount;
        //         disarr.push(obj);
        //     }
        // })

        // let mainarr = [...invpaydet, ...disarr];
        // datas.header.mainarr = mainarr;
        let invpaydet = [];

        let abc = datas?.header?.InvPayDet?.split("@-@");

        let newarr = [];


        abc?.forEach((e) => {
            let obj = {
                name: '',
                amount: null,
                docno: ''
            }
            obj.name = e?.split("#-##-#")[0]
            obj.amount = (e?.split("#-##-#")[1])
            if (obj.name !== undefined && obj.amount !== undefined) {
                if (obj.name?.toLowerCase() === 'discount') {
                    obj.name = 'Cash';
                    newarr.push(obj);
                } else {
                    newarr.push(obj);
                }
            }
        })

        abc?.forEach((e) => {
            let obj = {
                name: '',
                amount: null,
                docno: ''
            }

            obj.name = e?.split("#-#")[0];
            obj.docno = e?.split("#-#")[1];
            obj.amount = e?.split("#-#")[2];

            if (obj.docno !== '') {
                if (obj.name?.toLowerCase() === 'discount') {
                    obj.name = 'Cheque';
                    newarr.push(obj);
                } else {
                    newarr.push(obj);
                }
            }
        })

        datas.header.mainarr = newarr;
        let totalAmt = 0;

        newarr?.forEach((e) => {
            totalAmt += (+e?.amount);
        })

        datas.header.maindistotal = totalAmt;


        let a2 = [];

        datas?.resultArray?.forEach((a) => {
            let a1 = [];
            a?.misc?.forEach((el) => {
                if (el?.IsHSCOE === 0) {
                    a1.push(el);
                }
            })
            a.misc = a1;
        })


        datas?.resultArray?.forEach((e) => {
            // let obj = cloneDeep(e);

            let dia = [];
            e?.diamonds?.forEach((e) => {

                let findrec = dia?.findIndex((el) => el?.ShapeName === e?.ShapeName && el?.QualityName === e?.QualityName && el?.Colorname === e?.Colorname)
                if (findrec === -1) {
                    dia.push(e);
                } else {
                    dia[findrec].Wt += e?.Wt;
                    dia[findrec].Pcs += e?.Pcs;
                }
            })
            e.diamonds = dia;

            let clr = [];
            e?.colorstone?.forEach((e) => {

                let findrec1 = clr?.findIndex((el) => el?.ShapeName === e?.ShapeName && el?.QualityName === e?.QualityName && el?.Colorname === e?.Colorname)
                if (findrec1 === -1) {
                    clr.push(e);
                } else {
                    clr[findrec1].Wt += e?.Wt;
                    clr[findrec1].Pcs += e?.Pcs;
                }
            })
            e.colorstone = clr;

            let miscss = [];
            // let findrec2 = miscss?.findIndex((el) => el?.ShapeName === obj?.ShapeName && el?.QualityName === obj?.QualityName && el?.Colorname === obj?.Colorname)
            e?.misc?.forEach((e) => {

                let findrec2 = miscss?.findIndex((el) => el?.ShapeName === e?.ShapeName)
                if (findrec2 === -1) {
                    miscss.push(e);
                } else {
                    miscss[findrec2].Wt += e?.Wt;
                    miscss[findrec2].Pcs += e?.Pcs;
                }
            })
            e.misc = miscss;
        })

        let recheckArr = [];
        datas?.resultArray?.forEach((e) => {
            let obj = cloneDeep(e);
            obj.MetalRate = e?.metal.reduce((acc, num) => acc + num?.Rate, 0) || 0;
            obj.MetalRatePrimaryMetal = e?.metal.reduce((acc, num) => (num?.IsPrimaryMetal === 1 ? acc + num?.Rate : acc), 0) || 0;

            obj?.metal?.forEach((el) => {
                if (el?.IsPrimaryMetal === 1) {
                    obj.MetalColorCode = el?.MetalColorCode
                }
            })

            recheckArr.push(obj);
        })

        datas.resultArray = recheckArr;

        setResult(datas);


    }

    const handleImageErrors = () => {
        setIsImageWorking(false);
    };

    const handleCheckbox = () => {
        setGrossNetFlag((prev) => !prev);
    }
    const handleCompbankCheckbox = () => {
        setCompbankFlag((prev) => !prev);
    }
    const handlePaymentTermsCheckbox = () => {
        setPaymentTerms((prev) => !prev);
    }

    // console.log("result", result);

    const formatPaymentData = (rawData) => {
        if (!rawData) return [];


        const mergedMap = rawData.split("@-@").reduce((acc, item) => {
            const parts = item.split("#-#");
            const label = parts[0]?.trim() || "";
            const id = parts[1]?.trim() || "";
            const amount = parseFloat(parts[2]) || 0;
            const key = `${label}_${id}`;

            if (acc[key]) {
                acc[key].amount += amount;
            } else {
                acc[key] = { label, id, amount };
            }

            return acc;
        }, {});
        return Object.values(mergedMap).map(item => ({
            label: item.label,
            id: item.id,
            amount: item.amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
        }));
    };

    const pay_details = formatPaymentData(result?.header?.InvPayDet);

    return (
        <>
            {
                loader ? <Loader /> : <>
                    {
                        msg === '' ? <>
                            <div className='container_jti2'>
                                <div className=' d-flex justify-content-between align-items-start mt-5 pt-5 '>

                                    <div className="compant_details">
                                        <div className="d-flex w-100">
                                            <div className="col-12 p-2" style={{ lineHeight: "16px", fontSize: "14px" }}>
                                                {compbankFlag && (
                                                    <>
                                                        <div className="fslhJL mb-1">
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
                                                        {(result?.header?.CompanyTellNo || result?.header?.CompanyTollFreeNo) && (
                                                            <div className="fslhJL">
                                                                {result?.header?.CompanyTellNo && `TH ${result?.header?.CompanyTellNo}`}
                                                                {result?.header?.CompanyTellNo && result?.header?.CompanyTollFreeNo && " | "}
                                                                {result?.header?.CompanyTollFreeNo && `TOLL FREE ${result?.header?.CompanyTollFreeNo}`}
                                                            </div>
                                                        )}
                                                        <div className="fslhJL">
                                                            {result?.header?.CompanyEmail} |{result?.header?.CompanyWebsite}
                                                        </div>
                                                        {/* <div className='fslhpcl3'>{result?.header?.Company_VAT_GST_No} | {result?.header?.Cust_CST_STATE}-{result?.header?.Company_CST_STATE_No} | PAN-EDJHF236D</div> */}
                                                        <div className="fslhJL">
                                                            {result?.header?.Company_VAT_GST_No}
                                                            {result?.header?.Company_CST_STATE_No !== "" &&
                                                                result?.header?.Company_CST_STATE !== "" &&
                                                                `| ${result?.header?.Company_CST_STATE}-${result?.header?.Company_CST_STATE_No}`}
                                                            {result?.header?.Com_pannumber !== "" &&
                                                                ` | PAN-${result?.header?.Com_pannumber}`}
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                        </div>
                                    </div>


                                    <div className="checkboxs d_none_jti2" style={{ display: "flex", alignItems: "center" }}>
                                        <div>
                                            <input
                                                type="checkbox"
                                                id="compbank"
                                                className="mx-1"
                                                checked={compbankFlag}
                                                onChange={handleCompbankCheckbox}
                                            />
                                            <label
                                                htmlFor="compbank"
                                                className="me-3 user-select-none"
                                            >
                                                Company & Bank
                                            </label>

                                        </div>
                                        <div>
                                            <input
                                                type="checkbox"
                                                id="paymentTerns"
                                                className="mx-1"
                                                checked={paymentTerms}
                                                onChange={handlePaymentTermsCheckbox}
                                            />
                                            <label
                                                htmlFor="paymentTerns"
                                                className="me-3 user-select-none"
                                            >
                                                Payment Terms
                                            </label>

                                        </div>
                                        <div>
                                            <input
                                                type="checkbox"
                                                id="imghideshow"
                                                className="mx-1"
                                                checked={grossNetFlag}
                                                onChange={handleCheckbox}
                                            />
                                            <label
                                                htmlFor="imghideshow"
                                                className="me-3 user-select-none"
                                            >
                                                Gross & Net
                                            </label>
                                        </div>
                                        <Button />
                                    </div>

                                </div>
                                <div className='text-center text-decoration-underline fs_head_jti2 text-break'>{result?.header?.PrintHeadLabel}</div>
                                <div className='border p-2 d-flex justify-content-between align-items-center pbia_jti2'>
                                    <div className='fs_jti2 text-break'>
                                        <div>To,</div>
                                        <div className='fs2_jti2 fw-bold'>{result?.header?.customerfirmname}</div>
                                        <div>{result?.header?.customerstreet}</div>
                                        <div>{result?.header?.customerregion}</div>
                                        <div>{result?.header?.customercity}, {result?.header?.customerstate} {result?.header?.customerpincode}</div>
                                        <div>Tel : {result?.header?.customermobileno}</div>
                                        <div>{result?.header?.customeremail1}</div>
                                    </div>
                                    <div className='fs_jti2 pe-5 text-break'>

                                        {/* <div>{result?.header?.HSN_No_Label}: <span className='fw-bold'>{result?.header?.HSN_No}</span></div> */}

                                        {
                                            paymentTerms && (
                                                <div className='paymentTerms'>
                                                    <div>Invoice#: <span className='fw-bold'>{result?.header?.InvoiceNo}</span>   </div>

                                                    <div>Memo no.: <span className='fw-bold'>{result?.header?.BillReferenceNo}</span></div>
                                                    <div>Date: <span className='fw-bold'>{result?.header?.EntryDate}</span></div>
                                                    <div>Payment Terms: <span className='fw-bold'>{result?.header?.DueDays + " days"}</span></div>

                                                </div>
                                            )
                                        }
                                        {
                                            !paymentTerms && (
                                                <>
                                                    <div>Invoice#: <span className='fw-bold'>{result?.header?.InvoiceNo}</span> Dated <span className='fw-bold text-break'>{result?.header?.EntryDate}</span></div>

                                                    <div>PAN#: <span className='fw-bold'>{result?.header?.CustPanno}</span></div>
                                                    <div>{result?.header?.CustGstNo === '' ? 'VAT' : 'GST'} <span className='fw-bold text-break'>{result?.header?.CustGstNo === '' ? result?.header?.Cust_VAT_GST_No : result?.header?.CustGstNo}</span>| {result?.header?.Cust_CST_STATE} <span className='fw-bold'>{result?.header?.Cust_CST_STATE_No}</span></div>
                                                    {result?.header?.DueDays !== 0 && <div>Terms: <span className='fw-bold'>{result?.header?.DueDays}</span></div>}
                                                    <div>Due Date: <span className='fw-bold'>{result?.header?.DueDate}</span></div>
                                                    <div className='d-flex'><div className='pe-2'>Salesrep:</div><div className='fw-bold'>{result?.header?.SalPerName?.split(" ")[0]}</div></div>
                                                </>
                                            )
                                        }
                                    </div>
                                </div>
                                <div>
                                    <div className='d-flex thead_jti2'>
                                        <div className='col1_jti2 center_jti2 brr_jti2'>SR NO</div>
                                        <div className='col2_jti2 center_jti2 brr_jti2'>ITEMCODE</div>
                                        <div className='col3_jti2 center_jti2 brr_jti2'>DESCRIPTION</div>
                                        <div className='col4_jti2 center_jti2 brr_jti2'>IMAGE</div>
                                        <div className='col5_jti2 center_jti2'>AMOUNT (USD)</div>
                                    </div>
                                    <div>
                                        {
                                            result?.resultArray?.map((a, i) => {
                                                return <div className='d-flex brr_jti2 brl_jti2 brb_jti2 fs_jti2 pbia_jti2 text-break' key={i}>
                                                    <div className='col1_jti2 center_jti2 align-items-start brr_jti2'>{i + 1}</div>
                                                    <div className='col2_jti2 center_jti2 brr_jti2 d-flex flex-column p-1 justify-content-start align-items-start ps-1'>
                                                        <div className='text-break'>Job: {a?.SrJobno}</div>
                                                        <div className='text-break'>Design: <span className='fw-bold fs_jti2 text-break'>{a?.designno}</span></div>
                                                        <div className='text-break'>{a?.Size}</div>
                                                    </div>
                                                    <div className='col3_jti2 start_jti2 align-items-start flex-column  brr_jti2 text-break'>
                                                        <div className='p-1 text-break'>
                                                            {a?.MetalTypePurity} {a?.MetalColorCode} {grossNetFlag ? `| ${a?.grosswt?.toFixed(3)} gms GW | ${a?.NetWt?.toFixed(3)} gms NW` : ""}
                                                            {
                                                                `${a?.totals?.diamonds?.Wt === 0 ? '' : (' | Lab Diamond: ' + a?.totals?.diamonds?.Wt?.toFixed(3) + " cts ")} `
                                                            }
                                                            {
                                                                `${a?.totals?.colorstone?.Wt === 0 ? '' : (' | ' + a?.totals?.colorstone?.Wt?.toFixed(3)) + " cts "} `
                                                            }
                                                            {
                                                                `${a?.totals?.misc?.Wt === 0 ? '' : (' | ' + a?.totals?.misc?.Wt?.toFixed(3)) + " gms "} `
                                                            }
                                                        </div>
                                                        {
                                                            a?.diamonds?.map((e) => {
                                                                return <div className='p-1'>Diamond : {e?.Pcs} Pcs | {e?.Wt?.toFixed(3)} Cts | {e?.Colorname} {e?.QualityName} </div>
                                                            })
                                                        }
                                                        {
                                                            a?.colorstone?.map((e) => {
                                                                return <div className='p-1'>Colorstone : {e?.Pcs} Pcs | {e?.Wt?.toFixed(3)} Cts | {e?.ShapeName} {e?.Colorname} {e?.QualityName}</div>
                                                            })
                                                        }
                                                        {
                                                            a?.misc?.map((e) => {
                                                                return <div className='p-1'>Misc : {e?.Pcs} Pcs | {e?.Wt?.toFixed(3)} gms | {e?.ShapeName}</div>
                                                            })
                                                        }
                                                        {a?.JobRemark !== '' && <div className='d-flex flex-column align-items-start p-2'><div className='fs_jti2 pe-1 text-decoration-underline fw-bold'>REMARKS:</div><div>{a?.JobRemark}</div></div>}
                                                    </div>
                                                    <div className='col4_jti2 center_jti2 brr_jti2'><img src={a?.DesignImage} alt="#designimg" className='desimg_jti2' onError={(e) => handleImageError(e)} /></div>
                                                    <div className='col5_jti2 end_jti2 align-items-start pt-1'><span dangerouslySetInnerHTML={{ __html: result?.header?.Currencysymbol }}></span><span className='ps-1 pe-1'>{formatAmount((a?.TotalAmount / result?.header?.CurrencyExchRate))}</span></div>
                                                </div>
                                            })
                                        }

                                    </div>
                                </div>
                                <div className='d-flex thead_jti2 brall_jti2 mt-1 pbia_jti2'>
                                    <div className='col1_jti2 center_jti2 brr_jti2'></div>
                                    <div className='col2_jti2 start_jti2 ps-1 brr_jti2 text-break'>TOTAL</div>
                                    <div className='col3_jti2 center_jti2 brr_jti2'></div>
                                    <div className='col4_jti2 center_jti2 brr_jti2'></div>
                                    <div className='col5_jti2 end_jti2 pe-1 text-break'><span dangerouslySetInnerHTML={{ __html: result?.header?.Currencysymbol }} className='pe-1'></span>{formatAmount((result?.mainTotal?.total_amount / result?.header?.CurrencyExchRate))}</div>
                                </div>
                                <div className='brall_jts d-flex pbia_jts brall_jti2 mt-1 fs_jti2 pbia_jti2'>
                                    <div className='w33_jts p-1 fs_jts brr_jti2 text-break'>
                                        <div className='fw-bold'>Payment Details</div>
                                        {/* <div>
                            {
                                result?.header?.mainarr?.map((e, i) => {
                                    return <div key={i}>{e?.name}({e?.docno}) : <span className='fw-bold'>{formatAmount(e?.amount)}</span></div>
                                })
                            }
                        </div> */}
                                        <div className='pay-det'>
                                            {pay_details?.map((e, i) => {
                                                return <div key={i}>{e?.label}  {e?.id ? `(${e?.id})` : ''}  : <span className='fw-bold'>{e?.amount}</span></div>
                                            })}
                                        </div>
                                        <div>Balance : <span className='fw-bold'>{formatAmount(generalLedgerData?.BalAmt, 2)}</span></div>
                                        {
                                            result?.header?.PrintRemark && (
                                                <>
                                                    <div className='fw-bold text-decoration-underline'>REMARKS:</div><div dangerouslySetInnerHTML={{ __html: result?.header?.PrintRemark }}></div>
                                                </>
                                            )
                                        }

                                    </div>
                                    <div className='w33_jts p-1 fs_jts brr_jti2 text-break'>
                                        {/* {
                            purityWise?.map((e, i) => {
                                return <div className='w-100 d-flex' key={i}><div className='w-50'>{e?.MetalTypePurity} : </div><div className='w-50'>{e?.grosswt?.toFixed(3)} gm</div></div>
                            })
                        } */}
                                        {/* <div className='w-100 d-flex'><div className='w-50'>Diamond Wt : </div><div className='w-50'>{result?.mainTotal?.diamonds?.Wt?.toFixed(3)} cts</div></div> */}
                                        {/* <div className='w-100 d-flex'><div className='w-50'>Stone Wt : </div><div className='w-50'>{result?.mainTotal?.colorstone?.Wt?.toFixed(3)} cts</div></div> */}
                                        {/* <div className='w-100 d-flex'><div className='w-50'>Gross Wt : </div><div className='w-50'>{result?.mainTotal?.grosswt?.toFixed(3)} gm</div></div> */}
                                    </div>
                                    <div className='w33_jts  fs_jts d-flex text-break'>
                                        <div className='brr_jti2 w1_jts'>
                                            {
                                                result?.allTaxes?.map((e, i) => <div className='start_jti2 ps-1 pt-1' key={i}>{e?.name} @ {e?.per}</div>)
                                            }
                                            {/* <div className='start_jti2 ps-1'>Total</div> */}
                                            <div className='start_jti2 ps-1 pt-1'>{result?.header?.AddLess > 0 ? 'Add' : 'Less'}</div>
                                            <div className='start_jti2 ps-1 pt-1'>Delivery Charges</div>
                                        </div>
                                        <div className='w2_jts fw-bold'>
                                            {
                                                result?.allTaxes?.map((e, i) => <div className='end_jti2 pe-1' key={i}><span className='pe-1 pt-1' dangerouslySetInnerHTML={{ __html: result?.header?.Currencysymbol }}></span>{formatAmount(e?.amount)}</div>)
                                            }
                                            {/* <div className='end_jti2 pe-1'><span className='pe-1' dangerouslySetInnerHTML={{__html:result?.header?.Currencysymbol}}></span>{formatAmount((result?.mainTotal?.total_amount / result?.header?.CurrencyExchRate))}</div> */}
                                            <div className='end_jti2 pe-1 pt-1'><span className='pe-1' dangerouslySetInnerHTML={{ __html: result?.header?.Currencysymbol }}></span>{formatAmount((result?.header?.AddLess / result?.header?.CurrencyExchRate))}</div>
                                            <div className='end_jti2 pe-1 pt-1'><span className='pe-1' dangerouslySetInnerHTML={{ __html: result?.header?.Currencysymbol }}></span>{formatAmount((result?.header?.FreightCharges / result?.header?.CurrencyExchRate))}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className='d-flex thead_jti2 brall_jti2 mt-1 fs_jti2 pbia_jti2 text-break'>
                                    <div className='col1_jti2 center_jti2 brr_jti2'></div>
                                    <div className='col2_jti2 start_jti2 pe-1 brr_jti2'></div>
                                    <div className='col3_jti2 end_jti2 brr_jti2' style={{ width: '67%', paddingRight: '12.5%' }}>GRAND TOTAL</div>
                                    {/* <div className='col4_jti2 center_jti2 brr_jti2'></div> */}
                                    <div className='col5_jti2 end_jti2 pe-1 '><span dangerouslySetInnerHTML={{ __html: result?.header?.Currencysymbol }} className='pe-1'></span>{formatAmount((result?.mainTotal?.total_amount / result?.header?.CurrencyExchRate))}</div>
                                </div>
                                <div className='static_jti2  py-2 text-break'>**   THIS IS A COMPUTER GENERATED INVOICE AND KINDLY NOTIFY US IMMEDIATELY IN CASE YOU FIND ANY DISCREPANCY IN THE DETAILS OF TRANSACTIONS</div>
                                <div className='mt-1 brall_jti2 dec_jti2 p-2 pbia_jti2 text-break'><div dangerouslySetInnerHTML={{ __html: result?.header?.Declaration }}></div></div>

                                {
                                    compbankFlag && (
                                        <div className='mt-1  brall_jti2 p-2 pbia_jti2 text-break' style={{ padding: "0px", lineHeight: "20px", fontSize: "15px" }}>
                                            <div > <span style={{ fontWeight: "bold", padding: "0px" }}>Malling Address :</span>  <span style={{ padding: "0px" }}>{result?.header?.bankaddress}</span></div>
                                            <div > <span style={{ fontWeight: "bold", padding: "0px" }}>Check Payable :</span>  <span style={{ padding: "0px" }}>{result?.header?.accountname}</span></div>
                                            <div > <span style={{ fontWeight: "bold", padding: "0px" }}>Zelle id :</span>  <span style={{ padding: "0px" }}>{result?.header?.bankname}</span></div>
                                        </div>
                                    )
                                }

                                <div className='mt-1 d-flex justify-content-between align-items-center p-1 pbia_jti2 text-break'>
                                    <div className='fs_jti2 minh_jti2 d-flex justify-content-between flex-column'>
                                        <div>Signature</div>
                                        <div className='fw-bold'>{result?.header?.customerfirmname}</div>
                                    </div>
                                    <div className='fs_jti2 minh_jti2 d-flex justify-content-between flex-column'>
                                        <div>Signature</div>
                                        <div className='fw-bold'>{result?.header?.CompanyFullName}</div>
                                    </div>
                                </div>
                            </div>
                        </> : <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
                            {msg}
                        </p>
                    }
                </>
            }
        </>
    )
}

export default JewelleryTaxInvoice2