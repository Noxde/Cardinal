import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineRetweet,
  AiOutlineShareAlt,
} from "react-icons/ai";
import { BiLeftArrowAlt } from "react-icons/bi";
import { useState, useEffect, useRef } from "react";
import Comment from "./Comment";

function Post({ author, content, attachment }) {
  const [like, setLike] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsModal, setCommentsModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [amountOfComment, setAmountOfComment] = useState(0);
  const commentInputRef = useRef();

  // Focus text input when user opens the comments
  useEffect(() => {
    commentInputRef.current?.focus();
  }, [commentsModal]);

  function addComment() {
    if (!newComment) return;
    setComments((prev) => [...prev, newComment]);
    setAmountOfComment((prev) => prev + 1);
    setNewComment("");
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
                comments.map((comment, i) => (
                  <Comment
                    author={{
                      username: "Noxde",
                      profilePicture: "/assets/profile_placeholder.png",
                    }}
                    content={comment}
                    key={i}
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
        <img
          src={author.profilePicture}
          className="rounded-full object-cover mr-6"
          width={"50px"}
          alt=""
        />
        <div className="post-body">
          <div className="top flex justify-between mb-4">
            <span className="post-author Gelion-Medium">Noxde</span>
            <span className="timestamp">15min</span>
          </div>
          <div className="content">
            {content}
            <div className="attachment mt-4 rounded-2xl overflow-hidden max-w-[500px]">
              <img className="w-full" src={attachment} alt="" />
            </div>
          </div>
          <div className="actions flex w-full mt-4">
            <button onClick={() => setLike((prev) => !prev)}>
              {like ? (
                <AiFillHeart color="#ff6a81" size="25px" />
              ) : (
                <AiOutlineHeart size="25px" />
              )}
            </button>
            <button className="ml-4">
              <AiOutlineRetweet size="25px" />
            </button>
            <button className="ml-4">
              <AiOutlineShareAlt size="25px" />
            </button>
            <button
              onClick={() => {
                document.body.style.overflow = "hidden";

                setCommentsModal(true);
              }}
              className="ml-auto"
            >
              {amountOfComment} comments
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Post;
