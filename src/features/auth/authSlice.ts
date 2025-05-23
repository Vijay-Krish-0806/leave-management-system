import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  id: string;
  username: string;
  email: string;
  role: string;
  managerId: string;
  leaveBalance: number;
  unpaidLeaves: number;
}

const storedCredentials = localStorage.getItem("credentials");
let initialState: AuthState = {
  id: "",
  username: "",
  email: "",
  role: "",
  managerId: "",
  leaveBalance: 0,
  unpaidLeaves: 0,
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
    setUser(state, action: PayloadAction<AuthState>) {
      const {
        id,
        username,
        email,
        role,
        managerId,
        leaveBalance,
        unpaidLeaves,
      } = action.payload;
      state.id = id as string;
      state.username = username;
      state.email = email;
      state.role = role;
      state.managerId = managerId;
      state.leaveBalance = leaveBalance;
      state.unpaidLeaves = unpaidLeaves as number;

      saveToLocalStorage(state);
    },
    logout(state) {
      Object.assign(state, {
        id: "",
        username: "",
        email: "",
        role: "",
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
