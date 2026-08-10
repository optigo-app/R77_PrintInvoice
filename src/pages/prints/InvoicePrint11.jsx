import React, { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import style from "../../assets/css/prints/InvoicePrint_10_11.module.css";
import {
  FooterComponent,
  HeaderComponent,
  NumberWithCommas,
  apiCall,
  checkMsg,
  fixedValues,
  handlePrint,
  isObjectEmpty,
  taxGenrator,
} from "../../GlobalFunctions";
import { ToWords } from "to-words";
import BarcodePrintGenerator from "../../components/barcodes/BarcodePrintGenerator";
import style2 from "../../assets/css/headers/header1.module.css";
import footerStyle from "../../assets/css/footers/footer2.module.css";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { cloneDeep } from "lodash";

const InvoicePrint_10_11 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  const [loader, setLoader] = useState(true);
  const [msg, setMsg] = useState("");
  const [data, setData] = useState([]);
  const [otherMaterial, setOtherMaterial] = useState([]);
  const [header, setHeader] = useState(null);
  const [footer, setFooter] = useState(null);
  const [headerData, setHeaderData] = useState({});
  const [customerAddress, setCustomerAddress] = useState([]);
  const [headerss, setHeaderss] = useState(null);

  const [total, setTotal] = useState({
    total: 0,
    grandtotal: 0,
    totals: 0,
    discounttotals: 0
  });
  const [isImageWorking, setIsImageWorking] = useState(true);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  // const [discount, setDiscount] = useState(0);
  // const [taxes, setTaxes] = useState([]);
  const [pnm, setPnm] = useState(atob(printName).toLowerCase());
  const [totalpcsss, setTotalPcsss] = useState(0);
  const toWords = new ToWords();
  const [discount, setDiscount] = useState(0);
  const [taxes, setTaxes] = useState([]);
  const [mainDatas, setMainDatas] = useState({});

  const [mainData, setMainData] = useState({
    resultArr: [],
    findings: [],
    diamonds: [],
    colorStones: [],
    miscs: [],
    otherCharges: [],
    misc2: [],
    labour: {},
    labours: [],
    diamondHandling: 0,
    secondaryMetal: [],
    fullnfinaltotal: 0,
    totalGrossWt:0,
    totalNetWt:0,
  });

  const [totalss, setTotalss] = useState({
    total: 0,
    discount: 0,
    totalPcs: 0,
    SettingAmount: 0,
  });
  


  const loadData = (data) => {
    let head = HeaderComponent("1", data?.BillPrint_Json[0]);
    setHeader(head);
    let headersss = HeaderComponent("3", data?.BillPrint_Json[0]);
    setHeaderss(headersss);
    setHeaderData(data?.BillPrint_Json[0]);
    let footers = FooterComponent("2", data?.BillPrint_Json[0]);
    setFooter(footers);
    let custAddress = data?.BillPrint_Json[0]?.Printlable.split("\n");
    setCustomerAddress(custAddress);

    let datas = OrganizeDataPrint(data?.BillPrint_Json[0], data?.BillPrint_Json1, data?.BillPrint_Json2);
    setTaxes(datas?.allTaxes);
    setMainDatas(datas)
    let resultArr = [];
    let findings = [];
    let diamonds = [];
    let colorStones = [];
    let misc2 = [];
    let labour = { label: "LABOUR", primaryWt: 0, makingAmount: 0, totalAmount: 0 };
    let labours = [];
    let miscs = [];
    let otherCharges = [];
    let secondaryMetal = [];
    let total2 = { ...totalss };
    let diamondTotal = 0;
    let colorStone1Total1 = 0;
    let colorStone2Total2 = 0;
    let misc1Total1 = 0;
    let misc2Total2 = 0;
    let diamondHandling = 0;
    let totalPcss = [];
    let jobWiseLabourCalc = 0;
    let jobWiseMinusFindigWt = 0;
    let SettingAmount = datas?.mainTotal?.diamonds?.SettingAmount + datas?.mainTotal?.colorstone?.SettingAmount;
    let fullnfinaltotal = 0;
    let total_grosswt = 0;
    let total_netwt = 0;

    let pcsCounts = []
    datas?.resultArray?.map((e, i) => {
      total_grosswt += e?.grosswt;
      total_netwt += e?.NetWt ;
      let findGroups = pcsCounts?.findIndex((ele, ind) => ele?.GroupJob === e?.GroupJob);
      if (findGroups === -1) {
        pcsCounts?.push({ GroupJob: e?.GroupJob, count: 1 });
      } else {
        if (pcsCounts[findGroups].GroupJob === "") {
          pcsCounts[findGroups].count += 1;
        }
      }
      let obj = cloneDeep(e);
      let findingWt = 0;
      let findingsWt = 0;
      let findingsAmount = 0;
      let secondaryMetalAmount = 0;
      let findLabour = labours?.findIndex((ele, ind) => ele?.MaKingCharge_Unit === e?.MaKingCharge_Unit);
      if (findLabour === -1) {
        labours?.push({ label: "LABOUR", MaKingCharge_Unit: e?.MaKingCharge_Unit, MakingAmount: e?.MakingAmount });
      } else {
        labours[findLabour].MakingAmount += e?.MakingAmount
      }
      total2.total += e?.TotalCsSetcost + e?.TotalDiaSetcost
      obj.primaryMetal = e?.metal?.find((ele, ind) => ele?.IsPrimaryMetal === 1);
 
      e?.finding?.forEach((ele, ind) => {
        // if (ele?.ShapeName !== obj?.primaryMetal?.ShapeName && ele?.QualityName !== obj?.primaryMetal?.QualityName) {
        let obb = cloneDeep(ele);
        if (obj?.primaryMetal) {
          obb.Rate = obj?.primaryMetal?.Rate;
          obb.Amount = (ele?.Wt * obb?.Rate);
          findingsAmount += (ele?.Wt * obb?.Rate);
        }
        obb.count = 1;
        findingsWt += ele?.Wt;
        let findFinding = findings?.findIndex((elem, index) => elem?.ShapeName === ele?.ShapeName && elem?.QualityName === ele?.QualityName);
        if (findFinding === -1) {
          findings?.push(obb);
        } else {
          findings[findFinding].Wt += ele?.Wt;
          findings[findFinding].Pcs += ele?.Pcs;
          findings[findFinding].Rate = findings[findFinding].Rate + obb?.Rate;
          findings[findFinding].Amount += obb?.Amount;
          findings[findFinding].count += 1;
        }

        total2.total += (obb?.Amount);
        // }
        if (ele?.Supplier?.toLowerCase() === "customer") {
          findingWt += ele?.Wt
        }
      });
      let secondaryWt = 0;
      e?.metal?.forEach((ele, ind) => {
        if (ele?.IsPrimaryMetal !== 1) {
          let findSecondary = secondaryMetal?.findIndex((elem, index) => elem?.ShapeName === ele?.ShapeName && elem?.QualityName === ele?.QualityName && elem?.Rate === ele?.Rate);
          if (findSecondary === -1) {
            secondaryMetal?.push(ele)
          } else {
            secondaryMetal[findSecondary].Wt += ele?.Wt;
            secondaryMetal[findSecondary].Pcs += ele?.Pcs;
            secondaryMetal[findSecondary].Amount += ele?.Amount;
          }
          secondaryWt += ele?.Wt;
        }
      })

      let findPcss = totalPcss?.findIndex((ele, ind) => ele?.GroupJob === e?.GroupJob);
      if (findPcss === -1) {
        totalPcss?.push({ GroupJob: e?.GroupJob, value: e?.Quantity });
      } else {
        if (e?.GroupJob === "") {
          let findQuantity = totalPcss?.findIndex((ele, ind) => ele?.GroupJob === '');
          if (findQuantity === -1) {
            totalPcss?.push({ GroupJob: e?.GroupJob, value: e?.Quantity });
          } else {
            totalPcss[findQuantity].value += e?.Quantity;
          }
        }
      }

      let primaryWt = 0;
      let count = 0;
      let netWtFinal = e?.NetWt + e?.LossWt - findingsWt;

      diamondHandling += e?.TotalDiamondHandling;
      let primaryMetalRAte = 0;
      e?.metal?.forEach((ele, ind) => {
        count += 1;
        if (ele?.IsPrimaryMetal === 1) {
          primaryWt += ele?.Wt;
          if (primaryMetalRAte === 0) {
            primaryMetalRAte += ele?.Rate;
          }
        } else {
          secondaryMetalAmount += ele?.Amount;
        }
      });
      primaryWt = primaryWt - findingsWt
      let latestAmount = (((e?.MetalDiaWt - findingsWt) * primaryMetalRAte));
      fullnfinaltotal += latestAmount;
      total2.total += latestAmount;
      labour.makingAmount += e?.MakingAmount;
      labour.totalAmount += e?.MakingAmount + e?.TotalDiaSetcost + e?.TotalCsSetcost;
      total2.discount += e?.DiscountAmt;
      obj.primaryWt = primaryWt;
      obj.netWtFinal = netWtFinal;
      obj.latestAmount = latestAmount;
      obj.metalAmountFinal = e?.MetalAmount - findingsAmount + secondaryMetalAmount;
      if (count <= 1) {
        primaryWt = e?.NetWt + e?.LossWt;
      }
      if (obj?.primaryMetal) {
        // total2.total += obj?.metalAmountFinal;
        let findRecord = resultArr?.findIndex((ele, ind) => ele?.primaryMetal?.ShapeName === obj?.primaryMetal?.ShapeName && ele?.primaryMetal?.QualityName === obj?.primaryMetal?.QualityName && ele?.primaryMetal?.Rate === obj?.primaryMetal?.Rate);
        if (findRecord === -1) {
          resultArr?.push(obj);
        } else {
          resultArr[findRecord].grosswt += obj?.grosswt;
          resultArr[findRecord].NetWt += obj?.NetWt;
          resultArr[findRecord].LossWt += obj?.LossWt;
          resultArr[findRecord].primaryWt += obj?.primaryWt;
          resultArr[findRecord].primaryMetal.Pcs += obj?.primaryMetal.Pcs;
          resultArr[findRecord].primaryMetal.Wt += obj?.primaryMetal.Wt;
          resultArr[findRecord].primaryMetal.Amount += obj?.primaryMetal.Amount;
          resultArr[findRecord].netWtFinal += obj?.netWtFinal;
          resultArr[findRecord].metalAmountFinal += obj?.metalAmountFinal;
          resultArr[findRecord].latestAmount += latestAmount;
        }
      }

      jobWiseLabourCalc += ((e?.MetalDiaWt - findingWt) * e?.MaKingCharge_Unit);
      jobWiseMinusFindigWt += (e?.MetalDiaWt - findingWt);

      e?.diamonds?.forEach((ele, ind) => {
        let findDiamond = diamonds?.findIndex((elem, index) =>  elem?.MaterialTypeName === ele?.MaterialTypeName && elem?.isRateOnPcs === ele?.isRateOnPcs);
        diamondTotal += (ele?.Amount);
        if (findDiamond === -1) {
          diamonds?.push(ele);
        } else {
          diamonds[findDiamond].Wt += ele?.Wt;
          diamonds[findDiamond].Pcs += ele?.Pcs;
          diamonds[findDiamond].Amount += (ele?.Amount);
        }
      });

      e?.colorstone?.forEach((ele, ind) => {
        // total2.total += (ele?.Amount );
        let findColorStones = colorStones?.findIndex((elem, index) => elem?.MaterialTypeName === ele?.MaterialTypeName && elem?.isRateOnPcs === ele?.isRateOnPcs);
        if (findColorStones === -1) {
          colorStones?.push(ele);
        } else {
          colorStones[findColorStones].Wt += ele?.Wt;
          colorStones[findColorStones].Pcs += ele?.Pcs;
          colorStones[findColorStones].Amount += (ele?.Amount);
        }
        if (ele?.isRateOnPcs === 0) {
          colorStone1Total1 += ele?.Amount
        } else {
          colorStone2Total2 += ele?.Amount
        }
      });

      e?.misc?.forEach((ele, ind) => {
        if (ele?.isRateOnPcs === 0) {
          misc1Total1 += ele?.Amount;
        } else {
          misc2Total2 += ele?.Amount;
        }
        if (ele?.IsHSCOE !== 0) {
          let findMisc = miscs?.findIndex((elem, index) => elem?.ShapeName === ele?.ShapeName);
          if (findMisc === -1) {
            miscs?.push(ele);
          } else {
            miscs[findMisc].Wt += ele?.Wt
            miscs[findMisc].Pcs += ele?.Pcs
            miscs[findMisc].Amount += (ele?.Amount)
          }
          // total2.total += (ele?.Amount);
        }
        else if (ele?.IsHSCOE === 0) {
          // total2.total += ele?.Amount;
          let findMisc = misc2?.findIndex((elem, index) => elem?.MaterialTypeName === ele?.MaterialTypeName && elem?.isRateOnPcs === ele?.isRateOnPcs);
          if (findMisc === -1) {
            misc2?.push(ele);
          } else {
            misc2[findMisc].Wt += ele?.Wt;
            misc2[findMisc].Pcs += ele?.Pcs;
            misc2[findMisc].Amount += (ele?.Amount);
          }

        }
      });

      e?.other_details?.forEach((ele, ind) => {
        let findOther = otherCharges?.findIndex((elem, index) => elem?.label === ele?.label);
        total2.total += (+ele?.value);
        if (findOther === -1) {
          otherCharges?.push(ele);
        } else {
          otherCharges[findOther].value = +otherCharges[findOther]?.value + +ele?.value;
        }
      });

    });
    let takeFindingOnly = [];
    datas?.resultArray?.forEach((a) => {

      a?.finding?.forEach((el) => {
        takeFindingOnly?.push(el);
      })
     
    });

     let findingLabourArr = [];
     takeFindingOnly?.forEach((a) => {
      let obj = cloneDeep(a);
        let findrecord = findingLabourArr?.findIndex((al) => al?.SettingRate === obj?.SettingRate);
        if(findrecord === -1){
          findingLabourArr?.push(obj);
        }else{
          findingLabourArr[findrecord].SettingAmount += obj?.SettingAmount;
        }
      })

    setTotalPcsss(pcsCounts?.reduce((acc, cObj) => acc + cObj?.count, 0))
    findings?.forEach((ele, ind) => {
      ele.Rate = ele?.Amount / ele?.Wt;
      fullnfinaltotal += ele?.Amount;
    });
    secondaryMetal?.forEach((ele, ind) => {
      fullnfinaltotal += ele?.Amount;
    });
    diamonds?.forEach((ele, ind) => {
      fullnfinaltotal += ele?.Amount;
    });
    colorStones?.forEach((ele, ind) => {
      fullnfinaltotal += ele?.Amount;
    });
    misc2?.forEach((ele, ind) => {
      fullnfinaltotal += ele?.Amount;
    });
    labours?.forEach((ele, ind) => {
      fullnfinaltotal += ele?.MakingAmount;
    });
    miscs?.forEach((ele, ind) => {
      fullnfinaltotal += ele?.Amount;
    });
    fullnfinaltotal += diamondHandling + SettingAmount;
    
    otherCharges?.forEach((ele, ind) => {
      fullnfinaltotal += +ele?.value;
    });

    findingLabourArr?.forEach((ele, ind) => {
      fullnfinaltotal += ele?.SettingAmount;
    });

    let totalPcs = totalPcss?.reduce((acc, cObj) => acc + cObj?.value, 0);
    total2.total += (diamondTotal / data?.BillPrint_Json[0]?.CurrencyExchRate) + (colorStone1Total1 / data?.BillPrint_Json[0]?.CurrencyExchRate) +
      (colorStone2Total2 / data?.BillPrint_Json[0]?.CurrencyExchRate) + (misc1Total1 / data?.BillPrint_Json[0]?.CurrencyExchRate) +
      (misc2Total2 / data?.BillPrint_Json[0]?.CurrencyExchRate) + labours?.reduce((acc, cObj) => acc + cObj?.MakingAmount, 0) + diamondHandling + SettingAmount;

    labour.primaryWt = jobWiseMinusFindigWt;
    resultArr.sort((a, b) => {
      const labelA = a.MetalTypePurity.toLowerCase();
      const labelB = b.MetalTypePurity.toLowerCase();

      const hasNumberA = /\d/.test(labelA);
      const hasNumberB = /\d/.test(labelB);

      if (hasNumberA && !hasNumberB) {
        return -1; // Label with number comes before label without number
      } else if (!hasNumberA && hasNumberB) {
        return 1; // Label without number comes after label with number
      } else {
        // Both labels have numbers or both don't, sort alphabetically
        return labelA.localeCompare(labelB);
      }
    });
    setTotalss({ ...totalss, total: total2?.total, discount: total2?.discount, totalPcs: totalPcs, SettingAmount: SettingAmount, });
    setMainData({
      ...mainData, resultArr: resultArr, findings: findings, diamonds: diamonds, colorStones: colorStones,
      miscs: miscs, otherCharges: otherCharges, misc2: misc2, labour: labour, diamondHandling: diamondHandling, secondaryMetal: secondaryMetal, labours: labours, fullnfinaltotal: fullnfinaltotal, totalGrossWt:total_grosswt, totalNetWt:total_netwt, findingLabourArr : findingLabourArr
    });
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
  return loader ? (
    <Loader />
  ) : msg === "" ? (
    <div
      className={`container container-fluid mt-1 ${style?.InvoicePrint_10_11} ${style?.max_width_invp1011} pad_60_allPrint`}
    >
      {/* buttons */}
      <div
        className={`d-flex justify-content-end align-items-center ${style?.print_sec_sum4} mb-4`}
      >
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
      {headerData?.IsEinvoice !== 1 ?
        <><div className={` ${style?.headerTitle} `}>{headerData?.PrintHeadLabel}</div>
          <div className={`${style2.companyDetails}  head_line_h_invp1011 fsremark_10_invp1011 fslineh_10_invp1011`}>
            <div className={`${style2.companyhead} p-2 `}>
              <div style={{ fontWeight: "bold",paddingBottom:'2px' }} className={style?.companyFUllnameInvp11}>
                {headerData?.CompanyFullName}
              </div>
              <div className="fslineh_10_invp1011">{headerData?.CompanyAddress}</div>
              <div className="fslineh_10_invp1011">{headerData?.CompanyAddress2}</div>
              <div className="fslineh_10_invp1011">{headerData?.CompanyCity}-{headerData?.CompanyPinCode},{headerData?.CompanyState}({headerData?.CompanyCountry})</div>
              {/* <div>Tell No: {headerData?.CompanyTellNo}</div> */}
              <div className="fslineh_10_invp1011">T:  {headerData?.CompanyTellNo} | TOLL FREE {headerData?.CompanyTollFreeNo} | TOLL FREE {headerData?.CompanyTollFreeNo}</div>
              <div className="fslineh_10_invp1011">
                {headerData?.CompanyEmail} | {headerData?.CompanyWebsite}
              </div>
              <div className="fslineh_10_invp1011">
                {/* {headerData?.Company_VAT_GST_No} | {headerData?.Company_CST_STATE}-{headerData?.Company_CST_STATE_No} | PAN-{headerData?.Pannumber} */}
                {headerData?.Company_VAT_GST_No} | {headerData?.Company_CST_STATE}-{headerData?.Company_CST_STATE_No} | PAN-{headerData?.Pannumber}
              </div>
              <div className="fslineh_10_invp1011">{headerData?.MSME === '' ? '' : 'MSME - ' } {headerData?.MSME} </div>
            </div>
            <div style={{ width: "30%" }} className="d-flex justify-content-end align-item-center h-100 fsremark_10_invp1011 fslineh_10_invp1011">
              {isImageWorking && (headerData?.PrintLogo !== "" &&
                <img src={headerData?.PrintLogo} alt=""
                  className='w-100 h-auto ms-auto d-block object-fit-contain'
                  style={{ maxWidth: '97px' }}
                  onError={handleImageErrors} height={120} width={150} />)}
              {/* <img src={headerData?.PrintLogo} alt="" className={style2.headerImg} /> */}
            </div>
          </div></> : headerss}
      {/* barcodes */}
      {pnm === "invoice print 10" && <div className="mb-1">
        <div className="d-flex justify-content-between border border-black p-2 pb-1">
          <div className={`${style?.barcode} fslineh_10_invp1011`}>
            <BarcodePrintGenerator data={headerData?.VenCode} />
            <p className="fw-bold text-center">{headerData?.VenCode}</p>
          </div>
          <div className={`${style?.barcode} fslineh_10_invp1011`}>
            <BarcodePrintGenerator data={headerData?.InvoiceNo} />
            <p className="fw-bold text-center">{headerData?.InvoiceNo}</p>
          </div>
        </div>
      </div>}

      <div className="border border-black d-flex">
        <div className="col-4 px-2 border-end border-black fsremark_10_invp1011 fslineh_10_invp1011">
          <p className="fslineh_10_invp1011">{headerData?.lblBillTo}</p>
          <p className="fw-bold pe-2">{headerData?.customerfirmname}</p>
          <p className="fslineh_10_invp1011">{headerData?.customerAddress1}</p>
          <p className="fslineh_10_invp1011">{headerData?.customerAddress2}</p>
          <p className="fslineh_10_invp1011">
            {headerData?.customercity1} - {" "}
            {headerData?.PinCode}
          </p>
          <p className="fslineh_10_invp1011">{headerData?.customeremail1}</p>
          <p className="fslineh_10_invp1011">{headerData?.vat_cst_pan}</p>
          <p className="fslineh_10_invp1011">
            {headerData?.Cust_CST_STATE}-{headerData?.Cust_CST_STATE_No}
          </p>
        </div>
        <div className="col-4 px-2 border-end border-black">
          <p className="fsremark_10_invp1011 fslineh_10_invp1011">Ship To,</p>
          <p className="fw-bold fsremark_10_invp1011 fslineh_10_invp1011">{headerData?.customerfirmname}</p>
          {customerAddress.map((e, i) => {
            return <p key={i} className="fsremark_10_invp1011 fslineh_10_invp1011">{e}</p>;
          })}
        </div>
        <div className="col-4 px-2">
          <div className="d-flex">
            <div className="fw-bold col-6 fsremark_10_invp1011 fslineh_10_invp1011">BILL NO</div>
            <div className="col-6 fsremark_10_invp1011 fslineh_10_invp1011 fw-bold">{headerData?.InvoiceNo} </div>
          </div>
          <div className="d-flex">
            <div className="fw-bold col-6 fsremark_10_invp1011 fslineh_10_invp1011">DATE</div>
            <div className="col-6 fsremark_10_invp1011 fslineh_10_invp1011">{headerData?.EntryDate} </div>
          </div>
          <div className="d-flex">
            <div className="fw-bold col-6 fsremark_10_invp1011 fslineh_10_invp1011">NAME OF GOODS</div>
            <div className="col-6 fsremark_10_invp1011 fslineh_10_invp1011">{headerData?.NameOfGoods} </div>
          </div>
          <div className="d-flex">
            <div className="fw-bold col-6 fsremark_10_invp1011 fslineh_10_invp1011">PLACE OF SUPPLY</div>
            <div className="col-6 fsremark_10_invp1011 fslineh_10_invp1011">{headerData?.customerstate} </div>
          </div>
          {  headerData?.DueDays !== 0 && <div className="d-flex">
            <div className="fw-bold col-6 fsremark_10_invp1011 fslineh_10_invp1011">TERMS</div>
            <div className="col-6 fsremark_10_invp1011 fslineh_10_invp1011">{headerData?.DueDays} </div>
          </div>}
        </div>
      </div>

      <div className="my-1">
        <div className="d-flex border border-black">
          <div className="col-3 border-end">
            <p className="text-center fw-bold border-bottom fsremark_10_invp1011">DESCRIPTION</p>
          </div>
          <div className="col-9">
            <div className="d-flex border-bottom fsremark_10_invp1011">
              <div style={{ minWidth: "17%", width: "17%" }} className="fw-bold px-1">Detail</div>
              <div style={{ minWidth: "14.5%", width: "14.5%" }} className="fw-bold px-1 text-end">Gross Wt. </div>
              <div style={{ minWidth: "14.5%", width: "14.5%" }} className="fw-bold px-1 text-end">Net Wt. </div>
              <div style={{ minWidth: "7%", width: "7%" }} className="fw-bold px-1 text-end">Pcs </div>
              <div style={{ minWidth: "15%", width: "15%" }} className="fw-bold px-1 text-end">Qty </div>
              <div style={{ minWidth: "17%", width: "17%" }} className="fw-bold px-1 text-end">Rate </div>
              <div style={{ minWidth: "15%", width: "15%" }} className="fw-bold px-1 text-end">Amount</div>
            </div>
          </div>
        </div>
        <div className="d-flex border-start border-black border-end border-bottom border-black">
          <div className="col-3 border-end border-black d-flex align-items-center justify-content-center flex-column">
            <p className="w-100 text-center fsremark_10_invp1011">{ ((
              mainData?.diamonds?.length + mainData?.colorStones?.length + 
              mainData?.miscs?.length + mainData?.misc2?.length) > 0 ) ? `STUDDED JEWELLERY` : 'PLAIN JEWELLERY'}</p>
            <div className="d-flex pt-1">
              <div className="fw-bold col-6 fsremark_10_invp1011">{headerData?.HSN_No_Label}</div>
              <div className="col-6 fsremark_10_invp1011">{headerData?.HSN_No} </div>
            </div>
            {/* <p className="fw-bold">Total Pcs : {NumberWithCommas(totalpcsss, 0)}</p> */}
          </div>
          <div className="col-9 pb-5">
            {mainData?.resultArr?.map((e, i) => {
              return <div className="d-flex" key={i}>
                <div style={{ minWidth: "17%", width: "17%" }} className=" px-1"><p className="line_height_ivp11 fsremark_10_invp1011">{e?.primaryMetal?.ShapeName} {e?.primaryMetal?.QualityName}</p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.grosswt, 3)} Gms</p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.primaryWt, 3)} Gms</p></div>
                <div style={{ minWidth: "7%", width: "7%" }} className=" px-1"><p></p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className=" px-1"><p></p></div>
                <div style={{ minWidth: "17%", width: "17%" }} className=" px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.primaryMetal?.Rate, 2)}</p></div>
                {/* <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p>{NumberWithCommas(e?.primaryWt * e?.primaryMetal?.Rate, 2)}</p></div> */}
                <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.latestAmount, 2)}</p></div>
              </div>
            })}
            {mainData?.findings?.map((e, i) => {
              return <div className="d-flex" key={i}>
                <div style={{ minWidth: "17%", width: "17%" }} className="px-1"><p className="line_height_ivp11 fsremark_10_invp1011">{e?.ShapeName} {e?.QualityName}</p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.Wt, 3)} Gms</p></div>
                <div style={{ minWidth: "7%", width: "7%" }} className="px-1"><p></p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className="px-1"><p></p></div>
                <div style={{ minWidth: "17%", width: "17%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.Rate, 2)}</p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.Amount, 2)}</p></div>
              </div>
            })}
            {mainData?.secondaryMetal?.map((e, i) => {
              return <div className="d-flex" key={i}>
                <div style={{ minWidth: "17%", width: "17%" }} className="px-1"><p className="line_height_ivp11 fsremark_10_invp1011">{e?.ShapeName} {e?.QualityName}</p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.Wt, 3)} Gms</p></div>
                <div style={{ minWidth: "7%", width: "7%" }} className="px-1"><p></p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className="px-1"><p></p></div>
                <div style={{ minWidth: "17%", width: "17%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.Rate, 2)}</p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.Amount, 2)}</p></div>
              </div>
            })}
            {mainData?.diamonds?.map((e, i) => {
              return <div className="d-flex" key={i}>
                <div style={{ minWidth: "17%", width: "17%" }} className="px-1"><p className="line_height_ivp11 fsremark_10_invp1011">DIA { e?.MaterialTypeName !== '' && `(${e?.MaterialTypeName})`}</p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "7%", width: "7%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.Pcs, 0)}</p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.Wt, 3)} Ctw</p></div>
                <div style={{ minWidth: "17%", width: "17%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{(e?.isRateOnPcs === 0 ? (e?.Wt !== 0 && <>{NumberWithCommas(e?.Amount / e?.Wt, 2)} / Wt</>) : (e?.Pcs !== 0 && <>{NumberWithCommas(e?.Amount / e?.Pcs, 2)} / Pcs</>))}</p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.Amount, 2)}</p></div>
              </div>
            })}
            {mainData?.colorStones?.map((e, i) => {
              return <div className="d-flex" key={i}>
                <div style={{ minWidth: "17%", width: "17%" }} className=" px-1"><p className="line_height_ivp11 fsremark_10_invp1011">CS { e?.MaterialTypeName !== '' && `(${e?.MaterialTypeName})`}</p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p></p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p></p></div>
                <div style={{ minWidth: "7%", width: "7%" }} className=" px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.Pcs, 0)}</p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.Wt, 3)} Ctw</p></div>
                <div style={{ minWidth: "17%", width: "17%" }} className=" px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{(e?.isRateOnPcs === 0 ? (e?.Wt !== 0 && <>{NumberWithCommas(e?.Amount / e?.Wt, 2)} / Wt</>) : (e?.Pcs !== 0 && <>{NumberWithCommas(e?.Amount / e?.Pcs, 2)} / Pcs</>))}</p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.Amount, 2)}</p></div>
              </div>
            })}
            {mainData?.misc2?.map((e, i) => {
              return <div className="d-flex" key={i}>
                <div style={{ minWidth: "17%", width: "17%" }} className="px-1"><p className="line_height_ivp11 fsremark_10_invp1011">MISC { e?.MaterialTypeName !== '' && `(${e?.MaterialTypeName})`} </p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "7%", width: "7%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.Pcs, 0)}</p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.Wt, 3)} Gms</p></div>
                <div style={{ minWidth: "17%", width: "17%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{(e?.isRateOnPcs === 0 ? (e?.Wt !== 0 && <>{NumberWithCommas(e?.Amount / e?.Wt, 2)} / Wt</>) : (e?.Pcs !== 0 && <>{NumberWithCommas(e?.Amount / e?.Pcs, 2)} / Pcs</>))}</p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.Amount, 2)}</p></div>
              </div>
            })}
            {mainData?.labours?.map((ele, ind) => {
              return <div className="d-flex" key={ind}>
                <div style={{ minWidth: "17%", width: "17%" }} className="px-1"><p className="line_height_ivp11 fsremark_10_invp1011">{ele?.label}</p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "7%", width: "7%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "17%", width: "17%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(ele?.MaKingCharge_Unit, 2)}</p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(ele?.MakingAmount, 2)}</p></div>
              </div>
            })}
            {mainData?.findingLabourArr?.map((ele, ind) => {
              return <div className="d-flex" key={ind}>
                <div style={{ minWidth: "17%", width: "17%" }} className="px-1"><p className="line_height_ivp11 fsremark_10_invp1011">LABOUR</p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "7%", width: "7%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "17%", width: "17%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(ele?.SettingRate, 2)}</p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(ele?.SettingAmount, 2)}</p></div>
              </div>
            })}

            {mainData?.miscs?.map((e, i) => {
              return <div className="d-flex" key={i}>
                <div style={{ minWidth: "17%", width: "17%" }} className="px-1"><p className="line_height_ivp11 fsremark_10_invp1011">{e?.ShapeName}</p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "7%", width: "7%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "17%", width: "17%" }} className="px-1 text-end"><p></p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(e?.Amount / headerData?.CurrencyExchRate, 2)}</p></div>
              </div>
            })}
            {mainDatas?.mainTotal?.total_diamondHandling !== 0 && <div className="d-flex">
              <div style={{ minWidth: "17%", width: "17%" }} className=" px-1"><p className="line_height_ivp11 fsremark_10_invp1011">HANDLING</p></div>
              <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p></p></div>
              <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p></p></div>
              <div style={{ minWidth: "7%", width: "7%" }} className=" px-1 text-end"><p></p></div>
              <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p></p></div>
              <div style={{ minWidth: "17%", width: "17%" }} className=" px-1 text-end"><p></p></div>
              <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(mainDatas?.mainTotal?.total_diamondHandling, 2)}</p></div>
            </div>}
            {mainData?.otherCharges?.map((e, i) => {
              return <div className="d-flex" key={i}>
                <div style={{ minWidth: "17%", width: "17%" }} className=" px-1"><p className="line_height_ivp11 fsremark_10_invp1011">{e?.label}</p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p></p></div>
                <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p></p></div>
                <div style={{ minWidth: "7%", width: "7%" }} className=" px-1 text-end"><p></p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p></p></div>
                <div style={{ minWidth: "17%", width: "17%" }} className=" px-1 text-end"><p></p></div>
                <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(+e?.value, 2)}</p></div>
              </div>
            })}
            {totalss?.SettingAmount !== 0 && <div className="d-flex">
              <div style={{ minWidth: "17%", width: "17%" }} className=" px-1"><p className="line_height_ivp11 fsremark_10_invp1011">SETTING</p></div>
              <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p></p></div>
              <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p></p></div>
              <div style={{ minWidth: "7%", width: "7%" }} className=" px-1 text-end"><p></p></div>
              <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p></p></div>
              <div style={{ minWidth: "17%", width: "17%" }} className=" px-1 text-end"><p></p></div>
              <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p className="line_height_ivp11 fsremark_10_invp1011">{NumberWithCommas(totalss?.SettingAmount, 2)}</p></div>
            </div>}
          </div>
        </div>
        {/* total */}
        <div className={`d-flex border-start border-end border-bottom mb-1 border-black no_break `}>
          <div className="col-3 border-end d-flex align-items-center justify-content-center flex-column border-black"></div>
          <div className="col-9">
            <div className="d-flex border-bottom fsremark_10_invp1011 fw-bold">
              <div className="col-2 px-1 fsremark_10_invp1011">
                <p className={`${style?.min_height_21} fsremark_10_invp1011 fw-bold d-flex justify-content-start align-items-center`}>Total</p>
              </div>
              <div className="col-2 px-1 fsremark_10_invp1011">
                <p className={`${style?.min_height_21} text-end d-flex justify-content-center align-items-center`}>{mainData?.totalGrossWt?.toFixed(3)}</p>
              </div>
              <div className="col-2 px-1 fsremark_10_invp1011">
                <p className={`${style?.min_height_21} text-end d-flex justify-content-center align-items-center`}>{mainData?.totalNetWt?.toFixed(3)}</p>
              </div>
              <div className="col-1 px-1 fsremark_10_invp1011">
                <p className={`${style?.min_height_21} text-end`}></p>
              </div>

              <div className="col-1 px-1 fsremark_10_invp1011">
                <p className={`${style?.min_height_21} text-end`}></p>
              </div>
              <div className="col-2 px-1 fsremark_10_invp1011">
                <p className={`${style?.min_height_21} text-end`}></p>
              </div>
              <div className="col-2 px-1 fsremark_10_invp1011">
                <p className={`${style?.min_height_21} text-end fw-bold fsremark_10_invp1011 d-flex justify-content-end align-items-center`}>
                  {NumberWithCommas(mainData?.fullnfinaltotal, 2)}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* taxes */}
        <div className="d-flex border no_break border-black">
          <div className="col-8 border-end border-black"></div>
          <div className="col-4 px-1 fsremark_10_invp1011">
            {mainDatas?.mainTotal?.total_discount_amount !== 0 && <><div className="d-flex justify-content-between">
              <p>
                Discount
              </p>
              <p>{NumberWithCommas(mainDatas?.mainTotal?.total_discount_amount, 2)}</p>
            </div>
              <div className="d-flex justify-content-between fsremark_10_invp1011">
                <p className="fw-bold"> Total Amount </p>
                <p className="fw-bold"> {NumberWithCommas(((mainDatas?.mainTotal?.total_amount + headerData?.FreightCharges) / headerData?.CurrencyExchRate), 2)}</p>
              </div></>
            }
            {taxes?.map((e, i) => {
              return (
                <div className="d-flex justify-content-between fsremark_10_invp1011" key={i}>
                  <p>
                    {e?.name} @ {e?.per}
                  </p>
                  <p>{NumberWithCommas(e?.amount, 2)}</p>
                </div>
              );
            })}
            {headerData?.AddLess !== 0 && (
              <div className="d-flex justify-content-between fsremark_10_invp1011">
                <p>{headerData?.AddLess > 0 ? "Add" : "Less"}</p>
                <p>{NumberWithCommas(headerData?.AddLess / headerData?.CurrencyExchRate, 2)}</p>
              </div>
            )}
          </div>
        </div>
        <div className="d-flex border-start border-end border-bottom border-black no_break">
          <div className="col-8 border-end px-1">
            <p className="fw-bold fsremark_10_invp1011" > IN Words Indian Rupees</p>
            <p className="fw-bold fsremark_10_invp1011">
              {toWords.convert(+fixedValues(+fixedValues((mainDatas?.mainTotal?.total_amount + headerData?.FreightCharges) / headerData?.CurrencyExchRate, 2) +
                (+fixedValues(headerData?.AddLess / headerData?.CurrencyExchRate, 2) +
                  mainDatas?.allTaxes?.reduce((acc, cObj) => acc + (+fixedValues(+cObj?.amount, 2)), 0)), 2))} Only.
            </p>
          </div>
          <div className="col-4 px-1 d-flex justify-content-between align-items-center">
            <p className={`text-end fw-bold ${style?.fsremark_10}`}>Grand Total </p>
            <p className={`text-end fw-bold ${style?.fsremark_10}`}>
              {NumberWithCommas(+fixedValues((mainDatas?.mainTotal?.total_amount + headerData?.FreightCharges) / headerData?.CurrencyExchRate, 2) +
                (+fixedValues(headerData?.AddLess / headerData?.CurrencyExchRate, 2) +
                  mainDatas?.allTaxes?.reduce((acc, cObj) => acc + (+fixedValues(+cObj?.amount, 2)), 0)), 2)}
            </p>
          </div>
        </div>
        <div
          className={`border-start border-end border-bottom border-black p-1 no_break ${style?.delinvp11} ${style?.fsremark_10}`}
          dangerouslySetInnerHTML={{ __html: headerData?.Declaration }}
        ></div>
        <p className="p-1 no_break">
          <span className={`fw-bold ${style?.fsremark_10}`}> REMARKS :</span> <span className={`${style?.fsremark_10}`} dangerouslySetInnerHTML={{ __html: headerData?.PrintRemark }}></span> 
        </p>
        {/* {footer} */}
        <div className={`${footerStyle.container} no_break border-black ${style?.fsremark_10}`}>
          <div
            className={`${footerStyle.block1f3} border-black`}
            style={{ width: "33.33%", borderRight: "1px solid #e8e8e8" }}
          >
            <div className={`${style?.fsremark_10}`} style={{ fontWeight: "bold" }}>Bank Detail</div>
            <div className={`${style?.fsremark_10}`}>Bank Name: {headerData?.bankname}</div>
            <div className={`${style?.fsremark_10}`}>Branch: {headerData?.bankaddress}</div>
            <div className={`${style?.fsremark_10}`}>Account Name: {headerData?.accountname}</div>
            <div className={`${style?.fsremark_10}`}>Account No. : {headerData?.accountnumber}</div>
            <div className={`${style?.fsremark_10}`}>RTGS/NEFT IFSC: {headerData?.rtgs_neft_ifsc}</div>
            <div className={`${style?.fsremark_10}`}>Enquiry No. </div>
            <div className={`${style?.fsremark_10}`}> (E & OE)</div>
          </div>
          <div
            className={`${footerStyle.block2f3} border-black`}
            style={{ width: "33.33%", borderRight: "1px solid #e8e8e8" }}
          >
            <div className={`${`${style?.fsremark_10}`} fw-normal`}>Signature</div>
            <div className={`${style?.fsremark_10}`}>{headerData?.customerfirmname}</div>
          </div>
          <div className={footerStyle.block2f3} style={{ width: "33.33%" }}>
            <div className={`${`${style?.fsremark_10}`} fw-normal`}>Signature</div>
            <div className={`${style?.fsremark_10}`}>{headerData?.CompanyFullName}</div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
      {msg}
    </p>
  );
};

export default InvoicePrint_10_11;


// import React, { useEffect, useState } from "react";
// import Loader from "../../components/Loader";
// import style from "../../assets/css/prints/InvoicePrint_10_11.module.css";
// import {
//   FooterComponent,
//   HeaderComponent,
//   NumberWithCommas,
//   apiCall,
//   checkMsg,
//   fixedValues,
//   handlePrint,
//   isObjectEmpty,
//   taxGenrator,
// } from "../../GlobalFunctions";
// import { ToWords } from "to-words";
// import BarcodePrintGenerator from "../../components/barcodes/BarcodePrintGenerator";
// import style2 from "../../assets/css/headers/header1.module.css";
// import footerStyle from "../../assets/css/footers/footer2.module.css";
// import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
// import { cloneDeep } from "lodash";

// const InvoicePrint_10_11 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
//   const [loader, setLoader] = useState(true);
//   const [msg, setMsg] = useState("");
//   const [data, setData] = useState([]);
//   const [otherMaterial, setOtherMaterial] = useState([]);
//   const [header, setHeader] = useState(null);
//   const [footer, setFooter] = useState(null);
//   const [headerData, setHeaderData] = useState({});
//   const [customerAddress, setCustomerAddress] = useState([]);
//   const [headerss, setHeaderss] = useState(null);

//   const [total, setTotal] = useState({
//     total: 0,
//     grandtotal: 0,
//     totals: 0,
//     discounttotals: 0
//   });
//   const [isImageWorking, setIsImageWorking] = useState(true);
//   const handleImageErrors = () => {
//     setIsImageWorking(false);
//   };
//   // const [discount, setDiscount] = useState(0);
//   // const [taxes, setTaxes] = useState([]);
//   const [pnm, setPnm] = useState(atob(printName).toLowerCase());
//   const [totalpcsss, setTotalPcsss] = useState(0);
//   const toWords = new ToWords();
//   const [discount, setDiscount] = useState(0);
//   const [taxes, setTaxes] = useState([]);
//   const [mainDatas, setMainDatas] = useState({});

//   const [mainData, setMainData] = useState({
//     resultArr: [],
//     findings: [],
//     diamonds: [],
//     colorStones: [],
//     miscs: [],
//     otherCharges: [],
//     misc2: [],
//     labour: {},
//     labours: [],
//     diamondHandling: 0,
//     secondaryMetal: [],
//     fullnfinaltotal: 0,
//   });

//   const [totalss, setTotalss] = useState({
//     total: 0,
//     discount: 0,
//     totalPcs: 0,
//     SettingAmount: 0,
//   });


//   const loadData = (data) => {
//     let head = HeaderComponent("1", data?.BillPrint_Json[0]);
//     setHeader(head);
//     let headersss = HeaderComponent("3", data?.BillPrint_Json[0]);
//     setHeaderss(headersss);
//     setHeaderData(data?.BillPrint_Json[0]);
//     let footers = FooterComponent("2", data?.BillPrint_Json[0]);
//     setFooter(footers);
//     let custAddress = data?.BillPrint_Json[0]?.Printlable.split("\n");
//     setCustomerAddress(custAddress);

//     let datas = OrganizeDataPrint(data?.BillPrint_Json[0], data?.BillPrint_Json1, data?.BillPrint_Json2);
//     setTaxes(datas?.allTaxes);
//     setMainDatas(datas)
//     let resultArr = [];
//     let findings = [];
//     let diamonds = [];
//     let colorStones = [];
//     let misc2 = [];
//     let labour = { label: "LABOUR", primaryWt: 0, makingAmount: 0, totalAmount: 0 };
//     let labours = [];
//     let miscs = [];
//     let otherCharges = [];
//     let secondaryMetal = [];
//     let total2 = { ...totalss };
//     let diamondTotal = 0;
//     let colorStone1Total1 = 0;
//     let colorStone2Total2 = 0;
//     let misc1Total1 = 0;
//     let misc2Total2 = 0;
//     let diamondHandling = 0;
//     let totalPcss = [];
//     let jobWiseLabourCalc = 0;
//     let jobWiseMinusFindigWt = 0;
//     let SettingAmount = datas?.mainTotal?.diamonds?.SettingAmount + datas?.mainTotal?.colorstone?.SettingAmount;
//     let fullnfinaltotal = 0;

//     let pcsCounts = []
//     datas?.resultArray?.map((e, i) => {
//       let findGroups = pcsCounts?.findIndex((ele, ind) => ele?.GroupJob === e?.GroupJob);
//       if (findGroups === -1) {
//         pcsCounts?.push({ GroupJob: e?.GroupJob, count: 1 });
//       } else {
//         if (pcsCounts[findGroups].GroupJob === "") {
//           pcsCounts[findGroups].count += 1;
//         }
//       }
//       let obj = cloneDeep(e);
//       let findingWt = 0;
//       let findingsWt = 0;
//       let findingsAmount = 0;
//       let secondaryMetalAmount = 0;
//       let findLabour = labours?.findIndex((ele, ind) => ele?.MaKingCharge_Unit === e?.MaKingCharge_Unit);
//       if (findLabour === -1) {
//         labours?.push({ label: "LABOUR", MaKingCharge_Unit: e?.MaKingCharge_Unit, MakingAmount: e?.MakingAmount });
//       } else {
//         labours[findLabour].MakingAmount += e?.MakingAmount
//       }
//       total2.total += e?.TotalCsSetcost + e?.TotalDiaSetcost
//       obj.primaryMetal = e?.metal?.find((ele, ind) => ele?.IsPrimaryMetal === 1);
//       e?.finding?.forEach((ele, ind) => {
//         // if (ele?.ShapeName !== obj?.primaryMetal?.ShapeName && ele?.QualityName !== obj?.primaryMetal?.QualityName) {
//         let obb = cloneDeep(ele);
//         if (obj?.primaryMetal) {
//           obb.Rate = obj?.primaryMetal?.Rate;
//           obb.Amount = (ele?.Wt * obb?.Rate);
//           findingsAmount += (ele?.Wt * obb?.Rate);
//         }
//         obb.count = 1;
//         findingsWt += ele?.Wt;
//         let findFinding = findings?.findIndex((elem, index) => elem?.ShapeName === ele?.ShapeName && elem?.QualityName === ele?.QualityName);
//         if (findFinding === -1) {
//           findings?.push(obb);
//         } else {
//           findings[findFinding].Wt += ele?.Wt;
//           findings[findFinding].Pcs += ele?.Pcs;
//           findings[findFinding].Rate = findings[findFinding].Rate + obb?.Rate;
//           findings[findFinding].Amount += obb?.Amount;
//           findings[findFinding].count += 1;
//         }

//         total2.total += (obb?.Amount);
//         // }
//         if (ele?.Supplier?.toLowerCase() === "customer") {
//           findingWt += ele?.Wt
//         }
//       });
//       let secondaryWt = 0;
//       e?.metal?.forEach((ele, ind) => {
//         if (ele?.IsPrimaryMetal !== 1) {
//           let findSecondary = secondaryMetal?.findIndex((elem, index) => elem?.ShapeName === ele?.ShapeName && elem?.QualityName === ele?.QualityName && elem?.Rate === ele?.Rate);
//           if (findSecondary === -1) {
//             secondaryMetal?.push(ele)
//           } else {
//             secondaryMetal[findSecondary].Wt += ele?.Wt;
//             secondaryMetal[findSecondary].Pcs += ele?.Pcs;
//             secondaryMetal[findSecondary].Amount += ele?.Amount;
//           }
//           secondaryWt += ele?.Wt;
//         }
//       })

//       let findPcss = totalPcss?.findIndex((ele, ind) => ele?.GroupJob === e?.GroupJob);
//       if (findPcss === -1) {
//         totalPcss?.push({ GroupJob: e?.GroupJob, value: e?.Quantity });
//       } else {
//         if (e?.GroupJob === "") {
//           let findQuantity = totalPcss?.findIndex((ele, ind) => ele?.GroupJob === '');
//           if (findQuantity === -1) {
//             totalPcss?.push({ GroupJob: e?.GroupJob, value: e?.Quantity });
//           } else {
//             totalPcss[findQuantity].value += e?.Quantity;
//           }
//         }
//       }

//       let primaryWt = 0;
//       let count = 0;
//       let netWtFinal = e?.NetWt + e?.LossWt - findingsWt;

//       diamondHandling += e?.TotalDiamondHandling;
//       let primaryMetalRAte = 0;
//       e?.metal?.forEach((ele, ind) => {
//         count += 1;
//         if (ele?.IsPrimaryMetal === 1) {
//           primaryWt += ele?.Wt;
//           if (primaryMetalRAte === 0) {
//             primaryMetalRAte += ele?.Rate;
//           }
//         } else {
//           secondaryMetalAmount += ele?.Amount;
//         }
//       });
//       primaryWt = primaryWt - findingsWt
//       let latestAmount = (((e?.MetalDiaWt - findingsWt) * primaryMetalRAte));
//       fullnfinaltotal += latestAmount;
//       total2.total += latestAmount;
//       labour.makingAmount += e?.MakingAmount;
//       labour.totalAmount += e?.MakingAmount + e?.TotalDiaSetcost + e?.TotalCsSetcost;
//       total2.discount += e?.DiscountAmt;
//       obj.primaryWt = primaryWt;
//       obj.netWtFinal = netWtFinal;
//       obj.latestAmount = latestAmount;
//       obj.metalAmountFinal = e?.MetalAmount - findingsAmount + secondaryMetalAmount;
//       if (count <= 1) {
//         primaryWt = e?.NetWt + e?.LossWt;
//       }
//       if (obj?.primaryMetal) {
//         // total2.total += obj?.metalAmountFinal;
//         let findRecord = resultArr?.findIndex((ele, ind) => ele?.primaryMetal?.ShapeName === obj?.primaryMetal?.ShapeName && ele?.primaryMetal?.QualityName === obj?.primaryMetal?.QualityName && ele?.primaryMetal?.Rate === obj?.primaryMetal?.Rate);
//         if (findRecord === -1) {
//           resultArr?.push(obj);
//         } else {
//           resultArr[findRecord].grosswt += obj?.grosswt;
//           resultArr[findRecord].NetWt += obj?.NetWt;
//           resultArr[findRecord].LossWt += obj?.LossWt;
//           resultArr[findRecord].primaryWt += obj?.primaryWt;
//           resultArr[findRecord].primaryMetal.Pcs += obj?.primaryMetal.Pcs;
//           resultArr[findRecord].primaryMetal.Wt += obj?.primaryMetal.Wt;
//           resultArr[findRecord].primaryMetal.Amount += obj?.primaryMetal.Amount;
//           resultArr[findRecord].netWtFinal += obj?.netWtFinal;
//           resultArr[findRecord].metalAmountFinal += obj?.metalAmountFinal;
//           resultArr[findRecord].latestAmount += latestAmount;
//         }
//       }

//       jobWiseLabourCalc += ((e?.MetalDiaWt - findingWt) * e?.MaKingCharge_Unit);
//       jobWiseMinusFindigWt += (e?.MetalDiaWt - findingWt);

//       e?.diamonds?.forEach((ele, ind) => {
//         let findDiamond = diamonds?.findIndex((elem, index) => elem?.isRateOnPcs === ele?.isRateOnPcs);
//         diamondTotal += (ele?.Amount);
//         if (findDiamond === -1) {
//           diamonds?.push(ele);
//         } else {
//           diamonds[findDiamond].Wt += ele?.Wt;
//           diamonds[findDiamond].Pcs += ele?.Pcs;
//           diamonds[findDiamond].Amount += (ele?.Amount);
//         }
//       });

//       e?.colorstone?.forEach((ele, ind) => {
//         // total2.total += (ele?.Amount );
//         let findColorStones = colorStones?.findIndex((elem, index) => elem?.isRateOnPcs === ele?.isRateOnPcs);
//         if (findColorStones === -1) {
//           colorStones?.push(ele);
//         } else {
//           colorStones[findColorStones].Wt += ele?.Wt;
//           colorStones[findColorStones].Pcs += ele?.Pcs;
//           colorStones[findColorStones].Amount += (ele?.Amount);
//         }
//         if (ele?.isRateOnPcs === 0) {
//           colorStone1Total1 += ele?.Amount
//         } else {
//           colorStone2Total2 += ele?.Amount
//         }
//       });

//       e?.misc?.forEach((ele, ind) => {
//         if (ele?.isRateOnPcs === 0) {
//           misc1Total1 += ele?.Amount;
//         } else {
//           misc2Total2 += ele?.Amount;
//         }
//         if (ele?.IsHSCOE !== 0) {
//           let findMisc = miscs?.findIndex((elem, index) => elem?.ShapeName === ele?.ShapeName);
//           if (findMisc === -1) {
//             miscs?.push(ele);
//           } else {
//             miscs[findMisc].Wt += ele?.Wt
//             miscs[findMisc].Pcs += ele?.Pcs
//             miscs[findMisc].Amount += (ele?.Amount)
//           }
//           // total2.total += (ele?.Amount);
//         }
//         else if (ele?.IsHSCOE === 0) {
//           // total2.total += ele?.Amount;
//           let findMisc = misc2?.findIndex((elem, index) => elem?.isRateOnPcs === ele?.isRateOnPcs);
//           if (findMisc === -1) {
//             misc2?.push(ele);
//           } else {
//             misc2[findMisc].Wt += ele?.Wt;
//             misc2[findMisc].Pcs += ele?.Pcs;
//             misc2[findMisc].Amount += (ele?.Amount);
//           }

//         }
//       });

//       e?.other_details?.forEach((ele, ind) => {
//         let findOther = otherCharges?.findIndex((elem, index) => elem?.label === ele?.label);
//         total2.total += (+ele?.value);
//         if (findOther === -1) {
//           otherCharges?.push(ele);
//         } else {
//           otherCharges[findOther].value = +otherCharges[findOther]?.value + +ele?.value;
//         }
//       });

//     });
//     setTotalPcsss(pcsCounts?.reduce((acc, cObj) => acc + cObj?.count, 0))
//     findings?.forEach((ele, ind) => {
//       ele.Rate = ele?.Amount / ele?.Wt;
//       fullnfinaltotal += ele?.Amount;
//     });
//     secondaryMetal?.forEach((ele, ind) => {
//       fullnfinaltotal += ele?.Amount;
//     });
//     diamonds?.forEach((ele, ind) => {
//       fullnfinaltotal += ele?.Amount;
//     });
//     colorStones?.forEach((ele, ind) => {
//       fullnfinaltotal += ele?.Amount;
//     });
//     misc2?.forEach((ele, ind) => {
//       fullnfinaltotal += ele?.Amount;
//     });
//     labours?.forEach((ele, ind) => {
//       fullnfinaltotal += ele?.MakingAmount;
//     });
//     miscs?.forEach((ele, ind) => {
//       fullnfinaltotal += ele?.Amount;
//     });
//     fullnfinaltotal += diamondHandling + SettingAmount;
//     otherCharges?.forEach((ele, ind) => {
//       fullnfinaltotal += +ele?.value;
//     });

//     let totalPcs = totalPcss?.reduce((acc, cObj) => acc + cObj?.value, 0);
//     total2.total += (diamondTotal / data?.BillPrint_Json[0]?.CurrencyExchRate) + (colorStone1Total1 / data?.BillPrint_Json[0]?.CurrencyExchRate) +
//       (colorStone2Total2 / data?.BillPrint_Json[0]?.CurrencyExchRate) + (misc1Total1 / data?.BillPrint_Json[0]?.CurrencyExchRate) +
//       (misc2Total2 / data?.BillPrint_Json[0]?.CurrencyExchRate) + labours?.reduce((acc, cObj) => acc + cObj?.MakingAmount, 0) + diamondHandling + SettingAmount;

//     labour.primaryWt = jobWiseMinusFindigWt;
//     resultArr.sort((a, b) => {
//       const labelA = a.MetalTypePurity.toLowerCase();
//       const labelB = b.MetalTypePurity.toLowerCase();

//       const hasNumberA = /\d/.test(labelA);
//       const hasNumberB = /\d/.test(labelB);

//       if (hasNumberA && !hasNumberB) {
//         return -1; // Label with number comes before label without number
//       } else if (!hasNumberA && hasNumberB) {
//         return 1; // Label without number comes after label with number
//       } else {
//         // Both labels have numbers or both don't, sort alphabetically
//         return labelA.localeCompare(labelB);
//       }
//     });
//     setTotalss({ ...totalss, total: total2?.total, discount: total2?.discount, totalPcs: totalPcs, SettingAmount: SettingAmount, });
//     setMainData({
//       ...mainData, resultArr: resultArr, findings: findings, diamonds: diamonds, colorStones: colorStones,
//       miscs: miscs, otherCharges: otherCharges, misc2: misc2, labour: labour, diamondHandling: diamondHandling, secondaryMetal: secondaryMetal, labours: labours, fullnfinaltotal: fullnfinaltotal
//     });
//   };

//   useEffect(() => {
//     const sendData = async () => {
//       try {
//         const data = await apiCall(token, invoiceNo, printName, urls, evn, ApiVer);
//         if (data?.Status === "200") {
//           let isEmpty = isObjectEmpty(data?.Data);
//           if (!isEmpty) {
//             loadData(data?.Data);
//             setLoader(false);
//           } else {
//             setLoader(false);
//             setMsg("Data Not Found");
//           }
//         } else {
//           setLoader(false);
//           // setMsg(data?.Message);
//           const err = checkMsg(data?.Message);
//                     console.log(data?.Message);
//                     setMsg(err);
//         }
//       } catch (error) {
//         console.error(error);
//       }
//     };
//     sendData();
//   }, []);

//   return loader ? (
//     <Loader />
//   ) : msg === "" ? (
//     <div
//       className={`container container-fluid mt-1 ${style?.InvoicePrint_10_11} ${style?.max_width_invp1011} pad_60_allPrint`}
//     >
//       {/* buttons */}
//       <div
//         className={`d-flex justify-content-end align-items-center ${style?.print_sec_sum4} mb-4`}
//       >
//         <div className={`form-check ps-3 ${style?.printBtn}`}>
//           <input
//             type="button"
//             className="btn_white blue py-2 mt-2"
//             value="Print"
//             onClick={(e) => handlePrint(e)}
//           />
//         </div>
//       </div>
//       {/* header */}
//       {headerData?.IsEinvoice !== 1 ?
//         <><div className={` ${style?.headerTitle}`}>{headerData?.PrintHeadLabel}</div>
//           <div className={`${style2.companyDetails} ${style?.head_line_invp1011} `}>
//             <div className={`${style2.companyhead} p-2 ${style?.head_line_invp1011}`}>
//               <div style={{ fontWeight: "bold" }} className={style?.companyFUllnameInvp11}>
//                 {headerData?.CompanyFullName}
//               </div>
//               <div>{headerData?.CompanyAddress}</div>
//               <div>{headerData?.CompanyAddress2}</div>
//               <div>{headerData?.CompanyCity}-{headerData?.CompanyPinCode},{headerData?.CompanyState}({headerData?.CompanyCountry})</div>
//               {/* <div>Tell No: {headerData?.CompanyTellNo}</div> */}
//               <div>T:  {headerData?.CompanyTellNo} | TOLL FREE {headerData?.CompanyTollFreeNo} | TOLL FREE {headerData?.CompanyTollFreeNo}</div>
//               <div>
//                 {headerData?.CompanyEmail} | {headerData?.CompanyWebsite}
//               </div>
//               <div>
//                 {/* {headerData?.Company_VAT_GST_No} | {headerData?.Company_CST_STATE}-{headerData?.Company_CST_STATE_No} | PAN-{headerData?.Pannumber} */}
//                 {headerData?.Company_VAT_GST_No} | {headerData?.Company_CST_STATE}-{headerData?.Company_CST_STATE_No} | PAN-{headerData?.Pannumber}
//               </div>
//               <div>{headerData?.MSME === '' ? '' : 'MSME - ' } {headerData?.MSME} </div>
//             </div>
//             <div style={{ width: "30%" }} className="d-flex justify-content-end align-item-center h-100">
//               {isImageWorking && (headerData?.PrintLogo !== "" &&
//                 <img src={headerData?.PrintLogo} alt=""
//                   className='w-100 h-auto ms-auto d-block object-fit-contain'
//                   style={{ maxWidth: '97px' }}
//                   onError={handleImageErrors} height={120} width={150} />)}
//               {/* <img src={headerData?.PrintLogo} alt="" className={style2.headerImg} /> */}
//             </div>
//           </div></> : headerss}
//       {/* barcodes */}
//       {pnm === "invoice print 10" && <div className="mb-1">
//         <div className="d-flex justify-content-between border p-2 pb-1">
//           <div className={`${style?.barcode}`}>
//             <BarcodePrintGenerator data={headerData?.VenCode} />
//             <p className="fw-bold text-center">{headerData?.VenCode}</p>
//           </div>
//           <div className={`${style?.barcode}`}>
//             <BarcodePrintGenerator data={headerData?.InvoiceNo} />
//             <p className="fw-bold text-center">{headerData?.InvoiceNo}</p>
//           </div>
//         </div>
//       </div>}

//       <div className="border d-flex">
//         <div className="col-4 px-2 border-end">
//           <p>{headerData?.lblBillTo}</p>
//           <p className="fw-bold pe-2">{headerData?.customerfirmname}</p>
//           <p>{headerData?.customerAddress1}</p>
//           <p>{headerData?.customerAddress2}</p>
//           <p>
//             {headerData?.customercity1} - {" "}
//             {headerData?.PinCode}
//           </p>
//           <p>{headerData?.customeremail1}</p>
//           <p>{headerData?.vat_cst_pan}</p>
//           <p>
//             {headerData?.Cust_CST_STATE}-{headerData?.Cust_CST_STATE_No}
//           </p>
//         </div>
//         <div className="col-4 px-2 border-end">
//           <p>Ship To,</p>
//           <p className="fw-bold">{headerData?.customerfirmname}</p>
//           {customerAddress.map((e, i) => {
//             return <p key={i}>{e}</p>;
//           })}
//         </div>
//         <div className="col-4 px-2">
//           <div className="d-flex">
//             <div className="fw-bold col-6">BILL NO</div>
//             <div className="col-6">{headerData?.InvoiceNo} </div>
//           </div>
//           <div className="d-flex">
//             <div className="fw-bold col-6">DATE</div>
//             <div className="col-6">{headerData?.EntryDate} </div>
//           </div>
//           <div className="d-flex">
//             <div className="fw-bold col-6">{headerData?.HSN_No_Label}</div>
//             <div className="col-6">{headerData?.HSN_No} </div>
//           </div>
//           <div className="d-flex">
//             <div className="fw-bold col-6">NAME OF GOODS</div>
//             <div className="col-6">{headerData?.NameOfGoods} </div>
//           </div>
//           <div className="d-flex">
//             <div className="fw-bold col-6">PLACE OF SUPPLY</div>
//             <div className="col-6">{headerData?.customerstate} </div>
//           </div>
//           <div className="d-flex">
//             <div className="fw-bold col-6">TERMS</div>
//             <div className="col-6">{headerData?.DueDays} </div>
//           </div>
//         </div>
//       </div>

//       <div className="my-1">
//         <div className="d-flex border">
//           <div className="col-3 border-end">
//             <p className="text-center fw-bold border-bottom">DESCRIPTION</p>
//           </div>
//           <div className="col-9">
//             <div className="d-flex border-bottom">
//               <div style={{ minWidth: "17%", width: "17%" }} className="fw-bold px-1">Detail</div>
//               <div style={{ minWidth: "14.5%", width: "14.5%" }} className="fw-bold px-1 text-end">Gross Wt. </div>
//               <div style={{ minWidth: "14.5%", width: "14.5%" }} className="fw-bold px-1 text-end">Net Wt. </div>
//               <div style={{ minWidth: "7%", width: "7%" }} className="fw-bold px-1 text-end">Pcs </div>
//               <div style={{ minWidth: "15%", width: "15%" }} className="fw-bold px-1 text-end">Qty </div>
//               <div style={{ minWidth: "17%", width: "17%" }} className="fw-bold px-1 text-end">Rate </div>
//               <div style={{ minWidth: "15%", width: "15%" }} className="fw-bold px-1 text-end">Amount</div>
//             </div>
//           </div>
//         </div>
//         <div className="d-flex border-start border-end border-bottom">
//           <div className="col-3 border-end d-flex align-items-center justify-content-center flex-column">
//             <p className="w-100 text-center">DIAMOND STUDDED JEWELLERY</p>
//             <p className="fw-bold">Total Pcs : {NumberWithCommas(totalpcsss, 0)}</p>
//           </div>
//           <div className="col-9">
//             {mainData?.resultArr?.map((e, i) => {
//               return <div className="d-flex" key={i}>
//                 <div style={{ minWidth: "17%", width: "17%" }} className=" px-1"><p className="line_height_ivp11">{e?.primaryMetal?.ShapeName} {e?.primaryMetal?.QualityName}</p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.grosswt, 3)} Gms</p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.primaryWt, 3)} Gms</p></div>
//                 <div style={{ minWidth: "7%", width: "7%" }} className=" px-1"><p></p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className=" px-1"><p></p></div>
//                 <div style={{ minWidth: "17%", width: "17%" }} className=" px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.primaryMetal?.Rate, 2)}</p></div>
//                 {/* <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p>{NumberWithCommas(e?.primaryWt * e?.primaryMetal?.Rate, 2)}</p></div> */}
//                 <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.latestAmount, 2)}</p></div>
//               </div>
//             })}
//             {mainData?.findings?.map((e, i) => {
//               return <div className="d-flex" key={i}>
//                 <div style={{ minWidth: "17%", width: "17%" }} className="px-1"><p className="line_height_ivp11">{e?.ShapeName} {e?.QualityName}</p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.Wt, 3)} Gms</p></div>
//                 <div style={{ minWidth: "7%", width: "7%" }} className="px-1"><p></p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className="px-1"><p></p></div>
//                 <div style={{ minWidth: "17%", width: "17%" }} className="px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.Rate, 2)}</p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.Amount, 2)}</p></div>
//               </div>
//             })}
//             {mainData?.secondaryMetal?.map((e, i) => {
//               return <div className="d-flex" key={i}>
//                 <div style={{ minWidth: "17%", width: "17%" }} className="px-1"><p className="line_height_ivp11">{e?.ShapeName} {e?.QualityName}</p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.Wt, 3)} Gms</p></div>
//                 <div style={{ minWidth: "7%", width: "7%" }} className="px-1"><p></p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className="px-1"><p></p></div>
//                 <div style={{ minWidth: "17%", width: "17%" }} className="px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.Rate, 2)}</p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.Amount, 2)}</p></div>
//               </div>
//             })}
//             {mainData?.diamonds?.map((e, i) => {
//               return <div className="d-flex" key={i}>
//                 <div style={{ minWidth: "17%", width: "17%" }} className="px-1"><p className="line_height_ivp11">{e?.MasterManagement_DiamondStoneTypeName}</p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "7%", width: "7%" }} className="px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.Pcs, 0)}</p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.Wt, 3)} Ctw</p></div>
//                 <div style={{ minWidth: "17%", width: "17%" }} className="px-1 text-end"><p className="line_height_ivp11">{(e?.isRateOnPcs === 0 ? (e?.Wt !== 0 && <>{NumberWithCommas(e?.Amount / e?.Wt, 2)} / Wt</>) : (e?.Pcs !== 0 && <>{NumberWithCommas(e?.Amount / e?.Pcs, 2)} / Pcs</>))}</p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.Amount, 2)}</p></div>
//               </div>
//             })}
//             {mainData?.colorStones?.map((e, i) => {
//               return <div className="d-flex" key={i}>
//                 <div style={{ minWidth: "17%", width: "17%" }} className=" px-1"><p className="line_height_ivp11">{e?.MasterManagement_DiamondStoneTypeName}</p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "7%", width: "7%" }} className=" px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.Pcs, 0)}</p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.Wt, 3)} Ctw</p></div>
//                 <div style={{ minWidth: "17%", width: "17%" }} className=" px-1 text-end"><p className="line_height_ivp11">{(e?.isRateOnPcs === 0 ? (e?.Wt !== 0 && <>{NumberWithCommas(e?.Amount / e?.Wt, 2)} / Wt</>) : (e?.Pcs !== 0 && <>{NumberWithCommas(e?.Amount / e?.Pcs, 2)} / Pcs</>))}</p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.Amount, 2)}</p></div>
//               </div>
//             })}
//             {mainData?.misc2?.map((e, i) => {
//               return <div className="d-flex" key={i}>
//                 <div style={{ minWidth: "17%", width: "17%" }} className="px-1"><p className="line_height_ivp11">OTHER MATERIAL</p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "7%", width: "7%" }} className="px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.Pcs, 0)}</p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.Wt, 3)} Gms</p></div>
//                 <div style={{ minWidth: "17%", width: "17%" }} className="px-1 text-end"><p className="line_height_ivp11">{(e?.isRateOnPcs === 0 ? (e?.Wt !== 0 && <>{NumberWithCommas(e?.Amount / e?.Wt, 2)} / Wt</>) : (e?.Pcs !== 0 && <>{NumberWithCommas(e?.Amount / e?.Pcs, 2)} / Pcs</>))}</p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.Amount, 2)}</p></div>
//               </div>
//             })}
//             {mainData?.labours?.map((ele, ind) => {
//               return <div className="d-flex" key={ind}>
//                 <div style={{ minWidth: "17%", width: "17%" }} className="px-1"><p className="line_height_ivp11">{ele?.label}</p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "7%", width: "7%" }} className="px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "17%", width: "17%" }} className="px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(ele?.MaKingCharge_Unit, 2)}</p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(ele?.MakingAmount, 2)}</p></div>
//               </div>
//             })}
//             {mainData?.miscs?.map((e, i) => {
//               return <div className="d-flex" key={i}>
//                 <div style={{ minWidth: "17%", width: "17%" }} className="px-1"><p className="line_height_ivp11">{e?.ShapeName}</p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className="px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "7%", width: "7%" }} className="px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "17%", width: "17%" }} className="px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className="px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(e?.Amount / headerData?.CurrencyExchRate, 2)}</p></div>
//               </div>
//             })}
//             {mainDatas?.mainTotal?.total_diamondHandling !== 0 && <div className="d-flex">
//               <div style={{ minWidth: "17%", width: "17%" }} className=" px-1"><p className="line_height_ivp11">HANDLING</p></div>
//               <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p></p></div>
//               <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p></p></div>
//               <div style={{ minWidth: "7%", width: "7%" }} className=" px-1 text-end"><p></p></div>
//               <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p></p></div>
//               <div style={{ minWidth: "17%", width: "17%" }} className=" px-1 text-end"><p></p></div>
//               <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(mainDatas?.mainTotal?.total_diamondHandling, 2)}</p></div>
//             </div>}
//             {mainData?.otherCharges?.map((e, i) => {
//               return <div className="d-flex" key={i}>
//                 <div style={{ minWidth: "17%", width: "17%" }} className=" px-1"><p className="line_height_ivp11">{e?.label}</p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "7%", width: "7%" }} className=" px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "17%", width: "17%" }} className=" px-1 text-end"><p></p></div>
//                 <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(+e?.value, 2)}</p></div>
//               </div>
//             })}
//             {totalss?.SettingAmount !== 0 && <div className="d-flex">
//               <div style={{ minWidth: "17%", width: "17%" }} className=" px-1"><p className="line_height_ivp11">SETTING</p></div>
//               <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p></p></div>
//               <div style={{ minWidth: "14.5%", width: "14.5%" }} className=" px-1 text-end"><p></p></div>
//               <div style={{ minWidth: "7%", width: "7%" }} className=" px-1 text-end"><p></p></div>
//               <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p></p></div>
//               <div style={{ minWidth: "17%", width: "17%" }} className=" px-1 text-end"><p></p></div>
//               <div style={{ minWidth: "15%", width: "15%" }} className=" px-1 text-end"><p className="line_height_ivp11">{NumberWithCommas(totalss?.SettingAmount, 2)}</p></div>
//             </div>}
//           </div>
//         </div>
//         {/* total */}
//         <div className={`d-flex border-start border-end border-bottom mb-1 no_break ${style?.font_15}`}>
//           <div className="col-3 border-end d-flex align-items-center justify-content-center flex-column"></div>
//           <div className="col-9">
//             <div className="d-flex border-bottom">
//               <div className="col-2 px-1">
//                 <p className={`${style?.min_height_21} fw-bold`}>Total</p>
//               </div>
//               <div className="col-2 px-1">
//                 <p className={`${style?.min_height_21} text-end`}></p>
//               </div>
//               <div className="col-2 px-1">
//                 <p className={`${style?.min_height_21} text-end`}></p>
//               </div>
//               <div className="col-1 px-1">
//                 <p className={`${style?.min_height_21} text-end`}></p>
//               </div>

//               <div className="col-1 px-1">
//                 <p className={`${style?.min_height_21} text-end`}></p>
//               </div>
//               <div className="col-2 px-1">
//                 <p className={`${style?.min_height_21} text-end`}></p>
//               </div>
//               <div className="col-2 px-1">
//                 <p className={`${style?.min_height_21} text-end fw-bold`}>
//                   {NumberWithCommas(mainData?.fullnfinaltotal, 2)}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//         {/* taxes */}
//         <div className="d-flex border no_break">
//           <div className="col-8 border-end"></div>
//           <div className="col-4 px-1">
//             {mainDatas?.mainTotal?.total_discount_amount !== 0 && <><div className="d-flex justify-content-between">
//               <p>
//                 Discount
//               </p>
//               <p>{NumberWithCommas(mainDatas?.mainTotal?.total_discount_amount, 2)}</p>
//             </div>
//               <div className="d-flex justify-content-between">
//                 <p className="fw-bold"> Total Amount </p>
//                 <p className="fw-bold"> {NumberWithCommas(((mainDatas?.mainTotal?.total_amount + headerData?.FreightCharges) / headerData?.CurrencyExchRate), 2)}</p>
//               </div></>
//             }
//             {taxes?.map((e, i) => {
//               return (
//                 <div className="d-flex justify-content-between" key={i}>
//                   <p>
//                     {e?.name} @ {e?.per}
//                   </p>
//                   <p>{NumberWithCommas(e?.amount, 2)}</p>
//                 </div>
//               );
//             })}
//             {headerData?.AddLess !== 0 && (
//               <div className="d-flex justify-content-between">
//                 <p>{headerData?.AddLess > 0 ? "Add" : "Less"}</p>
//                 <p>{NumberWithCommas(headerData?.AddLess / headerData?.CurrencyExchRate, 2)}</p>
//               </div>
//             )}
//           </div>
//         </div>
//         <div className="d-flex border-start border-end border-bottom no_break">
//           <div className="col-8 border-end px-1">
//             <p className="fw-bold"> IN Words Indian Rupees</p>
//             <p className="fw-bold">
//               {toWords.convert(+fixedValues(+fixedValues((mainDatas?.mainTotal?.total_amount + headerData?.FreightCharges) / headerData?.CurrencyExchRate, 2) +
//                 (+fixedValues(headerData?.AddLess / headerData?.CurrencyExchRate, 2) +
//                   mainDatas?.allTaxes?.reduce((acc, cObj) => acc + (+fixedValues(+cObj?.amount, 2)), 0)), 2))} Only.
//             </p>
//           </div>
//           <div className="col-4 px-1 d-flex justify-content-between align-items-center">
//             <p className="text-end fw-bold">Grand Total </p>
//             <p className="text-end fw-bold">
//               {NumberWithCommas(+fixedValues((mainDatas?.mainTotal?.total_amount + headerData?.FreightCharges) / headerData?.CurrencyExchRate, 2) +
//                 (+fixedValues(headerData?.AddLess / headerData?.CurrencyExchRate, 2) +
//                   mainDatas?.allTaxes?.reduce((acc, cObj) => acc + (+fixedValues(+cObj?.amount, 2)), 0)), 2)}
//             </p>
//           </div>
//         </div>
//         <div
//           className={`border-start border-end border-bottom p-1 no_break ${style?.delinvp11}`}
//           dangerouslySetInnerHTML={{ __html: headerData?.Declaration }}
//         ></div>
//         <p className="p-1 no_break">
//           <span className="fw-bold"> REMARKS :</span> <span dangerouslySetInnerHTML={{ __html: headerData?.PrintRemark }}></span> 
//         </p>
//         {/* {footer} */}
//         <div className={`${footerStyle.container} no_break`}>
//           <div
//             className={footerStyle.block1f3}
//             style={{ width: "33.33%", borderRight: "1px solid #e8e8e8" }}
//           >
//             <div className={} style={{ fontWeight: "bold" }}>Bank Detail</div>
//             <div className={footerStyle.linesf3}>Bank Name: {headerData?.bankname}</div>
//             <div className={footerStyle.linesf3}>Branch: {headerData?.bankaddress}</div>
//             <div className={footerStyle.linesf3}>Account Name: {headerData?.accountname}</div>
//             <div className={footerStyle.linesf3}>Account No. : {headerData?.accountnumber}</div>
//             <div className={footerStyle.linesf3}>RTGS/NEFT IFSC: {headerData?.rtgs_neft_ifsc}</div>
//             <div className={footerStyle.linesf3}>Enquiry No. </div>
//             <div className={footerStyle.linesf3}> (E & OE)</div>
//           </div>
//           <div
//             className={footerStyle.block2f3}
//             style={{ width: "33.33%", borderRight: "1px solid #e8e8e8" }}
//           >
//             <div className={`${footerStyle.linesf3} fw-normal`}>Signature</div>
//             <div className={footerStyle.linesf3}>{headerData?.customerfirmname}</div>
//           </div>
//           <div className={footerStyle.block2f3} style={{ width: "33.33%" }}>
//             <div className={`${footerStyle.linesf3} fw-normal`}>Signature</div>
//             <div className={footerStyle.linesf3}>{headerData?.CompanyFullName}</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   ) : (
//     <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
//       {msg}
//     </p>
//   );
// };

// export default InvoicePrint_10_11;
