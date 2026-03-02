import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './slicer';
import countentReducer from './contentSlicer';
import contentTrailerOneSlicer from './contentTrailerOneSlicer';
import contentTrailerSlicer from './contentTrailerSlicer';
import pageReducer from './pageSlicer';
import userReducer from './userDetailsSlicer';
import currentPageReducer from "./currentPageSlicer"

export const store = configureStore({
  reducer: {
    user_detail: userReducer,
    counter: counterReducer,
    pages: pageReducer,
    contents: countentReducer,
    contents_trailers: contentTrailerSlicer,
    contents_trailers_one: contentTrailerOneSlicer,
    currentPageStatus: currentPageReducer
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
export type AppSubscribe = typeof store.subscribe