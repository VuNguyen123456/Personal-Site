import { createBrowserRouter, Navigate } from "react-router-dom";
import PersonalHomepage from "./PersonalHomepage";
import Root from "./Root";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: PersonalHomepage },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
