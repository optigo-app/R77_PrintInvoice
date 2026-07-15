import React, { useEffect, useState } from 'react'
import { apiCall, checkMsg, formatAmount, handlePrint, isObjectEmpty } from '../../GlobalFunctions';
import Loader from '../../components/Loader';
import * as lsh from "lodash";
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import "../../assets/css/prints/summaryprint.css";

const SummaryPrint = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  
  
    const [result, setResult] = useState(null);
    const [brandNameData, setBrandNameData] = useState([]);
    const [mainTotal, setMainTotal] = useState(null);
    const [msg, setMsg] = useState("");
    const [loader, setLoader] = useState(true);
    const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function loadData(data){
      const copydata = lsh.cloneDeep(data);

      let address = copydata?.BillPrint_Json[0]?.Printlable?.split("\r\n");
      copydata.BillPrint_Json[0].address = address;
  
      const datas = OrganizeDataPrint(
        copydata?.BillPrint_Json[0],
        copydata?.BillPrint_Json1,
        copydata?.BillPrint_Json2
      );
  

      const js1 = lsh.cloneDeep(datas?.resultArray);
      const js2 = lsh.cloneDeep(datas?.json2);
      let stone = [];
      let kundan = [];
      let black_beads = [];
      let blankArr = [];
      let mainTotal = {
        NetWt:0,
        grosswt:0,
        TotalAmount:0,
        Quantity : 0,
        OtherCharges : 0,
        LossWt : 0,
        Wastage : 0,
        MaKingCharge_Unit : 0,
        convertednetwt : 0
      }
      js1?.forEach(j1 => {
          let findRecord = blankArr?.findIndex((a) => a?.BrandName === j1?.BrandName && a?.Srjobno === a?.StockBarcode && j1?.Tunch === a?.Tunch);
          if(findRecord === -1){
            blankArr.push(j1);
          }else{
            blankArr[findRecord].NetWt += j1?.NetWt;
            blankArr[findRecord].grosswt += j1?.grosswt;
            blankArr[findRecord].TotalAmount += j1?.TotalAmount;
            blankArr[findRecord].Quantity += j1?.Quantity;
            blankArr[findRecord].OtherCharges += j1?.OtherCharges;
            blankArr[findRecord].totals.misc.Wt += j1?.totals?.misc?.Wt;
            blankArr[findRecord].LossWt += j1?.LossWt;
            blankArr[findRecord].Wastage += j1?.Wastage;
            blankArr[findRecord].MaKingCharge_Unit += j1?.MaKingCharge_Unit;
            blankArr[findRecord].convertednetwt += j1?.convertednetwt;
          }
      });
      blankArr?.forEach((a) => {
        mainTotal.LossWt += a?.LossWt;
        mainTotal.MaKingCharge_Unit += a?.MaKingCharge_Unit;
        mainTotal.NetWt += a?.NetWt;
        mainTotal.OtherCharges += a?.OtherCharges;
        mainTotal.Quantity += a?.Quantity;
        mainTotal.TotalAmount += a?.TotalAmount;
        mainTotal.Wastage += a?.Wastage;
        mainTotal.convertednetwt += a?.convertednetwt;
        mainTotal.grosswt += a?.grosswt;
      });

      setMainTotal(mainTotal);
      setBrandNameData(blankArr);

      setResult(datas);
    }

 

    return (
    <>
    {
      loader ? <Loader /> : <>
      {
        msg === '' ? <div>
          <div className='container_sp mb-5 pb-5'>
            <div className='end_sp mt-5 mb-3'><button className='btn_white blue HSBtn_sp' onClick={() => handlePrint()}>Print</button></div>
            <div className='d-flex align-items-center px-4'>
              <div className='w-25'>Bill Statement of :<b>&nbsp;&nbsp;&nbsp;&nbsp;{result?.header?.CustName}</b></div>
              <div className='w-25'>  Date :<b>&nbsp;&nbsp;&nbsp;&nbsp;{result?.header?.EntryDate}</b></div>
              <div className='w-25'>Invoice No :<b>&nbsp;&nbsp;&nbsp;&nbsp;{result?.header?.InvoiceNo}</b></div>
              <div className='w-25'>{result?.header?.HSN_No_Label} :<b>&nbsp;&nbsp;&nbsp;&nbsp;{result?.header?.HSN_No}</b></div>
            </div>
            <div>
              {/* <div className='d-flex border border-black mt-2 fw-bold bg_sp'>
                <div className='col1h_ps border-black border-end center_sp'>Category</div>
                <div className='col2h_ps border-black border-end center_sp'>Pcs</div>
                <div className='col3h_ps border-black border-end center_sp'>LB</div>
                <div className='col4h_ps border-black border-end center_sp ps-2' style={{wordBreak:"break-word"}}>Rate Gm/Ct</div>
                <div className='col5h_ps border-black border-end center_sp'>Per</div>
                <div className='col6h_ps border-black border-end center_sp'>TAX(%)</div>
                <div className='col7h_ps border-black border-end center_sp'>Gross</div>
                <div className='col8h_ps border-black border-end center_sp ps-2' style={{wordBreak:"break-word"}}>Black Beads</div>
                <div className='col9h_ps border-black border-end center_sp'>Stone</div>
                <div className='col10h_ps border-black border-end center_sp'>Kundan</div>
                <div className='col11h_ps border-black border-end center_sp'>Net Wt</div>
                <div className='col12h_ps border-black border-end center_sp'>Final Wt</div>
                <div className='col13h_ps border-black border-end center_sp'>%</div>
                <div className='col14h_ps border-black border-end center_sp'>Wastage</div>
                <div className='col15h_ps '>
                  <div className='w-100 center_sp border-bottom border-black'>Final</div>
                  <div className='d-flex'><div className='center_sp border-black border-end' style={{width:"37%"}}>Fine</div><div className='center_sp' style={{width:"64%"}}>Cash</div></div>
                </div>
              </div>
              <div>
                {
                  brandNameData?.length > 0 && 
                  brandNameData?.map((e, i) => {
                    return(
                      <div className='d-flex border-start border-end border-black  pbia_sp' key={i}>
                        <div className='col1h_ps border-black border-end ps-1 border-bottom border-black'>{e?.BrandName}</div>
                        <div className='col2h_ps border-black border-end  border-bottom border-black border-black end_sp pad_r_sp'>{e?.Quantity}</div>
                        <div className='col3h_ps border-black border-end  border-bottom border-black end_sp pad_r_sp'>{formatAmount(e?.MaKingCharge_Unit)}</div>
                        <div className='col4h_ps border-black border-end center_sp ps-1' style={{wordBreak:"break-word"}}>{i === (Math.floor((brandNameData?.length) / 2)) && formatAmount(result?.header?.MetalRate24K)}</div>
                        <div className='col5h_ps border-black border-end center_sp '></div>
                        <div className='col6h_ps border-black d-flex flex-column center_sp h-100'>
                          {
                            result?.allTaxes?.map((e, il) => {
                              return(
                                <div className='d-flex flex-column h-100' style={{wordBreak:"break-word"}} key={il}>{i === (Math.floor((brandNameData?.length) / 2)) && (e?.name + "@" + e?.per)}</div>
                              )
                            })
                          }
                        </div>
                        <div className='col7h_ps border-black border-end  border-bottom border-start border-black end_sp pad_r_sp'>{e?.grosswt?.toFixed(3)}</div>
                        <div className='col8h_ps border-black border-end  ps-2 border-bottom border-black' style={{wordBreak:"break-word"}}>Black Beads</div>
                        <div className='col9h_ps border-black border-end  border-bottom border-black end_sp pad_r_sp'>{e?.totals?.misc?.Wt?.toFixed(3)}</div>
                        <div className='col10h_ps border-black border-end center_sp border-bottom border-black'>Kundan</div>
                        <div className='col11h_ps border-black border-end center_sp border-bottom border-black'>{e?.NetWt?.toFixed(3)}</div>
                        <div className='col12h_ps border-black border-end center_sp border-bottom border-black'>Final Wt</div>
                        <div className='col13h_ps border-black border-end  border-bottom border-black end_sp pad_r_sp'>{e?.Tunch?.toFixed(3)}</div>
                        <div className='col14h_ps border-black border-end end_sp border-bottom border-black pad_r_sp'>{e?.Wastage?.toFixed(3)}</div>
                        <div className='col16h_ps border-bottom border-black end_sp pad_r_sp'>{e?.convertednetwt?.toFixed(3)}</div>
                        <div className='col17h_ps border-start border-black end_sp pad_r_sp border-bottom border-black'>{formatAmount(e?.TotalAmount)}</div>
                      </div>
                    )
                  })
                }
              
              <div className='d-flex border border-black border-top-0 fw-bold bg_sp pbia_sp'>
                <div className='col1h_ps border-black border-end center_sp'>TOTAL</div>
                <div className='col2h_ps border-black border-end end_sp pad_r_sp'>{mainTotal?.Quantity}</div>
                <div className='col3h_ps border-black  center_sp'></div>
                <div className='col4h_ps border-black border-top'></div>
                <div className='col5h_ps border-black border-end center_sp border-top'></div>
                <div className='col6h_ps border-black border-end center_sp border-top'></div>
                <div className='col7h_ps border-black border-end end_sp pad_r_sp'>{mainTotal?.grosswt?.toFixed(3)}</div>
                <div className='col8h_ps border-black border-end end_sp' style={{wordBreak:"break-word"}}>0.000</div>
                <div className='col9h_ps border-black border-end end_sp'>Stone</div>
                <div className='col10h_ps border-black border-end end_sp'>Kundan</div>
                <div className='col11h_ps border-black border-end end_sp'>Net Wt</div>
                <div className='col12h_ps border-black border-end end_sp'>Final Wt</div>
                <div className='col13h_ps border-black '></div>
                <div className='col14h_ps border-black border-end'></div>
                <div className='col16h_ps border-black border-end end_sp pad_r_sp'>{mainTotal?.convertednetwt?.toFixed(3)}</div>
                <div className='col17h_ps end_sp pad_r_sp'>{formatAmount(result?.mainTotal?.total_amount)}</div>
              </div>
              <div className='pbia_sp'>
                {
                  result?.allTaxes?.map((e, i) => {
                    return(
                      <div className='d-flex justify-content-between align-items-center border-start border-end border-black border-bottom bg_sp' key={i}>
                          <div className='col1h_ps border-black border-end d-flex align-items-center justify-content-start ps-1 fw-bold'>{e?.name} @ {e?.per}</div><div className='col17h_ps border-start border-black d-flex align-items-center justify-content-end pe-1 fw-bold'>{e?.amount}</div>
                      </div>
                    )
                  })
                }
                    <div className='d-flex justify-content-between align-items-center border-start border-end border-black border-bottom bg_sp'>
                        <div className='col1h_ps border-black border-end d-flex align-items-center justify-content-start ps-1 fw-bold'>ADD/LESS</div><div className='col17h_ps border-start border-black d-flex align-items-center justify-content-end pe-1 fw-bold'>{result?.header?.AddLess}</div>
                    </div>
              </div>
              <div className='d-flex justify-content-between align-items-center border-start border-end border-black border-bottom bg_sp pbia_sp'>
                  <div className='col1h_ps border-black border-end center_sp fw-bold d-flex align-items-center justify-content-start ps-1'>GRAND TOTAL</div><div className='col17h_ps border-start border-black d-flex align-items-center justify-content-end pe-1 fw-bold'>{formatAmount((result?.finalAmount))}</div>
              </div>
              </div> */}
              <table className='w-100'>
                <thead className='w-100'>
                  <tr className='d-flex border border-black mt-2  fw-bold bg_sp w-100'>
                    <th className='col1h_ps border-black border-end center_sp'>Category</th>
                    <th className='col2h_ps border-black border-end center_sp'>Pcs</th>
                    <th className='col3h_ps border-black border-end center_sp'>LB</th>
                    <th className='col4h_ps border-black border-end center_sp ps-2 text-break'>Rate <br /> Gm / Ct</th>
                    <th className='col5h_ps border-black border-end center_sp'>Per</th>
                    <th className='col6h_ps border-black border-end center_sp'>TAX(%)</th>
                    <th className='col7h_ps border-black border-end center_sp'>Gross</th>
                    <th className='col8h_ps border-black border-end center_sp' style={{wordBreak:"break-word",textAlign:"center"}}>Black Beads</th>
                    <th className='col9h_ps border-black border-end center_sp'>Stone</th>
                    <th className='col10h_ps border-black border-end center_sp'>Kundan</th>
                    <th className='col11h_ps border-black border-end center_sp'>Net Wt</th>
                    <th className='col12h_ps border-black border-end center_sp'>Final Wt</th>
                    <th className='col13h_ps border-black border-end center_sp'>%</th>
                    <th className='col14h_ps border-black border-end center_sp'>Wastage</th>
                    <th className='col15h_ps p-0'>
                      <tr className='w-100 center_sp border-black border-bottom'>Final</tr>
                      <tr className='w-100 d-flex' style={{height:"65%"}}>
                        <th className='w-50 center_sp border-black border-end'>Fine</th>
                        <th className='w-50 center_sp'>Cash</th>
                      </tr>
                    </th>
                  </tr>
                </thead>
                <tbody className='w-100'>
                 {
                  brandNameData?.map((e, i) => {
                    
                    console.log("TCL: SummaryPrint -> eeeeeeeee", e)
                    return <tr className='d-flex border border-black border-top-0    w-100' key={i}>
                    <td className='col1h_ps border-black border-end center_sp'>{e?.BrandName}</td>
                    <td className='col2h_ps border-black border-end end_sp pe-1'>{e?.BulkPurchaseQTY}</td>
                    <td className='col3h_ps border-black border-end end_sp pe-1'></td>
                    <td className='col4h_ps border-black border-end end_sp pe-1 text-break'></td>
                    <td className='col5h_ps border-black border-end center_sp'></td>
                    <td className='col6h_ps border-black border-end center_sp'>{result?.header?.SGST &&"SGST @" + result?.header?.SGST+"%"} {result?.header?.CGST &&"CGST @" + result?.header?.CGST+"%"}</td>
                    <td className='col7h_ps border-black border-end end_sp pe-1'>{e?.grosswt}</td>
                    <td className='col8h_ps border-black border-end end_sp pe-1'>Black Beads</td>
                    <td className='col9h_ps border-black border-end end_sp pe-1'>{formatAmount(e?.totals?.colorstone?.Amount,2)}</td>
                    <td className='col10h_ps border-black border-end end_sp pe-1'>Kundan</td>
                    <td className='col11h_ps border-black border-end end_sp pe-1'>{e?.NetWt?.toFixed(3)}</td>
                    <td className='col12h_ps border-black border-end end_sp pe-1'>{result?.mainTotal?.grosswt.toFixed(3)}</td>
                    <td className='col13h_ps border-black border-end end_sp pe-1'>{e?.MetalPriceRatio?.toFixed(2)}</td>
                    <td className='col14h_ps border-black border-end end_sp pe-1'>{e?.Wastage?.toFixed(2)}</td>
                    <td className='col15h_ps p-0'>
                      <tr className='w-100 h-100 d-flex'>
                        <td className='w-50 end_sp pe-1 border-black border-end'>{e?.convertednetwt?.toFixed(2)}</td>
                        <td className='w-50 d-flex align-items-center justify-content-end pe-1'>{formatAmount(e?.TotalAmount)}</td>
                      </tr>
                    </td>
                  </tr>
                  })
                 }
                 <tr className='d-flex border border-black border-top-0  fw-bold bg_sp w-100' >
                    <th className='col1h_ps border-black border-end center_sp'>TOTAL</th>
                    <th className='col2h_ps border-black border-end d-flex align-items-center justify-content-end pe-1'>{mainTotal?.Quantity}</th>
                    <th className='col3h_ps border-black border-end end_sp pe-1'></th>
                    <th className='col4h_ps border-black border-end center_sp ps-2 text-break'></th>
                    <th className='col5h_ps border-black border-end center_sp'></th>
                    <th className='col6h_ps border-black border-end center_sp'></th>
                    <th className='col7h_ps border-black border-end end_sp pe-1'>{result?.mainTotal?.grosswt?.toFixed(3)}</th>
                    <th className='col8h_ps border-black border-end end_sp pe-1'></th>
                    <th className='col9h_ps border-black border-end end_sp pe-1'> </th>
                    <th className='col10h_ps border-black border-end end_sp pe-1'>Kundan</th>
                    <th className='col11h_ps border-black border-end end_sp pe-1'>{mainTotal?.NetWt?.toFixed(3)}</th>
                    <th className='col12h_ps border-black border-end end_sp pe-1'>{result?.mainTotal?.grosswt.toFixed(3)}</th>
                    <th className='col13h_ps border-black border-end end_sp pe-1'></th>
                    <th className='col14h_ps border-black border-end end_sp pe-1'>{result?.mainTotal?.total_Wastage?.toFixed(2)}</th>
                    <th className='col15h_ps p-0'>
                      <tr className='w-100 h-100 d-flex'>
                        <th className='w-50 end_sp pe-1 border-black border-end'> {result?.mainTotal?.convertednetwt?.toFixed(2)}</th>
                        <th className='w-50 d-flex align-items-center justify-content-end pe-1'>{formatAmount(result?.mainTotal?.total_amount)}</th>
                      </tr>
                    </th>
                  </tr>
                </tbody>
              </table>
              <div className='pbia_sp'>
                {
                  result?.allTaxes?.map((e, i) => {
                    return(
                      <div className='d-flex justify-content-between align-items-center border-start border-end border-black border-bottom bg_sp' key={i}>
                          <div className='col1h_ps border-black border-end d-flex align-items-center justify-content-start ps-1 fw-bold'>{e?.name} @ {e?.per}</div><div className='col17h_ps border-start border-black d-flex align-items-center justify-content-end pe-1 fw-bold' style={{width:"14.2%"}}>{e?.amount}</div>
                      </div>
                    )
                  })
                }
                    <div className='d-flex justify-content-between align-items-center border-start border-end border-black border-bottom bg_sp'>
                        <div className='col1h_ps border-black border-end d-flex align-items-center justify-content-start ps-1 fw-bold'>ADD/LESS</div><div style={{width:"14.2%"}} className='col17h_ps border-start border-black d-flex align-items-center justify-content-end pe-1 fw-bold'>{result?.header?.AddLess}</div>
                    </div>
              </div>
              <div className='d-flex justify-content-between align-items-center border-start border-end border-black border-bottom bg_sp pbia_sp'>
                  <div className='col1h_ps border-black border-end center_sp fw-bold d-flex align-items-center justify-content-start ps-1'>GRAND TOTAL</div>
                  <div style={{width:"14.2%"}} className='col17h_ps border-start border-black d-flex align-items-center justify-content-end pe-1 fw-bold'>{formatAmount((result?.finalAmount))}</div>
              </div>

              <div>
              <div className="py-1 pbias2 fsh2_s2" style={{lineHeight: '1.2'}}><span className="fw-bold">TERMS INCLUDED</span> :
                  <span dangerouslySetInnerHTML={{ __html: result?.header?.SalesRepPolicyTermsDescription }}></span>
                  {/* {result?.header?.SalesRepPolicyTermsDescription} */}
                </div>
              </div>
            </div>
          </div>

        </div> :  <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
              {msg}
            </p>
      }
      </>
    }
    </>
  )
}

export default SummaryPrint