import React, { useEffect } from "react";
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-community";
import "../css/ViewAttendance.css";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../api/apiCalls";

/**
 * LeaveBalanceChart component for displaying the user's leave balance using a donut chart.
 *
 * This component fetches the user's leave data and visualizes the consumed and available leave balances
 * for paid and unpaid leaves. It uses the AgCharts library to render the chart.
 *
 * @returns {JSX.Element} The rendered LeaveBalanceChart component.
 *
 * @typedef {Object} LeaveData
 * @property {string} type - The type of leave (e.g., "Paid Leaves", "Unpaid Leaves").
 * @property {number} consumed - The amount of leave consumed.
 * @property {number | string} available - The amount of leave available (can be a number or "∞" for unpaid leaves).
 * @property {number | string} total - The total amount of leave (can be a number or "∞" for unpaid leaves).
 *
 * @function handleFetchUser Data
 * Fetches user data from the API to retrieve leave balance information.
 *
 * @function getChartOptions
 * Generates the chart options for the AgCharts donut chart.
 * @returns {AgChartOptions} The options for the chart.
 */

interface LeaveData {
  type: string;
  consumed: number;
  available: number | string;
  total: number | string;
}

const LeaveBalanceChart: React.FC = () => {
  const userId = useSelector((state: RootState) => state.auth.id);

  useEffect(()=>{
      document.title="Leave Balance"
    },[])

  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => userApi.getById(userId),
    enabled: !!userId,
  });
  if (isLoading) {
    return (
      <div className="loading-indicator">Loading leave balance data...</div>
    );
  }
  if (isError || !userData) {
    return (
      <div className="error-message">
        Failed to load leave balance data. Please try again later.
      </div>
    );
  }

  const paidLeavesConsumed =
    userData?.leaveBalance !== undefined ? 20 - userData.leaveBalance : 0;
  const unpaidLeavesConsumed =
    userData?.unpaidLeaves !== undefined ? userData.unpaidLeaves : 0;

  const leaveData: LeaveData[] = [
    {
      type: "Paid Leaves",
      consumed: paidLeavesConsumed,
      available: userData?.leaveBalance ?? 0,
      total: 20,
    },
    {
      type: "Unpaid Leaves",
      consumed: unpaidLeavesConsumed,
      available: "∞",
      total: "∞",
    },
  ];

  const chartData = [
    { category: "Paid Leaves Used", value: paidLeavesConsumed },
    { category: "Unpaid Leaves Used", value: unpaidLeavesConsumed },
  ];

  const chartOptions: AgChartOptions = {
    data: chartData,
    title: {
      text: "My Leave Balance",
      fontSize: 18,
      fontWeight: "bold",
    },
    series: [
      {
        type: "donut",
        angleKey: "value",
        calloutLabelKey: "category",
        sectorLabelKey: "value",
        fills: ["#FF9800", "#4CAF50"],
        strokes: ["#F57C00", "#3e8e41"],
        strokeWidth: 2,
        cursor: "pointer",
        innerRadiusRatio: 0.6,
      },
    ],
    legend: {
      enabled: true,
      position: "bottom",
    },
  };

  return (
    <div className="leave-container">
      <div className="chart-and-stats-container">
        <div className="chart-container">
          <AgCharts
            options={chartOptions}
            style={{ height: "400px", width: "100%" }}
          />
        </div>
        <div className="leave-stats">
          {leaveData.map((item, index) => (
            <div key={index} className="leave-card">
              <h3 className="leave-card-title">{item.type}</h3>
              <div className="leave-metric">
                <div className="leave-label">
                  <div
                    className={`color-indicator ${
                      index === 0 ? "color-paid" : "color-unpaid"
                    }`}
                  ></div>
                  <span>Consumed</span>
                </div>
                <span className="leave-value">{item.consumed}</span>
              </div>
              <div className="leave-metric">
                <span>Available</span>
                <span
                  className={`leave-value ${
                    item.available === "∞" ? "leave-value-infinity" : ""
                  }`}
                >
                  {item.available}
                </span>
              </div>
              <div className="leave-metric">
                <span>Total</span>
                <span
                  className={`leave-value ${
                    item.total === "∞" ? "leave-value-infinity" : ""
                  }`}
                >
                  {item.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaveBalanceChart;
