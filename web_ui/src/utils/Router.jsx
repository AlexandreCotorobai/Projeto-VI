import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Base } from "../containers/base/index.js";
import { Home } from "../pages/home/index.js";

export default function Router() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Base />,
      children: [{ path: "/", element: <Home /> }],
    },
    { path: "*", element: <p>404 Page</p> },
  ]);

  return <RouterProvider router={router} />;
}
