import {
    Box,
    Typography,
    TextField,
    ToggleButtonGroup,
    ToggleButton,
} from "@mui/material";

const RoundOffBox = ({
    totalAmount = 0,
    roundUpTotalAmount,
    roundType,
    roundValue,
    dueDays,
    dueDaysError,
    selectedTaxProfile,
    taxProfileDT1,
    jobHSNNo,
    pendingNote = true,
    onToggleChange,
    onValueChange,
    onRoundup,
    onDueDaysChange,
}) => {
    const subtotal = typeof totalAmount === 'number' ? totalAmount : (parseFloat(totalAmount) || 0);
    const isGSTProfile = selectedTaxProfile?.GSTProfileid > 0;
    const gstProfileId = selectedTaxProfile?.GSTProfileid;
    const gstTaxEntry = isGSTProfile && taxProfileDT1?.find((entry) => entry.HSN_No === jobHSNNo);

    let totalTax = 0;
    if (isGSTProfile && gstTaxEntry) {
        if (gstProfileId === 1) {
            totalTax = (subtotal * (parseFloat(gstTaxEntry.CGST) || 0)) / 100 + (subtotal * (parseFloat(gstTaxEntry.SGST) || 0)) / 100;
        } else if (gstProfileId === 2) {
            totalTax = (subtotal * (parseFloat(gstTaxEntry.IGST) || 0)) / 100;
        }
    } else if (!isGSTProfile && selectedTaxProfile) {
        [1, 2, 3, 4, 5].forEach((n) => {
            const taxValue = parseFloat(selectedTaxProfile[`tax${n}_value`] || 0);
            if (taxValue > 0 && selectedTaxProfile[`tax${n}_taxname`]) {
                totalTax += (subtotal * taxValue) / 100;
            }
        });
    }
    const totalWithTax = subtotal + totalTax;
    const roundoffValue = roundValue ? parseFloat(roundValue) : 0;
    const finalAmount = roundType === 'less' ? totalWithTax - roundoffValue : totalWithTax + roundoffValue;

    const hasTaxes = isGSTProfile
        ? !!(gstTaxEntry && (gstProfileId === 1 ? ((parseFloat(gstTaxEntry.CGST) || 0) > 0 || (parseFloat(gstTaxEntry.SGST) || 0) > 0) : (parseFloat(gstTaxEntry.IGST) || 0) > 0))
        : selectedTaxProfile && [1, 2, 3, 4, 5].some((n) => {
            const taxValue = parseFloat(selectedTaxProfile[`tax${n}_value`] || 0);
            const taxName = selectedTaxProfile[`tax${n}_taxname`];
            return taxValue > 0 && taxName;
        });

    return (
        <Box
            sx={{
                border: "1px solid #989898",
                padding: 2,
                maxWidth: 350,
                width: 350,
                fontFamily: "Arial, sans-serif",
                backgroundColor: "#fff",
                borderRadius: 0,
                boxShadow: "none",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                position: "relative",
            }}
        >
            {/* Subtotal */}
            {hasTaxes && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography fontSize={14} color="text.secondary">
                        Subtotal
                    </Typography>
                    <Typography fontSize={20} fontWeight={600}>
                        {subtotal.toFixed(2)}
                    </Typography>
                </Box>
            )}

            {/* Tax Breakdown */}
            {hasTaxes && (
                <Box sx={{ backgroundColor: "#f5f5f5", borderRadius: 1, px: 1.5, py: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
                    <Typography fontSize={12} fontWeight={600} color="text.primary" sx={{ mb: 0.25 }}>
                        Tax Breakdown
                    </Typography>
                    {isGSTProfile && gstTaxEntry && gstProfileId === 1 && (
                        <>
                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography fontSize={13} color="text.secondary">
                                    CGST - {gstTaxEntry.CGST}%
                                </Typography>
                                <Typography fontSize={13} fontWeight={500}>
                                    {((subtotal * (parseFloat(gstTaxEntry.CGST) || 0)) / 100).toFixed(2)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography fontSize={13} color="text.secondary">
                                    SGST - {gstTaxEntry.SGST}%
                                </Typography>
                                <Typography fontSize={13} fontWeight={500}>
                                    {((subtotal * (parseFloat(gstTaxEntry.SGST) || 0)) / 100).toFixed(2)}
                                </Typography>
                            </Box>
                        </>
                    )}
                    {isGSTProfile && gstTaxEntry && gstProfileId === 2 && (
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography fontSize={13} color="text.secondary">
                                IGST - {gstTaxEntry.IGST}%
                            </Typography>
                            <Typography fontSize={13} fontWeight={500}>
                                {((subtotal * (parseFloat(gstTaxEntry.IGST) || 0)) / 100).toFixed(2)}
                            </Typography>
                        </Box>
                    )}
                    {!isGSTProfile && [1, 2, 3, 4, 5].map((n) => {
                        const taxName = selectedTaxProfile[`tax${n}_taxname`];
                        const taxValue = parseFloat(selectedTaxProfile[`tax${n}_value`] || 0);
                        if (taxValue > 0 && taxName) {
                            const taxAmount = (subtotal * taxValue) / 100;
                            return (
                                <Box key={n} sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography fontSize={13} color="text.secondary">
                                        {taxName} - {taxValue}%
                                    </Typography>
                                    <Typography fontSize={13} fontWeight={500}>
                                        {taxAmount.toFixed(2)}
                                    </Typography>
                                </Box>
                            );
                        }
                        return null;
                    })}
                </Box>
            )}

            {/* Total Amount */}
            <Box sx={{ display: "flex", justifyContent: "space-between", ...(hasTaxes && { borderTop: "1px solid #e0e0e0", pt: 1.5 }) }}>
                <Typography fontSize={14} color="text.secondary">
                    Total Amount
                </Typography>
                <Typography fontSize={20} fontWeight={600}>
                    {totalWithTax.toFixed(2)}
                </Typography>
            </Box>

            {/* Roundoff Amount */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography fontSize={14} color="text.secondary">
                    Roundoff Amount
                </Typography>
                <Typography fontSize={16} fontWeight={500}>
                    {roundoffValue.toFixed(2)}
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "end",
                    gap: "10px",
                }}
            >
                <Box sx={{ display: "flex", gap: 1 }}>
                    <button className="roundup_btn_bill" onClick={onRoundup}>
                        ROUNDUP
                    </button>
                </Box>

                <ToggleButtonGroup
                    value={roundType}
                    exclusive
                    onChange={onToggleChange}
                    fullWidth
                    size="small"
                    sx={{
                        mt: 1,
                        "& .MuiToggleButton-root": {
                            fontSize: 14,
                            textTransform: "none",
                            padding: "4px 12px",
                        },
                        "& .MuiToggleButton-root.Mui-selected": {
                            backgroundColor: "#bbbbbb",
                            color: "#fff",
                            "&:hover": {
                                backgroundColor: "#707070",
                            },
                        },
                    }}
                >
                    <ToggleButton value="less">Less</ToggleButton>
                    <ToggleButton value="add">Add</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Input Field */}
            <Box>
                <Typography fontSize={12} sx={{ mb: 0.5 }}>
                    Add / Less
                </Typography>
                <TextField
                    size="small"
                    type="number"
                    fullWidth
                    value={roundValue ?? ''}
                    onChange={onValueChange}
                    placeholder="Enter value"
                />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography fontSize={14} color="text.secondary">
                    Final Amount
                </Typography>
                <Typography fontSize={20} fontWeight={600}>
                    {finalAmount.toFixed(2)}
                </Typography>
            </Box>

            {/* Due Days */}
            <Box>
                <Typography fontSize={12} sx={{ mb: 0.5 }}>
                    Due Days
                </Typography>
                <TextField
                    size="small"
                    type="text"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 4 }}
                    fullWidth
                    value={dueDays ?? ''}
                    onChange={onDueDaysChange}
                    placeholder="Enter due days"
                    error={!!dueDaysError}
                />
                {dueDaysError && (
                    <Typography fontSize={12} color="error" sx={{ mt: 0.5 }}>
                        {dueDaysError}
                    </Typography>
                )}
            </Box>
            {pendingNote == true && (
                <Typography fontSize={12} color="error" sx={{ mt: 1 }}>
                    <strong>Round Off Pending.</strong>{" "}
                    <span
                        style={{
                            textDecoration: "underline",
                            cursor: "pointer",
                            fontWeight: 500,
                        }}
                        onClick={onRoundup}
                    >
                        Click on Roundup
                    </span>{" "}
                    to apply round off.
                </Typography>
            )}
        </Box>
    );
};

export default RoundOffBox;
