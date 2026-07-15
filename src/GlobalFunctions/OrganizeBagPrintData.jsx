import { formatDate } from "./DateFormat";
import { extractWords } from "./GetChunkData";

export const organizeData = (rd, rd1,rd2=[]) => {

 
    let newArr = [];

    rd?.forEach((e, i) => {
      let obj = {};
      obj.rd = { ...e };
      obj.rd.orderDatef = formatDate(obj?.rd?.OrderDate);
      obj.rd.promiseDatef = formatDate(obj?.rd?.promisedate);
      obj.rd.productInfoSeparate = extractWords(obj?.rd?.productinfo)
      let arrs = rd1?.filter((ele) => ele?.SerialJobno === e?.serialjobno);
      let arrs2 = rd2?.filter((ele) => ele?.serialjobno.startsWith(e?.serialjobno));
      obj.rd1 = arrs;
      obj.rd2 = arrs2;
      newArr?.push(obj);
    });
    return newArr;
  };


