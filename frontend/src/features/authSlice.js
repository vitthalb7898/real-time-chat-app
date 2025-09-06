import {createSlice , nanoid} from "@reduxjs/toolkit"

const initialState = {
     user: null,
}

export const authSlice = createSlice({
     name: 'auth',
     initialState,
     reducers: {
       login: (state, action) => {
         state.user = action.payload;
       },
       
     }
});

export const { login } = authSlice.actions;

export default authSlice.reducer;