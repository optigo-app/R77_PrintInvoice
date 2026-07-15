import axios from "axios";
 

 

export const GetStock = async (queries ) => {
  const header = {
    YearCode:  queries?.YearCode,
    version:    queries?.version,
    sv:    queries?.report_sv,
    sp: queries?.spno,
  };
  
  const body ={
      "con": "{\"id\": \"\", \"mode\": \"StockBook\", \"appuserid\": \""+queries?.appuserid+"\"}",
      "p": "{\"stock_id\": \""+queries?.stock_id+"\"}",
      "f": "DynamicReport ( get sp list )"
    }
     
  try {
    const response = await axios.post( queries?.url, body, { headers: header });
    
    console.log("TCL: GetWipData -> ", response)
    return response?.data;
  } catch (error) {
    console.error("error is..", error);
  }
};

export default GetStock;
