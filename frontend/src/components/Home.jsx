import { useContext, useEffect, useState } from "react";
import { useQuery, useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";
import useAxios from "../utils/useAxios";
import AuthContext from "../context/AuthContext";

import Post from "./Post";

// import Posts from "../utils/posts";

function Home() {
  const api = useAxios();
  const { user, setUser, logoutUser } = useContext(AuthContext);
  const [isIncomplete, setIsIncomplete] = useState(true);
  const [posts, setPosts] = useState([]); // No posts from the backend yet

  const { isLoading, isError, error } = useQuery(
    "userFeed",
    () => api.get(`getpost/feed/${user.username}/True/`),
    {
      enabled: user?.username ? true : false,
      retry: false,
      refetchOnWindowFocus: false,
      cacheTime: 1000,
      onSuccess: ({ data: feedPosts }) => {
        if (feedPosts) setPosts(feedPosts);
      },
    }
  );

  const [ref, inView, entry] = useInView({
    root: null,
    rootMargin: "150px",
    threshold: 0,
  });

  useEffect(() => {
    async function fetchMore() {
      if (!inView || !isIncomplete) return;

      const res = await api
        .get(`getpost/feed/${user.username}/False/`)
        .catch((err) => {
          return setIsIncomplete(false);
        });

      if (res?.data.length) {
        setPosts((prev) => [...prev, ...res.data]);
      }
    }
    fetchMore();
  }, [inView]);

  return (
    <div className="flex flex-col bg-[#1d1d1d] min-h-screen text-[#3C3D44]">
      {/* banner image */}

      {/* <div className="bg-cyan-400 h-64 -mb-6 lg:mb-0">
        <button onClick={logoutUser}>Logout</button>
      </div> */}

      {/* Profile picture */}
      <div className="relative flex-1 bg-white rounded-t-[1.7rem] lg:rounded-none ">
        {/* shadow-[0px_-50px_70px_0px_rgba(0,0,0,0.5)] */}
        {/* <div className="selector flex justify-evenly my-4 py-4 border-y border-[#e6e6e6]">
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
        </div> */}
        {/* all posts go here */}
        {posts.length && user ? (
          <div className="posts mb-28">
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
  );
}

export default Home;
