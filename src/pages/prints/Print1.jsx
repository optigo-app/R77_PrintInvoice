import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { apiCall, checkMsg, formatAmount, handleImageError, isObjectEmpty } from '../../GlobalFunctions';
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import Loader from '../../components/Loader';
import "../../assets/css/prints/print1.css"

// const Print1Quote = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
const Print1 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
    const [result, setResult] = useState(null);
    const [msg, setMsg] = useState("");
    const [loader, setLoader] = useState(true);
    const [summary, setsummary_details] = useState([]);
    const [removeclass, setremoveclass] = useState(null);

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
                console.log(error);
            }
        };
        sendData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = (data) => {

        let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
        data.BillPrint_Json[0].address = address;

        const datas = OrganizeDataPrint(
            data?.BillPrint_Json[0],
            data?.BillPrint_Json1,
            data?.BillPrint_Json2
        );
        let arr = [];
        datas?.resultArray?.forEach((a) => {
            let obj = {...a};
            obj?.metal?.forEach((al) => {
                if(obj?.SrJobno === al?.StockBarcode){
                    obj.metal_color_code = al?.MetalColorCode
                }
            })
            arr.push(obj);
        })
        datas.resultArray = arr;

        setResult(datas);
    }

    useEffect(() => {
        if (result === null) {
            return
        }
        else {
            let summary_details = []
            // eslint-disable-next-line array-callback-return
            result.json1.map((v, i) => {
                summary_details.push({
                    "Categoryname": v.Categoryname,
                    "Categoryname_value": 1,
                })
            })
            summary_details.sort((a, b) => a?.Categoryname?.localeCompare(b?.Categoryname));
            var mergedObj = {};

            summary_details.forEach(function (obj) {
                var key = obj.Categoryname;
                if (mergedObj.hasOwnProperty(key)) {
                    mergedObj[key].Categoryname_value += obj.Categoryname_value;
                } else {
                    mergedObj[key] = {
                        "Categoryname": obj.Categoryname,
                        "Categoryname_value": obj.Categoryname_value,
                    };
                }
            });

            setsummary_details(Object.values(mergedObj));
        }
    }, [result])


    const handlePrintwithoutprice = () => {
        setremoveclass(false)
        setTimeout(() => {
            window.print();
        }, 0);
    };

    const handlePrintwithprice = () => {
        setremoveclass(true)
        setTimeout(() => {
            window.print();
        }, 0);
    };

  
    return (
        <>
            {loader ? <Loader /> : msg === '' ? <div><div className='container_qp1'>
                <div className='d_flex_qp1 flex_direction_colum_qp1 main_qp1'>
                    <div className='d_flex_qp1 print_btn_qp1'>
                        <div className='printbtn_qp1 print_btn_qp1 br_btn1_smp' onClick={handlePrintwithoutprice}>Print WithOut Price</div>
                        <div className='printbtn2_qp1 print_btn_qp1 br_btn2_smp' onClick={handlePrintwithprice}>Print With Price</div>
                    </div>
                    <div className='d_flex_qp1 pb-1 pt-1 ps-4'>
                        <div>Quotation# :</div>
                        <div className='quoteno_qp1 font_bold_qp1'>{result?.header?.InvoiceNo?.toUpperCase()}</div>
                        <div>Customer :</div>
                        <div className='quoteno_qp1 font_bold_qp1'>{result?.header?.Customercode}</div>
                    </div>
                    <div className='d-flex flex-wrap justify-content-start card_container_qp1'>
                        {result?.resultArray?.map((res, i) => {
                            
                            console.log("TCL: res", res)
                            return (
                                <div className='main_div_qp1' key={i}>
                                    <div className='itemdiv_qp1 b_t_qp1'>
                                        <div className='text_center_qp1 image_qp1'>
                                            <img
                                                // src={res?.DesignImage}
                                                src={res?.CDNDesignImageOrg}
                                                onError={(e) => handleImageError(e)}
                                                alt="design"
                                                className="imgdp10 i_qp1"
                                                width={"100%"}
                                                height="100%"
                                            /> 
                                        </div>
                                        <div className='d_flex_qp1 justify_between_qp1'>
                                            <div>Sr.No. { i + 1}</div>
                                            <div>{res?.designno}</div>
                                        </div>
                                        <div className={removeclass === false ? "j_h_qp1 d_flex_qp1 font_bold_qp1 main_width_qp1 text_center_qp1" : 'd_flex_qp1 font_bold_qp1 main_width_qp1 text_center_qp1'}>
                                            <div className='child1_w_qp1'></div>
                                            <div className='child2_w_qp1'>Wt</div>
                                            <div className={removeclass === false ? "print_btn_qp1" : ""}><div className='child3_w_qp1 text_end_qp1'>Amount</div></div>
                                        </div>
                                        <div>
                                            <div className={removeclass === false ? "j_qp1 d_flex_qp1 text_end_qp1" : 'd_flex_qp1 text_end_qp1'}>
                                            <div  className='child1_w_qp1 text_start_qp1'>
                                                {res?.MetalType} {res?.MetalPurity} &nbsp;
                                                {(res?.metal_color_code === '' || res?.metal_color_code === undefined) ? res?.MetalColor : res?.metal_color_code}</div>
                                                {/* {res?.metal?.map((m, ind) => {
                                                    return (
                                                        <div key={ind} className='child1_w_qp1 text_start_qp1'>{res?.MetalType} {res?.MetalPurity} {m?.MetalColorCode}</div>

                                                    )
                                                })} */}
                                                <div className='child2_w_qp1'>{(res?.NetWt + res?.LossWt)?.toFixed(2)}</div>
                                                <div className={removeclass === false ? "print_btn_qp1" : ""}><div className='child3_w_qp1'>{formatAmount(((res?.MetalAmount + res?.totals?.finding?.Amount) / result?.header?.CurrencyExchRate))}</div></div>
                                            </div>
                                            <div className={removeclass === false ? "j_qp1 d_flex_qp1 text_end_qp1" : 'd_flex_qp1 text_end_qp1'}>
                                                <div className='child1_w_qp1 text_start_qp1'>Diamond</div>
                                                <div className='child2_w_qp1'>{(res.totals?.diamonds?.Wt-res.totals?.solitaire?.Wt).toFixed(2)}</div>
                                                <div className={removeclass === false ? "print_btn_qp1" : ""}><div className='child3_w_qp1'>{formatAmount(((res?.totals?.diamonds?.Amount-res?.totals?.solitaire?.Amount) / result?.header?.CurrencyExchRate))}</div></div>
                                            </div>
                                            <div className={removeclass === false ? "j_qp1 d_flex_qp1 text_end_qp1" : 'd_flex_qp1 text_end_qp1'}>
                                                <div className='child1_w_qp1 text_start_qp1'>Solitaire</div>
                                                <div className='child2_w_qp1'>{res.totals?.solitaire?.Wt?.toFixed(2)}</div>
                                                <div className={removeclass === false ? "print_btn_qp1" : ""}><div className='child3_w_qp1'>{formatAmount((res?.totals?.solitaire?.Amount / result?.header?.CurrencyExchRate))}</div></div>
                                            </div>
                                            <div className={removeclass === false ? "j_qp1 d_flex_qp1 text_end_qp1" : 'd_flex_qp1 text_end_qp1'}>
                                                <div className='child1_w_qp1 text_start_qp1'>Color Stone</div>
                                                <div className='child2_w_qp1'>{(res.totals?.colorstone?.Wt-res.totals?.gemstone?.Wt)?.toFixed(2)}</div>
                                                <div className={removeclass === false ? "print_btn_qp1" : ""}><div className=' child3_w_qp1'>{formatAmount(((res?.totals?.colorstone?.Amount-res?.totals?.gemstone?.Amount) / result?.header?.CurrencyExchRate))}</div></div>
                                            </div>
                                            <div className={removeclass === false ? "j_qp1 d_flex_qp1 text_end_qp1" : 'd_flex_qp1 text_end_qp1'}>
                                                <div className='child1_w_qp1 text_start_qp1'>Gemstone</div>
                                                <div className='child2_w_qp1'>{res.totals?.gemstone?.Wt?.toFixed(2)}</div>
                                                <div className={removeclass === false ? "print_btn_qp1" : ""}><div className=' child3_w_qp1'>{formatAmount((res?.totals?.gemstone?.Amount / result?.header?.CurrencyExchRate))}</div></div>
                                            </div>
                                            <div className='d_flex_qp1 text_end_qp1'>
                                                <div className='child1_w_qp1 text_start_qp1'>Labour</div>
                                                <div className='child2_w_qp1'></div>
                                                <div className='child3_w_qp1'><div className={removeclass === false ? "print_btn_qp1" : ""}>{formatAmount(((res?.MakingAmount + res?.totals?.colorstone?.SettingAmount + res?.totals?.diamonds?.SettingAmount) / result?.header?.CurrencyExchRate))}</div></div>
                                            </div>
                                            <div className='d_flex_qp1 text_end_qp1'>
                                                <div className='child1_w_qp1 text_start_qp1'>Other</div>
                                                <div className='child2_w_qp1'></div>
                                                <div className='child3_w_qp1'><div className={removeclass === false ? "print_btn_qp1" : ""}>{formatAmount(((res?.OtherCharges +  res?.TotalDiamondHandling + res?.MiscAmount) / result?.header?.CurrencyExchRate))}</div></div>
                                            </div>
                                            <div className='d_flex_qp1 text_end_qp1'>
                                                <div className='child1_w_qp1 text_start_qp1'>Total</div>
                                                <div className='child2_w_qp1'></div>
                                                <div className='child3_w_qp1 font_bold_qp1'><div className={removeclass === false ? "print_btn_qp1" : ""}>{formatAmount((res?.TotalAmount / result?.header?.CurrencyExchRate))}</div></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                    </div>
                    <div className='d_flex_qp1 m_t_qp1 b_t_qp1 pad_l_qp1'>
                        <div className=''>
                            <div className='d_flex_qp1 br_black_qp1 br_right_remove_qp1'>
                                <div className='fix_bottom_qp1'>
                                    <div className='background_qp1 font_bold_qp1 text_center_qp1 br_bottom_qp1'>SUMMARY</div>
                                    <div className='d_flex_qp1'>
                                        <div className={removeclass === false ? "br_right_r_qp1 br_right_qp1 d_flex_qp1 flex_direction_colum_qp1 justify_between_qp1" : "br_right_qp1 d_flex_qp1 flex_direction_colum_qp1 justify_between_qp1"} >
                                            <div className='d_flex_qp1 justify_between_qp1'>
                                                <div className='padding_left_qp1 font_bold_qp1'>
                                                    <p>GOLD IN 24KT</p>
                                                    <p>GROSS WT</p>
                                                    <p>*(G+D) WT</p>
                                                    <p>NET WT</p>
                                                    <p>DIAMOND WT</p>
                                                    <p>SOLITAIRE WT</p>
                                                    <p>STONE WT</p>
                                                    <p>GEMSTONE WT</p>
                                                </div>
                                                <div className='padding_right_qp1 text_end_qp1'>
                                                    <p>{result?.mainTotal?.total_purenetwt.toFixed(2)} gm</p>
                                                    <p>{result?.mainTotal?.grosswt.toFixed(2)} gm</p>
                                                    <p>{((result?.mainTotal?.diamonds?.Wt / 5) + (result?.mainTotal?.netwt + result?.mainTotal?.lossWt))?.toFixed(2)} gm</p>
                                                    <p>{(result?.mainTotal?.netwt + result?.mainTotal?.lossWt).toFixed(2)} gm</p>
                                                    <p>{result?.mainTotal?.diamonds?.Pcs} / {(result?.mainTotal?.diamonds?.Wt-result?.mainTotal?.solitaire?.Wt).toFixed(2)} cts</p>
                                                    <p>{result?.mainTotal?.diamonds?.Pcs} / {result?.mainTotal?.solitaire?.Wt.toFixed(2)} cts</p>
                                                    <p>{result?.mainTotal?.colorstone?.Pcs} / {(result?.mainTotal?.colorstone?.Wt-result?.mainTotal?.gemstone?.Wt).toFixed(2)} cts</p>
                                                    <p>{result?.mainTotal?.colorstone?.Pcs} / {result?.mainTotal?.gemstone?.Wt.toFixed(2)} cts</p>
                                                </div>
                                            </div>
                                            <div className='d_flex_qp1 h_qp1 summary3_w_qp1 justify_between_qp1 background_qp1 br_top_qp1'>
                                                <div className='padding_left_qp1 font_bold_qp1'>
                                                    <p></p>
                                                </div>
                                                <div className='padding_right_qp1 text_end_qp1'>
                                                    <p></p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={removeclass === false ? "print_btn_qp1 d_flex_qp1 flex_direction_colum_qp1 justify_between_qp1" : "d_flex_qp1 flex_direction_colum_qp1 justify_between_qp1"}>
                                            <div>
                                                <div className='d_flex_qp1 summary4_w_qp1 justify_between_qp1'>
                                                    <div className='padding_left_qp1 font_bold_qp1'>
                                                        <p>GOLD</p>
                                                        <p>DIAMOND</p>
                                                        <p>SOLITAIRE</p>
                                                        <p>CST</p>
                                                        <p>GEMSTONE</p>
                                                        <p>MAKING</p>
                                                        <p>OTHER</p>
                                                        <p>{result?.header?.AddLess >= 0 ? "Add" : "Less"}</p>
                                                    </div>
                                                    <div className='padding_right_qp1 text_end_qp1'>
                                                        <p>{formatAmount(((result?.mainTotal?.MetalAmount + result?.mainTotal?.finding?.Amount)/result?.header?.CurrencyExchRate))}</p>
                                                        <p>{formatAmount(((result?.mainTotal?.diamonds?.Amount-result?.mainTotal?.solitaire?.Amount ) / result?.header?.CurrencyExchRate))}</p>
                                                        <p>{formatAmount((result?.mainTotal?.solitaire?.Amount / result?.header?.CurrencyExchRate))}</p>
                                                        <p>{formatAmount(((result?.mainTotal?.colorstone?.Amount-result?.mainTotal?.gemstone?.Amount) / result?.header?.CurrencyExchRate))}</p>
                                                        <p>{formatAmount((result?.mainTotal?.gemstone?.Amount / result?.header?.CurrencyExchRate))}</p>
                                                        <p>{formatAmount(((result?.mainTotal?.total_labour?.labour_amount + result?.mainTotal?.colorstone?.SettingAmount + result?.mainTotal?.diamonds?.SettingAmount) / result?.header?.CurrencyExchRate))}</p>
                                                        <p>{formatAmount(((result?.mainTotal?.total_other_charges + result?.mainTotal?.misc?.Amount + result?.mainTotal?.total_diamondHandling) / result?.header?.CurrencyExchRate))}</p>
                                                        <p>{formatAmount(((result?.header?.AddLess) / result?.header?.CurrencyExchRate))}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='d_flex_qp1 summary4_w_qp1 justify_between_qp1 background_qp1 br_top_qp1'>
                                                <div className='padding_left_qp1 font_bold_qp1'>
                                                    <p>TOTAL</p>
                                                </div>
                                                <div className='padding_right_qp1 text_end_qp1'>
                                                    <p>{formatAmount((result?.mainTotal?.total_amount / result?.header?.CurrencyExchRate))}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                           
                        </div>
                        <div className=' d_flex_qp1'>
                                <div className='summary3_w_qp1 br_black_qp1'>
                                    <div className='background_qp1 font_bold_qp1 text_center_qp1 br_bottom_qp1'>SUMMARY</div>
                                    <div>
                                        {
                                            summary?.map((el, ind) => {
                                                return <div className='d-flex justify-content-between align-items-center px-1' key={ind}>
                                                            <div>{el.Categoryname}</div>
                                                            <div>{el.Categoryname_value}</div>
                                                        </div>
                                            })
                                        }
                                    </div>
                                </div>
                                <div className='d_flex_qp1 summary_check_qp1 br_black_qp1 check_w_qp1'>
                                    <div className='padding_bottom_qp1'>
                                        Checked By
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>
            </div></div> : <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto"> {msg} </p>}
        </>
    )
}

export default Print1