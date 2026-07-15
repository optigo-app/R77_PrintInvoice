import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Icon from '../@core/components/icon'
import CustomAvatar from '../@core/components/mui/avatar'
import { useEffect } from 'react';
import { fetchDashboardData, formatAmount, formatAmountKWise } from '../GlobalFunctions';
import { useState } from 'react';
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import "./chartcss/analytics.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CategoryWiseSalesProfitAmount = ({ tkn, fdate, tdate, country, CategoryWiseSaleAmountData, IsEmpLogin }) => {
  console.log('CategoryWiseSaleAmountData: ', CategoryWiseSaleAmountData);
  console.log('country: ', country);
  const theme = useTheme();
  const [apiData, setApiData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transformedData = CategoryWiseSaleAmountData?.map(item => {
          const adjustedCost = ((item.CurrentCost - item?.CurrentCost_SaleReturn) || 0) * 0.7;
          const adjustedProfit = (item.SaleAmount || 0) - adjustedCost;

          return {
            CustomerDisplay: `${item.Customer} (${item.CompanyName})`,
            ...item,
            AdjustedProfit: adjustedProfit
          };
        });
        setApiData(transformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [CategoryWiseSaleAmountData]);

  const sortedData = apiData?.sort((a, b) => {
    const saleAmountA = a?.SaleAmount || 0;
    const saleAmountB = b?.SaleAmount || 0;
    return saleAmountB - saleAmountA;
  });
  const top10 = sortedData?.slice(0, 10);

  const sales = top10?.map((e) => +((e?.SaleAmount / (+country))?.toFixed(2)));
  console.log('country: ', country);
  console.log('sales: ', sales);
  const profit = top10?.map((e) => +(e?.AdjustedProfit / (+country))?.toFixed(2));
  const quantities = top10?.map((e) => e?.Quantity || 0);
  const negativeArray = profit?.map(value => Math?.abs(value) * -1);
  const salesNames = top10?.map((e) => e?.Category)
  const totalSale = top10?.reduce((acc, num) => acc + num?.SaleAmount, 0);
  const totalProfit = top10?.reduce((acc, num) => acc + num?.AdjustedProfit, 0);
  console.log('totalProfit: ', totalProfit);

  const datas = {
    labels: salesNames,
    datasets: [
      {
        maxBarThickness: 15,
        label: 'Sales',
        backgroundColor: theme?.palette?.customColors?.red,
        data: sales,
      },
      ...(IsEmpLogin === 0 ?
        [{
          maxBarThickness: 15,
          backgroundColor: theme?.palette?.customColors?.green,
          label: 'Profit',
          data: profit
        }] : [])
    ]
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `${formatAmountKWise((context.parsed.y))}`;
            }
            if (context.dataset.label === 'Sales') {
              const quantity = quantities[context.dataIndex];
              label += ` (Qty: ${quantity})`;
            }
            return label;
          }
        }
      },
      title: {
        display: false
      }
    },
    responsive: true,
    scales: {
      x: {
        stacked: false,
      },
      y: {
        stacked: false,
        ticks: {
          callback: function (value) {
            return `${formatAmountKWise((value / (+country)))}`;
          }
        }
      }
    }
  };

  const data = [
    {
      amount: formatAmountKWise((totalSale / (+country))),
      subtitle: '',
      title: 'Total Sales Amount',
      avatarColor: 'primary',
      avatarIcon: `${country === '7.8' ? 'tabler:currency-dollar' : 'tabler:currency-rupee'}`
    },
    ...(IsEmpLogin === 0 ?
      [{
        amount: formatAmountKWise((totalProfit / (+country))),
        title: 'Total Profit Amount',
        avatarColor: 'secondary',
        subtitle: '',
        avatarIcon: `${country === '7.8' ? 'tabler:currency-dollar' : 'tabler:currency-rupee'}`
      }] : [
        {
          amount: '',
          title: '',
          avatarColor: '',
          subtitle: '',
          avatarIcon: ``
        }
      ]
    )
  ];

  return (
    <Card style={{ boxShadow: '0px 4px 18px 0px rgba(47, 43, 61, 0.1)' }} className='fs_analytics_l'>
      <CardHeader
        title='Category Wise Sales Amount'
        style={{ paddingBottom: '3px' }}
        subheader={
          <Box
            sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', '& svg': { mr: 1, color: 'success.main' } }}
          >
          </Box>
        }
      />
      <CardContent>
        <Bar data={datas} height={150} options={options} />
        {data?.map((item, index) => {
          const avatarColor = index === 0 ? theme.palette.customColors.purple : theme.palette.customColors.grey;
          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                ...(index === 0 && { mt: 0 }),
                mb: index !== data.length - 1 ? 2.4 : undefined
              }}
            >
              <CustomAvatar
                skin='light'
                variant='rounded'
                sx={{ mr: 4, width: 34, height: 34, color: theme?.palette?.customColors?.grey, backgroundColor: item?.title === '' ? 'white' : 'rgba(25, 118, 210, 0.16)' }}
              >
                <Icon icon={item.avatarIcon} />
              </CustomAvatar>
              <Box
                sx={{
                  rowGap: 1,
                  columnGap: 4,
                  width: '100%',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant='h6'>{item.title}</Typography>
                  <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                    {item.subtitle}
                  </Typography>
                </Box>
                <Typography
                  sx={{ fontWeight: 500, color: item.amountDiff === 'negative' ? 'error.main' : 'success.main' }}
                  style={{ color: item?.title?.toLowerCase() === 'total profit' ? theme?.palette?.customColors?.green : theme?.palette?.customColors?.red, fontWeight: 'bold' }}
                >
                  {`${item.amountDiff === 'negative' ? '-' : ''}${item.amount}`}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default CategoryWiseSalesProfitAmount;