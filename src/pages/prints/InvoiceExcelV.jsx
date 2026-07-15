//V // http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=SlMvNjMzLzI1LTI2&evn=c2FsZQ==&pnm=SW52b2ljZSBFeGNlbCBW&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=PackingList3&pid=undefined&etp=ZXhjZWw=
//V1 // http://localhost:3000/?tkn=OTA2NTQ3MTcwMDUzNTY1MQ==&invn=SlMvNjMzLzI1LTI2&evn=c2FsZQ==&pnm=SW52b2ljZSBFeGNlbCBWMQ==&up=aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvU2FsZUJpbGxfSnNvbg==&ctv=NzE=&ifid=PackingList3&pid=undefined&etp=ZXhjZWw=
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { apiCall, checkMsg, fixedValues, formatAmount, handleImageError, isObjectEmpty, NumberWithCommas } from '../../GlobalFunctions';
import Loader from '../../components/Loader';
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import { MetalShapeNameWiseArr } from '../../GlobalFunctions/MetalShapeNameWiseArr';
import { fontFamily } from '@mui/system';

const InvoiceExcelV = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
    const [result, setResult] = useState(null);
    console.log('result: ', result);
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
        // Step 1: Track unique MaterialTypeName values
        datas?.resultArray?.forEach((e) => {
            const materialTypes = {}; // Local object to track unique MaterialTypeName values

            e?.diamonds?.forEach((diamond) => {
                if (diamond?.MasterManagement_DiamondStoneTypeid === 1) {
                    const materialType = diamond?.MaterialTypeName;
                    if (materialType && !materialTypes[materialType]) {
                        materialTypes[materialType] = materialType;
                    }
                }
            });

            // Step 2: Add materialTypes to each element in resultArray
            e.materialTypes = materialTypes;
        });

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
    const FntStyl = {
        fontFamily: "calibri, sans-serif",
    }
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
    const styBld = {
        fontWeight: "bold",
    }
    const txtCen = {
        textAlign: "center",
    }
    const txtEnd = {
        textAlign: "right",
    }
    const spFnt = {
        color: "red"
    }
    const totalGrosswt = result?.resultArray?.reduce((acc, obj) => acc + obj.grosswt, 0);
    const totalNetWt = result?.resultArray?.reduce((acc, obj) => acc + obj.NetWt, 0);

    const decodedValue = atob(printName);
    const shouldHide = decodedValue !== "Invoice Excel V1";

    return (
        <>
            {loader ? <Loader /> : msg === "" ?
                <> <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    className="download-table-xls-button btn btn-success text-black bg-success px-2 py-1 fs-5 d-none"
                    table="table-to-xls"
                    filename={shouldHide ? (`Invoice_ExcelV_${result?.header?.InvoiceNo}_${Date.now()}`) : (`Invoice_ExcelV1_${result?.header?.InvoiceNo}_${Date.now()}`)}
                    sheet="tablexls"
                    buttonText="Download as XLS" />
                    <table id="table-to-xls" className='d-none'>
                        <tbody>
                            <tr>
                                <th width={80} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>SR NO</th>
                                {shouldHide ? (<th width={120} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>IMAGES</th>) : ("")}
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>DESIGN CODE</th>
                                <th width={140} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>ITEM DESCRIPTION</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>LAB</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>CERT NO.</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>METAL COLOUR</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>GOLD KARAT</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>GROSS WEIGHT</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>NET WT</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>WASTAGE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>GOLD FINE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>GOLD RATE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>GOLD VALUE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>DIAMOND TYPE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>TOTAL STONE WT</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>TOTAL STONE PCS</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>DIAMOND WT</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>DIAMOND PCS</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>COLOUR</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>CLARITY</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>SHAPE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>MM SIZE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>DIAMONDS RATE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>DIAMOND AMOUNT {result?.header?.CurrencyCode}</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>DIAMOND VALUE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>COLORSTONE WT</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>COLORSTONE PCS</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>COLORSTONE VALUE</th>
                                <th width={100} style={{ ...hdSty, ...brRight, ...brBotm, ...FntStyl, }}>TOTAL LABOUR</th>
                                <th width={100} style={{ ...brRight, ...brBotm, ...spFnt, ...hdSty, ...styBld, ...FntStyl, }}>TOTAL VALUE</th>
                            </tr>
                            {result?.resultArray?.map((e, i) => {
                                return <tr key={i}>
                                    <td width={80} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}><div>{i + 1}</div></td>

                                    {shouldHide ? (
                                        <td width={120} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
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
                                    ) : ("")}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...styBld, ...FntStyl, ...txtEnd }}><div>{e?.designno}</div><div>{`\u200B${e?.SrJobno}`}</div></td>

                                    <td width={140} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        <div>{e?.Categoryname}</div>
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        {/* {e?.misc
                                            ?.filter((el) => el?.ShapeName?.includes("Certification_"))
                                            .map((el, id) => {
                                            const shapeNameAfterCertification = el?.ShapeName?.split("Certification_")[1]; // Extract the part after 'Certification_'
                                            return shapeNameAfterCertification ? <div key={id}>{shapeNameAfterCertification}</div> : null;
                                        })} */}
                                        {e?.Clab}
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        <div>{e?.CertificateNo}</div>
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        {e?.metal?.map((el, id) => (<div key={id}>{el?.ShapeName} {el?.Colorname}</div>))}
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        <div>{e?.MetalPurity}</div>
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        <div>{fixedValues(e?.grosswt, 3)}</div>
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        <div>{fixedValues(e?.NetWt, 3)}</div>
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        <div>{fixedValues(e?.Wastage, 3)}</div>
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        <div>{fixedValues(e?.PureNetWt, 3)}</div>
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...txtEnd, ...FntStyl, }}>
                                        {e?.metal?.map((el, id) => (<div key={id}>{NumberWithCommas(el?.Rate, 2)}</div>))}
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...txtEnd, ...FntStyl, }}>
                                        {e?.metal?.map((el, id) => (<div key={id}>{NumberWithCommas(el?.Amount, 2)}</div>))}
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        {e?.materialTypes && Object.keys(e?.materialTypes).map((key, id) => (
                                            <div key={id}>{e.materialTypes[key]}</div> // Display the value associated with each key
                                        ))}
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        {fixedValues((e?.totals?.diamonds?.Wt) + (e?.totals?.colorstone?.Wt), 3)}
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        {(e?.totals?.diamonds?.Pcs) + (e?.totals?.colorstone?.Pcs)}
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        {e?.diamonds?.map((el, id) => (
                                            <div key={id}>{fixedValues(el?.Wt, 3)}</div>
                                        ))}
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        {e?.diamonds?.map((el, id) => (
                                            <div key={id}>{el?.Pcs}</div>
                                        ))}
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        {e?.diamonds?.map((el, id) => (
                                            <div key={id}>{el?.Colorname}</div>
                                        ))}
                                    </td> {/* Color */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        {e?.diamonds?.map((el, id) => (
                                            <div key={id}>{el?.QualityName}</div>
                                        ))}
                                    </td> {/* Clarity */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        {e?.diamonds?.map((el, id) => (
                                            <div key={id}>{el?.ShapeName}</div>
                                        ))}
                                    </td> {/* Shape */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, textAlign: "left" }}>
                                        {e?.diamonds?.map((el, id) => (
                                            <div key={id}>{`\u200B${el?.SizeName}`}</div>
                                        ))}
                                    </td> {/* Size */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        {e?.diamonds?.map((el, id) => (
                                            <div key={id}>{formatAmount(el?.Rate, 2)}</div>
                                        ))}
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        {e?.diamonds?.map((el, id) => (
                                            <div key={id}>{formatAmount(el?.Amount, 2)}</div>
                                        ))}
                                    </td> {/* Total AMT */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        {<div>{formatAmount(e?.totals?.diamonds?.Amount, 2)}</div>}
                                    </td>{ /* Per Job DMD Total */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        {e?.totals?.colorstone?.Wt?.toFixed(3)}
                                    </td>{/* Per Job Total CLR Wt */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        {e?.totals?.colorstone?.Pcs}
                                    </td>{/* Per Job Total CLR PCS */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        {formatAmount(e?.totals?.colorstone?.Amount, 2)}
                                    </td>{/* Per Job Total CLR Amount */}

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...FntStyl, }}>
                                        <div>{formatAmount(e?.MakingAmount * e?.Quantity, 2)}</div>
                                    </td>

                                    <td width={100} style={{ ...brRight, ...brBotm, ...txtTop, ...txtEnd, ...FntStyl, }}>
                                        {formatAmount(e?.TotalAmount * e?.Quantity, 2)}
                                    </td>
                                </tr>
                            })}
                            <tr>
                                <td width={80} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}></td>
                                {shouldHide ? (<td width={120} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}></td>) : ("")}
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}></td>
                                <td width={140} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}>
                                    {totalGrosswt?.toFixed(3)}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}>
                                    {totalNetWt?.toFixed(3)}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}>
                                    {formatAmount(result?.mainTotal?.total_Wastage, 2)}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}>
                                    {fixedValues(result?.mainTotal?.total_purenetwt, 3)}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}>
                                    {formatAmount(result?.mainTotal?.metal?.Amount, 2)}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}>
                                    {fixedValues((result?.mainTotal?.diamonds?.Wt) + (result?.mainTotal?.colorstone?.Wt), 3)}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}>
                                    {(result?.mainTotal?.diamonds?.Pcs) + (result?.mainTotal?.colorstone?.Pcs)}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}>
                                    {fixedValues(result?.mainTotal?.diamonds?.Wt, 3)}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}>
                                    {result?.mainTotal?.diamonds?.Pcs}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}></td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}>
                                    {formatAmount(result?.mainTotal?.diamonds?.Amount, 2)}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}>
                                    {formatAmount(result?.mainTotal?.diamonds?.Amount, 2)}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}>
                                    {fixedValues(result?.mainTotal?.colorstone?.Wt, 3)}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}>
                                    {result?.mainTotal?.colorstone?.Pcs}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}>
                                    {formatAmount(result?.mainTotal?.colorstone?.Amount, 2)}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...FntStyl, }}>
                                    {result?.mainTotal?.total_labour?.labour_amount}
                                </td>
                                <td width={100} style={{ ...txtCen, ...spFnt, ...styBld, ...brTop, ...brBotmdrk, ...brRight, ...FntStyl, }}>
                                    {formatAmount((result?.finalAmount) - (result?.allTaxesTotal), 2)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </>
                : <p className='text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto'>{msg}</p>}
        </>
    )
}

export default InvoiceExcelV;