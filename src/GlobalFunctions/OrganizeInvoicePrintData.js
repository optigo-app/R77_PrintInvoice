import { cloneDeep } from "lodash";
import { ToWords } from "to-words";
import { CapitalizeWords, otherAmountDetail, taxGenrator } from "../GlobalFunctions";
import { numberToWords } from 'number-to-words';

export const OrganizeInvoicePrintData = (headerJson, JobwiseJson, materialJson) => {

    const toWords = new ToWords();

    let header = cloneDeep(headerJson);
    let json1 = cloneDeep(JobwiseJson);
    let json2 = cloneDeep(materialJson);

    let addressLine = header?.Printlable?.split("\r\n");

    let resultArray = [];

    let mainTotal = {
        grosswt:0,
        NetWt:0,
        convertednetwt:0,
        Wastage:0,
        UnitCost:0,
        TotalAmount:0,
        PureNetWt:0,
        PackageWt:0,
        PriorityCharges:0,
        Quantity:0,
        OtherCharges:0,
        MiscAmount:0,
        MetalWeight:0,
        MetalDiaWt:0,
        MetalAmount:0,
        MakingAmount:0,
        MaKingCharge_Unit:0,
        LossWt:0,
        LossPer:0,
        LossAmt:0,
        Discount:0,
        DiscountAmt:0,
        DiamondAmount:0,
        CsAmount:0,
        TotalSolSetcost:0,
        TotalDiamondHandling:0,
        TotalCsSetcost:0,
        TotalDiaSetcost:0,

        diamonds : {
            Wt:0,
            Pcs:0,
            Rate:0,
            rate:0,
            Amount:0,
            SettingAmount:0,
        },
        solitaire : {
            Wt:0,
            Pcs:0,
            Rate:0,
            rate:0,
            Amount:0,
            SettingAmount:0,
        },

        colorstone:{
            Wt:0,
            Pcs:0,
            Rate:0,
            rate:0,
            Amount:0,
            SettingAmount:0,
        },

        gemstone:{
            Wt:0,
            Pcs:0,
            Rate:0,
            rate:0,
            Amount:0,
            SettingAmount:0,
        },

        
        metal:{
            Wt: 0,
            Pcs: 0,
            Rate: 0,
            FineWt: 0,
            Amount: 0,
            SettingAmount: 0,

            IsPrimaryMetalWt: 0,
            IsNotPrimaryMetalWt:0,

            IsPrimaryMetalAmount: 0,
            IsNotPrimaryMetalAmount:0,

            IsPrimaryMetalPcs: 0,
            IsNotPrimaryMetalPcs:0,

            IsPrimaryMetalSettingAmount: 0,
            IsNotPrimaryMetalSettingAmount:0,
        },

        misc:{
            Wt:0,
            Pcs:0,
            Rate:0,
            rate:0,
            Amount:0,
            SettingAmount:0,
            ServWt:0,

            IsHSCODE_0_wt:0,
            IsHSCODE_0_ServeWt:0,
            IsHSCODE_0_pcs:0,
            IsHSCODE_0_amount:0,
            IsHSCODE_0_SettingAmount:0,

            IsHSCODE_1_wt:0,
            IsHSCODE_1_ServeWt:0,
            IsHSCODE_1_pcs:0,
            IsHSCODE_1_amount:0,
            IsHSCODE_1_SettingAmount:0,

            IsHSCODE_2_wt:0,
            IsHSCODE_2_ServeWt:0,
            IsHSCODE_2_pcs:0,
            IsHSCODE_2_amount:0,
            IsHSCODE_2_SettingAmount:0,

            IsHSCODE_3_wt:0,
            IsHSCODE_3_ServeWt:0,
            IsHSCODE_3_pcs:0,
            IsHSCODE_3_amount:0,
            IsHSCODE_3_SettingAmount:0,
            
            IsHSCODE_123_wt:0,
            IsHSCODE_123_ServeWt:0,
            IsHSCODE_123_pcs:0,
            IsHSCODE_123_amount:0,
            IsHSCODE_123_SettingAmount:0,

            IsHSCODE_03_wt:0,
            IsHSCODE_03_ServeWt:0,
            IsHSCODE_03_pcs:0,
            IsHSCODE_03_amount:0,
            IsHSCODE_03_SettingAmount:0,
        },

        finding:{
            Wt:0,
            Pcs:0,
            Rate:0,
            rate:0,
            Amount:0,
            SettingAmount:0,
            SettingRate:0,
            FineWt:0
        }

    }

    json1?.forEach((j1) => {
        let j1obj = cloneDeep(j1);
        let diamondList = [];
        let colorstoneList = [];
        let miscList = [];
        let misc_0List = [];
        let misc_1List = [];
        let misc_2List = [];
        let misc_3List = [];
        let misc_03List = [];
        let misc_123List = [];
        let isRateOnPcsMisc_0List = [];
        let isRateOnPcsMisc_1List = [];
        let metalList = [];
        let findingList = [];

        let metal_rate = 0;
        let metal_finewt = 0;
        let finding_customer_wt = 0;
        let specialFinding = null;

        let perjobTotal = {
            
            diamonds : {
                Wt:0,
                Pcs:0,
                Rate:0,
                rate:0,
                Amount:0,
                SettingAmount:0,
            },
    
            colorstone:{
                Wt:0,
                Pcs:0,
                Rate:0,
                rate:0,
                Amount:0,
                SettingAmount:0,
            },
    
            metal:{
                Wt: 0,
                Pcs: 0,
                Rate: 0,
                FineWt: 0,
                Amount: 0,
                SettingAmount: 0,

                IsPrimaryMetalWt: 0,
                IsNotPrimaryMetalWt:0,
                
                IsPrimaryMetalAmount: 0,
                IsNotPrimaryMetalAmount:0,

                IsPrimaryMetalPcs: 0,
                IsNotPrimaryMetalPcs:0,
    
                IsPrimaryMetalSettingAmount: 0,
                IsNotPrimaryMetalSettingAmount:0,

            },
    
            misc:{
                Wt:0,
                Pcs:0,
                Rate:0,
                rate:0,
                Amount:0,
                SettingAmount:0,
                ServWt:0,
    
                IsHSCODE_0_wt:0,
                IsHSCODE_0_ServeWt:0,
                IsHSCODE_0_pcs:0,
                IsHSCODE_0_amount:0,
                IsHSCODE_0_SettingAmount:0,
    
                IsHSCODE_1_wt:0,
                IsHSCODE_1_ServeWt:0,
                IsHSCODE_1_pcs:0,
                IsHSCODE_1_amount:0,
                IsHSCODE_1_SettingAmount:0,
    
                IsHSCODE_2_wt:0,
                IsHSCODE_2_ServeWt:0,
                IsHSCODE_2_pcs:0,
                IsHSCODE_2_amount:0,
                IsHSCODE_2_SettingAmount:0,
    
                IsHSCODE_3_wt:0,
                IsHSCODE_3_ServeWt:0,
                IsHSCODE_3_pcs:0,
                IsHSCODE_3_amount:0,
                IsHSCODE_3_SettingAmount:0,
                
                IsHSCODE_123_wt:0,
                IsHSCODE_123_ServeWt:0,
                IsHSCODE_123_pcs:0,
                IsHSCODE_123_amount:0,
                IsHSCODE_123_SettingAmount:0,
    
                // IsHSCODE_03_wt:0,
                // IsHSCODE_03_ServeWt:0,
                // IsHSCODE_03_pcs:0,
                // IsHSCODE_03_amount:0,
                // IsHSCODE_03_SettingAmount:0,
            },
    
            finding:{
                Wt:0,
                Pcs:0,
                Rate:0,
                rate:0,
                Amount:0,
                SettingAmount:0,
                SettingRate:0,
                FineWt:0
            }
        }
        
        mainTotal.CsAmount += j1?.CsAmount;
        mainTotal.DiamondAmount += j1?.DiamondAmount;
        mainTotal.Discount += j1?.Discount;
        mainTotal.DiscountAmt += j1?.DiscountAmt;
        mainTotal.LossAmt += j1?.LossAmt;
        mainTotal.LossPer += j1?.LossPer;
        mainTotal.LossWt += j1?.LossWt;
        mainTotal.MaKingCharge_Unit += j1?.MaKingCharge_Unit;
        mainTotal.MakingAmount += j1?.MakingAmount;
        mainTotal.MetalAmount += j1?.MetalAmount;
        mainTotal.MetalDiaWt += j1?.MetalDiaWt;
        mainTotal.MetalWeight += j1?.MetalWeight;
        mainTotal.MiscAmount += j1?.MiscAmount;
        mainTotal.OtherCharges += j1?.OtherCharges;
        mainTotal.PackageWt += j1?.PackageWt;
        mainTotal.PriorityCharges += j1?.PriorityCharges;
        mainTotal.PureNetWt += j1?.PureNetWt;
        mainTotal.Quantity += j1?.Quantity;
        mainTotal.TotalAmount += j1?.TotalAmount;
        mainTotal.TotalCsSetcost += j1?.TotalCsSetcost;
        mainTotal.TotalDiaSetcost += j1?.TotalDiaSetcost;
        mainTotal.TotalDiamondHandling += j1?.TotalDiamondHandling;
        mainTotal.TotalSolSetcost += j1?.TotalSolSetcost;
        mainTotal.UnitCost += j1?.UnitCost;
        mainTotal.Wastage += j1?.Wastage;
        mainTotal.grosswt += j1?.grosswt;
        mainTotal.NetWt += j1?.NetWt;
        mainTotal.convertednetwt += j1?.convertednetwt;

        json2?.forEach((j2) => {
            let obj2 = cloneDeep(j2);
            if(j1obj?.SrJobno === obj2?.StockBarcode){

                if(obj2?.MasterManagement_DiamondStoneTypeid === 1){

                    diamondList.push(j2);

                    perjobTotal.diamonds.Amount += obj2?.Amount;
                    perjobTotal.diamonds.Rate = obj2?.Rate;
                    perjobTotal.diamonds.rate += obj2?.Rate;
                    perjobTotal.diamonds.Pcs += obj2?.Pcs;
                    perjobTotal.diamonds.Wt += obj2?.Wt;
                    perjobTotal.diamonds.SettingAmount += obj2?.SettingAmount;

                    mainTotal.diamonds.Amount += obj2?.Amount;
                    mainTotal.diamonds.Rate = obj2?.Rate;
                    mainTotal.diamonds.rate += obj2?.Rate;
                    mainTotal.diamonds.Pcs += obj2?.Pcs;
                    mainTotal.diamonds.Wt += obj2?.Wt;
                    mainTotal.diamonds.SettingAmount += obj2?.SettingAmount;

                }
                if(j2?.MasterManagement_DiamondStoneTypeid === 1 && j2?.IsSolGem === 1){
                    mainTotal.solitaire.Wt += j2?.Wt;
                    mainTotal.solitaire.Pcs += j2?.Pcs;
                    mainTotal.solitaire.Rate += j2?.Rate;
                    mainTotal.solitaire.Amount += j2?.Amount;
                    mainTotal.solitaire.SettingAmount += +j2?.SettingAmount;
                    
                  }


                if(obj2?.MasterManagement_DiamondStoneTypeid === 2){

                    colorstoneList.push(j2);

                    perjobTotal.colorstone.Amount += obj2?.Amount;
                    perjobTotal.colorstone.Rate = obj2?.Rate;
                    perjobTotal.colorstone.rate += obj2?.Rate;
                    perjobTotal.colorstone.Pcs += obj2?.Pcs;
                    perjobTotal.colorstone.Wt += obj2?.Wt;
                    perjobTotal.colorstone.SettingAmount += obj2?.SettingAmount;

                    mainTotal.colorstone.Amount += obj2?.Amount;
                    mainTotal.colorstone.Rate = obj2?.Rate;
                    mainTotal.colorstone.rate += obj2?.Rate;
                    mainTotal.colorstone.Pcs += obj2?.Pcs;
                    mainTotal.colorstone.Wt += obj2?.Wt;
                    mainTotal.colorstone.SettingAmount += obj2?.SettingAmount;
                    
                }
                if(j2?.MasterManagement_DiamondStoneTypeid === 2 && j2?.IsSolGem === 1){
                    mainTotal.gemstone.Wt += j2?.Wt;
                    mainTotal.gemstone.Pcs += j2?.Pcs;
                    mainTotal.gemstone.Rate += j2?.Rate;
                    mainTotal.gemstone.Amount += j2?.Amount;
                    mainTotal.gemstone.SettingAmount += +j2?.SettingAmount;
                    
                  }
                if(obj2?.MasterManagement_DiamondStoneTypeid === 3){
                    
                    miscList.push(j2);

                    perjobTotal.misc.Amount += obj2?.Amount;
                    perjobTotal.misc.Rate = obj2?.Rate;
                    perjobTotal.misc.rate += obj2?.Rate;
                    perjobTotal.misc.Pcs += obj2?.Pcs;
                    perjobTotal.misc.Wt += obj2?.Wt;
                    perjobTotal.misc.SettingAmount += obj2?.SettingAmount;

                    mainTotal.misc.Amount += obj2?.Amount;
                    mainTotal.misc.Rate = obj2?.Rate;
                    mainTotal.misc.rate += obj2?.Rate;
                    mainTotal.misc.Pcs += obj2?.Pcs;
                    mainTotal.misc.Wt += obj2?.Wt;
                    mainTotal.misc.SettingAmount += obj2?.SettingAmount;

                    if(obj2?.IsHSCOE === 0){

                        misc_0List.push(j2);

                        perjobTotal.misc.IsHSCODE_0_wt += obj2?.Wt;
                        perjobTotal.misc.IsHSCODE_0_pcs += obj2?.Pcs;
                        perjobTotal.misc.IsHSCODE_0_amount += obj2?.Amount;
                        perjobTotal.misc.IsHSCODE_0_SettingAmount += obj2?.SettingAmount;
                        perjobTotal.misc.IsHSCODE_0_ServeWt += obj2?.ServWt;

                        mainTotal.misc.IsHSCODE_0_wt += obj2?.Wt;
                        mainTotal.misc.IsHSCODE_0_pcs += obj2?.Pcs;
                        mainTotal.misc.IsHSCODE_0_amount += obj2?.Amount;
                        mainTotal.misc.IsHSCODE_0_SettingAmount += obj2?.SettingAmount;
                        mainTotal.misc.IsHSCODE_0_ServeWt += obj2?.ServWt;

                    }

                    if(obj2?.IsHSCOE === 1){

                        misc_1List.push(j2);

                        perjobTotal.misc.IsHSCODE_1_wt += obj2?.Wt;
                        perjobTotal.misc.IsHSCODE_1_pcs += obj2?.Pcs;
                        perjobTotal.misc.IsHSCODE_1_amount += obj2?.Amount;
                        perjobTotal.misc.IsHSCODE_1_SettingAmount += obj2?.SettingAmount;
                        perjobTotal.misc.IsHSCODE_1_ServeWt += obj2?.ServWt;

                        mainTotal.misc.IsHSCODE_1_wt += obj2?.Wt;
                        mainTotal.misc.IsHSCODE_1_pcs += obj2?.Pcs;
                        mainTotal.misc.IsHSCODE_1_amount += obj2?.Amount;
                        mainTotal.misc.IsHSCODE_1_SettingAmount += obj2?.SettingAmount;
                        mainTotal.misc.IsHSCODE_1_ServeWt += obj2?.ServWt;

                    }
                    if(obj2?.IsHSCOE === 2){

                        misc_2List.push(j2);

                        perjobTotal.misc.IsHSCODE_2_wt += obj2?.Wt;
                        perjobTotal.misc.IsHSCODE_2_pcs += obj2?.Pcs;
                        perjobTotal.misc.IsHSCODE_2_amount += obj2?.Amount;
                        perjobTotal.misc.IsHSCODE_2_SettingAmount += obj2?.SettingAmount;
                        perjobTotal.misc.IsHSCODE_2_ServeWt += obj2?.ServWt;

                        mainTotal.misc.IsHSCODE_2_wt += obj2?.Wt;
                        mainTotal.misc.IsHSCODE_2_pcs += obj2?.Pcs;
                        mainTotal.misc.IsHSCODE_2_amount += obj2?.Amount;
                        mainTotal.misc.IsHSCODE_2_SettingAmount += obj2?.SettingAmount;
                        mainTotal.misc.IsHSCODE_2_ServeWt += obj2?.ServWt;

                    }
                    if(obj2?.IsHSCOE === 3){

                        misc_3List.push(j2);

                        perjobTotal.misc.IsHSCODE_3_wt += obj2?.Wt;
                        perjobTotal.misc.IsHSCODE_3_pcs += obj2?.Pcs;
                        perjobTotal.misc.IsHSCODE_3_amount += obj2?.Amount;
                        perjobTotal.misc.IsHSCODE_3_SettingAmount += obj2?.SettingAmount;
                        perjobTotal.misc.IsHSCODE_3_ServeWt += obj2?.ServWt;

                        mainTotal.misc.IsHSCODE_3_wt += obj2?.Wt;
                        mainTotal.misc.IsHSCODE_3_pcs += obj2?.Pcs;
                        mainTotal.misc.IsHSCODE_3_amount += obj2?.Amount;
                        mainTotal.misc.IsHSCODE_3_SettingAmount += obj2?.SettingAmount;
                        mainTotal.misc.IsHSCODE_3_ServeWt += obj2?.ServWt;

                    }
                  
                    if(j2?.isRateOnPcs === 0){
                        
                        isRateOnPcsMisc_0List.push(j2);
                        

                    }
                    if(j2?.isRateOnPcs === 1){

                        isRateOnPcsMisc_1List.push(j2);

                    }

                }
                if(j2?.MasterManagement_DiamondStoneTypeid === 4){

                    metalList.push(j2);

                    perjobTotal.metal.Amount += j2?.Amount;
                    perjobTotal.metal.Rate = j2?.Rate;
                    perjobTotal.metal.Pcs += j2?.Pcs;
                    perjobTotal.metal.Wt += j2?.Wt;
                    perjobTotal.metal.FineWt += j2?.FineWt;
                    perjobTotal.metal.SettingAmount += j2?.SettingAmount;

                    mainTotal.metal.Amount += j2?.Amount;
                    mainTotal.metal.Rate = j2?.Rate;
                    mainTotal.metal.Pcs += j2?.Pcs;
                    mainTotal.metal.Wt += j2?.Wt;
                    mainTotal.metal.FineWt += j2?.FineWt;
                    mainTotal.metal.SettingAmount += j2?.SettingAmount;

                    metal_rate += j2?.Rate;
                    metal_finewt += j2?.FineWt;

                    if(j2?.IsPrimaryMetal === 1){

                        perjobTotal.metal.IsPrimaryMetalAmount += j2?.Amount;
                        perjobTotal.metal.IsPrimaryMetalWt += j2?.Wt;
                        perjobTotal.metal.IsPrimaryMetalPcs += j2?.Pcs;
                        perjobTotal.metal.IsPrimaryMetalSettingAmount += j2?.SettingAmount;
                     
    
                        mainTotal.metal.IsPrimaryMetalAmount += j2?.Amount;
                        mainTotal.metal.IsPrimaryMetalWt += j2?.Wt;
                        mainTotal.metal.IsPrimaryMetalPcs += j2?.Pcs;
                        mainTotal.metal.IsPrimaryMetalSettingAmount += j2?.SettingAmount;

                    }else{

                        perjobTotal.metal.IsNotPrimaryMetalAmount += j2?.Amount;
                        perjobTotal.metal.IsNotPrimaryMetalWt += j2?.Wt;
                        perjobTotal.metal.IsNotPrimaryMetalPcs += j2?.Pcs;
                        perjobTotal.metal.IsNotPrimaryMetalSettingAmount += j2?.SettingAmount;
    
                        mainTotal.metal.IsNotPrimaryMetalAmount += j2?.Amount;
                        mainTotal.metal.IsNotPrimaryMetalWt += j2?.Wt;
                        mainTotal.metal.IsNotPrimaryMetalPcs += j2?.Pcs;
                        mainTotal.metal.IsNotPrimaryMetalSettingAmount += j2?.SettingAmount;

                    }

                }
                if(j2?.MasterManagement_DiamondStoneTypeid === 5){
                    findingList.push(j2);

                    perjobTotal.finding.Amount += j2?.Amount;
                    perjobTotal.finding.Rate = j2?.Rate;
                    perjobTotal.finding.rate += j2?.Rate;
                    perjobTotal.finding.Pcs += j2?.Pcs;
                    perjobTotal.finding.Wt += j2?.Wt;
                    perjobTotal.finding.SettingAmount += j2?.SettingAmount;
                    perjobTotal.finding.SettingRate += j2?.SettingRate;
                    perjobTotal.finding.FineWt += j2?.FineWt;

                    // console.log('j2j2j2j2j2j2', j2);
                    
                    mainTotal.finding.Amount += j2?.Amount;
                    mainTotal.finding.Rate = j2?.Rate;
                    mainTotal.finding.rate += j2?.Rate;
                    mainTotal.finding.Pcs += j2?.Pcs;
                    mainTotal.finding.Wt += j2?.Wt;
                    mainTotal.finding.SettingAmount += j2?.SettingAmount;
                    mainTotal.finding.SettingRate += j2?.SettingRate;
                    mainTotal.finding.FineWt += j2?.FineWt;

                    if(j2?.Supplier?.toLowerCase() === 'customer'){
                        finding_customer_wt += j2?.Wt;
                    }
                    if(j2?.FindingTypename?.toLowerCase()?.includes('chain') || j2?.FindingTypename?.toLowerCase()?.includes('hook')){
                        specialFinding = j2;
                    }

                }

            }

        })

        diamondList?.sort((a, b) => a?.Rate - b?.Rate);
        colorstoneList?.sort((a, b) => a?.Rate - b?.Rate);

        let obj = { ...j1 };

        obj.diamonds = diamondList;
        obj.colorstone = colorstoneList;
        obj.misc = miscList;
        obj.metal = metalList;
        obj.finding = findingList;

        obj.misc_0List = misc_0List;
        obj.misc_1List = misc_1List;
        obj.misc_2List = misc_2List;
        obj.misc_3List = misc_3List;
        obj.misc_03List = misc_03List;
        obj.misc_123List = misc_123List;
        obj.isRateOnPcsMisc_0List = isRateOnPcsMisc_0List;
        obj.isRateOnPcsMisc_1List = isRateOnPcsMisc_1List;

        obj.totals = perjobTotal;

        obj.metal_rate = metal_rate;
        obj.metal_finewt = metal_finewt;
        obj.finding_customer_wt = finding_customer_wt;
        obj.specialFinding = specialFinding;

        let other_details_array = otherAmountDetail(j1?.OtherAmtDetail);

        obj.other_details_array = other_details_array;

        let oth = 0;
        other_details_array?.forEach((e) => {
            oth = oth + e?.amtval;
        })
        obj.other_details_array_amount = oth;

        resultArray.push(obj);

    })

    let allTax = taxGenrator(header, mainTotal?.TotalAmount);

    allTax?.forEach((e) => {
        let amt = +(e?.amount);
        let cramt = ((amt)/(header?.CurrencyExchRate))
        e.amount = String(cramt);
    })

    allTax?.length > 0 &&
    allTax?.forEach((e) => {
        const [dollars, cents] = (((e?.amount)))?.split(".");
        const dollarsInWords = numberToWords.toWords(parseInt(dollars));
        const centsInWords = cents
          ? numberToWords.toWords(parseInt(cents.padEnd(2, '0')))
          : "Zero";
        const amountInWords = [
          dollarsInWords.charAt(0).toUpperCase() + dollarsInWords.slice(1),
          "point",
          centsInWords.charAt(0).toUpperCase() + centsInWords.slice(1),
        ]
          .filter(Boolean)
          .join(" ");
        let amtInWords = CapitalizeWords((amountInWords))
        e.amountInWords = `TOTAL ${e.name} IN WORDS: ${amtInWords}`;
    });

    allTax?.forEach((e) => {
      let amtwords = toWords?.convert(+((+e?.amount)?.toFixed(2)));
      let amtInWords = CapitalizeWords(amtwords)
      // e.amountInWords = amtwords;
      e.amountInWords = `TOTAL ${e.name} IN WORDS: ${amtInWords}`;
    })

    let allTaxTotal = 0;

    const allTaxes = allTax?.map((e) => {
        let obj = {...e};
        obj.amountInNumber = +e?.amount;
        allTaxTotal += +e?.amount;
        return obj;
    })

    let brArr = [];
    if (header?.Brokerage?.length > 0) {
      let blankArr = header?.Brokerage?.split("@-@");
      let resultArr = [];
      blankArr.forEach((e, i) => {
        let obj = {};
        let arr = e?.split("#-#");
        obj.label = arr[0];
        obj.value = +(arr[1]);
        resultArr.push(obj);
    });
      
    brArr = resultArr;

    }

    let headerObj = { ...header };

    headerObj.BrokerageDetails = brArr;
    headerObj.addressLine = addressLine;

    const customSort = (a, b) => {

        if (isNaN(a?.designno) && isNaN(b?.designno)) {
          // If both are non-numeric, compare as strings
          return (a?.designno)?.localeCompare(b?.designno);
        } else if (isNaN(a?.designno)) {
          // If only 'a' is non-numeric, place it at the end
          return 1;
        } else if (isNaN(b?.designno)) {
          // If only 'b' is non-numeric, place it at the end
          return -1;
        } else {
          // If both are numeric, compare as numbers
          return a?.designno - b?.designno;
        }
    };
    
    resultArray?.sort(customSort);

    const finalObject = {
        resultArray: resultArray,
        mainTotal: mainTotal,
        allTaxes: allTaxes,
        allTaxesTotal : allTaxTotal,
        header: headerObj,
        json1: json1,
        json2: json2,
    };


    return finalObject;

}




  // if(obj2?.IsHSCOE === 0 || obj2?.obj2?.IsHSCOE === 3){

                    //     misc_03List.push(j2);

                    //     perjobTotal.misc.IsHSCODE_0_wt += obj2?.Wt;
                    //     perjobTotal.misc.IsHSCODE_0_pcs += obj2?.Pcs;
                    //     perjobTotal.misc.IsHSCODE_0_amount += obj2?.Amount;
                    //     perjobTotal.misc.IsHSCODE_0_SettingAmount += obj2?.SettingAmount;
                    //     perjobTotal.misc.IsHSCODE_0_ServeWt += obj2?.ServWt;

                    //     mainTotal.misc.IsHSCODE_0_wt += obj2?.Wt;
                    //     mainTotal.misc.IsHSCODE_0_pcs += obj2?.Pcs;
                    //     mainTotal.misc.IsHSCODE_0_amount += obj2?.Amount;
                    //     mainTotal.misc.IsHSCODE_0_SettingAmount += obj2?.SettingAmount;
                    //     mainTotal.misc.IsHSCODE_0_ServeWt += obj2?.ServWt;

                    //     perjobTotal.misc.IsHSCODE_3_wt += obj2?.Wt;
                    //     perjobTotal.misc.IsHSCODE_3_pcs += obj2?.Pcs;
                    //     perjobTotal.misc.IsHSCODE_3_amount += obj2?.Amount;
                    //     perjobTotal.misc.IsHSCODE_3_SettingAmount += obj2?.SettingAmount;
                    //     perjobTotal.misc.IsHSCODE_3_ServeWt += obj2?.ServWt;

                    //     mainTotal.misc.IsHSCODE_3_wt += obj2?.Wt;
                    //     mainTotal.misc.IsHSCODE_3_pcs += obj2?.Pcs;
                    //     mainTotal.misc.IsHSCODE_3_amount += obj2?.Amount;
                    //     mainTotal.misc.IsHSCODE_3_SettingAmount += obj2?.SettingAmount;
                    //     mainTotal.misc.IsHSCODE_3_ServeWt += obj2?.ServWt;

                    // }
                    // if(obj2?.IsHSCOE === 1 || obj2?.IsHSCOE === 2 || obj2?.IsHSCOE === 3){

                    //     misc_123List.push(j2);

                    //     perjobTotal.misc.IsHSCODE_1_wt += obj2?.Wt;
                    //     perjobTotal.misc.IsHSCODE_1_pcs += obj2?.Pcs;
                    //     perjobTotal.misc.IsHSCODE_1_amount += obj2?.Amount;
                    //     perjobTotal.misc.IsHSCODE_1_SettingAmount += obj2?.SettingAmount;
                    //     perjobTotal.misc.IsHSCODE_1_ServeWt += obj2?.ServWt;

                    //     mainTotal.misc.IsHSCODE_1_wt += obj2?.Wt;
                    //     mainTotal.misc.IsHSCODE_1_pcs += obj2?.Pcs;
                    //     mainTotal.misc.IsHSCODE_1_amount += obj2?.Amount;
                    //     mainTotal.misc.IsHSCODE_1_SettingAmount += obj2?.SettingAmount;
                    //     mainTotal.misc.IsHSCODE_1_ServeWt += obj2?.ServWt;

                    //     perjobTotal.misc.IsHSCODE_2_wt += obj2?.Wt;
                    //     perjobTotal.misc.IsHSCODE_2_pcs += obj2?.Pcs;
                    //     perjobTotal.misc.IsHSCODE_2_amount += obj2?.Amount;
                    //     perjobTotal.misc.IsHSCODE_2_SettingAmount += obj2?.SettingAmount;
                    //     perjobTotal.misc.IsHSCODE_2_ServeWt += obj2?.ServWt;

                    //     mainTotal.misc.IsHSCODE_2_wt += obj2?.Wt;
                    //     mainTotal.misc.IsHSCODE_2_pcs += obj2?.Pcs;
                    //     mainTotal.misc.IsHSCODE_2_amount += obj2?.Amount;
                    //     mainTotal.misc.IsHSCODE_2_SettingAmount += obj2?.SettingAmount;
                    //     mainTotal.misc.IsHSCODE_2_ServeWt += obj2?.ServWt;

                    //     perjobTotal.misc.IsHSCODE_3_wt += obj2?.Wt;
                    //     perjobTotal.misc.IsHSCODE_3_pcs += obj2?.Pcs;
                    //     perjobTotal.misc.IsHSCODE_3_amount += obj2?.Amount;
                    //     perjobTotal.misc.IsHSCODE_3_SettingAmount += obj2?.SettingAmount;
                    //     perjobTotal.misc.IsHSCODE_3_ServeWt += obj2?.ServWt;

                    //     mainTotal.misc.IsHSCODE_3_wt += obj2?.Wt;
                    //     mainTotal.misc.IsHSCODE_3_pcs += obj2?.Pcs;
                    //     mainTotal.misc.IsHSCODE_3_amount += obj2?.Amount;
                    //     mainTotal.misc.IsHSCODE_3_SettingAmount += obj2?.SettingAmount;
                    //     mainTotal.misc.IsHSCODE_3_ServeWt += obj2?.ServWt;

                    // }