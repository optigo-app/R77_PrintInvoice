import React from 'react'
import "../../assets/css/prints/jewellerytaxinvoice1.css";
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import { cloneDeep } from 'lodash';
import { apiCall, checkMsg, formatAmount, handleImageError, isObjectEmpty } from '../../GlobalFunctions';
import { useEffect } from 'react';
import { useState } from 'react';
import Loader from '../../components/Loader';
import Button from '../../GlobalFunctions/Button';
const JewelleryTaxInvoice1 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
    const [result, setResult] = useState(null);
    const [msg, setMsg] = useState("");
    const [loader, setLoader] = useState(true);
    const [isImageWorking, setIsImageWorking] = useState(true);
    const [purityWise, setPurityWise] = useState([]);

          
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

    const loadData = (data) => {

        const copydata = cloneDeep(data);

        let address = copydata?.BillPrint_Json[0]?.Printlable?.split("\r\n");
        copydata.BillPrint_Json[0].address = address;
    
        const datas = OrganizeDataPrint(
          copydata?.BillPrint_Json[0],
          copydata?.BillPrint_Json1,
          copydata?.BillPrint_Json2
        );

        setResult(datas);

        
        let pwise = [];

        datas?.resultArray?.forEach((el) => {
            let obj = cloneDeep(el);
            let findRec = pwise?.findIndex((a) => a?.MetalTypePurity === obj?.MetalTypePurity)
            if(findRec === -1){
                pwise.push(obj);
            }else{
                pwise[findRec].grosswt += obj?.grosswt;
                pwise[findRec].NetWt += obj?.NetWt;
                pwise[findRec].LossWt += obj?.LossWt;
            }
        })

        pwise?.sort((a, b) => {
            const qualityA = a?.MetalTypePurity?.toUpperCase();
            const qualityB = b?.QualityName?.toUpperCase();
        
            // Extract the karat value from the QualityName
            const karatA = parseInt(qualityA?.split(' ')[1]); // Extracts the numeric part from "GOLD 10K"
            const karatB = parseInt(qualityB?.split(' ')[1]); // Extracts the numeric part from "GOLD 18K"
        
            // If both are numbers (i.e., metal types), compare them numerically
            if (!isNaN(karatA) && !isNaN(karatB)) {
                return karatA - karatB;
            }
        
            // If one of them is not a number (i.e., metal type and "TITANIUM High"), sort the metal type first
            if (!isNaN(karatA)) {
                return -1; // Place metal type before "TITANIUM High"
            } else if (!isNaN(karatB)) {
                return 1; // Place "TITANIUM High" after metal types
            }
        
            // If both are not numbers, sort them alphabetically
            if (qualityA < qualityB) return -1;
            if (qualityA > qualityB) return 1;
            return 0;
          });

        setPurityWise(pwise);
        
        let invpaydet = [];

        let abc = datas?.header?.InvPayDet?.split("@-@");

        let newarr = [];


        abc?.forEach((e) => {
            let obj = {
                name : '',
                amount : null,
                docno: ''
            }
            obj.name = e?.split("#-##-#")[0]
            obj.amount = (e?.split("#-##-#")[1])
            if(obj.name !== undefined && obj.amount !== undefined){
                if(obj.name?.toLowerCase() === 'discount'){
                    obj.name = 'Cash';
                    newarr.push(obj);
                }else{
                    newarr.push(obj);
                }
            }
        })

        abc?.forEach((e) => {
            let obj = {
                name : '',
                amount : null,
                docno: ''
            }

            obj.name = e?.split("#-#")[0];
            obj.docno = e?.split("#-#")[1];
            obj.amount = e?.split("#-#")[2];

            if(obj.docno !== ''){
                if(obj.name?.toLowerCase() === 'discount'){
                    obj.name = 'Cheque';
                    newarr.push(obj);
                }else{
                    newarr.push(obj);
                }
            }
        })
        datas.header.mainarr = newarr;

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

        let recheckArr = [];
          datas?.resultArray?.forEach((e) => {
            let obj = cloneDeep(e);
            obj.MetalRate = e?.metal.reduce((acc, num) => acc + num?.Rate, 0) || 0;
            obj.MetalRatePrimaryMetal = e?.metal.reduce((acc, num) => (num?.IsPrimaryMetal === 1 ? acc + num?.Rate : acc), 0) || 0;

            obj?.metal?.forEach((el) => {
                if(el?.IsPrimaryMetal === 1){
                    obj.MetalColorCode = el?.MetalColorCode
                }
            })

            recheckArr.push(obj);
        })
        
        datas.resultArray = recheckArr;

    };

    const handleImageErrors = () => {
        setIsImageWorking(false);
      };
  
      const totalTaxAmount = result?.allTaxes?.reduce(
        (sum, e) => sum + Number(e?.amount || 0),
        0
      );
  return (
    <>
    {
        loader ? <Loader /> : <>
        {
            msg === '' ? <>
            <div className='container_jtip1'>
                <div className='mb-2 pb-2 d-flex justify-content-end align-items-center  d_none_btn_jtip1'><Button /></div>
                <div className='d-flex justify-content-between align-items-center'>
                    <div className='ps-5'>{isImageWorking && (result?.header?.PrintLogo !== "" && 
                      <img src={result?.header?.PrintLogo} alt="" 
                      className='w-100 h-auto ms-auto d-block object-fit-contain'
                      onError={handleImageErrors} height={120} width={150} style={{maxWidth: "116px"}} />)}
                    </div>
                    <div className='fs_jtip1 text-break'>          
                        <div className='fs2_jtip1 py-1 fw-bold'>{result?.header?.CompanyFullName}</div>
                        <div>{result?.header?.CompanyAddress}</div>
                        <div>{result?.header?.CompanyAddress2}</div>
                        <div>{result?.header?.CompanyCity}-{result?.header?.CompanyPinCode}, {result?.header?.CompanyState}({result?.header?.CompanyCountry})</div>
                        <div>T {result?.header?.CompanyTellNo}</div>
                        <div>{result?.header?.CompanyEmail} | {result?.header?.CompanyWebsite}</div>
                        <div>{result?.header?.Company_VAT_GST_No} |
                         {result?.header?.Company_CST_STATE} - {result?.header?.Company_CST_STATE_No} | PAN - {result?.header?.Com_pannumber}</div>
                    </div>
                </div>
                <div className='d-flex justify-content-between align-items-start border   mt-1 p-2'>
                    <div className='fs_jtip1 text-break'>
                        <div>To,</div>
                        <div className='fs2_jtip1 py-1 fw-bold'>{result?.header?.customerfirmname}</div>
                        <div>{result?.header?.customerAddress1}</div>
                        <div>{result?.header?.customerAddress2}</div>
                        <div>{result?.header?.customerAddress3}</div>
                        <div>{result?.header?.customercity}{result?.header?.customerpincode}</div>
                        <div>Tel : {result?.header?.customermobileno}</div>
                        <div>{result?.header?.customeremail1}</div>
                        STATE NAME : {result?.header?.customerstate}, {result?.header?.Cust_CST_STATE} : {result?.header?.Cust_CST_STATE_No}
                        <div>{result?.header?.CustGstNo === '' ? '' : `${result?.header?.CustGstNo} | `}  PAN - {result?.header?.CustPanno}</div>
                    </div>
                    <div className='fs_jtip1  pe-5 text-break'>
                        Invoice#: <span className='fw-bold'>{result?.header?.InvoiceNo}</span>&nbsp; Dated <span className='fw-bold'>{result?.header?.EntryDate}</span>&nbsp;
                        Due Date: <span className='fw-bold'>{result?.header?.DueDate}</span>
                    </div>
                </div>
                <div className='fs_jtip1'>
                    <div className='thead_jti1 fw-bold border border-top-0'>
                        <div className='col1_jti1 brr_jtip1 center_jtip1 p-1'>SR NO</div>
                        <div className='col2_jti1 brr_jtip1 center_jtip1 p-1'>IMAGE</div>
                        <div className='col3_jti1 brr_jtip1 center_jtip1 p-1'>DESCRIPTION</div>
                        <div className='col4_jti1 brr_jtip1 center_jtip1 p-1'>Rate</div>
                        <div className='col5_jti1 brr_jtip1 center_jtip1 p-1 text-break'>Making Rate</div>
                        <div className='col6_jti1 center_jtip1 p-1'>AMOUNT (INR)</div>
                    </div>
                    <div>
                        {
                            result?.resultArray?.map((e, i) => {
                                return <div className='d-flex brl_jtip1 brb_jtip1 brr_jtip1 pgia_jtip1' key={i}>
                                            <div className='col1_jti1 brr_jtip1 center_jtip1 align-items-start p-1'>{i+1}</div>
                                            <div className='col2_jti1 brr_jtip1 center_jtip1 p-1'><img src={e?.DesignImage} alt="#designimg" className='desimg_jtip1' onError={(e) => handleImageError(e)} /></div>
                                            <div className='col3_jti1 brr_jtip1 d-flex flex-column align-items-start justify-content-start p-1'>    	
                                                <div className='py-2'>{e?.MetalTypePurity} {e?.MetalColorCode} | {e?.grosswt?.toFixed(3)} gms GW | {e?.NetWt?.toFixed(3)} gms NW</div>
                                                <div className='py-2'>Design: <span className='fw-bold'>{e?.designno}</span> 
                                                <span className='fw-bold'>{e?.BulkPurchaseQTY > 0 ? ` (${e?.BulkPurchaseQTY}) ` : ' '} </span>
                                                {result?.header?.HSN_No_Label}: <span className='fw-bold'>{e?.HSNNo}</span></div>
                                                <div className='py-2'>{e?.Categoryname} , {e?.SubCategoryname}</div>
                                            </div>
                                            <div className='col4_jti1 brr_jtip1 center_jtip1 align-items-start justify-content-end p-1'>{formatAmount((e?.MetalRatePrimaryMetal))}</div>
                                            <div className='col5_jti1 brr_jtip1 center_jtip1 align-items-start justify-content-end p-1 text-break'>{formatAmount(e?.MaKingCharge_Unit)}</div>
                                            <div className='col6_jti1 center_jtip1 align-items-start justify-content-end p-1'><span className='pe-1' dangerouslySetInnerHTML={{__html:result?.header?.Currencysymbol}}></span>{formatAmount((e?.TotalAmount / result?.header?.CurrencyExchRate))}</div>
                                        </div>  
                            })
                        }
                    </div>
                    <div className='thead_jti1 border border-top-0 fw-bold pgia_jtip1'>
                        <div className='col1_jti1  center_jtip1 p-1'></div>
                        <div className='col2_jti1 brr_jtip1 center_jtip1 align-items-start justify-content-start brl_jtip1 fs2_jtip1 p-1'>TOTAL</div>
                        <div className='col3_jti1  center_jtip1 p-1'></div>
                        <div className='col4_jti1  center_jtip1 p-1'></div>
                        <div className='col5_jti1  center_jtip1 p-1 text-break'></div>
                        <div className='col6_jti1 center_jtip1 p-1 align-items-start brl_jtip1 justify-content-end fs2_jtip1'><span className='pe-1' dangerouslySetInnerHTML={{__html:result?.header?.Currencysymbol}}></span>{formatAmount((result?.mainTotal?.total_amount / result?.header?.CurrencyExchRate))}</div>
                    </div>
                </div>
                <div className='brall_jts d-flex  border mt-1 fs_jtip1 pgia_jtip1'>
                        <div className='w33_jts p-1 fs_jts border-end text-break'>
                        <div className='fw-bold'>Payment Details</div>
                        <div>
                            {
                                result?.header?.mainarr?.map((e, i) => {
                                    return <div>{e?.name}({e?.docno}) : <span className='fw-bold'>{formatAmount(e?.amount)}</span></div>
                                })
                            }
                        </div>
                        {/* <div>Balance : {formatAmount(result?.header?.LedgerBal)}</div> */}
                        <div className='fw-bold text-decoration-underline'>REMARKS:</div><div dangerouslySetInnerHTML={{__html:result?.header?.PrintRemark}}></div>
                        </div>
                        <div className='w33_jts p-1 fs_jts border-end text-break'>
                        {
                            purityWise?.map((e, i) => {
                                return <div className='w-100 d-flex' key={i}><div className='w-50'>{e?.MetalTypePurity} : </div><div className='w-50'>{(e?.NetWt)?.toFixed(3)} gm</div></div>
                            })
                        }
                        {/* <div className='w-100 d-flex'><div className='w-50'>Diamond Wt : </div><div className='w-50'>{result?.mainTotal?.diamonds?.Wt?.toFixed(3)} cts</div></div> */}
                        <div className='w-100 d-flex'><div className='w-50'>Gross Wt : </div><div className='w-50'>{result?.mainTotal?.grosswt?.toFixed(3)} gm</div></div>
                        <div className='w-100 d-flex'><div className='w-50'>Net Wt  : </div><div className='w-50'>{result?.mainTotal?.netwt?.toFixed(3)} gm</div></div>
                        </div>
                        <div className='w33_jts  fs_jts d-flex text-break'>
                            <div className='border-end w1_jts'>
                            {
                                result?.allTaxes?.map((e, i) => <div className='d-flex justify-content-start  ps-1 ' key={i}>{e?.name} @ {e?.per}</div>)
                            }
                                <div className='start_jti2 ps-1'>Total</div>
                                <div className=' ps-1 '>{result?.header?.AddLess > 0 ? 'Add' : 'Less'}</div>
                                <div className=' ps-1 '>Delivery Charges</div>
                            </div>
                            <div className='w2_jts fw-bold'>
                            {
                                result?.allTaxes?.map((e, i) => <div className='d-flex justify-content-end align-items-center pe-1' key={i}><span className='pe-1  ' dangerouslySetInnerHTML={{__html:result?.header?.Currencysymbol}}></span>{formatAmount(e?.amount)}</div>)
                            }
                                <div className=' d-flex justify-content-end align-items-center pe-1'><span className='pe-1' dangerouslySetInnerHTML={{__html:result?.header?.Currencysymbol}}></span>{(formatAmount((result?.mainTotal?.total_amount + totalTaxAmount ) / result?.header?.CurrencyExchRate))}</div>
                                <div className=' pe-1  d-flex justify-content-end align-items-center'><span className='pe-1' dangerouslySetInnerHTML={{__html:result?.header?.Currencysymbol}}></span>{formatAmount((result?.header?.AddLess / result?.header?.CurrencyExchRate))}</div>
                                <div className=' pe-1  d-flex justify-content-end align-items-center'><span className='pe-1' dangerouslySetInnerHTML={{__html:result?.header?.Currencysymbol}}></span>{formatAmount((result?.header?.FreightCharges / result?.header?.CurrencyExchRate))}</div>
                            </div>
                        </div>
                </div>
                <div className='thead_jti1 fw-bold border border-top-0 w-100 pgia_jtip1'>
                    <div className='col1_jti1 brr_jtip1 center_jtip1 '></div>
                    <div className='col2_jti1 brr_jtip1 center_jtip1 '></div>
                    <div className='col3_jti1 brr_jtip1 center_jtip1 '></div>
                    <div className='col4_jti1 brr_jtip1 center_jtip1 '></div>
                    <div className='col5_jti1 brr_jtip1 d-flex justify-content-end align-items-center p-1  fs2_jtip1 text-break brl_jtip1'>GRAND TOTAL</div>
                    <div className='col6_jti1 d-flex justify-content-end align-items-center fs2_jtip1 p-1'>{formatAmount(((result?.mainTotal?.total_amount +totalTaxAmount/ result?.header?.CurrencyExchRate)))}</div>
                </div>
                <div className='mt-1 d-flex border fs_jtip1 pgia_jtip1'>
                    <div className='w33_jts border-end p-1 text-break'>
                        <div className='fw-bold'>Bank Detail</div>
                        <div>Bank Name: {result?.header?.bankname}</div>
                        <div className='text-break'>Bank Address: {result?.header?.bankaddress}</div>
                        <div>Account Name: {result?.header?.accountname}</div>
                        <div>Account No. : {result?.header?.accountnumber}</div>
                        <div>RTGS/NEFT IFSC: {result?.header?.rtgs_neft_ifsc}</div>
                    </div>
                    <div className='w33_jts d-flex flex-column justify-content-between border-end p-1'>                        	
                        <div>Signature</div>
                        <div className='fw-bold'>{result?.header?.customerfirmname}</div>
                    </div>
                    <div className='w33_jts p-1 d-flex flex-column justify-content-between'>	
                        <div>Signature</div>
                        <div className='fw-bold'> {result?.header?.CompanyFullName}</div>
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

export default JewelleryTaxInvoice1