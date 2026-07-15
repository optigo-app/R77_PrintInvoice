import React, { useEffect, useState } from 'react';
import { ToWords } from 'to-words';
import {
    HeaderComponent,
    apiCall,
    handleImageError,
    isObjectEmpty,
    NumberWithCommas,
    handlePrint,
    checkMsg
} from "../../GlobalFunctions";
import style from '../../assets/css/prints/summary9.module.css';
import Loader from "../../components/Loader";
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import lodash, { cloneDeep } from 'lodash';
import style1 from "../../assets/css/headers/header1.module.css";
import ImageComponent from "../../components/ImageComponent ";
import { MetalShapeNameWiseArr } from '../../GlobalFunctions/MetalShapeNameWiseArr';


const Summary9 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
    const [loader, setLoader] = useState(true);
    const [logoStyle, setlogoStyle] = useState({ maxWidth: "120px", maxHeight: "95px", minHeight: "95px" });
    const [msg, setMsg] = useState("");
    const [data, setData] = useState({});
    const [headerData, setHeaderData] = useState({});
    const [header, setHeader] = useState(null);
    const [summary, setSummary] = useState([]);

    const [MetShpWise, setMetShpWise] = useState([]);
    const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
    const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);

    const toWords = new ToWords();
    const [checkBox, setCheckbox] = useState({
        header: true,
        image: true,
        summary: false
    });
    const [metalList, setMetalList] = useState({
        list: [],
        total: {
            grosswt: 0,
            NetWt: 0,
            PureNetWt: 0,
            Amount: 0,
            Tunch: 0,
        }
    });
    const [miscs, setMiscs] = useState({
        list: [],
        total: {
            Wt: 0,
            Amount: 0,
            ServWt: 0
        },
    });
    const [isImageWorking, setIsImageWorking] = useState(true);
    const handleImageErrors = () => {
        setIsImageWorking(false);
    };
    const [colorStones, setColorStones] = useState({
        list: [],
        total: {
            Wt: 0,
            Amount: 0,
        },
    });
    const [goldList, setGoldList] = useState([]);
    const loadData = (data) => {
        setHeaderData(data?.BillPrint_Json[0]);
        let datas = OrganizeDataPrint(
            data?.BillPrint_Json[0],
            data?.BillPrint_Json1,
            data?.BillPrint_Json2
        );

        let met_shp_arr = MetalShapeNameWiseArr(datas?.json2);
      
        setMetShpWise(met_shp_arr);
        let tot_met = 0;
        let tot_met_wt = 0;
        met_shp_arr?.forEach((e, i) => {
          tot_met += e?.Amount;
          tot_met_wt += e?.metalfinewt;
        })    
        setNotGoldMetalTotal(tot_met);
        setNotGoldMetalWtTotal(tot_met_wt);

        let resultArray = [];
        let newMetalList = [];
        let summaries = [];
        let metalLists = { ...metalList };
        let metals = [];
        let colorStone = [];
        let csLists = { ...colorStones };
        let misc = [];
        let miscLists = { ...miscs };
        let miscTotal = {
            Wt: 0,
            Amount: 0,
            ServWt: 0
        };
        let colorStoneTotal = {
            Wt: 0,
            Amount: 0,
        };
        data?.BillPrint_Json1?.forEach((e, i) => {
            let findNewMetal = newMetalList?.findIndex((ele, ind) => ele?.MetalTypePurity === e?.MetalTypePurity && ele?.Wastage === e?.Wastage);
            if(findNewMetal === -1){
                let obj = cloneDeep(e);
                obj.PureNetWt = ((e?.NetWt *e?.Tunch)/100)
                newMetalList?.push(obj);
            }else{
                newMetalList[findNewMetal].grosswt += e.grosswt;
                newMetalList[findNewMetal].NetWt += e.NetWt;
                newMetalList[findNewMetal].Tunch = (newMetalList[findNewMetal].Tunch + e.Tunch) / 2;
                newMetalList[findNewMetal].PureNetWt += ((e?.NetWt *e?.Tunch)/100);
                newMetalList[findNewMetal].MetalAmount += e.MetalAmount;
            }
            metalLists.total.grosswt += e.grosswt;
            metalLists.total.NetWt += e.NetWt;
            metalLists.total.PureNetWt += ((e?.NetWt *e?.Tunch)/100);
            metalLists.total.Tunch += e.Tunch;
            metalLists.total.Amount += e.MetalAmount;
        })


        let headers = HeaderComponent("1", data?.BillPrint_Json[0]);
        setHeader(headers);
        let goldLists = [];
        datas.resultArray.forEach((e, i) => {

            let findMetals = metals.findIndex((ele, ind) => ele?.MetalTypePurity === e?.MetalTypePurity && ele?.Wastage === e?.Wastage);
            // metalLists.total.grosswt += e.grosswt;
            // metalLists.total.NetWt += e.NetWt;
            // metalLists.total.PureNetWt += e.PureNetWt;
            // metalLists.total.Tunch += e.Tunch;
            // metalLists.total.Amount += e.totals.metal.Amount;
            if (findMetals === -1) {
                metals.push(e);
            } else {
                // metals[findMetals].grosswt += e.grosswt;
                // metals[findMetals].NetWt += e.NetWt;
                // metals[findMetals].Tunch = (metals[findMetals].Tunch + e.Tunch) / 2;
                // metals[findMetals].PureNetWt += e.PureNetWt;
                // metals[findMetals].totals.metal.Amount += e.totals.metal.Amount;
            }

      

            let findGoldLists = goldLists?.findIndex((ele, ind) => ele?.MetalPurity === e?.MetalPurity);
            if (findGoldLists === -1) {
                goldLists?.push(e)
            } else {
                goldLists[findGoldLists].grosswt += e?.grosswt;
                goldLists[findGoldLists].NetWt += e?.NetWt;
                goldLists[findGoldLists].PureNetWt += e?.PureNetWt;
                goldLists[findGoldLists].metal[0].Amount += e?.metal[0]?.Amount;
            }

            let findMetalrate = e?.metal.findIndex((ele, ind) => ele?.IsPrimaryMetal === 1);
            let obj = lodash.cloneDeep(e);
            if (findMetalrate === -1) {
                obj.metalrate = 0;
            } else {
                obj.metalrate = e?.metal[findMetalrate]?.Rate;
            }
            resultArray.push(obj);
            let findSummary = summaries.findIndex((ele, ind) => ele?.Categoryname === e?.Categoryname && ele?.SubCategoryname === e?.SubCategoryname);
            if (findSummary === -1) {
                summaries.push({ Categoryname: e?.Categoryname, SubCategoryname: e?.SubCategoryname, Quantity: e?.Quantity });
            } else {
                summaries[findSummary].Quantity += e?.Quantity;
            }


        });
        metalLists.list = newMetalList;
        let csMiscWt = 0;
        let MiscWt = 0;
        data?.BillPrint_Json2.forEach((ele, ind) => {
            if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
                let findColor = colorStone.findIndex((elem, index) => elem?.Rate === ele?.Rate);
                colorStoneTotal.Wt += ele?.Wt;
                colorStoneTotal.Amount += ele?.Amount;
                csMiscWt += ele?.Wt;
                if (findColor === -1) {
                    colorStone.push(ele);
                }else{
                    colorStone[findColor].Wt += ele?.Wt;
                    colorStone[findColor].Pcs += ele?.Pcs;
                    colorStone[findColor].Amount += ele?.Amount;
                }
            } else if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
                let findMiscs = misc.findIndex((elem, index) => elem?.Rate === ele?.Rate);
                miscTotal.Wt += ele?.Wt;
                miscTotal.ServWt += ele?.ServWt;
                miscTotal.Amount += ele?.Amount;
                if (findMiscs === -1) {
                    misc.push(ele);
                } else {
                    misc[findMiscs].Wt += ele?.Wt;
                    misc[findMiscs].ServWt += ele?.ServWt;
                    misc[findMiscs].Pcs += ele?.Pcs;
                    misc[findMiscs].Amount += ele?.Amount;
                }
                if(ele?.IsHSCOE === 0){
                    csMiscWt += ele?.Wt;
                    MiscWt += ele?.Wt;
                }else{
                    csMiscWt += ele?.ServWt;
                    MiscWt += ele?.ServWt;
                }
            }
        });
        setGoldList(goldLists);

        setMetalList(metalLists);
        datas.resultArray = resultArray;
        datas.mainTotal.csMiscWt = csMiscWt;
        datas.mainTotal.MiscWt = MiscWt;
        setSummary(summaries);
        setData(datas);
        csLists.list = colorStone;
        csLists.total = colorStoneTotal;
        miscLists.list = misc;
        miscLists.total = miscTotal;
        setMiscs(miscLists);
        setColorStones(csLists);
      
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
    const handleChange = (e) => {
        const { name, checked } = e?.target;
        setCheckbox({ ...checkBox, [name]: checked });
    }

    return loader ? (
        <Loader />
    ) : msg === "" ? (
        <div className={`container container-fluid max_width_container mt-1 ${style?.summary9} pad_60_allPrint px-1`} >
            {/* buttons */}
            <div className={`d-flex justify-content-end align-items-center ${style?.print_sec_sum4} mb-4`} >
                <div className="form-check d-flex align-items-center">
                    <input className="border-dark me-2" type="checkbox" checked={checkBox?.header} onChange={e => handleChange(e)} name='header' />
                    <label className="">
                        With Header
                    </label>
                </div>
                <div className="form-check d-flex align-items-center">
                    <input className="border-dark me-2" type="checkbox" checked={checkBox?.image} onChange={e => handleChange(e)} name='image' />
                    <label className="">
                        With Image
                    </label>
                </div>
                <div className="form-check d-flex align-items-center">
                    <input className="border-dark me-2" type="checkbox" checked={checkBox?.summary} onChange={e => handleChange(e)} name='summary' />
                    <label className="">
                        With Summary
                    </label>
                </div>
                <div className={`form-check ps-3 ${style?.printBtn}`}>
                    <input
                        type="button"
                        className="btn_white blue py-2 mt-2"
                        value="Print"
                        onClick={(e) => handlePrint(e)}
                    />
                </div>
            </div>
            {/* header */}
            {/* {checkBox?.header && header} */}
            {checkBox?.header && <>  {headerData?.PrintHeadLabel !== "" && <div className={`${style1.headline} headerTitle target_header`}>{headerData?.PrintHeadLabel}</div>}
                <div className={`${style1.companyDetails} target_header ${style?.font_13_5}`}>
                    <div className={`${style1.companyhead} p-2`} style={{lineHeight:"1"}}>
                        <div className={`${style1.lines} ${style?.font_20}`} style={{ fontWeight: "bold" }}>
                            {headerData?.CompanyFullName}
                        </div>
                        <div className={style1.lines}>{headerData?.CompanyAddress}</div>
                        <div className={style1.lines}>{headerData?.CompanyAddress2}</div>
                        <div className={style1.lines}>{headerData?.CompanyCity}-{headerData?.CompanyPinCode},{headerData?.CompanyState}({headerData?.CompanyCountry})</div>
                        {/* <div className={style1.lines}>Tell No: {headerData?.CompanyTellNo}</div> */}
                        <div className={style1.lines}>Tell No:  {headerData?.CompanyTellNo}  {headerData?.CompanyTollFreeNo !== "" && ` | TOLL FREE ${headerData?.CompanyTollFreeNo}`}</div>
                        <div className={style1.lines}>
                            {headerData?.CompanyEmail} | {headerData?.CompanyWebsite}
                        </div>
                        <div className={style1.lines}>
                            {/* {headerData?.Company_VAT_GST_No} | {headerData?.Company_CST_STATE}-{headerData?.Company_CST_STATE_No} | PAN-{headerData?.Pannumber} */}
                            {headerData?.Company_VAT_GST_No} | {headerData?.Company_CST_STATE}-{headerData?.Company_CST_STATE_No} | PAN-{headerData?.Pannumber}
                        </div>
                    </div>
                    <div style={{ width: "30%" }} className="d-flex justify-content-end align-item-center h-100">
                        <ImageComponent imageUrl={headerData?.PrintLogo} styles={logoStyle} />
                        {/* <img src={data?.PrintLogo} alt="" className={style.headerImg} /> */}
                    </div>
                </div></>}
            <div className={`border d-flex justify-content-between p-2 ${style?.font_18}`}>
                <p>INVOICE# : <span className="fw-bold">{headerData?.InvoiceNo}</span></p>
                <p>DATE : <span className="fw-bold">{headerData?.EntryDate}</span></p>
            </div>
            <div className="border-start border-end border-bottom d-flex justify-content-between p-2">
                <div>
                    <p>{headerData?.lblBillTo}</p>
                    <p className={`fw-bold ${style?.font_14}`}>{headerData?.customerfirmname}</p>
                    <p>{headerData?.customerAddress1}</p>
                    <p>{headerData?.customerAddress2}</p>
                    <p>{headerData?.customerAddress3}</p>
                    <p>{headerData?.customercity}{headerData?.customerpincode}</p>
                    <p>{headerData?.customeremail1}</p>
                    <p>{headerData?.Cust_CST_STATE_No_}</p>
                    <p>{headerData?.vat_cst_pan}</p>

                </div>
                <div className={`${style?.font_15}`}>
                    <p className='text-end'>Gold Rate: <span className="fw-bold">{NumberWithCommas(headerData?.MetalRate24K, 2)}</span></p>
                    <p className='text-end'>{headerData?.HSN_No_Label} : <span className="fw-bold">{headerData?.HSN_No}</span></p>
                </div>
            </div>
            {/* table title */}
            <div className="d-flex border-start border-end border-bottom">
                <div className={`${style?.SR} fw-bold text-center border-end d-flex justify-content-center align-items-center`}>SR#</div>
                <div className={`${style?.DESIGN} fw-bold text-center border-end d-flex justify-content-center align-items-center`}>DESIGN</div>
                <div className={`${style?.STONE} fw-bold text-center border-end`}>
                    <div className="grid h-100">
                        <div className="d-flex w-100 justify-content-center border-bottom p-1">STONE/MINA/KUNDAN</div>
                        <div className="d-flex">
                            <div className="col-3 text-center p-1 border-end">NAME</div>
                            <div className="col-3 text-center p-1 border-end">PCS/WT</div>
                            <div className="col-3 text-center p-1 border-end">RATE</div>
                            <div className="col-3 text-center p-1">AMOUNT</div>
                        </div>
                    </div>
                </div>
                <div className={`${style?.GWT} fw-bold text-center border-end d-flex justify-content-center align-items-center`}>G WT</div>
                <div className={`${style?.NWT} fw-bold text-center border-end d-flex justify-content-center align-items-center`}>NWT</div>
                <div className={`${style?.PURITY} fw-bold text-center border-end d-flex justify-content-center align-items-center`}>PURITY</div>
                <div className={`${style?.WASTAGE} fw-bold text-center border-end d-flex justify-content-center align-items-center`}>WASTAGE</div>
                <div className={`${style?.GOLDRate} fw-bold text-center border-end d-flex justify-content-center align-items-center`}>GOLD RATE</div>
                <div className={`${style?.PUREWT} fw-bold text-center border-end d-flex justify-content-center align-items-center`}>PURE WT</div>
                <div className={`${style?.TOTALMISC} fw-bold text-center border-end d-flex justify-content-center align-items-center`}>TOTAL MISC CHRGS</div>
                <div className={`${style?.GOLDAMOUNT} fw-bold text-center border-end d-flex justify-content-center align-items-center`}>GOLD AMOUNT</div>
                <div className={`${style?.TOTALAMT} fw-bold text-center d-flex justify-content-center align-items-center`}>TOTAL AMT</div>
            </div>
            {/* table data */}
            {data?.resultArray.map((e, i) => {
                return <div className="d-flex border-start border-end border-bottom no_break" key={i}>
                    <div className={`${style?.SR} text-center border-end p-1`}>{i + 1}</div>
                    <div className={`${style?.DESIGN} fw-bold  border-end p-1`}>
                        <p>{e?.SrJobno} - {e?.Categoryname}</p>
                        {checkBox?.image && <img src={e?.DesignImage} alt="" className='w-100 imgWidth' onError={handleImageError} />}
                        <p style={{textAlign:"center"}}> {e?.MetalTypePurity}</p>
                        {e?.HUID !== "" && <p>HUID-{e?.HUID}</p>}
                    </div>
                    {/* <div className={`${style?.STONE}   border-end d-flex`}>
                        <div className="col-3  p-1 border-end">
                            {e?.colorstone.map((ele, ind) => {
                                return <p key={ind} className={`${style?.shapeName}`}>{ele?.ShapeName}</p>
                            })}
                            {e?.misc.map((ele, ind) => {
                                return <p key={ind} className={`${style?.shapeName}`}>{ele?.ShapeName}</p>
                            })}
                        </div>
                        <div className="col-3  p-1 border-end text-end">
                            {e?.colorstone.map((ele, ind) => {
                                return <p key={ind} className={`${style?.shapeName}`}>{NumberWithCommas(ele?.Pcs, 0)}/{NumberWithCommas(ele?.Wt, 3)}</p>
                            })}
                            {e?.misc.map((ele, ind) => {
                                return <p key={ind} className={`${style?.shapeName}`}>{NumberWithCommas(ele?.Pcs, 0)}/{NumberWithCommas(ele?.Wt, 3)}</p>
                            })}
                        </div>
                        <div className="col-3  p-1 border-end text-end">
                            {e?.colorstone.map((ele, ind) => {
                                return <p key={ind} className={`${style?.shapeName}`}>{NumberWithCommas(ele?.Rate, 2)}</p>
                            })}
                            {e?.misc.map((ele, ind) => {
                                return <p key={ind} className={`${style?.shapeName}`}>{NumberWithCommas(ele?.Rate, 2)}</p>
                            })}
                        </div>
                        <div className="col-3  p-1 text-end">
                            {e?.colorstone.map((ele, ind) => {
                                return <p key={ind} className={`${style?.shapeName}`}>{NumberWithCommas(ele?.Amount, 2)}</p>
                            })}
                            {e?.misc.map((ele, ind) => {
                                return <p key={ind} className={`${style?.shapeName}`}>{NumberWithCommas(ele?.Amount, 2)}</p>
                            })}
                        </div>
                    </div> */}

                    <div className={`${style?.STONE} border-end position-relative`}>
                        {e?.colorstone.map((ele, ind) => {
                            return <div key={ind} className={`${style?.STONE} d-flex w-100`}>
                                <div className="col-3">
                                    <p className={`${style?.shapeName} ${style?.pad_2}`}>{ele?.ShapeName}</p>
                                </div>
                                <div className="col-3 text-end">
                                    <p className={`${style?.shapeName} ${style?.pad_2}`}>{NumberWithCommas(ele?.Pcs, 0)}/{NumberWithCommas(ele?.Wt, 3)}</p>
                                </div>
                                <div className="col-3 text-end">
                                    <p className={`${style?.shapeName} ${style?.pad_2}`}>{NumberWithCommas(ele?.Rate, 2)}</p>
                                </div>
                                <div className="col-3 text-end">
                                    <p className={`${style?.shapeName} ${style?.pad_2}`}>{NumberWithCommas(ele?.Amount, 2)}</p>
                                </div>
                            </div>
                        })}
                        {e?.misc.map((ele, ind) => {
                            return <div key={ind} className={`d-flex w-100`}>
                                <div className="col-3">
                                    <p className={`${style?.shapeName} ${style?.pad_2}`}>{ele?.ShapeName}</p>
                                </div>
                                <div className="col-3 text-end">
                                    <p className={`${style?.shapeName} ${style?.pad_2}`}>{NumberWithCommas(ele?.Pcs, 0)}/{ele?.IsHSCOE === 0 ? NumberWithCommas(ele?.Wt, 3) : NumberWithCommas(ele?.ServWt, 3)}</p>
                                </div>
                                <div className="col-3 text-end">
                                    <p className={`${style?.shapeName} ${style?.pad_2}`}>{NumberWithCommas(ele?.Rate, 2)}</p>
                                </div>
                                <div className="col-3 text-end">
                                    <p className={`${style?.shapeName} ${style?.pad_2}`}>{NumberWithCommas(ele?.Amount, 2)}</p>
                                </div>
                            </div>
                        })}
                        {/* <div className="col-3  p-1 border-end">
                            {e?.colorstone.map((ele, ind) => {
                                return <p key={ind} className={`${style?.shapeName}`}>{ele?.ShapeName}</p>
                            })}
                            {e?.misc.map((ele, ind) => {
                                return <p key={ind} className={`${style?.shapeName}`}>{ele?.ShapeName}</p>
                            })}
                        </div>
                        <div className="col-3  p-1 border-end text-end">
                            {e?.colorstone.map((ele, ind) => {
                                return <p key={ind} className={`${style?.shapeName}`}>{NumberWithCommas(ele?.Pcs, 0)}/{NumberWithCommas(ele?.Wt, 3)}</p>
                            })}
                            {e?.misc.map((ele, ind) => {
                                return <p key={ind} className={`${style?.shapeName}`}>{NumberWithCommas(ele?.Pcs, 0)}/{NumberWithCommas(ele?.Wt, 3)}</p>
                            })}
                        </div>
                        <div className="col-3  p-1 border-end text-end">
                            {e?.colorstone.map((ele, ind) => {
                                return <p key={ind} className={`${style?.shapeName}`}>{NumberWithCommas(ele?.Rate, 2)}</p>
                            })}
                            {e?.misc.map((ele, ind) => {
                                return <p key={ind} className={`${style?.shapeName}`}>{NumberWithCommas(ele?.Rate, 2)}</p>
                            })}
                        </div>
                        <div className="col-3  p-1 text-end">
                            {e?.colorstone.map((ele, ind) => {
                                return <p key={ind} className={`${style?.shapeName}`}>{NumberWithCommas(ele?.Amount, 2)}</p>
                            })}
                            {e?.misc.map((ele, ind) => {
                                return <p key={ind} className={`${style?.shapeName}`}>{NumberWithCommas(ele?.Amount, 2)}</p>
                            })}
                        </div> */}
                        <div className={`${style?.line1Stones}`}></div>
                        <div className={`${style?.line2Stones}`}></div>
                        <div className={`${style?.line3Stones}`}></div>
                    </div>
                    <div className={`${style?.shapeName} ${style?.GWT} border-end p-1 text-end`}>{NumberWithCommas(e?.grosswt, 3)}</div>
                    <div className={`${style?.shapeName} ${style?.NWT} border-end p-1 text-end`}>{NumberWithCommas(e?.NetWt, 3)}</div>
                    <div className={`${style?.shapeName} ${style?.PURITY} border-end p-1 text-end`}>{NumberWithCommas(e?.MetalPriceRatio, 3)}</div>
                    <div className={`${style?.shapeName} ${style?.WASTAGE} border-end p-1 text-end`}>{NumberWithCommas(e?.Wastage, 3)}</div>
                    <div className={`${style?.shapeName} ${style?.GOLDRate} border-end p-1 text-end`}>{NumberWithCommas(e?.metalrate, 2)}</div>
                    <div className={`${style?.shapeName} ${style?.PUREWT} border-end p-1 text-end`}>{NumberWithCommas(e?.PureNetWt, 3)}</div>
                    <div className={`${style?.shapeName} ${style?.TOTALMISC} border-end p-1 text-end`}>{NumberWithCommas(e?.MiscAmount, 2)}</div>
                    <div className={`${style?.shapeName} ${style?.GOLDAMOUNT} border-end p-1 text-end`}>{NumberWithCommas(e?.MetalAmount, 2)}</div>
                    <div className={`${style?.shapeName} ${style?.TOTALAMT} p-1 text-end`}>{NumberWithCommas(e?.TotalAmount, 2)}</div>
                </div>
            })}
            {/* table total */}
            <div className={`d-flex border-start border-end border-bottom lightGrey no_break ${style?.shapeName}`}>
                <div className={`${style?.tableTotal} text-center border-end p-1 fw-bold`}>TOTAL</div>
                <div className={`${style?.STONE}   border-end d-flex`}>
                    <div className="col-3  p-1 border-end"></div>
                    <div className="col-3  p-1 border-end text-end fw-bold">{NumberWithCommas(data?.mainTotal?.colorstone?.Pcs + data?.mainTotal?.misc?.Pcs, 0)}/{NumberWithCommas(data?.mainTotal?.csMiscWt, 3)}</div>
                    <div className="col-3  p-1 border-end text-end fw-bold"></div>
                    <div className="col-3  p-1 text-end fw-bold">{NumberWithCommas(data?.mainTotal?.stone_misc?.Amount, 2)}</div>
                </div>
                <div className={`${style?.GWT} border-end p-1 text-end fw-bold`}>{NumberWithCommas(data?.mainTotal?.grosswt, 3)}</div>
                <div className={`${style?.NWT} border-end p-1 text-end fw-bold`}>{NumberWithCommas(data?.mainTotal?.netwt, 3)}</div>
                <div className={`${style?.PURITY} border-end p-1 text-end fw-bold`}></div>
                <div className={`${style?.WASTAGE} border-end p-1 text-end fw-bold`}></div>
                <div className={`${style?.GOLDRate} border-end p-1 text-end fw-bold`}></div>
                <div className={`${style?.PUREWT} border-end p-1 text-end fw-bold`}>{NumberWithCommas(data?.mainTotal?.total_purenetwt, 3)}</div>
                <div className={`${style?.TOTALMISC} border-end p-1 text-end fw-bold`}>{NumberWithCommas(data?.mainTotal?.totalMiscAmount, 2)}</div>
                <div className={`${style?.GOLDAMOUNT} border-end p-1 text-end fw-bold`}>{NumberWithCommas(data?.mainTotal?.MetalAmount, 2)}</div>
                <div className={`${style?.TOTALAMT} p-1 text-end fw-bold`}>{NumberWithCommas(data?.mainTotal?.total_amount, 2)}</div>
            </div>
            {/* summary */}
            <div className="my-1 d-flex no_break">
                <div className="col-8 pe-1">
                    <div className="border">
                        <p className="lightGrey p-1 fw-bold text-center">Summary Detail</p>
                        <div className="d-grid p-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            {summary.map((e, i) => {
                                return <div className="d-flex" key={i}><div className="col-9">{e?.Categoryname} | {e?.SubCategoryname} </div><div className="col-1 px-1 text-center">:</div><div className="col-2 fw-bold">{NumberWithCommas(e?.Quantity, 0)}</div></div>
                            })}
                        </div>
                    </div>
                </div>
                <div className="ps-1 col-4">
                    <div className='p-1 border h-100'>
                        {data?.allTaxes.map((e, i) => {
                            return <div className="d-flex justify-content-between" key={i}>
                                <p>{e?.name} @ {e?.per}</p>
                                <p>{NumberWithCommas(+e?.amount * headerData?.CurrencyExchRate, 2)}</p>
                            </div>
                        })}

                        {headerData?.AddLess !== 0 && <div className="d-flex justify-content-between">
                            <p className='fw-bold'>{headerData?.AddLess > 0 ? "Add" : "Less"}</p>
                            <p className='fw-bold'>{NumberWithCommas(headerData?.AddLess, 2)}</p>
                        </div>}
                    </div>
                </div>
            </div>
            {/* total */}
            <div className="mb-1 border lightGrey d-flex no_break">
                <div className="col-8 text-end p-1 PS-2">
                    <p className="fw-bold">TOTAL</p>
                </div>
                <div className="col-4 p-1 ps-2">
                    <div className="d-flex justify-content-between">
                        <p>CASH :</p>
                        <p className='fw-bold'>{NumberWithCommas(data?.mainTotal?.total_amount + data?.allTaxes?.reduce((acc, cObj) => acc + (+cObj?.amount * headerData?.CurrencyExchRate), 0) + headerData?.AddLess, 2)}</p>
                    </div>
                    <div className="d-flex justify-content-between">
                        <p>Gold in 24K :</p>
                        <p className='fw-bold'>{NumberWithCommas(data?.mainTotal?.total_purenetwt, 3)}</p>
                    </div>
                </div>
            </div>
            {/* summary */}
            <div className="d-flex justify-content-between no_break">
                <div className="col-6 pe-1">
                    <div className="border">
                        <p className="fw-bold lightGrey p-1">SUMMARY</p>
                        <div className="d-flex justify-content-between">
                            <div className="col-6 px-1 border-end pb-4 position-relative">
                                <div className="d-flex justify-content-between">
                                    <p className="fw-bold">GOLD IN 24KT</p>
                                    <p>{NumberWithCommas((data?.mainTotal?.total_purenetwt ), 3)} gm</p>
                                    {/* <p>{NumberWithCommas((data?.mainTotal?.total_purenetwt - notGoldMetalWtTotal), 3)} gm</p> */}
                                </div>
                                {
                                    MetShpWise?.map((e, i) => {
                                        return <div className="d-flex justify-content-between" key={i}>
                                        <p className="fw-bold">{e?.ShapeName}</p>
                                        <p>{NumberWithCommas((e?.metalfinewt), 3)} gm </p>
                                    </div>
                                    })
                                }
                                <div className="d-flex justify-content-between">
                                    <p className="fw-bold">GROSS WT	</p>
                                    <p>{NumberWithCommas(data?.mainTotal?.grosswt, 3)} gm</p>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <p className="fw-bold">NET WT </p>
                                    <p>{NumberWithCommas(data?.mainTotal?.netwt, 3)} gm	</p>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <p className="fw-bold">MINA/KUNDAN	</p>
                                    <p>{NumberWithCommas(data?.mainTotal?.misc?.Pcs, 0)} / {NumberWithCommas(data?.mainTotal?.MiscWt, 3)} gm	</p>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <p className="fw-bold">STONE WT</p>
                                    <p>{NumberWithCommas(data?.mainTotal?.colorstone?.Pcs)} / {NumberWithCommas(data?.mainTotal?.colorstone?.Wt, 3)} ctw	</p>
                                </div>
                                <div className={`d-flex justify-content-between lightGrey position-absolute start-0 bottom-0 w-100 px-1 py-1 ${style?.heightPad}`}>

                                </div>
                            </div>
                            <div className="col-6 px-1  position-relative" style={{ paddingBottom: "32px" }}>
                                <div className="d-flex justify-content-between">
                                    <p className="fw-bold">GOLD</p>
                                    <p>{NumberWithCommas((data?.mainTotal?.MetalAmount), 2)} </p>
                                    {/* <p>{NumberWithCommas((data?.mainTotal?.MetalAmount - notGoldMetalTotal), 2)} </p> */}
                                </div>
                                {
                                    MetShpWise?.map((e, i) => {
                                        return <div className="d-flex justify-content-between" key={i}>
                                        <p className="fw-bold">{e?.ShapeName}</p>
                                        <p>{NumberWithCommas((e?.Amount), 2)} </p>
                                    </div>
                                    })
                                }
                                <div className="d-flex justify-content-between">
                                    <p className="fw-bold">MINA/KUNDAN	</p>
                                    <p>{NumberWithCommas(data?.mainTotal?.misc?.Amount, 2)} </p>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <p className="fw-bold">CST </p>
                                    <p>{NumberWithCommas(data?.mainTotal?.colorstone?.Amount, 2)} 	</p>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <p className="fw-bold">MAKING	</p>
                                    <p>{NumberWithCommas(data?.mainTotal?.total_Making_Amount + data?.mainTotal?.diamonds?.SettingAmount + data?.mainTotal?.colorstone?.SettingAmount, 2)} 	</p>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <p className="fw-bold">OTHER</p>
                                    <p>{NumberWithCommas(data?.mainTotal?.total_other + data?.mainTotal?.total_diamondHandling, 2)}	</p>
                                </div>
                                {headerData?.AddLess !== 0 && <div className="d-flex justify-content-between">
                                    <p className="fw-bold">{headerData?.AddLess > 0 ? "ADD" : "LESS"}</p>
                                    <p>{NumberWithCommas(headerData?.AddLess, 2)}	</p>
                                </div>}
                                <div className="d-flex justify-content-between lightGrey position-absolute start-0 bottom-0 w-100 px-1 py-1">
                                    <p className="fw-bold">TOTAL</p>
                                    <p>{NumberWithCommas(data?.mainTotal?.total_amount + data?.allTaxes?.reduce((acc, cObj) => acc + (+cObj?.amount * headerData?.CurrencyExchRate), 0) + headerData?.AddLess, 2)} 	</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 ps-1">
                    <div className="border h-100">
                        <div className="d-flex lightGrey">
                            <p className={`fw-bold ${style?.w_20} text-center p-1`}>Metal Type</p>
                            <p className={`fw-bold ${style?.w_20} text-center p-1`}>GWt (gm)</p>
                            <p className={`fw-bold ${style?.w_20} text-center p-1`}>Net Wt (gm)</p>
                            <p className={`fw-bold ${style?.w_20} text-center p-1`}>Pure Wt (gm)</p>
                            <p className={`fw-bold ${style?.w_20} text-center p-1`}>Gold Amount</p>
                        </div>
                        {
                            goldList?.map((e, i) => {
                                return <div className="d-flex " key={i}>
                                    <p className={`${style?.w_20} text-center p-1`}>{e?.MetalTypePurity}</p>
                                    <p className={`${style?.w_20} text-center p-1`}>{NumberWithCommas(e?.grosswt, 3)}</p>
                                    <p className={`${style?.w_20} text-center p-1`}>{NumberWithCommas(e?.NetWt, 3)}</p>
                                    <p className={`${style?.w_20} text-center p-1`}>{NumberWithCommas(e?.PureNetWt, 3)}</p>
                                    <p className={`${style?.w_20} text-center p-1`}>{NumberWithCommas(e?.metal[0]?.Amount, 2)}</p>
                                </div>
                            })
                        }

                    </div>
                </div>
            </div>
            {/* note */}
            <div className="my-1 border p-1 no_break">
                <p className="fw-bold">NOTE :</p>
                <div dangerouslySetInnerHTML={{ __html: headerData?.Declaration }}></div>
            </div>
            {/* print remark */}
            <div className='no_break'>
                <p><span className="fw-bold">REMARKS :</span> <span dangerouslySetInnerHTML={{__html:headerData?.PrintRemark}}></span></p>
            </div>
            {/* TERMS INCLUDED : */}
            <div className='pb-2 no_break'>
            <p className="fw-bold pb-1 font_14_sum4">
                  TERMS INCLUDED : &nbsp;
                  <span
                    dangerouslySetInnerHTML={{
                      __html: headerData?.SalesRepPolicyTermsDescription,
                    }}
                    style={{ fontWeight: "400" }}
                  />
                </p>
                <div className="d-flex border">
                    <div className='text-center pt-5 border-end col-6'>
                        <p className='fw-bold'>RECEIVER'S SIGNATURE & SEAL</p>
                    </div>
                    <div className='text-center pt-5 col-6'>
                        <p className='fw-bold'>for,Classmate corporation Pvt Ltd</p>
                    </div>
                </div>
            </div>
            {checkBox?.summary &&
                <>
                    {/* metal table */}
                    <div className="d-flex border no_break">
                        <div className={`${style?.metalCol} p-1 fw-bold text-center border-end`}>Metal Type</div>
                        <div className={`${style?.metalCol} p-1 fw-bold text-center border-end`}>Gwt</div>
                        <div className={`${style?.metalCol} p-1 fw-bold text-center border-end`}>Net wt</div>
                        <div className={`${style?.metalCol} p-1 fw-bold text-center border-end`}>Tunch</div>
                        <div className={`${style?.metalCol} p-1 fw-bold text-center border-end`}>Pure wt</div>
                        <div className={`${style?.metalCol} p-1 fw-bold text-center border-end`}>Gold Price 24 kt</div>
                        <div className={`${style?.metalCol} p-1 fw-bold text-center`}>Gold Amount</div>
                    </div>
                    {metalList.list.map((e, i) => {
                        return <div className="d-flex border-start border-end border-bottom no_break" key={i}>
                            <div className={`${style?.metalCol} p-1 text-center border-end`}>{e?.MetalTypePurity}</div>
                            <div className={`${style?.metalCol} p-1 text-end border-end`}>{NumberWithCommas(e?.grosswt, 3)}</div>
                            <div className={`${style?.metalCol} p-1 text-end border-end`}>{NumberWithCommas(e?.NetWt, 3)}</div>
                            <div className={`${style?.metalCol} p-1 text-end border-end`}>{NumberWithCommas(e?.Tunch, 3)}</div>
                            <div className={`${style?.metalCol} p-1 text-end border-end`}>{NumberWithCommas(e?.PureNetWt, 3)}</div>
                            <div className={`${style?.metalCol} p-1 text-end border-end`}>{NumberWithCommas(headerData?.MetalRate24K, 2)}</div>
                            <div className={`${style?.metalCol} p-1 text-end`}>{NumberWithCommas(e?.MetalAmount, 2)}</div>
                        </div>
                    })}
                    {/* metal table total */}
                    <div className="d-flex border-start border-end border-bottom lightGrey no_break">
                        <div className={`${style?.metalCol} p-1 fw-bold text-center border-end`}>TOTAL</div>
                        <div className={`${style?.metalCol} p-1 fw-bold text-end border-end`}>{NumberWithCommas(data?.mainTotal?.grosswt, 3)}</div>
                        <div className={`${style?.metalCol} p-1 fw-bold text-end border-end`}>{NumberWithCommas(data?.mainTotal?.netwt, 3)}</div>
                        <div className={`${style?.metalCol} p-1 fw-bold text-end border-end`}></div>
                        <div className={`${style?.metalCol} p-1 fw-bold text-end border-end`}>{NumberWithCommas(metalList?.total?.PureNetWt, 3)}</div>
                        <div className={`${style?.metalCol} p-1 fw-bold text-end border-end`}></div>
                        <div className={`${style?.metalCol} p-1 fw-bold text-end`}>{NumberWithCommas(data?.mainTotal?.MetalAmount, 2)}</div>
                    </div>
                    {/* misc and colorstone tables */}
                    <div className="d-flex mt-1">
                        <div className="col-6 pe-1">
                            <div className="border d-flex no_break" >
                                <div className='fw-bold col-3 text-center p-1 border-end'>Misc Type</div>
                                <div className='fw-bold col-3 text-center p-1 border-end'>Misc Ctw</div>
                                <div className='fw-bold col-3 text-center p-1 border-end'>Misc Price</div>
                                <div className='fw-bold col-3 text-center p-1'>Misc Amount</div>
                            </div>
                            {miscs.list.map((ele, ind) => {
                                return <div className="border-start border-end border-bottom d-flex no_break" key={ind}>
                                    <div className='col-3 text-center p-1 border-end'>{ele?.MasterManagement_DiamondStoneTypeName}</div>
                                    <div className='col-3 text-center p-1 border-end'>{NumberWithCommas(ele?.Wt+ele?.ServWt, 3)}</div>
                                    <div className='col-3 text-center p-1 border-end'>{NumberWithCommas(ele?.Rate, 2)}</div>
                                    <div className='col-3 text-center p-1'>{NumberWithCommas(ele?.Amount, 2)}</div>
                                </div>
                            })}
                            <div className="border-start border-end border-bottom d-flex lightGrey no_break">
                                <div className='col-3 text-end p-1 border-end fw-bold'> Total</div>
                                <div className='col-3 text-center p-1 border-end fw-bold'>{NumberWithCommas(miscs?.total?.Wt+miscs?.total?.ServWt, 3)}</div>
                                <div className='col-3 text-center p-1 border-end fw-bold'></div>
                                <div className='col-3 text-center p-1 fw-bold'>{NumberWithCommas(miscs?.total?.Amount, 2)}</div>
                            </div>
                        </div>
                        <div className="col-6 ps-1">
                            <div className="border d-flex no_break">
                                <div className='fw-bold col-3 text-center p-1 border-end'>CS Type</div>
                                <div className='fw-bold col-3 text-center p-1 border-end'>CS Ctw</div>
                                <div className='fw-bold col-3 text-center p-1 border-end'>CS Price</div>
                                <div className='fw-bold col-3 text-center p-1'>CS Amount</div>
                            </div>
                            {colorStones.list.map((ele, ind) => {
                                return <div className="border-start border-end border-bottom d-flex no_break" key={ind}>
                                    <div className='col-3 text-center p-1 border-end'>{ele?.MasterManagement_DiamondStoneTypeName}</div>
                                    <div className='col-3 text-center p-1 border-end'>{NumberWithCommas(ele?.Wt, 3)}</div>
                                    <div className='col-3 text-center p-1 border-end'>{NumberWithCommas(ele?.Rate, 2)}</div>
                                    <div className='col-3 text-center p-1'>{NumberWithCommas(ele?.Amount, 2)}</div>
                                </div>
                            })}
                            <div className="border-start border-end border-bottom d-flex lightGrey no_break">
                                <div className='col-3 text-end p-1 border-end fw-bold'> </div>
                                <div className='col-3 text-center p-1 border-end fw-bold'>{NumberWithCommas(colorStones?.total?.Wt, 3)}</div>
                                <div className='col-3 text-center p-1 border-end fw-bold'></div>
                                <div className='col-3 text-center p-1 fw-bold'>{NumberWithCommas(colorStones?.total?.Amount, 2)}</div>
                            </div>
                        </div>
                    </div>
                </>
            }
        </div>
    ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
            {msg}
        </p>
    );
}

export default Summary9