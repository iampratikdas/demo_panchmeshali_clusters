import { configureStore } from '@reduxjs/toolkit';
import { profile } from 'console';
import profileFetchReducer from './profileFetchReducer';
// import bodReducer from './bodSlice';
// import aboutReducer from './aboutSlice';
// import contactusReducer from './contactusSlice';
// import productCategorySlice from './productsCategorySlice';

const store = configureStore({
  reducer: {
    profile: profileFetchReducer
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;