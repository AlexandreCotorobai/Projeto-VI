import { Link } from "react-router-dom";

export const Navbar = (props) => {
  return (
    <div className="navbar bg-blue-500 rounded fixed z-[1]">
      <div className="flex-1 flex justify-between items-center text-white">
        <div className="flex space-x-10">
          <Link to="/" className="text-xl ml-8">
            Inovação
          </Link>
          <Link to="/invest" className="text-xl">
            Investimento
          </Link>
          <Link to="/infra" className="text-xl">
            Infraestrutura
          </Link>
        </div>
        <div className="normal-case text-xl mr-10">
          <p>🇨🇳China-🇯🇵Japan</p>
          <p>Guerra Tecnológica</p>
        </div>
      </div>
    </div>
  );
};
