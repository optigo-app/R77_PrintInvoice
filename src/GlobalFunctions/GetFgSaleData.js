import axios from "axios";

export const GetFgSaleData = async (queries,body ) => {

    
    console.log("TCL: GetFgSaleData ->queries ", queries)

    const header = {
      YearCode:  queries?.YearCode,
      version:    queries?.version,
      sv:    queries?.report_sv,
      sp: queries?.spno,
    };
  
  try {
    const response = await axios.post( queries?.url, body, { headers: header });
    
 
    return response?.data;

  } catch (error) {
    console.error("error is..", error);
  }
};

export default GetFgSaleData;