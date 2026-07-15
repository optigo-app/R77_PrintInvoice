import React, { useEffect, useState } from 'react';
import style from "../../assets/css/prints/PackingList4.module.css";
import Loader from "../../components/Loader";
import {
    apiCall,
    checkMsg,
    handleImageError,
    handlePrint,
    isObjectEmpty,
    NumberWithCommas,
    otherAmountDetail,
} from "../../GlobalFunctions";
import { taxGenrator } from "./../../GlobalFunctions";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { cloneDeep, findIndex } from 'lodash';
const PackingList4 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
    const [headerData, setHeaderData] = useState({});
    const [msg, setMsg] = useState("");
    const [data, setData] = useState([]);
    const [loader, setLoader] = useState(true);
    const [total, setTotal] = useState({
        netWt: 0,
        metalAmount: 0
    })
    const [isImageWorking, setIsImageWorking] = useState(true);
    const handleImageErrors = () => {
        setIsImageWorking(false);
    };
    const loadData = (data) => {
        setHeaderData(data?.BillPrint_Json[0]);
        let datas = OrganizeDataPrint(data?.BillPrint_Json[0], data?.BillPrint_Json1, data?.BillPrint_Json2);
        let resultArr = [];
        let netWts = 0;
        let metalAmountss = 0;
        datas?.resultArray?.forEach((e, i) => {
            let obj = cloneDeep(e);
            let netWtss = 0;
            let metalAmounts = 0;
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
            let miscLength = e?.misc?.reduce((acc, cObj) => cObj?.IsHSCOE !== 0 ? acc + 1 : acc, 0);
            if (e?.metal?.length <= 1) {
                netWts += e?.NetWt + e?.LossWt;
                netWtss += e?.NetWt + e?.LossWt;
                if (e?.metal?.length === 1) {
                    metalAmounts += e?.metal[0]?.Amount;
                    metalAmountss += e?.metal[0]?.Amount;
                }
            } else {
                let findMetal = e?.metal?.findIndex((ele, ind) => ele?.IsPrimaryMetal === 1);
                if (findMetal !== -1) {
                    netWts += e?.metal[findMetal]?.Wt;
                    netWtss += e?.metal[findMetal]?.Wt;
                    metalAmounts += e?.metal[findMetal]?.Amount;
                    metalAmountss += e?.metal[findMetal]?.Amount;
                }
            }
            obj.netWtss = netWtss;
            obj.miscLength = miscLength
            obj.metalAmounts = metalAmounts;
            obj.discountElements = discountElements;
            resultArr?.push(obj);
        });
        datas.resultArray = resultArr;
        setTotal({ ...total, netWt: netWts, metalAmount: metalAmountss });
        setData(datas);
    }

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const discountCriteria = [
        { key: 'DiamondDiscount', isAmountKey: 'IsDiamondDiscInAmount', label: 'Diamond', disAmount: "DiamondDiscountAmount" },
        { key: 'MetalDiscount', isAmountKey: 'IsMetalDiscInAmount', label: 'Metal', disAmount: "MetalDiscountAmount" },
        { key: 'StoneDiscount', isAmountKey: 'IsStoneDiscInAmount', label: 'Colorstone', disAmount: "StoneDiscountAmount" },
        { key: 'LabourDiscount', isAmountKey: 'IsLabourDiscInAmount', label: 'Labour', disAmount: "LabourDiscountAmount" },
        { key: 'SolitaireDiscount', isAmountKey: 'IsSolitaireDiscInAmount', label: 'Solitaire', disAmount: "SolitaireDiscountAmount1" },
        { key: 'MiscDiscount', isAmountKey: 'IsMiscDiscInAmount', label: 'Misc', disAmount: "MiscDiscountAmount" },
      ];

    return (
        <>
            {loader ? (
                <Loader />
            ) : (
                <>
                    {msg === "" ? (
                        <>
                            <div className={`pad_60_allPrint container max_width_container ${style?.pad_top} ${style?.pkgList4} px-1`}>
                                {/* print button */}
                                <div className={`position-absolute ${style?.print_sec_sum4}`}>
                                    <div className={`d-flex justify-content-end align-items-center  w-100`}>
                                        <div className={`form-check ${style?.font_14}`}>
                                            <input type="button" className={`btn_white blue mt-0`} value="Print" onClick={(e) => handlePrint(e)} />
                                        </div>
                                    </div>
                                </div>
                                {/* company details */}
                                <div className={`text-center ${style?.font_12}`} style={{display:"flex",flexDirection:"column", alignItems: "center"}}>
                                    {/* <img src={headerData?.PrintLogo} alt="" className='imgWidth' style={{ maxWidth: "115px" }} /> */}
                                    {isImageWorking && (headerData?.PrintLogo !== "" &&
                                        <img src={headerData?.PrintLogo} alt=""
                                            className='imgWidth' style={{ maxWidth: "115px" }}
                                            onError={handleImageErrors} />)}
                                    <p className="fw-medium fw-bold">{headerData?.CompanyAddress} {headerData?.CompanyAddress2} {headerData?.CompanyCity}-{headerData?.CompanyPinCode}</p>
                                    <p className=" fw-bold" style={{ fontSize: "18px" }}>{headerData?.PrintHeadLabel}</p>
                                    <p className="fw-medium fw-bold" style={{ fontSize: "11px" }} dangerouslySetInnerHTML={{__html:headerData?.PrintRemark}}></p>
                                </div>
                                <div className={`d-flex justify-content-between`} >
                                    <div className={`${style?.font_14}`}>
                                        <p><span className="fw-bold">Party : </span> {headerData?.customerfirmname}</p>
                                    </div>
                                    <div className={`${style?.font_12}`} >
                                        <div className="d-flex">
                                            <p className=" text-end pe-3" style={{ width: "85px", minWidth: "max-content" }}>Invoice No :	</p>
                                            <p className=" fw-bold" style={{ width: "85px", minWidth: "max-content" }}>{" "}{headerData?.InvoiceNo}</p>
                                        </div>
                                        <div className="d-flex">
                                            <p className=" text-end pe-3" style={{ width: "85px", minWidth: "max-content" }}>Date :	</p>
                                            <p className=" fw-bold" style={{ width: "85px", minWidth: "max-content" }}>{" "}{headerData?.EntryDate}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* table header */}
                                <table className='w-100'>
                                    <thead>
                                        <tr>
                                            <td>
                                                <div className={`border-start border-end border-top border-black mb-1 overflow-hidden ${style?.rowWisePad} ${style?.word_break}`}>
                                                    <div className={`d-flex border-bottom lightGrey ${style?.font_1_12}`}>
                                                        <div className={`border-end ${style?.srNo} d-flex justify-content-center align-items-center`}><p className='fw-semibold text-center' style={{ wordBreak: "normal" }}>Sr. No.</p></div>
                                                        <div className={`border-end ${style?.jewelcode} d-flex justify-content-center align-items-center`}><p className='fw-semibold text-center'>Jewelcode</p></div>
                                                        <div className={`border-end ${style?.diamond}`}>
                                                            <p className='fw-semibold text-center border-bottom'>Diamond</p>
                                                            <div className="d-flex">
                                                                <div className={`border-end col-2`}><p className="fw-semibold text-center">Shape</p></div>
                                                                <div className={`border-end col-2`}><p className="fw-semibold text-center">Size</p></div>
                                                                <div className={`border-end col-2`}><p className="fw-semibold text-center">Pcs</p></div>
                                                                <div className={`border-end col-2`}><p className="fw-semibold text-center">Wt</p></div>
                                                                <div className={`border-end col-2`}><p className="fw-semibold text-center">Rate</p></div>
                                                                <div className={`col-2`}><p className="fw-semibold text-center">Amount</p></div>
                                                            </div>
                                                        </div>
                                                        <div className={`border-end ${style?.metal}`}>
                                                            <p className='fw-semibold text-center border-bottom'>Metal</p>
                                                            <div className="d-flex">
                                                                <div className={`border-end ${style?.w_20}`}><p className='fw-semibold text-center'>Kt</p></div>
                                                                <div className={`border-end ${style?.w_20}`}><p className='fw-semibold text-center'>Gr Wt</p></div>
                                                                <div className={`border-end ${style?.w_20}`}><p className='fw-semibold text-center'>N+L</p></div>
                                                                <div className={`border-end ${style?.w_20}`}><p className='fw-semibold text-center'>Rate</p></div>
                                                                <div className={`${style?.w_20}`}><p className='fw-semibold text-center'>Amount</p></div>
                                                            </div>
                                                        </div>
                                                        <div className={`border-end ${style?.stone}`}>
                                                            <p className='fw-semibold text-center border-bottom'>Stone</p>
                                                            <div className="d-flex">
                                                                <div className={`border-end ${style?.w_20}`}><p className='fw-semibold text-center'>Shape</p></div>
                                                                <div className={`border-end ${style?.w_20}`}><p className='fw-semibold text-center'>Pcs</p></div>
                                                                <div className={`border-end ${style?.w_20}`}><p className='fw-semibold text-center'>Wt</p></div>
                                                                <div className={`border-end ${style?.w_20}`}><p className='fw-semibold text-center'>Rate</p></div>
                                                                <div className={`${style?.w_20}`}><p className='fw-semibold text-center'>Amount</p></div>
                                                            </div>
                                                        </div>
                                                        <div className={`border-end ${style?.labour}`}>
                                                            <p className='fw-semibold text-center border-bottom'>Labour</p>
                                                            <div className="d-flex">
                                                                <div className='border-end col-6'><p className="fw-semibold text-center">Rate</p></div>
                                                                <div className='col-6'><p className="fw-semibold text-center">Amount</p></div>
                                                            </div>
                                                        </div>
                                                        <div className={`border-end ${style?.other}`}>
                                                            <p className='fw-semibold text-center border-bottom'>Other</p>
                                                            <div className="d-flex">
                                                                <div className='border-end col-6'> <p className="fw-semibold text-center">Code</p> </div>
                                                                <div className='col-6'> <p className="fw-semibold text-center">Amount</p></div>
                                                            </div>
                                                        </div>
                                                        <div className={`${style?.amount} d-flex justify-content-center align-items-center`}><p className='fw-semibold text-center'>Amount</p></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* table data */}
                                        {data?.resultArray?.map((e, i) => {
                                             const discountDisplay = discountCriteria
                                             .filter(({ key }) => e?.[key] > 0)
                                             .map(({ key, isAmountKey, label, disAmount }) => {
                                               const num = Number(e[key]);
                                               const am = Number(e[disAmount])
                                               const decimals = e[isAmountKey] === 1 ? 3 : 2;
                                               const val = num.toFixed(decimals);
                                               return e[isAmountKey] === 0 ? `${val}% @${label} Amount ` : `${val} @${label} Amount`;
                                             })
                                             .join(', ');
                                            return <tr key={i}>
                                                <td className=''>
                                                    <div className='border-top'>
                                                        <div className={`border-start border-end border-black overflow-hidden ${style?.rowWisePad} ${style?.word_break} overflow-hidden`}>
                                                            <div className={`d-flex no_break ${style?.font_1_12}`} >
                                                                <div className={`border-end ${style?.srNo}`}><p className=' text-center'>{i + 1}</p></div>
                                                                <div className={`border-end ${style?.jewelcode}`}>
                                                                    <p className=''>{e?.designno}</p>
                                                                    <img src={e?.DesignImage} alt="" className='imgWidth2 d-block mx-auto' onError={handleImageError} />
                                                                </div>
                                                                <div className={`border-end ${style?.diamond}`}>
                                                                    <div className="d-flex h-100">
                                                                        <div className={`border-end col-2`}>
                                                                            <div className="d-flex flex-column h-100 justify-content-between">
                                                                                <div>
                                                                                    {e?.diamonds?.map((ele, ind) => {
                                                                                        return <p className="" key={ind}>{ele?.ShapeName}</p>
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end col-2`}>
                                                                            <div className="d-flex flex-column h-100 justify-content-between">
                                                                                <div>
                                                                                    {e?.diamonds?.map((ele, ind) => {
                                                                                        return <p className="text-center" key={ind}>{ele?.SizeName}</p>
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end col-2`}>
                                                                            <div className="d-flex flex-column h-100 justify-content-between">
                                                                                <div>
                                                                                    {e?.diamonds?.map((ele, ind) => {
                                                                                        return <p className="text-end" key={ind}>{NumberWithCommas(ele?.Pcs, 0)}</p>
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end col-2`}>
                                                                            <div className="d-flex flex-column h-100 justify-content-between">
                                                                                <div>
                                                                                    {e?.diamonds?.map((ele, ind) => {
                                                                                        return <p className="text-end" key={ind}>{NumberWithCommas(ele?.Wt, 3)}</p>
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end col-2`}>
                                                                            <div className="d-flex flex-column h-100 justify-content-between">
                                                                                <div>
                                                                                    {e?.diamonds?.map((ele, ind) => {
                                                                                        return <p className="text-end" key={ind}>{NumberWithCommas(ele?.Rate, 2)}</p>
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`col-2`}>
                                                                            <div className="d-flex flex-column h-100 justify-content-between">
                                                                                <div>
                                                                                    {e?.diamonds?.map((ele, ind) => {
                                                                                        return <p className="text-end" key={ind}>{NumberWithCommas(ele?.Amount / headerData?.CurrencyExchRate, 2)}</p>
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className={`border-end ${style?.metal}`}>
                                                                    <div className={`d-flex ${e?.JobRemark === "" ? "h-100" : "border-bottom"}`}>
                                                                        <div className={`border-end ${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <div>
                                                                                    {
                                                                                        e?.metal?.map((ele, ind) => {
                                                                                            return ind === 0 && <p key={ind}>{ele?.ShapeName} {ele?.QualityName}</p>
                                                                                        })
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end ${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <div><p className=' text-end'>{NumberWithCommas(e?.grosswt, 3)}</p></div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end ${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <div>
                                                                                    {/* e?.metal?.length === 1 ? NumberWithCommas(e?.NetWt + e?.LossWt, 3) : ( )*/}
                                                                                    <p className=' text-end'>{NumberWithCommas(e?.netWtss, 3)}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end ${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <div>
                                                                                    {
                                                                                        e?.metal?.map((ele, ind) => {
                                                                                            return <p key={ind} className='text-end'>{ele.IsPrimaryMetal==1?  NumberWithCommas(ele?.Rate, 2):""} </p>
                                                                                        })
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <div>
                                                                                    <p className="text-end">{NumberWithCommas(e?.metalAmounts / headerData?.CurrencyExchRate, 2)}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {e?.JobRemark !== "" && <div className="">
                                                                        <p>Remark:</p>
                                                                        <p className='fw-bold'>{e?.JobRemark}</p>
                                                                    </div>}
                                                                </div>
                                                                <div className={`border-end ${style?.stone}`}>
                                                                    <div className="d-flex h-100">
                                                                        <div className={`border-end ${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <div>
                                                                                    {e?.colorstone?.map((ele, ind) => {
                                                                                        return <p className='' key={ind}>{ele?.ShapeName}</p>
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end ${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <div>
                                                                                    {e?.colorstone?.map((ele, ind) => {
                                                                                        return <p className='text-end' key={ind}>{NumberWithCommas(ele?.Pcs, 0)}</p>
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end ${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <div>
                                                                                    {e?.colorstone?.map((ele, ind) => {
                                                                                        return <p className='text-end' key={ind}>{NumberWithCommas(ele?.Wt, 3)}</p>
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end ${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <div>
                                                                                    {e?.colorstone?.map((ele, ind) => {
                                                                                        return <p className='text-end' key={ind}>{NumberWithCommas(ele?.Rate, 2)}</p>
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <div>
                                                                                    {e?.colorstone?.map((ele, ind) => {
                                                                                        return <p className='text-end' key={ind}>{NumberWithCommas(ele?.Amount / headerData?.CurrencyExchRate, 2)}</p>
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                                <div className={`border-end ${style?.labour}`}>
                                                                    <div className="d-flex h-100">
                                                                        <div className={`border-end col-6`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <div>
                                                                                    <p className='text-end'>{NumberWithCommas(e?.MaKingCharge_Unit, 2)}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`col-6`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <div>
                                                                                    <p className='text-end'>{NumberWithCommas((e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount) / headerData?.CurrencyExchRate, 2)}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className={`border-end ${style?.other}`}>
                                                                    {
                                                                        e?.misc?.map((ele, ind) => {
                                                                            return (ele?.IsHSCOE !== 0 && ele?.Amount !== 0) && <div key={ind} className='d-flex justify-content-between'>
                                                                                <p className='col-8'>{ele?.ShapeName}</p>
                                                                                <p className="text-end col-4">{NumberWithCommas(ele?.Amount / headerData?.CurrencyExchRate, 2)}</p>
                                                                            </div>
                                                                        })
                                                                    }
                                                                    {
                                                                        e?.other_details?.map((ele, ind) => {
                                                                            return ind <= 2 && <div key={ind} className='d-flex justify-content-between'>
                                                                                <p className='col-8'>{ele?.label}</p>
                                                                                <p className="text-end col-4">{NumberWithCommas(+ele?.value, 2)}</p>
                                                                            </div>
                                                                        })
                                                                    }
                                                                    {e?.TotalDiamondHandling !== 0 && <div className='d-flex justify-content-between'>
                                                                        <p className='col-8'>Handling</p>
                                                                        <p className="text-end col-4">{NumberWithCommas(e?.TotalDiamondHandling, 2)}</p>
                                                                    </div>
                                                                    }

                                                                    {(e?.miscLength === 0 && e?.MiscAmount !== 0) && <div className='d-flex justify-content-between'>
                                                                        <p className='col-8'>Other</p>
                                                                        <p className="text-end col-4">{NumberWithCommas(e?.MiscAmount / headerData?.CurrencyExchRate, 2)}</p>
                                                                    </div>
                                                                    }

                                                                </div>
                                                                <div className={`${style?.amount}`}>
                                                                    <div className="d-flex flex-column justify-content-between h-100">
                                                                        <p className='text-end fw-semibold'>{NumberWithCommas(e?.UnitCost / headerData?.CurrencyExchRate, 2)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className={`d-flex no_break ${style?.font_1_12}`} >
                                                                <div className={`border-end ${style?.srNo}`}></div>
                                                                <div className={`border-end ${style?.jewelcode}`}>
                                                                    {e?.HUID !== "" && <p className="text-center">HUID-{e?.HUID}</p>}
                                                                </div>
                                                                <div className={`lightGrey border-end border-top ${style?.diamond}`}>
                                                                    <div className="d-flex h-100">
                                                                        <div className={`border-end col-2`}>
                                                                            <div>
                                                                                <p className={` fw-semibold`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end col-2`}>
                                                                            <div className="d-flex flex-column h-100 justify-content-between">
                                                                                <p className={` fw-semibold`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end col-2`}>
                                                                            <div className="d-flex flex-column h-100 justify-content-between">
                                                                                <p className={` text-end fw-semibold`}>{e?.totals?.diamonds?.Pcs > 0 && NumberWithCommas(e?.totals?.diamonds?.Pcs, 0)}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end col-2`}>
                                                                            <div className="d-flex flex-column h-100 justify-content-between">
                                                                                <p className={` text-end fw-semibold`}>{e?.totals?.diamonds?.Wt > 0 && NumberWithCommas(e?.totals?.diamonds?.Wt, 3)}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end col-2`}>
                                                                            <div className="d-flex flex-column h-100 justify-content-between">
                                                                                <p className={` text-end fw-semibold`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`col-2`}>
                                                                            <div className="d-flex flex-column h-100 justify-content-between">
                                                                                <p className={` text-end fw-semibold`}>{e?.totals?.diamonds?.Amount > 0 && NumberWithCommas(e?.totals?.diamonds?.Amount / headerData?.CurrencyExchRate, 2)}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className={`lightGrey border-end border-top ${style?.metal}`}>
                                                                    <div className={`d-flex h-100`}>
                                                                        <div className={`border-end ${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end ${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <div><p className={`fw-semibold text-end`}>{e?.grosswt > 0 && NumberWithCommas(e?.grosswt, 3)}</p></div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end ${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold text-end`}>{(e?.netWtss > 0) && NumberWithCommas(e?.netWtss, 3)}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end ${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold text-end`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold text-end`}>{e?.metalAmounts > 0 && NumberWithCommas(e?.metalAmounts / headerData?.CurrencyExchRate, 2)}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className={`lightGrey border-end border-top ${style?.stone}`}>
                                                                    <div className="d-flex h-100">
                                                                        <div className={`border-end ${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end ${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold text-end`}>{e?.totals?.colorstone?.Pcs > 0 && NumberWithCommas(e?.totals?.colorstone?.Pcs, 0)}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end ${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold text-end`}>{e?.totals?.colorstone?.Wt > 0 && NumberWithCommas(e?.totals?.colorstone?.Wt, 3)}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`border-end ${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold text-end`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold text-end`}>{e?.totals?.colorstone?.Amount > 0 && NumberWithCommas(e?.totals?.colorstone?.Amount / headerData?.CurrencyExchRate, 2)}</p>
                                                                            </div>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                                <div className={`lightGrey border-end border-top ${style?.labour}`}>
                                                                    <div className="d-flex h-100">
                                                                        <div className={`border-end col-6`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold text-end`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`col-6`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold text-end`}>{NumberWithCommas((e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount) / headerData?.CurrencyExchRate, 2)}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className={`lightGrey border-end border-top ${style?.other}`}>
                                                                    <div className="d-flex h-100">
                                                                        <div className="col-6">
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold text-end`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-6">
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold text-end`}>{(e?.OtherCharges + e?.TotalDiamondHandling + e?.MiscAmount) > 0 && NumberWithCommas((e?.OtherCharges + e?.TotalDiamondHandling + e?.MiscAmount) / headerData?.CurrencyExchRate, 2)}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className={`lightGrey border-top ${style?.amount}`}>
                                                                    <div className="d-flex flex-column justify-content-between h-100">
                                                                        <p className=' text-end fw-semibold'>{e?.TotalAmount > 0 && NumberWithCommas(e?.UnitCost / headerData?.CurrencyExchRate, 2)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {e?.DiscountAmt !== 0 && <div className={`d-flex no_break ${style?.font_1_12}`} >
                                                                <div className={`border-end border-top ${style?.srNo}`}></div>
                                                                <div className={`border-end border-top ${style?.jewelcode}`}>
                                                                </div>
                                                                <div className={`lightGrey border-end border-top ${style?.diamond}`}>
                                                                    <div className="d-flex h-100">
                                                                        <div className={` col-2`}>
                                                                            <div>
                                                                                <p className={` fw-semibold`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={` col-2`}>
                                                                            <div className="d-flex flex-column h-100 justify-content-between">
                                                                                <p className={` fw-semibold`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={` col-2`}>
                                                                            <div className="d-flex flex-column h-100 justify-content-between">
                                                                                <p className={` text-end fw-semibold`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={` col-2`}>
                                                                            <div className="d-flex flex-column h-100 justify-content-between">
                                                                                <p className={` text-end fw-semibold`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={` col-2`}>
                                                                            <div className="d-flex flex-column h-100 justify-content-between">
                                                                                <p className={` text-end fw-semibold`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`col-2`}>
                                                                            <div className="d-flex flex-column h-100 justify-content-between">
                                                                                <p className={` text-end fw-semibold`}></p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className={`lightGrey border-end border-top ${style?.metal}`}>
                                                                    <div className="d-flex h-100">
                                                                        <div className={`${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <div><p className={`fw-semibold text-end`}></p></div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold text-end`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold text-end`}></p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`${style?.w_20}`}>
                                                                            <div className="d-flex flex-column justify-content-between h-100">
                                                                                <p className={`fw-semibold text-end`}></p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                </div>
                                                                <div className={`lightGrey border-end border-top ${style?.discountAmt}`}>
                                                                    <p className="fw-bold text-end">    Discount {discountDisplay || `${NumberWithCommas(e?.Discount, 2)} @ Total Amount`}	</p>
                                                                </div>
                                                                <div className={`lightGrey border-end border-top ${style?.discountAmtnumber}`}><p className='fw-bold text-end'>{NumberWithCommas(e?.DiscountAmt / headerData?.CurrencyExchRate, 2)}</p></div>
                                                                <div className={`lightGrey border-top ${style?.amount}`}>
                                                                    <div className="d-flex flex-column justify-content-between h-100">
                                                                        <p className=' text-end fw-semibold'>{NumberWithCommas(e?.TotalAmount / headerData?.CurrencyExchRate, 2)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        })
                                        }
                                        <tr>
                                            <td>
                                                {/* table total */}
                                                <div className={`border-start border-end border-black ${style?.rowWisePad} ${style?.word_break}`}>
                                                    <div className={`d-flex  border-bottom no_break lightGrey border-top ${style?.font_1_12}`}>
                                                        <div className={`border-end ${style?.srNo}`}><p className=' text-center min_height_13'></p></div>
                                                        <div className={`border-end ${style?.jewelcode} d-flex align-items-center justify-content-center`}>
                                                            <p className=' fw-semibold text-center'>Total</p>
                                                        </div>
                                                        <div className={`border-end ${style?.diamond}`}>
                                                            <div className="d-flex h-100">
                                                                <div className={`border-end col-2`}>
                                                                    <p className="lightGrey fw-semibold min_height_13"></p>
                                                                </div>
                                                                <div className={`border-end col-2`}>
                                                                    <p className="lightGrey fw-semibold min_height_13"></p>
                                                                </div>
                                                                <div className={`border-end col-2 d-flex align-items-center justify-content-end`}>
                                                                    <p className="lightGrey  text-end fw-semibold min_height_13">{data?.mainTotal?.diamonds?.Pcs > 0 && NumberWithCommas(data?.mainTotal?.diamonds?.Pcs, 0)}</p>
                                                                </div>
                                                                <div className={`border-end col-2 d-flex align-items-center justify-content-end`}>
                                                                    <p className="lightGrey  text-end fw-semibold min_height_13">{data?.mainTotal?.diamonds?.Wt > 0 && NumberWithCommas(data?.mainTotal?.diamonds?.Wt, 3)}</p>
                                                                </div>
                                                                <div className={`border-end col-2`}>
                                                                    <p className="lightGrey  text-end fw-semibold min_height_13"></p>
                                                                </div>
                                                                <div className={`col-2 d-flex align-items-center justify-content-end`}>
                                                                    <p className="lightGrey  text-end fw-semibold min_height_13">{data?.mainTotal?.diamonds?.Amount > 0 && NumberWithCommas(data?.mainTotal?.diamonds?.Amount / headerData?.CurrencyExchRate, 2)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className={`border-end ${style?.metal}`}>
                                                            <div className="d-flex h-100">
                                                                <div className={`border-end ${style?.w_20}`}>
                                                                    <p className="  fw-semibold min_height_13"></p>
                                                                </div>
                                                                <div className={`border-end ${style?.w_20} d-flex align-items-center justify-content-end`}>
                                                                    <p className='  fw-semibold text-end min_height_13'>{data?.mainTotal?.grosswt > 0 && NumberWithCommas(data?.mainTotal?.grosswt, 3)}</p>
                                                                </div>
                                                                <div className={`border-end ${style?.w_20} d-flex align-items-center justify-content-end`}>
                                                                    <p className='  fw-semibold text-end min_height_13'>{total?.netWt > 0 && NumberWithCommas(total?.netWt, 3)}</p>
                                                                </div>
                                                                <div className={`border-end ${style?.w_20}`}>
                                                                    <p className='  fw-semibold text-end min_height_13'></p>
                                                                </div>
                                                                <div className={`${style?.w_20} d-flex align-items-center justify-content-end`}>
                                                                    <p className='  fw-semibold text-end min_height_13'>{total?.metalAmount > 0 && NumberWithCommas(total?.metalAmount / headerData?.CurrencyExchRate, 2)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className={`border-end ${style?.stone}`}>
                                                            <div className="d-flex h-100">
                                                                <div className={`border-end ${style?.w_20}`}>
                                                                    <p className="  fw-semibold min_height_13"></p>
                                                                </div>
                                                                <div className={`border-end ${style?.w_20} d-flex align-items-center justify-content-end`}>
                                                                    <p className="  fw-semibold text-end min_height_13">{data?.mainTotal?.colorstone?.Pcs > 0 && NumberWithCommas(data?.mainTotal?.colorstone?.Pcs, 0)}</p>
                                                                </div>
                                                                <div className={`border-end ${style?.w_20} d-flex align-items-center justify-content-end`}>
                                                                    <p className="  fw-semibold text-end min_height_13">{data?.mainTotal?.colorstone?.Wt > 0 && NumberWithCommas(data?.mainTotal?.colorstone?.Wt, 3)}</p>
                                                                </div>
                                                                <div className={`border-end ${style?.w_20} d-flex align-items-center justify-content-center`}>
                                                                    <p className="  fw-semibold text-end min_height_13"></p>
                                                                </div>
                                                                <div className={`${style?.w_20} d-flex align-items-center justify-content-end`}>
                                                                    <p className="  fw-semibold text-end min_height_13">{data?.mainTotal?.colorstone?.Amount > 0 && NumberWithCommas(data?.mainTotal?.colorstone?.Amount / headerData?.CurrencyExchRate, 2)}</p>
                                                                </div>

                                                            </div>
                                                        </div>
                                                        <div className={`border-end ${style?.labour}`}>
                                                            <div className="d-flex h-100">
                                                                <div className={`border-end col-6`}>
                                                                    <p className="  fw-semibold text-end min_height_13"></p>
                                                                </div>
                                                                <div className={`col-6 d-flex align-items-center justify-content-end`}>
                                                                    <p className="  fw-semibold text-end min_height_13">{(data?.mainTotal?.total_Making_Amount + data?.mainTotal?.totalMiscAmount + data?.mainTotal?.diamonds?.SettingAmount + data?.mainTotal?.colorstone?.SettingAmount) > 0 && NumberWithCommas((data?.mainTotal?.total_Making_Amount + data?.mainTotal?.diamonds?.SettingAmount + data?.mainTotal?.colorstone?.SettingAmount) / headerData?.CurrencyExchRate, 2)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className={`border-end ${style?.other}`}>
                                                            <div className="d-flex h-100">
                                                                <div className="col-6">
                                                                    <p className="  fw-semibold text-end min_height_13"></p>
                                                                </div>
                                                                <div className="col-6 d-flex align-items-center justify-content-end">
                                                                    <p className="  fw-semibold text-end min_height_13">{data?.mainTotal?.total_otherCharge_Diamond_Handling > 0 && NumberWithCommas(data?.mainTotal?.total_otherCharge_Diamond_Handling / headerData?.CurrencyExchRate, 2)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className={`${style?.amount}`}>
                                                            <div className="d-flex h-100 d-flex align-items-center justify-content-end">
                                                                <p className=' text-end fw-semibold'>{data?.mainTotal?.total_amount > 0 && NumberWithCommas(data?.mainTotal?.total_amount / headerData?.CurrencyExchRate, 2)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                {/* taxes */}
                                                <div className={`d-flex border-start border-end border-bottom border-black no_break ${style?.font_1_12} ${style?.rowWisePad} ${style?.word_break}`}>
                                                    <div className={`${style?.taxes}`}>
                                                        {data?.mainTotal?.total_discount_amount > 0 && <p className="text-end">Total Discount </p>}
                                                        {data?.allTaxes?.map((e, i) => {
                                                            return <p className="text-end" key={i}>{e?.name} @ {e?.per} </p>
                                                        })}
                                                        {headerData?.AddLess !== 0 && <p className='text-end'>{headerData?.AddLess > 0 ? "Add" : "Less"}</p>}
                                                        <p className="text-end">Grand Total	</p>
                                                    </div>
                                                    <div className={`${style?.amount}`}>
                                                        {data?.mainTotal?.total_discount_amount > 0 && <p className="text-end">{NumberWithCommas(data?.mainTotal?.total_discount_amount / headerData?.CurrencyExchRate, 2)} </p>}
                                                        {data?.allTaxes?.map((e, i) => {
                                                            return <p className="text-end" key={i}>{NumberWithCommas(+e?.amount, 2)} </p>
                                                        })}
                                                        {headerData?.AddLess !== 0 && <p className='text-end'>{NumberWithCommas(headerData?.AddLess / headerData?.CurrencyExchRate, 2)}</p>}
                                                        <p className="text-end">{NumberWithCommas((data?.mainTotal?.total_amount / headerData?.CurrencyExchRate) + data?.allTaxes?.reduce((acc, cObj) => acc + +cObj?.amount, 0) + headerData?.AddLess / headerData?.CurrencyExchRate, 2)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
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
}

export default PackingList4
