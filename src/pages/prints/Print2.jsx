import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { apiCall, checkMsg, formatAmount, handleImageError, isObjectEmpty } from '../../GlobalFunctions';
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import Loader from '../../components/Loader';
import "../../assets/css/prints/print2.css"

const Print2 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
    const [result, setResult] = useState(null);
    const [msg, setMsg] = useState("");
    const [loader, setLoader] = useState(true);
    const [summary, setsummary_details] = useState([]);
    const [removeclass, setremoveclass] = useState(null);
    const [WithAMT, setWithAMT] = useState(true);

    const checkWithAMT = () => {
        setWithAMT(prevState => !prevState);
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
            let obj = { ...a };
            obj?.metal?.forEach((al) => {
                if (obj?.SrJobno === al?.StockBarcode) {
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

    // console.log("evn", evn);
    const IsEventQuote = atob(evn)?.toLowerCase() === "quote"
    // console.log("IsEventQuote", IsEventQuote);
    // console.log("hello", result);

    return (
        <>
            {loader ? <Loader /> : msg === '' ? <div><div className='container_qp1'>
                <div className='d_flex_qp1 flex_direction_colum_qp1 main_qp1'>
                    <div className='d_flex_qp1 print_btn_qp1 mb-4 no-print  w-100 d-flex justify-content-end align-items-center'>
                        {IsEventQuote ?
                            <div className="mx-3 d-flex align-items-center">
                                <input
                                    type="checkbox"
                                    checked={WithAMT}
                                    onChange={checkWithAMT}
                                    id="withAMT"
                                />
                                <label
                                    htmlFor="withAMT"
                                    className="mx-2 user-select-none"
                                >
                                    With Amount 
                                </label>
                            </div>
                            : ""
                        }
                        <div className='printbtn2_qp1 print_btn_qp1 br_btn2_smp' onClick={handlePrintwithprice}>Print</div>
                    </div>

                    <div className="img-wraper" style={{ position: "relative" }}>
                        {/* {IsEventQuote && (
                            <img
                                src={result?.header?.BackgroudPrint}
                                alt="Background"
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        )} */}
                        <div className="print-wrapper">

                            {/* Background Layer */}
                            <div
                                className="print-bg"
                                style={{
                                    backgroundImage: `url(${result?.header?.BackgroudPrint})`,
                                    paddingTop:"10px"
                                }}
                            ></div>

                            {/* Content Layer */}
                            <div className="print-container_printq">

                                {result?.resultArray?.map((res, i) => {
                                    return (
                                        <React.Fragment key={i}>
                                            <div className='itemdiv_qp1 b_t_qp1 p-0 item-card' style={{ backgroundColor: "white" }}>

                                                {/* Header */}
                                                <div className='d-flex justify-content-center align-items-center py-1 border-bottom border-black fw-bold'>
                                                    &nbsp;{(atob(evn))?.toLowerCase() === "quote" && res?.designno}
                                                    {((atob(evn))?.toLowerCase() === "memo"
                                                        || (atob(evn))?.toLowerCase() === "product estimate"
                                                        || (atob(evn))?.toLowerCase() === "sale")
                                                        && res?.SrJobno
                                                    }
                                                </div>

                                                {/* Image */}
                                                <div className='d-flex justify-content-center align-items-start w-100 border-bottom border-black min_h_img_block_pdf_2'>

                                                    {res?.CDNDesignImageOrg !== '' ? (
                                                        <div className='imgBlock_print2q'>
                                                            <a href={`${res?.CDNDesignImageOrg}`} target='_blank'>
                                                                <img
                                                                    src={res?.CDNDesignImageOrg}
                                                                    onError={(e) => handleImageError(e)}
                                                                    alt="design"
                                                                    className="imgdp10 i_qp1"
                                                                    width="100%"
                                                                    height="100%"
                                                                />
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <div className='imgBlock_print2q'>
                                                            <img
                                                                src={res?.DesignImage}
                                                                onError={(e) => handleImageError(e)}
                                                                alt="design"
                                                                className="imgdp10 i_qp1"
                                                                width="100%"
                                                                height="100%"
                                                            />
                                                        </div>
                                                    )}

                                                </div>

                                                {/* Design No */}
                                                <div className='d-flex justify-content-center fs_print2q align-items-center border-bottom border-black fw-bold'>
                                                    {res?.designno}&nbsp;
                                                </div>

                                                {/* Metal */}
                                                <div className='d-flex justify-content-center fs_print2q align-items-center border-bottom border-black fw-bold'>
                                                    {res?.MetalTypePurity} - {res?.MetalColor}
                                                </div>

                                                {/* Weight */}
                                                <div className='d-flex justify-content-center fs_print2q align-items-center border-bottom border-black fw-bold'>
                                                    Gwt : {res?.grosswt?.toFixed(2)} | Nwt : {(res?.NetWt + res?.LossWt)?.toFixed(2)}
                                                </div>

                                                {/* Diamond / Stone */}
                                                <div className='d-flex justify-content-center fs_print2q align-items-center border-bottom border-black fw-bold'>
                                                    {res?.totals?.diamonds?.Wt !== 0 && 'DWt :'}
                                                    {res?.totals?.diamonds?.Wt !== 0 && res?.totals?.diamonds?.Wt?.toFixed(2)}
                                                    {res?.totals?.diamonds?.Wt !== 0 && ' | '}
                                                    {res?.totals?.colorstone?.Wt !== 0 && 'CSWt :'}
                                                    {res?.totals?.colorstone?.Wt !== 0 && res?.totals?.colorstone?.Wt?.toFixed(2)}&nbsp;
                                                </div>

                                                {/* Amount */}
                                                <div className='d-flex justify-content-center fs_print2q align-items-center fw-bold MinHeightLast'>
                                                    {WithAMT && (
                                                        <>
                                                            <span dangerouslySetInnerHTML={{ __html: result?.header?.Currencysymbol }}></span>
                                                            {formatAmount(res?.TotalAmount / result?.header?.CurrencyExchRate, 2)}
                                                        </>
                                                    )}
                                                </div>

                                            </div>
                                        </React.Fragment>
                                    )
                                })}

                            </div>
                        </div>

                        {/* <div className="print-container_printq"

                            style={{
                                
                                    backgroundImage: `url(${result?.header?.BackgroudPrint})`,
                                    backgroundSize: 'cover',       // makes image cover the div completely
                                    backgroundPosition: 'center',  // centers the image
                                    backgroundRepeat: 'no-repeat', // prevents tiling
                                    width: '100%',                 // fill parent width
                                    minHeight: '100vh',               // fill viewport height (or adjust as needed)
                                  
                                
                            }}>



                            {result?.resultArray?.map((res, i) => {

                                return (
                                  <React.Fragment key={i}>
                                        <div className='itemdiv_qp1 b_t_qp1 p-0' style={{ backgroundColor: "white" }}>
                                            <div className='d-flex justify-content-center align-items-center py-1 border-bottom border-black fw-bold'>
                                                &nbsp;{(atob(evn))?.toLowerCase() === "quote" && res?.designno}
                                                {((atob(evn))?.toLowerCase() === "memo"
                                                    || (atob(evn))?.toLowerCase() === "product estimate"
                                                    || (atob(evn))?.toLowerCase() === "sale")
                                                    && res?.SrJobno
                                                }
                                            </div>
                                            <div className='d-flex justify-content-center align-items-start w-100 border-bottom border-black min_h_img_block_pdf_2'>
                                                {res?.CDNDesignImageOrg !== '' ? <div className='imgBlock_print2q '>
                                                    <a href={`${res?.CDNDesignImageOrg}`} target='_blank'>
                                                        <img
                                                            src={res?.CDNDesignImageOrg}
                                                            onError={(e) => handleImageError(e)}
                                                            alt="design"
                                                            className="imgdp10 i_qp1"
                                                            width={"100%"}
                                                            height="100%"
                                                        />
                                                    </a>
                                                </div> : <div className='imgBlock_print2q '>
                                                    <img
                                                        src={res?.DesignImage}
                                                        onError={(e) => handleImageError(e)}
                                                        alt="design"
                                                        className="imgdp10 i_qp1"
                                                        width={"100%"}
                                                        height="100%"
                                                    />
                                                </div>
                                                }
                                            </div>
                                            <div className='d-flex justify-content-center fs_print2q align-items-center border-bottom border-black fw-bold'>
                                                {res?.designno}&nbsp;
                                            </div>
                                            <div className='d-flex justify-content-center fs_print2q align-items-center border-bottom border-black fw-bold'>
                                                {res?.MetalTypePurity} - {res?.MetalColor}
                                            </div>
                                            <div className='d-flex justify-content-center fs_print2q align-items-center border-bottom border-black fw-bold'>
                                                Gwt : {res?.grosswt?.toFixed(2)} | Nwt : {(res?.NetWt + res?.LossWt)?.toFixed(2)}
                                            </div>
                                            <div className='d-flex justify-content-center fs_print2q align-items-center border-bottom border-black fw-bold'>
                                                {res?.totals?.diamonds?.Wt !== 0 && 'DWt :'}{res?.totals?.diamonds?.Wt !== 0 && res?.totals?.diamonds?.Wt?.toFixed(2)}
                                                {res?.totals?.diamonds?.Wt !== 0 && ' | '}
                                                {res?.totals?.colorstone?.Wt !== 0 && 'CSWt :'}{res?.totals?.colorstone?.Wt !== 0 && res?.totals?.colorstone?.Wt?.toFixed(2)}&nbsp;
                                            </div>
                                            <div className='d-flex justify-content-center fs_print2q align-items-center fw-bold MinHeightLast'>
                                                {WithAMT
                                                    ? (
                                                        <>
                                                            <span dangerouslySetInnerHTML={{ __html: result?.header?.Currencysymbol }}></span>
                                                            {formatAmount(res?.TotalAmount / result?.header?.CurrencyExchRate, 2)}
                                                        </>
                                                    )
                                                    : null
                                                }
                                            </div>
                                        </div>
                                </React.Fragment>
                                )
                            })}
                        </div> */}
                    </div>


                </div>
            </div></div> : <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto"> {msg} </p>}
        </>
    )
}

export default Print2