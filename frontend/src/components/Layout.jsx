import { useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function Layout() {
  const { user } = useContext(AuthContext);

  return (
    <div className="lg:grid grid-cols-[1.5fr,5fr,2.5fr] lg:max-w-[1900px] lg:mx-auto">
      <div className="hidden lg:flex justify-center h-full bg-white border-r border-[#e6e6e6] z-10">
        <div>
          <div className="sticky top-10 h-40">
            <img src="/logo.svg" width={"70px"} />
            <nav className="text-2xl Gelion-Medium mt-10">
              <ul className="space-y-4">
                <li>
                  <Link to={"/"}>Home</Link>
                </li>
                {user && (
                  <>
                    <li>
                      <Link>Messages</Link>
                    </li>
                    <li>
                      <Link to="/profile">Profile</Link>
                    </li>
                  </>
                )}
                <li>
                  <Link>More</Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <Outlet />
      <div className="hidden lg:block h-full bg-white border-l border-[#e6e6e6] z-30"></div>
    </div>
  );
}

export default Layout;
