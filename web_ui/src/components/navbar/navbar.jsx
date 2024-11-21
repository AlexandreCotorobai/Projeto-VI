import { Link } from "react-router-dom";

export const Navbar = (props) => {
  return (
    <div className="navbar bg-[#345d7e] rounded fixed z-[1] shadow-lg">
      <div className="flex-1 flex justify-between items-center text-white px-4 md:px-10">
        <div className="flex space-x-4 md:space-x-10">
          <Link
            to="/"
            className="text-xl hover:text-[#e63946] transition-colors duration-300"
          >
            Inovação
          </Link>
          <Link
            to="/invest"
            className="text-xl hover:text-[#e63946] transition-colors duration-300"
          >
            Investimento
          </Link>
          <Link
            to="/infra"
            className="text-xl hover:text-[#e63946] transition-colors duration-300"
          >
            Infraestrutura
          </Link>
        </div>
        <div className="text-center normal-case text-lg md:text-xl">
          <p className="font-bold text-white">🇨🇳 China - 🇯🇵 Japan</p>
          <p className="text-sm md:text-base text-[#ffffff99]">
            Guerra Tecnológica
          </p>
        </div>
      </div>
    </div>
  );
};
