import queryString from "query-string";
import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
// import EngageMat from './bagPrints/jobBagStickers/EngageMat';

const AllDesignBagPrint2 = () => {
  const location = useLocation();
  const [importedComponent, setImportedComponent] = useState(null);
  const queryParams = queryString?.parse(location.search);
  const printName = queryParams?.printname?.toLowerCase();
  
  console.log("TCL: printName", printName)
 
  const queries = {
    YearCode: queryParams.YearCode,
    appuserid: queryParams.appuserid,
    custid: queryParams.custid,
    ifid: queryParams.ifid,
    pid: queryParams.pid,
    printname: queryParams.printname,
    version: queryParams.version,
    url: queryParams.report_api_url,
    pageStart: +queryParams.start_page,
    report_sv: queryParams?.report_sv,
    rfbag: queryParams?.rfbag,
    spno: queryParams?.spno,
    wip_id: queryParams?.wip_id,
  };
  const headers = {
    "Content-Type": "application/json",
    Authorization: "",
    YearCode: queries.YearCode,
    version: queries.version,
    sv: +queries?.report_sv
  };
  const ImportComponent = async (name) => {
    try {

      
      const module = await import(`./bagPrints/${name}`);
      const AnotherComponent = module?.default;
  
      return <AnotherComponent queries={queries} headers={headers} />;
    } catch (error) {
      console.log(error);
    }
  };

  const takeBagPrints = async () => {
    let module = await import("../GlobalFunctions/BagPrintImport");
    let conditions = module?.bagPrintConditions;
       
      
    let findBagPrint = conditions?.find((e) => e?.printName === printName);
    
    if (findBagPrint) {
      const component = await ImportComponent(findBagPrint?.componentName);
    
      setImportedComponent(component);
    }
  };
  useEffect(() => {
    takeBagPrints();
  }, []);
  return <div>{importedComponent}</div>;
};

export default AllDesignBagPrint2;
