import { createSlice } from "@reduxjs/toolkit";
import { IInitialState } from "./authTypes";


const initialState: IInitialState = {
    userInformation: {
        id: "",
        name: "",
        email: "",
        role: "",
        routes: [],
        permissions: [],
    },
    data: [],
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearUserInformation: (state) => {
            state.userInformation = initialState.userInformation;
        },
        setUserInformation: (state, action) => {
            state.userInformation = { ...initialState.userInformation, ...action.payload };
        },
        setData: (state, action) => {
            state.data = action.payload;
        },
    },
});

export const { setUserInformation, setData, clearUserInformation } = authSlice.actions;
export default authSlice.reducer;