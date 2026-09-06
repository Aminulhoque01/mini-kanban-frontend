// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface AuthState {
//   user: User | null;
//   token: string | null;
// }

// const initialState: AuthState = {
//   user: null,
//   token: null,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,

//   reducers: {
//     setCredentials: (
//       state,
//       action: PayloadAction<{
//         user: User;
//         token: string;
//       }>
//     ) => {
//       state.user = action.payload.user;
//       state.token = action.payload.token;
//     },

    
//     setToken: (state, action: PayloadAction<string>) => {
//       state.token = action.payload;
//     },

//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//     },
//   },
// });

// export const {
//   setCredentials,
//   setToken,
//   logout,
// } = authSlice.actions;

// export default authSlice.reducer;


import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },

    // Used after a full browser reload to hydrate Redux from localStorage.
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setCredentials, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
