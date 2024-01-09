import useAxios from "../../utils/useAxios";

// TODO: Missing lastMessage
function ChatItem({
  username,
  profilePicture,
  lastMessage,
  setMessages,
  setOpenChat,
}) {
  const api = useAxios();

  async function handleClick() {
    setOpenChat();
    const { data } = await api.get(`/getchat/${username}/${1}/100`);

    setMessages(data);
  }

  return (
    <div className="flex p-4 border-b cursor-pointer" onClick={handleClick}>
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

export default ChatItem;
