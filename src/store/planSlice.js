import { createSlice } from "@reduxjs/toolkit";


export const planSlice = createSlice({
    name: "plan",
    initialState: {
        plans: [],
    },
    reducers: {
        setPlans: (state, action) => {
            state.plans = action.payload;
        },
        addPlan: (state, action) => {
            state.plans.push(action.payload);
        }
    }
})

export const {setPlans, addPlan} = planSlice.actions;
export default planSlice.reducer;

