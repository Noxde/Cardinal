import { useState } from "react";
import { BiLeftArrowAlt } from "react-icons/bi";
import { TfiPencil } from "react-icons/tfi";
import useAxios from "../utils/useAxios";

function EditProfile({ user, setUser, setEditProfile }) {
  const api = useAxios();
  const [newProfile, setNewProfile] = useState({});
  const [preview, setPreview] = useState({
    profileimg: user.profileimg || "/assets/profile_placeholder.png",
    banner: user.banner,
    about: user.about,
  });

  return (
    <div className="fixed inset-0 sm:bg-[#0d162acd] bg-white z-50 p-4">
      <div className="absolute w-full sm:w-auto left-1/2 -translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 bg-white rounded-xl overflow-y-scroll">
        {/* Header */}
        <div className="sticky top-0 flex items-center text-xl Gelion-Medium border-b bg-white text-[#3c3d44] p-4 z-50">
          <button
            onClick={() => {
              document.body.style.overflow = "auto";
              setEditProfile(false);
            }}
          >
            <BiLeftArrowAlt size={"30px"} color="#3c3d44" />
          </button>
          Edit Profile
          <button
            onClick={async () => {
              if (newProfile.about === "") newProfile.about = " ";
              await api.post("/moduserinfo/", newProfile, {
                headers: {
                  "content-type": "multipart/form-data",
                },
              });
              const { data } = await api.get("/getuserinfo/");
              localStorage.setItem(
                "user",
                JSON.stringify({ ...user, ...data })
              );
              console.log(data);
              setUser(data);
              setEditProfile(false);
              window.location.reload();
            }}
            className="ml-auto mr-2"
          >
            Save
          </button>
        </div>
        {/* Content */}
        <div>
          <label
            htmlFor="uploadBanner"
            className="relative block cursor-pointer"
          >
            <div className="absolute grid place-items-center inset-0 opacity-0 hover:opacity-100 bg-[rgba(0,0,0,0.5)]">
              <TfiPencil color="#c1c1c1" size={"25px"} />
            </div>
            <div
              className="h-64 w-full aspect-video"
              style={{
                backgroundImage: `url(${preview.banner})`,
                backgroundSize: "cover",
                backgroundPosition: "center center",
              }}
            ></div>
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
                setNewProfile({ ...newProfile, banner: file });
                setPreview({ ...preview, banner: reader.result });
              };
            }}
          />
          <label
            htmlFor="uploadProfile"
            className="relative w-[100px] block cursor-pointer -mt-12 mx-auto z-50"
          >
            <div className="absolute grid place-items-center cursor-pointer inset-1 opacity-0 bg-[rgba(0,0,0,0.5)] hover:opacity-100 rounded-full z-40">
              <TfiPencil color="#c1c1c1" size={"25px"} />
            </div>
            <img
              src={preview.profileimg}
              width={"100px"}
              alt="Profile"
              className={`object-cover aspect-square bg-gray-200 border-4 border-white rounded-full
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
                setNewProfile({ ...newProfile, profileimg: file });
                setPreview({ ...preview, profileimg: reader.result });
              };
            }}
          />

          <div className="flex flex-col space-y-4 p-4">
            <div>
              <label className="block" htmlFor="about">
                About
              </label>
              <textarea
                className="w-full rounded-lg border-[#9C9D9F] resize-none"
                value={preview.about}
                maxLength="100"
                rows={3}
                onChange={(e) => {
                  console.log(e.target.value);
                  setNewProfile({ ...newProfile, about: e.target.value });
                  setPreview({ ...preview, about: e.target.value });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
