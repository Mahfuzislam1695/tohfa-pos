
import { createSlice } from "@reduxjs/toolkit";
import { IMainState } from "./userTypes";

const initialState: IMainState = {
    search: false,
    add: false,
    toggle: false,
    val: {},
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        handleInitialSearch: (state) => {
            state.search = true;
        },
        handleInitialSearchStop: (state) => {
            state.search = false;
        },
        handleAddModalOpen: (state) => {
            state.add = true;
        },
        handleAddModalClose: (state) => {
            state.add = false;
        },
        handleToggle: (state) => {
            state.toggle = !state.toggle;
        },
        rowValue: (state, action) => {
            state.val = action.payload;
        },
    },
});

export const {
    handleInitialSearch,
    handleInitialSearchStop,
    handleAddModalOpen,
    handleAddModalClose,
    handleToggle,
    rowValue,
} = userSlice.actions;

export default userSlice.reducer;