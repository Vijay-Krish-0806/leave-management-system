export interface User {
  id?: string;
  username: string;
  email: string;
  password: string;
  role: string;
  gender: string;
  department: string;
  managerId: string;
  leaveBalance: number;
  unpaidLeaves?: number;
}

export interface LeaveApplication {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: string;
  status: "approved" | "rejected" |"cancelled" |"pending";
  requestedBy: string;
  approvedBy?: string | null;
  currentManager?: string;
  reason: string;
  createdAt: Date;
}
