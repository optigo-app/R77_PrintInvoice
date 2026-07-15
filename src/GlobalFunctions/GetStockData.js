import axios from "axios";

export const GetStockData = async (job) => {
    
    try {

        let p_tag = { "rfbag": `${job?.rfbag}` };

        let jsonString = JSON.stringify(p_tag);

        let base64String = btoa(jsonString);

        let Body = {
            "con": `{\"id\":\"\",\"mode\":\"getinventorystock\",\"appuserid\":\"${job?.appuserid}\"}`,
            "p": `${ job?.printname === 'searchmaterial' ? base64String : base64String}`,
            "f": `${job?.appuserid} ${job?.printname}`
        };

        let urls = atob(job?.url);
        
        const response = await axios.post(urls, Body, { headers: job?.headers });
        let datas = JSON?.parse(response?.data?.d);
        let responseMsg = '';
        if(datas?.rd[0]?.stat_msg?.includes('Contact your Admin')){
            responseMsg = 'Contact Your Admin';
        }
        if(datas?.rd?.length === 0){
            responseMsg = 'Data Not Present';
        }
        
        
        const rd = (datas?.rd)?.sort((a, b) => {
            const numA = parseInt(a?.serialjobno?.split('/')[1], 10);
            const numB = parseInt(b?.serialjobno?.split('/')[1], 10);
            // Compare the numeric values
            return numA - numB;
          });

        const rd1 = (datas?.rd1)?.sort((a, b) => {
            const numA = parseInt(a?.SerialJobno?.split('/')[1], 10);
            const numB = parseInt(b?.SerialJobno?.split('/')[1], 10);
            // Compare the numeric values
            return numA - numB;
          });

        const obj = {
            rd:rd,
            rd1:rd1,
            msg:responseMsg
        }
        
        return obj;
        // return datas;
    } catch (error) {
        let msg = '';
        if(error?.response?.status === 500){
            msg = error?.response?.statusText;
        }
        const obj = {
            rd:[],
            rd1:undefined,
            msg: msg
        }
        return obj
    }
};