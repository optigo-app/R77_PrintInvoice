

import React from 'react'
import "../../assets/css/bagprint/multipart.css";
import queryString from 'query-string';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import "../../assets/css/bagprint/jobbagsticker.css"
import Loader from '../../components/Loader';
import QRCodeGenerator from '../../components/QRCodeGenerator';
import { GetUniquejob } from '../../GlobalFunctions/GetUniqueJob';
import { FetchDatas } from '../../GlobalFunctions/FetchDatas';
import { Box,  Typography } from "@mui/material";
import { cloneDeep, slice } from 'lodash';

export const JobDesc = () => {
    return (
        <div>Jobs are ready to print</div>
    )
}

const MultiPart = ({ queries, headers }) => {
    const location = useLocation();
    const [filterData, setFilterData] = useState([]);
    const [countObj, setCountObj] = useState({});
    const queryParams = queryString.parse(location.search);
    const resultString = GetUniquejob(queryParams?.str_srjobno);
    const [data, setData] = useState([]);
    const [title, setTitle] = useState('');

    const [diaFlag, setDiaFlag] = useState(false);
      
  useEffect(() => {
    const fetchData = async () => {
      try {
        let abc = await FetchDatas(queryParams, resultString, queries, headers);

        let finalAbc = [];
        
            abc?.forEach((al) => {
                let obj = cloneDeep(al);
                let diaq0 = obj?.data?.rd1?.filter(e => e?.MasterManagement_DiamondStoneTypeid === 3);
                let diaq1 = diaq0?.map(e => e?.Quality);
                let diaq2 = [...new Set(diaq1)];
                obj.data.rd.diamondQuality = diaq2; 

                finalAbc.push(obj);
            })

            abc = finalAbc;
        

        let diaList = [];
        let clsList = [];
        let miscList = [];
        let findingList = [];
        let metalList = [];
        let obj = {
            dia:0,
            cls:0,
            misc:0,
            finding:0,
            metal:0,
            diamondJobList:[],
            colorStoneList:[],
            miscJobList:[],
            findingJobList:[],
            metalJobList:[]
        }
        let arr = [];
        abc[0]?.allDatas?.rd1?.forEach((a) => {
            
            if(a?.MasterManagement_DiamondStoneTypeid === 5){
                arr.push(a);
                findingList.push(a);
                //finding
            }
            if(a?.MasterManagement_DiamondStoneTypeid === 7){
                arr.push(a);
                miscList.push(a);
                //misc
            }
            if(a?.MasterManagement_DiamondStoneTypeid === 3){
                arr.push(a);
                diaList.push(a);
                //dia
            }
            if(a?.MasterManagement_DiamondStoneTypeid === 4){
                arr.push(a);
                clsList.push(a);
                //clr
            }
        })
        abc[0]?.allDatas?.rd?.forEach((a) => {
            if(a?.MetalType !== '') {
                metalList?.push(a);
            }
        })
        const uniqueDiamondJobs = [...new Set(diaList.map(d => d.SerialJobno))];
        const uniqueClsJobs = [...new Set(clsList.map(d => d.SerialJobno))];
        const uniqueMiscJobs = [...new Set(miscList.map(d => d.SerialJobno))];
        const uniqueFindingJobs = [...new Set(findingList.map(d => d.SerialJobno))];
        const uniqueMetalJobs = [...new Set(metalList.map(d => d.serialjobno))];

        obj.dia = uniqueDiamondJobs.length;
        obj.diamondJobList = uniqueDiamondJobs;

        obj.cls = uniqueClsJobs.length;
        obj.colorStoneList = uniqueClsJobs;

        obj.misc = uniqueMiscJobs.length;
        obj.miscJobList = uniqueMiscJobs;

        obj.finding = uniqueFindingJobs.length;
        obj.findingJobList = uniqueFindingJobs;

        obj.metal = uniqueMetalJobs.length;
        obj.metalJobList = uniqueMetalJobs;

        setCountObj(obj);
        
        abc?.length > 0 ? setData(abc) : setData([])
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
    useEffect(() => {
        if (Object.keys(queryParams)?.length !== 0) {
            atob(queryParams?.imagepath);
        }
    }, [queryParams]);

    const handleButtonClick = (args) => {

        setTitle('');
        setFilterData([]);
    
        switch (args) {
            case 'diamond':
                setDiaFlag(true);
                filterDataByType('diamondJobList', 'DIAMOND');
                break;
            case 'colorstone':
                setDiaFlag(false);
                filterDataByType('colorStoneList', 'COLORSTONE');
                break;
            case 'misc':
                setDiaFlag(false);
                filterDataByType('miscJobList', 'MISC');
                break;
            case 'finding':
                setDiaFlag(false);
                filterDataByType('findingJobList', 'FINDING');
                break;
            case 'metal':
                setDiaFlag(false);
                filterDataByType('metalJobList', 'METAL');
                break;
            default:
                break;
        }
    }

    const filterDataByType = (listType, title) => {
        let finalArr = [];
        data?.forEach((e) => {
            countObj?.[listType]?.forEach((a) => {
                if (e?.data?.rd?.serialjobno === a) {
                    finalArr.push(e);
                }
            });
        });
        
        let finalArr2 = [];

        finalArr?.forEach((e) => {
            e.data.rd.MetalColorCo = e?.data?.rd?.casting_split_detail?.split(",")[0];
            if(e?.data?.rd?.casting_split_count === 0){
                let obj = cloneDeep(e);
                // obj.data.rd.MetalColorCo = e?.data?.rd?.casting_split_detail;
                finalArr2.push(obj);
            }
            if(e?.data?.rd?.casting_split_count === 1){
                let obj1 = cloneDeep(e);
                let obj = cloneDeep(e);
                obj1.data.rd.metal_color_casted = "(B)";
                if(e?.data?.rd?.casting_split_detail === ''){
                    obj1.data.rd.MetalColor = e?.data?.rd?.MetalColor; 
                }else{
                    // obj1.data.rd.metal_color_casted = e?.data?.rd?.casting_split_detail?.split(",")[0];
                    obj.data.rd.MetalColor = (e?.data?.rd?.casting_split_detail?.split(",")[0]);
                    obj1.data.rd.MetalColor = (e?.data?.rd?.casting_split_detail?.split(",")[1]);
                }

                finalArr2.push(obj);
                finalArr2.push(obj1);
            }
            if(e?.data?.rd?.casting_split_count === 2){
                let obj = cloneDeep(e);
                let obj1 = cloneDeep(e);
                let obj2 = cloneDeep(e);
                obj1.data.rd.metal_color_casted = "(B)";
                obj2.data.rd.metal_color_casted = "(C)";
                if(e?.data?.rd?.casting_split_detail === ''){
                    obj1.data.rd.metal_color_casted =    e?.data?.rd?.MetalColor; 
                }else{
                     
                    obj.data.rd.MetalColor = e?.data?.rd?.casting_split_detail?.split(",")[0];
                    obj1.data.rd.MetalColor = e?.data?.rd?.casting_split_detail?.split(",")[1];
                    obj2.data.rd.MetalColor = e?.data?.rd?.casting_split_detail?.split(",")[2];
                }
                
                finalArr2.push(obj);
                finalArr2.push(obj1);
                finalArr2.push(obj2);
            }

            // console.log("finalArr2", finalArr2);
        });
        setTimeout(() => {
            
            setFilterData(finalArr2);
            setTitle(title);
            
        }, 0);
    
        if (finalArr2.length > 0) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    };
    // function getTotalByTitle(data, title) {
    //     if (!Array.isArray(data)) return 0;
      
    //     return data.reduce((total, item) => {
    //       const additional = item?.additional || {};
      
    //       if (title === "DIAMOND") {
    //         return total + (additional?.dia?.diaWt || 0);
    //       }
      
    //       if (title === "ColorStone") {
    //         return total + (additional?.clr?.clrWt || 0);
    //       }
      
    //       if (title === "Misc") {
    //         return total + (additional?.misc?.miscWt || 0);
    //       }
      
    //       return total;
    //     }, 0);
    //   }

  
    
  return (
    <div className='bg_color_mlt pb-5 mb-5'>
    {
      data?.length === 0 ? <Loader /> : <React.Fragment>
            
            <div className='hideOnPrint  '>
                <div className='w-100 d-flex align-items-center justify-content-center'>
                    <div className=' d-flex flex-column justify-content-between align-items-center p-1 w-100'>
                        <div className='d-flex align-items-center justify-content-center py-2'>
                            <div className='multipart_head' style={{fontFamily:'Helvetica, Verdana, sans-serif'}}>Multi Part Bagging Process For &nbsp;</div>
                            <div className='multipart_head text-center number-box border border_color_head ' style={{minWidth:'100px'}}>{data?.length}</div>
                            <div className='multipart_head'>&nbsp;{data?.length > 1 ? 'Jobs' : 'Job'}</div>
                        </div>
                        <div className='d-flex  justify-content-around align-items-center py-2 flex-wrap border bg_color_container' style={{marginTop:'3%', minHeight:'30rem', width:'95%', paddingLeft:'1%', paddingRight:'1%'}}>
                            <div style={{margin:'1rem', boxSizing:'border-box'}} className='bg-white text-black mx-0'>
                                <Box className="border rounded box_css_mlt d-flex flex-column border_color_head justify-content-between align-items-center m-0">
                                    <div className='w-100 d-flex justify-content-center align-items-center py-2 border-bottom border_color_head'><Typography sx={{fontWeight:'bold'}}>METAL BAGS</Typography></div>
                                        <div className='countBox'>{countObj?.metal}</div>
                                        <JobDesc />
                                    <div className='p-1 d-flex justify-content-center align-items-center pb-3'>
                                        <button className="btn_white btn_w2 blue print_btn" disabled={countObj.metal < 1} onClick={() => handleButtonClick('metal')}>Print</button>
                                    </div>
                                </Box>
                            </div>
                            <div style={{margin:'1rem', boxSizing:'border-box'}} className='bg-white text-black mx-0'>
                                <Box className="border rounded box_css_mlt d-flex flex-column border_color_head justify-content-between align-items-center m-0">
                                    <div className='w-100 d-flex justify-content-center align-items-center py-2 border-bottom border_color_head'><Typography sx={{fontWeight:'bold'}}>DIAMOND BAGS</Typography></div>
                                        <div className='countBox'>{countObj?.dia}</div>
                                        <JobDesc />
                                    <div className='p-1 d-flex justify-content-center align-items-center pb-3'>
                                        <button className="btn_white btn_w2 blue print_btn" disabled={countObj.dia < 1} onClick={() => handleButtonClick('diamond')}>Print</button>
                                    </div>
                                </Box>
                            </div>
                            <div style={{margin:'1rem', boxSizing:'border-box'}} className='bg-white text-black mx-0'>
                                <Box className="border rounded box_css_mlt d-flex flex-column border_color_head justify-content-between align-items-center m-0">
                                    <div className='w-100 d-flex justify-content-center align-items-center py-2 border-bottom border_color_head'><Typography sx={{fontWeight:'bold'}}>COLORSTONE BAGS</Typography></div>
                                    <div className='countBox'>{countObj?.cls}</div>
                                    <JobDesc />
                                    <div className='p-1 d-flex justify-content-center align-items-center pb-3'>
                                    <button className="btn_white btn_w2 blue print_btn" disabled={countObj.cls < 1} onClick={() => handleButtonClick('colorstone')}>Print</button>
                                    </div>
                                </Box>
                            </div>
                            <div style={{margin:'1rem', boxSizing:'border-box'}} className='bg-white mx-0'>
                                <Box className="border rounded box_css_mlt d-flex flex-column border_color_head justify-content-between align-items-center m-0">
                                    <div className='w-100 d-flex justify-content-center align-items-center py-2 border-bottom border_color_head'><Typography sx={{fontWeight:'bold'}}>MISC BAGS</Typography></div>
                                    <div className='countBox'>{countObj?.misc}</div>
                                    <JobDesc />
                                    <div className='p-1 d-flex justify-content-center align-items-center pb-3'>
                                    <button className="btn_white btn_w2 blue print_btn" disabled={countObj.misc < 1} onClick={() => handleButtonClick('misc')}>Print</button>
                                    </div>
                                </Box>
                            </div>
                            <div style={{margin:'1rem', boxSizing:'border-box'}} className='bg-white mx-0'>
                                <Box className="border rounded box_css_mlt d-flex flex-column border_color_head justify-content-between align-items-center m-0">
                                    <div className='w-100 d-flex justify-content-center align-items-center py-2 border-bottom border_color_head'><Typography sx={{fontWeight:'bold'}}>FINDING BAGS</Typography></div>
                                    <div className='countBox'>{countObj?.finding}</div>
                                        <div>Jobs Are Ready To Print</div>
                                    <div className='p-1 d-flex justify-content-center align-items-center pb-3'>
                                        <button className="btn_white btn_w2 blue print_btn" disabled={countObj.finding < 1} onClick={() => handleButtonClick('finding')}>Print</button>
                                    </div>
                                </Box>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='mainjobbagsticker showOnPrint'>
            {Array.from({ length: queries?.pageStart }, (_, index) => (
                    index > 0 && <div key={index} className="container  ml_5 mb_10"></div>
                ))}
                 
                 
                {
                  filterData?.length > 0 && filterData?.map((e, index) => {
                     
                    return(
                        <div className='containerjbsbg' key={index}>
                            <div>
                                    <div className=' fsjbsbg  py-1 d-flex align-items-center'>{title}</div>
                                { e?.data?.rd?.serialjobno?.length > 0 && <div className='fsjbsbg fw-bold'>{e?.data?.rd?.serialjobno} {e?.data?.rd?.metal_color_casted}</div>}
                                { e?.data?.rd?.Designcode?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.Designcode}</div>}
                                { e?.data?.rd?.CustomerCode?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.CustomerCode}</div>}
                                { e?.data?.rd?.OrderNo?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.OrderNo}</div>}
                                { e?.data?.rd?.promiseDatef?.length > 0 && <div className='fsjbsbg fw-bold'>{e?.data?.rd?.promiseDatef}</div>}
                                { e?.data?.rd?.Size?.length > 0 && <div className='fsjbsbg'>Size: {e?.data?.rd?.Size}</div>}
                                { e?.data?.rd?.MetalType?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.MetalType?.split(" ")[1] + " " +e?.data?.rd?.MetalColor}</div>}
                                { e?.data?.rd?.MetalWeight > 0 && <div className='fsjbsbg'>{(+e?.data?.rd?.MetalWeight)?.toFixed(3)}gm</div>}
                                {title=="DIAMOND" && (
                                 e?.additional?.dia?.diaWt > 0 && <div className='fsjbsbg'>{("DiaWeight: " + (+e?.additional?.dia?.diaWt)?.toFixed(3))}ct</div>
                                )}
                                 {title=="COLORSTONE" && (
                                  e?.additional?.clr?.clrWt > 0 && <div className='fsjbsbg'>{("ColorWeight: " + (+e?.additional?.clr?.clrWt)?.toFixed(3))}ct</div>
                                )}
                                {title=="MISC" && (
                                  e?.additional?.misc?.miscWt > 0 && <div className='fsjbsbg'>{("MiscWeight: "+(  +e?.additional?.misc?.miscWt)?.toFixed(3))}gm</div>
                                )}
                                {title=="FINDING" && (
                                  e?.additional?.fin?.finWt > 0 && <div className='fsjbsbg'>{("FinWeight: "+(  +e?.additional?.fin?.finWt)?.toFixed(3))}gm</div>
                                )}   {/* first changes in FetchDatas,js additional */}
                                <div className='d-flex justify-content-start align-items-center'>
                                    <QRCodeGenerator text={e?.data?.rd.serialjobno +" "+ (e?.data?.rd?.metal_color_casted === undefined ? '' : e?.data?.rd?.metal_color_casted)} />{ diaFlag && <span className='fsjbsbg'>{e?.data?.rd?.diamondQuality?.join(",")}</span>}
                                </div>
                            </div>
                            <div className='text-break ins_multipart fw-bolder'>
                                {e?.data?.rd?.officeuse.slice(0, 30)} {e?.data?.rd?.ProductInstruction}
                            </div>
                            {/* <div className='text-break ins_multipart fw-bolder'>{e?.data?.rd?.officeuse}</div> */}
                        </div>
                    //   <React.Fragment key={index}>
                    //     {
                    //       e?.additional?.pages?.length > 0 ? e?.additional?.pages?.map((el, i) => {
                    //         return(
                    //             <>
                    //           <div className='containerjbsbg' key={i}>
                    //             <div>
                    //                     <div className=' fsjbsbg  py-1 d-flex align-items-center'>{title}</div>
                    //                 { e?.data?.rd?.serialjobno?.length > 0 && <div className='fsjbsbg fw-bold'>{e?.data?.rd?.serialjobno}</div>}
                    //                 { e?.data?.rd?.Designcode?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.Designcode}</div>}
                    //                 { e?.data?.rd?.CustomerCode?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.CustomerCode}</div>}
                    //                 { e?.data?.rd?.OrderNo?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.OrderNo}</div>}
                    //                 { e?.data?.rd?.promiseDatef?.length > 0 && <div className='fsjbsbg fw-bold'>{e?.data?.rd?.promiseDatef}</div>}
                    //                 { e?.data?.rd?.Size?.length > 0 && <div className='fsjbsbg'>Size: {e?.data?.rd?.Size}</div>}
                    //                 { e?.data?.rd?.MetalType?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.MetalType?.split(" ")[1] + " " +e?.data?.rd?.MetalColorCo}</div>}
                    //                 { e?.data?.rd?.MetalWeight > 0 && <div className='fsjbsbg'>{(+e?.data?.rd?.MetalWeight)?.toFixed(3)}gm</div>}
                    //                 <div className='d-flex justify-content-start align-items-center'>
                    //                     <QRCodeGenerator text={e?.data?.rd.serialjobno} />
                    //                 </div>
                    //             </div>
                    //             <div className='text-break ins_multipart fw-bolder'>{e?.data?.rd?.ProductInstruction}</div>

                    //           </div>
                    //       </>
                    //         )
                    //       }) : 
                    //       <>
                    //       <div className='containerjbsbg'>
                    //         <div>
                    //                 <div className=' fsjbsbg  py-1 d-flex align-items-center'>{title}</div>
                    //             { e?.data?.rd?.serialjobno?.length > 0 && <div className='fsjbsbg fw-bold'>{e?.data?.rd?.serialjobno}</div>}
                    //             { e?.data?.rd?.Designcode?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.Designcode}</div>}
                    //             { e?.data?.rd?.CustomerCode?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.CustomerCode}</div>}
                    //             { e?.data?.rd?.OrderNo?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.OrderNo}</div>}
                    //             { e?.data?.rd?.promiseDatef?.length > 0 && <div className='fsjbsbg fw-bold'>{e?.data?.rd?.promiseDatef}</div>}
                    //             { e?.data?.rd?.Size?.length > 0 && <div className='fsjbsbg'>Size: {e?.data?.rd?.Size}</div>}
                    //             { e?.data?.rd?.MetalType?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.MetalType?.split(" ")[1] +" " +e?.data?.rd?.MetalColorCo}</div>}
                    //             <div className='d-flex justify-content-start align-items-center'>
                    //                 <QRCodeGenerator text={e?.data?.rd.serialjobno} />
                    //             </div>
                    //         </div>
                    //         <div ><label htmlFor="" className='ins_multipart text-break fw-bolder'>{(e?.data?.rd?.ProductInstruction)}</label></div>
                    //       </div>
                    //       </>
                    //     }
                    //   </React.Fragment>
                    )
                  })
                }
            </div>
      </React.Fragment>
    }
</div>
  )
}

export default MultiPart


// import React, { useEffect, useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import queryString from 'query-string';
// import "../../assets/css/bagprint/multipart.css";
// // import "../../assets/css/bagprint/jobbagsticker.css";
// import Loader from '../../components/Loader';
// import QRCodeGenerator from '../../components/QRCodeGenerator';
// import { GetUniquejob } from '../../GlobalFunctions/GetUniqueJob';
// import { FetchDatas } from '../../GlobalFunctions/FetchDatas';
// import { Box, Button, Typography } from "@mui/material";

// const JobBagDetails = ({ jobData, title }) => (
//   <div className='containerjbsbg'>
//     <div className='fsjbsbg py-1 d-flex align-items-center'>{title}</div>
//     {jobData?.data?.rd && (
//       <>
//         {Object.entries(jobData?.data?.rd).map(([key, value]) =>
//           value && (
//             <div className='fsjbsbg' key={key}>
//               {key === 'MetalWeight' ? (+value).toFixed(3) + "gm" : value}
//             </div>
//           )
//         )}
//         <div className='d-flex justify-content-start align-items-center'>
//           <QRCodeGenerator text={jobData?.data?.rd.serialjobno} />
//         </div>
//       </>
//     )}
//   </div>
// );

// const MultiPart = ({ queries, headers }) => {
//   const location = useLocation();
//   const queryParams = queryString.parse(location.search);
//   const resultString = GetUniquejob(queryParams?.str_srjobno);
//   const [data, setData] = useState([]);
//   const [countObj, setCountObj] = useState({});
//   const [filterData, setFilterData] = useState([]);
//   const [title, setTitle] = useState('');

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const abc = await FetchDatas(queryParams, resultString, queries, headers);
//         const obj = {
//           diamond: 0, colorStone: 0, misc: 0, finding: 0,
//           diamondJobList: [], colorStoneList: [],
//           miscJobList: [], findingJobList: [],
//         };
//         abc[0]?.allDatas?.rd1?.forEach((a) => {
//           const typeId = a?.MasterManagement_DiamondStoneTypeid;
//           if (typeId === 5) { obj.findingJobList.push(a); }
//           else if (typeId === 7) { obj.miscJobList.push(a); }
//           else if (typeId === 3) { obj.diamondJobList.push(a); }
//           else if (typeId === 4) { obj.colorStoneList.push(a); }
//         });
//         obj.diamondJobList = [...new Set(obj.diamondJobList.map(d => d.SerialJobno))];
//         obj.diamond = obj.diamondJobList.length;
//         obj.colorStoneList = [...new Set(obj.colorStoneList.map(d => d.SerialJobno))];
//         obj.colorStone = obj.colorStoneList.length;
//         obj.miscJobList = [...new Set(obj.miscJobList.map(d => d.SerialJobno))];
//         obj.misc = obj.miscJobList.length;
//         obj.findingJobList = [...new Set(obj.findingJobList.map(d => d.SerialJobno))];
//         obj.finding = obj.findingJobList.length;

//         // setCountObj(obj);    
//         setTimeout(() => {
//             setCountObj(obj);
//         },10)
//         setData(abc.length > 0 ? abc : []);
//       } catch (error) {
//         console.error(error);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleButtonClick = (type) => {
//     setTitle('');
//     setFilterData([]);
//     const types = {
//       diamond: { list: 'diamondJobList', title: 'DIAMOND' },
//       colorstone: { list: 'colorStoneList', title: 'COLORSTONE' },
//       misc: { list: 'miscJobList', title: 'MISC' },
//       finding: { list: 'findingJobList', title: 'FINDING' },
//     };
//     if (types[type]) {
//         const finalArr = [];
//        data?.forEach(e => { 
//         countObj[types[type]?.list]?.forEach((a, i) => {
//             if(a === e?.data?.rd?.serialjobno){
//                 finalArr.push(e);
//             }
//         })
//       });
//       console.log(finalArr);
//       setFilterData(finalArr);
//       setTitle(types[type].title);
//       if (-1 > 0) {
//         setTimeout(() => window.print(), 500);
//       }
//     }
//   };

//   return (
//     <div className='bg_color_mlt pb-5 mb-5'>
//       {data.length === 0 ? <Loader /> : (
//         <div className='hideOnPrint'>
//           <div className='w-100 d-flex align-items-center justify-content-center'>
//             <div className='d-flex flex-column justify-content-between align-items-center p-1 w-100'>
//               <div className='d-flex align-items-center justify-content-center py-2'>
//                 <div className='multipart_head' style={{ fontFamily: 'Helvetica, Verdana, sans-serif' }}>Multi Part Bagging Process For &nbsp;</div>
//                 <div className='multipart_head text-center number-box border border_color_head' style={{ minWidth: '100px' }}>{data.length}</div>
//                 <div className='multipart_head'>&nbsp;{data.length > 1 ? 'Jobs' : 'Job'}</div>
//               </div>
//               <div className='d-flex justify-content-around align-items-center py-2 flex-wrap border bg_color_container' style={{ marginTop: '3%', minHeight: '30rem', width: '80%', padding: '1%' }}>
//                 {['diamond', 'colorStone', 'misc', 'finding'].map(type => (
//                   <div key={type} style={{ margin: '1rem', boxSizing: 'border-box' }} className='bg-white text-black mx-0'>
//                     <Box className="border rounded box_css_mlt d-flex flex-column border_color_head justify-content-between align-items-center m-0">
//                       <div className='w-100 d-flex justify-content-center align-items-center py-2 border-bottom border_color_head'>
//                         <Typography sx={{ fontWeight: 'bold' }}>{`${type.toUpperCase()} BAGS`}</Typography>
//                       </div>
//                       {console.log(countObj)}
//                       <div className='countBox'>{countObj[type]}</div>
//                       <div>Jobs Are Ready To Print</div>
//                       <div className='p-1 d-flex justify-content-center align-items-center pb-3'>
//                         <button className="btn_white btn_w2 blue print_btn" disabled={countObj[type] < 1} onClick={() => handleButtonClick(type)}>
//                           Print
//                         </button>
//                       </div>
//                     </Box>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//           <div className='mainjobbagsticker showOnPrint'>
//             {Array?.from({ length: queries?.pageStart }, (_, index) => index > 0 && <div key={index} className="container ml_5 mb_10"></div>)}
//             {filterData?.length > 0 && filterData?.map((e, index) => (
//               <React.Fragment key={index}>
//                 {e?.additional?.pages?.length > 0
//                   ? e?.additional?.pages?.map((page, i) => <JobBagDetails key={i} jobData={page} title={title} />)
//                   : <JobBagDetails jobData={e} title={title} />}
//               </React.Fragment>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MultiPart;


//---------------------------------------------------------------------------------------------------------------------
// import React from 'react'
// import "../../assets/css/bagprint/multipart.css";
// import queryString from 'query-string';
// import { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import "../../assets/css/bagprint/jobbagsticker.css"
// import Loader from '../../components/Loader';
// import QRCodeGenerator from '../../components/QRCodeGenerator';
// import { GetUniquejob } from '../../GlobalFunctions/GetUniqueJob';
// import { FetchDatas } from '../../GlobalFunctions/FetchDatas';
// import { Box,  Typography } from "@mui/material";

// export const JobDesc = () => {
//     return (
//         <div>Jobs are ready to print</div>
//     )
// }


// const MultiPart = ({ queries, headers }) => {
//     const location = useLocation();
//     const [filterData, setFilterData] = useState([]);
//     const [countObj, setCountObj] = useState({});
//     const queryParams = queryString.parse(location.search);
//     const resultString = GetUniquejob(queryParams?.str_srjobno);
//     const [data, setData] = useState([]);
//     const [title, setTitle] = useState('');
      
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const abc = await FetchDatas(queryParams, resultString, queries, headers);
//         let diaList = [];
//         let clsList = [];
//         let miscList = [];
//         let findingList = [];
//         let metalList = [];
//         let obj = {
//             dia:0,
//             cls:0,
//             misc:0,
//             finding:0,
//             metal:0,
//             diamondJobList:[],
//             colorStoneList:[],
//             miscJobList:[],
//             findingJobList:[],
//             metalJobList:[]
//         }
//         let arr = [];
//         abc[0]?.allDatas?.rd1?.forEach((a) => {
            
//             if(a?.MasterManagement_DiamondStoneTypeid === 5){
//                 arr.push(a);
//                 findingList.push(a);
//                 //finding
//             }
//             if(a?.MasterManagement_DiamondStoneTypeid === 7){
//                 arr.push(a);
//                 miscList.push(a);
//                 //misc
//             }
//             if(a?.MasterManagement_DiamondStoneTypeid === 3){
//                 arr.push(a);
//                 diaList.push(a);
//                 //dia
//             }
//             if(a?.MasterManagement_DiamondStoneTypeid === 4){
//                 arr.push(a);
//                 clsList.push(a);
//                 //clr
//             }
//         })
//         abc[0]?.allDatas?.rd?.forEach((a) => {
//             if(a?.MetalType !== '') {
//                 metalList?.push(a);
//             }
//         })
//         const uniqueDiamondJobs = [...new Set(diaList.map(d => d.SerialJobno))];
//         const uniqueClsJobs = [...new Set(clsList.map(d => d.SerialJobno))];
//         const uniqueMiscJobs = [...new Set(miscList.map(d => d.SerialJobno))];
//         const uniqueFindingJobs = [...new Set(findingList.map(d => d.SerialJobno))];
//         const uniqueMetalJobs = [...new Set(metalList.map(d => d.serialjobno))];

//         obj.dia = uniqueDiamondJobs.length;
//         obj.diamondJobList = uniqueDiamondJobs;

//         obj.cls = uniqueClsJobs.length;
//         obj.colorStoneList = uniqueClsJobs;

//         obj.misc = uniqueMiscJobs.length;
//         obj.miscJobList = uniqueMiscJobs;

//         obj.finding = uniqueFindingJobs.length;
//         obj.findingJobList = uniqueFindingJobs;

//         obj.metal = uniqueMetalJobs.length;
//         obj.metalJobList = uniqueMetalJobs;

//         setCountObj(obj);
        
//         abc?.length > 0 ? setData(abc) : setData([])
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     fetchData();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//     useEffect(() => {
//         if (Object.keys(queryParams)?.length !== 0) {
//             atob(queryParams?.imagepath);
//         }
//     }, [queryParams]);

//     const handleButtonClick = (args) => {

//         setTitle('');
//         setFilterData([]);
    
//         switch (args) {
//             case 'diamond':
//                 filterDataByType('diamondJobList', 'DIAMOND');
//                 break;
//             case 'colorstone':
//                 filterDataByType('colorStoneList', 'COLORSTONE');
//                 break;
//             case 'misc':
//                 filterDataByType('miscJobList', 'MISC');
//                 break;
//             case 'finding':
//                 filterDataByType('findingJobList', 'FINDING');
//                 break;
//             case 'metal':
//                 filterDataByType('metalJobList', 'METAL');
//                 break;
//             default:
//                 break;
//         }
//     }

//     const filterDataByType = (listType, title) => {
//         let finalArr = [];
//         data?.forEach((e) => {
//             countObj?.[listType]?.forEach((a) => {
//                 if (e?.data?.rd?.serialjobno === a) {
//                     finalArr.push(e);
//                 }
//             });
//         });
        
//         setTimeout(() => {
//             setFilterData(finalArr);
//             setTitle(title);
//         }, 0);
    
//         if (finalArr.length > 0) {
//             setTimeout(() => {
//                 window.print();
//             }, 500);
//         }
//     };

//   return (
//     <div className='bg_color_mlt pb-5 mb-5'>
//     {
//       data?.length === 0 ? <Loader /> : <React.Fragment>
            
//             <div className='hideOnPrint  '>
//                 <div className='w-100 d-flex align-items-center justify-content-center'>
//                     <div className=' d-flex flex-column justify-content-between align-items-center p-1 w-100'>
//                         <div className='d-flex align-items-center justify-content-center py-2'>
//                             <div className='multipart_head' style={{fontFamily:'Helvetica, Verdana, sans-serif'}}>Multi Part Bagging Process For &nbsp;</div>
//                             <div className='multipart_head text-center number-box border border_color_head ' style={{minWidth:'100px'}}>{data?.length}</div>
//                             <div className='multipart_head'>&nbsp;{data?.length > 1 ? 'Jobs' : 'Job'}</div>
//                         </div>
//                         <div className='d-flex  justify-content-around align-items-center py-2 flex-wrap border bg_color_container' style={{marginTop:'3%', minHeight:'30rem', width:'95%', paddingLeft:'1%', paddingRight:'1%'}}>
//                             <div style={{margin:'1rem', boxSizing:'border-box'}} className='bg-white text-black mx-0'>
//                                 <Box className="border rounded box_css_mlt d-flex flex-column border_color_head justify-content-between align-items-center m-0">
//                                     <div className='w-100 d-flex justify-content-center align-items-center py-2 border-bottom border_color_head'><Typography sx={{fontWeight:'bold'}}>METAL BAGS</Typography></div>
//                                         <div className='countBox'>{countObj?.metal}</div>
//                                         <JobDesc />
//                                     <div className='p-1 d-flex justify-content-center align-items-center pb-3'>
//                                         <button className="btn_white btn_w2 blue print_btn" disabled={countObj.metal < 1} onClick={() => handleButtonClick('metal')}>Print</button>
//                                     </div>
//                                 </Box>
//                             </div>
//                             <div style={{margin:'1rem', boxSizing:'border-box'}} className='bg-white text-black mx-0'>
//                                 <Box className="border rounded box_css_mlt d-flex flex-column border_color_head justify-content-between align-items-center m-0">
//                                     <div className='w-100 d-flex justify-content-center align-items-center py-2 border-bottom border_color_head'><Typography sx={{fontWeight:'bold'}}>DIAMOND BAGS</Typography></div>
//                                         <div className='countBox'>{countObj?.dia}</div>
//                                         <JobDesc />
//                                     <div className='p-1 d-flex justify-content-center align-items-center pb-3'>
//                                         <button className="btn_white btn_w2 blue print_btn" disabled={countObj.dia < 1} onClick={() => handleButtonClick('diamond')}>Print</button>
//                                     </div>
//                                 </Box>
//                             </div>
//                             <div style={{margin:'1rem', boxSizing:'border-box'}} className='bg-white text-black mx-0'>
//                                 <Box className="border rounded box_css_mlt d-flex flex-column border_color_head justify-content-between align-items-center m-0">
//                                     <div className='w-100 d-flex justify-content-center align-items-center py-2 border-bottom border_color_head'><Typography sx={{fontWeight:'bold'}}>COLORSTONE BAGS</Typography></div>
//                                     <div className='countBox'>{countObj?.cls}</div>
//                                     <JobDesc />
//                                     <div className='p-1 d-flex justify-content-center align-items-center pb-3'>
//                                     <button className="btn_white btn_w2 blue print_btn" disabled={countObj.cls < 1} onClick={() => handleButtonClick('colorstone')}>Print</button>
//                                     </div>
//                                 </Box>
//                             </div>
//                             <div style={{margin:'1rem', boxSizing:'border-box'}} className='bg-white mx-0'>
//                                 <Box className="border rounded box_css_mlt d-flex flex-column border_color_head justify-content-between align-items-center m-0">
//                                     <div className='w-100 d-flex justify-content-center align-items-center py-2 border-bottom border_color_head'><Typography sx={{fontWeight:'bold'}}>MISC BAGS</Typography></div>
//                                     <div className='countBox'>{countObj?.misc}</div>
//                                     <JobDesc />
//                                     <div className='p-1 d-flex justify-content-center align-items-center pb-3'>
//                                     <button className="btn_white btn_w2 blue print_btn" disabled={countObj.misc < 1} onClick={() => handleButtonClick('misc')}>Print</button>
//                                     </div>
//                                 </Box>
//                             </div>
//                             <div style={{margin:'1rem', boxSizing:'border-box'}} className='bg-white mx-0'>
//                                 <Box className="border rounded box_css_mlt d-flex flex-column border_color_head justify-content-between align-items-center m-0">
//                                     <div className='w-100 d-flex justify-content-center align-items-center py-2 border-bottom border_color_head'><Typography sx={{fontWeight:'bold'}}>FINDING BAGS</Typography></div>
//                                     <div className='countBox'>{countObj?.finding}</div>
//                                         <div>Jobs Are Ready To Print</div>
//                                     <div className='p-1 d-flex justify-content-center align-items-center pb-3'>
//                                         <button className="btn_white btn_w2 blue print_btn" disabled={countObj.finding < 1} onClick={() => handleButtonClick('finding')}>Print</button>
//                                     </div>
//                                 </Box>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div className='mainjobbagsticker showOnPrint'>
//             {Array.from({ length: queries?.pageStart }, (_, index) => (
//                     index > 0 && <div key={index} className="container  ml_5 mb_10"></div>
//                 ))}
//                 {
//                   filterData?.length > 0 && filterData?.map((e, index) => {
//                     return(
//                       <React.Fragment key={index}>
//                         {
//                           e?.additional?.pages?.length > 0 ? e?.additional?.pages?.map((e, i) => {
//                             return(
//                                 <>
//                               <div className='containerjbsbg' key={i}>
//                                 <div>
//                                         <div className=' fsjbsbg  py-1 d-flex align-items-center'>{title}</div>
//                                     { e?.data?.rd?.serialjobno?.length > 0 && <div className='fsjbsbg fw-bold'>{e?.data?.rd?.serialjobno}</div>}
//                                     { e?.data?.rd?.Designcode?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.Designcode}</div>}
//                                     { e?.data?.rd?.CustomerCode?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.CustomerCode}</div>}
//                                     { e?.data?.rd?.OrderNo?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.OrderNo}</div>}
//                                     { e?.data?.rd?.promiseDatef?.length > 0 && <div className='fsjbsbg fw-bold'>{e?.data?.rd?.promiseDatef}</div>}
//                                     { e?.data?.rd?.Size?.length > 0 && <div className='fsjbsbg'>Size: {e?.data?.rd?.Size}</div>}
//                                     { e?.data?.rd?.MetalType?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.MetalType?.split(" ")[1] + " " +e?.data?.rd?.MetalColorCo}</div>}
//                                     { e?.data?.rd?.MetalWeight > 0 && <div className='fsjbsbg'>{(+e?.data?.rd?.MetalWeight)?.toFixed(3)}gm</div>}
//                                     <div className='d-flex justify-content-start align-items-center'>
//                                         <QRCodeGenerator text={e?.data?.rd.serialjobno} />
//                                     </div>
//                                 </div>
//                                 <div className='text-break ins_multipart fw-bolder'>{e?.data?.rd?.ProductInstruction}</div>

//                               </div>
//                           </>
//                             )
//                           }) : 
//                           <>
//                           <div className='containerjbsbg'>
//                             <div>
//                                     <div className=' fsjbsbg  py-1 d-flex align-items-center'>{title}</div>
//                                 { e?.data?.rd?.serialjobno?.length > 0 && <div className='fsjbsbg fw-bold'>{e?.data?.rd?.serialjobno}</div>}
//                                 { e?.data?.rd?.Designcode?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.Designcode}</div>}
//                                 { e?.data?.rd?.CustomerCode?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.CustomerCode}</div>}
//                                 { e?.data?.rd?.OrderNo?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.OrderNo}</div>}
//                                 { e?.data?.rd?.promiseDatef?.length > 0 && <div className='fsjbsbg fw-bold'>{e?.data?.rd?.promiseDatef}</div>}
//                                 { e?.data?.rd?.Size?.length > 0 && <div className='fsjbsbg'>Size: {e?.data?.rd?.Size}</div>}
//                                 { e?.data?.rd?.MetalType?.length > 0 && <div className='fsjbsbg'>{e?.data?.rd?.MetalType?.split(" ")[1] +" " +e?.data?.rd?.MetalColorCo}</div>}
//                                 <div className='d-flex justify-content-start align-items-center'>
//                                     <QRCodeGenerator text={e?.data?.rd.serialjobno} />
//                                 </div>
//                             </div>
//                             <div ><label htmlFor="" className='ins_multipart text-break fw-bolder'>{(e?.data?.rd?.ProductInstruction)}</label></div>
//                           </div>
//                           </>
//                         }
//                       </React.Fragment>
//                     )
//                   })
//                 }
//             </div>
//       </React.Fragment>
//     }
// </div>
//   )
// }

// export default MultiPart


// // import React, { useEffect, useState } from 'react';
// // import { useLocation } from 'react-router-dom';
// // import queryString from 'query-string';
// // import "../../assets/css/bagprint/multipart.css";
// // // import "../../assets/css/bagprint/jobbagsticker.css";
// // import Loader from '../../components/Loader';
// // import QRCodeGenerator from '../../components/QRCodeGenerator';
// // import { GetUniquejob } from '../../GlobalFunctions/GetUniqueJob';
// // import { FetchDatas } from '../../GlobalFunctions/FetchDatas';
// // import { Box, Button, Typography } from "@mui/material";

// // const JobBagDetails = ({ jobData, title }) => (
// //   <div className='containerjbsbg'>
// //     <div className='fsjbsbg py-1 d-flex align-items-center'>{title}</div>
// //     {jobData?.data?.rd && (
// //       <>
// //         {Object.entries(jobData?.data?.rd).map(([key, value]) =>
// //           value && (
// //             <div className='fsjbsbg' key={key}>
// //               {key === 'MetalWeight' ? (+value).toFixed(3) + "gm" : value}
// //             </div>
// //           )
// //         )}
// //         <div className='d-flex justify-content-start align-items-center'>
// //           <QRCodeGenerator text={jobData?.data?.rd.serialjobno} />
// //         </div>
// //       </>
// //     )}
// //   </div>
// // );

// // const MultiPart = ({ queries, headers }) => {
// //   const location = useLocation();
// //   const queryParams = queryString.parse(location.search);
// //   const resultString = GetUniquejob(queryParams?.str_srjobno);
// //   const [data, setData] = useState([]);
// //   const [countObj, setCountObj] = useState({});
// //   const [filterData, setFilterData] = useState([]);
// //   const [title, setTitle] = useState('');

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         const abc = await FetchDatas(queryParams, resultString, queries, headers);
// //         const obj = {
// //           diamond: 0, colorStone: 0, misc: 0, finding: 0,
// //           diamondJobList: [], colorStoneList: [],
// //           miscJobList: [], findingJobList: [],
// //         };
// //         abc[0]?.allDatas?.rd1?.forEach((a) => {
// //           const typeId = a?.MasterManagement_DiamondStoneTypeid;
// //           if (typeId === 5) { obj.findingJobList.push(a); }
// //           else if (typeId === 7) { obj.miscJobList.push(a); }
// //           else if (typeId === 3) { obj.diamondJobList.push(a); }
// //           else if (typeId === 4) { obj.colorStoneList.push(a); }
// //         });
// //         obj.diamondJobList = [...new Set(obj.diamondJobList.map(d => d.SerialJobno))];
// //         obj.diamond = obj.diamondJobList.length;
// //         obj.colorStoneList = [...new Set(obj.colorStoneList.map(d => d.SerialJobno))];
// //         obj.colorStone = obj.colorStoneList.length;
// //         obj.miscJobList = [...new Set(obj.miscJobList.map(d => d.SerialJobno))];
// //         obj.misc = obj.miscJobList.length;
// //         obj.findingJobList = [...new Set(obj.findingJobList.map(d => d.SerialJobno))];
// //         obj.finding = obj.findingJobList.length;

// //         // setCountObj(obj);    
// //         setTimeout(() => {
// //             setCountObj(obj);
// //         },10)
// //         setData(abc.length > 0 ? abc : []);
// //       } catch (error) {
// //         console.error(error);
// //       }
// //     };
// //     fetchData();
// //   }, []);

// //   const handleButtonClick = (type) => {
// //     setTitle('');
// //     setFilterData([]);
// //     const types = {
// //       diamond: { list: 'diamondJobList', title: 'DIAMOND' },
// //       colorstone: { list: 'colorStoneList', title: 'COLORSTONE' },
// //       misc: { list: 'miscJobList', title: 'MISC' },
// //       finding: { list: 'findingJobList', title: 'FINDING' },
// //     };
// //     if (types[type]) {
// //         const finalArr = [];
// //        data?.forEach(e => { 
// //         countObj[types[type]?.list]?.forEach((a, i) => {
// //             if(a === e?.data?.rd?.serialjobno){
// //                 finalArr.push(e);
// //             }
// //         })
// //       });
// //       console.log(finalArr);
// //       setFilterData(finalArr);
// //       setTitle(types[type].title);
// //       if (-1 > 0) {
// //         setTimeout(() => window.print(), 500);
// //       }
// //     }
// //   };

// //   return (
// //     <div className='bg_color_mlt pb-5 mb-5'>
// //       {data.length === 0 ? <Loader /> : (
// //         <div className='hideOnPrint'>
// //           <div className='w-100 d-flex align-items-center justify-content-center'>
// //             <div className='d-flex flex-column justify-content-between align-items-center p-1 w-100'>
// //               <div className='d-flex align-items-center justify-content-center py-2'>
// //                 <div className='multipart_head' style={{ fontFamily: 'Helvetica, Verdana, sans-serif' }}>Multi Part Bagging Process For &nbsp;</div>
// //                 <div className='multipart_head text-center number-box border border_color_head' style={{ minWidth: '100px' }}>{data.length}</div>
// //                 <div className='multipart_head'>&nbsp;{data.length > 1 ? 'Jobs' : 'Job'}</div>
// //               </div>
// //               <div className='d-flex justify-content-around align-items-center py-2 flex-wrap border bg_color_container' style={{ marginTop: '3%', minHeight: '30rem', width: '80%', padding: '1%' }}>
// //                 {['diamond', 'colorStone', 'misc', 'finding'].map(type => (
// //                   <div key={type} style={{ margin: '1rem', boxSizing: 'border-box' }} className='bg-white text-black mx-0'>
// //                     <Box className="border rounded box_css_mlt d-flex flex-column border_color_head justify-content-between align-items-center m-0">
// //                       <div className='w-100 d-flex justify-content-center align-items-center py-2 border-bottom border_color_head'>
// //                         <Typography sx={{ fontWeight: 'bold' }}>{`${type.toUpperCase()} BAGS`}</Typography>
// //                       </div>
// //                       {console.log(countObj)}
// //                       <div className='countBox'>{countObj[type]}</div>
// //                       <div>Jobs Are Ready To Print</div>
// //                       <div className='p-1 d-flex justify-content-center align-items-center pb-3'>
// //                         <button className="btn_white btn_w2 blue print_btn" disabled={countObj[type] < 1} onClick={() => handleButtonClick(type)}>
// //                           Print
// //                         </button>
// //                       </div>
// //                     </Box>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //           <div className='mainjobbagsticker showOnPrint'>
// //             {Array?.from({ length: queries?.pageStart }, (_, index) => index > 0 && <div key={index} className="container ml_5 mb_10"></div>)}
// //             {filterData?.length > 0 && filterData?.map((e, index) => (
// //               <React.Fragment key={index}>
// //                 {e?.additional?.pages?.length > 0
// //                   ? e?.additional?.pages?.map((page, i) => <JobBagDetails key={i} jobData={page} title={title} />)
// //                   : <JobBagDetails jobData={e} title={title} />}
// //               </React.Fragment>
// //             ))}
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default MultiPart;
