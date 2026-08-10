import React, { useEffect, useState } from 'react'
import { CapitalizeWords, NumberWithCommas, apiCall, checkMsg, fixedValues, handleImageError, handlePrint, isObjectEmpty, taxGenrator } from '../../GlobalFunctions';
import "../../assets/css/prints/retailPrint.css";
import Loader from '../../components/Loader';
import { ToWords } from 'to-words';
import { cloneDeep, find, findIndex } from 'lodash';
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import NumToWord from '../../GlobalFunctions/NumToWord';

const Retail1Print = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
    const [jsonData1, setJsonData1] = useState({});
    const [dataFill, setDataFill] = useState([]);
    const [total, setTotal] = useState({});
    const [rate, setRate] = useState(true);
    const [loader, setLoader] = useState(true);
    const [msg, setMsg] = useState("");
    const [taxes, setTaxes] = useState([]);
    const [finalD, setFinalD] = useState({});
    const [totalss, setTotalss] = useState({
        totalWt: 0,
    })
    let pName = atob(printName).toLowerCase();

    const getStyles = (retailPrint1, retailPrint, value) => {
        return pName === 'retail1 print' ?
            (value ? retailPrint1 : `${retailPrint1}NoRate`) :
            (value ? retailPrint : `${retailPrint}NoRate`);
    }

    const [styles, setStyles] = useState({
        Material: getStyles("materialRetailPrint1", "materialRetailPrint", true),
        Qty: getStyles("qtyRetailPrint1", "qtyRetailPrint", true),
        Pcs: getStyles("pcsRetailPrint1", "pcsRetailPrint", true),
        Wt: getStyles("wtRetailPrint1", "wtRetailPrint", true),
        Amount: getStyles("", "amountRetailPrint", true),
        total: getStyles("totalRetail1Print", "totalRetailPrint", true)
    });

    const toWords = new ToWords();
    const [isImageWorking, setIsImageWorking] = useState(true);
    const handleImageErrors = () => {
        setIsImageWorking(false);
    };
    const loadData = (data) => {
        let datas = OrganizeDataPrint(data?.BillPrint_Json[0], data?.BillPrint_Json1, data?.BillPrint_Json2);
        let resultArray = [];
        let totalObj = {
            pcs: 0,
            materialWeight: 0,
            rate: 0,
            amount: 0,
            making: 0,
            others: 0,
            totalAmount: 0,
            total: 0,
            sgstAmount: 0,
            cgstAmount: 0,
            addLess: 0,
            grandTotal: 0,
            textInNumbers: "",
            goldWeight: 0
        }
        let totalWt = 0;
        datas?.resultArray?.forEach((e, i) => {
            let obj = cloneDeep(e);
            let netWtLossWt = 0;
            let secondWt = 0;
            let secondaryWt = 0;
            let count = 0
            totalObj.total += e?.UnitCost;
            e?.metal?.forEach((ele, ind) => {
                if (ele?.IsPrimaryMetal === 1) {
                    netWtLossWt += ele?.Wt;
                } else {
                    secondWt += ele?.Wt
                    count++
                    secondaryWt += ele?.Wt;
                    totalWt += ele?.Wt
                }
            });
       
            
            let diamonds = [];
            e?.diamonds?.forEach((ele, ind) => {
                totalWt += ele?.Wt;
                totalObj.pcs += ele?.Pcs;
                if (diamonds?.length === 0) {
                    diamonds?.push(ele);
                } else {
                    diamonds[0].Wt += ele?.Wt;
                    diamonds[0].Pcs += ele?.Pcs;
                    diamonds[0].Amount += ele?.Amount;
                }
            });
            let colorstone = [];
            let isRateOnPcs = {
                Pcs: 0,
                Amount: 0
            }
            let isRateOnWt = {
                Wt: 0,
                Amount: 0
            }
            e?.colorstone?.forEach((ele, ind) => {
                totalWt += ele?.Wt;
                totalObj.pcs += ele?.Pcs;
                if (ele?.isRateOnPcs === 0) {
                    isRateOnWt.Wt += ele?.Wt;
                    isRateOnWt.Amount += ele?.Amount;
                } else {
                    isRateOnPcs.Pcs += ele?.Pcs;
                    isRateOnPcs.Amount += ele?.Amount;
                }
                let findColorStones = colorstone?.findIndex((elem, index) => elem?.isRateOnPcs === ele?.isRateOnPcs);
                if (findColorStones === -1) {
                    colorstone?.push(ele);
                } else {
                    colorstone[findColorStones].Wt += ele?.Wt;
                    colorstone[findColorStones].Pcs += ele?.Pcs;
                    colorstone[findColorStones].Amount += ele?.Amount;
                }
            });
         

            let misc = [];
            e?.misc?.forEach((ele, ind) => {
                totalWt += ele?.ServWt + ele?.Wt;
                if (ele?.Wt + ele?.ServWt !== 0) {
                    totalObj.pcs += ele?.Pcs;
                }
          
                let findMiscs = misc?.findIndex((elem, index) => elem?.ShapeName === ele?.ShapeName && elem?.ISHSCODE === ele?.ISHSCODE);
                if (findMiscs === -1) {
                    misc?.push(ele);
                } else {
                    misc[findMiscs].Wt += ele?.Wt;
                    misc[findMiscs].Pcs += ele?.Pcs;
                    misc[findMiscs].Amount += ele?.Amount;
                }
            });
            let finding = [];
            e?.finding?.forEach((ele, ind) => {
                totalWt += ele?.Wt;
                totalObj.pcs += ele?.Pcs;
                if (finding?.length === 0) {
                    finding?.push(ele);
                } else {
                    finding[0].Wt += ele?.Wt;
                    finding[0].Pcs += ele?.Pcs;
                    finding[0].Amount += ele?.Amount;
                }
            });
            totalWt += e?.MetalWeight;
            obj.netWtLossWt = netWtLossWt;
            obj.diamonds = diamonds;
            obj.colorstone = colorstone;
            obj.misc = misc;
            obj.secondaryWt = e?.MetalWeight;
            // obj.secondaryWt = (e?.NetWt - secondWt - e?.totals?.finding?.Wt);
            obj.secondaryWts = secondaryWt;
            obj.finding = finding;
            resultArray?.push(obj);

        });

        setTotalss({ ...totalss, totalWt: totalWt });

        datas.resultArray = resultArray;
        setFinalD(datas);

        setJsonData1(data?.BillPrint_Json[0]);

        // let taxValue = taxGenrator(data?.BillPrint_Json[0], totalObj.totalAmount);

        let taxValue = taxGenrator(
          data?.BillPrint_Json[0],
          totalObj?.total
        );
        
        console.log("TCL: loadData -> taxValue", taxValue);
        
        setTaxes(taxValue);
        taxValue.forEach((e, i) => {
            totalObj.grandTotal += +(e?.amount);
        });
        totalObj.grandTotal += totalObj.totalAmount + totalObj.addLess;
        totalObj.totalAmount = (totalObj.totalAmount).toFixed(2);
        totalObj.textInNumbers = toWords.convert(totalObj.grandTotal);

        datas?.resultArray?.sort((a, b) => {
            let nameA = a?.designno?.toLowerCase() + a?.SrJobno?.toLowerCase();
            let nameB = b?.designno?.toLowerCase() + b?.SrJobno?.toLowerCase();
            if (nameA < nameB) {
                return -1; // 'a' should come before 'b' in the sorted array
            }
            if (nameA > nameB) {
                return 1; // 'b' should come before 'a' in the sorted array
            }
            return 0;
        });

        setTotal(totalObj);
        setDataFill(datas);
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
        <>
            {loader ? <Loader /> : msg === "" ? <div className='container containerRetailPrint containerRetail1Prints pad_60_allPrint'>
                {/* print button */}
                <div className="d-flex w-100 justify-content-end align-items-baseline print_sec_sum4 no_break position-relative">
                    <div className="printBtn_sec text-end position-absolute printBtnRetailPrint">
                        <input type="button" className="btn_white blue me-0" value="Print" onClick={(e) => handlePrint(e)} />
                    </div>
                </div>
                {/* headline retail print */}
                <div className="px-1 no_break">
                    <div className='headlinepRetailPrint headlinepRetail1Print w-100 px-2 fw-bold'>
                        {jsonData1?.PrintHeadLabel}
                    </div>
                </div>
                {/* company address */}
                <div className="mt-2 px-1 d-flex no_break">
                    <div className="col-6">
                        <h6 className='fw-bold'>{jsonData1?.CompanyFullName}</h6>
                        <p className='ft_12_retail1Print'>{jsonData1?.CompanyAddress}</p>
                        <p className='ft_12_retail1Print'>{jsonData1?.CompanyAddress2}</p>
                        <p className='ft_12_retail1Print'>{jsonData1?.CompanyCity} {jsonData1?.CompanyPinCode} {jsonData1?.CompanyState} {jsonData1?.CompanyCountry}</p>
                        <p className='ft_12_retail1Print'>T {jsonData1?.CompanyTellNo} | TOLL FREE {jsonData1?.CompanyTollFreeNo}</p>
                        <p className='ft_12_retail1Print'>{jsonData1?.CompanyEmail} | {jsonData1?.CompanyWebsite}</p>
                        <p className='ft_12_retail1Print'>{jsonData1?.Company_VAT_GST_No} | {jsonData1?.Company_CST_STATE} - {jsonData1?.Company_CST_STATE_No} | PAN-{jsonData1?.Pannumber}</p>
                    </div>
                    <div className="col-6">
                        {/* <img src={jsonData1?.PrintLogo} alt="" className='retailPrintLogo d-block ms-auto' /> */}

                        {isImageWorking && (jsonData1?.PrintLogo !== "" &&
                            <img src={jsonData1?.PrintLogo} alt=""
                                className='retailPrintLogo d-block ms-auto'
                                onError={handleImageErrors} height={120} width={150} />)}
                    </div>
                </div>
                {/* bill to */}
                <div className="d-flex border mt-2 no_break justify-content-between">
                    <div className="py-2 px-1">
                        <p className='line_height_110 ft_12_retail1Print'>{jsonData1?.lblBillTo} </p>
                        <p className='fw-bold line_height_110'>{jsonData1?.CustName}</p>
                    </div>
                    <div className="p-1 position-relative pe-5">
                        <div className="d-flex">
                            <div className="" style={{ minWidth: "60px" }}>
                                <p className='fw-bold ft_12_retail1Print'>BILL NO</p>
                                <p className='fw-bold ft_12_retail1Print'>DATE</p>
                                <p className='fw-bold ft_12_retail1Print'>HSN</p>
                            </div>
                            <div className="" style={{ minWidth: "max-content" }}>
                                <p className='ft_12_retail1Print'>{jsonData1?.InvoiceNo}</p>
                                <p className='ft_12_retail1Print'>{jsonData1?.EntryDate}</p>
                                <p className='ft_12_retail1Print'>{jsonData1?.HSN_No}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* table */}
                <div className="d-flex mt-1 border no_break ft_12_retail1Print">
                    <div className="srNoRetailPrint border-end d-flex justify-content-center align-items-center">
                        <p className='fw-bold'>Sr#</p>
                    </div>
                    <div className="poductDiscriptionRetailPrint border-end d-flex justify-content-center align-items-center">
                        <p className='fw-bold'>Product Description</p>
                    </div>
                    <div className="materialDescriptionRetailPrint border-end">
                        <div className="border-bottom p-1 d-flex justify-content-center align-items-center">
                            <p className='fw-bold'>Material Description</p>
                        </div>
                        <div className="d-flex">
                            <div className={`${styles.Material} border-end d-flex justify-content-center align-items-center`}>
                                <p className='fw-bold'>Material</p>
                            </div>
                            <div className={`${styles.Qty} border-end d-flex justify-content-center align-items-center`}>
                                <p className='fw-bold'>Qty</p>
                            </div>
                            <div className={`${styles.Pcs} border-end d-flex justify-content-center align-items-center`}>
                                <p className='fw-bold'>Pcs</p>
                            </div>
                            <div className={`${styles.Wt} border-end d-flex justify-content-center align-items-center`}>
                                <p className='fw-bold'>Wt.</p>
                            </div>
                            {rate && <div className={`${pName === 'retail1 print' ? `rateRetailPrint1` : `rateRetailPrint border-end`} d-flex justify-content-center align-items-center`}>
                                <p className='fw-bold'>Rate</p>
                            </div>}
                            {pName !== 'retail1 print' && <div className={`${styles.Amount} d-flex justify-content-center align-items-center`}>
                                <p className='fw-bold'>Amount</p>
                            </div>}
                        </div>
                    </div>
                    <div className="makingRetailPrint border-end d-flex justify-content-center align-items-center">
                        <p className='fw-bold'>Making</p>
                    </div>
                    <div className="othersRetailPrint border-end d-flex justify-content-center align-items-center">
                        <p className='fw-bold'>Others</p>
                    </div>
                    <div className={`${styles?.total} d-flex justify-content-center align-items-center`}>
                        <p className='fw-bold'>Total</p>
                    </div>
                </div>
                {/* data */}
                {dataFill?.resultArray?.map((e, i) => {
                    return <div className="d-flex border-start border-end no_break ft_12_retail1Print" key={i}>
                        <div className="srNoRetailPrint border-bottom border-end p-1 d-flex justify-content-center align-items-center">
                            <p className='fw-bold'>{NumberWithCommas(i + 1, 0)}</p>
                        </div>
                        <div className="poductDiscriptionRetailPrint border-bottom border-end p-1">
                            <p>{e?.SubCategoryname} {e?.Categoryname} </p>
                            <img src={e?.DesignImage} alt="" className='w-100 product_image_retailPrint' onError={handleImageError} />
                            <p className='text-center fw-bold pt-1'>{fixedValues(e?.grosswt, 3)} gm <span className='fw-normal'>Gross</span></p>
                        </div>
                        <div className="materialDescriptionRetailPrint border-end">
                            <div className="d-grid h-100">
                                {
                                    e?.metal?.map((ele, ind) => {
                                        return ele?.IsPrimaryMetal === 1 && <div className={`d-flex border-bottom`} key={ind}>
                                            <div className={`${styles.Material} border-end p-1 d-flex align-items-center`}>
                                                <p>{ele?.IsPrimaryMetal === 1 && ele?.ShapeName}</p>
                                            </div>
                                            <div className={`${styles.Qty} border-end p-1 d-flex align-items-center`}>
                                                <p>{ele?.IsPrimaryMetal === 1 && ele?.QualityName}</p>
                                            </div>
                                            <div className={`${styles.Pcs} border-end p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>{ }</p>
                                            </div>
                                            <div className={`${styles.Wt} border-end p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>
                                                    {NumberWithCommas(e?.secondaryWt, 3)}
                                                    {/* {ind === 0 ? NumberWithCommas(e?.netWtLossWt, 3) : NumberWithCommas(ele?.Wt, 3)} */}
                                                </p>
                                            </div>
                                            <div className={`${pName === 'retail1 print' ? `rateRetailPrint1` : `rateRetailPrint border-end`} p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>{NumberWithCommas(ele?.Rate / jsonData1?.CurrencyExchRate, 2)}</p>
                                            </div>
                                            {pName !== 'retail1 print' && <div className={`${styles.Amount} p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>{NumberWithCommas(ele?.Amount / jsonData1?.CurrencyExchRate, 2)}</p>
                                            </div>}
                                        </div>
                                    })
                                }
                                {
                                    e?.diamonds?.map((ele, ind) => {
                                        return <div className={`d-flex border-bottom`} key={ind}>
                                            <div className={`${styles.Material} border-end p-1 d-flex align-items-center`}>
                                                <p>{ele?.MasterManagement_DiamondStoneTypeName}</p>
                                            </div>
                                            <div className={`${styles.Qty} border-end p-1 d-flex align-items-center`}>
                                                <p></p>
                                            </div>
                                            <div className={`${styles.Pcs} border-end p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>{NumberWithCommas(ele?.Pcs, 0)}</p>
                                            </div>
                                            <div className={`${styles.Wt} border-end p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>{NumberWithCommas(ele?.Wt, 3)}</p>
                                            </div>
                                            {rate && <div className={`${pName === 'retail1 print' ? `rateRetailPrint1` : `rateRetailPrint border-end`} p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>{ele?.Wt !== 0 ? NumberWithCommas(((ele?.Amount / jsonData1?.CurrencyExchRate) / ele?.Wt), 2) : "0.00"}</p>
                                            </div>}
                                            {pName !== 'retail1 print' && <div className={`${styles.Amount} p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>{NumberWithCommas(ele?.Amount / jsonData1?.CurrencyExchRate, 2)}</p>
                                            </div>}
                                        </div>
                                    })
                                }
                                {
                                    e?.colorstone?.map((ele, ind) => {
                                        return <div className={`d-flex border-bottom`} key={ind}>
                                            <div className={`${styles.Material} border-end p-1 d-flex align-items-center`}>
                                                <p>{ele?.MasterManagement_DiamondStoneTypeName}</p>
                                            </div>
                                            <div className={`${styles.Qty} border-end p-1 d-flex align-items-center`}>
                                                <p></p>
                                            </div>
                                            <div className={`${styles.Pcs} border-end p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>{NumberWithCommas(ele?.Pcs, 0)}</p>
                                            </div>
                                            <div className={`${styles.Wt} border-end p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>{NumberWithCommas(ele?.Wt, 3)}</p>
                                            </div>
                                            {rate && <div className={`${pName === 'retail1 print' ? `rateRetailPrint1` : `rateRetailPrint border-end`} p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>{ele?.isRateOnPcs === 0 ?
                                                    (ele?.Wt !== 0 ? NumberWithCommas(ele?.Amount / (ele?.Wt * jsonData1?.CurrencyExchRate), 2) : "0.00") :
                                                    (ele?.Pcs !== 0 ? NumberWithCommas(ele?.Amount / (ele?.Pcs * jsonData1?.CurrencyExchRate), 2) : "0.00")}</p>
                                            </div>}
                                            {pName !== 'retail1 print' && <div className={`${styles.Amount} p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>{NumberWithCommas((ele?.Amount / jsonData1?.CurrencyExchRate), 2)}</p>
                                            </div>}
                                        </div>
                                    })
                                }
                                {
                                    e?.misc?.map((ele, ind) => {
                                        return (ele?.Wt !== 0 || ele?.ServWt !== 0) && <div className={`d-flex border-bottom`} key={ind}>
                                            <div className={`${styles.Material} border-end p-1 d-flex align-items-center`}>
                                                <p>{ele?.MasterManagement_DiamondStoneTypeName}</p>
                                            </div>
                                            <div className={`${styles.Qty} border-end p-1 d-flex align-items-center`}>
                                                <p></p>
                                            </div>
                                            <div className={`${styles.Pcs} border-end p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>{NumberWithCommas(ele?.Pcs, 0)}</p>
                                            </div>
                                            <div className={`${styles.Wt} border-end p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>{ele?.IsHSCOE === 0 ? NumberWithCommas(ele?.Wt, 3) : NumberWithCommas(ele?.ServWt, 3)}</p>
                                            </div>
                                            {rate && <div className={`${pName === 'retail1 print' ? `rateRetailPrint1` : `rateRetailPrint border-end`} p-1 d-flex align-items-center justify-content-end`}>
                                                {/* <p className='text-end'>{ele?.Wt !== 0 ? NumberWithCommas((ele?.Amount / ele?.Wt), 2) : "0.00"}</p> */}
                                                <p className='text-end'>{ele?.isRateOnPcs === 0  ? 
                                                (ele?.Wt !== 0 ? NumberWithCommas((ele?.Amount / ele?.Wt) / jsonData1?.CurrencyExchRate, 2) : "0.00") :
                                                (ele?.Pcs !== 0 ? NumberWithCommas((ele?.Amount / ele?.Pcs) / jsonData1?.CurrencyExchRate, 2) : "0.00")
                                                }</p>
                                            </div>}
                                            {pName !== 'retail1 print' && <div className={`${styles.Amount} p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>{NumberWithCommas((ele?.Amount / jsonData1?.CurrencyExchRate) / jsonData1?.CurrencyExchRate, 2)}</p>
                                            </div>}
                                        </div>
                                    })
                                }
                                {
                                    e?.finding?.map((ele, ind) => {
                                        return <div className={`d-flex border-bottom`} key={ind}>
                                            <div className={`${styles.Material} border-end p-1 d-flex align-items-center`}>
                                                <p></p>
                                            </div>
                                            <div className={`${styles.Qty} border-end p-1 d-flex align-items-center`}>
                                                <p></p>
                                            </div>
                                            <div className={`${styles.Pcs} border-end p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>{NumberWithCommas(ele?.Pcs, 0)}</p>
                                            </div>
                                            <div className={`${styles.Wt} border-end p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'>{NumberWithCommas(ele?.Wt, 3)}</p>
                                            </div>
                                            {rate && <div className={`${pName === 'retail1 print' ? `rateRetailPrint1` : `rateRetailPrint border-end`} p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'></p>
                                            </div>}
                                            {pName !== 'retail1 print' && <div className={`${styles.Amount} p-1 d-flex align-items-center justify-content-end`}>
                                                <p className='text-end'></p>
                                            </div>}
                                        </div>
                                    })
                                }
                                {e?.secondaryWts !== 0 && <div className={`d-flex border-bottom`} >
                                    <div className={`${styles.Material} border-end p-1 d-flex align-items-center`}>
                                        <p></p>
                                    </div>
                                    <div className={`${styles.Qty} border-end p-1 d-flex align-items-center`}>
                                        <p></p>
                                    </div>
                                    <div className={`${styles.Pcs} border-end p-1 d-flex align-items-center justify-content-end`}>
                                        <p className='text-end'>{ }</p>
                                    </div>
                                    <div className={`${styles.Wt} border-end p-1 d-flex align-items-center justify-content-end`}>
                                        <p className='text-end'>
                                            {NumberWithCommas(e?.secondaryWts, 3)}
                                        </p>
                                    </div>
                                    <div className={`${pName === 'retail1 print' ? `rateRetailPrint1` : `rateRetailPrint border-end`} p-1 d-flex align-items-center justify-content-end`}>
                                        <p className='text-end'></p>
                                    </div>
                                    {pName !== 'retail1 print' && <div className={`${styles.Amount} p-1 d-flex align-items-center justify-content-end`}>
                                        <p className='text-end'></p>
                                    </div>}
                                </div>
                                }


                            </div>
                        </div>
                        <div className={`makingRetailPrint border-bottom border-end p-1 d-flex ${pName === "retail print 1" ? `flex-column align-items-end justify-content-center` : `align-items-center justify-content-end `}`}>
                            <p className='text-end'>{NumberWithCommas(e?.MaKingCharge_Unit / jsonData1?.CurrencyExchRate, 2)}</p>
                            {/* <p className='text-end'>{NumberWithCommas(e?.MakingAmount + e?.SettingAmount, 2)}</p> */}

                        </div>
                        <div className="othersRetailPrint border-bottom border-end p-1 d-flex align-items-center justify-content-end">
                            <p className='text-end'>{NumberWithCommas((e?.OtherCharges + e?.TotalDiamondHandling+e?.MiscAmount) / jsonData1?.CurrencyExchRate, 2)}</p>
                        </div>
                        <div className={`${styles?.total} border-bottom p-1 d-flex align-items-center justify-content-end`}>
                            <p className='text-end'>{NumberWithCommas(e?.TotalAmount / jsonData1?.CurrencyExchRate, 2)}</p>
                        </div>
                    </div>
                })}
                {/* total */}
                <div className="d-flex border-bottom border-start border-end no_break">
                    <div className="srNoRetailPrint border-end p-1 d-flex justify-content-center align-items-center">
                    </div>
                    <div className="poductDiscriptionRetailPrint border-end p-1 d-flex align-items-center">
                        <p className="fw-bold ft_17_retailPrint">TOTAL</p>
                    </div>
                    <div className="materialDescriptionRetailPrint border-end">
                        <div className="d-flex">
                            <div className={`${styles.Material} border-end p-1 min_height_44_retail_print_1 ft_12_retail1Print`}>
                                <p className='fw-bold'></p>
                            </div>
                            <div className={`${styles.Qty} border-end p-1 min_height_44_retail_print_1 ft_12_retail1Print`}>
                                <p className='fw-bold'></p>
                            </div>
                            <div className={`${styles.Pcs} border-end p-1 text-end d-flex align-items-center justify-content-end min_height_44_retail_print_1 ft_12_retail1Print`}>
                                <p className='fw-bold text-end'>{NumberWithCommas(total?.pcs, 0)}</p>
                            </div>
                            <div className={`${styles.Wt} border-end p-1 d-flex align-items-end justify-content-around flex-column min_height_44_retail_print_1 ft_12_retail1Print`}>
                                <p className='fw-bold lh-1 text-end'>{fixedValues(totalss?.totalWt, 3)} </p>
                                {/* <p className='fw-bold lh-1 text-end'>{fixedValues(total?.goldWeight, 3)} gm</p> */}
                            </div>
                            {rate && <div className={`${pName === 'retail1 print' ? `rateRetailPrint1` : `rateRetailPrint border-end`} p-1 d-flex align-items-center justify-content-end min_height_44_retail_print_1 ft_12_retail1Print`}>
                                <p className='fw-bold text-end'>
                                    {/* {NumberWithCommas(total?.rate, 2)} */}
                                </p>
                            </div>}
                            {pName !== 'retail1 print' && <div className={`${styles.Amount} p-1 d-flex align-items-center justify-content-end min_height_44_retail_print_1 ft_12_retail1Print`}>
                                <p className='fw-bold text-end'>
                                    {/* {NumberWithCommas(total?.amount, 2)} */}
                                </p>
                            </div>}
                        </div>
                    </div>
                    <div className="makingRetailPrint border-end p-1 d-flex align-items-center justify-content-end ft_12_retail1Print">
                        <p className='fw-bold text-end'>
                            {/* {NumberWithCommas(total?.making, 2)} */}
                        </p>
                    </div>
                    <div className="othersRetailPrint border-end p-1 d-flex align-items-center justify-content-end ft_12_retail1Print">
                        <p className='fw-bold text-end'>{NumberWithCommas(dataFill?.mainTotal?.total_otherCharge_Diamond_Handling / jsonData1?.CurrencyExchRate, 2)}</p>
                    </div>
                    <div className={`${styles?.total} p-1 d-flex align-items-center justify-content-end ft_12_retail1Print`}>
                        <p className='fw-bold text-end'>{NumberWithCommas(dataFill?.mainTotal?.total_amount / jsonData1?.CurrencyExchRate, 2)}</p>
                    </div>
                </div>
                {/* grand total */}
                <div className="d-flex border-start border-end border-bottom no_break">
                    {/* <div className="totalInWordsRetailPrint p-1 d-flex flex-column align-items-start justify-content-end p-1 border-end"> */}
                    <div className="retail1PrintInWords p-1 d-flex flex-column align-items-start justify-content-end p-1 border-end">
                        <p className='ft_12_retail1Print'>In Words {jsonData1?.Currencyname}</p>
                        <p className='fw-bold ft_12_retail1Print'>{NumToWord(+fixedValues(
                            +(fixedValues(dataFill?.mainTotal?.total_amount / jsonData1?.CurrencyExchRate, 2)) +
                            taxes?.reduce((acc, cObj) => acc + +(fixedValues(+cObj?.amount / jsonData1?.CurrencyExchRate, 2)), 0) +
                            (+fixedValues(jsonData1?.AddLess / jsonData1?.CurrencyExchRate, 2)), 2))} </p>
                    </div>
                    {/* <div className="cgstRetailPrint p-1 text-end p-1 border-end"> */}
                    <div className="retail1PrintInNumbers py-1 text-end border-end ft_12_retail1Print">
                        {taxes.length > 0 && taxes.map((e, i) => {
                            return <p key={i} className='pb-1 px-1'>{e?.name} @ {e?.per}</p>
                        })}
                        {jsonData1?.AddLess !== 0 && <p className='ft_12_retail1Print px-1'>{jsonData1?.AddLess > 0 ? "Add" : "Less"}</p>}
                        <p className='fw-bold py-1 border-top ft_12_retail1Print px-1'>GRAND TOTAL</p>
                    </div>
                    {/* <div className="totalRetailPrint p-1 text-end p-1"> */}
                    <div className="retail1PrintInNumbers1 py-1 text-end ft_12_retail1Print">
                        {taxes.length > 0 && taxes.map((e, i) => {
                            return <p key={i} className='pb-1 px-1'>{NumberWithCommas(+e?.amount / jsonData1?.CurrencyExchRate, 2)}</p>
                        })}
                        {jsonData1?.AddLess !== 0 && <p className='ft_12_retail1Print px-1'>{NumberWithCommas(jsonData1?.AddLess / jsonData1?.CurrencyExchRate, 2)}</p>}
                        <p className='fw-bold py-1 border-top ft_12_retail1Print px-1'><span dangerouslySetInnerHTML={{ __html: jsonData1?.Currencysymbol }}></span>
                            {NumberWithCommas(+(fixedValues(dataFill?.mainTotal?.total_amount / jsonData1?.CurrencyExchRate, 2)) +
                                taxes?.reduce((acc, cObj) => acc + +(fixedValues(+cObj?.amount / jsonData1?.CurrencyExchRate, 2)), 0) +
                                (+fixedValues(jsonData1?.AddLess / jsonData1?.CurrencyExchRate, 2)), 2)}
                        </p>
                    </div>
                </div>
                {/* note */}
                <div className="note border-start border-end border-bottom p-1 pb-3 no_break">
                    <div dangerouslySetInnerHTML={{ __html: jsonData1?.Declaration }} className='pt-2'></div>
                </div>
                <div className='note border-start border-end border-bottom p-1 no_break'>
                    <p><span className="fw-bold">REMARKS : </span> <span dangerouslySetInnerHTML={{__html:jsonData1?.PrintRemark}}></span> </p>
                </div>
                {/* bank detail */}
                <div className="word_break_normal_retail_print d-flex border-start border-end border-bottom no_break ft_12_retail1Print">
                    <div className="col-4 p-2 border-end">
                        <p className='fw-bold'>Bank Detail</p>
                        <p>Bank Name: {jsonData1?.bankname}</p>
                        <p>Branch: {jsonData1?.bankaddress}</p>
                        <p>{jsonData1?.customercity1}-{jsonData1?.PinCode}</p>
                        <p>Account Name: {jsonData1?.accountname}</p>
                        <p>Account No. : {jsonData1?.accountnumber}</p>
                        <p>RTGS/NEFT IFSC: {jsonData1?.rtgs_neft_ifsc}</p>
                    </div>
                    <div className="col-4 border-end d-flex flex-column justify-content-between p-2">
                        <p>Signature</p>
                        <p className='fw-bold'>{jsonData1?.customerfirmname}</p>
                    </div>
                    <div className="col-4 d-flex flex-column justify-content-between p-2">
                        <p>Signature</p>
                        <p className='fw-bold'>{jsonData1?.CompanyFullName}</p>
                    </div>
                </div>
            </div> : <p className='text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto'>{msg}</p>}
        </>
    )
}

export default Retail1Print
