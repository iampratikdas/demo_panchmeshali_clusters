import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";

import SignIn from "./pages/SignIn";
import Signup from "@/pages/Signup";
import RulesContent from "@/pages/RulesContent";
import { Dashboard } from "@/pages/dashboard";
import { SubmissionForm } from "@/components/submit/SubmissionForm";
import UsersList from  "@/pages/UsersList"
import Events from  "@/pages/Events";
import  FolderPages  from "@/components/folders/FolderPages";
// import { StorySubmissionForm } from "@/components/submit/StorySubmissionForm";
import StoryStatus from "@/pages/story-status";
import {Profile} from "@/pages/Profile";
// import SelectionEditor from "@/pages/selection_editor";
import Layout from "@/components/layout/Layout";
import 'animate.css';

export default function Index() {
  const route = createBrowserRouter([
    // {
    //   path: "*",
    //   element:  <Layout><Dashboard /> </Layout>,
    // },
    {
      path: "/",
      element:  <Layout><Dashboard /> </Layout>,
    },
    {
      path: "/submit/:id",
      element:  <Layout><SubmissionForm /> </Layout>,
    },
     {
      path: "/status/:id",
      element:  <Layout><StoryStatus /> </Layout>,
    },
    {
      path: "/rules/:id",
      element:  <Layout><RulesContent /> </Layout>,
    },
    {
      path: "/status",
      element: <Layout><StoryStatus /> </Layout>,
    },
    // {
    //   path: "/selection_editor",
    //   element: <Layout><SelectionEditor /> </Layout>,
    // },
    // {
    //   path: "/user_list",
    //   element: <Layout><SelectionEditor /> </Layout>,
    // },
    {
      path: "/profile",
      element: <Layout><Profile /> </Layout>,
    },
     {
      path: "/users_list",
      element: <Layout><UsersList /> </Layout>,
    },
    {
      path: "/events",
      element: <Layout><Events /> </Layout>,
    },
    {
      path: "/work_flows",
      element: <Layout><UsersList /> </Layout>,
    },
    {
      path: "/signin",
      element: <SignIn />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/folders/:folders",
      element: <FolderPages />,
    },
    {
      path: "/submit",
      element: <Layout><SubmissionForm /> </Layout>,
    },
    {
      path: "*",
      element: <Navigate to="/" /> ,
    },
  ]);
  return <RouterProvider router={route} />;
}