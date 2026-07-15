import React, { Suspense, useEffect, useState } from "react";
import Loader from "../../components/Loader";
import {
  apiCall,
  checkMsg,
  isObjectEmpty,
} from "../../GlobalFunctions";

const RepairPrint = ({ token, invoiceNo, printName, urls, evn, ApiVer }) => {
  const [importedComponent, setImportedComponent] = useState(null);
  const [loader, setLoader] = useState(true);
  const [msg, setMsg] = useState("");
  const [evns, setEvns] = useState(atob(evn).toLowerCase());

  
  const importComponent = async (printData, data) => {
    try {
      const module = await import(`../prints/eventWisePrints/${printData?.evname}`);
      const AnotherComponent = module.default;
      
 
      return <AnotherComponent data={data} />;
    } catch (error) {
      console.log(error);
    }
  };

  const evnComponent = async (data) => {
    let module = await import(`../../GlobalFunctions/PrintImports`);
    
    let conditions = module.alterationArray;
    let findPrint = conditions.find((e) => evns === e?.label);
    
    // console.log("TCL: evnComponent -> ", findPrint)
    if (findPrint) {
      const component = await importComponent(findPrint, data);
      setImportedComponent(component);
    }
  };

  useEffect(() => {
    const sendData = async () => {
      try {
        const data = await apiCall(token, invoiceNo, printName, urls, evn, ApiVer);
        if (data?.Status === "200") {
          let isEmpty = isObjectEmpty(data?.Data);
          if (!isEmpty) {
            evnComponent(data?.Data);
            setLoader(false);
          } else {
            setLoader(false);
            setMsg("Data Not Found");
          }
        } else {
          setLoader(false);
          // setMsg(data?.Message);
          const err = checkMsg(data?.Message);
                    console.log(data?.Message);
                    setMsg(err);
        }
      } catch (error) {
        console.error(error);
      }
    };
    sendData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return loader ? (
    <Loader />
  ) : msg === "" ? (
    <>
      <Suspense fallback={<Loader />}>{importedComponent}</Suspense>
    </>
  ) : (
    <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
      {msg} 
    </p>
  );
};

export default RepairPrint;
