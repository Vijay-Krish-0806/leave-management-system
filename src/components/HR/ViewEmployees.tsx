import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaSpinner, FaUserEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import CreateEditEmployee from "./CreateEditEmployee";
import { User } from "../../types";
import { FaPlus, FaUser } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import api from "../../api/apiCalls";
import { DEFAULT_MANAGER_ID } from "../../constants";
import "../css/Table.css";

const ViewEmployees: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Partial<User>>();
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    isLoading,
    isError,
    data: users,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: api.user.getAll,
  });
  const countOfHRs = users?.filter((user) => user.role === "HR");
  const defaultManager = users?.find((user) => user.id === DEFAULT_MANAGER_ID);

  const deleteUser = async (id: string) => {
    if (
      (countOfHRs &&
        countOfHRs.length <= 1 &&
        users?.find((u) => u.id === id)?.role === "HR") ||
      (defaultManager && id === defaultManager.id)
    ) {
      throw new Error("Cannot delete the user");
    }

    if (!defaultManager) {
      toast.error("Default manager not found");
      throw new Error("Default manager not found");
    }

    try {
      await api.combined.deleteUserAndCleanup(id, defaultManager.id as string);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["leaveApplications"] });
      toast.success("User deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (confirmDelete) {
      deleteMutation.mutate(id);
    }
  };
  const navigate = useNavigate();
  const handleUserDetails = (userId: string) => {
    navigate(`/dashboard/HR/employee-details/${userId}`);
  };

  const handleAddEmployee = () => {
    // Create an empty user object for the create form
    setSelectedUser({
      username: "",
      email: "",
      role: "",
      password: "",
      gender: "",
      department: "",
      managerId: "",
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(undefined);
  };

  if (isLoading) {
    return (
      <div className="loading">
        <FaSpinner className="spinner" />
      </div>
    );
  }

  if (isError) {
    return <div className="error">Error loading users: {error?.message}</div>;
  }

  return (
    <>
      <div className="table-container">
        <div className="add-employee-btn">
          <button onClick={handleAddEmployee}>
            <FaPlus />
            Add Employee
          </button>
        </div>
        <table className="custom-table">
          <caption className="table-caption">Employees List</caption>
          <thead className="table-header">
            <tr>
              <th>Index</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {users?.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.department}</td>
                <td>
                  <button
                    className="user-edit-button"
                    onClick={() => handleEdit(user)}
                    title="Edit User"
                  >
                    <FaUserEdit />
                  </button>
                  <button
                    className="user-delete-button"
                    onClick={() => handleDelete(user.id as string)}
                    title="Delete User"
                  >
                    <FaTrash />
                  </button>
                  <button
                    className="user-details-button"
                    onClick={() => handleUserDetails(user.id as string)}
                    title="User details"
                  >
                    <FaUser />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CreateEditEmployee
              isEditMode={isEditMode}
              initialUser={selectedUser as User}
              onClose={handleCloseModal}
              isModalOpen={isModalOpen}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ViewEmployees;
