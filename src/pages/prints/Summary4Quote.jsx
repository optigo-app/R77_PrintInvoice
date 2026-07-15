import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { apiCall, checkMsg, formatAmount, handleImageError, isObjectEmpty } from '../../GlobalFunctions';
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import Loader from '../../components/Loader';
import '../../assets/css/prints/summary4quote.css'

const Summary4Quote = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
    const [result, setResult] = useState(null);
    const [msg, setMsg] = useState("");
    const [loader, setLoader] = useState(true);
    const [imgFlag, setImgFlag] = useState(true);
    const [summary, setSummary] = useState([]);
    const [withHeader, setWithHeader] = useState(true);
    const [withImage, setWithImage] = useState(true);

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
    }, []);

    const loadData = (data) => {

        let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
        data.BillPrint_Json[0].address = address;

        const datas = OrganizeDataPrint(
            data?.BillPrint_Json[0],
            data?.BillPrint_Json1,
            data?.BillPrint_Json2
        );

        setResult(datas);
    }

    const handleImgShow = (e) => {
        if (imgFlag) setImgFlag(false);
        else {
            setImgFlag(true);
        }
    };



    useEffect(() => {
        if (result?.json1) {
            let summaryDetails = result.json1.map(v => ({
                "Categoryname": v.Categoryname,
                "SubCategoryname": v.SubCategoryname,
                "Categoryname_value": 1,
            }));

            const mergedObj = summaryDetails.reduce((acc, obj) => {
                if (acc[obj.Categoryname]) {
                    acc[obj.Categoryname].Categoryname_value += obj.Categoryname_value;
                } else {
                    acc[obj.Categoryname] = {
                        "Categoryname": obj.Categoryname,
                        "SubCategoryname": obj.SubCategoryname,
                        "Categoryname_value": obj.Categoryname_value,
                    };
                }
                return acc;
            }, {});

            setSummary(Object.values(mergedObj));
        }
    }, [result]);



    const PrintScreen = () => {
        window.print();
    }




    return (
        <>
            {loader ? <Loader /> : msg === '' ?
                <div className='main'>
                    <div className='d_flex_smp float_right_smp d_none_print'>
                        <div className='print_m'>
                            <input
                                type='checkbox'
                                checked={withHeader}
                                onChange={() => setWithHeader(!withHeader)}
                            />
                            <label className='print_padd_smp'>With Header</label>
                        </div>
                        <div className='print_m'>
                            <input
                                type='checkbox'
                                checked={withImage}
                                onChange={() => setWithImage(!withImage)}
                            />
                            <label className='print_padd_smp'>With Image</label>
                        </div>

                        <input type="button" class="print_btn_smp" onClick={() => PrintScreen()} value="Print" id="printbtn"></input>
                    </div>
                    <div className='container_smp'>
                        <div className={withHeader === true ? "margin_10_bottom_smp" : "d_none_smp"}>
                            {result?.header?.PrintHeadLabel === "" ? "" :
                                <h3 className='heading'>{result?.header?.PrintHeadLabel}</h3>
                            }
                            <div className='d_flex_smp justify_between_smp header_border_smp'>
                                <div className='font_13_5_smp'>
                                    <p className="font_bold_smp font_20_smp">{result?.header?.CompanyFullName}</p>
                                    <p>{result?.header?.CompanyAddress}</p>
                                    <p>{result?.header?.CompanyAddress2}</p>
                                    <p>{result?.header?.CompanyCity}-{result?.header.CompanyPinCode}, {result?.header?.CompanyState}({result?.header?.CompanyCountry})</p>
                                    <p>T {result?.header?.CompanyTellNo} | TOLL FREE {result?.header?.CompanyTollFreeNo}</p>
                                    <p>{result?.header?.CompanyEmail} | {result?.header?.CompanyWebsite}</p>
                                    <p>{result?.header?.Company_VAT_GST_No} | {result?.header?.Company_CST_STATE}-{result?.header?.Company_CST_STATE_No} | PAN-{result?.header?.Com_pannumber}</p>
                                    <p>CIN-{result?.header.CINNO} | MSME-{result?.header.MSME}</p>
                                </div>
                                <div>
                                    <img width={"150px"} src={result?.header.PrintLogo} alt=''></img>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className='d_flex_smp justify_between_smp font_18_smp br_all_smp padding_all_smp'>
                                <div className='d_flex_smp'>
                                    QUOTATION# :
                                    <div className='font_bold_smp'>&nbsp;{result?.header?.InvoiceNo}</div>
                                </div>
                                <div className='d_flex_smp'>
                                    DATE :
                                    <div className='font_bold_smp'>&nbsp;{result?.header?.DueDate}</div>
                                </div>
                            </div>
                            <div className='br_all_smp'>
                                <div className='d_flex_smp justify_between_smp padding_all_smp'>
                                    <div className=''>
                                        <p>Quote To,</p>
                                        <p className='font_14_smp font_bold_smp'>{result?.header?.customerfirmname}</p>
                                        <p>{result?.header?.customerAddress1}</p>
                                        <p>{result?.header?.customerAddress2}</p>
                                        <p>{result?.header?.customerAddress3}</p>
                                        <p>{result?.header?.customercity}{result?.header?.customerpincode}</p>
                                        <p>{result?.header?.customeremail1}</p>
                                        <p>STATE NAME : {result?.header?.State},{result?.header?.Cust_CST_STATE}-{result?.header?.Cust_CST_STATE_No}</p>
                                        <p>{result?.header?.vat_cst_pan}</p>
                                    </div>
                                    <div className='font_15_smp'>
                                        <div>Gold Rate:{result?.header?.MetalRate24K}</div>
                                    </div>
                                </div>

                                <div className='d_flex_smp text_center_smp br_top_smp height_34_smp line_height_smp font_bold_smp background_smp font_wrap_smp br_bottom_smp'>
                                    <div className='w_child1_smp pad_2_px br_right_smp align_item_smp d_flex_smp justify_center_smp'>SR#</div>
                                    <div className='w_child2_smp pad_2_px br_right_smp align_item_smp d_flex_smp'>DESIGN</div>
                                    <div className='w_child3_smp pad_2_px br_right_smp align_item_smp d_flex_smp justify_center_smp'>Remark</div>
                                    <div className='w_child4_smp pad_2_px br_right_smp align_item_smp d_flex_smp justify_center_smp'>DIA WT (ctw)</div>
                                    <div className='w_child5_smp pad_2_px br_right_smp align_item_smp d_flex_smp justify_center_smp'>DIA RATE</div>
                                    <div className='w_child6_smp pad_2_px br_right_smp align_item_smp d_flex_smp justify_center_smp'>DIA AMT</div>
                                    <div className='w_child7_smp pad_2_px br_right_smp align_item_smp d_flex_smp justify_center_smp'>G WT (gm)</div>
                                    <div className='w_child8_smp pad_2_px br_right_smp align_item_smp d_flex_smp justify_center_smp'>NWT (gm)</div>
                                    <div className='w_child9_smp pad_2_px br_right_smp align_item_smp d_flex_smp justify_center_smp'>OTHER AMT</div>
                                    <div className='w_child10_smp pad_2_px br_right_smp align_item_smp d_flex_smp justify_center_smp'>CS WT (ctw)</div>
                                    <div className='w_child11_smp pad_2_px br_right_smp align_item_smp d_flex_smp justify_center_smp'>CS RATE</div>
                                    <div className='w_child12_smp pad_2_px br_right_smp align_item_smp d_flex_smp justify_center_smp'>CS AMT</div>
                                    <div className='w_child13_smp pad_2_px br_right_smp align_item_smp d_flex_smp justify_center_smp'>GOLD FINE (gm)</div>
                                    <div className='w_child14_smp pad_2_px br_right_smp align_item_smp d_flex_smp justify_center_smp'>GOLD AMT</div>
                                    <div className='w_child15_smp pad_2_px align_item_smp d_flex_smp justify_center_smp'>AMOUNT</div>
                                </div>


                                {result?.resultArray?.map((j1, i1) => {
                                    return (
                                        <div className='d_flex_smp br_bottom_smp b_t_smp'>
                                            <div className='w_child1_smp pad_2_px br_right_smp text_center_smp'>{j1?.SrNo}</div>
                                            <div className='w_child2_smp pad_2_px br_right_smp'>
                                                <div className='font_13_smp font_bold_smp'>{j1?.designno} - {j1?.Categoryname}</div>
                                                <div className='text_center_smp'><img
                                                    src={j1?.DesignImage}
                                                    onError={(e) => handleImageError(e)}
                                                    alt="design"
                                                    className={withImage === true ? "imgdp10 i_qp1" : "imgdp10 i_qp1 d_none_smp"}
                                                    width={"60px"}
                                                    height="60px"
                                                /></div>
                                                <div className='font_bold_smp text_center_smp'>{j1?.MetalType} {j1?.MetalPurity}</div>
                                            </div>
                                            <div className='w_child3_smp pad_2_px br_right_smp'>{j1?.CertRemark ? j1?.CertRemark : ""}</div>
                                            <div className='w_child4_smp pad_2_px br_right_smp'>{j1?.diamonds?.map((d, i) => {
                                                return (
                                                    <div className='text_end_smp'>{d?.Wt?.toFixed(3)}</div>
                                                )
                                            })}</div>
                                            <div className='w_child5_smp pad_2_px br_right_smp'>
                                                {j1?.diamonds?.map((d, i) => {
                                                    return (
                                                        <div className='text_end_smp'>{formatAmount(d?.Rate)}</div>
                                                    )
                                                })}
                                            </div>
                                            <div className='w_child6_smp pad_2_px br_right_smp'>
                                                {j1?.diamonds?.map((d, i) => {
                                                    return (
                                                        <div className='text_end_smp'>{formatAmount(d?.Amount)}</div>
                                                    )
                                                })}
                                            </div>
                                            <div className='w_child7_smp pad_2_px br_right_smp text_end_smp' >{j1?.grosswt?.toFixed(3)}</div>
                                            <div className='w_child8_smp pad_2_px br_right_smp text_end_smp'>{(j1?.NetWt + j1?.LossWt).toFixed(3)}</div>
                                            <div className='w_child9_smp pad_2_px br_right_smp text_end_smp'>

                                                {formatAmount(j1?.OtherCharges + j1?.TotalDiamondHandling + j1?.totals?.misc?.Amount)}

                                            </div>
                                            <div className='w_child10_smp pad_2_px br_right_smp'>
                                                {j1?.colorstone?.map((c, i) => {
                                                    return (
                                                        <div className='text_end_smp'>{c?.Wt?.toFixed(3)}</div>
                                                    )
                                                })}
                                            </div>
                                            <div className='w_child11_smp pad_2_px br_right_smp'>
                                                {j1?.colorstone?.map((c, i) => {
                                                    return (
                                                        <div className='text_end_smp'>{formatAmount(c?.Rate)}</div>
                                                    )
                                                })}
                                            </div>
                                            <div className='w_child12_smp pad_2_px br_right_smp'>
                                                {j1?.colorstone?.map((c, i) => {
                                                    return (
                                                        <div className='text_end_smp'>{formatAmount(c?.Amount)}</div>
                                                    )
                                                })}
                                            </div>
                                            <div className='w_child13_smp pad_2_px br_right_smp'>
                                                <div className='text_end_smp'>{j1?.PureNetWt}</div>
                                            </div>
                                            <div className='w_child14_smp pad_2_px br_right_smp'>
                                                {j1?.metal?.map((m, i) => {
                                                    return (
                                                        <div className='text_end_smp'>{formatAmount(m?.Amount)}</div>
                                                    )
                                                })}</div>
                                            <div className='w_child15_smp pad_2_px'>
                                                <div className='text_end_smp'>{formatAmount(j1?.TotalAmount)}</div>
                                            </div>
                                        </div>
                                    )
                                })}

                                <div className='d_flex_smp text_center_smp font_14_smp height_34_smp font_bold_smp background_smp b_t_smp'>
                                    <div className='w_smp pad_2_px br_right_smp'>TOTAL</div>
                                    <div className='w_child3_smp pad_2_px br_right_smp'></div>
                                    <div className='w_child4_smp pad_2_px br_right_smp text_end_smp'>
                                        {result?.mainTotal?.diamonds?.Wt.toFixed(3)}
                                    </div>
                                    <div className='w_child5_smp pad_2_px br_right_smp'></div>
                                    <div className='w_child6_smp pad_2_px br_right_smp text_end_smp'>{formatAmount(result?.mainTotal?.diamonds?.Amount)}</div>
                                    <div className='w_child7_smp pad_2_px br_right_smp text_end_smp'>{result?.mainTotal?.grosswt.toFixed(3)}</div>
                                    <div className='w_child8_smp pad_2_px br_right_smp text_end_smp'>{(result?.mainTotal?.lossWt + result?.mainTotal?.netwt).toFixed(3)}</div>
                                    <div className='w_child9_smp pad_2_px br_right_smp text_end_smp'>{formatAmount(result?.mainTotal?.total_otherCharge_Diamond_Handling)}</div>
                                    <div className='w_child10_smp pad_2_px br_right_smp text_end_smp'>{result?.mainTotal?.colorstone?.Wt.toFixed(3)}</div>
                                    <div className='w_child11_smp pad_2_px br_right_smp'></div>
                                    <div className='w_child12_smp pad_2_px br_right_smp text_end_smp'>{formatAmount(result?.mainTotal?.colorstone?.Amount)}</div>
                                    <div className='w_child13_smp pad_2_px br_right_smp text_end_smp'>{result?.mainTotal?.total_purenetwt.toFixed(3)}</div>
                                    <div className='w_child14_smp pad_2_px br_right_smp text_end_smp'>{formatAmount(result?.mainTotal?.metal?.Amount)}</div>
                                    <div className='w_child15_smp pad_2_px text_end_smp'>{formatAmount(result?.mainTotal?.total_amount)}</div>
                                </div>

                            </div>
                        </div>
                        <div className='d_flex_smp b_t_smp'>
                            <div className='summary_1 br_all_smp '>
                                <div className='background_smp font_bold_smp pad_2_px font_15_smp'>Summary Detail</div>
                                <div className='d_flex_smp font_12_smp pad_top'>
                                    {summary.map((e, i) => {
                                        return (
                                            <div className='pad_smp'>{e.Categoryname} | {e.SubCategoryname} : {e.Categoryname_value}</div>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className='br_all_smp summary_2'>
                                {result?.allTaxes?.map((e, i) => {
                                    return (
                                        <div className='d_flex_smp justify_between_smp'>
                                            <div>{e.name} @ {e.per}</div>
                                            <div>{e.amount}</div>
                                        </div>
                                    )
                                })}
                                <div className='d_flex_smp justify_between_smp font_bold_smp'>
                                    <div>{result?.header?.AddLess > 0 ? "Add" : "Less"}</div>
                                    <div>{result?.header?.AddLess}</div>
                                </div>
                            </div>
                        </div>
                        <div className='d_flex_smp background_smp br_all_smp mar_smp font_14_smp b_t_smp'>
                            <div className='total_1 font_bold_smp d_flex_smp align_item_smp justify_end_smp'>
                                TOTAL
                            </div>
                            <div className='total_2'>
                                <div className='d_flex_smp justify_between_smp '>
                                    <div>CASH :</div>
                                    <div className='font_bold_smp'>{formatAmount(result?.finalAmount)}</div>
                                </div>
                                <div className='d_flex_smp justify_between_smp'>
                                    <div>Gold in 24K :</div>
                                    <div className='font_bold_smp'>{result?.mainTotal?.total_purenetwt.toFixed(3)}</div>
                                </div>
                            </div>
                        </div>
                        <div className='d_flex_smp font_15_smp b_t_smp'>
                            <div className='summary_w_smp mar_10_top br_all_smp'>
                                <div className='background_smp  font_bold_smp pad_left_smp'>SUMMARY</div>
                                <div className='d_flex_smp'>
                                    <div className='d_flex_smp pad_right w_50_smp justify_between_smp br_right_smp'>
                                        <div className='font_bold_smp'>GOLD IN 24KT</div>
                                        <div>{result?.mainTotal?.total_purenetwt.toFixed(3)} gm</div>
                                    </div>
                                    <div className='d_flex_smp pad_right w_50_smp justify_between_smp'>
                                        <div className='font_bold_smp'>GOLD</div>
                                        <div>{formatAmount(result?.mainTotal?.MetalAmount)}</div>
                                    </div>
                                </div>
                                <div className='d_flex_smp'>
                                    <div className='d_flex_smp pad_right w_50_smp justify_between_smp br_right_smp'>
                                        <div className='font_bold_smp'>GROSS WT</div>
                                        <div>{result?.mainTotal?.grosswt.toFixed(3)} gm</div>
                                    </div>
                                    <div className='d_flex_smp pad_right w_50_smp justify_between_smp'>
                                        <div className='font_bold_smp'>DIAMOND</div>
                                        <div>{formatAmount(result?.mainTotal?.diamonds?.Amount)}</div>
                                    </div>
                                </div>
                                <div className='d_flex_smp'>
                                    <div className='d_flex_smp pad_right w_50_smp justify_between_smp br_right_smp'>
                                        <div className='font_bold_smp'>*(G+D) WT</div>
                                        <div>{(result?.mainTotal?.diamonds?.Wt / 5 + result?.mainTotal?.netwt).toFixed(3)} gm</div>
                                    </div>
                                    <div className='d_flex_smp pad_right w_50_smp justify_between_smp'>
                                        <div className='font_bold_smp'>CST</div>
                                        <div>{formatAmount(result?.mainTotal?.colorstone?.Amount)}</div>
                                    </div>
                                </div>
                                <div className='d_flex_smp'>
                                    <div className='d_flex_smp pad_right w_50_smp justify_between_smp br_right_smp'>
                                        <div className='font_bold_smp'>NET WT</div>
                                        <div>{result?.mainTotal?.netwt?.toFixed(3)} gm</div>
                                    </div>
                                    <div className='d_flex_smp pad_right w_50_smp justify_between_smp'>
                                        <div className='font_bold_smp'>MAKING</div>
                                        <div>{formatAmount(result?.mainTotal?.total_Making_Amount + result?.mainTotal?.diamonds?.SettingAmount + result?.mainTotal?.colorstone?.SettingAmount)}</div>
                                    </div>
                                </div>
                                <div className='d_flex_smp'>
                                    <div className='d_flex_smp pad_right w_50_smp justify_between_smp br_right_smp'>
                                        <div className='font_bold_smp'>DIAMONG WT</div>
                                        <div>{result?.mainTotal?.diamonds?.Pcs} / {result?.mainTotal?.diamonds?.Wt?.toFixed(3)} ctw</div>
                                    </div>
                                    <div className='d_flex_smp pad_right w_50_smp justify_between_smp'>
                                        <div className='font_bold_smp'>OTHER</div>
                                        <div>{formatAmount(result?.mainTotal?.total_otherCharge_Diamond_Handling)}</div>
                                    </div>
                                </div>
                                <div className='d_flex_smp'>
                                    <div className='d_flex_smp pad_right w_50_smp justify_between_smp br_right_smp'>
                                        <div className='font_bold_smp'>STONE WT</div>
                                        <div>{result?.mainTotal?.colorstone?.Pcs} / {result?.mainTotal?.colorstone?.Wt?.toFixed(3)} ctw</div>
                                    </div>
                                    <div className='d_flex_smp pad_right w_50_smp justify_between_smp'>
                                        <div className='font_bold_smp'>{result?.header?.AddLess > 0 ? "Add" : "Less"}</div>
                                        <div>{result?.header?.AddLess}</div>
                                    </div>
                                </div>
                                <div className='d_flex_smp br_top_smp background_smp'>
                                    <div className='d_flex_smp pad_right w_50_smp justify_between_smp br_right_smp'>
                                        <div></div>
                                        <div></div>
                                    </div>
                                    <div className='d_flex_smp pad_right w_50_smp justify_between_smp'>
                                        <div className=' font_bold_smp '>TOTAL</div>
                                        <div>{formatAmount(result?.mainTotal?.total_amount + result?.header?.AddLess)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className='mar_10_top br_all_smp margin_left_smp'>
                                <div className='d_flex_smp padd_10_bottom text_end_smp padd_smp font_bold_smp line_height_smp background_smp'>
                                    <div className='w_82_SMP'>Metal Type</div>
                                    <div className='w_82_SMP'>Dia Wt (ctw)</div>
                                    <div className='w_60_smp'>GWt (gm)</div>
                                    <div className='w_82_SMP'>Net Wt (gm)</div>
                                    <div className='w_82_SMP'>Fine Wt (gm)</div>
                                    <div className='w_90_smp'>Gold Amount</div>
                                </div>
                                <div className='d_flex_smp padd_smp'>
                                    <div className='w_82_SMP'>
                                        <div>GOLD 18K</div>
                                        <div>GOLD 22K</div>
                                        <div>SILVER</div>
                                        <div>S925 925</div>
                                    </div>
                                    <div className='w_82_SMP text_end_smp'>
                                        {result?.resultArray?.map((j1, i) => {
                                            return (
                                                <div>{j1?.totals?.diamonds?.Wt?.toFixed(3)}</div>
                                            )
                                        })}
                                    </div>
                                    <div className='w_60_smp text_end_smp'>
                                        {result?.resultArray?.map((j1, i) => {
                                            return (
                                                <div>{j1?.grosswt?.toFixed(3)}</div>
                                            )
                                        })}
                                    </div>
                                    <div className='w_82_SMP text_end_smp'>
                                        {result?.resultArray?.map((j1, i) => {
                                            return (
                                                <div>{(j1?.NetWt + j1?.LossWt).toFixed(3)}</div>
                                            )
                                        })}
                                    </div>
                                    <div className='w_82_SMP text_end_smp'>
                                        {result?.resultArray?.map((j1, i) => {
                                            return (
                                                <div>{j1?.PureNetWt}</div>
                                            )
                                        })}
                                    </div>
                                    <div className='w_90_smp text_end_smp'>
                                        {result?.resultArray?.map((j1, i) => {
                                            return (
                                                <div>{formatAmount(j1?.totals?.metal?.Amount)}</div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='br_all_smp note_smp b_t_smp'>
                            <div className=''>
                                <div className='font_bold_smp font_15_smp'>NOTE :</div>
                                <div
                                    dangerouslySetInnerHTML={{ __html: result?.header?.Declaration }}
                                ></div>
                            </div>
                        </div>
                        <div className='font_bold_smp font_14_smp term_smp'>
                            TERMS INCLUDED :
                        </div>
                        <div className='br_all_smp d_flex_smp font_14_smp font_bold_smp sign_smp b_t_smp'>
                            <div className='w_50_smp br_right_smp sign2_smp'>RECEIVER'S SIGNATURE & SEAL</div>
                            <div className='w_50_smp sign2_smp'>for,Classmate corporation Pvt Ltd</div>
                        </div>
                    </div>

                </div>
                : <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto"> {msg} </p>}
        </>
    )
}

export default Summary4Quote;