import { useContext, useState } from "react";
import useAxios from "../../utils/useAxios";
import AuthContext from "../../context/AuthContext";
import Button from "../../components/Button";
import qs from "qs";

// setIsFollowed,  isFollowed
function FollowButton({
  setUserProfile,
  userProfile,
  setIsFollowed,
  isFollowed,
  username,
  setEditProfile,
}) {
  const api = useAxios();
  const { user, setUser } = useContext(AuthContext);
  const isLoggedProfile = user?.username === userProfile?.username;
  const [loading, setLoading] = useState(false);

  async function handleFollow() {
    setLoading(true);
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
    setLoading(false);
  }

  function handleEdit() {
    document.body.style.overflow = "hidden";
    setEditProfile(true);
  }

  return (
    <Button
      onClick={isLoggedProfile ? handleEdit : handleFollow}
      className="Gelion-Medium bg-[#4558ff] text-white px-6 py-1 rounded-full"
      value={
        isLoggedProfile
          ? "Edit Profile"
          : loading
          ? "Loading"
          : isFollowed
          ? "Following"
          : "Follow"
      }
    />
  );
}

export default FollowButton;
