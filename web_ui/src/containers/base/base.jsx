import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/navbar/index.js";

export const Base = (props) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className={"h-full lg:h-screen lg:max-h-screen pt-24 bg-slate-400"}>
        <Outlet />
      </div>
    </div>
  );
};
