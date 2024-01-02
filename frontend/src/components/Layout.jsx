import { useContext, useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import MobileMenu from "./MobileMenu";
import AuthContext from "../context/AuthContext";
import NewPost from "./NewPost";

import { AiFillHome } from "react-icons/ai";
import { GoSearch } from "react-icons/go";
import { CgProfile } from "react-icons/cg";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { TfiEmail, TfiPencil } from "react-icons/tfi";
import { MdLogout, MdSettings } from "react-icons/md";

function Layout() {
  const { user, logoutUser } = useContext(AuthContext);
  const [newPost, setNewPost] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
      className="lg:grid grid-cols-[2fr,5fr,2.5fr] lg:max-w-[1900px] lg:mx-auto"
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
            <ul className="space-y-4">
              <li>
                <Link to={"/"}>
                  <AiFillHome className="inline mr-4" size={"25px"} />
                  Home
                </Link>
              </li>
              {user && (
                <>
                  <li>
                    <Link>
                      <TfiEmail className="inline mr-4" size={"25px"} />
                      Messages
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile">
                      <CgProfile className="inline mr-4" size={"25px"} />
                      Profile
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link>
                  <HiEllipsisHorizontal className="inline mr-4" size={"25px"} />
                  More
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
          <AiFillHome size={iconSize} color="#3e4fe5" />
        </Link>
        <button>
          <GoSearch size={iconSize} color="#908f94" />
        </button>

        <button
          onClick={
            user ? handlePost : () => (window.location.pathname = "login")
          }
          className="flex items-center justify-center relative rounded-full -mt-6 -top-3 bg-[#3e4fe5] w-[70px] aspect-[1/1]"
        >
          <TfiPencil size={iconSize} color="white" />
        </button>
        <button>
          <TfiEmail size={iconSize} color="#908f94" />
        </button>
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
