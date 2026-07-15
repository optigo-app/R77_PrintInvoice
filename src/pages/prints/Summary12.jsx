
import React, { useEffect, useState } from 'react';
// import "../../assets/css/prints/summary4.css";
import { NumberWithCommas, apiCall, checkMsg, fixedValues, handleImageError, handlePrint, isObjectEmpty, taxGenrator } from '../../GlobalFunctions';
import Loader from '../../components/Loader';
import { usePDF } from 'react-to-pdf';
import html2pdf from 'html2pdf.js';
import '../../assets/css/prints/summary12.css';
import { MetalShapeNameWiseArr } from '../../GlobalFunctions/MetalShapeNameWiseArr';
const Summary12 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
    const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' });

    const [billPrintJson, setBillprintJson] = useState({});
    const [BillPrintJson1, setBillPrintJson1] = useState([]);
    const [summaryDetail, setSummaryDetail] = useState([]);
    const [total, setTotal] = useState({
        diaWt: 0,
        diaRate: 0,
        diaAmt: 0,
        gwt: 0,
        nwt: 0,
        otherAmt: 0,
        csWt: 0,
        csRate: 0,
        csAmt: 0,
        goldFine: 0,
        goldAmt: 0,
        amount: 0,
        gold24Kt: 0,
        afterTaxAmt: 0,
        metalAmount: 0
    });
    const [isImageWorking, setIsImageWorking] = useState(true);
    const handleImageErrors = () => {
        setIsImageWorking(false);
    };
    const [header, setHeader] = useState(true);
    const [image, setimage] = useState(true);
    const [summary, setSummary] = useState(false);
    const [metalType, setMetaltype] = useState([]);
    const [totalSummary, setTotalSummary] = useState({
        totalMetalAmount: 0,
        gold24Kt: 0,
        gDWt: 0,
        diamondpcs: 0,
        colorStonePcs: 0,
        makingAmount: 0
    });
    const [metaltypeSum, setMetaltypeSum] = useState({
        grosswt: 0,
        NetWt: 0,
        pureWt: 0,
        MetalAmount: 0,
        fineWt: 0
    });
    const [lastDiamondTable, setLastDiamondTable] = useState([]);
    const [lastColorStoneTable, setLastColorStoneTable] = useState([]);
    const [lastDiamondTableTotal, setLastDiamondTableTotal] = useState({
        diaCtw: 0,
        diamondAmount: 0
    });
    const [lastColorStoneTableTotal, setLastColorStoneTableTotal] = useState({
        clrCtw: 0,
        colorStoneAmount: 0
    });

    const [saleReturn, setSaleReturn] = useState(atob(evn)?.toLowerCase() === "sale return" ? true : false);
    const [loader, setLoader] = useState(true);
    const [taxes, setTaxes] = useState([]);
    const [msg, setMsg] = useState("");

    const [MetShpWise, setMetShpWise] = useState([]);
    const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
    const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);

    const findMaterialWise = (findElement, elementNo, arr) => {
        let resultArr = arr?.filter((e, i) => {
            return e[findElement] === elementNo
        });
        return resultArr
    }

    const findMaterial = (serialJobNo, json2Arr) => {
        let findArr = findMaterialWise("StockBarcode", serialJobNo, json2Arr);
        return findArr
    }

    const findKeyValuePair = (array, firstName, secondName) => {
        const counts = {};
        array?.forEach(item => {
            const key = `${item[firstName]} | ${item[secondName]}`;
            counts[key] = (counts[key] || 0) + 1;
        });
        return counts;
    }

    const countCategorySubCategory = (data) => {
        let countArr = findKeyValuePair(data, "Categoryname", "SubCategoryname");
        Object.keys(countArr)?.forEach(key => {
            const [category, subcategory] = key.split('|');
            if (!subcategory) {
                delete countArr[category];
            }
        });

        const countsArray = Object.entries(countArr)
            .filter(([key, value]) => key.includes('|')) // Filter out single category entries
            .map(([key, value]) => ({ name: key, value }));

        setSummaryDetail(countsArray);
    }

    const countDiamondRate = (materialId, arr) => {
        let findArr = findMaterialWise("MasterManagement_DiamondStoneTypeid", materialId, arr);
        const rateSumMap = {};
        findArr.forEach(item => {
            const { Rate, Wt, Amount } = item;
            if (!rateSumMap[Rate]) {
                rateSumMap[Rate] = {
                    totalWeight: 0,
                    totalAmount: 0
                };
            }
            rateSumMap[Rate].totalWeight += Wt;
            rateSumMap[Rate].totalAmount += Amount;
        });

        const result = Object.keys(rateSumMap).map(rate => ({
            rate: rate,
            totalWeight: (rateSumMap[rate].totalWeight).toFixed(3),
            totalAmount: (rateSumMap[rate].totalAmount).toFixed(3)
        }));
        return result
    }

    const countTotalAmount = (arr) => {
        const totalSum = arr.reduce((sum, item) => sum + item.Amount + item.SettingAmount, 0);
        return (totalSum).toFixed(2);
    }

    const countTotal = (arr, taxJson) => {
        let resultObj = { ...total };
        arr.forEach((e, i) => {
            if (e?.diamondsRate.length > 0) {
                e?.diamondsRate.forEach((ele, ind) => {
                    resultObj.diaRate += +(ele.rate);
                    resultObj.diaWt += +(ele.totalWeight);
                    resultObj.diaAmt += +(ele.totalAmount);
                });
            }
            if (e?.colorStoneRate.length > 0) {
                e?.colorStoneRate.forEach((ele, ind) => {
                    resultObj.csRate += +(ele.rate);
                    resultObj.csWt += +(ele.totalWeight);
                    resultObj.csAmt += +(ele.totalAmount);
                })
            }
            resultObj.gwt += e?.grosswt;
            resultObj.nwt += e?.MetalDiaWt;
            resultObj.otherAmt += e?.OtherCharges;

            if (e.MetalAmount !== 0) {
                resultObj.goldFine += 0.000;
            } else {
                // resultObj.goldFine += +((e?.Tunch * e?.NetWt / 100)?.toFixed(3));
                resultObj.goldFine += e?.convertednetwt;
            }
            resultObj.goldAmt += e?.MetalAmount;
            resultObj.amount += +(e?.TotalAmount);
        })
        resultObj.diaWt = +((resultObj.diaWt).toFixed(3));
        let taxValue = taxGenrator(taxJson, resultObj.amount);
        setTaxes(taxValue);
        taxValue.length > 0 && taxValue.forEach((e, i) => {
            resultObj.afterTaxAmt += +(e?.amount);
        });
        resultObj.afterTaxAmt += resultObj.amount + taxJson?.AddLess;
        resultObj.afterTaxAmt = (resultObj.afterTaxAmt).toFixed(2);
        // resultObj.afterTaxAmt = (resultObj.amount + sgstMinus + cgstMinus + igstMinus - Math.abs(taxJson?.AddLess)).toFixed(2);
        setTotal(resultObj);
    }

    const lastDiamondTableFunc = (materialId, arr, json1Arr) => {
        let findArr = findMaterialWise("MasterManagement_DiamondStoneTypeid", materialId, arr);
        const rateSumMap = {};
        if (materialId === 1) {
            findArr?.forEach(item => {
                const { Rate, Wt, Amount } = item;
                let record = json1Arr?.find((e, i) => e.SrJobno === item?.StockBarcode);
                if (!rateSumMap[Rate]) {
                    rateSumMap[Rate] = {
                        totalWeight: 0,
                        totalAmount: 0,
                        name: "DIAMOND",
                        discount: record.Discount
                    };
                }
                rateSumMap[Rate].totalWeight += Wt;
                rateSumMap[Rate].totalAmount += Amount;
                rateSumMap[Rate].name = "DIAMOND";
                rateSumMap[Rate].discount = record.Discount;
            });
            const result = Object.keys(rateSumMap).map(rate => ({
                rate: rate,
                totalWeight: (rateSumMap[rate].totalWeight).toFixed(3),
                totalAmount: (rateSumMap[rate].totalAmount).toFixed(2),
                name: "DIAMOND",
                discount: rateSumMap[rate].discount
            }));
            let obj = { ...lastDiamondTableTotal };
            result.forEach((e, i) => {
                obj.diaCtw += +(e?.totalWeight);
                obj.diamondAmount += +(e?.totalAmount);
            });
            obj.diamondAmount = (obj.diamondAmount).toFixed(2)
            setLastDiamondTableTotal(obj)
            setLastDiamondTable(result);
        }
        if (materialId === 2) {
            findArr?.forEach(item => {
                const { Rate, Wt, Amount } = item;
                let record = json1Arr.find((e, i) => e.SrJobno === item?.StockBarcode);
                if (!rateSumMap[Rate]) {
                    rateSumMap[Rate] = {
                        totalWeight: 0,
                        totalAmount: 0,
                        name: "COLOR STONE",
                        discount: record.Discount
                    };
                }
                rateSumMap[Rate].totalWeight += Wt;
                rateSumMap[Rate].totalAmount += Amount;
                rateSumMap[Rate].name = "COLOR STONE";
                rateSumMap[Rate].discount = record.Discount;
            });

            const result = Object.keys(rateSumMap).map(rate => ({
                rate: rate,
                totalWeight: (rateSumMap[rate].totalWeight).toFixed(3),
                totalAmount: (rateSumMap[rate].totalAmount).toFixed(2),
                name: "COLOR STONE",
                discount: rateSumMap[rate].discount
            }));
            let obj = { ...lastColorStoneTableTotal };
            result.forEach((e, i) => {
                obj.clrCtw += +(e?.totalWeight);
                obj.colorStoneAmount += +(e?.totalAmount);
            });
            obj.colorStoneAmount = (obj.colorStoneAmount).toFixed(2);
            setLastColorStoneTableTotal(obj);
            setLastColorStoneTable(result);
        }

    }

    const loadData = (datas) => {
        setBillprintJson(datas?.BillPrint_Json[0]);

        let met_shp_arr = MetalShapeNameWiseArr(datas?.BillPrint_Json2);
      
        setMetShpWise(met_shp_arr);
        let tot_met = 0;
        let tot_met_wt = 0;
        met_shp_arr?.forEach((e, i) => {
          tot_met += e?.Amount;
          tot_met_wt += e?.metalfinewt;
        })    
        setNotGoldMetalTotal(tot_met);
        setNotGoldMetalWtTotal(tot_met_wt);

        let json1Arr = [];
        datas?.BillPrint_Json1?.forEach((e, i) => {
            let findMaterials = findMaterial(e.SrJobno, datas.BillPrint_Json2);
            let diamondsRate = countDiamondRate(1, findMaterials);
            let colorStoneRate = countDiamondRate(2, findMaterials);
            let totalAmount = countTotalAmount(findMaterials);
            let obj = { ...e };
            obj.fineWt = (obj?.Tunch * obj?.NetWt / 100)?.toFixed(3);
            obj.diamondsRate = diamondsRate;
            obj.colorStoneRate = colorStoneRate;
            obj.totalAmount = totalAmount;
            obj.OtherCharges += obj?.MiscAmount + obj?.TotalDiamondHandling;
            json1Arr.push(obj);
        });
        countCategorySubCategory(datas?.BillPrint_Json1);
        setBillPrintJson1(json1Arr);
        countTotal(json1Arr, datas?.BillPrint_Json[0]);
        let result = [];
        let gDWt = 0;
        let nWt = 0
        let makingAmount = 0;
        json1Arr.forEach(obj => {
            let diaWt = 0;
            obj?.diamondsRate.length > 0 && obj?.diamondsRate.forEach((e, i) => {
                diaWt += +(e?.totalWeight);
                gDWt += +(e?.totalWeight);
            });
            const key1Value = obj?.MetalTypePurity;
            const key2Value = obj?.convertednetwt;
            // const key2Value = obj?.Tunch * obj?.NetWt / 100;
            const key3Value = diaWt;
            const key4Value = obj?.grosswt;
            const key5Value = obj?.NetWt + obj?.LossWt;
            const key6Value = obj?.MetalAmount;
            const key7Value = obj?.Tunch;
            // const key8Value = +((obj?.Tunch * obj?.NetWt / 100).toFixed(3));
            const key8Value = +((obj?.PureNetWt).toFixed(3));
            const foundIndex = result.findIndex(item => item.metalType === key1Value);
            nWt += obj?.NetWt;
            makingAmount += obj.MakingAmount;
            if (foundIndex === -1) {
                result.push({ metalType: key1Value, fineWt: key2Value, diaWt: key3Value, grosswt: key4Value, NetWt: key5Value, MetalAmount: key6Value, tunch: key7Value, pureWt: key8Value });
            } else {
                result[foundIndex].fineWt += key2Value;
                result[foundIndex].diaWt += key3Value;
                result[foundIndex].grosswt += key4Value;
                result[foundIndex].NetWt += key5Value;
                result[foundIndex].MetalAmount += key6Value;
                result[foundIndex].tunch = key7Value;
                result[foundIndex].pureWt += key8Value;
            }
        });
        // let findGold24K = result.reduce((sum, item) => sum + item?.fineWt, 0)
        let findGold24K = json1Arr.reduce((sum, item) => sum + item?.PureNetWt, 0)
        let totMAMT = result.reduce((sum, item) => sum + item?.totalMetalAmount, 0)
        let obj = { ...totalSummary };
        obj.totalMetalAmount = totMAMT;
        obj.gold24Kt = findGold24K;
        obj.gDWt = ((+((gDWt).toFixed(3)) / 5) + nWt).toFixed(3);
        obj.makingAmount = makingAmount;
        let diamondPcs = 0;
        let colorStonePcs = 0;
        datas?.BillPrint_Json2?.forEach((e, i) => {
            if (e?.MasterManagement_DiamondStoneTypeid === 1) {
                diamondPcs += e.Pcs;
            }
            if (e?.MasterManagement_DiamondStoneTypeid === 2) {
                colorStonePcs += e.Pcs;
            }
        });
        obj.diamondpcs = diamondPcs;
        obj.colorStonePcs = colorStonePcs;
        setTotalSummary(obj);
        setMetaltype(result);
        let object = { ...metaltypeSum }
        result.forEach((e, i) => {
            object.grosswt += e?.grosswt;
            object.NetWt += e?.NetWt;
            object.pureWt += e?.pureWt;
            object.MetalAmount += e?.MetalAmount;
            object.fineWt += e?.fineWt;
        });
        setMetaltypeSum(object);
        lastDiamondTableFunc(1, datas?.BillPrint_Json2, json1Arr);
        lastDiamondTableFunc(2, datas?.BillPrint_Json2, json1Arr);

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
                    const err = checkMsg(data?.Message);
                    console.log(data?.Message);
                    setMsg(err);
                }
            } catch (error) {
                console.error(error);
            }
        }

        sendData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e, name) => {
        if (name === "header") {
            header ? setHeader(false) : setHeader(true);
        }
        if (name === "image") {
            image ? setimage(false) : setimage(true);
        }
        if (name === "summary") {
            summary ? setSummary(false) : setSummary(true);
        }
    }

    return (
        <>
            {loader ? <Loader /> :
                msg === "" ? <div className='zoom1_5_summary12 pad_60_allPrint'><div>
                    <div className="d-flex justify-content-end align-items-center print_sec_sum4 container max_width_container pt-4">
                        <div className="form-check pe-3">
                            <input className="form-check-input border-dark" type="checkbox" id='chbox' checked={header} onChange={e => handleChange(e, "header")} />
                            <label className="form-check-label" htmlFor='chbox'>
                                With Header
                            </label>
                        </div>
                        <div className="form-check pe-3">
                            <input className="form-check-input border-dark" type="checkbox" id='chbox1' checked={image} onChange={e => handleChange(e, "image")} />
                            <label className="form-check-label" htmlFor='chbox1'>
                                With Image
                            </label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input border-dark" type="checkbox" id='chbox2' checked={summary} onChange={e => handleChange(e, "summary")} />
                            <label className="form-check-label" htmlFor='chbox2'>
                                With Summary
                            </label>
                        </div>
                        <div className="form-check ps-3">
                            {/* <input type="button" className="btn_white blue me-3" value="Pdf" onClick={() => pdfGenerator()} /> */}
                            {/* <input type="button" className="btn_white blue me-3" value="Pdf" onClick={() => handleGeneratePdf()} /> */}
                            <input type="button" className="btn_white blue mt-0" value="Print" onClick={(e) => handlePrint(e)} />
                        </div>
                    </div>
                    <div className=' pt-2 pb-2  container max_width_container' ref={targetRef} id="divToPrint">
                        {header && <div className="d-flex header_section_sum4 justify-content-between align-items-center pb-2 no_break">
                            <div className='address_sum4'>
                                <h1 className='h1_sum4 fw-bold'>{billPrintJson?.CompanyFullName}</h1>
                                <p className='address_para_sum4 lh-1'> {billPrintJson?.CompanyAddress} </p>
                                <p className='address_para_sum4 lh-1'>{billPrintJson?.CompanyAddress2} </p>
                                <p className='address_para_sum4 lh-1'>{billPrintJson?.CompanyCity} {billPrintJson?.CompanyPinCode} {billPrintJson?.CompanyState} {billPrintJson?.CompanyCountry} </p>
                                <p className='address_para_sum4 lh-1'>T {billPrintJson?.CompanyTellNo} | TOLL FREE {billPrintJson?.CompanyTollFreeNo} </p>
                                <p className='address_para_sum4 lh-1'>{billPrintJson?.CompanyEmail} | {billPrintJson?.CompanyWebsite} </p>
                                <p className='address_para_sum4 lh-1'>{billPrintJson?.Company_VAT_GST_No} | {billPrintJson?.Company_CST_STATE}-{billPrintJson?.Company_CST_STATE_No} | PAN-{billPrintJson?.Pannumber} </p>
                            </div>
                            <div className="logo_sec_sum4">
                                {isImageWorking && (billPrintJson?.PrintLogo !== "" &&
                                    <img src={billPrintJson?.PrintLogo} width="150px" alt=""
                                        // className={`${style2.headerImg}`}
                                        onError={handleImageErrors} />)}
                                {/* <img src={billPrintJson?.PrintLogo} alt="Logo" /> */}
                            </div>
                        </div>}
                        <div>
                            <div className="d-flex justify-content-between border-bottom p-2 border mt-2 no_break">
                                <div className="invoice_text_sum4">
                                    <h2 className='text-uppercase'> Estimate# : <span>{billPrintJson?.InvoiceNo}</span></h2>
                                </div>
                                <div className="invoice_text_sum4">
                                    <h2> DATE : <span>{billPrintJson?.EntryDate}</span></h2>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between p-2 border no_break">
                                <div className="address_line_sum4">
                                    <p>{billPrintJson?.lblBillTo}</p>
                                    <h3>{billPrintJson?.customerfirmname}</h3>
                                    <p>{billPrintJson?.customerAddress1}</p>
                                    <p>{billPrintJson?.customerAddress2}</p>
                                    <p>{billPrintJson?.customerAddress3}</p>
                                    <p>{billPrintJson?.customercity}-{billPrintJson?.PinCode}</p>
                                    <p>{billPrintJson?.customeremail1}</p>
                                    <p>{billPrintJson?.Cust_CST_STATE_No_}</p>
                                    <p>{billPrintJson?.vat_cst_pan}</p>
                                </div>
                                <div className="address_lines_sum4">
                                    <p> Gold Rate: <span>{NumberWithCommas(billPrintJson?.MetalRate24K, 2)}</span></p>
                                </div>
                            </div>
                            <div className="sum12_table">
                                <div className='d-flex border-bottom no_break'>
                                    <div className='p-1 fw-bold ps-2 border-start border-end align-middle text-center sr_sum4'>SR#</div>
                                    <div className='p-1 fw-bold border-end align-middle text-center design_sum12'>DESIGN</div>
                                    {/* <div className='p-1 fw-bold border-end align-middle text-center remark_sum4'>Remark</div> */}
                                    <div className='p-1 fw-bold border-end align-middle text-center dia_wt_ctw_sum4'>DIA WT <p>(ctw)</p></div>
                                    <div className='p-1 fw-bold border-end align-middle text-center dia_rate_sum4'><p>DIA </p> <p>RATE</p></div>
                                    <div className='p-1 fw-bold border-end align-middle text-center dia_amt_sum4'><p>DIA </p><p>AMT</p></div>
                                    <div className='p-1 fw-bold border-end align-middle text-center g_wt_sum4'><p>G WT</p><p>(gm)</p> </div>
                                    <div className='p-1 fw-bold border-end align-middle text-center nwt_sum4'><p>NWT</p><p>(gm)</p> </div>
                                    <div className='p-1 fw-bold border-end align-middle text-center other_amt_sum4'><p>Other </p><p>AMT</p></div>
                                    <div className='p-1 fw-bold border-end align-middle text-center cs_wt_sum4'><p>CS WT</p><p>(ctw)</p></div>
                                    <div className='p-1 fw-bold border-end align-middle text-center cs_rate_sum4'>CS RATE</div>
                                    <div className='p-1 fw-bold border-end align-middle text-center cs_amt_sum4'>CS AMT</div>
                                    <div className='p-1 fw-bold border-end align-middle text-center gold_fine_sum4'><p>GOLD </p><p>FINE </p><p>(gm)</p></div>
                                    <div className='p-1 fw-bold border-end align-middle text-center gold_amt_sum4'><p>GOLD </p><p>AMT</p></div>
                                    <div className='p-1 fw-bold pe-2 border-end align-middle text-center amount_sum_4'>AMOUNT</div>
                                </div>
                                {BillPrintJson1.length > 0 && BillPrintJson1.map((e, i) => {

                                    return <div className="d-flex border-bottom no_break" key={i}>
                                        <div className='p-1 ps-2 sr_sum4 border-start border-end sr_sum4'> <p> {NumberWithCommas(e?.SrNo)} </p> </div>
                                        <div className='p-1 design_sum12 border-end'>
                                            <div className="d-flex flex-wrap">
                                                <p className="fw-bold pe-2">{(e?.designno)}</p>
                                                <p className='fw-bold pe-2'> {e?.SrJobno} </p>
                                                <p className='fw-bold'>{e?.MetalTypePurity}</p>
                                            </div>
                                            {/* <p className="fw-bold">{e?.Categoryname}</p> */}
                                            {image && <img src={e?.DesignImage} className='imgWidth' alt="" onError={e => handleImageError(e)} />}

                                            {e?.HUID !== "" && <p className='fw-bold'> HUID No. : {e?.HUID}</p>}
                                        </div>
                                        {/* <div className="p-1 remark_sum4 border-end text-end remark_sum4"> <p> {e?.CertRemark} </p> </div> */}
                                        <div className="p-1 dia_wt_ctw_sum4 border-end text-end "> {e?.diamondsRate.length > 0 && e.diamondsRate.map((ele, indd) => {
                                            return <p key={indd}>{fixedValues(ele?.totalWeight, 3)}</p>
                                        })}</div>
                                        <div className="p-1 dia_rate_sum4 border-end text-end "> {e?.diamondsRate.length > 0 && e.diamondsRate.map((ele, indd) => {
                                            return <p key={indd}>{NumberWithCommas(+(ele?.rate), 2)}</p>
                                        })}</div>
                                        <div className="p-1 dia_amt_sum4 border-end text-end "> {
                                            e?.diamondsRate.length > 0 && e.diamondsRate.map((ele, indd) => {
                                                return <p key={indd}>{NumberWithCommas(+(ele?.totalAmount), 2)}</p>
                                            })
                                        } </div>
                                        <div className="p-1 g_wt_sum4 border-end text-end "> <p> {fixedValues((e?.grosswt), 3)} </p> </div>
                                        <div className="p-1 nwt_sum4 border-end text-end "> <p> {fixedValues((e?.MetalDiaWt), 3)} </p> </div>
                                        <div className="p-1 other_amt_sum4 border-end text-end "> <p> {NumberWithCommas((e?.OtherCharges), 2)} </p> </div>
                                        <div className="p-1 cs_wt_sum4 border-end text-end ">{e?.colorStoneRate.length > 0 && e.colorStoneRate.map((ele, indd) => {
                                            return <p key={indd}>{fixedValues(ele?.totalWeight, 3)}</p>
                                        })}</div>
                                        <div className="p-1 cs_rate_sum4 border-end text-end "> {e?.colorStoneRate.length > 0 && e.colorStoneRate.map((ele, indd) => {
                                            return <p key={indd}>{NumberWithCommas((+(ele?.rate)), 2)}</p>
                                        })} </div>
                                        <div className="p-1 cs_amt_sum4 border-end text-end "> {e?.colorStoneRate.length > 0 && e.colorStoneRate.map((ele, indd) => {
                                            return <p key={indd}>{NumberWithCommas(+(ele?.totalAmount), 2)}</p>
                                        })} </div>
                                        {/* <div className="p-1 gold_fine_sum4 border-end text-end "> <p> {billPrintJson?.MetalRate24K === 0 ? NumberWithCommas(e?.fineWt) : '0.000'} </p> </div> */}
                                        <div className="p-1 gold_fine_sum4 border-end text-end "> <p> {e?.MetalAmount === 0 ? fixedValues(e?.convertednetwt, 3) : '0.000'} </p> </div>
                                        <div className="p-1 gold_amt_sum4 border-end text-end "> <p> {NumberWithCommas(e?.MetalAmount, 2)} </p> </div>
                                        <div className="p-1 pe-2 amount_sum_4 border-end text-end">{NumberWithCommas(e?.TotalAmount, 2)}</div>
                                    </div>
                                })}
                                <div className="total_sec_sum4 d-flex border-bottom mb-1 no_break">
                                    <div className="p-1 ps-2 total_sum12 border-start border-end bg_total_sum4 fw-bold text-center">Total</div>
                                    {/* <div className="p-1 remark_sum4 border-end text-end bg_total_sum4 fw-bold remark_sum4"> <p>  </p> </div> */}
                                    <div className="p-1 dia_wt_ctw_sum4 border-end text-end bg_total_sum4 fw-bold "> <p> {fixedValues(total.diaWt, 3)} </p> </div>
                                    <div className="p-1 dia_rate_sum4 border-end text-end bg_total_sum4 fw-bold "> <p>  </p> </div>
                                    <div className="p-1 dia_amt_sum4 border-end text-end bg_total_sum4 fw-bold "> <p> {NumberWithCommas(total.diaAmt, 2)} </p> </div>
                                    <div className="p-1 g_wt_sum4 border-end text-end bg_total_sum4 fw-bold "> <p> {fixedValues(total.gwt, 3)} </p> </div>
                                    <div className="p-1 nwt_sum4 border-end text-end bg_total_sum4 fw-bold "> <p> {fixedValues(total.nwt, 3)} </p> </div>
                                    <div className="p-1 other_amt_sum4 border-end text-end  bg_total_sum4 fw-bold"> <p> {NumberWithCommas(total.otherAmt, 2)} </p> </div>
                                    <div className="p-1 cs_wt_sum4 border-end text-end bg_total_sum4 fw-bold "> <p> {fixedValues(total.csWt, 3)} </p> </div>
                                    <div className="p-1 cs_rate_sum4 border-end text-end  bg_total_sum4 fw-bold"></div>
                                    <div className="p-1 cs_amt_sum4 border-end text-end  bg_total_sum4 fw-bold"> <p> {NumberWithCommas(total.csAmt, 2)} </p> </div>
                                    <div className="p-1 gold_fine_sum4 border-end text-end  bg_total_sum4 fw-bold"> <p> {fixedValues(total.goldFine, 3)} </p> </div>
                                    <div className="p-1 gold_amt_sum4 border-end text-end  bg_total_sum4 fw-bold"> <p> {NumberWithCommas(total.goldAmt, 2)} </p> </div>
                                    <div className="p-1 pe-2 amount_sum_4 border-end text-end bg_total_sum4 fw-bold"> <p> {NumberWithCommas(total.amount, 2)} </p> </div>
                                </div>
                                <div className="d-flex mb-1 no_break">
                                    <div className="sgst_sec_sum4 border me-1">
                                        <div className="bg_total_sum4 fw-bold ps-2 border-bottom mb-2">
                                            Summary Detail
                                        </div>
                                        <div className="d-flex flex-wrap">
                                            {summaryDetail.length > 0 && summaryDetail.map((elem, ind) => {
                                                return <div className="amazon_sum4 d-flex ps-2 pb-2" key={ind}>
                                                    <div className="amazon_text_sum4">
                                                        {elem.name} :
                                                    </div>
                                                    <div className="amazon_number_sum4">
                                                        {NumberWithCommas(elem.value)}
                                                    </div>
                                                </div>
                                            })}
                                        </div>
                                    </div>
                                    <div className="sgst_part_sum4 border">

                                        {taxes.length > 0 && taxes.map((e, i) => {
                                            return <div className="d-flex justify-content-between px-2" key={i}>
                                                <div className="sgst_text_sum4 fw-bold">
                                                    {e?.name} @ {e?.per}
                                                </div>
                                                <div className="sgst_text_sum4 fw-bold">
                                                    {NumberWithCommas(e?.amount, 2)}
                                                </div>
                                            </div>
                                        })}

                                        {billPrintJson?.AddLess !== 0 && <div className="d-flex justify-content-between px-2">
                                            <div className="sgst_text_sum4 fw-bold">
                                                {billPrintJson?.AddLess > 0 ? 'ADD' : 'LESS'}
                                            </div>
                                            <div className="sgst_text_sum4 fw-bold">
                                                {NumberWithCommas(billPrintJson?.AddLess, 2)}
                                            </div>
                                        </div>}
                                    </div>
                                </div>
                                <div className="total_sgst_sum4 mt-1 w-100 border bg_total_sum4 mb-1 no_break d-flex">
                                    <div className="total_sgst_text_sum4">
                                        <p className='text-end fw-bold pe-2 pt-1'>TOTAL</p>
                                    </div>
                                    <div className="total_sgst_number_sum4">
                                        <div className="d-flex justify-content-between">
                                            <p className='ps-2'>CASH :</p>
                                            <p className='pe-2 fw-bold'>{NumberWithCommas(total?.afterTaxAmt, 2)}</p>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <p className='ps-2'>Gold in 24K :</p>
                                            <p className='pe-2 fw-bold'>{billPrintJson?.MetalRate24K === 0 ? fixedValues(total?.goldFine, 3) : '0.000'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex mb-1 no_break">
                                    <div className="summary_detail_sum4 border me-1">
                                        <div className="fw-bold border-bottom ps-2 bg_total_sum4 pt-1">
                                            SUMMARY
                                        </div>
                                        <div className="d-flex">
                                            <div className="gold_24kt_sum4 w-50 border-end">
                                                <div className="d-flex w-100">
                                                    <div className="w-50 fw-bold ps-2">GOLD IN 24KT	</div>
                                                    <div className="w-50 text-end pe-2">{fixedValues((totalSummary?.gold24Kt - notGoldMetalWtTotal), 3)} gm</div>
                                                </div>
                                                {
                                                    MetShpWise?.map((e, i) => {
                                                        return <div className="d-flex w-100" key={i}>
                                                                <div className="w-50 fw-bold ps-2">{e?.ShapeName}</div>
                                                                <div className="w-50 text-end pe-2">{NumberWithCommas(e?.metalfinewt, 3)} gm</div>
                                                            </div>
                                                            })
                                                        }
                                                <div className="d-flex w-100">
                                                    <div className="w-50 fw-bold ps-2">GROSS WT	</div>
                                                    <div className="w-50 text-end pe-2">{fixedValues(total?.gwt, 3)} gm	</div>
                                                </div>
                                                <div className="d-flex w-100">
                                                    <div className="w-50 fw-bold ps-2">*(G+D) WT</div>
                                                    {/* <div className="w-50 text-end pe-2">{fixedValues(totalSummary?.gDWt, 3)} gm	</div> */}
                                                    <div className="w-50 text-end pe-2">{fixedValues(((total.diaWt / 5) + total.nwt), 3)} gm	</div>
                                                </div>
                                                <div className="d-flex w-100">
                                                    <div className="w-50 fw-bold ps-2">NET WT </div>
                                                    <div className="w-50 text-end pe-2">{fixedValues(total?.nwt, 3)} gm</div>
                                                </div>
                                                <div className="d-flex w-100">
                                                    <div className="w-50 fw-bold ps-2">DIAMOND WT</div>
                                                    <div className="w-50 text-end pe-2">{NumberWithCommas(totalSummary?.diamondpcs, 0)} / {fixedValues(total?.diaWt, 3)} ctw</div>
                                                </div>
                                                <div className="d-flex w-100 mb-2">
                                                    <div className="w-50 fw-bold ps-2">STONE WT</div>
                                                    <div className="w-50 text-end pe-2">{NumberWithCommas(totalSummary?.colorStonePcs, 0)} / {fixedValues(total?.csWt, 3)} ctw</div>
                                                </div>

                                                <div className="d-flex w-100 bg_total_sum4 py-1">
                                                    {/* <div className="w-50 fw-bold ps-2"></div>
                                <div className="w-50 text-end pe-2">468 / 15.003 ctw</div> */}
                                                </div>
                                            </div>
                                            <div className="gold_24kt_sum4 w-50">
                                                <div className="d-flex flex-column justify-content-between h-100">
                                                    <div>
                                                        <div className="d-flex w-100">
                                                            <div className="w-50 fw-bold ps-2">GOLD</div>
                                                            <div className="w-50 text-end pe-2">{NumberWithCommas((total.goldAmt - notGoldMetalTotal), 2)}</div>
                                                        </div>
                                                        {
                                                            MetShpWise?.map((e, i) => {
                                                                return <div className="d-flex w-100" key={i}>
                                                                <div className="w-50 fw-bold ps-2">{e?.ShapeName}</div>
                                                                <div className="w-50 text-end pe-2">{NumberWithCommas(e?.Amount, 2)}</div>
                                                            </div>
                                                            })
                                                        }
                                                        <div className="d-flex w-100">
                                                            <div className="w-50 fw-bold ps-2">DIAMOND</div>
                                                            <div className="w-50 text-end pe-2">{NumberWithCommas(total.diaAmt, 2)}</div>
                                                        </div>
                                                        <div className="d-flex w-100">
                                                            <div className="w-50 fw-bold ps-2">CST</div>
                                                            <div className="w-50 text-end pe-2">{NumberWithCommas(total.csAmt, 2)}</div>
                                                        </div>
                                                        <div className="d-flex w-100">
                                                            <div className="w-50 fw-bold ps-2">MAKING</div>
                                                            <div className="w-50 text-end pe-2">{NumberWithCommas(totalSummary?.makingAmount, 2)}</div>
                                                        </div>
                                                        <div className="d-flex w-100">
                                                            <div className="w-50 fw-bold ps-2">OTHER</div>
                                                            <div className="w-50 text-end pe-2">{NumberWithCommas(total?.otherAmt, 2)}</div>
                                                        </div>
                                                        <div className="d-flex w-100 mb-1">
                                                            <div className="w-50 fw-bold ps-2">{billPrintJson?.AddLess > 0 ? 'ADD' : 'LESS'}</div>
                                                            <div className="w-50 text-end pe-2">{NumberWithCommas(billPrintJson?.AddLess, 2)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex w-100 bg_total_sum4 py-1">
                                                        <div className="w-50 fw-bold ps-2">Total</div>
                                                        {/* <div className="w-50 text-end pe-2">{(+(total.goldAmt) +
                                                            total.diaAmt + +(total.csAmt) +
                                                            +(totalSummary?.makingAmount) + (total.otherAmt) + +(billPrintJson?.AddLess)).toFixed(2)} </div> */}
                                                        <div className="w-50 text-end pe-2">{NumberWithCommas(total?.afterTaxAmt, 2)} </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cgst_sum4 border">
                                        <div className="bg_total_sum4 d-flex py-1">
                                            <div className="metal_type_sum4 fw-bold ps-1">
                                                Metal Type
                                            </div>
                                            <div className="dia_wt_sum4 fw-bold">
                                                Dia Wt (ctw)
                                            </div>
                                            <div className="GWt_sum4 fw-bold">
                                                GWt (gm)
                                            </div>
                                            <div className="net_wt_sum4 fw-bold">
                                                Net Wt (gm)
                                            </div>
                                            <div className="fine_wt_sum4 fw-bold">
                                                Fine Wt (gm)
                                            </div>
                                            <div className="gold_amount_sum4 text-end pe-1 fw-bold">
                                                Gold Amount
                                            </div>
                                        </div>
                                        {metalType.length > 0 && metalType.map((e, i) => {

                                            return <div className=" d-flex py-1" key={i}>
                                                <div className="metal_type_sum4 ps-1 text-start">
                                                    {e?.metalType}
                                                </div>
                                                <div className="dia_wt_sum4">
                                                    {fixedValues(e?.diaWt, 3)}
                                                </div>
                                                <div className="GWt_sum4">
                                                    {fixedValues(e?.grosswt, 3)}
                                                </div>
                                                <div className="net_wt_sum4">
                                                    {fixedValues(e?.NetWt, 3)}
                                                </div>
                                                <div className="fine_wt_sum4">
                                                    {fixedValues(e?.fineWt, 3)}
                                                </div>
                                                <div className="gold_amount_sum4 text-end pe-1">
                                                    {NumberWithCommas(e?.MetalAmount, 2)}
                                                </div>
                                            </div>
                                        })}
                                    </div>
                                </div>
                                <div className="w-100 border px-1 mb-1 note_sec_sum4 p-1 no_break">
                                    <p className='fw-bold font_15_sum4'>TERMS INCLUDED :</p>
                                    <div dangerouslySetInnerHTML={{ __html: billPrintJson?.Declaration }} className='pt-3 declaration_summary_12' />
                                </div>
                                <div className='remarks_sum4 no_break'>
                                    <span className="fw-bold font_16_sum4 ps-2 float-start pe-2">REMARKS : </span>
                                    <div dangerouslySetInnerHTML={{ __html: saleReturn ? billPrintJson?.Remark : billPrintJson?.PrintRemark }} className='summary12Remark'></div>
                                </div>
                                <div className="d-flex border mb-2 no_break">
                                    <div className="w-50 border-end height_65_sum4 d-flex justify-content-center align-items-end border-end">
                                        <p className="fw-bold font_15_sum4">
                                            RECEIVER'S SIGNATURE & SEAL
                                        </p>
                                    </div>
                                    <div className="w-50 height_65_sum4 d-flex justify-content-center align-items-end">
                                        <p className="fw-bold font_15_sum4">
                                            for,   {billPrintJson?.companyname}
                                        </p>
                                    </div>
                                </div>
                                {summary && <>
                                    <div className="summary_table_sum4 w-100 no_break">
                                        <div className="d-flex border height34Sum4 no_break">
                                            <div className="metalTypeSum4 border-end d-flex align-items-center justify-content-center fw-bold">
                                                Metal Type
                                            </div>
                                            <div className="GwtSum4 border-end d-flex align-items-center justify-content-center fw-bold">
                                                Gwt
                                            </div>
                                            <div className="netWtSum4 border-end d-flex align-items-center justify-content-center fw-bold">
                                                Net wt
                                            </div>
                                            <div className="tunchSum4 border-end d-flex align-items-center justify-content-center fw-bold">
                                                Tunch
                                            </div>
                                            <div className="pureWtSum4 border-end d-flex align-items-center justify-content-center fw-bold">
                                                Pure wt
                                            </div>
                                            <div className="goldPriceSum4 border-end d-flex align-items-center justify-content-center fw-bold">
                                                Gold Price 24 kt
                                            </div>
                                            <div className="goldAmtSum4 d-flex align-items-center justify-content-center fw-bold">
                                                Gold Amount
                                            </div>
                                        </div>
                                        {metalType.length > 0 && metalType.map((e, i) => {
                                            return <div className="d-flex border no_break" key={i}>
                                                <div className="metalTypeSum4 border-end d-flex justify-content-center pe-2">
                                                    {e?.metalType}
                                                </div>
                                                <div className="GwtSum4 border-end d-flex justify-content-end pe-2">
                                                    {fixedValues(e?.grosswt, 3)}
                                                </div>
                                                <div className="netWtSum4 border-end d-flex justify-content-end pe-2">
                                                    {fixedValues(e?.NetWt, 3)}
                                                </div>
                                                <div className="tunchSum4 border-end d-flex justify-content-end pe-2">
                                                    {NumberWithCommas(e?.tunch, 3)}
                                                </div>
                                                <div className="pureWtSum4 border-end d-flex justify-content-end pe-2">
                                                    {/* {(+(e?.pureWt))?.toFixed(3)} */}
                                                    {/* {fixedValues(e?.fineWt, 3)} */}
                                                    {fixedValues(e?.pureWt, 3)}
                                                </div>
                                                <div className="goldPriceSum4 border-end d-flex justify-content-end pe-2">
                                                    {NumberWithCommas(billPrintJson?.MetalRate24K, 2)}
                                                </div>
                                                <div className="goldAmtSum4 d-flex justify-content-end pe-2">
                                                    {NumberWithCommas(e?.MetalAmount, 2)}
                                                </div>
                                            </div>
                                        })}
                                        <div className="d-flex border height34Sum4 bg_total_sum4 ">
                                            <div className="metalTypeSum4 border-end d-flex align-items-center justify-content-center pe-2 fw-bold">
                                                Total
                                            </div>
                                            <div className="GwtSum4 border-end d-flex align-items-center justify-content-end pe-2 fw-bold">
                                                {fixedValues(metaltypeSum?.grosswt, 3)}
                                            </div>
                                            <div className="netWtSum4 border-end d-flex align-items-center justify-content-end pe-2 fw-bold">
                                                {fixedValues(metaltypeSum?.NetWt, 3)}
                                            </div>
                                            <div className="tunchSum4 border-end d-flex align-items-center justify-content-end pe-2 fw-bold">
                                            </div>
                                            <div className="pureWtSum4 border-end d-flex align-items-center justify-content-end pe-2 fw-bold">
                                                {fixedValues(metaltypeSum?.pureWt, 3)}
                                            </div>
                                            <div className="goldPriceSum4 border-end d-flex align-items-center justify-content-end pe-2 fw-bold">
                                            </div>
                                            <div className="goldAmtSum4 d-flex align-items-center justify-content-end pe-2 fw-bold">
                                                {NumberWithCommas(metaltypeSum?.MetalAmount, 2)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex mt-2 justify-content-between no_break">
                                        <div className="diamondTypeSum4">
                                            <div className="d-flex height34Sum4 border">
                                                <div className="DiamondTypeSum4 d-flex justify-content-center align-items-center border-end fw-bold">Diamond Type</div>
                                                <div className="DiamondCtwSum4 d-flex justify-content-center align-items-center border-end fw-bold">Dia Ctw</div>
                                                <div className="DiamondPriceSum4 d-flex justify-content-center align-items-center border-end fw-bold">Diamond Price</div>
                                                <div className="DiamondDiscountSum4 d-flex justify-content-center align-items-center border-end fw-bold">Discount In %</div>
                                                <div className="DiamondAmountSum4 d-flex justify-content-center align-items-center fw-bold">Diamond Amount</div>
                                            </div>
                                            {lastDiamondTable.length > 0 && lastDiamondTable.map((e, i) => {
                                                return <div className="d-flex border" key={i}>
                                                    <div className="DiamondTypeSum4 d-flex justify-content-center align-items-center border-end">{e?.name}</div>
                                                    <div className="DiamondCtwSum4 d-flex justify-content-end pe-2 align-items-center border-end">{fixedValues(e?.totalWeight, 3)}</div>
                                                    <div className="DiamondPriceSum4 d-flex justify-content-end pe-2 align-items-center border-end">{NumberWithCommas(e?.rate, 2)}</div>
                                                    <div className="DiamondDiscountSum4 d-flex justify-content-end pe-2 align-items-center border-end">{NumberWithCommas(e?.discount, 0)} %</div>
                                                    <div className="DiamondAmountSum4 d-flex justify-content-end pe-2 align-items-center">{NumberWithCommas(e?.totalAmount, 2)}</div>
                                                </div>
                                            })}
                                            <div className="d-flex height34Sum4 border bg_total_sum4">
                                                <div className="DiamondTypeSum4 d-flex justify-content-center align-items-center border-end fw-bold">Total</div>
                                                <div className="DiamondCtwSum4 d-flex justify-content-end align-items-center border-end fw-bold px-2">{fixedValues(lastDiamondTableTotal?.diaCtw, 3)}</div>
                                                <div className="DiamondPriceSum4 d-flex justify-content-center align-items-center border-end fw-bold"></div>
                                                <div className="DiamondDiscountSum4 d-flex justify-content-center align-items-center border-end fw-bold"></div>
                                                <div className="DiamondAmountSum4 d-flex justify-content-end align-items-center fw-bold px-2">{NumberWithCommas(lastDiamondTableTotal?.diamondAmount, 2)}</div>
                                            </div>
                                        </div>
                                        <div className="csTypeSum4 ">
                                            <div className="d-flex border height34Sum4 ">
                                                <div className="cstypeTextSum4 border-end fw-bold d-flex justify-content-center align-items-center">
                                                    CS Type
                                                </div>
                                                <div className="cstypeTextSum4 border-end fw-bold d-flex justify-content-center align-items-center">
                                                    CS Ctw
                                                </div>
                                                <div className="cstypeTextSum4 border-end fw-bold d-flex justify-content-center align-items-center">
                                                    CS Price
                                                </div>
                                                <div className="cstypeTextSum4 fw-bold d-flex justify-content-center align-items-center">
                                                    CS Amount
                                                </div>
                                            </div>
                                            {lastColorStoneTable.length > 0 && lastColorStoneTable.map((e, i) => {
                                                return <div className="d-flex border" key={i}>
                                                    <div className="cstypeTextSum4 border-end d-flex justify-content-center">
                                                        {e?.name}
                                                    </div>
                                                    <div className="cstypeTextSum4 border-end d-flex justify-content-end pe-2">
                                                        {fixedValues(e?.totalWeight, 3)}
                                                    </div>
                                                    <div className="cstypeTextSum4 border-end d-flex justify-content-end pe-2">
                                                        {NumberWithCommas(e?.rate, 2)}
                                                    </div>
                                                    <div className="cstypeTextSum4 d-flex justify-content-end pe-2">
                                                        {NumberWithCommas(e?.totalAmount, 2)}
                                                    </div>
                                                </div>
                                            })}
                                            <div className="d-flex border bg_total_sum4 height34Sum4">
                                                <div className="cstypeTextSum4 border-end d-flex justify-content-center fw-bold align-items-center">

                                                </div>
                                                <div className="cstypeTextSum4 border-end d-flex justify-content-end pe-2 fw-bold align-items-center">
                                                    {fixedValues(lastColorStoneTableTotal?.clrCtw, 3)}
                                                </div>
                                                <div className="cstypeTextSum4 border-end d-flex justify-content-end pe-2 fw-bold align-items-center">

                                                </div>
                                                <div className="cstypeTextSum4 d-flex justify-content-end pe-2 fw-bold align-items-center">
                                                    {NumberWithCommas(lastColorStoneTableTotal?.colorStoneAmount, 2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>}
                            </div>
                        </div>
                    </div>
                </div></div> : <p className='text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto'>{msg}</p>
            }

        </>
    )
}

export default Summary12;