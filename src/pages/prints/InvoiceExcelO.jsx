// http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=SlMvODM2LzI1LTI2&evn=c2FsZQ==&pnm=SW52b2ljZSBFeGNlbCBP&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=PackingList3&pid=undefined&etp=ZXhjZWw=
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import "../../assets/css/prints/InvoiceExcelO.css";
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { apiCall, checkMsg, fixedValues, formatAmount, handleImageError, isObjectEmpty, NumberWithCommas } from '../../GlobalFunctions';
import Loader from '../../components/Loader';
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import { MetalShapeNameWiseArr } from '../../GlobalFunctions/MetalShapeNameWiseArr';

const InvoiceExcelO = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
    const [result, setResult] = useState(null);
    const [loader, setLoader] = useState(true);
    const [msg, setMsg] = useState("");
    const [diamondWise, setDiamondWise] = useState([]);
    const [MetShpWise, setMetShpWise] = useState([]);
    const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
    const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);
    const [isImageWorking, setIsImageWorking] = useState(true);
    const handleImageErrors = () => {
        setIsImageWorking(false);
    };

  useEffect(() => {
      const sendData = async () => {
        try {
          const data = await apiCall(
            token,
            invoiceNo,
            printName,
            urls,
            evn,
            ApiVer
          );
  
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
  
    function loadData(data) {
      let address = data?.BillPrint_Json[0]?.Printlable?.split("\r\n");
      data.BillPrint_Json[0].address = address;
  
      const datas = OrganizeDataPrint(
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
      });
      setNotGoldMetalTotal(tot_met);
      setNotGoldMetalWtTotal(tot_met_wt);
  
      let diaObj = {
        ShapeName: "OTHERS",
        wtWt: 0,
        wtWts: 0,
        pcPcs: 0,
        pcPcss: 0,
        rRate: 0,
        rRates: 0,
        amtAmount: 0,
        amtAmounts: 0,
      };
  
      let diaonlyrndarr1 = [];
      let diaonlyrndarr2 = [];
      let diaonlyrndarr3 = [];
      let diaonlyrndarr4 = [];
      let diarndotherarr5 = [];
      let diaonlyrndarr6 = [];
      datas?.json2?.forEach((e) => {
        if (e?.MasterManagement_DiamondStoneTypeid === 1) {
          if (e.ShapeName?.toLowerCase() === "rnd") {
            diaonlyrndarr1.push(e);
          } else {
            diaonlyrndarr2.push(e);
          }
        }
      });
  
      diaonlyrndarr1.forEach((e) => {
        let findRecord = diaonlyrndarr3.findIndex(
          (a) =>
            e?.StockBarcode === a?.StockBarcode &&
            e?.ShapeName === a?.ShapeName &&
            e?.QualityName === a?.QualityName &&
            e?.Colorname === a?.Colorname
        );
  
        if (findRecord === -1) {
          let obj = { ...e };
          obj.wtWt = e?.Wt;
          obj.pcPcs = e?.Pcs;
          obj.rRate = e?.Rate;
          obj.amtAmount = e?.Amount;
          diaonlyrndarr3.push(obj);
        } else {
          diaonlyrndarr3[findRecord].wtWt += e?.Wt;
          diaonlyrndarr3[findRecord].pcPcs += e?.Pcs;
          diaonlyrndarr3[findRecord].rRate += e?.Rate;
          diaonlyrndarr3[findRecord].amtAmount += e?.Amount;
        }
      });
  
      diaonlyrndarr2.forEach((e) => {
        let findRecord = diaonlyrndarr4.findIndex(
          (a) =>
            e?.StockBarcode === a?.StockBarcode &&
            e?.ShapeName === a?.ShapeName &&
            e?.QualityName === a?.QualityName &&
            e?.Colorname === a?.Colorname
        );
  
        if (findRecord === -1) {
          let obj = { ...e };
          obj.wtWt = e?.Wt;
          obj.wtWts = e?.Wt;
          obj.pcPcs = e?.Pcs;
          obj.pcPcss = e?.Pcs;
          obj.rRate = e?.Rate;
          obj.rRates = e?.Rate;
          obj.amtAmount = e?.Amount;
          obj.amtAmounts = e?.Amount;
          diaonlyrndarr4.push(obj);
        } else {
          diaonlyrndarr4[findRecord].wtWt += e?.Wt;
          diaonlyrndarr4[findRecord].wtWts += e?.Wt;
          diaonlyrndarr4[findRecord].pcPcs += e?.Pcs;
          diaonlyrndarr4[findRecord].pcPcss += e?.Pcs;
          diaonlyrndarr4[findRecord].rRate += e?.Rate;
          diaonlyrndarr4[findRecord].rRates += e?.Rate;
          diaonlyrndarr4[findRecord].amtAmount += e?.Amount;
          diaonlyrndarr4[findRecord].amtAmounts += e?.Amount;
        }
      });
  
      diaonlyrndarr4.forEach((e) => {
        diaObj.wtWt += e?.wtWt;
        diaObj.wtWts += e?.wtWts;
        diaObj.pcPcs += e?.pcPcs;
        diaObj.pcPcss += e?.pcPcss;
        diaObj.rRate += e?.rRate;
        diaObj.rRates += e?.rRates;
        diaObj.amtAmount += e?.amtAmount;
        diaObj.amtAmounts += e?.amtAmounts;
      });
  
      diaonlyrndarr3?.forEach((e) => {
        let find_record = diaonlyrndarr6?.findIndex(
          (a) =>
            e?.ShapeName === a?.ShapeName &&
            e?.QualityName === a?.QualityName &&
            e?.Colorname === a?.Colorname
        );
        if (find_record === -1) {
          let obj = { ...e };
          obj.wtWts = e?.wtWt;
          obj.pcPcss = e?.pcPcs;
          obj.rRates = e?.rRate;
          obj.amtAmounts = e?.amtAmount;
          diaonlyrndarr6.push(obj);
        } else {
          diaonlyrndarr6[find_record].wtWts += e?.wtWt;
          diaonlyrndarr6[find_record].pcPcss += e?.pcPcs;
          diaonlyrndarr6[find_record].rRates += e?.rRate;
          diaonlyrndarr6[find_record].amtAmounts += e?.amtAmount;
        }
      });
  
      diarndotherarr5 = [...diaonlyrndarr6, diaObj];
      setDiamondWise(diarndotherarr5);
      setResult(datas);

      setTimeout(() => {
        const button = document.getElementById('test-table-xls-button');
        button.click();
      }, 500);
    }

    console.log("result", result);
    
    // Style...
    const txtTop = {
        verticalAlign: "top",
    };
    const brRight = {
        borderRight: "0.5px solid #000000",
    };
    const brBotm = {
        borderBottom: "0.5px solid #000000",
    };
    const brBotmdrk = {
        borderBottom: "1px solid #000000",
    };
    const brTop = {
        borderTop: "1px solid #000000",
    };
    const hdSty = {
        backgroundColor: "rgb(6, 80, 150)",
        color: "#FFFFFF"
    };
    const spSTy = {
        backgroundColor: "#F1F1F1",
        fontWeight: "bold",
    }
    const styBld = {
        fontWeight: "bold",
    }
    const txtCen = {
        textAlign: "center",
    }
    const spFnt = {
        color: "red"
    }
    const spbgClr = {
        backgroundColor: "yellow"
    }
    const spBgclr = {
        backgroundColor: "rgb(253, 199, 174)"
    }
    const totalGrosswt = result?.resultArray?.reduce((acc, obj) => acc + obj.grosswt, 0);
    const totalNetWt = result?.resultArray?.reduce((acc, obj) => acc + obj.NetWt, 0);
    const totalqty = result?.resultArray?.reduce((acc, obj) => acc + obj.Quantity, 0);

    return (
        <>
            {loader ? <Loader /> : msg === "" ?
                <> <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    className="download-table-xls-button btn btn-success text-black bg-success px-2 py-1 fs-5 d-none"
                    table="table-to-xls"
                    filename={`Invoice_ExcelO_${result?.header?.InvoiceNo}_${Date.now()}`}
                    sheet="tablexls"
                    buttonText="Download as XLS" />
                    <table id="table-to-xls" className='d-none' style={{fontFamily: "sans-serif"}}>
                        <tbody>
                            <tr>
                                <th width={80} style={{ ...hdSty, ...brRight, ...brBotm }}>SR NO</th>
                                <th width={80} style={{ ...hdSty, ...brRight, ...brBotm }}>DIVISION</th>
                                <th width={80} style={{ ...hdSty, ...brRight, ...brBotm }}>PCS</th>
                                <th width={120} style={{ ...hdSty, ...brRight, ...brBotm }}>IMAGES</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>BARCODE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>DESIGN CODE</th>
                                <th width={140} style={{ ...hdSty, ...brRight, ...brBotm }}>ITEM DESCRIPTION</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>METAL COLOUR</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>GOLD KARAT</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>GROSS WEIGHT</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>NET WT</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>GOLD RATE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>GOLD VALUE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>D OR C</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>STONE TYPE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>TOTAL DMD PCS</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>TOTAL Ct/GMS (DMD)</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>COLOUR</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>CLARITY</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>SHAPE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>MM SIZE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>SIEVE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>Total Dia Rate</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>TOTAL AMOUNT USD</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>Total Dia + Cs Cost</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>Total DMD ct</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>Total DMD Pcs</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>DIAMOND VALUE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>TOTAL CLR CT</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>TOTAL CLR PCS</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>COLORSTONE VALUE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>Labour</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>STONE RATE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>SETTING</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...spFnt, ...spbgClr, ...styBld }}>TOTAL 1 DESIGN AMOUNT USD</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>NO OF PCS</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...spFnt, ...spbgClr, ...styBld }}>TOTAL QUANTITY AMOUNT USD</th>
                                <th width={100} style={{ ...spBgclr, ...brRight, ...brBotm }}></th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>TOTAL GROSS WT</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>TOTAL NET WT</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>GOLD RATE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>GOLD VALUE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>TOTAL DIA CT</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>TOTAL DIA PCS</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>TOTAL DIAMOND VALUE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>TOTAL COLOR CT</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>TOTAL CLR PCS</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>TOTAL CLR VALUE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>TOTAL LABOUR</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm }}>TOTAL SETTING</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...spFnt, ...spbgClr, ...styBld }}>TOTAL VALUE</th>
                            </tr>
                            {result?.resultArray?.map((e, i) => {
                                return <tr key={i}>
                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop }}><div>{i + 1}</div></td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop }}><div>D</div></td>

                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop }}>{e?.metal?.map((el, id) => (<div key={id}>{el?.Pcs}</div>))}</td>

                                    <td width={120} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.DesignImage !== "" && 
                                            <>
                                                <div></div>
                                                <div>
                                                    <img 
                                                        src={e?.DesignImage} 
                                                        alt="" 
                                                        onError={handleImageErrors} 
                                                        width={90} 
                                                        height={90} 
                                                        style={{ objectFit: "contain" }} 
                                                    />
                                                </div>
                                                <div>{`\u00A0`}</div>
                                            </>
                                        }
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...styBld }}><div>{`\u200B${e?.SrJobno}` }</div></td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...styBld }}><div>{e?.designno}</div></td>

                                    <td width={140} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        <div>{e?.Categoryname}</div>
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.metal?.map((el, id) => (<div key={id}>{el?.Colorname}</div>))}
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        <div>{e?.MetalPurity}</div>
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        <div>{fixedValues(e?.grosswt,3)}</div>
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        <div>{fixedValues(e?.NetWt,3)}</div>
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.metal?.map((el, id) => (<div key={id}>{NumberWithCommas(el?.Rate,2)}</div>))}
                                    </td> 

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.metal?.map((el, id) => (<div key={id}>{NumberWithCommas(el?.Amount,2)}</div>))}
                                    </td> 

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.diamond_colorstone_misc?.map((el) => {
                                            return (
                                                <div key={el?.id}>
                                                    {el?.MasterManagement_DiamondStoneTypeName === "DIAMOND"
                                                        ? "D"
                                                        : (el?.MasterManagement_DiamondStoneTypeName === "COLOR STONE" 
                                                            || el?.MasterManagement_DiamondStoneTypeName === "MISC"
                                                                ? "C"
                                                                    : ""
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.diamond_colorstone_misc?.map((el, id) => (
                                            <div key={id}>{el?.MasterManagement_DiamondStoneTypeName}</div>
                                        ))}
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...spSTy }}>
                                        {e?.diamond_colorstone_misc?.map((el, id) => (
                                            <div key={id}>{el?.Pcs}</div>
                                        ))}
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.diamond_colorstone_misc?.map((el, id) => (
                                            <div key={id}>{fixedValues(el?.Wt,3)}</div>
                                        ))}
                                    </td> {/** total gms dmd */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.diamond_colorstone_misc?.map((el, id) => (
                                            <div key={id}>{el?.Colorname}</div>
                                        ))}
                                    </td> {/** color */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.diamond_colorstone_misc?.map((el, id) => (
                                            <div key={id}>{el?.QualityName}</div>
                                        ))}
                                    </td> {/** clarity */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.diamond_colorstone_misc?.map((el, id) => (
                                            <div key={id}>{el?.ShapeName}</div>
                                        ))}
                                    </td> {/** shape */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, textAlign: "left" }}>
                                        {e?.diamond_colorstone_misc?.map((el, id) => (
                                            <div key={id}>{el?.SizeName}</div>
                                        ))}
                                    </td> {/** mm size */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>{}</td> {/** Sieve Size */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.diamond_colorstone_misc?.map((el, id) => (
                                            <div key={id}>{formatAmount(el?.Rate,2)}</div>
                                        ))}    
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.diamond_colorstone_misc?.map((el, id) => (
                                            <div key={id}>{formatAmount(el?.Amount,2)}</div>
                                        ))}
                                    </td> {/** total amt usd */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {<div>{formatAmount((e?.totals?.diamonds?.Amount || 0) + (e?.totals?.colorstone?.Amount || 0) + (e?.totals?.misc?.Amount || 0),2)}</div>}
                                    </td> {/** total dia + cs */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.totals?.diamonds?.Wt?.toFixed(3)}
                                    </td> {/** total dmd wt */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {fixedValues(e?.totals?.diamonds?.Pcs,3)}
                                    </td> {/** total dmd pcs */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {formatAmount(e?.totals?.diamonds?.Amount,2)}
                                    </td> {/** dia value */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {fixedValues((e?.totals?.colorstone?.Wt) + (e?.totals?.misc?.Wt),2)}
                                    </td> {/** total clr and misc wt */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {fixedValues((e?.totals?.colorstone?.Pcs) + (e?.totals?.misc?.Pcs),2)}
                                    </td> {/** total clr and misc pcs */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {formatAmount((e?.totals?.colorstone?.Amount) + (e?.totals?.misc?.Amount),2)}
                                    </td> {/** colorstone and misc value */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {<div>{formatAmount(e?.MakingAmount,2)}</div>}
                                    </td> {/** labour */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}></td> {/** stone rate */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.diamond_colorstone_misc?.map((el, id) => (
                                            <div key={id}>{formatAmount(el?.SettingAmount,2)}</div>
                                        ))}
                                    </td> {/** setting */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...spFnt, ...spbgClr }}>
                                        {formatAmount(e?.TotalAmount + e?.DiscountAmt,2)}
                                    </td> {/** total per job amount */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.Quantity}
                                    </td> {/** quantity per job */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...spFnt, ...spbgClr }}>
                                        {formatAmount(e?.TotalAmount,2)}
                                    </td> {/** total quantity amount */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...spBgclr }}>{}</td>
                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {fixedValues(e?.grosswt * e?.Quantity,3)}
                                    </td> {/** total gross */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {fixedValues(e?.NetWt * e?.Quantity,3)}
                                    </td> {/** total net wt */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.metal?.map((el, id) => (<div key={id}>{NumberWithCommas(el?.Rate,2)}</div>))}
                                    </td> {/** gold rate */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.metal?.map((el, id) => (<div key={id}>{NumberWithCommas(el?.Amount * e?.Quantity, 2)}</div>))}
                                    </td> {/** gold value */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {fixedValues(e?.totals?.diamonds?.Wt * e?.Quantity,3)}
                                    </td> {/** total dia ct */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {e?.totals?.diamonds?.Pcs * e?.Quantity}
                                    </td> {/** total dia pcs */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {formatAmount(e?.totals?.diamonds?.Amount * e?.Quantity)}
                                    </td> {/** total dia value */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {fixedValues((e?.totals?.colorstone?.Wt || 0) + (e?.totals?.misc?.Wt || 0) * (e?.Quantity),3)}
                                    </td> {/** total color ct */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {(e?.totals?.colorstone?.Pcs || 0) + (e?.totals?.misc?.Pcs || 0) * (e?.Quantity)}
                                    </td> {/** total color pcs */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {formatAmount((e?.totals?.colorstone?.Amount || 0) + (e?.totals?.misc?.Amount || 0) * (e?.Quantity),2)}
                                    </td> {/** total color value */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        <div>{formatAmount(e?.MakingAmount * e?.Quantity,2)}</div>
                                    </td> 

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {formatAmount(e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount + e?.totals?.metal?.SettingAmount + 
                                            e?.totals?.misc?.SettingAmount,2)}
                                    </td> {/** total setting */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop }}>
                                        {formatAmount(e?.TotalAmount * e?.Quantity,2)}
                                    </td>
                                </tr>
                            })}
                            <tr>
                                <td width={80} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={80} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}>TOTAL</td>
                                <td width={80} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}>
                                    {totalqty}
                                </td>
                                <td width={120} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={140} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}>
                                    {totalGrosswt?.toFixed(3)}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}>
                                    {totalNetWt?.toFixed(3)}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}>
                                    {formatAmount(result?.mainTotal?.metal?.IsPrimaryMetal_Amount)}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}>
                                    { (result?.mainTotal?.diamonds?.Pcs) + (result?.mainTotal?.colorstone?.Pcs) + (result?.mainTotal?.misc?.Pcs) }
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}>
                                    {fixedValues( (result?.mainTotal?.diamonds?.Wt) + (result?.mainTotal?.colorstone?.Wt) + (result?.mainTotal?.misc?.Wt),3 )}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}>
                                    {formatAmount( (result?.mainTotal?.diamonds?.Amount) + (result?.mainTotal?.colorstone?.Amount) + (result?.mainTotal?.misc?.Amount) )}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}>
                                    {formatAmount( (result?.mainTotal?.diamonds?.Amount) + (result?.mainTotal?.colorstone?.Amount) + (result?.mainTotal?.misc?.Amount) )}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}>
                                    {result?.mainTotal?.diamonds?.Wt?.toFixed(3)}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}>
                                    {result?.mainTotal?.diamonds?.Pcs}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}>
                                    { (result?.mainTotal?.colorstone?.Wt) + (result?.mainTotal?.misc?.Wt) }
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}>
                                    { (result?.mainTotal?.colorstone?.Pcs) + (result?.mainTotal?.misc?.Pcs) }
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}>
                                    {result?.mainTotal?.total_labour?.labour_amount}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}>
                                    {formatAmount( (result?.finalAmount) - (result?.allTaxesTotal) )}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...spBgclr }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...brRight }}></td>
                            </tr>
                        </tbody>
                    </table>
                </> 
            : <p className='text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto'>{msg}</p>}
        </>
    )
}

export default InvoiceExcelO;