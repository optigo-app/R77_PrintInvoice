import React, { useEffect, useState } from 'react'
import { apiCall, checkMsg, formatAmount, handleGlobalImgError, isObjectEmpty } from '../../GlobalFunctions';
import Loader from '../../components/Loader';
import  ReactHTMLTableToExcel  from 'react-html-table-to-excel';
import { OrganizeDataPrint } from '../../GlobalFunctions/OrganizeDataPrint';
import { cloneDeep } from 'lodash';
import sanitizeHtml from 'sanitize-html';
import { htmlToText } from 'html-to-text';

const TaxInvoiceExcel = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
    const [result, setResult] = useState(null);
    const [result2, setResult2] = useState(null);
    const [result3, setResult3] = useState(null);
    const [diamondWise, setDiamondWise] = useState([]);
    const [rowWise, setRowWise] = useState([]);
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
            if (data?.Status === '200') {
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
        }
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
            QualityName:'',
            Colorname:''
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
            }else{
              diaonlyrndarr6[find_record].wtWts += e?.wtWt;
              diaonlyrndarr6[find_record].pcPcss += e?.pcPcs;
              diaonlyrndarr6[find_record].rRates += e?.rRate;
              diaonlyrndarr6[find_record].amtAmounts += e?.amtAmount;
            }
          });
      
          diarndotherarr5 = [...diaonlyrndarr6, diaObj];
          setDiamondWise(diarndotherarr5);
        datas?.resultArray?.forEach((el) => {
            let dia = [];
            el?.diamonds?.forEach((a) => {
                let obj = cloneDeep(a);
                let findrec = dia?.findIndex((ele) => ele?.ShapeName === obj?.ShapeName && ele?.QualityName === obj?.QualityName && ele?.Colorname === obj?.Colorname && ele?.SizeName === obj?.SizeName && ele?.Rate === obj?.Rate)
                if(findrec === -1){
                    dia.push(obj);
                }else{
                    dia[findrec].Wt += obj?.Wt;
                    dia[findrec].Pcs += obj?.Pcs;
                    dia[findrec].Rate = obj?.Rate;
                    dia[findrec].Amount += obj?.Amount;
                }
            })
            el.diamonds = dia;

            let clr = [];
            el?.colorstone?.forEach((a) => {
                let obj = cloneDeep(a);
                let findrec = clr?.findIndex((ele) => ele?.ShapeName === obj?.ShapeName && ele?.QualityName === obj?.QualityName && ele?.Colorname === obj?.Colorname && ele?.isRateOnPcs === obj?.isRateOnPcs && ele?.SizeName === obj?.SizeName && ele?.Rate === obj?.Rate)
                if(findrec === -1){
                    clr.push(obj);
                }else{
                    clr[findrec].Wt += obj?.Wt;
                    clr[findrec].Pcs += obj?.Pcs;
                    clr[findrec].Rate = obj?.Rate;
                    clr[findrec].Amount += obj?.Amount;
                }
            })
            el.colorstone = clr;

            let miscAr = [];
            el?.misc?.forEach((a) => {
                let obj = cloneDeep(a);
                let findrec = miscAr?.findIndex((ele) => ele?.ShapeName === obj?.ShapeName && ele?.QualityName === obj?.QualityName && ele?.Colorname === obj?.Colorname && ele?.isRateOnPcs === obj?.isRateOnPcs && ele?.SizeName === obj?.SizeName && ele?.Rate === obj?.Rate)
                if(findrec === -1){
                    miscAr.push(obj);
                }else{
                    miscAr[findrec].Wt += obj?.Wt;
                    miscAr[findrec].Pcs += obj?.Pcs;
                    miscAr[findrec].Rate = obj?.Rate;
                    miscAr[findrec].Amount += obj?.Amount;
                }
            })
            el.misc = miscAr;

            let misc2arr = el?.misc?.filter((e) => e?.IsHSCOE === 0);

            el.misc = misc2arr;

            let clr_misc_ar = [...el?.colorstone, ...el?.misc];

            el.colorstone = clr_misc_ar;

        })

        let finalArr = [];

        datas?.resultArray?.forEach((e, i) => {

            let arr = [];

            let len = 7;

            if(e?.diamonds?.length > e?.colorstone?.length){
                if(e?.diamonds?.length > 7){
                    len = e?.diamonds?.length;
                }
            }
            else if(e?.diamonds?.length < e?.colorstone?.length){
                    if(e?.colorstone?.length > 7){
                    len = e?.colorstone?.length;
                }
            }

            let findMetal = e?.metal?.find((ele, ind) => ele?.IsPrimaryMetal === 1)
            let obj = {};
            obj.sr = i+1;
            obj.srflag = true;
            obj.srRowSpan = len;
            obj.SrJobno = `${e?.SrJobno}`;
            obj.designno = e?.designno;
          
            obj.dia_code = e?.diamonds[0] ? (e?.diamonds[0]?.ShapeName + " " + e?.diamonds[0]?.QualityName + " " + e?.diamonds[0]?.Colorname) : '';
            obj.dia_size = e?.diamonds[0] ? e?.diamonds[0]?.SizeName : '';
            obj.dia_pcs = e?.diamonds[0] ? e?.diamonds[0]?.Pcs : '';
            obj.dia_wt = e?.diamonds[0] ? ((e?.diamonds[0]?.Wt)?.toFixed(3)) : '';
            obj.dia_rate = e?.diamonds[0] ? (Math.round(((e?.diamonds[0]?.Amount / datas?.header?.CurrencyExchRate) / (e?.diamonds[0]?.Wt === 0 ? 1 : e?.diamonds[0]?.Wt)))) : '';
            obj.dia_amt = e?.diamonds[0] ? (e?.diamonds[0]?.Amount) : '';
            // obj.dia_rate = e?.diamonds[0] ? (Math.round(((e?.diamonds[0]?.Amount / result?.header?.CurrencyExchRate) / (e?.diamonds[0]?.Wt === 0 ? 1 : e?.diamonds[0]?.Wt)))) : '';

            obj.met_quality = '';
            obj.met_wt = 0;
            obj.met_rate = 0;
            obj.met_amt = 0;
            
                obj.met_wt = e?.NetWt;
                // obj.met_rate = findMetal ? (Math.round(((findMetal?.Amount / datas?.header?.CurrencyExchRate)) / e?.NetWt)) : '';
                obj.met_rate = findMetal ? (Math.round((findMetal?.Rate) )) : '';
                obj.met_amt = findMetal ? ((findMetal?.Amount)) : '';
                obj.met_quality = findMetal ? (findMetal?.ShapeName + " " + findMetal?.QualityName) : '';
            
            obj.cls_code = e?.colorstone[0] ? (` ${e?.colorstone[0]?.MasterManagement_DiamondStoneTypeid === 3 ? 'M:' : ''} ${e?.colorstone[0]?.ShapeName}` + 
              " " + e?.colorstone[0]?.QualityName + 
              " " + e?.colorstone[0]?.Colorname) : '';
            obj.cls_size = e?.colorstone[0] ? (e?.colorstone[0]?.SizeName) : '';
            obj.cls_pcs = e?.colorstone[0] ? (e?.colorstone[0]?.Pcs) : '';
            obj.cls_wt = e?.colorstone[0] ? ((e?.colorstone[0]?.Wt)?.toFixed(3)) : '';
            // obj.cls_rate = e?.colorstone[0] ? (Math.round(((e?.colorstone[0]?.Amount / result?.header?.CurrencyExchRate)) / ( e?.colorstone[0]?.isRateOnPcs === 1 ? (e?.colorstone[0]?.Pcs === 0 ? 1 : e?.colorstone[0]?.Pcs) :  (e?.colorstone[0]?.Wt === 0 ? 1 : e?.colorstone[0]?.Wt)))) : '';
            obj.cls_rate = e?.colorstone[0] ? (Math.round(((e?.colorstone[0]?.Amount / datas?.header?.CurrencyExchRate)) / ( e?.colorstone[0]?.isRateOnPcs === 1 ? (e?.colorstone[0]?.Pcs === 0 ? 1 : e?.colorstone[0]?.Pcs) :  (e?.colorstone[0]?.Wt === 0 ? 1 : e?.colorstone[0]?.Wt)))) : '';
            obj.cls_amt = e?.colorstone[0] ? ((e?.colorstone[0]?.Amount)) : '';

            obj.oth_amt = ( e?.OtherCharges + e?.TotalDiamondHandling + e?.MiscAmount);
            obj.labour_rate = e?.MaKingCharge_Unit;
            obj.labour_amt = (e?.MakingAmount + e?.totals?.diamonds?.SettingAmount + e?.totals?.colorstone?.SettingAmount);
            obj.total_amount = e?.TotalAmount;
         
            Array?.from({length : len})?.map((el, ind) => {

                let obj = {};
          
                obj.srflag = false
                obj.img = e?.DesignImage;
                obj.imgflag = false;
                if(ind === 0){
                    obj.imgflag = true;
                }
                obj.tunch = ((e?.Tunch)?.toFixed(3));

                obj.tunchflag = false;
                if(ind === 4){
                    obj.tunchflag = true;
                }

                obj.grosswt = ((e?.grosswt)?.toFixed(3));

                obj.grosswetflag = false;
                if(ind === 5){
                    obj.grosswetflag = true;
                }

                //diamond
                obj.dia_code = '';
                obj.dia_size = '';
                obj.dia_pcs = 0;
                obj.dia_wt = 0;
                obj.dia_rate = 0;
                obj.dia_amt = 0;
                obj.diaflag = false;

                if(e?.diamonds[ind+1]){
                    obj.diaflag = true;
                    obj.dia_code = (e?.diamonds[ind + 1]?.ShapeName + " " + e?.diamonds[ind + 1]?.QualityName + " " + e?.diamonds[ind + 1]?.Colorname);
                    obj.dia_size = e?.diamonds[ind + 1]?.SizeName;
                    obj.dia_pcs = e?.diamonds[ind + 1]?.Pcs;
                    obj.dia_wt = ((e?.diamonds[ind + 1]?.Wt)?.toFixed(3));
                    // obj.dia_rate = (Math.round((e?.diamonds[ind + 1]?.Amount / result?.header?.CurrencyExchRate) / (e?.diamonds[ind + 1]?.Wt === 0 ? 1 : e?.diamonds[ind + 1]?.Wt)));
                    obj.dia_rate = (Math.round((e?.diamonds[ind + 1]?.Amount / datas?.header?.CurrencyExchRate) / (e?.diamonds[ind + 1]?.Wt === 0 ? 1 : e?.diamonds[ind + 1]?.Wt)));
                    obj.dia_amt = ((e?.diamonds[ind + 1]?.Amount));
                }

                // colorstone
                obj.cls_code = '';
                obj.cls_size = '';
                obj.cls_pcs = 0;
                obj.cls_wt = 0;
                obj.cls_rate = 0;
                obj.cls_amt = 0;
                obj.clsflag = false;

                if(e?.colorstone[ind+1]){
                    obj.clsflag = true;
                    obj.cls_code = `${e?.colorstone[ind+1]?.MasterManagement_DiamondStoneTypeid === 3 ? 'M:' : ''}  ${e?.colorstone[ind + 1]?.ShapeName}` + 
                    " " + e?.colorstone[ind + 1]?.QualityName + " " + e?.colorstone[ind + 1]?.Colorname;
                    obj.cls_size = e?.colorstone[ind + 1]?.SizeName;
                    obj.cls_pcs = e?.colorstone[ind + 1]?.Pcs;
                    obj.cls_wt = ((e?.colorstone[ind + 1]?.Wt)?.toFixed(3));
                    // obj.cls_rate = (Math.round(((e?.colorstone[ind + 1]?.Amount / result?.header?.CurrencyExchRate)) / (e?.colorstone[ind + 1]?.Wt === 0 ? 1 : e?.colorstone[ind + 1]?.Wt)));
                    obj.cls_rate = (Math.round(((e?.colorstone[ind + 1]?.Amount / datas?.header?.CurrencyExchRate)) / (e?.colorstone[ind + 1]?.Wt === 0 ? 1 : e?.colorstone[ind + 1]?.Wt)));
                    obj.cls_amt = ((e?.colorstone[ind + 1]?.Amount));
                    
                }

                obj.JobRemark = e?.JobRemark;
                obj.jobRemarkflag = false;
                if(ind === 1 && e?.JobRemark !== ''){
                    obj.jobRemarkflag = true;
                }

                arr.push(obj);

            })

            obj.matrialArr = arr;
            obj.values = e;

            finalArr.push(obj);
        })
        setResult2(finalArr);
        setResult(datas);

        let catewise = [];

        datas?.resultArray?.forEach((e, i) => {
            let obj = cloneDeep(e);
            let findrec = catewise?.findIndex((a) => a?.Categoryname === obj?.Categoryname)
            if(findrec === -1){
                catewise.push(obj)
            }else{
                catewise[findrec].Quantity += obj?.Quantity;
            }
        })

        catewise.sort((a, b) => a.Categoryname.localeCompare(b.Categoryname));
        
        setResult3(catewise)

        let rowArr = [];

        let rowObj = {};
        rowObj.grosswt_name = 'GROSS WT'
        rowObj.grosswt_value = ((datas?.mainTotal?.grosswt)?.toFixed(3));
        rowObj.name = 'GOLD'
        rowObj.value = (formatAmount(datas?.mainTotal?.MetalAmount));
        rowObj.dia_info_name = ( diarndotherarr5[0]  !== undefined ? (diarndotherarr5[0]?.ShapeName + " " + diarndotherarr5[0]?.QualityName + " " + diarndotherarr5[0]?.Colorname) : '')
        rowObj.dia_info_value = ( diarndotherarr5[0] !== undefined ? ( diarndotherarr5[0]?.pcPcss + " / " + (diarndotherarr5[0]?.wtWts)?.toFixed(3)) : '')
        rowObj.sum_info_name = ( catewise[0] === undefined ? '' : catewise[0]?.Categoryname);
        rowObj.sum_info_value = ( catewise[0] === undefined ? '' : catewise[0]?.Quantity);
        rowObj.remark = ((datas?.header?.PrintRemark));
        rowArr.push(rowObj);

        let rowObj1 = {};
        rowObj1.grosswt_name = 'WT'
        rowObj1.grosswt_value = ((datas?.mainTotal?.netwt)?.toFixed(3));
        rowObj1.name = 'DIAMOND';
        rowObj1.value = (formatAmount(datas?.mainTotal?.diamonds?.Amount));
        rowObj1.dia_info_name = ( diarndotherarr5[1]  === undefined ? '' : (diarndotherarr5[1]?.ShapeName + " " + diarndotherarr5[1]?.QualityName + " " + diarndotherarr5[1]?.Colorname) )
        rowObj1.dia_info_value = ( diarndotherarr5[1] === undefined ? '' : ( diarndotherarr5[1]?.pcPcss + " / " + ((diarndotherarr5[1]?.wtWts)?.toFixed(3))) )
        // rowObj1.dia_info_name = ((diarndotherarr5[1]?.ShapeName !== undefined ? diarndotherarr5[1]?.ShapeName : "") + " " + 
        // ((diarndotherarr5[1]?.QualityName) === undefined ? '' : diarndotherarr5[1]?.QualityName) + " " + (diarndotherarr5[1]?.Colorname === undefined) ? '' : diarndotherarr5[1]?.Colorname)
        // rowObj1.dia_info_value = ((diarndotherarr5[1]?.pcPcss === undefined ? '' : diarndotherarr5[1]?.Colorname ) + " / " + ( diarndotherarr5[1]?.wtWts === undefined ? '' : (diarndotherarr5[1]?.wtWts)?.toFixed(3)))
        rowObj1.sum_info_name = ( catewise[1] === undefined ? '' : catewise[1]?.Categoryname);
        rowObj1.sum_info_value = ( catewise[1] === undefined ? '' : catewise[1]?.Quantity);
        rowObj1.remark = '';
        rowArr.push(rowObj1);



        let rowObj2 = {};
        rowObj2.grosswt_name = 'DIAMOND WT'
        rowObj2.grosswt_value = (`${datas?.mainTotal?.diamonds?.Pcs} / ${(datas?.mainTotal?.diamonds?.Wt)?.toFixed(3)}`);
        rowObj2.name = 'CST';
        rowObj2.value = (formatAmount((datas?.mainTotal?.colorstone?.Amount + datas?.mainTotal?.misc?.onlyIsHSCODE0_Amount)));
        rowObj2.dia_info_name = ( diarndotherarr5[2] === undefined ? '' : (diarndotherarr5[2]?.ShapeName + " " + diarndotherarr5[2]?.QualityName + " " + diarndotherarr5[2]?.Colorname  ))
        rowObj2.dia_info_value = ( diarndotherarr5[2] === undefined ? '' : (diarndotherarr5[2]?.pcPcss + " / " + (diarndotherarr5[2]?.wtWts)?.toFixed(3)))
        rowObj2.sum_info_name = ( catewise[2] === undefined ? '' : catewise[2]?.Categoryname);
        rowObj2.sum_info_value = ( catewise[2] === undefined ? '' : catewise[2]?.Quantity);
        rowObj2.remark = '';
        rowArr.push(rowObj2);


        let rowObj3 = {};
        rowObj3.grosswt_name = 'STONE WT'
        rowObj3.grosswt_value = (`${datas?.mainTotal?.colorstone?.Pcs} / ${(datas?.mainTotal?.colorstone?.Wt)?.toFixed(3)}`);
        rowObj3.name = 'MAKING';
        rowObj3.value = (formatAmount(( datas?.mainTotal?.total_Making_Amount + datas?.mainTotal?.diamonds?.SettingAmount + datas?.mainTotal?.colorstone?.SettingAmount)));
        rowObj3.dia_info_name = (  diarndotherarr5[3] === undefined ? '' : ( (diarndotherarr5[3]?.ShapeName + " " + diarndotherarr5[3]?.QualityName + " " + diarndotherarr5[3]?.Colorname  )))
        rowObj3.dia_info_value = ( diarndotherarr5[3] === undefined ? '' :  ((diarndotherarr5[3]?.pcPcss + " / " + (diarndotherarr5[3]?.wtWts)?.toFixed(3))))
        rowObj3.sum_info_name = ( catewise[3] === undefined ? '' :  catewise[3]?.Categoryname);
        rowObj3.sum_info_value = (catewise[3] === undefined ? '' : catewise[3]?.Quantity);
        rowObj3.remark = '';
        rowArr.push(rowObj3);


        let rowObj4 = {};
        rowObj4.grosswt_name = ''
        rowObj4.grosswt_value = '';
        rowObj4.name = 'OTHER';
        rowObj4.value = (formatAmount(( datas?.mainTotal?.total_other + datas?.mainTotal?.totalMiscAmount + datas?.mainTotal?.total_diamondHandling)));
        rowObj4.dia_info_name = ( diarndotherarr5[4] === undefined ? '' : (diarndotherarr5[4]?.ShapeName + " " + diarndotherarr5[4]?.QualityName + " " + diarndotherarr5[4]?.Colorname  ))
        rowObj4.dia_info_value = ( diarndotherarr5[4] === undefined ? '' : (diarndotherarr5[4]?.pcPcss + " / " + (diarndotherarr5[4]?.wtWts)?.toFixed(3)))
        rowObj4.sum_info_name = ( catewise[4] === undefined ? '' :  catewise[4]?.Categoryname);
        rowObj4.sum_info_value = ( catewise[4] === undefined ? '' : catewise[4]?.Quantity);
        rowObj4.remark = '';
        rowArr.push(rowObj4);


        let rowObj5 = {};
        rowObj5.grosswt_name = ''
        rowObj5.grosswt_value = '';
        rowObj5.name = 'TAX';
        rowObj5.value = (formatAmount(((+datas?.allTaxesTotal) * datas?.header?.CurrencyExchRate)));
        rowObj5.dia_info_name = (diarndotherarr5[5] === undefined ? '' : (diarndotherarr5[5]?.ShapeName + " " + diarndotherarr5[5]?.QualityName + " " + diarndotherarr5[5]?.Colorname  ))
        rowObj5.dia_info_value = ( diarndotherarr5[5] === undefined ? '' :  (diarndotherarr5[5]?.pcPcss + " / " + (diarndotherarr5[5]?.wtWts)?.toFixed(3)))
        rowObj5.sum_info_name = ( catewise[5] === undefined ? '' : catewise[5]?.Categoryname);
        rowObj5.sum_info_value = ( catewise[5] === undefined ? '' : catewise[5]?.Quantity);
        rowObj5.remark = '';
        rowArr.push(rowObj5);


        let rowObj6 = {};
        rowObj6.grosswt_name = ''
        rowObj6.grosswt_value = '';
        rowObj6.name = 'LESS';
        rowObj6.value = (formatAmount((datas?.header?.AddLess)));
        rowObj6.dia_info_name = ( diarndotherarr5[6] === undefined ? '' : (diarndotherarr5[6]?.ShapeName + " " + diarndotherarr5[6]?.QualityName + " " + diarndotherarr5[6]?.Colorname  ))
        rowObj6.dia_info_value = ( diarndotherarr5[6] === undefined ? '' : (diarndotherarr5[6]?.pcPcss + " / " + (diarndotherarr5[6]?.wtWts)?.toFixed(3)))
        rowObj6.sum_info_name = ( catewise[6] === undefined ? '' : catewise[6]?.Categoryname);
        rowObj6.sum_info_value = (  catewise[6] === undefined ? '' : catewise[6]?.Quantity);
        rowObj6.remark = '';
        rowArr.push(rowObj6);


        let rowObj7 = {};
        rowObj7.grosswt_name = ''
        rowObj7.grosswt_value = '';
        rowObj7.name = 'TOTAL';
        rowObj7.value = formatAmount((datas?.mainTotal.total_amount + datas?.header?.AddLess + (datas?.allTaxesTotal * datas?.header?.CurrencyExchRate)));
        rowObj7.dia_info_name = ( diarndotherarr5[7] === undefined ? '' : (diarndotherarr5[7]?.ShapeName + " " + diarndotherarr5[7]?.QualityName + " " + diarndotherarr5[7]?.Colorname  ))
        rowObj7.dia_info_value = ( diarndotherarr5[7] === undefined ? '' : (diarndotherarr5[7]?.pcPcss + " / " + (diarndotherarr5[7]?.wtWts)?.toFixed(3)))
        rowObj7.sum_info_name = ( catewise[7] === undefined ? '' : catewise[7]?.Categoryname);
        rowObj7.sum_info_value = (catewise[7] === undefined ? '' : catewise[7]?.Quantity);
        rowObj7.remark = '';
        rowArr.push(rowObj7);

        let len2 = 8;
        if(catewise?.length > 8 || diarndotherarr5?.length > 8){
            if(catewise?.length > diarndotherarr5?.length){
                len2 = catewise?.length; 
            }
            if(catewise?.length < diarndotherarr5?.length){
                len2 = diarndotherarr5?.length; 
            }
        }

        Array.from({length:len2})?.map((e, i) => {
            if(i > 7){
                let rowObjs = {};
                rowObjs.grosswt_name = ''
                rowObjs.grosswt_value = '';
                rowObjs.name = '';
                rowObjs.value = ''
                rowObjs.dia_info_name = diarndotherarr5[i] !== undefined ? ((diarndotherarr5[i]?.ShapeName + " " + diarndotherarr5[i]?.QualityName + " " + diarndotherarr5[i]?.Colorname)  ) :  ""
                rowObjs.dia_info_value = ( diarndotherarr5[i] === undefined ? '' : (diarndotherarr5[i]?.pcPcss + " / " + (diarndotherarr5[i]?.wtWts)?.toFixed(3)))
                rowObjs.sum_info_name =  catewise[i] !== undefined ? (catewise[i]?.Categoryname) : '';
                rowObjs.sum_info_value = catewise[i] !== undefined  ? (catewise[i]?.Quantity) : '';
                rowObjs.remark = '';
                rowArr.push(rowObjs);
            }
        })

        setRowWise(rowArr);
        
        // for download excel direct
        setTimeout(() => {
          const button = document.getElementById('test-table-xls-button');
          // button.click();
        }, 500);


        
        // // Remove <blockquote> element
        // let modifiedContent = datas?.header?.Declaration?.replace(/<blockquote[^>]*>[\s\S]*?<\/blockquote>/g, '');
        
        // // Wrap each item in <br> tags
        // let modifiedContent1 = modifiedContent?.replace(/<u><i><b><\span><\font><\div>/g, '<br>');
        // let modifiedContent2 = modifiedContent1?.replace(/<\/u><\/i><\/b><\/span><\/font><\/div>/g, '</br>');

        // console.log(modifiedContent2);

      //   const sanitizedHtml = sanitizeHtml(datas?.header?.Declaration, {
      //     allowedTags: ['b', 'i', 'u', 'span', 'font'], // Allow only basic formatting tags
      //     allowedAttributes: {
      //       'span': ['style'],
      //       'font': ['face']
      //     },
      //     textFilter: text => text.replace(/\n/g, ' ') // Replace newlines with spaces
      //   });
      
      //   // Convert sanitized HTML to plain text or simplified HTML
      //   const plainText = htmlToText(sanitizedHtml, {
      //     wordwrap: false, // Disable word wrapping
      //     singleNewLineParagraphs: true // Single new line between paragraphs
      //   });

      //   // datas.header.Declaration = plainText;

      // const sentences = plainText.replace(/\['1.','2.','3.','4.','5.']/g, '<br />');

      // Filter out empty strings and trim whitespace
      // const filteredSentences = sentences.filter(sentence => sentence.trim() !== '');

      // console.log(sentences);





        //loadData end
    }



    //styles and css
    const tableCellStyle = {
        height: '40px',
        backgroundColor: '#939292',
        color: 'white',
        fontSize:'20px',
        fontWeight:'bold'
    };
    

  return (
    <>
    {
        loader ? <Loader /> : <>
        {
            msg === '' ? <>
            <div style={{paddingBottom:'5rem'}}>
                <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    // className="download-table-xls-button btn btn-success text-black bg-success px-2 py-1 fs-5 d-none"
                    className="download-table-xls-button btn btn-success text-black bg-success px-2 py-1 fs-5"
                    table="table-to-xls"
                    filename={`TaxInvoice_${result?.header?.InvoiceNo}_${Date.now()}`}
                    sheet="tablexls"
                    buttonText="Download as XLS"
                 />
                <table id='table-to-xls'>
                    <tbody>
            
                        {/* head line */}
                        <tr> <td colSpan={23} style={tableCellStyle}>{result?.header?.PrintHeadLabel}</td> </tr>

                        {/* company header */}
                        <tr> 
                          <td style={{fontSize:'18px', fontWeight:'bold', paddingBottom:'5px'}} colSpan={21}>{result?.header?.CompanyFullName}</td> 
                          <td colSpan={2}></td> 
                        </tr>
                        <tr> 
                            <td  colSpan={21}> {result?.header?.CompanyAddress} </td> 
                            <td width={132} style={{ padding:'5px'}} colSpan={2} rowSpan={5}>
                                {isImageWorking && (result?.header?.PrintLogo !== "" && 
                                    <img src={result?.header?.PrintLogo} alt="" 
                                    className='w-25 h-auto ms-auto d-block object-fit-contain'
                                    onError={handleImageErrors} width={132} />)}
                            </td>
                        </tr>
                        <tr> <td  colSpan={21}> {result?.header?.CompanyAddress2} </td> </tr>
                        <tr> <td  colSpan={21}> {result?.header?.CompanyCity} - {result?.header?.CompanyPinCode}, {result?.header?.CompanyState} ({result?.header?.CompanyCountry}) </td> </tr>
                        <tr> <td  colSpan={21}>T {result?.header?.CompanyTellNo} | TOLL FREE {result?.header?.CompanyTollFreeNo} </td> </tr>
                        <tr> <td  colSpan={21}> {result?.header?.CompanyEmail} | {result?.header?.CompanyWebsite}</td> </tr>
                        <tr> <td  colSpan={21}> {result?.header?.Company_VAT_GST_No} | {result?.header?.Company_CST_STATE} - {result?.header?.Company_CST_STATE_No} | PAN - {result?.header?.Com_pannumber} </td> </tr>
                        <tr>
                            <td></td>
                        </tr>
                        {/* customer header */}
                        <tr>
                            <th  align='start' style={{borderLeft:'1px solid #e8e8e8', borderTop:'1px solid #e8e8e8', textAlign:'start'}}>TO,</th>
                            <th align='left' colSpan={18} style={{borderTop:'1px solid #e8e8e8'}}>{result?.header?.customerfirmname}</th>
                            <td colSpan={2} style={{borderTop:'1px solid #e8e8e8'}}></td>
                            <th colSpan={2} style={{borderTop:'1px solid #e8e8e8', borderRight:'1px solid #e8e8e8'}}></th>
                        </tr>                       
                        <tr>
                            <td rowSpan={5} style={{borderBottom:'1px solid #e8e8e8', borderLeft:'1px solid #e8e8e8'}}></td>
                            <td colSpan={18}>{result?.header?.customerstreet}</td>
                            <td colSpan={2} >INVOICE#:</td>
                            <th colSpan={2} align='left' style={{borderRight:'1px solid #e8e8e8'}}>{result?.header?.InvoiceNo}</th>
                        </tr>
                        <tr>
                            
                            <td colSpan={18}>{result?.header?.customerregion}</td>
                            <td colSpan={2}>DATE:</td>
                            <th colSpan={2} align='left' style={{borderRight:'1px solid #e8e8e8'}}>&nbsp;{result?.header?.EntryDate}</th>
                        </tr>
                        <tr>
                            
                            <td colSpan={18}>{result?.header?.customercity}{result?.header?.customerpincode}</td>
                            <td colSpan={2}>{result?.header?.HSN_No_Label} :</td>
                            <th colSpan={2} align='left' style={{borderRight:'1px solid #e8e8e8'}}>{result?.header?.HSN_No}</th>
                        </tr>
                        <tr>
                            
                            <td colSpan={18}>Phno: {result?.header?.customermobileno}</td>
                            <td colSpan={2}></td>
                            <th colSpan={2} style={{borderRight:'1px solid #e8e8e8'}}></th>
                        </tr>
                        <tr>
                            <td style={{borderBottom:'1px solid #e8e8e8'}} colSpan={18}>GSTIN : {(result?.header?.CustGstNo === '' ? result?.header?.Cust_VAT_GST_No : result?.header?.CustGstNo)} | {result?.header?.Cust_CST_STATE} - {result?.header?.Cust_CST_STATE_No}  | PAN - {result?.header?.CustPanno}  </td>
                            <td colSpan={2} style={{borderBottom:'1px solid #e8e8e8'}}></td>
                            <th colSpan={2} style={{borderBottom:'1px solid #e8e8e8', borderRight:'1px solid #e8e8e8'}}></th>
                        </tr>
                        <tr>
                            <td></td>
                        </tr>

                        {/* table */}
                        <tr>
                            <th style={{borderLeft:'1px solid #989898',borderTop:'1px solid #989898', backgroundColor:'#F5F5F5'}}>Sr</th>
                            <th style={{borderLeft:'1px solid #989898',borderTop:'1px solid #989898',  backgroundColor:'#F5F5F5'}} colSpan={2}>Design</th>
                            <th style={{borderLeft:'1px solid #989898',borderTop:'1px solid #989898', borderBottom:'1px solid #989898',  backgroundColor:'#F5F5F5'}} colSpan={6}>Diamond</th>
                            <th style={{borderLeft:'1px solid #989898',borderTop:'1px solid #989898', borderBottom:'1px solid #989898',  backgroundColor:'#F5F5F5'}} colSpan={4}>Metal</th>
                            <th style={{borderLeft:'1px solid #989898',borderTop:'1px solid #989898', borderBottom:'1px solid #989898',  backgroundColor:'#F5F5F5'}} colSpan={6}>Stone</th>
                            <th style={{borderLeft:'1px solid #989898',borderTop:'1px solid #989898',   backgroundColor:'#F5F5F5'}} colSpan={1}>Other</th>
                            <th style={{borderLeft:'1px solid #989898',borderTop:'1px solid #989898', borderBottom:'1px solid #989898',  backgroundColor:'#F5F5F5'}} colSpan={2}>Labour</th>
                            <th style={{borderLeft:'1px solid #989898',borderTop:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}} colSpan={1}>Total</th>
                        </tr>
                        <tr>
                            <th style={{borderLeft:'1px solid #989898', borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}></th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}} colSpan={2}></th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}} >Code</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}} >Size</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Pcs</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Wt</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Rate</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Amount</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Quality</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Wt</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Rate</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Amount</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Code</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Size</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Pcs</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Wt</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Rate</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Amount</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Amount</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Rate</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Amount</th>
                            <th style={{borderBottom:'1px solid #989898', borderRight:'1px solid #989898',  backgroundColor:'#F5F5F5'}}>Amount</th>
                        </tr>

                        {
                            result2?.map((e, i) => {
                                return (<React.Fragment key={i}>
                                    <tr>
                                  {/* { e?.srflag && <td width={90} style={{borderRight:'1px solid #989898'}} align='center' rowSpan={e?.srRowSpan + 1} >&nbsp;{e?.sr}</td>} */}
                                        <td width={90} style={{borderRight:'1px solid #989898'}} align='center' >&nbsp;{e?.sr}</td>
                                        <td width={120} style={{wordBreak:'break-word'}}>&nbsp;{e?.designno}</td>
                                        <td width={120} align='right' style={{borderRight:'1px solid #989898', wordBreak:'break-word', paddingRight:'5px'}}>&nbsp;{e?.SrJobno}&nbsp;</td>
                                        <td width={140} align='left' >&nbsp;{e?.dia_code}</td>
                                        <td width={140} align='left'>&nbsp;{`${e?.dia_size}`}</td>
                                        <td width={90} align='right'>{e?.dia_pcs}</td>
                                        <td width={90} align='right'>{( e?.dia_wt === '' ? '' : (+e?.dia_wt)?.toFixed(3))}</td>
                                        <td width={90} align='right'>{( e?.dia_rate === '' ? '' : formatAmount(e?.dia_rate))}</td>
                                        <th align='right' width={90} style={{borderRight:'1px solid #989898'}}>{ e?.dia_amt === '' ? '' : formatAmount(e?.dia_amt)}</th>
                                        <td width={140}  style={{wordBreak:'break-word'}} align='left'>&nbsp;{`${e?.met_quality}`}</td>
                                        <td width={90} align='right'>{((+e?.met_wt)?.toFixed(3))}</td>
                                        <td width={90} align='right'>{formatAmount(e?.met_rate)}</td>
                                        <th align='right' width={90} style={{borderRight:'1px solid #989898'}}>{e?.met_amt}</th>
                                        <td width={140} align='left'>&nbsp;{e?.cls_code}</td>
                                        <td width={140} align='left'>&nbsp;{`${e?.cls_size}`}</td>
                                        <td width={90} align='right'>{e?.cls_pcs}</td>
                                        <td width={90} align='right'>{( e?.cls_wt === '' ? '' : ((+e?.cls_wt)?.toFixed(3)))}</td>
                                        <td width={90} align='right'>{( e?.cls_rate === '' ? '' :  formatAmount(e?.cls_rate))}</td>
                                        <th align='right' width={90} style={{borderRight:'1px solid #989898'}}>{ e?.cls_amt === '' ? '' : (e?.cls_amt)}</th>
                                        <td width={90} align='right' style={{borderRight:'1px solid #989898'}}>{ e?.oth_amt === 0 ? '' : formatAmount(e?.oth_amt)}</td>
                                        <td width={90} align='right' style={{borderRight:'1px solid #989898'}}>{ e?.labour_rate === 0 ? '' :  formatAmount(e?.labour_rate)}</td>
                                        <td width={90} align='right' style={{borderRight:'1px solid #989898'}}>{formatAmount(e?.labour_amt)}</td>
                                        <th align='right' width={90} style={{borderRight:'1px solid #989898'}}>{formatAmount(e?.total_amount)}</th>
                                    </tr>
                                    {/* dia clr materail */}
                                    
                                    {
                                        e?.matrialArr?.map((val, ind) => {
                                          
                                            return <tr key={ind}>
                                                <td width={90} style={{borderRight:'1px solid #989898'}} align='center' >&nbsp;</td>
                                                <td  colSpan={2} style={{borderRight:'1px solid #989898', verticalAlign:'center'}} align='center'>
                                                    <span style={{textAlign:'center'}}>{val?.imgflag && <img src={val?.img} alt=""  onError={eve => handleGlobalImgError(eve, result?.header?.DefImage)} width={70}  style={{ paddingLeft: "10px", objectFit: "contain", verticalAlign:'center' }} />}</span>
                                                    <div style={{textAlign:'center'}}>{val?.tunchflag && `Tunch : `} <b>{val?.tunchflag && val?.tunch}</b></div>
                                                    <div style={{textAlign:'center'}}><b>{val?.grosswetflag && val?.grosswt}</b> {val?.grosswetflag && <span><b>gm</b> Gross</span>}</div>
                                                </td>
                                                {/* <td width={90}></td> */}
                                                <td width={90} align='left'>&nbsp;{ val?.diaflag && `${val?.dia_code}`}</td>
                                                <td width={90} align='left'>&nbsp;{val?.diaflag && `${val?.dia_size}`}</td>
                                                <td width={90} align='right'>{val?.diaflag && val?.dia_pcs}</td>
                                                <td width={90} align='right'>{val?.diaflag && (+(val?.dia_wt))?.toFixed(3)}</td>
                                                <td width={90} align='right'>{val?.diaflag && ( val?.dia_rate === '' ? '' : formatAmount(val?.dia_rate))}</td>
                                                <th width={90} style={{borderRight:'1px solid #989898'}} align='right'>{val?.diaflag && (val?.dia_amt)}</th>
                                                <th width={90} colSpan={val?.jobRemarkflag && 4} style={{borderRight:`${val?.jobRemarkflag && '1px solid #989898'}`}} align='left'>&nbsp;{val?.jobRemarkflag && (` Remark :  ${val?.JobRemark}`)}</th>
                                                {val?.jobRemarkflag ? '' : <td width={90}></td>} 
                                                {val?.jobRemarkflag ? '' : <td width={90}></td>}
                                                {val?.jobRemarkflag ? '' : <td width={90} style={{borderRight:'1px solid #989898'}}></td>}
                                                <td width={90} align='left'>&nbsp;{val?.clsflag && `${val?.cls_code}`}</td>
                                                <td width={90} align='left'>&nbsp;{val?.clsflag && `${val?.cls_size}`}</td>
                                                <td width={90} align='right'>{val?.clsflag && val?.cls_pcs}</td>
                                                <td width={90} align='right'>{val?.clsflag && ((+val?.cls_wt))?.toFixed(3)}</td>
                                                <td width={90} align='right'>{val?.clsflag && ( val?.cls_rate === '' ? '' : formatAmount(val?.cls_rate))}</td>
                                                <th width={90} style={{borderRight:'1px solid #989898'}} align='right'>{(val?.clsflag ) && formatAmount(val?.cls_amt)}</th>
                                                <td width={90} style={{borderRight:'1px solid #989898'}}></td>
                                                <td width={90} style={{borderRight:'1px solid #989898'}}></td>
                                                <td width={90} style={{borderRight:'1px solid #989898'}}></td>
                                                <td width={90} style={{borderRight:'1px solid #989898'}}></td>
                                            </tr>
                                        })
                                    }
                                    {/* job wise total */}
                                    <tr>
                                        <td style={{borderRight:'1px solid #989898', borderBottom:'1px solid #989898'}}></td>
                                        <td style={{borderRight:'1px solid #989898', borderBottom:'1px solid #989898'}}
                                         align='center' colSpan={2}>{ e?.values?.CertificateNo === '' ? '' : 'Cert#'}<b>{e?.values?.CertificateNo === '' ? '' : e?.values?.CertificateNo}</b></td>
                                        {/* <td align='center' ><td></td></td> */}
                                        {/* diamonds */}
                                        <td style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}></td>
                                        <td style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}></td>
                                        <th align='right' style={{backgroundColor:'#F5F5F5',borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}>
                                          {e?.values?.totals?.diamonds?.Pcs === 0 ? '' : e?.values?.totals?.diamonds?.Pcs}</th>
                                        <th align='right' style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}>
                                          { e?.values?.totals?.diamonds?.Wt === 0 ? '' : (e?.values?.totals?.diamonds?.Wt)?.toFixed(3)}</th>
                                        {/* <td>{((e?.values?.totals?.diamonds?.Amount / (e?.values?.totals?.diamonds?.Wt === 0 ? 1 : e?.values?.totals?.diamonds?.Wt)))}</td> */}
                                        <th align='right' style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}></th>
                                        <th align='right' style={{borderRight:'1px solid #989898', backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}>
                                          { e?.values?.totals?.diamonds?.Amount === 0 ? '' : formatAmount((e?.values?.totals?.diamonds?.Amount))}</th>
                                        <th align='right' style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}></th>
                                        {/* <td>{e?.values?.totals?.metal?.IsPrimaryMetal}</td> */}
                                        <th align='right' style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}>{ e?.met_wt === 0 ? '' : ((e?.met_wt)?.toFixed(3))}</th>
                                        <td style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}></td>
                                        <th align='right' style={{borderRight:'1px solid #989898', backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}>{e?.met_amt === 0 ? '' : e?.met_amt}</th>
                                        <td align='right' style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}></td>
                                        <td align='right' style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}></td>
                                        <th align='right' style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}>{(e?.values?.totals?.colorstone?.Pcs + e?.values?.totals?.misc?.onlyIsHSCODE0_Pcs) === 0 ? '' : (e?.values?.totals?.colorstone?.Pcs + e?.values?.totals?.misc?.onlyIsHSCODE0_Pcs)}</th>
                                        <th align='right' style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}>{(e?.values?.totals?.colorstone?.Wt + e?.values?.totals?.misc?.onlyIsHSCODE0_Wt) === 0 ? '' : (e?.values?.totals?.colorstone?.Wt + e?.values?.totals?.misc?.onlyIsHSCODE0_Wt)?.toFixed(3)}</th>
                                        <td align='right' style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}></td>
                                        <th align='right' style={{borderRight:'1px solid #989898', backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}>{ e?.values?.totals?.colorstone?.Amount === 0 ? '' : formatAmount(((e?.values?.totals?.colorstone?.Amount + e?.values?.totals?.misc?.onlyIsHSCODE0_Amount)))}</th>
                                        <th align='right' style={{borderRight:'1px solid #989898', backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}>{e?.oth_amt === 0 ? '' : formatAmount(e?.oth_amt)}</th>
                                        <td align='right' style={{borderRight:'1px solid #989898', backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}></td>
                                        <th align='right' style={{borderRight:'1px solid #989898', backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}>{ e?.labour_amt === 0 ? '' : formatAmount(e?.labour_amt)}</th>
                                        <th align='right' style={{borderRight:'1px solid #989898', backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898',borderLeft:'1px solid #e8e8e8'}}>{ e?.total_amount === 0 ? '' : formatAmount(e?.total_amount)}</th>
                                    </tr>
                                    </React.Fragment>
                                )
                            })
                        }
                        {/* taxes */}
                        {
                            result?.allTaxes?.map((e, i) => {
                                return <tr key={i}>
                                            <td colSpan={20}></td>
                                            <td colSpan={2}>{e?.name} @ {e?.per}</td>
                                            <td align='right' style={{borderRight:'1px solid #989898'}}>{formatAmount(((+e?.amount) * result?.header?.CurrencyExchRate))}</td>
                                       </tr>
                            })
                        }
                                        <tr>
                                            <td colSpan={20}></td>
                                            <td colSpan={2}>{result?.header?.AddLess > 0 ? 'Add' : 'Less'}</td>
                                            <td align='right' style={{borderRight:'1px solid #989898'}}>{formatAmount(result?.header?.AddLess)}</td>
                                       </tr>
                        {/* main total */}
                        <tr>
                                <th align='center' style={{borderRight:'1px solid #989898', borderBottom:'1px solid #989898', borderTop:'1px solid #989898', borderLeft:'1px solid #989898', backgroundColor:'#F5F5F5'}} colSpan={3}>TOTAL</th>
                                <td style={{backgroundColor:'#F5F5F5', borderBottom:'1px solid #989898', borderTop:'1px solid #989898'}}></td>
                                <td style={{backgroundColor:'#F5F5F5',borderTop:'1px solid #989898', borderBottom:'1px solid #989898'}}></td>
                                <th style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898'}} align='right'>{result?.mainTotal?.diamonds?.Pcs === 0 ? '' : result?.mainTotal?.diamonds?.Pcs}</th>
                                <th style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898'}} align='right'>{ result?.mainTotal?.diamonds?.Wt === 0 ? '' : result?.mainTotal?.diamonds?.Wt?.toFixed(3)}</th>
                                <td style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898'}}></td>
                                <th style={{borderRight:'1px solid #989898', borderTop:'1px solid #989898', backgroundColor:'#F5F5F5', borderBottom:'1px solid #989898'}} align='right'>{ result?.mainTotal?.diamonds?.Amount === 0 ? '' : formatAmount(result?.mainTotal?.diamonds?.Amount)}</th>
                                <td style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898'}}></td>
                                <th style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898'}} align='right'>{ result?.mainTotal?.netwt === 0 ? '' : result?.mainTotal?.netwt?.toFixed(3)}</th>
                                <td style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898'}}></td>
                                <th style={{borderRight:'1px solid #989898', borderTop:'1px solid #989898', backgroundColor:'#F5F5F5', borderBottom:'1px solid #989898'}} align='right'>{ result?.mainTotal?.MetalAmount === 0 ? '' : formatAmount(result?.mainTotal?.MetalAmount)}</th>
                                <td style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898'}}></td>
                                <td style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898'}}></td>
                                <th style={{backgroundColor:'#F5F5F5',borderTop:'1px solid #989898',  borderBottom:'1px solid #989898'}} align='right'>{(result?.mainTotal?.colorstone?.Pcs + result?.mainTotal?.misc?.onlyIsHSCODE0_Pcs) === 0 ? '' : ((result?.mainTotal?.colorstone?.Pcs + result?.mainTotal?.misc?.onlyIsHSCODE0_Pcs))}</th>
                                <th style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898'}} align='right'>{(result?.mainTotal?.colorstone?.Wt + result?.mainTotal?.misc?.onlyIsHSCODE0_Wt) === 0 ? '' : (result?.mainTotal?.colorstone?.Wt + result?.mainTotal?.misc?.onlyIsHSCODE0_Wt)?.toFixed(3)}</th>
                                <td style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898'}}></td>
                                <th style={{borderRight:'1px solid #989898', borderTop:'1px solid #989898', backgroundColor:'#F5F5F5', borderBottom:'1px solid #989898'}} align='right'>{ (result?.mainTotal?.colorstone?.Amount + result?.mainTotal?.misc?.onlyIsHSCODE0_Amount) === 0 ? '' :  formatAmount((result?.mainTotal?.colorstone?.Amount + result?.mainTotal?.misc?.onlyIsHSCODE0_Amount))}</th>
                                <th style={{borderRight:'1px solid #989898', borderTop:'1px solid #989898', backgroundColor:'#F5F5F5', borderBottom:'1px solid #989898'}} align='right'>{ (result?.mainTotal?.total_other + result?.mainTotal?.total_diamondHandling) === 0 ? '' :  formatAmount((result?.mainTotal?.total_other + result?.mainTotal?.total_diamondHandling + result?.mainTotal?.totalMiscAmount))}</th>
                                <td style={{backgroundColor:'#F5F5F5', borderTop:'1px solid #989898', borderBottom:'1px solid #989898', borderRight:'1px solid #989898'}}></td>
                                <th style={{borderRight:'1px solid #989898', borderTop:'1px solid #989898', backgroundColor:'#F5F5F5', borderBottom:'1px solid #989898'}} align='right'>{ (result?.mainTotal?.total_Making_Amount + result?.mainTotal?.diamonds?.SettingAmount + result?.mainTotal?.colorstone?.SettingAmount) === 0 ? '' : formatAmount((result?.mainTotal?.total_Making_Amount + result?.mainTotal?.diamonds?.SettingAmount + result?.mainTotal?.colorstone?.SettingAmount))}</th>
                                <th style={{borderRight:'1px solid #989898', borderTop:'1px solid #989898', backgroundColor:'#F5F5F5', borderBottom:'1px solid #989898'}} align='right'>{ (result?.mainTotal.total_amount + result?.header?.AddLess + (result?.allTaxesTotal * result?.header?.CurrencyExchRate)) === 0 ? '' :  formatAmount((result?.mainTotal.total_amount + result?.header?.AddLess + (result?.allTaxesTotal * result?.header?.CurrencyExchRate)))}</th>
                        </tr>
                        <tr>
                            <th colSpan={6} style={{backgroundColor:'#F5F5F5', borderLeft:'1px solid #989898', borderRight:'1px solid #989898', borderBottom:'1px solid #989898'}}>SUMMARY</th>
                            <th colSpan={4} style={{backgroundColor:'#F5F5F5', borderLeft:'1px solid #989898', borderRight:'1px solid #989898', borderBottom:'1px solid #989898'}}>Diamond Detail</th>
                            <th colSpan={3} style={{backgroundColor:'#F5F5F5', borderLeft:'1px solid #989898', borderRight:'1px solid #989898', borderBottom:'1px solid #989898'}}>Summary Detail</th>
                            <th colSpan={3} style={{backgroundColor:'#F5F5F5', borderLeft:'1px solid #989898', borderRight:'1px solid #989898', borderBottom:'1px solid #989898'}}>Remark</th>
                        </tr>

                            {
                                rowWise?.map((e, i) => {
                                    return  <tr key={i}>
                                                <th align='left' width={100}>{e?.grosswt_name}</th>
                                                <td align='right' colSpan={2} style={{borderRight:'1px solid #989898'}}>
                                                  {e?.grosswt_value} {e?.grosswt_value === '' ? '' : `${(e?.grosswt_name === 'STONE WT' || e?.grosswt_name === 'DIAMOND WT') ? 'cts' : 'gms'}`}
                                                </td>
                                                <th align='left' style={{borderTop:`${ i === 7 ? '1px solid #989898' : ''}`, borderBottom:`${ i === 7 ? '1px solid #989898' : ''}`, borderRight:`${ i === 7 ? '1px solid #989898' : ''}`,backgroundColor:`${ i === 7 ? 'rgb(245, 245, 245)' : ''}` }}>
                                                  {e?.name}
                                                </th>
                                                <td colSpan={2} align='right' style={{borderRight:'1px solid #989898',borderBottom:`${ i === 7 ? '1px solid #989898' : ''}`, borderTop:`${ i === 7 ? '1px solid #989898' : ''}`, backgroundColor:`${ i === 7 ? 'rgb(245, 245, 245)' : ''}`, fontWeight:`${ i === 7 ? 'bold' : ''}`}}>
                                                  {e?.value}
                                                </td>
                                                <th colSpan={2} align='left'>{e?.dia_info_name}</th>
                                                <td colSpan={2} align='right'>{(e?.dia_info_value)} {e?.dia_info_value === '' ? '' : 'cts'}</td>
                                                <td colSpan={2} align='left' style={{borderLeft:'1px solid #989898'}}>{e?.sum_info_name}</td>
                                                <th align='center' style={{borderRight:'1px solid #989898'}}>&nbsp;{e?.sum_info_value}</th>
                                                 { e?.remark === '' ? '' : <td colSpan={3} style={{borderBottom:'1px solid #989899',  borderRight:'1px solid #989898'}}>{e?.remark}</td> } 
                                            </tr>
                                })
                            }
                        
                        <tr><td style={{borderTop:'1px solid #989898', borderLeft:'1px solid #989898', borderRight:'1px solid #989898'}}  colSpan={23}><b>NOTE:</b></td></tr>
                        <tr><td style={{border:'1px solid #989898', borderTop:'0px'}} colSpan={23} align='left' ><div className='w-100' dangerouslySetInnerHTML={{__html:result?.header?.Declaration}}></div></td></tr>
                        
                    
                    </tbody>
                </table> 
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

export default TaxInvoiceExcel