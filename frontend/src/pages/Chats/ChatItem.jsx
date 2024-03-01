// TODO: Missing lastMessage
function ChatItem({ chat, onClick }) {
  const { chat_user: user, last_message: lastMessage } = chat;
  const { username, profileimg: profilePicture } = user;

  return (
    <div className="flex p-4 border-b cursor-pointer" onClick={onClick}>
      <img
        src={profilePicture}
        width={"40px"}
        className="rounded-full aspect-square object-cover mr-4 self-start"
        alt=""
      />
      <div className="flex flex-col w-full">
        <span className="Gelion-Regular dark-blue">{username}</span>
        <span className="Gelion-Regular text-sm leading-none opacity-70 whitespace-nowrap w-1/2 text-ellipsis overflow-hidden">
          {lastMessage?.content}
        </span>
      </div>
    </div>
  );
}

export default ChatItem;
