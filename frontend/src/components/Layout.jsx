import { useContext, useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import MobileMenu from "./MobileMenu";
import AuthContext from "../context/AuthContext";
import NewPost from "./NewPost";

import {
  FiHome,
  FiMessageSquare,
  FiUser,
  FiSettings,
  FiSearch,
  FiEdit,
} from "react-icons/fi";
import { MdLogout } from "react-icons/md";

function Layout() {
  const { user, logoutUser } = useContext(AuthContext);
  const [newPost, setNewPost] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  let iconSize = "30px";

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  function handlePost() {
    setNewPost(true);
    document.body.style.overflow = "hidden";
  }

  return (
    <div
      className={`lg:grid ${
        location.pathname.includes("messages")
          ? "grid-cols-[2fr,7.5fr]"
          : "grid-cols-[2fr,5fr,2.5fr]"
      } lg:max-w-[1900px] lg:mx-auto`}
      onClick={({ target }) => {
        if (target.classList.contains("mobileProfile")) {
          setMobileOpen((e) => !e);
        } else {
          setMobileOpen(false);
        }
      }}
    >
      <div className="hidden lg:flex justify-center h-full bg-white border-r border-[#e6e6e6] z-10">
        <div className="sticky flex flex-col h-screen p-10 pr-5 top-0 flex-1">
          <img src="/logo.svg" width={"50px"} />
          <nav className="text-2xl Gelion-Medium mt-10">
            <ul className="space-y-4 dark-blue">
              <li>
                <Link to={"/"}>
                  <FiHome className="inline mr-4" size={"25px"} />
                  Home
                </Link>
              </li>
              {user && (
                <>
                  <li>
                    <Link to={"/messages"}>
                      <FiMessageSquare className="inline mr-4" size={"25px"} />
                      Messages
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile">
                      <FiUser className="inline mr-4" size={"25px"} />
                      Profile
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link>
                  <FiSettings className="inline mr-4" size={"25px"} />
                  Settings
                </Link>
              </li>
              {user && (
                <li>
                  <button
                    onClick={handlePost}
                    className="bg-[#4558ff] text-white py-2 rounded-full w-full"
                  >
                    Post
                  </button>
                </li>
              )}
            </ul>
          </nav>
          <div className="spacer flex-1"></div>
          {user && (
            <button
              onClick={() => {
                logoutUser();
              }}
              className="flex items-center hover:bg-gray-100 px-4 py-[0.5rem] rounded-full transition-all "
            >
              <img
                src={user.profileimg || "/assets/profile_placeholder.png"}
                width="40px"
                alt=""
                className="rounded-full object-cover mr-4 aspect-square"
              />
              <span className="Gelion-Medium">{user.username}</span>

              <MdLogout className="ml-2" size="20px" color="#C11212" />
            </button>
          )}
        </div>
      </div>
      {newPost && <NewPost setNewPost={setNewPost} />}
      <Outlet />
      <div className="hidden lg:block h-full bg-white border-l border-[#e6e6e6] z-30"></div>
      <div className="lg:hidden flex py-2 px-1 items-center justify-around fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full w-[90%] bg-white shadow-[0px_4px_30px_-5px_rgba(0,0,0,0.2)]">
        <Link to="/">
          <FiHome size={iconSize} color="#3e4fe5" />
        </Link>
        <button>
          <FiSearch size={iconSize} color="#908f94" />
        </button>

        <button
          onClick={
            user ? handlePost : () => (window.location.pathname = "login")
          }
          className="flex items-center justify-center relative rounded-full -mt-6 -top-3 bg-[#3e4fe5] w-[70px] aspect-[1/1]"
        >
          <FiEdit size={iconSize} color="white" />
        </button>
        <Link to={"/messages"}>
          <FiMessageSquare size={iconSize} color="#908f94" />
        </Link>
        <div className="relative">
          <MobileMenu isOpen={mobileOpen} />
          <img
            src={user?.profileimg || "/assets/profile_placeholder.png"}
            width={iconSize}
            alt="profile placeholder"
            className="mobileProfile rounded-full object-cover aspect-square"
          />
        </div>
      </div>
    </div>
  );
}

export default Layout;
