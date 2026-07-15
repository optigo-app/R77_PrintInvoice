import React, { useEffect, useState } from 'react';
import style from "../../assets/css/prints/exportPrint.module.css";
import { NumberWithCommas, apiCall, handlePrint } from '../../GlobalFunctions';
import Loader from '../../components/Loader';
import { handleImageError } from '../../GlobalFunctions/HandleImageError';

const ExportPrint = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
    const [loader, setLoader] = useState(true);
    const [invoice, setInvoice] = useState("");
    const [customerCode, setCustomerCode] = useState("")
    const [data, setData] = useState([]);
    const [checkBox, setCheckbox] = useState({
        invoiceNo: false,
        customerCode: false
    })
    const [isImageWorking, setIsImageWorking] = useState(true); 
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
    const loadData = (data) => {
        setInvoice(data?.BillPrint_Json[0]?.InvoiceNo);
        setCustomerCode(data?.BillPrint_Json[0]?.Customercode);
 

       const sortedData = data?.BillPrint_Json1?.sort((a, b) => {
            const designNoA = parseInt(((a?.id)?.toString())?.match(/\d+/)[0]);
            const designNoB = parseInt(((b?.id)?.toString())?.match(/\d+/)[0]);
            return designNoA - designNoB;
          });
          
        setData(sortedData);
    }

    const handleChange = (e) => {
        const { name, checked } = e?.target;
        setCheckbox({ ...checkBox, [name]: checked });
    }

    useEffect(() => {
        const sendData = async () => {
            try {
                const data = await apiCall(token, invoiceNo, printName, urls, evn, ApiVer);
                loadData(data?.Data);
                setLoader(false);
            } catch (error) {
                console.error(error);
            }
        }
        sendData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (loader ? <Loader /> : <div className={`${style?.containerExportPrint}`}>
        {/* print button */}
        <div className={`d-flex justify-content-end align-items-center ${style?.print_sec_sum4} pb-4 mt-5 w-100`} >
            <div className="form-check d-flex align-items-center">
                <input className="border-dark me-2" type="checkbox" id="invoiceNo" checked={checkBox?.invoiceNo} onChange={e => handleChange(e)} name='invoiceNo' />
                <label className="" htmlFor="invoiceNo">
                    Invoice No
                </label>
            </div>
            <div className="form-check d-flex align-items-center">
                <input className="border-dark me-2" type="checkbox" id="customerCode"  checked={checkBox?.customerCode} onChange={e => handleChange(e)} name='customerCode' />
                <label className="" htmlFor="customerCode">
                    Customer Code
                </label>
            </div>

            <div className="form-check d-flex align-items-center">
                <input className="border-dark me-2" type="checkbox" id="mrp"   checked={checkBox?.mrp} onChange={e => handleChange(e)} name='mrp' />
                <label className="" htmlFor="mrp">
                    MRP
                </label>
            </div>
            <div className="form-check ps-3">
                <input type="button" className="btn_white blue py-0 mt-0 me-2" value="Print" onClick={(e) => handlePrint(e)} />
            </div>
        </div>
        {(checkBox?.invoiceNo || checkBox?.customerCode) && <p className='px-2 pt-1'> {checkBox?.invoiceNo && <>Invoice No: <span className="fw-bold me-2">{invoice}</span></>}
            {checkBox?.customerCode && <>Customer Code: <span className="fw-bold">{customerCode}</span></>}</p>}
        {/* data */}
        <div className={`d-flex flex-wrap pt-2 pad_60_allPrint`}>
            {data && data.map((e, i) => {
                return <div className={`col-3 ${style?.m_ep} no_break ${style?.contain}`} key={i}>
                    <div className={`border  border-black ${style?.divbox_ep}`}>
                        <div className={`${style?.imgbox_ep}`}><img src={e?.DesignImage} alt="" className={`w-100  object-fit-contain ${style?.img}`} onError={handleImageError} /></div>
                        <div className="p-1 border-top border-black">
                            <div className="d-flex justify-content-between w-100 px-1">
                                <p className='fw-bold'>{NumberWithCommas(i + 1, 0)}</p>
                                <p className='fw-bold'>{e?.designno}</p>
                            </div>
                            
                                 <div className="d-flex  w-100 px-1" style={{justifyContent:"space-between"}}>
                                    { atob(evn)?.toLowerCase() === 'quote' ? '' : <div className={`fw-bold ${style?.lh_ep}`}>{e?.SrJobno} </div>}


                                    {checkBox?.mrp && (
                                    <p className='fw-bold'>{e?.UnitCost}</p>
                                 )}
                                
                                  </div>
                            
                        </div>
                    </div>
                </div>
            })}
        </div>
    </div>
    )
}

export default ExportPrint