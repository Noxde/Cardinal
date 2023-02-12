import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import instance from "../utils/Axios";
import AuthContext from "../context/AuthContext";

import { AiFillHome } from "react-icons/ai";
import { GoSearch } from "react-icons/go";
import { TfiEmail, TfiPencil } from "react-icons/tfi";

import Loading from "./Loading";
import Post from "./Post";

import Posts from "../utils/posts";

function Home() {
  let { getUserInfo, modUserInfo } = useContext(AuthContext);
  const [posts, setPosts] = useState(Posts); // No posts from the backend yet
  const [isFollowed, setIsFollowed] = useState(false);
  const [about, setAbout] = useState("");
  const [username, setUsername] = useState("");
  const [banner, setBanner] = useState("");
  const [profileimg, setProfileimg] = useState(
    "/assets/profile_placeholder.png"
  );

  const { isLoading, isError, error } = useQuery("userProfile", getUserInfo, {
    retry: false,
    refetchOnWindowFocus: false,
    onSuccess: (userInfo) => {
      setProfileimg((prev) =>
        userInfo?.profileimg ? `${userInfo?.profileimg}` : prev
      );
      setAbout(userInfo?.about);
      setUsername(userInfo?.username);
      setBanner(userInfo?.banner);
    },
  });

  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    // Probably expired token, we delete it and send user to login again
    console.error(error.message);
    localStorage.removeItem("authTokens");
    window.location.pathname = "/login";
    return <Loading />; // Avoid empty profile showing up
  }
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
                <li>
                  <Link>Messages</Link>
                </li>
                <li>
                  <Link>Profile</Link>
                </li>
                <li>
                  <Link>More</Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-[#1d1d1d] min-h-screen text-[#3C3D44]">
        {/* banner image */}
        <label
          htmlFor="uploadBanner"
          className="relative w-full inset-0 cursor-pointer -mb-6"
        >
          <div className="absolute grid place-items-center inset-0 opacity-0 hover:opacity-100 bg-[rgba(0,0,0,0.5)]">
            <TfiPencil color="#c1c1c1" size={"25px"} />
          </div>
          <img
            src={banner}
            alt=""
            className="h-64 w-full max-w-none object-cover"
          />
        </label>

        <input
          type="file"
          id="uploadBanner"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            /**TODO:
             * Handle error, move to authcontext
             *  */
            reader.readAsDataURL(file);
            await modUserInfo({ banner: file });
            window.location.reload();
          }}
        />

        {/*  */}
        <div className="relative flex-1 bg-white rounded-t-[1.7rem] lg:rounded-none shadow-[0px_-50px_70px_0px_rgba(0,0,0,0.5)]">
          <label htmlFor="uploadProfile">
            <div className="grid place-items-center absolute w-[92px] cursor-pointer object-cover left-1/2 aspect-square -translate-x-1/2 -top-11 opacity-0 bg-[rgba(0,0,0,0.5)] hover:opacity-100 rounded-full z-40">
              <TfiPencil color="#c1c1c1" size={"25px"} />
            </div>
            <img
              src={profileimg}
              width={"100px"}
              alt="Profile"
              className={`absolute cursor-pointer object-cover left-1/2 aspect-square -translate-x-1/2 -top-12 bg-gray-200 border-4 border-white rounded-full
            `}
            />
          </label>

          <input
            type="file"
            id="uploadProfile"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files[0];
              const reader = new FileReader();
              /**TODO:
               * Handle error, move to authcontext
               *  */
              reader.readAsDataURL(file);
              await modUserInfo({ profileimg: file });
              window.location.reload();
            }}
          />

          <div className="pt-14 px-4 space-y-3">
            {/* username and follow button */}
            <div className="flex justify-between items-start">
              <span id="username" className="text-xl Gelion-Medium">
                {username}
              </span>
              <button
                onClick={() => setIsFollowed((prev) => !prev)}
                className="Gelion-Medium bg-[#4558ff] text-white px-6 py-1 rounded-full"
              >
                {isFollowed ? "Following" : "Follow"}
              </button>
            </div>

            <div className="info flex space-x-6">
              <div className="flex flex-col text-center justify-center">
                <span className="Gelion-Medium">{posts.length}</span>
                Posts
              </div>
              <div className="followers flex flex-col text-center justify-center">
                <span className="Gelion-Medium">{isFollowed ? 1 : 0}</span>
                Followers
              </div>
              <div className="following flex flex-col text-center justify-center">
                <span className="Gelion-Medium">0</span>
                Following
              </div>
            </div>
            <p className="about">{about}</p>
          </div>
          <div className="selector flex justify-evenly my-4 py-4 border-y border-[#e6e6e6]">
            <button className="text-[#4558ff] Gelion-Medium">Posts</button>
            <button disabled className="opacity-80">
              Posts and replies
            </button>
            <button disabled className="opacity-80">
              Medias
            </button>
            <button disabled className="opacity-80">
              Like
            </button>
          </div>
          {/* all posts go here */}
          {posts.length ? (
            <div className="posts pb-28">
              {posts.map((post) => (
                <Post
                  key={Math.random()}
                  author={post.author}
                  content={post.content}
                  attachment={post.attachment}
                />
              ))}
            </div>
          ) : (
            <div className="text-center bg-white Gelion-Medium">
              <p>There aren't any posts to show here</p>
            </div>
          )}
        </div>
        {/* bottom nav */}
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
              src={profileimg}
              width={iconSize}
              alt="profile placeholder"
              className="rounded-full aspect-square"
            />
          </button>
        </div>
      </div>
      <div className="hidden lg:block h-full bg-white border-l border-[#e6e6e6] z-30"></div>
    </div>
  );
}

export default Home;
