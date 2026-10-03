import axios from "axios";

// Helper function to safely decode standard and URL-safe Base64 strings
 

export const GetAlbumData = async (queries,mode) => {
    console.log("TCL: GetAlbumData -> ", queries);
    
    const header = {
      YearCode: queries?.YearCode,
      version: queries?.version,
      sv: queries?.report_sv,
      sp: queries?.spno,
    };

    const body = {
        con: JSON.stringify({
          id: "",
          mode: mode,
          y: queries?.YearCode,
          appuserid: queries?.appuserid,
          FormName: "Design Report",
          version: queries?.version,
        }),
        p: JSON.stringify({
          WhereClause1: queries?.WhereClause1, // Using the safe decoder here
          DP_OrderBy1: queries?.DP_OrderBy1,
          DP_PageSize1: queries?.DP_PageSize1,
          DP_CurrentPage1: queries?.DP_CurrentPage1,
        }),
        f: "DesignPrint"
      };
 
  try {
    const response = await axios.post(queries?.apiurl, body, { headers: header });
    
    
    return response?.data?.Data
  } catch (error) {
    console.error("error is..", error);
  }
};

export default GetAlbumData;