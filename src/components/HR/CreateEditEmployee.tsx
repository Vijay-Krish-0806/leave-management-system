import React, { useState } from "react";
import {
  FaPlus,
  FaSave,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserTie,
  FaUserTag,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LeaveApplication, User } from "../../types";
import "../css/HR.css";
import DropDownWithSearch from "../DropDownWithSearch";

interface EmployeeFormProps {
  isEditMode?: boolean;
  initialUser?: User;
  onClose?: () => void;
  isModalOpen:boolean
}
const departments = [
  "CEO",
  ".NET",
  "Frontend Developer",
  "Project Management",
  "Data",
  "Human Resources",
  "Python",
  "Java",
];
const getAllUsers = async () => {
  try {
    const response = await axios.get("http://localhost:3001/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const createUser = async (newUser: Omit<User, "id">): Promise<User> => {
  try {
    const response = await axios.post<User>("http://localhost:3001/users", {
      ...newUser,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
const updateUser = async (updatedUser: User): Promise<User> => {
  try {
    const response = await axios.put<User>(
      `http://localhost:3001/users/${updatedUser.id}`,
      {
        ...updatedUser,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

const getAllLeaveApplications = async (): Promise<LeaveApplication[]> => {
  try {
    const response = await axios.get("http://localhost:3001/leaveApplications");
    return response.data;
  } catch (error) {
    console.error("Error fetching leave applications:", error);
    throw error;
  }
};

const updateLeaveApplicationsForEmployee = async (
  employeeId: string,
  newManagerId: string
): Promise<void> => {
  try {
    const leaveApplications = await getAllLeaveApplications();
    const employeeLeaveApplications = leaveApplications.filter(
      (application) => application.employeeId === employeeId
    );

    const updatePromises = employeeLeaveApplications.map((application) => {
      return axios.put(
        `http://localhost:3001/leaveApplications/${application.id}`,
        {
          ...application,
          currentManager: newManagerId,
        }
      );
    });

    await Promise.all(updatePromises);

    console.log(
      `Updated ${updatePromises.length} leave applications for employee ${employeeId} with ${newManagerId}`
    );
  } catch (error) {
    console.error("Error updating leave applications:", error);
    throw error;
  }
};

const CreateEditEmployee: React.FC<EmployeeFormProps> = ({
  isEditMode = false,
  initialUser,
  onClose,
  isModalOpen
}) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: usersList } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
      onClose && onClose();
    },
    onError: (error: any) => {
      toast.error("Something went wrong while creating user");
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      onClose && onClose();
    },
    onError: (error: any) => {
      toast.error("Something went wrong while updating user");
      console.error(error);
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const username = isEditMode
        ? (formData.get("username") as string)
        : `${formData.get("firstname") || ""} ${
            formData.get("lastname") || ""
          }`.trim();

      if (!username) {
        toast.error("Username is required");
        return;
      }

      const email = formData.get("email") as string;
      const role = formData.get("role") as string;
      const gender = formData.get("gender") as string;
      const managerId = formData.get("assigned") as string;
      console.log(managerId);
      const department = formData.get("department") as string;

      const password = isEditMode
        ? initialUser?.password || "welcome"
        : (formData.get("password") as string);

      if (!password) {
        toast.error("Password is required");
        return;
      }

      const userData: User = {
        username,
        email,
        password,
        role,
        gender,
        department,
        managerId,
        leaveBalance: 20,
        unpaidLeaves: 0,
      };

      if (isEditMode) {
        userData.id = initialUser?.id;
        Object.keys(userData).forEach(
          (key) =>
            userData[key as keyof User] === undefined &&
            delete userData[key as keyof User]
        );

        if (
          initialUser &&
          userData.managerId !== initialUser.managerId &&
          userData.id
        ) {
          await updateMutation.mutateAsync(userData);

          try {
            await updateLeaveApplicationsForEmployee(
              userData.id,
              userData.managerId
            );

            queryClient.invalidateQueries({ queryKey: ["leave-applications"] });
          } catch (error) {
            console.error("Failed to update leave applications:", error);
            toast.warning(
              "Employee updated but there was an issue updating leave applications"
            );
          }
        } else {
          await updateMutation.mutateAsync(userData);
        }
      } else {
        await createMutation.mutateAsync(userData);
        form.reset();
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (isEditMode && !initialUser) {
    return null;
  }

  const formContent = (
    <div className={`employee-form-container ${isEditMode ? "edit-mode" : ""}`}>
      <div className="form-header">
        <h2>{isEditMode ? "Edit Employee" : "Create New Employee"}</h2>
        {onClose && (
          <button type="button" onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="employee-form">
        <div className="form-row">
          {!isEditMode ? (
            <>
              <div className="form-group">
                <label htmlFor="firstname">
                  <FaUser className="input-icon" />
                  <span>First Name</span>
                </label>
                <input
                  type="text"
                  name="firstname"
                  id="firstname"
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastname">
                  <FaUser className="input-icon" />
                  <span>Last Name</span>
                </label>
                <input
                  type="text"
                  name="lastname"
                  id="lastname"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </>
          ) : (
            <div className="form-group full-width">
              <label htmlFor="username">
                <FaUserTag className="input-icon" />
                <span>Display Name</span>
              </label>
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Enter display name"
                defaultValue={initialUser?.username}
                required
              />
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="input-icon" />
              <span>Email</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter email address"
              defaultValue={initialUser?.email}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" />
              <span>Password</span>
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter password"
              defaultValue={initialUser?.password || "welcome"}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="role">
              <FaUserTie className="input-icon" />
              <span>Role</span>
            </label>
            <select
              name="role"
              id="role"
              defaultValue={initialUser?.role || ""}
              required
            >
              <option value="">Select Role</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="HR">HR</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="assigned">
              <FaUserTie className="input-icon" />
              <span>Assigned to</span>
            </label>
            <DropDownWithSearch
              usersList={usersList?.filter(
                (user: User) => user.role === "manager"
              )}
              //@ts-ignore
              initialUser={initialUser?.managerId}
              placeholder="Select Manager"
              required={true}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="department">
              <FaUserTag className="input-icon" />
              <span>Department</span>
            </label>
            <select
              name="department"
              id="department"
              required
              defaultValue={initialUser?.department}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group gender-group">
            <label>
              <FaUser className="input-icon" />
              <span>Gender</span>
            </label>
            <div className="radio-options">
              <div className="radio-option">
                <input
                  type="radio"
                  id="male"
                  name="gender"
                  value="male"
                  defaultChecked={initialUser?.gender === "male"}
                  required
                />
                <label htmlFor="male">Male</label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id="female"
                  name="gender"
                  value="female"
                  defaultChecked={initialUser?.gender === "female"}
                  required
                />
                <label htmlFor="female">Female</label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isEditMode ? (
              <>
                <FaSave className="button-icon" />
                <span>{isSubmitting ? "Updating..." : "Update Employee"}</span>
              </>
            ) : (
              <>
                <FaPlus className="button-icon" />
                <span>{isSubmitting ? "Creating..." : "Create Employee"}</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="cancel-popup-button"
            >
              <FaTimes className="button-icon" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );

  return isModalOpen ? (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      {formContent}
    </div>
  ) : (
    formContent
  );
};

export default CreateEditEmployee;
