export const HOLIDAYS = [
  "2025-01-01",
  "2025-01-14",
  "2025-08-15",
  "2025-08-24",
  "2025-10-02",
  "2025-10-24",
];

export const DEPARTMENTS = [
  "CEO",
  ".NET",
  "Frontend Developer",
  "Project Management",
  "Data",
  "Human Resources",
  "Python",
  "Java",
];

export const ROLES = ["employee", "manager", "HR"];

export const LEAVE_BALANCE = 20;

export const DEFAULT_MANAGER_ID = "2183";
export const API_URL = "http://localhost:3001";

export enum LeaveStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Cancelled = "cancelled",
}

export enum LeaveType {
  Paid = "paid",
  Unpaid = "unpaid",
}
