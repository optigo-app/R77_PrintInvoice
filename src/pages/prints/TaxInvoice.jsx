import React, { useState } from "react";
import style from "../../assets/css/prints/taxInvoice.module.css";
import { NumberWithCommas, apiCall, checkMsg, formatAmount, handleImageError, handlePrint, isObjectEmpty } from "../../GlobalFunctions";
import Header from "../../components/Header";
import { useEffect } from "react";
import { HeaderComponent } from "./../../GlobalFunctions";
import Loader from "../../components/Loader";
import { OrganizeDataPrint } from "../../GlobalFunctions/OrganizeDataPrint";
import { cloneDeep, findIndex } from "lodash";
import style1 from "../../assets/css/headers/header1.module.css";
import ImageComponent from "../../components/ImageComponent ";
import { MetalShapeNameWiseArr } from "../../GlobalFunctions/MetalShapeNameWiseArr";
const TaxInvoice = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  const [image, setimage] = useState(true);
  const [loader, setLoader] = useState(true);
  const [json0Data, setJson0Data] = useState({});
  const [headerComp, setHeaderComp] = useState(null);
  const [data, setData] = useState({});
  const [msg, setMsg] = useState("");
  const [diamonds, setDiamonds] = useState([]);
  const [logoStyle, setlogoStyle] = useState({ maxWidth: "120px", maxHeight: "95px", minHeight: "95px" });
  let [tax, setTax] = useState(0);
  const handleChange = (e) => {
    image ? setimage(false) : setimage(true);
  };
  const [category, setCategory] = useState([]);
  const [isImageWorking, setIsImageWorking] = useState(true);

  const [MetShpWise, setMetShpWise] = useState([]);
  const [notGoldMetalTotal, setNotGoldMetalTotal] = useState(0);
  const [notGoldMetalWtTotal, setNotGoldMetalWtTotal] = useState(0);

  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  const customSort = (a, b) => {
    if (a.ShapeName === "OTHER" && b.ShapeName !== "OTHER") {
      return 1; // "OTHER" comes after any other ShapeName
    } else if (a.ShapeName !== "OTHER" && b.ShapeName === "OTHER") {
      return -1; // Any other ShapeName comes before "OTHER"
    } else {
      // If ShapeNames are equal, compare by QualityName
      if (a.QualityName < b.QualityName) {
        return -1;
      } else if (a.QualityName > b.QualityName) {
        return 1;
      } else {
        // If QualityNames are equal, compare by Colorname
        return a.Colorname.localeCompare(b.Colorname);
      }
    }
  };

  const loadData = (data) => {
    setJson0Data(data?.BillPrint_Json[0]);
    let head = HeaderComponent("1", data?.BillPrint_Json[0]);
    setHeaderComp(head);
    let datas = OrganizeDataPrint(data?.BillPrint_Json[0], data?.BillPrint_Json1, data?.BillPrint_Json2);
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
    let criterialbased = false;
    datas?.resultArray?.forEach((e, i) => {
      let obj = cloneDeep(e);
      let primaryWt = 0;
      let primaryAmount = 0;
      e?.metal?.forEach((ele, ind) => {
        if (ele?.IsPrimaryMetal === 1) {
          primaryWt += ele?.Wt;
          primaryAmount += ele?.Amount;
        }
      });
      obj.primaryWt = primaryWt
      obj.primaryAmount = primaryAmount;

      let dia = [];

      e?.diamonds?.forEach((all) => {
        let a = cloneDeep(all);
         let findrec = dia?.findIndex((al) => al?.ShapeName === a?.ShapeName &&
          al?.QualityName === a?.QualityName && al?.Colorname === a?.Colorname &&
           al?.SizeName === a?.SizeName && al?.Rate === a?.Rate)
        if(findrec === -1){
          dia.push(a);
        }else{
          dia[findrec].Wt += a?.Wt;
          dia[findrec].Pcs += a?.Pcs;
          dia[findrec].Amount += a?.Amount;
        }
      })

      obj.diamonds = dia;
      
      resultArray?.push(obj);
      
    });
    datas.resultArray = resultArray;

    datas.resultArray?.sort((a, b) => {
      // First, compare based on Categoryname
      if (a.Categoryname < b.Categoryname) return -1;
      if (a.Categoryname > b.Categoryname) return 1;
      
      // If Categoryname is the same, compare based on SrJobno
      if (a.SrJobno < b.SrJobno) return -1;
      if (a.SrJobno > b.SrJobno) return 1;
    
      // If both Categoryname and SrJobno are the same, return 0
      return 0;
    });

    


    setData(datas);
    let diamondArr = [];
    data?.BillPrint_Json2?.forEach((ele, ind) => {
      if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
        let findDiamond = diamondArr?.findIndex((elem, index) => elem?.ShapeName === "RND" && ele?.ShapeName === "RND" &&
          elem?.QualityName === ele?.QualityName && elem?.Colorname === ele?.Colorname);
        if (findDiamond === -1) {
          if (ele?.ShapeName === "RND") {
            diamondArr?.push(ele);
          } else {
            let findOther = diamondArr?.findIndex((elem, index) => elem?.ShapeName === "OTHER");
            if (findOther === -1) {
              let obj = cloneDeep(ele);
              obj.ShapeName = "OTHER";
              obj.Colorname = "";
              obj.QualityName = "";
              diamondArr?.push(obj);
            } else {
              diamondArr[findOther].Wt += ele?.Wt;
              diamondArr[findOther].Pcs += ele?.Pcs;
              diamondArr[findOther].Amount += ele?.Amount;
            }
          }
        } else {
          diamondArr[findDiamond].Wt += ele?.Wt;
          diamondArr[findDiamond].Pcs += ele?.Pcs;
          diamondArr[findDiamond].Amount += ele?.Amount;
        }
      }
    });

    const sortedData = diamondArr.sort(customSort);
    setDiamonds(sortedData);
    let taxValue = datas?.allTaxes.reduce((acc, cobj) => acc + +cobj?.amount * data?.BillPrint_Json[0]?.CurrencyExchRate, 0);
    setTax(taxValue);
    let categoryArr = [];
    data?.BillPrint_Json1?.forEach((e, i) => {
      let findCategory = categoryArr?.findIndex((ele, index) => ele?.Categoryname === e?.Categoryname);
      if (findCategory === -1) {
        categoryArr.push(e);
      } else {
        categoryArr[findCategory].Quantity += e?.Quantity;
      }
    });
    categoryArr?.sort((a, b) => {
      let nameA = a?.Categoryname?.toUpperCase();
      let nameb = b.Categoryname?.toUpperCase();
      if (nameA < nameb) {
        return -1;
      } else if (nameA > nameb) {
        return 1;
      } else {
        return 0;
      }
    })
    setCategory(categoryArr);
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
    }
    sendData();
  }, []);

  return (

    <>{
      loader ? <Loader /> : msg === "" ?
        <div className={`container pt-5 px-1s ${style.tax_invoice_container} pad_60_allPrint  px-1`}>
          <div className={`d-flex justify-content-end mb-4 align-items-center ${style?.print_sec_sum4}`}>
            <div className="form-check pe-3 d-flex align-items-center">
              <input
                className="form-check-input border-dark"
                type="checkbox"
                checked={image}
                onChange={(e) => handleChange(e)}
                style={{ width: "12px", height: "12px" }}
                id="labelid"
              />
              <label id="labelid" className={`form-check-label ps-1 pt-1 ${style?.customerFirmName}`}  style={{ paddingTop: "1.5px", minHeight: "unset !important" }}>With Image</label>
            </div>
            <div className="form-check ps-3">
              <input
                type="button"
                className={`btn_white blue ${style?.customerFirmName}`}
                value="Print"
                onClick={(e) => handlePrint(e)}
              />
            </div>
          </div>
          <div className="taxInvoicePrintHeaderSec">
            {/* {headerComp} */}
            <div className={`${style1.headline} headerTitle target_header`}>{json0Data?.PrintHeadLabel}</div>
            <div className={`${style1.companyDetails} target_header`}>
              <div className={`${style1.companyhead} p-2`}>
                <div className={`${style1.lines} tax_fs_12`} style={{ fontWeight: "bold" }}>
                  {json0Data?.CompanyFullName}
                </div>
                <div className={`${style1.lines} tax_fs_12`}>{json0Data?.CompanyAddress}</div>
                <div className={`${style1.lines} tax_fs_12`}>{json0Data?.CompanyAddress2}</div>
                <div className={`${style1.lines} tax_fs_12`}>{json0Data?.CompanyCity}-{json0Data?.CompanyPinCode},{json0Data?.CompanyState}({json0Data?.CompanyCountry})</div>
                {/* <div className={`${style1.lines} tax_fs_12`}>Tell No: {json0Data?.CompanyTellNo}</div> */}
                <div className={`${style1.lines} tax_fs_12`}>T {json0Data?.CompanyTellNo} {json0Data?.CompanyTollFreeNo !== "" && ` | TOLL FREE ${json0Data?.CompanyTollFreeNo}`}</div>
                <div className={`${style1.lines} tax_fs_12`}>
                  {json0Data?.CompanyEmail} | {json0Data?.CompanyWebsite}
                </div>
                <div className={`${style1.lines} tax_fs_12`}>
                  {/* {json0Data?.Company_VAT_GST_No} | {json0Data?.Company_CST_STATE}-{json0Data?.Company_CST_STATE_No} | PAN-{json0Data?.Pannumber} */}
                  {json0Data?.Company_VAT_GST_No} | {json0Data?.Company_CST_STATE}-{json0Data?.Company_CST_STATE_No} | PAN-{json0Data?.Pannumber}
                </div>
              </div>
              <div style={{ width: "30%" }} className="d-flex justify-content-end align-item-center h-100">
                <ImageComponent imageUrl={json0Data?.PrintLogo} styles={logoStyle} />
                {/* <img src={json0Data?.PrintLogo} alt="" className={style.headerImg} /> */}
              </div>
            </div>
          </div>
          <div className="d-flex border p-2 justify-content-between">
            <div className={`col-7 d-flex ${style?.font_12}`}>
              <div>
                <p className={`fw-semibold ${style?.customerFirmName} ${style?.font_15}`}>To, </p>

              </div>
              <div className="ps-1">
                <p className={`fw-semibold ${style?.customerFirmName} ${style?.font_15}`}>{json0Data?.customerfirmname}</p>
                <p>{json0Data?.customerstreet}</p>
                <p>{json0Data?.customerregion}</p>
                <p>{json0Data?.customercity} {json0Data?.customerpincode}</p>
                <p>Phno:- {json0Data?.customermobileno}</p>
                <p>{json0Data?.vat_cst_pan} | {json0Data?.Cust_CST_STATE}-{json0Data?.Cust_CST_STATE_No}</p>
              </div>
            </div>
            <div className={`col-5 d-flex flex-column align-items-end ${style?.font_13}`}>
              <div className="d-flex col-8">
                <div className="col-6"><p className="text-end">INVOICE# :	</p></div>
                <div className="col-6"><p className="ps-2 fw-bold">{json0Data?.InvoiceNo}</p></div>
              </div>
              <div className="d-flex col-8">
                <div className="col-6"><p className="text-end">DATE :	</p></div>
                <div className="col-6"><p className="ps-2 fw-bold">{json0Data?.EntryDate}</p></div>
              </div>
              <div className="d-flex col-8">
                <div className="col-6"><p className="text-end">HSN :	</p></div>
                <div className="col-6"><p className="ps-2 fw-bold">{json0Data?.HSN_No}</p></div>
              </div>
            </div>
          </div>
          <div className={`${style?.container}`}>
            {/* table header */}
            <div className={`mt-2 d-flex border-top border-start border-end border-black lightGrey ${style?.rowWisePad} ${style?.nowordBreak}`}>
              <div className={`${style?.srno} border-end d-flex align-items-center justify-content-center border-bottom`}><p className={`fw-bold ${style?.pad_1}`}>Sr</p></div>
              <div className={`${style?.design} border-end d-flex align-items-center justify-content-center border-bottom`}><p className={`fw-bold ${style?.pad_1}`}>Design</p></div>
              <div className={`${style?.diamond} border-end border-bottom`}>
                <div className="d-grid h-100 w-100">
                  <div className="d-flex border-bottom w-100 justify-content-center"><p className={`fw-bold ${style?.pad_1}`}>Diamond</p></div>
                  {/* <div className="d-flex w-100">
                    <div style={{ width: "17%" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Code</p></div>
                    <div style={{ width: "17%" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Size</p></div>
                    <div style={{ width: "11%" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Pcs</p></div>
                    <div style={{ width: "17%" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Wt</p></div>
                    <div style={{ width: "16%" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Rate</p></div>
                    <div style={{ width: "22%" }} className=""><p className={`text-center fw-bold ${style?.pad_1}`}>Amount</p></div>
                  </div> */}
                  <div className="d-flex w-100">
                    <div style={{ width: "70px" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Code</p></div>
                    <div style={{ width: "62px" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Size</p></div>
                    <div style={{ width: "30px" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Pcs</p></div>
                    <div style={{ width: "47px" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Wt</p></div>
                    <div style={{ width: "51px" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Rate</p></div>
                    <div style={{ width: "68.5px" }} className=""><p className={`text-center fw-bold ${style?.pad_1}`}>Amount</p></div>
                  </div>
                </div>
              </div>
              <div className={`${style?.metal} border-end border-bottom`}>
                <div className="d-grid h-100 w-100">
                  <div className="d-flex border-bottom w-100 justify-content-center"><p className={`fw-bold ${style?.pad_1}`}>Metal</p></div>
                  <div className="d-flex w-100">
                    <div style={{ width: "56px" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Quality</p></div>
                    <div style={{ width: "49px" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Wt</p></div>
                    <div style={{ width: "46px" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Rate</p></div>
                    <div style={{ width: "68px" }} className=""><p className={`text-center fw-bold ${style?.pad_1}`}>Amount</p></div>
                  </div>
                </div>
              </div>
              <div className={`${style?.stone} border-end border-bottom`}>
                <div className="d-grid h-100 w-100">
                  <div className="d-flex border-bottom w-100 justify-content-center"><p className={`fw-bold ${style?.pad_1}`}>Stone</p></div>
                  <div className="d-flex w-100">
                    <div style={{ width: "70px" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Code</p></div>
                    <div style={{ width: "63px" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Size</p></div>
                    <div style={{ width: "24px" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Pcs</p></div>
                    <div style={{ width: "40px" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Wt</p></div>
                    <div style={{ width: "51px" }} className=" border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Rate</p></div>
                    <div style={{ width: "68px" }} className=""><p className={`text-center fw-bold ${style?.pad_1}`}>Amount</p></div>
                  </div>
                </div>
              </div>
              <div className={`${style?.otherAmount} border-end d-flex align-items-center justify-content-center border-bottom`}><p className={`text-center text-break fw-bold ${style?.pad_1}`} >Other Amount</p></div>
              <div className={`${style?.labourAmount} border-end border-bottom`}>
                <div className="d-grid h-100 w-100">
                  <div className="d-flex border-bottom w-100 justify-content-center"><p className={`fw-bold ${style?.pad_1}`}>Labour</p></div>
                  <div className="d-flex w-100">
                    <div className="col-5 border-end"><p className={`text-center fw-bold ${style?.pad_1}`}>Rate</p></div>
                    <div className="col-7"><p className={`text-center fw-bold ${style?.pad_1}`}>Amount</p></div>
                  </div>
                </div>
              </div>
              <div className={`${style?.totalAmount} d-flex align-items-center justify-content-center border-bottom`}><p className={`text-center fw-bold ${style?.pad_1}`}>Total Amount</p></div>
            </div>
            {/* table data */}
            {data?.resultArray?.map((e, i) => {
              return <div key={i} className="no_break border-top">
                <div className={`d-flex border-start border-end border-black no_break ${style?.wordBreak} ${style?.rowWisePad}`} key={i}>
                  <div className={`${style?.srno} border-end d-flex align-items-center justify-content-center`}><p className={`${style?.pad_1}`}>{i + 1}</p></div>
                  <div className={`${style?.design} border-end`}>
                    <div className="d-flex justify-content-between pb-1 flex-wrap">
                      <p className={`${style?.pad_1}`}>{e?.designno}</p>
                      <p className={`${style?.pad_1}`}>{e?.SrJobno}</p>
                    </div>
                    <div className="w-100 d-flex justify-content-center align-items-center">{image && <img src={e?.DesignImage} alt="" className="object-fit-contain h-100 w-100 imgWidth3 " onError={handleImageError} />}</div>
                    <p className="text-center">Tunch : <span className="fw-bold">{NumberWithCommas(e?.Tunch, 3)}</span></p>
 
                    <p className="text-center"><span className="fw-bold">{NumberWithCommas(e?.grosswt, 3)} gm</span> Gross</p>
                  </div>
                  <div className={`${style?.diamond} border-end border-bottom`}>
                    <div className="d-flex justify-content-between flex-column h-100">
                      <div>
                        {e?.diamonds?.map((ele, ind) => {
                          return <div className="d-flex w-100" key={ind}>
                            <div style={{ width: "70px" }} className=""><p className={`${style?.pad_1} text-break`}>{ele?.ShapeName} {ele?.QualityName} {ele?.Colorname}	</p></div>
                            <div style={{ width: "62px" }} className=""><p className={`${style?.pad_1} text-break` }>{ele?.SizeName}	</p></div>
                            <div style={{ width: "30px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(ele?.Pcs, 0)}</p></div>
                            <div style={{ width: "47px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(ele?.Wt, 3)}	</p></div>
                            <div style={{ width: "54px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(ele?.Rate, 0)}	</p></div>
                            <div style={{ width: "68.5px" }} className=""><p className={`${style?.pad_1} text-end fw-bold`}>{NumberWithCommas(ele?.Amount, 2)}</p></div>
                          </div>
                        })}
                      </div>
                    </div>
                  </div>
                  <div className={`${style?.metal} border-end border-bottom`}>
                    <div className="d-flex justify-content-between flex-column h-100">
                      <div>
                        {e?.metal?.map((ele, ind) => {
                          return ele?.IsPrimaryMetal === 1 && <div className="d-flex w-100 border-bottom" key={ind}>
                            <div style={{ width: "56px" }} className="text-break"><p className={`${style?.pad_1} text-break w-100`}>{ele?.ShapeName} {ele?.QualityName}</p></div>
                            <div style={{ width: "49px" }} className=""><p className={`${style?.pad_1}  text-end`}>{NumberWithCommas(e?.NetWt, 3)}</p></div>
                            <div style={{ width: "46px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(ele?.Rate, 2)}</p></div>
                            <div style={{ width: "68px" }} className=""><p className={`${style?.pad_1} text-end fw-bold`}>{NumberWithCommas(ele?.Amount, 2)}</p></div>
                          </div>
                        })}
                        {e?.JobRemark !== "" && <div className="d-flex w-100" >
                          <div className="">
                            <p className={`${style?.pad_1}`}>Remark: </p>
                            <p className={`${style?.pad_1} text-break fw-bold`}>{e?.JobRemark}</p></div>
                        </div>}
                      </div>
                    </div>
                  </div>
                  <div className={`${style?.stone} border-end border-bottom`}>
                    <div className="d-flex justify-content-between flex-column h-100">
                      <div>
                        {e?.colorstone?.map((ele, ind) => {
                          return <div className="d-flex w-100" key={ind}>
                            <div style={{ width: "70px" }} className=""><p className={`${style?.pad_1} text-break`}>{ele?.ShapeName} {ele?.QualityName} {ele?.Colorname}</p></div>
                            <div style={{ width: "63px" }} className=""><p className={`${style?.pad_1} text-break`}>{ele?.SizeName}</p></div>
                            <div style={{ width: "24px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(ele?.Pcs, 0)}</p></div>
                            <div style={{ width: "40px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(ele?.Wt, 3)}</p></div>
                            <div style={{ width: "51px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(ele?.Rate, 0)}</p></div>
                            <div style={{ width: "68px" }} className=""><p className={`${style?.pad_1} text-end fw-bold`}>{NumberWithCommas(ele?.Amount, 2)}</p></div>
                          </div>
                        })}
                      </div>
                    </div>
                  </div>
                  <div className={`${style?.otherAmount} border-end border-bottom`}>
                    <div className="d-flex flex-column justify-content-between h-100">
                      <p className={`${style?.pad_1} text-end`}>{NumberWithCommas(e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling, 2)}</p>
                    </div>
                  </div>
                  <div className={`${style?.labourAmount} border-end border-bottom`}>
                    <div className="d-flex flex-column justify-content-between h-100">
                      <div>
                        <div className="d-flex w-100">
                          <div className="col-5"><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(e?.MaKingCharge_Unit, 2)}	</p></div>
                          <div className="col-7"><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(e?.MakingAmount + e?.TotalDiaSetcost + e?.TotalCsSetcost, 2)}</p></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`${style?.totalAmount} border-bottom`}>
                    <div className="d-flex flex-column justify-content-between h-100">
                      <div>
                        <p className={`${style?.pad_1} text-end fw-bold`}>{NumberWithCommas(e?.TotalAmount, 2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`d-flex border-start border-end border-black no_break ${style?.wordBreak} ${style?.rowWisePad}`} key={i}>
                  <div className={`${style?.srno} border-end d-flex align-items-center justify-content-center border-bottom`}><p className={`${style?.pad_1}`}></p></div>
                  <div className={`${style?.design} border-end border-bottom`}>
                    {e?.CertificateNo !== "" && <p className="text-center">Cert# <span className="fw-bold">{e?.CertificateNo}</span></p>}
                  </div>
                  <div className={`${style?.diamond} lightGrey border-end border-bottom`}>
                    <div className="d-flex w-100 border-top fw-bold ">
                      <div style={{ width: "64px" }} className=""><p className={`${style?.pad_1}`}>	</p></div>
                      <div style={{ width: "63px" }} className=""><p className={`${style?.pad_1}`}>	</p></div>
                      <div style={{ width: "35px" }} className=""><p className={`${style?.pad_1} text-end`}>{e?.diamonds?.length > 0 && NumberWithCommas(e?.totals?.diamonds?.Pcs, 0)}</p></div>
                      <div style={{ width: "47px" }} className=""><p className={`${style?.pad_1} text-end`}>{e?.diamonds?.length > 0 && NumberWithCommas(e?.totals?.diamonds?.Wt, 3)}</p></div>
                      {/* <div style={{ width: "42px" }} className=""><p className={`${style?.pad_1} text-end`}></p></div> */}
                      <div style={{ width: "125.5px" }} className=""><p className={`${style?.pad_1} text-end`}>{e?.diamonds?.length > 0 && NumberWithCommas(e?.totals?.diamonds?.Amount, 2)}</p></div>
                    </div>
                  </div>
                  <div className={`${style?.metal} lightGrey border-end border-bottom`}>
                    <div className="d-flex w-100 border-top fw-bold ">
                      <div style={{ width: "56px" }} className=""><p className={`${style?.pad_1}`}></p></div>
                      <div style={{ width: "49px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(e?.NetWt, 3)}</p></div>
                      {/* <div style={{ width: "46px" }} className=""><p className={`${style?.pad_1} text-end`}></p></div> */}
                      <div style={{ width: "114px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(e?.primaryAmount, 2)}</p></div>
                    </div>
                  </div>
                  <div className={`${style?.stone} lightGrey border-end border-bottom`}>
                    <div className="d-flex w-100 border-top fw-bold " >
                      <div style={{ width: "70px" }} className=""><p className={`${style?.pad_1}`}></p></div>
                      <div style={{ width: "63px" }} className=""><p className={`${style?.pad_1}`}></p></div>
                      <div style={{ width: "24px" }} className=""><p className={`${style?.pad_1} text-end`}>{e?.colorstone?.length > 0 && NumberWithCommas(e?.totals?.colorstone?.Pcs, 0)}</p></div>
                      <div style={{ width: "40px" }} className=""><p className={`${style?.pad_1} text-end`}>{e?.colorstone?.length > 0 && NumberWithCommas(e?.totals?.colorstone?.Wt, 3)}</p></div>
                      {/* <div style={{ width: "45px" }} className=""><p className={`${style?.pad_1} text-end`}></p></div> */}
                      <div style={{ width: "117px" }} className=""><p className={`${style?.pad_1} text-end`}>{e?.colorstone?.length > 0 && NumberWithCommas(e?.totals?.colorstone?.Amount, 2)}</p></div>
                    </div>
                  </div>
                  <div className={`${style?.otherAmount} lightGrey border-end border-bottom`}>
                    <p className={`${style?.pad_1} text-end border-top  fw-bold`}>{NumberWithCommas(e?.OtherCharges + e?.MiscAmount + e?.TotalDiamondHandling, 2)}</p>
                  </div>
                  <div className={`${style?.labourAmount} lightGrey border-end border-bottom`}>
                    <div className="d-flex w-100 border-top fw-bold ">
                      <div className="col-1"><p className={`${style?.pad_1} text-end`}>	</p></div>
                      <div className="col-11"><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(e?.MakingAmount + e?.TotalDiaSetcost + e?.TotalCsSetcost, 2)}</p></div>
                    </div>
                  </div>
                  <div className={`${style?.totalAmount} lightGrey border-bottom`}>
                    <div className="border-top fw-bold ">
                      <p className={`${style?.pad_1} text-end`}>{NumberWithCommas(e?.TotalAmount, 2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            })}
            {/* table tax */}
            <div className={`d-flex border-start border-end border-black no_break ${style?.wordBreak} ${style?.rowWisePad}`}>
              <div className={`${style?.cgst} border-end border-bottom`}>
                {data?.allTaxes?.map((e, i) => {
                  return <p className={`${style?.pad_1} text-end`} key={i}>{e?.name} @ {e?.per}	</p>
                })}
                {json0Data?.FreightCharges !== 0 && <p className={`${style?.pad_1} text-end`} >{json0Data?.ModeOfDel}	</p>}
                {json0Data?.AddLess !== 0 && <p className={`${style?.pad_1} text-end`} >{json0Data?.AddLess > 0 ? "Add" : "Less"}	</p>}
              </div>
              <div className={`${style?.totalAmount} border-bottom`}>
                {data?.allTaxes?.map((e, i) => {
                  return <p className={`${style?.pad_1} text-end`} key={i}>{NumberWithCommas(e?.amount * json0Data?.CurrencyExchRate, 2)}</p>
                })}
                {json0Data?.FreightCharges !== 0 && <p className={`${style?.pad_1} text-end`} >{formatAmount(json0Data?.FreightCharges)}	</p>}
                {json0Data?.AddLess !== 0 && <p className={`${style?.pad_1} text-end`} >{NumberWithCommas(json0Data?.AddLess, 2)}	</p>}
              </div>
            </div>
            {/* table total */}
            <div className={`d-flex border-start border-end border-black no_break lightGrey fw-bold border-bottom mb-1 ${style?.wordBreak} ${style?.rowWisePad}`}>
              <div className={`${style?.srno} border-end d-flex align-items-center justify-content-center`}><p className={`${style?.pad_1}`}></p></div>
              <div className={`${style?.design} border-end border-bottom d-flex align-items-center justify-content-center`}>
                <p className="fw-bold">TOTAL</p>
              </div>
              <div className={`${style?.diamond} border-end border-bottom d-flex`}>
                <div style={{ width: "70px" }} className=""><p className={`${style?.pad_1}`}>	</p></div>
                <div style={{ width: "63px" }} className=""><p className={`${style?.pad_1}`}>	</p></div>
                <div style={{ width: "30px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(data?.mainTotal?.diamonds?.Pcs, 0)}</p></div>
                <div style={{ width: "47px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(data?.mainTotal?.diamonds?.Wt, 3)}</p></div>
                {/* <div style={{ width: "47px" }} className=""><p className={`${style?.pad_1} text-end`}></p></div> */}
                <div style={{ width: "125.5px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(data?.mainTotal?.diamonds?.Amount, 2)}</p></div>
              </div>
              <div className={`${style?.metal} border-end border-bottom d-flex`}>
                <div style={{ width: "56px" }} className=""><p className={`${style?.pad_1}`}></p></div>
                <div style={{ width: "49px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(data?.mainTotal?.netwt, 3)}</p></div>
                <div style={{ width: "46px" }} className=""><p className={`${style?.pad_1} text-end`}></p></div>
                <div style={{ width: "68px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(data?.mainTotal?.metal?.IsPrimaryMetal_Amount, 2)}</p></div>
              </div>
              <div className={`${style?.stone} border-end border-bottom d-flex`}>
                <div style={{ width: "70px" }} className=""><p className={`${style?.pad_1} text-end`}></p></div>
                <div style={{ width: "63px" }} className=""><p className={`${style?.pad_1} text-end`}></p></div>
                <div style={{ width: "24px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(data?.mainTotal?.colorstone?.Pcs, 0)}</p></div>
                <div style={{ width: "45px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(data?.mainTotal?.colorstone?.Wt, 3)}</p></div>
                {/* <div style={{ width: "40px" }} className=""><p className={`${style?.pad_1} text-end`}></p></div> */}
                <div style={{ width: "117px" }} className=""><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(data?.mainTotal?.colorstone?.Amount, 2)}</p></div>
              </div>
              <div className={`${style?.otherAmount} border-end border-bottom`}>
                <p className={`${style?.pad_1} text-end`}>{NumberWithCommas(data?.mainTotal?.total_other_charges + data?.mainTotal?.totalMiscAmount + data?.mainTotal?.total_diamondHandling, 2)}</p>
              </div>
              <div className={`${style?.labourAmount} border-end border-bottom`}>
                <div className="d-grid h-100 w-100">
                  <div className="d-flex w-100">
                    <div className="col-1"><p className={`${style?.pad_1} text-end`}></p></div>
                    <div className="col-11"><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(data?.mainTotal?.total_Making_Amount + data?.mainTotal?.diamonds?.SettingAmount + data?.mainTotal?.colorstone?.SettingAmount, 2)}</p></div>
                  </div>
                </div>
              </div>
              <div className={`${style?.totalAmount} border-bottom`}><p className={`${style?.pad_1} text-end`}>{NumberWithCommas(data?.mainTotal?.total_amount +
                data?.allTaxes?.reduce((acc, cObj) => acc + (+cObj?.amount * json0Data?.CurrencyExchRate), 0) + json0Data?.AddLess + json0Data?.FreightCharges, 2)}</p></div>
            </div>
            {/* table summary */}
            <div className={`d-flex no_break ${style?.rowWisePad} ${style?.wordBreak}`}>
              <div className="col-6 d-flex">
                <div className="col-8 border-start border-end h-100">
                  <div className=" text-center border-bottom border-top h-100">
                    <p className={`lightGrey fw-bold border-bottom ${style?.pad_1}`}>SUMMARY</p>
                    <div className="d-flex " style={{ height: "calc(100% - 15px)" }}>
                      <div className="col-6 border-end px-1 position-relative" style={{ paddingBottom: "15px" }}>
                      {
                          MetShpWise?.map((e, i) => {
                            return <div className="d-flex justify-content-between" key={i}>
                            <div className="fw-bold">{e?.ShapeName}</div>
                            <div className="text-end">{NumberWithCommas(e?.metalfinewt, 3)} gm</div>
                          </div>
                          })
                        }
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold">GROSS WT	</p>
                          <p className="text-end">{NumberWithCommas(data?.mainTotal?.grosswt, 3)} gm	</p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold">WT	</p>
                          <p className="text-end">{NumberWithCommas(data?.mainTotal?.netwt, 3)} gm	</p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold text-start"> DIAMOND WT	</p>
                          <p className="text-end">{NumberWithCommas(data?.mainTotal?.diamonds?.Pcs, 0)} / {NumberWithCommas(data?.mainTotal?.diamonds?.Wt, 3)} cts	</p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p className="fw-bold">STONE WT	</p>
                          <p className="text-end">{NumberWithCommas(data?.mainTotal?.colorstone?.Pcs, 0)} / {NumberWithCommas(data?.mainTotal?.colorstone?.Wt, 3)} cts		</p>
                        </div>
                        <div className={`d-flex justify-content-between position-absolute bottom-0 start-0 w-100 border-top lightGrey px-1 ${style?.minHeight}`} >

                        </div>
                      </div>
                      <div className="col-6 px-1 position-relative" style={{ paddingBottom: "15px" }}>
                        <div className="d-flex justify-content-between">
                          <div className="fw-bold">GOLD	</div>
                          <div className="text-end">{NumberWithCommas((data?.mainTotal?.metal?.IsPrimaryMetal_Amount - notGoldMetalTotal), 2)} </div>
                        </div>
                        {
                          MetShpWise?.map((e, i) => {
                            return <div className="d-flex justify-content-between" key={i}>
                            <div className="fw-bold">{e?.ShapeName}</div>
                            <div className="text-end">{NumberWithCommas(e?.Amount, 2)} </div>
                          </div>
                          })
                        }
                        <div className="d-flex justify-content-between">
                          <div className="fw-bold">DIAMOND	</div>
                          <div className="text-end">{NumberWithCommas(data?.mainTotal?.diamonds?.Amount, 2)} </div>
                        </div>
                        <div className="d-flex justify-content-between">
                          <div className="fw-bold">CST	</div>
                          <div className="text-end">{NumberWithCommas(data?.mainTotal?.colorstone?.Amount, 2)} </div>
                        </div>
                        <div className="d-flex justify-content-between">
                          <div className="fw-bold">MAKING	</div>
                          <div className="text-end">{NumberWithCommas(data?.mainTotal?.total_Making_Amount + data?.mainTotal?.diamonds?.SettingAmount + data?.mainTotal?.colorstone?.SettingAmount, 2)} </div>
                        </div>
                        <div className="d-flex justify-content-between">
                          <div className="fw-bold">OTHER	</div>
                          <div className="text-end">{NumberWithCommas(data?.mainTotal?.total_other_charges + data?.mainTotal?.totalMiscAmount + data?.mainTotal?.total_diamondHandling, 2)} 	</div>
                        </div>
                        <div className="d-flex justify-content-between">
                          <div className="fw-bold">TAX	</div>
                          <div className="text-end"> 	{NumberWithCommas(tax, 2)}		</div>
                        </div>  
                        {json0Data?.AddLess !== 0 && <div className="d-flex justify-content-between">
                          <div className="fw-bold">{json0Data?.AddLess < 0 ? "LESS" : "ADD"}	</div>
                          <div className="text-end">{NumberWithCommas(json0Data?.AddLess, 2)}	</div>
                        </div>}
                        <div className={`d-flex justify-content-between position-absolute bottom-0 start-0 w-100 border-top lightGrey px-1 ${style?.minHeight}`}>
                          <div className="fw-bold">TOTAL	</div>
                          <div className="text-end">{NumberWithCommas(data?.mainTotal?.total_amount +
                data?.allTaxes?.reduce((acc, cObj) => acc + (+cObj?.amount * json0Data?.CurrencyExchRate), 0) + json0Data?.AddLess, 2)}	</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className=" col-4 border-end border-bottom border-top position-relative h-100" style={{ height: "calc(100% - 15px)" }}>
                  <p className={`lightGrey fw-bold ${style?.pad_1} text-center border-bottom`}>Diamond Detail </p>
                  {diamonds.map((e, i) => {
                    return <div key={i} className="d-flex justify-content-between px-1">
                      <p className="fw-bold">{e?.ShapeName} {e?.QualityName} </p>
                      <p>{NumberWithCommas(e?.Pcs, 0)} / {NumberWithCommas(e?.Wt, 3)} Cts</p>
                    </div>
                  })
                  }
                  <div className={`d-flex justify-content-between position-absolute bottom-0 start-0 w-100 border-top lightGrey px-1 ${style?.minHeight}`} >

                  </div>
                </div>
              </div>
              <div className="col-3 border-bottom border-end border-start border-top">
                <p className={`fw-bold ${style?.pad_1} text-center border-bottom p-1 lightGrey`}>Summary Detail </p>
                {category.map((e, i) => {
                  return <div className="d-flex px-1" key={i}>
                    <p className="col-8">{e?.Categoryname}</p>
                    <p className="col-1">:</p>
                    <p className="col-3 fw-bold">{NumberWithCommas(e?.Quantity, 0)}</p>
                  </div>
                })}
              </div>
              {json0Data?.PrintRemark &&(
                  <div className="col-2 border-bottom border-end border-start border-top h-100">
                  <p className={`fw-bold ${style?.pad_1} text-center border-bottom p-1 lightGrey`}>Remark </p>
                  <p className="px-1 text-break" dangerouslySetInnerHTML={{__html:json0Data?.PrintRemark}}></p>
                </div>
              )}
              
            </div>
            {/* note */}
            <div className={`border my-1 no_break ${style?.rowWisePad} ${style?.wordBreak}`}>
              <p className="fw-bold pt-2 px-2" style={{ fontSize: "13px" }}> NOTE :</p>
              <div className={`px-2 pb-2 ${style?.declaration}`} dangerouslySetInnerHTML={{ __html: json0Data?.Declaration }}></div>
            </div>
            <div style={{margin:"10px 0"}}>
                <p className="fw-bold pb-1 font_14_sum4">
                                TERMS INCLUDED : &nbsp;
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: json0Data?.SalesRepPolicyTermsDescription,
                                  }}
                                  style={{ fontWeight: "400" }}
                                />
                              </p>
            </div>
            {/* signature */}
            <div className={`border my-1 no_break d-flex ${style?.rowWisePad} ${style?.wordBreak}`}>
              <div className="text-center pt-5 w-50 border-end fw-bold">RECEIVER'S SIGNATURE & SEAL	</div>
              <div className="text-center pt-5 w-50 fw-bold">for, {json0Data?.CompanyFullName}</div>
            </div>
            <p className={`text-secondary ${style?.rowWisePad} ${style?.wordBreak}`}>**   THIS IS A COMPUTER GENERATED INVOICE AND KINDLY NOTIFY US IMMEDIATELY IN CASE YOU FIND ANY DISCREPANCY IN THE DETAILS OF TRANSACTIONS</p>
          </div>
        </div> : <p className='text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto'>{msg}</p>
    }</>
  );
};

export default TaxInvoice;
