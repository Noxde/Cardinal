import { useState } from "react";
import { TfiPencil } from "react-icons/tfi";
import useAxios from "../../utils/useAxios";
import Modal from "../../components/Modal";
import imageCompression from "browser-image-compression";

function EditProfile({ user, setUser, setEditProfile }) {
  const api = useAxios();
  const [newProfile, setNewProfile] = useState({});
  const [preview, setPreview] = useState({
    profileimg: user.profileimg || "/assets/profile_placeholder.png",
    banner: user.banner,
    about: user.about,
  });
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (newProfile.about === "") newProfile.about = " ";
    await api.post("/moduserinfo/", newProfile, {
      headers: {
        "content-type": "multipart/form-data",
      },
    });

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...user,
        about: preview.about,
        profileimg: preview.profileimg,
        banner: preview.banner,
      })
    );
    setUser({
      ...user,
      about: preview.about,
      profileimg: preview.profileimg,
      banner: preview.banner,
    });
    setEditProfile(false);
    document.body.style.overflow = "auto";
  }

  async function handlePreview(e) {
    const isBanner = e.target.id.includes("Banner");
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      const fileSize = file.size / 1024 / 1024;
      if (fileSize > 3) return;
      imageCompression(file, {
        onProgress: (progress) => {
          console.log(`Current progress is: ${progress}`);
        },
      }).then((compressed) => {
        if (isBanner) {
          setNewProfile((prev) => ({ ...prev, banner: compressed }));
          setPreview((prev) => ({ ...prev, banner: reader.result }));
        } else {
          setNewProfile((prev) => ({ ...prev, profileimg: compressed }));
          setPreview((prev) => ({ ...prev, profileimg: reader.result }));
        }
      });
    };
  }

  return (
    <Modal
      label="Edit Profile"
      confirmLabel="Save"
      confirmClick={handleSave}
      setIsOpen={setEditProfile}
    >
      {/* Content */}
      <label htmlFor="uploadBanner" className="relative block cursor-pointer">
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
        onChange={handlePreview}
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
        onChange={handlePreview}
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
    </Modal>
  );
}

export default EditProfile;
