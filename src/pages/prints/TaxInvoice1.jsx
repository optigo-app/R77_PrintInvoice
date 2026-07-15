import React, { useEffect, useState } from "react";
import convertor from "number-to-words";
import "../../assets/css/prints/taxInvoice1.css";
import {
  CapitalizeWords,
  GovernMentDocuments,
  NumberWithCommas,
  ReceiveInBank,
  apiCall,
  checkMsg,
  fixedValues,
  handleImageError,
  handlePrint,
  isObjectEmpty,
  taxGenrator,
} from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import { ToWords } from "to-words";
import { cloneDeep } from "lodash";
import NumToWord from "../../GlobalFunctions/NumToWord";

const TaxInvoice1 = ({ urls, token, invoiceNo, printName, evn, ApiVer }) => {
  const [image, setimage] = useState(false);
  const [BillPrint_Json, setBillPrint_Json] = useState({});
  const [BillPrint_Jso1, setBillPrint_Json1] = useState([]);
  const [BillPrint_Json2, setBillPrint_Json2] = useState([]);
  const [resultArr, setResultArr] = useState([]);
  const [totalAmount, setTotalAmount] = useState({});
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(true);
  const toWords = new ToWords();
  const [taxes, setTaxes] = useState([]);
  const [bank, setBank] = useState([]);
  const [isImageWorking, setIsImageWorking] = useState(true);
  const [document, setDocument] = useState([]);
  const handleImageErrors = () => {
    setIsImageWorking(false);
  };
  const handleChange = (e) => {
    image ? setimage(false) : setimage(true);
  };

  const findMaterials = (json2, json1, json0) => {

    const groupedObjects = {};

    json2.forEach((item) => {
      if (json1.some((srItem) => srItem.SrJobno === item.StockBarcode)) {
        if ((item?.MasterManagement_DiamondStoneTypeid === 3 && item?.IsHSCOE !== 0) || (item?.MasterManagement_DiamondStoneTypeid === 5)) {

        } else {
          if (!groupedObjects[item.StockBarcode]) {
            groupedObjects[item.StockBarcode] = [];
          }
          groupedObjects[item.StockBarcode].push(item);
        }

      }
    });
    const resultArray = Object.keys(groupedObjects).map((key) => ({
      SrjobNo: key,
      data: groupedObjects[key],
    }));

    let arrResult = [];
    let diamondCsWt = 0
    resultArray.forEach((e, i) => {
      let diamonds = [];
      let colorStones = [];
      let miscs = [];
      e?.data?.forEach((ele, ind) => {
        if (ele?.MasterManagement_DiamondStoneTypeid === 1) {
          diamondCsWt += ele?.Wt;
          let findDiamond = diamonds?.findIndex((elem, index) => elem?.ShapeName === ele?.ShapeName &&
            elem?.QualityName === ele?.QualityName && elem?.Colorname === ele?.Colorname &&
            elem?.Rate === ele?.Rate);
          if (findDiamond === -1) {
            diamonds?.push(ele);
          } else {
            diamonds[findDiamond].Wt += ele?.Wt
            diamonds[findDiamond].Pcs += ele?.Pcs
            diamonds[findDiamond].Amount += ele?.Amount
          }
        }
        else if (ele?.MasterManagement_DiamondStoneTypeid === 2) {
          diamondCsWt += ele?.Wt;
          let findColorStones = colorStones?.findIndex((elem, index) => elem?.ShapeName === ele?.ShapeName && elem?.QualityName === ele?.QualityName && elem?.Colorname === ele?.Colorname &&
            elem?.isRateOnPcs === ele?.isRateOnPcs && elem?.Rate === ele?.Rate);
          if (findColorStones === -1) {
            colorStones?.push(ele);
          } else {
            colorStones[findColorStones].Wt += ele?.Wt
            colorStones[findColorStones].Pcs += ele?.Pcs
            colorStones[findColorStones].Amount += ele?.Amount
          }
        }
        else if (ele?.MasterManagement_DiamondStoneTypeid === 3 && ele?.IsHSCOE === 0) {
          let findMisc = miscs?.findIndex((elem, index) => ele?.ShapeName === elem?.ShapeName);
          if (findMisc === -1) {
            miscs?.push(ele);
          } else {
            miscs[findMisc].Wt += ele?.Wt
            miscs[findMisc].Pcs += ele?.Pcs
            miscs[findMisc].Amount += ele?.Amount
          }
        }
      });


      const mergedArray = e.data.reduce((result, current) => {
        const existingItem = result.find((item) => item.Rate === current.Rate && item.ShapeName === current.ShapeName);
        if (existingItem) {
          existingItem.gwt += current.gwt;
          existingItem.cst += current.cst;
          existingItem.Rate += current.Rate;
          existingItem.Amount += current.Amount;
        } else {
          result.push({ ...current });
        }

        return result;
      }, []);
      let dataArr = [];
      mergedArray?.forEach((ele, ind) => {
        if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
          dataArr?.push(ele)
        }
      })
      arrResult.push({ jobNo: e.SrjobNo, data: dataArr, diamonds: diamonds, colorStones: colorStones, miscs: miscs });
    });
    let finalArr = [];
    let totalobj = {
      TotalAmount: 0,
      totalOtherAmount: 0,
      netWeight: 0,
      diaWt: 0,
      gwt: 0,
      discountAmt: 0,
      weightInGram: 0,
      UnitCost: 0,
      primaryWts: 0
    };
    json1.forEach((e, i) => {

      // totalobj.totalOtherAmount += e?.MetalAmount + e?.OtherCharges;
      arrResult.forEach((ele, ind) => {
        if (e.SrJobno === ele.jobNo) {
          // let totalAmount = 0;
          let arr = [];
          let miscArr = [];
          ele.data.forEach((element, index) => {
            let obj = { ...element };
            if (element.MasterManagement_DiamondStoneTypeid === 4) {
              arr.push(obj);
              obj.materialCharges = 0;
            } else {
              // obj.materialCharges = +((obj.Rate * obj.Wt).toFixed(2));
              obj.materialCharges = obj?.Amount;
              // totalobj.totalOtherAmount += obj.materialCharges;
              if (element?.MasterManagement_DiamondStoneTypeid === 3) {
                if (element?.IsHSCOE === 0) {
                  miscArr?.push(element);
                }
              }
            }

            // totalobj.TotalAmount += element.Amount;
            if (
              element?.MasterManagement_DiamondStoneTypeid !== 4 &&
              element?.MasterManagement_DiamondStoneTypeid !== 3 &&
              element?.MasterManagement_DiamondStoneTypeid !== 5
            ) {
              totalobj.diaWt += element.Wt;
            }
            else if (element?.MasterManagement_DiamondStoneTypeid === 3) {
              totalobj.weightInGram += element.Wt;
            }
          });
          ele?.diamonds?.forEach((elem, index) => {
            totalobj.diaWt += elem?.Wt;
          });
          ele?.colorStones?.forEach((elem, index) => {
            totalobj.diaWt += elem?.Wt;
          });
          ele?.miscs?.forEach((elem, index) => {
            totalobj.weightInGram += elem.Wt;
          })
          // finalArr.push({ jobNo: e.SrJobno, data: arr, mainData: e, totalAmount: totalAmount });
          finalArr.push({ jobNo: e.SrJobno, data: arr, mainData: e, miscArr: miscArr, diamonds: ele?.diamonds, colorStones: ele?.colorStones, miscs: ele?.miscs });
        }
      });
      totalobj.TotalAmount += e?.TotalAmount;
      totalobj.UnitCost += e?.UnitCost;
      // totalobj.totalOtherAmount += e?.OtherCharges;
      totalobj.netWeight += e?.NetWt + e?.LossWt;

      totalobj.discountAmt += e?.DiscountAmt;
    });
    totalobj.cgstTax = +((json0[0].CGST / 100) * +totalobj.TotalAmount).toFixed(
      2
    );
    totalobj.sgstTax = +((json0[0].SGST / 100) * +totalobj.TotalAmount).toFixed(
      2
    );
    totalobj.TotalAmount = +totalobj.TotalAmount.toFixed(2);
    // totalobj.totalOtherAmount = +totalobj.totalOtherAmount.toFixed(2);
    // totalobj.totalAmountAfterTax = +((totalobj.TotalAmount + totalobj.cgstTax + totalobj.sgstTax - totalobj.discountAmt).toFixed(2));

    // tax
    totalobj.totalAmountAfterTax = totalobj.TotalAmount + json0[0]?.AddLess;
    let taxValue = taxGenrator(json0[0], totalobj.TotalAmount);
    setTaxes(taxValue);
    taxValue.forEach((e, i) => {
      totalobj.totalAmountAfterTax += +e?.amount;
    });

    totalobj.totalAmountAfterTax = totalobj.totalAmountAfterTax.toFixed(2);
    // tax end

    // totalobj.gwt = +totalobj.gwt.toFixed(2);
    totalobj.discountAmt = +totalobj.discountAmt.toFixed(2);
    let debitCardinfo = ReceiveInBank(json0[0]?.BankPayDet);
    setBank(debitCardinfo);
    // totalobj.netBalanceAmount = +((totalobj.totalAmountAfterTax - json0[0].OldGoldAmount - json0[0].AdvanceAmount - json0[0].CashReceived - json0[0].BankReceived).toFixed(2));
    totalobj.netBalanceAmount = +(
      totalobj.totalAmountAfterTax -
      json0[0].OldGoldAmount -
      json0[0].AdvanceAmount -
      json0[0].CashReceived
    );
    debitCardinfo.length > 0 &&
      debitCardinfo.forEach((e, i) => {
        totalobj.netBalanceAmount -= e?.amount;
      });
    // totalobj.textnumber = CapitalizeWords(convertor.toWords(Math.round(totalobj.netBalanceAmount)));
    totalobj.textnumber =
      toWords.convert(+totalobj.netBalanceAmount?.toFixed(2)) + " Only";
    // setResultArr(finalArr);

    // let semiFinalArr = [];

    // finalArr.forEach((e, i) => {
    //   let obj = cloneDeep(e);
    //   obj.metalRate = obj?.data?.find((ele, ind) => ele?.MasterManagement_DiamondStoneTypeid === 4 && ele?.IsPrimaryMetal === 1)?.Rate || 0;
    //   if (obj?.mainData?.GroupJob === "") {
    //     let findMetals = obj.data?.findIndex((ele, ind) => ele?.MasterManagement_DiamondStoneTypeid === 4);
    //     if (findMetals !== -1) {
    //       //   obj.data[findMetals].materialCharges = obj.data[findMetals]?.Amount;
    //     }
    //     semiFinalArr.push(obj);
    //   } else {
    //     let findRec = semiFinalArr.findIndex((ele, ind) => ele?.mainData?.GroupJob === obj?.mainData?.GroupJob && ele?.metalRate === obj?.metalRate);
    //     if (findRec === -1) {
    //       semiFinalArr.push(obj);
    //     } else {
    //       let mainMetals = [];
    //       let whichArr = "";
    //       if (semiFinalArr[findRec].mainData.SrJobno !== semiFinalArr[findRec].mainData.GroupJob) {
    //         semiFinalArr[findRec].mainData.SrJobno = semiFinalArr[findRec].mainData.GroupJob;
    //       } else {
    //         mainMetals = semiFinalArr[findRec].data.filter((ele, ind) => ele?.MasterManagement_DiamondStoneTypeid === 4);
    //         whichArr = "semiFinal";
    //       }
    //       if (obj.mainData.SrJobno === obj.mainData.GroupJob) {
    //         semiFinalArr[findRec].mainData.Categoryname = obj.mainData.Categoryname;
    //         semiFinalArr[findRec].mainData.SubCategoryname = obj.mainData.SubCategoryname;
    //         semiFinalArr[findRec].mainData.Collectionname = obj.mainData.Collectionname;
    //         semiFinalArr[findRec].mainData.designno = obj.mainData.designno;
    //         semiFinalArr[findRec].mainData.HUID = obj.mainData.HUID;
    //         mainMetals = obj.data.filter((ele, ind) => ele?.MasterManagement_DiamondStoneTypeid === 4);
    //         whichArr = "obj";
    //       }
    //       let alldiamonds = [...obj?.diamonds, ...semiFinalArr[findRec]?.diamonds]?.flat();
    //       let blankDiamonds = [];
    //       alldiamonds?.forEach((ele, ind) => {
    //         let findDiamond = blankDiamonds?.findIndex((elem, index) => elem?.ShapeName === ele?.ShapeName && elem?.QualityName === ele?.QualityName && elem?.Colorname === ele?.Colorname &&
    //           elem?.Rate === ele?.Rate);
    //         if (findDiamond === -1) {
    //           blankDiamonds?.push(ele);
    //         } else {
    //           blankDiamonds[findDiamond].Wt += ele?.Wt;
    //           blankDiamonds[findDiamond].Pcs += ele?.Pcs;
    //           blankDiamonds[findDiamond].Amount += ele?.Amount;
    //         }
    //       })
    //       let allColorStones = [...obj?.colorStones, ...semiFinalArr[findRec]?.colorStones]?.flat();
    //       let blankColorStones = [];
    //       allColorStones?.forEach((ele, ind) => {
    //         let findColorStone = blankColorStones?.findIndex((elem, index) => elem?.ShapeName === ele?.ShapeName && elem?.QualityName === ele?.QualityName && 
    //         elem?.Colorname === ele?.Colorname && elem?.isRateOnPcs === ele?.isRateOnPcs && elem?.Rate === ele?.Rate);
    //         if (findColorStone === -1) {
    //           blankColorStones?.push(ele);
    //         } else {
    //           blankColorStones[findColorStone].Wt += ele?.Wt;
    //           blankColorStones[findColorStone].Pcs += ele?.Pcs;
    //           blankColorStones[findColorStone].Amount += ele?.Amount;
    //         }
    //       })
    //       let allMiscs = [...obj?.miscs, ...semiFinalArr[findRec]?.miscs]?.flat();
    //       let blankMiscs = [];
    //       allMiscs?.forEach((ele, ind) => {
    //         let findMiscs = blankMiscs?.findIndex((elem, index) => ele?.ShapeName === elem?.ShapeName);
    //         if (findMiscs === -1) {
    //           blankMiscs?.push(ele);
    //         } else {
    //           blankMiscs[findMiscs].Wt += ele?.Wt;
    //           blankMiscs[findMiscs].Pcs += ele?.Pcs;
    //           blankMiscs[findMiscs].Amount += ele?.Amount;
    //         }
    //       })
    //       semiFinalArr[findRec].mainData.MakingAmount += obj.mainData.MakingAmount;
    //       semiFinalArr[findRec].mainData.TotalAmount += obj.mainData.TotalAmount;
    //       semiFinalArr[findRec].mainData.grosswt += obj.mainData.grosswt;
    //       semiFinalArr[findRec].mainData.NetWt += obj.mainData.NetWt;
    //       semiFinalArr[findRec].mainData.LossWt += obj.mainData.LossWt;
    //       semiFinalArr[findRec].mainData.MetalAmount += obj.mainData.MetalAmount;
    //       semiFinalArr[findRec].mainData.UnitCost = +semiFinalArr[findRec].mainData.UnitCost + +obj.mainData.UnitCost;
    //       semiFinalArr[findRec].mainData.OtherCharges += obj.mainData.OtherCharges;
    //       semiFinalArr[findRec].mainData.TotalDiamondHandling += obj.mainData.TotalDiamondHandling;
    //       semiFinalArr[findRec].diamonds = blankDiamonds;
    //       semiFinalArr[findRec].colorStones = blankColorStones;
    //       semiFinalArr[findRec].miscs = blankMiscs;

    //       // for metals
    //       let blankMetals = [];
    //       if (whichArr === "semiFinal") {
    //         let otherMetals = obj.data.filter((ele, ind) => ele?.MasterManagement_DiamondStoneTypeid === 4);
    //         otherMetals.forEach((ele, ind) => {
    //           let objj = { ...ele };
    //           let newMetal = true;
    //           mainMetals.forEach((elem, index) => {
    //             if (elem?.ShapeName === objj?.ShapeName) {
    //               elem.Amount += objj?.Amount;
    //               elem.Pcs += objj?.Pcs;
    //               elem.Wt += objj?.Wt;
    //               newMetal = false;
    //               if (
    //                 elem?.IsPrimaryMetal !== 1 &&
    //                 objj?.IsPrimaryMetal === 1
    //               ) {
    //                 elem.QualityName = objj?.QualityName;
    //               }
    //             }
    //           });
    //           if (newMetal) {
    //             mainMetals.push(objj);
    //           }
    //         });
    //         blankMetals = mainMetals;
    //       } else if (whichArr === "obj") {
    //         let otherMetals = semiFinalArr[findRec].data.filter((ele, ind) => ele?.MasterManagement_DiamondStoneTypeid === 4);
    //         otherMetals.forEach((ele, ind) => {
    //           let objj = { ...ele };
    //           let newMetal = true;
    //           mainMetals.forEach((elem, index) => {
    //             if (elem?.ShapeName === objj?.ShapeName) {
    //               elem.Amount += objj?.Amount;
    //               elem.Pcs += objj?.Pcs;
    //               elem.Wt += objj?.Wt;
    //               newMetal = false;
    //               elem.materialCharges += objj.Amount;
    //               if (
    //                 elem?.IsPrimaryMetal !== 1 &&
    //                 objj?.IsPrimaryMetal === 1
    //               ) {
    //                 elem.QualityName = objj?.QualityName;
    //               }
    //             }
    //           });
    //           if (newMetal) {
    //             mainMetals.push(objj);
    //           }
    //         });
    //         blankMetals = mainMetals;
    //       } else {
    //         let metals = [
    //           semiFinalArr[findRec].data.filter((ele, ind) => ele?.MasterManagement_DiamondStoneTypeid === 4),
    //           obj.data.filter((ele, ind) => ele?.MasterManagement_DiamondStoneTypeid === 4
    //           ),
    //         ].flat();
    //         let blankM = [];
    //         metals.forEach((ele, ind) => {
    //           let findMetals = blankM.findIndex((elee) => elee?.ShapeName === ele?.ShapeName);
    //           if (findMetals === -1) {
    //             blankM.push(ele);
    //           } else {
    //             blankM[findMetals].Wt += ele?.Wt;
    //             blankM[findMetals].Pcs += ele?.Pcs;
    //             blankM[findMetals].amount += ele?.amount;
    //             // blankM[findMetals].materialCharges += +((ele.Rate * ele.Wt).toFixed(2));
    //             blankM[findMetals].materialCharges += ele?.Amount;
    //             if (
    //               blankM[findMetals].IsPrimaryMetal !== 1 &&
    //               ele?.IsPrimaryMetal === 1
    //             ) {
    //               blankM[findMetals].QualityName = ele?.QualityName;
    //             }
    //           }
    //         });
    //         blankMetals = blankM;
    //       }

    //       let findMetalRate = semiFinalArr[findRec].mainData.MetalAmount / (semiFinalArr[findRec].mainData.NetWt + semiFinalArr[findRec].mainData.LossWt);
    //       if (blankMetals[0]) {
    //         blankMetals[0].Rate = findMetalRate;
    //       }
    //       // for materials
    //       let blankMaterials = [];
    //       let materials = [semiFinalArr[findRec].data.filter((ele, ind) => ele?.MasterManagement_DiamondStoneTypeid !== 4), obj.data.filter((ele, ind) => ele?.MasterManagement_DiamondStoneTypeid !== 4),].flat();
    //       materials.forEach((ele, ind) => {
    //         let findMaterial = blankMaterials.findIndex((elem, index) => elem?.MasterManagement_DiamondStoneTypeid === ele?.MasterManagement_DiamondStoneTypeid && elem?.ShapeName === ele?.ShapeName);
    //         if (findMaterial === -1) {
    //           blankMaterials.push(ele);
    //         } else {
    //           blankMaterials[findMaterial].Wt += ele?.Wt;
    //           blankMaterials[findMaterial].Pcs += ele?.Pcs;
    //           blankMaterials[findMaterial].Amount += ele?.Amount;
    //           // blankMaterials[findMaterial].materialCharges += +((ele.Rate * ele.Wt).toFixed(2));
    //           blankMaterials[findMaterial].materialCharges += ele?.Amount;
    //         }
    //       });
    //       blankMaterials.sort((a, b) => {
    //         if (
    //           a.MasterManagement_DiamondStoneTypeid ===
    //           b.MasterManagement_DiamondStoneTypeid
    //         ) {
    //           return a.id - b.id; // If mastermanagementtypeid is the same, sort by ID
    //         } else {
    //           return (
    //             a.MasterManagement_DiamondStoneTypeid -
    //             b.MasterManagement_DiamondStoneTypeid
    //           );
    //         }
    //       });
    //       semiFinalArr[findRec].data = [...blankMetals,].flat();
    //     }
    //   }
    // });



    // remove group job effets
    const semiFinalArr = [];

    finalArr.forEach((e) => {
      let obj = cloneDeep(e);

      obj.metalRate =
        obj?.data?.find(
          (ele) =>
            ele?.MasterManagement_DiamondStoneTypeid === 4 &&
            ele?.IsPrimaryMetal === 1
        )?.Rate || 0;


      semiFinalArr.push(obj);
    });

    let lastArr = [];
    let primaryWts = 0;
    semiFinalArr?.forEach((e, i) => {
      let count = 0;
      let primaryWt = 0;
      e?.data?.forEach((ele, ind) => {
        if (ele?.MasterManagement_DiamondStoneTypeid === 4) {
          count++;
          if (ele?.IsPrimaryMetal === 1) {
            primaryWt += ele?.Wt
          }
        }
      });
      if (count <= 1) {
        primaryWt = e?.mainData?.NetWt + e?.mainData?.LossWt
      }
      let obj = cloneDeep(e);
      obj.primaryWt = primaryWt;
      primaryWts += primaryWt
      lastArr?.push(obj);
    })
    lastArr.sort((a, b) => {
      const nameA = a.mainData.SrJobno.toUpperCase(); // Convert names to uppercase for case-insensitive comparison
      const nameB = b.mainData.SrJobno.toUpperCase();

      if (nameA < nameB) {
        return -1; // 'a' comes before 'b'
      }
      if (nameA > nameB) {
        return 1; // 'b' comes before 'a'
      }
      return 0; // Names are equal
    });

    lastArr?.forEach((e, i) => {

      totalobj.gwt += e?.mainData?.grosswt
    })
    setResultArr(lastArr);
    totalobj.primaryWts = primaryWts;
    semiFinalArr.forEach((e, i) => {
      totalobj.totalOtherAmount += e?.mainData?.MetalAmount + e?.mainData?.OtherCharges + e?.mainData?.TotalDiamondHandling;
      e.data.forEach((ele, ind) => {
        if (ele?.MasterManagement_DiamondStoneTypeid !== 4) {
          totalobj.totalOtherAmount += ele.Amount;
        }
      });
      e?.diamonds?.forEach((ele, ind) => {
        totalobj.totalOtherAmount += ele?.Amount;
      });
      e?.colorStones?.forEach((ele, ind) => {
        totalobj.totalOtherAmount += ele?.Amount;
      });
      e?.miscs?.forEach((ele, ind) => {
        totalobj.totalOtherAmount += ele?.Amount;
      });
    });
    setTotalAmount(totalobj);
  };

  const loadData = (datas) => {
    setBillPrint_Json(datas?.BillPrint_Json[0]);
    setBillPrint_Json1(datas?.BillPrint_Json1);
    setBillPrint_Json2(datas?.BillPrint_Json2);
    findMaterials(
      datas?.BillPrint_Json2,
      datas?.BillPrint_Json1,
      datas?.BillPrint_Json
    );
    setDocument(GovernMentDocuments(datas?.BillPrint_Json[0]?.DocumentDetail));
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

  return (
    <>
      {loader ? (
        <Loader />
      ) : msg === "" ? (
        <div className="container-fluid taxinvoice1 pt-5 mt-5 taxInvoicePirnt1 pad_60_allPrint">
          <div className="d-flex justify-content-end align-items-center print_sec_sum4 pb-4 font_size_16_tax_invoice_1">
            <div className="form-check pe-3 mb-0 pt-0">
              <input
                className="form-check-input border-dark"
                type="checkbox"
                checked={image}
                onChange={(e) => handleChange(e)}
              />
              <label className="form-check-label h6 mb-0 pt-1 fw-medium">
                With Image
              </label>
            </div>
            <div className="form-check ps-3">
              <input
                type="button"
                className="btn_white blue"
                value="Print"
                onClick={(e) => handlePrint(e)}
              />
            </div>
          </div>
          <div className="d-flex justify-content-center pb-2">
            {BillPrint_Json?.Company_VAT_GST_No && (
              <p className="pe-1">
                {BillPrint_Json.Company_VAT_GST_No}
              </p>
            )}

            {BillPrint_Json?.Company_VAT_GST_No &&
              (BillPrint_Json?.Company_CST_STATE ||
                BillPrint_Json?.Company_CST_STATE_No) && (
                <p className="ps-1 pe-1">|</p>
              )}

            {( 
              BillPrint_Json?.Company_CST_STATE_No) && (
                <p className="ps-1 pe-1">
                  {BillPrint_Json?.Company_CST_STATE}
                  {BillPrint_Json?.Company_CST_STATE &&
                    BillPrint_Json?.Company_CST_STATE_No &&
                    "-"}
                  {BillPrint_Json?.Company_CST_STATE_No}
                </p>
              )}

            {BillPrint_Json?.Company_CST_STATE_No &&
              (BillPrint_Json?.Company_VAT_GST_No ||
                BillPrint_Json?.Company_CST_STATE ||
                BillPrint_Json?.Company_CST_STATE_No) && (
                <p className="pe-1 ps-1">|</p>
              )}

            {BillPrint_Json?.Com_pannumber && (
              <p className="ps-1">
                PAN-{BillPrint_Json.Com_pannumber}
              </p>
            )}
          </div>
          <div className="taxinvoice1Head fw-bold text-center mb-1" style={{ fontSize: "20px", minHeight: "33px" }}>
            {BillPrint_Json?.PrintHeadLabel}
          </div>
          <div className="headerInvoice1 d-flex border mb-1 border-black w-100">
            <div className="header_textInvoice1 border-end p-1 header_textInvoicePrint1 col-8">
              <p className="">
                Customer Name:{" "}
                <span className="fw-bold">{BillPrint_Json?.CustName}</span>
              </p>
              <p>{BillPrint_Json?.customerAddress1}</p>
              <p>{BillPrint_Json?.customerAddress2}</p>
              <p>
                {BillPrint_Json?.customercity1}
                {BillPrint_Json?.customerpincode}
              </p>
              <p>{BillPrint_Json?.customercountry}</p>
              <p>{BillPrint_Json?.customeremail1}</p>
              <p>Phno:{BillPrint_Json?.customermobileno}</p>
              <p>{BillPrint_Json?.vat_cst_pan} {BillPrint_Json?.aadharno !== "" && ` | Aadhar-${BillPrint_Json?.aadharno}`}</p>
              <p>
                {BillPrint_Json?.Cust_CST_STATE} -{" "}
                {BillPrint_Json?.Cust_CST_STATE_No}
              </p>
            </div>
            <div className="header_text_invoice_num header_text_invoice_numPrint1 p-1 col-4">
              <div className="d-flex w-100 ">
                <p className="customer_data_invoice1 fw-bold col-6">INVOICE NO</p>
                <p className="col-6">{BillPrint_Json?.InvoiceNo}</p>
              </div>
              <div className="d-flex w-100 ">
                <p className="customer_data_invoice1 fw-bold col-6">DATE</p>
                <p className="col-6">{BillPrint_Json?.EntryDate}</p>
              </div>
              {
                document?.map((ele, ind) => {
                  return <div className="d-flex w-100 " key={ind}>
                    <p className="customer_data_invoice1 fw-bold col-6">{ele?.label}</p>
                    <p className="col-6">{ele?.value}</p>
                  </div>
                })
              }
            </div>
          </div>
          <div className="d-flex border-top border-bottom table_invoice1  ">
            <div className="sr_invoice1 sr_invoicePrint1 d-flex align-items-center justify-content-center fw-bold border-start  ">
              Sr#
            </div>
            <div className="product_discription_invoice1 product_discription_invoice_print_1 d-flex align-items-center justify-content-center border-start fw-bold border-end">
              Product Description
            </div>
            <div className="hsn_invoice1 hsn_invoicePrint1 d-flex align-items-center justify-content-center fw-bold border-end">
              HSN
            </div>
            <div className="material_invoice1 materialInvoicePrint1">
              <div className="headHeightInvoice1 d-flex align-items-center justify-content-center fw-bold border-end border-bottom">
                Material Description
              </div>
              <div className="headHeightInvoice1 d-flex w-100">
                <div className=" d-flex align-items-center justify-content-center fw-bold border-end col-2">
                  Material
                </div>
                <div className=" d-flex align-items-center justify-content-center fw-bold border-end col-2">
                  Carat
                </div>
                <div className=" d-flex align-items-center justify-content-center fw-bold border-end col-2">
                  GWT
                </div>
                <div className=" d-flex align-items-center justify-content-center fw-bold border-end col-2">
                  Less Wt
                </div>
                <div className=" d-flex align-items-center justify-content-center fw-bold border-end col-2">
                  NWT
                </div>
                <div className=" d-flex align-items-center justify-content-center fw-bold border-end  col-2">
                  Rate
                </div>
              </div>
            </div>
            <div className="making_invoice1 making_invoicePrint1 d-flex align-items-center justify-content-center fw-bold border-end">
              Making
            </div>
            <div className="others_invoice1 others_invoicePrint1 d-flex align-items-center justify-content-center fw-bold border-end flex-column">
              <p>Material</p>
              <p>Charge</p>
            </div>
            <div className="total_invoice1 total_invoicePrint1 d-flex align-items-center justify-content-center fw-bold border-end  ">
              Total
            </div>
          </div>
          {resultArr.length > 0 &&
            resultArr.map((e, i) => {
              return (
                <div className="d-flex w-100 border-bottom table_row_invoice1 pad_2_tax_invoice_1" key={i} >
                  <div className="d-flex align-items-center justify-content-center sr_invoice1 sr_invoicePrint1 min_padding_invoice1 border-start pad_2_tax_invoice_1 text-center">
                    {i + 1}
                  </div>
                  <div className="product_discription_invoice1 product_discription_invoice_print_1 min_padding_invoice1 border-start border-end ">
                    <p style={{ wordBreak: "normal" }}>
                      {" "}
                      {e?.mainData?.SubCategoryname} {e?.mainData?.Categoryname}{" "}
                    </p>
                    <p style={{ wordBreak: "normal" }}>
                      {e?.mainData?.designno} | {e?.mainData?.SrJobno}
                    </p>
                    {image && (
                      <img
                        src={e?.mainData?.DesignImage}
                        alt=""
                        className="w-100 p-1 imgTaxInvoice1"
                        onError={handleImageError}
                      />
                    )}
                    {e?.mainData?.HUID !== "" && (
                      <p className={`${!image && "pt-3"} text-center`}>
                        HUID-{e?.mainData?.HUID}{" "}
                      </p>
                    )}
                  </div>
                  <div className="hsn_invoice1 hsn_invoicePrint1 min_padding_invoice1 border-end pad_2_tax_invoice_1">
                    {e?.mainData?.HSNNo}
                  </div>
                  <div className="material_invoice_inner1 border-end materialInvoicePrint1">
                    {e?.data.map((ele, ind) => {
                      return (
                        ele?.IsPrimaryMetal === 1 && <div className={`d-flex material_inner_invoice1 pad_2_tax_invoice_1 border-bottom`} key={ind} >
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                            {ele?.ShapeName}
                          </div>
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                            {ele?.QualityName}
                          </div>
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                            {fixedValues(e?.mainData?.grosswt, 3)}
                          </div>
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                            {/* {(ele?.ShapeName !== "GOLD" && ele?.Wt !== 0) &&
                              `${ele?.IsLess === 1 ? "Less:" : ""}${fixedValues(ele?.Wt, 3)}`} */}
                          </div>
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                            {ind === 0 && `${fixedValues(e?.primaryWt, 3)}`}
                          </div>
                          <div className="min_padding_invoice1  justify-content-end col-2">
                            <p className="text-end">  {ele?.MasterManagement_DiamondStoneTypeid === 4 &&
                              NumberWithCommas(ele?.Rate / BillPrint_Json?.CurrencyExchRate, 2)}</p>
                          </div>
                        </div>
                      );
                    })}
                    {
                      e?.diamonds?.map((ele, ind) => {
                        return <div className={`d-flex material_inner_invoice1 pad_2_tax_invoice_1 border-bottom`} key={ind} >
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                            {ele?.ShapeName}
                          </div>
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                          </div>
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                          </div>
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                            {(ele?.Wt !== 0) && `${ele?.IsLess === 1 ? "Less:" : ""}${fixedValues(ele?.Wt, 3)}`}
                          </div>
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                          </div>
                          <div className="min_padding_invoice1  justify-content-end col-2">
                            <p className="text-end">  </p>
                          </div>
                        </div>
                      })
                    }
                    {
                      e?.colorStones?.map((ele, ind) => {
                        return <div className={`d-flex material_inner_invoice1 pad_2_tax_invoice_1 border-bottom`} key={ind} >
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                            {ele?.ShapeName}
                          </div>
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                          </div>
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                          </div>
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                            {(ele?.Wt !== 0) && `${ele?.IsLess === 1 ? "Less:" : ""}${fixedValues(ele?.Wt, 3)}`}
                          </div>
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                          </div>
                          <div className="min_padding_invoice1  justify-content-end col-2">
                            <p className="text-end">  </p>
                          </div>
                        </div>
                      })
                    }
                    {
                      e?.miscs?.map((ele, ind) => {
                        return <div className={`d-flex material_inner_invoice1 pad_2_tax_invoice_1 border-bottom`} key={ind} >
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                            {ele?.ShapeName}
                          </div>
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                          </div>
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                          </div>
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                            {(ele?.Wt !== 0) && `${ele?.IsLess === 1 ? "Less:" : ""}${fixedValues(ele?.Wt, 3)}`}
                          </div>
                          <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                          </div>
                          <div className="min_padding_invoice1  justify-content-end col-2">
                            <p className="text-end">  </p>
                          </div>
                        </div>
                      })
                    }

                    {e?.mainData?.TotalDiamondHandling !== 0 && <div className={`d-flex  material_inner_invoice1 pad_2_tax_invoice_1`} >
                      <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                        Other Charge
                      </div>
                      <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                      </div>
                      <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                      </div>
                      <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                      </div>
                      <div className="min_padding_invoice1  border-end justify-content-center col-2 pad_2_tax_invoice_1 text-center">
                      </div>
                      <div className="min_padding_invoice1  justify-content-end col-2">
                        <p className="text-end"> </p>
                      </div>
                    </div>}
                  </div>
                  <div className="d-flex align-items-center justify-content-center making_invoice1 making_invoicePrint1 p-1 border-end">
                    {e?.mainData?.MakingChargeDiscount > 0 ? NumberWithCommas(e?.mainData?.MakingChargeDiscount, 2) + " %" : NumberWithCommas(e?.mainData?.MaKingCharge_Unit, 2)}
                  </div>
                  <div className="others_invoice1 others_invoicePrint1  border-end">
                    <div className="d-grid h-100">
                      <div className="text-end border-bottom material_inner_invoice1 p-1 minHeight20_5_taxInvoice1 d-flex align-items-center justify-content-end">
                        {e?.mainData?.MetalAmount !== 0 && NumberWithCommas(e?.mainData?.MetalAmount / BillPrint_Json?.CurrencyExchRate, 2)}
                      </div>
                      {e?.data.map((ele, ind) => {
                        return (ele?.MasterManagement_DiamondStoneTypeid !== 4 && ele?.MasterManagement_DiamondStoneTypeid !== 1) && <div className={`text-end ${(e?.mainData?.OtherCharges !== 0 || ind !== e?.data.length) && `border-bottom`} 
                            material_inner_invoice1 p-1 minHeight20_5_taxInvoice1 d-flex align-items-center justify-content-end`} key={ind} >
                          {ele?.materialCharges !== 0 && NumberWithCommas(ele?.materialCharges / BillPrint_Json?.CurrencyExchRate, 2)}
                        </div>
                      })}
                      {e?.diamonds?.map((ele, ind) => {
                        return <div className={`text-end border-bottom material_inner_invoice1 p-1 minHeight20_5_taxInvoice1 d-flex align-items-center justify-content-end`} key={ind} >
                          {ele?.Amount !== 0 && NumberWithCommas(ele?.Amount / BillPrint_Json?.CurrencyExchRate, 2)}
                        </div>
                      })}
                      {e?.colorStones?.map((ele, ind) => {
                        return <div className={`text-end border-bottom material_inner_invoice1 p-1 minHeight20_5_taxInvoice1 d-flex align-items-center justify-content-end`} key={ind} >
                          {ele?.Amount !== 0 && NumberWithCommas(ele?.Amount / BillPrint_Json?.CurrencyExchRate, 2)}
                        </div>
                      })}
                      {e?.miscs?.map((ele, ind) => {
                        return <div className={`text-end border-bottom material_inner_invoice1 p-1 minHeight20_5_taxInvoice1 d-flex align-items-center justify-content-end`} key={ind} >
                          {ele?.Amount !== 0 && NumberWithCommas(ele?.Amount / BillPrint_Json?.CurrencyExchRate, 2)}
                        </div>
                      })}

                      {e?.mainData?.OtherCharges !== 0 && (
                        <div className="text-end border-bottom material_inner_invoice1 p-1 minHeight20_5_taxInvoice1 d-flex align-items-center justify-content-end">
                          {(e?.mainData?.OtherCharges + e?.mainData?.TotalDiamondHandling !== 0) && NumberWithCommas((e?.mainData?.OtherCharges + e?.mainData?.TotalDiamondHandling) / BillPrint_Json?.CurrencyExchRate, 2)}
                        </div>
                      )}
                      {e?.mainData?.TotalDiamondHandling !== 0 && (
                        <div className="text-end border-bottom material_inner_invoice1 p-1 minHeight20_5_taxInvoice1 d-flex align-items-center justify-content-end">
                          {(e?.mainData?.OtherCharges + e?.mainData?.TotalDiamondHandling !== 0) && NumberWithCommas((e?.mainData?.OtherCharges + e?.mainData?.TotalDiamondHandling) / BillPrint_Json?.CurrencyExchRate, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-end total_invoice1 total_invoicePrint1 min_padding_invoice1 border-end  ">
                    {NumberWithCommas(+e?.mainData?.UnitCost / BillPrint_Json?.CurrencyExchRate, 2)}
                  </div>
                </div>
              );
            })}
          <div className="d-flex headHeightInvoice1 border-bottom print_break_avoid_invoice1 pad_2_tax_invoice_1">
            <div className="p-1 d-flex align-items-center sr_invoice1 sr_invoicePrint1 border-start  "></div>
            <div className="p-1 d-flex align-items-center product_discription_invoice1 product_discription_invoice_print_1 border-end border-start total_sec_invoice1 fw-bold pad_2_tax_invoice_1" style={{ fontSize: "16px" }}>
              TOTAL
            </div>
            <div className="p-1 d-flex align-items-center hsn_invoice1 hsn_invoicePrint1 border-end"></div>
            <div className="d-flex align-items-center material_invoice_inner1 border-end materialInvoicePrint1">
              <div className="d-flex material_inner_invoice1 h-100 w-100">
                <div className="p-1 min_padding_invoice1  border-end col-2"></div>
                <div className="p-1 min_padding_invoice1  border-end col-2"></div>
                <div className="p-1 min_padding_invoice1  border-end justify-content-center col-2">
                  <p className="fw-bold">{fixedValues(totalAmount?.gwt, 3)}</p>
                </div>
                <div className="  border-end fw-bold d-block text-center col-2">
                  <p>{fixedValues(totalAmount?.diaWt, 3)} Ctw </p>
                  <p>{fixedValues(totalAmount?.weightInGram, 3)} gm</p>
                </div>
                <div className="p-1  border-end fw-bold d-block align-items-center d-flex justify-content-center col-2">
                  {fixedValues(totalAmount?.primaryWts, 3)}
                </div>
                <div className="p-1 min_padding_invoice1  fw-bold col-2"></div>
              </div>
            </div>
            <div className="p-1 d-flex align-items-center making_invoice1 making_invoicePrint1 border-end"></div>
            <div className="p-1 d-flex align-items-center others_invoice1 others_invoicePrint1 border-end fw-bold justify-content-end pad_2_tax_invoice_1">
              {NumberWithCommas(totalAmount?.totalOtherAmount / BillPrint_Json?.CurrencyExchRate, 2)}
            </div>
            <div className="p-1 d-flex align-items-center total_invoice1 total_invoicePrint1 border-end fw-bold justify-content-end pad_2_tax_invoice_1">
              {NumberWithCommas(totalAmount?.UnitCost / BillPrint_Json?.CurrencyExchRate, 2)}
            </div>
          </div>
          <div className="d-flex border-start border-end border-bottom print_break_avoid_invoice1 pad_2_tax_invoice_1">
            <div className="oldGoldInvoice1 border-end d-grid oldGoldInvoicePrint1">
              <div className="d-flex p-1 border-bottom">
                <div className="pad_2_tax_invoice_1 d-flex">
                  Narration<span className="px-1">/</span> <span> Remark:</span>{" "}
                  <div className="fw-bold" dangerouslySetInnerHTML={{ __html: BillPrint_Json?.Remark }} ></div>
                </div>
              </div>
              <div className="d-flex p-1 flex-column">
                <p className="pb-1">Old Gold Purchase Description :</p>
                {/* <p className="fw-bold pb-1">Total Weight :</p> */}
                {/* <p>Total Amount : {BillPrint_Json?.OldGoldAmount}</p> */}
              </div>
            </div>
            <div className="cgst_inovice1 border-end text-end cgstinvoicePrint1">
              {totalAmount?.discountAmt !== 0 && <p>Discount</p>}
              <p>Total Amt. before Tax</p>
              {taxes.length > 0 &&
                taxes?.map((e, i) => {
                  return (
                    <p key={i}>
                      {e?.name} @ {e?.per}
                    </p>
                  );
                })}
              {BillPrint_Json?.AddLess !== 0 && <p>{BillPrint_Json?.AddLess > 0 ? "Add" : "Less"}</p>}
              <p>Total Amt. after Tax</p>
              <p>Old Gold</p>
              <p>Advance</p>
              <p>Recv.in Cash</p>
              {bank?.length > 0 &&
                bank?.map((e, i) => {
                  return <p key={i}>Recv.in Bank({e?.label})</p>;
                })}
              {BillPrint_Json?.BankPayDet === "" && <p>Recv.in Bank</p>}
              <p>Net Bal. Amount</p>
            </div>
            <div className="total_sum_invoice_print_1 total_sum_invoiceprint1 text-end">
              {totalAmount?.discountAmt !== 0 && (
                <p>{NumberWithCommas(totalAmount?.discountAmt, 2)}</p>
              )}
              <p>{NumberWithCommas(totalAmount?.TotalAmount / BillPrint_Json?.CurrencyExchRate, 2)}</p>
              {taxes.length > 0 &&
                taxes?.map((e, i) => {
                  return <p key={i}>{NumberWithCommas(+e?.amount / BillPrint_Json?.CurrencyExchRate, 2)}</p>;
                })}
              {BillPrint_Json?.AddLess !== 0 && <p>{NumberWithCommas(BillPrint_Json?.AddLess / BillPrint_Json?.CurrencyExchRate, 2)}</p>}
              <p>{NumberWithCommas(+((totalAmount?.TotalAmount / BillPrint_Json?.CurrencyExchRate)?.toFixed(2)) +
                (+(BillPrint_Json?.AddLess / BillPrint_Json?.CurrencyExchRate)?.toFixed(2)) +
                taxes?.reduce((acc, cObj) => acc + +(+(cObj?.amount / BillPrint_Json?.CurrencyExchRate)?.toFixed(2)), 0), 2)}</p>
              <p>
                {BillPrint_Json?.OldGoldAmount !== undefined &&
                  NumberWithCommas(BillPrint_Json?.OldGoldAmount, 2)}
              </p>
              <p>
                {BillPrint_Json?.AdvanceAmount !== undefined &&
                  NumberWithCommas(BillPrint_Json?.AdvanceAmount, 2)}
              </p>
              <p>
                {BillPrint_Json?.CashReceived !== undefined &&
                  NumberWithCommas(BillPrint_Json?.CashReceived, 2)}
              </p>
              {bank?.length > 0 &&
                bank?.map((e, i) => {
                  return <p key={i}>{NumberWithCommas(e?.amount, 2)}</p>;
                })}
              {BillPrint_Json?.BankPayDet === "" && <p>0.00</p>}
              {/* <p>{BillPrint_Json?.BankReceived !== undefined && NumberWithCommas(BillPrint_Json?.BankReceived, 2)}</p> */}
              <p>
                {/* {totalAmount?.netBalanceAmount !== undefined && NumberWithCommas(totalAmount?.netBalanceAmount, 2)} */}
                {NumberWithCommas(+((totalAmount?.TotalAmount / BillPrint_Json?.CurrencyExchRate)?.toFixed(2)) +
                  (+(BillPrint_Json?.AddLess / BillPrint_Json?.CurrencyExchRate)?.toFixed(2)) +
                  taxes?.reduce((acc, cObj) => acc + +(+(cObj?.amount / BillPrint_Json?.CurrencyExchRate)?.toFixed(2)), 0) - +(BillPrint_Json?.OldGoldAmount?.toFixed(2)) -
                  +(BillPrint_Json?.AdvanceAmount?.toFixed(2)) - bank?.reduce((acc, cObj) => acc + +((+cObj?.amount))?.toFixed(2), 0), 2)}
              </p>
            </div>
          </div>
          <div className="d-flex border-start border-end border-bottom   print_break_avoid_invoice1 pad_2_tax_invoice_1">
            <div className=" totalNumbersinvoice1 border-end totalNumbersinvoicePrint1">
              <p>In Words {BillPrint_Json?.Currencyname}</p>
              <p className="fw-bold">{NumToWord(+fixedValues(+((totalAmount?.TotalAmount / BillPrint_Json?.CurrencyExchRate)?.toFixed(2)) +
                (+(BillPrint_Json?.AddLess / BillPrint_Json?.CurrencyExchRate)?.toFixed(2)) +
                taxes?.reduce((acc, cObj) => acc + +(+(cObj?.amount / BillPrint_Json?.CurrencyExchRate)?.toFixed(2)), 0), 2))} </p>
            </div>
            <div className=" totalTaxinvoice1 totalTaxinvoicePrint1 border-end text-end align-items-center d-flex justify-content-end fw-bold pad_2_tax_invoice_1">
              <p>   GRAND TOTAL</p>
            </div>
            <div className="d-flex align-items-center justify-content-end totalTaxNumberinvoice_print_1 fw-bold totalTaxNumberinvoiceprint1 pad_2_tax_invoice_1">
              <p>   <span dangerouslySetInnerHTML={{ __html: BillPrint_Json?.Currencysymbol }}></span>{" "}
                {NumberWithCommas(+((totalAmount?.TotalAmount / BillPrint_Json?.CurrencyExchRate)?.toFixed(2)) +
                  (+(BillPrint_Json?.AddLess / BillPrint_Json?.CurrencyExchRate)?.toFixed(2)) +
                  taxes?.reduce((acc, cObj) => acc + +(+(cObj?.amount / BillPrint_Json?.CurrencyExchRate)?.toFixed(2)), 0), 2)}</p>
            </div>
          </div>
          <div className="d-flex border-start border-end border-bottom p-1 print_break_avoid_invoice1 declarationTaxInvoice1 pb-4">
            <div
              dangerouslySetInnerHTML={{ __html: BillPrint_Json?.Declaration }}
              className="pt-1"
            ></div>
          </div>
          <div className="d-flex border-start border-end border-bottom print_break_avoid_invoice1 pad_2_tax_invoice_1">
            <div className=" border-end p-1 col-6">
              <p className="fw-bold">Bank Detail</p>
              <p className="">Bank Name: {BillPrint_Json?.bankname}</p>
              <p className="">Branch: {BillPrint_Json?.bankaddress}</p>
              <p className="">Account Name: {BillPrint_Json?.accountname}</p>
              <p className="">Account No. : {BillPrint_Json?.accountnumber}</p>
              <p className="">RTGS/NEFT IFSC: {BillPrint_Json?.rtgs_neft_ifsc}</p>
            </div>
            <div className=" border-end d-flex justify-content-between flex-column p-1 col-3">
              <p>Signature</p>
              <p className="fw-bold">{BillPrint_Json?.CustName}</p>
            </div>
            <div className=" d-flex justify-content-between flex-column p-1 col-3">
              <p>Signature</p>
              <p className="fw-bold">{BillPrint_Json?.CompanyFullName}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
          {msg}
        </p>
      )}
    </>
  );
};

export default TaxInvoice1;
