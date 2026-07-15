import React, { useEffect, Suspense, useState } from "react";
import { useLocation } from "react-router-dom";
import AllDesignPrint from "./AllDesignPrint";
import AllDesignBagPrint2 from "./AllDesignBagPrint2";
import AllGrids from "./AllGrids";
// import AllDesignBagPrint from './AllDeisgnBagPrint';
import ErrorPage from "./error/ErrorPage";
import Loader from "../components/Loader";
import  QcReport  from "./qcreport/QcReport";
import MRPBill from "./MRPBill/MRPBill";
import AllMaterialWisePrint from "./AllMaterialWisePrint";
import Dashboard from "./dashboard/Dashboard";
import TitanWip from "./MyReports/TitanWip/TitanWip";
import TrainingGridHome from "./TrainingGrid/TrainingGridHome";
import AllMaterialSaleReturn from "./AllMaterialSaleReturn";
import BranchSearchRoot from "./branchSearch/BranchSearchRoot";

const AllDesign = () => {
  
  const location = useLocation();

  // const queryParams = new URLSearchParams(location.search);
  const [loadedComponent, setLoadedComponent] = useState(null);

//   const queryParams = useQueryParams();
//   const pid= queryParams.get("pid");
// console.log("pid",pid);


  // const openProject = (searchUrl) => {
  //   if (searchUrl?.includes("pnm")) {
  //     return <AllDesignPrint />;
  //   } else if (searchUrl?.includes("printname")) {
  //     return <AllDesignBagPrint2 />;
  //   } else if (searchUrl?.includes("matsale")) {
  //     return <AllMaterialWisePrint />;
  //   } else if (searchUrl?.includes("pid=18126")) {
  //     return <MRPBill />;
  //   } else if (searchUrl?.includes("pid=18145") || searchUrl?.includes("pid=18146") || searchUrl?.includes("pid=18147") || searchUrl?.includes("pid=18170") || searchUrl?.includes("pid=18171")){
  //     return <Dashboard />;
  //   } else if (searchUrl?.includes("pid=18149")){
  //     return <TitanWip />;
  //   } else if (searchUrl?.includes("pid=18152")){
  //     return <TrainingGridHome />;
  //   } else if (searchUrl?.includes("pid=18160")){
  //     return <QcReport />;
  //   } else {
  //     return <ErrorPage />;
  //   }
  // };

  const openProject = (searchUrl) => {
    
   
    
    const mappings = [
      { key: "pnm", component: <AllDesignPrint /> },
      { key: "printname", component: <AllDesignBagPrint2 /> },
      { key: "matsale", component: <AllMaterialWisePrint /> },
      { key: "matreturn", component: <AllMaterialSaleReturn /> },
      { key: "pid=18126", component: <MRPBill /> },
      { key: ["pid=18145", "pid=18146", "pid=18147", "pid=18170", "pid=18171"], component: <Dashboard /> },
      { key: "pid=18152", component: <TrainingGridHome /> },
      { key: "pid=18200", component: <BranchSearchRoot /> },
      { key: "pid=18149", component: <TitanWip /> },
      { key: "pid=18160", component: <QcReport /> },
    ];
  
    for (const { key, component } of mappings) {
      if (Array.isArray(key)) {
        if (key?.some((k) => searchUrl?.includes(k))) return component;
      } else if (searchUrl?.includes(key)) {
        return component;
      }
    }
  
    return <ErrorPage />;

  };
  

  useEffect(() => {
    const component = openProject(location?.search);
    setLoadedComponent(component);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense fallback={<Loader />}>
      {loadedComponent}
    </Suspense>
  );
};

export default AllDesign;
