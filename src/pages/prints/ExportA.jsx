import React, { useEffect, useState } from 'react';
import style from "../../assets/css/prints/exporta.module.css";
import "../../assets/css/prints/exporta.css";
import { NumberWithCommas, apiCall, fixedValues, handlePrint, isObjectEmpty, numberToWord, FooterComponent, checkMsg, formatAmount, } from '../../GlobalFunctions';
import Loader from '../../components/Loader';
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import lodash, { cloneDeep } from 'lodash';

import footer1 from "../../assets/css/footers/footer1.module.css";


const ExportA = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
    
    const [loader, setLoader] = useState(true);
    const [data, setData] = useState([]);
    const [headerData, setHeaderData] = useState({});
    const [msg, setMsg] = useState("");
    const [datass, setDatass] = useState({});
    const [metals, setMetals] = useState([]);
    const [footer, setFooter] = useState(null);
    const [totals, setTotals] = useState({
        Wt: 0,
        Pcs: 0,
        Amount: 0,
    });

    const [smallTable, setSmallTable] = useState({
        metalList: [],
        diaList: [],
        csList: [],
        findList: []
    });

    const [isImageWorking, setIsImageWorking] = useState(true);

  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
    const loadData = (data) => {
        let datas = OrganizeDataPrint(
            data?.BillPrint_Json[0],
            data?.BillPrint_Json1,
            data?.BillPrint_Json2
        );
        let footers = FooterComponent("1", data?.BillPrint_Json[0]);
        setFooter(footers);
        setHeaderData(data?.BillPrint_Json[0]);
        setDatass(datas);
        // Your array
        // let dataArray = lodash.cloneDeep(datas?.resultArray);
        let dataArray = [];

        datas.resultArray.forEach((e, i) => {
            let findPurPer = dataArray.findIndex((ele, ind) => ele?.MetalTypePurity === e?.MetalTypePurity && ele?.LossPer === e?.LossPer);
            let findMetalAmount = e?.metal?.find((elem, index) => elem?.IsPrimaryMetal === 1)?.Amount;
            let findMetalRate = e?.metal?.find((elem, index) => elem?.IsPrimaryMetal === 1)?.Rate;
            let obj = lodash.cloneDeep(e);
            obj.metalRate = findMetalRate;
            obj.metalAmount = findMetalAmount;
            if (findPurPer === -1) {
                dataArray.push({
                    MetalTypePurity: e?.MetalTypePurity,
                    LossPer: e?.LossPer,
                    MetalType: e?.MetalType,
                    row: [obj],
                    total: {
                        grosswt: e?.grosswt,
                        NetWt: e?.NetWt,
                        LossWt: e?.LossWt,
                        Quantity: e?.Quantity,
                        LossPer: e?.LossPer,
                        totalWt: e?.NetWt + e?.LossWt,
                        metalAmount: findMetalAmount,
                        diaCsPcs: e?.totals?.diamonds?.Pcs + e?.totals?.colorstone?.Pcs,
                        diaCsWt: e?.totals?.diamonds?.Wt + e?.totals?.colorstone?.Wt,
                        diaCsAmount: e?.totals?.diamonds?.Amount + e?.totals?.colorstone?.Amount,
                        findingWt: e?.totals?.finding?.Wt,
                        findingAmount: e?.totals?.finding?.Amount,
                        TotalAmount: e?.TotalAmount,
                        totalRMValue: (e?.totals?.diamonds?.Amount + e?.totals?.colorstone?.Amount + e?.totals?.misc?.Amount + e?.totals?.metal?.Amount),
                        // totalValueAddition: e?.TotalAmount - (e?.totals?.diamonds?.Amount + e?.totals?.colorstone?.Amount + e?.totals?.misc?.Amount),
                        totalValueAddition: e?.OtherCharges + e?.MakingAmount + e?.TotalDiamondHandling,
                        // perOfVA: (((e?.TotalAmount - (e?.totals?.diamonds?.Amount + e?.totals?.colorstone?.Amount + e?.totals?.misc?.Amount)) * 100) / e?.totals?.metal?.Amount)
                        perOfVA: (((e?.OtherCharges + e?.MakingAmount + e?.TotalDiamondHandling) * 100) / e?.totals?.metal?.Amount)
                    }
                });
            } else {    
                console.log(e);
                
                dataArray[findPurPer].row.push(e);
                dataArray[findPurPer].total.grosswt += e?.grosswt;
                dataArray[findPurPer].total.NetWt += e?.NetWt;
                dataArray[findPurPer].total.LossWt += e?.LossWt;
                dataArray[findPurPer].total.LossPer += e?.LossPer;
                dataArray[findPurPer].total.Quantity += e?.Quantity;
                dataArray[findPurPer].total.totalWt += e?.NetWt + e?.LossWt;
                dataArray[findPurPer].total.metalAmount += findMetalAmount;
                dataArray[findPurPer].total.diaCsPcs += e?.totals?.diamonds?.Pcs + e?.totals?.colorstone?.Pcs;
                dataArray[findPurPer].total.diaCsWt += e?.totals?.diamonds?.Wt + e?.totals?.colorstone?.Wt;
                dataArray[findPurPer].total.diaCsAmount += e?.totals?.diamonds?.Amount + e?.totals?.colorstone?.Amount;
                dataArray[findPurPer].total.findingWt += e?.totals?.finding?.Wt;
                dataArray[findPurPer].total.findingAmount += e?.totals?.finding?.Amount;
                dataArray[findPurPer].total.TotalAmount += e?.TotalAmount;

                dataArray[findPurPer].total.totalRMValue += (e?.totals?.diamonds?.Amount + e?.totals?.colorstone?.Amount + e?.totals?.misc?.Amount + e?.totals?.metal?.Amount);
                // dataArray[findPurPer].total.totalValueAddition += e?.TotalAmount - (e?.totals?.diamonds?.Amount + e?.totals?.colorstone?.Amount + e?.totals?.misc?.Amount + e?.totals?.metal?.Amount);
                dataArray[findPurPer].total.totalValueAddition += e?.OtherCharges + e?.MakingAmount + e?.TotalDiamondHandling;
                dataArray[findPurPer].total.perOfVA += (((e?.TotalAmount - (e?.totals?.diamonds?.Amount + e?.totals?.colorstone?.Amount + e?.totals?.misc?.Amount)) * 100) / e?.totals?.metal?.Amount);

            }
        });
        let metals = [];
        let total = { ...totals };
        let smallTables = { ...smallTable };
        let metalList = [];
        let diaList = [];
        let csList = [];
        let findList = [];
        data?.BillPrint_Json2?.forEach((ele, ind) => {
            if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
                total.Wt += ele?.Wt;
                total.Pcs += ele?.Pcs;
                total.Amount += ele?.Amount;
                let findMetal = metals?.findIndex((elem, index) => elem?.ShapeName === ele?.ShapeName && elem?.QualityName === ele?.QualityName);
                if (findMetal === -1) {
                    metals.push(ele);
                } else {
                    metals[findMetal].Wt += ele?.Wt;
                    metals[findMetal].Amount += ele?.Amount;
                    metals[findMetal].Pcs += ele?.Pcs;
                }
                let findMetalList = metalList?.findIndex((elem, index) => elem?.label === ele?.ShapeName + " " + ele?.QualityName);
                if (findMetalList === -1) {
                    metalList.push({
                        label: ele?.ShapeName + " " + ele?.QualityName
                    });
                }
            } else if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
                let findDiamond = diaList.findIndex((elem, index) => elem?.MasterManagement_DiamondStoneTypeid === 1 && elem?.shapename === ele?.shapename && elem?.Colorname === ele?.Colorname && elem?.QualityName === ele?.QualityName && elem?.SizeName === ele?.SizeName);
                if (findDiamond === -1) {
                    diaList.push(ele)
                }
            } else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
                let findcs = csList.findIndex((elem, index) => elem?.MasterManagement_DiamondStoneTypeid === 2 && elem?.shapename === ele?.shapename && elem?.Colorname === ele?.Colorname && elem?.QualityName === ele?.QualityName && elem?.SizeName === ele?.SizeName);
                if (findcs === -1) {
                    csList.push(ele);
                }
            } else if (ele?.MasterManagement_DiamondStoneTypeid === 5) {
                let findFinding = findList.findIndex((elem, index) => elem?.MasterManagement_DiamondStoneTypeid === 5 && elem?.FindingAccessories === ele?.FindingAccessories && elem?.ShapeName === ele?.ShapeName && elem?.QualityName === ele?.QualityName && elem?.SizeName === ele?.SizeName);
                if (findFinding === -1) {
                    findList.push(ele);
                }
            }
        });
        smallTables.metalList = metalList;
        smallTables.diaList = diaList;
        smallTables.csList = csList;
        smallTables.findList = findList;
        setSmallTable(smallTables);
        total.Wt += datas?.mainTotal?.diamonds?.Wt + datas?.mainTotal?.colorstone?.Wt;
        total.Pcs += datas?.mainTotal?.diamonds?.Pcs + datas?.mainTotal?.colorstone?.Pcs;
        // total.Amount += datas?.mainTotal?.diamonds?.Amount+datas?.mainTotal?.colorstone?.Amount;



        setTotals(total);
        setMetals(metals);
        setData(dataArray);

   

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
                        // setMsg("Data Not Found");
                        const err = checkMsg(data?.Message);
                        console.log(data?.Message);
                        setMsg(err);
                    }
                } else {
                    setLoader(false);
                    setMsg(data?.Message);
                }
            } catch (error) {
                console.error(error);
            }
        }
        sendData();

    }, []);

    return (
        loader ? <Loader /> : msg === "" ? <div className={`container max_width_container pad_60_allPrint mt-2 ${style?.exportprint2} exportprint2`}>
            {/* print button */}
            <div className={`d-flex justify-content-end mb-4 align-items-center ${style?.print_sec_sum4} pt-4 pb-4`}>
                <div className="form-check ps-3 mt-2">
                    <input
                        type="button"
                        className="btn_white blue"
                        value="Print"
                        onClick={(e) => handlePrint(e)}
                    />
                </div>
            </div>
            {/* company address */}
                {/* <p className="fs-6 fw-semibold">SEZ RULE NO. 46(2)</p> */}
            {/* <div className='pb-2'>
                <p className="fs-6 fw-semibold py-1">{headerData?.customerfirmname}</p>
                <p className='fw-bold'>{headerData?.customerAddress1}</p>
                <p className='fw-bold'>{headerData?.customerAddress2}</p>
                <p className='fw-bold'>{headerData?.customerAddress3}</p>
                <p className='fw-bold'>{headerData?.customercity}{headerData?.customerpincode}, {headerData?.customercountry}</p>
            </div> */}
            {/* table title */}
            <p className="fw-semibold text-center border border-black p-1">VALUE ADDITION</p>
            <div className="d-flex border-start border-end border-bottom p-1 border-black">
                <div className="col-3 px-1">
                    <p className="fw-bold"> Inv Exp No: {headerData?.InvoiceNo}</p>
                </div>
                <div className="col-3 px-1">
                    <p className="fw-bold"> Dated: {headerData?.EntryDate}</p>
                </div>
                <div className="col-3 px-1">
                    <p className="fw-bold"> EDF No:</p>
                </div>
                <div className="col-3 px-1">
                    {/* <p className="fw-bold">Dated: {headerData?.DueDate}</p> */}
                </div>
            </div>
            <div className="d-flex border-start border-end border-bottom border-black">
                <div className={`${style?.des} border-end border-black`}>
                    <div className="d-grid h-100">
                        <div className='d-flex border-bottom border-black justify-content-center align-items-center'></div>
                        <div className='d-flex'>
                            <div className="col-2 p-1 fw-bold border-end border-black d-flex justify-content-center align-items-center"><p className="text-center">Sr. No.</p></div>
                            <div className="col-8 p-1 fw-bold border-end border-black d-flex justify-content-center align-items-center"><p className="text-center">Description</p></div>
                            <div className="col-2 p-1 fw-bold d-flex justify-content-center align-items-center"><p className="text-center">Qty</p></div>
                        </div>
                    </div>
                </div>
                <div className={`${style?.material} border-end border-black`}>
                    <div className="d-grid h-100">
                        <div className="d-flex justify-content-center align-items-center">
                            <p className="fw-bold text-center border-bottom border-black p-1 w-100">Details of Metal</p>
                        </div>
                        <div className="d-flex">
                            <div className={`${style?.grs} d-flex justify-content-center align-items-center p-1 border-end border-black`}><p className='fw-bold text-center text-break'>Grs Wt (gms)</p></div>
                            <div className={`${style?.grs} d-flex justify-content-center al ign-items-center p-1 border-end border-black`}><p className='fw-bold text-center text-break'>Net Wt (gms)</p></div>
                            <div className={`${style?.grs} d-flex justify-content-center align-items-center p-1 border-end border-black`}><p className='fw-bold text-center text-break'>Findings Wt (gms)</p></div>
                            <div className={`${style?.grs} d-flex justify-content-center align-items-center p-1 border-end border-black`}><p className='fw-bold text-center text-break'>Wt Loss</p></div>
                            <div className={`${style?.grs} d-flex justify-content-center align-items-center p-1 border-end border-black`}><p className='fw-bold text-center text-break'>% Wt Loss</p></div>
                            <div className={`${style?.grs} d-flex justify-content-center align-items-center p-1 border-end border-black`}><p className='fw-bold text-center text-break'>Total Wt (gms)</p></div>
                            <div className={`${style?.grs} d-flex justify-content-center align-items-center p-1 border-end border-black`}><p className='fw-bold text-center text-break'>Metal Rate / gm IMP</p></div>
                            <div className={`${style?.grs} d-flex justify-content-center align-items-center p-1 `}><p className='fw-bold text-center text-break'>Total Metal Cost</p></div>
                            {/* <div className={`${style?.grs} d-flex justify-content-center align-items-center p-1`}><p className='fw-bold text-center'>Finding Cost</p></div> */}
                        </div>
                    </div>
                </div>
                <div className={`${style?.studding} border-end border-black`}>
                    <div className="d-grid h-100">
                        <div className="d-flex">
                            <p className="fw-bold text-center border-bottom border-black p-1 w-100 d-flex justify-content-center align-items-center">Details Of Studding</p>
                        </div>
                        <div className="d-flex">
                            <div className={`col-3 p-1 d-flex justify-content-center align-items-center border-end border-black`}><p className='fw-bold text-center'>Tot Pcs</p></div>
                            <div className={`col-4 p-1 d-flex justify-content-center align-items-center border-end border-black`}><p className='fw-bold text-center'>Weight (Cts)</p></div>
                            <div className={`col-5 p-1 d-flex justify-content-center align-items-center`}><p className='fw-bold text-center'>Total Value in {headerData?.CurrencyCode}</p></div>
                        </div>
                    </div>
                </div>
                {/* <div className={`${style?.fob} p-1 d-flex justify-content-center align-items-center`}> */}
                <div className={`${style?.fob} d-flex fw-bold`}>
                        <div className='w-25  border-black border-end h-100 p-1 d-flex justify-content-center align-items-center '>FOB <br /> ValueIn</div>
                        <div className='w-25 border-black border-end h-100 p-1 d-flex justify-content-center align-items-center '>Total <br /> RM Value</div>
                        <div className='w-25 border-black border-end h-100 p-1 d-flex justify-content-center align-items-center '>Value <br /> Addition</div>
                        <div className='w-25  h-100 p-1 d-flex justify-content-center align-items-center text-break'>% of VA</div>
                </div>
            </div>
            {/* table data */}
            {
                data?.map((e, i) => {
                    console.log(e);
                    return <div key={i}>
                        <div className="d-flex border-start border-end border-bottom border-black">
                            <p className="fw-semibold p-1">{e?.MetalTypePurity}, Studded {e?.MetalType} Jewellery, {NumberWithCommas(e?.LossPer, 2)}%</p>
                        </div>
                        {
                            e?.row.map((ele, ind) => {
                                return <div className="d-flex border-start border-end border-bottom border-black" key={ind}>
                                    <div className={`${style?.des} border-end border-black d-flex`}>
                                        <div className="col-2 p-1 fw-bold border-end border-black"><p className="text-center">{ind + 1}</p></div>
                                        <div className="col-8 p-1 fw-bold border-end d-flex justify-content-between  align-items-center border-black"><p className="">{ele?.SrJobno}</p><p className="">{ele?.designno}</p></div>
                                        <div className="col-2 p-1 fw-bold"><p className="text-end">{ele?.Quantity !== 0 && ele?.Quantity}</p></div>
                                    </div>
                                    <div className={`${style?.material} border-end border-black d-flex w-100`}>
                                        <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{ele?.grosswt !== 0 && NumberWithCommas(ele?.grosswt, 3)}</p></div>
                                        <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{ele?.NetWt !== 0 && NumberWithCommas(ele?.NetWt, 3)}</p></div>
                                        <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{ele?.totals?.finding?.Wt !== 0 && NumberWithCommas(ele?.totals?.finding?.Wt, 3)}</p></div>
                                        <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{ele?.LossWt !== 0 && NumberWithCommas(ele?.LossWt, 3)}</p></div>
                                        <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{ele?.LossPer !== 0 && NumberWithCommas(ele?.LossPer, 2)}</p></div>
                                        <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{ele?.LossWt + ele?.NetWt !== 0 && NumberWithCommas(ele?.LossWt + ele?.NetWt, 3)}</p></div>
                                        <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{(ele?.metal_rate !== undefined && ele?.metal_rate !== 0) && NumberWithCommas(ele?.metal_rate , 2)}</p></div>
                                        <div className={`${style?.grs} p-1`}><p className='fw-bold text-end'>{ele?.totals?.metal?.Amount !== 0 && NumberWithCommas(ele?.totals?.metal?.Amount/headerData?.CurrencyExchRate, 2)}</p></div>
                                        {/* <div className={`${style?.grs} p-1`}><p className='fw-bold text-end'>{ele?.totals?.finding?.Amount !== 0 && NumberWithCommas(ele?.totals?.finding?.Amount, 2)}</p></div> */}
                                    </div>
                                    <div className={`${style?.studding} border-end border-black d-flex`}>
                                        <div className={`col-3 p-1 border-end border-black`}><p className='fw-bold text-end'>{ele?.totals?.diamonds?.Pcs + ele?.totals?.colorstone?.Pcs !== 0 && NumberWithCommas(ele?.totals?.diamonds?.Pcs + ele?.totals?.colorstone?.Pcs, 0)}</p></div>
                                        <div className={`col-4 p-1 border-end border-black`}><p className='fw-bold text-end'>{ele?.totals?.diamonds?.Wt + ele?.totals?.colorstone?.Wt !== 0 && NumberWithCommas(ele?.totals?.diamonds?.Wt + ele?.totals?.colorstone?.Wt, 3)}</p></div>
                                        <div className={`col-5 p-1`}><p className='fw-bold text-end'>{((ele?.totals?.diamonds?.Amount + ele?.totals?.colorstone?.Amount) / headerData?.CurrencyExchRate) !== 0 && NumberWithCommas(((ele?.totals?.diamonds?.Amount + ele?.totals?.colorstone?.Amount) / headerData?.CurrencyExchRate), 2)}</p></div>
                                    </div>
                                    {/* <div className={`${style?.fob} p-1`}>
                                        <p className="fw-bold text-end">{NumberWithCommas((ele?.TotalAmount / headerData?.CurrencyExchRate), 2)}</p>
                                    </div> */}
                                    <div className={`${style?.fob} d-flex fw-bold`}>
                                            <div className='w-25  border-black border-end h-100 p-1 d-flex justify-content-end align-items-center '>{NumberWithCommas((ele?.TotalAmount / headerData?.CurrencyExchRate), 2)}</div>
                                            <div className='w-25 border-black border-end h-100 p-1 d-flex justify-content-end align-items-center '>{NumberWithCommas(((ele?.totals?.diamonds?.Amount + ele?.totals?.misc?.Amount + ele?.totals?.colorstone?.Amount + ele?.totals?.metal?.Amount) / headerData?.CurrencyExchRate), 2)}</div>
                                            {/* <div className='w-25 border-black border-end h-100 p-1 d-flex justify-content-end align-items-center '>{NumberWithCommas((((ele?.TotalAmount) - (ele?.totals?.diamonds?.Amount + ele?.totals?.misc?.Amount + ele?.totals?.colorstone?.Amount)) / headerData?.CurrencyExchRate), 2)}</div> */}
                                            <div className='w-25 border-black border-end h-100 p-1 d-flex justify-content-end align-items-center '>{(formatAmount(( (ele?.OtherCharges + ele?.MakingAmount + ele?.TotalDiamondHandling) / headerData?.CurrencyExchRate)))}</div>
                                            <div className='w-25  h-100 p-1 d-flex justify-content-end align-items-center text-break'>{formatAmount((((ele?.OtherCharges + ele?.TotalDiamondHandling + ele?.MakingAmount) * 100)) / ele?.totals?.metal?.Amount)}</div>
                                            {/* <div className='w-25  h-100 p-1 d-flex justify-content-end align-items-center text-break'>{NumberWithCommas((
                                                (((((((ele?.TotalAmount) - (ele?.totals?.diamonds?.Amount + ele?.totals?.misc?.Amount + ele?.totals?.colorstone?.Amount)) ) * 100)) / (ele?.totals?.metal?.Amount )) / headerData?.CurrencyExchRate)
                                                ), 2)}</div> */}
                                                                                                                                                                                                                        </div>
                                </div>
                            })
                        }
                        <div className="d-flex border-start border-end border-bottom border-black">
                            <div className={`${style?.des} border-end border-black d-flex`}>
                                <div className="col-10 p-1 fw-bold border-end border-black"><p>Total for</p></div>
                                <div className="col-2 p-1 fw-bold"><p className="text-end">{e?.total?.Quantity !== 0 && NumberWithCommas(e?.total?.Quantity, 0)}</p></div>
                            </div>
                            <div className={`${style?.material} border-end border-black d-flex w-100`}>
                                <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{e?.total?.grosswt !== 0 && NumberWithCommas(e?.total?.grosswt, 3)}</p></div>
                                <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{e?.total?.NetWt !== 0 && NumberWithCommas(e?.total?.NetWt, 3)}</p></div>
                                <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{e?.total?.findingWt !== 0 && NumberWithCommas(e?.total?.findingWt, 3)}</p></div>
                                <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{e?.total?.LossWt !== 0 && NumberWithCommas(e?.total?.LossWt, 3)}</p></div>
                                <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'></p></div>
                                {/* {NumberWithCommas(e?.total?.LossPer, 2)} */}
                                <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{e?.total?.totalWt !== 0 && NumberWithCommas(e?.total?.totalWt, 3)}</p></div>
                                <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'></p></div>
                                <div className={`${style?.grs} p-1 k`}><p className='fw-bold text-end'>{e?.total?.metalAmount !== 0 && NumberWithCommas(e?.total?.metalAmount/headerData?.CurrencyExchRate, 2)}</p></div>
                                {/* <div className={`${style?.grs} p-1`}><p className='fw-bold text-end'>{e?.total?.findingAmount !== 0 && NumberWithCommas(e?.total?.findingAmount, 2)}</p></div> */}
                            </div>
                            <div className={`${style?.studding} border-end border-black d-flex`}>
                                <div className={`col-3 p-1 border-end border-black`}><p className='fw-bold text-end'>{e?.total?.diaCsPcs !== 0 && NumberWithCommas(e?.total?.diaCsPcs, 0)}</p></div>
                                <div className={`col-4 p-1 border-end border-black`}><p className='fw-bold text-end'>{e?.total?.diaCsWt !== 0 && NumberWithCommas(e?.total?.diaCsWt, 3)}</p></div>
                                <div className={`col-5 p-1`}><p className='fw-bold text-end'>{e?.total?.diaCsAmount / headerData?.CurrencyExchRate !== 0 && NumberWithCommas(e?.total?.diaCsAmount / headerData?.CurrencyExchRate, 2)}</p></div>
                            </div>
                            <div className={`${style?.fob} d-flex `}>
                                <p className="fw-bold w-25 p-1 border-end border-black text-end">{e?.total?.TotalAmount / headerData?.CurrencyExchRate !== 0 && NumberWithCommas(e?.total?.TotalAmount / headerData?.CurrencyExchRate, 2)}</p>
                                <p className="fw-bold w-25 p-1 border-end border-black text-end">{e?.total?.totalRMValue / headerData?.CurrencyExchRate !== 0 && NumberWithCommas(e?.total?.totalRMValue / headerData?.CurrencyExchRate, 2)}</p>
                                <p className="fw-bold w-25 p-1 border-end border-black text-end">{e?.total?.totalValueAddition / headerData?.CurrencyExchRate !== 0 && NumberWithCommas(e?.total?.totalValueAddition / headerData?.CurrencyExchRate, 2)}</p>
                                {/* <p className="fw-bold w-25 p-1 text-end">{e?.total?.perOfVA / headerData?.CurrencyExchRate !== 0 && NumberWithCommas((((e?.total?.perOfVA) / headerData?.CurrencyExchRate) / e?.row?.length), 2)}</p> */}
                                <p className="fw-bold w-25 p-1 text-end"></p>
                            </div>
                        </div>
                    </div>
                })
            }
            {/* table total */}
            <div className="d-flex border-start border-end border-bottom border-black mt-3 border-top">
                <div className={`${style?.des} border-end border-black d-flex`}>
                    <div className="col-10 p-1 fw-bold border-end border-black"><p>Grand Total</p></div>
                    <div className="col-2 p-1 fw-bold"><p className="text-end">{datass?.mainTotal?.total_Quantity !== 0 && NumberWithCommas(datass?.mainTotal?.total_Quantity, 0)}</p></div>
                </div>
                <div className={`${style?.material} border-end border-black d-flex w-100`}>
                    <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{datass?.mainTotal?.grosswt !== 0 && NumberWithCommas(datass?.mainTotal?.grosswt, 3)}</p></div>
                    <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{datass?.mainTotal?.netwt !== 0 && NumberWithCommas(datass?.mainTotal?.netwt, 3)}</p></div>
                    <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{datass?.mainTotal?.finding?.Wt !== 0 && NumberWithCommas(datass?.mainTotal?.finding?.Wt, 3)}</p></div>
                    <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{datass?.mainTotal?.lossWt !== 0 && NumberWithCommas(datass?.mainTotal?.lossWt, 3)}</p></div>
                    <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'></p></div>
                    <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'>{datass?.mainTotal?.netwtWithLossWt !== 0 && NumberWithCommas(datass?.mainTotal?.netwtWithLossWt, 3)}</p></div>
                    <div className={`${style?.grs} p-1 border-end border-black`}><p className='fw-bold text-end'></p></div>
                    <div className={`${style?.grs} p-1 `}><p className='fw-bold text-end'>{datass?.mainTotal?.MetalAmount !== 0 && NumberWithCommas(datass?.mainTotal?.MetalAmount/ headerData?.CurrencyExchRate, 2)}</p></div>
                    {/* <div className={`${style?.grs} p-1`}><p className='fw-bold text-end'>{datass?.mainTotal?.finding?.Amount !== 0 && NumberWithCommas(datass?.mainTotal?.finding?.Amount, 2)}</p></div> */}
                </div>
                <div className={`${style?.studding} border-end border-black d-flex`}>
                    <div className={`col-3 p-1 border-end border-black`}><p className='fw-bold text-end'>{datass?.mainTotal?.diamonds?.Pcs + datass?.mainTotal?.colorstone?.Pcs !== 0 && NumberWithCommas(datass?.mainTotal?.diamonds?.Pcs + datass?.mainTotal?.colorstone?.Pcs, 0)}</p></div>
                    <div className={`col-4 p-1 border-end border-black`}><p className='fw-bold text-end'>{datass?.mainTotal?.diamonds?.Wt + datass?.mainTotal?.colorstone?.Wt !== 0 && NumberWithCommas(datass?.mainTotal?.diamonds?.Wt + datass?.mainTotal?.colorstone?.Wt, 3)}</p></div>
                    <div className={`col-5 p-1`}><p className='fw-bold text-end'>{(datass?.mainTotal?.diamonds?.Amount + datass?.mainTotal?.colorstone?.Amount) / headerData?.CurrencyExchRate !== 0 && NumberWithCommas((datass?.mainTotal?.diamonds?.Amount + datass?.mainTotal?.colorstone?.Amount) / headerData?.CurrencyExchRate, 2)}</p></div>
                </div>
                <div className={`${style?.fob} d-flex`}>
                    <p className="fw-bold  w-25 p-1 border-end border-black text-end">{datass?.mainTotal?.total_amount / headerData?.CurrencyExchRate !== 0 && NumberWithCommas(datass?.mainTotal?.total_amount / headerData?.CurrencyExchRate, 2)}</p>
                    <p className="fw-bold w-25 p-1 border-end border-black text-end">{(datass?.mainTotal?.diamonds?.Amount + datass?.mainTotal?.colorstone?.Amount + datass?.mainTotal?.misc?.Amount + datass?.mainTotal?.metal?.Amount) / headerData?.CurrencyExchRate !== 0 && NumberWithCommas(((datass?.mainTotal?.diamonds?.Amount + datass?.mainTotal?.colorstone?.Amount + datass?.mainTotal?.misc?.Amount + datass?.mainTotal?.metal?.Amount)) / headerData?.CurrencyExchRate, 2)}</p>
                    {/* <p className="fw-bold w-25 p-1 border-end border-black text-end">{((datass?.mainTotal?.total_amount) - (datass?.mainTotal?.diamonds?.Amount + datass?.mainTotal?.colorstone?.Amount + datass?.mainTotal?.misc?.Amount)) / headerData?.CurrencyExchRate !== 0 && NumberWithCommas(((datass?.mainTotal?.total_amount) - (datass?.mainTotal?.diamonds?.Amount + datass?.mainTotal?.colorstone?.Amount + datass?.mainTotal?.misc?.Amount)) / headerData?.CurrencyExchRate, 2)}</p> */}
                    <p className="fw-bold w-25 p-1 border-end border-black text-end">
                        {formatAmount(datass.mainTotal?.total_diamondHandling + datass?.mainTotal?.total_other + (datass?.mainTotal?.total_Making_Amount / headerData?.CurrencyExchRate))}</p>
                    {/* <p className="fw-bold w-25 p-1  text-end">{(datass?.mainTotal?.total_amount) / headerData?.CurrencyExchRate !== 0 && NumberWithCommas(datass?.mainTotal?.total_amount / headerData?.CurrencyExchRate, 2)}</p> */}
                    <p className="fw-bold w-25 p-1  text-end"></p>
                </div>
            </div>
            {/* total stone wt */}
            <div className="d-flex justify-content-between pt-2   pb-1">
                <div className="col-4 d-flex align-items-end px-2">
                    <p className="fw-bold"></p>
                </div>
                <div className="col-8 d-flex justify-content-end">
                    <div className="col-6 px-2">
                        <div className="d-flex flex-column justify-content-between">
                            <div>
                                {metals?.map((e, i) => {
                                    return <div className="d-flex pb-2" key={i}>
                                        <div className="col-4">
                                            <p className="fw-bold">{e?.ShapeName} {e?.QualityName}</p>
                                        </div>
                                        <div className="col-4">
                                            <p className="fw-bold">{e?.Wt !== 0 && NumberWithCommas(e?.Wt, 3)}</p>
                                        </div>
                                        <div className="col-4">
                                            <p className="fw-bold">{e?.Amount !== 0 && NumberWithCommas(e?.Amount/headerData?.CurrencyExchRate, 2)}</p>
                                        </div>
                                    </div>
                                })}
                                <div className="d-flex pb-2">
                                    <div className="col-4"><p className="fw-bold">Diamond</p></div>
                                    <div className="col-4"><p className="fw-bold">{datass?.mainTotal?.diamonds?.Wt !== 0 && NumberWithCommas(datass?.mainTotal?.diamonds?.Wt, 3)}</p></div>
                                    <div className="col-4"><p className="fw-bold">{datass?.mainTotal?.diamonds?.Amount !== 0 && NumberWithCommas(datass?.mainTotal?.diamonds?.Amount/headerData?.CurrencyExchRate, 2)}</p></div>
                                </div>
                                <div className="d-flex pb-2">
                                    <div className="col-4"><p className="fw-bold">Color Stone</p></div>
                                    <div className="col-4"><p className="fw-bold">{datass?.mainTotal?.colorstone?.Wt !== 0 && NumberWithCommas(datass?.mainTotal?.colorstone?.Wt, 3)}</p></div>
                                    <div className="col-4"><p className="fw-bold">{datass?.mainTotal?.colorstone?.Amount !== 0 && NumberWithCommas(datass?.mainTotal?.colorstone?.Amount/headerData?.CurrencyExchRate, 2)}</p></div>
                                </div>

                            </div>
                            <div className='border-top border-black border-dotted'>
                                <div className="d-flex p-1">
                                    <div className="col-4">
                                        <p className="fw-bold"></p>
                                    </div>
                                    <div className="col-4">
                                        {/* <p className="fw-bold">{NumberWithCommas(totals?.Wt, 3)}</p> */}
                                    </div>
                                    <div className="col-4">
                                        <p className="fw-bold">{totals?.Amount + datass?.mainTotal?.diamonds?.Amount + datass?.mainTotal?.colorstone?.Amount !== 0 && NumberWithCommas((totals?.Amount + datass?.mainTotal?.diamonds?.Amount + datass?.mainTotal?.colorstone?.Amount)/headerData?.CurrencyExchRate, 2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div> : <p className='text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto'>{msg}</p>
    )
}

export default ExportA;


