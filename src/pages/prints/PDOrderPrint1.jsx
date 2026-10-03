import React, { useEffect, useState } from "react";
import { apiCall, checkMsg, isObjectEmpty } from "../../GlobalFunctions";
import Loader from "../../components/Loader";
import "../../assets/css/prints/PDOrderPrint1.css";
import Button from "./../../GlobalFunctions/Button";

// "/Date(1790706600000+0530)/" -> "30 Sep 2026"
const formatDotNetDate = (value) => {
    if (!value) return "";
    const match = /\/Date\((-?\d+)/.exec(value);
    if (!match) return value;
    return new Date(Number(match[1]))
        .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Kolkata",
        })
        .replace(/,/g, "");
};

// first non-empty size field of the job


const PDOrderPrint1 = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
    const [result, setResult] = useState([]);
    const [headerData, setHeaderData] = useState({});
    const [msg, setMsg] = useState("");
    const [loader, setLoader] = useState(true);

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
                    const isEmpty = isObjectEmpty(data?.Data);
                    if (!isEmpty) {
                        const json1 = data?.Data?.BillPrint_Json1;
                        setResult(Array.isArray(json1) ? json1 : json1 ? [json1] : []);
                        setHeaderData(data?.Data?.BillPrint_Json?.[0] || {});
                        setLoader(false);
                    } else {
                        setLoader(false);
                        setMsg("Data Not Found");
                    }
                } else {
                    setLoader(false);
                    setMsg(checkMsg(data?.Message));
                }
            } catch (error) {
                console.error(error);
                setLoader(false);
                setMsg("Something went wrong");
            }
        };
        sendData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loader) return <Loader />;

    if (msg !== "") {
        return (
            <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
                {msg}
            </p>
        );
    }

    return (

        <div>
            <Button />

            <div className="pd1_wrapper">


                {result.map((job, i) => {
                    const metalType = [
                        job?.mastermanagement_goldtypename,
                        job?.MasterManagement_goldcolorname,
                    ]
                        .filter(Boolean)
                        .join(" ");

                    return (
                        <div className="pd1_card" key={job?.id ?? i}>
                            <div className="pd1_col">
                                <div className="pd1_row">
                                    <div className="pd1_label pd1_bold">Order Date</div>
                                    <div className="pd1_colon">:</div>
                                    <div className="pd1_value">
                                        {formatDotNetDate(job?.JobDate)}
                                    </div>
                                </div>

                                <div className="pd1_row">
                                    <div className="pd1_label">Delivery Date</div>
                                    <div className="pd1_colon">:</div>
                                    <div className="pd1_value">{formatDotNetDate(job?.promisedate)}</div>
                                </div>

                                <div className="pd1_row">
                                    <div className="pd1_label">Job#</div>
                                    <div className="pd1_colon">:</div>
                                    <div className="pd1_value">{job?.JobNo}</div>
                                </div>

                                <div className="pd1_row">
                                    <div className="pd1_label">Size</div>
                                    <div className="pd1_colon">:</div>
                                    <div className="pd1_value">{job?.othersize}</div>
                                </div>

                                <div className="pd1_row">
                                    <div className="pd1_label pd1_bold">Vendor code</div>
                                    <div className="pd1_colon">:</div>
                                    <div className="pd1_value">{""}</div>
                                </div>

                                <div className="pd1_row">
                                    <div className="pd1_label pd1_bold">Customer Code</div>
                                    <div className="pd1_colon">:</div>
                                    <div className="pd1_value">{job?.Job_customercode}</div>
                                </div>

                                <div className="pd1_row">
                                    <div className="pd1_label">Category</div>
                                    <div className="pd1_colon">:</div>
                                    <div className="pd1_value">{job?.mastermanagement_categoryname}</div>
                                </div>

                                <div className="pd1_row">
                                    <div className="pd1_label">Metal Type</div>
                                    <div className="pd1_colon">:</div>
                                    <div className="pd1_value">{metalType}</div>
                                </div>

                                <div className="pd1_row">
                                    <div className="pd1_label pd1_bold">Remark</div>
                                    <div className="pd1_colon">:</div>
                                    <div
                                             className="pd1_value"
                                            dangerouslySetInnerHTML={{
                                                __html: job?.Instruction,
                                            }}
                                        ></div>
                                    
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>

    );
};

export default PDOrderPrint1;