import { useContext } from "react";
import dayjs from "dayjs";
import useAxios from "../utils/useAxios";
import qs from "qs";
import AuthContext from "../context/AuthContext";

function Comment({
  setComments,
  comment: { author, content, files, creation_time, id },
}) {
  const { user } = useContext(AuthContext);

  const api = useAxios();

  async function handleDelete() {
    await api.post(
      "deletecomment/",
      qs.stringify({
        commentid: id,
      })
    );

    setComments((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="flex items-start p-4">
      <img
        width={"50px"}
        src={author.profileimg}
        alt=""
        className="rounded-full object-cover mr-4 aspect-square"
      />
      <div className="w-full">
        <div className="flex justify-between">
          <span className="Gelion-Medium">{author.username}</span>
          <span className="text-base">
            {dayjs(creation_time).fromNow(true).replace("hours", "hs")}
          </span>
        </div>
        <p>{content}</p>
        {user.username === author.username && id && (
          <button onClick={handleDelete}>Delete</button>
        )}
      </div>
    </div>
  );
}

export default Comment;
