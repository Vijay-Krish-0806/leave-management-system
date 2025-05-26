import axios from "axios";
import { User, LeaveApplication } from "../types";
import { API_URL } from "../constants";

// User related API calls
export const userApi = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    try {
      const response = await axios.get<User[]>(`${API_URL}/users`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Get a single user by ID
  getById: async (userId: string): Promise<User> => {
    try {
      const response = await axios.get<User>(`${API_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  // Create a new user
  create: async (newUser: Omit<User, "id">): Promise<User> => {
    try {
      const response = await axios.post<User>(`${API_URL}/users`, newUser);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // Update a user
  update: async (userId: string, userData: Partial<User>): Promise<User> => {
    try {
      const response = await axios.put<User>(
        `${API_URL}/users/${userId}`,
        userData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },

  // Update specific user fields (using PATCH)
  updateFields: async (
    userId: string,
    fields: Partial<User>
  ): Promise<User> => {
    try {
      const response = await axios.patch<User>(
        `${API_URL}/users/${userId}`,
        fields
      );
      return response.data;
    } catch (error) {
      console.error(`Error patching user ${userId}:`, error);
      throw error;
    }
  },

  // Delete a user
  delete: async (userId: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/users/${userId}`);
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },

  // Update user leave balance
  updateLeaveBalance: async (
    userId: string,
    leaveBalance: number,
    unpaidLeaves: number
  ): Promise<User> => {
    try {
      const response = await axios.patch<User>(`${API_URL}/users/${userId}`, {
        leaveBalance,
        unpaidLeaves,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating leave balance for user ${userId}:`, error);
      throw error;
    }
  },
};


//Leave Applications Api calls
export const leaveApi = {
  // Get all leave applications
  getAll: async (): Promise<LeaveApplication[]> => {
    try {
      const response = await axios.get<LeaveApplication[]>(
        `${API_URL}/leaveApplications`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching leave applications:", error);
      throw error;
    }
  },

  // Get leave applications by employee ID
  getByEmployeeId: async (employeeId: string): Promise<LeaveApplication[]> => {
    try {
      const response = await axios.get<LeaveApplication[]>(
        `${API_URL}/leaveApplications/?employeeId=${employeeId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching leave applications for employee ${employeeId}:`,
        error
      );
      throw error;
    }
  },

  // Create a new leave application
  create: async (
    leaveApplication: Omit<LeaveApplication, "id">
  ): Promise<LeaveApplication> => {
    try {
      const response = await axios.post<LeaveApplication>(
        `${API_URL}/leaveApplications`,
        leaveApplication
      );
      return response.data;
    } catch (error) {
      console.error("Error creating leave application:", error);
      throw error;
    }
  },

  // Update a leave application
  update: async (
    leaveId: string,
    leaveData: Partial<LeaveApplication>
  ): Promise<LeaveApplication> => {
    try {
      const response = await axios.put<LeaveApplication>(
        `${API_URL}/leaveApplications/${leaveId}`,
        leaveData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating leave application ${leaveId}:`, error);
      throw error;
    }
  },

  // Update specific leave application fields (using PATCH)
  updateFields: async (
    leaveId: string,
    fields: Partial<LeaveApplication>
  ): Promise<LeaveApplication> => {
    try {
      const response = await axios.patch<LeaveApplication>(
        `${API_URL}/leaveApplications/${leaveId}`,
        fields
      );
      return response.data;
    } catch (error) {
      console.error(`Error patching leave application ${leaveId}:`, error);
      throw error;
    }
  },

  // Cancel a leave application
  cancel: async (leaveId: string): Promise<LeaveApplication> => {
    try {
      const response = await axios.patch<LeaveApplication>(
        `${API_URL}/leaveApplications/${leaveId}`,
        { status: "cancelled" }
      );
      return response.data;
    } catch (error) {
      console.error(`Error cancelling leave application ${leaveId}:`, error);
      throw error;
    }
  },

  delete: async (leaveId: string): Promise<LeaveApplication> => {
    try {
      const response = await axios.delete<LeaveApplication>(
        `${API_URL}/leaveApplications/${leaveId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting leave application ${leaveId}:`, error);
      throw error;
    }
  },

  // Update manager for all leave applications of an employee if manager is changed/deleted
  updateManagerForEmployee: async (
    employeeId: string,
    newManagerId: string
  ): Promise<void> => {
    try {
      const leaveApplications = await leaveApi.getByEmployeeId(employeeId);

      const updatePromises = leaveApplications.map((application) =>
        leaveApi.update(application.id, {
          ...application,
          currentManager: newManagerId,
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error updating leave applications manager:", error);
      throw error;
    }
  },
};

//more than one API call combined
export const combinedOperations = {
  // Apply for leave (creates leave application and updates user leave balance)
  applyForLeave: async (
    leaveApplication: Omit<LeaveApplication, "id">,
    userId: string,
    updatedLeaveBalance: number,
    updatedUnpaidLeaves: number
  ): Promise<{ leaveApplication: LeaveApplication; user: User }> => {
    try {
      const newLeave = await leaveApi.create(leaveApplication);
      const updatedUser = await userApi.updateLeaveBalance(
        userId,
        updatedLeaveBalance,
        updatedUnpaidLeaves
      );

      return {
        leaveApplication: newLeave,
        user: updatedUser,
      };
    } catch (error) {
      console.error("Error applying for leave:", error);
      throw error;
    }
  },

  // Cancel leave and restore leave balance
  cancelLeaveAndRestoreBalance: async (
    leaveId: string,
    userId: string,
    updatedLeaveBalance: number,
    updatedUnpaidLeaves: number
  ): Promise<{ leaveApplication: LeaveApplication; user: User }> => {
    try {
      const cancelledLeave = await leaveApi.cancel(leaveId);
      const updatedUser = await userApi.updateLeaveBalance(
        userId,
        updatedLeaveBalance,
        updatedUnpaidLeaves
      );

      return {
        leaveApplication: cancelledLeave,
        user: updatedUser,
      };
    } catch (error) {
      console.error("Error cancelling leave and restoring balance:", error);
      throw error;
    }
  },

  //deleting a user and deleting all leave applications
  deleteUserAndCleanup: async (
    userId: string,
    defaultManagerId: string
  ): Promise<void> => {
    try {
      // Update all users who had this person as manager
      const allUsers = await userApi.getAll();
      const subordinates = allUsers.filter((user) => user.managerId === userId);

      for (const subordinate of subordinates) {
        await userApi.update(subordinate.id as string, {
          ...subordinate,
          managerId: defaultManagerId,
        });
      }

      //Delete all leave applications for this user
      const userLeaves = await leaveApi.getByEmployeeId(userId);
      for (const leave of userLeaves) {
        await leaveApi.delete(leave.id);
      }

      //Update leave applications where user was the manager
      const allLeaves = await leaveApi.getAll();
      const managedLeaves = allLeaves.filter(
        (leave) => leave.currentManager === userId
      );

      for (const leave of managedLeaves) {
        await leaveApi.updateFields(leave.id, {
          currentManager: defaultManagerId,
        });
      }

      // Step 4: Delete the user
      await userApi.delete(userId);
    } catch (error) {
      console.error("Error during user deletion cleanup process:", error);
      throw error;
    }
  },
};

export default {
  user: userApi,
  leave: leaveApi,
  combined: combinedOperations,
};
