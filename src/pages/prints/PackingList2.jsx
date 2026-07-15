import React, { useEffect, useState } from 'react';
import { ToWords } from 'to-words';
import {
    apiCall,
    isObjectEmpty,
    NumberWithCommas,
    handlePrint,
    handleImageError,
    checkMsg
} from "../../GlobalFunctions";
import style from "../../assets/css/prints/PackingList2.module.css";
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import Loader from '../../components/Loader';
import { cloneDeep } from 'lodash';

const PackingList2 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
    const [loader, setLoader] = useState(true);
    const [msg, setMsg] = useState("");
    const [data, setData] = useState({});
    const [summary, setSummary] = useState([]);
    const [headerData, setHeaderData] = useState({});
    const toWords = new ToWords();
    const [isImageWorking, setIsImageWorking] = useState(true);
    const handleImageErrors = () => {
        setIsImageWorking(false);
    };
    const loadData = (data) => {
        setHeaderData(data?.BillPrint_Json[0]);
        let datas = OrganizeDataPrint(
            data?.BillPrint_Json[0],
            data?.BillPrint_Json1,
            data?.BillPrint_Json2
        );
        let resultArr = [];
        let netWtTotal = 0;
        datas?.resultArray?.forEach((e, i) => {
            let obj = cloneDeep(e);
            let discountElements = [];
            if (e?.IsCriteriabasedAmount === 1) {
                if (e?.IsDiamondAmount === 1) {
                    discountElements?.push({ label: 'Diamond' })
                }
                if (e?.IsStoneAmount === 1) {
                    discountElements?.push({ label: 'Stone' })
                } if (e?.IsMetalAmount === 1) {
                    discountElements?.push({ label: 'Metal' })
                } if (e?.IsLabourAmount === 1) {
                    discountElements?.push({ label: 'Labour' })
                } if (e?.IsSolitaireAmount === 1) {
                    discountElements?.push({ label: 'Solitaire' })
                } if (e?.IsMiscAmount === 1) {
                    discountElements?.push({ label: 'Misc' })
                }
            }
            let OtherMetalLength = 0;
            let otherMiscAmount = e?.misc?.reduce((acc, cObj) => cObj?.IsHSCOE === 0 ? acc+cObj?.Amount : acc, 0);
            
            // obj.PrimaryWt = e?.metal?.reduce((acc, cObj) => cObj?.IsPrimaryMetal === 1 ? acc + cObj?.Wt : acc, 0);
            let PrimaryWt = 0;
            let PrimaryAmount = 0;
            e?.metal?.forEach((ele, ind) => {
                if (ele?.IsPrimaryMetal === 1) {
                    PrimaryWt += ele?.Wt;
                    PrimaryAmount += ele?.Amount;
                } else {
                    OtherMetalLength = OtherMetalLength + 1;
                }
            });
            obj.OtherMetalLength = OtherMetalLength;
            obj.discountElements = discountElements;
            obj.PrimaryWt = PrimaryWt;
            obj.PrimaryAmount = PrimaryAmount;
            obj.otherMiscAmount = otherMiscAmount;
            obj.miscLength = e?.misc?.reduce((acc, cObj) => cObj?.IsHSCOE !== 0 ? acc + 1 : acc, 0);
            if (obj?.OtherMetalLength === 0) {
                netWtTotal += e?.NetWt + e?.LossWt;
            } else {
                netWtTotal += obj?.PrimaryWt;
            }
            resultArr.push(obj);
        });
        datas.resultArray = resultArr;
        datas.mainTotal.netWtTotal = netWtTotal;
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


    const discountCriteria = [
        { key: 'DiamondDiscount', isAmountKey: 'IsDiamondDiscInAmount', label: 'Diamond' ,disAmount:"DiamondDiscountAmount" },
        { key: 'MetalDiscount', isAmountKey: 'IsMetalDiscInAmount', label: 'Metal' ,disAmount:"MetalDiscountAmount" },
        { key: 'StoneDiscount', isAmountKey: 'IsStoneDiscInAmount', label: 'Colorstone' ,disAmount:"StoneDiscountAmount" },
        { key: 'LabourDiscount', isAmountKey: 'IsLabourDiscInAmount', label: 'Labour' ,disAmount:"LabourDiscountAmount" },
        { key: 'SolitaireDiscount', isAmountKey: 'IsSolitaireDiscInAmount', label: 'Solitaire' ,disAmount:"SolitaireDiscountAmount1" },
        { key: 'MiscDiscount', isAmountKey: 'IsMiscDiscInAmount', label: 'Misc' ,disAmount:"MiscDiscountAmount" },
      ];
      

    return loader ? (
        <Loader />
    ) : msg === "" ? (
        <div className={`container container-fluid max_width_container mt-1 ${style?.packingList2} pad_60_allPrint px-1`} >
            {/* buttons */}
            <div className={`d-flex justify-content-end align-items-center ${style?.print_sec_sum4} mb-4`} >
                <div className={`form-check ps-3 ${style?.printBtn}`}>
                    <input
                        type="button"
                        className={`btn_white blue py-1 mt-2 ${style?.font_14}`}
                        value="Print"
                        onClick={(e) => handlePrint(e)}
                    />
                </div>
            </div>
            {/* company details */}
            <div className='text-center'>
                {isImageWorking && (headerData?.PrintLogo !== "" &&
                    <img src={headerData?.PrintLogo} alt=""
                        className='w-100 h-auto mx-auto d-block object-fit-contain'
                        onError={handleImageErrors} height={120} width={150} style={{ maxWidth: "116px", minWidth: "116px" }} />)}
                {/* <img src={headerData?.PrintLogo} alt="" className='logoimg mb-1' /> */}
                <p className={`fw-bold pb-1 ${style?.font_12}`}>{headerData?.CompanyAddress} {headerData?.CompanyAddress2} {headerData?.CompanyCity}-{headerData?.CompanyPinCode}</p>
                <p className={`fw-bold pb-1 ${style?.font_18}`}>{headerData?.PrintHeadLabel}</p>
                <p className={`fw-bold ${style?.font_11}`} dangerouslySetInnerHTML={{__html:headerData?.PrintRemark}}></p>
            </div>
            {/* customer details */}
            <div className={`d-flex justify-content-between no_break `}>
                <p className={`${style?.font_14}`}><span className="fw-bold">Party :</span> {headerData?.customerfirmname}</p>
                <div className={`${style?.font_12}`}>
                    <div className='d-flex' style={{ minWidth: "170px" }}>
                        <div className="w-50"><p>Invoice No :</p></div>
                        <div className="w-50"><p className="fw-bold">{headerData?.InvoiceNo}</p></div>
                    </div>
                    <div className='d-flex'>
                        <div className="w-50"><p>Date :</p></div>
                        <div className="w-50"><p className="fw-bold">{headerData?.EntryDate}</p></div>
                    </div>
                </div>

            </div>
            {/* table header */}
            <table className='w-100'>
                <thead>
                    <tr>
                        <td>
                            <div className={`mt-2 border-black border-top border-start no_break border-end mb-1 ${style?.font_12} lightGrey ${style?.rowWisePad} ${style?.word_break}`}>
                                <div className="d-flex border-bottom">
                                    <div className={`${style?.Sr} border-end d-flex align-items-center justify-content-center`}><p className="fw-bold text-center">Sr</p></div>
                                    <div className={`${style?.Jewelcode} border-end d-flex align-items-center justify-content-center`}><p className="fw-bold text-center">Jewelcode</p></div>
                                    <div className={`${style?.Diamond} border-end`}>
                                        <div className="d-grid h-100">
                                            <div className="d-flex border-bottom">
                                                <p className="fw-bold text-center w-100">Diamond</p>
                                            </div>
                                            <div className="d-flex">
                                                <div className={`${style?.w_20} border-end`}>
                                                    <p className="fw-bold text-center">Shape</p>
                                                </div>
                                                <div className={`${style?.w_20} border-end`}>
                                                    <p className="fw-bold text-center">Size</p>
                                                </div>
                                                <div className={`${style?.w_20} border-end`}>
                                                    <p className="fw-bold text-center">Wt</p>
                                                </div>
                                                <div className={`${style?.w_20} border-end`}>
                                                    <p className="fw-bold text-center">Rate</p>
                                                </div>
                                                <div className={`${style?.w_20}`}>
                                                    <p className="fw-bold text-center">Amount</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${style?.Metal} border-end`}>
                                        <div className="d-grid h-100">
                                            <div className="d-flex border-bottom">
                                                <p className="fw-bold text-center w-100">Metal</p>
                                            </div>
                                            <div className="d-flex">
                                                <div style={{ width: "18%" }} className={` border-end`}>
                                                    <p className="fw-bold text-center">Kt</p>
                                                </div>
                                                <div style={{ width: "20%" }} className={` border-end`}>
                                                    <p className="fw-bold text-center">Gr Wt</p>
                                                </div>
                                                <div style={{ width: "20%" }} className={` border-end`}>
                                                    <p className="fw-bold text-center">N+L</p>
                                                </div>
                                                <div style={{ width: "20%" }} className={` border-end`}>
                                                    <p className="fw-bold text-center">Rate</p>
                                                </div>
                                                <div style={{ width: "22%" }} className={``}>
                                                    <p className="fw-bold text-center">Amount</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${style?.Stone} border-end`}>
                                        <div className="d-grid h-100">
                                            <div className="d-flex border-bottom">
                                                <p className="fw-bold text-center w-100">Stone</p>
                                            </div>
                                            <div className="d-flex">
                                                <div className='col-3 border-end'>
                                                    <p className="fw-bold text-center">Shape</p>
                                                </div>
                                                <div className='col-3 border-end'>
                                                    <p className="fw-bold text-center">Wt</p>
                                                </div>
                                                <div className='col-3 border-end'>
                                                    <p className="fw-bold text-center">Rate</p>
                                                </div>
                                                <div className='col-3'>
                                                    <p className="fw-bold text-center">Amount</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${style?.Labour} border-end`}>
                                        <div className="d-grid h-100">
                                            <div className="d-flex border-bottom">
                                                <p className="fw-bold text-center w-100">Labour</p>
                                            </div>
                                            <div className="d-flex">
                                                <div className='w-50 border-end'>
                                                    <p className="fw-bold text-center">
                                                        Rate
                                                    </p>
                                                </div>
                                                <div className='w-50'>
                                                    <p className="fw-bold text-center">
                                                        Amount
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${style?.Other} border-end`}>
                                        <div className="d-grid h-100">
                                            <div className="d-flex border-bottom">
                                                <p className="fw-bold text-center w-100">Other</p>
                                            </div>
                                            <div className="d-flex">
                                                <div className='w-50 border-end'>
                                                    <p className="fw-bold text-center">
                                                        Code
                                                    </p>
                                                </div>
                                                <div className='w-50'>
                                                    <p className="fw-bold text-center">
                                                        Amount
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${style?.Price} d-flex align-items-center justify-content-center`}><p className="fw-bold text-center">Price</p></div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {/* table data */}
                    {
                        data?.resultArray?.map((e, i) => {
                            const discountDisplay = discountCriteria
                .filter(({ key }) => e?.[key] > 0)
                .map(({ key, isAmountKey, label,disAmount }) => {
                  const num = Number(e[key]);  
                  const am= Number(e[disAmount])
                  const decimals = e[isAmountKey] === 1 ? 3 : 2;  
                  const val = num.toFixed(decimals);  
                  return e[isAmountKey] === 0 ? `${val}% @${label} Amount ` : `${val} @${label} Amount`;
                })
                .join(', ');
                            return <tr key={i}>
                                <td className=''>
                                    <div className={`${i === 0 && "border-black border-top"}`}>
                                        <div className={`border-start border-end border-black no_break ${style?.font_1_12} ${style?.rowWisePad} ${style?.word_break} `}>
                                            <div className={`d-flex ${i !== 0 && "border-top"}`}>
                                                <div className={`${style?.Sr} border-end`}><p className="text-center pt-1">{i + 1}</p></div>
                                                <div className={`${style?.Jewelcode} border-end p-1`}>
                                                    <div className="d-flex justify-content-between flex-wrap">
                                                        <p className=""> {e?.designno}</p>
                                                        <p className=""> {e?.designno}</p>
                                                    </div>
                                                    <img src={e?.DesignImage} alt="" className='w-100 imgWidth mt-2' onError={handleImageError} />
                                                    {e?.HUID !== "" && <p className='text-center'>HUID-{e?.HUID}</p>}
                                                    {e?.lineid !== "" && <p className='text-center'>{e?.lineid}</p>}
                                                </div>
                                                <div className={`${style?.Diamond} border-end`}>
                                                    <div className="d-grid h-100">
                                                        <div className="d-flex">
                                                            <div className={`${style?.w_20} border-end`} >
                                                                {e?.diamonds?.map((ele, ind) => {
                                                                    return <p className="" key={ind}>{ele?.ShapeName}</p>
                                                                })}
                                                            </div>
                                                            <div className={`${style?.w_20} border-end`} >
                                                                {console.log("e?.diamonds",e?.diamonds)}
                                                                {e?.diamonds?.map((ele, ind) => {
                                                                    return <p className=" text-center" key={ind}>{  ele?.SizeName =="Custom"? "C:"+ele?.CustomSize:  ele?.SizeName}</p>
                                                                })}
                                                            </div>
                                                            <div className={`${style?.w_20} border-end`}>
                                                                {e?.diamonds?.map((ele, ind) => {
                                                                    return <p className="text-end" key={ind}>{NumberWithCommas(ele?.Wt, 3)}</p>
                                                                })}
                                                            </div>
                                                            <div className={`${style?.w_20} border-end`}>
                                                                {e?.diamonds?.map((ele, ind) => {
                                                                    return <p className="text-end" key={ind}>{NumberWithCommas(ele?.Rate, 2)}</p>
                                                                })}
                                                            </div>
                                                            <div className={`${style?.w_20}`}>
                                                                {e?.diamonds?.map((ele, ind) => {
                                                                    return <p className="text-end" key={ind}>{NumberWithCommas(ele?.Amount / headerData?.CurrencyExchRate, 2)}</p>
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`${style?.Metal} border-end`}>
                                                    {e?.JobRemark === "" ? <div className="d-grid h-100">
                                                        <div className="d-flex" >
                                                            <div style={{ width: "18%" }} className={` border-end`}>
                                                                {e?.metal.map((ele, ind) => {
                                                                    return ele?.IsPrimaryMetal === 1 && <p className="" key={ind} style={{ wordBreak: "break-word" }}>{ele?.ShapeName} {ele?.QualityName}</p>
                                                                })}
                                                            </div>
                                                            <div style={{ width: "20%" }} className={` border-end`}>
                                                                {e?.metal.map((ele, ind) => {
                                                                    return ele?.IsPrimaryMetal === 1 && <p className="text-end" key={ind}>{NumberWithCommas(e?.grosswt, 3)}</p>
                                                                })}
                                                            </div>
                                                            <div style={{ width: "20%" }} className={` border-end`}>
                                                                {e?.metal.map((ele, ind) => {
                                                                    return ele?.IsPrimaryMetal === 1 && <p className="text-end" key={ind}>{e?.OtherMetalLength === 0 ? NumberWithCommas(e?.NetWt + e?.LossWt, 3) : NumberWithCommas(ele?.Wt, 3)}</p>
                                                                })}
                                                            </div>
                                                            <div style={{ width: "20%" }} className={` border-end`}>
                                                                {e?.metal.map((ele, ind) => {
                                                                    return ele?.IsPrimaryMetal === 1 && <p className="text-end" key={ind}>{NumberWithCommas(ele?.Rate, 2)}</p>
                                                                })}
                                                            </div>
                                                            <div style={{ width: "22%" }} className={``}>
                                                                {e?.metal.map((ele, ind) => {
                                                                    return ele?.IsPrimaryMetal === 1 && <p className="text-end" key={ind}>{NumberWithCommas(ele?.Amount / headerData?.CurrencyExchRate, 2)}</p>
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div> : <div> <div className="d-flex border-bottom" >
                                                        <div style={{ width: "18%" }} className={` border-end`}>
                                                            {e?.metal.map((ele, ind) => {
                                                                return ele?.IsPrimaryMetal === 1 && <p className="" key={ind} style={{ wordBreak: "normal" }}>{ele?.ShapeName} {ele?.QualityName}</p>
                                                            })}
                                                        </div>
                                                        <div style={{ width: "20%" }} className={` border-end`}>
                                                            {e?.metal.map((ele, ind) => {
                                                                return ele?.IsPrimaryMetal === 1 && <p className="text-end" key={ind}>{NumberWithCommas(e?.grosswt, 3)}</p>
                                                            })}
                                                        </div>
                                                        <div style={{ width: "20%" }} className={` border-end`}>
                                                            {e?.metal.map((ele, ind) => {
                                                                return ele?.IsPrimaryMetal === 1 && <p className="text-end" key={ind}>{e?.OtherMetalLength === 0 ? NumberWithCommas(e?.NetWt + e?.LossWt, 3) : NumberWithCommas(ele?.Wt, 3)}</p>
                                                            })}
                                                        </div>
                                                        <div style={{ width: "20%" }} className={` border-end`}>
                                                            {e?.metal.map((ele, ind) => {
                                                                return ele?.IsPrimaryMetal === 1 && <p className="text-end" key={ind}>{NumberWithCommas(ele?.Rate, 2)}</p>
                                                            })}
                                                        </div>
                                                        <div style={{ width: "22%" }} className={``}>
                                                            {e?.metal.map((ele, ind) => {
                                                                return ele?.IsPrimaryMetal === 1 && <p className="text-end" key={ind}>{NumberWithCommas(ele?.Amount / headerData?.CurrencyExchRate, 2)}</p>
                                                            })}
                                                        </div>
                                                    </div><div className={``}>
                                                            <p className="">Remark:</p>
                                                            <p className="fw-bold">{e?.JobRemark}</p>
                                                        </div></div>}
                                                </div>
                                                <div className={`${style?.Stone} border-end`}>
                                                    <div className="d-grid h-100">
                                                        <div className="d-flex">
                                                            <div className={`col-3 border-end`} >
                                                                {e?.colorstone?.map((ele, ind) => {
                                                                    return <p className="" key={ind}>{ele?.ShapeName}</p>
                                                                })}
                                                            </div>
                                                            <div className={`col-3 border-end`}>
                                                                {e?.colorstone?.map((ele, ind) => {
                                                                    return <p className="text-end" key={ind}>{NumberWithCommas(ele?.Wt, 3)}</p>
                                                                })}
                                                            </div>
                                                            <div className={`col-3 border-end`}>
                                                                {e?.colorstone?.map((ele, ind) => {
                                                                    return <p className="text-end" key={ind}>{NumberWithCommas(ele?.Rate, 2)}</p>
                                                                })}
                                                            </div>
                                                            <div className={`col-3`}>
                                                                {e?.colorstone?.map((ele, ind) => {
                                                                    return <p className="text-end" key={ind}>{NumberWithCommas(ele?.Amount / headerData?.CurrencyExchRate, 2)}</p>
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`${style?.Labour} border-end`}>
                                                    <div className="d-grid h-100">
                                                        <div className="d-flex">
                                                            <div className='w-50 border-end'>
                                                                <p className="text-end">
                                                                    {NumberWithCommas(e?.MaKingCharge_Unit, 2)}
                                                                </p>
                                                            </div>
                                                            <div className='w-50'>
                                                                <p className="text-end">
                                                                    {NumberWithCommas((e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount) / headerData?.CurrencyExchRate, 2)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`${style?.Other} border-end ${style?.no_word_break}`}>
                                                
                                                    {
                                                        e?.misc?.map((ele, ind) => {
                                                            return (ele?.IsHSCOE !== 0 && ele?.Amount !== 0) && <div className="d-flex" key={ind}>
                                                                <p className='col-8' style={{ wordBreak: "break-all" }}>{ele?.ShapeName}</p>
                                                                <p className='col-4 text-end'>{NumberWithCommas(ele?.Amount / headerData?.CurrencyExchRate, 2)}</p>
                                                            </div>
                                                        })
                                                    }
                                                        {
                                                        (e?.otherMiscAmount !== 0) && <div className="d-flex justify-content-between">
                                                            <p className='col-8'>Other</p>
                                                            <p className='col-4 text-end'>{NumberWithCommas(e?.otherMiscAmount / headerData?.CurrencyExchRate, 2)}</p>
                                                        </div>
                                                    }
                                                    {
                                                        e?.other_details.map((ele, ind) => {
                                                            return ind <= 2 && <div className="d-flex" key={ind}>
                                                                <p className='col-8' style={{ wordBreak: "break-all" }}>{ele?.label}</p>
                                                                <p className='col-4 text-end'>{NumberWithCommas(+ele?.value, 2)}</p>
                                                            </div>
                                                        })
                                                    }
                                                    {e?.TotalDiamondHandling !== 0 && <div className='d-flex justify-content-between'>
                                                        <p className='col-8 ' style={{ wordBreak: "break-all" }}> Handling</p>
                                                        <p className='col-4 text-end'>{NumberWithCommas(e?.TotalDiamondHandling, 2)}</p>
                                                    </div>}
                                                </div>
                                                <div className={`${style?.Price} `}>
                                                    <p className="text-end fw-bold">{NumberWithCommas(e?.UnitCost / headerData?.CurrencyExchRate, 2)}</p>
                                                </div>
                                            </div>
                                            <div className={`d-flex`}>
                                                <div className={`${style?.Sr} border-end`}></div>
                                                <div className={`${style?.Jewelcode} border-end p-1`}>
                                           
                                                </div>
                                                <div className={`${style?.Diamond} border-end lightGrey border-top`}>
                                                    <div className="d-grid h-100">
                                                        <div className={`d-flex w-100`}>
                                                            <div className={`${style?.w_20} border-end`}>
                                                                <p className=" fw-bold"></p>
                                                            </div>
                                                            <div className={`${style?.w_20} border-end`}>
                                                                <p className=" fw-bold"></p>
                                                            </div>
                                                            <div className={`${style?.w_20} border-end`}>
                                                                <p className="text-end fw-bold">{e?.totals?.diamonds?.Wt !== 0 && NumberWithCommas(e?.totals?.diamonds?.Wt, 3)}</p>
                                                            </div>
                                                            <div className={`${style?.w_20} border-end`}>
                                                                <p className="text-end fw-bold"></p>
                                                            </div>
                                                            <div className={`${style?.w_20}`}>
                                                                <p className="text-end fw-bold">{e?.totals?.diamonds?.Amount !== 0 && NumberWithCommas(e?.totals?.diamonds?.Amount / headerData?.CurrencyExchRate, 2)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`${style?.Metal} border-end lightGrey border-top`}>
                                                    <div className="d-grid h-100">
                                                        <div className={`d-flex w-100`}>
                                                            <div style={{ width: "18%" }} className={`border-end`}>
                                                                <p className=" fw-bold"></p>
                                                            </div>
                                                            <div style={{ width: "20%" }} className={`border-end`}>
                                                                <p className="text-end fw-bold">{e?.grosswt !== 0 && NumberWithCommas(e?.grosswt, 3)}</p>
                                                            </div>
                                                            <div style={{ width: "20%" }} className={`border-end`}>
                                                                <p className="text-end fw-bold">{e?.OtherMetalLength === 0 ? (e?.NetWt + e?.LossWt !== 0 && NumberWithCommas(e?.NetWt + e?.LossWt, 3)) : NumberWithCommas(e?.PrimaryWt, 3)}</p>
                                                            </div>
                                                            <div style={{ width: "20%" }} className={`border-end`}>
                                                                <p className="text-end fw-bold"></p>
                                                            </div>
                                                            <div style={{ width: "22%" }} className={``}>
                                                                <p className="text-end fw-bold">{e?.PrimaryAmount !== 0 && NumberWithCommas(e?.PrimaryAmount / headerData?.CurrencyExchRate, 2)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`${style?.Stone} border-end lightGrey border-top`}>
                                                    <div className="d-grid h-100">
                                                        <div className={`d-flex w-100`}>
                                                            <div className={`col-3 border-end`}>
                                                                <p className=""></p>
                                                            </div>
                                                            <div className={`col-3 border-end`}>
                                                                <p className="text-end  fw-bold">{e?.totals?.colorstone?.Wt !== 0 && NumberWithCommas(e?.totals?.colorstone?.Wt, 3)}</p>
                                                            </div>
                                                            <div className={`col-3 border-end`}>
                                                                <p className="text-end"></p>
                                                            </div>
                                                            <div className={`col-3`}>
                                                                <p className="text-end fw-bold">{e?.totals?.colorstone?.Amount !== 0 && NumberWithCommas(e?.totals?.colorstone?.Amount / headerData?.CurrencyExchRate, 2)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`${style?.Labour} border-end lightGrey border-top`}>
                                                    <div className="d-grid h-100">
                                                        <div className={`d-flex w-100`}>
                                                            <div className={`w-50 border-end`}>
                                                                <p className="fw-bold"></p>
                                                            </div>
                                                            <div className={`w-50`}>
                                                                <p className="text-end fw-bold">  {NumberWithCommas((e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount) / headerData?.CurrencyExchRate, 2)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`${style?.Other} border-end lightGrey border-top`}>
                                                    <div className="d-grid h-100">
                                                        <div className={`d-flex w-100`}>
                                                            <div className={`w-50`}>
                                                                <p className=""></p>
                                                            </div>
                                                            <div className={`w-50`}>
                                                                <p className="text-end fw-bold">{NumberWithCommas((e?.OtherCharges + e?.TotalDiamondHandling + e?.MiscAmount) / headerData?.CurrencyExchRate, 2)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`${style?.Price} lightGrey border-top`}>
                                                    <div className="d-grid h-100">
                                                        <div className={`w-100 `}>
                                                            <p className="text-end fw-bold">{NumberWithCommas(e?.UnitCost / headerData?.CurrencyExchRate, 2)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* discount */}
                                            {e?.DiscountAmt !== 0 && <div className="d-flex border-top">
                                                <div className={`${style?.Sr} border-end`}><p className="text-center"></p></div>
                                                <div className={`${style?.Jewelcode} border-end`}>
                                                </div>
                                                <div className={`${style?.Diamond} border-end lightGrey`}>
                                                    <div className="d-flex w-100">
                                                        <div className={`${style?.w_20} p-1`}>
                                                            <p className=""></p>
                                                        </div>
                                                        <div className={`${style?.w_20} p-1`}>
                                                            <p className=""></p>
                                                        </div>
                                                        <div className={`${style?.w_20} p-1`}>
                                                            <p className="text-end"></p>
                                                        </div>
                                                        <div className={`${style?.w_20} p-1`}>
                                                            <p className="text-end"></p>
                                                        </div>
                                                        <div className={`${style?.w_20} p-1`}>
                                                            <p className="text-end"></p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`${style?.Metal} border-end lightGrey`}>
                                                    <div className="d-flex w-100">
                                                        <div className={`${style?.w_20} p-1`}>
                                                        </div>
                                                        <div className={`${style?.w_20} p-1`}>
                                                        </div>
                                                        <div className={`${style?.w_20} p-1`}>
                                                        </div>
                                                        <div className={`${style?.w_20} p-1`}>
                                                        </div>
                                                        <div className={`${style?.w_20} p-1`}>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`${style?.stone_labour_other} border-end lightGrey fw-bold`}>
                                                    <div className="d-flex w-100">
                                                        <div className={`${style?.discount} border-end`}>
                                                            {/* <p className="text-end">
                                                                Discount {e?.isdiscountinamount === 1 ? `${NumberWithCommas(e?.DiscountAmt / headerData?.CurrencyExchRate, 2)} On` : ` ${NumberWithCommas(e?.Discount, 2)}% @Total`} Amount
                                                            </p> */}
                                                            <p className="fw-bold text-end">    Discount {discountDisplay || `${NumberWithCommas(e?.Discount, 2)} @ Total Amount`}	</p>
                                                        </div>
                                                        <div className={`${style?.discount_amount}`}>
                                                            <p className="text-end">
                                                                {NumberWithCommas(e?.DiscountAmt / headerData?.CurrencyExchRate, 2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`${style?.Price} lightGrey fw-bold`}><p className="text-end">{NumberWithCommas(e?.TotalAmount / headerData?.CurrencyExchRate, 2)}</p></div>
                                            </div>}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        })
                    }
                    {/* table total */}
                    <tr>
                        <td>
                            <div className={`border-black border-start border-end no_break ${style?.font_1_12} ${style?.rowWisePad} ${style?.word_break}`}>
                                <div className="d-flex lightGrey border-bottom border-top">
                                    <div className={`${style?.Sr} border-end`}><p className="text-center"></p></div>
                                    <div className={`${style?.Jewelcode} border-end text-center fw-bold d-flex align-items-center justify-content-center`}> Total </div>
                                    <div className={`${style?.Diamond} border-end d-flex`}>
                                        <div className={`${style?.w_20} border-end`}>
                                            <p className=""></p>
                                        </div>
                                        <div className={`${style?.w_20} border-end`}>
                                            <p className=""></p>
                                        </div>
                                        <div className={`${style?.w_20} border-end d-flex align-items-center justify-content-end`}>
                                            <p className="text-end fw-bold">{NumberWithCommas(data?.mainTotal?.diamonds?.Wt, 2)}</p>
                                        </div>
                                        <div className={`${style?.w_20} border-end`}>
                                            <p className="text-end"></p>
                                        </div>
                                        <div className={`${style?.w_20} d-flex align-items-center justify-content-end`}>
                                            <p className="text-end fw-bold">{NumberWithCommas(data?.mainTotal?.diamonds?.Amount / headerData?.CurrencyExchRate, 2)}</p>
                                        </div>
                                    </div>
                                    <div className={`${style?.Metal} border-end d-flex`}>
                                        <div style={{ width: "18%" }} className={`border-end`}>
                                            <p className=""></p>
                                        </div>
                                        <div style={{ width: "20%" }} className={`border-end d-flex align-items-center justify-content-end`}>
                                            <p className="text-end fw-bold">{NumberWithCommas(data?.mainTotal?.grosswt, 3)}</p>
                                        </div>
                                        <div style={{ width: "20%" }} className={`border-end d-flex align-items-center justify-content-end`}>
                                            <p className="text-end fw-bold">{NumberWithCommas(data?.mainTotal?.netWtTotal, 3)}</p>
                                        </div>
                                        <div style={{ width: "20%" }} className={`border-end d-flex align-items-center justify-content-center`}>
                                            <p className="text-end"></p>
                                        </div>
                                        <div style={{ width: "22%" }} className={`d-flex align-items-center justify-content-end`}>
                                            <p className="text-end fw-bold">{NumberWithCommas(data?.mainTotal?.MetalAmount / headerData?.CurrencyExchRate, 2)}</p>
                                        </div>
                                    </div>
                                    <div className={`${style?.Stone} border-end d-flex`}>
                                        <div className='col-3 border-end'>
                                            <p className=""></p>
                                        </div>
                                        <div className='col-3 border-end d-flex align-items-center justify-content-end'>
                                            <p className="text-end fw-bold">{NumberWithCommas(data?.mainTotal?.colorstone?.Wt, 3)}</p>
                                        </div>
                                        <div className='col-3 border-end'>
                                            <p className="text-end"></p>
                                        </div>
                                        <div className='col-3 d-flex align-items-center justify-content-end'>
                                            <p className="text-end fw-bold">{NumberWithCommas(data?.mainTotal?.colorstone?.Amount / headerData?.CurrencyExchRate, 2)}</p>
                                        </div>
                                    </div>
                                    <div className={`${style?.Labour} border-end d-flex`}>
                                        <div className='w-50 border-end'>
                                            <p className="text-end">

                                            </p>
                                        </div>
                                        <div className='w-50 d-flex align-items-center justify-content-end'>
                                            <p className="text-end fw-bold">
                                                {NumberWithCommas((data?.mainTotal?.total_Making_Amount + data?.mainTotal?.diamonds?.SettingAmount + data?.mainTotal?.colorstone?.SettingAmount) / headerData?.CurrencyExchRate, 2)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`${style?.Other} border-end d-flex`}>
                                        <div className='w-50 border-end'>
                                            <p className="text-end">

                                            </p>
                                        </div>
                                        <div className='w-50 d-flex align-items-center justify-content-end'>
                                            <p className="text-end fw-bold">
                                                {NumberWithCommas((data?.mainTotal?.total_other + data?.mainTotal?.totalMiscAmount + data?.mainTotal?.total_diamondHandling) / headerData?.CurrencyExchRate, 2)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`${style?.Price} d-flex align-items-center justify-content-end`}>
                                        <p className="text-end fw-bold">{NumberWithCommas(data?.mainTotal?.total_amount / headerData?.CurrencyExchRate, 2)}</p>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    {/* taxble tax */}
                    <tr>
                        <td>
                            <div className={`d-flex border-start border-end border-bottom no_break border-black ${style?.font_1_12} ${style?.rowWisePad} overflow-hidden`}>
                                <div className={`${style?.tax} text-end`}>
                                    {data?.mainTotal?.total_discount_amount !== 0 && <p>Total Discount</p>}
                                    {data?.allTaxes?.map((ele, ind) => {
                                        return <p key={ind}>{ele?.name} @ {ele?.per}</p>
                                    })}
                                    {headerData?.AddLess !== 0 && <p>{headerData?.AddLess > 0 ? "Add" : "Less"} </p>}
                                    <p>Grand Total</p>
                                </div>
                                <div className={`${style?.Price} text-end`}>
                                    {data?.mainTotal?.total_discount_amount !== 0 && <p>{NumberWithCommas(data?.mainTotal?.total_discount_amount / headerData?.CurrencyExchRate, 2)}</p>}
                                    {data?.allTaxes?.map((ele, ind) => {
                                        return <p key={ind}>{NumberWithCommas(+ele?.amount, 2)}</p>
                                    })}
                                    {headerData?.AddLess !== 0 && <p>{NumberWithCommas(headerData?.AddLess / headerData?.CurrencyExchRate, 2)} </p>}
                                    <p>{NumberWithCommas((data?.mainTotal?.total_amount / headerData?.CurrencyExchRate) + data?.allTaxes?.reduce((acc, cObj) => acc + (+cObj?.amount), 0) + (headerData?.AddLess / headerData?.CurrencyExchRate), 2)}</p>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
            {msg}
        </p>
    );
}

export default PackingList2