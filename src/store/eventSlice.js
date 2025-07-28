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
        },
        addEvent: (state, action) => {
            state.push(action.payload)
        },
        updatedEvent: (state,action) => {
            const index = state.findIndex(e => e.id === action.payload.id);
            if (index !== -1) {
                state[index] = action.payload
            }
        }
    },
});

export const {setEvents, clearEvents, addEvent, updatedEvent} = eventSlice.actions;