import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

export const eventSlice = createSlice({
    name: "eventSlice",
    initialState,
    reducers: {
        setEvents: (state, action) => {
            return action.payload;
        },
        clearEvents: () => {
            return []
        }
    },
});

export const {setEvents, clearEvents} = eventSlice.actions;