import { useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";

import { AiFillHome } from "react-icons/ai";
import { GoSearch } from "react-icons/go";
import { TfiEmail, TfiPencil } from "react-icons/tfi";

function Layout() {
  const { user } = useContext(AuthContext);
  let iconSize = "30px";

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
      <div className="lg:hidden flex py-2 px-1 items-center justify-around fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full w-[90%] bg-white shadow-[0px_4px_30px_-5px_rgba(0,0,0,0.2)]">
        <Link to="/">
          <AiFillHome size={iconSize} color="#3e4fe5" />
        </Link>
        <button>
          <GoSearch size={iconSize} color="#908f94" />
        </button>
        <button className="flex items-center justify-center relative rounded-full -mt-6 -top-3 bg-[#3e4fe5] w-[70px] aspect-[1/1]">
          <TfiPencil size={iconSize} color="white" />
        </button>
        <button>
          <TfiEmail size={iconSize} color="#908f94" />
        </button>
        <button>
          <img
            src={
              user
                ? user.profileimg || "/assets/profile_placeholder.png"
                : "/assets/profile_placeholder.png"
            }
            width={iconSize}
            alt="profile placeholder"
            className="rounded-full aspect-square"
          />
        </button>
      </div>
    </div>
  );
}

export default Layout;
