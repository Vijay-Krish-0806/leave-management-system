import React, { useState, useMemo, useEffect } from "react";
import DatePicker from "react-datepicker";
import {
  isWeekend,
  eachDayOfInterval,
  format,
  areIntervalsOverlapping,
  isEqual,
} from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../app/store";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { setUser } from "../../features/auth/authSlice";
import { toast } from "react-toastify";
import { LeaveApplication } from "../../types";
import LeaveHistory from "./LeaveHistory";
import { HOLIDAYS, LEAVE_BALANCE } from "../../constants";
import { combinedOperations, leaveApi, userApi } from "../../api/apiCalls";
import { FaPlus } from "react-icons/fa6";
import "../css/ApplyLeave.css";

/**
 * @description LeaveManagement component for handling leave applications.
 *
 * This component allows users to apply for leave, edit existing leave requests,
 * and view their leave history. It includes a date picker for selecting leave dates,
 * a dropdown for selecting leave types, and a text input for providing a reason for the leave.
 * @returns {JSX.Element}
 */
const LeaveManagement: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [managerNames, setManagerNames] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;
  const [leaves, setLeaves] = useState<
    {
      startDate: string;
      endDate: string;
    }[]
  >([]);
  const [leaveType, setLeaveType] = useState<string>("");
  const [leaveReason, setLeaveReason] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editLeaveId, setEditLeaveId] = useState<string | null>(null);
  const [managerId, setManagerId] = useState<string>();
  // Store original leave data for comparison when editing
  const [originalLeave, setOriginalLeave] = useState<LeaveApplication | null>(
    null
  );
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  // Validation errors
  const [errors, setErrors] = useState({
    dateRange: false,
    leaveType: false,
    leaveReason: false,
    isLeaveOverlapping: false,
  });
  //API calls
  const { data: userLeaves, isLoading } = useQuery({
    queryKey: ["leave-applications"],
    queryFn: () => leaveApi.getByEmployeeId(auth.id),
  });

  const { data: user } = useQuery({
    queryKey: ["users", auth.id],
    queryFn: () => userApi.getById(auth.id),
    enabled: !!auth.id,
  });

  useEffect(() => {
    document.title = "Apply Leave";
  }, []);

  useEffect(() => {
    if (!auth.id) {
      return;
    }
    if (user) {
      setManagerId(user.managerId);
    }
  }, [user]);

  useEffect(() => {
    if (!auth) return;
    /**
     * @description uses to fetch manager names
     * @returns {void}
     */
    const fetchManagerNames = async (): Promise<void> => {
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

  useEffect(() => {
    setLeaves(
      (userLeaves || [])
        .filter((leave) => leave.status === "approved")
        .map(({ startDate, endDate }) => ({
          startDate,
          endDate,
        }))
    );
  }, [userLeaves]);

  const leaveDates: Date[] = leaves.flatMap(({ startDate, endDate }) => {
    const start = startDate;
    const end = endDate;
    return eachDayOfInterval({ start, end });
  });

  //used to highlight the HOLIDAYS and approved leaves in calendar
  const highlightWithRanges = [
    { "react-datepicker__day--highlighted-holiday": HOLIDAYS },
    { "react-datepicker__day--highlighted-leave": leaveDates },
  ];

  //to count total working days excluding weekends
  const totalWorkingDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    return allDays.filter(
      (d) => !isWeekend(d) && !HOLIDAYS.includes(d.toISOString().split("T")[0])
    ).length;
  }, [startDate, endDate]);

  /**
    * @description to hande Date ranges
    * @param {[
            Date | null,
            Date | null
        ]} update
    * @returns {void}
    */
  const handleChange = (update: [Date | null, Date | null]): void => {
    setDateRange(update);
    if (errors.dateRange) setErrors((prev) => ({ ...prev, dateRange: false }));
  };

  /**
   * @description reset the form after submitting
   * @returns {void}
   */
  const resetForm = (): void => {
    setDateRange([null, null]);
    setLeaveType("");
    setLeaveReason("");
    setIsEditing(false);
    setEditLeaveId(null);
    setOriginalLeave(null);
    setIsPopupOpen(false);
  };
  /**
   * @description to set popup open to true
   * @returns {void}
   */
  const openPopup = (): void => {
    setIsPopupOpen(true);
  };
  /**
   * @description to set errors to false when popup is closed
   * @returns {void}
   */
  const closePopup = (): void => {
    resetForm();
    setErrors({
      dateRange: false,
      leaveType: false,
      leaveReason: false,
      isLeaveOverlapping: false,
    });
  };

  /**
   * @description to check whether current applied leave is already existed (range)
   * @returns {boolean}
   */
  const checkIsLeaveOverlapping = (): boolean => {
    if (isEditing && originalLeave) {
      const originalStartDate = new Date(originalLeave.startDate);
      const originalEndDate = new Date(originalLeave.endDate);
      if (
        startDate &&
        endDate &&
        isEqual(originalStartDate, startDate) &&
        isEqual(originalEndDate, endDate)
      ) {
        return false;
      }
    }
    const overlappingLeaves = userLeaves?.filter((leave) => {
      if (isEditing && leave.id === editLeaveId) return false;
      return (
        (leave.status === "approved" || leave.status === "pending") &&
        startDate &&
        endDate &&
        areIntervalsOverlapping(
          { start: new Date(leave.startDate), end: new Date(leave.endDate) },
          { start: startDate, end: endDate },
          { inclusive: true }
        )
      );
    });
    return (overlappingLeaves && overlappingLeaves.length > 0) || false;
  };
  /**
   * @description to validate the form
   * @returns {boolean}
   */
  const validateForm = (): boolean => {
    const newErrors = {
      dateRange: !startDate || !endDate,
      leaveType: !leaveType,
      leaveReason: !leaveReason.trim(),
      isLeaveOverlapping: !isEditing && (checkIsLeaveOverlapping() as boolean),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };
  //to handle editing of leave
  /**
   * @description to handle editing of leave
   * @param {LeaveApplication} leave
   * @returns {void}
   */
  const handleEditLeave = (leave: LeaveApplication): void => {
    if (!["pending", "approved"].includes(leave.status)) {
      toast.error("Only pending leave requests can be edited.");
      return;
    }
    setIsEditing(true);
    setEditLeaveId(leave.id);
    setLeaveType(leave.type);
    setLeaveReason(leave.reason);
    setDateRange([new Date(leave.startDate), new Date(leave.endDate)]);
    setOriginalLeave(leave);
    setIsPopupOpen(true);
  };
  //when editing the existing leave check if only reason is changed
  /**
   * @description when editing the existing leave check if only reason is changed
   * @returns {boolean}
   */
  const isOnlyReasonChanged = (): boolean => {
    if (!isEditing || !originalLeave || !startDate || !endDate) return false;
    const originalStartDate = new Date(originalLeave.startDate);
    const originalEndDate = new Date(originalLeave.endDate);
    return (
      isEqual(originalStartDate, startDate) &&
      isEqual(originalEndDate, endDate) &&
      originalLeave.type === leaveType &&
      originalLeave.reason !== leaveReason
    );
  };
  /**
   * @description used to submit the leave requests
   * @returns {void}
   */
  const handleSubmitLeave = async (): Promise<void> => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }
    //if only reason is changed no need to send new request
    if (isEditing && isOnlyReasonChanged()) {
      try {
        await leaveApi.update(editLeaveId as string, {
          ...originalLeave!,
          reason: leaveReason,
        });
        await queryClient.invalidateQueries({
          queryKey: ["leave-applications"],
        });
        resetForm();
        return;
      } catch (e) {
        console.error(e);
        return;
      }
    }
    try {
      const id = isEditing ? editLeaveId! : Date.now().toString();
      const createdAt = isEditing
        ? userLeaves?.find((l) => l.id === editLeaveId)?.createdAt || new Date()
        : new Date();
      const leaveApplication = {
        id,
        employeeId: auth.id,
        startDate: startDate!.toISOString(),
        endDate: endDate!.toISOString(),
        type: leaveType,
        status: "pending" as "approved" | "rejected" | "cancelled" | "pending",
        requestedBy: `${user?.username} (${user?.email})`,
        approvedBy: null,
        currentManager: auth.managerId,
        reason: leaveReason,
        createdAt,
      };
      let updatedLeaveBalance = user?.leaveBalance || LEAVE_BALANCE;
      let updatedUnpaid = user?.unpaidLeaves || 0;
      const days = totalWorkingDays;
      if (!isEditing) {
        if (leaveType === "paid") {
          if (days > ((user && user.leaveBalance) || 0)) {
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
        await combinedOperations.applyForLeave(
          leaveApplication,
          auth.id,
          updatedLeaveBalance,
          updatedUnpaid
        );
        toast.success("Leave application submitted successfully!");
      } else {
        const originalLeave = userLeaves?.find((l) => l.id === editLeaveId);
        const originalDays = totalWorkingDays;
        const originalType = originalLeave?.type;
        //when editing the leave if type of leave is changed, change the leave balances accordingly
        if (originalType === "paid") {
          updatedLeaveBalance += originalDays;
        } else {
          updatedUnpaid -= originalDays;
        }
        if (leaveType === "paid") {
          if (updatedLeaveBalance < days) {
            toast.error("Insufficient paid leave balance");
            return;
          }
          updatedLeaveBalance -= days;
        } else {
          updatedUnpaid += days;
        }
        await leaveApi.update(editLeaveId as string, leaveApplication);
        await userApi.updateFields(user?.id as string, {
          leaveBalance: updatedLeaveBalance,
          unpaidLeaves: updatedUnpaid,
        });
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
      <div className="top-container">
        <button className="request-leave-button" onClick={openPopup}>
          Request Leave
          <FaPlus />
        </button>
      </div>

      <div className="content-container">
        <div className="calendar-container">
          <h1 className="calendar-heading">Calendar</h1>
          <DatePicker
            //@ts-ignore
            highlightDates={highlightWithRanges}
            inline
          />
          <div className="calendar-legend">
            <div className="legend-item legend-holiday">
              <span className="legend-color" />
              <span>Holiday</span>
            </div>
            <div className="legend-item legend-leave">
              <span className="legend-color" />
              <span>Leave</span>
            </div>
          </div>
        </div>

        <LeaveHistory
          leaves={userLeaves}
          isLoading={isLoading}
          managerNames={managerNames}
          onEditLeave={handleEditLeave}
        />
      </div>

      {isPopupOpen && (
        <div className="leave-popup-overlay">
          <div className="leave-popup-content">
            <div className="leave-application">
              <div className="popup-header">
                <h2>
                  {isEditing ? "Edit Leave Application" : "Apply for Leave"}
                </h2>
                <button className="close-popup-button" onClick={closePopup}>
                  &times;
                </button>
              </div>

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
                    dateFormat="dd-MM-YYYY"
                    endDate={endDate}
                    onChange={handleChange}
                    isClearable
                    placeholderText="Click to select a date range"
                    filterDate={(date) => {
                      // Filter out weekends
                      if (isWeekend(date)) return false;
                      // Filter out holidays
                      const dateString = format(date, "yyyy-MM-dd");
                      return !HOLIDAYS.includes(dateString);
                    }}
                    className="date-picker-input"
                  />
                  {errors.dateRange && (
                    <span className="error-message">
                      Start date is required
                    </span>
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
                  className={`select-container ${
                    errors.leaveType ? "error" : ""
                  }`}
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
                    <option value="unpaid">
                      Unpaid leaves - infinite days
                    </option>
                    <option value="bereavement">Bereavement Leave</option>
                    {user?.gender === "male" ? (
                      <option value="paternity">
                        Paternity Leave - 5 days
                      </option>
                    ) : (
                      <option value="maternity">
                        Maternity Leave - 182 days
                      </option>
                    )}
                    <option value="paid">
                      Paid leave - {user?.leaveBalance} days available
                    </option>
                  </select>
                  {errors.leaveType && (
                    <span className="error-message">
                      Leave type is required
                    </span>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="form-group">
                <label htmlFor="reason">Reason</label>
                <div
                  className={`input-container ${
                    errors.leaveReason ? "error" : ""
                  }`}
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
                    <span className="error-message">
                      Leave reason is required
                    </span>
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
                      <span className="detail-value">
                        {format(startDate, "PPP")}
                      </span>
                    </div>
                    <div className="leave-detail">
                      <span className="detail-label">To:</span>
                      <span className="detail-value">
                        {format(endDate || startDate, "PPP")}
                      </span>
                    </div>
                    <div className="leave-detail total-days">
                      <span className="detail-label">Total weekdays:</span>
                      <span className="detail-value">{totalWorkingDays}</span>
                    </div>
                  </div>
                  <div className="action-buttons">
                    <button
                      className="submit-button"
                      onClick={handleSubmitLeave}
                    >
                      {isEditing
                        ? isOnlyReasonChanged()
                          ? "Update Reason"
                          : "Update Leave Request"
                        : "Request Leave"}
                    </button>
                    {isEditing && (
                      <button
                        className="cancel-edit-button"
                        onClick={resetForm}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LeaveManagement;
