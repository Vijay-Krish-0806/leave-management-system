import React, { useEffect, useState } from "react";
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-community";
import "../css/ViewAttendance.css";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../api/apiCalls";
import { LEAVE_BALANCE } from "../../constants";
import UserCard from "../UserCard";
import axios from "axios";

interface LeaveData {
  type: string;
  consumed: number;
  available: number | string;
  total: number | string;
}

/**
 * @description
 *  LeaveBalanceChart component for displaying the user's leave balance using a donut chart.
 *
 * This component fetches the user's leave data and visualizes the consumed and available leave balances
 * for paid and unpaid leaves. It uses the AgCharts library to render the chart.
 * @returns {JSX.Element}
 */
const LeaveBalanceChart: React.FC = () => {
  const userId = useSelector((state: RootState) => state.auth.id);
  const [managerName, setManagerName] = useState("");

  useEffect(() => {
    document.title = "Leave Balance";
  }, []);

  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => userApi.getById(userId),
    enabled: !!userId,
  });

  /**
   * @description to get the manager name based on manager ID
   * @returns {Promise<void>}
   */
  const getManagerName = async (): Promise<void> => {
    if (userData && userData.managerId) {
      try {
        const res = await axios.get(
          `http://localhost:3001/users/${userData.managerId}`
        );
        setManagerName(res.data.username);
      } catch (e) {
        console.error("Error fetching manager:", e);
      }
    }
  };

  useEffect(() => {
    if (userData && userData.managerId) {
      getManagerName();
    }
  }, [userData]);

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
    userData?.leaveBalance !== undefined
      ? LEAVE_BALANCE - userData.leaveBalance
      : 0;
  const unpaidLeavesConsumed =
    userData?.unpaidLeaves !== undefined ? userData.unpaidLeaves : 0;

  const leaveData: LeaveData[] = [
    {
      type: "Paid Leaves",
      consumed: paidLeavesConsumed,
      available: userData?.leaveBalance ?? 0,
      total: LEAVE_BALANCE,
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
      <div className="three-column-container">
        <div className="user-card-column">
          <UserCard
            username={userData?.username}
            email={userData?.email}
            role={userData?.role}
            department={userData?.department}
            managerName={managerName}
            
          />
        </div>

        <div className="chart-column card-base">
          <AgCharts
            options={chartOptions}
            style={{ height: "375px", width: "100%" }}
          />
        </div>
        <div className="leave-stats-column">
          {leaveData.map((item, index) => (
            <div key={index} className="leave-card card-base">
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
