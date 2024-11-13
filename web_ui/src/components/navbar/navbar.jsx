import { Link } from "react-router-dom";

export const Navbar = (props) => {
  return (
    <div className="navbar bg-base-100 rounded fixed z-[1]">
      <div className="flex-1 flex justify-between items-center">
        <div className="flex space-x-10">
          <Link to="/" className="text-xl">
            Inovação
          </Link>
          <Link to="/infra" className="text-xl">
            infra
          </Link>
          <Link to="/invest" className="text-xl">
            Infraestrutura
          </Link>
        </div>
        <a className="normal-case text-xl">
          🇨🇳China-🇯🇵Japan Technological War{" "}
        </a>
      </div>
    </div>
  );
};
