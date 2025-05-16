import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types";

interface AuthState {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  gender: string;
  managerId: string;
  leaveBalance: number;
  unpaidLeaves: number;
  department: string;
}

const storedCredentials = localStorage.getItem("credentials");
let initialState: AuthState = {
  id: "",
  username: "",
  email: "",
  password: "",
  role: "",
  gender: "",
  managerId: "",
  leaveBalance: 0,
  unpaidLeaves: 0,
  department: "",
};

if (storedCredentials) {
  try {
    initialState = JSON.parse(storedCredentials);
  } catch (error) {
    console.error("Failed to parse credentials from localStorage:", error);
  }
}

const saveToLocalStorage = (state: AuthState) => {
  localStorage.setItem("credentials", JSON.stringify(state));
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      const {
        id,
        username,
        email,
        password,
        role,
        gender,
        managerId,
        leaveBalance,
        unpaidLeaves,
        department,
      } = action.payload;
      state.id = id as string;
      state.username = username;
      state.email = email;
      state.password = password;
      state.role = role;
      state.gender = gender;
      state.managerId = managerId;
      state.leaveBalance = leaveBalance;
      state.unpaidLeaves = unpaidLeaves as number;

      state.department = department;
      saveToLocalStorage(state);
    },
    logout(state) {
      Object.assign(state, {
        id: "",
        username: "",
        email: "",
        password: "",
        role: "",
        gender: "",
        managerId: "",
        leaveBalance: 0,
        unpaidLeaves: 0,
      });
      localStorage.removeItem("credentials");
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
