import { configureStore } from "@reduxjs/toolkit";
import { memberSlice } from "./memberSlice";
import { eventSlice } from "./eventSlice";


const store = configureStore({
    reducer: {
        member: memberSlice.reducer,
        events: eventSlice.reducer,
    }
});

export default store;