import { useQuery } from "react-query";
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineRetweet,
  AiOutlineShareAlt,
} from "react-icons/ai";
import { BiLeftArrowAlt } from "react-icons/bi";
import { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import Comment from "./Comment";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import AuthContext from "../context/AuthContext";
import useAxios from "../utils/useAxios";
import qs from "qs";

dayjs.extend(relativeTime);

function Post({
  setPosts,
  post: {
    author,
    content,
    files,
    creation_time,
    id,
    likes,
    comment_amount,
    topcomment,
  },
}) {
  const api = useAxios();
  const { user } = useContext(AuthContext);
  const [like, setLike] = useState(
    likes.find((x) => x.username === user.username) ? true : false
  );
  const [likedBy, setLikedBy] = useState(likes);
  //Comments states
  const [comments, setComments] = useState([]);
  const [commentsAmount, setCommentsAmount] = useState(comment_amount);
  const [commentsModal, setCommentsModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const commentInputRef = useRef();

  // Focus text input when user opens the comments
  useEffect(() => {
    commentInputRef.current?.focus();
  }, [commentsModal]);

  const { isLoading, isError, error } = useQuery(
    "postComments",
    () => api.get(`getcomment/${id}/True`),
    {
      enabled: commentsModal,
      retry: false,
      refetchOnWindowFocus: false,
      cacheTime: 1000,
      onSuccess: ({ data: postComments }) => {
        console.log(postComments);
        if (postComments.length) setComments(postComments);
      },
    }
  );

  async function addComment() {
    if (!newComment.trim()) return;

    await api.post(
      "createcomment/",
      qs.stringify({
        content: newComment,
        postid: id,
      })
    );
    setComments((prev) => [
      {
        author: {
          username: user.username,
          profileimg: user.profileimg,
        },
        content: newComment,
        creation_time: Date.now(),
        files: null,
      },
      ...prev,
    ]);
    setCommentsAmount((prev) => prev + 1);
    setNewComment("");
  }

  async function handleDelete() {
    await api.post("/delete/", {
      id,
    });

    setPosts((prev) => prev.filter((x) => x.id !== id));
    // window.location.reload();
  }

  return (
    <>
      {commentsModal && (
        <div
          className="fixed inset-0 w-full bg-[#0d162acd] z-50"
          onKeyDown={(e) => (e.code === "Enter" ? addComment() : null)}
        >
          <div className="absolute translate-x-0 z-[999] h-3/4 max-w-[500px] overflow-auto bg-white top-0 left-2 right-2 bottom-0 m-auto rounded-xl">
            <div className="sticky flex items-center top-0 bg-white p-4 text-xl Gelion-Medium">
              <button
                onClick={() => {
                  document.body.style.overflow = "auto";
                  setCommentsModal(false);
                }}
              >
                <BiLeftArrowAlt size={"30px"} color="#3c3d44" />
              </button>
              Comments
            </div>
            <div
              className={`comments min-h-[calc(100%-102px)] ${
                !comments.length
                  ? "flex items-center justify-center min-h-[calc(100%-102px)]"
                  : ""
              }`}
            >
              {comments.length ? (
                comments.map((comment) => (
                  <Comment
                    comment={comment}
                    key={comment.id || Date.now() + Math.random()}
                    setComments={setComments}
                  />
                ))
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-3xl">No comments</div>
                </div>
              )}
            </div>
            <div className="sticky bg-white flex items-center bottom-0">
              <input
                type="text"
                ref={commentInputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full border-none focus:ring-0"
              />
              <button onClick={addComment} className="mr-3 Gelion-Medium">
                Post
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-start p-4 last:border-none border-b-2 border-[#dcdcdc]">
        <Link to={`/profile/${author.username}`}>
          <img
            src={author.profileimg || "/assets/profile_placeholder.png"}
            className="rounded-full aspect-square object-cover mr-6"
            width={"50px"}
            alt=""
          />
        </Link>
        <div className="post-body w-full">
          <div className="top flex justify-between mb-4">
            <span className="post-author Gelion-Medium">
              <Link to={`/profile/${author.username}`}>{author.username}</Link>
            </span>
            <span className="timestamp">
              {dayjs(creation_time).fromNow(true).replace("hours", "hs")}
            </span>
          </div>
          <div className="content">
            {content}
            <div className="attachment mt-4 rounded-2xl overflow-hidden max-w-[500px] max-h-[700px]">
              <img
                className="w-full max-h-[700px] object-cover object-center"
                src={files ? files[0] : ""}
                alt=""
              />
            </div>
          </div>
          <div className="actions flex w-full mt-4">
            <button
              onClick={async () => {
                await api.post(`likes/post/${like ? "remove" : "add"}/${id}/`);
                setLikedBy((prev) =>
                  like
                    ? prev.filter((x) => x.username !== user.username)
                    : [...prev, user]
                );
                setLike((prev) => !prev);
              }}
            >
              <div className="relative flex items-center">
                {like ? (
                  <AiFillHeart color="#ff6a81" size="25px" />
                ) : (
                  <AiOutlineHeart size="25px" />
                )}
                <span className="Gelion-Medium text-sm ml-2">
                  {likedBy.length}
                </span>
              </div>
            </button>
            <button className="ml-4">
              <AiOutlineRetweet size="25px" />
            </button>
            <button className="ml-4">
              <AiOutlineShareAlt size="25px" />
            </button>
            {user.username === author.username && (
              <button className="ml-4" onClick={handleDelete}>
                delete
              </button>
            )}

            <button
              onClick={() => {
                document.body.style.overflow = "hidden";

                setCommentsModal(true);
              }}
              className="ml-auto"
            >
              {commentsAmount} comments
            </button>
          </div>
          {/* placeholder */}
          {topcomment && (
            <div className="featured mt-2">
              <Comment comment={topcomment} setComments={setComments} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Post;
