import { configureStore } from "@reduxjs/toolkit";
import { memberSlice } from "./memberSlice";
import { eventSlice } from "./eventSlice";
import { planSlice } from "./planSlice";



const store = configureStore({
    reducer: {
        member: memberSlice.reducer,
        events: eventSlice.reducer,
        plan: planSlice.reducer,
    }
});

export default store;