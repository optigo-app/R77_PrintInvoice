import React, { useEffect, useState } from 'react';
import style from "../../assets/css/prints/CustomerDailyStatement.module.css"
import { NumberWithCommas, apiCall, checkMsg, handlePrint, isObjectEmpty } from '../../GlobalFunctions';
import Loader from '../../components/Loader';
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import { cloneDeep } from 'lodash';

const CustomerDailyStatement = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
    const [loader, setLoader] = useState(true);
    const [msg, setMsg] = useState("");
    const [data, setData] = useState({});
    const [headerData, setHeaderData] = useState({});

    const loadData = (data) => {
        let datas = OrganizeDataPrint(data?.BillPrint_Json[0], data?.BillPrint_Json1, data?.BillPrint_Json2);
        setHeaderData(data?.BillPrint_Json[0]);
        let resultArr = [];
        datas?.resultArray?.forEach((e, i) => {
            let obj = cloneDeep(e);
            let findBrandName = resultArr?.findIndex((ele, ind) => (e?.BrandName)?.toLowerCase() === (ele?.BrandName)?.toLowerCase());
            if (findBrandName === -1) {
                resultArr.push(obj);
            } else {
                if (obj?.MaKingCharge_Unit !== resultArr[findBrandName]?.MaKingCharge_Unit) {
                    resultArr[findBrandName].MaKingCharge_Unit = "MIX";
                } else {
                    // resultArr[findBrandName].MaKingCharge_Unit += obj?.MaKingCharge_Unit;
                }
                if (obj?.Tunch === resultArr[findBrandName]?.Tunch) {
                    resultArr[findBrandName].Tunch = "MIX";
                }
                resultArr[findBrandName].Quantity += obj?.Quantity;
                resultArr[findBrandName].Wastage += obj?.Wastage;
                resultArr[findBrandName].totals.colorstone.Wt += obj?.totals.colorstone.Wt;

            }
        });
        datas.resultArray = resultArr;
        setData(datas);
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
        loader ? <Loader /> : msg === "" ? <div className={`container max_width_container pad_60_allPrint mt-2 ${style?.CustomerDailyStatement} px-1`}>
            {/* print button */}
            <div className={`d-flex justify-content-center mb-4 align-items-center ${style?.print_sec_sum4} pt-4 pb-4 `}>
                <div className="form-check ps-3 mt-2">
                    <input
                        type="button"
                        className="btn_white blue"
                        value="Print"
                        onClick={(e) => handlePrint(e)}
                    />
                </div>
            </div>
            {/* customer details */}
            <div className="d-flex">
                <p>Bill Statement of:<span className='ps-3 fw-bold pe-4'>{headerData?.Customercode}</span></p>
                <p>Date: <span className="ps-3 fw-bold">{headerData?.EntryDate}</span></p>
            </div>
            {/* table */}
            {/* <div className="d-flex border-black border lightGrey">
                <div className={`${style?.bill} border-end border-black d-flex height_inherit align-items-center`}><p className="fw-bold w-100 text-center">Bill#</p></div>
                <div className={`${style?.items_sec}`}>
                    <div className="d-flex">
                        <div className={`${style?.items} d-grid height_inherit`}>
                            <div className={`d-flex`}>
                                <div className='col-5 d-flex height_inherit align-items-center border-end border-black justify-content-center'><p className="fw-bold ">Item</p> </div>
                                <div className='col-3 d-flex height_inherit align-items-center border-end border-black justify-content-center'><p className="fw-bold ">Pcs</p> </div>
                                <div className='col-4 d-flex height_inherit align-items-center border-end border-black justify-content-center'><p className="fw-bold ">LB</p></div>
                            </div>
                        </div>

                        <div className={`${style?.ratePerGm} border-end border-black d-flex height_inherit align-items-center justify-content-center text-center`}><p className="fw-bold ">Rate Gm/Ct</p></div>
                        <div className={`${style?.per} border-end border-black d-flex height_inherit align-items-center justify-content-center`}><p className="fw-bold ">Per</p></div>
                        <div className={`${style?.taxPer} border-end border-black d-flex height_inherit align-items-center justify-content-center`}><p className="fw-bold ">TAX (%)</p></div>

                        <div className={`${style?.part3}`}>
                            <div className="d-flex w-100">
                                <div className={`d-flex ${style?.gross_gold_ct_wt}`}>
                                    <div className={`${style?.gross_sec_7} d-flex height_inherit align-items-center justify-content-center text-center border-end border-black`}><p className='fw-bold'> Gross Gold / Ct Wt</p></div>
                                    <div className={`${style?.gross_sec_7} d-flex height_inherit align-items-center justify-content-center text-center border-end border-black`}><p className='fw-bold'> Beads</p></div>
                                    <div className={`${style?.gross_sec_7} d-flex height_inherit align-items-center justify-content-center text-center border-end border-black`}><p className='fw-bold'> Label net/CT Wt</p></div>
                                    <div className={`${style?.gross_sec_7} d-flex height_inherit align-items-center justify-content-center text-center border-end border-black`}><p className='fw-bold'> Stone Less</p></div>
                                    <div className={`${style?.gross_sec_7} d-flex height_inherit align-items-center justify-content-center text-center border-end border-black`}><p className='fw-bold'> Final Wt/ Ct Wt</p></div>
                                    <div className={`${style?.gross_sec_7} d-flex height_inherit align-items-center justify-content-center text-center border-end border-black`}><p className='fw-bold'> %</p></div>
                                    <div className={`${style?.gross_sec_7} d-flex height_inherit align-items-center justify-content-center text-center border-end border-black`}><p className='fw-bold'> Wastage </p></div>
                                </div>
                                <div className={`${style?.final}`}>
                                    <p className="fw-bold text-center border-bottom border-black">Final</p>
                                    <div className={`d-flex`}>
                                        <p className="col-6 fw-bold border-end border-black text-center">Fine</p>
                                        <p className="col-6 fw-bold text-center">Cash</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}
            <table border="1" style={{ fontSize: "13px", borderCollapse: "collapse", border: "1px solid #1B1919", }}>
                <tbody>
                    <tr style={{ backgroundColor: "#F1F1F1" }}>
                        <td style={{ textAlign: "center", borderRight: "1px solid", fontWeight: 700 }} className={`${style?.bill}`} rowSpan={2} >
                            <div>Bill#</div>
                        </td>
                        <td style={{ textAlign: "center", borderRight: "1px solid", fontWeight: 700 }} className={`${style?.items_sec1}`} rowSpan={2} >
                            <div>Item</div>
                        </td>
                        <td style={{ textAlign: "center", borderRight: "1px solid", fontWeight: 700 }} className={`${style?.items_sec1}`} rowSpan={2} >
                            <div style={{}}>Pcs</div>
                        </td>
                        <td style={{ textAlign: "center", borderRight: "1px solid", fontWeight: 700 }} className={`${style?.items_sec1}`} rowSpan={2} >
                            <div style={{}}>LB</div>
                        </td>
                        <td style={{ textAlign: "center", borderRight: "1px solid", fontWeight: 700 }} className={`${style?.items_sec1}`} rowSpan={2} >
                            <div style={{}}>
                                Rate
                                Gm/Ct
                            </div>
                        </td>
                        <td style={{ textAlign: "center", borderRight: "1px solid", fontWeight: 700 }} className={`${style?.items_sec1}`} rowSpan={2} >
                            <div style={{}}>Per</div>
                        </td>
                        <td style={{ textAlign: "center", borderRight: "1px solid", fontWeight: 700 }} className={`${style?.items_sec1}`} rowSpan={2} >
                            <div style={{}}>TAX(%)</div>
                        </td>
                        <td style={{ textAlign: "center", borderRight: "1px solid", fontWeight: 700 }} className={`${style?.items_sec1}`} rowSpan={2} >
                            <div style={{}}>
                                Gross
                                Gold/Ct Wt
                            </div>
                        </td>
                        <td style={{ textAlign: "center", borderRight: "1px solid", fontWeight: 700 }} className={`${style?.items_sec1}`} rowSpan={2} >
                            <div style={{}}>Beads</div>
                        </td>
                        <td style={{ textAlign: "center", borderRight: "1px solid", fontWeight: 700 }} className={`${style?.items_sec1}`} rowSpan={2} >
                            <div style={{}}>Moti</div>
                        </td>
                        <td style={{ textAlign: "center", borderRight: "1px solid", fontWeight: 700 }} className={`${style?.items_sec1}`} rowSpan={2} >
                            <div style={{}}>
                                Label
                                net/CT Wt
                            </div>
                        </td>
                        <td style={{ textAlign: "center", borderRight: "1px solid", fontWeight: 700 }} className={`${style?.items_sec1}`} rowSpan={2} >
                            <div style={{}}>
                                Stone
                                Less
                            </div>
                        </td>
                        <td style={{ textAlign: "center", borderRight: "1px solid", fontWeight: 700 }} className={`${style?.items_sec1}`} rowSpan={2} >
                            <div style={{}}>
                                Final Wt/
                                Ct Wt
                            </div>
                        </td>
                        <td style={{ textAlign: "center", borderRight: "1px solid", fontWeight: 700 }} className={`${style?.items_sec1}`} rowSpan={2} >
                            <div style={{}}>%</div>
                        </td>
                        <td style={{ textAlign: "center", borderRight: "1px solid", fontWeight: 700 }} className={`${style?.items_sec1}`} rowSpan={2} >
                            <div style={{}}>Wastage</div>
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 700 }} className={`${style?.bill}`} colSpan="2">
                            <div>Final</div>
                        </td>
                    </tr>

                    <tr style={{ borderBottom: "1px solid", backgroundColor: "#F1F1F1" }}>
                        <td style={{ borderRight: "1px solid", borderTop: "1px solid", fontWeight: 400 }}>
                            <div> Fine</div>
                        </td>
                        <td style={{ borderRight: "1px solid", borderTop: "1px solid", fontWeight: 400 }}>
                            <div> Cash</div>
                        </td>
                    </tr>

                    {data?.resultArray?.map((e, i) => {
                        
                        console.log("TCL: CustomerDailyStatement -> eeee",e )
                        return <tr key={i}>
                            {i === 0 && <td style={{ borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.bill}`} rowSpan={data?.resultArray?.length}>
                                <div>{headerData?.InvoiceNo}</div>
                            </td>}
                            <td style={{ borderRight: "1px solid", borderBottom: "1px solid", }} className={`${style?.items_sec1}`} >
                                <div>{e?.BrandName}</div>
                            </td>
                            <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                                <div style={{}}>{NumberWithCommas(e?.Quantity, 0)}</div>
                            </td>
                            <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                                <div style={{}}>{NumberWithCommas(e?.MaKingCharge_Unit, 2)}</div>
                            </td>
                            {i === 0 && <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} rowSpan={data?.resultArray?.length}>
                                <div style={{}}>
                                    Rate
                                    Gm/Ct
                                </div>
                            </td>}
                            {i === 0 && <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} rowSpan={data?.resultArray?.length}>
                                <div style={{}}></div>
                            </td>}
                            {i === 0 && <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} rowSpan={data?.resultArray?.length}>
                                {data?.allTaxes?.map((e, i) => {
                                    return <p key={i}>{e?.name} @ {e?.per}</p>
                                })}

                                <div style={{}}></div>
                            </td>}
                            <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                                <div style={{}}>
                                    {NumberWithCommas(e?.grosswt, 3)}
                                </div>
                            </td>
                            <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                                <div style={{}}>Beads</div>
                            </td>
                            <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                                <div style={{}}>Moti</div>
                            </td>
                            <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                                <div style={{}}>
                                    Label
                                    net/CT Wt
                                </div>
                            </td>
                            <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                                <div style={{}}>
                                    {NumberWithCommas(e?.DiamondCTWwithLoss, 3)}
                                </div>
                            </td>
                            <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                                <div style={{}}>
                                    {NumberWithCommas(e?.MetalDiaWt, 3)}
                                </div>
                            </td>
                            <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                                <div style={{}}>{NumberWithCommas(e?.MetalPriceRatio, 3)}</div>
                            </td>
                            <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                                <div style={{}}>{NumberWithCommas(e?.Wastage, 3)}</div>
                            </td>
                            <td style={{ borderRight: "1px solid", borderTop: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`}>
                                <div style={{ width: "50px", textAlign: "end" }}> </div>
                            </td>
                            <td style={{ borderRight: "1px solid", borderTop: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`}>
                                <div style={{ width: "50px", textAlign: "end" }}>{NumberWithCommas(e?.TotalAmount, 2)}</div>
                            </td>
                        </tr>
                    })}
                    <tr style={{ backgroundColor: "#F1F1F1", fontWeight: 700 }}>
                        <td style={{ borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.bill}`} rowSpan={data?.resultArray?.length}>
                            <div>Total</div>
                        </td>
                        <td style={{ borderRight: "1px solid", borderBottom: "1px solid", }} className={`${style?.items_sec1}`} >
                            <div></div>
                        </td>
                        <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                            <div style={{}}></div>
                        </td>
                        <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                            <div style={{}}></div>
                        </td>
                        <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} rowSpan={data?.resultArray?.length}>
                            <div style={{}}>

                            </div>
                        </td>
                        <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} rowSpan={data?.resultArray?.length}>
                            <div style={{}}></div>
                        </td>
                        <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} rowSpan={data?.resultArray?.length}>
                            <div style={{}}></div>
                        </td>
                        <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                            <div style={{}}>

                            </div>
                        </td>
                        <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                            <div style={{}}></div>
                        </td>
                        <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                            <div style={{}}></div>
                        </td>
                        <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                            <div style={{}}>

                            </div>
                        </td>
                        <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                            <div style={{}}>

                            </div>
                        </td>
                        <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                            <div style={{}}>

                            </div>
                        </td>
                        <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                            <div style={{}}></div>
                        </td>
                        <td style={{ textAlign: "end", borderRight: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`} >
                            <div style={{}}></div>
                        </td>
                        <td style={{ borderRight: "1px solid", borderTop: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`}>
                            <div style={{ width: "50px", textAlign: "end" }}> </div>
                        </td>
                        <td style={{ borderRight: "1px solid", borderTop: "1px solid", borderBottom: "1px solid" }} className={`${style?.items_sec1}`}>
                            <div style={{ width: "50px", textAlign: "end" }}>{NumberWithCommas(data?.mainTotal?.total_amount, 2)}</div>
                        </td>
                    </tr>
                </tbody>
            </table>
            {/* data */}
            {/* <div className="d-flex border-black border-start border-end border-bottom">
                <div className={`${style?.bill} d-flex justify-content-center flex-column border-end border-black`}>
                    <p className="fw-bold lh-1">{headerData?.InvoiceNo}</p>
                    <p className='lh-1'>Jewellery Sale</p>
                </div>
                <div className={`${style?.items_sec}`}>
                    <div className="d-flex">
                        <div className={`${style?.items} d-grid height_inherit`}>
                            {data?.resultArray?.map((e, i) => {
                                return <div className={`d-flex ${i + 1 < data?.resultArray?.length && `border-bottom border-black`}`} key={i}>
                                    <div className='col-5 d-flex height_inherit align-items-center border-end border-black py-1 '><p className="">{e?.BrandName}</p> </div>
                                    <div className='col-3 d-flex height_inherit align-items-center border-end border-black justify-content-end py-1'><p className="">{e?.Quantity}</p> </div>
                                    <div className='col-4 d-flex height_inherit align-items-center border-end border-black justify-content-end py-1'><p className="">{e?.MaKingCharge_Unit !== "MIX" ? NumberWithCommas(e?.MaKingCharge_Unit, 2) : e?.MaKingCharge_Unit}</p></div>
                                </div>
                            })}
                        </div>

                        <div className={`${style?.ratePerGm} border-end border-black d-flex height_inherit align-items-center justify-content-end text-end`}><p className=" "></p></div>
                        <div className={`${style?.per} border-end border-black d-flex height_inherit align-items-center justify-content-end`}><p className=" "></p></div>
                        <div className={`${style?.taxPer} border-end border-black d-flex height_inherit align-items-end justify-content-center flex-column text-end`}>
                            {
                                data?.allTaxes?.map((e, i) => {
                                    return <p key={i}>{e?.name} @ {e?.per} </p>
                                })
                            }
                        </div>

                        <div className={`${style?.part3} d-grid height_inherit`}>
                            <div className="d-flex w-100">

                                <div className={`d-flex ${style?.gross_gold_ct_wt}`}>
                                    <div className={`${style?.gross_sec_7}  height_inherit border-end border-black`}>
                                        {data?.resultArray?.map((e, i) => {
                                            return <p className='' key={i}> {NumberWithCommas(e?.grosswt, 3)}</p>
                                        })}
                                    </div>
                                    <div className={`${style?.gross_sec_7}  height_inherit border-end border-black`}>
                                        {data?.resultArray?.map((e, i) => {
                                            // return <p className='' key={i}> {NumberWithCommas(e?.grosswt, 3)}</p>
                                        })}
                                    </div>
                                    <div className={`${style?.gross_sec_7}  height_inherit border-end border-black`}>
                                        {data?.resultArray?.map((e, i) => {
                                            return <p className='' key={i}> {NumberWithCommas(e?.NetWt, 3)}</p>
                                        })}
                                    </div>
                                    <div className={`${style?.gross_sec_7}  height_inherit border-end border-black`}>
                                        {data?.resultArray?.map((e, i) => {
                                            // return <p className='' key={i}> {NumberWithCommas(e?.totals?.colorstone?.Wt, 3)}</p>
                                        })}
                                    </div>
                                    <div className={`${style?.gross_sec_7}  height_inherit border-end border-black`}>
                                        {data?.resultArray?.map((e, i) => {
                                            // return <p className='text-end' key={i}> {e?.MaKingCharge_Unit !== "MIX" ? NumberWithCommas(e?.MaKingCharge_Unit, 2) : e?.MaKingCharge_Unit}</p>
                                        })}
                                    </div>
                                    <div className={`${style?.gross_sec_7}  height_inherit border-end border-black`}>
                                        {data?.resultArray?.map((e, i) => {
                                            return <p className='text-end' key={i}> {e?.MaKingCharge_Unit !== "MIX" ? NumberWithCommas(e?.MaKingCharge_Unit, 2) : e?.MaKingCharge_Unit}</p>
                                        })}
                                    </div>
                                    <div className={`${style?.gross_sec_7}  height_inherit border-end border-black`}>
                                        {data?.resultArray?.map((e, i) => {
                                            return <p className='text-end' key={i}> {NumberWithCommas(e?.Wastage, 2)}</p>
                                        })}
                                    </div>
                                </div>
                                <div className={`${style?.final} d-grid height_inherit`}>
                                    <div className={`d-flex`}>
                                        <p className="col-6 d-flex align-items-center border-end border-black justify-content-end">0.000</p>
                                        <p className="col-6 d-flex align-items-center justify-content-end">22,750.00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}
            {/* total */}
            {/* <div className="d-flex border-black border-start border-end border-bottom lightGrey">
                <div className={`${style?.bill} d-flex justify-content-center flex-column border-end border-black`}>
                    <p className="fw-bold lh-1">Total</p>
                </div>
                <div className={`${style?.items_sec}`}>
                    <div className="d-flex">
                        <div className={`${style?.items} d-grid height_inherit`}>
                            <div className={`d-flex `}>
                                <div className='col-5 d-flex height_inherit align-items-center border-end border-black '><p className=""></p> </div>
                                <div className='col-3 d-flex height_inherit align-items-center border-end border-black justify-content-end'><p className=""></p> </div>
                                <div className='col-4 d-flex height_inherit align-items-center border-end border-black justify-content-end'><p className=""></p></div>
                            </div>
                        </div>

                        <div className={`${style?.ratePerGm} border-end border-black d-flex height_inherit align-items-center justify-content-end text-end`}><p className=" "></p></div>
                        <div className={`${style?.per} border-end border-black d-flex height_inherit align-items-center justify-content-end`}><p className=" "></p></div>
                        <div className={`${style?.taxPer} border-end border-black d-flex height_inherit align-items-end justify-content-center flex-column text-end`}>
                            <p className=" "> </p>
                            <p className=""></p>
                        </div>

                        <div className={`${style?.part3} d-grid height_inherit`}>
                            <div className="d-flex w-100">
                                <div className={`d-flex ${style?.gross_gold_ct_wt}`}>
                                    <div className={`${style?.gross_sec_7} d-flex height_inherit align-items-center justify-content-end border-end border-black`}><p className=''> 3.000</p></div>
                                    <div className={`${style?.gross_sec_7} d-flex height_inherit align-items-center justify-content-end border-end border-black`}><p className=''> 2.000</p></div>
                                    <div className={`${style?.gross_sec_7} d-flex height_inherit align-items-center justify-content-end border-end border-black`}><p className=''> 4.900</p></div>
                                    <div className={`${style?.gross_sec_7} d-flex height_inherit align-items-center justify-content-end border-end border-black`}><p className=''> 1.900</p></div>
                                    <div className={`${style?.gross_sec_7} d-flex height_inherit align-items-center justify-content-end border-end border-black`}><p className=''> 3.000</p></div>
                                    <div className={`${style?.gross_sec_7} d-flex height_inherit align-items-center justify-content-end border-end border-black`}><p className=''>76.000</p></div>
                                    <div className={`${style?.gross_sec_7} d-flex height_inherit align-items-center justify-content-end border-end border-black`}><p className=''>10.000</p></div>
                                </div>
                                <div className={`${style?.final} d-grid height_inherit`}>
                                    <div className={`d-flex`}>
                                        <p className="col-6 d-flex align-items-center border-end border-black justify-content-end text-end">0.000</p>
                                        <p className="col-6 d-flex align-items-center justify-content-end text-end">22,750.00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}
        </div> : <p className='text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto'>{msg}</p>
    )
}

export default CustomerDailyStatement
