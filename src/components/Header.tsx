import { NavLink, useNavigate } from "react-router";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-card py-3">
      <div className="container flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="cursor-pointer outline-none hover:outline-none focus:outline-none"
        >
          <h1 className="text-xl font-bold">ThePrimeShak</h1>
        </button>

        <nav>
          <ul className="flex items-center gap-4">
            <li>
              <NavLink to="/" className="font-medium">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className="font-medium">
                About
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
