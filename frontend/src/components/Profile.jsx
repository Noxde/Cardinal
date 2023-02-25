import { useContext, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import instance from "../utils/Axios";
import useAxios from "../utils/useAxios";
import AuthContext from "../context/AuthContext";

import { AiFillHome } from "react-icons/ai";
import { GoSearch } from "react-icons/go";
import { TfiEmail, TfiPencil } from "react-icons/tfi";

import NotFound from "./NotFound";
import Loading from "./Loading";
import Post from "./Post";

import Posts from "../utils/posts";

function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const isLoggedProfile = user?.username !== userProfile?.username;

  const [posts, setPosts] = useState(Posts); // No posts from the backend yet
  const [isFollowed, setIsFollowed] = useState(false);

  const { username } = useParams();
  const api = useAxios();

  useEffect(() => {
    if (user && !username) {
      setUserProfile(user);
    }
  }, []);
  useEffect(() => {
    let oldTitle = document.title;

    document.title = `${userProfile?.username}'s Profile`;

    return () => {
      document.title = oldTitle;
    };
  }, [userProfile]);

  console.log(userProfile);

  const { isLoading, isError, error } = useQuery(
    "userProfile",
    () => instance.get(`/getpublicprofile/${username}/`),
    {
      enabled: !username && user ? false : true,
      retry: false,
      refetchOnWindowFocus: false,
      cacheTime: 1000,
      onSuccess: ({ data: userInfo }) => {
        setUserProfile(userInfo);
      },
    }
  );

  if (user === null && !username) {
    return <Navigate to={"/login"} />;
  }

  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    // Probably expired token, we delete it and send user to login again
    console.error(error.message);
    return <NotFound />; // Avoid empty profile showing up
  }
  let iconSize = "30px";

  return (
    <div className="flex flex-col bg-[#1d1d1d] min-h-screen text-[#3C3D44]">
      {/* banner image */}
      {isLoggedProfile ? (
        <img
          src={userProfile?.banner}
          alt=""
          className="h-64 w-full max-w-none object-cover -mb-6"
        />
      ) : (
        /**TODO:
         * Move upload image to profile settings
         */
        <>
          <label
            htmlFor="uploadBanner"
            className="relative w-full inset-0 cursor-pointer -mb-6"
          >
            <div className="absolute grid place-items-center inset-0 opacity-0 hover:opacity-100 bg-[rgba(0,0,0,0.5)]">
              <TfiPencil color="#c1c1c1" size={"25px"} />
            </div>
            <img
              src={userProfile?.banner}
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
               */

              reader.readAsDataURL(file);
              reader.onload = () => {
                setUserProfile({ ...userProfile, banner: reader.result });
                setUser({ ...userProfile, banner: reader.result });
                localStorage.setItem(
                  "user",
                  JSON.stringify({
                    ...userProfile,
                    banner: reader.result,
                  })
                );
              };
              await api.post(
                "/moduserinfo/",
                {
                  banner: file,
                },
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );
            }}
          />
        </>
      )}

      {/* Profile picture */}
      <div className="relative flex-1 bg-white rounded-t-[1.7rem] lg:rounded-none shadow-[0px_-50px_70px_0px_rgba(0,0,0,0.5)]">
        {isLoggedProfile ? (
          <img
            src={userProfile?.profileimg || "/assets/profile_placeholder.png"}
            width={"100px"}
            alt="Profile"
            className={`absolute object-cover left-1/2 aspect-square -translate-x-1/2 -top-12 bg-gray-200 border-4 border-white rounded-full
  `}
          />
        ) : (
          /**TODO:
           * Move upload image to profile settings
           */
          <>
            <label htmlFor="uploadProfile" className="cursor-pointer">
              <div className="grid place-items-center absolute w-[92px] cursor-pointer object-cover left-1/2 aspect-square -translate-x-1/2 -top-11 opacity-0 bg-[rgba(0,0,0,0.5)] hover:opacity-100 rounded-full z-40">
                <TfiPencil color="#c1c1c1" size={"25px"} />
              </div>
              <img
                src={
                  userProfile?.profileimg || "/assets/profile_placeholder.png"
                }
                width={"100px"}
                alt="Profile"
                className={`absolute object-cover left-1/2 aspect-square -translate-x-1/2 -top-12 bg-gray-200 border-4 border-white rounded-full
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
                reader.readAsDataURL(file);
                reader.onload = () => {
                  setUserProfile({ ...userProfile, profileimg: reader.result });
                  setUser({ ...userProfile, profileimg: reader.result });
                  localStorage.setItem(
                    "user",
                    JSON.stringify({
                      ...userProfile,
                      profileimg: reader.result,
                    })
                  );
                };
                await api.post(
                  "/moduserinfo/",
                  {
                    profileimg: file,
                  },
                  {
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  }
                );
              }}
            />
          </>
        )}

        <div className="pt-14 px-4 space-y-3">
          {/* username and follow button */}
          <div className="flex justify-between items-start">
            <span id="username" className="text-xl Gelion-Medium">
              {userProfile?.username}
            </span>
            {isLoggedProfile ? (
              <button
                onClick={() => setIsFollowed((prev) => !prev)}
                className="Gelion-Medium bg-[#4558ff] text-white px-6 py-1 rounded-full"
              >
                {isFollowed ? "Following" : "Follow"}
              </button>
            ) : (
              <button
                onClick={() => {
                  console.log("Edit profile");
                }}
                className="Gelion-Medium bg-[#4558ff] text-white px-6 py-1 rounded-full"
              >
                Edit profile
              </button>
            )}
          </div>

          <div className="info flex space-x-6">
            <div className="flex flex-col text-center justify-center">
              <span className="Gelion-Medium">{posts.length}</span>
              Posts
            </div>
            <div className="followers flex flex-col text-center justify-center">
              <span className="Gelion-Medium">
                {userProfile?.followers.length}
              </span>
              Followers
            </div>
            <div className="following flex flex-col text-center justify-center">
              <span className="Gelion-Medium">
                {userProfile?.following.length}
              </span>
              Following
            </div>
          </div>
          <p className="about">{userProfile?.about}</p>
        </div>
        <div className="selector flex justify-evenly my-4 py-4 border-y border-[#e6e6e6]">
          <button className="text-[#4558ff] Gelion-Medium">Posts</button>
          <button disabled className="opacity-80">
            Posts and replies
          </button>
          <button disabled className="opacity-80">
            Media
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
      {/* bottom nav */
      /**TODO:
       * Move out of profile component
       */}

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

export default Profile;
