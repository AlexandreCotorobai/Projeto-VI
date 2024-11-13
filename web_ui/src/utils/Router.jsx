import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Base } from "../containers/base/index.js";
import { Inovation } from "../pages/inovation/index.js";
import { Infra } from "../pages/infra/index.js";
import { Invest } from "../pages/invest/index.js";

export default function Router() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Base />,
      children: [{ path: "/", element: <Inovation /> }],
    },
    {
      path: "/infra",
      element: <Base />,
      children: [{ path: "/infra", element: <Infra /> }],
    },
    {
      path: "/invest",
      element: <Base />,
      children: [{ path: "/invest", element: <Invest /> }],
    },
    { path: "*", element: <p>404 Page</p> },
  ]);

  return <RouterProvider router={router} />;
}
