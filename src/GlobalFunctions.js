import axios from "axios";
// import img from "./assets/img/default.jpg";
import img from "./assets/img/default.jpg";
import Footer1 from "./components/footers/Footer1";
import Header1 from "./components/headers/Header1";
import Header2 from "./components/headers/Header2";
import Header3 from "./components/headers/Header3";
import Header5 from "./components/headers/Header5";
import Subhead1 from "./components/subheaders/subhead1/Subhead1";
import Subhead2 from "./components/subheaders/subhead2/Subhead2";
import { exportToExcel } from "react-json-to-excel";
import Footer2 from "./components/footers/Footer2";
import { ToWords } from "to-words";
import Header4 from "./components/headers/Header4";
import EInvoiceHeader from "./components/headers/EInvoiceHeader";
import { at } from "lodash";

//print button function for print pop up
export const handlePrint = (e) => {
  window.print();
};

//handle image if api image not coming
export const handleImageError = (e) => {
  e.target.src = img;
};

export const handleGlobalImgError = (e, img) => {
  if(img){
    e.target.src = img;
  }
};
//sentence words first char capital function
export const CapitalizeWords = (text) => {
  const capitalizeFirstLetter = (word) => {
    return word?.charAt(0)?.toUpperCase() + word?.slice(1);
  };
  const wordsArray = text.split(" ");
  const capitalizedWordsArray = wordsArray.map((word) => {
    return word?.split("-")?.map(capitalizeFirstLetter)?.join("-");
  });
  const capitalizedText = capitalizedWordsArray?.join(" ");
  // eslint-disable-next-line no-useless-concat
  // return capitalizedText + " " + "Only";
  return capitalizedText + " ";
};

//global function of api calling
export const apiCall = async (token, invoiceNo, printName, urls, evn, ApiVer) => {
  const body = {
    token: token,
    invoiceno: invoiceNo,
    printname: printName,
    Eventname: evn,
    ApiVer: ApiVer
  };
  try {
    const response = await axios.post(urls, body);
    return response?.data;
  } catch (error) {
    console.error(error);
  }

};

export  function mergeFindings(data) {
    const map = new Map();

    data.forEach((item) => {
      const key = [
        item.Supplier,
        item.Rate,
        item.ShapeName,
        item.Colorname,
        item.QualityName,
        item.FindingAccessories,
        item.FindingTypename,
      ].join("|");

      if (map.has(key)) {
        const existing = map.get(key);

        existing.Pcs += Number(item.Pcs || 0);
        existing.Wt += Number(item.Wt || 0);
        existing.FineWt += Number(item.FineWt || 0);
        existing.Amount += Number(item.Amount || 0);
      } else {
        map.set(key, {
          ...item,
          Pcs: Number(item.Pcs || 0),
          Wt: Number(item.Wt || 0),
          FineWt: Number(item.FineWt || 0),
          Amount: Number(item.Amount || 0),
        });
      }
    });

    return [...map.values()];
  }

export function mergeMetals(data) {
  const normalize = (v) =>
    String(v ?? "").trim().toLowerCase();

  const map = new Map();

  data.forEach((item) => {
    const key = [
      normalize(item.ShapeName),
      normalize(item.QualityName),
      normalize(item.Colorname),
      normalize(item.Supplier),
      Number(item.Rate || 0),
      Number(item.IsPrimaryMetal || 0),
    ].join("|");
    
 

    if (map.has(key)) {
      const existing = map.get(key);

      existing.Pcs += Number(item.Pcs || 0);
      existing.Wt += Number(item.Wt || 0);
      existing.FineWt += Number(item.FineWt || 0);
      existing.Amount += Number(item.Amount || 0);
    } else {
      map.set(key, {
        ...item,
        Pcs: Number(item.Pcs || 0),
        Wt: Number(item.Wt || 0),
        FineWt: Number(item.FineWt || 0),
        Amount: Number(item.Amount || 0),
      });
    }
  });

  return [...map.values()].sort(
    (a, b) => Number(b.IsPrimaryMetal) - Number(a.IsPrimaryMetal)
  );
}

export const mergedBySeetingRate = (data) => Object.values(
  data.reduce((acc, item) => {
    const rateKey = item.SettingRate;

    if (!acc[rateKey]) {
      // If this SettingRate doesn't exist yet, create a shallow copy
      acc[rateKey] = { ...item };
    } else {
      // If it exists, add the SettingAmount (and other aggregate fields if needed)
      acc[rateKey].SettingAmount += item.SettingAmount;
      
      // OPTIONAL: If you want to sum up other values for matching rates:
      acc[rateKey].Pcs += item.Pcs;
      acc[rateKey].Wt += item.Wt;
      acc[rateKey].Amount += item.Amount;
    }

    return acc;
  }, {})
);

 

//global function of saleTallyApiCall calling
export const saleTallyApiCall = async (urls, token, printName,  evn, ApiVer , fdate, tdate ) => {
  const body = {
    token: token,
    printname: printName,
    Eventname: evn,
    ApiVer: ApiVer,
    Fdate: atob(fdate),
    Tdate: atob(tdate)
  };
  // const header = {
  //   "Authorization": "Bearer 40815062023094801060"
  // }
  // const bodies = {
  //   "con": "{\"id\":\"\",\"mode\":\"store_init\"}",
  //   "p": "",
  //   "f": "formname (init)"
  // }

  // const headers = {
  //   "Authorization": "Bearer optigo_json_api",
  //   "domain": "zen",
  //   // "Content-Type": "application/json",
  //   "version": "v4",
  //   "YearCode": "",
  // };
  try {
    // const responses = await axios.post("http://zen/api/", bodies, {headers: headers});
    const response = await axios.post(urls, body);
    return response?.data;
  } catch (error) {
    console.error(error);
  }

};


//api calling function for Hopscoach for jewellerybook
export const apiCallHopsCoach = async ({token, SpNo, SpVer, SV, evn, urls}) => {
  const reqData = [{
    Token: atob(token),
    Evt: atob(evn),
    SV: atob(SV) ?? '',
  }]
  const requestBody = {
    token: atob(token),
    SpNo: atob(SpNo) ?? '',
    SpVer: atob(SpVer) ?? '',
    ReqData:JSON.stringify(reqData)
  };

  try {
    const response = await axios.post(urls, requestBody);
    return response?.data;
  } catch (error) {
    console.error("API call failed:", error);
    return { Status: "500", Message: "API call failed", Data: {} };
  }
};




// new api print
export const newApiPrint = async (token, invoiceNo, printName, url, evn) => {
  let data = `{\r\n  "token" : "${token}"\r\n  ,"invoiceno":"${invoiceNo}"\r\n  ,"printname":"${printName}"\r\n  ,"Eventname":"${evn}"\r\n}`;
  let headers = {
    "Content-Type": "text/plain",
    Cookie: "ASP.NET_SessionId=eosdeooiexxjky0svpuomnc0",
  };
  try {
    axios
      .post(url, data, { headers })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  } catch (error) {
    console.error("API call failed:", error);
    return null; // Handle the error as needed
  }
};

//api response object checking is obj is empty or not
export function isObjectEmpty(obj) {
  for (const key in obj) {
    if (obj?.hasOwnProperty(key)) {
      return false; // If any property is found, the object is not empty
    }
  }
  return true; // If no properties are found, the object is empty
}

//tax value calculating function taxGenerator
export const taxGenrator = (headerData, totalAmount) => {
  let blankArr = [];
  if (headerData?.TaxProfileid !== 0 && headerData?.GSTProfileid === 0) {
    let taxTypes = ["tax1", "tax2", "tax3", "tax4", "tax5"];
    taxTypes?.forEach((e) => {
      if (headerData[`${e}_taxname`] !== "") {
        if (headerData[`${e}_IsOnDiscount`] === 1) {
          let obj = {
            name: headerData[[`${e}_taxname`]],
            per: `${headerData[`${e}_value`]?.toFixed(2)}%`,
            amount: ((totalAmount * headerData[`${e}_value`]) / 100)?.toFixed(
              2
            ),
          };
          blankArr.push(obj);
        } else {
          let obj = {
            name: headerData[`${e}_taxname`],
            per: headerData[`${e}_value`]?.toFixed(2),
            amount: headerData[`${e}_value`]?.toFixed(2),
          };
          blankArr.push(obj);
        }
      }
    });
  } else if (headerData?.TaxProfileid !== 0 && headerData?.GSTProfileid === 1) {
    let arr = ["CGST", "SGST"];
    arr?.forEach((e) => {
      let obj = {
        name: e,
        per: `${headerData[e]?.toFixed(2)}%`,
        // amount: ((totalAmount * headerData[e]) / 100)?.toFixed(2),
        amount: headerData?.[`Total${e}Amount`]?.toFixed(2),
      };
      blankArr.push(obj);
    });
  } else if (headerData?.TaxProfileid !== 0 && headerData?.GSTProfileid === 2) {
    let obj = {
      name: headerData?.TaxProfilename,
      per: `${headerData?.IGST?.toFixed(2)}%`,
      amount: headerData?.TotalIGSTAmount?.toFixed(2),
    };
    blankArr.push(obj);
  }
  return blankArr;
};

export const taxGenrator2 = (headerData, totalAmount) => {
  let blankArr = [];
  if (headerData?.TaxProfileid !== 0 && headerData?.GSTProfileid === 0) {
    let taxTypes = ["tax1", "tax2", "tax3", "tax4", "tax5"];
    taxTypes?.forEach((e) => {
      if (headerData[`${e}_taxname`] !== "") {
        if (headerData[`${e}_IsOnDiscount`] === 1) {
          let obj = {
            name: headerData[[`${e}_taxname`]],
            per: `${headerData[`${e}_value`]?.toFixed(2)}%`,
            amount: ((totalAmount * headerData[`${e}_value`]) / 100)?.toFixed(
              2
            ),
          };
          blankArr.push(obj);
        } else {
          let obj = {
            name: headerData[`${e}_taxname`],
            per: headerData[`${e}_value`]?.toFixed(2),
            amount: headerData[`${e}_value`]?.toFixed(2),
          };
          blankArr.push(obj);
        }
      }
    });
  } else if (headerData?.TaxProfileid !== 0 && headerData?.GSTProfileid === 1) {
    let arr = ["CGST", "SGST"];
    arr?.forEach((e) => {
      let obj = {
        name: e,
        per: `${headerData[e]?.toFixed(2)}%`,
        // amount: ((totalAmount * headerData[e]) / 100)?.toFixed(2),
        amount: ((totalAmount * headerData[e]) / 100).toFixed(2),
      };
      blankArr.push(obj);
    });
  } else if (headerData?.TaxProfileid !== 0 && headerData?.GSTProfileid === 2) {
    let obj = {
      name: headerData?.TaxProfilename,
      per: `${headerData?.IGST?.toFixed(2)}%`,
      amount: (totalAmount * headerData["IGST"] / 100).toFixed(2)
    };
    blankArr.push(obj);
  }
  return blankArr;
};

export const NumberWithCommas = (value, val) => {
 if(value === undefined){
  return "0"
 }else{
  let value1 = value?.toString()?.split("-");
  if (value1?.length === 1) {
    const roundedValue = Number(value)?.toFixed(val || 2);
    const stringValue = roundedValue?.toString();
    const [integerPart, decimalPart] = stringValue?.split('.');
    let formattedString = integerPart
      ?.split('')
      ?.reverse()
      ?.map((char, index) => (index > 0 && index % 2 === 0 ? ',' + char : char))
      ?.reverse()
      ?.join('');
    if (decimalPart !== undefined && val && val !== 0) {
      formattedString += '.' + decimalPart?.padEnd(val || 2, '0');
    }
    formattedString = formattedString?.replace(/^,+/, '');
    return formattedString;
  }
  else if (value !== null) {
    const roundedValue = Number(+value1[1])?.toFixed(val || 2);
    const stringValue = roundedValue?.toString();
    const [integerPart, decimalPart] = stringValue?.split('.');
    let formattedString = integerPart
      ?.split('')
      ?.reverse()
      ?.map((char, index) => (index > 0 && index % 2 === 0 ? ',' + char : char))
      ?.reverse()
      ?.join('');
    if (decimalPart !== undefined && val && val !== 0) {
      formattedString += '.' + decimalPart?.padEnd(val || 2, '0');
    }
    formattedString = formattedString?.replace(/^,+/, '');
    return "-" + formattedString;
  } else {
    if (val) {
      return 0?.toFixed(val)
    } else {
      return 0
    }
  }
 }
};



//fixedValues
export const fixedValues = (value, zeroes) =>
  typeof value === "number"
    ? value?.toFixed(zeroes)
    : (+value)?.toFixed(zeroes);

//call of header
export const HeaderComponent = (headNo, headerData,isMaterial) => {
  let headerComponent;

  switch (headNo) {
    case "1":
      headerComponent = <Header1 data={headerData} />;
      break;

    case "2":
      headerComponent = <Header2 data={headerData} />;
      break;

    case "3":
      headerComponent = <Header3 data={headerData} isMaterial={isMaterial} />;
      break;

    case "4":
      headerComponent = <Header4 data={headerData} />;
      break;

    case "5":
      headerComponent = <EInvoiceHeader data={headerData} />;
      break;

      case "6":
        headerComponent = <Header5 data={headerData} />;
        break;

    default:
      headerComponent = <Header1 data={headerData} />;
      break;
  }

  return headerComponent;
};

//call of footer
export const FooterComponent = (footerNo, footerData) => {
  let footerComponent;

  switch (footerNo) {
    case "1":
      footerComponent = <Footer1 data={footerData} />;
      break;

    case "2":
      footerComponent = <Footer2 data={footerData} />;
      break;

    default:
      footerComponent = <Footer1 data={footerData} />;
      break;
  }

  return footerComponent;
};

export const SubheaderComponent = (subheadNo, SubheadData) => {
  let subheaderComponent;

  switch (subheadNo) {
    case "1":
      subheaderComponent = <Subhead1 data={SubheadData} />;

      break;
    case "2":
      subheaderComponent = <Subhead2 data={SubheadData} />;
      break;

    default:
      subheaderComponent = <Subhead1 data={SubheadData} />;
      break;
  }

  return subheaderComponent;
};

export const ReceiveInBank = (BankPayDet) => {
  if (BankPayDet?.length > 0) {
    let arr = BankPayDet.split("@-@");
    let blankArr = [];
    arr.forEach((e) => {
      let obj = {};
      let val = e.split("#-#");
      obj.BankName = val[0];
      obj.label = val[1];
      obj.amount = +val[2];
      obj.id = val?.[3];
      blankArr.push(obj);
    });
    return blankArr;
  } else {
    return [];
  }
};

export const checkInstruction = (ins) => {
  if (
    !ins?.trim()?.includes("undefined") &&
    ins !== undefined &&
    ins !== null &&
    !ins?.trim()?.includes("null")
  ) {
    return ins;
  }
};

export const GovernMentDocuments = (documents) => {
  if (documents?.length > 0) {
    let arr = documents?.split("#@#");
    let blankArr = [];
    arr?.forEach((e) => {
      let obj = {};
      let val = e?.split("#-#");
      obj.label = val[0];
      obj.value = val[1];
      blankArr.push(obj);
    });
    return blankArr;
  } else {
    return [];
  }
};

export const notZero = (val) => {
  if (
    val !== "" &&
    val !== undefined &&
    val !== null &&
    val !== "null" &&
    val !== 0
  ) {
    return val;
  } else {
    return "";
  }
};

export const ExportToExcel = (data, InvoiceNo) => {
  exportToExcel(data, `Sale_Format_B_${InvoiceNo}_${Date.now()}`);
};

export const otherAmountDetail = (otherAmtDetail) => {
  if (otherAmtDetail?.length > 0) {
    let blankArr = otherAmtDetail?.split("#@#");
    let resultArr = [];
    blankArr.forEach((e, i) => {
      let obj = {};
      let arr = e?.split("#-#");
      obj.label = arr[0];
      obj.value = arr[1];
      obj.amtval = (+arr[1]);
      resultArr.push(obj);
    });
    return resultArr;
  } else {
    return [];
  }
};

export const brokarageDetail = (otherAmtDetail) => {
  if (otherAmtDetail?.length > 0) {
    let blankArr = otherAmtDetail?.split("@-@");
    let resultArr = [];
    blankArr.forEach((e, i) => {
      let obj = {};
      let arr = e?.split("#-#");
      obj.label = arr[0];
      obj.value = arr[1];
      resultArr.push(obj);
    });
    return resultArr;
  } else {
    return [];
  }
};

export const checkArr = (diaArr, clsArr, miscArr, fArr) => {
  let mainArr = [];
  if (diaArr?.length > 2) {
    mainArr = mainArr?.concat(diaArr);
  }
  if (clsArr?.length > 2) {
    mainArr = mainArr?.concat(clsArr);
  }
  if (miscArr?.length > 2) {
    mainArr = mainArr?.concat(miscArr);
  }
  if (fArr?.length > 2) {
    mainArr = mainArr?.concat(fArr);
  }
  return mainArr;
};

export const numberToWord = (num) => {
  const toWords = new ToWords();
  if (typeof num === "string") {
    return toWords.convert(+fixedValues(num, 2));
  } else if (typeof num === "number") {
    return toWords.convert(num);
  } else {
    return "";
  }
};

export const checkImageExists = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

export const checkImageExistss = (url, callback) => {
  var img = new Image();
  img.onload = function () {
    callback(true);
  };
  img.onerror = function () {
    callback(false);
  };
  img.src = url;
}

export function formatAmount(amount, precision = 2) {
  const parsed = parseFloat(+amount);
  if (isNaN(parsed)) return '0';

  return parsed.toLocaleString('en-IN', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

// export function formatAmount(amount) {
//   const formattedAmount = parseFloat(+amount).toLocaleString('en-IN', {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });

//   return formattedAmount;
// }
export function formatWeight(wt) {
  const formattedAmount = parseFloat(+wt).toLocaleString('en-IN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

  return formattedAmount;
}

export const shapeColorQuality = (jsonData) => {
  let diamondsWithOutRate = [];
  let colorStonesWithOutRate = [];
  let miscsWithOutRate = [];
  let findingWithOutRate = [];
  let metalWithOutRate = [];

  let diamondsWithRate = [];
  let colorStonesWithRate = [];
  let miscsWithRate = [];
  let findingWithRate = [];
  let metalWithRate = [];

  jsonData.forEach((ele, ind) => {
    if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
      let findDiamondWithOutRates = diamondsWithOutRate.findIndex((elem, indd) => elem?.ShapeName === ele?.ShapeName && elem?.Colorname === ele?.Colorname && elem?.QualityName === ele?.QualityName);
      if (findDiamondWithOutRates === -1) {
        diamondsWithOutRate.push(ele);
      } else {
        diamondsWithOutRate[findDiamondWithOutRates].Wt += ele?.Wt;
        diamondsWithOutRate[findDiamondWithOutRates].Pcs += ele?.Pcs;
        diamondsWithOutRate[findDiamondWithOutRates].Amount += ele?.Amount;
        diamondsWithOutRate[findDiamondWithOutRates].SettingAmount += ele?.SettingAmount;
      }
      let findDiamondsWithRates = diamondsWithRate.findIndex((elem, indd) => elem?.ShapeName === ele?.ShapeName && elem?.Colorname === ele?.Colorname && elem?.QualityName === ele?.QualityName && elem?.Rate === ele?.Rate);
      if (findDiamondsWithRates === -1) {
        diamondsWithRate.push(ele);
      } else {
        diamondsWithRate[findDiamondsWithRates].Wt += ele?.Wt;
        diamondsWithRate[findDiamondsWithRates].Pcs += ele?.Pcs;
        diamondsWithRate[findDiamondsWithRates].Amount += ele?.Amount;
        diamondsWithRate[findDiamondsWithRates].SettingAmount += ele?.SettingAmount;
      }
    } else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
      let colorStonesWithOutRates = colorStonesWithOutRate.findIndex((elem, indd) => elem?.ShapeName === ele?.ShapeName && elem?.Colorname === ele?.Colorname && elem?.QualityName === ele?.QualityName);
      if (colorStonesWithOutRates === -1) {
        colorStonesWithOutRate.push(ele);
      } else {
        colorStonesWithOutRate[colorStonesWithOutRates].Wt += ele?.Wt;
        colorStonesWithOutRate[colorStonesWithOutRates].Pcs += ele?.Pcs;
        colorStonesWithOutRate[colorStonesWithOutRates].Amount += ele?.Amount;
        colorStonesWithOutRate[colorStonesWithOutRates].SettingAmount += ele?.SettingAmount;
      }

      let colorStonesWithRates = colorStonesWithRate.findIndex((elem, indd) => elem?.ShapeName === ele?.ShapeName && elem?.Colorname === ele?.Colorname && elem?.QualityName === ele?.QualityName && elem?.Rate === ele?.Rate);
      if (colorStonesWithRates === -1) {
        colorStonesWithRate.push(ele);
      } else {
        colorStonesWithRate[colorStonesWithRates].Wt += ele?.Wt;
        colorStonesWithRate[colorStonesWithRates].Pcs += ele?.Pcs;
        colorStonesWithRate[colorStonesWithRates].Amount += ele?.Amount;
        colorStonesWithRate[colorStonesWithRates].SettingAmount += ele?.SettingAmount;
      }
    } else if (ele?.MasterManagement_DiamondStoneTypeid === 3) {
      let miscsWithOutRates = miscsWithOutRate.findIndex((elem, indd) => elem?.ShapeName === ele?.ShapeName && elem?.Colorname === ele?.Colorname && elem?.QualityName === ele?.QualityName);
      if (miscsWithOutRates === -1) {
        miscsWithOutRate.push(ele);
      } else {
        miscsWithOutRate[miscsWithOutRates].Wt += ele?.Wt;
        miscsWithOutRate[miscsWithOutRates].Pcs += ele?.Pcs;
        miscsWithOutRate[miscsWithOutRates].Amount += ele?.Amount;
        miscsWithOutRate[miscsWithOutRates].SettingAmount += ele?.SettingAmount;
      }

      let miscsWithRates = miscsWithRate.findIndex((elem, indd) => elem?.ShapeName === ele?.ShapeName && elem?.Colorname === ele?.Colorname && elem?.QualityName === ele?.QualityName && elem?.Rate === ele?.Rate);
      if (miscsWithRates === -1) {
        miscsWithRate.push(ele);
      } else {
        miscsWithRate[miscsWithRates].Wt += ele?.Wt;
        miscsWithRate[miscsWithRates].Pcs += ele?.Pcs;
        miscsWithRate[miscsWithRates].Amount += ele?.Amount;
        miscsWithRate[miscsWithRates].SettingAmount += ele?.SettingAmount;
      }
    } else if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
      let metalWithOutRates = metalWithOutRate.findIndex((elem, indd) => elem?.ShapeName === ele?.ShapeName && elem?.Colorname === ele?.Colorname && elem?.QualityName === ele?.QualityName);
      if (metalWithOutRates === -1) {
        metalWithOutRate.push(ele);
      } else {
        metalWithOutRate[metalWithOutRates].Wt += ele?.Wt;
        metalWithOutRate[metalWithOutRates].Pcs += ele?.Pcs;
        metalWithOutRate[metalWithOutRates].Amount += ele?.Amount;
        metalWithOutRate[metalWithOutRates].SettingAmount += ele?.SettingAmount;
      }

      let metalWithRates = metalWithRate.findIndex((elem, indd) => elem?.ShapeName === ele?.ShapeName && elem?.Colorname === ele?.Colorname && elem?.QualityName === ele?.QualityName && elem?.Rate === ele?.Rate);
      if (metalWithRates === -1) {
        metalWithRate.push(ele);
      } else {
        metalWithRate[metalWithRates].Wt += ele?.Wt;
        metalWithRate[metalWithRates].Pcs += ele?.Pcs;
        metalWithRate[metalWithRates].Amount += ele?.Amount;
        metalWithRate[metalWithRates].SettingAmount += ele?.SettingAmount;
      }
    } else if (ele?.MasterManagement_DiamondStoneTypeid === 5) {
      let findingWithOutRates = findingWithOutRate.findIndex((elem, indd) => elem?.ShapeName === ele?.ShapeName && elem?.Colorname === ele?.Colorname && elem?.QualityName === ele?.QualityName);
      if (findingWithOutRates === -1) {
        findingWithOutRate.push(ele);
      } else {
        findingWithOutRate[findingWithOutRates].Wt += ele?.Wt;
        findingWithOutRate[findingWithOutRates].Pcs += ele?.Pcs;
        findingWithOutRate[findingWithOutRates].Amount += ele?.Amount;
        findingWithOutRate[findingWithOutRates].SettingAmount += ele?.SettingAmount;
      }

      let findingWithRates = findingWithRate.findIndex((elem, indd) => elem?.ShapeName === ele?.ShapeName && elem?.Colorname === ele?.Colorname && elem?.QualityName === ele?.QualityName && elem?.Rate === ele?.Rate);
      if (findingWithRates === -1) {
        findingWithRate.push(ele);
      } else {
        findingWithRate[findingWithRates].Wt += ele?.Wt;
        findingWithRate[findingWithRates].Pcs += ele?.Pcs;
        findingWithRate[findingWithRates].Amount += ele?.Amount;
        findingWithRate[findingWithRates].SettingAmount += ele?.SettingAmount;
      }
    }
  });

  return {
    withoutRate: {
      diamonds: diamondsWithOutRate,
      colorStones: colorStonesWithOutRate,
      miscs: miscsWithOutRate,
      finding: findingWithOutRate,
      metal: metalWithOutRate,
    },
    withRate: {
      diamonds: diamondsWithRate,
      colorStones: colorStonesWithRate,
      miscs: miscsWithRate,
      finding: findingWithRate,
      metal: metalWithRate,
    }
  }
}

export const discountCriteria = (data) => {
  let discountOn = [];
  if(data?.IsCriteriabasedAmount === 1){
      if(data?.IsMetalAmount === 1){
          discountOn.push('Metal')
      }
      if(data?.IsDiamondAmount === 1){
          discountOn.push('Diamond')
      }
      if(data?.IsStoneAmount === 1){
          discountOn.push('Stone')
      }
      if(data?.IsMiscAmount === 1){
          discountOn.push('Misc')
      }
      if(data?.IsLabourAmount === 1){
          discountOn.push('Labour')
      }
      if(data?.IsSolitaireAmount === 1){
          discountOn.push('Solitaire')
      }
  }else{
      if(data?.Discount !== 0){
          discountOn.push('Total Amount')
      }
  }
  let str_discountOn = discountOn?.join(',');
  return str_discountOn;
}


export const checkMsg = (msg) => {
  let wholemsg = msg?.toLowerCase();
  let newmsg = '';
  if(msg === ''){
    return msg;
  }else{
    if(wholemsg === 'bill data not found' || wholemsg === 'invalid token'){
      return msg;
    }else{
      newmsg = 'Some error occurred. Please try again or later.'
      return newmsg;
    }
  }
}