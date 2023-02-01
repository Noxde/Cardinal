import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";

import { AiFillHome } from "react-icons/ai";
import { GoSearch } from "react-icons/go";
import { TfiEmail, TfiPencil } from "react-icons/tfi";

import Post from "./Post";
import Posts from "../utils/posts";

function Home() {
  let { user, logoutUser } = useContext(AuthContext);
  const [posts, setPosts] = useState(Posts);
  const [isFollowed, setIsFollowed] = useState(false);
  let iconSize = "30px";

  return (
    <div className="flex flex-col bg-[#1d1d1d] min-h-screen text-[#3C3D44]">
      {/* banner image */}
      <div
        className={`h-64 max-w-none -mb-6 bg-[url("")] bg-no-repeat bg-cover bg-center`}
      ></div>
      <div className="relative flex-1 bg-white rounded-t-[1.7rem] shadow-[0px_-50px_70px_0px_rgba(0,0,0,0.5)]">
        <img
          src="/assets/profile_placeholder.png"
          width={"100px"}
          alt="Profile"
          className={`absolute object-cover left-1/2 aspect-square -translate-x-1/2 -top-12 bg-gray-200 border-4 border-white rounded-full`}
        />

        <div className="pt-14 px-4 space-y-3">
          {/* username and follow button */}
          <div className="flex justify-between items-start">
            <span id="username" className="text-xl Gelion-Medium">
              Username
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
          <p className="about">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maiores
            officia doloribus fuga sapiente ratione velit expedita corporis,
            perspiciatis veniam asperiores aperiam nobis iure magni debitis
            aliquid quia odit nostrum dolores.
          </p>
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
      <div className="flex py-2 px-1 items-center justify-around fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full w-[90%] bg-white shadow-[0px_4px_30px_-5px_rgba(0,0,0,0.2)]">
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
            src="/assets/profile_placeholder.png"
            width={iconSize}
            alt="profile placeholder"
            className="rounded-full"
          />
        </button>
      </div>
    </div>
  );
}

export default Home;
