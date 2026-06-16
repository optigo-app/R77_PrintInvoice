import axios from "axios";

export const GetData = async (job) => {
    
    try {

        let p_tag = { "SerialJobno": `${job?.jobno}`, "customerid": `${job?.custid}`, "BagPrintName": `${job?.printname}` };

        let jsonString = JSON.stringify(p_tag);

        let base64String = btoa(jsonString);

        let Body = {
            "con": `{\"id\":\"\",\"mode\":\"${job?.printname}\",\"appuserid\":\"${job?.appuserid}\"}`,
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
        // if(response?.data)
        // let newArr = [];
        // let jobss = [];
        // let jobs = job.jobno.split(",");
        // jobs.forEach(element => {
        //     jobss.push( element.replace(/'/g, ''));
        // });
        // datas?.rd?.forEach((ele, ind) => {
        //     let findObj = datas?.rd?.findIndex(ele=>ele?.rd?.serialjobno ==jobss[ind]);
        //     if(findObj !== 1){
        //         newArr.push(datas?.rd[findObj]);
        //     }
        // });
        
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

          
        const rd2 = (datas?.rd2)?.sort((a, b) => {
            const numA = parseInt(a?.SerialJobno?.split('/')[1], 10);
            const numB = parseInt(b?.SerialJobno?.split('/')[1], 10);
            // Compare the numeric values
            return numA - numB;
          });

        const obj = {
            rd:rd,
            rd1:rd1,
            rd2:rd2,
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