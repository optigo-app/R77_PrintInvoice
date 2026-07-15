import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  TextField,
  Grid,
  IconButton,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const RateModal = ({ show, onClose, onApply, joblist }) => {
  const [rateType, setRateType] = useState('percent');
  const [value, setValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setRateType(joblist[0]?.salePriceType ?? 'percent');
    setValue(joblist[0]?.SalePriceDiscount ?? '');
  }, [joblist]);


  const handleApply = () => {
    setErrorMsg('');

    if (!rateType || value === '') {
      setErrorMsg('Please select a rate type and enter a value.');
      return;
    }

    const numericValue = parseFloat(value);

    if (isNaN(numericValue) || numericValue < 0) {
      setErrorMsg('Please enter a valid positive number.');
      return;
    }

    const exceededItem = joblist.find((job) => {
      const price = Number(job?.salePrice) || 0;

      if (price <= 0) return true;

      if (rateType === 'percent') {
        const discountAmount = (price * numericValue) / 100;
        return price - discountAmount <= 0;
      }

      return price - numericValue <= 0;
    });

    if (exceededItem) {
      const price = Number(exceededItem?.salePrice) || 0;
      // const discountAmount =
      //   rateType === 'percent'
      //     ? (price * numericValue) / 100
      //     : numericValue;

      setErrorMsg(
        'Discount cannot be more than the item price. Please reduce the discount value.'
      );
      return;
    }

    onApply({ type: rateType, value });
    handleClose();
  };


  const handleClose = () => {
    setRateType('');
    setValue('');
    setErrorMsg('');
    onClose();
  };

  return (
    <Dialog open={show} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, position: 'relative' }}>
        Discount
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sx={{ paddingTop: '0px !important' }}>
            <ToggleButtonGroup
              value={rateType}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) setRateType(newValue);
                setValue('');
              }}
              fullWidth
              sx={{
                mb: 2,
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
              <ToggleButton value="percent">Percent per pcs</ToggleButton>
              <ToggleButton value="amount">Amount per pcs</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value"
              variant="outlined"
            />
          </Grid>
          {errorMsg && (
            <Grid item xs={12}>
              <div style={{ color: 'red', fontSize: '0.875rem' }}>{errorMsg}</div>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="error" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" color="success" onClick={handleApply}>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RateModal;
