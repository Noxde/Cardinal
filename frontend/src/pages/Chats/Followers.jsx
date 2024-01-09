import Modal from "../../components/Modal";
import Follower from "./Follower";

function Followers({
  followers,
  setShowFollowers,
  setOpenChat,
  chats,
  currentChat,
}) {
  console.log(chats);
  return (
    <Modal label={"Followers"} setIsOpen={setShowFollowers}>
      {followers.map((x) => (
        <Follower
          setOpenChat={setOpenChat}
          setShowFollowers={setShowFollowers}
          username={x.username}
          profilePicture={x.profileimg}
          about={x.about}
          disabled={chats.some(
            (c) =>
              c.chat_user.username === x.username ||
              currentChat?.chat_user.username === x.username
          )}
        />
      ))}
    </Modal>
  );
}

export default Followers;
