import { Fragment } from "react";

import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";

import OrderStatisticsChart from "./OrderStatisticChart";
import "./DashBoardContainerStyle.scss"

const DashboardContainer = () => {
  return (
    <Fragment>
      <div className="dashboard-container">
        
        
        <div className="content-wrapper">
          {/* Main Dashboard Grid */}
          <div className="dashboard-grid">
            <OrderStatisticsChart />
         
            
            {/* Additional dashboard cards can be added here */}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

// javascript:void(0)

export default DashboardContainer;
