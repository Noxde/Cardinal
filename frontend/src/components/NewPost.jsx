import { useContext, useState } from "react";
import { BiLeftArrowAlt } from "react-icons/bi";
import { BsImageFill } from "react-icons/bs";
import AuthContext from "../context/AuthContext";
import useAxios from "../utils/useAxios";
import Modal from "./Modal";
import Button from "../components/Button";

function NewPost({ setNewPost }) {
  const api = useAxios();

  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);

  const [imgPreview, setimgPreview] = useState(null);

  async function handlePost() {
    await api.post("/createpost/", post, {
      headers: {
        "content-type": "multipart/form-data",
      },
    });
    // Update amount of posts in localstorage
    user.post_amount += 1;
    window.localStorage.setItem("user", JSON.stringify(user));
    window.location.reload();
  }

  function handleTextArea(e) {
    e.target.style.height = "";
    e.target.style.height = e.target.scrollHeight + 3 + "px";

    setPost({
      ...post,
      content: e.target.value,
    });
  }

  function handleImagePreview(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setimgPreview(reader.result);
      setPost({ ...post, 0: file });
    };
  }

  return (
    <Modal setIsOpen={setNewPost}>
      <div className="flex flex-col p-4 ">
        <div className="flex items-start">
          <img
            className="rounded-full object-cover aspect-square mr-4"
            width={"50px"}
            src={user.profileimg || "/assets/profile_placeholder.png"}
            alt=""
          />
          <textarea
            className="w-full rounded-lg border-none focus:ring-0 resize-none"
            placeholder="What's happening?"
            maxLength="200"
            onInput={handleTextArea}
            rows={1}
            cols={35}
          />
        </div>
        {imgPreview && (
          <div className="max-h-[700px] w-fit max-w-[500px] rounded-xl overflow-hidden ml-[66px] mt-4">
            <img
              src={imgPreview}
              alt="post preview"
              className="object-cover object-center"
            />
          </div>
        )}
        <label
          className="w-fit ml-[66px] mt-2 cursor-pointer"
          htmlFor="uploadProfile"
        >
          <BsImageFill color="#4558ff" />
          <input
            type="file"
            id="uploadProfile"
            accept="image/*"
            className="hidden"
            onChange={handleImagePreview}
          />
        </label>
        <button
          className="ml-auto mt-2 bg-[#4558ff] text-white Gelion-Medium rounded-full px-4 py-1"
          onClick={handlePost}
          disabled={post?.content ? false : true}
        >
          Post
        </button>
        {/* <Button onClick={handlePost} value="Post" /> */}
      </div>
    </Modal>
  );
}

export default NewPost;
