import { useContext, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import instance from "../utils/Axios";
import useAxios from "../utils/useAxios";
import AuthContext from "../context/AuthContext";
import { useInView } from "react-intersection-observer";

import qs from "qs";

import NotFound from "./NotFound";
import Loading from "./Loading";
import Post from "./Post";

// import Posts from "../utils/posts";
import EditProfile from "./EditProfile";

function Profile() {
  const api = useAxios();
  const { user, setUser } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const [editProfile, setEditProfile] = useState(false);
  const [isIncomplete, setIsIncomplete] = useState(true);
  const isLoggedProfile = user?.username !== userProfile?.username;

  const [posts, setPosts] = useState([]); // No posts from the backend yet
  const [isFollowed, setIsFollowed] = useState(false);

  const { username } = useParams();

  useEffect(() => {
    if (user && !username) {
      setUserProfile(user);
    }
  }, []);
  useEffect(() => {
    let oldTitle = document.title;

    document.title = `${userProfile?.username}'s Profile / Proyectito`;

    return () => {
      document.title = oldTitle;
    };
  }, [userProfile]);

  const [ref, inView, entry] = useInView({
    root: null,
    rootMargin: "150px",
    threshold: 0,
  });

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
        setIsFollowed(
          userInfo.followers.find((x) => x.username === user.username)
            ? true
            : false
        );
      },
    }
  );

  // Get user posts
  const { postsLoading, postsIsError, postsError } = useQuery(
    "userPosts",
    () => api.get(`getpost/profile/${username || user.username}/True/`),
    {
      enabled: (!username && user) || (username && user) ? true : false,
      retry: false,
      refetchOnWindowFocus: false,
      cacheTime: 1000,
      onSuccess: ({ data: userPosts }) => {
        setPosts(Object.entries(userPosts).map((x) => x[1]));
      },
    }
  );
  // Infinite scroll
  useEffect(() => {
    async function fetchMore() {
      if (!inView || !isIncomplete) return;

      const res = await api
        .get(`getpost/profile/${username || user.username}/False/`)
        .catch((err) => {
          return setIsIncomplete(false);
        });

      if (res?.data) {
        setPosts((prev) => [
          ...prev,
          ...Object.entries(res.data).map((x) => x[1]),
        ]);
      }
    }
    fetchMore();
  }, [inView]);

  if (user === null && !username) {
    return <Navigate to={"/login"} />;
  }

  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    console.error(error.message);
    return <NotFound />; // TODO: change for profile not found component
  }

  return (
    <>
      {editProfile && (
        <EditProfile
          setUser={setUser}
          user={user}
          setEditProfile={setEditProfile}
        />
      )}
      <div className="flex flex-col bg-[#1d1d1d] min-h-screen text-[#3C3D44]">
        {/* banner image */}

        <img
          src={userProfile?.banner}
          alt=""
          className="h-64 w-full max-w-none object-cover -mb-6 lg:mb-0"
        />

        {/* Profile picture */}
        <div className="relative flex-1 bg-white rounded-t-[1.7rem] lg:rounded-none shadow-[0px_-50px_70px_0px_rgba(0,0,0,0.5)]">
          <img
            src={userProfile?.profileimg || "/assets/profile_placeholder.png"}
            width={"100px"}
            alt="Profile"
            className={`absolute object-cover left-1/2 aspect-square -translate-x-1/2 -top-12 bg-gray-200 border-4 border-white rounded-full
  `}
          />

          <div className="pt-14 px-4 space-y-3">
            {/* username and follow button */}
            <div className="flex justify-between items-start">
              <span id="username" className="text-xl Gelion-Medium">
                {userProfile?.username}
              </span>
              {isLoggedProfile ? (
                <button
                  onClick={async () => {
                    await api.post(
                      "follows/",
                      qs.stringify({
                        action: isFollowed ? "remove" : "add",
                        usernames: username,
                      })
                    );
                    //Update states
                    setIsFollowed((prev) => !prev);
                    setUserProfile({
                      ...userProfile,
                      followers: isFollowed
                        ? userProfile.followers.filter(
                            (x) =>
                              x.username !== user.username && // removes client from followers
                              x !== user.username
                          )
                        : [...userProfile.followers, user.username],
                    });

                    setUser({
                      ...user,
                      following: isFollowed
                        ? user.following.filter(
                            (x) =>
                              x.username !== userProfile.username && // removes user from following
                              x !== userProfile.username
                          )
                        : [...user.following, username],
                    });
                  }}
                  className="Gelion-Medium bg-[#4558ff] text-white px-6 py-1 rounded-full"
                >
                  {isFollowed ? "Following" : "Follow"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    document.body.style.overflow = "hidden";
                    setEditProfile(true);
                  }}
                  className="Gelion-Medium bg-[#4558ff] text-white px-6 py-1 rounded-full"
                >
                  Edit profile
                </button>
              )}
            </div>

            <div className="info flex space-x-6">
              <div className="flex flex-col text-center justify-center">
                <span className="Gelion-Medium">
                  {userProfile?.post_amount}
                </span>
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
                <Post setPosts={setPosts} key={post.id} post={post} />
              ))}
              <div ref={ref} className="h-0 w-0"></div>
            </div>
          ) : (
            <div className="text-center bg-white Gelion-Medium">
              <p>There aren't any posts to show here</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Profile;
