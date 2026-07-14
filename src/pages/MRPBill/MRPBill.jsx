import React, { useRef, useState } from "react";
import "./mrpbill.css";
import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import img from "../../assets/img/default.png";
import axios from "axios";
import { useEffect } from "react";
import { toast } from "react-toastify";
import scanImg from "../../assets/img/scanimg.gif";
import qrImg from "../../assets/img/Qrcode.png";
import f2Img from "../../assets/img/f2.gif";
import { handleImageError, validateTwoDecimalPlaces } from "./MRPGlobalFunctions";
import { useLocation } from "react-router-dom";
import { Box, CircularProgress, TextField } from "@mui/material";
import PrintIcon from '@mui/icons-material/Print';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { Helmet } from "react-helmet-async";
import moment from "moment/moment";
import JobTable from "./JobTable";
import RateModal from "./RateModal";
import RoundOffBox from "./RoundOffBox";

const ConfirmDialog = ({ open, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>Generate Bill</DialogTitle>
    <DialogContent>
      <Typography variant="body1">Are you sure you want to proceed ?</Typography>
    </DialogContent>
    <DialogActions style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <Button onClick={onConfirm} variant="contained" color="success">
        Confirm
      </Button>
      <Button onClick={onClose} variant="contained" color="error">
        Cancel
      </Button>
    </DialogActions>
  </Dialog>
);

const MRPBill = () => {
  const [searchVal, setSearchVal] = useState("");
  const [selectVal, setSelectVal] = useState("");
  const [selectLocker, setSelectLocker] = useState("");
  const [selectTaxProfile, setSelectTaxProfile] = useState("");
  const [selectBook, setSelectBook] = useState("");
  const [jobnoVal, setJobnoVal] = useState("");
  const [isJobPresent, setIsJobPresent] = useState(false);
  const [customerEnteredDate, setCustomerEnterDate] = useState('');
  const [customerEnteredDateError, setCustomerEnteredDateError] = useState('');
  const [customerEnteredRemark, setCustomerEnteredRemark] = useState('');
  const [customerEnteredRemarkError, setCustomerEnteredRemarkError] = useState('');
  const [dateRemarkFlag, setDateRemarkFlag] = useState(false);
  const [currencyData, setCurrencyData] = useState([]);
  const [lockerData, setLockerData] = useState([]);
  const [taxProfileData, setTaxProfileData] = useState([]);
  const [taxProfileDT1, setTaxProfileDT1] = useState([]);
  const [customerDefaultTaxProfileId, setCustomerDefaultTaxProfileId] = useState(null);
  const [customerData, setCustomerData] = useState([]);
  const [jobHSNNo, setJobHSNNo] = useState('');
  const [failedJobs, setFailedJobs] = useState([]);
  const [bookData, setBookData] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [jobDetail, setJobDetail] = useState(null);
  const [msg, setMsg] = useState('');
  const [addnew, setAddNew] = useState('');
  const [custSearch, setSearchCust] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [custId, setCustID] = useState('');
  const [currencyId, setCurrencyID] = useState('');
  const [currencyRate, setCurrencyRate] = useState('');
  const [lockerId, setLockerId] = useState('');
  const [bookId, setBookId] = useState('');
  const [taxProfileId, setTaxProfileId] = useState('');
  const [jobList, setJobList] = useState([]);
  const [billNo, setBillNo] = useState(0);
  const [billSavedFlag, setBillSavedFlag] = useState(false);
  const [custErrorMsg, setCustErrorMsg] = useState('');
  const [lockerErrorMsg, setLockerErrorMsg] = useState('');
  const [currErrorMsg, setCurrErrorMsg] = useState('');
  const [bookErrorMsg, setBookErrorMsg] = useState('');
  const [taxProfileErrorMsg, setTaxProfileErrorMsg] = useState('');
  const [disableSelect, setDisableSelect] = useState(false);
  const [disableSelect2, setDisableSelect2] = useState(false);
  const [disableSelect3, setDisableSelect3] = useState(false);
  const [disableSelect4, setDisableSelect4] = useState(false);
  const [disableSelect5, setDisableSelect5] = useState(false);
  const [editableFlag, setEditTableFlag] = useState(false);
  const [deleteFlag, setDeleteFlag] = useState(true);
  const [inpAutoFocus, setInpAutoFocus] = useState(true);
  const [scanFlag, setScanFlag] = useState(true);
  const [scannedValue, setScannedValue] = useState('');
  const [printUrl, setPrintUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [disableInp, setDisableInp] = useState(false);
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [scanOff, setScanOff] = useState(false);
  const [jobNoFocus, setJobNoFocus] = useState(true);
  const [noJobAdd, setNoJobAdd] = useState(false);
  const [custFocus, setCustFocus] = useState(true);
  const location = useLocation();
  const queryParam = location?.search;
  const params = new URLSearchParams(queryParam);
  const inputRef = useRef(null);
  const custRef = useRef(null);
  const isInitialTaxProfileLoad = useRef(true);
  const [url, setUrl] = useState('');
  const tkn = params.get('tkn');
  const pid = params.get('pid');
  const cid = params.get('cid');
  const luid = (params?.get('LUId') === null || params?.get('LUId') === undefined) ? '' : atob(params.get('LUId'));
  const lid = (params?.get('LId') === null || params?.get('LId') === undefined) ? '' : atob(params.get('LId'));
  const sid = params?.get("serverid");
  const [selectedRows, setSelectedRows] = useState([]);
  const [roundType, setRoundType] = useState("less");
  const [roundValue, setRoundValue] = useState("");
  const [dueDays, setDueDays] = useState('');
  const [dueDaysError, setDueDaysError] = useState('');
  const [pendingNote, setPendingNote] = useState(true);
  const [showRateModal, setShowRateModal] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [roundUpTotalAmount, setRoundUpTotalAmount] = useState('');
  const [finalTotalAmount, setFinalTotalAmount] = useState('');
  const [remarkFlag, setRemarkFlag] = useState(0);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = jobList.map((item) => item.StockBarcode);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRateApply = (data) => {
    console.log('data: ', data);
    const updatedList = jobList.map((item) => {
      if (selectedRows.includes(item.StockBarcode)) {
        const price = Number(item.salePrice);
        let discount = 0;

        if (data.value && Number(data.value) > 0) {
          if (data.type === 'percent') {
            discount = (price * Number(data.value)) / 100;
          } else if (data.type === 'amount') {
            discount = Number(data.value);
          }
        }

        const finalPrice = price - discount;
        return {
          ...item,
          DiscountAmount: discount,
          FinalPrice: finalPrice >= 0 ? finalPrice : 0,
          salePriceType: data.value && Number(data.value) > 0 ? data.type : '',
          SalePriceDiscount: data.value && Number(data?.value)
        };
      }
      return item;
    });

    setJobList(updatedList);
    console.log('Updated jobList with selective discounts:', updatedList);
  };

  const handleToggleChange = (e, newType) => {
    if (newType !== null) setRoundType(newType);
    setRoundValue('');
    setRoundUpTotalAmount('');
    setFinalTotalAmount('');
  };

  // Helper to compute total including taxes
  const getTotalWithTax = () => {
    const subtotal = parseFloat(totalAmount || 0);
    const selectedTP = taxProfileData?.find((tp) => tp.id == taxProfileId);
    const isGSTProfile = selectedTP?.GSTProfileid > 0;
    const gstProfileId = selectedTP?.GSTProfileid;
    const gstTaxEntry = isGSTProfile && taxProfileDT1?.find((entry) => entry.HSN_No === jobHSNNo);
    let totalTax = 0;
    if (isGSTProfile && gstTaxEntry) {
      if (gstProfileId === 1) {
        totalTax = (subtotal * (parseFloat(gstTaxEntry.CGST) || 0)) / 100 + (subtotal * (parseFloat(gstTaxEntry.SGST) || 0)) / 100;
      } else if (gstProfileId === 2) {
        totalTax = (subtotal * (parseFloat(gstTaxEntry.IGST) || 0)) / 100;
      }
    } else if (!isGSTProfile && selectedTP) {
      [1, 2, 3, 4, 5].forEach((n) => {
        const taxValue = parseFloat(selectedTP[`tax${n}_value`] || 0);
        if (taxValue > 0 && selectedTP[`tax${n}_taxname`]) {
          totalTax += (subtotal * taxValue) / 100;
        }
      });
    }
    return subtotal + totalTax;
  };

  const handleValueChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    if (!validateTwoDecimalPlaces(value)) {
      return;
    }
    setRoundValue(value);
    const totalWithTax = getTotalWithTax();
    let roundup = 0;
    if (roundType === 'less') {
      roundup = totalWithTax - value;
    } else {
      roundup = totalWithTax + value;
    }
    setTimeout(() => {
      setRoundUpTotalAmount(parseFloat(roundup.toFixed(2)));
    }, 50);
  };


  const handleRoundup = () => {
    const totalWithTax = getTotalWithTax();

    let roundedAmount;
    let diff;
    if (roundType === 'less') {
      roundedAmount = Math.floor(totalWithTax);
      diff = parseFloat((totalWithTax - roundedAmount).toFixed(2));
    } else {
      roundedAmount = Math.ceil(totalWithTax);
      diff = parseFloat((roundedAmount - totalWithTax).toFixed(2));
    }

    setRoundValue(diff);
    setPendingNote(false);

    setTimeout(() => {
      setRoundUpTotalAmount(parseFloat(roundedAmount.toFixed(2)));
    }, 50);
  };

  useEffect(() => {
    const total = jobList?.reduce((sum, item) => sum + (Number(item.FinalPrice) || 0), 0);
    setTotalAmount(total);
  }, [jobList]);

  useEffect(() => {
    let url = '';
    if (window.location?.hostname?.toLowerCase() === 'zen' || window.location?.hostname?.toLowerCase() === 'nzen' || window.location?.hostname?.toLowerCase() === 'localhost') {
      setUrl('http://nzen/jo/api-lib/App/API_MRPBill');
      url = 'http://nzen/jo/api-lib/App/API_MRPBill';
    } else {
      setUrl('https://view.optigoapps.com/linkedapp/App/API_MRPBill');
      url = 'https://view.optigoapps.com/linkedapp/App/API_MRPBill';
    }
    fetchMRPData(url);

  }, []);

  const fetchMRPData = async (url) => {
    try {
      const token = `${atob(tkn)}`;
      const fetchData = async (mode, setData, args) => {
        const body = JSON.stringify({
          Token: token,
          ReqData: `[{"Token":"${token}","Mode":"${mode}", "luid":"${luid ?? ""}"}]`,
        });
        const response = await axios.post(url, body);
        if (response?.status === 200 && response?.data?.Status === '200') {
          const resData = response?.data?.Data || {};
          if (resData?.DT?.length > 0) {
            setData(resData?.DT);
            resData?.DT?.forEach((e) => {
              if (e?.IsDefault === 1) {
                switch (args) {
                  case 'locker':
                    setLockerId(e?.id);
                    setSelectLocker(e?.Lockername);
                    setTimeout(() => {
                      setLockerId(e?.id);
                      setSelectLocker(e?.Lockername);
                    }, 0)
                    break;
                  case 'currency':
                    setCurrencyID(e?.id);
                    setSelectVal(e?.Currencycode);
                    setTimeout(() => {
                      setCurrencyID(e?.id);
                      setSelectVal(e?.Currencycode);
                    }, 0)
                    break;
                  case 'book':
                    setBookId(e?.id);
                    setSelectBook(e?.id);
                    setTimeout(() => {
                      setBookId(e?.id);
                      setSelectBook(e?.id);
                    }, 0)
                    break;
                  default:
                    break;
                }
              }
            });
            // ✅ NEW: Handle DT1 for customer
            if (args === 'customer' && resData?.DT1?.length > 0) {
              setRemarkFlag(resData?.DT1[0]?.IsRemarkRequiredInMRPandBill ?? 0);
            }
            // ✅ NEW: Handle DT1 for taxprofile (HSN-based GST rates)
            if (args === 'taxprofile' && resData?.DT1?.length > 0) {
              setTaxProfileDT1(resData.DT1);
            }
          } else {
            setData([]);
            console.log(response?.data?.Data);
          }
        } else {
          console.log("Some Error Occurred");
        }
      };

      // Fetch locker data
      await fetchData("GetLocker", setLockerData, 'locker');

      // Fetch currency data
      await fetchData("GetCurrency", setCurrencyData, 'currency');

      // Fetch customer data
      await fetchData("GetCustomer", setCustomerData, 'customer');

      // Fetch customer data
      await fetchData("GetBook", setBookData, 'book');

      // Fetch tax profile data
      await fetchData("GetTaxProfile", setTaxProfileData, 'taxprofile');  

    } catch (error) {
      console.log("An error occurred while fetching data:", error);
      toast.error("Some Error Occurred");
    }

  };

  const handleCurrencyChange = (e) => {
    setSelectVal(e.target.value);
    setCurrErrorMsg('');
    const selectedOption = e.target.options[e.target.selectedIndex];
    const currencyRate = selectedOption.getAttribute('data-curr_Rate');
    const currencyId = selectedOption.getAttribute('data-currId');
    setCurrencyRate(currencyRate);
    setCurrencyID(currencyId);
    setJobnoVal('');
    setDisableInp(false);
  }

  const handleLockerChange = (e) => {
    setSelectLocker(e.target.value);
    const selectedOption = e.target.options[e.target.selectedIndex];
    const lockerId = selectedOption.getAttribute('data-lockId');
    setLockerId(lockerId);
    setLockerErrorMsg('');
    setJobnoVal('');
    setDisableInp(false);
  }

  const handleJobNoChange = (e) => {
    setJobnoVal(e.target.value);
    setMsg('');
    setScanFlag(false);

  }

  const handleKeyDownEnter = (e) => {
    if (searchVal !== '') {
      if (e.key === 'Enter') {
        if (lockerErrorMsg === '' && currErrorMsg === '' && jobnoVal !== '') {
          setDisableInp(true);
          handleGoClick();
        }
      }
    } else {
      setCustErrorMsg('Customer required');
    }
  }

  const handleGoClick = async (type) => {
    if (noJobAdd) {
      setJobnoVal('');
      setDisableInp(false);
      return
    }
    setEditTableFlag(false);
    const areAllSalePricesSet = () => {
      return jobList.every(job => job.salePrice !== '');
    };
    const isValid = checkValidation();
    let isCustValid = false;
    customerData?.forEach((e) => {
      if (e?.id === custId && e?.TypoLabel?.toLowerCase() === searchVal?.toLowerCase()) {
        isCustValid = true;
        setCustErrorMsg('');
      }
    })
    if (searchVal !== '') {
      if (jobnoVal !== '' && isValid && isCustValid) {

        if (jobList.length > 0 && !areAllSalePricesSet()) {
          setMsg('Please add sale price for previous jobs before adding new ones.');
          return;
        }
        try {
          const body = JSON.stringify({
            Token: `${atob(tkn)}`,
            ReqData: `[{\"Token\":\"${atob(tkn)}\",\"Mode\":\"GetJobDeatil\",\"STB\":\"${jobnoVal}\",\"LockerId\":\"${lockerId}\",\"CustomerId\":\"${custId}\" ,\"luid\":\"${luid ?? ""}\"}]`
          })
          setIsLoading(true);
          const response = await axios.post(url, body);
          if (response?.status === 200 && response?.data?.Status === '200') {
            if (!isEmptyObject(response?.data?.Data)) {
              if (response?.data?.Data?.DT?.length > 0) {
                const selectedTP = taxProfileData.find((tp) => tp.id == taxProfileId);
                const jobHSN = response?.data?.Data?.DT[0]?.HSN_No;
                if (selectedTP?.GSTProfileid > 0) {
                  const failedJob = response?.data?.Data?.DT[0];
                  if (!jobHSN) {
                    setFailedJobs((prev) => {
                      if (prev.some((j) => j.stockBarcode === failedJob?.StockBarcode)) return prev;
                      return [...prev, { stockBarcode: failedJob?.StockBarcode, description: failedJob?.Description, reason: 'No HSN No found' }];
                    });
                    setMsg('Invalid job - No HSN No found');
                    setIsLoading(false);
                    setDisableInp(false);
                    inputRef.current.focus();
                    setJobnoVal('');
                    return;
                  }
                  if (jobHSNNo && jobHSN !== jobHSNNo) {
                    setFailedJobs((prev) => {
                      if (prev.some((j) => j.stockBarcode === failedJob?.StockBarcode)) return prev;
                      return [...prev, { stockBarcode: failedJob?.StockBarcode, description: failedJob?.Description, reason: 'HSN mismatch' }];
                    });
                    setMsg('Items with different HSN cannot be added in the same voucher!');
                    setIsLoading(false);
                    setDisableInp(false);
                    inputRef.current.focus();
                    setJobnoVal('');
                    return;
                  }
                  if (!jobHSNNo) {
                    setJobHSNNo(jobHSN);
                  }
                }
                if (jobList?.length > 0) {
                  let isJobPresent = jobList?.find((al) => al?.StockBarcode === response?.data?.Data?.DT[0]?.StockBarcode);
                  let isJobPresent2 = jobList?.some((al) => al?.StockBarcode === response?.data?.Data?.DT[0]?.StockBarcode);
                  if (isJobPresent && isJobPresent2) {
                    console.log('already present');
                    setMsg('Already Present');
                    setTimeout(() => {
                      setMsg('');
                    }, 2000);
                    setTimeout(() => {
                      inputRef.current.focus();
                      setJobNoFocus(true);
                    }, 0);
                    inputRef.current.focus();
                    setJobnoVal('');
                    setJobDetail([]);
                    setIsLoading(false);
                    setDisableSelect(true);
                    setDisableSelect2(true);
                    setDisableSelect3(true);
                    setDisableSelect4(true);
                    setDisableSelect5(true);
                    setDisableInp(false);
                  } else {
                    setJobDetail(response?.data?.Data?.DT)
                    let newobj = { ...response?.data?.Data?.DT[0] };
                    newobj.salePrice = newobj.IsMRPBaseSale === 1 ? newobj.NewMRP : '';
                    newobj.FinalPrice = newobj.salePrice;
                    setJobList((prev) => [...prev, newobj]);
                    setDisableSelect(true);
                    setDisableSelect2(true);
                    setDisableSelect3(true);
                    setDisableSelect4(true);
                    setDisableSelect5(true);
                    setMsg('')
                    setJobnoVal('');
                    setIsJobPresent(false);
                    setIsLoading(false);
                    setDisableInp(false);
                  }
                } else {
                  setJobDetail(response?.data?.Data?.DT)
                  let newobj = { ...response?.data?.Data?.DT[0] };
                  newobj.salePrice = newobj.IsMRPBaseSale === 1 ? newobj.NewMRP : '';
                  newobj.FinalPrice = newobj.salePrice;

                  setJobList((prev) => [...prev, newobj]);
                  setMsg('')
                  setJobnoVal('');
                  setIsJobPresent(false);
                  setDisableSelect(true);
                  setDisableSelect2(true);
                  setDisableSelect3(true);
                    setDisableSelect4(true);
                    setDisableSelect5(true);
                  setIsLoading(false);
                  setDisableInp(false);

                }
              } else {
                setJobDetail([]);
                console.log(response?.data?.Data?.DT);
                setMsg('')
                setIsJobPresent(false);
                setIsLoading(false);
                setDisableInp(false);
              }
            } else {
              console.log(response?.data?.Data);
              setIsJobPresent(false);
              setIsLoading(false);
              setDisableInp(false);
            }
          } else {
            console.log(response?.data?.Data);
            setMsg('Invalid Job');
            setTimeout(() => {
              setMsg('');
              inputRef.current.focus();
              setScanFlag(true);
              setJobnoVal('');
            }, 3000)
            setIsJobPresent(false);
            setIsLoading(false);
            setDisableInp(false);
          }

        } catch (error) {
          console.log(error);
          toast.error('Some Error Occured');
          setIsLoading(false);
          setDisableInp(false);
        }

      }
    } else {
      setCustErrorMsg('Customer required');
      setDisableInp(false);
    }
  }

  const isEmptyObject = (obj) => Object.keys(obj).length === 0;
  //update price and changes in price logic
  const handlePriceChange = (event, obj) => {
    const newPrice = event?.target?.value?.replace(/,/g, "");
    if (!validateTwoDecimalPlaces(newPrice)) {
      return;
    }
    setDisableInp(false);
    setMsg('');
    if (!isNaN(newPrice)) {
      const updatedJl = jobList.map(item =>
        item.StockBarcode === obj.StockBarcode
          ? {
            ...item,
            salePrice: parseFloat(newPrice),
            FinalPrice: parseFloat(newPrice) - (parseFloat(newPrice) * (item?.SalePriceDiscount ?? 0)) / 100
          }
          : item
      );
      console.log('updatedJl: ', updatedJl);
      setJobList(updatedJl);
    }
    if (scanFlag) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 1000);
    }
  };

  const handleJobDelete = (obj) => {
    if (deleteFlag) {
      const updatedJL = jobList?.filter((e) => e?.StockBarcode !== obj?.StockBarcode)
      setJobList(updatedJL);
      if (updatedJL?.length === 0) {
        setDisableSelect(false);
      }
      setMsg('');
      inputRef.current.focus();
      setJobnoVal('');
    }
  }

  const handleSelectCustomer = (customer) => {
    setCustID(customer?.id);
    setSearchCust(customer?.TypoLabel);
    setSearchVal(customer?.TypoLabel);
    setCustomerDefaultTaxProfileId(customer?.taxprofileid || null);
    setDueDays(customer?.DueDays || '');

    setFilteredCustomers([]);

    setSelectedIndex(-1);
    setCustErrorMsg('');
    setJobnoVal('');
    setInpAutoFocus(true);
    inputRef.current?.focus();
    setScanFlag(true);

  };

  const handleSearchCustomer = (val) => {
    setInpAutoFocus(true);
    setJobnoVal('');
    let searchValue = val?.toLowerCase();
    setSearchCust(val);
    setSearchVal(val);
    if (searchValue) {
      const filtered = customerData?.filter(customer =>
        customer?.TypoLabel?.toLowerCase()?.includes(searchValue?.toLowerCase())
      );
      setFilteredCustomers(filtered);
      if (filtered?.length === 1 && filtered[0]?.TypoLabel?.toLowerCase() === searchValue?.toLowerCase()) {
        setSearchCust(filtered[0]?.TypoLabel);
        setSearchVal(filtered[0]?.TypoLabel);
        inputRef.current?.focus();
        setCustID(filtered[0]?.id);
        setFilteredCustomers([]); // Hide the dropdown
      }
    }
    else {
      setFilteredCustomers([]);
    }
    setCustErrorMsg('');
    setInpAutoFocus(true);
  }

  const handleSelectBlur = () => {
    setTimeout(() => {
      setFilteredCustomers([]);
      setSelectedIndex(-1);
    }, 1000)
    setInpAutoFocus(true);
    setJobnoVal('');
  }

  const handleKeyDown = (e) => {
    setJobnoVal('');
    if (selectedIndex < filteredCustomers?.length) {

      if (e.key === 'ArrowUp' && selectedIndex > 0) {
        setSelectedIndex(prev => prev - 1)
      }
      else if (e.key === 'ArrowDown' && selectedIndex < filteredCustomers?.length - 1) {
        setSelectedIndex(prev => prev + 1)
      }
      else if (e.key?.toLowerCase() === 'enter' || e.key?.toLowerCase() === 'tab' && selectedIndex >= 0) {
        setSearchCust(filteredCustomers[selectedIndex]?.TypoLabel);
        setSearchVal(filteredCustomers[selectedIndex]?.TypoLabel);
        setCustID(filteredCustomers[selectedIndex]?.id);
        setCustomerDefaultTaxProfileId(filteredCustomers[selectedIndex]?.taxprofileid || null);
        setDueDays(filteredCustomers[selectedIndex]?.DueDays || '');
        setFilteredCustomers([]);
        inputRef.current?.focus();
        setTimeout(() => {
          inputRef.current?.focus();
          setScanFlag(true);
        }, 10);
      }


      // Scroll the selected item into view
      setTimeout(() => {
        const element = document.querySelector(".search_sug_line.active");
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }, 0);

      setCustErrorMsg('');

    } else {
      setCustErrorMsg('');
      setSelectedIndex(-1);
    }
    setInpAutoFocus(true);
  }
  //book change logic
  const handleBookChange = (e) => {
    setBookErrorMsg('');
    setSelectBook(e.target.value);
    setBookId(e.target.value)
    setJobnoVal('');
    setDisableInp(false);
  }

  const handleTaxProfileChange = (e) => {
    setTaxProfileErrorMsg('');
    setSelectTaxProfile(e.target.value);
    const selectedOption = e.target.options[e.target.selectedIndex];
    const taxProfileId = selectedOption.getAttribute('data-taxProfileId');
    setTaxProfileId(taxProfileId);
    setJobnoVal('');
    setDisableInp(false);
  }

  //save bill logic
  const saveMRP = async (args) => {
    let IsForEst = 0;
    if (args === 'bill') {
      IsForEst = 0;
    }
    if (args === 'estimate') {
      IsForEst = 1;
    }
    const isValid = checkValidation();
    let is_valid = true;
    if (!customerEnteredDate) {
      setCustomerEnteredDateError('Date is required');
      is_valid = false;
    } else {
      setCustomerEnteredDateError('');
    }
    if (remarkFlag != 0 && !customerEnteredRemark) {
      setCustomerEnteredRemarkError('Remark is required');
      is_valid = false;
    } else {
      setCustomerEnteredRemarkError('');
    }
    const formatedDate = moment(customerEnteredDate).format('l');
    const formatedRemark = customerEnteredRemark?.slice(0, 500);

    if (!isValid && !is_valid) {
      return;
    }
    if (jobList?.length > 0) {
      let isEveryNot0 = jobList?.every((e) => e?.salePrice !== 0 || e?.salePrice !== '' || e?.salePrice !== null);
      if (isEveryNot0) {
        const bill_detail = jobList?.map((e) => {
          return {
            STB: e?.StockBarcode,
            MRP: Number(e?.salePrice),
            discountPerAmountType: e?.salePriceType,
            discountPerAmountValue: e?.SalePriceDiscount,
          };
        })
        const body = {
          "Token": `${atob(tkn)}`, "ReqData": `[{\"Token\":\"${atob(tkn)}\",\"Mode\":\"BillSave\",\"CustomerId\":\"${custId}\",\"LockerId\":\"${lockerId}\",\"BookId\":\"${bookId}\",\"CurrencyId\":\"${currencyId}\",\"CurrencyRate\":\"${currencyRate}\",\"IsForEst\":\"${IsForEst}\",\"loginid\":\"${lid}\",\"userid\":\"${luid}\",\"date\":\"${formatedDate}\",\"remark\":\"${formatedRemark}\",\"RoundupType\":\"${roundType}\",\"RoundupValue\":\"${roundValue}\",\"orderduedays\":\"${dueDays}\",\"taxprofileid\":\"${taxProfileId}\",\"BillDetail\":${JSON.stringify(bill_detail)},\"luid\":\"${luid ?? ""}\"}]`
        }
        try {
          setIsLoading(true);
          const response = await axios.post(url, body);
          if (response?.status === 200 && response?.data?.Status === '200') {
            setBillNo(response?.data?.Data?.DT[0]?.BillNo);
            setPrintUrl(atob(response?.data?.Data?.DT[0]?.PrintUrl));
            setBillSavedFlag(true);
            setTimeout(() => {
              setDisableInp(true);
            }, 0)
            setRoundValue('');
            setRoundUpTotalAmount('');
            setIsLoading(false);
          } else {
            toast.error("Some Error Occured");
            setIsLoading(false);
          }
        } catch (error) {
          console.log(error);
          toast.error('Some Error Occured');
        }
      }
    }
  }

  const checkValidation = () => {
    let isValid = true;

    if (!custId && searchVal !== '') {
      setCustErrorMsg('Customer is required');
      isValid = false;
    } else {
      setCustErrorMsg('');
    }

    if (!lockerId) {
      setLockerErrorMsg('Locker is required');
      isValid = false;
    } else {
      setLockerErrorMsg('');
    }

    if (!currencyId) {
      setCurrErrorMsg('Currency is required');
      isValid = false;
    } else {
      setCurrErrorMsg('');
    }

    if (!bookId) {
      setBookErrorMsg('Book is required');
      isValid = false;
    } else {
      setBookErrorMsg('');
    }

    return isValid;
  };

  //next bill button logic
  const saveNextBill = () => {
    setJobDetail(null);
    setMsg('');
    setSearchCust('');
    setSelectedIndex(-1);
    setCustID('');
    setCurrencyID('');
    setLockerId('');
    setCurrencyRate('');
    setJobList([]);
    setSearchVal('');
    setSelectVal('');
    setSelectLocker('');
    setJobnoVal('');
    setIsJobPresent(false);
    setDisableSelect(false);
    setBillSavedFlag(false);
    setDisableInp(false);
    setTimeout(() => { setDisableInp(false) }, 0);
    setLockerErrorMsg('');
    setCustErrorMsg('');
    setBookErrorMsg('');
    setTaxProfileErrorMsg('');
    setSelectTaxProfile('');
    setTaxProfileId('');

    setDisableSelect2(false);
    setDisableSelect3(false);
    setDisableSelect4(false);
    setDisableSelect5(false);
    custRef.current?.focus();
    setTimeout(() => {
      custRef.current?.focus();
    }, 0)
    setScanFlag(true);

    setCustomerEnteredRemarkError('');
    setCustomerEnteredDateError('');
    setCustomerEnterDate('');
    setCustomerEnteredRemark('');
    setDateRemarkFlag(false);
    setDueDays('');
    setDueDaysError('');
    setCustomerDefaultTaxProfileId(null);
    setJobHSNNo('');
    setFailedJobs([]);

    setNoJobAdd(false);

  }

  //print url set up
  const handlePrintUrl = () => {
    let printUrl1 = '';
    printUrl1 = printUrl + `&srvid=${sid}`
    window.open(printUrl1, '_blank');
  }

  //customer id and value set up logic
  useEffect(() => {
    if (cid) {
      customerData?.forEach((e) => {
        if (e?.id === Number(atob(cid))) {
          setSearchVal(e?.TypoLabel);
          setSearchCust(e?.TypoLabel);
          setCustID(Number(atob(cid)));
          setDisableSelect(true);
        }
      })
    }
  }, [cid, customerData])

  // Auto-select customer default tax profile when data loads
  useEffect(() => {
    if (isInitialTaxProfileLoad.current) {
      isInitialTaxProfileLoad.current = false;
      return;
    }
    if (customerDefaultTaxProfileId && taxProfileData?.length > 0) {
      const matched = taxProfileData.find((tp) => tp.id == customerDefaultTaxProfileId);
      if (matched) {
        setTaxProfileId(String(matched.id));
        setSelectTaxProfile(matched.Taxtype);
      }
    }
  }, [custId, customerDefaultTaxProfileId, taxProfileData]);

  //job list variable set up of disable
  useEffect(() => {
    if (jobList?.length === 0) {
      setDisableSelect(false);
      setDisableSelect2(false);
      setDisableSelect3(false);
      setDisableSelect4(false);
      setDisableSelect5(false);
      setEditTableFlag(false);
      setJobHSNNo('');
      setFailedJobs([]);
    }
  }, [jobList]);

  //dialog box open logic
  const handleClickOpen = (type) => {
    let is_valid = true;
    if (!customerEnteredDate) {
      setCustomerEnteredDateError('Date is required');
      is_valid = false;
    } else {
      setCustomerEnteredDateError('');
    }
    if (remarkFlag != 0 && !customerEnteredRemark) {
      setCustomerEnteredRemarkError('Remark is required');
      is_valid = false;
    } else {
      setCustomerEnteredRemarkError('');
    }

    if (!dueDays || dueDays === '') {
      setDueDaysError('Due Days is required');
      is_valid = false;
    } else if (!/^\d+$/.test(dueDays)) {
      setDueDaysError('Only numbers allowed');
      is_valid = false;
    } else if (dueDays.length > 4) {
      setDueDaysError('Max 4 digits allowed');
      is_valid = false;
    } else {
      setDueDaysError('');
    }

    if (is_valid) {
      setActionType(type);  // Store the action type
      setTimeout(() => {
        setActionType(type);
      }, 0)
      setOpen(true);
    }
  };

  //dialog box close logic
  const handleClose = () => {
    setOpen(false);
  };

  //dialog box confirm button logic
  const handleConfirm = () => {
    if (actionType === 'bill') {
      saveMRP('bill');
    } else if (actionType === 'estimate') {
      saveMRP('estimate');
    }
    setOpen(false);
  };

  //continue button logic
  const handleContinue = () => {
    setFailedJobs([]);
    setMsg('');
    setEditTableFlag(true);
    setScanOff(true);
    setTimeout(() => {
      inputRef.current.focus();
      setNoJobAdd(true);
      setScanFlag(false);
    }, 0)
    setNoJobAdd(true);
    setDisableInp(true);
    setDateRemarkFlag(true);
    setDeleteFlag(false);
    setRoundValue('');
    const totalWithTax = getTotalWithTax();
    let roundup = 0;
    if (roundType === 'less') {
      roundup = totalWithTax - roundValue;
    } else {
      roundup = totalWithTax + roundValue;
    }
    setRoundUpTotalAmount(
      parseFloat(isNaN(Number(roundup)) ? 0 : Number(roundup).toFixed(2))
    );
    if (roundValue != 0 || roundValue != '') {
      setPendingNote(false);
      console.log('roundValue: ', roundValue);
    } else {
      setPendingNote(true);
    }
  };

  //back button logic
  const handleBack = () => {
    setEditTableFlag(false); // Enable fields
    setScanOff(true); //make scan on
    setScanFlag(false);
    setNoJobAdd(false);
    setJobnoVal('');
    setPendingNote(true);
    setDisableInp(false);
    setRoundType('less');
    setRoundValue('');
    inputRef.current.focus();
    setTimeout(() => {
      setDisableInp(false);
      inputRef.current.focus();
      setScanFlag(true);
    }, 10);
    setDateRemarkFlag(false);

    setDeleteFlag(true);

  };

  //focus event set up logic
  const handleScanFlagAndComp = (args) => {
    let isCustValid = false;

    // if(cid === undefined){
    customerData?.forEach((e) => {
      if (e?.id === custId && e?.TypoLabel?.toLowerCase() === searchVal?.toLowerCase()) {
        isCustValid = true;
        setCustErrorMsg('');
      }
    })
    if (args === 'f2') {
      inputRef.current?.focus();
    }
    if (searchVal !== '' && isCustValid) {
      setScanFlag(!scanFlag);
      setInpAutoFocus(true);
    } else {
      setCustErrorMsg('Select Valid Customer');
    }
    // setScanCompFlag(!scanCompFlag);
  }

  //scan value handle scan value
  useEffect(() => {
    if (scannedValue && !noJobAdd) {
      if (!scanOff) {
        handleScanJob(scannedValue);
      }
    }
  }, [scannedValue]);

  //handleScanJob api calling logic
  const handleScanJob = async () => {
    if (!noJobAdd) {
      try {
        const url = "http://zen/jo/api-lib/App/API_MRPBill";
        const body = JSON.stringify({
          Token: `${atob(tkn)}`,
          ReqData: `[{\"Token\":\"${atob(tkn)}\",\"Mode\":\"GetJobDeatil\",\"STB\":\"${scannedValue}\",\"LockerId\":\"${lockerId}\",\"CustomerId\":\"${custId}\ ,\"luid\":\"${luid ?? ""}\""}]`
        })
        setIsLoading(true);
        const response = await axios.post(url, body);
        if (response?.status === 200 && response?.data?.Status === '200') {
          if (!isEmptyObject(response?.data?.Data)) {
            if (response?.data?.Data?.DT?.length > 0) {
              const selectedTP = taxProfileData.find((tp) => tp.id == taxProfileId);
              const jobHSN = response?.data?.Data?.DT[0]?.HSN_No;
              if (selectedTP?.GSTProfileid > 0) {
                const failedJob = response?.data?.Data?.DT[0];
                if (!jobHSN) {
                  setFailedJobs((prev) => {
                    if (prev.some((j) => j.stockBarcode === failedJob?.StockBarcode)) return prev;
                    return [...prev, { stockBarcode: failedJob?.StockBarcode, description: failedJob?.Description, reason: 'No HSN No found' }];
                  });
                  setMsg('Invalid job - No HSN No found');
                  setIsLoading(false);
                  setJobnoVal('');
                  inputRef.current.focus();
                  return;
                }
                if (jobHSNNo && jobHSN !== jobHSNNo) {
                  setFailedJobs((prev) => {
                    if (prev.some((j) => j.stockBarcode === failedJob?.StockBarcode)) return prev;
                    return [...prev, { stockBarcode: failedJob?.StockBarcode, description: failedJob?.Description, reason: 'HSN mismatch' }];
                  });
                  setMsg('Items with different HSN cannot be added in the same voucher!');
                  setIsLoading(false);
                  setJobnoVal('');
                  inputRef.current.focus();
                  return;
                }
                if (!jobHSNNo) {
                  setJobHSNNo(jobHSN);
                }
              }
              if (jobList?.length > 0) {
                let isJobPresent = jobList?.find((al) => al?.StockBarcode === response?.data?.Data?.DT[0]?.StockBarcode);
                if (isJobPresent) {
                  console.log('already present');
                  setMsg('Already Present');
                  setTimeout(() => {
                    setMsg('');
                  }, 2000);
                  setTimeout(() => {
                    inputRef.current.focus();
                    setJobNoFocus(true);
                  }, 0);
                  setJobnoVal('');
                  setJobNoFocus(true);
                  inputRef.current.focus();
                  setJobDetail([]);
                  setIsLoading(false);
                  setDisableSelect(true);
                  setDisableSelect2(true);
                  setDisableSelect3(true);
                  setDisableSelect4(true);
                  setDisableSelect5(true);
                } else {
                  setJobDetail(response?.data?.Data?.DT)
                  let newobj = { ...response?.data?.Data?.DT[0] };
                  newobj.salePrice = newobj.IsMRPBaseSale === 1 ? newobj.NewMRP : '';
                  newobj.FinalPrice = newobj.salePrice;
                  setJobList((prev) => [...prev, newobj]);
                  setDisableSelect(true);
                  setDisableSelect2(true);
                  setDisableSelect3(true);
                  setDisableSelect4(true);
                  setDisableSelect5(true);
                  setMsg('')
                  setJobnoVal('');
                  setIsJobPresent(false);
                  setIsLoading(false);
                }
              } else {
                setJobDetail(response?.data?.Data?.DT)
                let newobj = { ...response?.data?.Data?.DT[0] };
                newobj.salePrice = newobj.IsMRPBaseSale === 1 ? newobj.NewMRP : '';
                newobj.FinalPrice = newobj.salePrice;
                setJobList((prev) => [...prev, newobj]);
                setMsg('')
                setJobnoVal('');
                setIsJobPresent(false);
                setDisableSelect(true);
                setDisableSelect2(true);
                setDisableSelect3(true);
                setDisableSelect4(true);
                setDisableSelect5(true);
                setIsLoading(false);

              }
            } else {
              setJobDetail([]);
              console.log(response?.data?.Data?.DT);
              setMsg('')
              setIsJobPresent(false);
              setIsLoading(false);
            }
          } else {
            console.log(response?.data?.Data);
            setIsJobPresent(false);
            setIsLoading(false);
          }
        } else {
          console.log(response?.data?.Data);
          setTimeout(() => {
            setMsg('Scanned Job Invalid');
            inputRef.current.focus();
            setJobnoVal('');
          }, 3000)
          setIsJobPresent(false);
          setIsLoading(false);
        }

      } catch (error) {
        console.log(error);
        toast.error('Some Error Occured');
        setIsLoading(false);
      }

    }
  }

  useEffect(() => {
    if (!scanOff) {
      const handleScan = (event) => {
        // Capture scanned data from keyboard events
        if (event.key === 'Enter') {
          // Process scanned value here
          const value = event.target.value.trim();
          if (value) {
            if (currencyId !== '' && lockerId !== '' && custId !== '' && bookId !== '') {
              setScannedValue(value);
              event.target.value = ''; // Clear input after scan
            }
            else {
              if (custId === '') {
                setCustErrorMsg('Customer required');
                setIsLoading(false);
                setJobnoVal('');
                setDisableInp(false);
              } else {
                setCustErrorMsg('');
                setIsLoading(false);
                setJobnoVal('');
                setDisableInp(false);
              }
              if (lockerId === '') {
                setLockerErrorMsg('Locker required');
                setIsLoading(false);
                setJobnoVal('');
                setDisableInp(false);
              } else {
                setLockerErrorMsg('');
                setIsLoading(false);
                setJobnoVal('');
                setDisableInp(false);
              }
              if (currencyId === '') {
                setCurrErrorMsg('Currency required');
                setIsLoading(false);
                setJobnoVal('');
                setDisableInp(false);
              } else {
                setCurrErrorMsg('');
                setIsLoading(false);
                setJobnoVal('');
                setDisableInp(false);
              }
              if (bookId === '') {
                setBookErrorMsg('Book required');
                setIsLoading(false);
                setJobnoVal('');
                setDisableInp(false);
              } else {
                setBookErrorMsg('');
                setIsLoading(false);
                setJobnoVal('');
                setDisableInp(false);
              }
            }
          }
        }
      };

      // Attach event listener for scanning
      const inputElement = document?.getElementById('scanner-input');
      inputElement?.addEventListener('keydown', handleScan);

      setMsg('');

      // Cleanup
      return () => {
        inputElement?.removeEventListener('keydown', handleScan);
      };
    }

  }, [currencyId, lockerId, custId, bookId, scanOff]);

  //focus true event
  useEffect(() => {
    if (scanFlag) {
      setInpAutoFocus(true);
    }
  }, [scanFlag]);

  //F2 key event
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e?.key === 'F2') {
        setScanFlag(true);
        setJobnoVal('');
        setDisableInp(false);
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [])

  //sale price focus and key logic
  const handleSalePriceKeyDown = (e) => {
    if (e?.key === 'Enter' || e?.key === 'enter') {
      inputRef.current?.focus();
      setScanFlag(true);
      setJobnoVal('');
      setJobNoFocus(true);
      setDisableInp(false);
      setMsg('');
    } else {
      setScanFlag(false);
    }

  }

  const handleSalePriceFocus = (e) => {
    setScanOff(true);
    setTimeout(() => {
      setScanOff(true);
    }, 10)
    inputRef.current?.blur();
  }

  //focus on customer at starting
  useEffect(() => {
    if (custId === '') {
      setCustFocus(true);
      setTimeout(() => {
        setCustFocus(true);
        custRef.current.focus();
        setScanFlag(false);
      }, 20);
    }
  }, []);

  //customer entered date
  const handleCustomerEnteredDate = (e) => {
    const custEnteredDate = e.target.value;
    setCustomerEnterDate(custEnteredDate);
    setCustomerEnteredDateError('');
  }

  //customer entered remark
  const handleCustomerEnteredRemark = (e) => {
    const custEnteredRemark = e.target.value;
    setCustomerEnteredRemark(custEnteredRemark);
    setCustomerEnteredRemarkError('');
  }


  return (
    <>
      <Helmet>
        <title>MRP AND BILL</title>
      </Helmet>
      {isLoading && (
        <div className="loader-overlay">
          <CircularProgress className='loadingBarManage' />
        </div>
      )}
      {<div className="container_mrp">

        <div className="head_mrp">ADD MRP AND PROCCED TO BILL</div>

        <div className="p-1 px-4 d_grid min_h_92_mrp">
          <div className="grid-item pd10_mrp">
            <label className="cust_name_title pe-3" htmlFor="custtitle">
              CUSTOMER NAME
            </label>
            <input
              type="text"
              value={searchVal}
              placeholder="customer name"
              className="form-control p-2 pd5px_mrp border border-secondary"
              id="custtitle"
              onChange={(e) => handleSearchCustomer(e.target.value)}
              onBlur={() => handleSelectBlur()}
              onKeyDown={handleKeyDown}
              disabled={disableSelect}
              autoComplete="off"
              autoFocus={custFocus}
              ref={custRef}
            />
            {filteredCustomers?.length > 0 && (
              <ul className="list-group position-absolute custom_scrollbar" style={{ zIndex: 1000, width: 'max-content', minWidth: '50px', maxHeight: '180px', overflowY: 'scroll', minWidth: '240px' }}>
                {filteredCustomers?.map((customer, index) => (
                  <li
                    key={index}
                    className={`list-group-item list-group-item-action li_fs_mrp p-1 ${selectedIndex === index ? "search_sug_line active" : "search_sug_line"}`}
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    {customer?.TypoLabel}
                  </li>
                ))}
              </ul>
            )}
            <div className="text-danger">{custErrorMsg}</div>
          </div>
          <div className="grid-item pd10_mrp min_h_92_mrp">
            <label htmlFor="taxProfile" className="pe-3 cust_name_title">
              TAX PROFILE
            </label>
            <select
              name="taxProfile"
              id="taxProfile"
              value={selectTaxProfile}
              className="form-select w-100 b1_9898px"
              onChange={(e) => handleTaxProfileChange(e)}
              disabled={disableSelect5}
            >
              <option value="">Select</option>
              {
                taxProfileData?.map((e, i) => {
                  return <option key={i} data-taxProfileId={e?.id} value={e?.Taxtype}>{e?.Taxtype}</option>
                })
              }
            </select>
            <div className="text-danger">{taxProfileErrorMsg}</div>
          </div>
          <div className="grid-item pd10_mrp min_h_92_mrp">
            <label htmlFor="locker" className="pe-3 cust_name_title">
              LOCKER
            </label>
            <select
              name="locker"
              id="locker"
              value={selectLocker}
              className="form-select w-100 b1_9898px"
              onChange={(e) => handleLockerChange(e)}
              disabled={disableSelect2}
            >
              <option value="">Select</option>
              {
                lockerData?.map((e, i) => {
                  return <option key={i} data-lockId={e?.id} value={e?.Lockername}>{e?.Lockername}</option>
                })
              }
            </select>
            <div className="text-danger">{lockerErrorMsg}</div>
          </div>
          <div className="grid-item pd10_mrp min_h_92_mrp">
            <div className=" d-flex flex-column align-items-start ">

              <label htmlFor="currency" className="pe-3 cust_name_title">
                CURRENCY
              </label>
              <select
                name="currency"
                id="currency"
                value={selectVal}
                className="form-select w-100 b1_9898px"
                onChange={(e) => handleCurrencyChange(e)}
                disabled={disableSelect3}
              >
                <option value="">Select</option>
                {
                  currencyData?.map((e, i) => {
                    return <option key={i} value={e?.Currencycode} data-curr_Rate={e?.CurrencyRate} data-currId={e?.id} >{e?.Currencycode}</option>
                  })
                }
              </select>
            </div>
            <div className="text-danger px-1">{currErrorMsg}</div>

          </div>
          <div className="grid-item pd10_mrp min_h_92_mrp">
            <div className=" d-flex flex-column align-items-start ">
              <label htmlFor="books" className="pe-3 cust_name_title">
                BOOKS
              </label>
              <select
                name="books"
                id="books"
                value={selectBook}
                className="form-select w-100 b1_9898px"
                onChange={(e) => handleBookChange(e)}
                disabled={disableSelect4}
              >
                <option value="">Select</option>
                {
                  bookData?.map((e, i) => {
                    return <option key={i} value={e?.id} >{e?.BookName}</option>
                  })
                }
              </select>
            </div>
            <div className="text-danger px-1">{bookErrorMsg}</div>
          </div>
        </div>

        <div className="w-100 d-flex align-items-baseline p-2 flex_column_mrp minH_mrp mt_top_mrp_head">
          <div className="w-25 d-flex flex-column  align-items-start ps-3 w_50_mrp2 w_100_mrp_scan mt_mrp">
            <div className="scanblock_mrpbill"> {/* <img src={scanImg} alt="#scanjob" className="scanJobImg" onClick={handleOpenScanComp} /> */}
              {scanFlag ? <> {/* <img src={scanImg} alt="#scanjob" className="scanJobImg scanJobImg2" onClick={() => handleScanFlagAndComp('scan')} /> */}
                <div className="qrbox_mrp" >
                  <img src={qrImg} alt="scanner" style={{
                    height: '100%', // equivalent to h-full
                    width: '100%', // equivalent to w-full
                    objectFit: 'contain' // equivalent to object-contain
                  }}
                    onClick={() => handleScanFlagAndComp('scan')}
                  />

                  <div style={{
                    position: 'absolute', // equivalent to absolute
                    top: 0,
                    left: 0,
                    width: '100%', // equivalent to w-full
                    height: '100%' // equivalent to h-full
                  }}
                  >
                    <div
                      style={{
                        width: '100%', // equivalent to w-full
                        height: '0.25rem', // equivalent to h-1
                        backgroundColor: '#f56565', // equivalent to bg-red-500
                        animation: 'scanner-line 4s infinite linear', // equivalent to animate-scanner-line
                        position: 'absolute',
                        top: 0
                      }}
                    ></div>
                  </div>
                </div>
                <div className="fs_scanimg"></div></> :
                <>
                  <img src={f2Img} alt="#scanjob" className="scanJobImg" onClick={() => handleScanFlagAndComp('f2')} />
                  <div className="fw-bold text-danger fs_scanimg d-flex justify-content-center align-items-center">Click Here For Scan</div>
                  <div className="fw-bold text-danger fs_scanimg d-flex justify-content-center align-items-center">OR Press F2 to Scan</div>
                </>}
            </div>
            <div className="d-flex justify-content-center align-items-center">
              <input
                type="text"
                id="jobno"
                className="form-control border border-secondary"
                value={jobnoVal}
                onChange={(e) => handleJobNoChange(e)}
                onKeyDown={(e) => handleKeyDownEnter(e)}
                disabled={disableInp ? true : false}
                autoFocus={jobNoFocus}
                ref={inputRef}
                autoComplete="off"
              />
              <button className="btn_go" disabled={jobnoVal === ''} onClick={() => handleGoClick()}>GO</button>
            </div>
            <div className="text-danger px-2 msg_h_mrpbill">{msg}</div>
            {jobList?.length > 0 && failedJobs?.length > 0 && !editableFlag && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '12px', width: '100%', maxWidth: '200px', marginLeft:'40px' }}>
                {failedJobs.map((fj, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{fj.stockBarcode}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {billSavedFlag !== true && <div className="tableDiv_mrp d-flex flex-column">
            <div className="d-flex justify-content-end mb-2 w-100" style={{ maxWidth: '1000px' }}>
              <button className="customize_btn_bill" onClick={() => setShowRateModal(true)} disabled={selectedRows.length == 0}>
                Customize All
              </button>
            </div>

            <JobTable
              jobList={jobList}
              jobDetail={jobDetail}
              editableFlag={editableFlag}
              selectedRows={selectedRows}
              finalTotalAmount={finalTotalAmount}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
              handleImageError={handleImageError}
              handlePriceChange={handlePriceChange}
              handleSalePriceKeyDown={handleSalePriceKeyDown}
              handleSalePriceFocus={handleSalePriceFocus}
              handleJobDelete={handleJobDelete}
            />
            {dateRemarkFlag &&
              <div className="d-flex justify-content-end mt-2 w-100" style={{ maxWidth: '1000px' }}>
                <RoundOffBox
                  totalAmount={totalAmount}
                  roundUpTotalAmount={roundUpTotalAmount}
                  roundType={roundType}
                  roundValue={roundValue}
                  dueDays={dueDays}
                  pendingNote={pendingNote}
                  selectedTaxProfile={taxProfileData?.find(tp => tp.id == taxProfileId)}
                  taxProfileDT1={taxProfileDT1}
                  jobHSNNo={jobHSNNo}
                  onToggleChange={handleToggleChange}
                  onValueChange={handleValueChange}
                  onRoundup={handleRoundup}
                  dueDaysError={dueDaysError}
                  onDueDaysChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setDueDays('');
                      setDueDaysError('');
                      return;
                    }
                    if (!/^\d+$/.test(val)) {
                      setDueDaysError('Only numbers allowed');
                      return;
                    }
                    if (val.length > 4) {
                      setDueDaysError('Max 4 digits allowed');
                      return;
                    }
                    setDueDaysError('');
                    setDueDays(val);
                  }}
                />
              </div>
            }
            <div style={{ minHeight: '130px', maxWidth: '1000px', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              {dateRemarkFlag && <div style={{ paddingTop: '1rem', paddingBottom: '1rem', width: '100%', maxWidth: '1000px', minHeight: '72px' }}>
                <Box style={{ display: 'flex', alignItems: 'center', padding: '0px 10px' }}>
                  <div className="date_mrp" style={{ minHeight: '65px' }}>
                    <TextField
                      label="Select Date"
                      type="date"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      style={{ padding: '8px !important' }}
                      value={customerEnteredDate}
                      onChange={handleCustomerEnteredDate}
                    />
                    <div className="text-danger">{customerEnteredDateError}</div>
                  </div>
                  <div className="remarkWidth_mrp" style={{ minHeight: '65px' }}>
                    <TextField placeholder="Enter Remark" style={{ marginLeft: '10px', width: '100%' }} value={customerEnteredRemark} onChange={handleCustomerEnteredRemark} />
                    <div className="px-3 text-danger">{customerEnteredRemarkError}</div>
                  </div>
                </Box>
              </div>}

              {jobList?.length !== 0 && <div className="w-100 d-flex justify-content-between align-items-center my-1" style={{ maxWidth: '1000px' }}>
                <>
                  <div className="d-flex align-items-center">
                    {editableFlag ? <button className="continue_btn_bill mx-2" disabled={jobList?.length === 0 ? true : false} onClick={() => handleClickOpen('bill')}>SAVE BILL</button> : <div style={{ height: '40px' }}></div>}
                    {editableFlag ? <button className="continue_btn_est mx-2" disabled={jobList?.length === 0 ? true : false} onClick={() => handleClickOpen('estimate')}>SAVE ESTIMATE</button> : <div style={{ height: '40px' }}></div>}
                  </div>
                  <div>

                    {!editableFlag ? (
                      <button className="continue_btn_continue" onClick={handleContinue}>Continue</button>
                    ) : (
                      <button className="continue_btn_back" onClick={handleBack}>Back</button>
                    )}
                  </div>
                </>
              </div>}
            </div>
          </div>}
        </div>


        {billSavedFlag !== true && <>
          <div> <ConfirmDialog open={open} onClose={handleClose} onConfirm={() => handleConfirm(actionType)} /></div>
          {jobList?.length !== 0 && <div className="d-flex justify-content-end pe-5"><a className="text-primary cursor-pointer mx-2" onClick={() => saveNextBill()}>Cancel All ?</a></div>}
        </>
        }
        <div className="d-flex flex-column justify-content-center align-items-center w-100 mb-4 pb-2">
          {billSavedFlag === true &&
            <>
              <div className="generatedBill ">Bill No : {billNo} Generated <span className="ps-1"><PrintIcon titleAccess="click here for Print" style={{ cursor: 'pointer' }} onClick={() => handlePrintUrl()} /></span></div>
              <button className="continue_btn_next mx-2" onClick={(e) => saveNextBill(e, 'next')}>NEXT BILL</button>
            </>
          }
        </div>
      </div>}
      <div>
        <img
          src="path-to-your-image.jpg"
          alt="Scan"
          onClick={() => document.getElementById('scanner-input').focus()}
          style={{ cursor: 'pointer', position: 'absolute', left: '-9999px' }}
        />
        <input
          id="scanner-input"
          style={{ position: 'absolute', left: '-9999px' }}
        />
      </div>
      <RateModal
        show={showRateModal}
        onClose={() => setShowRateModal(false)}
        onApply={handleRateApply}
        joblist={jobList?.filter((item) => selectedRows.includes(item.StockBarcode))}
      />
    </>
  );
};

export default MRPBill;
