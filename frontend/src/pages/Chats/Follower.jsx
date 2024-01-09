import useAxios from "../../utils/useAxios";

function Follower({
  username,
  profilePicture,
  about,
  setShowFollowers,
  setOpenChat,
  disabled,
}) {
  const api = useAxios();

  async function handleClick() {
    const { data } = await api.post(`/createchat/${username}/`);

    if (data.status !== "Chat already exists.") {
      // Fix, shouldn't have to do this i guess but it doesn't crash here now
      setOpenChat(data);
    }
    setShowFollowers(false);
  }

  return (
    <div
      onClick={disabled ? null : handleClick}
      className={`flex p-4 ${disabled ? "opacity-50" : "cursor-pointer"}`}
    >
      <img
        src={profilePicture}
        width={"40px"}
        className="rounded-full aspect-square object-cover mr-4"
        alt=""
      />
      <span className="Gelion-Regular dark-blue">{username}</span>
    </div>
  );
}

export default Follower;
