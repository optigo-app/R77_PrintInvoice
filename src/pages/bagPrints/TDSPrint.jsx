
import "../../assets/css/bagprint/TDSPrint.css";
import queryString from "query-string";
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
// import * as XLSX from "xlsx";
import * as XLSX from "xlsx-js-style";

import { GetFgSaleData } from "../../GlobalFunctions/GetFgSaleData";
import { GetUniquejob } from "../../GlobalFunctions/GetUniqueJob";





const borderStyle = {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } },
};


function TDSPrint() {

    const [data, setData] = useState([]);
    const location = useLocation();
    const queryParams = queryString.parse(location.search);
    const resultString = GetUniquejob(queryParams?.str_srjobno);
    const queries = {
        YearCode: queryParams.YearCode,
        appuserid: queryParams.appuserid,
        ifid: queryParams.ifid,
        pid: queryParams.pid,
        printname: queryParams.printname,
        version: queryParams.version,
        url: queryParams.apiurl,
        spno: queryParams.spno,
        report_sv: queryParams.report_sv,
        StockBarcodeList: queryParams.StockBarcodeList,
        encwhere1: queryParams.encwhere1,
        encwhere2: queryParams.encwhere2,
        encorder: queryParams.encorder,
        ddlutype: queryParams.ddlutype,
        fdate: queryParams.fdate,
        tdate: queryParams.tdate,
    };
    useEffect(() => {
        const fetchData = async () => {

            const parameters = {
                id: "",
                mode: "TDSPrint",
                // y: queries?.YearCode,
                appuserid: queries?.appuserid,
                FormName: "TDS Report",
                version: queries?.version
            }

            const p = {
                fdate: queries?.fdate,
                tdate: queries?.tdate,
                ItemId: "0"
            }
            try {
                const body = {
                    con: JSON.stringify(parameters),
                    p: JSON.stringify(p),
                    f: "TDSPrint"
                };
                const allDatas = await GetFgSaleData(queries, body);
                
                console.log("TCL: fetchData -> allDatas", allDatas)
                setData(allDatas?.Data?.rd || []);

            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);


    console.log("TCL: TDSPrint -> data", data)




    const organizedData = data.reduce((acc, currentItem) => {
        const profile = currentItem.TDSProfilename;
        const customer = currentItem.DisName;

        // 1. Initialize the Profile Section (e.g., "TDS 194C")
        if (!acc[profile]) {
            acc[profile] = {
                profile: profile,
                customers: {},
                profileTotalNetAmount: 0,
                profileTotalBillAmount: 0,
                profileTotalTDSDebit: 0,
                profileTotalTDSCredit: 0
            };
        }

        // 2. Initialize the Customer Section inside that Profile (e.g., "Soham Patel")
        if (!acc[profile].customers[customer]) {

            acc[profile].customers[customer] = {
                customer: customer,
                pancard: currentItem.pancard,
                items: [],
                custTotalNetAmount: 0,
                custTotalBillAmount: 0,
                custTotalTDSDebit: 0,
                custTotalTDSCredit: 0
            };
        }

        // 3. Push the individual record item
        acc[profile].customers[customer].items.push(currentItem);

        // 4. Accumulate Customer-level totals
        acc[profile].customers[customer].custTotalNetAmount += currentItem.NetAmount;
        acc[profile].customers[customer].custTotalBillAmount += currentItem.BillAmount;
        acc[profile].customers[customer].custTotalTDSDebit += currentItem.TDSDebit;
        acc[profile].customers[customer].custTotalTDSCredit += currentItem.TDSCredit;

        // 5. Accumulate Profile-level grand totals
        acc[profile].profileTotalNetAmount += currentItem.NetAmount;
        acc[profile].profileTotalBillAmount += currentItem.BillAmount;
        acc[profile].profileTotalTDSDebit += currentItem.TDSDebit;
        acc[profile].profileTotalTDSCredit += currentItem.TDSCredit;

        return acc;
    }, {});



    function exportDynamicTablesToWorkbook(containerSelector, filename) {
        const tableEls = document.querySelectorAll(`${containerSelector} table[data-sheet-name]`);

        if (tableEls.length === 0) {
            console.warn("No tables found to export");
            return;
        }

        const workbook = XLSX.utils.book_new();
        const usedNames = new Set();
        const TOTAL_COLS = 11;
        const numericPattern = /^-?\d+(\.\d+)?$/;

        tableEls.forEach((tableEl) => {
            let sheetName = tableEl.getAttribute("data-sheet-name") || "Sheet";
            sheetName = sheetName.replace(/[\\/?*[\]]/g, "").substring(0, 31);

            let finalName = sheetName;
            let counter = 1;
            while (usedNames.has(finalName)) {
                finalName = `${sheetName.substring(0, 28)}_${counter++}`;
            }
            usedNames.add(finalName);

            const worksheet = {};
            const rows = tableEl.querySelectorAll("tr");

            rows.forEach((rowEl, rIdx) => {
                const isProfileHeader = rowEl.classList.contains("profile-header-row");
                const isColumnHeader = rowEl.classList.contains("column-header-row");
                const isCustomerRow = rowEl.classList.contains("customer-row");
                const isSubtotalRow = rowEl.classList.contains("subtotal-row");
                const isGrandTotalRow = rowEl.classList.contains("grand-total-row");

                let style = { border: borderStyle, alignment: { vertical: "center" } };
                if (isProfileHeader) {
                    style = { ...style, font: { bold: true, underline: true } };
                } else if (isColumnHeader) {
                    style = { ...style, font: { bold: true }, fill: { fgColor: { rgb: "D9D9D9" } } };
                } else if (isCustomerRow) {
                    style = { ...style, font: { bold: true }, fill: { fgColor: { rgb: "E2E8F0" } } };
                } else if (isSubtotalRow) {
                    style = { ...style, font: { bold: true } };
                } else if (isGrandTotalRow) {
                    style = { ...style, font: { bold: true }, fill: { fgColor: { rgb: "CBD5E1" } } };
                }

                const cells = rowEl.querySelectorAll("th, td");
                let colOffset = 0;
                const touchedCols = new Set();

                cells.forEach((cellEl) => {
                    const span = parseInt(cellEl.getAttribute("colSpan") || "1", 10);
                    const text = (cellEl.textContent || "").trim();
                    const cellRef = XLSX.utils.encode_cell({ r: rIdx, c: colOffset });

                    if (text !== "" && numericPattern.test(text)) {
                        worksheet[cellRef] = {
                            t: "n",
                            v: parseFloat(text),
                            z: "0.00",
                            s: style,
                        };
                    } else {
                        worksheet[cellRef] = {
                            t: "s",
                            v: text,
                            s: style,
                        };
                    }

                    touchedCols.add(colOffset);
                    colOffset += span;
                });


                for (let c = 0; c < TOTAL_COLS; c++) {
                    if (touchedCols.has(c)) continue;
                    const cellRef = XLSX.utils.encode_cell({ r: rIdx, c });
                    worksheet[cellRef] = { t: "s", v: "", s: style };
                }
            });

            worksheet["!cols"] = [
                { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
                { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 10 },
                { wch: 14 }, { wch: 14 }, { wch: 20 },
            ];

            // Apply merges for colSpan cells (profile header row, customer banner row)
            const merges = [];
            rows.forEach((rowEl, rIdx) => {
                let colOffset = 0;
                rowEl.querySelectorAll("th, td").forEach((cellEl) => {
                    const span = parseInt(cellEl.getAttribute("colSpan") || "1", 10);
                    if (span > 1) {
                        merges.push({
                            s: { r: rIdx, c: colOffset },
                            e: { r: rIdx, c: colOffset + span - 1 },
                        });
                    }
                    colOffset += span;
                });
            });
            worksheet["!merges"] = merges;

            worksheet["!ref"] = XLSX.utils.encode_range({
                s: { r: 0, c: 0 },
                e: { r: rows.length - 1, c: TOTAL_COLS - 1 },
            });

            XLSX.utils.book_append_sheet(workbook, worksheet, finalName);
        });

        XLSX.writeFile(workbook, `${filename}.xlsx`);

    }




    useEffect(() => {
        if (!data?.length) return;

        const timer = setTimeout(() => {
            document.getElementById("test-table-xls-button")?.click();
        }, 500);

        return () => clearTimeout(timer);
    }, [data]);







    let overallGrandNetAmount = 0;
    let overallGrandBillAmount = 0;
    let overallGrandTDSDebit = 0;
    let overallGrandTDSCredit = 0;
    return (
        <div>
            <button
                className="btn btn-success" id="test-table-xls-button"
                style={{ marginBottom: '16px', padding: '8px 16px' }}
                onClick={() =>
                    exportDynamicTablesToWorkbook("#tds-report-wrapper", "TDS_Report")
                }
            >
                Export to Excel
            </button>
            <div id="tds-report-wrapper" className="report-container" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {Object.entries(organizedData).map(([profileKey, profileData]) => {
                    const profileName = profileData.profile;
                    const customers = profileData.customers || {};

                    overallGrandNetAmount += profileData.profileTotalNetAmount || 0;
                    overallGrandBillAmount += profileData.profileTotalBillAmount || 0;
                    overallGrandTDSDebit += profileData.profileTotalTDSDebit || 0;
                    overallGrandTDSCredit += profileData.profileTotalTDSCredit || 0;



                    return (
                        <div key={profileKey} className="profile-table-wrapper" style={{ marginBottom: '20px' }}>
                            <table
                                data-sheet-name={profileName}
                                className="tds-table"
                                style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}
                            >
                                <thead>
                                    {/* Profile Header Row */}
                                    <tr className="profile-header-row">
                                        <td colSpan={11} style={{ fontWeight: 'bold', padding: '8px 4px', textAlign: 'left', textDecoration: 'underline' }}>
                                            {profileName}
                                        </td>
                                    </tr>
                                    {/* Main Column Header Row */}
                                    <tr className="column-header-row">
                                        <th style={{ width: '9%', textAlign: 'left', border: '1px solid #000', padding: '4px' }}>Date</th>
                                        <th style={{ width: '9%', textAlign: 'left', border: '1px solid #000', padding: '4px' }}>Invoice No</th>
                                        <th style={{ width: '9%', textAlign: 'right', border: '1px solid #000', padding: '4px' }}>Net Amount</th>
                                        <th style={{ width: '9%', textAlign: 'right', border: '1px solid #000', padding: '4px' }}>Total Amount</th>
                                        <th style={{ width: '7%', textAlign: 'right', border: '1px solid #000', padding: '4px' }}>TDS Debit</th>
                                        <th style={{ width: '7%', textAlign: 'right', border: '1px solid #000', padding: '4px' }}>TDS Credit</th>
                                        <th style={{ width: '11%', textAlign: 'left', border: '1px solid #000', padding: '4px' }}>Date Of Deduction</th>
                                        <th style={{ width: '7%', textAlign: 'right', border: '1px solid #000', padding: '4px' }}>TDS %</th>
                                        <th style={{ width: '9%', textAlign: 'left', border: '1px solid #000', padding: '4px' }}>Challan No</th>
                                        <th style={{ width: '9%', textAlign: 'left', border: '1px solid #000', padding: '4px' }}>Challan Date</th>
                                        <th style={{ width: '14%', textAlign: 'left', border: '1px solid #000', padding: '4px' }}>Remark</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(customers).map(([customerKey, customerData]) => {
                                        const items = customerData.items || [];

                                        // Construct the full customer label including PAN block if present
                                        const customerDisplayLabel = `${customerData.customer}${customerData.pancard ? ` ${customerData.pancard}` : ''}`;

                                        return (
                                            <React.Fragment key={customerKey}>
                                                {/* Customer Banner Divider Row */}
                                                <tr className="customer-row" style={{ backgroundColor: '#e2e8f0' }}>
                                                    <td colSpan={10} style={{ fontWeight: 'bold', padding: '4px', border: '1px solid #000' }}>
                                                        {customerDisplayLabel}
                                                    </td>
                                                    <td style={{ border: '1px solid #000' }}></td>
                                                </tr>

                                                {/* Line Item Rows */}
                                                {items.map((item, itemIdx) => (
                                                    <tr key={itemIdx} className="data-row">
                                                        <td style={{ border: '1px solid #000', padding: '4px' }}>{item.BillDate}</td>
                                                        <td style={{ border: '1px solid #000', padding: '4px' }}>{item.BillNo}</td>
                                                        <td className="text-right" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>
                                                            {item.NetAmount ? item.NetAmount.toFixed(2) : '0.00'}
                                                        </td>
                                                        <td className="text-right" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>
                                                            {item.BillAmount ? item.BillAmount.toFixed(2) : '0.00'}
                                                        </td>
                                                        <td className="text-right" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>
                                                            {item.TDSDebit > 0 ? item.TDSDebit.toFixed(2) : ''}
                                                        </td>
                                                        <td className="text-right" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>
                                                            {item.TDSCredit ? item.TDSCredit.toFixed(2) : '0.00'}
                                                        </td>
                                                        {/* Date of Deduction matching BillDate based on standard mapping criteria */}
                                                        <td style={{ border: '1px solid #000', padding: '4px' }}>{item.BillDate}</td>
                                                        <td className="text-right" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>
                                                            {item.TDSVal ? item.TDSVal.toFixed(2) : '0.00'}
                                                        </td>
                                                        <td style={{ border: '1px solid #000', padding: '4px' }}>{item.ChallanNo || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '4px' }}>{item.ChallanDate || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '4px' }}>{item.Remark || ''}</td>
                                                    </tr>
                                                ))}

                                                {/* Customer Level Subtotal Summary Row */}
                                                <tr className="subtotal-row">
                                                    <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                                                    <td className="text-center font-bold" style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>Total</td>
                                                    <td className="text-right font-bold" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>
                                                        {customerData.custTotalNetAmount ? customerData.custTotalNetAmount.toFixed(3) : '0.000'}
                                                    </td>
                                                    <td className="text-right font-bold" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>
                                                        {customerData.custTotalBillAmount ? customerData.custTotalBillAmount.toFixed(3) : '0.000'}
                                                    </td>
                                                    <td className="text-right font-bold" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>
                                                        {customerData.custTotalTDSDebit ? customerData.custTotalTDSDebit.toFixed(2) : '0.00'}
                                                    </td>
                                                    <td className="text-right font-bold" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>
                                                        {customerData.custTotalTDSCredit ? customerData.custTotalTDSCredit.toFixed(2) : '0.00'}
                                                    </td>
                                                    <td colSpan={5} style={{ border: '1px solid #000', padding: '4px' }}></td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })}

                                    {/* Profile Level Grand Summary Row */}
                                    <tr className="grand-total-row" style={{ backgroundColor: '#cbd5e1' }}>
                                        <td className="grand-total-label" style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }}>
                                            {profileName}
                                        </td>
                                        <td className="text-center font-bold" style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>Total</td>
                                        <td className="text-right font-bold" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>
                                            {profileData.profileTotalNetAmount ? profileData.profileTotalNetAmount.toFixed(3) : '0.000'}
                                        </td>
                                        <td className="text-right font-bold" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>
                                            {profileData.profileTotalBillAmount ? profileData.profileTotalBillAmount.toFixed(3) : '0.000'}
                                        </td>
                                        <td className="text-right font-bold" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>
                                            {profileData.profileTotalTDSDebit ? profileData.profileTotalTDSDebit.toFixed(2) : '0.00'}
                                        </td>
                                        <td className="text-right font-bold" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>
                                            {profileData.profileTotalTDSCredit ? profileData.profileTotalTDSCredit.toFixed(2) : '0.00'}
                                        </td>
                                        <td colSpan={5} style={{ border: '1px solid #000', padding: '4px' }}></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    );
                })}



            </div>
        </div>
    )
}

export default TDSPrint
