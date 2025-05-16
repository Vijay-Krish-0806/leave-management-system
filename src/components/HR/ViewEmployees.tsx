import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FaSpinner, FaUserEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import CreateEditEmployee from "./CreateEditEmployee";
import "../css/Table.css";
import { User } from "../../types";
import { FaPlus, FaUser } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/users";

const fetchUsers = async (): Promise<User[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

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
    queryFn: fetchUsers,
  });
  const countOfHRs = users?.filter((user) => user.role === "HR");

  const deleteUser = async (id: string) => {
    if (countOfHRs && countOfHRs.length <= 1) {
      toast.error("Cannot delete the HR");
      throw new Error("Cannot delete the HR");
    }
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  };

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete user");
      console.error(error);
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
