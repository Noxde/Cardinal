import useAxios from "../../utils/useAxios";

// TODO: Missing lastMessage
function ChatItem({
  username,
  profilePicture,
  lastMessage,
  setMessages,
  onClick,
}) {
  const api = useAxios();

  return (
    <div className="flex p-4 border-b cursor-pointer" onClick={onClick}>
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
