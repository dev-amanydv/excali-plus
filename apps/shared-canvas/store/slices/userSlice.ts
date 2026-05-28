import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface userState {
    userId: string | null;
    email: string | null;
    tempId: string | null
}

const initiaState: userState = {
    userId: null,
    email: null,
    tempId: null
}

const userSlice = createSlice({
    name: "user",
    initialState: initiaState,
    reducers: {
        addUser(state, action: PayloadAction<userState>){
            state.email = action.payload.email
            state.userId = action.payload.userId
            state.tempId = action.payload.tempId
        }
    }
})

export const addUser = userSlice.actions;

export default userSlice.reducer;