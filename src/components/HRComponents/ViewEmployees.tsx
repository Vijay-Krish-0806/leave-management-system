import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FaSpinner,
  FaUserEdit,
  FaTrash,
  FaSortDown,
  FaSortUp,
} from "react-icons/fa";
import { toast } from "react-toastify";
import CreateEditEmployee from "./CreateEditEmployee";
import { User } from "../../types";
import { FaPlus, FaUser } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import api from "../../api/apiCalls";
import { DEFAULT_MANAGER_ID, DEPARTMENTS, ROLES } from "../../constants";
import Table, { Column } from "../CommonTable";
import "../css/Table.css";

type SortConfig = {
  key: keyof User;
  direction: "asc" | "desc";
};

/**
 * @description
 *  ViewEmployees component for displaying and managing a list of employees.
 *
 * This component fetches employee data, allows searching, filtering, sorting,
 * and provides options to add, edit, or delete employees. It also displays
 * a modal for creating or editing employee details.
 * @returns {JSX.Element}
 */
const ViewEmployees: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Partial<User>>();
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("All");
  const [filterDept, setFilterDept] = useState<string>("All");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  useEffect(() => {
    document.title = "View Employees";
  }, []);

  //cannot delete if there is only one HR or default manager
  /**
   * @description to delete the user
   * @param {string} id
   * @returns {void}
   */
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

  /**
   * @description to edit the user details
   * @param {User} user
   * @returns {void}
   */
  const handleEdit = (user: User): void => {
    setSelectedUser(user);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  /**
   * @description function to delete the user
   * @param {string} id
   * @returns {void}
   */
  const handleDelete = (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (confirmDelete) {
      deleteMutation.mutate(id);
    }
  };

  /**
   * @description to navigate to particular user details page
   * @param {string} userId
   * @returns {void}
   */
  const handleUserDetails = (userId: string) => {
    navigate(`/dashboard/HR/employee-details/${userId}`);
  };

  /**
   * @description to add a new user
   * @returns {void}
   */
  const handleAddEmployee = (): void => {
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

  /**
   * @description to close the opened popup
   * @returns {void}
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(undefined);
  };

  /**
   * @description to handle sort type ascending|descending
   * @param {keyof User} key
   * @returns {void}
   */
  const handleSort = (key: keyof User): void => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    let result = [...users];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((u) => u.username.toLowerCase().includes(term));
    }

    if (filterRole !== "All") {
      result = result.filter((u) => u.role === filterRole);
    }

    if (filterDept !== "All") {
      result = result.filter((u) => u.department === filterDept);
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [users, searchTerm, filterRole, filterDept, sortConfig]);

  const columns: Column<User>[] = [
    {
      header: (
        <span
          onClick={() => handleSort("username")}
          className="sortable"
          title="Sort"
        >
          Username{" "}
          {sortConfig?.key === "username" &&
            (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
        </span>
      ),
      accessor: "username",
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Role",
      accessor: "role",
    },
    {
      header: "Department",
      accessor: "department",
    },
    {
      header: "Actions",
      accessor: (user: User) => (
        <div>
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
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <FaSpinner className="spin" />
            ) : (
              <FaTrash />
            )}
          </button>
          <button
            className="user-details-button"
            onClick={() => handleUserDetails(user.id as string)}
            title="User details"
          >
            <FaUser />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="table-controls">
        <div>
          <input
            type="text"
            placeholder="Search by username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="All">Role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="All">Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="add-employee-btn">
        <button onClick={handleAddEmployee}>
          <FaPlus />
          Add Employee
        </button>
      </div>

      <Table
        columns={columns}
        data={filteredUsers}
        caption="Employees List"
        isLoading={isLoading}
        isError={isError}
        errorMessage={
          isError
            ? `Error loading users: ${
                error?.message || "Please try again later."
              }`
            : undefined
        }
      />

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
