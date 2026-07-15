import { GetData } from "./GetData";
import { organizeData } from "./OrganizeBagPrintData";

export const FetchDatas = async (queryParams, resultString, queries, headers) => {
    try {
        const responseData = [];
            const objs = {
                jobno: resultString,
                custid: queries.custid,
                printname: queries.printname,
                appuserid: queries.appuserid,
                url: queries.url,
                headers: headers,
              };
              let allDatas = await GetData(objs);
              let datas = organizeData(allDatas?.rd, allDatas?.rd1);
              // eslint-disable-next-line array-callback-return
              datas?.map((a) => {

                let length = 0;
                let clr = {
                    clrPcs: 0,
                    clrWt: 0
                };
                let dia = {
                    diaPcs: 0,
                    diaWt: 0
                };
                let fin = {
                    finPcs: 0,
                    finWt: 0
                };
                let misc = {
                    miscWt: 0
                };
                let DiamondList = [];
                let ColorStoneList = [];
                // eslint-disable-next-line array-callback-return
                a?.rd1?.map((e, i) => {
                    if (e?.ConcatedFullShapeQualityColorCode !== "- - - ") {
                        length++;
                    }
                    if (e?.MasterManagement_DiamondStoneTypeid === 3) {
                        dia.diaPcs = dia.diaPcs + e?.ActualPcs;
                        dia.diaWt = dia.diaWt + e?.ActualWeight;
                    } else if (e?.MasterManagement_DiamondStoneTypeid === 4) {
                        clr.clrPcs = clr.clrPcs + e?.ActualPcs;
                        clr.clrWt = clr.clrWt + e?.ActualWeight;

                    } else if (e?.MasterManagement_DiamondStoneTypeid === 5) {
                        fin.finPcs = fin.finPcs + e?.ActualPcs;
                        fin.finWt = fin.finWt + e?.ActualWeight;
                    } else if (e?.MasterManagement_DiamondStoneTypeid === 7) {
                        misc.miscWt = misc.miscWt + e?.ActualWeight;
                    }
                    if (e?.MasterManagement_DiamondStoneTypeid === 3) {
                        DiamondList.push(e);
                    } else if (e?.MasterManagement_DiamondStoneTypeid === 4) {
                        ColorStoneList.push(e);
                    } else {
                        return '';
                    }
                });
                let imagePath = queryParams?.imagepath;
                imagePath = atob(queryParams?.imagepath);
                
                let img = imagePath + a?.rd?.ThumbImagePath;
                responseData.push({ data: a, additional: { length: length, clr: clr, dia: dia, img: img, misc: misc, fin: fin }, allDatas:allDatas });
              })
              return responseData;
    } catch (error) {
        console.log(error);
    }
}