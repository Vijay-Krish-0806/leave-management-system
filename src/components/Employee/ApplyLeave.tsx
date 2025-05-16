import React, { useState, useMemo, useEffect } from "react";
import DatePicker from "react-datepicker";
import {
  isWeekend,
  eachDayOfInterval,
  format,
  areIntervalsOverlapping,
} from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import "../css/ApplyLeave.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../app/store";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { setUser } from "../../features/auth/authSlice";
import { toast } from "react-toastify";
import { LeaveApplication } from "../../types";
import LeaveHistory from "./LeaveHistory";

const LeaveManagement: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [managerNames, setManagerNames] = useState<string[]>([]);

  // Form state
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;
  const [leaveType, setLeaveType] = useState<string>("");
  const [leaveReason, setLeaveReason] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editLeaveId, setEditLeaveId] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState({
    dateRange: false,
    leaveType: false,
    leaveReason: false,
    isLeaveOverlapping: false,
  });

  const { data: userLeaves, isLoading } = useQuery({
    queryKey: ["leave-applications"],
    queryFn: getLeaveApplications,
  });

  async function getLeaveApplications() {
    const response = await axios.get(
      `http://localhost:3001/leaveApplications/?employeeId=${auth.id}&_sort=createdAt&_order=desc`
    );
    return response.data as LeaveApplication[];
  }

  const [managerId, setManagerId] = useState();

  useEffect(() => {
    if (!auth.id) {
      return;
    }
    axios
      .get(`http://localhost:3001/users/${auth.id}`)
      .then((res) => setManagerId(res.data.managerId))
      .catch((e) => console.error("Error fetching user", e));
  }, []);

  useEffect(() => {
    if (!auth) return;

    const fetchManagerNames = async () => {
      try {
        const promises = (userLeaves || [])
          ?.filter((leave) => leave.approvedBy !== null)
          .map((application) =>
            axios.get(`http://localhost:3001/users/${application.approvedBy}`)
          );

        const responses = await Promise.all(promises);
        const names = responses.map((res) => res.data.username);
        setManagerNames(names);
      } catch (error) {
        console.error("Error");
      }
    };

    fetchManagerNames();
  }, [auth, userLeaves, managerId]);

  const businessDaysCount = useMemo(() => {
    if (!startDate) return 0;
    const realEnd = endDate || startDate;
    const allDays = eachDayOfInterval({ start: startDate, end: realEnd });
    return allDays.filter((d) => !isWeekend(d)).length;
  }, [startDate, endDate]);

  const handleChange = (update: [Date | null, Date | null]) => {
    setDateRange(update);
    if (errors.dateRange) setErrors((prev) => ({ ...prev, dateRange: false }));
  };

  const resetForm = () => {
    setDateRange([null, null]);
    setLeaveType("");
    setLeaveReason("");
    setIsEditing(false);
    setEditLeaveId(null);
  };

  const checkIsLeaveOverlapping = () => {
    const overlappingLeaves = userLeaves?.filter((leave) =>
      areIntervalsOverlapping(
        { start: new Date(leave.startDate), end: new Date(leave.endDate) },
        { start: new Date(startDate as Date), end: new Date(endDate as Date) },
        { inclusive: true }
      )
    );
    return overlappingLeaves && overlappingLeaves.length > 0;
  };
  // Only require startDate now
  const validateForm = () => {
    const newErrors = {
      dateRange: !startDate || !endDate,
      leaveType: !leaveType,
      leaveReason: !leaveReason.trim(),
      isLeaveOverlapping: checkIsLeaveOverlapping() as boolean,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleEditLeave = (leave: LeaveApplication) => {
    if (!["pending", "approved"].includes(leave.status)) {
      toast.error("Only pending leave requests can be edited.");
      return;
    }
    setIsEditing(true);
    setEditLeaveId(leave.id);
    setLeaveType(leave.type);
    setLeaveReason(leave.reason);
    setDateRange([new Date(leave.startDate), new Date(leave.endDate)]);
  };

  const handleSubmitLeave = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const id = isEditing ? editLeaveId! : Date.now().toString();
      const createdAt = isEditing
        ? userLeaves?.find((l) => l.id === editLeaveId)?.createdAt ||
          new Date().toISOString()
        : new Date().toISOString();

      const leaveApplication = {
        id,
        employeeId: auth.id,
        startDate: startDate!.toISOString(),
        endDate: endDate!.toISOString(),
        type: leaveType,
        status: "pending",
        requestedBy: `${auth.username} (${auth.email})`,
        approvedBy: null,
        currentManager: auth.managerId,
        reason: leaveReason,
        createdAt,
      };

      let updatedLeaveBalance = auth.leaveBalance;
      let updatedUnpaid = auth.unpaidLeaves;
      if (!isEditing) {
        const days = businessDaysCount;
        if (leaveType === "paid") {
          if (days > auth.leaveBalance) {
            toast.error("Insufficient paid leave balance");
            return;
          }
          updatedLeaveBalance -= days;
        } else {
          updatedUnpaid += days;
        }
        dispatch(
          setUser({
            ...auth,
            leaveBalance: updatedLeaveBalance,
            unpaidLeaves: updatedUnpaid,
          })
        );
        await axios.post(
          "http://localhost:3001/leaveApplications",
          leaveApplication
        );
        await axios.patch(`http://localhost:3001/users/${auth.id}`, {
          leaveBalance: updatedLeaveBalance,
          unpaidLeaves: updatedUnpaid,
        });
        toast.success("Leave application submitted successfully!");
      } else {
        await axios.put(
          `http://localhost:3001/leaveApplications/${editLeaveId}`,
          leaveApplication
        );
        toast.success("Leave application updated successfully!");
      }

      await queryClient.invalidateQueries({ queryKey: ["leave-applications"] });
      resetForm();
    } catch (e) {
      console.error(e);
      toast.error(
        "An error occurred while submitting your leave application. Please try again."
      );
    }
  };

  return (
    <div className="leave-management-container">
      <div className="leave-application">
        <h2>{isEditing ? "Edit Leave Application" : "Apply for Leave"}</h2>

        {/* Date Range */}
        <div className="form-group">
          <label>Select Date Range</label>
          <div
            className={`date-picker-container ${
              errors.dateRange ? "error" : ""
            }`}
          >
            <DatePicker
              selectsRange
              minDate={new Date()}
              startDate={startDate}
              endDate={endDate}
              onChange={handleChange}
              isClearable
              placeholderText="Click to select a date range"
              filterDate={(d) => !isWeekend(d)}
              className="date-picker-input"
            />
            {errors.dateRange && (
              <span className="error-message">Start date is required</span>
            )}
            {errors.isLeaveOverlapping && (
              <span className="error-message">
                Cannot apply leave, leave exists
              </span>
            )}
          </div>
        </div>

        {/* Leave Type */}
        <div className="form-group">
          <label htmlFor="leave-type">Select Leave Type</label>
          <div
            className={`select-container ${errors.leaveType ? "error" : ""}`}
          >
            <select
              id="leave-type"
              value={leaveType}
              onChange={(e) => {
                setLeaveType(e.target.value);
                if (errors.leaveType)
                  setErrors((prev) => ({ ...prev, leaveType: false }));
              }}
            >
              <option value="">Select leave type</option>
              <option value="unpaid">Unpaid leaves – infinite days</option>
              <option value="bereavement">Bereavement Leave</option>
              {auth.gender === "male" ? (
                <option value="paternity">Paternity Leave – 5 days</option>
              ) : (
                <option value="maternity">Maternity Leave – 182 days</option>
              )}
              <option value="paid">
                Paid leave – {auth.leaveBalance} days available
              </option>
            </select>
            {errors.leaveType && (
              <span className="error-message">Leave type is required</span>
            )}
          </div>
        </div>

        {/* Reason */}
        <div className="form-group">
          <label htmlFor="reason">Reason</label>
          <div
            className={`input-container ${errors.leaveReason ? "error" : ""}`}
          >
            <input
              type="text"
              id="reason"
              value={leaveReason}
              onChange={(e) => {
                setLeaveReason(e.target.value);
                if (errors.leaveReason)
                  setErrors((prev) => ({ ...prev, leaveReason: false }));
              }}
            />
            {errors.leaveReason && (
              <span className="error-message">Leave reason is required</span>
            )}
          </div>
        </div>

        {/* Summary */}
        {startDate && endDate && (
          <div className="leave-summary">
            <h3>Leave Summary</h3>
            <div className="leave-details">
              <div className="leave-detail">
                <span className="detail-label">From:</span>
                <span className="detail-value">{format(startDate, "PPP")}</span>
              </div>
              <div className="leave-detail">
                <span className="detail-label">To:</span>
                <span className="detail-value">
                  {format(endDate || startDate, "PPP")}
                </span>
              </div>
              <div className="leave-detail total-days">
                <span className="detail-label">Total weekdays:</span>
                <span className="detail-value">{businessDaysCount}</span>
              </div>
            </div>
            <div className="action-buttons">
              <button className="submit-button" onClick={handleSubmitLeave}>
                {isEditing ? "Update Leave Request" : "Request Leave"}
              </button>
              {isEditing && (
                <button className="cancel-edit-button" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <LeaveHistory
        leaves={userLeaves}
        isLoading={isLoading}
        managerNames={managerNames}
        onEditLeave={handleEditLeave}
      />
    </div>
  );
};

export default LeaveManagement;
